// The gramophone on the record cabinet (the owner, 2026-11-23: 「收藏裡唱片我想要是唱片機的模樣」; of the three samples in
// 流程盤點/修改包/收藏品_黑膠/樣張_唱片機_1123 he took 甲, the horn gramophone). It stands on the top of the record cabinet
// in 收藏's room (records.js phonoCabinetHtml, put in the room at .44 by salon.js crateCopy) where #/records has its crate:
// that page stays as it was (the owner, 2026-11-23: 「唱片點進去是要和原本的一樣」), and the camera's move in dissolves the
// one into the other. On the platter the crate's front record — the newest read, or the one brought to the front since
// (records.js wireCrate) — its label as on the turntable inside (#/records/<date>, records.js discHtml):
// ROTKEHLCHEN, the piece, the composer. None read yet, the bare felt and the spindle.
// One light, the window at the upper left; the shadows fall right and down, a contact shadow under each foot; no SVG
// filter, no blend mode. Wood, felt and the gilt's wear are assets/shelf/'s pictures; the gilt bronze is cut with
// cabinet.js carve and the mouldings with its mould, the same tools as the cabinet below and the room. The camera: from
// the front and a little above (30°) — what lies flat (the platter, the lid) a flattened ellipse, the upright faces
// square on, as the cabinet's. Every id begins cb-, so the room's copy makes them its own.
import { esc } from "./util.js";
import { carve, capital, base, mould, fuseGilt } from "./cabinet.js";

const TEX = "assets/shelf/";
// a number to a tenth, as short as it goes (12.0 → 12, 0.5 → .5): the drawing is some thousands of them
const f1 = (n) => String(+(+n).toFixed(1)).replace(/^(-?)0\./, "$1.");
// a run of points on the screen: the first where it is, each after it a step from the one before, the steps counted in
// tenths so that they add up to the points exactly; closed (a polygon) or open (a line)
function poly(pts, close = true) {
  let d = "", x0 = 0, y0 = 0;
  pts.forEach((p, i) => {
    const x = Math.round(+(+p[0]).toFixed(1) * 10), y = Math.round(+(+p[1]).toFixed(1) * 10);
    d += i ? `${i > 1 ? " " : ""}${f1((x - x0) / 10)} ${f1((y - y0) / 10)}` : `M${f1(x / 10)} ${f1(y / 10)}l`;
    x0 = x; y0 = y;
  });
  return d.replace(/ -/g, "-") + (close ? "z" : "");
}
const E = (30 * Math.PI) / 180, SE = Math.sin(E), CE = Math.cos(E);
const W = 402, H = 560; // the drawing: the page's width, standing on the cabinet's top (its foot 10 px into the top's band)
// ——— 3D: x to the right, y up, z toward the eye ———
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => mul(a, 1 / (Math.hypot(...a) || 1));
const VIEW = [0, SE, CE], FWD = [0, -SE, -CE]; // toward the eye; into the picture (the larger, the farther)
const LIGHT = norm([-0.72, 0.55, 0.42]); // the window, upper left and a little in front
const OX = 188, OY = 510; // the machine's middle, at its foot on the cabinet's top
const P = (p) => [OX + p[0], OY - p[1] * CE + p[2] * SE]; // a point in the room to the drawing
let N = 0;
const uid = (p) => `cb-ph${p}${++N}`;

