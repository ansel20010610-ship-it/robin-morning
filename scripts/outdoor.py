#!/usr/bin/env python3
"""出門前 (Vor dem Ausgehen): Taichung's air, weather warnings and closures, for the card the front page will show
(assets/outdoor.js). Run at every deploy, with the wires (.github/workflows/publish.yml), so every half hour. No AI, no
key: each source is a public file the agency's own web page loads (修改包/出門前_空品特報_1124/來源查證.md).

  air      環境部空氣品質監測網, one file per station and hour: json/airlist/airlist_<station>_<YYYYMMDDHH>.json, where the
           name's hour is the data's hour less one. All six Taichung stations are written; which one the card shows is
           the front page's choice. The newest hour is tried first, then up to three hours back: a file not out yet comes
           back as 200 with an HTML "Oops" page, not JSON. An AQI that is not a number (maintenance, too little data) is
           null — every field is read as "a number or nothing", never matched against the site's words. The level is
           worked out here from the official bands (0–50 良好 … 301 and up 危害), not taken from the site's script.
  alerts   中央氣象署: Warning_Taiwan.js (by county; '66' is Taichung), Warning_66.js (Taichung by district),
           Warning_Content.js (titles and times) and Info_Warning.js (the level names). The districts come from
           Warning_66.js: the county's 'T' list is the union of its parts, not the whole city, so "whole" is true only
           when every district carries the warning. Only weather warnings (wind, rain, fog, cold, heat, tropical
           depression) and land typhoon warnings are kept. With nothing in force the files carry no time, so their
           Last-Modified must be under CWA_MAX_AGE old for them to be believed. When the CWA files cannot be read, or
           are that old, the 民生示警平台 list for Taichung (/server/v1/Alerts/Search/immediate) stands in: per kind only
           its newest message counts, none when that one is a Cancel (解除), and each of its infos is an entry.
  closure  行政院人事行政總處 nds.html: the page's date, its 更新時間 and Taichung's row as the page words it
           (「今天停止上班、停止上課。」, 「今天照常上班、照常上課。」…, several lines when the city is split). Every county
           gets a row on a closure day, open ones too, so the words are read, not the row's presence. No Taichung row on
           a page that says 無停班停課訊息 is null.

content/outdoor.json:

  {"updated": "...+08:00",
   "air":     {"ok": true, "fetched": "...", "source": "...", "stations": [{"id": 142, "name": "臺灣大道", "type": "交通站",
               "aqi": 61, "level": "普通", "time": "2026-11-24T21:00+08:00"}, ...]},
   "alerts":  {"ok": true, "fetched": "...", "source": "...", "modified": "...", "items": [{"name": "陸上強風特報",
               "level": "黃色", "code": "W25-1", "areas": ["大甲區", ...], "whole": false, "issued": "...", "validto": "..."}]},
   "closure": {"ok": true, "fetched": "...", "source": "...", "date": "2026-11-24", "updated": "...", "taichung": null}}

"ok" says whether this run read the section; "fetched" is when its data was read. A section that cannot be read this time
keeps the previous file's (publish.yml fetches the live one first), with "ok": false and "stale": true — as wire.py does
with a feed — so one source down never empties the card. With no earlier copy it is {"ok": false, "fetched": null}. So
"no warning" (ok, items []) and "could not tell" (not ok) stay apart. A station not read this time keeps its last entry
with "stale": true, and says so on stderr; one station failing does not stop the others. "whole" is true (every
district), false (the districts in "areas") or null when the reach is not known: a land typhoon warning the CWA gives
without a county breakdown, or a code the county list carries that no district does.

Every request gives up after 15 s and the whole run after about 90; the three sections run side by side. Each request
goes out with common.UA; a firewall's refusal (403, "Request Rejected") is tried once more, a second later, with the same
one. A section not read this time is said on stdout as a ::warning:: line, for the Actions summary. The exit code is 1
only when all three sections failed with nothing earlier to keep; anything else, its own errors included, is 0.

Usage: python3 scripts/outdoor.py      (standard library only)
"""
import datetime as dt
import email.utils
import html
import json
import os
import re
import sys
import threading
import time
import traceback
import urllib.error
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import CONTENT, TW, UA  # noqa: E402

