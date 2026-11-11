#!/usr/bin/env python3
"""API 版班次 (.github/workflows/api-shift.yml): some shifts run on the owner's monthly Console API credits (200 USD a
month that do not carry over; the owner, 2026-11-10) instead of the claude.ai plan's weekly quota. This decides whether
a run should spend anything, and records what it cost.

  python3 scripts/api_shift.py decide <shift>         prints go=yes|no, budget= and why=; for $GITHUB_OUTPUT
  python3 scripts/api_shift.py record <shift> <out> [budget]
                                                      reads claude -p --output-format json, prints the result and the
                                                      cost, appends it to state/api/spend.json
  python3 scripts/api_shift.py month                  this credit cycle's spend so far
  python3 scripts/api_shift.py column | mend | sweep  what that shift is to write now (its instructions run this)

Shifts: serial (16:00), reserve (17:30), concerts (05:30), rescue (06:30; when shifts 1-3 of the night all failed to
report — the weekly quota is gone — including Sundays, the owner, 2026-11-10), and three more the owner asked for on
2026-11-11:
  column (22:30)  writes COLUMNS for the coming issue before shift 1 starts at 00:37, which then skips them: one column a
                  day comes off the plan's weekly quota. Too late (after 00:20) or over the cap, shift 1 writes it as before.
  mend (04:00)    救援放寬: whatever shifts 1-3 left missing (a shift that did not run, or ran out of quota half way) is
                  written before shift 4 starts at 05:17; never football.json, which shifts 4 and 5 own. And the 06:30
                  rescue now also runs when only some of shifts 1-3 reported and shift 4 shows no sign of life.
  sweep (18:30)   月底清倉: on the last SWEEP_DAYS days of the month, what the credits have left goes into serial
                  installments beyond the daily shift's three days — the one thing here that keeps (the credits do not).
Money: a "month" here is the credit cycle, the 13th to the 13th (see CYCLE_DAY), not the calendar month. Everything
stops at MONTH_CAP; column, reserve and sweep already at SOFT_CAP, so that the end of a cycle still has room for the
rescues, concerts and the daily serial (the sweep takes that room too on the cycle's last day). Their instructions are editorial/api-shifts/<shift>.md. The
repo is public: nothing secret is ever printed or written here.
"""
import datetime as dt, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEND = os.path.join(ROOT, "state", "api", "spend.json")
# USD. Console's own monthly limit (200) is the hard stop — the owner confirmed on 2026-11-11 that nothing is charged
# past it (no card, no auto-reload) — so a cap here guards no money, only work: past 200 a running shift dies half way
# and 問這篇 and the diary (the yard Worker, whose spend this file cannot see: 0.61 on 2026-11-10) stop until the 1st.
MONTH_CAP = 190.0
# The credits follow the plan's billing cycle, not the calendar month (Console → Billing, read with the owner on
# 2026-11-11: the 200 USD granted on 2026-11-10 expire on 2026-12-13 00:00 UTC; Anthropic's help page: a new grant
# comes shortly after each plan payment, what is left of the old one is gone). So the cycle runs from the 13th 00:00 UTC
# to the next 13th; the first began with the grant. Until 2026-11-11 this file counted calendar months, a guess.
# CHECK after 2026-12-13 that the next grant's dates on the Billing page fit CYCLE_DAY.
CYCLE_DAY = 13
FIRST_GRANT = dt.datetime(2026, 11, 10, tzinfo=dt.timezone.utc)
FIRST_END = dt.datetime(2026, 12, 13, tzinfo=dt.timezone.utc)
# Nothing is spent in a cycle's first day: the new grant comes "shortly after" the payment, at an hour nobody here can
# see, and until it does a request would eat the owner's purchased balance (3.70 USD on 2026-11-11; auto-reload is off)
# or fail. The claude.ai routines and shift 1 do that day's work on the plan, as they did before these shifts existed.
QUIET_HOURS = 24
SOFT_CAP = 165.0   # column, reserve and sweep stop here: the last 25 of the cap stay for concerts, serial, mend and rescue
SOFT = ("column", "reserve", "sweep")
BUDGET = {"serial": 4, "reserve": 10, "concerts": 4, "rescue": 25, "column": 12, "mend": 25, "sweep": 25}  # per run, claude --max-budget-usd
COLUMNS = ["perio"]     # what the column shift writes each evening (the owner, 2026-11-11: 每天一欄); one word to change
SWEEP_DAYS = 6          # the sweep runs on the last six days of the credit cycle
HOLD_PER_DAY = 6.0      # USD the sweep leaves for each day still to come (the column, concerts, the daily serial)
PER_INSTALLMENT = 1.2   # USD a serial installment costs (0.94 measured on 2026-11-11), with a margin
SWEEP_MAX = 20          # installments in one sweep run: four batches of five inside the job's two hours
TW = dt.timezone(dt.timedelta(hours=8))