// ——— the gradients and photographs, ids cb-… (salon.js crateCopy makes the room's copy cbr-…) ———
const pat = (id, img, s, sy = 1) => `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${s}" height="${s}"${sy !== 1 ? ` patternTransform="scale(1 ${sy.toFixed(3)})"` : ""}><image href="${TEX}${img}" width="${s}" height="${s}" preserveAspectRatio="none"/></pattern>`;
const stops = (st) => st.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("");
const lin = (id, st, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops(st)}</linearGradient>`;
const rad = (id, st, cx = ".5", cy = ".5", r = ".5") => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(st)}</radialGradient>`;
const DEFS = `<defs>${pat("cb-ph-wh", "gen_wood.png", 150)}${pat("cb-ph-wv", "gen_wood_v.png", 150)}${pat("cb-ph-wt", "gen_wood.png", 180, SE)}${pat("cb-ph-vel", "velvet.jpg", 70, SE)}
  ${lin("cb-ph-gv", [["0", "rgba(255,238,204,.5)"], [".3", "rgba(255,238,204,.12)"], [".62", "rgba(0,0,0,.18)"], ["1", "rgba(0,0,0,.62)"]])}
  ${lin("cb-ph-gc", [["0", "rgba(0,0,0,.66)"], [".45", "rgba(0,0,0,.22)"], [".85", "rgba(255,230,190,.16)"], ["1", "rgba(255,230,190,.3)"]])}
  ${lin("cb-ph-gf", [["0", "rgba(255,232,196,.2)"], ["1", "rgba(0,0,0,.16)"]])}
  ${lin("cb-ph-top", [["0", "rgba(0,0,0,.42)"], [".5", "rgba(255,232,196,.05)"], ["1", "rgba(255,232,196,.16)"]])}
  ${lin("cb-ph-topx", [["0", "rgba(255,236,200,.16)"], [".45", "rgba(255,236,200,0)"], ["1", "rgba(0,0,0,.32)"]], 1, 0)}
  ${lin("cb-ph-front", [["0", "rgba(255,228,190,.16)"], [".35", "rgba(255,228,190,0)"], ["1", "rgba(0,0,0,.42)"]], .3, 1)}
  ${lin("cb-ph-frontx", [["0", "rgba(255,228,190,.1)"], [".5", "rgba(0,0,0,0)"], ["1", "rgba(0,0,0,.3)"]], 1, 0)}
  ${lin("cb-ph-brass", [["0", "#f3d78e"], [".32", "#c39445"], [".52", "#e8c56c"], [".78", "#9a6e26"], ["1", "#c99a3c"]], .2, 1)}
  ${lin("cb-ph-nk", [["0", "#2c2c2c"], [".16", "#9a9a9a"], [".3", "#f4f4f4"], [".42", "#b4b4b4"], [".7", "#5c5c5c"], [".86", "#8e8e8e"], ["1", "#262626"]], 1, 0)}
  ${lin("cb-ph-br", [["0", "#3a2408"], [".16", "#a8782c"], [".3", "#fbe7a8"], [".42", "#d4a84e"], [".7", "#7a5218"], [".86", "#b88a3a"], ["1", "#2e1c06"]], 1, 0)}
  ${lin("cb-ph-ebon", [["0", "rgba(0,0,0,.7)"], [".24", "rgba(255,226,190,.22)"], [".38", "rgba(255,226,190,.04)"], [".78", "rgba(0,0,0,.36)"], ["1", "rgba(0,0,0,.78)"]], 1, 0)}
  ${rad("cb-ph-ct", [["0", "rgba(12,4,0,.9)"], [".55", "rgba(12,4,0,.4)"], ["1", "rgba(12,4,0,0)"]])}
  ${rad("cb-ph-ball", [["0", "#ffffff"], [".16", "#f0f0f0"], [".45", "#8c8c8c"], [".8", "#2e2e2e"], ["1", "#5a5a5a"]], ".36", ".3", ".72")}
  ${rad("cb-ph-gball", [["0", "#fff6d2"], [".2", "#efcf7e"], [".55", "#a87a2c"], [".85", "#4a3008"], ["1", "#7a5418"]], ".36", ".3", ".72")}
  ${rad("cb-ph-sheen", [["0", "rgba(255,255,255,0)"], [".38", "rgba(255,255,255,0)"], [".5", "rgba(255,255,255,.13)"], [".85", "rgba(255,255,255,.2)"], ["1", "rgba(255,255,255,.04)"]], ".5", ".5", ".5")}
  ${rad("cb-ph-lab", [["0", "#2a0a12"], [".08", "#5e1c2c"], [".14", "#6e2536"], ["1", "#6e2536"]])}
  ${rad("cb-ph-mica", [["0", "rgba(255,246,222,.55)"], [".4", "rgba(190,160,110,.35)"], ["1", "rgba(60,40,20,.55)"]], ".38", ".34", ".7")}</defs>`;

