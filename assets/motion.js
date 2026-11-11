// Motion: the gold-leaf moments. All of it is decoration — with reduced motion, or where a browser lacks an API, every
// page works the same without it.
import { ROBIN_PATHS, roman } from "./util.js";

export const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Cards rise into place as they scroll into view; the ones arriving together come one after another.
export function reveal(root) {
  if (calm() || !("IntersectionObserver" in window)) return () => {};
  let n = 0, last = 0;
  const io = new IntersectionObserver((entries) => {
    const now = performance.now();
    if (now - last > 150) n = 0;
    last = now;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.style.setProperty("--d", `${Math.min(n++, 7) * 70}ms`);
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  }, { rootMargin: "0px 0px -6% 0px" });
  root.querySelectorAll(".lead, .item, .sec-head, .digest, .finish, .issue-row, .colophon, .set, .gig, .jahr, .stats, .colbars")
    .forEach((el) => { el.classList.add("rv"); io.observe(el); });
  return () => io.disconnect();
}

// 銅版畫: the article's opening picture is plated (style.css figure.hero.plate) once it is in place — it settles, a gilt
// line draws round it, and it drifts with the scroll. A picture that morphs in from its card is plated when the morph
// has landed, so the settle does not fight the morph; `el` is the picture's frame or anything inside the figure.
export const plate = (el) => el?.closest("figure.hero")?.classList.add("plate");

// Page changes cross-fade, and a card's picture grows into the article's opening picture (View Transitions; iOS 18+).
// `from`/`to` name the two boxes that are one and the same (a card's image, the article picture's frame — the frame,
// not the image, because a capture is never clipped by its ancestors and the plated image is cut larger than its
// frame); `update` draws the new page. `dir` ("left" | "right") is a page turned within the issue (app.js swipe, the
// contents sheet): the old page slides off that way and the new one slides in behind it (style.css html.turn-*)
// instead of the cross-fade; the class is on <html> only for the length of the transition.
export async function transition(update, { from = null, to = null, dir = null, lean = 0, ms = 0 } = {}) {
  if (calm() || !document.startViewTransition) { await update(); plate(to?.()); return; }
  const root = document.documentElement;
  if (from) from.style.viewTransitionName = "hero";
  if (dir) { // `lean`: the old page is captured where the finger left it, so the slide starts from there; `ms`: its pace
    root.classList.add(`turn-${dir}`);
    root.style.setProperty("--lean", `${lean || 0}px`);
    if (ms) root.style.setProperty("--turn-ms", `${ms}ms`);
  }
  const vt = document.startViewTransition(async () => {
    if (from) from.style.viewTransitionName = "";
    await update();
    const el = to?.();
    if (el) el.style.viewTransitionName = "hero";
  });
  vt.ready.catch(() => {}); // a transition cut short by the next tap is skipped; that is fine
  vt.finished.catch(() => {}).finally(() => {
    if (dir) { root.classList.remove("turn-left", "turn-right"); root.style.removeProperty("--lean"); root.style.removeProperty("--turn-ms"); }
    const el = to?.();
    if (el) { el.style.viewTransitionName = ""; plate(el); }
  });
  return vt.updateCallbackDone.catch(() => {});
}

// 隨手翻: the card turns over like a playing card. With `update`, the face on the table turns away to its edge first, the
// content is swapped behind it, and the new face turns in; without, a fresh card simply turns in. The turn-out is
// cancelled once the turn-in starts, or its forwards fill would snap back after. calm(): the content is just swapped.
export async function flip(el, update) {
  if (calm() || !el?.animate) { update?.(); return; }
  const p = "perspective(900px)";
  if (update) {
    const out = el.animate([{ transform: `${p} rotateY(0)` }, { transform: `${p} rotateY(90deg)`, opacity: .7 }], { duration: 170, easing: "ease-in", fill: "forwards" });
    await out.finished.catch(() => {});
    update();
    out.cancel();
  }
  el.animate([{ transform: `${p} rotateY(-90deg)`, opacity: .5 }, { transform: `${p} rotateY(0)`, opacity: 1 }], { duration: 380, easing: "cubic-bezier(.2,.8,.2,1)" });
}

