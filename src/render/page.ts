import { googleFontsUrl } from "../data/fonts.js";
import type { ContentSpec, StyleSpec } from "../spec/schema.js";
import { buildPalette } from "../tokens/color.js";
import { tokensCss } from "../tokens/css.js";
import { renderColumn, renderFooter, renderHero, renderNav } from "./components.js";
import { esc, html } from "./html.js";
import { siteCss } from "./styles.js";

export interface RenderedSite {
  "index.html": string;
  "styles.css": string;
}

/** Content decides WHAT is on the page; style decides HOW it looks. */
export function renderSite(content: ContentSpec, style: StyleSpec): RenderedSite {
  const pal = buildPalette(style.palette);
  const css = siteCss(tokensCss(style, pal), style, pal);
  const fonts = googleFontsUrl([style.typography.headingFont, style.typography.bodyFont]);

  const page = html`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(content.siteName)} — ${esc(content.tagline)}</title>
  <meta name="description" content="${esc(content.hero.subheadline)}">
  <meta name="theme-color" content="${pal.bg}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${esc(fonts)}">
  <link rel="stylesheet" href="styles.css">
</head>
<body class="layout-${style.layout} mood-${style.mood}">
${renderNav(content)}
${renderHero(content)}
<main>${content.columns.map((c, i) => renderColumn(c, pal, i))}
</main>
${renderFooter(content)}
</body>
</html>
`;
  return { "index.html": page, "styles.css": css };
}
