#!/usr/bin/env python3
"""寫信給編輯部 (editorial/columns/letters.md): the letters the readers left in the owner's yard, and the answers.
Since 2026-11-10 (the owner: 回信改成只有院子裡的人看得到) the answers are kept in the yard's shared store, not in this
public repo: only the yard's phones read them.

  NEST_CODE=<yard> python3 scripts/letters.py pending          the letters not yet answered, as JSON
  python3 scripts/letters.py check <answers.json>              {"answers": [...]}: shape, lengths, https sources
  NEST_CODE=<yard> python3 scripts/letters.py publish <answers.json>   check, then save them in the yard

The yard code is the only key to the mailbox; it lives in the routine's prompt, never in a file, commit or report.
Write the answers file outside the repo (e.g. /tmp/answers.json).
"""
import json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CJK = re.compile(r"[㐀-鿿]")
ID = re.compile(r"^L[0-9A-Z]{6,16}$")


def api():
    return json.load(open(os.path.join(ROOT, "content", "config.json"), encoding="utf-8"))["nest"]["api"].rstrip("/")


def call(path, body=None):
    req = urllib.request.Request(f"{api()}/{path}", data=None if body is None else json.dumps(body, ensure_ascii=False).encode("utf-8"),
                                 headers={"User-Agent": "robin-morning-letters", "Content-Type": "application/json"}, method="GET" if body is None else "POST")
    return json.load(urllib.request.urlopen(req, timeout=30))


def code():
    c = os.environ.get("NEST_CODE", "").strip().upper()
    if not c:
        sys.exit("需要 NEST_CODE")
    return c


def pending():
    c = code()
    box = call(f"{c}/letters").get("letters", [])
    done = {a.get("id") for a in call(f"{c}/letters/answers").get("answers", [])}
    waiting = [{"id": l["id"], "at": l["at"], "text": l["text"]} for l in box if l.get("id") not in done]
    print(json.dumps(waiting, ensure_ascii=False, indent=1))
    print(f"{len(waiting)} 封等回信", file=sys.stderr)


def problems(path):
    try:
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
    except (FileNotFoundError, ValueError) as e:
        return [f"讀不到 {path}：{e}"], []
    rows, probs = d.get("answers") if isinstance(d, dict) else None, []
    if not isinstance(rows, list) or not rows:
        return ["要有 {\"answers\": [...]}，至少一封"], []
    for i, l in enumerate(rows):
        w = f"#{i} {l.get('id') if isinstance(l, dict) else ''}"
        if not isinstance(l, dict): probs.append(f"{w}：不是物件"); continue
        if not ID.match(str(l.get("id", ""))): probs.append(f"{w}：id 要照抄信的 id（L 開頭）")
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", str(l.get("date", ""))): probs.append(f"{w}：date 要是刊出那期的日期 YYYY-MM-DD")
        q, a = str(l.get("q", "")), str(l.get("a", ""))
        if not 6 <= len(CJK.findall(q)) <= 80: probs.append(f"{w}：q（改寫過的問題）{len(CJK.findall(q))} 字，要 6–80 字")
        if not 80 <= len(CJK.findall(a)) <= 600: probs.append(f"{w}：a（回信）{len(CJK.findall(a))} 字，要 80–600 字")
        if re.search(r"\]\((?!https://)", a): probs.append(f"{w}：回信裡的連結只能是 https")
        for s in l.get("sources", []) or []:
            if not isinstance(s, dict) or not str(s.get("url", "")).startswith("https://"): probs.append(f"{w}：sources 每一項要有 https 的 url")
        extra = set(l) - {"id", "date", "q", "a", "sources"}
        if extra: probs.append(f"{w}：多了欄位 {'、'.join(sorted(extra))}")
    return probs, rows


def check(path):
    probs, _ = problems(path)
    for p in probs: print(p)
    print("0 problems" if not probs else f"{len(probs)} problems")
    return 1 if probs else 0


def tw_today():
    import datetime as dt
    return dt.datetime.now(dt.timezone(dt.timedelta(hours=8))).strftime("%Y-%m-%d")


def publish(path):
    probs, rows = problems(path)
    if probs:
        for p in probs: print(p)
        return 1
    # the answers go with this morning's issue, Taiwan's date: the cloud's clock is UTC, still yesterday before 08:00
    # (2026-11-11: an answer written at 04:47 was dated the 10th and never reached the front page)
    today = tw_today()
    for l in rows:
        if l.get("date") != today:
            print(f"{l.get('id')}：date {l.get('date')} 改成今天（台灣）{today}")
            l["date"] = today
    r = call(f"{code()}/letters/answers", {"answers": rows})
    print(f"存進院子：{r.get('saved')} 封（院子裡共 {r.get('total')} 封回信）" if r.get("saved") else f"沒存成：{r}")
    return 0 if r.get("saved") else 1


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "pending":
        pending()
    elif cmd == "check" and len(sys.argv) > 2:
        sys.exit(check(sys.argv[2]))
    elif cmd == "publish" and len(sys.argv) > 2:
        sys.exit(publish(sys.argv[2]))
    else:
        sys.exit(__doc__)
