// 印務室 (Druckerei): the owner's press room, #/press. Everything here is read out of content/index.json as
// scripts/build_index.py emits it — each issue's press record (the shift reports in state/runs/, what the issue needs
// and what is still not on disk), its late note, which of its articles came from the reserve, and the top-level stock
// of reserve articles — so the page says the same offline as online, as of the index the app holds. app.js viewPress
// draws pressHtml(); `col` is app.js's column meta, which honours "was".
import { esc, fmtDate, twNow, roman, issueNo } from "./util.js";

// The five shifts of editorial/README.md, Taiwan time. "reserve" is the 14:37 備稿班 and "audit" the Sunday 稽核; they
// report into the same file and show in the roster's last columns and the 稽核 section.
export const SHIFTS = [["1", "00:37", "經文・古典・牙周"], ["2", "01:37", "副刊一、三"], ["3", "02:37", "副刊二・巴薩初稿"],
  ["4", "05:17", "快訊・巴薩更新・遠方有動靜"], ["5", "06:27", "安全網"]];
// The two shifts outside the issue (editorial/README.md: 不屬於刊期) that still have to run every day, and since the audit
// of 2026-11-08 (findings 15, 33 and 46: nobody noticed a morning the 演出班 did not run, nor a day the serial never
// came) report into state/runs as well — report_run.py --group concerts / --group serial, read into press.concerts and
// press.serial by build_index.py. Each: its key in the press record, its hour, its glyph for the timetable, its duty,
// and the minute past which a missing report is overdue (the 07:45 monitor for the morning one; 16:45 for the serial).
export const EXTRA = [["concerts", "06:17", "演", "近期演出・歷史上的今天", 7 * 60 + 45], ["serial", "16:07", "連", "連載・譯三天後的一回", 16 * 60 + 45]];
const OVERDUE = 7 * 60 + 45; // 07:45, when the monitor itself checks that every shift has reported
const GROUP_RANK = { main: 0, verse: 1, supplement: 2 };
const LATE = { waiting: "週日補刊：等 15:00 額度重置", regenerating: "補刊中", done: "補刊已出" };
const names = (cols, date, col) => (Array.isArray(cols) ? cols : []).map((c) => esc(col(c, date).name));
const mins = (hm) => { const [h, m] = hm.split(":").map(Number); return h * 60 + m; };

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

