#!/usr/bin/env python3
"""The three national venues' own programme lists, the third source of 近期演出 (spec 補查改由程式先讀 v1, v2): 國家兩廳院
(ntch), 衛武營 (wwy) and 臺中國家歌劇院 (ntt). Reading and parsing only; scripts/concerts.py fetch rates what comes back,
after OPENTIX (v2: the venues never take OPENTIX's time).

  read(day, end, room, get)   one list request a venue (衛武營: a second or third page only when its count says so);
                              {venue: {"ok", "n", "note", "rows": [(category, row in the feed's shape)], "out": known and
                              not for the list, "cancelled", "bad": [(uid, title, why)] not understood (never rated),
                              "odd": 衛武營 catalogue codes not known, "full": programmes read when the list came back as
                              long as asked for (there may be more), "dup": uids that came twice (the first kept)}}
  is_venue(uid), of(uid)      a venue's uid (ntch:<id>, wwy:<_id>, ntt:<c-code>), and which venue

No detail pages, no short links: each venue is read whole every day and nothing is kept between days (like the feed).
The paper's own User-Agent (common.http_get), no cookies, no retry; PAUSE between two requests. Stdlib only.
"""
import datetime as dt
import html
import json
import os
import re
import sys
import time
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import TW, http_get  # noqa: E402

NAMES = {"ntch": "國家兩廳院", "wwy": "衛武營", "ntt": "臺中國家歌劇院"}
PREFIX = tuple(k + ":" for k in NAMES)
PAUSE = 1.5
TIMEOUT = 30
TRIES = 0  # no retry (v2): a venue that hangs costs one timeout
MAX_BYTES = 5 * 1024 * 1024  # a longer answer: that venue unreadable today
CARD_CHARS = 20000  # a 臺中 card is read in its first this many characters (a page of a shape nobody foresaw stays quick)
TITLE_CHARS = 300  # a longer title, or more shows than SHOWS in one programme: not understood (v3: fetch's own title and
SHOWS = 400        # show comparisons grow with the square of these)
ALL_SHOWS = 2000   # more shows than this in a venue's whole list: that venue unreadable today (the same reason)
NTCH_LIMIT = 1000
NTCH = "https://npac-ntch.org/tms/graphql"  # without www (the www host answers otherwise)
NTCH_QUERY = ("query($startFrom: DateOnly,$endOn: DateOnly,$limit: Int,$offset: Int,$types:[ProgramType!]){programs(startFrom:$startFrom,"
              "endOn:$endOn,limit:$limit,offset:$offset,types:$types){id title hall{id name} purchaseLink performanceSchedules{date "
              "startFromHours startFromMinutes hall{name}} categories{code name} cancelled}}")
NTCH_TYPES = ["GENERAL", "PARTNER", "TOUR", "SPECIAL", "HOST", "CO_ORGANIZE", "CO_HOST", "NSO"]  # without them only 6 come back
# the four halls of the list; any other name is not understood (v2). BIG_HALL in concerts.py searches substrings: only
# the two main halls may carry their names (「國家音樂廳排練室」 is not one)
NTCH_HALL = {"國家音樂廳": "國家音樂廳", "國家戲劇院": "國家戲劇院", "演奏廳": "兩廳院演奏廳", "實驗劇場": "兩廳院實驗劇場"}
NTCH_STAGE = ("戲曲", "現代戲劇")  # with 舞蹈 in a name: category 2; every other (歌劇 too) is 1
WWY_SIZE = 200
WWY_PAGES = 3
WWY = ("https://www.npac-weiwuying.org/api/programs/list?start=%d&end=%d&catalog_type=program&page=%d&size=" + str(WWY_SIZE)
       + "&chineseOnShelf=true")
