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
  root.querySelectorAll(".lead, .item, .sec-head, .digest, .finish, .cards-cta, .week li, .issue-row, .colophon, .set, .card3d")
    .forEach((el) => { el.classList.add("rv"); io.observe(el); });
  return () => io.disconnect();
}

// Page changes cross-fade, and a card's picture grows into the article's opening picture (View Transitions; iOS 18+).
// `from`/`to` name the two pictures that are one and the same; `update` draws the new page.
export async function transition(update, { from = null, to = null } = {}) {
  if (calm() || !document.startViewTransition) return update();
  if (from) from.style.viewTransitionName = "hero";
  const vt = document.startViewTransition(async () => {
    if (from) from.style.viewTransitionName = "";
    await update();
    const img = to?.();
    if (img) img.style.viewTransitionName = "hero";
  });
  vt.finished.catch(() => {}).finally(() => { const img = to?.(); if (img) img.style.viewTransitionName = ""; });
  return vt.updateCallbackDone.catch(() => {});
}

// The finish line: a seal stamped in gold and a handful of gold leaf thrown up around it.
export function celebrate(el) {
  el.classList.add("stamp");
  navigator.vibrate?.(14);
  if (calm()) return;
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

// A gold laurel round a number (the reading streak).
// Two branches climb from the bottom up either side; each leaf lies along the circle, tipped a little outward.
const leaf = (x, y, rot) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5.2" ry="2.1" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
const branch = (mirror) => Array.from({ length: 7 }, (_, i) => {
  const deg = 252 - i * 22, t = deg * Math.PI / 180;
  const x = 32 + Math.cos(t) * 23, y = 32 - Math.sin(t) * 23;
  const along = Math.atan2(-Math.cos(t), -Math.sin(t)) * 180 / Math.PI + 28;
  return mirror ? leaf(64 - x, y, 180 - along) : leaf(x, y, along);
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
  const draw = () => {
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

// A flash card you can flip with a tap (or its flip button) and, once flipped, throw right (remembered) or left (forgotten).
export function swipeCard(card, { canSwipe, onGrade }) {
  let x0 = null, dx = 0, id = null;
  const flip = card.querySelector(".flip"), front = flip.querySelector(".front"), back = flip.querySelector(".back");
  const toggle = () => {
    const on = flip.classList.toggle("on");
    front.inert = on;
    back.inert = !on;
    card.dispatchEvent(new CustomEvent("flipped", { detail: on }));
  };
  back.inert = true;
  card.querySelector(".flip-btn")?.addEventListener("click", toggle);
  const set = (v, anim) => {
    card.style.transition = anim ? "transform .35s cubic-bezier(.2,.7,.2,1)" : "none";
    card.style.transform = v ? `translateX(${v}px) rotate(${v / 18}deg)` : "";
    card.style.setProperty("--ok", String(Math.max(0, Math.min(1, v / 110))));
    card.style.setProperty("--no", String(Math.max(0, Math.min(1, -v / 110))));
  };
  card.addEventListener("pointerdown", (e) => {
    dx = 0;
    if (!canSwipe() || e.target.closest("a, button")) return;
    x0 = e.clientX; dx = 0; id = e.pointerId;
  });
  card.addEventListener("pointermove", (e) => {
    if (x0 === null || e.pointerId !== id) return;
    dx = e.clientX - x0;
    if (Math.abs(dx) > 6 && !card.hasPointerCapture(id)) card.setPointerCapture(id);
    if (card.hasPointerCapture(id)) set(dx, false);
  });
  const end = () => {
    if (x0 === null) return;
    x0 = null;
    if (Math.abs(dx) < 90) { set(0, true); return; }
    const ok = dx > 0;
    if (calm()) { onGrade(ok); return; }
    set((ok ? 1 : -1) * (innerWidth + 200), true);
    setTimeout(() => onGrade(ok), 260);
  };
  card.addEventListener("pointerup", end);
  card.addEventListener("pointercancel", () => { x0 = null; set(0, true); });
  // A tap anywhere on the card (not a drag, not on a link or button) flips it too.
  card.addEventListener("click", (e) => {
    if (Math.abs(dx) > 6 || e.target.closest("a, button")) return;
    toggle();
  });
}
