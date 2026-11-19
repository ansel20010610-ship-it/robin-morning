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
// A tap: the camera moves in on the thing (one transform on .sl-cam, run by the compositor) and its page opens; the crate
// is #/records itself, laid out at the page's size and scaled down (records.js crateHtml), so the move lands on that page.
// The room is drawn at 402 × 791 and scaled to the screen (the screen's height less the bottom bar, fixed before any
// picture arrives: iPhone Safari has no scroll anchoring). One light, the window's morning light from the upper left:
// every shadow falls right and down, each piece stands on a contact shadow, the window's panes lie on the parquet.
// No SVG filter and no blend mode inside: the shadows and the light are gradients and translucent shapes.
// Wood, leather, velvet, parquet and stucco are photographs (assets/shelf/, Poly Haven, CC0).
import { esc, ROBIN_PATHS } from "./util.js";
import { crateHtml } from "./records.js";
import { stampPicture } from "./stamps.js";
import { drawMap } from "./world.js";
import { poemOf } from "./poems.js";
import { calm } from "./motion.js";
import { roomBird } from "./nest.js";

const W = 402, H = 791, FLOOR = 640, REC = 0.44; // the room's size, the line the furniture stands on, the crate's scale
const TEX = "assets/shelf/";
const pic = (a) => a?.hero?.thumb || a?.hero?.src || "";
let uidN = 0;
const uid = (p) => `sl-${p}${++uidN}`;
const svg = (w, h, inner) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="visible" aria-hidden="true">${inner}</svg>`;
const GOLD = "#c7a04a";

// ——— the gradients and photographs every piece shares ———
const FOIL = [["0", "#7a5418"], [".14", "#c99a3c"], [".26", "#fbe7a6"], [".38", "#d4a443"], [".52", "#8a6220"], [".66", "#e9c66c"], [".74", "#fff3c4"], [".86", "#b98a33"], ["1", "#6e4c16"]];
const stops = (a) => a.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("");
const lin = (id, a, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops(a)}</linearGradient>`;
const rad = (id, a, cx = ".5", cy = ".5", r = ".5") => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(a)}</radialGradient>`;
const pat = (id, img, s) => `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${s}" height="${s}"><image href="${TEX}${img}" x="-2" y="-2" width="${s + 4}" height="${s + 4}" preserveAspectRatio="none"/></pattern>`;
const robin = ROBIN_PATHS.replace(/class="e-ink"/g, 'fill="var(--rb-ink,#9a6e26)"').replace(/class="e-robin"/g, 'fill="var(--rb-breast,#e3c06c)"').replace(/class="e-gold"/g, 'fill="var(--rb-beak,#fff0bf)"')
  .replace(/class="e-paper"/g, 'fill="var(--rb-eye,#5c1d2c)"').replace(/class="e-wing"/g, 'fill="none" stroke="var(--rb-wing,#7a5418)"').replace(/class="e-legs"/g, 'fill="none" stroke="var(--rb-wing,#7a5418)"');
