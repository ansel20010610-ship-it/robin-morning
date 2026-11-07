import { card, diamond } from "../kit.js";
// An der schönen blauen Donau, op. 314 (1867), Walzer Nr. 1: the opening of the theme as an engraved incipit.
// D major, 3/4. Upbeat D4 | D4 F#4 A4 (slurred) | A4 dotted half | rest, F#5+A5, F#5+A5 | rest, D5+F#5, D5+F#5 ||
// Everything is drawn as paths: clef, sharps, heads, stems, rests, slur. The gold river under the staff is this
// widget's own divider and is not used elsewhere in the set.
// Medium: the four bars. Small (square): only the rising D-F#-A-A, larger, with the title in two lines.

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

// Quarter rest, an engraved outline in staff spaces: x from its left edge, y = 0 at its top, 3 spaces tall (hung
// 0.5 below the top line so it is centred on the middle line). Heavy "\", hairline neck "/", heavy "\", then the
// "c" hook at the foot. Commands are [op, ...x,y pairs].
const REST_Q = [
  ["M", 0.24, 0.0],
  ["C", 0.6, 0.3, 0.94, 0.62, 1.04, 0.98], // right edge of the upper wedge
  ["C", 0.86, 1.18, 0.64, 1.36, 0.54, 1.48], // hairline neck, right side
  ["C", 0.8, 1.72, 1.02, 1.96, 1.06, 2.24], // right edge of the lower wedge
  ["C", 0.78, 2.18, 0.38, 2.28, 0.24, 2.58], // the hook: over the top, going left
  ["C", 0.1, 2.88, 0.38, 3.06, 0.8, 3.0], // round the bowl to the tail
  ["C", 0.56, 2.92, 0.46, 2.76, 0.54, 2.62], // back along the inside of the hook
  ["C", 0.58, 2.56, 0.62, 2.53, 0.66, 2.5],
  ["C", 0.44, 2.2, 0.26, 1.92, 0.3, 1.6], // left edge of the lower wedge, up to the neck
  ["C", 0.42, 1.42, 0.58, 1.26, 0.66, 1.14], // hairline neck, left side
  ["C", 0.44, 0.84, 0.12, 0.44, 0.08, 0.2], // left edge of the upper wedge
  ["C", 0.06, 0.08, 0.14, 0.0, 0.24, 0.0], // the blunt cap
];

