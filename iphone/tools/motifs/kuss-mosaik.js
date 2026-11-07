import { card, diamond } from "../kit.js";
// Der Kuss as pure gold-leaf pattern, on the paper itself: a tall field in one gold hairline, split by a single S-curve.
// Left, the man's robe: three staggered columns of upright bars (gold, ink, gold outline with an inner bar).
// Right, the woman's dress: double rings with a centre dot and a few Klimt dot-rosettes, a scatter of square
// tesserae in the gaps. DER KUSS beneath.
export function draw(t, w, h) {
  const f = (n) => n.toFixed(1);
  const dark = t.name === "dark";
  const G = t.gold, SW = 1.5;
  const INK = dark ? "#0B0906" : t.ink; // dark mode: a deep brown-black bar edged in gold, no cream

  const pw = 206, ph = 296, x0 = (w - pw) / 2, y0 = 76, x1 = x0 + pw, y1 = y0 + ph;
  // the dividing curve: one lyrical S, leaning right high up and swinging left low down
  const xc = x0 + 82, sway = 15;
  const X = (y) => xc + sway * Math.sin(Math.PI * 2 * ((y - y0) / ph) * 0.85 + 0.6);
  const curve = Array.from({ length: 121 }, (_, i) => { const y = y0 + i / 120 * ph; return [X(y), y]; });
  const cd = curve.map((p, i) => (i ? "L" : "M") + f(p[0]) + " " + f(p[1])).join("");
  const dCurve = (x, y) => Math.min(...curve.map(([a, b]) => Math.hypot(a - x, b - y)));

  // ——— the robe: 3 columns, bars 15 wide with 4 gaps, staggered like brickwork, in 3 lengths ———
  // Each column is a run of bars (top, bottom, kind) laid by hand like brickwork: lengths 22/34/50 (the end bars are
  // trimmed by the field), joints in neighbouring columns at least ~10px apart. Kinds: g gold, o gold outline with an
  // inner bar, k ink — ink spread on a zigzag, never two alike stacked in one column.
  const bw = 15, gap = 4, top0 = y0 + 6, bot0 = y1 - 6; // 82 … 366
  const runs = [
    [[82, 132, "g"], [136, 158, "o"], [162, 196, "g"], [200, 250, "k"], [254, 288, "g"], [292, 314, "o"], [318, 366, "g"]],
    [[82, 114, "o"], [118, 168, "k"], [172, 206, "g"], [210, 260, "o"], [264, 298, "g"], [302, 336, "k"], [340, 366, "o"]],
    [[82, 100, "o"], [104, 154, "g"], [158, 180, "o"], [184, 218, "g"], [222, 244, "o"], [248, 282, "k"], [286, 308, "o"], [312, 366, "g"]],
  ];
  const sy = (bot0 - top0) / (366 - 82), my = (v) => top0 + (v - 82) * sy;
  const bars = runs.flatMap((run, ci) => run.map(([a, b, k]) => ({ x: x0 + 7 + ci * (bw + gap), top: my(a), bot: my(b), k })));
  let man = "";
  for (const { x, top, bot, k } of bars) {
    const hh = bot - top;
    if (k === "g") man += `<rect x="${x}" y="${f(top)}" width="${bw}" height="${f(hh)}" fill="${G}"/>`;
    else if (k === "k") man += dark
      ? `<rect x="${x + SW / 2}" y="${f(top + SW / 2)}" width="${bw - SW}" height="${f(hh - SW)}" fill="${INK}" stroke="${G}" stroke-width="${SW}"/>`
      : `<rect x="${x}" y="${f(top)}" width="${bw}" height="${f(hh)}" fill="${INK}"/>`;
    else man += `<rect x="${x + SW / 2}" y="${f(top + SW / 2)}" width="${bw - SW}" height="${f(hh - SW)}" fill="none" stroke="${G}" stroke-width="${SW}"/>
      <rect x="${x + 5}" y="${f(top + 5)}" width="${bw - 10}" height="${f(hh - 10)}" fill="${G}"/>`;
  }
  const robeR = x0 + 7 + 3 * bw + 2 * gap; // right edge of the robe

  // ——— the dress: rings and rosettes, each clear of the curve and the edge ———
  const R = { B: 15.5, S: 10.5, D: 8.5 }; // big ring, small ring, dot rosette (outer reach)
  const items = [
    [98, 0.06, "B"], [104, 0.95, "D"],
    [140, 0.55, "S"],
    [162, 0.04, "D"], [176, 0.94, "B"],
    [206, 0.36, "B"],
    [234, 0.96, "S"],
    [248, 0.02, "S"],
    [268, 0.62, "D"],
    [296, 0.1, "B"], [306, 0.95, "D"],
    [332, 0.52, "S"],
    [354, 0.06, "D"], [352, 0.96, "S"],
  ];
  const clr = 4;
  const placed = items.map(([y, fr, k]) => {
    const r = R[k], a = X(y) + r + clr + 2, b = x1 - r - clr - 2;
    return [a + (b - a) * fr, y, r, k];
  });
  let woman = "";
  for (const [x, y, r, k] of placed) {
    const dc = dCurve(x, y);
    if (dc < r + clr) console.warn("kuss: item too close to curve", f(x), f(y), f(dc - r));
    if (k === "B" || k === "S") {
      woman += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r - SW / 2)}"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.5)}"/>`;
    }
  }
  let dots = "";
  for (const [x, y, r, k] of placed) {
    if (k === "B") dots += `<circle cx="${f(x)}" cy="${f(y)}" r="2.4"/>`;
    else if (k === "S") dots += `<circle cx="${f(x)}" cy="${f(y)}" r="1.6"/>`;
    else {
      dots += `<circle cx="${f(x)}" cy="${f(y)}" r="2.2"/>`;
      for (let j = 0; j < 6; j++) { const a = j / 6 * Math.PI * 2 - Math.PI / 2; dots += `<circle cx="${f(x + Math.cos(a) * 5.6)}" cy="${f(y + Math.sin(a) * 6.4)}" r="2"/>`; }
    }
  }

  // ——— tesserae: 3px squares in the dress's gaps and a few along the curve ———
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const tess = [];
  const free = (x, y, extra) => placed.every(([a, b, r]) => Math.hypot(a - x, b - y) > r + extra) && tess.every(([a, b]) => Math.hypot(a - x, b - y) > 17);
  for (let i = 0; i < 6000 && tess.length < 22; i++) {
    const x = x0 + rnd() * pw, y = y0 + 8 + rnd() * (ph - 16);
    if (x < X(y) + 7 || x > x1 - 7) continue;
    if (free(x, y, 7)) tess.push([x, y]);
  }
  // along the curve, in the sliver between the robe and the S
  for (const [y, dx] of [[116, -4], [146, 4]]) { const x = (robeR + X(y)) / 2 + dx; if (X(y) - robeR > 14) tess.push([x, y]); }
  for (const y of [242]) { const x = X(y) + 7; tess.push([x, y]); }
  const sq = tess.map(([x, y]) => `<rect x="${f(Math.round(x) - 1.5)}" y="${f(Math.round(y) - 1.5)}" width="3" height="3"/>`).join("");

  const top = curve[0], bot = curve[curve.length - 1];
  const body = `
    <g>${man}</g>
    <g fill="none" stroke="${G}" stroke-width="${SW}">${woman}</g>
    <g fill="${G}">${dots}${sq}</g>
    <path d="${cd}" fill="none" stroke="${G}" stroke-width="${SW}"/>
    <rect x="${x0}" y="${y0}" width="${pw}" height="${ph}" fill="none" stroke="${G}" stroke-width="${SW}"/>
    ${diamond(top[0], top[1], 9, G)}${diamond(bot[0], bot[1], 9, G)}
    <text x="${w / 2}" y="${y1 + 50}" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="${w * 0.045}" letter-spacing="${w * 0.012}" fill="${t.goldInk}">DER KUSS</text>`;
  return card(t, w, h, body);
}
