// 書架 (the owner's pick, 2026-11-18: the bound book on a shelf, with the bookplate inside its cover): a serial read to
// its last installment becomes a wine-red bound volume on 我的書架 (#/shelf, a corner of 收藏); opened (#/shelf/<slug>) the cover
// swings back on a marbled endpaper with the bookplate pasted in and a wax seal pressed on its corner. The first opening
// is the ceremony (the plate is pressed in, the seal comes down, gold leaf falls); every later one just opens the book.
// The record keeps everything the plate needs (title, author, dates), so the shelf outlives the next book's serial.json.
// It lives on this phone only (localStorage), like the stamps and the read set.
import { esc, store, ROBIN_PATHS } from "./util.js";
import { calm, rain } from "./motion.js";

const KEY = "serial.shelf";
export const shelf = () => { const s = store.get(KEY, []); return Array.isArray(s) ? s.filter((e) => e && typeof e.slug === "string" && typeof e.done === "string") : []; };
export const shelved = (slug) => shelf().find((e) => e.slug === slug) || null;
// Put the book on the shelf the day it is finished (once; the day never moves afterwards). The 藏書票 of 2026-11-06 kept
// only the day under serial.finished — a phone that has one carries it over.
export function shelve(b, date) {
  const slug = b.slug || "book", have = shelved(slug);
  if (have) return have;
  const old = (store.get("serial.finished", {}) || {})[slug];
  const e = { slug, title: String(b.title || ""), author: String(b.author || ""), original: String(b.original || ""), year: Number(b.year) || null,
    of: Number(b.of) || 0, start: String(b.start || ""), done: typeof old === "string" ? old : date, shown: false };
  store.set(KEY, [...shelf(), e]);
  return e;
}
export const markShown = (slug) => store.set(KEY, shelf().map((e) => (e.slug === slug ? { ...e, shown: true } : e)));

