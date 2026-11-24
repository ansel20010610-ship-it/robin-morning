// 市場行情 (Börse): the quote board under 外電 on the latest issue's front page (style.css .mk; the board was chosen
// from three samples on 2026-11-25). A fine double gold frame, the BÖRSE plate held at the left, and the figures of
// assets/market.js running past it at 20 pt a second, as the file gives them (two decimals, thousands grouped; the
// change with its triangle, the percent with its sign). A figure older than its market's last trading day carries its
// date. Tapped, the board opens in place into a small table with every figure's date and the sources, like the wires.
// The board is 38 pt high from the moment the front page is drawn, with the figures or without: drawn at once from the
// copy kept on the phone (rm.market.last, rebuildable), else empty (the frame and the plate only), and filled in place
// when the file comes, so nothing under it moves (iOS has no scroll anchoring). Whatever the file holds, nothing here
// throws into the front page.
import { esc, store, twNow } from "./util.js";
import { fetchMarket, marketItems } from "./market.js";

const KEYS = ["taiex", "usdtwd", "spx", "dji", "ixic", "wti", "brent"];
// on the tape, and in the opened table where it says more
const NAME = { taiex: ["台股"], usdtwd: ["美元"], spx: ["S&P", "S&P 500"], dji: ["道瓊"], ixic: ["那斯達克"], wti: ["WTI", "WTI 原油"], brent: ["布蘭特", "布蘭特原油"] };
const FRED = new Set(["spx", "dji", "ixic", "wti", "brent"]);
const SPEED = 20; // pt a second
const LEAD = 12; // pt: where the first name stands in the window when the tape starts, clear of the 10 pt soft end
const SOURCES = `資料：<a href="https://www.twse.com.tw/" target="_blank" rel="noopener noreferrer">臺灣證券交易所</a>、<a href="https://fred.stlouisfed.org/" target="_blank" rel="noopener noreferrer">FRED</a>（聖路易聯準銀行）、<a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer">ExchangeRate-API</a>`;

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
function tapeItem(m, now) {
  const move = m.change || m.pct
    ? `<span class="c${tone(m.dir)}">${m.change ? tri(m.dir) + esc(bare(m.change)) : ""}${m.pct ? `<span class="pc">(${esc(m.pct)})</span>` : ""}</span>` : "";
  const date = behind(m, now) ? `<span class="d">${md(dayOf(m.asof))}</span>` : "";
  return `<span class="it"><span class="n">${esc(NAME[m.key][0])}</span><span class="v">${esc(m.value)}</span>${move}${date}</span><span class="sep" aria-hidden="true"></span>`;
}
const beltHtml = (items, now) => {
  if (!items.length) return `<span class="belt"></span>`;
  const run = (hide) => `<span class="run"${hide ? ' aria-hidden="true"' : ""}>${items.map((m) => tapeItem(m, now)).join("")}</span>`;
  return `<span class="belt">${run(false)}${run(true)}</span>`;
};
const tableHtml = (items) => `<table class="mkt"><tbody>${items.map((m) => {
  const day = dayOf(m.asof), [short, full = short] = NAME[m.key];
  return `<tr><th>${esc(full)}${day ? `<small>${md(day)}</small>` : ""}</th><td class="v">${esc(m.value)}</td><td class="c${tone(m.dir)}">${m.change ? tri(m.dir) + esc(bare(m.change)) : ""}</td><td class="p${tone(m.dir)}">${esc(m.pct)}</td></tr>`;
}).join("")}</tbody></table><p class="src">${SOURCES}</p>`;
// a short tag for what is drawn, so a refetch that brings the same figures leaves the moving tape alone
const sigOf = (html) => { let h = 5381; for (let i = 0; i < html.length; i++) h = ((h << 5) + h + html.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

let last = null; // the last file read, in memory; at a cold start, the copy kept on the phone
const kept = () => { last ||= store.get("market.last"); return last; };

// The board's markup for viewFront, figures and all (or empty). Never throws.
export function boerseBox() {
  let items = [], now = Date.now();
  try { items = list(kept()); } catch { items = []; }
  let belt, sheet;
  try { belt = beltHtml(items, now); sheet = items.length ? tableHtml(items) : ""; } catch { items = []; belt = beltHtml([], now); sheet = ""; }
  return `<section class="mk"${items.length ? "" : " data-empty"} aria-label="市場行情" data-sig="${sigOf(belt + sheet)}"><details class="quotes"><summary><span class="ktag"><span class="sc">Börse</span></span><span class="win"><span class="vp">${belt}</span></span><span class="less">收起</span></summary><div class="mk-fold">${sheet}</div></details></section>`;
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
function timeBelt(box) {
  try {
    const runs = box.querySelectorAll(".run"), vp = box.querySelector(".vp");
    if (!runs.length) return;
    runs.forEach((r) => { r.style.width = ""; });
    const own = runs[0].offsetWidth;
    if (!own) return; // opened: the tape is not drawn; measured when it is closed again
    const win = vp?.clientWidth || 0, w = Math.max(own + 1, win);
    box.dataset.vw = String(win);
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
  box.querySelector(".vp").innerHTML = belt; // a new tape starts its lap from the beginning
  box.querySelector(".mk-fold").innerHTML = sheet;
  timeBelt(box);
  afterFonts(box);
}

function bind(box) {
  if (box.dataset.on) return;
  box.dataset.on = "1";
  const det = box.querySelector("details");
  box.querySelector("summary").addEventListener("click", (e) => { if (box.hasAttribute("data-empty")) e.preventDefault(); }); // nothing to open yet
  det.addEventListener("toggle", () => { if (!det.open) timeBelt(box); }); // closed, the tape runs again from its start
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
export function fillBoerse(root) {
  const box = root?.querySelector(".wrap > .mk");
  if (!box) return;
  try { bind(box); } catch { /* still filled below */ }
  requestAnimationFrame(() => { if (box.isConnected) { timeBelt(box); afterFonts(box); } });
  fetchMarket().then((d) => {
    if (!d) return; // offline, or no file: the board keeps what it shows
    const items = list(d);
    last = { updated: d.updated, items: d.items.filter((i) => i && KEYS.includes(i.key)).map(({ key, name, value, change, change_pct, asof, source, url, ok, stale }) => ({ key, name, value, change, change_pct, asof, source, url, ok, stale })) };
    store.set("market.last", last);
    if (box.isConnected) draw(box, items);
  }).catch(() => {});
}

// Away from the screen (another app, the phone locked), the tape stops where it is and goes on from there.
try {
  const away = () => document.documentElement.classList.toggle("mk-away", document.hidden);
  document.addEventListener("visibilitychange", away);
  away();
} catch { /* no pause: the tape simply runs */ }
