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
from common import ROOT, UA, expected_columns, load_config, tw_now  # noqa: E402

DEVICES = os.path.join(ROOT, "state", "push", "devices.json")
SITE = "https://wiener-morgen-private.duckdns.org/"
SEND_AT = (7, 30, 20)  # just after 07:30, so an app whose clock runs a little slow already shows the new issue
TOO_LATE = (11, 0)     # a run GitHub starts this late sends nothing: the morning is over
WAIT_SITE = 45 * 60    # seconds to wait for the live site to carry today's issue
WAIT_DEPLOY = 10 * 60  # seconds to wait for a deploy still running at 07:30 (e.g. a late reserve fill)
TTL = 4 * 3600         # a phone that is switched off still gets the notice within this time
SHORT = {"football": "巴薩", "perio": "牙周", "music": "古典", "civilization": "文明", "devotion": "晨光"}


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


def issue_payload(cfg, issue):
    """Title: the issue number. Body: the lead headline, what else is in, and how long the three-sentence briefs take
    (the same estimate as the front page's 今日摘要)."""
    cols = cfg["columns"]
    group = lambda a: cols.get(a["column"], {}).get("group", "supplement")  # noqa: E731
    mains = sorted((a for a in issue["articles"] if group(a) == "main"), key=lambda a: cols[a["column"]].get("order", 9))
    supps = [a for a in issue["articles"] if group(a) == "supplement"]
    if not mains and not supps:
        return None
    lead = (mains or supps)[0]
    rest = "、".join(SHORT.get(a["column"], cols[a["column"]]["name"]) for a in mains[1:])
    n_supp = len(supps) - (0 if mains else 1)
    if n_supp:
        rest += ("，" if rest else "") + "副刊 %d 篇" % n_supp
    chars = sum(len(a.get("brief") or "") for a in issue["articles"])
    lines = [lead["title"], ("還有" + rest) if rest else ""]
    lines.append("一篇三句話，%d 分鐘就能交差" % max(1, int(chars / 330 + 0.5)) if chars else "今天共 %d 篇" % len(issue["articles"]))
    return {"title": "早安兄弟，第 %d 期出爐了" % issue["no"], "body": "\n".join(x for x in lines if x),
            "url": "./#/", "tag": "issue-" + issue["date"], "badge": 1}


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
    want = len(expected_columns(cfg, dt.date.fromisoformat(issue["date"])))
    return sum(1 for a in issue["articles"] if cfg["columns"].get(a["column"], {}).get("group") != "watch") >= want


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
    # On a Sunday an incomplete issue may be about to be held for 週日補刊 (fill.yml can start late): give the
    # reserve fill its WAIT_DEPLOY before announcing a partial issue.
    sunday = dt.date.fromisoformat(date).weekday() == 6
    start, payload = time.time(), None
    while True:
        waited = time.time() - start
        if live_late().get(date, {}).get("state") in ("waiting", "regenerating"):
            payload = late_notice(date)
            break
        try:
            issue = next((i for i in json.loads(fetch("content/index.json")).get("issues", []) if i.get("date") == date), None)
            payload = issue and issue_payload(cfg, issue)
            current = payload and fetch("content/version.txt").strip() == main_head()
            if current and sunday and not complete(cfg, issue) and waited < WAIT_DEPLOY and not a.now:
                current = False
        except Exception as e:  # noqa: BLE001
            print("讀不到網站：%s" % e, flush=True)
            current = False
        if current or (payload and waited >= WAIT_DEPLOY) or a.now and payload:
            break
        if waited >= WAIT_SITE or a.now:
            print("::error::網站上還沒有 %s 的刊期，沒有發通知" % date)
            return 1
        time.sleep(30)
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
    s = sub.add_parser("test")
    s.add_argument("--new-since")
    s = sub.add_parser("late")
    s.add_argument("--before", required=True)
    s = sub.add_parser("keys")
    s.add_argument("out")
    a = p.parse_args()
    return {"add": cmd_add, "issue": cmd_issue, "test": cmd_test, "late": cmd_late, "keys": cmd_keys}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
