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
RESERVE = os.path.join(CONTENT, "reserve")
RESERVE_TARGET = 2  # reserve articles kept per column (editorial/RESERVE.md)
UA = "RobinMorningBot/1.0 (https://github.com/ansel20010610-ship-it/robin-morning) python-urllib"
TW = dt.timezone(dt.timedelta(hours=8))
WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
WEEKDAY_ZH = ["一", "二", "三", "四", "五", "六", "日"]

# Shifts (Taiwan time) — editorial/README.md. Shift 5 is the safety net: every column of the day.
GROUPS = {
    1: ["devotion", "music", "perio"],
    2: ["civilization", "@supp0"],
    3: ["@supp1", "@supp2", "football"],
    4: ["football", "fm-watch", "cosmere-watch"],
    5: ["@all"],
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
        if c == "@all":
            out += expected_columns(cfg, d)
        else:
            out.append(supp[int(c[-1])] if c.startswith("@supp") else c)
    return out


def reserve_columns(cfg):
    """Every column that must appear daily (all but the conditional watches) keeps a reserve."""
    return [k for k, v in cfg["columns"].items() if v["group"] != "watch"]


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


def iter_reserve(column=None):
    """Yield (column, path) for every reserve article in content/reserve/<column>/."""
    if not os.path.isdir(RESERVE):
        return
    for col in sorted(os.listdir(RESERVE)):
        cdir = os.path.join(RESERVE, col)
        if (column and col != column) or not os.path.isdir(cdir):
            continue
        for fn in sorted(os.listdir(cdir)):
            if fn.endswith(".json"):
                yield col, os.path.join(cdir, fn)


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


# IIIF Image API tail: {region}/{size}/{rotation}/{quality}.{format}; everything before it is the identifier
# (LOC: /image-services/iiif/service:pnp:…/full/pct:25/0/default.jpg, NGA: /iiif/<uuid>/full/!1280,1280/0/default.jpg).
IIIF_TAIL = re.compile(r"^(.*?/iiif/.+?)/(full|square|pct:[^/]+|\d+,\d+,\d+,\d+)/[^/]+/[^/]+/[^/]+\.[A-Za-z0-9]+$")
# What every browser can draw in <img> and CSS background-image. Commons originals in other formats
# (DjVu, TIFF, PDF, XCF) must be used through their JPEG/PNG thumbnails.
BROWSER_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/pjpeg", "image/png", "image/gif", "image/webp",
                       "image/avif", "image/svg+xml"}
RAW_IMAGE_EXT = (".djvu", ".djv", ".tif", ".tiff", ".pdf", ".xcf")


def image_key(url):
    """Stable identity of an image regardless of thumbnail size, page or query string."""
    if not url:
        return ""
    u = urllib.parse.urlsplit(url)
    path = urllib.parse.unquote(u.path)
    if u.netloc.endswith("wikimedia.org"):
        parts = path.split("/")
        if "thumb" in parts and len(parts) > parts.index("thumb") + 3:  # …/thumb/6/6e/<file>/<size>-<file>
            i = parts.index("thumb")
            return "commons:" + parts[i + 3]
        return "commons:" + parts[-1]
    if "/iiif/" in path:
        m = IIIF_TAIL.search(path)
        if m:
            return u.netloc + ":" + m.group(1)
    return u.netloc + path


WM_WIDTHS = (250, 330, 500, 960, 1280, 1920)  # widths Wikimedia serves; others are refused
WM_THUMB = re.compile(r"^(/wikipedia/commons/thumb/[0-9a-f]/[0-9a-f]{2}/[^/]+)/((?:lossy-|lossless-)?(?:page\d+-)?)(\d+)px-([^/]+)$")
WM_ORIG = re.compile(r"^/wikipedia/commons/([0-9a-f]/[0-9a-f]{2})/([^/]+)$")


def wm_thumb(url, width, orig_width=None):
    """The same Wikimedia Commons image at a smaller standard width, or None (not Commons, or already small)."""
    if not url:
        return None
    u = urllib.parse.urlsplit(url)
    if not u.netloc.endswith("wikimedia.org"):
        return None
    m = WM_THUMB.match(u.path)
    if m:
        if int(m.group(3)) <= width:
            return None
        return "%s://%s%s/%s%dpx-%s" % (u.scheme, u.netloc, m.group(1), m.group(2), width, m.group(4))
    m = WM_ORIG.match(u.path)
    if m:
        name = m.group(2)
        if name.lower().endswith(RAW_IMAGE_EXT) or (orig_width and orig_width <= width):
            return None
        thumb_name = name + ".png" if name.lower().endswith(".svg") else name
        return "https://upload.wikimedia.org/wikipedia/commons/thumb/%s/%s/%dpx-%s" % (m.group(1), name, width, thumb_name)
    return None