WWY_PAGE = "https://www.npac-weiwuying.org/programs/%s"
WWY_SITE = {"5aec47d3b01ea6000520f663": "音樂廳", "5aec4743b01ea6000520f65e": "歌劇院", "5aec47eeb01ea6000520f665": "戲劇院",
            "5aec4800b01ea6000520f668": "表演廳", "5b102875da0322000751e9a6": "繪景工廠", "5b1029cdda0322000751e9ad": "演講廳",
            "5b134753c065d80005adcec9": "移動式劇場", "5b8cd6c3dea07500056a4200": "戶外劇場", "5be1594c77d0790006d80c56": "榕樹廣場",
            "65ee5e3f69b9960008c3a2a9": "其他"}  # /api/venues, 2026-11-17
# /api/programcatalogs?size=100, 2026-11-17: the feed's category each code stands for; None = known, not for the list.
# 歌劇 and 音樂劇 are codes of their own here (the spec names 音樂 and 戲劇 only): 歌劇 as at 兩廳院 (1), 音樂劇 as at OPENTIX (2).
WWY_CATALOG = {"5aec4184b01ea6000520f633": 1, "65fa586c27df72000ad07c63": 1, "5aec418cb01ea6000520f635": 2, "6a447bcd444f570008f2a50c": 2,
               "5c1f073a5a5bea0006f3eb11": None, "653789846baf59000811de11": None, "6007fc45ba34870007c22b8b": None,
               "5fe2bffdde1961000737545c": None, "64812f1feb9a240007c8c8c7": None, "5f6f57d6e0fdee000b536ba9": None,
               "646c770565a7e80007c13f18": None, "5f6f57551efdfd0006068dd8": None, "5aec45edb01ea6000520f655": None,
               "5d08a4a8d6da88000647288c": None, "600a39e9a6b9ff0007b87823": None, "6010ca1afb81540009f438e6": None}
NTT = "https://www.npac-ntt.org/program/events?type=1&type=4&type=5"  # 音樂、歌劇、音樂劇: every card is category 1
NTT_PAGE = "https://www.npac-ntt.org/program/events/%s"
# The page is cut at each card title, each piece at the next card's start, and every pattern is tried once, where its
# fixed start is first found (str.find), never at every position: no input makes it slower than reading the page once.
NTT_CARD = '<h3 class="card-title">'
NTT_NEXT = ('<div class="col-md', 'class="img-link', '<div class="card"', '<div class="card ')  # what begins the next card
NTT_LINK = re.compile(r'href="/program/events/(c-[A-Za-z0-9_-]+)"[^>]*?\stitle="([^"]*)"')
NTT_PLACE = re.compile(r'class="events-place">(?:<i[^>]*></i>)?([^<]*)<')
NTT_DAY = re.compile(r"(\d{4})/(\d{1,2})/(\d{1,2})")
NTT_BUY = re.compile(r'btn-buy-ticket"\s+href="([^"]*)"')
TRACKING = re.compile(r"^(utm_\w*|gclid|gbraid|wbraid|gad_source|gad_campaignid|fbclid|srsltid|msclkid|dclid|_gl)$", re.I)  # ad tracking


class Unreadable(ValueError):
    """The whole list could not be read today: the reason is said as it is."""


def is_venue(uid):
    return isinstance(uid, str) and uid.startswith(PREFIX)


def of(uid):
    return uid.split(":", 1)[0] if is_venue(uid) else None


def why(e):
    if isinstance(e, Unreadable):
        return str(e)
    if getattr(e, "code", None):
        return "HTTP %s" % e.code
    return "出錯：%s" % type(e).__name__


def is_day(v):
    try:
        return bool(re.match(r"^\d{4}-\d{2}-\d{2}$", v)) and bool(dt.date.fromisoformat(v))
    except (TypeError, ValueError):
        return False


def clean(url):
    """A ticket link without its ad-tracking parameters (gclid, utm_…); the rest of it as it was."""
    url, _, frag = (url or "").partition("#")
    base, q, query = url.partition("?")
    keep = [x for x in query.split("&") if x and not TRACKING.match(x.split("=", 1)[0])]
    return base + ("?" + "&".join(keep) if keep else "") + ("#" + frag if frag else "")