OUT = os.path.join(CONTENT, "outdoor.json")
TOTAL = 85        # seconds for all the requests together; the threads are given up on a little after
PER_REQUEST = 15  # seconds

AIR_URL = "https://airtw.moenv.gov.tw/json/airlist/airlist_{}_{}.json"
AIR_SOURCE = "環境部空氣品質監測網"
# Taichung's stations (環境部 numbering), in that order in the file.
STATIONS = [(7, "大里"), (25, "西屯"), (26, "沙鹿"), (28, "忠明"), (74, "豐原"), (142, "臺灣大道")]
# Read first: the two nearest the paper's weather point (來源查證.md), the ones the card is likeliest to show, so that a
# slow host spends the run's time on the others first.
READ_FIRST = (142, 28)
AIR_BACK = 3  # hours tried before the newest, each a file of its own
# 環境部 AQI bands: the top of each band and its words.
AQI_BANDS = [(50, "良好"), (100, "普通"), (150, "對敏感族群不健康"), (200, "對所有族群不健康"), (300, "非常不健康")]
AQI_TOP = "危害"

CWA = "https://www.cwa.gov.tw/Data/js/"
CWA_FILES = {"taiwan": "warn/Warning_Taiwan.js", "towns": "warn/Warning_66.js", "content": "warn/Warning_Content.js",
             "info": "info/Info_Warning.js"}
CWA_SOURCE = "中央氣象署"
# With nothing in force the files carry no time of their own, so their Last-Modified tells whether they are still being
# written (on 11-24, with a warning out, every 4–8 minutes, the text unchanged). Warning_Taiwan.js, Warning_66.js and
# Warning_Content.js older than this, or without one, are not believed: a file left behind would read as "no warning".
# 3 hours is 編輯部自訂、未驗證 — how often they are rewritten on a day with nothing in force has not been seen; read a
# quiet day's run log (the "Last-Modified" lines on stderr) before changing it.
CWA_MAX_AGE = dt.timedelta(hours=3)
COUNTY = "66"
# Taichung's districts by the CWA's codes (Warning_66.js), in its order.
TOWNS = {
    "6600100": "中區", "6600200": "東區", "6600300": "南區", "6600400": "西區", "6600500": "北區", "6600600": "西屯區",
    "6600700": "南屯區", "6600800": "北屯區", "6600900": "豐原區", "6601000": "東勢區", "6601100": "大甲區", "6601200": "清水區",
    "6601300": "沙鹿區", "6601400": "梧棲區", "6601500": "后里區", "6601600": "神岡區", "6601700": "潭子區", "6601800": "大雅區",
    "6601900": "新社區", "6602000": "石岡區", "6602100": "外埔區", "6602200": "大安區", "6602300": "烏日區", "6602400": "大肚區",
    "6602500": "龍井區", "6602600": "霧峰區", "6602700": "太平區", "6602800": "大里區", "6602900": "和平區",
}
TOWN_ORDER = {name: i for i, name in enumerate(TOWNS.values())}
# The weather warnings kept (Info_Warning.js codes): typhoon, tropical depression, wind, rain, fog, cold, heat.
CWA_KEPT = ("W21", "W23", "W25", "W26", "W27", "W28", "W29")
# Used only when Info_Warning.js or a title in Warning_Content.js is missing: the names those files give.
CWA_NAMES = {"W21": "颱風警報", "W23": "熱帶性低氣壓特報", "W25": "陸上強風特報", "W27": "濃霧特報", "W28": "低溫特報", "W29": "高溫資訊"}
RAIN = {"1": "大雨", "2": "豪雨", "3": "大豪雨", "4": "超大豪雨"}
LIGHTS = {"1": "黃色", "2": "橙色", "3": "紅色"}
LIGHTED = ("W25", "W28", "W29")  # the warnings with a colour light

