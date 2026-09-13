//sec/components/HeroPoster.tsx
"use client";

import { hero } from "@/lib/content";
import { useReg } from "@/lib/registry";
import { EL } from "@/lib/choreo";

/** The giant hero name — rendered on a layer BELOW the 3D canvas so
 *  the spine reads as the figure in front of the typography. */
export function HeroPoster() {
  const reg = useReg(EL.heroPoster);

  return (
    <div ref={reg} data-el={EL.heroPoster} className="hero-poster" aria-hidden="true">
      <span className="hero-poster__line">{hero.nameLineA}</span>
      <span className="hero-poster__line hero-poster__line--last">
        {hero.nameLineB}
        <span className="hero-poster__dot">.</span>
      </span>
    </div>
  );
}
