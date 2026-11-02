// 知更鳥晨間記事 — app shell, routing and views.
import { $, esc, inline, paragraphs, store, toast, twNow, fmtDate, getJSON, ICON, ROBIN_PATHS, roman } from "./util.js";
import { renderBody, renderHero } from "./blocks.js";
import { initSpotify, handleCallback, initDock, login, logout, isLoggedIn, hasClient, isWebKitITP, isStandaloneIOS, exportLinkCode, importLinkCode, defaultPlaylist,
  autoPlaylist, setAutoPlaylist, choosePlaylist, autoAdd } from "./spotify.js";
import { pitchThumb } from "./pitch.js";
import { canSpeak, createReader, RATES, getRate, setRate } from "./speak.js";
import { renderPush, clearNotices } from "./notify.js";
import { calm, reveal, transition, celebrate, seal, digestRing, mastheadShow, pressRun, ripples, flip } from "./motion.js";
import { allMarks, removeMark, applyMarks, pencil, land } from "./marks.js";
import { pressHtml } from "./press.js";
import { fetchWeather, weatherHtml } from "./wetter.js";
import { stampHtml } from "./stamps.js";
import { worldState, drawMap } from "./world.js";

const S = { cfg: null, index: null, articles: new Map() };
const main = $("#main");

// ——— Data ———
async function loadData() {
  const [cfg, index] = await Promise.all([
    getJSON("content/config.json", { fresh: true }),
    getJSON("content/index.json", { fresh: true }).catch(() => ({ issues: [] })),
    loadLate(),
  ]);
  S.cfg = cfg;
  S.index = index;
  initSpotify(cfg.spotify);
  loadGigs().then(fillGigs); // not waited for: the front page draws without it
}

// 週日補刊 (content/late.json, scripts/late.py): the weekly AI quota resets on Sunday at 15:00. A Sunday whose quota
// ran out overnight is not patched with reserves; the whole issue is written again after 15:00, and the app says so.
const loadLate = () => getJSON("content/late.json", { fresh: true }).then((l) => { S.late = l && typeof l === "object" ? l : {}; }).catch(() => {});
const lateOf = (date) => S.late?.[date] || null;
function lateText(late, got) {
  const now = twNow();
  if (late.state === "waiting" && now.minutes < publishMin())
    return `本週的 AI 額度在凌晨用完，今天這期 ${esc(S.cfg.publish_time)} 不會出齊。週日不拿備稿充數：額度<b>下午 3 點</b>重置後，整期重新寫過，大約傍晚出齊，好了會通知你。先翻上一期。`;
  if (late.state === "waiting" && now.minutes < 15 * 60)
    return `本週的 AI 額度在凌晨用完，今天這期沒能在 ${esc(S.cfg.publish_time)} 出齊。週日不拿備稿充數：額度<b>下午 3 點</b>重置後，整期重新寫過，大約傍晚出齊，好了會通知你。${got ? `已經寫好的 ${got} 篇先放上來。` : "先翻上一期。"}`;
  if (now.minutes >= 21 * 60)
    return `今天的補刊沒能全部完成${got ? `（到了 ${got} 篇）` : ""}，抱歉。明天 ${esc(S.cfg.publish_time)} 照常出刊。`;
  return `額度在下午 3 點重置了，今天這期正在重新寫，寫好一篇就上一篇，出齊會通知你。${got ? `目前到了 ${got} 篇。` : ""}`;
}
// Under a late issue's front page, for good: why this issue came out in the afternoon.
function lateNote(date) {
  const late = lateOf(date);
  if (!late || (date === twNow().date && late.state !== "done")) return ""; // today's unfinished one is in the status line
  return `<div class="status late-note">${late.state === "done"
    ? `本期是週日補刊：凌晨 AI 額度用完，沒有拿備稿充數，等下午 3 點額度重置後整期重寫${late.done_at ? `，${esc(late.done_at)} 出齊` : ""}。`
    : "本期是週日補刊：凌晨 AI 額度用完，下午重寫時沒能全部完成，缺的欄位就空著。"}</div>`;
}

// `?preview` shows issues before their 07:30 release (for checking a new issue).
// Read on every call: coming back from Spotify, handleCallback restores the query after this module has loaded.
const isPreview = () => new URLSearchParams(location.search).has("preview");
const publishMin = () => { const [h, m] = (S.cfg.publish_time || "07:30").split(":").map(Number); return h * 60 + m; };
const isPublished = (date) => { if (isPreview()) return true; const n = twNow(); return date < n.date || (date === n.date && n.minutes >= publishMin()); };
const publishedIssues = () => (S.index.issues || []).filter((i) => isPublished(i.date));
const issueBy = (date) => (S.index.issues || []).find((i) => i.date === date);
// config.json's entry for a column as it stood on `date`: a column that changed meaning keeps the old entry under "was"
// up to its "until" (devotion: an essay until 2026-10-31, the verse and prayer since). A retired column stays in config
// with "until", so its past issues keep their name and place.
const col = (c, date) => { const k = S.cfg.columns[c] || { name: c, group: "supplement" }; return k.was && date && date <= k.was.until ? k.was : k; };

// The copy in memory is the current one (opening it needs no network).
function isFresh(date, column) {
  const have = S.articles.get(`${date}/${column}`);
  const want = issueBy(date)?.articles.find((x) => x.column === column)?.updated_at;
  return Boolean(have && (!want || have.updated_at === want));
}
async function article(date, column) {
  const k = `${date}/${column}`;
  const have = S.articles.get(k);
  if (isFresh(date, column)) return have;
  try {
    const a = await getJSON(`content/issues/${date}/${column}.json`, { fresh: Boolean(have) });
    S.articles.set(k, a);
    return a;
  } catch (e) {
    if (have) return have; // offline: the older copy beats an error page
    throw e;
  }
}

const weekdayKey = (date) => ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date(`${date}T00:00:00Z`).getUTCDay()];
// Supplements follow that weekday's rotation (the settings table and the shifts use the same order).
function sortArticles(arts, date) {
  const g = { main: 0, supplement: 1, watch: 2 };
  const rot = S.cfg.rotation_by_weekday?.[weekdayKey(date)] || [];
  const pos = (c) => { const i = rot.indexOf(c); return i < 0 ? Infinity : i; };
  return [...arts].sort((a, b) => {
    const ca = col(a.column, date), cb = col(b.column, date);
    if (g[ca.group] !== g[cb.group]) return g[ca.group] - g[cb.group];
    if (ca.group === "supplement" && pos(a.column) !== pos(b.column)) return pos(a.column) - pos(b.column);
    return (ca.order ?? 9) - (cb.order ?? 9) || a.column.localeCompare(b.column);
  });
}

// ——— Reading state ———
const saved = () => store.get("saved", []);
const isSaved = (k) => saved().includes(k);
function toggleSaved(k) {
  const s = saved();
  const i = s.indexOf(k);
  if (i >= 0) s.splice(i, 1); else s.unshift(k);
  store.set("saved", s);
  return i < 0;
}
const readSet = () => new Set(store.get("read", []));
function markRead(k) { const r = store.get("read", []); if (!r.includes(k)) { r.push(k); store.set("read", r.slice(-2000)); } }

// ——— Shared pieces ———
const CONTAIN = new Set(["artwork", "document", "portrait", "illustration"]);
// Opening pictures shown whole and plain (style.css figure.hero.flat): a painting has a frame of its own, a document is
// a sheet, a portrait a face — none is cut larger, drifted or gilt-framed. An engraving or a photograph is.
const FLAT = new Set(["artwork", "document", "portrait"]);
function thumb(a, cls) {
  const h = a.hero;
  if (h?.src) return `<div class="${cls}${CONTAIN.has(h.kind) ? " contain" : ""}"><img src="${esc(cls === "ph" ? h.src : h.thumb || h.src)}" alt="${esc(h.alt || "")}" loading="lazy" decoding="async" referrerpolicy="no-referrer"></div>`;
  if (h?.diagram === "pitch") return `<div class="${cls}"><div class="diagram-th">${pitchThumb()}</div></div>`;
  if (h?.diagram) return `<div class="${cls}"><div class="diagram-th">${ICON.diagram}</div></div>`;
  return "";
}
function kicker(c, link = false, date = null) {
  const k = col(c, date);
  const inner = `${esc(k.name)}<span class="de">${esc(k.latin || "")}</span>`;
  return link ? `<a class="kicker" href="#/column/${esc(c)}">${inner}</a>` : `<div class="kicker">${inner}</div>`;
}
// The front page is the digest: each card carries the three-sentence brief (older articles fall back to the dek).
const summary = (a) => a.brief ? `<p class="brief">${esc(a.brief)}</p>` : `<p>${esc(a.dek)}</p>`;
// 上次讀到: where the reader left an article (pos.<key>, a 0–1 scroll ratio; dropped once it is read to the end).
// Under 8% is not worth coming back to.
const posOf = (key) => { const p = Number(store.get(`pos.${key}`, 0)); return p > 0.08 && p < 1 ? p : 0; };
const pct = (p) => Math.round(p * 100);
const posKeys = () => { const ks = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith("rm.pos.")) ks.push(k.slice(7)); } } catch { /* ignore */ } return ks; };
// Keep at most `max` remembered positions; the oldest issues' go first.
function prunePos(max = 80) {
  const ks = posKeys().sort();
  for (const k of ks.slice(0, Math.max(0, ks.length - max))) store.del(`pos.${k}`);
}
// The card's class and style for a part-read article: a pencil mark along its foot (.has-p::before, --p).
const posMark = (date, a, read) => { const p = read.has(`${date}/${a.column}`) ? 0 : posOf(`${date}/${a.column}`); return p ? { cls: " has-p", st: ` style="--p:${p}"` } : { cls: "", st: "" }; };
function metaLine(date, a, read) {
  const bits = [a.brief ? `全文約 ${a.minutes} 分鐘` : `約 ${a.minutes} 分鐘`];
  if (a.status === "undetermined") bits.unshift("查核未完成");
  if (a.from_reserve) bits.push("備稿");
  const p = read.has(`${date}/${a.column}`) ? 0 : posOf(`${date}/${a.column}`);
  if (p) bits.push(`<span class="pos-mark">讀到 ${pct(p)}%</span>`);
  if (read.has(`${date}/${a.column}`)) bits.push('<span class="read-mark">已讀</span>');
  else if (lockMode()) {
    const spent = lockSpent(`${date}/${a.column}`), left = lockNeed(a.minutes) - spent;
    if (spent) bits.push(`<span class="lock-t">已讀 ${lockClock(spent)}，${left > 0 ? `還差 ${lockClock(left)}` : "讀到文末就解鎖"}</span>`);
  }
  return `<div class="meta-s">${bits.join("・")}</div>`;
}
// ——— 循序閱讀 (設定 → 閱讀方式): each issue opens one article at a time, in the front page's order. An article counts
// as read when its end is on screen and the reader has spent at least half its estimated reading time on it, so a
// quick fling to the bottom does not unlock the next. Articles read before the mode was turned on count as read.
const lockMode = () => store.get("lock.mode", false) === true;
const lockNeed = (minutes) => Math.min(240, Math.max(30, Math.round((minutes || 2) * 30))); // seconds
const lockClock = (s) => (s >= 60 ? `${Math.floor(s / 60)} 分${s % 60 ? ` ${s % 60} 秒` : ""}` : `${s} 秒`);
// Seconds already spent on an article; kept when the reader leaves it (or the app) and comes back.
const lockSpent = (key) => Number(store.get("lock.t", {})[key]) || 0;
// The first unread article before `column` in its issue, or null when `column` is open to read.
function lockedBy(date, column) {
  if (!lockMode()) return null;
  const issue = issueBy(date);
  if (!issue) return null;
  const read = readSet();
  if (read.has(`${date}/${column}`)) return null; // read already (before the mode, or earlier today): always open
  for (const a of sortArticles(issue.articles, date)) {
    if (a.column === column) return null;
    if (!read.has(`${date}/${a.column}`)) return a;
  }
  return null;
}
function lockedCard(date, a, by) {
  return `<div class="item noimg locked" aria-disabled="true"><div>${kicker(a.column, false, date)}<h3>${esc(a.title)}</h3><p class="lock-note">${ICON.lock}<span>先讀完〈${esc(by.title)}〉就解鎖</span></p></div></div>`;
}

function itemCard(date, a, read) {
  const by = lockedBy(date, a.column);
  if (by) return lockedCard(date, a, by);
  const th = thumb(a, "th"), pm = posMark(date, a, read);
  return `<a class="item${th ? "" : " noimg"}${pm.cls}"${pm.st} href="#/a/${date}/${a.column}"><div>${kicker(a.column, false, date)}<h3>${esc(a.title)}</h3>${summary(a)}${metaLine(date, a, read)}</div>${th}</a>`;
}

const EMBLEM = `<svg class="emblem" viewBox="0 0 64 64" aria-hidden="true">
  <rect x="3" y="3" width="58" height="58" class="e-frame" stroke-width="1.4" pathLength="1"/><rect x="6" y="6" width="52" height="52" class="e-frame" stroke-width=".6" pathLength="1"/>
  <g class="e-gold"><rect x="1" y="1" width="4" height="4"/><rect x="59" y="1" width="4" height="4"/><rect x="1" y="59" width="4" height="4"/><rect x="59" y="59" width="4" height="4"/></g>
  ${ROBIN_PATHS}</svg>`; // the robin itself is util.js ROBIN_PATHS, shared with the seal (motion.js)

