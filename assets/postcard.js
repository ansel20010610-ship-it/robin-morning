// 明信片 (Postkarten): the postcards the yard's robin sends home while it travels (nest.js lifeOf), drawn by hand in SVG
// — no photographs (the owner, 2026-11-10: 不要真實的照片，用你的方法手搓手繪明信片，但要是可以看出地點的) — and never the
// same twice (the owner: 文案和照片每天都不一樣，注意是每天而不是幾個在輪). Each place has its landmark drawn so it can be
// told at a glance (Vienna's Riesenrad and St. Stephen's, Kyoto's pagoda and torii, London's Big Ben and a red bus, the
// Eiffel Tower...), and each day's card is composed afresh from the day's seed: the hour (dawn to night, with lit
// windows, a moon and stars), the weather (clear, cloud, rain, fog, snow), the season of the real date (blossom, full
// leaf, red leaves, bare branches), where the landmark stands and how large, which of its sights are in the picture,
// boats, birds, the robin itself perched somewhere on it. The words are put together the same way — where it is
// sitting, what it sees, the hour and the weather, the piece of the paper it got that day by name, how many days are
// left — so that a card's picture and words are the day's own. Pure: the same seed draws the same card on every phone.

const rngOf = (seed) => { let a = Math.floor(seed * 4294967296) >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const pick = (r, list) => list[Math.floor(r() * list.length) % list.length];
const btw = (r, a, b) => a + r() * (b - a);
const f1 = (n) => (Math.round(n * 10) / 10).toString();

const TIMES = [
  { k: "dawn", zh: "清晨", sky: ["#EFAF93", "#FCE4C2"], sun: "#FFD49A", sy: [118, 132], dark: 0 },
  { k: "morning", zh: "早上", sky: ["#A3CFEB", "#E9F4F5"], sun: "#FFF0B5", sy: [42, 62], dark: 0 },
  { k: "noon", zh: "中午", sky: ["#86BEE6", "#D6ECF5"], sun: "#FFF4C6", sy: [24, 36], dark: 0 },
  { k: "afternoon", zh: "下午", sky: ["#9BC0DF", "#F2E2BE"], sun: "#FFE29C", sy: [52, 76], dark: 0 },
  { k: "sunset", zh: "傍晚", sky: ["#D96E4E", "#F7C685"], sun: "#FFB065", sy: [104, 122], dark: .12 },
  { k: "dusk", zh: "黃昏", sky: ["#4A4B80", "#DE937C"], sun: "", sy: [0, 0], dark: .32 },
  { k: "night", zh: "晚上", sky: ["#121A3B", "#33416F"], sun: "", sy: [0, 0], dark: .52 },
];
const SEASON = (m) => (m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter");
const LEAF = { spring: ["#F2B6C6", "#E99AB0"], summer: ["#5F8E4C", "#4A7A3C"], autumn: ["#D9783A", "#C2552E"], winter: ["#8A7B6A", "#76695A"] };

// ——— small parts ———
const tree = (x, y, s, sea, r) => {
  const [a, b] = LEAF[sea], trunk = `<path d="M${f1(x)} ${f1(y)} l0 ${f1(-14 * s)}" stroke="#5A4232" stroke-width="${f1(2.4 * s)}" stroke-linecap="round"/>`;
  if (sea === "winter") return `${trunk}<path d="M${f1(x)} ${f1(y - 10 * s)} l${f1(-7 * s)} ${f1(-8 * s)} M${f1(x)} ${f1(y - 12 * s)} l${f1(6 * s)} ${f1(-9 * s)} M${f1(x)} ${f1(y - 14 * s)} l0 ${f1(-6 * s)}" stroke="#5A4232" stroke-width="${f1(1.1 * s)}" fill="none"/>`;
  return `${trunk}<circle cx="${f1(x - 4 * s)}" cy="${f1(y - 17 * s)}" r="${f1(7 * s)}" fill="${a}"/><circle cx="${f1(x + 4 * s)}" cy="${f1(y - 19 * s)}" r="${f1(7.5 * s)}" fill="${b}"/><circle cx="${f1(x)}" cy="${f1(y - 24 * s)}" r="${f1(6.5 * s)}" fill="${r() < .5 ? a : b}"/>`;
};
const water = (y, top, deep, r) => {
  let w = `<rect x="0" y="${y}" width="300" height="${200 - y}" fill="${deep}"/><rect x="0" y="${y}" width="300" height="5" fill="${top}" opacity=".7"/>`;
  for (let i = 0; i < 9; i++) { const x = btw(r, 0, 280), yy = btw(r, y + 8, 196); w += `<path d="M${f1(x)} ${f1(yy)} q4 -2 8 0 t8 0" stroke="#fff" stroke-opacity=".45" stroke-width=".9" fill="none"/>`; }
  return w;
};
const boat = (x, y, s, sail) => (sail
  ? `<path d="M${f1(x)} ${f1(y)} h${f1(22 * s)} l${f1(-4 * s)} ${f1(5 * s)} h${f1(-14 * s)} Z" fill="#6A4A36"/><path d="M${f1(x + 11 * s)} ${f1(y - 1)} v${f1(-20 * s)} l${f1(9 * s)} ${f1(17 * s)} Z" fill="#F5EEDF"/>`
  : `<path d="M${f1(x)} ${f1(y)} h${f1(26 * s)} l${f1(-5 * s)} ${f1(6 * s)} h${f1(-16 * s)} Z" fill="#3E5568"/><rect x="${f1(x + 8 * s)}" y="${f1(y - 6 * s)}" width="${f1(10 * s)}" height="${f1(6 * s)}" fill="#E9E1D0"/>`);
const hills = (y, color, r, amp = 16) => { let d = `M0 200 L0 ${f1(y)}`; for (let x = 0; x <= 300; x += 30) d += ` Q${f1(x + 15)} ${f1(y - btw(r, 0, amp))} ${x + 30} ${f1(y + btw(r, -amp / 3, amp / 3))}`; return `<path d="${d} L300 200 Z" fill="${color}"/>`; };
const lit = (x, y, w, h) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="#FFD27A"/>`;
const houses = (y, n, r, cols, night, x0 = btw(r, -8, 4)) => {
  let s = "", l = "", x = x0;
  for (let i = 0; i < n && x < 300; i++) {
    const w = btw(r, 22, 36), h = btw(r, 22, 40), c = pick(r, cols);
    s += `<rect x="${f1(x)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(h)}" fill="${c}"/><path d="M${f1(x - 2)} ${f1(y - h)} L${f1(x + w / 2)} ${f1(y - h - btw(r, 8, 14))} L${f1(x + w + 2)} ${f1(y - h)} Z" fill="${pick(r, ["#9A4E3C", "#7E6B5C", "#5E6B78"])}"/>`;
    for (let k = 0; k < 2; k++) { const wx = x + 5 + k * (w - 14), wy = y - h + 7; s += `<rect x="${f1(wx)}" y="${f1(wy)}" width="4" height="5" fill="#4A3F38" opacity=".55"/>`; if (night && r() < .6) l += lit(wx, wy, 4, 5); }
    x += w + btw(r, 0, 4);
  }
  return { s, l };
};

