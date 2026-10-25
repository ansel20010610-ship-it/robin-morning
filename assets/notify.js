// 出刊通知: the 07:30 notice that today's issue is out (Web Push). scripts/push.py sends it from notify.yml to the
// devices in state/push/devices.json; a device joins that list when the 裝置代碼 copied here is added there.
import { esc, toast } from "./util.js";
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
      } catch (err) { toast(err.message || "無法開啟通知，請再試一次"); }
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
    e.currentTarget.disabled = true;
    try { await sub.unsubscribe(); toast("已關閉出刊通知；之後要再開，需要重新傳一次裝置代碼"); }
    catch { toast("無法關閉，請再試一次"); }
    again();
  });
}

// Opening the paper answers the notice: clear the home-screen badge and the notices still on the lock screen.
export function clearNotices() {
  navigator.clearAppBadge?.().catch(() => {});
  navigator.serviceWorker?.getRegistration().then((r) => r?.getNotifications?.() || []).then((ns) => ns.forEach((n) => n.close())).catch(() => {});
}
