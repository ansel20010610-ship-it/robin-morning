#!/usr/bin/env python3
"""Build content/index.json (issue list for the app) and content/search/<YYYY-MM>.json (full text for search).
Runs in GitHub Actions on every push.

Besides the article cards, index.json carries what the app cannot work out on its own: each article's "related"
(up to three articles that read on from it), football's "next" fixture, a news issue's "places" (the countries its
items name, for the 讀過的世界 map; scripts/places.py), a corrected article's "corrected" date and one-line
"correction" (from the 更正 callouts the weekly audit adds at the end of body, so the card can say so without the
reader scrolling to the last block) and its "corrected_at", the "year" (and "century") of the 年代尺 under the article's
meta line (article_year), each issue's "press" record (the shift reports in state/runs/, for the owner's 印務室 page)
and "late" note, and the top-level "stock" of reserve articles and "places" names.

A malformed article is skipped with a ::warning:: annotation; it must never fail the deploy, or every
later issue would stay offline until someone fixes the file by hand. The same goes for a malformed runs file.
"""
import collections
import datetime as dt
import hashlib
import json
import math
import re
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (CJK, CONTENT, ROOT, TW, WEEKDAY_ZH, article_path, cjk_count, column_meta,  # noqa: E402
                    expected_columns, issue_number, iter_articles, iter_reserve, load_config, load_json,
                    reserve_columns, reserve_target, text_of_block, wm_thumb)
from places import NAMES as PLACE_NAMES, place_codes, places_of  # noqa: E402

RUNS = os.path.join(ROOT, "state", "runs")
SHIFTS = ("1", "2", "3", "4", "5")
CJK_RUN = re.compile(CJK.pattern + "+")
LATIN_WORD = re.compile(r"[a-z][a-z0-9]{2,}")
# Calibrated 2026-11-01 on 172 articles (see related_links): genuine pairs score ≥0.18 — Beethoven 9 → 5 and 6, the
# 2018 staging paper → the Cairo and peri-implantitis classifications, the Istanbul match → its preview and the pieces
# that mention it, FM27 → FM27 — while the best spurious pairs (Hine's spinner → Hokusai's wave, through 博物館 and
# 芝加哥) stop at 0.165.
RELATED_MIN = 0.175
RELATED_MAX_DF = 0.10  # a token in more than a tenth of all articles is column boilerplate (巴薩, 錄音, 牙齦)
SAME_COLUMN = 0.85


def music_works():
    """topic_key → the work's name as the canon list writes it (editorial/music-canon.md, its tables' 作品 column; a
    movement row of a 指定日期 block takes the block's work before its own name). The 唱片櫃 (assets/records.js) prints
    it on the sleeve; an article not on the list keeps its headline there. Missing or unreadable list: no names."""
    out, work = {}, ""
    try:
        lines = open(os.path.join(ROOT, "editorial", "music-canon.md"), encoding="utf-8").read().splitlines()
    except (OSError, ValueError):
        return out
    for line in lines:
        if line.startswith("### "):
            m = re.match(r"###\s+(.+?》(?:（[^）]*）)?)", line)
            work = m.group(1) if m else ""
            continue
        if line.startswith("## "):
            work = ""
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        for i, c in enumerate(cells):
            if re.fullmatch(r"music:[\w-]+", c) and i > 0 and cells[i - 1]:
                name = cells[i - 1]
                out.setdefault(c, name if "《" in name or "〈" in name or not work else f"{work}・{name}")
    return out


def thumb(hero):
    if not isinstance(hero, dict):
        return None
    if hero.get("src"):
        out = {k: hero.get(k) for k in ("src", "width", "height", "alt", "kind") if hero.get(k) is not None}
        small = wm_thumb(hero["src"], 500, hero.get("width") if isinstance(hero.get("width"), int) else None)
        if small:
            out["thumb"] = small  # front-page cards load a 500px image instead of the 1280px one
        for k in ("made", "credit"):  # the gallery's labels
            if isinstance(hero.get(k), str) and hero[k].strip():
                out[k] = hero[k].strip()
        return out
    return {"diagram": hero.get("type")}


