var CITIES_PART = {
  praha: {
    zh: "布拉格", de: "Praha", gift: "一個木頭做的提線小木偶",
    sights: [
      { id: "karluv", zh: "查理大橋",
        see: ["石橋兩邊站著一排黑黑的聖人雕像", "好多人摸著雕像底座的銅片許願，摸得發亮", "橋頭的塔又高又黑，屋頂尖尖的"],
        spots: ["聖人雕像的頭上", "橋頭塔樓的尖頂上", "石橋的欄杆上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const tx = btw(r, 222, 250), dk = 128, st = "#8A7E6E", wd = "#5F8197";
          s += hills(124, "#93A58C", r, 10) + water(150, "#9CB9C6", wd, r);
          s += `<rect x="${f1(tx + 10)}" y="140" width="${f1(300 - tx)}" height="60" fill="#9A8E7C"/>`;
          const H = houses(140, 3, r, ["#E8DCC2", "#EBD6B4", "#E6C7A8"], false, tx + 16); s += H.s.replace(/#7E6B5C|#5E6B78/g, "#B5523B");
          s += tree(btw(r, tx + 30, 290), 142, .9, sea, r);
          s += `<rect x="0" y="${dk}" width="${f1(tx)}" height="34" fill="${st}"/><rect x="0" y="${dk}" width="${f1(tx)}" height="3" fill="#A39784"/>`;
          for (let ax = 22; ax + 22 < tx; ax += 58) s += `<path d="M${ax - 22} 162 A22 17 0 0 1 ${ax + 22} 162 Z" fill="${wd}"/><path d="M${ax + 23} 162 L${ax + 29} 169 L${ax + 35} 162 Z" fill="${st}"/>`;
          let n = 0;
          for (let x = btw(r, 10, 20); x < tx - 26; x += btw(r, 26, 34), n++) {
            s += `<rect x="${f1(x - 3.5)}" y="${dk - 5}" width="7" height="5" fill="#4A4540"/><path d="M${f1(x - 4)} ${dk - 5} L${f1(x - 3)} ${dk - 18} Q${f1(x)} ${dk - 21} ${f1(x + 3)} ${dk - 18} L${f1(x + 4)} ${dk - 5} Z" fill="#3A3734"/><circle cx="${f1(x)}" cy="${dk - 22}" r="3" fill="#3A3734"/>`;
            if (r() < .3) s += `<circle cx="${f1(x)}" cy="${dk - 22}" r="5.2" fill="none" stroke="#D9B44A" stroke-width="1"/>`;
            if (n === 2) perch.push([x, dk - 25]);
          }
          const g = "#8F8372", dt = "#3B4248";
          s += `<rect x="${f1(tx - 16)}" y="62" width="32" height="104" fill="${g}"/><path d="M${f1(tx - 9)} 142 V120 Q${f1(tx)} 106 ${f1(tx + 9)} 120 V142 Z" fill="#3E3630"/>`;
          s += `<path d="M${f1(tx - 10)} 98 V84 L${f1(tx - 7)} 78 L${f1(tx - 4)} 84 V98 Z M${f1(tx + 4)} 98 V84 L${f1(tx + 7)} 78 L${f1(tx + 10)} 84 V98 Z" fill="#4A4038"/><rect x="${f1(tx - 18)}" y="58" width="36" height="5" fill="#7A6E5E"/>`;
          s += `<path d="M${f1(tx - 15)} 58 L${f1(tx)} 24 L${f1(tx + 15)} 58 Z M${f1(tx - 19)} 58 V50 L${f1(tx - 16)} 38 L${f1(tx - 13)} 50 V58 Z M${f1(tx + 13)} 58 V50 L${f1(tx + 16)} 38 L${f1(tx + 19)} 50 V58 Z" fill="${dt}"/><circle cx="${f1(tx)}" cy="23" r="2" fill="#D9B44A"/>`;
          perch.push([tx, 21], [Math.min(tx - 40, btw(r, 60, 200)), dk]);
          return { s, l, perch };
        } },
      { id: "hrad", zh: "布拉格城堡",
        see: ["長長的城堡躺在山丘上，一眼望不完", "聖維特大教堂的尖塔從城堡裡冒出來", "山坡下面是一大片紅色的屋頂"],
        spots: ["大教堂的尖塔頂上", "城堡屋頂的邊上", "山坡下的紅屋頂上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const cx = btw(r, 178, 200), nv = "#6F6A62", rf = "#4A5450";
          s += `<path d="M0 200 L0 146 Q50 126 100 122 L300 116 L300 200 Z" fill="#8FA87E"/>`;
          s += `<rect x="${f1(cx - 44)}" y="70" width="82" height="34" fill="${nv}"/><path d="M${f1(cx - 46)} 72 L${f1(cx - 36)} 52 L${f1(cx + 30)} 52 L${f1(cx + 40)} 72 Z" fill="${rf}"/>`;
          for (let i = 0; i < 9; i++) s += `<path d="M${f1(cx - 38 + i * 9)} 76 L${f1(cx - 36 + i * 9)} 62 L${f1(cx - 34 + i * 9)} 76 Z" fill="${nv}"/>`;
          for (const x of [cx - 60, cx - 47]) s += `<rect x="${f1(x)}" y="50" width="11" height="54" fill="#69645C"/><path d="M${f1(x - 1)} 51 L${f1(x + 5.5)} 14 L${f1(x + 12)} 51 Z" fill="${rf}"/><path d="M${f1(x + 3.5)} 80 V66 L${f1(x + 5.5)} 62 L${f1(x + 7.5)} 66 V80 Z" fill="#3E3A36"/>`;
          s += `<rect x="${f1(cx - 4)}" y="44" width="20" height="60" fill="#77716A"/><rect x="${f1(cx - 6)}" y="41" width="24" height="5" fill="#5E5850"/><path d="M${f1(cx - 4)} 42 Q${f1(cx - 5)} 30 ${f1(cx + 6)} 25 Q${f1(cx + 17)} 30 ${f1(cx + 16)} 42 Z" fill="#6FA28D"/><rect x="${f1(cx + 4)}" y="16" width="4" height="10" fill="#6FA28D"/><path d="M${f1(cx + 2)} 70 V54 L${f1(cx + 6)} 48 L${f1(cx + 10)} 54 V70 Z" fill="#3E3A36"/>`;
          s += `<path d="M38 98 L46 90 L286 90 L292 98 Z" fill="#8C6A5A"/><rect x="40" y="98" width="250" height="26" fill="#EAE0CA"/>`;
          for (let x = 47; x < 284; x += 10) s += `<rect x="${x}" y="103" width="3" height="5" fill="#6E6458"/><rect x="${x}" y="113" width="3" height="5" fill="#6E6458"/>`;
          for (let i = 0; i < 3; i++) s += tree(btw(r, 10, 290), btw(r, 132, 140), .8, sea, r);
          const H = houses(184, 12, r, ["#EBD6B4", "#E8DCC2", "#F0D9A6", "#E6C7A8"], false); s += H.s.replace(/#7E6B5C|#5E6B78/g, "#B5523B");
          s += `<rect x="0" y="184" width="300" height="16" fill="#B9A78C"/>`;
          perch.push([cx - 54.5, 14], [cx + 6, 15], [btw(r, 60, 120), 90]);
          return { s, l, perch };
        } },
      { id: "orloj", zh: "布拉格天文鐘",
        see: ["鐘面有藍色有金色，還有好幾個圈圈", "整點的時候，上面的小窗會有使徒走過", "一旁的小骷髏會拉鈴，大家都抬頭看"],
        spots: ["鐘樓的尖頂上", "天文鐘的石框上", "舊市政廳的屋頂上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const tx = btw(r, 160, 190), cy = 128, R = 16, au = "#D9B44A";
          const H = houses(182, 10, r, ["#E8C7A8", "#EBD6B4", "#D9B8A0", "#F0E0B8", "#E2C9A3"], false, -6); s += H.s;
          s += `<rect x="0" y="182" width="300" height="18" fill="#B9A78C"/>`;
          s += `<rect x="${f1(tx - 22)}" y="46" width="44" height="136" fill="#A39886"/><rect x="${f1(tx - 25)}" y="40" width="50" height="7" fill="#8C8270"/>`;
          s += `<path d="M${f1(tx - 18)} 40 L${f1(tx)} 18 L${f1(tx + 18)} 40 Z M${f1(tx - 25)} 40 V32 L${f1(tx - 22)} 20 L${f1(tx - 19)} 32 V40 Z M${f1(tx + 19)} 40 V32 L${f1(tx + 22)} 20 L${f1(tx + 25)} 32 V40 Z" fill="#3E454A"/><circle cx="${f1(tx)}" cy="17" r="1.8" fill="${au}"/>`;
          s += `<path d="M${f1(tx - 4)} 80 V66 L${f1(tx)} 60 L${f1(tx + 4)} 66 V80 Z" fill="#4A4038"/>`;
          s += `<path d="M${f1(tx - 21)} 180 V104 L${f1(tx)} 90 L${f1(tx + 21)} 104 V180 Z" fill="#C9BBA0"/><rect x="${f1(tx - 9)}" y="97" width="6" height="7" fill="#3E3630"/><rect x="${f1(tx + 3)}" y="97" width="6" height="7" fill="#3E3630"/>`;
          s += `<circle cx="${f1(tx)}" cy="${cy}" r="${R}" fill="#2F2A28" stroke="${au}" stroke-width="1.6"/><circle cx="${f1(tx)}" cy="${cy}" r="12.5" fill="#4F86B8"/><circle cx="${f1(tx)}" cy="${cy + 5}" r="7.6" fill="#B8743A"/><circle cx="${f1(tx)}" cy="${cy + 6}" r="6.4" fill="#2E2622"/>`;
          s += `<circle cx="${f1(tx)}" cy="${cy - 3}" r="8" fill="none" stroke="${au}" stroke-width="1.4"/>`;
          for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; s += `<circle cx="${f1(tx + Math.cos(a) * 14.4)}" cy="${f1(cy + Math.sin(a) * 14.4)}" r=".9" fill="${au}"/>`; }
          const a = btw(r, 0, Math.PI * 2);
          s += `<path d="M${f1(tx)} ${cy} L${f1(tx + Math.cos(a) * 13)} ${f1(cy + Math.sin(a) * 13)}" stroke="${au}" stroke-width="1.6"/><circle cx="${f1(tx + Math.cos(a) * 8)}" cy="${f1(cy + Math.sin(a) * 8)}" r="2.4" fill="#F2C94C"/><circle cx="${f1(tx)}" cy="${cy}" r="1.4" fill="${au}"/>`;
          s += `<circle cx="${f1(tx)}" cy="163" r="11" fill="#E9DFC2" stroke="${au}" stroke-width="1.4"/><circle cx="${f1(tx)}" cy="163" r="4.5" fill="#4F86B8"/>`;
          for (let i = 0; i < 12; i++) { const b = i / 12 * Math.PI * 2; s += `<circle cx="${f1(tx + Math.cos(b) * 8)}" cy="${f1(163 + Math.sin(b) * 8)}" r="1.4" fill="${["#B8743A", "#6E8E5A", "#C2392D", "#4F86B8"][i % 4]}"/>`; }
          s += `<rect x="${f1(tx + 16)}" y="118" width="3" height="10" fill="#EDE6D6"/><circle cx="${f1(tx + 17.5)}" cy="116" r="1.8" fill="#EDE6D6"/><rect x="${f1(tx - 19)}" y="118" width="3" height="10" fill="#5A4232"/><circle cx="${f1(tx - 17.5)}" cy="116" r="1.8" fill="#5A4232"/>`;
          perch.push([tx, 15], [tx, 90], [tx + 22, 20]);
          return { s, l, perch };
        } },
      { id: "tyn", zh: "提恩教堂",
        see: ["兩座黑色的高塔，頂上長滿了小尖刺", "每根小尖頂上都點著一顆金色的小球", "教堂躲在廣場邊一排房子的後面"],
        spots: ["高塔的小尖頂上", "前面房子的山牆上", "舊城廣場的石板地上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const t1 = btw(r, 150, 168), t2 = t1 + 54, dk = "#2E3236", au = "#D9B44A", fr = "#EFE6D2";
          const tower = (x, top, w) => {
            let d = `<rect x="${f1(x - w)}" y="74" width="${f1(2 * w)}" height="90" fill="#B3A996"/><path d="M${f1(x - 4)} 118 V100 L${f1(x)} 94 L${f1(x + 4)} 100 V118 Z" fill="#4A4038"/>`;
            d += `<path d="M${f1(x - w + 1)} 77 L${f1(x)} ${f1(top)} L${f1(x + w - 1)} 77 Z" fill="${dk}"/>`;
            for (const [dx, h] of [[-w, 30], [w, 30], [-w * .5, 22], [w * .5, 22], [-w * .8, 38], [w * .8, 38]]) {
              const px = x + dx, ty = top + h;
              d += `<path d="M${f1(px - 2.6)} 79 V${f1(ty + 12)} L${f1(px)} ${f1(ty)} L${f1(px + 2.6)} ${f1(ty + 12)} V79 Z" fill="${dk}"/><circle cx="${f1(px)}" cy="${f1(ty - 1)}" r="1.5" fill="${au}"/>`;
            }
            return d + `<circle cx="${f1(x)}" cy="${f1(top - 1.5)}" r="2" fill="${au}"/>`;
          };
          s += `<path d="M${f1(t1 + 10)} 112 L${f1((t1 + t2) / 2)} 62 L${f1(t2 - 10)} 112 Z" fill="#3A3E42"/>` + tower(t1, 24, 12) + tower(t2, 18, 13);
          const H = houses(178, 3, r, ["#E6B9A6", "#EBD08A", "#DCE3D2"], false, btw(r, -4, 4)); s += H.s.replace(/#7E6B5C|#5E6B78/g, "#B5523B");
          s += `<rect x="${f1(t2 + 34)}" y="120" width="${f1(266 - t2)}" height="58" fill="#E8C7A8"/><path d="M${f1(t2 + 32)} 120 L${f1(t2 + 40)} 110 L300 110 L300 120 Z" fill="#B5523B"/>`;
          s += `<rect x="${f1(t1 - 34)}" y="132" width="${f1(t2 - t1 + 68)}" height="46" fill="${fr}"/>`;
          for (const gx of [t1 + 2, t2 - 2]) s += `<path d="M${f1(gx - 15)} 133 V124 Q${f1(gx - 15)} 116 ${f1(gx)} 109 Q${f1(gx + 15)} 116 ${f1(gx + 15)} 124 V133 Z" fill="${fr}"/><rect x="${f1(gx - 3)}" y="118" width="6" height="7" fill="#5E5A54"/>`;
          for (let x = t1 - 28; x < t2 + 28; x += 13) s += `<path d="M${f1(x)} 178 V168 Q${f1(x + 4.5)} 161 ${f1(x + 9)} 168 V178 Z" fill="#5E5A54"/><rect x="${f1(x + 2.5)}" y="142" width="4" height="8" fill="#5E5A54"/>`;
          s += `<rect x="0" y="178" width="300" height="22" fill="#B9A78C"/>`;
          for (let i = 0; i < 14; i++) s += `<ellipse cx="${f1(btw(r, 5, 295))}" cy="${f1(btw(r, 182, 197))}" rx="3" ry="1.2" fill="#A39278"/>`;
          perch.push([t2, 14.5], [t1 + 2, 109], [t1 - 12, 66]);
          return { s, l, perch };
        } },
      { id: "tancici", zh: "跳舞的房子",
        see: ["兩棟樓靠在一起，好像一對在跳舞的人", "玻璃的那棟腰細細的，像穿著裙子", "另一棟的頂上有一團扭來扭去的鐵網"],
        spots: ["鐵網圓頂上", "玻璃樓的屋頂邊上", "路面電車的車頂上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const gx = btw(r, 120, 140), cg = gx + 20, fx = gx + 40;
          s += `<rect x="0" y="172" width="300" height="28" fill="#8D8C86"/><rect x="0" y="170" width="300" height="3" fill="#B5B0A6"/>`;
          s += `<path d="M0 98 H${f1(gx + 4)} L${f1(gx)} 90 H0 Z" fill="#7E6B5C"/><rect x="0" y="98" width="${f1(gx + 4)}" height="74" fill="#D9D2C2"/>`;
          for (let y = 106; y < 160; y += 16) for (let x = 8; x < gx - 8; x += 14) s += `<rect x="${x}" y="${y}" width="6" height="8" fill="#5E5A54"/>`;
          s += `<path d="M${f1(fx + 44)} 84 L${f1(fx + 50)} 74 H300 V84 Z" fill="#6E5E52"/><rect x="${f1(fx + 44)}" y="84" width="${f1(256 - fx)}" height="88" fill="#E2C9A3"/>`;
          for (let y = 92; y < 160; y += 16) for (let x = fx + 52; x < 294; x += 13) s += `<rect x="${f1(x)}" y="${y}" width="6" height="8" fill="#5E5A54"/>`;
          s += `<rect x="${f1(fx)}" y="66" width="46" height="106" fill="#E5DDCC"/>`;
          for (let i = 0; i < 7; i++) { const y = 74 + i * 13, o = 3 * Math.sin(i * 1.3); for (let j = 0; j < 4; j++) s += `<rect x="${f1(fx + 5 + j * 10 + o)}" y="${y}" width="5" height="7" fill="#4F5A64"/>`; s += `<path d="M${f1(fx)} ${y + 10} q11.5 -4 23 0 t23 0" stroke="#BFB4A0" stroke-width="1" fill="none"/>`; }
          s += `<path d="M${f1(fx + 16)} 66 Q${f1(fx + 16)} 51 ${f1(fx + 30)} 49 Q${f1(fx + 44)} 51 ${f1(fx + 44)} 66 Z" fill="#9AA0A6" stroke="#5E646A" stroke-width="1"/><path d="M${f1(fx + 19)} 64 Q${f1(fx + 25)} 56 ${f1(fx + 34)} 50 M${f1(fx + 26)} 66 Q${f1(fx + 33)} 58 ${f1(fx + 41)} 55 M${f1(fx + 41)} 64 Q${f1(fx + 32)} 58 ${f1(fx + 23)} 53" stroke="#5E646A" stroke-width=".9" fill="none"/>`;
          const L = [], Rr = [];
          for (let y = 70; y <= 150; y += 10) { const h = 19 - 7 * Math.sin(Math.PI * (y - 70) / 80), ln = (150 - y) * .06; L.push([cg + ln - h, y]); Rr.push([cg + ln + h, y]); }
          s += `<path d="M${L.map(([x, y]) => `${f1(x)} ${y}`).join(" L")} L${Rr.slice().reverse().map(([x, y]) => `${f1(x)} ${y}`).join(" L")} Z" fill="#A9C7D2" stroke="#6E8E9C" stroke-width=".8"/>`;
          let gl = ""; for (let i = 1; i < L.length - 1; i++) gl += `M${f1(L[i][0])} ${L[i][1]} H${f1(Rr[i][0])} `;
          for (const f of [.25, .5, .75]) gl += "M" + L.map((p, i) => `${f1(p[0] + f * (Rr[i][0] - p[0]))} ${p[1]}`).join(" L") + " ";
          s += `<path d="${gl}" stroke="#7E9EAA" stroke-width=".6" fill="none"/><path d="M${f1(L[0][0])} 70 H${f1(Rr[0][0])}" stroke="#4A5A64" stroke-width="2"/>`;
          for (const dx of [-14, -2, 10]) s += `<rect x="${f1(cg + dx)}" y="150" width="3.4" height="22" fill="#8C8578"/>`;
          if (r() < .5) { const x = btw(r, 6, 50); s += `<rect x="${f1(x)}" y="150" width="64" height="20" rx="3" fill="#EFE3C8"/><rect x="${f1(x)}" y="160" width="64" height="10" fill="#C2392D"/><rect x="${f1(x + 6)}" y="147" width="52" height="3" fill="#6E6A64"/>`; for (let k = 0; k < 5; k++) s += `<rect x="${f1(x + 4 + k * 12)}" y="153" width="8" height="6" fill="#5E6E78"/>`; perch.push([x + 32, 147]); }
          perch.push([fx + 30, 49], [cg + 6, 69]);
          return { s, l, perch };
        } },
      { id: "zlata", zh: "黃金巷",
        see: ["小房子一間挨著一間，各塗著不同的顏色", "門矮矮小小的，大人進去都要低頭", "卡夫卡曾經在藍色的二十二號裡寫作"],
        spots: ["小房子的煙囪上", "紅瓦屋頂上", "城牆上的木走廊邊"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          s += `<rect x="0" y="96" width="300" height="80" fill="#A99E8E"/><rect x="0" y="86" width="300" height="11" fill="#7A5E48"/><path d="M0 86 L6 80 H294 L300 86 Z" fill="#8E5444"/>`;
          for (let x = 8; x < 300; x += 18) s += `<rect x="${x}" y="89" width="6" height="5" fill="#3E3630"/>`;
          for (let i = 0; i < 12; i++) s += `<path d="M${f1(btw(r, 0, 280))} ${f1(btw(r, 102, 126))} h${f1(btw(r, 8, 18))}" stroke="#8E8474" stroke-width="1"/>`;
          const cols = ["#F2C94C", "#6FA8DC", "#8BC48A", "#E57B6A", "#F4A3B4", "#F6E7B0", "#A7C7E7", "#E9A24C"];
          let x = btw(r, 2, 8), ci = Math.floor(r() * 8), n = 0;
          while (x < 266) {
            const w = Math.min(btw(r, 28, 38), 299 - x), h = btw(r, 38, 52), top = 174 - h; ci = (ci + 1 + Math.floor(r() * 3)) % 8;
            s += `<rect x="${f1(x)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" fill="${cols[ci]}"/><path d="M${f1(x - 1.5)} ${f1(top)} L${f1(x + 3)} ${f1(top - 10)} L${f1(x + w - 3)} ${f1(top - 10)} L${f1(x + w + 1.5)} ${f1(top)} Z" fill="#A9483A"/>`;
            if (sea === "winter") s += `<path d="M${f1(x + 1.2)} ${f1(top - 7)} L${f1(x + 3)} ${f1(top - 10)} L${f1(x + w - 3)} ${f1(top - 10)} L${f1(x + w - 1.2)} ${f1(top - 7)} Z" fill="#F4F2EE"/>`;
            const cx = x + w * .7, dx = x + btw(r, 3, w - 13), wx = dx > x + w / 2 - 4 ? x + 4 : x + w - 12;
            s += `<rect x="${f1(cx)}" y="${f1(top - 17)}" width="5" height="9" fill="#7A5E48"/><rect x="${f1(dx)}" y="156" width="9" height="18" fill="#5A4232"/><rect x="${f1(wx)}" y="${f1(top + 9)}" width="8" height="8" fill="#DCE7EE" stroke="#F4F2EE" stroke-width="1.2"/>`;
            if (n === 1) perch.push([cx + 2.5, top - 17]);
            if (n === 4) perch.push([x + w / 2, top - 10]);
            x += w + btw(r, 0, 1.5); n++;
          }
          s += `<rect x="0" y="174" width="300" height="26" fill="#9C9284"/>`;
          for (let i = 0; i < 18; i++) s += `<ellipse cx="${f1(btw(r, 5, 295))}" cy="${f1(btw(r, 178, 197))}" rx="3" ry="1.2" fill="#857B6E"/>`;
          perch.push([btw(r, 20, 280), 80]);
          return { s, l, perch };
        } },
    ],
  },
  berlin: {
    zh: "柏林", de: "Berlin", gift: "一個紅綠燈小人的鑰匙圈",
    sights: [
      { id: "brandenburger", zh: "布蘭登堡門",
        see: ["一排粗粗的石柱，中間可以走過去", "門頂上有四匹馬拉著一輛車", "駕車的女神手上舉著花環和老鷹"],
        spots: ["女神舉起的權杖頂上", "門頂的石沿上", "旁邊小屋的屋頂上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const gx = btw(r, 142, 166), k = btw(r, .94, 1.06), base = 168, yc = base - 56 * k, sd = "#DCCDA8", sh = "#BFAE88", q = "#5E8C7A";
          s += hills(146, { spring: "#A8B98A", summer: "#7E9A6E", autumn: "#B89A5E", winter: "#9A958A" }[sea], r, 10);
          s += `<rect x="0" y="${base}" width="300" height="${200 - base}" fill="#CDBFA4"/>`;
          for (const sx of [-1, 1]) { const px = gx + sx * 104 * k; s += `<rect x="${f1(px - 16 * k)}" y="${f1(base - 38 * k)}" width="${f1(32 * k)}" height="${f1(38 * k)}" fill="${sd}"/><path d="M${f1(px - 19 * k)} ${f1(base - 38 * k)} L${f1(px)} ${f1(base - 48 * k)} L${f1(px + 19 * k)} ${f1(base - 38 * k)} Z" fill="${sh}"/><rect x="${f1(px - 10 * k)}" y="${f1(base - 30 * k)}" width="${f1(6 * k)}" height="${f1(30 * k)}" fill="#A89A7C"/><rect x="${f1(px + 4 * k)}" y="${f1(base - 30 * k)}" width="${f1(6 * k)}" height="${f1(30 * k)}" fill="#A89A7C"/>`; }
          for (let i = 0; i < 6; i++) { const x = gx + (-70 + i * 28) * k; s += `<rect x="${f1(x - 4.5 * k)}" y="${f1(yc)}" width="${f1(9 * k)}" height="${f1(56 * k)}" fill="${sd}"/><rect x="${f1(x + 2 * k)}" y="${f1(yc)}" width="${f1(2.5 * k)}" height="${f1(56 * k)}" fill="${sh}"/><rect x="${f1(x - 6 * k)}" y="${f1(yc)}" width="${f1(12 * k)}" height="${f1(3 * k)}" fill="${sh}"/><rect x="${f1(x - 6 * k)}" y="${f1(base - 3 * k)}" width="${f1(12 * k)}" height="${f1(3 * k)}" fill="${sh}"/>`; }
          s += `<rect x="${f1(gx - 80 * k)}" y="${f1(yc - 12 * k)}" width="${f1(160 * k)}" height="${f1(12 * k)}" fill="${sd}"/><rect x="${f1(gx - 80 * k)}" y="${f1(yc - 4 * k)}" width="${f1(160 * k)}" height="${f1(1.6 * k)}" fill="${sh}"/>`;
          for (let j = 0; j < 20; j++) s += `<rect x="${f1(gx + (-77 + j * 8) * k)}" y="${f1(yc - 11 * k)}" width="${f1(1.6 * k)}" height="${f1(6 * k)}" fill="${sh}"/>`;
          const yq = yc - 30 * k;
          s += `<rect x="${f1(gx - 58 * k)}" y="${f1(yc - 26 * k)}" width="${f1(116 * k)}" height="${f1(14 * k)}" fill="${sd}"/><rect x="${f1(gx - 44 * k)}" y="${f1(yc - 23 * k)}" width="${f1(88 * k)}" height="${f1(8 * k)}" fill="${sh}" opacity=".6"/><rect x="${f1(gx - 30 * k)}" y="${f1(yq)}" width="${f1(60 * k)}" height="${f1(4 * k)}" fill="${sd}"/>`;
          s += `<rect x="${f1(gx - 10 * k)}" y="${f1(yq - 10 * k)}" width="${f1(20 * k)}" height="${f1(10 * k)}" fill="${q}"/>`;
          for (const hx of [-19, -8, 8, 19]) { const X = gx + hx * k, o = hx < 0 ? -1.5 : 1.5; s += `<path d="M${f1(X - 3.5 * k)} ${f1(yq)} V${f1(yq - 9 * k)} L${f1(X + (o - 2) * k)} ${f1(yq - 16 * k)} L${f1(X + (o - 1) * k)} ${f1(yq - 21 * k)} L${f1(X + (o + 2) * k)} ${f1(yq - 19 * k)} L${f1(X + 2.5 * k)} ${f1(yq - 12 * k)} L${f1(X + 3.5 * k)} ${f1(yq - 9 * k)} V${f1(yq)} Z" fill="${q}"/>`; }
          s += `<path d="M${f1(gx - 3 * k)} ${f1(yq - 9 * k)} L${f1(gx - 2.5 * k)} ${f1(yq - 24 * k)} L${f1(gx + 2.5 * k)} ${f1(yq - 24 * k)} L${f1(gx + 3 * k)} ${f1(yq - 9 * k)} Z M${f1(gx - 2 * k)} ${f1(yq - 21 * k)} L${f1(gx - 9 * k)} ${f1(yq - 29 * k)} L${f1(gx - 4 * k)} ${f1(yq - 15 * k)} Z" fill="${q}"/><circle cx="${f1(gx)}" cy="${f1(yq - 27 * k)}" r="${f1(2.6 * k)}" fill="${q}"/>`;
          s += `<path d="M${f1(gx + 2 * k)} ${f1(yq - 21 * k)} L${f1(gx + 6 * k)} ${f1(yq - 45 * k)}" stroke="${q}" stroke-width="${f1(1.4 * k)}"/><circle cx="${f1(gx + 5.6 * k)}" cy="${f1(yq - 41 * k)}" r="${f1(3.2 * k)}" fill="none" stroke="${q}" stroke-width="${f1(1.2 * k)}"/><path d="M${f1(gx + 2 * k)} ${f1(yq - 46 * k)} L${f1(gx + 6 * k)} ${f1(yq - 49 * k)} L${f1(gx + 10 * k)} ${f1(yq - 46 * k)} L${f1(gx + 6 * k)} ${f1(yq - 44 * k)} Z" fill="${q}"/>`;
          perch.push([gx + 6 * k, yq - 49 * k], [gx - 48 * k, yc - 26 * k], [gx + 104 * k, base - 48 * k]);
          return { s, l, perch };
        } },
      { id: "fernsehturm", zh: "柏林電視塔",
        see: ["好高好細的塔，中間串著一顆銀色的球", "球裡面有餐廳，會慢慢地轉一圈", "太陽照到銀球上，會亮出一個十字"],
        spots: ["天線的紅白尖頂上", "銀色圓球的頂上", "旁邊老教堂的尖塔上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const tx = btw(r, 168, 205), sy = 72, mx = btw(r, 52, 80), cn = "#DDD9D0";
          s += `<rect x="0" y="172" width="300" height="28" fill="#BDB6A8"/>`;
          s += `<rect x="${f1(mx - 14)}" y="108" width="16" height="64" fill="#A8563E"/><path d="M${f1(mx - 16)} 108 L${f1(mx - 6)} 76 L${f1(mx + 4)} 108 Z" fill="#5E8C7A"/><rect x="${f1(mx + 2)}" y="140" width="52" height="32" fill="#A8563E"/><path d="M${f1(mx + 2)} 140 L${f1(mx + 8)} 128 L${f1(mx + 50)} 128 L${f1(mx + 56)} 140 Z" fill="#6E4A3A"/>`;
          for (let i = 0; i < 4; i++) s += `<path d="M${f1(mx + 9 + i * 12)} 164 V152 L${f1(mx + 11.5 + i * 12)} 147 L${f1(mx + 14 + i * 12)} 152 V164 Z" fill="#5A3A2E"/>`;
          s += `<path d="M${f1(tx - 8)} 172 L${f1(tx - 3.5)} 86 L${f1(tx + 3.5)} 86 L${f1(tx + 8)} 172 Z" fill="${cn}"/><path d="M${f1(tx)} 172 V86 H${f1(tx + 3.5)} L${f1(tx + 8)} 172 Z" fill="#C6C1B6"/><rect x="${f1(tx - 2.5)}" y="46" width="5" height="14" fill="${cn}"/>`;
          for (let i = 0; i < 7; i++) s += `<rect x="${f1(tx - 1.3)}" y="${41 - i * 5}" width="2.6" height="5" fill="${i % 2 ? "#F1EEE8" : "#C8302A"}"/>`;
          s += `<circle cx="${f1(tx)}" cy="${sy}" r="14" fill="#B7BDC4"/><rect x="${f1(tx - 12.6)}" y="66" width="25.2" height="4" fill="#5C6670"/><rect x="${f1(tx - 12.8)}" y="76" width="25.6" height="1.6" fill="#8E959C"/><ellipse cx="${f1(tx - 5)}" cy="63" rx="4" ry="2.4" fill="#E3E7EA" opacity=".85"/>`;
          let p = `M${f1(tx - 46)} 172 V160`; for (let i = 0; i < 8; i++) p += " l6 -7 l5.5 7";
          s += `<path d="${p} V172 Z" fill="#E8E2D6" stroke="#B5AE9F" stroke-width=".8"/>`;
          for (const x of [btw(r, 8, 36), btw(r, 118, 136), btw(r, 240, 292)]) s += tree(x, btw(r, 178, 188), btw(r, 1, 1.25), sea, r);
          perch.push([tx, 11], [tx + 8, 60.5], [mx - 6, 76]);
          return { s, l, perch };
        } },
      { id: "reichstag", zh: "國會大廈",
        see: ["老石頭房子的頂上，蓋著一個玻璃圓頂", "人們沿著圓頂裡的斜坡一圈圈往上走", "屋角的塔上飄著黑紅金三色的旗子"],
        spots: ["玻璃圓頂的頂上", "屋角塔樓的旗桿上", "門口三角形的屋簷上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const bx = btw(r, 142, 166), st = "#CFC2A6", dr = "#BFB193", wn = "#6E6458";
          s += `<rect x="0" y="164" width="300" height="36" fill="${{ spring: "#9DB88A", summer: "#86A86E", autumn: "#A9A878", winter: "#B8BBA8" }[sea]}"/>`;
          s += `<path d="M${f1(bx - 30)} 106 A30 30 0 0 1 ${f1(bx + 30)} 106 Z" fill="#C4D6DE" stroke="#6E7E86" stroke-width="1"/>`;
          let g = `M${f1(bx)} 106 V76 `; for (const j of [10, 20]) g += `M${f1(bx - j)} 106 A${j} 30 0 0 1 ${f1(bx + j)} 106 `;
          for (const t of [.35, .65, .88]) { const y = 106 - 30 * t, h = 30 * Math.sqrt(1 - t * t); g += `M${f1(bx - h)} ${f1(y)} H${f1(bx + h)} `; }
          s += `<path d="${g}" stroke="#6E7E86" stroke-width=".8" fill="none"/><rect x="${f1(bx - 5)}" y="73" width="10" height="3.5" fill="#6E7E86"/>`;
          s += `<rect x="${f1(bx - 92)}" y="103" width="184" height="4" fill="${dr}"/><rect x="${f1(bx - 90)}" y="106" width="180" height="58" fill="${st}"/>`;
          for (const sx of [-1, 1]) {
            const X = bx + sx * 87;
            s += `<rect x="${f1(X - 13)}" y="92" width="26" height="72" fill="${st}"/><rect x="${f1(X - 14)}" y="89" width="28" height="4" fill="${dr}"/>`;
            for (const y of [100, 120, 142]) s += `<rect x="${f1(X - 8)}" y="${y}" width="5" height="9" fill="${wn}"/><rect x="${f1(X + 3)}" y="${y}" width="5" height="9" fill="${wn}"/>`;
            for (let xx = 0; xx < 3; xx++) for (const y of [114, 132, 148]) s += `<rect x="${f1(bx + sx * (52 + xx * 9) - 2)}" y="${y}" width="4" height="7" fill="${wn}"/>`;
            s += `<path d="M${f1(X)} 89 V70" stroke="#5A5048" stroke-width="1"/><rect x="${f1(X)}" y="70" width="12" height="2.4" fill="#2B2B2B"/><rect x="${f1(X)}" y="72.4" width="12" height="2.4" fill="#C8302A"/><rect x="${f1(X)}" y="74.8" width="12" height="2.4" fill="#E2B84A"/>`;
          }
          s += `<rect x="${f1(bx - 40)}" y="120" width="80" height="38" fill="#8E846E"/>`;
          for (let i = 0; i < 6; i++) s += `<rect x="${f1(bx - 37.5 + i * 14)}" y="120" width="5" height="38" fill="#E2D7BE"/>`;
          s += `<rect x="${f1(bx - 44)}" y="114" width="88" height="7" fill="${dr}"/><rect x="${f1(bx - 30)}" y="116.4" width="60" height="1.8" fill="${wn}"/><path d="M${f1(bx - 46)} 114 L${f1(bx)} 97 L${f1(bx + 46)} 114 Z" fill="${st}" stroke="${dr}" stroke-width="1.2"/><rect x="${f1(bx - 48)}" y="158" width="96" height="6" fill="#D9CEB6"/>`;
          s += tree(btw(r, 8, 30), btw(r, 178, 186), 1.2, sea, r) + tree(btw(r, 272, 294), btw(r, 178, 186), 1.1, sea, r);
          perch.push([bx, 73], [bx + 87, 70], [bx, 97]);
          return { s, l, perch };
        } },
      { id: "eastside", zh: "東邊畫廊",
        see: ["一段長長的老圍牆，整面都畫滿了畫", "有一幅畫是一輛小汽車衝破了牆", "這道牆的後面，就是施普雷河的河邊"],
        spots: ["圍牆圓圓的頂上", "牆後的樹枝上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          for (let i = 0; i < 5; i++) s += tree(btw(r, 0, 300), 130, btw(r, 1.2, 1.6), sea, r);
          s += `<rect x="0" y="168" width="300" height="32" fill="#B4ADA0"/><rect x="0" y="188" width="300" height="12" fill="#8D8C86"/>`;
          const w = 30, x0 = btw(r, -12, 0), s0 = Math.floor(r() * 7);
          for (let i = 0; x0 + i * w < 300; i++) {
            const X = x0 + i * w, t = 112 + X * .045, T = t + 5, H = 168 - T, cx = X + w / 2, d = (s0 + i) % 7;
            s += `<rect x="${f1(X)}" y="${f1(t)}" width="${w}" height="${f1(168 - t)}" fill="#ECE8DE"/>`;
            if (d === 0) s += `<rect x="${f1(X)}" y="${f1(T + H * .1)}" width="${w}" height="${f1(H * .25)}" fill="#E5574A"/><rect x="${f1(X)}" y="${f1(T + H * .4)}" width="${w}" height="${f1(H * .22)}" fill="#F2C94C"/><rect x="${f1(X)}" y="${f1(T + H * .68)}" width="${w}" height="${f1(H * .22)}" fill="#4F86B8"/>`;
            if (d === 1) s += `<rect x="${f1(X)}" y="${f1(T)}" width="${w}" height="${f1(H)}" fill="#6FA8DC"/><circle cx="${f1(cx)}" cy="${f1(T + H * .45)}" r="10" fill="#F2C94C"/><ellipse cx="${f1(cx + 8)}" cy="${f1(T + H * .52)}" rx="4" ry="3" fill="#E5574A"/><circle cx="${f1(cx + 2)}" cy="${f1(T + H * .36)}" r="1.8" fill="#2B2B2B"/>`;
            if (d === 2) s += `<rect x="${f1(X)}" y="${f1(T)}" width="${w}" height="${f1(H)}" fill="#BFD9EE"/><path d="M${f1(X + 3)} ${f1(T + H * .74)} H${f1(X + w - 3)} V${f1(T + H * .62)} L${f1(X + w - 8)} ${f1(T + H * .48)} H${f1(X + 9)} L${f1(X + 3)} ${f1(T + H * .62)} Z" fill="#F1EEE8" stroke="#2B2B2B" stroke-width=".8"/><rect x="${f1(X + 10)}" y="${f1(T + H * .52)}" width="10" height="4" fill="#5E7A8A"/><circle cx="${f1(X + 9)}" cy="${f1(T + H * .76)}" r="2.6" fill="#2B2B2B"/><circle cx="${f1(X + w - 9)}" cy="${f1(T + H * .76)}" r="2.6" fill="#2B2B2B"/><path d="M${f1(X + 4)} ${f1(T + H * .4)} l-3 -6 M${f1(X + w - 4)} ${f1(T + H * .4)} l3 -6 M${f1(cx)} ${f1(T + H * .38)} v-7" stroke="#6E6458" stroke-width=".9"/>`;
            if (d === 3) s += `<rect x="${f1(X)}" y="${f1(T)}" width="${w}" height="${f1(H)}" fill="#F4A3B4"/><path d="M${f1(cx)} ${f1(T + H * .5 + 8)} C${f1(cx - 13)} ${f1(T + H * .5)} ${f1(cx - 7)} ${f1(T + H * .5 - 10)} ${f1(cx)} ${f1(T + H * .5 - 4)} C${f1(cx + 7)} ${f1(T + H * .5 - 10)} ${f1(cx + 13)} ${f1(T + H * .5)} ${f1(cx)} ${f1(T + H * .5 + 8)} Z" fill="#D9443A"/>`;
            if (d === 4) { s += `<rect x="${f1(X)}" y="${f1(T)}" width="${w}" height="${f1(H)}" fill="#F6E7B0"/>`; ["#E5574A", "#F2A03C", "#6FBF73", "#4F86B8"].forEach((col, k) => { const rr = 12 - k * 3; s += `<path d="M${f1(cx - rr)} 166 A${rr} ${rr} 0 0 1 ${f1(cx + rr)} 166" stroke="${col}" stroke-width="3" fill="none"/>`; }); }
            if (d === 5) s += `<rect x="${f1(X)}" y="${f1(T)}" width="15" height="${f1(H * .55)}" fill="#E5574A"/><rect x="${f1(X + 15)}" y="${f1(T)}" width="15" height="${f1(H * .3)}" fill="#F2C94C"/><rect x="${f1(X + 15)}" y="${f1(T + H * .3)}" width="15" height="${f1(H * .7)}" fill="#4F86B8"/><rect x="${f1(X)}" y="${f1(T + H * .55)}" width="15" height="${f1(H * .45)}" fill="#ECE8DE"/>`;
            if (d === 6) { s += `<rect x="${f1(X)}" y="${f1(T)}" width="${w}" height="${f1(H)}" fill="#4F86B8"/>`; for (let k = 0; k < 4; k++) s += `<path d="M${f1(X + 2)} ${f1(T + 8 + k * H / 4.5)} q6.5 -4 13 0 t13 0" stroke="#F1EEE8" stroke-width="1.6" fill="none"/>`; }
            s += `<rect x="${f1(X)}" y="${f1(t)}" width="${w}" height="5" rx="2.5" fill="#D6D1C6"/><path d="M${f1(X)} ${f1(t)} V168" stroke="#A9A396" stroke-width=".9"/>`;
            if (i === 3 || i === 7) perch.push([cx, t]);
          }
          const px = btw(r, 40, 260);
          s += `<path d="M${f1(px - 1.5)} 188 V180 M${f1(px + 1.5)} 188 V180" stroke="#3E4A56" stroke-width="1.8"/><rect x="${f1(px - 3)}" y="170" width="6" height="11" rx="2" fill="${pick(r, ["#C8302A", "#3E6EA0", "#E2B84A"])}"/><circle cx="${f1(px)}" cy="167" r="2.8" fill="#6A4A36"/>`;
          return { s, l, perch };
        } },
      { id: "dom", zh: "柏林大教堂",
        see: ["綠色的大圓頂，最上面立著金色的十字架", "四個角落各有一個小一點的綠圓頂", "教堂前的河上，遊船慢慢地開過去"],
        spots: ["大圓頂的十字架上", "角落小圓頂的頂上", "河邊的石欄上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const dx = btw(r, 150, 180), st = "#B9AE9A", sd = "#A39884", cu = "#5E9480", au = "#D9B44A", wn = "#6E665A";
          s += water(166, "#9CB9C6", "#5F8197", r) + `<rect x="0" y="158" width="300" height="9" fill="#9A9080"/>`;
          s += `<rect x="${f1(dx - 80)}" y="100" width="160" height="58" fill="${st}"/><rect x="${f1(dx - 82)}" y="97" width="164" height="4" fill="${sd}"/>`;
          for (let i = 0; i < 12; i++) { const x = dx - 64 + i * 11.5; if (Math.abs(x - dx) < 26) continue; s += `<path d="M${f1(x - 2.5)} 122 V112 Q${f1(x)} 107 ${f1(x + 2.5)} 112 V122 Z M${f1(x - 2.5)} 150 V136 Q${f1(x)} 131 ${f1(x + 2.5)} 136 V150 Z" fill="${wn}"/>`; }
          for (const sx of [-1, 1]) { const X = dx + sx * 72; s += `<rect x="${f1(X - 10)}" y="78" width="20" height="80" fill="${sd}"/><path d="M${f1(X - 11)} 80 Q${f1(X - 11)} 64 ${f1(X)} 61 Q${f1(X + 11)} 64 ${f1(X + 11)} 80 Z" fill="${cu}"/><rect x="${f1(X - 2.5)}" y="54" width="5" height="8" fill="${cu}"/><path d="M${f1(X)} 54 V47 M${f1(X - 2)} 50 H${f1(X + 2)}" stroke="${au}" stroke-width="1.2"/><path d="M${f1(X - 3)} 104 V94 Q${f1(X)} 89 ${f1(X + 3)} 94 V104 Z" fill="${wn}"/>`; }
          s += `<rect x="${f1(dx - 24)}" y="90" width="48" height="68" fill="#C6BBA6"/><path d="M${f1(dx - 26)} 90 L${f1(dx)} 80 L${f1(dx + 26)} 90 Z" fill="${st}"/><path d="M${f1(dx - 12)} 158 V120 Q${f1(dx - 12)} 104 ${f1(dx)} 104 Q${f1(dx + 12)} 104 ${f1(dx + 12)} 120 V158 Z" fill="${wn}"/>`;
          s += `<rect x="${f1(dx - 27)}" y="64" width="54" height="18" fill="${sd}"/>`;
          for (let j = 0; j < 5; j++) s += `<path d="M${f1(dx - 20 + j * 10 - 2)} 80 V72 Q${f1(dx - 20 + j * 10)} 68 ${f1(dx - 20 + j * 10 + 2)} 72 V80 Z" fill="${wn}"/>`;
          s += `<path d="M${f1(dx - 31)} 66 Q${f1(dx - 31)} 28 ${f1(dx)} 26 Q${f1(dx + 31)} 28 ${f1(dx + 31)} 66 Z" fill="${cu}"/><path d="M${f1(dx - 15)} 65 Q${f1(dx - 14)} 34 ${f1(dx)} 27 M${f1(dx + 15)} 65 Q${f1(dx + 14)} 34 ${f1(dx)} 27 M${f1(dx)} 65 V27" stroke="#4A7A68" stroke-width=".9" fill="none"/>`;
          s += `<rect x="${f1(dx - 5)}" y="17" width="10" height="11" fill="${cu}"/><path d="M${f1(dx - 6)} 18 Q${f1(dx)} 10 ${f1(dx + 6)} 18 Z" fill="${cu}"/><path d="M${f1(dx)} 13 V4 M${f1(dx - 3)} 7.5 H${f1(dx + 3)}" stroke="${au}" stroke-width="1.5"/>`;
          if (r() < .65) s += boat(btw(r, 10, 220), btw(r, 178, 186), 1.6, false);
          perch.push([dx, 10], [dx + 72, 47], [btw(r, 20, 280), 158]);
          return { s, l, perch };
        } },
      { id: "oberbaum", zh: "奧伯鮑姆橋",
        see: ["紅磚橋分成兩層，上層跑著黃色的地鐵", "橋的中間有兩座像城堡一樣的高塔", "下層有車子和行人，還有好多腳踏車"],
        spots: ["高塔的尖頂上", "黃色地鐵的車頂上", "磚拱上面的欄杆邊"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const bx = btw(r, 140, 170), br = "#A8483A", bd = "#8E3A2E", sn = "#D8C8A8", wd = "#5F8197";
          s += water(152, "#9CB9C6", wd, r);
          for (const X of [bx - 18, bx + 18]) {
            s += `<rect x="${f1(X - 9)}" y="52" width="18" height="100" fill="${bd}"/><rect x="${f1(X - 10)}" y="72" width="20" height="2" fill="${sn}"/><path d="M${f1(X - 3)} 68 V60 Q${f1(X)} 55 ${f1(X + 3)} 60 V68 Z M${f1(X - 3)} 92 V82 Q${f1(X)} 77 ${f1(X + 3)} 82 V92 Z" fill="#3E2A24"/>`;
            for (let j = 0; j < 4; j++) s += `<rect x="${f1(X - 10 + j * 5.5)}" y="46" width="3" height="7" fill="${bd}"/>`;
            s += `<path d="M${f1(X - 5)} 47 L${f1(X)} 28 L${f1(X + 5)} 47 Z" fill="#6E3028"/>`;
          }
          s += `<rect x="0" y="100" width="300" height="6" fill="${br}"/>`;
          for (let x = bx % 14 - 14; x < 300; x += 14) s += `<rect x="${f1(x)}" y="106" width="4" height="17" fill="${br}"/><path d="M${f1(x + 4)} 106 V114 Q${f1(x + 9)} 104 ${f1(x + 14)} 114 V106 Z" fill="${br}"/>`;
          s += `<rect x="0" y="122" width="300" height="3" fill="${sn}"/><rect x="0" y="124" width="300" height="30" fill="${br}"/>`;
          for (let ax = bx - 44 * Math.floor((bx + 17) / 44); ax < 320; ax += 44) s += `<path d="M${f1(ax - 17)} 154 V146 A17 14 0 0 1 ${f1(ax + 17)} 146 V154 Z" fill="${wd}"/><path d="M${f1(ax - 17)} 146 A17 14 0 0 1 ${f1(ax + 17)} 146" stroke="${sn}" stroke-width="1.4" fill="none"/>`;
          const tx = btw(r, 10, 120);
          for (let k = 0; k < 3; k++) { const X = tx + k * 44; s += `<rect x="${f1(X)}" y="86" width="42" height="14" rx="3" fill="#F2C230"/><rect x="${f1(X)}" y="96" width="42" height="2" fill="#3B4A55"/>`; for (let w = 0; w < 4; w++) s += `<rect x="${f1(X + 4 + w * 9.5)}" y="89" width="6" height="5" fill="#3B4A55"/>`; }
          perch.push([bx + 18, 28], [tx + 64, 86], [Math.min(290, bx + 70), 100]);
          return { s, l, perch };
        } },
    ],
  },
  amsterdam: {
    zh: "阿姆斯特丹", de: "Amsterdam", gift: "一雙小小的木鞋",
    sights: [
      { id: "grachten", zh: "運河屋",
        see: ["房子又窄又高，一間緊緊挨著一間", "屋頂下伸出一根木樑，用來把家具吊上樓", "有幾間站得歪歪的，好像靠在隔壁身上"],
        spots: ["山牆的尖頂上", "吊貨的木樑上", "小石橋的欄杆上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          s += water(158, "#8FAFB8", "#4F7380", r) + `<rect x="0" y="150" width="300" height="9" fill="#6E6258"/>`;
          const cols = ["#7A4A38", "#5A3A30", "#3E3A3A", "#A0705A", "#C8B89A", "#2F3E3A", "#8C5A3C", "#B8A07E"];
          const G = [[[0, 0], [0, 6], [.18, 6], [.18, 12], [.34, 12], [.34, 18], [.66, 18], [.66, 12], [.82, 12], [.82, 6], [1, 6], [1, 0]],
            [[0, 0], [.14, 3], [.28, 8], [.3, 20], [.7, 20], [.72, 8], [.86, 3], [1, 0]],
            [[0, 0], [.08, 6], [.24, 10], [.3, 16], [.38, 21], [.5, 23], [.62, 21], [.7, 16], [.76, 10], [.92, 6], [1, 0]],
            [[0, 0], [.5, 16], [1, 0]]];
          let x = btw(r, 4, 14), g = Math.floor(r() * 4), ci = Math.floor(r() * 8), n = 0, win = "", dr = "";
          while (x < 284 && n < 11) {
            const w = Math.min(btw(r, 25, 32), 298 - x), h = btw(r, 60, 80) - (x < 110 ? 14 : 0), t = 150 - h, ln = btw(r, -2.5, 2.5), col = cols[ci = (ci + 1 + Math.floor(r() * 3)) % 8], X = x + ln;
            g = (g + 1) % 4; const gp = G[g], top = Math.max(...gp.map((p) => p[1]));
            s += `<path d="M${f1(x)} 150 L${f1(X)} ${f1(t)} L${f1(X + w)} ${f1(t)} L${f1(x + w)} 150 Z" fill="${col}"/><path d="M${gp.map(([a, b]) => `${f1(X + a * w)} ${f1(t - b + .5)}`).join(" L")} Z" fill="${col}" stroke="#EFE9DD" stroke-width=".9"/><rect x="${f1(x)}" y="161" width="${f1(w)}" height="12" fill="${col}" opacity=".22"/>`;
            const nw = w >= 29 ? 3 : 2, gap = (w - nw * 5) / (nw + 1);
            for (let wy = t + 6; wy < 132; wy += 13) for (let j = 0; j < nw; j++) win += `M${f1(x + ln * (1 - (wy - t) / h) + gap + j * (5 + gap))} ${f1(wy)}h5v8h-5Z`;
            dr += `M${f1(x + w / 2 - 3)} 139h6v11h-6Z M${f1(X + w / 2)} ${f1(t - top + 5)}h5v1.6h-5Z`;
            if (n === 3 || n === 6) perch.push([X + w / 2, t - top]);
            x += w + .4; n++;
          }
          s += `<path d="${win}" fill="#2F3A40" stroke="#EFE9DD" stroke-width=".8"/><path d="${dr}" fill="#2B2B2B"/>`;
          const bq = btw(r, 196, 236);
          s += `<path d="M${f1(bq - 36)} 166 Q${f1(bq)} 146 ${f1(bq + 36)} 166 V172 H${f1(bq + 20)} Q${f1(bq)} 156 ${f1(bq - 20)} 172 H${f1(bq - 36)} Z" fill="#8E5444"/><path d="M${f1(bq - 36)} 160 Q${f1(bq)} 140 ${f1(bq + 36)} 160" stroke="#2E3236" stroke-width="1.2" fill="none"/>`;
          for (let i = -3; i <= 3; i++) { const px = bq + i * 10, py = 156 - 10 * (1 - (i * i) / 13); s += `<path d="M${f1(px)} ${f1(py + 6)} V${f1(py)}" stroke="#2E3236" stroke-width=".8"/>`; }
          perch.push([bq, 150]);
          if (r() < .7) { const b = btw(r, 30, 110); s += `<rect x="${f1(b)}" y="178" width="76" height="7" rx="3" fill="#3E4A56"/><rect x="${f1(b + 6)}" y="171" width="64" height="8" rx="4" fill="#B9D0D8" stroke="#3E4A56" stroke-width=".8"/>`; }
          s += tree(btw(r, 2, 8), 152, 1.5, sea, r);
          return { s, l, perch };
        } },
      { id: "molen", zh: "桑斯安斯風車村",
        see: ["綠色的木頭風車，四片大扇葉慢慢地轉", "風車旁邊是一排綠色的小木屋", "河邊的風一直吹，羽毛都被吹亂了"],
        spots: ["風車頂的木蓋上", "風車的走廊欄杆上", "小木屋的屋頂上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const gr = { spring: "#8DB06A", summer: "#6E9A52", autumn: "#9A9A5A", winter: "#A9AE98" }[sea];
          const mx = btw(r, 178, 212), hy = 78, R = 54, a0 = btw(r, 0, Math.PI / 2), d1 = btw(r, 22, 40), wo = "#6A4A36";
          s += `<rect x="0" y="146" width="300" height="30" fill="${gr}"/>` + water(170, "#9CB9C6", "#5F8197", r);
          for (const dx of [d1, d1 + btw(r, 36, 46)]) s += `<path d="M${f1(dx - 4)} 147 L${f1(dx - 2.5)} 128 L${f1(dx + 2.5)} 128 L${f1(dx + 4)} 147 Z" fill="#7E8A86"/><path d="M${f1(dx - 9)} 119 L${f1(dx + 9)} 137 M${f1(dx + 9)} 119 L${f1(dx - 9)} 137" stroke="#7E8A86" stroke-width="1.4"/>`;
          const hx = btw(r, 104, 116);
          for (const x of [hx, hx + 28]) s += `<rect x="${f1(x)}" y="130" width="22" height="20" fill="#4F7A5A"/><path d="M${f1(x - 2)} 130 L${f1(x + 11)} 116 L${f1(x + 24)} 130 Z" fill="#3A3330"/><path d="M${f1(x - 1)} 130 L${f1(x + 11)} 117 L${f1(x + 23)} 130" stroke="#F2EEE6" stroke-width="1.2" fill="none"/><rect x="${f1(x + 4)}" y="135" width="5" height="6" fill="#F2EEE6"/><rect x="${f1(x + 13)}" y="138" width="5" height="12" fill="#F2EEE6"/>`;
          s += `<rect x="${f1(mx - 24)}" y="128" width="48" height="24" fill="#3F6A4E"/><rect x="${f1(mx - 4)}" y="138" width="8" height="14" fill="#F2EEE6"/><path d="M${f1(mx - 17)} 128 L${f1(mx - 10)} ${hy + 2} L${f1(mx + 10)} ${hy + 2} L${f1(mx + 17)} 128 Z" fill="#4F7A5A"/><path d="M${f1(mx - 5)} 127 L${f1(mx - 3)} ${hy + 3} M${f1(mx + 5)} 127 L${f1(mx + 3)} ${hy + 3}" stroke="#3F6A4E" stroke-width="1"/>`;
          s += `<rect x="${f1(mx - 32)}" y="126" width="64" height="3" fill="${wo}"/><path d="M${f1(mx - 32)} 126 V120 H${f1(mx + 32)} V126 M${f1(mx - 16)} 126 V120 M${f1(mx + 16)} 126 V120" stroke="${wo}" stroke-width="1" fill="none"/>`;
          s += `<path d="M${f1(mx - 12)} ${hy + 3} Q${f1(mx - 12)} ${hy - 12} ${f1(mx)} ${hy - 13} Q${f1(mx + 12)} ${hy - 12} ${f1(mx + 12)} ${hy + 3} Z" fill="#3A3330"/>`;
          const pt = (x, y) => `${f1(x)} ${f1(y)}`;
          for (let q = 0; q < 4; q++) {
            const a = a0 + q * Math.PI / 2, ux = Math.cos(a), uy = Math.sin(a), px = -uy * 10, py = ux * 10;
            const A = [mx + ux * R * .2, hy + uy * R * .2], B = [mx + ux * R, hy + uy * R];
            s += `<path d="M${pt(A[0], A[1])} L${pt(B[0], B[1])} L${pt(B[0] + px, B[1] + py)} L${pt(A[0] + px, A[1] + py)} Z" fill="#EDE6D6" fill-opacity=".85" stroke="${wo}" stroke-width=".8"/>`;
            let lt = `M${pt(A[0] + px / 2, A[1] + py / 2)} L${pt(B[0] + px / 2, B[1] + py / 2)} `;
            for (let m = 1; m < 6; m++) { const t = .2 + m * .8 / 6, Q = [mx + ux * R * t, hy + uy * R * t]; lt += `M${pt(Q[0], Q[1])} L${pt(Q[0] + px, Q[1] + py)} `; }
            s += `<path d="${lt}" stroke="${wo}" stroke-width=".6" fill="none"/><path d="M${mx.toFixed(1)} ${hy} L${pt(B[0], B[1])}" stroke="#5A4232" stroke-width="2.2"/>`;
          }
          s += `<circle cx="${f1(mx)}" cy="${hy}" r="3" fill="#3A3330"/>`;
          perch.push([mx, hy - 13], [mx + 26, 120], [hx + 11, 116]);
          return { s, l, perch };
        } },
      { id: "tulpen", zh: "鬱金香花田",
        see: ["花田一條一條排得好直，一路排到天邊", "遠遠的地平線上，站著一座小風車", "每一條田都是不一樣的顏色"],
        spots: ["田邊的木頭柱子上", "遠處風車的頂上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const hz = 130, vx = btw(r, 140, 200), vy = 100, P = ["#D9443A", "#F2C94C", "#E98AA8", "#8E5BA8", "#F08A3C", "#F4EFE6", "#C23A5A"], off = Math.floor(r() * 7);
          s += hills(127, "#8FA67E", r, 5);
          for (let i = 0; i < 4; i++) s += tree(btw(r, 0, 300), 130, .5, sea, r);
          s += `<rect x="0" y="${hz}" width="300" height="70" fill="${P[off]}"/>`;
          let ln = "";
          for (let j = -12; j <= 12; j++) {
            const a = vx + j * 60, b = a + 60, ta = vx + (a - vx) * .3, tb = vx + (b - vx) * .3;
            if (Math.max(b, tb) < 0 || Math.min(a, ta) > 300) continue;
            s += `<path d="M${f1(a)} 200 L${f1(b)} 200 L${f1(tb)} ${hz} L${f1(ta)} ${hz} Z" fill="${P[(j + 12 + off) % 7]}"/>`;
            ln += `M${f1(a)} 200 L${f1(ta)} ${hz} `;
          }
          s += `<path d="${ln}" stroke="#5E7A46" stroke-width="2" fill="none"/>`;
          let st = "", hd = "";
          for (let i = 0; i < 26; i++) {
            const y = btw(r, 174, 198), x = btw(r, 0, 300), xb = vx + (x - vx) * 100 / (y - vy), j = Math.floor((xb - vx) / 60), col = P[((j + 12 + off) % 7 + 7) % 7], z = .8 + (y - 174) / 36;
            st += `M${f1(x)} ${f1(y)}v${f1(6 * z)}`;
            hd += `<path d="M${f1(x - 2.6 * z)} ${f1(y)}q0 ${f1(-5 * z)} ${f1(2.6 * z)} ${f1(-5.4 * z)}q${f1(2.6 * z)} ${f1(.4 * z)} ${f1(2.6 * z)} ${f1(5.4 * z)}Z" fill="${col}" stroke="#7A3A2A" stroke-width=".4"/>`;
          }
          s += `<path d="${st}" stroke="#4E7A3A" stroke-width="1"/>${hd}`;
          const wx = vx > 170 ? btw(r, 222, 262) : btw(r, 232, 270), a = btw(r, 0, 1.5), sx = Math.cos(a) * 16, sy = Math.sin(a) * 16;
          s += `<path d="M${f1(wx - 6)} 131 L${f1(wx - 3.5)} 110 L${f1(wx + 3.5)} 110 L${f1(wx + 6)} 131 Z" fill="#5A4A40"/><path d="M${f1(wx - 4)} 110 Q${f1(wx)} 104 ${f1(wx + 4)} 110 Z" fill="#3A3330"/><path d="M${f1(wx - sx)} ${f1(109 - sy)} L${f1(wx + sx)} ${f1(109 + sy)} M${f1(wx + sy)} ${f1(109 - sx)} L${f1(wx - sy)} ${f1(109 + sx)}" stroke="#5A4A40" stroke-width="2"/>`;
          const fx = btw(r, 22, 60);
          s += `<rect x="${f1(fx - 2)}" y="158" width="4" height="30" fill="#7A5A3A"/><rect x="${f1(fx + 40)}" y="162" width="3.5" height="26" fill="#7A5A3A"/><path d="M${f1(fx)} 164 L${f1(fx + 42)} 167" stroke="#5A4A40" stroke-width=".9"/>`;
          perch.push([fx, 158], [wx, 104.5]);
          return { s, l, perch };
        } },
      { id: "rijks", zh: "國家博物館",
        see: ["紅磚房子上有兩座尖尖的塔", "房子中間開了一條通道，腳踏車可以騎過去", "林布蘭的大畫《夜巡》就掛在裡面"],
        spots: ["尖塔的頂上", "斜屋頂的屋脊上", "門前水池的邊上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const cx = btw(r, 152, 172), k = btw(r, .95, 1.04), br = "#A9563E", sl = "#3E4A52", sn = "#E3D4B8", wn = "#3E3A3A";
          s += `<rect x="0" y="164" width="300" height="36" fill="${{ spring: "#9DB08A", summer: "#86A86E", autumn: "#A9A878", winter: "#B8BBA8" }[sea]}"/><rect x="0" y="164" width="300" height="8" fill="#B9B2A4"/><rect x="${f1(cx - 90)}" y="178" width="180" height="14" fill="#8FB4C2"/><path d="M${f1(cx - 60)} 184 q4 -2 8 0 t8 0 M${f1(cx + 30)} 187 q4 -2 8 0 t8 0" stroke="#fff" stroke-opacity=".6" stroke-width=".9" fill="none"/>`;
          for (const sx of [-1, 1]) {
            const X0 = cx + sx * 100 * k, a = Math.min(cx + sx * 36 * k, cx + sx * 90 * k), b = Math.max(cx + sx * 36 * k, cx + sx * 90 * k);
            s += `<path d="M${f1(a - 2)} 110 L${f1(a + 6)} 94 L${f1(b - 6)} 94 L${f1(b + 2)} 110 Z" fill="${sl}"/><rect x="${f1(a)}" y="110" width="${f1(b - a)}" height="54" fill="${br}"/>`;
            s += `<rect x="${f1(X0 - 12 * k)}" y="98" width="${f1(24 * k)}" height="66" fill="${br}"/><path d="M${f1(X0 - 13 * k)} 98 L${f1(X0)} 74 L${f1(X0 + 13 * k)} 98 Z" fill="${sl}"/>`;
          }
          s += `<rect x="${f1(cx - 36 * k)}" y="100" width="${f1(72 * k)}" height="64" fill="${br}"/><path d="M${f1(cx - 16 * k)} 100 L${f1(cx)} 80 L${f1(cx + 16 * k)} 100 Z" fill="${br}" stroke="${sn}" stroke-width="1"/>`;
          for (const sx of [-1, 1]) { const T = cx + sx * 24 * k; s += `<rect x="${f1(T - 9 * k)}" y="72" width="${f1(18 * k)}" height="92" fill="${br}"/><rect x="${f1(T - 9 * k)}" y="72" width="${f1(2 * k)}" height="92" fill="${sn}" opacity=".7"/><path d="M${f1(T - 11 * k)} 74 L${f1(T)} 30 L${f1(T + 11 * k)} 74 Z" fill="${sl}"/><path d="M${f1(T - 3)} 62 L${f1(T)} 56 L${f1(T + 3)} 62 Z" fill="#5A6670"/><path d="M${f1(T)} 30 V24" stroke="#D9B44A" stroke-width="1.4"/><path d="M${f1(T - 3)} 96 V86 Q${f1(T)} 81 ${f1(T + 3)} 86 V96 Z" fill="${wn}"/>`; }
          s += `<rect x="${f1(cx - 112 * k)}" y="126" width="${f1(224 * k)}" height="2" fill="${sn}"/><rect x="${f1(cx - 112 * k)}" y="148" width="${f1(224 * k)}" height="2" fill="${sn}"/>`;
          for (let xx = cx - 86 * k; xx < cx + 88 * k; xx += 10 * k) { if (Math.abs(xx - cx) < 15 * k) continue; s += `<rect x="${f1(xx - 2)}" y="113" width="4" height="8" fill="${wn}"/><path d="M${f1(xx - 2.2)} 144 V135 Q${f1(xx)} 131 ${f1(xx + 2.2)} 135 V144 Z" fill="${wn}"/>`; }
          s += `<path d="M${f1(cx - 14 * k)} 164 V140 Q${f1(cx - 14 * k)} 126 ${f1(cx)} 126 Q${f1(cx + 14 * k)} 126 ${f1(cx + 14 * k)} 140 V164 Z" fill="#3A2E2A"/>`;
          if (r() < .6) { const bx = cx + btw(r, -6, 6); s += `<path d="M${f1(bx - 4)} 160 a3 3 0 1 0 .1 0 M${f1(bx + 4)} 160 a3 3 0 1 0 .1 0 M${f1(bx - 4)} 163 L${f1(bx)} 158 L${f1(bx + 4)} 163 M${f1(bx)} 158 V151" stroke="#D8D2C6" stroke-width=".9" fill="none"/><circle cx="${f1(bx)}" cy="149" r="1.8" fill="#D8D2C6"/>`; }
          s += tree(btw(r, 6, 24), btw(r, 178, 188), 1.2, sea, r) + tree(btw(r, 276, 294), btw(r, 178, 188), 1.2, sea, r);
          perch.push([cx - 24 * k, 24], [cx + 70 * k, 94], [cx + btw(r, -60, 60), 178]);
          return { s, l, perch };
        } },
      { id: "centraal", zh: "阿姆斯特丹中央車站",
        see: ["長長的紅磚車站，看起來像一座宮殿", "右邊的塔是時鐘，左邊的塔看風往哪吹", "車站門口有好多電車和腳踏車"],
        spots: ["鐘塔的尖頂上", "正門的山牆上", "電車的車頂上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const cx = btw(r, 146, 160), L = cx - 136, R = cx + 136, br = "#A9563E", sl = "#4A525A", sn = "#E3D4B8", au = "#D9B44A", wn = "#3E4A55";
          s += water(176, "#9CB9C6", "#5F8197", r) + `<rect x="0" y="160" width="300" height="17" fill="#A8A090"/>`;
          let rb = ""; for (let i = 1; i < 10; i++) { const x = cx - 110 + i * 24, t = i / 10; rb += `M${f1(x)} ${f1(114 - 104 * t * (1 - t))} V114 `; }
          s += `<path d="M${f1(cx - 110)} 114 Q${f1(cx + 10)} 62 ${f1(cx + 130)} 114 Z" fill="#A8B4BA"/><path d="${rb}" stroke="#7E8A92" stroke-width=".9"/>`;
          s += `<path d="M${f1(L - 2)} 114 L${f1(L + 6)} 104 L${f1(R - 6)} 104 L${f1(R + 2)} 114 Z" fill="${sl}"/><rect x="${f1(L)}" y="114" width="${f1(R - L)}" height="46" fill="${br}"/><rect x="${f1(L)}" y="128" width="${f1(R - L)}" height="2" fill="${sn}"/>`;
          for (let x = L + 6; x < R - 8; x += 9) { if (Math.abs(x + 2 - cx) < 28) continue; s += `<rect x="${f1(x)}" y="117" width="4" height="7" fill="${wn}"/><path d="M${f1(x)} 152 V138 Q${f1(x + 2)} 133 ${f1(x + 4)} 138 V152 Z" fill="${wn}"/>`; }
          for (const X of [L + 12, R - 12]) s += `<rect x="${f1(X - 12)}" y="104" width="24" height="56" fill="${br}"/><path d="M${f1(X - 13)} 104 L${f1(X)} 90 L${f1(X + 13)} 104 Z" fill="${sl}"/>`;
          for (const sx of [-1, 1]) {
            const T = cx + sx * 40;
            s += `<rect x="${f1(T - 8)}" y="64" width="16" height="96" fill="${br}"/><rect x="${f1(T - 8)}" y="64" width="2" height="96" fill="${sn}" opacity=".7"/><rect x="${f1(T - 6)}" y="57" width="12" height="8" fill="${sn}"/><path d="M${f1(T - 7)} 58 Q${f1(T - 7)} 48 ${f1(T)} 45 Q${f1(T + 7)} 48 ${f1(T + 7)} 58 Z" fill="${sl}"/><path d="M${f1(T)} 45 V38" stroke="${au}" stroke-width="1.3"/><circle cx="${f1(T)}" cy="37.5" r="1.5" fill="${au}"/>`;
            s += `<circle cx="${f1(T)}" cy="84" r="6.5" fill="#F2E9D0" stroke="${au}" stroke-width="1.4"/>`;
            s += sx > 0 ? `<path d="M${f1(T)} 84 V79.5 M${f1(T)} 84 H${f1(T + 3.5)}" stroke="#2B2B2B" stroke-width="1"/>` : `<path d="M${f1(T - 4)} 85 L${f1(T + 4)} 83 M${f1(T + 4)} 83 l-2.4 -1.6 M${f1(T + 4)} 83 l-1.6 2.2" stroke="${au}" stroke-width="1.2" fill="none"/>`;
          }
          s += `<rect x="${f1(cx - 24)}" y="92" width="48" height="68" fill="${br}"/><path d="M${f1(cx - 26)} 92 L${f1(cx)} 70 L${f1(cx + 26)} 92 Z" fill="${br}" stroke="${sn}" stroke-width="1.2"/><circle cx="${f1(cx)}" cy="84" r="3" fill="${au}"/>`;
          s += `<path d="M${f1(cx - 14)} 160 V112 Q${f1(cx - 14)} 98 ${f1(cx)} 98 Q${f1(cx + 14)} 98 ${f1(cx + 14)} 112 V160 Z" fill="#5E7A8A" stroke="${sn}" stroke-width="1.2"/><path d="M${f1(cx - 14)} 124 H${f1(cx + 14)} M${f1(cx)} 98 V160 M${f1(cx - 7)} 100 V160 M${f1(cx + 7)} 100 V160" stroke="#9AB0BC" stroke-width=".8"/>`;
          const tr = btw(r, 14, 52);
          s += `<rect x="${f1(tr)}" y="146" width="62" height="16" rx="3" fill="#F1EEE8"/><rect x="${f1(tr)}" y="155" width="62" height="2.4" fill="#3E6EA0"/><path d="M${f1(tr + 30)} 146 l5 -5 l-5 -3" stroke="#2B2B2B" stroke-width=".9" fill="none"/>`;
          for (let k = 0; k < 5; k++) s += `<rect x="${f1(tr + 4 + k * 11.6)}" y="148.5" width="8" height="5" fill="#5E6E78"/>`;
          for (let i = 0; i < 4; i++) { const x = btw(r, 196, 270) , y = 172; s += `<path d="M${f1(x - 4)} ${y} m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M${f1(x + 4)} ${y} m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M${f1(x - 4)} ${y} L${f1(x)} ${y - 4} L${f1(x + 4)} ${y} M${f1(x)} ${y - 4} l1 -2" stroke="${pick(r, ["#2E3236", "#3E6EA0", "#C8302A"])}" stroke-width="1" fill="none"/>`; }
          perch.push([cx + 40, 36], [cx, 70], [tr + 20, 146]);
          return { s, l, perch };
        } },
      { id: "fietsbrug", zh: "運河上的拱橋",
        see: ["橋的鐵欄杆邊，停滿了一整排腳踏車", "橋下的船屋，屋頂上種著好多盆花草", "這裡的腳踏車，比汽車還要多"],
        spots: ["橋上的鐵欄杆上", "腳踏車的坐墊上", "船屋的屋頂上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const bx = btw(r, 140, 166), A = 300 - 2 * bx, sn = "#E3D4B8", ir = "#2E3236";
          const ty = (x) => { const t = Math.abs(A) < 1e-3 ? x / (2 * bx) : (-2 * bx + Math.sqrt(4 * bx * bx + 4 * A * x)) / (2 * A); return 132 - 40 * t * (1 - t); };
          let x = btw(r, -6, 2); const hc = ["#8A6A5A", "#6E5A50", "#9A8A78", "#5E6460", "#A07862"];
          let hw = "";
          while (x < 300) { const w = btw(r, 18, 26), h = btw(r, 34, 50), t = 142 - h; s += `<path d="M${f1(x)} 142V${f1(t)}L${f1(x + w / 2)} ${f1(t - 12)}L${f1(x + w)} ${f1(t)}V142Z" fill="${pick(r, hc)}"/>`; for (const yy of [t + 8]) hw += `M${f1(x + 4)} ${f1(yy)}h4v6h-4Z M${f1(x + w - 8)} ${f1(yy)}h4v6h-4Z`; x += w + .4; }
          s += `<path d="${hw}" fill="#3A3E42"/>`;
          s += `<rect x="0" y="140" width="300" height="7" fill="#6E6258"/>` + water(146, "#8FAFB8", "#4F7380", r);
          s += tree(btw(r, 10, 130), 142, btw(r, 1.2, 1.5), sea, r) + tree(btw(r, 170, 290), 142, btw(r, 1.2, 1.5), sea, r);
          s += `<path d="M0 132 Q${f1(bx)} 112 300 132 V172 H${f1(bx + 56)} A56 34 0 0 0 ${f1(bx - 56)} 172 H0 Z" fill="#8E5444"/><path d="M${f1(bx + 56)} 172 A56 34 0 0 0 ${f1(bx - 56)} 172" stroke="${sn}" stroke-width="3" fill="none"/><path d="M0 132 Q${f1(bx)} 112 300 132" stroke="${sn}" stroke-width="2.4" fill="none"/>`;
          let rl = `M0 123 Q${f1(bx)} 103 300 123 M0 127.5 Q${f1(bx)} 107.5 300 127.5 `; for (let px = 4; px < 300; px += 12) { const y = ty(px); rl += `M${px} ${f1(y)} V${f1(y - 9)} `; }
          s += `<path d="${rl}" stroke="${ir}" stroke-width="1" fill="none"/>`;
          let n = 0, wh = "";
          for (let bxp = btw(r, 8, 18); bxp < 290; bxp += btw(r, 20, 28)) {
            if (Math.abs(bxp - bx - 34) < 9) continue;
            const yb = ty(bxp) + 1, col = pick(r, [ir, "#C8302A", "#3E6EA0", "#E2B84A", "#6E8E5A"]);
            wh += `M${f1(bxp - 12.1)} ${f1(yb - 4.6)}a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0M${f1(bxp + 2.9)} ${f1(yb - 4.6)}a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0`;
            s += `<path d="M${f1(bxp - 7.5)} ${f1(yb - 4.6)}h6.5l4.5 -6.4h-8Z m8 0l4 6.4 M${f1(bxp - 4.5)} ${f1(yb - 11)}l-1 -2.5h3 M${f1(bxp + 3.5)} ${f1(yb - 11)}l.5 -3h2.5" stroke="${col}" stroke-width="1.2" fill="none"/>`;
            if (r() < .35) s += `<rect x="${f1(bxp + 5)}" y="${f1(yb - 14)}" width="5" height="4" fill="#B8864A"/>`;
            if (n++ === 2) perch.push([bxp - 4, yb - 13.5]);
          }
          s += `<path d="${wh}" stroke="${ir}" stroke-width="1" fill="none"/>`;
          const LX = bx + 34, LY = ty(LX);
          s += `<path d="M${f1(LX)} ${f1(LY)} V${f1(LY - 26)}" stroke="${ir}" stroke-width="1.6"/><path d="M${f1(LX - 3)} ${f1(LY - 26)} H${f1(LX + 3)} L${f1(LX + 2)} ${f1(LY - 32)} H${f1(LX - 2)} Z" fill="#F2E3B0" stroke="${ir}" stroke-width=".8"/><path d="M${f1(LX - 3.5)} ${f1(LY - 32)} L${f1(LX)} ${f1(LY - 35)} L${f1(LX + 3.5)} ${f1(LY - 32)} Z" fill="${ir}"/>`;
          const hb = bx > 153 ? btw(r, 12, 44) : btw(r, 196, 224), pl = sea === "winter" ? ["#7E8A6E", "#8C7A5A"] : ["#E5574A", "#F2C94C", "#8BC48A", "#E98AA8"];
          s += `<rect x="${f1(hb)}" y="186" width="74" height="7" fill="#3E4A56"/><rect x="${f1(hb + 6)}" y="174" width="62" height="12" fill="#6E8E5A"/><rect x="${f1(hb + 4)}" y="172" width="66" height="2.5" fill="#4A4038"/>`;
          for (let k = 0; k < 4; k++) s += `<rect x="${f1(hb + 10 + k * 14)}" y="177" width="8" height="6" fill="#DCE7EE"/><rect x="${f1(hb + 10 + k * 15)}" y="168" width="5" height="4" fill="#A8563E"/><circle cx="${f1(hb + 12.5 + k * 15)}" cy="166" r="3.4" fill="${pl[k % pl.length]}"/>`;
          perch.push([LX, LY - 35], [hb + 66, 172]);
          return { s, l, perch };
        } },
    ],
  },
};