// ——— the carpenter's pieces ———
const INK = { wh: "url(#cb-ph-wh)", wv: "url(#cb-ph-wv)" }; // the mouldings' wood (cabinet.js mould): rails across, stiles up
const frame = (x, y, w, h, prof, k = 1) => mould(+f1(x), +f1(y), +f1(w), +f1(h), prof, "wood", { ink: INK, k });
// a horizontal run of moulding seen from the front: bands from the top down, [height, kind], each the wood and its light
function band(x, y, w, prof, fill = "url(#cb-ph-wh)") {
  let s = "", yy = y;
  for (const [h, kd] of prof) { s += `<rect x="${f1(x)}" y="${f1(yy)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}"/><rect x="${f1(x)}" y="${f1(yy)}" width="${f1(w)}" height="${f1(h)}" fill="url(#cb-ph-g${kd})"/>`; yy += h; }
  return s + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(yy - y)}" fill="url(#cb-ph-frontx)"/>`;
}
// a flat face of the case: the wood, the light across it from the upper left
const face = (x, y, w, h, fill = "url(#cb-ph-wh)") => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}"/><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="url(#cb-ph-front)"/>`;
// a top seen from above: the grain foreshortened, darker at the back, the window's light on its left
const top = (x, y, w, h, fill = "url(#cb-ph-wt)") => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}"/><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="url(#cb-ph-top)"/><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="url(#cb-ph-topx)"/>`
  + (h > 8 ? `<path d="M${f1(x + .5)} ${f1(y + h)} V${f1(y + .6)} H${f1(x + w - .5)} V${f1(y + h)}" fill="none" stroke="rgba(10,3,0,.5)" stroke-width="1"/><path d="M${f1(x + 1.4)} ${f1(y + 1.4)} H${f1(x + w - 1.4)}" stroke="rgba(255,232,196,.22)" stroke-width=".8"/><path d="M${f1(x + 1.4)} ${f1(y + 1.4)} V${f1(y + h)}" stroke="rgba(255,232,196,.14)" stroke-width=".8"/>` : "");
// a raised field: a groove round it, its bevels lit above left and dark below right
function field(x, y, w, h, fill = "url(#cb-ph-wh)", b = 5) {
  return `<rect x="${f1(x - 1.6)}" y="${f1(y - 1.6)}" width="${f1(w + 3.2)}" height="${f1(h + 3.2)}" fill="rgba(10,3,0,.62)"/><rect x="${f1(x - .6)}" y="${f1(y - .6)}" width="${f1(w + 1.2)}" height="${f1(h + 1.2)}" fill="rgba(255,222,184,.14)"/>
    <rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}"/>${frame(x, y, w, h, [[b, "f"]], 1.6)}<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="url(#cb-ph-front)"/>`;
}
const contact = (x, y, rx, ry, a = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="url(#cb-ph-ct)" opacity="${a}"/>`;
// a soft shadow without a blur: the outline laid three times from dark to faint, falling right and down — the outline
// written once and used three times
function soft(d, dx, dy, a = 1) {
  const id = uid("s");
  return `<defs><path id="${id}" d="${d}"/></defs>` + [[1.25, .07], [1, .1], [.72, .14]].map(([k, o]) => `<use href="#${id}" fill="rgba(25,10,0,${(o * a).toFixed(3)})" transform="translate(${f1(dx * k)} ${f1(dy * k)})"/>`).join("");
}

// ——— metal: a tube (the tonearm, a shaft) lit across, a ball, a vertical cylinder (platter, pillar foot) ———
const METAL = { nk: ["#262626", "#8e8e8e", "#f4f4f4", "#b8b8b8", "#5a5a5a", "#202020"], br: ["#2e1c06", "#a8782c", "#fbe7a8", "#d4a84e", "#7a5218", "#2a1804"] };
function tube(a, b, ra, rb, m = "br") {
  const A = P(a), B = P(b), dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
  let nx = -dy / L, ny = dx / L; if (nx * -0.7 + ny * -0.7 < 0) { nx = -nx; ny = -ny; } // the lit side toward the upper left
  const id = uid("t"), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, rr = (ra + rb) / 2, c = METAL[m];
  const pts = [[A[0] + nx * ra, A[1] + ny * ra], [B[0] + nx * rb, B[1] + ny * rb], [B[0] - nx * rb, B[1] - ny * rb], [A[0] - nx * ra, A[1] - ny * ra]];
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f1(mx + nx * rr)}" y1="${f1(my + ny * rr)}" x2="${f1(mx - nx * rr)}" y2="${f1(my - ny * rr)}"><stop offset="0" stop-color="${c[0]}"/><stop offset=".12" stop-color="${c[1]}"/><stop offset=".26" stop-color="${c[2]}"/><stop offset=".42" stop-color="${c[3]}"/><stop offset=".78" stop-color="${c[4]}"/><stop offset="1" stop-color="${c[5]}"/></linearGradient>
    <path d="${poly(pts)}" fill="url(#${id})"/>`;
}
const ball = (c, r, m = "cb-ph-gball") => { const [x, y] = P(c); return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#${m})"/>`; };
// a vertical cylinder standing at c (its foot), r across, h tall: the front of its side and its top
function cyl(c, r, h, side = "url(#cb-ph-nk)", topFill = "url(#cb-ph-nk)") {
  const [tx, ty] = P([c[0], c[1] + h, c[2]]), [bx, by] = P(c), ry = r * SE;
  return `<path d="M${f1(tx - r)} ${f1(ty)} A${f1(r)} ${f1(ry)} 0 0 0 ${f1(tx + r)} ${f1(ty)} L${f1(bx + r)} ${f1(by)} A${f1(r)} ${f1(ry)} 0 0 1 ${f1(bx - r)} ${f1(by)}Z" fill="${side}"/>
    <ellipse cx="${f1(tx)}" cy="${f1(ty)}" rx="${f1(r)}" ry="${f1(ry)}" fill="${topFill}"/>`;
}
// a circle standing in 3D (centre c, its face's normal n), as a polygon on the screen
function ring3(c, n, r, k = 36) {
  const u = norm(Math.abs(n[1]) < .9 ? cross(n, [0, 1, 0]) : cross(n, [1, 0, 0])), w = cross(n, u), pts = [];
  for (let i = 0; i < k; i++) { const a = (i / k) * 2 * Math.PI; pts.push(P(add(c, add(mul(u, r * Math.cos(a)), mul(w, r * Math.sin(a)))))); }
  return pts;
}

// ——— the record lying on the platter: grooves, the window's light on them in a bow from the upper left, the label as on
// the turntable inside (#/records/<date>: records.js discHtml) — ROTKEHLCHEN, the piece, the composer — foreshortened ———
function record(x, y, R, lab) {
  const k = SE, r = R * .36;
  let g = `<ellipse cx="${f1(x + 2)}" cy="${f1(y + 1.6)}" rx="${f1(R)}" ry="${f1(R * k)}" fill="rgba(0,0,0,.45)"/><g transform="translate(${f1(x)} ${f1(y)}) scale(1 ${k.toFixed(3)})">
    <circle r="${f1(R)}" fill="#0b0b0b"/><circle r="${f1(R - .6)}" fill="none" stroke="rgba(255,255,255,.16)" stroke-width=".9"/>`;
  for (let i = 0; i < 26; i++) { const rr = R * (.43 + (i / 26) * .54); g += `<circle r="${f1(rr)}" fill="none" stroke="rgba(255,255,255,${i % 7 === 3 ? .02 : .055})" stroke-width="${i % 7 === 3 ? 1.6 : .5}"/>`; }
  g += `<circle r="${f1(R * .415)}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width=".6"/>`;
  // the light on the grooves: a bow through the centre toward the window
  for (const a0 of [-138, 42]) { const a = (a0 - 11) * Math.PI / 180, b = (a0 + 11) * Math.PI / 180; g += `<path d="M0 0 L${f1(Math.cos(a) * R)} ${f1(Math.sin(a) * R)} A${f1(R)} ${f1(R)} 0 0 1 ${f1(Math.cos(b) * R)} ${f1(Math.sin(b) * R)}Z" fill="url(#cb-ph-sheen)" opacity="${a0 < 0 ? 1 : .55}"/>`; }
  const by = esc(lab.by), name = esc(lab.name), long = [...lab.name].length > 7;
  g += `<circle r="${f1(r)}" fill="url(#cb-ph-lab)"/><circle r="${f1(r - 1)}" fill="none" stroke="rgba(214,165,66,.6)" stroke-width="1.1"/><circle r="${f1(r - 3.2)}" fill="none" stroke="rgba(214,165,66,.45)" stroke-width=".6"/>
    <text y="${f1(-r * .44)}" text-anchor="middle" style="font:600 ${f1(R * .056)}px var(--latin);letter-spacing:.2em" fill="#d9b45a">ROTKEHLCHEN</text>
    <text y="${f1(r * .38)}" text-anchor="middle" style="font:700 ${f1(R * .1)}px var(--serif);letter-spacing:.04em" fill="#f6d06a"${long ? ` textLength="${f1(r * 1.62)}" lengthAdjust="spacingAndGlyphs"` : ""}>${name}</text>
    ${by ? `<text y="${f1(r * .66)}" text-anchor="middle" style="font:italic 500 ${f1(R * .072)}px var(--latin)" fill="#e9c66c">${by}</text>` : ""}`;
  return g + `<circle r="${f1(R * .028)}" fill="#d8d8d8"/><circle r="${f1(R * .028)}" fill="url(#cb-ph-ball)"/></g>`;
}
// the platter: its centre at the foot of its rim, its radius, the record's on it
const PLATTER = [-20, 112, 2], PR = 92, PREC = 88;
// The record on the platter. `lab`: { name, by } — the piece and the composer, as the turntable's label has them.
function phonoDisc(lab) {
  const [x, y] = P([PLATTER[0], PLATTER[1] + 5, PLATTER[2]]);
  return `<g class="ph-rec">${record(x, y - .8, PREC, lab)}</g>`;
}
// the platter dressed in felt, its rim of nickel; the record on it, or (none read yet) the felt and the spindle
function feltPlatter(lab) {
  const c = PLATTER, R = PR, [x, y] = P([c[0], c[1] + 5, c[2]]);
  let g = contact(...P(c), R + 6, (R + 6) * SE * .8, .7) + cyl(c, R, 5, "url(#cb-ph-nk)", "url(#cb-ph-vel)");
  g += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(R)}" ry="${f1(R * SE)}" fill="rgba(30,4,8,.5)"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(R)}" ry="${f1(R * SE)}" fill="url(#cb-ph-sheen)" opacity=".35"/>`;
  return g + (lab ? phonoDisc(lab) : `<g transform="translate(${f1(x)} ${f1(y)}) scale(1 ${SE.toFixed(3)})"><circle r="${f1(R * .03)}" fill="url(#cb-ph-ball)"/></g>`);
}

// ——— brass that reflects the room: the window above left bright, the ceiling soft, the floor and the far wall dark ———
const BRASS = [[0, [46, 27, 9]], [.3, [122, 80, 28]], [.62, [200, 152, 66]], [.9, [240, 208, 136]], [1.3, [255, 246, 220]]];
function brassAt(n, dim = 1) {
  const nv = dot(n, VIEW), R = sub(mul(n, 2 * nv), VIEW);
  const win = Math.pow(Math.max(0, dot(R, LIGHT)), 6), up = Math.max(0, R[1]), dif = Math.max(0, dot(n, LIGHT));
  const b = Math.min(1.3, (.12 + .26 * up + .3 * dif + 1.05 * win) * dim);
  let i = 1; while (i < BRASS.length - 1 && b > BRASS[i][0]) i++;
  const [a0, c0] = BRASS[i - 1], [a1, c1] = BRASS[i], t = Math.max(0, Math.min(1, (b - a0) / (a1 - a0)));
  return `#${c0.map((v, j) => Math.round(v + (c1[j] - v) * t).toString(16).padStart(2, "0")).join("")}`;
}
// on the screen: is p inside the polygon, and how far is it from its edge
const inside = (p, pg) => { let c = false; for (let i = 0, j = pg.length - 1; i < pg.length; j = i++) { const [xi, yi] = pg[i], [xj, yj] = pg[j]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c; } return c; };
const away = (p, pg) => Math.min(...pg.map((a, i) => { const b = pg[(i + 1) % pg.length], dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); }));
// The horn: a flared tube along a curve (an exponential flare, r0 at the throat to R at the bell), made of petals soldered
// at their seams like the real ones; drawn back to front, each facet its own brass by where it faces; inside the bell darker
// the deeper it goes; a rolled bead round the mouth. Answers the drawing and the outline (for its shadow on the wall).
function horn(o) {
  const { p0, p1, p2, p3, r0, R, petals = 10, sub: sb = 3, steps = 26, flare = 3.1 } = o, M = petals * sb;
  const bez = (t) => { const u = 1 - t; return [0, 1, 2].map((i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]); };
  const dbez = (t) => { const u = 1 - t; return [0, 1, 2].map((i) => 3 * u * u * (p1[i] - p0[i]) + 6 * u * t * (p2[i] - p1[i]) + 3 * t * t * (p3[i] - p2[i])); };
  let Nn = null; const rings = [], ts = [];
  for (let i = 0; i <= steps; i++) {
    const t = 1 - Math.pow(1 - i / steps, 1.7), T = norm(dbez(t)); ts.push(t);
    Nn = Nn ? norm(sub(Nn, mul(T, dot(Nn, T)))) : norm(cross(T, [0, 0, 1]));
    const Bn = cross(T, Nn), C = bez(t), r = r0 + (R - r0) * Math.pow(t, flare), ring = [];
    for (let j = 0; j < M; j++) { const u = (j % sb) / sb, a = (j / M) * 2 * Math.PI + .3, rr = r * (1 - .028 * (1 - Math.sin(Math.PI * u))); ring.push(add(C, add(mul(Nn, rr * Math.cos(a)), mul(Bn, rr * Math.sin(a))))); }
    rings.push({ C, ring });
  }
  const mouth = rings[steps].ring.map(P);
  // The inside is seen only through the mouth: an inside facet whose picture lies wholly off the mouth's (farther from it
  // than the facet is wide) is behind the outside, and is left out — as the inside of the neck is.
  const seen = (pts) => { const w = Math.max(...pts.map((p) => Math.max(...pts.map((q) => Math.hypot(p[0] - q[0], p[1] - q[1]))))); return pts.some((p) => inside(p, mouth) || away(p, mouth) <= w); };
  const quads = [];
  for (let i = 0; i < steps; i++) for (let j = 0; j < M; j++) {
    const a = rings[i].ring[j], b = rings[i].ring[(j + 1) % M], c = rings[i + 1].ring[(j + 1) % M], d = rings[i + 1].ring[j];
    const cen = mul(add(add(a, b), add(c, d)), .25), axis = mul(add(rings[i].C, rings[i + 1].C), .5);
    let n = norm(cross(sub(c, a), sub(d, b))); if (dot(n, sub(cen, axis)) < 0) n = mul(n, -1);
    const out = dot(n, VIEW) > 0, t = (ts[i] + ts[i + 1]) / 2, pts = [a, b, c, d].map(P);
    if (!out && (t < .55 || !seen(pts))) continue;
    const col = out ? brassAt(n) : brassAt(mul(n, -1), .3 + .7 * Math.pow(t, 2.2));
    let s = `<path d="${poly(pts)}" fill="${col}" stroke="${col}"/>`;
    // the seam: soldered dark, its lip lit (rgba(40,20,2,.5 or .35 inside), rgba(255,240,200,.32 or .16), as #rrggbbaa)
    if (j % sb === 0) { const [s0, s1] = [pts[0], pts[3]]; s += `<path d="${poly([s0, s1], false)}" stroke="${out ? "#28140280" : "#28140259"}" stroke-width="${f1(.5 + t * .7)}"/><path d="${poly([[s0[0] - .6, s0[1] - .6], [s1[0] - .6, s1[1] - .6]], false)}" stroke="${out ? "#fff0c852" : "#fff0c829"}" stroke-width="${f1(.3 + t * .3)}"/>`; }
    quads.push([dot(cen, FWD), s]);
  }
  quads.sort((x, y) => y[0] - x[0]);
  // the bead round the mouth: dark below right, a line of light along its upper left
  const cx = mouth.reduce((s, p) => s + p[0], 0) / M, cy = mouth.reduce((s, p) => s + p[1], 0) / M, md = poly(mouth);
  let lit = "";
  for (let j = 0; j < M; j++) { const p = mouth[j], q = mouth[(j + 1) % M], lx = (p[0] + q[0]) / 2 - cx, ly = (p[1] + q[1]) / 2 - cy, k = (lx * -0.7 + ly * -0.7) / Math.hypot(lx, ly); if (k > .15) lit += `<path d="${poly([p, q], false)}" stroke="rgba(255,248,222,${(k * .85).toFixed(2)})" stroke-width="1.3" stroke-linecap="round"/>`; }
  const g = `<g stroke-width=".6" stroke-linejoin="round">${quads.map((q) => q[1]).join("")}</g><path d="${md}" fill="none" stroke="rgba(30,15,0,.7)" stroke-width="5.4" transform="translate(.8 1)"/><path d="${md}" fill="none" stroke="url(#cb-ph-brass)" stroke-width="4"/>${lit}`;
  // the outline: each pair of rings' hull, all in one path (painted once)
  const hull = (pts) => { const s = pts.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const p of s) { while (lo.length > 1 && cr(lo.at(-2), lo.at(-1), p) <= 0) lo.pop(); lo.push(p); }
    for (const p of s.reverse()) { while (up.length > 1 && cr(up.at(-2), up.at(-1), p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1)); };
  let outline = "";
  for (let i = 0; i < steps; i += 2) outline += poly(hull(rings[i].ring.concat(rings[Math.min(steps, i + 2)].ring).map(P))) + " ";
  return { g, outline };
}

