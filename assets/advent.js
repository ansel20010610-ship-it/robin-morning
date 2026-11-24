// 降臨節月曆 (Adventskalender; sample 甲「今天這扇窗」, picked by the owner on 2026-11-24): from 1 to 24 December the
// front page has a small card under 今日禱告 — a little gilt door with the day on it, the calendar's name, and four
// candles, one more lit on each Sunday of Advent. Opened, the door shows the day's piece: the composer, the title in
// Chinese and in the original, one plain line, and 播放, which plays it through the music column's own player
// (spotify.js listen). The pieces are a fixed table here, not fetched, so the card stands in its place from the
// front page's first draw (an iPhone keeps no scroll anchor: a box that turned up later would push the page down).
// An archive issue of those days shows its own day's window and candles: the card is part of that day's paper.
import { esc, ICON } from "./util.js";
import { advent } from "./feasts.js";
import { listen, lookUp, isLoggedIn, canStream, preloadPlayer } from "./spotify.js";

// One window a day, 12-01 first (the editors' selection, third version). `sp` is what the music column's articles
// carry for spotify.js resolve: the search, the performer, the words every matched track title must hold.
// 12-09: Fiedler's Christmas albums have a second "Sleigh Ride" (Mozart's, K. 605) beside Anderson's; the selection
// names an album with Anderson's alone, and should the search land on another, `max` plays the first match only.
// The table is 2026's: the lines for 12-06, 12-13 and 12-20 speak of that day's candle and of "this Sunday", which hold
// for 2026's Sundays of Advent only (11-29, 12-06, 12-13, 12-20). The candles follow any year (litOn below); before
// another December these three lines need rewriting, or the table re-ordering, for that year's Sundays.
const WINDOWS = [
  {"composer": "巴哈", "work": "《醒來吧》〈錫安聽見守望者歌唱〉", "orig": "Wachet auf, ruft uns die Stimme, BWV 140: IV. Zion hört die Wächter singen", "line": "守望的人半夜喊「醒來吧」，等待從今天開始。", "sp": {"query": "Bach Wachet auf ruft uns die Stimme BWV 140 Zion hört die Wächter singen Karl Richter Münchener Bach-Orchester", "artist_hint": "Karl Richter", "track_filter": ["Zion hört"]}},  // 12-01
  {"composer": "韋瓦第", "work": "《四季》〈冬〉", "orig": "Le quattro stagioni: Concerto No. 4 in F minor \"L'inverno\", Op. 8 No. 4, RV 297", "line": "〈冬〉附的詩寫著「冷得牙齒打顫」，第一段就聽得到。", "sp": {"query": "Vivaldi Four Seasons Winter Itzhak Perlman London Philharmonic Orchestra", "artist_hint": "Perlman", "track_filter": ["Winter"]}},  // 12-02
  {"composer": "韓德爾", "work": "《彌賽亞》〈你們要安慰我的百姓〉〈一切山窪都要填滿〉", "orig": "Messiah, HWV 56: Comfort ye my people / Ev'ry valley shall be exalted", "line": "《彌賽亞》第一個開口唱出來的字，就是「安慰」。", "sp": {"query": "Handel Messiah Hogwood Academy of Ancient Music Christ Church Cathedral Choir Comfort ye Ev'ry valley", "artist_hint": "Hogwood", "track_filter": ["Comfort ye"]}},  // 12-03
  {"composer": "瓦德退費爾", "work": "〈溜冰者圓舞曲〉", "orig": "Les Patineurs, valse, Op. 183", "line": "巴黎人冬天在公園裡溜冰，這首圓舞曲就是那片冰場。", "sp": {"query": "Waldteufel Les Patineurs Skaters Waltz Karajan Philharmonia Orchestra", "artist_hint": "Karajan", "track_filter": ["Patineurs"]}},  // 12-04
  {"composer": "達克", "work": "〈在荒涼的隆冬〉（達克版）", "orig": "In the Bleak Midwinter (Harold Darke, 1909)", "line": "英國詩班指揮票選的最佳聖誕歌，冷天裡很安靜的一首。", "sp": {"query": "Darke In the Bleak Midwinter Choir of King's College Cambridge Stephen Cleobury Favourite Carols from King's", "artist_hint": "Cleobury", "track_filter": ["Bleak Midwinter"]}},  // 12-05
  {"composer": "傳統曲調", "work": "〈以馬內利來臨〉", "orig": "O come, O come, Emmanuel (Veni, veni, Emmanuel)", "line": "第二支蠟燭點上：降臨期的老詩歌，求以馬內利快來。", "sp": {"query": "O come O come Emmanuel Choir of King's College Cambridge Philip Ledger Procession with Carols on Advent Sunday", "artist_hint": "Ledger", "track_filter": ["O come O come Emmanuel"]}},  // 12-06
  {"composer": "柴可夫斯基", "work": "《胡桃鉗》〈雪花華爾滋〉", "orig": "The Nutcracker, Op. 71: No. 9 Waltz of the Snowflakes", "line": "《胡桃鉗》第一幕結尾，舞台下起雪，合唱輕輕加進來。", "sp": {"query": "Tchaikovsky The Nutcracker Waltz of the Snowflakes Dorati London Symphony Orchestra Mercury", "artist_hint": "Dorati", "track_filter": ["Snowflakes"]}},  // 12-07
  {"composer": "韋瓦第", "work": "《榮耀頌》〈榮耀歸於至高神〉", "orig": "Gloria in D major, RV 589: I. Gloria in excelsis Deo", "line": "天使對牧羊人唱的「榮耀歸於至高神」，韋瓦第這樣寫。", "sp": {"query": "Vivaldi Gloria RV 589 Gloria in excelsis Deo Willcocks King's College Cambridge Academy of St Martin in the Fields", "artist_hint": "Willcocks", "track_filter": ["589", "Gloria in excelsis"]}},  // 12-08
  {"composer": "安德森", "work": "〈雪橇〉", "orig": "Sleigh Ride", "line": "安德森在大熱天動筆；最後那聲馬叫，是小號吹的。", "sp": {"query": "Leroy Anderson Favorites Sleigh Ride Arthur Fiedler Boston Pops Orchestra", "artist_hint": "Fiedler", "track_filter": ["Sleigh Ride"]}, "max": 1},  // 12-09
  {"composer": "英國傳統", "work": "〈願主賜你們平安，快樂的紳士〉", "orig": "God Rest You Merry, Gentlemen (arr. David Willcocks)", "line": "狄更斯《小氣財神》裡，有人在史古基門口唱這首被趕走。", "sp": {"query": "God Rest You Merry Gentlemen Willcocks Choir of King's College Cambridge Cleobury Favourite Carols from King's", "artist_hint": "Cleobury", "track_filter": ["God Rest You Merry"]}},  // 12-10
  {"composer": "普羅高菲夫", "work": "《基傑中尉》〈三駕馬車〉", "orig": "Lieutenant Kijé Suite, Op. 60: IV. Troika", "line": "三匹馬拉的俄國雪橇，鈴鐺響一路，後來流行聖誕歌也借用過。", "sp": {"query": "Prokofiev Lieutenant Kije Troika Fritz Reiner Chicago Symphony Orchestra", "artist_hint": "Reiner", "track_filter": ["Troika"]}},  // 12-11
  {"composer": "胡伯定克", "work": "《糖果屋》〈晚禱〉", "orig": "Hänsel und Gretel, Act II: Abendsegen (\"Abends, will ich schlafen gehn\")", "line": "兩個迷路的孩子睡前禱告，求十四位天使守著他們。", "sp": {"query": "Humperdinck Hänsel und Gretel Abends will ich schlafen gehn Solti Wiener Philharmoniker Fassbaender Popp", "artist_hint": "Solti", "track_filter": ["Abends will ich schlafen"]}},  // 12-12
  {"composer": "巴哈", "work": "《尊主頌》開頭合唱", "orig": "Magnificat in D major, BWV 243: I. Magnificat anima mea", "line": "第三支蠟燭：巴哈在萊比錫第一個聖誕節演過這首。", "sp": {"query": "Bach Magnificat BWV 243 Karl Richter Münchener Bach-Chor Münchener Bach-Orchester", "artist_hint": "Karl Richter", "track_filter": ["Magnificat anima"]}},  // 12-13
  {"composer": "傳為韓德爾", "work": "〈普世歡騰〉", "orig": "Joy to the World (arr. Hugh Keyte & Andrew Parrott)", "line": "聖誕必唱的〈普世歡騰〉，旋律掛韓德爾的名字，其實說不準。", "sp": {"query": "Joy to the World Choir of King's College Cambridge Stephen Cleobury Favourite Carols from King's", "artist_hint": "Cleobury", "track_filter": ["Joy to the World"]}},  // 12-14
  {"composer": "柯雷里", "work": "《聖誕協奏曲》", "orig": "Concerto grosso in G minor, Op. 6 No. 8 \"Fatto per la notte di Natale\"", "line": "柯雷里在譜上寫「為聖誕夜而作」，最後一段是牧羊人的歌。", "sp": {"query": "Corelli Concerto grosso Op. 6 No. 8 Christmas Concerto Trevor Pinnock The English Concert", "artist_hint": "Pinnock", "track_filter": ["Op. 6", "No. 8"]}},  // 12-15
  {"composer": "柴可夫斯基", "work": "《胡桃鉗》〈雙人舞〉", "orig": "The Nutcracker, Op. 71, Act II: No. 14 Pas de deux: Intrada (Andante maestoso)", "line": "糖梅仙子和騎士的雙人舞，整齣《胡桃鉗》最盛大的一刻。", "sp": {"query": "Tchaikovsky The Nutcracker Pas de deux Andante maestoso Dorati London Symphony Orchestra Mercury", "artist_hint": "Dorati", "track_filter": ["Pas de deux", "Intrada"]}},  // 12-16
  {"composer": "巴哈", "work": "《聖誕神劇》〈田園序曲〉", "orig": "Weihnachtsoratorium, BWV 248, Part II: No. 10 Sinfonia", "line": "第二部先不唱，給夜裡守羊的牧羊人一段音樂。", "sp": {"query": "Bach Christmas Oratorio BWV 248 Part II Sinfonia Gardiner English Baroque Soloists Monteverdi Choir", "artist_hint": "Gardiner", "track_filter": ["BWV 248", "Sinfonia"]}},  // 12-17
  {"composer": "孟德爾頌", "work": "〈聽啊，天使高聲唱〉", "orig": "Hark! The Herald Angels Sing", "line": "旋律原本是孟德爾頌為印刷術四百年寫的慶典歌。", "sp": {"query": "Hark the Herald Angels Sing Mendelssohn Choir of King's College Cambridge Cleobury Favourite Carols from King's", "artist_hint": "Cleobury", "track_filter": ["Hark the Herald"]}},  // 12-18
  {"composer": "傳統聖詩", "work": "〈齊來崇拜〉", "orig": "O Come, All Ye Faithful (Adeste fideles), arr. David Willcocks", "line": "一起去伯利恆，朝拜剛出生的君王。", "sp": {"query": "O Come All Ye Faithful Willcocks Choir of King's College Cambridge Cleobury Favourite Carols from King's", "artist_hint": "Cleobury", "track_filter": ["O Come All Ye Faithful"]}},  // 12-19
  {"composer": "巴哈", "work": "〈耶穌，世人仰望的喜樂〉", "orig": "Herz und Mund und Tat und Leben, BWV 147: X. Jesus bleibet meine Freude", "line": "第四支蠟燭：收這首的清唱劇，最早就是為今天這個主日寫的。", "sp": {"query": "Bach Herz und Mund und Tat und Leben BWV 147 Jesus bleibet meine Freude Karl Richter Münchener Bach-Chor", "artist_hint": "Karl Richter", "track_filter": ["Jesus bleibet"]}},  // 12-20
  {"composer": "韓德爾", "work": "《彌賽亞》〈因有一嬰孩為我們而生〉", "orig": "Messiah, HWV 56: For unto us a child is born", "line": "「有一嬰孩為我們而生」，合唱一組接一組搶著報喜。", "sp": {"query": "Handel Messiah Hogwood Academy of Ancient Music Christ Church Cathedral Choir For unto us a child is born", "artist_hint": "Hogwood", "track_filter": ["For unto us"]}},  // 12-21
  {"composer": "巴哈", "work": "《聖誕神劇》〈歡呼吧，歡騰吧〉", "orig": "Weihnachtsoratorium, BWV 248, Part I: No. 1 Jauchzet, frohlocket", "line": "定音鼓先敲；這段原是祝壽歌，原詞第一句是「敲起鼓來」。", "sp": {"query": "Bach Christmas Oratorio BWV 248 Jauchzet frohlocket Gardiner Monteverdi Choir English Baroque Soloists", "artist_hint": "Gardiner", "track_filter": ["BWV 248", "Jauchzet"]}},  // 12-22
  {"composer": "亞當", "work": "〈聖善夜〉", "orig": "Cantique de Noël (Minuit, chrétiens) / O Holy Night", "line": "1847 年法國小鎮教堂請人寫的聖誕歌，明天就是平安夜。", "sp": {"query": "Adam O Holy Night Pavarotti National Philharmonic Orchestra Kurt Herbert Adler", "artist_hint": "Pavarotti", "track_filter": ["O Holy Night"]}},  // 12-23
  {"composer": "葛魯伯", "work": "〈平安夜〉", "orig": "Stille Nacht, heilige Nacht (Silent Night)", "line": "1818 年首唱只有一把吉他伴奏，這一版是整團維也納愛樂。", "sp": {"query": "Gruber Silent Night Leontyne Price Karajan Wiener Philharmoniker Christmas with Leontyne Price", "artist_hint": "Leontyne Price", "track_filter": ["Stille Nacht"]}},  // 12-24
];

