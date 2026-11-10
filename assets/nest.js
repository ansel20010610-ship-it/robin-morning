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
import { CITY_META } from "./cities.js"; // the 30 cities abroad, their sights' names and souvenirs (the drawings: postcard.js, loaded when shown)

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
// ——— What happens to the bird: colds, trips, a cat, a visitor, the weather ———
// The owner, 2026-11-10: 我想增加一點隨機事件，像是生病或是去旅遊，不然這樣長大太簡單了. Every phone of a yard must see the
// same bird, so whether something happens on a day comes from the yard's code and the date alone (a hash, never
// Math.random), not from who read what — except one rule anyone can follow: a whole day (LIFE.idle) with no one feeding
// and the bird catches cold. Nothing it has is ever taken away; what an event costs is growth: while it is ill, the bites go
// to medicine (LIFE.need of them, at most LIFE.dose a day, so a cold lasts a few days; or it gets well by itself after
// LIFE.coldMax days), and while it is away travelling
// the pieces read reach it on the road like letters, and do not make it grow. It comes home with something from where
// it went. A cat, a visiting bird, a typhoon, a rainy day or a find cost nothing; they are the yard's days. The events
// begin on EVENTS_FROM — the yard's past is as it was — and at most one starts on a day; none starts while it is ill
// or away (the quiet days after each event were taken out at the owner's word, 2026-11-10: 刪掉每件事之後會安靜的設定).
// A day's bites are counted by the day, medicine first, so the order of bites within a day changes nothing.
const EVENTS_FROM = "2026-11-12";
// Harder since the owner asked (2026-11-10: 調難一點): colds and trips come about twice as often and last longer, a
// cold takes three doses a day, and a single whole day with no one feeding is enough to catch one.
// More of its everyday life (the owner, 2026-11-10: 再增加一點別的小鳥活動): a big worm or a child's crumbs (each worth a bite
// of growth — good days against the colds and the road), basking with its wings spread, a bath, a quarrel with a
// squirrel, the dawn chorus, tidying the nest, a snowman in winter, and — once it can fly — a day lost, home at dusk.
const LIFE = { cold: .045, cat: .02, visit: .02, storm: .03, rain: .015, found: .015, worm: .02, crumbs: .015, sun: .02, bath: .015, squirrel: .012, chorus: .015, tidy: .012, snowman: .03, lost: .008, trip: .085, idle: 1, need: [9, 15], dose: 3, coldMax: 10, tripDays: [3, 5] };
// Where it goes: one of the cities abroad (cities.js; the owner, 2026-11-10: 不要台灣景點; 增加至 30 個城市), each with
// six sights and a souvenir — thirty to begin with, and one more every week (the 地圖班 routine draws it; the owner:
// 三十個城市快全部去過一輪，要想辦法繼續生新景點和新國家). A city never visited goes first, so each new one is the next
// trip; when every city has been seen the yard goes round them all again, in an order of its own, before any twice; at a city, one sight a day, and the next visit there begins where the last one stopped — so a trip never
// shows a sight twice, and no sight comes back before all its city's others have been seen (如果出國每天明信片要是不同景點).
const TRIPS = Object.entries(CITY_META).map(([id, c]) => ({ id, zh: c.zh, de: c.de, gift: c.gift, sights: c.sights, added: c.added }));
const VISITORS = ["麻雀", "綠繡眼", "白頭翁", "五色鳥", "臺灣藍鵲", "紅嘴黑鵯"];
const FINDS = ["一顆亮亮的瓶蓋", "一條紅色的毛線", "一枚鈕扣", "一顆玻璃珠", "一片藍色的羽毛", "一小段緞帶"];
const hashOf = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15; return (h >>> 0) / 4294967296; };
const daysTo = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 864e5);
const stageOf = (g) => STAGES.reduce((i, s, j) => (g >= s.at ? j : i), 0);
const sortFeeds = (n) => [...(n?.feeds || [])].filter((f) => f && /^\d{4}-\d{2}-\d{2}$/.test(f.d) && typeof f.k === "string" && typeof f.w === "string").sort((a, b) => a.d.localeCompare(b.d) || a.k.localeCompare(b.k));
export function lifeOf(n, today = twNow().date, from = EVENTS_FROM) {
  const feeds = sortFeeds(n), code = String(n?.code || ""), pet = petOf(n), N = esc(pet.name), P = pet.p;
  const roll = (d, what) => hashOf(`${code}|${d}|${what}`);
  const byDay = new Map();
  feeds.forEach((f, i) => { if (!byDay.has(f.d)) byDay.set(f.d, []); byDay.get(f.d).push(i); });
  const effAt = [], kindAt = [], events = [], days = new Map(), treasures = [], went = [], round = new Set(), postcards = [], perPlace = {};
  let g = 0, sick = null, trip = null, lastFed = "";
  const first = [n?.since, feeds[0]?.d].filter(Boolean).sort()[0] || today, last = [today, feeds.at(-1)?.d || today].sort()[1];
  for (let d = first; d <= last; d = addDays(d, 1)) {
    let hiding = "", visitor = "", mood = "", bonus = 0;
    const idx = byDay.get(d) || [];
    if (d >= from) {
      const si = stageOf(g), m = Number(d.slice(5, 7));
      if (trip && d > trip.until) {
        treasures.push(trip.gift);
        events.push({ d, kind: "home", text: `${N}從${trip.place}回來了，帶回${trip.gift}。這趟寄回 ${trip.cards} 張明信片，路上收到 ${trip.letters} 封信。`, photo: true, big: true });
        lastFed = [lastFed, trip.until].sort()[1]; trip = null; // away is not neglected
      }
      if (sick && sick.why === "cold" && daysTo(sick.since, d) >= LIFE.coldMax) { events.push({ d, kind: "well", text: `${N}自己慢慢好起來了。` }); sick = null; }
      // neglect: two whole days with no one feeding
      if (!sick && !trip && si >= 1 && lastFed && daysTo(lastFed, d) > LIFE.idle && d >= addDays(from, LIFE.idle)) {
        const need = Math.min(15, 9 + 2 * (daysTo(lastFed, d) - LIFE.idle - 1));
        sick = { since: d, need, left: need, why: "neglect" };
        events.push({ d, kind: "sick", text: `好幾天沒有人來餵，${N}著涼生病了。要 ${need} 口才會好。`, photo: true, sick: true });
      }
      if (!sick && !trip && si >= 1) {
        const r = roll(d, "day"), wet = m >= 7 && m <= 10, canGo = si >= 3 && !(g >= 500 && m >= 4 && m <= 6);
        // trip last: whether it can happen (the stage) moves no other event's chance
        const winter = m === 12 || m <= 2;
        const table = [["cold", LIFE.cold], ["cat", LIFE.cat], ["visit", LIFE.visit], [wet ? "storm" : "rain", wet ? LIFE.storm : LIFE.rain], ["found", LIFE.found],
          ["worm", LIFE.worm], ["crumbs", LIFE.crumbs], ["sun", winter ? 0 : LIFE.sun], ["bath", winter ? 0 : LIFE.bath], ["squirrel", LIFE.squirrel], ["chorus", LIFE.chorus], ["tidy", LIFE.tidy], ["snowman", winter ? LIFE.snowman : 0],
          ["lost", si >= 3 ? LIFE.lost : 0], ["trip", canGo ? LIFE.trip : 0]];
        let acc = 0, ev = "";
        for (const [k, pr] of table) { acc += pr; if (r < acc) { ev = k; break; } }
        if (ev === "cold") {
          const need = LIFE.need[0] + Math.floor(roll(d, "need") * (LIFE.need[1] - LIFE.need[0] + 1));
          sick = { since: d, need, left: need, why: "cold" };
          events.push({ d, kind: "sick", text: `${N}感冒了，縮成一團。接下來 ${need} 口要當藥吃（一天最多吃 ${LIFE.dose} 口藥），吃完就會好。`, photo: true, sick: true });
        } else if (ev === "trip") {
          const len = LIFE.tripDays[0] + Math.floor(roll(d, "len") * (LIFE.tripDays[1] - LIFE.tripDays[0] + 1));
          // the cities there were on that day (each joins on its `added` date, so a city drawn later changes no trip
          // already made); one never visited goes first — new ones are next — else one not yet visited this round
          const open = TRIPS.filter((t) => (t.added || "") <= d), fresh = open.filter((t) => !went.includes(t.id));
          let pool = fresh.length ? fresh : open.filter((t) => !round.has(t.id));
          if (!pool.length) { round.clear(); pool = open; }
          const to = pool[Math.floor(roll(d, "where") * pool.length)];
          if (to) { // no city has joined yet: no trip that day
            went.push(to.id); round.add(to.id);
            const place = to.zh;
            trip = { from: d, until: addDays(d, len - 1), place, gift: to.gift, to, letters: 0, cards: 0 };
            events.push({ d, kind: "trip", text: `${N}出門旅行了，去${place}，要 ${len} 天。這幾天讀的每一篇，會像信一樣寄到路上給${P}。`, photo: true, away: place });
          }
        } else if (ev === "cat") { hiding = "cat"; events.push({ d, kind: "cat", text: `一隻貓在院子外面晃，${N}嚇得躲在葉子後面一整天。`, photo: true, hiding: "cat" }); }
        else if (ev === "visit") { visitor = VISITORS[Math.floor(roll(d, "who") * VISITORS.length)]; events.push({ d, kind: "visit", text: `一隻${visitor}來串門子，和${N}在枝上站了一會兒。` }); }
        else if (ev === "storm") { hiding = "storm"; events.push({ d, kind: "storm", text: `颱風來了，${N}縮在巢裡等風停。` }); }
        else if (ev === "rain") { events.push({ d, kind: "rain", text: `下了一整天雨，${N}的羽毛濕濕的。` }); }
        else if (ev === "worm") { bonus = 1; mood = "worm"; events.push({ d, kind: "worm", text: `${N}從草裡拉出一隻好長的蟲，吃得心滿意足，抵得上一口。` }); }
        else if (ev === "crumbs") { bonus = 1; events.push({ d, kind: "crumbs", text: `隔壁的小孩撒了一把麵包屑，${N}吃得一點也不剩，又多長一口。` }); }
        else if (ev === "sun") { mood = "sun"; events.push({ d, kind: "sun", text: `${N}趴在枝上曬太陽，把翅膀整個攤開。`, photo: true, mood: "sun" }); }
        else if (ev === "bath") { mood = "bath"; events.push({ d, kind: "bath", text: `${N}在水盆裡洗了個澡，甩得到處都是水。`, photo: true, mood: "bath" }); }
        else if (ev === "squirrel") { mood = "squirrel"; events.push({ d, kind: "squirrel", text: `一隻松鼠跑來搶果子，${N}跟牠吵了一架，誰也不讓誰。`, photo: true, mood: "squirrel" }); }
        else if (ev === "chorus") { events.push({ d, kind: "chorus", text: si >= 5 ? `天還沒亮，${N}和附近的鳥一起唱，${P}的聲音最清楚。` : `天還沒亮，附近的鳥都在唱，${N}在旁邊聽了好久。` }); }
        else if (ev === "tidy") { events.push({ d, kind: "tidy", text: `${N}把巢整理了一遍，叼來新的乾草鋪上。` }); }
        else if (ev === "snowman") { mood = "snowman"; events.push({ d, kind: "snowman", text: `院子裡有人堆了一個小雪人，${N}站在雪人頭上不肯下來。`, photo: true, mood: "snowman" }); }
        else if (ev === "lost") { mood = "out"; events.push({ d, kind: "lost", text: `${N}飛得太遠，迷路了一整天，傍晚才找到回家的路。`, photo: true, mood: "out" }); }
        else if (ev === "found") { const left = FINDS.filter((x) => !treasures.includes(x)); if (left.length) { const t = left[Math.floor(roll(d, "what") * left.length)]; treasures.push(t); events.push({ d, kind: "found", text: `${N}撿到${t}，藏在巢裡。` }); } }
      }
    }
    g += bonus; // a worm or crumbs: a bite's worth of growth for the day
    // the day's bites: on the road they are letters; while ill, medicine first (LIFE.dose a day); the rest make it grow
    let doses = 0;
    for (const i of idx) {
      if (trip) { kindAt[i] = "letter"; trip.letters++; }
      else if (sick && doses < LIFE.dose) {
        kindAt[i] = "med"; sick.left--; doses++;
        if (sick.left <= 0) { events.push({ d, kind: "well", text: `${N}的病好了。` }); sick = null; }
      } else { g++; kindAt[i] = "grow"; }
      effAt[i] = g;
    }
    // a day away: the day's postcard, drawn and written for this day (postcard.js), naming a piece read that day
    if (trip && d >= trip.from && d <= trip.until) {
      // this city's k-th card in the yard: its sights in the yard's own order, one after another
      const k = (perPlace[trip.to.id] = (perPlace[trip.to.id] ?? -1) + 1), ns = trip.to.sights.length, start = Math.floor(hashOf(`${code}|${trip.to.id}`) * ns);
      const sight = (start + k) % ns, visit = Math.floor(k / ns);
      const pc = { city: trip.to.id, sight, sightZh: trip.to.sights[sight], zh: trip.to.zh, de: trip.to.de, d, day: daysTo(trip.from, d) + 1, len: daysTo(trip.from, trip.until) + 1, n: idx.length, keys: idx.map((i) => feeds[i].k), seed: roll(d, "card"), visit };
      postcards.push(pc); trip.cards++;
      events.push({ d, kind: "card", text: `${N}從${trip.place}寄來${trip.to.sights[sight]}的明信片。`, postcard: pc });
    }
    if (idx.length) lastFed = d;
    days.set(d, { g, sick: Boolean(sick), away: trip ? trip.place : "", hiding, visitor, doses, mood });
  }
  const now = days.get(today) || {};
  return { g, feeds, effAt, kindAt, events, treasures, postcards, went, sick, trip, hiding: now.hiding || "", visitor: now.visitor || "", mood: now.mood || "", dosed: (now.doses || 0) >= LIFE.dose, day: (d) => days.get(d) || {}, todays: events.filter((e) => e.d === today) };
}
export function nestState(n = nest()) {
  if (!n) return null;
  const today = twNow().date, feeds = n.feeds || [], pet = petOf(n), life = lifeOf(n, today);
  const total = life.g, si = stageOf(total), stage = STAGES[si]; // growth: the bites that went to it, not to medicine or the road
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
  return { total, read: feeds.length, stage, si, next, toNext: next.at - total, from, songs, items, story, grow: Math.min(1, total / STAGES[4].at), mature,
    pet, fed, todayBy, who, week, idle, hunger, full: fed >= 3, members: byMember(feeds), everyone: Object.keys(todayBy).length, songNames: songNames(n, songs, life),
    life, sick: life.sick, away: life.trip, hiding: life.hiding, mood: life.mood, back: life.trip ? daysTo(today, life.trip.until) + 1 : 0 };
}

