// 雨天套袋 (Regenausgabe; chosen 2026-11-25 out of three samples): on a rainy Taichung morning the day's paper, opened
// for the first time, lies in a clear plastic bag beaded with rain, its mouth folded over the front and shut with the
// paper's round wine sticker (REGENAUSGABE, the robin, the number), a cream tongue under it to pull by. A pull down on
// it peels the sticker, lifts the fold and draws the bag off downwards. A visual touch, not a warning.
// The bag is a fixed layer over the page and under the tab bar (style.css .rbag): the page under it keeps its height and
// its place, so neither putting the bag on nor taking it off moves the front page (the iPhone has no scroll anchoring).
// Everything that moves moves by transform; the film and the drops are painted once.
// When (an editorial rule, drizzle counting): app.js viewFront asks on the first opening of today's paper (the
// Druckfrisch draw), and the bag comes between 07:30 and 11:59 when the hour now is rain in the forecast wetter.js
// already has (no request of its own). With no forecast kept yet, the one on its way is waited for as long as the press
// run's rise (0.9 s), no longer; later, there is no bag that day. At most once a day: a later opening, a redraw, rain
// that comes later, none bring it back. Left unopened — the app put away, another page — it is taken down for good.
// Under the bag the masthead stands as printed: the press roller's line is gone and the masthead's entrance plays at
// once, while the Druckfrisch stamp waits and comes down once the bag is off (.bagged / .unbag, style.css); the 出門前
// card (outdoor-card.js) waits for the bag too (bagGone).
import { twNow, ROBIN_PATHS, store } from "./util.js";
import { calm, mastheadShow } from "./motion.js";
import { keptWeather } from "./wetter.js";

const RISE = 900; // ms: the press run's rise (style.css paper-up)

// WMO codes for rain as Open-Meteo gives them (wetter.js WMO): drizzle 51–57, rain 61–67, showers 80–82, storm 95–99.
const rainCode = (c) => typeof c === "number" && ((c >= 51 && c <= 67) || (c >= 80 && c <= 82) || (c >= 95 && c <= 99));
// A rainy morning by `d`, today's forecast as wetter.js keeps it, at `now` (util.js twNow): between 07:30 and 11:59, and
// the hourly weather code of the hour now is rain. false on anything missing or malformed.
function rainyMorning(d, now) {
  try {
    if (!now || now.minutes < 450 || now.minutes >= 720) return false;
    const hh = String(Math.floor(now.minutes / 60)).padStart(2, "0");
    const i = d.hourly.time.indexOf(`${now.date}T${hh}:00`);
    return i >= 0 && rainCode(d.hourly.weather_code[i]);
  } catch { return false; }
}

// ——— The rain on the film ———
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// The inks: on the light paper the shadows are the paper's own brown; on the dark one they are black and a little
// stronger, and the light the drops catch is dimmer, so the film reads as wet rather than milky.
const inks = (dark) => ({
  sh: (rgb, a) => (dark ? `rgba(0,0,0,${Math.min(1, a * 1.8).toFixed(3)})` : `rgba(${rgb},${a})`),
  hi: (a) => `rgba(255,255,255,${dark ? (a * 0.55).toFixed(3) : a})`,
});

