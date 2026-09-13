// components/About/About.tsx
"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./about.css";

gsap.registerPlugin(ScrollTrigger);

type Milestone = { year: string; title: string; description: string; label: string; meta: string };
type Route = { id: number; d: string; width: number; height: number };

const milestones: Milestone[] = [
  { year: "2020", title: "Starting with code", description: "A first curiosity became a practice: learning to turn an idea into a working interface.", label: "FOUNDATION", meta: "HTML · CSS · JavaScript" },
  { year: "2021", title: "First freelance steps", description: "Real briefs introduced the discipline behind clear communication, reliable delivery, and thoughtful detail.", label: "INDEPENDENT", meta: "Client work · UI systems" },
  { year: "2022", title: "Building real projects", description: "The work grew from pages into products, where the front end needed to serve an entire system.", label: "PRODUCT", meta: "React · APIs · Databases" },
  { year: "2023", title: "Growing through challenges", description: "Harder problems sharpened the process: question the system, reduce the noise, make each decision matter.", label: "CRAFT", meta: "Full-stack · Collaboration" },
  { year: "2024", title: "Where I am today", description: "I build expressive digital experiences with the same attention to the logic beneath them and the feeling they leave behind.", label: "NOW", meta: "Creative development · Interaction" },
];

function JourneyCard({ item, index }: { item: Milestone; index: number }) {
  return (
    <article
      className={`journey-card journey-card--${index % 2 ? "left" : "right"}`}
      data-card={index}
      aria-label={`${item.year}: ${item.title}`}
    >
      <div className="journey-card__visual" aria-hidden="true">
        <span>{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="journey-card__body">
        <p className="journey-card__label">{item.label}</p>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <footer>{item.meta}</footer>
      </div>
    </article>
  );
}

// ✅ التعديل هنا - path حقيقي بدل use
function TimelineRoutes({ routes }: { routes: Route[] }) {
  return (
    <div className="journey-routes" aria-hidden="true">
      {routes.map((route) => (
        <svg
          key={route.id}
          className="journey-route"
          data-route={route.id}
          width={route.width}
          height={route.height}
          viewBox={`0 0 ${route.width} ${route.height}`}
        >
          <defs>
            <marker
              id={`arrow-${route.id}`}
              markerWidth="12"
              markerHeight="12"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 z" />
            </marker>
          </defs>
          <path d={route.d} className="journey-route__track" />
          <path
            d={route.d}
            className="journey-route__draw"
            markerEnd={`url(#arrow-${route.id})`}
          />
          <circle className="journey-route__dot" data-dot={route.id} r="6" />
        </svg>
      ))}
    </div>
  );
}

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [routes, setRoutes] = useState<Route[]>([]);

  useLayoutEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const calculateRoutes = () => {
      const root = timeline.getBoundingClientRect();
      const cards = Array.from(timeline.querySelectorAll<HTMLElement>("[data-card]"));

      const nextRoutes = cards.slice(0, -1).map((card, index) => {
        const next = cards[index + 1];
        const a = card.getBoundingClientRect();
        const b = next.getBoundingClientRect();
        const goingRight = b.left > a.left;
        const startX = (goingRight ? a.right : a.left) - root.left;
        const endX = (goingRight ? b.left : b.right) - root.left;
        const startY = a.top + a.height * 0.68 - root.top;
        const endY = b.top + b.height * 0.32 - root.top;
        const bend = Math.max(72, Math.abs(endX - startX) * 0.42);

        return {
          id: index,
          width: root.width,
          height: root.height,
          d: `M ${startX} ${startY} C ${startX + (goingRight ? bend : -bend)} ${startY + 44}, ${endX - (goingRight ? bend : -bend)} ${endY - 44}, ${endX} ${endY}`,
        };
      });

      setRoutes((previous) =>
        previous.length === nextRoutes.length &&
        previous.every(
          (route, index) =>
            route.d === nextRoutes[index].d &&
            route.width === nextRoutes[index].width &&
            route.height === nextRoutes[index].height
        )
          ? previous
          : nextRoutes
      );
    };

    calculateRoutes();
    const refresh = () => requestAnimationFrame(calculateRoutes);
    ScrollTrigger.addEventListener("refreshInit", refresh);
    window.addEventListener("resize", refresh);

    return () => {
      ScrollTrigger.removeEventListener("refreshInit", refresh);
      window.removeEventListener("resize", refresh);
    };
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || routes.length !== milestones.length - 1) return;

    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
      const nodes = gsap.utils.toArray<HTMLElement>(".journey-node");
      const pathElements = gsap.utils.toArray<SVGPathElement>(".journey-route__draw");
      const dots = gsap.utils.toArray<SVGCircleElement>(".journey-route__dot");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Cards Animation
      cards.forEach((card) => {
        gsap.set(card, reduced ? { autoAlpha: 1, y: 0, scale: 1 } : { autoAlpha: 0, y: 64, scale: 0.97 });

        if (!reduced) {
          gsap.to(card, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
              end: "top 55%",
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          });
        }
      });

      // Nodes Animation
      nodes.forEach((node, index) => {
        const core = node.querySelector("span");
        gsap.set(node, {
          scale: 0.88,
          borderColor: "rgba(212, 181, 160, 0.17)",
          boxShadow: "0 0 0 0 rgba(247, 241, 234, 0)",
        });
        gsap.set(core, { backgroundColor: "#d4b5a0", scale: 1 });

        const nodeTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: cards[index],
            start: "top 62%",
            end: "top 42%",
            scrub: 0.35,
            invalidateOnRefresh: true,
          },
        });

        nodeTimeline.to(node, {
          scale: 1.16,
          borderColor: "#f7f1ea",
          boxShadow: "0 0 0 .45rem rgba(247, 241, 234, .06)",
        }, 0);

        if (core) {
          nodeTimeline.to(core, { backgroundColor: "#f7f1ea", scale: 1.25 }, 0);
        }
      });

      // ✅ Paths Animation - دلوقتي هتشتغل صح
      pathElements.forEach((path, index) => {
        if (!path || typeof path.getTotalLength !== "function") {
          console.warn(`Path ${index} not found or invalid`);
          return;
        }

        const length = path.getTotalLength();
        const dot = dots[index];

        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
          opacity: 0,
        });

        gsap.set(dot, { opacity: 0 });

        if (reduced) {
          gsap.set(path, { strokeDashoffset: 0, opacity: 1 });
          return;
        }

        const progress = { value: 0 };

        gsap.timeline({
          scrollTrigger: {
            trigger: cards[index],
            start: "top 70%",
            endTrigger: cards[index + 1],
            end: "top 40%",
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        })
          .to(path, { opacity: 1, ease: "power2.out", duration: 0.2 }, 0)
          .to(path, { strokeDashoffset: 0, ease: "none", duration: 0.6 }, 0.1)
          .to(dot, { opacity: 1, duration: 0.05 }, 0.2)
          .to(
            progress,
            {
              value: 1,
              ease: "none",
              duration: 0.5,
              onUpdate: () => {
                const point = path.getPointAtLength(length * progress.value);
                gsap.set(dot, { attr: { cx: point.x, cy: point.y } });
              },
            },
            0.2
          )
          .to(dot, { opacity: 0, duration: 0.1 }, 0.9);
      });
    }, section);

    ScrollTrigger.refresh();
    return () => context.revert();
  }, [routes]);

  return (
    <section ref={sectionRef} className="about-section" id="about" aria-labelledby="about-title">
      <div className="about-bg-fixed" aria-hidden="true" />

      <header className="about-intro">
        <p className="about-eyebrow">About me</p>
        <h2 id="about-title">
          About Me <em>(&amp;)</em>
          <br />
          My Journey
        </h2>
        <p className="about-intro__statement">
          Every project taught me something.
          <br />
          Every challenge changed the way I build.
        </p>
        <span className="about-intro__detail" aria-hidden="true">01 / 05</span>
      </header>

      <div className="about-journey-intro">
        <p className="about-eyebrow">My journey</p>
        <p>This is a selection of the moments that moved my work from curiosity to considered digital experiences.</p>
      </div>

      <div ref={timelineRef} className="journey-timeline" aria-label="Mariam's professional journey">
        <TimelineRoutes routes={routes} />
        {milestones.map((item, index) => (
          <div className="journey-milestone" key={item.year}>
            <div className="journey-node" aria-hidden="true"><span /></div>
            <p className="journey-year">{item.year}</p>
            <JourneyCard item={item} index={index} />
          </div>
        ))}
      </div>

      <footer className="about-outro">
        <p className="about-eyebrow">The through line</p>
        <h2>I still build with curiosity.<br />Only now, it has a direction.</h2>
      </footer>
    </section>
  );
}