def next_match(nxt):
    """Football's next fixture {opponent, competition, kickoff (ISO 8601, +08:00), venue?, home?} when it is well
    formed; None otherwise, so the app shows nothing rather than a broken line."""
    if not isinstance(nxt, dict):
        return None
    try:
        kick = dt.datetime.fromisoformat(nxt["kickoff"].strip())
    except (KeyError, AttributeError, ValueError):
        return None
    if kick.utcoffset() != dt.timedelta(hours=8):
        return None
    out = {k: nxt[k].strip() for k in ("opponent", "competition") if isinstance(nxt.get(k), str) and nxt[k].strip()}
    if len(out) < 2:
        return None
    out["kickoff"] = nxt["kickoff"].strip()
    if isinstance(nxt.get("venue"), str) and nxt["venue"].strip():
        out["venue"] = nxt["venue"].strip()
    if isinstance(nxt.get("home"), bool):
        out["home"] = nxt["home"]
    return out


def news_places(art):
    """The countries a news issue touches, for the 讀過的世界 map: the union over its news blocks' items of the item's own
    "place" when it is well formed (editorial/SCHEMA.md), else the countries and cities its headline and summary name."""
    out = set()
    for b in art.get("body") or []:
        if not (isinstance(b, dict) and b.get("type") == "news" and isinstance(b.get("items"), list)):
            continue
        for it in b["items"]:
            if isinstance(it, dict):
                out.update(place_codes(it.get("place")) or
                           places_of("%s %s" % (it.get("headline") or "", it.get("summary") or "")))
    return sorted(out)


def related_tokens(art):
    """What an article is about, for related_links(): CJK bigrams of its title, dek, brief and takeaway, Latin words of
    three or more characters, and the segments of its topic_key (music:brahms-op98 → music, brahms, op98; a bare
    number says nothing)."""
    text = " ".join(str(art.get(k) or "") for k in ("title", "dek", "brief", "takeaway"))
    toks = [run[i:i + 2] for run in CJK_RUN.findall(text) for i in range(len(run) - 1)]
    toks += LATIN_WORD.findall(" ".join(str(art.get(k) or "") for k in ("title", "dek", "brief", "topic_key")).lower())
    toks += [s for s in re.split(r"[:_-]", str(art.get("topic_key") or "").lower()) if s and not s.isdigit()]
    return toks


def related_links(docs):
    """docs: [(day, column, tokens)] → {i: [{"d", "c"}, …]}, the up to three articles that read on from each one.
    TF-IDF cosine with sublinear tf; a token in a single article or in more than RELATED_MAX_DF of them carries nothing.
    Same-column pairs are scaled by SAME_COLUMN so a real cross-column link can surface, one article per other day,
    and only above RELATED_MIN. Deterministic: ties go to the earlier article."""
    n = len(docs)
    df = collections.Counter(t for _, _, toks in docs for t in set(toks))
    max_df = max(2, RELATED_MAX_DF * n)  # the floor keeps a first fortnight's corpus from scoring nothing at all
    posts = collections.defaultdict(list)  # token → [(doc, weight)]: only articles sharing a token can score
    vecs = []
    for i, (_, _, toks) in enumerate(docs):
        tf = collections.Counter(toks)
        v = {t: (1 + math.log(c)) * math.log(n / df[t]) for t, c in tf.items() if 2 <= df[t] <= max_df}
        norm = math.sqrt(sum(w * w for w in v.values())) or 1.0
        v = {t: w / norm for t, w in v.items()}
        for t, w in v.items():
            posts[t].append((i, w))
        vecs.append(v)
    out = {}
    for i, (day, col, _) in enumerate(docs):
        dots = collections.defaultdict(float)
        for t, w in vecs[i].items():
            for j, wj in posts[t]:
                dots[j] += w * wj
        best = {}  # day → (score, j)
        for j, s in dots.items():
            if j == i:
                continue
            if docs[j][1] == col:
                s *= SAME_COLUMN
            d = docs[j][0]
            if s >= RELATED_MIN and (d not in best or s > best[d][0]):
                best[d] = (s, j)
        top = sorted(best.values(), key=lambda x: (-x[0], x[1]))[:3]
        if top:
            out[i] = [{"d": docs[j][0], "c": docs[j][1]} for _, j in top]
    return out


