// 知更鳥晨間記事 — app shell, routing and views.
import { $, esc, inline, store, toast, twNow, fmtDate, getJSON, ICON } from "./util.js";
import { renderBody, renderHero } from "./blocks.js";
import { initSpotify, handleCallback, initDock, login, logout, isLoggedIn, hasClient, isWebKitITP } from "./spotify.js";
import { pitchThumb } from "./pitch.js";
import { canSpeak, createReader, RATES, getRate, setRate } from "./speak.js";

const S = { cfg: null, index: null, articles: new Map() };
const main = $("#main");

// ——— Data ———
async function loadData() {
  const [cfg, index] = await Promise.all([
    getJSON("content/config.json", { fresh: true }),
    getJSON("content/index.json", { fresh: true }).catch(() => ({ issues: [] })),
  ]);
  S.cfg = cfg;
  S.index = index;
  initSpotify(cfg.spotify);
}

// `?preview` shows issues before their 07:30 release (for checking a new issue).
// Read on every call: coming back from Spotify, handleCallback restores the query after this module has loaded.
const isPreview = () => new URLSearchParams(location.search).has("preview");
const publishMin = () => { const [h, m] = (S.cfg.publish_time || "07:30").split(":").map(Number); return h * 60 + m; };
const isPublished = (date) => { if (isPreview()) return true; const n = twNow(); return date < n.date || (date === n.date && n.minutes >= publishMin()); };
const publishedIssues = () => (S.index.issues || []).filter((i) => isPublished(i.date));
const issueBy = (date) => (S.index.issues || []).find((i) => i.date === date);
const col = (c) => S.cfg.columns[c] || { name: c, group: "supplement" };

async function article(date, column) {
  const k = `${date}/${column}`;
  if (!S.articles.has(k)) S.articles.set(k, await getJSON(`content/issues/${date}/${column}.json`));
  return S.articles.get(k);
}

