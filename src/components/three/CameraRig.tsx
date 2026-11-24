"use client";

import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { type ComponentRef, useEffect, useRef } from "react";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import type { StepId } from "@/lib/menu";
import { CAMERA_PRESETS } from "./layout";

/** Events dispatched by the on-screen buttons (outside the canvas). */
export const CAMERA_EVENTS = {
  zoom: "ember:zoom",
  reset: "ember:reset-camera",
} as const;

/** Half the visible width the bowl needs on screen, in scene units. */
const BOWL_HALF_WIDTH = 1.95;

type Controls = ComponentRef<typeof OrbitControls>;

/**
 * Orbit controls plus smooth camera glides.
 * Each step has its own camera angle; the camera eases between them with GSAP.
 */
export function CameraRig({ step, autoRotate }: { step: StepId; autoRotate: boolean }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const controls = useRef<Controls>(null);
  const stepRef = useRef<StepId>(step);
  const firstRun = useRef(true);

  useEffect(() => {
    const rig = controls.current;
    if (!rig) return;

    const flyTo = (target: StepId, animate: boolean) => {
      const preset = CAMERA_PRESETS[target];
      const lookAt = new Vector3(...preset.target);
      const offset = new Vector3(...preset.position).sub(lookAt);

      // Keep the bowl in frame on narrow (portrait) screens by moving the camera back if needed.
      const halfFov = MathUtils.degToRad(camera.fov / 2);
      const minimumDistance = BOWL_HALF_WIDTH / (Math.tan(halfFov) * camera.aspect);
      if (offset.length() < minimumDistance) offset.setLength(minimumDistance);

      const destination = lookAt.clone().add(offset);
      gsap.killTweensOf([camera.position, rig.target]);

      if (!animate) {
        camera.position.copy(destination);
        rig.target.copy(lookAt);
        rig.update();
        return;
      }

      gsap
        .timeline({ onUpdate: () => rig.update() })
        .to(camera.position, { x: destination.x, y: destination.y, z: destination.z, duration: 1.6, ease: "power3.inOut" }, 0)
        .to(rig.target, { x: lookAt.x, y: lookAt.y, z: lookAt.z, duration: 1.6, ease: "power3.inOut" }, 0);
    };

    stepRef.current = step;
    flyTo(step, !firstRun.current);
    firstRun.current = false;

    const onZoom = (event: Event) => {
      const factor = (event as CustomEvent<number>).detail;
      const offset = camera.position.clone().sub(rig.target);
      const next = MathUtils.clamp(offset.length() * factor, rig.minDistance, rig.maxDistance);
      offset.setLength(next);
      const destination = rig.target.clone().add(offset);
      gsap.killTweensOf(camera.position);
      gsap.to(camera.position, {
        x: destination.x,
        y: destination.y,
        z: destination.z,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: () => rig.update(),
      });
    };
    const onReset = () => flyTo(stepRef.current, true);

    window.addEventListener(CAMERA_EVENTS.zoom, onZoom);
    window.addEventListener(CAMERA_EVENTS.reset, onReset);
    return () => {
      window.removeEventListener(CAMERA_EVENTS.zoom, onZoom);
      window.removeEventListener(CAMERA_EVENTS.reset, onReset);
    };
  }, [step, camera]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.07}
      enablePan={false}
      minDistance={3.2}
      maxDistance={11}
      minPolarAngle={0.12}
      maxPolarAngle={1.52}
      autoRotate={autoRotate}
      autoRotateSpeed={0.7}
    />
  );
}