def now():
    return dt.datetime.now(TW)


def load():
    try:
        with open(SPEND, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"runs": []}


def cycle(t=None):
    """(start, end) in UTC of the credit cycle that t (default: now) falls in."""
    t = t or dt.datetime.now(dt.timezone.utc)
    if t < FIRST_END:
        return FIRST_GRANT, FIRST_END
    start = t.replace(day=CYCLE_DAY, hour=0, minute=0, second=0, microsecond=0)
    if start > t:
        start = (start.replace(day=1) - dt.timedelta(days=1)).replace(day=CYCLE_DAY)
    return start, (start.replace(day=28) + dt.timedelta(days=4)).replace(day=CYCLE_DAY)


def month_total(d=None, t=None):
    """What the shifts spent in the credit cycle of t (default: now) — the name is from when it was a calendar month."""
    start, end = cycle(t)
    total = 0.0
    for r in (d or load())["runs"]:
        try:
            at = dt.datetime.fromisoformat(str(r.get("at", "")))
        except ValueError:
            continue
        if at.tzinfo is None:
            at = at.replace(tzinfo=TW)
        if start <= at < end:
            total += r.get("usd", 0)
    return round(total, 2)


def missing_of(cols, d):
    """Those of cols that issue d does not have yet, or has in a state that fails validation — plan_day's test."""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import common, validate
    cfg = common.load_config()
    out = []
    for c in cols:
        p = common.article_path(d, c)
        if os.path.exists(p):
            imgs, tops = validate.ledgers_excluding(str(d), c)
            if not validate.validate_file(cfg, d, c, p, False, imgs, tops)[0]:
                continue
        out.append(c)
    return out


def column_work(t=None):
    """(issue date, the COLUMNS still to write) for the column shift, or (None, []) when the night shifts own the coming
    issue: shift 1 starts at 00:37 and writes whatever is missing, so a relay that comes late must not write beside it."""
    t = t or now()
    if (0, 20) <= (t.hour, t.minute) < (12, 0):
        return None, []
    d = t.date() + dt.timedelta(days=1) if t.hour >= 12 else t.date()
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import common
    return d, missing_of([c for c in COLUMNS if c in common.expected_columns(common.load_config(), d)], d)


def mend_work(t=None, gate=True):
    """(issue date, what shifts 1-3 left missing) for the mend shift. With the gate (the decision to start), (None, [])
    outside 03:45-04:45: earlier a shift may still be writing (the latest report of shift 3 so far is 03:25), later
    shift 4 (05:17) is too near. The running shift asks again before each article and each push, at any minute, so its
    own list has no gate. football is left out: shift 3 only drafts it, shifts 4 and 5 own the file."""
    t = t or now()
    if gate and not (3, 45) <= (t.hour, t.minute) < (4, 45):
        return None, []
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import common
    cfg, d, cols = common.load_config(), t.date(), []
    for g in (1, 2, 3):
        cols += [c for c in common.columns_for_group(cfg, d, g) if c != "football" and c not in cols]
    return d, missing_of(cols, d)


def activity(day):
    """How many commits touched the day's issue or the watch logs since 05:20 (shift 4 starts at 05:17 and pushes in
    pieces; the mend shift stops at 05:05), or None when GitHub would not say. Asked of the API, not of git: the
    workflow's checkout is one commit deep."""
    since = dt.datetime.combine(dt.date.fromisoformat(day), dt.time(5, 20), TW).astimezone(dt.timezone.utc)
    n = 0
    for path in ("content/issues/%s" % day, "state/watch"):
        try:
            r = subprocess.run(["gh", "api", "-X", "GET", "repos/%s/commits" % os.environ.get("GH_REPO", ""), "-f", "path=" + path,
                                "-f", "since=" + since.strftime("%Y-%m-%dT%H:%M:%SZ"), "-f", "per_page=5", "--jq", "length"],
                               capture_output=True, text=True, timeout=30)
            if r.returncode != 0:
                return None  # an error body could still count as a number
            n += int(r.stdout.strip())
        except (OSError, ValueError, subprocess.SubprocessError):
            return None
    return n


