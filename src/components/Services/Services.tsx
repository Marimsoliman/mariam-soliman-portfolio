"use client";

import { useLayoutEffect, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./services.css";

gsap.registerPlugin(ScrollTrigger);

type Service = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
};

const services: Service[] = [
  {
    id: "01",
    title: "Creative Frontend",
    subtitle: "Interaction & Development",
    description:
      "Crafting high-end, immersive web applications with fluid, physics-based motion, custom shader transitions, and pixel-perfect layouts using modern architectures.",
    bullets: ["Next.js & React", "GSAP & WebGL", "Performance Tuning"],
  },
  {
    id: "02",
    title: "UI/UX & Motion",
    subtitle: "Digital Art Direction",
    description:
      "Designing premium, motion-first user interfaces. Every layout, scroll step, and visual feedback is optimized to build an unforgettable digital narrative.",
    bullets: ["Cinematic Storytelling", "Interactive Prototypes", "Visual Identity"],
  },
  {
    id: "03",
    title: "Web Performance",
    subtitle: "Speed & SEO Optimization",
    description:
      "Transforming resource-heavy creative sites into lightning-fast experiences with flawless Lighthouse scores, clean SEO semantics, and fluid asset delivery.",
    bullets: ["Asset Compression", "Semantic SEO Structure", "Perfect Core Web Vitals"],
  },
];

// زوايا دوران فنية تكمّل الانحناء الجمالي للكروت
const CARD_ROTATIONS = [-8, 6, -4];

// إعدادات المسافات الضيقة جداً للحصول على شكل V معكوسة متلاحم
const COLLAGE_SPACING = {
  activeScale: 1.05,       // حجم الكارت النشط
  inactiveScale: 0.94,     // حجم الكروت الخلفية
  activeZ: 30,             // بروز الكارت النشط للأمام
  inactiveZ: -15,          
  horizontalGap: 175,      // تباعد أفقي فائق التقارب (Overlap متلاحم)
  activeOpacity: 1,        
  inactiveOpacity: 0.65,   
};

