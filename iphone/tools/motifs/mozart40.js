import { card, diamond } from "../kit.js";
// Symphonie Nr. 40 g-Moll, KV 550 (Wien 1788), I. Molto allegro: the first-violin theme as an engraved incipit.
// G minor (two flats), cut time. Upbeat Eb5 D5 | D5, Eb5 D5, D5, Eb5 D5 | D5, Bb5, rest, Bb5 A5 | G5, G5 F5, Eb5, Eb5 D5 |
// Everything is drawn as paths (clef, flats, the cut-C, heads, stems, beams, rest, slur); only the "p" is type.
// Helpers (stroke, clef, rest, heads, river) follow donauwalzer.js so the two scores read as one hand.
// Medium: upbeat and three bars. Small (square): upbeat and the first bar, larger, the title in two lines.

const f = (n) => n.toFixed(1);

// A calligraphic stroke: a Catmull-Rom centreline through pts [[x, y, width], ...], filled as an outline.
function stroke(pts, k = 10) {
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  const S = [];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      const c = (a) => 0.5 * (2 * p1[a] + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t2 + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t3);
      S.push([c(0), c(1), p1[2] + (p2[2] - p1[2]) * (t2 * (3 - 2 * t))]);
    }
  }
  S.push(pts[pts.length - 1]);
  const L = [], R = [];
  S.forEach((p, i) => {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
    const w = p[2] / 2;
    L.push([p[0] - dy * w, p[1] + dx * w]); R.push([p[0] + dy * w, p[1] - dx * w]);
  });
  const ring = [...L, ...R.reverse()];
  return "M" + ring.map(([x, y]) => f(x) + " " + f(y)).join("L") + "Z";
}

// Treble clef in staff spaces: x from the clef's left edge, y = 0 on the top line, 3 on the G line.
const G_CLEF = [
  [1.34, 3.42, 0.2], [1.06, 2.9, 0.24], [1.3, 2.28, 0.18], [1.9, 2.02, 0.13], [2.5, 2.36, 0.14], [2.68, 3.0, 0.17],
  [2.44, 3.72, 0.22], [1.82, 4.06, 0.25], [0.92, 3.88, 0.36], [0.28, 3.27, 0.47], [0.13, 2.5, 0.52], [0.38, 1.68, 0.5],
  [0.99, 0.91, 0.45], [1.73, 0.22, 0.38], [2.3, -0.42, 0.38], [2.45, -0.95, 0.33], [2.12, -1.3, 0.23], [1.66, -1.06, 0.15],
  [1.38, -0.5, 0.1], [1.37, 0.4, 0.095], [1.53, 1.45, 0.095], [1.8, 2.82, 0.1], [2.0, 4.34, 0.11], [2.0, 5.12, 0.12],
  [1.74, 5.52, 0.14], [1.24, 5.56, 0.15], [0.82, 5.36, 0.15],
];

// Quarter rest, an engraved outline in staff spaces (as in donauwalzer.js): x from its left edge, y = 0 at its top,
// 3 spaces tall, hung 0.5 below the top line so it is centred on the middle line. The neck is a touch fuller
// than in the waltz so it holds at phone size.
const REST_Q = [
  ["M", 0.24, 0.0],
  ["C", 0.6, 0.3, 0.94, 0.62, 1.04, 0.98],
  ["C", 0.84, 1.2, 0.6, 1.38, 0.5, 1.5],
  ["C", 0.78, 1.72, 1.02, 1.96, 1.06, 2.24],
  ["C", 0.78, 2.18, 0.38, 2.28, 0.24, 2.58],
  ["C", 0.1, 2.88, 0.38, 3.06, 0.8, 3.0],
  ["C", 0.56, 2.92, 0.46, 2.76, 0.54, 2.62],
  ["C", 0.58, 2.56, 0.62, 2.53, 0.66, 2.5],
  ["C", 0.44, 2.2, 0.26, 1.92, 0.3, 1.6],
  ["C", 0.44, 1.36, 0.62, 1.2, 0.72, 1.1],
  ["C", 0.44, 0.84, 0.12, 0.44, 0.08, 0.2],
  ["C", 0.06, 0.08, 0.14, 0.0, 0.24, 0.0],
];

// Staff positions: 0 = bottom line (E4), 4 = middle line (B4), 8 = top line (F5).
const D5 = 6, Eb5 = 7, F5 = 8, G5 = 9, A5 = 10, Bb5 = 11;

