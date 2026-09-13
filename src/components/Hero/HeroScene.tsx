// احذف الفنكشنز دي من HeroScene.tsx
// PortalWorld - مش مستخدمة
// updateOverlay - فيها early return فمش بتعمل حاجة
// getMeshScreenBounds - بتتكال من updateOverlay بس

// الملف المنظف:
"use client";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { Hero3D, type Hero3DRefs } from "./Hero3D";
import { HeroParticles } from "./HeroParticles";

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
  const cameraDirection = useRef(new THREE.Vector3());
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
    const progress = THREE.MathUtils.clamp(transitionProgressRef.current, 0, 1);
    if (!initialCameraPosition.current) {
      initialCameraPosition.current = camera.position.clone();
      initialCameraFov.current = camera instanceof THREE.PerspectiveCamera ? camera.fov : 34;
    }

    const screenContent = hero3dRef.current?.screenContent;
    if (screenContent) {
      screenContent.updateWorldMatrix(true, false);
      screenContent.getWorldPosition(screenCenter.current);
      screenNormal.current.set(0, 0, 1).transformDirection(screenContent.matrixWorld);

      // Keep the approach on the actual front-facing side of the existing screen.
      if (screenNormal.current.dot(initialCameraPosition.current.clone().sub(screenCenter.current)) < 0) {
        screenNormal.current.negate();
      }

      screenUp.current.set(0, 1, 0).transformDirection(screenContent.matrixWorld);

      // A staged, screen-normal dolly: all waypoints live on the monitor's
      // center line, so the approach never introduces a sideways skew or bank.
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

      // Look straight through the screen as the camera crosses it. Keeping the
      // target on this same axis avoids the previous diagonal, warped flight.
      cameraTarget.current.copy(screenCenter.current).addScaledVector(
        screenNormal.current,
        -THREE.MathUtils.smoothstep(progress, 0.7, 1) * 8
      );

      camera.position.lerp(cameraPosition.current, reducedMotion ? 1 : 1 - Math.exp(-delta * 12));
      cameraUp.current.copy(screenUp.current);
      camera.up.lerp(cameraUp.current, reducedMotion ? 1 : 1 - Math.exp(-delta * 8)).normalize();
      camera.lookAt(cameraTarget.current);
    }

    const fov = getCameraFov(
      progress,
      initialCameraFov.current ?? 34
    );
    if (camera instanceof THREE.PerspectiveCamera && Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

  });

  return null;
}

function getCameraFov(progress: number, initialFov: number) {
  // Keep the original lens essentially intact; scale comes from the physical
  // dolly, not a wide-angle FOV change that would distort the monitor.
  return THREE.MathUtils.lerp(initialFov, initialFov - 0.35, THREE.MathUtils.smoothstep(progress, 0.5, 0.8));
}

function updateOverlay({
  progress,
  camera,
  gl,
  screenContent,
  overlay,
  cameraDirection,
}: {
  progress: number;
  camera: THREE.Camera;
  gl: THREE.WebGLRenderer;
  screenContent: THREE.Mesh | null | undefined;
  overlay: HTMLDivElement | null;
  cameraDirection: THREE.Vector3;
}) {
  // The 3D About panel is the visual destination. This DOM copy remains in the
  // document for semantic content, but never replaces the scene with a flat UI.
  hideOverlay(overlay);
  return;

  if (!overlay || !screenContent || progress < 0.93) {
    hideOverlay(overlay);
    return;
  }

  const canvas = gl.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) {
    hideOverlay(overlay);
    return;
  }

  const rect = canvas.getBoundingClientRect();
  let left = 0;
  let top = 0;
  let right = width;
  let bottom = height;

  // The interface is attached to the projected screen until the camera crosses it.
  // It then remains continuous at fullscreen instead of becoming a separate scene.
  if (progress < 0.93) {
    const screenCenter = screenContent.getWorldPosition(new THREE.Vector3());
    camera.getWorldDirection(cameraDirection);
    if (screenCenter.sub(camera.position).dot(cameraDirection) <= 0) {
      hideOverlay(overlay);
      return;
    }

    const bounds = getMeshScreenBounds(screenContent, camera, width, height);
    left = THREE.MathUtils.clamp(bounds.minX, 0, width);
    top = THREE.MathUtils.clamp(bounds.minY, 0, height);
    right = THREE.MathUtils.clamp(bounds.maxX, 0, width);
    bottom = THREE.MathUtils.clamp(bounds.maxY, 0, height);
    if (right <= left || bottom <= top) {
      hideOverlay(overlay);
      return;
    }
  }

  // Keep the semantic DOM support secondary: the in-world glass panel remains
  // the visual About destination instead of being covered by a flat section.
  const opacity = THREE.MathUtils.smoothstep(progress, 0.95, 0.995) * 0.16;
  overlay.style.left = `${rect.left + left}px`;
  overlay.style.top = `${rect.top + top}px`;
  overlay.style.width = `${right - left}px`;
  overlay.style.height = `${bottom - top}px`;
  overlay.style.opacity = opacity.toString();
  overlay.style.pointerEvents = "none";
}

function hideOverlay(overlay: HTMLDivElement | null) {
  if (!overlay) return;
  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "none";
}