// ——— the places: each draws its landmark and says where the robin could be sitting ———
const PLACES = {
  wien(c) {
    const { r, sea, night } = c, v = r();
    let s = hills(150, "#9DB08A", r, 8), l = "", perch = [];
    const H = houses(168, 10, r, ["#E8DCC2", "#E2C9A3", "#D9D2C2", "#EBD6B4"], night); s += H.s; l += H.l;
    const wheel = (cx, cy, R) => {
      let w = `<path d="M${f1(cx - R * .55)} 170 L${f1(cx)} ${f1(cy)} L${f1(cx + R * .55)} 170" stroke="#6C4A3A" stroke-width="2.4" fill="none"/>`;
      w += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R)}" stroke="#8C3B2E" stroke-width="2.2" fill="none"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R * .82)}" stroke="#8C3B2E" stroke-width=".9" fill="none"/>`;
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; w += `<path d="M${f1(cx)} ${f1(cy)} L${f1(cx + Math.cos(a) * R)} ${f1(cy + Math.sin(a) * R)}" stroke="#8C3B2E" stroke-width=".7"/>`; }
      for (let i = 0; i < 15; i++) { const a = i / 15 * Math.PI * 2 + .2, gx = cx + Math.cos(a) * R, gy = cy + Math.sin(a) * R; w += `<rect x="${f1(gx - 3.4)}" y="${f1(gy)}" width="6.8" height="5.2" rx="1" fill="#B8402E"/>`; if (night) l += lit(gx - 2, gy + 1.4, 4, 2.4); }
      perch.push([cx - 3, cy - R - 2]);
      return w;
    };
    const dom = (x, base, k) => {
      const sp = x + 74 * k;
      let d = `<rect x="${f1(x)}" y="${f1(base - 40 * k)}" width="${f1(92 * k)}" height="${f1(40 * k)}" fill="#CDBFA6"/>`;
      d += `<path d="M${f1(x - 3)} ${f1(base - 40 * k)} L${f1(x + 46 * k)} ${f1(base - 78 * k)} L${f1(x + 95 * k)} ${f1(base - 40 * k)} Z" fill="#3F6B5A"/>`;
      let z = `M${f1(x + 6 * k)} ${f1(base - 46 * k)}`; for (let i = 1; i <= 10; i++) z += ` L${f1(x + 6 * k + i * 8 * k)} ${f1(base - (i % 2 ? 54 : 46) * k)}`;
      d += `<path d="${z}" stroke="#E5BF55" stroke-width="${f1(1.6 * k)}" fill="none"/><path d="M${f1(x + 22 * k)} ${f1(base - 60 * k)} L${f1(x + 46 * k)} ${f1(base - 70 * k)} L${f1(x + 70 * k)} ${f1(base - 60 * k)}" stroke="#E5BF55" stroke-width="${f1(1.2 * k)}" fill="none"/>`;
      d += `<path d="M${f1(sp - 11 * k)} ${f1(base)} L${f1(sp - 7 * k)} ${f1(base - 120 * k)} L${f1(sp)} ${f1(base - 165 * k)} L${f1(sp + 7 * k)} ${f1(base - 120 * k)} L${f1(sp + 11 * k)} ${f1(base)} Z" fill="#BCAD91"/>`;
      for (let i = 0; i < 4; i++) d += `<rect x="${f1(sp - 1.4 * k)}" y="${f1(base - (30 + i * 24) * k)}" width="${f1(2.8 * k)}" height="${f1(9 * k)}" fill="#5A4E40"/>`;
      d += `<path d="M${f1(x + 10 * k)} ${f1(base - 18 * k)} v${f1(-12 * k)} q${f1(4 * k)} ${f1(-6 * k)} ${f1(8 * k)} 0 v${f1(12 * k)} Z M${f1(x + 30 * k)} ${f1(base - 18 * k)} v${f1(-12 * k)} q${f1(4 * k)} ${f1(-6 * k)} ${f1(8 * k)} 0 v${f1(12 * k)} Z" fill="#5A4E40" opacity=".6"/>`;
      if (night) l += lit(x + 12 * k, base - 26 * k, 4 * k, 6 * k) + lit(x + 32 * k, base - 26 * k, 4 * k, 6 * k);
      perch.push([sp, base - 166 * k], [x + 46 * k, base - 79 * k]);
      return d;
    };
    if (v < .4) s += wheel(btw(r, 60, 90), btw(r, 88, 100), btw(r, 44, 52)) + dom(btw(r, 160, 185), 170, btw(r, .85, 1));
    else if (v < .7) s += dom(btw(r, 90, 130), 172, btw(r, 1, 1.12));
    else s += wheel(btw(r, 130, 170), btw(r, 82, 92), btw(r, 54, 62));
    for (let i = 0; i < 3; i++) s += tree(btw(r, 10, 290), btw(r, 176, 186), btw(r, .8, 1.1), sea, r);
    s += `<rect x="0" y="182" width="300" height="18" fill="#B9A78C"/>`;
    return { s, l, perch };
  },
  salzburg(c) {
    const { r, sea, night } = c, hx = btw(r, 150, 210), tone = { spring: "#7FA56A", summer: "#5E8C4A", autumn: "#9C8A4A", winter: "#C9CFC9" }[sea];
    let s = hills(118, "#8EA4B4", r, 22), l = "", perch = [];
    s += `<path d="M${f1(hx - 150)} 160 Q${f1(hx - 60)} 66 ${f1(hx)} 64 Q${f1(hx + 70)} 62 ${f1(hx + 160)} 160 Z" fill="${tone}"/>`;
    const fx = hx - 48;
    s += `<rect x="${f1(fx)}" y="52" width="96" height="16" fill="#EFE6D2"/><path d="M${f1(fx - 3)} 52 h102 l-6 -6 h-90 Z" fill="#9A4E3C"/>`;
    s += `<rect x="${f1(fx + 30)}" y="34" width="16" height="22" fill="#EFE6D2"/><path d="M${f1(fx + 28)} 34 h20 l-10 -10 Z" fill="#9A4E3C"/><rect x="${f1(fx + 70)}" y="40" width="12" height="16" fill="#EFE6D2"/><path d="M${f1(fx + 68)} 40 h16 l-8 -8 Z" fill="#9A4E3C"/>`;
    for (let i = 0; i < 7; i++) { s += `<rect x="${f1(fx + 6 + i * 13)}" y="58" width="3" height="4" fill="#6A5A4A"/>`; if (night && r() < .6) l += lit(fx + 6 + i * 13, 58, 3, 4); }
    perch.push([fx + 38, 23], [fx + 76, 31]);
    s += water(160, "#9CC7D2", "#5D93A6", r);
    const cx = btw(r, 30, 70);
    s += `<rect x="${f1(cx)}" y="112" width="58" height="48" fill="#E9DFC9"/><rect x="${f1(cx - 4)}" y="92" width="14" height="68" fill="#E9DFC9"/><rect x="${f1(cx + 48)}" y="92" width="14" height="68" fill="#E9DFC9"/>`;
    s += `<path d="M${f1(cx - 5)} 92 q8 -16 16 0 Z M${f1(cx + 47)} 92 q8 -16 16 0 Z" fill="#6FA28D"/><path d="M${f1(cx + 3)} 79 v-6 M${f1(cx + 55)} 79 v-6" stroke="#6FA28D" stroke-width="1.4"/><path d="M${f1(cx + 14)} 112 q15 -26 30 0 Z" fill="#6FA28D"/>`;
    if (night) l += lit(cx + 20, 126, 5, 8) + lit(cx + 33, 126, 5, 8);
    perch.push([cx + 29, 98]);
    const H = houses(160, 5, r, ["#F0D9A6", "#EAC9B0", "#DCE3D2"], night, cx + 80); s += H.s; l += H.l;
    if (r() < .6) s += boat(btw(r, 40, 220), 178, .9, false);
    return { s, l, perch };
  },
  kyoto(c) {
    const { r, sea, night } = c, px = btw(r, 150, 210);
    let s = hills(120, "#7E9E7A", r, 20) + hills(140, "#6A8C66", r, 10), l = "", perch = [];
    const baseY = 170, layers = 5;
    let y = baseY;
    for (let i = 0; i < layers; i++) {
      const w = 64 - i * 8, h = 18 - i;
      s += `<rect x="${f1(px - (w - 22) / 2)}" y="${f1(y - h)}" width="${f1(w - 22)}" height="${f1(h)}" fill="#6E4430"/>`;
      s += `<path d="M${f1(px - w / 2 - 6)} ${f1(y - h)} Q${f1(px)} ${f1(y - h - 12)} ${f1(px + w / 2 + 6)} ${f1(y - h)} L${f1(px + w / 2 - 2)} ${f1(y - h - 6)} Q${f1(px)} ${f1(y - h - 15)} ${f1(px - w / 2 + 2)} ${f1(y - h - 6)} Z" fill="#3A3330"/>`;
      if (night) l += lit(px - 3, y - h + 5, 6, 6);
      y -= h + 6;
    }
    s += `<path d="M${f1(px)} ${f1(y + 4)} v-26" stroke="#B89A55" stroke-width="2"/>`;
    for (let i = 0; i < 5; i++) s += `<path d="M${f1(px - 3)} ${f1(y - 2 - i * 4)} h6" stroke="#B89A55" stroke-width="1"/>`;
    perch.push([px, y - 24]);
    const tx = btw(r, 30, 80), tc = "#D2462E";
    s += `<rect x="${f1(tx)}" y="112" width="5" height="62" fill="${tc}"/><rect x="${f1(tx + 46)}" y="112" width="5" height="62" fill="${tc}"/><rect x="${f1(tx - 6)}" y="120" width="63" height="4" fill="${tc}"/><path d="M${f1(tx - 12)} 108 Q${f1(tx + 25)} 103 ${f1(tx + 63)} 108 L${f1(tx + 60)} 114 Q${f1(tx + 25)} 110 ${f1(tx - 9)} 114 Z" fill="#2F2A28"/>`;
    perch.push([tx + 25, 102]);
    for (let i = 0; i < 4; i++) s += tree(btw(r, 0, 300), btw(r, 176, 190), btw(r, .9, 1.3), sea === "summer" && r() < .5 ? "autumn" : sea, r);
    if (night) for (let i = 0; i < 4; i++) l += `<circle cx="${f1(btw(r, 20, 280))}" cy="${f1(btw(r, 176, 186))}" r="2.4" fill="#FFB65C"/>`;
    s += `<rect x="0" y="186" width="300" height="14" fill="#B8A88C"/>`;
    return { s, l, perch };
  },
  hualien(c) {
    const { r } = c, right = r() < .5;
    let s = hills(96, "#93A9AE", r, 26) + hills(112, "#6E8E7E", r, 18), l = "", perch = [];
    s += `<defs><linearGradient id="sea${c.uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3FB0C0"/><stop offset="1" stop-color="#1D5F82"/></linearGradient></defs><rect x="0" y="122" width="300" height="78" fill="url(#sea${c.uid})"/>`;
    const cl = right ? `M300 34 L232 46 L210 80 L196 122 L188 200 L300 200 Z` : `M0 34 L68 46 L90 80 L104 122 L112 200 L0 200 Z`;
    s += `<path d="${cl}" fill="#5F7F5A"/><path d="${cl}" fill="#8E9A86" opacity=".35"/>`;
    for (let i = 0; i < 6; i++) { const y = 70 + i * 18, x = right ? 210 - i * 2 : 90 + i * 2; s += `<path d="M${f1(x)} ${f1(y)} l${right ? 30 : -30} ${f1(btw(r, -4, 4))}" stroke="#4C6A48" stroke-width="1"/>`; }
    s += `<path d="${right ? "M300 60 Q250 66 218 74" : "M0 60 Q50 66 82 74"}" stroke="#E8E1CF" stroke-width="2" fill="none"/>`;
    for (let i = 0; i < 12; i++) { const x = right ? btw(r, 0, 190) : btw(r, 110, 300), y = btw(r, 130, 196); s += `<path d="M${f1(x)} ${f1(y)} q5 -2 10 0 t10 0" stroke="#fff" stroke-opacity=".55" stroke-width="1" fill="none"/>`; }
    s += `<path d="${right ? "M188 200 q4 -40 10 -78" : "M112 200 q-4 -40 -10 -78"}" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none"/>`;
    perch.push(right ? [228, 44] : [72, 44]);
    if (r() < .55) s += boat(right ? btw(r, 30, 140) : btw(r, 150, 250), btw(r, 150, 175), .8, false);
    return { s, l, perch };
  },
  kenting(c) {
    const { r, night } = c, lx = btw(r, 170, 230);
    let s = `<rect x="0" y="118" width="300" height="50" fill="#3E9DB5"/><rect x="0" y="118" width="300" height="4" fill="#9ED4DE"/>`, l = "", perch = [];
    for (let i = 0; i < 8; i++) s += `<path d="M${f1(btw(r, 0, 290))} ${f1(btw(r, 126, 162))} q4 -2 8 0 t8 0" stroke="#fff" stroke-opacity=".5" stroke-width=".9" fill="none"/>`;
    s += `<path d="M0 200 L0 160 Q80 148 150 156 T300 150 L300 200 Z" fill="#EAD7A4"/>`;
    s += `<path d="M${f1(lx - 13)} 156 L${f1(lx - 8)} 66 L${f1(lx + 8)} 66 L${f1(lx + 13)} 156 Z" fill="#F7F3EA"/><rect x="${f1(lx - 11)}" y="62" width="22" height="4" fill="#3A3A3A"/><rect x="${f1(lx - 7)}" y="48" width="14" height="14" fill="#2E2E2E"/><rect x="${f1(lx - 5)}" y="51" width="10" height="8" fill="${night ? "#FFE08A" : "#9FC3CF"}"/><path d="M${f1(lx - 8)} 48 q8 -10 16 0 Z" fill="#2E2E2E"/><path d="M${f1(lx)} 38 v-4" stroke="#2E2E2E" stroke-width="1.5"/>`;
    if (night) l += `<path d="M${f1(lx)} 55 L${f1(lx - 140)} 30 L${f1(lx - 140)} 70 Z" fill="#FFE9A8" opacity=".35"/>` + lit(lx - 5, 51, 10, 8);
    s += `<rect x="${f1(lx - 18)}" y="150" width="36" height="8" fill="#EDE6D6"/>`;
    perch.push([lx, 33]);
    const palm = (x, y, k) => { let p = `<path d="M${f1(x)} ${f1(y)} q${f1(-6 * k)} ${f1(-30 * k)} ${f1(4 * k)} ${f1(-58 * k)}" stroke="#7A5A3A" stroke-width="${f1(3.4 * k)}" fill="none" stroke-linecap="round"/>`; const tx = x + 4 * k, ty = y - 58 * k; for (const [dx, dy] of [[-22, 6], [-16, -8], [0, -12], [16, -8], [22, 6], [8, 10], [-8, 10]]) p += `<path d="M${f1(tx)} ${f1(ty)} q${f1(dx * k / 2)} ${f1((dy - 8) * k)} ${f1(dx * k)} ${f1(dy * k)}" stroke="#3F7A3E" stroke-width="${f1(2.6 * k)}" fill="none" stroke-linecap="round"/>`; return p; };
    const px = lx > 200 ? btw(r, 40, 110) : btw(r, 250, 285);
    s += palm(px, 172, btw(r, 1, 1.25)) + palm(px + btw(r, 18, 30), 176, btw(r, .7, .9));
    perch.push([px + 4, 172 - 62]);
    return { s, l, perch };
  },
  alishan(c) {
    const { r, sea, night } = c;
    let s = hills(70, "#8FA0B6", r, 16) + `<path d="M0 104 ${Array.from({ length: 11 }, (_, i) => `Q${i * 30 + 15} ${f1(btw(r, 88, 98))} ${i * 30 + 30} 104`).join(" ")} L300 124 L0 124 Z" fill="#F5F2EC"/>` + hills(126, "#4E7556", r, 14) + hills(148, "#3E6446", r, 10), l = "", perch = [];
    const tx = btw(r, 20, 70);
    s += `<path d="M${f1(tx)} 186 L${f1(tx + 4)} 60 L${f1(tx + 9)} 186 Z" fill="#5A4030"/>`;
    for (let i = 0; i < 5; i++) s += `<ellipse cx="${f1(tx + 4.5 + btw(r, -6, 6))}" cy="${f1(70 + i * 20)}" rx="${f1(14 - i)}" ry="9" fill="${i % 2 ? "#2F5B3A" : "#3A6A44"}"/>`;
    perch.push([tx + 4, 58]);
    s += `<path d="M0 174 L300 166" stroke="#5A4A3A" stroke-width="2"/>`;
    const trx = btw(r, 110, 190), cars = 3;
    for (let i = 0; i < cars; i++) { const x = trx + i * 34; s += `<rect x="${f1(x)}" y="${f1(156 - i * .9)}" width="30" height="14" rx="2" fill="#B2392D"/><rect x="${f1(x + 2)}" y="${f1(154 - i * .9)}" width="26" height="3" fill="#7A2A22"/>`; for (let k = 0; k < 4; k++) { s += `<rect x="${f1(x + 3 + k * 6.5)}" y="${f1(159 - i * .9)}" width="4" height="4" fill="#F1E3C4"/>`; if (night) l += lit(x + 3 + k * 6.5, 159 - i * .9, 4, 4); } s += `<circle cx="${f1(x + 7)}" cy="${f1(171 - i * .9)}" r="2" fill="#2E2E2E"/><circle cx="${f1(x + 23)}" cy="${f1(171 - i * .9)}" r="2" fill="#2E2E2E"/>`; }
    perch.push([trx + 15, 152]);
    for (let i = 0; i < 3; i++) s += tree(btw(r, 200, 295), btw(r, 186, 196), btw(r, .9, 1.2), sea === "winter" ? "summer" : sea, r);
    return { s, l, perch };
  },
  praha(c) {
    const { r, night } = c;
    let s = hills(104, "#9FAE9A", r, 10), l = "", perch = [];
    const cx = btw(r, 150, 230);
    s += `<rect x="${f1(cx - 70)}" y="78" width="120" height="26" fill="#E5DCC6"/>`;
    for (let i = 0; i < 9; i++) { s += `<rect x="${f1(cx - 64 + i * 13)}" y="86" width="3" height="5" fill="#6A5A4A"/>`; if (night && r() < .6) l += lit(cx - 64 + i * 13, 86, 3, 5); }
    s += `<rect x="${f1(cx - 4)}" y="46" width="18" height="40" fill="#5E6B5E"/><path d="M${f1(cx - 6)} 46 L${f1(cx + 5)} 14 L${f1(cx + 16)} 46 Z" fill="#3F4B40"/><rect x="${f1(cx + 20)}" y="56" width="10" height="30" fill="#5E6B5E"/><path d="M${f1(cx + 19)} 56 L${f1(cx + 25)} 34 L${f1(cx + 31)} 56 Z" fill="#3F4B40"/><rect x="${f1(cx + 32)}" y="56" width="10" height="30" fill="#5E6B5E"/><path d="M${f1(cx + 31)} 56 L${f1(cx + 37)} 34 L${f1(cx + 43)} 56 Z" fill="#3F4B40"/>`;
    perch.push([cx + 5, 12]);
    s += water(136, "#9CC0CF", "#5C8AA0", r);
    const by = 128;
    s += `<rect x="0" y="${by}" width="300" height="10" fill="#8C7E6C"/>`;
    for (let i = 0; i < 6; i++) s += `<path d="M${f1(i * 55 - 8)} ${by + 10} h46 v32 q-23 -26 -46 0 Z" fill="#8C7E6C"/>`;
    for (let i = 0; i < 9; i++) s += `<path d="M${f1(20 + i * 32)} ${by} v-9" stroke="#3C3530" stroke-width="2.2" stroke-linecap="round"/><circle cx="${f1(20 + i * 32)}" cy="${by - 10}" r="1.8" fill="#3C3530"/>`;
    const gx = btw(r, 10, 40);
    s += `<rect x="${f1(gx)}" y="${by - 46}" width="26" height="56" fill="#6E6556"/><path d="M${f1(gx - 2)} ${by - 46} L${f1(gx + 13)} ${by - 76} L${f1(gx + 28)} ${by - 46} Z" fill="#2F2B28"/><path d="M${f1(gx + 6)} ${by + 10} v-14 q7 -9 14 0 v14 Z" fill="#3C3530"/><path d="M${f1(gx - 2)} ${by - 46} l3 -8 l3 8 M${f1(gx + 22)} ${by - 46} l3 -8 l3 8" stroke="#2F2B28" stroke-width="1.6" fill="none"/>`;
    perch.push([gx + 13, by - 78], [20 + 4 * 32, by - 13]);
    if (r() < .6) s += boat(btw(r, 60, 220), btw(r, 176, 186), 1, false);
    return { s, l, perch };
  },
  london(c) {
    const { r, night } = c, bx = btw(r, 190, 240);
    let s = "", l = "", perch = [];
    s += `<rect x="0" y="150" width="300" height="50" fill="#8D8C86"/>`;
    s += `<rect x="${f1(bx - 150)}" y="118" width="150" height="34" fill="#CDB07A"/>`;
    for (let i = 0; i < 12; i++) { const x = bx - 146 + i * 12.4; s += `<path d="M${f1(x)} 118 v-8 l2 -4 l2 4 v8 Z" fill="#B99D68"/><rect x="${f1(x + 1)}" y="126" width="3" height="8" fill="#6F5F45"/>`; if (night && r() < .5) l += lit(x + 1, 126, 3, 8); }
    s += `<rect x="${f1(bx - 12)}" y="40" width="24" height="112" fill="#CFAE6E"/><rect x="${f1(bx - 14)}" y="56" width="28" height="30" fill="#C2A060"/>`;
    s += `<circle cx="${f1(bx)}" cy="71" r="10" fill="#F4EEDB" stroke="#2F2A22" stroke-width="1.4"/>`;
    const hh = btw(r, 0, Math.PI * 2), mm = btw(r, 0, Math.PI * 2);
    s += `<path d="M${f1(bx)} 71 l${f1(Math.sin(hh) * 5)} ${f1(-Math.cos(hh) * 5)} M${f1(bx)} 71 l${f1(Math.sin(mm) * 8)} ${f1(-Math.cos(mm) * 8)}" stroke="#2F2A22" stroke-width="1.2" stroke-linecap="round"/>`;
    if (night) l += `<circle cx="${f1(bx)}" cy="71" r="10" fill="#FFE9A6" opacity=".55"/>`;
    s += `<path d="M${f1(bx - 13)} 56 L${f1(bx - 9)} 44 L${f1(bx + 9)} 44 L${f1(bx + 13)} 56 Z" fill="#B99D68"/><path d="M${f1(bx - 9)} 44 L${f1(bx)} 8 L${f1(bx + 9)} 44 Z" fill="#3D4A3E"/><path d="M${f1(bx)} 8 v-6" stroke="#3D4A3E" stroke-width="1.5"/>`;
    for (let i = 0; i < 4; i++) s += `<rect x="${f1(bx - 8)}" y="${f1(92 + i * 14)}" width="3" height="8" fill="#8C744A"/><rect x="${f1(bx + 5)}" y="${f1(92 + i * 14)}" width="3" height="8" fill="#8C744A"/>`;
    perch.push([bx, 4], [bx - 75, 106]);
    const ux = btw(r, 14, 90);
    s += `<rect x="${f1(ux)}" y="136" width="70" height="40" rx="5" fill="#C8302A"/><rect x="${f1(ux)}" y="155" width="70" height="2.5" fill="#F1E3C4"/>`;
    for (let k = 0; k < 5; k++) { s += `<rect x="${f1(ux + 5 + k * 13)}" y="140" width="10" height="10" fill="#DCE7EE"/><rect x="${f1(ux + 5 + k * 13)}" y="160" width="10" height="9" fill="#DCE7EE"/>`; if (night) l += lit(ux + 5 + k * 13, 140, 10, 10) + lit(ux + 5 + k * 13, 160, 10, 9); }
    s += `<circle cx="${f1(ux + 14)}" cy="177" r="5" fill="#2A2A2A"/><circle cx="${f1(ux + 56)}" cy="177" r="5" fill="#2A2A2A"/>`;
    perch.push([ux + 35, 132]);
    if (r() < .55) { const px = btw(r, 260, 286); s += `<rect x="${f1(px)}" y="138" width="14" height="38" fill="#C8302A"/><path d="M${f1(px - 1)} 138 q8 -7 16 0 Z" fill="#C8302A"/><rect x="${f1(px + 3)}" y="146" width="8" height="18" fill="#DCE7EE"/>`; perch.push([px + 7, 130]); }
    return { s, l, perch };
  },
  paris(c) {
    const { r, night } = c, ex = btw(r, 130, 190), k = btw(r, .95, 1.1);
    let s = "", l = "", perch = [];
    s += water(158, "#9CB9C6", "#5F8197", r);
    const H = houses(160, 9, r, ["#E8E1D2", "#E3D8C3", "#DCD4C6"], night);
    s += H.s.replace(/fill="#9A4E3C"|fill="#7E6B5C"|fill="#5E6B78"/g, 'fill="#7F8C9C"'); l += H.l;
    const top = 160 - 150 * k, mid = 160 - 72 * k, low = 160 - 34 * k;
    s += `<path d="M${f1(ex - 38 * k)} 160 Q${f1(ex - 16 * k)} ${f1(mid)} ${f1(ex - 4 * k)} ${f1(top + 20)} L${f1(ex + 4 * k)} ${f1(top + 20)} Q${f1(ex + 16 * k)} ${f1(mid)} ${f1(ex + 38 * k)} 160 L${f1(ex + 24 * k)} 160 Q${f1(ex)} ${f1(low - 14 * k)} ${f1(ex - 24 * k)} 160 Z" fill="#6B4F3A"/>`;
    for (let i = 0; i < 9; i++) { const y = 160 - i * 15 * k, half = (38 - i * 3.9) * k; s += `<path d="M${f1(ex - half)} ${f1(y)} L${f1(ex + half * .6)} ${f1(y - 15 * k)} M${f1(ex + half)} ${f1(y)} L${f1(ex - half * .6)} ${f1(y - 15 * k)}" stroke="#8C6A50" stroke-width=".6"/>`; }
    s += `<rect x="${f1(ex - 22 * k)}" y="${f1(low - 3)}" width="${f1(44 * k)}" height="4" fill="#5A4130"/><rect x="${f1(ex - 11 * k)}" y="${f1(mid - 2)}" width="${f1(22 * k)}" height="3.5" fill="#5A4130"/><path d="M${f1(ex)} ${f1(top + 20)} v-24" stroke="#5A4130" stroke-width="2"/>`;
    if (night) for (let i = 0; i < 10; i++) l += `<circle cx="${f1(ex + btw(r, -30, 30) * k * (1 - i / 12))}" cy="${f1(160 - i * 14 * k)}" r="1.1" fill="#FFE27A"/>`;
    perch.push([ex, top - 6], [ex - 22 * k, low - 5]);
    if (r() < .5) s += boat(btw(r, 20, 220), btw(r, 176, 188), 1.1, false);
    return { s, l, perch };
  },
  kinmen(c) {
    const { r, sea, night } = c, hx = btw(r, 110, 160);
    let s = `<rect x="0" y="150" width="300" height="50" fill="#D8C49A"/>`, l = "", perch = [];
    if (r() < .5) s += `<rect x="0" y="132" width="300" height="20" fill="#7FB0C2"/>`;
    s += `<rect x="${f1(hx - 70)}" y="104" width="140" height="48" fill="#B5523B"/>`;
    for (let i = 0; i < 6; i++) s += `<path d="M${f1(hx - 70)} ${f1(110 + i * 7)} h140" stroke="#9A4330" stroke-width=".6"/>`;
    s += `<path d="M${f1(hx - 80)} 106 L${f1(hx - 62)} 86 L${f1(hx + 62)} 86 L${f1(hx + 80)} 106 Z" fill="#8E3B2C"/>`;
    // the swallowtail ridge: a heavy ridge that sweeps up at both ends and parts into two short tails
    s += `<path d="M${f1(hx - 64)} 87 Q${f1(hx)} 82 ${f1(hx + 64)} 87 Q${f1(hx + 74)} 84 ${f1(hx + 80)} 74 L${f1(hx + 84)} 70 L${f1(hx + 79)} 72 L${f1(hx + 77)} 68 L${f1(hx + 74)} 76 Q${f1(hx + 68)} 82 ${f1(hx + 62)} 83 Q${f1(hx)} 78 ${f1(hx - 62)} 83 Q${f1(hx - 68)} 82 ${f1(hx - 74)} 76 L${f1(hx - 77)} 68 L${f1(hx - 79)} 72 L${f1(hx - 84)} 70 L${f1(hx - 80)} 74 Q${f1(hx - 74)} 84 ${f1(hx - 64)} 87 Z" fill="#6E2C22"/>`;
    s += `<rect x="${f1(hx - 10)}" y="122" width="20" height="30" fill="#3E2A22"/><rect x="${f1(hx - 50)}" y="116" width="16" height="14" fill="#E8D8B8"/><rect x="${f1(hx + 34)}" y="116" width="16" height="14" fill="#E8D8B8"/>`;
    if (night) l += lit(hx - 48, 118, 12, 10) + lit(hx + 36, 118, 12, 10);
    perch.push([hx + 80, 66], [hx - 80, 66], [hx, 77]);
    const wx = hx > 135 ? btw(r, 26, 50) : btw(r, 240, 270);
    s += `<rect x="${f1(wx - 10)}" y="160" width="20" height="10" fill="#9A9488"/><rect x="${f1(wx - 7)}" y="128" width="14" height="32" rx="4" fill="#A8A296"/><circle cx="${f1(wx)}" cy="122" r="8" fill="#A8A296"/><path d="M${f1(wx - 9)} 132 q9 6 18 0 l-3 16 q-6 3 -12 0 Z" fill="#C2392D"/><circle cx="${f1(wx - 3)}" cy="120" r="1.4" fill="#3A3530"/><circle cx="${f1(wx + 3)}" cy="120" r="1.4" fill="#3A3530"/><path d="M${f1(wx - 4)} 126 h8" stroke="#3A3530" stroke-width="1.2"/>`;
    perch.push([wx, 112]);
    if (sea === "summer" || sea === "autumn") for (let i = 0; i < 26; i++) { const x = btw(r, 0, 300), y = btw(r, 166, 196); s += `<path d="M${f1(x)} ${f1(y + 10)} v-10" stroke="#7E8A4A" stroke-width=".9"/><ellipse cx="${f1(x)}" cy="${f1(y - 2)}" rx="1.8" ry="3.4" fill="#9A3E2A"/>`; }
    return { s, l, perch };
  },
  hokkaido(c) {
    const { r, sea, night } = c, snowy = sea === "winter" || c.m === 11 || c.m === 3 || c.m === 4;
    let s = hills(96, snowy ? "#C9D3DE" : "#8EA4B4", r, 26), l = "", perch = [];
    s += `<path d="M60 96 l20 -24 l20 24 Z M190 96 l26 -30 l26 30 Z" fill="#fff" opacity="${snowy ? .9 : .7}"/>`;
    if (snowy) {
      s += `<rect x="0" y="150" width="300" height="50" fill="#F4F6F8"/>`;
      const tx = btw(r, 120, 190);
      s += `<rect x="${f1(tx - 46)}" y="112" width="92" height="40" fill="#F7F4EE"/><path d="M${f1(tx - 50)} 112 L${f1(tx)} 92 L${f1(tx + 50)} 112 Z" fill="#B7413A"/><path d="M${f1(tx - 50)} 112 L${f1(tx)} 92 L${f1(tx + 50)} 112" stroke="#fff" stroke-width="3" fill="none"/>`;
      s += `<rect x="${f1(tx - 9)}" y="66" width="18" height="30" fill="#F7F4EE"/><circle cx="${f1(tx)}" cy="78" r="6" fill="#FFFFFF" stroke="#2F2A22" stroke-width="1"/><path d="M${f1(tx)} 78 v-4 M${f1(tx)} 78 h3" stroke="#2F2A22" stroke-width=".8"/><path d="M${f1(tx - 11)} 66 L${f1(tx)} 50 L${f1(tx + 11)} 66 Z" fill="#B7413A"/><path d="M${f1(tx)} 50 v-6" stroke="#2F2A22" stroke-width="1"/>`;
      for (let i = 0; i < 5; i++) { s += `<rect x="${f1(tx - 40 + i * 18)}" y="124" width="6" height="12" fill="#6E8796"/>`; if (night) l += lit(tx - 40 + i * 18, 124, 6, 12); }
      perch.push([tx, 42]);
      for (let i = 0; i < 4; i++) { const x = btw(r, 0, 300); s += `<path d="M${f1(x)} 186 v-34" stroke="#F1EEE8" stroke-width="3"/><path d="M${f1(x - 1.5)} 170 h3 M${f1(x - 1.5)} 162 h3" stroke="#3A3530" stroke-width=".8"/>`; }
    } else {
      // lavender in bloom in summer (Furano); the same rows green in spring and turning in autumn
      const row = sea === "summer" ? "#8C6AB4" : sea === "autumn" ? "#9C8A4A" : "#5E8C4A";
      s += `<rect x="0" y="130" width="300" height="70" fill="${sea === "autumn" ? "#B7A46A" : "#7FA05E"}"/>`;
      for (let i = 0; i < 9; i++) s += `<path d="M${150 + (i - 4) * 6} 130 L${f1(150 + (i - 4) * 60)} 200" stroke="${row}" stroke-width="${f1(3 + Math.abs(i - 4) * 2.4)}"/>`;
      const fx = btw(r, 30, 90);
      s += `<rect x="${f1(fx)}" y="112" width="34" height="20" fill="#F2ECDF"/><path d="M${f1(fx - 3)} 112 L${f1(fx + 17)} 98 L${f1(fx + 37)} 112 Z" fill="#B7413A"/>`;
      if (night) l += lit(fx + 6, 118, 6, 6);
      perch.push([fx + 17, 94]);
      for (let i = 0; i < 3; i++) s += tree(btw(r, 200, 295), btw(r, 130, 140), btw(r, .8, 1), sea, r);
    }
    return { s, l, perch };
  },
  scotland(c) {
    const { r, sea, night } = c, rx = btw(r, 130, 200);
    let s = hills(120, "#7E8C86", r, 18), l = "", perch = [];
    s += `<path d="M${f1(rx - 90)} 170 L${f1(rx - 60)} 116 L${f1(rx - 30)} 98 L${f1(rx + 30)} 92 L${f1(rx + 64)} 104 L${f1(rx + 96)} 170 Z" fill="#4E4A46"/><path d="M${f1(rx - 60)} 116 l14 18 l10 -10 l12 22 M${f1(rx + 30)} 92 l-8 26 l14 12" stroke="#3A3633" stroke-width="1.2" fill="none"/>`;
    const cw = 96, cxL = rx - 44;
    s += `<rect x="${f1(cxL)}" y="66" width="${cw}" height="30" fill="#8E877C"/>`;
    for (let i = 0; i < 12; i++) s += `<rect x="${f1(cxL + i * 8)}" y="61" width="5" height="6" fill="#8E877C"/>`;
    s += `<rect x="${f1(cxL - 6)}" y="48" width="18" height="48" fill="#7F786E"/><rect x="${f1(cxL + cw - 12)}" y="54" width="16" height="42" fill="#7F786E"/>`;
    for (let i = 0; i < 4; i++) s += `<rect x="${f1(cxL - 6 + i * 5)}" y="43" width="3" height="5" fill="#7F786E"/>`;
    for (let i = 0; i < 6; i++) { s += `<rect x="${f1(cxL + 16 + i * 12)}" y="76" width="4" height="7" fill="#3E3A36"/>`; if (night && r() < .7) l += lit(cxL + 16 + i * 12, 76, 4, 7); }
    s += `<path d="M${f1(cxL + 3)} 43 v-12 l10 4 l-10 4" stroke="#3E3A36" stroke-width="1" fill="#2F5E9E"/>`;
    perch.push([cxL + 3, 30], [cxL + cw - 4, 50]);
    s += `<path d="M0 200 L0 166 Q150 152 300 168 L300 200 Z" fill="#6B7A4E"/>`;
    const heather = sea === "summer" || sea === "autumn" ? "#9C5A9E" : "#7D6A7E";
    for (let i = 0; i < 40; i++) s += `<circle cx="${f1(btw(r, 0, 300))}" cy="${f1(btw(r, 170, 198))}" r="${f1(btw(r, 1.4, 2.6))}" fill="${heather}"/>`;
    if (r() < .6) { const cx = btw(r, 30, 260), cy = btw(r, 174, 184); s += `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="16" ry="9" fill="#B8642E"/><circle cx="${f1(cx - 15)}" cy="${f1(cy - 4)}" r="6" fill="#B8642E"/><path d="M${f1(cx - 19)} ${f1(cy - 8)} q-6 -2 -8 -8 M${f1(cx - 11)} ${f1(cy - 8)} q6 -2 8 -8" stroke="#F0E6CF" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M${f1(cx - 8)} ${f1(cy + 7)} v6 M${f1(cx + 8)} ${f1(cy + 7)} v6" stroke="#6E3A1C" stroke-width="2"/>`; perch.push([cx, cy - 10]); }
    return { s, l, perch };
  },
};
export const PLACE_IDS = Object.keys(PLACES);

