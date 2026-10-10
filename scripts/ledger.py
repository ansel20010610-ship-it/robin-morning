#!/usr/bin/env python3
"""List what has already been published, to avoid repeating topics and images.

Usage:
  python3 scripts/ledger.py --column music      # past topics in a column
  python3 scripts/ledger.py --images            # every image already used
  python3 scripts/ledger.py --topics            # every topic_key
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import figures_of, image_key, iter_articles, load_json  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--column")
    ap.add_argument("--images", action="store_true")
    ap.add_argument("--topics", action="store_true")
    a = ap.parse_args()
    rows = []
    for day, col, path in iter_articles():
        try:
            art = load_json(path)
        except Exception as e:  # noqa: BLE001
            print("! 無法讀取 %s：%s" % (path, e), file=sys.stderr)
            continue
        if not isinstance(art, dict):
            print("! 無法讀取 %s：頂層不是 JSON 物件" % path, file=sys.stderr)
            continue
        rows.append((day, col, art))
    if a.images:
        for day, col, art in rows:
            for f in figures_of(art):
                print("%s  %-14s %s" % (day, col, image_key(f.get("src"))))
        return
    if a.topics:
        for day, col, art in rows:
            print("%s  %-14s %s" % (day, col, art.get("topic_key", "")))
        return
    if a.column:
        hits = [(d, art) for d, c, art in rows if c == a.column]
        if not hits:
            print("（%s 尚無已刊文章）" % a.column)
        for day, art in hits:
            print("%s  %s\n            %s" % (day, art.get("topic_key", ""), art.get("title", "")))
        return
    ap.print_help()


if __name__ == "__main__":
    main()
