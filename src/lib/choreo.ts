"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────
   CHOREOGRAPHY — the single scroll-driven art direction.
   One scrubbed master timeline drives BOTH the 3D scene
   (camera / rig / color fields, read in useFrame) AND the DOM
   content overlay (real typography, notes, project images).
   ───────────────────────────────────────────────────────────── */

export interface Mode {
  isDesktop: boolean;
  reducedMotion: boolean;
}

export function getMode(): Mode {
  if (typeof window === "undefined") {
    return { isDesktop: true, reducedMotion: false };
  }
  return {
    isDesktop: window.matchMedia("(min-width: 768px)").matches,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

export const isStaticMode = (m: Mode) => !m.isDesktop || m.reducedMotion;

/* ── 3D targets ──────────────────────────────────────────── */

export interface ScrollTargets {
  camera: { x: number; y: number; z: number };
  lookAt: { x: number; y: number; z: number };
  rig: { x: number; rotY: number; scale: number };
  field: Record<string, { opacity: number }>;
}

export interface FieldSpec {
  id: string;
  basePos: [number, number, number];
  color: string;
  scale: number;
  intensity: number;
}

/* camera / rig keyframes per chapter (starting values — tuned in-browser) */
const POSES = {
  hero: {
    cam: { x: -0.8, y: 2.2, z: 16 },
    look: { x: 0.9, y: 0.6, z: 0 },
    rig: { x: 0.6, rotY: 0.02, scale: 0.9 },
  },
  about: {
    cam: { x: 1.4, y: 1.0, z: 12 },
    look: { x: 1.0, y: 1.2, z: 0 },
    rig: { x: 1.5, rotY: 0.18, scale: 1.0 },
  },
  work: {
    cam: { x: -1.6, y: -0.4, z: 11 },
    look: { x: 1.6, y: -0.2, z: 0 },
    rig: { x: -1.2, rotY: -0.16, scale: 1.05 },
  },
  experiments: {
    cam: { x: 2.6, y: -1.4, z: 10.5 },
    look: { x: -1.6, y: -0.6, z: 0 },
    rig: { x: -0.9, rotY: 0.3, scale: 1.0 },
  },
  contact: {
    cam: { x: 0.4, y: 0.3, z: 15 },
    look: { x: 0.3, y: 0, z: 0 },
    rig: { x: 0.2, rotY: 0.02, scale: 0.82 },
  },
  static: {
    cam: { x: 0, y: 3.2, z: 18 },
    look: { x: 0, y: 1.2, z: 0 },
    rig: { x: 0, rotY: 0, scale: 0.5 },
  },
} as const;

export const FIELD_SPECS: FieldSpec[] = [
  { id: "about", basePos: [-3, 1.2, -7], color: "#3d5a73", scale: 17, intensity: 0.85 },
  { id: "work", basePos: [4, -0.4, -7], color: "#b06a3a", scale: 16, intensity: 0.7 },
  { id: "experiments", basePos: [-1, -2.2, -7], color: "#c9a93f", scale: 18, intensity: 0.6 },
  { id: "contact", basePos: [0, -0.4, -7], color: "#8a5a6a", scale: 19, intensity: 0.75 },
];

export function createTargets(mode: Mode): ScrollTargets {
  const hero = POSES.hero;
  const s = POSES.static;
  return {
    camera: { ...(mode.isDesktop ? hero.cam : s.cam) },
    lookAt: { ...(mode.isDesktop ? hero.look : s.look) },
    rig: { ...(mode.isDesktop ? hero.rig : s.rig) },
    field: Object.fromEntries(FIELD_SPECS.map((f) => [f.id, { opacity: 0 }])),
  };
}

/* ── chapters ────────────────────────────────────────────── */

export const CHAPTERS = [
  { id: "hero", from: 0.0, to: 0.13, center: 0.065 },
  { id: "about", from: 0.13, to: 0.33, center: 0.23 },
  { id: "work", from: 0.33, to: 0.63, center: 0.48 },
  { id: "experiments", from: 0.63, to: 0.81, center: 0.72 },
  { id: "contact", from: 0.81, to: 1.0, center: 0.905 },
] as const;

export function chapterAt(p: number): string {
  let cur = CHAPTERS[0].id;
  for (const c of CHAPTERS) if (p >= c.from) cur = c.id;
  return cur;
}

export function chapterScrollY(id: string): number {
  const ch = CHAPTERS.find((c) => c.id === id) ?? CHAPTERS[0];
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(ch.center * max, max);
}

/* ── DOM element ids (content overlay registry) ──────────── */

export const EL = {
  hero: "el-hero",
  heroPoster: "el-hero-poster",
  heroRoles: "el-hero-roles",
  heroMeta: "el-hero-meta",
  scrollHint: "el-scroll-hint",
  about: "el-about",
  aboutConnector: "el-about-connector",
  workEyebrow: "el-work-eyebrow",
  workStage: "el-work-stage",
  expType: "el-exp-type",
  expPlate: "el-exp-plate",
  expPlate2: "el-exp-plate-2",
  contact: "el-contact",
  contactLinks: "el-contact-links",
} as const;

export const SLIDE_IDS = Array.from({ length: 4 }, (_, i) => `el-slide-${i}`);
export const SLIDE_META_IDS = Array.from({ length: 4 }, (_, i) => `el-slide-meta-${i}`);

/* ── master timeline ─────────────────────────────────────── */

export interface MasterContext {
  targets: ScrollTargets;
  dom: Record<string, HTMLElement | null>;
}

export interface MasterOptions {
  dom?: boolean;
  poses?: boolean;
  initial?: "hero" | "static";
}

type El = HTMLElement | null | undefined;

export function buildMasterTimeline(ctx: MasterContext, opts: MasterOptions = {}) {
  const dom = opts.dom !== false;
  const poses = opts.poses !== false;
  const { targets } = ctx;
  const E = (id: string): El => ctx.dom[id];
  const initial = POSES[opts.initial ?? "hero"];

  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5,
    },
  });

  /* ── 3D: initial pose ── */
  tl.set(targets.camera, { ...initial.cam }, 0);
  tl.set(targets.lookAt, { ...initial.look }, 0);
  tl.set(targets.rig, { ...initial.rig }, 0);

  /* mobile: static spine — no per-chapter camera journey */
  if (!poses) return tl;

  /* helper to hide a DOM element at the start (autoAlpha also sets
     visibility, removing hidden content from the tab/a11y order) */
  const hide = (el: El, vars: gsap.TweenVars = {}) => {
    if (el) tl.set(el, { autoAlpha: 0, scale: 0.9, filter: "blur(6px)", ...vars }, 0);
  };
  /* show = "arrive from depth" */
  const show = (el: El, at: number, vars: gsap.TweenVars = {}) => {
    if (el)
      tl.to(el, { autoAlpha: 1, scale: 1, xPercent: 0, yPercent: 0, rotate: 0, filter: "none", ease: "power3.out", ...vars }, at);
  };
  /* exit away from the composition */
  const exit = (el: El, at: number, vars: gsap.TweenVars = {}) => {
    if (el)
      tl.to(el, { autoAlpha: 0, scale: 1.06, filter: "blur(4px)", ease: "power2.in", ...vars }, at);
  };

  if (dom) {
    /* hero is the resting state — visible at load (poster centered
       via gsap xPercent/yPercent so the figure can cover it) */
    tl.set(E(EL.hero), { autoAlpha: 1, xPercent: 0, yPercent: 0, scale: 1, filter: "none" }, 0);
    tl.set(E(EL.heroPoster), { autoAlpha: 1, xPercent: -50, yPercent: -50, scale: 1, filter: "none" }, 0);
    tl.set(E(EL.scrollHint), { autoAlpha: 1 }, 0);
    tl.set(E(EL.aboutConnector), { autoAlpha: 0, scaleX: 0, transformOrigin: "left center" }, 0);

    /* everything else starts hidden */
    hide(E(EL.about), { xPercent: -14, rotate: -2 });
    hide(E(EL.workEyebrow), { yPercent: -8, filter: "none" });
    SLIDE_IDS.forEach((id) => hide(E(id), { xPercent: 16, scale: 0.55, filter: "blur(8px) brightness(0.8)" }));
    SLIDE_META_IDS.forEach((id) => hide(E(id), { yPercent: 12, filter: "none" }));
    hide(E(EL.expType), { yPercent: 10, scale: 0.9 });
    hide(E(EL.expPlate), { rotate: 6, scale: 0.85 });
    hide(E(EL.expPlate2), { rotate: -5, scale: 0.9, yPercent: 6 });
    hide(E(EL.contact), { yPercent: 4 });
    hide(E(EL.contactLinks), { yPercent: 10, filter: "none" });
  }

  /* ── HERO (0 → 0.13): poster — name behind, figure in front.
     On scroll the figure's image gives way and the supporting text
     has already settled in the left column beside the nav. ── */
  tl.to(targets.camera, { x: -0.8, y: 2.0, z: 15.5, duration: 0.13 }, 0);
  if (dom) {
    tl.to(E(EL.heroPoster), { autoAlpha: 0, xPercent: -72, yPercent: -44, scale: 0.9, duration: 0.04, ease: "power2.in" }, 0.08);
    tl.to(E(EL.hero), { autoAlpha: 0, xPercent: -5, yPercent: -5, scale: 0.98, duration: 0.04, ease: "power2.in" }, 0.08);
    tl.to(E(EL.scrollHint), { autoAlpha: 0, duration: 0.03 }, 0.09);
  }

  /* ── ABOUT (0.13 → 0.33): spine right, note left ── */
  tl.to(targets.rig, { ...POSES.about.rig, duration: 0.06 }, 0.13);
  tl.to(targets.camera, { ...POSES.about.cam, duration: 0.06 }, 0.13);
  tl.to(targets.lookAt, { ...POSES.about.look, duration: 0.06 }, 0.13);
  tl.to(targets.field.about, { opacity: 0.7, duration: 0.06 }, 0.15);
  tl.to(targets.field.about, { opacity: 0, duration: 0.05 }, 0.29);
  if (dom) {
    show(E(EL.about), 0.16, { duration: 0.06, xPercent: -14, rotate: -2 });
    tl.to(E(EL.aboutConnector), { autoAlpha: 1, scaleX: 1, duration: 0.05, ease: "power2.out" }, 0.17);
    exit(E(EL.about), 0.30, { duration: 0.03, xPercent: 8, scale: 0.96, filter: "none" });
    tl.to(E(EL.aboutConnector), { autoAlpha: 0, duration: 0.02, ease: "power2.in" }, 0.30);
  }

  /* ── WORK (0.33 → 0.63): four project memories ── */
  tl.to(targets.rig, { ...POSES.work.rig, duration: 0.06 }, 0.33);
  tl.to(targets.camera, { ...POSES.work.cam, duration: 0.06 }, 0.33);
  tl.to(targets.lookAt, { ...POSES.work.look, duration: 0.06 }, 0.33);
  tl.to(targets.field.work, { opacity: 0.6, duration: 0.06 }, 0.35);
  tl.to(targets.field.work, { opacity: 0, duration: 0.04 }, 0.60);
  if (dom) {
    show(E(EL.workEyebrow), 0.35, { duration: 0.04, yPercent: -8, filter: "none" });
    exit(E(EL.workEyebrow), 0.58, { duration: 0.03, yPercent: -10, filter: "none" });

    const w = 0.075;
    for (let i = 0; i < SLIDE_IDS.length; i++) {
      const s = 0.33 + i * w;
      const img = E(SLIDE_IDS[i]);
      const meta = E(SLIDE_META_IDS[i]);
      if (!img) continue;
      tl.to(img, { autoAlpha: 1, scale: 1, xPercent: 0, filter: "none", duration: 0.028, ease: "power3.out" }, s + 0.005);
      if (meta)
        tl.to(meta, { autoAlpha: 1, yPercent: 0, duration: 0.016, ease: "power2.out" }, s + 0.036);
      tl.to(img, { autoAlpha: 0, scale: 1.08, xPercent: -8, filter: "blur(3px)", duration: 0.017, ease: "power2.in" }, s + 0.058);
      if (meta) tl.to(meta, { autoAlpha: 0, yPercent: -8, duration: 0.013, ease: "power2.in" }, s + 0.053);
    }
  }

  /* ── EXPERIMENTS (0.63 → 0.81): a new face of the spine ── */
  tl.to(targets.rig, { ...POSES.experiments.rig, duration: 0.06 }, 0.63);
  tl.to(targets.camera, { ...POSES.experiments.cam, duration: 0.06 }, 0.63);
  tl.to(targets.lookAt, { ...POSES.experiments.look, duration: 0.06 }, 0.63);
  tl.to(targets.field.experiments, { opacity: 0.55, duration: 0.05 }, 0.66);
  tl.to(targets.field.experiments, { opacity: 0, duration: 0.04 }, 0.78);
  if (dom) {
    show(E(EL.expType), 0.66, { duration: 0.06, yPercent: 10, scale: 0.9, filter: "none" });
    show(E(EL.expPlate), 0.67, { duration: 0.06, rotate: 6, scale: 0.85 });
    show(E(EL.expPlate2), 0.70, { duration: 0.05, rotate: -5, scale: 0.9, yPercent: 6 });
    exit(E(EL.expType), 0.78, { duration: 0.03, yPercent: -10, filter: "none" });
    exit(E(EL.expPlate), 0.78, { duration: 0.03, scale: 1.05 });
    exit(E(EL.expPlate2), 0.79, { duration: 0.02, yPercent: -8 });
  }

  /* ── CONTACT (0.81 → 1.00): return to center, slow down ── */
  tl.to(targets.rig, { ...POSES.contact.rig, duration: 0.06 }, 0.81);
  tl.to(targets.camera, { ...POSES.contact.cam, duration: 0.06 }, 0.81);
  tl.to(targets.lookAt, { ...POSES.contact.look, duration: 0.06 }, 0.81);
  tl.to(targets.field.contact, { opacity: 0.7, duration: 0.06 }, 0.84);
  tl.to(targets.camera, { x: 0.4, y: 0.2, z: 15.5, duration: 0.04 }, 0.94);
  if (dom) {
    show(E(EL.contact), 0.84, { duration: 0.06, yPercent: 4, scale: 0.9 });
    show(E(EL.contactLinks), 0.91, { duration: 0.05, yPercent: 10, filter: "none" });
  }

  return tl;
}
