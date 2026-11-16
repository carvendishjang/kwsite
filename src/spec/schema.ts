import { z } from "zod";
import { FONT_NAMES } from "../data/fonts.js";

/*
 * Two independent specs:
 *   ContentSpec — WHAT the site says (from content keywords)
 *   StyleSpec   — HOW the site looks  (from style keywords)
 *
 * Every field is required; optional values use `.nullable()`. This matches
 * OpenAI Structured Outputs strict mode, where every property must be required.
 */

// ---------- Content ----------

export const COLUMN_KINDS = [
  "intro", // a lead paragraph with a few highlights
  "list", // rows with title, optional meta on the right (menus, price lists)
  "cards", // grid of cards (services, features, products)
  "gallery", // visual tiles with captions
  "text", // prose, items become sub-headed paragraphs
  "timeline", // dated entries (history, events)
  "contact", // label / value pairs (address, hours, email)
  "faq", // question / answer pairs
] as const;

export const Item = z.object({
  title: z.string(),
  body: z.string(),
  meta: z.string().nullable().describe("Short side info: a price, date, role or label. null if not useful."),
});

export const Column = z.object({
  id: z.string().describe("URL-safe slug, e.g. 'our-story'"),
  heading: z.string(),
  kind: z.enum(COLUMN_KINDS),
  intro: z.string().nullable().describe("One or two sentences shown under the heading."),
  items: z.array(Item),
});

export const ContentSpec = z.object({
  siteName: z.string(),
  tagline: z.string(),
  subject: z.string(),
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    ctaLabel: z.string(),
    ctaTarget: z.string().describe("id of the column the call-to-action button links to"),
  }),
  columns: z.array(Column),
  footer: z.string(),
});

export type ContentSpec = z.infer<typeof ContentSpec>;
export type Column = z.infer<typeof Column>;
export type Item = z.infer<typeof Item>;
export type ColumnKind = (typeof COLUMN_KINDS)[number];

// ---------- Style ----------

export const MOODS = ["minimal", "elegant", "playful", "brutalist", "retro", "futuristic", "organic", "corporate", "editorial", "cozy"] as const;
export const HARMONIES = ["mono", "analogous", "complementary", "triadic", "split"] as const;
export const LAYOUTS = ["landing", "editorial", "grid-showcase", "sidebar-nav", "single-column"] as const;
export const DECORATIONS = ["none", "grain", "grid-lines", "dots", "blobs", "scanlines", "geometric"] as const;

const FontName = z.enum(FONT_NAMES as [string, ...string[]]);

export const StyleSpec = z.object({
  mood: z.enum(MOODS),
  palette: z.object({
    baseHue: z.number().describe("0-360 hue of the primary color (OKLCH hue)"),
    harmony: z.enum(HARMONIES),
    chroma: z.enum(["muted", "balanced", "vivid"]),
    scheme: z.enum(["light", "dark"]),
  }),
  typography: z.object({
    headingFont: FontName,
    bodyFont: FontName,
    scale: z.enum(["tight", "normal", "dramatic"]),
    headingCase: z.enum(["normal", "uppercase"]),
    headingWeight: z.enum(["regular", "bold", "black"]),
  }),
  shape: z.object({
    radius: z.enum(["none", "sm", "lg", "pill"]),
    border: z.enum(["none", "thin", "thick"]),
  }),
  layout: z.enum(LAYOUTS),
  density: z.enum(["airy", "normal", "compact"]),
  cardStyle: z.enum(["flat", "outlined", "elevated", "glass"]),
  decoration: z.enum(DECORATIONS),
  motion: z.enum(["none", "subtle", "lively"]),
});

export type StyleSpec = z.infer<typeof StyleSpec>;
