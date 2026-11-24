// 出門前 (Vor dem Ausgehen): the day's weather, air, warnings and closures on one card, set as a Vienna tram ticket in
// the middle of the screen (丙車票, chosen 2026-11-24; style.css .vor-t). Today's paper only — the latest issue, dated
// today, from 07:30 — and neither an issue opened from 往期 nor ?preview: it comes up by itself once per issue on each
// device (rm.outdoor.shown, the last 60 dates, as rm.opened), when the masthead's entrance, or the first opening's press
// run, has played. Closed, a tap on the whole 今日氣象 box brings it back (丙保高): the box's heading row carries a gold
// › at its right, after a short red word on a day with a warning or a closure (強風特報 ›, 停班停課 ›), and the box keeps
// its height to the point. The card is a <dialog> in the top layer, so neither opening nor closing it moves the front
// page (the iPhone has no scroll anchoring). Whatever is malformed — the data, a field, this code — there is no card
// and the weather box stays as it always was.
import { esc, store, roman, ROBIN_PATHS } from "./util.js";
import { calm } from "./motion.js";
import { weatherFacts, keptWeather } from "./wetter.js";
import { fetchOutdoor, outdoorLines, closureLine } from "./outdoor.js";

// The air station the card reads, by its name in content/outdoor.json (chosen 2026-11-24): 臺灣大道, the traffic station
// nearest the paper's weather point (2.1 km), whose numbers run higher than the general stations'.
export const AIR_STATION = "臺灣大道";
const SHOWN = "outdoor.shown"; // the dates whose card has come up by itself on this device

let lastData = null; // the last content/outdoor.json read: a redraw (07:30, a step back) has its cue in place at once
let lastWx = null; // the day's forecast as the front page last got it, for a phone that keeps nothing (storage off)
let seq = 0; // the latest draw of the front page: an earlier draw's card, still waiting for the masthead, gives way
const popped = new Set(); // this session's own record, for when storage cannot be written

// What the card says, out of the day's forecast (wetter.js) and content/outdoor.json (outdoor.js outdoorLines), or null
// when it would say nothing at all. A part that could not be read (state "fail") is left out, never told as quiet:
// 今天沒有天氣特報，也沒有停班停課 only when both are known to be so. On a closure day every county has a line, open
// ones too: only a line that stops work or school (today's or tomorrow's) is a notice; a page whose Taichung lines stop
// nothing (今天照常上班、照常上課, 尚未列入警戒區) is as sure a no as a page without Taichung.
const stops = (l) => { const p = closureLine(l); return p.work || p.school; };
function cardModel(wx = keptWeather() || lastWx, data = lastData, now = Date.now()) {
  const facts = wx ? weatherFacts(wx) : null;
  const o = outdoorLines(data, AIR_STATION, now);
  const air = o.air.state === "data" ? o.air : null;
  const alerts = o.alerts.state === "data" ? o.alerts.items : [];
  const notices = o.closure.state === "data" ? o.closure.lines.filter(stops) : [];
  const noClosure = o.closure.state === "none" || (o.closure.state === "data" && !notices.length);
  const quiet = o.alerts.state === "none" && noClosure;
  if (!facts && !air && !alerts.length && !notices.length && !quiet) return null;
  return { facts, air, alerts, notices, quiet, cue: cueWord(o) };
}

// The heading row's red word: today's closure first, then the warning that weighs most, then tomorrow's closure (told
// the evening before); "" on a quiet day or with nothing known. Six characters at most, so the row never wraps.
const RANK = ["颱風", "超大豪雨", "大豪雨", "豪雨", "大雨", "強風"];
const stopWord = (work, school) => (work && school ? "停班停課" : school ? "停課" : "停班");
function cueWord(o) {
  const c = o.closure;
  if (c.state === "data" && c.stop) return stopWord(c.stopWork, c.stopSchool);
  if (o.alerts.state === "data" && o.alerts.items.length) {
    const rank = (name) => { const i = RANK.findIndex((k) => name.includes(k)); return i < 0 ? RANK.length : i; };
    const top = o.alerts.items.reduce((a, b) => (rank(b.name) < rank(a.name) ? b : a));
    const word = top.name.replace(/^(?:[陸海]上)+/, ""); // 海上陸上颱風警報 → 颱風警報
    return word.length <= 6 ? word : "天氣特報";
  }
  if (c.state === "data") {
    const next = c.lines.map(closureLine).filter((p) => p.when === "明天" && (p.work || p.school));
    if (next.length) return `明天${stopWord(next.some((p) => p.work), next.some((p) => p.school))}`;
  }
  return "";
}

