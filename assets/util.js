// Small shared helpers.

export const $ = (sel, root = document) => root.querySelector(sel);

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// **bold**, *em*, [text](https://url) — applied after escaping.
// A URL may hold one level of balanced parentheses (Wikipedia "Mistborn_(film)", Lancet DOIs).
// Links are swapped out for placeholders first so bold/em never touch a URL; the link text still gets them.
const LINK = /\[([^\]]+)\]\((https?:\/\/(?:[^()\s]|\([^()\s]*\))+)\)/g;
function emphasis(t) {
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return t.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
}
export function inline(s) {
  const links = [];
  const t = esc(s).replace(/\u0000/g, "").replace(LINK, (_, a, u) => {
    links.push(`<a href="${u}" target="_blank" rel="noopener">${emphasis(a)}</a>`);
    return `\u0000${links.length - 1}\u0000`;
  });
  return emphasis(t).replace(/\u0000(\d+)\u0000/g, (_, i) => links[Number(i)]);
}

export function paragraphs(s) {
  return String(s ?? "").split(/\n{2,}|\n/).filter(Boolean).map((x) => `<p>${inline(x)}</p>`).join("");
}

export const store = {
  get(k, d = null) { try { const v = localStorage.getItem("rm." + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("rm." + k, JSON.stringify(v)); } catch { /* private mode */ } },
  del(k) { try { localStorage.removeItem("rm." + k); } catch { /* ignore */ } },
};

let toastTimer;
export function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("on"), 2600);
}

// Taiwan time without relying on the device time zone.
export function twNow() {
  const d = new Date(Date.now() + 8 * 3600 * 1000);
  return {
    date: d.toISOString().slice(0, 10),
    minutes: d.getUTCHours() * 60 + d.getUTCMinutes(),
    ms: Date.now(),
  };
}

const WD = ["日", "一", "二", "三", "四", "五", "六"];
const WD_DE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const MON_DE = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

export function fmtDate(iso, style = "zh") {
  const [y, m, d] = iso.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  if (style === "de") return `${WD_DE[wd]}, ${d}. ${MON_DE[m - 1]} ${y}`;
  if (style === "short") return `${m} 月 ${d} 日`;
  return `${y} 年 ${m} 月 ${d} 日 星期${WD[wd]}`;
}

export async function getJSON(url, { fresh = false } = {}) {
  const r = await fetch(url, { cache: fresh ? "no-cache" : "default" });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

export const ICON = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 5l-7 7 7 7"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z"/></svg>',
  starOn: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z"/></svg>',
  text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 18L9 6l5 12M5.8 14h6.4M15 18l3-7 3 7M15.9 16h4.2"/></svg>',
  today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="4" y="4" width="16" height="16"/><path d="M4 9h16M8 13h8M8 16h5"/></svg>',
  archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 6h16v4H4zM5.5 10v9h13v-9M10 13.5h4"/></svg>',
  saved: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6.5 4h11v16l-5.5-4-5.5 4z"/></svg>',
  music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 17.5V6l10-2v11.5"/><circle cx="6.8" cy="17.5" r="2.3"/><circle cx="16.8" cy="15.5" r="2.3"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10-6.5z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>',
  ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  diagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="3" width="18" height="18"/><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="3.2"/></svg>',
};
