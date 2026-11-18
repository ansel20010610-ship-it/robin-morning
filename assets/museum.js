// 美術館 (the owner's pick, 2026-11-19: 「先Ｂ點進去Ａ」): every 藝術 piece read hangs in a gallery with wine silk walls.
// #/museum is the salon hang — every work on one wall in gilded frames, the newest the largest, under the picture light;
// a tap on a work opens #/museum/<date>: that work alone on the wall under its light, the museum label beside it
// (artist from the picture's credit, the work's name from its topic_key, the year), ‹ › to the next, a tap on the
// painting opens the article. Walls, rail and floor are the bookcase's photographs (assets/shelf/, Poly Haven, CC0).
import { esc } from "./util.js";

const SMALL = new Set(["of", "the", "and", "de", "la", "las", "los", "del", "di", "da", "van", "von", "der", "le", "les"]);
// artwork:velazquez-las-meninas → Las Meninas (the first word of the key is the artist)
export const workTitle = (a) => String(a.topic_key || "").replace(/^artwork:[^-]+-?/, "").split("-").filter(Boolean).map((w, i) => (i && SMALL.has(w) ? w : w[0].toUpperCase() + w.slice(1))).join(" ");
export const artistOf = (a) => String(a.hero?.credit || "").split("／")[0].replace(/\s*攝$/, "").trim();
const ratio = (a) => (a.hero?.width > 0 && a.hero?.height > 0 ? a.hero.width / a.hero.height : 0.8);
const pic = (a) => a.hero?.thumb || a.hero?.src || "";
const ROMAN = (n) => [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]].reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, "");

const frame = (w, cls = "") => `<span class="mu-frame${cls}"><span class="mu-liner"><span class="mu-canvas" style="aspect-ratio:${ratio(w.a).toFixed(3)}">${pic(w.a) ? `<img src="${esc(pic(w.a))}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ""}</span></span></span>`;
const label = (w) => `<span class="mu-label"><b>${esc(artistOf(w.a))}</b><i>${esc(workTitle(w.a) || w.a.title)}</i>${w.a.hero?.made ? `<span>${esc(w.a.hero.made)}</span>` : ""}</span>`;

// The salon wall: the newest in the middle column under the light, the others round it and on down the wall.
export function salonHtml(list) {
  if (!list.length) return "";
  return `<div class="mu-salon"><i class="mu-light" aria-hidden="true"></i>
      ${list.map((w, k) => `<a class="mu-hang${k ? "" : " lead"}" href="#/museum/${esc(w.date)}" aria-label="${esc(artistOf(w.a))}：${esc(workTitle(w.a) || w.a.title)}">${frame(w)}</a>`).join("")}</div>
    <div class="mu-foot"><span class="sc-brass mu-plate"><span class="sc-cut">Museum · ${ROMAN(list.length)}</span></span></div>`;
}

// One work alone: the light, the frame, the label; ‹ › on the rail to the neighbours (newest first).
export function roomHtml(list, i) {
  const w = list[i];
  return `<div class="mu-room"><i class="mu-light one" aria-hidden="true"></i>
      <a class="mu-one" href="#/a/${esc(w.date)}/${esc(w.a.column)}" aria-label="${esc(artistOf(w.a))}：${esc(workTitle(w.a) || w.a.title)}，打開這一篇">${frame(w, " big")}</a>
      ${label(w)}</div>
    ${list.length > 1 ? `<div class="mu-foot"><a class="cr-flip sh-foil${i ? "" : " off"}" ${i ? `href="#/museum/${esc(list[i - 1].date)}"` : 'aria-disabled="true"'} aria-label="較新的一件">‹</a>
      <span class="mu-count sh-foil">${ROMAN(i + 1)} / ${ROMAN(list.length)}</span>
      <a class="cr-flip sh-foil${i < list.length - 1 ? "" : " off"}" ${i < list.length - 1 ? `href="#/museum/${esc(list[i + 1].date)}"` : 'aria-disabled="true"'} aria-label="較舊的一件">›</a></div>` : ""}`;
}

// A swipe on the single work goes to the neighbour (replacing the address, so the way back still leads to the wall).
export function wireRoom(scene, list, i) {
  if (!scene || list.length < 2) return;
  let x0 = 0, y0 = 0, t0 = 0, swiped = false;
  const room = scene.querySelector(".mu-room");
  room.addEventListener("touchstart", (e) => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); swiped = false; }, { passive: true });
  room.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0, j = i + (dx < 0 ? 1 : -1);
    if (x0 > 24 && Math.abs(dx) > 40 && Math.abs(dx) > 1.5 * Math.abs(dy) && Date.now() - t0 < 900 && j >= 0 && j < list.length) { swiped = true; location.replace(`#/museum/${list[j].date}`); }
  }, { passive: true });
  room.addEventListener("click", (e) => { if (swiped) { e.preventDefault(); swiped = false; } }, true);
  scene.querySelectorAll(".mu-foot a[href]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); location.replace(a.getAttribute("href")); }));
}