// One drop of radius r at (x, y): a soft shadow on the paper under it, a body darker at its rim (the light bent away),
// the light gathered in its lower half, and a sharp highlight up and to the left. Larger drops sag and wobble a little.
function drop(g, x, y, r, R, ink) {
  const k = r > 2.6 ? 1 : 0, n = 22, ph = R() * 6.28, ph2 = R() * 6.28, sq = 0.88 + R() * 0.12;
  const path = () => {
    g.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * 6.283, w = 1 + k * (0.07 * Math.sin(2 * a + ph) + 0.05 * Math.sin(3 * a + ph2)) + (Math.sin(a) > 0 ? 0.06 * Math.sin(a) : 0);
      const px = x + Math.cos(a) * r * w, py = y + Math.sin(a) * r * w * sq;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.closePath();
  };
  // shadow, offset down
  let s = g.createRadialGradient(x + r * 0.12, y + r * 0.42, 0, x + r * 0.12, y + r * 0.42, r * 1.28);
  s.addColorStop(0, ink.sh("58,44,26", 0.13)); s.addColorStop(0.7, ink.sh("58,44,26", 0.07)); s.addColorStop(1, ink.sh("58,44,26", 0));
  g.fillStyle = s; g.beginPath(); g.arc(x + r * 0.12, y + r * 0.42, r * 1.28, 0, 6.283); g.fill();
  path();
  // the body: clear in the middle, dark at the rim
  s = g.createRadialGradient(x - r * 0.1, y - r * 0.12, r * 0.1, x, y, r * 1.06);
  s.addColorStop(0, ink.hi(0.10)); s.addColorStop(0.55, ink.hi(0.03)); s.addColorStop(0.8, ink.sh("84,68,46", 0.16)); s.addColorStop(1, ink.sh("60,48,32", 0.42));
  g.fillStyle = s; g.fill();
  g.save(); g.clip();
  // the light gathered low in the drop
  s = g.createRadialGradient(x + r * 0.08, y + r * 0.62, 0, x + r * 0.08, y + r * 0.62, r * 0.78);
  s.addColorStop(0, ink.hi(0.62)); s.addColorStop(1, ink.hi(0));
  g.fillStyle = s; g.fillRect(x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4);
  // the upper rim a little darker still (the sky seen through the top of the drop)
  s = g.createLinearGradient(x, y - r, x, y);
  s.addColorStop(0, ink.sh("60,50,36", 0.16)); s.addColorStop(1, ink.sh("60,50,36", 0));
  g.fillStyle = s; g.fillRect(x - r * 1.2, y - r * 1.2, r * 2.4, r * 1.2);
  g.restore();
  // highlights
  g.save(); g.translate(x - r * 0.38, y - r * 0.42); g.rotate(-0.6);
  g.fillStyle = ink.hi(0.95); g.beginPath(); g.ellipse(0, 0, Math.max(0.5, r * 0.26), Math.max(0.35, r * 0.15), 0, 0, 6.283); g.fill();
  g.restore();
  if (r > 3) { g.fillStyle = ink.hi(0.55); g.beginPath(); g.arc(x + r * 0.34, y + r * 0.5, r * 0.09, 0, 6.283); g.fill(); }
}

// Mist: the fine beading between the drops, each a dark rim under a bright point.
function mist(g, x, y, r, ink) {
  g.fillStyle = ink.sh("70,56,38", 0.20); g.beginPath(); g.arc(x, y + r * 0.25, r, 0, 6.283); g.fill();
  g.fillStyle = ink.hi(0.75); g.beginPath(); g.arc(x - r * 0.2, y - r * 0.25, r * 0.62, 0, 6.283); g.fill();
}

