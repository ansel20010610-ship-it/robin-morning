#!/usr/bin/env python3
"""Validate a day's articles against editorial/SCHEMA.md.

Usage:
  python3 scripts/validate.py 2026-10-11
  python3 scripts/validate.py 2026-10-11 --column music --check-urls

Exit code 1 when any ERROR is found. A malformed article is reported as ERROR, never as a traceback.
"""
import argparse
import datetime as dt
import functools
import json
import os
import re
import sys
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (iter_reserve, RESERVE, BROWSER_IMAGE_TYPES, article_path, cjk_count, figures_of, http_get, image_key,  # noqa: E402
                    image_page, iter_articles, load_config, load_json, raw_image_ext)

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
STALE_WORDS = ["今天", "今日", "今晨", "今早", "昨天", "昨晚", "昨日", "明天", "本週", "這週", "上週", "本月", "創刊"]
DEVOTION_HEADS = ["今日經文", "經文釋義", "與我的生活連結", "今日禱告"]
LINK_START = re.compile(r"\[[^\]]+\]\(")
# Same pattern as inline() in assets/util.js: an http(s) URL without spaces, holding at most one level of
# balanced parentheses. A [text]( that does not match it is shown to readers as raw text, not as a link.
INLINE_LINK = re.compile(r"\[([^\]]+)\]\((https?://(?:[^()\s]|\([^()\s]*\))+)\)")
SVG_NS, XLINK_NS = "http://www.w3.org/2000/svg", "http://www.w3.org/1999/xlink"
# The App inserts svg blocks straight into the page, so anything that reaches outside the drawing is banned:
# scripts, <style> (applies to the whole page), XHTML <base>/<meta>/<link> (move the page's base URL or redirect
# it), non-SVG namespaces, and links or url() references that are not #ids inside the drawing.
SVG_BAD_TAG = re.compile(r"<((?:[\w.-]+:)?(?:script|foreignObject|iframe|style|base|meta|link))\b", re.I)
SVG_BAD_ATTR = re.compile(r"\s(on\w+|http-equiv|xml:base)\s*=", re.I)
SVG_XMLNS = re.compile(r"\sxmlns(?::([\w.-]+))?\s*=\s*([\"'])(.*?)\2", re.S)
SVG_HREF = re.compile(r"(?<![\w.:-])((?:[\w.-]+:)?href)\s*=\s*([\"'])(.*?)\2", re.I | re.S)
SVG_URL = re.compile(r"url\(\s*[\"']?\s*([^\"')\s]*)", re.I)


def jtype(v):
    """JSON type of v, for messages."""
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "布林值"
    return {dict: "物件", list: "陣列", str: "字串", int: "數字", float: "數字"}.get(type(v), type(v).__name__)


def is_num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def page_label(n):
    return "第 %d 頁" % n if n else "未標頁碼的檔案"


def list_of(v, typ):
    return isinstance(v, list) and all(isinstance(x, typ) for x in v)


def topic_norm(key):
    """topic_key as compared for de-duplication: case and stray spaces do not count (DOIs are case-insensitive)."""
    return re.sub(r"\s+", " ", key).strip().lower()


# Commons often holds one picture under several names: "X.jpg", "X - Google Art Project.jpg", "X (cropped).jpg".
NAME_NOISE = set("jpg jpeg png tif tiff svg gif webp djvu pdf the and for from with file image photo photograph "
                 "illustration google art project edit edited crop cropped detail version scan scanned restored "
                 "retouched museum high resolution full color colour".split())


@functools.lru_cache(maxsize=None)
def name_words(key):
    if not key.startswith("commons:"):
        return frozenset()
    name = key.split(":", 1)[1].rsplit(".", 1)[0].lower()
    return frozenset(t for t in re.split(r"[^0-9a-z\u00c0-\u024f\u4e00-\u9fff]+", name) if len(t) >= 3 and t not in NAME_NOISE)


def near_duplicate(key, used):
    """A used Commons image whose distinctive file-name words all appear in `key`'s, or the other way round, or None.
    Containment, not mere overlap: two painters' "Christ in the House of Martha and Mary" differ by one word and are
    two pictures, while "X - Google Art Project.jpg" only adds words to "X.jpg"."""
    a = name_words(key)
    if len(a) < 3:
        return None
    for other in used:
        b = name_words(other)
        if len(b) >= 3 and (a <= b or b <= a):
            return other
    return None