// Supplements follow that weekday's rotation (the settings table and the shifts use the same order).
function sortArticles(arts, date) {
  const g = { main: 0, supplement: 1, watch: 2 };
  const wk = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date(`${date}T00:00:00Z`).getUTCDay()];
  const rot = S.cfg.rotation_by_weekday?.[wk] || [];
  const pos = (c) => { const i = rot.indexOf(c); return i < 0 ? Infinity : i; };
  return [...arts].sort((a, b) => {
    const ca = col(a.column), cb = col(b.column);
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
function thumb(a, cls) {
  const h = a.hero;
  if (h?.src) return `<div class="${cls}${CONTAIN.has(h.kind) ? " contain" : ""}"><img src="${esc(cls === "ph" ? h.src : h.thumb || h.src)}" alt="${esc(h.alt || "")}" loading="lazy" decoding="async" referrerpolicy="no-referrer"></div>`;
  if (h?.diagram === "pitch") return `<div class="${cls}"><div class="diagram-th">${pitchThumb()}</div></div>`;
  if (h?.diagram) return `<div class="${cls}"><div class="diagram-th">${ICON.diagram}</div></div>`;
  return "";
}
function kicker(c, link = false) {
  const k = col(c);
  const inner = `${esc(k.name)}<span class="de">${esc(k.latin || "")}</span>`;
  return link ? `<a class="kicker" href="#/column/${esc(c)}">${inner}</a>` : `<div class="kicker">${inner}</div>`;
}
function metaLine(date, a, read) {
  const bits = [`約 ${a.minutes} 分鐘`];
  if (a.status === "undetermined") bits.unshift("查核未完成");
  if (a.from_reserve) bits.push("備稿");
  if (read.has(`${date}/${a.column}`)) bits.push('<span class="read-mark">已讀</span>');
  return `<div class="meta-s">${bits.join("・")}</div>`;
}
function itemCard(date, a, read) {
  const th = thumb(a, "th");
  return `<a class="item${th ? "" : " noimg"}" href="#/a/${date}/${a.column}"><div>${kicker(a.column)}<h3>${esc(a.title)}</h3><p>${esc(a.dek)}</p>${metaLine(date, a, read)}</div>${th}</a>`;
}

const EMBLEM = `<svg class="emblem" viewBox="0 0 64 64" aria-hidden="true">
  <rect x="3" y="3" width="58" height="58" class="e-frame" stroke-width="1.4"/><rect x="6" y="6" width="52" height="52" class="e-frame" stroke-width=".6"/>
  <g class="e-gold"><rect x="1" y="1" width="4" height="4"/><rect x="59" y="1" width="4" height="4"/><rect x="1" y="59" width="4" height="4"/><rect x="59" y="59" width="4" height="4"/></g>
  <path class="e-ink" d="M44.5 37.5 L55 30.5 L56.5 34 L46.5 41.5 Z"/><ellipse class="e-ink" cx="33" cy="37" rx="15" ry="11.5" transform="rotate(-18 33 37)"/><circle class="e-ink" cx="23" cy="25.5" r="8"/>
  <path class="e-robin" d="M17.2 19.6 C14.2 24.5 15.5 37 29.5 45.6 C25.2 40.5 24.2 34.5 26.6 29.2 C25.4 24.6 22.4 20.6 17.2 19.6 Z"/>
  <path class="e-gold" d="M15.4 24.2 L9.5 25.8 L15.6 27.4 Z"/><circle class="e-ink" cx="20.6" cy="23.4" r="1.6"/><circle class="e-paper" cx="21.1" cy="22.9" r=".55"/>
  <path class="e-wing" d="M31 33 C36 31 42 32.5 45 36.5" stroke-width="1" stroke-linecap="round"/>
  <path class="e-legs" d="M30.5 47 L29.5 52.5 M36 46 L36 52.5 M15 53 L50 53" stroke-width="1.3" stroke-linecap="round"/></svg>`;

function masthead(issue) {
  const date = issue?.date || twNow().date;
  return `<header class="masthead"><div class="wrap">
    <hr class="rule-double">
    <div class="topline"><span>Wien · Taipei</span><span>${issue ? `No. ${issue.no}` : ""}</span><span>${esc(fmtDate(date, "de").split(",")[0])}</span></div>
    <div class="checker" aria-hidden="true"></div>
    ${EMBLEM}
    <h1>${esc(S.cfg.title)}</h1>
    <div class="latin">${esc(S.cfg.subtitle)}</div>
    <div class="dateline">${esc(fmtDate(date))}${issue ? `・第 ${issue.no} 期` : ""}・${esc(S.cfg.publish_time)} 出刊</div>
    <div class="checker" aria-hidden="true"></div>
    ${issue?.epigraph ? `<p class="epigraph">${esc(issue.epigraph.text)}<span>${esc(issue.epigraph.ref)}（和合本）</span></p>` : ""}
  </div></header>`;
}

function untilText(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? `${h} 小時 ${m} 分` : `${m} 分鐘`;
}

// The front page's status line: countdown before 07:30, then what has arrived today.
function frontStatus() {
  if (isPreview()) return "預覽模式：顯示尚未在 07:30 出刊的稿件。";
  const now = twNow();
  const todays = issueBy(now.date);
  if (now.minutes < publishMin()) return `今日刊期將於台灣時間 <b>${esc(S.cfg.publish_time)}</b> 出刊（還有 ${untilText(publishMin() - now.minutes)}）。先讀上一期。`;
  if (!todays) return "今日刊期還在排版，稿件到齊後會自動出現。先讀上一期。";
  const expected = Object.values(S.cfg.columns).filter((c) => c.group === "main").length + 3;
  const got = todays.articles.filter((a) => col(a.column).group !== "watch").length;
  return got < expected ? `今日已刊出 ${got} 篇，其餘稿件陸續送達。` : "";
}
// Everything the latest-issue front page shows that can change while it stays open: [issue, status line].
const frontState = () => [JSON.stringify(publishedIssues()[0] || null), frontStatus()];
let shownFront = [];

// ——— Views ———
function viewFront(dateParam) {
  const pubs = publishedIssues();
  const issue = dateParam ? issueBy(dateParam) : pubs[0];
  if (dateParam && (!issue || !isPublished(issue.date))) { main.innerHTML = `${masthead(null)}<div class="wrap"><p class="empty">這一期尚未出刊。</p></div>`; return; }
  const status = dateParam ? "" : frontStatus();
  if (!dateParam) shownFront = [JSON.stringify(issue || null), status];
  if (!issue) {
    main.innerHTML = `${masthead(null)}<div class="wrap">${status ? `<div class="status">${status}</div>` : ""}<p class="empty">創刊號即將出刊。</p></div>`;
    return;
  }
  const read = readSet();
  const arts = sortArticles(issue.articles, issue.date);
  const mains = arts.filter((a) => col(a.column).group === "main");
  const supps = arts.filter((a) => col(a.column).group === "supplement");
  const watch = arts.filter((a) => col(a.column).group === "watch");
  const lead = mains[0];
  main.innerHTML = `${masthead(issue)}
  <div class="wrap">
    ${status ? `<div class="status">${status}</div>` : ""}
    ${dateParam ? `<div class="status">你正在讀 ${esc(fmtDate(issue.date))} 的第 ${issue.no} 期・<a href="#/">回到最新一期</a></div>` : ""}
    ${mains.length ? `<div class="sec-head"><h2>正刊</h2><span class="de">Hauptblatt</span><span class="note">${mains.length} 篇</span></div>` : ""}
    ${lead ? `<a class="lead" href="#/a/${issue.date}/${lead.column}">${thumb(lead, "ph")}${kicker(lead.column)}<h3>${esc(lead.title)}</h3><p>${esc(lead.dek)}</p>${metaLine(issue.date, lead, read)}</a>` : ""}
    ${mains.slice(1).map((a) => itemCard(issue.date, a, read)).join("")}
    ${supps.length ? `<div class="sec-head"><h2>副刊</h2><span class="de">Feuilleton</span><span class="note">星期${esc(issue.weekday)}輪值</span></div>
      <div class="feuilleton">${supps.map((a) => itemCard(issue.date, a, read)).join("")}</div>` : ""}
    ${watch.length ? `<div class="sec-head"><h2>觀測站</h2><span class="de">Beobachtung</span><span class="note">有新進展才刊出</span></div>${watch.map((a) => itemCard(issue.date, a, read)).join("")}` : ""}
    <footer class="colophon">
      <div class="ornament" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="latin">Gegründet im Oktober 2026</div>
      每日台灣時間 ${esc(S.cfg.publish_time)} 出刊・稿件由排程編輯撰寫並逐篇核對來源<br>圖片皆為公版、開放授權或本報原創圖解，授權見各篇文末
    </footer>
  </div>`;
  prefetch(issue);
}

// Load the issue's articles in the background: they open instantly and the service worker keeps them for offline reading.
function prefetch(issue) {
  const run = () => issue.articles.forEach((a) => article(issue.date, a.column).catch(() => {}));
  if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 4000 }); else setTimeout(run, 1500);
}

