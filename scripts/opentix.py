#!/usr/bin/env python3
"""OPENTIX (www.opentix.life), the second source of 近期演出 next to the Ministry of Culture's open data, which lost the
programmes sold through OPENTIX in 2026-11. Reading and parsing only; scripts/concerts.py fetch decides what to do.

  sitemap_ids()   the programme ids in https://www.opentix.life/otWebSitemap.xml (one GET; lastmod is not used: it
                  moves with every change of ticket status)
  page(id)        one programme page: title, category, organisers, description and its shows (schema.org Event); a
                  page without a title, or with neither shows nor a 類別 line (maintenance, a new layout), raises
                  NotProgramme; a page whose data has an unexpected shape raises ValueError
  created(id)     when the programme was created: the id is a snowflake, (id >> 22) + 1288834974657 is in milliseconds
  ids_in(text)    OPENTIX ids in a URL or any text (/event/<id> and /program/<id> are the same id)

Public pages only: the paper's own User-Agent (common.http_get), no cookies, no login; 1.5 s between two pages.
Stdlib only.
"""
import datetime as dt
import html
import json
import os
import re
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import http_get  # noqa: E402

SITEMAP = "https://www.opentix.life/otWebSitemap.xml"
PAGE = "https://www.opentix.life/event/%s"
PAUSE = 1.5       # seconds between two programme pages
MAX_PAGES = 80    # programme pages per fetch
TIMEOUT = 30      # the sitemap
TRIES = 3         # its retries (common.http_get's)
PAGE_TIMEOUT = 20  # a programme page, asked for once (no retry): a host that hangs must not hold up the whole shift
EPOCH = 1288834974657
SUFFIX = " — OPENTIX兩廳院文化生活"
ID = re.compile(r"^\d{19}$")
ID_URL = re.compile(r"opentix\.life/(?:event|program)/(\d{19})")
LOC = re.compile(r"<loc>\s*https?://www\.opentix\.life/event/(\d{19})\s*</loc>")
LD = re.compile(r"<script[^>]*application/ld\+json[^>]*>(.*?)</script>", re.S)
CATEGORIES = {"音樂", "戲劇", "音樂劇", "舞蹈", "親子", "展覽", "電影", "活動/學習", "演唱會", "其他", "商品", "免費身障"}  # OPENTIX's own (v6 J1, v7)
CATEGORY = re.compile(r"類別：\s*(?:<[^>]*>\s*)*([^<]*?)\s*<")
CATEGORY_TAG = re.compile(r"類別：\s*</span>\s*<span\b[^>]*?\sclass\s*=\s*[\"'][^\"'>]*oa-cardTypeTag[^>]*>(?:\s*<(?!/span\b)[^>]*>)*([^<]*)<")  # v7: the page's own label (類別：</span> <span class="oa-cardTypeTag …">音樂</span>), tags and comments before its text skipped as CATEGORY does, never past its </span>; none, or no text: CATEGORY, as in v6
_pages = 0        # pages asked for by this process (the pause goes between two of them)


class NotProgramme(ValueError):
    """A 200 answer that is not a programme page (no title, or neither shows nor a 類別 line)."""


def ids_in(text):
    return ID_URL.findall(text or "")


def created(i):
    return dt.datetime.fromtimestamp(((int(i) >> 22) + EPOCH) / 1000, dt.timezone.utc)


def city(locality):
    """臺北市 → 台北, 苗栗縣 → 苗栗: the short name of the city or county a show is in."""
    return re.sub(r"[市縣]$", "", (locality or "").strip()).replace("臺", "台")


def sitemap_ids():
    """Every /event/<id> in the sitemap, smallest first. An answer without any is an error, not 「沒有節目」."""
    _, _, body = http_get(SITEMAP, timeout=TIMEOUT, retries=TRIES)
    ids = sorted(set(LOC.findall(body.decode("utf-8", "replace"))), key=int)
    if not ids:
        raise ValueError("sitemap 裡沒有節目")
    return ids