def validate_file(cfg, d, col, path, check_urls=False, used_images=None, used_topics=None):
    """Return (errors, warnings) for one article file. Never raises on malformed content."""
    errs, warns = [], []
    try:
        art = load_json(path)
    except Exception as e:  # noqa: BLE001
        return ["JSON 無法解析：%s" % e], []
    if not isinstance(art, dict):
        return ["頂層必須是 JSON 物件 {...}（目前是%s）" % jtype(art)], []
    try:
        check_article(cfg, d, col, art, check_urls, used_images, used_topics, errs.append, warns.append)
    except Exception as e:  # noqa: BLE001  # a shape the checks below did not anticipate
        errs.append("結構錯誤（欄位型別不符 SCHEMA）：%s: %s" % (type(e).__name__, e))
    return errs, warns


def check_article(cfg, d, col, art, check_urls, used_images, used_topics, E, W):
    # A day's article and a reserve written at the same time can pick the same topic or picture. The day's article
    # stands; the reserve gives way (reserve.py lists it as needing a fix, and the reserve shift fixes those first).
    def clash(other, msg):
        if str(d) != "reserve" and str(other).startswith("備稿"):
            W(msg + "；以刊出稿為準，這篇備稿要改（reserve.py 會列為需修正）")
        else:
            E(msg)

    if col not in cfg["columns"]:
        E("欄位代號 %s 不在 config.json" % col)
    if art.get("column") != col:
        E("column 應為 %s" % col)
    if d == "reserve":
        if art.get("date") != "reserve":
            E("備稿的 date 必須是 \"reserve\"")
        rw = art.get("reserve_written")
        if not (isinstance(rw, str) and re.match(r"^\d{4}-\d{2}-\d{2}$", rw)):
            E("備稿需要 reserve_written（撰寫日期 YYYY-MM-DD）")
        if col in ("fm-watch", "cosmere-watch"):
            E("觀測站不做備稿")
        text = json.dumps(art.get("body", []), ensure_ascii=False) + art.get("title", "") + art.get("dek", "")
        for head in DEVOTION_HEADS:  # the devotion column's fixed headings (今日經文, 今日禱告) are not a dated word
            text = text.replace(head, "")
        stale = [w for w in STALE_WORDS if w in text]
        if stale:
            W("備稿要在任何一天都成立，避免會過期的字眼：%s" % "、".join(stale))
    elif art.get("date") != str(d):
        E("date 應為 %s" % d)
    for k in ("title", "dek", "topic_key", "updated_at"):
        v = art.get(k)
        if v is not None and not isinstance(v, str):
            E("%s 需為字串（目前是%s）" % (k, jtype(v)))
        elif not v or not v.strip():
            E("缺少 %s" % k)
    ua = art.get("updated_at")
    if isinstance(ua, str) and ua.strip() and not re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$", ua):
        E("updated_at 需含時區，例如 2026-10-11T06:40:00+08:00（目前：%s）" % ua)
    elif isinstance(ua, str) and ua.strip() and d != "reserve":
        # The news window of the next Barça update starts here, so a guessed (future) time hides news.
        # (A reserve's updated_at is replaced when it runs.)
        try:
            when = dt.datetime.fromisoformat(ua.replace("Z", "+00:00"))
        except ValueError:
            when = None
        if when and when > dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=10):
            E("updated_at（%s）晚於現在：填實際完稿時間，用 TZ=Asia/Taipei date +%%Y-%%m-%%dT%%H:%%M:00+08:00" % ua)
    title = art.get("title") if isinstance(art.get("title"), str) else ""
    dek = art.get("dek") if isinstance(art.get("dek"), str) else ""
    if len(title) > 32:
        W("標題偏長（%d 字）" % len(title))
    if len(dek) > 90:
        W("導言偏長（%d 字）" % len(dek))
    tk = art.get("topic_key") if isinstance(art.get("topic_key"), str) else ""
    if tk and not tk.startswith(col + ":"):
        E("topic_key 要以「%s:」開頭" % col)
    if tk and used_topics is not None and topic_norm(tk) in used_topics:
        clash(used_topics[topic_norm(tk)], "topic_key 已在 %s 用過：%s" % (used_topics[topic_norm(tk)], tk))

    is_watch = col in ("fm-watch", "cosmere-watch")
    undetermined = is_watch and art.get("status") == "undetermined"
    if is_watch and art.get("status") not in ("update", "undetermined"):
        E("觀測站需要 status：update 或 undetermined")

    body = art.get("body")
    if not isinstance(body, list) or not body:
        E("body 需為區塊陣列（目前是%s）" % jtype(body) if body and not isinstance(body, list) else "body 不可為空")
        body = []
    hero = art.get("hero")
    has_hero = isinstance(hero, dict)
    if hero is not None and not has_hero:
        E("hero 需為物件（Figure 或圖解區塊，目前是%s）" % jtype(hero))
    elif not undetermined and not has_hero:
        E("缺少 hero 頭圖")
    sources = art.get("sources")
    if not isinstance(sources, list) or not sources:
        E("缺少 sources")
    else:
        for i, s in enumerate(sources):
            if not isinstance(s, dict):
                E("sources[%d] 需為物件 {title, url, ...}（目前是%s）" % (i, jtype(s)))
                continue
            if not str(s.get("url", "")).startswith("http"):
                E("sources[%d] 缺少網址" % i)
            if not s.get("title"):
                E("sources[%d] 缺少 title" % i)
            check_links("sources[%d].note" % i, [s.get("note")], E)

    # Blocks are labelled by position, never by id: a hero copied from the Figure example keeps "id": "f1",
    # and it must still count as the hero (not as a body visual).
    blocks = []
    if has_hero:
        h = dict(hero)
        h["type"] = h.get("type") or "figure"
        blocks.append(("hero", h))
    for i, b in enumerate(body):
        if isinstance(b, dict):
            blocks.append(("body[%d]" % i, b))
        else:
            E("body[%d] 需為區塊物件 {\"type\": ...}（目前是%s）" % (i, jtype(b)))

    # detail.of resolves like renderBody in assets/blocks.js: "hero" when the hero is a figure (whatever its
    # own id), otherwise the id of a body block whose type is exactly "figure".
    fig_ids = {"hero"} if has_hero and (hero.get("type") or "figure") == "figure" else set()
    for _, b in blocks[1 if has_hero else 0:]:
        if b.get("type") == "figure" and isinstance(b.get("id"), str) and b["id"]:
            fig_ids.add(b["id"])

    visuals = 0
    seen_in_article = {}
    heads = []
    for where, b in blocks:
        t = b.get("type")
        if not isinstance(t, str) or t not in BLOCK_TYPES:
            E("%s 未知區塊類型 %s" % (where, t))
            continue
        if t in VISUAL and where != "hero":
            visuals += 1
        check_links(where, inline_texts(b), E)
        if t == "p":
            if not b.get("text"):
                E("%s 段落是空的" % where)
            elif not isinstance(b["text"], str):
                E("%s 段落 text 需為字串" % where)
            tag = b.get("tag")
            if tag and (not isinstance(tag, str) or tag not in TAGS):
                W("%s 段落標籤「%s」不在建議清單" % (where, tag))
        elif t == "h":
            heads.append(b.get("text") if isinstance(b.get("text"), str) else "")
        elif t == "figure":
            for k in ("src", "alt", "caption", "credit", "license", "source_url"):
                if not b.get(k):
                    E("%s 圖片缺少 %s" % (where, k))
            if not isinstance(b.get("width"), int) or not isinstance(b.get("height"), int):
                E("%s 圖片缺少整數 width/height" % where)
            if not isinstance(b.get("kind"), str) or b["kind"] not in FIG_KINDS:
                E("%s 圖片 kind 需為 %s" % (where, "/".join(sorted(FIG_KINDS))))
            src = b.get("src") if isinstance(b.get("src"), str) else ""
            large = b.get("src_large") if isinstance(b.get("src_large"), str) else ""
            if b.get("src_large") and not large:
                E("%s src_large 需為網址字串" % where)
            if not src.startswith("https://"):
                E("%s 圖片 src 需為 https" % where)
            for k, u in (("src", src), ("src_large", large)):
                if raw_image_ext(u):
                    E("%s %s 指向瀏覽器無法顯示的原檔（%s）：%s；請改用 commons.py 給的 JPEG/PNG 縮圖網址"
                      % (where, k, raw_image_ext(u), u))
            if re.search(r"fair.?use|non-?free", str(b.get("license", "")), re.I):
                E("%s 不可使用非自由授權圖片" % where)
            key = image_key(src)
            if key and key in seen_in_article:
                E("%s 同一張圖重複出現（請用 detail）：%s" % (where, key))
            seen_in_article[key] = where
            if key and used_images is not None and key in used_images:
                clash(used_images[key], "%s 圖片已在 %s 用過：%s" % (where, used_images[key], key))
            elif key and used_images:
                near = near_duplicate(key, used_images)
                if near:
                    W("%s 圖片檔名和 %s 用過的 %s 幾乎相同，可能是同一張圖的裁切、修復或另一份掃描；"
                      "請打開兩張比對，是同一張就換圖（IMAGES.md「不重複」）" % (where, used_images[near], near))
            if large and image_key(large) != key:
                E("%s src_large 必須是同一張圖的大尺寸版本" % where)
            elif large and image_page(large) != image_page(src):
                E("%s src_large 是%s，src 是%s，必須是同一頁（commons.py 加 --page N）"
                  % (where, page_label(image_page(large)), page_label(image_page(src))))
            if check_urls:
                for u in [x for x in (src, large) if x]:
                    ok, msg = check_image(u)
                    if ok is None and msg == RATE_LIMITED:
                        W("%s 圖片主機暫時限流（HTTP 429），這次無法確認能否開啟：%s。不要因此換圖；確認 commons.py 查得到這個檔案即可" % (where, u))
                    elif ok is None:
                        W("%s 無法連線核對圖片：%s（%s）。這次無法確認能否開啟，稍後再跑一次 --check-urls；不要只因此換圖" % (where, u, msg))
                    elif not ok:
                        E("%s 圖片無法開啟：%s（%s）" % (where, u, msg))
        elif t == "detail":
            of = b.get("of")
            if not isinstance(of, str) or of not in fig_ids:
                E("%s detail.of 找不到圖片：%s（只能指向 figure：頭圖一律寫 \"hero\"，正文圖寫它的 id）" % (where, of))
            r = b.get("region")
            if not (isinstance(r, list) and len(r) == 4 and all(isinstance(x, (int, float)) and 0 <= x <= 1 for x in r)):
                E("%s detail.region 需為 4 個 0–1 的數字" % where)
            elif r[0] + r[2] > 1.001 or r[1] + r[3] > 1.001:
                E("%s detail.region 超出圖片範圍" % where)
            if not b.get("position") or not b.get("caption"):
                E("%s detail 需要 position 與 caption" % where)
        elif t == "svg":
            s = b.get("svg") if isinstance(b.get("svg"), str) else ""
            if not s.strip().startswith("<svg") or "viewBox" not in s:
                E("%s svg 需以 <svg 開頭並有 viewBox" % where)
            bad = svg_problems(s)
            if bad:
                E("%s svg 含不允許的內容：%s" % (where, "、".join(bad)))
            if not b.get("caption"):
                E("%s svg 缺少 caption" % where)
        elif t == "timeline":
            if not b.get("items"):
                E("%s timeline 沒有項目" % where)
            elif not list_of(b["items"], dict):
                E("%s timeline.items 需為物件陣列 [{\"when\",\"label\",\"note\"}]" % where)
        elif t == "table":
            head, rows = b.get("head"), b.get("rows")
            if not head or not rows:
                E("%s table 需要 head 與 rows" % where)
            elif not isinstance(head, list) or not isinstance(rows, list):
                E("%s table 的 head 與 rows 需為陣列" % where)
            else:
                n = len(head)
                for ri, row in enumerate(rows):
                    if not isinstance(row, list):
                        E("%s table 第 %d 列需為陣列（目前是%s）" % (where, ri + 1, jtype(row)))
                    elif len(row) != n:
                        E("%s table 第 %d 列欄數與表頭不符" % (where, ri + 1))
        elif t == "pitch":
            check_pitch(b, where, E)
        elif t == "news":
            items = b.get("items")
            if not items:
                E("%s news 沒有項目" % where)
            elif not isinstance(items, list):
                E("%s news.items 需為陣列" % where)
            else:
                for i, it in enumerate(items):
                    if not isinstance(it, dict):
                        E("%s news[%d] 需為物件 {headline, summary, source, ...}（目前是%s）" % (where, i, jtype(it)))
                        continue
                    for k in ("headline", "summary", "source"):
                        if not it.get(k):
                            E("%s news[%d] 缺少 %s" % (where, i, k))
        elif t == "scripture":
            check_scripture(b, where, E, W, check_urls)
        elif t == "music":
            sp = b.get("spotify") or {}
            if not isinstance(sp, dict):
                E("%s music.spotify 需為物件" % where)
                sp = {}
            tracks, album = sp.get("tracks") or [], sp.get("album") or ""
            if not isinstance(tracks, list):
                E("%s spotify.tracks 需為陣列" % where)
                tracks = []
            if not (tracks or album or sp.get("query")):
                E("%s music 需要 spotify.query 或 ID" % where)
            for k in ("composer", "work", "performers", "recording"):
                if not b.get(k):
                    E("%s music 缺少 %s" % (where, k))
            for tid in tracks + ([album] if album else []):
                if not isinstance(tid, str) or not re.match(r"^[A-Za-z0-9]{22}$", tid):
                    E("%s Spotify ID 格式不對：%s" % (where, tid))
        elif t == "paper":
            if not b.get("citation") or not (b.get("doi") or b.get("pmid")):
                E("%s paper 需要 citation 與 doi/pmid" % where)
        elif t == "exercise":
            if not b.get("steps") or not b.get("criteria"):
                E("%s exercise 需要 steps 與 criteria" % where)
            elif not list_of(b["steps"], str) or not list_of(b["criteria"], str):
                E("%s exercise 的 steps 與 criteria 需為字串陣列" % where)
        elif t == "list":
            if not b.get("items") or not list_of(b["items"], str):
                E("%s list.items 需為非空的字串陣列" % where)
        elif t == "callout":
            if b.get("items") is not None and not list_of(b["items"], str):
                E("%s callout.items 需為字串陣列" % where)
        elif t == "facts":
            if not list_of(b.get("items"), list) or not all(len(x) == 2 for x in b["items"]):
                E("%s facts.items 需為 [[\"欄名\",\"內容\"], ...]" % where)

    if not undetermined and visuals < 1:
        E("正文需要至少一個圖或圖解（figure/timeline/table/pitch/svg），detail 不算")

    # column-specific rules
    types = [b.get("type") for b in body if isinstance(b, dict)]
    if col == "devotion":
        if heads != DEVOTION_HEADS:
            E("晨光欄四個小標必須依序為：%s（目前：%s）" % ("、".join(DEVOTION_HEADS), "、".join(heads)))
        if "scripture" not in types:
            E("晨光欄缺少 scripture")
        if "prayer" not in types:
            E("晨光欄缺少 prayer")
    if col == "music" and "music" not in types:
        E("今日古典缺少 music 區塊")
    if col == "perio":
        if "paper" not in types:
            E("牙周欄缺少 paper 論文卡")
        if not art.get("disclaimer"):
            E("牙周欄缺少 disclaimer")
        if tk != tk.lower():
            E("牙周欄 topic_key 的 DOI 要全小寫：%s" % tk.lower())
        dois = [b["doi"].strip().lower() for b in body
                if isinstance(b, dict) and b.get("type") == "paper" and isinstance(b.get("doi"), str)]
        if tk.startswith("perio:doi:") and dois and topic_norm(tk) != "perio:doi:" + dois[0]:
            W("topic_key 和 paper.doi 不一致（應為 perio:doi:%s）" % dois[0])
    if col == "tactics" and "pitch" not in types and not (has_hero and hero.get("type") == "pitch"):
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