// ——— numbers and dates set in Chinese figures for the plate (二〇二七年十月二十一日・三百五十一回) ———
const D = "〇一二三四五六七八九";
const zh = (n) => { // 1–9999 in words
  n = Math.floor(n);
  if (n <= 0) return "〇";
  const u = ["", "十", "百", "千"], s = String(n).split("").map(Number), L = s.length;
  let out = "", zero = false;
  s.forEach((d, i) => { const p = L - 1 - i; if (!d) { zero = out !== ""; return; } if (zero) out += "〇"; zero = false; out += (d === 1 && p === 1 && i === 0 ? "" : D[d]) + u[p]; });
  return out.replace(/〇/g, "零");
};
const dateZh = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${String(y).split("").map((c) => D[c]).join("")}年${zh(m)}月${zh(d)}日`; };
const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5) + 1;
const roman = (n) => [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]].reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, "");
const volZh = (i) => `第${zh(i)}冊`;

// The SVG pieces both scenes share: the gold, the brushed brass of the case's plates, the leather's sheen, the robin in
// its colours (the masthead's drawing), the paper's emboss, the engraving's wobble, the wax and the marbling.
const DEFS = `<svg class="shelf-defs" width="0" height="0" aria-hidden="true"><defs>
  <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a5418"/><stop offset=".22" stop-color="#e9c66c"/><stop offset=".36" stop-color="#fff3c4"/><stop offset=".5" stop-color="#b98a33"/><stop offset=".7" stop-color="#f3d98a"/><stop offset="1" stop-color="#6e4c16"/></linearGradient>
  <linearGradient id="sgv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0bf"/><stop offset=".3" stop-color="#d29f2e"/><stop offset=".55" stop-color="#8a6220"/><stop offset=".8" stop-color="#f6d06a"/><stop offset="1" stop-color="#7a5418"/></linearGradient>
  <linearGradient id="sg-brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3d78e"/><stop offset=".35" stop-color="#b8893a"/><stop offset=".55" stop-color="#e9c66c"/><stop offset=".8" stop-color="#8a6220"/><stop offset="1" stop-color="#c99a3c"/></linearGradient>
  <filter id="s-brass" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".002 .8" numOctaves="2" seed="4" result="b"/><feColorMatrix in="b" type="matrix" values="0 0 0 0 .98  0 0 0 0 .84  0 0 0 0 .52  .9 0 0 0 -.25" result="streak"/><feComposite in="streak" in2="SourceGraphic" operator="atop" result="br"/><feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="e"/><feSpecularLighting in="e" surfaceScale="3" specularConstant="1" specularExponent="26" lighting-color="#fff6d8" result="sp"><feDistantLight azimuth="235" elevation="40"/></feSpecularLighting><feComposite in="sp" in2="SourceAlpha" operator="in" result="sp2"/><feComposite in="br" in2="sp2" operator="arithmetic" k1="0" k2="1" k3=".7" k4="0"/></filter>
  <radialGradient id="s-lsheen" cx=".32" cy=".25" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>
  <filter id="s-emboss" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation=".6" result="b"/><feSpecularLighting in="b" surfaceScale="2.2" specularConstant=".9" specularExponent="18" lighting-color="#fff6d8" result="s"><feDistantLight azimuth="225" elevation="42"/></feSpecularLighting><feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/><feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".9" k4="0"/></filter>
  <filter id="s-ink"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="1.6"/></filter>
  <filter id="s-wax" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="10"/></filter>
  <filter id="s-waxlight" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="b"/><feSpecularLighting in="b" surfaceScale="4" specularConstant=".75" specularExponent="22" lighting-color="#ffd8d8" result="s"><feDistantLight azimuth="235" elevation="38"/></feSpecularLighting><feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/><feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".8" k4="0"/></filter>
  <filter id="s-marble" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006 .011" numOctaves="3" seed="11" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="160" xChannelSelector="R" yChannelSelector="G" result="d1"/><feTurbulence type="fractalNoise" baseFrequency=".03 .05" numOctaves="2" seed="3" result="t2"/><feDisplacementMap in="d1" in2="t2" scale="26" xChannelSelector="G" yChannelSelector="R"/></filter>
  <symbol id="s-robin" viewBox="6 16 54 38">${ROBIN_PATHS.replace(/class="e-ink"/g, 'fill="var(--rb-ink,#2b1d12)"').replace(/class="e-robin"/g, 'fill="var(--rb-breast,#a84e26)"').replace(/class="e-gold"/g, 'fill="var(--rb-beak,#b48a3c)"').replace(/class="e-paper"/g, 'fill="var(--rb-eye,#f1e7d1)"').replace(/class="e-wing"/g, 'fill="none" stroke="var(--rb-wing,#5b4628)"').replace(/class="e-legs"/g, 'fill="none" stroke="var(--rb-wing,#5b4628)"')}</symbol>
</defs></svg>`;

// The corner ornaments of the plate and the cover: a lozenge with two scrolls and two rules running out of it.
const corner = (x, y, r, s) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 0 L4 -4 L8 0 L4 4Z"/><path d="M8 0 C16 0 20 -6 15 -9 C11 -11 9 -6 13 -5" fill="none" stroke="url(#sg)" stroke-width="1"/><path d="M0 8 C0 16 6 20 9 15 C11 11 6 9 5 13" fill="none" stroke="url(#sg)" stroke-width="1"/><path d="M10 4 L26 4 M4 10 L4 26" stroke="url(#sg)" stroke-width=".7"/><circle cx="29" cy="4" r="1.3"/><circle cx="4" cy="29" r="1.3"/></g>`;
const corners = (w, h, s) => corner(4 + 8 * s, 4 + 8 * s, 0, s) + corner(w - 4 - 8 * s, 4 + 8 * s, 90, s) + corner(w - 4 - 8 * s, h - 4 - 8 * s, 180, s) + corner(4 + 8 * s, h - 4 - 8 * s, 270, s);

