import type { StyleSpec } from "../spec/schema.js";
import type { Palette } from "../tokens/color.js";
import { decorationCss } from "./decorations.js";

/* Base stylesheet: everything reads tokens (CSS variables), nothing is hard-coded. */
const BASE = `
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background-color:var(--bg);color:var(--text);font-family:var(--font-body);font-size:var(--step-0);line-height:1.6;overflow-x:hidden}
h1,h2,h3{font-family:var(--font-heading);font-weight:var(--heading-weight);text-transform:var(--heading-case);line-height:1.1;margin:0;overflow-wrap:break-word;hyphens:auto}
h1{font-size:var(--step-5);letter-spacing:-.02em}
h2{font-size:var(--step-3);letter-spacing:-.01em}
h3{font-size:var(--step-1)}
p{margin:0}
a{color:var(--primary)}
a:focus-visible,summary:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
img,svg{display:block;max-width:100%}

.wrap{width:min(100% - 2rem, 72rem);margin-inline:auto}

/* nav */
.nav{position:sticky;top:0;z-index:50;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2) var(--space-4);padding:var(--space-3) max(1rem, calc((100% - 72rem)/2));background:color-mix(in oklab, var(--bg) 88%, transparent);backdrop-filter:blur(10px);border-bottom:var(--border-w) solid var(--border)}
.brand{font-family:var(--font-heading);font-weight:var(--heading-weight);text-transform:var(--heading-case);font-size:var(--step-1);color:var(--text);text-decoration:none}
.nav ul{display:flex;flex-wrap:wrap;gap:var(--space-1) var(--space-4);list-style:none;margin:0;padding:0}
.nav ul a{color:var(--muted);text-decoration:none;font-size:var(--step--1);font-weight:600;letter-spacing:.02em}
.nav ul a:hover{color:var(--primary)}

/* hero */
.hero{padding:var(--space-7) 1rem}
.hero-inner{width:min(100%, 72rem);margin-inline:auto;display:grid;gap:var(--space-4);justify-items:start}
.eyebrow{color:var(--accent);font-size:var(--step--1);font-weight:700;letter-spacing:.14em;text-transform:uppercase}
.hero-sub{font-size:var(--step-1);color:var(--muted);max-width:42ch}
.btn{display:inline-block;padding:var(--space-3) var(--space-5);background:var(--primary);color:var(--on-primary);border-radius:var(--radius-btn);text-decoration:none;font-weight:700;border:var(--border-w) solid var(--text);border-color:color-mix(in oklab, var(--primary) 70%, var(--text))}
.btn:hover{filter:brightness(1.08)}

/* sections */
main{display:block}
.section{padding:var(--space-6) 1rem;scroll-margin-top:5rem}
.section > *{width:min(100%, 72rem);margin-inline:auto}
.section-head{display:grid;gap:var(--space-3);margin-bottom:var(--space-5)}
.lead{color:var(--muted);font-size:var(--step-1);max-width:60ch}
.meta{color:var(--accent);font-weight:700;font-size:var(--step--1);letter-spacing:.04em}

/* surfaces shared by cards, tiles, faq */
.card,.tile,.faq details,.contact-item,.highlights li{border-radius:var(--radius)}

.cards{display:grid;gap:var(--space-4);grid-template-columns:repeat(auto-fill,minmax(min(100%,16rem),1fr))}
.card{padding:var(--space-4);display:grid;gap:var(--space-2);align-content:start}
.card p{color:var(--muted)}

.rows{list-style:none;margin:0;padding:0;display:grid;gap:var(--space-4);max-width:52rem}
.row{display:grid;gap:var(--space-1)}
.row-head{display:flex;align-items:baseline;gap:var(--space-2)}
.row-head h3{font-size:var(--step-1)}
.leader{flex:1;border-bottom:2px dotted var(--border);transform:translateY(-.3em);min-width:1rem}
.row p{color:var(--muted);max-width:60ch}

.gallery{display:grid;gap:var(--space-3);grid-template-columns:repeat(auto-fill,minmax(min(100%,14rem),1fr))}
.tile{margin:0;overflow:hidden;background:var(--surface)}
.tile svg{width:100%;aspect-ratio:4/3;height:auto}
.tile figcaption{padding:var(--space-3);display:grid;gap:var(--space-1)}
.tile figcaption span{color:var(--muted);font-size:var(--step--1)}

.prose{display:grid;gap:var(--space-3);max-width:65ch}
.prose h3{margin-top:var(--space-3)}

.timeline{list-style:none;margin:0;padding:0 0 0 var(--space-4);border-left:2px solid var(--border);display:grid;gap:var(--space-5);max-width:52rem}
.timeline li{position:relative;display:grid;gap:var(--space-1)}
.timeline li::before{content:"";position:absolute;left:calc(-1 * var(--space-4) - 7px);top:.35em;width:12px;height:12px;border-radius:50%;background:var(--primary)}
.timeline p{color:var(--muted)}

.contact{display:grid;gap:var(--space-3);grid-template-columns:repeat(auto-fill,minmax(min(100%,15rem),1fr));margin:0}
.contact-item{padding:var(--space-4);background:var(--surface)}
.contact dt{font-weight:700;font-size:var(--step--1);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:var(--space-1)}
.contact dd{margin:0;font-size:var(--step-1)}

.faq{display:grid;gap:var(--space-2);max-width:52rem}
.faq details{padding:var(--space-3) var(--space-4)}
.faq summary{cursor:pointer;font-weight:700;font-size:var(--step-1)}
.faq details p{margin-top:var(--space-2);color:var(--muted)}

.highlights{list-style:none;margin:0;padding:0;display:grid;gap:var(--space-3);grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr))}
.highlights li{padding:var(--space-4);display:grid;gap:var(--space-1);background:var(--surface)}
.highlights strong{font-family:var(--font-heading);font-size:var(--step-2);color:var(--primary)}
.highlights span{color:var(--muted)}

.footer{padding:var(--space-5) 1rem;border-top:var(--border-w) solid var(--border);color:var(--muted);text-align:center;font-size:var(--step--1)}
`;

