// 紀念郵票 (Gedenkmarken; the owner, 2026-11-08: 一些特殊日子我也想要有紀念郵票，像聖誕節之類的，那天在主頁可以提示有紀念郵票).
// On these days the stamp earned by reading the paper to the end is a commemorative issue: its own painting (one chosen
// for the day, public domain, from Wikimedia Commons — not the day's picture), its own paper and ribbon, the day's name
// in German on the ribbon, and the opening show of the 創刊紀念郵票 when it is opened. The front page says so that
// morning (app.js festBox). stamps.js draws it; this file only knows which day is which.
//
// Fixed days by month and day; Easter by the Gregorian computus; the two lunar feasts from a table of their Gregorian
// dates (the Chinese calendar is set by astronomical new moons, not by a formula worth carrying in a PWA) — checked
// against two published calendars on 2026-11-08 and to be extended before 2036.

export const FEASTS = {
  newyear: { zh: "元旦", name: "Neujahr", line: "新年的第一份報紙", pic: {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Pieter_Bruegel_the_Elder_-_Hunters_in_the_Snow_%28Winter%29_-_Google_Art_Project.jpg/1280px-Pieter_Bruegel_the_Elder_-_Hunters_in_the_Snow_%28Winter%29_-_Google_Art_Project.jpg", "thumb": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Pieter_Bruegel_the_Elder_-_Hunters_in_the_Snow_%28Winter%29_-_Google_Art_Project.jpg/960px-Pieter_Bruegel_the_Elder_-_Hunters_in_the_Snow_%28Winter%29_-_Google_Art_Project.jpg", "position": "30% 50%", "credit": "雪中獵人（冬）・布勒哲爾・1565"} },
  lunar: { zh: "春節", name: "Frühlingsfest", line: "農曆新年的第一天", pic: {"src": "https://upload.wikimedia.org/wikipedia/commons/f/f0/Beautiful_Scenery_for_the_New_Year.jpg", "thumb": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Beautiful_Scenery_for_the_New_Year.jpg/500px-Beautiful_Scenery_for_the_New_Year.jpg", "position": "50% 42%", "credit": "歲朝麗景・陳書・1735"} },
  easter: { zh: "復活節", name: "Ostern", line: "復活節的早晨", pic: {"src": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Piero_della_Francesca_-_Resurrection_%28detail%29_-_WGA17610.jpg", "thumb": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Piero_della_Francesca_-_Resurrection_%28detail%29_-_WGA17610.jpg/500px-Piero_della_Francesca_-_Resurrection_%28detail%29_-_WGA17610.jpg", "position": "52% 30%", "credit": "基督復活・皮耶羅・德拉・弗朗切斯卡・約 1465"} },
  midautumn: { zh: "中秋節", name: "Mondfest", line: "月圓的這一天", pic: {"src": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Untitled%2C_Two_Rabbits%2C_Pampas_Grass%2C_and_Full_Moon_%28Hiroshige%29.jpg", "thumb": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Untitled%2C_Two_Rabbits%2C_Pampas_Grass%2C_and_Full_Moon_%28Hiroshige%29.jpg/500px-Untitled%2C_Two_Rabbits%2C_Pampas_Grass%2C_and_Full_Moon_%28Hiroshige%29.jpg", "position": "55% 50%", "credit": "滿月、芒草與雙兔・歌川廣重・約 1850"} },
  christmas: { zh: "聖誕節", name: "Weihnachten", line: "聖誕節的早晨", pic: {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/Adoration_of_the_shepherds%2C_by_Gerard_van_Honthorst.jpg/1280px-Adoration_of_the_shepherds%2C_by_Gerard_van_Honthorst.jpg", "thumb": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/Adoration_of_the_shepherds%2C_by_Gerard_van_Honthorst.jpg/960px-Adoration_of_the_shepherds%2C_by_Gerard_van_Honthorst.jpg", "position": "60% 50%", "credit": "牧羊人朝拜聖嬰・洪特霍斯特・1622"} },
  founding: { zh: "創刊週年", name: "Jahrestag", line: "創刊的這一天", pic: {"src": "https://upload.wikimedia.org/wikipedia/commons/b/b4/L%C3%A9o-Paul_Robert_-_Rouge-gorge_familier_-_aquarelle_-_1915.jpg", "thumb": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/L%C3%A9o-Paul_Robert_-_Rouge-gorge_familier_-_aquarelle_-_1915.jpg/500px-L%C3%A9o-Paul_Robert_-_Rouge-gorge_familier_-_aquarelle_-_1915.jpg", "position": "75% 50%", "credit": "知更鳥（歐亞鴝）・萊奧－保羅・羅貝爾・1915"} },
  barca: { zh: "巴薩建隊紀念日", name: "FC Barcelona · 1899", line: "巴薩在 1899 年的這一天成立", pic: {"src": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Retrat_del_Futbol_Club_Barcelona_ANC1-402-N-8872.jpg", "thumb": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Retrat_del_Futbol_Club_Barcelona_ANC1-402-N-8872.jpg/500px-Retrat_del_Futbol_Club_Barcelona_ANC1-402-N-8872.jpg", "position": "47% 50%", "credit": "巴塞隆納足球俱樂部，左側西裝者為創辦人甘伯・埃斯普盧加斯攝・約 1902–1910"} },
  // The second set (the owner, the same day: 有機會多一點嗎): the Chinese calendar's lantern and dragon-boat days, the
  // church year's Advent and Pentecost, and days that are the reader's own — his profession, his composers, his books,
  // the painter whose gold the paper wears, the novelist the serial is translating.
  lantern: { zh: "元宵節", name: "Laternenfest", line: "正月十五，元宵節", pic: {"src": "https://upload.wikimedia.org/wikipedia/commons/1/1d/%E6%98%8E%E6%86%B2%E5%AE%97%E8%A1%8C%E6%A8%82%E5%9C%96%EF%BC%88%E5%B1%80%E9%83%A8%EF%BC%893.jpg", "thumb": "https://upload.wikimedia.org/wikipedia/commons/1/1d/%E6%98%8E%E6%86%B2%E5%AE%97%E8%A1%8C%E6%A8%82%E5%9C%96%EF%BC%88%E5%B1%80%E9%83%A8%EF%BC%893.jpg", "position": "35% 50%", "credit": "明憲宗元宵行樂圖（局部）・明代宮廷畫家・1485"} },
  dragonboat: { zh: "端午節", name: "Drachenbootfest", line: "五月初五，端午節", pic: {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/%E6%B8%85%E7%95%AB%E9%99%A2%E7%95%AB%E5%8D%81%E4%BA%8C%E6%9C%88%E6%9C%88%E4%BB%A4%E5%9C%96%E4%BA%94%E6%9C%88_%E8%BB%B8.jpg/1280px-%E6%B8%85%E7%95%AB%E9%99%A2%E7%95%AB%E5%8D%81%E4%BA%8C%E6%9C%88%E6%9C%88%E4%BB%A4%E5%9C%96%E4%BA%94%E6%9C%88_%E8%BB%B8.jpg", "thumb": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/%E6%B8%85%E7%95%AB%E9%99%A2%E7%95%AB%E5%8D%81%E4%BA%8C%E6%9C%88%E6%9C%88%E4%BB%A4%E5%9C%96%E4%BA%94%E6%9C%88_%E8%BB%B8.jpg/960px-%E6%B8%85%E7%95%AB%E9%99%A2%E7%95%AB%E5%8D%81%E4%BA%8C%E6%9C%88%E6%9C%88%E4%BB%A4%E5%9C%96%E4%BA%94%E6%9C%88_%E8%BB%B8.jpg", "position": "50% 30%", "credit": "清院本十二月令圖・五月・清代宮廷畫院・十八世紀"} },
  advent: { zh: "降臨節第一主日", name: "Erster Advent", line: "降臨節的第一個主日，往聖誕節的四個禮拜從今天開始", pic: {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ea/Pieter_Bruegel_the_Elder_-_The_Numbering_at_Bethlehem_-_Google_Art_Project.jpg/1280px-Pieter_Bruegel_the_Elder_-_The_Numbering_at_Bethlehem_-_Google_Art_Project.jpg", "thumb": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ea/Pieter_Bruegel_the_Elder_-_The_Numbering_at_Bethlehem_-_Google_Art_Project.jpg/500px-Pieter_Bruegel_the_Elder_-_The_Numbering_at_Bethlehem_-_Google_Art_Project.jpg", "position": "100% 50%", "credit": "伯利恆的戶口普查・布勒哲爾・1566"} },
  pentecost: { zh: "五旬節", name: "Pfingsten", line: "復活節後第五十天，五旬節", pic: {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Pentecost%C3%A9s_%28El_Greco%2C_c._1600%29_Prado.jpg/1280px-Pentecost%C3%A9s_%28El_Greco%2C_c._1600%29_Prado.jpg", "thumb": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Pentecost%C3%A9s_%28El_Greco%2C_c._1600%29_Prado.jpg/960px-Pentecost%C3%A9s_%28El_Greco%2C_c._1600%29_Prado.jpg", "position": "50% 2%", "credit": "聖靈降臨・葛雷柯・約 1600"} },
  oralhealth: { zh: "世界口腔健康日", name: "Tag der Mundgesundheit", line: "今天是世界口腔健康日，診間的人的日子", pic: {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/%C3%89lisabeth-Louise_Vig%C3%A9e-Le_Brun_-_Madame_Vig%C3%A9e-Le_Brun_et_sa_fille_%281786%29.JPG/1280px-%C3%89lisabeth-Louise_Vig%C3%A9e-Le_Brun_-_Madame_Vig%C3%A9e-Le_Brun_et_sa_fille_%281786%29.JPG", "thumb": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/%C3%89lisabeth-Louise_Vig%C3%A9e-Le_Brun_-_Madame_Vig%C3%A9e-Le_Brun_et_sa_fille_%281786%29.JPG/500px-%C3%89lisabeth-Louise_Vig%C3%A9e-Le_Brun_-_Madame_Vig%C3%A9e-Le_Brun_et_sa_fille_%281786%29.JPG", "position": "50% 12%", "credit": "畫家與女兒朱莉（露齒微笑的自畫像）・維熱－勒布倫・1786"} },
  mozart: { zh: "莫札特誕辰", name: "Mozart · 1756", line: "莫札特在 1756 年的今天出生", pic: {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/1280px-Wolfgang-amadeus-mozart_1.jpg", "thumb": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/500px-Wolfgang-amadeus-mozart_1.jpg", "position": "50% 30%", "credit": "莫札特肖像・芭芭拉・克拉夫特・1819"} },
  beethoven: { zh: "貝多芬誕辰", name: "Beethoven · 1770", line: "貝多芬在 1770 年的這幾天出生", pic: {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Joseph_Karl_Stieler%27s_Beethoven_mit_dem_Manuskript_der_Missa_solemnis_%28cropped%29.jpg/1280px-Joseph_Karl_Stieler%27s_Beethoven_mit_dem_Manuskript_der_Missa_solemnis_%28cropped%29.jpg", "thumb": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Joseph_Karl_Stieler%27s_Beethoven_mit_dem_Manuskript_der_Missa_solemnis_%28cropped%29.jpg/960px-Joseph_Karl_Stieler%27s_Beethoven_mit_dem_Manuskript_der_Missa_solemnis_%28cropped%29.jpg", "position": "50% 42%", "credit": "貝多芬與《莊嚴彌撒》手稿・斯蒂勒・1820"} },
  bookday: { zh: "世界閱讀日", name: "Welttag des Buches", line: "今天是世界閱讀日", pic: {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Jean_Honor%C3%A9_Fragonard%2C_Young_Girl_Reading%2C_c._1769%2C_NGA_46303.jpg/1280px-Jean_Honor%C3%A9_Fragonard%2C_Young_Girl_Reading%2C_c._1769%2C_NGA_46303.jpg", "thumb": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Jean_Honor%C3%A9_Fragonard%2C_Young_Girl_Reading%2C_c._1769%2C_NGA_46303.jpg/1280px-Jean_Honor%C3%A9_Fragonard%2C_Young_Girl_Reading%2C_c._1769%2C_NGA_46303.jpg", "position": "50% 30%", "credit": "讀書的少女・福拉哥納爾・約 1769"} },
  klimt: { zh: "克林姆誕辰", name: "Klimt · 1862", line: "克林姆在 1862 年的今天出生", pic: {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Gustav_Klimt%2C_1907%2C_Adele_Bloch-Bauer_I%2C_Neue_Galerie_New_York.jpg/1280px-Gustav_Klimt%2C_1907%2C_Adele_Bloch-Bauer_I%2C_Neue_Galerie_New_York.jpg", "thumb": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Gustav_Klimt%2C_1907%2C_Adele_Bloch-Bauer_I%2C_Neue_Galerie_New_York.jpg/500px-Gustav_Klimt%2C_1907%2C_Adele_Bloch-Bauer_I%2C_Neue_Galerie_New_York.jpg", "position": "60% 20%", "credit": "阿黛爾・布洛赫－鮑爾肖像一號・克林姆・1907"} },
  dostoevsky: { zh: "杜斯妥也夫斯基誕辰", name: "Dostojewski · 1821", line: "杜斯妥也夫斯基在 1821 年的今天出生，連載的那本書就是他寫的", pic: {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg/1280px-Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg", "thumb": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg/500px-Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg", "position": "50% 20%", "credit": "杜斯妥也夫斯基肖像・彼羅夫・1872"} },
};

// 正月初一, 五月初五 and 八月十五, Gregorian. 元宵 (正月十五) is always 正月初一 + 14 days.
const LUNAR = ["2026-02-17", "2027-02-06", "2028-01-26", "2029-02-13", "2030-02-03", "2031-01-23", "2032-02-11", "2033-01-31", "2034-02-19", "2035-02-08"];
const DRAGON = ["2027-06-09", "2028-05-28", "2029-06-16", "2030-06-05", "2031-06-24", "2032-06-12", "2033-06-01", "2034-06-20", "2035-06-10"];
const MOON = ["2026-09-25", "2027-09-15", "2028-10-03", "2029-09-22", "2030-09-12", "2031-10-01", "2032-09-19", "2033-09-08", "2034-09-27", "2035-09-16"];

// Easter Sunday (Western), the anonymous Gregorian algorithm (Meeus/Jones/Butcher).
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const plusDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
// 降臨節第一主日 (Protestant usage, as the paper's 和合本 verses): the fourth Sunday before Christmas, between 27 November and 3 December.
function advent(y) {
  const xmas = new Date(Date.UTC(y, 11, 25)), back = xmas.getUTCDay() || 7; // Christmas on a Sunday: the Sunday before
  return plusDays(`${y}-12-25`, -(back + 21));
}
const FOUNDED = 2026; // the first issue, 2026-10-11
const ZH_NUM = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

// The feast of a date (YYYY-MM-DD), or null: { key, zh, name, line, pic }. The founding anniversary counts its years
// ("創刊一週年", "1. Jahrestag") and starts in 2027.
export function feastOf(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return null;
  const y = Number(date.slice(0, 4)), md = date.slice(5);
  // One stamp a day; where two fall together the first listed wins. The Barça day goes before Advent Sunday (the
  // owner, 2026-11-08: 巴薩建隊日 — 2026-11-29 is both).
  let key = null;
  if (md === "01-01") key = "newyear";
  else if (md === "12-25") key = "christmas";
  else if (LUNAR.includes(date)) key = "lunar";
  else if (LUNAR.some((d) => plusDays(d, 14) === date)) key = "lantern";
  else if (date === easter(y)) key = "easter";
  else if (date === plusDays(easter(y), 49)) key = "pentecost";
  else if (md === "11-29") key = "barca";
  else if (date === advent(y)) key = "advent";
  else if (DRAGON.includes(date)) key = "dragonboat";
  else if (MOON.includes(date)) key = "midautumn";
  else if (md === "10-11" && y > FOUNDED) key = "founding";
  else if (md === "03-20") key = "oralhealth";
  else if (md === "01-27") key = "mozart";
  else if (md === "12-16") key = "beethoven";
  else if (md === "04-23") key = "bookday";
  else if (md === "07-14") key = "klimt";
  else if (md === "11-11") key = "dostoevsky";
  if (!key) return null;
  const f = { key, ...FEASTS[key] };
  if (key === "founding") {
    const n = y - FOUNDED;
    f.zh = `創刊${ZH_NUM[n] || n}週年`;
    f.name = `${n}. Jahrestag`;
  }
  return f;
}
