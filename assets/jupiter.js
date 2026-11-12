// 朱彼特 (the owner, 2026-11-13: 我很喜歡莫札特 41 交響曲，我可以如何把元素塞進 app — he picked all five ideas).
// This file is the finish box's part: the last pages of the symphony's finale, where its five themes sound at once,
// as the day's paper read to the end. Each article read brings one more voice in (four while reading, the fifth with
// the last article); a tap on the medallion, or on the seal once the paper is read, plays the voices gathered so far.
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
// Every voice must fill the eighteen beats exactly and every pitch must read; otherwise the medallion is left out rather
// than playing something that is not in the score.
const OK = VOICES.every((v) => Math.abs(v.notes.reduce((s, [, b]) => s + b, 0) - BEATS) < 1e-9 && v.notes.every(([p, b]) => b > 0 && (p === "R" || Number.isFinite(midi(p)))));
const CN = ["", "一", "兩", "三", "四", "五"];

// How many voices a reading has brought: four come one by one while the articles are read, the fifth only with the last.
export const codaVoices = (read, total) => (total > 0 && read >= total ? 5 : total > 0 ? Math.max(0, Math.min(4, Math.ceil((4 * read) / total))) : 0);

// The medallion (the owner, 2026-11-13, picked from three samples: 木星的五道環, with the music box): Jupiter in the
// middle and five rings round it, one per voice, the bass's Do Re Fa Mi innermost in wine. Each note is a bead on its
// ring, round the clock from twelve as the eighteen beats go by, a little in or out with its pitch. Voices that have
// come in are gold, the others a dotted trace. A button: a tap plays what has come, and a slender wine hand with a small
// moon at its tip sweeps once round (he asked for 指針繞一圈再美化一點): a fading gold trail behind it, the beads swelling
// as it reaches them, the circle it travels drawn in gold and shining once when it closes, the Great Red Spot drifting
// across the planet.
let uid = 0;
const C0 = 80, RINGS = [26, 35, 44, 53, 62], ORBIT = 70, CIRC = 2 * Math.PI * ORBIT;
const at = (r, a) => [C0 + r * Math.sin(a), C0 - r * Math.cos(a)]; // a: radians clockwise from twelve o'clock
const f1 = (x) => x.toFixed(1);
export function codaHtml(n, done = false) {
  try {
    if (!OK) return "";
    const id = `jc${++uid}`, cf = (i) => (i ? "" : " cf"), on = (i) => (i < n ? " on" : "");
    const rings = RINGS.map((r, i) => `<circle class="rg${on(i)}${cf(i)}" cx="${C0}" cy="${C0}" r="${r}"/>`).join("");
    const beads = VOICES.map((v, i) => {
      const ms = v.notes.filter(([p]) => p !== "R").map(([p]) => midi(p)), lo = Math.min(...ms), hi = Math.max(...ms);
      let s = 0;
      return v.notes.map(([p, b]) => {
        const t = s; s += b;
        if (p === "R") return "";
        const [x, y] = at(RINGS[i] + (hi > lo ? ((midi(p) - lo) / (hi - lo) - .5) * 5 : 0), (2 * Math.PI * t) / BEATS);
        const r = Math.min(3.2, 1.3 + .4 * b) * (i < n ? 1 : .7);
        return `<circle class="bd${on(i)}${cf(i)}" data-t="${(t * Q).toFixed(3)}" data-d="${(b * Q).toFixed(3)}" cx="${f1(x)}" cy="${f1(y)}" r="${r.toFixed(2)}"/>`;
      }).join("");
    }).join("");
    const [tx, ty] = at(ORBIT, -(2 * Math.PI) / 9); // the trail reaches 40° back
    const defs = `<defs><linearGradient id="${id}t" gradientUnits="userSpaceOnUse" x1="${f1(tx)}" y1="${f1(ty)}" x2="${C0}" y2="${C0 - ORBIT}"><stop class="t0" offset="0"/><stop class="t1" offset="1"/></linearGradient><clipPath id="${id}p"><circle cx="${C0}" cy="${C0}" r="15"/></clipPath></defs>`;
    const trail = `<g class="hand-t"><path d="M${C0} ${C0}L${f1(tx)} ${f1(ty)}A${ORBIT} ${ORBIT} 0 0 1 ${C0} ${C0 - ORBIT}Z" fill="url(#${id}t)"/></g>`;
    const planet = `<g class="jp" clip-path="url(#${id}p)"><circle class="jd" cx="${C0}" cy="${C0}" r="15"/><path class="jb" d="M64 75H96M64 81H96M64 87H96"/><ellipse class="js" cx="86" cy="84" rx="3" ry="1.8"/></g>`;
    const trace = `<circle class="trace" cx="${C0}" cy="${C0}" r="${ORBIT}" transform="rotate(-90 ${C0} ${C0})"/>`;
    const hand = `<g class="hand"><path class="needle" d="M${C0} 62.5L78.9 40 ${C0} 13.5 81.1 40Z"/><circle class="moon" cx="${C0}" cy="${C0 - ORBIT}" r="2.6"/></g>`;
    const cap = done || n >= 5 ? "五個主題都到齊了，點一下聽" : n ? `${CN[n]}個聲部進來了，點一下聽` : "讀一篇，第一個聲部就進來";
    return `<button type="button" class="coda${n >= 5 ? " full" : ""}" data-coda="${n}" aria-label="朱彼特終樂章的尾聲：${CN[n] || "零"}個聲部${n ? "，點一下播放" : ""}">`
      + `<svg viewBox="0 0 160 160" aria-hidden="true">${defs}${trail}${rings}${beads}${trace}${planet}${hand}</svg>`
      + `<span class="cap"><i>Jupiter · Coda</i>${cap}</span></button>`;
  } catch { return ""; }
}

