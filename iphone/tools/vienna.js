// The iPhone in the paper's Viennese dress: a home-screen wallpaper (day and night) and still widgets for the photo
// widget apps (Colorful Widget, iScreen). Wiener Secession / Werkstätte vocabulary: Hoffmann's lattice and chequer,
// gold squares, the laurel dome of Olbrich's Secession building and its motto.
// Usage: bun add @resvg/resvg-js@2.6.2, then FONTS=<dir> bun vienna.js <outdir>. <dir> holds Cormorant Garamond
// (500, 600, 500 italic) and Noto Serif TC (300, 600) as TTF, from Google Fonts (both OFL).
import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const OUT = process.argv[2] || "out";
mkdirSync(OUT, { recursive: true });
const FONTS = process.env.FONTS || join(import.meta.dir, "..", "fonts");
const fontFiles = ["CormorantGaramond-500.ttf", "CormorantGaramond-600.ttf", "CormorantGaramond-500i.ttf", "NotoSerifTC-300.ttf", "NotoSerifTC-600.ttf"].map((f) => join(FONTS, f));

export const THEMES = {
  light: { name: "light", paper: "#F5F0E6", paper2: "#EDE5D5", ink: "#1F1B16", ink2: "#4A4237", gold: "#A5843F", goldInk: "#7C642F", rule: "#CBB98F", fleck: "#6B5A3A", vignette: "#A88E5C", vig: 0.12 },
  dark: { name: "dark", paper: "#15120E", paper2: "#201B14", ink: "#EDE4D3", ink2: "#CDC2AF", gold: "#CDAE68", goldInk: "#CDAE68", rule: "#564A33", fleck: "#000000", vignette: "#000000", vig: 0.5 },
};

const defs = (t, w, h) => `<defs>
  <filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="11" stitchTiles="stitch"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .22 0 0 0 -.07"/>
  </filter>
  <filter id="fibre" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency=".0025 .018" numOctaves="2" seed="4"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .045 0 0 0 -.02"/>
  </filter>
  <radialGradient id="vig" cx="50%" cy="46%" r="75%">
    <stop offset="55%" stop-color="${t.vignette}" stop-opacity="0"/>
    <stop offset="100%" stop-color="${t.vignette}" stop-opacity="${t.vig}"/>
  </radialGradient>
</defs>`;
const paper = (t, w, h) => `<rect width="${w}" height="${h}" fill="${t.paper}"/>
  <rect width="${w}" height="${h}" fill="${t.fleck}" filter="url(#fibre)"/>
  <rect width="${w}" height="${h}" fill="${t.fleck}" filter="url(#grain)"/>
  <rect width="${w}" height="${h}" fill="url(#vig)"/>`;

const diamond = (x, y, s, fill) => `<rect x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}" fill="${fill}" transform="rotate(45 ${x} ${y})"/>`;

// Hoffmann's Gitterwerk: a lattice of hairlines with a small square at each crossing.
function lattice(t, x0, y0, x1, y1, step, opacity) {
  let d = "", sq = "";
  for (let x = x0; x <= x1 + 0.1; x += step) d += `M${x} ${y0}V${y1}`;
  for (let y = y0; y <= y1 + 0.1; y += step) d += `M${x0} ${y}H${x1}`;
  for (let x = x0; x <= x1 + 0.1; x += step) for (let y = y0; y <= y1 + 0.1; y += step) sq += `<rect x="${x - 3}" y="${y - 3}" width="6" height="6"/>`;
  return `<g opacity="${opacity}"><path d="${d}" stroke="${t.gold}" stroke-width="1" fill="none"/><g fill="${t.gold}">${sq}</g></g>`;
}

// A row of chequer squares (the Secession border), n squares of size s, alternate ones filled.
function chequer(t, x, y, n, s, { rows = 2, fill = t.gold } = {}) {
  let out = "";
  for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) if ((i + r) % 2 === 0) out += `<rect x="${x + i * s}" y="${y + r * s}" width="${s}" height="${s}" fill="${fill}"/>`;
  return out;
}

