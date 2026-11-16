/*
 * Curated Google Fonts. The style interpreter may only pick from this list,
 * so every generated site uses a font that exists and reads well.
 */
export interface FontDef {
  name: string;
  category: "sans" | "serif" | "display" | "mono" | "handwriting";
  weights: number[];
  tags: string[]; // moods / keywords this font suits
}

export const FONTS: FontDef[] = [
  { name: "Inter", category: "sans", weights: [400, 600, 800], tags: ["minimal", "corporate", "modern", "clean"] },
  { name: "DM Sans", category: "sans", weights: [400, 700, 900], tags: ["minimal", "friendly", "modern"] },
  { name: "Space Grotesk", category: "sans", weights: [400, 700], tags: ["futuristic", "tech", "modern"] },
  { name: "Manrope", category: "sans", weights: [400, 700, 800], tags: ["corporate", "clean", "modern"] },
  { name: "Outfit", category: "sans", weights: [400, 700, 900], tags: ["playful", "modern", "friendly"] },
  { name: "Nunito", category: "sans", weights: [400, 700, 900], tags: ["playful", "cozy", "soft", "kids"] },
  { name: "Archivo", category: "sans", weights: [400, 700, 900], tags: ["brutalist", "bold", "editorial"] },
  { name: "Work Sans", category: "sans", weights: [400, 600, 800], tags: ["corporate", "neutral"] },
  { name: "Playfair Display", category: "serif", weights: [400, 700, 900], tags: ["elegant", "luxury", "editorial", "classic"] },
  { name: "Cormorant Garamond", category: "serif", weights: [400, 600, 700], tags: ["elegant", "luxury", "romantic", "wedding"] },
  { name: "Fraunces", category: "serif", weights: [400, 700, 900], tags: ["organic", "retro", "cozy", "warm"] },
  { name: "Lora", category: "serif", weights: [400, 700], tags: ["editorial", "cozy", "literary"] },
  { name: "Source Serif 4", category: "serif", weights: [400, 700], tags: ["editorial", "news", "classic"] },
  { name: "DM Serif Display", category: "serif", weights: [400], tags: ["elegant", "editorial", "fashion"] },
  { name: "Noto Serif JP", category: "serif", weights: [400, 700, 900], tags: ["japanese", "zen", "traditional"] },
  { name: "Bebas Neue", category: "display", weights: [400], tags: ["bold", "poster", "sport", "brutalist"] },
  { name: "Orbitron", category: "display", weights: [400, 700, 900], tags: ["futuristic", "sci-fi", "cyberpunk", "space"] },
  { name: "Righteous", category: "display", weights: [400], tags: ["retro", "70s", "funky"] },
  { name: "Bungee", category: "display", weights: [400], tags: ["playful", "urban", "arcade", "loud"] },
  { name: "Abril Fatface", category: "display", weights: [400], tags: ["editorial", "fashion", "retro"] },
  { name: "Press Start 2P", category: "display", weights: [400], tags: ["pixel", "8bit", "arcade", "game"] },
  { name: "Syne", category: "display", weights: [400, 700, 800], tags: ["art", "gallery", "experimental"] },
  { name: "JetBrains Mono", category: "mono", weights: [400, 700, 800], tags: ["tech", "code", "hacker", "terminal"] },
  { name: "Space Mono", category: "mono", weights: [400, 700], tags: ["retro", "tech", "brutalist", "terminal"] },
  { name: "IBM Plex Mono", category: "mono", weights: [400, 700], tags: ["tech", "corporate", "terminal"] },
  { name: "Caveat", category: "handwriting", weights: [400, 700], tags: ["handwritten", "personal", "cozy"] },
  { name: "Pacifico", category: "handwriting", weights: [400], tags: ["surf", "beach", "retro", "playful"] },
];

export const FONT_NAMES = FONTS.map((f) => f.name);

export function getFont(name: string): FontDef {
  return FONTS.find((f) => f.name === name) ?? FONTS[0]!;
}

const FALLBACK: Record<FontDef["category"], string> = {
  sans: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  display: "system-ui, sans-serif",
  mono: "ui-monospace, 'SFMono-Regular', Menlo, monospace",
  handwriting: "cursive",
};

export function fontStack(name: string): string {
  const f = getFont(name);
  return `'${f.name}', ${FALLBACK[f.category]}`;
}

/** A single Google Fonts css2 URL covering both fonts. */
export function googleFontsUrl(names: string[]): string {
  const unique = [...new Set(names)].map(getFont);
  const families = unique.map((f) => {
    const fam = f.name.replace(/ /g, "+");
    return f.weights.length > 1 ? `family=${fam}:wght@${f.weights.join(";")}` : `family=${fam}`;
  });
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}