NCDR_URL = "https://alerts.ncdr.nat.gov.tw/server/v1/Alerts/Search/immediate?county=" + urllib.parse.quote("臺中市")
NCDR_SOURCE = "民生示警平台"
# The platform's codes for the same warnings: typhoon, rain, cold, wind, fog, heat.
NCDR_KEPT = {"TY", "RA", "CS", "SW", "DsF", "htW"}
# One rain message carries an info per level, all under one headline (2026-08-24 17:28: 豪雨特報 over both its 豪雨 and
# its 大雨 districts); the list tells them apart only by severity, which that message's CAP file gives as 大雨 Moderate,
# 豪雨 Severe, 大豪雨 and 超大豪雨 Extreme (named here by the lower of the two).
NCDR_RAIN = {"Moderate": "大雨特報", "Severe": "豪雨特報", "Extreme": "大豪雨特報"}
SEVERITY = {"Extreme": 3, "Severe": 2, "Moderate": 1}

DGPA_URL = "https://www.dgpa.gov.tw/typh/daily/nds.html"
DGPA_SOURCE = "行政院人事行政總處"
CITY = ("臺中市", "台中市")

SECTIONS = ("air", "alerts", "closure")
LABELS = {"air": "空氣", "alerts": "天氣特報", "closure": "停班停課"}


# ---- fetching -------------------------------------------------------------------------------------------------------

class Budget:
    """The run's time: each request gets at most PER_REQUEST seconds and never more than is left."""

    def __init__(self, seconds):
        self.end = time.monotonic() + seconds

    def left(self):
        return self.end - time.monotonic()


class Spent(TimeoutError):
    """The run's time is used up: no more requests, from any section. (Not a request's own timeout, which on Python 3.10
    and later is a TimeoutError too.)"""


def _blocked(status, body):
    return status == 403 or b"Request Rejected" in body[:600] or b"requested URL was rejected" in body[:600]


def get(url, budget):
    """(status, headers, body) of a GET with common.UA; an HTTP error status is returned, not raised. A network failure
    raises, and so does a spent budget (Spent). A firewall's refusal (403, "Request Rejected") is tried once more, a
    second later, with the same User-Agent — on 11-24 it came and went whatever the User-Agent was; one that stays is
    left to the fallbacks (the platform, the kept copy)."""
    host = urllib.parse.urlsplit(url).hostname or ""
    for attempt in (1, 2):
        left = budget.left()
        if left < 1:
            raise Spent("time budget spent")
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
        try:
            with urllib.request.urlopen(req, timeout=min(PER_REQUEST, left)) as r:
                status, headers, body = r.status, r.headers, r.read(4_000_000)
        except urllib.error.HTTPError as e:
            status, headers = e.code, e.headers
            try:
                body = e.read(600)
            except Exception:  # noqa: BLE001
                body = b""
        if not _blocked(status, body):
            return status, headers, body
        if attempt == 1:
            print(f"{host}: turned away by its firewall ({status}); once more in a second", file=sys.stderr)
            time.sleep(max(0.0, min(1.0, budget.left() - 1)))
        else:
            print(f"{host}: turned away again ({status})", file=sys.stderr)
    return status, headers, body


def _iso(d):
    return d.astimezone(TW).isoformat(timespec="minutes")


def _when(text, fmt_re):
    """'2026/11/24 21:00' or '2026-11-24T21:00:00' (Taiwan time, no zone) as an aware datetime, or None."""
    m = re.search(fmt_re, str(text or ""))
    if not m:
        return None
    try:
        return dt.datetime(*(int(x) for x in m.groups() if x is not None), tzinfo=TW)
    except ValueError:
        return None


SLASHED = r"(\d{4})/(\d{1,2})/(\d{1,2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?"
DASHED = r"(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?"


def _stamp(text, fmt_re):
    d = _when(text, fmt_re)
    return _iso(d) if d else None


