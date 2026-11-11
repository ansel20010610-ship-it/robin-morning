// 今日氣象 (Wetter): Taichung's day on the front page, in the row 接著上次 once held (app.js weatherBox, fillWeather), out of Open-Meteo —
// free, no key, and nothing of the reader's goes out but the city's coordinates. One answer serves the morning: it is
// kept in localStorage (rm.wx) and reused while it is today's and under three hours old; when the network fails, today's
// kept copy still serves, and with none the masthead simply has no line.
import { esc, store, twNow, within } from "./util.js";

// Today's kept copy whatever its age, or null: the front page draws the box out of it at once and lets the fresh answer
// fill it in place — hidden until the network answered, it came in above the first article and pushed the page down
// under the reader (the iPhone has no scroll anchoring; audit 2026-11-11).
export const keptWeather = () => { const k = store.get("wx"); return k?.date === twNow().date && k.data ? k.data : null; };

const API ="https://api.open-meteo.com/v1/forecast?latitude=24.1477&longitude=120.6736&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&hourly=temperature_2m,precipitation_probability,weather_code&timezone=Asia%2FTaipei&forecast_days=1";
const MAX_AGE = 3 * 3600 * 1000;

// The day's forecast as Open-Meteo sends it (daily.* one value each, hourly.* twenty-four), or null. Never throws.
export async function fetchWeather() {
  const now = twNow(), kept = store.get("wx");
  const todays = kept?.date === now.date && kept.data ? kept : null;
  if (todays && now.ms - Number(todays.at) < MAX_AGE) return todays.data;
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

// The two lines: the glyph, 台中 and the day's range, the condition — the daily code's word, or 「早轉午」 when the 08:00
// and 14:00 hourly codes give different words — the chance of rain and the sunrise; under them the 08, 14 and 20 o'clock
// readings. A reading that is not a number is left out; with no range at all there is no line. "" on anything malformed.
export function weatherHtml(d) {
  try {
    const day = d.daily, h = d.hourly;
    const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : NaN);
    const at = (hh) => { const i = h.time.findIndex((t) => typeof t === "string" && t.endsWith(`T${hh}:00`)); return i < 0 ? Number(hh) : i; };
    const [am, pm, eve] = ["08", "14", "20"].map(at);
    const lo = num(day.temperature_2m_min?.[0]), hi = num(day.temperature_2m_max?.[0]);
    if (Number.isNaN(lo) || Number.isNaN(hi)) return "";
    const codes = Array.isArray(h.weather_code) ? h.weather_code : [];
    const word = wmoWord(day.weather_code?.[0]), w1 = codes[am] == null ? word : wmoWord(codes[am]), w2 = codes[pm] == null ? word : wmoWord(codes[pm]);
    const cond = w1 !== w2 ? `${w1}轉${w2}` : word;
    const rain = num(day.precipitation_probability_max?.[0]);
    const rise = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(day.sunrise?.[0] || "") ? day.sunrise[0].slice(11, 16) : "";
    const n = (x) => `<b>${esc(x)}</b>`, deg = (t) => `${Math.round(t)}°`;
    const temps = Array.isArray(h.temperature_2m) ? [am, pm, eve].map((i) => num(h.temperature_2m[i])) : [];
    // Each reading is one unbreakable segment ending in its separator, so a narrow screen wraps the line between
    // readings — never inside one, and never with the glyph alone on a line (U+30FB may not start a line anyway).
    const segs = [`台中 ${n(`${Math.round(lo)}–${Math.round(hi)}°`)}`, esc(cond)];
    if (!Number.isNaN(rain)) segs.push(`降雨 ${n(`${Math.round(rain)}%`)}`);
    if (rise) segs.push(`日出 ${n(rise)}`);
    const seg = (s, i, arr) => `<span class="w">${s}${i < arr.length - 1 ? "・" : ""}</span>`;
    const row2 = temps.length === 3 && !temps.some(Number.isNaN) ? `<div class="row two"><span class="w">早 ${n(deg(temps[0]))}・午 ${n(deg(temps[1]))}・晚 ${n(deg(temps[2]))}</span></div>` : "";
    return `<div class="row"><span class="w">${GLYPH[GLYPH_OF[word]] || GLYPH.cloud}</span>${segs.map(seg).join("")}</div>${row2}`;
  } catch { return ""; }
}
