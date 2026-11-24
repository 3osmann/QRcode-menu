"use client";

import { gsap } from "gsap";
import { useEffect, useMemo, useRef } from "react";
import { Color, Mesh, MeshPhysicalMaterial } from "three";
import type { NoodleId } from "@/lib/menu";
import { buildNoodleGeometry } from "./procedural";
import { BROTH_Y } from "./layout";

const NOODLE_COLOURS: Record<NoodleId, string> = {
  ramen: "#f1c46a",
  udon: "#fbf1d6",
};

/**
 * The noodle nest. Changing the noodle type rebuilds only this mesh,
 * with a soft "pop" so the change is visible, and leaves toppings untouched.
 */
export function Noodles({ type }: { type: NoodleId }) {
  const mesh = useRef<Mesh>(null);
  const firstRun = useRef(true);

  const geometry = useMemo(() => buildNoodleGeometry(type), [type]);
  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: NOODLE_COLOURS[type],
        roughness: type === "ramen" ? 0.42 : 0.34,
        metalness: 0,
        clearcoat: 0.35,
        clearcoatRoughness: 0.3,
        sheen: 0.35,
        sheenColor: new Color("#fff4d6"),
      }),
    [type],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const target = mesh.current;
    if (!target) return;
    target.scale.set(0.8, 0.55, 0.8);
    gsap.to(target.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: "back.out(1.4)", overwrite: true });
  }, [type]);

  return <mesh ref={mesh} geometry={geometry} material={material} position={[0, BROTH_Y, 0]} castShadow receiveShadow />;
}