# ---- air ------------------------------------------------------------------------------------------------------------

def number(v):
    """An AQI as an int, or None for anything that is not a plain number ('-', '設備維護', '')."""
    s = str(v if v is not None else "").strip()
    return int(round(float(s))) if re.fullmatch(r"\d+(\.\d+)?", s) else None


def aqi_level(aqi):
    if aqi is None:
        return None
    for top, words in AQI_BANDS:
        if aqi <= top:
            return words
    return AQI_TOP


def parse_airlist(body):
    """A station file's fields as one dict, or None when it is not the station's JSON (the "Oops" page of a file not
    out yet)."""
    try:
        rows = json.loads(body.decode("utf-8-sig"))
    except (ValueError, UnicodeDecodeError):
        return None
    if not isinstance(rows, list):
        return None
    f = {}
    for row in rows:
        if isinstance(row, dict):
            f.update(row)
    return f if ("AQI" in f or "date" in f) else None


def station(sid, name, f, hour):
    """The file's entry for a station read this time."""
    aqi = number(f.get("AQI"))
    t = _when(f.get("date"), SLASHED) or hour
    kind = "/".join(dict.fromkeys(p.strip() for p in str(f.get("sitetype") or "").split("/") if p.strip())) or None
    return {"id": sid, "name": name, "type": kind, "aqi": aqi, "level": aqi_level(aqi), "time": _iso(t)}


def read_air(now, budget, before):
    """Each station on its own: one that times out or is refused is said on stderr and the next is tried. Only a spent
    run stops them all. An hour found not out yet for one station is not asked again for the others."""
    newest = now.astimezone(TW).replace(minute=0, second=0, microsecond=0)
    kept = {s.get("id"): s for s in (before or {}).get("stations") or [] if isinstance(s, dict)}
    order = [s for first in READ_FIRST for s in STATIONS if s[0] == first] + [s for s in STATIONS if s[0] not in READ_FIRST]
    got, why, not_out, spent = {}, {}, set(), False
    for sid, name in order:
        if spent:
            why[sid] = "the run's time was spent"
            continue
        for back in range(AIR_BACK + 1):
            hour = newest - dt.timedelta(hours=back)
            stamp = (hour - dt.timedelta(hours=1)).strftime("%Y%m%d%H")
            if stamp in not_out:
                continue
            try:
                status, _, body = get(AIR_URL.format(sid, stamp), budget)
            except Spent:
                spent, why[sid] = True, "the run's time was spent"
                break
            except Exception as e:  # noqa: BLE001 — this station only: the next one is tried
                why[sid] = f"{type(e).__name__}: {e}"
                break
            if status == 404:
                continue
            if status != 200:
                why[sid] = f"HTTP {status}"
                break
            f = parse_airlist(body)
            if f is None:  # not out yet (the "Oops" page): the hour before
                if back == 0:
                    not_out.add(stamp)
                continue
            if str(f.get("county") or "臺中市").replace("台", "臺") != "臺中市":
                why[sid] = f"the file is for {f.get('county')}"
                break
            got[sid] = station(sid, name, f, hour)
            break
    for sid, _ in STATIONS:
        if sid not in got and sid not in why:
            why[sid] = f"no file in the last {AIR_BACK + 1} hours"
    out = []
    for sid, name in STATIONS:
        if sid in got:
            out.append(got[sid])
            continue
        reason = why[sid]
        old = kept.get(sid)
        if old and old.get("time"):
            out.append(dict(old, stale=True))
            print(f"air: {sid} {name} kept from {old['time']} ({reason})", file=sys.stderr)
        else:
            out.append({"id": sid, "name": name, "type": None, "aqi": None, "level": None, "time": None})
            print(f"air: {sid} {name} not read, nothing earlier to keep ({reason})", file=sys.stderr)
    if not got:
        raise RuntimeError("no station could be read (" + "; ".join(sorted(set(why.values()))) + ")")
    return {"ok": True, "fetched": _iso(now), "source": AIR_SOURCE, "stations": out}


