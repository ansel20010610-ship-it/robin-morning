#!/usr/bin/env python3
"""連載 (the serial, column `serial`): a public-domain novel in daily installments, one per issue, translated by the
editors (editorial/columns/serial.md). The source text is kept split into installments under state/serial/<slug>/src/,
the plan (which installment runs on which day) in state/serial/<slug>.json, and each day's translation is an ordinary
article file content/issues/<date>/serial.json written ahead of time by the weekly 連載班.

  python3 scripts/serial.py fetch <slug>            # download the chapters listed in the plan's `chapters` (Wikisource)
  python3 scripts/serial.py split <slug>            # cut the chapters into installments (~TARGET words each) and date them
  python3 scripts/serial.py status [<slug>]         # which installments are due, which are on disk, how many days ahead
  python3 scripts/serial.py src <slug> <n>          # print installment n's source text (for a translator)
  python3 scripts/serial.py check <slug> [<n>]      # the serial-specific checks of the translated file(s)
"""
import argparse, datetime as dt, json, math, os, re, sys, time, urllib.parse, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import ROOT, UA, TW  # noqa: E402

STATE = os.path.join(ROOT, "state", "serial")
ISSUES = os.path.join(ROOT, "content", "issues")
TARGET = 600   # source words per installment: Russian → Chinese runs about 2.8 characters a word, so ~1700 characters
MIN_CJK, MAX_CJK = 1100, 2600
CJK = re.compile(r"[一-鿿]")
CYR = re.compile(r"[Ѐ-ӿ]{3,}")


def plan_path(slug):
    return os.path.join(STATE, slug + ".json")


def load_plan(slug):
    with open(plan_path(slug), encoding="utf-8") as f:
        return json.load(f)


def save_plan(slug, plan):
    with open(plan_path(slug), "w", encoding="utf-8") as f:
        json.dump(plan, f, ensure_ascii=False, indent=1)
        f.write("\n")


def date_of(plan, n):
    return (dt.date.fromisoformat(plan["start"]) + dt.timedelta(days=n - 1)).isoformat()


def today():
    return dt.datetime.now(TW).date()


# ——— source text ———
ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"]


def clean_wikitext(txt):
    """Russian Wikisource chapter → (list of paragraphs, chapter title or "", book title or ""). Handles the markup
    of the Dostoevsky pages: the header template, {{roman}}, {{Опечатка|wrong|right}} (the correction), editorial
    notes, poem and language wrappers, the chapter heading (== I. Title ==) and the book line (<center>''…''</center>)."""
    txt = re.sub(r"\{\{roman\|(\d+)\}\}", lambda m: ROMAN[int(m.group(1))] if int(m.group(1)) < len(ROMAN) else m.group(1), txt)  # first: the header nests it
    txt = re.sub(r"\{\{Отексте.*?\}\}", "", txt, flags=re.S)
    txt = re.sub(r"__[A-Z]+__", "", txt).replace("&nbsp;", " ")
    txt = re.sub(r"\[\[Категория:[^\]]*\]\]|\[\[[a-z\-]{2,7}:[^\]]*\]\]", "", txt)
    txt = re.sub(r"<ref>.*?</ref>", "", txt, flags=re.S)
    txt = re.sub(r"\{\{roman\|(\d+)\}\}", lambda m: ROMAN[int(m.group(1))] if int(m.group(1)) < len(ROMAN) else m.group(1), txt)
    txt = re.sub(r"\{\{Опечатка\|[^|}]*\|([^|}]*)(?:\|[^}]*)?\}\}", r"\1", txt)
    txt = re.sub(r"\{\{(?:right|lang-[a-z]+)\|([^{}]*)\}\}", r"\1", txt)  # before the notes, which may nest a {{lang-fr}}
    txt = re.sub(r"\{\{Примечание ВТ\|[^{}]*\}\}|\{\{примечания[^}]*\}\}|\{\{indent\|\d+\}\}|<references\s*/>", "", txt, flags=re.I)
    txt = txt.replace("{{NB}}", "NB")
    txt = re.sub(r"\{\{poemx?1?\|[^|}]*\|", "", txt)  # {{poemx1|title|lines}} / {{poem1|...}} → the lines
    book = ""
    m = re.search(r"<center>'*([^<]*?)'*</center>", txt)
    if m:
        book = m.group(1).strip()
        txt = txt.replace(m.group(0), "")
    title = ""
    m = re.search(r"^==\s*(?:[IVXLC]+\.?\s*)?(.*?)\s*==\s*$", txt, flags=re.M)
    if m:
        title = m.group(1).strip()
        txt = txt.replace(m.group(0), "")
    txt = re.sub(r"^={3,}\s*(.*?)\s*={3,}\s*$", r"\n## \1\n", txt, flags=re.M)  # a sub-heading inside a chapter (Zosima's book) → its own "## text" paragraph
    txt = re.sub(r"</?(?:poem|small|big|sup|sub|u|s|span|i|b|p)(?:\s[^>]*)?>", "", txt)
    txt = re.sub(r"<center>'*([^<]*?)'*</center>", r"\1", txt)  # any other centred line (e.g. the end-of-part note) stays as text
    txt = re.sub(r"</?onlyinclude>|<div[^>]*>|</div>|<nowiki/>|<br\s*/?>", "", txt)
    txt = re.sub(r"\[\[([^\]|]*\|)?([^\]]*)\]\]", r"\2", txt)
    txt = re.sub(r"'{2,3}", "", txt)
    txt = txt.replace("}}", "")
    txt = re.sub(r"\s*\|\s*", "\n", txt)  # the lines of a {{poem}} are separated by |: keep them as lines
    paras = [re.sub(r"[ \t]+", " ", p).strip() for p in re.split(r"\n\s*\n", txt)]
    return [p for p in paras if p], title, book


