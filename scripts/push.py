#!/usr/bin/env python3
"""出刊通知: tell the reader's phone that the day's issue is out (Web Push; no AI, no paid service).

notify.yml runs this at 07:30 Taiwan time (started by wire.yml's half-hour relay at 07:00, with GitHub's own schedules as
backup); the device's own push service (Apple's, for the iPhone home-screen app) delivers it. Sending needs the VAPID private key in the VAPID_PRIVATE_KEY secret; its public half is
content/config.json → push.key. The devices are listed in state/push/devices.json: on the phone, 設定 → 出刊通知 →
複製裝置代碼, then `add` that code, commit and push; notify.yml sends the new device a test notification.

  python3 scripts/push.py add <裝置代碼> [--name iPhone]
  python3 scripts/push.py issue [--date YYYY-MM-DD] [--now]   waits for 07:30, then for the live site; --now skips the 07:30 wait
  python3 scripts/push.py remind [--which noon|evening]         the 12:30 / 21:00 nudge; nothing while a Sunday issue is held
  python3 scripts/push.py test [--new-since <git rev>]          only devices added since that commit
  python3 scripts/push.py late --before <git rev>               a 週日補刊 this push finished (or gave up): tell the phone
  python3 scripts/push.py alert                                 watch.yml found the day out of order: one line to the owner
  python3 scripts/push.py keys <private-key.pem>                a new key pair: every device must subscribe again

`add` needs only the standard library; the others need pywebpush (notify.yml installs it).
"""
import argparse
import base64
import datetime as dt
import hashlib
import json
import os
import subprocess
import sys
import time
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import ROOT, UA, column_meta, expected_columns, load_config, tw_now  # noqa: E402

DEVICES = os.path.join(ROOT, "state", "push", "devices.json")
SITE = "https://wiener-morgen-private.duckdns.org/"
SEND_AT = (7, 30, 20)  # just after 07:30, so an app whose clock runs a little slow already shows the new issue
TOO_LATE = (11, 0)     # a run GitHub starts this late sends nothing: the morning is over (and the run fails, so it is seen)
OPEN_LATE = ("waiting", "regenerating")  # late.json states of a Sunday issue still to come (scripts/late.py OPEN)
# The reminders' hours (Taiwan): the relay starts a run on the hour and the run waits for the half hour; a run that
# GitHub's own schedule brings hours late says nothing after the window (a nudge at 23:40 is noise, not a reminder).
REMIND_WINDOW = {"noon": ((12, 30), (17, 0)), "evening": ((21, 0), (23, 30))}
WAIT_SITE = 45 * 60    # seconds to wait for the live site to carry today's issue
WAIT_DEPLOY = 10 * 60  # seconds to wait for a deploy still running at 07:30 (e.g. a late reserve fill)
TTL = 4 * 3600         # a phone that is switched off still gets the notice within this time


def endpoint_hash(endpoint):
    """What index.json lists (build_index.py), so the app's settings page can tell this device is on the list."""
    return hashlib.sha256(endpoint.encode()).hexdigest()[:16]


def load_devices():
    if not os.path.exists(DEVICES):
        return []
    with open(DEVICES, encoding="utf-8") as f:
        return json.load(f).get("devices") or []


def save_devices(devs):
    os.makedirs(os.path.dirname(DEVICES), exist_ok=True)
    with open(DEVICES, "w", encoding="utf-8") as f:
        json.dump({"devices": devs}, f, ensure_ascii=False, indent=2)
        f.write("\n")


def decode_code(code):
    """裝置代碼 = "RMP1." + base64url(PushSubscription.toJSON()), made by assets/notify.js."""
    code = "".join(code.split())
    if not code.startswith("RMP1."):
        sys.exit("裝置代碼不正確：應以 RMP1. 開頭")
    raw = code[5:]
    try:
        sub = json.loads(base64.urlsafe_b64decode(raw + "=" * (-len(raw) % 4)))
    except ValueError as e:
        sys.exit("裝置代碼不正確：%s" % e)
    ep, keys = sub.get("endpoint"), sub.get("keys") or {}
    if not (isinstance(ep, str) and ep.startswith("https://") and keys.get("p256dh") and keys.get("auth")):
        sys.exit("裝置代碼不完整，請在 App 裡重新複製")
    return {"endpoint": ep, "keys": {"p256dh": keys["p256dh"], "auth": keys["auth"]}}


