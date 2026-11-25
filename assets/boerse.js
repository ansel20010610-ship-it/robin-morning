// 市場行情 (Börse): the quote board under 外電 on the latest issue's front page (style.css .mk; the board was chosen
// from three samples on 2026-11-25). A fine double gold frame, the BÖRSE plate held at the left, and the figures of
// assets/market.js running past it at 20 pt a second, as the file gives them (two decimals, thousands grouped; the
// change with its triangle, the percent with its sign). A figure older than its market's last trading day carries its
// date. Tapped, the board opens in place into a small table with every figure's date and the sources, like the wires.
// The board is 38 pt high from the moment the front page is drawn, with the figures or without: drawn at once from the
// copy kept on the phone (rm.market.last, rebuildable), else empty (the frame and the plate only), and filled in place
// when the file comes, so nothing under it moves (iOS has no scroll anchoring). Whatever the file holds, nothing here
// throws into the front page.
// Live (2026-11-25): while the board is on screen it also asks the yard Worker for the four stock figures as they stand
// now (台股 from the exchange, the three American indices from Yahoo Finance: market.js fetchLive), every half minute and
// again on coming back to the app, and shows each one over the file's figure unless the file's is later. New numbers
// are put in where they stand, so the tape runs on; it starts its lap again only when the figures shown change in kind
// (one more or fewer, a date), and moves once when the copy grows past its width. Without the Worker's answer the file's figures stay.
import { esc, store, twNow } from "./util.js";
import { fetchLive, fetchMarket, marketItems } from "./market.js";

const KEYS = ["taiex", "usdtwd", "spx", "dji", "ixic", "wti", "brent"];
// on the tape, and in the opened table where it says more
const NAME = { taiex: ["台股"], usdtwd: ["美元"], spx: ["S&P", "S&P 500"], dji: ["道瓊"], ixic: ["那斯達克"], wti: ["WTI", "WTI 原油"], brent: ["布蘭特", "布蘭特原油"] };
const FRED = new Set(["spx", "dji", "ixic", "wti", "brent"]);
const SPEED = 20; // pt a second
const LEAD = 12; // pt: where the first name stands in the window when the tape starts, clear of the 10 pt soft end
const SOURCES = `資料：<a href="https://www.twse.com.tw/" target="_blank" rel="noopener noreferrer">臺灣證券交易所</a>、<a href="https://fred.stlouisfed.org/" target="_blank" rel="noopener noreferrer">FRED</a>（聖路易聯準銀行）、<a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer">ExchangeRate-API</a>`;
// the live figures' own sources, named when a figure shown is from them
const MORE = [["Yahoo 財經", "https://finance.yahoo.com/"], ["Yahoo 奇摩股市", "https://tw.stock.yahoo.com/"]];
const sourcesOf = (items) => SOURCES.replace("（聖路易聯準銀行）", `（聖路易聯準銀行）${MORE.filter(([n]) => items.some((m) => m.source === n))
  .map(([n, u]) => `、<a href="${u}" target="_blank" rel="noopener noreferrer">${n}</a>`).join("")}`);
const LIVE_MS = 30e3; // how often the live figures are asked for while the board is on screen (the Worker keeps an answer 20 s: none shown is over a minute old)
const LIVE = new Set(["taiex", "spx", "dji", "ixic"]);
// The moment a figure is of: a time as it stands; a bare date (a close, from the file) as that market's close that day.
const CLOSE = { taiex: "T13:30+08:00", spx: "T16:00-05:00", dji: "T16:00-05:00", ixic: "T16:00-05:00" };
const moment = (key, asof) => {
  const s = String(asof || ""), t = Date.parse(/^\d{4}-\d\d-\d\d$/.test(s) ? s + (CLOSE[key] || "T23:59+08:00") : s);
  return Number.isFinite(t) ? t : 0;
};