def row(uid, title, shows, sales, page, venue):
    """A programme in the shape of one open-data entry (opentix.row's): shows are (date, HH:MM or "", hall, city)."""
    sales = clean(sales)
    return {"UID": uid, "title": title, "webSales": sales, "sourceWebPromote": sales or page or "", "sourceWebName": NAMES[venue] + "節目表",
            "masterUnit": [], "showUnit": "", "descriptionFilterHtml": "",
            "showInfo": [{"time": d.replace("-", "/") + (" %s:00" % t if t else ""), "location": city, "locationName": hall, "price": ""}
                         for d, t, hall, city in shows]}


def too_long(got, uid, title, shows):
    """True for a programme with a title over TITLE_CHARS or over SHOWS shows, kept as not understood (its title cut)."""
    why = "標題太長" if len(title) > TITLE_CHARS else "場次太多" if shows > SHOWS else ""
    if why:
        got["bad"].append((uid, title[:30] + "…" if len(title) > 30 else title, why))
    return bool(why)


def first(got, uid, ids):
    """False for a uid already read in this list (the first is kept, said so); one without an id is never a repeat."""
    if uid in ids:
        got["dup"].append(uid)
        return False
    ids.add(uid)
    return True


def ntch(got, day, end, ask):
    v = {"startFrom": day, "endOn": end, "limit": NTCH_LIMIT, "offset": 0, "types": NTCH_TYPES}
    d = loads(ask(NTCH + "?" + urllib.parse.urlencode({"query": NTCH_QUERY, "variables": json.dumps(v)}, quote_via=urllib.parse.quote)))
    ps = (d.get("data") or {}).get("programs") if isinstance(d, dict) else None
    if not isinstance(ps, list):
        raise Unreadable("回應不是節目表（沒有 data.programs）")
    if len(ps) >= NTCH_LIMIT:
        got["full"] = len(ps)  # as many as asked for: there may be more
    ids = set()
    for p in ps:
        uid, title = "ntch:%s" % p.get("id"), str(p.get("title") or "").strip()
        if p.get("id") and not first(got, uid, ids):
            continue
        got["n"] += 1
        if p.get("cancelled") is True:
            got["cancelled"] += 1
            continue
        if too_long(got, uid, title, len(p.get("performanceSchedules") or [])):
            continue
        cats = [c.get("name") or "" for c in p.get("categories") or []]
        shows, bad = [], ""
        for s in p.get("performanceSchedules") or []:
            hall = ((s.get("hall") or {}).get("name") or (p.get("hall") or {}).get("name") or "").strip()
            h, m = s.get("startFromHours"), s.get("startFromMinutes")
            if not is_day(s.get("date")):
                bad = "讀不出場次"  # a date that is not one: the programme is not read at all
                break
            if hall not in NTCH_HALL:
                bad = "廳名不認得"  # never 「不在範圍」: a hall nobody has named may be a main hall written anew (v2)
                break
            hhmm = "%02d:%02d" % (h, m or 0) if isinstance(h, int) and isinstance(m or 0, int) else ""
            shows.append((s["date"], hhmm, NTCH_HALL[hall], "臺北市"))
        if not p.get("id") or not title or not shows or bad:
            got["bad"].append((uid, title, bad or "讀不出場次"))
            continue
        cat = 2 if cats and all(c in NTCH_STAGE or "舞蹈" in c for c in cats) else 1
        got["rows"].append((cat, row(uid, title, shows, p.get("purchaseLink"), "", "ntch")))  # the programme page is not known to work