// One engraved staff. Events: [pos, dur] with dur 1 = quarter, 0.5 = eighth; "r" = quarter rest; "|" = barline.
// Eighths are beamed in pairs as they come. Horizontal spacing is by duration (each slot is a head's width plus white,
// a quarter's white twice an eighth's), so every beamed pair is evenly spaced and the bars breathe alike.
function staff(t, { x0, x1, top, s, events, slur, dyn, lineW = 1.3 }) {
  const ink = t.ink;
  const Y = (p) => top + 4 * s - p * s / 2;
  let o = "";
  for (let i = 0; i < 5; i++) o += `<line x1="${x0}" y1="${f(top + i * s)}" x2="${x1}" y2="${f(top + i * s)}" stroke="${t.ink2}" stroke-width="${lineW}" opacity=".85"/>`;

  // clef
  const cx = x0 + 0.45 * s;
  const clefPts = G_CLEF.map(([x, y, wd]) => [cx + x * s, top + y * s, wd * s]);
  o += `<path d="${stroke(clefPts)}" fill="${ink}"/>`;
  o += `<circle cx="${f(cx + 0.9 * s)}" cy="${f(top + 4.95 * s)}" r="${f(0.4 * s)}" fill="${ink}"/>`;
  o += `<circle cx="${f(clefPts[0][0])}" cy="${f(clefPts[0][1])}" r="${f(0.1 * s)}" fill="${ink}"/>`;

  // key signature: Bb (middle line), Eb (top space). A flat: a hairline stem from 1.8 spaces above its line down to
  // half a space below, and a bowl that swells to the right and tapers back into the foot of the stem.
  const flat = (x, y) => {
    const X = (v) => f(x + v * s), Yf = (v) => f(y + v * s);
    let d = `M${X(-0.06)} ${Yf(-1.8)}H${X(-0.06 + 0.12)}V${Yf(0.58)}H${X(-0.06)}Z`;
    // outer contour of the bowl, then its counter (evenodd): the right side swells, the foot comes to a point
    d += `M${X(0.06)} ${Yf(-0.26)}C${X(0.3)} ${Yf(-0.62)} ${X(0.76)} ${Yf(-0.7)} ${X(0.82)} ${Yf(-0.34)}`;
    d += `C${X(0.86)} ${Yf(-0.02)} ${X(0.52)} ${Yf(0.28)} ${X(0.06)} ${Yf(0.58)}Z`;
    d += `M${X(0.06)} ${Yf(0.3)}C${X(0.34)} ${Yf(0.12)} ${X(0.54)} ${Yf(-0.08)} ${X(0.53)} ${Yf(-0.3)}`;
    d += `C${X(0.52)} ${Yf(-0.48)} ${X(0.28)} ${Yf(-0.44)} ${X(0.06)} ${Yf(-0.1)}Z`;
    return `<path d="${d}" fill="${ink}" fill-rule="evenodd"/>`;
  };
  const kx = cx + 2.68 * s + 1.0 * s;
  o += flat(kx, Y(4)) + flat(kx + 1.05 * s, Y(7));

  // cut time: a C two spaces tall about the middle line (heavy on the left, ball at the upper tip), and a stroke
  // through it reaching a space above and below the C.
  const tx = kx + 1.05 * s + 0.9 * s + 1.45 * s, ty = Y(4);
  const R = [0.95, 1.06];
  const cPts = [];
  const arc = [[-40, 0.12], [-70, 0.14], [-110, 0.26], [-155, 0.46], [-180, 0.5], [-205, 0.46], [-245, 0.26], [-282, 0.13], [-314, 0.09]];
  for (const [a, wd] of arc) {
    const r = a * Math.PI / 180;
    cPts.push([tx + R[0] * s * Math.cos(r), ty + R[1] * s * Math.sin(r), wd * s]);
  }
  o += `<path d="${stroke(cPts)}" fill="${ink}"/>`;
  const ba = -36 * Math.PI / 180;
  o += `<circle cx="${f(tx + (R[0] - 0.2) * s * Math.cos(ba))}" cy="${f(ty + (R[1] - 0.12) * s * Math.sin(ba) + 0.1 * s)}" r="${f(0.24 * s)}" fill="${ink}"/>`;
  o += `<rect x="${f(tx - 0.075 * s)}" y="${f(ty - 1.62 * s)}" width="${f(0.15 * s)}" height="${f(3.24 * s)}" fill="${ink}"/>`;

  // heads
  const rx = 0.66 * s, ry = 0.46 * s, rot = -22, rr = rot * Math.PI / 180;
  const halfW = Math.hypot(rx * Math.cos(rr), ry * Math.sin(rr));
  const sw = Math.max(1.6, 0.09 * s), stemLen = 3.5 * s, beamT = 0.5 * s;
  const ell = (x, y, a, b, r) => {
    const c = Math.cos(r * Math.PI / 180), sn = Math.sin(r * Math.PI / 180);
    const p1 = [x + a * c, y + a * sn], p2 = [x - a * c, y - a * sn];
    return `M${f(p1[0])} ${f(p1[1])}A${f(a)} ${f(b)} ${r} 1 0 ${f(p2[0])} ${f(p2[1])}A${f(a)} ${f(b)} ${r} 1 0 ${f(p1[0])} ${f(p1[1])}Z`;
  };
  const head = (x, y) => `<path d="${ell(x, y, rx, ry, rot)}" fill="${ink}"/>`;
  const ledger = (x, y, ov = 0.32 * s) => `<line x1="${f(x - halfW - ov)}" y1="${f(y)}" x2="${f(x + halfW + ov)}" y2="${f(y)}" stroke="${ink}" stroke-width="${f(lineW * 1.35)}"/>`;
  const rest = (x) => {
    const X = (v) => f(x - 0.56 * s + v * s), Yr = (v) => f(top + 0.5 * s + v * s);
    const d = REST_Q.map(([op, ...v]) => op + v.map((n, k) => (k % 2 ? Yr(n) : X(n))).join(" ")).join("") + "Z";
    return `<path d="${d}" fill="${ink}"/>`;
  };
  // every note here sits on or above the middle line: stems down, on the left of the head
  const stemX = (x) => x - halfW + sw / 2;
  const stem = (x, p, yEnd) => `<line x1="${f(stemX(x))}" y1="${f(Y(p) + 0.12 * s)}" x2="${f(stemX(x))}" y2="${f(yEnd)}" stroke="${ink}" stroke-width="${f(sw)}"/>`;
  // ov: how far a ledger overhangs the head on each side (shortened inside a beamed pair so the two never join)
  const note = (x, p, ov) => {
    let c = "";
    for (let lp = 10; lp <= p; lp += 2) c += ledger(x, Y(lp), ov);
    return c + head(x, Y(p));
  };

  // horizontal layout
  const preX = tx + 1.0 * s + 0.7 * s + halfW; // first head after the time signature
  const padL = 0.95 * s + halfW; // barline to the first head of a bar
  // a slot is a head's width plus white that grows with the duration (a quarter's white twice the eighth's)
  const white = (e) => (e === "|" ? 0 : e === "r" || e[1] === 1 ? 2.0 : 1);
  const nSlots = events.filter((e) => e !== "|").length;
  const nBars = events.filter((e) => e === "|").length; // the last one is the closing barline
  const g = (x1 - sw / 2 - preX - (nBars - 1) * padL - nSlots * 2 * halfW) / events.reduce((a, e) => a + white(e), 0);
  const slotOf = (e) => (e === "|" ? 0 : 2 * halfW + g * white(e));
  let x = preX;
  const placed = [];
  events.forEach((e, i) => {
    if (e === "|") {
      const bx = i === events.length - 1 ? x1 - sw / 2 : x - 0.0;
      o += `<line x1="${f(bx)}" y1="${f(top)}" x2="${f(bx)}" y2="${f(top + 4 * s)}" stroke="${ink}" stroke-width="${f(sw)}"/>`;
      x = bx + padL;
      return;
    }
    placed.push({ x, e });
    x += slotOf(e);
  });

  // draw notes; pair the eighths under one beam
  const ns = [];
  for (let i = 0; i < placed.length; i++) {
    const { x, e } = placed[i];
    if (e === "r") { o += rest(x); continue; }
    const [p, d] = e;
    // a lone quarter keeps the full ledger overhang; in a beamed pair the ledgers are shortened so the two keep
    // a clear gap of at least 0.28 spaces between them and never join
    const ov = d === 1 ? 0.32 * s : Math.min(0.32 * s, (g - 0.28 * s) / 2);
    o += note(x, p, ov); ns.push({ x, p });
    if (d === 1) o += stem(x, p, Math.max(Y(p) + stemLen, Y(4)));
    else {
      const b = placed[++i], [q] = b.e;
      o += note(b.x, q, ov); ns.push({ x: b.x, p: q });
      // beam slope follows the pair: a quarter space per step, capped at one space; then hung so the shorter
      // stem is a full 3.5 spaces and both reach the middle line
      const steps = p - q, slope = Math.sign(steps) * Math.min(1, 0.25 * Math.abs(steps)) * s; // + = falling
      const xa = stemX(x), xb = stemX(b.x);
      const base = Math.max(Y(p) + stemLen, Y(q) + stemLen - slope, Y(4) + beamT, Y(4) + beamT - slope);
      const ya = base, yb = base + slope;
      o += stem(x, p, ya) + stem(b.x, q, yb);
      const l = xa - sw / 2, r = xb + sw / 2, k = (yb - ya) / (xb - xa);
      const yl = ya - k * (sw / 2), yr = yb + k * (sw / 2);
      o += `<path d="M${f(l)} ${f(yl)}L${f(r)} ${f(yr)}L${f(r)} ${f(yr - beamT)}L${f(l)} ${f(yl - beamT)}Z" fill="${ink}"/>`;
    }
  }

  // slur on the head side (above), from the upbeat into the downbeat: a crescent, hairline at the tips
  if (slur) {
    const [a, b] = [ns[slur[0]], ns[slur[1]]];
    const xa = a.x + 0.05 * s, ya = Y(a.p) - 0.85 * s, xb = b.x + 0.05 * s, yb = Y(b.p) - 0.85 * s;
    const dx = xb - xa, dy = yb - ya, L = Math.hypot(dx, dy), nx = dy / L, ny = -dx / L;
    const dep = 0.85 * s, th = lineW * 1.35 * 0.75;
    const c = (k, dd) => [xa + dx * k + nx * dd, ya + dy * k + ny * dd];
    const [c1, c2, c3, c4] = [c(0.25, dep + th), c(0.75, dep + th), c(0.75, dep - th), c(0.25, dep - th)];
    o += `<path d="M${f(xa)} ${f(ya)}C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(xb)} ${f(yb)}C${f(c3[0])} ${f(c3[1])} ${f(c4[0])} ${f(c4[1])} ${f(xa)} ${f(ya)}Z" fill="${ink}"/>`;
  }

  // dynamic: piano, under the first note, below the beams
  if (dyn) {
    const fs = 1.9 * s;
    o += `<text x="${f(ns[0].x - 0.5 * s)}" y="${f(top + 4 * s + dyn * s)}" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-weight="500" font-size="${f(fs)}" fill="${ink}" stroke="${ink}" stroke-width="${f(0.06 * s)}" stroke-linejoin="round">p</text>`;
  }
  return o;
}

