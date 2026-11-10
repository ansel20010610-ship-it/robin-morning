// 巢 (assets/nest.js syncNest): the one small shared store the nests need, as a Cloudflare Worker with a KV namespace
// — the free tier (100,000 requests a day, 1 GB) is far more than a few nests feeding a bird. Not run by the paper's
// build; deployed once by hand:
//
//   1. cloudflare.com → Workers & Pages → Create → Worker, name it `robin-nest`, paste this file, deploy.
//   2. Workers → robin-nest → Settings → Bindings → KV namespace: variable name NEST, create a namespace `robin-nest`.
//   3. Its address (https://robin-nest.<account>.workers.dev) goes into content/config.json as `"nest": {"api": "…"}`
//      and into index.html's Content-Security-Policy `connect-src`.
//
// One nest is one key (its invite code). POST /{code} with {member: {id, name}, feeds: [{d, w, k}], pet?: {name, p}} merges
// the member, the feeds (one bite per member per article) and the bird's name, and answers the whole nest {members, feeds, pet}. Nothing personal is
// kept: a nest's members are the names its readers chose, their ids random strings. Anyone holding the code can read
// and feed the nest — the code is the whole secret, which is what an invite code is for.
const CODE = /^NEST-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
const FEED = (f) => f && typeof f.d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(f.d) && typeof f.w === "string" && /^[A-Z2-9]{8}$/.test(f.w) && typeof f.k === "string" && /^\d{4}-\d{2}-\d{2}\/[\w-]{1,40}$/.test(f.k);
const MAX_FEEDS = 20000, MAX_MEMBERS = 12;
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Cache-Control": "no-store" };
// 寫信給編輯部 (the owner, 2026-11-10): POST /{code}/letters {member, text} leaves a question for the paper's letters
// routine (editorial/columns/letters.md), GET /{code}/letters reads what is waiting. Only the yards whose code hashes to
// one of LETTER_YARDS take letters — the owner's, and one junk test yard — so a yard code still is the whole secret and
// no code is written here. A letter is kept 30 days; three a phone a day at most; 300 characters.
const LETTER_YARDS = ["9c3409217fa036c19a1b6691e358025de5ebbde5b1d80d1598da07bd3704e57e", "41bb7d226a7c1c3c09923896f9c73f01a8a97e846d3267979824b9ce5dc33d26"];
const sha256 = async (t) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))].map((b) => b.toString(16).padStart(2, "0")).join("");
async function letters(req, env, code) {
  if (!LETTER_YARDS.includes(await sha256(code))) return json({ error: "no letters here" }, 403);
  const key = `letters:${code}`, now = Date.now();
  const box = ((await env.NEST.get(key, "json")) || []).filter((l) => now - Date.parse(l.at) < 30 * 864e5);
  if (req.method === "GET") return json({ letters: box });
  if (req.method !== "POST") return json({ error: "GET or POST only" }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const id = body?.member, text = typeof body?.text === "string" ? body.text.trim() : "";
  if (typeof id !== "string" || !/^[A-Z2-9]{8}$/.test(id)) return json({ error: "bad member" }, 400);
  const nest = await env.NEST.get(code, "json");
  if (!nest || !(id in (nest.members || {}))) return json({ error: "not in this yard" }, 403);
  if (!text || text.length > 300) return json({ error: "1 to 300 characters" }, 400);
  if (box.filter((l) => l.from === id && now - Date.parse(l.at) < 864e5).length >= 3) return json({ error: "three a day" }, 429);
  const letter = { id: `L${now.toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`, at: new Date(now).toISOString(), from: id, text };
  box.push(letter);
  await env.NEST.put(key, JSON.stringify(box.slice(-60)));
  return json({ id: letter.id, at: letter.at });
}
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const parts = new URL(req.url).pathname.replace(/^\/+/, "").split("/");
    const code = decodeURIComponent(parts[0] || "").toUpperCase();
    if (!CODE.test(code)) return json({ error: "bad code" }, 400);
    if (parts[1] === "letters") return letters(req, env, code);
    // GET: the yard read-only, for the 地圖班 (scripts/postcards.py demand) — the feeds and the bird, no names, nothing written
    if (req.method === "GET") { const n = await env.NEST.get(code, "json"); return n ? json({ feeds: n.feeds, pet: n.pet || null }) : json({ error: "no such nest" }, 404); }
    if (req.method !== "POST") return json({ error: "GET or POST only" }, 405);
    let body;
    try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }
    const m = body?.member;
    if (!m || typeof m.id !== "string" || !/^[A-Z2-9]{8}$/.test(m.id)) return json({ error: "bad member" }, 400);
    const name = String(m.name || "").slice(0, 12) || "朋友";
    const nest = (await env.NEST.get(code, "json")) || { members: {}, feeds: [] };
    if (!(m.id in nest.members) && Object.keys(nest.members).length >= MAX_MEMBERS) return json({ error: "nest full" }, 409);
    nest.members[m.id] = name;
    // the bird's name and how it is called (牠/他/她), the yard's to change: the latest rename wins
    if (body.pet && typeof body.pet === "object" && typeof body.pet.name === "string") nest.pet = { name: body.pet.name.slice(0, 12), p: ["牠", "他", "她"].includes(body.pet.p) ? body.pet.p : "牠" };
    const seen = new Set(nest.feeds.map((f) => `${f.w}|${f.k}`));
    for (const f of Array.isArray(body.feeds) ? body.feeds.slice(0, 500) : []) {
      if (!FEED(f) || f.w !== m.id || seen.has(`${f.w}|${f.k}`)) continue; // a phone feeds only as itself
      nest.feeds.push({ d: f.d, w: f.w, k: f.k }); seen.add(`${f.w}|${f.k}`);
    }
    if (nest.feeds.length > MAX_FEEDS) nest.feeds = nest.feeds.slice(-MAX_FEEDS);
    await env.NEST.put(code, JSON.stringify(nest));
    return json(nest);
  },
};
