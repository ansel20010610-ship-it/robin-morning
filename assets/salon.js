// 收藏's room (the owner's pick, 2026-11-19: the Viennese salon of the samples in 流程盤點/修改包/收藏品_房間): instead of
// the nine drawers, one room in which each corner is a thing — the pictures on the wall (美術館), the record crate on its
// sideboard (唱片櫃), the floor globe (你讀過的世界), the bookcase (我的書架) with the writing box on its second shelf
// (詩箋) and the medal case behind its glazed lower door (紀念章), the letter rack on the wall with the articles starred
// (收進來的, #/saved/list), the stamp album open on the window sill (郵票冊), the portfolio on an easel (版畫冊), the
// notebook on the seat of a bergère (劃線本) — no four in a row (the owner, 2026-11-19) — and on a 特供版 phone the yard's
// robin on the sill (#/nest). The room is the whole of 收藏: one screen, nothing above it or under it. Every word is on an object: cut in brass, gilt on leather, pencilled in the album. What each holds is the
// reader's own — the newest works on the wall, the newest record in front, the countries read in wine on the globe —
// drawn only so far (the newest few), the count cut in the brass. An empty corner is the thing waiting: the cords with no
// picture, the crate with no record, the album shut, the brass with the name alone.
// A tap: the camera moves in on the thing (one transform on .sl-cam, run by the compositor) and its page opens; the record
// cabinet is #/records's own, laid out at the page's size and scaled down (records.js phonoCabinetHtml: a gramophone on it
// where the page has its crate), so the move lands on that page.
// The room is drawn at 402 × 791 and scaled to the screen (the screen's height less the bottom bar, fixed before any
// picture arrives: iPhone Safari has no scroll anchoring). One light, the window's from the upper left, and it is the
// hour's (lightAt: the morning as drawn, noon, the evening, the night): every shadow falls right and down, each piece
// stands on a contact shadow, the window's panes lie on the parquet while the sun is up.
// No SVG filter and no blend mode inside: the shadows and the light are gradients and translucent shapes.
// Leather, velvet and the parquet are photographs (assets/shelf/, Poly Haven, CC0); the wood's grain, the gilt's wear, the
// silk and the grain over the room are drawn by program (assets/shelf/gen_*.png).
import { esc, ROBIN_PATHS, twNow } from "./util.js";
import { phonoCabinetHtml } from "./records.js";
import { fuseGilt, mould as cutMould, lightOf } from "./cabinet.js";
import { stampPicture } from "./stamps.js";
import { drawMap, globe, paintGlobe, GLOBE_DPR } from "./world.js";
import { poemOf } from "./poems.js";
import { calm } from "./motion.js";
import { roomBird } from "./nest.js";
import { sunTimes } from "./wetter.js";

const W = 402, H = 791, FLOOR = 640, REC = 0.44; // the room's size, the line the furniture stands on, the crate's scale
const TEX = "assets/shelf/";
const pic = (a) => a?.hero?.thumb || a?.hero?.src || "";
let uidN = 0;
const uid = (p) => `sl-${p}${++uidN}`;
const svg = (w, h, inner) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="visible" aria-hidden="true">${inner}</svg>`;

const TH = {"paint": "#f3ede0", "goldMid": "#bf9a52", "woodMid": "#6a2a14", "varnish": "rgba(130,90,30,.14)", "panel": {"mat": "paint", "paint": "#f4eee2", "k": 0.6, "fillet": true, "orn": "gold"}, "wallIn": "url(#sl-damask)", "wallFill": "url(#sl-damask)", "cornice": "paint", "cornOrn": "gold", "dado": "paint", "velvet": "#5a0a14", "easelOrn": "gold", "crest": "gold"};
// ——— 真材質的工具。一盞光在左上：凸的線腳上緣亮、下緣暗，凹的反過來；雕花是三層——右下的影、
// 左上的受光、本體——再疊一層金箔的磨損與接縫。木紋跟著料走：橫料橫紋、直料直紋、斜腳順著斜。 ———
const P2 = (pts) => pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" L");
// A moulded frame round a rectangle (cabinet.js mould, the plane the gramophone on the record cabinet is cut with too), in
// the room's gold, wood and paint.
const INK = { gold: "url(#sl-goldd)", wh: "url(#sl-wdh)", wv: "url(#sl-wdv)", giltx: "url(#sl-giltx)", goldMid: TH.goldMid, woodMid: TH.woodMid, paint: TH.paint };
const mould = (x, y, w, h, prof, mat, o = {}) => cutMould(x, y, w, h, prof, mat, { ...o, ink: INK });
// The carver's two shapes: a scroll (a tapering band rolled up), an acanthus blade (lobed, bent, a groove down its middle).
function spiralPts(r0, w0, turns, dir, rot) {
  const n = 46, L = [], R = [], k = Math.log(4.5) / (turns * 2 * Math.PI);
  for (let i = 0; i <= n; i++) { const th = (i / n) * turns * 2 * Math.PI, r = r0 * Math.exp(-k * th), a = rot + dir * th, ww = (w0 * Math.pow(r / r0, .75)) / 2;
    L.push([r * Math.cos(a) + Math.cos(a) * ww, r * Math.sin(a) + Math.sin(a) * ww]); R.push([r * Math.cos(a) - Math.cos(a) * ww, r * Math.sin(a) - Math.sin(a) * ww]); }
  return [...L, ...R.reverse()];
}
function leafPts(x0, y0, x1, y1, W, bend = .25, lobes = 3) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, n = W < 1.6 ? 16 : 34, A = [], B = [];
  for (let i = 0; i <= n; i++) { const t = i / n, c = Math.sin(Math.PI * t) * bend * len, w = W * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05 + .02)), .65) * (1 - .45 * Math.abs(Math.sin(t * Math.PI * lobes))) * (1 - t * .25);
    const px = x0 + dx * t + nx * c, py = y0 + dy * t + ny * c; A.push([px + nx * w, py + ny * w]); B.push([px - nx * w * .85, py - ny * w * .85]); }
  return [...A, ...B.reverse()];
}
const ptsD = (pts, f = (p) => p) => `M${P2(pts.map(f))}Z`;
// relief, the depth a carver cuts: the cast shadow farther off and soft, the undercut close and dark, the lit
// rim above left, the body, and a light across the body (bright upper left, dark lower right) so each piece has volume;
// the gilt's wear of the pieces in one group is joined into one path when the room is done (cabinet.js fuseGilt)
function carve(d, mat = "gold", k = 1) {
  const body = mat === "gold" ? "url(#sl-goldd)" : mat === "wood" ? "url(#sl-wdh)" : TH.paint, hi = mat === "gold" ? "rgba(255,246,212,.95)" : mat === "wood" ? "rgba(255,225,185,.4)" : "rgba(255,255,250,.95)";
  const rel = mat === "gold" ? "url(#sl-relg)" : mat === "wood" ? "url(#sl-relw)" : "url(#sl-relp)", sh = mat === "paint" ? [.12, .28] : [.26, .6];
  return `<path d="${d}" fill="rgba(15,7,0,${sh[0]})" transform="translate(${(1.5 * k).toFixed(2)} ${(1.9 * k).toFixed(2)})"/><path d="${d}" fill="rgba(15,7,0,${sh[1]})" transform="translate(${(.72 * k).toFixed(2)} ${(.9 * k).toFixed(2)})"/><path d="${d}" fill="${hi}" transform="translate(${(-.45 * k).toFixed(2)} ${(-.5 * k).toFixed(2)})"/><path d="${d}" fill="${body}"/>${mat === "gold" ? `<path d="${d}" fill="url(#sl-giltx)"/>` : mat === "paint" ? `<path d="${d}" fill="rgba(120,100,70,.06)"/>` : ""}<path d="${d}" fill="${rel}"/>`;
}
// a leaf with its midrib cut in: a dark groove and its lit lip
function leaf(x0, y0, x1, y1, W, bend, lobes, mat, k, f = (p) => p) {
  let g = carve(ptsD(leafPts(x0, y0, x1, y1, W, bend, lobes), f), mat, k);
  if (W < .9) return g;
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, P = [];
  for (let i = 3; i <= 27; i++) { const t = i / 30, c = Math.sin(Math.PI * t) * bend * len; P.push(f([x0 + dx * t + nx * c, y0 + dy * t + ny * c])); }
  const d = `M${P2(P)}`, sw = Math.max(.22, W * .2);
  return g + `<path d="${d}" fill="none" stroke="rgba(30,12,0,${mat === "paint" ? .22 : .52})" stroke-width="${sw.toFixed(2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${mat === "paint" ? "rgba(255,255,252,.85)" : "rgba(255,246,212,.5)"}" stroke-width="${(sw * .45).toFixed(2)}" stroke-linecap="round" transform="translate(${(-sw * .5).toFixed(2)} ${(-sw * .55).toFixed(2)})"/>`;
}
// a scroll with the channel cut along it
function scroll(r0, w0, turns, dir, rot, f, mat, k) {
  let g = carve(ptsD(spiralPts(r0, w0, turns, dir, rot), f), mat, k);
  const n = 40, kk = Math.log(4.5) / (turns * 2 * Math.PI), P = [];
  for (let i = 2; i <= n - 4; i++) { const th = (i / n) * turns * 2 * Math.PI, r = r0 * Math.exp(-kk * th), a = rot + dir * th; P.push(f([r * Math.cos(a), r * Math.sin(a)])); }
  const sw = Math.max(.22, w0 * .16);
  return g + `<path d="M${P2(P)}" fill="none" stroke="rgba(30,12,0,${mat === "paint" ? .2 : .45})" stroke-width="${sw.toFixed(2)}" stroke-linecap="round"/>`;
}
// A rocaille crest: two C-scrolls back to back, a shell fanned between them, a leaf falling from each side.
function cartouche(cx, cy, s, mat = "gold") {
  const at = (sx) => (p) => [cx + sx * p[0], cy + p[1]], K = s / 18;
  let g = "";
  for (const sx of [-1, 1]) {
    g += leaf(s * .18, s * .12, s * .95, s * .5, s * .13, -.25, 3, mat, K, at(sx));
    g += leaf(s * .3, s * .2, s * .72, s * .74, s * .07, .2, 2, mat, K * .8, at(sx));
    g += scroll(s * .26, s * .14, 1.15, sx > 0 ? -1 : 1, Math.PI * .1, (p) => at(sx)([p[0] + s * .42, p[1] + s * .05]), mat, K);
  }
  // the shell: ribs fanned out of the boss, each with its groove
  for (let i = 0; i < 7; i++) { const a = Math.PI * (1.12 + (i / 6) * .76); g += leaf(0, s * .1, Math.cos(a) * s * .55, s * .1 + Math.sin(a) * s * .55, s * .085, 0, 1, mat, K, (p) => [cx + p[0], cy + p[1]]); }
  g += carve(`M${cx - s * .12} ${cy + s * .14} a${s * .12} ${s * .1} 0 1 0 ${s * .24} 0 a${s * .12} ${s * .1} 0 1 0 ${-s * .24} 0Z`, mat, K);
  return g;
}
// A frame's corner: a small shell turned out of the corner, a leaf running along each side.
function corner(cx, cy, s, sx, sy, mat = "gold") {
  const f = (p) => [cx + sx * p[0], cy + sy * p[1]], K = s / 14;
  let g = leaf(s * .1, s * .12, s * 1.05, s * .2, s * .14, .15, 3, mat, K, f) + leaf(s * .12, s * .1, s * .2, s * 1.05, s * .14, -.15, 3, mat, K, f);
  for (let i = 0; i < 5; i++) { const a = Math.PI * (1.02 + (i / 4) * .46); g += leaf(s * .1, s * .1, s * .1 + Math.cos(a) * s * .45, s * .1 + Math.sin(a) * s * .45, s * .07, 0, 1, mat, K, f); }
  return g + carve(`M${cx + sx * s * .02} ${cy + sy * s * .1} a${s * .1} ${s * .1} 0 1 0 ${sx * s * .2} 0 a${s * .1} ${s * .1} 0 1 0 ${-sx * s * .2} 0Z`, mat, K);
}
// a rosette: petals round a boss
function rosette(cx, cy, r, mat = "gold") {
  let g = "";
  for (let i = 0; i < 8; i++) { const a = (i / 8) * 2 * Math.PI; g += leaf(cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * .26, 0, 1, mat, r / 8); }
  return g + carve(`M${cx - r * .3} ${cy} a${r * .3} ${r * .3} 0 1 0 ${r * .6} 0 a${r * .3} ${r * .3} 0 1 0 ${-r * .6} 0Z`, mat, r / 8);
}
// wood cut along a slant: a polygon filled with the grain turned to its run (its own pattern, so the grain follows the leg)
function woodPoly(pts, ang, img = "gen_wood.png", sz = 120) {
  const id = uid("wp");
  return `<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="${sz}" height="${sz}" patternTransform="rotate(${ang.toFixed(1)})"><image href="${TEX}${img}" width="${sz}" height="${sz}" preserveAspectRatio="none"/></pattern></defs><path d="${ptsD(pts)}" fill="url(#${id})"/>`;
}
// a turned or squared leg from (x0,y0) to (x1,y1), w0 wide at the top and w1 at the foot, the grain along it, lit on its left
function leg(x0, y0, x1, y1, w0, w1, mat = "wood", flutes = 0) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const pts = [[x0 + nx * w0 / 2, y0 + ny * w0 / 2], [x1 + nx * w1 / 2, y1 + ny * w1 / 2], [x1 - nx * w1 / 2, y1 - ny * w1 / 2], [x0 - nx * w0 / 2, y0 - ny * w0 / 2]];
  const id = uid("lg"), d = ptsD(pts);
  let s = `<path d="${d}" fill="rgba(15,7,0,.45)" transform="translate(.9 .9)"/>${mat === "wood" ? woodPoly(pts, ang) : `<path d="${d}" fill="url(#sl-goldd)"/><path d="${d}" fill="url(#sl-giltx)"/>`}
    <linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x0 + nx * w0 / 2}" y1="${y0 + ny * w0 / 2}" x2="${x0 - nx * w0 / 2}" y2="${y0 - ny * w0 / 2}"><stop offset="0" stop-color="rgba(10,5,0,.55)"/><stop offset=".3" stop-color="rgba(255,240,210,${mat === "gold" ? .45 : .22})"/><stop offset=".55" stop-color="rgba(255,240,210,0)"/><stop offset="1" stop-color="rgba(10,5,0,.6)"/></linearGradient><path d="${d}" fill="url(#${id})"/>`;
  for (let i = 1; i <= flutes; i++) { const t = i / (flutes + 1) - .5; s += `<path d="M${x0 + nx * w0 * t * .8} ${y0 + ny * w0 * t * .8 + 3} L${x1 + nx * w1 * t * .8} ${y1 + ny * w1 * t * .8 - 3}" stroke="rgba(30,15,0,.5)" stroke-width="${Math.max(.35, w1 * .09)}" stroke-linecap="round"/><path d="M${x0 + nx * w0 * t * .8 - .4} ${y0 + ny * w0 * t * .8 + 3} L${x1 + nx * w1 * t * .8 - .4} ${y1 + ny * w1 * t * .8 - 3}" stroke="rgba(255,245,210,.4)" stroke-width=".3"/>`; }
  return s;
}

// the damask's flower: a palmette between two scrolls, leaves above and below, mirrored about its stem
function damaskMotif(x, y) {
  const m = (sx) => (p) => [x + sx * p[0], y + p[1]], sat = "rgba(255,160,150,.085)", dk = "rgba(40,0,6,.12)";
  let g = "";
  for (const sx of [-1, 1]) {
    g += `<path d="${ptsD(leafPts(0, 2, 9, -10, 2.6, -.3, 3), m(sx))}" fill="${sat}"/><path d="${ptsD(leafPts(0, 4, 8, 13, 2.4, .3, 3), m(sx))}" fill="${sat}"/>`;
    g += `<path d="${ptsD(spiralPts(4.4, 2.2, 1.1, sx > 0 ? 1 : -1, 0).map((p) => [p[0] + 7, p[1] + 2]), m(sx))}" fill="${sat}"/>`;
    g += `<path d="${ptsD(leafPts(1, -12, 4, -19, 1.4, 0, 1), m(sx))}" fill="${sat}"/>`;
  }
  return g + `<path d="${ptsD(leafPts(0, 8, 0, -18, 2.2, 0, 4))}" fill="${sat}" transform="translate(${x} ${y})"/><circle cx="${x}" cy="${y + 2}" r="2.2" fill="${dk}"/>`;
}
// ——— the gradients and photographs every piece shares ———
const FOIL = [["0", "#7a5418"], [".14", "#c99a3c"], [".26", "#ecd394"], [".38", "#d4a443"], [".52", "#8a6220"], [".66", "#e9c66c"], [".74", "#f6e6b4"], [".86", "#b98a33"], ["1", "#6e4c16"]];
const stops = (a) => a.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("");
const lin = (id, a, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops(a)}</linearGradient>`;
const rad = (id, a, cx = ".5", cy = ".5", r = ".5") => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(a)}</radialGradient>`;
const pat = (id, img, s) => `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${s}" height="${s}"><image href="${TEX}${img}" x="-2" y="-2" width="${s + 4}" height="${s + 4}" preserveAspectRatio="none"/></pattern>`;
const robin = ROBIN_PATHS.replace(/class="e-ink"/g, 'fill="var(--rb-ink,#9a6e26)"').replace(/class="e-robin"/g, 'fill="var(--rb-breast,#e3c06c)"').replace(/class="e-gold"/g, 'fill="var(--rb-beak,#fff0bf)"')
  .replace(/class="e-paper"/g, 'fill="var(--rb-eye,#5c1d2c)"').replace(/class="e-wing"/g, 'fill="none" stroke="var(--rb-wing,#7a5418)"').replace(/class="e-legs"/g, 'fill="none" stroke="var(--rb-wing,#7a5418)"');
