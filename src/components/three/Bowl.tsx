"use client";

import { gsap } from "gsap";
import { useEffect, useMemo, useRef } from "react";
import { CircleGeometry, Color, Group, MeshPhysicalMaterial } from "three";
import { BROTHS, type BrothId, type NoodleId } from "@/lib/menu";
import { BOWL_TARGET_DIAMETER, BROTH_RADIUS, BROTH_Y } from "./layout";
import { Noodles } from "./Noodles";
import { buildBowlGeometry } from "./procedural";

/** The broth surface: a gently rippled disc whose colour eases between broths. */
function Broth({ colour }: { colour: string }) {
  const material = useRef<MeshPhysicalMaterial>(null);

  const geometry = useMemo(() => {
    const disc = new CircleGeometry(BROTH_RADIUS, 96);
    disc.rotateX(-Math.PI / 2);
    const position = disc.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      position.setY(i, Math.sin(x * 4.1) * 0.012 + Math.cos(z * 5.3) * 0.01);
    }
    disc.computeVertexNormals();
    return disc;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const current = material.current;
    if (!current) return;
    const target = new Color(colour);
    gsap.to(current.color, { r: target.r, g: target.g, b: target.b, duration: 0.9, ease: "power2.out", overwrite: true });
    gsap.to(current.emissive, { r: target.r * 0.1, g: target.g * 0.1, b: target.b * 0.1, duration: 0.9, overwrite: true });
  }, [colour]);

  return (
    <mesh geometry={geometry} position={[0, BROTH_Y, 0]} receiveShadow>
      <meshPhysicalMaterial
        ref={material}
        color={colour}
        emissive={colour}
        emissiveIntensity={1}
        roughness={0.07}
        clearcoat={1}
        clearcoatRoughness={0.03}
        metalness={0}
      />
    </mesh>
  );
}

interface BowlProps {
  noodle: NoodleId;
  broth: BrothId;
  /** Increments on every change; a change makes the bowl sway slightly */
  wobbleKey: number;
}

/** The glazed ceramic bowl with broth and noodles. */
export function Bowl({ noodle, broth, wobbleKey }: BowlProps) {
  const group = useRef<Group>(null);
  const firstRun = useRef(true);

  const glaze = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: "#2a211b",
        roughness: 0.42,
        metalness: 0,
        envMapIntensity: 0.35,
        clearcoat: 0.6,
        clearcoatRoughness: 0.18,
        sheen: 0.2,
        sheenColor: new Color("#5a4636"),
      }),
    [],
  );
  const bowlGeometry = useMemo(() => {
    const geometry = buildBowlGeometry();
    // Procedural bowl profile is authored around the same visual scale as the old fitted model.
    geometry.scale(BOWL_TARGET_DIAMETER / 3.12, BOWL_TARGET_DIAMETER / 3.12, BOWL_TARGET_DIAMETER / 3.12);
    return geometry;
  }, []);
  useEffect(() => () => glaze.dispose(), [glaze]);
  useEffect(() => () => bowlGeometry.dispose(), [bowlGeometry]);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const target = group.current;
    if (!target) return;
    gsap.killTweensOf(target.rotation);
    gsap.fromTo(target.rotation, { x: 0.03, z: -0.02 }, { x: 0, z: 0, duration: 1.2, ease: "elastic.out(1, 0.35)" });
  }, [wobbleKey]);

  return (
    <group ref={group}>
      <mesh geometry={bowlGeometry} material={glaze} castShadow receiveShadow />
      <Broth colour={BROTHS[broth].color} />
      <Noodles type={noodle} />
    </group>
  );
}