# ---- alerts ---------------------------------------------------------------------------------------------------------

def js_to_json(text):
    """The object literals of the CWA's data files as JSON: '…' strings become "…", comments and trailing commas go."""
    out, i, n = [], 0, len(text)
    while i < n:
        c = text[i]
        if c in "'\"":
            j, buf = i + 1, []
            while j < n and text[j] != c:
                if text[j] == "\\" and j + 1 < n:
                    e = text[j + 1]
                    if e == "u" and re.fullmatch(r"[0-9a-fA-F]{4}", text[j + 2:j + 6]):
                        buf.append(chr(int(text[j + 2:j + 6], 16)))
                        j += 6
                        continue
                    buf.append({"n": "\n", "t": "\t", "r": "\r"}.get(e, e))
                    j += 2
                else:
                    buf.append(text[j])
                    j += 1
            out.append(json.dumps("".join(buf), ensure_ascii=False))
            i = j + 1
        elif text.startswith("//", i):
            j = text.find("\n", i)
            i = n if j < 0 else j
        elif text.startswith("/*", i):
            j = text.find("*/", i + 2)
            i = n if j < 0 else j + 2
        elif c in "}]":
            while out and out[-1].isspace():
                out.pop()
            if out and out[-1] == ",":
                out.pop()
            out.append(c)
            i += 1
        else:
            out.append(c)
            i += 1
    return "".join(out)


def js_vars(text):
    """{name: value} for each `var name = <literal>;` of a CWA data file."""
    s, dec, found = js_to_json(text), json.JSONDecoder(), {}
    for m in re.finditer(r"\bvar\s+(\w+)\s*=\s*", s):
        try:
            found[m.group(1)], _ = dec.raw_decode(s, m.end())
        except ValueError:
            continue
    return found


def _towns_order(names):
    return sorted(dict.fromkeys(names), key=lambda a: TOWN_ORDER.get(a, len(TOWN_ORDER)))


def parse_cwa(taiwan_js, towns_js, content_js, info_js=None):
    """The warnings in force for Taichung, one per code and level (W26-1 大雨 and W26-2 豪雨 are two), from the CWA's
    files as text. Raises ValueError when a file is not what it should be."""
    county = js_vars(taiwan_js).get("WarnTown")
    towns = js_vars(towns_js).get("WarnTown")
    content = js_vars(content_js).get("WarnContent")
    if not isinstance(county, dict) or not isinstance(county.get(COUNTY), dict):
        raise ValueError("Warning_Taiwan.js has no Taichung")
    if not isinstance(towns, dict) or not any(str(k).startswith(COUNTY) for k in towns):
        raise ValueError("Warning_66.js has no districts")
    if not isinstance(content, dict):
        raise ValueError("Warning_Content.js has no WarnContent")
    levels = {}
    if info_js:
        levels = js_vars(info_js).get("WarnLevel") or {}
    ours = [t for t in towns if str(t).startswith(COUNTY)]
    codes = list(dict.fromkeys(c for part in county[COUNTY].values() if isinstance(part, list) for c in part))
    broken_down = {str(c).split("-")[0] for parts in county.values() if isinstance(parts, dict)
                   for part in parts.values() if isinstance(part, list) for c in part}

    def text(key):
        c = content.get(key)
        return c.get("C") if isinstance(c, dict) and isinstance(c.get("C"), dict) else {}

    def entry(base, n, c, areas, whole):
        named = levels.get(base) if isinstance(levels, dict) else None
        named = named.get(n) if isinstance(named, dict) else None
        named = named.get("C") if isinstance(named, dict) else None
        if base == "W26":
            name = f"{named or RAIN.get(n, '大雨')}特報"
        else:
            name = c.get("title") or CWA_NAMES.get(base, base)
        light = None
        if base in LIGHTED:
            m = re.search(r"[黃橙紅]色", named or "")
            light = m.group(0) if m else LIGHTS.get(n)
        return {"name": name, "level": light, "code": f"{base}-{n}" if n else base, "areas": areas, "whole": whole,
                "issued": _stamp(c.get("issued"), SLASHED), "validto": _stamp(c.get("validto"), SLASHED)}

    items = []
    for code in codes:
        base, _, n = str(code).partition("-")
        if base not in CWA_KEPT:
            continue
        areas = _towns_order(TOWNS.get(t, t) for t in ours if isinstance(towns[t], list) and code in towns[t])
        if not areas and base != "W21":
            # the county list has it, no district does: most likely the two files caught a few seconds out of step
            print(f"alerts: Warning_Taiwan.js gives Taichung {code}, no district in Warning_66.js has it; reach unknown",
                  file=sys.stderr)
        c = text(base) or (text("TY_WARN") if base == "W21" else {})
        items.append(entry(base, n, c, areas, len(areas) == len(ours) if areas else None))
    # A land typhoon warning the CWA does not break down by county: kept for Taichung, its reach unknown (whole null).
    if "W21" not in broken_down:
        c = text("W21") or text("TY_WARN")
        if "陸上" in (c.get("title") or ""):
            items.append(entry("W21", "", c, [], None))
    rank = {b: i for i, b in enumerate(CWA_KEPT)}
    grade = lambda x: int(x) if x.isdigit() else 0  # noqa: E731
    items.sort(key=lambda x: (rank.get(x["code"].split("-")[0], 99), -grade(x["code"].partition("-")[2])))
    return items


