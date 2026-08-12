"use client";

import Lenis from "lenis";
import { chapterScrollY } from "./choreo";

let lenis: Lenis | null = null;

export function initLenis() {
  if (lenis) return lenis;
  lenis = new Lenis({ duration: 1.35, smoothWheel: true });
  return lenis;
}

export function destroyLenis() {
  lenis?.destroy();
  lenis = null;
}

export function getLenis() {
  return lenis;
}

/** Smooth-scroll to a chapter. Desktop (Lenis) uses the scrubbed page
 *  offset; static mode falls back to native scrolling to the section. */
export function scrollToChapter(id: string) {
  if (typeof window === "undefined") return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(max-width: 767px)").matches;

  if (!reduced && !mobile && lenis) {
    lenis.scrollTo(chapterScrollY(id), { duration: 1.6 });
    return;
  }
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  } else {
    window.scrollTo({ top: chapterScrollY(id), behavior: "smooth" });
  }
}
