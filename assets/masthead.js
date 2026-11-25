// 報頭的日子與天色: what the masthead (app.js masthead) wears for a given paper and hour, beyond its number and date.
// Everything is decided as the masthead is drawn, out of the paper's date, the clock and what the phone already keeps
// (today's forecast): nothing turns up later, and nothing here changes the masthead's height — an iPhone keeps no scroll
// anchor, so anything that grew after the draw would push the page under the reader's thumb.
//   紅字的日子  a Sunday, a great day of the church year (feasts.js churchDay) or a national holiday: the dateline in red
//   報頭時辰    today's paper on the front page: Morgen before noon, Abend from six (DIENSTAGMORGEN); the day alone between
//   週末版      a Saturday, a Sunday or a national holiday: the double rule at the top becomes a gold band, Wochenendausgabe
//   鳥換季      the crest's robin holds holly in Advent and Christmastide, a nesting twig in spring, a red berry in autumn
//   窗光        a sunny morning throws a faint window on the masthead, as long and as slanted as Taichung's sun makes it
//   紙放一天    the paper warms from 07:30 to 22:00 and its two top corners crease; the next morning's paper is new
//   金光守節    the title's gold sweep is dark and slow in Holy Week, and brighter on Easter morning
//   真的月亮    the evening moon beside the crest is tonight's phase
import { twNow } from "./util.js";
import { churchDay, holyWeek, easter } from "./feasts.js";
import { keptWeather } from "./wetter.js";

// ——— 紅字的日子, 週末版 ———
// 國定假日: the days off in 行政院人事行政總處's 政府行政機關辦公日曆表 (the 115 and 116 calendars, as published on
// data.gov.tw) that are not a plain Saturday or Sunday — the holidays, those falling on a weekend, and the days given off
// in their place (補假) — from the first issue (2026-10-11) on. The calendar for 117 (2028) comes out around mid-2027:
// its days go here then. The 2027 calendar has no Saturday made a working day; one that does stays a weekend here.
const HOLIDAYS = new Set([
  "2026-10-25", "2026-10-26", "2026-12-25",
  "2027-01-01", "2027-02-04", "2027-02-05", "2027-02-06", "2027-02-07", "2027-02-08", "2027-02-09", "2027-02-10",
  "2027-02-28", "2027-03-01", "2027-04-04", "2027-04-05", "2027-04-06", "2027-04-30", "2027-05-01", "2027-06-09",
  "2027-09-15", "2027-09-28", "2027-10-10", "2027-10-11", "2027-10-25", "2027-12-24", "2027-12-25", "2027-12-31",
]);
const weekday = (date) => new Date(`${date}T00:00:00Z`).getUTCDay();
export const redDay = (date) => weekday(date) === 0 || churchDay(date) || HOLIDAYS.has(date);
export const weekendDay = (date) => weekday(date) === 0 || weekday(date) === 6 || HOLIDAYS.has(date);

// ——— 報頭時辰: what follows the day's name in the topline (minutes since midnight, Taiwan time) ———
export const dayPart = (minutes) => (minutes < 12 * 60 ? "morgen" : minutes >= 18 * 60 ? "abend" : "");