def epigraph(art):
    """The first verse of the day's scripture, for the masthead (e.g. 起初，　神創造天地。— 創世記 1:1)."""
    for b in art.get("body") or []:
        if isinstance(b, dict) and b.get("type") == "scripture" and b.get("verses"):
            v = b["verses"][0]
            text = re.sub(r"^（[^）]*）", "", str(v.get("text", ""))).strip()
            if len(text) > 46:  # keep one sentence
                m = re.match(r"^(.{12,46}?[。；！？])", text)
                text = m.group(1) if m else text[:46] + "……"
            book = re.sub(r"\s*\d.*$", "", str(b.get("ref", ""))).strip()
            return {"text": text, "ref": "%s %s:%s" % (book, v.get("c", b.get("chapter")), v.get("n"))}
    return None


def verse(art):
    """The day's passage and prayer (今日經文與禱告, group "verse"): the app shows them in the front page's 今日禱告."""
    body = [b for b in art.get("body") or [] if isinstance(b, dict)]
    scrip = next((b for b in body if b.get("type") == "scripture" and b.get("verses")), None)
    prayer = next((b for b in body if b.get("type") == "prayer" and isinstance(b.get("text"), str)), None)
    if not prayer:
        return None
    out = {"prayer": prayer["text"].strip()}
    if scrip:
        out["ref"] = str(scrip.get("ref", ""))
        out["verses"] = [{"n": v.get("n"), "text": str(v.get("text", "")), **({"c": v["c"]} if v.get("c") else {})}
                         for v in scrip["verses"] if isinstance(v, dict)]  # c: a passage that crosses into the next chapter
    return out


CORRECTION_LABEL = re.compile(r"^更正（(\d{4}-\d{2}-\d{2})）")
CORRECTION_MAX = 80


def correction(art):
    """(date, one line) of the article's latest 更正 callout, or (None, None). The weekly audit does not rewrite a
    published article (editorial/README.md 不可以做的事); it adds a callout labelled 更正（<稽核日期>） at the end of body.
    The date goes on the card as 已更正 and the first sentence of the text under the brief, so a reader who only ever
    reads the front page learns that what he read was corrected, and roughly how."""
    best = None
    for b in art.get("body") or []:
        if not isinstance(b, dict) or b.get("type") != "callout" or not isinstance(b.get("label"), str):
            continue
        m = CORRECTION_LABEL.match(b["label"])
        if not m:
            continue
        text = b.get("text") if isinstance(b.get("text"), str) else ""
        if not text.strip() and isinstance(b.get("items"), list):
            text = next((x for x in b["items"] if isinstance(x, str) and x.strip()), "")
        if best is None or m.group(1) >= best[0]:  # several corrections: the latest date, the last one on a tie
            best = (m.group(1), text.strip())
    if best is None:
        return None, None
    date, text = best
    # The first sentence, or the first few when the callout opens with a lead-in like 兩處更正。 that says nothing by
    # itself; a 。 inside 「…」 does not end a sentence. The bracket depth is counted, not just the character after the
    # 。, or a quotation of two sentences is cut after its first and the card shows half a quote.
    parts, start, depth = [], 0, 0
    for i, ch in enumerate(text):
        if ch in "「『（":
            depth += 1
        elif ch in "」』）":
            depth = max(0, depth - 1)
        elif ch in "。！？" and not depth and text[i + 1:i + 2] not in ("」", "』", "）"):
            parts.append(text[start:i + 1])
            start = i + 1
    parts.append(text[start:])
    first = ""
    for sentence in parts:
        first += sentence.strip()
        if len(first) >= 15:
            break
    if len(first) > CORRECTION_MAX:
        first = first[:CORRECTION_MAX - 1].rstrip("，、；：") + "…"
    return date, first


