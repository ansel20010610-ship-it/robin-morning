// 唱片櫃的五金與雕花：records.js crateHtml 用它把方盒子畫成一個維也納桃花心木櫃——
// 唱片箱前板的鍍金豎琴飾、抽屜的黃銅拉環與鑰匙孔、柱子的鍍金柱頭與柱腳、裙板中間的雕花、四隻車削的腳。
// 這一頁（#/records）和收藏房間裡縮小的那一份用的是同一段，所以推進的起點和終點畫的是同一個櫃子。
// 光從左上來：凸的上緣亮、下緣暗；雕花三層——右下的影、左上的受光、本體——再疊一層受光的漸層。
const TEX = "assets/shelf/";
const f2 = (n) => (+n).toFixed(2);
const P2 = (pts) => pts.map((p) => `${f2(p[0])} ${f2(p[1])}`).join(" L");
const ptsD = (pts, f = (p) => p) => `M${P2(pts.map(f))}Z`;

export const CB_DEFS = `<svg class="cb-defs" width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
  <linearGradient id="cb-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6cb88"/><stop offset=".2" stop-color="#b98a33"/><stop offset=".42" stop-color="#f3d78e"/><stop offset=".6" stop-color="#9a6e26"/><stop offset=".8" stop-color="#e2bb62"/><stop offset="1" stop-color="#7a5418"/></linearGradient>
  <radialGradient id="cb-rel" cx=".34" cy=".3" r=".9"><stop offset="0" stop-color="rgba(255,250,222,.6)"/><stop offset=".4" stop-color="rgba(255,250,222,.06)"/><stop offset=".72" stop-color="rgba(60,30,0,.14)"/><stop offset="1" stop-color="rgba(40,18,0,.6)"/></radialGradient>
  <linearGradient id="cb-turn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(10,3,0,.7)"/><stop offset=".22" stop-color="rgba(255,226,190,.32)"/><stop offset=".38" stop-color="rgba(255,226,190,.06)"/><stop offset=".78" stop-color="rgba(10,3,0,.38)"/><stop offset="1" stop-color="rgba(10,3,0,.75)"/></linearGradient>
  <linearGradient id="cb-turng" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(60,30,0,.55)"/><stop offset=".25" stop-color="rgba(255,248,215,.6)"/><stop offset=".42" stop-color="rgba(255,248,215,.05)"/><stop offset=".8" stop-color="rgba(60,30,0,.3)"/><stop offset="1" stop-color="rgba(40,18,0,.7)"/></linearGradient>
  <pattern id="cb-wv" patternUnits="userSpaceOnUse" width="90" height="90"><image href="${TEX}gen_wood_v.png" width="90" height="90" preserveAspectRatio="none"/></pattern>
  <pattern id="cb-gx" patternUnits="userSpaceOnUse" width="50" height="50"><image href="${TEX}gen_gilt.png" width="50" height="50"/></pattern>
</defs></svg>`;

