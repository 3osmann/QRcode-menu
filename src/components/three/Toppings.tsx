"use client";

import { gsap } from "gsap";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Color, DoubleSide, Group, MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import { TOPPING_IDS, type ToppingId } from "@/lib/menu";
import { type Placement, TOPPING_DROP, TOPPING_LAYOUT, type Vec3 } from "./layout";
import {
  buildChashuGeometry,
  buildEggHalfGeometry,
  buildGingerGeometry,
  buildMenmaGeometry,
  buildMushroomGeometry,
  buildNarutomakiGeometry,
  buildNoriGeometry,
  buildScallionGeometry,
  createSpiralTexture,
} from "./procedural";

/** How far each topping spins while it falls (radians). Fixed per topping so the motion is repeatable. */
const SPIN: Record<ToppingId, number> = {
  chashu: 0.6,
  egg: -0.9,
  shiitake: 1.1,
  scallion: 0.4,
  nori: -0.3,
  menma: 0.8,
  ginger: -0.7,
  narutomaki: 0.5,
};

/**
 * Animates one topping type in and out.
 * Adding: the topping falls from above along an arc, spins, bounces once and settles.
 * Removing: it lifts, shrinks and disappears.
 */
function Slot({ active, drop, spin, children }: { active: boolean; drop: Vec3; spin: number; children: ReactNode }) {
  const group = useRef<Group>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const target = group.current;
    if (!target) return;
    gsap.killTweensOf([target.position, target.scale, target.rotation]);

    if (!mounted.current) {
      // First render: place the topping immediately, with no animation.
      mounted.current = true;
      target.visible = active;
      target.position.set(0, 0, 0);
      target.scale.setScalar(active ? 1 : 0);
      return;
    }

    if (active) {
      target.visible = true;
      target.position.set(drop[0], drop[1], drop[2]);
      target.scale.setScalar(0.35);
      gsap
        .timeline()
        .to(target.position, { x: 0, y: 0, z: 0, duration: 0.8, ease: "power2.in" })
        .to(target.scale, { x: 1, y: 1, z: 1, duration: 0.55, ease: "back.out(1.6)" }, 0)
        .to(target.rotation, { y: `+=${spin}`, duration: 0.8, ease: "power2.out" }, 0)
        .to(target.position, { y: 0.05, duration: 0.12, ease: "power1.out", yoyo: true, repeat: 1 });
    } else {
      gsap
        .timeline({ onComplete: () => void (target.visible = false) })
        .to(target.position, { y: 1.4, duration: 0.35, ease: "power2.in" }, 0)
        .to(target.scale, { x: 0, y: 0, z: 0, duration: 0.35, ease: "power2.in" }, 0);
    }
  }, [active, drop, spin]);

  return <group ref={group}>{children}</group>;
}

function Placed({ placement, children }: { placement: Placement; children: ReactNode }) {
  return (
    <group position={placement.position} rotation={placement.rotation}>
      {children}
    </group>
  );
}

