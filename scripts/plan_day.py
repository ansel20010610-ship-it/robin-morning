#!/usr/bin/env python3
"""Tell the on-duty editor what to write today.

Usage: python3 scripts/plan_day.py [--date YYYY-MM-DD] [--group 1-5]

Lines other tools read (watch.yml greps them, so their prefixes are fixed):
  缺稿：<col>、<col>            expected columns missing or failing validation
  觀測站未查核：<col>、<col>    watch stations with no check record for the day (and no article)
  連載缺稿：第 N 回             today's serial installment is due but absent or fails serial.py check
  設定錯誤：…                   content/config.json is inconsistent (exit 2, nothing else is printed)
  巴薩晨報：…                   (--group 5 only) shift 4 has not reported: whether shift 5 may touch football.json yet
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (GROUPS, ROOT, TARGET_NOTE, WATCH_DIR, WATCH_STATE, WEEKDAY_ZH, active, article_path,  # noqa: E402
                    columns_for_group, expected_columns, issue_number, last_watch_article, load_config, load_json,
                    parse_date, reserve_columns, reserve_target, supplements_for, tw_now, watch_checked, watch_columns)
import late  # noqa: E402
import serial  # noqa: E402
import validate  # noqa: E402


def status(cfg, d, col):
    p = article_path(d, col)
    if not os.path.exists(p):
        return "未完成"
    # Same checks as validate.py, including images and topic_keys already used elsewhere.
    imgs, tops = validate.ledgers_excluding(str(d), col)
    errs, _ = validate.validate_file(cfg, d, col, p, False, imgs, tops)
    return "已完成 ✓" if not errs else "已存在但驗證失敗（%d 個錯誤）" % len(errs)


def watch_status(cfg, d, col):
    """One of four states for a watch station on day d — the owner's rule (2026-11-08): a station without a check
    record was not checked, however quiet the shift's report sounds. 已刊出 (an update ran), 無法判定 (an undetermined
    short piece ran: the next shift must settle it), 已查：靜默 (a "<d> 已查" line in state/watch/, no article), 未查核
    (neither). An article without a log line is still 已刊出, with a reminder: the log is the next shift's baseline."""
    p = article_path(d, col)
    logged = logged_in_state(col, d)
    if os.path.exists(p):
        try:
            st = load_json(p).get("status")
        except (OSError, ValueError):
            st = None
        s = "無法判定（undetermined 短稿，下一班要補查收尾）" if st == "undetermined" else "已刊出"
        return s if logged else s + "；基準檔沒有這天的紀錄，補一行到 state/watch/%s" % WATCH_STATE.get(col, "")
    return "已查：靜默" if logged else "未查核"


def logged_in_state(col, d):
    """Whether state/watch/ alone (not the article) records a check for d — watch_checked() also accepts the article."""
    fn = WATCH_STATE.get(col)
    if not fn:
        return False
    try:
        with open(os.path.join(WATCH_DIR, fn), encoding="utf-8") as f:
            needle = "%s 已查" % d
            return any(needle in line for line in f)
    except OSError:
        return False


def carried_over(cfg, d, col):
    """The previous issue of a watch column when it was undetermined and nothing since says it was settled: no check
    record and no article on any day after it up to d. Returns (date, title) or None."""
    import datetime as dt
    prev = last_watch_article(col, d)
    if not prev or prev[1].get("status") != "undetermined":
        return None
    day = dt.date.fromisoformat(prev[0]) + dt.timedelta(days=1)
    while day <= d:
        if watch_checked(col, day):
            return None
        day += dt.timedelta(days=1)
    return prev[0], prev[1].get("title") or ""


def football_guard(d, now=None):
    """What shift 5 may do with the Barça report while shift 4 has not reported (the owner, 2026-11-08: 先確認第 4 班已回報
    再動巴薩晨報). Shift 4 (05:17) writes the 賽後版 and pushes it in pieces; shift 5 (06:27) updating the same file
    meanwhile overwrote it. So: with no "4" in state/runs, hands off until 06:50; after that, a commit to football.json
    in the last 20 minutes means shift 4 is still pushing (wait to 07:00); otherwise shift 4 is gone and shift 5 takes
    the update over. Returns the line to print, or None when shift 4 reported or there is no football.json to protect
    (a missing column is 缺稿 and is written at once — the first push wins, the other shift rebases onto it)."""
    import datetime as dt
    import subprocess
    if "4" in late.runs_of(d):
        return None
    p = article_path(d, "football")
    if not os.path.exists(p):
        return None
    now = now or tw_now()
    last = None
    try:
        out = subprocess.run(["git", "log", "-1", "--format=%cI", "--", p], capture_output=True, text=True, cwd=ROOT,
                             timeout=20).stdout.strip()
        if out:
            last = dt.datetime.fromisoformat(out.replace("Z", "+00:00")).astimezone(now.tzinfo)
    except (OSError, ValueError, subprocess.SubprocessError):
        last = None
    when = ("最近一次提交 " + last.strftime("%H:%M")) if last else "還沒有任何提交"
    cutoff = now.replace(hour=6, minute=50, second=0, microsecond=0)
    if now.date() == d and now < cutoff:
        return ("巴薩晨報：第 4 班還沒回報，先不要動 football.json（%s）；先做別的，06:50 後再跑一次 "
                "plan_day --group 5 看這一行" % when)
    if last and now - last < dt.timedelta(minutes=20):
        return "巴薩晨報：第 4 班還沒回報，但 football.json 剛有提交（%s），可能還在推賽後版；等到 07:00 再看，仍沒回報才由本班更新" % when
    return "巴薩晨報：第 4 班沒有回報、football.json 最近 20 分鐘沒有提交（%s），由本班接手更新（賽後版照第 9 步）" % when