function getMeshScreenBounds(
  mesh: THREE.Mesh,
  camera: THREE.Camera,
  canvasWidth: number,
  canvasHeight: number
) {
  mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox;
  if (!box) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

  mesh.updateWorldMatrix(true, false);
  const corners = [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  ];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  corners.forEach((corner) => {
    corner.applyMatrix4(mesh.matrixWorld).project(camera);
    const x = (corner.x * 0.5 + 0.5) * canvasWidth;
    const y = (-corner.y * 0.5 + 0.5) * canvasHeight;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  return { minX, minY, maxX, maxY };
}

function PortalWorld({
  reducedMotion,
  transitionProgressRef,
  hero3dRef,
}: {
  reducedMotion: boolean;
  transitionProgressRef: React.RefObject<number>;
  hero3dRef: React.RefObject<Hero3DRefs | null>;
}) {
  const world = useRef<THREE.Group>(null);
  const stream = useRef<THREE.Points>(null);
  const panelMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const points = useMemo(() => {
    const count = 720;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const warm = new THREE.Color("#f5f1ea");
    const red = new THREE.Color("#dc2626");
    const orange = new THREE.Color("#ea580c");

    for (let index = 0; index < count; index += 1) {
      const depth = -1.5 - Math.random() * 96;
      positions[index * 3] = (Math.random() - 0.5) * (depth < -42 ? 34 : 12);
      positions[index * 3 + 1] = (Math.random() - 0.5) * (depth < -42 ? 17 : 6);
      positions[index * 3 + 2] = depth;
      const color = index % 7 === 0 ? red : index % 3 === 0 ? orange : warm;
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, []);

  useFrame(({ clock }, delta) => {
    const computer = hero3dRef.current?.computerGroup;
    const progress = transitionProgressRef.current;
    if (world.current && computer) {
      // This is deliberately a scene-graph reparent, not an approximate matrix
      // copy. The portal and the existing screen therefore use identical local
      // coordinates throughout the flight.
      if (world.current.parent !== computer) computer.add(world.current);
      world.current.position.set(0, 0, 0);
      world.current.rotation.set(0, 0, 0);
      world.current.scale.set(1, 1, 1);
      world.current.visible = progress > 0.46;
    }
    if (stream.current) {
      stream.current.position.z = -((clock.getElapsedTime() * (reducedMotion ? 0.08 : 0.42)) % 3.5);
    }
    if (panelMaterial.current) {
      panelMaterial.current.opacity = THREE.MathUtils.smoothstep(progress, 0.86, 0.96) * 0.8;
    }
  });

  return (
    <group ref={world} visible={false}>
      <pointLight position={[0, 1, -7]} intensity={25} distance={14} color="#dc2626" />
      <pointLight position={[-4, -1, -20]} intensity={18} distance={12} color="#ea580c" />

      <points ref={stream} position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[points.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.055} vertexColors transparent opacity={0.82} depthWrite={false} sizeAttenuation />
      </points>

      {/* Thin architecture gives the camera close, mid, and far depth cues. */}
      {[-4, -11, -22, -36, -53, -71, -88].map((depth, index) => (
        <group key={depth} position={[0, 0, depth]} rotation={[0, index % 2 ? 0.22 : -0.16, 0]}>
          <mesh position={[-3.8 + (index % 2) * 1.1, 0.7, 0]}>
            <boxGeometry args={[0.08, 5.6 - (index % 3), 0.08]} />
            <meshStandardMaterial color="#7d1712" emissive="#dc2626" emissiveIntensity={0.8} metalness={0.85} roughness={0.28} />
          </mesh>
          <mesh position={[3.6 - (index % 3) * 0.5, -0.5, -0.4]}>
            <boxGeometry args={[0.08, 4.2 + (index % 2), 0.08]} />
            <meshStandardMaterial color="#5d160e" emissive="#ea580c" emissiveIntensity={0.55} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[index % 2 ? 2.6 : -2.5, 1.55, -0.35]} rotation={[0, index % 2 ? -0.35 : 0.32, 0]}>
            <planeGeometry args={[1.6 + (index % 2) * 0.5, 2.3]} />
            <meshPhysicalMaterial color="#240d0a" emissive="#5b160d" emissiveIntensity={0.58} transparent opacity={0.42} roughness={0.16} metalness={0.55} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      <group position={[-1.8, 0.8, -88]} rotation={[0, -0.13, 0]}>
        <mesh>
          <planeGeometry args={[9.2, 5.8]} />
          <meshStandardMaterial ref={panelMaterial} color="#1a0907" emissive="#7d1712" emissiveIntensity={1.1} transparent opacity={0} metalness={0.52} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
        <lineSegments position={[0, 0, 0.02]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(9.2, 5.8)]} />
          <lineBasicMaterial color="#ea580c" transparent opacity={0.8} />
        </lineSegments>
        <Text position={[-3.8, 1.75, 0.05]} fontSize={0.19} anchorX="left" color="#ea580c" letterSpacing={0.14}>ABOUT / 01</Text>
        <Text position={[-3.8, 0.75, 0.05]} fontSize={0.78} maxWidth={6.8} lineHeight={0.88} anchorX="left" color="#f5f1ea">MARIAM{`\n`}SOLIMAN</Text>
        <Text position={[-3.8, -1.55, 0.05]} fontSize={0.26} maxWidth={6.6} lineHeight={1.45} anchorX="left" color="#c9c1ba">FULL-STACK DEVELOPER{`\n`}BUILDING EXPRESSIVE DIGITAL EXPERIENCES.</Text>
      </group>
    </group>
  );
}
