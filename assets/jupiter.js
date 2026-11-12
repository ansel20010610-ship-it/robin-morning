// 朱彼特 (the owner, 2026-11-13: 我很喜歡莫札特 41 交響曲，我可以如何把元素塞進 app — he picked all five ideas).
// This file is the finish box's part: the last pages of the symphony's finale, where its five themes sound at once,
// as the day's paper read to the end. Each article read brings one more voice in (four while reading, the fifth with
// the last article); a tap on the strip, or on the seal once the paper is read, plays the voices gathered so far.
// The yard's Jupiter (nest.js jupiterTap), the four-note end mark (style.css .body::after) and the 10 August stamp
// (feasts.js jupiter) live where their neighbours do.
//
// The notes: bars 388 (second half) to 392 of the finale, the five voices of the public-domain engraving on Wikimedia
// Commons, "Mozart Jupiter Finale final section, bars 389-396 all five themes together.png", read note by note on
// 2026-11-13 (staff lines and noteheads located in its pixels) and checked beat by beat against the harmony it makes
// (C, Dm7, G7, C over E); the voices were matched to the five themes by the colour-coded Commons example
// "Jupiter-fragment.png". Only these bars are played: nothing here is added or made up. Beats are quarter notes; the
// half bar before 389 is two beats, each bar after it four, eighteen in all. The tempo is the engraving's, half note
// = 120. Ties are written as one longer note.
import { toast } from "./util.js";
import { audioCtx } from "./nest.js";