def send(devs, payload):
    """Send to every device. Returns 0 when it reached one, or when nothing is left to retry."""
    from py_vapid import Vapid
    from pywebpush import WebPushException, webpush
    pem = os.environ.get("VAPID_PRIVATE_KEY", "").strip()
    if not pem:
        sys.exit("::error::缺少 VAPID_PRIVATE_KEY（GitHub → Settings → Secrets and variables → Actions）")
    key = Vapid.from_pem(pem.encode())
    data = json.dumps(payload, ensure_ascii=False)
    sent, dead, failed = 0, [], 0
    for d in devs:
        try:
            # a fresh claims dict each time: webpush() writes this endpoint's origin into it as "aud"
            webpush(d["subscription"], data, vapid_private_key=key, vapid_claims={"sub": SITE.rstrip("/")},
                    ttl=TTL, headers={"Urgency": "high"}, timeout=30)
            sent += 1
            print("已送出：%s" % d["name"])
        except WebPushException as e:
            status = getattr(e.response, "status_code", None)
            if status in (404, 410):  # the app was removed, or notifications were turned off on the device
                dead.append(d["subscription"]["endpoint"])
                print("::warning::%s 已失效（%s），從名單移除" % (d["name"], status))
            else:
                failed += 1
                print("::error::%s 送不出去：%s" % (d["name"], str(e).splitlines()[0]))
        except Exception as e:  # noqa: BLE001 — network trouble: count it and try the other devices
            failed += 1
            print("::error::%s 送不出去：%s: %s" % (d["name"], type(e).__name__, e))
    if dead:
        save_devices([d for d in load_devices() if d["subscription"]["endpoint"] not in dead])
    if sent and os.environ.get("GITHUB_OUTPUT"):
        # for notify.yml's step 「Sent」: the exit code cannot say this (0 also means "nothing left to retry")
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as f:
            f.write("sent=yes\n")
    return 0 if sent or not failed else 1