// The finish line: the seal comes down (style.css .finish.stamp — the card dips once under it), a handful of gold leaf is
// thrown up around it, and gold leaf rains down the page.
export function celebrate(el) {
  el.classList.add("stamped"); // not "stamp": that is the postage stamp tile (stamps.js), whose aspect-ratio would stretch this box (the owner, 2026-11-06)
  navigator.vibrate?.([14, 60, 22]);
  if (calm()) return;
  rain();
  const burst = document.createElement("div");
  burst.className = "flakes";
  burst.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2 + Math.random() * 0.35, r = 60 + Math.random() * 110;
    const f = document.createElement("i");
    f.style.cssText = `--x:${(Math.cos(a) * r).toFixed(1)}px;--y:${(Math.sin(a) * r * 0.75 - 30).toFixed(1)}px;`
      + `--r:${Math.round(Math.random() * 600 - 300)}deg;--s:${(0.55 + Math.random() * 0.9).toFixed(2)};--d:${Math.round(Math.random() * 140)}ms`;
    burst.append(f);
  }
  el.prepend(burst);
  setTimeout(() => burst.remove(), 2000);
}

// Gold leaf falling across the whole screen for a couple of seconds: squares, discs and slivers, swaying as they fall.
export function rain(count = 72) {
  if (calm()) return;
  const sky = document.createElement("div");
  sky.className = "leaf-rain";
  sky.setAttribute("aria-hidden", "true");
  for (let i = 0; i < count; i++) {
    const f = document.createElement("i");
    f.className = ["sq", "dot", "sliver", "sq"][i % 4];
    f.style.cssText = `left:${(Math.random() * 100).toFixed(1)}vw;--sx:${Math.round(Math.random() * 80 - 40)}px;--r:${Math.round(Math.random() * 900 - 450)}deg;`
      + `--s:${(0.6 + Math.random() * 1.1).toFixed(2)};--t:${(1.9 + Math.random() * 1.3).toFixed(2)}s;--d:${Math.round(Math.random() * 700)}ms`;
    sky.append(f);
  }
  document.body.append(sky);
  setTimeout(() => sky.remove(), 4200);
}

// The masthead's entrance, on top of its CSS: a spray of Klimt-style gold tesserae flies out of the crest and settles
// as a faint mosaic behind the title. It also watches the masthead: scrolled out of view, the title's gold sweep is
// paused (.away, style.css) instead of being drawn for nobody. There is only ever one masthead, so one watcher — the
// previous one is let go each time the front page is drawn again.
let headWatch = null;
export function mastheadShow(head) {
  if (calm() || !head) return;
  headWatch?.disconnect();
  headWatch = null;
  if ("IntersectionObserver" in window) {
    headWatch = new IntersectionObserver((es) => {
      for (const e of es) {
        if (!e.target.isConnected) { headWatch?.disconnect(); headWatch = null; return; }
        e.target.classList.toggle("away", !e.isIntersecting);
      }
    });
    headWatch.observe(head);
  }
  const crest = head.querySelector(".crest");
  if (!crest) return;
  head.querySelector(".mosaic")?.remove();
  const hb = head.getBoundingClientRect(), cb = crest.getBoundingClientRect();
  const cx = cb.left + cb.width / 2 - hb.left, cy = cb.top + cb.height / 2 - hb.top;
  const field = document.createElement("div");
  field.className = "mosaic";
  field.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 46; i++) {
    const t = document.createElement("i");
    const x = Math.random() * hb.width, y = 8 + Math.random() * (hb.height - 16);
    t.className = ["sq", "dot", "ring", "sq", "eye"][i % 5];
    t.style.cssText = `left:${cx.toFixed(0)}px;top:${cy.toFixed(0)}px;--x:${(x - cx).toFixed(0)}px;--y:${(y - cy).toFixed(0)}px;`
      + `--r:${Math.round(Math.random() * 360)}deg;--s:${(0.55 + Math.random() * 1.1).toFixed(2)};--d:${Math.round(120 + Math.random() * 520)}ms`;
    field.append(t);
  }
  head.prepend(field);
}