// The Secession dome, the "golden cabbage": a hemisphere of laurel leaves on a drum. Leaves sit on rings of latitude,
// foreshortened toward the edge, each leaning a little; the drum is two rules and a row of squares.
function dome(t, cx, cy, R, { opacity = 1 } = {}) {
  // Jugendstil reading of Olbrich's dome: laurel sprigs growing up the meridians of a hemisphere and meeting at the
  // crown, a parallel or two as the iron hoops, the whole on its chequered drum.
  const P = (lon, lat) => [cx - Math.cos(lon) * Math.cos(lat) * R, cy - Math.sin(lat) * R];
  let ribs = "", leaves = "";
  const M = 11; // meridians across the visible half
  for (let m = 1; m < M; m++) {
    const lon = m / M * Math.PI;
    let d = "";
    for (let k = 0; k <= 24; k++) { const [x, y] = P(lon, k / 24 * Math.PI / 2); d += (k ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }
    ribs += `<path d="${d}"/>`;
    const face = Math.sin(lon); // 1 facing us, toward 0 at the sides
    const L = 8;
    for (let k = 0; k < L; k++) {
      const lat = (k + 0.5) / L * (Math.PI / 2) * 0.92;
      const [x, y] = P(lon, lat), [x2, y2] = P(lon, lat + 0.02);
      const tan = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI;
      const sz = R * 0.072 * (0.45 + 0.55 * face) * (1 - k * 0.06);
      for (const side of [-1, 1]) {
        const rot = tan + side * 40;
        const ox = x + Math.cos(rot * Math.PI / 180) * sz * 0.95, oy = y + Math.sin(rot * Math.PI / 180) * sz * 0.95;
        leaves += `<ellipse cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" rx="${sz.toFixed(1)}" ry="${(sz * 0.34).toFixed(1)}" transform="rotate(${rot.toFixed(1)} ${ox.toFixed(1)} ${oy.toFixed(1)})"/>`;
      }
    }
  }
  let hoops = "";
  for (const lat of [0.42, 0.95]) { const r = Math.cos(lat) * R, y = cy - Math.sin(lat) * R; hoops += `<path d="M ${cx - r} ${y} A ${r} ${r * 0.18} 0 0 0 ${cx + r} ${y}"/>`; }
  const dw = R * 1.06, dh = R * 0.15, sq = R * 0.05;
  return `<g opacity="${opacity}">
    <path d="M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}" fill="none" stroke="${t.gold}" stroke-width="${Math.max(2, R * 0.012)}"/>
    <g fill="none" stroke="${t.gold}" stroke-width="${Math.max(1, R * 0.005)}">${ribs}${hoops}</g>
    <g fill="${t.gold}">${leaves}</g>
    ${diamond(cx, cy - R - R * 0.06, R * 0.07, t.gold)}
    <rect x="${cx - dw}" y="${cy}" width="${dw * 2}" height="${dh}" fill="none" stroke="${t.gold}" stroke-width="${Math.max(2, R * 0.01)}"/>
    ${chequer(t, cx - dw + sq * 0.8, cy + dh / 2 - sq / 2, Math.floor((dw * 2 - sq * 1.6) / sq), sq, { rows: 1 })}
    <line x1="${cx - dw - R * 0.08}" y1="${cy + dh + R * 0.05}" x2="${cx + dw + R * 0.08}" y2="${cy + dh + R * 0.05}" stroke="${t.gold}" stroke-width="${Math.max(2, R * 0.01)}"/>
  </g>`;
}

// ——— Home-screen wallpaper ———
const W = 1320, H = 2868; // Pro Max at 3x; iOS scales it for the smaller phones of the same shape
function frame(t, inset = 58) {
  const a = inset, b = inset + 18, R = 190;
  return `<rect x="${a}" y="${a}" width="${W - 2 * a}" height="${H - 2 * a}" rx="${R - a}" fill="none" stroke="${t.gold}" stroke-width="3"/>
    <rect x="${b}" y="${b}" width="${W - 2 * b}" height="${H - 2 * b}" rx="${R - b}" fill="none" stroke="${t.rule}" stroke-width="1.5"/>
    ${diamond(a, H / 2, 16, t.gold)}${diamond(W - a, H / 2, 16, t.gold)}`;
}
function home(t) {
  const motto = "DER ZEIT IHRE KUNST";
  const motto2 = "DER KUNST IHRE FREIHEIT";
  const my = 232; // the strip between the status bar and the first row of widgets
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs(t)}${paper(t, W, H)}
    ${lattice(t, 112, 330, W - 112, H - 330, 88, t.name === "dark" ? 0.10 : 0.12)}
    ${frame(t)}
    <text x="${W / 2 - 26}" y="${my}" text-anchor="end" font-family="Cormorant Garamond" font-weight="600" font-size="27" letter-spacing="6" fill="${t.goldInk}">${motto}</text>
    ${diamond(W / 2, my - 9, 9, t.gold)}
    <text x="${W / 2 + 26}" y="${my}" text-anchor="start" font-family="Cormorant Garamond" font-weight="600" font-size="27" letter-spacing="6" fill="${t.goldInk}">${motto2}</text>
    ${dome(t, W / 2, 1640, 300, { opacity: t.name === "dark" ? 0.12 : 0.13 })}
    <text x="${W / 2}" y="${H - 108}" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-weight="500" font-size="30" letter-spacing="3" fill="${t.goldInk}" opacity=".7">Wien · MDCCCXCVII</text>
  </svg>`;
}

// ——— Still widgets ———
// Sizes at 3x for the larger phones (small 170pt, medium 364×170pt); photo widget apps fit them to the slot.
export const SIZE = { small: [510, 510], medium: [1092, 510], large: [1092, 1146] };
const NO_START = "，。、；：！？」』）》〉…";
// Wrap Chinese text into lines of at most n characters, never starting a line with closing punctuation.
function wrap(text, n) {
  const out = [];
  let line = "";
  for (const ch of Array.from(text)) {
    if (line.length >= n && !NO_START.includes(ch)) { out.push(line); line = ""; }
    line += ch;
  }
  if (line) out.push(line);
  return out;
}
const escXml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// The card: paper, an inset gold rule with chequer corners (the iOS mask rounds the outside).
function card(t, w, h, body) {
  const m = 42, c = 4, s = 10;
  const corner = (x, y, fx, fy) => {
    let o = "";
    for (let i = 0; i < c; i++) for (let j = 0; j < c; j++) if ((i + j) % 2 === 0 && i + j < c) o += `<rect x="${x + fx * i * s - (fx < 0 ? s : 0)}" y="${y + fy * j * s - (fy < 0 ? s : 0)}" width="${s}" height="${s}" fill="${t.gold}"/>`;
    return o;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs(t)}${paper(t, w, h)}
    <rect x="${m}" y="${m}" width="${w - 2 * m}" height="${h - 2 * m}" fill="none" stroke="${t.gold}" stroke-width="2"/>
    <rect x="${m + 9}" y="${m + 9}" width="${w - 2 * m - 18}" height="${h - 2 * m - 18}" fill="none" stroke="${t.rule}" stroke-width="1"/>
    ${corner(m + 9, m + 9, 1, 1)}${corner(w - m - 9, m + 9, -1, 1)}${corner(m + 9, h - m - 9, 1, -1)}${corner(w - m - 9, h - m - 9, -1, -1)}
    ${body}</svg>`;
}