// ——— 鳥換季: the robin's thing for the paper of `date`, hung under the beak inside the crest's frame ———
export function carryOf(date) {
  const md = Number(date.slice(5, 7)) * 100 + Number(date.slice(8, 10));
  return md >= 1201 || md <= 106 ? "holly" : md >= 301 && md <= 531 ? "twig" : md >= 901 && md <= 1130 ? "berry" : "";
}
// In the emblem's 64-unit box. Holly: a thin stem from the beak's tip down to two red berries, two gold leaves hanging
// below them in a V (no green anywhere). The twig: a short nesting twig with gold buds. Autumn: one berry on its stalk.
const CARRY = {
  berry: `<g class="e-carry berry"><path class="c-stalk" d="M12.2 26.9 C11.9 28.3 11.4 29.3 10.9 30.1" stroke-width=".8" stroke-linecap="round"/>
    <circle class="c-berry" cx="10.6" cy="32.2" r="2.6"/><circle class="c-shine" cx="9.7" cy="31.3" r=".7"/><circle class="c-eye" cx="10.75" cy="34.55" r=".45"/></g>`,
  holly: `<g class="e-carry holly"><path class="c-stalk" d="M10.1 26.0 C10.5 27.9 10.4 30.0 10.1 32.1" stroke-width=".8" stroke-linecap="round"/>
    <path class="c-leaf" d="M9.4 33.4 L8.6 34.1 L7.5 35.4 L8.0 36.7 L7.2 37.9 L7.8 39.1 L7.3 40.3 L8.6 41.4 L10.1 40.6 L9.8 39.3 L10.6 38.2 L10.1 36.9 L10.9 35.7 L10.1 34.3 Z"/>
    <path class="c-leaf" d="M10.7 33.4 L10.3 34.4 L9.8 36.0 L10.9 36.9 L10.7 38.3 L11.7 39.2 L11.7 40.5 L13.4 40.9 L14.4 39.5 L13.6 38.5 L13.9 37.2 L12.8 36.2 L13.0 34.8 L11.7 33.9 Z"/>
    <path class="c-vein" d="M9.3 34.4 L8.7 40.2 M11.0 34.3 L13.0 39.8" stroke-width=".35" stroke-linecap="round"/>
    <circle class="c-berry" cx="8.9" cy="33.4" r="1.9"/><circle class="c-berry" cx="11.5" cy="33.7" r="1.9"/>
    <circle class="c-shine" cx="8.3" cy="32.8" r=".5"/><circle class="c-shine" cx="10.9" cy="33.1" r=".5"/></g>`,
  twig: `<g class="e-carry twig"><path class="c-twig" d="M14.0 26.4 C12.6 28.9 10.9 31.6 8.9 34.4" stroke-width="1.6" stroke-linecap="round"/>
    <path class="c-twig" d="M11.0 31.3 C11.9 32.4 12.5 33.6 12.8 34.9 M10.0 32.9 C9.4 32.3 9.0 31.5 8.9 30.7" stroke-width="1.6" stroke-linecap="round"/>
    <circle class="c-bud" cx="8.7" cy="34.8" r="1.2"/><circle class="c-bud" cx="12.85" cy="35.3" r="1.2"/><circle class="c-bud" cx="8.85" cy="30.2" r="1.2"/></g>`,
};
// The emblem's markup with the thing set just before the beak, so the beak is drawn over it and holds it. Only the
// masthead's crest: util.js ROBIN_PATHS stays bare for the seal, the stamps, the bird note and the wax.
const BEAK = '<path class="e-gold" d="M15.4 24.2';
export const carried = (emblem, kind) => (CARRY[kind] && emblem.includes(BEAK) ? emblem.replace(BEAK, CARRY[kind] + BEAK) : emblem);

// ——— 金光守節: "holy" for a paper of Palm Sunday to Holy Saturday (feasts.js holyWeek); "ostern" for Easter's own paper
// until noon. By the paper's date as well as the clock: before 07:30 on Easter morning the front page still carries
// Saturday's paper, and so the dark gold, until Easter's paper comes. ———
export function goldOf(date, now = twNow()) {
  if (holyWeek(date)) return "holy";
  return date === easter(Number(date.slice(0, 4))) && now.date === date && now.minutes < 12 * 60 ? "ostern" : "";
}

