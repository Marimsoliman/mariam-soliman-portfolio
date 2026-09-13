//src/components/spinegeometry.tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/* ─────────────────────────────────────────────────────────────
   SCULPTURAL SPINE — a ceramic/bone sculpture, not a medical
   skeleton. 14 substantial vertebrae, each an organic lathe-turned
   body with asymmetric beveled lateral wings, a posterior fin and
   articular nubs — merged into one sculptural mass. No central rod;
   the vertebrae connect through translucent gel discs along an
   elegant S-curve.
   ───────────────────────────────────────────────────────────── */

const VERTEBRAE = 14;
const SPINE_LENGTH = 8.5;
const ACCENT_INDICES = [3, 6, 9, 11];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function spinePoint(t: number, out: THREE.Vector3) {
  const y = (t - 0.5) * SPINE_LENGTH;
  const x = Math.sin(t * Math.PI * 1.6) * 0.3;
  const z = Math.sin(t * Math.PI * 1.25) * 0.75;
  return out.set(x, y, z);
}

function spineTangent(t: number, out: THREE.Vector3) {
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const eps = 0.012;
  spinePoint(Math.max(0, t - eps), a);
  spinePoint(Math.min(1, t + eps), b);
  return out.copy(b.sub(a)).normalize();
}

function tangentFrame(tan: THREE.Vector3): THREE.Quaternion {
  const up = new THREE.Vector3(0, 1, 0);
  const zAxis = new THREE.Vector3().crossVectors(tan, up).normalize();
  const xAxis = new THREE.Vector3().crossVectors(up, zAxis).normalize();
  const m = new THREE.Matrix4().makeBasis(xAxis, up, zAxis);
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

/* ── vertebra body: organic lathe-turned form ───────────────── */

function bodyGeometry(rand: () => number, detail: number): THREE.BufferGeometry {
  const pts = [
    new THREE.Vector3(0, -0.64, 0),
    new THREE.Vector3(0.3, -0.6, 0),
    new THREE.Vector3(0.44, -0.5, 0),
    new THREE.Vector3(0.52, -0.3, 0),
    new THREE.Vector3(0.54, -0.08, 0),
    new THREE.Vector3(0.5, 0.1, 0),
    new THREE.Vector3(0.52, 0.3, 0),
    new THREE.Vector3(0.56, 0.46, 0),
    new THREE.Vector3(0.48, 0.58, 0),
    new THREE.Vector3(0.3, 0.62, 0),
    new THREE.Vector3(0, 0.64, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(pts);
  const profile = curve.getPoints(16).map((p) => {
    const j = (rand() - 0.5) * 0.05;
    return new THREE.Vector2(Math.max(0, p.x + j), p.y);
  });

  const geo = new THREE.LatheGeometry(profile, Math.round(26 * detail));

  /* radial-noise displacement — breaks the perfect rotational symmetry */
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const p1 = rand() * Math.PI * 2;
  const p2 = rand() * Math.PI * 2;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 1e-4) continue;
    const phi = Math.atan2(z, x);
    const d = 0.04 * Math.sin(3 * phi + p1) + 0.02 * Math.sin(5 * phi + p2);
    const s = 1 + d;
    pos.setXYZ(i, x * s, y, z * s);
  }
  geo.computeVertexNormals();
  geo.scale(
    1 + (rand() - 0.5) * 0.1,
    1 + (rand() - 0.5) * 0.12,
    1 + (rand() - 0.5) * 0.1
  );
  return geo;
}

/* ── lateral wing: a beveled organic fin in the horizontal plane ─ */

function wingFin(len: number, rand: () => number, detail: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const base = 0.4;
  const th = 0.09 + rand() * 0.06;
  shape.moveTo(base, -th * 0.55);
  shape.quadraticCurveTo(base + len * 0.5, -th, base + len, 0);
  shape.quadraticCurveTo(base + len * 0.5, th, base, th * 0.55);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelSize: 0.06,
    bevelThickness: 0.05,
    bevelSegments: 2,
    steps: 1,
    curveSegments: Math.round(7 * detail),
  });
  geo.rotateX(-Math.PI / 2); // flatten into the horizontal plane
  geo.translate(0, -0.07, 0); // center on the body midline
  return geo;
}

