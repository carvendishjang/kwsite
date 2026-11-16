# kwsite

Generate a one-page static website from two groups of keywords:

1. **Content keywords**: the subject plus the column headings (each column becomes a nav item and a section).
2. **Style keywords**: the look: colors, fonts, layout, shapes, decoration, motion.

The two groups never mix. Content decides *what* the page says; style decides *how* it looks.

```
content keywords → content interpreter → content.json ┐
                                                       ├→ renderer → index.html + styles.css
style keywords   → style interpreter   → style.json  ──┘   (palette with checked contrast, type scale, layout)
```

## Setup

```bash
npm install
cp .env.example .env     # set OPENAI_API_KEY and KWSITE_MODEL
```

`KWSITE_MODEL` can be any OpenAI model your key can use that supports Structured Outputs.
Without a key, kwsite falls back to the offline **rules** engine: the style comes from a keyword
dictionary, and the content keeps your headings but uses placeholder text for you to edit.

## Usage

```bash
# subject ; columns (notes in brackets are facts the copy must include)
npm run gen -- -c "ramen shop in Osaka; Menu (tonkotsu, shoyu, gyoza), Our Story, FAQ, Visit Us" \
               -s "cyberpunk, neon, dark, bold"

# several looks for the same content → dist/variant-1, variant-2, ...
npm run gen -- -c "jazz bar; Lineup, Drinks, Visit" -s "art deco, gold, dark" -s "playful, pastel"

# keep the content, change only the style (no content call)
npm run gen -- --reuse-content dist/content.json -s "minimal, japanese, paper"

# keep the style, new content
npm run gen -- --reuse-style dist/style.json -c "bakery; Breads, Cakes, Order"

# or put everything in a file
npm run gen -- examples/ramen.yaml

npm run preview          # serve ./dist
```

Options: `--engine openai|rules|auto`, `--model`, `--out`, `--seed` (for the rules engine). See `npm run gen -- --help`.

You can hand-edit `content.json` or `style.json` and re-render with `--reuse-content` / `--reuse-style`.

## What the specs control

| content.json | style.json |
|---|---|
| site name, tagline, hero text, CTA | mood, layout (`landing`, `editorial`, `grid-showcase`, `sidebar-nav`, `single-column`) |
| columns: heading, kind (`intro`, `list`, `cards`, `gallery`, `text`, `timeline`, `contact`, `faq`), items | palette (hue, harmony, chroma, light/dark), fonts (curated Google Fonts), type scale |
| footer | radius, borders, density, card style, decoration, motion |

## Code map

```
src/cli.ts                 command line
src/input.ts               parsing the two keyword groups (CLI string / YAML)
src/spec/schema.ts         ContentSpec + StyleSpec (Zod, OpenAI strict-mode compatible)
src/interpret/openai.ts    keywords → specs with OpenAI Structured Outputs
src/interpret/rules.ts     offline keyword → spec engine
src/interpret/normalize.ts guarantees: headings verbatim, unique ids, valid CTA
src/data/                  font list, style lexicon
src/tokens/                OKLCH palette with WCAG contrast correction, CSS variables
src/render/                components per column kind, layouts, decorations, page
```

`npm test` checks every palette combination for WCAG contrast. `npm run typecheck` type-checks.