// ——— The songs ———
// Each song the singer learns is named after the 古典欄 piece the yard was reading then (the owner, 2026-11-09, on my
// proposal): the k-th song came with the bite at 160 + 60(k−1); the music article read at or before that bite names
// it by the work in 《》 or 〈〉 in its title or dek. app.js gives the lookup (setLookup); without it, or with no work
// to be found, the song stays 第幾首.
let lookup = null;
export const setLookup = (fn) => { lookup = typeof fn === "function" ? fn : null; };
function songNames(n, songs, life = lifeOf(n)) {
  if (!songs || !lookup) return [];
  // the k-th song is named by the last music piece read in the sixty bites that taught it (never a piece that already
  // names an earlier song); none there → the song keeps its number. The bites that taught are the ones it grew by.
  const feeds = life.feeds.filter((_, i) => life.kindAt[i] === "grow"), out = [], used = new Set();
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
    <circle class="r-eye" cx="21.6" cy="29.2" r="1.45"/><circle class="r-eyehi" cx="22.1" cy="28.7" r=".45"/>
    ${st.sick ? `<path class="r-lid" d="M20 28.3 Q21.6 27.4 23.2 28.3 L23.2 29.2 Q21.6 28.6 20 29.2 Z"/><path class="r-scarf" d="M16.8 35.2 Q23.5 39.6 30.6 35.4"/><path class="r-scarf end" d="M27.6 37.2 l2.6 6.4 M25.8 37.8 l1.4 6.2"/>` : ""}`;
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
// While it is away, a postcard leans on the empty perch; on a cat's day, two ears and two eyes at the foot of the yard.
const POSTCARD = `<g class="sc-card" transform="rotate(-8 30 47)"><rect x="24" y="43" width="13" height="9" rx=".6"/><path d="M26 46 h5 M26 48 h6 M26 50 h4"/><rect class="stamp" x="33" y="44.2" width="2.6" height="3" /></g>`;
const CAT = `<g class="sc-cat"><path d="M49 64 L49 57.5 L51.2 59.4 L53.6 57.2 L56 59.4 L58.2 57.5 L58.2 64 Z"/><circle class="eye" cx="51.8" cy="61" r=".7"/><circle class="eye" cx="55.4" cy="61" r=".7"/></g>`;
const moodOf = (st) => `${st.sick ? " sick" : ""}${st.away ? " away" : ""}${st.hiding ? ` hiding ${st.hiding}` : ""}${st.mood ? ` mood-${st.mood}` : ""}`;
// the everyday moods' props: a splash in the basin, a squirrel on the branch, a snowman, a feather left on the empty perch
const MOOD_PROPS = {
  bath: `<ellipse class="sc-bath" cx="10" cy="59.5" rx="4.6" ry="1.5"/><ellipse class="sc-water" cx="10" cy="59.2" rx="3.4" ry=".8"/><g class="sc-splash"><circle cx="16" cy="46" r=".9"/><circle cx="20" cy="43" r=".7"/><circle cx="44" cy="45" r=".8"/><circle cx="47" cy="41" r=".6"/><circle cx="13" cy="51" r=".6"/></g>`,
  squirrel: `<g class="sc-squirrel"><path d="M55 53 q-1 -6 2 -9 q3 -3 6 -1 q-3 1 -3 4 q0 3 -2 6 Z"/><ellipse cx="52.6" cy="50.6" rx="3" ry="2.6"/><circle cx="50.6" cy="47.8" r="1.8"/><path d="M50 46.4 l.3 -1.6 l.9 1.3 Z"/></g>`,
  snowman: `<g class="sc-snowman"><circle cx="9" cy="58" r="4.2"/><circle cx="9" cy="51.6" r="2.9"/><path class="arm" d="M5 55.6 l-3 -2 M13 55.6 l3 -2"/><path class="nose" d="M9.6 51.6 l2 .4 l-2 .4 Z"/></g>`,
  out: `<path class="sc-feather" d="M28 52.4 q4 -3 8 -1.4 q-4 1 -8 1.4 Z"/>`,
};
export const birdSvg = (st) => `<div class="bird s${st.si}${st.full ? " full" : ""}${moodOf(st)} season-${st.story?.season || "none"}" style="--g:${st.grow.toFixed(3)};--m:${st.mature.toFixed(3)}" aria-hidden="true"><svg class="scene" viewBox="0 0 64 64">${st.si ? PERCH(st.story?.mate) + (st.story?.mate ? mateSvg(st) : "") + sceneSvg(st.items, st.story) + (st.away ? POSTCARD : "") + (st.hiding === "cat" ? CAT : "") + (MOOD_PROPS[st.mood] || "") : EGG_SCENE}</svg><svg class="robin" viewBox="0 0 64 64"><g class="body">${st.si ? robinSvg(st, { perch: false }) : EGG}</g></svg>${st.si >= 5 ? `<i class="note">♪</i><i class="note two">♫</i>${st.songs >= 3 ? '<i class="note three">♬</i>' : ""}` : ""}</div>`;
const nextLine = (st) => (st.away ? `${st.back <= 1 ? "明天" : `${cn(st.back)}天後`}從${st.away.place}回來` : st.sick ? `再 ${st.sick.left} 口藥就會好` : `再 ${st.toNext} 口就${st.next.zh}`);
const bar = (st) => { const w = st.away ? 1 - st.back / Math.max(1, daysTo(st.away.from, st.away.until) + 1) : st.sick ? 1 - st.sick.left / st.sick.need : (st.total - st.from) / Math.max(1, st.next.at - st.from);
  return `<span class="bar${st.sick ? " sick" : st.away ? " away" : ""}"><i style="width:${Math.round(Math.max(0, Math.min(1, w)) * 100)}%"></i></span><span class="next">${esc(nextLine(st))}</span>`; };
// What it is doing today, when something is going on: ill, away, hiding, a guest, a find.
const lifeLine = (st) => {
  const N = esc(st.pet.name), P = st.pet.p;
  if (st.away) return `${N}去${esc(st.away.place)}旅行了，${st.back <= 1 ? "明天" : `${cn(st.back)}天後`}回來。你們讀的每一篇，${P}在路上都收到了，像收信一樣，只是這幾口不算長大。`;
  if (st.sick) return `${N}${st.sick.why === "neglect" ? "著涼生病了" : "感冒了"}，縮在巢裡。${st.life.dosed ? `今天的藥吃夠了，再讀的會讓${P}長大；明天接著吃，再 ${st.sick.left} 口就會好。` : `讀的幾篇先當藥吃，再 ${st.sick.left} 口就會好。`}`;
  return st.life.todays.map((e) => e.text).join(""); // today's own events (a guest, a find, a cat, getting well, coming home)
};
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
      <span class="say">${st.away ? `去${esc(st.away.place)}旅行了。` : st.sick ? `生病了，在吃藥。` : st.fed ? `今天吃了 ${st.fed} 口：${st.who.join("、")}。` : st.hunger}</span>
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
  if (bird.classList.contains("away") || bird.classList.contains("mood-out")) return; // nobody on the perch
  if (bird.classList.contains("mood-sun")) fly = false; // basking: it does not leave its spot
  if (bird.classList.contains("sick") || bird.classList.contains("hiding")) fly = false; // it stays put today
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
// Out of the yard and across the paper (the owner, 2026-11-09: 我在滑首頁的時候鳥會飛出來; 2026-11-10: 每次都不一樣的
// 飛法; 鳥從收藏那個地方飛出來; 剛開始跑出來的時候可以有巢，就在收藏那邊，跑走之後巢消失). The yard lives in 收藏, so a
// small nest grows up out of the 收藏 tab in the nav, the bird peeks over its rim, looks round and takes off along one
// of nine flights — an arc away, a loop, the bounding flight of a small bird, a circle round the screen and home, a
// spiral up and out, a dart-and-hover, a figure eight, a climb and dive, a zigzag — and the nest shrinks back into
// the tab behind it. None of the last three flights is flown again, and every one is drawn afresh — heights, widths,
// turns and pace at random — so no two are alike. Some come home: the nest grows again to take the bird in, and both
// slip back into the tab; the others leave the screen. A nestling cannot fly yet: it peeks out, flutters on the rim
// or hops along it, and sinks back. The tab's icon gives a little bounce as the nest comes and goes. Tap the bird:
// the yard. One at a time, and never with reduced motion.
const NEST_BACK = `<svg viewBox="0 0 72 34" aria-hidden="true"><ellipse class="fn-hollow" cx="36" cy="12" rx="27" ry="5"/><path class="fn-tw" d="M8 12 Q36 2.5 64 12 M14 9.5 Q30 5 46 6.5"/></svg>`;
const nestFront = (moss) => `<svg viewBox="0 0 72 34" aria-hidden="true"><path class="fn-bowl" d="M8 12 Q36 21 64 12 C64 24 52 31.5 36 31.5 C20 31.5 8 24 8 12 Z"/>
  <path class="fn-tw" d="M8.5 15 Q30 25 55 19 M11 21 Q36 30 62 17.5 M17 26.5 Q38 24 57 26 M9 13 Q34 22 64 13 M2 11 L9 13.5 M63 13 L71 9.5 M58 24 L67 27 M13 24 L5 27.5 M24 28.5 L19 33"/>
  ${moss ? `<path class="fn-moss" d="M14 14.6 q4 -2.4 8 0 q4 -2.4 8 0 q4 -2.4 8 0 q4 -2.4 8 0 q4 -2.4 8 0"/>` : ""}</svg>`;
// A Catmull-Rom curve through the waypoints [x, y, ms-from-the-last], sampled every ~50 ms: the keyframes' places and times.
function curve(pts) {
  const out = [{ x: pts[0][0], y: pts[0][1], t: 0 }];
  let t = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)], ms = p2[2];
    const n = Math.max(2, Math.round(ms / 50));
    for (let k = 1; k <= n; k++) {
      const u = k / n, u2 = u * u, u3 = u2 * u;
      const c = (a, b, c2, d) => .5 * (2 * b + (-a + c2) * u + (2 * a - 5 * b + 4 * c2 - d) * u2 + (-a + 3 * b - 3 * c2 + d) * u3);
      out.push({ x: c(p0[0], p1[0], p2[0], p3[0]), y: c(p0[1], p1[1], p2[1], p3[1]), t: t + ms * u });
    }
    t += ms;
  }
  return out;
}
// The flights, from the bird's seat in the nest S, `s` the side it heads to (+1 right, -1 left), W × H the screen.
// Each returns its waypoints and whether it comes home.
const FLIGHTS = {
  arc: (S, s, W, H, X) => ({ pts: [S, [S[0] + s * W * between(.12, .25), S[1] - H * between(.15, .3), between(550, 800)], [S[0] + s * W * between(.4, .6), H * between(.1, .3), between(650, 900)], [X, H * between(.02, .25), between(700, 1000)]] }),
  loop: (S, s, W, H, X) => { const r = between(42, 72), cx = W / 2 - 32 + s * between(-40, 40), cy = H * between(.32, .5), d = between(140, 190), pts = [S, [cx, cy, between(700, 950)]];
    for (let k = 1; k <= 8; k++) { const a = k / 8 * Math.PI * 2; pts.push([cx + s * r * Math.sin(a), cy - r + r * Math.cos(a), d]); }
    pts.push([X, cy - between(40, 140), between(800, 1100)]); return { pts }; },
  bound: (S, s, W, H, X) => { const y0 = Math.max(80, Math.min(H - 220, S[1] - between(40, 160))), A = between(18, 38), k = 4 + Math.floor(Math.random() * 3), pts = [S, [S[0] + s * 70, y0, between(450, 650)]];
    for (let i = 1; i <= k; i++) pts.push([S[0] + s * 70 + (X - S[0] - s * 70) * i / k, y0 + (i % 2 ? A : -A * .4), between(330, 460)]); return { pts }; },
  round: (S, s, W, H) => { const cx = W / 2 - 32, cy = H * between(.36, .48), rx = W * between(.28, .38), ry = H * between(.16, .26), pts = [S]; const a0 = Math.atan2((S[1] - cy) / ry, (S[0] - cx) / rx), dir = Math.random() < .5 ? 1 : -1;
    for (let k = 1; k <= 8; k++) { const a = a0 + dir * k / 9 * Math.PI * 2; pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a), between(320, 420)]); }
    pts.push([S[0], S[1], between(500, 700)]); return { pts, home: true }; },
  spiral: (S, s, W, H) => { const pts = [S], turns = between(1.4, 2.2), n = 12, x0 = S[0] + s * between(60, 120); let a = 0;
    for (let k = 1; k <= n; k++) { a = k / n * turns * Math.PI * 2; const r = 18 + k * between(6, 9); pts.push([x0 + s * r * Math.sin(a), S[1] - k / n * (S[1] + 60) + r * .5 * Math.cos(a), between(200, 260)]); }
    pts.push([x0 + s * between(-60, 60), -120, 500]); return { pts }; },
  hover: (S, s, W, H) => { const P = () => [between(30, W - 100), between(100, H - 230)], a = P(), b = P(), j = () => between(-5, 5), pts = [S, [a[0], a[1], between(500, 700)], [a[0] + j(), a[1] + j(), 280], [a[0] + j(), a[1] + j(), 280], [a[0] + j(), a[1] + j(), 280], [b[0], b[1], between(450, 650)], [b[0] + j(), b[1] + j(), 300], [b[0] + j(), b[1] + j(), 300], [S[0], S[1], between(700, 950)]]; return { pts, home: true }; },
  eight: (S, s, W, H) => { const cx = W / 2 - 32, cy = H * between(.3, .45), a = W * between(.24, .34), b = between(50, 90), pts = [S, [cx, cy, between(650, 850)]], d = between(170, 220);
    for (let k = 1; k <= 12; k++) { const t = k / 12 * Math.PI * 2; pts.push([cx + s * a * Math.sin(t), cy + b * Math.sin(2 * t), d]); }
    pts.push([S[0], S[1], between(700, 950)]); return { pts, home: true }; },
  dive: (S, s, W, H, X) => ({ pts: [S, [S[0] + s * between(20, 60), between(70, 120), between(700, 950)], [S[0] + s * W * between(.25, .4), between(50, 90), between(380, 520)], [S[0] + s * W * between(.5, .65), H * between(.6, .72), between(450, 620)], [X, H * between(.25, .45), between(650, 850)]] }),
  zigzag: (S, s, W, H, X) => { const pts = [S], n = 5 + Math.floor(Math.random() * 3), w = between(50, 100), dy = (S[1] - between(60, 120)) / n;
    for (let k = 1; k <= n; k++) pts.push([S[0] + s * (40 + (k % 2) * w + k * 12), S[1] - k * dy, between(220, 300)]); pts.push([X, between(-40, 60), between(550, 750)]); return { pts }; },
};
const HOPS = { // the nestling's in the nest: no flight yet. [x, y, ms, facing (1 = the way it set off, -1 = back), flutter], drawn afresh each time
  peek: (S) => { const out = [], looks = 1 + Math.floor(Math.random() * 3); let f = 1;
    for (let i = 0; i < looks; i++) { f = -f; out.push([S[0], S[1] - between(0, 3), between(380, 720), f]); }
    out.push([S[0], S[1] - between(4, 8), between(140, 190), 1], [S[0], S[1], between(140, 190), 1], [S[0], S[1], between(300, 650), 1]); return out; },
  flutter: (S) => { const out = [[S[0], S[1] - between(7, 10), between(220, 300), 1, 1]], n = 3 + Math.floor(Math.random() * 3), hi = between(12, 17);
    for (let i = 0; i < n; i++) out.push([S[0] + between(-2, 2), S[1] - (i % 2 ? between(7, 10) : hi), between(170, 250), 1, 1]);
    out.push([S[0], S[1], between(260, 360), 1]); return out; },
  rim: (S, s) => { const out = [[S[0], S[1] - between(9, 12), between(220, 300), 1]], n = 1 + Math.floor(Math.random() * 3); let x = S[0];
    for (let i = 0; i < n; i++) { x += s * between(7, 13); out.push([x, S[1] - between(12, 16), between(150, 200), 1], [x, S[1] - between(8, 11), between(130, 180), 1]); }
    out.push([x, S[1] - 9, between(350, 700), -1]);
    for (let i = n - 1; i >= 0; i--) { x -= s * (x - S[0]) / (i + 1); out.push([x, S[1] - between(11, 14), between(170, 220), -1]); }
    out.push([S[0], S[1], between(220, 300), -1]); return out; },
};
function freshPick(names, key) {
  const last = store.get(key, []), pool = names.filter((k) => !last.includes(k)), k = (pool.length ? pool : names)[Math.floor(Math.random() * (pool.length || names.length))];
  store.set(key, [k, ...last].slice(0, Math.min(3, names.length - 1)));
  return k;
}
export function flyBy() {
  const n = nest();
  if (!n || calm() || document.querySelector(".flyby")) return false;
  const st = nestState(n);
  if (st.si === 0 || st.sick || st.away || st.hiding || st.mood === "out") return false; // ill, away, hiding or lost, it does not come out of 收藏
  const W = innerWidth, H = innerHeight, s = Math.random() < .5 ? 1 : -1;
  // the room between the bar at the top (an article's or a page's, if any) and the nav at the foot
  const top = Math.max(0, document.querySelector(".topbar")?.getBoundingClientRect().bottom || 0);
  const navEl = document.querySelector(".nav"), foot = navEl?.getBoundingClientRect().top || H;
  const tab = navEl?.querySelector('a[href="#/saved"]'), icon = tab?.querySelector("svg"), ir = (icon || tab)?.getBoundingClientRect();
  const cx = ir ? ir.left + ir.width / 2 : W / 2, cy = ir ? ir.top + ir.height / 2 : H - 40;
  // the nest sits right on the 收藏 tab, over its icon (the owner, 2026-11-10: 巢要在收藏的上面（重疊），不要跑到底下那欄
  // 的上方); the bird's box (64 px) sits low in it, the rim across its belly
  const nx = cx - 36, ny = cy - 22, S = [nx + 4, ny - 37], IN = [cx - 31, cy - 41], SUNK = 18;
  const back = document.createElement("div"), front = document.createElement("div"), bird = document.createElement("a");
  back.className = "fly-nest back"; front.className = "fly-nest front";
  back.innerHTML = NEST_BACK; front.innerHTML = nestFront(st.items?.moss);
  for (const el of [back, front]) el.style.cssText = `left:${nx}px;top:${ny}px`;
  bird.href = "#/nest"; bird.className = "flyby"; bird.setAttribute("aria-label", `${st.pet.name}從收藏飛出來了，到後院看${st.pet.p}`);
  bird.innerHTML = birdSvg(st);
  document.body.append(back, bird, front);
  // frames: the bird's box, facing (1 = left, the drawing's way; -1 = right), a tilt into the climb or the dive, its size
  const F = (x, y, face, rot = 0, k = 1) => ({ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scaleX(${face}) rotate(${rot.toFixed(1)}deg) scale(${k})`, opacity: k < .5 ? 0 : 1 });
  const frames = [], times = [];
  const at = (t, f) => { times.push(t); frames.push(f); };
  // a move of `ms` to (x, y): a turn on the way is a quick flip at its end, not a slow squeeze through the whole move
  let t = 0, face = -s;
  const go = (ms, x, y, f, k = 1) => { if (f !== face && ms > 160) { at(t + ms - 110, F(x, y, face)); } t += ms; at(t, F(x, y, f, 0, k)); face = f; };
  const bump = (when) => { if (icon) setTimeout(() => icon.animate([{ transform: "none" }, { transform: "translateY(-3px) scale(1.22)" }, { transform: "none" }], { duration: 340, easing: "ease-out" }), Math.max(0, when)); };
  const GROW = 320;
  at(0, F(IN[0], IN[1], face, 0, .2)); bump(0);
  go(GROW, S[0], S[1] + SUNK, face); // up out of the tab with the nest, still sunk in it
  go(380, S[0], S[1], face); // a peek over the rim
  go(between(380, 650), S[0], S[1], -face); go(between(450, 700), S[0], S[1], -face); // a look the other way, and back
  let home = true, takeoff = 0, landed = 0, flutterOn = 0, flutterOff = 0;
  if (st.si >= 3) {
    const X = s > 0 ? W + 40 : -110, kind = freshPick(Object.keys(FLIGHTS), "flyways"), fl = FLIGHTS[kind]([S[0], S[1], 0], s, W, H, X);
    home = Boolean(fl.home);
    go(160, S[0], S[1] - 6, face); go(140, S[0], S[1], face); // the crouch before the spring
    takeoff = t;
    // on the screen between the bars, except where it ends: off the edge or over the top, or back in the nest
    const lo = top + 4, hi = foot - 90, last = fl.pts.length - 1;
    const pts = fl.pts.map((p, i) => (i === 0 ? [S[0], S[1], 0] : i === last && home ? [S[0], S[1], p[2]] : [p[0], i === last ? Math.max(-140, Math.min(hi, p[1])) : Math.max(lo, Math.min(hi, p[1])), p[2] * between(.9, 1.15)]));
    const path = curve(pts);
    for (let i = 1; i < path.length; i++) {
      const p = path[i], q = path[i - 1], dx = p.x - q.x, dy = p.y - q.y;
      if (Math.abs(dx) > 2) face = dx > 0 ? -1 : 1;
      const rot = Math.max(-38, Math.min(38, -Math.atan2(dy, Math.abs(dx) + .01) * 180 / Math.PI * .7));
      at(takeoff + p.t, F(p.x, p.y, face, i === path.length - 1 && home ? 0 : rot));
    }
    t = takeoff + path.at(-1).t;
    if (home) { landed = t; go(between(300, 650), S[0], S[1], face); go(380, S[0], S[1] + SUNK, face); }
  } else {
    const kind = freshPick(Object.keys(HOPS), "hopways"), hops = HOPS[kind](S, s);
    for (const [x, y, ms, f, flap] of hops) { if (flap && !flutterOn) flutterOn = t; go(ms, x, y, f * -s); if (flap) flutterOff = t; }
    go(380, S[0], S[1] + SUNK, face);
  }
  if (home) { go(GROW, IN[0], IN[1], face, .2); bump(t - GROW); } // back into the tab, nest and all
  const total = t;
  const kf = frames.map((f, i) => ({ ...f, offset: times[i] / total, ...(i === 0 ? { easing: "ease-out" } : {}) }));
  // the nest: up out of the tab, down into it once the bird has flown, up again to take a homecoming bird in
  const ON = { transform: "none", opacity: 1 }, OFF = { transform: `translateY(${(cy - ny - 17).toFixed(1)}px) scale(.2)`, opacity: 0 };
  const nk = [[0, OFF, "ease-out"], [GROW, ON]];
  if (st.si >= 3) {
    const gone = takeoff + 260;
    nk.push([gone, ON, "ease-in"], [gone + GROW, OFF]);
    if (home) { const back2 = Math.max(gone + GROW + 50, landed - GROW - 60); nk.push([back2, OFF, "ease-out"], [back2 + GROW, ON]); }
  }
  if (home) { nk.push([total - GROW, ON, "ease-in"], [total, OFF]); } else if (nk.at(-1)[0] < total) nk.push([total, OFF]);
  const nestKf = nk.map(([ms, f, easing]) => ({ ...f, offset: Math.min(1, ms / total), ...(easing ? { easing } : {}) }));
  if (st.si >= 3) bump(takeoff + 260 + GROW - 200);
  const flap = bird.querySelector(".bird"), timers = [];
  if (st.si >= 3) { timers.push(setTimeout(() => flap?.classList.add("flying"), takeoff)); if (home) timers.push(setTimeout(() => flap?.classList.remove("flying"), landed)); }
  else if (flutterOff) { timers.push(setTimeout(() => flap?.classList.add("flutter"), flutterOn)); timers.push(setTimeout(() => flap?.classList.remove("flutter"), flutterOff)); }
  for (const el of [back, front]) el.animate(nestKf, { duration: total, fill: "both" });
  const done = () => { timers.forEach(clearTimeout); back.remove(); front.remove(); bird.remove(); };
  bird.animate(kf, { duration: total, easing: "linear", fill: "both" }).finished.then(done, done);
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
  if (after.away) line = `${p}不在家。這一篇像一封信，寄到${after.away.place}給${p}。`;
  else if (before?.sick && !after.sick) line = `吃完這一口，${p}的病好了。`;
  else if (after.sick && before && after.total === before.total) line = `這一口當藥吃了。`;
  else if (after.sick) line = `今天的藥吃夠了，這一口讓${p}長大一點。`;
  else if (before && after.si > before.si) line = `這一口，${p}${after.si === 1 ? "破殼了" : after.si === 2 ? "長出絨毛了" : after.si === 3 ? "開始學飛了" : after.si === 4 ? "長成成鳥了" : "成了歌者"}。`;
  else if (before && after.songs > before.songs) line = `這一口，${p}學會了第${cn(after.songs)}首歌。`;
  else if (before && Object.values(after.items).reduce((a, b) => a + b, 0) > Object.values(before.items).reduce((a, b) => a + b, 0)) line = `這一口，${WORDS[Object.keys(after.items).find((k) => (after.items[k] || 0) > (before.items[k] || 0))] || "院子裡多了一樣東西"}。`;
  else line = FEED_LINES[Math.floor(Math.random() * FEED_LINES.length)](p);
  const el = document.createElement("a");
  el.href = "#/nest"; el.className = "feed-note"; el.setAttribute("role", "status");
  el.innerHTML = `${birdSvg(after)}<span class="t"><b>${esc(n)}</b><span class="l">${esc(line)}</span><span class="n">${esc(nextLine(after))}</span></span>`;
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
  if (st.away) { say(`${n}不在家，去${st.away.place}了。`); poking = false; return; }
  if (st.mood === "out") { say(`${n}還沒回來，枝上只剩一根羽毛。`); poking = false; return; }
  if (st.mood === "sun" && st.si > 0) act = async () => { chirp("tic"); say(`${n}瞇著眼睛，翅膀還攤著，不想動。`); await run([T(0, 0), T(0, 1, 3), T(0, 0)], 900); };
  else if (st.mood === "squirrel" && st.si > 0) act = async () => { chirp("call"); say(`${n}還在瞪那隻松鼠。`); await run([T(0, 0), T(4, -2, 8), T(4, -2, 8), T(0, 0)], 1000); };
  else
  if (st.sick && st.si > 0) act = [
    async () => { chirp("peep"); say(`${n}咳了一聲，往巢裡縮。`); await run([T(0, 0), T(0, 2, 4, .96), T(0, 0)], 700); },
    async () => { chirp("tic"); say(`${n}抬頭看你一眼，又閉上眼睛。`); await run([T(0, 0), T(0, -2, -6), T(0, -2, -6), T(0, 1)], 1200); },
    async () => { say(`${n}縮成一團，圍巾拉得緊緊的。`); await run([T(0, 0), T(0, 2, 0, .92), T(0, 2, 0, .92), T(0, 0)], 1300); },
  ][Math.floor(Math.random() * 3)];
  else if (st.hiding && st.si > 0) act = async () => { chirp("tic"); say(st.hiding === "cat" ? `${n}從葉子後面探出頭，確定貓走了沒。` : `${n}縮在巢裡，等風停。`); await run([T(0, 0), T(0, -10), T(0, -10), T(0, 0)], 1300); };
  else if (st.si === 0) act = async () => { chirp("egg"); say("蛋晃了一下。"); await run([T(0, 0), T(0, 0, -8), T(0, 0, 7), T(0, 0, -4), T(0, 0)], 700); };
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
      <p class="say">${st.away || st.sick ? lifeLine(st) : st.songs > 1 ? `又學會了一首，現在會唱${cn(st.songs)}首歌；每首都比上一首長一點。` : esc(st.stage.say(pet.p))}</p>
      ${!st.away && !st.sick && st.life.todays.length ? `<p class="life">${lifeLine(st)}</p>` : ""}
      <p class="today">${st.away ? (st.fed ? `今天寄了 ${st.fed} 封信給${esc(pet.p)}：${st.who.join("、")}。` : `今天還沒有人寫信給${esc(pet.p)}。`) : st.fed ? `今天吃了 ${st.fed} 口：${st.who.join("、")}。${st.everyone > 1 ? "大家都餵過了。" : ""}` : st.hunger}</p>
      ${st.si ? `<p class="season">${esc(st.story.line)}</p>` : ""}
      ${bar(st)}
      <details class="nest-more"><summary>院子裡有什麼<span class="de">Inventar</span></summary>
        <p class="small">全院一共讀了 ${st.read} 篇${n.since ? `，從 ${esc(fmtDate(n.since, "short"))} 開院算起` : ""}${st.read > st.total ? `，其中 ${st.total} 口讓${esc(pet.p)}長大` : ""}${got.length ? `。院子裡有${got.join("、")}` : ""}${st.story.mate ? "，還有一隻伴侶" : ""}。</p>
        ${st.life.treasures.length ? `<p class="small">巢裡藏著的寶貝：${st.life.treasures.map(esc).join("、")}。</p>` : ""}
        ${st.songs ? `<p class="small songs">會唱的歌：${st.songNames.map((s, i) => s ? esc(s) : `第${cn(i + 1)}首`).join("、")}。</p>` : ""}</details>
      <a class="nest-album-link" href="#/nest/album">翻翻${esc(pet.name)}的相簿<span class="de">Album</span> →</a></div>
    ${st.life.postcards.length ? `<section class="set"><h2>明信片<span class="de">Postkarten</span></h2><div class="pc-row">${st.life.postcards.map(postcardThumb).slice(-12).reverse().join("")}</div>${st.life.postcards.length > 12 ? `<p class="small">最近十二張；其他的都貼在<a href="#/nest/album">相簿</a>裡。</p>` : ""}</section>` : ""}
    <section class="set"><h2>這七天</h2><ol class="nest-week" aria-label="這七天每天餵了幾口">${wk}</ol></section>
    <section class="set"><h2>院子裡的人</h2><ul class="nest-members">${names}</ul>
      ${api ? `<p class="small">${synced || "還沒同步過"}。</p>` : `<p class="small nest-note">共用儲存還沒接上：現在只有這支手機的紀錄，接上以後會把大家的餵食和名字同步過來。</p>`}</section>
    <p class="nest-to-set"><a href="#/nest/settings">後院設定<span class="de">Einstellungen</span> →</a></p>`;
  liveBird(el.querySelector(".nest-stage"));
  el.querySelectorAll("[data-pc]").forEach((b) => b.addEventListener("click", () => openPostcard(st.life.postcards[Number(b.dataset.pc)], pet, b)));
  fillCards(el);
  const stageEl = el.querySelector(".nest-stage"), birdEl = stageEl.querySelector(".bird");
  birdEl.setAttribute("role", "button"); birdEl.setAttribute("aria-label", `摸摸${pet.name}`); birdEl.removeAttribute("aria-hidden"); birdEl.tabIndex = 0;
  birdEl.addEventListener("click", () => pokeBird(stageEl, nestState()));
  birdEl.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pokeBird(stageEl, nestState()); } });
  if (!afterSync) syncNest(api).then((ok) => { if (ok && el.isConnected && location.hash === "#/nest") renderNest(el, api, true); });
}
// ——— 明信片 (Postkarten) ———
// The postcards from the road: the front drawn for its day by postcard.js — the place's landmark at that hour, in that
// weather and season, the robin somewhere in it — with the place's name over it, a robin stamp and the postmark; the
// back written for its day — where it sat, what it saw, the piece of the paper that reached it that day, how many
// days are left — and signed. A tap on a card in the yard or the album opens it large; a tap on the large card turns
// it over.
const pmark = (d) => `${Number(d.slice(8))}・${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][Number(d.slice(5, 7)) - 1]}・${d.slice(0, 4)}`;
// The drawings (postcard.js and its 180 sights) are fetched the first time a card is on screen, not with the paper:
// a card is first a plain one with its city's name, and is drawn as soon as they are in.
let cardsMod = null;
const loadCards = () => (cardsMod ||= import("./postcard.js"));
const waitingCards = new Map();
let pcUid = 0;
const labels = (pc) => `<span class="pc-greet">Grüße aus</span><b class="pc-place">${esc(pc.zh)}</b><i class="pc-de">${esc(pc.de)}</i>${pc.sightZh ? `<span class="pc-sight">${esc(pc.sightZh)}</span>` : ""}
    <span class="pc-stamp" aria-hidden="true"><svg viewBox="0 0 64 64">${ROBIN_STAMP}</svg></span><span class="pc-mark" aria-hidden="true">${pmark(pc.d)}</span>`;
function postcardHtml(pc, pet, big = false) {
  const id = `w${++pcUid}`;
  waitingCards.set(id, { pc, pet, big });
  const front = `<div class="pc-front" data-wait="${id}">${labels(pc)}</div>`;
  return big ? `<div class="pc-flip">${front}<div class="pc-back"></div></div>` : front;
}
function cardFace(m, pc, pet, big) {
  let art = "";
  try { art = m.drawCard(pc.city, pc.sight, pc.seed, pc.d, `p${++pcUid}`); } catch { art = ""; }
  const front = `<div class="pc-front">${art}${labels(pc)}</div>`;
  if (!big) return front;
  // the piece it names: of the day's letters, the first the paper's index has
  let a = null;
  for (const k of [...(pc.keys || [])].sort()) { if (!lookup) break; const [kd, kc] = k.split("/"); a = lookup(kd, kc); if (a?.title) break; }
  let words = [];
  try { words = m.cardWords(pc.city, pc.sight, pc.seed, pc.d, { day: pc.day, len: pc.len, n: pc.n, title: a?.title || "", visit: pc.visit }); } catch { words = []; }
  const back = `<div class="pc-back">${words.map((w) => `<p class="pc-msg">${esc(w)}</p>`).join("")}<p class="pc-sign">—— ${esc(pet.name)}</p>
    <div class="pc-to"><span class="pc-stamp" aria-hidden="true"><svg viewBox="0 0 64 64">${ROBIN_STAMP}</svg></span><span class="pc-mark" aria-hidden="true">${pmark(pc.d)}</span><span class="pc-line">寄給 後院的大家</span><span class="pc-line"></span><span class="pc-line"></span></div></div>`;
  return `<div class="pc-flip">${front}${back}</div>`;
}
function fillCards(root) {
  if (!root?.querySelector("[data-wait]")) return;
  loadCards().then((m) => {
    root.querySelectorAll("[data-wait]").forEach((el) => {
      const w = waitingCards.get(el.dataset.wait);
      waitingCards.delete(el.dataset.wait);
      if (!w || !el.isConnected) return;
      const host = w.big ? el.closest(".pc-flip") : el;
      if (host) host.outerHTML = cardFace(m, w.pc, w.pet, w.big);
    });
  }).catch(() => {}); // offline before the drawings were ever fetched: the plain card stays
}
// a small robin for the stamp, the drawing's own colours
const ROBIN_STAMP = `<rect x="3" y="3" width="58" height="58" fill="#FBF6EA"/><path fill="#7A5A44" d="M17.6 27.2 C13.2 32.8 13.8 42 20.4 46.8 C26.6 51.2 37.4 51.4 43.4 45.6 C46.8 42.2 47.6 36.8 45.4 32.2 C42.4 26 33 21.6 25 23 C21.8 23.6 19.4 25 17.6 27.2 Z"/><path fill="#C8553D" d="M17.6 27.2 C14 32 14.4 40 19.6 45.2 C22.6 48 27.6 49 32 47.6 C32.4 40.2 29.4 32 25.2 27 C23.4 25.6 20.4 25.4 17.6 27.2 Z"/><path fill="#3B2C22" d="M15.6 29.6 L9.8 30.9 L15.7 32.2 Z M43.6 43.4 L56 33 L57.4 35.6 L46 46.2 Z"/><circle cx="21.6" cy="29.2" r="1.4" fill="#22180F"/>`;
export function openPostcard(pc, pet, from) {
  if (!pc || document.querySelector(".photo-view")) return;
  const view = document.createElement("div");
  view.className = "photo-view pc-view"; view.setAttribute("role", "dialog"); view.setAttribute("aria-modal", "true"); view.setAttribute("aria-label", `${pc.zh}寄來的明信片`);
  view.innerHTML = `<button class="postcard big" type="button" aria-label="翻面">${postcardHtml(pc, pet, true)}</button><p class="pv-text pc-hint">點明信片翻到背面</p><button class="pv-close" type="button">關上</button>`;
  document.body.append(view);
  fillCards(view);
  const card = view.querySelector(".postcard"), hint = view.querySelector(".pc-hint");
  card.addEventListener("click", (e) => { e.stopPropagation(); card.classList.toggle("turned"); hint.textContent = card.classList.contains("turned") ? "點一下翻回正面" : "點明信片翻到背面"; });
  const html = document.documentElement, was = html.style.overflow;
  html.style.overflow = "hidden";
  const fr = from?.getBoundingClientRect(), to = card.getBoundingClientRect();
  if (fr && !calm() && to.width) card.animate([{ transform: `translate(${fr.left + fr.width / 2 - to.left - to.width / 2}px, ${fr.top + fr.height / 2 - to.top - to.height / 2}px) scale(${fr.width / to.width})` }, { transform: "none" }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
  const close = () => { view.remove(); html.style.overflow = was; removeEventListener("keydown", onKey); removeEventListener("hashchange", close); from?.focus({ preventScroll: true }); };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  view.addEventListener("click", (e) => { if (e.target === view || e.target.closest(".pv-close")) close(); });
  addEventListener("keydown", onKey);
  addEventListener("hashchange", close, { once: true });
  card.focus({ preventScroll: true });
}
const postcardThumb = (pc, i) => `<button class="postcard" type="button" data-pc="${i}" aria-label="${esc(pc.zh)}${esc(pc.sightZh || "")}寄來的明信片，${Number(pc.d.slice(5, 7))} 月 ${Number(pc.d.slice(8))} 日">${postcardHtml(pc)}</button>`;

// ——— 相簿 (Album) ———
// The bird's life, read back out of the feed log (the owner, 2026-11-10: 我想加入養的鳥的相簿，可以回憶她以前長怎樣、發生過
// 什麼事、什麼時候長大的). The log is the bites in one order — by day, then by article, as songNames reads it — so the
// k-th bite has a day, and the bird as it was after k bites can be drawn again: its size, its plumage, what the yard
// held, and the season and the bird's own year on that day. A photo is taken at each moment its look changed — the
// yard opened (an egg), each stage, the mate, a new season, the moult, eggs, chicks, the young flown, Christmas, a
// birthday — and the smaller things (a twig, a leaf, a song and its name, a hundredth bite, a friend's first bite)
// are lines under the day. A bite has no hour, so a day says who fed that day, not who fed which bite.
function lookAt(total, date, since, flags = {}) {
  const si = STAGES.reduce((i, s, j) => (total >= s.at ? j : i), 0), last = STAGES[STAGES.length - 1].at;
  const songs = total >= last ? 1 + Math.floor((total - last) / SONG) : 0, items = {};
  for (const m of milestones(total)) items[m.k] = (items[m.k] || 0) + 1;
  const story = storyOf(total, songs, since, date);
  return { si, songs, items, story, full: false, grow: Math.min(1, total / STAGES[4].at), mature: Math.min(1, total / 400) * (story.molt ? .6 : 1), ...flags };
}
export function albumOf(n = nest()) {
  if (!n) return null;
  const pet = petOf(n), today = twNow().date, life = lifeOf(n, today), feeds = life.feeds;
  const start = [n.since, feeds[0]?.d].filter(Boolean).sort()[0] || today, since = start;
  const who = (id) => (id === n.me ? "你" : esc(n.members?.[id] || "朋友"));
  // the growth count, not the bites read: what went to medicine or reached it on the road made it no bigger (lifeOf)
  const g = life.g, last = STAGES[STAGES.length - 1].at, songs = g >= last ? 1 + Math.floor((g - last) / SONG) : 0, names = songNames(n, songs, life);
  const days = new Map(); // date → { ev: [{ text, photo?: {total, raw, date, flags}, big }], by: {member: bites} }
  const day = (d) => { if (!days.has(d)) days.set(d, { ev: [], by: {} }); return days.get(d); };
  const snap = (c, raw, d, flags = {}) => ({ total: c, raw, date: d, flags });
  day(start).ev.push({ text: `院子開張，${pet.p}還是一顆蛋。`, photo: snap(0, 0, start), big: true });
  const firstOf = new Set();
  let prevC = 0;
  feeds.forEach((f, i) => {
    const raw = i + 1, d = f.d, D = day(d);
    D.by[f.w] = (D.by[f.w] || 0) + 1;
    if (!firstOf.has(f.w)) { firstOf.add(f.w); if (d !== start) D.ev.push({ text: `${who(f.w)}第一次來餵。` }); } // who fed on the opening day opened it together
    if (raw % 100 === 0) D.ev.push({ text: `讀到第${cn(raw)}篇。` });
    const c = life.effAt[i], c0 = prevC; prevC = c;
    if (life.kindAt[i] !== "grow") return;
    // everything passed with this bite — a worm or crumbs (lifeOf) can carry it past a line between two bites
    const crossed = (at) => c0 < at && at <= c;
    STAGES.forEach((x, st) => { if (st > 0 && crossed(x.at)) D.ev.push({ text: `${esc(pet.name)}${["", "破殼了", "長出絨毛了", "開始學飛了", "長成成鳥了", "成了歌者"][st]}。${STAGES[st].say(pet.p)}${st === STAGES.length - 1 && names[0] ? `第一首歌是${esc(names[0])}。` : ""}`, photo: snap(c, raw, d), big: true, stage: st }); });
    for (let k = 2; last + SONG * (k - 1) <= c; k++) if (crossed(last + SONG * (k - 1))) D.ev.push({ text: `學會第${cn(k)}首歌${names[k - 1] ? `：${esc(names[k - 1])}` : ""}。` });
    if (crossed(500)) D.ev.push({ text: `一隻伴侶飛來了，站在枝的另一頭。`, photo: snap(c, raw, d), big: true });
    for (const m of milestones(c)) if (crossed(m.at)) D.ev.push({ text: `${WORDS[m.k]}。` });
  });
  const rawBy = (d) => { let lo = 0, hi = feeds.length; while (lo < hi) { const m = (lo + hi) >> 1; if (feeds[m].d <= d) lo = m + 1; else hi = m; } return lo; };
  const gBy = (d) => life.day(d).g ?? 0;
  // what happened to it: colds, trips, a cat, a guest, the weather, a find (lifeOf), with a photo where it looked different
  for (const e of life.events) {
    const flags = e.sick ? { sick: true } : e.away ? { away: { place: e.away } } : e.hiding ? { hiding: e.hiding } : e.mood ? { mood: e.mood } : {};
    // a postcard's day quotes the card itself, so no two days read alike
    const pc = e.postcard, text = pc ? `${esc(pet.name)}從${esc(pc.zh)}寄來${esc(pc.sightZh)}的明信片。` : e.text; // a sight comes back only after its city's others
    day(e.d).ev.push({ text, big: Boolean(e.big || e.photo), ...(e.photo ? { photo: snap(gBy(e.d), rawBy(e.d), e.d, flags) } : {}), ...(pc ? { postcard: pc } : {}) });
  }
  // the calendar: what came with the day, not with a bite
  const SEASONS = { spring: "春天來了，枝上開花。", summer: "入夏，葉子長滿了枝。", autumn: "入秋，葉子黃了。", winter: "冬天到了，枝上積了雪。" };
  let prev = storyOf(gBy(start), 0, since, start);
  for (let d = addDays(start, 1); d <= today; d = addDays(d, 1)) {
    const c = gBy(d), sg = c >= last ? 1 + Math.floor((c - last) / SONG) : 0, s2 = storyOf(c, sg, since, d), out = [];
    if (s2.birthday) out.push({ text: `院子開張${s2.years === 1 ? "一週年" : `${cn(s2.years)}週年`}。`, big: true });
    if (s2.season !== prev.season) out.push({ text: SEASONS[s2.season] });
    if (s2.molt && !prev.molt && c) out.push({ text: `${pet.p}開始換羽，顏色淡了一些。` });
    if (!s2.molt && prev.molt && c) out.push({ text: "新的羽毛長好了。" });
    if (s2.rebuilt && !prev.rebuilt && c) out.push({ text: "春天，巢重新築過。" });
    if (s2.eggs && !prev.eggs) out.push({ text: "巢裡有了兩顆蛋。", big: true });
    if (s2.chicks && !prev.chicks) out.push({ text: "雛鳥孵出來了。", big: true });
    if (s2.fledged && !prev.fledged) out.push({ text: "幼鳥飛走了，院子安靜下來。" });
    if (s2.christmas && !prev.christmas) out.push({ text: "枝頭掛上一顆小星星。" });
    const ds = life.day(d), flags = ds.sick ? { sick: true } : ds.away ? { away: { place: ds.away } } : {};
    if (out.length) { const D = day(d); D.ev.push(...out.map((e, j) => (j === 0 ? { ...e, photo: snap(c, rawBy(d), d, flags) } : e))); } // after the day's bites: the chicks of a mate that came that day
    prev = s2;
  }
  const list = [...days.entries()].filter(([, v]) => v.ev.length).sort((a, b) => a[0].localeCompare(b[0])).map(([date, v]) => ({ date, ...v }));
  const reached = STAGES.map((x, j) => ({ ...x, j, on: j === 0 ? start : feeds[life.effAt.findIndex((e, i) => life.kindAt[i] === "grow" && e >= x.at)]?.d || null }));
  return { pet, start, total: feeds.length, g, list, reached, n, names, away: (d) => Boolean(life.day(d).away), lookAt: (c, d, flags) => lookAt(c, d, since, flags) };
}
export function renderNestAlbum(el, api, afterSync = false) {
  const n = nest();
  if (!n) { renderNestSettings(el, api); return; }
  const a = albumOf(n), pet = a.pet, today = twNow().date;
  const days = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${a.start}T00:00:00Z`)) / 864e5) + 1;
  const md = (d) => `${Number(d.slice(5, 7))} 月 ${Number(d.slice(8))} 日`;
  const grow = a.reached.map((x) => `<li class="${x.on ? "on" : ""}"><b>${esc(x.zh)}</b><span>${x.on ? esc(md(x.on)) : `再 ${x.at - a.g} 口`}</span></li>`).join("");
  let pic = 0, month = "";
  const shots = [], cards = []; // every print and postcard on the page, for the enlarged views
  const cap = (p) => `${esc(md(p.date))}・${p.raw ? `第 ${p.raw} 口` : "開院"}`;
  const photo = (p, big, text) => { const st = { ...a.lookAt(p.total, p.date, p.flags), pet }; const tilt = [-1.6, 1.2, -.8, 1.7, -1.2, .7][pic % 6]; shots.push({ p, text }); return `<figure class="nest-photo${big ? " big" : ""}" style="--tilt:${tilt}deg" data-shot="${pic++}" role="button" tabindex="0" aria-label="放大 ${esc(md(p.date))} 的照片">${birdSvg(st)}<figcaption>${cap(p)}</figcaption></figure>`; };
  const body = a.list.map((d) => {
    const m = d.date.slice(0, 7), head = m !== month ? `<h2 class="album-mon"><span>${Number(m.slice(5))} 月</span><i>${m.slice(0, 4)}</i></h2>` : "";
    month = m;
    const by = Object.entries(d.by).sort((x, y) => y[1] - x[1]).map(([id, c]) => `${id === n.me ? "你" : esc(n.members?.[id] || "朋友")} ${c} 口`);
    const pics = d.ev.filter((e) => e.photo).map((e) => photo(e.photo, e.big, e.text)).join("") + d.ev.filter((e) => e.postcard).map((e) => { cards.push(e.postcard); return postcardThumb(e.postcard, cards.length - 1); }).join("");
    const lines = d.ev.map((e) => `<li${e.big ? ' class="big"' : ""}>${e.text}</li>`).join("");
    return `${head}<section class="album-day"><time datetime="${d.date}">${esc(md(d.date))}</time>${pics ? `<div class="album-pics">${pics}</div>` : ""}<ul>${lines}</ul>${by.length ? `<p class="by">${a.away(d.date) ? "這天寫信的" : "這天餵的"}：${by.join("、")}</p>` : ""}</section>`;
  }).join("");
  // 回到後院 at the top left, where a way back is looked for (the owner, 2026-11-10: 回到後院放到左上角)
  el.innerHTML = `<a class="album-back" href="#/nest"><span aria-hidden="true">‹</span> 回到後院<span class="de">Hinterhof</span></a>
    <header class="page-title"><h1>${esc(pet.name)}的相簿</h1><span class="de">Album</span></header>
    <p class="album-lead">從 ${esc(fmtDate(a.start, "short"))} 開院，到今天第 ${days} 天，一共吃了 ${a.total} 口。</p>
    <section class="set album-grow"><h2>什麼時候長大的</h2><ol>${grow}</ol></section>
    <div class="album">${body}</div>`;
  // A print tapped opens large, and the bird in it comes alive (the owner, 2026-11-10: 點相片裡可以放大相片，然後鳥會動，
  // 飛來飛去之類的): it hops, looks round, and — from the fledgling on — flies about inside the photo, as in the yard
  // (liveBird); tapped, it answers as in the yard (pokeBird, with its voice unless 後院設定 has it off). The print grows
  // out of the thumbnail; the dark round it, 關上 or Escape put it back.
  const open = (fig) => {
    const i = Number(fig.dataset.shot), shot = shots[i];
    if (!shot || document.querySelector(".photo-view")) return;
    const st = { ...a.lookAt(shot.p.total, shot.p.date, shot.p.flags), pet };
    st.songNames = a.names.slice(0, st.songs);
    const view = document.createElement("div");
    view.className = "photo-view"; view.setAttribute("role", "dialog"); view.setAttribute("aria-modal", "true"); view.setAttribute("aria-label", `${md(shot.p.date)}的照片`);
    view.innerHTML = `<figure class="nest-photo live">${birdSvg(st)}<figcaption>${cap(shot.p)}</figcaption></figure><p class="poke-line" aria-live="polite"></p>${shot.text ? `<p class="pv-text">${shot.text}</p>` : ""}<button class="pv-close" type="button">關上</button>`;
    document.body.append(view);
    const big = view.querySelector(".nest-photo"), b = big.querySelector(".bird");
    b.removeAttribute("aria-hidden"); b.setAttribute("role", "button"); b.tabIndex = 0; b.setAttribute("aria-label", `摸摸${pet.name}`);
    const poke = (e) => { e.stopPropagation(); pokeBird(view, st); };
    b.addEventListener("click", poke);
    b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); poke(e); } });
    const html = document.documentElement, was = html.style.overflow;
    html.style.overflow = "hidden";
    const from = fig.getBoundingClientRect(), to = big.getBoundingClientRect();
    if (!calm() && to.width) big.animate([{ transform: `translate(${from.left + from.width / 2 - to.left - to.width / 2}px, ${from.top + from.height / 2 - to.top - to.height / 2}px) scale(${from.width / to.width})` }, { transform: "none" }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
    if (!calm()) view.animate([{ backgroundColor: "transparent" }, {}], { duration: 260, easing: "ease-out" });
    liveBird(big, { fly: true });
    const close = () => { view.remove(); html.style.overflow = was; removeEventListener("keydown", onKey); removeEventListener("hashchange", close); fig.focus({ preventScroll: true }); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    view.addEventListener("click", (e) => { if (e.target === view || e.target.closest(".pv-close")) close(); });
    addEventListener("keydown", onKey);
    addEventListener("hashchange", close, { once: true });
    view.querySelector(".pv-close").focus({ preventScroll: true });
  };
  el.querySelectorAll("[data-pc]").forEach((b) => b.addEventListener("click", () => openPostcard(cards[Number(b.dataset.pc)], pet, b)));
  fillCards(el);
  el.querySelectorAll(".nest-photo[data-shot]").forEach((fig) => {
    fig.addEventListener("click", () => open(fig));
    fig.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(fig); } });
  });
  if (!afterSync) syncNest(api).then((ok) => { if (ok && el.isConnected && location.hash === "#/nest/album") renderNestAlbum(el, api, true); });
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
