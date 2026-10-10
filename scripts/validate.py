#!/usr/bin/env python3
"""Validate a day's articles against editorial/SCHEMA.md.

Usage:
  python3 scripts/validate.py 2026-10-11
  python3 scripts/validate.py 2026-10-11 --column music --check-urls

Exit code 1 when any ERROR is found.
"""
import argparse
import datetime as dt
import json
import os
import re
import sys
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (article_path, cjk_count, figures_of, http_get, image_key,  # noqa: E402
                    iter_articles, load_config, load_json, walk_blocks)

LENGTH = {  # (min, max) CJK characters in body
    "football": (1800, 3500), "perio": (2500, 4000), "music": (1800, 3000),
    "civilization": (3000, 4500), "devotion": (1200, 2200),
    "art": (2500, 4000), "photo": (2000, 3500), "city": (2500, 4000),
    "fiction": (2500, 4000), "literature": (2500, 4000), "tactics": (2000, 3500),
    "philosophy": (2500, 4000), "fm-watch": (0, 5000), "cosmere-watch": (0, 5000),
}
BLOCK_TYPES = {"p", "h", "quote", "list", "facts", "figure", "detail", "timeline", "table", "pitch",
               "svg", "news", "scripture", "prayer", "music", "paper", "exercise", "callout",
               "spoiler", "divider"}
VISUAL = {"figure", "timeline", "table", "pitch", "svg"}
FIG_KINDS = {"artwork", "photo", "still", "map", "portrait", "document", "illustration"}
TAGS = {"史實", "史料", "學者解釋", "推論", "本文讀法", "原創假設", "原創示範", "官方說法", "報導",
        "傳聞", "可見", "經文明言", "背景", "詮釋", "文本", "戰術推論", "教練說法"}
AI_PHRASES = ["值得一提的是", "不可否認", "毋庸置疑", "總而言之", "綜上所述", "總的來說", "深入探討",
              "神秘面紗", "一場旅程", "的旅程", "交織出", "譜寫", "完美詮釋", "長河中", "時光荏苒",
              "歷久彌新", "嘆為觀止", "史詩級", "讓我們一起", "在這個資訊爆炸", "不禁讓人"]
DEVOTION_HEADS = ["今日經文", "經文釋義", "與我的生活連結", "今日禱告"]
INLINE_LINK = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


