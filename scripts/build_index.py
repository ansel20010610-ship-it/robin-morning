#!/usr/bin/env python3
"""Build content/index.json (issue list for the app) and content/search/<YYYY-MM>.json (full text for search).
Runs in GitHub Actions on every push.

Besides the article cards, index.json carries what the app cannot work out on its own: each article's "related"
(up to three articles that read on from it), football's "next" fixture, a news issue's "places" (the countries its
items name, for the 讀過的世界 map; scripts/places.py), each issue's "press" record (the shift reports in state/runs/,
for the owner's 印務室 page) and "late" note, and the top-level "stock" of reserve articles and "places" names.

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


def press(cfg, d):
    """The day's production record for the owner's 印務室 page: the shift reports in state/runs/<date>.json
    (editorial/README.md), what the issue needs and which of that is still not on disk."""
    expected = expected_columns(cfg, d)
    out = {"shifts": {}, "expected": expected,
           "missing": [c for c in expected if not os.path.exists(article_path(d, c))]}
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
    # One broken entry loses that shift alone, not the day's whole record.
    for k in SHIFTS + ("reserve", "audit", "late"):  # "late": the 週日補刊's report (scripts/late.py, report_run.py --group late)
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
    """Reserve articles on hand per column (editorial/RESERVE.md) against the target, for the 印務室 page."""
    out = {}
    for col in reserve_columns(cfg):
        n = 0
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
    for day, col, path in iter_articles():
        meta = column_meta(cfg, col, day)  # a retired column stays in config.json with "until", so its issues stay listed
        if meta is None:
            skip(path, "欄位代號 %s 不在 config.json（停刊的欄位要留在 config.json 並加 until，往期才看得到）" % col)
            continue
        try:
            art = load_json(path)
            if not isinstance(art, dict):
                raise ValueError("頂層不是 JSON 物件")
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
            if isinstance(art.get("serial"), dict):  # the novel's installment: book, number and place, for the front page's card
                entry["serial"] = art["serial"]
            if isinstance(art.get("takeaway"), str) and art["takeaway"].strip():  # perio: shown on the saved and column lists
                entry["takeaway"] = art["takeaway"].strip()
            nxt = next_match(art.get("next"))
            if nxt:
                entry["next"] = nxt
            if col == "news":
                pl = news_places(art)
                if pl:
                    entry["places"] = pl
            toks = related_tokens(art)
            search.setdefault(day[:7], []).append({"d": day, "c": col, "t": art.get("title", ""), "x": plain_text(art)})
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
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    sdir = os.path.join(CONTENT, "search")
    os.makedirs(sdir, exist_ok=True)
    for month, rows in search.items():
        with open(os.path.join(sdir, month + ".json"), "w", encoding="utf-8") as f:
            json.dump(sorted(rows, key=lambda r: r["d"], reverse=True), f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(sdir, "months.json"), "w", encoding="utf-8") as f:
        json.dump(sorted(search, reverse=True), f)
    arts = [a for i in issues for a in i["articles"]]
    print("index.json：%d 期，%d 篇（%d 篇有延伸閱讀）；搜尋資料 %d 個月" % (
        len(issues), len(arts), sum(1 for a in arts if "related" in a), len(search)))


if __name__ == "__main__":
    main()
