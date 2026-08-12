"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getColorFieldTexture } from "@/lib/textures";
import type { FieldSpec, ScrollTargets } from "@/lib/choreo";

/* ─────────────────────────────────────────────────────────────
   COLOR FIELD — soft radial wash behind the scene.
   GSAP-driven opacity via `targets.field[id]`.
   ───────────────────────────────────────────────────────────── */

export function ColorField({
  spec,
  targets,
}: {
  spec: FieldSpec;
  targets: ScrollTargets;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useMemo(() => getColorFieldTexture(spec.color), [spec]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const tgt = targets.field[spec.id];
    const breathe = 1 + Math.sin(t * 0.2) * 0.06;
    groupRef.current.scale.setScalar(spec.scale * breathe);
    groupRef.current.position.x = spec.basePos[0] + Math.sin(t * 0.1) * 0.18;
    if (matRef.current) matRef.current.opacity = tgt.opacity * spec.intensity;
  });

  return (
    <group ref={groupRef} position={spec.basePos}>
      <mesh>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={matRef}
          map={texture}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