// ——— the day a figure should be of ———
const DAY = 864e5;
const iso = (t) => new Date(t).toISOString().slice(0, 10);
const prior = (date) => iso(Date.parse(`${date}T00:00:00Z`) - DAY);
// `date` itself when it is a weekday, else the Friday before (holidays are not known here: on one, the figure is
// simply given its date)
function weekday(date) {
  let t = Date.parse(`${date}T00:00:00Z`);
  while ([0, 6].includes(new Date(t).getUTCDay())) t -= DAY;
  return iso(t);
}
// New York's date and hour now, or null when the phone cannot tell
function newYork(now) {
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date(now)).map((x) => [x.type, x.value]));
    const date = `${p.year}-${p.month}-${p.day}`, h = Number(p.hour);
    return /^\d{4}-\d\d-\d\d$/.test(date) && h >= 0 && h < 24 ? { date, h } : null;
  } catch { return null; }
}
// The last trading day an item's figure can be of: 台股, the weekday before today in Taiwan (the exchange's file has a
// day's close the next morning); the rate, updated once a day, yesterday's or today's; New York's five (FRED), the last
// weekday whose 16:00 close has passed there. "" when it cannot be told: the figure then always carries its date.
function due(key, now) {
  if (key === "taiex") return weekday(prior(twNow().date));
  if (key === "usdtwd") return prior(twNow().date);
  if (FRED.has(key)) { const ny = newYork(now); return ny ? weekday(ny.h >= 16 ? ny.date : prior(ny.date)) : ""; }
  return "";
}
const dayOf = (asof) => /^\d{4}-\d\d-\d\d/.exec(asof || "")?.[0] || "";
const md = (day) => `${Number(day.slice(5, 7))}/${Number(day.slice(8, 10))}`;
const behind = (m, now) => { const day = dayOf(m.asof), want = due(m.key, now); return Boolean(day) && (!want || day < want); };

