"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { About } from "./About/About";
import { Projects } from "./Projects/Projects";
import { Services } from "./Services/Services";
import { LetsTalk } from "./LetsTalk/LetsTalk";
import { TechMarquee } from "@/components/TechMarquee";

gsap.registerPlugin(ScrollTrigger);

export function CreativePortfolio() {
  const root = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;

    // ♿ دعم ذوي الاحتياجات الخاصة (تقليل الحركة)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      scope.classList.add("nav-active");
      return;
    }

    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const context = gsap.context(() => {
      const heroName = scope.querySelector<HTMLElement>(".hero-name");
      const portrait = scope.querySelector<HTMLImageElement>(".portrait-image");

      if (!heroName || !portrait) return;

      /* ---------- الحالة الابتدائية ---------- */
      gsap.set(portrait, { opacity: 1, visibility: "visible", transformOrigin: "bottom center" });
      gsap.set(heroName, { xPercent: 120, opacity: 0 });

      /* ---------- انيميشن البداية للترحيب ---------- */
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro.to(heroName, { xPercent: 0, opacity: 1, duration: 1.8 }, 0.6);

      /* ---------- تايم لاين التمرير ---------- */
      const scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero-scroll-space",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          pin: ".cinematic-hero",
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      scrollTimeline.to({}, { duration: 0.2 });

      scrollTimeline.fromTo(
        portrait,
        { autoAlpha: 1, yPercent: 0, scale: 1, filter: "blur(0px)" },
        { autoAlpha: 0, yPercent: 18, scale: 1.14, filter: "blur(8px)", duration: 0.6, ease: "power1.inOut" },
        0.2
      );

      scrollTimeline.to(heroName, { scale: 0.85, opacity: 0, duration: 0.25, ease: "power2.in" }, 0.25);
      
      scrollTimeline.to(
        ".transition-scene",
        { xPercent: 0, yPercent: 0, opacity: 1, visibility: "visible", duration: 0.4, ease: "none" },
        0.35
      );

      /* =====================================================================
         🌟 التحكم بنشاط السايدبار الشفاف عند الـ Scroll 🌟
         ===================================================================== */
      ScrollTrigger.create({
        trigger: ".hero-scroll-space",
        start: "top top-=20", 
        end: "bottom top",
        onEnter: () => {
          scope.classList.add("nav-active");
        },
        onLeaveBack: () => {
          scope.classList.remove("nav-active"); 
        },
        onUpdate: (self) => {
          if (self.scroll() < 10) {
            scope.classList.remove("nav-active");
          }
        }
      });

      ScrollTrigger.refresh();
    }, scope);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      context.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      scope.classList.remove("nav-active");
    };
  }, []);

  return (
    <div ref={root} className="mariam-portfolio">
      <nav className="cinematic-nav" aria-label="Primary navigation">
        <a className="cinematic-nav__brand" href="#top">
          Mariam<br />Soliman
        </a>
        
        {/* نصوص الهيرو السحرية */}
        <div className="cinematic-nav__hero">
          <strong>Creative<br />Developer</strong>
          <p>Building beautiful digital experiences with code and creativity.</p>
        </div>

        {/* شريط الماركي */}
        <TechMarquee />

        <div className="cinematic-nav__links">
          <a href="#about"><span>About</span><b>↗</b></a>
          <a href="#work"><span>Work</span><b>↗</b></a>
          <a href="#services"><span>Services</span><b>↗</b></a>
        </div>
        
        <a className="cinematic-nav__talk" href="mailto:mariamsoliman.dev@gmail.com">
          <span>Let&apos;s talk</span>
          <b aria-hidden="true">↗</b>
        </a>
      </nav>

      <div className="hero-scroll-space">
        <section id="top" className="cinematic-hero" aria-label="Mariam Soliman, Creative Developer">
          <h1 className="hero-name">Mariam</h1>
          <div className="hero-composition">
            <img
              src="/images/mariam-portrait.png"
              alt="Mariam Soliman - Editorial Portrait"
              className="portrait-image"
              loading="eager"
              fetchPriority="high"
              decoding="sync"
            />
          </div>
          <div className="transition-scene" aria-hidden="true" />
        </section>
      </div>

      <About />
      <Projects />
      <Services />
      <LetsTalk />
    </div>
  );
}