const DEFS = `<svg class="sl-defs" width="0" height="0" aria-hidden="true"><defs>
  ${lin("sl-foil", FOIL, 1, .5)}
  ${lin("sl-gold", [["0", "#ecd49a"], [".25", "#d9ab4d"], [".5", "#8f6522"], [".75", "#e5c06a"], ["1", "#7a5418"]])}
  ${lin("sl-goldd", [["0", "#e6cb88"], [".2", "#b98a33"], [".42", "#f3d78e"], [".6", "#9a6e26"], [".8", "#e2bb62"], ["1", "#7a5418"]], 1, 1)}
  ${lin("sl-brass", [["0", "#f3d78e"], [".32", "#c39445"], [".52", "#e8c56c"], [".78", "#9a6e26"], ["1", "#c99a3c"]], .2, 1)}
  ${rad("sl-rivet", [["0", "#f6e6b4"], [".7", "#7a5418"]], ".35", ".3", ".8")}
  ${rad("sl-coin", [["0", "#fff6cf"], [".35", "#e9c66c"], [".7", "#b98a33"], ["1", "#6e4c16"]], ".38", ".32", ".75")}
  ${rad("sl-sphere", [["0", "rgba(255,250,232,.55)"], [".3", "rgba(255,250,232,0)"], [".72", "rgba(20,10,0,.18)"], ["1", "rgba(20,10,0,.7)"]], ".36", ".3", ".78")}
  ${rad("sl-drop", [["0", "rgba(0,0,0,.5)"], [".55", "rgba(0,0,0,.22)"], ["1", "rgba(0,0,0,0)"]])}
  ${rad("sl-glow", [["0", "rgba(255,228,165,.42)"], [".5", "rgba(255,228,165,.16)"], ["1", "rgba(255,228,165,0)"]])}
  ${rad("sl-shine", [["0", "rgba(255,255,245,.5)"], ["1", "rgba(255,255,245,0)"]])}
  ${lin("sl-varnish", [["0", "rgba(255,240,200,.16)"], [".35", "rgba(255,240,200,0)"], ["1", "rgba(60,30,0,.18)"]], 1, 1)}
  ${lin("sl-topshade", [["0", "rgba(0,0,0,.5)"], [".18", "rgba(0,0,0,0)"], ["1", "rgba(0,0,0,.12)"]])}
  ${lin("sl-boardlit", [["0", "rgba(255,225,190,.32)"], [".3", "rgba(255,225,190,0)"], ["1", "rgba(0,0,0,.5)"]])}
  ${lin("sl-side", [["0", "rgba(0,0,0,.6)"], [".45", "rgba(255,225,190,.14)"], ["1", "rgba(0,0,0,.45)"]], 1, 0)}
  ${lin("sl-baylit", [["0", "rgba(255,206,140,0)"], [".7", "rgba(255,206,140,.07)"], ["1", "rgba(255,206,140,.12)"]])}
  ${lin("sl-paper", [["0", "#f7f0de"], ["1", "#e4d7b8"]], 1, 1)}
  ${lin("sl-pencil", [["0", "#3f7a5a"], [".35", "#1f4a35"], [".36", "#2c5e45"], [".7", "#163826"], ["1", "#0d2418"]])}
  ${lin("sl-plaster", [["0", "#faf6ee"], [".6", "#ebe2d1"], ["1", "#d6c9b0"]])}
  ${lin("sl-aoDown", [["0", "rgba(40,22,6,.32)"], ["1", "rgba(40,22,6,0)"]])}
  ${lin("sl-aoUp", [["0", "rgba(40,22,6,0)"], ["1", "rgba(40,22,6,.34)"]])}
  ${lin("sl-aoL", [["0", "rgba(40,22,6,.3)"], ["1", "rgba(40,22,6,0)"]], 1, 0)}
  ${lin("sl-aoR", [["0", "rgba(40,22,6,0)"], ["1", "rgba(40,22,6,.4)"]], 1, 0)}
  ${lin("sl-cast", [["0", "rgba(30,14,4,.42)"], ["1", "rgba(30,14,4,0)"]], .6, 1)}
  ${rad("sl-contact", [["0", "rgba(15,6,0,.9)"], [".55", "rgba(15,6,0,.42)"], ["1", "rgba(15,6,0,0)"]])}
  ${rad("sl-vel", [["0", "rgba(30,0,8,.5)"], [".62", "rgba(30,0,8,.05)"], [".86", "rgba(255,170,190,.16)"], ["1", "rgba(255,190,205,.28)"]])}
  <pattern id="sl-brush" patternUnits="userSpaceOnUse" width="4" height="2"><rect width="4" height="1" fill="rgba(255,255,255,.08)"/><rect y="1" width="4" height="1" fill="rgba(0,0,0,.05)"/></pattern>
  ${pat("sl-cherryv", "gen_wood_v.png", 200)}${pat("sl-veneer", "gen_woodd_v.png", 200)}${pat("sl-velvet", "velvet.jpg", 110)}
  ${pat("sl-cherrys", "gen_wood.png", 130)}${pat("sl-cherryvs", "gen_wood_v.png", 130)}${pat("sl-leather", "leather.jpg", 90)}
  ${pat("sl-wdh", "gen_wood.png", 130)}${pat("sl-wdv", "gen_wood_v.png", 130)}
  <pattern id="sl-giltx" patternUnits="userSpaceOnUse" width="70" height="70"><image href="${TEX}gen_gilt.png" width="70" height="70"/></pattern>
  <pattern id="sl-silkx" patternUnits="userSpaceOnUse" width="60" height="60"><rect width="60" height="60" fill="#e2cfa4"/><image href="${TEX}gen_silk.png" width="60" height="60" opacity=".55" preserveAspectRatio="none"/></pattern>
  <pattern id="sl-weave" patternUnits="userSpaceOnUse" width="1.6" height="1.6"><rect width="1.6" height=".5" fill="rgba(255,250,235,.12)"/><rect width=".5" height="1.6" fill="rgba(0,0,0,.08)"/></pattern>
  <linearGradient id="sl-foldg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(20,10,0,.42)"/><stop offset=".22" stop-color="rgba(20,10,0,.05)"/><stop offset=".45" stop-color="rgba(255,248,225,.34)"/><stop offset=".62" stop-color="rgba(255,248,225,.08)"/><stop offset="1" stop-color="rgba(20,10,0,.46)"/></linearGradient>
  <radialGradient id="sl-tuft" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="rgba(255,190,205,.26)"/><stop offset=".55" stop-color="rgba(255,190,205,.05)"/><stop offset="1" stop-color="rgba(10,0,3,.5)"/></radialGradient>
  <linearGradient id="sl-seat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,195,205,.26)"/><stop offset=".35" stop-color="rgba(255,195,205,.04)"/><stop offset="1" stop-color="rgba(10,0,3,.4)"/></linearGradient>
  <pattern id="sl-damask" patternUnits="userSpaceOnUse" width="36" height="52"><rect width="36" height="52" fill="#7c1622"/><image href="${TEX}gen_silk.png" width="36" height="52" opacity=".14" preserveAspectRatio="none"/>
    ${[[18, 26], [0, 0], [36, 0], [0, 52], [36, 52]].map(([x, y]) => damaskMotif(x, y)).join("")}</pattern>
  <radialGradient id="sl-relg" cx=".34" cy=".3" r=".9"><stop offset="0" stop-color="rgba(255,250,222,.6)"/><stop offset=".38" stop-color="rgba(255,250,222,.07)"/><stop offset=".7" stop-color="rgba(60,30,0,.14)"/><stop offset="1" stop-color="rgba(40,18,0,.58)"/></radialGradient>
  <radialGradient id="sl-relw" cx=".34" cy=".3" r=".9"><stop offset="0" stop-color="rgba(255,225,185,.32)"/><stop offset=".45" stop-color="rgba(255,225,185,0)"/><stop offset="1" stop-color="rgba(20,6,0,.6)"/></radialGradient>
  <radialGradient id="sl-relp" cx=".34" cy=".3" r=".9"><stop offset="0" stop-color="rgba(255,255,252,.7)"/><stop offset=".45" stop-color="rgba(255,255,252,0)"/><stop offset="1" stop-color="rgba(110,85,50,.4)"/></radialGradient>
  <linearGradient id="sl-shelfedge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,232,196,.5)"/><stop offset=".2" stop-color="rgba(255,232,196,.12)"/><stop offset=".42" stop-color="rgba(0,0,0,.2)"/><stop offset=".52" stop-color="rgba(0,0,0,.5)"/><stop offset=".6" stop-color="rgba(255,225,190,.3)"/><stop offset=".8" stop-color="rgba(0,0,0,.1)"/><stop offset="1" stop-color="rgba(0,0,0,.6)"/></linearGradient>
  <linearGradient id="sl-turn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(10,3,0,.7)"/><stop offset=".22" stop-color="rgba(255,226,190,.34)"/><stop offset=".4" stop-color="rgba(255,226,190,.05)"/><stop offset=".78" stop-color="rgba(10,3,0,.38)"/><stop offset="1" stop-color="rgba(10,3,0,.75)"/></linearGradient>
  <linearGradient id="sl-gutter" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(60,40,15,0)"/><stop offset=".7" stop-color="rgba(60,40,15,.16)"/><stop offset=".93" stop-color="rgba(40,25,5,.42)"/><stop offset="1" stop-color="rgba(30,18,4,.55)"/></linearGradient>
  <linearGradient id="sl-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(255,255,255,.22)"/><stop offset=".3" stop-color="rgba(255,255,255,.03)"/><stop offset=".55" stop-color="rgba(255,255,255,0)"/><stop offset=".62" stop-color="rgba(255,255,255,.12)"/><stop offset=".7" stop-color="rgba(255,255,255,.02)"/><stop offset="1" stop-color="rgba(200,230,220,.06)"/></linearGradient>
  <symbol id="sl-robin" viewBox="6 16 54 38">${robin}</symbol>
</defs></svg>`;

// ——— letters: cut in brass, gilt, pencil ———
const T = (x, y, s, o, fill) => `<text x="${x}" y="${y}" text-anchor="${o.anchor || "middle"}" font-family="${o.fam || "Noto Serif TC"}" font-weight="${o.w || 700}" font-size="${o.size || 10}" letter-spacing="${o.ls ?? .12 * (o.size || 10)}" fill="${fill}">${esc(s)}</text>`;
const cut = (x, y, s, o = {}) => T(x, y + .7, s, o, "rgba(255,242,205,.62)") + T(x, y, s, o, "#4a3008");
const gilt = (x, y, s, o = {}) => T(x, y + .8, s, o, "rgba(20,8,0,.55)") + T(x, y, s, o, "url(#sl-foil)");
const ink = (x, y, s, o = {}, c = "#3b3a36") => T(x, y, s, o, c);
// A soft shadow without a blur: dark rounded rectangles, the outer fainter.
// The light is the window's, at the upper left: a shadow falls to the right and down, three steps from dark to faint.
const shade = (x, y, w, h, r = 2, a = .5) => `<rect x="${x + 2}" y="${y + 3}" width="${w + 7}" height="${h + 6}" rx="${r + 4}" fill="rgba(35,18,5,${(a * .13).toFixed(3)})"/><rect x="${x + 3}" y="${y + 3.5}" width="${w + 3}" height="${h + 2.5}" rx="${r + 2}" fill="rgba(35,18,5,${(a * .22).toFixed(3)})"/><rect x="${x + 2.4}" y="${y + 2.4}" width="${w}" height="${h}" rx="${r}" fill="rgba(25,12,2,${(a * .42).toFixed(3)})"/>`;
// The brass: brushed, bevelled, two rivets, one line cut or two.
function plate(x, y, w, h, l1, l2, o = {}) {
  const s1 = o.s1 || 9.5, s2 = o.s2 || 8;
  const txt = l2 ? cut(w / 2, h / 2 - 1.2, l1, { size: s1, ls: o.ls1 }) + cut(w / 2, h / 2 + s2 + .6, l2, { size: s2, w: 600, ls: o.ls2 }) : cut(w / 2, h / 2 + s1 * .36, l1, { size: s1, ls: o.ls1 });
  return `<g transform="translate(${x} ${y})"><rect x=".4" y="1.3" width="${w}" height="${h}" rx="1.5" fill="rgba(0,0,0,.5)"/>
    <rect width="${w}" height="${h}" rx="1.5" fill="url(#sl-brass)"/><rect width="${w}" height="${h}" rx="1.5" fill="url(#sl-brush)"/>
    <rect x=".45" y=".45" width="${w - .9}" height="${h - .9}" rx="1.2" fill="none" stroke="rgba(255,243,200,.65)" stroke-width=".8"/>
    <rect x="1.8" y="1.8" width="${w - 3.6}" height="${h - 3.6}" rx=".8" fill="none" stroke="rgba(90,55,10,.32)" stroke-width=".5"/>
    <rect x="1.4" y=".7" width="${w - 2.8}" height=".8" fill="rgba(255,252,232,.85)"/><rect x="1" y="${h - 1.3}" width="${w - 2}" height="1.1" fill="rgba(70,40,5,.6)"/><ellipse cx="${w * .3}" cy="${h * .35}" rx="${w * .16}" ry="${h * .3}" fill="url(#sl-shine)" opacity=".55"/>
    ${o.rivets === false ? "" : `<circle cx="4.4" cy="${h / 2}" r="1.5" fill="url(#sl-rivet)"/><circle cx="${w - 4.4}" cy="${h / 2}" r="1.5" fill="url(#sl-rivet)"/>`}${txt}</g>`;
}