// ——— astronomy for Taichung ———
const RAD = Math.PI / 180, LAT = 24.1477, LON = 120.6736;
const jd = (ms) => ms / 864e5 + 2440587.5;
// The sun's elevation and azimuth (degrees, azimuth from north clockwise), low precision (±0.1°).
function sunPos(ms) {
  const d = jd(ms) - 2451545.0;
  const g = ((357.529 + 0.98560028 * d) % 360) * RAD, q = (280.459 + 0.98564736 * d) % 360;
  const L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * RAD, e = (23.439 - 0.00000036 * d) * RAD;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)), dec = Math.asin(Math.sin(e) * Math.sin(L));
  const gmst = (18.697374558 + 24.06570982441908 * d) % 24, H = (gmst + LON / 15) * 15 * RAD - ra, la = LAT * RAD;
  const el = Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(H));
  const az = Math.atan2(-Math.sin(H), Math.tan(dec) * Math.cos(la) - Math.sin(la) * Math.cos(H));
  return { el: el / RAD, az: ((az / RAD) % 360 + 360) % 360 };
}
// The moon's lit fraction k and whether it is waxing (Meeus ch. 48, the phase angle to a few tenths of a degree).
export function moonPhase(ms) {
  const T = (jd(ms) - 2451545.0) / 36525;
  const D = (297.8501921 + 445267.1114034 * T) % 360, M = (357.5291092 + 35999.0502909 * T) % 360, Mp = (134.9633964 + 477198.8675055 * T) % 360;
  const s = (x) => Math.sin(x * RAD);
  const i = 180 - D - 6.289 * s(Mp) + 2.100 * s(M) - 1.274 * s(2 * D - Mp) - 0.658 * s(2 * D) - 0.214 * s(2 * Mp) - 0.110 * s(D);
  return { k: (1 + Math.cos(i * RAD)) / 2, wax: ((D % 360) + 360) % 360 < 180 };
}