// The gilt's wear is one pattern laid over many small pieces, and Safari makes a tile of a pattern for every shape that
// uses it (a room of them took four times as long to paint, review 2026-11-22). So the wear of the pieces in one group —
// the same <g> or <svg>, one coordinate system — is one path, their outlines joined, put where the group's last piece's
// was; the pattern lies in the group's own coordinates, so nothing on it moves. salon.js runs it over the whole room.
const TAG = /<(\/?)(g|svg|defs|pattern|clipPath|mask|symbol|marker)\b[^>]*?(\/?)>|<path d="([^"]+)" fill="url\(#(sl-giltx|cb-gx|cbr-gx)\)"\/>/g;
export function fuseGilt(s) {
  const out = [], open = [new Map()];
  const close = (g) => { for (const [f, a] of g) if (a.length > 1) { out[a.at(-1)[0]] = `<path d="${a.map((x) => x[1]).join(" ")}" fill="url(#${f})"/>`; for (const [i] of a.slice(0, -1)) out[i] = ""; } };
  let at = 0;
  for (const m of s.matchAll(TAG)) {
    out.push(s.slice(at, m.index), m[0]); at = m.index + m[0].length;
    if (m[4] !== undefined) { const g = open.at(-1); if (!g.has(m[5])) g.set(m[5], []); g.get(m[5]).push([out.length - 1, m[4]]); }
    else if (m[3] !== "/") { if (!m[1]) open.push(new Map()); else if (open.length > 1) close(open.pop()); }
  }
  out.push(s.slice(at));
  open.forEach(close);
  return out.join("");
}
const svg = (w, h, inner, cls = "") => `<svg class="${cls}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="visible" aria-hidden="true">${fuseGilt(inner)}</svg>`;
// relief in gilt bronze: the shadow below right, the light above left, the body, the light across it
function carve(d, k = 1) {
  return `<path d="${d}" fill="rgba(12,4,0,.3)" transform="translate(${f2(1.5 * k)} ${f2(1.9 * k)})"/><path d="${d}" fill="rgba(12,4,0,.62)" transform="translate(${f2(.7 * k)} ${f2(.9 * k)})"/>
    <path d="${d}" fill="rgba(255,246,212,.95)" transform="translate(${f2(-.45 * k)} ${f2(-.5 * k)})"/><path d="${d}" fill="url(#cb-gold)"/><path d="${d}" fill="url(#cb-gx)"/><path d="${d}" fill="url(#cb-rel)"/>`;
}
function leafPts(x0, y0, x1, y1, W, bend = .25, lobes = 3) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, n = 30, A = [], B = [];
  for (let i = 0; i <= n; i++) { const t = i / n, c = Math.sin(Math.PI * t) * bend * len, w = W * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05 + .02)), .65) * (1 - .45 * Math.abs(Math.sin(t * Math.PI * lobes))) * (1 - t * .25);
    const px = x0 + dx * t + nx * c, py = y0 + dy * t + ny * c; A.push([px + nx * w, py + ny * w]); B.push([px - nx * w * .85, py - ny * w * .85]); }
  return [...A, ...B.reverse()];
}
// a leaf with the groove down its middle (dark, and its lit lip above it)
function leaf(x0, y0, x1, y1, W, bend, lobes, k, f = (p) => p) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, P = [];
  for (let i = 3; i <= 27; i++) { const t = i / 30, c = Math.sin(Math.PI * t) * bend * len; P.push(f([x0 + dx * t + nx * c, y0 + dy * t + ny * c])); }
  const d = `M${P2(P)}`, sw = Math.max(.25, W * .2);
  return carve(ptsD(leafPts(x0, y0, x1, y1, W, bend, lobes), f), k) + `<path d="${d}" fill="none" stroke="rgba(30,12,0,.55)" stroke-width="${f2(sw)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="rgba(255,246,212,.5)" stroke-width="${f2(sw * .45)}" stroke-linecap="round" transform="translate(${f2(-sw * .5)} ${f2(-sw * .55)})"/>`;
}
const disc = (cx, cy, r) => `M${f2(cx - r)} ${f2(cy)} a${f2(r)} ${f2(r)} 0 1 0 ${f2(2 * r)} 0 a${f2(r)} ${f2(r)} 0 1 0 ${f2(-2 * r)} 0Z`;
function rosette(cx, cy, r, n = 8) {
  let g = "";
  for (let i = 0; i < n; i++) { const a = (i / n) * 2 * Math.PI + .2; g += leaf(cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * .28, 0, 1, r / 9); }
  return g + carve(disc(cx, cy, r * .3), r / 9);
}

// the lyre on the crate's front: two horns curling out, the strings, a leaf at its foot, a rosette at its yoke
export function lyre() {
  const w = 64, h = 50, c = w / 2;
  let g = "";
  for (const sx of [-1, 1]) {
    const f = (p) => [c + sx * p[0], p[1]];
    const horn = [[3, 44], [9, 40], [13, 30], [12, 18], [16, 9], [22, 6], [25, 9], [21, 12], [17, 16], [18, 28], [15, 40], [8, 46]];
    g += carve(`M${P2(horn.map(f))}Z`, .9);
    g += carve(disc(c + sx * 23.2, 7.6, 2.4), .5);
  }
  g += carve(`M${c - 15} 13.5 h30 v2.6 h-30Z`, .6); // the yoke
  for (let i = -2; i <= 2; i++) g += `<path d="M${c + i * 2.4} 16 V40" stroke="rgba(255,240,200,.75)" stroke-width=".45"/><path d="M${c + i * 2.4 + .5} 16 V40" stroke="rgba(30,12,0,.4)" stroke-width=".3"/>`;
  g += carve(`M${c - 9} 40 h18 l-2 4 h-14Z`, .6);
  g += leaf(c, 44, c - 13, 49, 2.6, .2, 2, .5) + leaf(c, 44, c + 13, 49, 2.6, -.2, 2, .5) + leaf(c, 44, c, 33, 2.2, 0, 2, .5);
  g += rosette(c, 14.8, 3.6, 7);
  return svg(w, h, g, "cb-lyre");
}
// a turned finial on the crate's corner post
export const finial = () => svg(16, 16, `${carve("M3 16 h10 v-2 h-10Z", .5)}${carve(disc(8, 9, 4.2), .55)}${carve("M6.4 5 h3.2 v-2.4 h-3.2Z", .4)}${carve(disc(8, 1.8, 1.6), .35)}`, "cb-fin");
// the drawer's pull: a rosette backplate and a ring hanging from it
export const pull = () => svg(26, 26, `<ellipse cx="13.6" cy="21.6" rx="9" ry="3.6" fill="rgba(10,3,0,.35)"/>${rosette(13, 7, 6.2, 10)}
  <path d="M13 9 m-8 7 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0" fill="none" stroke="rgba(10,3,0,.55)" stroke-width="2.6" transform="translate(.8 1.2)"/>
  <path d="M13 9 m-8 7 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0" fill="none" stroke="url(#cb-gold)" stroke-width="2.2"/><path d="M6.2 13 a7.2 7.2 0 0 1 9 -3.8" fill="none" stroke="rgba(255,248,215,.8)" stroke-width=".7"/>`, "cb-pull");