// The cover of the bound book: tooled frame, the robin in a rayed medallion, title, author, the years it was read.
function coverSvg(e) {
  const rays = Array.from({ length: 48 }, (_, i) => { const a = (i * Math.PI) / 24; return `<line x1="${(Math.cos(a) * 30).toFixed(1)}" y1="${(Math.sin(a) * 30).toFixed(1)}" x2="${(Math.cos(a) * 36).toFixed(1)}" y2="${(Math.sin(a) * 36).toFixed(1)}"/>`; }).join("");
  const y1 = Number(String(e.done || e.start || "").slice(0, 4)), y0 = Number(String(e.start || "").slice(0, 4)) || y1;
  const fs = e.title.length > 8 ? Math.max(12, Math.floor(150 / e.title.length)) : 17;
  return `<svg viewBox="0 0 206 328" aria-hidden="true">
    <image href="assets/shelf/leather.jpg" width="330" height="330" x="-60" y="0" preserveAspectRatio="xMidYMid slice"/><rect width="206" height="328" fill="#c23a5c" style="mix-blend-mode:multiply"/><rect width="206" height="328" fill="#3a0a14" opacity=".28"/><rect width="206" height="328" fill="url(#s-lsheen)"/>
    <rect x="10" y="10" width="186" height="308" fill="none" stroke="url(#sg)" stroke-width="1.6" filter="url(#s-emboss)"/>
    <rect x="16" y="16" width="174" height="296" fill="none" stroke="url(#sg)" stroke-width=".6"/>
    <g fill="url(#sg)">${corners(206, 328, 0.9)}</g>
    <g transform="translate(103 140)" filter="url(#s-emboss)"><circle r="44" fill="none" stroke="url(#sg)" stroke-width="2"/><circle r="39" fill="none" stroke="url(#sg)" stroke-width=".6"/><g stroke="url(#sg)" stroke-width=".6">${rays}</g>
      <use href="#s-robin" x="-28" y="-18" width="56" height="35" style="--rb-ink:url(#sgv);--rb-breast:#f6d06a;--rb-beak:#fff0bf;--rb-eye:#5c1d2c;--rb-wing:#7a5418"/></g>
    <text x="103" y="232" text-anchor="middle" font-family="Noto Serif TC,Songti TC,serif" font-weight="700" font-size="${fs}" letter-spacing="3" fill="url(#sgv)" filter="url(#s-emboss)">${esc(e.title)}</text>
    <text x="103" y="254" text-anchor="middle" font-family="Noto Serif TC,Songti TC,serif" font-size="10" letter-spacing="2" fill="url(#sgv)">${esc(e.author)}</text>
    <text x="103" y="292" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-size="9" letter-spacing="3" fill="url(#sgv)">${y0 && y0 !== y1 ? `${roman(y0)} · ${roman(y1)}` : roman(y1)}</text>
  </svg>`;
}

