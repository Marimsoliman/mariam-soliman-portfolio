//sec/components/HeroContent.tsx
"use client";

import { hero, identity } from "@/lib/content";
import { useReg } from "@/lib/registry";
import { EL } from "@/lib/choreo";
import { scrollToChapter } from "@/lib/scroll";

export function HeroContent() {
  const regHero = useReg(EL.hero);
  const regHint = useReg(EL.scrollHint);

  return (
    <>
      <h1 className="sr-only">{identity.name} — {identity.role}</h1>

      <header id="hero" ref={regHero} data-el={EL.hero} className="hero">
        {/* 🔹 يسار: Creative Developer (أعلى الصفحة) */}
        <div className="hero__left">
          <h1 className="hero-title">
            {hero.roles.join(" ")}
          </h1>
        </div>

        {/* 🔹 يمين: الوصف (أعلى الصفحة) */}
        <div className="hero__right">
          <p className="hero-description">{hero.statement}</p>
        </div>

        {/* العناصر الأخرى (ستظهر لاحقًا عند التمرير) */}
        <p className="hero__eyebrow">{hero.eyebrow}</p>
        <p className="hero-meta__loc">{identity.location}</p>
        <div className="hero__cta">
          <button
            type="button"
            className="link-arrow link-arrow--accent"
            onClick={() => scrollToChapter("work")}
          >
            {hero.ctaWork}
            <span className="link-arrow__glyph">↓</span>
          </button>
          <button
            type="button"
            className="link-arrow"
            onClick={() => scrollToChapter("about")}
          >
            {hero.ctaAbout}
          </button>
        </div>
      </header>

      <div ref={regHint} data-el={EL.scrollHint} className="scroll-hint">
        <span className="scroll-hint__label">Scroll to explore</span>
        <span className="scroll-hint__line" />
      </div>
    </>
  );
}