const DEFS = `<svg class="sl-defs" width="0" height="0" aria-hidden="true"><defs>
  ${lin("sl-foil", FOIL, 1, .5)}
  ${lin("sl-gold", [["0", "#fbe9b0"], [".25", "#d9ab4d"], [".5", "#8f6522"], [".75", "#e5c06a"], ["1", "#7a5418"]])}
  ${lin("sl-goldd", [["0", "#f6dc93"], [".2", "#b98a33"], [".42", "#f3d78e"], [".6", "#9a6e26"], [".8", "#e2bb62"], ["1", "#7a5418"]], 1, 1)}
  ${lin("sl-brass", [["0", "#f3d78e"], [".32", "#c39445"], [".52", "#e8c56c"], [".78", "#9a6e26"], ["1", "#c99a3c"]], .2, 1)}
  ${rad("sl-rivet", [["0", "#fff3c4"], [".7", "#7a5418"]], ".35", ".3", ".8")}
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
  ${lin("sl-silk", [["0", "#d9c38f"], [".3", "#f3e4bd"], [".55", "#c9ae72"], [".8", "#efdcae"], ["1", "#bfa36a"]], 1, 0)}
  ${lin("sl-plaster", [["0", "#faf6ee"], [".6", "#ebe2d1"], ["1", "#d6c9b0"]])}
  ${lin("sl-skyr", [["0", "#cdd6da"], [".45", "#eae6da"], [".72", "#f8eed8"], ["1", "#f3e6cc"]])}
  ${rad("sl-glowv", [["0", "rgba(255,248,228,.7)"], [".6", "rgba(255,248,228,.25)"], ["1", "rgba(255,248,228,0)"]])}
  ${lin("sl-aoDown", [["0", "rgba(40,22,6,.32)"], ["1", "rgba(40,22,6,0)"]])}
  ${lin("sl-aoUp", [["0", "rgba(40,22,6,0)"], ["1", "rgba(40,22,6,.34)"]])}
  ${lin("sl-aoL", [["0", "rgba(40,22,6,.3)"], ["1", "rgba(40,22,6,0)"]], 1, 0)}
  ${lin("sl-aoR", [["0", "rgba(40,22,6,0)"], ["1", "rgba(40,22,6,.4)"]], 1, 0)}
  ${lin("sl-patch", [["0", "rgba(255,236,190,.2)"], ["1", "rgba(255,236,190,.07)"]], .3, 1)}
  ${lin("sl-haze", [["0", "rgba(255,247,228,0)"], [".6", "rgba(255,247,228,.55)"], ["1", "rgba(255,247,228,.2)"]])}
  ${lin("sl-bloom", [["0", "rgba(255,236,190,.12)"], ["1", "rgba(255,236,190,0)"]], .3, 1)}
  ${lin("sl-streak", [["0", "rgba(255,244,220,.26)"], ["1", "rgba(255,244,220,0)"]])}
  ${lin("sl-cast", [["0", "rgba(30,14,4,.42)"], ["1", "rgba(30,14,4,0)"]], .6, 1)}
  ${rad("sl-contact", [["0", "rgba(15,6,0,.9)"], [".55", "rgba(15,6,0,.42)"], ["1", "rgba(15,6,0,0)"]])}
  ${rad("sl-vel", [["0", "rgba(30,0,8,.5)"], [".62", "rgba(30,0,8,.05)"], [".86", "rgba(255,170,190,.16)"], ["1", "rgba(255,190,205,.28)"]])}
  <pattern id="sl-brush" patternUnits="userSpaceOnUse" width="4" height="2"><rect width="4" height="1" fill="rgba(255,255,255,.08)"/><rect y="1" width="4" height="1" fill="rgba(0,0,0,.05)"/></pattern>
  ${pat("sl-cherry", "cherry.jpg", 220)}${pat("sl-cherryv", "cherry_v.jpg", 220)}${pat("sl-veneer", "veneer_v.jpg", 200)}${pat("sl-velvet", "velvet.jpg", 110)}
  ${pat("sl-cherrys", "cherry.jpg", 120)}${pat("sl-cherryvs", "cherry_v.jpg", 120)}${pat("sl-leather", "leather.jpg", 90)}
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

// ——— a picture: gilt frame, the bevel, a beaded moulding, varnish; wine velvet behind it while (or if never) it loads ———
function frame(x, y, w, h, img, b) {
  return `<g transform="translate(${x} ${y})">${shade(0, 1, w, h, 1, .55)}<rect width="${w}" height="${h}" fill="url(#sl-goldd)"/>
    <path d="M0 0H${w}L${w - b} ${b}H${b}V${h - b}L0 ${h}Z" fill="rgba(255,245,210,.26)"/><path d="M${w} 0V${h}H0L${b} ${h - b}H${w - b}V${b}Z" fill="rgba(60,35,5,.32)"/>
    <rect x="${b * .42}" y="${b * .42}" width="${w - b * .84}" height="${h - b * .84}" fill="none" stroke="#f8e3a2" stroke-width="${(b * .2).toFixed(2)}" stroke-dasharray="${(b * .16).toFixed(2)} ${(b * .14).toFixed(2)}" opacity=".85"/>
    <rect x=".4" y=".4" width="${w - .8}" height="${h - .8}" fill="none" stroke="rgba(70,45,10,.75)" stroke-width=".8"/>
    <rect x="${b - 1.2}" y="${b - 1.2}" width="${w - 2 * b + 2.4}" height="${h - 2 * b + 2.4}" fill="#3a2610"/>
    <rect x="${b}" y="${b}" width="${w - 2 * b}" height="${h - 2 * b}" fill="url(#sl-velvet)"/><rect x="${b}" y="${b}" width="${w - 2 * b}" height="${h - 2 * b}" fill="#5a1424" opacity=".55"/>
    ${img ? `<image href="${esc(img)}" x="${b}" y="${b}" width="${w - 2 * b}" height="${h - 2 * b}" preserveAspectRatio="xMidYMid slice"/>` : ""}
    <rect x="${b}" y="${b}" width="${w - 2 * b}" height="${h - 2 * b}" fill="url(#sl-varnish)"/><rect x="${b}" y="${b}" width="${w - 2 * b}" height="${h - 2 * b}" fill="url(#sl-topshade)" opacity=".7"/>
    <path d="M.8 .8 H${w * .7} L${w * .7 - 1.6} 2.4 H2.4 V${h * .6} L.8 ${h * .6 + 1.6}Z" fill="rgba(255,250,222,.7)"/><path d="M${w - .6} .6 V${h - .6} H.6 L2.2 ${h - 2.2} H${w - 2.2} V2.2Z" fill="rgba(45,24,0,.5)"/>
      <path d="M${b} ${b + (h - 2 * b) * .55} L${b + (w - 2 * b) * .5} ${b} H${b + (w - 2 * b) * .62} L${b} ${b + (h - 2 * b) * .68}Z" fill="rgba(255,255,255,.07)"/><ellipse cx="${w * .22}" cy="${b * .5}" rx="${w * .12}" ry="${b * .35}" fill="url(#sl-shine)" opacity=".8"/></g>`;
}
const pictureLight = (cx, y, w) => `<ellipse cx="${cx}" cy="${y + w * .7}" rx="${w * 1.05}" ry="${w * .95}" fill="url(#sl-glow)"/>
  <rect x="${cx - 1}" y="${y - 10}" width="2" height="12" fill="url(#sl-gold)"/><rect x="${cx - w / 2}" y="${y}" width="${w}" height="5" rx="2.5" fill="url(#sl-gold)"/><rect x="${cx - w / 2}" y="${y + 3.5}" width="${w}" height="1.5" fill="rgba(255,240,190,.9)"/>`;

// ——— 美術館: the newest work in the middle under the light, the five before it round it; empty, the rail, two cords and hooks ———
const cord = (x1, x2, y) => `<path d="M${x1} 0 L${(x1 + x2) / 2} ${y}" stroke="rgba(150,120,70,.6)" stroke-width=".5"/>`;
const HANG = [[76, 44, 100, 118, 9, 126, 38], [8, 22, 50, 64, 5, 30, 20], [194, 18, 50, 76, 5, 222, 16], [8, 100, 50, 68, 5, 0, 0], [194, 108, 50, 58, 5, 0, 0], [86, 176, 80, 58, 6, 0, 0]]; // x y w h border, cord x and drop
function hang(list, count, unit) {
  const rail = `<rect x="0" y="0" width="252" height="3" fill="url(#sl-gold)"/>`;
  if (!list.length) return svg(252, 250, `${rail}${cord(70, 70, 70)}${cord(182, 182, 70)}<path d="M68 70 q2 4 4 0" stroke="url(#sl-gold)" stroke-width="1.4" fill="none"/><path d="M180 70 q2 4 4 0" stroke="url(#sl-gold)" stroke-width="1.4" fill="none"/>
    ${plate(96, 200, 60, 15, "美術館", "", { s1: 8.6, ls1: 2 })}`);
  const n = Math.min(HANG.length, list.length);
  let s = rail;
  for (let i = 0; i < n; i++) if (HANG[i][6]) s += cord(HANG[i][5], HANG[i][5], HANG[i][6]);
  s += pictureLight(126, 34, 56);
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
  let s = `<ellipse cx="${w / 2}" cy="${h}" rx="${w * .6}" ry="7" fill="url(#sl-drop)"/>
    <rect width="${w}" height="${h}" fill="url(#sl-cherryv)"/><rect width="${w}" height="${h}" fill="#1c0d05" opacity=".25"/>
    <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#sl-veneer)"/><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#160a04" opacity=".78"/>`;
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
  for (let i = 1; i <= sh - 1; i++) { const y = by + step * i - 5;
    s += `<rect x="${bx}" y="${y + 5}" width="${bw}" height="8" fill="rgba(0,0,0,.35)"/><rect x="${bx - 1}" y="${y}" width="${bw + 2}" height="6" fill="url(#sl-cherrys)"/><rect x="${bx - 1}" y="${y}" width="${bw + 2}" height="6" fill="url(#sl-boardlit)"/>
      ${plate(w / 2 - 8, y + .8, 16, 4.6, "", "", { rivets: false })}${cut(w / 2, y + 4.4, ["I", "II", "III"][i - 1], { fam: "Cormorant SC", size: 4, w: 700, ls: .3 })}`; }
  const cy = by + bh + 2, dw = (bw - 4) / 2; // the cupboard: two panelled doors, brass knobs
  s += `<rect x="${bx - 1}" y="${by + bh - 1}" width="${bw + 2}" height="9" fill="url(#sl-cherrys)"/><rect x="${bx - 1}" y="${by + bh - 1}" width="${bw + 2}" height="9" fill="url(#sl-boardlit)"/>`;
  for (const d of [0, 1]) { const dx = bx + 1 + d * (dw + 2);
    s += `<rect x="${dx}" y="${cy + 8}" width="${dw}" height="${cup - 10}" fill="url(#sl-cherryvs)"/><rect x="${dx}" y="${cy + 8}" width="${dw}" height="${cup - 10}" fill="rgba(0,0,0,.28)"/>
      <rect x="${dx + 7}" y="${cy + 16}" width="${dw - 14}" height="${cup - 26}" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="1.2"/><rect x="${dx + 8}" y="${cy + 17}" width="${dw - 16}" height="${cup - 28}" fill="none" stroke="rgba(255,215,170,.1)"/>`; }
  s += `<circle cx="${w / 2 - 6}" cy="${cy + 8 + cup * .32}" r="2.2" fill="url(#sl-rivet)"/><circle cx="${w / 2 + 6}" cy="${cy + 8 + cup * .32}" r="2.2" fill="url(#sl-rivet)"/>
    <rect width="${side}" height="${h}" fill="url(#sl-side)"/><rect x="${w - side}" width="${side}" height="${h}" fill="url(#sl-side)"/>
    <rect x="-4" y="0" width="${w + 8}" height="${cor}" fill="url(#sl-cherrys)"/><rect x="-4" y="0" width="${w + 8}" height="${cor}" fill="url(#sl-boardlit)"/>
    <rect x="-4" y="-4" width="${w + 8}" height="5" fill="url(#sl-cherrys)"/><rect x="-4" y="-4" width="${w + 8}" height="5" fill="rgba(255,225,190,.18)"/>
    <line x1="-2" y1="${cor - 3}" x2="${w + 2}" y2="${cor - 3}" stroke="url(#sl-gold)" stroke-width="1.3" stroke-dasharray="1.4 1"/>
    <rect x="0" y="${h - pl}" width="${w}" height="${pl}" fill="url(#sl-cherrys)"/><rect x="0" y="${h - pl}" width="${w}" height="${pl}" fill="url(#sl-boardlit)"/>
    ${plate(w / 2 - 47, 3, 94, 14, `我的書架${count ? `　${count} ${unit}` : ""}`, "", { s1: 8.4, ls1: 1 })}`;
  return svg(w, h, s);
}

