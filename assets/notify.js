// 出刊通知: the 07:30 notice that today's issue is out (Web Push). scripts/push.py sends it from notify.yml to the
// devices in state/push/devices.json; a device joins that list when the 裝置代碼 copied here is added there.
import { esc, toast, store, within } from "./util.js";
import { isWebKitITP, isStandaloneIOS } from "./spotify.js";

const supported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
const b64u = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const codeOf = (sub) => "RMP1." + b64u(new TextEncoder().encode(JSON.stringify(sub.toJSON())));

// The short hash index.json lists for each registered device (scripts/push.py endpoint_hash).
async function hashOf(endpoint) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(endpoint));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

// The service worker registers after the first page has drawn; on a page that never gets one, give up after a while.
async function registration() {
  const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((res) => setTimeout(res, 4000))]);
  if (!reg) throw new Error("App 還在載入，請稍後再打開這一頁");
  return reg;
}

async function currentSub(key) {
  const sub = await (await registration()).pushManager.getSubscription();
  // Made with an earlier key (config.json → push.key changed): no notice can reach it, so start over.
  const k = sub?.options?.applicationServerKey;
  if (sub && k && b64u(k) !== key) { await sub.unsubscribe().catch(() => {}); return null; }
  return sub;
}

// The 出刊通知 section of the settings page; `registered` is index.json's list of device hashes.
export async function renderPush(el, cfg, registered = []) {
  const key = cfg.push?.key;
  const say = (html) => { el.innerHTML = `<h2>出刊通知</h2>${html}`; };
  const again = () => renderPush(el, cfg, registered);
  if (!key) return say("<p>出刊通知尚未設定。</p>");
  if (!supported()) {
    return say(isWebKitITP() && !isStandaloneIOS()
      ? "<p>iPhone 要先把晨報加入主畫面（見下方「放到主畫面」），再從主畫面的圖示打開，才能在這裡開啟通知（需要 iOS 16.4 以上）。</p>"
      : "<p>這個瀏覽器不支援通知。</p>");
  }
  if (Notification.permission === "denied") {
    return say(isWebKitITP()
      ? "<p>通知被關掉了。到 iPhone 的「設定 → 通知 → 知更鳥晨間記事」打開「允許通知」，再回到這一頁。</p>"
      : "<p>通知被這個瀏覽器擋下了。在網址列左邊的網站設定裡把「通知」改成允許，再回到這一頁。</p>");
  }
  let sub;
  try { sub = await currentSub(key); } catch (e) { return say(`<p>${esc(e.message)}</p>`); }
  if (!sub) {
    say(`<p>每天台灣時間 ${esc(cfg.publish_time)}，新的一期一到，手機就會跳出通知：頭條、今天有哪些欄，以及速讀要幾分鐘。</p>
      <div class="btns"><button class="btn" data-push-on>開啟出刊通知</button></div>`);
    el.querySelector("[data-push-on]").onclick = async (e) => {
      e.currentTarget.disabled = true;
      try {
        // iOS asks only from a tap, so this stays the first await of the handler
        if ((await Notification.requestPermission()) !== "granted") throw new Error("沒有允許通知");
        await (await registration()).pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: unb64u(key) });
        toast("已允許通知，還差一步：複製裝置代碼");
      } catch (err) { toast(/[一-鿿]/.test(err?.message || "") ? err.message : "無法開啟通知，請再試一次"); } // the browser's own refusal is English: only the app's own words are shown as they are
      again();
    };
    return;
  }
  const on = registered.includes(await hashOf(sub.endpoint));
  say(on
    ? `<p>已開啟。每天 ${esc(cfg.publish_time)} 新的一期一到就會通知你；打開晨報後，主畫面圖示上的紅點會自己消失。</p>
      <div class="btns"><button class="btn ghost" data-push-off>關閉通知</button></div>`
    : `<p>這台裝置已允許通知，還差一步：按「複製裝置代碼」，把代碼傳給製刊的 Claude（在 Mac 上可以用通用剪貼簿直接貼上）。加進出刊名單後，你會先收到一則測試通知。</p>
      <div class="btns"><button class="btn" data-push-code>複製裝置代碼</button><button class="btn ghost" data-push-off>關閉通知</button></div>
      <p class="small">代碼只能用來寄通知給這台裝置，不含任何個人資料。</p>`);
  el.querySelector("[data-push-code]")?.addEventListener("click", async () => {
    const code = codeOf(sub);
    try { await navigator.clipboard.writeText(code); toast("已複製裝置代碼"); }
    catch {
      // no clipboard access: show the code to copy by hand
      if (!el.querySelector(".code-in")) el.querySelector(".btns").insertAdjacentHTML("afterend", `<div class="code-in"><input type="text" readonly aria-label="裝置代碼" value="${esc(code)}"></div>`);
      el.querySelector(".code-in input").select();
      toast("請長按代碼，全選後拷貝");
    }
  });
  el.querySelector("[data-push-off]")?.addEventListener("click", async (e) => {
    // Two presses, as the app's other ways out: one stray tap cost the morning notice until a new 裝置代碼 had been
    // sent and listed again, and the only word on that was a toast after the fact.
    const b = e.currentTarget;
    if (!b.dataset.sure) { b.dataset.sure = "1"; b.textContent = "確定關掉？要再開得重新傳一次代碼"; setTimeout(() => { if (b.isConnected) { delete b.dataset.sure; b.textContent = "關閉通知"; } }, 4000); return; }
    b.disabled = true;
    try { await sub.unsubscribe(); toast("出刊通知關了"); }
    catch { toast("無法關閉，請再試一次"); }
    again();
  });
}

