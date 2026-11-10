// The drawing kit for the postcards (postcard.js, sights.js): a seeded random generator and the small parts every
// scene uses — trees that show the season, water with ripples, boats, hills, rows of houses. Cards are daytime only
// (the owner, 2026-11-10: 不用日夜), from dawn to sunset.
export const rngOf = (seed) => { let a = Math.floor(seed * 4294967296) >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
export const pick = (r, list) => list[Math.floor(r() * list.length) % list.length];
export const btw = (r, a, b) => a + r() * (b - a);
export const f1 = (n) => (Math.round(n * 10) / 10).toString();

export const TIMES = [
  { k: "dawn", zh: "清晨", sky: ["#EFAF93", "#FCE4C2"], sun: "#FFD49A", sy: [118, 132], dark: 0 },
  { k: "morning", zh: "早上", sky: ["#A3CFEB", "#E9F4F5"], sun: "#FFF0B5", sy: [42, 62], dark: 0 },
  { k: "noon", zh: "中午", sky: ["#86BEE6", "#D6ECF5"], sun: "#FFF4C6", sy: [24, 36], dark: 0 },
  { k: "afternoon", zh: "下午", sky: ["#9BC0DF", "#F2E2BE"], sun: "#FFE29C", sy: [52, 76], dark: 0 },
  { k: "sunset", zh: "傍晚", sky: ["#D96E4E", "#F7C685"], sun: "#FFB065", sy: [104, 122], dark: .12 },
];
export const SEASON = (m) => (m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter");
export const LEAF = { spring: ["#F2B6C6", "#E99AB0"], summer: ["#5F8E4C", "#4A7A3C"], autumn: ["#D9783A", "#C2552E"], winter: ["#8A7B6A", "#76695A"] };

// ——— small parts ———
export const tree = (x, y, s, sea, r) => {
  const [a, b] = LEAF[sea], trunk = `<path d="M${f1(x)} ${f1(y)} l0 ${f1(-14 * s)}" stroke="#5A4232" stroke-width="${f1(2.4 * s)}" stroke-linecap="round"/>`;
  if (sea === "winter") return `${trunk}<path d="M${f1(x)} ${f1(y - 10 * s)} l${f1(-7 * s)} ${f1(-8 * s)} M${f1(x)} ${f1(y - 12 * s)} l${f1(6 * s)} ${f1(-9 * s)} M${f1(x)} ${f1(y - 14 * s)} l0 ${f1(-6 * s)}" stroke="#5A4232" stroke-width="${f1(1.1 * s)}" fill="none"/>`;
  return `${trunk}<circle cx="${f1(x - 4 * s)}" cy="${f1(y - 17 * s)}" r="${f1(7 * s)}" fill="${a}"/><circle cx="${f1(x + 4 * s)}" cy="${f1(y - 19 * s)}" r="${f1(7.5 * s)}" fill="${b}"/><circle cx="${f1(x)}" cy="${f1(y - 24 * s)}" r="${f1(6.5 * s)}" fill="${r() < .5 ? a : b}"/>`;
};
export const water = (y, top, deep, r) => {
  let w = `<rect x="0" y="${y}" width="300" height="${200 - y}" fill="${deep}"/><rect x="0" y="${y}" width="300" height="5" fill="${top}" opacity=".7"/>`;
  for (let i = 0; i < 9; i++) { const x = btw(r, 0, 280), yy = btw(r, y + 8, 196); w += `<path d="M${f1(x)} ${f1(yy)} q4 -2 8 0 t8 0" stroke="#fff" stroke-opacity=".45" stroke-width=".9" fill="none"/>`; }
  return w;
};
export const boat = (x, y, s, sail) => (sail
  ? `<path d="M${f1(x)} ${f1(y)} h${f1(22 * s)} l${f1(-4 * s)} ${f1(5 * s)} h${f1(-14 * s)} Z" fill="#6A4A36"/><path d="M${f1(x + 11 * s)} ${f1(y - 1)} v${f1(-20 * s)} l${f1(9 * s)} ${f1(17 * s)} Z" fill="#F5EEDF"/>`
  : `<path d="M${f1(x)} ${f1(y)} h${f1(26 * s)} l${f1(-5 * s)} ${f1(6 * s)} h${f1(-16 * s)} Z" fill="#3E5568"/><rect x="${f1(x + 8 * s)}" y="${f1(y - 6 * s)}" width="${f1(10 * s)}" height="${f1(6 * s)}" fill="#E9E1D0"/>`);
export const hills = (y, color, r, amp = 16) => { let d = `M0 200 L0 ${f1(y)}`; for (let x = 0; x <= 300; x += 30) d += ` Q${f1(x + 15)} ${f1(y - btw(r, 0, amp))} ${x + 30} ${f1(y + btw(r, -amp / 3, amp / 3))}`; return `<path d="${d} L300 200 Z" fill="${color}"/>`; };
export const lit = (x, y, w, h) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="#FFD27A"/>`;
export const houses = (y, n, r, cols, night, x0 = btw(r, -8, 4)) => {
  let s = "", l = "", x = x0;
  for (let i = 0; i < n && x < 300; i++) {
    const w = btw(r, 22, 36), h = btw(r, 22, 40), c = pick(r, cols);
    s += `<rect x="${f1(x)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(h)}" fill="${c}"/><path d="M${f1(x - 2)} ${f1(y - h)} L${f1(x + w / 2)} ${f1(y - h - btw(r, 8, 14))} L${f1(x + w + 2)} ${f1(y - h)} Z" fill="${pick(r, ["#9A4E3C", "#7E6B5C", "#5E6B78"])}"/>`;
    for (let k = 0; k < 2; k++) { const wx = x + 5 + k * (w - 14), wy = y - h + 7; s += `<rect x="${f1(wx)}" y="${f1(wy)}" width="4" height="5" fill="#4A3F38" opacity=".55"/>`; if (night && r() < .6) l += lit(wx, wy, 4, 5); }
    x += w + btw(r, 0, 4);
  }
  return { s, l };
};

