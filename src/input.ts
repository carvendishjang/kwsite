import { readFile } from "node:fs/promises";
import YAML from "yaml";

/** Group 1: subject + columns (headings). */
export interface ContentInput {
  subject: string;
  siteName: string | null;
  columns: { heading: string; notes: string | null }[];
}

/** Group 2: free-form style keywords. */
export type StyleInput = string[];

/**
 * CLI form:  "ramen shop in Osaka; Menu, Our Story, Location, Reservations"
 *   - text before ';' is the subject
 *   - comma-separated headings after ';' are the columns
 *   - a heading may carry notes in brackets: "Menu (tonkotsu, shoyu, gyoza)"
 */
export function parseContentString(s: string): ContentInput {
  const [subjectPart, columnsPart = ""] = splitOnce(s, ";");
  const columns = splitTopLevel(columnsPart)
    .map((raw) => {
      const m = raw.match(/^(.*?)\s*\((.*)\)\s*$/);
      return m ? { heading: m[1]!.trim(), notes: m[2]!.trim() || null } : { heading: raw.trim(), notes: null };
    })
    .filter((c) => c.heading);
  return { subject: subjectPart.trim(), siteName: null, columns };
}

export function parseStyleString(s: string): StyleInput {
  return s
    .split(/[,;]/)
    .map((k) => k.trim())
    .filter(Boolean);
}

/**
 * YAML form:
 *   content:
 *     subject: ramen shop in Osaka
 *     siteName: Menya Hoshi          # optional
 *     columns:
 *       - Menu: tonkotsu, shoyu, gyoza  # heading with notes
 *       - Our Story
 *   style: [cyberpunk, neon, dark]   # or a list of lists for variants
 */
export async function readConfig(path: string): Promise<{ content: ContentInput | null; styles: StyleInput[] }> {
  const raw = YAML.parse(await readFile(path, "utf8")) ?? {};
  let content: ContentInput | null = null;

  if (typeof raw.content === "string") {
    content = parseContentString(raw.content);
  } else if (raw.content && typeof raw.content === "object") {
    const cols = Array.isArray(raw.content.columns) ? raw.content.columns : [];
    content = {
      subject: String(raw.content.subject ?? ""),
      siteName: raw.content.siteName ? String(raw.content.siteName) : null,
      columns: cols.map((c: unknown) => {
        if (typeof c === "string") return { heading: c, notes: null };
        if (c && typeof c === "object") {
          const [k, v] = Object.entries(c)[0] ?? ["", null];
          return { heading: String(k), notes: v == null ? null : String(v) };
        }
        throw new Error(`Invalid column entry in ${path}: ${JSON.stringify(c)}`);
      }),
    };
  }

  let styles: StyleInput[] = [];
  if (typeof raw.style === "string") styles = [parseStyleString(raw.style)];
  else if (Array.isArray(raw.style)) {
    styles = raw.style.every((x: unknown) => Array.isArray(x))
      ? raw.style.map((v: unknown[]) => v.map(String))
      : [raw.style.map(String)];
  }
  return { content, styles };
}

function splitOnce(s: string, sep: string): [string, string] {
  const i = s.indexOf(sep);
  return i < 0 ? [s, ""] : [s.slice(0, i), s.slice(i + 1)];
}

/** Split on commas that are not inside parentheses. */
function splitTopLevel(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}
