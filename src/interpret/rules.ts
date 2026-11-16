import { FONT_NAMES } from "../data/fonts.js";
import { KIND_HINTS, STYLE_LEXICON, type StyleVote } from "../data/lexicon.js";
import type { ContentInput } from "../input.js";
import type { ColumnKind, ContentSpec, StyleSpec } from "../spec/schema.js";
import { normalizeContent, normalizeStyle } from "./normalize.js";
import type { Interpreter } from "./types.js";

/*
 * Offline engine: no API key, deterministic for a given seed.
 * Style comes from the keyword lexicon. Content keeps your headings and notes,
 * but body text is clearly marked placeholder copy for you to edit in content.json.
 */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** If no keyword voted for a layout, choose one that suits the mood. */
const MOOD_LAYOUT: Record<StyleSpec["mood"], StyleSpec["layout"]> = {
  minimal: "single-column",
  elegant: "editorial",
  playful: "landing",
  brutalist: "grid-showcase",
  retro: "landing",
  futuristic: "landing",
  organic: "landing",
  corporate: "landing",
  editorial: "editorial",
  cozy: "single-column",
};

const pick = <T>(r: () => number, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)]!;

function guessKind(heading: string): ColumnKind {
  return KIND_HINTS.find(([re]) => re.test(heading))?.[1] ?? "cards";
}

function placeholderContent(input: ContentInput): ContentSpec {
  const subject = input.subject || "Your site";
  const columns = (input.columns.length ? input.columns : [{ heading: "About", notes: null }, { heading: "Services", notes: null }, { heading: "Contact", notes: null }]).map(
    (col) => {
      const kind = guessKind(col.heading);
      const fromNotes = col.notes
        ?.split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const titles = fromNotes?.length ? fromNotes : [1, 2, 3].map((n) => `${col.heading} item ${n}`);
      return {
        id: col.heading,
        heading: col.heading,
        kind,
        intro: `A short introduction to ${col.heading.toLowerCase()}. Edit this in content.json.`,
        items: titles.map((t) => ({
          title: t,
          body: `Describe ${t.toLowerCase()} here.`,
          meta: kind === "list" ? "—" : kind === "timeline" ? "Year" : null,
        })),
      };
    },
  );
  return {
    siteName: input.siteName ?? subject.replace(/\b\w/g, (c) => c.toUpperCase()),
    tagline: subject,
    subject,
    hero: {
      headline: input.siteName ?? subject.replace(/\b\w/g, (c) => c.toUpperCase()),
      subheadline: `A site about ${subject}. Replace this text with your own.`,
      ctaLabel: columns[0] ? `See ${columns[0].heading}` : "Learn more",
      ctaTarget: columns[0]?.id ?? "top",
    },
    columns,
    footer: `© ${new Date().getFullYear()} ${input.siteName ?? subject}`,
  };
}

function tallyStyle(keywords: string[], seed: number): StyleSpec {
  const r = rng(seed ^ hashString(keywords.join("|")));
  const words = keywords.flatMap((k) => [k.toLowerCase(), ...k.toLowerCase().split(/\s+/)]);
  const votes: StyleVote[] = [...new Set(words)].map((w) => STYLE_LEXICON[w]).filter((v): v is StyleVote => !!v);

  const tally = <K extends keyof StyleVote>(key: K, options: readonly NonNullable<StyleVote[K]>[]): NonNullable<StyleVote[K]> => {
    const counts = new Map<NonNullable<StyleVote[K]>, number>();
    for (const v of votes) if (v[key] !== undefined) counts.set(v[key]!, (counts.get(v[key]!) ?? 0) + 1);
    if (counts.size === 0) return pick(r, options);
    const max = Math.max(...counts.values());
    return pick(r, [...counts].filter(([, n]) => n === max).map(([k]) => k));
  };

  // Hues are averaged on the circle so "red + purple" lands in between.
  const hues = votes.map((v) => v.hue).filter((h): h is number => h !== undefined);
  const baseHue = hues.length
    ? (Math.atan2(
        hues.reduce((s, h) => s + Math.sin((h * Math.PI) / 180), 0),
        hues.reduce((s, h) => s + Math.cos((h * Math.PI) / 180), 0),
      ) * 180) / Math.PI
    : Math.floor(r() * 360);

  const mood = tally("mood", ["minimal", "elegant", "playful", "organic", "corporate", "editorial", "cozy"]);
  return {
    mood,
    palette: {
      baseHue,
      harmony: tally("harmony", ["analogous", "complementary", "split"]),
      chroma: tally("chroma", ["muted", "balanced"]),
      scheme: tally("scheme", ["light"]),
    },
    typography: {
      headingFont: tally("headingFont", FONT_NAMES.filter((f) => f !== "Press Start 2P")),
      bodyFont: tally("bodyFont", ["Inter", "DM Sans", "Lora", "Manrope", "Source Serif 4"]),
      scale: tally("scale", ["tight", "normal", "dramatic"]),
      headingCase: tally("headingCase", ["normal"]),
      headingWeight: tally("headingWeight", ["bold", "black"]),
    },
    shape: { radius: tally("radius", ["sm", "lg"]), border: tally("border", ["thin"]) },
    layout: votes.some((v) => v.layout) ? tally("layout", []) : MOOD_LAYOUT[mood],
    density: tally("density", ["normal", "airy"]),
    cardStyle: tally("cardStyle", ["flat", "outlined", "elevated"]),
    decoration: tally("decoration", ["none", "dots", "grain", "blobs", "geometric"]),
    motion: tally("motion", ["subtle"]),
  };
}

export const rulesInterpreter: Interpreter = {
  name: "rules",
  async content(input) {
    return normalizeContent(placeholderContent(input), input);
  },
  async style(keywords, { seed }) {
    return normalizeStyle(tallyStyle(keywords, seed));
  },
};
