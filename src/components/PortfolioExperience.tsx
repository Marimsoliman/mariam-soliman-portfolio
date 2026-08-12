"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SpineStage, wirePointer } from "./Scene";
import { DomOverlay } from "./DomOverlay";
import { HeroPoster } from "./HeroPoster";
import { SidebarNav } from "./SidebarNav";
import { ProgressRail } from "./ProgressRail";
import { RegistryContext } from "@/lib/registry";
import { getFontsReady } from "@/lib/textures";
import { projects } from "@/lib/content";
import {
  buildMasterTimeline,
  chapterAt,
  createTargets,
  getMode,
  isStaticMode,
} from "@/lib/choreo";
import type { Mode, ScrollTargets } from "@/lib/choreo";
import { destroyLenis, initLenis } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const BODY_HEIGHT_PX = 7000;

export function PortfolioExperience() {
  const [mode, setMode] = useState<Mode>(() => getMode());
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState("hero");

  const targetsRef = useRef<ScrollTargets | null>(null);
  if (targetsRef.current === null) {
    targetsRef.current = createTargets(mode);
  }
  const domRefs = useRef<Record<string, HTMLElement | null>>({});
  const progressRef = useRef(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const register = useCallback((id: string) => {
    return (el: HTMLElement | null) => {
      domRefs.current[id] = el;
    };
  }, []);

  /* loading gate: web fonts + the four project images */
  useEffect(() => {
    let alive = true;
    const imgs = projects.map(
      (p) =>
        new Promise<void>((res) => {
          const img = new Image();
          img.onload = img.onerror = () => res();
          img.src = p.image;
        })
    );
    Promise.all([getFontsReady(), ...imgs]).then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  /* live mode detection (desktop ↔ static) */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setMode(getMode());
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  /* layout switch class on <html> */
  useEffect(() => {
    const root = document.documentElement;
    if (isStaticMode(mode)) root.classList.add("is-static");
    else root.classList.remove("is-static");
    return () => root.classList.remove("is-static");
  }, [mode]);

  /* master experience: Lenis + ScrollTriggers + scrubbed timeline */
  useGSAP(
    () => {
      if (!ready) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktop = modeRef.current.isDesktop;
      const staticMode = isStaticMode(modeRef.current);

      /* scroll distance — the journey is one scrubbed page */
      document.body.style.height = desktop && !reduced ? `${BODY_HEIGHT_PX}px` : "auto";

      /* smooth scroll */
      let lenis: ReturnType<typeof initLenis> | null = null;
      if (desktop && !reduced) {
        lenis = initLenis();
        lenis.on("scroll", ScrollTrigger.update);
        const raf = (time: number) => lenis!.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
        wirePointer();
      }

      /* progress + active chapter (setState only on chapter change) */
      const progressSt = ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          progressRef.current = self.progress;
          const c = chapterAt(self.progress);
          setActive((prev) => (prev === c ? prev : c));
        },
      });

      /* the one master timeline — 3D + DOM in lock-step */
      const tl = buildMasterTimeline(
        {
          targets: targetsRef.current!,
          dom: domRefs.current,
        },
        {
          dom: desktop && !reduced,
          poses: !staticMode,
          initial: staticMode ? "static" : "hero",
        }
      );

      /* Apply hero resting states directly — the timeline's position-0
         sets may not fire until ScrollTrigger performs its first update,
         so we ensure the hero is visible immediately. */
      if (desktop && !reduced && domRefs.current) {
        const d = domRefs.current;
        gsap.set(d["el-hero-poster"], { autoAlpha: 1, xPercent: -50, yPercent: -50, scale: 1, filter: "none" });
        gsap.set(d["el-hero"], { autoAlpha: 1, xPercent: 0, yPercent: 0, scale: 1, filter: "none" });
        gsap.set(d["el-scroll-hint"], { autoAlpha: 1 });
      }

      return () => {
        tl.scrollTrigger?.kill();
        progressSt.kill();
        if (lenis) {
          gsap.ticker.lagSmoothing(1);
          destroyLenis();
        }
        document.body.style.height = "";
      };
    },
    { dependencies: [mode, ready] }
  );

  if (!ready) {
    return (
      <div className="loading-gate" role="status">
        <span className="loading-gate__mark">MS</span>
        <span className="loading-gate__label">Loading</span>
      </div>
    );
  }

  return (
    <RegistryContext.Provider value={register}>
      <div className="portfolio-root">
        <div className="hero-poster-layer">
          <HeroPoster />
        </div>

        <div className="stage-3d">
          <Canvas
            dpr={mode.isDesktop ? [1, 1.5] : [1, 1.25]}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.15,
            }}
            camera={{ fov: 45, near: 0.1, far: 80, position: [0, 3.2, 18] }}
          >
            <SpineStage
              targets={targetsRef.current!}
              idleMotion={!mode.reducedMotion}
              parallax={mode.isDesktop && !mode.reducedMotion}
              detail={mode.isDesktop ? 1 : 0.8}
            />
          </Canvas>
        </div>

        <DomOverlay />

        <SidebarNav active={active} />
        <ProgressRail progressRef={progressRef} />
      </div>
    </RegistryContext.Provider>
  );
}