// ——— The ticket ———
// The stub's crest: the masthead's robin (util.js ROBIN_PATHS) in its gold frame with the four corner squares.
const CREST = `<svg class="crest-s" viewBox="0 0 64 64" aria-hidden="true"><rect class="e-frame" x="3" y="3" width="58" height="58" stroke-width="1.6"/><rect class="e-frame" x="6" y="6" width="52" height="52" stroke-width=".7"/>
  <g class="e-gold"><rect x="1" y="1" width="4" height="4"/><rect x="59" y="1" width="4" height="4"/><rect x="1" y="59" width="4" height="4"/><rect x="59" y="59" width="4" height="4"/></g>${ROBIN_PATHS}</svg>`;
// A quiet day's gold postmark: the seal's ring (motion.js seal), GUTEN TAG along the upper arc, the robin in one ink and
// three small squares under it.
const sq = (x, y) => `<rect class="sq" x="-1.1" y="-1.1" width="2.2" height="2.2" transform="translate(${x} ${y}) rotate(45)"/>`;
const POSTMARK = `<span class="pm" aria-hidden="true"><svg viewBox="0 0 64 64"><circle class="rim" cx="32" cy="32" r="30"/><circle class="rim thin" cx="32" cy="32" r="20.6"/>
  <defs><path id="vtArc" d="M10.58 39.76 A22.8 22.8 0 1 1 53.42 39.76"/></defs><text class="arc"><textPath href="#vtArc" startOffset="50%">GUTEN TAG</textPath></text>
  ${sq(26.8, 56.4)}${sq(32, 57)}${sq(37.2, 56.4)}<g class="bird" transform="translate(15.2 14.8) scale(.52)">${ROBIN_PATHS}</g></svg></span>`;

const num = (x) => `<b class="n">${esc(x)}</b>`;
// readings joined by ・, each an unbreakable piece, so a narrow screen wraps between them and never inside one
const pieces = (xs) => xs.map((x, i) => `<span class="w">${x}${i < xs.length - 1 ? "・" : ""}</span>`).join("");

function weatherPart(f) {
  if (!f) return "";
  const l2 = [esc(f.cond), ...(Number.isNaN(f.rain) ? [] : [`降雨 ${num(`${Math.round(f.rain)}%`)}`])];
  const hrs = [...(f.rise ? [`日出 ${num(f.rise)}`] : []), ...(f.temps.length ? ["早", "午", "晚"].map((k, i) => `${k} ${num(`${Math.round(f.temps[i])}°`)}`) : [])];
  return `<section class="vt-wx"><span class="g">${f.glyph}</span><div class="t"><p class="l1"><span>台中</span><b>${Math.round(f.lo)}–${Math.round(f.hi)}°</b></p><p class="l2">${pieces(l2)}</p></div></section>`
    + (hrs.length ? `<hr class="dots"><p class="hrs">${pieces(hrs)}</p>` : "");
}

// The air: the level in the 環境部 words and a scale from 0 to 200 (a small tick every 10, a large one every 50, no
// figures), the pointer at the AQI — red from 101 (對敏感族群不健康) up; past 200 it stays at the end.
function airPart(a) {
  if (!a) return "";
  const aqi = Math.round(a.aqi), p = Math.min(100, Math.max(0, (aqi / 200) * 100));
  return `<section class="air${aqi > 100 ? " hi" : ""}"><p><span class="k">空氣</span><span class="v">${esc(a.level)}</span></p>`
    + `<div class="vt-scale${p > 70 ? " flip" : ""}" style="--p:${p.toFixed(1)}%" role="img" aria-label="AQI ${aqi}"><span class="vt-bar"></span><span class="vt-ticks"></span><i class="vt-ptr"><em>AQI <b>${aqi}</b></em></i></div></section>`;
}

