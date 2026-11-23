// 唱片櫃 (the owner's pick, 2026-11-19: the record crate, and a record tapped opens on the turntable): every 古典音樂
// piece read is a record. Its sleeve is the article's picture with the work in gilt — as the canon list names it
// (index.json `work`, scripts/build_index.py music_works) or else the headline. #/records is the cabinet in the
// panelled room (one full-bleed scene, the owner's 「對，照這樣改」 of 2026-11-19) with a horn gramophone on it (the
// owner, 2026-11-23: 「收藏裡唱片我想要是唱片機的模樣」; phono.js), the record in front on its platter; #/records/<date>
// puts that record on a turntable, and a tap on the disc spins it and plays the recording through Spotify (app.js
// viewRecord), or without Spotify the article's melody (index.json `motif`) as a music box. Wood is the bookcase's photograph (assets/shelf/, CC0).
// Under the sideboard's plate two drawers (the owner's pick of 2026-11-19, samples in 流程盤點/修改包/收藏品_黑膠/樣張_總覽與隨機):
// 全部唱片 opens #/records/all, every record spread out on the desk; 隨機一張 lays another record on the gramophone.
// Neither puts a record on the turntable: a record tapped on the desk comes back onto the gramophone.
import { esc } from "./util.js";
import { CB_DEFS, pull, keyhole, capital, base, apron, legs } from "./cabinet.js";
import { phonoSvg, phonoDisc } from "./phono.js";
import { calm } from "./motion.js";
import { parseMotif, audioCtx } from "./nest.js";
import { pluck, reverb } from "./jupiter.js";

// 「比才《卡門》」 → composer 比才, work 《卡門》; a name without 《〈 stays whole.
export function workName(a) {
  const w = String(a.work || "").trim();
  if (!w) return { by: "", work: String(a.title || "") };
  const i = w.search(/[《〈]/);
  return i > 0 ? { by: w.slice(0, i), work: w.slice(i) } : { by: "", work: w };
}
// The sleeve's one line: the piece itself — 〈結婚進行曲〉 out of 《仲夏夜之夢》〈結婚進行曲〉, else the 《work》, else all.
const piece = (n) => (n.work.match(/〈[^〉]+〉/) || n.work.match(/《[^》]+》/) || [n.work])[0];
const pic = (a) => a.hero?.thumb || a.hero?.src || "";

const bare = (s) => String(s).replace(/^[《〈]|[》〉]$/g, "");
const len = (v) => (typeof v === "number" ? `${v}px` : v); // a size in px, or a CSS length (the crate's sleeves follow the screen)
const ROMAN = (n) => [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]].reduce((s, [v, x]) => { while (n >= v) { s += x; n -= v; } return s; }, "");