def wwy(got, day, end, ask):
    t0 = dt.datetime.combine(dt.date.fromisoformat(day), dt.time(), TW).timestamp()
    t1 = dt.datetime.combine(dt.date.fromisoformat(end) + dt.timedelta(days=1), dt.time(), TW).timestamp()
    rows, ids, came = [], set(), 0
    for page in range(1, WWY_PAGES + 1):
        d = loads(ask(WWY % (t0, t1, page)))
        if not (isinstance(d, dict) and isinstance(d.get("rows"), list)):
            raise Unreadable("回應不是節目表（沒有 rows）")
        count = d.get("count")
        if not isinstance(count, int) or isinstance(count, bool):
            raise Unreadable("回應不是節目表（count 不是整數）")  # v2: without it the pages cannot be told complete
        if count < len(d["rows"]):
            raise Unreadable("回應不是節目表（count 比這一頁的筆數少）")  # v3: a count of another meaning would stop the pages early
        came += len(d["rows"])
        rows += [p for p in d["rows"] if not isinstance(p, dict) or not p.get("_id") or first(got, "wwy:%s" % p["_id"], ids)]
        if not d["rows"] or count <= came:
            break
    if came >= WWY_PAGES * WWY_SIZE or count > came:
        got["full"] = came  # the last page read and more said to be there
    for p in rows:
        got["n"] += 1
        if not isinstance(p, dict):
            got["bad"].append(("wwy:?", "", "讀不出場次"))  # an entry of another shape: said, not skipped
            continue
        c = p.get("chinese") or {}
        uid, title = "wwy:%s" % p.get("_id"), str(c.get("title") or "").strip()
        if too_long(got, uid, title, len((p.get("dateTime") or {}).get("discrete") or [])):
            continue
        cats = [WWY_CATALOG.get(k, "?") for k in p.get("catalogs") or []]
        if not cats:
            got["bad"].append((uid, title, "類別不認得"))  # no catalogue at all: not understood, never 「不在範圍」 (v2)
            continue
        cat = 1 if 1 in cats else 2 if 2 in cats else "?" if "?" in cats else None
        if cat is None:
            got["out"] += 1  # every code known, none for the list (展覽, 舞蹈, 講座…)
            continue
        if cat == "?":
            cat = 2
            got["odd"] += 1  # a code nobody has named: rated as 戲劇 (title filters apply), and said so
        site, when = c.get("site") or {}, p.get("dateTime") or {}
        hall = None if site.get("isOther") else WWY_SITE.get(site.get("site"))
        if not site.get("isOther") and not hall:
            got["bad"].append((uid, title, "廳名不認得"))
            continue
        times = [x.get("time") for x in when.get("discrete") or []] if when.get("type") == "discrete" else []
        if not p.get("_id") or not title or not hall or not times or not all(isinstance(x, (int, float)) for x in times):
            got["bad"].append((uid, title, "讀不出場次"))  # isOther (a free-text place), continuous (a span), no shows
            continue
        shows = [(w.date().isoformat(), w.strftime("%H:%M"), "衛武營國家藝術文化中心" + hall, "高雄市")
                 for w in (dt.datetime.fromtimestamp(x, TW) for x in times)]  # 台灣時間
        sales = ((p.get("activity") or {}).get("ticket") or {}).get("link") if (p.get("activity") or {}).get("type") == "ticket" else ""
        got["rows"].append((cat, row(uid, title, shows, sales, WWY_PAGE % p["_id"], "wwy")))


def after(text, start, pattern):
    """pattern tried once, where `start` is first found in text (None when it is not there)."""
    i = text.find(start)
    return pattern.match(text, i) if i >= 0 else None


