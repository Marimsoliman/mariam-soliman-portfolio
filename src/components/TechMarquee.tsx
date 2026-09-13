"use client";
import React from "react";

const MARQUEE_ITEMS = [
  { text: "Full-Stack Development", style: "display-serif" },
  { text: "Frontend Engineering", style: "mono" },
  { text: "React", style: "sans-bold" },
  { text: "Next.js", style: "sans-bold" },
  { text: "TypeScript", style: "mono" },
  { text: "JavaScript", style: "mono" },
  { text: "UI Engineering", style: "display-serif" },
  { text: "Interaction Design", style: "sans-light" },
  { text: "Motion", style: "display-serif-italic" },
  { text: "GSAP", style: "mono" },
  { text: "WebGL", style: "sans-bold" },
  { text: "Three.js", style: "display-serif-italic" },
  { text: "Creative Technology", style: "display-serif" },
  { text: "Responsive Systems", style: "sans-light" },
  { text: "API Architecture", style: "mono" },
  { text: "Backend Development", style: "sans-bold" },
  { text: "Databases", style: "mono" },
  { text: "Performance", style: "sans-light" },
  { text: "Digital Experiences", style: "display-serif-italic" },
];

export function TechMarquee() {
  // Triple the items to ensure infinite seamless overflow on ultra-wide screens
  const duplicatedItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <section className="tech-marquee-section" aria-label="Core Technical Capabilities">
      <div className="tech-marquee-wrapper">
        <div className="tech-marquee-track">
          {duplicatedItems.map((item, index) => (
            <div key={index} className="tech-marquee-item">
              <span className={`marquee-text ${item.style}`}>
                {item.text}
              </span>
              <span className="marquee-divider" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 1V17" stroke="var(--line)" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="9" cy="9" r="2.5" fill="#ea580c" />
                </svg>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}