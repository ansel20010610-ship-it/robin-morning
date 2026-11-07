import { card, diamond } from "../kit.js";
// Thonet No. 14, the Viennese café chair, in three-quarter view: one front leg nearest, the other front leg and the
// near back leg either side; the far back leg stands hidden behind the nearest one, so the back loop's far upright
// simply passes behind the seat rim. Built in 3D (cm),
// projected orthographically, fitted to the card, and drawn as one gold line weight with round caps. Members are
// stacked back to front; where one passes behind another it stops a hair short, as an engraver would cut it.

// Catmull-Rom through key points, sampled densely.
function spline(pts, per = 12) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const s = k / per, s2 = s * s, s3 = s2 * s;
      out.push(p1.map((_, d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * s + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * s2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * s3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
const f = (n) => n.toFixed(1);

export function draw(t, w, h, o = {}) {
  const AL = ((o.al ?? 42) * Math.PI) / 180, PH = ((o.ph ?? 16.5) * Math.PI) / 180;
  const sa = Math.sin(AL), ca = Math.cos(AL);
  // raw projection (1 unit = 1 cm); fitted to the card afterwards
  const raw = ([x, y, z]) => [x * ca - y * sa, -z * Math.cos(PH) + (x * sa + y * ca) * Math.sin(PH)];

  const SZ = 46, RS = 21, BAND = 3.6;
  // the outer piece: far back leg, up past the seat, over the arch, down the near back leg. Profile in (u across,
  // z up); depth from the height: the legs sweep back to the floor, the back leans and is dished around the sitter.
  // the back leans from the seat up and the legs sweep back from it down, both easing in so the bend is smooth
  const lean = (z) => { const d = z - SZ; return 0.2 * (d - 6 * (1 - Math.exp(-d / 6))); };
  const lift = (z) => { const q = Math.min(1, Math.max(0, (z - SZ) / 22)); return q * q * (3 - 2 * q); };
  const yBack = (u, z) => {
    if (z < SZ) { const s = (SZ - z) / SZ; return -18 - 6.5 * s * s; }
    return -18 - lean(z) - 2.4 * Math.max(0, 1 - (u / 15) ** 2) * lift(z);
  };
  const to3 = (pts) => pts.map(([u, z]) => [u, yBack(u, z), z]);
  // one continuous spline through the whole profile, so the uprights run into the arch without a seam
  const mirror = (pts) => [...pts.map(([u, z]) => [-u, z]), ...pts.slice(0, -1).reverse()];
  const outerKeys = mirror([[17.5, 0], [17.2, 22], [17.0, SZ], [16.4, 60], [15.4, 70], [14.2, 79], [12.3, 87.4], [7.1, 92.9], [0, 94.9]].map(([u, z]) => [u, z]));
  const outer = to3(spline(outerKeys, 10).filter(([u, z]) => u > 0 || z >= SZ - BAND - 3));

  // the inner hoop: off the back of the seat rim, swelling out to the uprights, closing in a round arch; pinched a
  // little at the waist as it comes down, and standing on the rim circle itself
  const IC = 64, IR = 10.4, FU = 8.6, FY = -Math.sqrt(RS * RS - FU * FU);
  const hoopKeys = mirror([[FU, SZ], [8.5, 49.5], [9.2, 54.5], [10.1, 59.5], [IR, IC], [9.77, 67.6], [7.35, 71.4], [3.56, 73.8], [0, IC + IR]]);
  const hoopY = (u, z) => FY - lean(z) - 2.4 * Math.max(0, 1 - (u / 15) ** 2) * lift(z);
  const inner = spline(hoopKeys, 10).map(([u, z]) => [u, hoopY(u, z), z]);

  // front legs: from under the seat band, splaying out, flaring a little toward the foot
  const LA = (42 * Math.PI) / 180, R0 = 16.6, R1 = 21.6;
  const fleg = (s) => Array.from({ length: 25 }, (_, i) => {
    const q = i / 24, r = R0 + (R1 - R0) * (0.6 * q + 0.4 * q * q);
    return [s * Math.sin(LA) * r, Math.cos(LA) * r, (SZ - BAND) * (1 - q)];
  });
  const FR = fleg(1), FL = fleg(-1); // FR is the leg nearest the viewer

  // seat: the top circle and the band's lower circle
  const circ = (r, z, n = 120, cy = 0) => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.sin(a) * r, cy + Math.cos(a) * r, z]; });

  // ——— fit: scale and place so the nearest foot stands at FOOT and the arch top at TOP
  const all = [...outer, ...inner, ...FR, ...FL, ...circ(RS, SZ)].map(raw);
  const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
  const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
  const TOP = o.top ?? 92, FOOT = o.foot ?? 368;
  const k = (FOOT - TOP) / (maxY - minY);
  const ox = w / 2 - ((minX + maxX) / 2) * k, oy = TOP - minY * k;
  const P = (p) => { const [x, y] = raw(p); return [ox + x * k, oy + y * k]; };
  const line = (pts3) => "M" + pts3.map(P).map((q) => f(q[0]) + " " + f(q[1])).join("L");

  // the leg ring, at RZ: a circle about the seat axis, sized on screen so its ellipse just meets the far-left leg and
  // the near back leg at its ends and never sticks out past them
  const RZ = o.rz ?? 23;
  const xAtY = (pts3, y) => { const p = pts3.map(P); let best = p[0]; for (const q of p) if (Math.abs(q[1] - y) < Math.abs(best[1] - y)) best = q; return best[0]; };
  const SW = o.sw ?? 3.5, GAP = 2.4;
  let rc = -3, rr = 18;
  for (let it = 0; it < 30; it++) {
    const c = P([0, rc, RZ]);
    const xl = xAtY(FL, c[1]) + SW * 0.6, xr = xAtY(outer.slice(-60), c[1]) - SW * 0.6;
    const want = (xr - xl) / 2 / k;
    rr += (want - rr) * 0.7;
    const midRaw = ((xl + xr) / 2 - ox) / k; // the screen-x the centre should sit at
    const cur = (c[0] - ox) / k;
    rc += (cur - midRaw) / sa * 0.7; // moving the centre back (−y) moves it right on screen by sa per cm
  }
  const ring = circ(rr, RZ, 160, rc);

  const sc = P([0, 0, SZ]), sb = P([0, 0, SZ - BAND]);
  const rx = RS * k, ry = RS * k * Math.sin(PH);
  const seatFill = `M ${f(sc[0] - rx)} ${f(sc[1])} A ${f(rx)} ${f(ry)} 0 0 1 ${f(sc[0] + rx)} ${f(sc[1])} L ${f(sb[0] + rx)} ${f(sb[1])} A ${f(rx)} ${f(ry)} 0 0 1 ${f(sb[0] - rx)} ${f(sb[1])} Z`;
  const inset = o.inset ?? 8, insetY = o.insetY ?? 6.4;
  const seatLines = `<ellipse cx="${f(sc[0])}" cy="${f(sc[1])}" rx="${f(rx)}" ry="${f(ry)}"/>
      <path d="M ${f(sb[0] - rx)} ${f(sb[1])} A ${f(rx)} ${f(ry)} 0 0 0 ${f(sb[0] + rx)} ${f(sb[1])} M ${f(sc[0] - rx)} ${f(sc[1])} V ${f(sb[1])} M ${f(sc[0] + rx)} ${f(sc[1])} V ${f(sb[1])}"/>
      <ellipse cx="${f(sc[0])}" cy="${f(sc[1] + 0.6)}" rx="${f(rx - inset)}" ry="${f(ry - insetY)}" stroke-width="${f(SW * 0.5)}"/>`;

  const id = (s) => `th-${s}-${t.name}`;
  // cutters: what a member is hidden by; halo = the stroke the cutter is widened by in the mask
  const cut = (d, halo, fill = false) => `<path d="${d}" fill="${fill ? "#000" : "none"}" stroke="#000" stroke-width="${f(halo)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const H = SW + GAP * 2;
  const dOuter = line(outer), dInner = line(inner), dFR = line(FR), dFL = line(FL), dRing = line(ring);
  let defsOut = "", n = 0;
  const masked = (body, cutters) => {
    const m = id("m" + n++);
    defsOut += `<mask id="${m}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#fff"/>${cutters.join("")}</mask>`;
    return `<g mask="url(#${m})">${body}</g>`;
  };
  const stroke = (d) => `<path d="${d}"/>`;
  const out =
    // the outer piece: behind the seat, the hoop and the front legs
    masked(stroke(dOuter), [cut(seatFill, H, true), cut(dInner, H), cut(dFR, H), cut(dFL, H)]) +
    // the ring: behind the nearest leg only; it meets the side legs at its ends
    masked(stroke(dRing), [cut(dFR, H), cut(seatFill, 0, true)]) +
    // front legs: under the seat band, flush with it
    masked(stroke(dFL) + stroke(dFR), [cut(seatFill, 0, true)]) +
    `<g>${seatLines}</g>` +
    // the hoop stands on the back of the rim
    stroke(dInner);

  const ry0 = FOOT + (o.gapRule ?? 28), capY = ry0 + 35;
  const foot = `<line x1="${w / 2 - 86}" y1="${ry0}" x2="${w / 2 + 86}" y2="${ry0}" stroke="${t.gold}" stroke-width="1.5"/>
    ${diamond(w / 2 - 92, ry0, 6, t.gold)}${diamond(w / 2 + 92, ry0, 6, t.gold)}
    <text x="${w / 2}" y="${capY}" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="27" letter-spacing="2" fill="${t.goldInk}">Nº<tspan dx="9">14</tspan></text>`;
  const body = `<defs>${defsOut}</defs><g fill="none" stroke="${t.gold}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round">${out}</g>`;
  return card(t, w, h, body + foot);
}
