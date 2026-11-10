#!/usr/bin/env python3
"""API 版班次 (.github/workflows/api-shift.yml): some shifts run on the owner's monthly Console API credits (200 USD a
month that do not carry over; the owner, 2026-11-10) instead of the claude.ai plan's weekly quota. This decides whether
a run should spend anything, and records what it cost.

  python3 scripts/api_shift.py decide <shift>         prints go=yes|no (and why); for $GITHUB_OUTPUT
  python3 scripts/api_shift.py record <shift> <out>   reads claude -p --output-format json, prints the result and the
                                                      cost, appends it to state/api/spend.json
  python3 scripts/api_shift.py month                  this month's spend so far

Shifts: serial (16:00), reserve (17:30), concerts (06:00), rescue (06:30; only when shifts 1-3 of the night all failed to
report — the weekly quota is gone — including Sundays, the owner, 2026-11-10). Their instructions are
editorial/api-shifts/<shift>.md. The repo is public: nothing secret is ever printed or written here.
"""
import datetime as dt, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEND = os.path.join(ROOT, "state", "api", "spend.json")
MONTH_CAP = 185.0  # USD; Console's own monthly limit (200) is the hard stop, this leaves a margin for 問這篇
BUDGET = {"serial": 4, "reserve": 10, "concerts": 4, "rescue": 25}  # per run, claude --max-budget-usd
TW = dt.timezone(dt.timedelta(hours=8))


def now():
    return dt.datetime.now(TW)


def load():
    try:
        with open(SPEND, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"runs": []}


def month_total(d=None):
    m = now().strftime("%Y-%m")
    return round(sum(r.get("usd", 0) for r in (d or load())["runs"] if str(r.get("at", "")).startswith(m)), 2)


def decide(shift):
    def out(go, why):
        print(f"go={'yes' if go else 'no'}")
        print(f"budget={BUDGET.get(shift, 0)}")
        print(f"why={why}")
    if shift not in BUDGET:
        return out(False, f"unknown shift {shift}")
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return out(False, "no ANTHROPIC_API_KEY secret yet")
    spent = month_total()
    if spent >= MONTH_CAP:
        return out(False, f"this month's spend {spent} USD has reached {MONTH_CAP}")
    if shift == "rescue":
        day = now().strftime("%Y-%m-%d")
        try:
            with open(os.path.join(ROOT, "state", "runs", f"{day}.json"), encoding="utf-8") as f:
                runs = json.load(f)
        except FileNotFoundError:
            runs = {}
        got = [g for g in ("1", "2", "3") if g in runs]
        if got:
            return out(False, f"shifts {','.join(got)} reported: the quota is working")
        return out(True, "shifts 1-3 all silent: the weekly quota looks spent")
    return out(True, f"month so far {spent} USD")


def record(shift, path):
    try:
        with open(path, encoding="utf-8") as f:
            r = json.load(f)
    except (FileNotFoundError, ValueError):
        r = {}
    usd = float(r.get("total_cost_usd") or 0)
    sub = r.get("subtype") or ("error" if r.get("is_error") else "")
    print(f"結果（{shift}，{sub or 'success'}，{usd:.2f} USD）：")
    print(str(r.get("result") or "（沒有輸出）")[:1500])
    d = load()
    d["runs"].append({"at": now().isoformat(timespec="minutes"), "shift": shift, "usd": round(usd, 3), "status": sub or "success"})
    d["runs"] = d["runs"][-400:]
    os.makedirs(os.path.dirname(SPEND), exist_ok=True)
    with open(SPEND, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"本月累計 {month_total(d)} USD")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "decide" and len(sys.argv) > 2:
        decide(sys.argv[2])
    elif cmd == "record" and len(sys.argv) > 3:
        record(sys.argv[2], sys.argv[3])
    elif cmd == "month":
        print(month_total())
    else:
        sys.exit(__doc__)
