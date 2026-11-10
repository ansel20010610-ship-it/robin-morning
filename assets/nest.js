// 後院 (Hinterhof; app.js viewSaved, viewNest, viewFront, markRead): a robin that two or more readers of this paper raise
// together in a shared back yard. Every article read is one bite (一口); the bites of everyone in the yard add up, and
// the bird grows from an egg to a singer by what the whole yard has read, and keeps changing after that. One yard is
// one invite code (NEST-XXXX-XXXX): whoever enters it in 設定 joins. The owner, 2026-11-09: 和有這個 app 的人共同養寵物，
// 發邀請碼，讀一篇就可以餵知更鳥; the same evening it was 巢, then 後院 (「巢這個名字改一下」).
//
// State lives in rm.nest: { code, me, name, members: {id: name}, feeds: [{d, w, k}], pending: [...], pet: {name, p},
// petDirty, seen, since, synced } — d the day (Taiwan), w the member who fed, k the article (date/column). The bird's
// whole condition is computed from `feeds`, nothing else is stored. Sharing needs a tiny store the phones can both
// reach (scripts/nest-worker.js, a Cloudflare Worker on the free tier): with config.json `nest.api` set, syncNest()
// posts what this phone fed (and the bird's name when it changed here) and takes back the yard's members, every feed
// and the name; without it the yard is this phone alone and says so. The bird never dies.
import { esc, store, twNow, fmtDate, toast } from "./util.js";

const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I, L, O, 0, 1: a code read aloud or typed from a photo stays right
const rnd = (n) => { const a = crypto.getRandomValues(new Uint8Array(n)); return [...a].map((b) => ALPHA[b % ALPHA.length]).join(""); };
export const CODE_RE = /^NEST-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
export const normCode = (s) => { const t = String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); const b = t.startsWith("NEST") ? t.slice(4) : t; return b.length === 8 ? `NEST-${b.slice(0, 4)}-${b.slice(4)}` : ""; };

export const nest = () => { const n = store.get("nest"); return n && typeof n.code === "string" && n.me ? n : null; };
const save = (n) => store.set("nest", n);

// A fresh yard with this phone as its first member; `name` is what the others will see beside this phone's bites.
export function buildNest(name) {
  const me = rnd(8), n = { code: `NEST-${rnd(4)}-${rnd(4)}`, me, name: name || "我", members: { [me]: name || "我" }, feeds: [], pending: [], pet: null, since: twNow().date, synced: null };
  save(n);
  return n;
}
// Joining a yard someone else opened: the code is the whole secret. Members, feeds and the bird's name arrive with the
// first sync.
export function joinNest(code, name) {
  const c = normCode(code);
  if (!CODE_RE.test(c)) return null;
  const me = rnd(8), n = { code: c, me, name: name || "我", members: { [me]: name || "我" }, feeds: [], pending: [], pet: null, since: twNow().date, synced: null };
  save(n);
  return n;
}
export const leaveNest = () => store.del("nest");

// One bite for one article read by this phone, once (the owner reads the same piece twice: still one bite). Returns
// true when the bird was fed, so the caller can say so.
export function feedNest(k) {
  const n = nest();
  if (!n || typeof k !== "string") return false;
  if (n.feeds.some((f) => f.w === n.me && f.k === k)) return false;
  const f = { d: twNow().date, w: n.me, k };
  n.feeds.push(f); n.pending.push(f);
  save(n);
  return true;
}

// ——— The bird's name ———
// Robins look the same whichever sex they are, so the yard decides: a name, and whether it is 牠, 他 or 她 (the owner,
// 2026-11-09: 這隻鳥性別？然後我要可以取名). The name is the yard's, shared through the store; a phone that renames marks
// it dirty and the next sync carries it.
export const PRONOUNS = ["牠", "他", "她"];
export function petOf(n = nest()) {
  const p = n?.pet || {};
  return { name: typeof p.name === "string" && p.name.trim() ? p.name.trim().slice(0, 12) : "知更鳥", p: PRONOUNS.includes(p.p) ? p.p : "牠", named: Boolean(typeof p.name === "string" && p.name.trim()) };
}
export function namePet(name, p) {
  const n = nest();
  if (!n) return;
  n.pet = { name: String(name || "").trim().slice(0, 12), p: PRONOUNS.includes(p) ? p : "牠" };
  n.petDirty = true;
  save(n);
}

// ——— The bird's condition, all from the feed log ———
// The stages, by what the whole yard has read; the words are the paper's, not a game's.
export const STAGES = [
  { at: 0, zh: "一顆蛋", de: "Ei", say: (p) => `還在蛋裡。讀完第一篇，${p}就破殼。` },
  { at: 1, zh: "破殼", de: "Geschlüpft", say: () => "剛破殼，眼睛還沒全睜開，嘴倒是張得很大。" },
  { at: 12, zh: "長絨毛", de: "Flaum", say: () => "身上長出一層絨毛，餓了叫得整個院子都聽見。" },
  { at: 35, zh: "學飛", de: "Flügge", say: (p) => `${p}站在枝上撲翅膀，每天掉下來一次，再跳回去。` },
  { at: 80, zh: "成鳥", de: "Ausgewachsen", say: () => "胸前紅了，是一隻真正的知更鳥。" },
  { at: 160, zh: "歌者", de: "Sänger", say: (p) => `天還沒亮${p}就開始唱，鄰居的鳥都安靜下來聽。` },
];
// The singer never stops growing (the owner, 2026-11-09: 鳥的成長要有一直的感覺，不能到一個程度就不見): every SONG bites
// after the last stage it learns one more song, counted without end — 會唱第幾首歌.
const SONG = 60;
// And between the stages something new comes to the yard every ten or twenty bites (the owner: 成長頻率想多點，不只是
// 增加葉子): twigs that make a nest under the perch, leaves on the branch, the branch forking, a butterfly, moss, blossoms,
// a ladybird, berries, eggs in the nest, a chick out of them — then, past the list, a leaf, a blossom or a berry every
// EVERY bites, for as long as the yard keeps reading. WORDS says each in the paper's voice (the bar's 「再 N 口就…」).
// Two readers who finish the paper feed it ten to fifteen times a day, so the list is paced for months, not days (the
// owner, 2026-11-09: 這樣兩個人每天餵會不會很快沒招 — the first draft ran out in two months): a thing every ten to thirty
// bites in the first weeks, every fifty to two hundred later, the gap growing, and past the list a leaf, a blossom or
// a berry at those long gaps for as long as the yard reads. Eggs and chicks are not on it: they come with the spring
// (storyOf). Rare days — a hundred songs, the yard's birthday — are the story's too.
const MILESTONES = [[24, "twig"], [36, "twig"], [50, "twig"], [64, "leaf"], [78, "leaf"], [100, "fork"], [118, "butterfly"], [136, "leaf"], [150, "moss"],
  [180, "leaf"], [200, "bloom"], [230, "ladybird"], [260, "bloom"], [290, "leaf"], [320, "berry"], [350, "bloom"], [380, "bath"], [410, "snail"], [440, "berry"],
  [470, "bee"], [500, "leaf"], [530, "berry"], [560, "bloom"], [590, "moss"], [620, "leaf"], [650, "berry"]].map(([at, k]) => ({ at, k }));