# 年代尺 (app.js yearRuler, the hairline under an article's meta line): the year each article is about, worked out here
# from what the columns already write — no writing rule asks for it. Music, literature and canon take the year the work
# first went out: its first performance, screening or release, else its first print (the music block has no field for
# either, so music reads them off the facts card and its composed line, and falls back on the year it was written).
# A building or a city's place takes the year it was first built, a picture or a photograph the year it was made, and
# civilization the tail of its topic_key (rome-…-1c, …-1586, …-5c-bce, …-490-bce; a span takes its first part: -15c-16c
# the 15th century, -5c-4c-bce the 5th century before Christ). Each column's sources are tried in turn, the
# first that gives a year wins: (year, only the century is known), before Christ negative and a century its middle
# year; or None, and the page draws no ruler.
YEAR_COLUMNS = ("music", "civilization", "literature", "canon", "artwork", "architecture", "art", "photo", "city")
# The two articles whose own fields give no year or the wrong one: the 三橋's 年代 line opens with a bridge on record in
# 1280, but the oldest part standing is the stone bridge of 1842; 《唐吉訶德》 has no facts card at all.
YEAR_FIX = {("2026-10-19", "city"): (1842, False), ("2026-11-07", "canon"): (1605, False)}
STAGED = ("首演", "首映", "首播", "上映", "發售")  # a first performance, screening or release: before a first print
PRINTED = ("初刊", "首次出版", "首次發表", "首次刊出", "首版", "出版", "發表")
WRITTEN = ("創作", "寫作", "作曲", "完成")
BUILT = ("年代", "建造", "現存主體", "建立", "形成", "動工", "天守")
# facts lines whose years belong to someone or something else (a life, a listing, a purchase, the conductor or cast of a
# premiere: 「首演指揮」 is a person's line, not the premiere's) never stand for the work
NOT_THE_WORK = ("作者", "作家", "設計者", "攝影", "世界遺產", "保護", "目前用途", "權利", "收藏", "館藏", "尺寸", "規模",
                "古蹟身分", "翻拍", "獎項", "譯", "對照", "影像", "數位檔", "底片", "登錄", "取得", "現藏", "現在在哪裡",
                "指揮", "卡司", "演員", "導演", "編舞")
BCE_YEAR = re.compile(r"(公元|西元)?前\s*(\d{1,4})\s*(世紀|年)?")  # 「前 3 名」 is not one: 西元／公元 before it or 年／世紀 after it
CE_YEAR = re.compile(r"(?<!\d)(\d{3,4})(?!\d)")
CENTURY = re.compile(r"(?<!\d)(\d{1,2})(?:\s*[–—-]\s*\d{1,2})?\s*世紀")


def year_in(text, strict=False):
    """The first year written in text, as (year, century_only), or None. A three-digit number counts only with 年 after
    it (第 580 號 is not a year), a four-digit one only up to this year (2,500 公尺). strict (a title, dek or brief): only
    「N 年」 and 「前 N 年」, no centuries."""
    if not isinstance(text, str):
        return None
    found = []  # (position, year, century_only)
    for m in BCE_YEAR.finditer(text):
        if m.group(3) == "世紀" and not strict:
            found.append((m.start(), -int(m.group(2)) * 100 + 50, True))
            break
        if m.group(3) == "年" or (m.group(1) and not strict):
            found.append((m.start(), -int(m.group(2)), False))
            break
    for m in CE_YEAR.finditer(text):
        y, nian = int(m.group(1)), re.match(r"\s*(?:[–—-]\s*\d{3,4}\s*)?年", text[m.end():m.end() + 10])  # 「約 780–833 年」 too
        if (strict or y < 1000) and not nian or y > dt.date.today().year:
            continue
        if any(y0 < 0 and 0 <= m.start() - p <= 6 for p, y0, _ in found):  # the number of 「前 27 年」 itself
            continue
        found.append((m.start(), y, False))
        break
    if not strict:
        for m in CENTURY.finditer(text):
            if not any(abs(m.start() - p) <= 6 for p, _, _ in found):  # 「前 8 世紀」 is already in
                found.append((m.start(), (int(m.group(1)) - 1) * 100 + 50, True))
            break
    return min(found)[1:] if found else None