def parse_ncdr(d, now):
    """The same from the 民生示警平台's list for Taichung. Per kind only the newest message counts — the older ones in the
    list are superseded, end times and all — and nothing of the kind is in force when that one is a Cancel (解除),
    whether or not the Cancel has run out since. One message can carry several infos (one per rain level): each is an
    entry. Expired infos are left out."""
    if not isinstance(d, dict) or not isinstance(d.get("data"), list) or d.get("status") is False:
        raise ValueError("not the platform's list")
    kinds = {}
    for x in d["data"]:
        if isinstance(x, dict) and x.get("code") in NCDR_KEPT and "氣象" in str(x.get("org") or ""):
            kinds.setdefault(x["code"], []).append(x)
    found = []
    for code, xs in kinds.items():
        sent = max(str(x.get("sentDate") or "") for x in xs)
        latest = [x for x in xs if str(x.get("sentDate") or "") == sent]
        if any(str(x.get("msgType") or "").lower() == "cancel" for x in latest):
            continue
        infos = {}  # (headline, severity) -> [the first info, its Taichung areaDesc, its Taichung countyName]
        for x in latest:
            ends = _when(x.get("expires"), DASHED)
            if ends and ends < now:
                continue
            # the current list names the districts in areaDesc (countyName holds the counties); older entries name them
            # in countyName. A bare 臺中市 in areaDesc is the whole city; in countyName it only says some district is in.
            area = [a.strip() for a in str(x.get("areaDesc") or "").split(",") if a.strip().startswith(CITY)]
            county = [a.strip() for a in str(x.get("countyName") or "").split(",") if a.strip().startswith(CITY)]
            if not area and not county:
                continue
            key = (str(x.get("headline") or x.get("eventName") or "").strip(), str(x.get("severity") or ""))
            info = infos.setdefault(key, [x, [], []])
            info[1] += area
            info[2] += county
        for (head, severity), (x, area, county) in infos.items():
            m = re.fullmatch(r"(.+?)\s*[（(]([^）)]*)[）)]", head)
            name, note = (m.group(1), m.group(2)) if m else (head, "")
            if code == "RA" and severity in NCDR_RAIN:
                name = NCDR_RAIN[severity]
            light = re.search(r"[黃橙紅]色", note)
            areas = _towns_order(p[3:] for p in area + county if len(p) > 3)
            whole = True if any(p in CITY for p in area) or (areas and set(areas) >= set(TOWNS.values())) else (
                False if areas else None)
            found.append(((str(_stamp(x.get("effective"), DASHED) or ""), -SEVERITY.get(severity, 0)), {
                "name": name, "level": light.group(0) if light else None, "code": code, "areas": areas, "whole": whole,
                "issued": _stamp(x.get("effective"), DASHED), "validto": _stamp(x.get("expires"), DASHED)}))
    found.sort(key=lambda f: f[0])
    return [item for _, item in found]


