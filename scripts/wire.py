#!/usr/bin/env python3
"""外電 (Telegramme): the wire on the front page, refreshed every hour by .github/workflows/wire.yml. No AI.

Four Chinese-language wires, read from their public RSS: 中央社 and 德國之聲 lead, BBC 中文 and 法廣 fill in
(the owner, 2026-11-07). Each source gives at most its share of the newest items from the last day; titles and a
one-sentence lead are put into Taiwan Traditional Chinese with OpenCC (s2twp: characters and wording, so 意大利
becomes 義大利, 软件 軟體) and curly quotes become 「」. The result is content/wire.json:

  {"updated": "...+08:00", "items": [{"src": "中央社", "title": "...", "lead": "...", "url": "...", "time": "...+08:00"}]}

newest first; "updated" is the time of the last read, written on every run. A source that cannot be read this hour
keeps the items it gave last time (from the previous file), so one broken feed never empties the bar. With nothing at
all to show, the old file is left as it is.

Usage: python3 scripts/wire.py            (needs: pip install opencc-python-reimplemented==0.1.7)
"""
import datetime as dt
import email.utils
import html
import json
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import CONTENT, TW, UA  # noqa: E402

OUT = os.path.join(CONTENT, "wire.json")
# (name shown on the bar, feed, how many of its newest items to take, what its text needs)
#   "full": simplified → Taiwan Traditional characters with OpenCC s2tw (characters and variants only: its phrase
#           table, s2twp, rewrites ordinary news words — 支持→支援, 制裁→製裁, 項目→專案, 文件→檔案), then the word list
#   "words": already traditional characters; only the word list
#   "": Taiwan's own wording already
SOURCES = [
    ("中央社", "https://feeds.feedburner.com/rsscna/intworld", 5, ""),
    ("德國之聲", "https://rss.dw.com/rdf/rss-chi-all", 4, "full"),
    ("BBC", "https://feeds.bbci.co.uk/zhongwen/trad/rss.xml", 2, "words"),
    ("法廣", "https://www.rfi.fr/tw/rss", 2, "words"),
]
# Mainland wording the wires keep (after OpenCC the text is traditional), and names Taiwan writes differently.
# Regular expressions, applied in order, so "特朗普（川普）" goes before "特朗普". Each rule is kept narrow: a bare
# 首腦 is a gang boss as well as a head of state, 航天局 is the official name of an agency, 人際網絡 is not 網路.
WORDS = [
    (r"特朗普（川普）", "川普"), (r"特朗普", "川普"), (r"普京", "普丁"), (r"澤連斯基", "澤倫斯基"), (r"內塔尼亞胡", "納坦雅胡"),
    (r"意大利", "義大利"), (r"悉尼", "雪梨"), (r"新西蘭", "紐西蘭"),
    (r"宇航員|航天員", "太空人"), (r"空間站", "太空站"), (r"首腦(?=會議|峰會|會談)", "領袖"),
    (r"報道", "報導"), (r"視頻", "影片"), (r"信息(?=技術|安全|科技|產業)", "資訊"), (r"信息", "訊息"),
    (r"(?<![人際關係社交])網絡", "網路"), (r"軟件", "軟體"), (r"互聯網", "網際網路"), (r"人工智能", "人工智慧"), (r"服務器", "伺服器"),
    (r"導彈", "飛彈"), (r"短信", "簡訊"), (r"出租車", "計程車"),
    (r"製裁", "制裁"),  # OpenCC reads 俄制裁 as 俄製 (Russian-made); 製裁 is never a word
]
WORDS = [(re.compile(a), b) for a, b in WORDS]
MAX_ITEMS = 12
WINDOW = dt.timedelta(hours=26)  # a little over a day: the overnight wires are still news at 07:30
LEAD_MAX = 70

try:
    import opencc
    _CC = opencc.OpenCC("s2tw")
except ImportError:  # the bar still works without it; only the DW/BBC/RFI wording stays as sent
    _CC = None
    print("warning: opencc not installed; titles are not converted", file=sys.stderr)

QUOTES = str.maketrans({"“": "「", "”": "」", "‘": "『", "’": "』"})


def quotes(s):
    """「」 for curly quotes, and for straight ASCII double quotes paired up (DW mixes both); an odd last one stays."""
    n = s.count('"') // 2 * 2
    out, opening, k = [], True, 0
    for ch in s:
        if ch == '"' and k < n:
            out.append("「" if opening else "」")
            opening, k = not opening, k + 1
        else:
            out.append(ch)
    return "".join(out).translate(QUOTES)