// The bookcase (#/shelf; the owner's pick of 2026-11-18, sample A; built into the panelled wall as one full-bleed scene
// since his 「對，照這樣改」 of 2026-11-19): a walnut-dark case with a moulded crown, fluted pilasters and an engraved brass
// plate, its shelves numbered on small brass labels like a library's. The newest book stands facing out on the top shelf
// by a brass bookend; the ones before it stand spine out beside it, then on the shelves below.
// Wood and leather are photographs (assets/shelf/, Poly Haven, CC0); the brass is CSS (style.css .sc-brass).
const SHELF_NO = ["I", "II", "III", "IV", "V", "VI"];
// `reading` (the owner, 2026-11-19: 正在看的書也要在書架): the serial being read, {slug, title, author, start, n, of} —
// it stands facing out with a wine silk ribbon hanging from it over the shelf's edge (how far the reader is: only in its
// label), and leads to the 連載 tab; every finished book then stands spine out beside it. No book at all: the empty case.
export function shelfHtml(list, reading = null) {
  const last = reading ? { ...reading, done: "" } : list.at(-1), older = (reading ? list : list.slice(0, -1)).slice().reverse(); // the most recent first, next to the one facing out
  // A spine's title stays on one line, set smaller the longer it is (the top shelf's spines are taller than the others').
  const spine = (e, tall) => { const n = [...e.title].length || 1, fs = Math.max(8, Math.min(12, Math.floor((tall ? 112 : 84) / (n * 1.22))));
    return `<a class="sh-spine" href="#/shelf/${esc(e.slug)}" aria-label="《${esc(e.title)}》"><i></i>${tall ? "<i></i>" : ""}<b class="sh-foil" style="font-size:${fs}px">${esc(e.title)}</b>${tall ? "<i></i>" : ""}<i></i></a>`; };
  const shelves = [older.slice(0, 4), older.slice(4, 14), older.slice(14, 24)];
  for (let i = 24; i < older.length; i += 10) shelves.push(older.slice(i, i + 10));
  const face = reading
    ? `<a class="sh-book reading" href="#/shelf/${esc(reading.slug)}" aria-label="《${esc(reading.title)}》，正在讀，讀到第 ${reading.n} 回，共 ${reading.of} 回，${(reading.marks || []).length} 條書籤"><span class="mk-tabs" aria-hidden="true">${(reading.marks || []).slice(-6).map((m, k) => `<i style="--k:${k};--c:${MARK_COLOURS[m.i % MARK_COLOURS.length][0]}"></i>`).join("")}</span><span class="b3">
        <i class="f back"></i><i class="f top"></i><i class="f pages"></i><span class="f cover">${coverSvg(last)}</span></span><i class="sh-ribbon" aria-hidden="true"></i></a>`
    : !last ? "" : `<a class="sh-book${last.shown ? "" : " new"}" href="#/shelf/${esc(last.slug)}" aria-label="《${esc(last.title)}》，${esc(volZh(list.length))}，翻開"><span class="b3">
        <i class="f back"></i><i class="f top"></i><i class="f pages"></i><span class="f cover">${coverSvg(last)}</span></span></a>`;
  const bay = (books, i) => `<div class="bc-bay${i ? "" : " first"}"><i class="bc-shade"></i><i class="bc-light"></i><div class="bc-row">${i ? "" : face}${books.map((e) => spine(e, !i)).join("")}${i || !last ? "" : '<i class="bc-end"></i>'}</div>
      <div class="bc-board"><span class="bc-tag"><i>${SHELF_NO[i] || roman(i + 1)}</i></span></div></div>`;
  return `<section class="bcase" aria-label="我的書架，讀完 ${list.length} 冊${reading ? "，一本正在讀" : ""}">${DEFS}
    <div class="bc-crown"><i class="bc-dent"></i></div><div class="bc-plate sc-brass"><span class="sc-cut ex">Ex Libris</span><span class="sc-cut zh">知更鳥藏書</span></div>
    <i class="bc-pil l"></i><i class="bc-pil r"></i>
    ${shelves.slice(0, Math.max(3, shelves.findLastIndex((s) => s.length) + 1)).map(bay).join("")}
  </section>`;
}

