import { card, diamond } from "../kit.js";
// Vienna as one fine gold line engraving: Karlskirche with its columns, St. Stephen's with its south spire and
// chevron roof, the Riesenrad, low roofs between, all on one ground line. "Wien" in italic beneath.
const f = (n) => +n.toFixed(1);

function karlskirche(t, cx, G, k) {
  const S = (n) => f(n * k);
  const W = t.gold, P = t.paper;
  let o = "";
  // side pavilions (the gate towers) with their curved caps
  for (const s of [-1, 1]) {
    const x0 = cx + s * S(108), x1 = cx + s * S(138);
    const a = Math.min(x0, x1), b = Math.max(x0, x1), m = (a + b) / 2;
    o += `<path d="M ${a} ${G} V ${G - S(52)} H ${b} V ${G}" fill="${P}"/>`;
    o += `<path d="M ${a - S(2)} ${G - S(52)} H ${b + S(2)}"/>`;
    o += `<path d="M ${a + S(2)} ${G - S(52)} Q ${m} ${G - S(78)} ${b - S(2)} ${G - S(52)}" fill="${P}"/>`;
    o += `<path d="M ${m} ${G - S(65)} V ${G - S(74)}"/>`;
    o += `<path d="M ${m - S(7)} ${G} V ${G - S(24)} A ${S(7)} ${S(7)} 0 0 1 ${m + S(7)} ${G - S(24)} V ${G}"/>`;
    // low walls joining pavilion to column
    const wa = s < 0 ? b : cx + S(98), wb = s < 0 ? cx - S(98) : a;
    o += `<path d="M ${wa} ${G - S(32)} H ${wb}"/>`;
  }
  // body behind the portico, drum, dome, lantern
  o += `<path d="M ${cx - S(66)} ${G} V ${G - S(82)} H ${cx + S(66)} V ${G}" fill="${P}"/>`;
  o += `<path d="M ${cx - S(68)} ${G - S(82)} H ${cx + S(68)}"/>`;
  const dB = G - S(84), dT = G - S(126);
  o += `<path d="M ${cx - S(44)} ${dB} V ${dT} H ${cx + S(44)} V ${dB}" fill="${P}"/>`;
  o += `<path d="M ${cx - S(47)} ${dT} H ${cx + S(47)}"/>`;
  for (const dx of [-26, 0, 26]) o += `<path d="M ${cx + S(dx - 5)} ${dB - S(8)} V ${dB - S(24)} A ${S(5)} ${S(5)} 0 0 1 ${cx + S(dx + 5)} ${dB - S(24)} V ${dB - S(8)}"/>`;
  const top = G - S(200);
  o += `<path d="M ${cx - S(44)} ${dT} C ${cx - S(46)} ${dT - S(46)} ${cx - S(20)} ${top + S(4)} ${cx} ${top} C ${cx + S(20)} ${top + S(4)} ${cx + S(46)} ${dT - S(46)} ${cx + S(44)} ${dT}" fill="${P}"/>`;
  for (const r of [-0.55, 0, 0.55]) o += `<path d="M ${cx + S(44 * r)} ${dT} C ${cx + S(46 * r)} ${dT - S(40)} ${cx + S(18 * r)} ${top + S(6)} ${cx} ${top}" stroke-width="${S(1.1)}"/>`;
  o += `<path d="M ${cx - S(7)} ${top + S(2)} V ${top - S(16)} H ${cx + S(7)} V ${top + S(2)}" fill="${P}"/>`;
  o += `<path d="M ${cx - S(8)} ${top - S(16)} Q ${cx} ${top - S(28)} ${cx + S(8)} ${top - S(16)}" fill="${P}"/>`;
  o += `<path d="M ${cx} ${top - S(24)} V ${top - S(36)} M ${cx - S(4)} ${top - S(31)} H ${cx + S(4)}"/>`;
  // portico: six columns, entablature, pediment
  const pT = G - S(58);
  o += `<path d="M ${cx - S(42)} ${G} V ${pT} H ${cx + S(42)} V ${G}" fill="${P}"/>`;
  for (let i = 0; i < 6; i++) { const x = cx - S(34) + i * S(13.6); o += `<path d="M ${x} ${G - S(2)} V ${pT + S(4)}" stroke-width="${S(1.2)}"/>`; }
  o += `<path d="M ${cx - S(46)} ${pT} H ${cx + S(46)} M ${cx - S(46)} ${pT - S(5)} H ${cx + S(46)}"/>`;
  o += `<path d="M ${cx - S(48)} ${pT - S(5)} L ${cx} ${pT - S(30)} L ${cx + S(48)} ${pT - S(5)} Z" fill="${P}"/>`;
  o += `<path d="M ${cx - S(36)} ${pT - S(9)} L ${cx} ${pT - S(25)} L ${cx + S(36)} ${pT - S(9)} Z" stroke-width="${S(1)}"/>`;
  // the two triumphal columns with their spiral reliefs and crowns
  for (const s of [-1, 1]) {
    const x = cx + s * S(84), r = S(8.5), cT = G - S(156);
    o += `<path d="M ${x - S(13)} ${G} V ${G - S(22)} H ${x + S(13)} V ${G}" fill="${P}"/>`;
    o += `<path d="M ${x - S(15)} ${G - S(22)} H ${x + S(15)}"/>`;
    o += `<path d="M ${x - r} ${G - S(22)} V ${cT} H ${x + r} V ${G - S(22)}" fill="${P}"/>`;
    let sp = "";
    for (let i = 0; i < 6; i++) { const y = G - S(36) - i * S(21); sp += `M ${x - r} ${f(y)} L ${x + r} ${f(y - S(9))} `; }
    o += `<path d="${sp}" stroke-width="${S(1.3)}"/>`;
    o += `<path d="M ${x - S(12)} ${cT} H ${x + S(12)} M ${x - S(10)} ${cT - S(5)} H ${x + S(10)}"/>`;
    o += `<path d="M ${x - S(5)} ${cT - S(5)} V ${cT - S(14)} H ${x + S(5)} V ${cT - S(5)}" fill="${P}"/>`;
    o += `<path d="M ${x - S(6)} ${cT - S(14)} Q ${x} ${cT - S(23)} ${x + S(6)} ${cT - S(14)}" fill="${P}"/>`;
    o += diamond(x, cT - S(26), S(4.5), W);
  }
  return o;
}