def inline_texts(b):
    """Texts of a block that the App renders through inline() (assets/util.js), i.e. where links work."""
    t = b.get("type")
    vals = [b.get(k) for k in ("text", "caption", "cite", "citation", "question", "design", "sample", "note")]
    items = b.get("items") if isinstance(b.get("items"), list) else []
    if t in ("list", "callout"):
        vals += items
    elif t == "facts":
        vals += [x[1] for x in items if isinstance(x, list) and len(x) > 1]
    elif t in ("timeline", "news"):
        for it in items:
            if isinstance(it, dict):
                vals += [it.get("label"), it.get("note"), it.get("headline"), it.get("summary")]
    elif t == "table":
        vals += b.get("head") if isinstance(b.get("head"), list) else []
        for row in b.get("rows") if isinstance(b.get("rows"), list) else []:
            vals += row if isinstance(row, list) else []
    elif t == "pitch":
        vals += [s.get("note") for s in b.get("steps") if isinstance(s, dict)] if isinstance(b.get("steps"), list) else []
    elif t == "exercise":
        vals += [b.get("title")]
        for k in ("steps", "criteria"):
            vals += b.get(k) if isinstance(b.get(k), list) else []
    return [v for v in vals if isinstance(v, str)]


def check_links(where, texts, E):
    for text in texts:
        if not isinstance(text, str):
            continue
        for m in LINK_START.finditer(text):
            if not INLINE_LINK.match(text, m.start()):
                end = text.find(")", m.end())
                E("%s 連結網址無效：%s（要以 https:// 開頭、不含空白；網址裡的括號只能一層且成對，否則把 ( ) 改寫成 %%28 %%29）"
                  % (where, text[m.start():end + 1 if end >= 0 else m.end() + 80]))


