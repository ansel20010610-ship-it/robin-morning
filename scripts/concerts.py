#!/usr/bin/env python3
"""近期演出: the standing list of concerts, operas and musicals at the foot of the front page (content/concerts.json).
It is not part of any issue; the 演出資訊 routine keeps it current (editorial/columns/concerts.md).

  python3 scripts/concerts.py fetch            # new candidates from the Ministry of Culture's open data
                                               #   → /tmp/robin/concert-candidates.md (+ .json for `close`); the same
                                               #   file ends with 「## 已列入演出的異動」 when the feed's shows for a
                                               #   listed event differ from concerts.json (vanished, changed, new)
  python3 scripts/concerts.py close [--reject UID=理由 ...] [--keep UID ...]
                                               # after rating: a candidate an event names is listed, one given a reason
                                               #   is rejected (title, shows and reason kept), the rest come back
  python3 scripts/concerts.py blocked [--since DATE]   # what was turned away, and why
  python3 scripts/concerts.py reopen [UID ...] [--all] [--since DATE] [--old-rules]   # rejections back to candidates
  python3 scripts/concerts.py prune            # drop shows already over, and seen UIDs whose shows are over
  python3 scripts/concerts.py check            # the file's schema and voice (validate.py --concerts runs the same)
  python3 scripts/concerts.py sweep-due        # is the sweep due; when it is, the sources and the evidence format
  python3 scripts/concerts.py sweep-done --evidence FILE

Exit codes, for other programs: 0 done; 2 nothing recorded (fetch: no feed or an empty one; sweep-done: no evidence or a
malformed one); 3 not finished (fetch: the feed was incomplete; sweep-done: evidence kept but a source was not looked
at; sweep-due: the sweep is overdue).

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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import CONTENT, ROOT, http_get, tw_now  # noqa: E402

FILE = os.path.join(CONTENT, "concerts.json")
SEEN = os.path.join(ROOT, "state", "concerts", "seen.json")
FETCHED = os.path.join(ROOT, "state", "concerts", "fetch.json")  # the last fetch: was the feed whole, what the filters dropped
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


def note_fetch(day, problem, dropped=None):
    """Writes fetch.json: `complete` (false with the reason in `note`; `incomplete_since` is the first day of a run of
    such fetches) and `dropped`, what the title filters kept from being rated (left as it was when the feed failed)."""
    old = load(FETCHED, {})
    save(FETCHED, {"date": day, "complete": not problem, "note": problem,
                   "incomplete_since": (old.get("incomplete_since") or day) if problem else None,
                   "dropped": old.get("dropped", {}) if dropped is None else dropped})


def fetch(a):
    day = today()
    end = (dt.date.fromisoformat(day) + dt.timedelta(days=WINDOW)).isoformat()
    seen = load(SEEN, {})
    data = load(FILE, {"events": []})
    listed = {u: e for e in data.get("events", []) for u in e.get("uids", [])}
    feed_shows = {}  # listed event id → the feed's shows for its UIDs (a listed event is never a candidate again, but
    #                  its shows are compared: a listing was checked once, on the day it was rated, and then never —
    #                  cancellations, new dates and new cities went unnoticed, review 2026-11-08)
    raw = []
    for cat in (1, 2):
        try:
            status, _, body = http_get(FEED % cat, timeout=60)
            rows = json.loads(body.decode("utf-8"))
            if not rows:  # an empty answer is not 「今天沒有新演出」
                raise ValueError("回應是空的")
            raw += [(cat, e) for e in rows]
        except Exception as e:  # noqa: BLE001 — any failure means the check could not be made today
            print("查核失敗：讀不到文化部開放資料（category %d）：%s" % (cat, e))
            note_fetch(day, "讀不到 category %d：%s" % (cat, e))
            return 2
    cands, known, info, dropped, filled = [], 0, {}, {}, False
    for cat, e in raw:
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
            when = (s.get("time") or "").replace("/", "-")
            date, time = when[:10], when[11:16]
            city = city_of(s)
            venue = (s.get("locationName") or "").strip()
            if city and DATE_RE.match(date) and day <= date and (city == "台中" or BIG_HALL.search(venue)):
                sig.add("%s %s" % (date, city))  # every show to come, not the window's: the window slides by a day a day
            if city and DATE_RE.match(date) and day <= date <= end:
                show = {"date": date, "time": time if TIME_RE.match(time) else "", "city": city,
                        "venue": venue, "price": (s.get("price") or "").strip()}
                in_window.append(show)  # every show in the window, for the comparison with a listed event
                if city == "台中" or BIG_HALL.search(venue):
                    shows.append(show)  # a candidate only where the trip is worth it
        if uid in listed:
            known += 1
            feed_shows.setdefault(listed[uid]["id"], []).extend(in_window)
            continue
        if not shows:
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
    changed = listed_changes(data, feed_shows, day, end)
    # A feed that comes back short (2026-11-09 06:18: 23 of the 24 listed events "gone", all back by noon) is not 23
    # cancellations: when most of the listed events are missing at once, say the feed was incomplete and leave the
    # whole-event notes out — the next fetch compares again.
    gone = [x for x in changed if x[1] and x[1][0].startswith("開放資料裡已找不到")]
    with_uids = sum(1 for e in data.get("events", []) if e.get("uids") and any(day <= s.get("date", "") <= end for s in e.get("shows", [])))
    partial = len(gone) >= 3 and len(gone) * 2 > with_uids
    if partial:
        changed = [x for x in changed if x not in gone]
        print("注意：開放資料這次不完整（已列入的 %d 筆裡有 %d 筆整筆不在回應裡），不當作取消，異動段落略過這些；明天再比。"
              "新候選照常評分；這次算沒查完（結束碼 3）。" % (with_uids, len(gone)))
    note_fetch(day, "已列入的 %d 筆裡有 %d 筆整筆不在回應裡" % (with_uids, len(gone)) if partial else "", dropped)
    rules = rules_version()
    rej = [v for v in seen.values() if v.get("v") == "rejected"]
    stale = sum(1 for v in rej if v.get("rules") != rules)
    if stale:
        print("注意：判不收的 %d 筆裡有 %d 筆是照舊的評分規則判的（清單：python3 scripts/concerts.py blocked）。" % (len(rej), stale))
    if changed:
        lines += ["", "## 已列入演出的異動", "",
                  "開放資料和 concerts.json 對不上的場次。先開該筆的售票頁確認，再改 shows／note；開放資料整筆消失不等於取消，以售票頁為準。", ""]
        for e, notes in changed:
            lines.append("- `%s`｜%s" % (e["id"], e.get("title", "")))
            lines += ["  - " + n for n in notes]
    with open(CANDS + ".md", "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    by = {k: sum(1 for c in cands if any(s["city"] == k for s in c["shows"])) for k in CITY_ORDER}
    print("新候選 %d 筆（%s）；%s已看過 %d 筆；標題過濾擋下 %d 筆%s。清單：%s.md" % (
        len(cands), "、".join("%s %d" % kv for kv in by.items()), "還有 %d 筆留到下次；" % waiting if waiting else "",
        known, len(dropped), "；已列入有異動 %d 筆（見清單末段）" % len(changed) if changed else "", CANDS))
    return 3 if partial else 0


def listed_changes(data, feed_shows, day, end):
    """[(event, [notes])] for listed events whose upcoming shows differ from what the feed now says about their UIDs:
    a listed show the feed no longer has (cancelled, or moved — a move shows up as one vanished and one new), a show
    whose time or venue changed, a show the feed has and the listing does not (a new date or city). An event whose
    UIDs have all left the feed is noted as such; events without UIDs (found by hand) are not in the feed at all."""
    out = []
    squeeze = lambda v: re.sub(r"\s+", "", v or "")
    for e in data.get("events", []):
        if not e.get("uids"):
            continue
        upcoming = {(s["date"], s["city"]): s for s in e.get("shows", []) if day <= s.get("date", "") <= end and s.get("city")}
        if e["id"] not in feed_shows:
            if upcoming:
                out.append((e, ["開放資料裡已找不到這筆（UID %s）；整筆消失不等於取消，以售票頁為準" % "、".join(e["uids"])]))
            continue
        feed = {}
        for s in feed_shows[e["id"]]:
            feed.setdefault((s["date"], s["city"]), s)
        notes = []
        for k in sorted(set(upcoming) - set(feed)):
            s = upcoming[k]
            notes.append("消失：%s %s %s %s（可能取消或改期）" % (s["date"], s.get("time") or "", s["city"], s.get("venue") or ""))
        for k in sorted(set(feed) - set(upcoming)):
            s = feed[k]
            notes.append("新場次：%s %s %s %s%s" % (s["date"], s["time"], s["city"], s["venue"], "（%s）" % s["price"] if s["price"] else ""))
        for k in sorted(set(feed) & set(upcoming)):
            a, b = upcoming[k], feed[k]
            diff = []
            if a.get("time") and b["time"] and a["time"] != b["time"]:
                diff.append("時間 %s → %s" % (a["time"], b["time"]))
            va, vb = squeeze(a.get("venue")), squeeze(b["venue"])
            if va and vb and va != vb and va not in vb and vb not in va:
                diff.append("場地 %s → %s" % (a["venue"], b["venue"]))
            if diff:
                notes.append("改動：%s %s %s" % (k[0], k[1], "；".join(diff)))
        if notes:
            out.append((e, notes))
    return out


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


def reopen(a):
    """Takes rejections out of seen.json, so that the next fetch offers them again: those named, all, those rejected on
    or after a date, or under rules since changed. (The only way back was to edit the file by hand: 13 shows, 2026-11-09.)"""
    seen, rules = load(SEEN, {}), rules_version()
    hit = [u for u, v in seen.items() if v.get("v") == "rejected" and (
        a.all or u in a.uids or (a.since and v.get("seen", "") >= a.since) or (a.old_rules and v.get("rules") != rules))]
    for u in hit:
        del seen[u]
    if hit:
        save(SEEN, seen)
    print("放回候選 %d 筆%s" % (len(hit), "；下次 fetch 會再列出來（一次最多 %d 筆，由近到遠）" % LIMIT if hit else "（沒有符合的不收紀錄）"))
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
    a = ap.parse_args()
    return {"fetch": fetch, "close": close, "prune": prune, "check": check, "blocked": blocked, "reopen": reopen,
            "sweep-due": sweep_due, "sweep-done": sweep_done}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
