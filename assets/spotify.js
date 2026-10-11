// Spotify: in-app listening (embed player) + add to playlist (Web API, PKCE — no server, no secret).
// Endpoints follow Spotify's February 2026 Web API changes (/playlists/{id}/items, POST /me/playlists).
import { esc, inline, store, toast, $, ICON } from "./util.js";

const AUTH = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";
// playlist-read-collaborative: without it /me/playlists leaves collaborative playlists out (takes effect on the next login).
const SCOPES = "playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public";

let cfg = { client_id: "", playlist_name: "知更鳥晨間記事・古典" };

export function initSpotify(c) { cfg = { ...cfg, ...(c || {}) }; }
export const hasClient = () => Boolean(cfg.client_id);
export const isLoggedIn = () => Boolean(store.get("sp.token"));
// The app's directory (site root on the custom domain) and the redirect URI registered in the Spotify dashboard.
const appBase = () => location.origin + location.pathname.replace(/[^/]*$/, "");
const redirectUri = () => appBase() + "oauth/spotify/callback";

const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const rand = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return b64url(a).slice(0, n); };

export async function login(returnHash = location.hash) {
  if (!hasClient()) { toast("尚未設定 Spotify Client ID，請見「設定」頁說明"); return; }
  const verifier = rand(64), state = rand(16);
  const challenge = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  // The page's own query (e.g. `?preview`) is restored after the trip; redirect_uri itself stays query-free.
  const search = location.search.replace(/[?&](code|state|error)=[^&]*/g, "").replace(/^&/, "?");
  store.set("sp.pkce", { verifier, state, returnHash, search });
  const q = new URLSearchParams({ client_id: cfg.client_id, response_type: "code", redirect_uri: redirectUri(),
    code_challenge_method: "S256", code_challenge: challenge, scope: SCOPES, state });
  location.assign(`${AUTH}?${q}`);
}

// iPhone home-screen app: Spotify's sign-in page often fails inside its separate in-app browser
// ("Oops! Something went wrong"), so the connection is made in Safari and handed over with a link code.
export function isStandaloneIOS() {
  const standalone = navigator.standalone === true || window.matchMedia?.("(display-mode: standalone)").matches;
  return Boolean(standalone && isWebKitITP());
}

const encodeCode = (obj) => "RM1." + btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
function decodeCode(code) {
  const m = String(code || "").replace(/\s+/g, "").match(/^RM1\.([A-Za-z0-9_-]+)$/);
  if (!m) return null;
  try { return JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/-/g, "+").replace(/_/g, "/"))))); } catch { return null; }
}

// Hand this browser's Spotify connection to another one (e.g. Safari → the home-screen app, whose storage is separate).
// The connection moves: this browser disconnects, because a shared refresh token can be rotated out from under the other side.
export async function exportLinkCode() {
  const t = store.get("sp.token");
  if (!t?.refresh) throw new Error("這個瀏覽器還沒有連結 Spotify");
  const code = encodeCode({ r: t.refresh });
  await navigator.clipboard.writeText(code);
  store.del("sp.token");
  return code;
}

export async function importLinkCode(code) {
  const data = decodeCode(code);
  if (!data?.r) throw new Error("連結碼不正確，請重新複製一次");
  store.set("sp.token", { access: "", refresh: data.r, exp: 0 });
  try { await api("/me"); }
  catch (e) { store.del("sp.token"); throw e.code === "auth" ? new Error("連結碼已失效，請在 Safari 重新連結後再複製") : e; }
}

export function logout() {
  store.del("sp.token");
  store.del("sp.playlist");
  for (const k of Object.keys(localStorage)) if (k.startsWith("rm.sp.resolve")) localStorage.removeItem(k);
  toast("已中斷 Spotify 連結");
}

function saveToken(t) {
  const old = store.get("sp.token") || {};
  store.set("sp.token", { access: t.access_token, refresh: t.refresh_token || old.refresh, exp: Date.now() + (t.expires_in - 60) * 1000 });
}

const authError = (msg) => Object.assign(new Error(msg), { code: "auth" });

async function tokenRequest(params) {
  let r;
  try {
    r = await fetch(TOKEN, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: cfg.client_id, ...params }) });
  } catch { throw new Error("連不上 Spotify，請確認網路後再試"); }
  if (r.ok) return r.json();
  // Only a rejected grant means the saved login is dead; network trouble and 5xx keep it for the next try.
  const body = await r.json().catch(() => ({}));
  if (r.status === 400 && body.error === "invalid_grant") throw authError("Spotify 登入已過期，請重新連結");
  throw new Error(`Spotify 授權失敗（${r.status}）`);
}

