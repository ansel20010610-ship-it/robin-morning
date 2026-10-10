// Spotify: in-app listening (embed player) + add to playlist (Web API, PKCE — no server, no secret).
// Endpoints follow Spotify's February 2026 Web API changes (/playlists/{id}/items, POST /me/playlists).
import { esc, inline, store, toast, $, ICON } from "./util.js";

const AUTH = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";
const SCOPES = "playlist-read-private playlist-modify-private playlist-modify-public";

let cfg = { client_id: "", playlist_name: "知更鳥晨間記事・古典" };

export function initSpotify(c) { cfg = { ...cfg, ...(c || {}) }; }
export const hasClient = () => Boolean(cfg.client_id);
export const isLoggedIn = () => Boolean(store.get("sp.token"));
const redirectUri = () => location.origin + location.pathname.replace(/index\.html$/, "");

const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const rand = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return b64url(a).slice(0, n); };

export async function login(returnHash = location.hash) {
  if (!hasClient()) { toast("尚未設定 Spotify Client ID，請見「設定」頁說明"); return; }
  const verifier = rand(64), state = rand(16);
  const challenge = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  store.set("sp.pkce", { verifier, state, returnHash });
  const q = new URLSearchParams({ client_id: cfg.client_id, response_type: "code", redirect_uri: redirectUri(),
    code_challenge_method: "S256", code_challenge: challenge, scope: SCOPES, state });
  location.assign(`${AUTH}?${q}`);
}

export function logout() {
  store.del("sp.token");
  for (const k of Object.keys(localStorage)) if (k.startsWith("rm.sp.resolve.")) localStorage.removeItem(k);
  toast("已中斷 Spotify 連結");
}

function saveToken(t) {
  const old = store.get("sp.token") || {};
  store.set("sp.token", { access: t.access_token, refresh: t.refresh_token || old.refresh, exp: Date.now() + (t.expires_in - 60) * 1000 });
}

async function tokenRequest(params) {
  const r = await fetch(TOKEN, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: cfg.client_id, ...params }) });
  if (!r.ok) throw new Error(`Spotify 授權失敗（${r.status}）`);
  return r.json();
}

// Call on boot. Returns the hash to restore if we just came back from Spotify.
export async function handleCallback() {
  const q = new URLSearchParams(location.search);
  if (!q.has("code") && !q.has("error")) return null;
  const pkce = store.get("sp.pkce");
  history.replaceState(null, "", redirectUri() + (pkce?.returnHash || ""));
  store.del("sp.pkce");
  if (q.get("error")) { toast("Spotify 授權已取消"); return pkce?.returnHash || ""; }
  if (!pkce || q.get("state") !== pkce.state) { toast("Spotify 授權狀態不符，請再試一次"); return ""; }
  try {
    saveToken(await tokenRequest({ grant_type: "authorization_code", code: q.get("code"), redirect_uri: redirectUri(), code_verifier: pkce.verifier }));
    toast("已連結 Spotify");
  } catch (e) { toast(e.message); }
  return pkce.returnHash || "";
}

async function accessToken() {
  const t = store.get("sp.token");
  if (!t) return null;
  if (Date.now() < t.exp) return t.access;
  try { saveToken(await tokenRequest({ grant_type: "refresh_token", refresh_token: t.refresh })); }
  catch { store.del("sp.token"); return null; }
  return store.get("sp.token").access;
}

async function api(path, opts = {}) {
  const tok = await accessToken();
  if (!tok) throw Object.assign(new Error("請先連結 Spotify"), { code: "auth" });
  const r = await fetch(API + path, { ...opts, headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json", ...(opts.headers || {}) } });
  if (r.status === 401) { store.del("sp.token"); throw Object.assign(new Error("Spotify 登入已過期，請重新連結"), { code: "auth" }); }
  if (r.status === 403) throw new Error("Spotify 拒絕這個操作（開發者模式需要 Premium，且帳號須在 App 的使用者名單內）");
  if (r.status === 429) throw new Error("Spotify 請求太頻繁，請稍後再試");
  if (!r.ok) throw new Error(`Spotify 錯誤 ${r.status}`);
  return r.status === 204 ? null : r.json();
}

// ——— Matching the editor's recording description to Spotify ———
const norm = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9㐀-鿿]+/g, " ").trim();
const cacheKey = (sp) => "sp.resolve." + norm(sp.query).slice(0, 80);

function tracksMatching(items, filter) {
  const f = (filter || []).map(norm).filter(Boolean);
  return items.filter((t) => f.every((w) => norm(t.name).includes(w)));
}

async function albumTracks(id, filter) {
  const al = await api(`/albums/${id}`);
  let items = al.tracks?.items || [];
  let next = al.tracks?.next;
  while (next && items.length < 300) {
    const page = await api(next.replace(API, ""));
    items = items.concat(page.items || []);
    next = page.next;
  }
  return { album: al, tracks: tracksMatching(items, filter) };
}

