// 明信片 (Postkarten): the postcards the yard's robin sends home every day it travels abroad (nest.js lifeOf), drawn by
// hand in SVG — no photographs (the owner, 2026-11-10: 不要真實的照片，用你的方法手搓手繪明信片，但要是可以看出地點的)
// — and never one of a few in rotation (文案和照片每天都不一樣，注意是每天而不是幾個在輪; 如果出國每天明信片要是不同
// 景點; 增加至 30 個城市). Thirty cities abroad (none in Taiwan, at the owner's word), six famous sights each, every
// sight drawn from its best-known silhouette in sights.js; a trip shows a different sight every day, and the yard sees
// all of a city's sights before one comes back. Each day's card is then composed afresh from the day's seed: the hour
// (dawn to sunset — daytime only, 不用日夜), the weather (clear, cloud, rain, fog, snow), the season of the real date,
// birds, where the robin itself perches in the picture. The words are put together the same way — the sight by name,
// where it sat, what it saw there, the hour and the weather, the piece of the paper it got that day, the days left.
// Pure: the same seed draws the same card on every phone. Loaded only when a card is shown (nest.js loadCards), so the
// paper's start does not carry the drawings.
import { rngOf, pick, btw, f1, TIMES, SEASON } from "./pc-kit.js";
import { CITIES } from "./sights.js";

const NORTH = new Set(["hokkaido", "scotland", "reykjavik", "stockholm", "copenhagen", "muenchen", "berlin", "salzburg"]);

// the robin itself, small, perched somewhere in the picture
const tinyRobin = (x, y, flip) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${flip ? -.28 : .28} .28) translate(-32 -50)"><path fill="#7A5A44" d="M17.6 27.2 C13.2 32.8 13.8 42 20.4 46.8 C26.6 51.2 37.4 51.4 43.4 45.6 C46.8 42.2 47.6 36.8 45.4 32.2 C42.4 26 33 21.6 25 23 C21.8 23.6 19.4 25 17.6 27.2 Z"/><path fill="#D2583C" d="M17.6 27.2 C14 32 14.4 40 19.6 45.2 C22.6 48 27.6 49 32 47.6 C32.4 40.2 29.4 32 25.2 27 C23.4 25.6 20.4 25.4 17.6 27.2 Z"/><path fill="#3B2C22" d="M15.6 29.6 L9.8 30.9 L15.7 32.2 Z M43.6 43.4 L56 33 L57.4 35.6 L46 46.2 Z"/><circle cx="21.6" cy="29.2" r="1.6" fill="#1E1610"/><path d="M28.6 48.6 L27.6 53 M34.6 48.2 L35 53" stroke="#3B2C22" stroke-width="1.6"/></g>`;

// The card's hour and weather for the day (also given to the words, so the picture and the words agree).
export function cardMood(city, seed, date) {
  const r = rngOf(seed), m = Number(date.slice(5, 7)), sea = SEASON(m);
  const time = pick(r, TIMES);
  const cold = sea === "winter" || (NORTH.has(city) && (m === 11 || m === 3));
  const warmPlace = ["cairo", "santorini", "sydney", "barcelona", "lisboa", "roma", "athens"].includes(city);
  const weather = pick(r, cold && !warmPlace ? ["clear", "clear", "cloud", "snow", "snow", "fog"] : city === "cairo" ? ["clear", "clear", "clear", "clear", "cloud"] : ["clear", "clear", "clear", "cloud", "cloud", "rain", "fog"]);
  return { time, weather, sea, m };
}

