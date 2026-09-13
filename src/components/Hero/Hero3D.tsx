"use client";
import { useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const lerp = (current: number, target: number, amount: number) =>
  current + (target - current) * amount;

export interface Hero3DRefs {
  computerGroup: THREE.Group | null;
  screenPlane: THREE.Mesh | null;
  screenContent: THREE.Mesh | null;
  topBar: THREE.Mesh | null;
  trafficLights: THREE.Mesh[];
  interfaceLines: THREE.Group | null;
  accentPanels: THREE.Group[];
  bottomBar: THREE.Mesh | null;
}

interface Hero3DProps {
  reducedMotion: boolean;
  transitionProgress?: number;
  transitionProgressRef?: React.RefObject<number>;
}

const InterfaceLines = forwardRef<THREE.Group>(function InterfaceLines(_, ref) {
  const groupRef = useRef<THREE.Group>(null);
  useImperativeHandle(ref, () => groupRef.current as THREE.Group);

  const rows = useMemo(
    () =>
      [1.28, 1.04, 0.76, 0.25, 0.01, -0.23, -0.68].map((y, index) => ({
        y,
        width: [1.58, 0.95, 1.24, 0.65, 1.46, 0.82, 1.12][index],
        x: [-0.88, -0.34, -0.66, -0.95, -0.28, -0.88, -0.56][index],
      })),
    []
  );

  return (
    <group ref={groupRef} position={[-0.72, -0.18, 0.19]}>
      {rows.map((row, index) => (
        <mesh
          key={index}
          position={[row.x + row.width / 2, row.y, 0]}
          userData={{ originalY: row.y, originalWidth: row.width, index }}
        >
          <planeGeometry args={[row.width, index === 3 ? 0.05 : 0.025]} />
          <meshBasicMaterial
            color={index === 3 ? "#ea580c" : "#f5f1ea"}
            transparent
            opacity={index === 3 ? 0.9 : 0.38}
          />
        </mesh>
      ))}
    </group>
  );
});

const AccentPanel = forwardRef<
  THREE.Group,
  {
    position: [number, number, number];
    size: [number, number];
    opacity?: number;
  }
>(function AccentPanel({ position, size, opacity = 1 }, ref) {
  const groupRef = useRef<THREE.Group>(null);
  useImperativeHandle(ref, () => groupRef.current as THREE.Group);

  return (
    <group
      ref={groupRef}
      position={position}
      userData={{ originalPosition: position, originalSize: size }}
    >
      <mesh>
        <planeGeometry args={size} />
        <meshBasicMaterial
          color="#dc2626"
          transparent
          opacity={opacity * 0.28}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(size[0], size[1])]} />
        <lineBasicMaterial color="#ea580c" transparent opacity={opacity} />
      </lineSegments>
    </group>
  );
});