// A closure notice in the page's own words, 停止上班、停止上課 set as 停止上班上課 (as the chop on the chosen sample),
// without its full stop, the district's half-width colon full-width (臺中市和平區：); too long for one line, it breaks
// only between its parts — after the place (臺中市和平區：, or before the day: 臺中市｜今天停止上班上課), after each 、,
// and before what is stopped when a time of day stands between (今天下午4時起｜停止上班上課) — never inside one, so the
// day stays with what it stops.
const notice = (l) => l.replace(/[。.]+$/, "").replace(/:/g, "：").replace("停止上班、停止上課", "停止上班上課")
  .replace(/([：、])/g, "$1\u0000").replace(/(今天|明天)/g, "\u0000$1").replace(/(今天|明天)?(停止|照常)/g, (m, d, s) => (d ? m : `\u0000${s}`))
  .split("\u0000").filter(Boolean).map((p) => `<span class="w">${esc(p)}</span>`).join("");

// A day with a warning or a closure notice: each one a red chop, the warning's name large and where it holds under it
// (陸上強風特報 / 大甲、清水等 7 區), then the notice. Otherwise, when both are known to be quiet, the sentence and the
// gold postmark; with either unknown, nothing.
function notePart(m) {
  if (m.alerts.length || m.notices.length) {
    const where = (a) => (a.line.startsWith(`${a.name}・`) ? a.line.slice(a.name.length + 1) : "");
    const chops = [...m.alerts.map((a) => `<p class="chop warn">${esc(a.name)}${where(a) ? `<small>${esc(where(a))}</small>` : ""}</p>`),
      ...m.notices.map((l) => `<p class="chop notice">${notice(l)}</p>`)];
    return `<section class="vt-note alarm">${chops.join("")}</section>`;
  }
  return m.quiet ? `<section class="vt-note"><p>今天沒有天氣特報，<br>也沒有停班停課</p>${POSTMARK}</section>` : "";
}

function ticketHtml(issue, m) {
  const [, mo, d] = issue.date.split("-").map(Number);
  return `<div class="lift"><article class="vt-tk">
    <div class="stub">${CREST}<p class="no"><i>No.</i><b>${esc(issue.no)}</b></p><p class="day">${d}. ${roman(mo)}.</p></div>
    <div class="main"><span class="vt-in" aria-hidden="true"></span>
      <header><h2>出門前</h2><p class="de">Vor dem Ausgehen</p><i class="orn" aria-hidden="true"></i></header>
      ${weatherPart(m.facts)}${airPart(m.air)}${notePart(m)}
      <button class="btn go" type="button" data-close>知道了</button>
    </div></article></div>`;
}

function dialog() {
  let d = document.getElementById("vorT");
  if (d) return d;
  d = document.createElement("dialog");
  d.id = "vorT";
  d.className = "vor-t";
  d.setAttribute("aria-label", "出門前");
  // 知道了, or a tap anywhere off the ticket: the dialog fills the screen around it
  d.addEventListener("click", (e) => { if (e.target === d || e.target.closest?.("[data-close]")) d.close(); });
  document.body.append(d);
  return d;
}

// The card for `issue` as the data stand now; false when there is nothing to show.
function openCard(issue) {
  const m = cardModel();
  if (!m) return false;
  const html = ticketHtml(issue, m), d = dialog();
  d.innerHTML = html;
  if (!d.open) d.showModal();
  return true;
}

// The card does not outlive the page it was raised from (app.js route, like the contents sheet).
export function closeOutdoor() {
  const d = document.getElementById("vorT");
  if (d?.open) d.close();
}