// ——— 你讀過的世界: the floor globe; the map is assets/world.svg (world.js drawMap), the countries read in wine ———
function globeHtml(count, unit) {
  const w = 70, h = 200, r = 28, cx = w / 2, cy = 40, fy = h - 4, lx = r * 1.05, leg = (sx) => `M${cx + sx * lx} ${cy + 4} C${cx + sx * lx * 1.1} ${cy + r * 1.2}, ${cx + sx * lx * .5} ${fy - r * .6}, ${cx + sx * lx * 1.05} ${fy}`;
  const ring = (back) => { const rx = r * 1.22, ry = r * .26, d = back ? `M${cx - rx} ${cy} A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}` : `M${cx - rx} ${cy} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy}`;
    return `<path d="${d}" fill="none" stroke="#3b2312" stroke-width="${r * .17}"/><path d="${d}" fill="none" stroke="url(#sl-cherrys)" stroke-width="${r * .15}"/><path d="${d}" fill="none" stroke="#eadfc0" stroke-width="${r * .085}"/>
      <path d="${d}" fill="none" stroke="#7a6644" stroke-width="${r * .07}" stroke-dasharray=".5 2.2"/>${back ? `<path d="${d}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="${r * .17}"/>` : ""}`; };
  const back = `<ellipse cx="${cx}" cy="${fy}" rx="${r * 1.3}" ry="6" fill="url(#sl-drop)"/>
    ${[-1, 1].map((sx) => `<path d="${leg(sx)}" fill="none" stroke="#2a1608" stroke-width="5.4"/><path d="${leg(sx)}" fill="none" stroke="url(#sl-cherryvs)" stroke-width="4"/>`).join("")}
    <path d="M${cx} ${cy + r * .3} V${fy - 2}" stroke="#2a1608" stroke-width="5"/><path d="M${cx} ${cy + r * .3} V${fy - 2}" stroke="url(#sl-cherryvs)" stroke-width="3.6"/>
    <path d="M${cx - lx * .78} ${fy - r * .55} H${cx + lx * .78}" stroke="#2a1608" stroke-width="4"/><path d="M${cx - lx * .78} ${fy - r * .55} H${cx + lx * .78}" stroke="url(#sl-cherrys)" stroke-width="2.8"/>
    <circle cx="${cx}" cy="${fy - r * .55}" r="3.4" fill="url(#sl-rivet)"/>${ring(true)}
    <g transform="rotate(-23 ${cx} ${cy})"><circle cx="${cx}" cy="${cy}" r="${r + 3.4}" fill="none" stroke="#5a3c12" stroke-width="4.2"/><circle cx="${cx}" cy="${cy}" r="${r + 3.4}" fill="none" stroke="url(#sl-goldd)" stroke-width="3.2"/><circle cx="${cx}" cy="${cy}" r="${r + 3.4}" fill="none" stroke="#5a3c12" stroke-width=".5" stroke-dasharray=".4 2.2"/></g>`;
  const cl = uid("gc"), MW = 4 * r, MH = MW * 504 / 990;
  const front = `<clipPath id="${cl}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><g clip-path="url(#${cl})"><g transform="rotate(-23 ${cx} ${cy})">
      ${[-.6, -.3, 0, .3, .6].map((k) => `<ellipse cx="${cx}" cy="${cy + k * r}" rx="${r * Math.sqrt(1 - k * k)}" ry="${r * .12 * Math.sqrt(1 - k * k)}" fill="none" stroke="rgba(90,70,40,.35)" stroke-width=".4"/>`).join("")}
      ${[.35, .75].map((k) => `<ellipse cx="${cx}" cy="${cy}" rx="${r * k}" ry="${r}" fill="none" stroke="rgba(90,70,40,.3)" stroke-width=".4"/>`).join("")}</g>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(170,130,60,.12)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sl-sphere)"/>
      <ellipse cx="${cx - r * .38}" cy="${cy - r * .45}" rx="${r * .3}" ry="${r * .2}" transform="rotate(-30 ${cx - r * .38} ${cy - r * .45})" fill="url(#sl-shine)"/></g>
    <g transform="rotate(-23 ${cx} ${cy})"><path d="M${cx - 2.2} ${cy - r - 6} h4.4 M${cx - 2.2} ${cy + r + 6} h4.4" stroke="url(#sl-gold)" stroke-width="3"/></g>${ring(false)}
    ${plate(cx - 32, 112, 64, count ? 24 : 15, "你讀過的世界", count ? `${count} ${unit}` : "", { s1: 7.6, s2: 7.4, ls1: .5 })}`;
  // the map between the two drawings: a disc of sea, the map turned with the axis, centred near Vienna
  return `${svg(w, h, back)}<span class="sl-map" style="left:${cx - r}px;top:${cy - r}px;width:${2 * r}px;height:${2 * r}px"><span class="sl-mapin" style="left:${r - .545 * MW}px;top:${r - .3 * MH}px;width:${MW}px;height:${MH}px;transform-origin:${.545 * MW}px ${.3 * MH}px"></span></span>${svg(w, h, front)}`;
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
  let s = `${shade(0, 0, w, h, 3)}${leatherOf(w, h, "#173a29", .82)}<rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="2" fill="none" stroke="url(#sl-gold)" stroke-width=".7"/>`;
  for (const side of [0, 1]) {
    const px = m + side * pw;
    s += `<rect x="${px}" y="${m}" width="${pw}" height="${ph}" fill="#efe6cf"/><rect x="${px}" y="${m}" width="${pw}" height="${ph}" fill="url(#sl-paper)" opacity=".6"/>
      <rect x="${px + (side ? 0 : pw - 10)}" y="${m}" width="10" height="${ph}" fill="url(#sl-side)" opacity="${side ? .35 : .25}"/>`;
    // a small album (the one on the sill) keeps room for its words: three rows of stamps, the head and the foot wider
    const small = w < 90, cols = 3, rows = small ? 3 : 4, gx = pw * .1, gy = ph * (small ? .22 : .16), foot = ph * (small ? .2 : .1), cw = (pw - 2 * gx) / cols, rh = (ph - gy - foot) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const k = side * cols * rows + r * cols + c, sx = px + gx + c * cw + cw * .12, sy = m + gy + r * rh + rh * .08, sw = cw * .76, shh = rh * .84;
      s += `<rect x="${sx}" y="${sy}" width="${sw}" height="${shh}" fill="none" stroke="rgba(120,100,70,.35)" stroke-width=".4"/>`;
      if (k < imgs.length) s += stamp(sx, sy, sw, shh, imgs[k], ((k * 7) % 5 - 2) * .6);
    }
    // each page's head set to fit the page: 郵票冊 on the right, BRIEFMARKEN on the left
    const fit = (len, em, max) => Math.min(max, (pw * .82) / (len * em));
    s += side ? ink(px + pw / 2, m + gy * .72, "郵票冊", { size: fit(3, 1.5, 6), w: 600, ls: fit(3, 1.5, 6) * .4 }, "#6b5a40")
      : ink(px + pw / 2, m + gy * .72, "BRIEFMARKEN", { fam: "Cormorant SC", size: fit(11, .86, 5.2), w: 600, ls: fit(11, .86, 5.2) * .2 }, "#6b5a40");
  }
  s += `<rect x="${w / 2 - 1}" y="${m}" width="2" height="${ph}" fill="rgba(60,40,20,.35)"/>${ink(w - m - pw * .1, h - m - (w < 90 ? ph * .05 : 4), `${count} ${unit}`, { size: w < 90 ? 5.4 : 6.4, w: 600, ls: .3, anchor: "end" }, "#4e4a44")}`;
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
function notebook(w, h, count, unit) {
  const m = 4, pw = (w - 2 * m) / 2, ph = h - 2 * m, marked = Math.min(count, 8);
  let s = `${shade(0, 0, w, h, 3)}<rect width="${w}" height="${h}" rx="3" fill="#1d1410"/><rect width="${w}" height="${h}" rx="3" fill="url(#sl-leather)" opacity=".45"/>
    <rect x="${w * .62}" y="${h - 2}" width="3" height="${h * .18}" fill="#7a1f2e"/>`;
  let k = 0;
  for (const side of [0, 1]) {
    const px = m + side * pw, lines = Math.floor(ph / 6.2) - 3;
    s += `<rect x="${px}" y="${m}" width="${pw}" height="${ph}" fill="#f6efdf"/><rect x="${px + (side ? 0 : pw - 9)}" y="${m}" width="9" height="${ph}" fill="url(#sl-side)" opacity=".22"/>`;
    for (let i = 0; i < lines; i++) {
      const y = m + ph * .2 + i * 6.2, len = pw * (.62 + ((i * 37 + side * 11) % 30) / 100);
      s += count ? `<rect x="${px + pw * .1}" y="${y}" width="${len * .9}" height="1.5" fill="rgba(70,62,50,.32)"/>` : `<rect x="${px + pw * .08}" y="${y + 1}" width="${pw * .84}" height=".5" fill="rgba(90,110,140,.3)"/>`;
      if (count && (i + side * 2) % 3 === 1 && k++ < marked) s += `<path d="M${px + pw * .1} ${y + 2.6} q${len * .2} -.7 ${len * .44} .2 t${len * .4} -.2" fill="none" stroke="rgba(55,55,58,.75)" stroke-width=".8" stroke-linecap="round"/>`;
    }
  }
  s += `<rect x="${w / 2 - .8}" y="${m}" width="1.6" height="${ph}" fill="rgba(60,40,20,.3)"/>${ink(m + pw / 2, m + ph * .12, "劃線本", { size: 7.6, w: 600, ls: 2 }, "#4b4a47")}`;
  if (count) s += ink(w - m - 5, h - m - 4, `${count} ${unit}`, { size: 6.4, w: 400, ls: .3, anchor: "end" }, "#56544f");
  return svg(w, h, s + pencil(w * .78, -16, w * .2, h * .78));
}

// ——— 紀念章: the case open, ivory silk in the lid, the medals earned in the wine velvet; empty, shut ———
const medalCoin = (cx, cy, r) => `<circle cx="${cx + .8}" cy="${cy + 1.6}" r="${r}" fill="rgba(0,0,0,.45)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sl-coin)"/>
  <circle cx="${cx}" cy="${cy}" r="${r * .86}" fill="none" stroke="#8a6220" stroke-width=".6"/><circle cx="${cx}" cy="${cy}" r="${r * .78}" fill="none" stroke="#fff3c4" stroke-width=".4" stroke-dasharray=".6 1.1"/>
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

// ——— 詩箋: the cherry writing box, the letters standing in it, the newest in front with its poem's title (filled in once
// the article is read, wireSalon) and three printed lines; empty, the box alone ———
function writingBox(w, h, count, unit) {
  const front = h * .42, top = h - front, n = Math.min(count, 6);
  let s = `${shade(0, 0, w, h, 2)}<rect x="2" y="${top * .55}" width="${w - 4}" height="${top * .5}" fill="#1a0e07"/>`;
  for (let i = 0; i < n; i++) {
    const sx = 6 + i * 1.6, sy = top * .02 + (n - 1 - i) * 2.2, sw = w - 12 - i * 1.4, rot = (i - n / 2) * .7, last = i === n - 1;
    s += `<g transform="rotate(${rot} ${w / 2} ${top})"><rect x="${sx}" y="${sy}" width="${sw}" height="${top + 4}" fill="${last ? "#f7f0de" : "#ebe1c8"}" stroke="rgba(120,100,70,.35)" stroke-width=".4"/>
      ${last ? `<text class="sl-poem" x="${w / 2}" y="${sy + 9}" text-anchor="middle" font-family="Cormorant SC" font-weight="600" font-size="4.6" letter-spacing=".6" fill="#7a6a50"></text>${[0, 1, 2].map((k) => `<rect x="${w / 2 - sw * (.3 - k * .03)}" y="${sy + 14 + k * 4.4}" width="${sw * (.6 - k * .06)}" height="1.2" fill="rgba(60,50,40,.45)"/>`).join("")}` : ""}</g>`;
  }
  const pw = Math.min(w - 14, 58);
  s += `<rect y="${top}" width="${w}" height="${front}" rx="2" fill="url(#sl-cherryvs)"/><rect y="${top}" width="${w}" height="${front}" rx="2" fill="url(#sl-boardlit)"/>
    <rect x="-1" y="${top - 2}" width="${w + 2}" height="3.4" fill="url(#sl-cherrys)"/><rect x="-1" y="${top - 2}" width="${w + 2}" height="1.2" fill="rgba(255,225,190,.3)"/>
    ${plate(w / 2 - pw / 2, top + front / 2 - 8, pw, 16, count ? `詩箋　${count} ${unit}` : "詩箋", "", { s1: 8, ls1: .8 })}`;
  return svg(w, h, s);
}

// ——— 版畫冊: the blue leather portfolio, gilt title, wine ribbons; the newest print peeping out of it, brown as an etching ———
function portfolio(w, h, img, count, unit) {
  let s = shade(0, 0, w, h, 2);
  if (count) s += `<rect x="${w * .06}" y="${-h * .1}" width="${w * .84}" height="${h * .5}" fill="#ddd0b2" stroke="rgba(120,100,70,.4)" stroke-width=".4" transform="rotate(3 ${w / 2} ${h / 2})"/>
    <g transform="rotate(-5 ${w / 2} ${h / 2})"><rect x="${w * .12}" y="${-h * .3}" width="${w * .72}" height="${h * .7}" fill="#efe5cc" stroke="rgba(120,100,70,.4)" stroke-width=".4"/>
    <rect x="${w * .18}" y="${-h * .25}" width="${w * .6}" height="${h * .4}" fill="#cbb48a"/>
    ${img ? `<image href="${esc(img)}" x="${w * .18}" y="${-h * .25}" width="${w * .6}" height="${h * .4}" preserveAspectRatio="xMidYMid slice" opacity=".62"/>` : ""}
    <rect x="${w * .18}" y="${-h * .25}" width="${w * .6}" height="${h * .4}" fill="#7a5226" opacity=".32"/>
    <rect x="${w * .18}" y="${-h * .25}" width="${w * .6}" height="${h * .4}" fill="none" stroke="rgba(90,70,40,.5)" stroke-width=".5"/></g>`;
  s += `${leatherOf(w, h, "#1b2a44", .8).replace(/rx="3"/g, 'rx="2"')}
    <rect width="${w * .14}" height="${h}" fill="rgba(0,0,0,.28)"/><rect x="${w * .14}" width="1" height="${h}" fill="rgba(255,255,255,.08)"/>
    <rect x="${w * .2}" y="${h * .08}" width="${w * .72}" height="${h * .84}" fill="none" stroke="url(#sl-gold)" stroke-width=".9"/><rect x="${w * .23}" y="${h * .1}" width="${w * .66}" height="${h * .8}" fill="none" stroke="url(#sl-gold)" stroke-width=".35"/>
    ${gilt(w * .56, h * .47, "版畫冊", { size: Math.min(12, w * .13), ls: 3 })}${gilt(w * .56, h * .47 + 10, "RADIERUNGEN", { fam: "Cormorant SC", size: 5.4, w: 600, ls: 1 })}${count ? gilt(w * .56, h * .8, `${count} ${unit}`, { size: 7.4, w: 600, ls: 1 }) : ""}
    <rect x="${w - 3}" y="${h * .46}" width="${w * .16}" height="3.4" fill="#7a1f2e" transform="rotate(8 ${w} ${h * .46})"/><rect x="${w - 3}" y="${h * .5}" width="${w * .12}" height="3" fill="#5a1424" transform="rotate(-10 ${w} ${h * .5})"/>`;
  return svg(w, h, s);
}


// ——— 收進來的: a letter rack on the wall — cherry back, a carved crest, a brass-railed pocket — the clippings starred
// standing in it, a wine ribbon round them, the count cut in its brass; empty, the rack alone ———
function rack(w, h, count, unit) {
  const n = Math.min(count, 5);
  let s = `${shade(4, 8, w - 8, h - 10, 2, .4)}<path d="M6 14 Q${w / 2} -4 ${w - 6} 14 V${h - 6} H6Z" fill="url(#sl-cherryv)"/><path d="M6 14 Q${w / 2} -4 ${w - 6} 14 V${h - 6} H6Z" fill="rgba(0,0,0,.2)"/>
    <path d="M10 16 Q${w / 2} 2 ${w - 10} 16" fill="none" stroke="url(#sl-gold)" stroke-width=".9"/><circle cx="${w / 2}" cy="7" r="2.4" fill="url(#sl-gold)"/>`;
  for (let i = 0; i < n; i++) { // the clippings, folded once, leaning a little this way and that
    const cx = w / 2 + (i - (n - 1) / 2) * 7, rot = (i - (n - 1) / 2) * 5, top = 18 + (i % 2) * 4;
    s += `<g transform="rotate(${rot} ${cx} ${h - 30})"><rect x="${cx - 13}" y="${top}" width="26" height="${h - 34 - top}" fill="${i % 2 ? "#efe6d0" : "#f7f0de"}" stroke="rgba(120,100,70,.4)" stroke-width=".4"/>
      <rect x="${cx - 10}" y="${top + 4}" width="20" height="2.2" fill="rgba(40,30,20,.55)"/>${[0, 1, 2, 3].map((k) => `<rect x="${cx - 10}" y="${top + 9 + k * 3.2}" width="${k === 3 ? 12 : 20}" height=".9" fill="rgba(60,50,40,.35)"/>`).join("")}</g>`;
  }
  if (n) s += `<path d="M${w / 2 - 16} ${h - 36} Q${w / 2} ${h - 32} ${w / 2 + 16} ${h - 36}" stroke="#7a1f2e" stroke-width="2.4" fill="none"/><path d="M${w / 2} ${h - 34} l-4 9 M${w / 2} ${h - 34} l4 8" stroke="#7a1f2e" stroke-width="1.8"/>`;
  s += `<rect x="4" y="${h - 34}" width="${w - 8}" height="28" rx="2" fill="url(#sl-leather)"/><rect x="4" y="${h - 34}" width="${w - 8}" height="28" rx="2" fill="#4a1a10" opacity=".55"/>
    <rect x="3" y="${h - 35}" width="${w - 6}" height="3" fill="url(#sl-gold)"/><rect x="3" y="${h - 7}" width="${w - 6}" height="3" fill="url(#sl-gold)"/>
    ${plate(w / 2 - 26, h - 30, 52, count ? 20 : 13, "收進來的", count ? `${count} ${unit}` : "", { s1: 7, s2: 6.6, ls1: .6 })}`;
  return svg(w, h, s);
}

// ——— the room itself: stucco wall with gilt panelling and a cornice, the tall window onto Viennese roofs between silk
// curtains held back by gilt cords, the parquet ———
const boiserie = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(255,255,255,.16)" stroke="rgba(150,125,90,.35)" stroke-width="1"/>
  <rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" fill="none" stroke="${GOLD}" stroke-width="1.1"/><rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" fill="none" stroke="${GOLD}" stroke-width=".45"/>
  ${[[x + 5, y + 5], [x + w - 5, y + 5], [x + 5, y + h - 5], [x + w - 5, y + h - 5]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2.4" fill="url(#sl-gold)"/>`).join("")}`;
const cornice = `<rect width="${W}" height="36" fill="url(#sl-plaster)" opacity=".9"/><rect y="36" width="${W}" height="6" fill="rgba(90,70,40,.18)"/>
  ${Array.from({ length: 41 }, (_, i) => `<ellipse cx="${i * 10 + 5}" cy="26" rx="3" ry="4" fill="url(#sl-gold)"/><path d="M${i * 10 + 10} 22 v8" stroke="${GOLD}" stroke-width=".8"/>`).join("")}
  ${Array.from({ length: 81 }, (_, i) => `<rect x="${i * 5}" y="10" width="3" height="5" fill="rgba(120,95,60,.22)"/>`).join("")}<rect y="33" width="${W}" height="1.5" fill="url(#sl-gold)"/>`;
function cityReal(gx, gy, gw, gh) { // three layers of roofs in the morning haze, paler and warmer the farther off; brighter than the room
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const hz = gy + gh * .66, layer = (base, hmin, hmax, wmin, wmax, fill, extra = "") => {
    let x = gx - 4, d = `M${gx - 4} ${gy + gh} V${base}`;
    while (x < gx + gw + 4) { const ww = wmin + rnd() * (wmax - wmin), hh = hmin + rnd() * (hmax - hmin), kind = rnd();
      if (kind < .4) d += ` L${x} ${base - hh} L${x + ww / 2} ${base - hh - ww * .35} L${x + ww} ${base - hh}`; // a gable
      else if (kind < .7) d += ` L${x} ${base - hh} L${x + ww * .15} ${base - hh - 3} H${x + ww * .85} L${x + ww} ${base - hh}`; // a mansard
      else d += ` L${x} ${base - hh} H${x + ww * .3} V${base - hh - 4} H${x + ww * .38} V${base - hh} H${x + ww}`; // a chimney
      x += ww; }
    return `<path d="${d} L${gx + gw + 4} ${base} V${gy + gh}Z" fill="${fill}"/>${extra}`; };
  const fog = (y0, y1, a) => `<rect x="${gx}" y="${y0}" width="${gw}" height="${y1 - y0}" fill="rgba(250,242,226,${a})"/>`;
  const spire = `<path d="M${gx + gw * .3} ${hz - 2} L${gx + gw * .3 + 2.2} ${hz - 46} L${gx + gw * .3 + 4.4} ${hz - 2}Z" fill="#d9d2c6"/><path d="M${gx + gw * .66} ${hz - 4} q8 -15 16 0Z" fill="#d6cfc4"/><rect x="${gx + gw * .66 + 7.4}" y="${hz - 25}" width="1.2" height="8" fill="#d6cfc4"/>`;
  return `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="url(#sl-skyr)"/><rect x="${gx}" y="${hz - 50}" width="${gw}" height="60" fill="url(#sl-haze)"/>
    ${spire}${layer(hz + 2, 2, 9, 8, 15, "#dbd2c4")}${fog(hz - 6, hz + 14, .45)}${layer(hz + 22, 4, 12, 10, 18, "#c3b29a")}${fog(hz + 12, hz + 32, .34)}
    ${layer(hz + 46, 6, 16, 12, 22, "#9d8a72")}${fog(hz + 38, hz + 58, .2)}<rect x="${gx}" y="${hz + 56}" width="${gw}" height="${gy + gh - hz - 56}" fill="#8f7c64"/>
    ${Array.from({ length: 4 }, (_, i) => `<rect x="${gx}" y="${hz + 60 + i * 8}" width="${gw}" height=".8" fill="rgba(240,228,205,.35)"/>`).join("")}`;
}
function windowSvg(x, y, w, h) {
  const gx = x + 8, gy = y + 8, gw = w - 16, gh = h - 16, mid = gx + gw / 2;
  const glare = `<path d="M${gx} ${gy + gh * .55} L${gx + gw * .7} ${gy} H${gx + gw * .86} L${gx} ${gy + gh * .72}Z" fill="rgba(255,255,255,.12)"/><path d="M${gx + gw * .2} ${gy + gh} L${gx + gw} ${gy + gh * .3} V${gy + gh * .38} L${gx + gw * .3} ${gy + gh}Z" fill="rgba(255,255,255,.06)"/>`;
  const bar = (bx, by, bw, bh) => `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#f2ece0"/><rect x="${bx}" y="${by + bh - .8}" width="${bw}" height=".8" fill="rgba(80,60,30,.25)"/><rect x="${bx}" y="${by}" width="${bw}" height=".6" fill="rgba(255,255,255,.8)"/>`;
  return `<rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" fill="url(#sl-glowv)"/><rect x="${x - 4}" y="${y - 4}" width="${w + 8}" height="${h + 8}" fill="#d9cdb8"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f4eee2"/>
    <rect x="${x + w - 3}" y="${y}" width="3" height="${h}" fill="rgba(90,70,40,.18)"/>
    ${cityReal(gx, gy, gw, gh)}${glare}
    ${bar(mid - 2, gy, 4, gh)}${[.24, .46, .69].map((k) => bar(gx, gy + gh * k - 1.5, gw, 3)).join("")}
    <rect x="${gx}" y="${gy}" width="${gw}" height="4" fill="rgba(60,40,20,.16)"/><rect x="${gx}" y="${gy}" width="3" height="${gh}" fill="rgba(60,40,20,.1)"/>
    <rect x="${x - 7}" y="${y + h}" width="${w + 14}" height="9" fill="url(#sl-plaster)"/><rect x="${x - 7}" y="${y + h}" width="${w + 14}" height="1" fill="rgba(255,255,255,.9)"/><rect x="${x - 7}" y="${y + h + 9}" width="${w + 14}" height="4" fill="url(#sl-aoDown)"/>`;
}
// A curtain gathered at its waist by a gilt cord. The cord goes round the gathered silk — it bows down across the front
// as a band round a column does seen from a little above — and runs to a rosette on the wall, its tassel hanging there.
function drape(x, y, w, h, flip) {
  const tie = y + h * .58, waist = flip ? x + w * .62 : x + w * .38, out = flip ? x + w : x, f = flip ? -1 : 1;
  const folds = Array.from({ length: 5 }, (_, i) => { const fx = x + (i + .5) * w / 5; return `<path d="M${fx} ${y} Q${fx + f * 4} ${tie - 30} ${flip ? x + w * .7 : x + w * .3} ${tie} Q${fx - f * 3} ${tie + 60} ${fx} ${y + h}" fill="none" stroke="rgba(120,90,40,.28)" stroke-width="2.4"/>`; }).join("");
  const d = flip ? `M${x} ${y} H${x + w} V${y + h} H${x + 4} Q${x + w * .55} ${tie + 40} ${waist} ${tie} Q${x + w * .2} ${tie - 70} ${x} ${y + 40}Z`
    : `M${x} ${y} H${x + w} V${y + 40} Q${x + w * .8} ${tie - 70} ${waist} ${tie} Q${x + w * .45} ${tie + 40} ${x + w - 4} ${y + h} H${x}Z`;
  const id = uid("dr"), band = `M${out - f * 1} ${tie - 3} Q${(out + waist) / 2} ${tie + 5.5} ${waist + f * 1.5} ${tie - 1.5}`;
  const ros = out - f * 2, tx = (out + waist) / 2 - f * 3;
  return `<path d="${d}" fill="url(#sl-silk)"/><clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${folds}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sl-side)" opacity=".25"/>
      <path d="M${x} ${tie - 7} H${x + w}" stroke="rgba(90,60,20,.18)" stroke-width="6"/></g>
    <path d="${band}" stroke="rgba(70,45,10,.55)" stroke-width="4.2" fill="none" stroke-linecap="round"/><path d="${band}" stroke="url(#sl-gold)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="${band}" stroke="rgba(255,240,190,.55)" stroke-width=".7" fill="none" stroke-dasharray="1.2 1.4" transform="translate(0 -.6)"/>
    <circle cx="${ros}" cy="${tie - 3}" r="3.6" fill="url(#sl-gold)"/><circle cx="${ros}" cy="${tie - 3}" r="1.6" fill="url(#sl-rivet)"/>
    <path d="M${tx} ${tie + 3} q${f * .6} 6 0 11" stroke="url(#sl-gold)" stroke-width="1.1" fill="none"/>
    <path d="M${tx - 2.4} ${tie + 16} q2.4 -3.6 4.8 0 l1.2 12 h-7.2z" fill="url(#sl-gold)"/><path d="M${tx - 3.2} ${tie + 28} h6.4" stroke="#8f6522" stroke-width="1.4" stroke-dasharray=".8 .6"/>`;
}
const WALL = (wh = 400) => svg(W, H, `${cornice}${boiserie(150, 48, 244, 262)}${boiserie(150, 322, 244, 120)}
  <rect y="598" width="${W}" height="14" fill="url(#sl-plaster)"/><rect y="598" width="${W}" height="1.2" fill="url(#sl-gold)"/><rect y="612" width="${W}" height="3" fill="rgba(60,40,20,.3)"/>
  ${windowSvg(24, 58, 98, wh)}
  <rect x="4" y="44" width="140" height="16" fill="url(#sl-gold)"/><rect x="4" y="44" width="140" height="16" fill="url(#sl-brush)"/><path d="M4 60 Q74 84 144 60" fill="url(#sl-silk)"/><path d="M4 60 Q74 84 144 60" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
  ${drape(4, 60, 30, 548, false)}${drape(114, 60, 30, 548, true)}`);
