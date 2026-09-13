//src/component/hero/hero.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { HeroScene } from "./HeroScene";
import { HeroText } from "./HeroText";
import type { Hero3DRefs } from "./Hero3D";
import "./hero.css";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);
  const sceneShell = useRef<HTMLDivElement>(null);
  const hero3dRef = useRef<Hero3DRefs>(null);
  const transitionProgressRef = useRef(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!root.current) return;

    const ctx = gsap.context(() => {
      if (!reduced) {
        const lines = gsap.utils.toArray<HTMLElement>("[data-hero-line]");
        gsap.timeline({ defaults: { ease: "power3.out" } })
          .fromTo(".hero__wash", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 })
          .from(".hero__nav, .hero__topline", { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.08 }, 0.16)
          .from(lines, { autoAlpha: 0, yPercent: 115, filter: "blur(10px)", skewY: 2, duration: 1.05, stagger: 0.13, clearProps: "filter" }, 0.28)
          .from(".hero__scene-shell", { autoAlpha: 0, y: 36, duration: 1.3, ease: "expo.out" }, 0.4)
          .from(".hero__statement", { autoAlpha: 0, y: 18, duration: 0.65 }, 0.9)
          .from(".hero__cta, .hero__meta", { autoAlpha: 0, y: 12, duration: 0.55, stagger: 0.08 }, 1.06);
      }

      // Scroll-triggered camera animation
      const transition = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: reduced ? false : 1.15,
          onUpdate: (self) => {
            updateTransitionForProgress(self.progress);
          },
        },
      });

      // Hero copy fade out as we start scrolling
      transition
        .to(".hero__copy", { yPercent: -16, autoAlpha: 0.08, ease: "none", duration: 0.48 }, 0.08)
        .to(".hero__nav", { autoAlpha: 0, ease: "none", duration: 0.16 }, 0.18);

      return () => ctx.revert();
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  const updateTransitionForProgress = (progress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    transitionProgressRef.current = clampedProgress;

    // The sculpture starts in the split hero, then its existing Canvas becomes
    // a real full-viewport stage before the physical screen crossing begins.
    const expansion = smoothstep(clampedProgress, 0.12, 0.38);
    if (sceneShell.current) {
      sceneShell.current.style.width = `${52 + expansion * 48}%`;
      sceneShell.current.style.top = `${78 * (1 - expansion)}px`;
      sceneShell.current.style.minHeight = `calc(100svh - ${78 * (1 - expansion)}px)`;
    }
    const heroCopy = root.current?.querySelector<HTMLElement>(".hero__copy");
    if (heroCopy) {
      heroCopy.style.opacity = `${1 - smoothstep(clampedProgress, 0.12, 0.38) * 0.98}`;
    }
    if (root.current) root.current.dataset.entering = clampedProgress > 0.12 ? "true" : "false";

  };

  const move = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduced || !cta.current) return;
    const rect = cta.current.getBoundingClientRect();
    gsap.to(cta.current, {
      x: (event.clientX - rect.left - rect.width / 2) * 0.18,
      y: (event.clientY - rect.top - rect.height / 2) * 0.24,
      duration: 0.35,
      ease: "power3.out",
    });
  };

  return (
    <div ref={root} className="portfolio-experience">
      <main id="top" className="portfolio-hero" aria-label="Mariam Soliman portfolio introduction">
        <div className="hero__wash" />
        <div className="hero__grid" aria-hidden="true" />
        <HeroText
          ctaRef={cta}
          onMagneticMove={move}
          onMagneticLeave={() => gsap.to(cta.current, { x: 0, y: 0, duration: 0.45, ease: "power3.out" })}
        />
        <div ref={sceneShell} className="hero__scene-shell" aria-label="Interactive 3D browser sculpture">
          <Canvas
            dpr={[1, 1.5]}
            camera={{
              position: [0, 0, 8.7],
              fov: 32,
            }}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.18,
            }}
            fallback={
              <div className="hero__webgl-fallback">
                <span>01</span>
                <b>WEBGL<br />EXPERIENCE</b>
              </div>
            }
          >
            <HeroScene
              reducedMotion={reduced}
              transitionProgressRef={transitionProgressRef}
              hero3dRef={hero3dRef}
            />
          </Canvas>
        </div>
        <p className="hero__scroll-note" aria-hidden="true"></p>
      </main>
    </div>
  );
}

function smoothstep(value: number, start: number, end: number): number {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}