const CARD_STYLES: Record<StyleSpec["cardStyle"], string> = {
  flat: `.card,.faq details{background:var(--surface)}`,
  outlined: `.card,.faq details,.tile,.contact-item,.highlights li{background:transparent;border:max(var(--border-w),1px) solid var(--border)}`,
  elevated: `.card,.faq details,.tile,.contact-item,.highlights li{background:var(--surface);box-shadow:0 1px 2px rgb(0 0 0/.08),0 8px 24px -8px rgb(0 0 0/.18)}`,
  glass: `.card,.faq details,.tile,.contact-item,.highlights li{background:color-mix(in oklab, var(--surface) 55%, transparent);backdrop-filter:blur(14px);border:1px solid color-mix(in oklab, var(--text) 14%, transparent)}`,
};

/* Layout archetypes: same HTML, different arrangement. */
const LAYOUTS: Record<StyleSpec["layout"], string> = {
  landing: `
.hero{text-align:center;min-height:min(78vh,52rem);display:grid;align-items:center}
.hero-inner{justify-items:center}
.hero-sub{margin-inline:auto}
.section:nth-of-type(even){background:var(--surface)}
.section:nth-of-type(even) .card,.section:nth-of-type(even) .contact-item,.section:nth-of-type(even) .highlights li{background:var(--bg)}
.section-head{text-align:center;justify-items:center}
.section-head h2::after{margin-inline:auto}`,

  editorial: `
.hero{border-bottom:var(--border-w) solid var(--border)}
.hero h1{font-size:calc(var(--step-5) * 1.15);max-width:16ch}
.section{border-bottom:1px solid var(--border)}
@media (min-width:860px){
  .section{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2.2fr);gap:var(--space-6);width:min(100% - 2rem,72rem);margin-inline:auto;padding-inline:0}
  .section > *{width:auto;margin:0}
  .section-head{position:sticky;top:6rem;align-self:start}
}`,

  "grid-showcase": `
main{display:grid;gap:var(--space-4);width:min(100% - 2rem,72rem);margin:0 auto var(--space-6);grid-template-columns:1fr}
main .section{padding:var(--space-5);border-radius:var(--radius);background:var(--surface);border:var(--border-w) solid var(--border)}
main .section > *{width:auto}
@media (min-width:860px){
  main{grid-template-columns:repeat(6,1fr)}
  main .section{grid-column:span 3}
  main .kind-cards,main .kind-gallery,main .kind-list,main .kind-intro{grid-column:span 6}
  main .kind-faq,main .kind-timeline{grid-column:span 4}
  main .kind-contact{grid-column:span 2}
}
main .section .card,main .section .contact-item,main .section .highlights li{background:var(--bg)}`,

  "sidebar-nav": `
@media (min-width:960px){
  body{display:grid;grid-template-columns:16rem minmax(0,1fr)}
  .nav{position:sticky;top:0;height:100vh;flex-direction:column;align-items:flex-start;justify-content:flex-start;padding:var(--space-5) var(--space-4);border-bottom:0;border-right:var(--border-w) solid var(--border);grid-row:1 / span 3}
  .nav ul{flex-direction:column;gap:var(--space-3)}
  .nav ul a{font-size:var(--step-0)}
  .hero,main,.footer{grid-column:2}
  .hero-inner,.section > *{width:min(100%,60rem);margin-inline:0}
  .hero,.section{padding-inline:var(--space-6)}
}`,

  "single-column": `
.hero-inner,.section > *{width:min(100%,42rem)}
.hero{padding-block:var(--space-6)}
.hero h1{font-size:var(--step-4)}
.cards,.gallery,.contact{grid-template-columns:1fr}
.section{padding-block:var(--space-5)}
.section + .section > .section-head{padding-top:var(--space-5);border-top:1px solid var(--border)}`,
};