// The morning light from the window: a pale band across the wall and a patch on the parquet (no blend modes).
// The realistic pass: one light, the window at the upper left. The wall is brightest by it and falls off to the right;
// the window lays its panes on the parquet and a streak of reflection; every piece casts its shadow right and down,
// and stands on a dark contact shadow; the corners, the cornice and the foot of the wall are a little darker.
function quad(P, u0, u1, v0, v1) { const at = (u, v) => [P[0][0] + (P[1][0] - P[0][0]) * u + (P[2][0] + (P[3][0] - P[2][0]) * u - P[0][0] - (P[1][0] - P[0][0]) * u) * v, P[0][1] + (P[2][1] - P[0][1]) * v];
  return [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)].map((p) => p.map((n) => n.toFixed(1)).join(" ")).join(" L"); }
const contact = (x, y, rx, ry = 2.6) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#sl-contact)"/>`;
const cast = (pts, a = 1) => `<path d="M${pts}Z" fill="url(#sl-cast)" opacity="${Math.min(1, a * 1.25)}"/>`;
const LIGHT = () => {
  const patch = [[66, 652], [150, 652], [138, 830], [312, 830]]; // the window's light on the floor: top left, top right, bottom left, bottom right
  const panes = [[0, .47], [.53, 1]].flatMap(([u0, u1]) => [[0, .22], [.27, .45], [.5, .67], [.72, 1]].map(([v0, v1]) => `<path d="M${quad(patch, u0, u1, v0, v1)}Z" fill="url(#sl-patch)"/>`)).join("");
  return svg(W, H, `<rect width="${W}" height="615" fill="url(#sl-aoR)" opacity=".55"/><ellipse cx="76" cy="190" rx="170" ry="270" fill="url(#sl-glowv)" opacity=".55"/>
    <rect y="42" width="${W}" height="22" fill="url(#sl-aoDown)"/><rect width="16" height="615" fill="url(#sl-aoL)"/><rect x="380" width="22" height="830" fill="url(#sl-aoR)"/>
    <rect y="584" width="${W}" height="14" fill="url(#sl-aoUp)" opacity=".6"/>
    <path d="M193 330 L214 352 V614 H193Z" fill="url(#sl-aoL)" opacity=".9"/><path d="M144 80 L160 96 V606 H144Z" fill="url(#sl-aoL)" opacity=".7"/><path d="M394 312 L402 320 V620 H394Z" fill="url(#sl-aoL)" opacity=".8"/><rect y="615" width="${W}" height="34" fill="url(#sl-aoDown)"/><rect y="615" width="${W}" height="2" fill="rgba(20,10,2,.45)"/>
    <path d="M${quad(patch, -.06, 1.06, -.04, 1)}Z" fill="url(#sl-bloom)"/>${panes}<path d="M44 645 H118 L150 830 H40Z" fill="url(#sl-streak)"/>
    ${cast("197 618 L197 640 L240 662 L232 636", .9)}${cast("12 640 L197 640 L232 660 L46 660", .8)}${contact(105, 641, 98, 3.2)}
    ${cast("396 620 L402 620 L402 652 L410 652", 1)}${cast("270 620 L394 620 L420 640 L300 640", .8)}${contact(332, 621, 64, 3)}
    ${cast("200 648 L262 648 L318 690 L236 690", .55)}${contact(200, 648, 6, 3)}${contact(262, 648, 6, 3)}${contact(231, 646, 5, 2.6)}<ellipse cx="300" cy="704" rx="22" ry="5" fill="rgba(30,14,4,.16)"/>
    ${cast("16 788 L100 788 L190 816 L76 822", .7)}${contact(16, 788, 7, 3)}${contact(100, 788, 7, 3)}${contact(62, 782, 5, 2.6)}<path d="M18 730 L100 726 L176 790 L80 800Z" fill="rgba(30,14,4,.12)"/>
    ${cast("290 784 L402 784 L402 822 L330 822", .7)}${contact(291, 786, 7, 3)}${contact(389, 786, 7, 3)}${contact(310, 776, 5)}${contact(370, 776, 5)}`);
};
const FEET = () => svg(180, 12, `<ellipse cx="90" cy="9" rx="96" ry="4" fill="url(#sl-drop)"/><rect x="8" y="0" width="12" height="9" rx="3" fill="url(#sl-cherrys)"/><rect x="160" y="0" width="12" height="9" rx="3" fill="url(#sl-cherrys)"/>`);

