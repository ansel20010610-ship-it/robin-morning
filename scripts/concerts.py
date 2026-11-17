#!/usr/bin/env python3
"""近期演出: the standing list of concerts, operas and musicals at the foot of the front page (content/concerts.json).
It is not part of any issue; the 演出資訊 routine keeps it current (editorial/columns/concerts.md).

  python3 scripts/concerts.py fetch            # new candidates from the Ministry of Culture's open data and OPENTIX
                                               #   → /tmp/robin/concert-candidates.md (+ .json for `close`); the same
                                               #   file ends with 「## 已列入演出的異動」 when the feed's or OPENTIX's
                                               #   shows for a listed event differ from concerts.json (vanished, changed, new)
  python3 scripts/concerts.py close [--reject UID=理由 ...] [--keep UID ...]
                                               # after rating: a candidate an event names is listed, one given a reason
                                               #   is rejected (title, shows and reason kept), the rest come back
  python3 scripts/concerts.py blocked [--since DATE]   # what was turned away, and why
  python3 scripts/concerts.py reopen [UID ...] [--all] [--since DATE] [--old-rules]   # rejections back to candidates
  python3 scripts/concerts.py prune            # drop shows already over, and seen UIDs whose shows are over
  python3 scripts/concerts.py check            # the file's schema and voice (validate.py --concerts runs the same)
  python3 scripts/concerts.py sweep-due        # is the sweep due; when it is, the sources and the evidence format
  python3 scripts/concerts.py sweep-done --evidence FILE
  python3 scripts/concerts.py ot-scan [--all | --days N] --out FILE   # OPENTIX pages parsed into FILE; no state touched

Exit codes, for other programs: 0 done; 2 nothing recorded (fetch: neither the feed nor OPENTIX could be read; sweep-done:
no evidence or a malformed one); 3 not finished (fetch: one of the two sources could not be read, or the feed was
incomplete; sweep-done: evidence kept but a source was not looked at; sweep-due: the sweep is overdue).

Seen UIDs live in state/concerts/seen.json: a listed or rejected candidate is not offered again, unless a rejected one
gets a new date or city, or `reopen` puts it back. Stdlib only.
"""
import argparse
import datetime as dt
import difflib
import json
import os
import re
import sys
from time import monotonic

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import CONTENT, ROOT, http_get, tw_now  # noqa: E402
import opentix  # noqa: E402

FILE = os.path.join(CONTENT, "concerts.json")
SEEN = os.path.join(ROOT, "state", "concerts", "seen.json")
FETCHED = os.path.join(ROOT, "state", "concerts", "fetch.json")  # the last fetch: was the feed whole, what the filters dropped
# OPENTIX, the second source (the owner, 2026-11-14): {"known": [ids dealt with], "pending": {id: the day it first became a
# candidate}, "ends": {pending id: its last show}, "tries": {id: the first day its page was unreadable or without shows},
# "later": {id: the day to read it again}, "since": day}. A new programme is an id in the sitemap in none of them; the
# first run (no file) knows every id but those created in the last NEW_DAYS days, which the feed missed while it lacked
# OPENTIX. Where a new or pending id goes is ot_place's alone (spec v4 一, v5 第二類), every move is ot_move's and the
# file is written by ot_save alone (v5 第四類). A candidate stays pending, its page read again every fetch, until close
# has put it in seen.json.
OTSTATE = os.path.join(ROOT, "state", "concerts", "opentix.json")
NEW_DAYS = 21
STOP_AFTER = 3    # OPENTIX pages unreadable in a row (the host or a block, not 404/410, 「不是節目頁」 or shows unreadable): no more are asked for, and OPENTIX counts as unreadable
ALL_AFTER = 6     # this many pages read and every one unreadable (any reason): no more are asked for either
FETCH_SECONDS = 540  # the whole fetch (the feed and OPENTIX); no request is begun that could end past it (room)
RETRY_WAIT = 20   # the longest common.http_get waits between two tries
FEED_TRIES = 3    # retries of a feed request
STALE_DAYS = 10   # the newest programme in the sitemap this old: say so (a sitemap that stopped moving)
OT_CATEGORY = {"音樂": 1, "戲劇": 2, "音樂劇": 2}  # OPENTIX's 類別 as the feed's category; any other is not for the list
LOG_DAYS = 14  # fetch.json keeps a line a day of which source could be read
RULES = os.path.join(ROOT, "editorial", "columns", "concerts.md")
# The sweep for productions the open data never carries (concerts.md step 8): every second day (the owner, 2026-11-08:
# 每兩天跑一次; it was Mondays only, and a tour announced on a Tuesday waited six days). Kept by the date of the last
# finished sweep rather than by the calendar's parity, so a day the 演出班 fails or runs out of time simply leaves the
# sweep due the next morning.
SWEEP = os.path.join(ROOT, "state", "concerts", "sweep.json")
SWEEP_EVERY = 2  # days
# What a sweep must have looked at before sweep-done takes it as done (the owner, 2026-11-09: 為啥近期演出沒有 12/27 貝九).
# The sweep of 2026-11-09 opened one presenter's page, saw Currentzis and Lang Lang there without listing them, never
# looked at the others or at the three venues, and was recorded as finished all the same; the Ukrainian National Opera
# orchestra's 貝九 (12/26 衛武營, 12/27 國家音樂廳, sold outside OPENTIX) was on none of the pages it opened.
SWEEP_SOURCES = {
    "mna": "牛耳藝術（mna.com.tw，逐一打開每一檔的詳情頁）",
    "pbc": "鵬博藝術的節目頁",
    "newaspect": "新象的節目頁",
    "tanart": "傳大藝術的節目頁",
    "kham": "寬宏藝術（kham.com.tw）",
    "udn": "聯合數位文創（udnfunlife）與其他音樂劇、歌劇主辦（時藝多媒體等；售票在 KKTIX、年代、寬宏）",
    "ntch": "國家兩廳院節目頁（npac-ntch.org，含 TIFA 與 NSO 樂季；場館自售的不一定進開放資料）",
    "ntt": "臺中國家歌劇院節目頁（npac-ntt.org）",
    "wwy": "衛武營節目頁（npac-weiwuying.org）",
    "news": "新聞與售票系統（誠品 meet.eslite.com、年代、KKTIX、wekengo）關鍵字：「交響樂團 來台」「訪台 音樂會 國家音樂廳」"
            "「歌劇院 來台」「鋼琴家 來台 獨奏會」「音樂劇 原版 來台」；十月到一月另查「貝九 12月」「聖誕 音樂會 國家音樂廳」"
            "「跨年 音樂會 衛武營」「新年音樂會 台中」",
}
TMP = "/tmp/robin"
CANDS = os.path.join(TMP, "concert-candidates")
# 文化部藝文活動開放資料 (https://cloud.culture.tw): category 1 = 音樂, 2 = 戲劇. No key; OPENTIX, 年代 and the venues feed it.
FEED = "https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ&category=%d"
WINDOW = 150  # days ahead
CITIES = {"臺中市": "台中", "台中市": "台中", "臺北市": "台北", "台北市": "台北", "新北市": "新北", "高雄市": "高雄"}
CITY_ORDER = ["台中", "台北", "新北", "高雄"]
# a venue name settles the city when the address is missing or odd
VENUE_CITY = [("臺中國家歌劇院", "台中"), ("台中國家歌劇院", "台中"), ("國臺交", "台中"), ("國立臺灣交響樂團", "台中"),
              ("國家音樂廳", "台北"), ("國家戲劇院", "台北"), ("臺北表演藝術中心", "台北"), ("臺北國際會議中心", "台北"),
              ("衛武營", "高雄"), ("高雄市文化中心", "高雄"), ("新北市藝文中心", "新北")]
# outside Taichung a show is worth the trip only in a main hall (editorial/columns/concerts.md); smaller rooms are skipped
BIG_HALL = re.compile(r"國家音樂廳|國家戲劇院|臺北表演藝術中心.*(大劇院|球劇場)|中山堂中正廳|國際會議中心|衛武營.*(音樂廳|歌劇院|戲劇院)|至德堂")
LIMIT = 60  # candidates per run, nearest first; the rest wait for the next run
# clearly not what the list is for; anything doubtful is left to the editor (比賽／大賽 were here, and took a
# competition winner's recital with them); what this drops is kept in fetch.json and shown by `blocked`
SKIP = re.compile(r"兒童|親子|寶寶|幼兒|布袋戲|木偶|偶戲|歌仔戲|京劇|豫劇|崑曲|崑劇|客家戲|相聲|說唱|講座|工作坊|研習|營隊|徵選|甄選|"
                  r"成果發表|成果展|期末|畢業|彩排|體驗|導覽|市集")
