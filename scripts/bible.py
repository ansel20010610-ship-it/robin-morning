#!/usr/bin/env python3
"""Fetch 和合本 (Chinese Union Version, traditional) text from FHL 信望愛聖經工具.

Usage: python3 scripts/bible.py 詩 23 1-3
Prints a ready-to-paste `scripture` block. Book names use FHL 中文簡稱
（創 出 利 民 申 書 士 得 撒上 撒下 王上 王下 代上 代下 拉 尼 斯 伯 詩 箴 傳 歌 賽 耶 哀 結 但 何 珥 摩 俄 拿 彌 鴻 哈 番 該 亞 瑪
 太 可 路 約 徒 羅 林前 林後 加 弗 腓 西 帖前 帖後 提前 提後 多 門 來 雅 彼前 彼後 約一 約二 約三 猶 啟）。
"""
import datetime as dt
import json
import os
import sys
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import http_get  # noqa: E402

API = "https://bible.fhl.net/json/qb.php"


def fetch(book, chapter, sec):
    q = urllib.parse.urlencode({"chineses": book, "chap": chapter, "sec": sec, "version": "unv", "gb": 0, "strong": 0})
    _, _, raw = http_get(API + "?" + q, timeout=20)
    data = json.loads(raw.decode("utf-8"))
    if data.get("status") != "success":
        return []
    return [{"n": r["sec"], "text": r["bible_text"], "c": r["chap"]} for r in data.get("record", [])]


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        return 1
    book, chap, sec = sys.argv[1], int(sys.argv[2]), sys.argv[3]
    verses = fetch(book, chap, sec)
    if not verses:
        print("FHL 沒有回傳經文，請檢查書卷簡稱與章節。")
        return 1
    block = {
        "type": "scripture",
        "ref": "（請改成完整書卷名，例：詩篇 %d 篇 %s 節）" % (chap, sec),
        "book": book,
        "chapter": chap,
        "version": "和合本",
        "verses": [{"n": v["n"], "text": v["text"]} for v in verses],
        "source": "信望愛聖經工具 FHL 和合本（bible.fhl.net），%s 核對" % dt.date.today().isoformat(),
    }
    print(json.dumps(block, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