// 1–24 December, the day's window; any other day, none.
const windowOf = (date) => (/^\d{4}-12-(0[1-9]|1\d|2[0-4])$/.test(date || "") ? WINDOWS[Number(date.slice(8)) - 1] : null);
const plus = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
// How many candles are lit on `date`: one for each Sunday of Advent come so far (feasts.js advent: the first of them).
const litOn = (date) => { const first = advent(Number(date.slice(0, 4))); return [0, 7, 14, 21].filter((k) => plus(first, k) <= date).length; };

// The door: the crest's double gold frame and corner studs round an arched leaf with the day on it (drawn on a 40×50
// grid, shown at 32×40). Opened, the leaf stands swung back on its left hinge, seen in perspective, and behind it a
// scrap of score is lit from within.
const LEAF_OPEN = "M7.00 43.00 L7.00 16.00 L6.97 14.99 L6.87 13.97 L6.71 12.97 L6.49 11.99 L6.21 11.04 L5.87 10.12 L5.47 9.26 L5.02 8.45 L4.52 7.71 L3.98 7.05 L3.39 6.48 L2.77 6.01 L2.12 5.64 L1.45 5.38 L0.77 5.25 L0.08 5.23 L-0.60 5.35 L-1.27 5.60 L-1.92 5.98 L-2.54 6.49 L-3.11 7.12 L-3.63 7.87 L-4.08 8.74 L-4.47 9.70 L-4.78 10.74 L-5.00 11.86 L-5.14 13.02 L-5.19 14.22 L-5.19 46.55 Z";
const MOULD_OPEN = "M5.80 40.29 L5.80 17.35 L5.78 16.55 L5.70 15.75 L5.57 14.96 L5.40 14.19 L5.17 13.44 L4.90 12.73 L4.59 12.06 L4.23 11.45 L3.84 10.89 L3.41 10.39 L2.96 9.97 L2.47 9.63 L1.97 9.37 L1.45 9.20 L0.93 9.12 L0.40 9.14 L-0.12 9.27 L-0.63 9.49 L-1.11 9.81 L-1.58 10.23 L-2.00 10.73 L-2.39 11.33 L-2.73 12.01 L-3.01 12.75 L-3.24 13.56 L-3.41 14.42 L-3.51 15.31 L-3.54 16.22 L-3.54 42.56 Z";
const HINGES = `<rect class="hinge" x="6.1" y="19" width="1.8" height="3.4"/><rect class="hinge" x="6.1" y="36" width="1.8" height="3.4"/>`;
const door = (n) => `<svg class="adv-door" viewBox="0 0 40 50" aria-hidden="true">
  <defs><radialGradient id="adv-glow" cx="50%" cy="58%" r="62%"><stop offset="0" class="glow0"/><stop offset="1" class="glow1"/></radialGradient></defs>
  <rect class="fr" x="1.5" y="1.5" width="37" height="47" stroke-width="1.2"/>
  <rect class="fr" x="3.6" y="3.6" width="32.8" height="42.8" stroke-width=".55"/>
  <g class="stud"><rect x="0" y="0" width="3" height="3"/><rect x="37" y="0" width="3" height="3"/><rect x="0" y="47" width="3" height="3"/><rect x="37" y="47" width="3" height="3"/></g>
  <line class="sill" x1="5.5" y1="44.6" x2="34.5" y2="44.6"/>
  <g class="in">
    <path class="hole" d="M7 43 V16 A13 9 0 0 1 33 16 V43 Z"/>
    <path d="M7 43 V16 A13 9 0 0 1 33 16 V43 Z" fill="url(#adv-glow)"/>
    <g class="staff"><line x1="9.5" y1="21" x2="30.5" y2="21"/><line x1="9.5" y1="24" x2="30.5" y2="24"/><line x1="9.5" y1="27" x2="30.5" y2="27"/><line x1="9.5" y1="30" x2="30.5" y2="30"/><line x1="9.5" y1="33" x2="30.5" y2="33"/></g>
    <ellipse class="nh" cx="13.5" cy="31.5" rx="1.65" ry="1.18" transform="rotate(-22 13.5 31.5)"/>
    <circle class="nh" cx="16.7" cy="31.1" r=".42"/>
    <ellipse class="nh" cx="20.5" cy="28.5" rx="1.65" ry="1.18" transform="rotate(-22 20.5 28.5)"/>
    <ellipse class="nh" cx="27" cy="25.5" rx="1.65" ry="1.18" transform="rotate(-22 27 25.5)"/>
    <line class="stem" x1="15.0" y1="31.0" x2="15.0" y2="23.4"/><line class="stem" x1="22.0" y1="28.0" x2="22.0" y2="20.4"/><line class="stem" x1="28.5" y1="25.0" x2="28.5" y2="17.6"/>
    <path class="beam" d="M14.75 23.6 L22.25 20.4 L22.25 21.5 L14.75 24.7 Z"/>
    <path class="beam" d="M19.4 23.5 L22.25 22.3 L22.25 23.2 L19.4 24.4 Z"/>
  </g>
  <g class="shut">
    <path class="leaf" d="M7 43 V16 A13 9 0 0 1 33 16 V43 Z"/>
    <path class="mould" d="M10 40 V17.5 A10 7 0 0 1 30 17.5 V40 Z"/>
    <path class="grain" d="M13.2 33.5 V39 M16.4 33.5 V39 M19.6 33.5 V39 M22.8 33.5 V39 M26 33.5 V39"/>
    <text class="no" x="20" y="29.8" text-anchor="middle">${n}</text>
    <circle class="knob" cx="29.4" cy="34.4" r="1"/>
    ${HINGES}
  </g>
  <g class="ajar"><path class="leaf" d="${LEAF_OPEN}"/><path class="mould" d="${MOULD_OPEN}"/>${HINGES}</g>
</svg>`;