// Horizontal text block: lines centred as a block, a gold source line under it.
function prose(t, w, h, { text, cite, kicker, size, per, lead = 1.75, weight = 300 }) {
  const lines = wrap(text, per);
  const lh = size * lead, blockH = lines.length * lh;
  const total = blockH - (lead - 1) * size + (cite ? size * 1.7 : 0) + (kicker ? size * 1.6 : 0); // ink from the first cap-line to the cite
  const top = (h - total) / 2 + size * 0.86 + (kicker ? size * 1.6 : 0);
  const x = (w - per * size) / 2;
  let o = kicker ? `<text x="${x}" y="${top - size * 1.6}" font-family="Cormorant Garamond" font-style="italic" font-weight="500" font-size="${size * 0.95}" fill="${t.gold}">${escXml(kicker)}</text>` : "";
  lines.forEach((l, i) => { o += `<text x="${x}" y="${top + i * lh}" font-family="Noto Serif TC" font-weight="${weight}" font-size="${size}" letter-spacing="0" fill="${t.ink}">${escXml(l)}</text>`; });
  if (cite) {
    const cy = top + (lines.length - 1) * lh + size * 1.7;
    o += `<line x1="${x}" y1="${cy - size * 0.35}" x2="${x + 46}" y2="${cy - size * 0.35}" stroke="${t.gold}" stroke-width="2"/>`;
    o += `<text x="${x + 62}" y="${cy}" font-family="Noto Serif TC" font-weight="300" font-size="${size * 0.68}" letter-spacing="${size * 0.12}" fill="${t.goldInk}">${escXml(cite)}</text>`;
  }
  return card(t, w, h, o);
}