// Druckfrisch — an issue opened for the first time on this device (app.js viewFront) comes off the press before the
// masthead's entrance: the whole page rises from the bottom as a sheet leaving the rollers (#main.press, style.css
// paper-up), an ink line rolls across its head (.roller), and a wine rubber stamp with the number and the day lands at
// the top right, its square echo spreading from under it (.stamp-date). The masthead's own animations are held by
// .fresh until the stamp has landed (1.5s); then they play as on any other morning, mosaic included (mastheadShow).
// calm(): nothing moves and nothing is held — the stamp is simply there, the entrance is not played anyway.
export function pressRun(head) {
  if (!head) return;
  if (calm()) { head.classList.remove("fresh"); return; }
  const page = head.closest("#main") || head.parentElement;
  page?.classList.add("press");
  setTimeout(() => {
    page?.classList.remove("press"); // the sheet is flat again: sticky bars work as before
    head.querySelector(".roller")?.remove();
    if (!head.isConnected) return; // the reader has already gone elsewhere
    head.classList.remove("fresh");
    mastheadShow(head);
  }, 1500);
}

// A gold ripple from the point a card or button is pressed.
export function ripples() {
  document.addEventListener("pointerdown", (e) => {
    if (calm()) return;
    const el = e.target.closest(".lead, .item, .btn, .issue-row, .chip, .opt, .nav a, a.gig");
    if (!el) return;
    const r = el.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2.2;
    const w = document.createElement("span");
    w.className = "ripple";
    w.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    el.append(w);
    setTimeout(() => w.remove(), 700);
  }, { passive: true });
}

// A gold laurel round a number (the reading streak), or round the seal below.
// Two branches climb from the bottom up either side; each leaf lies along the circle (radius `r` in the 64 box), tipped
// a little outward.
const leaf = (x, y, rot, i) => `<g transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"><ellipse style="--i:${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5.2" ry="2.1"/></g>`;
const branch = (mirror, r) => Array.from({ length: 7 }, (_, i) => {
  const deg = 252 - i * 22, t = deg * Math.PI / 180;
  const x = 32 + Math.cos(t) * r, y = 32 - Math.sin(t) * r;
  const along = Math.atan2(-Math.cos(t), -Math.sin(t)) * 180 / Math.PI + 28;
  return mirror ? leaf(64 - x, y, 180 - along, i) : leaf(x, y, along, i);
}).join("");
const wreath = (r = 23) => `<svg viewBox="0 0 64 64"><g>${branch(false, r)}${branch(true, r)}</g></svg>`;
export const laurel = (n) => `<span class="laurel" aria-hidden="true">${wreath()}<b>${n}</b></span>`;