def validate_file(cfg, d, col, path, check_urls=False, used_images=None, used_topics=None):
    errs, warns = [], []
    E, W = errs.append, warns.append
    try:
        art = load_json(path)
    except Exception as e:  # noqa: BLE001
        return ["JSON 無法解析：%s" % e], []
    if col not in cfg["columns"]:
        E("欄位代號 %s 不在 config.json" % col)
    if art.get("column") != col:
        E("column 應為 %s" % col)
    if art.get("date") != str(d):
        E("date 應為 %s" % d)
    for k in ("title", "dek", "topic_key", "updated_at"):
        if not isinstance(art.get(k), str) or not art.get(k).strip():
            E("缺少 %s" % k)
    if len(art.get("title", "")) > 32:
        W("標題偏長（%d 字）" % len(art.get("title", "")))
    if len(art.get("dek", "")) > 90:
        W("導言偏長（%d 字）" % len(art.get("dek", "")))
    tk = art.get("topic_key", "")
    if tk and not tk.startswith(col + ":"):
        E("topic_key 要以「%s:」開頭" % col)
    if used_topics is not None and tk in used_topics:
        E("topic_key 已在 %s 用過：%s" % (used_topics[tk], tk))

    is_watch = col in ("fm-watch", "cosmere-watch")
    undetermined = is_watch and art.get("status") == "undetermined"
    if is_watch and art.get("status") not in ("update", "undetermined"):
        E("觀測站需要 status：update 或 undetermined")

    body = art.get("body")
    if not isinstance(body, list) or not body:
        E("body 不可為空")
        body = []
    if not undetermined and not isinstance(art.get("hero"), dict):
        E("缺少 hero 頭圖")
    sources = art.get("sources")
    if not isinstance(sources, list) or not sources:
        E("缺少 sources")
    else:
        for i, s in enumerate(sources):
            if not str(s.get("url", "")).startswith("http"):
                E("sources[%d] 缺少網址" % i)
            if not s.get("title"):
                E("sources[%d] 缺少 title" % i)

    ids = {"hero"} if isinstance(art.get("hero"), dict) else set()
    for b in body:
        if isinstance(b, dict) and b.get("id"):
            ids.add(b["id"])

    visuals = 0
    seen_in_article = {}
    heads = []
    for idx, b in enumerate(walk_blocks(art)):
        where = "hero" if b.get("id") == "hero" and idx == 0 and isinstance(art.get("hero"), dict) else "body[%d]" % (idx - (1 if isinstance(art.get("hero"), dict) else 0))
        t = b.get("type", "figure")
        if t not in BLOCK_TYPES:
            E("%s 未知區塊類型 %s" % (where, t))
            continue
        if t in VISUAL and where != "hero":
            visuals += 1
        if t == "p":
            if not b.get("text"):
                E("%s 段落是空的" % where)
            if b.get("tag") and b["tag"] not in TAGS:
                W("%s 段落標籤「%s」不在建議清單" % (where, b["tag"]))
            for _, url in INLINE_LINK.findall(b.get("text", "")):
                if not url.startswith("http"):
                    E("%s 連結網址無效：%s" % (where, url))
        elif t == "h":
            heads.append(b.get("text", ""))
        elif t == "figure":
            for k in ("src", "alt", "caption", "credit", "license", "source_url"):
                if not b.get(k):
                    E("%s 圖片缺少 %s" % (where, k))
            if not isinstance(b.get("width"), int) or not isinstance(b.get("height"), int):
                E("%s 圖片缺少整數 width/height" % where)
            if b.get("kind") not in FIG_KINDS:
                E("%s 圖片 kind 需為 %s" % (where, "/".join(sorted(FIG_KINDS))))
            if not str(b.get("src", "")).startswith("https://"):
                E("%s 圖片 src 需為 https" % where)
            if re.search(r"fair.?use|non-?free", str(b.get("license", "")), re.I):
                E("%s 不可使用非自由授權圖片" % where)
            key = image_key(b.get("src"))
            if key in seen_in_article:
                E("%s 同一張圖重複出現（請用 detail）：%s" % (where, key))
            seen_in_article[key] = where
            if used_images is not None and key in used_images:
                E("%s 圖片已在 %s 用過：%s" % (where, used_images[key], key))
            if b.get("src_large") and image_key(b["src_large"]) != key:
                E("%s src_large 必須是同一張圖的大尺寸版本" % where)
            if check_urls:
                for u in [b.get("src")] + ([b["src_large"]] if b.get("src_large") else []):
                    ok, msg = check_image(u)
                    if ok is None:
                        W("%s 圖片主機暫時限流（HTTP 429），這次無法確認能否開啟：%s。不要因此換圖；確認 commons.py 查得到這個檔案即可" % (where, u))
                    elif not ok:
                        E("%s 圖片無法開啟：%s（%s）" % (where, u, msg))
        elif t == "detail":
            if b.get("of") not in ids:
                E("%s detail.of 找不到圖片 id：%s" % (where, b.get("of")))
            r = b.get("region")
            if not (isinstance(r, list) and len(r) == 4 and all(isinstance(x, (int, float)) and 0 <= x <= 1 for x in r)):
                E("%s detail.region 需為 4 個 0–1 的數字" % where)
            elif r[0] + r[2] > 1.001 or r[1] + r[3] > 1.001:
                E("%s detail.region 超出圖片範圍" % where)
            if not b.get("position") or not b.get("caption"):
                E("%s detail 需要 position 與 caption" % where)
        elif t == "svg":
            s = b.get("svg", "")
            if not s.strip().startswith("<svg") or "viewBox" not in s:
                E("%s svg 需以 <svg 開頭並有 viewBox" % where)
            if re.search(r"<script|<foreignObject|\son\w+\s*=|javascript:|href=\"http", s, re.I):
                E("%s svg 含不允許的內容" % where)
            if not b.get("caption"):
                E("%s svg 缺少 caption" % where)
        elif t == "timeline":
            if not b.get("items"):
                E("%s timeline 沒有項目" % where)
        elif t == "table":
            if not b.get("head") or not b.get("rows"):
                E("%s table 需要 head 與 rows" % where)
            else:
                n = len(b["head"])
                for ri, row in enumerate(b["rows"]):
                    if len(row) != n:
                        E("%s table 第 %d 列欄數與表頭不符" % (where, ri + 1))
        elif t == "pitch":
            check_pitch(b, where, E)
        elif t == "news":
            for i, it in enumerate(b.get("items", [])):
                for k in ("headline", "summary", "source"):
                    if not it.get(k):
                        E("%s news[%d] 缺少 %s" % (where, i, k))
        elif t == "scripture":
            check_scripture(b, where, E, W, check_urls)
        elif t == "music":
            sp = b.get("spotify") or {}
            if not (sp.get("tracks") or sp.get("album") or sp.get("query")):
                E("%s music 需要 spotify.query 或 ID" % where)
            for k in ("composer", "work", "performers", "recording"):
                if not b.get(k):
                    E("%s music 缺少 %s" % (where, k))
            for tid in sp.get("tracks", []) + ([sp["album"]] if sp.get("album") else []):
                if not re.match(r"^[A-Za-z0-9]{22}$", tid):
                    E("%s Spotify ID 格式不對：%s" % (where, tid))
        elif t == "paper":
            if not b.get("citation") or not (b.get("doi") or b.get("pmid")):
                E("%s paper 需要 citation 與 doi/pmid" % where)
        elif t == "exercise":
            if not b.get("steps") or not b.get("criteria"):
                E("%s exercise 需要 steps 與 criteria" % where)

    if not undetermined and visuals < 1:
        E("正文需要至少一個圖或圖解（figure/timeline/table/pitch/svg），detail 不算")

    # column-specific rules
    if col == "devotion":
        if heads != DEVOTION_HEADS:
            E("晨光欄四個小標必須依序為：%s（目前：%s）" % ("、".join(DEVOTION_HEADS), "、".join(heads)))
        types = [b.get("type") for b in body]
        if "scripture" not in types:
            E("晨光欄缺少 scripture")
        if "prayer" not in types:
            E("晨光欄缺少 prayer")
    if col == "music" and "music" not in [b.get("type") for b in body]:
        E("今日古典缺少 music 區塊")
    if col == "perio":
        if "paper" not in [b.get("type") for b in body]:
            E("牙周欄缺少 paper 論文卡")
        if not art.get("disclaimer"):
            E("牙周欄缺少 disclaimer")
    if col == "tactics" and "pitch" not in [b.get("type") for b in body] and not (art.get("hero") or {}).get("type") == "pitch":
        E("看懂一段比賽需要 pitch 場形圖")

    # length and style
    n = cjk_count(art)
    lo, hi = LENGTH.get(col, (0, 99999))
    if not undetermined:
        if n < lo * 0.4:
            E("正文只有 %d 字，遠低於下限 %d" % (n, lo))
        elif n < lo:
            W("正文 %d 字，低於建議 %d–%d" % (n, lo, hi))
        elif n > hi * 1.2:
            W("正文 %d 字，高於建議 %d–%d" % (n, lo, hi))
    full = json.dumps(body, ensure_ascii=False)
    for ph in AI_PHRASES:
        if ph in full:
            W("避免用語：「%s」" % ph)
    if "！！" in full or "!!" in full:
        W("避免連續驚嘆號")
    return errs, warns