// ——— the crate: #/records itself (records.js crateHtml), its links made plain, scaled down onto the floor. In the room the
// brass reads 唱片櫃 and the count in large letters; as the camera arrives they give way to the page's own Latin. ———
function crateCopy(list, count, unit) {
  const zh = `<span class="sl-zh"><span class="sc-cut">唱片櫃</span>${count ? `<span class="sc-cut n">${count} ${unit}</span>` : ""}</span>`;
  const html = crateHtml(list).replace(/<(\/?)(?:a|button)\b/g, "<$1span")
    .replace(/(<span class="sc-brass cr-plate">)(<span class="sc-cut">[^<]*<\/span><span class="sc-cut n">[^<]*<\/span>)(<\/span>)/, `$1${zh}<span class="sl-de">$2</span>$3`);
  return `<span class="sl-rp" aria-hidden="true" inert><span class="sc-scene crate-scene">${html}</span></span>`;
}

// ——— the furniture the four on the floor and in the case stand on: the easel, the bergère, the glazed lower part of
// the bookcase, the little stand on the sill ———
const wood = (d, wdt, dark = "#2a1608") => `<path d="${d}" fill="none" stroke="${dark}" stroke-width="${wdt + 1.4}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#sl-cherryvs)" stroke-width="${wdt}" stroke-linecap="round"/>`;
function EASEL() { // box 4..112 × 572..791
  return svg(108, 219, `<ellipse cx="54" cy="215" rx="54" ry="5" fill="url(#sl-drop)"/>${wood("M54 72 L58 210", 3.2)}${wood("M54 70 L12 216", 4.4)}${wood("M54 70 L96 216", 4.4)}
    ${wood("M22 186 H86", 2.6)}<rect x="4" y="150" width="100" height="7" fill="url(#sl-cherrys)"/><rect x="4" y="150" width="100" height="7" fill="url(#sl-boardlit)"/><rect x="4" y="157" width="100" height="3" fill="rgba(0,0,0,.35)"/>
    <rect x="48" y="64" width="12" height="9" rx="2" fill="url(#sl-cherrys)"/><circle cx="54" cy="200" r="2" fill="url(#sl-rivet)"/>`);
}
function ARMCHAIR() { // box 278..402 × 626..791
  const gd = (d, w) => `<path d="${d}" fill="none" stroke="#6e4c16" stroke-width="${w + 1.2}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#sl-goldd)" stroke-width="${w}" stroke-linecap="round"/>`;
  return svg(124, 165, `<ellipse cx="62" cy="160" rx="64" ry="6" fill="url(#sl-drop)"/>
    <ellipse cx="62" cy="44" rx="42" ry="40" fill="url(#sl-goldd)"/><ellipse cx="62" cy="45" rx="36" ry="34" fill="url(#sl-velvet)"/><ellipse cx="62" cy="45" rx="36" ry="34" fill="#6e1a2c" opacity=".6"/>
    <ellipse cx="62" cy="45" rx="36" ry="34" fill="url(#sl-topshade)" opacity=".6"/><ellipse cx="54" cy="32" rx="16" ry="12" fill="url(#sl-shine)" opacity=".15"/><ellipse cx="62" cy="45" rx="36" ry="34" fill="url(#sl-vel)"/>${[[50, 30], [74, 30], [62, 44], [44, 50], [80, 50], [62, 60]].map(([x, y]) => `<path d="M${x} ${y} q3 3 6 7 M${x} ${y} q-3 3 -6 7" fill="none" stroke="rgba(20,0,6,.13)" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="1.3" fill="#3a0a16"/><circle cx="${x - .4}" cy="${y - .5}" r=".6" fill="rgba(255,190,205,.5)"/>`).join("")}
    <path d="M52 4 q10 -8 20 0" fill="none" stroke="url(#sl-gold)" stroke-width="2.6"/><circle cx="62" cy="3" r="3" fill="url(#sl-gold)"/>
    <path d="M18 92 L106 92 L120 120 L4 120 Z" fill="url(#sl-velvet)"/><path d="M18 92 L106 92 L120 120 L4 120 Z" fill="#7a2034" opacity=".55"/><path d="M18 92 L106 92 L120 120 L4 120 Z" fill="url(#sl-boardlit)" opacity=".5"/><path d="M18 92 L106 92 L120 120 L4 120 Z" fill="url(#sl-vel)"/><path d="M4 120 L120 120" stroke="rgba(255,190,205,.35)" stroke-width="1.2"/>
    <path d="M4 120 L120 120 L118 134 L6 134 Z" fill="#5a1424"/><path d="M4 120 L120 120 L118 134 L6 134 Z" fill="url(#sl-velvet)" opacity=".5"/><rect x="5" y="133" width="114" height="5" rx="2" fill="url(#sl-goldd)"/>
    ${gd("M22 70 Q4 74 6 98 L4 120", 5)}${gd("M102 70 Q120 74 118 98 L120 120", 5)}<ellipse cx="7" cy="96" rx="5" ry="3.4" fill="#7a2034"/><ellipse cx="117" cy="96" rx="5" ry="3.4" fill="#7a2034"/>
    ${gd("M12 138 Q9 150 13 160", 4.6)}${gd("M112 138 Q115 150 111 160", 4.6)}${gd("M30 136 L32 150", 3)}${gd("M94 136 L92 150", 3)}`);
}
// the little brass book stand the album leans on, on the sill
const STAND = () => svg(72, 10, `<rect x="2" y="2" width="68" height="3" rx="1" fill="url(#sl-brass)"/><rect x="2" y="2" width="68" height=".7" fill="rgba(255,250,225,.9)"/><rect x="2" y="5" width="68" height="3" fill="rgba(40,25,5,.3)"/>`);
const VITRINE_IN = () => svg(104, 100, `<rect width="104" height="100" fill="url(#sl-veneer)"/><rect width="104" height="100" fill="#120804" opacity=".7"/><rect width="104" height="100" fill="url(#sl-topshade)"/><rect x="0" y="90" width="104" height="10" fill="url(#sl-cherrys)"/>`);
const VITRINE_GLASS = () => svg(104, 100, `<rect x="2" y="2" width="100" height="96" fill="none" stroke="url(#sl-cherrys)" stroke-width="5"/><rect x="2" y="2" width="100" height="96" fill="none" stroke="url(#sl-gold)" stroke-width=".7"/>
  <path d="M6 6 L44 6 L6 52Z" fill="rgba(255,255,255,.12)"/><path d="M30 6 L52 6 L6 64 V40Z" fill="rgba(255,255,255,.1)"/><path d="M70 6 L78 6 L6 96 V86Z" fill="rgba(255,255,255,.08)"/><path d="M60 94 L98 40 L98 60 L76 94Z" fill="rgba(255,255,255,.07)"/><rect x="92" y="46" width="4" height="10" rx="1" fill="url(#sl-brass)"/>`);

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
  // x, y, w, h of each drawing, the drawing, and how it is turned to the eye of someone standing in the room: the
  // portfolio leans back on the easel, the album on its stand, the notebook lies on the seat
  const draw = {
    museum: [146, 50, 252, 250, hang(d.museum, n("museum"), u("museum"))],
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
  const deco = (x, y, w, h, html) => `<b class="sl-deco" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${html}</b>`;
  const bird = () => { if (!d.bird) return ""; const rb = roomBird(), [bx, bt, bs] = BIRD; // its shadow on the sill, then the bird (nest.js roomBird)
    return deco(100, 292, 40, 10, svg(40, 10, `<ellipse cx="20" cy="5" rx="12" ry="2.2" fill="url(#sl-contact)"/><ellipse cx="27" cy="5.5" rx="13" ry="2.4" fill="rgba(30,14,4,.18)"/>`))
      + link("nest", "#/nest", rb.label, box("nest", [bx, bt, bs, bs, rb.html])); };
  return `<section class="salon" aria-label="收藏的角落">${DEFS}<div class="sl-cam"><div class="sl-stage">
      <i class="sl-wall"></i><i class="sl-floor"></i>${deco(0, 0, W, H, WALL(238))}${deco(0, 0, W, H, LIGHT())}
      ${obj("museum")}${deco(12, FLOOR, 180, 12, FEET())}${obj("records")}${obj("world")}${obj("shelf")}${obj("poems")}${obj("list")}
      ${deco(281, 506, 104, 100, VITRINE_IN())}${obj("medals")}${deco(281, 506, 104, 100, VITRINE_GLASS())}${deco(22, 296, 72, 10, STAND())}${obj("stamps")}
      ${deco(4, 572, 108, 219, EASEL())}${deco(278, 626, 124, 165, ARMCHAIR())}${obj("prints")}${obj("marks")}${bird()}
      ${deco(0, 0, W, 830, svg(W, 830, `<rect width="${W}" height="830" fill="url(#sl-aoR)" opacity=".35"/><rect y="700" width="${W}" height="130" fill="url(#sl-aoUp)" opacity=".7"/>`))}<i class="sl-vig"></i></div></div><i class="sl-veil"></i></section>`;
}