// The sleeve (the owner, 2026-11-19: 不要有一塊突兀字卡): the picture to its edges, the piece in gilt at its foot and
// the composer in small gilt under it — no cream band.
export function sleeveHtml(r, size, extra = "") {
  const n = workName(r.a), src = pic(r.a), w = len(size);
  return `<span class="slv" style="--w:${w};width:${w};height:${w};${extra}">${src ? `<img src="${esc(src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '<i class="noimg"></i>'}
    <span class="sv-name"><b class="sh-foil">${esc(bare(piece(n)))}</b>${n.by ? `<span>${esc(n.by)}</span>` : ""}</span></span>`;
}
export function discHtml(r, size, extra = "") {
  const n = workName(r.a), d = len(size);
  return `<span class="rec" style="--d:${d};width:${d};height:${d};${extra}"><span class="lab"><u>ROTKEHLCHEN</u><b>${esc(bare(piece(n)))}</b><i>${esc(n.by)}</i></span></span>`;
}

// #/records: the gramophone on the cabinet, the record in front on its platter — the newest first, or the one laid on
// since. A tap on the machine puts that record on the turntable; ‹ › on the cabinet (or a swipe) lay the next newer or
// older on the platter in its place, 隨機一張 any other. The count is cut in the cabinet's brass in Roman figures.
let frontDate = ""; // the record left in front, so the way back from the turntable finds the gramophone as it was left
const label = (r) => { const n = workName(r.a); return { name: bare(piece(n)), by: n.by }; }; // as the turntable's label has it
const deckLink = (list, i) => [`#/records/${list[i].date}`, `${workName(list[i].a).work}，第 ${i + 1} 張，共 ${list.length} 張，放上唱盤`]; // href, aria-label
export function crateHtml(list) {
  const i = Math.max(0, list.findIndex((r) => r.date === frontDate)), [href, aria] = list.length ? deckLink(list, i) : [];
  return `${CB_DEFS}<div class="cr-room" aria-label="唱片櫃，${list.length} 張">
      ${list.length ? `<a class="ph" href="${esc(href)}" aria-label="${esc(aria)}">${phonoSvg(label(list[i]))}</a>` : `<div class="ph">${phonoSvg(null)}</div>`}</div>
    <i class="cr-sb-top"></i>
    <div class="cr-sb"><b class="cb-col l">${capital()}${base()}</b><b class="cb-col r">${capital()}${base()}</b>${list.length > 1 ? `<button type="button" class="cr-flip sh-foil" data-flip="-1" aria-label="較新的一張"${i ? "" : " disabled"}>‹</button>` : ""}
      <span class="sc-brass cr-plate"><span class="sc-cut">Schallplatten</span><span class="sc-cut n">${list.length ? ROMAN(list.length) : "—"}</span></span>
      ${list.length > 1 ? `<button type="button" class="cr-flip sh-foil" data-flip="1" aria-label="較舊的一張"${i < list.length - 1 ? "" : " disabled"}>›</button>` : ""}
      ${list.length > 1 ? `<div class="cr-drawers"><a class="cr-drawer" href="#/records/all">${pull()}<span class="sc-brass"><span class="sc-cut">全部唱片</span></span><i>${keyhole()}</i>${pull()}</a><button type="button" class="cr-drawer" data-rand>${pull()}<span class="sc-brass"><span class="sc-cut">隨機一張</span></span><i>${keyhole()}</i>${pull()}</button></div>` : ""}<b class="cb-apron">${apron()}</b>${legs(30, "l")}${legs(30, "r")}</div>`;
}
// #/records/all: every record spread out on the desk under the lamp, two by two, each a little askew (the same tilt every
// time: it follows the date). The one above lies over the top of the one below, so no name is covered. A tap brings that
// record to the front of the crate.
const askew = (s) => { const h = [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7); return { rot: ((h % 9) - 4) * .8, dx: ((h >> 4) % 13) - 6 }; };
export function spreadHtml(list) {
  return `<div class="ov-spread">${list.map((r, k) => { const { rot, dx } = askew(r.date);
    return `<a class="ov-it" href="#/records" data-front="${esc(r.date)}" aria-label="${esc(workName(r.a).work)}，放到唱片箱最前面" style="transform:translateX(${dx}px) rotate(${rot.toFixed(1)}deg);z-index:${list.length - k}">${sleeveHtml(r, "calc((min(100vw, 520px) - 54px) / 2)")}</a>`; }).join("")}</div>`;
}
// Back the way it came (a step back in history, not a new entry), so the crate's back arrow then leads out of 唱片櫃.
export function wireSpread(scene, inApp) {
  scene?.addEventListener("click", (e) => {
    const a = e.target.closest("[data-front]"); if (!a) return;
    frontDate = a.dataset.front;
    if (inApp()) { e.preventDefault(); history.back(); }
  });
}
// Another record on the platter: ‹ and a swipe right the next newer, › and a swipe left the next older, 隨機一張 any
// other at random (the owner, 2026-11-23, of these: 「可以」). It stays on the page; a tap on the machine then puts that
// record on the turntable.
export function wireCrate(scene, list) {
  if (!scene || list.length < 2) return;
  let i = Math.max(0, list.findIndex((r) => r.date === frontDate));
  const ph = scene.querySelector("a.ph"), prev = scene.querySelector('[data-flip="-1"]'), next = scene.querySelector('[data-flip="1"]');
  const show = (j, dir) => {
    i = j; frontDate = list[i].date;
    const [href, aria] = deckLink(list, i);
    ph.setAttribute("href", href); ph.setAttribute("aria-label", aria);
    layOn(ph, label(list[i]), dir);
    prev.disabled = i === 0; next.disabled = i === list.length - 1;
  };
  const go = (step) => { const j = Math.min(list.length - 1, Math.max(0, i + step)); if (j !== i) show(j, step); };
  scene.querySelector("[data-rand]")?.addEventListener("click", () => { let j; do j = Math.floor(Math.random() * list.length); while (j === i); show(j, j > i ? 1 : -1); });
  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  const room = scene.querySelector(".cr-room");
  let x0 = 0, y0 = 0, t0 = 0, swiped = false;
  room.addEventListener("touchstart", (e) => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); swiped = false; }, { passive: true });
  room.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
    if (x0 > 24 && Math.abs(dx) > 40 && Math.abs(dx) > 1.5 * Math.abs(dy) && Date.now() - t0 < 900) { swiped = true; go(dx < 0 ? 1 : -1); }
  }, { passive: true });
  room.addEventListener("click", (e) => { if (swiped) { e.preventDefault(); swiped = false; } }, true); // a swipe that ended on the machine is not a tap on it
}
// The record taken off and the next laid on: the old one slides away the way the records turn and fades, the new one
// comes in from the other side (transform and opacity only, a third of a second); with reduced motion it is simply there.
function layOn(ph, lab, dir) {
  const was = ph.querySelector(".ph-rec:not(.off)");
  if (!was) return;
  was.insertAdjacentHTML("afterend", phonoDisc(lab));
  const now = was.nextElementSibling;
  if (calm() || !now.animate) { was.remove(); return; }
  const o = { duration: 340, easing: "cubic-bezier(.2, .8, .2, 1)" }, dx = 30 * dir, gone = () => was.remove();
  was.classList.add("off");
  was.animate([{ opacity: 0, transform: `translate(${-dx}px, 0)` }], { ...o, fill: "forwards" }).finished.then(gone, gone);
  now.animate([{ opacity: 0, transform: `translate(${dx}px, 0)` }, { opacity: 1, transform: "none" }], o);
}