def svg_problems(s):
    found = ["<%s>" % m for m in SVG_BAD_TAG.findall(s)]
    found += ["%s=" % m for m in SVG_BAD_ATTR.findall(s)]
    if re.search(r"javascript:", s, re.I):
        found.append("javascript:")
    for prefix, _, uri in SVG_XMLNS.findall(s):
        if uri != SVG_NS and not (prefix and uri == XLINK_NS):
            found.append("xmlns%s=\"%s\"（只能用 SVG 命名空間）" % (":" + prefix if prefix else "", uri))
    for name, _, val in SVG_HREF.findall(s):
        if not val.strip().startswith("#"):
            found.append("%s=\"%s\"（只能指向本圖內的 #id）" % (name, val[:80]))
    for val in SVG_URL.findall(s):
        if not val.startswith("#"):
            found.append("url(%s)（只能用 url(#id)）" % val[:80])
    return list(dict.fromkeys(found))


def check_pitch(b, where, E):
    steps = b.get("steps")
    if not isinstance(steps, list) or not steps:
        E(("%s pitch.steps 需為陣列" if steps else "%s pitch 沒有 steps") % where)
        return
    half = b.get("view") == "half"  # assets/pitch.js shows only y 50–100; anything lower is cut off

    def check_point(pt, what, si):
        if not (isinstance(pt, list) and len(pt) == 2 and all(is_num(v) for v in pt)):
            E("%s pitch 第 %d 步%s需為 [x, y] 兩個數字" % (where, si + 1, what))
        elif not (0 <= pt[0] <= 100 and 0 <= pt[1] <= 100):
            E("%s pitch 第 %d 步%s座標超出 0–100" % (where, si + 1, what))
        elif half and pt[1] < 50:
            outside.append(what.strip())

    for si, s in enumerate(steps):
        if not isinstance(s, dict):
            E("%s pitch 第 %d 步需為物件（目前是%s）" % (where, si + 1, jtype(s)))
            continue
        outside = []
        pids = set()
        players = s.get("players") or []
        if not list_of(players, dict):
            E("%s pitch 第 %d 步 players 需為物件陣列" % (where, si + 1))
            players = [p for p in players if isinstance(p, dict)] if isinstance(players, list) else []
        for p in players:
            if isinstance(p.get("id"), str):
                pids.add(p["id"])
            if p.get("team") not in ("blue", "red"):
                E("%s pitch 第 %d 步球員 team 需為 blue/red" % (where, si + 1))
            if not (is_num(p.get("x")) and is_num(p.get("y"))):
                E("%s pitch 第 %d 步球員 %s 的 x、y 需為數字" % (where, si + 1, p.get("id")))
            else:
                check_point([p["x"], p["y"]], "球員 %s " % p.get("id"), si)
        if not s.get("note"):
            E("%s pitch 第 %d 步缺少 note" % (where, si + 1))
        ball = s.get("ball")
        if isinstance(ball, str) and ball not in pids:
            E("%s pitch 第 %d 步持球者 %s 不在場上" % (where, si + 1, ball))
        elif isinstance(ball, list):
            check_point(ball, "球的位置", si)
        arrows = s.get("arrows") or []
        if not list_of(arrows, dict):
            E("%s pitch 第 %d 步 arrows 需為物件陣列" % (where, si + 1))
            arrows = [a for a in arrows if isinstance(a, dict)] if isinstance(arrows, list) else []
        for a in arrows:
            if not isinstance(a.get("from"), str) or a["from"] not in pids:
                E("%s pitch 第 %d 步箭頭起點 %s 不在場上" % (where, si + 1, a.get("from")))
            if a.get("kind") not in ("pass", "run", "dribble", "press"):
                E("%s pitch 第 %d 步箭頭 kind 不對" % (where, si + 1))
            to = a.get("to")
            if isinstance(to, str):
                if to not in pids:
                    E("%s pitch 第 %d 步箭頭終點 %s 不在場上" % (where, si + 1, to))
            else:
                check_point(to, "箭頭終點", si)
        if outside:
            E("%s pitch 第 %d 步有座標在半場圖外（view: half 只顯示 y 50–100，y 需 ≥ 50）：%s"
              % (where, si + 1, "、".join(dict.fromkeys(outside))))


