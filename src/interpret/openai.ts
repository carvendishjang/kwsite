import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { FONTS } from "../data/fonts.js";
import { COLUMN_KINDS, ContentSpec, DECORATIONS, LAYOUTS, MOODS, StyleSpec } from "../spec/schema.js";
import { normalizeContent, normalizeStyle } from "./normalize.js";
import type { Interpreter } from "./types.js";

const CONTENT_SYSTEM = `You write the content for a one-page website.
You receive a subject and, usually, a list of column headings. Return a ContentSpec.

Rules:
- If headings are given, return exactly one column per heading, in the same order, with the heading text unchanged. Do not add or drop columns.
- If no headings are given, choose 4-6 sensible columns for the subject.
- Choose each column's "kind" from: ${COLUMN_KINDS.join(", ")}.
  list = rows with a price/label on the right (menus, pricing); cards = services/features/products;
  gallery = visual work; text = story/about prose; timeline = history/events; contact = address/hours/email pairs; faq = questions.
- Follow any notes given for a column; they are the user's facts and must appear in the content.
- Write specific, concrete, believable copy for this subject. No lorem ipsum, no "[placeholder]".
- 3-6 items for most columns. Keep item bodies to 1-3 sentences. "text" items may be longer paragraphs.
- Do not invent real-world facts you cannot know (exact phone numbers, real street addresses); use clearly generic ones such as "123 Example Street".
- Write in the language of the subject and headings.`;

const fontList = FONTS.map((f) => `${f.name} (${f.category}: ${f.tags.join(", ")})`).join("\n");

const STYLE_SYSTEM = `You are an art director. You receive style keywords for a website and return a StyleSpec.
The keywords decide the visual design only. The subject is given as context so the look suits it, but follow the style keywords first.

Guidance:
- palette.baseHue is an OKLCH hue in degrees (≈ 25 red, 60 orange, 95 yellow, 145 green, 200 teal, 255 blue, 300 purple, 345 pink).
- scheme: "dark" for night/neon/cyberpunk/luxury-dark keywords, otherwise usually "light".
- mood: one of ${MOODS.join(", ")}.
- layout: one of ${LAYOUTS.join(", ")}.
  landing = centered hero, alternating bands; editorial = magazine, sticky side headings; grid-showcase = bento tiles;
  sidebar-nav = fixed left navigation; single-column = narrow, quiet, text-first.
- decoration: one of ${DECORATIONS.join(", ")}.
- Pick fonts ONLY from this list; heading and body fonts should contrast but pair well. Body font should be readable (sans or serif, rarely display):
${fontList}`;

export function createOpenAIInterpreter(model: string): Interpreter {
  const client = new OpenAI(); // reads OPENAI_API_KEY

  async function ask<T>(system: string, user: string, schema: typeof ContentSpec | typeof StyleSpec, name: string): Promise<T> {
    const res = await client.responses.parse({
      model,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      text: { format: zodTextFormat(schema, name) },
    });
    if (!res.output_parsed) {
      throw new Error(`OpenAI returned no parsed ${name} (status: ${res.status}).`);
    }
    return res.output_parsed as T;
  }

  return {
    name: `openai:${model}`,

    async content(input) {
      const lines = [`Subject: ${input.subject}`];
      if (input.siteName) lines.push(`Site name: ${input.siteName}`);
      if (input.columns.length) {
        lines.push("Columns:");
        input.columns.forEach((c, i) => lines.push(`${i + 1}. ${c.heading}${c.notes ? ` — notes: ${c.notes}` : ""}`));
      } else lines.push("Columns: (none given, choose them)");
      const raw = await ask(CONTENT_SYSTEM, lines.join("\n"), ContentSpec, "content_spec");
      return normalizeContent(raw, input);
    },

    async style(keywords, { subject }) {
      const user = `Style keywords: ${keywords.join(", ")}${subject ? `\nSubject (context only): ${subject}` : ""}`;
      const raw = await ask(STYLE_SYSTEM, user, StyleSpec, "style_spec");
      return normalizeStyle(raw);
    },
  };
}