// ——— a picture: a carved gilt frame (a torus, a row of beads, a deep cove, the ogee, a sight edge), shells and leaves at
// the corners, a crest on the big one; the canvas under old varnish (wine velvet behind it while, or if never, it loads),
// the frame's shadow on its top and left ———
function frame(x, y, w, h, img, b, hole = false) { // hole: the sight left open, the picture lies under the frame (美術館)
  const big = w > 70, B = b * (big ? 1.25 : 1.12);
  const prof = [[B * .14, "v"], [B * .12, "b"], [B * .24, "c"], [B * .3, "v"], [B * .08, "f"], [B * .12, "c"]];
  const ix = B, iw = w - 2 * B, ih = h - 2 * B, cid = hole && uid("sight"); // open, the shadow on the wall must not fall over the sight
  let s = `${hole ? `<clipPath id="${cid}"><path clip-rule="evenodd" d="M-12 -12H${w + 14}V${h + 14}H-12Z M${ix} ${ix}V${ix + ih}H${ix + iw}V${ix}Z"/></clipPath><g clip-path="url(#${cid})">${shade(0, 1, w, h, 1, .6)}</g>` : shade(0, 1, w, h, 1, .6)}${mould(0, 0, w, h, prof, "gold")}`;
  s += `${hole ? "" : `<rect x="${ix}" y="${ix}" width="${iw}" height="${ih}" fill="#3a2610"/>
    ${img ? `<image href="${esc(img)}" x="${ix}" y="${ix}" width="${iw}" height="${ih}" preserveAspectRatio="xMidYMid slice"/>` : `<rect x="${ix}" y="${ix}" width="${iw}" height="${ih}" fill="url(#sl-velvet)"/>`}`}
    <rect x="${ix}" y="${ix}" width="${iw}" height="${ih}" fill="${TH.varnish}"/>${hole ? "" : `<rect x="${ix}" y="${ix}" width="${iw}" height="${ih}" fill="url(#sl-weave)" opacity=".2"/>`}
    <rect x="${ix}" y="${ix}" width="${iw}" height="${ih}" fill="url(#sl-varnish)"/>
    <path d="M${ix} ${ix}H${ix + iw}V${ix + 2.4}H${ix + 2.4}V${ix + ih}H${ix}Z" fill="rgba(20,10,0,.45)"/><path d="M${ix} ${ix}H${ix + iw}V${ix + 5}H${ix + 5}V${ix + ih}H${ix}Z" fill="rgba(20,10,0,.16)"/>`;
  const cs = B * 1.45;
  // open (美術館, a wall that grows by every work read): each size's four corners carved once and used by every frame of it
  const cn = hole ? (cx, cy, sx, sy) => { const k = `corner${Math.round(cs * 100)}${sx > 0 ? "r" : "l"}${sy > 0 ? "d" : "u"}`;
    if (!CORNERS.has(k)) CORNERS.set(k, corner(0, 0, cs, sx, sy)); return `<use href="#sl-${k}" x="${cx}" y="${cy}"/>`; } : (cx, cy, sx, sy) => corner(cx, cy, cs, sx, sy);
  s += cn(B * .15, B * .15, 1, 1) + cn(w - B * .15, B * .15, -1, 1) + cn(w - B * .15, h - B * .15, -1, -1) + cn(B * .15, h - B * .15, 1, -1);
  if (big) s += cartouche(w / 2, B * .2, B * 1.9) + cartouche(w / 2, h - B * .1, B * 1.2);
  return `<g transform="translate(${x} ${y})">${s}</g>`;
}
// 美術館's frames are this same frame (the owner, 2026-11-23: 「美術館點進去畫框要和外面一樣」), drawn in the room's units
// — w wide on border b, as on the wall — and scaled up whole; its height from the work's own shape.
// Its ids are the page's own (mf-): the lifted room is in the document with the page while the camera moves.
const MF = (s) => s.replace(/(id="|url\(#|href="#)sl-/g, "$1mf-");
export const FRAME_DEFS = MF(DEFS);
const CORNERS = new Map(); // the carved corners each size of open frame uses (frame, hole), drawn by frameCorners
export const frameCorners = () => MF(fuseGilt(`<svg class="sl-defs" width="0" height="0" aria-hidden="true"><defs>${[...CORNERS].map(([k, g]) => `<g id="sl-${k}">${g}</g>`).join("")}</defs></svg>`));
export function museumFrame(ratio, w, b) {
  const B = b * (w > 70 ? 1.25 : 1.12), h = +((w - 2 * B) / ratio + 2 * B).toFixed(2);
  return { w, h, B, svg: MF(fuseGilt(`<svg viewBox="0 0 ${w} ${h}" overflow="visible" aria-hidden="true">${frame(0, 0, w, h, "", b, true)}</svg>`)) };
}
const pictureLight = (cx, y, w) => `<ellipse cx="${cx}" cy="${y + w * .7}" rx="${w * 1.05}" ry="${w * .95}" fill="url(#sl-glow)"/>
  <rect x="${cx - 1}" y="${y - 10}" width="2" height="12" fill="url(#sl-gold)"/><rect x="${cx - w / 2}" y="${y}" width="${w}" height="5" rx="2.5" fill="url(#sl-gold)"/><rect x="${cx - w / 2}" y="${y + 3.5}" width="${w}" height="1.5" fill="rgba(255,240,190,.9)"/>`;

// ——— 美術館: the newest work in the middle under the light, the five before it round it; empty, the rail, two cords and hooks ———
const cord = (x1, x2, y) => `<path d="M${x1} 0 L${(x1 + x2) / 2} ${y}" stroke="rgba(150,120,70,.6)" stroke-width=".5"/>`;
const LAMP = [126, 34, 56], HANG_AT = [146, 50]; // the picture light in the drawing (its middle, its top, its width); where the drawing hangs in the room
const HANG = [[76, 44, 100, 118, 9, 126, 38], [8, 22, 50, 64, 5, 30, 20], [194, 18, 50, 76, 5, 222, 16], [8, 100, 50, 68, 5, 0, 0], [194, 108, 50, 58, 5, 0, 0], [86, 176, 80, 58, 6, 0, 0]]; // x y w h border, cord x and drop
function hang(list, count, unit) {
  const rail = `<rect x="0" y="0" width="252" height="3" fill="url(#sl-gold)"/>`;
  if (!list.length) return svg(252, 250, `${rail}${cord(70, 70, 70)}${cord(182, 182, 70)}<path d="M68 70 q2 4 4 0" stroke="url(#sl-gold)" stroke-width="1.4" fill="none"/><path d="M180 70 q2 4 4 0" stroke="url(#sl-gold)" stroke-width="1.4" fill="none"/>
    ${plate(96, 200, 60, 15, "美術館", "", { s1: 8.6, ls1: 2 })}`);
  const n = Math.min(HANG.length, list.length);
  let s = rail;
  for (let i = 0; i < n; i++) if (HANG[i][6]) s += cord(HANG[i][5], HANG[i][5], HANG[i][6]);
  s += pictureLight(...LAMP);
  for (let i = 0; i < n; i++) { const [x, y, w, h, b] = HANG[i]; s += frame(x, y, w, h, pic(list[i].a), b); }
  return svg(252, 250, s + plate(192, 196, 50, 26, "美術館", `${count} ${unit}`, { s1: 8.6, s2: 7.6, ls1: 1.2 }));
}

// ——— 我的書架: the case of the shelf page; the book being read (or the last finished) faces out, the others spine out ———
function volume(w, h, title) { // wine leather, a gilt frame and the robin in a ring, the title in gilt
  const id = uid("vb");
  return `<rect x="${w}" y="1.5" width="3" height="${h - 3}" fill="#efe4c8"/><rect x="${w}" y="1.5" width="3" height="${h - 3}" fill="url(#sl-topshade)"/>
    <clipPath id="${id}"><rect width="${w}" height="${h}" rx="1.2"/></clipPath><g clip-path="url(#${id})"><rect width="${w}" height="${h}" fill="url(#sl-leather)"/>
    <rect width="${w}" height="${h}" fill="#8a1c34" opacity=".72"/><rect width="${w}" height="${h}" fill="url(#sl-varnish)"/></g>
    <rect x="${w * .07}" y="${h * .05}" width="${w * .86}" height="${h * .9}" fill="none" stroke="url(#sl-gold)" stroke-width=".9"/>
    <rect x="${w * .11}" y="${h * .075}" width="${w * .78}" height="${h * .85}" fill="none" stroke="url(#sl-gold)" stroke-width=".4"/>
    <circle cx="${w / 2}" cy="${h * .4}" r="${w * .2}" fill="none" stroke="url(#sl-gold)" stroke-width=".9"/>
    <use href="#sl-robin" x="${w / 2 - w * .13}" y="${h * .4 - w * .085}" width="${w * .26}" height="${w * .17}" style="--rb-ink:#d9ab4d;--rb-breast:#f6d06a;--rb-wing:#7a5418"/>
    ${title ? gilt(w / 2, h * .7, [...title].slice(0, 8).join(""), { size: Math.min(4.6, (w * .78) / Math.max(4, [...title].slice(0, 8).length)), ls: .2 }) : `<rect x="${w * .25}" y="${h * .68}" width="${w * .5}" height="${Math.max(1.4, h * .025)}" fill="url(#sl-foil)"/>`}
    <rect x="${w * .33}" y="${h * .76}" width="${w * .34}" height="${Math.max(1, h * .014)}" fill="url(#sl-foil)" opacity=".8"/>`;
}
const spine = (x, y, w, h, k) => { const c = ["#7a1f2e", "#23395b", "#2d4a35", "#5a3a1a", "#4a2a52"][k % 5];
  return `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" fill="url(#sl-leather)"/><rect width="${w}" height="${h}" fill="${c}" opacity=".78"/><rect width="${w}" height="${h}" fill="url(#sl-side)" opacity=".7"/>
    <rect y="${h * .12}" width="${w}" height="1" fill="url(#sl-gold)"/><rect y="${h * .16}" width="${w}" height=".5" fill="url(#sl-gold)"/><rect x="${w * .3}" y="${h * .32}" width="${w * .4}" height="${h * .36}" fill="url(#sl-foil)" opacity=".55"/>
    <rect y="${h * .84}" width="${w}" height=".5" fill="url(#sl-gold)"/><rect y="${h * .88}" width="${w}" height="1" fill="url(#sl-gold)"/></g>`; };
function bookcase(w, h, face, older, count, unit) {
  const cor = 18, pl = 14, side = 9, sh = 2, cup = 112, bx = side, by = cor + 2, bw = w - 2 * side, bh = h - cor - pl - 2 - cup, step = bh / sh;
  // the carcass; the back is boards of dark mahogany standing on end, a groove at each joint, darker in the corners
  let s = `<ellipse cx="${w / 2}" cy="${h}" rx="${w * .6}" ry="7" fill="url(#sl-drop)"/>
    <rect width="${w}" height="${h}" fill="url(#sl-cherryv)"/><rect width="${w}" height="${h}" fill="#1c0d05" opacity=".25"/>
    <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#sl-veneer)"/><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#1a0904" opacity=".5"/>`;
  for (let j = 1; j < 4; j++) { const x = bx + (bw * j) / 4; s += `<rect x="${x - .5}" y="${by}" width=".9" height="${bh}" fill="rgba(8,3,0,.6)"/><rect x="${x + .4}" y="${by}" width=".5" height="${bh}" fill="rgba(255,215,170,.1)"/>`; }
  s += `<rect x="${bx}" y="${by}" width="7" height="${bh}" fill="url(#sl-aoL)"/><rect x="${bx}" y="${by}" width="4" height="${bh}" fill="url(#sl-aoL)"/><rect x="${bx + bw - 9}" y="${by}" width="9" height="${bh}" fill="url(#sl-aoR)"/>`;
  for (let i = 0; i < sh; i++) { const y0 = by + step * i; s += `<rect x="${bx}" y="${y0}" width="${bw}" height="${step}" fill="url(#sl-topshade)"/><rect x="${bx}" y="${y0 + step * .2}" width="${bw}" height="${step * .8}" fill="url(#sl-baylit)"/>`; }
  const fl = by + step - 5;
  if (face) { // the book facing out, its ribbon hanging, a brass bookend; the older ones spine out beside it
    const vw = Math.min(bw * .4, step * .52), vh = vw * 1.55, vx = bx + bw * .07;
    s += `<g transform="translate(${vx} ${fl - vh}) rotate(-1.5 0 ${vh})">${shade(0, 0, vw, vh, 1, .6)}${volume(vw, vh, face.title)}
      ${face.reading ? `<rect x="${vw * .55}" y="${vh - 2}" width="${Math.max(2, vw * .06)}" height="${vh * .2}" fill="#7a1f2e"/>` : ""}</g>`;
    let x = vx + vw + 6;
    for (const [k] of older.slice(0, 5).entries()) { const sh2 = vh * (.88 + (k % 3) * .05), sw = 5.4; s += spine(x, fl - sh2, sw, sh2, k); x += sw + .6; }
    s += `<rect x="${x + 2}" y="${fl - vh * .42}" width="${Math.max(3, bw * .05)}" height="${vh * .42}" rx="1" fill="url(#sl-brass)"/>`;
    if (older.length > 5) { let x2 = bx + 6; const yb = by + 2 * step - 5; for (const k of older.slice(5, 16).keys()) { const sh2 = step * (.6 + (k % 3) * .05); s += spine(x2, yb - sh2, 5, sh2, k + 5); x2 += 5.6; } }
  }
  // a shelf: a board seen a little from above — its top lit, its front a moulded lip (a small ovolo over a bead), its
  // shadow on the back below it, the ends let into the sides
  const board = (y, t) => `<rect x="${bx}" y="${y + t}" width="${bw}" height="10" fill="url(#sl-aoDown)"/><rect x="${bx}" y="${y + t}" width="${bw}" height="4" fill="url(#sl-aoDown)"/>
    <rect x="${bx - 1}" y="${y - 1.8}" width="${bw + 2}" height="1.8" fill="url(#sl-wdh)"/><rect x="${bx - 1}" y="${y - 1.8}" width="${bw + 2}" height="1.8" fill="rgba(255,228,190,.34)"/>
    <rect x="${bx - 1}" y="${y}" width="${bw + 2}" height="${t}" fill="url(#sl-wdh)"/><rect x="${bx - 1}" y="${y}" width="${bw + 2}" height="${t}" fill="url(#sl-shelfedge)"/>
    <rect x="${bx - 1}" y="${y + t - .6}" width="${bw + 2}" height=".6" fill="rgba(5,2,0,.75)"/><rect x="${bx - 1}" y="${y - 1.8}" width="2.4" height="${t + 1.8}" fill="rgba(5,2,0,.4)"/><rect x="${bx + bw - 1.4}" y="${y - 1.8}" width="2.4" height="${t + 1.8}" fill="rgba(5,2,0,.5)"/>`;
  for (let i = 1; i <= sh - 1; i++) { const y = by + step * i - 5;
    s += `${board(y, 6.5)}${plate(w / 2 - 8, y + 1, 16, 4.6, "", "", { rivets: false })}${cut(w / 2, y + 4.6, ["I", "II", "III"][i - 1], { fam: "Cormorant SC", size: 4, w: 700, ls: .3 })}`; }
  const cy = by + bh + 2, dw = (bw - 4) / 2; // the waist over the cupboard: a deeper board with a gilt bead; the cupboard: two panelled doors, brass knobs
  s += `${board(by + bh - 1, 9)}<path d="M${bx} ${by + bh + 5.4} H${bx + bw}" stroke="${TH.goldMid}" stroke-width="1.2" stroke-dasharray="0 2" stroke-linecap="round"/><path d="M${bx} ${by + bh + 5} H${bx + bw}" stroke="rgba(255,248,220,.6)" stroke-width=".45" stroke-dasharray="0 2" stroke-linecap="round"/>`;
  for (const d of [0, 1]) { const dx = bx + 1 + d * (dw + 2);
    s += `<rect x="${dx}" y="${cy + 8}" width="${dw}" height="${cup - 10}" fill="url(#sl-cherryvs)"/><rect x="${dx}" y="${cy + 8}" width="${dw}" height="${cup - 10}" fill="rgba(0,0,0,.28)"/>
      <rect x="${dx + 7}" y="${cy + 16}" width="${dw - 14}" height="${cup - 26}" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="1.2"/><rect x="${dx + 8}" y="${cy + 17}" width="${dw - 16}" height="${cup - 28}" fill="none" stroke="rgba(255,215,170,.1)"/>`; }
  s += `<circle cx="${w / 2 - 6}" cy="${cy + 8 + cup * .32}" r="2.2" fill="url(#sl-rivet)"/><circle cx="${w / 2 + 6}" cy="${cy + 8 + cup * .32}" r="2.2" fill="url(#sl-rivet)"/>`;
  // the pilasters: fluted, the grain up them, gilt capitals and bases
  for (const px of [0, w - side]) { s += `<rect x="${px}" width="${side}" height="${h}" fill="url(#sl-wdv)"/><rect x="${px}" width="${side}" height="${h}" fill="url(#sl-side)" opacity=".75"/>`;
    for (let i = 1; i <= 2; i++) s += `<rect x="${px + side * i / 3 - .5}" y="${cor + 10}" width="1" height="${h - cor - pl - 22}" rx=".5" fill="rgba(10,5,0,.55)"/><rect x="${px + side * i / 3 - 1}" y="${cor + 10}" width=".5" height="${h - cor - pl - 22}" fill="rgba(255,230,190,.18)"/>`;
    s += carve(`M${px - .5} ${cor} h${side + 1} v5 h${-side - 1}Z`, "gold", .6) + leaf(px + side / 2, cor + 9, px + side / 2, cor + 2, side * .34, 0, 2, "gold", .5) + carve(`M${px - .5} ${h - pl - 6} h${side + 1} v5 h${-side - 1}Z`, "gold", .6); }
  // the cornice: a cove, dentils, a bead, a projecting cyma; a carved crest standing on it
  s += `<rect x="-5" y="-6" width="${w + 10}" height="${cor + 6}" fill="url(#sl-wdh)"/>
    <rect x="-5" y="-6" width="${w + 10}" height="4" fill="rgba(255,235,200,.28)"/><rect x="-5" y="-2" width="${w + 10}" height="3" fill="rgba(10,5,0,.4)"/>
    ${Array.from({ length: Math.floor((w + 10) / 4.4) }, (_, i) => `<rect x="${-4 + i * 4.4}" y="1.4" width="2.8" height="3.4" fill="url(#sl-wdh)"/><rect x="${-4 + i * 4.4}" y="1.4" width="2.8" height=".7" fill="rgba(255,235,200,.3)"/><rect x="${-4 + i * 4.4 + 2.8}" y="1.4" width="1" height="3.4" fill="rgba(10,5,0,.55)"/>`).join("")}
    <rect x="-4" y="${cor - 4}" width="${w + 8}" height="4" fill="url(#sl-wdh)"/><rect x="-4" y="${cor - 4}" width="${w + 8}" height="1" fill="rgba(255,235,200,.25)"/><rect x="-4" y="${cor - 1}" width="${w + 8}" height="2" fill="rgba(10,5,0,.5)"/>
    <path d="M-2 ${cor - 2.4} H${w + 2}" stroke="${TH.goldMid}" stroke-width="1.4" stroke-dasharray="0 2.2" stroke-linecap="round"/>
    ${cartouche(w / 2, -7, 16, TH.crest)}
    <rect x="0" y="${h - pl}" width="${w}" height="${pl}" fill="url(#sl-wdh)"/><rect x="0" y="${h - pl}" width="${w}" height="${pl}" fill="url(#sl-boardlit)"/>
    ${mould(-2, h - pl, w + 4, 5, [[1.2, "v"], [1.4, "c"]], "wood")}
    ${plate(w / 2 - 47, 3, 94, 14, `我的書架${count ? `　${count} ${unit}` : ""}`, "", { s1: 8.4, ls1: 1 })}`;
  return svg(w, h, s);
}

// ——— 你讀過的世界: a library globe on its stand — the brass meridian ring graduated round the sphere, the
// hour circle at the pole, the broad horizon ring printed with its scales and borne on two braces; under it a turned
// column, three cabriole legs carved at the knee, shod in brass, and a compass on the stretchers between them ———
function globeHtml(count, unit) {
  const w = 70, h = 200, r = 28, cx = w / 2, cy = 40, fy = h - 4, rx = r * 1.27, ry = r * .3, rx2 = r * 1.02, ry2 = r * .2;
  const turned = (prof, top) => { const L = [], R = []; for (const [y, hw] of prof) { L.push([cx - hw, top + y]); R.push([cx + hw, top + y]); } return ptsD([...L, ...R.reverse()]); };
  const col = turned([[0, 2.4], [3, 3.6], [5, 2.2], [12, 2.4], [20, 4.6], [30, 5.4], [38, 4.2], [46, 2.4], [52, 2.4], [55, 4], [60, 4.4], [64, 3]], cy + r * .78);
  const hub = cy + r * .78 + 64;
  const cabr = (sx) => { const f = (x, y) => `${(cx + sx * x).toFixed(1)} ${y.toFixed(1)}`;
    return `M${f(2, hub - 2)} C${f(16, hub)} ${f(25, hub + 10)} ${f(24, hub + 22)} C${f(23, hub + 30)} ${f(27, fy - 6)} ${f(32, fy - 1)} L${f(26, fy)} C${f(20, fy - 6)} ${f(17, hub + 28)} ${f(17, hub + 20)} C${f(17, hub + 10)} ${f(10, hub + 6)} ${f(1, hub + 5)}Z`; };
  const front = `M${cx - 3.4} ${hub + 2} C${cx - 7} ${hub + 12} ${cx - 2} ${hub + 22} ${cx - 3} ${hub + 30} L${cx - 4.6} ${fy + 1} H${cx + 4.6} L${cx + 3} ${hub + 30} C${cx + 2} ${hub + 22} ${cx + 7} ${hub + 12} ${cx + 3.4} ${hub + 2}Z`;
  const wd = (d, grain = "url(#sl-wdv)", k = 1) => `<path d="${d}" fill="rgba(15,6,0,.5)" transform="translate(${.9 * k} ${.9 * k})"/><path d="${d}" fill="${grain}"/><path d="${d}" fill="url(#sl-relw)"/>`;
  // the horizon ring, its far half or its near half: the paper band on top (degrees and the months between two rules), the
  // wooden rim below it
  const band = (back) => { const s1 = back ? 1 : 0, s2 = back ? 0 : 1, d = `M${cx - rx} ${cy} A${rx} ${ry} 0 0 ${s1} ${cx + rx} ${cy} L${cx + rx2} ${cy} A${rx2} ${ry2} 0 0 ${s2} ${cx - rx2} ${cy}Z`;
    let t = "";
    for (let i = 0; i <= 36; i++) { const a = Math.PI * (back ? 1 + i / 36 : i / 36), c = Math.cos(a), sn = Math.sin(a), l = i % 3 ? .45 : .8;
      t += `<path d="M${(cx + rx2 * c).toFixed(2)} ${(cy + ry2 * sn).toFixed(2)} L${(cx + (rx2 + (rx - rx2) * l) * c).toFixed(2)} ${(cy + (ry2 + (ry - ry2) * l) * sn).toFixed(2)}" stroke="rgba(70,50,25,.55)" stroke-width=".3"/>`; }
    const mid = (k) => `<path d="M${cx - (rx2 + (rx - rx2) * k)} ${cy} A${rx2 + (rx - rx2) * k} ${ry2 + (ry - ry2) * k} 0 0 ${s1} ${cx + rx2 + (rx - rx2) * k} ${cy}" fill="none" stroke="rgba(120,30,30,.5)" stroke-width=".35"/>`;
    const rim = back ? "" : `<path d="M${cx - rx} ${cy} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy} v3.4 A${rx} ${ry} 0 0 1 ${cx - rx} ${cy + 3.4}Z" fill="url(#sl-wdh)"/><path d="M${cx - rx} ${cy} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy} v3.4 A${rx} ${ry} 0 0 1 ${cx - rx} ${cy + 3.4}Z" fill="url(#sl-turn)" opacity=".6"/><path d="M${cx - rx} ${cy + .2} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy + .2}" fill="none" stroke="rgba(255,230,190,.4)" stroke-width=".5"/>`;
    return `<path d="${d}" fill="#efe4c6"/><path d="${d}" fill="url(#sl-paper)" opacity=".5"/>${t}${mid(.55)}${mid(.75)}<path d="${d}" fill="none" stroke="rgba(60,35,10,.6)" stroke-width=".5"/>${back ? `<path d="${d}" fill="rgba(30,15,0,.22)"/>` : ""}${rim}`; };
  // the meridian: a flat brass ring round the sphere, turned with the axis, graduated every five degrees
  const R0 = r + 1.6, R1 = r + 5.4;
  let mer = `<circle cx="${cx + .8}" cy="${cy + 1}" r="${(R0 + R1) / 2}" fill="none" stroke="rgba(20,10,0,.5)" stroke-width="${R1 - R0}"/><circle cx="${cx}" cy="${cy}" r="${(R0 + R1) / 2}" fill="none" stroke="url(#sl-brass)" stroke-width="${R1 - R0}"/>
    <circle cx="${cx}" cy="${cy}" r="${R1}" fill="none" stroke="rgba(60,35,5,.7)" stroke-width=".4"/><circle cx="${cx}" cy="${cy}" r="${R0}" fill="none" stroke="rgba(60,35,5,.7)" stroke-width=".4"/><circle cx="${cx}" cy="${cy}" r="${R1 - .5}" fill="none" stroke="rgba(255,248,215,.5)" stroke-width=".3"/>`;
  for (let i = 0; i < 72; i++) { const a = (i / 72) * 2 * Math.PI, l = i % 2 ? .4 : .62; mer += `<path d="M${(cx + R0 * Math.cos(a)).toFixed(2)} ${(cy + R0 * Math.sin(a)).toFixed(2)} L${(cx + (R0 + (R1 - R0) * l) * Math.cos(a)).toFixed(2)} ${(cy + (R0 + (R1 - R0) * l) * Math.sin(a)).toFixed(2)}" stroke="rgba(60,35,5,.6)" stroke-width=".25"/>`; }
  mer += `${carve(`M${cx - 2.4} ${cy - R1 - 2.4} h4.8 v2.6 h-4.8Z`, "gold", .4)}${carve(`M${cx - 2.4} ${cy + R1 - .2} h4.8 v2.6 h-4.8Z`, "gold", .4)}
    <circle cx="${cx}" cy="${cy - R1 - 6.4}" r="4" fill="url(#sl-brass)"/><circle cx="${cx}" cy="${cy - R1 - 6.4}" r="3.2" fill="#efe4c6"/>${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * 2 * Math.PI; return `<path d="M${(cx + 2.2 * Math.cos(a)).toFixed(2)} ${(cy - R1 - 6.4 + 2.2 * Math.sin(a)).toFixed(2)} L${(cx + 3 * Math.cos(a)).toFixed(2)} ${(cy - R1 - 6.4 + 3 * Math.sin(a)).toFixed(2)}" stroke="rgba(60,40,20,.7)" stroke-width=".25"/>`; }).join("")}<path d="M${cx} ${cy - R1 - 6.4} l1.6 -2" stroke="#3a2a14" stroke-width=".4"/>`;
  const back = `<ellipse cx="${cx}" cy="${fy}" rx="${r * 1.35}" ry="6" fill="url(#sl-drop)"/>
    ${wd(cabr(-1))}${wd(cabr(1))}${leaf(cx - 22, hub + 12, cx - 18, hub + 24, 2.4, .2, 2, "gold", .45)}${leaf(cx + 22, hub + 12, cx + 18, hub + 24, 2.4, -.2, 2, "gold", .45)}
    ${carve(`M${cx - 33.4} ${fy - 2} h7.8 l.6 2.6 h-9Z`, "gold", .4)}${carve(`M${cx + 25.6} ${fy - 2} h7.8 l.6 2.6 h-9Z`, "gold", .4)}
    <path d="M${cx - 21} ${fy - 18} L${cx} ${fy - 15} L${cx + 21} ${fy - 18}" fill="none" stroke="#2a1006" stroke-width="2.6"/><path d="M${cx - 21} ${fy - 18} L${cx} ${fy - 15} L${cx + 21} ${fy - 18}" fill="none" stroke="url(#sl-wdh)" stroke-width="1.8"/>
    <ellipse cx="${cx}" cy="${fy - 14.6}" rx="7.4" ry="2.8" fill="url(#sl-brass)"/><ellipse cx="${cx}" cy="${fy - 14.9}" rx="6" ry="2.1" fill="#f1e8d0"/><path d="M${cx - 4.6} ${fy - 14.6} L${cx + 4.6} ${fy - 15.2}" stroke="#7a1f2e" stroke-width=".6"/><path d="M${cx} ${fy - 16.6} V${fy - 13.2}" stroke="rgba(60,40,20,.5)" stroke-width=".3"/>
    ${wd(front)}${carve(`M${cx - 5.2} ${fy - 1.2} h10.4 l.8 2.6 h-12Z`, "gold", .4)}
    ${wd(col, "url(#sl-wdv)")}<path d="${col}" fill="url(#sl-turn)" opacity=".8"/>
    ${wd(`M${cx - 6} ${hub - 2} h12 l1 6 h-14Z`, "url(#sl-wdh)")}
    ${[-1, 1].map((sx) => wd(`M${cx + sx * 3} ${cy + r * .82} C${cx + sx * 12} ${cy + r * .82} ${cx + sx * (rx - 4)} ${cy + 14} ${cx + sx * (rx - 1.4)} ${cy + 3} L${cx + sx * (rx + 1.2)} ${cy + 3.6} C${cx + sx * (rx - 1)} ${cy + 17} ${cx + sx * 12} ${cy + r * .82 + 3.4} ${cx + sx * 3} ${cy + r * .82 + 3.4}Z`, "url(#sl-wdh)")).join("")}
    <path d="M${cx - 4} ${cy + R1 + 2} Q${cx} ${cy + R1 + 9} ${cx + 4} ${cy + R1 + 2}" fill="none" stroke="url(#sl-brass)" stroke-width="2.2"/>
    ${band(true)}<g transform="rotate(${AXIS} ${cx} ${cy})">${mer}</g>`;
  const cl = uid("gc"), MW = 4 * r, MH = MW * 504 / 990;
  const fr = `<clipPath id="${cl}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><g clip-path="url(#${cl})"><g class="sl-net" transform="rotate(${AXIS} ${cx} ${cy})">
      ${[-.6, -.3, 0, .3, .6].map((k) => `<ellipse cx="${cx}" cy="${cy + k * r}" rx="${r * Math.sqrt(1 - k * k)}" ry="${r * .12 * Math.sqrt(1 - k * k)}" fill="none" stroke="${NET}" stroke-width=".4"/>`).join("")}
      ${[.35, .75].map((k) => `<ellipse cx="${cx}" cy="${cy}" rx="${r * k}" ry="${r}" fill="none" stroke="rgba(90,70,40,.3)" stroke-width=".4"/>`).join("")}</g>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(170,130,60,.14)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sl-sphere)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sl-varnish)"/>
      <ellipse cx="${cx - r * .38}" cy="${cy - r * .45}" rx="${r * .3}" ry="${r * .2}" transform="rotate(-30 ${cx - r * .38} ${cy - r * .45})" fill="url(#sl-shine)"/></g>
    <g transform="rotate(${AXIS} ${cx} ${cy})"><circle cx="${cx}" cy="${cy - r}" r="1.4" fill="url(#sl-rivet)"/></g>${band(false)}
    ${plate(cx - 32, 112, 64, count ? 24 : 15, "你讀過的世界", count ? `${count} ${unit}` : "", { s1: 7.6, s2: 7.4, ls1: .5 })}`;
  // between the two drawings, a disc of sea: the turning globe (turnGlobe), or the flat map turned with the axis, centred
  // near Vienna
  return `${svg(w, h, back)}<span class="sl-map" style="left:${cx - r}px;top:${cy - r}px;width:${2 * r}px;height:${2 * r}px"><span class="sl-mapin" style="left:${r - .545 * MW}px;top:${r - .3 * MH}px;width:${MW}px;height:${MH}px;transform-origin:${.545 * MW}px ${.3 * MH}px;transform:rotate(${AXIS}deg)"></span></span>${svg(w, h, fr)}`;
}

// ——— The globe turns by itself, slowly (the owner, 2026-11-23: 「我想要房間裡的地球儀會自己慢慢轉」) ———
// Between the two drawings above, the sphere itself: world.js's globe drawn by its own frame (paintGlobe) on a canvas,
// in the room's colours (style.css .sl-map), its axis leaning with the meridian ring, the net of meridians and parallels
// turning with it (the drawn net, which could not, is taken off). It opens on the eastern Mediterranean, Vienna near the
// middle, as the flat map did, and turns eastward, one turn in TURN seconds, at most FPS frames a second: at 60 s a turn
// a point on the equator moves 2π·28/(60·15) ≈ 0.2 px a frame. It is held still while the page is out of sight, while
// the camera moves in or back (.zoom), and with reduced motion (one still frame); it stops when the room is left.
// Without assets/globe.json the flat map (world.js drawMap) is drawn in the disc instead.
const AXIS = -23, NET = "rgba(90,70,40,.35)", FACE = [28, 32]; // the axis's lean; the net's ink; the longitude and latitude it opens on
const TURN = 60, FPS = 15;
function turnGlobe(room, map, read) {
  globe().then((g) => {
    if (!map.isConnected) return;
    const cv = document.createElement("canvas"), ctx = cv.getContext("2d"), s = getComputedStyle(map), v = (n) => s.getPropertyValue(n).trim();
    const look = { sea: v("--sl-sea"), land: v("--sl-land"), coast: v("--sl-coast"), coastW: .4, net: NET, netA: 1, netW: .4,
      read: v("--sl-wine"), ink: v("--sl-wine-edge"), readW: .4, robin: v("--sl-home"), dots: [.5, 1, 1], mark: [3.2, 1, .6] };
    const done = new Set(read.map((c) => String(c).toLowerCase())), open = new Set();
    let lon = FACE[0], last = 0, timer = 0, raf = 0;
    // a frame at the size the globe is seen at, in the screen's own pixels (three to a point on a phone: the disc is
    // small, and fewer leave its coasts soft); or `scale` times it, the camera's move in onto #/world's globe, in that
    // page's pixels (GLOBE_DPR), so the one lands on the other as it is
    const draw = (scale = 1, at = lon) => {
      const d = map.clientWidth;
      if (!d) return;
      const px = Math.round(map.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, scale > 1 ? GLOBE_DPR : 3) * scale);
      lon = at;
      if (cv.width !== px) cv.width = cv.height = px;
      ctx.setTransform(px / d, 0, 0, px / d, 0, 0);
      ctx.clearRect(0, 0, d, d);
      paintGlobe(ctx, g, { cx: d / 2, cy: d / 2, R: d / 2, lon, lat: FACE[1], roll: AXIS, done, open }, look);
    };
    cv.setAttribute("aria-hidden", "true");
    map.replaceChildren(cv);
    map.nextElementSibling?.querySelector(".sl-net")?.remove();
    map.globe = { draw }; // for the camera's move (landIn, wayBack), and a look at a fixed angle
    draw();
    if (calm()) return;
    const end = () => { clearTimeout(timer); cancelAnimationFrame(raf); document.removeEventListener("visibilitychange", wake); };
    const step = (now) => {
      raf = 0;
      if (!cv.isConnected || calm()) return end();
      if (document.hidden) { last = 0; return; } // visibilitychange wakes it
      const held = room.classList.contains("zoom"); // the camera moving: looked at again in a moment
      if (held) last = 0;
      else if (!last) last = now; // starting, or going on after a pause: the frame shown stands until the next
      else { lon -= (360 * Math.min(now - last, 200)) / (TURN * 1000); last = now; draw(); }
      // the screen's frame after the wait: on a 60 or 120 Hz screen the fourth or eighth, FPS a second
      timer = setTimeout(() => { timer = 0; raf = requestAnimationFrame(step); }, held ? 250 : 1000 / FPS - 5);
    };
    function wake() { if (!timer && !raf) raf = requestAnimationFrame(step); }
    document.addEventListener("visibilitychange", wake);
    wake();
  }, () => { // no outlines to be had: the flat map, or the plain sea
    const flat = map.querySelector(".sl-mapin");
    if (flat) drawMap(flat, { read }).then(() => flat.querySelector("p")?.remove()).catch(() => {});
  });
}

// ——— 郵票冊: open, green leather, the newest stamps on its pages (the day's picture, stamps.js stampPicture), the count
// pencilled in the corner; empty, shut, its name in gilt ———
function stamp(x, y, w, h, img, rot) {
  return `<g transform="translate(${x} ${y}) rotate(${rot} ${w / 2} ${h / 2})"><rect x=".6" y="1" width="${w}" height="${h}" fill="rgba(0,0,0,.22)"/>
    <rect width="${w}" height="${h}" fill="#fbf7ea"/><rect x="${w * .12}" y="${h * .1}" width="${w * .76}" height="${h * .66}" fill="#6b5a40"/>
    ${img ? `<image href="${esc(img)}" x="${w * .12}" y="${h * .1}" width="${w * .76}" height="${h * .66}" preserveAspectRatio="xMidYMid slice"/>` : ""}
    <rect x="${w * .2}" y="${h * .83}" width="${w * .6}" height=".8" fill="#8a7a5c"/>
    <rect width="${w}" height="${h}" fill="none" stroke="#efe6cf" stroke-width="1.5" stroke-dasharray="0 2" stroke-linecap="round"/></g>`;
}
const leatherOf = (w, h, c, a = .8) => `<rect width="${w}" height="${h}" rx="3" fill="url(#sl-leather)"/><rect width="${w}" height="${h}" rx="3" fill="${c}" opacity="${a}"/>`;
function album(w, h, imgs, count, unit) {
  const m = 5, pw = (w - 2 * m) / 2, ph = h - 2 * m;
  // the boards: green leather, a gilt roll round them, the corners worn lighter; the spine's raised bands at head and tail
  let s = `${shade(0, 0, w, h, 3)}${leatherOf(w, h, "#173a29", .82)}<rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="2" fill="none" stroke="url(#sl-gold)" stroke-width=".7"/>
    <rect x="2.6" y="2.6" width="${w - 5.2}" height="${h - 5.2}" rx="1.6" fill="none" stroke="url(#sl-gold)" stroke-width=".5" stroke-dasharray=".6 .8"/>
    ${[[0, 0], [w, 0], [0, h], [w, h]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="rgba(200,220,190,.12)"/>`).join("")}
    ${[-1, 1].map((sy) => [-3, 0, 3].map((dx) => `<rect x="${w / 2 + dx - .7}" y="${sy < 0 ? .4 : h - 2.4}" width="1.4" height="2" rx=".6" fill="#0f2a1c"/><rect x="${w / 2 + dx - .7}" y="${sy < 0 ? .4 : h - 2.4}" width=".5" height="2" fill="rgba(200,230,200,.25)"/>`).join("")).join("")}`;
  for (const side of [0, 1]) {
    const px = m + side * pw;
    // the page block under the open page: a few leaves' edges at the fore-edge
    s += [3, 2, 1].map((k) => `<rect x="${side ? px + k * .5 : px - k * .5}" y="${m + k * .45}" width="${pw}" height="${ph}" fill="${k % 2 ? "#e2d6b8" : "#efe5cc"}"/>`).join("");
    s += `<rect x="${px}" y="${m}" width="${pw}" height="${ph}" fill="#efe6cf"/><rect x="${px}" y="${m}" width="${pw}" height="${ph}" fill="url(#sl-paper)" opacity=".6"/>`;
    // a small album (the one on the sill) keeps room for its words: three rows of stamps, the head and the foot wider
    const small = w < 90, cols = 3, rows = small ? 3 : 4, gx = pw * .1, gy = ph * (small ? .22 : .16), foot = ph * (small ? .2 : .1), cw = (pw - 2 * gx) / cols, rh = (ph - gy - foot) / rows;
    for (let r = 0; r < rows; r++) { // the glassine strip each row of stamps is slipped into
      const sy = m + gy + r * rh + rh * .08, shh = rh * .84;
      s += `<rect x="${px + gx * .6}" y="${sy + shh * .45}" width="${pw - gx * 1.2}" height="${shh * .55}" fill="rgba(255,255,250,.28)"/><rect x="${px + gx * .6}" y="${sy + shh * .45}" width="${pw - gx * 1.2}" height=".35" fill="rgba(120,110,90,.4)"/>`;
      for (let c = 0; c < cols; c++) {
        const k = side * cols * rows + r * cols + c, sx = px + gx + c * cw + cw * .12, sw = cw * .76;
        s += `<rect x="${sx}" y="${sy}" width="${sw}" height="${shh}" fill="none" stroke="rgba(120,100,70,.3)" stroke-width=".35"/>`;
        if (k < imgs.length) s += stamp(sx, sy, sw, shh, imgs[k], ((k * 7) % 5 - 2) * .6);
      }
      s += `<rect x="${px + gx * .6}" y="${sy + shh * .45}" width="${pw - gx * 1.2}" height="${shh * .55}" fill="rgba(255,255,250,.1)"/><rect x="${px + gx * .6}" y="${sy + shh * .45 + .3}" width="${pw - gx * 1.2}" height=".3" fill="rgba(255,255,255,.55)"/>`;
    }
    // each page's head set to fit the page: 郵票冊 on the right, BRIEFMARKEN on the left
    const fit = (len, em, max) => Math.min(max, (pw * .82) / (len * em));
    s += side ? ink(px + pw / 2, m + gy * .72, "郵票冊", { size: fit(3, 1.5, 6), w: 600, ls: fit(3, 1.5, 6) * .4 }, "#6b5a40")
      : ink(px + pw / 2, m + gy * .72, "BRIEFMARKEN", { fam: "Cormorant SC", size: fit(11, .86, 5.2), w: 600, ls: fit(11, .86, 5.2) * .2 }, "#6b5a40");
    // the page curving down into the gutter
    s += `<rect x="${side ? px : px + pw * .55}" y="${m}" width="${pw * .45}" height="${ph}" fill="url(#sl-gutter)" ${side ? `transform="rotate(180 ${px + pw * .225} ${m + ph / 2})"` : ""}/>`;
  }
  s += `<rect x="${w / 2 - .6}" y="${m}" width="1.2" height="${ph}" fill="rgba(40,25,10,.45)"/>${ink(w - m - pw * .1, h - m - (w < 90 ? ph * .05 : 4), `${count} ${unit}`, { size: w < 90 ? 5.4 : 6.4, w: 600, ls: .3, anchor: "end" }, "#4e4a44")}`;
  return svg(w, h, s);
}
function albumClosed(w, h) {
  const bs = Math.min(5.6, w * .053); // BRIEFMARKEN kept inside the gilt rule however narrow the album is drawn
  return svg(w, h, `${shade(0, 0, w, h, 3)}<rect x="${w - 4}" y="2" width="4" height="${h - 4}" fill="#efe6cf"/>${leatherOf(w - 3, h, "#173a29", .82)}<rect width="${w * .12}" height="${h}" fill="rgba(0,0,0,.25)"/>
    <rect x="${w * .2}" y="${h * .1}" width="${w * .7}" height="${h * .8}" fill="none" stroke="url(#sl-gold)" stroke-width=".9"/>${gilt(w * .55, h * .5, "郵票冊", { size: Math.min(11, w * .12), ls: 3 })}
    ${gilt(w * .55, h * .5 + 11, "BRIEFMARKEN", { fam: "Cormorant SC", size: bs, w: 600, ls: bs * .2 })}`);
}

