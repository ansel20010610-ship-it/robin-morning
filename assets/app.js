// 知更鳥晨間記事 — app shell, routing and views.
import { $, esc, inline, store, toast, twNow, fmtDate, getJSON, ICON } from "./util.js";
import { renderBody, renderHero } from "./blocks.js";
import { initSpotify, handleCallback, initDock, login, logout, isLoggedIn, hasClient, isWebKitITP, isStandaloneIOS, exportLinkCode, importLinkCode, defaultPlaylist,
  autoPlaylist, setAutoPlaylist, choosePlaylist, autoAdd } from "./spotify.js";
import { pitchThumb } from "./pitch.js";
import { canSpeak, createReader, RATES, getRate, setRate } from "./speak.js";
import { renderPush, clearNotices } from "./notify.js";
import { calm, reveal, transition, celebrate, laurel, digestRing, swipeCard } from "./motion.js";

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
// The front page is the digest: each card carries the three-sentence brief (older articles fall back to the dek).
const summary = (a) => a.brief ? `<p class="brief">${esc(a.brief)}</p>` : `<p>${esc(a.dek)}</p>`;
function metaLine(date, a, read) {
  const bits = [a.brief ? `全文約 ${a.minutes} 分鐘` : `約 ${a.minutes} 分鐘`];
  if (a.status === "undetermined") bits.unshift("查核未完成");
  if (a.from_reserve) bits.push("備稿");
  if (read.has(`${date}/${a.column}`)) bits.push('<span class="read-mark">已讀</span>');
  return `<div class="meta-s">${bits.join("・")}</div>`;
}
function itemCard(date, a, read) {
  const th = thumb(a, "th");
  return `<a class="item${th ? "" : " noimg"}" href="#/a/${date}/${a.column}"><div>${kicker(a.column)}<h3>${esc(a.title)}</h3>${summary(a)}${metaLine(date, a, read)}</div>${th}</a>`;
}