def check_pitch(b, where, E):
    steps = b.get("steps") or []
    if not steps:
        E("%s pitch 沒有 steps" % where)
    for si, s in enumerate(steps):
        pids = set()
        for p in s.get("players", []):
            pids.add(p.get("id"))
            if p.get("team") not in ("blue", "red"):
                E("%s pitch 第 %d 步球員 team 需為 blue/red" % (where, si + 1))
            if not (0 <= p.get("x", -1) <= 100 and 0 <= p.get("y", -1) <= 100):
                E("%s pitch 第 %d 步球員座標超出 0–100" % (where, si + 1))
        if not s.get("note"):
            E("%s pitch 第 %d 步缺少 note" % (where, si + 1))
        ball = s.get("ball")
        if isinstance(ball, str) and ball not in pids:
            E("%s pitch 第 %d 步持球者 %s 不在場上" % (where, si + 1, ball))
        for a in s.get("arrows", []):
            if a.get("from") not in pids:
                E("%s pitch 第 %d 步箭頭起點 %s 不在場上" % (where, si + 1, a.get("from")))
            if a.get("kind") not in ("pass", "run", "dribble", "press"):
                E("%s pitch 第 %d 步箭頭 kind 不對" % (where, si + 1))
            to = a.get("to")
            if isinstance(to, str) and to not in pids:
                E("%s pitch 第 %d 步箭頭終點 %s 不在場上" % (where, si + 1, to))