// shrink a convex polygon inward by d (used to keep the roof chevrons clear of the roof outline)
function inset(pts, d) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) { const [a, b] = pts[i], [c, e] = pts[(i + 1) % pts.length]; area += a * e - c * b; }
  const sg = area > 0 ? 1 : -1;
  const lines = pts.map(([x1, y1], i) => {
    const [x2, y2] = pts[(i + 1) % pts.length], L = Math.hypot(x2 - x1, y2 - y1);
    const nx = sg * -(y2 - y1) / L, ny = sg * (x2 - x1) / L;
    return [x1 + nx * d, y1 + ny * d, x2 + nx * d, y2 + ny * d];
  });
  return lines.map((l1, i) => {
    const l0 = lines[(i - 1 + lines.length) % lines.length];
    const [a1, b1, a2, b2] = l0, [c1, d1, c2, d2] = l1;
    const den = (a1 - a2) * (d1 - d2) - (b1 - b2) * (c1 - c2);
    const u = ((a1 - c1) * (d1 - d2) - (b1 - d1) * (c1 - c2)) / den;
    return [f(a1 + u * (a2 - a1)), f(b1 + u * (b2 - b1))];
  });
}

function stephansdom(t, x0, x1, G, k) {
  const S = (n) => f(n * k), P = t.paper;
  let o = "";
  const eave = G - S(60), ridge = G - S(158), xc = (x0 + x1) / 2;
  // nave walls: buttresses rising to small points, one lancet per bay
  o += `<path d="M ${x0} ${G} V ${eave} H ${x1} V ${G}" fill="${P}"/>`;
  const nb = 6, bw = (x1 - x0 - S(12)) / nb;
  for (let i = 0; i <= nb; i++) {
    const x = f(x0 + S(6) + i * bw);
    o += `<path d="M ${x - S(2.5)} ${G} V ${eave + S(6)} L ${x} ${eave - S(5)} L ${x + S(2.5)} ${eave + S(6)} V ${G}" stroke-width="${S(1)}"/>`;
    if (i < nb) { const m = f(x + bw / 2); o += `<path d="M ${m - S(5)} ${G - S(10)} V ${eave + S(22)} Q ${m} ${eave + S(11)} ${m + S(5)} ${eave + S(22)} V ${G - S(10)}" stroke-width="${S(1.1)}"/>`; }
  }
  // the great roof: a steep trapezoid with three rows of crisp chevrons, kept 6px inside the outline
  const roof = [[x0 - S(3), eave], [x0 + S(36), ridge], [x1 - S(32), ridge], [x1 + S(3), eave]];
  const rp = "M " + roof.map((q) => q.join(" ")).join(" L ") + " Z";
  const ri = inset(roof, S(7));
  o += `<clipPath id="roofclip"><path d="M ${ri.map((q) => q.join(" ")).join(" L ")} Z"/></clipPath>`;
  o += `<path d="${rp}" fill="${P}"/>`;
  const per = S(52), amp = S(14);
  let z = "";
  for (let r = 0; r < 3; r++) {
    const yT = ridge + S(17) + r * S(27), pts = [];
    for (let n = -6; n <= 6; n++) pts.push([f(xc + n * per / 2), f(n % 2 === 0 ? yT + amp : yT)]);
    z += "M " + pts.map((q) => q.join(" ")).join(" L ") + " ";
  }
  o += `<path d="${z}" clip-path="url(#roofclip)" stroke-width="${S(1.6)}" stroke-linejoin="miter" stroke-miterlimit="10"/>`;
  o += `<path d="M ${x0 + S(36)} ${ridge} H ${x1 - S(32)}" stroke-width="${S(2.4)}"/>`;
  // west front: one plain Heidenturm with a short pyramidal cap
  const hx = x0 + S(14);
  o += `<path d="M ${hx - S(11)} ${G} V ${G - S(112)} L ${hx} ${G - S(136)} L ${hx + S(11)} ${G - S(112)} V ${G} Z" fill="${P}"/>`;
  o += `<path d="M ${hx - S(13)} ${G - S(112)} H ${hx + S(13)}"/>`;
  o += `<path d="M ${hx} ${G - S(136)} V ${G - S(146)}"/>`;
  // the south tower: one shaft narrowing upward, two tall lancets, a crown of gablets, then the long spire
  const tx = x0 + (x1 - x0) * 0.665, hb = S(27), hs = S(19), sb = G - S(176), sTop = G - S(284);
  o += `<path d="M ${tx - hb} ${G} L ${tx - hs} ${sb} H ${tx + hs} L ${tx + hb} ${G} Z" fill="${P}"/>`;
  const w0 = (y) => hb + (hs - hb) * (G - y) / (G - sb);
  for (const [yb, yt] of [[G - S(14), G - S(78)], [G - S(96), G - S(156)]]) {
    const lw = S(6.5);
    o += `<path d="M ${tx - lw} ${yb} V ${yt + S(10)} Q ${tx - lw} ${yt + S(2)} ${tx} ${yt - S(4)} Q ${tx + lw} ${yt + S(2)} ${tx + lw} ${yt + S(10)} V ${yb}" stroke-width="${S(1.3)}"/>`;
  }
  o += `<path d="M ${f(tx - w0(G - S(88)))} ${G - S(88)} H ${f(tx + w0(G - S(88)))}" stroke-width="${S(1.2)}"/>`;
  // spire: from the shaft's full width to the finial, a few crockets, two string courses
  o += `<path d="M ${tx - hs} ${sb} L ${tx} ${sTop} L ${tx + hs} ${sb} Z" fill="${P}"/>`;
  let cr = "";
  for (let i = 1; i < 8; i++) {
    const u = 0.1 + i / 8 * 0.82, y = sb + (sTop - sb) * u, hw = hs * (1 - u);
    cr += `M ${f(tx - hw)} ${f(y)} l ${-S(4)} ${-S(3)} M ${f(tx + hw)} ${f(y)} l ${S(4)} ${-S(3)} `;
  }
  o += `<path d="${cr}" stroke-width="${S(1.2)}"/>`;
  for (const u of [0.3, 0.62]) { const y = sb + (sTop - sb) * u, hw = hs * (1 - u); o += `<path d="M ${f(tx - hw)} ${f(y)} H ${f(tx + hw)}" stroke-width="${S(1.2)}"/>`; }
  o += `<path d="M ${tx} ${sTop} V ${sTop - S(12)} M ${tx - S(4.5)} ${sTop - S(7)} H ${tx + S(4.5)}"/>`;
  // the crown at the transition: three gablets and two corner pinnacles, in front of the spire's foot
  o += `<path d="M ${tx - hs - S(3)} ${sb} H ${tx + hs + S(3)}"/>`;
  for (const s of [-1, 0, 1]) { const gx = tx + s * S(12.5); o += `<path d="M ${gx - S(6.5)} ${sb} L ${gx} ${sb - S(17)} L ${gx + S(6.5)} ${sb} Z" fill="${P}" stroke-width="${S(1.3)}"/>`; }
  for (const s of [-1, 1]) { const px = tx + s * S(20); o += `<path d="M ${px - S(2.2)} ${sb} L ${px} ${sb - S(26)} L ${px + S(2.2)} ${sb}" fill="${P}" stroke-width="${S(1.2)}"/>`; }
  return o;
}