// ——— The way back: the 今日氣象 box ———
function unwire(box) {
  box.classList.remove("tap");
  box.removeAttribute("role");
  box.removeAttribute("tabindex");
  box.removeAttribute("aria-haspopup");
  box.removeAttribute("aria-describedby");
  box.setAttribute("aria-label", "今日氣象");
  box.querySelector(".lbl .cue")?.remove();
}
// Only today's paper wires the box (app.js calls outdoorFront for it alone), so the card opened by hand counts as the
// day's card seen: it does not come up by itself again on this device.
function wireBox(box, issue) {
  const lbl = box.querySelector(".lbl"), m = cardModel();
  if (!lbl || !m) { unwire(box); return; }
  if (!box.dataset.vor) {
    box.dataset.vor = "1";
    const go = () => { if (!box.classList.contains("tap")) return; try { if (openCard(issue)) markShown(issue.date); } catch { /* no card: the box is only the weather */ } };
    box.addEventListener("click", go);
    box.addEventListener("keydown", (e) => { if (e.target === box && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); go(); } });
  }
  box.classList.add("tap");
  box.setAttribute("role", "button");
  box.tabIndex = 0;
  box.setAttribute("aria-haspopup", "dialog");
  // as a button the box is named by what it holds — the forecast as it reads, the red word with it — and what a tap
  // does is its description (a hidden line, so the row's look is untouched)
  box.removeAttribute("aria-label");
  box.setAttribute("aria-describedby", "vorHint");
  const html = `${m.cue ? `<span class="alarm">${esc(m.cue)}</span>` : ""}<span class="go" aria-hidden="true">›</span><span id="vorHint" hidden="">打開出門前</span>`;
  let cue = lbl.querySelector(".cue");
  if (!cue) { cue = document.createElement("span"); cue.className = "cue"; lbl.append(cue); }
  if (cue.innerHTML !== html) cue.innerHTML = html;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// The masthead's entrance as the CSS plays it — after the press run's hold on a first opening (motion.js pressRun) —
// waited for: the masthead's animations that end within eight seconds (the verse set a character at a time is the
// longest), not the title's gold sweep, which goes on for half a minute. Never longer than eight seconds; with reduced
// motion nothing plays, and the card comes a moment after the page.
function entrance(head) {
  if (!head || calm() || !head.getAnimations) return wait(300);
  const ends = head.getAnimations({ subtree: true }).filter((a) => { const t = a.effect?.getComputedTiming?.().endTime; return Number.isFinite(t) && t <= 8000; });
  return Promise.race([Promise.allSettled(ends.map((a) => a.finished)), wait(8000)]);
}

const shownFor = (date) => { const s = store.get(SHOWN, []); return popped.has(date) || (Array.isArray(s) && s.includes(date)); };
function markShown(date) {
  popped.add(date);
  const s = store.get(SHOWN, []), list = Array.isArray(s) ? s : [];
  if (!list.includes(date)) store.set(SHOWN, [...list, date].slice(-60)); // opened by hand again and again: one entry
}

// Each draw of today's front page (app.js viewFront): `box` is the 今日氣象 section, `head` the masthead, `weather` the
// promise of the day's forecast (fillWeather), `pop` whether this draw may bring the card up by itself (not for an issue
// opened from 往期, nor under ?preview). Never throws.
export function outdoorFront({ box, head, issue, weather, pop }) {
  const my = ++seq;
  try {
    if (!box || !issue?.date) return;
    const draw = () => { try { wireBox(box, issue); } catch { try { unwire(box); } catch { /* left as drawn */ } } };
    draw(); // at once, out of the kept forecast and the last file read
    const data = fetchOutdoor().then((d) => { lastData = d; });
    const wx = Promise.resolve(weather).then((d) => { lastWx = d || null; }, () => {});
    const both = Promise.all([data, wx]).then(() => { if (my === seq && box.isConnected) draw(); });
    if (!pop || shownFor(issue.date)) return;
    Promise.all([both, entrance(head)]).then(() => {
      // the page has moved on (a redraw, another page), the app is in the background, a sheet or a picture is open, or
      // the evening letter has the keyboard: not now — the next draw of the front page tries again
      if (my !== seq || !box.isConnected || document.hidden || document.querySelector("dialog[open]") || shownFor(issue.date)) return;
      if (/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || "")) return;
      if (openCard(issue)) markShown(issue.date);
    }).catch(() => { /* no card */ });
  } catch { /* the page stands without the card */ }
}