export async function resolve(sp, { force = false, albumId = null } = {}) {
  if (!force && !albumId && sp.tracks?.length) return { tracks: sp.tracks, album: sp.album, source: "editor" };
  const key = cacheKey(sp);
  if (!force && !albumId) { const c = store.get(key); if (c) return c; }
  if (!isLoggedIn()) return null;
  const res = await api(`/search?${new URLSearchParams({ q: sp.query, type: "album", limit: "10" })}`);
  const hint = norm(sp.artist_hint);
  const cands = (res.albums?.items || []).map((a) => {
    const artists = a.artists.map((x) => x.name).join(", ");
    let score = 0;
    if (hint && (norm(artists).includes(hint) || norm(a.name).includes(hint))) score += 3;
    for (const w of sp.track_filter || []) if (norm(a.name).includes(norm(w))) score += 1;
    return { id: a.id, name: a.name, artists, year: (a.release_date || "").slice(0, 4), score };
  }).sort((a, b) => b.score - a.score);
  const order = albumId ? [{ id: albumId }, ...cands.filter((c) => c.id !== albumId)] : cands;
  for (const c of order.slice(0, 6)) {
    const { album, tracks } = await albumTracks(c.id, sp.track_filter);
    if (tracks.length) {
      const out = { album: album.id, albumName: album.name, artists: album.artists.map((x) => x.name).join(", "),
        year: (album.release_date || "").slice(0, 4), tracks: tracks.map((t) => t.id), trackNames: tracks.map((t) => t.name),
        candidates: cands, source: "search" };
      store.set(key, out);
      return out;
    }
  }
  return { tracks: [], candidates: cands, source: "none" };
}

// ——— Player dock (stays open while you keep reading) ———
export function play(trackId, title) {
  const dock = $("#dock");
  $("#dock-frame").src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
  $("#dock-title").textContent = title || "正在播放";
  dock.hidden = false;
  document.documentElement.style.setProperty("--dock-h", dock.offsetHeight + "px");
}
export function initDock() {
  $("#dock-close").addEventListener("click", () => {
    $("#dock-frame").src = "about:blank";
    $("#dock").hidden = true;
    document.documentElement.style.setProperty("--dock-h", "0px");
  });
}

// ——— Playlist sheet ———
async function addToPlaylist(uris, label) {
  const sheet = $("#sheet");
  sheet.innerHTML = `<div class="sheet"><h2>加入 Spotify 歌單</h2><p class="sub">${esc(label)}・${uris.length} 首</p><div class="list"><p class="sub">讀取你的歌單……</p></div>
    <div class="btns" style="margin-top:14px"><button class="btn ghost" data-close>取消</button></div></div>`;
  sheet.querySelector("[data-close]").onclick = () => sheet.close();
  sheet.showModal();
  try {
    const me = await api("/me");
    const pls = await api("/me/playlists?limit=50");
    const mine = (pls.items || []).filter((p) => p.owner?.id === me.id || p.collaborative);
    const def = mine.find((p) => p.name === cfg.playlist_name);
    const rows = [];
    if (!def) rows.push(`<button class="opt" data-new>${ICON.plus.replace("<svg", '<svg width="18" height="18"')}建立「${esc(cfg.playlist_name)}」</button>`);
    for (const p of def ? [def, ...mine.filter((x) => x !== def)] : mine) {
      const n = p.items?.total ?? p.tracks?.total ?? "";
      rows.push(`<button class="opt" data-id="${esc(p.id)}">${esc(p.name)}<small>${n !== "" ? n + " 首" : ""}</small></button>`);
    }
    const list = sheet.querySelector(".list");
    list.innerHTML = rows.join("") || `<p class="sub">沒有可加入的歌單。</p>`;
    const add = async (id, name) => {
      list.querySelectorAll("button").forEach((b) => (b.disabled = true));
      await api(`/playlists/${id}/items`, { method: "POST", body: JSON.stringify({ uris }) });
      sheet.close();
      toast(`已加入「${name}」`);
    };
    list.querySelectorAll("[data-id]").forEach((b) => (b.onclick = () => add(b.dataset.id, b.textContent.replace(/\d+ 首$/, "").trim()).catch((e) => toast(e.message))));
    const nb = list.querySelector("[data-new]");
    if (nb) nb.onclick = async () => {
      try {
        const p = await api("/me/playlists", { method: "POST", body: JSON.stringify({ name: cfg.playlist_name, public: false, description: "知更鳥晨間記事每日古典導聆的錄音" }) });
        await add(p.id, p.name);
      } catch (e) { toast(e.message); }
    };
  } catch (e) {
    sheet.querySelector(".list").innerHTML = `<p class="sub">${esc(e.message)}</p>`;
  }
}

