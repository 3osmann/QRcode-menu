// Shared 3D layout constants. Units: 1 unit ≈ 6 cm on the table.
// The bowl is fitted to BOWL_TARGET_DIAMETER, so these values follow directly from it.
import type { StepId, ToppingId } from "@/lib/menu";

export type Vec3 = [number, number, number];

export const BOWL_TARGET_DIAMETER = 3.2;
/** Outer rim radius of the bowl */
export const BOWL_RADIUS = 1.6;
/** Height of the rim above the table */
export const BOWL_HEIGHT = 1.18;
/** Height of the broth surface inside the bowl */
export const BROTH_Y = 0.92;
/** Radius of the broth disc, kept inside the inner wall */
export const BROTH_RADIUS = 1.22;

export interface Placement {
  position: Vec3;
  rotation: Vec3;
}

/** Where each topping rests in the bowl. Several entries mean several pieces. */
export const TOPPING_LAYOUT: Record<ToppingId, Placement[]> = {
  chashu: [
    { position: [-0.5, 1.1, 0.35], rotation: [0.12, 0.7, 0.12] },
    { position: [0.32, 1.14, 0.5], rotation: [0.08, -0.5, -0.1] },
  ],
  egg: [
    { position: [0.55, 1.1, -0.25], rotation: [0, 0.4, 0] },
    { position: [0.95, 1.08, 0.25], rotation: [0, -0.8, 0] },
  ],
  shiitake: [
    { position: [-0.95, 1.04, -0.42], rotation: [0, 1, 0] },
    { position: [-0.35, 1.08, -0.7], rotation: [0, 2.2, 0.2] },
  ],
  scallion: [{ position: [0, 1.2, 0.05], rotation: [0, 0, 0] }],
  nori: [{ position: [0, 1.28, -1.0], rotation: [-0.45, 0, 0] }],
  menma: [{ position: [-0.38, 1.06, -0.1], rotation: [0, 0.3, 0] }],
  ginger: [{ position: [1.02, 1.04, -0.6], rotation: [0, 0, 0] }],
  narutomaki: [
    { position: [-1.1, 1.08, 0.5], rotation: [0, 0.9, 0.25] },
    { position: [0.72, 1.1, 0.95], rotation: [0.3, -0.5, 0.15] },
  ],
};

/** Starting offset (above and to the side) from which each topping drops into the bowl. */
export const TOPPING_DROP: Record<ToppingId, Vec3> = {
  chashu: [-1.6, 3.6, 0.8],
  egg: [1.8, 3.8, -0.4],
  shiitake: [-1.8, 3.4, -0.6],
  scallion: [0, 4.2, 0],
  nori: [0, 3.6, -2.4],
  menma: [-1.2, 3.8, 0.2],
  ginger: [1.8, 3.4, -1.0],
  narutomaki: [-1.7, 3.2, 1.1],
};

export interface CameraPreset {
  position: Vec3;
  target: Vec3;
}

/** Each step has its own camera angle. The camera glides between them. */
export const CAMERA_PRESETS: Record<StepId, CameraPreset> = {
  noodles: { position: [0, 2.9, 5.6], target: [0, 0.75, 0] },
  toppings: { position: [0, 6.6, 2.4], target: [0, 0.9, 0] },
  broth: { position: [3.6, 2.3, 3.4], target: [0, 0.8, 0] },
  serve: { position: [-2.0, 3.6, 5.2], target: [0, 0.7, 0] },
};