def fetch(slug):
    plan = load_plan(slug)
    out = os.path.join(STATE, slug, "chapters")
    os.makedirs(out, exist_ok=True)
    for ch in plan["chapters"]:
        path = os.path.join(out, ch["key"] + ".json")
        if os.path.exists(path):
            continue
        url = plan["source"]["raw"].format(title=urllib.parse.quote(ch["page"]))
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        txt = urllib.request.urlopen(req, timeout=40).read().decode("utf-8")
        paras, title, book = clean_wikitext(txt)
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"key": ch["key"], "page": ch["page"], "title_ru": title, "book_ru": book, "paragraphs": paras}, f, ensure_ascii=False, indent=0)
        print("%s  %d 段  %d 字" % (ch["key"], len(paras), sum(len(p.split()) for p in paras)))
        time.sleep(0.5)


SENT = re.compile(r"(?<=[.!?…»])\s+(?=[«—А-ЯЁ])")
LONG = 1100  # a paragraph longer than this (Ivan's and Zosima's monologues) may be cut between sentences; shorter ones never are
DASH = ("—", "–", "«", "-")


def units_of(paras):
    """Paragraphs as units: a paragraph longer than LONG words is cut between sentences into pieces of about LONG/2,
    whose later parts carry cont=True (the translator keeps them as one paragraph across installments)."""
    out = []
    for p in paras:
        if len(p.split()) <= LONG:
            out.append({"text": p, "cont": False})
            continue
        acc, cont = [], False
        for sent in SENT.split(p):
            acc.append(sent)
            if sum(len(x.split()) for x in acc) >= LONG * 0.5:
                out.append({"text": " ".join(acc), "cont": cont})
                acc, cont = [], True
        if acc:
            out.append({"text": " ".join(acc), "cont": cont})
    return out


def is_dialogue(t):
    return t.lstrip().startswith(DASH)


def cut_score(units, i, words_so_far, target):
    """How good a break after unit i-1 (before unit i) is — the owner, 2026-11-05: 連載不要斷在奇怪地方. A new
    sub-heading is best; a narrative paragraph after a run of dialogue is good; the middle of an exchange, a colon,
    a dangling short line, or the inside of a paragraph are bad."""
    last, nxt = units[i - 1]["text"], units[i]["text"]
    sc = 0.0
    if nxt.startswith("## "):
        sc += 4
    if units[i]["cont"]:
        sc -= 6
    ld, nd = is_dialogue(last), is_dialogue(nxt)
    if ld and nd:
        sc -= 2  # the middle of an exchange
    elif not nd:
        sc += 2  # the next paragraph is narrative: a new beat
    tail = last.rstrip()[-1:]
    if tail in ":,;—–":
        sc -= 3
    elif tail in ".…»":
        sc += 1
    if nxt[:1].islower():
        sc -= 2
    if ld and len(last.split()) < 10:
        sc -= 2  # a dangling one-liner at the end
    sc -= abs(words_so_far - target) / 200.0
    return sc