function versionSheet(sp, current, onPick) {
  const sheet = $("#sheet");
  const cands = current?.candidates || [];
  sheet.innerHTML = `<div class="sheet"><h2>選擇錄音版本</h2><p class="sub">搜尋「${esc(sp.query)}」的結果。本報指定：${esc(sp.artist_hint || "")}</p>
    <div class="list">${cands.map((c) => `<button class="opt" data-id="${esc(c.id)}">${esc(c.name)}<small>${esc(c.artists)} ${esc(c.year)}</small></button>`).join("") || '<p class="sub">沒有其他候選。</p>'}</div>
    <div class="btns" style="margin-top:14px"><button class="btn ghost" data-close>取消</button></div></div>`;
  sheet.querySelector("[data-close]").onclick = () => sheet.close();
  sheet.querySelectorAll("[data-id]").forEach((b) => (b.onclick = async () => { sheet.close(); onPick(b.dataset.id); }));
  sheet.showModal();
}

// ——— Music card in the article ———
export function renderMusic(b) {
  const sp = b.spotify || {};
  const el = document.createElement("section");
  el.className = "music";
  const mv = b.movements || [];
  let state = null;

  const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(sp.query || b.work_original || b.work)}`;
  const title = (i) => `${b.composer?.split("（")[0] || ""}・${b.work}${mv[i] ? `　${mv[i]}` : ""}`;

  function draw() {
    const ready = state?.tracks?.length;
    const match = state?.source === "search" ? `<p class="match">已對應錄音：${esc(state.albumName)}｜${esc(state.artists)}${state.year ? `（${esc(state.year)}）` : ""}・<a href="#" data-ver>換一個版本</a></p>`
      : state?.source === "none" ? `<p class="match">在 Spotify 找不到完全相符的錄音・<a href="#" data-ver>從搜尋結果挑選</a></p>` : "";
    el.innerHTML = `
      <div class="composer">${esc(b.composer)}</div>
      <div class="work">${esc(b.work)}</div>
      ${b.work_original ? `<div class="orig">${esc(b.work_original)}</div>` : ""}
      <div class="m-meta">${[b.composed && `作於 ${esc(b.composed)}`, b.duration && esc(b.duration)].filter(Boolean).join("・")}<br>
        本期錄音：${esc(b.performers)}<br>${esc(b.recording)}</div>
      ${mv.length ? `<ol class="mv">${mv.map((m, i) => `<li><button type="button" data-play="${i}" aria-label="播放 ${esc(m)}" ${ready && state.tracks[i] ? "" : "disabled"}>${ICON.play.replace("<svg", '<svg width="13" height="13"')}</button><span>${esc(m)}</span></li>`).join("")}</ol>` : ""}
      ${match}
      <div class="btns">
        <button class="btn" type="button" data-listen>${ICON.play}在 App 內收聽</button>
        <button class="btn gold" type="button" data-add>${ICON.plus}加入 Spotify 歌單</button>
        <a class="btn ghost" href="${state?.album ? `https://open.spotify.com/album/${esc(state.album)}` : searchUrl}" target="_blank" rel="noopener">${ICON.ext}在 Spotify 開啟</a>
      </div>
      ${!isLoggedIn() && !sp.tracks?.length ? `<p class="match" style="margin-top:10px">第一次使用請先連結 Spotify，App 會依本期指定的錄音自動找到曲目。</p>` : ""}`;
    el.querySelector("[data-listen]").onclick = () => act("listen");
    el.querySelector("[data-add]").onclick = () => act("add");
    el.querySelectorAll("[data-play]").forEach((x) => (x.onclick = () => play(state.tracks[Number(x.dataset.play)], title(Number(x.dataset.play)))));
    const ver = el.querySelector("[data-ver]");
    if (ver) ver.onclick = (e) => { e.preventDefault(); versionSheet(sp, state, async (id) => { state = await resolve(sp, { albumId: id }); draw(); }); };
  }

  async function ensure() {
    if (state?.tracks?.length) return true;
    if (!sp.tracks?.length && !isLoggedIn()) {
      if (!hasClient()) { window.open(searchUrl, "_blank", "noopener"); return false; }
      await login(location.hash);
      return false;
    }
    state = await resolve(sp);
    draw();
    return Boolean(state?.tracks?.length);
  }

  async function act(kind) {
    try {
      if (!(await ensure())) { if (state?.source === "none") toast("找不到相符錄音，請從搜尋結果挑選"); return; }
      if (kind === "listen") play(state.tracks[0], title(0));
      else {
        if (!isLoggedIn()) { await login(location.hash); return; }
        await addToPlaylist(state.tracks.map((id) => `spotify:track:${id}`), `${b.work}｜${b.performers}`);
      }
    } catch (e) {
      if (e.code === "auth") { toast(e.message); setTimeout(() => login(location.hash), 900); } else toast(e.message);
    }
  }

  draw();
  if (sp.tracks?.length || isLoggedIn()) resolve(sp).then((s) => { state = s; draw(); }).catch(() => {});
  return el;
}