export function Services() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const triggersRef = useRef<(HTMLDivElement | null)[]>([]);
  const wrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const glowsRef = useRef<(HTMLDivElement | null)[]>([]);

  // الكارت الأوسط (index 1) هو الكارت النشط افتراضياً في قمة الـ V المعكوسة
  const [activeIndex, setActiveIndex] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const grid = gridRef.current;
    if (!container || !grid) return;

    const context = gsap.context(() => {
      // أنيميشن ظهور النصوص
      gsap.fromTo(
        ".services-eyebrow, .services-title",
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".services-header",
            start: "top 85%",
          },
        }
      );

      // ظهور الكروت من الأسفل
      gsap.fromTo(
        triggersRef.current,
        { autoAlpha: 0, y: 80 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.4,
          stagger: 0.15,
          ease: "power4.out",
          scrollTrigger: {
            trigger: grid,
            start: "top 80%",
          },
        }
      );
    }, container);

    return () => context.revert();
  }, []);

  // محرك التحرك والتباعد المرن (Wrapper) لتأكيد شكل الـ V المعكوسة عند الـ Hover
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.innerWidth < 1024) return;

    wrappersRef.current.forEach((wrapper, idx) => {
      if (!wrapper) return;

      const isActive = idx === activeIndex;
      const indexDiff = idx - activeIndex; 
      const distance = Math.abs(indexDiff);

      // حساب الإزاحة الأفقية متناهية التقارب
      const targetX = indexDiff * COLLAGE_SPACING.horizontalGap;
      
      // انحدار الـ V المعكوسة (القمة دائماً عند الكارت المختار وتنحدر الأطراف لأسفل بدقة)
      const targetY = distance * 55; 

      const targetScale = isActive ? COLLAGE_SPACING.activeScale : COLLAGE_SPACING.inactiveScale;
      const targetZ = isActive ? COLLAGE_SPACING.activeZ : COLLAGE_SPACING.inactiveZ;
      const targetOpacity = isActive ? COLLAGE_SPACING.activeOpacity : COLLAGE_SPACING.inactiveOpacity;
      const targetZIndex = isActive ? 10 : 5 - distance;

      const targetRotation = isActive ? CARD_ROTATIONS[idx] * 0.25 : CARD_ROTATIONS[idx];

      gsap.to(wrapper, {
        x: targetX,
        y: targetY,
        scale: targetScale,
        z: targetZ,
        autoAlpha: targetOpacity,
        zIndex: targetZIndex,
        rotationZ: targetRotation,
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: "power2.out",
      });
    });
  }, [activeIndex]);

  // التأرجح ثلاثي الأبعاد الناعم للكارت الفعال بمفرده لمنع الارتجاج
  useEffect(() => {
    if (window.innerWidth < 1024) return;

    const activeCard = cardsRef.current[activeIndex];
    const activeGlow = glowsRef.current[activeIndex];
    const activeTrigger = triggersRef.current[activeIndex];
    if (!activeCard || !activeGlow || !activeTrigger) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = activeTrigger.getBoundingClientRect();
      const localX = e.clientX - rect.left - rect.width / 2;
      const localY = e.clientY - rect.top - rect.height / 2;

      const normX = localX / (rect.width / 2);
      const normY = localY / (rect.height / 2);

      gsap.to(activeCard, {
        rotationX: -normY * 5,
        rotationY: normX * 6,
        x: normX * 8,
        y: normY * 6,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });

      const glowRect = activeGlow.getBoundingClientRect();
      gsap.to(activeGlow, {
        x: e.clientX - rect.left - glowRect.width / 2,
        y: e.clientY - rect.top - glowRect.height / 2,
        opacity: 0.6,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const onMouseLeave = () => {
      gsap.to(activeCard, {
        rotationX: 0,
        rotationY: 0,
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(activeGlow, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    activeTrigger.addEventListener("mousemove", onMouseMove);
    activeTrigger.addEventListener("mouseleave", onMouseLeave);

    return () => {
      activeTrigger.removeEventListener("mousemove", onMouseMove);
      activeTrigger.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [activeIndex]);

  const handleCardHover = (index: number) => {
    if (activeIndex !== index) {
      setActiveIndex(index);
    }
  };

  const handleGridLeave = () => {
    setActiveIndex(1);
  };

  return (
    <section ref={containerRef} className="services-section" id="services">
      <div className="services-container">
        
        <header className="services-header">
          <p className="services-eyebrow">Capabilities</p>
          <h2 className="services-title">
            Bringing brands to life through <i>motion</i> and <i>code</i>.
          </h2>
        </header>

        <div 
          className="services-grid" 
          ref={gridRef}
          onPointerLeave={handleGridLeave}
        >
          {services.map((service, index) => {
            const isActive = index === activeIndex;

            return (
              <div 
                className={`service-card-trigger ${isActive ? 'is-active' : 'is-inactive'}`}
                key={service.id}
                ref={(el) => { triggersRef.current[index] = el; }}
                onPointerEnter={() => handleCardHover(index)}
              >
                <div 
                  className="service-card-wrapper"
                  ref={(el) => { wrappersRef.current[index] = el; }}
                >
                  <div 
                    className="service-card" 
                    ref={(el) => { cardsRef.current[index] = el; }}
                  >
                    <div 
                      className="service-card__glow" 
                      ref={(el) => { glowsRef.current[index] = el; }}
                    />

                    <div className="service-card__header">
                      <span className="service-card__number">{service.id}</span>
                      <div className="service-card__header-right">
                        <span className="service-card__subtitle">{service.subtitle}</span>
                        <button 
                          className="service-card__arrow"
                          onPointerEnter={() => handleCardHover(index)}
                          aria-label={`Focus ${service.title}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 18L18 6M18 6H10M18 6V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="service-card__content">
                      <h3 className="service-card__title">{service.title}</h3>
                      <p className="service-card__description">{service.description}</p>
                    </div>

                    <div className="service-card__footer">
                      <ul className="service-card__list">
                        {service.bullets.map((bullet, idx) => (
                          <li key={idx} className="service-card__item">
                            <span>✦</span> {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}