"use client";

import { hero, identity } from "@/lib/content";
import { useReg } from "@/lib/registry";
import { EL } from "@/lib/choreo";
import { scrollToChapter } from "@/lib/scroll";

/** Hero supporting text — a left column beside the nav. The giant
 *  name lives in <HeroPoster/> (behind the 3D figure). */
export function HeroContent() {
  const regHero = useReg(EL.hero);
  const regHint = useReg(EL.scrollHint);

  return (
    <>
      <h1 className="sr-only">{identity.name} — {identity.role}</h1>

      <header id="hero" ref={regHero} data-el={EL.hero} className="hero">
        <p className="hero__eyebrow">{hero.eyebrow}</p>
        <div className="hero-roles" aria-label="Focus areas">
          {hero.roles.map((r) => (
            <span key={r} className="hero-roles__item">
              {r}
            </span>
          ))}
        </div>
        <p className="hero-meta__statement">{hero.statement}</p>
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