// the robin itself, small, perched somewhere in the picture
const tinyRobin = (x, y, flip) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${flip ? -.28 : .28} .28) translate(-32 -50)"><path fill="#7A5A44" d="M17.6 27.2 C13.2 32.8 13.8 42 20.4 46.8 C26.6 51.2 37.4 51.4 43.4 45.6 C46.8 42.2 47.6 36.8 45.4 32.2 C42.4 26 33 21.6 25 23 C21.8 23.6 19.4 25 17.6 27.2 Z"/><path fill="#D2583C" d="M17.6 27.2 C14 32 14.4 40 19.6 45.2 C22.6 48 27.6 49 32 47.6 C32.4 40.2 29.4 32 25.2 27 C23.4 25.6 20.4 25.4 17.6 27.2 Z"/><path fill="#3B2C22" d="M15.6 29.6 L9.8 30.9 L15.7 32.2 Z M43.6 43.4 L56 33 L57.4 35.6 L46 46.2 Z"/><circle cx="21.6" cy="29.2" r="1.6" fill="#1E1610"/><path d="M28.6 48.6 L27.6 53 M34.6 48.2 L35 53" stroke="#3B2C22" stroke-width="1.6"/></g>`;

// The card's weather and hour for the day (also given to the words, so the picture and the words agree).
export function cardMood(place, seed, date) {
  const r = rngOf(seed), m = Number(date.slice(5, 7)), sea = SEASON(m);
  const time = pick(r, TIMES);
  const wint = sea === "winter" || ((place === "hokkaido" || place === "scotland") && (m === 11 || m === 3));
  const weather = pick(r, wint ? ["clear", "clear", "cloud", "snow", "snow", "fog"] : ["clear", "clear", "clear", "cloud", "cloud", "rain", "fog"]);
  return { time, weather, sea, m };
}

