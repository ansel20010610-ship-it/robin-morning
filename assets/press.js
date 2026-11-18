// 印務室 (Druckerei): the owner's press room, #/press. Everything here is read out of content/index.json as
// scripts/build_index.py emits it — each issue's press record (the shift reports in state/runs/, what the issue needs
// and what is still not on disk), its late note, which of its articles came from the reserve, and the top-level stock
// of reserve articles — so the page says the same offline as online, as of the index the app holds. app.js viewPress
// draws pressHtml(); `col` is app.js's column meta, which honours "was".
import { esc, fmtDate, twNow, issueNo } from "./util.js";

const OVERDUE = 7 * 60 + 45; // 07:45, when the monitor itself checks that every shift has reported
// The day's shifts in the order of editorial/README.md's 班表 (Taiwan time), as the owner reads them. Each: the name its
// report is filed under in state/runs (report_run.py --group; 1–5 sit in press.shifts, the rest in press itself), its
// hour, the part of the day it belongs to, its name, its duty in plain words, the minute past which a missing report
// counts as 沒回報, and — for the shifts that only run when needed (補班, 停刊保險, 清倉班) — `true`: those show only on a
// day they reported. 先發班 is one of those too: it runs the evening before (22:30), files under the issue's date, and
// reports only when it wrote (api-shifts/column.md; its 後備 is 第 1 班), so a night without its report is no fault.
// 連載班 and 備稿班 count as 沒回報 only once their 後備 (18:07, 19:37) has had its turn as well.
export const DAY = [
  ["column", "22:30", "eve", "先發班", "前一晚先寫好牙周", OVERDUE, true],
  ["1", "00:37", "night", "第 1 班", "經文・古典（牙周沒先寫就補）", OVERDUE],
  ["2", "01:37", "night", "第 2 班", "副刊兩篇", OVERDUE],
  ["3", "02:37", "night", "第 3 班", "副刊一篇・巴薩初稿", OVERDUE],
  ["mend", "04:00", "night", "補班", "補前三班沒寫完的", OVERDUE, true],
  ["4", "05:17", "dawn", "第 4 班", "快訊・巴薩更新・遠方有動靜・訃聞", OVERDUE],
  ["concerts", "05:30", "dawn", "演出班", "近期演出・歷史上的今天", OVERDUE],
  ["5", "06:27", "dawn", "第 5 班", "最後一關：缺什麼補什麼", OVERDUE],
  ["rescue", "06:30", "dawn", "停刊保險", "補還沒交的稿", OVERDUE, true],
  ["serial", "16:00", "day", "連載班", "連載譯一回", 18 * 60 + 45],
  ["reserve", "17:30", "day", "備稿班", "把備稿補滿", 20 * 60 + 30],
  ["sweep", "18:30", "day", "清倉班", "多譯幾回連載", 0, true],
];
const PARTS = { eve: ["前一晚", "Vorabend"], night: ["凌晨", "Nacht"], dawn: ["天亮前", "Morgengrauen"], day: ["白天", "Tag"] };
const GROUP_RANK = { main: 0, verse: 1, supplement: 2 };
// report_run.py marks a column that failed validation "perio（驗證失敗）": the column's name, then the mark kept.
const names = (cols, date, col) => (Array.isArray(cols) ? cols : []).map((c) => { const [, k, why = ""] = /^(.*?)(（[^）]*）)?$/s.exec(c); return esc(col(k, date).name + why); });
const mins = (hm) => { const [h, m] = hm.split(":").map(Number); return h * 60 + m; };
const hhmm = (m) => (m < 0 ? hhmm(m + 24 * 60) : `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);

// generated_at (an ISO stamp, UTC) as Taiwan HH:MM, with M/D in front when it is not today's; "" when unreadable.
export function twStamp(iso, now = twNow()) {
  const t = Date.parse(iso || "");
  if (Number.isNaN(t)) return "";
  const d = new Date(t + 8 * 3600 * 1000);
  const hm = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  return d.toISOString().slice(0, 10) === now.date ? hm : `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${hm}`;
}
// A shift that has not reported is overdue once its day is over, or today past 07:45 (or past `limit`, for a shift
// that runs later in the day).
export const overdue = (date, now = twNow(), limit = OVERDUE) => date < now.date || (date === now.date && now.minutes > limit);

// The day's rows in the order of the clock: each shift of DAY (the needed-only ones on a day they reported) and, on a
// Sunday held for the afternoon, the 補刊 (the owner, 2026-11-08: 禮拜天補刊印務室也要有訊息) — its report in state/runs
// (key "late") or where it stands (content/late.json). st: done (reported), wait (not yet due), late (past its minute).
function dayRows(issue, now) {
  const { date } = issue, press = issue.press || {}, shifts = press.shifts || {};
  const rows = [];
  for (const [k, at, part, name, duty, limit, cond] of DAY) {
    const r = /^\d$/.test(k) ? shifts[k] : press[k];
    if (cond && !r) continue;
    rows.push({ m: k === "column" ? mins(at) - 24 * 60 : mins(at), k, at, part, name, duty, r, st: r ? "done" : overdue(date, now, limit) ? "late" : "wait" });
  }
  const lt = issue.late, lr = press.late;
  if (lt || lr) {
    // late.py giveup (state "unfinished"): the row says the 補刊 was given up, reported or not, never 已回報 alone.
    const gaveUp = lt?.state === "unfinished";
    const word = gaveUp ? "已放棄" : lr ? "" : lt?.state === "regenerating" ? "補刊中" : lt?.state === "waiting" ? (date === now.date && now.minutes < 15 * 60 ? "等 15:00" : "待補刊") : "";
    rows.push({ m: 15 * 60 + 7, k: "late", at: "15:07", part: "day", name: "週日補刊", duty: "重寫凌晨缺的", r: lr, word,
      st: gaveUp ? "late" : lr || lt?.state === "done" ? "done" : "wait" });
  }
  return rows.sort((a, b) => a.m - b.m);
}
const stWord = (x) => x.word || (x.st === "done" ? esc(x.r?.at || "已交") : x.st === "late" ? "沒回報" : "等候");
// The duty line; with a note from the shift, a tap on it opens the note (kept open across the minute's redraw: data-k).
const dutyHtml = (x) => (x.r?.note ? `<details class="nt" data-k="${x.k}"><summary>${x.duty}</summary><p>${esc(x.r.note)}</p></details>` : `<span class="du">${x.duty}</span>`);

// The one sentence on top: how the issue stands, then what is missing, what came from the reserve, who has not reported.
function verdict(issue, rows, col, now) {
  const { date } = issue, press = issue.press || {}, lt = issue.late;
  const missing = names(press.missing, date, col);
  const filled = names((issue.articles || []).filter((a) => a.from_reserve).map((a) => a.column), date, col);
  const absent = rows.filter((x) => x.st === "late" && x.k !== "late").map((x) => x.name); // the 補刊 given up says so itself
  const out = date < now.date || now.minutes >= 7 * 60 + 30;
  const sub = [];
  let big, next;
  if (lt) {
    big = lt.state === "unfinished" ? "今天這期補不齊，已經放棄。" : lt.state === "done" ? `今天這期延到下午${lt.done_at ? ` ${esc(lt.done_at)} ` : ""}才補齊。` : "今天這期延到下午補刊。";
    // The late day's clock: when the morning fill stood aside, when the regeneration started, when the issue was whole.
    const clock = [lt.held_at && `${esc(lt.held_at)} 早上停手`, lt.started_at && `${esc(lt.started_at)} 開工`, lt.done_at && `${esc(lt.done_at)} 出齊`,
      lt.state === "unfinished" && `${lt.gave_up_at ? `${esc(lt.gave_up_at)} ` : ""}放棄`].filter(Boolean).join("・");
    if (clock) sub.push(clock);
  } else if (!out) {
    const night = rows.filter((x) => x.part !== "day"), done = night.filter((x) => x.st === "done").length;
    next = night.find((x) => x.st !== "done");
    big = next ? `稿子正在寫，${done ? `已經交了 ${done} 班` : "還沒有人交稿"}。` : missing.length ? "各班都交了，但還缺稿。" : "稿都交了，等 07:30 出刊。";
    if (next) sub.push(`${date === now.date && next.m <= now.minutes ? "正在等" : "下一班"}：${next.at} ${next.name}`);
  } else if (!issue.press) big = "還沒收到今天這期的紀錄。"; // an index older than the issue (app.js viewPress's empty record): nothing to conclude from
  else big = missing.length ? "07:30 出刊了，但有缺稿。" : "07:30 準時出刊，每一欄都到齊。";
  if (missing.length && (out || lt || !next)) sub.push(`還缺：${missing.join("、")}`);
  if (filled.length) sub.push(`用了備稿：${filled.join("、")}`);
  if (absent.length && (issue.press || lt)) sub.push(`沒回報：${absent.join("、")}`);
  const warn = (out && (missing.length || (!issue.press && !lt))) || (absent.length && (issue.press || lt)) || lt?.state === "unfinished";
  return `<div class="verdict${warn ? " warn" : ""}"><p class="big">${big}</p>${sub.length ? `<p class="sub">${sub.join("<br>")}</p>` : ""}</div>`;
}

// 今晨: the first issue handed in (app.js viewPress: the one of today's date, from 22:30 the evening before on, whether it exists yet or
// not). The sentence on top, then the day in its parts — 前一晚, 凌晨, 天亮前, the 07:30 出刊 rule, 白天 — each shift a
// diamond on the line as the paper's own timelines draw them: filled once it reported, hollow while it is not yet due,
// red once it is overdue (the state itself is the word on the right). 此刻 (the owner, 2026-11-06): on tonight's timetable a hairline where the clock stands, gone
// once the night is over (07:45).
function morning(issue, col, now) {
  if (!issue) return `<p class="empty">還沒有任何一期。</p>`;
  const { date } = issue;
  const head = `<div class="sec-head"><h2>今晨</h2><span class="de">Heute früh</span><span class="note">${esc(fmtDate(date, "short"))}・週${esc(issue.weekday || "")}・${esc(issueNo(issue.no))}</span></div>`;
  const rows = dayRows(issue, now);
  const items = rows.map((x) => ({ m: x.m, part: x.part, html: `<li class="tl-i ${x.st}"><span class="dot" aria-hidden="true"></span><b class="t">${x.at}</b><div class="w"><span class="nm">${x.name}</span>${dutyHtml(x)}</div><span class="st">${stWord(x)}</span></li>` }));
  if (date === now.date && now.minutes < OVERDUE) {
    // Where the hairline sits follows the clock: past 07:30 below the 出刊 rule, before midnight (minutes below 0) under 前一晚, after it never.
    const i = items.findIndex((x) => x.m > now.minutes);
    const at = i < 0 ? items.length : i, prev = items[at - 1]?.part, next = items[at]?.part;
    items.splice(at, 0, { m: now.minutes, part: now.minutes < 0 ? "eve" : now.minutes >= 7 * 60 + 30 ? "day" : !prev || prev === "eve" ? next || prev : prev, html: `<li class="tl-now" role="img" aria-label="此刻 ${hhmm(now.minutes)}"><span>此刻 ${hhmm(now.minutes)}</span></li>` });
  }
  const pub = `<div class="tl-pub"><span>07:30</span><b>出刊</b></div>`;
  let html = "", part = "";
  for (const x of items) {
    if (x.part !== part) {
      if (part) html += `</ol>`;
      if (x.part === "day") html += pub;
      part = x.part;
      html += `<h3 class="tl-h">${PARTS[part][0]}<i>${PARTS[part][1]}</i></h3><ol>`;
    }
    html += x.html;
  }
  if (part) html += `</ol>`;
  if (part !== "day") html += pub;
  return `${head}${verdict(issue, rows, col, now)}<div class="daytl">${html}</div>`;
}

// 備稿庫存: one bar per column against its target, mains first, then the supplements in config.json's order.
function stockHtml(cfg, stock, col) {
  const head = `<div class="sec-head"><h2>備稿庫存</h2><span class="de">Vorrat</span><span class="note">各欄現有／目標</span></div>`;
  const cols = stock && typeof stock === "object" ? Object.keys(stock) : [];
  if (!cols.length) return `${head}<p class="empty">還沒有庫存資料。</p>`;
  const keys = Object.keys(cfg.columns);
  const rank = (c) => { const k = cfg.columns[c]; return k ? [GROUP_RANK[k.group] ?? 3, k.order ?? 99, keys.indexOf(c)] : [4, 99, 0]; };
  cols.sort((a, b) => { const x = rank(a), y = rank(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; });
  let sumN = 0, sumT = 0;
  const rows = cols.map((c) => {
    const n = Math.max(0, Number(stock[c]?.n) || 0), t = Math.max(0, Number(stock[c]?.target) || 0);
    sumN += n; sumT += t;
    return `<div class="sk${n ? "" : " out"}" style="--p:${(t ? Math.min(1, n / t) : 0).toFixed(3)}"><span class="n">${esc(col(c).name)}</span><span class="c">${n}／${t}</span><i class="bar"><b></b></i></div>`;
  });
  return `${head}<div class="stock">${rows.join("")}</div><p class="total">共 ${sumN} 篇，目標 ${sumT}</p>`;
}

// 最近十四天: a row per issue, newest first, a mark per shift — ✓ reported, · not — for the six shifts of the night, the
// 演出班, the 連載班 and the 備稿班. Left blank, not drawn as missing: a shift's days before its first report in the
// index (it did not run yet; 先發班 began 2026-11-11), today's shifts that are not yet due (as the timetable above says
// 等候), and 先發班 on a night it did not write. Each mark names its state for a screen reader.
const ROSTER = [["column", "先", "先發班"], ["1", "一", "第 1 班"], ["2", "二", "第 2 班"], ["3", "三", "第 3 班"], ["4", "四", "第 4 班"], ["5", "五", "第 5 班"], ["concerts", "演", "演出班"], ["serial", "連", "連載班"], ["reserve", "備", "備稿班"]];
function fortnight(issues, now) {
  const rows = issues.slice(0, 14);
  if (!rows.length) return "";
  const rep = (i, k) => { const p = i.press || {}; return /^\d$/.test(k) ? (p.shifts || {})[k] : p[k]; };
  const first = Object.fromEntries(ROSTER.map(([k]) => [k, issues.reduce((o, i) => (rep(i, k) ? i.date : o), "")]));
  const limit = Object.fromEntries(DAY.map(([k, , , , , l]) => [k, l]));
  const mark = (r, who, before) => (before ? `<span class="c0"></span>` : r ? `<span class="c1" role="img" aria-label="${who}有回報">✓</span>` : `<span class="c0" role="img" aria-label="${who}沒回報">·</span>`);
  const body = rows.map((i) => {
    const [, m, d] = i.date.split("-").map(Number);
    return `<a class="pr" href="#/issue/${esc(i.date)}"><span class="d"><b>${m}/${d}</b><i>${esc(i.weekday || "")}</i></span>${ROSTER.map(([k, , who]) => mark(rep(i, k), who, !rep(i, k) && (k === "column" || !first[k] || i.date < first[k] || !overdue(i.date, now, limit[k])))).join("")}</a>`;
  });
  return `<div class="sec-head"><h2>最近十四天</h2><span class="de">Vierzehn Tage</span><span class="note">各班有沒有回報</span></div>
    <div class="roster"><div class="pr head"><span></span>${ROSTER.map(([, w]) => `<span>${w}</span>`).join("")}</div>${body.join("")}</div>
    <p class="legend">✓ 有回報・· 沒回報・空白是還沒到時間，或那天沒有這一班</p>`;
}

// 稽核: the newest issue that carries the Sunday audit's report, and under its note the articles that audit corrected —
// every entry whose `corrected` (build_index.py, the newest 「更正（日期）」 callout's date) is the audit's day, as links,
// each with its day, its column and what was wrong (finding 32: the press room used to carry one sentence and no list).
function audit(issues, col) {
  const i = issues.find((x) => x.press?.audit);
  if (!i) return "";
  const a = i.press.audit;
  const fixed = issues.flatMap((x) => (x.articles || []).filter((e) => e.corrected === i.date).map((e) => ({ date: x.date, e })))
    .sort((p, q) => q.date.localeCompare(p.date) || p.e.column.localeCompare(q.e.column));
  const list = fixed.length ? `<div class="sec-head small"><h3>這次更正的</h3><span class="note">${fixed.length} 篇</span></div><ol class="fixes">${fixed.map(({ date, e }) => `<li><a href="#/a/${esc(date)}/${esc(e.column)}"><span class="m"><span class="k">${esc(col(e.column, date).name)}</span><span class="d">${esc(fmtDate(date, "short"))}</span></span><b>${esc(e.title)}</b>${e.correction ? `<span class="what">${esc(e.correction)}</span>` : ""}</a></li>`).join("")}</ol>` : "";
  return `<div class="sec-head"><h2>稽核</h2><span class="de">Revision</span><span class="note">${esc(fmtDate(i.date, "short"))} ${esc(a.at || "")}</span></div>
    <p class="audit">${esc(a.note) || "未留備註。"}</p>${list}`;
}

export function pressHtml(cfg, index, col, now = twNow()) {
  const issues = Array.isArray(index?.issues) ? index.issues : [];
  const stamp = twStamp(index?.generated_at); // the wall clock's day, not the issue's
  return `<header class="page-title"><h1>印務室</h1><span class="de">Druckerei</span></header>
    <p class="col-note">今天這一期怎麼做出來：哪一班幾點交稿、有沒有缺稿、備稿還剩多少、每週稽核改了哪幾篇。資料隨每次推送更新${stamp ? `，上次更新 ${stamp}` : ""}。</p>
    ${morning(issues[0], col, now)}${stockHtml(cfg, index?.stock, col)}${fortnight(issues, now)}${audit(issues, col)}`;
}