// Call on boot. Returns the hash to restore if we just came back from Spotify.
export async function handleCallback() {
  const q = new URLSearchParams(location.search);
  if (!q.has("code") && !q.has("error")) return null;
  const pkce = store.get("sp.pkce");
  const search = String(pkce?.search || "").startsWith("?") ? pkce.search : "";
  history.replaceState(null, "", appBase() + search + (pkce?.returnHash || ""));
  store.del("sp.pkce");
  if (q.get("error")) { toast("Spotify 授權已取消"); return pkce?.returnHash || ""; }
  if (!pkce || q.get("state") !== pkce.state) { toast("Spotify 授權狀態不符，請再試一次"); return ""; }
  try {
    saveToken(await tokenRequest({ grant_type: "authorization_code", code: q.get("code"), redirect_uri: redirectUri(), code_verifier: pkce.verifier }));
    toast("已連結 Spotify");
  } catch (e) { toast(e.message); }
  return pkce.returnHash || "";
}

let refreshing = null; // the refresh in flight, shared by every caller (Spotify may rotate the refresh token)

async function refresh(t) {
  if (!t.refresh) { store.del("sp.token"); return null; }
  try {
    const fresh = await tokenRequest({ grant_type: "refresh_token", refresh_token: t.refresh });
    if (!store.get("sp.token")) return null; // logged out meanwhile
    saveToken(fresh);
  } catch (e) {
    // Another tab may have refreshed (and rotated the refresh token) meanwhile: use its newer token.
    const cur = store.get("sp.token");
    if (cur && cur.access !== t.access && Date.now() < cur.exp) return cur.access;
    if (e.code === "auth" && cur?.refresh === t.refresh) store.del("sp.token");
    throw e;
  }
  return store.get("sp.token")?.access || null;
}

// A usable access token; refreshes when it has expired or when the API has just rejected `stale`.
async function accessToken(stale = null) {
  const t = store.get("sp.token");
  if (!t) return null;
  if (Date.now() < t.exp && t.access !== stale) return t.access;
  if (!refreshing) refreshing = refresh(t).finally(() => { refreshing = null; });
  return refreshing;
}

async function api(path, opts = {}) {
  const send = (tok) => fetch(API + path, { ...opts, headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json", ...(opts.headers || {}) } });
  const tok = await accessToken();
  if (!tok) throw authError("請先連結 Spotify");
  let r = await send(tok);
  if (r.status === 401) {
    // Refresh once and retry before giving up on the login.
    const again = await accessToken(tok);
    if (again) r = await send(again);
    if (!again || r.status === 401) {
      if (store.get("sp.token")?.access === (again || tok)) store.del("sp.token");
      throw authError("Spotify 登入已過期，請重新連結");
    }
  }
  if (r.status === 403) throw new Error("Spotify 拒絕這個操作（開發者模式需要 Premium，且帳號須在 App 的使用者名單內）");
  if (r.status === 429) throw new Error("Spotify 請求太頻繁，請稍後再試");
  if (!r.ok) throw new Error(`Spotify 錯誤 ${r.status}`);
  return r.status === 204 ? null : r.json();
}

// The reader's own 「知更鳥晨間記事・古典」 playlist, for the music page's "open in Spotify" link: looked up once, then
// remembered. Null when it does not exist yet (nothing added so far) or anything goes wrong; never starts a login.
export async function defaultPlaylist() {
  const known = store.get("sp.playlist");
  if (known?.url) return known;
  if (!isLoggedIn()) return null;
  try {
    const me = await api("/me");
    const isDef = (p) => p && (p.owner?.id === me.id || p.collaborative) && p.name === cfg.playlist_name;
    let page = await api("/me/playlists?limit=50");
    let pls = page.items || [];
    while (page.next && !pls.some(isDef) && pls.length < 500) {
      page = await api(page.next.replace(API, ""));
      pls = pls.concat(page.items || []);
    }
    const def = pls.find(isDef);
    return def ? rememberPlaylist(def) : null;
  } catch { return null; }
}
function rememberPlaylist(p) {
  const v = { id: p.id, name: p.name, url: p.external_urls?.spotify || `https://open.spotify.com/playlist/${p.id}` };
  store.set("sp.playlist", v);
  return v;
}

// ——— Matching the editor's recording description to Spotify ———
const norm = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9㐀-鿿]+/g, " ").trim();
// v2: matches made before the performer was enforced may name another recording, so they are looked up again.
const cacheKey = (sp) => "sp.resolve2." + norm(sp.query).slice(0, 80);
// Whole-word match, so "Symphony No. 4" doesn't also hit No. 40 and "Op. 6" doesn't hit Op. 61.
const hasTok = (hay, w) => (" " + norm(hay) + " ").includes(" " + norm(w) + " ");
const filterWords = (filter) => (filter || []).filter((w) => norm(w));