// The drops, drawn once into `canvas` at w × h CSS pixels: the fine beading, five drops that have run down (each
// leaving a clear path through the mist with a few beads left on it), then the middling and the large drops. `keep`:
// rectangles left dry (the sticker).
function drawRain(canvas, { w, h, seed, keep = [], dark = false }) {
  const R = rng(seed), ink = inks(dark), dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
  const g = canvas.getContext("2d");
  g.scale(dpr, dpr);
  const dry = (x, y, m = 0) => keep.some((k) => x > k.x - m && x < k.x + k.w + m && y > k.y - m && y < k.y + k.h + m);
  // the haze of the fine beading, a little lighter than the film
  g.fillStyle = ink.hi(0.045); g.fillRect(0, 0, w, h);
  const runs = Array.from({ length: 5 }, () => { const x = 24 + R() * (w - 48), y1 = h * (0.25 + R() * 0.6); return { x, y0: y1 - (120 + R() * 260), y1, r: 4.2 + R() * 2.6, sway: (R() - 0.5) * 10 }; });
  const onRun = (x, y) => runs.some((t) => y > t.y0 - 4 && y < t.y1 && Math.abs(x - (t.x + t.sway * (y - t.y0) / (t.y1 - t.y0))) < t.r * 0.9);
  for (let i = 0; i < 2600; i++) {
    const x = R() * w, y = R() * h;
    if (onRun(x, y) || dry(x, y)) continue;
    mist(g, x, y, 0.35 + R() * R() * 1.1, ink);
  }
  // the runs: the haze wiped off along each path, then a few beads left behind and the drop at its foot
  g.save(); g.globalCompositeOperation = "destination-out";
  for (const t of runs) {
    g.lineCap = "round"; g.lineWidth = t.r * 1.5; g.strokeStyle = "rgba(0,0,0,.9)";
    g.beginPath(); g.moveTo(t.x, t.y0); g.quadraticCurveTo(t.x + t.sway * 0.3, (t.y0 + t.y1) / 2, t.x + t.sway, t.y1 - t.r); g.stroke();
  }
  g.restore();
  for (const t of runs) {
    g.strokeStyle = ink.hi(0.22); g.lineWidth = 0.6;
    for (const side of [-1, 1]) { g.beginPath(); g.moveTo(t.x + side * t.r * 0.72, t.y0 + 6); g.quadraticCurveTo(t.x + t.sway * 0.3 + side * t.r * 0.72, (t.y0 + t.y1) / 2, t.x + t.sway + side * t.r * 0.72, t.y1 - t.r * 1.4); g.stroke(); }
    const beads = 2 + Math.floor(R() * 4);
    for (let b = 0; b < beads; b++) { const f = R() * 0.8; drop(g, t.x + t.sway * f * f + (R() - 0.5) * 1.5, t.y0 + (t.y1 - t.y0) * f, 0.8 + R() * 1.3, R, ink); }
    drop(g, t.x + t.sway, t.y1, t.r, R, ink);
  }
  for (let i = 0; i < 170; i++) { const x = R() * w, y = R() * h; if (!dry(x, y, 3)) drop(g, x, y, 1.3 + R() * 1.8, R, ink); }
  for (let i = 0; i < 64; i++) {
    const x = 10 + R() * (w - 20), y = 10 + R() * (h - 20), r = 2.8 + R() * R() * 8.5;
    if (dry(x, y, r + 2) || onRun(x, y)) continue;
    drop(g, x, y, r, R, ink);
    if (R() < 0.18) drop(g, x + r * (0.9 + R() * 0.4), y + r * (R() - 0.3), r * (0.45 + R() * 0.3), R, ink); // two drops about to run together
  }
}

// ——— The bag ———
// The paper's round sticker: wine, a gold ring, the robin in cream, REGENAUSGABE round the top and the issue's number
// under the bird, a cream tongue below it to pull by.
const sticker = (no) => `<i class="rb-sticker"><svg viewBox="0 0 64 64" aria-hidden="true">
  <circle class="disc" cx="32" cy="32" r="31"/><circle class="ring" cx="32" cy="32" r="27.6"/><circle class="ring thin" cx="32" cy="32" r="19.4"/>
  <defs><path id="rbArc" d="M9.4 36.5 A23 23 0 1 1 54.6 36.5"/></defs><text class="arc"><textPath href="#rbArc" startOffset="50%">REGENAUSGABE</textPath></text>
  <g class="bird" transform="translate(17.6 16.5) scale(.45)">${ROBIN_PATHS}</g><text class="no" x="32" y="51.2">No. ${no}</text></svg>
  <span class="tongue">拉</span></i>`;
const bagHtml = (no) => `<div class="rb-body"><i class="rb-film"></i><i class="rb-mouth"></i><i class="rb-flap"></i><canvas class="rb-drops"></canvas>${sticker(no)}</div>`;
// the sticker and its tongue, kept dry: a little round the sticker as it is placed (style.css, under the status bar's
// inset on the phone), in CSS pixels from the bag's top left
const dryOf = (st) => [{ x: st.offsetLeft - 4, y: st.offsetTop - 5, w: 68, h: 84 }];
const FOLD = 70; // px of pull that peel the sticker and lift the fold before the bag itself comes down

// The pose of the bag at pull `y`: px the bag has come down, or < 0 pushed up and away.
function pose(el, y) {
  const up = y < 0, a = up ? 1 : Math.min(1, y / FOLD);
  el.style.setProperty("--open", a.toFixed(3));
  el.querySelector(".rb-body").style.transform = `translate3d(0, ${(up ? y : Math.max(0, y - FOLD)).toFixed(1)}px, 0)`;
  el.querySelector(".rb-sticker").style.transform = `translate3d(0, ${(a * 26).toFixed(1)}px, 0) rotate(${(-a * 14).toFixed(1)}deg)`;
}

