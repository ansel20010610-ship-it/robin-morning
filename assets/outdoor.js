// 出門前 (Vor dem Ausgehen): Taichung's air, weather warnings and closures, out of content/outdoor.json — written at every
// deploy, so every half hour, by scripts/outdoor.py from the agencies' own public files (no key, no AI). Drawn by
// outdoor-card.js (the card on today's front page); the file carries all six Taichung stations and outdoorLines takes
// the station's name, so the one the card reads is a constant there (AIR_STATION).
import { getJSON } from "./util.js";

// The file as it is, or null: no file (a preview, offline on a first run), a failed fetch, or something that is not one.
export async function fetchOutdoor() {
  try {
    const d = await getJSON("content/outdoor.json", { fresh: true });
    return d && typeof d === "object" && !Array.isArray(d) ? d : null;
  } catch { return null; }
}

// A section is believed while its data is under three hours old, whether read on the last run (ok) or kept from an
// earlier one when its source could not be read (stale); older than that, or never read, it is 抓不到.
const MAX_AGE = 3 * 3600 * 1000;
const ms = (iso) => (typeof iso === "string" ? Date.parse(iso) : NaN);
const fresh = (iso, now) => now - ms(iso) <= MAX_AGE; // false for a missing or unreadable time
const usable = (s, now) => !!s && typeof s === "object" && (s.ok === true || s.stale === true) && fresh(s.fetched, now);
const twDate = (now) => new Date(now + 8 * 3600 * 1000).toISOString().slice(0, 10);
const hhmm = (iso) => (/T\d{2}:\d{2}/.test(iso || "") ? iso.slice(11, 16) : "");

// A district as a line says it: 大甲區 → 大甲, but 中區 stays 中區 (中 alone would be no place).
const place = (a) => (a.length > 2 && a.endsWith("區") ? a.slice(0, -1) : a);
// Where a warning holds, in a few words: 全市; 大甲、清水、沙鹿 for up to three districts; 大甲、清水等 7 區 beyond; ""
// when the source names none (whole null: a land typhoon warning given for the whole island, or files out of step).
function wherePhrase(areas, whole) {
  if (whole === true) return "全市";
  const a = Array.isArray(areas) ? areas.filter((x) => typeof x === "string" && x) : [];
  if (!a.length) return "";
  return a.length <= 3 ? a.map(place).join("、") : `${a.slice(0, 2).map(place).join("、")}等 ${a.length} 區`;
}

// What the card needs, each part with its state — "data" (something to say), "none" (nothing: no warning, no closure
// notice, or a station with no number this hour) or "fail" (抓不到: not read, too old, or not today's page) — and
// stale: true when the data is a kept copy rather than this run's:
//   air      { state, stale, site, level, aqi, time }   — level in the 環境部 words, aqi a number, time "21:00"
//   alerts   { state, stale, items: [{ name, level, whole, areas, line }] }   — line: 陸上強風特報・大甲、清水等 7 區;
//            whole true (全市), false (the districts in areas) or null (reach not known: no districts given)
//   closure  { state, stale, when, stop, stopWork, stopSchool, line, lines }   — line: 臺中市今天停止上班、停止上課。;
//            when 今天 or 明天 as the lines begin ("" when they differ or say neither); stopWork, stopSchool and stop
//            (either) count only lines about 今天, so tonight's 明天停止上班 is not stop
// `siteName` is the station's name as the file has it (臺灣大道, 忠明…) or its number; `now` is for tests.
export function outdoorLines(data, siteName, now = Date.now()) {
  const d = data && typeof data === "object" ? data : {};
  return { air: airPart(d.air, siteName, now), alerts: alertsPart(d.alerts, now), closure: closurePart(d.closure, now) };
}

function airPart(s, site, now) {
  const fail = { state: "fail", stale: false, site: String(site ?? ""), level: "", aqi: null, time: "" };
  if (!usable(s, now) || !Array.isArray(s.stations)) return fail;
  const st = s.stations.find((x) => x && site != null && (x.name === site || String(x.id) === String(site)));
  if (!st || !fresh(st.time, now)) return fail;
  const stale = !!(s.stale || st.stale), aqi = typeof st.aqi === "number" && Number.isFinite(st.aqi) ? st.aqi : null;
  const base = { stale, site: st.name, time: hhmm(st.time) };
  return aqi === null ? { state: "none", ...base, level: "", aqi: null } : { state: "data", ...base, level: String(st.level || ""), aqi };
}

function alertsPart(s, now) {
  if (!usable(s, now) || !Array.isArray(s.items)) return { state: "fail", stale: false, items: [] };
  // entries and not one of them with a name: a file gone wrong, which must not read as a day without warnings
  if (s.items.length && !s.items.some((x) => x && typeof x.name === "string" && x.name)) return { state: "fail", stale: false, items: [] };
  // a kept copy can hold a warning that has run out since: gone by its own end time
  const items = s.items.filter((x) => x && typeof x.name === "string" && x.name && !(ms(x.validto) < now)).map((x) => {
    const where = wherePhrase(x.areas, x.whole);
    const whole = x.whole === true || x.whole === false ? x.whole : null;
    return { name: x.name, level: x.level || "", whole, areas: Array.isArray(x.areas) ? x.areas : [], line: where ? `${x.name}・${where}` : x.name };
  });
  return { state: items.length ? "data" : "none", stale: !!s.stale, items };
}

// A line of the page: the day it speaks of, read at its start after any 臺中市和平區: in front, and what it stops.
// A part of the day counts (今天下午停止上班…); 今天照常上班、停止上課 stops school only. outdoor-card.js reads tomorrow's
// lines with it too (the heading row's 明天停班停課).
export function closureLine(x) {
  const m = x.match(/^([^:：]*)[:：](.*)$/);
  const say = (m && !/今天|明天/.test(m[1]) ? m[2] : x).replace(/^[臺台]中市/, "").trim();
  return { when: /^今天/.test(say) ? "今天" : /^明天/.test(say) ? "明天" : "",
    work: x.includes("停止上班"), school: /停止(?:上班[、及與]?)?上課/.test(x) };
}

function closurePart(s, now) {
  const quiet = { stop: false, stopWork: false, stopSchool: false, when: "", line: "", lines: [] };
  const fail = { state: "fail", stale: false, ...quiet };
  // the page speaks of its own day (今天, 明天): yesterday's page is no answer for today
  if (!usable(s, now) || s.date !== twDate(now) || !("taichung" in s)) return fail;
  const stale = !!s.stale;
  if (s.taichung == null) return { state: "none", stale, ...quiet };
  if (typeof s.taichung !== "string") return fail;
  const raw = s.taichung.split("\n").map((x) => x.trim()).filter(Boolean);
  if (!raw.length) return { state: "none", stale, ...quiet };
  // the page's words as they are, with the city in front where the row's own words leave it out
  const lines = raw.map((x) => (/^[臺台]中市/.test(x) ? x : `臺中市${x}`));
  const parts = raw.map(closureLine), today = parts.filter((p) => p.when === "今天");
  const days = [...new Set(parts.map((p) => p.when))];
  const stopWork = today.some((p) => p.work), stopSchool = today.some((p) => p.school);
  return { state: "data", stale, when: days.length === 1 ? days[0] : "", stop: stopWork || stopSchool, stopWork, stopSchool, line: lines.join(""), lines };
}
