//src/component/hero/aboutoverlay.tsx
"use client";

import type { RefObject } from "react";
import "./AboutOverlay.css";

interface AboutOverlayProps {
  overlayRef: RefObject<HTMLDivElement | null>;
  visible: boolean;
}

const panels = [
  { id: "about", number: "01 /", title: "About", body: "Interaction and motion." },
  { id: "approach", number: "02 /", title: "Approach", body: "Visual systems and performance." },
  { id: "stack", number: "03 /", title: "Stack", body: "React / Next.js / GSAP / Three.js." },
];

const aboutContent = {
  eyebrow: "ABOUT",
  headline: "I BUILD DIGITAL EXPERIENCES.",
  body: "A Creative Frontend / Full-Stack Developer building expressive digital experiences through design, code, motion, and interaction.",
  meta: [
    { id: "location", label: "Based in", value: "Egypt" },
    { id: "practice", label: "Practice", value: "Frontend / Full-Stack" },
    { id: "framework", label: "Framework", value: "React / Next.js" },
    { id: "motion", label: "Motion", value: "GSAP / Three.js" },
    { id: "availability", label: "Status", value: "Available for selected projects" },
  ],
};

export function AboutOverlay({
  overlayRef,
  visible,
}: AboutOverlayProps) {
  return (
    <div
      ref={overlayRef}
      className="about-overlay"
      style={{ opacity: 0, pointerEvents: "none" }}
      aria-hidden={!visible}
    >
      <div className="about-overlay__screen">
        <div className="about-overlay__chrome">
          <div className="about-overlay__traffic-lights">
            <span className="about-overlay__light about-overlay__light--close" />
            <span className="about-overlay__light about-overlay__light--minimize" />
            <span className="about-overlay__light about-overlay__light--maximize" />
          </div>
          <div className="about-overlay__title">/ interface.about</div>
        </div>

        <div className="about-overlay__content">
          <div className="about-overlay__intro">
            <p className="about-overlay__eyebrow">{aboutContent.eyebrow}</p>
            <h2 className="about-overlay__headline">{aboutContent.headline}</h2>
          </div>

          <div className="about-overlay__copy">
            <p>{aboutContent.body}</p>
            <dl className="about-overlay__meta">
              {aboutContent.meta.map((item) => (
                <div key={item.id} className="about-overlay__meta-row">
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="about-overlay__panels">
            {panels.map((panel) => (
              <article key={panel.id} className="about-overlay__panel">
                <span className="about-overlay__panel-num">{panel.number}</span>
                <h3 className="about-overlay__panel-title">{panel.title}</h3>
                {panel.body && <p className="about-overlay__panel-body">{panel.body}</p>}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