const V = (s) => s.split(" ").map((t) => { const [p, b] = t.split(":"); return [p, Number(b)]; });
// In the order they join: the four notes first (the bass: C D F E in whole notes), the theme that enters last last.
const VOICES = [
  { zh: "Do Re Fa Mi", vol: .15, notes: V("R:2 C3:4 D3:4 F3:4 E3:4") },
  { zh: "上行的四分音符", vol: .1, notes: V("R:2 R:1 C5:1 D5:1 E5:1 F5:1.5 G5:0.5 A5:2 R:1 G4:1 A4:1 B4:1 C5:1.5 D5:0.5 E5:2") },
  { zh: "落下的八分音符", vol: .11, notes: V("R:2 R:2 C5:1.5 C5:0.5 C5:3 B4:0.5 A4:0.5 G4:0.5 A4:0.5 G4:0.5 F4:0.5 E4:0.5 F4:0.5 E4:0.5 D4:0.5 C4:2 C5:2") },
  { zh: "連起來的長音", vol: .12, notes: V("G4:2 E4:2 A4:2.5 G4:0.5 F4:0.5 E4:0.5 F4:0.5 E4:0.5 D4:0.5 C4:0.5 B3:2 G4:2 R:4") },
  { zh: "最後進來的大跳", vol: .1, notes: V("R:2 R:4 R:1 A5:1 D5:1 F5:1 G4:1 B4:1 C5:1 D5:1 E5:1.5 F5:0.5 G5:2") },
];
const BEATS = 18, Q = .25; // seconds a quarter note lasts: half note = 120
const STEP = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (p) => { const m = /^([A-G])(#|b)?(\d)$/.exec(p); return m ? 12 * (Number(m[3]) + 1) + STEP[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) : NaN; };
// Every voice must fill the eighteen beats exactly and every pitch must read; otherwise the strip is left out rather
// than playing something that is not in the score.
const OK = VOICES.every((v) => Math.abs(v.notes.reduce((s, [, b]) => s + b, 0) - BEATS) < 1e-9 && v.notes.every(([p, b]) => b > 0 && (p === "R" || Number.isFinite(midi(p)))));
const LO = 48, HI = 81; // C3 … A5, the lowest and highest notes
const CN = ["", "一", "兩", "三", "四", "五"];

// How many voices a reading has brought: four come one by one while the articles are read, the fifth only with the last.
export const codaVoices = (read, total) => (total > 0 && read >= total ? 5 : total > 0 ? Math.max(0, Math.min(4, Math.ceil((4 * read) / total))) : 0);

// The strip: each voice drawn as a thread of short strokes at the height of its notes (a piano roll), the voices that
// have come in gold, the others as a faint trace. A button: a tap plays what has come.
export function codaHtml(n, done = false) {
  try {
    if (!OK) return "";
    const W = 300, H = 46, x = (b) => (4 + (b * 292) / BEATS).toFixed(1), y = (m) => (3 + ((HI - m) * 40) / (HI - LO)).toFixed(1);
    const bars = [2, 6, 10, 14].map((b) => `<path class="bl" d="M${x(b)} 0V${H}"/>`).join("");
    const threads = VOICES.map((v, i) => {
      let at = 0;
      const segs = v.notes.map(([p, b]) => {
        const s = at; at += b;
        if (p === "R") return "";
        const x0 = 4 + (s * 292) / BEATS, x1 = Math.max(x0 + 1.2, 4 + (at * 292) / BEATS - 1.4);
        return `<path class="n" d="M${x0.toFixed(1)} ${y(midi(p))}H${x1.toFixed(1)}" style="--t:${(s * Q).toFixed(3)}s;--d:${Math.max(.12, b * Q).toFixed(3)}s"/>`;
      }).join("");
      return `<g class="v${i < n ? " on" : ""}">${segs}</g>`;
    }).join("");
    const cap = done || n >= 5 ? "五個主題都到齊了，點一下聽" : n ? `${CN[n]}個聲部進來了，點一下聽` : "讀一篇，第一個聲部就進來";
    return `<button type="button" class="coda${n >= 5 ? " full" : ""}" data-coda="${n}" aria-label="朱彼特終樂章的尾聲：${CN[n] || "零"}個聲部${n ? "，點一下播放" : ""}">`
      + `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${bars}${threads}<path class="ph" d="M4 0V${H}"/></svg>`
      + `<span class="cap"><i>Jupiter · Coda</i>${cap}</span></button>`;
  } catch { return ""; }
}

// ——— The sound ———
// Made on the spot with the Web Audio API (nest.js keeps the one context; the tap is what lets iOS start it). Each
// voice a soft sawtooth through one low-pass filter, a little shorter than written so the notes stay apart; the last
// notes are let ring. Only on a tap, never on its own; one playing at a time.
let busy = 0;
export function playCoda(btn) {
  const n = Number(btn?.dataset?.coda) || 0;
  if (!OK) return;
  if (!n) { toast("讀完一篇，第一個聲部就會進來"); return; }
  if (performance.now() < busy) return;
  const ctx = audioCtx(); if (!ctx) return;
  const t0 = ctx.currentTime + .08;
  const lp = ctx.createBiquadFilter(), comp = ctx.createDynamicsCompressor(), out = ctx.createGain();
  lp.type = "lowpass"; lp.frequency.value = 2400; lp.Q.value = .4; out.gain.value = .9;
  lp.connect(comp).connect(out).connect(ctx.destination);
  for (const v of VOICES.slice(0, n)) {
    let t = t0;
    v.notes.forEach(([p, b], k) => {
      const d = b * Q;
      if (p !== "R") {
        const last = k === v.notes.length - 1, o = ctx.createOscillator(), g = ctx.createGain(), end = t + d * (last ? 1 : .9);
        o.type = "sawtooth"; o.frequency.setValueAtTime(440 * 2 ** ((midi(p) - 69) / 12), t);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v.vol, t + .02); g.gain.setTargetAtTime(v.vol * .7, t + .02, .09); g.gain.setTargetAtTime(0, end, last ? .35 : .035);
        o.connect(g).connect(lp); o.start(t); o.stop(end + (last ? 2 : .3));
      }
      t += d;
    });
  }
  const ms = BEATS * Q * 1000;
  busy = performance.now() + ms + 300;
  const svg = btn.querySelector("svg");
  if (svg) { svg.classList.remove("play"); svg.getBoundingClientRect(); svg.classList.add("play"); setTimeout(() => svg.classList.remove("play"), ms + 400); }
}
