// 今日氣象 (Wetter): Taichung's day on the front page, in the row 接著上次 once held (app.js weatherBox, fillWeather), out of Open-Meteo —
// free, no key, and nothing of the reader's goes out but the city's coordinates. One answer serves the morning: it is
// kept in localStorage (rm.wx) and reused while it is today's and under three hours old; when the network fails, today's
// kept copy still serves, and with none the masthead simply has no line. The answer runs over three days, today first:
// from 20:00 the box shows tomorrow (明日氣象), and on a Friday evening the weekend (週末氣象), out of the same copy
// (shownDays); every other reader of it (the masthead's window, the yard's sky, the sunrise, the 出門前 card) takes today.
import { esc, store, twNow, within } from "./util.js";

// Today's kept copy whatever its age, or null: the front page draws the box out of it at once and lets the fresh answer
// fill it in place — hidden until the network answered, it came in above the first article and pushed the page down
// under the reader (the iPhone has no scroll anchoring; audit 2026-11-11).
export const keptWeather = () => { const k = store.get("wx"); return k?.date === twNow().date && k.data ? k.data : null; };

// Today's sunrise and sunset in Taichung, "HH:MM", out of today's kept forecast `d` (as keptWeather gives it); while
// there is none, the pair written here (sunTimes(null) answers it: the only place it is written). The yard's night
// (nest.js realSky) and the room's light (salon.js) both go by it.
export function sunTimes(d = keptWeather()) {
  const t = (x, f) => (/T\d{2}:\d{2}/.test(x || "") ? x.slice(11, 16) : f);
  return { rise: t(d?.daily?.sunrise?.[0], "06:10"), set: t(d?.daily?.sunset?.[0], "17:20") };
}

const API ="https://api.open-meteo.com/v1/forecast?latitude=24.1477&longitude=120.6736&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&hourly=temperature_2m,precipitation_probability,weather_code&timezone=Asia%2FTaipei&forecast_days=3";
const MAX_AGE = 3 * 3600 * 1000;

// Whether forecast `d` has every one of `days` ("YYYY-MM-DD") among its days.
const covers = (d, days) => Array.isArray(d?.daily?.time) && days.every((x) => d.daily.time.includes(x));

// The forecast as Open-Meteo sends it (daily.* one value a day, hourly.* twenty-four a day, today first), or null.
// `days` are the dates the caller reads out of it: a kept copy that lacks one of them (one kept while the answer was a
// single day) is asked for again, never taken for them. Offline, today's kept copy is still the answer, as it is; a day
// it lacks then simply has no figures (weatherFacts). Never throws.
export async function fetchWeather(days = [twNow().date]) {
  const now = twNow(), kept = store.get("wx");
  const todays = kept?.date === now.date && kept.data ? kept : null;
  if (todays && now.ms - Number(todays.at) < MAX_AGE && covers(todays.data, days)) return todays.data;
  try {
    const r = await fetch(API, { cache: "no-cache", ...within(8000) });
    if (!r.ok) throw new Error(String(r.status));
    const data = await r.json();
    if (!Array.isArray(data?.daily?.weather_code) || !Array.isArray(data?.hourly?.time)) throw new Error("shape");
    store.set("wx", { date: now.date, at: now.ms, data });
    return data;
  } catch { return todays?.data ?? null; }
}

// WMO 4677 codes as Open-Meteo gives them, in the paper's words; anything else (snow showers, codes Taichung never
// sees) reads as overcast.
const WMO = [[0, 0, "晴"], [1, 1, "大致晴"], [2, 2, "多雲時晴"], [3, 3, "多雲"], [45, 48, "有霧"], [51, 57, "毛毛雨"], [61, 67, "有雨"],
  [71, 77, "下雪"], [80, 82, "陣雨"], [95, 99, "雷雨"]];
export const wmoWord = (code) => { const c = typeof code === "number" ? code : NaN; return WMO.find(([a, b]) => c >= a && c <= b)?.[2] ?? "多雲"; };