# 戲劇 (category 2) counts only for opera and musicals; 歌劇院 and 歌劇團 (歌仔戲 troupes) are not opera
STAGE = re.compile(r"音樂劇|歌劇|musical|opera", re.I)
KINDS = ["交響樂", "協奏曲", "歌劇", "音樂劇", "室內樂", "獨奏", "聲樂", "合唱", "其他"]
ID_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
TIME_RE = re.compile(r"^\d{2}:\d{2}$")


def today():
    return tw_now().date().isoformat()


def load(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return default


def save(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def city_of(show):
    loc = (show.get("location") or "").replace(" ", "")
    for k, v in CITIES.items():
        if loc.startswith(k):
            return v
    name = show.get("locationName") or ""
    for k, v in VENUE_CITY:
        if k in name:
            return v
    return None


def norm_title(t):
    t = re.sub(r"20\d\d|NTT遇見巨人|遇見巨人|藝文饗宴|臺灣巡迴|台灣巡迴|巡迴演出|音樂會|演奏會|[^\w]", "", t)
    return t.replace("力晶", "")


def rules_version():
    """A short hash of what a rating goes by (concerts.md from 收什麼 up to 每天的流程; whitespace does not count). close
    keeps it on every rejection and fetch says how many standing rejections were made under other rules: 13 of the 24
    shows the full sweep of 2026-11-09 brought in had been rejected on 11-01..03, before 國外樂團演完整名作算 4 分."""
    import hashlib
    try:
        with open(RULES, encoding="utf-8") as f:
            text = f.read()
    except OSError:
        return ""
    m = re.search(r"\n## 收什麼.*?(?=\n## 每天的流程)", text, re.S)
    return hashlib.sha1(re.sub(r"\s+", "", m.group(0) if m else text).encode("utf-8")).hexdigest()[:8]


def note_fetch(day, problem, dropped=None, sources=None, whole=True):
    """Writes fetch.json: `complete` (false with the reason in `note`; `incomplete_since` is the first day of a run of
    such fetches) and `dropped`, what the title filters kept from being rated (left as it was when the feed failed);
    `sources`, whether each source could be read today, and `log`, a line a day for the last LOG_DAYS days (feed: read
    and whole; opentix: read)."""
    old = load(FETCHED, {})
    rec = {"date": day, "complete": not problem, "note": problem,
           "incomplete_since": (old.get("incomplete_since") or day) if problem else None,
           "dropped": old.get("dropped", {}) if dropped is None else dropped}
    if sources is not None:
        cut = (dt.date.fromisoformat(day) - dt.timedelta(days=LOG_DAYS)).isoformat()
        log = [x for x in old.get("log") or [] if isinstance(x, dict) and cut < x.get("date", "") < day]
        rec["sources"] = sources
        rec["log"] = log + [{"date": day, "feed": sources["feed"]["ok"] and whole, "opentix": sources["opentix"]["ok"]}]
    save(FETCHED, rec)


def ot_ids(e):
    """The OPENTIX ids a listed event is followed by: 19-digit uids and the ids in its ticket and source URLs."""
    got = [u for u in e.get("uids") or [] if opentix.ID.match(u)]
    for x in [s.get("tickets") for s in e.get("shows") or [] if isinstance(s, dict)] + \
             [x.get("url") for x in e.get("sources") or [] if isinstance(x, dict)]:
        got += opentix.ids_in(x if isinstance(x, str) else "")
    return list(dict.fromkeys(got))


def feed_uids(e):
    """The Ministry feed's UIDs of a listed event (not the OPENTIX ids kept in uids)."""
    return [u for u in e.get("uids") or [] if not opentix.ID.match(u)]


def show_of(s):
    """(date, time, city, venue, price) of one show as the feed gives it (OPENTIX pages are put in the same shape)."""
    when = (s.get("time") or "").replace("/", "-")
    date, time = when[:10], when[11:16]
    return date, time if TIME_RE.match(time) else "", city_of(s), (s.get("locationName") or "").strip(), (s.get("price") or "").strip()


class BadState(ValueError):
    """state/concerts/opentix.json is there but not of its shape."""


class ShowsUnreadable(ValueError):
    """A programme page with shows on it, none with a date and a city that can be read (or a listed event's page with none)."""


OT_DAYS = ("pending", "ends", "tries", "later")  # {id: a date} each; with known, the four places of 第四類 (ends goes with pending)


def is_day(v):
    """A YYYY-MM-DD string that date.fromisoformat reads (2026-02-30 is not one)."""
    try:
        return isinstance(v, str) and bool(DATE_RE.match(v)) and bool(dt.date.fromisoformat(v))
    except ValueError:
        return False


def ot_shape(state):
    """The check ot_load reads the state file with, and ot_save writes it with (v6 J2)."""
    is_id = lambda v: isinstance(v, str) and bool(opentix.ID.match(v))  # noqa: E731 — 19 digits: int() reads it
    return (isinstance(state, dict) and isinstance(state.get("known"), list) and all(map(is_id, state["known"]))
            and all(isinstance(state.get(k, {}), dict) and all(is_id(i) and is_day(v) for i, v in state.get(k, {}).items())
                    for k in OT_DAYS))


def ot_load():
    """state/concerts/opentix.json with every field there; None only when there is no file (the first run). A file not of
    its shape raises BadState (v5 第一類: known missing; any id or date that int() or date.fromisoformat, which read
    them later, would not take), one that is not JSON its own error: the caller leaves the file as it is."""
    if not os.path.exists(OTSTATE):
        return None
    with open(OTSTATE, encoding="utf-8") as f:
        state = json.load(f)
    if not ot_shape(state):
        raise BadState("狀態檔形狀不對")
    for k in OT_DAYS:
        state.setdefault(k, {})
    return state


def ot_move(state, i, where, day, when=None):
    """v5 第四類, every move of an id: into `where` and out of every other place, but for the one exception — a pending
    id that is unreadable these days is in pending and tries. when: the last show (pending) or the day to read it again (later)."""
    if where == "pending":
        state["pending"].setdefault(i, day)
        state["ends"][i] = when
    elif where == "tries":
        state["tries"].setdefault(i, day)
    elif where == "later":
        state["later"][i] = when
    keep = {"pending": ("pending", "ends"), "tries": ("pending", "ends", "tries"), "later": ("later",), "known": ()}[where]
    for k in OT_DAYS:
        if k not in keep:
            state[k].pop(i, None)
    if (where == "known") != (i in state["known"]):
        state["known"] = state["known"] + [i] if where == "known" else [x for x in state["known"] if x != i]


def ot_save(state, day):
    """v5 第四類, the one normalisation before the state file is written (fetch, prune and reopen all write it here): an id
    is in one place only — pending (with its tries), else tries, else later, else known — ends is kept for pending
    ids alone, and no later is past today + WINDOW (a placeholder date of 9999 on a page must not keep it unread for good)."""
    cap = (dt.date.fromisoformat(day) + dt.timedelta(days=WINDOW)).isoformat()
    pending, tries = state["pending"], state["tries"]
    state["later"] = {i: min(d, cap) for i, d in state["later"].items() if i not in pending and i not in tries}
    state["ends"] = {i: d for i, d in state["ends"].items() if i in pending}
    state["known"] = sorted(set(state["known"]) - set(pending) - set(tries) - set(state["later"]), key=int)
    if not ot_shape(state):
        raise BadState("要存的狀態檔形狀不對，沒有存")  # v6 J2: never a file ot_load would turn away; the old one stays
    save(OTSTATE, state)


def ot_place(what):
    """v5 第二類 and v4's table, the one decision of where a new or pending id goes after what its page said today:
    "category" (a category read and not taken; its shows not looked at), "none" (a category taken, every show read,
    none the list could take: another city, a title filtered) and "closed" (dealt with by close, or listed) go to
    known; "candidate" to pending; "later" to later; anything else ("no shows", "unreadable", "partly": shows not all
    read and none to list) to tries — an id understood only in part never goes to known for good but after NEW_DAYS days (said so)."""
    return {"category": "known", "none": "known", "closed": "known", "candidate": "pending", "later": "later"}.get(what, "tries")


def room(start, timeout, retries=0, pause=0.0):
    """v5 第五類: may a request of fetch begin — the time since `start`, a pause before it and the most it can take
    (every try at its timeout, RETRY_WAIT between two) within FETCH_SECONDS."""
    return monotonic() - start + pause + (retries + 1) * timeout + retries * RETRY_WAIT <= FETCH_SECONDS


def ot_why(e):
    return str(e) if isinstance(e, BadState) else "出錯：%s" % type(e).__name__


def ot_guard(ot, step, *args):
    """v5 第一類, the one guard of everything fetch does with OPENTIX (the sitemap, the pages, where each id goes, the
    day to read it again, writing the state file): any exception and OPENTIX is unreadable today, the kind of error
    the reason; what was read is dropped and the state file is not written (the caller gets None)."""
    try:
        return step(*args)
    except Exception as e:  # noqa: BLE001 — a broken state file, a page of a shape nobody foresaw, a bug
        ot.clear()
        ot.update(ot_none(ot_why(e)))
        return None


def read_opentix(out, day, end, ot_listed, seen, start):
    """OPENTIX for one fetch, into `out` (ot_none's shape): the sitemap, then the pages of listed events, pending
    candidates, ids in tries, ids in later whose day has come and new programmes, MAX_PAGES pages in all; it stops
    after STOP_AFTER pages in a row unreadable the way a host failing or blocking us is, once ALL_AFTER pages are read
    and every one unreadable, or before a request that could end past FETCH_SECONDS from `start` (room). Returns the
    state. out: ok/note/new/pages/left/newest, rows (pages of a category the list takes, in the feed's shape), read
    {id: (what its page said, whether every show on it was read)} for ot_finish (fetch says what the rows' were),
    shows {event id: shows in the window}, failed {event id: [ids]}, status {event id: [...]}, unread {event ids with a
    page not asked for today: not compared}, waiting (pending ids not asked for), again (other ids in tries or later)."""
    if not room(start, opentix.TIMEOUT, opentix.TRIES):
        out["note"] = "sitemap：時間不夠，沒有讀"
        return None
    try:
        ids = opentix.sitemap_ids()
    except Exception as e:  # noqa: BLE001 — any failure means OPENTIX could not be read today
        out["note"] = "sitemap：%s" % e
        return None
    out["newest"] = opentix.created(ids[-1]).astimezone(tw_now().tzinfo).date().isoformat()
    state = ot_load()
    if state is None:  # the first run
        cut = tw_now() - dt.timedelta(days=NEW_DAYS)
        state = {"known": [i for i in ids if opentix.created(i) < cut], "pending": {}, "ends": {}, "tries": {}, "later": {}, "since": day}
    known, pending, tries, later = set(state["known"]), state["pending"], state["tries"], state["later"]
    waiting = set(pending) | set(tries) | set(later)
    for i in [i for i in waiting | {i for i in ids if i in ot_listed} if i in seen or i in ot_listed]:
        out["read"][i] = ("closed", True)  # dealt with by close, or on the list
    bad = run = 0  # run: unreadable pages in a row that look like the host failing or blocking us

    def page(i):
        """The page, or None: unreadable (counted), or not asked for (the page cap, the stop rule, the time)."""
        nonlocal bad, run
        if out["pages"] >= opentix.MAX_PAGES or run >= STOP_AFTER or out["pages"] >= ALL_AFTER and bad == out["pages"] or \
                not room(start, opentix.PAGE_TIMEOUT, 0, opentix.PAUSE):
            return None
        out["pages"] += 1
        try:
            p = opentix.page(i)
            if i not in ot_listed and p["category"] and not OT_CATEGORY.get(p["category"]):
                p["what"] = "category"  # v5 第二類 1: a category read and not taken, its shows not looked at
                return p
            p["row"] = opentix.row(p)  # inside the try: a page of an unexpected shape is unreadable, not a crash
            dates = [show_of(s)[0] for s in p["row"]["showInfo"]]
            if not all(is_day(d) for d in dates if DATE_RE.match(d)):
                raise ValueError("節目頁上有不存在的日期")  # 2027-06-31: unreadable here (v5 第一類), never a crash later
            if p["shows"] and not p["category"] and i not in ot_listed:
                raise ShowsUnreadable("頁上有場次、讀不出類別")  # v5 第二類: a new layout, never 「類別不收」
            read = [bool(DATE_RE.match(d)) and bool(show_of(s)[2] or ps["city"] and i not in ot_listed)  # a listed page: a city the list follows (v3 H1)
                    for d, s, ps in zip(dates, p["row"]["showInfo"], p["shows"])]
            if (p["shows"] or i in ot_listed) and not any(read):
                raise ShowsUnreadable("頁上沒有讀得出日期與城市的場次")  # 讀不到, not 消失 nor 沒有合格場次
            p["what"], p["whole"] = "rows" if p["shows"] else "no shows", all(read)
        except Exception as x:  # noqa: BLE001 — HTTP error, timeout, not a programme page, an unexpected shape
            bad += 1
            if not (isinstance(x, (opentix.NotProgramme, ShowsUnreadable)) or getattr(x, "code", None) in (404, 410)):
                run += 1  # a page gone, not a programme page or with shows unreadable does not stop the source by itself
            return False
        run = 0
        return p

    for i in sorted(ot_listed, key=int):  # listed events first
        e = ot_listed[i]
        p = page(i)
        if p is None:
            out["unread"].add(e["id"])
            continue
        if p is False:  # 讀不到, not 消失
            out["failed"].setdefault(e["id"], []).append(i)
            continue
        shows = out["shows"].setdefault(e["id"], [])
        for s, ps in zip(p["row"]["showInfo"], p["shows"]):
            date, hhmm, city, venue, price = show_of(s)
            if city and DATE_RE.match(date) and day <= date <= end:
                shows.append({"date": date, "time": hhmm, "city": city, "venue": venue, "price": price})
                if ps["status"] and ps["status"] != "EventScheduled" and ps["status"] not in out["status"].get(e["id"], []):
                    out["status"].setdefault(e["id"], []).append(ps["status"])
    for x in out["unread"]:  # an event with a page not read today is not compared on half its shows
        out["shows"].pop(x, None)
        out["status"].pop(x, None)
    todo = [i for i in sorted(pending, key=int) + sorted(set(tries) - set(pending), key=int) +
            sorted((i for i in later if later[i] <= day and i not in pending and i not in tries), key=int) +
            [i for i in ids if i not in known and i not in waiting and i not in ot_listed] if i not in out["read"]]
    out["new"] = sum(1 for i in todo if i not in waiting)
    for i in todo:  # what each page says goes to out["read"]; ot_place decides what that means for the id
        p = page(i)
        if p is None:  # not asked for: as it was
            out["waiting" if i in pending else "again" if i in waiting else "left"] += 1
        elif p is False:
            out["read"][i] = ("unreadable", False)
        elif p["what"] == "rows":
            out["read"][i] = ("rows", p["whole"])  # fetch rates it and says which
            out["rows"].append((OT_CATEGORY[p["category"]], p["row"], True))
        else:
            out["read"][i] = (p["what"], True)  # "category", or "no shows" (類別 but no show block yet)
    if run >= STOP_AFTER:
        out["note"] = "連續 %d 頁讀不到" % STOP_AFTER
    elif bad >= 3 and bad * 2 > out["pages"]:
        out["note"] = "節目頁 %d 頁裡 %d 頁讀不到" % (out["pages"], bad)
    out["ok"] = not out["note"]
    return state


def ot_finish(ot, state, fate, picked, day):
    """After the candidates are made: where every id read today goes (ot_place, by way of ot_move), the day to read a
    later one again, and the state file written (ot_save). fate {id: ("later", its first show the list could take) |
    ("none", None)}: what fetch made of each row; picked: the uids of the candidates. An id not read (its page not
    asked for) stays as it was. Returns the ids let go after NEW_DAYS days of tries (printed: v5 第四類)."""
    gave_up = []
    for _, e, _ in ot["rows"]:
        if e["UID"] in picked:  # row 1: with its last show, for prune
            fate[e["UID"]] = ("candidate", max(d for d in (show_of(x)[0] for x in e["showInfo"]) if DATE_RE.match(d)))
    for i, (what, x) in sorted(ot["read"].items(), key=lambda kv: int(kv[0])):
        when = None
        if what == "rows":
            what, when = fate.get(i, ("none", None))
            if what == "none" and not x:
                what = "partly"  # shows not all read, none to list: not understood (v5 第二類)
            elif what == "later":  # row 3: the day the first show it could be listed for enters the window
                when = (dt.date.fromisoformat(when) - dt.timedelta(days=WINDOW)).isoformat()
        where = ot_place(what)
        if where == "tries":  # rows 4 and 5: read again every fetch, and after NEW_DAYS days from the first such day …
            if (dt.date.fromisoformat(day) - dt.date.fromisoformat(state["tries"].get(i, day))).days < NEW_DAYS:
                ot_move(state, i, "tries", day)
                continue
            where = "known"
            gave_up.append(i)  # … row 6: let go, said so
        ot_move(state, i, where, day, when)
    ot_save(state, day)
    return gave_up


def ot_none(note):
    """read_opentix's result when OPENTIX could not be read at all."""
    return {"ok": False, "note": note, "new": 0, "pages": 0, "left": 0, "newest": "", "rows": [], "read": {}, "shows": {}, "failed": {},
            "status": {}, "unread": set(), "waiting": 0, "again": 0}


def fetch(a):
    start, day = monotonic(), today()
    end = (dt.date.fromisoformat(day) + dt.timedelta(days=WINDOW)).isoformat()
    seen = load(SEEN, {})
    data = load(FILE, {"events": []})
    listed = {u: e for e in data.get("events", []) for u in e.get("uids", [])}
    feed_shows = {}  # listed event id → the feed's shows for its UIDs (a listed event is never a candidate again, but
    #                  its shows are compared: a listing was checked once, on the day it was rated, and then never —
    #                  cancellations, new dates and new cities went unnoticed, review 2026-11-08)
    raw, feed_err = [], ""
    for cat in (1, 2):
        try:
            if not room(start, 60, FEED_TRIES):  # v5 第五類: not begun when it could end past FETCH_SECONDS
                raise TimeoutError("時間不夠，沒有讀")
            status, _, body = http_get(FEED % cat, timeout=60, retries=FEED_TRIES)
            rows = json.loads(body.decode("utf-8"))
            if not rows:  # an empty answer is not 「今天沒有新演出」
                raise ValueError("回應是空的")
            raw += [(cat, e, False) for e in rows]
        except Exception as e:  # noqa: BLE001 — any failure means the feed could not be read today; OPENTIX is still tried
            feed_err, raw = "category %d：%s" % (cat, e), []
            break
    ot_listed = {i: e for e in data.get("events", []) for i in ot_ids(e)}
    ot = ot_none("")
    ot_state = ot_guard(ot, read_opentix, ot, day, end, ot_listed, seen, start)  # v5 第一類: OPENTIX only through ot_guard

    def both_down():
        sources = {"feed": {"ok": False, "note": feed_err}, "opentix": {k: ot[k] for k in ("ok", "note", "new", "pages", "left", "newest")}}
        print("查核失敗：兩個來源都讀不到（文化部：%s；OPENTIX：%s）" % (feed_err, ot["note"]))
        note_fetch(day, "兩個來源都讀不到（文化部：%s；OPENTIX：%s）" % (feed_err, ot["note"]), sources=sources)
        return 2
    if feed_err and not ot["ok"]:
        return both_down()
    raw += ot["rows"]
    cands, known, info, dropped, filled, fate = [], 0, {}, {}, False, {}
    for cat, e, mine in raw:
        uid, title = e.get("UID") or "", (e.get("title") or "").strip()
        if not uid or not title:
            continue
        drop = ""
        if cat == 2 and not STAGE.search(title.replace("歌劇院", "").replace("歌劇團", "")):
            drop = "戲劇類，標題沒有「音樂劇」或「歌劇」"
        elif SKIP.search(title):
            drop = "標題含「%s」" % SKIP.search(title).group(0)
        if drop and uid in listed:
            continue  # as before: a listed event is not looked up under a filtered title
        shows, in_window, sig = [], [], set()
        for s in e.get("showInfo") or []:
            date, time, city, venue, price = show_of(s)
            if city and DATE_RE.match(date) and day <= date and (city == "台中" or BIG_HALL.search(venue)):
                sig.add("%s %s" % (date, city))  # every show to come, not the window's: the window slides by a day a day
            if city and DATE_RE.match(date) and day <= date <= end:
                show = {"date": date, "time": time, "city": city, "venue": venue, "price": price}
                in_window.append(show)  # every show in the window, for the comparison with a listed event
                if city == "台中" or BIG_HALL.search(venue):
                    shows.append(show)  # a candidate only where the trip is worth it
        if uid in listed:
            known += 1
            feed_shows.setdefault(listed[uid]["id"], []).extend(in_window)
            continue
        if not mine and any(i in ot_listed or i in seen for i in opentix.ids_in("%s %s" % (e.get("webSales"), e.get("sourceWebPromote")))):
            known += 1  # the feed's entry for an OPENTIX programme already listed or rated: not a candidate twice
            continue
        if mine:
            fate[uid] = ("none", None)  # no show the list could take (ot_finish: unless not every show was read)
        if not shows:
            if mine and sig and not drop:  # every show it could be listed for is after the window: ot_finish says when to read it again
                fate[uid] = ("later", min(sig)[:10])
            continue
        sig = sorted(sig)
        if drop:  # would have been a candidate: keep what was dropped and why
            dropped[uid] = {"title": title, "shows": sig, "why": drop}
            continue
        again = ""
        if uid in seen:
            r = seen[uid]
            new = [s for s in sig if s not in r.get("shows", sig)]
            if r.get("v") == "rejected" and "shows" not in r:  # a record from before titles were kept: fill it in
                r["title"], r["shows"], filled = title, sig, True
            if r.get("v") != "rejected" or not new:
                known += 1
                continue
            # rejected, and now with a date or a city it did not have (a Taichung show added): rate it again
            again = "曾判不收（%s：%s）；多了場次：%s" % (r.get("seen"), r.get("why") or "沒留理由", "、".join(new))
        info[uid] = {"title": title, "shows": sig}
        shows.sort(key=lambda s: (s["date"], s["time"]))
        desc = re.sub(r"\s+", " ", e.get("descriptionFilterHtml") or "").strip()
        units = "、".join(u for u in (e.get("masterUnit") or []) + [e.get("showUnit") or ""] if u)
        cands.append({"uids": [uid], "category": "音樂" if cat == 1 else "戲劇", "title": title, "shows": shows, "again": again,
                      "url": e.get("sourceWebPromote") or e.get("webSales") or "", "sales": e.get("webSales") or "",
                      "source": e.get("sourceWebName") or "", "units": units, "desc": desc[:240]})
    if filled:
        save(SEEN, seen)
    # The same listing often comes twice (OPENTIX's program page and its event page): merge those. One production
    # touring several cities usually has a UID per city: point at likely matches and leave the merge to the editor.
    merged = {}
    for c in cands:
        k = (norm_title(c["title"]), c["shows"][0]["date"])
        if k in merged:
            m = merged[k]
            m["uids"] += c["uids"]
            m["units"] = m["units"] or c["units"]
            m["desc"] = m["desc"] or c["desc"]
            m["again"] = m["again"] or c["again"]
            m["shows"] += [s for s in c["shows"] if (s["date"], s["time"], s["city"]) not in {(x["date"], x["time"], x["city"]) for x in m["shows"]}]
        else:
            merged[k] = c
    cands = list(merged.values())
    gave_up = []
    if ot_state is not None:  # an OPENTIX candidate (the 60 cut off included) stays pending until close
        gave_up = ot_guard(ot, ot_finish, ot, ot_state, fate, {u for c in cands for u in c["uids"]}, day)
        if gave_up is None:  # OPENTIX unreadable today after all and the state file as it was: every page is read again tomorrow
            gave_up = []
            if feed_err:
                return both_down()
    cands.sort(key=lambda c: (c["shows"][0]["date"], min(CITY_ORDER.index(s["city"]) for s in c["shows"])))
    waiting = max(0, len(cands) - LIMIT)
    cands = cands[:LIMIT]
    titles = [(e["id"], norm_title(e["title"])) for e in data.get("events", [])]
    for c in cands:
        n = norm_title(c["title"])
        c["maybe"] = [i for i, t in titles if t and n and difflib.SequenceMatcher(None, n, t).ratio() >= 0.6]
        c["twins"] = [o["uids"][0] for o in cands if o is not c and difflib.SequenceMatcher(None, n, norm_title(o["title"])).ratio() >= 0.75]
    os.makedirs(TMP, exist_ok=True)
    save(CANDS + ".json", {"date": day, "uids": [u for c in cands for u in c["uids"]],
                           "info": {u: info[u] for c in cands for u in c["uids"]}})
    lines = ["# 演出候選 %s（%d 筆；%s 到 %s%s）" % (day, len(cands), day, end, "；另有 %d 筆留到下次" % waiting if waiting else ""), ""]
    for c in cands:
        where = "；".join("%s %s %s %s%s" % (s["date"], s["time"], s["city"], s["venue"], "（%s）" % s["price"] if s["price"] else "")
                         for s in c["shows"][:6])
        more = "；另 %d 場" % (len(c["shows"]) - 6) if len(c["shows"]) > 6 else ""
        lines.append("- %s｜%s｜%s" % ("、".join("`%s`" % u for u in c["uids"]), c["category"], c["title"]))
        lines.append("  - 場次：%s%s" % (where, more))
        lines.append("  - 網頁：%s（%s）%s" % (c["url"], c["source"], "；售票：%s" % c["sales"] if c["sales"] and c["sales"] != c["url"] else ""))
        if c["units"]:
            lines.append("  - 主辦：%s" % c["units"])
        if c["desc"]:
            lines.append("  - 簡介：%s" % c["desc"])
        if c["maybe"]:
            lines.append("  - 可能和已列入的 %s 是同一製作" % "、".join("`%s`" % i for i in c["maybe"]))
        if c["twins"]:
            lines.append("  - 可能和候選 %s 是同一製作" % "、".join("`%s`" % u for u in c["twins"]))
        if c["again"]:
            lines.append("  - " + c["again"])
    changed = listed_changes(data, feed_shows, day, end, ot, not feed_err)
    # A feed that comes back short (2026-11-09 06:18: 23 of the 24 listed events "gone", all back by noon) is not 23
    # cancellations: when most of the listed events are missing at once, say the feed was incomplete and leave the
    # whole-event notes out — the next fetch compares again. Only the events the feed alone follows count (no OPENTIX id).
    gone = [x for x in changed if x[1] and x[1][0].startswith("開放資料裡已找不到")]
    with_uids = sum(1 for e in data.get("events", []) if feed_uids(e) and not ot_ids(e) and any(day <= s.get("date", "") <= end for s in e.get("shows", [])))
    partial = not feed_err and len(gone) >= 3 and len(gone) * 2 > with_uids
    if partial:
        changed = listed_changes(data, feed_shows, day, end, ot, False)  # v6 J3: as on a morning the feed is unreadable
        print("注意：開放資料這次不完整（已列入的 %d 筆裡有 %d 筆整筆不在回應裡），不當作取消，異動段落略過這些；明天再比。"
              "新候選照常評分；這次算沒查完（結束碼 3）。" % (with_uids, len(gone)))
    if feed_err:
        print("來源讀不到：文化部開放資料（%s）" % feed_err)
    if not ot["ok"]:
        print("來源讀不到：OPENTIX（%s）" % ot["note"])
    if ot["left"]:
        print("OPENTIX 還有 %d 個新節目留到下次" % ot["left"])
    if ot["unread"]:
        print("OPENTIX 已列入的演出有 %d 檔這次沒核對" % len(ot["unread"]))
    if ot["waiting"]:
        print("OPENTIX 待判的候選有 %d 個這次沒讀到" % ot["waiting"])
    if ot["again"]:
        print("OPENTIX 之前讀不到或還沒到日子的編號有 %d 個這次沒讀到" % ot["again"])
    for i in gave_up:
        print("OPENTIX %s 連續 %d 天讀不到（或沒有場次），不再讀" % (i, NEW_DAYS))
    quiet = (dt.date.fromisoformat(day) - dt.date.fromisoformat(ot["newest"])).days if ot["newest"] else 0
    if quiet >= STALE_DAYS:
        print("OPENTIX 清單已 %d 天沒有新節目" % quiet)  # a reminder only: the exit code is not changed
    problem = [x for x in ("讀不到文化部開放資料（%s）" % feed_err if feed_err else "", "讀不到 OPENTIX（%s）" % ot["note"] if not ot["ok"] else "",
                           "已列入的 %d 筆裡有 %d 筆整筆不在回應裡" % (with_uids, len(gone)) if partial else "") if x]
    sources = {"feed": {"ok": not feed_err, "note": feed_err},
               "opentix": {k: ot[k] for k in ("ok", "note", "new", "pages", "left", "newest")}}
    note_fetch(day, "；".join(problem), dropped, sources, whole=not partial)
    rules = rules_version()
    rej = [v for v in seen.values() if v.get("v") == "rejected"]
    stale = sum(1 for v in rej if v.get("rules") != rules)
    if stale:
        print("注意：判不收的 %d 筆裡有 %d 筆是照舊的評分規則判的（清單：python3 scripts/concerts.py blocked）。" % (len(rej), stale))
    if changed:
        lines += ["", "## 已列入演出的異動", "",
                  "開放資料、OPENTIX 和 concerts.json 對不上的場次。先開該筆的售票頁確認，再改 shows／note；開放資料整筆消失不等於取消，以售票頁為準。", ""]
        for e, notes in changed:
            lines.append("- `%s`｜%s" % (e["id"], e.get("title", "")))
            lines += ["  - " + n for n in notes]
    with open(CANDS + ".md", "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    by = {k: sum(1 for c in cands if any(s["city"] == k for s in c["shows"])) for k in CITY_ORDER}
    print("新候選 %d 筆（%s）；%s已看過 %d 筆；標題過濾擋下 %d 筆%s；OPENTIX 新節目 %d 個、讀了 %d 頁、留到下次 %d 個。清單：%s.md" % (
        len(cands), "、".join("%s %d" % kv for kv in by.items()), "還有 %d 筆留到下次；" % waiting if waiting else "",
        known, len(dropped), "；已列入有異動 %d 筆（見清單末段）" % len(changed) if changed else "", ot["new"], ot["pages"], ot["left"], CANDS))
    return 3 if partial or problem else 0


def listed_changes(data, feed_shows, day, end, ot=None, feed_ok=True):
    """[(event, [notes])] for listed events whose upcoming shows differ from what the feed says about their UIDs and
    OPENTIX about their ids: a listed show neither has any more (cancelled, or moved — a move shows up as one vanished
    and one new), a show whose time or venue changed, a show they have and the listing does not (a new date or city:
    Taichung, or a main hall elsewhere for a 4 or more); on a day and city OPENTIX has a show on, its ticket page alone counts,
    and a listed show its page lacks is gone unless a feed show of its own keeps it (one_to_one; none is said gone of an event
    the feed follows on a day the feed is unreadable). Shows are matched by date and city, and by time too when a day
    has more than one there (午場、晚場): a time change is said only of a day with one show on each side. An event the
    feed alone follows whose UIDs have all left it is noted as such; an OPENTIX page that could not be read is said so,
    never taken for a vanished show; a ticket page whose status is not 照常演出 is noted. Events with neither (found by hand, sold elsewhere) are not compared."""
    ot = ot or {"shows": {}, "failed": {}, "status": {}}
    out = []
    squeeze = lambda v: re.sub(r"\s+", "", v or "")
    for e in data.get("events", []):
        oids, fuids = ot_ids(e), feed_uids(e)
        if not oids and not fuids:
            continue
        upcoming = [s for s in e.get("shows", []) if day <= s.get("date", "") <= end and s.get("city")]
        failed = ot["failed"].get(e["id"])
        if failed:
            out.append((e, ["OPENTIX 這一頁讀不到（%s）" % i for i in failed]))
            continue
        if e["id"] not in feed_shows and e["id"] not in ot["shows"]:
            if upcoming and feed_ok and not oids:
                out.append((e, ["開放資料裡已找不到這筆（UID %s）；整筆消失不等於取消，以售票頁為準" % "、".join(fuids)]))
            continue
        feed, keys, sold = [], set(), {(s["date"], s["city"]) for s in ot["shows"].get(e["id"], [])}
        for s in [s for s in feed_shows.get(e["id"], []) if (s["date"], s["city"]) not in sold] + ot["shows"].get(e["id"], []):
            if (s["date"], s["city"], s["time"]) not in keys:  # a day and city OPENTIX has a show on: the ticket page alone
                keys.add((s["date"], s["city"], s["time"]))
                feed.append(s)
        gone, new, pairs = [], [], []
        for k in sorted({(s["date"], s["city"]) for s in upcoming + feed}):
            a = [s for s in upcoming if (s["date"], s["city"]) == k]
            b = [s for s in feed if (s["date"], s["city"]) == k]
            if len(a) == 1 and len(b) == 1:
                pairs.append((k, a.pop(), b.pop(), True))
            for x in list(a):  # two or more that day: the same time, then one without a time with any left
                y = next((y for y in b if x.get("time") and y["time"] == x["time"]), None) or \
                    next((y for y in b if not (x.get("time") and y["time"])), None)
                if y is not None:
                    pairs.append((k, x, y, False))
                    a.remove(x)
                    b.remove(y)
            gone += a
            new += b
        if e["id"] in ot["shows"]:  # its ticket page read: a show it lacks is gone only if the feed has a show of its own for it (v5 第五類)
            spare = [dict(t) for t in sorted({tuple(sorted(f.items())) for f in feed_shows.get(e["id"], []) if (f["date"], f["city"]) in sold})]
            one_to_one(ot["shows"][e["id"]], spare)  # first the feed's shows that are OPENTIX's own
            gone = one_to_one(gone, spare)  # then one feed show keeps at most one listed show
        if not feed_ok and fuids:
            gone = []  # the feed unreadable today: an event it follows is not said to have lost a show (v5 第五類)
        notes = ["售票頁狀態：%s" % x for x in ot["status"].get(e["id"], [])]
        for s in gone:
            notes.append("消失：%s %s %s %s（可能取消或改期）" % (s["date"], s.get("time") or "", s["city"], s.get("venue") or ""))
        for s in new:
            if s["city"] != "台中" and not (BIG_HALL.search(s["venue"]) and (e.get("rating") or 0) >= 4):
                continue  # a show the list would not take (concerts.md 收什麼)
            notes.append("新場次：%s %s %s %s%s" % (s["date"], s["time"], s["city"], s["venue"], "（%s）" % s["price"] if s["price"] else ""))
        for k, a, b, one in pairs:
            diff = []
            if one and a.get("time") and b["time"] and a["time"] != b["time"]:
                diff.append("時間 %s → %s" % (a["time"], b["time"]))
            va, vb = squeeze(a.get("venue")), squeeze(b["venue"])
            if va and vb and va != vb and va not in vb and vb not in va:
                diff.append("場地 %s → %s" % (a["venue"], b["venue"]))
            if diff:
                notes.append("改動：%s %s %s" % (k[0], k[1], "；".join(diff)))
        if notes:
            out.append((e, notes))
    return out


def one_to_one(xs, pool):
    """Pairs each show of xs with at most one show of pool on its day and in its city — the same time first, then one
    of pool without a time (or at 00:00) — and takes it out of pool; returns the shows of xs left unpaired."""
    rest = list(xs)
    for loose in (False, True):
        for x in list(rest):
            y = next((y for y in pool if (y["date"], y["city"]) == (x["date"], x["city"])
                      and (y["time"] in ("", "00:00") if loose else y["time"] == (x.get("time") or ""))), None)
            if y is not None:
                pool.remove(y)
                rest.remove(x)
    return rest


def committed_ids():
    """Ids on the committed list (git HEAD), or None when there is no git or no committed file."""
    import subprocess
    try:
        out = subprocess.run(["git", "-C", ROOT, "show", "HEAD:content/concerts.json"], capture_output=True, text=True, check=True).stdout
        return {e.get("id") for e in json.loads(out).get("events", []) if isinstance(e, dict)}
    except (OSError, subprocess.CalledProcessError, ValueError, AttributeError):
        return None


def stamp_added(data):
    """Sets `added` to today (Taiwan) on every event not on the committed list. The app marks 新 on what the latest
    update added, by `added` == `checked`; on 2026-11-09 a run at 六點十九分 wrote the UTC date (11-08) by hand and the
    new show went out unmarked. The date is the script's to write, not the routine's. Returns the ids it changed."""
    old, day, fixed = committed_ids(), today(), []
    if old is None:
        return fixed
    for e in data.get("events", []):
        if isinstance(e, dict) and e.get("id") not in old and e.get("added") != day:
            e["added"] = day
            fixed.append(e.get("id"))
    return fixed


def close(a):
    last = load(CANDS + ".json", None)
    if not last:
        print("沒有這次的候選清單（先跑 fetch）")
        return 1
    seen = load(SEEN, {})
    data = load(FILE, {"events": []})
    ends = {}
    for e in data.get("events", []):
        last_show = max((s["date"] for s in e.get("shows", [])), default=last["date"])
        for u in e.get("uids", []):
            ends[u] = last_show
    keep = set(a.keep or [])
    why = {}  # UID → reason, from --reject UID[,UID...]=理由
    for x in a.reject or []:
        us, _, reason = x.partition("=")
        why.update({u.strip(): reason.strip() for u in us.split(",")})
    n = {"listed": 0, "rejected": 0}
    end = (dt.date.fromisoformat(last["date"]) + dt.timedelta(days=WINDOW)).isoformat()
    rules, left = rules_version(), []
    for u in last["uids"]:
        if u in keep:
            continue
        if u in ends:
            seen[u] = {"seen": last["date"], "end": ends[u], "v": "listed"}
            n["listed"] += 1
        elif why.get(u):
            # what it was and why (the 145 rejections of 2026-11-01..09 are bare UIDs: nobody can say what they were)
            seen[u] = dict(last.get("info", {}).get(u, {}), seen=last["date"], end=end, v="rejected", why=why[u], rules=rules)
            n["rejected"] += 1
        else:
            left.append(u)  # no verdict: not 不收 for good, it comes back with the next fetch
    save(SEEN, dict(sorted(seen.items())))
    data["checked"] = last["date"]
    for i in stamp_added(data):
        print("added 改成今天：%s" % i)
    save(FILE, data)
    print("已記錄：列入 %d、不收 %d、留待下次 %d" % (n["listed"], n["rejected"], len(keep) + len(left)))
    if left:
        print("其中 %d 筆沒寫理由，沒記成不收，下次 fetch 還會出現：%s" % (len(left), " ".join(left)))
        print("不收的每一筆都要寫理由：python3 scripts/concerts.py close --reject <UID>=<分數與理由> <UID>=<分數與理由> …")
    return 0


def seen_end(v):
    """The last show a seen.json record knows of: the latest date in its shows, else its end."""
    return max([x[:10] for x in v.get("shows") or [] if isinstance(x, str)] or [v.get("end") or ""])


def reopen(a):
    """Takes rejections out of seen.json, so that the next fetch offers them again: those named, all, those rejected on
    or after a date, or under rules since changed. (The only way back was to edit the file by hand: 13 shows, 2026-11-09.)"""
    seen, rules = load(SEEN, {}), rules_version()
    hit = [u for u, v in seen.items() if v.get("v") == "rejected" and (
        a.all or u in a.uids or (a.since and v.get("seen", "") >= a.since) or (a.old_rules and v.get("rules") != rules))]
    back, ot, matched = [u for u in hit if opentix.ID.match(u)], None, bool(hit)
    if back:  # an OPENTIX programme is read again only while pending: without a state file to put it in, it stays in seen.json
        try:
            ot = ot_load()
            if ot is None:
                print("OPENTIX 的狀態檔還沒建立，先跑一次 fetch 再 reopen")
            else:
                day, soon = today(), (tw_now().date() + dt.timedelta(days=NEW_DAYS)).isoformat()
                for u in back:  # ends: prune clears it even if the page is gone, but not before fetch has read it a few times
                    last = seen_end(seen[u])
                    ot_move(ot, u, "pending", day, max(last, soon) if is_day(last) else soon)  # v6 J2: not a date, none
                ot_save(ot, day)  # the state file first, then seen.json: an id is never in neither
        except Exception as e:  # noqa: BLE001 — a broken state file (or record): left as it is
            ot = None
            print("OPENTIX 的狀態檔讀不了（%s），%d 個 OPENTIX 編號沒有放回：%s" % (ot_why(e), len(back), " ".join(back)))
        if ot is None:
            hit = [u for u in hit if u not in back]
    for u in hit:
        seen.pop(u)
    if hit:
        save(SEEN, seen)
    print("放回候選 %d 筆%s" % (len(hit), "；下次 fetch 會再列出來（一次最多 %d 筆，由近到遠）" % LIMIT if hit else "" if matched else "（沒有符合的不收紀錄）"))
    return 0 if hit else 1


def blocked(a):
    """What was turned away and why, for the owner and the weekly audit: rated 不收 (seen.json), kept from rating by the
    title filters (the last fetch) and seen by the last sweep but not listed."""
    seen, rules, got, sweep = load(SEEN, {}), rules_version(), load(FETCHED, {}), load(SWEEP, {})
    rej = sorted(((v.get("seen", ""), u, v) for u, v in seen.items() if v.get("v") == "rejected" and v.get("seen", "") >= (a.since or "")), reverse=True)
    bare = [d for d, u, v in rej if not v.get("title")]
    print("## 評分判不收：%d 筆（其中 %d 筆照舊的評分規則判；放回候選重評：python3 scripts/concerts.py reopen --old-rules）" % (
        len(rej), sum(1 for d, u, v in rej if v.get("rules") != rules)))
    for d, u, v in rej:
        if v.get("title"):
            print("- %s｜%s｜%s｜%s｜`%s`" % (d, v["title"], "、".join(v.get("shows", [])), v.get("why") or "舊紀錄，沒留理由", u))
    if bare:
        print("（另有 %d 筆舊紀錄沒有標題，%s 到 %s 判的；開放資料再給到同一筆時 fetch 會補上，演出已過的補不到。）" % (len(bare), min(bare), max(bare)))
    drops = got.get("dropped", {})
    print("\n## 評分前被標題過濾擋下：%d 筆（%s）" % (len(drops), "還沒有 fetch 紀錄" if not got else "%s 的 fetch；開放資料%s" % (
        got.get("date"), "完整" if got.get("complete") else "不完整：%s" % got.get("note"))))
    for why in sorted({v["why"] for v in drops.values()}):
        print("- %s：%s" % (why, "；".join(sorted(v["title"] for v in drops.values() if v["why"] == why))))
    print("\n## 補查看到但不收（%s）" % ("%s 的補查" % sweep["date"] if sweep.get("date") else "還沒有證據紀錄"))
    raw = lambda v: v if isinstance(v, str) else json.dumps(v, ensure_ascii=False)  # noqa: E731
    for k, s in (sweep.get("sources") or {}).items():
        if not isinstance(s, dict):  # sweep-done keeps a source given as "連不上", null, a list… as 沒查
            print("- %s｜（沒寫理由）｜%s" % (raw(s), k))
            continue
        items = s.get("seen") or []
        for x in items if isinstance(items, list) else [items]:  # a source with error: its seen is not checked
            if not isinstance(x, dict):
                print("- %s｜（沒寫理由）｜%s" % (raw(x), k))
            elif x.get("verdict") == "不收":
                print("- %s｜%s｜%s" % (raw(x.get("title")), x.get("why") or "（沒寫理由）", k))
    return 0


def prune(a):
    day = today()
    data = load(FILE, {"events": []})
    before = len(data.get("events", []))
    for e in data.get("events", []):
        e["shows"] = [s for s in e.get("shows", []) if s.get("date", "") >= day]
    # a 3 was for Taichung only: once its Taichung shows are over, the rest are not worth the trip
    data["events"] = [e for e in data.get("events", []) if e["shows"]
                      and (e.get("rating", 0) >= 4 or any(s.get("city") == "台中" for s in e["shows"]))]
    seen = load(SEEN, {})
    gone = [u for u, v in seen.items() if v.get("end", day) < day]
    for u in gone:
        del seen[u]
    save(FILE, data)
    if os.path.exists(SEEN) or seen:
        save(SEEN, seen)
    try:
        ot = ot_load()
        over = [i for i, last in (ot["ends"].items() if ot else []) if i in ot["pending"] and last < day]
        for i in over:  # a pending OPENTIX candidate whose last show is over: dealt with (no line: v5 第四類)
            ot_move(ot, i, "known", day)
        if over:
            ot_save(ot, day)
    except Exception as e:  # noqa: BLE001 — a broken state file: the rest of prune is done, the file left as it is
        print("OPENTIX 的狀態檔讀不了（%s），這次沒清 OPENTIX 待判的候選" % ot_why(e))
    print("演出結束移除 %d 筆，剩 %d 筆；過期的已看過紀錄移除 %d 筆" % (before - len(data["events"]), len(data["events"]), len(gone)))
    return 0


def cjk(s):
    return len(re.findall(r"[一-鿿]", s or ""))


def stale_sale_date(e, today_=None):
    """The ISO date of a 「M 月 D 日 … 開賣」 note that is already behind us, or None. A note is written once and never
    revisited (review 2026-11-08), so 「11 月 9 日 12:00 全民開賣」 would stay on the card until the concert. The year
    is not in the note: it is the last time that month and day fell on or before the first show."""
    note = e.get("note") if isinstance(e.get("note"), str) else ""
    if "開賣" not in note:
        return None
    m = re.search(r"(\d{1,2})\s*月\s*(\d{1,2})\s*日", note)
    if not m:
        return None
    dates = [s["date"] for s in e.get("shows", []) if isinstance(s, dict) and isinstance(s.get("date"), str) and DATE_RE.match(s["date"])]
    if not dates:
        return None
    first = dt.date.fromisoformat(min(dates))
    for year in (first.year, first.year - 1):
        try:
            sale = dt.date(year, int(m.group(1)), int(m.group(2)))
        except ValueError:
            return None
        if sale <= first:
            break
    t = today_ or tw_now().date()
    return sale.isoformat() if sale < t else None


def check_data(data):
    """(errors, warnings) for the concerts file."""
    import validate  # MACHINE: the machine-voice phrases editorial/STYLE.md §一 bans
    E, W = [], []
    if not isinstance(data, dict) or not isinstance(data.get("events"), list):
        return ["檔案要是 {\"checked\": 日期, \"events\": [...]}"], W
    for k in ("updated", "checked"):
        if data.get(k) is not None and not (isinstance(data[k], str) and DATE_RE.match(data[k])):
            E.append("%s 要是 YYYY-MM-DD" % k)
    ids, uids = set(), set()
    for i, e in enumerate(data["events"]):
        at = "events[%d]%s" % (i, "（%s）" % e.get("id") if isinstance(e, dict) and e.get("id") else "")
        if not isinstance(e, dict):
            E.append(at + " 不是物件")
            continue
        if not (isinstance(e.get("id"), str) and ID_RE.match(e["id"])):
            E.append(at + " id 要是小寫英數與連字號")
        elif e["id"] in ids:
            E.append(at + " id 重複")
        ids.add(e.get("id"))
        for k in ("title", "kind", "why"):
            if not (isinstance(e.get(k), str) and e[k].strip()):
                E.append(at + " 缺 %s" % k)
        if e.get("kind") and e["kind"] not in KINDS:
            E.append(at + " kind 只能是：" + "、".join(KINDS))
        r = e.get("rating")
        if not (isinstance(r, int) and not isinstance(r, bool) and 3 <= r <= 5):
            E.append(at + " rating 要是 3–5 的整數（2 分以下不收）")
        title, why = e.get("title") or "", e.get("why") or ""
        if len(title) > 30:
            W.append(at + " 標題 %d 字，去掉系列名與年份（30 字內）" % len(title))
        if why and not 15 <= cjk(why) <= 80:
            W.append(at + " why 中文 %d 字（15–80）" % cjk(why))
        for k in ("who", "program", "price", "note"):
            if e.get(k) is not None and not isinstance(e[k], str):
                E.append(at + " %s 要是字串" % k)
        if e.get("note") and len(e["note"]) > 30:
            W.append(at + " note 太長（30 字內，例如「已售完」「11 月 5 日 12:00 開賣」）")
        sale = stale_sale_date(e)
        if sale:
            W.append(at + " note 的開賣日 %s 已過：刪掉，或改成票況（已售完／尚有票）" % sale)
        for text in (title, why, e.get("program") or "", e.get("note") or ""):
            for p in validate.MACHINE:
                if p in text:
                    W.append(at + " 機器腔：「%s」" % p)
        shows = e.get("shows")
        if not (isinstance(shows, list) and shows):
            E.append(at + " shows 不可為空")
            shows = []
        for j, s in enumerate(shows):
            sat = "%s shows[%d]" % (at, j)
            if not isinstance(s, dict):
                E.append(sat + " 不是物件")
                continue
            if not (isinstance(s.get("date"), str) and DATE_RE.match(s["date"])):
                E.append(sat + " date 要是 YYYY-MM-DD")
            if s.get("time") and not TIME_RE.match(s["time"]):
                E.append(sat + " time 要是 HH:MM")
            if s.get("city") not in CITY_ORDER:
                E.append(sat + " city 只能是：" + "、".join(CITY_ORDER))
            if not (isinstance(s.get("venue"), str) and s["venue"].strip()):
                E.append(sat + " 缺 venue")
            if s.get("tickets") and not re.match(r"^https?://", s["tickets"]):
                E.append(sat + " tickets 要是網址")
        if shows and isinstance(r, int) and r < 4 and not any(isinstance(s, dict) and s.get("city") == "台中" for s in shows):
            E.append(at + " 台中以外的演出只收 4 分以上")
        if not (isinstance(e.get("added"), str) and DATE_RE.match(e["added"])):
            E.append(at + " added 要是 YYYY-MM-DD")
        us = e.get("uids")
        if not (isinstance(us, list) and all(isinstance(u, str) for u in us)):
            E.append(at + " uids 要是字串陣列（候選清單的 UID；自己找到的演出可以是空陣列）")
        else:
            for u in us:
                if u in uids:
                    E.append(at + " UID %s 出現在兩筆演出" % u)
                uids.add(u)
        src = e.get("sources")
        if not (isinstance(src, list) and src and all(isinstance(x, dict) and re.match(r"^https?://", x.get("url") or "") for x in src)):
            E.append(at + " sources 至少一項，每項要有 url")
    return E, W


def check(a):
    data = load(FILE, None)
    if data is None:
        print("✓ concerts.json 還沒有內容")
        return 0
    E, W = check_data(data)
    old, day = committed_ids(), today()
    if old is not None and isinstance(data, dict):
        for e in data.get("events", []):
            if isinstance(e, dict) and e.get("id") not in old and e.get("added") != day:
                E.append("（%s）新加入的演出 added 要是今天 %s（跑 close 或 sweep-done 會自動改）" % (e.get("id"), day))
    n = len(data.get("events", [])) if isinstance(data, dict) else 0
    print("%s concerts.json（%d 筆演出）" % ("✗" if E else "✓", n))
    for x in E:
        print("   ERROR " + x)
    for x in W:
        print("   WARN  " + x)
    return 1 if E else 0


def sweep_last():
    try:
        with open(SWEEP, encoding="utf-8") as f:
            return dt.date.fromisoformat(json.load(f).get("last", ""))
    except (OSError, ValueError, TypeError, AttributeError):
        return None


def sweep_due(a):
    """Prints 「補查：今天不用」, or 「補查：今天要做」 with the sources to open and the evidence sweep-done takes (the
    routine reads it here: the list in concerts.md was cut off mid-line on 2026-11-09). Exit 3 when the sweep is
    overdue — a morning has already gone by without finishing it — so that another program can tell; else 0."""
    today, last = tw_now().date(), sweep_last()
    late = None if last is None else (today - last).days - SWEEP_EVERY
    if late is not None and late < 0:
        print("補查：今天不用（上次 %s，每 %d 天一次）" % (last, SWEEP_EVERY))
        return 0
    path = os.path.join(TMP, "sweep.json")
    print("補查：今天要做（上次 %s%s）" % (last or "沒有紀錄", "；已逾期 %d 天" % late if late else ""))
    print("十個來源都要打開。看到的每一檔都評分，符合門檻的加進 concerts.json（uids 用空陣列），然後寫證據檔 %s：" % path)
    for k, v in SWEEP_SOURCES.items():
        print("  %s：%s" % (k, v))
    print('格式：{"mna": {"urls": ["實際打開的網址", "…"], "seen": [{"title": "看到的演出", "verdict": "收", "id": "concerts.json 的 id"}, '
          '{"title": "…", "verdict": "已列入", "id": "…"}, {"title": "…", "verdict": "不收", "why": "分數與理由"}]}, '
          '"pbc": {"error": "連不上或來不及查的原因"}, …}')
    print("寫好後：python3 scripts/concerts.py sweep-done --evidence %s（有來源沒查到也要跑：證據會存下來，算沒做完，明天再輪到）" % path)
    return 0 if late == 0 else 3


def sweep_done(a):
    """Takes the sweep's evidence — for every source the pages opened and each show seen there with its verdict — and
    keeps it in state/concerts/sweep.json. Exit 0: every source was looked at; today is the last finished sweep.
    Exit 3: kept, but a source was unreachable, not got to, or showed nothing: not finished, due again tomorrow (the
    sweep of 2026-11-11, six sources unreachable, left its account in a run note only). Exit 2: no evidence or a
    malformed one, nothing recorded (naming the ten sources used to do, and they can be typed without opening a page)."""
    try:
        with open(a.evidence or "", encoding="utf-8") as f:
            ev = json.load(f)
    except (OSError, ValueError) as e:
        print("補查：沒有證據檔，不記下（%s）。只打來源代號不算查過；格式見 sweep-due 的輸出。" % (e if a.evidence else "沒給 --evidence"))
        return 2
    data = load(FILE, None)
    ids = {e.get("id") for e in data.get("events", [])} if isinstance(data, dict) else set()
    bad, undone, tally = [], [], []
    if not isinstance(ev, dict):
        bad, ev = ["證據檔要是 {來源代號: {...}}"], {}
    bad += ["不認得的來源 %s（可用：%s）" % (k, " ".join(SWEEP_SOURCES)) for k in ev if k not in SWEEP_SOURCES]
    for k in SWEEP_SOURCES:
        s = ev.get(k)
        if not isinstance(s, dict) or s.get("error"):
            undone.append("%s（%s）" % (k, s["error"] if isinstance(s, dict) else "沒查"))
            continue
        urls, items = s.get("urls"), s.get("seen")
        if not (isinstance(urls, list) and urls and all(isinstance(u, str) and re.match(r"^https?://", u) for u in urls)) or not isinstance(items, list):
            bad.append("%s：要有 urls（實際打開的網址）與 seen（看到的每一檔），或 error（沒查到的原因）" % k)
            continue
        for x in items:
            x = x if isinstance(x, dict) else {}
            title, v = x.get("title"), x.get("verdict")
            if not title or v not in ("收", "已列入", "不收"):
                bad.append("%s：每一檔要有 title 與 verdict（收／已列入／不收）" % k)
            elif v == "不收" and not x.get("why"):
                bad.append("%s「%s」：不收要寫 why（分數與理由）" % (k, title))
            elif v != "不收" and x.get("id") not in ids:
                bad.append("%s「%s」：%s的要填 id，而且 concerts.json 裡要有這一筆（現在找不到 %s）" % (k, title, v, x.get("id")))
        if not items:
            undone.append("%s（打開了 %d 頁，一檔都沒看到）" % (k, len(urls)))  # an empty page is not a look
        tally.append("%s %d 頁 %d 檔" % (k, len(urls), len(items)))
    if bad:
        print("補查：證據檔有問題，不記下：")
        for x in bad:
            print("  - " + x)
        return 2
    if isinstance(data, dict):
        fixed = stamp_added(data)
        if fixed:
            save(FILE, data)
            print("added 改成今天：%s" % "、".join(fixed))
    day, last = tw_now().date().isoformat(), sweep_last()
    save(SWEEP, {"last": (last.isoformat() if last else None) if undone else day, "date": day, "sources": ev})
    print("補查證據已存（%s）：%s" % (day, "；".join(tally) or "沒有一個來源查到"))
    if undone:
        print("補查：沒做完，不記成做完（上次做完 %s）。沒查到的：%s" % (last or "沒有紀錄", "、".join(undone)))
        return 3
    print("補查：已記下 %s" % day)
    return 0


def ot_scan(a):
    """OPENTIX programme pages parsed into a JSON file, for a full survey by hand: every id in the sitemap (--all, no
    page limit) or those created in the last N days (at most MAX_PAGES pages). Reads no state and writes none."""
    try:
        ids = opentix.sitemap_ids()
    except Exception as e:  # noqa: BLE001
        print("讀不到 OPENTIX 的 sitemap：%s" % e)
        return 2
    if a.all:
        todo = ids
    else:
        cut = tw_now() - dt.timedelta(days=a.days)
        todo = [i for i in ids if opentix.created(i) >= cut][:opentix.MAX_PAGES]
    pages, bad = [], 0
    for i in todo:
        try:
            p = opentix.page(i)
        except Exception as e:  # noqa: BLE001
            p, bad = {"id": i, "url": opentix.PAGE % i, "error": str(e)}, bad + 1
        p["created"] = opentix.created(i).astimezone(tw_now().tzinfo).isoformat(timespec="seconds")
        pages.append(p)
    with open(a.out, "w", encoding="utf-8") as f:
        json.dump({"date": today(), "sitemap": len(ids), "pages": pages}, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print("OPENTIX：sitemap %d 個節目；讀了 %d 頁（讀不到 %d 頁）→ %s" % (len(ids), len(pages), bad, a.out))
    return 0


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("fetch")
    c = sub.add_parser("close")
    c.add_argument("--keep", nargs="*", help="這次還不能判斷、下次再看的 UID")
    c.add_argument("--reject", nargs="*", action="extend", metavar="UID=理由", help="不收的候選與分數、理由（同一製作的幾個 UID 用逗號連起來）")
    b = sub.add_parser("blocked", help="被擋下的清單：評分判不收、標題過濾擋下、補查看到但不收")
    b.add_argument("--since", help="只列這一天（YYYY-MM-DD）以後判不收的")
    r = sub.add_parser("reopen", help="把判不收的放回候選，下次 fetch 重評")
    r.add_argument("uids", nargs="*", help="指定的 UID")
    r.add_argument("--all", action="store_true", help="全部")
    r.add_argument("--since", help="這一天（YYYY-MM-DD）以後判的")
    r.add_argument("--old-rules", action="store_true", help="照舊的評分規則判的")
    sub.add_parser("prune")
    sub.add_parser("check")
    sub.add_parser("sweep-due", help="補查（第 8 步）今天要不要做：每兩天一次；逾期時結束碼 3")
    sd = sub.add_parser("sweep-done", help="交補查的證據檔；十個來源都查到才記成做完")
    sd.add_argument("--evidence", help="證據檔（格式見 sweep-due 的輸出）")
    sd.add_argument("--checked", nargs="*", help=argparse.SUPPRESS)  # the old call: taken so that it gets the refusal above
    ot = sub.add_parser("ot-scan", help="把 OPENTIX 節目頁解析成 JSON 存下來；不動任何狀態檔")
    g = ot.add_mutually_exclusive_group()
    g.add_argument("--all", action="store_true", help="sitemap 裡每一個節目（不受每次 %d 頁的上限）" % opentix.MAX_PAGES)
    g.add_argument("--days", type=int, default=NEW_DAYS, help="建立在 N 天內的節目（預設 %d）" % NEW_DAYS)
    ot.add_argument("--out", required=True, help="存成這個檔")
    a = ap.parse_args()
    return {"fetch": fetch, "close": close, "prune": prune, "check": check, "blocked": blocked, "reopen": reopen,
            "sweep-due": sweep_due, "sweep-done": sweep_done, "ot-scan": ot_scan}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