export const Hero3D = forwardRef<Hero3DRefs, Hero3DProps>(function Hero3D(
  { reducedMotion, transitionProgress = 0, transitionProgressRef },
  ref
) {
  const group = useRef<THREE.Group>(null);
  const screenPlaneRef = useRef<THREE.Mesh>(null);
  const screenContentRef = useRef<THREE.Mesh>(null);
  const topBarRef = useRef<THREE.Mesh>(null);
  const trafficLightRefs = useRef<THREE.Mesh[]>([]);
  const interfaceLinesRef = useRef<THREE.Group>(null);
  const accentPanelRefs = useRef<THREE.Group[]>([]);
  const bottomBarRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame(({ clock }) => {
    if (!group.current) return;

    const progress = transitionProgressRef?.current ?? transitionProgress;
    const interaction = 1 - THREE.MathUtils.smoothstep(progress, 0.18, 0.62);
    const idle = reducedMotion
      ? 0
      : Math.sin(clock.getElapsedTime() * 0.32) * 0.035 * interaction;
    const frontal = THREE.MathUtils.smoothstep(progress, 0.45, 0.7);
    const targetRotationY = lerp(-0.38, 0, frontal);
    const targetRotationX = lerp(0.08, 0, frontal);

    group.current.rotation.y = lerp(
      group.current.rotation.y,
      pointer.x * 0.18 * interaction + idle + targetRotationY,
      0.04
    );
    group.current.rotation.x = lerp(
      group.current.rotation.x,
      -pointer.y * 0.1 * interaction + targetRotationX,
      0.04
    );
    group.current.position.x = lerp(
      group.current.position.x,
      pointer.x * 0.13 * interaction + 0.52,
      0.038
    );
    group.current.position.y = lerp(
      group.current.position.y,
      pointer.y * 0.08 * interaction + 0.15,
      0.038
    );

    const screenMaterial = screenContentRef.current
      ?.material as THREE.MeshPhysicalMaterial | undefined;
    if (screenMaterial) {
      const crossing = THREE.MathUtils.smoothstep(progress, 0.5, 0.66);
      screenMaterial.transparent = crossing > 0.001;
      screenMaterial.opacity = 1 - crossing * 0.96;
      screenMaterial.depthWrite = crossing < 0.98;
      screenMaterial.emissiveIntensity = 0.22 + crossing * 1.35;
    }
  });

  useImperativeHandle(ref, () => ({
    computerGroup: group.current,
    screenPlane: screenPlaneRef.current,
    screenContent: screenContentRef.current,
    topBar: topBarRef.current,
    trafficLights: trafficLightRefs.current,
    interfaceLines: interfaceLinesRef.current,
    accentPanels: accentPanelRefs.current,
    bottomBar: bottomBarRef.current,
  }));

  return (
    <group ref={group} rotation={[0.08, -0.38, 0]} position={[0.52, 0.15, 0]}>
      {/* مجسم الشاشة */}
      <mesh
        ref={screenPlaneRef}
        position={[0, 0, -0.08]}
        userData={{ name: "screenPlane" }}
      >
        <boxGeometry args={[4.5, 3.02, 0.18]} />
        <meshPhysicalMaterial
          color="#0a0a0a"
          roughness={0.25}
          metalness={0.75}
          clearcoat={0.9}
          clearcoatRoughness={0.15}
        />
      </mesh>

      <mesh
        ref={screenContentRef}
        position={[0, 0, 0.025]}
        userData={{ name: "screenContent" }}
      >
        <planeGeometry args={[4.25, 2.77]} />
        <meshPhysicalMaterial
          color="#10100f"
          roughness={0.4}
          metalness={0.28}
          emissive="#260907"
          emissiveIntensity={0.22}
        />
      </mesh>

      <mesh
        ref={topBarRef}
        position={[0, 1.245, 0.055]}
        userData={{ name: "topBar" }}
      >
        <planeGeometry args={[4.25, 0.28]} />
        <meshBasicMaterial color="#151210" />
      </mesh>

      <mesh
        ref={(el) => {
          if (el) trafficLightRefs.current[0] = el;
        }}
        position={[-1.91, 1.245, 0.08]}
        userData={{ name: "trafficLightClose" }}
      >
        <circleGeometry args={[0.048, 18]} />
        <meshBasicMaterial color="#dc2626" />
      </mesh>
      <mesh
        ref={(el) => {
          if (el) trafficLightRefs.current[1] = el;
        }}
        position={[-1.74, 1.245, 0.08]}
        userData={{ name: "trafficLightMinimize" }}
      >
        <circleGeometry args={[0.048, 18]} />
        <meshBasicMaterial color="#ea580c" />
      </mesh>
      <mesh
        ref={(el) => {
          if (el) trafficLightRefs.current[2] = el;
        }}
        position={[-1.57, 1.245, 0.08]}
        userData={{ name: "trafficLightMaximize" }}
      >
        <circleGeometry args={[0.048, 18]} />
        <meshBasicMaterial color="#f5f1ea" transparent opacity={0.5} />
      </mesh>

      <InterfaceLines ref={interfaceLinesRef} />

      <AccentPanel
        ref={(el) => {
          if (el) accentPanelRefs.current[0] = el;
        }}
        position={[1.18, 0.32, 0.16]}
        size={[1.34, 1.55]}
      />
      <AccentPanel
        ref={(el) => {
          if (el) accentPanelRefs.current[1] = el;
        }}
        position={[-0.28, -0.84, 0.15]}
        size={[2.68, 0.52]}
        opacity={0.45}
      />
      <AccentPanel
        ref={(el) => {
          if (el) accentPanelRefs.current[2] = el;
        }}
        position={[1.15, 0.82, -0.52]}
        size={[2.05, 1.28]}
        opacity={0.34}
      />
      <AccentPanel
        ref={(el) => {
          if (el) accentPanelRefs.current[3] = el;
        }}
        position={[-1.28, -0.16, 0.52]}
        size={[1.12, 1.84]}
        opacity={0.58}
      />

      {/* ممرات البوابة العميقة */}
      {[-12, -28, -48, -70].map((depth, index) => (
        <group
          key={depth}
          position={[0, 0, depth]}
          rotation={[0, index % 2 ? 0.14 : -0.11, 0]}
        >
          <mesh position={[-4.4, 0.4, 0]}>
            <boxGeometry args={[0.1, 7.2, 0.1]} />
            <meshStandardMaterial
              color="#58120d"
              emissive="#dc2626"
              emissiveIntensity={1.1}
              metalness={0.85}
              roughness={0.22}
            />
          </mesh>
          <mesh position={[4.4, -0.4, -0.45]}>
            <boxGeometry args={[0.1, 6.1, 0.1]} />
            <meshStandardMaterial
              color="#5d160e"
              emissive="#ea580c"
              emissiveIntensity={0.85}
              metalness={0.8}
              roughness={0.25}
            />
          </mesh>
          <mesh
            position={[index % 2 ? 2.6 : -2.6, 1.3, -0.25]}
            rotation={[0, index % 2 ? -0.28 : 0.28, 0]}
          >
            <planeGeometry args={[2.35, 3.4]} />
            <meshPhysicalMaterial
              color="#2b0c09"
              emissive="#7d1712"
              emissiveIntensity={0.68}
              transparent
              opacity={0.52}
              metalness={0.6}
              roughness={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* بوابة نصوص الـ 3D العميقة - تم ضبط إحداثيات النصوص لتنزل لأقصى قاع فضاء الـ 3D */}
      <group position={[-1.8, 0.8, -88]} rotation={[0, -0.13, 0]}>
        <mesh>
          <planeGeometry args={[9.2, 5.8]} />
          <meshStandardMaterial
            color="#1a0907"
            emissive="#7d1712"
            emissiveIntensity={1.25}
            metalness={0.5}
            roughness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        <lineSegments position={[0, 0, 0.02]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(9.2, 5.8)]} />
          <lineBasicMaterial color="#ea580c" transparent opacity={0.9} />
        </lineSegments>

        {/* وسم علوي */}
        <Text
          position={[-4.1, 2.2, 0.05]}
          fontSize={0.18}
          anchorX="left"
          color="#ea580c"
          letterSpacing={0.14}
        >
          ABOUT // 01
        </Text>

        {/* إنزال النص لأقصى قعر اللوحة الافتراضية (Y = -3.2) */}
        <Text
          position={[-4.1, -3.2, 0.05]}
          fontSize={0.72}
          maxWidth={4.8}
          lineHeight={0.88}
          anchorX="left"
          color="#f5f1ea"
        >
          CREATIVE{"\n"}DEVELOPER
        </Text>

        {/* إنزال الوصف لأقصى قعر اللوحة الافتراضية اليمين (Y = -3.4) */}
        <Text
          position={[4.1, -3.4, 0.05]}
          fontSize={0.2}
          maxWidth={4.0}
          lineHeight={1.45}
          anchorX="right"
          textAlign="right"
          color="#c9c1ba"
        >
          BUILDING BEAUTIFUL DIGITAL EXPERIENCES{"\n"}WITH CODE AND CREATIVITY.
        </Text>
      </group>

      {/* قاعدة اللابتوب */}
      <mesh
        ref={bottomBarRef}
        position={[0, -1.78, -0.08]}
        rotation={[0.08, 0, 0]}
        userData={{ name: "bottomBar" }}
      >
        <boxGeometry args={[2.65, 0.06, 0.8]} />
        <meshPhysicalMaterial
          color="#170b09"
          roughness={0.24}
          metalness={0.7}
        />
      </mesh>
      <mesh position={[0.05, -1.72, 0.24]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.014, 10, 30]} />
        <meshBasicMaterial color="#ea580c" transparent opacity={0.8} />
      </mesh>
    </group>
  );
});