def check_scripture(b, where, E, W, check_urls):
    if b.get("version") != "和合本":
        E("%s 經文 version 必須是「和合本」" % where)
    for k in ("ref", "book", "chapter", "verses", "source"):
        if not b.get(k):
            E("%s 經文缺少 %s" % (where, k))
    if "修訂" in json.dumps(b, ensure_ascii=False):
        E("%s 經文區塊不可出現和合本修訂版" % where)
    # Structure first, with or without --check-urls: the App prints v.n and v.text as they are.
    verses = b.get("verses")
    if verses and not isinstance(verses, list):
        E("%s 經文 verses 需為陣列 [{\"n\":1,\"text\":\"...\"}]" % where)
        verses = []
    good = []
    for i, v in enumerate(verses or []):
        if not isinstance(v, dict):
            E("%s 經文第 %d 項需為物件 {\"n\",\"text\"}（目前是%s）" % (where, i + 1, jtype(v)))
            continue
        n = v.get("n")
        ok = True
        if not ((isinstance(n, int) and not isinstance(n, bool) and n > 0) or (isinstance(n, str) and n.isdigit() and int(n) > 0)):
            E("%s 經文第 %d 項缺少節數 n（正整數）" % (where, i + 1))
            ok = False
        if not isinstance(v.get("text"), str) or not v["text"].strip():
            E("%s 經文第 %d 項缺少 text" % (where, i + 1))
            ok = False
        if "c" in v and not (isinstance(v["c"], int) and not isinstance(v["c"], bool) and v["c"] > 0):
            E("%s 經文第 %d 項的 c（章）需為正整數" % (where, i + 1))
            ok = False
        if ok:
            good.append(v)
    if not check_urls or not good:
        return
    import bible
    for i, v in enumerate(good):
        chap = v.get("c", b.get("chapter"))
        try:  # only the network call: a failure here is a connection problem, not a draft problem
            got = bible.fetch(b.get("book"), chap, str(v["n"]))
        except Exception as e:  # noqa: BLE001
            W("%s 無法連線核對經文 %s %s:%s：%s（其後 %d 節也未核對）" % (where, b.get("book"), chap, v["n"], e, len(good) - i - 1))
            return
        if not got:
            E("%s 無法向 FHL 取得 %s %s:%s" % (where, b.get("book"), chap, v["n"]))
        elif got[0]["text"] != v["text"]:
            E("%s %s %s:%s 與 FHL 和合本不一致\n      FHL：%s\n      稿件：%s" % (
                where, b.get("book"), chap, v["n"], got[0]["text"], v["text"]))