// The four candles on a gilt rail; `lit` of them burning, the first lit the one burnt down most.
function candles(lit) {
  const one = (cx, i) => {
    const on = i < lit;
    const top = on ? 24.4 + (lit - 1 - i) * 1.2 : 22.6;
    const wax = `<path class="wax" d="M${cx - 3} 43.6 V${top + .9} Q${cx} ${top - .5} ${cx + 3} ${top + .9} V43.6 Z"/>`;
    const shade = `<line class="shade" x1="${cx + 1.5}" y1="${top + 2.4}" x2="${cx + 1.5}" y2="42.6"/>`;
    if (!on) return `${wax}${shade}<path class="wick" d="M${cx} ${top + .3} V${top - 2.3}"/>`;
    const drip = `<path class="wax drip" d="M${cx - 3} ${top + 1} Q${cx - 2.2} ${top + 1.4} ${cx - 2.1} ${top + 4.6} Q${cx - 2.3} ${top + 5.8} ${cx - 3} ${top + 5.4}"/>`;
    return `<circle cx="${cx}" cy="${top - 9}" r="11" fill="url(#adv-halo)"/>${wax}${shade}${drip}
      <path class="wick" d="M${cx} ${top + .3} Q${cx} ${top - 1.4} ${cx + .5} ${top - 2.6}"/>
      <path d="M${cx + .3} ${top - 19.5} C${cx + 2.9} ${top - 13.6} ${cx + 3} ${top - 9.4} ${cx + .2} ${top - 2.2} C${cx - 2.8} ${top - 6.4} ${cx - 2.5} ${top - 13.4} ${cx + .3} ${top - 19.5} Z" fill="url(#adv-flame)"/>
      <path class="core" d="M${cx + .25} ${top - 10.6} C${cx + 1.3} ${top - 8.2} ${cx + 1.3} ${top - 6} ${cx + .2} ${top - 3.6} C${cx - .9} ${top - 6} ${cx - .9} ${top - 8.2} ${cx + .25} ${top - 10.6} Z"/>`;
  };
  return `<svg class="candles" viewBox="0 3 62 45" aria-hidden="true">
    <defs><radialGradient id="adv-halo"><stop offset="0" class="halo0"/><stop offset="1" class="halo1"/></radialGradient>
      <linearGradient id="adv-flame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="fl0"/><stop offset=".75" class="fl1"/></linearGradient></defs>
    ${[8, 23, 38, 53].map(one).join("")}
    <line class="base" x1="0" y1="44.2" x2="62" y2="44.2"/><line class="base thin" x1="1.5" y1="46.4" x2="60.5" y2="46.4"/>
    <rect class="foot" x="-1" y="43.2" width="2" height="2"/><rect class="foot" x="61" y="43.2" width="2" height="2"/>
  </svg>`;
}