const CYCLE = ["leaf", "bloom", "berry"], GAPS = [50, 50, 80, 80, 120, 120, 160, 160, 200];
const WORDS = { twig: "院子裡多一根樹枝", leaf: "枝上長一片葉子", fork: "樹枝分出一枝", butterfly: "有一隻蝴蝶來", moss: "巢裡鋪上青苔", bloom: "開一朵花", ladybird: "來一隻瓢蟲", berry: "結一顆果子", bath: "院子裡放一個水盆", snail: "來一隻蝸牛", bee: "有一隻蜜蜂來" };
const THINGS = { twig: "根樹枝", leaf: "片葉子", fork: "枝分枝", butterfly: "隻蝴蝶", moss: "層青苔", bloom: "朵花", ladybird: "隻瓢蟲", berry: "顆果子", bath: "個水盆", snail: "隻蝸牛", bee: "隻蜜蜂" };
// The milestones reached, the listed ones then the long-gap ones.
function milestones(total) {
  const got = MILESTONES.filter((m) => m.at <= total);
  let at = MILESTONES[MILESTONES.length - 1].at, i = 0;
  while (true) { at += GAPS[Math.min(i, GAPS.length - 1)]; if (at > total) break; got.push({ at, k: CYCLE[i % CYCLE.length] }); i++; }
  return got;
}
function nextMilestone(total) {
  const m = MILESTONES.find((x) => x.at > total);
  if (m) return m;
  let at = MILESTONES[MILESTONES.length - 1].at, i = 0;
  while (at <= total) { at += GAPS[Math.min(i, GAPS.length - 1)]; i++; }
  return { at, k: CYCLE[(i - 1) % CYCLE.length] };
}
// Chinese numerals (第三首、十二片、一百零四).
function cn(n) {
  const d = "零一二三四五六七八九", u = ["", "十", "百", "千"];
  if (n < 10) return d[n];
  if (n < 20) return `十${n % 10 ? d[n % 10] : ""}`;
  let out = "", zero = false;
  String(n).split("").map(Number).reverse().forEach((x, i) => { if (x) { out = d[x] + u[i] + out; zero = false; } else if (!zero && out) { out = d[0] + out; zero = true; } });
  return out.replace(/零+$/, "");
}
const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
// The yard follows the real year, whatever the reading (the owner, 2026-11-09, on my proposal: 四季與節日跟真實日期走、
// 每年一輪的故事): blossom in spring, full leaf in summer, leaves turning and falling in autumn, snow on the branch in
// winter, a star at Christmas. And the bird's own year: it moults in September and October (its colours fade a while),
// rebuilds the nest in March; once the yard has read five hundred pieces a mate comes, and from then on there are eggs
// in the nest in April and May, chicks in June, and in July the young have flown. The yard's birthday is the day it
// was opened; a hundredth song is a day too.
const SEASON = (m) => (m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter");
function storyOf(total, songs, since, date) {
  const [y, m, d] = date.split("-").map(Number), season = SEASON(m), mate = total >= 500;
  const s = { season, mate, molt: m === 9 || m === 10, rebuilt: m === 3, eggs: mate && (m === 4 || m === 5), chicks: mate && m === 6, fledged: mate && m === 7,
    christmas: m === 12 && d >= 20 && d <= 26, birthday: Boolean(since) && since.slice(5) === date.slice(5) && since < date, years: since ? y - Number(since.slice(0, 4)) : 0, hundredth: songs > 0 && songs % 100 === 0 };
  const lines = [];
  if (s.birthday) lines.push(`今天是院子開張${s.years === 1 ? "一週年" : `${cn(s.years)}週年`}。`);
  if (s.hundredth) lines.push(`第${cn(songs)}首歌學會了。`);
  if (s.molt) lines.push("秋天換羽，顏色會淡一陣子，新的羽毛長出來就回來。");
  if (s.rebuilt) lines.push("春天，巢重新築過了。");
  if (s.eggs) lines.push("巢裡有兩顆蛋，兩隻輪流孵。");
  if (s.chicks) lines.push("雛鳥孵出來了，從早到晚張著嘴。");
  if (s.fledged) lines.push("幼鳥飛走了，院子安靜下來。");
  if (!lines.length && mate && m >= 8) lines.push("伴侶還在，兩隻常常一起站在枝上。");
  if (s.christmas) lines.push("枝頭掛了一顆小星星，聖誕快樂。");
  if (!lines.length) lines.push({ spring: "春天，枝上開了花。", summer: "夏天，葉子長滿了枝。", autumn: "秋天，葉子黃了，一片一片掉。", winter: "冬天，枝上積了一層雪。" }[season]);
  s.line = lines.join("");
  return s;
}
export function nestState(n = nest()) {
  if (!n) return null;
  const today = twNow().date, feeds = n.feeds || [], pet = petOf(n);
  const total = feeds.length, si = STAGES.reduce((i, s, j) => (total >= s.at ? j : i), 0), stage = STAGES[si];
  const last = STAGES[STAGES.length - 1].at, songs = total >= last ? 1 + Math.floor((total - last) / SONG) : 0;
  // what the bar runs to: whichever comes first of the next stage, the next thing in the yard, the next song
  const cands = [nextMilestone(total)].map((m) => ({ at: m.at, zh: WORDS[m.k] }));
  if (STAGES[si + 1]) cands.push({ at: STAGES[si + 1].at, zh: STAGES[si + 1].zh });
  if (songs) cands.push({ at: last + songs * SONG, zh: `學會第${cn(songs + 1)}首歌` });
  const next = cands.sort((a, b) => a.at - b.at)[0];
  const got = milestones(total), from = Math.max(stage.at, got.length ? got[got.length - 1].at : 0, songs ? last + (songs - 1) * SONG : 0);
  const items = {};
  for (const m of got) items[m.k] = (items[m.k] || 0) + 1;
  const byMember = (list) => { const m = {}; for (const f of list) m[f.w] = (m[f.w] || 0) + 1; return m; };
  const todays = feeds.filter((f) => f.d === today), todayBy = byMember(todays);
  const week = Array.from({ length: 7 }, (_, i) => { const d = addDays(today, i - 6); return { d, n: feeds.filter((f) => f.d === d).length }; });
  const lastDay = feeds.reduce((m, f) => (f.d > m ? f.d : m), ""), idle = lastDay ? Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${lastDay}T00:00:00Z`)) / 864e5) : null;
  const fed = todays.length;
  const hunger = fed === 0 ? (idle !== null && idle >= 3 ? `${esc(pet.name)}瘦了一點，等人來餵。` : `${esc(pet.name)}今天還沒吃東西。`) : fed <= 2 ? "今天吃了一點。" : fed <= 5 ? "今天吃飽了。" : "今天吃得圓滾滾。";
  const who = Object.entries(todayBy).sort((a, b) => b[1] - a[1]).map(([id, c]) => `${id === n.me ? "你" : esc(n.members?.[id] || "朋友")} ${c}`);
  // grow 0 → 1 over the first eighty bites (size, the first colour); mature 0 → 1 over four hundred (the plumage: a
  // longer tail, more feather lines, specks on the wing, a deeper red) — so the bird itself is a little different
  // after every bite for a long time (the owner: 外觀也要持續變化).
  const story = storyOf(total, songs, n.since, today), mature = Math.min(1, total / 400) * (story.molt ? .6 : 1);
  return { total, stage, si, next, toNext: next.at - total, from, songs, items, story, grow: Math.min(1, total / STAGES[4].at), mature,
    pet, fed, todayBy, who, week, idle, hunger, full: fed >= 3, members: byMember(feeds), everyone: Object.keys(todayBy).length, songNames: songNames(n, songs) };
}

// ——— The songs ———
// Each song the singer learns is named after the 古典欄 piece the yard was reading then (the owner, 2026-11-09, on my
// proposal): the k-th song came with the bite at 160 + 60(k−1); the music article read at or before that bite names
// it by the work in 《》 or 〈〉 in its title or dek. app.js gives the lookup (setLookup); without it, or with no work
// to be found, the song stays 第幾首.
let lookup = null;
export const setLookup = (fn) => { lookup = typeof fn === "function" ? fn : null; };
function songNames(n, songs) {
  if (!songs || !lookup) return [];
  // the k-th song is named by the last music piece read in the sixty bites that taught it (never a piece that already
  // names an earlier song); none there → the song keeps its number
  const feeds = [...(n.feeds || [])].sort((a, b) => a.d.localeCompare(b.d) || a.k.localeCompare(b.k)), out = [], used = new Set();
  const first = STAGES[STAGES.length - 1].at;
  for (let k = 1; k <= songs; k++) {
    const to = Math.min(feeds.length - 1, first + SONG * (k - 1) - 1), from = k === 1 ? 0 : first + SONG * (k - 2);
    let name = "";
    for (let i = to; i >= from && !name; i--) {
      const [d, c] = feeds[i].k.split("/");
      if (c !== "music") continue;
      const a = lookup(d, c), m = `${a?.title || ""} ${a?.dek || ""}`.match(/[《〈]([^》〉]{1,20})[》〉]/);
      if (m && !used.has(m[0])) name = m[0];
    }
    if (name) used.add(name);
    out.push(name);
  }
  return out;
}

// ——— Drawing ———
// A robin, not the crest's emblem (the owner: 鳥可以再逼真一點嗎): facing left on its perch in a 64-unit box, the orange
// face and breast of a real robin, a cream belly, brown back, a darker wing with feather lines and pale specks, the tail
// cocked. What `mature` adds: the tail lengthens (6 → 13), the feather lines come one by one (1 → 5), the specks (0 → 6),
// and style.css deepens the red with --m. `grow` sets the size and brings the colour up from nestling grey (--g).
const WING_LINES = ["M33 33.6 l5.6 4.4", "M35.8 31.8 l6.4 5.6", "M38.6 31 l6 6.2", "M31.2 36.4 l5 3.4", "M41.2 31.6 l4.4 5.8"];
const WING_SPECKS = [[35.2, 35.2], [39.4, 33.8], [42.6, 36.6], [37.2, 38.2], [33.6, 31.8], [44.2, 39.2]];
function robinSvg(st, { perch = true } = {}) {
  const m = st.mature, tail = 6 + 7 * m, lines = 1 + Math.floor(m * 4), specks = Math.floor(m * 6);
  const tx = 44 + tail * 1.5, ty = 41.6 - tail * 1.05;
  return `${perch ? `<path class="r-perch" d="M13 53 L${st.story?.mate ? 61 : 51} 53"/>` : ""}
    <path class="r-tail" d="M43.6 43.4 L${tx.toFixed(1)} ${ty.toFixed(1)} L${(tx + 1.4).toFixed(1)} ${(ty + 2.6).toFixed(1)} L46 46.2 Z"/>
    <path class="r-leg" d="M28.6 48.6 L27.6 53 M34.6 48.2 L35 53 M25.4 53 h4.4 M32.8 53 h4.4"/>
    <path class="r-back" d="M17.6 27.2 C13.2 32.8 13.8 42 20.4 46.8 C26.6 51.2 37.4 51.4 43.4 45.6 C46.8 42.2 47.6 36.8 45.4 32.2 C42.4 26 33 21.6 25 23 C21.8 23.6 19.4 25 17.6 27.2 Z"/>
    <path class="r-belly" d="M19.6 45.2 C24 49.6 34 50.8 41 46.4 C37 47.8 31 47.6 27 46.2 C24 46.6 21.6 46.3 19.6 45.2 Z"/>
    <path class="r-breast" d="M17.6 27.2 C14 32 14.4 40 19.6 45.2 C22.6 48 27.6 49 32 47.6 C32.4 40.2 29.4 32 25.2 27 C23.4 25.6 20.4 25.4 17.6 27.2 Z"/>
    <g class="r-wingg"><path class="r-wing" d="M29.5 30.5 C36 27.8 43.6 30.6 46 38 C41.6 41.8 34.6 41 29.6 35.4 C28.6 33.6 28.8 31.8 29.5 30.5 Z"/>
      ${WING_LINES.slice(0, lines).map((d) => `<path class="r-line" d="${d}"/>`).join("")}
      ${WING_SPECKS.slice(0, specks).map(([x, y]) => `<circle class="r-speck" cx="${x}" cy="${y}" r=".55"/>`).join("")}</g>
    <path class="r-beak" d="M15.6 29.6 L9.8 30.9 L15.7 32.2 Z"/>
    <circle class="r-eye" cx="21.6" cy="29.2" r="1.45"/><circle class="r-eyehi" cx="22.1" cy="28.7" r=".45"/>`;
}
// The egg, before the first bite: on two twigs, on the perch.
const EGG_SCENE = `<path class="r-perch" d="M13 53 L51 53"/><path class="sc-twig" d="M24 54.2 Q32 61 40 54.2 M26.5 54.2 Q32 58.6 37.5 54.2"/>`;
const EGG = `<ellipse class="shell" cx="32" cy="42" rx="8.6" ry="11"/><circle class="spk" cx="29" cy="38" r=".9"/><circle class="spk" cx="35" cy="35.5" r=".7"/><circle class="spk" cx="35.5" cy="44.5" r="1"/><circle class="spk" cx="28.5" cy="46.5" r=".7"/>`;
// What the yard has gathered (nestState items), drawn around the perch: twigs under it make a nest, leaves, blossoms
// and berries along the branch and the fork, moss and eggs and the chick in the nest, the butterfly in the air, the
// ladybird on the branch.
const TWIGS = ["M24 54.2 Q32 61 40 54.2", "M26.5 54.2 Q32 58.6 37.5 54.2", "M22 54.2 Q32 63.5 42 54.2"];
function sceneSvg(it, story) {
  const out = [], n = (k) => it[k] || 0, sea = story?.season;
  for (let i = 0; i < Math.min(n("twig"), 3); i++) out.push(`<path class="sc-twig" d="${TWIGS[i]}"/>`);
  if (n("moss")) out.push(`<path class="sc-moss" d="M25 55.4 q3.5 -2.6 7 0 q3.5 -2.6 7 0"/>`);
  if (n("moss") > 1) out.push(`<path class="sc-moss" d="M27 57.2 q2.5 -2 5 0 q2.5 -2 5 0"/>`);
  if (n("fork")) out.push(`<path class="sc-branch" d="M47 53 L58 44.5"/>`);
  for (let i = 0; i < n("leaf"); i++) {
    if (i < 6 || !n("fork")) { const x = 16 + (i % 8) * 4.3, up = i % 2 === 0, y = up ? 51.2 : 54.9; out.push(`<ellipse class="sc-leaf" cx="${x}" cy="${y}" rx="2.3" ry="1.1" transform="rotate(${up ? -32 : 32} ${x} ${y})"/>`); }
    else { const t = ((i - 6) % 4 + 1) / 5, x = 47 + 11 * t, y = 53 - 8.5 * t, up = i % 2 === 0; out.push(`<ellipse class="sc-leaf" cx="${(x + (up ? 1.2 : -1.2)).toFixed(1)}" cy="${(y + (up ? -1.4 : 1.4)).toFixed(1)}" rx="2.2" ry="1" transform="rotate(${up ? 5 : -75} ${x} ${y})"/>`); }
  }
  for (let i = 0; i < n("bloom"); i++) { const x = 18.5 + (i % 7) * 4.4, y = i % 2 === 1 ? 49.6 : 56.4; out.push(`<circle class="sc-bloom" cx="${x}" cy="${y}" r="1.25"/><circle class="sc-bloomc" cx="${x}" cy="${y}" r=".4"/>`); }
  for (let i = 0; i < n("berry"); i++) { const x = 20.6 + (i % 7) * 4.4; out.push(`<circle class="sc-berry" cx="${x}" cy="${i % 2 === 0 ? 48.4 : 57.6}" r="1.05"/>`); }
  for (let i = 0; i < Math.min(n("egg"), 2); i++) out.push(`<ellipse class="sc-egg" cx="${30 + i * 4}" cy="57.2" rx="1.6" ry="2"/><circle class="spk" cx="${30.4 + i * 4}" cy="56.4" r=".3"/>`);
  if (n("chick")) out.push(`<circle class="sc-chick" cx="32" cy="56.2" r="2.3"/><path class="r-beak" d="M29.8 56.2 l-1.7 .5 l1.7 .6z"/><circle class="r-eye" cx="31" cy="55.6" r=".42"/>`);
  if (n("ladybird")) out.push(`<circle class="sc-lady" cx="43.4" cy="51.5" r="1.5"/><circle class="sc-dot" cx="42.8" cy="51" r=".36"/><circle class="sc-dot" cx="44.1" cy="51.9" r=".36"/>`);
  if (n("butterfly")) out.push(`<g class="sc-bfly"><path d="M56 26 l-3.4 -2.8 l.5 5.4z"/><path d="M56 26 l3.4 -2.8 l-.5 5.4z"/></g>`);
  if (n("bath")) out.push(`<ellipse class="sc-bath" cx="10" cy="59.5" rx="4.6" ry="1.5"/><ellipse class="sc-water" cx="10" cy="59.2" rx="3.4" ry=".8"/>`);
  if (n("snail")) out.push(`<circle class="sc-snail" cx="55.5" cy="51.4" r="1.6"/><path class="sc-snailf" d="M54 52.8 h3.4 l1.2 -1.4"/>`);
  if (n("bee")) out.push(`<g class="sc-bee"><ellipse class="sc-beeb" cx="8" cy="24" rx="1.5" ry="1"/><path class="sc-beew" d="M7.4 23.2 l-.8 -1.6 M8.6 23.2 l.8 -1.6"/><path class="sc-dot" d="M7.6 23.3 v1.4 M8.4 23.3 v1.4" stroke-width=".35"/></g>`);
  // the year's layer
  if (story) {
    if (sea === "spring" || story.rebuilt) for (let i = 0; i < 3; i++) { const x = 19 + i * 11, y = i % 2 ? 56 : 50; out.push(`<circle class="sea-blossom" cx="${x}" cy="${y}" r="1.4"/><circle class="sc-bloomc" cx="${x}" cy="${y}" r=".4"/>`); }
    if (sea === "summer") for (let i = 0; i < 3; i++) { const x = 21 + i * 9.5, up = i % 2 === 0, y = up ? 50.4 : 55.8; out.push(`<ellipse class="sea-leaf" cx="${x}" cy="${y}" rx="2.8" ry="1.3" transform="rotate(${up ? -28 : 28} ${x} ${y})"/>`); }
    if (sea === "autumn") for (let i = 0; i < 3; i++) { const x = 15 + i * 13, y = 59 + (i % 2) * 2; out.push(`<ellipse class="sea-fallen" cx="${x}" cy="${y}" rx="2.1" ry=".9" transform="rotate(${-20 + i * 25} ${x} ${y})"/>`); }
    if (sea === "winter") { out.push(`<path class="sea-snow" d="M14 52.1 L50 52.1"/>`); for (let i = 0; i < 5; i++) out.push(`<circle class="sea-flake" cx="${8 + i * 12}" cy="${14 + (i % 3) * 7}" r=".7"/>`); }
    if (story.christmas) out.push(`<path class="sea-star" d="M58 44 l.9 1.9 2.1 .3 -1.5 1.5 .4 2.1 -1.9 -1 -1.9 1 .4 -2.1 -1.5 -1.5 2.1 -.3z"/>`);
    if (story.eggs || story.chicks) { if (n("twig") < 2) out.push(`<path class="sc-twig" d="${TWIGS[0]}"/><path class="sc-twig" d="${TWIGS[1]}"/>`); }
    if (story.eggs) for (let i = 0; i < 2; i++) out.push(`<ellipse class="sc-egg" cx="${30 + i * 4}" cy="57.2" rx="1.6" ry="2"/><circle class="spk" cx="${30.4 + i * 4}" cy="56.4" r=".3"/>`);
    if (story.chicks) for (let i = 0; i < 2; i++) out.push(`<circle class="sc-chick" cx="${30 + i * 4.4}" cy="56.4" r="2.1"/><path class="r-beak" d="M${28 + i * 4.4} 56.4 l-1.5 .5 l1.5 .6z"/><circle class="r-eye" cx="${29.2 + i * 4.4} " cy="55.8" r=".4"/>`);
  }
  return out.join("");
}
// The mate (storyOf): a second, slightly smaller robin at the right end of the branch, facing the same way.
const mateSvg = (st) => `<g class="mate" transform="translate(37 23.85) scale(.55)">${robinSvg({ ...st, mature: Math.min(st.mature, .5) }, { perch: false })}</g>`;
// Two layers (the owner, 2026-11-09: 樹葉枝枒不應該跟著鳥飛): the scene — perch, nest, leaves, the mate, the year — stands
// still in its own svg, and only the robin's svg hops, looks round and flies (liveBird animates .robin).
const PERCH = (long) => `<path class="r-perch" d="M13 53 L${long ? 61 : 51} 53"/>`;
export const birdSvg = (st) => `<div class="bird s${st.si}${st.full ? " full" : ""} season-${st.story?.season || "none"}" style="--g:${st.grow.toFixed(3)};--m:${st.mature.toFixed(3)}" aria-hidden="true"><svg class="scene" viewBox="0 0 64 64">${st.si ? PERCH(st.story?.mate) + (st.story?.mate ? mateSvg(st) : "") + sceneSvg(st.items, st.story) : EGG_SCENE}</svg><svg class="robin" viewBox="0 0 64 64"><g class="body">${st.si ? robinSvg(st, { perch: false }) : EGG}</g></svg>${st.si >= 5 ? `<i class="note">♪</i><i class="note two">♫</i>${st.songs >= 3 ? '<i class="note three">♬</i>' : ""}` : ""}</div>`;
const bar = (st) => `<span class="bar"><i style="width:${Math.round(((st.total - st.from) / Math.max(1, st.next.at - st.from)) * 100)}%"></i></span><span class="next">再 ${st.toNext} 口就${st.next.zh}</span>`;
// Under the name: the stage, and for the singer how many songs it knows.
const stageLine = (st) => `<span class="stage">${esc(st.stage.zh)}<i>${esc(st.stage.de)}</i>${st.songs ? `<em>會唱${st.songs === 1 ? "一首歌" : `${cn(st.songs)}首歌`}</em>` : ""}</span>`;

// The plate at the head of 收藏 (app.js viewSaved; the owner, 2026-11-09: 放到收藏會好一點 — the yard is the reader's own
// thing, like the stamps): a framed card the width of the shelf, the bird on its perch at the left, the bird's name,
// its stage, who fed it today, a hairline to the next thing; with no yard yet, the same card with the egg and one line
// that opens the page where a yard is opened.
export function nestBox() {
  const n = nest();
  if (!n) return `<a class="nest plate hint" href="#/nest" aria-label="後院：還沒有後院"><div class="bird s0" aria-hidden="true"><svg class="scene" viewBox="0 0 64 64">${EGG_SCENE}</svg><svg class="robin" viewBox="0 0 64 64"><g class="body">${EGG}</g></svg></div><div class="txt"><span class="k">後院<i>Hinterhof</i></span><b>還沒有後院</b><span class="say">和另一個有這份報紙的人一起養一隻知更鳥：讀完一篇就餵牠一口。</span><span class="next">開一個後院 →</span></div></a>`;
  const st = nestState(n);
  return `<a class="nest plate" href="#/nest" aria-label="後院：${esc(st.pet.name)}，${esc(st.stage.zh)}，今天吃了 ${st.fed} 口">${birdSvg(st)}<div class="txt">
      <span class="k">後院<i>Hinterhof</i></span>
      <b>${esc(st.pet.name)}</b>${stageLine(st)}
      <span class="say">${st.fed ? `今天吃了 ${st.fed} 口：${st.who.join("、")}。` : st.hunger}</span>
      ${bar(st)}</div></a>`;
}
// Bites by the others that this reader has not looked at yet (rm.nest.seen = how many of theirs were there when 收藏
// was last opened): the 收藏 tab wears a small mark while there are any (app.js, like the serial's folded corner).
export function nestUnseen() { const n = nest(); return n ? Math.max(0, n.feeds.filter((f) => f.w !== n.me).length - (n.seen || 0)) : 0; }
export function nestSeen() { const n = nest(); if (n) { n.seen = n.feeds.filter((f) => f.w !== n.me).length; save(n); } }

// ——— Life ———
// The bird is never quite still (the owner, 2026-11-09: 我要他會飛來飛去，但不是單調的飛): every few seconds, at a random
// moment, it does one random thing from what its age allows. An egg rocks. A nestling hops, pecks, looks round. From
// the fledgling on it also flies — a swoop out and back, a loop, a dash to one side and a glide home, a hop along the
// branch — never the same path twice in a row, as far as the box is wide, wings beating (style.css .flying), and lands
// back on its perch. `fly: false` (the plate on 收藏) keeps it to the small things. Reduced motion: it only sits.
const between = (a, b) => a + Math.random() * (b - a);
const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export function liveBird(root, { fly = true } = {}) {
  const bird = root?.querySelector(".bird"), robin = bird?.querySelector(".robin");
  if (!bird || !robin || calm()) return;
  const si = Number((bird.className.match(/\bs(\d)\b/) || [])[1] || 0);
  const timers = [];
  const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));
  const run = (frames, ms, easing = "ease-in-out") => robin.animate(frames, { duration: ms, easing, fill: "none" }).finished.catch(() => {});
  const T = (x, y, flip = false, rot = 0) => ({ transform: `translate(${x}px, ${y}px) scaleX(${flip ? -1 : 1}) rotate(${rot}deg)` });
  const amp = () => Math.max(60, Math.min(230, (root.clientWidth || 320) / 2 - 60));
  const rock = () => run([T(0, 0), T(0, 0, false, -6), T(0, 0, false, 5), T(0, 0, false, -3), T(0, 0)], 900);
  const hop = () => run([T(0, 0), T(0, -7), T(0, 0), T(0, -4), T(0, 0)], 520, "ease-out");
  const peck = () => run([T(0, 0), T(0, 3, false, 10), T(0, 0), T(0, 3, false, 10), T(0, 0)], 700);
  const look = async () => { await run([T(0, 0), T(0, 0, true)], 120); await wait(between(500, 1500)); await run([T(0, 0, true), T(0, 0)], 120); };
  const preen = () => run([T(0, 0), T(2, 1, false, -14), T(2, 1, false, -12), T(2, 1, false, -14), T(0, 0)], 1300);
  const fliers = [
    () => { const a = amp(), d = Math.random() < .5 ? 1 : -1; // swoop out and back
      return run([T(0, 0), T(.3 * a * d, -55, d > 0), T(.75 * a * d, -25, d > 0), T(a * d, -80, d > 0), T(.5 * a * d, -115, d < 0), T(.1 * a * d, -40, d < 0), T(0, 0)], between(2600, 3400)); },
    () => { const a = amp() * .8, d = Math.random() < .5 ? 1 : -1; // a loop in the air
      return run([T(0, 0), T(.4 * a * d, -70, d > 0), T(a * d, -40, d > 0), T(.9 * a * d, -120, d < 0), T(.3 * a * d, -130, d < 0), T(-.2 * a * d, -70, d < 0), T(0, 0)], between(3000, 3800)); },
    () => { const a = amp(), d = Math.random() < .5 ? 1 : -1; // a dash to the side, a pause there, a glide home
      return (async () => { await run([T(0, 0), T(.6 * a * d, -60, d > 0), T(a * d, -30, d > 0)], 1100, "ease-out"); await wait(between(500, 1400)); await run([T(a * d, -30, d < 0), T(.5 * a * d, -70, d < 0), T(0, 0)], 1300, "ease-in-out"); })(); },
    () => run([T(0, 0), T(-10, -6), T(-14, 0), T(-4, -6), T(6, 0), T(14, -6), T(10, 0), T(0, -4), T(0, 0)], 1500, "ease-in-out"), // hopping along the branch
  ];
  let lastFly = -1;
  const pick = () => {
    if (si === 0) return rock;
    if (si < 3 || !fly) return [hop, peck, look, preen, hop][Math.floor(Math.random() * 5)];
    if (Math.random() < .45) return [hop, look, preen][Math.floor(Math.random() * 3)];
    let i; do { i = Math.floor(Math.random() * fliers.length); } while (i === lastFly && fliers.length > 1);
    lastFly = i;
    return () => { bird.classList.add("flying"); return fliers[i]().finally(() => bird.classList.remove("flying")); };
  };
  (async () => {
    await wait(between(800, 2000));
    while (bird.isConnected) { await pick()(); await wait(between(1800, 6000)); }
    timers.forEach(clearTimeout);
  })();
}
// Out of the yard and across the paper (the owner, 2026-11-09: 我在滑首頁的時候鳥會飛出來): a fledgling or older flies
// across the screen, in at one edge and out at the other, dipping and climbing, wings beating, and a tap on it opens
// the yard; a nestling hops across the foot of the page instead. One at a time, and never with reduced motion.
export function flyBy() {
  const n = nest();
  if (!n || calm() || document.querySelector(".flyby")) return false;
  const st = nestState(n);
  if (st.si === 0) return false;
  const el = document.createElement("a");
  el.href = "#/nest"; el.className = "flyby"; el.setAttribute("aria-label", `${st.pet.name}飛過去了，到後院看牠`);
  el.innerHTML = birdSvg(st).replace('class="bird ', st.si >= 3 ? 'class="bird flying ' : 'class="bird ');
  document.body.append(el);
  const W = innerWidth, H = innerHeight, d = Math.random() < .5 ? 1 : -1, x0 = d > 0 ? -80 : W + 20, x1 = d > 0 ? W + 20 : -80;
  const T = (x, y, rot = 0) => ({ transform: `translate(${x}px, ${y}px) scaleX(${d > 0 ? -1 : 1}) rotate(${rot}deg)` });
  let frames, ms;
  if (st.si >= 3) {
    const y0 = H * between(.16, .42), f = (t) => x0 + (x1 - x0) * t;
    frames = [T(x0, y0, 0), T(f(.2), y0 - between(20, 60), -d * 6), T(f(.42), y0 + between(0, 40), d * 5), T(f(.62), y0 - between(30, 80), -d * 8), T(f(.82), y0 - between(0, 30), d * 4), T(x1, y0 - between(20, 70), 0)];
    ms = between(2800, 3900);
  } else {
    const y0 = H - 92, f = (t) => x0 + (x1 - x0) * t; // the nestling hops along the foot
    frames = []; for (let i = 0; i <= 12; i++) frames.push(T(f(i / 12), y0 - (i % 2 ? 12 : 0)));
    ms = between(3400, 4200);
  }
  el.animate(frames, { duration: ms, easing: st.si >= 3 ? "ease-in-out" : "linear", fill: "forwards" }).finished.then(() => el.remove(), () => el.remove());
  return true;
}
// The front page's scroll handler (app.js viewFront): a first fly-by after a little scrolling, then now and then — a
// good scroll since the last one, half a minute at least, and a coin toss — so it stays a surprise.
export function scrollFlyer() {
  let acc = 0, last = 0, lastY = window.scrollY, times = 0;
  return () => {
    // A jump of the page (a route restoring its place, 接著讀, a tap on the tab) is not the reader scrolling: a finger moves
    // the page well under a screen between two scroll events, so a bigger step is left out of the count.
    const y = window.scrollY, step = Math.abs(y - lastY); lastY = y;
    if (step < 1200) acc += step;
    if (document.hidden || acc < (times ? 900 : 320) || Date.now() - last < (times ? 35000 : 0)) return;
    acc = 0;
    if (times && Math.random() < .45) return;
    if (flyBy()) { last = Date.now(); times++; }
  };
}

// ——— The feed notice ———
// What the reader sees when a piece they finished fed the bird (app.js markRead; the owner, 2026-11-09: 讀完文章為了鳥的
// 通知有美感一點): not the plain toast but a small card above the nav — the robin itself, hopping in, the bird's name,
// one line in the paper's voice (different each time; the stage or the thing this very bite brought, when it did),
// and what the next bite is for. A tap opens the yard; it leaves on its own after a few seconds.
const FEED_LINES = [ // the card carries the name above the line, so the line says 牠/他/她 and never the name again
  (p) => `${p}吃了一口，歪著頭看你。`, (p) => `一口下肚，${p}抖了抖羽毛。`, (p) => `${p}接住了這一口，跳到枝頭另一邊。`,
  (p) => `吃了一口，${p}把嘴在枝上擦了擦。`, (p) => `${p}一口吞下，又張開嘴等下一口。`, (p) => `這一口${p}吃得很慢，像在想什麼。`,
];
export function feedNotice(before, after) {
  if (!after) return;
  document.querySelector(".feed-note")?.remove();
  const n = after.pet.name, p = after.pet.p;
  let line;
  if (before && after.si > before.si) line = `這一口，${p}${after.si === 1 ? "破殼了" : after.si === 2 ? "長出絨毛了" : after.si === 3 ? "開始學飛了" : after.si === 4 ? "長成成鳥了" : "成了歌者"}。`;
  else if (before && after.songs > before.songs) line = `這一口，${p}學會了第${cn(after.songs)}首歌。`;
  else if (before && Object.values(after.items).reduce((a, b) => a + b, 0) > Object.values(before.items).reduce((a, b) => a + b, 0)) line = `這一口，${WORDS[Object.keys(after.items).find((k) => (after.items[k] || 0) > (before.items[k] || 0))] || "院子裡多了一樣東西"}。`;
  else line = FEED_LINES[Math.floor(Math.random() * FEED_LINES.length)](p);
  const el = document.createElement("a");
  el.href = "#/nest"; el.className = "feed-note"; el.setAttribute("role", "status");
  el.innerHTML = `${birdSvg(after)}<span class="t"><b>${esc(n)}</b><span class="l">${esc(line)}</span><span class="n">再 ${after.toNext} 口就${esc(after.next.zh)}</span></span>`;
  document.body.append(el);
  requestAnimationFrame(() => el.classList.add("on"));
  const away = () => { el.classList.remove("on"); setTimeout(() => el.remove(), 500); };
  const t = setTimeout(away, 4200);
  el.addEventListener("click", () => { clearTimeout(t); el.remove(); });
}

// ——— The voice ———
// A robin's calls, made on the spot with the Web Audio API — no sound file, nothing fetched, works offline (the owner,
// 2026-11-09: 可以有聲音嗎，點它一下的時候). Short high whistles with a quick pitch bend: a nestling's thin peep, the
// 「tic」 of a look, a two-note call, a song of five to eight notes that is never the same twice, a rustle of feathers
// (filtered noise), and the egg's soft knock. Only on a tap, never on its own; quiet; and 後院設定 can turn it off
// (rm.nest.sound). The context is made inside the tap, which is what iOS needs.
let actx = null;
export const soundOn = () => nest()?.sound !== false;
export function setSound(on) { const n = nest(); if (n) { n.sound = Boolean(on); save(n); } }
function audio() {
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); return actx; } catch { return null; }
}
function whistle(ctx, t0, f0, f1, dur, vol = .11, type = "sine") {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + dur);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .012); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
  o.connect(g).connect(ctx.destination); o.start(t0); o.stop(t0 + dur + .03);
}
function rustle(ctx, t0, dur = .16, vol = .05) {
  const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = b; f.type = "bandpass"; f.frequency.value = 2600; f.Q.value = .8; g.gain.value = vol;
  src.connect(f).connect(g).connect(ctx.destination); src.start(t0);
}
export function chirp(kind) {
  if (!soundOn()) return;
  const ctx = audio(); if (!ctx) return;
  const t = ctx.currentTime + .02;
  if (kind === "peep") whistle(ctx, t, 5200, 6300, .08, .07);
  else if (kind === "tic") whistle(ctx, t, 3200, 2500, .035, .07);
  else if (kind === "call") { whistle(ctx, t, 3700, 4700, .07); whistle(ctx, t + .12, 4400, 3500, .09, .09); }
  else if (kind === "hop") { whistle(ctx, t, 3000, 2600, .03, .06); whistle(ctx, t + .28, 3000, 2600, .03, .06); }
  else if (kind === "rustle") rustle(ctx, t);
  else if (kind === "egg") whistle(ctx, t, 230, 170, .09, .07, "triangle");
  else if (kind === "song") {
    let at = t; const n = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) {
      const f0 = 2400 + Math.random() * 3000, bend = .7 + Math.random() * .7, dur = .06 + Math.random() * .09;
      whistle(ctx, at, f0, f0 * bend, dur, .1);
      if (Math.random() < .3) whistle(ctx, at + dur * .5, f0 * 1.5, f0 * 1.2, dur * .5, .05); // a trill on top now and then
      at += dur + .05 + Math.random() * .11;
    }
  }
}

// ——— A tap on the bird ———
// In the yard the bird answers a tap (the owner, 2026-11-09: 在後院點一下鳥可以有互動): it tilts its head, calls, hops a
// little nearer, shakes its feathers, or — a singer — sings one of its songs, notes rising; an egg only rocks, a
// nestling gapes for food. One line under it says what it did. The reaction rides on top of whatever liveBird is
// doing (composite add), and taps while one plays are let go.
let poking = false;
export function pokeBird(root, st) {
  const bird = root?.querySelector(".bird"), robin = bird?.querySelector(".robin");
  if (!bird || !robin || poking) return;
  poking = true;
  const n = st.pet.name, p = st.pet.p;
  const say = (text) => { const l = root.querySelector(".poke-line"); if (!l) return; l.textContent = text; l.classList.add("on"); clearTimeout(l._t); l._t = setTimeout(() => l.classList.remove("on"), 2400); };
  const still = calm();
  const run = (frames, ms, easing = "ease-in-out") => still ? Promise.resolve() : robin.animate(frames, { duration: ms, easing, fill: "none", composite: "add" }).finished.catch(() => {});
  const T = (x, y, rot = 0, sx = 1) => ({ transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scaleX(${sx})` });
  const notes = (k) => { for (let i = 0; i < k; i++) setTimeout(() => { const e = document.createElement("i"); e.className = "poke-note"; e.textContent = ["♪", "♫", "♬"][i % 3]; e.style.left = `${52 + Math.random() * 18}%`; bird.append(e); setTimeout(() => e.remove(), 1500); }, i * 260); };
  let act;
  if (st.si === 0) act = async () => { chirp("egg"); say("蛋晃了一下。"); await run([T(0, 0), T(0, 0, -8), T(0, 0, 7), T(0, 0, -4), T(0, 0)], 700); };
  else if (st.si < 3) act = [
    async () => { chirp("peep"); say(`${n}張大了嘴，以為有東西吃。`); await run([T(0, 0), T(0, -3, -6), T(0, -3, -6), T(0, 0)], 900); },
    async () => { chirp("rustle"); say(`${n}縮成一團，又慢慢探出頭。`); await run([T(0, 2, 0, .9), T(0, 2, 0, .9), T(0, 0, 0, 1)], 1300); },
    async () => { chirp("peep"); say(`${n}細細地叫了一聲。`); notes(1); await run([T(0, 0), T(0, -2, -4), T(0, 0)], 500); },
    async () => { chirp("hop"); say(`${n}往你這邊挪了挪。`); await run([T(0, 0), T(-5, -3), T(-8, 0), T(-8, 0), T(0, 0)], 1200, "ease-out"); },
  ][Math.floor(Math.random() * 4)];
  else {
    const picks = [
      async () => { chirp("tic"); say(`${n}歪著頭看你。`); await run([T(0, 0), T(0, 0, -13), T(0, 0, -13), T(0, 0)], 1300); },
      async () => { chirp("call"); say(`${n}叫了一聲。`); notes(1); await run([T(0, 0), T(0, -2, -5), T(0, 0)], 500); },
      async () => { chirp("hop"); say(`${n}跳近了一點。`); await run([T(0, 0), T(-9, -8), T(-16, 0), T(-16, 0), T(-8, -6), T(0, 0)], 1400, "ease-out"); },
      async () => { chirp("rustle"); say(`${n}抖了抖羽毛。`); await run([T(0, 0), T(0, 0, 0, 1.07), T(0, 0, 0, .94), T(0, 0, 0, 1.06), T(0, 0, 0, .96), T(0, 0)], 700, "linear"); },
    ];
    if (st.songs) { const named = st.songNames.filter(Boolean); picks.push(async () => { chirp("song"); say(`${n}唱起${named.length ? named[Math.floor(Math.random() * named.length)] : `第${cn(1 + Math.floor(Math.random() * st.songs))}首歌`}。`); notes(3); await run([T(0, 0), T(0, -2, -4), T(0, 0), T(0, -2, -4), T(0, 0)], 1400); }); }
    act = picks[Math.floor(Math.random() * picks.length)];
  }
  act().finally(() => { poking = false; });
}