RATE_LIMITED = "rate-limited"


def check_image(url):
    """(True, "") when url serves an image browsers can display, (False, why) when it does not, and
    (None, why) when the host could not be reached this time (rate limit, timeout, dropped connection)."""
    import http.client
    import socket
    import urllib.error
    try:
        status, headers, _ = http_get(url, headers={"Range": "bytes=0-1023"}, timeout=25, retries=1)
        ctype = headers.get("Content-Type", headers.get("content-type", ""))
        ctype = ctype.split(";")[0].strip().lower()
        if status not in (200, 206):
            return False, "HTTP %s" % status
        if not ctype.startswith("image/"):
            return False, "不是圖片（%s）" % ctype
        if ctype not in BROWSER_IMAGE_TYPES:
            return False, "瀏覽器無法顯示的格式（%s）" % ctype
        return True, ""
    except urllib.error.HTTPError as e:
        if e.code in (429, 503):
            return None, RATE_LIMITED
        if e.code in (502, 504):
            return None, "HTTP %s" % e.code
        return False, "HTTP %s" % e.code
    except urllib.error.URLError as e:
        if isinstance(e.reason, socket.gaierror):  # misspelled or dead host name: a real error
            return False, "找不到主機（%s）" % e.reason
        return None, str(e.reason)[:120]
    except (OSError, http.client.HTTPException) as e:  # read timeout, connection reset, incomplete read
        return None, (str(e) or type(e).__name__)[:120]
    except Exception as e:  # noqa: BLE001
        return False, str(e)[:120]