// Hairline glyphs in the manner of util.js ICON: sun, sun behind cloud, cloud, rain, storm, fog, snow.
const svg = (d) => `<svg class="wx" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const CLOUD = (y) => `M7.5 ${y}h9.5a3.6 3.6 0 0 0 .5-7 5 5 0 0 0-9.7 1.2A3 3 0 0 0 7.5 ${y}z`;
const GLYPH = {
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6"/>'),
  sunCloud: svg('<path d="M9 4v1.3M4 9h1.3M5.5 5.5l.9.9M12.5 5.5l-.9.9M6.9 11.1A3 3 0 1 1 11.8 8"/><path d="M9.5 19.5h8a3.3 3.3 0 0 0 .4-6.4 4.5 4.5 0 0 0-8.7 1.1A2.7 2.7 0 0 0 9.5 19.5z"/>'),
  cloud: svg(`<path d="${CLOUD(18)}"/>`),
  rain: svg(`<path d="${CLOUD(15)}"/><path d="M8.5 17.5l-1 3M12.5 17.5l-1 3M16.5 17.5l-1 3"/>`),
  storm: svg(`<path d="${CLOUD(14.5)}"/><path d="M13.5 15l-2.5 3.5h3L11.5 22"/>`),
  fog: svg('<path d="M4 8.5h16M6 12.5h13M4 16.5h11"/>'),
  snow: svg('<path d="M12 4v16M5.1 8l13.8 8M5.1 16l13.8-8"/>'),
};
const GLYPH_OF = { 晴: "sun", 大致晴: "sunCloud", 多雲時晴: "sunCloud", 多雲: "cloud", 有霧: "fog", 毛毛雨: "rain", 有雨: "rain", 陣雨: "rain", 下雪: "snow", 雷雨: "storm" };

// The day's figures, for the two lines below and for the 出門前 card (outdoor-card.js): the glyph, the range, the
// condition — the daily code's word, or 「早轉午」 when the 08:00 and 14:00 hourly codes give different words — the
// chance of rain (NaN when not a number), the sunrise ("" when none) and the 08, 14 and 20 o'clock readings ([] unless
// all three are numbers). `date` ("YYYY-MM-DD") picks the day out of the answer's three — the first, today, when none
// is given — and its readings are that day's own hours. null when the answer has no such day (a copy kept while it was
// a single day: a box for tomorrow is never filled with today's figures), with no range at all, or on anything malformed.
export function weatherFacts(d, date) {
  try {
    const day = d.daily, h = d.hourly;
    const k = date == null ? 0 : day.time.indexOf(date);
    if (k < 0) return null;
    const ymd = Array.isArray(day.time) ? day.time[k] : "";
    const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : NaN);
    // the shown day's own 08:00, not the first T08:00 of the three days (that is always today's)
    const at = (hh) => { const i = h.time.findIndex((t) => typeof t === "string" && (ymd ? t === `${ymd}T${hh}:00` : t.endsWith(`T${hh}:00`))); return i < 0 ? 24 * k + Number(hh) : i; };
    const [am, pm, eve] = ["08", "14", "20"].map(at);
    const lo = num(day.temperature_2m_min?.[k]), hi = num(day.temperature_2m_max?.[k]);
    if (Number.isNaN(lo) || Number.isNaN(hi)) return null;
    const codes = Array.isArray(h.weather_code) ? h.weather_code : [];
    const word = wmoWord(day.weather_code?.[k]), w1 = codes[am] == null ? word : wmoWord(codes[am]), w2 = codes[pm] == null ? word : wmoWord(codes[pm]);
    const cond = w1 !== w2 ? `${w1}轉${w2}` : word;
    const rain = num(day.precipitation_probability_max?.[k]);
    const rise = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(day.sunrise?.[k] || "") ? day.sunrise[k].slice(11, 16) : "";
    const temps = Array.isArray(h.temperature_2m) ? [am, pm, eve].map((i) => num(h.temperature_2m[i])) : [];
    return { glyph: GLYPH[GLYPH_OF[word]] || GLYPH.cloud, lo, hi, cond, rain, rise, temps: temps.length === 3 && !temps.some(Number.isNaN) ? temps : [] };
  } catch { return null; }
}

const n = (x) => `<b>${esc(x)}</b>`;
// Each reading is one unbreakable segment ending in its separator, so a narrow screen wraps the line between
// readings — never inside one, and never with the glyph alone on a line (U+30FB may not start a line anyway).
const seg = (s, i, arr) => `<span class="w">${s}${i < arr.length - 1 ? "・" : ""}</span>`;

// The two lines: the glyph, 台中 and the day's range, the condition, the chance of rain and the sunrise; under them the
// 08, 14 and 20 o'clock readings — of `date`, today when none is given (weatherFacts). A reading that is not a number is
// left out; with no range at all there is no line. "" on anything malformed.
export function weatherHtml(d, date) {
  const f = weatherFacts(d, date);
  if (!f) return "";
  const deg = (t) => `${Math.round(t)}°`;
  const segs = [`台中 ${n(`${Math.round(f.lo)}–${Math.round(f.hi)}°`)}`, esc(f.cond)];
  if (!Number.isNaN(f.rain)) segs.push(`降雨 ${n(`${Math.round(f.rain)}%`)}`);
  if (f.rise) segs.push(`日出 ${n(f.rise)}`);
  const row2 = f.temps.length ? `<div class="row two"><span class="w">早 ${n(deg(f.temps[0]))}・午 ${n(deg(f.temps[1]))}・晚 ${n(deg(f.temps[2]))}</span></div>` : "";
  return `<div class="row"><span class="w">${f.glyph}</span>${segs.map(seg).join("")}</div>${row2}`;
}

// The weekend's two lines (週末氣象, a Friday evening): one a day, Saturday's and Sunday's, both in the first line's
// type — the day's name, the glyph, the range, the condition and the chance of rain; no 台中, no sunrise and no hourly
// readings, so each day keeps to its one line. Both days or nothing: "" when either is missing from the answer.
const WEEKDAY = "日一二三四五六";
export function weekendHtml(d, days) {
  const rows = days.map((date) => {
    const f = weatherFacts(d, date);
    if (!f) return "";
    const segs = [n(`${Math.round(f.lo)}–${Math.round(f.hi)}°`), esc(f.cond)];
    if (!Number.isNaN(f.rain)) segs.push(`降雨 ${n(`${Math.round(f.rain)}%`)}`);
    const name = `週${WEEKDAY[new Date(`${date}T00:00:00Z`).getUTCDay()]}`;
    return `<div class="row wk"><span class="w dn">${name}</span><span class="w">${f.glyph}</span>${segs.map(seg).join("")}</div>`;
  });
  return rows.length && rows.every(Boolean) ? rows.join("") : "";
}

// What the front page's box shows, by the clock when the page is drawn (app.js weatherBox; the box keeps it until it is
// drawn again, so nothing changes under the reader's eye): today until 20:00; from then tomorrow — on Saturday evening
// Sunday, on Sunday evening Monday — and on a Friday evening the weekend. { kind: "today" | "tomorrow" | "weekend", days }.
export function shownDays(now = twNow()) {
  if (now.minutes < 20 * 60) return { kind: "today", days: [now.date] };
  const t0 = Date.parse(`${now.date}T00:00:00Z`), after = (k) => new Date(t0 + k * 864e5).toISOString().slice(0, 10);
  return new Date(t0).getUTCDay() === 5 ? { kind: "weekend", days: [after(1), after(2)] } : { kind: "tomorrow", days: [after(1)] };
}
// The box's lines for what `shownDays` gave, out of forecast `d`; "" when `d` does not have the day(s).
export const shownHtml = (d, shown) => (shown.kind === "weekend" ? weekendHtml(d, shown.days) : weatherHtml(d, shown.days[0]));