// ——— The sound ———
// A music box, as he chose: made on the spot with the Web Audio API (nest.js keeps the one context; the tap is what lets
// iOS start it). Each note a sine plucked and left to die away, with a faint partial two octaves up for the comb's
// shimmer, through a little room made of decaying noise. Only on a tap, never on its own; one playing at a time.
let busy = 0, room = null, roomOf = null;
function reverb(ctx) {
  if (room && roomOf === ctx) return room;
  const L = Math.floor(ctx.sampleRate * 2.6), buf = ctx.createBuffer(2, L, ctx.sampleRate);
  for (let k = 0; k < 2; k++) { const d = buf.getChannelData(k); for (let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / L) ** 2.8; }
  room = ctx.createConvolver(); room.buffer = buf; room.connect(ctx.destination); roomOf = ctx;
  return room;
}
function pluck(ctx, out, f, t, d, vol) {
  const g = ctx.createGain(), a = ctx.createOscillator(), b = ctx.createOscillator(), bg = ctx.createGain();
  a.type = b.type = "sine"; a.frequency.value = f; b.frequency.value = f * 4; bg.gain.value = .12;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * 1.4, t + .004); g.gain.setTargetAtTime(0, t + .004, .32 + .12 * d);
  a.connect(g); b.connect(bg).connect(g); g.connect(out);
  a.start(t); b.start(t); a.stop(t + 3); b.stop(t + 3);
}
export function playCoda(btn) {
  const n = Number(btn?.dataset?.coda) || 0;
  if (!OK) return;
  if (!n) { toast("讀完一篇，第一個聲部就會進來"); return; }
  if (performance.now() < busy) return;
  const ctx = audioCtx(); if (!ctx) return;
  const t0 = ctx.currentTime + .08, comp = ctx.createDynamicsCompressor(), out = ctx.createGain(), wet = ctx.createGain();
  out.gain.value = .9; wet.gain.value = .32;
  comp.connect(out).connect(ctx.destination); comp.connect(wet).connect(reverb(ctx));
  VOICES.slice(0, n).forEach((v) => { let t = t0; for (const [p, b] of v.notes) { if (p !== "R") pluck(ctx, comp, 440 * 2 ** ((midi(p) - 69) / 12), t, b * Q, v.vol); t += b * Q; } });
  const ms = BEATS * Q * 1000;
  busy = performance.now() + ms + 300;
  sweep(btn.querySelector("svg"), ms);
}

// The hand's one turn, in step with the music (it starts with the first note, 80 ms after the tap).
function sweep(svg, T) {
  if (!svg || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cs = getComputedStyle(svg), WINE = cs.getPropertyValue("--wine").trim() || "#6E2536", GOLD = cs.getPropertyValue("--gold").trim() || "#A5843F", lead = 80;
  const turn = [{ transform: "rotate(0deg)", opacity: 0 }, { opacity: 1, offset: .04 }, { opacity: 1, offset: .96 }, { transform: "rotate(360deg)", opacity: 0 }];
  svg.querySelectorAll(".hand, .hand-t").forEach((g) => g.animate(turn, { duration: T, delay: lead, easing: "linear" }));
  const trace = svg.querySelector(".trace");
  if (trace) {
    trace.animate([{ strokeDashoffset: CIRC, opacity: .85 }, { strokeDashoffset: 0, opacity: .85 }], { duration: T, delay: lead, easing: "linear" });
    trace.animate([{ strokeDashoffset: 0, opacity: 1, strokeWidth: 2 }, { strokeDashoffset: 0, opacity: 0, strokeWidth: .8 }], { duration: 1400, delay: lead + T, easing: "ease-out" });
  }
  svg.querySelectorAll(".bd.on").forEach((el) => {
    const c = el.classList.contains("cf") ? WINE : GOLD, hi = c === WINE ? GOLD : WINE;
    el.animate([{ transform: "scale(1)", fill: c }, { transform: "scale(2)", fill: hi, offset: .12 }, { transform: "scale(1)", fill: c }], { duration: Math.max(520, Number(el.dataset.d) * 1000 + 320), delay: lead + Number(el.dataset.t) * 1000, easing: "ease-out" });
  });
  svg.querySelector(".js")?.animate([{ transform: "translateX(-16px)" }, { transform: "translateX(0)" }], { duration: T, delay: lead, easing: "ease-in-out" });
}