// One engraved staff. Layout: clef, key, time, then the upbeat, then equal-width bars with evenly spaced beats.
function staff(t, { x0, x1, top, s, preFrac, barW, bars, slur, staccato = true, lineW = 1.3 }) {
  const ink = t.ink;
  const Y = (p) => top + 4 * s - p * s / 2; // p: staff position, 0 = bottom line (E4), 8 = top line (F5)
  let o = "";
  for (let i = 0; i < 5; i++) o += `<line x1="${x0}" y1="${f(top + i * s)}" x2="${x1}" y2="${f(top + i * s)}" stroke="${t.ink2}" stroke-width="${lineW}" opacity=".85"/>`;

  // clef
  const cx = x0 + 0.45 * s;
  const clefPts = G_CLEF.map(([x, y, wd]) => [cx + x * s, top + y * s, wd * s]);
  o += `<path d="${stroke(clefPts)}" fill="${ink}"/>`;
  o += `<circle cx="${f(cx + 0.9 * s)}" cy="${f(top + 4.95 * s)}" r="${f(0.4 * s)}" fill="${ink}"/>`;
  o += `<circle cx="${f(clefPts[0][0])}" cy="${f(clefPts[0][1])}" r="${f(0.1 * s)}" fill="${ink}"/>`;

  // key signature: F#5 (top line), C#5 (third space)
  const sharp = (x, y) => {
    const vw = 0.13 * s, bw = 0.42 * s, half = 0.48 * s, rise = 0.17 * s;
    let d = `M${f(x - 0.26 * s - vw / 2)} ${f(y - 1.25 * s)}h${f(vw)}V${f(y + 1.4 * s)}h${f(-vw)}Z`;
    d += `M${f(x + 0.26 * s - vw / 2)} ${f(y - 1.45 * s)}h${f(vw)}V${f(y + 1.2 * s)}h${f(-vw)}Z`;
    for (const dy of [-0.5 * s, 0.5 * s]) {
      const l = x - half, r = x + half;
      d += `M${f(l)} ${f(y + dy + rise - bw / 2)}L${f(r)} ${f(y + dy - rise - bw / 2)}L${f(r)} ${f(y + dy - rise + bw / 2)}L${f(l)} ${f(y + dy + rise + bw / 2)}Z`;
    }
    return `<path d="${d}" fill="${ink}"/>`;
  };
  const kx = cx + 2.68 * s + 1.15 * s;
  o += sharp(kx, Y(8)) + sharp(kx + 1.15 * s, Y(5));

  // time signature 3/4
  const tx = kx + 1.15 * s + 0.48 * s + 1.42 * s;
  // Cormorant's figures are old-style (the 3 and 4 descend), so each digit is fitted by its measured ink box
  // (in em, from the baseline) to fill exactly two spaces: 3 from the top line to the middle, 4 from there down.
  const fs = 3.0 * s;
  for (const [dgt, y0, gt, gb] of [["3", top, -0.4095, 0.2755], ["4", top + 2 * s, -0.3986, 0.1912]]) {
    const k = (1.96 * s) / ((gb - gt) * fs);
    o += `<text transform="translate(${f(tx)} ${f(y0 + 0.02 * s)}) scale(1 ${k.toFixed(3)})" x="0" y="${f(-gt * fs)}" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="${f(fs)}" fill="${ink}">${dgt}</text>`;
  }

  // geometry of heads
  const rx = 0.66 * s, ry = 0.46 * s, rot = -22, rr = rot * Math.PI / 180;
  const halfW = Math.hypot(rx * Math.cos(rr), ry * Math.sin(rr)); // ~0.635 s: heads are ~1.27 spaces wide
  const sw = Math.max(1.6, 0.09 * s), stemLen = 3.5 * s;
  const ell = (x, y, a, b, r) => {
    const c = Math.cos(r * Math.PI / 180), sn = Math.sin(r * Math.PI / 180);
    const p1 = [x + a * c, y + a * sn], p2 = [x - a * c, y - a * sn];
    return `M${f(p1[0])} ${f(p1[1])}A${f(a)} ${f(b)} ${r} 1 0 ${f(p2[0])} ${f(p2[1])}A${f(a)} ${f(b)} ${r} 1 0 ${f(p1[0])} ${f(p1[1])}Z`;
  };
  const head = (x, y, open) => `<path d="${ell(x, y, rx, ry, rot)}${open ? ell(x, y, 0.48 * s, 0.19 * s, -34) : ""}" fill="${ink}" fill-rule="evenodd"/>`;
  const ledger = (x, y) => `<line x1="${f(x - halfW - 0.45 * s)}" y1="${f(y)}" x2="${f(x + halfW + 0.45 * s)}" y2="${f(y)}" stroke="${ink}" stroke-width="${f(lineW * 1.35)}"/>`;
  const rest = (x) => {
    const X = (v) => f(x - 0.56 * s + v * s), Yr = (v) => f(top + 0.5 * s + v * s);
    const d = REST_Q.map(([op, ...v]) => op + v.map((n, k) => (k % 2 ? Yr(n) : X(n))).join(" ")).join("") + "Z";
    return `<path d="${d}" fill="${ink}"/>`;
  };

  const chord = (x, ps, dur) => {
    let c = "";
    const lo = Math.min(...ps), hi = Math.max(...ps);
    const up = (lo + hi) / 2 < 4;
    for (let lp = 10; lp <= hi; lp += 2) c += ledger(x, Y(lp));
    for (let lp = -2; lp >= lo; lp -= 2) c += ledger(x, Y(lp));
    for (const p of ps) c += head(x, Y(p), dur >= 2);
    if (up) {
      const sx = x + halfW - sw / 2;
      c += `<line x1="${f(sx)}" y1="${f(Y(lo) - 0.12 * s)}" x2="${f(sx)}" y2="${f(Y(hi) - stemLen)}" stroke="${ink}" stroke-width="${f(sw)}"/>`;
    } else {
      const sx = x - halfW + sw / 2;
      c += `<line x1="${f(sx)}" y1="${f(Y(hi) + 0.12 * s)}" x2="${f(sx)}" y2="${f(Y(lo) + stemLen)}" stroke="${ink}" stroke-width="${f(sw)}"/>`;
      // staccato on the head side (above), one space clear of the top head, centred on the head
      if (staccato) c += `<circle cx="${f(x)}" cy="${f(Y(hi) - 1.05 * s)}" r="${f(0.2 * s)}" fill="${ink}"/>`;
    }
    if (dur === 3) { // augmentation dot in the space to the right (A4 already sits in a space)
      const dp = hi % 2 === 0 ? hi + 1 : hi;
      c += `<circle cx="${f(x + halfW + 0.5 * s)}" cy="${f(Y(dp))}" r="${f(0.2 * s)}" fill="${ink}"/>`;
    }
    return c;
  };

  // horizontal layout. Bars share one quarter spacing; barW weights let a bar holding a single long note be
  // narrower (the small widget). Without preFrac the first barline is placed just far enough after the time
  // signature for the upbeat to breathe.
  // the last bar ends at the thin line of the final double bar, so every bar has the same room inside
  const thick = 0.5 * s, xEnd = x1 - thick - 0.45 * s;
  const A0 = 0.19, step = 0.3, tail = 1 - A0 - 2 * step; // beat i at B + bw*(A0 + step*i)
  const wts = barW || bars.map(() => 1), sumW = wts.reduce((a, b) => a + b, 0);
  let B1;
  if (preFrac) B1 = x0 + (x1 - x0) * preFrac;
  else {
    const P = tx + 0.62 * s + 1.1 * s + halfW; // upbeat head centre
    B1 = (P + tail * xEnd / sumW) / (1 + tail / sumW);
  }
  const bw = (xEnd - B1) / sumW;
  const notes = [];
  const pick = { x: B1 - bw * tail, ps: [-1], d: 1 };
  notes.push(pick);
  o += chord(pick.x, pick.ps, 1);
  let B = B1;
  bars.forEach((bar, bi) => {
    o += `<line x1="${f(B)}" y1="${f(top)}" x2="${f(B)}" y2="${f(top + 4 * s)}" stroke="${ink}" stroke-width="${f(sw)}"/>`;
    let beat = 0;
    for (const e of bar) {
      const x = B + bw * (A0 + step * beat);
      if (e === "r") o += rest(x);
      else { o += chord(x, e[0], e[1]); notes.push({ x, ps: e[0], d: e[1] }); }
      beat += e === "r" ? 1 : e[1];
    }
    B += bw * wts[bi];
  });
  // final barline: thin, gap, thick
  o += `<rect x="${f(x1 - thick)}" y="${f(top - lineW / 2)}" width="${f(thick)}" height="${f(4 * s + lineW)}" fill="${ink}"/>`;
  o += `<line x1="${f(xEnd)}" y1="${f(top)}" x2="${f(xEnd)}" y2="${f(top + 4 * s)}" stroke="${ink}" stroke-width="${f(sw)}"/>`;

  // slur under D F# A: a crescent, hairline at the tips, ~1.35x a staff line at the middle
  if (slur) {
    const [a, b] = [notes[slur[0]], notes[slur[1]]];
    const xa = a.x - 0.05 * s, ya = Y(a.ps[0]) + 0.75 * s, xb = b.x + 0.1 * s, yb = Y(b.ps[0]) + 0.75 * s;
    const dx = xb - xa, dy = yb - ya, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const dep = 0.9 * s, th = lineW * 1.35 * 0.75; // control-point offset that yields ~lineW*1.35 at the apex
    const c = (k, dd) => [xa + dx * k + nx * dd, ya + dy * k + ny * dd];
    const [c1, c2, c3, c4] = [c(0.25, dep + th), c(0.75, dep + th), c(0.75, dep - th), c(0.25, dep - th)];
    o += `<path d="M${f(xa)} ${f(ya)}C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(xb)} ${f(yb)}C${f(c3[0])} ${f(c3[1])} ${f(c4[0])} ${f(c4[1])} ${f(xa)} ${f(ya)}Z" fill="${ink}"/>`;
  }
  return o;
}

