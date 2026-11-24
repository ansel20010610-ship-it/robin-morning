#!/usr/bin/env python3
"""市場 (Markets): the market figures as data for the front page, written at every deploy by
.github/workflows/publish.yml (step "Market (市場)"). No AI, and numbers only: nothing here says anything about them.

  台股加權指數    臺灣證券交易所 OpenAPI, MI_INDEX (the row 發行量加權股價指數): close, points and percent as the exchange
                  gives them, with the trading day's own date (民國 → 西元). The day's close reaches the OpenAPI at about
                  05:20 the next morning, so the 07:30 paper has the last trading day; on a holiday that day stays, dated.
  美元兌新台幣    open.er-api.com (ExchangeRate-API, open access, no key): a reference mid rate updated once a day — not the
                  Bank of Taiwan's buying/selling rates, whose page answers a robot check. It is asked only once the time
                  of the next update its last answer gave has passed (so about once a day), and its terms ask for
                  attribution with a link, which "source" and "url" carry. The day's change is worked out against the
                  update just before (kept in "prev"), when the previous file has it.
  S&P 500, 道瓊工業指數, 那斯達克綜合指數; 西德州原油, 布蘭特原油
                  FRED, the Federal Reserve Bank of St. Louis (fred.stlouisfed.org/graph/fredgraph.csv?id=<series>), a
                  public CSV that needs no key: SP500, DJIA, NASDAQCOM, DCOILWTICO, DCOILBRENTEU. One series per request,
                  one after the other (HTTP/1.1; a request that fails is made once more). The figure is the last valid
                  line, its change the difference from the valid line before it; a day with no value ("." or empty) is
                  skipped. "asof" is that line's observation_date. FRED is behind the markets by one to a few days, the
                  oils by about a week: the paper shows the date, not a pretence of today. (CNBC's quote service, used
                  before, answered every User-Agent that is not a browser's with 403; nothing here poses as a browser.)

content/market.json (not in the repository: each deploy starts from the live file, as the wire does):

  {"updated": "2026-11-25T07:30+08:00",
   "items": [{"key": "taiex", "name": "台股加權指數", "value": 36811.89, "change": 778.6, "change_pct": 2.16,
              "asof": "2026-11-23", "source": "臺灣證券交易所", "url": "https://www.twse.com.tw/",
              "ok": true, "stale": false, "fetched": "2026-11-25T07:30+08:00"}, ...]}

"asof" is a date for a close or settlement (that day's) and a time with its offset for anything else (the rate's
update; an index read during its session). "fetched" is the last time the source answered. A source that cannot be
read this time keeps its figure from the previous file, marked "stale": true, for STALE_H hours after that answer;
with none (or older), the item is "ok": false with no numbers. A source that answers with an older figure than the
previous file holds (a CDN copy from before the day's update) does not replace it while that one is under STALE_H
hours old. Each request has REQUEST_S seconds and the whole reading TOTAL_S; the exit status is 1 only when nothing at
all could be read and there was no previous file to keep.

Usage: python3 scripts/market.py      (standard library only)
"""
import datetime as dt
import json
import math
import os
import re
import sys
import threading
import time
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import CONTENT, TW, UA  # noqa: E402

OUT = os.path.join(CONTENT, "market.json")
REQUEST_S = 15        # one request, connecting and reading
TOTAL_S = 55          # all of them (the three sources side by side (FRED's five one after the other), each one's requests in turn): under a minute in all
STALE_H = 48          # how long a figure kept from an earlier answer is still given (ok, stale)
MAX_BYTES = 2 << 20

TWSE = "https://openapi.twse.com.tw/v1/exchangeReport/MI_INDEX"
ERAPI = "https://open.er-api.com/v6/latest/USD"
FRED = "https://fred.stlouisfed.org/graph/fredgraph.csv?id={}"
FRED_PAGE = "https://fred.stlouisfed.org/series/{}"
SRC_TWSE = ("臺灣證券交易所", "https://www.twse.com.tw/")
SRC_ER = ("Exchange Rate API", "https://www.exchangerate-api.com")  # the attribution its terms ask for
SRC_FRED = "FRED, Federal Reserve Bank of St. Louis"


