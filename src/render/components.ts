import type { Column, ContentSpec, Item } from "../spec/schema.js";
import type { Palette } from "../tokens/color.js";
import { galleryTileSvg } from "./decorations.js";
import { esc, html } from "./html.js";

/*
 * One renderer per column kind. Components only emit semantic HTML + classes;
 * every visual decision lives in CSS driven by the StyleSpec.
 */

const meta = (it: Item) => (it.meta ? html`<span class="meta">${esc(it.meta)}</span>` : "");

const paragraphs = (s: string) =>
  s
    .split(/\n{2,}/)
    .map((p) => html`<p>${esc(p.trim())}</p>`)
    .join("");

const renderers: Record<Column["kind"], (c: Column, pal: Palette) => string> = {
  intro: (c) => html`
    ${c.items.length > 0 &&
    html`<ul class="highlights">${c.items.map(
      (it) => html`<li><strong>${esc(it.title)}</strong><span>${esc(it.body)}</span></li>`,
    )}</ul>`}`,

  list: (c) => html`
    <ul class="rows">${c.items.map(
      (it) => html`<li class="row">
        <div class="row-head"><h3>${esc(it.title)}</h3><span class="leader" aria-hidden="true"></span>${meta(it)}</div>
        <p>${esc(it.body)}</p>
      </li>`,
    )}</ul>`,

  cards: (c) => html`
    <div class="cards">${c.items.map(
      (it) => html`<article class="card">${meta(it)}<h3>${esc(it.title)}</h3><p>${esc(it.body)}</p></article>`,
    )}</div>`,

  gallery: (c, pal) => html`
    <div class="gallery">${c.items.map(
      (it, i) => html`<figure class="tile">${galleryTileSvg(i, pal)}<figcaption><strong>${esc(it.title)}</strong><span>${esc(it.body)}</span></figcaption></figure>`,
    )}</div>`,

  text: (c) => html`
    <div class="prose">${c.items.map(
      (it) => html`${it.title && html`<h3>${esc(it.title)}</h3>`}${paragraphs(it.body)}`,
    )}</div>`,

  timeline: (c) => html`
    <ol class="timeline">${c.items.map(
      (it) => html`<li>${meta(it)}<h3>${esc(it.title)}</h3><p>${esc(it.body)}</p></li>`,
    )}</ol>`,

  contact: (c) => html`
    <dl class="contact">${c.items.map(
      (it) => html`<div class="contact-item"><dt>${esc(it.title)}</dt><dd>${esc(it.body)}${it.meta && html`<br><span class="meta">${esc(it.meta)}</span>`}</dd></div>`,
    )}</dl>`,

  faq: (c) => html`
    <div class="faq">${c.items.map(
      (it) => html`<details><summary>${esc(it.title)}</summary><p>${esc(it.body)}</p></details>`,
    )}</div>`,
};

export function renderColumn(c: Column, pal: Palette, index: number): string {
  return html`
  <section id="${esc(c.id)}" class="section kind-${c.kind}" style="--i:${index}">
    <header class="section-head">
      <h2>${esc(c.heading)}</h2>
      ${c.intro && html`<p class="lead">${esc(c.intro)}</p>`}
    </header>
    <div class="section-body">${renderers[c.kind](c, pal)}</div>
  </section>`;
}

export function renderNav(content: ContentSpec): string {
  return html`
  <nav class="nav" aria-label="Main">
    <a class="brand" href="#top">${esc(content.siteName)}</a>
    <ul>${content.columns.map((c) => html`<li><a href="#${esc(c.id)}">${esc(c.heading)}</a></li>`)}</ul>
  </nav>`;
}

export function renderHero(content: ContentSpec): string {
  const h = content.hero;
  return html`
  <header class="hero" id="top">
    <div class="hero-inner">
      <p class="eyebrow">${esc(content.tagline)}</p>
      <h1>${esc(h.headline)}</h1>
      <p class="hero-sub">${esc(h.subheadline)}</p>
      <a class="btn" href="#${esc(h.ctaTarget)}">${esc(h.ctaLabel)}</a>
    </div>
  </header>`;
}

export function renderFooter(content: ContentSpec): string {
  return html`<footer class="footer"><p>${esc(content.footer)}</p></footer>`;
}