// The picture: 300 × 200, the sight drawn with a slight tremble (a turbulence filter) and the grain of the card.
export function drawCard(city, sight, seed, date, uid) {
  const s0 = CITIES[city]?.sights?.[sight];
  if (!s0) return "";
  const { time, weather, sea, m } = cardMood(city, seed, date), r = rngOf(seed * .7 + .13);
  let scene;
  try { scene = s0.draw({ r, sea, m, night: false, uid }); } catch { scene = { s: "", l: "", perch: [] }; } // a drawing that fails leaves a plain card, never a broken page
  const flip = r() < .2;
  let sky = `<rect width="300" height="200" fill="url(#sk${uid})"/>`;
  if (time.sun && weather !== "rain" && weather !== "fog") { const sx = btw(r, 40, 260), sy = btw(r, ...time.sy); sky += `<circle cx="${f1(sx)}" cy="${f1(sy)}" r="${f1(btw(r, 10, 15))}" fill="${time.sun}" opacity="${weather === "cloud" ? .6 : .95}"/>`; }
  const clouds = weather === "cloud" ? 6 : weather === "rain" ? 7 : weather === "snow" ? 5 : Math.floor(btw(r, 0, 4));
  const cc = weather === "rain" ? "#AEB4BC" : "#FBFBF8";
  for (let i = 0; i < clouds; i++) { const x = btw(r, -20, 290), y = btw(r, 10, 70), w = btw(r, 30, 60); sky += `<g opacity="${f1(btw(r, .7, .95))}" fill="${cc}"><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w / 2)}" ry="${f1(w / 6)}"/><ellipse cx="${f1(x - w / 6)}" cy="${f1(y - w / 10)}" rx="${f1(w / 5)}" ry="${f1(w / 7)}"/><ellipse cx="${f1(x + w / 7)}" cy="${f1(y - w / 9)}" rx="${f1(w / 4)}" ry="${f1(w / 6)}"/></g>`; }
  let birds = "";
  if (weather !== "rain") for (let i = 0, n = Math.floor(btw(r, 0, 5)); i < n; i++) { const x = btw(r, 20, 280), y = btw(r, 20, 80), s = btw(r, 2.5, 4.5); birds += `<path d="M${f1(x - s)} ${f1(y)} q${f1(s / 2)} ${f1(-s / 2)} ${f1(s)} 0 q${f1(s / 2)} ${f1(-s / 2)} ${f1(s)} 0" stroke="#3A3530" stroke-width=".8" fill="none"/>`; }
  let wx = "";
  if (weather === "rain") for (let i = 0; i < 80; i++) { const x = btw(r, 0, 300), y = btw(r, 0, 200); wx += `<path d="M${f1(x)} ${f1(y)} l-2.4 7" stroke="#5E7186" stroke-opacity=".6" stroke-width=".8"/>`; }
  if (weather === "snow") for (let i = 0; i < 60; i++) wx += `<circle cx="${f1(btw(r, 0, 300))}" cy="${f1(btw(r, 0, 200))}" r="${f1(btw(r, .7, 1.8))}" fill="#fff" opacity=".9"/>`;
  if (weather === "fog") wx += `<defs><linearGradient id="fg${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F2EE" stop-opacity="0"/><stop offset=".5" stop-color="#F4F2EE" stop-opacity=".75"/><stop offset="1" stop-color="#F4F2EE" stop-opacity="0"/></linearGradient></defs><rect y="${f1(btw(r, 70, 110))}" width="300" height="90" fill="url(#fg${uid})"/><rect y="${f1(btw(r, 120, 150))}" width="300" height="60" fill="url(#fg${uid})" opacity=".8"/>`;
  const perch = scene.perch?.length ? scene.perch : [[btw(r, 40, 260), 150]];
  const [px, py] = pick(r, perch);
  const robin = tinyRobin(px, py, r() < .5);
  const gloom = weather === "rain" ? `<rect width="300" height="200" fill="#6C7A88" opacity=".34" style="mix-blend-mode:multiply"/>` : weather === "cloud" ? `<rect width="300" height="200" fill="#8C96A0" opacity=".16" style="mix-blend-mode:multiply"/>` : "";
  const warm = time.k === "sunset" || time.k === "dawn" ? `<rect width="300" height="200" fill="#F29A5A" opacity=".14" style="mix-blend-mode:multiply"/>` : "";
  const flipT = flip ? ' transform="translate(300 0) scale(-1 1)"' : "";
  return `<svg class="pc-art" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
    <linearGradient id="sk${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${time.sky[0]}"/><stop offset="1" stop-color="${time.sky[1]}"/></linearGradient>
    <filter id="wb${uid}"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="${Math.floor(seed * 1000)}"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter>
    <filter id="gr${uid}"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${Math.floor(seed * 777)}"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .28  0 0 0 0 .2  0 0 0 .22 0"/></filter></defs>
    ${sky}${birds}<g filter="url(#wb${uid})"${flipT}>${scene.s || ""}${robin}</g>${gloom}${warm}${wx}
    <rect width="300" height="200" filter="url(#gr${uid})"/></svg>`;
}