// the keyhole: a shield of gilt bronze, the hole cut dark
export const keyhole = () => svg(12, 16, `${carve("M6 .5 C9.5 .5 11.5 3 11.5 6.5 C11.5 10 8.5 13 6 15.5 C3.5 13 .5 10 .5 6.5 C.5 3 2.5 .5 6 .5Z", .5)}
  <path d="M6 4 a1.7 1.7 0 1 0 .01 0Z M5.3 6.6 h1.4 l.5 4.2 h-2.4Z" fill="#120804"/><path d="M5 11 h2.4" stroke="rgba(255,240,200,.5)" stroke-width=".4"/>`, "cb-key");
// a column's capital and base in gilt bronze (the shaft between them is the stile's own wood, rounded by light)
export const capital = () => svg(28, 12, `${carve("M0 0 h28 v3.2 h-28Z", .5)}${carve("M3 3.2 h22 l-2 3.2 h-18Z", .5)}${Array.from({ length: 5 }, (_, i) => carve(disc(6 + i * 4, 8.4, 1.6), .3)).join("")}${carve("M4.5 10 h19 v2 h-19Z", .3)}`, "cb-cap");
export const base = () => svg(28, 12, `${carve("M4.5 0 h19 v1.6 h-19Z", .3)}${carve("M3 1.6 h22 q2 2.6 0 4.6 h-22 q-2 -2 0 -4.6Z", .5)}${carve("M0 6.4 h28 v5.6 h-28Z", .5)}`, "cb-base");
// the apron's carving: a patera with a leaf running out to each side
export function apron() {
  let g = rosette(40, 7, 5.6, 10);
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) g += leaf(40 + sx * (7 + i * 9), 7 + (i % 2 ? -.6 : .6), 40 + sx * (16 + i * 9), 7, 2.6, sx * (i % 2 ? .25 : -.25), 2, .5);
  return svg(80, 14, g, "cb-orn");
}
// four turned legs: a block under the column, a collar, the shaft tapering through two rings, a toupie foot shod in brass.
// The back leg stands a little in from the front one, higher (it is farther back) and in shadow.
function oneLeg(x, h, dark) {
  const c = x + 7, sh = `fill="url(#cb-wv)"`;
  let g = `<rect x="${x}" y="0" width="14" height="${f2(h * .16)}" ${sh}/><rect x="${x}" y="0" width="14" height="${f2(h * .16)}" fill="url(#cb-turn)"/>`;
  const shaft = `M${c - 5.4} ${f2(h * .24)} L${c + 5.4} ${f2(h * .24)} L${c + 3.2} ${f2(h * .8)} L${c - 3.2} ${f2(h * .8)}Z`;
  g += `<path d="${shaft}" ${sh}/><path d="${shaft}" fill="url(#cb-turn)"/>`;
  for (const [y, rw] of [[h * .16, 7.2], [h * .44, 5.2], [h * .62, 4.4]]) g += `<rect x="${f2(c - rw)}" y="${f2(y)}" width="${f2(rw * 2)}" height="${f2(h * .07)}" rx="1" ${sh}/><rect x="${f2(c - rw)}" y="${f2(y)}" width="${f2(rw * 2)}" height="${f2(h * .07)}" rx="1" fill="url(#cb-turn)"/><rect x="${f2(c - rw)}" y="${f2(y)}" width="${f2(rw * 2)}" height=".6" fill="rgba(255,230,190,.35)"/>`;
  g += `<path d="M${c - 3.4} ${f2(h * .8)} h6.8 l1.4 ${f2(h * .1)} h-9.6Z" fill="url(#cb-gold)"/><path d="M${c - 3.4} ${f2(h * .8)} h6.8 l1.4 ${f2(h * .1)} h-9.6Z" fill="url(#cb-turng)"/>
    <path d="M${c - 4.8} ${f2(h * .9)} h9.6 l-1.6 ${f2(h * .1)} h-6.4Z" fill="url(#cb-gold)"/><path d="M${c - 4.8} ${f2(h * .9)} h9.6 l-1.6 ${f2(h * .1)} h-6.4Z" fill="url(#cb-turng)"/>`;
  return dark ? `<g opacity=".9">${g}<rect x="${x - 2}" y="0" width="18" height="${h}" fill="rgba(8,2,0,.55)"/></g>` : g;
}
export const legs = (h = 30, side = "l") => svg(40, h + 4, `<ellipse cx="${side === "l" ? 12 : 28}" cy="${h + 1}" rx="12" ry="2.6" fill="rgba(8,2,0,.7)"/>${oneLeg(side === "l" ? 20 : 6, h - 4, true)}${oneLeg(side === "l" ? 5 : 21, h, false)}`, `cb-legs ${side}`);
