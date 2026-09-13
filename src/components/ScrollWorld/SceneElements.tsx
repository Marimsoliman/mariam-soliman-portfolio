//src/component/scrollworld/senceelements.tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Float, Text, Edges } from "@react-three/drei";
import { pulseVertex, pulseFragment, particleVertex, particleFragment } from "./Shaders";

/* ─────────────────────────────────────────────────────────────
   SCENE ELEMENTS — Procedural geometry for Scroll World
   ───────────────────────────────────────────────────────────── */

export function DigitalCore() {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#F5EDE0") },
      uTime: { value: 0 },
      uIntensity: { value: 0.8 },
      uPulseSpeed: { value: 1.0 },
      uPulseAmount: { value: 0.2 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    uniforms.uTime.value = clock.getElapsedTime();
    mesh.current.rotation.y += 0.005;
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1, 32]} />
      <shaderMaterial
        vertexShader={pulseVertex}
        fragmentShader={pulseFragment}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

export function ArchitectureCity() {
  const count = 50;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const tempObject = new THREE.Object3D();

  const data = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 10,
        ],
        scale: Math.random() * 2 + 0.5,
      });
    }
    return temp;
  }, []);

  useFrame(() => {
    if (!mesh.current) return;
    data.forEach((d, i) => {
      tempObject.position.set(d.position[0], d.position[1], d.position[2]);
      tempObject.scale.setScalar(d.scale);
      tempObject.updateMatrix();
      mesh.current!.setMatrixAt(i, tempObject.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4A0E1A" roughness={0.3} metalness={0.1} />
      <Edges color="#F5EDE0" linewidth={1} />
    </instancedMesh>
  );
}

export function ParticleField() {
  const count = 5000;
  const points = useRef<THREE.Points>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uSize: { value: 2 },
      uSpeed: { value: 0.1 },
      uFlowDirection: { value: new THREE.Vector3(0, 1, 0) },
      uGlowColor: { value: new THREE.Color("#E01E37") },
    }),
    []
  );

  const attributes = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const color = new Float32Array(count * 3);
    const phase = new Float32Array(count);

    const colors = [new THREE.Color("#F5EDE0"), new THREE.Color("#E01E37"), new THREE.Color("#C96A2B")];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      size[i] = Math.random();
      const col = colors[Math.floor(Math.random() * colors.length)];
      color[i * 3] = col.r;
      color[i * 3 + 1] = col.g;
      color[i * 3 + 2] = col.b;
      phase[i] = Math.random() * Math.PI * 2;
    }
    return { pos, size, color, phase };
  }, []);

  useFrame(({ clock }) => {
    if (!points.current) return;
    uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attributes.pos, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[attributes.size, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[attributes.color, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[attributes.phase, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function IdentityMark() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text
        font="/fonts/Fraunces.woff2"
        fontSize={1.5}
        color="#F5EDE0"
        anchorX="center"
        anchorY="middle"
      >
        MARIAM SOLIMAN
      </Text>
    </Float>
  );
}