@functools.lru_cache(maxsize=None)
def ledger_rows():
    """(date or "reserve", column, path, image keys, normalised topic_key) of every published and reserve
    article; read once per run. Reserve articles count as used: their topics and images are spoken for."""
    rows = []
    entries = [(d, c, p) for d, c, p in iter_articles()] + [("reserve", c, p) for c, p in iter_reserve()]
    for d, c, p in entries:
        try:
            art = load_json(p)
            keys = tuple(image_key(f["src"]) for f in figures_of(art))
            tk = art.get("topic_key")
        except Exception:  # noqa: BLE001  # a broken article elsewhere must not stop this check
            continue
        rows.append((d, c, os.path.abspath(p), keys, topic_norm(tk) if isinstance(tk, str) else ""))
    return tuple(rows)


def ledgers_excluding(day, col, paths=None):
    """Images and topics used by every other article. With `paths`, exactly those files are left out
    (a reserve article, or one being promoted); otherwise the article of `day`/`col`."""
    images, topics = {}, {}
    skip = {os.path.abspath(p) for p in paths} if paths else None
    for d, c, p, keys, tk in ledger_rows():
        if (p in skip) if skip is not None else (d == day and c == col):
            continue
        where = "%s/%s" % (d, c) if d != "reserve" else "備稿 %s/%s" % (c, os.path.basename(p))
        for k in keys:
            images.setdefault(k, where)
        if tk and (d != day or day == "reserve"):
            topics.setdefault(tk, where)
    return images, topics