// The camera: a straight move in — the scale grows geometrically about the fixed point of the final transform, so the
// thing does not first slide sideways. Keyframes at every twentieth of the time, eased in and out, run as one animation.
const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function moveIn(room, a) {
  const cam = room.querySelector(".sl-cam"), R = cam.getBoundingClientRect(), vw = document.documentElement.clientWidth;
  const navH = document.querySelector(".nav")?.getBoundingClientRect().height || 58, vh = innerHeight - navH;
  let S, Tx, Ty;
  if (a.dataset.k === "records") { // the copy of the page onto the page: its top left to the screen's, its width to the screen's
    const C = a.querySelector(".sl-rp").getBoundingClientRect();
    S = vw / C.width; Tx = -R.left - S * (C.left - R.left); Ty = -R.top - S * (C.top - R.top);
  } else { // the thing to the middle of the screen, as large as the screen allows, the room still filling the screen
    const D = a.querySelector(".sl-draw").getBoundingClientRect();
    S = Math.max(1.2, Math.min(3.4, (vw * .94) / D.width, (vh * .55) / D.height));
    Tx = vw / 2 - R.left - S * (D.left + D.width / 2 - R.left); Ty = vh * .46 - R.top - S * (D.top + D.height / 2 - R.top);
    Tx = Math.min(-R.left, Math.max(vw - R.left - S * R.width, Tx));
    if (S * R.height >= vh) Ty = Math.min(-R.top, Math.max(vh - R.top - S * R.height, Ty));
  }
  const Px = Tx / (1 - S), Py = Ty / (1 - S), N = 20, ms = a.dataset.k === "records" ? 1000 : 820;
  const frames = Array.from({ length: N + 1 }, (_, i) => ({ transform: `translate(${Px.toFixed(2)}px, ${Py.toFixed(2)}px) scale(${Math.pow(S, ease(i / N)).toFixed(4)}) translate(${(-Px).toFixed(2)}px, ${(-Py).toFixed(2)}px)` }));
  room.classList.add("zoom");
  const run = cam.animate(frames, { duration: ms, fill: "forwards" });
  room.querySelector(".sl-veil").animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms * .6, easing: "ease-out", fill: "forwards" });
  if (a.dataset.k === "records") { // the brass: the room's large 唱片櫃 gives way to the page's Schallplatten
    const zh = a.querySelector(".sl-zh"), de = a.querySelector(".sl-de"), br = a.querySelector(".cr-plate"), o = { duration: ms, fill: "forwards" };
    zh?.animate([{ opacity: 1 }, { opacity: 1, offset: .72 }, { opacity: 0 }], o);
    de?.animate([{ opacity: 0 }, { opacity: 0, offset: .72 }, { opacity: 1 }], o);
    br?.animate([{ transform: "scale(1.16)" }, { transform: "scale(1.16)", offset: .6 }, { transform: "none" }], { ...o, easing: "ease-in-out" });
  }
  return run.finished;
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
  const map = room.querySelector(".sl-mapin");
  if (map) drawMap(map, { read: world }).then(() => map.querySelector("p")?.remove()).catch(() => {}); // no map to be had: the plain sea
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
    if (busy) { e.preventDefault(); return; }
    if (calm() || !a.animate) return; // the link opens its page at once
    e.preventDefault();
    busy = true;
    const go = () => { location.hash = a.getAttribute("href"); };
    moveIn(room, a).then(go, go);
  });
}