def sweep_room(spent=None, t=None):
    """(USD the cycle-end sweep may spend now, whole UTC days left in the credit cycle after today). Nothing before the
    last SWEEP_DAYS days; then what SOFT_CAP has left once every remaining day (today's evening included) keeps
    HOLD_PER_DAY. On the cycle's last day the 25 kept for the rescues goes too, up to MONTH_CAP: a rescue that night is
    unlikely and would still have the reserves behind it, while what is left at 08:00 Taiwan time the next morning (00:00
    UTC, when the grant expires) is gone for certain."""
    t = t or dt.datetime.now(dt.timezone.utc)
    left = (cycle(t)[1].date() - t.date()).days - 1
    if left >= SWEEP_DAYS:
        return 0.0, left
    spent = month_total(t=t) if spent is None else spent
    return max(0.0, round((SOFT_CAP if left else MONTH_CAP) - spent - HOLD_PER_DAY * (left + 1), 2)), left


def sweep_list(n, t=None):
    """The next n installments nobody has translated, beyond the daily shift's `ahead` days (inside them the 連載班 and
    its claude.ai backup are at work; the plan's `ahead` itself is never raised — the backup would follow it on the plan's
    quota): [(slug, plan, installment)], books in the order they run."""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import serial
    t = t or serial.today()
    out = []
    for slug in sorted(serial.all_slugs(), key=lambda s: serial.load_plan(s).get("start", "")):
        plan = serial.load_plan(slug)
        edge = t + dt.timedelta(days=plan.get("ahead", 21))
        for i in plan.get("installments", []):
            if dt.date.fromisoformat(i["date"]) > edge and not os.path.exists(serial.issue_file(i["date"])):
                out.append((slug, plan, i))
    return out[:n]


def sweep_count(budget):
    return min(SWEEP_MAX, int(budget / PER_INSTALLMENT))


def runs_of(day):
    try:
        with open(os.path.join(ROOT, "state", "runs", f"{day}.json"), encoding="utf-8") as f:
            runs = json.load(f)
    except (OSError, ValueError):
        runs = {}
    return runs if isinstance(runs, dict) else {}


def decide(shift):
    def out(go, why, budget=None):
        print(f"go={'yes' if go else 'no'}")
        print(f"budget={BUDGET.get(shift, 0) if budget is None else budget}")
        print(f"why={why}")
    if shift not in BUDGET:
        return out(False, f"unknown shift {shift}")
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return out(False, "no ANTHROPIC_API_KEY secret yet")
    spent = month_total()
    cap = SOFT_CAP if shift in SOFT else MONTH_CAP
    start, end = cycle()
    if start != FIRST_GRANT and dt.datetime.now(dt.timezone.utc) - start < dt.timedelta(hours=QUIET_HOURS):
        return out(False, f"the cycle began {start:%m-%d %H:%M} UTC: its first {QUIET_HOURS} hours spend nothing, the new credits may not be there yet")
    if spent >= cap:
        return out(False, f"this cycle's spend {spent} USD has reached {cap} (the credits expire {end:%m-%d} 00:00 UTC)")
    if shift == "rescue":
        day = now().strftime("%Y-%m-%d")
        runs = runs_of(day)
        got = [g for g in ("1", "2", "3") if g in runs]
        if not got:
            return out(True, "shifts 1-3 all silent: the weekly quota looks spent")
        if len(got) == 3:
            return out(False, "shifts 1-3 all reported: the quota is working")
        # 救援放寬 (the owner, 2026-11-11): a quota that ran out in the middle of the night leaves some of shifts 1-3
        # reported and shifts 4 and 5 dead. Shift 4 alone being silent proves nothing at 06:30 (on a match night it
        # reported at 06:38), so it also has to have pushed nothing since it should have started.
        if "4" in runs or "5" in runs:
            return out(False, f"shifts {','.join(got)} and a later one reported: the quota is working")
        act = activity(day)
        if act is None:
            return out(False, "shift 4 has not reported, but GitHub would not list the commits: leaving it to shift 5 and the reserves")
        if act:
            return out(False, "shift 4 has not reported yet but is pushing: the quota is working")
        return out(True, f"only shifts {','.join(got)} reported and shift 4 has pushed nothing since 05:20: the quota looks spent")
    if shift == "column":
        d, cols = column_work()
        if d is None:
            return out(False, "after 00:20 the coming issue belongs to the night shifts")
        if not cols:
            return out(False, f"{d}: {', '.join(COLUMNS)} already written or not due")
        return out(True, f"{d}: {', '.join(cols)}; cycle so far {spent} USD")
    if shift == "mend":
        d, cols = mend_work()
        if d is None:
            return out(False, "not between 03:45 and 04:45: shifts 1-3 may still be writing, or shift 4 is too near")
        if not cols:
            return out(False, "shifts 1-3 left nothing missing")
        return out(True, f"{d}: {', '.join(cols)} missing after shifts 1-3")
    if shift == "sweep":
        room, left = sweep_room(spent)
        if left >= SWEEP_DAYS:
            return out(False, f"{left} days of the cycle left (to {end:%m-%d}): the sweep runs on the last {SWEEP_DAYS}")
        budget = min(float(BUDGET["sweep"]), room)
        n = len(sweep_list(sweep_count(budget)))
        if not n:
            return out(False, f"nothing to sweep: {room} USD free of the soft cap, or no installment left to translate")
        return out(True, f"{n} installments; cycle so far {spent} USD, {room} free with {left} days left", round(budget, 2))
    return out(True, f"cycle so far {spent} USD (to {end:%m-%d})")


