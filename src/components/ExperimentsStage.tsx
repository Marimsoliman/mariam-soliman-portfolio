"use client";

import { experiments, projects } from "@/lib/content";
import { useReg } from "@/lib/registry";
import { EL } from "@/lib/choreo";

export function ExperimentsStage() {
  const regType = useReg(EL.expType);
  const regPlate = useReg(EL.expPlate);
  const regPlate2 = useReg(EL.expPlate2);

  return (
    <section id="experiments" className="experiments">
      <div ref={regType} data-el={EL.expType} className="exp-type">
        <p className="exp-type__eyebrow">
          <span className="exp-type__num">{experiments.number}</span>
          {experiments.title}
        </p>
        <ul className="exp-type__lines">
          {experiments.lines.map((l) => (
            <li key={l} className="exp-type__line">
              {l}
            </li>
          ))}
        </ul>
      </div>

      <div ref={regPlate} data-el={EL.expPlate} className="exp-plate exp-plate--a">
        <img src={projects[1].image} alt={projects[1].title} loading="eager" decoding="async" />
      </div>
      <div ref={regPlate2} data-el={EL.expPlate2} className="exp-plate exp-plate--b">
        <img src={projects[2].image} alt={projects[2].title} loading="eager" decoding="async" />
      </div>

      <span className="exp-shape exp-shape--ring" aria-hidden="true" />
      <span className="exp-shape exp-shape--bar" aria-hidden="true" />
    </section>
  );
}
