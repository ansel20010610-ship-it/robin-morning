#!/usr/bin/env python3
"""加入行事曆: one .ics file per concert show and per Barça next fixture, written into ics/ for GitHub Pages to serve
as text/calendar (publish.yml runs this after build_index and copies the folder into _site; the folder is gitignored).

The app (assets/app.js calBtn) links to these files instead of building the calendar entry in the browser: on the
iPhone a home-screen app has no download tray and the share sheet offers no 行事曆, but a plain link to an .ics opened
in Safari shows the event with 加入 at once. File names are the contract with the app:

  ics/gig-<event id>-<YYYY-MM-DD>-<HHMM>.ics   one per show (19:30 when the show has no time), shows from yesterday on
  ics/football-<kickoff date>.ics             the football article's top-level "next" (SCHEMA.md), the newest issue wins

RFC 5545: UTC stamps (the kickoff and curtain times are Taiwan time), TEXT escaping, 75-octet folding that never splits
a code point, CRLF. Usage: python3 scripts/build_ics.py [out_dir]   (default ics/). Never fails the deploy: a problem
is printed as a warning and the files that could be written stay.
"""
import datetime as dt
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import TW, load_json, tw_now  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://wiener-morgen-private.duckdns.org/"
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
TIME_RE = re.compile(r"^\d{2}:\d{2}$")
KICKOFF_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2})?\+08:00$")
ID_RE = re.compile(r"^[\w-]+$")


def fold(line):
    """A content line folded at 75 octets of UTF-8; a continuation starts with one space (one of its 75)."""
    out, cur, n = [], "", 0
    for ch in line:
        b = len(ch.encode("utf-8"))
        if n + b > 75:
            out.append(cur)
            cur, n = " ", 1
        cur += ch
        n += b
    out.append(cur)
    return "\r\n".join(out)


def text(s):
    s = str(s or "")
    s = s.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,")
    return s.replace("\r\n", "\n").replace("\r", "\n").replace("\n", "\\n")


def stamp(t):
    return t.astimezone(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def ics(title, start, minutes, location, description, url, uid, now):
    # X-WR-CALNAME names the calendar the phone subscribes to through the app's webcal:// link (one event each).
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//知更鳥晨間記事//ZH", "METHOD:PUBLISH", "X-WR-CALNAME:%s" % text(title),
             "X-WR-TIMEZONE:Asia/Taipei", "BEGIN:VEVENT",
             "UID:%s@robin-morning" % uid, "DTSTAMP:%s" % stamp(now), "DTSTART:%s" % stamp(start),
             "DTEND:%s" % stamp(start + dt.timedelta(minutes=minutes)), "SUMMARY:%s" % text(title)]
    if location:
        lines.append("LOCATION:%s" % text(location))
    if description:
        lines.append("DESCRIPTION:%s" % text(description))
    if url and re.match(r"^https?://", url):
        lines.append("URL:%s" % re.sub(r"\s+", "", url))
    lines += ["END:VEVENT", "END:VCALENDAR"]
    return "\r\n".join(fold(l) for l in lines) + "\r\n"


def tw(date, hm):
    y, m, d = (int(x) for x in date.split("-"))
    h, mi = (int(x) for x in hm.split(":"))
    return dt.datetime(y, m, d, h, mi, tzinfo=TW)


def web(u):
    return u if isinstance(u, str) and re.match(r"^https?://", u) else ""


def concert_files(now):
    data = load_json(os.path.join(ROOT, "content", "concerts.json"))
    since = (now - dt.timedelta(days=1)).date().isoformat()
    out = {}
    for e in (data or {}).get("events") or []:
        if not isinstance(e, dict) or not isinstance(e.get("id"), str) or not ID_RE.match(e["id"]) or not e.get("title"):
            continue
        for s in e.get("shows") or []:
            if not isinstance(s, dict) or not isinstance(s.get("date"), str) or not DATE_RE.match(s["date"]) or s["date"] < since:
                continue
            time = s["time"] if isinstance(s.get("time"), str) and TIME_RE.match(s["time"]) else "19:30"
            try:
                start = tw(s["date"], time)
            except ValueError:
                continue
            lines = [x for x in ["演出：%s" % e["who"] if e.get("who") else "", "曲目：%s" % e["program"] if e.get("program") else "",
                                 "票況：%s" % e["note"] if e.get("note") else "", web(s.get("tickets"))] if x]
            uid = "%s-%s-%s" % (e["id"], s["date"], time.replace(":", ""))
            out["gig-%s.ics" % uid] = ics(e["title"], start, 120, "，".join(x for x in [s.get("venue"), s.get("city")] if x),
                                          "\n".join(lines), web(s.get("tickets")), uid, now)
    return out


def football_files(now):
    out = {}
    issues = os.path.join(ROOT, "content", "issues")
    for d in sorted(os.listdir(issues)) if os.path.isdir(issues) else []:
        p = os.path.join(issues, d, "football.json")
        if not DATE_RE.match(d) or not os.path.exists(p):
            continue
        try:
            a = load_json(p)
        except Exception as e:  # a half-written draft must not stop the other files
            print("::warning::build_ics %s: %s" % (p, e))
            continue
        n = a.get("next") if isinstance(a, dict) else None
        m = KICKOFF_RE.match(n["kickoff"].strip()) if isinstance(n, dict) and isinstance(n.get("kickoff"), str) else None
        if not m or not n.get("opponent") or not n.get("competition"):
            continue
        try:
            start = tw(m.group(1), m.group(2))
        except ValueError:
            continue
        home = n.get("home")
        desc = "%s%s\n%s" % (n["competition"], "" if not isinstance(home, bool) else "・主場" if home else "・客場", a.get("title") or "")
        out["football-%s.ics" % m.group(1)] = ics("巴薩 對 %s（%s）" % (n["opponent"], n["competition"]), start, 115,
                                                   n.get("venue") if isinstance(n.get("venue"), str) else "", desc,
                                                   "%s#/a/%s/football" % (SITE, d), "football-%s" % m.group(1), now)
    return out


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "ics")
    os.makedirs(out_dir, exist_ok=True)
    now = tw_now()
    files = {}
    for make in (concert_files, football_files):
        try:
            files.update(make(now))
        except Exception as e:  # never fail the deploy
            print("::warning::build_ics %s: %s" % (make.__name__, e))
    for old in os.listdir(out_dir):
        if old.endswith(".ics") and old not in files:
            os.remove(os.path.join(out_dir, old))
    for name, body in files.items():
        with open(os.path.join(out_dir, name), "w", encoding="utf-8", newline="") as f:
            f.write(body)
    print("ics/：%d 個行事曆檔（演出 %d、巴薩 %d）" % (len(files), sum(k.startswith("gig-") for k in files), sum(k.startswith("football-") for k in files)))


if __name__ == "__main__":
    main()
