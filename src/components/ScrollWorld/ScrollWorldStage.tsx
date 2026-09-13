//src/component/scrollworld/scrollworldstage.tsx
"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DigitalCore, ArchitectureCity, ParticleField, IdentityMark } from "./SceneElements";
import type { ScrollTargets } from "@/lib/choreo";

/* ─────────────────────────────────────────────────────────────
   SCROLL WORLD STAGE — The 5 procedural scenes
   ───────────────────────────────────────────────────────────── */

export function ScrollWorldStage({ targets }: { targets: ScrollTargets }) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      {/* Scene 1: Digital Origin */}
      <group position={[0, 0, 0]}>
        <DigitalCore />
      </group>

      {/* Scene 2: Building */}
      <group position={[0, 0, -20]}>
        <ArchitectureCity />
      </group>

      {/* Scene 3: Interface (Abstract Planes) */}
      <group position={[0, 0, -40]}>
         <mesh position={[-2, 0, 0]}><planeGeometry args={[3, 2]} /><meshStandardMaterial color="#C96A2B" transparent opacity={0.6} /></mesh>
         <mesh position={[2, 1, -2]}><planeGeometry args={[2, 3]} /><meshStandardMaterial color="#C96A2B" transparent opacity={0.6} /></mesh>
      </group>

      {/* Scene 4: Digital Experiments */}
      <group position={[0, 0, -60]}>
        <ParticleField />
      </group>

      {/* Scene 5: Identity */}
      <group position={[0, 0, -80]}>
        <IdentityMark />
      </group>
    </group>
  );
}