def article_year(art, col, day):
    """(year, century_only) for the 年代尺, or None (see YEAR_COLUMNS above)."""
    if (day, col) in YEAR_FIX:
        return YEAR_FIX[(day, col)]
    if col not in YEAR_COLUMNS:
        return None
    blocks = ([art["hero"]] if isinstance(art.get("hero"), dict) else []) + [b for b in art.get("body") or [] if isinstance(b, dict)]
    facts = [(str(r[0]), str(r[1])) for b in blocks if b.get("type") == "facts" and isinstance(b.get("items"), list)
             for r in b["items"] if isinstance(r, (list, tuple)) and len(r) >= 2]
    work = [(k, v) for k, v in facts if not any(w in k for w in NOT_THE_WORK)]

    def labelled(words, rows=facts):  # every year on a facts line whose label holds one of the words
        return [y for k, v in rows if any(w in k for w in words) for y in [year_in(v)] if y]

    def first(*words):
        got = labelled(words)
        return got[0] if got else None

    def any_line():
        return next((y for k, v in work for y in [year_in(v)] if y), None)

    def text():
        return next((y for f in ("title", "dek", "brief") for y in [year_in(art.get(f), strict=True)] if y), None)

    def made():
        return year_in(art["hero"].get("made")) if isinstance(art.get("hero"), dict) else None

    if col == "civilization":
        tail = str(art.get("topic_key") or "").rsplit(":", 1)[-1]
        if not re.search(r"-\d{1,2}c-bce-\d{1,2}c$", tail):  # a span across the turn of the era (2c-bce-1c) has no one year
            m = re.search(r"-(\d{1,2})c(?:-\d{1,2}c)?-bce$", tail)
            if m:
                return -int(m.group(1)) * 100 + 50, True
            m = re.search(r"-(\d{1,4})(?:-\d{1,4})?-bce$", tail)
            if m:
                return -int(m.group(1)), False
            m = re.search(r"-(\d{1,2})c(?:-\d{1,2}c)?$", tail)
            if m:
                return (int(m.group(1)) - 1) * 100 + 50, True
            m = re.search(r"-(\d{3,4})(?:-\d{3,4})?$", tail)
            if m:
                return int(m.group(1)), False
        return text()
    if col in ("music", "literature", "canon"):
        # out first: the earliest premiere (or release), else the earliest print — from the facts card and, in music, from
        # the clauses of the music block's composed that say 首演 or 出版 (「…；1836 年出版」)
        composed = [b.get("composed") for b in blocks if b.get("type") == "music" and isinstance(b.get("composed"), str)]
        clauses = [(c, c) for s in composed for c in re.split(r"[；;，,。（）()]", s)]
        for words in (STAGED, PRINTED):
            got = labelled(words, work) + labelled(words, clauses)
            if got:
                return min(got)
        if composed and year_in(composed[0]):
            return year_in(composed[0])
        return first(*WRITTEN) or first("作品", "名稱", "片名") or any_line() or text()
    if col in ("architecture", "city"):
        got = labelled(BUILT)
        return min(got) if got else any_line() or text()
    if col == "photo":
        return first("拍攝", "年代") or made() or text()
    return first("年代", "創作") or made() or text()  # artwork, art


def plain_text(art):
    parts = [art.get("title", ""), art.get("dek", "")]
    for b in art.get("body") or []:
        if isinstance(b, dict):
            try:
                parts.append(text_of_block(b))
            except Exception:  # noqa: BLE001
                pass
    return re.sub(r"\s+", " ", " ".join(p for p in parts if isinstance(p, str)))


def push_devices():
    """Short hashes of the devices that get the 07:30 notice (scripts/push.py), so the app's settings page can tell
    whether this phone is on the list. The subscriptions themselves stay in state/, which is not published."""
    path = os.path.join(ROOT, "state", "push", "devices.json")
    if not os.path.exists(path):
        return []
    try:
        return [hashlib.sha256(d["subscription"]["endpoint"].encode()).hexdigest()[:16] for d in load_json(path)["devices"]]
    except Exception as e:  # noqa: BLE001
        skip(path, "%s: %s" % (type(e).__name__, e))
        return []


def skip(path, why):
    # GitHub Actions annotation (shown on the run page); the build carries on without this article.
    rel = os.path.relpath(path, ROOT)
    print("::warning file=%s::build_index 跳過 %s：%s" % (rel, rel, str(why).replace("\n", " ")))