def work(shift):
    """What the column, mend and sweep shifts are to write now, for their instructions (editorial/api-shifts/)."""
    if shift == "sweep":
        budget = min(float(BUDGET["sweep"]), sweep_room()[0])
        todo = sweep_list(sweep_count(budget))
        if not todo:
            return print("沒有要譯的。")
        print("額度到期前清倉：這次最多譯 %d 回（照順序，一批 5 回）" % len(todo))
        for slug, plan, i in todo:
            print("  第 %d 回  %s  %s %s（%d／%d）  %d 字  原文 state/serial/%s/src/%03d.json  譯名表 state/serial/%s.md" % (
                i["n"], i["date"], i["part"], i["chapter"], i["piece"], i["pieces"], i["words"], slug, i["n"], slug))
        return None
    d, cols = column_work() if shift == "column" else mend_work(gate=False)
    if not cols:
        return print("沒有要寫的。" if shift == "column" else "沒有要補的。")
    print("刊期：%s" % d)
    print("%s：%s" % ("本班要寫" if shift == "column" else "要補的欄位", "、".join(cols)))
    return None


def record(shift, path, budget=None):
    try:
        with open(path, encoding="utf-8") as f:
            r = json.load(f)
    except (OSError, ValueError):
        r = {}
    if not isinstance(r, dict):
        r = {}
    usd = float(r.get("total_cost_usd") or 0)
    sub = r.get("subtype") or ("error" if r.get("is_error") else "")
    if "total_cost_usd" not in r:
        # a run that died without its JSON (a timeout, a crash) still spent something nobody can read here: count the
        # whole budget it was given, so that the caps err on the side of stopping early (audit 2026-11-11)
        try:
            usd = float(budget) if budget else float(BUDGET.get(shift, 0))
        except ValueError:
            usd = float(BUDGET.get(shift, 0))
        sub = "unknown"
    print(f"結果（{shift}，{sub or 'success'}，{usd:.2f} USD）：")
    print(str(r.get("result") or "（沒有輸出）")[:1500])
    d = load()
    d["runs"].append({"at": now().isoformat(timespec="minutes"), "shift": shift, "usd": round(usd, 3), "status": sub or "success"})
    d["runs"] = d["runs"][-400:]
    os.makedirs(os.path.dirname(SPEND), exist_ok=True)
    with open(SPEND, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"本期累計 {month_total(d)} USD（這期額度 {cycle()[1]:%m-%d} 00:00 UTC 到期）")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "decide" and len(sys.argv) > 2:
        decide(sys.argv[2])
    elif cmd == "record" and len(sys.argv) > 3:
        record(sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else None)
    elif cmd in ("column", "mend", "sweep"):
        work(cmd)
    elif cmd == "month":
        print(month_total())
    else:
        sys.exit(__doc__)
