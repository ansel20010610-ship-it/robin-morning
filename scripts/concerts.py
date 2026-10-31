#!/usr/bin/env python3
"""近期演出: the standing list of concerts, operas and musicals at the foot of the front page (content/concerts.json).
It is not part of any issue; the 演出資訊 routine keeps it current (editorial/columns/concerts.md).

  python3 scripts/concerts.py fetch            # new candidates from the Ministry of Culture's open data
                                               #   → /tmp/robin/concert-candidates.md (+ .json for `close`)
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
    listed = {u for e in data.get("events", []) for u in e.get("uids", [])}
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
        shows = []
        for s in e.get("showInfo") or []:
            when = (s.get("time") or "").replace("/", "-")
            date, time = when[:10], when[11:16]
            city = city_of(s)
            venue = (s.get("locationName") or "").strip()
            if city and DATE_RE.match(date) and day <= date <= end and (city == "台中" or BIG_HALL.search(venue)):
                shows.append({"date": date, "time": time if TIME_RE.match(time) else "", "city": city,
                              "venue": venue, "price": (s.get("price") or "").strip()})
        if not shows:
            continue
        if uid in seen or uid in listed:
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
    with open(CANDS + ".md", "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    by = {k: sum(1 for c in cands if any(s["city"] == k for s in c["shows"])) for k in CITY_ORDER}
    print("新候選 %d 筆（%s）；%s已看過 %d 筆；明顯不相關略過 %d 筆。清單：%s.md" % (
        len(cands), "、".join("%s %d" % kv for kv in by.items()), "還有 %d 筆留到下次；" % waiting if waiting else "",
        known, skipped, CANDS))
    return 0


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


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("fetch")
    c = sub.add_parser("close")
    c.add_argument("--keep", nargs="*", help="這次還不能判斷、下次再看的 UID")
    sub.add_parser("prune")
    sub.add_parser("check")
    a = ap.parse_args()
    return {"fetch": fetch, "close": close, "prune": prune, "check": check}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