/* ── posterior fin: stubby spinous process pointing −Z ───────── */

function spinousFin(rand: () => number, detail: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const len = 0.5 + rand() * 0.22;
  shape.moveTo(0, -0.05);
  shape.quadraticCurveTo(-len * 0.5, -0.13, -len, 0);
  shape.quadraticCurveTo(-len * 0.5, 0.13, 0, 0.05);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelSize: 0.05,
    bevelThickness: 0.04,
    bevelSegments: 2,
    steps: 1,
    curveSegments: Math.round(6 * detail),
  });
  geo.rotateX(-Math.PI / 2);
  geo.rotateY(-Math.PI / 2); // fin's long axis → world −Z (posterior)
  geo.translate(0, -0.05, -0.28);
  return geo;
}

function nub(r: number, x: number, y: number, z: number): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(r, 10, 8);
  g.scale(1, 0.85, 0.85);
  g.translate(x, y, z);
  return g;
}

/* ── merged vertebra processes ───────────────────────────────── */

function processesGeometry(rand: () => number, detail: number): THREE.BufferGeometry {
  const longLen = 0.85 + rand() * 0.35;
  const shortLen = longLen * 0.8;

  const right = wingFin(longLen, rand, detail);
  const left = wingFin(shortLen, rand, detail);
  left.scale(-1, 1, 1);

  const parts: THREE.BufferGeometry[] = [right, left, spinousFin(rand, detail)];
  parts.push(
    nub(0.1, 0.44, 0.5, -0.22),
    nub(0.1, -0.44, 0.5, -0.22),
    nub(0.09, 0.44, -0.5, -0.22),
    nub(0.09, -0.44, -0.5, -0.22)
  );

  /* normalise to non-indexed so extrudes (non-indexed) and spheres
     (indexed) merge cleanly */
  const merged = mergeGeometries(
    parts.map((g) => (g.index ? g.toNonIndexed() : g))
  );
  return merged ?? right;
}

/* ── gel discs ──────────────────────────────────────────────── */

function discGeometry(detail: number): THREE.BufferGeometry {
  const geo = new THREE.TorusGeometry(0.5, 0.055, Math.round(9 * detail), Math.round(26 * detail));
  geo.rotateX(Math.PI / 2); // plane XZ, hole along Y (spine axis)
  geo.scale(1.12, 1, 1.12);
  return geo;
}

function buildDiscs(detail: number) {
  const out: { position: THREE.Vector3; quaternion: THREE.Quaternion }[] = [];
  const pos = new THREE.Vector3();
  const tan = new THREE.Vector3();
  for (let i = 0; i < VERTEBRAE - 1; i++) {
    const t = (i + 0.5) / (VERTEBRAE - 1);
    spinePoint(t, pos);
    spineTangent(t, tan);
    out.push({ position: pos.clone(), quaternion: tangentFrame(tan) });
  }
  return out;
}

/* ── materials ──────────────────────────────────────────────── */

const IVORY = {
  color: "#ece0cc",
  roughness: 0.3,
  metalness: 0.02,
  clearcoat: 0.75,
  clearcoatRoughness: 0.28,
  sheen: 0.5,
  sheenColor: "#f6ecd8",
  sheenRoughness: 0.5,
} as const;

const BONE = { color: "#cdbfa8", roughness: 0.5, metalness: 0.03, clearcoat: 0.4 } as const;

const ACCENTS = [
  { color: "#8aa3b8", roughness: 0.45, metalness: 0.25, clearcoat: 0.5 }, // steel-cerulean
  { color: "#b06a4a", roughness: 0.5, metalness: 0.1, clearcoat: 0.45 }, // clay
  { color: "#c8a24d", roughness: 0.32, metalness: 0.35, clearcoat: 0.5 }, // gold
] as const;