// ——— 劃線本: the notebook open, pencil under some of its lines, the green pencil on it, the count pencilled ———
function pencil(len, rot, x, y) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="1.5" y="3.5" width="${len}" height="4" rx="2" fill="rgba(0,0,0,.3)"/>
    <rect width="${len * .8}" height="5" fill="url(#sl-pencil)"/><rect x="${len * .8 - .1}" width="${len * .04}" height="5" fill="url(#sl-gold)"/>
    <path d="M${len * .84} 0 L${len} 2.5 L${len * .84} 5Z" fill="#e8c9a0"/><path d="M${len * .94} 1.6 L${len} 2.5 L${len * .94} 3.4Z" fill="#2a2a2a"/>
    <rect x="${len * .1}" y="1.4" width="${len * .22}" height="1" fill="url(#sl-foil)" opacity=".85"/></g>`;
}
// ——— 劃線本: the notebook open — its leather boards showing round the page block, a blind rule tooled on
// them, the leaves' edges at the fore-edge and the foot, the pages curving into the gutter, a headband at the spine; pencil
// under some of its lines, the green pencil on it, the count pencilled ———
function notebook(w, h, count, unit) {
  const m = 4, pw = (w - 2 * m) / 2, ph = h - 2 * m, marked = Math.min(count, 8);
  let s = `${shade(0, 0, w, h, 3)}<rect width="${w}" height="${h}" rx="3" fill="#1d1410"/><rect width="${w}" height="${h}" rx="3" fill="url(#sl-leather)" opacity=".5"/>
    <rect x="1.4" y="1.4" width="${w - 2.8}" height="${h - 2.8}" rx="2.2" fill="none" stroke="rgba(0,0,0,.45)" stroke-width=".5"/><rect x="1.8" y="1.8" width="${w - 2.8}" height="${h - 2.8}" rx="2.2" fill="none" stroke="rgba(255,220,180,.12)" stroke-width=".4"/>
    <rect x="${w * .62}" y="${h - 2}" width="3" height="${h * .18}" fill="#7a1f2e"/><rect x="${w * .62}" y="${h - 2}" width="1" height="${h * .18}" fill="rgba(255,200,200,.2)"/>`;
  let k = 0;
  for (const side of [0, 1]) {
    const px = m + side * pw, lines = Math.floor(ph / 6.2) - 3;
    s += [2.4, 1.6, .8].map((d) => `<rect x="${side ? px + d * .6 : px - d * .6}" y="${m + d * .5}" width="${pw}" height="${ph}" fill="${d > 2 ? "#d8cbad" : d > 1 ? "#ebe1c8" : "#e2d6ba"}"/>`).join("");
    s += `<rect x="${px}" y="${m}" width="${pw}" height="${ph}" fill="#f6efdf"/><rect x="${px}" y="${m}" width="${pw}" height="${ph}" fill="url(#sl-paper)" opacity=".35"/>`;
    for (let i = 0; i < lines; i++) {
      const y = m + ph * .2 + i * 6.2, len = pw * (.62 + ((i * 37 + side * 11) % 30) / 100);
      s += count ? `<rect x="${px + pw * .1}" y="${y}" width="${len * .9}" height="1.5" fill="rgba(70,62,50,.32)"/>` : `<rect x="${px + pw * .08}" y="${y + 1}" width="${pw * .84}" height=".5" fill="rgba(90,110,140,.3)"/>`;
      if (count && (i + side * 2) % 3 === 1 && k++ < marked) s += `<path d="M${px + pw * .1} ${y + 2.6} q${len * .2} -.7 ${len * .44} .2 t${len * .4} -.2" fill="none" stroke="rgba(55,55,58,.75)" stroke-width=".8" stroke-linecap="round"/>`;
    }
    s += `<rect x="${side ? px : px + pw * .5}" y="${m}" width="${pw * .5}" height="${ph}" fill="url(#sl-gutter)" ${side ? `transform="rotate(180 ${px + pw * .25} ${m + ph / 2})"` : ""}/>`;
  }
  s += `<rect x="${w / 2 - .7}" y="${m}" width="1.4" height="${ph}" fill="rgba(50,30,15,.4)"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${w / 2 - 2 + i}" y="${m - 1.4}" width="1" height="1.6" fill="${i % 2 ? "#7a1f2e" : "#e9d6ad"}"/>`).join("")}
    ${ink(m + pw / 2, m + ph * .12, "劃線本", { size: 7.6, w: 600, ls: 2 }, "#4b4a47")}`;
  if (count) s += ink(w - m - 5, h - m - 4, `${count} ${unit}`, { size: 6.4, w: 400, ls: .3, anchor: "end" }, "#56544f");
  return svg(w, h, s + pencil(w * .78, -16, w * .2, h * .78));
}

// ——— 紀念章: the case open, ivory silk in the lid, the medals earned in the wine velvet; empty, shut ———
const medalCoin = (cx, cy, r) => `<circle cx="${cx + .8}" cy="${cy + 1.6}" r="${r}" fill="rgba(0,0,0,.45)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sl-coin)"/>
  <circle cx="${cx}" cy="${cy}" r="${r * .86}" fill="none" stroke="#8a6220" stroke-width=".6"/><circle cx="${cx}" cy="${cy}" r="${r * .78}" fill="none" stroke="#f6e6b4" stroke-width=".4" stroke-dasharray=".6 1.1"/>
  <use href="#sl-robin" x="${cx - r * .5}" y="${cy - r * .36}" width="${r}" height="${r * .7}" style="--rb-ink:#9a6e26;--rb-breast:#f3d78e;--rb-wing:#7a5418;--rb-eye:#6e4c16"/>`;
function medalCase(w, h, count, unit) {
  const lidH = h * .42, tray = h - lidH, cols = 3, rows = 2;
  let s = `${shade(0, 0, w, h, 2)}<rect width="${w}" height="${lidH}" rx="2" fill="url(#sl-cherrys)"/><rect width="${w}" height="${lidH}" rx="2" fill="url(#sl-boardlit)"/>
    <rect x="4" y="4" width="${w - 8}" height="${lidH - 7}" fill="#efe6d2"/><rect x="4" y="4" width="${w - 8}" height="${lidH - 7}" fill="url(#sl-paper)" opacity=".7"/><rect x="4" y="4" width="${w - 8}" height="${lidH - 7}" fill="url(#sl-topshade)" opacity=".5"/>
    <circle cx="${4 + lidH * .42}" cy="${lidH * .47}" r="${lidH * .27}" fill="none" stroke="url(#sl-gold)" stroke-width="1"/>
    <use href="#sl-robin" x="${4 + lidH * .42 - lidH * .19}" y="${lidH * .47 - lidH * .12}" width="${lidH * .38}" height="${lidH * .25}" style="--rb-ink:#b98a33;--rb-breast:#e9c66c;--rb-wing:#7a5418"/>
    ${gilt((w + lidH * .84) / 2, lidH * .43, "紀念章", { size: 8.4, ls: 2 })}${gilt((w + lidH * .84) / 2, lidH * .43 + 9.5, `${count} ${unit}`, { size: 7.2, w: 600, ls: 1 })}
    <rect y="${lidH - 3}" width="${w}" height="3" fill="url(#sl-gold)"/>
    <g transform="translate(0 ${lidH}) scale(1 .55) translate(0 ${-lidH})"><rect y="${lidH}" width="${w}" height="${tray}" rx="2" fill="url(#sl-cherrys)"/><rect y="${lidH}" width="${w}" height="${tray}" fill="url(#sl-boardlit)"/>
    <rect x="4" y="${lidH + 3}" width="${w - 8}" height="${tray - 7}" fill="url(#sl-velvet)"/><rect x="4" y="${lidH + 3}" width="${w - 8}" height="${tray - 7}" fill="#4a1020" opacity=".62"/>
    <rect x="4" y="${lidH + 3}" width="${w - 8}" height="${tray - 7}" fill="url(#sl-topshade)"/>`;
  const cw = (w - 8) / cols, rh = (tray - 7) / rows, rr = Math.min(cw, rh) * .34;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cx = 4 + cw * (c + .5), cy = lidH + 3 + rh * (r + .5);
    s += `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="rgba(20,0,6,.55)"/><circle cx="${cx}" cy="${cy + .6}" r="${rr}" fill="none" stroke="rgba(255,150,170,.12)" stroke-width=".6"/>`;
    if (r * cols + c < count) s += medalCoin(cx, cy - .4, rr * .96);
  }
  s += `</g><rect y="${lidH + tray * .55}" width="${w}" height="6" fill="url(#sl-cherrys)"/><rect y="${lidH + tray * .55}" width="${w}" height="6" fill="rgba(0,0,0,.28)"/><rect y="${lidH + tray * .55}" width="${w}" height=".8" fill="rgba(255,225,190,.35)"/>`;
  return svg(w, h, s);
}
const medalCaseClosed = (w, h) => svg(w, h, `${shade(0, 0, w, h, 2)}<rect width="${w}" height="${h}" rx="2" fill="url(#sl-cherrys)"/><rect width="${w}" height="${h}" rx="2" fill="url(#sl-boardlit)"/>
  <rect y="${h * .78}" width="${w}" height="1.2" fill="rgba(0,0,0,.6)"/><rect x="${w / 2 - 5}" y="${h * .74}" width="10" height="6" rx="1" fill="url(#sl-brass)"/>
  <circle cx="${w / 2}" cy="${h * .3}" r="${h * .17}" fill="none" stroke="url(#sl-gold)" stroke-width="1"/><use href="#sl-robin" x="${w / 2 - h * .12}" y="${h * .3 - h * .08}" width="${h * .24}" height="${h * .16}" style="--rb-ink:#d9ab4d;--rb-breast:#f6d06a;--rb-wing:#7a5418"/>
  ${gilt(w / 2, h * .64, "紀念章", { size: 8, ls: 2 })}`);

// ——— 詩箋: the mahogany writing box — its rim moulded, a line of pale stringing let in round the front, brass
// angles at its corners, two small bracket feet; the letters standing in it, the newest in front with its poem's title
// (filled in once the article is read, wireSalon) and three printed lines; empty, the box alone ———
function writingBox(w, h, count, unit) {
  const front = h * .42, top = h - front, n = Math.min(count, 6);
  let s = `${shade(0, 0, w, h, 2)}<rect x="2" y="${top * .55}" width="${w - 4}" height="${top * .5}" fill="#1a0e07"/><rect x="2" y="${top * .55}" width="${w - 4}" height="${top * .5}" fill="url(#sl-velvet)" opacity=".25"/>`;
  for (let i = 0; i < n; i++) {
    const sx = 6 + i * 1.6, sy = top * .02 + (n - 1 - i) * 2.2, sw = w - 12 - i * 1.4, rot = (i - n / 2) * .7, last = i === n - 1;
    s += `<g transform="rotate(${rot} ${w / 2} ${top})"><rect x="${sx}" y="${sy}" width="${sw}" height="${top + 4}" fill="${last ? "#f7f0de" : "#ebe1c8"}" stroke="rgba(120,100,70,.35)" stroke-width=".4"/><rect x="${sx}" y="${sy}" width="${sw}" height="${top + 4}" fill="url(#sl-paper)" opacity=".3"/>
      ${last ? `<text class="sl-poem" x="${w / 2}" y="${sy + 9}" text-anchor="middle" font-family="Cormorant SC" font-weight="600" font-size="4.6" letter-spacing=".6" fill="#7a6a50"></text>${[0, 1, 2].map((k) => `<rect x="${w / 2 - sw * (.3 - k * .03)}" y="${sy + 14 + k * 4.4}" width="${sw * (.6 - k * .06)}" height="1.2" fill="rgba(60,50,40,.45)"/>`).join("")}` : ""}</g>`;
  }
  const pw = Math.min(w - 14, 58), ang = (x, y, sx, sy) => carve(`M${x} ${y} h${sx * 5} v${sy * 1.4} h${-sx * 3.6} v${sy * 3.6} h${-sx * 1.4}Z`, "gold", .35);
  s += `<rect y="${top}" width="${w}" height="${front}" rx="1" fill="url(#sl-wdh)"/><rect y="${top}" width="${w}" height="${front}" rx="1" fill="url(#sl-boardlit)"/>
    <rect x="2.6" y="${top + 3.2}" width="${w - 5.2}" height="${front - 6}" fill="none" stroke="rgba(236,206,150,.55)" stroke-width=".5"/><rect x="2.6" y="${top + 3.7}" width="${w - 5.2}" height="${front - 6}" fill="none" stroke="rgba(10,3,0,.3)" stroke-width=".3"/>
    <rect x="-1" y="${top - 2.4}" width="${w + 2}" height="3.6" fill="url(#sl-wdh)"/><rect x="-1" y="${top - 2.4}" width="${w + 2}" height="1.2" fill="rgba(255,228,190,.4)"/><rect x="-1" y="${top + .6}" width="${w + 2}" height=".6" fill="rgba(10,3,0,.6)"/>
    ${ang(0, top, 1, 1)}${ang(w, top, -1, 1)}${ang(0, h, 1, -1)}${ang(w, h, -1, -1)}
    <path d="M2 ${h} h6 l-1 2.2 h-4Z M${w - 2} ${h} h-6 l1 2.2 h4Z" fill="#2a1006"/>
    ${plate(w / 2 - pw / 2, top + front / 2 - 8, pw, 16, count ? `詩箋　${count} ${unit}` : "詩箋", "", { s1: 8, ls1: .8 })}`;
  return svg(w, h, s);
}

// ——— 版畫冊: the portfolio, half-bound — blue cloth boards, the spine and the corners in darker leather, a gilt
// roll round the panel with a small fleuron at each corner, gilt title, wine ribbons; the boards' edges showing their
// thickness; the newest print peeping out of it, brown as an etching ———
function portfolio(w, h, img, count, unit) {
  let s = shade(0, 0, w, h, 2);
  if (count) s += `<rect x="${w * .06}" y="${-h * .1}" width="${w * .84}" height="${h * .5}" fill="#ddd0b2" stroke="rgba(120,100,70,.4)" stroke-width=".4" transform="rotate(3 ${w / 2} ${h / 2})"/>
    <g transform="rotate(-5 ${w / 2} ${h / 2})"><rect x="${w * .12}" y="${-h * .3}" width="${w * .72}" height="${h * .7}" fill="#efe5cc" stroke="rgba(120,100,70,.4)" stroke-width=".4"/><rect x="${w * .12}" y="${-h * .3}" width="${w * .72}" height="${h * .7}" fill="url(#sl-paper)" opacity=".4"/>
    <rect x="${w * .18}" y="${-h * .25}" width="${w * .6}" height="${h * .4}" fill="#cbb48a"/>
    ${img ? `<image href="${esc(img)}" x="${w * .18}" y="${-h * .25}" width="${w * .6}" height="${h * .4}" preserveAspectRatio="xMidYMid slice" opacity=".62"/>` : ""}
    <rect x="${w * .18}" y="${-h * .25}" width="${w * .6}" height="${h * .4}" fill="#7a5226" opacity=".32"/>
    <rect x="${w * .18 - 1.4}" y="${-h * .25 - 1.4}" width="${w * .6 + 2.8}" height="${h * .4 + 2.8}" fill="none" stroke="rgba(120,100,70,.35)" stroke-width=".5"/>
    <rect x="${w * .18}" y="${-h * .25}" width="${w * .6}" height="${h * .4}" fill="none" stroke="rgba(90,70,40,.5)" stroke-width=".5"/></g>`;
  const corner = (x, y, sx, sy) => `<path d="M${x} ${y} h${sx * 13} L${x} ${y + sy * 13}Z" fill="url(#sl-leather)"/><path d="M${x} ${y} h${sx * 13} L${x} ${y + sy * 13}Z" fill="#0e1626" opacity=".72"/><path d="M${x + sx * 13} ${y} L${x} ${y + sy * 13}" stroke="rgba(170,190,220,.25)" stroke-width=".6"/>`;
  s += `<rect x="1.4" y="1.6" width="${w}" height="${h}" rx="2" fill="#cdbf9e"/><rect x="1.4" y="${h - .2}" width="${w}" height="1.8" fill="rgba(0,0,0,.25)"/>
    ${leatherOf(w, h, "#1b2a44", .8).replace(/rx="3"/g, 'rx="2"')}<rect width="${w}" height="${h}" rx="2" fill="url(#sl-weave)" opacity=".5"/>
    <rect width="${w * .16}" height="${h}" fill="url(#sl-leather)"/><rect width="${w * .16}" height="${h}" fill="#0e1626" opacity=".72"/><rect x="${w * .16}" width="1" height="${h}" fill="rgba(255,255,255,.1)"/><rect x="${w * .16 + 1}" width="1" height="${h}" fill="rgba(0,0,0,.3)"/>
    ${[.2, .4, .6, .8].map((t) => `<rect x="0" y="${h * t - .8}" width="${w * .16}" height="1.6" fill="rgba(255,255,255,.06)"/><rect x="0" y="${h * t + .6}" width="${w * .16}" height=".6" fill="rgba(0,0,0,.35)"/>`).join("")}
    ${corner(w, 0, -1, 1)}${corner(w, h, -1, -1)}
    <rect x="${w * .22}" y="${h * .09}" width="${w * .66}" height="${h * .82}" fill="none" stroke="url(#sl-gold)" stroke-width=".9"/><rect x="${w * .245}" y="${h * .115}" width="${w * .61}" height="${h * .77}" fill="none" stroke="url(#sl-gold)" stroke-width=".35" stroke-dasharray=".7 .7"/>
    ${[[w * .22, h * .09], [w * .88, h * .09], [w * .22, h * .91], [w * .88, h * .91]].map(([x, y]) => `<path d="M${x} ${y - 2.2} l1.4 2.2 l-1.4 2.2 l-1.4 -2.2Z" fill="url(#sl-foil)"/>`).join("")}
    ${gilt(w * .56, h * .47, "版畫冊", { size: Math.min(12, w * .13), ls: 3 })}${gilt(w * .56, h * .47 + 10, "RADIERUNGEN", { fam: "Cormorant SC", size: 5.4, w: 600, ls: 1 })}${count ? gilt(w * .56, h * .8, `${count} ${unit}`, { size: 7.4, w: 600, ls: 1 }) : ""}
    <rect x="${w - 3}" y="${h * .46}" width="${w * .16}" height="3.4" fill="#7a1f2e" transform="rotate(8 ${w} ${h * .46})"/><rect x="${w - 3}" y="${h * .5}" width="${w * .12}" height="3" fill="#5a1424" transform="rotate(-10 ${w} ${h * .5})"/>`;
  return svg(w, h, s);
}


// ——— 收進來的: a letter rack hung on the wall by a brass ring — a mahogany back board shaped to an arch between
// two ogee shoulders, a bead run round its edge, a carved shell on the arch; a pocket of a fielded panel with a brass
// gallery along its top; the clippings starred standing in it, a wine ribbon round them, the count cut in its brass ———
function rack(w, h, count, unit) {
  const n = Math.min(count, 5), c = w / 2;
  const back = `M5 ${h - 6} V24 Q5 17 11 16 Q${c - 14} 14 ${c - 10} 8 Q${c} -1 ${c + 10} 8 Q${c + 14} 14 ${w - 11} 16 Q${w - 5} 17 ${w - 5} 24 V${h - 6}Z`;
  let s = `<path d="M${c} -6 L${c - 3} 2 M${c} -6 L${c + 3} 2" stroke="rgba(30,15,5,.18)" stroke-width=".6" transform="translate(1.5 1.5)"/>
    <circle cx="${c}" cy="-6.6" r="1.2" fill="url(#sl-rivet)"/><circle cx="${c}" cy="-2.6" r="3.4" fill="none" stroke="rgba(25,10,0,.4)" stroke-width="1.2" transform="translate(.8 1)"/><circle cx="${c}" cy="-2.6" r="3.4" fill="none" stroke="url(#sl-brass)" stroke-width="1.1"/>
    <path d="${back}" fill="rgba(30,10,4,.35)" transform="translate(2.6 3.4)"/><path d="${back}" fill="rgba(30,10,4,.2)" transform="translate(4.4 5.4)"/>
    <path d="${back}" fill="url(#sl-wdv)"/><path d="${back}" fill="rgba(20,6,0,.18)"/><path d="${back}" fill="url(#sl-relw)" opacity=".7"/>
    <path d="${back}" fill="none" stroke="rgba(10,3,0,.55)" stroke-width="1.6" transform="scale(.94) translate(${w * .032} ${h * .032})"/><path d="${back}" fill="none" stroke="rgba(255,226,190,.28)" stroke-width=".6" transform="scale(.94) translate(${w * .032 - .5} ${h * .032 - .5})"/>
    ${cartouche(c, 7, 8.6, TH.crest)}`;
  for (let i = 0; i < n; i++) { // the clippings, folded once, leaning a little this way and that
    const cx = c + (i - (n - 1) / 2) * 7, rot = (i - (n - 1) / 2) * 5, top = 20 + (i % 2) * 4;
    s += `<g transform="rotate(${rot} ${cx} ${h - 30})"><rect x="${cx - 13}" y="${top}" width="26" height="${h - 34 - top}" fill="${i % 2 ? "#efe6d0" : "#f7f0de"}" stroke="rgba(120,100,70,.4)" stroke-width=".4"/>
      <rect x="${cx - 13}" y="${top}" width="26" height="${h - 34 - top}" fill="url(#sl-paper)" opacity=".35"/><path d="M${cx - 13} ${top + 9} h26" stroke="rgba(120,100,70,.18)" stroke-width=".5"/>
      <rect x="${cx - 10}" y="${top + 4}" width="20" height="2.2" fill="rgba(40,30,20,.55)"/>${[0, 1, 2, 3].map((k) => `<rect x="${cx - 10}" y="${top + 11 + k * 3.2}" width="${k === 3 ? 12 : 20}" height=".9" fill="rgba(60,50,40,.35)"/>`).join("")}</g>`;
  }
  if (n) s += `<path d="M${c - 16} ${h - 36} Q${c} ${h - 32} ${c + 16} ${h - 36}" stroke="#7a1f2e" stroke-width="2.4" fill="none"/><path d="M${c} ${h - 34} l-4 9 M${c} ${h - 34} l4 8" stroke="#7a1f2e" stroke-width="1.8"/>`;
  // the pocket: its two sides, the fielded front, the gallery
  const py = h - 33, ph = 27;
  s += `<rect x="3" y="${py}" width="${w - 6}" height="${ph}" fill="rgba(20,6,0,.45)" transform="translate(1.6 2)"/>
    <rect x="3" y="${py}" width="${w - 6}" height="${ph}" fill="url(#sl-wdh)"/><rect x="3" y="${py}" width="${w - 6}" height="${ph}" fill="url(#sl-boardlit)"/>
    <rect x="7.5" y="${py + 4}" width="${w - 15}" height="${ph - 8}" fill="url(#sl-cherrys)"/><rect x="7.5" y="${py + 4}" width="${w - 15}" height="${ph - 8}" fill="none" stroke="rgba(10,3,0,.6)" stroke-width="1"/>
    <path d="M8.5 ${py + ph - 4.5} V${py + 5} H${w - 8.5}" fill="none" stroke="rgba(255,228,190,.3)" stroke-width="1.2"/><path d="M8.5 ${py + ph - 4.5} H${w - 8.5} V${py + 5}" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="1.2"/>
    <rect x="3" y="${py}" width="${w - 6}" height="1.2" fill="rgba(255,232,196,.4)"/><rect x="3" y="${py + ph - 1}" width="${w - 6}" height="1" fill="rgba(0,0,0,.6)"/>
    <path d="M4 ${py - 6.4} H${w - 4}" stroke="rgba(20,8,0,.5)" stroke-width="1.6" transform="translate(.6 .8)"/><path d="M4 ${py - 6.4} H${w - 4}" stroke="url(#sl-brass)" stroke-width="1.4"/>
    ${Array.from({ length: 9 }, (_, i) => { const x = 6 + i * (w - 12) / 8; return `<path d="M${x.toFixed(2)} ${py - 6} V${py}" stroke="rgba(20,8,0,.5)" stroke-width="1" transform="translate(.5 .4)"/><path d="M${x.toFixed(2)} ${py - 6} V${py}" stroke="url(#sl-brass)" stroke-width=".8"/><circle cx="${x.toFixed(2)}" cy="${py - 3}" r=".9" fill="url(#sl-rivet)"/>`; }).join("")}
    <circle cx="4" cy="${py - 6.6}" r="1.8" fill="url(#sl-rivet)"/><circle cx="${w - 4}" cy="${py - 6.6}" r="1.8" fill="url(#sl-rivet)"/>
    ${plate(c - 26, h - 30, 52, count ? 20 : 13, "收進來的", count ? `${count} ${unit}` : "", { s1: 7, s2: 6.6, ls1: .6 })}`;
  return svg(w, h, s);
}

// ——— the room itself: stucco wall with gilt panelling and a cornice, the tall window onto Viennese roofs between silk
// curtains held back by gilt cords, the parquet ———
// ——— the room: a moulded panel on the wall (its frame by TH.panel: gilt, painted with a gilt fillet, or wood) ———
function boiserie(x, y, w, h) {
  const m = TH.panel, inner = TH.wallIn ? `<rect x="${x + 9}" y="${y + 9}" width="${w - 18}" height="${h - 18}" fill="${TH.wallIn}"/>` : "";
  const prof = [[2.2, "v"], [1.6, "c"], [1.4, "b"], [1.2, "v"]];
  let s = inner + mould(x + 3, y + 3, w - 6, h - 6, prof, m.mat, { paint: m.paint, k: m.k });
  if (m.fillet) s += mould(x + 3 + 6.4, y + 3 + 6.4, w - 18.8, h - 18.8, [[.9, "v"]], "gold");
  const cs = 13;
  s += corner(x + 5, y + 5, cs, 1, 1, m.orn) + corner(x + w - 5, y + 5, cs, -1, 1, m.orn) + corner(x + w - 5, y + h - 5, cs, -1, -1, m.orn) + corner(x + 5, y + h - 5, cs, 1, -1, m.orn);
  if (h > 200) s += cartouche(x + w / 2, y + 6, 15, m.orn);
  return s;
}
// the crown moulding: a cyma lit from above, egg-and-dart, dentils, a bead, a cove into the wall
const cornice = (() => {
  const mt = TH.cornice, fill = mt === "gold" ? "url(#sl-goldd)" : mt === "wood" ? "url(#sl-wdh)" : TH.paint, band = (y, h, L) => `<rect y="${y}" width="${W}" height="${h}" fill="${fill}"/><rect y="${y}" width="${W}" height="${h}" fill="${lightOf(L)}"/>`;
  let s = `${band(0, 6, .3)}${band(6, 3, -.25)}${band(9, 2, .2)}`;
  for (let i = 0; i < 81; i++) s += `<rect x="${i * 5 + .6}" y="11" width="3.2" height="5" fill="${fill}"/><rect x="${i * 5 + .6}" y="11" width="3.2" height="5" fill="rgba(255,246,222,.18)"/><rect x="${i * 5 + 3.8}" y="11" width="1.2" height="5" fill="rgba(15,7,0,.45)"/>`;
  s += `${band(16, 2.2, -.3)}${band(18.2, 10, -.08)}`;
  const eggM = TH.cornOrn;
  for (let i = 0; i < 41; i++) { const cx = i * 10 + 5; s += carve(`M${cx - 3} 22 a3 4.2 0 1 0 6 0 a3 4.2 0 1 0 -6 0Z`, eggM, .6) + carve(ptsD(leafPts(cx + 5, 18.6, cx + 5, 27.8, 1.1, 0, 1)), eggM, .5); }
  s += `${band(28.2, 2, .35)}${band(30.2, 3.6, -.2)}`;
  s += `<path d="M0 32 H${W}" stroke="${TH.goldMid}" stroke-width="1.6" stroke-dasharray="0 2.6" stroke-linecap="round"/><path d="M0 31.6 H${W}" stroke="rgba(255,250,225,.7)" stroke-width=".6" stroke-dasharray="0 2.6" stroke-linecap="round"/>`;
  s += `${band(33.8, 4, -.35)}<rect y="37.8" width="${W}" height="6" fill="url(#sl-aoDown)"/>`;
  return s;
})();
// ——— The hour's light (the owner, 2026-11-23: 窗外和光影要隨時間有變化) ———
// The room is lit by Taichung's day as it is now (twNow): the sky and the roofs in the window, the window's light on the
// wall and the parquet, the shadows, the brightness and warmth of the whole room. lightAt is the hour's light — a pure
// function of the minute and today's sunrise and sunset (wetter.js sunTimes) — run smoothly through key frames hung on
// the sunrise, noon and the sunset. The sun climbs the day's arc to a winter noon's 45° whatever the season (an
// editorial choice: the hour only, not the season): its height sets how far from the wall the panes lie on the parquet
// and how long the shadows are; the panes slant right in the morning and less after noon, always away from the window. Before dawn
// and after dusk no sun comes in: the room has only the light drawn in it, the picture light over the newest work.
// Colour and opacity in layers, no filter and no blend mode; nothing moves and no box changes its size.
// A frame: `sky` its four stops top to bottom; `haze` over the roofs; `roofs` far, middle, near, the street, the spires;
// `mist` between them; `lit` the windows lit in the town; `halo` the window's light on the wall and its gleam on the
// parquet; `sun` the panes on the parquet; `shade` the shadows cast; `sheen` the glass; `dark` and `tint` over the whole
// room; `lamp` the picture light on. A pair is a colour and its strength. `morning` is the room as it was drawn
// (2026-11-19), at about nine. The room's dark lies over the window too, so the town after dusk is drawn brighter
// than it is seen.
const hexes = (v) => (typeof v === "string" ? [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16)) : Array.isArray(v) ? v.map(hexes)
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, hexes(x)])) : v);
const mix = (a, b, t) => (typeof a === "number" ? a + (b - a) * t : Array.isArray(a) ? a.map((x, i) => mix(x, b[i], t)) : Object.fromEntries(Object.keys(a).map((k) => [k, mix(a[k], b[k], t)])));
const rgb = (c) => `rgb(${c.map(Math.round).join(",")})`, rgba = (c, a) => `rgba(${c.map(Math.round).join(",")},${Math.max(0, a).toFixed(3)})`;
const FRAMES = hexes({
  night: { sky: ["#040a34", "#000e3e", "#0a1a48", "#323354"], haze: ["#3a3456", .3], roofs: ["#0a142f", "#050b1d", "#02050d", "#04060a", "#101735"], mist: ["#26243c", .5],
    lit: 1, halo: ["#96aadc", 0], sun: ["#ffecbe", 0], shade: 0, sheen: .45, dark: ["#2a1206", .3], tint: ["#ffaa50", .07], lamp: 1 },
  dawn: { sky: ["#3a4670", "#6a6a8e", "#b8929c", "#e4b09a"], haze: ["#e6beb4", .35], roofs: ["#867c8c", "#685e6c", "#4c444c", "#3e383e", "#9a90a0"], mist: ["#c8b4be", .9],
    lit: .55, halo: ["#c8bedc", .15], sun: ["#ffc48c", 0], shade: 0, sheen: .5, dark: ["#0e0e1e", .4], tint: ["#ffaa78", 0], lamp: .4 },
  sunrise: { sky: ["#94a6c6", "#d8c2c8", "#f8c8aa", "#ffbe94"], haze: ["#ffd2be", .6], roofs: ["#c8aeaa", "#a88c88", "#806864", "#705c58", "#d8beba"], mist: ["#ffded6", 1.15],
    lit: .12, halo: ["#ffd2b4", .5], sun: ["#ffc08c", .35], shade: .35, sheen: .8, dark: ["#1a1e30", .27], tint: ["#ffaa78", .03], lamp: 0 },
  morning: { sky: ["#c4d0d8", "#e6e2d6", "#f8ead0", "#f3e0c0"], haze: ["#fff7e4", .55], roofs: ["#d8cfc0", "#c0ae96", "#9c8670", "#8a7660", "#d9d2c6"], mist: ["#faf0de", 1],
    lit: 0, halo: ["#fff8e4", 1], sun: ["#ffecbe", 1], shade: 1, sheen: 1, dark: ["#140c08", 0], tint: ["#ffc878", 0], lamp: 0 },
  noon: { sky: ["#9cbcd8", "#d2e0e6", "#eceee6", "#f0ece0"], haze: ["#fafaf6", .5], roofs: ["#d8d4cc", "#beb4a4", "#988a78", "#887a68", "#e0dcd4"], mist: ["#f6f6f0", .9],
    lit: 0, halo: ["#fffcf2", 1], sun: ["#fffaea", 1], shade: .9, sheen: 1, dark: ["#140c08", 0], tint: ["#fffcf4", .035], lamp: 0 },
  afternoon: { sky: ["#b0bccc", "#e4d8c0", "#f8dcae", "#f6cc92"], haze: ["#ffe6b8", .62], roofs: ["#dcc6a8", "#c6a882", "#9e7e5a", "#8c6e50", "#e4ccac"], mist: ["#fde6c4", 1],
    lit: 0, halo: ["#ffe2b0", 1.05], sun: ["#ffd890", 1.2], shade: 1, sheen: 1, dark: ["#140c08", 0], tint: ["#ffb860", .07], lamp: 0 },
  golden: { sky: ["#a0a0b0", "#e8bea0", "#fcba78", "#faa864"], haze: ["#ffc896", .65], roofs: ["#d6aa8c", "#b48668", "#825e48", "#705240", "#e6b492"], mist: ["#ffd6b0", 1],
    lit: .05, halo: ["#ffc88c", .9], sun: ["#ffb46e", .8], shade: .85, sheen: .9, dark: ["#281414", .08], tint: ["#ffa050", .1], lamp: .1 },
  sunset: { sky: ["#60688c", "#be8c8c", "#f4a06e", "#f08c5a"], haze: ["#faaa82", .55], roofs: ["#966e6e", "#745454", "#523a3a", "#443030", "#aa7874"], mist: ["#f0aa96", .9],
    lit: .35, halo: ["#faaa8c", .45], sun: ["#ff9a64", 0], shade: .15, sheen: .7, dark: ["#1e101a", .25], tint: ["#ff9664", .05], lamp: .6 },
  dusk: { sky: ["#2e3c64", "#545a80", "#9e7684", "#c8826c"], haze: ["#b47878", .4], roofs: ["#5a5060", "#423a48", "#2e2830", "#262028", "#685e6e"], mist: ["#96788c", .7],
    lit: .8, halo: ["#b496be", .15], sun: ["#ff9a64", 0], shade: 0, sheen: .5, dark: ["#0e0a16", .42], tint: ["#ff9664", 0], lamp: 1 },
});
// the frames hung on the day: [R sunrise, N noon, S sunset, minutes from it, the frame]; before the first and after the last, night
const DAY = [["R", -80, "night"], ["R", -25, "dawn"], ["R", 15, "sunrise"], ["R", 160, "morning"], ["N", 0, "noon"], ["S", -95, "afternoon"], ["S", -30, "golden"],
  ["S", 8, "sunset"], ["S", 30, "dusk"], ["S", 75, "night"]];
const minutesOf = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
// The light at minute `m` of a day whose sun rises at `rise` and sets at `set` ("HH:MM"): the frame, and drawn from the
// sun's height, `patch` (the corners of the window's light on the parquet, as quad takes them; at about nine the
// patch as it was drawn, 37 and 215 below the foot of the wall) and `reach` (the shadows' length, 1 at about nine).
// The panes (`sun`) and the shadows cast (`shade`) go with the sun over the horizon, fading in its first 3°: below it
// neither, only the contact shadows under the feet.
function lightAt(m, rise, set) {
  let [R, S] = [minutesOf(rise), minutesOf(set)];
  if (!(R + 240 < S)) { const f = sunTimes(null); [R, S] = [minutesOf(f.rise), minutesOf(f.set)]; } // a day that cannot be: the times sunTimes falls back on
  const noon = (R + S) / 2, at = { R, N: noon, S }, K = DAY.map(([a, dt, k]) => [at[a] + dt, FRAMES[k]]), j = K.findIndex(([t]) => t > m);
  const f = j < 1 ? FRAMES.night : mix(K[j - 1][1], K[j][1], smooth((m - K[j - 1][0]) / (K[j][0] - K[j - 1][0])));
  const u = (m - R) / (S - R), e = u > 0 && u < 1 ? 45 * Math.sin(Math.PI * u) : 0; // the sun's height in degrees
  const cot = (deg) => 1 / Math.tan((deg * Math.PI) / 180), r = cot(Math.max(6, e)) / cot(32), off = Math.min(2.6, r ** .8);
  const slant = .48 - (.35 * (m - noon)) / ((S - R) / 2), edge = (y) => { const c = 84 + slant * (y - 615), w = 32.6 + .2528 * (y - 615); return [[c - w, y], [c + w, y]]; };
  const up = smooth(Math.min(1, e / 3)); // the sun over the horizon
  return { ...f, sun: [f.sun[0], f.sun[1] * up], shade: f.shade * up, patch: [...edge(615 + 37 * off), ...edge(615 + 215 * off)], reach: Math.min(2.2, Math.max(.55, r ** .6)) };
}
const hourLight = () => { const { rise, set } = sunTimes(); return lightAt(twNow().minutes, rise, set); };
// Three layers of roofs in the haze, paler the farther off; by day brighter than the room, at night dark, a few windows lit.
function cityReal(gx, gy, gw, gh, L) {
  let seed = 7, seed2 = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647), rnd2 = () => ((seed2 = (seed2 * 16807) % 2147483647) / 2147483647);
  const [far, mid, near, street, spireC] = L.roofs.map(rgb), [mc, ma] = L.mist, [hc, ha] = L.haze;
  const hz = gy + gh * .66, layer = (base, hmin, hmax, wmin, wmax, fill, n) => {
    let x = gx - 4, d = `M${gx - 4} ${gy + gh} V${base}`, lit = "";
    while (x < gx + gw + 4) { const ww = wmin + rnd() * (wmax - wmin), hh = hmin + rnd() * (hmax - hmin), kind = rnd();
      if (kind < .4) d += ` L${x} ${base - hh} L${x + ww / 2} ${base - hh - ww * .35} L${x + ww} ${base - hh}`; // a gable
      else if (kind < .7) d += ` L${x} ${base - hh} L${x + ww * .15} ${base - hh - 3} H${x + ww * .85} L${x + ww} ${base - hh}`; // a mansard
      else d += ` L${x} ${base - hh} H${x + ww * .3} V${base - hh - 4} H${x + ww * .38} V${base - hh} H${x + ww}`; // a chimney
      const on = rnd2() < .34, lx = x + ww * (.2 + .6 * rnd2()), ly = base - hh + 2 + rnd2() * (hh + 6), s = [1.2, 1.6, 2][n]; // a window lit in the house, or none
      if (on && L.lit > .01) lit += `<rect x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" width="${s}" height="${(s * 1.4).toFixed(1)}" fill="${rgba([255, 212, 140], L.lit * [.7, .85, 1][n])}"/>`;
      x += ww; }
    return `<path d="${d} L${gx + gw + 4} ${base} V${gy + gh}Z" fill="${fill}"/>${lit}`; };
  const fog = (y0, y1, a) => `<rect x="${gx}" y="${y0}" width="${gw}" height="${y1 - y0}" fill="${rgba(mc, a * ma)}"/>`;
  const spire = `<path d="M${gx + gw * .3} ${hz - 2} L${gx + gw * .3 + 2.2} ${hz - 46} L${gx + gw * .3 + 4.4} ${hz - 2}Z" fill="${spireC}"/><path d="M${gx + gw * .66} ${hz - 4} q8 -15 16 0Z" fill="${spireC}"/><rect x="${gx + gw * .66 + 7.4}" y="${hz - 25}" width="1.2" height="8" fill="${spireC}"/>`;
  return `${lin("sl-skyr", L.sky.map((c, i) => [["0", ".45", ".72", "1"][i], rgb(c)]))}${lin("sl-haze", [["0", rgba(hc, 0)], [".6", rgba(hc, ha)], ["1", rgba(hc, ha * .364)]])}
    <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="url(#sl-skyr)"/><rect x="${gx}" y="${hz - 50}" width="${gw}" height="60" fill="url(#sl-haze)"/>
    ${spire}${layer(hz + 2, 2, 9, 8, 15, far, 0)}${fog(hz - 6, hz + 14, .45)}${layer(hz + 22, 4, 12, 10, 18, mid, 1)}${fog(hz + 12, hz + 32, .34)}
    ${layer(hz + 46, 6, 16, 12, 22, near, 2)}${fog(hz + 38, hz + 58, .2)}<rect x="${gx}" y="${hz + 56}" width="${gw}" height="${gy + gh - hz - 56}" fill="${street}"/>
    ${Array.from({ length: 4 }, (_, i) => `<rect x="${gx}" y="${hz + 60 + i * 8}" width="${gw}" height=".8" fill="${rgba(mc, .35 * Math.min(1, ma))}"/>`).join("")}`;
}
const WIN = [24, 58, 98, 238], GLASS = [WIN[0] + 8, WIN[1] + 8, WIN[2] - 16, WIN[3] - 16]; // the window, and its glass: x, y, w, h
// what is seen through the glass and the glass's sheen, the hour's (paintLight draws it again)
function view(L) {
  const [gx, gy, gw, gh] = GLASS, a = L.sheen;
  return `${cityReal(gx, gy, gw, gh, L)}<path d="M${gx} ${gy + gh * .55} L${gx + gw * .7} ${gy} H${gx + gw * .86} L${gx} ${gy + gh * .72}Z" fill="rgba(255,255,255,${(.12 * a).toFixed(3)})"/><path d="M${gx + gw * .2} ${gy + gh} L${gx + gw} ${gy + gh * .3} V${gy + gh * .38} L${gx + gw * .3} ${gy + gh}Z" fill="rgba(255,255,255,${(.06 * a).toFixed(3)})"/>`;
}
function windowSvg(v) {
  const [x, y, w, h] = WIN, [gx, gy, gw, gh] = GLASS, mid = gx + gw / 2;
  const bar = (bx, by, bw, bh) => `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#f2ece0"/><rect x="${bx}" y="${by + bh - .8}" width="${bw}" height=".8" fill="rgba(80,60,30,.25)"/><rect x="${bx}" y="${by}" width="${bw}" height=".6" fill="rgba(255,255,255,.8)"/>`;
  return `<rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" fill="url(#sl-halo)"/><rect x="${x - 4}" y="${y - 4}" width="${w + 8}" height="${h + 8}" fill="#d9cdb8"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f4eee2"/>
    <rect x="${x + w - 3}" y="${y}" width="3" height="${h}" fill="rgba(90,70,40,.18)"/>
    <g class="sl-view">${v}</g>
    ${bar(mid - 2, gy, 4, gh)}${[.24, .46, .69].map((k) => bar(gx, gy + gh * k - 1.5, gw, 3)).join("")}
    <rect x="${gx}" y="${gy}" width="${gw}" height="4" fill="rgba(60,40,20,.16)"/><rect x="${gx}" y="${gy}" width="3" height="${gh}" fill="rgba(60,40,20,.1)"/>
    <rect x="${x - 7}" y="${y + h}" width="${w + 14}" height="9" fill="url(#sl-plaster)"/><rect x="${x - 7}" y="${y + h}" width="${w + 14}" height="1" fill="rgba(255,255,255,.9)"/><rect x="${x - 7}" y="${y + h + 9}" width="${w + 14}" height="4" fill="url(#sl-aoDown)"/>`;
}
// A curtain of heavy silk gathered at its waist: the folds are strips that leave the rod evenly, crowd together at the
// cord and spread again to the floor; each strip lit in its middle and dark in its valleys, the silk's own weave over it.
function drape(x, y, w, h, flip) {
  const tie = y + h * .58, waist = flip ? x + w * .62 : x + w * .38, out = flip ? x + w : x, f = flip ? -1 : 1, N = 7;
  const d = flip ? `M${x} ${y} H${x + w} V${y + h} H${x + 4} Q${x + w * .55} ${tie + 40} ${waist} ${tie} Q${x + w * .2} ${tie - 70} ${x} ${y + 40}Z`
    : `M${x} ${y} H${x + w} V${y + h} H${x}Z`;
  const id = uid("dr"), band = `M${out - f * 1} ${tie - 3} Q${(out + waist) / 2} ${tie + 5.5} ${waist + f * 1.5} ${tie - 1.5}`;
  const xs = (i, yy) => { // fold line i at height yy
    const t = i / N, top = x + w * t, mid = waist - f * w * .14 + f * w * .28 * t, bot = x + w * (.08 + t * .92) + (flip ? -w * .04 : w * .04);
    if (yy <= tie) { const k = (yy - y) / (tie - y), e = k * k; return top + (mid - top) * e; }
    const k = (yy - tie) / (y + h - tie), e = Math.sqrt(k); return mid + (bot - mid) * e;
  };
  let strips = "";
  const ys = Array.from({ length: 25 }, (_, j) => y + (h * j) / 24);
  for (let i = 0; i < N; i++) { const L = ys.map((yy) => [xs(i, yy), yy]), R = ys.map((yy) => [xs(i + 1, yy), yy]).reverse(); strips += `<path d="M${P2([...L, ...R])}Z" fill="url(#sl-foldg)"/>`; }
  const ros = out - f * 2, tx = (out + waist) / 2 - f * 3;
  const shape = flip ? d : `M${x} ${y} H${x + w} V${y + 40} Q${x + w * .8} ${tie - 70} ${waist} ${tie} Q${x + w * .45} ${tie + 40} ${x + w - 4} ${y + h} H${x}Z`;
  return `<clipPath id="${id}"><path d="${shape}"/></clipPath><g clip-path="url(#${id})"><rect x="${x - 2}" y="${y}" width="${w + 4}" height="${h}" fill="url(#sl-silkx)"/>${strips}
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sl-side)" opacity=".22"/><path d="M${x} ${tie - 7} H${x + w}" stroke="rgba(40,20,5,.22)" stroke-width="8"/>
      <rect x="${x}" y="${y + h - 10}" width="${w}" height="10" fill="rgba(20,10,0,.25)"/></g>
    <path d="${band}" stroke="rgba(40,25,5,.6)" stroke-width="4.6" fill="none" stroke-linecap="round" transform="translate(.6 .8)"/><path d="${band}" stroke="${TH.goldMid}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="${band}" stroke="rgba(60,35,5,.7)" stroke-width="3.4" fill="none" stroke-dasharray=".7 1.3"/><path d="${band}" stroke="rgba(255,240,190,.6)" stroke-width=".8" fill="none" stroke-dasharray="1.2 1.4" transform="translate(-.3 -.9)"/>
    ${rosette(ros, tie - 3, 4.4)}
    <path d="M${tx} ${tie + 3} q${f * .6} 6 0 11" stroke="${TH.goldMid}" stroke-width="1.2" fill="none"/>
    ${carve(`M${tx - 2.6} ${tie + 14} q2.6 -4 5.2 0 q1.4 1.6 0 3 h-5.2 q-1.4 -1.4 0 -3Z`, "gold", .5)}
    <g>${Array.from({ length: 9 }, (_, i) => `<path d="M${tx - 3.4 + i * .85} ${tie + 17} l${(i - 4) * .25} 12" stroke="${i % 2 ? TH.goldMid : "rgba(110,75,20,.9)"}" stroke-width=".8"/>`).join("")}</g>
    <path d="M${tx - 3.8} ${tie + 18.5} h7.6" stroke="rgba(60,35,5,.6)" stroke-width="1.2"/>`;
}
// the pelmet: a carved gilt board, its crest in the middle; under it a swag of the same silk, folded
function pelmet() {
  let s = `<path d="M4 60 Q74 92 144 60 V58 H4Z" fill="url(#sl-silkx)"/>`;
  for (let i = 0; i < 5; i++) s += `<path d="M${4 + i * 3} ${60 + i * 2.6} Q74 ${70 + i * 5.4} ${144 - i * 3} ${60 + i * 2.6}" fill="none" stroke="rgba(30,15,0,${.18 + i * .03})" stroke-width="2.2"/><path d="M${4 + i * 3} ${61.6 + i * 2.6} Q74 ${71.6 + i * 5.4} ${144 - i * 3} ${61.6 + i * 2.6}" fill="none" stroke="rgba(255,245,220,.22)" stroke-width="1.4"/>`;
  s += mould(2, 42, 144, 18, [[2, "v"], [1.6, "b"], [2.2, "c"], [3, "v"]], "gold");
  s += `<rect x="10.8" y="50.8" width="126.4" height=".4" fill="rgba(0,0,0,.2)"/>${cartouche(74, 43, 13)}`;
  return s;
}
const WALL = (v) => svg(W, H, `${TH.wallFill ? `<rect width="${W}" height="615" fill="${TH.wallFill}"/>` : ""}${cornice}${boiserie(150, 48, 244, 262)}${boiserie(150, 322, 244, 120)}
  ${mould(0, 594, W, 22, [[2, "v"], [1.4, "b"], [2, "c"], [16.6, "f"]], TH.dado, { paint: TH.paint })}<rect y="612" width="${W}" height="3" fill="rgba(30,15,5,.35)"/>
  ${windowSvg(v)}
  ${drape(4, 60, 30, 548, false)}${drape(114, 60, 30, 548, true)}${pelmet()}`);
