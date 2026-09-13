//src/component/hero/herotext.tsx
import type { RefObject } from "react";

type Props = {
  ctaRef: RefObject<HTMLAnchorElement | null>;
  onMagneticMove: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  onMagneticLeave: () => void;
};

export function HeroText({ ctaRef, onMagneticMove, onMagneticLeave }: Props) {
  return <>
    <nav className="hero__nav" aria-label="Primary navigation">
      <a className="hero__wordmark" href="#top">Mariam Soliman</a>
      <div className="hero__nav-links"><a href="#selected-work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></div>
    </nav>
    <div className="hero__copy">
      <div className="hero__topline"><span className="hero__signal"><i /> Available for selected projects</span><span>Creative developer / Cairo, Egypt</span></div>
      <h1 className="hero__title" aria-label="Creative frontend developer">
        <span className="hero__line-wrap"><span data-hero-line>Creative</span></span><span className="hero__line-wrap"><span data-hero-line>Frontend</span></span><span className="hero__line-wrap"><span data-hero-line className="hero__title-accent">Developer</span></span>
      </h1>
      <div className="hero__lower-copy"><p className="hero__statement">I design and engineer expressive digital experiences for ambitious brands and people.</p><a ref={ctaRef} className="hero__cta" href="#selected-work" onMouseMove={onMagneticMove} onMouseLeave={onMagneticLeave}><span>View selected work</span><span className="hero__cta-arrow">→</span></a></div>
      <div className="hero__meta"><span>React · Next.js · TypeScript</span><span>GSAP · Three.js · WebGL</span></div>
    </div>
  </>;
}
