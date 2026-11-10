var CITIES_PART = {
  istanbul: {
    zh: "伊斯坦堡", de: "İstanbul", gift: "一顆土耳其藍眼睛",
    sights: [
      { id: "sultanahmet", zh: "藍色清真寺",
        see: ["六根細細的宣禮塔像鉛筆一樣插向天空", "大圓頂底下一層一層疊著小圓頂", "裡面的牆上貼滿了藍色花紋的磁磚"],
        spots: ["大圓頂最上面的尖頂上", "宣禮塔的尖帽子上", "半圓頂的頂上"],
        draw(c) {
          const { r, sea } = c, cx = btw(r, 176, 192), k = btw(r, .9, 1), B = 168;
          let s = hills(156, "#A9B38C", r, 6), l = ""; const perch = [];
          const X = (d) => f1(cx + d * k), Y = (d) => f1(B - d * k);
          const dome = (dx, base, R, h, col) => `<path d="M${X(dx - R)} ${Y(base)} A${f1(R * k)} ${f1(h * k)} 0 0 1 ${X(dx + R)} ${Y(base)} Z" fill="${col}"/>`;
          const mn = (dx, ht, w, col, bal) => { let m = `<rect x="${X(dx - w / 2)}" y="${Y(ht)}" width="${f1(w * k)}" height="${f1(ht * k)}" fill="${col}"/><path d="M${X(dx - w / 2 - .4)} ${Y(ht)} L${X(dx)} ${Y(ht + 14)} L${X(dx + w / 2 + .4)} ${Y(ht)} Z" fill="#6F7F8E"/>`; for (let i = 0; i < bal; i++) m += `<rect x="${X(dx - w / 2 - 1.3)}" y="${Y(ht - 5 - i * 22)}" width="${f1((w + 2.6) * k)}" height="${f1(2 * k)}" fill="#B5A994"/>`; return m; };
          s += `<rect x="${X(-92)}" y="${Y(16)}" width="${f1(50 * k)}" height="${f1(16 * k)}" fill="#D3C8B2"/>`;
          s += mn(-84, 84, 3, "#E2DACA", 2) + mn(-42, 106, 3.2, "#E2DACA", 3) + mn(50, 106, 3.2, "#E2DACA", 3);
          s += `<rect x="${X(-38)}" y="${Y(34)}" width="${f1(76 * k)}" height="${f1(34 * k)}" fill="#DAD0BB"/><rect x="${X(-34)}" y="${Y(42)}" width="${f1(68 * k)}" height="${f1(8 * k)}" fill="#D0C5AE"/>`;
          s += dome(-31, 34, 7, 6, "#8696A3") + dome(31, 34, 7, 6, "#8696A3") + dome(-21, 42, 14, 11, "#7E8F9C") + dome(21, 42, 14, 11, "#7E8F9C");
          s += `<rect x="${X(-19)}" y="${Y(56)}" width="${f1(38 * k)}" height="${f1(14 * k)}" fill="#D6CBB5"/>`;
          for (let i = 0; i < 7; i++) s += `<rect x="${X(-16 + i * 5)}" y="${Y(53)}" width="${f1(1.8 * k)}" height="${f1(5 * k)}" fill="#6E6458"/>`;
          s += dome(0, 56, 23, 19, "#7A8B99") + `<path d="M${X(0)} ${Y(75)} V${Y(84)}" stroke="#B89A55" stroke-width="1.4"/>`;
          for (let i = 0; i < 6; i++) s += `<path d="M${X(-30 + i * 11)} ${Y(6)} v${f1(-12 * k)} a${f1(2.5 * k)} ${f1(2.5 * k)} 0 0 1 ${f1(5 * k)} 0 v${f1(12 * k)} Z" fill="#6E6458" opacity=".55"/>`;
          s += mn(-92, 86, 3.4, "#EFE9DD", 2) + mn(-50, 112, 3.6, "#EFE9DD", 3) + mn(44, 112, 3.6, "#EFE9DD", 3);
          for (let i = 0; i < 3; i++) s += tree(btw(r, 10, 290), btw(r, 178, 186), btw(r, .8, 1.1), sea, r);
          s += `<rect x="0" y="184" width="300" height="16" fill="#B9A78C"/>`;
          perch.push([cx, B - 85 * k], [cx + 44 * k, B - 126 * k], [cx - 21 * k, B - 53 * k]);
          return { s, l, perch };
        } },
      { id: "ayasofya", zh: "聖索菲亞大教堂",
        see: ["又寬又扁的大圓頂好像飄在半空中", "粉紅色的牆已經站了快一千五百年", "四根宣禮塔守在大教堂的四個角落"],
        spots: ["大圓頂的最高處", "扶壁的頂端", "宣禮塔的尖頂上"],
        draw(c) {
          const { r, sea } = c, cx = btw(r, 178, 192), k = btw(r, .95, 1.02), B = 168;
          let s = hills(156, "#A9B38C", r, 6), l = ""; const perch = [];
          const X = (d) => f1(cx + d * k), Y = (d) => f1(B - d * k);
          const dome = (dx, base, R, h, col) => `<path d="M${X(dx - R)} ${Y(base)} A${f1(R * k)} ${f1(h * k)} 0 0 1 ${X(dx + R)} ${Y(base)} Z" fill="${col}"/>`;
          const mn = (dx, ht, w, col) => `<rect x="${X(dx - w / 2)}" y="${Y(ht)}" width="${f1(w * k)}" height="${f1(ht * k)}" fill="${col}"/><path d="M${X(dx - w / 2 - .4)} ${Y(ht)} L${X(dx)} ${Y(ht + 13)} L${X(dx + w / 2 + .4)} ${Y(ht)} Z" fill="#6F7F8E"/><rect x="${X(dx - w / 2 - 1.3)}" y="${Y(ht - 8)}" width="${f1((w + 2.6) * k)}" height="${f1(2 * k)}" fill="#B5A994"/>`;
          s += mn(-74, 92, 3.6, "#E6DED0") + mn(-60, 84, 6, "#A65A44") + mn(60, 100, 4, "#E6DED0") + mn(76, 108, 3.6, "#E6DED0");
          s += `<rect x="${X(-56)}" y="${Y(36)}" width="${f1(112 * k)}" height="${f1(36 * k)}" fill="#C9876B"/>`;
          s += `<path d="M${X(-56)} ${Y(36)} L${X(-56)} ${Y(58)} L${X(-44)} ${Y(66)} L${X(-36)} ${Y(36)} Z M${X(56)} ${Y(36)} L${X(56)} ${Y(58)} L${X(44)} ${Y(66)} L${X(36)} ${Y(36)} Z" fill="#B57056"/>`;
          s += `<rect x="${X(-38)}" y="${Y(60)}" width="${f1(76 * k)}" height="${f1(24 * k)}" fill="#C68469"/>`;
          s += dome(-30, 60, 12, 8, "#8E999E") + dome(30, 60, 12, 8, "#8E999E");
          s += `<rect x="${X(-30)}" y="${Y(66)}" width="${f1(60 * k)}" height="${f1(6 * k)}" fill="#BD7C62"/>`;
          for (let i = 0; i < 13; i++) s += `<rect x="${X(-27 + i * 4.4)}" y="${Y(65)}" width="${f1(1.6 * k)}" height="${f1(3.6 * k)}" fill="#5E4A40"/>`;
          s += dome(0, 66, 32, 17, "#8E999E") + `<path d="M${X(-22)} ${Y(70)} Q${X(-14)} ${Y(80)} ${X(-2)} ${Y(82)}" stroke="#AEB8BC" stroke-width="1.6" fill="none"/><path d="M${X(0)} ${Y(83)} V${Y(90)}" stroke="#B89A55" stroke-width="1.4"/>`;
          for (let i = 0; i < 8; i++) s += `<path d="M${X(-46 + i * 12.5)} ${Y(8)} v${f1(-12 * k)} a${f1(2.5 * k)} ${f1(2.5 * k)} 0 0 1 ${f1(5 * k)} 0 v${f1(12 * k)} Z" fill="#5E4A40" opacity=".5"/>`;
          for (let i = 0; i < 3; i++) s += tree(btw(r, 10, 290), btw(r, 178, 186), btw(r, .8, 1.1), sea, r);
          s += `<rect x="0" y="184" width="300" height="16" fill="#B9A78C"/>`;
          perch.push([cx, B - 91 * k], [cx - 44 * k, B - 67 * k], [cx + 76 * k, B - 121 * k]);
          return { s, l, perch };
        } },
      { id: "galata", zh: "加拉達塔",
        see: ["圓圓的石塔戴著一頂尖尖的帽子", "塔頂那一圈走廊可以看到整座老城", "塔下的斜坡小路開滿了咖啡店"],
        spots: ["尖帽子的最頂端", "塔頂瞭望台的欄杆上"],
        draw(c) {
          const { r, sea } = c, tx = btw(r, 160, 200), k = btw(r, .95, 1.08), T = 176 - 92 * k;
          let s = hills(146, "#A3A786", r, 10), l = ""; const perch = [];
          s += houses(170, 11, r, ["#E6D6BE", "#D9B99A", "#E8C9A8", "#CDBBA6"], false).s;
          s += `<rect x="0" y="168" width="300" height="14" fill="#B4A68C"/>`;
          for (let i = 0; i < 2; i++) s += tree(i ? btw(r, 240, 290) : btw(r, 12, 110), 180, btw(r, .8, 1), sea, r);
          s += `<path d="M${f1(tx - 16 * k)} 176 L${f1(tx - 14 * k)} ${f1(T)} L${f1(tx + 14 * k)} ${f1(T)} L${f1(tx + 16 * k)} 176 Z" fill="#B9A88E"/><path d="M${f1(tx + 5 * k)} 176 L${f1(tx + 5 * k)} ${f1(T)} L${f1(tx + 14 * k)} ${f1(T)} L${f1(tx + 16 * k)} 176 Z" fill="#8E7E68" opacity=".35"/>`;
          for (let i = 1; i < 6; i++) s += `<path d="M${f1(tx - 15 * k)} ${f1(176 - i * 15 * k)} H${f1(tx + 15 * k)}" stroke="#9C8C74" stroke-width=".6"/>`;
          for (let i = 0; i < 4; i++) s += `<rect x="${f1(tx - 1.5 * k + (i % 2 ? 6 * k : 0))}" y="${f1(T + 10 * k + i * 18 * k)}" width="${f1(3 * k)}" height="${f1(7 * k)}" fill="#4A3F38"/>`;
          s += `<rect x="${f1(tx - 16 * k)}" y="${f1(T - 15 * k)}" width="${f1(32 * k)}" height="${f1(15 * k)}" fill="#C8B89E"/>`;
          for (let i = 0; i < 4; i++) s += `<path d="M${f1(tx - 12.5 * k + i * 7 * k)} ${f1(T - 3 * k)} v${f1(-7 * k)} a${f1(2 * k)} ${f1(2 * k)} 0 0 1 ${f1(4 * k)} 0 v${f1(7 * k)} Z" fill="#4A3F38"/>`;
          s += `<rect x="${f1(tx - 18 * k)}" y="${f1(T - 1.5)}" width="${f1(36 * k)}" height="2.5" fill="#5A4E40"/><path d="M${f1(tx - 18 * k)} ${f1(T - 15 * k)} L${f1(tx)} ${f1(T - 50 * k)} L${f1(tx + 18 * k)} ${f1(T - 15 * k)} Z" fill="#55606E"/><path d="M${f1(tx)} ${f1(T - 50 * k)} V${f1(T - 57 * k)}" stroke="#B89A55" stroke-width="1.3"/>`;
          s += water(182, "#9CB9C6", "#5F8197", r) + boat(btw(r, 20, 230), btw(r, 188, 193), 1, r() < .5);
          perch.push([tx, T - 57 * k], [tx - 12 * k, T - 2]);
          return { s, l, perch };
        } },
      { id: "bosphorus", zh: "博斯普魯斯海峽",
        see: ["海峽這邊是歐洲，對岸就是亞洲", "渡輪一整天在兩岸之間來來回回", "大橋從頭頂上把兩個大洲連在一起"],
        spots: ["大橋橋塔的頂上", "渡輪的煙囪上", "橋塔的橫樑上"],
        draw(c) {
          const { r } = c, tl = btw(r, 94, 112), tr = tl + btw(r, 135, 148), T = 72, D = 118, C = 2 * (D - 2) - T;
          let s = hills(124, "#93A587", r, 12), l = ""; const perch = [];
          for (let i = 0; i < 16; i++) s += `<rect x="${f1(btw(r, 0, 296))}" y="${f1(btw(r, 131, 136))}" width="3" height="2" fill="#EDE6D8"/>`;
          s += water(136, "#9CC0CF", "#4F7E98", r);
          const ox = tl - btw(r, 30, 40);
          s += `<rect x="${f1(ox - 16)}" y="135" width="32" height="3" fill="#C9BCA4"/><rect x="${f1(ox - 10)}" y="126" width="20" height="9" fill="#EDE6D8"/><path d="M${f1(ox - 7)} 126 A7 7 0 0 1 ${f1(ox + 7)} 126 Z" fill="#CFC8BA"/><path d="M${f1(ox - 13)} 135 V108 M${f1(ox + 12)} 135 V108" stroke="#EDE6D8" stroke-width="2"/><path d="M${f1(ox - 14)} 108 L${f1(ox - 13)} 103 L${f1(ox - 12)} 108 Z M${f1(ox + 11)} 108 L${f1(ox + 12)} 103 L${f1(ox + 13)} 108 Z" fill="#6F7F8E"/>`;
          const cy = (x) => { const t = (x - tl) / (tr - tl); return (1 - t) * (1 - t) * T + 2 * t * (1 - t) * C + t * t * T; };
          let h = "";
          for (let x = tl + 8; x < tr - 4; x += 8) h += `M${f1(x)} ${f1(cy(x))} V${D} `;
          s += `<path d="${h}" stroke="#7D868D" stroke-width=".5"/>`;
          for (const t of [tl, tr]) s += `<rect x="${f1(t - 4)}" y="${T}" width="2.6" height="66" fill="#8B949B"/><rect x="${f1(t + 1.4)}" y="${T}" width="2.6" height="66" fill="#8B949B"/><rect x="${f1(t - 4)}" y="${T}" width="8" height="3" fill="#7D868D"/><rect x="${f1(t - 4)}" y="${T + 26}" width="8" height="2.2" fill="#7D868D"/><rect x="${f1(t - 6)}" y="134" width="12" height="6" fill="#6E7780"/>`;
          s += `<rect x="0" y="${D}" width="300" height="4" fill="#7D868D"/><rect x="0" y="${D + 4}" width="300" height="1.4" fill="#5E666D"/>`;
          s += `<path d="M0 ${D - 4} Q${f1(tl * .55)} ${D - 14} ${f1(tl)} ${T} Q${f1((tl + tr) / 2)} ${f1(C)} ${f1(tr)} ${T} Q${f1(tr + (300 - tr) * .45)} ${D - 14} 300 ${D - 4}" stroke="#6D767D" stroke-width="1.6" fill="none"/>`;
          const fx = btw(r, 118, 196);
          s += `<path d="M${f1(fx - 4)} 168 q-12 2 -28 1" stroke="#fff" stroke-opacity=".6" stroke-width=".8" fill="none"/><path d="M${f1(fx)} 162 L${f1(fx + 46)} 162 L${f1(fx + 42)} 170 L${f1(fx + 4)} 170 Z" fill="#2E3B48"/><rect x="${f1(fx + 2)}" y="154" width="42" height="8" fill="#F2EEE6"/><rect x="${f1(fx + 8)}" y="148" width="30" height="6" fill="#F2EEE6"/>`;
          for (let i = 0; i < 7; i++) s += `<rect x="${f1(fx + 5 + i * 5.6)}" y="156.5" width="3" height="2.6" fill="#4A5868"/>`;
          s += `<rect x="${f1(fx + 20)}" y="140" width="5" height="8" fill="#E2C35E"/><rect x="${f1(fx + 20)}" y="140" width="5" height="2" fill="#2B2B2B"/>`;
          if (r() < .6) s += boat(btw(r, 10, 80), btw(r, 180, 190), .9, r() < .5);
          for (let i = 0; i < 3; i++) { const gx = btw(r, 140, 270), gy = btw(r, 80, 108); s += `<path d="M${f1(gx)} ${f1(gy)} q3 -3 6 0 q3 -3 6 0" stroke="#4A4A4A" stroke-width=".9" fill="none"/>`; }
          perch.push([tl, T - 1], [fx + 22.5, 139.5], [tr, T + 25.5]);
          return { s, l, perch };
        } },
      { id: "kapalicarsi", zh: "大市集",
        see: ["拱門底下有好多條走不完的小巷", "彩色玻璃吊燈一串一串掛在門口", "地毯和銅盤的攤子一家接著一家"],
        spots: ["屋頂的小圓頂上", "拱門上方的屋簷上"],
        draw(c) {
          const { r } = c, x0 = btw(r, 56, 76), n = 5, aw = 40, W = n * aw + 8;
          let s = `<rect x="0" y="172" width="300" height="28" fill="#BFAE92"/>`, l = ""; const perch = [];
          s += `<rect x="${f1(x0)}" y="100" width="${W}" height="72" fill="#D9C8A9"/>`;
          for (let i = 0; i < n; i++) { const dx = x0 + 4 + aw / 2 + i * aw; s += `<path d="M${f1(dx - 13)} 97 A13 10 0 0 1 ${f1(dx + 13)} 97 Z" fill="#8C979C"/><path d="M${f1(dx)} 87 V82" stroke="#B89A55" stroke-width="1.2"/>`; }
          s += `<rect x="${f1(x0 - 3)}" y="96" width="${W + 6}" height="5" fill="#BCA888"/>`;
          const LC = ["#C8453A", "#2F7FA8", "#E0B13A", "#3E8E5A", "#8E4FA0"];
          for (let i = 0; i < n; i++) {
            const ax = x0 + 8 + i * aw;
            s += `<path d="M${f1(ax)} 172 V132 A16 16 0 0 1 ${f1(ax + 32)} 132 V172 Z" fill="#5C4636"/>`;
            s += `<path d="M${f1(ax - 2.5)} 134 A18.5 18.5 0 0 1 ${f1(ax + 34.5)} 134" stroke="#EDE2CC" stroke-width="5" fill="none"/><path d="M${f1(ax - 2.5)} 134 A18.5 18.5 0 0 1 ${f1(ax + 34.5)} 134" stroke="#A4473A" stroke-width="5" stroke-dasharray="4 4" fill="none"/>`;
            for (let j = 0; j < 3; j++) { const lx = ax + 8 + j * 8, ly = btw(r, 130, 144); s += `<path d="M${f1(lx)} 118 V${f1(ly)}" stroke="#2E2420" stroke-width=".5"/><circle cx="${f1(lx)}" cy="${f1(ly + 3)}" r="3.3" fill="${pick(r, LC)}"/><rect x="${f1(lx - 1.4)}" y="${f1(ly - .6)}" width="2.8" height="1.4" fill="#B89A55"/>`; }
            s += `<rect x="${f1(ax + 2)}" y="160" width="28" height="12" fill="#8A6A4E"/>`;
            for (let j = 0; j < 3; j++) { const sx = ax + 8 + j * 8; s += r() < .5 ? `<circle cx="${f1(sx)}" cy="156.5" r="3.6" fill="#B9853E"/><circle cx="${f1(sx)}" cy="156.5" r="1.6" fill="#D9A95A"/>` : `<path d="M${f1(sx - 4)} 160 A4 5 0 0 1 ${f1(sx + 4)} 160 Z" fill="${pick(r, ["#D9822B", "#B5412E", "#D8B23A"])}"/>`; }
          }
          for (let i = 1; i < n; i++) if (r() < .55) { const px = x0 + 4 + i * aw, cc = pick(r, ["#9E3B30", "#7A2E3A", "#3E5A7A"]); s += `<rect x="${f1(px - 6)}" y="138" width="12" height="26" fill="${cc}" stroke="#D8B66A" stroke-width="1"/><path d="M${f1(px)} 144 L${f1(px + 4)} 151 L${f1(px)} 158 L${f1(px - 4)} 151 Z" fill="#E4C989"/>`; }
          for (let i = 0; i < 3; i++) { const px = btw(r, 20, 280); s += `<path d="M${f1(px)} 194 V184" stroke="${pick(r, ["#5A4E60", "#6E4A3A", "#3E5568"])}" stroke-width="4" stroke-linecap="round"/><circle cx="${f1(px)}" cy="180.5" r="2.4" fill="#D9B48F"/>`; }
          perch.push([x0 + 4 + aw / 2 + (r() < .5 ? aw : 3 * aw), 87], [x0 + 8 + 2 * aw + 16, 95.5]);
          return { s, l, perch };
        } },
      { id: "yenicami", zh: "新清真寺與加拉達橋",
        see: ["橋上一排釣客把長長的釣竿伸向海面", "海鷗跟著渡輪一圈一圈地飛", "清真寺的圓頂和宣禮塔就在水邊"],
        spots: ["橋上的路燈頂上", "加拉達橋的欄杆上", "宣禮塔的尖頂上"],
        draw(c) {
          const { r } = c, cx = btw(r, 168, 200), k = btw(r, .82, .92), B = 136;
          let s = hills(126, "#A8AE90", r, 10), l = ""; const perch = [];
          s += `<rect x="0" y="134" width="300" height="8" fill="#C9BCA4"/>` + water(142, "#9CB9C6", "#5F8197", r);
          const X = (d) => f1(cx + d * k), Y = (d) => f1(B - d * k);
          const dome = (dx, base, R, h, col) => `<path d="M${X(dx - R)} ${Y(base)} A${f1(R * k)} ${f1(h * k)} 0 0 1 ${X(dx + R)} ${Y(base)} Z" fill="${col}"/>`;
          const mn = (dx) => { let m = `<rect x="${X(dx - 1.7)}" y="${Y(104)}" width="${f1(3.4 * k)}" height="${f1(104 * k)}" fill="#E4DDCF"/><path d="M${X(dx - 2.1)} ${Y(104)} L${X(dx)} ${Y(118)} L${X(dx + 2.1)} ${Y(104)} Z" fill="#6F7F8E"/>`; for (let i = 0; i < 3; i++) m += `<rect x="${X(dx - 3)}" y="${Y(99 - i * 22)}" width="${f1(6 * k)}" height="${f1(2 * k)}" fill="#B5A994"/>`; return m; };
          s += `<rect x="${X(-40)}" y="${Y(30)}" width="${f1(80 * k)}" height="${f1(30 * k)}" fill="#D4CCBB"/><rect x="${X(-34)}" y="${Y(36)}" width="${f1(68 * k)}" height="${f1(6 * k)}" fill="#CBC2B0"/>`;
          s += dome(-34, 30, 7, 6, "#86959F") + dome(34, 30, 7, 6, "#86959F") + dome(-20, 36, 14, 10, "#7F8E98") + dome(20, 36, 14, 10, "#7F8E98");
          s += `<rect x="${X(-18)}" y="${Y(48)}" width="${f1(36 * k)}" height="${f1(12 * k)}" fill="#D0C8B6"/>` + dome(0, 48, 21, 18, "#7A8994") + `<path d="M${X(0)} ${Y(66)} V${Y(74)}" stroke="#B89A55" stroke-width="1.3"/>`;
          s += mn(-50) + mn(50);
          s += boat(btw(r, 10, 120), 152, .8, false);
          s += `<rect x="0" y="166" width="300" height="7" fill="#7C848B"/><rect x="0" y="173" width="300" height="8" fill="#A08A6E"/>`;
          for (let x = 18; x < 300; x += 56) s += `<rect x="${x - 5}" y="181" width="10" height="19" fill="#6E767D"/>`;
          let rail = "";
          for (let x = 2; x < 300; x += 8) rail += `M${x} 158 V166 `;
          s += `<path d="${rail}" stroke="#5B636A" stroke-width=".8"/><rect x="0" y="157.5" width="300" height="1.6" fill="#5B636A"/>`;
          const lp = btw(r, 20, 60);
          for (let x = lp; x < 296; x += 74) s += `<path d="M${f1(x)} 158 V138" stroke="#4A5058" stroke-width="1.4"/><circle cx="${f1(x)}" cy="136" r="2.4" fill="#E9E1C8"/>`;
          let fx = btw(r, 12, 30); const men = [];
          while (fx < 288) {
            men.push(fx);
            const tip = Math.min(294, Math.max(6, fx + 2 + (r() < .5 ? -1 : 1) * btw(r, 16, 28)));
            s += `<path d="M${f1(fx - 1.5)} 166 V159 M${f1(fx + 1.5)} 166 V159" stroke="#3A3A40" stroke-width="1.6"/><rect x="${f1(fx - 3)}" y="150" width="6" height="10" rx="1.5" fill="${pick(r, ["#5A6B7E", "#7A5A48", "#4E5B4A", "#8A7E6E"])}"/><circle cx="${f1(fx)}" cy="147.5" r="2.6" fill="#D9B48F"/>`;
            s += `<path d="M${f1(fx + 2)} 154 L${f1(tip)} 112" stroke="#3A2E26" stroke-width=".8"/><path d="M${f1(tip)} 112 V196" stroke="#555" stroke-width=".35" opacity=".7"/>`;
            fx += btw(r, 38, 56);
          }
          for (let i = 0; i < 4; i++) { const gx = btw(r, 130, 280), gy = btw(r, 62, 100); s += `<path d="M${f1(gx)} ${f1(gy)} q3 -3 6 0 q3 -3 6 0" stroke="#4A4A4A" stroke-width=".9" fill="none"/>`; }
          let rx = 150, best = -1;
          for (let x = 10; x <= 290; x += 10) { const dmin = Math.min(...men.map((m) => Math.abs(m - x))); if (dmin > best) { best = dmin; rx = x; } }
          perch.push([lp + 74, 133.5], [rx, 157], [cx + 50 * k, B - 118 * k]);
          return { s, l, perch };
        } },
    ],
  },
  athens: {
    zh: "雅典", de: "Athína", gift: "一小瓶橄欖油",
    sights: [
      { id: "parthenon", zh: "帕德嫩神廟",
        see: ["一整排大理石柱子站在山頂上", "每根柱子的中段都微微鼓起來", "從這裡可以一直望到遠方的海"],
        spots: ["三角形山牆的頂端", "屋簷的轉角上", "國旗的旗桿頂上"],
        draw(c) {
          const { r, sea } = c, px = btw(r, 148, 170), k = btw(r, .95, 1.05), Ct = 154 - 56 * k;
          let s = `<path d="M0 200 L0 180 Q20 172 ${f1(px - 92 * k)} 163 L${f1(px + 96 * k)} 163 Q290 168 300 176 L300 200 Z" fill="#B49B7B"/><path d="M40 192 l14 -12 M92 198 l10 -18 M252 196 l-8 -16" stroke="#9A8366" stroke-width="1.2"/>`, l = ""; const perch = [];
          for (let i = 0; i < 3; i++) s += `<rect x="${f1(px - (72 + i * 3) * k)}" y="${154 + i * 3}" width="${f1((144 + i * 6) * k)}" height="3" fill="${i % 2 ? "#D7C8AA" : "#E2D5BA"}"/>`;
          s += `<rect x="${f1(px - 60 * k)}" y="${f1(Ct)}" width="${f1(120 * k)}" height="${f1(56 * k)}" fill="#A2927A"/>`;
          for (let i = 0; i < 8; i++) { const x = px - 64 * k + i * 128 * k / 7; s += `<rect x="${f1(x - 4 * k)}" y="${f1(Ct)}" width="${f1(8 * k)}" height="${f1(56 * k)}" fill="#E6D9BF"/><rect x="${f1(x + 1.5 * k)}" y="${f1(Ct)}" width="${f1(2.5 * k)}" height="${f1(56 * k)}" fill="#CDBD9F"/><rect x="${f1(x - 5.5 * k)}" y="${f1(Ct - 2.5 * k)}" width="${f1(11 * k)}" height="${f1(2.5 * k)}" fill="#DCCDB0"/>`; }
          s += `<rect x="${f1(px - 70 * k)}" y="${f1(Ct - 14 * k)}" width="${f1(140 * k)}" height="${f1(11.5 * k)}" fill="#DDD0B4"/><rect x="${f1(px - 70 * k)}" y="${f1(Ct - 7 * k)}" width="${f1(140 * k)}" height="1" fill="#C2B293"/>`;
          for (let j = 0; j < 14; j++) s += `<rect x="${f1(px - 67 * k + j * 10.2 * k)}" y="${f1(Ct - 13 * k)}" width="${f1(2 * k)}" height="${f1(5 * k)}" fill="#B9A886"/>`;
          s += `<path d="M${f1(px - 73 * k)} ${f1(Ct - 14 * k)} L${f1(px)} ${f1(Ct - 32 * k)} L${f1(px + 73 * k)} ${f1(Ct - 14 * k)} Z" fill="#E2D5BA"/><path d="M${f1(px - 60 * k)} ${f1(Ct - 16 * k)} L${f1(px)} ${f1(Ct - 29 * k)} L${f1(px + 60 * k)} ${f1(Ct - 16 * k)} Z" fill="#CDBE9F"/>`;
          const fx = Math.min(278, px + 104 * k);
          s += `<path d="M${f1(fx)} 163 V116" stroke="#6B6B6B" stroke-width="1.2"/><rect x="${f1(fx + .6)}" y="116" width="18" height="12" fill="#2D5DA8"/>`;
          for (const j of [1, 3, 5, 7]) s += `<rect x="${f1(fx + .6)}" y="${f1(116 + j * 12 / 9)}" width="18" height="1.33" fill="#F4F1EA"/>`;
          s += `<rect x="${f1(fx + .6)}" y="116" width="6.7" height="6.7" fill="#2D5DA8"/><rect x="${f1(fx + 3.35)}" y="116" width="1.2" height="6.7" fill="#F4F1EA"/><rect x="${f1(fx + .6)}" y="118.75" width="6.7" height="1.2" fill="#F4F1EA"/>`;
          s += tree(btw(r, 14, 56), btw(r, 188, 194), btw(r, .9, 1.2), sea, r) + tree(btw(r, 252, 290), btw(r, 188, 194), btw(r, .9, 1.1), sea, r);
          perch.push([px, Ct - 33 * k], [px - 71 * k, Ct - 15 * k], [fx, 115]);
          return { s, l, perch };
        } },
      { id: "acropolis", zh: "衛城與城市",
        see: ["衛城的大石山高高立在白色屋頂上", "遠處的利卡維多斯山頂有一座小白教堂", "白色的公寓一路蓋到看不見的海邊"],
        spots: ["山頂神廟的屋頂上", "衛城的石牆上", "公寓的屋頂上"],
        draw(c) {
          const { r, sea } = c, lx = btw(r, 58, 84), ax = btw(r, 172, 196), tx = ax + 5;
          let s = "", l = ""; const perch = [];
          s += `<path d="M0 160 Q${f1(lx - 30)} 122 ${f1(lx - 4)} 100 L${f1(lx + 4)} 98 Q${f1(lx + 30)} 122 150 160 Z" fill="#8F9A7E"/><rect x="${f1(lx - 3)}" y="94" width="6" height="4" fill="#F4F1EA"/><rect x="${f1(lx - 1)}" y="90" width="2" height="4" fill="#F4F1EA"/>`;
          s += `<path d="M${f1(ax - 86)} 168 L${f1(ax - 70)} 128 Q${f1(ax - 62)} 121 ${f1(ax - 50)} 121 L${f1(ax + 55)} 119 Q${f1(ax + 66)} 121 ${f1(ax + 72)} 130 L${f1(ax + 90)} 168 Z" fill="#B59C7A"/><path d="M${f1(ax - 64)} 136 l-6 22 M${f1(ax - 20)} 128 l-3 30 M${f1(ax + 40)} 126 l4 28 M${f1(ax + 66)} 136 l8 22" stroke="#9A8263" stroke-width="1.4"/>`;
          s += `<rect x="${f1(ax - 60)}" y="115" width="118" height="6" fill="#C9B596"/><rect x="${f1(ax - 54)}" y="107" width="22" height="8" fill="#D6C8AC"/>`;
          s += `<rect x="${f1(tx - 24)}" y="112" width="48" height="3" fill="#E3D7BE"/>`;
          for (let i = 0; i < 8; i++) s += `<rect x="${f1(tx - 22 + i * 6.1)}" y="98" width="2.4" height="14" fill="#E3D7BE"/>`;
          s += `<rect x="${f1(tx - 25)}" y="94" width="50" height="4" fill="#DCCFB4"/><path d="M${f1(tx - 26)} 94 L${f1(tx)} 88 L${f1(tx + 26)} 94 Z" fill="#E3D7BE"/>`;
          s += tree(btw(r, 20, 120), 160, .8, sea, r) + tree(btw(r, 260, 292), 160, .8, sea, r);
          const CO = ["#F1ECE2", "#E8E0D0", "#EDE5D6", "#E3D9C6"];
          let roof = null;
          s += `<rect x="0" y="160" width="300" height="40" fill="#CFC6B4"/>`;
          for (const [base, h0, h1] of [[174, 16, 28], [200, 20, 32]]) {
            let x = btw(r, -10, 0);
            while (x < 296) {
              const w = Math.min(btw(r, 20, 32), 300 - x), h = btw(r, h0, h1);
              s += `<rect x="${f1(Math.max(0, x))}" y="${f1(base - h)}" width="${f1(w + Math.min(0, x))}" height="${f1(h)}" fill="${pick(r, CO)}"/><path d="M${f1(Math.max(0, x))} ${f1(base - h + 1)} H${f1(x + w)}" stroke="#B9AE9C" stroke-width="1"/>`;
              for (let y = base - h + 7; y < base - 5; y += 9) s += `<path d="M${f1(Math.max(1, x + 2))} ${f1(y)} H${f1(x + w - 2)}" stroke="#B9AE9C" stroke-width=".8"/>`;
              if (!roof && base === 200 && x > 40 && x + w < 260) roof = [x + w / 2, base - h - .5];
              x += w + btw(r, 0, 3);
            }
          }
          perch.push([tx, 87], [ax - 30, 114], roof || [150, 168]);
          return { s, l, perch };
        } },
      { id: "olympieion", zh: "宙斯神殿",
        see: ["剩下的十幾根石柱高得要仰著頭看", "一根倒下的柱子一節一節躺在草地上", "每根柱子的柱頭都雕著捲捲的葉子"],
        spots: ["石柱頂上的橫樑上", "單獨一根石柱的柱頭上"],
        draw(c) {
          const { r, sea } = c, x0 = btw(r, 128, 144), top = btw(r, 80, 86), G = 170;
          const gr = { spring: "#9DB07E", summer: "#B5AE82", autumn: "#ABA67F", winter: "#A2A585" }[sea];
          let s = `<path d="M8 150 L22 128 L96 124 L110 150 Z" fill="#C6B597"/><rect x="46" y="118" width="30" height="6" fill="#D9CDB4"/><path d="M44 118 L61 113 L78 118 Z" fill="#D9CDB4"/>`, l = ""; const perch = [];
          s += hills(148, "#94A07C", r, 6) + `<rect x="0" y="160" width="300" height="40" fill="${gr}"/>`;
          s += tree(btw(r, 270, 290), 166, 1.2, sea, r) + tree(btw(r, 14, 30), 162, .9, sea, r);
          const col = (x, t, w, cl, sh) => `<rect x="${f1(x - w / 2)}" y="${f1(t)}" width="${w}" height="${f1(G - t)}" fill="${cl}"/><rect x="${f1(x + w / 2 - 2.4)}" y="${f1(t)}" width="2.4" height="${f1(G - t)}" fill="${sh}"/><rect x="${f1(x - w / 2 - 1.5)}" y="${G - 3}" width="${w + 3}" height="3" fill="${sh}"/><path d="M${f1(x - w / 2)} ${f1(t)} L${f1(x - w / 2 - 3)} ${f1(t - 8)} L${f1(x + w / 2 + 3)} ${f1(t - 8)} L${f1(x + w / 2)} ${f1(t)} Z" fill="${cl}"/><path d="M${f1(x - w / 2 + 1)} ${f1(t - 1)} q2 -4 0 -6 M${f1(x)} ${f1(t - 1)} v-5 M${f1(x + w / 2 - 1)} ${f1(t - 1)} q-2 -4 0 -6" stroke="${sh}" stroke-width=".7" fill="none"/><circle cx="${f1(x - w / 2 - 2.4)}" cy="${f1(t - 7)}" r="1.5" fill="none" stroke="${sh}" stroke-width=".7"/><circle cx="${f1(x + w / 2 + 2.4)}" cy="${f1(t - 7)}" r="1.5" fill="none" stroke="${sh}" stroke-width=".7"/><rect x="${f1(x - w / 2 - 4)}" y="${f1(t - 10.5)}" width="${w + 8}" height="2.5" fill="${sh}"/>`;
          for (let i = 0; i < 6; i++) { const x = x0 + 7 + i * 15; s += `<rect x="${f1(x - 4)}" y="${f1(top - 4)}" width="8" height="${f1(G - top + 4)}" fill="#C4B290"/><rect x="${f1(x - 7)}" y="${f1(top - 6)}" width="14" height="3" fill="#B4A281"/>`; }
          for (let i = 0; i < 7; i++) s += col(x0 + i * 15, top, 9, "#DECDAB", "#C2AF8C");
          s += `<rect x="${f1(x0 - 8.5)}" y="${f1(top - 17)}" width="62" height="6.5" fill="#D2C09E"/><rect x="${f1(x0 + 51.5)}" y="${f1(top - 17)}" width="47" height="6.5" fill="#CDBB98"/>`;
          s += col(x0 + 118, top + 2, 9, "#DECDAB", "#C2AF8C");
          const fx = btw(r, 26, 46);
          for (let i = 0; i < 8; i++) s += `<rect x="${f1(fx + i * 10.5)}" y="${f1(176 + i * .6)}" width="10" height="13" rx="2.5" fill="#D8C7A5" stroke="#B5A382" stroke-width=".8"/>`;
          perch.push([x0 + (r() < .5 ? 22 : 75), top - 17.5], [x0 + 118, top - 9]);
          return { s, l, perch };
        } },
      { id: "plaka", zh: "普拉卡老街",
        see: ["窄窄的石板路兩旁垂著九重葛", "小酒館的桌子就擺在台階上", "從巷子抬頭就能看見山上的衛城"],
        spots: ["酒館椅子的椅背上", "陽台的欄杆上", "屋頂的矮牆上"],
        draw(c) {
          const { r, sea } = c, w0 = btw(r, 106, 116), w1 = btw(r, 198, 208);
          let s = "", l = ""; const perch = [];
          s += `<path d="M100 150 L114 116 Q118 110 128 110 L206 106 Q214 108 220 118 L232 150 Z" fill="#BCA483"/><rect x="146" y="103" width="40" height="3" fill="#E3D7BE"/>`;
          for (let i = 0; i < 8; i++) s += `<rect x="${148 + i * 5}" y="92" width="2.2" height="11" fill="#E3D7BE"/>`;
          s += `<rect x="145" y="89" width="42" height="3.5" fill="#DCCFB4"/><path d="M144 89 L166 83 L188 89 Z" fill="#E3D7BE"/>`;
          s += `<rect x="0" y="140" width="300" height="60" fill="#CDBEA0"/>` + tree(btw(r, 150, 176), 146, .7, sea, r);
          s += `<path d="M${f1(w0)} 200 L146 146 L180 146 L${f1(w1)} 200 Z" fill="#D9CBB0"/>`;
          for (const y of [152, 158, 165, 173, 182, 192]) { const t = (y - 146) / 54; s += `<path d="M${f1(146 + (w0 - 146) * t)} ${y} H${f1(180 + (w1 - 180) * t)}" stroke="#B9AA8C" stroke-width="1"/>`; }
          s += `<rect x="14" y="96" width="${f1(w0 - 14)}" height="104" fill="#E7C79A"/><rect x="10" y="90" width="${f1(w0 - 6)}" height="7" fill="#A9553F"/>`;
          for (const [wx, wy] of [[34, 104], [72, 104], [34, 140], [72, 140]]) s += `<rect x="${wx}" y="${wy}" width="12" height="18" fill="#4A3F38"/><rect x="${wx - 5}" y="${wy}" width="5" height="18" fill="#4E7A6A"/><rect x="${wx + 12}" y="${wy}" width="5" height="18" fill="#4E7A6A"/>`;
          let rail = ""; for (let x = 28; x <= 80; x += 4) rail += `M${x} 122 V130 `;
          s += `<rect x="26" y="130" width="56" height="2.5" fill="#3E3A36"/><rect x="26" y="121.5" width="56" height="1.4" fill="#3E3A36"/><path d="${rail}" stroke="#3E3A36" stroke-width=".7"/>`;
          s += `<rect x="${f1(w1)}" y="84" width="${f1(300 - w1)}" height="116" fill="#F0E8DA"/><rect x="${f1(w1 - 4)}" y="80" width="${f1(304 - w1)}" height="5" fill="#E2D8C6"/>`;
          s += `<path d="M${f1(w1 + 30)} 196 V160 a11 11 0 0 1 22 0 V196 Z" fill="#3C6E9E"/><rect x="${f1(w1 + 26)}" y="100" width="12" height="18" fill="#3C6E9E"/><rect x="${f1(w1 + 58)}" y="100" width="12" height="18" fill="#3C6E9E"/>`;
          const n = sea === "winter" ? 14 : 28;
          for (let i = 0; i < 8; i++) s += `<ellipse cx="${f1(w1 + btw(r, -4, 16))}" cy="${f1(btw(r, 86, 136))}" rx="5" ry="3.5" fill="#5F8E4C"/>`;
          for (let i = 0; i < n; i++) { const t = r(); s += `<circle cx="${f1(w1 - 6 + btw(r, 0, 24) * (1 - t * .5))}" cy="${f1(84 + t * 56)}" r="${f1(btw(r, 2.2, 3.6))}" fill="${pick(r, ["#C7357E", "#D9559A", "#B8296E", "#5F8E4C"])}"/>`; }
          const tables = [btw(r, 128, 140), btw(r, 172, 184)];
          for (const tx of tables) s += `<path d="M${f1(tx)} 182 V192 M${f1(tx - 17)} 184 V192 M${f1(tx - 12)} 184 V192 M${f1(tx + 12)} 184 V192 M${f1(tx + 17)} 184 V192" stroke="#6B5444" stroke-width="1"/><rect x="${f1(tx - 9)}" y="176" width="18" height="6" fill="#F4EFE6"/><path d="M${f1(tx - 9)} 178.5 H${f1(tx + 9)}" stroke="#3C6E9E" stroke-width=".8" stroke-dasharray="2 2"/><rect x="${f1(tx - 18)}" y="183" width="7" height="1.8" fill="#3C6E9E"/><rect x="${f1(tx - 18)}" y="174" width="1.8" height="10" fill="#3C6E9E"/><rect x="${f1(tx + 11)}" y="183" width="7" height="1.8" fill="#3C6E9E"/><rect x="${f1(tx + 16.2)}" y="174" width="1.8" height="10" fill="#3C6E9E"/>`;
          perch.push([tables[0] - 17, 173.5], [54, 121], [w1 + 50, 79.5]);
          return { s, l, perch };
        } },
      { id: "evzones", zh: "憲兵交接",
        see: ["衛兵穿著白色的百褶短裙站得筆直", "紅鞋子前面有一顆黑色的大毛球", "換班的時候腿抬得好高又放得好慢"],
        spots: ["國旗的旗桿頂上", "國會大廈的屋簷上", "無名戰士紀念碑的石牆上"],
        draw(c) {
          const { r, sea } = c, pc = btw(r, 160, 180), g1 = btw(r, 116, 132), g2 = g1 + btw(r, 76, 88), coat = sea === "winter" ? "#2E3A5A" : "#B8A67A";
          let s = `<rect x="20" y="92" width="280" height="74" fill="#EAD9AF"/><rect x="16" y="88" width="284" height="5" fill="#D9C79C"/>`, l = ""; const perch = [];
          for (let x = 30; x < 294; x += 20) if (Math.abs(x + 3.5 - pc) > 36) s += `<rect x="${x}" y="100" width="7" height="12" fill="#8A7A5E"/><rect x="${x}" y="118" width="7" height="12" fill="#8A7A5E"/>`;
          s += `<rect x="${f1(pc - 30)}" y="100" width="60" height="36" fill="#9C8A68" opacity=".55"/><rect x="${f1(pc - 33)}" y="95" width="66" height="5" fill="#DCC99E"/>`;
          for (let i = 0; i < 4; i++) s += `<rect x="${f1(pc - 28 + i * 18)}" y="100" width="6" height="36" fill="#F1E4C2"/>`;
          s += `<path d="M${f1(pc)} 88 V62" stroke="#6B6B6B" stroke-width="1.2"/><rect x="${f1(pc + .6)}" y="62" width="20" height="13" fill="#2D5DA8"/>`;
          for (const j of [1, 3, 5, 7]) s += `<rect x="${f1(pc + .6)}" y="${f1(62 + j * 13 / 9)}" width="20" height="1.44" fill="#F4F1EA"/>`;
          s += `<rect x="${f1(pc + .6)}" y="62" width="7.2" height="7.2" fill="#2D5DA8"/><rect x="${f1(pc + 3.6)}" y="62" width="1.3" height="7.2" fill="#F4F1EA"/><rect x="${f1(pc + .6)}" y="65" width="7.2" height="1.3" fill="#F4F1EA"/>`;
          const rx = (g1 + g2) / 2;
          s += `<rect x="52" y="136" width="236" height="30" fill="#D7C7A2"/><rect x="50" y="133" width="240" height="4" fill="#C6B48E"/><path d="M${f1(rx - 26)} 157 Q${f1(rx)} 150 ${f1(rx + 24)} 154" stroke="#A8946E" stroke-width="3.2" fill="none" stroke-linecap="round"/><circle cx="${f1(rx - 29)}" cy="155" r="3" fill="#A8946E"/><circle cx="${f1(rx + 2)}" cy="146" r="5" fill="none" stroke="#A8946E" stroke-width="1.2"/>`;
          s += `<rect x="0" y="166" width="300" height="34" fill="#CFC3AA"/><path d="M0 178 H300 M0 191 H300" stroke="#BCAF95" stroke-width=".6"/>`;
          const guard = (x, kick) => {
            let g = `<rect x="${f1(x - 3.8)}" y="164" width="3" height="22" fill="#F4F1EA"/><rect x="${f1(x - 3.8)}" y="170" width="3" height="1.4" fill="#2A2A2A"/><path d="M${f1(x - 4.4)} 186 h5 q3 0 3.5 1.8 h-8.5 Z" fill="#A8322C"/><circle cx="${f1(x + 4.6)}" cy="186.8" r="2" fill="#1E1E1E"/>`;
            g += kick ? `<path d="M${f1(x + 2)} 165 L${f1(x + 17)} 159" stroke="#F4F1EA" stroke-width="3.2" stroke-linecap="round"/><ellipse cx="${f1(x + 19)}" cy="158.4" rx="3" ry="1.8" fill="#A8322C"/><circle cx="${f1(x + 22.4)}" cy="157.6" r="2" fill="#1E1E1E"/>`
              : `<rect x="${f1(x + .8)}" y="164" width="3" height="22" fill="#F4F1EA"/><rect x="${f1(x + .8)}" y="170" width="3" height="1.4" fill="#2A2A2A"/><path d="M${f1(x + .2)} 186 h5 q3 0 3.5 1.8 h-8.5 Z" fill="#A8322C"/><circle cx="${f1(x + 9.2)}" cy="186.8" r="2" fill="#1E1E1E"/>`;
            g += `<path d="M${f1(x - 6)} 146 L${f1(x + 6)} 146 L${f1(x + 12)} 167 L${f1(x - 12)} 167 Z" fill="#F7F4EE"/><path d="M${f1(x - 4)} 147 L${f1(x - 8)} 167 M${f1(x - 1.5)} 147 L${f1(x - 3)} 167 M${f1(x + 1.5)} 147 L${f1(x + 3)} 167 M${f1(x + 4)} 147 L${f1(x + 8)} 167" stroke="#D2CBBE" stroke-width=".6"/>`;
            g += `<rect x="${f1(x - 6)}" y="128" width="12" height="19" rx="2" fill="${coat}"/><rect x="${f1(x - 6)}" y="144" width="12" height="2" fill="#3A2E26"/><rect x="${f1(x - 8.6)}" y="129" width="3" height="16" rx="1.5" fill="${coat}"/><circle cx="${f1(x - 7.1)}" cy="146" r="1.8" fill="#E3BE98"/>`;
            g += `<path d="M${f1(x + 7)} 120 L${f1(x + 8)} 158" stroke="#3A2E26" stroke-width="1.8"/><rect x="${f1(x + 5)}" y="129" width="3" height="12" rx="1.5" fill="${coat}"/><circle cx="${f1(x)}" cy="123" r="4.4" fill="#E3BE98"/><path d="M${f1(x - 4.6)} 121 Q${f1(x - 4)} 115.5 ${f1(x + .5)} 115.5 Q${f1(x + 5)} 116 ${f1(x + 4.6)} 121 Z" fill="#B8322E"/><path d="M${f1(x + 1)} 116 Q${f1(x + 7)} 118 ${f1(x + 5.5)} 134" stroke="#1E1E1E" stroke-width="1.5" fill="none"/>`;
            return g;
          };
          const kickFirst = r() < .5;
          s += guard(g1, kickFirst) + guard(g2, !kickFirst);
          perch.push([pc, 61.5], [btw(r, 30, 120), 87.5], [rx, 132.5]);
          return { s, l, perch };
        } },
      { id: "herodeion", zh: "阿迪庫斯音樂廳",
        see: ["高高的石牆上一層一層都是拱形的窗", "白色的大理石座位圍成半圓形", "夏天晚上這裡還會有音樂會"],
        spots: ["石牆最上面的缺口上", "最上排座位的石階上"],
        draw(c) {
          const { r, sea } = c, wx = btw(r, 100, 112), W = btw(r, 150, 160), cx = wx + W / 2;
          let s = hills(138, "#A99E80", r, 10), l = ""; const perch = [];
          s += tree(btw(r, 24, 70), 150, 1.3, sea, r) + tree(btw(r, 274, 292), 148, 1.1, sea, r);
          let d = `M${f1(wx)} 156`, x = wx; const tops = [];
          while (x < wx + W - 1) { const w = Math.min(btw(r, 12, 26), wx + W - x), y = btw(r, 76, 90); d += ` V${f1(y)} H${f1(x + w)}`; tops.push([x + w / 2, y]); x += w; }
          s += `<path d="${d} V156 Z" fill="#C6A47A"/><path d="M${f1(wx)} 96 H${f1(wx + W)} M${f1(wx)} 118 H${f1(wx + W)}" stroke="#AE8D66" stroke-width=".7"/>`;
          const arch = (ax, yb, w, h) => `<path d="M${f1(ax)} ${f1(yb)} v${f1(-(h - w / 2))} a${f1(w / 2)} ${f1(w / 2)} 0 0 1 ${f1(w)} 0 v${f1(h - w / 2)} Z" fill="#6E5A48"/>`;
          for (let i = 0; i < 5; i++) s += arch(wx + (i + .5) * W / 5 - 8.5, 154, 17, 30);
          for (let i = 0; i < 7; i++) s += arch(wx + (i + .5) * W / 7 - 4.5, 114, 9, 14);
          s += `<rect x="${f1(wx - 6)}" y="150" width="${f1(W + 12)}" height="6" fill="#CDBFA3"/>`;
          for (let i = 6; i >= 0; i--) { const rx = 24 + i * 14, ry = 7 + i * 5.6; s += `<path d="M${f1(cx - rx)} 156 A${f1(rx)} ${f1(ry)} 0 0 0 ${f1(cx + rx)} 156 Z" fill="${i === 0 ? "#BFB6A6" : i % 2 ? "#E9E2D3" : "#D6CCBA"}"/>`; }
          for (const a of [.25, .5, .75]) { const ca = Math.cos(a * Math.PI), sa = Math.sin(a * Math.PI); s += `<path d="M${f1(cx + ca * 24)} ${f1(156 + sa * 7)} L${f1(cx + ca * 108)} ${f1(156 + sa * 40.6)}" stroke="#BDB2A0" stroke-width="1.4"/>`; }
          const a = tops[1] || tops[0], b = tops[tops.length - 2] || tops[0];
          perch.push(r() < .5 ? [a[0], a[1]] : [b[0], b[1]], [cx - 60, 189]);
          return { s, l, perch };
        } },
    ],
  },
  santorini: {
    zh: "聖托里尼", de: "Santorini", gift: "一塊黑色的火山石",
    sights: [
      { id: "bluedomes", zh: "藍頂教堂",
        see: ["白色的教堂戴著一頂藍色的圓帽子", "藍色屋頂後面就是一樣藍的海", "旁邊的白色鐘樓掛著幾個小銅鐘"],
        spots: ["藍色圓頂上的十字架旁", "鐘樓的頂上", "小教堂的十字架上"],
        draw(c) {
          const { r, sea } = c, cx = btw(r, 160, 186), bx = cx + 44, dx = cx - btw(r, 58, 70);
          let s = water(122, "#A6D0E2", "#3F78A8", r) + `<path d="M0 123 Q30 110 70 113 Q100 112 128 123 Z" fill="#8C7A6E"/>`, l = ""; const perch = [];
          s += `<rect x="0" y="162" width="300" height="38" fill="#F2EFE8"/><rect x="0" y="178" width="140" height="22" fill="#E6E2D9"/><rect x="0" y="161" width="300" height="2" fill="#DAD6CD"/>`;
          s += `<rect x="${f1(dx - 14)}" y="146" width="28" height="16" fill="#F7F5F0"/><path d="M${f1(dx - 10)} 146 A10 10 0 0 1 ${f1(dx + 10)} 146 Z" fill="#2F6DB5"/><path d="M${f1(dx)} 136 V129 M${f1(dx - 2.5)} 131.5 H${f1(dx + 2.5)}" stroke="#8A7A5A" stroke-width="1.2"/>`;
          s += `<rect x="${f1(cx - 30)}" y="126" width="60" height="36" fill="#F7F5F0"/><rect x="${f1(cx + 22)}" y="126" width="8" height="36" fill="#E3E0D8"/><path d="M${f1(cx - 5)} 162 v-11 a5 5 0 0 1 10 0 v11 Z" fill="#2F6DB5"/><path d="M${f1(cx - 20)} 146 v-6 a2.5 2.5 0 0 1 5 0 v6 Z M${f1(cx + 13)} 146 v-6 a2.5 2.5 0 0 1 5 0 v6 Z" fill="#6C8FB0"/>`;
          s += `<rect x="${f1(cx - 17)}" y="114" width="34" height="12" fill="#F7F5F0"/><path d="M${f1(cx - 9)} 124 v-6 M${f1(cx)} 124 v-6 M${f1(cx + 9)} 124 v-6" stroke="#2F6DB5" stroke-width="1.6"/><path d="M${f1(cx - 19)} 114 A19 19 0 0 1 ${f1(cx + 19)} 114 Z" fill="#2F6DB5"/><path d="M${f1(cx - 12)} 109 A14 14 0 0 1 ${f1(cx - 3)} 99" stroke="#5C8ED0" stroke-width="1.6" fill="none"/><path d="M${f1(cx)} 95 V84 M${f1(cx - 4)} 88 H${f1(cx + 4)}" stroke="#8A7A5A" stroke-width="1.6"/>`;
          s += `<rect x="${f1(bx - 10)}" y="100" width="20" height="62" fill="#F7F5F0"/><rect x="${f1(bx + 5)}" y="100" width="5" height="62" fill="#E3E0D8"/><path d="M${f1(bx - 6)} 124 v-10 a6 6 0 0 1 12 0 v10 Z M${f1(bx - 6)} 146 v-10 a6 6 0 0 1 12 0 v10 Z" fill="#8DB3CF"/><path d="M${f1(bx - 3)} 122 Q${f1(bx - 3)} 115 ${f1(bx)} 115 Q${f1(bx + 3)} 115 ${f1(bx + 3)} 122 Z M${f1(bx - 3)} 144 Q${f1(bx - 3)} 137 ${f1(bx)} 137 Q${f1(bx + 3)} 137 ${f1(bx + 3)} 144 Z" fill="#9A7A3A"/>`;
          s += `<rect x="${f1(bx - 12)}" y="98" width="24" height="3" fill="#E7E3DA"/><path d="M${f1(bx - 8)} 98 Q${f1(bx)} 87 ${f1(bx + 8)} 98 Z" fill="#F7F5F0"/><path d="M${f1(bx)} 91 V82 M${f1(bx - 3)} 85 H${f1(bx + 3)}" stroke="#8A7A5A" stroke-width="1.4"/>`;
          const n = sea === "winter" ? 3 : 9, fx = btw(r, 20, 60);
          s += `<rect x="${f1(fx - 6)}" y="154" width="12" height="8" fill="#B9764E"/>`;
          for (let i = 0; i < n; i++) s += `<circle cx="${f1(fx + btw(r, -8, 8))}" cy="${f1(btw(r, 144, 153))}" r="2.4" fill="${pick(r, ["#C7357E", "#D9559A", "#5F8E4C"])}"/>`;
          perch.push([cx, 83.5], [bx, 81.5], [dx, 128.5]);
          return { s, l, perch };
        } },
      { id: "oia", zh: "伊亞白屋",
        see: ["白色的小房子一層一層疊在懸崖上", "有些屋頂是圓拱形的，像一條麵包", "窄巷裡好多門窗都漆成了藍色"],
        spots: ["拱形屋頂上", "藍頂小教堂的十字架上"],
        draw(c) {
          const { r } = c;
          let s = water(146, "#A6D0E2", "#3F78A8", r), l = ""; const perch = [];
          s += `<path d="M24 200 L64 172 L112 140 L158 116 L210 108 L300 104 L300 200 Z" fill="#9A6A4F"/><path d="M70 196 L120 162 L170 138 L300 126 M50 200 L104 174 L160 150 L300 140" stroke="#7E543E" stroke-width="2.5" fill="none"/>`;
          const xsAt = (y) => (y < 108 ? 210 + (108 - y) * 20 : y < 116 ? 210 - (y - 108) * 6.5 : y < 140 ? 158 - (y - 116) * 1.92 : y < 172 ? 112 - (y - 140) * 1.5 : 64 - (y - 172) * 1.43);
          const CO = ["#F7F4EE", "#F7F4EE", "#F2EEE6", "#F7F4EE", "#F7F4EE", "#F2EEE6", "#E9C68E", "#E8B3A4"];
          let roof = null;
          for (let j = 0; j < 6; j++) {
            const yb = 110 + j * 16; let x = xsAt(yb) + btw(r, 1, 6);
            while (x < 292) {
              const w = Math.min(btw(r, 15, 26), 300 - x), h = btw(r, 10, 14), cl = pick(r, CO);
              s += `<rect x="${f1(x)}" y="${f1(yb - h)}" width="${f1(w)}" height="${f1(h + 2)}" fill="${cl}"/>`;
              if (r() < .35) { s += `<path d="M${f1(x)} ${f1(yb - h)} A${f1(w / 2)} 5 0 0 1 ${f1(x + w)} ${f1(yb - h)} Z" fill="${cl}"/>`; if (!perch.length && j > 0) perch.push([x + w / 2, yb - h - 5]); }
              else if (!roof && j > 0) roof = [x + w / 2, yb - h - .5];
              if (r() < .5) s += `<rect x="${f1(x + w * .35)}" y="${f1(yb - 7)}" width="3.6" height="7" fill="${pick(r, ["#2F6DB5", "#4A3F38", "#3C6E9E"])}"/>`;
              x += w + btw(r, 1, 5);
            }
          }
          const bx = btw(r, 180, 250);
          s += `<rect x="${f1(bx - 8)}" y="128" width="16" height="12" fill="#F7F4EE"/><path d="M${f1(bx - 6)} 128 A6 6 0 0 1 ${f1(bx + 6)} 128 Z" fill="#2F6DB5"/><path d="M${f1(bx)} 122 V117 M${f1(bx - 2)} 119 H${f1(bx + 2)}" stroke="#8A7A5A" stroke-width="1"/>`;
          if (!perch.length) perch.push(roof || [btw(r, 240, 280), 97]);
          perch.push([bx, 116.5]);
          return { s, l, perch };
        } },
      { id: "windmill", zh: "伊亞風車",
        see: ["白白胖胖的風車站在懸崖邊", "風車的木頭骨架像一個大輪子", "傍晚大家都擠在這裡等著看夕陽"],
        spots: ["風車尖尖的屋頂上", "風車旁的白牆上"],
        draw(c) {
          const { r } = c, mx = btw(r, 160, 196), k = btw(r, .95, 1.08), B = 162, T = B - 58 * k;
          let s = water(130, "#A6D0E2", "#3F78A8", r) + `<path d="M150 131 Q200 118 250 121 Q280 122 300 127 L300 131 Z" fill="#8C7A6E"/>`, l = ""; const perch = [];
          s += `<path d="M0 200 L0 166 Q60 156 120 158 Q200 160 300 152 L300 200 Z" fill="#B48A68"/>`;
          const spokes = (hx, hy, L, w, sails) => { let p = "", rope = "", sl = ""; const a0 = r() * Math.PI / 4; for (let i = 0; i < 8; i++) { const a = a0 + i * Math.PI / 4, ex = hx + Math.cos(a) * L, ey = hy + Math.sin(a) * L * .92; p += `M${f1(hx)} ${f1(hy)} L${f1(ex)} ${f1(ey)} `; rope += `${i ? "L" : "M"}${f1(ex)} ${f1(ey)} `; if (sails && i % 2 === 0) sl += `<path d="M${f1(hx + Math.cos(a) * L * .25)} ${f1(hy + Math.sin(a) * L * .23)} L${f1(ex)} ${f1(ey)} L${f1(hx + Math.cos(a + .3) * L * .8)} ${f1(hy + Math.sin(a + .3) * L * .74)} Z" fill="#F2EBDC" opacity=".9"/>`; } return sl + `<path d="${rope}Z" stroke="#8A7A6A" stroke-width=".6" fill="none"/><path d="${p}" stroke="#6B5444" stroke-width="${w}"/><circle cx="${f1(hx)}" cy="${f1(hy)}" r="${f1(w * 1.4)}" fill="#5A4232"/>`; };
          if (r() < .65) { const sx = btw(r, 60, 96); s += `<path d="M${f1(sx - 9)} 162 L${f1(sx - 8)} 134 L${f1(sx + 8)} 134 L${f1(sx + 9)} 162 Z" fill="#F6F3EC"/><path d="M${f1(sx - 9)} 134 L${f1(sx)} 123 L${f1(sx + 9)} 134 Z" fill="#7A6250"/>` + spokes(sx - 2, 137, 18, .9, false); }
          s += `<path d="M${f1(mx - 22 * k)} ${B} L${f1(mx - 19 * k)} ${f1(T)} L${f1(mx + 19 * k)} ${f1(T)} L${f1(mx + 22 * k)} ${B} Z" fill="#F6F3EC"/><path d="M${f1(mx + 8 * k)} ${B} L${f1(mx + 8 * k)} ${f1(T)} L${f1(mx + 19 * k)} ${f1(T)} L${f1(mx + 22 * k)} ${B} Z" fill="#E2DED6"/>`;
          s += `<path d="M${f1(mx - 5 * k)} ${B} v${f1(-9 * k)} a${f1(5 * k)} ${f1(5 * k)} 0 0 1 ${f1(10 * k)} 0 v${f1(9 * k)} Z" fill="#5B4636"/><rect x="${f1(mx + 9 * k)}" y="${f1(T + 16 * k)}" width="${f1(4 * k)}" height="${f1(5 * k)}" fill="#5B4636"/>`;
          s += `<path d="M${f1(mx - 21 * k)} ${f1(T + 1)} L${f1(mx)} ${f1(T - 24 * k)} L${f1(mx + 21 * k)} ${f1(T + 1)} Z" fill="#7A6250"/><path d="M${f1(mx - 10 * k)} ${f1(T - 4 * k)} L${f1(mx)} ${f1(T - 18 * k)} M${f1(mx + 10 * k)} ${f1(T - 4 * k)} L${f1(mx + 2 * k)} ${f1(T - 16 * k)}" stroke="#67503F" stroke-width=".7"/>`;
          const hx = mx - 4 * k, hy = T + 6 * k;
          s += `<path d="M${f1(mx + 2 * k)} ${f1(hy)} L${f1(hx - 2)} ${f1(hy)}" stroke="#5A4232" stroke-width="2.2"/>` + spokes(hx, hy, 42 * k, 1.5, r() < .5);
          s += `<rect x="0" y="176" width="300" height="3" fill="#E3DFD6"/><rect x="0" y="179" width="300" height="21" fill="#F2EFE8"/>`;
          perch.push([mx, T - 24 * k - .5], [btw(r, 20, 130), 175.5]);
          return { s, l, perch };
        } },
      { id: "caldera", zh: "火山口海景",
        see: ["懸崖一層紅一層灰，都是火山岩", "海中間那座黑色小島還是一座火山", "帆船慢慢地繞著火山口航行"],
        spots: ["帆船的桅杆頂上", "懸崖邊的白房子屋頂上"],
        draw(c) {
          const { r } = c, sx = btw(r, 70, 122), wl = 158;
          let s = water(122, "#A6D0E2", "#2F6698", r), l = ""; const perch = [];
          s += `<path d="M0 123 Q24 104 60 108 Q90 110 116 123 Z" fill="#8E7E72"/><path d="M84 128 Q104 117 128 120 Q150 116 174 128 Z" fill="#3E3936"/>`;
          const L = (d, col) => `<path d="M${f1(150 + d * .5)} 200 L${f1(166 + d * .5)} ${f1(152 + d)} L${f1(196 + d * .4)} ${f1(118 + d)} Q232 ${f1(98 + d)} 300 ${f1(94 + d)} L300 200 Z" fill="${col}"/>`;
          s += L(0, "#CDBBA6") + L(4, "#9B4E37") + L(15, "#70625C") + L(27, "#8A5440") + L(42, "#5E4E48");
          const rim = (t) => [(1 - t) * (1 - t) * 196 + 2 * t * (1 - t) * 232 + t * t * 300, (1 - t) * (1 - t) * 118 + 2 * t * (1 - t) * 98 + t * t * 94];
          for (let i = 0; i < 14; i++) { const [vx, vy] = rim(btw(r, .08, .97)), w = btw(r, 4, 7), h = btw(r, 3, 5); s += `<rect x="${f1(vx - w / 2)}" y="${f1(vy - h + 1)}" width="${f1(w)}" height="${f1(h)}" fill="#F7F4EE"/>`; }
          const [px, py] = rim(.5);
          s += `<rect x="${f1(px - 4)}" y="${f1(py - 6)}" width="8" height="7" fill="#F7F4EE"/>`;
          s += `<path d="M${f1(sx - 30)} ${wl + 6} q-12 1 -26 0 M${f1(sx - 28)} ${wl + 9} q-10 1 -20 0" stroke="#fff" stroke-opacity=".6" stroke-width=".8" fill="none"/>`;
          s += `<path d="M${f1(sx - 7)} ${wl - 4} V${wl - 44} L${f1(sx + 8)} ${wl - 36} V${wl - 4} Z M${f1(sx + 11)} ${wl - 4} V${wl - 38} L${f1(sx + 24)} ${wl - 6} Z" fill="#F2EBDC"/><path d="M${f1(sx + 11)} ${wl - 36} L${f1(sx + 39)} ${wl - 10} L${f1(sx + 26)} ${wl - 8} Z" fill="#E6DCC6"/>`;
          s += `<path d="M${f1(sx - 8)} ${wl} V${wl - 47} M${f1(sx + 10)} ${wl} V${wl - 41} M${f1(sx + 26)} ${wl - 2} L${f1(sx + 40)} ${wl - 10}" stroke="#4A3428" stroke-width="1.2"/>`;
          s += `<path d="M${f1(sx - 26)} ${wl} L${f1(sx + 28)} ${wl} L${f1(sx + 21)} ${wl + 8} L${f1(sx - 19)} ${wl + 8} Z" fill="#5B3A2A"/><rect x="${f1(sx - 24)}" y="${wl + 1}" width="50" height="1.4" fill="#E9E1D0"/>`;
          perch.push(r() < .5 ? [sx - 8, wl - 47.5] : [sx + 10, wl - 41.5], [px, py - 6.5]);
          return { s, l, perch };
        } },
      { id: "donkeysteps", zh: "驢子階梯",
        see: ["彎來彎去的階梯從懸崖頂一路通到港口", "驢子馱著遊客一步一步往上爬", "從舊港走上去要爬五百多階"],
        spots: ["階梯轉角的矮牆上", "懸崖頂的白牆上", "一隻驢子的背上"],
        draw(c) {
          const { r } = c;
          let s = water(180, "#9CC6DA", "#3F78A8", r), l = ""; const perch = [];
          s += `<path d="M0 182 L0 112 Q60 104 120 100 L300 92 L300 182 Z" fill="#8E6450"/><path d="M0 116 Q60 108 120 104 L300 97" stroke="#C9B7A2" stroke-width="4" fill="none"/><path d="M0 128 Q80 120 300 110 M0 152 Q120 142 300 136" stroke="#76513F" stroke-width="3" fill="none" opacity=".7"/>`;
          s += `<rect x="0" y="179" width="300" height="6" fill="#CDBFA6"/>` + boat(btw(r, 30, 200), 192, .9, false);
          const rimY = (x) => (x < 120 ? 112 - x / 10 : 100 - (x - 120) / 22.5);
          let x = btw(r, 112, 124), roof = null;
          while (x < 292) {
            const w = Math.min(btw(r, 10, 18), 300 - x), h = btw(r, 8, 15), y = rimY(x + w) + 2;
            s += `<rect x="${f1(x)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(h)}" fill="#F7F4EE"/>`;
            if (!roof && x > 150) roof = [x + w / 2, y - h - .5];
            x += w + btw(r, 0, 3);
          }
          const P = [[btw(r, 196, 214), 102], [118, 118], [244, 134], [104, 150], [232, 165], [140, 180]];
          const pd = P.map((p, i) => `${i ? "L" : "M"}${f1(p[0])} ${f1(p[1])}`).join(" ");
          s += `<path d="${pd}" stroke="#D9C7A6" stroke-width="8" stroke-linejoin="round" stroke-linecap="round" fill="none"/><path d="${pd}" stroke="#B9A684" stroke-width="6" stroke-dasharray="1.2 3.2" fill="none"/><path d="${P.map((p, i) => `${i ? "L" : "M"}${f1(p[0])} ${f1(p[1] - 4.5)}`).join(" ")}" stroke="#EFE7D6" stroke-width="1.6" stroke-linejoin="round" fill="none"/>`;
          const donkey = (x, y, d, col) => `<path d="M${f1(x - 4)} ${f1(y)} V${f1(y - 4.5)} M${f1(x - 2)} ${f1(y)} V${f1(y - 4.5)} M${f1(x + 2.5)} ${f1(y)} V${f1(y - 4.5)} M${f1(x + 4.5)} ${f1(y)} V${f1(y - 4.5)}" stroke="${col}" stroke-width="1.1"/><ellipse cx="${f1(x)}" cy="${f1(y - 6.5)}" rx="6" ry="3.2" fill="${col}"/><path d="M${f1(x + d * 4)} ${f1(y - 8)} L${f1(x + d * 8)} ${f1(y - 12)} L${f1(x + d * 10.5)} ${f1(y - 10.5)} L${f1(x + d * 9.5)} ${f1(y - 8.5)} L${f1(x + d * 6)} ${f1(y - 6)} Z" fill="${col}"/><path d="M${f1(x + d * 8)} ${f1(y - 12)} l${f1(-d * .5)} -3.5 M${f1(x + d * 9)} ${f1(y - 12)} l${f1(d * .8)} -3.2 M${f1(x - d * 6)} ${f1(y - 7)} q${f1(-d * 2)} 2 ${f1(-d * 1.5)} 5" stroke="${col}" stroke-width=".9" fill="none"/><rect x="${f1(x - 3)}" y="${f1(y - 10.5)}" width="6" height="3" fill="${pick(r, ["#B5412E", "#2F6DB5", "#D8B23A"])}"/>`;
          let back = null, rider = 0;
          for (const i of [0, 1, 2, 3, 4]) {
            if (i !== 2 && r() < .3) continue;
            const t = btw(r, .2, .8), A = P[i], Bp = P[i + 1], dx = A[0] + t * (Bp[0] - A[0]), dy = A[1] + t * (Bp[1] - A[1]) + 2, d = Bp[0] > A[0] ? -1 : 1;
            s += donkey(dx, dy, d, pick(r, ["#7A6252", "#8A847C", "#5E4E44"]));
            if (!back) back = [dx, dy - 10.5];
            else if (!rider && r() < .7) { rider = 1; s += `<rect x="${f1(dx - 2.2)}" y="${f1(dy - 18)}" width="4.4" height="7" rx="1.5" fill="${pick(r, ["#3C6E9E", "#C8453A", "#5A6B4E"])}"/><circle cx="${f1(dx)}" cy="${f1(dy - 20)}" r="2.3" fill="#D9B48F"/>`; }
          }
          perch.push([P[2][0], P[2][1] - 5.5], roof || [200, 92], back);
          return { s, l, perch };
        } },
      { id: "redbeach", zh: "紅沙灘",
        see: ["整面懸崖都是紅通通的火山岩", "沙灘上的沙子是紅色和黑色的", "海水清得可以看見底下的石頭"],
        spots: ["紅色岩壁的頂上", "海邊的大石頭上"],
        draw(c) {
          const { r, sea } = c;
          let s = water(140, "#A6D0E2", "#3F7FAA", r), l = ""; const perch = [];
          const pts = [[96, 172], [108, 146], [122, 124], [142, 106], [162, 100], [182, 88], [204, 94], [226, 84], [248, 92], [270, 86], [300, 90]].map((p, i) => (i && i < 10 ? [p[0], p[1] + btw(r, -4, 4)] : p));
          s += `<path d="M${pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join(" L")} L300 172 Z" fill="#A9432C"/><path d="M112 172 L132 140 L300 128 L300 172 Z" fill="#8E3826" opacity=".55"/>`;
          let g = "";
          for (let i = 3; i < 10; i++) { const [x, y] = pts[i]; g += `M${f1(x)} ${f1(y + 14)} l${f1(btw(r, -3, 3))} ${f1(btw(r, 22, 40))} `; }
          const band = pts.slice(2);
          s += `<path d="M${band.map((p) => `${f1(p[0] + 2)} ${f1(p[1] + 6)}`).join(" L")} L${band.slice().reverse().map((p) => `${f1(p[0] + 2)} ${f1(p[1] + 12)}`).join(" L")} Z" fill="#4E3A34" opacity=".85"/>`;
          s += `<path d="${g}" stroke="#82301F" stroke-width="1.4" fill="none"/><ellipse cx="${f1(btw(r, 160, 200))}" cy="132" rx="12" ry="6" fill="#C9764A" opacity=".7"/><ellipse cx="${f1(btw(r, 230, 280))}" cy="120" rx="14" ry="7" fill="#C9764A" opacity=".6"/>`;
          s += `<path d="M60 200 Q110 176 170 172 L300 170 L300 200 Z" fill="#B65A3E"/><path d="M60 200 Q110 176 170 172 L300 170" stroke="#fff" stroke-opacity=".7" stroke-width="1.2" fill="none"/>`;
          for (let i = 0; i < 14; i++) s += `<circle cx="${f1(btw(r, 120, 296))}" cy="${f1(btw(r, 180, 197))}" r="${f1(btw(r, .8, 1.6))}" fill="#5A3A32"/>`;
          const rk = [];
          for (let i = 0; i < 3; i++) { const x = btw(r, 18, 96), y = btw(r, 168, 192), w = btw(r, 6, 12); rk.push([x, y - w * .55]); s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(w)}" ry="${f1(w * .55)}" fill="#4A3A36"/><path d="M${f1(x - w * .6)} ${f1(y - w * .2)} q${f1(w * .5)} ${f1(-w * .3)} ${f1(w)} 0" stroke="#7A6660" stroke-width=".8" fill="none"/>`; }
          s += boat(btw(r, 15, 60), btw(r, 146, 151), .9, false);
          let top = pts[1]; for (const p of pts) if (p[1] < top[1]) top = p;
          perch.push([top[0], top[1] - .5], rk[0]);
          if (sea !== "winter") {
            const nU = sea === "summer" ? 4 : 2;
            for (let i = 0; i < nU; i++) { const ux = 160 + i * 32 + btw(r, -6, 6), uy = btw(r, 182, 192); s += `<rect x="${f1(ux - 6)}" y="${f1(uy)}" width="11" height="2.4" fill="${pick(r, ["#F4EFE6", "#3C6E9E", "#E0B13A"])}"/><path d="M${f1(ux)} ${f1(uy)} V${f1(uy - 14)}" stroke="#6B5444" stroke-width="1"/><path d="M${f1(ux - 9)} ${f1(uy - 13)} Q${f1(ux)} ${f1(uy - 21)} ${f1(ux + 9)} ${f1(uy - 13)} Z" fill="${pick(r, ["#E9D7A6", "#3C6E9E", "#E4E0D6", "#C8453A"])}"/>`; }
          }
          return { s, l, perch };
        } },
    ],
  },
};
