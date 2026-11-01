// Motion: the gold-leaf moments. All of it is decoration — with reduced motion, or where a browser lacks an API, every
// page works the same without it.
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
  root.querySelectorAll(".lead, .item, .sec-head, .digest, .finish, .issue-row, .colophon, .set, .gig")
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
// frame); `update` draws the new page.
export async function transition(update, { from = null, to = null } = {}) {
  if (calm() || !document.startViewTransition) { await update(); plate(to?.()); return; }
  if (from) from.style.viewTransitionName = "hero";
  const vt = document.startViewTransition(async () => {
    if (from) from.style.viewTransitionName = "";
    await update();
    const el = to?.();
    if (el) el.style.viewTransitionName = "hero";
  });
  vt.ready.catch(() => {}); // a transition cut short by the next tap is skipped; that is fine
  vt.finished.catch(() => {}).finally(() => { const el = to?.(); if (el) { el.style.viewTransitionName = ""; plate(el); } });
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

// The finish line: a seal stamped in gold, a handful of gold leaf thrown up around it, and gold leaf raining down the page.
export function celebrate(el) {
  el.classList.add("stamp");
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

// A gold laurel round a number (the reading streak).
// Two branches climb from the bottom up either side; each leaf lies along the circle, tipped a little outward.
const leaf = (x, y, rot, i) => `<g transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"><ellipse style="--i:${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5.2" ry="2.1"/></g>`;
const branch = (mirror) => Array.from({ length: 7 }, (_, i) => {
  const deg = 252 - i * 22, t = deg * Math.PI / 180;
  const x = 32 + Math.cos(t) * 23, y = 32 - Math.sin(t) * 23;
  const along = Math.atan2(-Math.cos(t), -Math.sin(t)) * 180 / Math.PI + 28;
  return mirror ? leaf(64 - x, y, 180 - along, i) : leaf(x, y, along, i);
}).join("");
export const laurel = (n) => `<span class="laurel" aria-hidden="true"><svg viewBox="0 0 64 64"><g>${branch(false)}${branch(true)}</g></svg><b>${n}</b></span>`;

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