// The gold wave rule, fading in and out at its ends, a diamond at its centre.
function river(t, mid, oy, half, waves, amp, ds) {
  const wl = (2 * half) / waves;
  let d = "";
  for (let x = -half; x <= half + 0.1; x += 3) {
    const fade = Math.sin(Math.PI * (x + half) / (2 * half)) ** 0.6;
    d += (x === -half ? "M" : "L") + f(mid + x) + " " + f(oy + Math.sin((x / wl) * 2 * Math.PI) * amp * fade);
  }
  return `<path d="${d}" fill="none" stroke="${t.gold}" stroke-width="1.5" stroke-linecap="round"/>` + diamond(mid, oy, ds, t.gold);
}

const E = 0.5, Q = 1;
const UPBEAT = [[Eb5, E], [D5, E], "|"];
const BAR1 = [[D5, Q], [Eb5, E], [D5, E], [D5, Q], [Eb5, E], [D5, E], "|"];
const BAR2 = [[D5, Q], [Bb5, Q], "r", [Bb5, E], [A5, E], "|"];
const BAR3 = [[G5, Q], [G5, E], [F5, E], [Eb5, Q], [Eb5, E], [D5, E], "|"];

export function draw(t, w, h) {
  const mid = w / 2;
  let o = "";
  if (w > h) {
    const s = 18, x0 = 92, x1 = w - 92, top = 210;
    o += `<text x="${mid}" y="132" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-weight="500" font-size="44" fill="${t.ink}">Symphonie Nr. 40 g-Moll</text>`;
    o += staff(t, { x0, x1, top, s, events: [...UPBEAT, ...BAR1, ...BAR2, ...BAR3], slur: [0, 2], dyn: 2.5 });
    const oy = 362;
    o += river(t, mid, oy, (x1 - x0) / 2, 4.5, 6.5, 9);
    o += `<text x="${mid}" y="${oy + 42}" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="21" letter-spacing="5" fill="${t.goldInk}">W. A. MOZART · KV 550 · WIEN 1788</text>`;
  } else {
    const s = 15, x0 = 64, x1 = w - 64, top = 258;
    o += `<text x="${mid}" y="140" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-weight="500" font-size="46" fill="${t.ink}">Symphonie Nr. 40</text>`;
    o += `<text x="${mid}" y="188" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-weight="500" font-size="46" fill="${t.ink}">g-Moll</text>`;
    o += staff(t, { x0, x1, top, s, events: [...UPBEAT, ...BAR1], slur: [0, 2], dyn: 2.6 });
    o += river(t, mid, 400, (x1 - x0) / 2, 2.5, 5.5, 8);
  }
  return card(t, w, h, o);
}