// The river: one long fine gold wave, fading in and out at its ends, a diamond at its centre.
function river(t, mid, oy, half, waves, amp, ds) {
  const wl = (2 * half) / waves;
  let d = "";
  for (let x = -half; x <= half + 0.1; x += 3) {
    const fade = Math.sin(Math.PI * (x + half) / (2 * half)) ** 0.6;
    d += (x === -half ? "M" : "L") + f(mid + x) + " " + f(oy + Math.sin((x / wl) * 2 * Math.PI) * amp * fade);
  }
  return `<path d="${d}" fill="none" stroke="${t.gold}" stroke-width="1.5" stroke-linecap="round"/>` + diamond(mid, oy, ds, t.gold);
}

const D4 = -1, Fs4 = 1, A4 = 3, D5 = 6, Fs5 = 8, A5 = 10;

export function draw(t, w, h) {
  const mid = w / 2;
  let o = "";
  if (w > h) {
    const s = 19, x0 = 100, x1 = w - 100, top = 208;
    o += staff(t, {
      x0, x1, top, s, preFrac: 0.25, slur: [1, 3],
      bars: [
        [[[D4], 1], [[Fs4], 1], [[A4], 1]],
        [[[A4], 3]],
        ["r", [[Fs5, A5], 1], [[Fs5, A5], 1]],
        ["r", [[D5, Fs5], 1], [[D5, Fs5], 1]],
      ],
    });
    o += `<text x="${mid}" y="134" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-weight="500" font-size="44" fill="${t.ink}">An der schönen blauen Donau</text>`;
    const oy = 358;
    o += river(t, mid, oy, (x1 - x0) / 2, 4.5, 6.5, 9);
    o += `<text x="${mid}" y="${oy + 42}" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="21" letter-spacing="5" fill="${t.goldInk}">JOHANN STRAUSS · 1867</text>`;
  } else {
    const s = 15, x0 = 74, x1 = w - 74, top = 258;
    o += `<text x="${mid}" y="140" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-weight="500" font-size="46" fill="${t.ink}">An der schönen</text>`;
    o += `<text x="${mid}" y="188" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-weight="500" font-size="46" fill="${t.ink}">blauen Donau</text>`;
    o += staff(t, {
      x0, x1, top, s, slur: [1, 3], lineW: 1.3, barW: [1, 0.66],
      bars: [
        [[[D4], 1], [[Fs4], 1], [[A4], 1]],
        [[[A4], 3]],
      ],
    });
    o += river(t, mid, 390, (x1 - x0) / 2, 2.5, 5.5, 8);
  }
  return card(t, w, h, o);
}
