#!/usr/bin/env python3
"""Validate a day's articles against editorial/SCHEMA.md.

Usage:
  python3 scripts/validate.py 2026-10-11
  python3 scripts/validate.py 2026-10-11 --column music --check-urls
  python3 scripts/validate.py --concerts      (近期演出 content/concerts.json; same as scripts/concerts.py check)
  python3 scripts/validate.py --config        (content/config.json itself: rotation, since/until, order; see check_config)

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
from common import (ISSUES, ROOT, iter_reserve, RESERVE, BROWSER_IMAGE_TYPES, CJK, WEEKDAY_KEYS, WEEKDAY_ZH, active, article_path,  # noqa: E402
                    cjk_count, column_meta, figures_of, http_get, image_key, image_page, iter_articles, load_config, load_json,
                    raw_image_ext, TW, tw_now)
from places import NAMES as PLACE_NAMES, place_codes, places_of  # noqa: E402

LENGTH = {  # (min, max) CJK characters in body
    "football": (1800, 3500), "perio": (600, 1000), "music": (1000, 1600),
    "civilization": (1200, 1800), "devotion": (1200, 2200), "architecture": (1200, 1800),
    "news": (250, 700), "artwork": (1200, 1800),
    "canon": (1200, 1800), "wildcard": (800, 1400), "concept": (1400, 2200), "poem": (1000, 1600), "mystery": (1200, 1800),
    "art": (2500, 4000), "photo": (2000, 3500), "city": (2500, 4000),
    "fiction": (2500, 4000), "literature": (2500, 4000), "tactics": (2000, 3500),
    "philosophy": (2500, 4000), "fm-watch": (0, 5000), "cosmere-watch": (0, 5000), "obituary": (600, 1800), "serial": (1100, 2600),
}
NO_HERO = {"news", "serial"}
# 每欄一位記者 (STYLE.md 〇之四): the voice each column writes in, fixed; forms rotate, voices do not.
REPORTERS = {"football": "fan", "news": "wire", "perio": "colleague", "music": "listener", "civilization": "lecturer",
             "literature": "correspondent", "philosophy": "socratic", "artwork": "appraiser", "architecture": "walker",
             "canon": "critic", "wildcard": "visitor", "concept": "tutor", "poem": "reader", "mystery": "detective",
             "obituary": "eulogist", "fm-watch": "watchman", "cosmere-watch": "watchman"}  # a few short items a day: a picture is welcome, not required
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
# Words that date a text (RESERVE.md 寫法: a reserve must hold on whatever day it runs). The relative-time words were
# added 2026-11-08 after a reserve three weeks in stock went out saying 最近. Weekday names and 現在 are left out on
# purpose: the stock uses them legitimately in historical narration (1974 年 2 月 17 日，週日晚上; 每週二、五晚間;
# quoted letters saying 下週二), so they would flag history as stale.
STALE_WORDS = ["今天", "今日", "今晨", "今早", "昨天", "昨晚", "昨日", "明天", "本週", "這週", "上週", "本月", "創刊",
               "最近", "目前", "今年", "去年", "明年", "上個月", "上個週末", "近年", "本季", "本賽季"]
# An ISO timestamp with its offset, as updated_at and corrected_at are written (2026-10-11T06:40:00+08:00).
TIMESTAMP = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$")
# The newsroom's own bookkeeping, which belongs in sources[].note, not in front of the reader (STYLE.md section 3).
BACKSTAGE = ["本報沒有查證", "本報未查證", "本報無法查證", "本報無法核實", "截稿", "一併補報", "與內文不一致"]
# The voice rules (STYLE.md sections 0-4) apply to issues from this date on and to every reserve.
VOICE_SINCE = "2026-10-28"
# Phrases this paper has worn out: one model writes every column, so each becomes everyone's tic (STYLE.md section 1).
MACHINE = ["我的讀法", "本文的讀法", "本報的讀法", "本文推測", "本文推想", "本報推想", "由此推想", "這是本文的推論",
           "本報補充", "本文不採", "不是定論", "我查不到", "沒查到", "本文自譯", "更扯的", "重點來了", "重點在",
           "但事情還沒完", "好消息也有", "順帶一提", "也就是說", "換句話說", "白話說", "說到底", "好，回到", "回到正題",
           "先別急著", "後面會", "下面會", "文末有", "今天帶走", "帶走這個", "帶走這句", "讀完你會帶走", "說得很直接",
           "寫得很直接", "講得最白", "說得更白", "說得很白", "最毒", "很毒", "最酸", "很有畫面", "最有畫面", "最燙",
           "最有看頭", "扯吧", "笑死", "這波", "超狠", "說真的", "恭喜，你", "換你是", "你一定在哪裡聽過", "你一定聽過",
           "病人問：", "病人回診：",
           # LESSONS 32/37 (稽核 2026-11-01, 11-08): the paper talking about itself, and the two judgement openers
           "本報的看法", "本報注意到", "本報的觀察", "本報推測", "本報套用", "本報把", "依我看", "換我"]
VOICE_TAGS = {"推論", "詮釋", "原創假設", "原創示範", "傳聞", "戰術推論"}
SPEC_HEADS = ["問題：", "起始站位", "持球者的選項", "無球跑動", "對手的反應", "什麼條件下有效", "什麼情況下有效",
              "怎麼破解", "失敗的風險", "第一眼", "構圖骨架", "明天看診怎麼用", "今天看診怎麼用", "要小心的地方",
              "聽的時候注意", "喜歡的話，接著聽", "學界怎麼說", "先講清楚"]
EXAMPLES = os.path.join(ROOT, "editorial", "examples")
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


BRIEF_SINCE = "2026-10-18"  # issues from this date on (and every reserve) must carry a brief
EVIDENCE_SINCE = "2026-11-01"  # perio from here on: strong evidence only (columns/perio.md 選文), stated in paper.evidence
PERIO_JOURNALS = {
    "J Clin Periodontol", "J Periodontol", "Periodontol 2000", "J Periodontal Res", "J Dent Res", "Clin Oral Implants Res",
    "Clin Implant Dent Relat Res", "Int J Oral Maxillofac Implants", "Int J Periodontics Restorative Dent", "J Dent",
    "J Am Dent Assoc", "Clin Oral Investig", "Acta Odontol Scand", "Scand J Dent Res", "Cochrane Database Syst Rev",
    "N Engl J Med", "Lancet", "JAMA", "BMJ", "Ann Intern Med", "Diabetes Care", "Diabetologia", "Circulation",
    "Eur Heart J", "J Am Coll Cardiol", "Am J Prev Med",
}
STRONG_DESIGN = ("指引", "共識", "系統性回顧", "統合分析", "隨機", "世代", "追蹤")
WEAK_DESIGN = ("動物", "體外", "屍體", "病例報告", "病例系列", "橫斷", "敘述性回顧")


def check_brief(brief, dek, d, E, W, col=None):
    """The three-sentence summary the front page shows instead of the article (STYLE.md section 7)."""
    required = str(d) == "reserve" or str(d) >= BRIEF_SINCE
    if brief is None or (isinstance(brief, str) and not brief.strip()):
        if required:
            E("缺少 brief：三句話摘要，60–140 字，首頁只顯示這一段（STYLE.md 第七節）")
        return
    if not isinstance(brief, str):
        E("brief 需為字串（目前是%s）" % jtype(brief))
        return
    n = len(CJK.findall(brief))
    if n < 50 or n > 200:
        E("brief %d 字，要在 60–140 字左右" % n)
    elif n < 60 or n > 140:
        W("brief %d 字，建議 60–140 字，短比長好" % n)
    if len(re.findall(r"[。！？]", brief)) > 4:
        W("brief 超過三句：摘要只要三句")
    if dek and brief.strip() == dek.strip():
        E("brief 不可與導言相同")
    nums = re.findall(r"\d+(?:[.,:]\d+)*", brief)
    if len(nums) > 5 and col != "football":
        W("brief 有 %d 個數字：挑最能說服人的三個就好，其他留在正文（STYLE.md 第七節）" % len(nums))
    if re.match(r"^\s*(本文|這篇|此文)", brief):
        W("brief 不要以「本文、這篇」開頭，直接講內容")


CJK_RUN = re.compile(r"[\u4e00-\u9fff]+")


def prose_of(art):
    """The writer's own words: title, dek, brief and the body's paragraphs, headings and lists (no quotes, scripture, prayer)."""
    out = [art.get(k) for k in ("title", "dek", "brief")]
    for b in art.get("body") or []:
        if not isinstance(b, dict):
            continue
        if b.get("type") in ("p", "h"):
            out.append(b.get("text"))
        elif b.get("type") in ("list", "callout"):
            out += b.get("items") if isinstance(b.get("items"), list) else []
            out.append(b.get("text"))
    return "\n".join(x for x in out if isinstance(x, str))


def grams(text, n):
    return {run[i:i + n] for run in CJK_RUN.findall(text) for i in range(len(run) - n + 1)}


def spans(text, flagged, n):
    """The stretches of text covered by flagged n-grams, merged, longest first."""
    out = set()
    for run in CJK_RUN.findall(text):
        hit = [False] * len(run)
        for i in range(len(run) - n + 1):
            if run[i:i + n] in flagged:
                hit[i:i + n] = [True] * n
        i = 0
        while i < len(run):
            if hit[i]:
                j = i
                while j < len(run) and hit[j]:
                    j += 1
                out.add(run[i:j])
                i = j
            else:
                i += 1
    return sorted(out, key=len, reverse=True)


@functools.lru_cache(maxsize=None)
def recent_grams(d, n=5):
    """{n-gram: columns using it} over issue d and the 7 issues before it (for a reserve: the latest 7 published
    issues, i.e. dated up to today in Taiwan). The serial's installments run up to three days ahead, so content/issues/
    holds future dates that are not issues yet, and a novel's prose is not a column's phrasing: serial.json is left out."""
    days = sorted(x for x in (os.listdir(ISSUES) if os.path.isdir(ISSUES) else []) if re.fullmatch(r"\d{4}-\d{2}-\d{2}", x))
    today = tw_now().date().isoformat()
    days = [x for x in days if x <= today][-7:] if d == "reserve" else [x for x in days if x <= d][-8:]
    idx = {}
    for day in days:
        ddir = os.path.join(ISSUES, day)
        for f in os.listdir(ddir):
            if not f.endswith(".json") or f == "serial.json":
                continue
            try:
                art = load_json(os.path.join(ddir, f))
            except Exception:
                continue
            if isinstance(art, dict):
                for g in grams(prose_of(art), n):
                    idx.setdefault(g, set()).add(f[:-5])
    return idx


@functools.lru_cache(maxsize=None)
def example_grams(n=7):
    """n-grams of the model articles in editorial/examples (their body only, not the quotes or the notes on why)."""
    out = set()
    if not os.path.isdir(EXAMPLES):
        return frozenset()
    for f in os.listdir(EXAMPLES):
        if f.endswith(".md"):
            with open(os.path.join(EXAMPLES, f), encoding="utf-8") as fh:
                text = fh.read()
            text = text.split("## 為什麼它贏")[0]
            out |= grams("\n".join(l for l in text.splitlines() if not l.startswith(">")), n)
    return frozenset(out)


# Writing advice for the reader's own novel (the owner, 2026-11-07: 以後不要有給史詩創作者的建議這種內容).
WRITER_ADVICE = re.compile(r"史詩創作|給(?:史詩)?創作者|給寫作者|寫作者(?:可以|不妨|會)|換我寫史詩|你的(?:小說|史詩|世界觀)|寫小說的人"
                           r"|寫史詩時|想寫(?:史詩|小說|長篇)的人|對(?:史詩)?創作者來說|(?:史詩|奇幻)創作者(?:可以|不妨|該)|你(?:正在|自己)寫的(?:史詩|小說)")


def check_voice(art, d, col, W):
    """STYLE.md sections 0-4: the tics, labels and scaffolding that make the paper read machine-made."""
    text = prose_of(art)
    body = [b for b in art.get("body") or [] if isinstance(b, dict)]
    advice = sorted(set(WRITER_ADVICE.findall(text)))
    if advice:
        W("寫給創作者的建議，刪掉（社長 2026-11-07，STYLE.md 開頭）：%s" % "、".join("「%s」" % a for a in advice))
    hits = [ph for ph in MACHINE if ph in text]
    if hits:
        W("機器腔（STYLE.md 第一節，一律改掉）：%s" % "、".join("「%s」" % h for h in hits))
    src = json.dumps(art.get("sources") or [], ensure_ascii=False)
    idx = recent_grams(str(d))
    shared = {g for g in grams(text, 5) if len(idx.get(g, set()) - {col}) >= 2 and g not in src}
    rep = spans(text, shared, 5)
    if rep:
        W("和最近 7 天其他欄位重複的詞組，換個說法（STYLE.md 第一節）：%s" % "、".join("「%s」" % x for x in rep[:10]))
    copied = spans(text, grams(text, 7) & example_grams(), 7)
    if copied:
        W("和範文一樣的句子（術語與專名除外都要改寫，範文不是句型庫，STYLE.md 第一節）：%s" % "、".join("「%s」" % x for x in copied[:6]))
    tags = [b.get("tag") for b in body if b.get("type") == "p" and isinstance(b.get("tag"), str) and b.get("tag")]
    old = sorted({t for t in tags if t not in VOICE_TAGS})
    if old:
        W("出處類標籤不再使用，出處寫進句子與 sources（STYLE.md 第三節）：%s" % "、".join(old))
    n = len([t for t in tags if t in VOICE_TAGS and not (col == "devotion" and t in ("詮釋", "推論"))])
    if n > 3:
        W("段落 tag %d 個：只標讀者真的會誤會的段落，最多 3 個（STYLE.md 第三節）" % n)
    q = sum(1 for b in body if b.get("type") == "quote")
    if q > 3:
        W("quote 區塊 %d 個：最多 3 個，其餘改成轉述（STYLE.md 第四節）" % q)
    for b in body:
        h = b.get("text") if b.get("type") == "h" and isinstance(b.get("text"), str) else ""
        if not h or (col == "devotion" and h in DEVOTION_HEADS):
            continue
        if any(x in h for x in SPEC_HEADS):
            W("小標「%s」用了規格裡的分類詞，改寫成這一節的內容（STYLE.md 第〇節）" % h)
        elif re.search(r"不是.+[，,、]\s*(而)?是", h):
            W("小標「%s」是「不是 X，是 Y」的套路，直接寫內容（STYLE.md 第〇節）" % h)
        elif h.rstrip().endswith(("？", "?")) and not (art.get("form") == "qa" and col not in ("poem", "mystery")):
            # the 問答 form (STYLE.md 〇之四) is made of question headings; the poem and mystery columns never take it
            W("小標「%s」是問句的套路，直接寫內容（STYLE.md 第〇節）" % h)
    # 粗體 (STYLE.md 〇之五, 2026-11-07 起): 2–5 處, 標關鍵句與人事物; 引文、詩、經文裡不加粗。
    if str(d) >= "2026-11-07" and col not in ("devotion", "news", "serial", "obituary", "fm-watch", "cosmere-watch"):
        bold = sum(len(re.findall(r"\*\*[^*\n]+\*\*", b.get("text") or "")) for b in body if b.get("type") == "p" and isinstance(b.get("text"), str))
        if bold == 0:
            W("沒有粗體：每篇標 2–5 處關鍵句與第一次出場的人事物（STYLE.md 〇之五）")
        elif bold > 6:
            W("粗體 %d 處：最多 5 處，只標關鍵句與人事物（STYLE.md 〇之五）" % bold)
        if any("**" in (b.get("text") or "") for b in body if b.get("type") == "quote"):
            W("quote 裡有粗體：引文、詩、經文不加粗（STYLE.md 〇之五）")
    ps = [b.get("text") for b in body if b.get("type") == "p" and isinstance(b.get("text"), str)]
    if ps:
        last = ps[-1]
        if last.lstrip().startswith("下次"):
            W("結尾段以「下次……」開頭：停在一個具體的東西上，不教讀者下次怎麼做（STYLE.md 第〇節）")
        opening = "\n".join([ps[0] if len(ps) > 1 else "", art.get("dek") or "", art.get("brief") or ""])
        again = spans(last, grams(last, 10) & grams(opening, 10), 10)
        if again:
            W("結尾重述了開頭或摘要：「%s」（STYLE.md 第〇節）" % again[0])
    me = len(re.findall(r"我覺得|依我看|我猜|我最喜歡|我不太買單|我比較|我很欣賞", text))
    if me > 5:
        W("「我覺得／依我看」這類表態出現 %d 次，像定時插入：留兩三次真的有話要說的（STYLE.md 第〇節）" % me)


def stale_words(art):
    """The dated words a reserve uses (STALE_WORDS), in list order; empty when it would hold on any day. Checked in
    the title, dek, brief and body; the devotion column's fixed headings (今日經文, 今日禱告) are not dated words.
    The reserve branch of check_article reports them as WARN, and fill_from_reserve.py uses the same list to put
    the clean reserves first and to say which words a filled article carries."""
    text = json.dumps(art.get("body", []), ensure_ascii=False)
    text += "".join(v for v in (art.get("title"), art.get("dek"), art.get("brief")) if isinstance(v, str))
    for head in DEVOTION_HEADS:
        text = text.replace(head, "")
    return [w for w in STALE_WORDS if w in text]


# The WARN classes that make a reserve 需修正 (the owner, 2026-11-08, LESSONS 31: a reserve with 機器腔, 出處類標籤 or
# 分類詞小標 WARNs is not stock; the reserve shift rewrites those before writing anything new). Only the stable rule
# violations count: length, title/dek length, brief size, the moving window of phrases shared with the last 7 days,
# and anything about the network are not here, so a reserve cannot drop out of the stock by the calendar turning.
BLOCKING_WARN = re.compile(r"^(?:機器腔|出處類標籤不再使用|小標「.*」(?:用了規格裡的分類詞|是「不是 X，是 Y」的套路|是問句的套路)"
                           r"|quote 區塊 \d+ 個|段落 tag \d+ 個|缺少 form|form「|缺少 voice|voice「|沒有粗體|粗體 \d+ 處"
                           r"|和範文一樣的句子|寫給創作者的建議|備稿要在任何一天都成立)")


def reserve_blocking(warns):
    """The warnings in `warns` that make a reserve article 需修正 (see BLOCKING_WARN), in the order given."""
    return [w for w in warns if isinstance(w, str) and BLOCKING_WARN.match(w)]


def check_source_urls(art):
    """[(url, why)] for every sources[] url that did not answer: an HTTP error, a dead host name, a timeout.
    One short GET each (the first kilobyte, 10 s, no retries), so the caller is not stalled by a host that is down.
    fill_from_reserve.py runs this on a reserve about to be published unread (LESSONS 25: a reserve's source site
    had turned into a gambling site by the time it ran); a hit is a warning for the shift report, never a block,
    because a flawed article still beats an empty column."""
    import http.client
    import socket
    import urllib.error
    out = []
    for s in art.get("sources") or []:
        url = s.get("url") if isinstance(s, dict) else None
        if not isinstance(url, str) or not url.startswith("http"):
            continue
        try:
            status, _, _ = http_get(url, headers={"Range": "bytes=0-1023"}, timeout=10, retries=0)
            if status not in (200, 206):
                out.append((url, "HTTP %s" % status))
        except urllib.error.HTTPError as e:
            out.append((url, "HTTP %s" % e.code))
        except urllib.error.URLError as e:
            out.append((url, "找不到主機" if isinstance(e.reason, socket.gaierror) else str(e.reason)[:80]))
        except (OSError, http.client.HTTPException) as e:
            out.append((url, (str(e) or type(e).__name__)[:80]))
        except Exception as e:  # noqa: BLE001
            out.append((url, str(e)[:80]))
    return out


# What config.json may say a column is. "serial": the novel, written days ahead by its own routine, never stocked.
KNOWN_GROUPS = {"main", "verse", "supplement", "watch", "serial"}
# Three supplements a day from this date (editorial/README.md; two on 2026-11-02 only).
THREE_SUPPLEMENTS_SINCE = dt.date(2026, 11, 3)


def check_config(cfg, today=None):
    """The inconsistencies in content/config.json, as messages (empty when it is sound). Changing columns is the
    owner's routine maintenance and nothing else complains: supplements_for() filters silently, so a column
    retired with "until" but left in the rotation gives a two-supplement day that every shift, the watch and the
    App all call complete; a new column not put into the rotation is never written but is stocked; a misspelt
    code in the rotation is a KeyError in plan_day.py at 23:00. plan_day.py prints these as 設定錯誤 and exits 2
    before it plans anything; publish.yml's validate step reports them without blocking the deploy."""
    out = []
    cols = cfg.get("columns")
    if not isinstance(cols, dict) or not cols:
        return ["columns 需為非空的物件"]

    def date_of(v):
        try:
            return dt.date.fromisoformat(v) if isinstance(v, str) else None
        except ValueError:
            return None

    orders = {}
    for c, m in cols.items():
        if not isinstance(m, dict):
            out.append("欄位 %s 需為物件（目前是%s）" % (c, jtype(m)))
            continue
        for k in ("group", "name"):
            if not isinstance(m.get(k), str) or not m[k].strip():
                out.append("欄位 %s 缺少 %s" % (c, k))
        if isinstance(m.get("group"), str) and m["group"] not in KNOWN_GROUPS:
            out.append("欄位 %s 的 group「%s」不認得（只有 %s）" % (c, m["group"], "、".join(sorted(KNOWN_GROUPS))))
        for k in ("since", "until"):
            if m.get(k) is not None and date_of(m[k]) is None:
                out.append("欄位 %s 的 %s 不是合法日期（YYYY-MM-DD）：%r" % (c, k, m[k]))
        since, until = date_of(m.get("since")), date_of(m.get("until"))
        if since and until and since > until:
            out.append("欄位 %s 的 since（%s）晚於 until（%s）" % (c, since, until))
        was = m.get("was")
        if was is not None and (not isinstance(was, dict) or date_of(was.get("until")) is None):
            out.append("欄位 %s 的 was 需為物件並有合法日期 until" % c)
        if m.get("group") == "main" and "until" not in m:
            if not isinstance(m.get("order"), int) or isinstance(m.get("order"), bool):
                out.append("正刊欄位 %s 缺少整數 order" % c)
            else:
                orders.setdefault(m["order"], []).append(c)
    for o, cs in sorted(orders.items()):
        if len(cs) > 1:
            out.append("正刊 order %d 重複：%s" % (o, "、".join(cs)))

    rot = cfg.get("rotation_by_weekday")
    if not isinstance(rot, dict):
        out.append("rotation_by_weekday 需為物件（星期代號 → 副刊代號陣列）")
        return out
    scheduled = set()
    for day in WEEKDAY_KEYS:
        lst = rot.get(day)
        if not isinstance(lst, list):
            out.append("rotation_by_weekday 缺少 %s（或不是陣列）" % day)
            continue
        seen = set()
        for c in lst:
            if not isinstance(c, str) or c not in cols:
                out.append("rotation_by_weekday.%s 有不存在的欄位代號 %r" % (day, c))
                continue
            if c in seen:
                out.append("rotation_by_weekday.%s 重複排了 %s" % (day, c))
            seen.add(c)
            scheduled.add(c)
            g = cols[c].get("group") if isinstance(cols[c], dict) else None
            if g != "supplement":
                out.append("rotation_by_weekday.%s 排了 %s，但它是 %s 欄，不是副刊" % (day, c, g))
    for day in sorted(set(rot) - set(WEEKDAY_KEYS)):
        out.append("rotation_by_weekday 有不認得的星期代號 %r" % day)

    today = today or tw_now().date()
    for c, m in cols.items():
        if not isinstance(m, dict) or m.get("group") != "supplement" or c in scheduled:
            continue
        until = date_of(m.get("until"))
        if "until" not in m or (until and until >= today):
            out.append("副刊 %s（%s）沒有排進任何一天的輪值，永遠不會被寫" % (c, m.get("name", "")))
    # The count is checked by date, not by weekday: since/until are dates, so the same weekday can be short next
    # week and fine this week. Two weeks ahead is enough to catch a change before it reaches the press.
    for i in range(14):
        d = today + dt.timedelta(days=i)
        if d < THREE_SUPPLEMENTS_SINCE:
            continue
        lst = rot.get(WEEKDAY_KEYS[d.weekday()])
        if not isinstance(lst, list):
            continue
        on = [c for c in lst if isinstance(c, str) and isinstance(cols.get(c), dict) and active(cfg, c, d)]
        if len(on) != 3:
            out.append("%s（星期%s）有 %d 篇副刊，應為 3 篇：%s" % (d, WEEKDAY_ZH[d.weekday()], len(on), "、".join(on) or "（無）"))
    return out


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

    meta = column_meta(cfg, col, d)
    if meta is None:
        E("欄位代號 %s 不在 config.json" % col)
    elif str(d) != "reserve" and str(d) > cfg["columns"][col].get("until", "9999-12-31"):
        E("欄位 %s 已於 %s 停刊，不再有新稿" % (col, cfg["columns"][col]["until"]))
    if art.get("column") != col:
        E("column 應為 %s" % col)
    if d == "reserve":
        if art.get("hold"):
            E("備稿暫停使用：%s（修好後刪掉 hold 欄位）" % art["hold"])
        if art.get("date") != "reserve":
            E("備稿的 date 必須是 \"reserve\"")
        rw = art.get("reserve_written")
        if not (isinstance(rw, str) and re.match(r"^\d{4}-\d{2}-\d{2}$", rw)):
            E("備稿需要 reserve_written（撰寫日期 YYYY-MM-DD）")
        if cfg["columns"].get(col, {}).get("group") == "watch":
            E("觀測站不做備稿")
        stale = stale_words(art)
        if stale:
            W("備稿要在任何一天都成立，避免會過期的字眼：%s" % "、".join(stale))
    elif art.get("date") != str(d):
        E("date 應為 %s" % d)
    if art.get("next") is not None:
        check_next(art["next"], cfg, d, col, E, W)
    if (meta or {}).get("group") == "verse":
        check_verse(art, E, W, check_urls, used_topics, clash)
        return
    for k in ("title", "dek", "topic_key", "updated_at"):
        v = art.get(k)
        if v is not None and not isinstance(v, str):
            E("%s 需為字串（目前是%s）" % (k, jtype(v)))
        elif not v or not v.strip():
            E("缺少 %s" % k)
    ua = art.get("updated_at")
    when = None
    if isinstance(ua, str) and ua.strip() and not TIMESTAMP.match(ua):
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
    check_corrected_at(art, d, when, E, W)
    title = art.get("title") if isinstance(art.get("title"), str) else ""
    dek = art.get("dek") if isinstance(art.get("dek"), str) else ""
    check_brief(art.get("brief"), dek, d, E, W, col)
    # 文體 (STYLE.md 〇之四): every article from 2026-11-06 names its form; the shift's orchestrator assigns them (scripts/forms.py)
    FORMS = ["scene", "document", "qa", "list", "timeline", "dialogue", "flow", "reverse", "argument", "walk", "compare", "number"]
    if str(d) >= "2026-11-06" and col not in ("devotion", "news", "serial") and cfg["columns"].get(col, {}).get("group") != "watch":
        if not art.get("form"):
            W("缺少 form：派稿時指定的文體代號（STYLE.md 〇之四），同一期不重複")
        elif art["form"] not in FORMS:
            W("form「%s」不在菜單裡（%s）" % (art["form"], "、".join(FORMS)))
        want = REPORTERS.get(col)
        if not art.get("voice"):
            W("缺少 voice：這欄的記者代號是「%s」（STYLE.md 〇之四）" % want)
        elif want and art["voice"] != want:
            W("voice「%s」不是這欄的記者「%s」（STYLE.md 〇之四）" % (art["voice"], want))
    if len(title) > 32:
        W("標題偏長（%d 字）" % len(title))
    if len(dek) > 90:
        W("導言偏長（%d 字）" % len(dek))
    tk = art.get("topic_key") if isinstance(art.get("topic_key"), str) else ""
    if tk and not tk.startswith(col + ":"):
        E("topic_key 要以「%s:」開頭" % col)
    if tk and used_topics is not None and topic_norm(tk) in used_topics:
        clash(used_topics[topic_norm(tk)], "topic_key 已在 %s 用過：%s" % (used_topics[topic_norm(tk)], tk))

    is_watch = cfg["columns"].get(col, {}).get("group") == "watch"
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
    elif not undetermined and not has_hero and col not in NO_HERO:
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
                    if it.get("place") is not None:  # optional; the map's country when the automatic match would miss
                        codes = place_codes(it["place"])
                        if codes is None:
                            E("%s news[%d] place 需為 1–4 個 ISO 3166-1 alpha-2 大寫代碼，字串或陣列（例 \"UA\"、[\"IL\",\"PS\"]）"
                              % (where, i))
                        for c in codes or []:
                            if c not in PLACE_NAMES:
                                W("%s news[%d] place %s 不在 scripts/places.py 的國名表，地圖上畫不出來" % (where, i, c))
                    elif not places_of("%s %s" % (it.get("headline") or "", it.get("summary") or "")):  # the same text build_index scans
                        W("%s news[%d] 沒填 place，標題與摘要也判斷不到國名，這則不會出現在地圖上" % (where, i))
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
            said = json.dumps([b.get("label"), b.get("text"), b.get("items")], ensure_ascii=False)
            if WRITER_ADVICE.search(said):
                E("%s 不寫給史詩創作者／寫作者的建議或提問（社長 2026-11-07，STYLE.md 開頭）" % where)
        elif t == "facts":
            if not list_of(b.get("items"), list) or not all(len(x) == 2 for x in b["items"]):
                E("%s facts.items 需為 [[\"欄名\",\"內容\"], ...]" % where)

    if not undetermined and visuals < 1 and col != "serial":  # a novel's installment is text
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
        elif str(d) == "reserve" or str(d) >= BRIEF_SINCE:
            card = next(b for b in body if isinstance(b, dict) and b.get("type") == "paper")
            take = art.get("takeaway") if isinstance(art.get("takeaway"), str) else ""
            if not take.strip():
                E("缺少 takeaway：帶得走的結論，一到兩句、40–90 字，放在標題下方（columns/perio.md）")
            elif not 25 <= len(CJK.findall(take)) <= 110:
                W("takeaway %d 字，建議 40–90 字" % len(CJK.findall(take)))
            if not (isinstance(card.get("access"), str) and card["access"].strip()):
                E("paper 論文卡缺少 access（資料範圍：依全文，或依摘要與後續文獻整理）")
            if str(d) == "reserve" or str(d) >= EVIDENCE_SINCE:
                cit = card.get("citation") if isinstance(card.get("citation"), str) else ""
                # the journal is whichever italic matches the whitelist: a title's italic species name (*P. gingivalis*) is not it
                italics = [m.strip().rstrip(".") for m in re.findall(r"\*([^*]+)\*", cit)]
                journal = next((j for j in italics if j in PERIO_JOURNALS), "")
                if not italics:
                    E("paper.citation 要用 *期刊縮寫* 標出期刊（columns/perio.md）")
                elif not journal:
                    E("citation 斜體標出的「%s」都不在牙周欄期刊白名單（columns/perio.md 選文）：換一篇白名單期刊的論文" % "、".join(italics))
                ev = card.get("evidence") if isinstance(card.get("evidence"), str) else ""
                if not ev.strip():
                    E("paper 論文卡缺少 evidence：研究設計、規模與證據確定性，一行 60 字內（columns/perio.md）")
                else:
                    weak = [w for w in WEAK_DESIGN if w in ev]
                    if weak:
                        E("evidence 顯示是%s：證據等級不夠，不當主角論文（columns/perio.md 選文）" % "、".join(weak))
                    elif not any(k in ev for k in STRONG_DESIGN):
                        W("evidence 沒寫出研究設計（指引、共識、系統性回顧、統合分析、隨機試驗、世代研究）")
                    if len(ev) > 70:
                        W("evidence %d 字，60 字內" % len(ev))
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
    for ph in BACKSTAGE:
        if ph in full:
            W("正文出現查證流水帳「%s」：出處一句帶過，版本差異與查證過程寫進 sources 的 note（STYLE.md 第〇之二節第 7 條）" % ph)
    if "！！" in full or "!!" in full:
        W("避免連續驚嘆號")
    if str(d) == "reserve" or str(d) >= VOICE_SINCE:
        check_voice(art, d, col, W)