// a soundbox: the nickel case with its rims, the mica in it, the needle bar down to the record
function soundbox(c, n, r, needle) {
  const o = poly(ring3(c, n, r)), m = poly(ring3(c, n, r * .74)), i2 = poly(ring3(c, n, r * .3)), back = poly(ring3(add(c, mul(n, -4)), n, r));
  const [nx, ny] = P(needle), [cx, cy] = P(c);
  return `<path d="${back}" fill="#3a3a3a"/><path d="${o}" fill="url(#cb-ph-nk)"/><path d="${o}" fill="none" stroke="rgba(0,0,0,.45)" stroke-width=".7"/>
    <path d="${m}" fill="#2a2016"/><path d="${m}" fill="url(#cb-ph-mica)"/><path d="${m}" fill="none" stroke="rgba(255,255,255,.35)" stroke-width=".5"/><path d="${i2}" fill="url(#cb-ph-ball)"/>
    <path d="M${f1(cx)} ${f1(cy)} L${f1(nx)} ${f1(ny)}" stroke="#c8c8c8" stroke-width="1.6" stroke-linecap="round"/><path d="M${f1(cx - .5)} ${f1(cy)} L${f1(nx - .5)} ${f1(ny)}" stroke="rgba(255,255,255,.7)" stroke-width=".5"/>
    <ellipse cx="${f1(nx + .8)}" cy="${f1(ny + .6)}" rx="2.4" ry="1" fill="rgba(0,0,0,.6)"/>`;
}
// the winding crank on the case's right side: an escutcheon, the shaft, the arm, a turned ebony handle toward us
function crank(at, len = 16, drop = 24) {
  const s0 = at, s1 = add(at, [len, 0, 0]), a1 = add(s1, [4, -drop, 8]), h1 = add(a1, [0, 0, 22]);
  const [ex, ey] = P(s0), [hx, hy] = P(h1), [ax, ay] = P(a1), grip = `M${f1(ax - 4.4)} ${f1(ay)} L${f1(hx - 5.2)} ${f1(hy)} L${f1(hx + 5.2)} ${f1(hy)} L${f1(ax + 4.4)} ${f1(ay)}Z`;
  return `<ellipse cx="${f1(ex + 1)}" cy="${f1(ey)}" rx="3.2" ry="8" fill="url(#cb-ph-br)"/>${tube(s0, s1, 2.6, 2.4, "nk")}${ball(s1, 3.6, "cb-ph-ball")}${tube(s1, a1, 2.4, 2.4, "nk")}${ball(a1, 3.2, "cb-ph-ball")}
    <path d="${grip}" fill="#160d08"/><path d="${grip}" fill="url(#cb-ph-ebon)"/>
    <ellipse cx="${f1(hx)}" cy="${f1(hy)}" rx="5.2" ry="${f1(5.2 * CE)}" fill="#1e140e"/><ellipse cx="${f1(hx - 1.4)}" cy="${f1(hy - 1.4)}" rx="2" ry="1.4" fill="rgba(255,230,200,.3)"/>`;
}
// a turned brass bun foot
const bun = (c, r = 7, h = 8) => { const [x, y] = P(c); return contact(x + 2, y, r * 1.5, 2.6) + `<path d="M${f1(x - r)} ${f1(y - h * .55)} Q${f1(x - r)} ${f1(y)} ${f1(x)} ${f1(y)} Q${f1(x + r)} ${f1(y)} ${f1(x + r)} ${f1(y - h * .55)} L${f1(x + r * .62)} ${f1(y - h)} L${f1(x - r * .62)} ${f1(y - h)}Z" fill="url(#cb-ph-br)"/><path d="M${f1(x - r * .7)} ${f1(y - h)} h${f1(r * 1.4)} v1.4 h${f1(-r * 1.4)}Z" fill="rgba(255,240,200,.5)"/>`; };
// the small gilt pieces cut cheaply with the same carve: a boss with its ring, a laurel leaf (two curves, a rib down it)
const boss = (x, y, r) => carve(`M${f1(x - r)} ${f1(y)} a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0Z`, r / 6) + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * .62)}" fill="none" stroke="rgba(60,30,0,.45)" stroke-width="${f1(Math.max(.3, r * .14))}"/><circle cx="${f1(x - r * .3)}" cy="${f1(y - r * .3)}" r="${f1(r * .22)}" fill="rgba(255,248,220,.75)"/>`;
function lens(x0, y0, x1, y1, w, k = .4) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l * w, ny = dx / l * w;
  return carve(`M${f1(x0)} ${f1(y0)} Q${f1(mx + nx)} ${f1(my + ny)} ${f1(x1)} ${f1(y1)} Q${f1(mx - nx)} ${f1(my - ny)} ${f1(x0)} ${f1(y0)}Z`, k) + `<path d="M${f1(x0)} ${f1(y0)} L${f1(x1)} ${f1(y1)}" stroke="rgba(40,18,0,.5)" stroke-width="${f1(Math.max(.3, w * .22))}"/>`;
}
// a gilt garland: a boss in the middle, laurel leaves running out to each side, tilted up and down by turns
const garland = (x, y, n, step, r) => boss(x, y, r) + [-1, 1].map((sx) => Array.from({ length: n }, (_, i) => lens(x + sx * (r + 2 + i * step), y, x + sx * (r + 2 + i * step + step * 1.1), y + (i % 2 ? -2.8 : 2.8), 2.5)).join("")).join("");
// a gilt bronze piece from cabinet.js, placed and scaled
const put = (svgStr, x, y, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">${svgStr}</g>`;

// ——— The gramophone: a mahogany case (a moulded lid, a raised field in a moulded frame, fluted pilasters with gilt capitals
// and bases either side, a moulded plinth, brass bun feet), the record on its platter; at the back right a brass pillar
// holds the elbow, and the horn of ten soldered petals rises from it, back and up, and turns to face the window at the
// upper left; the tone arm runs from the elbow to the front, its nickel soundbox (a mica diaphragm) on the record; the
// crank on the right, its ebony handle toward us. ———
function gramophone(lab) {
  const X0 = -118, X1 = 118, Z1 = 95, Y0 = 20, Y1 = 104; // the case
  const sx = (x) => OX + x, sy = (y, z) => OY - y * CE + z * SE;
  const hn = horn({ p0: [96, 152, -64], p1: [118, 262, -118], p2: [70, 372, -84], p3: [-22, 394, 0], r0: 6.5, R: 104 });
  let g = soft(hn.outline, 34, 18, 1.5) + soft(`M${sx(X0 - 4)} ${f1(sy(112, -99))} H${sx(X1 + 4)} V${f1(sy(8, 99))} H${sx(X0 - 4)}Z`, 16, 8, .7);
  // feet, the plinth, the case, the lid
  g += contact(OX, sy(0, 99) - 1, 132, 6) + bun([X0 + 12, 0, 92], 7, 9) + bun([X1 - 12, 0, 92], 7, 9);
  g += top(sx(X0 - 4), sy(20, 95), X1 - X0 + 8, 4 * SE) + band(sx(X0 - 4), sy(20, 99), X1 - X0 + 8, [[1.6, "v"], [2.6, "c"], [3.2, "v"], [1.4, "f"]]);
  g += face(sx(X0), sy(Y1, Z1), X1 - X0, (Y1 - Y0) * CE);
  // the stiles: fluted pilasters with gilt capitals and bases (the second stile's gilt the first's, used again)
  const fh = (Y1 - Y0) * CE, fy = sy(Y1, Z1), gilt = uid("g");
  for (const x of [X0, X1 - 22]) {
    g += `<rect x="${sx(x)}" y="${f1(fy)}" width="22" height="${f1(fh)}" fill="url(#cb-ph-wv)"/><rect x="${sx(x)}" y="${f1(fy)}" width="22" height="${f1(fh)}" fill="url(#cb-ph-ebon)" opacity=".75"/>`;
    for (let i = 0; i < 3; i++) g += `<rect x="${f1(sx(x) + 5.4 + i * 4.6)}" y="${f1(fy + 9)}" width="1.6" height="${f1(fh - 18)}" rx=".8" fill="rgba(12,4,0,.6)"/><rect x="${f1(sx(x) + 5 + i * 4.6)}" y="${f1(fy + 9)}" width=".6" height="${f1(fh - 18)}" fill="rgba(255,226,190,.3)"/>`;
    g += x === X0 ? `<g id="${gilt}">${put(capital(), sx(x) - 3, fy, .78)}${put(base(), sx(x) - 3, fy + fh - 9.4, .78)}</g>` : `<use href="#${gilt}" x="${x - X0}"/>`;
  }
  // the panel between them: a moulded frame round a raised field, a gilt garland of leaves on it
  const px = sx(X0 + 30), pw = X1 - X0 - 60, py = fy + 9, ph = fh - 18;
  g += frame(px, py, pw, ph, [[1.4, "c"], [2.4, "v"], [1, "f"]]) + field(px + 9, py + 9, pw - 18, ph - 18);
  g += garland(OX, py + ph / 2, 5, 9.6, 5.4);
  // the lid: its moulded edge, its top foreshortened
  g += top(sx(X0 - 4), sy(112, -99), X1 - X0 + 8, 198 * SE) + band(sx(X0 - 4), sy(112, 99), X1 - X0 + 8, [[1.6, "f"], [3.4, "v"], [2.2, "c"], [1.2, "f"]]);
  // the pillar and the elbow at the back right, the horn rising out of it
  g += contact(...P([96, 112, -64]), 13, 5) + cyl([96, 112, -64], 9, 3, "url(#cb-ph-br)", "url(#cb-ph-brass)") + tube([96, 114, -64], [96, 148, -64], 4.4, 4, "br");
  g += hn.g;
  // the turntable and the record
  g += feltPlatter(lab);
  // the tone arm, tapering from the elbow to the soundbox, which rests on the record's outer grooves
  g += tube([96, 150, -64], [50, 150, 28], 5.4, 3.6, "br") + tube([50, 150, 28], [44, 146, 38], 3.6, 3.2, "br");
  g += ball([96, 151, -64], 8.4) + soundbox([40, 141, 44], norm([-0.55, 0.05, 0.83]), 16, [46, 121, 50]);
  g += crank([X1, 62, 30]);
  // a nickel brake lever at the front right of the lid
  const [bx, by] = P([92, 112, 70]);
  g += `<ellipse cx="${f1(bx + 1)}" cy="${f1(by + 1)}" rx="7" ry="3" fill="rgba(0,0,0,.5)"/><ellipse cx="${f1(bx)}" cy="${f1(by)}" rx="5.4" ry="2.4" fill="url(#cb-ph-nk)"/>` + tube([92, 113, 70], [76, 114, 66], 1.3, 1, "nk") + ball([76, 114, 66], 2.2, "cb-ph-ball");
  return g;
}

// The gramophone as one picture, `lab` ({ name, by }) the record on it, or null: none read yet. The gilt's wear joined
// into one path (cabinet.js fuseGilt), as the room does with its own.
export function phonoSvg(lab) {
  return `<svg class="ph-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="visible" aria-hidden="true">${fuseGilt(DEFS + gramophone(lab))}</svg>`;
}