def image_page(url):
    """Page of a Commons thumbnail of a multi-page file (…/page5-1280px-X.djvu.jpg → 5); None otherwise."""
    if not url:
        return None
    name = urllib.parse.unquote(urllib.parse.urlsplit(url).path).rsplit("/", 1)[-1]
    m = re.match(r"(?:lossy-|lossless-)?page(\d+)-\d+px-", name)
    return int(m.group(1)) if m else None


def raw_image_ext(url):
    """The extension when url points straight at a file browsers cannot display (e.g. a .djvu original)."""
    name = urllib.parse.unquote(urllib.parse.urlsplit(url or "").path).rsplit("/", 1)[-1].lower()
    for ext in RAW_IMAGE_EXT:
        if name.endswith(ext):
            return ext
    return None


def walk_blocks(article):
    """Yield every block, including hero, in reading order. Malformed parts are skipped (validate.py reports them)."""
    if not isinstance(article, dict):
        return
    hero = article.get("hero")
    if isinstance(hero, dict):
        h = dict(hero)
        h["type"] = h.get("type") or "figure"  # like the App: an empty or null type is a figure too
        h.setdefault("id", "hero")
        yield h
    body = article.get("body")
    for b in body if isinstance(body, list) else []:
        if isinstance(b, dict):
            yield b


def figures_of(article):
    for b in walk_blocks(article):
        if b.get("type", "figure") == "figure" and isinstance(b.get("src"), str) and b["src"]:
            yield b


CJK = re.compile(r"[㐀-鿿豈-﫿]")


def _items(v, typ):
    """The items of list v that are typ. Wrong shapes are skipped here; validate.py reports them as ERROR."""
    return [x for x in v if isinstance(x, typ)] if isinstance(v, list) else []


def text_of_block(b):
    t = b.get("type")
    parts = []
    for k in ("text", "label", "title", "note"):
        v = b.get(k)
        if isinstance(v, str) and t not in ("figure",):
            parts.append(v)
    if t in ("list",):
        parts += _items(b.get("items"), str)
    if t == "news":
        for it in _items(b.get("items"), dict):
            parts += [it.get("headline", ""), it.get("summary", "")]
    if t == "scripture":
        parts += [v.get("text", "") for v in _items(b.get("verses"), dict)]
    if t == "exercise":
        parts += _items(b.get("steps"), str) + _items(b.get("criteria"), str)
    if t == "callout":
        parts += _items(b.get("items"), str)
    if t == "timeline":
        for it in _items(b.get("items"), dict):
            parts += [it.get("label", ""), it.get("note", "")]
    if t == "table":
        for row in _items(b.get("rows"), list):
            parts += [str(c) for c in row]
    if t == "pitch":
        parts += [s.get("note", "") for s in _items(b.get("steps"), dict)]
    return "\n".join(p for p in parts if isinstance(p, str) and p)


def cjk_count(article):
    total = 0
    body = article.get("body") if isinstance(article, dict) else None
    for b in body if isinstance(body, list) else []:
        if isinstance(b, dict):
            total += len(CJK.findall(text_of_block(b)))
    return total


RETRY_STATUS = (429, 500, 502, 503, 504)


def retry_after(value, attempt):
    """Seconds to wait from a Retry-After header (seconds or an HTTP date), at most 20."""
    import email.utils
    try:
        wait = int(value)
    except (TypeError, ValueError):
        try:
            wait = (email.utils.parsedate_to_datetime(value) - dt.datetime.now(dt.timezone.utc)).total_seconds()
        except (TypeError, ValueError, IndexError, OverflowError):
            wait = 0
    return min(wait, 20) if wait > 0 else 3 * (attempt + 1)


def http_get(url, headers=None, timeout=20, data=None, method=None, retries=3):
    """GET/POST with a descriptive User-Agent; retries politely on HTTP 429/5xx, and at most twice on
    timeouts or dropped connections (a host that is down should not stall a whole run)."""
    import http.client
    import socket
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
            if e.code in RETRY_STATUS and attempt < retries:
                time.sleep(retry_after((e.headers or {}).get("Retry-After"), attempt))
                continue
            raise
        except (OSError, http.client.HTTPException) as e:
            # URLError, timeouts, ConnectionResetError/RemoteDisconnected, IncompleteRead.
            # A DNS failure will not fix itself in a few seconds, so it is raised at once.
            if isinstance(getattr(e, "reason", None), socket.gaierror) or attempt >= min(retries, 2):
                raise
            time.sleep(2 * (attempt + 1))