// Compilations carry cut-down versions under the same title; the article is about the whole piece. A word the editor
// put in the filter is part of the title (Glass's "Opening"), not a sign of a cut.
const PARTIAL = /\b(excerpts?|opening|highlights?|edit|abridged|ausschnitt|auszug|extrait)\b/i;

function tracksMatching(items, filter) {
  const f = filterWords(filter);
  const cut = (name) => PARTIAL.test(name) && !f.some((w) => PARTIAL.test(w));
  return items.filter((t) => f.every((w) => hasTok(t.name, w)) && !cut(t.name));
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
  return { album: al, all: items, tracks: tracksMatching(items, filter) };
}

async function searchAlbums(sp) {
  const res = await api(`/search?${new URLSearchParams({ q: sp.query, type: "album", limit: "10" })}`);
  const hint = norm(sp.artist_hint);
  return (res.albums?.items || []).filter(Boolean).map((a) => {
    const artists = a.artists.map((x) => x.name).join(", ");
    let score = 0;
    if (hint && (norm(artists).includes(hint) || norm(a.name).includes(hint))) score += 3;
    for (const w of filterWords(sp.track_filter)) if (hasTok(a.name, w)) score += 1;
    return { id: a.id, name: a.name, artists, year: (a.release_date || "").slice(0, 4), score };
  }).sort((a, b) => b.score - a.score);
}