// ——— The words ———
const OPEN = ["今天在{city}，去了{sight}。", "{city}第{day}天，{sight}。", "從{city}的{sight}寫信給你們。", "{when}的{sight}。", "嗨，我在{sight}。", "今天的{city}：{sight}。", "寄自{city}，{sight}前面。", "{city}，{sight}，{when}。"];
const WEATHER = {
  clear: ["天氣很好，", "天好藍，", "太陽很暖，", "一朵雲也沒有，"],
  cloud: ["雲很厚，", "天陰陰的，", "雲一直在走，", "太陽躲起來了，"],
  rain: ["下雨了，我躲在屋簷下，", "雨一直下，", "淋了一點雨，", "雨聲滴滴答答，"],
  fog: ["起霧了，什麼都白白的，", "霧好濃，", "霧把遠的東西都藏起來，", "霧裡有點冷，"],
  snow: ["下雪了，", "雪一直落，", "腳下都是雪，", "雪花停在我的頭上，"],
};
const HOUR = { dawn: "天剛亮。", morning: "早上的光很乾淨。", noon: "中午的影子短短的。", afternoon: "我在外面待了一下午。", sunset: "天邊紅紅的。" };
const LETTER = ["今天收到你們寄來的〈{title}〉，在{spot2}讀完的。", "〈{title}〉寄到了，我讀了兩遍。", "今天的信是〈{title}〉，讀完我想了很久。", "收到〈{title}〉了，謝謝你們記得我。", "〈{title}〉跟著我走了一整天。", "我把〈{title}〉帶著，坐在高的地方讀。"];
const LETTERS_N = ["今天收到 {n} 封信。", "今天有 {n} 封信寄到。", "郵差今天送來 {n} 封信。"];
const NO_LETTER = ["今天沒有收到信，有點想家。", "今天沒有信，我一直看著郵差。", "今天信箱空空的，你們在忙嗎？"];
const CLOSE_MID = ["明天想去別的地方看看。", "還有 {left} 天就回家。", "明天再寫給你們。", "我很好，別擔心。", "記得替我看看院子。", "回去的時候帶東西給你們。"];
const CLOSE_LAST = ["明天就回家了。", "這是這趟最後一張。", "要收行李了，明天見。", "明天早上就飛回去。"];
const CLOSE_FIRST = ["剛到，一切都很新。", "第一天，先到處看看。", "到了，路上很順。", "剛落地，還在找方向。"];
const CN = ["", "一", "二", "三", "四", "五", "六", "七"];
// `visit`: how many times the yard has had this sight before — its observations go round one by one
export function cardWords(city, sight, seed, date, { day = 1, len = 1, n = 0, title = "", visit = 0 } = {}) {
  const C = CITIES[city], S = C?.sights?.[sight];
  if (!S) return [];
  const { time, weather } = cardMood(city, seed, date), r = rngOf(seed * .37 + .51);
  const spot = pick(r, S.spots), others = S.spots.filter((x) => x !== spot), spot2 = others.length ? pick(r, others) : spot;
  const fill = (s) => s.replace(/\{city\}/g, C.zh).replace(/\{sight\}/g, S.zh).replace(/\{day\}/g, CN[day] || String(day)).replace(/\{when\}/g, time.zh)
    .replace(/\{title\}/g, title).replace(/\{spot2\}/g, spot2).replace(/\{n\}/g, String(n)).replace(/\{left\}/g, String(len - day));
  const lines = [`${fill(pick(r, OPEN))}我停在${spot}，${S.see[visit % S.see.length]}。`];
  if (r() < .7) lines.push(`${pick(r, WEATHER[weather])}${HOUR[time.k] || ""}`);
  lines.push(title ? fill(pick(r, LETTER)) : n ? fill(pick(r, LETTERS_N)) : pick(r, NO_LETTER));
  lines.push(fill(pick(r, day === len ? CLOSE_LAST : day === 1 ? CLOSE_FIRST : CLOSE_MID)));
  return lines;
}