// Vertical text (直排), right to left, each glyph in its own cell; punctuation stays centred as Traditional Chinese
// sets it. `cols` is a list of columns; the cite runs down a last, smaller column on the left with a rule.
function vertical(t, w, h, { cols, cite, size, gap = 1.7 }) {
  const colW = size * gap;
  const tallest = Math.max(...cols.map((c) => Array.from(c).length));
  const blockW = cols.length * colW + (cite ? colW * 0.8 : 0);
  const x0 = (w + blockW) / 2 - colW / 2; // centre of the first (rightmost) column
  const y0 = (h - tallest * size * 1.12) / 2 + size * 0.9;
  let o = "";
  cols.forEach((c, i) => {
    Array.from(c).forEach((ch, j) => {
      o += `<text x="${x0 - i * colW}" y="${y0 + j * size * 1.12}" text-anchor="middle" font-family="Noto Serif TC" font-weight="300" font-size="${size}" fill="${t.ink}">${escXml(ch)}</text>`;
    });
  });
  if (cite) {
    const cx = x0 - cols.length * colW - colW * 0.05, cs = size * 0.5;
    const n = Array.from(cite).length, cy0 = y0 + tallest * size * 1.12 - n * cs * 1.25 - cs * 0.6;
    o += `<line x1="${cx}" y1="${cy0 - cs * 1.8}" x2="${cx}" y2="${cy0 - cs * 0.9}" stroke="${t.gold}" stroke-width="2"/>`;
    Array.from(cite).forEach((ch, j) => { o += `<text x="${cx}" y="${cy0 + j * cs * 1.25}" text-anchor="middle" font-family="Noto Serif TC" font-weight="300" font-size="${cs}" fill="${t.goldInk}">${escXml(ch)}</text>`; });
  }
  return card(t, w, h, o);
}

// A plain ornament card: the dome on its drum with the motto, for a slot that wants a picture, not words.
function domeCard(t, w, h) {
  const R = Math.min(w, h) * 0.27;
  return card(t, w, h, `${dome(t, w / 2, h * 0.6, R)}
    <text x="${w / 2}" y="${h * 0.6 + R * 0.16 + 72}" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="${w * 0.045}" letter-spacing="${w * 0.012}" fill="${t.goldInk}">VER SACRUM</text>`);
}

