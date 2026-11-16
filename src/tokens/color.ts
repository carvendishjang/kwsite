import { clampChroma, formatHex, wcagContrast, type Oklch } from "culori";
import type { StyleSpec } from "../spec/schema.js";

export interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  onPrimary: string;
  accent: string;
  /** a few extra hues for gallery tiles / decorations */
  extras: string[];
}

const HARMONY_OFFSET: Record<StyleSpec["palette"]["harmony"], number[]> = {
  mono: [0, 0, 0],
  analogous: [30, -30, 60],
  complementary: [180, 160, 200],
  triadic: [120, 240, 60],
  split: [150, 210, 30],
};

const CHROMA: Record<StyleSpec["palette"]["chroma"], number> = {
  muted: 0.05,
  balanced: 0.12,
  vivid: 0.2,
};

const norm = (h: number) => ((h % 360) + 360) % 360;
const ok = (l: number, c: number, h: number): Oklch => ({ mode: "oklch", l, c, h: norm(h) });
const hex = (c: Oklch) => formatHex(clampChroma(c, "oklch"));

/**
 * Move `fg` lightness away from `bg` until the WCAG contrast reaches `min`.
 * This is what guarantees readable text whatever the keywords were.
 */
function ensureContrast(fg: Oklch, bg: string, min: number, darker: boolean): Oklch {
  let c = { ...fg };
  for (let i = 0; i < 60 && wcagContrast(hex(c), bg) < min; i++) {
    c = { ...c, l: Math.min(1, Math.max(0, c.l + (darker ? -0.015 : 0.015))) };
  }
  return c;
}

export function buildPalette(p: StyleSpec["palette"]): Palette {
  const h = norm(p.baseHue);
  const chroma = CHROMA[p.chroma];
  const dark = p.scheme === "dark";
  const [o1, o2, o3] = HARMONY_OFFSET[p.harmony] as [number, number, number];
  const accentHue = h + o1;

  // Neutrals are tinted slightly toward the base hue so they feel related.
  const tint = Math.min(chroma * 0.25, 0.03);
  const bg = hex(ok(dark ? 0.17 : 0.985, tint, h));
  const surface = hex(ok(dark ? 0.215 : 0.955, tint * 1.3, h));
  const surface2 = hex(ok(dark ? 0.26 : 0.92, tint * 1.6, h));
  const border = hex(ok(dark ? 0.34 : 0.86, tint * 1.5, h));

  const text = hex(ensureContrast(ok(dark ? 0.95 : 0.22, tint, h), bg, 7, !dark));
  const muted = hex(ensureContrast(ok(dark ? 0.75 : 0.45, tint * 1.5, h), bg, 4.5, !dark));

  // Primary is used for links and buttons, so it must also read as text on bg.
  const primaryC = ensureContrast(ok(dark ? 0.74 : 0.55, chroma, h), bg, 4.5, !dark);
  const primary = hex(primaryC);
  const onPrimary =
    wcagContrast("#ffffff", primary) >= wcagContrast("#111111", primary) ? "#ffffff" : "#111111";

  const accent = hex(ensureContrast(ok(dark ? 0.78 : 0.6, chroma * 1.1, accentHue), bg, 3, !dark));

  const extras = [h, accentHue, h + o2, h + o3, h + o1 / 2].map((eh, i) =>
    hex(ok(dark ? 0.45 + i * 0.06 : 0.62 + i * 0.05, Math.max(chroma, 0.06), eh)),
  );

  return { bg, surface, surface2, text, muted, border, primary, onPrimary, accent, extras };
}
