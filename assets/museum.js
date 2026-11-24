// 美術館 (the owner's pick, 2026-11-19: 「先Ｂ點進去Ａ」): every 藝術 piece read hangs in a gallery with wine silk walls.
// #/museum is the salon hang — every work on one wall in gilded frames, the newest the largest, under the picture light;
// a tap on a work opens #/museum/<date>: that work alone on the wall under its light, the museum label beside it
// (artist from the picture's credit, the work's name from its topic_key, the year), ‹ › to the next, a tap on the
// painting opens the article. Walls, rail and floor are the bookcase's photographs (assets/shelf/, Poly Haven, CC0).
import { esc } from "./util.js";
import { museumFrame, frameCorners, FRAME_DEFS } from "./salon.js";

const SMALL = new Set(["of", "the", "and", "de", "la", "las", "los", "del", "di", "da", "van", "von", "der", "le", "les"]);
// artwork:velazquez-las-meninas → Las Meninas (the first word of the key is the artist)
export const workTitle = (a) => String(a.topic_key || "").replace(/^artwork:[^-]+-?/, "").split("-").filter(Boolean).map((w, i) => (i && SMALL.has(w) ? w : w[0].toUpperCase() + w.slice(1))).join(" ");
// The artist: the picture credit's first part, up to 「／」 or 「；」 (「Édouard Manet；數位影像 …」) — unless that names
// the photographer (「… 攝」, also with the source after it: 「Alvesgaspar 攝（Wikimedia Commons）」), then the key's first word.
export const artistOf = (a) => { const c = String(a.hero?.credit || "").split(/[／；;]/)[0].trim(); if (c && !/攝\s*(?:$|[（(，,])/.test(c)) return c; const k = String(a.topic_key || "").match(/^artwork:([^-]+)/); return k ? k[1][0].toUpperCase() + k[1].slice(1) : ""; };
const ratio = (a) => (a.hero?.width > 0 && a.hero?.height > 0 ? a.hero.width / a.hero.height : 0.8);
const pic = (a) => a.hero?.thumb || a.hero?.src || "";
const ROMAN = (n) => [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]].reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, "");

// The frame is the room's own (salon.js museumFrame, the owner 2026-11-23: the same as outside); the picture lies under it
// in the sight, the frame's varnish and shadow over it.
const pc = (v) => `${(v * 100).toFixed(3)}%`;
// the room's sizes: the lead 100 wide on border 9, the others 50 on 5; alone, the same moulding round a larger canvas.
// The size is not put on the frame as a class: `lead` is also the front page's lead card (style.css .lead), whose
// padding, rule and clip would cut off the crest, the scrolls and the shadow that stand out past the frame's box.
const SIZE = { lead: [100, 9], side: [50, 5], one: [150, 9] };
const frame = (w, k) => { const f = museumFrame(ratio(w.a), ...SIZE[k]);
  return `<span class="mu-frame" style="aspect-ratio:${f.w}/${f.h};--r:${(f.w / f.h).toFixed(4)}"><span class="mu-canvas" style="inset:${pc(f.B / f.h)} ${pc(f.B / f.w)}">${pic(w.a) ? `<img src="${esc(pic(w.a))}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ""}</span>${f.svg}</span>`; };
const label = (w) => `<span class="mu-label"><b>${esc(artistOf(w.a))}</b><i>${esc(workTitle(w.a) || w.a.title)}</i>${w.a.hero?.made ? `<span>${esc(w.a.hero.made)}</span>` : ""}</span>`;

// The wall is hung with the room's red damask (the owner, 2026-11-23: 「跟著換成房間的紅花緞」), at the room's size;
// the frames' and the silk's patterns come with it (salon.js FRAME_DEFS).
export const wallSilk = `${FRAME_DEFS}<svg class="mu-silk" aria-hidden="true"><rect width="100%" height="100%" fill="url(#mf-damask)"/></svg>`;

// The salon wall: the newest in the middle column under the light, the others round it and on down the wall.
export function salonHtml(list) {
  if (!list.length) return "";
  return `<div class="mu-salon"><i class="mu-light" aria-hidden="true"></i>
      ${list.map((w, k) => `<a class="mu-hang${k ? "" : " lead"}" href="#/museum/${esc(w.date)}" aria-label="${esc(artistOf(w.a))}：${esc(workTitle(w.a) || w.a.title)}">${frame(w, k ? "side" : "lead")}</a>`).join("")}</div>
    <div class="mu-foot"><span class="sc-brass mu-plate"><span class="sc-cut">Museum · ${ROMAN(list.length)}</span></span></div>${frameCorners()}`;
}

// One work alone: the light, the frame, the label; ‹ › on the rail to the neighbours (newest first).
export function roomHtml(list, i) {
  const w = list[i];
  const f = frame(w, "one");
  return `<div class="mu-room"><i class="mu-light one" aria-hidden="true"></i>
      <a class="mu-one" href="#/a/${esc(w.date)}/${esc(w.a.column)}" style="${f.match(/--r:[\d.]+/)[0]}" aria-label="${esc(artistOf(w.a))}：${esc(workTitle(w.a) || w.a.title)}，打開這一篇">${f}</a>
      ${label(w)}</div>
    ${list.length > 1 ? `<div class="mu-foot"><a class="cr-flip sh-foil${i ? "" : " off"}" ${i ? `href="#/museum/${esc(list[i - 1].date)}"` : 'aria-disabled="true"'} aria-label="較新的一件">‹</a>
      <span class="mu-count sh-foil">${ROMAN(i + 1)} / ${ROMAN(list.length)}</span>
      <a class="cr-flip sh-foil${i < list.length - 1 ? "" : " off"}" ${i < list.length - 1 ? `href="#/museum/${esc(list[i + 1].date)}"` : 'aria-disabled="true"'} aria-label="較舊的一件">›</a></div>` : ""}${frameCorners()}`;
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