function riesenrad(t, cx, cy, R, G, k) {
  const S = (n) => f(n * k), P = t.paper;
  let o = "";
  // the pylons: two clean leg pairs from the hub to the ground
  for (const s of [-1, 1]) o += `<path d="M ${cx} ${cy} L ${cx + s * S(62)} ${G} M ${cx} ${cy} L ${cx + s * S(36)} ${G}"/>`;
  // double rim with a clear gap, sixteen spokes
  const r2 = R - S(9);
  o += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none"/><circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke-width="${S(1.3)}"/>`;
  let sp = "";
  for (let i = 0; i < 16; i++) {
    const a = (i + 0.5) / 16 * Math.PI * 2;
    sp += `M ${f(cx + Math.cos(a) * S(9))} ${f(cy + Math.sin(a) * S(9))} L ${f(cx + Math.cos(a) * R)} ${f(cy + Math.sin(a) * R)} `;
  }
  o += `<path d="${sp}" stroke-width="${S(1.1)}"/>`;
  o += `<circle cx="${cx}" cy="${cy}" r="${S(9)}" fill="${P}"/><circle cx="${cx}" cy="${cy}" r="${S(3.2)}" fill="${t.gold}" stroke="none"/>`;
  // fifteen cabins, hanging upright from the rim
  for (let i = 0; i < 15; i++) {
    const a = -Math.PI / 2 + i / 15 * Math.PI * 2, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R;
    const w = S(19.5), h = S(13), y0 = py + S(3);
    o += `<path d="M ${f(px)} ${f(py)} V ${f(y0)}" stroke-width="${S(1.2)}"/>`;
    o += `<path d="M ${f(px - w / 2 - S(2))} ${f(y0)} H ${f(px + w / 2 + S(2))} V ${f(y0 + S(2.6))} H ${f(px - w / 2 - S(2))} Z" fill="${t.gold}" stroke="none"/>`;
    o += `<rect x="${f(px - w / 2)}" y="${f(y0 + S(2.6))}" width="${w}" height="${h}" fill="${P}" stroke-width="${S(1.4)}"/>`;
  }
  return o;
}