def _modified(headers):
    """The Last-Modified header as an aware datetime, or None."""
    try:
        d = email.utils.parsedate_to_datetime(headers.get("Last-Modified"))
        return d if d.tzinfo else d.replace(tzinfo=dt.timezone.utc)
    except Exception:  # noqa: BLE001 — no header, or one that cannot be read
        return None


def read_cwa(now, budget):
    text, mod = {}, {}
    for key, path in CWA_FILES.items():
        try:
            status, headers, body = get(CWA + path, budget)
        except Exception:
            if key == "info":
                continue
            raise
        if status != 200 or _blocked(status, body):
            if key == "info":
                continue
            raise RuntimeError(f"{path}: HTTP {status}")
        text[key] = body.decode("utf-8", "replace")
        mod[key] = _modified(headers)
    for key in ("taiwan", "towns", "content"):  # Info_Warning.js is the code table, written once in a while
        if mod[key] is None:
            raise RuntimeError(f"{CWA_FILES[key]}: no Last-Modified")
        if now - mod[key] > CWA_MAX_AGE:
            raise RuntimeError(f"{CWA_FILES[key]}: Last-Modified {_iso(mod[key])}, more than "
                               f"{CWA_MAX_AGE.seconds // 3600} hours old")
    items = parse_cwa(text["taiwan"], text["towns"], text["content"], text.get("info"))
    return {"ok": True, "fetched": _iso(now), "source": CWA_SOURCE, "modified": _iso(mod["content"]), "items": items}


def read_ncdr(now, budget):
    status, _, body = get(NCDR_URL, budget)
    if status != 200:
        raise RuntimeError(f"HTTP {status}")
    items = parse_ncdr(json.loads(body.decode("utf-8-sig")), now)
    return {"ok": True, "fetched": _iso(now), "source": NCDR_SOURCE, "items": items}


def read_alerts(now, budget):
    try:
        return read_cwa(now, budget)
    except Exception as e:  # noqa: BLE001 — the platform stands in
        print(f"alerts: CWA files not read ({e}); trying {NCDR_SOURCE}", file=sys.stderr)
    return read_ncdr(now, budget)


# ---- closures -------------------------------------------------------------------------------------------------------