def cut_chapter(units, target):
    """Indices where a chapter breaks into installments: each break is the best-scoring boundary (cut_score) between
    0.7 and 1.6 × target words from the installment's start. A short tail is folded into the installment before it,
    or that last stretch is re-cut in two at its best middle boundary when folding would make it too long."""
    words = [len(u["text"].split()) for u in units]
    cum = [0]
    for w in words:
        cum.append(cum[-1] + w)
    total = cum[-1]

    def best_between(start, lo, hi):  # the best boundary i with lo ≤ words(start..i) ≤ hi; past hi if none fits
        best, best_i, over = None, None, None
        for i in range(start + 1, len(units)):
            acc = cum[i] - cum[start]
            if acc < lo:
                continue
            if acc > hi:
                over = i  # a unit longer than the window (a monologue): the first boundary beyond it
                break
            sc = cut_score(units, i, acc, target)
            if best is None or sc > best:
                best, best_i = sc, i
        return best_i if best_i is not None else over

    cuts, start = [], 0
    while total - cum[start] > target * 1.6:
        i = best_between(start, target * 0.7, target * 1.6)
        if i is None:
            break
        cuts.append(i)
        start = i
    tail = total - cum[start]
    if cuts and tail < target * 0.45:
        prev = cuts[-2] if len(cuts) > 1 else 0
        if total - cum[prev] <= target * 1.6 or tail < target * 0.3:
            cuts.pop()  # fold the tail into the installment before (a long installment beats a 30-word one)
        else:  # re-cut the last stretch in two near its middle
            mid = (total - cum[prev]) / 2
            i = best_between(prev, mid * 0.7, mid * 1.3) or cuts[-1]
            cuts[-1] = i
    return sorted({c for c in cuts if 0 < c < len(units)})


def split(slug):
    """Each chapter is cut into installments of about TARGET source words at the best break points (cut_score); an
    installment never crosses a chapter. Installments already translated (their file exists under content/issues)
    keep their text and number; only what follows is cut afresh. The plan gets one entry per installment with its date."""
    plan = load_plan(slug)
    src = os.path.join(STATE, slug, "src")
    os.makedirs(src, exist_ok=True)
    old = plan.get("installments", [])
    done = [i for i in old if os.path.exists(issue_file(i["date"]))]
    inst, n = [], 0
    for ch in plan["chapters"]:
        with open(os.path.join(STATE, slug, "chapters", ch["key"] + ".json"), encoding="utf-8") as f:
            chapter = json.load(f)
        groups = []
        # keep the translated pieces of this chapter as they are (their text may have been cut by an earlier rule);
        # what follows them in the chapter is cut afresh
        kept = sorted([i for i in done if i["part"] == ch["part"] and i["chapter"] == ch["chapter"]], key=lambda x: x["piece"])
        norm = lambda t: re.sub(r"\s+", " ", t).strip()
        kept_text = ""
        for i in kept:
            with open(os.path.join(src, "%03d.json" % i["n"]), encoding="utf-8") as f:
                e = json.load(f)
            groups.append([{"text": t, "cont": bool(e.get("opens_mid_paragraph")) and j == 0} for j, t in enumerate(e["paragraphs"])])
            kept_text += ("" if not kept_text else " ") + norm(" ".join(e["paragraphs"]))
        rest, partial, pos = [], False, 0
        for para in chapter["paragraphs"]:
            t = norm(para)
            if pos >= len(kept_text):
                rest.append(para)
            elif kept_text.startswith(t, pos):
                pos += len(t) + 1
            else:  # the kept text ends inside this paragraph: its remainder opens the next installment mid-paragraph
                head = kept_text[pos:]
                assert t.startswith(head), "已譯的回和原文對不上（%s %s）" % (ch["part"], ch["chapter"])
                rest.append(t[len(head):].strip())
                partial, pos = True, len(kept_text) + 1
        units = units_of(rest)
        if partial and units:
            units[0]["cont"] = True
        if units:
            cuts = cut_chapter(units, TARGET)
            bounds = [0] + cuts + [len(units)]
            groups += [units[bounds[j]:bounds[j + 1]] for j in range(len(bounds) - 1)]
        for p, chunk in enumerate(groups):
            n += 1
            entry = {"n": n, "date": date_of(plan, n), "part": ch["part"], "chapter": ch["chapter"], "piece": p + 1,
                     "pieces": len(groups), "title_ru": chapter.get("title_ru", ""), "words": sum(len(u["text"].split()) for u in chunk),
                     "opens_mid_paragraph": bool(chunk[0]["cont"]), "closes_mid_paragraph": p + 1 < len(groups) and bool(groups[p + 1][0]["cont"]),
                     "paragraphs": [u["text"] for u in chunk]}
            with open(os.path.join(src, "%03d.json" % n), "w", encoding="utf-8") as f:
                json.dump(entry, f, ensure_ascii=False, indent=0)
            inst.append({k_: v for k_, v in entry.items() if k_ != "paragraphs"})
    for f in os.listdir(src):  # leftovers from a longer earlier plan
        if f.endswith(".json") and int(f[:3]) > n:
            os.remove(os.path.join(src, f))
    plan["installments"] = inst
    save_plan(slug, plan)
    print("%s：%d 回，%s 到 %s，平均 %d 字（原文）；保留已譯 %d 回" % (plan["title"], n, inst[0]["date"], inst[-1]["date"],
                                                                 sum(i["words"] for i in inst) / n, len(done)))


# ——— the translated files ———
def issue_file(date):
    return os.path.join(ISSUES, date, "serial.json")