def balanced(s):
    """A lead cut short inside a quotation gets its closing 」 (or 』) back."""
    for o, c in (("「", "」"), ("『", "』")):
        if s.count(o) > s.count(c):
            s += c
    return s


def tw(s, how):
    """Taiwan wording: OpenCC characters for a simplified wire, the word list for all but CNA, 臺 → 台 as the paper
    writes it."""
    if not how:
        return s
    if how == "full" and _CC:
        s = _CC.convert(s)
    for rx, b in WORDS:
        s = rx.sub(b, s)
    return s.replace("臺", "台")


def clean(s):
    s = html.unescape(re.sub(r"<[^>]+>", "", s or ""))
    return quotes(re.sub(r"\s+", " ", s).strip())


def first_sentence(s):
    """The lead: the first sentence of the description, without the agency's dateline, at most LEAD_MAX characters."""
    s = re.sub(r"^（中央社[^）]*）", "", clean(s))
    m = re.match(r"(.+?[。！？][」』）]*)", s)
    s = m.group(1) if m else s
    if len(s) > LEAD_MAX:
        s = s[:LEAD_MAX - 1].rstrip("，、；：「『") + "…"
    return balanced(s)


def when(text):
    """An RSS pubDate (RFC 822) or a dc:date (ISO 8601) as an aware datetime, or None."""
    text = (text or "").strip()
    if not text:
        return None
    try:
        d = email.utils.parsedate_to_datetime(text)
    except (TypeError, ValueError):
        try:
            d = dt.datetime.fromisoformat(text.replace("Z", "+00:00"))
        except ValueError:
            return None
    return d if d.tzinfo else d.replace(tzinfo=dt.timezone.utc)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/xml, text/xml"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read()


def items_of(raw):
    """Every item of an RSS 2.0 or RSS 1.0 (RDF) feed as (title, link, description, date text)."""
    root = ET.fromstring(raw)
    out = []
    for el in root.iter():
        if el.tag.split("}")[-1] != "item":
            continue
        f = {}
        for c in el:
            f.setdefault(c.tag.split("}")[-1], c.text or "")
        out.append((f.get("title", ""), f.get("link", ""), f.get("description", ""), f.get("pubDate") or f.get("date", "")))
    return out


def read(name, url, take, how, now):
    got, seen = [], set()
    for title, link, desc, date in items_of(fetch(url)):
        t, d = clean(title), when(date)
        if not t or not link.startswith("https://") or not d or now - d > WINDOW or d - now > dt.timedelta(hours=1):
            continue
        key = re.sub(r"\W", "", t)
        if key in seen:
            continue
        seen.add(key)
        lead = first_sentence(desc)
        got.append({"src": name, "title": tw(t, how), "lead": tw(lead, how) if lead else "",
                    "url": link.strip(), "time": d.astimezone(TW).isoformat(timespec="minutes")})
    got.sort(key=lambda x: x["time"], reverse=True)
    return got[:take]


def main():
    now = dt.datetime.now(dt.timezone.utc)
    try:
        with open(OUT, encoding="utf-8") as f:
            before = json.load(f)
    except (OSError, ValueError):
        before = {"items": []}
    items, failed = [], []
    for name, url, take, how in SOURCES:
        try:
            items += read(name, url, take, how, now)
        except Exception as e:  # noqa: BLE001 — one feed down must not stop the others
            failed.append(name)
            print(f"{name}: {e}", file=sys.stderr)
            # keep what it gave last hour, while still within the window
            items += [i for i in before.get("items", []) if i.get("src") == name
                      and now - dt.datetime.fromisoformat(i["time"]) <= WINDOW]
    # the same story from two wires: keep the newer telling
    out, keys = [], set()
    for i in sorted(items, key=lambda x: x["time"], reverse=True):
        k = re.sub(r"\W", "", i["title"])[:14]
        if k in keys:
            continue
        keys.add(k)
        out.append(i)
    out = out[:MAX_ITEMS]
    if not out:
        print("no items from any source; content/wire.json left as it was", file=sys.stderr)
        return 1
    # "updated" is when the wires were last read, so it moves on every run even when no wire did: the bar's
    # "16:30 更新" then says the paper looked, not only that something came in.
    stamp = now.astimezone(TW)
    if os.environ.get("WIRE_ON_THE_HOUR") == "true" and stamp.minute < 15:
        stamp = stamp.replace(minute=0)  # wire.yml's hourly run: shown as the full hour it was started for
    data = {"updated": stamp.isoformat(timespec="minutes"), "items": out}
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"{len(out)} items" + (" (same as before)" if out == before.get("items") else "") + (f"; failed: {', '.join(failed)}" if failed else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