def correction_labels(art):
    """The labels of the article's 更正 callouts (editorial/README.md 每週品質稽核 step 2: a correction is a callout at the
    end of body labelled 更正（<稽核日期>）; the original text stays as the reader read it)."""
    return [b["label"] for b in art.get("body") or []
            if isinstance(b, dict) and b.get("type") == "callout" and isinstance(b.get("label"), str) and b["label"].startswith("更正（")]


def check_corrected_at(art, d, updated, E, W):
    """SCHEMA.md corrected_at (2026-11-08): when the audit adds a 更正 callout it records the moment in corrected_at and
    leaves updated_at alone, because updated_at is the article's news deadline (columns/football.md: the next Barça
    update's window starts at the previous article's updated_at; moving it to the audit's time swallowed a weekend of
    news). The App compares both to know when to fetch the article again."""
    ca = art.get("corrected_at")
    labels = correction_labels(art)
    if ca is None:
        if labels and str(d) != "reserve":
            W("有更正框「%s」但沒有 corrected_at：稽核加更正時填 corrected_at（更正時刻，ISO、+08:00），updated_at 不動（SCHEMA.md）" % labels[-1])
        return
    if not isinstance(ca, str) or not TIMESTAMP.match(ca):
        E("corrected_at 需含時區，例如 2026-11-08T15:59:00+08:00（目前：%s）" % (ca if isinstance(ca, str) else jtype(ca)))
        return
    if updated is not None:
        try:
            fixed = dt.datetime.fromisoformat(ca.replace("Z", "+00:00"))
        except ValueError:
            fixed = None
        if fixed and fixed < updated:
            E("corrected_at（%s）早於 updated_at（%s）：更正只填 corrected_at，updated_at 是這篇的截稿時間，不往後改（SCHEMA.md）" % (ca, art.get("updated_at")))


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


