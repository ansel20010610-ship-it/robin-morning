#!/usr/bin/env python3
"""歷史上的今天 (content/onthisday.json): one line a day under the issue, kept by the 06:17 近期演出 routine
(editorial/columns/onthisday.md). The file maps a date (YYYY-MM-DD) to {year, text, sources}; the app shows the issue's
own date, so a past issue keeps its line. Only the last KEEP days are kept.

  python3 scripts/onthisday.py add --date 2026-11-04 --year 1922 --text "……" --source URL [--source URL]
  python3 scripts/onthisday.py show [--date 2026-11-04]
  python3 scripts/onthisday.py check            # validate every entry (also run by `add`)
  python3 scripts/onthisday.py missing [--days N]   # recent days (default 3, today excluded) that have an issue but no line
"""
import argparse, datetime as dt, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILE = ROOT / "content" / "onthisday.json"
ISSUES = ROOT / "content" / "issues"
TW = dt.timezone(dt.timedelta(hours=8))
KEEP = 400
MIN_LEN, MAX_LEN = 25, 70
BAD = ["！", "!", "震驚", "意義深遠", "影響深遠", "載入史冊", "名垂青史", "劃時代", "永遠改變", "史上最"]


def load():
    try:
        d = json.loads(FILE.read_text(encoding="utf-8"))
        return d if isinstance(d, dict) else {}
    except (OSError, ValueError):
        return {}


def save(d):
    keys = sorted(k for k in d if re.fullmatch(r"\d{4}-\d{2}-\d{2}", k))[-KEEP:]
    FILE.write_text(json.dumps({k: d[k] for k in keys}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def problems(date, e):
    out = []
    try:
        dt.date.fromisoformat(date)
    except ValueError:
        out.append("日期格式要是 YYYY-MM-DD")
    year, text, src = e.get("year"), e.get("text"), e.get("sources")
    if not isinstance(year, int) or not (-3000 < year <= dt.datetime.now(TW).year):
        out.append("year 要是整數年份")
    if not isinstance(text, str) or not text.strip():
        return out + ["text 不能空"]
    n = len(text)
    if not MIN_LEN <= n <= MAX_LEN:
        out.append(f"text 長度 {n}，要在 {MIN_LEN} 到 {MAX_LEN} 字之間")
    if re.match(r"^\s*(西元前\s*)?\d{1,4}\s*年", text):
        out.append("text 不要以年份開頭（年份在 year 欄位，App 會另外排）")
    for w in BAD:
        if w in text:
            out.append(f"text 含「{w}」：不用驚嘆號，不寫空話")
    if re.search(r"[,.?:;()]", text):
        out.append("text 要用全形標點")
    if re.search(r"[0-9][一-鿿]|[一-鿿][0-9]", text):
        out.append("數字與中文之間要留半形空格（「1847 年」「38 歲」）")
    if not text.rstrip().endswith(("。", "」", "》")):
        out.append("text 要以句號結尾")
    if not isinstance(src, list) or not src or not all(isinstance(s, str) and s.startswith("http") for s in src):
        out.append("sources 至少一個網址")
    return out


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("add")
    a.add_argument("--date", required=True)
    a.add_argument("--year", required=True, type=int)
    a.add_argument("--text", required=True)
    a.add_argument("--source", action="append", default=[])
    a.add_argument("--force", action="store_true", help="寫入不是台灣今天的日期（補過去某天的空格）")
    s = sub.add_parser("show")
    s.add_argument("--date")
    sub.add_parser("check")
    m = sub.add_parser("missing")
    m.add_argument("--days", type=int, default=3)
    args = ap.parse_args()
    d = load()
    if args.cmd == "missing":
        # the 演出班 may skip the line when out of time (onthisday.md), and it does not run again for a past day, so a
        # gap stays until someone sees it; today is left out because the shift that writes it runs at 06:17
        today = dt.datetime.now(TW).date()
        gaps = []
        for i in range(1, args.days + 1):
            day = (today - dt.timedelta(days=i)).isoformat()
            if (ISSUES / day).is_dir() and day not in d:
                gaps.append(day)
        if gaps:
            print("歷史上的今天 空白：" + "、".join(sorted(gaps)))
        else:
            print(f"最近 {args.days} 天都有「歷史上的今天」。")
        return
    if args.cmd == "add":
        e = {"year": args.year, "text": args.text.strip(), "sources": args.source}
        bad = problems(args.date, e)
        # The routine's clock is UTC: at 06:17 Taiwan time it is still yesterday there, and a date worked out by hand
        # went onto yesterday's line, over the one already there (the letters answer of 2026-11-11 was dated the same
        # way). Only Taiwan's today is written without --force; today's own line may be written again (the 05:30 API
        # shift and the 06:17 routine both may).
        today = dt.datetime.now(TW).date().isoformat()
        if not args.force and args.date != today:
            bad.append(f"--date {args.date} 不是台灣時間的今天（{today}）；用 TZ=Asia/Taipei date +%F 取日期，真的要補那一天再加 --force")
        if bad:
            print("ERROR 沒有寫入：\n  " + "\n  ".join(bad))
            sys.exit(1)
        d[args.date] = e
        save(d)
        print(f"寫入 {args.date}：{e['year']}，{e['text']}")
    elif args.cmd == "show":
        for k in sorted(d):
            if not args.date or k == args.date:
                print(f"{k}  {d[k].get('year')}  {d[k].get('text')}")
    else:
        bad = {k: problems(k, v) for k, v in d.items()}
        bad = {k: v for k, v in bad.items() if v}
        for k, v in bad.items():
            print(f"ERROR {k}: " + "；".join(v))
        print(f"{len(d)} 則，{len(bad)} 則有問題")
        sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