// The window's light: a pale band across the wall and a patch on the parquet (no blend modes), the hour's (lightAt).
// The realistic pass: one light, the window at the upper left. The wall is brightest by it and falls off to the right;
// the window lays its panes on the parquet and a streak of reflection; every piece casts its shadow right and down,
// and stands on a dark contact shadow; the corners, the cornice and the foot of the wall are a little darker.
function quad(P, u0, u1, v0, v1) { const at = (u, v) => [P[0][0] + (P[1][0] - P[0][0]) * u + (P[2][0] + (P[3][0] - P[2][0]) * u - P[0][0] - (P[1][0] - P[0][0]) * u) * v, P[0][1] + (P[2][1] - P[0][1]) * v];
  return [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)].map((p) => p.map((n) => n.toFixed(1)).join(" ")).join(" L"); }
const contact = (x, y, rx, ry = 2.6) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#sl-contact)"/>`;
// a shadow cast: its foot [b0, b1] where the piece stands, its far edge [f1, f0] drawn at about nine, laid `reach` as far
const cast = (L, [b0, b1, f1, f0], a = 1) => { const o = a * 1.25 * L.shade, to = (b, f) => [b[0] + (f[0] - b[0]) * L.reach, b[1] + (f[1] - b[1]) * L.reach];
  return o > .004 ? `<path d="M${P2([b0, b1, to(b1, f1), to(b0, f0)])}Z" fill="url(#sl-cast)" opacity="${Math.min(1, o).toFixed(3)}"/>` : ""; };
