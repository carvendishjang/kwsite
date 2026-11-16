import type { StyleSpec } from "../spec/schema.js";
import type { Palette } from "../tokens/color.js";

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

/**
 * Background decoration, generated procedurally from the palette.
 * Data URIs can't read CSS variables, so colors are baked in as hex.
 */
export function decorationCss(kind: StyleSpec["decoration"], pal: Palette): string {
  switch (kind) {
    case "none":
      return "";
    case "grain": {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .09 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
      return `body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:100;background-image:${svgUrl(svg)};}`;
    }
    case "grid-lines":
      return `body{background-image:linear-gradient(${pal.border} 1px,transparent 1px),linear-gradient(90deg,${pal.border} 1px,transparent 1px);background-size:48px 48px;background-attachment:fixed;}`;
    case "dots":
      return `body{background-image:radial-gradient(${pal.border} 1.2px,transparent 1.2px);background-size:22px 22px;}`;
    case "scanlines":
      return `body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:100;background:repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 1px,transparent 1px 3px);mix-blend-mode:multiply;}`;
    case "blobs":
      return `.hero{position:relative;overflow:hidden;isolation:isolate}
.hero::before,.hero::after{content:"";position:absolute;z-index:-1;border-radius:50%;filter:blur(70px);opacity:.45}
.hero::before{width:42vw;height:42vw;max-width:560px;max-height:560px;background:${pal.primary};top:-12%;right:-8%}
.hero::after{width:34vw;height:34vw;max-width:440px;max-height:440px;background:${pal.accent};bottom:-18%;left:-6%}`;
    case "geometric": {
      const [a, b, c] = pal.extras;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" fill="none" stroke-width="2" opacity=".35"><circle cx="30" cy="30" r="14" stroke="${a}"/><path d="M110 18l18 32h-36z" stroke="${b}"/><rect x="24" y="100" width="28" height="28" stroke="${c}" transform="rotate(15 38 114)"/><path d="M100 110h40M120 90v40" stroke="${a}"/></svg>`;
      return `.hero{background-image:${svgUrl(svg)};background-size:160px 160px;}`;
    }
  }
}

/** A generated tile used instead of photos in gallery sections. */
export function galleryTileSvg(index: number, pal: Palette): string {
  const cols = pal.extras;
  const c1 = cols[index % cols.length]!;
  const c2 = cols[(index + 2) % cols.length]!;
  const shapes = [
    `<circle cx="70" cy="45" r="28" fill="${c2}"/>`,
    `<path d="M0 100 L50 40 L80 75 L100 55 L100 100Z" fill="${c2}"/>`,
    `<rect x="20" y="20" width="60" height="60" rx="8" fill="${c2}" transform="rotate(12 50 50)"/>`,
    `<path d="M0 70 Q25 40 50 70 T100 70 V100 H0Z" fill="${c2}"/>`,
    `<circle cx="30" cy="70" r="22" fill="${c2}"/><circle cx="72" cy="38" r="14" fill="${c2}" opacity=".7"/>`,
  ];
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="100" fill="${c1}"/>${shapes[index % shapes.length]}</svg>`;
}