const MOTION: Record<StyleSpec["motion"], string> = {
  none: "",
  subtle: `
@media (prefers-reduced-motion:no-preference){
  .hero-inner > *{animation:rise .7s ease both}
  .hero-inner > *:nth-child(2){animation-delay:.08s}
  .hero-inner > *:nth-child(3){animation-delay:.16s}
  .hero-inner > *:nth-child(4){animation-delay:.24s}
  @supports (animation-timeline:view()){
    .section-head,.card,.tile,.row,.timeline li{animation:rise linear both;animation-timeline:view();animation-range:entry 0% entry 40%}
  }
}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}`,
  lively: `
@media (prefers-reduced-motion:no-preference){
  .hero-inner > *{animation:rise .8s cubic-bezier(.2,.8,.2,1) both}
  .hero-inner > *:nth-child(2){animation-delay:.1s}
  .hero-inner > *:nth-child(3){animation-delay:.2s}
  .hero-inner > *:nth-child(4){animation-delay:.3s}
  .card,.tile,.btn{transition:transform .25s ease, box-shadow .25s ease}
  .card:hover,.tile:hover{transform:translateY(-6px) rotate(-.4deg)}
  .btn:hover{transform:translateY(-2px) scale(1.03)}
  .tile svg{transition:transform .6s ease}
  .tile:hover svg{transform:scale(1.08)}
  @supports (animation-timeline:view()){
    .card,.tile,.row,.timeline li{animation:rise linear both;animation-timeline:view();animation-range:entry 0% entry 45%}
  }
}
@keyframes rise{from{opacity:0;transform:translateY(24px) scale(.98)}to{opacity:1;transform:none}}`,
};

/* Small mood-specific touches on top of everything else. */
const MOOD: Partial<Record<StyleSpec["mood"], string>> = {
  brutalist: `.card,.tile,.contact-item,.faq details,.highlights li,.btn{box-shadow:6px 6px 0 var(--text);border:2px solid var(--text)}`,
  futuristic: `h1{background:linear-gradient(90deg,var(--primary),var(--accent));-webkit-background-clip:text;background-clip:text;color:transparent}.btn{box-shadow:0 0 24px -4px var(--primary)}`,
  retro: `h2{text-shadow:3px 3px 0 var(--accent)}`,
  elegant: `.eyebrow{letter-spacing:.3em;font-weight:400}h2{font-weight:400}`,
  editorial: `.lead{font-family:var(--font-heading);font-style:italic}`,
  playful: `h2::after{content:"";display:block;width:3rem;height:.3rem;margin-top:.6rem;border-radius:999px;background:var(--accent)}`,
};

export function siteCss(tokens: string, s: StyleSpec, pal: Palette): string {
  return [
    "/* Generated by kwsite. Edit style.json and re-render instead of editing this file. */",
    tokens,
    BASE,
    CARD_STYLES[s.cardStyle],
    LAYOUTS[s.layout],
    MOOD[s.mood] ?? "",
    decorationCss(s.decoration, pal),
    MOTION[s.motion],
  ].join("\n");
}
