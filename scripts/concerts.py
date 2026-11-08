#!/usr/bin/env python3
"""近期演出: the standing list of concerts, operas and musicals at the foot of the front page (content/concerts.json).
It is not part of any issue; the 演出資訊 routine keeps it current (editorial/columns/concerts.md).

  python3 scripts/concerts.py fetch            # new candidates from the Ministry of Culture's open data
                                               #   → /tmp/robin/concert-candidates.md (+ .json for `close`); the same
                                               #   file ends with 「## 已列入演出的異動」 when the feed's shows for a
                                               #   listed event differ from concerts.json (vanished, changed, new)
  python3 scripts/concerts.py close [--keep UID ...]
                                               # after rating: every candidate of the last fetch counts as seen
                                               #   (listed if an event names its UID, else rejected), except --keep
  python3 scripts/concerts.py prune            # drop shows already over, and seen UIDs whose shows are over
  python3 scripts/concerts.py check            # the file's schema and voice (validate.py --concerts runs the same)

Seen UIDs live in state/concerts/seen.json, so a candidate is rated once. Stdlib only.
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
# The sweep for productions the open data never carries (concerts.md step 8): every second day (the owner, 2026-11-08:
# 每兩天跑一次; it was Mondays only, and a tour announced on a Tuesday waited six days). Kept by the date of the last
# finished sweep rather than by the calendar's parity, so a day the 演出班 fails or runs out of time simply leaves the
# sweep due the next morning.
SWEEP = os.path.join(ROOT, "state", "concerts", "sweep.json")
SWEEP_EVERY = 2  # days
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
# clearly not what the list is for; anything doubtful is left to the editor
SKIP = re.compile(r"兒童|親子|寶寶|幼兒|布袋戲|木偶|偶戲|歌仔戲|京劇|豫劇|崑曲|崑劇|客家戲|相聲|說唱|講座|工作坊|研習|營隊|徵選|甄選|"
                  r"比賽|大賽|成果發表|成果展|期末|畢業|彩排|體驗|導覽|市集")
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
            raw += [(cat, e) for e in json.loads(body.decode("utf-8"))]
        except Exception as e:  # noqa: BLE001 — any failure means the check could not be made today
            print("查核失敗：讀不到文化部開放資料（category %d）：%s" % (cat, e))
            return 2
    cands, skipped, known = [], 0, 0
    for cat, e in raw:
        uid, title = e.get("UID") or "", (e.get("title") or "").strip()
        if not uid or not title:
            continue
        if cat == 2 and not STAGE.search(title.replace("歌劇院", "").replace("歌劇團", "")):
            continue
        if SKIP.search(title):
            skipped += 1
            continue
        shows, in_window = [], []
        for s in e.get("showInfo") or []:
            when = (s.get("time") or "").replace("/", "-")
            date, time = when[:10], when[11:16]
            city = city_of(s)
            venue = (s.get("locationName") or "").strip()
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
        if uid in seen:
            known += 1
            continue
        shows.sort(key=lambda s: (s["date"], s["time"]))
        desc = re.sub(r"\s+", " ", e.get("descriptionFilterHtml") or "").strip()
        units = "、".join(u for u in (e.get("masterUnit") or []) + [e.get("showUnit") or ""] if u)
        cands.append({"uids": [uid], "category": "音樂" if cat == 1 else "戲劇", "title": title, "shows": shows,
                      "url": e.get("sourceWebPromote") or e.get("webSales") or "", "sales": e.get("webSales") or "",
                      "source": e.get("sourceWebName") or "", "units": units, "desc": desc[:240]})
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
    save(CANDS + ".json", {"date": day, "uids": [u for c in cands for u in c["uids"]]})
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
    changed = listed_changes(data, feed_shows, day, end)
    if changed:
        lines += ["", "## 已列入演出的異動", "",
                  "開放資料和 concerts.json 對不上的場次。先開該筆的售票頁確認，再改 shows／note；開放資料整筆消失不等於取消，以售票頁為準。", ""]
        for e, notes in changed:
            lines.append("- `%s`｜%s" % (e["id"], e.get("title", "")))
            lines += ["  - " + n for n in notes]
    with open(CANDS + ".md", "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    by = {k: sum(1 for c in cands if any(s["city"] == k for s in c["shows"])) for k in CITY_ORDER}
    print("新候選 %d 筆（%s）；%s已看過 %d 筆；明顯不相關略過 %d 筆%s。清單：%s.md" % (
        len(cands), "、".join("%s %d" % kv for kv in by.items()), "還有 %d 筆留到下次；" % waiting if waiting else "",
        known, skipped, "；已列入有異動 %d 筆（見清單末段）" % len(changed) if changed else "", CANDS))
    return 0


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
    n = {"listed": 0, "rejected": 0}
    end = (dt.date.fromisoformat(last["date"]) + dt.timedelta(days=WINDOW)).isoformat()
    for u in last["uids"]:
        if u in keep:
            continue
        v = "listed" if u in ends else "rejected"
        seen[u] = {"seen": last["date"], "end": ends.get(u, end), "v": v}
        n[v] += 1
    save(SEEN, dict(sorted(seen.items())))
    data["checked"] = last["date"]
    save(FILE, data)
    print("已記錄：列入 %d、不收 %d、留待下次 %d" % (n["listed"], n["rejected"], len(keep)))
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
    """Prints 「補查：今天要做」 or 「補查：今天不用（上次 <日期>）」; exit 0 either way (the routine reads the line)."""
    today, last = tw_now().date(), sweep_last()
    if last is None or (today - last).days >= SWEEP_EVERY:
        print("補查：今天要做（上次 %s）" % (last or "沒有紀錄"))
    else:
        print("補查：今天不用（上次 %s，每 %d 天一次）" % (last, SWEEP_EVERY))
    return 0


def sweep_done(a):
    """Records today as the last finished sweep (state/concerts/sweep.json)."""
    os.makedirs(os.path.dirname(SWEEP), exist_ok=True)
    with open(SWEEP, "w", encoding="utf-8") as f:
        json.dump({"last": tw_now().date().isoformat()}, f, ensure_ascii=False)
        f.write("\n")
    print("補查：已記下 %s" % tw_now().date())
    return 0


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("fetch")
    c = sub.add_parser("close")
    c.add_argument("--keep", nargs="*", help="這次還不能判斷、下次再看的 UID")
    sub.add_parser("prune")
    sub.add_parser("check")
    sub.add_parser("sweep-due", help="補查（第 8 步）今天要不要做：每兩天一次")
    sub.add_parser("sweep-done", help="補查做完，記下今天")
    a = ap.parse_args()
    return {"fetch": fetch, "close": close, "prune": prune, "check": check,
            "sweep-due": sweep_due, "sweep-done": sweep_done}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