def check_scripture(b, where, E, W, check_urls):
    if b.get("version") != "和合本":
        E("%s 經文 version 必須是「和合本」" % where)
    for k in ("ref", "book", "chapter", "verses", "source"):
        if not b.get(k):
            E("%s 經文缺少 %s" % (where, k))
    if "修訂" in json.dumps(b, ensure_ascii=False):
        E("%s 經文區塊不可出現和合本修訂版" % where)
    if not check_urls or not b.get("verses"):
        return
    try:
        import bible
        for v in b["verses"]:
            chap = v.get("c", b.get("chapter"))
            got = bible.fetch(b["book"], chap, str(v["n"]))
            if not got:
                E("%s 無法向 FHL 取得 %s %s:%s" % (where, b["book"], chap, v["n"]))
            elif got[0]["text"] != v.get("text"):
                E("%s %s %s:%s 與 FHL 和合本不一致\n      FHL：%s\n      稿件：%s" % (
                    where, b["book"], chap, v["n"], got[0]["text"], v.get("text")))
    except Exception as e:  # noqa: BLE001
        W("%s 無法連線核對經文：%s" % (where, e))


RATE_LIMITED = "rate-limited"


def check_image(url):
    import urllib.error
    try:
        status, headers, _ = http_get(url, headers={"Range": "bytes=0-1023"}, timeout=25, retries=1)
        ctype = headers.get("Content-Type", headers.get("content-type", ""))
        if status not in (200, 206):
            return False, "HTTP %s" % status
        if not ctype.startswith("image/"):
            return False, "不是圖片（%s）" % ctype
        return True, ""
    except urllib.error.HTTPError as e:
        if e.code in (429, 503):
            return None, RATE_LIMITED
        return False, "HTTP %s" % e.code
    except Exception as e:  # noqa: BLE001
        return False, str(e)[:120]


def ledgers_excluding(day, col):
    images, topics = {}, {}
    for d, c, p in iter_articles():
        if d == day and c == col:
            continue
        try:
            art = load_json(p)
        except Exception:  # noqa: BLE001
            continue
        for f in figures_of(art):
            images.setdefault(image_key(f.get("src")), "%s/%s" % (d, c))
        if art.get("topic_key") and d != day:
            topics.setdefault(art["topic_key"], "%s/%s" % (d, c))
    return images, topics


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("date")
    ap.add_argument("--column")
    ap.add_argument("--check-urls", action="store_true")
    a = ap.parse_args()
    cfg = load_config()
    d = dt.date.fromisoformat(a.date)
    ddir = os.path.dirname(article_path(d, "x"))
    if a.column:
        cols = [a.column]
    else:
        cols = sorted(fn[:-5] for fn in os.listdir(ddir) if fn.endswith(".json")) if os.path.isdir(ddir) else []
    if not cols:
        print("%s 沒有稿件" % d)
        return 0
    bad = 0
    for col in cols:
        p = article_path(d, col)
        if not os.path.exists(p):
            print("✗ %s：檔案不存在" % col)
            bad += 1
            continue
        imgs, tops = ledgers_excluding(str(d), col)
        errs, warns = validate_file(cfg, d, col, p, a.check_urls, imgs, tops)
        art = load_json(p) if not errs or "JSON" not in errs[0] else {}
        print("%s %s（%d 字）%s" % ("✗" if errs else "✓", col, cjk_count(art) if art else 0,
                                  "：" + art.get("title", "") if art else ""))
        for e in errs:
            print("   ERROR " + e)
        for w in warns:
            print("   WARN  " + w)
        bad += bool(errs)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
