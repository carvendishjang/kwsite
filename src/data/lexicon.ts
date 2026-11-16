import type { ColumnKind, StyleSpec } from "../spec/schema.js";

/*
 * Offline keyword knowledge used by the rules engine.
 * Each style word votes for traits; the votes are tallied into a StyleSpec.
 */

export interface StyleVote {
  hue?: number;
  mood?: StyleSpec["mood"];
  harmony?: StyleSpec["palette"]["harmony"];
  chroma?: StyleSpec["palette"]["chroma"];
  scheme?: StyleSpec["palette"]["scheme"];
  headingFont?: string;
  bodyFont?: string;
  scale?: StyleSpec["typography"]["scale"];
  headingCase?: StyleSpec["typography"]["headingCase"];
  headingWeight?: StyleSpec["typography"]["headingWeight"];
  radius?: StyleSpec["shape"]["radius"];
  border?: StyleSpec["shape"]["border"];
  layout?: StyleSpec["layout"];
  density?: StyleSpec["density"];
  cardStyle?: StyleSpec["cardStyle"];
  decoration?: StyleSpec["decoration"];
  motion?: StyleSpec["motion"];
}

export const STYLE_LEXICON: Record<string, StyleVote> = {
  // colours
  red: { hue: 25, chroma: "vivid" },
  orange: { hue: 55 },
  yellow: { hue: 95 },
  gold: { hue: 85, chroma: "balanced" },
  green: { hue: 145 },
  teal: { hue: 195 },
  blue: { hue: 255 },
  navy: { hue: 260, scheme: "dark", chroma: "balanced" },
  purple: { hue: 300 },
  pink: { hue: 350 },
  pastel: { chroma: "muted", scheme: "light", radius: "lg", mood: "playful" },
  monochrome: { harmony: "mono", chroma: "muted" },
  colorful: { harmony: "triadic", chroma: "vivid" },
  vibrant: { chroma: "vivid", harmony: "complementary" },
  earthy: { hue: 60, chroma: "muted", mood: "organic" },
  // light / dark
  dark: { scheme: "dark" },
  night: { scheme: "dark", hue: 270 },
  light: { scheme: "light" },
  bright: { scheme: "light", chroma: "vivid" },
  // moods & aesthetics
  minimal: { mood: "minimal", chroma: "muted", decoration: "none", density: "airy", cardStyle: "flat", layout: "single-column", headingFont: "Inter", bodyFont: "Inter" },
  clean: { mood: "minimal", decoration: "none", cardStyle: "outlined" },
  elegant: { mood: "elegant", headingFont: "Cormorant Garamond", bodyFont: "Lora", chroma: "muted", density: "airy", headingWeight: "regular" },
  luxury: { mood: "elegant", hue: 85, scheme: "dark", headingFont: "Playfair Display", bodyFont: "Manrope", chroma: "muted", radius: "none" },
  playful: { mood: "playful", radius: "pill", chroma: "vivid", harmony: "triadic", headingFont: "Outfit", bodyFont: "Nunito", motion: "lively", decoration: "blobs" },
  fun: { mood: "playful", motion: "lively", radius: "lg" },
  kids: { mood: "playful", headingFont: "Bungee", bodyFont: "Nunito", radius: "pill", chroma: "vivid" },
  brutalist: { mood: "brutalist", radius: "none", border: "thick", headingFont: "Archivo", bodyFont: "Space Mono", headingCase: "uppercase", headingWeight: "black", chroma: "vivid", harmony: "complementary", layout: "grid-showcase", cardStyle: "outlined" },
  bold: { headingWeight: "black", scale: "dramatic" },
  retro: { mood: "retro", headingFont: "Righteous", bodyFont: "DM Sans", hue: 50, harmony: "analogous", decoration: "grain" },
  vintage: { mood: "retro", headingFont: "Fraunces", bodyFont: "Lora", chroma: "muted", decoration: "grain" },
  "70s": { mood: "retro", hue: 55, headingFont: "Righteous", harmony: "analogous", radius: "pill" },
  "80s": { mood: "retro", hue: 320, scheme: "dark", chroma: "vivid", decoration: "grid-lines" },
  pixel: { mood: "retro", headingFont: "Press Start 2P", bodyFont: "Space Mono", radius: "none", decoration: "scanlines" },
  arcade: { mood: "retro", headingFont: "Press Start 2P", scheme: "dark", chroma: "vivid", decoration: "scanlines" },
  futuristic: { mood: "futuristic", headingFont: "Space Grotesk", bodyFont: "Inter", scheme: "dark", cardStyle: "glass", decoration: "grid-lines" },
  cyberpunk: { mood: "futuristic", scheme: "dark", hue: 320, chroma: "vivid", harmony: "complementary", headingFont: "Orbitron", bodyFont: "Space Grotesk", headingCase: "uppercase", decoration: "scanlines", cardStyle: "glass", radius: "none" },
  neon: { scheme: "dark", chroma: "vivid", mood: "futuristic", motion: "lively" },
  "sci-fi": { mood: "futuristic", headingFont: "Orbitron", scheme: "dark", hue: 210 },
  space: { scheme: "dark", hue: 270, headingFont: "Orbitron", decoration: "dots" },
  tech: { mood: "futuristic", headingFont: "Space Grotesk", bodyFont: "IBM Plex Mono", decoration: "grid-lines" },
  terminal: { mood: "brutalist", scheme: "dark", hue: 145, headingFont: "JetBrains Mono", bodyFont: "JetBrains Mono", radius: "none", decoration: "scanlines" },
  organic: { mood: "organic", hue: 135, chroma: "muted", headingFont: "Fraunces", bodyFont: "DM Sans", radius: "lg", decoration: "blobs" },
  nature: { mood: "organic", hue: 140 },
  forest: { mood: "organic", hue: 150, scheme: "dark" },
  ocean: { hue: 220, harmony: "analogous", decoration: "blobs" },
  beach: { hue: 200, headingFont: "Pacifico", mood: "playful" },
  cozy: { mood: "cozy", hue: 50, chroma: "muted", headingFont: "Fraunces", bodyFont: "Nunito", radius: "lg", decoration: "grain" },
  warm: { hue: 45, harmony: "analogous" },
  cool: { hue: 230, harmony: "analogous" },
  corporate: { mood: "corporate", headingFont: "Manrope", bodyFont: "Inter", hue: 250, chroma: "balanced", layout: "landing", cardStyle: "elevated", decoration: "none" },
  professional: { mood: "corporate", cardStyle: "elevated", decoration: "none" },
  editorial: { mood: "editorial", layout: "editorial", headingFont: "DM Serif Display", bodyFont: "Source Serif 4", chroma: "muted" },
  magazine: { mood: "editorial", layout: "editorial", headingFont: "Abril Fatface", scale: "dramatic" },
  newspaper: { mood: "editorial", layout: "editorial", headingFont: "Playfair Display", bodyFont: "Source Serif 4", harmony: "mono", chroma: "muted" },
  japanese: { mood: "minimal", headingFont: "Noto Serif JP", bodyFont: "Noto Serif JP", hue: 25, chroma: "muted", density: "airy", decoration: "none" },
  zen: { mood: "minimal", density: "airy", chroma: "muted", motion: "subtle", layout: "single-column" },
  paper: { scheme: "light", decoration: "grain", chroma: "muted" },
  handmade: { headingFont: "Caveat", decoration: "grain", mood: "cozy" },
  art: { mood: "editorial", headingFont: "Syne", layout: "grid-showcase" },
  gallery: { layout: "grid-showcase", density: "airy" },
  portfolio: { layout: "grid-showcase" },
  // shape / layout / motion words
  rounded: { radius: "lg" },
  sharp: { radius: "none" },
  geometric: { decoration: "geometric", radius: "none" },
  glass: { cardStyle: "glass", decoration: "blobs" },
  sidebar: { layout: "sidebar-nav" },
  docs: { layout: "sidebar-nav", mood: "minimal" },
  bento: { layout: "grid-showcase" },
  spacious: { density: "airy" },
  compact: { density: "compact" },
  dense: { density: "compact" },
  animated: { motion: "lively" },
  calm: { motion: "subtle", chroma: "muted" },
  static: { motion: "none" },
  uppercase: { headingCase: "uppercase" },
  serif: { headingFont: "Playfair Display", bodyFont: "Lora" },
  mono: { headingFont: "JetBrains Mono", bodyFont: "IBM Plex Mono" },
  grain: { decoration: "grain" },
  dots: { decoration: "dots" },
};

/** Content heading words → which column kind suits them. */
export const KIND_HINTS: [RegExp, ColumnKind][] = [
  [/menu|price|pricing|plans|rates|drinks|wine|beer|food|dishes|lineup/i, "list"],
  [/gallery|photo|portfolio|work|projects|showcase|lookbook/i, "gallery"],
  [/story|about|history of|philosophy|mission|who we are|blog|article/i, "text"],
  [/history|timeline|journey|events|schedule|agenda|milestones|news/i, "timeline"],
  [/contact|location|visit|find us|hours|reservations?|booking|address/i, "contact"],
  [/faq|questions|q&a|help/i, "faq"],
  [/welcome|intro|overview|at a glance|why/i, "intro"],
];
