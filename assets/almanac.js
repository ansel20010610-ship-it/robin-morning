// 天象與連假: two small lines of the front page, both out of the tables below and nothing else (no fetch, so they are
// drawn with the page they belong to; the iPhone has no scroll anchoring and a line that came late would push the page).
//   今晚 (the weather box's last row): on a day with a sight worth looking up for in the evening, one short sentence.
//   下一個連假 (under the masthead's dateline): the week before a run of three days off or more.
// Both only on today's paper (app.js todays). The tables end where their sources do — see each one — and the lines
// then simply stop; nothing is guessed past them.
import { esc } from "./util.js";

// ——— 今晚抬頭看 ———
// Taichung, evening to midnight, the sights a naked eye reads at once (臺北天文館 2026/2027 重要天象表, the times and
// heights of Taichung's own sky from NASA/JPL Horizons), by Taiwan date. The sentence follows the tag 「今晚」 that the
// row sets in small gold, so it never says 今晚 itself; it stays short enough for one line of the box (402 pt wide).
// The table runs to 2027-11-30. Early-morning sights are not listed (the owner: only the evenings).
export const SKY = {
  "2026-12-14": "10 點後看東北方：雙子座流星雨極大",
  "2026-12-24": "5 點半後看東方偏北：今年最大的超級月亮",
  "2026-12-27": "10 點後看東方：月亮旁很亮的是木星",
  "2027-01-22": "6 點後看東方：今年最大的超級月亮",
  "2027-02-11": "天黑後看東方：最亮的是木星，整晚都在",
  "2027-02-19": "看東方：偏紅的是火星，上方更亮的是木星",
  "2027-03-19": "天黑看東方高空：月亮旁最亮的是木星",
  "2027-04-15": "看頭頂偏西：月亮旁的亮星是木星",
  "2027-06-09": "7 點半後看西方：月牙旁的亮星是木星",
  "2027-10-18": "看東方：不閃、帶點黃的亮星是土星",
  "2027-11-30": "5 點半看西南：月牙旁是金星和火星，很快下山",
};
// Raining tonight: the largest hourly chance between 18:00 and 23:59 (Open-Meteo hourly.precipitation_probability, the
// forecast wetter.js keeps) at or over this, and there is no use looking up: the row is not printed.
export const SKY_RAIN = 70;
export const skyLine = (date) => SKY[date] || "";
// true when the evening is rainy by `d`, the day's forecast — of `date` only, when given (the forecast runs over three
// days); false with no evening figures (the row then stands by the table)
export function eveningRain(d, date) {
  try {
    const t = d.hourly.time, p = d.hourly.precipitation_probability;
    let m = -1;
    t.forEach((s, i) => { const h = typeof s === "string" && (!date || s.startsWith(`${date}T`)) ? Number(s.slice(11, 13)) : NaN; if (h >= 18 && h <= 23 && typeof p[i] === "number" && p[i] > m) m = p[i]; });
    return m >= SKY_RAIN;
  } catch { return false; }
}
// The row, shown (`on`) or kept as an empty line of the same height (`blank`, when the forecast came late and said rain).
export const skyRow = (text, blank = false) => `<div class="row sky${blank ? " off" : ""}"${blank ? ` aria-hidden="true"` : ""}><span class="sk-tag">今晚</span><span class="tx">${esc(text)}</span></div>`;

// ——— 下一個連假 ———
// Runs of three days off or more, weekends and make-up days included, out of 行政院人事行政總處's 115 and 116 年
// 辦公日曆表 (to 2027-12-26; 2028's calendar is not out, so whether 2027-12-31 joins 2028-01-01 is not known and the
// run is left out). [first day, last day, the name the line uses].
export const FERIEN_DAYS = 7; // the line shows from this many days before a run until the day before it
export const FERIEN = [
  ["2026-12-25", "2026-12-27", "行憲紀念日"],
  ["2027-01-01", "2027-01-03", "元旦"],
  ["2027-02-04", "2027-02-10", "春節"], // 小年夜 to the make-up days
  ["2027-02-27", "2027-03-01", "和平紀念日"],
  ["2027-04-03", "2027-04-06", "清明節"], // 兒童節, 清明節, the make-up day
  ["2027-04-30", "2027-05-02", "勞動節"],
  ["2027-10-09", "2027-10-11", "國慶日"],
  ["2027-10-23", "2027-10-25", "光復節"],
  ["2027-12-24", "2027-12-26", "行憲紀念日"],
];
const dayNo = (iso) => Date.parse(`${iso}T00:00:00Z`) / 864e5;
const md = (iso) => `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`;
// The sentence for Taiwan date `today`, or "". Inside a run (its first day to its last) nothing is shown, so a holiday
// does not announce the next one; the day before a run it reads 明天起.
export function ferienLine(today) {
  if (FERIEN.some(([s, e]) => s <= today && today <= e)) return "";
  const run = FERIEN.find(([s]) => s > today);
  if (!run) return "";
  const [s, e, name] = run, until = dayNo(s) - dayNo(today), len = dayNo(e) - dayNo(s) + 1;
  if (until > FERIEN_DAYS) return "";
  if (until === 1) return `明天起連放 ${len} 天：${name}`;
  return `下一個連假：${name} ${md(s)}（${"日一二三四五六"[new Date(`${s}T00:00:00Z`).getUTCDay()]}）到 ${md(e)}，還有 ${until} 天`;
}