// ——— The pages (#/nest, #/nest/settings) ———
// The yard's page is the bird: its name, stage, today, the week, the people, and one row to its settings. Everything
// that is set rather than watched — opening or joining a yard, the bird's name, the invite code, leaving — lives on
// 後院設定, one page (the owner, 2026-11-09: 關於巢的設定全部收納到一個他的設定頁面). Without a yard the page is the
// settings page, since there is nothing to watch yet. `api` is config.json nest.api; without it the pages say the
// yard is this phone alone. `afterSync`: this draw follows a sync, so it does not start another (a draw that synced,
// and a sync that redrew, chased each other round until the store refused the phone, 2026-11-09).
export function renderNest(el, api, afterSync = false) {
  const n = nest();
  if (!n) { renderNestSettings(el, api); return; }
  const head = `<header class="page-title"><h1>後院</h1><span class="de">Hinterhof</span></header>`;
  const st = nestState(n), today = twNow().date, pet = st.pet;
  const names = Object.entries(n.members || {}).map(([id, name]) => `<li><span>${id === n.me ? `${esc(name)}（你）` : esc(name)}</span><b>${st.members[id] || 0} 口</b></li>`).join("");
  const wk = st.week.map((w) => `<li${w.d === today ? ' class="today"' : ""}><i style="height:${Math.min(100, w.n * 14)}%"></i><span>${Number(w.d.slice(8))}</span></li>`).join("");
  const synced = n.synced ? `上次同步 ${new Date(n.synced).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false })}` : "";
  const got = Object.entries(st.items).map(([k, c]) => `${cn(c)}${THINGS[k]}`);
  el.innerHTML = `${head}
    <div class="nest-stage">${birdSvg(st)}<p class="poke-line" aria-live="polite"></p>
      <b>${esc(pet.name)}</b>${stageLine(st)}
      <p class="say">${st.songs > 1 ? `又學會了一首，現在會唱${cn(st.songs)}首歌；每首都比上一首長一點。` : esc(st.stage.say(pet.p))}</p>
      <p class="today">${st.fed ? `今天吃了 ${st.fed} 口：${st.who.join("、")}。${st.everyone > 1 ? "大家都餵過了。" : ""}` : st.hunger}</p>
      ${st.si ? `<p class="season">${esc(st.story.line)}</p>` : ""}
      ${bar(st)}
      <details class="nest-more"><summary>院子裡有什麼<span class="de">Inventar</span></summary>
        <p class="small">全院一共讀了 ${st.total} 篇${n.since ? `，從 ${esc(fmtDate(n.since, "short"))} 開院算起` : ""}${got.length ? `。院子裡有${got.join("、")}` : ""}${st.story.mate ? "，還有一隻伴侶" : ""}。</p>
        ${st.songs ? `<p class="small songs">會唱的歌：${st.songNames.map((s, i) => s ? esc(s) : `第${cn(i + 1)}首`).join("、")}。</p>` : ""}</details></div>
    <section class="set"><h2>這七天</h2><ol class="nest-week" aria-label="這七天每天餵了幾口">${wk}</ol></section>
    <section class="set"><h2>院子裡的人</h2><ul class="nest-members">${names}</ul>
      ${api ? `<p class="small">${synced || "還沒同步過"}。</p>` : `<p class="small nest-note">共用儲存還沒接上：現在只有這支手機的紀錄，接上以後會把大家的餵食和名字同步過來。</p>`}</section>
    <p class="nest-to-set"><a href="#/nest/settings">後院設定<span class="de">Einstellungen</span> →</a></p>`;
  liveBird(el.querySelector(".nest-stage"));
  const stageEl = el.querySelector(".nest-stage"), birdEl = stageEl.querySelector(".bird");
  birdEl.setAttribute("role", "button"); birdEl.setAttribute("aria-label", `摸摸${pet.name}`); birdEl.removeAttribute("aria-hidden"); birdEl.tabIndex = 0;
  birdEl.addEventListener("click", () => pokeBird(stageEl, nestState()));
  birdEl.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pokeBird(stageEl, nestState()); } });
  if (!afterSync) syncNest(api).then((ok) => { if (ok && el.isConnected && location.hash === "#/nest") renderNest(el, api, true); });
}
// 後院設定: open a yard or join one; with a yard, the bird's name and how it is called, the invite code to pass on,
// joining another yard instead (which leaves this one), and the way out.
export function renderNestSettings(el, api, afterSync = false) {
  const n = nest();
  const head = `<header class="page-title"><h1>後院設定</h1><span class="de">Einstellungen</span></header>`;
  const joinForm = (ghost) => `<input class="search" data-join-code autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="NEST-XXXX-XXXX" aria-label="邀請碼">
        <input class="search" data-join-name maxlength="12" placeholder="你的名字（朋友會看到，最多 12 字）" aria-label="你的名字">
        <div class="btns"><button type="button" class="btn${ghost ? " ghost" : ""}" data-join>加入</button></div>`;
  const wireJoin = (sure) => {
    el.querySelector("[data-join]").onclick = (e) => {
      const code = normCode(el.querySelector("[data-join-code]").value);
      if (!CODE_RE.test(code)) { toast("邀請碼要像 NEST-XXXX-XXXX"); return; }
      if (sure && !e.currentTarget.dataset.sure) { e.currentTarget.dataset.sure = "1"; e.currentTarget.textContent = "會離開現在的後院，確定就再按一次"; return; }
      joinNest(code, el.querySelector("[data-join-name]").value.trim().slice(0, 12)); toast("加入了");
      if (location.hash === "#/nest") renderNest(el, api); else location.hash = "#/nest"; // the yard-less #/nest is this form: the same hash fires no hashchange, so draw (and sync) the yard here
    };
  };
  if (!n) {
    el.innerHTML = `${head}
      <p class="gig-intro">兩個人以上一起養一隻知更鳥。每讀完一篇，就是餵牠一口；大家讀的加在一起，牠從一顆蛋長成會唱歌的鳥，院子裡也一直有新的東西。餓著不會死，只會瘦一點。</p>
      <section class="set"><h2>開一個後院</h2><p class="small">先填一個名字，院子裡的人會看到是誰餵的；開好會拿到一組邀請碼，傳給另一個有這份報紙的人。</p>
        <input class="search" data-build-name maxlength="12" placeholder="你的名字（朋友會看到，最多 12 字）" aria-label="你的名字">
        <div class="btns"><button type="button" class="btn" data-build>開後院</button></div></section>
      <section class="set"><h2>加入別人的後院</h2>${joinForm(true)}</section>
      ${api ? "" : `<p class="small nest-note">共用儲存還沒接上：現在開的後院只在這支手機裡，接上以後，餵食紀錄和院子裡的人會自動同步。</p>`}`;
    el.querySelector("[data-build]").onclick = () => { buildNest(el.querySelector("[data-build-name]").value.trim().slice(0, 12)); toast("後院開好了"); location.hash = "#/nest/settings"; renderNestSettings(el, api, true); syncNest(api).then((ok) => ok && el.isConnected && renderNestSettings(el, api, true)); };
    wireJoin(false);
    return;
  }
  const pet = petOf(n);
  el.innerHTML = `${head}
    <section class="set"><h2>取名</h2><p class="small">院子裡的人都會看到這個名字。知更鳥公鳥和母鳥長得一樣，看不出來，所以${pet.p}是他還是她，由你們決定。</p>
      <input class="search" data-pet-name maxlength="12" value="${esc(pet.named ? pet.name : "")}" placeholder="牠的名字（最多 12 字）" aria-label="鳥的名字">
      <nav class="chips" aria-label="怎麼稱呼">${PRONOUNS.map((p) => `<button type="button" class="chip" data-p="${p}" aria-pressed="${p === pet.p}">${p}</button>`).join("")}</nav>
      <div class="btns"><button type="button" class="btn ghost" data-pet-save>改好了</button></div></section>
    <section class="set"><h2>聲音</h2><p class="small">在後院點${pet.p}的時候會叫一聲。只有點的時候才響，不會自己叫。</p>
      <nav class="chips" aria-label="聲音"><button type="button" class="chip" data-snd="1" aria-pressed="${soundOn()}">開</button><button type="button" class="chip" data-snd="0" aria-pressed="${!soundOn()}">關</button></nav></section>
    <section class="set"><h2>邀請碼</h2><p class="small">給另一個有這份報紙的人，在設定裡的「後院」輸入，就進同一個院子。</p>
      <div class="nest-code"><code>${esc(n.code)}</code><button type="button" class="btn ghost" data-copy>複製</button></div></section>
    <section class="set"><h2>你在院子裡的名字</h2><p class="small">餵食紀錄旁邊顯示的名字，現在是「${esc(n.name)}」。</p>
      <input class="search" data-me-name maxlength="12" value="${esc(n.name)}" placeholder="你的名字（最多 12 字）" aria-label="你的名字">
      <div class="btns"><button type="button" class="btn ghost" data-me-save>改好了</button></div></section>
    <section class="set"><h2>換一個後院</h2><p class="small">輸入別人的邀請碼就搬過去；這支手機會離開現在的院子，鳥和院子都還在，別人可以繼續養。</p>${joinForm(true)}</section>
    <section class="set"><h2>離開</h2><p class="small">離開以後，這支手機不再餵這隻鳥；院子和鳥都還在，別人可以繼續養。</p>
      <div class="btns"><button type="button" class="btn ghost" data-leave>離開這個後院</button></div></section>
    ${api ? "" : `<p class="small nest-note">共用儲存還沒接上：現在只有這支手機的紀錄。</p>`}`;
  el.querySelector("[data-copy]").onclick = async () => { try { await navigator.clipboard.writeText(n.code); toast("邀請碼複製好了"); } catch { toast("複製不了，請長按邀請碼複製"); } };
  el.querySelector("[data-leave]").onclick = (e) => {
    if (e.currentTarget.dataset.sure) { leaveNest(); toast("離開了"); renderNestSettings(el, api); return; }
    e.currentTarget.dataset.sure = "1"; e.currentTarget.textContent = "確定離開？再按一次";
  };
  el.querySelector(".chips").addEventListener("click", (e) => { const b = e.target.closest("button[data-p]"); if (!b) return; el.querySelectorAll(".chips [data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); });
  el.querySelectorAll("[data-snd]").forEach((b) => b.addEventListener("click", () => { setSound(b.dataset.snd === "1"); el.querySelectorAll("[data-snd]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); if (b.dataset.snd === "1") chirp("call"); }));
  el.querySelector("[data-pet-save]").onclick = () => {
    namePet(el.querySelector("[data-pet-name]").value, el.querySelector('.chips [aria-pressed="true"]')?.dataset.p);
    toast(petOf().named ? `${petOf().name}，記住了` : "名字拿掉了，叫回知更鳥");
    syncNest(api);
  };
  el.querySelector("[data-me-save]").onclick = () => {
    const cur = nest(), v = el.querySelector("[data-me-name]").value.trim().slice(0, 12);
    if (!cur || !v) { toast("名字不能空白"); return; }
    cur.name = v; cur.members[cur.me] = v; save(cur); toast("記住了"); syncNest(api).then(() => el.isConnected && renderNestSettings(el, api, true));
  };
  wireJoin(true);
  if (!afterSync) syncNest(api).then((ok) => { if (ok && el.isConnected && location.hash === "#/nest/settings") renderNestSettings(el, api, true); });
}

// ——— Sharing ———
// POST {api}/{code} with this phone's member, its pending feeds and (when changed here) the bird's name; the answer is
// the yard as the store holds it (members, every feed, the name), which replaces the local log — the store is the one
// truth, the phone's pending list the only thing it can add. Resolves true when the local state changed. No api,
// offline, or a failing store: nothing changes, the pending feeds wait for next time.
let syncing = null, again = false;
export function syncNest(api) {
  const n = nest();
  if (!n || !api || !/^https:\/\//.test(api)) return Promise.resolve(false);
  // A feed during a sync in flight is not in that request: run once more when it is done, so nothing waits for the
  // next page (the owner's first bite on 2026-11-09 sat pending until the page was opened again).
  if (syncing) { again = true; return syncing; }
  syncing = (async () => {
    try {
      const body = { member: { id: n.me, name: n.name }, feeds: n.pending || [] };
      if (n.petDirty && n.pet) body.pet = n.pet;
      const r = await fetch(`${api.replace(/\/$/, "")}/${n.code}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      if (!data || typeof data.members !== "object" || !Array.isArray(data.feeds)) throw new Error("shape");
      const sent = new Set((n.pending || []).map((f) => `${f.w}|${f.k}`)), got = new Set(data.feeds.map((f) => `${f.w}|${f.k}`));
      const cur = nest(); if (!cur || cur.code !== n.code) return false;
      cur.members = { ...data.members, [cur.me]: cur.name };
      // This phone's own bites of the last month the store no longer holds (another phone's write, from a stale KV read,
      // overwrote them after they were confirmed) go out again; the store keeps one bite per member and article.
      const back = addDays(twNow().date, -30);
      for (const f of cur.feeds || []) if (f.w === cur.me && f.d >= back && !got.has(`${f.w}|${f.k}`) && !(cur.pending || []).some((g) => g.w === f.w && g.k === f.k)) (cur.pending ||= []).push(f);
      cur.feeds = data.feeds.filter((f) => f && typeof f.d === "string" && typeof f.w === "string" && typeof f.k === "string");
      cur.pending = (cur.pending || []).filter((f) => !sent.has(`${f.w}|${f.k}`) || !got.has(`${f.w}|${f.k}`)); // kept: fed since the request went out, or the store lost it
      for (const f of cur.pending) if (!cur.feeds.some((g) => g.w === f.w && g.k === f.k)) cur.feeds.push(f);
      for (const f of cur.feeds) if (/^\d{4}-\d{2}-\d{2}$/.test(f.d) && (!cur.since || f.d < cur.since)) cur.since = f.d; // a joining phone's since is its join day; the yard opened by its first bite at the latest
      if (body.pet && cur.petDirty && JSON.stringify(cur.pet) === JSON.stringify(body.pet)) cur.petDirty = false; // unless renamed again meanwhile
      if (!cur.petDirty && data.pet && typeof data.pet === "object") cur.pet = { name: String(data.pet.name || "").slice(0, 12), p: PRONOUNS.includes(data.pet.p) ? data.pet.p : "牠" };
      cur.synced = Date.now();
      save(cur);
      return true;
    } catch { return false; } finally { syncing = null; if (again) { again = false; syncNest(api); } }
  })();
  return syncing;
}