// one continuous low roofline: a stepped run of flat and low-pitched roofs, a chimney, a dormer; no windows
function roofline(t, segs, G, k) {
  const S = (n) => f(n * k);
  let d = "", extra = "";
  segs.forEach(([a, b, h, kind], i) => {
    const y = G - S(h);
    d += i === 0 || segs[i - 1][1] !== a ? `M ${a} ${G} L ${a} ${y}` : ` L ${a} ${y}`;
    if (kind === "pitch") d += ` L ${f((a + b) / 2)} ${f(y - S(8))}`;
    if (kind === "hip") d += ` L ${f(a + S(8))} ${f(y - S(7))} L ${f(b - S(8))} ${f(y - S(7))}`;
    d += ` L ${b} ${y}`;
    if (kind === "chimney") { const cx0 = f(a + (b - a) * 0.62); extra += `M ${cx0} ${y} V ${f(y - S(12))} H ${f(cx0 + S(7))} V ${y} `; }
    if (i === segs.length - 1 || segs[i + 1][0] !== b) d += ` L ${b} ${G} `;
  });
  return `<path d="${extra}" fill="${t.paper}" stroke-width="${S(1.8)}"/><path d="${d}" fill="${t.paper}" stroke-width="${S(2)}"/>`;
}

export function draw(t, w, h) {
  const k = w / 1092, G = h * 0.735;
  const sw = f(2.2 * k);
  let body = `<g fill="none" stroke="${t.gold}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">`;
  body += roofline(t, [[f(400 * k), f(456 * k), 30, "hip"],
    [f(678 * k), f(710 * k), 42, "hip"], [f(710 * k), f(738 * k), 30, "chimney"], [f(738 * k), f(768 * k), 37, "pitch"], [f(768 * k), f(792 * k), 25, "flat"]], G, k);
  body += karlskirche(t, 262 * k, G, k);
  body += stephansdom(t, 452 * k, 682 * k, G, k);
  body += riesenrad(t, 862 * k, G - 128 * k, 92 * k, G, k);
  body += `</g>`;
  const mask = body.split(`fill="${t.paper}"`).join(`fill="#fff"`).replace(/roofclip/g, "roofclipm").replace(/stroke="[^"]*"/g, 'stroke="none"');
  body += `<mask id="fillmask" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">${mask}</mask>
    <g mask="url(#fillmask)"><rect width="${w}" height="${h}" fill="${t.fleck}" filter="url(#fibre)"/><rect width="${w}" height="${h}" fill="${t.fleck}" filter="url(#grain)"/><rect width="${w}" height="${h}" fill="url(#vig)"/></g>`;
  body += `<line x1="${f(84 * k)}" y1="${G}" x2="${f(w - 84 * k)}" y2="${G}" stroke="${t.gold}" stroke-width="${f(2.4 * k)}"/>`;
  body += `<line x1="${f(84 * k)}" y1="${f(G + 6 * k)}" x2="${f(w - 84 * k)}" y2="${f(G + 6 * k)}" stroke="${t.rule}" stroke-width="${f(1 * k)}"/>`;
  const ty = G + 52 * k;
  body += `<text x="${w / 2}" y="${f(ty)}" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-weight="500" font-size="${f(32 * k)}" letter-spacing="${f(3 * k)}" fill="${t.goldInk}">Wien</text>`;
  for (const s of [-1, 1]) {
    body += `<line x1="${f(w / 2 + s * 46 * k)}" y1="${f(ty - 9 * k)}" x2="${f(w / 2 + s * 96 * k)}" y2="${f(ty - 9 * k)}" stroke="${t.gold}" stroke-width="${f(1.4 * k)}"/>`;
    body += diamond(f(w / 2 + s * 104 * k), f(ty - 9 * k), f(6 * k), t.gold);
  }
  return card(t, w, h, body);
}
