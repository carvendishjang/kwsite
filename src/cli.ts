#!/usr/bin/env node
import { config as loadEnv } from "dotenv";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { parseContentString, parseStyleString, readConfig, type ContentInput, type StyleInput } from "./input.js";
import { createOpenAIInterpreter } from "./interpret/openai.js";
import { normalizeStyle } from "./interpret/normalize.js";
import { rulesInterpreter } from "./interpret/rules.js";
import type { Interpreter } from "./interpret/types.js";
import { renderSite } from "./render/page.js";
import { ContentSpec, type StyleSpec } from "./spec/schema.js";

loadEnv({ quiet: true });

const HELP = `kwsite: generate a one-page static site from two groups of keywords

Usage:
  kwsite --content "<subject>; <Heading>, <Heading (notes)>, ..." --style "<kw>, <kw>, ..."
  kwsite site.yaml

Options:
  -c, --content <text>       Group 1: subject, then ';', then comma-separated column headings
  -s, --style <text>         Group 2: style keywords (repeat the flag to make variants)
      --reuse-content <file> Use an existing content.json (skip the content step)
      --reuse-style <file>   Use an existing style.json  (skip the style step)
  -o, --out <dir>            Output directory (default: dist)
  -e, --engine <name>        openai | rules | auto (default: auto = openai if OPENAI_API_KEY is set)
  -m, --model <name>         OpenAI model (default: $KWSITE_MODEL)
      --seed <n>             Seed for the rules engine (default: 1)
  -h, --help

Examples:
  kwsite -c "ramen shop in Osaka; Menu (tonkotsu, shoyu, gyoza), Our Story, Location" -s "cyberpunk, neon, dark"
  kwsite --reuse-content dist/content.json -s "minimal, japanese, paper"
  kwsite -c "jazz bar; Lineup, Drinks, Visit" -s "art deco, gold, dark" -s "playful, pastel"
`;

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      content: { type: "string", short: "c" },
      style: { type: "string", short: "s", multiple: true },
      "reuse-content": { type: "string" },
      "reuse-style": { type: "string" },
      out: { type: "string", short: "o", default: "dist" },
      engine: { type: "string", short: "e", default: "auto" },
      model: { type: "string", short: "m" },
      seed: { type: "string", default: "1" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help) return void console.log(HELP);

  // ---- gather the two keyword groups ----
  let contentInput: ContentInput | null = null;
  let styleInputs: StyleInput[] = [];
  if (positionals[0]) {
    const cfg = await readConfig(positionals[0]);
    contentInput = cfg.content;
    styleInputs = cfg.styles;
  }
  if (values.content) contentInput = parseContentString(values.content);
  if (values.style?.length) styleInputs = values.style.map(parseStyleString);

  const reuseContent = values["reuse-content"];
  const reuseStyle = values["reuse-style"];
  if (!contentInput && !reuseContent) fail("Missing content keywords: pass --content, a site.yaml, or --reuse-content.");
  if (!styleInputs.length && !reuseStyle) fail("Missing style keywords: pass --style, a site.yaml, or --reuse-style.");

  const interpreter = pickInterpreter(values.engine!, values.model);
  const seed = Number(values.seed) || 1;
  const out = values.out!;

  // ---- content (group 1) ----
  let content: ContentSpec;
  if (reuseContent) {
    content = ContentSpec.parse(JSON.parse(await readFile(reuseContent, "utf8")));
    log(`content  reused ${reuseContent}`);
  } else {
    log(`content  ${interpreter.name} ← "${contentInput!.subject}" [${contentInput!.columns.map((c) => c.heading).join(", ")}]`);
    content = await interpreter.content(contentInput!, { seed });
  }

  // ---- style (group 2), one or more variants ----
  const styles: { label: string; spec: StyleSpec }[] = [];
  if (reuseStyle) {
    styles.push({ label: "reused", spec: normalizeStyle(JSON.parse(await readFile(reuseStyle, "utf8"))) });
    log(`style    reused ${reuseStyle}`);
  } else {
    // Style calls are independent of each other, so run them in parallel.
    const specs = await Promise.all(
      styleInputs.map((kw) => {
        log(`style    ${interpreter.name} ← ${kw.join(", ")}`);
        return interpreter.style(kw, { seed, subject: content.subject });
      }),
    );
    specs.forEach((spec, i) => styles.push({ label: styleInputs[i]!.join(", "), spec }));
  }

  // ---- render ----
  const multi = styles.length > 1;
  for (const [i, { label, spec }] of styles.entries()) {
    const dir = multi ? join(out, `variant-${i + 1}`) : out;
    await mkdir(dir, { recursive: true });
    const site = renderSite(content, spec);
    await Promise.all([
      writeFile(join(dir, "index.html"), site["index.html"]),
      writeFile(join(dir, "styles.css"), site["styles.css"]),
      writeFile(join(dir, "content.json"), JSON.stringify(content, null, 2) + "\n"),
      writeFile(join(dir, "style.json"), JSON.stringify(spec, null, 2) + "\n"),
    ]);
    log(`wrote    ${join(dir, "index.html")}  (${spec.mood}, ${spec.layout}, ${spec.palette.scheme}${multi ? `: ${label}` : ""})`);
  }
}

function pickInterpreter(engine: string, model: string | undefined): Interpreter {
  const hasKey = !!process.env.OPENAI_API_KEY;
  const useOpenAI = engine === "openai" || (engine === "auto" && hasKey);
  if (engine !== "openai" && engine !== "rules" && engine !== "auto") fail(`Unknown engine "${engine}".`);
  if (!useOpenAI) {
    if (engine === "auto") log("engine   OPENAI_API_KEY not set, using offline rules engine (placeholder copy)");
    return rulesInterpreter;
  }
  if (!hasKey) fail("OPENAI_API_KEY is not set. Put it in .env or your environment.");
  const m = model ?? process.env.KWSITE_MODEL;
  if (!m) fail("No OpenAI model set. Pass --model <name> or set KWSITE_MODEL in .env.");
  return createOpenAIInterpreter(m);
}

function log(msg: string) {
  console.error(msg);
}

function fail(msg: string): never {
  console.error(`error: ${msg}\n\nRun with --help for usage.`);
  process.exit(1);
}

main().catch((err) => {
  console.error(`error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
