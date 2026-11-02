#!/usr/bin/env python3
"""出刊通知: tell the reader's phone that the day's issue is out (Web Push; no AI, no paid service).

notify.yml runs this at 07:30 Taiwan time; the device's own push service (Apple's, for the iPhone home-screen app)
delivers it. Sending needs the VAPID private key in the VAPID_PRIVATE_KEY secret; its public half is
content/config.json → push.key. The devices are listed in state/push/devices.json: on the phone, 設定 → 出刊通知 →
複製裝置代碼, then `add` that code, commit and push; notify.yml sends the new device a test notification.

  python3 scripts/push.py add <裝置代碼> [--name iPhone]
  python3 scripts/push.py issue [--date YYYY-MM-DD] [--now]   waits for 07:30 and for the live site, unless --now
  python3 scripts/push.py test [--new-since <git rev>]          only devices added since that commit
  python3 scripts/push.py late --before <git rev>               a 週日補刊 that this push finished: its issue is out
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
TOO_LATE = (11, 0)     # a run GitHub starts this late sends nothing: the morning is over
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
        "titles": ["早安兄弟，報紙到了", "印刷機剛停，你的那份在這", "知更鳥比鬧鐘準時", "出爐了，趁熱", "報童在門口，開門", "演算法還在睡，知更鳥叫了",
                   "翻開吧，昨天的已經讀完了"],
        "bodies": ["咖啡先放著，先翻這個。", "病人進來前讀得完，別裝忙。", "三分鐘的事，別拖成一天的事。", "今天也沒有廣告，只有正事和閒事。",
                   "別存起來晚點看，晚點你不會看。", "先讀短的也行，反正不會考。", "把這期讀完，郵票才蓋得出來。"],
    },
}
REMIND = {  # 21:00
    "文藝": [("今天的報紙還攤在桌上", "晚上了，剩下的幾篇還亮著燈。"), ("有幾頁還沒翻", "睡前讀完，今天才算收好。"), ("知更鳥還沒回巢", "你的那一期還差一點。")],
    "俏皮": [("兄弟，報紙還沒讀完", "郵票還沒蓋，今天不算數。"), ("還差幾篇，別裝沒看到", "讀完再睡，很快。"), ("今天的報紙在等你", "它不會自己讀完。")],
}
REMIND_NOON = {  # 12:30
    "文藝": [("午安。早上的報紙還沒看完", "吃飯的時候，正好讀一篇。"), ("半天過去了，字還在原處", "午休比想像中長，夠讀兩篇。"), ("報紙在桌角等中午", "先吃飯，再讀一段。")],
    "俏皮": [("兄弟，午休先別滑別的", "早上那期還沒讀完，便當配一篇。"), ("中午了，報紙還熱著嗎", "再不讀，晚上會被提醒第二次。"), ("半天了，還差幾篇", "吃飯配報紙，古典的吃法。")],
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
    title, body = pool[(d // 2) % len(pool)]
    return {"kind": "remind", "date": date, "title": title, "body": body, "url": "./#/", "tag": "remind-" + date}


def live_late():
    """content/late.json on the live site (scripts/late.py): {} when there is none."""
    try:
        data = json.loads(fetch("content/late.json"))
        return data if isinstance(data, dict) else {}
    except Exception:  # noqa: BLE001 — no file yet, or the site briefly unreachable
        return {}


def late_notice(date):
    """07:30 on a Sunday held for 週日補刊: say why the issue is not there, instead of announcing it."""
    return {"title": "早安兄弟，今天這期延到下午", "body": "本週的 AI 額度凌晨用完了。週日不拿備稿充數：下午 3 點額度重置後整期重寫，出齊再叫你。",
            "url": "./#/", "tag": "issue-" + date}


def complete(cfg, issue):
    d = dt.date.fromisoformat(issue["date"])
    want = len([c for c in expected_columns(cfg, d) if column_meta(cfg, c, d)["group"] != "verse"])
    return sum(1 for a in issue["articles"] if (column_meta(cfg, a["column"], d) or {}).get("group") != "watch") >= want


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
            print("已過 %02d:%02d，今天不再發出刊通知。" % TOO_LATE)
            return 0
        at = now.replace(hour=SEND_AT[0], minute=SEND_AT[1], second=SEND_AT[2], microsecond=0)
        if now < at:
            print("等到 %s 再發……" % at.strftime("%H:%M:%S"), flush=True)
            time.sleep((at - now).total_seconds())
    # Send what the reader will see: today's issue on the live site, after the newest deploy if one is still running.
    # A Sunday issue still short of columns is either about to be held for 週日補刊 or filled from the reserves, both by
    # fill.yml (07:12–07:22, and GitHub often starts it late): wait for that to reach the site, up to WAIT_SITE, before
    # announcing a partial issue. On other days a partial issue is announced after WAIT_DEPLOY.
    sunday = dt.date.fromisoformat(date).weekday() == 6
    start, payload, held = time.time(), None, False
    while True:
        waited = time.time() - start
        if live_late().get(date, {}).get("state") in ("waiting", "regenerating"):
            payload = late_notice(date)
            break
        try:
            issue = next((i for i in json.loads(fetch("content/index.json")).get("issues", []) if i.get("date") == date), None)
            payload = issue and issue_payload(cfg, issue)
            current = payload and fetch("content/version.txt").strip() == main_head()
            held = bool(sunday and issue and not complete(cfg, issue) and not a.now)
            if current and held:
                current = False
        except Exception as e:  # noqa: BLE001
            print("讀不到網站：%s" % e, flush=True)
            current = False
        if current or (payload and waited >= (WAIT_SITE if held else WAIT_DEPLOY)) or a.now and payload:
            break
        if waited >= WAIT_SITE or a.now:
            print("::error::網站上還沒有 %s 的刊期，沒有發通知" % date)
            return 1
        time.sleep(30)
    print(json.dumps(payload, ensure_ascii=False, indent=1))
    return send(devs, payload)


def cmd_remind(a):
    """notify.yml at 21:00 Taiwan: nudge about today's issue when it is on the live site. The phone decides whether to
    show it (sw.js drops it when the issue was finished); here we only check that there is an issue to finish."""
    devs = load_devices()
    if not devs:
        print("沒有登記的裝置，不發通知。")
        return 0
    now = tw_now()
    date = a.date or now.date().isoformat()
    try:
        issue = next((i for i in json.loads(fetch("content/index.json")).get("issues", []) if i.get("date") == date), None)
    except Exception as e:  # noqa: BLE001
        print("讀不到網站：%s" % e)
        return 1
    if not issue or not any(x.get("title") for x in issue.get("articles", [])):
        print("網站上沒有 %s 的刊期，不提醒。" % date)
        return 0
    payload = remind_payload(date, noon=now.hour < 17)
    print(json.dumps(payload, ensure_ascii=False, indent=1))
    return send(devs, payload)


def cmd_late(a):
    """notify.yml on a push that changed content/late.json: if it finished a 週日補刊, announce that issue."""
    now = json.load(open(os.path.join(ROOT, "content", "late.json"), encoding="utf-8"))
    old = subprocess.run(["git", "show", "%s:content/late.json" % a.before], cwd=ROOT, capture_output=True, text=True)
    try:
        before = json.loads(old.stdout) if old.returncode == 0 else {}
    except ValueError:
        before = {}
    dates = [d for d, v in now.items() if v.get("state") == "done" and (before.get(d) or {}).get("state") != "done"]
    if not dates:
        print("這次推送沒有完成週日補刊，不發通知。")
        return 0
    date, devs, cfg = max(dates), load_devices(), load_config()
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
    return send(devs, {"title": "通知開好了，兄弟", "body": "之後每天 07:30 新的一期一出爐，我就叫你。", "url": "./#/", "tag": "test"})


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
    s.add_argument("--now", action="store_true", help="send at once (manual run)")
    s = sub.add_parser("remind")
    s.add_argument("--date")
    s = sub.add_parser("test")
    s.add_argument("--new-since")
    s = sub.add_parser("late")
    s.add_argument("--before", required=True)
    s = sub.add_parser("keys")
    s.add_argument("out")
    a = p.parse_args()
    return {"add": cmd_add, "issue": cmd_issue, "remind": cmd_remind, "test": cmd_test, "late": cmd_late, "keys": cmd_keys}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