// 社印 — the paper's seal, stamped on the finish line when the day's digest is read (app.js finishInner) and left in
// small on the archive's finished issues. A 64-unit round stamp in wine ink: the paper's name along the top of the
// ring, GELESEN along the bottom (hung from a larger circle so it reads upright), two Secession squares between them,
// the crest's robin in one colour in the middle, and the day under it in the Viennese manner (1. XI. 2026) as on the
// Druckfrisch stamp. It is set a touch askew (--tilt, ±2°, drawn fresh each time) and style.css multiplies it into the
// paper and thins its ink unevenly towards the edge. From a streak of two the laurel wraps round it instead of
// standing in for it (.wreathed). `mini` is the archive's 18px version: rings and bird only, with a label of its own
// since no text stands beside it. The arc paths carry their own ids: several seals share a page.
let sealN = 0;
export function seal(date, n = 0, mini = false) {
  const [y, m, d] = String(date).split("-").map(Number);
  const id = `sl${++sealN}`, tilt = (Math.random() * 4 - 2).toFixed(1);
  const sq = (x, y) => `<rect class="sq" x="-1.2" y="-1.2" width="2.4" height="2.4" transform="translate(${x} ${y}) rotate(45)"/>`;
  // The name runs 220° over the top (from 8 o'clock round to 4), GELESEN 90° under the bottom; the squares sit between.
  const text = mini ? "" : `<defs><path id="${id}a" d="M8.9 40.4 A24.6 24.6 0 1 1 55.1 40.4"/><path id="${id}b" d="M12.6 51.4 A27.5 27.5 0 0 0 51.4 51.4"/></defs>
    <text class="arc-t"><textPath href="#${id}a" startOffset="50%">ROTKEHLCHENS MORGENBLATT</textPath></text>
    <text class="arc-t"><textPath href="#${id}b" startOffset="50%">GELESEN</textPath></text>${sq(9.95, 45.8)}${sq(54.05, 45.8)}
    <text class="date" x="32" y="47">${d}. ${roman(m)}. ${y}</text>`;
  return `<span class="seal${mini ? " mini" : ""}${n >= 2 ? " wreathed" : ""}" style="--tilt:${tilt}deg"${mini ? ' role="img" aria-label="已讀完摘要"' : ' aria-hidden="true"'}>
    <svg viewBox="0 0 64 64"><circle class="rim" cx="32" cy="32" r="29.5"/><circle class="rim thin" cx="32" cy="32" r="23"/>${text}
    <g class="bird" transform="translate(14.2 10.5) scale(.54)">${ROBIN_PATHS}</g></svg>${n >= 2 ? `<span class="laurel" aria-hidden="true">${wreath(26.3)}</span>` : ""}</span>`;
}

// Reading the digest: the ring fills as each brief passes through the middle of the screen. Returns { stop, complete }:
// complete() fills it at once (the end was reached, or the digest was heard to the end).
export function digestRing(root) {
  const ring = root.querySelector(".digest .ring .bar"), cnt = root.querySelector(".digest .cnt");
  const cards = [...root.querySelectorAll(".lead, .item")].filter((el) => el.querySelector("p.brief"));
  const none = { stop() {}, complete() {} };
  if (!ring || !cards.length) return none;
  const bar = ring.closest(".digest"), seen = new Set();
  let shown = -1;
  const draw = () => {
    if (shown >= 0 && seen.size > shown && !calm()) { const w = cnt.parentElement; w.classList.remove("bump"); void w.offsetWidth; w.classList.add("bump"); }
    shown = seen.size;
    ring.style.strokeDashoffset = String(100 - Math.round((seen.size / cards.length) * 100));
    cnt.textContent = `${seen.size}/${cards.length}`;
    if (seen.size === cards.length) bar.classList.add("full");
  };
  const complete = () => { cards.forEach((c) => seen.add(c)); io?.disconnect(); draw(); };
  let io = null;
  if (bar.classList.contains("done") || !("IntersectionObserver" in window)) { if (bar.classList.contains("done")) complete(); return { stop() {}, complete }; }
  io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { seen.add(e.target); io.unobserve(e.target); }
    draw();
    if (seen.size === cards.length) io.disconnect();
  }, { rootMargin: "-35% 0px -35% 0px" });
  cards.forEach((c) => io.observe(c));
  draw();
  return { stop: () => io.disconnect(), complete };
}