// `fresh` (viewFront, Druckfrisch): the issue is opened for the first time on this device — the masthead carries the
// press roller's ink line and the wine date stamp, and holds its own entrance (.fresh, style.css) until motion.js
// pressRun lets it go. The stamp is decoration: the topline already says the number and the day.
function masthead(issue, fresh = false) {
  const date = issue?.date || twNow().date;
  const [y, m, d] = date.split("-").map(Number);
  return `<header class="masthead${fresh ? " fresh" : ""}"><div class="wrap">
    ${fresh ? `<i class="roller" aria-hidden="true"></i>` : ""}
    <hr class="rule-double">
    <div class="topline"><span>Wien · Taipei</span><span>${issue ? `No. ${issue.no}` : ""}</span><span>${esc(fmtDate(date, "de").split(",")[0])}</span></div>
    ${fresh ? `<i class="stamp-date" aria-hidden="true"><b>Druckfrisch</b><span>No. ${esc(issue.no)}</span><span>${d}. ${roman(m)}. ${y}</span><i class="echo"></i></i>` : ""}
    <div class="checker" aria-hidden="true"></div>
    <div class="crest">${EMBLEM}<i class="burst" aria-hidden="true"></i><i class="wave" aria-hidden="true"></i><i class="wave w2" aria-hidden="true"></i></div>
    <h1>${esc(S.cfg.title)}</h1>
    <div class="latin">${esc(S.cfg.subtitle)}</div>
    <div class="dateline">${esc(fmtDate(date))}${issue ? `・第 ${issue.no} 期` : ""}・${esc(S.cfg.publish_time)} 出刊</div>
    <div class="checker" aria-hidden="true"></div>
    ${issue?.epigraph ? `<p class="epigraph"${verseVars(issue.epigraph.text)}>${verseHtml(issue.epigraph.text)}<span>${esc(issue.epigraph.ref)}（和合本）</span></p>` : ""}
  </div></header>`;
}
// 今日氣象 (assets/wetter.js): today's paper — the latest issue, dated today — carries a weather box on the front page
// where 接著上次 used to stand (that row moved to 往期 on 2026-11-02, so the verse keeps its place at the head of the
// paper); an archive issue, or yesterday's paper before 07:30, has none. The box is drawn hidden with its label and
// filled once the forecast is in, if it is still on the page (fetchWeather answers from its cache at once on every
// redraw after the first, and never rejects); with no forecast it stays hidden rather than showing a bare label.
// Today's paper: the latest issue, dated today — not an archive issue, nor yesterday's paper before 07:30.
const todays = (issue) => Boolean(issue) && issue.date === twNow().date && issue.date === publishedIssues()[0]?.date;
function weatherBox(issue) {
  return todays(issue) ? `<section class="wetter" hidden aria-label="今日氣象"><div class="lbl">今日氣象<span class="de">Wetter</span></div><div class="fc"></div></section>` : "";
}
function fillWeather() {
  const box = main.querySelector(".wrap > .wetter");
  if (!box) return;
  fetchWeather().then((d) => {
    const html = d ? weatherHtml(d) : "";
    if (html && box.isConnected) { box.querySelector(".fc").innerHTML = html; box.hidden = false; }
  });
}
// 今日之作 (Werk des Tages) — the darkroom: today's picture hangs on the front page as a print still developing. It is
// the hero of today's 走進一件作品 or 推開一座古蹟的門 (else any painting, hero.kind artwork, else the lead's own), shown
// as its article's card — blurred, pale and sepia at first, and sharpening a step with every article of the issue the
// reader finishes (readSet), until, with the last, it stands clear and its hairline turns gold. The picture's article
// is promoted to this card and left out of 副刊, so nothing is shown twice; when the picture is the lead's, the lead
// card itself develops. --dev (0–1) drives the CSS filter; rm.develop keeps the last level of the day so a return to
// the page develops from there (a transition in the motion block), not from scratch; the first draw of a day, and
// reduced motion, show the state as it is. Pure from state: every redraw computes it afresh.
const WERK_COLS = new Set(["artwork", "architecture"]);
function werkOf(issue, arts) {
  if (!todays(issue)) return null;
  const src = (a) => a?.hero?.src, lead = arts.find((a) => col(a.column, issue.date).group === "main");
  return arts.find((a) => WERK_COLS.has(a.column) && src(a)) || arts.find((a) => a.hero?.kind === "artwork" && src(a)) || (src(lead) ? lead : null);
}
// The level: finished articles over the articles listed (the watch items only with a brief), and the words under the card.
function develop(issue, arts, read) {
  const listed = arts.filter((a) => col(a.column, issue.date).group !== "watch" || a.brief);
  const left = listed.filter((a) => !read.has(`${issue.date}/${a.column}`)).length;
  const dev = listed.length ? (listed.length - left) / listed.length : 1;
  const kept = store.get("develop", null), was = kept?.date === issue.date ? Number(kept.dev) : null;
  store.set("develop", { date: issue.date, dev });
  return { dev, from: was !== null && !calm() && was !== dev ? was : null,
    note: left ? `顯影中・還有 ${left} 篇` : "顯影完成" };
}
// The card: the lead's markup with the darkroom classes; `from` is the level to start the transition at (fillDevelop).
function werkCard(issue, a, read, d) {
  const pm = posMark(issue.date, a, read);
  return `<a class="lead develop${d.dev >= 1 ? " developed" : ""}${pm.cls}" style="--dev:${(d.from ?? d.dev).toFixed(3)}"${d.from !== null ? ` data-dev="${d.dev.toFixed(3)}"` : ""}${pm.st ? " " + pm.st.trim() : ""} href="#/a/${issue.date}/${a.column}">${thumb(a, "ph")}${kicker(a.column, false, issue.date)}<h3>${esc(a.title)}</h3>${summary(a)}${metaLine(issue.date, a, read)}<span class="dev-note">${d.note}</span></a>`;
}
// After the draw: a card that has a level to develop to moves there on the next frame, so the filter transitions.
function fillDevelop() {
  const card = main.querySelector(".develop[data-dev]");
  if (card) requestAnimationFrame(() => requestAnimationFrame(() => { card.style.setProperty("--dev", card.dataset.dev); if (Number(card.dataset.dev) >= 1) card.classList.add("developed"); }));
}
// 排字: the verse is set a glyph at a time (style.css typeset), each code point in its own <i> numbered for its delay.
// The glyphs stay inline — not inline-block — so line breaking, hanging punctuation and text-spacing-trim are those of
// plain text and the paragraph takes exactly the same lines. --step shrinks for a long verse so the whole run lands
// within .7s whatever the length; --n lets the stylesheet time the reference and its hairline after the last glyph.
const verseHtml = (text) => Array.from(text).map((c, i) => `<i class="ch" style="--i:${i}">${esc(c)}</i>`).join("");
const verseVars = (text) => { const n = Array.from(text).length; return ` style="--n:${n};--step:${Math.min(45, Math.round(700 / Math.max(1, n - 1)))}ms"`; };

function untilText(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? `${h} 小時 ${m} 分` : `${m} 分鐘`;
}

// The front page's status line: countdown before 07:30, then what has arrived today.
function frontStatus() {
  if (isPreview()) return "預覽模式：顯示尚未在 07:30 出刊的稿件。";
  // Offline (「可能」: iOS's navigator.onLine is sometimes wrong), the front page is the issue the service worker kept.
  if (!navigator.onLine) { const d = publishedIssues()[0]?.date; return `可能離線・顯示存下的${d ? ` ${esc(fmtDate(d, "short"))}` : ""}版本，連上網路會自己更新。`; }
  const now = twNow();
  const todays = issueBy(now.date);
  const late = lateOf(now.date);
  if (late && late.state !== "done") return lateText(late, todays ? todays.articles.filter((a) => col(a.column, now.date).group !== "watch").length : 0);
  if (now.minutes < publishMin()) return `今天這期 <b>${esc(S.cfg.publish_time)}</b> 才出爐（還有 ${untilText(publishMin() - now.minutes)}），先翻上一期墊墊胃。`;
  if (!todays) return "今天這期還在印，好了會自己跳出來。先翻上一期撐一下。";
  const on = (c) => { const k = S.cfg.columns[c] || {}; return now.date >= (k.since || "") && now.date <= (k.until || "9999"); }; // between a column's start and its last day
  const expected = Object.keys(S.cfg.columns).filter((c) => S.cfg.columns[c].group === "main" && on(c)).length + (S.cfg.rotation_by_weekday?.[weekdayKey(now.date)]?.filter(on).length ?? 2);
  const got = todays.articles.filter((a) => col(a.column, now.date).group !== "watch").length;
  return got < expected ? `已經到了 ${got} 篇，剩下的在路上，別走開。` : "";
}
// Everything the latest-issue front page shows that can change while it stays open: [issue, status line].
const frontState = () => [JSON.stringify(publishedIssues()[0] || null), frontStatus()];
let shownFront = [];

// 印刷故障: the one card for anything that fails to load — the paper's data at boot, an article that is not there or not
// reachable. A German kicker (Druckfehler; Offline when the connection is the likely reason), one sentence on what
// happened, and always a way on: 再試一次 (the caller wires [data-retry]) and 回到今日. 「可能」 leaves room for iOS's
// navigator.onLine, which sometimes lies.
function errorCard({ text, offline = !navigator.onLine, retry = true, home = true } = {}) {
  return `<div class="err" role="alert"><div class="in"><span class="de">${offline ? "Offline" : "Druckfehler"}</span><h2>${offline ? "可能離線了" : "印刷故障"}</h2>
    <p>${text}</p><div class="btns">${retry ? `<button class="btn" type="button" data-retry>再試一次</button>` : ""}${home ? `<a class="btn ghost" href="#/">回到今日</a>` : ""}</div></div></div>`;
}
// Under an article that cannot be reached: the other articles of its issue the service worker has kept (sw.js CONTENT
// cache), so the reader has something to open while offline.
async function keptCards(date, column) {
  const issue = issueBy(date);
  if (!issue || !("caches" in window)) return "";
  const kept = [];
  for (const a of sortArticles(issue.articles, date)) {
    if (a.column === column) continue;
    let hit = S.articles.has(`${date}/${a.column}`);
    if (!hit) { try { hit = Boolean(await caches.match(`content/issues/${date}/${a.column}.json`)); } catch { /* no cache: nothing kept */ } }
    if (hit) kept.push(a);
  }
  if (!kept.length) return "";
  const read = readSet();
  return `<div class="sec-head"><h2>已存下的</h2><span class="de">Aufbewahrt</span><span class="note">同一期，離線可讀</span></div>${kept.map((a) => itemCard(date, a, read)).join("")}`;
}

// ——— Views ———
function viewFront(dateParam) {
  const pubs = publishedIssues();
  const issue = dateParam ? issueBy(dateParam) : pubs[0];
  if (dateParam && (!issue || !isPublished(issue.date))) { main.innerHTML = `${masthead(null)}<div class="wrap"><p class="empty">這期還沒出爐，別急。</p></div>`; return; }
  const status = dateParam ? "" : frontStatus();
  if (!dateParam) shownFront = [JSON.stringify(issue || null), status];
  if (!issue) {
    main.innerHTML = `${masthead(null)}<div class="wrap">${status ? `<div class="status">${status}</div>` : ""}<p class="empty">創刊號即將出刊。</p></div>`;
    return;
  }
  const read = readSet();
  const arts = sortArticles(issue.articles, issue.date);
  const mains = arts.filter((a) => col(a.column, issue.date).group === "main");
  const supps = arts.filter((a) => col(a.column, issue.date).group === "supplement");
  const watch = arts.filter((a) => col(a.column, issue.date).group === "watch");
  const lead = mains[0];
  const werk = werkOf(issue, arts), dev = werk ? develop(issue, arts, read) : null;
  if (werk && werk !== lead) { const i = supps.indexOf(werk); if (i >= 0) supps.splice(i, 1); }
  // Druckfrisch: the latest issue, opened for the first time on this device (rm.opened, the last 60 dates), comes off
  // the press (motion.js pressRun). Every later visit — a redraw at 07:30, iOS waking the app, a step back from an
  // article — plays only the masthead's own entrance. Not under ?preview: looking at tomorrow's issue early must not
  // spend its morning.
  const fresh = !dateParam && !isPreview() && !store.get("opened", []).includes(issue.date);
  if (fresh) store.set("opened", [...store.get("opened", []), issue.date].slice(-60));
  main.innerHTML = `${masthead(issue, fresh)}
  <div class="wrap">
    ${status ? `<div class="status">${status}</div>` : ""}
    ${dateParam ? `<div class="status">你正在讀 ${esc(fmtDate(issue.date))} 的第 ${issue.no} 期・<a href="#/">回到最新一期</a></div>` : ""}
    ${lateNote(issue.date)}
    ${prayerBox(issue)}
    ${lockMode() ? lockBar(arts, issue.date) : ""}
    ${weatherBox(issue)}
    ${werk && werk !== lead ? `<section class="werk"><div class="lbl">今日之作<span class="de">Werk des Tages</span></div>${werkCard(issue, werk, read, dev)}</section>` : ""}
    ${mains.length ? `<div class="sec-head"><h2>正刊</h2><span class="de">Hauptblatt</span><span class="note">${mains.length} 篇</span></div>` : ""}
    ${!lead ? "" : werk === lead ? werkCard(issue, lead, read, dev) : `<a class="lead${posMark(issue.date, lead, read).cls}"${posMark(issue.date, lead, read).st} href="#/a/${issue.date}/${lead.column}">${thumb(lead, "ph")}${kicker(lead.column, false, issue.date)}<h3>${esc(lead.title)}</h3>${summary(lead)}${metaLine(issue.date, lead, read)}</a>`}
    ${mains.slice(1).map((a) => itemCard(issue.date, a, read)).join("")}
    ${supps.length ? `<div class="sec-head"><h2>副刊</h2><span class="de">Feuilleton</span><span class="note">星期${esc(issue.weekday)}輪值</span></div>
      <div class="feuilleton">${supps.map((a) => itemCard(issue.date, a, read)).join("")}</div>` : ""}
    ${watch.length ? `<div class="sec-head"><h2>觀測站</h2><span class="de">Beobachtung</span><span class="note">有新進展才刊出</span></div>${watch.map((a) => itemCard(issue.date, a, read)).join("")}` : ""}
    ${!arts.some((a) => a.brief) ? "" : lockMode() && unreadIn(issue.date, arts) ? `<div class="finish lockfin">${ICON.lock}<b>還有 ${unreadIn(issue.date, arts)} 篇沒讀</b><span class="note">循序閱讀：一篇一篇讀完，今天才算數。</span></div>`
      : `<div class="finish${digestDone().has(issue.date) ? " done" : ""}">${finishInner(issue.date)}</div>`}
    ${dateParam ? "" : `<section class="gigs" id="gigs" aria-label="近期演出">${gigsSection()}</section>`}
    <footer class="colophon">
      <div class="ornament" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="latin">Gegründet im Oktober 2026</div>
      每日台灣時間 ${esc(S.cfg.publish_time)} 出刊・稿件由排程編輯撰寫並逐篇核對來源<br>圖片皆為公版、開放授權或本報原創圖解，授權見各篇文末
    </footer>
  </div>`;
  prefetch(issue);
  wireDigest(issue);
  fillWeather(); // also on every redraw of the front page (refreshFront at 07:30, a visibility replay), which redraws the box
  fillDevelop();
  if (fresh) pressRun(main.querySelector(".masthead")); else mastheadShow(main.querySelector(".masthead"));
}

// 接著上次: the articles left part-read, newest issue first, at most two — on 往期, under the title and above the
// search (moved off the front page on 2026-11-02, where 今日氣象 took its row). Read ones and (in 循序閱讀) locked ones
// are not offered; the day of any that is not from `issueDate` is named — every one's, when no issue is given.
function inProgress(read, n = 2) {
  const out = [];
  for (const k of posKeys()) {
    const [date, c] = k.split("/");
    const a = issueBy(date)?.articles.find((x) => x.column === c), p = posOf(k);
    if (!a || !p || read.has(k) || !isPublished(date) || lockedBy(date, c)) continue;
    out.push({ date, a, p });
  }
  return out.sort((x, y) => y.date.localeCompare(x.date)).slice(0, n);
}
function continueRow(issueDate, read, cls = "") {
  const rows = inProgress(read);
  if (!rows.length) return "";
  return `<nav class="continue${cls}" aria-label="接著上次"><div class="lbl">接著上次<span class="de">Fortsetzung</span></div>
    ${rows.map(({ date, a, p }) => `<a class="cont" href="#/a/${date}/${a.column}" data-jump="${date}/${a.column}" style="--p:${p}"><span class="k">${esc(col(a.column, date).name)}${date !== issueDate ? `・${esc(fmtDate(date, "short"))}` : ""}</span><b>${esc(a.title)}</b><span class="p">${pct(p)}%</span></a>`).join("")}</nav>`;
}

// 今日禱告: the day's passage (its first verse is the masthead's epigraph) and prayer, folded under the masthead.
// They come from the devotion file (columns/devotion.md), which since 2026-10-31 is no longer an article.
function prayerBox(issue) {
  const v = issue?.verse;
  if (!v?.prayer) return "";
  const verses = Array.isArray(v.verses) ? v.verses : [];
  return `<details class="prayer-box"><summary><span class="lbl">今日禱告</span>${v.ref ? `<span class="ref">${esc(v.ref)}</span>` : ""}</summary>
    ${verses.length ? `<blockquote class="verses">${verses.map((x) => `<sup>${esc(x.c ? `${x.c}:${x.n}` : String(x.n ?? ""))}</sup>${esc(x.text)}`).join("")}<cite>${esc(v.ref || "")}（和合本）</cite></blockquote>` : ""}
    <div class="prayer">${paragraphs(v.prayer)}</div></details>`;
}

// ——— Reaching the end of the front page counts the day as read (the finish line, the streak) ———
const digestDone = () => new Set(store.get("digest.done", []));
// The service worker cannot read localStorage: the finished days are mirrored into a small cache (rm-state, outside the
// shell caches sw.js clears) so a 12:30 or 21:00 reminder for a day already read through is dropped on the phone.
function syncDone() {
  try { caches.open("rm-state").then((c) => c.put("state/done", new Response(JSON.stringify(store.get("digest.done", [])), { headers: { "Content-Type": "application/json" } }))).catch(() => {}); }
  catch { /* no Cache API (a plain http:// preview) */ }
}
syncDone();
let finishSeen = null;
const unreadIn = (date, arts) => { const read = readSet(); return arts.filter((a) => !read.has(`${date}/${a.column}`)).length; };
// 循序閱讀's version of the digest bar: how many of the issue's articles have been read, not how many briefs seen.
function lockBar(arts, date) {
  if (!arts.length) return "";
  const n = arts.length, got = n - unreadIn(date, arts);
  const ring = `<span class="ring-wrap"><svg class="ring" viewBox="0 0 36 36" aria-hidden="true"><circle class="track" cx="18" cy="18" r="15.5"/><circle class="bar" cx="18" cy="18" r="15.5" pathLength="100" style="stroke-dashoffset:${100 - Math.round((got / n) * 100)}"/></svg><span class="cnt">${got}/${n}</span></span>`;
  return `<div class="digest lockbar${got === n ? " full" : ""}">${ring}<div><b>循序閱讀</b><span>${got === n ? "全部讀完了" : "讀完一篇，下一篇才解鎖"}</span></div></div>`;
}
function wireDigest(issue) {
  finishSeen?.disconnect(); finishSeen = null;
  const fin = main.querySelector(".finish:not(.lockfin)");
  // Reaching the end the first time today stamps the seal; coming back to a finished issue just shows it.
  const was = digestDone().has(issue.date);
  const ring = lockMode() ? { stop() {}, complete() {} } : digestRing(main);
  let finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    finishSeen?.disconnect();
    markDigestDone(issue.date);
    ring.complete();
    main.querySelector(".digest")?.classList.add("done", "full");
    main.querySelector(".digest .streak")?.remove();
    if (!fin || fin.classList.contains("done")) return;
    fin.classList.add("done");
    if (!was) { celebrate(fin); setTimeout(() => toast("郵票蓋好了，收在郵票冊"), 1200); } // the day's stamp (viewStamps), once the seal is down
  }
  if (fin && "IntersectionObserver" in window) {
    finishSeen = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) finish(); }, { threshold: 0.8 });
    finishSeen.observe(fin);
  }
  cleanup = () => { finishSeen?.disconnect(); finishSeen = null; ring.stop(); };
}
function markDigestDone(date) {
  const done = store.get("digest.done", []);
  if (done.includes(date)) return;
  done.push(date);
  store.set("digest.done", done.slice(-400));
  syncDone();
  const fin = main.querySelector(".finish");
  if (fin) fin.innerHTML = finishInner(date);
}
// The seal (motion.js seal) with the day on it; from a streak of two the laurel wraps round it.
function finishInner(date) {
  const run = date === publishedIssues()[0]?.date ? streak() : null;
  return `${seal(date, run?.today ? run.n : 0)}<b>讀完了，今天你贏了</b><span class="note">${esc(finishNote(date))}</span>`;
}

