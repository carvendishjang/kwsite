import { fontStack } from "../data/fonts.js";
import type { StyleSpec } from "../spec/schema.js";
import type { Palette } from "./color.js";

const RATIO = { tight: 1.2, normal: 1.25, dramatic: 1.414 } as const;
const SPACE = { compact: 0.75, normal: 1, airy: 1.4 } as const;
const RADIUS = { none: "0px", sm: "6px", lg: "18px", pill: "999px" } as const;
const BORDER = { none: "0px", thin: "1px", thick: "3px" } as const;
const WEIGHT = { regular: 400, bold: 700, black: 900 } as const;

/** Turn a StyleSpec + palette into CSS custom properties. */
export function tokensCss(s: StyleSpec, pal: Palette): string {
  const r = RATIO[s.typography.scale];
  // Fluid type: linear between a 360px and a 1280px viewport, clamped at both ends.
  // Big steps shrink more on phones so long headlines don't overflow.
  const step = (n: number) => {
    const base = Math.pow(r, n);
    const min = base * (n >= 3 ? 0.62 : 0.95);
    const max = base * (n >= 3 ? 1.2 : 1.05);
    const slope = (max - min) / (80 - 22.5);
    const intercept = min - slope * 22.5;
    const f = (x: number) => x.toFixed(3);
    return `clamp(${f(min)}rem, ${f(intercept)}rem + ${f(slope * 100)}vw, ${f(max)}rem)`;
  };
  const sp = SPACE[s.density];
  // Pills look odd on large cards; cap card radius.
  const cardRadius = s.shape.radius === "pill" ? "28px" : RADIUS[s.shape.radius];

  const vars: Record<string, string> = {
    "--bg": pal.bg,
    "--surface": pal.surface,
    "--surface-2": pal.surface2,
    "--text": pal.text,
    "--muted": pal.muted,
    "--border": pal.border,
    "--primary": pal.primary,
    "--on-primary": pal.onPrimary,
    "--accent": pal.accent,
    ...Object.fromEntries(pal.extras.map((c, i) => [`--extra-${i + 1}`, c])),
    "--font-heading": fontStack(s.typography.headingFont),
    "--font-body": fontStack(s.typography.bodyFont),
    "--heading-weight": String(WEIGHT[s.typography.headingWeight]),
    "--heading-case": s.typography.headingCase,
    "--step--1": step(-1),
    "--step-0": step(0),
    "--step-1": step(1),
    "--step-2": step(2),
    "--step-3": step(3),
    "--step-4": step(4),
    "--step-5": step(5),
    "--space-1": `${0.25 * sp}rem`,
    "--space-2": `${0.5 * sp}rem`,
    "--space-3": `${1 * sp}rem`,
    "--space-4": `${1.5 * sp}rem`,
    "--space-5": `${2.5 * sp}rem`,
    "--space-6": `${4 * sp}rem`,
    "--space-7": `${6.5 * sp}rem`,
    "--radius": cardRadius,
    "--radius-btn": RADIUS[s.shape.radius],
    "--border-w": BORDER[s.shape.border],
  };

  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `:root {\n  color-scheme: ${s.palette.scheme};\n${body}\n}\n`;
}