// #/records/<date>: the record on the turntable filling the page — platter, record, tonearm, the 33/45 knobs, and the
// brass plate with the composer, the piece and (once the article is in, fillPlate) the original title; the way to the
// article a small gilt link. A record without a canon name shows the 《…》 of its headline, not the headline again.
export function deckHtml(r) {
  const n = workName(r.a), name = bare(piece(n));
  return `<section class="deck-scene sc-scene sc-desk"><i class="sc-lamp"></i>
    <div class="deck">${discHtml(r, "calc(var(--p) * .932)", "left:3.4%;top:3.4%")}<i class="platter"></i>
      <span class="arm" aria-hidden="true"><i class="rod"></i></span><i class="pivot" aria-hidden="true"></i></div>
    <div class="dk-knobs" aria-hidden="true"><span><i></i>33</span><span><i></i>45</span></div>
    <div class="sc-brass dk-plate"><span class="sc-cut dk-by">${esc(n.by)}</span><b class="sc-cut dk-work${[...name].length > 9 ? " long" : ""}">${esc(name)}</b><span class="sc-cut dk-orig"></span></div>
    <a class="dk-read sh-foil" href="#/a/${esc(r.date)}/music">讀這一篇</a></section>`;
}
// The article's music block, once loaded: the composer as the article gives him in the original (舒伯特（Franz Schubert）
// → Franz Schubert) and the work's original title.
export function fillPlate(scene, block) {
  if (!scene?.isConnected || !block) return;
  const latin = String(block.composer || "").match(/（([^）]+)）|\(([^)]+)\)/), by = scene.querySelector(".dk-by"), orig = scene.querySelector(".dk-orig");
  if (latin && by) by.textContent = (latin[1] || latin[2]).trim();
  if (block.work_original && orig) orig.textContent = String(block.work_original);
}

// The music box: the melody once through, plucked, with the 朱彼特 coda's room; the disc turns while it sounds and the
// arm swings onto it. Answers false when there is nothing to play.
let busyUntil = 0;
export const boxBusy = () => performance.now() < busyUntil; // the music box still sounding
export function playRecord(scene, motif) {
  const notes = parseMotif(motif);
  if (!notes || performance.now() < busyUntil) return false;
  const ctx = audioCtx(); if (!ctx) return false;
  ctx.resume?.();
  const beat = .3, out = ctx.createGain(), wet = ctx.createGain();
  out.gain.value = .8; wet.gain.value = .3;
  out.connect(ctx.destination); out.connect(wet).connect(reverb(ctx));
  let t = ctx.currentTime + .35;
  for (const x of notes) { const d = Math.min(1.6, x.b * beat); if (x.f) pluck(ctx, out, x.f * 2, t, d, .5); t += d; } // an octave up, where a music box sings
  const ms = (t - ctx.currentTime) * 1000 + 600;
  busyUntil = performance.now() + ms;
  scene.classList.add("playing");
  setTimeout(() => scene.classList.remove("playing"), ms);
  return true;
}