// ——— 真的月亮: tonight's phase in the place of the old crescent (style.css .night-moon.phase) ———
// The lit part between the bright limb and the terminator's half-ellipse, right while waxing, left while waning, upright.
// One solid colour for every phase, so a thin crescent is the same stuff as the full moon; soft maria (the near side as
// seen from Taiwan, north up) keep the full moon from reading as a coin. The glow is the lit part's own, blurred and
// drawn first; the dark side is then laid over it as an opaque disc, so the glow shows only outside the bright limb and
// the terminator stays a hard edge. (A mask on the blurred glow came out square in WebKit; a CSS drop-shadow on the
// whole svg bled into the dark side.) The ids are the phase's, so two moons of one phase share identical defs.
export function moonSvg({ k, wax }) {
  const cx = 38, cy = 36, r = 24, top = `${cx} ${cy - r}`, bot = `${cx} ${cy + r}`, rx = (Math.abs(2 * k - 1) * r).toFixed(2);
  const lit = k >= 0.985 ? `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`
    : k <= 0.015 ? ""
    : wax ? `M${top}A${r} ${r} 0 0 1 ${bot}A${rx} ${r} 0 0 ${k < 0.5 ? 0 : 1} ${top}z`
    : `M${top}A${r} ${r} 0 0 0 ${bot}A${rx} ${r} 0 0 ${k < 0.5 ? 1 : 0} ${top}z`;
  const id = "mc" + Math.round(k * 1000) + (wax ? "w" : "n");
  const u = (x, y) => `${(cx + x * r).toFixed(1)} ${(cy + y * r).toFixed(1)}`;
  const blob = (pts) => { // a closed, rounded outline through unit-disc points (Catmull-Rom as cubic Béziers)
    const n = pts.length; let d = `M${u(...pts[0])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += `C${u(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)} ${u(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)} ${u(...p2)}`;
    }
    return `<path d="${d}z"/>`;
  };
  const ell = (x, y, a, b, rot = 0) => `<ellipse cx="${(cx + x * r).toFixed(1)}" cy="${(cy + y * r).toFixed(1)}" rx="${(a * r).toFixed(1)}" ry="${(b * r).toFixed(1)}" transform="rotate(${rot} ${(cx + x * r).toFixed(1)} ${(cy + y * r).toFixed(1)})"/>`;
  // Procellarum with Imbrium and Nubium in the west; Serenitatis, Tranquillitatis, Fecunditatis, Nectaris and Crisium in
  // the east; Frigoris a thin band in the north — the 月兔 shape
  const seas = `<g class="sea" clip-path="url(#${id})"><g filter="url(#${id}b)">
    ${blob([[-0.46, -0.3], [-0.6, -0.44], [-0.76, -0.34], [-0.86, -0.08], [-0.83, 0.18], [-0.72, 0.36], [-0.54, 0.43], [-0.4, 0.32], [-0.33, 0.12], [-0.36, -0.1]])}
    ${ell(-0.29, -0.42, 0.25, 0.22)}${ell(0, -0.17, 0.09, 0.07)}${ell(0.17, -0.38, 0.16, 0.15)}${ell(0.33, -0.06, 0.2, 0.15, 18)}
    ${ell(0.58, 0.17, 0.11, 0.19, -12)}${ell(0.37, 0.3, 0.08, 0.08)}${ell(0.71, -0.27, 0.09, 0.13)}
    ${ell(-0.12, -0.7, 0.4, 0.05, -2)}${ell(-0.17, 0.42, 0.15, 0.11)}${ell(-0.5, 0.47, 0.08, 0.08)}</g></g>`;
  // the bright limb at full strength; the rest of the rim faintly, so a thin crescent still shows its whole disc
  const limb = k >= 0.985 ? `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0` : k <= 0.015 ? "" : `M${top}A${r} ${r} 0 0 ${wax ? 1 : 0} ${bot}`;
  // σ 4.9 units = 2px at the 26px moon, the spread of the old drop-shadow(0 0 4px)
  const glow = lit ? `<path class="glow" d="${lit}" filter="url(#${id}g)"/>` : "";
  return `<svg class="moon night-moon phase" viewBox="0 0 64 64" aria-hidden="true">
    <defs><clipPath id="${id}"><path d="${lit || "M0 0"}"/></clipPath><filter id="${id}b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1"/></filter>
    <filter id="${id}g" filterUnits="userSpaceOnUse" x="-16" y="-16" width="96" height="96"><feGaussianBlur stdDeviation="4.9"/></filter></defs>
    ${glow}<circle class="dark" cx="${cx}" cy="${cy}" r="${r}"/>${lit ? `<path class="lit" d="${lit}"/>${seas}` : ""}
    <circle class="rim-all" cx="${cx}" cy="${cy}" r="${r}"/>${limb ? `<path class="limb" d="${limb}"/>` : ""}
    <circle class="st" cx="14" cy="14" r="1.4"/><circle class="st" cx="24" cy="6" r=".9"/><circle class="st" cx="8" cy="30" r=".9"/></svg>`;
}

// ——— 窗光 ———
// Weather codes (WMO) that count as a sunny hour: 晴, 大致晴, 多雲時晴. 多雲, fog and rain throw no window.
const SUNNY = 2;
function hourCode(d, minutes) {
  const h = d?.hourly, hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  if (!Array.isArray(h?.time) || !Array.isArray(h?.weather_code)) return null;
  const i = h.time.findIndex((t) => typeof t === "string" && t.endsWith(`T${hh}:00`));
  return i < 0 ? null : h.weather_code[i];
}
// The sun, when a window falls on the masthead now: before noon, the sun over 4°, and this hour sunny in today's
// forecast as the phone already keeps it (wetter.js keptWeather). Without a kept forecast there is no window — the
// forecast that comes in afterwards does not bring one (the masthead never changes after it is drawn). Else null.
// The light theme only: style.css hides it under the dark one.
export function windowSun(now = twNow()) {
  if (now.minutes >= 12 * 60) return null;
  const sun = sunPos(now.ms);
  if (sun.el <= 4) return null;
  const code = hourCode(keptWeather(), now.minutes);
  return typeof code === "number" && code <= SUNNY ? sun : null;
}
// The window's four panes thrown on the paper, the light always from the upper left (28° below the horizontal, so the
// patch never leaves the masthead) and as long as the sun's real height makes it: a low winter sun throws it long and
// steeply sheared, a high one short and upright, close to the wall. (The sun's bearing is left out on purpose: followed
// literally, an east window loses the patch off the edge by mid-morning.) One SVG, its blur inside it, so it is
// rasterised once as a background — no CSS filter on a layer.
function sunwinSvg(W, H, el) {
  const c = Math.min(3.6, Math.max(0.7, 1 / Math.tan(el * RAD))), ux = Math.cos(28 * RAD), uy = Math.sin(28 * RAD);
  const ya = 0.07 * H, yb = ya + 0.30 * H, z0 = 0.04 * W, z1 = 0.19 * W, mv = 4, mh = 3, ym = (ya + yb) / 2, zm = (z0 + z1) / 2;
  const P = (y, z) => `${(z * c * ux).toFixed(1)},${(y + z * c * uy).toFixed(1)}`;
  const pane = (y1, y2, za, zb) => `<polygon points="${P(y1, za)} ${P(y2, za)} ${P(y2, zb)} ${P(y1, zb)}"/>`;
  const panes = pane(ya, ym - mv / 2, z0, zm - mh / 2) + pane(ym + mv / 2, yb, z0, zm - mh / 2) + pane(ya, ym - mv / 2, zm + mh / 2, z1) + pane(ym + mv / 2, yb, zm + mh / 2, z1);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><filter id="b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.8"/></filter></defs><g filter="url(#b)" fill="#FFF7DE" fill-opacity=".82">${panes}</g></svg>`;
}
// The window's element (app.js masthead, `.sunwin` carrying the sun's elevation) gets its picture at the masthead's
// size, right after the masthead is put on the page and before it is painted.
export function lightWindow(head) {
  const w = head?.querySelector(".sunwin");
  if (!w) return;
  const r = head.getBoundingClientRect(), W = Math.round(r.width), H = Math.round(r.height);
  if (!W || !H) { w.remove(); return; }
  w.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(sunwinSvg(W, H, Number(w.dataset.el)))}")`;
}