// ——— Keeping what you read: the streak ———
// Issues in a row whose digest was finished, counting back from the newest; today's not done yet keeps yesterday's run.
function streak() {
  const done = digestDone(), pubs = publishedIssues();
  const today = Boolean(pubs[0] && done.has(pubs[0].date));
  let n = 0;
  for (let i = today ? 0 : 1; i < pubs.length && done.has(pubs[i].date); i++) n++;
  return { n, today };
}
function finishNote(date) {
  const run = date === publishedIssues()[0]?.date ? streak() : null;
  if (!run?.today || run.n < 2) return "想深挖就點進任何一篇；沒空也沒差，重點你都拿到了。";
  return run.n >= 7 ? `連續 ${run.n} 天讀完，這已經是習慣了兄弟。` : run.n >= 3 ? `連續 ${run.n} 天讀完，穩。` : "連續 2 天讀完，開始有手感了。";
}

// Load the issue's articles in the background: they open instantly and the service worker keeps them for offline reading,
// together with each article's opening picture (the other pictures are kept once they have been seen).
function prefetch(issue) {
  const saveData = navigator.connection?.saveData;
  const run = () => issue.articles.forEach((a) => {
    article(issue.date, a.column).catch(() => {});
    if (a.hero?.src && !saveData) { const im = new Image(); im.referrerPolicy = "no-referrer"; im.src = a.hero.src; }
  });
  if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 4000 }); else setTimeout(run, 1500);
}

// When a news article was last updated after it went out, or its cut-off time.
function updatedNote(date, a) {
  if (!a.updated_at || /^\d{4}-\d{2}-\d{2}$/.test(a.updated_at)) return "";
  const t = new Date(/(Z|[+-]\d{2}:?\d{2})$/i.test(a.updated_at) ? a.updated_at : `${a.updated_at}+08:00`);
  if (Number.isNaN(t.getTime())) return "";
  const pub = new Date(`${date}T${S.cfg.publish_time || "07:30"}:00+08:00`);
  const tw = new Date(t.getTime() + 8 * 3600 * 1000);
  const hm = `${String(tw.getUTCHours()).padStart(2, "0")}:${String(tw.getUTCMinutes()).padStart(2, "0")}`;
  if (t > pub) return `<span>更新於 ${tw.getUTCMonth() + 1}/${tw.getUTCDate()} ${hm}</span>`;
  return a.column === "football" ? `<span>截稿 ${hm}</span>` : "";
}

// `my` is this route's number: if the reader has moved on while the article loads, draw nothing.
// 牙周欄的證據力 (paper.evidence): shown under the takeaway, so the reader sees how solid the conclusion is.
const evidenceOf = (a) => { const p = (a.body || []).find((b) => b?.type === "paper"); return typeof p?.evidence === "string" ? p.evidence : ""; };

// 加入 Google 日曆: the owner keeps their calendar at Google (2026-11-02), so the button is Google Calendar's own
// event-template link — opened in a new tab it lands in the Google 日曆 app (or its site) with the event filled in,
// one tap from saved. `start` is Taiwan time "YYYY-MM-DDTHH:MM"; Google takes the instants in UTC. Nothing of the
// reader's goes into the address, only the event. (The .ics files scripts/build_ics.py writes at deploy stay on the
// site for anyone on Apple's calendar: ics/gig-<id>-<date>-<HHMM>.ics, ics/football-<date>.ics, via webcal://.)
const ICON_CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="5" width="16" height="15"/><path d="M4 10h16M8 3v4M16 3v4M12 13v4M10 15h4"/></svg>';
function gcalUrl({ title, start, minutes = 120, location, description, url }) {
  const t0 = Date.parse(`${start}:00+08:00`);
  if (Number.isNaN(t0)) return "";
  const z = (ms) => new Date(ms).toISOString().replace(/[-:]|\.\d{3}/g, "");
  const p = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${z(t0)}/${z(t0 + minutes * 60000)}` });
  if (location) p.set("location", location);
  const details = [description, url].filter(Boolean).join("\n");
  if (details) p.set("details", details);
  return `https://calendar.google.com/calendar/render?${p}`;
}
const calBtn = (ev) => { const u = gcalUrl(ev); return u ? `<a class="btn ghost cal" href="${esc(u)}" target="_blank" rel="noopener">${ICON_CAL}加入 Google 日曆</a>` : ""; };
// 下一場 (football's top-level "next", SCHEMA.md; build_index.py copies it into the index entry): the fixture as the card
// shows it, or null when the field is missing or malformed, or the kickoff has passed. The kickoff is Taiwan time with
// its +08:00, so its date and clock are read straight off the string.
function fixtureOf(n) {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2})?\+08:00$/.exec(typeof n?.kickoff === "string" ? n.kickoff.trim() : "");
  if (!m || !n.opponent || !n.competition || Date.parse(`${m[1]}T${m[2]}:00+08:00`) <= Date.now()) return null;
  return { opponent: String(n.opponent), competition: String(n.competition), date: m[1], hm: m[2], venue: typeof n.venue === "string" ? n.venue : "", home: typeof n.home === "boolean" ? n.home : null };
}
const fixtureHtml = (f) => !f ? "" : `<aside class="fixture"><span class="lbl">下一場</span>
    <div class="when">週${gigWd(f.date)} ${gigDay(f.date)} ${esc(f.hm)}・${esc(f.competition)}</div>
    <div class="vs">巴薩 對 ${esc(f.opponent)}${f.home === null ? "" : f.home ? "（主場）" : "（客場）"}</div>
    <div class="foot">${f.venue ? `<span class="small">${esc(f.venue)}</span>` : ""}${calBtn({ title: `巴薩 對 ${f.opponent}（${f.competition}）`, start: `${f.date}T${f.hm}`, minutes: 115, location: f.venue,
      description: `${f.competition}${f.home === null ? "" : f.home ? "・主場" : "・客場"}`, url: location.href.replace(/\?[^#]*/, "") })}</div></aside>`;