def fetch(path):
    req = urllib.request.Request("%s%s?t=%d" % (SITE, path, time.time()), headers={"User-Agent": UA, "Cache-Control": "no-cache"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8")


def main_head():
    """The newest commit on main right now (the checkout is from when the run started)."""
    out = subprocess.run(["git", "ls-remote", "origin", "refs/heads/main"], cwd=ROOT, capture_output=True, text=True, timeout=60)
    return out.stdout.split()[0] if out.returncode == 0 and out.stdout else None


# The morning notice: a title and a line, nothing about the day's articles (the owner, 2026-11-02: not what is in, not
# how many, not how long). Two moods — 文藝 and 俏皮 — and the date picks the mood and the lines, so it reads as chance
# but never repeats within a day's reruns. REMIND is the evening nudge (notify.yml 21:00 Taiwan) for a day not yet
# finished; sw.js drops it on the phone when the issue is already read through.
MOODS = {
    "文藝": {
        "titles": ["早安。報紙比天亮得早一點", "油墨還沒乾，日子已經開始", "一份報紙，一個讀者，一個早晨", "知更鳥叫了，字排好了", "今天這一期，印給你一個人",
                   "清晨五點半的字，等七點半的你", "紙還是涼的，咖啡是熱的"],
        "bodies": ["先讀一段，再去當大人。", "世界昨夜又轉了一圈，這裡替你抄了筆記。", "不急，字會等人，咖啡不會。", "讀報是一天裡最安靜的那幾分鐘。",
                   "有人替你把夜裡發生的事折好了。", "把今天先翻開，再把今天過完。", "字很小，早晨很大。"],
    },
    "俏皮": {
        "titles": ["早安，報紙到了", "印刷機剛停，你的那份在這", "知更鳥比鬧鐘準時", "出爐了，趁熱", "報童在門口，開門", "演算法還在睡，知更鳥叫了",
                   "翻開吧，昨天的已經讀完了"],
        "bodies": ["咖啡先放著，先翻這個。", "病人進來前讀得完，別裝忙。", "三分鐘的事，別拖成一天的事。", "今天也沒有廣告，只有正事和閒事。",
                   "別存起來晚點看，晚點你不會看。", "先讀短的也行，反正不會考。", "把這期讀完，郵票才蓋得出來。"],
    },
}
REMIND = {  # 21:00
    "文藝": [("今天的報紙還攤在桌上", "晚上了，剩下的幾篇還亮著燈。"), ("有幾頁還沒翻", "睡前讀完，今天才算收好。"), ("知更鳥還沒回巢", "你的那一期還差一點。")],
    "俏皮": [("報紙還沒讀完", "郵票還沒蓋，今天不算數。"), ("還差幾篇，別裝沒看到", "讀完再睡，很快。"), ("今天的報紙在等你", "它不會自己讀完。")],
}
REMIND_NOON = {  # 12:30
    "文藝": [("午安。早上的報紙還沒看完", "吃飯的時候，正好讀一篇。"), ("半天過去了，字還在原處", "午休比想像中長，夠讀兩篇。"), ("報紙在桌角等中午", "先吃飯，再讀一段。")],
    "俏皮": [("午休先別滑別的", "早上那期還沒讀完，便當配一篇。"), ("中午了，報紙還熱著嗎", "再不讀，晚上會被提醒第二次。"), ("半天了，還差幾篇", "吃飯配報紙，古典的吃法。")],
}


def _day(date):
    return sum((i + 1) * int(x) for i, x in enumerate(date.split("-")))


def issue_payload(cfg, issue):
    """Title and body from MOODS by date; nothing about the issue's contents."""
    if not any(a.get("title") for a in issue["articles"]):
        return None
    d = _day(issue["date"])
    mood = MOODS["文藝" if d % 2 else "俏皮"]
    return {"kind": "issue", "date": issue["date"], "title": mood["titles"][d % len(mood["titles"])],
            "body": mood["bodies"][(d // 3) % len(mood["bodies"])], "url": "./#/", "tag": "issue-" + issue["date"], "badge": 1}


def remind_payload(date, noon=False):
    """The noon or evening nudge; the mood is the other one from the morning's, so the day gets both voices."""
    d = _day(date)
    pool = (REMIND_NOON if noon else REMIND)["俏皮" if d % 2 else "文藝"]
    # d grows by 3 a day, so a mood comes back every other day with d six higher: by d // 6 its three lines take turns.
    # By d // 2 the index moved by three each time — the same line of each mood all month, four of the six never said
    # (audit 2026-11-11).
    title, body = pool[(d // 6) % len(pool)]
    return {"kind": "remind", "date": date, "title": title, "body": body, "url": "./#/", "tag": "remind-" + date}


def live_late():
    """content/late.json on the live site (scripts/late.py): {} when there is none."""
    try:
        data = json.loads(fetch("content/late.json"))
        return data if isinstance(data, dict) else {}
    except Exception:  # noqa: BLE001 — no file yet, or the site briefly unreachable
        return {}


def late_state(date):
    """late.json's state for the day, or None. The live site first; when it has no entry for the day, the run's own
    checkout: notify.yml checks out main as it starts and fill.yml pushes late.json before its deploy, so the local
    copy can be ahead of the site for a few minutes, never behind by more than the run's own age."""
    entry = live_late().get(date)
    if not entry:
        try:
            with open(os.path.join(ROOT, "content", "late.json"), encoding="utf-8") as f:
                entry = json.load(f).get(date)
        except (OSError, ValueError, AttributeError):
            entry = None
    return (entry or {}).get("state") if isinstance(entry, dict) else None


def late_notice(date):
    """07:30 on a Sunday held for 週日補刊: say why the issue is not there, instead of announcing it."""
    return {"title": "早安，今天這期延到下午", "body": "本週的 AI 額度凌晨用完了。週日不拿備稿充數：下午 3 點額度重置後整期重寫，出齊再叫你。",
            "url": "./#/", "tag": "issue-" + date}


def unfinished_notice(date):
    """A 週日補刊 given up (late.py giveup → state "unfinished"): one apology, on the issue's own tag, in place of the
    evening nudge — the reader must not be told to finish a paper that never came (the owner, 2026-11-08)."""
    return {"kind": "issue", "date": date, "title": "今天的補刊沒能全部完成，抱歉", "body": "明天 07:30 照常出刊。",
            "url": "./#/", "tag": "issue-" + date}


def missing_columns(cfg, issue):
    """Columns the issue still needs, in the paper's order. Counted by column, not by number: the serial (written days
    ahead) and the watch items are not expected, so they must not stand in for a missing main column (audit
    2026-11-08). The verse (devotion) is not an article in index.json, so it is not looked for there."""
    d = dt.date.fromisoformat(issue["date"])
    have = {a["column"] for a in issue["articles"]}
    return [c for c in expected_columns(cfg, d) if column_meta(cfg, c, d)["group"] != "verse" and c not in have]


def partial_notice(cfg, date, missing):
    """A weekday issue announced with a column short: the notice says so instead of 「出爐了」. Not the contents, not the
    count of articles (the owner's rule of 2026-11-02 stands: a notice says nothing about what is in the paper) — a
    column that did not make it is the paper's state, not its contents, so it is named, by the name the reader knows
    it by, with the promise that the paper will call again when it is filled (fill.yml starts notify.yml then, and the
    ordinary notice on the same tag replaces this one on the phone). One voice for this, whatever the day's mood: the
    owner also reads it as the morning's first word that shift 5 or the fill did not get there."""
    d = dt.date.fromisoformat(date)
    names = "、".join("「%s」" % (column_meta(cfg, c, d) or {}).get("name", c) for c in missing)
    title = "早安，今天少幾欄" if len(missing) > 1 else "早安，今天少一欄"
    # The promise only when a reserve can fill every missing column: 快訊 (config.json reserve: false) is written again
    # only by the 17:37 shift, which calls no one, and while it is short fill.yml never calls either (audit c42).
    promise = all((cfg["columns"].get(c) or {}).get("reserve", True) for c in missing)
    return {"kind": "issue", "date": date, "title": title,
            "body": "%s沒趕上，其餘先讀%s" % (names, "；補上了會再叫你。" if promise else "。"),
            "url": "./#/", "tag": "issue-" + date, "badge": 1}


def silent_on_main(date):
    """Shifts without a report for the day, read from origin/main this minute (the run's checkout may be an hour old)."""
    try:
        subprocess.run(["git", "fetch", "-q", "origin", "main"], check=False, timeout=60)
        out = subprocess.run(["git", "show", "origin/main:state/runs/%s.json" % date], capture_output=True, text=True, timeout=30)
        runs = json.loads(out.stdout) if out.returncode == 0 else {}
    except Exception:  # noqa: BLE001 — no git, no file: treat every shift as silent only if nothing can be read
        runs = {}
    return [g for g in "12345" if g not in runs]


def cmd_issue(a):
    devs = load_devices()
    if not devs:
        print("沒有登記的裝置，不發通知。")
        return 0
    cfg = load_config()
    now = tw_now()
    date = a.date or now.date().isoformat()
    if not a.now:
        if (now.hour, now.minute) >= TOO_LATE:
            # The morning is over: nothing goes out, and the run fails where the owner can see it. An exit 0 here
            # counted as "sent" for notify.yml's dedup on 2026-11-08 (both morning schedules ran after 09:50), and the
            # day passed without a notice and without a word about it.
            print("::error::已過 %02d:%02d 才輪到出刊通知，今天沒有發出。" % TOO_LATE)
            return 1
        at = now.replace(hour=SEND_AT[0], minute=SEND_AT[1], second=SEND_AT[2], microsecond=0)
        if now < at:
            print("等到 %s 再發……" % at.strftime("%H:%M:%S"), flush=True)
            time.sleep((at - now).total_seconds())
    # Send what the reader will see: today's issue on the live site, after the newest deploy if one is still running
    # (--now skips the 07:30 wait, not this: fill.yml starts a --now run right after its deploy, and the notice must
    # describe the filled paper, not the one still on the site). A Sunday issue short of columns is either held for
    # 週日補刊 or filled from the reserves, both by fill.yml (07:12–07:22; the relay starts it, GitHub's own schedule
    # ran 3 h late on 11-08): wait for that to reach the site, up to WAIT_SITE. On other days a partial issue is
    # announced after WAIT_DEPLOY, and the notice says which column is short (partial_notice).
    sunday = dt.date.fromisoformat(date).weekday() == 6
    start, payload, held, missing = time.time(), None, False, []
    while True:
        waited = time.time() - start
        if late_state(date) in OPEN_LATE:
            payload = late_notice(date)
            break
        try:
            issue = next((i for i in json.loads(fetch("content/index.json")).get("issues", []) if i.get("date") == date), None)
            payload = issue and issue_payload(cfg, issue)
            missing = missing_columns(cfg, issue) if issue else []
            current = fetch("content/version.txt").strip() == main_head()
            held = bool(sunday and not a.now and (issue is None or missing))
        except Exception as e:  # noqa: BLE001
            print("讀不到網站：%s" % e, flush=True)
            current = False
        if held and silent_on_main(date):
            # Judged here, at once, by late.py's own rule (a Sunday, columns missing, shifts that never reported):
            # waiting WAIT_SITE for fill.yml to write late.json first meant announcing a paper missing its main columns
            # at 08:15 and announcing it again when the 補刊 was done. Shift 5 reports by 07:20; at 07:30 a silent
            # shift is the quota, not a shift still pushing.
            payload = late_notice(date)
            break
        # after a fill (fill.yml → notify.yml mode=filled) this is the promised call: wait for the filled paper as long
        # as for a morning's, and go as soon as the site carries it whole (audit c28)
        if payload and (current or (a.after_fill and not missing)
                        or waited >= (WAIT_SITE if held or a.after_fill else WAIT_DEPLOY)):
            break
        if waited >= WAIT_SITE:
            print("::error::網站上還沒有 %s 的刊期，沒有發通知" % date)
            return 1
        time.sleep(30)
    if a.after_fill and missing and payload.get("kind") == "issue":
        # The site still shows the paper short: 07:30 already said so, and saying it again with 「補上了會再叫你」
        # would break that promise a second time (audit c28). Nothing goes out, and the run fails where it is seen.
        print("::error::補位後網站上的 %s 仍缺 %s，沒有發通知" % (date, "、".join(missing)))
        return 1
    if payload.get("kind") == "issue" and missing:
        payload = partial_notice(cfg, date, missing)
    if payload.get("kind") == "issue":
        # A night the shifts did not get through, filled from the reserves by fill.yml: said in front of the day's
        # line, or the owner reads 「今天少一欄」 (or the ordinary notice) and never learns that the rest is reserve.
        # The paper's state, not its contents (the rule of 2026-11-02). The serial is written days ahead: not counted.
        arts = [x for x in issue["articles"] if x.get("column") != "serial"]
        if sum(1 for x in arts if x.get("from_reserve")) * 2 > len(arts):
            payload["body"] = "昨晚排班沒跑完，今天多數是備稿。" + payload["body"]
    print(json.dumps(payload, ensure_ascii=False, indent=1))
    return send(devs, payload)


def cmd_remind(a):
    """notify.yml at 12:30 and 21:00 Taiwan (the relay starts the run on the hour, the schedules are backup): nudge about
    today's issue when it is on the live site. The phone decides whether to show it (sw.js drops it when the issue was
    finished); here we check that there is an issue to finish. Nothing while a Sunday issue is held or being written
    again (late.json waiting/regenerating): the 07:30 notice said it comes in the afternoon, the app keeps the parcel
    sealed, and cmd_late announces the finished 補刊 — a nudge in between would tell the reader to finish a paper the
    paper itself says is not out. A 補刊 given up ("unfinished") gets one apology instead of the nudge."""
    devs = load_devices()
    if not devs:
        print("沒有登記的裝置，不發通知。")
        return 0
    now = tw_now()
    date = a.date or now.date().isoformat()
    which = a.which or ("noon" if now.hour < 17 else "evening")
    if a.which:  # a relay or schedule run keeps to its window; a manual run (no --which) says it whenever asked
        (h0, m0), (h1, m1) = REMIND_WINDOW[which]
        at = now.replace(hour=h0, minute=m0, second=0, microsecond=0)
        if now < at and (at - now) <= dt.timedelta(hours=1):
            print("等到 %s 再提醒……" % at.strftime("%H:%M"), flush=True)
            time.sleep((at - now).total_seconds())
        elif now < at or (now.hour, now.minute) >= (h1, m1):
            print("現在 %s，不在 %s 提醒的時段（%02d:%02d–%02d:%02d），不提醒。" % (now.strftime("%H:%M"), which, h0, m0, h1, m1))
            return 0
    state = late_state(date)
    if state in OPEN_LATE:
        print("%s 是週日補刊（%s）：出齊時另有「補刊出爐了」的通知，不提醒。" % (date, state))
        return 0
    if state == "unfinished":
        payload = unfinished_notice(date)
        print(json.dumps(payload, ensure_ascii=False, indent=1))
        return send(devs, payload)
    try:
        issue = next((i for i in json.loads(fetch("content/index.json")).get("issues", []) if i.get("date") == date), None)
    except Exception as e:  # noqa: BLE001
        print("讀不到網站：%s" % e)
        return 1
    if not issue or not any(x.get("title") for x in issue.get("articles", [])):
        print("網站上沒有 %s 的刊期，不提醒。" % date)
        return 0
    payload = remind_payload(date, noon=which == "noon")
    print(json.dumps(payload, ensure_ascii=False, indent=1))
    return send(devs, payload)


def cmd_late(a):
    """notify.yml on a push that changed content/late.json: if it finished a 週日補刊, announce that issue; if it gave
    one up (late.py giveup → "unfinished"), send the apology at once rather than at 21:00 — the owner learns the same
    minute, from the phone, that the day's paper is not coming (watch.yml opens the GitHub issue)."""
    now = json.load(open(os.path.join(ROOT, "content", "late.json"), encoding="utf-8"))
    old = subprocess.run(["git", "show", "%s:content/late.json" % a.before], cwd=ROOT, capture_output=True, text=True)
    try:
        before = json.loads(old.stdout) if old.returncode == 0 else {}
    except ValueError:
        before = {}

    def turned(state):
        return [d for d, v in now.items() if v.get("state") == state and (before.get(d) or {}).get("state") != state]
    devs = load_devices()
    gave_up = turned("unfinished")
    if gave_up:
        if not devs:
            print("沒有登記的裝置，不發通知。")
            return 0
        payload = unfinished_notice(max(gave_up))
        print(json.dumps(payload, ensure_ascii=False, indent=1))
        return send(devs, payload)
    dates = turned("done")
    if not dates:
        print("這次推送沒有完成週日補刊，不發通知。")
        return 0
    date, cfg = max(dates), load_config()
    if not devs:
        print("沒有登記的裝置，不發通知。")
        return 0
    start = time.time()
    while True:  # wait for the deploy that carries the finished issue
        try:
            issue = next((i for i in json.loads(fetch("content/index.json")).get("issues", []) if i.get("date") == date), None)
            if issue and fetch("content/version.txt").strip() == main_head():
                break
        except Exception as e:  # noqa: BLE001
            print("讀不到網站：%s" % e, flush=True)
        if time.time() - start >= WAIT_SITE:
            print("::error::網站上還沒有 %s 的補刊，沒有發通知" % date)
            return 1
        time.sleep(30)
    payload = issue_payload(cfg, issue)
    payload["title"] = "補刊出爐了，第 %d 期" % issue["no"]
    print(json.dumps(payload, ensure_ascii=False, indent=1))
    return send(devs, payload)


def cmd_alert(a):
    """notify.yml mode=alert, started by watch.yml when its check of the day finds something wrong or fails on the way:
    one line to the owner's phone, the only channel known to reach him. It says that something is off, not what — the
    day's GitHub issue has the report — and nothing about the paper's contents. notify.yml keeps it to one a day."""
    devs = load_devices()
    if not devs:
        print("沒有登記的裝置，不發通知。")
        return 0
    payload = {"title": "今天出刊有狀況", "body": "流程有一步沒走完。細節記在 GitHub 的 issue，跟編輯部說一聲就會去查。",
               "url": "./#/", "tag": "alert-" + tw_now().date().isoformat()}
    print(json.dumps(payload, ensure_ascii=False, indent=1))
    return send(devs, payload)


def cmd_test(a):
    devs = load_devices()
    if a.new_since:
        old = subprocess.run(["git", "show", "%s:state/push/devices.json" % a.new_since], cwd=ROOT, capture_output=True, text=True)
        try:
            seen = {d["subscription"]["endpoint"] for d in json.loads(old.stdout).get("devices") or []} if old.returncode == 0 else set()
        except ValueError:
            seen = set()
        devs = [d for d in devs if d["subscription"]["endpoint"] not in seen]
    if not devs:
        print("沒有新加入的裝置。")
        return 0
    return send(devs, {"title": "通知開好了", "body": "之後每天 07:30 新的一期一出爐，我就叫你。", "url": "./#/", "tag": "test"})


def cmd_add(a):
    sub = decode_code(a.code)
    devs = load_devices()
    again = any(d["subscription"]["endpoint"] == sub["endpoint"] for d in devs)
    devs = [d for d in devs if d["subscription"]["endpoint"] != sub["endpoint"]]
    devs.append({"name": a.name, "added": tw_now().date().isoformat(), "subscription": sub})
    save_devices(devs)
    print("%s %s（%s），共 %d 台裝置。" % ("已更新" if again else "已加入", a.name, endpoint_hash(sub["endpoint"]), len(devs)))
    if not again:
        print("commit 並推送 state/push/devices.json 後，notify.yml 會送它一則測試通知。")
    return 0


def cmd_keys(a):
    from cryptography.hazmat.primitives import serialization
    from py_vapid import Vapid
    v = Vapid()
    v.generate_keys()
    v.save_key(a.out)
    os.chmod(a.out, 0o600)
    raw = v.public_key.public_bytes(serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint)
    print("私鑰寫在 %s（放進 VAPID_PRIVATE_KEY secret，不要 commit）" % a.out)
    print("config.json → push.key：%s" % base64.urlsafe_b64encode(raw).decode().rstrip("="))
    return 0


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("add")
    s.add_argument("code")
    s.add_argument("--name", default="iPhone")
    s = sub.add_parser("issue")
    s.add_argument("--date")
    s.add_argument("--now", action="store_true", help="skip the 07:30 wait and the 11:00 cut-off (manual run, or fill.yml after a fill)")
    s.add_argument("--after-fill", action="store_true", help="fill.yml after a fill: wait for the filled paper; never announce it short again")
    s = sub.add_parser("remind")
    s.add_argument("--date")
    s.add_argument("--which", choices=sorted(REMIND_WINDOW), help="noon (12:30) or evening (21:00); omitted: by the clock, at once")
    s = sub.add_parser("test")
    s.add_argument("--new-since")
    s = sub.add_parser("late")
    s.add_argument("--before", required=True)
    sub.add_parser("alert")
    s = sub.add_parser("keys")
    s.add_argument("out")
    a = p.parse_args()
    return {"add": cmd_add, "issue": cmd_issue, "remind": cmd_remind, "test": cmd_test, "late": cmd_late, "alert": cmd_alert,
            "keys": cmd_keys}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
