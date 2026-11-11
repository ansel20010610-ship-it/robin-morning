// 下拉更新 (the owner, 2026-11-07): a home-screen app has no reload button, so a pull from the top of any page fetches
// the paper again. A thin tab slides down from under the top edge as the finger pulls (with resistance), turns ready
// past NEED, and while the refresh runs it says so; then a word on what came of it, and it slides back. The pull only
// starts with the page at the very top and a single finger; a sheet (dialog) open or a refresh already running ignores
// it. The page itself comes down with the pull (--pull on <html>, style.css #main), the tab in the gap above it.
// Touch events only: on a desktop the browser's own reload serves.
const NEED = 64, MAX = 84, GIVE = 0.38; // the finger travels about 170px for a refresh (the owner, 2026-11-07: 阻力大一點)
export function initPull(refresh) {
  if (!("ontouchstart" in window)) return;
  const bar = document.createElement("div");
  bar.className = "ptr";
  bar.setAttribute("aria-hidden", "true");
  bar.innerHTML = `<i class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg></i><span class="t">下拉更新</span>`;
  document.body.append(bar);
  const text = bar.querySelector(".t");
  let y0 = null, x0 = 0, d = 0, on = false, busy = false;
  const root = document.documentElement;
  const draw = (v) => { d = v; root.style.setProperty("--pull", `${v.toFixed(1)}px`); bar.classList.toggle("ready", v >= NEED); if (!busy) text.textContent = v >= NEED ? "放開更新" : "下拉更新"; };
  const off = () => { on = false; bar.classList.remove("on"); root.classList.remove("pulling"); draw(0); };
  document.addEventListener("touchstart", (e) => {
    y0 = null;
    if (on && !busy) off(); // a second finger mid-pull left the pull drawn with nothing to end it; any new touch clears it
    if (busy || scrollY > 0 || e.touches.length !== 1 || document.querySelector("dialog[open], .photo-view, .pc-view")) return; // nor under a photo or postcard opened large (nest.js): a drag down on it pulled the page behind
    y0 = e.touches[0].clientY; x0 = e.touches[0].clientX;
  }, { passive: true });
  document.addEventListener("touchmove", (e) => {
    if (y0 == null || busy) return;
    const t = e.touches[0], dy = t.clientY - y0, dx = Math.abs(t.clientX - x0);
    if (dy <= 0 || scrollY > 0 || (!on && dx > dy)) { if (on) off(); if (dy <= 0 || dx > dy) y0 = null; return; } // scrolled, or a sideways swipe
    if (!on) { on = true; bar.classList.add("on"); root.classList.add("pulling"); }
    draw(Math.min(MAX, dy * GIVE));
  }, { passive: true });
  const end = async () => {
    if (y0 == null) return;
    y0 = null;
    if (!on) return;
    if (d < NEED) { off(); return; }
    busy = true; bar.classList.add("busy"); text.textContent = "更新中"; root.classList.remove("pulling"); draw(NEED); // settles to NEED with the transition on
    let said;
    try { said = (await refresh()) ? "更新好了" : "已經是最新的"; } catch { said = "連不上，等一下再試"; }
    text.textContent = said;
    setTimeout(() => { bar.classList.remove("busy"); off(); busy = false; }, 900);
  };
  document.addEventListener("touchend", end, { passive: true });
  document.addEventListener("touchcancel", end, { passive: true });
}