def check_one(plan, i, E):
    path = issue_file(i["date"])
    if not os.path.exists(path):
        E("還沒有譯文：%s" % path)
        return
    try:
        with open(path, encoding="utf-8") as f:
            art = json.load(f)
    except ValueError as e:
        E("JSON 壞了：%s" % e)
        return
    s = art.get("serial") or {}
    if art.get("column") != "serial" or art.get("date") != i["date"]:
        E("column 要是 serial、date 要是 %s" % i["date"])
    if s.get("slug") != plan["slug"] or s.get("n") != i["n"]:
        E("serial.slug／serial.n 要是 %s／%d" % (plan["slug"], i["n"]))
    for k in ("book", "author", "part", "chapter", "piece", "pieces"):
        if k not in s:
            E("serial 缺少 %s" % k)
    if not re.search(r"第 %d 回" % i["n"], art.get("title", "")):
        E("title 要含「第 %d 回」" % i["n"])
    if not (art.get("dek") or "").strip():
        E("dek（前情提要，第 1 回是作品介紹）不能空")
    body = art.get("body") or []
    text = "".join(b.get("text", "") for b in body if isinstance(b, dict))
    n = len(CJK.findall(text))
    if not MIN_CJK <= n <= MAX_CJK:
        E("正文 %d 字，要在 %d–%d 之間（原文 %d 字）" % (n, MIN_CJK, MAX_CJK, i["words"]))
    cyr = CYR.findall(text + art.get("title", "") + art.get("dek", ""))
    if cyr:
        E("有沒譯的俄文：%s" % "、".join(cyr[:5]))
    if not any(b.get("type") == "p" for b in body if isinstance(b, dict)):
        E("正文沒有段落")
    if i["piece"] == 1 and not any(b.get("type") == "h" for b in body if isinstance(b, dict)):
        E("這一回是一章的開頭，正文要有章名的 h 區塊")


def status(slug=None):
    slugs = [slug] if slug else sorted(f[:-5] for f in os.listdir(STATE) if f.endswith(".json"))
    t = today()
    for s in slugs:
        plan = load_plan(s)
        inst = plan.get("installments", [])
        have = [i for i in inst if os.path.exists(issue_file(i["date"]))]
        due = [i for i in inst if dt.date.fromisoformat(i["date"]) <= t + dt.timedelta(days=plan.get("ahead", 21))]
        missing = [i for i in due if not os.path.exists(issue_file(i["date"]))]
        last = max((dt.date.fromisoformat(i["date"]) for i in have), default=None)
        print("%s《%s》：共 %d 回，%s 開始；已譯 %d 回%s；%d 天前置目標；缺 %d 回" % (
            s, plan["title"], len(inst), plan["start"], len(have),
            "，到 %s（還有 %d 天）" % (last, (last - t).days) if last else "", plan.get("ahead", 21), len(missing)))
        for i in missing[:30]:
            print("  待譯 第 %d 回  %s  %s %s（%d／%d）  %d 字" % (i["n"], i["date"], i["part"], i["chapter"], i["piece"], i["pieces"], i["words"]))
        errs = []
        for i in have:
            check_one(plan, i, lambda m, i=i: errs.append("第 %d 回（%s）：%s" % (i["n"], i["date"], m)))
        for e in errs:
            print("  ERROR " + e)
        if not missing and not errs:
            print("  都齊了。")
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["fetch", "split", "status", "src", "check"])
    ap.add_argument("slug", nargs="?")
    ap.add_argument("n", nargs="?", type=int)
    a = ap.parse_args()
    if a.cmd == "fetch":
        fetch(a.slug)
    elif a.cmd == "split":
        split(a.slug)
    elif a.cmd == "status":
        status(a.slug)
    elif a.cmd == "src":
        with open(os.path.join(STATE, a.slug, "src", "%03d.json" % a.n), encoding="utf-8") as f:
            e = json.load(f)
        print("第 %d 回  %s  %s %s（%d／%d）  %d 字%s\n" % (e["n"], e["date"], e["part"], e["chapter"], e["piece"], e["pieces"], e["words"], ("  章名：" + e["title_ru"]) if e.get("title_ru") else ""))
        print("\n\n".join(e["paragraphs"]))
    else:
        plan = load_plan(a.slug)
        errs = []
        for i in plan["installments"]:
            if a.n and i["n"] != a.n:
                continue
            if a.n or os.path.exists(issue_file(i["date"])):
                check_one(plan, i, lambda m, i=i: errs.append("第 %d 回（%s）：%s" % (i["n"], i["date"], m)))
        for e in errs:
            print("ERROR " + e)
        print("%d 個問題" % len(errs))
        sys.exit(1 if errs else 0)


if __name__ == "__main__":
    main()