# The Barça column's optional next fixture (SCHEMA.md "next"): the App shows it above the article as a 下一場 card
# with 加入行事曆, so the kickoff must be an instant a calendar can take, written in Taiwan time with its offset.
NEXT_KEYS = {"opponent": str, "competition": str, "kickoff": str, "venue": str, "home": bool}
NEXT_REQUIRED = ("opponent", "competition", "kickoff")
KICKOFF = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?\+08:00$")


def check_next(nxt, cfg, d, col, E, W):
    if col != "football":
        E("next（下一場）只有巴薩晨報（football）可填")
        return
    if str(d) == "reserve":  # a reserve runs days later, unread by anyone: its fixture would be stale or already played
        E("備稿不填 next：下一場只在刊出當天確認（columns/football.md）")
        return
    if not isinstance(nxt, dict):
        E("next 需為物件 {opponent, competition, kickoff, venue, home}（目前是%s）" % jtype(nxt))
        return
    unknown = sorted(set(nxt) - set(NEXT_KEYS))
    if unknown:
        E("next 有未知欄位：%s（只能有 %s）" % ("、".join(unknown), "、".join(NEXT_KEYS)))
    for k, typ in NEXT_KEYS.items():
        v = nxt.get(k)
        if v is None:
            if k in NEXT_REQUIRED:
                E("next 缺少 %s" % k)
        elif not isinstance(v, typ):
            E("next.%s 需為%s（目前是%s）" % (k, "布林值" if typ is bool else "字串", jtype(v)))
        elif typ is str and not v.strip():
            E("next.%s 是空的" % k)
        elif k in ("opponent", "competition") and len(v) > 40:
            E("next.%s %d 字，上限 40 字" % (k, len(v)))
    kick = nxt.get("kickoff")
    if not isinstance(kick, str) or not kick.strip():
        return
    if not KICKOFF.match(kick):
        E("next.kickoff 要寫台灣時間並帶 +08:00，例如 2026-11-04T04:00+08:00（目前：%s）" % kick)
        return
    try:
        when = dt.datetime.fromisoformat(kick)
    except ValueError:
        E("next.kickoff 不是有效的時間：%s" % kick)
        return
    day = dt.date.fromisoformat(str(d))
    out = dt.datetime.combine(day, dt.time.fromisoformat(cfg.get("publish_time", "07:30")), TW)
    if when < out:
        W("next.kickoff（%s）早於本期出刊：這場是本期要報的比賽，下一場另填；延期的比賽直接拿掉 next" % kick)
    elif when.date() - day > dt.timedelta(days=10):
        W("next.kickoff（%s）離刊期超過 10 天：核對官方賽程有沒有更近的一場" % kick)


