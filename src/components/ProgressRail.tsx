"use client";

import { useEffect, useRef, type RefObject } from "react";
import { CHAPTERS } from "@/lib/choreo";

/** Thin vertical progress indicator on the right edge — the spine's
 *  axis mirrored in the DOM. Reads a shared mutable progress value
 *  directly (no React re-renders during scroll). */
export function ProgressRail({ progressRef }: { progressRef: RefObject<number> }) {
  const fillRef = useRef<HTMLSpanElement>(null);
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = progressRef.current ?? 0;
      if (fillRef.current) fillRef.current.style.height = `${p * 100}%`;
      if (nodeRef.current) nodeRef.current.style.top = `${p * 100}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  return (
    <div className="progress" aria-hidden="true">
      <div className="progress__track">
        <span ref={fillRef} className="progress__fill" />
        <span ref={nodeRef} className="progress__node" />
      </div>
      <ul className="progress__chapters">
        {CHAPTERS.map((c, i) => (
          <li key={c.id} className="progress__chapter">
            <span className="progress__num">{String(i + 1).padStart(2, "0")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