// When a news article was last updated after it went out, or its cut-off time.
function updatedNote(date, a) {
  if (!a.updated_at) return "";
  const t = new Date(a.updated_at);
  if (Number.isNaN(t.getTime())) return "";
  const pub = new Date(`${date}T${S.cfg.publish_time || "07:30"}:00+08:00`);
  const tw = new Date(t.getTime() + 8 * 3600 * 1000);
  const hm = `${String(tw.getUTCHours()).padStart(2, "0")}:${String(tw.getUTCMinutes()).padStart(2, "0")}`;
  if (t > pub) return `・更新於 ${tw.getUTCMonth() + 1}/${tw.getUTCDate()} ${hm}`;
  return a.column === "football" ? `・截稿 ${hm}` : "";
}

// `my` is this route's number: if the reader has moved on while the article loads, draw nothing.
async function viewArticle(date, column, my) {
  if (!isPublished(date)) { main.innerHTML = `<div class="wrap"><p class="empty">這篇文章尚未出刊。</p></div>`; return; }
  main.innerHTML = `<div class="wrap"><p class="loading">翻到這一頁……</p></div>`;
  let a;
  try { a = await article(date, column); } catch { if (my === routeSeq) main.innerHTML = `<div class="wrap"><p class="empty">找不到這篇文章。<a href="#/">回到今日</a></p></div>`; return; }
  if (my !== routeSeq) return;
  const key = `${date}/${column}`;
  const k = col(column);
  const issue = issueBy(date);
  const minutes = issue?.articles.find((x) => x.column === column)?.minutes;
  main.innerHTML = `
    <div class="topbar"><div class="in">
      <a class="icon-btn" href="${issue && date !== publishedIssues()[0]?.date ? `#/issue/${date}` : "#/"}" aria-label="回到本期">${ICON.back}</a>
      <div class="title">${esc(k.name)}</div>
      ${canSpeak() ? `<button class="icon-btn" type="button" data-speak aria-pressed="false" aria-label="朗讀本文">${ICON.speak}</button>` : ""}
      <button class="icon-btn" type="button" data-fs aria-label="調整字級">${ICON.text}</button>
      <button class="icon-btn" type="button" data-save aria-pressed="${isSaved(key)}" aria-label="收藏">${isSaved(key) ? ICON.starOn : ICON.star}</button>
    </div><div class="progress"></div></div>
    <article class="wrap"><div class="read">
      <header class="article-head">${kicker(column, true)}<h1>${esc(a.title)}</h1><p class="dek">${esc(a.dek)}</p>
        <div class="meta">${esc(fmtDate(date))}・第 ${issue?.no ?? ""} 期${minutes ? `・閱讀約 ${minutes} 分鐘` : ""}${updatedNote(date, a)}</div>
        ${a.from_reserve && column === "football" ? `<div class="banner">今晨新聞稿未能如期完成，先刊出這篇備用專題；新聞稿完成後會更新本欄。</div>` : ""}
        ${a.status === "undetermined" ? `<div class="banner">本期查核未完成，無法判定是否有新進展；這不代表沒有新消息。</div>` : ""}
        ${a.spoiler ? `<div class="banner">劇透提醒：${esc(a.spoiler)}</div>` : ""}
        ${a.disclaimer ? `<div class="banner gold">${esc(a.disclaimer)}</div>` : ""}
      </header>
      <div class="hero-slot"></div>
      <div class="toc-slot"></div>
      <div class="body"></div>
      ${a.sources?.length ? `<section class="sources"><h2>來源與閱讀範圍</h2><ol>${a.sources.map((s) => `<li>${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>` : esc(s.title)}${s.publisher ? `，${esc(s.publisher)}` : ""}${s.date ? `，${esc(s.date)}` : ""}${s.note ? ` <span>— ${inline(s.note)}</span>` : ""}</li>`).join("")}</ol></section>` : ""}
      ${"share" in navigator ? `<div class="share"><button class="btn ghost" type="button" data-share>${ICON.share}分享這篇</button></div>` : ""}
      <div class="next"></div>
    </div></article>
    <button class="resume" type="button" hidden>從上次讀到的地方繼續</button>`;
  const hero = renderHero(a.hero);
  if (hero) main.querySelector(".hero-slot").append(hero);
  const body = main.querySelector(".body");
  body.append(renderBody(a));
  const firstP = body.firstElementChild;
  if (firstP && firstP.tagName === "P" && !firstP.querySelector(".tag")) firstP.classList.add("lead-p");
  buildToc(body, main.querySelector(".toc-slot"));
  if (issue) {
    const arts = sortArticles(issue.articles, date);
    const i = arts.findIndex((x) => x.column === column);
    const nxt = arts[i + 1] || arts.find((x) => x.column !== column);
    if (nxt) main.querySelector(".next").innerHTML = `<div class="lbl">接著讀</div>${itemCard(date, nxt, readSet())}`;
  }
  main.querySelector("[data-save]").onclick = (e) => {
    const on = toggleSaved(key);
    e.currentTarget.setAttribute("aria-pressed", on);
    e.currentTarget.innerHTML = on ? ICON.starOn : ICON.star;
    toast(on ? "已收藏" : "已取消收藏");
  };
  main.querySelector("[data-fs]").onclick = cycleFont;
  main.querySelector("[data-share]")?.addEventListener("click", () => {
    navigator.share({ title: a.title, text: a.dek, url: location.href.replace(/\?[^#]*/, "") }).catch(() => {});
  });

  // Read aloud: the top-bar button starts and pauses; it stops when the reader leaves the article.
  let reader = null;
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
  // opening the spoiler adds text: start a fresh reading queue next time
  body.addEventListener("spoiler-open", () => { reader?.stop(); reader = null; });

  // Progress bar, read mark, and the position to come back to.
  const bar = main.querySelector(".progress");
  const posKey = `pos.${key}`;
  let saveT = 0;
  const onScroll = () => {
    const h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? h.scrollTop / max : 1;
    bar.style.width = `${Math.min(100, p * 100)}%`;
    if (p > 0.85) { markRead(key); store.del(posKey); }
    else if (p > 0.05 && Date.now() - saveT > 800) { saveT = Date.now(); store.set(posKey, Math.round(p * 1000) / 1000); }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  const back = store.get(posKey, 0);
  const resume = main.querySelector(".resume");
  let resumeT = 0;
  if (back > 0.08 && back < 0.85) {
    resume.hidden = false;
    resume.onclick = () => {
      const h = document.documentElement;
      window.scrollTo({ top: back * (h.scrollHeight - h.clientHeight), behavior: "smooth" });
      resume.hidden = true;
    };
    resumeT = setTimeout(() => { resume.hidden = true; }, 7000);
  }
  cleanup = () => {
    window.removeEventListener("scroll", onScroll);
    clearTimeout(resumeT);
    reader?.stop();
  };
  document.title = `${a.title}｜${S.cfg.title}`;
}

// A short contents list for long articles (four or more section headings).
function buildToc(body, slot) {
  const heads = [...body.querySelectorAll(":scope > h2")];
  if (heads.length < 4) return;
  slot.innerHTML = `<details class="toc"><summary>本篇段落（${heads.length}）</summary><ol>${heads.map((h, i) => `<li><button type="button" data-i="${i}">${esc(h.textContent)}</button></li>`).join("")}</ol></details>`;
  slot.querySelectorAll("button").forEach((b) => (b.onclick = () => {
    heads[Number(b.dataset.i)].scrollIntoView({ behavior: "smooth", block: "start" });
    slot.querySelector("details").open = false;
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
}

// Full-text search over content/search/<YYYY-MM>.json, newest month first.
const searchCache = new Map();
async function searchMonths() {
  if (!searchCache.has("months")) searchCache.set("months", await getJSON("content/search/months.json").catch(() => []));
  return searchCache.get("months");
}
async function searchMonth(m) {
  if (!searchCache.has(m)) searchCache.set(m, await getJSON(`content/search/${m}.json`).catch(() => []));
  return searchCache.get(m);
}
function snippet(text, q) {
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return esc(text.slice(0, 60)) + "……";
  const a = Math.max(0, i - 28), b = Math.min(text.length, i + q.length + 40);
  return `${a > 0 ? "……" : ""}${esc(text.slice(a, i))}<mark>${esc(text.slice(i, i + q.length))}</mark>${esc(text.slice(i + q.length, b))}${b < text.length ? "……" : ""}`;
}

function viewArchive() {
  const pubs = publishedIssues();
  const draw = (q) => {
    const ql = q.trim().toLowerCase();
    let last = "";
    const rows = pubs.map((iss) => {
      const arts = sortArticles(iss.articles, iss.date).filter((a) => !ql || `${a.title} ${a.dek} ${col(a.column).name}`.toLowerCase().includes(ql));
      if (!arts.length) return "";
      const [y, m, d] = iss.date.split("-");
      const head = `${y}-${m}` !== last ? `<div class="month">${Number(m)} 月 ${y}</div>` : "";
      last = `${y}-${m}`;
      return `${head}<a class="issue-row" href="#/issue/${iss.date}"><div class="d"><b>${Number(d)}</b><span>週${esc(iss.weekday)}・No.${iss.no}</span></div>
        <ul>${arts.map((a) => `<li><i>${esc(col(a.column).name)}</i>${esc(a.title)}</li>`).join("")}</ul></a>`;
    }).join("");
    main.querySelector(".list").innerHTML = rows || `<p class="empty">${ql ? "沒有符合的文章。" : "還沒有往期。"}</p>`;
  };
  const chips = Object.entries(S.cfg.columns).map(([c, k]) => `<a class="chip" href="#/column/${esc(c)}">${esc(k.name)}</a>`).join("");
  main.innerHTML = `<div class="wrap"><header class="page-title"><h1>往期</h1><span class="de">Archiv</span></header>
    <input class="search" type="search" placeholder="搜尋全文：人名、作品、主題……" aria-label="搜尋往期全文">
    <div class="hits" aria-live="polite"></div>
    <nav class="chips" aria-label="專欄">${chips}</nav><div class="list"></div></div>`;
  const input = main.querySelector(".search"), hits = main.querySelector(".hits");
  let seq = 0, timer = 0;
  const fullText = async (q) => {
    const my = ++seq;
    if (q.length < 2) { hits.innerHTML = ""; return; }
    hits.innerHTML = `<p class="hint">搜尋全文中……</p>`;
    const found = [];
    for (const m of await searchMonths()) {
      for (const r of await searchMonth(m)) {
        if (isPublished(r.d) && `${r.t} ${r.x}`.toLowerCase().includes(q)) found.push(r);
      }
      if (my !== seq) return;
      if (found.length >= 40) break;
    }
    if (my !== seq) return;
    hits.innerHTML = found.length
      ? `<div class="sec-head"><h2>全文</h2><span class="note">${found.length} 篇</span></div>${found.map((r) => `<a class="hit" href="#/a/${r.d}/${r.c}"><span class="meta-s">${esc(fmtDate(r.d, "short"))}・${esc(col(r.c).name)}</span><b>${esc(r.t)}</b><span class="snip">${snippet(r.x, q)}</span></a>`).join("")}`
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
  const keys = saved();
  const items = keys.map((k) => {
    const [date, c] = k.split("/");
    const a = issueBy(date)?.articles.find((x) => x.column === c);
    return a && isPublished(date) ? itemCard(date, a, readSet()).replace('<div class="meta-s">', `<div class="meta-s">${esc(fmtDate(date, "short"))}・`) : "";
  }).join("");
  main.innerHTML = `<div class="wrap"><header class="page-title"><h1>收藏</h1><span class="de">Sammlung</span></header>
    ${items || `<p class="empty">讀到喜歡的文章，按右上角的星號收進這裡。</p>`}</div>`;
}

function viewMusic() { viewColumn("music"); }

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
    <section class="set"><h2>字級</h2><div class="seg" data-g="fs">${FS.map((v, i) => `<button type="button" data-v="${v}" aria-pressed="${v === fs}">${["小", "標準", "大", "特大"][i]}</button>`).join("")}</div></section>
    <section class="set"><h2>外觀</h2><div class="seg" data-g="theme">${[["auto", "跟隨系統"], ["light", "日間"], ["dark", "夜間"]].map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${v === theme}">${l}</button>`).join("")}</div></section>
    ${canSpeak() ? `<section class="set"><h2>朗讀速度</h2><div class="seg" data-g="rate">${RATES.map((r) => `<button type="button" data-v="${r}" aria-pressed="${r === getRate()}">${r === 1 ? "標準" : `${r}×`}</button>`).join("")}</div>
      <p>文章右上角的喇叭按鈕會用裝置內建的中文語音朗讀全文，不需網路服務。</p></section>` : ""}
    <section class="set"><h2>Spotify</h2>
      ${!hasClient() ? `<p>尚未設定 Spotify Client ID。設定後即可在 App 內收聽並一鍵加入歌單。</p>`
        : isLoggedIn() ? `<p>已連結。古典欄的「加入 Spotify 歌單」會加到你的歌單「${esc(S.cfg.spotify.playlist_name)}」或你選的歌單。</p><button class="btn ghost" data-sp-out>中斷連結</button>`
        : `<p>連結後，App 會依每期指定的錄音自動找到曲目，並可一鍵加入歌單。</p><button class="btn" data-sp-in>${ICON.music}連結 Spotify</button>`}
      <p style="font-size:12.5px;color:var(--muted)">${isWebKitITP() ? "iPhone／Safari 上內嵌播放器可能只能試聽 30 秒；完整收聽請按『在 Spotify 開啟』，加入歌單不受影響。"
        : "若播放器只播 30 秒試聽，請在同一個瀏覽器登入 open.spotify.com。"}</p>
    </section>
    <section class="set"><h2>出刊</h2><p>每日台灣時間 ${esc(S.cfg.publish_time)} 出刊。正刊五欄每日刊出；副刊依星期輪值三篇；觀測站只在有重要新進展時刊出。</p>
      <div class="table"><div class="scroll"><table class="rot"><thead><tr><th>星期</th><th>副刊</th></tr></thead><tbody>
      ${wd.map(([k, l]) => `<tr><td>${l}</td><td>${rot[k].map((c) => esc(col(c).name)).join("、")}</td></tr>`).join("")}</tbody></table></div></div>
    </section>
    <footer class="colophon"><div class="latin">${esc(S.cfg.subtitle)}</div>資料更新：${esc((S.index.generated_at || "").replace("T", " ").slice(0, 16))} UTC</footer></div>`;
  // Redrawing replaces the buttons; put focus back on the one just pressed.
  const redraw = (g, v) => { viewSettings(); main.querySelector(`[data-g="${g}"] [data-v="${v}"]`)?.focus(); };
  main.querySelectorAll('[data-g="fs"] button').forEach((b) => (b.onclick = () => {
    document.documentElement.style.setProperty("--fs", b.dataset.v);
    try { localStorage.setItem("rm.fs", b.dataset.v); } catch { /* ignore */ }
    redraw("fs", b.dataset.v);
  }));
  main.querySelectorAll('[data-g="theme"] button').forEach((b) => (b.onclick = () => {
    const v = b.dataset.v;
    try { v === "auto" ? localStorage.removeItem("rm.theme") : localStorage.setItem("rm.theme", v); } catch { /* ignore */ }
    if (v === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = v;
    redraw("theme", v);
  }));
  main.querySelectorAll('[data-g="rate"] button').forEach((b) => (b.onclick = () => { setRate(Number(b.dataset.v)); redraw("rate", b.dataset.v); }));
  main.querySelector("[data-sp-in]")?.addEventListener("click", () => login("#/settings"));
  main.querySelector("[data-sp-out]")?.addEventListener("click", () => { logout(); viewSettings(); });
}

// ——— Router ———
const NAV = [["#/", "今日", "today"], ["#/archive", "往期", "archive"], ["#/saved", "收藏", "saved"], ["#/music", "音樂", "music"], ["#/settings", "設定", "settings"]];
let cleanup = () => {};
let routeSeq = 0; // bumped on every route; an older route still loading must not draw over a newer one

async function route(ev) {
  const my = ++routeSeq;
  cleanup(); cleanup = () => {};
  document.title = S.cfg.title;
  const h = location.hash || "#/";
  let m;
  const active = h.startsWith("#/column/music") ? "#/music" : h.startsWith("#/archive") || h.startsWith("#/issue") || h.startsWith("#/column") ? "#/archive" : h.startsWith("#/saved") ? "#/saved" : h.startsWith("#/music") ? "#/music" : h.startsWith("#/settings") ? "#/settings" : "#/";
  $("#nav").innerHTML = NAV.map(([href, label, icon]) => `<a href="${href}" ${href === active ? 'aria-current="page"' : ""}>${ICON[icon]}<span>${label}</span></a>`).join("");
  if ((m = h.match(/^#\/a\/(\d{4}-\d{2}-\d{2})\/([\w-]+)/))) await viewArticle(m[1], m[2], my);
  else if ((m = h.match(/^#\/issue\/(\d{4}-\d{2}-\d{2})/))) viewFront(m[1]);
  else if ((m = h.match(/^#\/column\/([\w-]+)/))) viewColumn(m[1]);
  else if (h.startsWith("#/archive")) viewArchive();
  else if (h.startsWith("#/saved")) viewSaved();
  else if (h.startsWith("#/music")) viewMusic();
  else if (h.startsWith("#/settings")) viewSettings();
  else viewFront();
  if (my !== routeSeq) return;
  window.scrollTo(0, 0);
  // After a navigation (not on first load) start keyboard and screen-reader users at the new view.
  if (ev) main.focus({ preventScroll: true });
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

async function boot() {
  watchUpdates();
  try {
    await loadData();
  } catch (e) {
    main.innerHTML = `<div class="wrap"><p class="empty">讀不到報紙資料，請確認網路後重新整理。</p></div>`;
    return;
  }
  initDock();
  const back = await handleCallback();
  if (back) location.hash = back;
  window.addEventListener("hashchange", route);
  try { await route(); } catch (e) { console.warn("route failed", e); }
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
  setInterval(refreshFront, 60 * 1000);
  setInterval(async () => {
    try { S.index = await getJSON("content/index.json", { fresh: true }); } catch { /* offline: still redraw the clock */ }
    refreshFront();
  }, 5 * 60 * 1000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshFront(); });
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
}

boot();