def _plain(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()


def parse_nds(page):
    """{"date": "YYYY-MM-DD", "updated": "...+08:00", "taichung": None | "the row's words"} from nds.html. Raises
    ValueError when the page is not the one it should be."""
    m = re.search(r'class="Header_YMD">\s*(\d{2,3})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日', page)
    if not m:
        raise ValueError("no date at the head of the page")
    try:
        date = dt.date(int(m.group(1)) + 1911, int(m.group(2)), int(m.group(3))).isoformat()
    except ValueError as e:
        raise ValueError(f"date at the head of the page: {e}") from None
    upd = re.search(r"更新時間：?\s*" + SLASHED, page)
    upd = _when(upd.group(0), SLASHED) if upd else None
    body = re.search(r'<TBODY[^>]*class="Table_Body"[^>]*>(.*?)(?:<!--|</TBODY>)', page, re.S | re.I)
    if not body:
        raise ValueError("no table on the page")
    rows = re.findall(r"<TD[^>]*headers='city_Name'[^>]*>(.*?)</TD>\s*<TD[^>]*headers='StopWorkSchool_Info'[^>]*>(.*?)</TD>",
                      body.group(1), re.S | re.I)
    taichung = None
    for city, info in rows:
        if _plain(city) in CITY:
            lines = [_plain(x) for x in re.split(r"<br\s*/?>", info, flags=re.I)]
            taichung = "\n".join(x for x in lines if x) or None
            break
    if not rows and "無停班停課訊息" not in body.group(1):
        raise ValueError("neither county rows nor 無停班停課訊息")
    return {"date": date, "updated": upd.isoformat(timespec="seconds") if upd else None, "taichung": taichung}


def read_closure(now, budget):
    status, _, body = get(DGPA_URL, budget)
    if status != 200:
        raise RuntimeError(f"HTTP {status}")
    info = parse_nds(body.decode("utf-8", "replace"))
    return dict({"ok": True, "fetched": _iso(now), "source": DGPA_SOURCE}, **info)


# ---- the run --------------------------------------------------------------------------------------------------------

def kept(before):
    """A section of the previous file, carried over: its data as it was, marked not read this time."""
    if isinstance(before, dict) and (before.get("ok") or before.get("stale")) and before.get("fetched"):
        return dict(before, ok=False, stale=True)
    return {"ok": False, "fetched": None}


def run_sections(jobs, seconds):
    """Each job in a thread of its own; {name: section or the exception}. One still running at the end has failed."""
    done = {}

    def work(name, job):
        try:
            done[name] = job()
        except Exception as e:  # noqa: BLE001
            done[name] = e

    threads = [threading.Thread(target=work, args=(k, j), daemon=True) for k, j in jobs.items()]
    end = time.monotonic() + seconds
    for t in threads:
        t.start()
    for t in threads:
        t.join(max(0.0, end - time.monotonic()))
    return {k: done.get(k, TimeoutError("still running at the end of the run")) for k in jobs}


def load(path):
    try:
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        return d if isinstance(d, dict) else {}
    except (OSError, ValueError):
        return {}


def main():
    try:
        now = dt.datetime.now(TW)
        before = load(OUT)
        budget = Budget(TOTAL)
        got = run_sections({
            "air": lambda: read_air(now, budget, before.get("air")),
            "alerts": lambda: read_alerts(now, budget),
            "closure": lambda: read_closure(now, budget),
        }, TOTAL + 3)
        data = {"updated": _iso(now)}
        for k in SECTIONS:
            if isinstance(got[k], dict):
                data[k] = got[k]
            else:
                print(f"{k}: {got[k]!r}", file=sys.stderr)
                data[k] = kept(before.get(k))
        tmp = OUT + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=1)
            f.write("\n")
        os.replace(tmp, OUT)
        air = [s for s in data["air"].get("stations") or [] if not s.get("stale") and s.get("time")]
        print("air: " + (f"{len(air)} stations" if data["air"]["ok"] else "kept" if data["air"].get("stale") else "none")
              + "; alerts: " + (f"{len(data['alerts']['items'])} ({data['alerts']['source']})" if data["alerts"]["ok"]
                                else "kept" if data["alerts"].get("stale") else "none")
              + "; closure: " + (repr(data["closure"]["taichung"]) if data["closure"]["ok"]
                                 else "kept" if data["closure"].get("stale") else "none"))
        for k in SECTIONS:  # into the Actions summary: a source that goes on failing shows there, not only in the log
            if not data[k]["ok"]:
                print(f"::warning::出門前：{LABELS[k]}這次沒讀到，" +
                      (f"沿用 {data[k]['fetched']}" if data[k].get("stale") else "也沒有上一份可沿用"))
        if not any(data[k]["ok"] or data[k].get("stale") for k in SECTIONS):
            print("no section read and none to keep", file=sys.stderr)
            return 1
        return 0
    except Exception:  # noqa: BLE001 — its own error: the old file (if any) stays as it was
        traceback.print_exc()
        try:
            os.remove(OUT + ".tmp")
        except OSError:
            pass
        if os.path.exists(OUT) and not load(OUT):
            # the copy fetched from the site is no file the card can read: better none than that one deployed again
            try:
                os.remove(OUT)
            except OSError:
                pass
        return 0 if os.path.exists(OUT) else 1


if __name__ == "__main__":
    sys.exit(main())