const LIGHT = (L) => {
  const [sc, sa] = L.sun, [hc, ha] = L.halo, P = L.patch, sh = (a) => (a * L.shade).toFixed(3);
  const panes = sa > .004 ? `${lin("sl-patch", [["0", rgba(sc, .2 * sa)], ["1", rgba(sc, .07 * sa)]], .3, 1)}${lin("sl-bloom", [["0", rgba(sc, .12 * sa)], ["1", rgba(sc, 0)]], .3, 1)}<path d="M${quad(P, -.06, 1.06, -.04, 1)}Z" fill="url(#sl-bloom)"/>`
    + [[0, .47], [.53, 1]].flatMap(([u0, u1]) => [[0, .22], [.27, .45], [.5, .67], [.72, 1]].map(([v0, v1]) => `<path d="M${quad(P, u0, u1, v0, v1)}Z" fill="url(#sl-patch)"/>`)).join("") : "";
  // the window's light on the wall, the hour's: round the window frame (windowSvg) and spread over the wall here
  const halo = `${rad("sl-halo", [["0", rgba(hc, .7 * ha)], [".6", rgba(hc, .25 * ha)], ["1", rgba(hc, 0)]])}${ha > .004 ? '<ellipse cx="76" cy="190" rx="170" ry="270" fill="url(#sl-halo)" opacity=".55"/>' : ""}`;
  const streak = ha > .004 ? `${lin("sl-streak", [["0", rgba(hc, .26 * ha)], ["1", rgba(hc, 0)]])}<path d="M44 645 H118 L150 830 H40Z" fill="url(#sl-streak)"/>` : "";
  return svg(W, H, `<rect width="${W}" height="615" fill="url(#sl-aoR)" opacity=".55"/>${halo}
    <rect y="42" width="${W}" height="22" fill="url(#sl-aoDown)"/><rect width="16" height="615" fill="url(#sl-aoL)"/><rect x="380" width="22" height="830" fill="url(#sl-aoR)"/>
    <rect y="584" width="${W}" height="14" fill="url(#sl-aoUp)" opacity=".6"/>
    <path d="M193 330 L214 352 V614 H193Z" fill="url(#sl-aoL)" opacity=".9"/><path d="M144 80 L160 96 V606 H144Z" fill="url(#sl-aoL)" opacity=".7"/><path d="M394 312 L402 320 V620 H394Z" fill="url(#sl-aoL)" opacity=".8"/><rect y="615" width="${W}" height="34" fill="url(#sl-aoDown)"/><rect y="615" width="${W}" height="2" fill="rgba(20,10,2,.45)"/>
    ${panes}${streak}
    ${cast(L, [[197, 618], [197, 640], [240, 662], [232, 636]], .9)}${cast(L, [[12, 640], [197, 640], [232, 660], [46, 660]], .8)}${contact(23.5, 640.4, 5, 1.8)}${contact(30, 639.6, 4, 1.5)}${contact(185.4, 640.4, 5, 1.8)}${contact(178.8, 639.6, 4, 1.5)}
    ${cast(L, [[396, 620], [402, 620], [402, 652], [410, 652]], 1)}${cast(L, [[270, 620], [394, 620], [420, 640], [300, 640]], .8)}${contact(332, 621, 64, 3)}
    ${cast(L, [[200, 648], [262, 648], [318, 690], [236, 690]], .55)}${contact(200, 648, 6, 3)}${contact(262, 648, 6, 3)}${contact(231, 646, 5, 2.6)}<ellipse cx="300" cy="704" rx="22" ry="5" fill="rgba(30,14,4,${sh(.16)})"/>
    ${cast(L, [[16, 788], [100, 788], [190, 816], [76, 822]], .7)}${contact(16, 788, 7, 3)}${contact(100, 788, 7, 3)}${contact(62, 782, 5, 2.6)}<path d="M18 730 L100 726 L176 790 L80 800Z" fill="rgba(30,14,4,${sh(.12)})"/>
    ${cast(L, [[290, 784], [402, 784], [402, 822], [330, 822]], .7)}${contact(291, 786, 7, 3)}${contact(389, 786, 7, 3)}${contact(310, 776, 5)}${contact(370, 776, 5)}`);
};
// Over the whole room, and the wall and the floor round it on a wider screen: its darkness and its warmth; with the
// picture light on, the dark keeps off its pool on the newest work, and the pool is warm. The lamp shines down: the
// pool opens from its bar (the focus just under it, the top edge just over it) over the work and below, and the wall
// above the lamp, up to the rail and the cornice, stays in the dark.
function TONE(L, lamp) {
  const [dc, da] = L.dark, [tc, ta] = L.tint, on = lamp ? L.lamp : 0, bar = HANG_AT[1] + LAMP[1];
  const box = (fill) => `<rect x="-220" y="-20" width="${W + 440}" height="${H + 440}" fill="${fill}"/>`;
  const pool = (id, a) => `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" fx="0" fy="-.9" gradientTransform="translate(${HANG_AT[0] + LAMP[0]} ${bar + 104}) scale(112 108)">${stops(a)}</radialGradient>${box(`url(#${id})`)}`;
  let s = da * (1 - on) > .004 ? box(rgba(dc, da * (1 - on))) : "";
  if (da * on > .004) s += pool("sl-pool", [["0", rgba(dc, 0)], [".5", rgba(dc, da * on * .28)], ["1", rgba(dc, da * on)]]);
  if (ta > .004) s += box(rgba(tc, ta));
  if (on > .01) s += pool("sl-poolw", [["0", rgba([255, 214, 150], .16 * on)], [".5", rgba([255, 214, 150], .06 * on)], ["1", rgba([255, 214, 150], 0)]]);
  return svg(W, H, s);
}
// the hour's light as drawn in its three places in the room (.sl-view, .sl-light, .sl-tone); salonRoom keeps the set it
// drew for the room wireSalon is given next
const lightParts = (L, lamp) => ({ view: view(L), light: LIGHT(L), tone: TONE(L, lamp) });
let drawnLight = null;
// the hour's light again on the room that is open (wireSalon): only the places whose drawing is not what is shown
function paintLight(room, was, now) {
  for (const k in now) if (now[k] !== was?.[k]) { const el = room.querySelector(`.sl-${k}`); if (el) el.innerHTML = now[k]; }
}
// the record cabinet stands on its own four legs now (records.js, cabinet.js): here only its shadow on the parquet
const FEET = () => svg(180, 12, `<ellipse cx="92" cy="1.4" rx="84" ry="3.2" fill="url(#sl-drop)" opacity=".8"/>`);

// ——— the record cabinet: #/records's own with the gramophone on it (records.js phonoCabinetHtml), its links made plain,
// scaled down onto the floor; the camera's move in dissolves it into the page's crate. In the room the brass reads 唱片櫃
// and the count in large letters; as the camera arrives they give way to the page's own Latin. ———
function crateCopy(list, count, unit) {
  const zh = `<span class="sl-zh"><span class="sc-cut">唱片櫃</span>${count ? `<span class="sc-cut n">${count} ${unit}</span>` : ""}</span>`;
  // its SVG ids made its own (and what points at them: url(#…), a <use>'s href): the page's cabinet (#/records) is in the
  // document with it while the camera moves in or out
  const html = phonoCabinetHtml(list).replace(/(id="|url\(#|href="#)cb-/g, "$1cbr-").replace(/<(\/?)(?:a|button)\b/g, "<$1span")
    .replace(/(<span class="sc-brass cr-plate">)(<span class="sc-cut">[^<]*<\/span><span class="sc-cut n">[^<]*<\/span>)(<\/span>)/, `$1${zh}<span class="sl-de">$2</span>$3`);
  return `<span class="sl-rp" aria-hidden="true" inert><span class="sc-scene crate-scene">${html}</span></span>`;
}

// ——— the furniture the four on the floor and in the case stand on: the easel, the bergère, the glazed lower part of
// the bookcase, the little stand on the sill ———
const wood = (d, wdt, dark = "#2a1608") => `<path d="${d}" fill="none" stroke="${dark}" stroke-width="${wdt + .8}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#sl-wdv)" stroke-width="${wdt}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="rgba(255,235,200,.18)" stroke-width="${wdt * .3}" stroke-linecap="round" transform="translate(-${wdt * .2} 0)"/>`;
// the easel: two front legs and a back leg, each a square stick with its arrises chamfered and the grain along it;
// a shaped head block pegged through the legs, a carved finial on it, the back leg hung from it on a brass hinge; a row
// of holes up the front legs for the pegs the ledge rests on; a stretcher tenoned through the legs and pegged
function EASEL() {
  const at = (x0, y0, x1, y1, t) => [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
  const L = [52, 64, 12, 216], R = [56, 64, 96, 216];
  const edge = ([x0, y0, x1, y1], w0, w1, sx) => { const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    return `M${(x0 + sx * nx * (w0 / 2 - .7)).toFixed(2)} ${(y0 + sx * ny * (w0 / 2 - .7) + 6).toFixed(2)} L${(x1 + sx * nx * (w1 / 2 - .7)).toFixed(2)} ${(y1 + sx * ny * (w1 / 2 - .7)).toFixed(2)}`; };
  let s = `<ellipse cx="54" cy="215" rx="54" ry="5" fill="url(#sl-drop)"/>
    ${leg(54, 74, 60, 210, 4.4, 3.6)}<path d="M51.8 74 L56.2 74 L61.8 210 L58.2 210Z" fill="rgba(8,3,0,.45)"/>`;
  for (const [g, sx] of [[L, 1], [R, -1]]) { s += leg(g[0], g[1], g[2], g[3], 6.4, 4.8);
    s += `<path d="${edge(g, 6.4, 4.8, sx)}" stroke="rgba(255,230,190,.4)" stroke-width=".55"/><path d="${edge(g, 6.4, 4.8, -sx)}" stroke="rgba(10,4,0,.6)" stroke-width=".7"/>`;
    for (const t of [.38, .46, .54, .7, .78]) { const [hx, hy] = at(...g, t); s += `<ellipse cx="${hx.toFixed(2)}" cy="${hy.toFixed(2)}" rx="1.1" ry="1.3" fill="#140803"/><path d="M${(hx - 1).toFixed(2)} ${(hy + .7).toFixed(2)} q1 .9 2 0" fill="none" stroke="rgba(255,225,185,.35)" stroke-width=".35"/>`; }
    const [jx, jy] = at(...g, (186 - g[1]) / (g[3] - g[1])); // the stretcher's tenon through the leg: end grain and a peg
    s += `<rect x="${(jx - 2).toFixed(2)}" y="${(jy - 1.8).toFixed(2)}" width="4" height="3.6" fill="#3a1608"/><path d="M${(jx - 1.4).toFixed(2)} ${(jy - 1).toFixed(2)} q1.4 1 2.8 0 M${(jx - 1.4).toFixed(2)} ${(jy + .4).toFixed(2)} q1.4 1 2.8 0" fill="none" stroke="rgba(10,3,0,.6)" stroke-width=".3"/><circle cx="${jx.toFixed(2)}" cy="${(jy - 4.4).toFixed(2)}" r=".9" fill="#2a1006"/><circle cx="${(jx - .2).toFixed(2)}" cy="${(jy - 4.6).toFixed(2)}" r=".4" fill="rgba(255,225,185,.4)"/>`; }
  s += leg(22, 186, 86, 186, 3.2, 3.2);
  // the ledge: a moulded tray with a raised lip, on two brass pegs, its ends showing end grain
  const [lx] = at(...L, .58), [rx] = at(...R, .58);
  s += `${carve(`M${lx - 1.6} 157 h3.2 v3 h-3.2Z`, "gold", .4)}${carve(`M${rx - 1.6} 157 h3.2 v3 h-3.2Z`, "gold", .4)}
    ${mould(3, 148, 102, 9, [[1.4, "v"], [1.2, "c"], [6.4, "f"]], "wood")}<rect x="4" y="157" width="100" height="3" fill="rgba(0,0,0,.4)"/>
    <rect x="3" y="145.4" width="102" height="3" fill="url(#sl-wdh)"/><rect x="3" y="145.4" width="102" height="1" fill="rgba(255,232,196,.4)"/><rect x="3" y="147.8" width="102" height=".6" fill="rgba(10,3,0,.5)"/>
    <rect x="2" y="145.4" width="2.4" height="11.6" fill="#3a1608"/><rect x="103.6" y="145.4" width="2.4" height="11.6" fill="#2a1006"/>`;
  // the head: a shaped block over the joint, pegged through, a brass hinge for the back leg, a carved finial
  s += `${wd2(`M45 60 h18 l-1.4 14 h-15.2Z`)}<path d="M45 60 h18" stroke="rgba(255,232,196,.4)" stroke-width=".6"/>
    <circle cx="49.6" cy="68" r="1.1" fill="#2a1006"/><circle cx="49.4" cy="67.8" r=".45" fill="rgba(255,225,185,.4)"/><circle cx="58.4" cy="68" r="1.1" fill="#2a1006"/><circle cx="58.2" cy="67.8" r=".45" fill="rgba(255,225,185,.4)"/>
    ${carve(`M51 72.4 h6 v3.4 h-6Z`, "gold", .4)}<path d="M54 72.4 V75.8" stroke="rgba(40,20,0,.6)" stroke-width=".35"/>
    ${carve(`M47.6 60 h12.8 l-2 -2.4 h-8.8Z`, TH.easelOrn, .5)}${leaf(54, 59.4, 48.4, 57, 1.8, -.3, 2, TH.easelOrn, .4)}${leaf(54, 59.4, 59.6, 57, 1.8, .3, 2, TH.easelOrn, .4)}`;
  return svg(108, 219, s);
}
const wd2 = (d) => `<path d="${d}" fill="rgba(15,6,0,.5)" transform="translate(.9 .9)"/><path d="${d}" fill="url(#sl-wdh)"/><path d="${d}" fill="url(#sl-relw)"/>`;
function ARMCHAIR() { // box 278..402 × 626..791 — a Louis-Seize bergère: carved gilt medallion back with a ribbon bow, buttoned velvet, fluted legs
  const vel = TH.velvet, tuft = [];
  const cx = 62, cy = 45, rx = 34.5, ry = 33;
  for (let r = -3; r <= 3; r++) for (let c = -3; c <= 3; c++) { const x = cx + c * 10 + (r % 2 ? 5 : 0), y = cy + r * 9.4; tuft.push([x, y]); }
  const cl = uid("ab");
  let s = `<ellipse cx="62" cy="160" rx="64" ry="6" fill="url(#sl-drop)"/>
    <clipPath id="${cl}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath>
    <g clip-path="url(#${cl})"><rect x="20" y="8" width="84" height="76" fill="url(#sl-velvet)"/><rect x="20" y="8" width="84" height="76" fill="${vel}" opacity=".62"/>
      ${tuft.map(([x, y]) => `<path d="M${x} ${y - 9.4} L${x + 5} ${y} L${x} ${y + 9.4} L${x - 5} ${y}Z" fill="url(#sl-tuft)"/>`).join("")}
      ${tuft.map(([x, y]) => `<path d="M${x} ${y} L${x + 5} ${y + 9.4} M${x} ${y} L${x - 5} ${y + 9.4}" stroke="rgba(15,0,4,.45)" stroke-width=".9"/><path d="M${x - .3} ${y - .4} L${x + 4.7} ${y + 9}" stroke="rgba(255,190,200,.16)" stroke-width=".5"/>`).join("")}
      ${tuft.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.25" fill="#1e0308"/><circle cx="${x - .35}" cy="${y - .4}" r=".5" fill="rgba(255,200,210,.5)"/>`).join("")}
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#sl-vel)"/><ellipse cx="${cx}" cy="${cy + 6}" rx="${rx}" ry="${ry}" fill="none" stroke="rgba(10,0,3,.5)" stroke-width="8"/></g>`;
  // the carved oval frame: a torus, beads, a cove, a ribbon twisted round the outer edge
  s += `<ellipse cx="${cx + .8}" cy="${cy + 1.2}" rx="${rx + 4}" ry="${ry + 4}" fill="none" stroke="rgba(15,6,0,.55)" stroke-width="6"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx + 4}" ry="${ry + 4}" fill="none" stroke="url(#sl-goldd)" stroke-width="6.4"/><ellipse cx="${cx}" cy="${cy}" rx="${rx + 4}" ry="${ry + 4}" fill="none" stroke="url(#sl-giltx)" stroke-width="6.4"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx + .6}" ry="${ry + .6}" fill="none" stroke="${TH.goldMid}" stroke-width="1.6" stroke-dasharray="0 2.4" stroke-linecap="round"/>
    <ellipse cx="${cx - .3}" cy="${cy - .3}" rx="${rx + .6}" ry="${ry + .6}" fill="none" stroke="rgba(255,248,220,.8)" stroke-width=".6" stroke-dasharray="0 2.4" stroke-linecap="round"/>
    ${Array.from({ length: 34 }, (_, i) => { const a = (i / 34) * 2 * Math.PI, a2 = a + .16, p = [cx + (rx + 4) * Math.cos(a), cy + (ry + 4) * Math.sin(a)], q = [cx + (rx + 4) * Math.cos(a2), cy + (ry + 4) * Math.sin(a2)];
      return carve(ptsD(leafPts(p[0], p[1], q[0], q[1], 1.7, .12, 1)), "gold", .5); }).join("")}
    <path d="M${cx - rx - 6} ${cy} A${rx + 6} ${ry + 6} 0 0 1 ${cx + 10} ${cy - ry - 6}" fill="none" stroke="rgba(255,248,215,.7)" stroke-width="1.1"/><path d="M${cx + rx + 6} ${cy + 4} A${rx + 6} ${ry + 6} 0 0 1 ${cx - 10} ${cy + ry + 6}" fill="none" stroke="rgba(15,6,0,.45)" stroke-width="1.4"/>`;
  // the bow on the crest: two loops, two tails, the knot
  s += carve(`M62 6 c-4 -9 -15 -9 -15 -2 c0 5 9 5 15 2Z`, "gold", .8) + carve(`M62 6 c4 -9 15 -9 15 -2 c0 5 -9 5 -15 2Z`, "gold", .8) + carve(`M60 7 c-3 5 -8 9 -11 16 l2 1 c3 -6 8 -10 11 -14Z`, "gold", .7) + carve(`M64 7 c3 5 8 9 11 16 l-2 1 c-3 -6 -8 -10 -11 -14Z`, "gold", .7) + carve(`M58.6 2.6 h6.8 v6.4 h-6.8Z`, "gold", .7);
  // arms: the gilt supports with an acanthus at the front, a padded velvet manchette
  for (const sx of [-1, 1]) { const f = (p) => [sx < 0 ? p[0] : 124 - p[0], p[1]];
    const arm = sx < 0 ? "M24 68 C12 66 5 74 5 86 C5 98 3 108 5 120 L10 120 C9 108 10 98 10 88 C10 78 14 73 24 72Z" : "M100 68 C112 66 119 74 119 86 C119 98 121 108 119 120 L114 120 C115 108 114 98 114 88 C114 78 110 73 100 72Z";
    s += carve(arm, "gold", .9);
    s += carve(ptsD(leafPts(6, 92, 8, 116, 3.4, .1, 3), f), "gold", .7) + carve(ptsD(spiralPts(4, 2.6, 1, sx < 0 ? 1 : -1, 0).map((p) => [p[0] + 7, p[1] + 90]), f), "gold", .6);
    const [mx] = f([7, 0]); s += `<ellipse cx="${mx}" cy="90.5" rx="6" ry="3.4" fill="url(#sl-velvet)"/><ellipse cx="${mx}" cy="90.5" rx="6" ry="3.4" fill="${vel}" opacity=".6"/><ellipse cx="${mx - 1}" cy="89.4" rx="3.6" ry="1.4" fill="rgba(255,200,210,.22)"/>`; }
  // the seat: a deep cushion, lit on its top, its front edge rolled; a welt round it; the apron carved
  s += `<path d="M18 92 L106 92 L120 118 L4 118 Z" fill="url(#sl-velvet)"/><path d="M18 92 L106 92 L120 118 L4 118 Z" fill="${vel}" opacity=".55"/><path d="M18 92 L106 92 L120 118 L4 118 Z" fill="url(#sl-seat)"/>
    <path d="M30 100 q12 3 24 -1 M66 104 q14 3 30 -2 M20 110 q20 4 40 0" fill="none" stroke="rgba(10,0,3,.28)" stroke-width="1.6"/><path d="M30 99 q12 3 24 -1 M66 103 q14 3 30 -2" fill="none" stroke="rgba(255,200,210,.14)" stroke-width=".8"/>
    <path d="M4 118 Q62 124 120 118 L119 126 Q62 132 5 126Z" fill="url(#sl-velvet)"/><path d="M4 118 Q62 124 120 118 L119 126 Q62 132 5 126Z" fill="${vel}" opacity=".7"/><path d="M4 118 Q62 124 120 118 L119 126 Q62 132 5 126Z" fill="rgba(10,0,3,.35)"/>
    <path d="M4 118 Q62 124 120 118" stroke="rgba(255,195,205,.4)" stroke-width="1" fill="none"/>`;
  s += mould(4, 127, 116, 10, [[1.4, "v"], [1.4, "b"], [1.6, "c"], [5.6, "f"]], "gold") + rosette(62, 132, 4.4) + rosette(9, 132, 3.6) + rosette(115, 132, 3.6);
  // the legs: tapered, fluted, a ring at the top, a toupie at the foot
  s += leg(11, 137, 13, 159, 7, 4.2, "gold", 3) + leg(113, 137, 111, 159, 7, 4.2, "gold", 3) + leg(32, 137, 33, 150, 4.6, 3, "gold", 2) + leg(92, 137, 91, 150, 4.6, 3, "gold", 2);
  s += `${carve("M10 158 h6 l-1 4 h-4Z", "gold", .5)}${carve("M108 158 h6 l-1 4 h-4Z", "gold", .5)}`;
  return svg(124, 165, s);
}
// the little brass book stand the album leans on, on the sill: a ledge with a raised lip, two small feet
const STAND = () => svg(72, 10, `<rect x="3" y="6.4" width="66" height="2.6" fill="rgba(30,15,5,.3)" transform="translate(1 1)"/><rect x="2" y="1" width="68" height="1.6" rx=".6" fill="url(#sl-brass)"/><rect x="2" y="1" width="68" height=".5" fill="rgba(255,250,225,.9)"/>
  <rect x="2" y="2.6" width="68" height="3" fill="url(#sl-brass)"/><rect x="2" y="2.6" width="68" height="3" fill="rgba(60,35,5,.25)"/><rect x="2" y="5.4" width="68" height=".7" fill="rgba(40,25,5,.6)"/>
  <rect x="6" y="5.6" width="4" height="2.6" rx=".8" fill="url(#sl-brass)"/><rect x="62" y="5.6" width="4" height="2.6" rx=".8" fill="url(#sl-brass)"/>`);
const VITRINE_IN = () => svg(104, 100, `<rect width="104" height="100" fill="url(#sl-veneer)"/><rect width="104" height="100" fill="#120804" opacity=".7"/><rect width="104" height="100" fill="url(#sl-topshade)"/><rect x="0" y="90" width="104" height="10" fill="url(#sl-cherrys)"/>`);
// the glazed door: a moulded frame, a transom and a fanlight of lead cames over it, the one big pane clear; the glass
// picks up the window (a broad diagonal sheen, a narrow one) and is a little green at its edge
const VITRINE_GLASS = () => {
  const x0 = 6.2, y0 = 6.2, gw = 91.6, gh = 87.6, ty = 28, cx = 52;
  const came = (d, wd = 1) => `<path d="${d}" fill="none" stroke="rgba(15,10,5,.8)" stroke-width="${wd + .6}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#5e574c" stroke-width="${wd}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="rgba(235,228,210,.5)" stroke-width="${(wd * .35).toFixed(2)}" transform="translate(-.3 -.35)"/>`;
  let fan = `<path d="M${x0} ${y0} H${x0 + gw} V${ty} H${x0}Z" fill="rgba(210,225,215,.07)"/>`;
  fan += came(`M${cx - 40} ${ty} A40 19 0 0 1 ${cx + 40} ${ty}`) + came(`M${cx - 15} ${ty} A15 8 0 0 1 ${cx + 15} ${ty}`);
  for (let i = 1; i < 6; i++) { const a = Math.PI * (1 + i / 6); fan += came(`M${(cx + 15 * Math.cos(a)).toFixed(2)} ${(ty + 8 * Math.sin(a)).toFixed(2)} L${(cx + 40 * Math.cos(a)).toFixed(2)} ${(ty + 19 * Math.sin(a)).toFixed(2)}`, .8); }
  fan += came(`M${x0} ${y0 + 3} L${cx - 40 * .7} ${ty - 19 * .71}`, .7) + came(`M${x0 + gw} ${y0 + 3} L${cx + 40 * .7} ${ty - 19 * .71}`, .7);
  return svg(104, 100, `<rect x="${x0}" y="${y0}" width="${gw}" height="${gh}" fill="url(#sl-glass)"/>
  <path d="M${x0} ${ty + 4} L${x0 + 30} ${ty + 4} L${x0} ${ty + 46}Z" fill="rgba(255,255,255,.13)"/><path d="M${x0 + 44} ${ty + 4} L${x0 + 52} ${ty + 4} L${x0} ${y0 + gh - 4} V${y0 + gh - 14}Z" fill="rgba(255,255,255,.1)"/><path d="M${x0 + 2} ${y0 + 2} V${y0 + gh - 2}" stroke="rgba(255,255,255,.22)" stroke-width=".8"/><path d="M${x0 + gw} ${ty + 30} V${ty + 44} L${x0 + 70} ${y0 + gh} H${x0 + 58}Z" fill="rgba(255,255,255,.05)"/>
  ${fan}${came(`M${x0} ${ty} H${x0 + gw}`, 2)}
  <rect x="${x0 + .5}" y="${y0 + .5}" width="${gw - 1}" height="${gh - 1}" fill="none" stroke="rgba(150,195,175,.35)" stroke-width="1"/>
  ${mould(0, 0, 104, 100, [[1.6, "v"], [1.4, "c"], [2.2, "v"], [1, "b"]], "wood")}<rect x="6.2" y="6.2" width="91.6" height="87.6" fill="none" stroke="url(#sl-goldd)" stroke-width=".8"/>
  ${carve("M89.4 43 h6 v14 h-6Z", "gold", .6)}<path d="M92.4 47.4 a1.1 1.1 0 1 0 .01 0Z M91.9 49 h1 l.4 3.4 h-1.8Z" fill="#1a0e04"/>`);
};


// The hit areas (x, y, w, h in the room's units) stand apart by 8 px or more, so a tap never lands on the neighbour;
// the drawing of a thing may reach past its area (a frame over the rail, a curtain's tassel). The crate's area is its
// copy's crate and sideboard. The bird stands on the window sill, by the stamp album.
const SPOTS = {
  museum: [150, 50, 248, 250], records: [14, 312, 176, 328], world: [200, 452, 62, 200], shelf: [270, 316, 124, 104], poems: [278, 428, 108, 72],
  list: [200, 366, 62, 78], stamps: [24, 254, 66, 50], medals: [281, 508, 104, 98], prints: [12, 648, 90, 76], marks: [296, 690, 90, 64], nest: [98, 254, 44, 50],
};
const BIRD = [94, 254, 52]; // the bird's box on the sill: x, y, size
// `d`: { drawers: [[key, name, count, unit]] in DRAWERS' order, and what each corner holds — museum, records, poems,
// prints (newest first), books (shelf()), reading (readingBook()), stamps (the issues stamped, newest first) — and
// `bird`: whether this phone has the yard's robin (a 特供版 phone).
export function salonRoom(d) {
  const by = Object.fromEntries(d.drawers.map(([k, name, count, unit]) => [k, { name, count, unit }]));
  const n = (k) => by[k]?.count || 0, u = (k) => by[k]?.unit || "";
  const face = d.reading ? { title: d.reading.title, reading: true } : d.books.length ? { title: d.books.at(-1).title } : null;
  const older = (d.reading ? d.books : d.books.slice(0, -1)).slice().reverse();
  const stampImgs = d.stamps.slice(0, 18).map((i) => pic(stampPicture(i)));
  const lamp = d.museum.length > 0, lit = drawnLight = lightParts(hourLight(), lamp); // the hour's light; the picture light hangs over the newest work (hang)
  // x, y, w, h of each drawing, the drawing, and how it is turned to the eye of someone standing in the room: the
  // portfolio leans back on the easel, the album on its stand, the notebook lies on the seat
  const draw = {
    museum: [...HANG_AT, 252, 250, hang(d.museum, n("museum"), u("museum"))],
    world: [196, 452, 70, 200, globeHtml(n("world"), u("world"))],
    shelf: [270, 316, 124, 304, bookcase(124, 304, face, older, n("shelf"), u("shelf"))],
    poems: [300, 432, 66, 54, writingBox(66, 54, n("poems"), u("poems"))],
    list: [198, 360, 68, 86, rack(68, 86, n("list"), u("list"))],
    stamps: n("stamps") ? [22, 254, 72, 46, album(72, 46, stampImgs, n("stamps"), u("stamps")), "perspective(220px) rotateX(14deg)"] : [34, 256, 50, 44, albumClosed(50, 44), "perspective(220px) rotateX(14deg)"],
    medals: n("medals") ? [298, 545, 70, 70, medalCase(70, 70, n("medals"), u("medals"))] : [298, 547, 70, 49, medalCaseClosed(70, 49)],
    prints: [14, 652, 86, 72, portfolio(86, 72, pic(d.prints[0]?.a), n("prints"), u("prints")), "perspective(300px) rotateX(6deg) rotate(-2deg)"],
    marks: [298, 694, 84, 58, notebook(84, 58, n("marks"), u("marks")), "perspective(260px) rotateX(40deg) rotate(-5deg)"],
  };
  const link = (k, href, label, inner) => { const [hx, hy, hw, hh] = SPOTS[k];
    return `<a class="sl-o${k === "records" ? " sl-rec" : k === "nest" ? " sl-bird nest" : ""}" data-k="${k}" href="${href}" style="left:${hx}px;top:${hy}px;width:${hw}px;height:${hh}px" aria-label="${esc(label)}">${inner}</a>`; };
  const box = (k, [x, y, w, h, html, turn]) => { const [hx, hy] = SPOTS[k]; return `<span class="sl-draw" style="left:${x - hx}px;top:${y - hy}px;width:${w}px;height:${h}px${turn ? `;transform:${turn}` : ""}">${html}</span>`; };
  const obj = (k) => link(k, k === "list" ? "#/saved/list" : `#/${k}`, `${by[k]?.name || k}：${n(k)} ${u(k)}`, k === "records" ? crateCopy(d.records, n("records"), u("records")) : box(k, draw[k]));
  const deco = (x, y, w, h, html, cls = "") => `<b class="sl-deco${cls ? ` ${cls}` : ""}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${html}</b>`;
  const bird = () => { if (!d.bird) return ""; const rb = roomBird(), [bx, bt, bs] = BIRD; // its shadow on the sill, then the bird (nest.js roomBird)
    return deco(100, 292, 40, 10, svg(40, 10, `<ellipse cx="20" cy="5" rx="12" ry="2.2" fill="url(#sl-contact)"/><ellipse cx="27" cy="5.5" rx="13" ry="2.4" fill="rgba(30,14,4,.18)"/>`))
      + link("nest", "#/nest", rb.label, box("nest", [bx, bt, bs, bs, rb.html])); };
  return fuseGilt(`<section class="salon" aria-label="收藏的角落">${DEFS}<div class="sl-cam"><div class="sl-stage">
      <i class="sl-wall"></i><i class="sl-floor"></i>${deco(0, 0, W, H, WALL(lit.view))}${deco(0, 0, W, H, lit.light, "sl-light")}
      ${obj("museum")}${deco(12, FLOOR, 180, 12, FEET())}${obj("records")}${obj("world")}${obj("shelf")}${obj("poems")}${obj("list")}
      ${deco(281, 506, 104, 100, VITRINE_IN())}${obj("medals")}${deco(281, 506, 104, 100, VITRINE_GLASS())}${deco(22, 296, 72, 10, STAND())}${obj("stamps")}
      ${deco(4, 572, 108, 219, EASEL())}${deco(278, 626, 124, 165, ARMCHAIR())}${obj("prints")}${obj("marks")}${bird()}
      ${deco(0, 0, W, 830, svg(W, 830, `<rect width="${W}" height="830" fill="url(#sl-aoR)" opacity=".35"/><rect y="700" width="${W}" height="130" fill="url(#sl-aoUp)" opacity=".7"/>`))}
      ${deco(0, 0, W, H, lit.tone, `sl-tone${lamp ? " lamp" : ""}`)}<i class="sl-vig"></i></div></div></section>`);
}

// ——— The way in and the way back (the owner, 2026-11-19: every corner's move seamless; back out the same way) ———
// In: a tap lifts the room off the page (.lift: fixed where it stood, over all but the bottom bar) and changes the
// address at once, so the page is drawn under the room before anything moves (app.js route → roomMove). Then one camera
// — a scale about one fixed point that takes the thing's box in the room onto its counterpart's box on the page
// (SUBJECT) — carries the room and the page together, the page held so that its counterpart always lies where the
// thing is, and over the last stretch the room dissolves into it. The room stays live (sharp at any scale) and the
// page's own entrances are finished under it, so the room's last frame is the page's first and nothing plays again.
// Back to 收藏 from that page (its back arrow, a step back, the 收藏 tab): the same camera run backwards, the page's
// nodes (lifted off into a ghost) shrinking into the thing and fading as the room, drawn zoomed in under them, pulls
// back. Transform and opacity only. Reduced motion: the link opens its page, the room opens at rest.
// SUBJECT, per corner: the thing's box in the room (`room`, default its drawing) and its counterpart on the page (the
// union of `page`'s boxes, cut to the screen); `fit` "w" scales the one onto the other by width, else by the mean of
// width and height; `tl` lines up the top left corners instead of the centres (the record cabinet: the page's own in small);
// `disc`: the globe's sphere inside its box (world.js drawGlobe: the box's square less 6 px all round).
const SUBJECT = {
  museum: { page: ".mu-hang, .mu-plate" },
  records: { room: ".sl-rp", page: ".sc-page", fit: "w", tl: true },
  world: { room: ".sl-map", page: ".welt .map", fit: "w", disc: true },
  shelf: { page: ".bcase" },
  poems: { page: ".po-leaf.cur .po-sheet, .po-sb" }, // the letters onto the letter read (not the unseen ones under it), the box's brass onto the brass under it
  list: { page: ".sammlung" },
  stamps: { page: ".album .page", fit: "w" },
  medals: { page: ".md-box" },
  prints: { page: ".pr-all" },
  marks: { page: ".marks", fit: "w", tl: true }, // the notebook's title onto the page's
  nest: { page: ".yard .bird", fit: "w" },
};
const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (t) => t * t * (3 - 2 * t);
const N = 20; // keyframes at every twentieth of the time, eased in and out, run linearly between
const floorY = () => document.querySelector(".nav")?.getBoundingClientRect().top ?? innerHeight;
const union = (els) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const el of els) { const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue; x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); }
  return x1 > x0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
};
const roomBox = (a) => union([a.querySelector(SUBJECT[a.dataset.k]?.room || ".sl-draw") || a]);
function pageBox(k) {
  const s = SUBJECT[k], main = document.getElementById("main");
  let b = s && main ? union(main.querySelectorAll(s.page)) : null;
  if (b && s.disc) { const d = Math.min(b.w, b.h) - 12; b = { x: b.x + (b.w - d) / 2, y: b.y + (b.h - d) / 2, w: d, h: d }; }
  if (!b) return null;
  const x0 = Math.max(0, b.x), y0 = Math.max(0, b.y), x1 = Math.min(document.documentElement.clientWidth, b.x + b.w), y1 = Math.min(floorY(), b.y + b.h);
  return x1 - x0 > 8 && y1 - y0 > 8 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
}
// No counterpart on the page (an empty corner's line): the thing to the middle of the screen, as large as it allows.
function middle(A) {
  const vw = document.documentElement.clientWidth, vh = floorY(), S = Math.max(1.2, Math.min(3.4, (vw * .94) / A.w, (vh * .55) / A.h));
  return { x: vw / 2 - S * A.w / 2, y: vh * .46 - S * A.h / 2, w: S * A.w, h: S * A.h };
}
// The camera taking box A onto box B (screen coordinates): at eased progress e the screen is scaled by s^e about the
// fixed point of the whole move, as [g, dx, dy] (x → g·x + d); `rel` is the page's own move, the room's less the whole.
function camera(A, B, k) {
  const sp = SUBJECT[k] || {}, sw = B.w / A.w, s = sp.fit === "w" ? sw : Math.sqrt(sw * (B.h / A.h));
  const [ax, ay, bx, by] = sp.tl ? [A.x, A.y, B.x, B.y] : [A.x + A.w / 2, A.y + A.h / 2, B.x + B.w / 2, B.y + B.h / 2];
  const tx = bx - s * ax, ty = by - s * ay, flat = Math.abs(1 - s) < 1e-3;
  const at = (e) => { const g = Math.pow(s, e); return flat ? [1, tx * e, ty * e] : [g, (tx / (1 - s)) * (1 - g), (ty / (1 - s)) * (1 - g)]; };
  const rel = ([g, dx, dy]) => [g / s, dx - (g * tx) / s, dy - (g * ty) / s];
  return { at, rel, ms: Math.round(Math.min(1050, Math.max(800, 700 + 160 * Math.log(Math.max(s, 1))))) };
}
// The matrix that moves an element whose box starts at (ox, oy) on the screen (transform-origin 0 0) by [g, dx, dy].
const mat = ([g, dx, dy], ox = 0, oy = 0) => `matrix(${g.toFixed(5)}, 0, 0, ${g.toFixed(5)}, ${(g * ox + dx - ox).toFixed(2)}, ${(g * oy + dy - oy).toFixed(2)})`;
// A page's entrances (page-in, the rises of reveal(), a scene's own) played to their end at once: under the room no one
// sees them, and the page must be still when it is measured and when it shows. Endless ones (a glow, a bird) run on.
function settle(main) {
  const h = floorY();
  main.querySelectorAll(".rv:not(.in)").forEach((el) => { if (el.getBoundingClientRect().top < h) el.classList.add("in"); });
  for (const x of main.getAnimations({ subtree: true })) {
    if (x.effect?.target === main || x.effect?.getComputedTiming().iterations === Infinity) continue;
    try { x.finish(); } catch { /* not finishable */ }
  }
}