// Klimt's Tree of Life (Stoclet Frieze): a trunk, branches that curl into spirals, small eyes and triangles along
// them, a few birds' worth of dots. Spirals are Archimedean, drawn as stroked paths.
function spiralPath(cx, cy, r, turns, dir, start = 0) {
  let d = "";
  const N = Math.round(turns * 48);
  for (let i = 0; i <= N; i++) {
    const f = i / N, a = start + dir * f * turns * Math.PI * 2, rr = r * (1 - f * 0.92);
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
  }
  return d;
}
function tree(t, w, h, { scale = 1, wide = false } = {}) {
  // Klimt's Lebensbaum: a trunk with eye-shapes set in it; branches rise from it and roll over into large spirals
  // that curl downward, each with a gold boss at its heart; small curls between; a crown of three triangles.
  const cx = w / 2, base = h * 0.84, top = h * (wide ? 0.2 : 0.17), sw = 4.2 * scale, H = base - top;
  let o = `<g fill="none" stroke="${t.gold}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">`;
  o += `<path d="M ${cx} ${base} L ${cx} ${top + H * 0.1}"/>`;
  let bosses = "";
  const tiers = wide ? [[0.16, 0.25, 0.2], [0.46, 0.18, 0.16], [0.74, 0.11, 0.12]] : [[0.16, 0.32, 0.105], [0.44, 0.27, 0.092], [0.7, 0.2, 0.078]];
  for (const [f, reachF, rF] of tiers) {
    const y = base - H * f, reach = w * reachF, r = Math.min(w, h) * rF;
    for (const side of [-1, 1]) {
      const sx = cx + side * reach, sy = y - H * 0.13; // spiral centre, above and out from where the branch leaves
      // branch: out and up from the trunk, over the top of the spiral, and on into it
      o += `<path d="M ${cx} ${y} C ${cx + side * reach * 0.25} ${y - H * 0.02} ${sx - side * r * 1.4} ${sy - r * 1.1} ${sx} ${sy - r}"/>`;
      o += `<path d="${spiralPath(sx, sy, r, 2.3, side, -Math.PI / 2)}"/>`;
      bosses += `<circle cx="${sx}" cy="${sy}" r="${r * 0.13}" fill="${t.gold}"/>`;
      // a small curl rolling the other way under the branch
      const mx = cx + side * reach * 0.42, my = y + r * 0.2;
      o += `<path d="M ${cx + side * reach * 0.2} ${y - H * 0.01} Q ${mx} ${my - r * 0.5} ${mx + side * r * 0.35} ${my - r * 0.1}"/>`;
      o += `<path d="${spiralPath(mx + side * r * 0.35 - side * r * 0.0, my + r * 0.25, r * 0.36, 1.7, -side, -Math.PI / 2)}"/>`;
    }
  }
  o += `</g>`;
  // eyes set in the trunk
  let eyes = "";
  for (let i = 0; i < 4; i++) {
    const y = base - H * (0.08 + i * 0.23), s = 10 * scale;
    eyes += `<path d="M ${cx - s} ${y} Q ${cx} ${y - s * 0.8} ${cx + s} ${y} Q ${cx} ${y + s * 0.8} ${cx - s} ${y} Z" fill="${t.paper}" stroke="${t.gold}" stroke-width="${2 * scale}"/><circle cx="${cx}" cy="${y}" r="${s * 0.32}" fill="${t.gold}"/>`;
  }
  // crown: three triangles
  const ty = top + H * 0.05, ts = 14 * scale;
  let crown = "";
  for (const [dx, dy] of [[0, -1.5], [-1.3, 0.4], [1.3, 0.4]]) { const x = cx + dx * ts, y = ty + dy * ts; crown += `<path d="M ${x} ${y - ts} L ${x + ts * 0.8} ${y + ts * 0.55} L ${x - ts * 0.8} ${y + ts * 0.55} Z" fill="${t.gold}"/>`; }
  const gw = Math.min(w * 0.42, h * 0.9), sq = 9 * scale;
  const ground = `<line x1="${cx - gw / 2}" y1="${base + 3 * scale}" x2="${cx + gw / 2}" y2="${base + 3 * scale}" stroke="${t.gold}" stroke-width="${2 * scale}"/>${chequer(t, cx - Math.floor(gw / sq) * sq / 2, base + 12 * scale, Math.floor(gw / sq), sq, { rows: 1 })}`;
  return o + bosses + eyes + crown + ground;
}
const treeCard = (t, w, h) => { const k = w === h && w < 600 ? 0.86 : 1; return card(t, w, h, `<g transform="translate(${w * (1 - k) / 2} ${h * (1 - k) / 2}) scale(${k})">${tree(t, w, h, { scale: Math.min(w, h) / 510, wide: w > h * 1.5 })}</g>`); };