/** Geometry and materials for procedural toppings. Built once and disposed on unmount. */
function useToppingAssets() {
  const assets = useMemo(
    () => ({
      chashuGeometry: buildChashuGeometry(),
      chashuMaterial: new MeshStandardMaterial({ color: "#8a4028", roughness: 0.65, metalness: 0.02 }),
      eggGeometry: buildEggHalfGeometry(),
      eggWhiteMaterial: new MeshStandardMaterial({ color: "#f4efe6", roughness: 0.35 }),
      eggYolkMaterial: new MeshStandardMaterial({ color: "#f0a43a", roughness: 0.25 }),
      shiitakeGeometry: buildMushroomGeometry(),
      shiitakeMaterial: new MeshStandardMaterial({ color: "#6b4630", roughness: 0.72 }),
      noriGeometry: buildNoriGeometry(),
      noriMaterial: new MeshStandardMaterial({ color: "#131b15", roughness: 0.5, metalness: 0.05, side: DoubleSide }),
      menmaGeometry: buildMenmaGeometry(),
      menmaMaterial: new MeshStandardMaterial({ color: "#c08f42", roughness: 0.55 }),
      gingerGeometry: buildGingerGeometry(),
      gingerMaterial: new MeshPhysicalMaterial({
        color: "#f29fb2",
        roughness: 0.35,
        sheen: 0.5,
        sheenColor: new Color("#ffd2dc"),
        clearcoat: 0.3,
      }),
      scallionGeometry: buildScallionGeometry(),
      scallionMaterial: new MeshStandardMaterial({ color: "#86c25a", roughness: 0.42 }),
      narutomakiGeometry: buildNarutomakiGeometry(),
      narutomakiWhite: new MeshStandardMaterial({ color: "#fbf8f4", roughness: 0.45 }),
      narutomakiSpiral: new MeshStandardMaterial({ map: createSpiralTexture(), roughness: 0.45 }),
    }),
    [],
  );

  useEffect(
    () => () => {
      assets.chashuGeometry.dispose();
      assets.chashuMaterial.dispose();
      assets.eggGeometry.dispose();
      assets.eggWhiteMaterial.dispose();
      assets.eggYolkMaterial.dispose();
      assets.shiitakeGeometry.dispose();
      assets.shiitakeMaterial.dispose();
      assets.noriGeometry.dispose();
      assets.noriMaterial.dispose();
      assets.menmaGeometry.dispose();
      assets.menmaMaterial.dispose();
      assets.gingerGeometry.dispose();
      assets.gingerMaterial.dispose();
      assets.scallionGeometry.dispose();
      assets.scallionMaterial.dispose();
      assets.narutomakiGeometry.dispose();
      assets.narutomakiWhite.dispose();
      assets.narutomakiSpiral.dispose();
      assets.narutomakiSpiral.map?.dispose();
    },
    [assets],
  );

  return assets;
}

type ToppingAssets = ReturnType<typeof useToppingAssets>;

function renderTopping(id: ToppingId, assets: ToppingAssets): ReactNode {
  switch (id) {
    case "chashu":
      return <mesh geometry={assets.chashuGeometry} material={assets.chashuMaterial} castShadow receiveShadow />;
    case "egg":
      return (
        <group>
          <mesh geometry={assets.eggGeometry} material={assets.eggWhiteMaterial} castShadow receiveShadow />
          <mesh position={[0, 0.08, 0.02]} castShadow>
            <sphereGeometry args={[0.14, 18, 14]} />
            <primitive object={assets.eggYolkMaterial} attach="material" />
          </mesh>
        </group>
      );
    case "shiitake":
      return <mesh geometry={assets.shiitakeGeometry} material={assets.shiitakeMaterial} castShadow receiveShadow />;
    case "scallion":
      return <mesh geometry={assets.scallionGeometry} material={assets.scallionMaterial} castShadow />;
    case "nori":
      return <mesh geometry={assets.noriGeometry} material={assets.noriMaterial} castShadow receiveShadow />;
    case "menma":
      return <mesh geometry={assets.menmaGeometry} material={assets.menmaMaterial} castShadow />;
    case "ginger":
      return <mesh geometry={assets.gingerGeometry} material={assets.gingerMaterial} castShadow />;
    case "narutomaki":
      return (
        <mesh
          geometry={assets.narutomakiGeometry}
          material={[assets.narutomakiWhite, assets.narutomakiSpiral, assets.narutomakiWhite]}
          position={[0, 0.055, 0]}
          castShadow
        />
      );
  }
}

/** All toppings. Each one is always mounted; visibility and animation follow the selection. */
export function Toppings({ selected }: { selected: ToppingId[] }) {
  const assets = useToppingAssets();
  return (
    <group>
      {TOPPING_IDS.map((id) => (
        <Slot key={id} active={selected.includes(id)} drop={TOPPING_DROP[id]} spin={SPIN[id]}>
          {TOPPING_LAYOUT[id].map((placement, index) => (
            <Placed key={index} placement={placement}>
              {renderTopping(id, assets)}
            </Placed>
          ))}
        </Slot>
      ))}
    </group>
  );
}