// ——— 卷末書籤 (the owner, 2026-11-19: 夾在書架那本書裡): a silk bookmark for every part of the book read through, gilt
// with the part's name and the day its last installment came out. The book being read opens (#/shelf/<slug>) to the
// two pages it is open at (the latest installment read) with its bookmarks laid fanwise beside it, and 「Weiterlesen」
// leads on to the 連載 tab.
const MARK_COLOURS = [["#23395b", "#2e4870"], ["#6e2536", "#8e2a40"], ["#2d4a35", "#3a5c43"], ["#5a3a1a", "#7a5226"], ["#3a2a52", "#4c3a6a"]];
const MONTHS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const markDate = (d) => { const [y, m, dd] = d.split("-").map(Number); return `${dd}. ${MONTHS[m - 1]}.<br>${roman(y)}`; };
export function marksHtml(b, marks) {
  const one = (m, k) => { const [c0, c1] = MARK_COLOURS[m.i % MARK_COLOURS.length];
    return `<div class="mk-mark" style="--k:${k};--n:${Math.min(marks.length, 6)};--c0:${c0};--c1:${c1}"><i class="mk-silk"></i><i class="mk-edge"></i><b class="sh-foil mk-name">${esc(m.part)}</b><span class="mk-date">${markDate(m.date)}</span><i class="mk-cord"></i><i class="mk-tassel"></i></div>`; };
  return `<div class="mk-desk">${DEFS}
      <div class="mk-book" aria-label="《${esc(b.title)}》攤開在讀到的地方"><i class="mk-cover"></i><div class="mk-page l"><p class="mk-text"></p><span class="mk-folio l"></span></div><div class="mk-page r"><p class="mk-text"></p><span class="mk-folio r"></span></div><i class="mk-ribbon"></i></div>
      <div class="mk-fan" aria-label="${marks.length} 條書籤">${marks.slice(-6).map(one).join("")}</div>
      <a class="mk-on sh-foil" href="#/serial">Weiterlesen</a></div>`;
}
// The bookplate: laid paper, gold Ex Libris, the wheat ear of the book's epigraph growing over the robin in an engraved
// oval, the title and the original, the day it was finished and how long it was read; the volume's number at the head.
function plateSvgArt() {
  let hatch = "";
  for (let y = -70; y <= 8; y += 3.2) { const w = 64 * Math.sqrt(Math.max(0, 1 - (y / 72) ** 2)); hatch += `<line x1="${(-w).toFixed(1)}" y1="${y.toFixed(1)}" x2="${w.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }
  let ear = `<path d="M0 52 C-1 20 2 -10 0 -52" stroke="#3a2a16" stroke-width="1.3" fill="none"/><path d="M0 -52 L0 -66" stroke="#3a2a16" stroke-width=".5"/>`;
  for (let i = 0; i < 7; i++) for (const d of [-1, 1]) ear += `<g transform="translate(${d * 1.5} ${-44 + i * 9}) rotate(${d * 28}) scale(${(1 - i * 0.04).toFixed(2)})"><path d="M0 0 C${d * 3} -4 ${d * 3} -12 0 -15 C${-d * 3} -12 ${-d * 3} -4 0 0Z" fill="#b48a3c" stroke="#3a2a16" stroke-width=".55"/><path d="M0 -2 L0 -13 M0 -15 L${d * 2} -27" stroke="#3a2a16" stroke-width=".35"/></g>`;
  for (const d of [-1, 1]) ear += `<path d="M0 30 C${d * 14} 22 ${d * 24} 26 ${d * 34} 16 C${d * 22} 32 ${d * 10} 32 0 30Z" fill="#7d8a4a" stroke="#3a2a16" stroke-width=".5"/>`;
  return `<svg class="pl-art" viewBox="0 0 272 400" aria-hidden="true">
    <rect x="12" y="12" width="248" height="376" fill="none" stroke="url(#sg)" stroke-width="2.2"/>
    <rect x="18" y="18" width="236" height="364" fill="none" stroke="url(#sg)" stroke-width=".7"/>
    <rect x="22.5" y="22.5" width="227" height="355" fill="none" stroke="#8a6a32" stroke-width=".5" stroke-dasharray="1 2.2"/>
    <g fill="url(#sg)">${corners(272, 400, 1)}</g>
    <g transform="translate(136 178)"><ellipse rx="70" ry="78" fill="none" stroke="url(#sg)" stroke-width="1.6"/><ellipse rx="64" ry="72" fill="none" stroke="#7a5a24" stroke-width=".5"/>
      <g stroke="#5b4628" stroke-width=".45" opacity=".55">${hatch}</g><g filter="url(#s-ink)">${ear}</g>
      <g transform="translate(-4 30)" filter="url(#s-ink)"><use href="#s-robin" x="-30" y="-19" width="60" height="38"/></g>
      <path d="M-46 62 Q0 50 46 62" fill="none" stroke="#5b4628" stroke-width=".7"/><path d="M-36 66 Q0 58 36 66" fill="none" stroke="#5b4628" stroke-width=".5"/></g>
  </svg>`;
}
const marble = () => {
  const cols = ["#1b2742", "#23395b", "#c9a75a", "#1b2742", "#6e2536", "#efe3c8", "#23395b", "#4a1420", "#d29f2e", "#1b2742", "#8e2a2e", "#2c3a5c"];
  let r = "";
  for (let y = -120, i = 0; y < 720; i++) { const h = i % 3 === 2 ? 1.6 : 4 + ((i * 37) % 13); r += `<rect x="-120" y="${y}" width="600" height="${h}" fill="${cols[i % cols.length]}"/>`; y += h; }
  return `<svg class="ep-marble" viewBox="0 0 358 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g filter="url(#s-marble)"><rect width="358" height="560" fill="#1b2742"/>${r}</g></svg>`;
};

// The opened book (#/shelf/<slug>): the endpaper with the plate and the seal, under a cover that swings open; it lies
// on the desk (app.js viewShelfBook, one full-bleed scene), its volume number on the plate.
export function bookHtml(e, no) {
  const n = Number(e.of) || 0, span = e.start ? days(e.start, e.done) : 0;
  const tally = [n && `${zh(n)}回`, span > 0 && `${zh(span)}個早晨`].filter(Boolean).join("・");
  return `<div class="opened" aria-label="《${esc(e.title)}》，${esc(volZh(no))}，${esc(e.author)}；藏書票：${esc(dateZh(e.done))}讀畢">${DEFS}
    <div class="endpaper">${marble()}<i class="ep-gutter"></i>
      <div class="plate">${plateSvgArt()}
        <span class="pl-no">N<sup>o</sup> ${String(no).padStart(3, "0")}</span>
        <span class="pl-ex sh-foil">Ex Libris</span>
        <span class="pl-who">知更鳥晨間記事</span>
        <span class="pl-title">${esc(e.title)}</span>
        ${e.original ? `<span class="pl-orig">${esc(e.original)}</span>` : ""}
        <i class="pl-rule"></i>
        <span class="pl-read">讀畢於${esc(dateZh(e.done))}${tally ? `<br>${esc(tally)}` : ""}</span>
      </div>
      <svg class="wax-seal" viewBox="0 0 104 104" aria-hidden="true"><g filter="url(#s-waxlight)"><g filter="url(#s-wax)"><circle cx="52" cy="52" r="44" fill="#7a1f2e"/></g>
        <circle cx="52" cy="52" r="31" fill="#6a1826"/><circle cx="52" cy="52" r="31" fill="none" stroke="#4a0f1a" stroke-width="2"/><circle cx="52" cy="52" r="26" fill="none" stroke="#8e3040" stroke-width=".8"/>
        <use href="#s-robin" x="31" y="39" width="42" height="26" style="--rb-ink:#4c0f1b;--rb-breast:#5a1320;--rb-beak:#4c0f1b;--rb-eye:#8e3040;--rb-wing:#8e3040"/></g>
        <text x="52" y="85" text-anchor="middle" font-family="Cormorant Garamond,serif" font-size="7" letter-spacing="1.6" fill="#a74a5a">${roman(Number(e.done.slice(0, 4)))}</text></svg>
    </div>
    <div class="lid"><span class="cover">${coverSvg(e)}</span><i class="lid-in"></i></div>
  </div>`;
}

// Opening the book. The first time: the cover lifts slowly, the plate is pressed in, the seal comes down with a thud
// and gold leaf falls; afterwards the cover just swings open. With reduced motion the book lies open at once.
export function openBook(stage, first) {
  if (!stage) return;
  if (calm()) { stage.classList.add("is-open", "settled"); return; }
  stage.classList.add(first ? "first" : "again");
  requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.add("is-open")));
  if (first) {
    setTimeout(() => { if (stage.isConnected) navigator.vibrate?.([10, 40, 26]); }, 2350);
    setTimeout(() => { if (stage.isConnected) rain(60); }, 2450);
  }
}