// 今晨: the first issue handed in (app.js viewPress: the one of today's date, from midnight on, whether it exists yet or
// not). The timetable of the day's shifts in the order of the clock — the five of the issue, the 演出班 among them at
// 06:17 and the 連載班 at the foot at 16:07, all "未回報" while the night is young — and on a Sunday held for the
// afternoon the 補刊 as a row of its own; then who stood in from the reserve, what is still missing, and the late day's
// clock.
function morning(issue, col, now) {
  if (!issue) return `<p class="empty">還沒有任何一期。</p>`;
  const { date } = issue, press = issue.press || {};
  const head = `<div class="sec-head"><h2>今晨</h2><span class="de">Heute früh</span><span class="note">${esc(fmtDate(date, "short"))}・週${esc(issue.weekday || "")}・${esc(issueNo(issue.no))}</span></div>`;
  const late = overdue(date, now), shifts = press.shifts || {};
  // Each row carries the minute it is due, so the rows — and the 此刻 hairline — fall into the order of the clock.
  const rows = SHIFTS.map(([k, at, duty]) => {
    const r = shifts[k], miss = r ? names(r.missing, date, col) : [];
    return [mins(at), `<li class="shift${r ? "" : late ? " late" : " wait"}"><span class="no">${roman(Number(k))}</span><div class="duty"><b>${at}</b><span>${duty}</span></div>
      <span class="at">${r ? esc(r.at || "已回報") : "未回報"}</span>
      ${miss.length ? `<div class="miss">${miss.map((n) => `<span class="chip">${n}</span>`).join("")}</div>` : ""}
      ${r?.note ? `<p class="small">${esc(r.note)}</p>` : ""}</li>`];
  });
  // 演出班 and 連載班: reported or not, when, and the note; their `missing` is the issue's, not theirs, so no chips.
  for (const [k, at, glyph, duty, limit] of EXTRA) {
    const r = press[k];
    rows.push([mins(at), `<li class="shift extra${r ? "" : overdue(date, now, limit) ? " late" : " wait"}"><span class="no zh">${glyph}</span><div class="duty"><b>${at}</b><span>${duty}</span></div>
      <span class="at">${r ? esc(r.at || "已回報") : "未回報"}</span>
      ${r?.note ? `<p class="small">${esc(r.note)}</p>` : ""}</li>`]);
  }
  // 此刻 (the owner, 2026-11-06): on tonight's timetable a hairline where the clock stands, so a look at midnight says
  // which shift is up; gone once the night is over (07:45).
  if (date === now.date && now.minutes < OVERDUE) {
    const hm = `${String(Math.floor(now.minutes / 60)).padStart(2, "0")}:${String(now.minutes % 60).padStart(2, "0")}`;
    rows.push([now.minutes + 0.5, `<li class="now" role="img" aria-label="此刻 ${hm}"><span class="no"></span><div class="duty"><b>此刻</b><span>${hm}</span></div></li>`]);
  }
  // 週日補刊 (the owner, 2026-11-08: 禮拜天補刊印務室也要有訊息): on a Sunday held for the afternoon the regeneration is a
  // shift of its own on the timetable — which columns it had to write again, when it handed in (its report in
  // state/runs, key "late") or where it stands (content/late.json), and its note — so the press room tells the whole
  // day, not only the night.
  const lt = issue.late, lr = press.late;
  if (lt || lr) {
    const cols = names(lr?.missing?.length ? lr.missing : lt?.missing, date, col);
    const at = lr ? esc(lr.at || "已回報") : lt?.state === "regenerating" ? "補刊中" : lt?.state === "waiting" ? (date === now.date && now.minutes < 15 * 60 ? "等 15:00" : "待補刊") : "已回報";
    rows.push([15 * 60 + 7, `<li class="shift extra${lr ? "" : lt?.state === "regenerating" ? "" : " wait"}"><span class="no zh">補</span><div class="duty"><b>15:07</b><span>週日補刊・重寫凌晨缺的</span></div>
      <span class="at">${at}</span>
      ${cols.length ? `<div class="miss">${cols.map((n) => `<span class="chip">${n}</span>`).join("")}</div>` : ""}
      ${lr?.note ? `<p class="small">${esc(lr.note)}</p>` : ""}</li>`]);
  }
  rows.sort((a, b) => a[0] - b[0]);
  const filled = names((issue.articles || []).filter((a) => a.from_reserve).map((a) => a.column), date, col);
  const missing = names(press.missing, date, col);
  // The late day's clock: when the morning fill stood aside, when the regeneration started, when the issue was whole.
  const lateLine = lt && ([lt.held_at && `${esc(lt.held_at)} 早上停手`, lt.started_at && `${esc(lt.started_at)} 開工`, lt.done_at && `${esc(lt.done_at)} 出齊`].filter(Boolean).join("・") || LATE[lt.state] || "");
  return `${head}<ol class="shifts">${rows.map((r) => r[1]).join("")}</ol>
    <dl class="kv"><dt>補位</dt><dd>${filled.length ? filled.join("、") : "無"}</dd>
      ${missing.length ? `<dt>缺稿</dt><dd class="red">${missing.join("、")}</dd>` : ""}
      ${lateLine ? `<dt>補刊</dt><dd>${lateLine}</dd>` : ""}</dl>`;
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

// 最近十四天: a row per issue, newest first, a mark per shift and one for the reserve shift — a gold tick for a report
// with nothing missing, the count in red for one with columns still missing, a dot for no report — then two smaller
// marks for the 演出班 and the 連載班, which only either reported or did not (their report carries no columns of their
// own). Each mark names its state for a screen reader (role="img", as relatedHtml's tick), so a row reads as the day
// and eight states.
function fortnight(issues) {
  const rows = issues.slice(0, 14);
  if (!rows.length) return "";
  const cell = (r) => (!r ? `<span class="c0" role="img" aria-label="未回報">·</span>` : r.missing?.length ? `<span class="c2" role="img" aria-label="缺 ${r.missing.length} 欄">${r.missing.length}</span>` : `<span class="c1" role="img" aria-label="無缺稿">✓</span>`);
  const mark = (r, who) => (r ? `<span class="c1 x" role="img" aria-label="${who}已回報${r.at ? ` ${esc(r.at)}` : ""}">✓</span>` : `<span class="c0 x" role="img" aria-label="${who}未回報">·</span>`);
  const body = rows.map((i) => {
    const s = i.press?.shifts || {}, [, m, d] = i.date.split("-").map(Number);
    return `<a class="pr" href="#/issue/${esc(i.date)}"><span class="d"><b>${m}/${d}</b><i>${esc(i.weekday || "")}</i></span>${SHIFTS.map(([k]) => cell(s[k])).join("")}${cell(i.press?.reserve)}${mark(i.press?.concerts, "演出班")}${mark(i.press?.serial, "連載班")}</a>`;
  });
  return `<div class="sec-head"><h2>最近十四天</h2><span class="de">Vierzehn Tage</span><span class="note">各班出勤</span></div>
    <div class="roster"><div class="pr head"><span></span>${["一", "二", "三", "四", "五", "備", "演", "連"].map((w) => `<span>${w}</span>`).join("")}</div>${body.join("")}</div>
    <p class="legend">✓ 回報時無缺稿・數字是回報時仍缺的欄數・· 未回報・演、連兩班只記有沒有回報</p>`;
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
  const stamp = twStamp(index?.generated_at, now);
  return `<header class="page-title"><h1>印務室</h1><span class="de">Druckerei</span></header>
    <p class="col-note">今晨各班誰報到、哪一欄用了備稿、備稿庫存還剩多少、上週稽核改了哪幾篇。資料隨每次推送更新${stamp ? `，上次更新 ${stamp}` : ""}。</p>
    ${morning(issues[0], col, now)}${stockHtml(cfg, index?.stock, col)}${fortnight(issues)}${audit(issues, col)}`;
}
