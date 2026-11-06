// 印務室 (Druckerei): the owner's press room, #/press. Everything here is read out of content/index.json as
// scripts/build_index.py emits it — each issue's press record (the shift reports in state/runs/, what the issue needs
// and what is still not on disk), its late note, which of its articles came from the reserve, and the top-level stock
// of reserve articles — so the page says the same offline as online, as of the index the app holds. app.js viewPress
// draws pressHtml(); `col` is app.js's column meta, which honours "was".
import { esc, fmtDate, twNow, roman } from "./util.js";

// The five shifts of editorial/README.md, Taiwan time. "reserve" is the 14:37 備稿班 and "audit" the Sunday 稽核; they
// report into the same file and show in the roster's last column and the 稽核 section.
export const SHIFTS = [["1", "00:37", "經文・古典・牙周"], ["2", "01:37", "副刊一、三"], ["3", "02:37", "副刊二・巴薩初稿"],
  ["4", "05:17", "快訊・巴薩更新・遠方有動靜"], ["5", "06:27", "安全網"]];
const OVERDUE = 7 * 60 + 45; // 07:45, when the monitor itself checks that every shift has reported
const GROUP_RANK = { main: 0, verse: 1, supplement: 2 };
const LATE = { waiting: "週日補刊：等 15:00 額度重置", regenerating: "補刊中", done: "補刊已出" };
const names = (cols, date, col) => (Array.isArray(cols) ? cols : []).map((c) => esc(col(c, date).name));

// generated_at (an ISO stamp, UTC) as Taiwan HH:MM, with M/D in front when it is not today's; "" when unreadable.
export function twStamp(iso, now = twNow()) {
  const t = Date.parse(iso || "");
  if (Number.isNaN(t)) return "";
  const d = new Date(t + 8 * 3600 * 1000);
  const hm = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  return d.toISOString().slice(0, 10) === now.date ? hm : `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${hm}`;
}
// A shift that has not reported is overdue once its day is over, or today past 07:45.
export const overdue = (date, now = twNow()) => date < now.date || (date === now.date && now.minutes > OVERDUE);

// 今晨: the newest issue in the index, published or not (at 07:00 the owner wants to see this morning's). The timetable
// of the five shifts, then who stood in from the reserve, what is still missing, and the Sunday late state.
function morning(issue, col, now) {
  if (!issue) return `<p class="empty">還沒有任何一期。</p>`;
  const { date, press } = issue;
  const head = `<div class="sec-head"><h2>今晨</h2><span class="de">Heute früh</span><span class="note">${esc(fmtDate(date, "short"))}・週${esc(issue.weekday || "")}・第 ${esc(issue.no)} 期</span></div>`;
  if (!press) return `${head}<p class="empty">還沒有班次回報。</p>`;
  const late = overdue(date, now), shifts = press.shifts || {};
  const rows = SHIFTS.map(([k, at, duty]) => {
    const r = shifts[k], miss = r ? names(r.missing, date, col) : [];
    return `<li class="shift${r ? "" : late ? " late" : " wait"}"><span class="no">${roman(Number(k))}</span><div class="duty"><b>${at}</b><span>${duty}</span></div>
      <span class="at">${r ? esc(r.at || "已回報") : "未回報"}</span>
      ${miss.length ? `<div class="miss">${miss.map((n) => `<span class="chip">${n}</span>`).join("")}</div>` : ""}
      ${r?.note ? `<p class="small">${esc(r.note)}</p>` : ""}</li>`;
  });
  const filled = names((issue.articles || []).filter((a) => a.from_reserve).map((a) => a.column), date, col);
  const missing = names(press.missing, date, col);
  const lateState = issue.late && LATE[issue.late.state];
  return `${head}<ol class="shifts">${rows.join("")}</ol>
    <dl class="kv"><dt>補位</dt><dd>${filled.length ? filled.join("、") : "無"}</dd>
      ${missing.length ? `<dt>缺稿</dt><dd class="red">${missing.join("、")}</dd>` : ""}
      ${lateState ? `<dt>補刊</dt><dd>${lateState}</dd>` : ""}</dl>`;
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
// with nothing missing, the count in red for one with columns still missing, a dot for no report. Each mark names its
// state for a screen reader (role="img", as relatedHtml's tick), so a row reads as the day and six states.
function fortnight(issues) {
  const rows = issues.slice(0, 14);
  if (!rows.length) return "";
  const cell = (r) => (!r ? `<span class="c0" role="img" aria-label="未回報">·</span>` : r.missing?.length ? `<span class="c2" role="img" aria-label="缺 ${r.missing.length} 欄">${r.missing.length}</span>` : `<span class="c1" role="img" aria-label="無缺稿">✓</span>`);
  const body = rows.map((i) => {
    const s = i.press?.shifts || {}, [, m, d] = i.date.split("-").map(Number);
    return `<a class="pr" href="#/issue/${esc(i.date)}"><span class="d"><b>${m}/${d}</b><i>${esc(i.weekday || "")}</i></span>${SHIFTS.map(([k]) => cell(s[k])).join("")}${cell(i.press?.reserve)}</a>`;
  });
  return `<div class="sec-head"><h2>最近十四天</h2><span class="de">Vierzehn Tage</span><span class="note">各班出勤</span></div>
    <div class="roster"><div class="pr head"><span></span>${["一", "二", "三", "四", "五", "備"].map((w) => `<span>${w}</span>`).join("")}</div>${body.join("")}</div>
    <p class="legend">✓ 回報時無缺稿・數字是回報時仍缺的欄數・· 未回報</p>`;
}

// 稽核: the newest issue that carries the Sunday audit's report.
function audit(issues) {
  const i = issues.find((x) => x.press?.audit);
  if (!i) return "";
  const a = i.press.audit;
  return `<div class="sec-head"><h2>稽核</h2><span class="de">Revision</span><span class="note">${esc(fmtDate(i.date, "short"))} ${esc(a.at || "")}</span></div>
    <p class="audit">${esc(a.note) || "未留備註。"}</p>`;
}

export function pressHtml(cfg, index, col, now = twNow()) {
  const issues = Array.isArray(index?.issues) ? index.issues : [];
  const stamp = twStamp(index?.generated_at, now);
  return `<header class="page-title"><h1>印務室</h1><span class="de">Druckerei</span></header>
    <p class="col-note">今晨五班誰報到、哪一欄用了備稿、備稿庫存還剩多少。資料隨每次推送更新${stamp ? `，上次更新 ${stamp}` : ""}。</p>
    ${morning(issues[0], col, now)}${stockHtml(cfg, index?.stock, col)}${fortnight(issues)}${audit(issues)}`;
}