def fred_src(series):
    return (SRC_FRED, FRED_PAGE.format(series))

NOT_DUE = "not due"   # a reader's answer when the source has nothing new yet (the rate before its next update)


def get_body(url, until, accept):
    """One GET as bytes. Anything but a 200 answer raises, and so does running past REQUEST_S or the run's deadline."""
    start = time.monotonic()
    end = min(start + REQUEST_S, until)
    if end - start < 1:
        raise TimeoutError("no time left in this run")
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": accept})
    body = b""
    with urllib.request.urlopen(req, timeout=end - start) as r:
        if r.status != 200:
            raise ValueError(f"HTTP {r.status}")
        while True:
            if time.monotonic() > end:
                raise TimeoutError(f"over {REQUEST_S} s")
            chunk = r.read1(65536)  # what has come, so a slow trickle still meets the clock above
            if not chunk:
                break
            body += chunk
            if len(body) > MAX_BYTES:
                raise ValueError("answer too large")
    return body


def get_json(url, until):
    """One GET parsed as JSON (a robot-check page comes as 200 text/html, a mistyped TWSE path as a redirect to one:
    both raise)."""
    return json.loads(get_body(url, until, "application/json"))


def get_text(url, until):
    """One GET as text (a CSV)."""
    return get_body(url, until, "text/csv, text/plain").decode("utf-8")


def num(s):
    """'36,811.89', '+0.21%', '-58.71', 'UNCH' or a number, as a finite float; ValueError for anything else."""
    if isinstance(s, bool):
        raise ValueError(f"not a number: {s!r}")
    if isinstance(s, (int, float)):
        x = float(s)
    else:
        t = str(s).replace(",", "").replace("%", "").strip()
        x = 0.0 if t.upper() == "UNCH" else float(t)
    if not math.isfinite(x):
        raise ValueError(f"not a number: {s!r}")
    return x


def roc_date(s):
    """'1151123' (民國 115 年 11 月 23 日) → '2026-11-23'."""
    s = str(s).strip()
    if not re.fullmatch(r"\d{6,7}", s):
        raise ValueError(f"date {s!r}")
    return dt.date(int(s[:-4]) + 1911, int(s[-4:-2]), int(s[-2:])).isoformat()


def stamp(t):
    return t.isoformat(timespec="minutes")


def when(s):
    """An asof, fetched or next as an aware datetime (a bare date as its midnight in Taiwan), or None."""
    try:
        d = dt.datetime.fromisoformat(str(s))
    except ValueError:
        return None
    return d if d.tzinfo else d.replace(tzinfo=TW)


def order(asof):
    """A sort key for asof within one item: a date (that day's close) comes after every time of that day."""
    s = str(asof or "")
    return (s[:10], 1, "") if len(s) == 10 else (s[:10], 0, s[11:16])


def read_taiex(until, old):
    rows = get_json(TWSE, until)
    row = next((r for r in rows if isinstance(r, dict) and r.get("指數") == "發行量加權股價指數"), None)
    if row is None:
        raise ValueError("no row 發行量加權股價指數")
    pts, pct, mark = num(row["漲跌點數"]), num(row["漲跌百分比"]), str(row.get("漲跌", ""))
    sign = -1 if "-" in mark else 1 if "+" in mark else (-1 if pct < 0 else 1)
    change = round(sign * abs(pts), 2)
    if change * pct < 0:
        raise ValueError(f"漲跌 {mark!r} {pts} and 漲跌百分比 {pct} disagree")
    value = num(row["收盤指數"])
    if value <= 0:
        raise ValueError(f"收盤指數 {value}")
    return {"value": value, "change": change, "change_pct": pct, "asof": roc_date(row["日期"])}