async function viewArticle(date, column, my) {
  const wantMark = landMark; // 劃線本: the mark to land on, taken whatever this page turns out to be
  landMark = null;
  if (!isPublished(date)) { main.innerHTML = `<div class="wrap"><p class="empty">這篇還沒出爐，別偷看。</p></div>`; return; }
  const by = lockedBy(date, column);
  if (by) {
    main.innerHTML = `<div class="wrap"><div class="locked-page">${ICON.lock}<h1>這篇還鎖著</h1>
      <p>循序閱讀：先讀完〈${esc(by.title)}〉，這篇才會解鎖。</p><a class="btn" href="#/a/${date}/${esc(by.column)}">去讀〈${esc(by.title)}〉</a>
      <p class="small">想自由跳著讀，可以到<a href="#/settings">設定 → 閱讀方式</a>改回來。</p></div></div>`;
    return;
  }
  const plateNow = !plateLater; // taken once: a retry after an error plates the picture itself
  plateLater = false;
  main.innerHTML = `<div class="wrap"><p class="loading">翻到這一頁……</p></div>`;
  let a;
  try { a = await article(date, column); } catch (e) {
    // An HTTP status (util.js getJSON) means the server answered and the article is not there; anything else is the
    // connection. Offline, the issue's kept articles follow the card; 再試一次 draws this page again.
    const http = /^\d{3} /.test(e?.message || "");
    const offline = !navigator.onLine || !http;
    const name = col(column, date).name;
    const cards = offline ? await keptCards(date, column) : "";
    if (my !== routeSeq) return;
    main.innerHTML = `<div class="wrap">${errorCard({ offline, text: offline ? `目前可能離線，〈${esc(name)}〉這篇還沒存下來；連上網路後再試一次。` : `〈${esc(name)}〉這篇找不到，可能被風吹走了。` })}${cards}</div>`;
    main.querySelector("[data-retry]").onclick = (ev) => { ev.currentTarget.disabled = true; viewArticle(date, column, my); };
    return;
  }
  if (my !== routeSeq) return;
  const key = `${date}/${column}`;
  const k = col(column, date);
  const issue = issueBy(date);
  const me = issue?.articles.find((x) => x.column === column), minutes = me?.minutes;
  // 本期翻閱: this article's place in its issue (the front page's order) — for the top bar's numeral and the contents
  // sheet (openContents). Its neighbours are fetched now, so a page chosen there is already in memory and gets its slide.
  const order = issue ? sortArticles(issue.articles, date) : [], idx = order.findIndex((x) => x.column === column);
  [order[idx - 1], order[idx + 1]].forEach((n) => { if (n) article(date, n.column).catch(() => {}); });
  // The name is boxed on its own (.nm) so it is what gets the ellipsis on a narrow bar; the numeral always stays whole.
  const titleIn = `<span class="col"><span class="nm">${esc(k.name)}</span>${idx >= 0 ? `<i class="pg">・${roman(idx + 1)}／${roman(order.length)}</i>` : ""}</span><span class="art">${esc(a.title)}</span>`;
  const fix = column === "football" ? fixtureOf(me?.next ?? a.next) : null;
  main.innerHTML = `
    <div class="topbar"><div class="in">
      <a class="icon-btn" data-back href="${fromList || (issue && date !== publishedIssues()[0]?.date ? `#/issue/${date}` : "#/")}" aria-label="${fromList ? "返回" : "回到本期"}">${ICON.back}</a>
      ${idx >= 0 ? `<button class="title" type="button" data-contents aria-label="本期目錄：${esc(k.name)}，第 ${idx + 1} 篇，共 ${order.length} 篇">${titleIn}</button>` : `<div class="title">${titleIn}</div>`}
      ${canSpeak() ? `<button class="icon-btn" type="button" data-speak aria-pressed="false" aria-label="朗讀本文">${ICON.speak}</button>` : ""}
      <button class="icon-btn" type="button" data-fs aria-label="調整字級">${ICON.text}</button>
      <button class="icon-btn" type="button" data-save aria-pressed="${isSaved(key)}" aria-label="收藏">${isSaved(key) ? ICON.starOn : ICON.star}</button>
    </div><div class="progress"></div></div>
    <article class="wrap"><div class="read">
      <header class="article-head">${kicker(column, true, date)}<h1>${esc(a.title)}</h1>
        ${a.takeaway ? `<aside class="takeaway"><span class="lbl">帶得走的結論</span><p>${inline(a.takeaway)}</p>${evidenceOf(a) ? `<p class="ev"><b>證據力</b>${inline(evidenceOf(a))}</p>` : ""}</aside>` : ""}
        <p class="dek">${esc(a.dek)}</p>
        <div class="meta"><div class="row"><span>${esc(fmtDate(date))}</span>${issue ? `<span>第 ${issue.no} 期</span>` : ""}${minutes ? `<span>閱讀約 ${minutes} 分鐘</span>` : ""}${updatedNote(date, a)}</div></div>
        ${fixtureHtml(fix)}
        ${a.from_reserve && column === "football" ? `<div class="banner">今晨新聞稿未能如期完成，先刊出這篇備用專題；最新消息併入下一期。</div>` : ""}
        ${a.status === "undetermined" ? `<div class="banner">本期查核未完成，無法判定是否有新進展；這不代表沒有新消息。</div>` : ""}
        ${a.spoiler ? `<div class="banner">劇透提醒：${esc(a.spoiler)}</div>` : ""}
        ${a.disclaimer ? `<div class="banner gold">${esc(a.disclaimer)}</div>` : ""}
      </header>
      <div class="hero-slot"></div>
      <div class="toc-slot"></div>
      <div class="body"></div>
      ${a.sources?.length ? `<section class="sources"><h2>來源與閱讀範圍</h2><ol>${a.sources.map((s) => `<li>${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>` : esc(s.title)}${s.publisher ? `，${esc(s.publisher)}` : ""}${s.date ? `，${esc(s.date)}` : ""}${s.note ? ` <span>— ${inline(s.note)}</span>` : ""}</li>`).join("")}</ol>${(a.body || []).some((b) => b.type === "quote" && b.original) ? `<p class="small">外文引文未註明譯者的，都是本報自譯。</p>` : ""}</section>` : ""}
      ${placesLine(me, column)}${relatedHtml(me)}
      <div class="unlock" hidden></div>
      ${"share" in navigator ? `<div class="share"><button class="btn ghost" type="button" data-share>${ICON.share}分享這篇</button></div>` : ""}
      <div class="next"></div>
    </div></article>
    <button class="resume" type="button" hidden>從上次讀到的地方繼續</button>`;
  const hero = renderHero(a.hero);
  if (hero) {
    // 銅版畫 (style.css .plate, motion.js plate): the picture settles, is gilt-framed and drifts with the scroll — unless it
    // is a flat work, or it is still morphing in from its card, in which case transition() plates it once that has landed.
    if (hero.matches("figure.hero")) { if (FLAT.has(a.hero?.kind)) hero.classList.add("flat"); if (plateNow) hero.classList.add("plate"); }
    main.querySelector(".hero-slot").append(hero);
  }
  const body = main.querySelector(".body");
  body.append(renderBody(a));
  const firstP = body.firstElementChild;
  if (firstP && firstP.tagName === "P" && !firstP.querySelector(".tag")) firstP.classList.add("lead-p");
  // 劃線本: this article's pencil lines find their place again; one opened from the notebook is landed on (route()
  // scrolls to landTop) and glows once. A mark inside a spoiler still folded has no box to measure, so its gate(s) are
  // opened first (blocks.js) — before the contents list, which lists the opened section's headings. Then the pill that
  // offers 劃線 on a selection, taken down in cleanup.
  const marked = applyMarks(body, key), target = wantMark ? marked.get(wantMark) : null;
  for (let sp; target && (sp = target.closest(".spoiler-body[hidden]"));) { const b = sp.previousElementSibling?.querySelector("button"); if (!b) break; b.click(); }
  if (target) landTop = land(target);
  buildToc(body, main.querySelector(".toc-slot"));
  const pencilStop = pencil(body, key);
  // The top bar names the column; once the title has scrolled under it, it carries the title instead (.past).
  const topbar = main.querySelector(".topbar");
  let titleSeen = null;
  if ("IntersectionObserver" in window) {
    titleSeen = new IntersectionObserver(([e]) => topbar.classList.toggle("past", !e.isIntersecting), { rootMargin: `-${topbar.offsetHeight || 48}px 0px 0px 0px` });
    titleSeen.observe(main.querySelector(".article-head h1"));
  }
  // 接著讀: what to read next depends on where the reader came from. Out of 收藏 or a column's list, the next item down
  // that list (and the one before it as 上一篇); the list is searched for this article by key, never by a remembered
  // index. Otherwise the issue's first unread article — in 循序閱讀 that is the one this article unlocks, drawn locked
  // until it is finished — and, with the whole issue read, a small finish line instead of going round again.
  const artOf = (k) => { if (!k) return null; const [d, c] = k.split("/"); const x = issueBy(d)?.articles.find((y) => y.column === c); return x ? { date: d, a: x } : null; };
  const listOf = () => {
    if (fromList === "#/saved") return { name: "收藏", keys: saved().filter((k) => artOf(k) && isPublished(k.slice(0, 10))) };
    const m = fromList?.match(/^#\/column\/([\w-]+)/);
    if (m && S.cfg.columns[m[1]]) return { name: col(m[1], date).name, keys: publishedIssues().filter((i) => i.articles.some((x) => x.column === m[1])).map((i) => `${i.date}/${m[1]}`) };
    return null;
  };
  const card = (n, read) => { const c = itemCard(n.date, n.a, read); return n.date === date ? c : c.replace('<div class="meta-s">', `<div class="meta-s">${esc(fmtDate(n.date, "short"))}・`); };
  const issueFinish = (arts, read) => {
    const mins = arts.reduce((s, x) => s + (Number(x.minutes) || 0), 0), latest = date === publishedIssues()[0]?.date;
    return `<div class="finish done small">${seal(date, 0, true)}<b>${read.has(key) ? "本期讀完了" : "這是本期最後一篇"}</b><span class="note">${arts.length} 篇・約 ${mins} 分鐘</span>
      <div class="btns"><a class="btn ghost" href="${latest ? "#/" : `#/issue/${date}`}">${latest ? "回到今日" : "回到本期"}</a><a class="btn ghost" href="#/random">隨手翻一篇</a></div></div>`;
  };
  const drawNext = () => {
    const box = main.querySelector(".next");
    if (!box) return;
    const read = readSet(), list = listOf();
    let label = "接著讀", nxt = null, prv = null;
    if (list) {
      const i = list.keys.indexOf(key);
      if (i >= 0) { nxt = artOf(list.keys[i + 1]); prv = artOf(list.keys[i - 1]); label = `接著讀・${list.name}`; }
    }
    if (!nxt && issue) {
      const arts = sortArticles(issue.articles, date), i = arts.findIndex((x) => x.column === column);
      const u = arts.find((x) => x.column !== column && !read.has(`${date}/${x.column}`));
      if (!u) { box.innerHTML = issueFinish(arts, read); return; }
      nxt = { date, a: u }; prv ||= i > 0 ? { date, a: arts[i - 1] } : null; label = "接著讀";
    }
    box.innerHTML = nxt ? `<div class="lbl"><span>${label}</span>${prv ? `<a class="prev" href="#/a/${prv.date}/${prv.a.column}">‹ 上一篇</a>` : ""}</div>${card(nxt, read)}` : "";
  };
  drawNext();
  main.querySelector("[data-save]").onclick = (e) => {
    const on = toggleSaved(key);
    e.currentTarget.setAttribute("aria-pressed", on);
    e.currentTarget.innerHTML = on ? ICON.starOn : ICON.star;
    e.currentTarget.classList.remove("pop");
    void e.currentTarget.offsetWidth;
    e.currentTarget.classList.toggle("pop", on);
    toast(on ? "已收藏" : "已取消收藏");
  };
  main.querySelector("[data-fs]").onclick = cycleFont;
  main.querySelector("[data-share]")?.addEventListener("click", () => {
    navigator.share({ title: a.title, text: a.dek, url: location.href.replace(/\?[^#]*/, "") }).catch(() => {});
  });

  // 本期目錄: the top bar's numeral opens the issue's contents sheet (openContents); a page chosen there slides in.
  // (The sideways swipe that turned pages here was taken out on 2026-11-01 at the owner's request.)
  const turns = new AbortController(), { signal } = turns;
  main.querySelector("[data-contents]")?.addEventListener("click", () => openContents(date, order, idx), { signal });

  // Read aloud: the top-bar button starts and pauses; it stops when the reader leaves the article.
  let reader = null;
  main.querySelector("[data-back]")?.addEventListener("click", (e) => { if (fromList) { e.preventDefault(); history.back(); } });
  const speakBtn = main.querySelector("[data-speak]");
  const setSpeak = (on) => {
    if (!speakBtn) return;
    speakBtn.setAttribute("aria-pressed", String(on));
    speakBtn.setAttribute("aria-label", on ? "暫停朗讀" : "朗讀本文");
    speakBtn.innerHTML = on ? ICON.pause : ICON.speak;
  };
  speakBtn?.addEventListener("click", () => {
    reader ||= createReader(main.querySelector(".read"), { onState: (st) => setSpeak(st === "playing") });
    if (!reader.length) { toast("這篇沒有可朗讀的文字"); return; }
    reader.toggle();
  });
  // Opening a spoiler adds text and headings: rebuild the contents and the reading queue, keeping the place.
  body.addEventListener("spoiler-open", () => {
    buildToc(body, main.querySelector(".toc-slot"));
    if (!reader) return;
    const at = body.querySelector(".speaking"), was = reader.playing;
    reader.stop();
    reader = createReader(main.querySelector(".read"), { onState: (st) => setSpeak(st === "playing") });
    if (at && was) reader.playFrom(at); else if (at) reader.seek(at);
  });

  // Progress bar, read mark, and the position to come back to.
  const bar = main.querySelector(".progress");
  const posKey = `pos.${key}`;
  let saveT = 0, trail = 0;
  const ratio = () => { const h = document.documentElement, max = h.scrollHeight - h.clientHeight; return max > 0 ? h.scrollTop / max : 1; };
  // Finished = the end of the body text is on screen above the bottom bar (and the player, if open).
  const reachedEnd = () => {
    const covered = (document.querySelector(".nav")?.offsetHeight || 0) + (document.querySelector(".dock:not([hidden])")?.offsetHeight || 0);
    return body.getBoundingClientRect().bottom <= window.innerHeight - covered;
  };
  // 循序閱讀: time spent on this article (page visible), kept across visits; the end counts once it is enough.
  const lock = lockMode() && !readSet().has(key);
  const need = lockNeed(minutes);
  let dwell = lockSpent(key), tick = 0;
  const saveDwell = () => {
    if (!lock) return;
    const m = store.get("lock.t", {});
    m[key] = dwell;
    const ks = Object.keys(m);
    if (ks.length > 300) delete m[ks[0]];
    store.set("lock.t", m);
  };
  const unlockBox = main.querySelector(".unlock");
  const drawUnlock = () => {
    if (!lock) return;
    unlockBox.hidden = false;
    unlockBox.innerHTML = readSet().has(key) ? `<b>✓ 讀完了</b>下一篇解鎖了。`
      : dwell < need ? `${ICON.lock}<span>讀到文末、而且至少讀 ${lockClock(need)}，才會解鎖下一篇（已讀 ${lockClock(dwell)}，還差 ${lockClock(need - dwell)}；中途離開，時間會留著）。</span>`
      : `${ICON.lock}<span>時間夠了，讀到文末就解鎖下一篇。</span>`;
    unlockBox.classList.toggle("ok", readSet().has(key));
  };
  const finishRead = () => {
    if (readSet().has(key)) return;
    if (lock && dwell < need) return;
    markRead(key);
    drawNext(); // the finish line's wording, or the unlocked next card
    if (!lock) return;
    clearInterval(tick);
    saveDwell();
    drawUnlock();
    toast("下一篇解鎖了");
  };
  if (lock) {
    drawUnlock();
    tick = setInterval(() => {
      if (document.visibilityState !== "visible" || !body.isConnected) return;
      dwell++;
      saveDwell(); // every second: leaving the app (iOS may close it in the background) loses nothing
      drawUnlock();
      if (reachedEnd()) finishRead();
    }, 1000);
  }
  let pruned = false;
  const savePos = () => {
    if (!body.isConnected) return;
    if (reachedEnd()) { finishRead(); if (readSet().has(key)) { store.del(posKey); return; } }
    const p = ratio();
    if (p > 0.05) { saveT = Date.now(); store.set(posKey, Math.round(p * 1000) / 1000); if (!pruned) { pruned = true; prunePos(80); } }
  };
  // The reading line: drawn by the scroll itself where CSS can (style.css, animation-timeline); written here otherwise.
  const cssLine = typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: scroll()");
  const onScroll = () => {
    if (!cssLine) bar.style.width = `${Math.min(100, ratio() * 100)}%`;
    if (!resume.hidden && ratio() > 0.05) hideResume(); // the reader has moved on by themselves
    if (Date.now() - saveT > 800) savePos();
    clearTimeout(trail);
    trail = setTimeout(savePos, 250); // also keep where the gesture ended
  };
  const onHide = () => { if (document.visibilityState === "hidden") { saveDwell(); savePos(); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onHide);
  const onLeave = () => { saveDwell(); savePos(); };
  window.addEventListener("pagehide", onLeave);
  // 從上次讀到的地方繼續: offered until the reader either takes it or scrolls on past 5% by themselves — no timer.
  // Opened from the front page's 接著上次, the page lands there at once (route() scrolls to landTop) and asks nothing.
  const back = store.get(posKey, 0);
  const resume = main.querySelector(".resume");
  const topOf = (p) => { const h = document.documentElement; return p * (h.scrollHeight - h.clientHeight); };
  let resumeT = 0;
  const hideResume = () => { resume.classList.add("off"); clearTimeout(resumeT); resumeT = setTimeout(() => { resume.hidden = true; }, 400); };
  if (landKey === key) { landKey = null; if (back > 0.08) landTop = topOf(back); }
  else if (back > 0.08) {
    resume.hidden = false;
    resume.textContent = `從上次讀到的地方繼續・${pct(back)}%`;
    resume.onclick = () => { window.scrollTo({ top: topOf(back), behavior: calm() ? "auto" : "smooth" }); hideResume(); };
  }
  cleanup = () => {
    clearTimeout(trail);
    clearInterval(tick);
    saveDwell();
    savePos(); // route() runs this before drawing the next view, so the article is still on the page
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", onLeave);
    clearTimeout(resumeT);
    titleSeen?.disconnect();
    reader?.stop();
    turns.abort();
    pencilStop();
  };
  document.title = `${a.title}｜${S.cfg.title}`;
}

// 本期目錄 (Inhalt): the issue's articles in the front page's order, raised as a sheet from the top bar's title. Each row
// carries its numeral, column and title, and its minutes — or a gold tick once read; the one open has a gold bar down
// its left. A tap turns to that article, the page sliding the way its place in the order lies. In 循序閱讀 a locked
// article is listed but is no link, with the note on what unlocks it. The dark backdrop, Escape or 關上 close it;
// route() closes it as the new page draws.
function openContents(date, order, idx) {
  const issue = issueBy(date), sheet = $("#sheet");
  if (!issue || !sheet) return;
  const read = readSet();
  const rows = order.map((a, i) => {
    const by = lockedBy(date, a.column), now = i === idx, done = read.has(`${date}/${a.column}`);
    const inner = `<span class="n">${roman(i + 1)}</span><span class="t"><span class="k">${esc(col(a.column, date).name)}</span><b>${esc(a.title)}</b>${by ? `<span class="lock-note">${ICON.lock}<span>先讀完〈${esc(by.title)}〉就解鎖</span></span>` : ""}</span>${done ? `<span class="sum tick" role="img" aria-label="已讀">✓</span>` : `<span class="sum">${a.minutes ? `${a.minutes} 分` : ""}</span>`}`;
    return by ? `<li><div class="opt locked" aria-disabled="true">${inner}</div></li>`
      : `<li><a class="opt${now ? " now" : ""}" href="#/a/${date}/${esc(a.column)}" data-i="${i}"${now ? ' aria-current="page"' : ""}>${inner}</a></li>`;
  });
  sheet.innerHTML = `<div class="sheet contents"><h2>本期目錄<span class="de">Inhalt</span></h2><p class="sub">${esc(fmtDate(date))}・第 ${issue.no} 期・${order.length} 篇${lockMode() ? "・循序閱讀" : ""}</p>
    <ol class="list">${rows.join("")}</ol><div class="btns"><button class="btn ghost" type="button" data-close>關上</button></div></div>`;
  sheet.querySelector("[data-close]").onclick = () => sheet.close();
  // The backdrop is the dialog itself; a row sets the turn's direction and lets its link go on to the router.
  sheet.onclick = (e) => {
    if (e.target === sheet) { sheet.close(); return; }
    const row = e.target.closest("a.opt");
    if (!row) return;
    const i = Number(row.dataset.i);
    if (i === idx) { e.preventDefault(); sheet.close(); return; }
    turnDir = i > idx ? "left" : "right";
  };
  sheet.addEventListener("close", () => { sheet.onclick = null; }, { once: true }); // the Spotify sheets share the dialog
  sheet.showModal();
  const box = sheet.firstElementChild, now = box.querySelector(".opt.now");
  if (now) box.scrollTop = Math.max(0, now.getBoundingClientRect().top - box.getBoundingClientRect().top - (box.clientHeight - now.offsetHeight) / 2);
}

// 延伸閱讀 (Weiterlesen): up to three kin articles after an article's sources, out of the index's "related" (build_index.py,
// by similarity). Rows like the contents sheet's — column, title, the day, a gold tick once read — for articles still in
// the index and published; in 循序閱讀 a locked one is listed but is no link, with the note on what unlocks it.
function relatedHtml(entry) {
  const read = readSet();
  const rows = (Array.isArray(entry?.related) ? entry.related : []).map(({ d, c }) => ({ d, c, a: issueBy(d)?.articles.find((x) => x.column === c) }))
    .filter((x) => x.a && isPublished(x.d)).slice(0, 3).map(({ d, c, a }) => {
      const by = lockedBy(d, c), done = read.has(`${d}/${c}`);
      const inner = `<span class="t"><span class="k">${esc(col(c, d).name)}</span><b>${esc(a.title)}</b>${by ? `<span class="lock-note">${ICON.lock}<span>先讀完〈${esc(by.title)}〉就解鎖</span></span>` : ""}</span><span class="sum">${done ? `<i class="tick" role="img" aria-label="已讀">✓</i>` : ""}${esc(fmtDate(d, "short"))}</span>`;
      return by ? `<div class="rel locked" aria-disabled="true">${inner}</div>` : `<a class="rel" href="#/a/${esc(d)}/${esc(c)}">${inner}</a>`;
    });
  return rows.length ? `<section class="related"><div class="sec-head"><h2>延伸閱讀</h2><span class="de">Weiterlesen</span></div>${rows.join("")}</section>` : "";
}

// A short contents list for long articles (four or more section headings).
function buildToc(body, slot) {
  const heads = [...body.querySelectorAll(":scope > h2, :scope .spoiler-body:not([hidden]) > h2")];
  slot.innerHTML = "";
  if (heads.length < 4) return;
  slot.innerHTML = `<details class="toc"><summary>本篇段落（${heads.length}）</summary><ol>${heads.map((h, i) => `<li><button type="button" data-i="${i}">${esc(h.textContent)}</button></li>`).join("")}</ol></details>`;
  slot.querySelectorAll("button").forEach((b) => (b.onclick = () => {
    slot.querySelector("details").open = false; // collapse first, or the target moves up by the list's height
    heads[Number(b.dataset.i)].scrollIntoView({ behavior: "smooth", block: "start" });
  }));
}

// Every published article of one column, newest first.
function viewColumn(c) {
  const k = S.cfg.columns[c];
  if (!k) { main.innerHTML = `<div class="wrap"><p class="empty">沒有這個專欄。</p></div>`; return; }
  const read = readSet();
  const rows = publishedIssues().flatMap((iss) => iss.articles.filter((a) => a.column === c)
    .map((a) => itemCard(iss.date, a, read).replace('<div class="meta-s">', `<div class="meta-s">${esc(fmtDate(iss.date, "short"))}・`))).join("");
  const music = c === "music" ? `<p class="col-note">每天一首古典作品。進入文章後可在 App 內收聽，或一鍵加入你的 Spotify 歌單「${esc(S.cfg.spotify?.playlist_name || "")}」。</p>` : "";
  main.innerHTML = `<div class="wrap"><header class="page-title"><h1>${esc(k.name)}</h1><span class="de">${esc(k.latin || "")}</span>
    ${k.full ? `<p class="col-note">${esc(k.full)}</p>` : ""}${music}</header>
    ${rows || `<p class="empty">這個專欄還沒有刊出文章。</p>`}</div>`;
  document.title = `${k.name}｜${S.cfg.title}`;
  if (c === "music" && isLoggedIn()) {
    const my = routeSeq;
    defaultPlaylist().then((pl) => {
      if (!pl || my !== routeSeq) return;
      main.querySelector(".page-title")?.insertAdjacentHTML("beforeend",
        `<p class="col-note"><a class="pl-link" href="${esc(pl.url)}" target="_blank" rel="noopener">在 Spotify 開啟「${esc(pl.name)}」→</a></p>`);
    });
  }
}

// Full-text search over content/search/<YYYY-MM>.json, newest month first.
const searchCache = new Map();
let searchGen = "";
function cachedJSON(key, url) {
  if (searchGen !== (S.index.generated_at || "")) { searchCache.clear(); searchGen = S.index.generated_at || ""; }
  if (!searchCache.has(key)) {
    const p = getJSON(url);
    searchCache.set(key, p);
    p.catch(() => { if (searchCache.get(key) === p) searchCache.delete(key); }); // a failure is never remembered
  }
  return searchCache.get(key);
}
const searchMonths = () => cachedJSON("months", "content/search/months.json");
const searchMonth = (m) => cachedJSON(m, `content/search/${m}.json`);
function snippet(text, q) {
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return esc(text.slice(0, 60)) + "……";
  const a = Math.max(0, i - 28), b = Math.min(text.length, i + q.length + 40);
  return `${a > 0 ? "……" : ""}${esc(text.slice(a, i))}<mark>${esc(text.slice(i, i + q.length))}</mark>${esc(text.slice(i + q.length, b))}${b < text.length ? "……" : ""}`;
}

// ——— 近期演出: a standing list at the foot of the front page (content/concerts.json, kept daily by the 演出資訊 routine;
// editorial/columns/concerts.md). It belongs to no issue: a show drops out here once its day is over.
const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const GIG_NEAR = 45; // days ahead the front page looks; anything added in the last 3 days shows however far off
const GIG_CITIES = [["all", "全部"], ["台中", "台中"], ["north", "台北・新北"], ["高雄", "高雄"]];
const loadGigs = () => getJSON("content/concerts.json", { fresh: true }).then((g) => { S.gigs = g; }).catch(() => {});
const gigDay = (iso) => { const [, m, d] = iso.split("-").map(Number); return `${m}/${d}`; };
const gigWd = (iso) => "日一二三四五六"[new Date(`${iso}T00:00:00Z`).getUTCDay()];
const gigShow = (s) => `${gigDay(s.date)}（${gigWd(s.date)}）${s.time ? ` ${esc(s.time)}` : ""}`;
const webUrl = (u) => (/^https?:\/\//.test(u || "") ? u : "");
const inCity = (s, c) => c === "north" ? s.city === "台北" || s.city === "新北" : s.city === c;
// Events with shows still to come, soonest first. `here` is where an event is listed: its shows in city `c`, or
// (for "all") its Taichung shows if it has any, else those in the city of its next show.
function upcomingGigs(c = "all") {
  const today = twNow().date, at = (s) => `${s.date} ${s.time || ""}`;
  const events = Array.isArray(S.gigs?.events) ? S.gigs.events : [];
  // 新 marks what the latest update added — the day the list was last checked (`checked`), or failing that the newest
  // `added` on the list — so each day's newcomers wear it and yesterday's take it off (the owner's wish, 2026-11-02).
  const fresh = /^\d{4}-\d{2}-\d{2}$/.test(S.gigs?.checked || "") ? S.gigs.checked : events.reduce((m, e) => (typeof e?.added === "string" && e.added > m ? e.added : m), "");
  return events.flatMap((e) => {
    const shows = (Array.isArray(e?.shows) ? e.shows : []).filter((s) => typeof s?.date === "string" && s.date >= today)
      .sort((a, b) => at(a).localeCompare(at(b)));
    if (!shows.length || !e.title) return [];
    const tc = shows.filter((s) => s.city === "台中");
    const here = c !== "all" ? shows.filter((s) => inCity(s, c)) : tc.length ? tc : shows.filter((s) => s.city === shows[0].city);
    if (!here.length) return [];
    const rating = Math.max(0, Math.min(5, Math.round(Number(e.rating) || 0)));
    return [{ ...e, shows, here, rating, isNew: Boolean(fresh) && e.added === fresh }];
  }).sort((a, b) => at(a.here[0]).localeCompare(at(b.here[0])));
}
const stars = (n) => `<span class="stars" role="img" aria-label="值得聽 ${n} 分，滿分 5 分">${"★".repeat(n)}<i>${"★".repeat(5 - n)}</i></span>`;
const gigId = (e) => (typeof e.id === "string" && /^[\w-]+$/.test(e.id) ? e.id : "");
// One row of the list; a tap opens the event's own page (#/concert/<id>) with every show, the programme and the links.
function gigRow(e) {
  const s = e.here[0], id = gigId(e);
  const inner = `<div class="when"><b>${gigDay(s.date)}</b><span>週${gigWd(s.date)}${s.time ? ` ${esc(s.time)}` : ""}</span>${e.here.length > 1 ? `<span>共 ${e.here.length} 場</span>` : ""}</div>
    <div class="what">
      <h3>${esc(e.title)}${e.isNew ? '<span class="new">新</span>' : ""}</h3>
      <p class="where">${esc(s.city)}・${esc(s.venue)}${e.kind ? `<span class="kind">${esc(e.kind)}</span>` : ""}</p>
      ${e.why ? `<p class="why">${esc(e.why)}</p>` : ""}
      <p class="score">${stars(e.rating)}<span>值得聽 ${e.rating}</span>${e.note ? `<span class="tag">${esc(e.note)}</span>` : ""}<i class="go" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></i></p>
    </div>`;
  return id ? `<li><a class="gig" href="#/concert/${id}">${inner}</a></li>` : `<li><div class="gig">${inner}</div></li>`;
}
const RUBRIC = `<p>${stars(5)} 5：年度級。難得來台的頂尖樂團、指揮、獨奏家，或國際級的製作。</p>
      <p>${stars(4)} 4：值得專程跑一趟。</p>
      <p>${stars(3)} 3：人在台中，值得去。</p>
      <p>看的是演出者、曲目和製作本身，不看宣傳詞；2 分以下不收。場次、票價與票況以售票頁為準。</p>`;
// The event's page: why it is worth it, who plays what, every show by city with its ticket link, the sources.
async function viewConcert(id, my) {
  if (!S.gigs) {
    main.innerHTML = `<div class="wrap"><p class="empty">讀取演出資訊中……</p></div>`;
    await loadGigs();
    if (my !== undefined && my !== routeSeq) return;
  }
  const top = `<div class="topbar"><div class="in"><a class="icon-btn" data-back href="#/concerts" aria-label="返回">${ICON.back}</a><div class="title">近期演出</div></div></div>`;
  const e = upcomingGigs().find((x) => gigId(x) === id);
  if (!e) { main.innerHTML = `${top}<div class="wrap"><p class="empty">這檔演出已經下架，或找不到。<a href="#/concerts">看全部演出</a></p></div>`; wireBack(); return; }
  const link = (u, t) => (webUrl(u) ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>` : esc(t));
  const cities = [...new Set(e.shows.map((x) => x.city))];
  // Each show's ticket link and 加入行事曆 sit together at the row's end (.acts), dropping to a line of their own under
  // the venue when the row is full. The show is a two-hour entry (19:30 when the hour is not known), the venue and city
  // the place, the cast, programme and ticket note with the ticket link in the body.
  const cal = (x) => calBtn({ title: e.title, start: `${x.date}T${/^\d{2}:\d{2}$/.test(x.time || "") ? x.time : "19:30"}`, location: [x.venue, x.city].filter(Boolean).join("，"),
    description: [e.who && `演出：${e.who}`, e.program && `曲目：${e.program}`, e.note && `票況：${e.note}`].filter(Boolean).join("\n"), url: webUrl(x.tickets) });
  const row = (x) => `<li><span class="d">${gigShow(x)}</span><span class="v">${esc(x.venue)}</span><span class="acts">${webUrl(x.tickets) ? `<a class="tix" href="${esc(x.tickets)}" target="_blank" rel="noopener">售票頁</a>` : ""}${cal(x)}</span></li>`;
  const shows = cities.map((c) => `<li><b>${esc(c)}</b><ul>${e.shows.flatMap((x) => (x.city === c ? row(x) : [])).join("")}</ul></li>`).join("");
  const rows = [
    e.who && ["演出", esc(e.who)],
    e.program && ["曲目", esc(e.program)],
    e.price && ["票價", esc(e.price)],
    e.note && ["票況", esc(e.note)],
    Array.isArray(e.sources) && e.sources.length && ["資料", e.sources.map((x) => link(x?.url, x?.title || "來源")).join("、")],
  ].filter(Boolean);
  main.innerHTML = `${top}<article class="wrap gig-page">
    <header class="article-head">${e.kind ? `<div class="kicker">${esc(e.kind)}<span class="de">Spielplan</span></div>` : ""}<h1>${esc(e.title)}${e.isNew ? '<span class="new">新</span>' : ""}</h1>
      <p class="score">${stars(e.rating)}<span>值得聽 ${e.rating}</span></p>
      ${e.why ? `<p class="dek">${esc(e.why)}</p>` : ""}</header>
    <h2>場次</h2><ul class="gig-shows">${shows}</ul>
    ${rows.length ? `<dl class="gig-dl">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>` : ""}
    <details class="gig-key"><summary>值得聽怎麼評</summary>${RUBRIC}</details>
  </article>`;
  wireBack();
  document.title = `${e.title}｜${S.cfg.title}`;
}
// The page's back arrow: a step back in history when there is one inside the app, else the link's own target.
const wireBack = () => main.querySelector("[data-back]")?.addEventListener("click", (ev) => { if (routed) { ev.preventDefault(); history.back(); } });
// The front page's share: Taichung within GIG_NEAR days (at most 6), and up to 3 elsewhere; newly added ones come too.
function gigsSection() {
  const all = upcomingGigs();
  if (!all.length) return "";
  const until = addDays(twNow().date, GIG_NEAR);
  const pick = (list, n) => [...list.filter((e) => e.here[0].date <= until).slice(0, n), ...list.filter((e) => e.here[0].date > until && e.isNew).slice(0, 3)];
  const tc = pick(all.filter((e) => e.here[0].city === "台中"), 6);
  const away = pick(all.filter((e) => e.here[0].city !== "台中"), 3);
  return `<a class="sec-head link" href="#/concerts" aria-label="近期演出：全部 ${all.length} 檔"><h2>近期演出</h2><span class="de">Spielplan</span><span class="note">全部 ${all.length} 檔 →</span></a>
    ${tc.length ? `<ul class="gig-list">${tc.map((e) => gigRow(e)).join("")}</ul>` : `<p class="gig-none">接下來 ${GIG_NEAR} 天，台中沒有收錄的演出。</p>`}
    ${away.length ? `<div class="gig-city">台北・高雄<span>值得專程跑一趟的</span></div><ul class="gig-list">${away.map((e) => gigRow(e)).join("")}</ul>` : ""}`;
}
// The file arrives after the front page is drawn on a first visit: fill its slot then.
const fillGigs = () => { const box = main.querySelector("#gigs"); if (box) box.innerHTML = gigsSection(); };

async function viewConcerts(my) {
  if (!S.gigs) {
    main.innerHTML = `<div class="wrap"><p class="empty">讀取演出資訊中……</p></div>`;
    await loadGigs();
    if (my !== undefined && my !== routeSeq) return;
  }
  const checked = typeof S.gigs?.checked === "string" ? fmtDate(S.gigs.checked, "short") : "";
  const pressed = (c) => GIG_CITIES.map(([k, label]) => `<button type="button" class="chip" data-c="${k}" aria-pressed="${k === c}">${label}</button>`).join("");
  main.innerHTML = `<div class="wrap"><header class="page-title"><h1>近期演出</h1><span class="de">Spielplan</span></header>
    <p class="gig-intro">交響樂、歌劇、音樂劇與室內樂。台中優先；台北、新北、高雄只收值得專程跑一趟的。每天下午更新，演出過了就下架。</p>
    <nav class="chips" aria-label="城市"></nav><ul class="gig-list full"></ul>
    <section class="gig-key"><h2>值得聽怎麼評</h2>${RUBRIC}
      <p class="small">資料：文化部藝文活動開放資料、各場館與售票網站${checked ? `。最後查核：${esc(checked)}` : ""}。</p></section></div>`;
  const draw = (c) => {
    let last = "";
    const rows = upcomingGigs(c).map((e) => {
      const m = e.here[0].date.slice(0, 7);
      const head = m !== last ? `<li class="gig-month">${Number(m.slice(5))} 月</li>` : "";
      last = m;
      return head + gigRow(e);
    }).join("");
    main.querySelector(".chips").innerHTML = pressed(c);
    main.querySelector(".gig-list").innerHTML = rows || `<li class="gig-none">${S.gigs ? "這個城市目前沒有收錄的演出。" : "目前讀不到演出資訊（可能是離線），請稍後再試。"}</li>`;
  };
  const saved = GIG_CITIES.some(([k]) => k === store.get("gigs.city")) ? store.get("gigs.city") : "all";
  draw(saved);
  main.querySelector(".chips").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-c]");
    if (!b) return;
    store.set("gigs.city", b.dataset.c);
    draw(b.dataset.c);
    main.querySelector(`.chips [data-c="${b.dataset.c}"]`)?.focus();
  });
}

function viewArchive() {
  const pubs = publishedIssues();
  const done = digestDone();
  // Each month folds (the owner, 2026-11-02): this month open, the others shut, the reader's choice kept in
  // rm.archive.open; a search opens every month that has a hit.
  const thisYm = twNow().date.slice(0, 7), openSet = store.get("archive.open", {});
  const draw = (q) => {
    const ql = q.trim().toLowerCase();
    const months = new Map();
    for (const iss of pubs) {
      const arts = sortArticles(iss.articles, iss.date).filter((a) => !ql || `${a.title} ${a.dek} ${col(a.column, iss.date).name}`.toLowerCase().includes(ql));
      if (!arts.length) continue;
      const ym = iss.date.slice(0, 7), d = Number(iss.date.slice(8));
      months.set(ym, [...(months.get(ym) || []), `<a class="issue-row" href="#/issue/${iss.date}"><div class="d"><b>${d}</b><span>週${esc(iss.weekday)}・No.${iss.no}</span>${done.has(iss.date) ? seal(iss.date, 0, true) : ""}</div>
        <ul>${arts.map((a) => `<li><i>${esc(col(a.column, iss.date).name)}</i>${esc(a.title)}</li>`).join("")}</ul></a>`]);
    }
    const rows = [...months].map(([ym, list]) => `<details class="mon"${ql || (ym in openSet ? openSet[ym] : ym === thisYm) ? " open" : ""} data-ym="${ym}">
      <summary class="month">${Number(ym.slice(5))} 月 ${ym.slice(0, 4)}<span class="de">${esc(monDe(ym))}</span><span class="n">${list.length} 期</span></summary>${list.join("")}</details>`).join("");
    main.querySelector(".list").innerHTML = rows || `<p class="empty">${ql ? "沒有符合的文章。" : "還沒有往期。"}</p>`;
    main.querySelector(".jahr")?.toggleAttribute("hidden", Boolean(ql)); // the month makes way for the search
  };
  const chips = Object.entries(S.cfg.columns).filter(([, k]) => k.group !== "verse").map(([c, k]) => `<a class="chip" href="#/column/${esc(c)}">${esc(k.name)}</a>`).join("");
  main.innerHTML = `<div class="wrap"><header class="page-title"><h1>往期</h1><span class="de">Archiv</span>
      <a class="stamp-btn" href="#/random" aria-label="隨手翻一篇：從往期裡抽一篇沒讀過的"><b>隨手翻</b><i>Zufall</i></a></header>
    ${continueRow(null, readSet(), " in-archive")}
    <input class="search" type="search" placeholder="搜尋全文：人名、作品、主題……" aria-label="搜尋往期全文">
    <div class="hits" aria-live="polite"></div>
    <nav class="chips cols" aria-label="專欄">${chips}</nav>
    ${calendarHtml(twNow().date.slice(0, 7), pubs, done)}
    <div class="list"></div></div>`;
  // Remember which months the reader folded or opened (not the search's forced opening).
  main.querySelector(".list").addEventListener("toggle", (e) => {
    const det = e.target.closest?.("details.mon");
    if (det && !main.querySelector(".search").value.trim()) { openSet[det.dataset.ym] = det.open; store.set("archive.open", openSet); }
  }, true);
  // A tap on 接著上次 lands in the article where the reader stopped (viewArticle reads landKey).
  main.querySelectorAll(".cont[data-jump]").forEach((el) => el.addEventListener("click", () => { landKey = el.dataset.jump; }));
  const input = main.querySelector(".search"), hits = main.querySelector(".hits");
  let seq = 0, timer = 0;
  const fullText = async (q) => {
    const my = ++seq;
    if (q.length < 2) { hits.innerHTML = ""; return; }
    hits.innerHTML = `<p class="hint">搜尋全文中……</p>`;
    const found = [];
    try {
      for (const m of await searchMonths()) {
        for (const r of await searchMonth(m)) {
          if (isPublished(r.d) && `${r.t} ${r.x}`.toLowerCase().includes(q)) found.push(r);
        }
        if (my !== seq) return;
        if (found.length >= 40) break;
      }
    } catch {
      if (my === seq) hits.innerHTML = `<p class="hint">${found.length ? "部分月份暫時讀不到，" : ""}目前無法搜尋全文（可能是離線），請稍後再試。</p>`;
      if (!found.length) return;
    }
    if (my !== seq) return;
    hits.innerHTML = found.length
      ? `<div class="sec-head"><h2>全文</h2><span class="note">${found.length} 篇</span></div>${found.map((r) => `<a class="hit" href="#/a/${r.d}/${r.c}"><span class="meta-s">${esc(fmtDate(r.d, "short"))}・${esc(col(r.c, r.d).name)}</span><b>${esc(r.t)}</b><span class="snip">${snippet(r.x, q)}</span></a>`).join("")}`
      : `<p class="hint">全文沒有找到「${esc(q)}」。</p>`;
  };
  input.addEventListener("input", () => {
    draw(input.value);
    clearTimeout(timer);
    timer = setTimeout(() => fullText(input.value.trim().toLowerCase()), 280);
  });
  draw("");
}

function viewSaved() {
  // Set like the gallery (a lookbook): the shelves up top — 劃線本, 畫廊, 郵票冊, 你讀過的世界, the corners entered from
  // here only, the owner's choice of 2026-11-02 — each with its count large in Cormorant; under them the saved articles
  // as numbered rows, the column and the day in spaced small type above the title, the dek under it, the picture a square
  // at the right.
  const read = readSet();
  const rows = saved().map((k) => {
    const [date, c] = k.split("/");
    const a = issueBy(date)?.articles.find((x) => x.column === c);
    return a && isPublished(date) ? { date, a, k } : null;
  }).filter(Boolean);
  const row = ({ date, a, k }, i) => {
    const h = a.hero, th = h?.src ? `<span class="th"><img src="${esc(h.thumb || h.src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>` : "";
    return `<li><a class="sv${read.has(k) ? " read" : ""}" href="#/a/${date}/${a.column}" style="--i:${i}"><span class="no" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
      <span class="t"><span class="m"><span class="k">${esc(col(a.column, date).name)}</span><span class="d">${esc(fmtDate(date, "short"))}</span>${read.has(k) ? `<span class="tick" role="img" aria-label="讀過">✓</span>` : ""}</span><b>${esc(a.title)}</b>${a.dek ? `<span class="dek">${esc(a.dek)}</span>` : ""}</span>${th}</a></li>`;
  };
  const n = allMarks().length, g = galleryItems().length, st = stampsEarned().length, w = worldState(publishedIssues(), read).read.length;
  main.innerHTML = `<div class="wrap sammlung"><header class="page-title"><h1>收藏</h1><span class="de">Sammlung</span></header>
    <nav class="shelf" aria-label="收藏的角落">
      <a class="sh" href="#/marks" style="--i:0" aria-label="劃線本：${n} 處劃線"><span class="k">劃線本<i>Anstreichungen</i></span><b>${n}</b><span class="u">${n ? "處劃線" : "還沒有劃線"}</span></a>
      <a class="sh" href="#/gallery" style="--i:1" aria-label="畫廊：${g} 幅"><span class="k">畫廊<i>Galerie</i></span><b>${g}</b><span class="u">${g ? "幅" : "牆上還沒有畫"}</span></a>
      <a class="sh" href="#/stamps" style="--i:2" aria-label="郵票冊：${st} 張"><span class="k">郵票冊<i>Briefmarken</i></span><b>${st}</b><span class="u">${st ? "張" : "還沒有郵票"}</span></a>
      <a class="sh" href="#/world" style="--i:3" aria-label="你讀過的世界：${w} 國"><span class="k">你讀過的世界<i>Gelesene Welt</i></span><b>${w}</b><span class="u">${w ? "國" : "還沒出發"}</span></a></nav>
    ${rows.length ? `<div class="sec-head"><h2>收進來的</h2><span class="de">Gesammelt</span><span class="note">${rows.length} 篇</span></div><ol class="svl">${rows.map(row).join("")}</ol>`
      : `<p class="empty">還空空的。讀到喜歡的，按右上角的星星收進來。<br><a href="#/random">或者先隨手翻一篇 →</a></p>`}</div>`;
}

// ——— 劃線本 (Anstreichungen): every pencil line this phone holds, by article, the one marked most recently first ———
// Each line is a link into its article, landing on that mark (landMark); ✕ takes a line away and redraws.
function viewMarks() {
  const all = allMarks(), groups = new Map();
  for (const m of all) groups.set(m.key, [...(groups.get(m.key) || []), m]);
  const last = (ms) => ms[ms.length - 1].at || "";
  const rows = [...groups].sort(([, a], [, b]) => last(b).localeCompare(last(a))).map(([key, ms], i) => {
    const [date, c] = key.split("/");
    const a = issueBy(date)?.articles.find((x) => x.column === c);
    return `<a class="mk-head" href="#/a/${esc(key)}" style="--i:${i}"><span class="no" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><span class="t"><span class="m"><span class="k">${esc(col(c, date).name)}</span>${/^\d{4}-\d{2}-\d{2}$/.test(date) ? `<span class="d">${esc(fmtDate(date, "short"))}</span>` : ""}</span><b>${esc(a?.title || key)}</b></span></a>
      ${ms.map((m) => `<div class="mk"><a class="q" href="#/a/${esc(key)}" data-mark="${esc(m.id)}"><mark class="pencil">${esc(m.text)}</mark></a><button class="icon-btn x" type="button" data-del="${esc(m.id)}" aria-label="移除劃線">✕</button></div>`).join("")}`;
  }).join("");
  main.innerHTML = `<div class="wrap marks"><header class="page-title"><h1>劃線本</h1><span class="de">Anstreichungen</span></header>
    ${rows ? `<p class="col-note">讀文章時劃下的句子，${all.length} 處。只存在這支手機；點一句就回到它在文章裡的位置。</p>${rows}`
      : `<p class="empty">還沒有劃線。讀文章時選一段字，按「劃線」，就會收在這裡。</p>`}</div>`;
  main.querySelector(".marks").addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (del) { removeMark(del.dataset.del); viewMarks(); return; }
    const q = e.target.closest("[data-mark]");
    if (q) landMark = q.dataset.mark;
  });
  document.title = `劃線本｜${S.cfg.title}`;
}

// ——— 郵票冊 (Briefmarken; assets/stamps.js): a stamp for every day the paper was read to the end ———
// Every published issue has its place, by month, the newest month first and the days in order as on a calendar page.
// A day finished (digestDone) shows its stamp and opens its issue; a day missed is a dashed empty slot that stays
// empty — only today's still opens the issue, since today's paper can still be read. viewSaved counts the stamps.
const stampsEarned = () => { const done = digestDone(); return publishedIssues().filter((i) => done.has(i.date)); };
// 閱讀年鑑's four numbers and its per-column bars live at the head and foot of the album (the owner, 2026-11-02: one
// place for everything about one's reading); #/stats lands here.
function yearbook(pubs, done, read) {
  let n = 0, mins = 0;
  const perCol = new Map(); // column → [read, published, newest date]
  for (const i of pubs) for (const a of i.articles) {
    const c = perCol.get(a.column) || [0, 0, i.date];
    c[1]++;
    if (read.has(`${i.date}/${a.column}`)) { n++; mins += Number(a.minutes) || 0; c[0]++; }
    perCol.set(a.column, c);
  }
  let best = 0, run = 0;
  for (let i = pubs.length - 1; i >= 0; i--) { run = done.has(pubs[i].date) ? run + 1 : 0; best = Math.max(best, run); }
  const fav = saved().filter((k) => { const [d, c] = k.split("/"); return isPublished(d) && issueBy(d)?.articles.some((a) => a.column === c); }).length;
  const h = mins / 60, time = mins < 60 ? [String(mins), "分鐘"] : [h < 10 ? h.toFixed(1).replace(/\.0$/, "") : String(Math.round(h)), "小時"];
  const stat = (k, v, u) => `<div class="stat"><span class="k">${k}</span><b>${v}</b><span class="u">${u}</span></div>`;
  const cols = [...perCol].map(([c, [r, t, d]]) => ({ c, r, t, name: col(c, d).name })).sort((a, b) => b.r - a.r || b.t - a.t);
  return {
    stats: `<div class="stats">${stat("讀完", n, "篇")}${stat("約", time[0], time[1])}${stat("最長連續", best, "天")}${stat("收藏", fav, "篇")}</div>`,
    bars: cols.length ? `<div class="sec-head"><h2>各欄</h2><span class="de">Rubriken</span><span class="note">讀過 / 刊出</span></div>
    <div class="colbars">${cols.map((x) => `<a class="cb" href="#/column/${esc(x.c)}" style="--p:${x.t ? (x.r / x.t).toFixed(3) : 0}"><span class="n">${esc(x.name)}</span><span class="c">${x.r} / ${x.t}</span><i class="bar"><b></b></i></a>`).join("")}</div>` : "",
  };
}
function viewStamps() {
  const pubs = publishedIssues(), done = digestDone(), today = twNow().date;
  const got = stampsEarned().length, missed = pubs.filter((i) => !done.has(i.date) && i.date !== today).length;
  const yb = yearbook(pubs, done, readSet());
  const months = new Map();
  for (const i of pubs) months.set(i.date.slice(0, 7), [...(months.get(i.date.slice(0, 7)) || []), i]);
  let n = 0;
  const page = ([ym, list]) => `<div class="sec-head"><h2>${Number(ym.slice(5))} 月</h2><span class="de">${esc(monDe(ym))}</span><span class="note">${list.filter((i) => done.has(i.date)).length}／${list.length}</span></div>
    <div class="page">${list.slice().reverse().map((i) => stampHtml({ ...i, articles: sortArticles(i.articles || [], i.date) },
      { earned: done.has(i.date), open: i.date === today, href: done.has(i.date) ? `#/stamp/${i.date}` : i.date === today ? `#/issue/${i.date}` : null, i: n++ })).join("")}</div>`;
  main.innerHTML = `<div class="wrap album"><header class="page-title"><h1>郵票冊</h1><span class="de">Briefmarken</span></header>
    <p class="col-note">每天把整份報紙讀完，就蓋出那天的郵票；錯過的日子就留一格空白。</p>
    ${yb.stats}
    ${got ? `<p class="tally">集了 <b>${got}</b> 張，缺 <b>${missed}</b> 格</p>` : `<p class="empty">第一張郵票等你今天讀完。</p>`}
    ${[...months].map(page).join("")}
    ${yb.bars}</div>`;
  document.title = `郵票冊｜${S.cfg.title}`;
}

// One stamp, large (#/stamp/<date>; the owner, 2026-11-02: a stamp tapped must open the stamp, not the issue): the day's
// stamp across the page with its issue line under it and one quiet way into the issue itself. A detail page (back arrow).
function viewStamp(date) {
  const issue = issueBy(date), done = digestDone().has(date);
  const top = `<div class="topbar"><div class="in"><a class="icon-btn" data-back href="#/stamps" aria-label="返回">${ICON.back}</a><div class="title">郵票冊</div></div></div>`;
  if (!issue || !isPublished(date) || !done) { main.innerHTML = `${top}<div class="wrap"><p class="empty">這一格還沒有郵票。<a href="#/stamps">回郵票冊</a></p></div>`; wireBack(); return; }
  main.innerHTML = `${top}<div class="wrap stamp-page"><div class="big">${stampHtml({ ...issue, articles: sortArticles(issue.articles || [], date) }, { earned: true })}</div>
    <p class="line"><b>No. ${esc(issue.no)}</b><span>${esc(fmtDate(date))}・週${esc(issue.weekday || "")}</span><i>${esc(fmtDate(date, "de"))}</i></p>
    <p class="btns"><a class="btn ghost" href="#/issue/${esc(date)}">看這一期</a></p></div>`;
  wireBack();
  document.title = `郵票 No. ${issue.no}｜${S.cfg.title}`;
}

// ——— 你讀過的世界 (Gelesene Welt; assets/world.js): the countries the news column has taken the reader to ———
// Out of the index (the countries each 快訊 names) and the read set, on assets/world.svg: a country read is gilt, one in
// today's still unread 快訊 is a gold outline as the invitation, Taiwan is ringed in the robin's colour as home. Under
// the map the count and, in the lookbook's manner, a row per country, the latest first, with the issues that named it.
// The page is drawn at once and the map lands in its box when the SVG arrives (world.js keeps the text for next time);
// without it the list stands alone. viewSaved counts the countries for its entrance.
const placeName = (c) => S.index.places?.[c] || c;
function viewWorld() {
  const { read, today } = worldState(publishedIssues(), readSet());
  const row = (e, i) => `<li><a class="sv" href="#/a/${e.latest[0].date}/news" style="--i:${i}"><span class="no" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
    <span class="t"><span class="m"><span class="k">${e.n} 則</span><span class="d">${esc(fmtDate(e.latest[0].date, "short"))}</span></span><b>${esc(placeName(e.code))}</b>
    ${e.latest.map((l) => `<span class="hl">${e.latest.length > 1 ? `<span class="d">${esc(fmtDate(l.date, "short"))}</span>` : ""}${esc(l.title)}</span>`).join("")}</span></a></li>`;
  main.innerHTML = `<div class="wrap welt"><header class="page-title"><h1>你讀過的世界</h1><span class="de">Gelesene Welt</span></header>
    <p class="col-note">快訊帶你去過的地方，讀過一則，那個國家就上色。</p>
    <div class="map"></div>
    ${read.length ? `<p class="tally"><b>${read.length}</b> 個國家・最近去了${esc(read.slice(0, 3).map((e) => placeName(e.code)).join("、"))}</p><ol class="svl">${read.map(row).join("")}</ol>`
      : `<p class="empty">還沒出發。讀一則快訊，地圖就開始上色。</p>`}</div>`;
  drawMap(main.querySelector(".welt .map"), { read: read.map((e) => e.code), today });
  document.title = `你讀過的世界｜${S.cfg.title}`;
}
// 這則帶你去了: under a 快訊, the countries its items named, as the one way from an article into 你讀過的世界.
const placesLine = (entry, column) => column === "news" && Array.isArray(entry?.places) && entry.places.length
  ? `<p class="small places">這則帶你去了：<a href="#/world">${esc(entry.places.map(placeName).join("、"))}</a></p>` : "";

// ——— 閱讀年鑑 (Lesekalender): the reading record this phone holds, drawn as a calendar ———
// Everything here is read out of localStorage (read, digest.done, saved) and the issue index, so it works offline and
// says nothing about any other device.
const dayOf = (iso) => (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7; // column, Monday first
const daysIn = (ym) => { const [y, m] = ym.split("-").map(Number); return new Date(Date.UTC(y, m, 0)).getUTCDate(); };
const nextYm = (ym) => { const [y, m] = ym.split("-").map(Number); return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`; };
const monDe = (ym) => fmtDate(`${ym}-01`, "de").split(" ")[2]; // "Sonntag, 1. November 2026" → November
// One month as seven columns. A published day is a paper tile that opens its issue; a day whose finish line was reached
// carries a gold diamond and, when the day before was finished too, a gold link across to it; today is ringed in gold.
// On the archive page, under the search box (hidden while a search is on); its caption leads to the yearbook.
function calendarHtml(ym, pubs, done) {
  const today = twNow().date, byDate = new Map(pubs.map((i) => [i.date, i]));
  const first = dayOf(`${ym}-01`), cells = Array.from({ length: first }, () => "<i></i>");
  for (let d = 1; d <= daysIn(ym); d++) {
    const iso = `${ym}-${String(d).padStart(2, "0")}`, iss = byDate.get(iso), fin = done.has(iso);
    const cls = ["day", iss && "pub", fin && "done", fin && (first + d - 1) % 7 && done.has(addDays(iso, -1)) && "chain", iso === today && "today"].filter(Boolean).join(" ");
    cells.push(iss ? `<a class="${cls}" href="#/issue/${iso}" aria-label="${esc(fmtDate(iso, "short"))}・第 ${iss.no} 期${fin ? "・讀完" : ""}">${d}</a>` : `<span class="${cls}">${d}</span>`);
  }
  const got = pubs.filter((i) => i.date.startsWith(ym)), fin = got.filter((i) => done.has(i.date)).length;
  return `<section class="jahr" aria-label="本月閱讀月曆"><div class="mon"><span>${Number(ym.slice(5))} 月</span><span class="de">${esc(monDe(ym))}</span></div>
    <div class="wd" aria-hidden="true">${["一", "二", "三", "四", "五", "六", "日"].map((w) => `<span>${w}</span>`).join("")}</div>
    <div class="grid">${cells.join("")}</div>
    <div class="cap"><span>${got.length ? `本月 ${got.length} 期，讀完 ${fin} 期` : "本月還沒出刊"}</span></div></section>`;
}
// ——— 印務室 (Druckerei, assets/press.js): the owner's press room — this morning's five shifts, the reserve stock and a
// fortnight's roster, all out of the index the app holds (its press, late and stock), so it reads the same offline.
function viewPress() {
  main.innerHTML = `<div class="wrap press">${pressHtml(S.cfg, S.index, col)}</div>`;
  document.title = `印務室｜${S.cfg.title}`;
}

// ——— 畫廊 (Galerie): the opening pictures of the art, architecture and photo columns — and any other hero that is a
// work of art — hung newest first as a wall of framed plates (style.css .wall). A tile is a card: its picture morphs into
// the article's opening picture (boot's click listener takes it for lastTapped), and the way back morphs it home.
const GALLERY_COLS = new Set(["artwork", "architecture", "art", "photo"]);
const GALLERY_F = [["all", "全部", "Alle"], ["work", "作品", "Werke"], ["site", "古蹟", "Bauten"], ["other", "其他", "Übriges"]];
const galleryKind = (c) => (c === "artwork" || c === "art" ? "work" : c === "architecture" ? "site" : "other");
// Every published article with a picture for the wall; viewSaved counts them for its entrance.
const galleryItems = () => publishedIssues().flatMap((i) => i.articles.filter((a) => a.hero?.src && (GALLERY_COLS.has(a.column) || a.hero.kind === "artwork")).map((a) => ({ date: i.date, a })));
function viewGallery() {
  const all = galleryItems();
  // Set like a lookbook: every plate numbered, the column and day in spaced small type above the title, the year in
  // italic; the newest hangs alone across the page as the lead, with its dek. The thumb when there is one, as the cards;
  // width and height so the wall keeps its shape while the pictures arrive. --i staggers the entrance (style.css).
  const tile = ({ date, a }, i, lead = false) => {
    const h = a.hero, size = h.width > 0 && h.height > 0 ? ` width="${Number(h.width)}" height="${Number(h.height)}"` : "";
    return `<a class="tile${lead ? " lead" : ""}" href="#/a/${date}/${a.column}" style="--i:${i}"><span class="no" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
      <span class="mat"><img src="${esc(h.thumb || h.src)}" alt="${esc(h.alt || "")}"${size} loading="${lead ? "eager" : "lazy"}" decoding="async" referrerpolicy="no-referrer"></span>
      <span class="lbl"><span class="m"><span class="k">${esc(col(a.column, date).name)}</span><span class="d">${esc(fmtDate(date, "short"))}</span></span><b>${esc(a.title)}</b>${lead && a.dek ? `<span class="dek">${esc(a.dek)}</span>` : ""}${h.made ? `<i>${esc(String(h.made))}</i>` : ""}</span></a>`;
  };
  main.innerHTML = `<div class="wrap gallery"><header class="page-title"><h1>畫廊</h1><span class="de">Galerie</span></header>
    <p class="col-note">走進一件作品、推開一座古蹟的門，和往期畫作的頭圖，掛成一面牆。點一張，回到那篇文章。</p>
    <nav class="gtabs" aria-label="分類"></nav><div class="wall"></div></div>`;
  const draw = (f) => {
    const rows = f === "all" ? all : all.filter((x) => galleryKind(x.a.column) === f);
    main.querySelector(".gtabs").innerHTML = GALLERY_F.map(([k, label, de]) => `<button type="button" class="gt" data-f="${k}" aria-pressed="${k === f}">${label}<i>${de}</i></button>`).join("");
    // The plates are dealt into the columns in turn (not flowed down one column, then the next), so the numbers read
    // across the wall like a catalogue; two columns, three from 700px.
    const [first, ...rest] = rows, n = wide.matches ? 3 : 2, cols = Array.from({ length: n }, () => []);
    rest.forEach((x, i) => cols[i % n].push(tile(x, i + 1)));
    main.querySelector(".wall").innerHTML = first ? `${tile(first, 0, true)}<div class="cols">${cols.map((c) => `<div class="col">${c.join("")}</div>`).join("")}</div>` : `<p class="empty">牆上還沒有畫。</p>`;
  };
  const wide = matchMedia("(min-width: 700px)");
  const kept = GALLERY_F.some(([k]) => k === store.get("gallery.f")) ? store.get("gallery.f") : "all";
  draw(kept);
  const onWide = () => { if (main.querySelector(".gallery")) draw(store.get("gallery.f") || "all"); else wide.removeEventListener("change", onWide); };
  wide.addEventListener("change", onWide);
  main.querySelector(".gtabs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-f]");
    if (!b) return;
    store.set("gallery.f", b.dataset.f);
    draw(b.dataset.f);
    main.querySelector(`.gtabs [data-f="${b.dataset.f}"]`)?.focus();
  });
  document.title = `畫廊｜${S.cfg.title}`;
}

// ——— 隨手翻 (Zufallsfund): one article out of the back issues, drawn like a card ———
// The pool is every published article but the day's perishables (football, news) and the 觀測站; in 循序閱讀 a locked one
// is not offered. An unread article weighs 4, a read one 1, and either is divided by 1 + how often its column came up
// in the last five draws (random.recent), so five philosophy pieces in a row do not happen. `exclude` is the card on
// the table when 再翻一張 is pressed.
const RANDOM_SKIP = new Set(["football", "news"]);
function randomPool() {
  return publishedIssues().flatMap((i) => i.articles.filter((a) => !RANDOM_SKIP.has(a.column) && col(a.column, i.date).group !== "watch" && !lockedBy(i.date, a.column))
    .map((a) => ({ date: i.date, a, key: `${i.date}/${a.column}` })));
}
function randomPick(exclude = null) {
  const pool = randomPool().filter((x) => x.key !== exclude);
  if (!pool.length) return null;
  const read = readSet(), recent = store.get("random.recent", []);
  const w = pool.map((x) => (read.has(x.key) ? 1 : 4) / (1 + recent.filter((c) => c === x.a.column).length));
  let r = Math.random() * w.reduce((s, v) => s + v, 0), pick = pool[pool.length - 1];
  for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r < 0) { pick = pool[i]; break; } }
  store.set("random.recent", [...recent, pick.a.column].slice(-5));
  return pick;
}
// The address carries the card (#/random/<date>/<column>, written with replaceState so no route fires): back out of
// the article it opened, the reader finds the same card, now marked read, not a fresh draw.
function viewRandom(date, column) {
  const have = date && column && issueBy(date)?.articles.find((x) => x.column === column);
  let cur = have && isPublished(date) && !lockedBy(date, column) ? { date, a: have, key: `${date}/${column}` } : randomPick();
  const keep = () => { try { history.replaceState(history.state, "", `#/random/${cur.key}`); } catch { /* ignore */ } shownHash = location.hash; };
  const card = (x) => {
    const read = readSet(), issue = issueBy(x.date), k = col(x.a.column, x.date);
    return `${thumb(x.a, "ph")}<div class="kicker">${esc(k.name)}<span class="de">${esc(k.latin || "")}</span></div><h3>${esc(x.a.title)}</h3>${summary(x.a)}
      <div class="meta"><div class="row"><span>${esc(fmtDate(x.date))}</span>${issue ? `<span>第 ${issue.no} 期</span>` : ""}${x.a.minutes ? `<span>約 ${x.a.minutes} 分鐘</span>` : ""}${read.has(x.key) ? `<span class="read-mark">已讀</span>` : ""}</div></div>
      <div class="btns"><a class="btn" href="#/a/${x.key}">就讀這篇</a><button class="btn ghost" type="button" data-again>再翻一張</button></div>`;
  };
  const note = () => { const pool = randomPool(), read = readSet(), n = pool.filter((x) => !read.has(x.key)).length; return `往期可翻 ${pool.length} 篇，${n ? `${n} 篇還沒讀過，先抽它們` : "每一篇都讀過了，就隨意翻"}。`; };
  main.innerHTML = `<div class="wrap random"><header class="page-title"><h1>隨手翻</h1><span class="de">Zufallsfund</span>
      <p class="col-note">從往期裡抽一篇：沒讀過的優先，當天的球評與快訊不抽。</p></header>
    ${cur ? `<article class="card" aria-live="polite">${card(cur)}</article><p class="meta-s rnd-note">${note()}</p>` : `<p class="empty">往期還沒有可以翻的文章。</p>`}</div>`;
  if (!cur) return;
  keep();
  const el = main.querySelector(".card");
  flip(el);
  el.addEventListener("click", (e) => {
    if (!e.target.closest("[data-again]")) return;
    const next = randomPick(cur.key);
    if (!next) return;
    cur = next;
    flip(el, () => { el.innerHTML = card(cur); main.querySelector(".rnd-note").textContent = note(); keep(); });
  });
  document.title = `隨手翻｜${S.cfg.title}`;
}

function viewMusic() { viewColumn("music"); }

// ——— Spotify: each day's recording added to the reader's chosen playlist (spotify.js autoAdd) ———
// Real publication only (`?preview` must not add tomorrow's piece early); newest first.
const musicDates = () => {
  const n = twNow();
  return (S.index.issues || []).filter((i) => (i.date < n.date || (i.date === n.date && n.minutes >= publishMin())) && i.articles.some((a) => a.column === "music")).map((i) => i.date);
};
const musicOf = async (date) => (await article(date, "music")).body?.find((b) => b?.type === "music") || null;
const runAutoAdd = () => (autoPlaylist() ? autoAdd(musicDates(), musicOf) : Promise.resolve());

function autoBlock() {
  const a = autoPlaylist();
  if (!a) return `<p><b>每日自動加入</b>：選一個歌單，之後每天的古典錄音會在你打開晨報時自動加進去，不必再按「加入 Spotify 歌單」。</p>
    <div class="btns"><button class="btn" data-auto-pick>${ICON.plus}選擇歌單</button></div>`;
  const miss = Object.entries(a.miss || {}).sort();
  const earlier = musicDates().some((d) => d < a.since);
  return `<p><b>每日自動加入「${esc(a.name)}」</b>：每天的古典錄音會在你打開晨報時自動加入；沒打開的日子，下次打開會補上。</p>
    ${a.error ? `<p class="small" style="color:var(--red)">${esc(a.error)}</p>` : ""}
    ${miss.length ? `<p class="small">這幾期沒找到確定相符的錄音：${miss.map(([d, w]) => `<a href="#/a/${d}/music">${esc(fmtDate(d, "short"))}〈${esc(w)}〉</a>`).join("、")}。打開那一篇按「換一個版本」挑一次，之後會自動補進歌單。</p>` : ""}
    <div class="btns"><button class="btn ghost" data-auto-pick>換一個歌單</button>${earlier ? `<button class="btn ghost" data-auto-all>補上之前各期</button>` : ""}<button class="btn ghost" data-auto-off>停止自動加入</button></div>`;
}

const FS = ["16.5px", "18.5px", "20.5px", "23px"];
function cycleFont() {
  const cur = getComputedStyle(document.documentElement).getPropertyValue("--fs").trim();
  const next = FS[(FS.indexOf(cur) + 1) % FS.length] || FS[1];
  document.documentElement.style.setProperty("--fs", next);
  try { localStorage.setItem("rm.fs", next); } catch { /* ignore */ }
  toast(`字級：${["小", "標準", "大", "特大"][FS.indexOf(next)]}`);
}

function viewSettings() {
  const theme = (() => { try { return localStorage.getItem("rm.theme") || "auto"; } catch { return "auto"; } })();
  const fs = getComputedStyle(document.documentElement).getPropertyValue("--fs").trim();
  const rot = S.cfg.rotation_by_weekday;
  const wd = [["mon", "一"], ["tue", "二"], ["wed", "三"], ["thu", "四"], ["fri", "五"], ["sat", "六"], ["sun", "日"]];
  main.innerHTML = `<div class="wrap"><header class="page-title"><h1>設定</h1><span class="de">Einstellungen</span></header>
    <section class="set" id="push-set"><h2>出刊通知</h2><p class="small">讀取中……</p></section>
    <section class="set"><h2>字級</h2><div class="seg" data-g="fs">${FS.map((v, i) => `<button type="button" data-v="${v}" aria-pressed="${v === fs}">${["小", "標準", "大", "特大"][i]}</button>`).join("")}</div></section>
    <section class="set"><h2>閱讀方式</h2><div class="seg" data-g="lock">${[["free", "自由閱讀"], ["seq", "循序閱讀"]].map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${(v === "seq") === lockMode()}">${l}</button>`).join("")}</div>
      <p class="small">循序閱讀：每一期照首頁的順序，一次只開一篇；讀到文末、而且讀夠這篇預估時間的一半，下一篇才解鎖；中途離開，讀過的時間會留著，回來接著算。還沒解鎖的只顯示標題，摘要先藏起來，全部讀完才算讀完今天。之前讀過的照樣算數。</p></section>
    <section class="set"><h2>外觀</h2><div class="seg" data-g="theme">${[["auto", "跟隨系統"], ["light", "日間"], ["dark", "夜間"]].map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${v === theme}">${l}</button>`).join("")}</div></section>
    ${canSpeak() ? `<section class="set"><h2>朗讀速度</h2><div class="seg" data-g="rate">${RATES.map((r) => `<button type="button" data-v="${r}" aria-pressed="${r === getRate()}">${r === 1 ? "標準" : `${r}×`}</button>`).join("")}</div>
      <p>文章右上角的喇叭按鈕會用裝置內建的中文語音朗讀全文，不需網路服務。</p></section>` : ""}
    <section class="set"><h2>Spotify</h2>
      ${!hasClient() ? `<p>尚未設定 Spotify Client ID。設定後即可在 App 內收聽並一鍵加入歌單。</p>`
        : isLoggedIn() ? `<p>已連結。古典欄的「加入 Spotify 歌單」會加到你的歌單「${esc(S.cfg.spotify.playlist_name)}」或你選的歌單。</p>
          ${autoBlock()}
          <div class="btns"><button class="btn ghost" data-sp-out>中斷連結</button>${isStandaloneIOS() ? "" : `<button class="btn ghost" data-sp-code>移交給 iPhone 主畫面 App</button>`}</div>
          ${isStandaloneIOS() ? "" : `<p class="small">按「移交」會複製一組連結碼，到 iPhone 主畫面 App 的設定頁貼上即可；移交後這個瀏覽器會中斷連結。連結碼等同你的 Spotify 授權，不要傳給別人。</p>`}`
        : isStandaloneIOS() ? `<p>在主畫面 App 裡，Spotify 的登入頁常會出現「Something went wrong」。請改用連結碼：</p>
          <ol class="steps"><li>用 <b>Safari</b> 打開 <b>${esc(location.host)}</b>，到「設定」按「連結 Spotify」並同意。</li>
          <li>在 Safari 的設定頁按「移交給 iPhone 主畫面 App」。</li><li>回到這裡，把連結碼貼進下面的欄位。</li></ol>
          <div class="code-in"><input type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="貼上連結碼（RM1. 開頭）" aria-label="Spotify 連結碼"><button class="btn" data-sp-paste>連結</button></div>
          <p class="small">也可以在 Mac 上的瀏覽器移交，透過通用剪貼簿貼到 iPhone。</p>`
        : `<p>連結後，App 會依每期指定的錄音自動找到曲目，並可一鍵加入歌單。</p><div class="btns"><button class="btn" data-sp-in>${ICON.music}連結 Spotify</button></div>
          <details class="more"><summary>已有連結碼？</summary><div class="code-in"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="貼上連結碼（RM1. 開頭）" aria-label="Spotify 連結碼"><button class="btn" data-sp-paste>連結</button></div></details>`}
      <p class="small">${isWebKitITP() ? "iPhone／Safari 上內嵌播放器可能只能試聽 30 秒；完整收聽請按『在 Spotify 開啟』，加入歌單不受影響。"
        : "若播放器只播 30 秒試聽，請在同一個瀏覽器登入 open.spotify.com。"}</p>
    </section>
    <section class="set"><h2>出刊</h2><p>每日台灣時間 ${esc(S.cfg.publish_time)} 出刊。首頁最上方每天一段和合本經文，下方「今日禱告」展開可讀整段經文與禱告。正刊四欄每日刊出（諾坎普散場之後、天亮以前，世界與台灣、診間裡站得住的證據、燈暗下來，聽一首名曲）；副刊依星期輪值，每天三篇；觀測站只在有重要新進展時刊出。</p>
      <p>稿件由雲端排程編輯在凌晨分班撰寫，每篇再由另一位編輯獨立查核事實、引文與圖片授權。若某一欄到 07:05 仍未完成，會自動換上預先寫好、查核過的備稿，本報不開天窗。</p>
      <p>唯一的例外是週日：每週的 AI 額度在週日下午 3 點重置。若週日凌晨額度已經用完、當天沒能出齊，就不拿備稿充數，而是等 3 點額度重置後把整期重新寫過，大約傍晚出齊，出齊時會另外通知。首頁會說明當下進度。</p>
      <div class="table"><div class="scroll"><table class="rot"><thead><tr><th>星期</th><th>副刊</th></tr></thead><tbody>
      ${wd.map(([k, l]) => `<tr><td>${l}</td><td>${rot[k].map((c) => esc(col(c).name)).join("、")}</td></tr>`).join("")}</tbody></table></div></div>
    </section>
    <section class="set"><h2>印務室</h2><p>給社長看的：今晨五班的報到、補位與缺稿、備稿庫存、最近兩週的出勤。</p>
      <div class="btns"><a class="btn ghost" href="#/press">打開印務室</a></div></section>
    ${isWebKitITP() && !isStandaloneIOS() ? `<section class="set"><h2>放到主畫面</h2><p>在 Safari 按下方的「分享」按鈕，選「加入主畫面」，知更鳥晨間記事就會像 App 一樣全螢幕開啟，也能離線讀已下載的文章。</p></section>` : ""}
    <footer class="colophon"><div class="latin">${esc(S.cfg.subtitle)}</div>資料更新：${esc((S.index.generated_at || "").replace("T", " ").slice(0, 16))} UTC</footer></div>`;
  renderPush($("#push-set"), S.cfg, S.index.push).catch(() => {});
  // Redrawing replaces the buttons; put focus back on the one just pressed.
  const redraw = (g, v) => { viewSettings(); main.querySelector(`[data-g="${g}"] [data-v="${v}"]`)?.focus(); };
  main.querySelectorAll('[data-g="fs"] button').forEach((b) => (b.onclick = () => {
    document.documentElement.style.setProperty("--fs", b.dataset.v);
    try { localStorage.setItem("rm.fs", b.dataset.v); } catch { /* ignore */ }
    redraw("fs", b.dataset.v);
  }));
  main.querySelectorAll('[data-g="theme"] button').forEach((b) => (b.onclick = () => {
    const v = b.dataset.v;
    const swap = () => {
      try { v === "auto" ? localStorage.removeItem("rm.theme") : localStorage.setItem("rm.theme", v); } catch { /* ignore */ }
      if (v === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = v;
      themeBar(v);
      redraw("theme", v);
    };
    if (calm() || !document.startViewTransition) { swap(); return; }
    const r = b.getBoundingClientRect(), root = document.documentElement;
    root.style.setProperty("--vx", `${r.left + r.width / 2}px`);
    root.style.setProperty("--vy", `${r.top + r.height / 2}px`);
    root.classList.add("theme-vt");
    document.startViewTransition(swap).finished.catch(() => {}).finally(() => root.classList.remove("theme-vt"));
  }));
  main.querySelectorAll('[data-g="lock"] button').forEach((b) => (b.onclick = () => {
    store.set("lock.mode", b.dataset.v === "seq");
    toast(b.dataset.v === "seq" ? "循序閱讀：讀完一篇才解鎖下一篇" : "自由閱讀：想讀哪篇就讀哪篇");
    redraw("lock", b.dataset.v);
  }));
  main.querySelectorAll('[data-g="rate"] button').forEach((b) => (b.onclick = () => { setRate(Number(b.dataset.v)); redraw("rate", b.dataset.v); }));
  // Redraw only while the settings page is still the one showing.
  const auto = (p) => p.then(() => { if ((location.hash || "").startsWith("#/settings")) viewSettings(); });
  main.querySelector("[data-auto-pick]")?.addEventListener("click", async () => {
    const p = await choosePlaylist();
    if (!p) return;
    // from today's piece on; 「補上之前各期」 reaches back further
    setAutoPlaylist(p, autoPlaylist()?.since || musicDates()[0] || twNow().date);
    viewSettings();
    auto(runAutoAdd());
  });
  main.querySelector("[data-auto-all]")?.addEventListener("click", () => {
    const d = musicDates();
    setAutoPlaylist(autoPlaylist(), d[d.length - 1]);
    toast("正在補上之前各期……");
    auto(runAutoAdd());
  });
  main.querySelector("[data-auto-off]")?.addEventListener("click", () => { setAutoPlaylist(null); toast("已停止自動加入"); viewSettings(); });
  main.querySelector("[data-sp-in]")?.addEventListener("click", () => login("#/settings"));
  main.querySelector("[data-sp-out]")?.addEventListener("click", () => { logout(); viewSettings(); });
  main.querySelector("[data-sp-code]")?.addEventListener("click", async () => {
    try { await exportLinkCode(); toast("已複製連結碼；這個瀏覽器已中斷連結"); viewSettings(); }
    catch (e) { toast(e.message || "無法複製，請再試一次"); }
  });
  main.querySelector("[data-sp-paste]")?.addEventListener("click", async (e) => {
    const input = e.currentTarget.parentElement.querySelector("input");
    e.currentTarget.disabled = true;
    try { await importLinkCode(input.value); toast("已連結 Spotify"); viewSettings(); }
    catch (err) { toast(err.message); e.currentTarget.disabled = false; }
  });
}

// ——— Router ———
const NAV = [["#/", "今日", "today"], ["#/archive", "往期", "archive"], ["#/saved", "收藏", "saved"], ["#/music", "音樂", "music"], ["#/settings", "設定", "settings"]];
let cleanup = () => {};
let stopReveal = () => {};
let lastTapped = null, shownArticle = null; // the card picture just tapped, and the article on screen (for the picture morph)
let plateLater = false; // the opening picture is morphing in from its card: transition() plates it, not viewArticle
let routeSeq = 0; // bumped on every route; an older route still loading must not draw over a newer one
// Coming back out of an article lands where the reader was on the page they tapped it from; a tap on the bottom bar
// starts that page from the top. `places` holds the scroll position of each list page last left.
const places = new Map();
let shownHash = null, navTap = false, fromList = null;
let landKey = null, landTop = null; // 接著上次: the article tapped on the front page, and where in it to land
let landMark = null; // 劃線本: the id of the mark tapped there, for viewArticle to land on
let turnDir = null, turnLean = 0, turnMs = 0; // 翻頁: the way the page turns on the route about to fire (turnTo, openContents), how far the finger carried it, how long the slide takes
// The bottom-bar tab a page belongs to.
const tabOf = (h) => h.startsWith("#/column/music") ? "#/music" : h.startsWith("#/archive") || h.startsWith("#/issue") || h.startsWith("#/column") || h.startsWith("#/random") ? "#/archive" : h.startsWith("#/saved") || h.startsWith("#/marks") || h.startsWith("#/gallery") || h.startsWith("#/stamp") || h.startsWith("#/stats") || h.startsWith("#/world") || h.startsWith("#/stamps") || h.startsWith("#/world") ? "#/saved" : h.startsWith("#/music") ? "#/music" : h.startsWith("#/settings") || h.startsWith("#/press") ? "#/settings" : "#/";

let routed = 0; // in-app navigations so far: a back arrow can step back in history only after the first
let navIdx = 0, lastIdx = 0; // every history entry is stamped with a rising number, so a step back is recognisable
// Pages with a back arrow: an article, an event. Any other page keeps its scroll position for when the reader steps
// back to it (the browser's back, the back arrow, a swipe), whatever they went to in between; a tap on the bottom
// bar starts the page from the top.
const isDetail = (x) => /^#\/(a|concert|stamp)\//.test(x || "");
async function route(ev) {
  const my = ++routeSeq;
  if (ev) routed++;
  cleanup(); cleanup = () => {};
  if ($("#sheet")?.open) $("#sheet").close(); // the contents sheet (or any other) does not outlive the page it was raised from
  document.title = S.cfg.title;
  const h = location.hash || "#/";
  const leaving = isDetail(shownHash); // coming out of an article or an event
  if (shownHash && !isDetail(shownHash) && shownHash !== h) places.set(shownHash, scrollY);
  const tapped = navTap;
  navTap = false;
  const backTo = leaving ? fromList : null; // the page the article on screen was opened from
  const stamped = history.state?.i;
  const back = Boolean(ev) && Number.isInteger(stamped) && stamped < lastIdx; // landed on an entry stamped earlier
  if (!Number.isInteger(stamped)) { try { history.replaceState({ ...(history.state || {}), i: ++navIdx }, ""); } catch { /* ignore */ } }
  lastIdx = Number.isInteger(history.state?.i) ? history.state.i : lastIdx;
  const art = h.match(/^#\/a\/(\d{4}-\d{2}-\d{2})\/([\w-]+)/);
  const detail = isDetail(h);
  // The page an article (or event) was opened from; its back button returns there (history.back) instead of to the
  // issue. (From one article on to another it keeps pointing the same way: back then steps through them like a browser.)
  if (!detail || !ev || tapped) fromList = null;
  else if (!leaving) fromList = shownHash;
  shownHash = h;
  if (tapped) places.delete(h);
  const place = !detail && !tapped && (back || backTo === h) ? places.get(h) : undefined;
  const active = tabOf(detail && fromList ? fromList : h);
  $("#nav").innerHTML = NAV.map(([href, label, icon]) => `<a href="${href}" ${href === active ? 'aria-current="page"' : ""}>${ICON[icon]}<span>${label}</span></a>`).join("");
  $(".nav .in")?.style.setProperty("--i", NAV.findIndex(([href]) => href === active));
  stopReveal();
  const prev = shownArticle;
  shownArticle = art ? `${art[1]}/${art[2]}` : null;
  // Into an article already loaded: the tapped card's picture grows into its opening picture. Back out: the reverse.
  // An article still to be fetched opens without a transition (the page would freeze while it loads). The article's
  // side of the morph is the picture's frame, which clips the plated picture (motion.js transition).
  const hero = () => main.querySelector("figure.hero .frame");
  let morph = null;
  if (ev && art && isFresh(art[1], art[2])) morph = { from: lastTapped, to: hero };
  else if (ev && !art && prev) morph = { from: hero(), to: () => main.querySelector(`a[href="#/a/${prev}"] img`) };
  else if (ev && !art) morph = {};
  // A page turned within the issue (openContents): the slide in its direction instead of the cross-fade and
  // the picture morph — again only for an article already in memory.
  if (turnDir && ev && art && isFresh(art[1], art[2])) morph = { dir: turnDir, lean: turnLean, ms: turnMs };
  turnDir = null; turnLean = 0; turnMs = 0;
  lastTapped = null;
  plateLater = Boolean(art && morph?.to);
  const draw = async () => {
    await drawRoute(h, art, my);
    if (my === routeSeq) window.scrollTo(0, place ?? landTop ?? 0);
    landTop = null;
  };
  if (morph) await transition(draw, morph); else await draw();
  if (my !== routeSeq) return;
  stopReveal = reveal(main);
  // After a navigation (not on first load) start keyboard and screen-reader users at the new view.
  if (ev) main.focus({ preventScroll: true });
}

// The view for the address: an article (`art`), or one of the pages.
async function drawRoute(h, art, my) {
  let m;
  if (art) await viewArticle(art[1], art[2], my);
  else if ((m = h.match(/^#\/issue\/(\d{4}-\d{2}-\d{2})/))) viewFront(m[1]);
  else if ((m = h.match(/^#\/column\/([\w-]+)/))) viewColumn(m[1]);
  else if (h.startsWith("#/archive")) viewArchive();
  else if (h.startsWith("#/stats")) viewStamps(); // the yearbook now lives in the album
  else if (h.startsWith("#/gallery")) viewGallery();
  else if (h.startsWith("#/stamps")) viewStamps();
  else if (h.startsWith("#/stamp/")) viewStamp(h.slice(8).split("?")[0]);
  else if (h.startsWith("#/world")) viewWorld();
  else if (h.startsWith("#/press")) viewPress();
  else if ((m = h.match(/^#\/random(?:\/(\d{4}-\d{2}-\d{2})\/([\w-]+))?/))) viewRandom(m[1], m[2]);
  else if (h.startsWith("#/saved")) viewSaved();
  else if (h.startsWith("#/marks")) viewMarks();
  else if (h.startsWith("#/music")) viewMusic();
  else if (h.startsWith("#/settings")) viewSettings();
  else if ((m = h.match(/^#\/concert\/([\w-]+)/))) await viewConcert(m[1], my);
  else if (h.startsWith("#/concerts")) await viewConcerts(my);
  else viewFront();
}

// ——— Updates ———
// sw.js activates a new deploy at once (skipWaiting + clients.claim). If that happens to a page that was already
// controlled, reload once so the HTML and the modules come from the same version. A first install (no controller
// when the page loaded) needs no reload.
function watchUpdates() {
  if (!("serviceWorker" in navigator)) return;
  const had = Boolean(navigator.serviceWorker.controller);
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!had || reloading) return;
    reloading = true;
    location.reload();
  });
}

// The browser's toolbar colour (index.html's theme-color metas) follows the system scheme; a theme forced in 設定 paints it too.
const BAR = { light: "#F5F0E6", dark: "#15120E" };
function themeBar(v) {
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => { m.content = BAR[v] || BAR[/dark/.test(m.media) ? "dark" : "light"]; });
}

async function boot() {
  watchUpdates();
  themeBar(document.documentElement.dataset.theme || "auto");
  // No paper at all (config.json unreachable and not kept yet): the 印刷故障 card, and another try on the button or as
  // soon as the connection is back. There is no page to go back to yet, so no 回到今日.
  for (;;) {
    try { await loadData(); break; } catch (e) {
      console.warn("boot failed", e);
      main.innerHTML = `<div class="wrap">${errorCard({ text: "讀不到報紙資料，可能是網路的問題。", home: false })}</div>`;
      await new Promise((res) => {
        main.querySelector("[data-retry]").onclick = (ev) => { ev.currentTarget.disabled = true; res(); };
        window.addEventListener("online", res, { once: true });
      });
    }
  }
  initDock();
  const back = await handleCallback();
  if (back) location.hash = back;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual"; // the router places the page itself
  window.addEventListener("hashchange", route);
  // The bottom bar, as in an iPhone app: a tap on the page already open scrolls it back to the top; in an article,
  // a tap on its own tab goes back to the page it was opened from, where the reader left it; any other tap opens that
  // page at the top.
  $("#nav").addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href"), here = location.hash || "#/";
    if (here === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: calm() ? "auto" : "smooth" });
    } else if (here.startsWith("#/a/") && fromList && tabOf(fromList) === href) {
      e.preventDefault();
      history.back();
    } else navTap = true;
  });
  main.addEventListener("click", (e) => { lastTapped = e.target.closest("a.lead, a.item, a.tile")?.querySelector("img") || null; }, true);
  ripples();
  try { await route(); } catch (e) { console.warn("route failed", e); }
  runAutoAdd();
  // While the front page stays open: keep the countdown and the day change current, flip to the new issue at 07:30,
  // and pick up late articles. Nothing changed: leave the page alone. Only the countdown moved: rewrite that line
  // in place, so focus and the reader's position survive the minute-by-minute tick. Anything else redraws.
  const refreshFront = () => {
    if ((location.hash || "#/") !== "#/") return;
    const [issue, status] = frontState();
    if (issue === shownFront[0] && status === shownFront[1]) return;
    const line = main.querySelector(".status");
    if (issue === shownFront[0] && status && shownFront[1] && line) { line.innerHTML = status; shownFront[1] = status; }
    else viewFront();
  };
  let fetchedAt = Date.now(), hiddenAt = 0;
  const loadIndex = async () => {
    loadGigs();
    await loadLate();
    try { S.index = await getJSON("content/index.json", { fresh: true }); fetchedAt = Date.now(); } catch { /* offline: still redraw the clock */ }
  };
  const refetch = async () => {
    await loadIndex();
    refreshFront();
    runAutoAdd();
  };
  setInterval(refreshFront, 60 * 1000);
  setInterval(refetch, 5 * 60 * 1000);
  // The status line says when the paper is the kept copy (frontStatus); back online, the index is fetched again.
  window.addEventListener("offline", refreshFront);
  window.addEventListener("online", refetch);
  // Back in front (often from the 07:30 notice): articles a reserve fill added just before 07:30 are in a newer index.
  // iOS keeps a home-screen app's page alive in the background, so opening it again shows the page as it was left;
  // back on the front page after a while, still near the top, it is drawn afresh so the masthead and the cards play again.
  document.addEventListener("visibilitychange", async () => {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    clearNotices();
    const replay = hiddenAt && Date.now() - hiddenAt > 30 * 1000 && (location.hash || "#/") === "#/" && scrollY < 400;
    const stale = Date.now() - fetchedAt > 60 * 1000;
    if (stale) await loadIndex();
    if (replay) route(); else refreshFront();
    if (stale) runAutoAdd();
  });
  clearNotices();
  // A tapped notice while the app is open (sw.js notificationclick): go where it points.
  navigator.serviceWorker?.addEventListener("message", (e) => {
    if (e.data?.type !== "open") return;
    const h = new URL(e.data.url).hash || "#/";
    if ((location.hash || "#/") !== h) location.hash = h; else refetch();
  });
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
}

// A picture that cannot load (offline and not kept yet, or the image host briefly refusing) leaves a quiet placeholder
// instead of a broken-image icon. Online, it is tried once more a little later; offline, again when the connection is back.
const reloadImg = (img) => { const n = img.cloneNode(); n.classList.remove("img-off"); img.replaceWith(n); return n; };
document.addEventListener("error", (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement)) return;
  img.classList.add("img-off");
  if (navigator.onLine && !img.dataset.retried) {
    setTimeout(() => { if (img.isConnected && img.classList.contains("img-off")) reloadImg(img).dataset.retried = "1"; }, 5000);
  }
}, true);
window.addEventListener("offline", () => toast("目前離線：已存下的文章照常可讀"));
window.addEventListener("online", () => {
  toast("已恢復連線");
  document.querySelectorAll("img.img-off").forEach(reloadImg);
});

boot();