// Opening the paper answers the notice: clear the home-screen badge and the notices still on the lock screen.
export function clearNotices() {
  navigator.clearAppBadge?.().catch(() => {});
  navigator.serviceWorker?.getRegistration().then((r) => r?.getNotifications?.() || []).then((ns) => ns.forEach((n) => n.close())).catch(() => {});
}

// 晚安提醒 (2026-11-28): tell the yard's Worker which yard member this device's reader is (nest-worker.js gnh), so the
// 23:00 goodnight reminder (scripts/push.py goodnight) comes only to a reader in a yard who has not said goodnight; the
// goodnight itself the Worker reads from the yard's own list. Sent only from a device on the notice list, and only when
// it changed since the Worker last took it (rm.gn.told); a device that leaves its yard says so once. Asked again at the next sync.
export async function tellYard(api, yard, registered) {
  try {
    if (!/^https:\/\//.test(api || "") || !Array.isArray(registered) || !navigator.serviceWorker) return;
    const sub = await (await navigator.serviceWorker.getRegistration())?.pushManager?.getSubscription();
    if (!sub) return;
    const h = await hashOf(sub.endpoint), c = yard?.code || null, w = c ? yard.me : null, t = store.get("gn.told");
    if (!registered.includes(h) || (t ? t.h === h && t.c === c && t.w === w : !c)) return;
    const r = await fetch(`${api.replace(/\/$/, "")}/gnh`, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(c ? { h, code: c, member: w } : { h }), keepalive: true, ...within(15000) });
    if (r.ok) store.set("gn.told", { h, c, w });
  } catch { /* no signal, or the Worker not updated yet: the next sync asks again */ }
}

// A finished day, for the 12:30 and 21:00 reminders (scripts/push.py remind; 2026-11-16): iOS shows every push it gets, so the
// phone cannot drop one, and push.py leaves out a device whose reader has finished the day. app.js syncDone decides
// that; this tells the yard's Worker (scripts/nest-worker.js done) under the device's short hash, only for a device on
// the paper's list (index.json `push`), and again only when it changed for the day: a finished day opens again when
// articles are added. What failed or went unconfirmed goes again at the next syncDone. Never throws, shows nothing.
let telling = null, wanted = null;
export function tellDone(api, date, finished, registered) {
  wanted = [api, date, finished, registered];
  telling ||= (async () => { while (wanted) { const w = wanted; wanted = null; await tellOnce(...w).catch(() => {}); } telling = null; })();
}
async function tellOnce(api, date, finished, registered) {
  if (!/^https:\/\//.test(api || "") || !Array.isArray(registered) || !navigator.serviceWorker) return;
  // not currentSub(): it waits for the service worker and drops a subscription made with an older key
  const sub = await (await navigator.serviceWorker.getRegistration())?.pushManager?.getSubscription();
  if (!sub) return; // no notices on this device, or no service worker yet (a first visit): asked again at the next sync
  const h = await hashOf(sub.endpoint), t = store.get("remind.told") || {};
  // an attempt is written down before it goes and confirmed after: a request that reached the Worker but whose answer was
  // lost (the app closed at once) leaves it pending, and a pending day is sent again whichever way it now stands
  const same = t.d === date && t.h === h;
  if (!registered.includes(h) || (same ? t.done === finished && !t.pending : !finished)) return;
  store.set("remind.told", { d: date, h, done: finished, pending: true });
  // text/plain is a simple request, no preflight: one round trip on a weak signal; keepalive: it still goes out when
  // the app is closed right after the last article
  const r = await fetch(`${api.replace(/\/$/, "")}/done`, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ h, d: date, done: finished }), keepalive: true, ...within(15000) });
  if (r.ok) store.set("remind.told", { d: date, h, done: finished });
}
