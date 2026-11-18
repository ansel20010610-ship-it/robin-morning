// 紀念章 (the owner's pick, 2026-11-19: sample A, the velvet box): a month in which every issue was read through (its
// stamp earned) is a gold medal — the robin in relief inside a ring of leaves, the month's German name round the top, the
// month and the year below, a beaded rim. #/medals is one walnut box a year, lined with wine velvet, twelve hollows; an
// earned month holds its medal, the others stay empty with the month's name pressed into the velvet. A month counts once
// it is over (or on its last day, read through). Velvet and walnut are photographs (assets/shelf/, Poly Haven, CC0).
import { esc } from "./util.js";

const DE = ["JANUAR", "FEBRUAR", "MÄRZ", "APRIL", "MAI", "JUNI", "JULI", "AUGUST", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DEZEMBER"];
const ZH = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
const ROMAN = (n) => [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]].reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, "");
const yearZh = (y) => String(y).split("").map((c) => "〇一二三四五六七八九"[c]).join(" ");

// The months earned: `issues` the published issues ({date}), `done` the dates read through, `today` YYYY-MM-DD.
export function medalMonths(issues, done, today) {
  const by = new Map();
  for (const i of issues) { const m = i.date.slice(0, 7); if (!by.has(m)) by.set(m, []); by.get(m).push(i.date); }
  const out = [];
  for (const [m, dates] of by) {
    const [y, mo] = m.split("-").map(Number), last = `${m}-${String(new Date(Date.UTC(y, mo, 0)).getUTCDate()).padStart(2, "0")}`;
    if (today < last || (today === last && !done.has(last))) continue; // the month is not over yet
    if (dates.every((d) => done.has(d))) out.push({ month: m, days: dates.length });
  }
  return out;
}

const DEFS = `<svg class="md-defs" width="0" height="0" aria-hidden="true"><defs>
  <radialGradient id="md-gold" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#fff4c8"/><stop offset=".25" stop-color="#f0cf78"/><stop offset=".55" stop-color="#c9973a"/><stop offset=".8" stop-color="#8a6220"/><stop offset="1" stop-color="#5e4012"/></radialGradient>
  <linearGradient id="md-rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>
  <filter id="md-relief" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="b"/><feSpecularLighting in="b" surfaceScale="3.5" specularConstant="1.1" specularExponent="20" lighting-color="#fff8e0" result="s"><feDistantLight azimuth="225" elevation="40"/></feSpecularLighting><feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/><feDiffuseLighting in="b" surfaceScale="3" lighting-color="#fff" result="d"><feDistantLight azimuth="225" elevation="50"/></feDiffuseLighting><feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="lit"/><feComposite in="lit" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".9" k4="0" result="o"/><feComposite in="o" in2="SourceAlpha" operator="in"/></filter>
  <symbol id="md-robin" viewBox="6 16 54 38"><path d="M44.5 37.5 L55 30.5 L56.5 34 L46.5 41.5 Z"/><ellipse cx="33" cy="37" rx="15" ry="11.5" transform="rotate(-18 33 37)"/><circle cx="23" cy="25.5" r="8"/><path d="M15.4 24.2 L9.5 25.8 L15.6 27.4 Z"/><path d="M30.5 47 L29.5 52.5 M36 46 L36 52.5 M15 53 L50 53" stroke="currentColor" stroke-width="1.6" fill="none"/></symbol>
  <path id="md-arc" d="M -38 0 A 38 38 0 0 1 38 0"/>
</defs></svg>`;

function medalSvg(mo, year, px) {
  const leaf = Array.from({ length: 16 }, (_, i) => { const d = -150 + i * 20, a = (d * Math.PI) / 180, x = (Math.cos(a) * 31).toFixed(1), y = (Math.sin(a) * 31).toFixed(1); return `<ellipse cx="${x}" cy="${y}" rx="2.2" ry="4.6" transform="rotate(${d + 90} ${x} ${y})"/>`; }).join("");
  const beads = Array.from({ length: 60 }, (_, i) => { const a = (i * 6 * Math.PI) / 180; return `<circle cx="${(Math.cos(a) * 45.5).toFixed(1)}" cy="${(Math.sin(a) * 45.5).toFixed(1)}" r=".9"/>`; }).join("");
  return `<svg class="md-face" viewBox="-50 -50 100 100" width="${px}" height="${px}" aria-hidden="true">
    <circle r="49" fill="url(#md-gold)"/><circle r="49" fill="url(#md-rim)" opacity=".35"/>
    <g fill="url(#md-gold)" filter="url(#md-relief)"><circle r="49"/>${beads}</g>
    <circle r="42" fill="url(#md-gold)" filter="url(#md-relief)"/><circle r="41" fill="none" stroke="rgba(0,0,0,.35)" stroke-width=".6"/>
    <g fill="url(#md-gold)" filter="url(#md-relief)">${leaf}<use href="#md-robin" x="-17" y="-16" width="34" height="24" color="#000"/></g>
    <text font-family="Cormorant Garamond,serif" font-weight="700" font-size="8.4" letter-spacing="2.2" fill="rgba(60,40,10,.55)"><textPath href="#md-arc" startOffset="50%" text-anchor="middle">${DE[mo]}</textPath></text>
    <text y="22" text-anchor="middle" font-family="Noto Serif TC,serif" font-weight="700" font-size="9" letter-spacing="1.5" fill="rgba(60,40,10,.6)">${ZH[mo]}月</text>
    <text y="31" text-anchor="middle" font-family="Cormorant Garamond,serif" font-weight="600" font-size="6" letter-spacing="1.6" fill="rgba(60,40,10,.5)">${ROMAN(year)}</text>
  </svg>`;
}

// #/medals: a box a year, the newest year on top. `first` the first issue's date, so the months before it stay blank.
export function medalsHtml(earned, first, today) {
  const got = new Map(earned.map((e) => [e.month, e]));
  const y0 = Number(first.slice(0, 4)), y1 = Number(today.slice(0, 4)), years = [];
  for (let y = y1; y >= y0; y--) years.push(y);
  const box = (y) => `<section class="md-box" aria-label="${y} 年的紀念章，${earned.filter((e) => e.month.startsWith(String(y))).length} 枚"><div class="md-velvet">
      ${ZH.map((z, mo) => { const m = `${y}-${String(mo + 1).padStart(2, "0")}`, e = got.get(m), before = m < first.slice(0, 7);
        return `<div class="md-cell${e ? " got" : ""}${before ? " before" : ""}"><span class="md-hollow">${e ? medalSvg(mo, y, 92) : `<i>${before ? "" : DE[mo].slice(0, 3)}</i>`}</span><b>${z}月</b></div>`; }).join("")}
    </div></section>
    <p class="md-year"><b>${esc(yearZh(y))}</b></p>`;
  return `${DEFS}${years.map(box).join("")}<p class="md-note">一個月每天都讀完，就收進一枚</p>`;
}