def read_usdtwd(until, old):
    nxt = when(old.get("next")) if usable(old) else None
    now = dt.datetime.now(TW)
    if nxt and now < nxt < now + dt.timedelta(days=2):
        return NOT_DUE
    d = get_json(ERAPI, until)
    if not isinstance(d, dict) or d.get("result") != "success" or d.get("base_code") != "USD":
        raise ValueError(f"result {d.get('result') if isinstance(d, dict) else d!r}")
    value = num(d["rates"]["TWD"])
    if value <= 0:
        raise ValueError(f"TWD {value}")
    at = dt.datetime.fromtimestamp(int(d["time_last_update_unix"]), TW)
    nx = dt.datetime.fromtimestamp(int(d["time_next_update_unix"]), TW)
    return {"value": value, "change": None, "change_pct": None, "asof": stamp(at), "next": stamp(nx), "chain": "next"}


def fred_rows(text, series):
    """The last two valid (date, value) lines of a FRED CSV, oldest first. The header must be
    observation_date,<series>; a line with "." or nothing for a value is skipped; any other line that is not a
    date and a number raises (an HTML error page fails on the header). Only the tail of the text is parsed."""
    lines = text.replace("\r", "").split("\n")
    if [c.strip() for c in lines[0].split(",")] != ["observation_date", series]:
        raise ValueError(f"{series}: not a FRED CSV")
    rows = []
    for line in reversed(lines[1:]):
        line = line.strip()
        if not line:
            continue
        day, _, v = line.partition(",")
        v = v.strip()
        if v in ("", "."):
            continue
        dt.date.fromisoformat(day)  # raises unless YYYY-MM-DD
        x = num(v)
        if x <= 0:
            raise ValueError(f"{series} {day}: {x}")
        rows.append((day, x))
        if len(rows) == 2:
            break
    if not rows:
        raise ValueError(f"{series}: no value")
    return rows[::-1]


def read_fred(series):
    def read(until, old):
        last = None
        for _ in range(2):  # the first request now and then fails to connect; the second goes through
            try:
                rows = fred_rows(get_text(FRED.format(series), until), series)
                break
            except (OSError, TimeoutError) as e:  # a bad answer (ValueError) is not asked again
                last = e
        else:
            raise last
        day, value = rows[-1]
        got = {"value": value, "change": None, "change_pct": None, "asof": day}
        if len(rows) == 2:
            change = value - rows[0][1]
            got["change"] = round(change, 2)
            got["change_pct"] = round(change / rows[0][1] * 100, 2)
        return got
    return read


# (key, name, source, reader) in the order the figures are listed. A reader takes (deadline, previous item or {}) and
# returns the reading, NOT_DUE, or raises.
ITEMS = [
    ("taiex", "台股加權指數", SRC_TWSE, read_taiex),
    ("usdtwd", "美元兌新台幣", SRC_ER, read_usdtwd),
    ("spx", "S&P 500", fred_src("SP500"), read_fred("SP500")),
    ("dji", "道瓊工業指數", fred_src("DJIA"), read_fred("DJIA")),
    ("ixic", "那斯達克綜合指數", fred_src("NASDAQCOM"), read_fred("NASDAQCOM")),
    ("wti", "西德州原油", fred_src("DCOILWTICO"), read_fred("DCOILWTICO")),
    ("brent", "布蘭特原油", fred_src("DCOILBRENTEU"), read_fred("DCOILBRENTEU")),
]


def usable(item):
    return isinstance(item, dict) and item.get("ok") is True and isinstance(item.get("value"), (int, float)) \
        and not isinstance(item.get("value"), bool) and bool(item.get("asof"))


def follows(prev, got):
    """Whether prev is the figure just before got, so that their difference is the day's change."""
    if got.get("chain") == "next":  # the rate: the earlier answer named (about) this update as its next one
        a, b = when(prev.get("next")), when(got["asof"])
        return bool(a and b) and abs((b - a).total_seconds()) <= 3 * 3600
    if got.get("chain") == "contract":  # a settlement: the same contract, at most four days before (a long weekend)
        if prev.get("contract") != got.get("contract"):
            return False
        try:
            days = (dt.date.fromisoformat(got["asof"]) - dt.date.fromisoformat(str(prev.get("asof")))).days
        except ValueError:
            return False
        return 0 < days <= 4
    return False


