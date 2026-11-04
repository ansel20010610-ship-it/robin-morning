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
def clean_wikitext(txt):
    """Russian Wikisource chapter → list of paragraphs (plain text)."""
    txt = re.sub(r"\{\{Отексте.*?\}\}\n", "", txt, flags=re.S)
    txt = re.sub(r"\[\[Категория:[^\]]*\]\]|\[\[[a-z\-]{2,7}:[^\]]*\]\]", "", txt)
    txt = re.sub(r"<ref>.*?</ref>", "", txt, flags=re.S)
    txt = re.sub(r"\{\{poemx1\|[^|]*\|", "", txt)  # {{poemx1|title|lines...}} → the lines
    txt = re.sub(r"<div[^>]*>|</div>|<nowiki/>|<br\s*/?>", "", txt)
    txt = re.sub(r"\[\[([^\]|]*\|)?([^\]]*)\]\]", r"\2", txt)
    txt = re.sub(r"'{2,3}", "", txt)
    txt = txt.replace("}}", "")
    paras = [re.sub(r"[ \t]+", " ", p).strip() for p in re.split(r"\n\s*\n", txt)]
    return [p for p in paras if p]


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
        paras = clean_wikitext(txt)
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"key": ch["key"], "page": ch["page"], "paragraphs": paras}, f, ensure_ascii=False, indent=0)
        print("%s  %d 段  %d 字" % (ch["key"], len(paras), sum(len(p.split()) for p in paras)))
        time.sleep(0.5)


SENT = re.compile(r"(?<=[.!?…»])\s+(?=[«—А-ЯЁ])")
LONG = 450  # a paragraph longer than this (a letter, a monologue) may be cut between sentences


def units_of(paras):
    """Paragraphs as units of at most ~LONG words: a long paragraph is cut between sentences into pieces whose later
    parts carry cont=True (the translator keeps them as one paragraph across installments)."""
    out = []
    for p in paras:
        if len(p.split()) <= LONG:
            out.append({"text": p, "cont": False})
            continue
        acc, cont = [], False
        for sent in SENT.split(p):
            acc.append(sent)
            if sum(len(x.split()) for x in acc) >= LONG * 0.6:
                out.append({"text": " ".join(acc), "cont": cont})
                acc, cont = [], True
        if acc:
            out.append({"text": " ".join(acc), "cont": cont})
    return out


def split(slug):
    """Each chapter is cut into installments of about TARGET source words at paragraph (or, in a very long paragraph,
    sentence) boundaries; a short tail is folded into the installment before it. An installment never crosses a
    chapter. The plan gets one entry per installment with its date."""
    plan = load_plan(slug)
    src = os.path.join(STATE, slug, "src")
    os.makedirs(src, exist_ok=True)
    inst, n = [], 0
    for ch in plan["chapters"]:
        with open(os.path.join(STATE, slug, "chapters", ch["key"] + ".json"), encoding="utf-8") as f:
            units = units_of(json.load(f)["paragraphs"])
        words = [len(u["text"].split()) for u in units]
        total = sum(words)
        groups, acc, cur = [], 0, []
        for i, u in enumerate(units):
            cur.append(u)
            acc += words[i]
            left = total - sum(words[:i + 1])
            if acc >= TARGET * 0.9 and left >= TARGET * 0.45:
                groups.append(cur)
                cur, acc = [], 0
        if cur:
            groups.append(cur)
        for p, chunk in enumerate(groups):
            n += 1
            entry = {"n": n, "date": date_of(plan, n), "part": ch["part"], "chapter": ch["chapter"], "piece": p + 1,
                     "pieces": len(groups), "words": sum(len(u["text"].split()) for u in chunk),
                     "opens_mid_paragraph": bool(chunk[0]["cont"]), "closes_mid_paragraph": p + 1 < len(groups) and bool(groups[p + 1][0]["cont"]),
                     "paragraphs": [u["text"] for u in chunk]}
            with open(os.path.join(src, "%03d.json" % n), "w", encoding="utf-8") as f:
                json.dump(entry, f, ensure_ascii=False, indent=0)
            inst.append({k: v for k, v in entry.items() if k != "paragraphs"})
    plan["installments"] = inst
    save_plan(slug, plan)
    print("%s：%d 回，%s 到 %s，平均 %d 字（原文）" % (plan["title"], n, inst[0]["date"], inst[-1]["date"],
                                                     sum(i["words"] for i in inst) / n))


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
        print("第 %d 回  %s  %s %s（%d／%d）  %d 字\n" % (e["n"], e["date"], e["part"], e["chapter"], e["piece"], e["pieces"], e["words"]))
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
