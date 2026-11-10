#!/usr/bin/env python3
"""寫信給編輯部 (editorial/columns/letters.md): the letters the readers left in the owner's yard, and the answers.

  NEST_CODE=<yard> python3 scripts/letters.py pending   the letters still waiting (not yet in content/letters.json), as JSON
  python3 scripts/letters.py check                      content/letters.json: shape, lengths, https sources; exit 1 on a problem

The yard code is the only key to the mailbox; it lives in the routine's prompt, never in a file, commit or report.
"""
import datetime as dt, json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "content", "letters.json")
CJK = re.compile(r"[㐀-鿿]")
ID = re.compile(r"^L[0-9A-Z]{6,16}$")


def load():
    try:
        with open(PATH, encoding="utf-8") as f:
            d = json.load(f)
    except FileNotFoundError:
        d = {"letters": []}
    return d


def pending(code):
    api = json.load(open(os.path.join(ROOT, "content", "config.json"), encoding="utf-8"))["nest"]["api"].rstrip("/")
    req = urllib.request.Request(f"{api}/{code}/letters", headers={"User-Agent": "robin-morning-letters"})
    box = json.load(urllib.request.urlopen(req, timeout=30)).get("letters", [])
    done = {l.get("id") for l in load().get("letters", [])}
    waiting = [{"id": l["id"], "at": l["at"], "text": l["text"]} for l in box if l.get("id") not in done]
    print(json.dumps(waiting, ensure_ascii=False, indent=1))
    print(f"{len(waiting)} 封等回信", file=sys.stderr)


def check():
    d, probs = load(), []
    if not isinstance(d.get("letters"), list):
        print("letters 不是陣列"); return 1
    seen = set()
    for i, l in enumerate(d["letters"]):
        w = f"#{i} {l.get('id')}"
        if not isinstance(l, dict): probs.append(f"{w}：不是物件"); continue
        if not ID.match(str(l.get("id", ""))): probs.append(f"{w}：id 要照抄信的 id（L 開頭）")
        if l.get("id") in seen: probs.append(f"{w}：id 重複")
        seen.add(l.get("id"))
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", str(l.get("date", ""))): probs.append(f"{w}：date 要是刊出那期的日期 YYYY-MM-DD")
        q, a = str(l.get("q", "")), str(l.get("a", ""))
        if not 6 <= len(CJK.findall(q)) <= 80: probs.append(f"{w}：q（改寫過的問題）{len(CJK.findall(q))} 字，要 6–80 字")
        if not 80 <= len(CJK.findall(a)) <= 600: probs.append(f"{w}：a（回信）{len(CJK.findall(a))} 字，要 80–600 字")
        if re.search(r"\]\((?!https://)", a): probs.append(f"{w}：回信裡的連結只能是 https")
        for s in l.get("sources", []) or []:
            if not isinstance(s, dict) or not str(s.get("url", "")).startswith("https://"): probs.append(f"{w}：sources 每一項要有 https 的 url")
        extra = set(l) - {"id", "asked", "date", "q", "a", "sources"}
        if extra: probs.append(f"{w}：多了欄位 {'、'.join(sorted(extra))}")
    for p in probs: print(p)
    print("0 problems" if not probs else f"{len(probs)} problems")
    return 1 if probs else 0


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "pending":
        code = os.environ.get("NEST_CODE") or (sys.argv[2] if len(sys.argv) > 2 else "")
        if not code: sys.exit("需要 NEST_CODE")
        pending(code.upper())
    elif cmd == "check":
        sys.exit(check())
    else:
        sys.exit(__doc__)