let token = 0; // the latest ask or take-down: an older ask still waiting for the forecast gives way
let asked = ""; // the day a bag was last decided for in this session (also where storage cannot keep rm.done)
let waiting = ""; // the day an ask is still waiting for the forecast: a redraw meanwhile does not ask again
// The days a bag was decided for on this device (rm.rainbag, the last 60 dates): the bag taken off, or a visible front page
// found the hour dry. Not rm.opened (app.js fresh): that is spent by any draw — one in the background at 07:00, the
// reload a new shell asks for — before the bag could be decided; on 2026-11-26 the 出門前 card came and the bag did not.
const DONE = "rainbag";
// The page being unloaded (a reload for a new shell, app.js watchUpdates): pagehide comes before the hidden page's
// visibilitychange (app.js dropBag), and a bag taken off for that is not decided — the page loaded next asks again.
let leaving = false;
addEventListener("pagehide", () => { leaving = true; });
addEventListener("pageshow", () => { leaving = false; });
const doneFor = (date) => { const s = store.get(DONE, []); return asked === date || (Array.isArray(s) && s.includes(date)); };
function markDone(date) {
  asked = date;
  const s = store.get(DONE, []), list = Array.isArray(s) ? s : [];
  if (!list.includes(date)) store.set(DONE, [...list, date].slice(-60));
}
let takeDown = null; // takes the bag on now off at once
let gone = Promise.resolve(); // settles once no bag is on or still to be decided

// What the 出門前 card waits for before it may come up: no bag on, none still to be decided, and the stamp's landing
// started (the card then waits for the masthead's own animations as before, the stamp's among them).
export const bagGone = () => gone;

// The page goes (app.js route) or the app is put away: a bag still on is taken off at once, for good — the stamp
// comes down under whatever is shown next — and an ask still waiting for the forecast is dropped.
export function dropBag() {
  token++;
  takeDown?.();
}

// Each draw of today's front page (app.js viewFront) until the bag is decided for the day (doneFor): `head` the masthead,
// `weather` the promise of the day's forecast the front page is already fetching (fillWeather), `no` the issue's number
// for the sticker. Before 07:30, with the page hidden or gone, or with no forecast, nothing is decided and the next draw
// asks again. Never throws; on anything that goes wrong there is no bag.
export function rainBag({ head, weather, no }) {
  try {
    const now = twNow();
    if (!head || doneFor(now.date) || waiting === now.date || now.minutes < 450 || now.minutes >= 720) return;
    waiting = now.date;
    const my = ++token, t0 = performance.now();
    let settle;
    gone = new Promise((r) => { settle = r; });
    const decide = (d) => {
      if (waiting === now.date) waiting = "";
      try {
        // the front page drawn again in place while the forecast was on its way (a refetch, the app brought back): the
        // bag goes on the masthead on the page now
        const cur = head.isConnected ? head : (location.hash || "#/") === "#/" ? document.querySelector("#main .masthead") : null;
        if (my === token && cur && !document.hidden && d) {
          if (rainyMorning(d, now)) { put(cur, no, settle, now.date); return; }
          markDone(now.date); // seen, and the hour is dry: no bag today
        }
      } catch { takeDown?.(); } // no bag: one already on the page comes off again
      settle();
    };
    const kept = keptWeather();
    if (kept) { decide(kept); return; }
    Promise.race([Promise.resolve(weather).catch(() => null), new Promise((r) => setTimeout(r, Math.max(0, RISE - (performance.now() - t0))))]).then(decide);
  } catch { /* no bag */ }
}