def ntt(got, day, end, ask):
    text = ask(NTT).decode("utf-8", "replace")
    cards = text.split(NTT_CARD)[1:]
    if not cards:
        raise Unreadable("沒有節目卡")
    ids = set()
    for card in cards:
        card = card[:CARD_CHARS]
        cut = [i for i in (card.find(x) for x in NTT_NEXT) if i >= 0]
        head, _, tail = card[:min(cut)].partition("</h3>") if cut else card.partition("</h3>")  # this card's own part alone
        link, place = after(head, 'href="/program/events/', NTT_LINK), after(head, 'class="events-place"', NTT_PLACE)
        uid, title = ("ntt:%s" % link.group(1), html.unescape(link.group(2)).strip()) if link else ("ntt:?", "")
        if link and not first(got, uid, ids):
            continue
        got["n"] += 1
        hall = html.unescape(place.group(1)).strip() if place else ""
        i = tail.find('<p class="event-time"')
        j = tail.find("</p>", i) if i >= 0 else -1
        days = sorted({"%s-%02d-%02d" % (y, int(m), int(d)) for y, m, d in NTT_DAY.findall(tail[i:j])}) if j >= 0 else []
        if not link or not title or not hall:
            got["bad"].append((uid, title, "節目卡看不懂"))  # a link, a title or a place missing in this card (v2)
            continue
        if too_long(got, uid, title, 0):  # two shows at most here: the title alone
            continue
        if not days or not all(map(is_day, days)):
            got["bad"].append((uid, title, "讀不出場次"))
            continue
        buy = after(tail, 'btn-buy-ticket"', NTT_BUY)
        shows = [(x, "", "臺中國家歌劇院" + hall, "臺中市") for x in dict.fromkeys([days[0], days[-1]])]  # the card has the first and last day only
        got["rows"].append((1, row(uid, title, shows, html.unescape(buy.group(1)).strip() if buy else "", NTT_PAGE % link.group(1), "ntt")))


def loads(body):
    try:
        return json.loads(body.decode("utf-8"))
    except ValueError:
        raise Unreadable("回應不是 JSON") from None


def blank(note=""):
    return {"ok": False, "n": 0, "note": note, "rows": [], "out": 0, "cancelled": 0, "bad": [], "odd": 0, "full": 0, "dup": []}


def read(day, end, room=lambda timeout, retries, pause: True, get=http_get):
    """Every venue on its own (an error, a timeout, an answer of another shape, over MAX_BYTES or ALL_SHOWS, or no programme at all:
    that venue alone is unreadable today); room(timeout, retries, pause) says whether a request may still begin (fetch's
    time limit: a venue it says no to is 「時間不夠，沒有讀」)."""
    asked = [0]

    def ask(url):
        pause = PAUSE if asked[0] else 0
        if not room(TIMEOUT, TRIES, pause):
            raise Unreadable("時間不夠，沒有讀")
        if pause:
            time.sleep(pause)
        asked[0] += 1
        status, _, body = get(url, timeout=TIMEOUT, retries=TRIES)
        if status != 200:
            raise Unreadable("HTTP %s" % status)
        if len(body) > MAX_BYTES:
            raise Unreadable("回應超過 %d MB" % (MAX_BYTES // 1024 // 1024))
        return body

    out = {}
    for k, step in (("ntch", ntch), ("wwy", wwy), ("ntt", ntt)):
        got = blank()
        try:
            step(got, day, end, ask)
            if not got["n"]:
                raise Unreadable("讀到 0 檔")  # an empty list is not 「今天沒有節目」
            if not got["rows"] and not got["out"] and not got["cancelled"]:
                raise Unreadable("%d 檔都讀不出來" % got["n"])  # a new layout, not a list of programmes without shows
            shows = sum(len(e["showInfo"]) for _, e in got["rows"])
            if shows > ALL_SHOWS:
                raise Unreadable("場次共 %d 場，超過 %d 場" % (shows, ALL_SHOWS))
            got["ok"] = True
            if got["full"]:
                got["note"] = "讀滿 %d 檔，可能還有沒讀到的" % got["full"]  # read, and said so (v2)
        except Exception as e:  # noqa: BLE001 — any failure is this venue's alone; the others and the other sources go on
            got = blank(why(e))
        out[k] = got
    return out
