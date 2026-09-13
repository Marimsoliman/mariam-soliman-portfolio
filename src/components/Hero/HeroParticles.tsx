//src/component/hero/heroparticles.tsx
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneTransition } from "./HeroScene";

export function HeroParticles({ reducedMotion, transition }: { reducedMotion: boolean; transition: SceneTransition }) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const positions = useMemo(() => { const values = new Float32Array(110 * 3); for (let i = 0; i < values.length; i += 3) { values[i] = (Math.random() - 0.2) * 8; values[i + 1] = (Math.random() - 0.5) * 5; values[i + 2] = (Math.random() - 0.5) * 3 - 1; } return values; }, []);
  useFrame(({ clock }) => { if (points.current && !reducedMotion) points.current.rotation.y = clock.getElapsedTime() * 0.018; if (material.current) material.current.opacity = .66 * (1 - transition.progress); });
  return <points ref={points}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial ref={material} color="#c63b25" size={0.028} transparent opacity={0.66} sizeAttenuation /></points>;
}
