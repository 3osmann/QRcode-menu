// Procedural 3D geometry for ingredients that are not available as CC0 GLB
// models (noodles, nori, menma, pickled ginger, narutomaki, scallions).
// Everything here is real geometry built from triangles, lit by the same
// physically based materials as the GLB models.
import {
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  Euler,
  LatheGeometry,
  Matrix4,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { NoodleId } from "@/lib/menu";

/** Small seeded random generator so every build of the bowl looks identical. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface NoodleSpec {
  seed: number;
  strands: number;
  radius: number;
  crimp: number;
  crimpFrequency: number;
  spread: number;
  tubularSegments: number;
  radialSegments: number;
}

const NOODLE_SPECS: Record<NoodleId, NoodleSpec> = {
  // Thin, wavy wheat noodles with a strong crimp.
  ramen: {
    seed: 11,
    strands: 34,
    radius: 0.023,
    crimp: 0.04,
    crimpFrequency: 0.9,
    spread: 1.05,
    tubularSegments: 84,
    radialSegments: 6,
  },
  // Thick, almost straight udon with a gentle wave.
  udon: {
    seed: 23,
    strands: 15,
    radius: 0.05,
    crimp: 0.012,
    crimpFrequency: 0.35,
    spread: 1.0,
    tubularSegments: 84,
    radialSegments: 8,
  },
};

/** Builds a nest of noodle strands in local space (y = 0 is the broth surface). */
export function buildNoodleGeometry(type: NoodleId): BufferGeometry {
  const spec = NOODLE_SPECS[type];
  const rnd = mulberry32(spec.seed);
  const up = new Vector3(0, 1, 0);
  const parts: BufferGeometry[] = [];

  for (let strand = 0; strand < spec.strands; strand++) {
    const controls: Vector3[] = [];
    let x = (rnd() * 2 - 1) * spec.spread * 0.8;
    let z = (rnd() * 2 - 1) * spec.spread * 0.8;
    const count = 6;
    for (let k = 0; k < count; k++) {
      // Noodles rest close to the broth and rise slightly in the middle of the nest.
      const y = 0.03 + rnd() * 0.15;
      controls.push(new Vector3(x, y, z));
      const angle = rnd() * Math.PI * 2;
      const step = 0.35 + rnd() * 0.45;
      x += Math.cos(angle) * step;
      z += Math.sin(angle) * step;
      const radius = Math.hypot(x, z);
      if (radius > spec.spread) {
        x *= spec.spread / radius;
        z *= spec.spread / radius;
      }
    }

    const base = new CatmullRomCurve3(controls, false, "catmullrom", 0.5);
    const samples = base.getSpacedPoints(spec.tubularSegments);
    const crimped = samples.map((point, k) => {
      const tangent = base.getTangentAt(k / spec.tubularSegments);
      const side = new Vector3().crossVectors(tangent, up);
      if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
      side.normalize();
      const wave = Math.sin(k * spec.crimpFrequency + strand) * spec.crimp;
      return new Vector3(
        point.x + side.x * wave,
        point.y + Math.cos(k * spec.crimpFrequency * 1.7 + strand) * spec.crimp * 0.4,
        point.z + side.z * wave,
      );
    });

    const radius = spec.radius * (0.9 + rnd() * 0.2);
    parts.push(
      new TubeGeometry(new CatmullRomCurve3(crimped), spec.tubularSegments, radius, spec.radialSegments, false),
    );
  }

  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  if (!merged) throw new Error("Could not merge noodle geometry");
  merged.computeBoundingSphere();
  return merged;
}

/** A toasted nori sheet with gentle crinkles. Built on a plane, facing +Z. */
export function buildNoriGeometry(): BufferGeometry {
  const geometry = new PlaneGeometry(1.05, 0.74, 28, 18);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const crinkle = Math.sin(x * 7.0) * 0.03 + Math.cos(y * 9.0) * 0.025 + Math.sin((x + y) * 15) * 0.008;
    position.setZ(i, crinkle);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Seven fermented bamboo strips (menma) lying in a loose pile. */
export function buildMenmaGeometry(): BufferGeometry {
  const rnd = mulberry32(5);
  const parts: BufferGeometry[] = [];
  for (let i = 0; i < 7; i++) {
    const geometry = new CapsuleGeometry(0.07, 0.36, 4, 10);
    geometry.rotateZ(Math.PI / 2);
    const quaternion = new Quaternion().setFromEuler(new Euler(rnd() * 0.4, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.4));
    const matrix = new Matrix4().compose(
      new Vector3((rnd() - 0.5) * 0.4, (rnd() - 0.5) * 0.05 + 0.05, (rnd() - 0.5) * 0.3),
      quaternion,
      new Vector3(1, 1, 0.55),
    );
    geometry.applyMatrix4(matrix);
    parts.push(geometry);
  }
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  if (!merged) throw new Error("Could not merge menma geometry");
  return merged;
}

/** Thin pink pickled ginger slices, slightly curled. */
export function buildGingerGeometry(): BufferGeometry {
  const rnd = mulberry32(31);
  const parts: BufferGeometry[] = [];
  for (let i = 0; i < 16; i++) {
    const geometry = new SphereGeometry(0.13, 14, 10);
    const quaternion = new Quaternion().setFromEuler(new Euler(rnd() * 0.8 - 0.4, rnd() * Math.PI * 2, rnd() * 0.8 - 0.4));
    const angle = rnd() * Math.PI * 2;
    const distance = Math.sqrt(rnd()) * 0.28;
    const matrix = new Matrix4().compose(
      new Vector3(Math.cos(angle) * distance, 0.02 + rnd() * 0.03, Math.sin(angle) * distance),
      quaternion,
      new Vector3(1, 0.9, 0.16 + rnd() * 0.05),
    );
    geometry.applyMatrix4(matrix);
    parts.push(geometry);
  }
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  if (!merged) throw new Error("Could not merge ginger geometry");
  return merged;
}

/** Hand-cut scallion rings scattered in a disc. */
export function buildScallionGeometry(): BufferGeometry {
  const rnd = mulberry32(77);
  const parts: BufferGeometry[] = [];
  for (let i = 0; i < 70; i++) {
    const geometry = new TorusGeometry(0.05, 0.014, 6, 14);
    geometry.rotateX(Math.PI / 2);
    const angle = rnd() * Math.PI * 2;
    const distance = Math.sqrt(rnd()) * 0.5;
    const matrix = new Matrix4().compose(
      new Vector3(Math.cos(angle) * distance, rnd() * 0.04, Math.sin(angle) * distance),
      new Quaternion().setFromEuler(new Euler(rnd() * 0.5, rnd() * Math.PI * 2, rnd() * 0.5)),
      new Vector3(1, 1, 1),
    );
    geometry.applyMatrix4(matrix);
    parts.push(geometry);
  }
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  if (!merged) throw new Error("Could not merge scallion geometry");
  return merged;
}

/** Half-round narutomaki slice. Groups: 0 = curved side, 1 = top cap, 2 = bottom cap. */
export function buildNarutomakiGeometry(): BufferGeometry {
  return new CylinderGeometry(0.42, 0.42, 0.11, 56, 1, false, 0, Math.PI);
}

/** Pink spiral printed on a white fish cake, drawn on a canvas. */
export function createSpiralTexture(): CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  ctx.fillStyle = "#f8f3ef";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#e8557a";
  ctx.lineWidth = 22;
  ctx.lineCap = "round";
  ctx.beginPath();
  const turns = 4.5;
  const total = Math.PI * 2 * turns;
  for (let a = 0; a <= total; a += 0.04) {
    const r = 18 + (a / total) * 225;
    const x = size / 2 + Math.cos(a) * r;
    const y = size / 2 + Math.sin(a) * r;
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Soft radial gradient used for the lantern glow and bokeh sprites. */
export function createGlowTexture(inner: string, outer: string): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(1, outer);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Dark wooden planks used for the table surface when no photo texture is bundled. */
export function createWoodTexture(): CanvasTexture {
  const width = 1024;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  ctx.fillStyle = "#3a2415";
  ctx.fillRect(0, 0, width, height);

  const plankHeight = height / 8;
  for (let i = 0; i < 8; i++) {
    const y = i * plankHeight;
    const base = 42 + (i % 2) * 6;
    ctx.fillStyle = `rgb(${base + 10}, ${base - 2}, ${base - 10})`;
    ctx.fillRect(0, y, width, plankHeight);

    for (let g = 0; g < 180; g++) {
      const gx = Math.random() * width;
      const gy = y + Math.random() * plankHeight;
      const gw = 40 + Math.random() * 180;
      const alpha = 0.02 + Math.random() * 0.05;
      ctx.strokeStyle = `rgba(${20 + Math.random() * 30}, ${10 + Math.random() * 20}, 5, ${alpha})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.bezierCurveTo(gx + gw * 0.3, gy + (Math.random() - 0.5) * 6, gx + gw * 0.7, gy + (Math.random() - 0.5) * 6, gx + gw, gy + (Math.random() - 0.5) * 4);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.fillRect(0, y + plankHeight - 3, width, 3);
    ctx.fillStyle = "rgba(120, 80, 45, 0.08)";
    ctx.fillRect(0, y, width, 2);
  }

  const sheen = ctx.createLinearGradient(0, 0, width, height);
  sheen.addColorStop(0, "rgba(255, 210, 160, 0.05)");
  sheen.addColorStop(0.5, "rgba(255, 210, 160, 0)");
  sheen.addColorStop(1, "rgba(0, 0, 0, 0.12)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, width, height);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Simple ceramic bowl fallback when the GLB asset is unavailable. */
export function buildBowlGeometry(): BufferGeometry {
  const points: Vector2[] = [];
  const profile: Array<[number, number]> = [
    [0.0, 0.02],
    [0.55, 0.04],
    [0.85, 0.1],
    [1.08, 0.24],
    [1.28, 0.46],
    [1.42, 0.74],
    [1.52, 1.02],
    [1.56, 1.2],
    [1.5, 1.24],
    [1.42, 1.18],
    [1.3, 0.92],
    [1.14, 0.62],
    [0.92, 0.36],
    [0.62, 0.2],
    [0.25, 0.12],
    [0.0, 0.1],
  ];
  for (const [x, y] of profile) points.push(new Vector2(x, y));
  const geometry = new LatheGeometry(points, 96);
  geometry.computeVertexNormals();
  return geometry;
}

/** Simple chopstick fallback when GLB assets are unavailable. */
export function buildChopstickGeometry(): BufferGeometry {
  const geometry = new CylinderGeometry(0.018, 0.008, 2.4, 10, 1, false);
  geometry.rotateZ(Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

/** Simple chashu slice fallback. */
export function buildChashuGeometry(): BufferGeometry {
  const shape = new CylinderGeometry(0.42, 0.46, 0.08, 28);
  shape.scale(1.25, 1, 0.85);
  shape.computeVertexNormals();
  return shape;
}

/** Simple egg-half fallback. */
export function buildEggHalfGeometry(): BufferGeometry {
  const geometry = new SphereGeometry(0.34, 24, 18, 0, Math.PI);
  geometry.scale(1, 0.72, 1);
  geometry.rotateX(Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

/** Simple shiitake cap fallback. */
export function buildMushroomGeometry(): BufferGeometry {
  const cap = new SphereGeometry(0.28, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  cap.scale(1, 0.55, 1);
  const stem = new CylinderGeometry(0.07, 0.09, 0.18, 12);
  stem.translate(0, -0.08, 0);
  const merged = mergeGeometries([cap, stem], false);
  cap.dispose();
  stem.dispose();
  if (!merged) throw new Error("Could not merge mushroom geometry");
  merged.computeVertexNormals();
  return merged;
}