// The Secession's inscription over its door, in capitals, the Chinese beneath, laurel sprigs either side.
function sprig(x, y, len, dir, t, sc = 1) {
  let o = `<path d="M ${x} ${y} q ${dir * len * 0.5} ${-len * 0.12} ${dir * len} 0" fill="none" stroke="${t.gold}" stroke-width="${2 * sc}"/>`;
  for (let i = 1; i <= 5; i++) {
    const px = x + dir * len * (i / 6), py = y - len * 0.06 * Math.sin(Math.PI * i / 6), s = 11 * sc * (1 - i * 0.08);
    for (const k of [-1, 1]) {
      const rot = (dir > 0 ? 0 : 180) + k * 35 + (dir > 0 ? -8 : 8);
      const ox = px + Math.cos(rot * Math.PI / 180) * s * 0.9, oy = py + Math.sin(rot * Math.PI / 180) * s * 0.9;
      o += `<ellipse cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" rx="${s.toFixed(1)}" ry="${(s * 0.36).toFixed(1)}" transform="rotate(${rot} ${ox.toFixed(1)} ${oy.toFixed(1)})" fill="${t.gold}"/>`;
    }
  }
  return o;
}
function mottoCard(t, w, h) {
  const cx = w / 2, sc = w / 1092;
  const cap = (y, s) => `<text x="${cx}" y="${y}" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="${46 * sc}" letter-spacing="${9 * sc}" fill="${t.ink}">${s}</text>`;
  return card(t, w, h, `
    ${chequer(t, cx - 110 * sc, h * 0.2, 22, 10 * sc, { rows: 1 })}
    ${cap(h * 0.42, "DER ZEIT IHRE KUNST")}
    ${cap(h * 0.58, "DER KUNST IHRE FREIHEIT")}
    ${sprig(cx - 40 * sc, h * 0.685, 150 * sc, -1, t, sc * 1.3)}${sprig(cx + 40 * sc, h * 0.685, 150 * sc, 1, t, sc * 1.3)}
    ${diamond(cx, h * 0.685, 10 * sc, t.gold)}
    <text x="${cx}" y="${h * 0.79}" text-anchor="middle" font-family="Noto Serif TC" font-weight="300" font-size="${30 * sc}" letter-spacing="${10 * sc}" fill="${t.goldInk}">給時代它的藝術，給藝術它的自由</text>`);
}

const JOHN = "我實實在在的告訴你們，一粒麥子不落在地裡死了，仍舊是一粒，若是死了，就結出許多子粒來。";
export const STILLS = {
  "kuppel-klein": (t) => domeCard(t, ...SIZE.small),
  "lebensbaum-klein": (t) => treeCard(t, ...SIZE.small),
  "lebensbaum-gross": (t) => treeCard(t, ...SIZE.large),
  "motto-mittel": (t) => mottoCard(t, ...SIZE.medium),
  "weizenkorn-klein": (t) => vertical(t, ...SIZE.small, { cols: ["一粒麥子", "不落在地裡", "死了，", "仍舊是一粒"], cite: "約翰福音十二章", size: 40, gap: 1.6 }),
  "weizenkorn-mittel": (t) => prose(t, ...SIZE.medium, { text: JOHN, cite: "《約翰福音》十二章二十四節", size: 38, per: 22, lead: 1.75 }),
};

function render(svg, file) {
  const png = new Resvg(svg, { font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Noto Serif TC" } }).render().asPng();
  writeFileSync(join(OUT, file), png);
  return png.length;
}
if (import.meta.main) {
  const tag = (t) => (t.name === "light" ? "tag" : "nacht");
  mkdirSync(join(OUT, "wallpaper"), { recursive: true }); mkdirSync(join(OUT, "widgets"), { recursive: true });
  for (const t of Object.values(THEMES)) {
    render(home(t), `wallpaper/wien-${tag(t)}.png`);
    for (const [k, fn] of Object.entries(STILLS)) render(fn(t), `widgets/${k}-${tag(t)}.png`);
  }
  console.log("done; convert to JPEG (quality 93) before committing, as the paper grain makes the PNGs large");
}