def report(r):
    """One shift's report {finished_at, missing, note} (scripts/report_run.py) → {at: HH:MM Taiwan time, missing, note}."""
    if not isinstance(r, dict) or not isinstance(r.get("finished_at"), str):
        raise ValueError("班次條目格式不對")
    at = dt.datetime.fromisoformat(r["finished_at"])
    if at.tzinfo is None:
        at = at.replace(tzinfo=TW)
    missing = r.get("missing")
    return {"at": at.astimezone(TW).strftime("%H:%M"),
            "missing": [c for c in missing if isinstance(c, str)] if isinstance(missing, list) else [],
            "note": r["note"] if isinstance(r.get("note"), str) else ""}


def advance_of(d, expected):
    """(the columns the 先發班 writes for issue d, whether it will not start that night) for the 印務室 page. It will not
    start when scripts/api_shift.py decide() would say no for a reason the page cannot see: this cycle's spend has reached
    SOFT_CAP, or its first QUIET_HOURS hours are not over at 22:30 the evening before. The key (ANTHROPIC_API_KEY) is a
    secret the page cannot judge; it is set. If the rule cannot be read here, off: the page then draws no 在跑."""
    try:
        import api_shift
        cols = [c for c in api_shift.COLUMNS if c in expected]
        eve = dt.datetime.combine((d if isinstance(d, dt.date) else dt.date.fromisoformat(str(d))) - dt.timedelta(days=1), dt.time(22, 30), tzinfo=TW)
        start, _ = api_shift.cycle(eve.astimezone(dt.timezone.utc))
        quiet = start != api_shift.FIRST_GRANT and eve.astimezone(dt.timezone.utc) - start < dt.timedelta(hours=api_shift.QUIET_HOURS)
        return cols, bool(quiet or api_shift.month_total() >= api_shift.SOFT_CAP)
    except Exception as e:  # noqa: BLE001
        skip("api_shift", "%s: %s" % (type(e).__name__, e))
        return [], True


def press(cfg, d):
    """The day's production record for the owner's 印務室 page: the shift reports in state/runs/<date>.json
    (editorial/README.md), what the issue needs and which of that is still not on disk."""
    expected = expected_columns(cfg, d)
    out = {"shifts": {}, "expected": expected,
           "missing": [c for c in expected if not os.path.exists(article_path(d, c))]}
    out["advance"], off = advance_of(d, expected)
    if off and str(d) >= dt.datetime.now(TW).strftime("%Y-%m-%d"):  # an old issue never needs the flag
        out["advance_off"] = True
    path = os.path.join(RUNS, "%s.json" % d)
    if not os.path.exists(path):
        return out
    try:
        runs = load_json(path)
        if not isinstance(runs, dict):
            raise ValueError("頂層不是 JSON 物件")
    except Exception as e:  # noqa: BLE001
        skip(path, "%s: %s" % (type(e).__name__, e))
        return out
    # One broken entry loses that shift alone, not the day's whole record. Besides the five shifts: "reserve" (備稿班),
    # "audit" (週日稽核), "late" (週日補刊, scripts/late.py), "serial" (連載班), "concerts" (演出班), "mend" (補班),
    # "rescue" (停刊保險) and "sweep" (清倉班), all filed by report_run.py --group <name> under the day they ran, and
    # "column" (先發班, the evening before) under the issue's date — so the 印務室 shows every shift of the 班表.
    for k in SHIFTS + ("reserve", "audit", "late", "serial", "concerts", "column", "mend", "rescue", "sweep"):
        if k not in runs:
            continue
        try:
            rep = report(runs[k])
        except Exception as e:  # noqa: BLE001
            skip(path, "%s：%s: %s" % (k, type(e).__name__, e))
            continue
        if k in SHIFTS:
            out["shifts"][k] = rep
        else:
            out[k] = rep
    return out


def late_entries():
    """content/late.json (scripts/late.py): the Sunday issues held for the afternoon, by date."""
    path = os.path.join(CONTENT, "late.json")
    if not os.path.exists(path):
        return {}
    try:
        data = load_json(path)
        if not isinstance(data, dict):
            raise ValueError("頂層不是 JSON 物件")
        return {k: v for k, v in data.items() if isinstance(v, dict)}
    except Exception as e:  # noqa: BLE001
        skip(path, "%s: %s" % (type(e).__name__, e))
        return {}


