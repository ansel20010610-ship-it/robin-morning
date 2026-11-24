// 月令扉頁 (the month's frontispiece; app.js viewFront): on the first of every month — the issue's own date, which is
// Taipei's, so an archive issue dated the 1st has it too — the front page carries that month's calendar picture under the
// masthead's verse and above 今日禱告 (and above the day's stamp card when the 1st is a feast, as every 1 January is).
// On any other day nothing is drawn and no room is kept. The picture sits in the crest's own frame (style.css .yl-frm),
// the month's name on a paper slip let into its top-left corner, and under it one line saying what the picture shows and
// one small line of credit, centred like a museum label.
//
// The pictures: the twelve month leaves of the Très Riches Heures du duc de Berry (Musée Condé, Chantilly, MS 65, ff. 1v–12v),
// as Wikimedia Commons has them — public domain (PD-Art, CC-PD-Mark). Each is cut from Commons' 960px thumbnail of the
// leaf: inside the painted gold border, 2.35 : 1, the rows chosen so the people stand in the picture and no face falls
// under the slip, resized to 944×402 and kept here (assets/yueling/), so the page never asks Commons for them. The
// <img> carries its size and the box its shape (style.css .yl-pic), so nothing moves while the picture arrives, and the
// box stays paper-coloured if it never does: iPhone Safari has no scroll anchoring.
//   Crop on the 960px leaf (columns x0–x1, rows from y0), Commons file name:
//   1 29–934, 735 Les Très Riches Heures du duc de Berry Janvier.jpg · 2 6–950, 575 …février.jpg · 3 10–946, 1080 …mars.jpg
//   4 6–949, 765 …avril.jpg · 5 34–920, 565 Frères Limbourg - Très Riches Heures du duc de Berry - mois de mai - Google Art
//   Project.jpg (converted from its Generic RGB profile to sRGB) · 6 11–939, 730 …juin.jpg · 7 13–946, 915 …juillet.jpg
//   8 24–941, 800 …aout.jpg (from DonRGB4 to sRGB) · 9 11–944, 1130 …septembre.jpg · 10 15–944, 990 …octobre.jpg
//   11 15–937, 960 …novembre.jpg · 12 6–950, 1064 …décembre.jpg (the two hunters head to foot)
import { esc, MON_DE } from "./util.js";

// One row a month: the name, the picture, the line under it, who painted it and when. Several hands on one leaf (the
// Limbourg brothers' work finished by Barthélemy d'Eyck and Jean Colombe) are signed 林堡兄弟等. The Chinese forms of the
// painters' names are the paper's own. The German name is util.js MON_DE (Viennese: Jänner).
const MONTHS = [
  { zh: "一月", img: "assets/yueling/01.jpg", line: "公爵設宴過新年，壁爐前擠滿賓客", by: "林堡兄弟", year: "約 1412–1416" },
  { zh: "二月", img: "assets/yueling/02.jpg", line: "大雪天，農家圍著爐火取暖，屋外有人砍柴", by: "林堡兄弟", year: "約 1412–1416" },
  { zh: "三月", img: "assets/yueling/03.jpg", line: "城堡下農人趕牛犁田，旁邊在修剪葡萄藤", by: "林堡兄弟等", year: "約 1412–1440" },
  { zh: "四月", img: "assets/yueling/04.jpg", line: "草地上一對年輕人交換戒指訂婚，侍女在旁採花", by: "林堡兄弟", year: "約 1412–1416" },
  { zh: "五月", img: "assets/yueling/05.jpg", line: "五月一日，號手開路，貴族戴著綠葉騎馬出遊", by: "林堡兄弟", year: "約 1412–1416" },
  { zh: "六月", img: "assets/yueling/06.jpg", line: "塞納河邊割牧草，對岸是巴黎王宮和聖禮拜堂", by: "林堡兄弟等", year: "約 1412–1486" },
  { zh: "七月", img: "assets/yueling/07.jpg", line: "城堡前割麥子，河邊有人在剪羊毛", by: "林堡兄弟等", year: "約 1412–1440" },
  { zh: "八月", img: "assets/yueling/08.jpg", line: "貴族帶著獵鷹出遊，遠處農人收麥、下河游泳", by: "林堡兄弟", year: "約 1412–1416" },
  { zh: "九月", img: "assets/yueling/09.jpg", line: "城堡下採葡萄，一筐筐倒進牛車上的大桶", by: "林堡兄弟等", year: "約 1412–1486" },
  { zh: "十月", img: "assets/yueling/10.jpg", line: "羅浮宮對岸，農人撒種、耙地，田裡立著稻草人", by: "林堡兄弟等", year: "約 1412–1440" },
  { zh: "十一月", img: "assets/yueling/11.jpg", line: "林子裡，豬倌把棍子往樹上扔，打下橡實餵豬", by: "讓・科隆布", year: "約 1485" },
  { zh: "十二月", img: "assets/yueling/12.jpg", line: "林中獵到野豬，獵人吹號角，獵犬一擁而上", by: "巴泰勒米・戴克", year: "約 1440" },
];

// The line breaks only after a comma (style.css .yl-ln keeps the phrases whole); the credit only between its three parts.
const breaks = (s) => esc(s).replace(/([，、])/g, "$1<wbr>");

// The banner for an issue dated `date` (YYYY-MM-DD), or "" on any day but the 1st.
export function yuelingHtml(date) {
  if (!/^\d{4}-\d{2}-01$/.test(date || "")) return "";
  const n = Number(date.slice(5, 7)), M = MONTHS[n - 1];
  if (!M) return "";
  return `<figure class="yl-fig" aria-label="${esc(M.zh)}月令"><span class="yl-frm"><span class="yl-pic"><img src="${esc(M.img)}" width="944" height="402" alt="" decoding="async">`
    + `<span class="yl-slip"><span class="yl-zh">${esc(M.zh)}</span><span class="yl-de">${esc(MON_DE[n - 1])}</span></span></span></span>`
    + `<figcaption class="yl-cap"><span class="yl-ln">${breaks(M.line)}</span><span class="yl-cr"><span>${esc(M.by)}</span><wbr><span class="yl-bk">《貝里公爵的豪華時禱書》</span><wbr><span>${esc(M.year)}</span></span></figcaption></figure>`;
}
