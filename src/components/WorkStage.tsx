"use client";

import { projects, work } from "@/lib/content";
import type { Project } from "@/lib/content";
import { useReg } from "@/lib/registry";
import { EL, SLIDE_IDS, SLIDE_META_IDS } from "@/lib/choreo";

function WorkSlide({ p, i }: { p: Project; i: number }) {
  const regImg = useReg(SLIDE_IDS[i]);
  const regMeta = useReg(SLIDE_META_IDS[i]);

  return (
    <figure className="work-slide">
      <div ref={regImg} data-el={SLIDE_IDS[i]} className="work-slide__frame">
        <img
          src={p.image}
          alt={`${p.title} — ${p.subtitle}`}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <figcaption ref={regMeta} data-el={SLIDE_META_IDS[i]} className="work-slide__meta">
        <h3 className="work-slide__title">{p.title}</h3>
        <span className="work-slide__sub">{p.subtitle}</span>
        <span className="work-slide__year">{p.year}</span>
        <div className="work-slide__tags">
          {p.technologies.map((t) => (
            <span key={t} className="work-slide__tag">
              {t}
            </span>
          ))}
        </div>
        <a
          href={p.demoUrl}
          target="_blank"
          rel="noreferrer"
          className="work-slide__visit link-arrow"
        >
          Visit
          <span className="link-arrow__glyph">↗</span>
        </a>
      </figcaption>
    </figure>
  );
}

export function WorkStage() {
  const regEyebrow = useReg(EL.workEyebrow);
  const regStage = useReg(EL.workStage);

  return (
    <>
      <p ref={regEyebrow} data-el={EL.workEyebrow} className="work-eyebrow">
        <span className="work-eyebrow__num">{work.number}</span>
        <span className="work-eyebrow__label">{work.eyebrow}</span>
      </p>

      <div ref={regStage} data-el={EL.workStage} className="work-stage" id="work">
        {projects.map((p, i) => (
          <WorkSlide key={p.slug} p={p} i={i} />
        ))}
      </div>
    </>
  );
}