// Albums holding the editor's performer's recording, found track by track: the album search misses reissues and
// compilations whose album artist is someone else. Albums whose matching tracks run longest come first.
async function albumsByPerformer(sp) {
  const hint = norm(sp.artist_hint);
  if (!hint) return [];
  const q = `${filterWords(sp.track_filter).join(" ")} ${sp.artist_hint}`.trim();
  const res = await api(`/search?${new URLSearchParams({ q, type: "track", limit: "10" })}`); // 10 is the cap since February 2026
  const length = new Map();
  for (const t of res.tracks?.items || []) {
    if (!t?.album?.id || !norm(t.artists.map((x) => x.name).join(", ")).includes(hint)) continue;
    if (!tracksMatching([t], sp.track_filter).length) continue;
    length.set(t.album.id, (length.get(t.album.id) || 0) + (t.duration_ms || 0));
  }
  return [...length.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

const found = (album, tracks, cands, substitute = false) => ({ album: album.id, albumName: album.name, artists: album.artists.map((x) => x.name).join(", "),
  year: (album.release_date || "").slice(0, 4), tracks: tracks.map((t) => t.id), trackNames: tracks.map((t) => t.name),
  candidates: cands, source: "search", ...(substitute ? { substitute: true } : {}) });

// `albumId`: the reader picked this album in the version sheet. `candidates`: reuse an earlier search.
// `count`: how many movements the article lists (caps a picked album whose track titles don't pass the filter).
export async function resolve(sp, { force = false, albumId = null, candidates = null, count = 0 } = {}) {
  if (!force && !albumId && sp.tracks?.length) return { tracks: sp.tracks, album: sp.album, source: "editor" };
  const key = cacheKey(sp);
  if (!force && !albumId) { const c = store.get(key); if (c) return c; }
  if (!isLoggedIn()) return null;
  const cands = candidates || await searchAlbums(sp);
  const filtered = filterWords(sp.track_filter).length > 0;
  if (albumId) {
    // Stay on the reader's pick; if no track title passes the filter, follow the album's track order.
    const { album, all, tracks } = await albumTracks(albumId, sp.track_filter);
    const out = filtered && tracks.length ? found(album, tracks, cands) : { ...found(album, all.slice(0, count || all.length), cands), loose: true };
    if (!out.tracks.length) return { tracks: [], candidates: cands, source: "none" };
    store.set(key, out);
    return out;
  }
  // No track_filter: every track of any album would "match", so let the reader choose the recording.
  if (!filtered) return { tracks: [], candidates: cands, source: "none" };
  // The article is about one performance: look for the editor's performer first, by album and then by track,
  // and only then settle for someone else's recording, saying so.
  const hint = norm(sp.artist_hint);
  const byPerformer = (c) => Boolean(hint) && (norm(c.artists).includes(hint) || norm(c.name).includes(hint));
  const tryAlbum = async (id, substitute) => {
    const { album, tracks } = await albumTracks(id, sp.track_filter);
    if (!tracks.length) return null;
    const out = found(album, tracks, cands, substitute);
    store.set(key, out);
    return out;
  };
  for (const c of cands.slice(0, 6).filter(byPerformer)) { const out = await tryAlbum(c.id, false); if (out) return out; }
  const seen = new Set(cands.filter(byPerformer).map((c) => c.id));
  const more = await albumsByPerformer(sp).catch((e) => { if (e.code === "auth") throw e; return []; });
  for (const id of more.filter((x) => !seen.has(x)).slice(0, 4)) { const out = await tryAlbum(id, false); if (out) return out; }
  for (const c of cands.slice(0, 6).filter((c) => !byPerformer(c))) { const out = await tryAlbum(c.id, Boolean(hint)); if (out) return out; }
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

// WebKit (every browser on iOS/iPadOS, Safari on the desktop) blocks third-party cookies, so the embed
// can't see the reader's Spotify login and may only play ~30-second previews.
export function isWebKitITP() {
  const ua = navigator.userAgent;
  const iOS = /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const safari = /Safari\//.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox|Android/.test(ua);
  return iOS || safari;
}

// Show an API error; a lost login goes back through Spotify's sign-in.
// Start Spotify's sign-in, or send the home-screen app to the link-code form in settings.
async function connect() {
  if (isStandaloneIOS()) { toast("主畫面 App 請用「連結碼」連結 Spotify"); location.hash = "#/settings"; return; }
  await login(location.hash);
}

function report(e) {
  toast(e.message);
  if (e.code !== "auth") return;
  // the home-screen app reconnects with a link code (Spotify's sign-in page fails there)
  setTimeout(connect, 900);
}

// ——— Playlist sheet ———
async function addToPlaylist(uris, label) {
  const sheet = $("#sheet");
  sheet.innerHTML = `<div class="sheet"><h2>加入 Spotify 歌單</h2><p class="sub">${esc(label)}・${uris.length} 首</p><p class="sub" data-err hidden style="color:var(--red)"></p><div class="list"><p class="sub">讀取你的歌單……</p></div>
    <div class="btns" style="margin-top:14px"><button class="btn ghost" data-close>取消</button></div></div>`;
  sheet.querySelector("[data-close]").onclick = () => sheet.close();
  sheet.showModal();
  const list = sheet.querySelector(".list"), err = sheet.querySelector("[data-err]");
  const shown = () => sheet.open && sheet.contains(list);
  const lock = (on) => list.querySelectorAll("button").forEach((b) => (b.disabled = on));
  // Errors are shown inside the sheet (the toast sits under the modal); a lost login closes it and signs in again.
  const fail = (e) => {
    if (e.code === "auth" || !shown()) { if (shown()) sheet.close(); report(e); return; }
    lock(false);
    err.textContent = e.message;
    err.hidden = false;
  };
  try {
    const me = await api("/me");
    const mine = (p) => p && (p.owner?.id === me.id || p.collaborative);
    const isDef = (p) => mine(p) && p.name === cfg.playlist_name;
    let page = await api("/me/playlists?limit=50");
    let pls = page.items || [];
    // Page on (up to 500) until the default playlist turns up, so it never gets created twice.
    while (page.next && !pls.some(isDef) && pls.length < 500) {
      page = await api(page.next.replace(API, ""));
      pls = pls.concat(page.items || []);
    }
    const own = pls.filter(mine);
    const def = own.find(isDef);
    const rows = [];
    if (!def) rows.push(`<button class="opt" data-new>${ICON.plus.replace("<svg", '<svg width="18" height="18"')}建立「${esc(cfg.playlist_name)}」</button>`);
    for (const p of def ? [def, ...own.filter((x) => x !== def)] : own) {
      const n = p.items?.total ?? p.tracks?.total ?? "";
      rows.push(`<button class="opt" data-id="${esc(p.id)}">${esc(p.name)}<small>${n !== "" ? n + " 首" : ""}</small></button>`);
    }
    list.innerHTML = rows.join("") || `<p class="sub">沒有可加入的歌單。</p>`;
    const sent = {}; // tracks already added per playlist, so a retry after a partial failure picks up where it stopped
    const add = async (id, name) => {
      lock(true);
      err.hidden = true;
      // At most 100 items per request; batches without a position are appended in order.
      for (let i = sent[id] || 0; i < uris.length; i += 100) {
        try { await api(`/playlists/${id}/items`, { method: "POST", body: JSON.stringify({ uris: uris.slice(i, i + 100) }) }); }
        catch (e) { if (i) e.message = `已加入前 ${i} 首，其餘未加入：${e.message}`; throw e; }
        sent[id] = i + 100;
      }
      if (shown()) sheet.close();
      toast(`已加入「${name}」`);
    };
    list.querySelectorAll("[data-id]").forEach((b) => (b.onclick = () => add(b.dataset.id, b.textContent.replace(/\d+ 首$/, "").trim()).catch(fail)));
    const nb = list.querySelector("[data-new]");
    if (nb) nb.onclick = async () => {
      lock(true);
      err.hidden = true;
      let p;
      try { p = await api("/me/playlists", { method: "POST", body: JSON.stringify({ name: cfg.playlist_name, public: false, description: "知更鳥晨間記事每日古典導聆的錄音" }) }); }
      catch (e) { fail(e); return; }
      rememberPlaylist(p);
      // The button now stands for the new playlist, so a retry adds to it instead of creating another.
      nb.removeAttribute("data-new");
      nb.dataset.id = p.id;
      nb.innerHTML = `${esc(p.name)}<small></small>`;
      nb.onclick = () => add(p.id, p.name).catch(fail);
      nb.onclick();
    };
  } catch (e) {
    if (e.code === "auth") fail(e); else list.innerHTML = `<p class="sub">${esc(e.message)}</p>`;
  }
}

function versionSheet(sp, current, onPick) {
  const sheet = $("#sheet");
  const cands = current?.candidates || [];
  sheet.innerHTML = `<div class="sheet"><h2>選擇錄音版本</h2><p class="sub">搜尋「${esc(sp.query)}」的結果。本報指定：${esc(sp.artist_hint || "")}</p>
    <div class="list">${cands.map((c) => `<button class="opt" data-id="${esc(c.id)}">${esc(c.name)}<small>${esc(c.artists)} ${esc(c.year)}</small></button>`).join("") || '<p class="sub">沒有其他候選。</p>'}</div>
    <div class="btns" style="margin-top:14px"><button class="btn ghost" data-close>取消</button></div></div>`;
  sheet.querySelector("[data-close]").onclick = () => sheet.close();
  sheet.querySelectorAll("[data-id]").forEach((b) => (b.onclick = () => { sheet.close(); onPick(b.dataset.id); }));
  sheet.showModal();
}

// ——— Music card in the article ———
export function renderMusic(b) {
  const sp = b.spotify || {};
  const el = document.createElement("section");
  el.className = "music";
  const mv = b.movements || [];
  const itp = isWebKitITP();
  let state = null, loading = null;

  const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(sp.query || b.work_original || b.work)}`;
  const title = (i) => `${b.composer?.split("（")[0] || ""}・${b.work}${mv[i] ? `　${mv[i]}` : ""}`;
  // One lookup at a time: the background resolve and a tap on a button share it.
  const load = () => loading || (loading = resolve(sp, { count: mv.length }).finally(() => { loading = null; }));

  function draw() {
    const ready = state?.tracks?.length;
    const match = state?.source === "search" ? `<p class="match">${state.substitute ? `本期指定的錄音（${esc(sp.artist_hint)}）在 Spotify 上找不到，先對應到另一個版本：` : "已對應錄音："}${esc(state.albumName)}｜${esc(state.artists)}${state.year ? `（${esc(state.year)}）` : ""}${state.loose ? "（曲名未能逐一核對，依專輯曲序對應）" : ""}・<a href="#" data-ver>換一個版本</a></p>`
      : state?.source === "none" ? `<p class="match">在 Spotify 找不到完全相符的錄音・<a href="#" data-ver>從搜尋結果挑選</a></p>` : "";
    // Where WebKit limits the embed to previews, opening Spotify itself (first movement first) is the main way to listen.
    const openUrl = itp && state?.tracks?.[0] ? `https://open.spotify.com/track/${state.tracks[0]}` : state?.album ? `https://open.spotify.com/album/${state.album}` : searchUrl;
    const listenBtn = `<button class="btn${itp ? " ghost" : ""}" type="button" data-listen>${ICON.play}在 App 內收聽</button>`;
    const addBtn = `<button class="btn gold" type="button" data-add>${ICON.plus}加入 Spotify 歌單</button>`;
    const openBtn = `<a class="btn${itp ? "" : " ghost"}" href="${esc(openUrl)}" target="_blank" rel="noopener">${ICON.ext}在 Spotify 開啟</a>`;
    el.innerHTML = `
      <div class="composer">${esc(b.composer)}</div>
      <div class="work">${esc(b.work)}</div>
      ${b.work_original ? `<div class="orig">${esc(b.work_original)}</div>` : ""}
      <div class="m-meta">${[b.composed && `作於 ${esc(b.composed)}`, b.duration && esc(b.duration)].filter(Boolean).join("・")}<br>
        本期錄音：${esc(b.performers)}<br>${esc(b.recording)}</div>
      ${mv.length ? `<ol class="mv">${mv.map((m, i) => `<li><button type="button" data-play="${i}" aria-label="播放 ${esc(m)}" ${ready && state.tracks[i] ? "" : "disabled"}>${ICON.play.replace("<svg", '<svg width="13" height="13"')}</button><span>${esc(m)}</span></li>`).join("")}</ol>` : ""}
      ${match}
      <div class="btns">${itp ? openBtn + addBtn + listenBtn : listenBtn + addBtn + openBtn}</div>
      ${itp ? `<p class="match" style="margin-top:10px">這個瀏覽器會擋住內嵌播放器讀取你的 Spotify 登入，「在 App 內收聽」可能只能試聽約 30 秒；完整收聽請按「在 Spotify 開啟」。</p>` : ""}
      ${!isLoggedIn() && !sp.tracks?.length ? `<p class="match" style="margin-top:10px">第一次使用請先連結 Spotify，App 會依本期指定的錄音自動找到曲目。</p>` : ""}`;
    el.querySelector("[data-listen]").onclick = () => act("listen");
    el.querySelector("[data-add]").onclick = () => act("add");
    el.querySelectorAll("[data-play]").forEach((x) => (x.onclick = () => play(state.tracks[Number(x.dataset.play)], title(Number(x.dataset.play)))));
    const ver = el.querySelector("[data-ver]");
    if (ver) ver.onclick = (e) => { e.preventDefault(); versionSheet(sp, state, pick); };
  }

  // The reader picked a recording in the version sheet: resolve that album only, reusing the search results.
  async function pick(id) {
    try {
      const s = await resolve(sp, { albumId: id, candidates: state?.candidates, count: mv.length });
      if (!s) { await connect(); return; }
      state = s;
      draw();
      if (s.source === "none") toast("這個版本找不到對應曲目，請換一個");
    } catch (e) { report(e); }
  }

  async function ensure() {
    if (state?.tracks?.length) return true;
    if (state?.source === "none") return false; // already looked; the reader picks from the search results
    if (!sp.tracks?.length && !isLoggedIn()) {
      if (!hasClient()) { window.open(searchUrl, "_blank", "noopener"); return false; }
      await connect();
      return false;
    }
    state = await load();
    draw();
    return Boolean(state?.tracks?.length);
  }

  async function act(kind) {
    try {
      if (!(await ensure())) { if (state?.source === "none") toast("找不到相符錄音，請從搜尋結果挑選"); return; }
      if (kind === "listen") play(state.tracks[0], title(0));
      else {
        if (!isLoggedIn()) { await connect(); return; }
        await addToPlaylist(state.tracks.map((id) => `spotify:track:${id}`), `${b.work}｜${b.performers}`);
      }
    } catch (e) { report(e); }
  }

  draw();
  if (sp.tracks?.length || isLoggedIn()) load().then((s) => { state = s; draw(); }).catch(() => {});
  return el;
}