// ——— drawing ———
const list = (d) => marketItems(d, KEYS);
const tone = (dir) => (dir > 0 ? " up" : dir < 0 ? " dn" : "");
const tri = (dir) => (dir ? `<i class="tri"></i>` : "");
const bare = (s) => s.replace(/^[+−]/, ""); // the triangle says which way
function itemHtml(m, now) {
  const move = m.change || m.pct
    ? `<span class="c${tone(m.dir)}">${m.change ? tri(m.dir) + esc(bare(m.change)) : ""}${m.pct ? `<span class="pc">(${esc(m.pct)})</span>` : ""}</span>` : "";
  const date = behind(m, now) ? `<span class="d">${md(dayOf(m.asof))}</span>` : "";
  return `<span class="it"><span class="n">${esc(NAME[m.key][0])}</span><span class="v">${esc(m.value)}</span>${move}${date}</span>`;
}
const tapeItem = (m, now) => `${itemHtml(m, now)}<span class="sep" aria-hidden="true"></span>`;
// what the tape is made of, figure by figure, apart from the numbers: the same shape takes new numbers in place
const shapeOf = (items, now) => items.map((m) => `${m.key}${m.change || m.pct ? "c" : ""}${behind(m, now) ? "d" : ""}`).join(",");
const beltHtml = (items, now) => {
  if (!items.length) return `<span class="belt"></span>`;
  const run = (hide) => `<span class="run"${hide ? ' aria-hidden="true"' : ""}>${items.map((m) => tapeItem(m, now)).join("")}</span>`;
  return `<span class="belt">${run(false)}${run(true)}</span>`;
};
const tableHtml = (items) => `<table class="mkt"><tbody>${items.map((m) => {
  const day = dayOf(m.asof), [short, full = short] = NAME[m.key];
  return `<tr><th>${esc(full)}${day ? `<small>${md(day)}</small>` : ""}</th><td class="v">${esc(m.value)}</td><td class="c${tone(m.dir)}">${m.change ? tri(m.dir) + esc(bare(m.change)) : ""}</td><td class="p${tone(m.dir)}">${esc(m.pct)}</td></tr>`;
}).join("")}</tbody></table><p class="src">${sourcesOf(items)}</p>`;
// a short tag for what is drawn, so a refetch that brings the same figures leaves the moving tape alone
const sigOf = (html) => { let h = 5381; for (let i = 0; i < html.length; i++) h = ((h << 5) + h + html.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

let last = null; // the last file read, in memory; at a cold start, the copy kept on the phone
const kept = () => { last ||= store.get("market.last"); return last; };
let live = null; // the Worker's last answer, likewise (rm.market.live, rebuildable)
const keptLive = () => { live ||= store.get("market.live"); return live; };
const pick = (items) => (Array.isArray(items) ? items : []).filter((i) => i && KEYS.includes(i.key))
  .map(({ key, name, value, change, change_pct, asof, source, url, ok, stale, got }) => ({ key, name, value, change, change_pct, asof, source, url, ok, stale, got }));
// A figure the Worker gave during its market's session stands KEEP_MS from when it came (`got`, this phone's clock):
// one answer without it (a source not read that minute) keeps it, a longer silence gives the board back to the file.
// One read at or after the close (its own time, 13:30 in Taipei, 16:00 in New York) is that day's close and stays.
const KEEP_MS = 10 * 60e3;
const SHUT = { taiex: "13:30", spx: "16:00", dji: "16:00", ixic: "16:00" };
const settled = (i) => (/T(\d\d:\d\d)/.exec(i.asof || "")?.[1] || "") >= SHUT[i.key];
const fresh = (i, now) => settled(i) || (Number.isFinite(i.got) && now - i.got >= 0 && now - i.got < KEEP_MS);
// A new answer put together with the figures kept from the last, figure by figure: the new one, unless it is of an
// earlier moment than the one kept (the Worker may answer from the exchange one time and from Yahoo 奇摩, a minute
// behind, the next: the board must not step back. In the same minute of the session the exchange's figure, seconds
// behind, stands over Yahoo 奇摩's; in the minute of the close the other way round, since the exchange's figure stamped
// 13:30 is not yet the final one (38,141.53; the close, stamped 13:33, was 38,195.43, which Yahoo 奇摩 stamps 13:30,
// 2026-11-25), so neither steps back nor flips between the two. Not read this time, the kept one while it stands.
const EXCHANGE = "臺灣證券交易所";
function mergeLive(got, had, now) {
  const items = [];
  for (const k of LIVE) {
    const n = got.find((i) => i.key === k), o = had.find((i) => i.key === k), keep = o?.ok === true && fresh(o, now);
    const mo = keep ? moment(k, o.asof) : 0, mn = n?.ok === true ? moment(k, n.asof) : 0;
    const ex = (i) => i?.source === EXCHANGE;
    const older = keep && (mo > mn || (mo === mn && (settled(o) ? !ex(o) && ex(n) : ex(o) && !ex(n))));
    if (n?.ok === true && !older) items.push({ ...n, got: now });
    else if (keep) items.push(o);
  }
  return items;
}
// The figures to show: the file's, each stock figure the Worker gave put over it unless the file's is of a later moment.
function current() {
  const items = pick(kept()?.items), now = Date.now();
  for (const l of pick(keptLive()?.items)) {
    if (l.ok !== true || !LIVE.has(l.key) || !fresh(l, now)) continue;
    const i = items.findIndex((x) => x.key === l.key);
    if (i < 0) items.push(l);
    else if (!(items[i].ok === true && moment(l.key, items[i].asof) > moment(l.key, l.asof))) items[i] = l;
  }
  return list({ items });
}

// The board's markup for viewFront, figures and all (or empty). Never throws.
export function boerseBox() {
  let items = [], now = Date.now();
  try { items = current(); } catch { items = []; }
  let belt, sheet, shape = "";
  try { belt = beltHtml(items, now); sheet = items.length ? tableHtml(items) : ""; shape = shapeOf(items, now); } catch { items = []; belt = beltHtml([], now); sheet = ""; }
  return `<section class="mk"${items.length ? "" : " data-empty"} aria-label="市場行情" data-sig="${sigOf(belt + sheet)}" data-shape="${esc(shape)}"><details class="quotes"><summary><span class="ktag"><span class="sc">Börse</span></span><span class="win"><span class="vp">${belt}</span></span><span class="less">收起</span></summary><div class="mk-fold">${sheet}</div></details></section>`;
}

// The tape's two copies are made a whole number of points wide, so the second lands on the same pixels as the first
// and the lap joins without a seam; one lap (one copy) takes its width / 20 seconds. Measured again once the fonts are
// in, within the first lap, where a change of duration moves nothing (the tape is still at elapsed × 20 − 12 into a copy).
// The tape starts (drawn, redrawn, closed again) with the first name 12 pt into the window, clear of the soft end, as
// in the sample: a negative delay, so it begins that far short of the second copy; the joins and the speed are the same.
// The layout width (offsetWidth: a whole number, and no transform on the page can change it) plus one point, so it is
// never short of the copy's own width; and never narrower than the window (clientWidth, also whole), or with only a
// figure or two left (or the phone turned to the side) the second copy would leave the right of the window empty and
// jump in at each lap's end. What a copy is made wider by is left blank.
// Past the first lap a new duration or delay moves the running tape, so a tape already timed is left alone when its
// width comes out the same (the five-minute refetch, the fonts again), and when it is narrower while the end of the lap
// is awaited (atLapEnd). `restart`: the tape starts from the beginning anyway (drawn, closed again) and takes the timing.
function timeBelt(box, restart = false) {
  try {
    const runs = box.querySelectorAll(".run"), vp = box.querySelector(".vp");
    if (!runs.length) return;
    const old = parseFloat(runs[0].style.width) || 0;
    runs.forEach((r) => { r.style.width = ""; });
    const own = runs[0].offsetWidth;
    if (!own) return; // opened: the tape is not drawn; measured when it is closed again
    const win = vp?.clientWidth || 0, w = Math.max(own + 1, win);
    box.dataset.vw = String(win);
    if (old && !restart && (w === old || (w < old && box.dataset.lap))) { runs.forEach((r) => { r.style.width = `${old}px`; }); return; }
    runs.forEach((r) => { r.style.width = `${w}px`; });
    const belt = box.querySelector(".belt");
    belt.style.animationDuration = `${(w / SPEED).toFixed(3)}s`;
    belt.style.animationDelay = `${(-Math.max(0, w - LEAD) / SPEED).toFixed(3)}s`;
  } catch { /* the tape keeps its last timing */ }
}

// The faces the tape is set in, each asked for with the tape's own text (Google's files are split by script): when
// they are in, the tape is measured again. fonts.ready is taken only after a layout has started their loading, since
// one taken earlier may already have resolved; WebKit was not seen to fire loadingdone.
const FACES = ['600 18.5px "Cormorant Garamond"', '600 15px "Cormorant SC"', '12.5px "Noto Serif TC"'];
function afterFonts(box) {
  try {
    const text = box.querySelector(".run")?.textContent || "";
    if (!text || !document.fonts?.load) return;
    const again = () => { if (box.isConnected) timeBelt(box); };
    Promise.all(FACES.map((f) => document.fonts.load(f, f.includes("SC") ? "Börse" : text).catch(() => []))).then(again, () => {});
    document.fonts.ready?.then(again, () => {});
  } catch { /* measured once, with what was there */ }
}

function draw(box, items) {
  const now = Date.now(), belt = beltHtml(items, now), sheet = items.length ? tableHtml(items) : "";
  const sig = sigOf(belt + sheet);
  if (box.dataset.sig === sig) return;
  box.dataset.sig = sig;
  const det = box.querySelector("details");
  if (!items.length) det.open = false;
  box.toggleAttribute("data-empty", !items.length);
  box.querySelector(".mk-fold").innerHTML = sheet;
  const shape = shapeOf(items, now);
  if (items.length && box.dataset.shape === shape && inPlace(box, items, now)) return;
  box.dataset.shape = shape;
  delete box.dataset.lap;
  box.querySelector(".vp").innerHTML = belt; // a new tape starts its lap from the beginning
  timeBelt(box);
  afterFonts(box);
}

// The copy's own width: from its start to the end of its last mark (a whole number, as offsetWidth). 0 when not drawn.
const ownWidth = (run) => { const end = run.lastElementChild; return end ? end.offsetLeft + end.offsetWidth - run.offsetLeft : 0; };
// The same figures with new numbers (the live minute): each one is put in where it stands, in both copies, and the
// tape runs on. Grown past the width it was timed for, the tape is timed now (and moves once, a rare case); grown
// narrower, it is timed at the end of the lap, where the second copy stands where the first began and starting again
// shows nothing. false when the tape is not the one to change in place.
function inPlace(box, items, now) {
  try {
    const runs = box.querySelectorAll(".run"), html = items.map((m) => itemHtml(m, now));
    if (runs.length !== 2) return false;
    const its = [...runs].map((r) => r.querySelectorAll(":scope > .it"));
    if (its.some((l) => l.length !== html.length)) return false;
    its.forEach((l) => l.forEach((el, i) => { if (el.outerHTML !== html[i]) el.outerHTML = html[i]; }));
    const w = parseFloat(runs[0].style.width) || 0, own = ownWidth(runs[0]);
    if (!own) return true; // opened: the tape is timed when it is closed again
    if (!w || own + 1 > w) timeBelt(box);
    else if (w - Math.max(own + 1, Number(box.dataset.vw) || 0) > 0) atLapEnd(box);
    return true;
  } catch { return false; }
}
function atLapEnd(box) {
  const belt = box.querySelector(".belt");
  if (!belt || box.dataset.lap) return;
  box.dataset.lap = "1";
  belt.addEventListener("animationiteration", () => {
    delete box.dataset.lap;
    if (!box.isConnected || belt !== box.querySelector(".belt")) return;
    timeBelt(box, true);
    belt.style.animationDelay = "0s"; // from the lap's start, where it stands now
    belt.style.animationName = "none";
    void belt.offsetWidth;
    belt.style.animationName = "";
  }, { once: true });
}

function bind(box) {
  if (box.dataset.on) return;
  box.dataset.on = "1";
  const det = box.querySelector("details");
  box.querySelector("summary").addEventListener("click", (e) => { if (box.hasAttribute("data-empty")) e.preventDefault(); }); // nothing to open yet
  det.addEventListener("toggle", () => { if (!det.open) timeBelt(box, true); }); // closed, the tape runs again from its start
  // the window made wider or narrower (the phone turned): timed again when its width is not the one it was timed for
  let pend = 0;
  const fit = () => {
    if (!box.isConnected) { removeEventListener("resize", fit); return; }
    cancelAnimationFrame(pend);
    pend = requestAnimationFrame(() => { const vp = box.querySelector(".vp"); if (box.isConnected && vp?.clientWidth && String(vp.clientWidth) !== box.dataset.vw) timeBelt(box); });
  };
  addEventListener("resize", fit);
}

// After viewFront has drawn the page (and with the five-minute refetch): time the tape, then read the file and fill
// the board in place. Without a board on the page, nothing.
export function fillBoerse(root, api) {
  const box = root?.querySelector(".wrap > .mk");
  if (!box) return;
  try { bind(box); } catch { /* still filled below */ }
  requestAnimationFrame(() => { if (box.isConnected) { timeBelt(box); afterFonts(box); } });
  fetchMarket().then((d) => {
    if (!d) return; // offline, or no file: the board keeps what it shows
    last = { updated: d.updated, items: pick(d.items) };
    store.set("market.last", last);
    if (box.isConnected) draw(box, current());
  }).catch(() => {});
  liveBox = box; liveApi = api || "";
  askLive();
}

// The live figures: asked for at once, then each minute while this board is on the page and the app on screen; a new
// board (the front page drawn again) takes the round over. Away from the screen, nothing is asked; on coming back, at once.
let liveBox = null, liveApi = "", liveRound = 0, liveTimer = 0;
function askLive() {
  clearTimeout(liveTimer);
  const round = ++liveRound, box = liveBox;
  if (!box?.isConnected || !liveApi || document.hidden) return;
  fetchLive(liveApi).then((d) => {
    if (!d) return; // no answer: the board keeps what it shows
    live = { updated: d.updated, items: mergeLive(pick(d.items), pick(keptLive()?.items), Date.now()) };
    store.set("market.live", live);
    if (box.isConnected) draw(box, current());
  }).catch(() => {}).finally(() => {
    if (round === liveRound && box.isConnected) liveTimer = setTimeout(askLive, LIVE_MS);
  });
}

// Away from the screen (another app, the phone locked), the tape stops where it is and goes on from there.
try {
  const away = () => {
    document.documentElement.classList.toggle("mk-away", document.hidden);
    if (document.hidden) { clearTimeout(liveTimer); liveRound++; } else if (liveBox?.isConnected) askLive();
  };
  document.addEventListener("visibilitychange", away);
  away();
} catch { /* no pause: the tape simply runs */ }