function put(head, no, settle, date) {
  const quiet = calm(), w = innerWidth, h = innerHeight;
  const el = document.createElement("div");
  el.className = "rbag";
  el.setAttribute("role", "button");
  el.setAttribute("aria-label", "雨天套袋，往下拉開");
  el.tabIndex = 0;
  el.innerHTML = bagHtml(no);
  let y = 0, y0 = null, t0 = 0, anim = 0, touched = 0, off = false;
  // off: the bag taken away, the stamp let down (.unbag restarts its landing at a short delay), the card free to come.
  // Set before the bag is on the page, so whatever fails after this point takes it off again (rainBag).
  const end = () => {
    if (off) return;
    off = true;
    if (!leaving) markDone(date); // taken off — pulled open, or the page or the app put away: not again today
    cancelAnimationFrame(anim);
    el.remove();
    takeDown = null;
    head.classList.remove("bagged");
    head.classList.add("unbag");
    settle();
  };
  takeDown = end;
  document.body.append(el);
  try {
    drawRain(el.querySelector(".rb-drops"), { w, h, seed: 47, keep: dryOf(el.querySelector(".rb-sticker")), dark: /dark/.test(getComputedStyle(document.documentElement).colorScheme) });
  } catch { /* a bag without drops */ }
  pose(el, 0);
  // the masthead as printed under the film: no roller, the entrance let go now (motion.js pressRun then leaves it be),
  // the stamp held until the bag is off
  head.querySelector(".roller")?.remove();
  head.classList.add("bagged");
  if (head.classList.contains("fresh")) { head.classList.remove("fresh"); mastheadShow(head); }
  // Comes up with the page: the same rise (style.css paper-up — 14% of the page's height, 0.9 s), joined where the page is
  // in it now, for a forecast that came in while it was rising.
  const main = document.getElementById("main"), rise = main?.getAnimations?.().find((a) => a.animationName === "paper-up");
  if (rise && !quiet && el.animate) {
    const a = el.animate([{ transform: `translate3d(0, ${(main.offsetHeight * 0.14).toFixed(1)}px, 0)`, opacity: 0.6 }, { transform: "none", opacity: 1 }],
      { duration: RISE, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" });
    a.currentTime = Number(rise.currentTime) || 0;
  }
  const tween = (to, ms, then) => {
    cancelAnimationFrame(anim);
    const from = y, s = performance.now();
    const step = (t) => { const k = Math.min(1, (t - s) / ms), e = to > from ? k * k * (3 - 2 * k) : 1 - (1 - k) * (1 - k); y = from + (to - from) * e; pose(el, y); if (k < 1) anim = requestAnimationFrame(step); else then?.(); };
    anim = requestAnimationFrame(step);
  };
  // Down past a third of the screen (or a quick flick down, or a tap on the sticker): it comes away downwards. A swipe
  // up takes it away upwards, without the tearing, so a reader who only meant to scroll is not held up. Short of a
  // third it settles back. With reduced motion nothing slides: any touch fades it out in 0.2 s.
  const away = (dir) => {
    if (off) return;
    if (quiet) { el.classList.add("fade"); setTimeout(end, 220); return; }
    tween(dir > 0 ? h + 60 : -h - 60, dir > 0 ? 420 : 300, end);
  };
  el.addEventListener("touchstart", (e) => { if (e.touches.length === 1) { y0 = e.touches[0].clientY; t0 = performance.now(); cancelAnimationFrame(anim); } }, { passive: true });
  el.addEventListener("touchmove", (e) => {
    e.preventDefault(); // the page under the bag does not move while it is on (下拉更新, pull.js, stands aside for it too)
    if (y0 == null || quiet) return;
    const dy = e.touches[0].clientY - y0;
    y = dy > 0 ? dy * 0.9 : dy * 0.5; pose(el, y);
  }, { passive: false });
  el.addEventListener("touchend", (e) => {
    touched = performance.now();
    if (y0 == null) return;
    const dy = (e.changedTouches[0]?.clientY ?? y0) - y0, fast = dy / Math.max(1, performance.now() - t0) > 0.6;
    y0 = null;
    if (quiet) { away(1); return; }
    if (Math.abs(dy) < 6) {
      if (e.target.closest?.(".rb-sticker")) away(1);
      else { el.classList.add("nudge"); setTimeout(() => el.classList.remove("nudge"), 600); } // the sticker shows where to pull
      return;
    }
    if (dy < 0) away(-1); else if (y > h / 3 || fast) away(1); else tween(0, 240);
  }, { passive: true });
  el.addEventListener("touchcancel", () => { if (y0 == null) return; y0 = null; if (!quiet) tween(0, 240); }, { passive: true });
  // Enter or the space bar, or a click that no touch came before (a keyboard, VoiceOver): opened as a tap on the sticker
  el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); away(1); } });
  el.addEventListener("click", () => { if (performance.now() - touched > 800) away(1); });
}