def merge(key, name, src, got, old, now):
    """The item for this run out of its reading (a dict, NOT_DUE or an exception) and the previous file's item."""
    item = {"key": key, "name": name, "value": None, "change": None, "change_pct": None, "asof": None,
            "source": src[0], "url": src[1], "ok": False, "stale": False, "fetched": None}
    keep = usable(old)
    fetched = when(old.get("fetched")) if keep else None
    recent = bool(fetched) and now - fetched <= dt.timedelta(hours=STALE_H)
    same = {k: item[k] for k in ("key", "name", "source", "url")}
    if got is NOT_DUE and keep:
        return {**old, **same}
    if not isinstance(got, dict):
        return {**old, **same, "stale": True} if recent else item
    if recent and order(got["asof"]) < order(old["asof"]):
        return {**old, **same}
    chain = got.get("chain")
    item.update({k: v for k, v in got.items() if k != "chain"})
    item.update(ok=True, stale=False, fetched=stamp(now))
    if chain:
        prev = None
        if keep and old["asof"] == got["asof"]:
            prev = old.get("prev")  # the same update or settlement as last time: the same base
        elif keep:
            prev = {"value": old["value"], "asof": old["asof"]}
            for k in ("next", "contract"):
                if old.get(k) is not None:
                    prev[k] = old[k]
        item["prev"] = prev
        if isinstance(prev, dict) and usable({**prev, "ok": True}) and prev["value"] > 0 and follows(prev, got):
            change = got["value"] - prev["value"]
            item["change"] = round(change, 6)
            item["change_pct"] = round(change / prev["value"] * 100, 2)
    return item


def read_all(olds, until):
    """Every reader's answer by key: one thread per source (its requests one after another), all of them given up at
    `until`. A reader still running then counts as failed; its thread is left to die with the process."""
    results, lock = {}, threading.Lock()
    groups = {}
    for key, _name, src, fn in ITEMS:
        groups.setdefault(src[0], []).append((key, fn))

    def run(jobs):
        for key, fn in jobs:
            try:
                got = fn(until, olds.get(key) or {})
            except Exception as e:  # noqa: BLE001 — one figure failing must not stop the others
                got = e
            with lock:
                results[key] = got

    threads = [threading.Thread(target=run, args=(jobs,), daemon=True) for jobs in groups.values()]
    for t in threads:
        t.start()
    for t in threads:
        t.join(max(0.0, until - time.monotonic()))
    with lock:
        return dict(results)


def load(path):
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, ValueError):
        return None
    return data if isinstance(data, dict) and isinstance(data.get("items"), list) else None


def main():
    until = time.monotonic() + TOTAL_S
    before = load(OUT)
    olds = {i["key"]: i for i in (before or {}).get("items", []) if isinstance(i, dict) and isinstance(i.get("key"), str)}
    got = read_all(olds, until)
    now = dt.datetime.now(TW)
    items, read = [], 0
    for key, name, src, _fn in ITEMS:
        g = got.get(key, TimeoutError(f"cut off after {TOTAL_S} s"))
        if isinstance(g, dict) or g is NOT_DUE:
            read += 1
        try:
            item = merge(key, name, src, g, olds.get(key), now)
        except Exception as e:  # noqa: BLE001 — a previous item of a shape this cannot read: start afresh
            print(f"{key}: previous item not usable ({type(e).__name__}: {e})", file=sys.stderr)
            item = merge(key, name, src, g, None, now)
        items.append(item)
        if isinstance(g, Exception):
            print(f"{key}: {type(g).__name__}: {g}" + ("; kept from the previous file (stale)" if item["ok"] else ""),
                  file=sys.stderr)
        else:
            print(f"{key}: {item['value']} {item['change']} {item['change_pct']} ({item['asof']})"
                  + (" not due, kept" if g is NOT_DUE else ""))
    data = {"updated": stamp(now), "items": items}
    tmp = OUT + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")
    os.replace(tmp, OUT)
    shown = sum(1 for i in items if i["ok"])
    print(f"{shown}/{len(items)} figures; {read} read this time")
    if not read and before is None:
        print("nothing could be read and there was no previous file", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
