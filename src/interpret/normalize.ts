import type { ContentInput } from "../input.js";
import { slug } from "../render/html.js";
import { ContentSpec, StyleSpec } from "../spec/schema.js";

/**
 * Enforce the rules the generator promises, whatever the interpreter returned:
 *  - user-supplied headings are kept verbatim and in order
 *  - ids are unique, URL-safe slugs
 *  - the CTA points at a real column
 */
export function normalizeContent(raw: unknown, input: ContentInput): ContentSpec {
  const spec = ContentSpec.parse(raw);

  if (input.columns.length > 0) {
    if (spec.columns.length < input.columns.length) {
      throw new Error(
        `Interpreter returned ${spec.columns.length} columns but ${input.columns.length} were requested.`,
      );
    }
    spec.columns = input.columns.map((want, i) => ({ ...spec.columns[i]!, heading: want.heading }));
  }
  if (input.siteName) spec.siteName = input.siteName;

  const seen = new Set<string>();
  for (const c of spec.columns) {
    let id = slug(c.id || c.heading);
    for (let n = 2; seen.has(id); n++) id = `${slug(c.heading)}-${n}`;
    seen.add(id);
    c.id = id;
  }
  if (!spec.columns.some((c) => c.id === spec.hero.ctaTarget)) {
    spec.hero.ctaTarget = spec.columns[0]?.id ?? "top";
  }
  return spec;
}

export function normalizeStyle(raw: unknown): StyleSpec {
  const spec = StyleSpec.parse(raw);
  spec.palette.baseHue = ((Math.round(spec.palette.baseHue) % 360) + 360) % 360;
  return spec;
}
