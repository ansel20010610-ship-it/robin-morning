// 唱片櫃 (the owner's pick, 2026-11-19: the record crate, and a record tapped opens on the turntable): every 古典音樂
// piece read is a record. Its sleeve is the article's picture with a cream band — the work as the canon list names it
// (index.json `work`, scripts/build_index.py music_works) or else the headline. #/records is a walnut crate with the
// newest records standing in it, the newest pulled up in front with its disc half out, and every record below as a
// wall of sleeves; #/records/<date> puts that record on a turntable, and a tap on the disc spins it and plays the
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

export function sleeveHtml(r, size, extra = "") {
  const n = workName(r.a), src = pic(r.a);
  return `<span class="slv" style="--w:${size}px;width:${size}px;height:${size}px;${extra}">${src ? `<img src="${esc(src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '<i class="noimg"></i>'}<span class="mark">KLASSIK</span>
    <span class="band"><b>${esc(piece(n))}</b><span>${esc([n.by, r.date.slice(5).replace("-", "・")].filter(Boolean).join("　"))}</span></span></span>`;
}
export function discHtml(r, size, extra = "") {
  const n = workName(r.a);
  return `<span class="rec" style="--d:${size}px;width:${size}px;height:${size}px;${extra}"><span class="lab"><u>ROTKEHLCHEN</u><b>${esc(piece(n).replace(/^[《〈]|[》〉]$/g, ""))}</b><i>${esc(n.by)}</i></span></span>`;
}

// #/records: the crate (the newest six) and the wall of every record, newest first.
export function crateHtml(list) {
  if (!list.length) return "";
  const front = list.slice(0, 6).reverse(), top = list[0];
  const back = front.slice(0, -1).map((r, k) => `<a class="cr-slot" href="#/records/${esc(r.date)}" aria-label="${esc(workName(r.a).work)}" style="z-index:${k + 1};top:${-150 + k * 18}px;filter:brightness(${(0.55 + k * 0.07).toFixed(2)})">${sleeveHtml(r, 300)}</a>`).join("");
  return `<section class="crate-scene" aria-label="唱片櫃，${list.length} 張"><i class="cr-lamp"></i>
    <div class="crate"><i class="cr-back"></i><i class="cr-side l"></i><i class="cr-side r"></i>${back}
      <a class="cr-top" href="#/records/${esc(top.date)}" aria-label="${esc(workName(top.a).work)}，放上唱盤">${discHtml(top, 250, "left:25px;top:-130px")}${sleeveHtml(top, 300, "transform:rotate(-3deg)")}</a>
      <div class="cr-front"><span class="cr-plate"><span>知更鳥唱片</span></span></div></div>
  </section>
  <div class="sec-head"><h2>全部唱片</h2><span class="de">Sammlung</span><span class="note">${list.length} 張</span></div>
  <div class="rec-wall">${list.map((r) => `<a href="#/records/${esc(r.date)}" aria-label="${esc(workName(r.a).work)}">${sleeveHtml(r, 84)}</a>`).join("")}</div>`;
}

// #/records/<date>: the record on the turntable, its name under it, the way to the article.
export function deckHtml(r, linked = false) {
  const n = workName(r.a);
  return `<section class="deck-scene"><div class="deck">${discHtml(r, 250, "left:36px;top:36px")}<i class="platter"></i>
      <span class="arm"><i class="rod"></i><i class="head"></i><i class="base"></i></span><i class="knob" style="right:30px"></i><i class="knob" style="right:62px"></i></div>
    <p class="deck-now"><b>${esc(n.by ? `${n.by}・${n.work}` : n.work)}</b><span>${esc(r.a.title)}</span></p>
    <p class="deck-hint">${linked ? "點唱片，用 Spotify 播這一篇的錄音" : r.a.motif ? "點唱片，聽這首的旋律；在設定連結 Spotify，就能聽整首" : "在設定連結 Spotify，點唱片就能聽整首"}</p>
    <p class="btns"><a class="btn ghost" href="#/a/${esc(r.date)}/music">讀這一篇</a></p></section>`;
}

// The music box: the melody once through, plucked, with the 朱彼特 coda's room; the disc turns while it sounds and the
// arm swings onto it. Answers false when there is nothing to play.
let busyUntil = 0;
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
