#!/usr/bin/env python3
"""Look up Wikimedia Commons files: URL, size, licence, author, date.

Usage:
  python3 scripts/commons.py "File:Gustav Klimt 016.jpg"        # one file, ready-to-use figure JSON
  python3 scripts/commons.py --search "Musikverein Wien 1900"     # candidates with licence
  python3 scripts/commons.py --width 1600 "File:..."
  python3 scripts/commons.py --page 5 --width 2560 "File:....djvu"   # one page of a DjVu/PDF/TIFF scan
"""
import argparse
import html
import json
import os
import re
import sys
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import BROWSER_IMAGE_TYPES, http_get, raw_image_ext  # noqa: E402

API = "https://commons.wikimedia.org/w/api.php"
MULTIPAGE = {"image/vnd.djvu", "application/pdf", "image/tiff"}


def api(params):
    params = dict(params, format="json", formatversion=2)
    _, _, raw = http_get(API + "?" + urllib.parse.urlencode(params), timeout=30)
    return json.loads(raw.decode("utf-8"))


def strip(s):
    s = re.sub(r"<div[^>]*display:\s*none.*?</div>", "", s or "", flags=re.S)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def info(titles, width, page=None):
    params = {"action": "query", "titles": "|".join(titles), "prop": "imageinfo",
              "iiprop": "url|size|extmetadata|mime", "iiurlwidth": width}
    if page:
        params["iiurlparam"] = "page%d-%dpx" % (page, width)
    d = api(params)
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
        # Commons may serve another width than asked (standard sizes, pages of scans): trust the file name and keep
        # the ratio of the original (or of the requested page, which can differ from page 1).
        px = re.match(r"(?:lossy-|lossless-)?(?:page\d+-)?(\d+)px-", src.rsplit("/", 1)[-1])
        if px and int(px.group(1)) != w:
            bw, bh = (w, h) if page else (ii["width"], ii["height"])
            w, h = int(px.group(1)), round(bh * int(px.group(1)) / bw)
        # The original only when browsers can draw it; DjVu/TIFF/PDF stay as their JPEG/PNG thumbnails.
        if ii["width"] <= width and ii.get("mime") in BROWSER_IMAGE_TYPES and not page:
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
            "source_url": ii.get("descriptionurl", "") + ("?page=%d" % page if page else ""),
        })
        if page:
            out[-1]["page"] = page
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("title", nargs="?")
    ap.add_argument("--search")
    ap.add_argument("--width", type=int, default=1280)
    ap.add_argument("--limit", type=int, default=12)
    ap.add_argument("--page", type=int, help="DjVu/PDF/TIFF 的第幾頁（src 與 src_large 要用同一頁）")
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
    r = info([t], a.width, a.page)[0]
    if "error" in r:
        print(r["error"])
        return 1
    print(json.dumps(r, ensure_ascii=False, indent=2))
    if raw_image_ext(r["src"]):
        print("\n⚠ src 是瀏覽器無法顯示的原檔（%s），不能直接用；請換一個檔案。" % raw_image_ext(r["src"]))
    elif r["mime"] in MULTIPAGE and not a.page:
        print("\nℹ 這是多頁檔（%s），src 是第 1 頁；要用別頁請加 --page N，src 與 src_large 用同一頁。" % r["mime"])
    lic = r["license"].lower()
    if not any(x in lic for x in ("public domain", "cc0", "cc by", "pd")):
        print("\n⚠ 授權為「%s」，請確認是否可用（只用 PD / CC0 / CC BY / CC BY-SA）。" % r["license"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
