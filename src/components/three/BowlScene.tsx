"use client";

import { ContactShadows } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  Object3D,
  PMREMGenerator,
  RepeatWrapping,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { BrothId, NoodleId, StepId, ToppingId } from "@/lib/menu";
import { Bowl } from "./Bowl";
import { CameraRig } from "./CameraRig";
import { CAMERA_PRESETS } from "./layout";
import { buildChopstickGeometry, createGlowTexture, createWoodTexture, mulberry32 } from "./procedural";
import { Toppings } from "./Toppings";

export interface BowlSceneProps {
  step: StepId;
  noodle: NoodleId;
  broth: BrothId;
  toppings: ToppingId[];
  tick: number;
  autoRotate: boolean;
}

/** Studio-style reflections generated inside the browser, so no external HDRI download is needed. */
function LocalEnvironment() {
  const gl = useThree((state) => state.gl) as WebGLRenderer;
  const scene = useThree((state) => state.scene) as Scene;

  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const environment = generator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    return () => {
      scene.environment = null;
      environment.dispose();
      generator.dispose();
    };
  }, [gl, scene]);

  return null;
}

/** Warm practical lights: a lantern key light, an amber rim light and a soft fill. */
function Lights() {
  const target = useMemo(() => new Object3D(), []);
  return (
    <>
      <primitive object={target} position={[0, 0.6, 0]} />
      <ambientLight intensity={0.18} color="#ffcf9e" />
      <spotLight
        position={[-3.6, 7.5, 4.2]}
        angle={0.42}
        penumbra={0.95}
        intensity={140}
        color="#ffc07a"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-radius={6}
        target={target}
      />
      <pointLight position={[3.4, 2.6, -2.6]} intensity={22} color="#ff9440" distance={16} decay={2} />
      <pointLight position={[-3.2, 1.6, 3.4]} intensity={5} color="#ffd6a0" distance={12} decay={2} />
    </>
  );
}

/** Soft out-of-focus lights in the background, placed deterministically. */
function Bokeh() {
  const { sprites, glow } = useMemo(() => {
    const rnd = mulberry32(2026);
    const texture = createGlowTexture("rgba(255,190,110,0.9)", "rgba(255,150,60,0)");
    const items = Array.from({ length: 14 }, () => ({
      position: [(rnd() - 0.5) * 22, 0.8 + rnd() * 5, -4.5 - rnd() * 4] as [number, number, number],
      scale: 0.6 + rnd() * 1.3,
      opacity: 0.25 + rnd() * 0.45,
    }));
    return { sprites: items, glow: texture };
  }, []);

  useEffect(() => () => glow.dispose(), [glow]);

  return (
    <>
      {sprites.map((sprite, index) => (
        <sprite key={index} position={sprite.position} scale={[sprite.scale, sprite.scale, 1]}>
          <spriteMaterial map={glow} transparent opacity={sprite.opacity} blending={AdditiveBlending} depthWrite={false} />
        </sprite>
      ))}
    </>
  );
}

/** Dark restaurant wall with a warm lantern glow behind the bowl. */
function Backdrop() {
  const glow = useMemo(() => createGlowTexture("rgba(255,160,80,0.55)", "rgba(10,6,4,0)"), []);
  useEffect(() => () => glow.dispose(), [glow]);
  return (
    <group>
      <mesh position={[0, 2.5, -7]}>
        <planeGeometry args={[34, 20]} />
        <meshBasicMaterial map={glow} transparent depthWrite={false} />
      </mesh>
      <Bokeh />
    </group>
  );
}

/** Dark wooden table, using a procedural plank texture so the scene has no missing asset dependency. */
function Table() {
  const wood = useMemo(() => {
    const texture = createWoodTexture();
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(2.2, 2.2);
    return texture;
  }, []);

  useEffect(() => () => wood.dispose(), [wood]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial map={wood} color="#9a6a42" roughness={0.5} metalness={0} />
    </mesh>
  );
}

/** Chopsticks resting on the table beside the bowl. */
function TableProps() {
  const geometry = useMemo(() => buildChopstickGeometry(), []);
  const material = useMemo(
    () => ({
      color: "#7a4d2d",
      roughness: 0.55,
      metalness: 0.02,
    }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <>
      <mesh geometry={geometry} position={[2.7, 0.04, 1.7]} rotation={[0, 0.62, 0]} castShadow receiveShadow>
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh geometry={geometry} position={[2.55, 0.06, 1.9]} rotation={[0, 0.6, 0]} castShadow receiveShadow>
        <meshStandardMaterial {...material} />
      </mesh>
    </>
  );
}

export default function BowlScene({ step, noodle, broth, toppings, tick, autoRotate }: BowlSceneProps) {
  const start = CAMERA_PRESETS.noodles;
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: start.position, fov: 34, near: 0.1, far: 80 }}
        gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.08 }}
      >
        <color attach="background" args={["#0a0604"]} />
        <fog attach="fog" args={["#0a0604", 11, 24]} />
        <LocalEnvironment />
        <Lights />
        <Backdrop />
        <Table />
        <Suspense fallback={null}>
          <Bowl noodle={noodle} broth={broth} wobbleKey={tick} />
          <Toppings selected={toppings} />
          <TableProps />
        </Suspense>
        <ContactShadows position={[0, 0.002, 0]} opacity={0.75} scale={9} blur={2.6} far={3.2} color="#000000" />
        <CameraRig step={step} autoRotate={autoRotate} />
      </Canvas>
    </div>
  );
}