// The picture: 300 × 200, drawn with a slight tremble (a turbulence filter) and the grain of the card.
export function drawCard(place, seed, date, uid) {
  const fn = PLACES[place];
  if (!fn) return "";
  const { time, weather, sea, m } = cardMood(place, seed, date), r = rngOf(seed * .7 + .13), night = time.dark >= .3;
  const c = { r, sea, m, night, uid };
  const scene = fn(c);
  const flip = r() < .3;
  let sky = `<rect width="300" height="200" fill="url(#sk${uid})"/>`;
  if (time.sun && weather !== "rain" && weather !== "fog") { const sx = btw(r, 40, 260), sy = btw(r, ...time.sy); sky += `<circle cx="${f1(sx)}" cy="${f1(sy)}" r="${f1(btw(r, 10, 15))}" fill="${time.sun}" opacity="${weather === "cloud" ? .6 : .95}"/>`; }
  if (time.k === "night" || time.k === "dusk") {
    const mx = btw(r, 30, 270), my = btw(r, 20, 44), ph = btw(r, -7, 7);
    sky += `<circle cx="${f1(mx)}" cy="${f1(my)}" r="9" fill="#F5EBC8"/><circle cx="${f1(mx + ph)}" cy="${f1(my - 2)}" r="8.4" fill="url(#sk${uid})"/>`;
    if (time.k === "night" && weather !== "cloud") for (let i = 0; i < 24; i++) sky += `<circle cx="${f1(btw(r, 0, 300))}" cy="${f1(btw(r, 0, 90))}" r="${f1(btw(r, .4, 1))}" fill="#fff" opacity="${f1(btw(r, .4, .9))}"/>`;
  }
  const clouds = weather === "cloud" ? 6 : weather === "rain" ? 7 : weather === "snow" ? 5 : Math.floor(btw(r, 0, 4));
  const cc = night ? "#5A6388" : weather === "rain" ? "#AEB4BC" : "#FBFBF8";
  for (let i = 0; i < clouds; i++) { const x = btw(r, -20, 290), y = btw(r, 10, 70), w = btw(r, 30, 60); sky += `<g opacity="${f1(btw(r, .7, .95))}" fill="${cc}"><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w / 2)}" ry="${f1(w / 6)}"/><ellipse cx="${f1(x - w / 6)}" cy="${f1(y - w / 10)}" rx="${f1(w / 5)}" ry="${f1(w / 7)}"/><ellipse cx="${f1(x + w / 7)}" cy="${f1(y - w / 9)}" rx="${f1(w / 4)}" ry="${f1(w / 6)}"/></g>`; }
  let birds = "";
  if (!night && weather !== "rain") for (let i = 0, n = Math.floor(btw(r, 0, 5)); i < n; i++) { const x = btw(r, 20, 280), y = btw(r, 20, 80), s = btw(r, 2.5, 4.5); birds += `<path d="M${f1(x - s)} ${f1(y)} q${f1(s / 2)} ${f1(-s / 2)} ${f1(s)} 0 q${f1(s / 2)} ${f1(-s / 2)} ${f1(s)} 0" stroke="#3A3530" stroke-width=".8" fill="none"/>`; }
  let wx = "";
  if (weather === "rain") for (let i = 0; i < 80; i++) { const x = btw(r, 0, 300), y = btw(r, 0, 200); wx += `<path d="M${f1(x)} ${f1(y)} l-2.4 7" stroke="${night ? "#C9D4E0" : "#5E7186"}" stroke-opacity=".6" stroke-width=".8"/>`; }
  if (weather === "snow") for (let i = 0; i < 60; i++) wx += `<circle cx="${f1(btw(r, 0, 300))}" cy="${f1(btw(r, 0, 200))}" r="${f1(btw(r, .7, 1.8))}" fill="#fff" opacity=".9"/>`;
  if (weather === "fog") wx += `<defs><linearGradient id="fg${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F2EE" stop-opacity="0"/><stop offset=".5" stop-color="#F4F2EE" stop-opacity=".75"/><stop offset="1" stop-color="#F4F2EE" stop-opacity="0"/></linearGradient></defs><rect y="${f1(btw(r, 70, 110))}" width="300" height="90" fill="url(#fg${uid})"/><rect y="${f1(btw(r, 120, 150))}" width="300" height="60" fill="url(#fg${uid})" opacity=".8"/>`;
  const [px, py] = scene.perch.length ? pick(r, scene.perch) : [btw(r, 40, 260), 150];
  const robin = tinyRobin(px, py, r() < .5);
  const dark = time.dark ? `<rect width="300" height="200" fill="#1A2048" opacity="${time.dark}" style="mix-blend-mode:multiply"/>` : "";
  // a grey day looks grey: rain and cloud dim the whole picture a little
  const gloom = weather === "rain" ? `<rect width="300" height="200" fill="#6C7A88" opacity=".34" style="mix-blend-mode:multiply"/>` : weather === "cloud" ? `<rect width="300" height="200" fill="#8C96A0" opacity=".16" style="mix-blend-mode:multiply"/>` : "";
  const warm = time.k === "sunset" || time.k === "dawn" ? `<rect width="300" height="200" fill="#F29A5A" opacity=".14" style="mix-blend-mode:multiply"/>` : "";
  return `<svg class="pc-art" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
    <linearGradient id="sk${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${time.sky[0]}"/><stop offset="1" stop-color="${time.sky[1]}"/></linearGradient>
    <filter id="wb${uid}"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="${Math.floor(seed * 1000)}"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter>
    <filter id="gr${uid}"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${Math.floor(seed * 777)}"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .28  0 0 0 0 .2  0 0 0 .22 0"/></filter></defs>
    ${sky}${birds}<g filter="url(#wb${uid})"${flip ? ' transform="translate(300 0) scale(-1 1)"' : ""}>${scene.s}${robin}</g>${gloom}${dark}${warm}<g${flip ? ' transform="translate(300 0) scale(-1 1)"' : ""}>${scene.l}</g>${wx}
    <rect width="300" height="200" filter="url(#gr${uid})"/></svg>`;
}