let lift = null; // the move in under way: { k, href, room, a, A, runs }
let door = null; // the page last entered from the room, for the way back: { k, href, i (its history stamp), area }
// Safari's own swipe back slides the room's picture in already: then the room is simply there (best effort — the flag
// where the browser has it, else a touch that starts at the left edge and is taken over by the browser).
let swipeAt = 0, edgeAt = 0;
addEventListener("popstate", (e) => { if (e.hasUAVisualTransition) swipeAt = performance.now(); });
addEventListener("touchstart", (e) => { edgeAt = e.touches.length === 1 && e.touches[0].clientX < 20 ? performance.now() : 0; }, { passive: true, capture: true });
addEventListener("touchcancel", () => { if (edgeAt && performance.now() - edgeAt < 1500) swipeAt = performance.now(); }, { passive: true, capture: true });
const swiped = () => performance.now() - swipeAt < 1500;

// Nodes moved to another parent: their CSS animations start over (moveBefore does not keep them either), so an
// entrance would play again and a glow jump back — each is set again to the time it had reached.
function move(nodes, to) {
  const key = (x) => `${x.animationName}|${x.effect?.pseudoElement || ""}`, was = new Map();
  for (const n of nodes) if (n.getAnimations) for (const x of n.getAnimations({ subtree: true })) if (x.animationName) was.set(x.effect.target, [...(was.get(x.effect.target) || []), [key(x), x.currentTime]]);
  to.append(...nodes);
  for (const n of nodes) if (n.getAnimations) for (const x of n.getAnimations({ subtree: true })) {
    const t = (was.get(x.effect?.target) || []).find(([k]) => k === key(x))?.[1];
    try { if (t != null) x.currentTime = t; else if (x.effect?.getComputedTiming().iterations !== Infinity) x.finish(); } catch { /* not seekable */ }
  }
}
function liftRoom(room) {
  const r = room.getBoundingClientRect();
  Object.assign(room.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  room.classList.add("lift", "zoom");
  move([room], document.body);
}
function landIn(L) {
  const main = document.getElementById("main"), room = L.room;
  if (!room.isConnected || !main) { lift = null; return; }
  L.runs = [];
  // while it is carried the page, scaled and shifted, would widen the document, and a phone zooms out to show what
  // overflows (the bottom bar dropped off the screen): the width is clipped for the length of the move
  document.documentElement.classList.add("room-in");
  main.style.transformOrigin = "0 0";
  settle(main);
  const B = pageBox(L.k) || middle(L.A), c = camera(L.A, B, L.k), es = Array.from({ length: N + 1 }, (_, i) => c.at(ease(i / N)));
  if (L.k === "world") L.a.querySelector(".sl-map")?.globe?.draw(B.w / L.A.w); // the turning globe, painted for the size it lands at
  const R = room.getBoundingClientRect(), O = main.getBoundingClientRect(), o = { duration: c.ms, fill: "both" };
  // the hour's dark and warmth (TONE) lift as the camera nears the thing, so the room the page comes up out of is lit
  // as the page is: by night a dark room would dissolve into a bright page
  L.runs.push(room.querySelector(".sl-cam").animate(es.map((m) => ({ transform: mat(m, R.left, R.top) })), o),
    main.animate(es.map((m) => ({ transform: mat(c.rel(m), O.left, O.top) })), o),
    room.animate([{ opacity: 1 }, { opacity: 1, offset: .66, easing: "ease-in-out" }, { opacity: 0, offset: .97 }, { opacity: 0 }], o),
    room.querySelector(".sl-tone").animate([{ opacity: 1, easing: "ease-in-out" }, { opacity: 0, offset: .66 }, { opacity: 0 }], o));
  if (L.k === "records") { // the brass: the room's large 唱片櫃 gives way to the page's Schallplatten
    const zh = L.a.querySelector(".sl-zh"), de = L.a.querySelector(".sl-de"), br = L.a.querySelector(".cr-plate");
    if (zh) L.runs.push(zh.animate([{ opacity: 1 }, { opacity: 1, offset: .55 }, { opacity: 0, offset: .66 }], o));
    if (de) L.runs.push(de.animate([{ opacity: 0 }, { opacity: 0, offset: .55 }, { opacity: 1, offset: .66 }], o));
    if (br) L.runs.push(br.animate([{ transform: "scale(1.16)" }, { transform: "scale(1.16)", offset: .5 }, { transform: "none" }], { ...o, easing: "ease-in-out" }));
  }
  L.later = setTimeout(() => { if (lift === L) settle(main); }, c.ms * .55); // the rises reveal() set off since
  L.runs[0].finished.then(() => {
    if (lift !== L) return;
    lift = null;
    const keep = decode(pictures(L.room));
    dropLift(L);
    door = { k: L.k, href: L.href, i: history.state?.i, area: B.w * B.h, keep };
  }, () => {});
}
function dropLift(L) {
  clearTimeout(L.later);
  L.runs?.forEach((x) => x.cancel());
  L.room.remove();
  const main = document.getElementById("main");
  if (main) main.style.transformOrigin = "";
  document.documentElement.classList.remove("room-in");
}
// A step back (or the 收藏 tab) before the move in has landed: the room, drawn afresh under the lifted one, is taken
// back up from wherever the camera is, and the lifted one goes.
function retreat(L) {
  const main = document.getElementById("main"), room = L.room, cam = room.querySelector(".sl-cam");
  clearTimeout(L.later);
  if (main) settle(main);
  const t = getComputedStyle(cam).transform, op = getComputedStyle(room).opacity, tone = room.querySelector(".sl-tone"), dim = getComputedStyle(tone).opacity;
  L.runs?.forEach((x) => x.cancel());
  if (main) main.style.transformOrigin = "";
  document.documentElement.classList.remove("room-in");
  const up = { duration: 420, easing: "cubic-bezier(.3,.6,.3,1)", fill: "both" }, back = cam.animate([{ transform: t === "none" ? "none" : t }, { transform: "none" }], up);
  tone.animate([{ opacity: dim }, { opacity: 1 }], up); // the hour's dark back as the camera is
  room.animate([{ opacity: op }, { opacity: 1 }], { duration: 140, fill: "both" });
  const end = () => room.remove();
  back.finished.then(end, end);
}
// The way back: the page's nodes are lifted off into a ghost (fixed where they stood, scrolled as they were), the room
// is drawn under them zoomed in onto the page's counterpart of the thing, and the ghost is carried by the same camera,
// fading over the first 30% of the move, as the room pulls back; the room without the hour's dark and warmth (TONE)
// until the page has gone, then they come back as it pulls back (the way in, the other way round). Live nodes, like the
// room on the way in, so the move starts on the first frame that is actually painted (a picture of the page would set
// off before the room was painted).
let out = null; // the way back under way: { ghost, run, tone, room }
// The room's pictures (its photographs of wood and stucco, the works on the wall, the record's sleeve): decoding them
// is most of the cost of the room's first frame. Held decoded while the page entered from the room is open, and
// awaited — briefly, the page still standing — before the way back moves, so the room shows whole when the page fades.
function pictures(room) {
  const u = new Set();
  room.querySelectorAll("image").forEach((i) => { const h = i.getAttribute("href"); if (h) u.add(new URL(h, location.href).href); });
  room.querySelectorAll("img").forEach((i) => { if (i.currentSrc) u.add(i.currentSrc); });
  room.querySelectorAll(".sl-wall, .sl-floor").forEach((el) => { for (const m of getComputedStyle(el).backgroundImage.matchAll(/url\("?([^")]+)"?\)/g)) u.add(m[1]); });
  return [...u];
}
const decode = (urls) => urls.map((src) => { const i = new Image(); i.src = src; return { i, done: i.decode().catch(() => {}) }; });
function dropOut() {
  if (!out) return;
  out.ghost.remove(); out.run?.cancel(); out.tone?.cancel(); out.room?.classList.remove("zoom", "back");
  out = null;
}
async function wayBack(d, B, draw) {
  const main = document.getElementById("main"), y = scrollY, ghost = document.createElement("div");
  ghost.className = "room-ghost"; ghost.setAttribute("aria-hidden", "true"); ghost.inert = true;
  ghost.innerHTML = "<div></div>"; // in place of #main: it too holds what is drawn against #main (its translate makes it the box for them)
  main.before(ghost); // ahead of the room in the document: the page's own SVG ids (a gradient, a seal) stay the ones its url(#…) finds
  move([...main.childNodes], ghost.firstChild);
  ghost.scrollTop = y;
  const O = out = { ghost };
  await draw();
  if (out !== O) return;
  const room = main.querySelector(".salon"), a = room?.querySelector(`.sl-o[data-k="${d.k}"]`);
  if (!a) { dropOut(); return; }
  settle(main); // the room's own entrance: it is there at once, under the page
  const A = roomBox(a), c = camera(A, B, d.k), ts = Array.from({ length: N + 1 }, (_, i) => c.at(1 - ease(i / N)));
  const R = room.getBoundingClientRect(), F = 6, o = { duration: c.ms, fill: "both" }; // the ghost's part: the first 6 of the 20 steps
  O.room = room;
  room.classList.add("zoom", "back"); // no taps until it is back
  if (d.k === "world") a.querySelector(".sl-map")?.globe?.draw(B.w / A.w); // the globe painted for the size it starts at
  O.run = room.querySelector(".sl-cam").animate(ts.map((m) => ({ transform: mat(m, R.left, R.top) })), o);
  O.run.pause(); // held zoomed in, under the page, while its pictures are decoded
  await Promise.race([Promise.all(decode(pictures(room)).map((x) => x.done)), new Promise((r) => setTimeout(r, 200))]);
  if (out !== O) return;
  O.run.play();
  O.tone = room.querySelector(".sl-tone").animate([{ opacity: 0 }, { opacity: 0, offset: F / N, easing: "ease-in-out" }, { opacity: 1 }], o);
  ghost.animate(ts.slice(0, F + 1).map((m, i) => ({ transform: mat(c.rel(m)), opacity: 1 - smooth(i / F) })), { duration: (c.ms * F) / N, fill: "both" });
  const end = () => { if (out === O) dropOut(); };
  O.run.finished.then(end, end);
}

// For app.js route, before it draws `h` (coming from the page `from`, whose history stamp was `left`; `ev`: a
// navigation, not a redraw): what the room makes of it, or null. { land } after the page is drawn (the way in),
// { run(draw) } instead of drawing (the way back), { done } after drawing, { before, keep } at the start of drawing,
// the page's own transition kept (the move in cut short by going elsewhere: the lifted room leaves with the old page).
export function roomMove(h, { from, left, ev }) {
  dropOut(); // a way back cut short: the next page is drawn over the room as it stands
  if (lift) {
    const L = lift;
    if (h === L.href) return L.runs ? null : { land: () => landIn(L) };
    lift = null;
    return h === "#/saved" ? { done: () => retreat(L) } : { before: () => dropLift(L), keep: true };
  }
  if (h !== "#/saved") return null;
  const d = door; door = null; // one way back for one way in
  if (!d || !ev || d.href !== from || d.i !== left || calm()) return null;
  if (swiped()) return { done: () => settle(document.getElementById("main")) };
  const B = pageBox(d.k);
  if (!B || B.w * B.h < d.area * .5) return null; // the page scrolled away from it: the room opens as it does from anywhere
  return { run: (draw) => wayBack(d, B, draw) };
}

// The bird again (after a sync): the same box, today's drawing and words.
export function redrawBird(room) {
  const a = room?.querySelector(".sl-bird"), box = a?.querySelector(".sl-draw");
  if (!box) return;
  const rb = roomBird();
  box.innerHTML = rb.html; a.setAttribute("aria-label", rb.label);
}

// After the room is in the page: its scale to the screen's width, the globe's map, the newest poem's title, the taps.
// `poem(date)` answers the poem article (app.js article).
export function wireSalon(room, { poem, world = [] } = {}) {
  if (!room) return;
  const fit = () => { // as large as the screen allows, the width first; on a short screen the room is narrowed and centred
    if (!room.isConnected) { removeEventListener("resize", fit); return; }
    const k = Math.min(room.clientWidth / W, room.clientHeight / H);
    room.style.setProperty("--k", k.toFixed(4)); room.style.setProperty("--dx", `${((room.clientWidth - W * k) / 2).toFixed(1)}px`);
  };
  fit();
  addEventListener("resize", fit);
  // the hour's light: drawn for the hour the room opened at (salonRoom), again every two minutes while it is open (a
  // step too small to see, even at dusk) and when the app comes back to the front, only where the drawing has changed;
  // never in the middle of a move
  let shown = drawnLight; drawnLight = null;
  const lamp = Boolean(room.querySelector(".sl-tone.lamp"));
  const relight = () => {
    if (!room.isConnected) { clearInterval(tick); document.removeEventListener("visibilitychange", relight); return; }
    if (document.hidden || room.matches(".lift, .zoom, .back")) return;
    const now = lightParts(hourLight(), lamp);
    paintLight(room, shown, now); shown = now;
  };
  const tick = setInterval(relight, 2 * 60 * 1000);
  document.addEventListener("visibilitychange", relight);
  const map = room.querySelector(".sl-map");
  if (map) turnGlobe(room, map, world);
  const t = room.querySelector(".sl-poem");
  if (t && poem) poem().then((art) => {
    const p = poemOf(art); if (!t.isConnected || !p) return;
    const latin = /^[\x20-\x7eÀ-ɏ’]+$/.test(p.orig || "");
    const s = latin ? p.orig.toUpperCase() : [...(p.title || "")].slice(0, 9).join(""), em = latin ? .66 : 1.08; // the letter is 46 wide: the title set to fit it
    t.textContent = s;
    t.setAttribute("font-size", Math.min(latin ? 4.6 : 4.4, 40 / Math.max(1, [...s].length * em)).toFixed(2));
    t.setAttribute("letter-spacing", latin ? ".3" : ".2");
    if (!latin) t.setAttribute("font-family", "Noto Serif TC");
  }).catch(() => {});
  let busy = false;
  room.addEventListener("click", (e) => {
    const a = e.target.closest("a.sl-o");
    if (!a) return;
    if (busy || room.classList.contains("back")) { e.preventDefault(); return; }
    if (calm() || !a.animate) return; // the link opens its page at once
    e.preventDefault();
    busy = true;
    lift = { k: a.dataset.k, href: a.getAttribute("href"), room, a, A: roomBox(a) }; // measured at rest, before it is lifted
    liftRoom(room);
    location.hash = lift.href;
  });
}

