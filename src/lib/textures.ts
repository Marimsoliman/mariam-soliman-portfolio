"use client";

import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   Minimal CanvasTexture helpers — only what the scene needs:
   atmospheric color fields + font gating.
   All editorial content now lives in the DOM.
   ───────────────────────────────────────────────────────────── */

const cache = new Map<string, THREE.CanvasTexture>();

function canvas(w: number, h: number) {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  return { el, ctx: el.getContext("2d")! };
}

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function register(key: string, el: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(el);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}

/* ─────────────────────────────────────────────────────────────
   COLOR FIELDS — soft radial washes for chapter art direction
   ───────────────────────────────────────────────────────────── */

export function getColorFieldTexture(hex: string): THREE.CanvasTexture {
  const key = "field:" + hex;
  const hit = cache.get(key);
  if (hit) return hit;

  const S = 512;
  const { ctx } = canvas(S, S);
  const g = ctx.createRadialGradient(S / 2, S / 2, S * 0.02, S / 2, S / 2, S / 2);
  g.addColorStop(0, hexA(hex, 0.95));
  g.addColorStop(0.32, hexA(hex, 0.55));
  g.addColorStop(0.7, hexA(hex, 0.14));
  g.addColorStop(1, hexA(hex, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  return register(key, ctx.canvas);
}

/* ─────────────────────────────────────────────────────────────
   FONT GATING — wait for web fonts before first paint
   ───────────────────────────────────────────────────────────── */

export function getFontsReady(): Promise<void> {
  const doc = document as Document & { fonts?: FontFaceSet };
  if (doc.fonts?.ready) return doc.fonts.ready.then(() => undefined);
  return Promise.resolve();
}
