"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { SpineGeometry } from "./SpineGeometry";
import { ColorField } from "./SceneElements";
import { FIELD_SPECS } from "@/lib/choreo";
import type { ScrollTargets } from "@/lib/choreo";

/* ─────────────────────────────────────────────────────────────
   SCENE — the 3D spine + atmosphere. Camera and rig are driven
   every frame by the GSAP-animated `targets` state object.
   ───────────────────────────────────────────────────────────── */

const pointer = { current: { x: 0, y: 0 } };
let pointerWired = false;

export function wirePointer() {
  if (pointerWired || typeof window === "undefined") return;
  pointerWired = true;
  window.addEventListener("mousemove", (e) => {
    pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
  });
}

function CameraRig({
  targets,
  parallax,
}: {
  targets: ScrollTargets;
  parallax: boolean;
}) {
  const { camera } = useThree();
  const currentLook = useRef(new THREE.Vector3(0, 0.4, 0));
  const goal = useRef(new THREE.Vector3());

  useFrame(() => {
    const { x, y, z } = targets.camera;
    camera.position.set(
      x + (parallax ? pointer.current.x * 0.35 : 0),
      y + (parallax ? pointer.current.y * 0.2 : 0),
      z
    );
    /* damped lookAt — absorbs GSAP frame jitter for cinematic smoothness */
    goal.current.set(targets.lookAt.x, targets.lookAt.y, targets.lookAt.z);
    currentLook.current.lerp(goal.current, 0.12);
    camera.lookAt(currentLook.current);
  });
  return null;
}

function SpineRig({
  targets,
  idleMotion,
  detail,
}: {
  targets: ScrollTargets;
  idleMotion: boolean;
  detail: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.x = targets.rig.x;
    ref.current.rotation.y = targets.rig.rotY;
    ref.current.scale.setScalar(targets.rig.scale);
  });
  return (
    <group ref={ref}>
      <SpineGeometry idleMotion={idleMotion} detail={detail} />
    </group>
  );
}

export function SpineStage({
  targets,
  idleMotion,
  parallax,
  detail = 1,
}: {
  targets: ScrollTargets;
  idleMotion: boolean;
  parallax: boolean;
  detail?: number;
}) {
  return (
    <>
      {/* transparent background — the body's dark wash + hero poster
          show through, so the spine can sit IN FRONT of the name */}
      <fog attach="fog" args={["#0d0a08", 22, 55]} />

      <CameraRig targets={targets} parallax={parallax} />

      {/* cinematic studio lighting — soft rim separates the ceramic */}
      <ambientLight intensity={0.35} color="#efe6d8" />
      <directionalLight position={[4, 8, 8]} intensity={3} color="#ffe9cf" />
      <directionalLight position={[-7, 2, 5]} intensity={1.1} color="#b9d0e8" />
      <directionalLight position={[-6, 6, -6]} intensity={2.5} color="#dbe6f2" />
      <directionalLight position={[6, 3, -7]} intensity={1.6} color="#f4cfae" />
      <pointLight position={[0, -4, 6]} intensity={12} distance={24} decay={2} color="#d8c2ac" />

      <Environment resolution={256}>
        <Lightformer intensity={2.5} color="#fff4e4" position={[0, 4, 4]} scale={[9, 5, 1]} />
        <Lightformer intensity={1.4} color="#dbe6f2" position={[-6, 0, 2]} scale={[2, 9, 1]} />
        <Lightformer intensity={1.2} color="#f2cfae" position={[0, -4, 2]} scale={[10, 0.4, 1]} />
      </Environment>

      {FIELD_SPECS.map((f) => (
        <ColorField key={f.id} spec={f} targets={targets} />
      ))}

      <SpineRig targets={targets} idleMotion={idleMotion} detail={detail} />
    </>
  );
}
