"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Box3, Group, Material, Mesh, Vector3 } from "three";
import type { Vec3 } from "./layout";

interface FittedModelProps {
  url: string;
  /** Longest side of the model in scene units */
  size: number;
  /** Lay the model down flat when it is standing upright (chopsticks) */
  layFlat?: boolean;
  /** Optional material applied to every mesh (for example the glossy bowl glaze) */
  material?: Material;
  position?: Vec3;
  rotation?: Vec3;
}

/**
 * Loads a GLB model, scales it so its longest side equals `size`,
 * and centres it so its base sits exactly on y = 0.
 * This makes every asset land at the correct scale regardless of its source file.
 */
export function FittedModel({ url, size, layFlat = false, material, position = [0, 0, 0], rotation = [0, 0, 0] }: FittedModelProps) {
  const gltf = useGLTF(url);

  const fitted = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (material) child.material = material;
      }
    });

    const wrapper = new Group();
    wrapper.add(clone);

    if (layFlat) {
      const probe = new Box3().setFromObject(wrapper);
      const extent = probe.getSize(new Vector3());
      if (extent.y > extent.x && extent.y > extent.z) {
        wrapper.rotation.x = -Math.PI / 2;
      }
    }

    const root = new Group();
    root.add(wrapper);

    const raw = new Box3().setFromObject(root);
    const largest = Math.max(...raw.getSize(new Vector3()).toArray());
    wrapper.scale.setScalar(largest > 0 ? size / largest : 1);

    const scaled = new Box3().setFromObject(root);
    const center = scaled.getCenter(new Vector3());
    wrapper.position.set(-center.x, -scaled.min.y, -center.z);

    return root;
  }, [gltf, size, layFlat, material]);

  return <primitive object={fitted} position={position} rotation={rotation} />;
}