def serial_line(cfg, d):
    """(text, missing_n): the day's 連載 installment and whether it is on disk and sound. The serial is not an
    expected column — the 製刊 shifts never write it (README) — so a gap is reported on its own line, 連載缺稿, which
    neither the shifts' 缺稿 logic nor fill_from_reserve.py reads."""
    if not active(cfg, "serial", d):
        return "今天不刊", None
    due = serial.due_on(d)
    if not due:
        return "今天不刊（計畫裡沒有這一天的回目）", None
    slug, plan, inst = due
    label = "第 %d 回（%s %s，%d／%d）" % (inst["n"], inst["part"], inst["chapter"], inst["piece"], inst["pieces"])
    if not os.path.exists(serial.issue_file(inst["date"])):
        return label + " 缺", inst["n"]
    errs = []
    serial.check_one(plan, inst, errs.append)
    if errs:
        return label + " 已存在但驗證失敗（%d 個錯誤）" % len(errs), inst["n"]
    return label + " 已完成 ✓", None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date")
    ap.add_argument("--group", type=int, choices=sorted(GROUPS))
    a = ap.parse_args()
    cfg = load_config()
    d = parse_date(a.date)
    # the configuration first: a plan drawn from an inconsistent config.json would send a shift to write a column
    # that does not exist, or quietly leave a supplement out of the week
    bad = validate.check_config(cfg, tw_now().date())
    for e in bad:
        print("設定錯誤：%s" % e)
    if bad:
        return 2
    cols = cfg["columns"]
    print("現在台灣時間：%s" % tw_now().strftime("%Y-%m-%d %H:%M"))
    print("刊期：%s（星期%s）第 %d 期，07:30 發布" % (d, WEEKDAY_ZH[d.weekday()], issue_number(cfg, d)))
    print("今日副刊：" + "、".join("%s（%s）" % (cols[c]["name"], c) for c in supplements_for(cfg, d)))
    print()
    unchecked = [c for c in watch_columns(cfg, d) if not watch_checked(c, d)]
    if a.group:
        print("第 %d 班負責：" % a.group if a.group < 5 else "第 5 班（安全網）負責全刊：")
        for c in columns_for_group(cfg, d, a.group):
            print("  - %-14s %-12s %s" % (c, cols[c]["name"], status(cfg, d, c)))
            print("    規格：editorial/columns/%s.md" % c)
            print("    檔案：content/issues/%s/%s.json" % (d, c))
        if a.group == 5:
            guard = football_guard(d)
            if guard:
                print("  " + guard)
        if a.group == 5 and unchecked:
            # the safety net takes over the stations shift 4 left unchecked (a quota that ran out, or a shift that
            # skipped them): 沒有寫紀錄就不算查過, so the record in state/watch/ is the task, the article only if there is news
            runs = late.runs_of(d)
            why = "第 4 班未回報、也沒有查核紀錄" if "4" not in runs else "第 4 班有回報，但沒留查核紀錄"
            for c in unchecked:
                print("  - %-14s %-12s 未查核（%s）" % (c, cols[c]["name"], why))
                print("    規格：editorial/columns/%s.md；查核紀錄：state/watch/%s" % (c, WATCH_STATE.get(c, "")))
        print()
    print("全刊狀態：")
    missing = []
    for c in expected_columns(cfg, d):
        s = status(cfg, d, c)
        if s != "已完成 ✓":
            missing.append(c)
        print("  - %-14s %-12s %s" % (c, cols[c]["name"], s))
    for c in watch_columns(cfg, d):
        print("  - %-14s %-12s %s" % (c, cols[c]["name"], watch_status(cfg, d, c)))
        prev = carried_over(cfg, d, c)
        if prev:
            print("    前期無法判定（%s %s），今天必須補查並收尾" % prev)
    s_text, s_missing = serial_line(cfg, d)
    print("  - %-14s %-12s %s" % ("serial", cols.get("serial", {}).get("name", "連載"), s_text))
    if missing:
        print("\n缺稿：" + "、".join(missing))
    if unchecked:
        print(("" if missing else "\n") + "觀測站未查核：" + "、".join(unchecked))
    if s_missing:
        print(("" if missing or unchecked else "\n") + "連載缺稿：第 %d 回" % s_missing)
    stock = {c: 0 for c in reserve_columns(cfg)}
    for c, rows in validate.reserve_status(cfg).items():
        if c in stock:
            stock[c] += sum(1 for _, errs, blocking in rows if not errs and not blocking)  # 需修正 (舊規則稿) is not stock
    short = [c for c, n in stock.items() if n < reserve_target(cfg, c)]
    print("\n可用備稿（目標：%s）：%s" % (TARGET_NOTE, "、".join("%s %d" % (c, n) for c, n in stock.items())))
    if short:
        print("備稿不足：" + "、".join(short))
    return 0


if __name__ == "__main__":
    sys.exit(main())
