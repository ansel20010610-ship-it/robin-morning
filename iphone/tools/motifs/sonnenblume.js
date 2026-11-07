import { card, diamond } from "../kit.js";
// Otto Wagner's gilded sunflower (Karlsplatz Stadtbahn pavilions, 1899): a disc of 24 lancet petals inside a ring,
// a diamond seed-grid heart, set square in a panel; under the panel, the pavilion's pilaster language: three gilded
// rods, the centre one longest, each ending on a solid square. No stem, no leaves: a disc in a panel, not a plant.
const f = (n) => n.toFixed(1);
export function draw(t, w, h) {
  const k = Math.min(w, h) / 510;
  const cx = w / 2;
  const S = 210 * k, P = S / 2; // the square panel
  const top = 104 * k, cy = top + P;
  const R = 0.88 * P; // the ring: the disc fills 88% of the panel width
  const rTip = R - 5 * k; // petal tips, just inside the ring
  const rBase = rTip - 0.55 * R * 0.92; // petal bases
  const rSeed = rBase - 0.04 * 2 * R; // seed disc rim: a clear gap of 4% of the disc diameter
  const hair = 2 * k; // one hairline for the panel, the frame's weight
  let o = "";

  // the panel: one hairline, a solid gold square at each corner
  o += `<rect x="${f(cx - P)}" y="${f(top)}" width="${f(S)}" height="${f(S)}" fill="${t.paper2}" fill-opacity=".5" stroke="${t.gold}" stroke-width="${hair}"/>`;
  const cs = 9 * k;
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    o += `<rect x="${f(cx + sx * P - cs / 2)}" y="${f(cy + sy * P - cs / 2)}" width="${f(cs)}" height="${f(cs)}" fill="${t.gold}"/>`;
  }

  // the ring just outside the petal tips
  o += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" fill="none" stroke="${t.gold}" stroke-width="${hair}"/>`;

  // 24 identical solid lancet petals: a narrow foot, swelling to its widest a third of the way out, then a long point
  const N = 24;
  let petals = "";
  const L = rTip - rBase;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
    const at = (r, off) => [cx + ca * r + px * off, cy + sa * r + py * off];
    const half = Math.PI * (rBase + L * 0.32) / N * 0.74; // half-width at the widest, leaving a slim gap between petals
    const [b1x, b1y] = at(rBase, -half * 0.5), [b2x, b2y] = at(rBase, half * 0.5);
    const [w1x, w1y] = at(rBase + L * 0.32, -half), [w2x, w2y] = at(rBase + L * 0.32, half);
    const [tx, ty] = at(rTip, 0);
    const [c1x, c1y] = at(rBase + L * 0.72, -half * 0.7), [c2x, c2y] = at(rBase + L * 0.72, half * 0.7);
    const [f1x, f1y] = at(rBase + L * 0.12, -half * 0.95), [f2x, f2y] = at(rBase + L * 0.12, half * 0.95);
    petals += `M ${f(b1x)} ${f(b1y)} Q ${f(f1x)} ${f(f1y)} ${f(w1x)} ${f(w1y)} Q ${f(c1x)} ${f(c1y)} ${f(tx)} ${f(ty)} Q ${f(c2x)} ${f(c2y)} ${f(w2x)} ${f(w2y)} Q ${f(f2x)} ${f(f2y)} ${f(b2x)} ${f(b2y)} Z `;
  }
  o += `<path d="${petals}" fill="${t.gold}"/>`;

  // seed disc: a rim, then a diagonal grid of small diamonds, largest at the heart
  o += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(rSeed)}" fill="${t.paper}" stroke="${t.gold}" stroke-width="${2.2 * k}"/>`;
  const g = 8.6 * k, rr = rSeed - 5 * k; // pitch chosen so the outermost seeds close into an even octagon
  for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
    const x = (i + j) * g * 0.7071, y = (i - j) * g * 0.7071;
    const d = Math.hypot(x, y);
    if (d > rr + 0.1) continue;
    const s = 5 * k * (1 - (d / rr) * 0.38);
    o += diamond(cx + x, cy + y, s, t.gold);
  }

  // the pilaster rods: three gilded rules hanging from the panel, the centre one longest, each on a solid square
  const y0 = top + S;
  const sq = 11 * k, rodW = 2.6 * k;
  for (const [dx, len] of [[-P * 0.5, 62 * k], [0, 100 * k], [P * 0.5, 62 * k]]) {
    const x = cx + dx;
    o += `<line x1="${f(x)}" y1="${f(y0)}" x2="${f(x)}" y2="${f(y0 + len)}" stroke="${t.gold}" stroke-width="${f(rodW)}"/>`;
    o += `<rect x="${f(x - sq / 2)}" y="${f(y0 + len)}" width="${f(sq)}" height="${f(sq)}" fill="${t.gold}"/>`;
  }

  return card(t, w, h, o);
}