// 動作感應 (for 郵票反光): may the page read how the phone is held? An iPhone answers only when asked inside a tap, with
// its own dialog the first time; once allowed it answers without a tap for as long as the page lives, and a refusal
// stands for as long too. Other phones give the readings unasked. So there is no button (the owner, 2026-11-11:
// 一律開啟，郵票底下不要有按鈕): it is asked on the tap that opens a stamp from the album (app.js viewStamps) or, failing
// that, the first touch on the stamp, and remembered here. null = not known yet (asked outside a tap: try again).
let tiltOk = null;
export async function tiltGrant() {
  if (tiltOk !== null) return tiltOk;
  const E = window.DeviceOrientationEvent;
  if (!E || calm() || !matchMedia("(pointer: coarse)").matches) return (tiltOk = false); // a desk machine has nothing to tilt
  if (typeof E.requestPermission !== "function") return (tiltOk = true);
  try { return (tiltOk = (await E.requestPermission()) === "granted"); } catch { return false; } // not in a tap: still unknown
}

// 郵票反光 (app.js viewStamp; the owner, 2026-11-11): the one stamp held up to look at catches the light. A finger drawn
// across it moves a glare over the paper and leans the stamp a few degrees toward the finger; with the phone's motion
// sensor allowed (tiltGrant above) the lean follows the hand holding the phone as well, with nothing to switch on.
// `stage` is the box round the stamp (.big): it is leaned, not the stamp, whose entrance animation keeps its own
// transform. Everything is two custom properties (--gx, --gy, −1…1) and a class, so nothing in the page moves;
// returns the function that takes the listeners off again. Nothing happens with reduced motion.
export function shine(stage) {
  const stamp = stage?.querySelector(".stamp"), sp = stamp?.querySelector(".sp");
  if (!sp || calm()) return () => {};
  const glare = document.createElement("i");
  glare.className = "glare"; glare.setAttribute("aria-hidden", "true");
  sp.append(glare);
  stage.classList.add("shiny");
  const clamp = (v) => Math.max(-1, Math.min(1, v));
  let held = false, sensing = false, base = null, frame = 0, next = null, alive = true;
  const set = (x, y, on) => {
    next = [x, y, on];
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const [gx, gy, lit] = next;
      stage.style.setProperty("--gx", gx.toFixed(3)); stage.style.setProperty("--gy", gy.toFixed(3));
      stage.classList.toggle("lit", lit);
    });
  };
  const at = (e) => { const r = stamp.getBoundingClientRect(); return [clamp(((e.clientX - r.left) / r.width) * 2 - 1), clamp(((e.clientY - r.top) / r.height) * 2 - 1)]; };
  const down = (e) => { held = true; try { stamp.setPointerCapture(e.pointerId); } catch { /* an old pointer */ } stage.classList.add("held"); set(...at(e), true); };
  const move = (e) => { if (held) set(...at(e), true); };
  // the hand: the first reading is "level", 22° either way is the full lean
  const turn = (e) => {
    if (held || e.gamma == null || e.beta == null) return;
    if (!base) base = [e.gamma, e.beta];
    set(clamp((e.gamma - base[0]) / 22), clamp((e.beta - base[1]) / 22), true);
  };
  const sense = (ok) => { if (ok && alive && !sensing) { sensing = true; addEventListener("deviceorientation", turn); } };
  const up = () => {
    if (!held) return;
    held = false; stage.classList.remove("held");
    if (!sensing) { set(0, 0, false); tiltGrant().then(sense); } // a finger lifting is a tap: the moment an iPhone may be asked
  };
  stamp.addEventListener("pointerdown", down);
  stamp.addEventListener("pointermove", move);
  stamp.addEventListener("pointerup", up);
  stamp.addEventListener("pointercancel", up);
  tiltGrant().then(sense); // already allowed (this visit, or a phone that does not ask): on at once
  return () => {
    alive = false;
    removeEventListener("deviceorientation", turn);
    if (frame) cancelAnimationFrame(frame);
    stamp.removeEventListener("pointerdown", down); stamp.removeEventListener("pointermove", move);
    stamp.removeEventListener("pointerup", up); stamp.removeEventListener("pointercancel", up);
  };
}