def reserve_status(cfg, column=None):
    """{column: [(path, errors)]} for every reserve article: errors are empty when the article is ready to run.
    Checked against published articles and the other reserves, so two reserves sharing a topic or an image
    show up here (one of them would fail once the other has run)."""
    out = {}
    for col, p in iter_reserve(column):
        imgs, tops = ledgers_excluding("reserve", col, paths=[p])
        errs, _ = validate_file(cfg, "reserve", col, p, False, imgs, tops)
        out.setdefault(col, []).append((p, errs))
    return out


def validate_reserve(cfg, column=None, check_urls=False):
    """Validate content/reserve/; returns the number of files with errors."""
    files = list(iter_reserve(column))
    if not files:
        print("備稿庫沒有稿件" + ("（%s）" % column if column else ""))
        return 0
    bad = 0
    for col, p in files:
        imgs, tops = ledgers_excluding("reserve", col, paths=[p])
        errs, warns = validate_file(cfg, "reserve", col, p, check_urls, imgs, tops)
        report(col + "/" + os.path.basename(p), p, errs, warns)
        bad += bool(errs)
    return bad


def report(label, p, errs, warns):
    try:
        art = load_json(p)
        title = art.get("title") if isinstance(art.get("title"), str) else ""
        n = cjk_count(art)
    except Exception:  # noqa: BLE001  # already reported by validate_file
        title, n = "", 0
    print("%s %s（%d 字）%s" % ("✗" if errs else "✓", label, n, "：" + title if title else ""))
    for e in errs:
        print("   ERROR " + e)
    for w in warns:
        print("   WARN  " + w)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("date", nargs="?", help="刊期日期 YYYY-MM-DD；用 --reserve 時省略")
    ap.add_argument("--column")
    ap.add_argument("--check-urls", action="store_true")
    ap.add_argument("--reserve", action="store_true", help="驗證備稿庫 content/reserve/")
    a = ap.parse_args()
    cfg = load_config()
    if a.reserve:
        return 1 if validate_reserve(cfg, a.column, a.check_urls) else 0
    if not a.date:
        ap.error("需要刊期日期，或加 --reserve")
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
        report(col, p, errs, warns)
        bad += bool(errs)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