// ——— 紙放一天 ———
// The paper's tones and its age through the day live in index.html's first script (window.paperDay), which tints the
// paper by the clock before the first frame, so opening the app in the evening does not show the morning's paper for a
// moment. The age: 0 when the day's paper comes out, rising to 1 at 22:00 along a smoothstep — hardly at all in the
// morning, the warmth gathering in the afternoon — and held at 1 until the next paper. `out`: today's paper is on the
// front page (app.js agePaper, from config.json's publish_time on); before then, and while a late paper has not come,
// the front page still carries yesterday's, and so does the table: the sheet stays as old as it got. `start`: the
// minute it comes out. The whole app's paper ages together — not the front page alone, or an article opened in the
// evening would jump back to white. Without index.html's script the paper stays fresh.
const PAPER = globalThis.paperDay;
export const paperAge = (m = twNow().minutes, out, start) => (PAPER ? PAPER.age(m, out, start) : 0);
// The light paper's colour at that age, for the status bar (app.js themeBar).
export const paperTone = (age = paperAge()) => (PAPER ? PAPER.tone(age) : "#F5F0E6");
// Sets the age and the aged tones on the root (style.css :root reads --paper-aged and the rest; the dark theme does not,
// and the creases fade in with --age). Only custom properties change: nothing is redrawn.
export const tintPaper = (age = paperAge()) => PAPER?.tint(age);
// The creases: one straight dog-ear fold across each top corner — a light line and a dark line, 0.5px each, side by side
// — between the top of the page (under the status bar) and the double rule, never reaching it: each leg 9 to 12px, a
// little different with each paper's date (the next paper is a new sheet). Their strength is the paper's age (--age);
// the light theme only.
export function creaseHtml(date) {
  let sd = [...date].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
  const rnd = () => { sd = (sd * 1103515245 + 12345) & 0x7fffffff; return sd / 0x7fffffff; };
  return [1, -1].map((mx) => {
    const a = 9 + rnd() * 3, b = 9 + rnd() * 3, len = Math.hypot(a, b), x0 = mx > 0 ? 0 : 13;
    const p = [x0 + mx * a, 0], q = [x0, b], nx = mx * b / len, ny = a / len; // the normal points into the page
    const seg = (o) => `M${(p[0] + nx * o).toFixed(2)} ${(p[1] + ny * o).toFixed(2)}L${(q[0] + nx * o).toFixed(2)} ${(q[1] + ny * o).toFixed(2)}`;
    return `<svg class="crease ${mx > 0 ? "l" : "r"}" viewBox="0 0 13 13" aria-hidden="true"><path class="hi" d="${seg(-0.25)}"/><path class="sh" d="${seg(0.25)}"/></svg>`;
  }).join("");
}