// ——— The words ———
const SPOTS = {
  wien: ["摩天輪的車廂頂上", "史蒂芬大教堂的彩色屋頂", "歌劇院的屋簷", "納許市場的棚子上", "環城大道的電車線上", "一間老咖啡館的窗台", "城堡劇院門口的路燈", "美景宮花園的樹籬"],
  salzburg: ["山上城堡的城牆", "大教堂的綠色圓頂旁", "莫札特出生那棟黃房子的窗台", "薩爾察河的橋欄杆", "米拉貝爾花園一尊雕像的頭上", "修道院的屋簷", "糧食胡同的鐵招牌", "老城的噴泉邊"],
  kyoto: ["五重塔最上面一層", "朱紅鳥居的橫木", "鴨川邊的踏石", "竹林裡的一根竹子", "寺院的木廊下", "茶屋門口的燈籠旁", "石板坡道的石燈籠", "金閣寺池邊的松樹"],
  hualien: ["清水斷崖的崖邊", "太魯閣的吊橋", "七星潭的鵝卵石上", "海邊公路的護欄", "峭壁上一棵歪長的樹", "漁港一艘船的桅杆", "燕子口的岩壁", "長春祠旁的瀑布邊"],
  kenting: ["鵝鑾鼻燈塔的欄杆", "椰子樹的葉子", "白沙灣的沙堆", "珊瑚礁的岩石", "夜市招牌的頂上", "船帆石對面的礁岩", "南灣的救生員椅", "龍磐草原的石頭"],
  alishan: ["神木的枝頭", "小火車的車頂", "祝山觀日台的欄杆", "雲海上面一棵檜木", "姊妹潭邊的木棧道", "茶園的竹竿", "車站月台的站牌", "巨木步道的扶手"],
  praha: ["查理大橋一尊雕像的頭上", "舊城廣場天文鐘的旁邊", "城堡尖塔下的窗台", "伏爾塔瓦河遊船的船頭", "一間小酒館的鐵招牌", "橋塔的屋頂", "黃金巷一間小屋的煙囪", "猶太區的古老牆上"],
  london: ["大笨鐘的鐘面旁", "紅色雙層巴士的車頂", "泰晤士河邊的欄杆", "一座紅色電話亭", "公園長椅的椅背", "倫敦眼的車廂外", "塔橋的欄杆", "一間書店門口的招牌"],
  paris: ["艾菲爾鐵塔的第二層", "塞納河邊的書攤", "蒙馬特的台階", "麵包店的遮陽棚", "羅浮宮前的噴水池邊", "鋅皮屋頂的煙囪", "一座橋上的路燈", "盧森堡公園的鐵椅"],
  kinmen: ["風獅爺的頭上", "燕尾屋脊的尾巴", "紅磚牆的窗櫺", "高粱田的穗子", "古寧頭的海灘", "一座老碉堡的槍眼", "老街的石板路上", "一棵大榕樹的氣根"],
  hokkaido: ["鐘樓的屋頂", "薰衣草田的木柵欄", "小樽運河的瓦斯燈", "雪地裡一棵白樺樹", "牧場的圍欄", "函館山觀景台的欄杆", "札幌電視塔的鐵架", "一間拉麵店的暖簾上方"],
  scotland: ["城堡的城垛", "石楠花叢裡", "一頭高地牛的角上", "一座石橋的欄杆", "路邊風笛手的帽子", "湖邊的一根木樁", "皇家哩大道的鐵燈柱", "荒原上的一塊大石頭"],
};
const SEES = {
  wien: ["樓下有人拉小提琴，琴盒裡的硬幣一直在響", "咖啡館的人一杯咖啡可以坐一下午，我也陪他們坐", "電車叮叮噹噹地繞著老城轉", "馬車經過的時候，馬朝我點了一下頭", "教堂的鐘一響，整個廣場的鴿子都飛起來", "麵包店的櫥窗裡擺了一整排可頌", "有一對老夫婦在跳華爾滋，旁邊沒有音樂", "煙囪清掃工從屋頂上跟我揮手", "博物館前的台階上坐滿了畫畫的學生", "多瑙河邊的風把我的羽毛吹亂了", "賣栗子的小攤冒著白煙", "一隊小學生排隊走過去，每個都抬頭看我", "地下室傳出有人練鋼琴的聲音，一直彈同一段", "露天市場的醃黃瓜桶比我還大"],
  salzburg: ["整條街都在放莫札特", "山上的城堡看起來比雲還高", "河邊有人在畫水彩，畫裡沒有我", "巧克力店的金色包裝紙閃閃發亮", "鐘聲從好幾座教堂同時響起來", "花園裡的花排得像一張樂譜", "山上的纜車慢慢爬上去，又慢慢滑下來", "一群人在橋上鎖了好多個愛心鎖", "修道院的修女在花園裡摘香草", "老城的鐵招牌一塊比一塊漂亮", "河水是淡淡的綠色，流得很急", "街頭樂手在拉大提琴，拉的是我聽過的曲子", "教堂裡的管風琴響起來，窗戶都在震", "糕餅店的窗口擺著一座用糖做的城堡"],
  kyoto: ["穿和服的人走路很輕，木屐聲喀喀喀", "楓葉落在水面上，慢慢漂走", "寺院裡的和尚在掃落葉，掃完又落下來", "茶屋的抹茶很香，我只敢聞", "鳥居一座接一座，走不到盡頭", "傍晚的鐘聲從山那邊傳過來", "石板路被雨洗得亮亮的", "一隻貓睡在寺院的賽錢箱上", "小孩在鴨川邊跳石頭過河", "竹子被風吹得沙沙響，像在講悄悄話", "庭院裡的白沙被耙成一圈一圈的水紋", "賣和菓子的老奶奶多看了我一眼", "神社的狐狸石像跟我一樣在發呆", "鹿從奈良跑來了嗎？沒有，那是一隻狗"],
  hualien: ["海是很深很深的藍，深到看不見底", "浪打上石頭灘，石頭嘩啦嘩啦地滾", "峭壁直直地掉進海裡，我不敢往下看", "大理石的峽谷裡有好多回音", "漁船一艘艘出港，船後拖著白色的線", "山上的雲走得比我還快", "海風很鹹，我舔了一下嘴巴", "原住民的阿嬤在路邊賣小米酒", "一群海豚從船邊跳過去", "公路彎來彎去，遊覽車一台接一台", "溪水是乳白色的，聽說是大理石的粉", "颱風留下的漂流木堆在海灘上", "山上的雲掉下來，蓋住了半座山", "一家扁食店的老闆把湯碗端得好穩"],
  kenting: ["沙灘燙得我只敢站在陰影裡", "浪很小，海的顏色一層一層變", "燈塔的白色亮得刺眼", "有人在衝浪，摔下去又爬起來", "椰子掉下來的聲音嚇了我一跳", "晚上夜市的味道飄得好遠", "寄居蟹揹著一個瓶蓋走過去", "有人在沙灘上堆了一座城堡，浪一來就沒了", "風很大，風箏都飛得好高", "水裡的魚是藍色和黃色的", "夕陽把海染成一片金色", "一隻梅花鹿從草原那邊探出頭", "賣冰的阿伯說今天三十二度", "燈塔的守燈人每天爬樓梯上去擦燈"],
  alishan: ["雲海鋪得像一大片棉被", "小火車嘟嘟嘟地爬上山", "檜木的味道好香，聞了就想睡", "清晨大家都在等日出，我比太陽還早醒", "茶園一行一行繞著山", "森林裡安靜到聽得見葉子落地", "樹根上長滿了青苔，軟軟的像地毯", "櫻花開了，粉紅色一整片", "茶園的阿姨手好快，一下就摘滿一籃", "小火車過山洞的時候，大家都喊了一聲", "早上的空氣冷得我一直縮脖子", "一隻松鼠跟我搶同一根樹枝", "山下的雲慢慢升上來，把車站包住", "賣山葵的小店把葉子綁成一束一束"],
  praha: ["橋上的畫家在幫遊客畫像", "天文鐘一到整點，小窗裡的人偶就出來走一圈", "紅色的屋頂一片連著一片", "河上的天鵝游得很慢", "石板路走起來喀啦喀啦", "傀儡戲的木偶跟我一樣高", "城堡衛兵換班，踢腿踢得好高", "教堂的彩色玻璃把光變成好多顏色", "一個街頭藝人用大泡泡把小孩包起來", "啤酒館裡的人唱歌唱得好大聲", "伏爾塔瓦河上的划船一艘艘慢慢經過", "黃色的電車喀噠喀噠爬上坡", "書店的書從地板堆到天花板", "烤肉捲的味道飄過整個廣場"],
  london: ["大笨鐘一響，我的羽毛都跟著震", "雙層巴士轉彎轉得好急", "這裡的人說知更鳥是他們最喜歡的鳥，對我特別好", "泰晤士河的水是灰灰的綠", "下午茶的司康掉了一點屑給我", "雨下一下停一下，大家都不撐傘", "衛兵的帽子毛茸茸的，比我整隻還大", "黑色計程車排成一長排", "博物館不用錢，我也進去看了一下", "劇院門口排著要看音樂劇的人", "公園裡的松鼠一點都不怕人", "地鐵站的風把報紙吹得滿地跑", "市集裡賣的花一桶一桶擺在地上", "書店的老闆說這本書寫的是我們知更鳥"],
  paris: ["書攤老闆分了我一點麵包屑", "鐵塔晚上會一閃一閃", "街角的人在拉手風琴", "咖啡館的椅子全部朝著馬路", "麵包店門口排了好長的隊", "塞納河上的船一艘接一艘", "畫家在廣場上架了好幾個畫架", "地鐵口的綠色招牌彎彎曲曲的", "有人在河邊野餐，鋪了一條格子布", "馬卡龍的顏色跟花一樣多", "教堂的鐘聲從好遠的地方傳過來", "旋轉木馬轉個不停，音樂叮叮咚咚", "雜誌亭的老闆一邊抽菸一邊看報紙", "公園的池子裡有小孩在放小帆船"],
  kinmen: ["風很大，吹得我站不穩", "紅磚房子的牆曬得暖暖的", "高粱田一路紅到海邊", "風獅爺披著紅披風，看起來好神氣", "老街上的貢糖聞起來好香", "海的對岸看得到另一座城市", "菜刀店把砲彈打成一把一把的刀", "海邊的軌條砦一根一根插在沙裡", "牛在田裡慢慢吃草，牛背上站著一隻白鷺鷥", "老房子的門楣上刻著好多字", "麵線攤把麵線晾得像一片白色的簾子", "鸕鷥一大群飛過湖面", "防空洞裡涼涼的，我進去躲了一下太陽", "阿伯在廟口泡茶，泡了一整個下午"],
  hokkaido: ["雪下得好安靜", "薰衣草的味道整片田都是", "我把羽毛蓬起來，看起來圓了一整圈", "運河邊的燈一盞一盞亮起來", "牛群慢慢地走，牧場好大", "拉麵店的熱氣從門口冒出來", "狐狸在雪地上留下一排小腳印", "冰淇淋店門口在下雪天也排隊", "溫泉的煙從山谷裡冒出來", "丹頂鶴在雪地裡跳舞", "海鮮市場的螃蟹比我大好多倍", "白樺樹的樹皮像紙一樣可以撕", "小樽的玻璃工坊裡什麼都亮晶晶的", "火車窗外一整片白，什麼都看不到"],
  scotland: ["荒野上開滿紫色的石楠花", "風裡有海的味道", "有人在吹風笛，聲音傳到很遠的山上", "高地牛的瀏海蓋住了眼睛", "城堡的石牆冷冰冰的", "湖面平得像一面鏡子", "羊群一路走到馬路中間，車都停下來等", "古堡的牆上爬滿了藤", "小酒吧裡有人在拉小提琴，大家跟著踏腳", "穿格子裙的樂隊從街上走過去", "湖邊的霧散開，露出另一座城堡", "雨停了，天邊掛了一道彩虹", "石頭牆一路延伸到山的另一邊", "海鳥在懸崖上吵得好大聲"],
};
const OPEN = ["今天在{zh}。", "{zh}，第{day}天。", "從{zh}寫信給你們。", "{when}的{zh}。", "{zh}這裡，", "還在{zh}。", "嗨，我在{zh}。", "寄自{zh}的{when}。"];
const WEATHER = {
  clear: ["天氣很好，", "天好藍，", "太陽很暖，", "一朵雲也沒有，"],
  cloud: ["雲很厚，", "天陰陰的，", "雲一直在走，", "太陽躲起來了，"],
  rain: ["下雨了，我躲在屋簷下，", "雨一直下，", "淋了一點雨，", "雨聲滴滴答答，"],
  fog: ["起霧了，什麼都白白的，", "霧好濃，", "霧把遠的東西都藏起來，", "霧裡有點冷，"],
  snow: ["下雪了，", "雪一直落，", "腳下都是雪，", "雪花停在我的頭上，"],
};
const LETTER = ["今天收到你們寄來的〈{title}〉，在{spot2}讀完的。", "〈{title}〉寄到了，我讀了兩遍。", "今天的信是〈{title}〉，讀完我想了很久。", "收到〈{title}〉了，謝謝你們記得我。", "〈{title}〉跟著我走了一整天。", "我把〈{title}〉帶著，坐在高的地方讀。"];
const LETTERS_N = ["今天收到 {n} 封信。", "今天有 {n} 封信寄到。", "郵差今天送來 {n} 封信。"];
const NO_LETTER = ["今天沒有收到信，有點想家。", "今天沒有信，我一直看著郵差。", "今天信箱空空的，你們在忙嗎？"];
const CLOSE_MID = ["明天想去別的地方看看。", "還有 {left} 天就回家。", "明天再寫給你們。", "我很好，別擔心。", "記得替我看看院子。", "回去的時候帶東西給你們。"];
const CLOSE_LAST = ["明天就回家了。", "這是這趟最後一張。", "要收行李了，明天見。", "明天早上就飛回去。"];
const CLOSE_FIRST = ["剛到，一切都很新。", "第一天，先到處看看。", "到了，路上很順。", "剛落地，還在找方向。"];
// The k-th card from a place, in a yard's own order (`order`, a number from the yard's code): the scenery line and the
// perch go through their lists one by one, a step that skips around, so one comes back only after all the others.
const nth = (list, k, order, salt) => { const n = list.length, steps = [5, 7, 3, 11, 13].filter((x) => n % x !== 0); return list[(Math.floor(order * n * salt) + k * (steps[0] || 1)) % n]; };
export function cardWords(place, seed, date, { day = 1, len = 1, zh = "", n = 0, title = "", k = 0, order = .5 } = {}) {
  const { time, weather } = cardMood(place, seed, date), r = rngOf(seed * .37 + .51);
  const spots = SPOTS[place] || ["一個屋頂"], spot = nth(spots, k, order, 1), spot2 = pick(r, spots.filter((x) => x !== spot));
  const fill = (s) => s.replace(/\{zh\}/g, zh).replace(/\{day\}/g, ["", "一", "二", "三", "四", "五", "六", "七"][day] || String(day)).replace(/\{when\}/g, time.zh).replace(/\{title\}/g, title).replace(/\{spot2\}/g, spot2).replace(/\{n\}/g, String(n)).replace(/\{left\}/g, String(len - day));
  const lines = [fill(pick(r, OPEN)) + `我停在${spot}，${nth(SEES[place] || ["風很舒服"], k, order, 3)}。`];
  if (r() < .7) lines.push(`${pick(r, WEATHER[weather])}${time.k === "night" ? "夜裡的燈都亮了。" : time.k === "dawn" ? "天剛亮。" : time.k === "sunset" ? "天邊紅紅的。" : time.k === "dusk" ? "天慢慢暗下來。" : "我在外面待了很久。"}`);
  lines.push(title ? fill(pick(r, LETTER)) : n ? fill(pick(r, LETTERS_N)) : pick(r, NO_LETTER));
  lines.push(fill(pick(r, day === len ? CLOSE_LAST : day === 1 ? CLOSE_FIRST : CLOSE_MID)));
  return lines;
}
