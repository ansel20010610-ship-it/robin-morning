#!/usr/bin/env python3
"""Look up Wikimedia Commons files: URL, size, licence, author, date.

Usage:
  python3 scripts/commons.py "File:Gustav Klimt 016.jpg"        # one file, ready-to-use figure JSON
  python3 scripts/commons.py --search "Musikverein Wien 1900"     # candidates with licence
  python3 scripts/commons.py --width 1600 "File:..."
"""
import argparse
import html
import json
import os
import re
import sys
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import http_get  # noqa: E402

API = "https://commons.wikimedia.org/w/api.php"


def api(params):
    params = dict(params, format="json", formatversion=2)
    _, _, raw = http_get(API + "?" + urllib.parse.urlencode(params), timeout=30)
    return json.loads(raw.decode("utf-8"))


def strip(s):
    s = re.sub(r"<div[^>]*display:\s*none.*?</div>", "", s or "", flags=re.S)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def info(titles, width):
    d = api({"action": "query", "titles": "|".join(titles), "prop": "imageinfo",
             "iiprop": "url|size|extmetadata|mime", "iiurlwidth": width})
    out = []
    for p in d.get("query", {}).get("pages", []):
        if "imageinfo" not in p:
            out.append({"title": p.get("title"), "error": "找不到檔案"})
            continue
        ii = p["imageinfo"][0]
        m = ii.get("extmetadata", {})
        g = lambda k: strip(m.get(k, {}).get("value", ""))  # noqa: E731
        src = ii.get("thumburl") or ii.get("url")
        src = src.split("?")[0]
        w, h = ii.get("thumbwidth") or ii["width"], ii.get("thumbheight") or ii["height"]
        if ii["width"] <= width:
            src, w, h = ii["url"].split("?")[0], ii["width"], ii["height"]
        out.append({
            "title": p["title"],
            "mime": ii.get("mime"),
            "src": src, "width": w, "height": h,
            "original_size": "%dx%d" % (ii["width"], ii["height"]),
            "license": g("LicenseShortName"), "license_url": g("LicenseUrl"),
            "artist": g("Artist"), "credit": g("Credit"), "date": g("DateTimeOriginal"),
            "description": g("ImageDescription")[:400],
            "restrictions": g("Restrictions"),
            "source_url": ii.get("descriptionurl"),
        })
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("title", nargs="?")
    ap.add_argument("--search")
    ap.add_argument("--width", type=int, default=1280)
    ap.add_argument("--limit", type=int, default=12)
    a = ap.parse_args()
    if a.search:
        d = api({"action": "query", "list": "search", "srsearch": a.search, "srnamespace": 6, "srlimit": a.limit})
        titles = [x["title"] for x in d.get("query", {}).get("search", [])]
        if not titles:
            print("沒有結果")
            return 1
        for r in info(titles, a.width):
            if "error" in r:
                continue
            print("%s\n   %s｜%s｜%s｜原尺寸 %s\n   %s" % (r["title"], r["license"], r["artist"][:60], r["date"][:40],
                                                   r["original_size"], r["description"][:140]))
        return 0
    if not a.title:
        ap.print_help()
        return 1
    t = a.title if a.title.startswith("File:") else "File:" + a.title
    r = info([t], a.width)[0]
    if "error" in r:
        print(r["error"])
        return 1
    print(json.dumps(r, ensure_ascii=False, indent=2))
    lic = r["license"].lower()
    if not any(x in lic for x in ("public domain", "cc0", "cc by", "pd")):
        print("\n⚠ 授權為「%s」，請確認是否可用（只用 PD / CC0 / CC BY / CC BY-SA）。" % r["license"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