const EMBLEM = `<svg class="emblem" viewBox="0 0 64 64" aria-hidden="true">
  <rect x="3" y="3" width="58" height="58" class="e-frame" stroke-width="1.4" pathLength="1"/><rect x="6" y="6" width="52" height="52" class="e-frame" stroke-width=".6" pathLength="1"/>
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
  if (now.minutes < publishMin()) return `今天這期 <b>${esc(S.cfg.publish_time)}</b> 才出爐（還有 ${untilText(publishMin() - now.minutes)}），先翻上一期墊墊胃。`;
  if (!todays) return "今天這期還在印，好了會自己跳出來。先翻上一期撐一下。";
  const expected = Object.values(S.cfg.columns).filter((c) => c.group === "main").length + (S.cfg.rotation_by_weekday?.[weekdayKey(now.date)]?.length ?? 2);
  const got = todays.articles.filter((a) => col(a.column).group !== "watch").length;
  return got < expected ? `已經到了 ${got} 篇，剩下的在路上，別走開。` : "";
}
// Everything the latest-issue front page shows that can change while it stays open: [issue, status line].
const frontState = () => [JSON.stringify(publishedIssues()[0] || null), frontStatus()];
let shownFront = [];

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
  const mains = arts.filter((a) => col(a.column).group === "main");
  const supps = arts.filter((a) => col(a.column).group === "supplement");
  const watch = arts.filter((a) => col(a.column).group === "watch");
  const lead = mains[0];
  main.innerHTML = `${masthead(issue)}
  <div class="wrap">
    ${status ? `<div class="status">${status}</div>` : ""}
    ${dateParam ? `<div class="status">你正在讀 ${esc(fmtDate(issue.date))} 的第 ${issue.no} 期・<a href="#/">回到最新一期</a></div>` : ""}
    ${digestBar(arts, !dateParam, digestDone().has(issue.date))}
    ${mains.length ? `<div class="sec-head"><h2>正刊</h2><span class="de">Hauptblatt</span><span class="note">${mains.length} 篇</span></div>` : ""}
    ${lead ? `<a class="lead" href="#/a/${issue.date}/${lead.column}">${thumb(lead, "ph")}${kicker(lead.column)}<h3>${esc(lead.title)}</h3>${summary(lead)}${metaLine(issue.date, lead, read)}</a>` : ""}
    ${mains.slice(1).map((a) => itemCard(issue.date, a, read)).join("")}
    ${supps.length ? `<div class="sec-head"><h2>副刊</h2><span class="de">Feuilleton</span><span class="note">星期${esc(issue.weekday)}輪值</span></div>
      <div class="feuilleton">${supps.map((a) => itemCard(issue.date, a, read)).join("")}</div>` : ""}
    ${watch.length ? `<div class="sec-head"><h2>觀測站</h2><span class="de">Beobachtung</span><span class="note">有新進展才刊出</span></div>${watch.map((a) => itemCard(issue.date, a, read)).join("")}` : ""}
    ${arts.some((a) => a.brief) ? `<div class="finish${digestDone().has(issue.date) ? " done" : ""}">${finishInner(issue.date)}</div>` : ""}
    ${dateParam ? "" : cardsPrompt()}
    ${!dateParam && issue.weekday === "日" ? weekHtml() : ""}
    <footer class="colophon">
      <div class="ornament" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="latin">Gegründet im Oktober 2026</div>
      每日台灣時間 ${esc(S.cfg.publish_time)} 出刊・稿件由排程編輯撰寫並逐篇核對來源<br>圖片皆為公版、開放授權或本報原創圖解，授權見各篇文末
    </footer>
  </div>`;
  prefetch(issue);
  wireDigest(issue);
}

// ——— The digest: read the briefs (or hear them), reach the end, done for the day ———
const DIGEST_READ = ".lead h3, .lead p.brief, .item h3, .item p.brief";
const digestDone = () => new Set(store.get("digest.done", []));
let digestReader = null, finishSeen = null;
function digestBar(arts, latest, done) {
  const n = arts.reduce((s, a) => s + (a.brief ? a.brief.length : 0), 0);
  if (!n) return "";
  const k = arts.filter((a) => a.brief).length;
  const listen = canSpeak() ? `<button type="button" class="btn ghost" data-digest aria-label="聽今日摘要">${ICON.speak}<span>聽摘要</span></button>` : "";
  const run = latest ? streak() : null;
  const more = run && !run.today && run.n >= 2 ? `<em class="streak">讀完就連續 ${run.n + 1} 天</em>` : "";
  const ring = `<span class="ring-wrap"><svg class="ring" viewBox="0 0 36 36" aria-hidden="true"><circle class="track" cx="18" cy="18" r="15.5"/><circle class="bar" cx="18" cy="18" r="15.5" pathLength="100"/></svg><span class="cnt">${done ? k : 0}/${k}</span></span>`;
  return `<div class="digest${done ? " done full" : ""}">${ring}<div><b>今日摘要${more}</b><span>一篇三句話，${Math.max(1, Math.round(n / 330))} 分鐘交差</span></div>${listen}</div>`;
}
function wireDigest(issue) {
  digestReader?.stop(); digestReader = null; finishSeen?.disconnect(); finishSeen = null;
  const btn = main.querySelector("[data-digest]");
  if (btn) btn.onclick = () => {
    digestReader ||= createReader(main, { selector: DIGEST_READ, onState: (st) => {
      btn.innerHTML = st === "playing" ? `${ICON.pause}<span>暫停</span>` : `${ICON.speak}<span>${st === "paused" ? "繼續聽" : "聽摘要"}</span>`;
      if (st === "done") finish();
    } });
    if (!digestReader.length) { toast("這期還沒有摘要，等等再來"); return; }
    digestReader.toggle();
  };
  const fin = main.querySelector(".finish");
  // Reaching the end the first time today stamps the seal; coming back to a finished issue just shows it.
  const was = digestDone().has(issue.date);
  const ring = digestRing(main);
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
    if (!was) celebrate(fin);
  }
  if (fin && "IntersectionObserver" in window) {
    finishSeen = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) finish(); }, { threshold: 0.8 });
    finishSeen.observe(fin);
  }
  cleanup = () => { digestReader?.stop(); digestReader = null; finishSeen?.disconnect(); finishSeen = null; ring.stop(); };
}
function markDigestDone(date) {
  const done = store.get("digest.done", []);
  if (done.includes(date)) return;
  done.push(date);
  store.set("digest.done", done.slice(-400));
  const fin = main.querySelector(".finish");
  if (fin) fin.innerHTML = finishInner(date);
}
function finishInner(date) {
  const run = date === publishedIssues()[0]?.date ? streak() : null;
  const seal = run?.today && run.n >= 2 ? laurel(run.n) : `<span class="tick" aria-hidden="true">✓</span>`;
  return `${seal}<b>讀完了，今天你贏了</b><span class="note">${esc(finishNote(date))}</span>`;
}

// ——— Keeping what you read: the streak, the week's seven, the perio cards ———
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

// One article from each of the last seven issues: the ones you opened first, the columns spread out, no football news
// (stale by Sunday) and no watch columns. Oldest first.
function weekSeven() {
  const read = readSet(), used = new Map();
  return publishedIssues().slice(0, 7).map((iss) => {
    const cands = iss.articles.filter((a) => a.column !== "football" && col(a.column).group !== "watch" && (a.takeaway || a.brief));
    if (!cands.length) return null;
    const score = (a) => (read.has(`${iss.date}/${a.column}`) ? -10 : 0) + (used.get(a.column) || 0) * 3 + (col(a.column).group === "main" ? 0 : 1);
    const pick = cands.reduce((b, a) => (score(a) < score(b) ? a : b));
    used.set(pick.column, (used.get(pick.column) || 0) + 1);
    return { date: iss.date, a: pick };
  }).filter(Boolean).reverse();
}
function weekHtml() {
  const items = weekSeven();
  if (items.length < 3) return "";
  return `<section class="week"><div class="sec-head"><h2>這週你帶走的 ${items.length} 件事</h2><span class="de">Wochenschau</span></div>
    <ol>${items.map(({ date, a }) => `<li><a href="#/a/${date}/${a.column}"><span class="meta-s">${esc(fmtDate(date, "short"))}・${esc(col(a.column).name)}</span><b>${esc(a.title)}</b><p>${esc(a.takeaway || a.brief)}</p></a></li>`).join("")}</ol></section>`;
}

// Perio review cards: the take-aways of earlier perio articles, three a day. A card you remembered comes back later and
// later (Leitner boxes); one you forgot comes back tomorrow. The question is the article's `quiz`, else its title.
const GAPS = [1, 3, 7, 14, 30, 60]; // days until the next showing, by box
const PER_DAY = 3;
const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
function dueCards() {
  const today = twNow().date, st = store.get("cards", {});
  const all = publishedIssues().flatMap((iss) => iss.date < today ? iss.articles.filter((a) => a.column === "perio" && a.takeaway).map((a) => ({ date: iss.date, a, s: st[iss.date] })) : []);
  const due = all.filter((c) => c.s && c.s.due <= today).sort((x, y) => x.s.due.localeCompare(y.s.due) || x.date.localeCompare(y.date));
  return [...due, ...all.filter((c) => !c.s).sort((x, y) => x.date.localeCompare(y.date))];
}
const cardsToday = () => { const t = store.get("cards.today", {}); return t.date === twNow().date ? t.n : 0; };
function grade(date, ok) {
  const st = store.get("cards", {});
  const box = ok ? Math.min((st[date]?.box ?? 0) + 1, GAPS.length - 1) : 0;
  st[date] = { box, due: addDays(twNow().date, ok ? GAPS[box] : 1) };
  store.set("cards", st);
  store.set("cards.today", { date: twNow().date, n: cardsToday() + 1 });
}
function cardsPrompt() {
  const k = Math.min(dueCards().length, PER_DAY - cardsToday());
  return k > 0 ? `<a class="cards-cta" href="#/cards"><b>牙周小卡</b><span>今天 ${k} 張，30 秒考你一下</span><i aria-hidden="true">→</i></a>` : "";
}
function viewCards() {
  let queue = dueCards().slice(0, Math.max(0, PER_DAY - cardsToday()));
  let i = 0, ok = 0, total = queue.length;
  const page = (inner) => { main.innerHTML = `<div class="wrap"><header class="page-title"><h1>牙周小卡</h1><span class="de">Karteikarten</span></header>${inner}</div>`; };
  const end = () => {
    const more = dueCards().length;
    page(`<div class="finish done"><span class="tick" aria-hidden="true">✓</span><b>${total ? "刷完了" : "今天的卡刷完了"}</b><span class="note">${total ? `記得 ${ok} 張、忘了 ${total - ok} 張。忘了的明天再考你。` : "明天再來，忘掉之前會再考你。"}</span></div>
      <div class="btns cards-end">${more ? `<button class="btn ghost" data-more>再來 ${Math.min(more, PER_DAY)} 張</button>` : ""}<a class="btn" href="#/">回到今日</a></div>`);
    main.querySelector("[data-more]")?.addEventListener("click", () => { queue = dueCards().slice(0, PER_DAY); i = 0; ok = 0; total = queue.length; show(); });
    if (total) celebrate(main.querySelector(".finish"));
  };
  const show = () => {
    if (i >= queue.length) return end();
    const { date, a } = queue[i];
    page(`<div class="dots" aria-hidden="true">${queue.map((_, k) => `<i class="${k < i ? "done" : k === i ? "now" : ""}"></i>`).join("")}</div>
      <p class="cards-pos">第 ${i + 1}／${queue.length} 張・${esc(fmtDate(date, "short"))}那篇</p>
      <div class="card3d" role="group" aria-label="第 ${i + 1}／${queue.length} 張小卡">
        <div class="flip">
          <div class="face front"><span class="lbl">學長考你</span><p class="q">${esc(a.quiz || `「${a.title}」帶走的結論是什麼？`)}</p><button type="button" class="flip-btn">想好了，翻面看答案</button></div>
          <div class="face back"><span class="lbl">帶得走的結論</span><p>${esc(a.takeaway)}</p><a href="#/a/${date}/perio">回去看那篇</a></div>
        </div>
        <span class="stampmark ok" aria-hidden="true">記得</span><span class="stampmark no" aria-hidden="true">忘了</span>
      </div>
      <div class="btns grade" hidden><button class="btn" type="button" data-ok>記得</button><button class="btn ghost" type="button" data-no>忘了</button></div>
      <p class="swipe-hint" hidden>也可以直接滑：往右是記得，往左是忘了</p>`);
    const card = main.querySelector(".card3d");
    let flipped = false;
    const next = (remembered) => { grade(date, remembered); if (remembered) ok++; i++; show(); };
    card.addEventListener("flipped", (e) => {
      flipped = e.detail;
      main.querySelector(".grade").hidden = !flipped;
      main.querySelector(".swipe-hint").hidden = !flipped;
      if (flipped) main.querySelector("[data-ok]").focus({ preventScroll: true });
    });
    swipeCard(card, { canSwipe: () => flipped, onGrade: next });
    main.querySelector("[data-ok]").onclick = () => next(true);
    main.querySelector("[data-no]").onclick = () => next(false);
    card.querySelector(".flip-btn").focus({ preventScroll: true });
  };
  show();
}
function viewWeek() {
  const html = weekHtml();
  main.innerHTML = `<div class="wrap"><header class="page-title"><h1>本週回顧</h1><span class="de">Wochenschau</span></header>
    ${html || `<p class="empty">再讀幾期，這裡就會有你這週帶走的東西。</p>`}</div>`;
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
  if (t > pub) return `・更新於 ${tw.getUTCMonth() + 1}/${tw.getUTCDate()} ${hm}`;
  return a.column === "football" ? `・截稿 ${hm}` : "";
}

// `my` is this route's number: if the reader has moved on while the article loads, draw nothing.
async function viewArticle(date, column, my) {
  if (!isPublished(date)) { main.innerHTML = `<div class="wrap"><p class="empty">這篇還沒出爐，別偷看。</p></div>`; return; }
  main.innerHTML = `<div class="wrap"><p class="loading">翻到這一頁……</p></div>`;
  let a;
  try { a = await article(date, column); } catch { if (my === routeSeq) main.innerHTML = `<div class="wrap"><p class="empty">這篇找不到，可能被風吹走了。<a href="#/">回到今日</a></p></div>`; return; }
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
      <header class="article-head">${kicker(column, true)}<h1>${esc(a.title)}</h1>
        ${a.takeaway ? `<aside class="takeaway"><span class="lbl">帶得走的結論</span><p>${inline(a.takeaway)}</p></aside>` : ""}
        <p class="dek">${esc(a.dek)}</p>
        <div class="meta">${esc(fmtDate(date))}・第 ${issue?.no ?? ""} 期${minutes ? `・閱讀約 ${minutes} 分鐘` : ""}${updatedNote(date, a)}</div>
        ${a.from_reserve && column === "football" ? `<div class="banner">今晨新聞稿未能如期完成，先刊出這篇備用專題；最新消息併入下一期。</div>` : ""}
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
    e.currentTarget.classList.remove("pop");
    void e.currentTarget.offsetWidth;
    e.currentTarget.classList.toggle("pop", on);
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
  const savePos = () => {
    if (!body.isConnected) return;
    if (reachedEnd()) { markRead(key); store.del(posKey); return; }
    const p = ratio();
    if (p > 0.05) { saveT = Date.now(); store.set(posKey, Math.round(p * 1000) / 1000); }
  };
  const onScroll = () => {
    bar.style.width = `${Math.min(100, ratio() * 100)}%`;
    if (Date.now() - saveT > 800) savePos();
    clearTimeout(trail);
    trail = setTimeout(savePos, 250); // also keep where the gesture ended
  };
  const onHide = () => { if (document.visibilityState === "hidden") savePos(); };
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", savePos);
  const back = store.get(posKey, 0);
  const resume = main.querySelector(".resume");
  let resumeT = 0;
  if (back > 0.08) {
    resume.hidden = false;
    resume.onclick = () => {
      const h = document.documentElement;
      window.scrollTo({ top: back * (h.scrollHeight - h.clientHeight), behavior: "smooth" });
      resume.hidden = true;
    };
    resumeT = setTimeout(() => { resume.hidden = true; }, 7000);
  }
  cleanup = () => {
    clearTimeout(trail);
    savePos(); // route() runs this before drawing the next view, so the article is still on the page
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", savePos);
    clearTimeout(resumeT);
    reader?.stop();
  };
  document.title = `${a.title}｜${S.cfg.title}`;
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

function viewArchive() {
  const pubs = publishedIssues();
  const done = digestDone();
  const draw = (q) => {
    const ql = q.trim().toLowerCase();
    let last = "";
    const rows = pubs.map((iss) => {
      const arts = sortArticles(iss.articles, iss.date).filter((a) => !ql || `${a.title} ${a.dek} ${col(a.column).name}`.toLowerCase().includes(ql));
      if (!arts.length) return "";
      const [y, m, d] = iss.date.split("-");
      const head = `${y}-${m}` !== last ? `<div class="month">${Number(m)} 月 ${y}</div>` : "";
      last = `${y}-${m}`;
      return `${head}<a class="issue-row" href="#/issue/${iss.date}"><div class="d"><b>${Number(d)}</b><span>週${esc(iss.weekday)}・No.${iss.no}</span>${done.has(iss.date) ? '<i class="done-mark" title="已讀完摘要" aria-label="已讀完摘要">✓</i>' : ""}</div>
        <ul>${arts.map((a) => `<li><i>${esc(col(a.column).name)}</i>${esc(a.title)}</li>`).join("")}</ul></a>`;
    }).join("");
    main.querySelector(".list").innerHTML = rows || `<p class="empty">${ql ? "沒有符合的文章。" : "還沒有往期。"}</p>`;
  };
  const chips = Object.entries(S.cfg.columns).map(([c, k]) => `<a class="chip" href="#/column/${esc(c)}">${esc(k.name)}</a>`).join("");
  main.innerHTML = `<div class="wrap"><header class="page-title"><h1>往期</h1><span class="de">Archiv</span></header>
    <nav class="chips review" aria-label="複習"><a class="chip" href="#/week">本週回顧</a><a class="chip" href="#/cards">牙周小卡</a></nav>
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
    ${items || `<p class="empty">還空空的。讀到喜歡的，按右上角的星星收進來。</p>`}</div>`;
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
    <section class="set"><h2>出刊</h2><p>每日台灣時間 ${esc(S.cfg.publish_time)} 出刊。正刊五欄每日刊出；副刊依星期輪值兩篇；觀測站只在有重要新進展時刊出。</p>
      <p>稿件由雲端排程編輯在凌晨分班撰寫，每篇再由另一位編輯獨立查核事實、引文與圖片授權。若某一欄到 07:05 仍未完成，會自動換上預先寫好、查核過的備稿，本報不開天窗。</p>
      <div class="table"><div class="scroll"><table class="rot"><thead><tr><th>星期</th><th>副刊</th></tr></thead><tbody>
      ${wd.map(([k, l]) => `<tr><td>${l}</td><td>${rot[k].map((c) => esc(col(c).name)).join("、")}</td></tr>`).join("")}</tbody></table></div></div>
    </section>
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
      redraw("theme", v);
    };
    if (calm() || !document.startViewTransition) { swap(); return; }
    const r = b.getBoundingClientRect(), root = document.documentElement;
    root.style.setProperty("--vx", `${r.left + r.width / 2}px`);
    root.style.setProperty("--vy", `${r.top + r.height / 2}px`);
    root.classList.add("theme-vt");
    document.startViewTransition(swap).finished.catch(() => {}).finally(() => root.classList.remove("theme-vt"));
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
let routeSeq = 0; // bumped on every route; an older route still loading must not draw over a newer one

async function route(ev) {
  const my = ++routeSeq;
  cleanup(); cleanup = () => {};
  document.title = S.cfg.title;
  const h = location.hash || "#/";
  const active = h.startsWith("#/column/music") ? "#/music" : h.startsWith("#/archive") || h.startsWith("#/issue") || h.startsWith("#/column") || h.startsWith("#/week") || h.startsWith("#/cards") ? "#/archive" : h.startsWith("#/saved") ? "#/saved" : h.startsWith("#/music") ? "#/music" : h.startsWith("#/settings") ? "#/settings" : "#/";
  $("#nav").innerHTML = NAV.map(([href, label, icon]) => `<a href="${href}" ${href === active ? 'aria-current="page"' : ""}>${ICON[icon]}<span>${label}</span></a>`).join("");
  $(".nav .in")?.style.setProperty("--i", NAV.findIndex(([href]) => href === active));
  stopReveal();
  const art = h.match(/^#\/a\/(\d{4}-\d{2}-\d{2})\/([\w-]+)/);
  const prev = shownArticle;
  shownArticle = art ? `${art[1]}/${art[2]}` : null;
  // Into an article already loaded: the tapped card's picture grows into its opening picture. Back out: the reverse.
  // An article still to be fetched opens without a transition (the page would freeze while it loads).
  const hero = () => main.querySelector("figure.hero img");
  let morph = null;
  if (ev && art && isFresh(art[1], art[2])) morph = { from: lastTapped, to: hero };
  else if (ev && !art && prev) morph = { from: hero(), to: () => main.querySelector(`a[href="#/a/${prev}"] img`) };
  else if (ev && !art) morph = {};
  lastTapped = null;
  const draw = async () => {
    await drawRoute(h, art, my);
    if (my === routeSeq) window.scrollTo(0, 0);
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
  else if (h.startsWith("#/week")) viewWeek();
  else if (h.startsWith("#/cards")) viewCards();
  else if (h.startsWith("#/saved")) viewSaved();
  else if (h.startsWith("#/music")) viewMusic();
  else if (h.startsWith("#/settings")) viewSettings();
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
  main.addEventListener("click", (e) => { lastTapped = e.target.closest("a.lead, a.item")?.querySelector("img") || null; }, true);
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
    try { S.index = await getJSON("content/index.json", { fresh: true }); fetchedAt = Date.now(); } catch { /* offline: still redraw the clock */ }
  };
  const refetch = async () => {
    await loadIndex();
    refreshFront();
    runAutoAdd();
  };
  setInterval(refreshFront, 60 * 1000);
  setInterval(refetch, 5 * 60 * 1000);
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
