// 市場 (Markets): the figures scripts/market.py writes to content/market.json at every deploy — 台股加權指數 (臺灣證券交易所),
// 美元兌新台幣 (Exchange Rate API, a reference mid rate once a day; its terms ask for the link in `url` beside it), the
// three American indices and two oils (FRED, the St. Louis Fed, a day or more behind: an item it did not give is simply not there).
// Data only: nothing here draws (assets/boerse.js draws the quote board). Numbers only, nothing said about them.
import { within } from "./util.js";

// The file as market.py wrote it, or null (no file yet, offline, a shape it does not know). Never throws.
export async function fetchMarket() {
  try {
    const r = await fetch("content/market.json", { cache: "no-cache", ...within(8000) });
    if (!r.ok) return null;
    const d = await r.json();
    return Array.isArray(d?.items) ? d : null;
  } catch { return null; }
}

const MINUS = "−";
const finite = (x) => typeof x === "number" && Number.isFinite(x);
// 36811.89 → "36,811.89": two decimals and thousands grouped — an index, the rate and a price alike.
const plain = (x) => {
  const [i, f] = Math.abs(x).toFixed(2).split(".");
  return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${f}`;
};
// +778.60, −58.71, +2.16%; what rounds to zero has no sign (0.00, 0.00%).
const signed = (x, unit = "") => {
  const s = plain(x);
  return `${s === "0.00" ? "" : x > 0 ? "+" : MINUS}${s}${unit}`;
};

// The figures to show, in the file's order (or in the order of `keys`, only those): each item market.py could give
// ("ok"; one it kept from an earlier read has stale: true), its numbers as text. change and pct are "" when the file
// has none (the rate or an oil on its first day); dir is 1, -1 or 0 by the change as shown.
export function marketItems(data, keys = null) {
  const all = (Array.isArray(data?.items) ? data.items : [])
    .filter((i) => i && i.ok === true && typeof i.key === "string" && finite(i.value) && i.value > 0);
  const list = Array.isArray(keys) ? keys.map((k) => all.find((i) => i.key === k)).filter(Boolean) : all;
  return list.map((i) => {
    const change = finite(i.change) ? signed(i.change) : "";
    return {
      key: i.key,
      name: String(i.name ?? ""),
      value: plain(i.value),
      change,
      pct: finite(i.change_pct) ? signed(i.change_pct, "%") : "",
      dir: !change || change.startsWith("0") ? 0 : i.change > 0 ? 1 : -1,
      asof: String(i.asof ?? ""),
      source: String(i.source ?? ""),
      url: /^https:\/\//.test(i.url || "") ? i.url : "",
      stale: i.stale === true,
    };
  });
}