// The card for an issue of `date` (YYYY-MM-DD), or "" outside 1–24 December. It keeps one class whether open or shut:
// app.js refreshFront reopens what the reader had open by class name.
export function adventHtml(date) {
  const w = windowOf(date);
  if (!w) return "";
  const n = Number(date.slice(8));
  return `<details class="advent" data-day="${n}" aria-label="降臨節月曆，第 ${n} 扇窗">
    <summary><span class="row">${door(n)}<span class="t"><b>降臨節月曆</b><span class="de">Adventskalender</span></span>${candles(litOn(date))}</span></summary>
    <div class="inside">
      <div class="composer">${esc(w.composer)}</div>
      <div class="work">${esc(w.work)}</div>
      <div class="orig">${esc(w.orig)}</div>
      <p>${esc(w.line)}</p>
      <div class="btns"><button class="btn" type="button" data-play>${ICON.play}播放</button></div>
    </div>
  </details>`;
}

// After the front page is drawn. Opening the door looks the recording up (spotify.js lookUp, which 播放 shares) and
// fetches the player, so 播放 can start at once; the tap itself goes to spotify.js listen.
export function wireAdvent(root) {
  const box = root.querySelector(".advent");
  const w = box && WINDOWS[Number(box.dataset.day) - 1];
  if (!w) return;
  box.addEventListener("toggle", () => {
    if (!box.open || !isLoggedIn()) return;
    lookUp(w.sp).catch(() => {});
    if (canStream()) preloadPlayer().catch(() => {});
  });
  box.querySelector("[data-play]").addEventListener("click", () => listen(w.sp, `${w.composer}・${w.work}`, { max: w.max || 0 }));
}