const DISC = {
  color: "#cbb28c",
  transparent: true,
  opacity: 0.45,
  roughness: 0.1,
  metalness: 0,
  transmission: 0.55,
  thickness: 0.3,
  ior: 1.35,
  attenuationColor: "#ffdfb8",
  attenuationDistance: 2.5,
  side: THREE.DoubleSide,
  depthWrite: false,
} as const;

interface Segment {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: number;
  bodyGeo: THREE.BufferGeometry;
  processGeo: THREE.BufferGeometry;
  bodyMat: THREE.MeshPhysicalMaterial;
  processMat: THREE.MeshPhysicalMaterial;
}

function buildSpine(detail: number) {
  const rand = mulberry32(7);
  const segments: Segment[] = [];
  const baseBody = new THREE.MeshPhysicalMaterial({ ...IVORY });
  const processMat = new THREE.MeshPhysicalMaterial({ ...BONE });
  const accentMats = ACCENTS.map((a) => new THREE.MeshPhysicalMaterial({ ...a }));

  const pos = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const off = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  let accent = 0;

  for (let i = 0; i < VERTEBRAE; i++) {
    const t = i / (VERTEBRAE - 1);
    spinePoint(t, pos);
    spineTangent(t, tan);

    /* slight perpendicular offset — breaks the "threaded beads" line */
    off.crossVectors(tan, up).normalize().multiplyScalar((rand() - 0.5) * 0.18);
    const position = pos.clone().add(off);

    /* small roll around the tangent for organic variety */
    const quaternion = tangentFrame(tan);
    quaternion.multiply(
      new THREE.Quaternion().setFromAxisAngle(tan.clone(), (rand() - 0.5) * 0.3)
    );

    const env = Math.sin(Math.PI * t);
    const scale = (0.94 + env * 0.18) * (0.96 + rand() * 0.08);

    const isAccent = ACCENT_INDICES.includes(i);
    const bodyMat = isAccent
      ? accentMats[accent++ % accentMats.length]
      : baseBody.clone();
    if (!isAccent) bodyMat.color.offsetHSL(0, 0, (rand() - 0.5) * 0.03);

    segments.push({
      position,
      quaternion,
      scale,
      bodyGeo: bodyGeometry(rand, detail),
      processGeo: processesGeometry(rand, detail),
      bodyMat,
      processMat,
    });
  }

  return { segments };
}

/* ── component ──────────────────────────────────────────────── */

export function SpineGeometry({
  idleMotion = true,
  detail = 1,
}: {
  idleMotion?: boolean;
  detail?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { segments } = useMemo(() => buildSpine(detail), [detail]);
  const discs = useMemo(() => buildDiscs(detail), [detail]);
  const discGeo = useMemo(() => discGeometry(detail), [detail]);
  const discMat = useMemo(() => new THREE.MeshPhysicalMaterial({ ...DISC }), []);

  useFrame(({ clock }) => {
    if (!idleMotion || !groupRef.current) return;
    const t = clock.getElapsedTime();
    /* near-zero breathing — reads as a living sculpture, not constant motion */
    groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.012;
    groupRef.current.rotation.z = Math.sin(t * 0.04) * 0.004;
  });

  return (
    <group ref={groupRef}>
      {segments.map((seg, i) => (
        <group key={i} position={seg.position} quaternion={seg.quaternion} scale={seg.scale}>
          <mesh geometry={seg.bodyGeo} material={seg.bodyMat} />
          <mesh geometry={seg.processGeo} material={seg.processMat} />
        </group>
      ))}
      {discs.map((d, i) => (
        <mesh key={i} geometry={discGeo} material={discMat} position={d.position} quaternion={d.quaternion} />
      ))}
    </group>
  );
}
