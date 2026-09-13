"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { Hero3D, type Hero3DRefs } from "./Hero3D";
import { HeroParticles } from "./HeroParticles";

export type SceneTransition = {
  progress: number;
};

export function HeroScene({
  reducedMotion,
  transitionProgressRef,
  hero3dRef,
}: {
  reducedMotion: boolean;
  transitionProgressRef: React.RefObject<number>;
  hero3dRef: React.RefObject<Hero3DRefs | null>;
}) {
  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 22, 118]} />
      <ambientLight intensity={0.35} color="#fff4e8" />
      <directionalLight position={[4, 5, 5]} intensity={3.2} color="#fff1df" />
      <pointLight position={[-4, -2, 3]} intensity={18} distance={13} color="#9f2018" />
      <Float
        speed={reducedMotion ? 0 : 0.55}
        rotationIntensity={0.06}
        floatIntensity={reducedMotion ? 0 : 0.18}
      >
        <Hero3D
          ref={hero3dRef}
          reducedMotion={reducedMotion}
          transitionProgressRef={transitionProgressRef}
        />
      </Float>
      <AboutTransitionController
        reducedMotion={reducedMotion}
        transitionProgressRef={transitionProgressRef}
        hero3dRef={hero3dRef}
      />
      <HeroParticles
        reducedMotion={reducedMotion}
        transition={{ progress: 0 }}
      />
      <Environment resolution={128}>
        <Lightformer
          intensity={3.2}
          position={[2, 4, 4]}
          scale={[5, 3, 1]}
          color="#fff6e9"
        />
        <Lightformer
          intensity={2}
          position={[-4, 0, 2]}
          scale={[2, 5, 1]}
          color="#c84324"
        />
      </Environment>
    </>
  );
}

function AboutTransitionController({
  reducedMotion,
  transitionProgressRef,
  hero3dRef,
}: {
  reducedMotion: boolean;
  transitionProgressRef: React.RefObject<number>;
  hero3dRef: React.RefObject<Hero3DRefs | null>;
}) {
  const { camera } = useThree();
  const initialCameraPosition = useRef<THREE.Vector3 | null>(null);
  const initialCameraFov = useRef<number | null>(null);
  const cameraTarget = useRef(new THREE.Vector3());
  const cameraPosition = useRef(new THREE.Vector3());
  const screenCenter = useRef(new THREE.Vector3());
  const screenNormal = useRef(new THREE.Vector3());
  const screenUp = useRef(new THREE.Vector3());
  const approachPosition = useRef(new THREE.Vector3());
  const closePosition = useRef(new THREE.Vector3());
  const alignedPosition = useRef(new THREE.Vector3());
  const screenEdgePosition = useRef(new THREE.Vector3());
  const insidePosition = useRef(new THREE.Vector3());
  const cameraUp = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const progress = THREE.MathUtils.clamp(transitionProgressRef.current ?? 0, 0, 1);
    if (!initialCameraPosition.current) {
      initialCameraPosition.current = camera.position.clone();
      initialCameraFov.current = camera instanceof THREE.PerspectiveCamera ? camera.fov : 34;
    }

    const screenContent = hero3dRef.current?.screenContent;
    if (screenContent) {
      screenContent.updateWorldMatrix(true, false);
      screenContent.getWorldPosition(screenCenter.current);
      screenNormal.current.set(0, 0, 1).transformDirection(screenContent.matrixWorld);

      if (screenNormal.current.dot(initialCameraPosition.current.clone().sub(screenCenter.current)) < 0) {
        screenNormal.current.negate();
      }

      screenUp.current.set(0, 1, 0).transformDirection(screenContent.matrixWorld);

      approachPosition.current.copy(screenCenter.current).addScaledVector(screenNormal.current, 5.7);
      closePosition.current.copy(screenCenter.current).addScaledVector(screenNormal.current, 2.8);
      alignedPosition.current.copy(screenCenter.current).addScaledVector(screenNormal.current, 0.95);
      screenEdgePosition.current.copy(screenCenter.current).addScaledVector(screenNormal.current, 0.14);
      insidePosition.current.copy(screenCenter.current).addScaledVector(screenNormal.current, -7.5);

      if (progress <= 0.5) {
        cameraPosition.current.lerpVectors(
          initialCameraPosition.current,
          approachPosition.current,
          THREE.MathUtils.smoothstep(progress, 0.2, 0.5)
        );
      } else if (progress <= 0.7) {
        cameraPosition.current.lerpVectors(
          approachPosition.current,
          closePosition.current,
          THREE.MathUtils.smoothstep(progress, 0.5, 0.7)
        );
      } else if (progress <= 0.8) {
        cameraPosition.current.lerpVectors(
          closePosition.current,
          alignedPosition.current,
          THREE.MathUtils.smoothstep(progress, 0.7, 0.8)
        );
      } else if (progress <= 0.9) {
        cameraPosition.current.lerpVectors(
          alignedPosition.current,
          screenEdgePosition.current,
          THREE.MathUtils.smoothstep(progress, 0.8, 0.9)
        );
      } else {
        cameraPosition.current.lerpVectors(
          screenEdgePosition.current,
          insidePosition.current,
          THREE.MathUtils.smoothstep(progress, 0.9, 1)
        );
      }

      cameraTarget.current.copy(screenCenter.current).addScaledVector(
        screenNormal.current,
        -THREE.MathUtils.smoothstep(progress, 0.7, 1) * 8
      );

      camera.position.lerp(cameraPosition.current, reducedMotion ? 1 : 1 - Math.exp(-delta * 12));
      cameraUp.current.copy(screenUp.current);
      camera.up.lerp(cameraUp.current, reducedMotion ? 1 : 1 - Math.exp(-delta * 8)).normalize();
      camera.lookAt(cameraTarget.current);
    }

    const fov = getCameraFov(progress, initialCameraFov.current ?? 34);
    if (camera instanceof THREE.PerspectiveCamera && Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function getCameraFov(progress: number, initialFov: number) {
  return THREE.MathUtils.lerp(initialFov, initialFov - 0.35, THREE.MathUtils.smoothstep(progress, 0.5, 0.8));
}