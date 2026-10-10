"""Shared helpers for the Robin Morning production scripts (stdlib only)."""
import datetime as dt
import json
import os
import re
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "content")
ISSUES = os.path.join(CONTENT, "issues")
UA = "RobinMorningBot/1.0 (https://github.com/ansel20010610-ship-it/robin-morning) python-urllib"
TW = dt.timezone(dt.timedelta(hours=8))
WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
WEEKDAY_ZH = ["一", "二", "三", "四", "五", "六", "日"]

GROUPS = {
    1: ["devotion", "music", "perio"],
    2: ["civilization", "@supp0"],
    3: ["@supp1", "@supp2"],
    4: ["football", "fm-watch", "cosmere-watch"],
}


def load_config():
    with open(os.path.join(CONTENT, "config.json"), encoding="utf-8") as f:
        return json.load(f)


def tw_now():
    return dt.datetime.now(TW)


def default_issue_date():
    """Routines run before noon Taiwan time for that day's issue; later runs prepare tomorrow's."""
    now = tw_now()
    d = now.date()
    if now.hour >= 12:
        d += dt.timedelta(days=1)
    return d


def parse_date(s):
    return dt.date.fromisoformat(s) if s else default_issue_date()


def issue_number(cfg, d):
    launch = dt.date.fromisoformat(cfg["launch_date"])
    return (d - launch).days + 1


def supplements_for(cfg, d):
    return list(cfg["rotation_by_weekday"][WEEKDAY_KEYS[d.weekday()]])


def columns_for_group(cfg, d, group):
    supp = supplements_for(cfg, d)
    out = []
    for c in GROUPS[group]:
        out.append(supp[int(c[-1])] if c.startswith("@supp") else c)
    return out


def expected_columns(cfg, d):
    mains = sorted([k for k, v in cfg["columns"].items() if v["group"] == "main"],
                   key=lambda k: cfg["columns"][k]["order"])
    return mains + supplements_for(cfg, d)


def article_path(d, column):
    return os.path.join(ISSUES, str(d), column + ".json")


def iter_articles():
    """Yield (date_str, column, path) for every article file."""
    if not os.path.isdir(ISSUES):
        return
    for day in sorted(os.listdir(ISSUES)):
        ddir = os.path.join(ISSUES, day)
        if not os.path.isdir(ddir) or not re.match(r"^\d{4}-\d{2}-\d{2}$", day):
            continue
        for fn in sorted(os.listdir(ddir)):
            if fn.endswith(".json"):
                yield day, fn[:-5], os.path.join(ddir, fn)


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def image_key(url):
    """Stable identity of an image regardless of thumbnail size or query string."""
    if not url:
        return ""
    u = urllib.parse.urlsplit(url)
    path = urllib.parse.unquote(u.path)
    if u.netloc.endswith("wikimedia.org"):
        parts = path.split("/")
        if "thumb" in parts:
            i = parts.index("thumb")
            return "commons:" + parts[i + 3]
        return "commons:" + parts[-1]
    if "/iiif/" in path:
        m = re.search(r"/iiif/[^/]+/([^/]+)", path)
        if m:
            return u.netloc + ":" + m.group(1)
    return u.netloc + path


def walk_blocks(article):
    """Yield every block, including hero, in reading order."""
    hero = article.get("hero")
    if isinstance(hero, dict):
        h = dict(hero)
        h.setdefault("type", "figure")
        h.setdefault("id", "hero")
        yield h
    for b in article.get("body", []) or []:
        if isinstance(b, dict):
            yield b


def figures_of(article):
    for b in walk_blocks(article):
        if b.get("type", "figure") == "figure" and b.get("src"):
            yield b


CJK = re.compile(r"[㐀-鿿豈-﫿]")


def text_of_block(b):
    t = b.get("type")
    parts = []
    for k in ("text", "label", "title", "note"):
        v = b.get(k)
        if isinstance(v, str) and t not in ("figure",):
            parts.append(v)
    if t in ("list",):
        parts += [x for x in b.get("items", []) if isinstance(x, str)]
    if t == "news":
        for it in b.get("items", []):
            parts += [it.get("headline", ""), it.get("summary", "")]
    if t == "scripture":
        parts += [v.get("text", "") for v in b.get("verses", [])]
    if t == "exercise":
        parts += b.get("steps", []) + b.get("criteria", [])
    if t == "callout":
        parts += [x for x in b.get("items", []) or [] if isinstance(x, str)]
    if t == "timeline":
        for it in b.get("items", []):
            parts += [it.get("label", ""), it.get("note", "")]
    if t == "table":
        for row in b.get("rows", []):
            parts += [str(c) for c in row]
    if t == "pitch":
        parts += [s.get("note", "") for s in b.get("steps", [])]
    return "\n".join(p for p in parts if p)


def cjk_count(article):
    total = 0
    for b in article.get("body", []) or []:
        if isinstance(b, dict):
            total += len(CJK.findall(text_of_block(b)))
    return total


def http_get(url, headers=None, timeout=20, data=None, method=None, retries=3):
    """GET/POST with a descriptive User-Agent; retries politely on HTTP 429/503."""
    import time
    import urllib.error
    h = {"User-Agent": UA}
    h.update(headers or {})
    for attempt in range(retries + 1):
        req = urllib.request.Request(url, headers=h, data=data, method=method)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.status, dict(r.headers), r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and attempt < retries:
                wait = int(e.headers.get("Retry-After", "0") or 0) or 3 * (attempt + 1)
                time.sleep(min(wait, 20))
                continue
            raise