def stock(cfg):
    """Reserve articles on hand per column (editorial/RESERVE.md) against the target, for the 印務室 page. Counted as
    reserve.py and plan_day.py count it (validate.reserve_status): one on hold, with an ERROR or 需修正 is not stock,
    or the bar shows a column as stocked when nothing in it is usable. Should validate fail, every file counts."""
    try:
        import validate  # here, not at the top: a fault in it may cost the bar its precision, never the deploy
        status = validate.reserve_status(cfg)
    except Exception as e:  # noqa: BLE001
        skip(os.path.join(CONTENT, "reserve"), "%s: %s" % (type(e).__name__, e))
        status = None
    out = {}
    for col in reserve_columns(cfg):
        n = 0
        if status is not None:
            n = sum(1 for _, errs, blocking in status.get(col, []) if not errs and not blocking)
        else:
            for _, path in iter_reserve(col):
                try:
                    n += 1 if isinstance(load_json(path), dict) else 0
                except Exception as e:  # noqa: BLE001
                    skip(path, "%s: %s" % (type(e).__name__, e))
        out[col] = {"n": n, "target": reserve_target(cfg, col)}
    return out


def main():
    cfg = load_config()
    days, epigraphs, verses, search, docs, flat = {}, {}, {}, {}, [], []
    # Installments of the serial are written ahead — three days by the 連載班, weeks or months by the month-end sweep
    # (scripts/api_shift.py, 2026-11-11). The app shows no issue before its 07:30, so anything later than tomorrow only
    # weighs on index.json (1.2 KB an installment, fetched at every launch) and on the search files: it joins the index
    # on the eve of its day — a deploy runs every half hour.
    horizon = str(dt.datetime.now(TW).date() + dt.timedelta(days=1))
    works = music_works()
    for day, col, path in iter_articles():
        if str(day) > horizon:
            continue
        meta = column_meta(cfg, col, day)  # a retired column stays in config.json with "until", so its issues stay listed
        if meta is None:
            skip(path, "欄位代號 %s 不在 config.json（停刊的欄位要留在 config.json 並加 until，往期才看得到）" % col)
            continue
        try:
            art = load_json(path)
            if not isinstance(art, dict):
                raise ValueError("頂層不是 JSON 物件")
            # Python reads a lone surrogate (half an emoji written as an escape) and NaN/Infinity, but the files below
            # cannot be written with the first (the deploy stopped there) and no browser reads the second: this
            # article is skipped here, like any other malformed one (validate.py reports both as ERROR).
            json.dumps(art, ensure_ascii=False, allow_nan=False).encode("utf-8")
            if cfg["columns"][col]["group"] == "verse":  # the masthead verse and the front page's prayer come from this file
                epi, v = epigraph(art), verse(art)
                if epi:
                    epigraphs[day] = epi
                if v:
                    verses[day] = v
                if meta["group"] == "verse":  # and since 2026-11-01 it is nothing else: not an article
                    continue
            n = cjk_count(art)
            entry = {
                "column": col,
                "title": art.get("title", ""),
                "dek": art.get("dek", ""),
                "brief": art.get("brief") or "",
                "hero": thumb(art.get("hero")),
                "minutes": max(1, math.ceil(n / 450)),
                "status": art.get("status"),
                "spoiler": art.get("spoiler"),
                "updated_at": art.get("updated_at"),
            }
            if art.get("from_reserve"):
                entry["from_reserve"] = True
            if col == "music" and isinstance(art.get("motif"), str) and art["motif"].strip():
                entry["motif"] = art["motif"].strip()  # the yard's robin sings it (nest.js playMotif)
            if col in ("architecture", "artwork") and isinstance(art.get("topic_key"), str) and art["topic_key"].strip():
                entry["topic_key"] = art["topic_key"].strip()  # the 版畫冊's and 美術館's labels (assets/prints.js buildingName, museum.js workTitle)
            if col == "architecture" and isinstance(art.get("name_zh"), str) and art["name_zh"].strip():
                entry["name_zh"] = art["name_zh"].strip()  # the 版畫冊's Chinese name above the Latin one (assets/prints.js)
            if col == "music" and works.get(str(art.get("topic_key") or "")):
                entry["work"] = works[str(art["topic_key"])]  # the 唱片櫃's sleeve (assets/records.js)
            cdate, ctext = correction(art)
            if cdate:
                entry["corrected"] = cdate
                if ctext:
                    entry["correction"] = ctext
            if isinstance(art.get("corrected_at"), str) and art["corrected_at"].strip():  # SCHEMA.md: when the audit corrected it
                entry["corrected_at"] = art["corrected_at"].strip()
            if isinstance(art.get("serial"), dict):  # the novel's installment: book, number and place, for the front page's card
                entry["serial"] = art["serial"]
            if isinstance(art.get("takeaway"), str) and art["takeaway"].strip():  # perio: shown on the saved and column lists
                entry["takeaway"] = art["takeaway"].strip()
            try:
                year = article_year(art, col, day)
            except Exception as e:  # noqa: BLE001 — a year is never worth the article: it goes out without its ruler
                print("::warning file=%s::build_index 算不出年代尺的年份：%s: %s" % (os.path.relpath(path, ROOT), type(e).__name__, e))
                year = None
            if year:  # the article page's 年代尺 (app.js yearRuler); before Christ negative
                entry["year"] = year[0]
                if year[1]:
                    entry["century"] = True  # only the century is known: the year is its middle and the dot is hollow
            nxt = next_match(art.get("next"))
            if nxt:
                entry["next"] = nxt
            if col == "news":
                pl = news_places(art)
                if pl:
                    entry["places"] = pl
            toks = related_tokens(art)
            row = {"d": day, "c": col, "t": art.get("title", ""), "x": plain_text(art)}
            if cdate:
                row["corrected"] = cdate  # a search hit on a corrected passage can say so
            search.setdefault(day[:7], []).append(row)
        except Exception as e:  # noqa: BLE001
            skip(path, "%s: %s" % (type(e).__name__, e))
            continue
        days.setdefault(day, []).append(entry)
        docs.append((day, col, [] if col == "serial" else toks))  # a novel's installments link to nothing and nothing links to them
        flat.append(entry)
    for i, links in related_links(docs).items():
        flat[i]["related"] = links
    late = late_entries()
    issues = []
    for day in sorted(days, reverse=True):
        try:
            d = dt.date.fromisoformat(day)
        except ValueError as e:  # e.g. a folder named 2026-02-30
            skip(os.path.join(CONTENT, "issues", day), e)
            continue
        issue = {"date": day, "no": issue_number(cfg, d), "weekday": WEEKDAY_ZH[d.weekday()], "articles": days[day],
                 "press": press(cfg, d)}
        if day in epigraphs:
            issue["epigraph"] = epigraphs[day]
        if day in verses:
            issue["verse"] = verses[day]
        if day in late:
            issue["late"] = late[day]
        issues.append(issue)
    seen = sorted({c for a in flat for c in a.get("places", ())})  # a code the table cannot name is left off the map
    out = {"generated_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"), "issues": issues,
           "push": push_devices(), "stock": stock(cfg), "places": {c: PLACE_NAMES[c] for c in seen if c in PLACE_NAMES}}
    with open(os.path.join(CONTENT, "index.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
    sdir = os.path.join(CONTENT, "search")
    os.makedirs(sdir, exist_ok=True)
    for month, rows in search.items():
        with open(os.path.join(sdir, month + ".json"), "w", encoding="utf-8") as f:
            json.dump(sorted(rows, key=lambda r: r["d"], reverse=True), f, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
    with open(os.path.join(sdir, "months.json"), "w", encoding="utf-8") as f:
        json.dump(sorted(search, reverse=True), f)
    arts = [a for i in issues for a in i["articles"]]
    print("index.json：%d 期，%d 篇（%d 篇有延伸閱讀）；搜尋資料 %d 個月" % (
        len(issues), len(arts), sum(1 for a in arts if "related" in a), len(search)))


if __name__ == "__main__":
    main()