def check_verse(art, E, W, check_urls, used_topics, clash):
    """今日經文與禱告 (devotion, group "verse", columns/devotion.md): not an article, just the passage and the prayer.
    Older devotion articles, with their four sections, still pass: they carry both."""
    body = art.get("body") if isinstance(art.get("body"), list) else []
    if not body:
        E("body 需要 scripture 與 prayer 兩個區塊")
    scrip = [b for b in body if isinstance(b, dict) and b.get("type") == "scripture"]
    prayer = [b for b in body if isinstance(b, dict) and b.get("type") == "prayer"]
    if not scrip:
        E("缺少 scripture 經文區塊")
    for i, b in enumerate(scrip):
        check_scripture(b, "scripture[%d]" % i, E, W, check_urls)
    if not prayer:
        E("缺少 prayer 今日禱告")
    else:
        text = prayer[0].get("text") if isinstance(prayer[0].get("text"), str) else ""
        n = len(CJK.findall(text))
        if not text.strip():
            E("prayer 沒有內容")
        elif not 120 <= n <= 360:
            W("禱告 %d 字，建議 150–300 字" % n)
        if text.strip() and not text.rstrip().endswith("阿們。"):
            W("禱告結尾用「奉耶穌的名禱告，阿們。」")
    tk = art.get("topic_key")
    if not (isinstance(tk, str) and tk.startswith("devotion:")):
        E("topic_key 需為 devotion:<書卷英文縮寫>-<章>-<起節>")
    elif used_topics is not None and topic_norm(tk) in used_topics:
        clash(used_topics[topic_norm(tk)], "這段經文已在 %s 用過：%s" % (used_topics[topic_norm(tk)], tk))
    ua = art.get("updated_at")
    if ua is not None and not (isinstance(ua, str) and re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}", ua)):
        E("updated_at 需為含時區的時間字串")


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
    """{column: [(path, errors, blocking)]} for every reserve article: it counts as stock (reserve.py, plan_day.py)
    only when both lists are empty. `errors` are the ERRORs; `blocking` are the WARNs of reserve_blocking(), the
    rule violations the owner said make a reserve 需修正 rather than stock (fill_from_reserve.py still looks at
    ERRORs alone, so the safety net keeps filling with such an article rather than leaving a column empty).
    Checked against published articles and the other reserves, so two reserves sharing a topic or an image
    show up here (one of them would fail once the other has run)."""
    out = {}
    for col, p in iter_reserve(column):
        imgs, tops = ledgers_excluding("reserve", col, paths=[p])
        errs, warns = validate_file(cfg, "reserve", col, p, False, imgs, tops)
        out.setdefault(col, []).append((p, errs, reserve_blocking(warns)))
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
    ap.add_argument("--concerts", action="store_true", help="驗證近期演出 content/concerts.json")
    ap.add_argument("--config", action="store_true", help="檢查 content/config.json 本身：輪值、since/until、order 是否一致")
    a = ap.parse_args()
    if a.concerts:
        import concerts
        return concerts.check(a)
    cfg = load_config()
    if a.config:
        problems = check_config(cfg)
        for msg in problems:
            print("   ERROR 設定錯誤：" + msg)
        print("✗ config.json 有 %d 處不一致" % len(problems) if problems else "✓ config.json 一致：輪值、since/until、order 都對得上")
        return 1 if problems else 0
    if a.reserve:
        return 1 if validate_reserve(cfg, a.column, a.check_urls) else 0
    if not a.date:
        ap.error("需要刊期日期，或加 --reserve／--concerts")
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