def meta(text, prop):
    m = re.search(r'property="%s"\s+content="([^"]*)"' % re.escape(prop), text)
    return html.unescape(m.group(1)).strip() if m else ""


def events(text):
    """The schema.org Event blocks of a page; the same show given twice (date and hall) counts once."""
    out, keys = [], set()
    for block in LD.findall(text):
        try:
            got = json.loads(block)
        except ValueError:
            continue
        for e in got if isinstance(got, list) else [got]:
            if not (isinstance(e, dict) and e.get("@type") == "Event"):
                continue
            loc = e.get("location") if isinstance(e.get("location"), dict) else {}
            k = (e.get("startDate"), loc.get("name"))
            if k not in keys:
                keys.add(k)
                out.append(e)
    return out


def num(v):
    return "%d" % v if isinstance(v, (int, float)) and v == int(v) else str(v or "")


def page(i):
    """One programme page parsed; HTTP errors, timeouts and a page that is not a programme page are raised."""
    global _pages
    if _pages:
        time.sleep(PAUSE)
    _pages += 1
    url = PAGE % i
    _, _, body = http_get(url, timeout=PAGE_TIMEOUT, retries=0)
    text = body.decode("utf-8", "replace")
    title = meta(text, "og:title")
    if title.endswith(SUFFIX):
        title = title[:-len(SUFFIX)]
    m = CATEGORY.search(text)
    got = events(text)
    if not title.strip() or not (got or m):
        raise NotProgramme("不是節目頁（沒有標題，或沒有場次也沒有類別）")
    shows, units = [], []
    for e in got:
        loc = e.get("location") if isinstance(e.get("location"), dict) else {}
        addr = loc.get("address") if isinstance(loc.get("address"), dict) else {}
        offer = e.get("offers") if isinstance(e.get("offers"), dict) else {}
        low, high = num(offer.get("lowPrice")), num(offer.get("highPrice"))
        shows.append({"start": e.get("startDate") or "", "venue": (loc.get("name") or "").strip(),
                      "locality": (addr.get("addressLocality") or "").strip(), "street": (addr.get("streetAddress") or "").strip(),
                      "city": city(addr.get("addressLocality")), "price": "%s–%s" % (low, high) if low and high else low or high,
                      "status": (e.get("eventStatus") or "").rsplit("/", 1)[-1]})
        for o in e.get("organizer") or []:
            if isinstance(o, dict) and o.get("name") and o["name"] not in units:
                units.append(o["name"])
    if not all(isinstance(v, str) for s in shows for v in s.values()) or not all(isinstance(u, str) for u in units):
        raise ValueError("節目頁的資料形狀不對")  # e.g. a startDate that is a number: unreadable, not a crash
    c = CATEGORY_TAG.search(text)   # v7: the page's own label first; a page without one, or whose label has no text, reads its first 類別 line, as in v6
    c = c if c and c.group(1).strip() else m
    return {"id": i, "url": url, "title": html.unescape(title).strip(), "category": c.group(1).strip() if c and c.group(1).strip() in CATEGORIES else "",
            "units": units, "desc": meta(text, "og:description"), "shows": shows}


def row(p):
    """A page in the shape of one open-data entry, for concerts.py fetch."""
    show = lambda s: {"time": (s["start"][:10].replace("-", "/") + " " + (s["start"][11:19] + ":00")[:8]) if s["start"] else "",  # noqa: E731
                      "location": s["locality"] + s["street"], "locationName": s["venue"], "price": s["price"]}
    return {"UID": p["id"], "title": p["title"], "showInfo": [show(s) for s in p["shows"]], "webSales": p["url"],
            "sourceWebPromote": p["url"], "sourceWebName": "OPENTIX", "masterUnit": p["units"], "showUnit": "",
            "descriptionFilterHtml": p["desc"]}
