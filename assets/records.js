// 唱片櫃 (the owner's pick, 2026-11-19: the record crate, and a record tapped opens on the turntable): every 古典音樂
// piece read is a record. Its sleeve is the article's picture with the work in gilt — as the canon list names it
// (index.json `work`, scripts/build_index.py music_works) or else the headline. #/records is the crate on a sideboard
// in the panelled room (one full-bleed scene, the owner's 「對，照這樣改」 of 2026-11-19), the front record pulled up
// with its disc half out; #/records/<date> puts that record on a turntable, and a tap on the disc spins it and plays the
// recording through Spotify (app.js viewRecord), or without Spotify the article's melody (index.json `motif`) as a music box. Wood is the bookcase's photograph (assets/shelf/, CC0).
import { esc } from "./util.js";
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

// #/records: the crate on the sideboard. The front record (the newest first) is pulled up with its disc half out; a
// tap on it puts it on the turntable, a swipe (or the ‹ › on the sideboard) flips through the crate. The count is cut
// in the sideboard's brass in Roman figures.
let frontDate = ""; // the record left in front, so the way back from the turntable finds the crate as it was left
const SLEEVE = "min(292px, calc(100vw - 110px))";
function stackHtml(list, i, dir = "") {
  const top = list[i], back = list.slice(i + 1, i + 6).reverse();
  const k0 = 5 - back.length; // the furthest back stands lowest and darkest
  return back.map((r, j) => { const k = k0 + j; return `<span class="cr-slot" aria-hidden="true" style="z-index:${k + 1};--k:${k};filter:brightness(${(0.5 + k * 0.07).toFixed(2)})">${sleeveHtml(r, SLEEVE)}</span>`; }).join("")
    + `<a class="cr-top${dir ? ` in-${dir}` : ""}" href="#/records/${esc(top.date)}" aria-label="${esc(workName(top.a).work)}，第 ${i + 1} 張，共 ${list.length} 張，放上唱盤">${discHtml(top, "calc(var(--s) * .856)", "")}${sleeveHtml(top, SLEEVE, "transform:rotate(-2.5deg)")}</a>`;
}
export function crateHtml(list) {
  const i = Math.max(0, list.findIndex((r) => r.date === frontDate));
  return `<div class="cr-room" aria-label="唱片櫃，${list.length} 張">
      <div class="crate"><i class="cr-back"></i><div class="cr-stack">${list.length ? stackHtml(list, i) : ""}</div><i class="cr-side l"></i><i class="cr-side r"></i><div class="cr-front"></div></div></div>
    <i class="cr-sb-top"></i>
    <div class="cr-sb">${list.length > 1 ? `<button type="button" class="cr-flip sh-foil" data-flip="-1" aria-label="較新的一張"${i ? "" : " disabled"}>‹</button>` : ""}
      <span class="sc-brass cr-plate"><span class="sc-cut">Schallplatten</span><span class="sc-cut n">${list.length ? ROMAN(list.length) : "—"}</span></span>
      ${list.length > 1 ? `<button type="button" class="cr-flip sh-foil" data-flip="1" aria-label="較舊的一張"${i < list.length - 1 ? "" : " disabled"}>›</button>` : ""}</div>`;
}
// Flipping through the crate: a swipe left brings the next older record to the front, right the newer; the buttons too.
export function wireCrate(scene, list) {
  if (!scene || list.length < 2) return;
  let i = Math.max(0, list.findIndex((r) => r.date === frontDate));
  const stack = scene.querySelector(".cr-stack"), prev = scene.querySelector('[data-flip="-1"]'), next = scene.querySelector('[data-flip="1"]');
  const go = (step) => {
    const j = Math.min(list.length - 1, Math.max(0, i + step));
    if (j === i) return;
    i = j; frontDate = list[i].date;
    stack.innerHTML = stackHtml(list, i, step > 0 ? "l" : "r");
    prev.disabled = i === 0; next.disabled = i === list.length - 1;
  };
  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  const room = scene.querySelector(".cr-room");
  let x0 = 0, y0 = 0, t0 = 0, swiped = false;
  room.addEventListener("touchstart", (e) => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); swiped = false; }, { passive: true });
  room.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
    if (Math.abs(dx) > 40 && Math.abs(dx) > 1.5 * Math.abs(dy) && Date.now() - t0 < 900) { swiped = true; go(dx < 0 ? 1 : -1); }
  }, { passive: true });
  room.addEventListener("click", (e) => { if (swiped) { e.preventDefault(); swiped = false; } }, true); // a swipe that ended on the front sleeve is not a tap on it
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
