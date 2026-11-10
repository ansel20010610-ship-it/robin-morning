var CITIES_PART = {
  roma: {
    zh: "羅馬", de: "Roma", gift: "一顆在傘松下撿到的松果",
    sights: [
      { id: "colosseo", zh: "羅馬競技場",
        see: ["一層一層的拱門，圍成一個好大的圓", "有一邊的外牆塌了，露出裡面那一圈", "快兩千年前，這裡坐滿了看比賽的人"],
        spots: ["最高那一層的牆頂", "一個拱門的上緣", "塌掉那一邊的斷牆上"],
        draw(c) {
          const { r, sea } = c, k = btw(r, .92, 1.06), x0 = btw(r, 92, 112), w = 165 * k, base = 172, th = 22 * k, X = x0 + w;
          const xb = x0 + w * .55, top = base - 4 * th, low = base - 2.2 * th;
          const P = [[x0, top], [xb, top], [xb + 8, top + th * .5], [xb + 18, top + th * .6], [xb + 26, top + th * 1.2], [xb + 40, top + th * 1.3], [xb + 50, low], [X, low]];
          const topAt = (x) => { for (let i = 1; i < P.length; i++) if (x <= P[i][0]) { const [ax, ay] = P[i - 1], [bx, by] = P[i]; return ay + (by - ay) * (x - ax) / ((bx - ax) || 1); } return low; };
          let s = hills(150, "#A9B48C", r, 8) + `<rect x="0" y="${base}" width="300" height="${200 - base}" fill="#C9B793"/>`;
          s += `<rect x="${f1(xb + 6)}" y="${f1(base - 3 * th + 3)}" width="${f1(X - xb - 16)}" height="${f1(3 * th - 3)}" fill="#B39872"/>`;
          let ia = ""; for (let x = xb + 10; x < X - 16; x += 9) ia += `M${f1(x)} ${f1(low + 1)} v${f1(-th * .42)} q2.5 -4 5 0 v${f1(th * .42)} Z `;
          s += `<path d="${ia}" fill="#6E553F"/>`;
          s += `<path d="M${f1(x0)} ${base} ${P.map(([x, y]) => `L${f1(x)} ${f1(y)}`).join(" ")} L${f1(X)} ${base} Z" fill="#D9C39B"/><rect x="${f1(x0)}" y="${f1(top)}" width="7" height="${f1(base - top)}" fill="#C8B088"/>`;
          const n = 10, cw = (w - 8) / n, aw = cw * .62, ah = th * .74;
          let ar = "", wi = "";
          for (let i = 0; i < 3; i++) for (let j = 0; j < n; j++) {
            const ax = x0 + 4 + j * cw + (cw - aw) / 2, yb = base - i * th - 1, lim = base - (i + 1) * th + 1;
            if (topAt(ax) <= lim && topAt(ax + aw) <= lim) ar += `M${f1(ax)} ${f1(yb)} v${f1(-(ah - aw / 2))} q${f1(aw / 2)} ${f1(-aw * .9)} ${f1(aw)} 0 v${f1(ah - aw / 2)} Z `;
          }
          for (let j = 0; j < n; j += 2) { const ax = x0 + 4 + j * cw + cw / 2; if (ax + 4 < xb) wi += `M${f1(ax - 1.5)} ${f1(top + th * .35)} h3.4 v4.5 h-3.4 Z `; }
          s += `<path d="${ar}" fill="#7D6248"/><path d="${wi}" fill="#8C7255"/>`;
          s += `<path d="M${f1(x0)} ${f1(base - th)} H${f1(X)} M${f1(x0)} ${f1(base - 2 * th)} H${f1(X)} M${f1(x0)} ${f1(base - 3 * th)} H${f1(xb + 20)}" stroke="#B49C76" stroke-width="1.6"/><path d="M${f1(x0)} ${f1(top + 1)} H${f1(xb)}" stroke="#C2AA82" stroke-width="2"/>`;
          s += tree(btw(r, 14, 70), btw(r, 182, 192), btw(r, .95, 1.15), sea, r) + tree(btw(r, 40, 80), btw(r, 190, 196), btw(r, .8, 1), sea, r);
          return { s, l: "", perch: [[x0 + 24, top], [X - 14, low], [x0 + 4 + 3 * cw + cw / 2, base - th - 1]] };
        } },
      { id: "sanpietro", zh: "聖彼得大教堂",
        see: ["圓頂好高，是米開朗基羅設計的", "廣場兩邊的柱廊，像張開來抱人的手臂", "廣場正中間立著一根尖尖的方尖碑"],
        spots: ["圓頂最上面的十字架旁", "柱廊頂上的聖人雕像旁", "方尖碑的尖端"],
        draw(c) {
          const { r } = c, dx = btw(r, 145, 172);
          const qp = (t, a, b, e) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * e;
          let s = `<rect x="0" y="158" width="300" height="42" fill="#D9CCB1"/><ellipse cx="${f1(dx)}" cy="180" rx="96" ry="12" fill="none" stroke="#CBBD9F" stroke-width="1.2"/>`;
          s += `<rect x="${f1(dx - 26)}" y="82" width="52" height="32" fill="#DCCDB0"/>`;
          let cl = ""; for (let i = 0; i < 6; i++) cl += `M${f1(dx - 23 + i * 9)} 86 h2.4 v24 h-2.4 Z `;
          s += `<path d="${cl}" fill="#C3B394"/>`;
          s += `<path d="M${f1(dx - 29)} 84 C${f1(dx - 29)} 58 ${f1(dx - 15)} 46 ${f1(dx)} 46 C${f1(dx + 15)} 46 ${f1(dx + 29)} 58 ${f1(dx + 29)} 84 Z" fill="#A7B2B1"/>`;
          let rb = ""; for (let i = -2; i <= 2; i++) rb += `M${f1(dx + i * 11)} 84 Q${f1(dx + i * 6)} 54 ${f1(dx)} 46 `;
          s += `<path d="${rb}" stroke="#8C9898" stroke-width=".9" fill="none"/>`;
          s += `<rect x="${f1(dx - 5)}" y="34" width="10" height="12" fill="#E4D8BF"/><path d="M${f1(dx - 6.5)} 35 Q${f1(dx)} 26 ${f1(dx + 6.5)} 35 Z" fill="#A7B2B1"/><path d="M${f1(dx)} 29 v-8 M${f1(dx - 2.6)} 24 h5.2" stroke="#8C7A55" stroke-width="1.3"/>`;
          for (const o of [-46, 46]) s += `<rect x="${f1(dx + o - 6)}" y="100" width="12" height="12" fill="#DCCDB0"/><path d="M${f1(dx + o - 7.5)} 101 Q${f1(dx + o)} 86 ${f1(dx + o + 7.5)} 101 Z" fill="#A7B2B1"/>`;
          s += `<rect x="${f1(dx - 58)}" y="116" width="116" height="44" fill="#E4D7BD"/><rect x="${f1(dx - 60)}" y="113" width="120" height="9" fill="#D4C5A7"/><path d="M${f1(dx - 22)} 113 L${f1(dx)} 102 L${f1(dx + 22)} 113 Z" fill="#D4C5A7"/>`;
          let st = "", co = "", dr = "";
          for (let i = 0; i < 13; i++) { const x = dx - 56 + i * 9.33; if (Math.abs(x - dx) > 22) st += `M${f1(x - 1.3)} 113 v-3 a1.3 1.3 0 0 1 2.6 0 v3 Z `; }
          for (let i = 0; i < 8; i++) co += `M${f1(dx - 52 + i * 14.3)} 122 h4.4 v38 h-4.4 Z `;
          for (let i = 0; i < 7; i++) { const g = dx - 52 + 4.4 + i * 14.3 + 4.95; dr += `M${f1(g - 3)} 146 h6 v14 h-6 Z M${f1(g - 2.4)} 128 h4.8 v7 h-4.8 Z `; }
          s += `<path d="${st}" fill="#CFC0A2"/><path d="${co}" fill="#F0E6D2"/><path d="${dr}" fill="#77664F"/>`;
          let perch = [];
          for (const side of [-1, 1]) {
            const a = dx + side * 60, e = side < 0 ? 6 : 294, m = dx + side * 100;
            s += `<path d="M${f1(a)} 148 Q${f1(m)} 150 ${e} 170 L${e} 184 Q${f1(m)} 164 ${f1(a)} 160 Z" fill="#E4D7BD"/><path d="M${f1(a)} 149 Q${f1(m)} 151 ${e} 171" stroke="#CDBD9F" stroke-width="2.2" fill="none"/>`;
            let cs = "", ss = "";
            for (let t = .08; t < .95; t += .075) { const x = qp(t, a, m, e), y1 = qp(t, 148, 150, 170), y2 = qp(t, 160, 164, 184); cs += `M${f1(x)} ${f1(y1 + 3)} V${f1(y2)} `; ss += `M${f1(x - 1)} ${f1(y1)} h2 v-3 h-2 Z `; }
            s += `<path d="${cs}" stroke="#B9A888" stroke-width="1.5"/><path d="${ss}" fill="#CFC0A2"/>`;
            if (side < 0) perch.push([qp(.3, a, m, e), qp(.3, 148, 150, 170) - 3]);
          }
          s += `<rect x="${f1(dx - 4.5)}" y="176" width="9" height="7" fill="#A8987A"/><path d="M${f1(dx - 2.8)} 176 L${f1(dx - 1.6)} 134 L${f1(dx)} 129 L${f1(dx + 1.6)} 134 L${f1(dx + 2.8)} 176 Z" fill="#9A896B"/><path d="M${f1(dx)} 129 v-4" stroke="#7A6A4E" stroke-width="1"/>`;
          perch.push([dx, 21], [dx, 125]);
          return { s, l: "", perch };
        } },
      { id: "trevi", zh: "特雷維噴泉",
        see: ["海神站在正中間，腳下的水嘩嘩地流", "大家背對著噴泉，把硬幣往後丟", "池子裡的水是淺淺的藍綠色"],
        spots: ["噴泉頂上的雕像旁", "池邊的石頭欄杆上"],
        draw(c) {
          const { r } = c, tx = btw(r, 145, 168);
          let s = `<rect x="22" y="80" width="262" height="92" fill="#E6D9BF"/><rect x="20" y="76" width="266" height="5" fill="#D6C7A8"/>`;
          let wn = "", wp = "";
          for (let row = 0; row < 3; row++) for (let x = 30; x < 276; x += 16) { if (Math.abs(x + 3 - tx) < 48) continue; const y = 90 + row * 20; wn += `M${x} ${y} h6 v10 h-6 Z `; wp += `M${x - 1} ${y - 3} h8 v2 h-8 Z `; }
          s += `<path d="${wn}" fill="#8C7B62"/><path d="${wp}" fill="#CDBE9F"/>`;
          s += `<rect x="${f1(tx - 40)}" y="64" width="80" height="108" fill="#EFE5D0"/><rect x="${f1(tx - 42)}" y="60" width="84" height="6" fill="#DCCDB0"/>`;
          s += `<path d="M${f1(tx - 10)} 60 Q${f1(tx)} 42 ${f1(tx + 10)} 60 Z" fill="#E3D7BE"/><circle cx="${f1(tx)}" cy="49" r="3.2" fill="#D6C9AE"/>`;
          let sta = ""; for (const o of [-32, -18, 18, 32]) sta += `M${f1(tx + o - 1.8)} 60 v-4 a1.8 1.8 0 0 1 3.6 0 v4 Z `;
          s += `<path d="${sta}" fill="#E3D7BE"/>`;
          let col = ""; for (const o of [-36, -26, 21.5, 31.5]) col += `M${f1(tx + o)} 80 h4.5 v62 h-4.5 Z `;
          s += `<path d="${col}" fill="#D9CBAE"/><rect x="${f1(tx - 40)}" y="76" width="80" height="4" fill="#DCCDB0"/>`;
          s += `<path d="M${f1(tx - 14)} 142 V100 Q${f1(tx - 14)} 84 ${f1(tx)} 84 Q${f1(tx + 14)} 84 ${f1(tx + 14)} 100 V142 Z" fill="#C6B696"/>`;
          s += `<circle cx="${f1(tx)}" cy="101" r="3.3" fill="#F7F2E8"/><path d="M${f1(tx - 6)} 106 L${f1(tx + 6)} 106 L${f1(tx + 5)} 134 L${f1(tx - 5)} 134 Z M${f1(tx - 15)} 142 Q${f1(tx)} 131 ${f1(tx + 15)} 142 Z" fill="#F7F2E8"/><path d="M${f1(tx + 6)} 108 l4 -10" stroke="#F7F2E8" stroke-width="1.6"/>`;
          s += `<path d="M${f1(tx - 82)} 172 Q${f1(tx - 72)} 150 ${f1(tx - 54)} 152 Q${f1(tx - 42)} 138 ${f1(tx - 22)} 144 Q${f1(tx)} 136 ${f1(tx + 22)} 144 Q${f1(tx + 42)} 138 ${f1(tx + 54)} 152 Q${f1(tx + 72)} 150 ${f1(tx + 82)} 172 Z" fill="#D7D0C1"/>`;
          let rk = ""; for (let i = 0; i < 6; i++) { const x = tx + btw(r, -66, 60), y = btw(r, 150, 162); rk += `M${f1(x)} ${f1(y)} q4 -5 9 -1 q2 4 -3 5 Z `; }
          s += `<path d="${rk}" fill="#BDB5A4"/><ellipse cx="${f1(tx - 32)}" cy="149" rx="10" ry="5.5" fill="#F3EEE4"/><ellipse cx="${f1(tx + 32)}" cy="149" rx="10" ry="5.5" fill="#F3EEE4"/>`;
          let cs = ""; for (let i = -2; i <= 2; i++) cs += `M${f1(tx + i * 8)} 143 v26 `;
          s += `<path d="${cs}" stroke="#E3F5F3" stroke-width="2.2"/>`;
          s += `<rect x="0" y="166" width="300" height="24" fill="#5CBDC0"/><rect x="0" y="166" width="300" height="3" fill="#A4DED8"/>`;
          let gl = "", cn = ""; for (let i = 0; i < 5; i++) gl += `M${f1(btw(r, 10, 270))} ${f1(btw(r, 172, 180))} q4 -2 8 0 t8 0 `;
          for (let i = 0; i < 3; i++) cn += `M${f1(btw(r, 30, 270))} ${f1(btw(r, 174, 181))} h2 v1.4 h-2 Z `;
          s += `<path d="${gl}" stroke="#E9F7F5" stroke-width="1" fill="none"/><path d="${cn}" fill="#E5C35A"/>`;
          s += `<path d="M0 188 Q150 178 300 188 L300 200 L0 200 Z" fill="#E6DCC8"/><path d="M0 188 Q150 178 300 188" stroke="#CFC3AA" stroke-width="1.6" fill="none"/>`;
          const rx = btw(r, 40, 260);
          return { s, l: "", perch: [[tx - 32, 56], [tx, 45], [rx, 188 - 10 * (1 - Math.pow((rx - 150) / 150, 2)) / 2 - 1]] };
        } },
      { id: "pantheon", zh: "萬神殿",
        see: ["門口一整排又粗又高的石柱", "圓頂正中間開了一個大圓洞，看得到天空", "下雨的時候，雨會從圓頂的大洞落進來"],
        spots: ["門廊的三角屋簷上", "圓頂一圈一圈的台階上"],
        draw(c) {
          const { r } = c, px = btw(r, 148, 175), ox = px - btw(r, 94, 106);
          let s = houses(166, 10, r, ["#E2B47E", "#D99A6C", "#EBCB98", "#D7A57A"], false).s + `<rect x="0" y="164" width="300" height="36" fill="#D3C2A2"/>`;
          s += `<rect x="${f1(px - 72)}" y="98" width="144" height="68" fill="#C3B191"/><rect x="${f1(px - 74)}" y="95" width="148" height="4" fill="#B3A182"/>`;
          s += `<path d="M${f1(px - 68)} 96 Q${f1(px - 62)} 66 ${f1(px)} 64 Q${f1(px + 62)} 66 ${f1(px + 68)} 96 Z" fill="#B9AE9C"/>`;
          let rg = ""; for (let i = 0; i < 3; i++) rg += `M${f1(px - 64 + i * 6)} ${94 - i * 4.5} Q${f1(px)} ${89 - i * 4.5} ${f1(px + 64 - i * 6)} ${94 - i * 4.5} `;
          s += `<path d="${rg}" stroke="#A39886" stroke-width="1.4" fill="none"/>`;
          s += `<rect x="${f1(px - 44)}" y="88" width="88" height="26" fill="#BCAA8A"/><path d="M${f1(px - 46)} 89 L${f1(px)} 76 L${f1(px + 46)} 89 Z" fill="#C9B898"/>`;
          s += `<rect x="${f1(px - 55)}" y="118" width="110" height="46" fill="#6A5E50"/>`;
          let co = "", cp = ""; for (let i = 0; i < 8; i++) { const x = px - 54 + i * 14.6; co += `M${f1(x)} 120 h6.4 v44 h-6.4 Z `; cp += `M${f1(x - 1)} 117 h8.4 v3 h-8.4 Z M${f1(x - 1)} 162 h8.4 v2 h-8.4 Z `; }
          s += `<path d="${co}" fill="#BDB3A2"/><path d="${cp}" fill="#D9CCB0"/>`;
          s += `<rect x="${f1(px - 58)}" y="109" width="116" height="9" fill="#D6C6A6"/><rect x="${f1(px - 30)}" y="111.8" width="60" height="3" fill="#A69676"/>`;
          s += `<path d="M${f1(px - 60)} 110 L${f1(px)} 87 L${f1(px + 60)} 110 Z" fill="#DDCDAD"/><path d="M${f1(px - 50)} 108 L${f1(px)} 91 L${f1(px + 50)} 108 Z" fill="none" stroke="#C2B190" stroke-width="1"/>`;
          s += `<rect x="${f1(px - 60)}" y="164" width="120" height="3" fill="#C9B999"/>`;
          s += `<ellipse cx="${f1(ox)}" cy="177" rx="16" ry="4.5" fill="#CFC4AE"/><ellipse cx="${f1(ox)}" cy="176" rx="13" ry="2.6" fill="#8CC6C9"/><rect x="${f1(ox - 4)}" y="164" width="8" height="10" fill="#BBAE94"/><path d="M${f1(ox - 2.5)} 165 L${f1(ox - 1.4)} 128 L${f1(ox)} 124 L${f1(ox + 1.4)} 128 L${f1(ox + 2.5)} 165 Z" fill="#A89878"/>`;
          return { s, l: "", perch: [[px, 86], [px, 63], [ox, 123]] };
        } },
      { id: "spagna", zh: "西班牙階梯",
        see: ["好寬好長的台階，一路爬到上面的教堂", "台階下的噴泉，是一艘半沉的小船", "教堂前面立著一根高高的方尖碑"],
        spots: ["教堂鐘樓的頂上", "船形噴泉的船頭"],
        draw(c) {
          const { r, sea } = c, cx = btw(r, 145, 168);
          let s = `<rect x="0" y="92" width="${f1(cx - 60)}" height="108" fill="#DDA46A"/><rect x="0" y="89" width="${f1(cx - 58)}" height="4" fill="#B88452"/>`;
          s += `<rect x="${f1(cx + 60)}" y="86" width="${f1(240 - cx)}" height="114" fill="#C97C5C"/><rect x="${f1(cx + 58)}" y="83" width="${f1(242 - cx)}" height="4" fill="#A9654A"/>`;
          let wn = ""; for (let row = 0; row < 4; row++) { for (let x = 8; x < cx - 68; x += 16) wn += `M${x} ${100 + row * 20} h6 v9 h-6 Z `; for (let x = cx + 68; x < 292; x += 16) wn += `M${f1(x)} ${96 + row * 20} h6 v9 h-6 Z `; }
          s += `<path d="${wn}" fill="#7E523A"/>`;
          s += `<rect x="${f1(cx - 32)}" y="74" width="64" height="42" fill="#EDE3CF"/><path d="M${f1(cx - 16)} 74 L${f1(cx)} 64 L${f1(cx + 16)} 74 Z" fill="#E3D7C0"/><rect x="${f1(cx - 5)}" y="99" width="10" height="16" fill="#6F6253"/><circle cx="${f1(cx)}" cy="84" r="3" fill="#8F7F69"/>`;
          for (const o of [-24, 24]) { const t = cx + o; s += `<rect x="${f1(t - 8)}" y="46" width="16" height="30" fill="#EDE3CF"/><path d="M${f1(t - 3.5)} 66 v-8 q3.5 -6 7 0 v8 Z" fill="#6F6253"/><path d="M${f1(t - 9)} 47 L${f1(t - 6)} 41 Q${f1(t)} 33 ${f1(t + 6)} 41 L${f1(t + 9)} 47 Z" fill="#8F8A80"/><path d="M${f1(t)} 37 v-5" stroke="#6F6253" stroke-width="1.2"/>`; }
          s += `<rect x="${f1(cx - 3.5)}" y="108" width="7" height="7" fill="#B9A585"/><path d="M${f1(cx - 2.2)} 108 L${f1(cx - 1.3)} 82 L${f1(cx)} 78 L${f1(cx + 1.3)} 82 L${f1(cx + 2.2)} 108 Z" fill="#A89272"/>`;
          s += `<rect x="${f1(cx - 56)}" y="114" width="112" height="5" fill="#E2D7C2"/><path d="M${f1(cx - 52)} 119 L${f1(cx + 52)} 119 L${f1(cx + 96)} 184 L${f1(cx - 96)} 184 Z" fill="#EEE6D6"/>`;
          let sl = ""; for (let y = 122; y < 184; y += 3.4) { const hw = 52 + (y - 119) / 65 * 44; sl += `M${f1(cx - hw)} ${f1(y)} H${f1(cx + hw)} `; }
          s += `<path d="${sl}" stroke="#D7CCB8" stroke-width=".8"/><path d="M${f1(cx - 52)} 119 L${f1(cx - 96)} 184 M${f1(cx + 52)} 119 L${f1(cx + 96)} 184" stroke="#D2C6AE" stroke-width="3"/>`;
          let lb = ""; for (const y of [140, 162]) { const hw = 52 + (y - 119) / 65 * 44; lb += `M${f1(cx - hw)} ${y} h${f1(hw * 2)} v2.6 h${f1(-hw * 2)} Z `; }
          s += `<path d="${lb}" fill="#F5F0E6"/>`;
          if (sea === "spring") { let az = ""; for (const y of [128, 146, 166]) { const hw = 52 + (y - 119) / 65 * 44 - 7; for (const sd of [-1, 1]) az += `M${f1(cx + sd * hw - 6)} ${y} a6 3.4 0 0 1 12 0 Z `; } s += `<path d="${az}" fill="#E46C9A"/>`; }
          s += `<rect x="0" y="184" width="300" height="16" fill="#D3C6AC"/><ellipse cx="${f1(cx)}" cy="192" rx="34" ry="6" fill="#BFB4A0"/><ellipse cx="${f1(cx)}" cy="191" rx="30" ry="4" fill="#86C4C8"/>`;
          s += `<path d="M${f1(cx - 28)} 178 Q${f1(cx)} 197 ${f1(cx + 28)} 178 Q${f1(cx)} 188 ${f1(cx - 28)} 178 Z" fill="#D8CFBE"/><circle cx="${f1(cx)}" cy="183" r="2" fill="#EAF6F5"/>`;
          return { s, l: "", perch: [[cx - 24, 32], [cx + 24, 32], [cx + 27, 178]] };
        } },
      { id: "foro", zh: "古羅馬廣場",
        see: ["三根石柱還撐著一小段屋簷", "凱旋門上刻滿了打仗的故事", "傘松長得像一把一把撐開的傘"],
        spots: ["三根石柱頂上的屋簷", "凱旋門的頂上", "一棵傘松的樹頂"],
        draw(c) {
          const { r, sea } = c, fx = btw(r, 165, 188), ax = btw(r, 26, 46);
          let s = hills(140, "#9FAE84", r, 10) + `<rect x="0" y="166" width="300" height="34" fill="#CDB58C"/>`;
          const pine = (x, b, h, k) => `<path d="M${f1(x)} ${f1(b)} Q${f1(x - 6)} ${f1(b - h * .5)} ${f1(x + 3)} ${f1(b - h)}" stroke="#5C4636" stroke-width="${f1(2.8 * k)}" fill="none"/><ellipse cx="${f1(x + 3)}" cy="${f1(b - h - 3)}" rx="${f1(28 * k)}" ry="${f1(8 * k)}" fill="#4D6A43"/><ellipse cx="${f1(x - 7)}" cy="${f1(b - h + 2)}" rx="${f1(17 * k)}" ry="${f1(5.5 * k)}" fill="#5E7C50"/><ellipse cx="${f1(x + 15)}" cy="${f1(b - h + 1)}" rx="${f1(13 * k)}" ry="${f1(5 * k)}" fill="#5E7C50"/>`;
          const p1x = btw(r, 256, 262), p1h = btw(r, 80, 90), p2x = btw(r, 110, 128), p2h = btw(r, 60, 70);
          s += pine(p2x, 164, p2h, .85) + pine(p1x, 168, p1h, 1);
          s += `<rect x="${f1(ax)}" y="108" width="76" height="60" fill="#D7C7A6"/><rect x="${f1(ax - 2)}" y="96" width="80" height="12" fill="#CDBC9A"/><rect x="${f1(ax - 3)}" y="105" width="82" height="3" fill="#C4B290"/>`;
          s += `<path d="M${f1(ax + 28)} 168 V138 Q${f1(ax + 28)} 124 ${f1(ax + 38)} 124 Q${f1(ax + 48)} 124 ${f1(ax + 48)} 138 V168 Z M${f1(ax + 7)} 168 V150 Q${f1(ax + 7)} 143 ${f1(ax + 13)} 143 Q${f1(ax + 19)} 143 ${f1(ax + 19)} 150 V168 Z M${f1(ax + 57)} 168 V150 Q${f1(ax + 57)} 143 ${f1(ax + 63)} 143 Q${f1(ax + 69)} 143 ${f1(ax + 69)} 150 V168 Z" fill="#7A6650"/>`;
          s += `<path d="M${f1(ax + 1.5)} 110 h4 v56 h-4 Z M${f1(ax + 21.5)} 110 h4 v56 h-4 Z M${f1(ax + 50.5)} 110 h4 v56 h-4 Z M${f1(ax + 70.5)} 110 h4 v56 h-4 Z" fill="#E4D7BB"/><path d="M${f1(ax + 6)} 120 h14 v14 h-14 Z M${f1(ax + 56)} 120 h14 v14 h-14 Z" fill="#C6B492"/>`;
          s += `<rect x="${f1(fx - 10)}" y="150" width="64" height="18" fill="#BCA987"/>`;
          let co = "", fl = "", cp = ""; for (let i = 0; i < 3; i++) { const x = fx + i * 17; co += `M${f1(x)} 74 h8 v76 h-8 Z `; fl += `M${f1(x + 2.6)} 76 V150 M${f1(x + 5.3)} 76 V150 `; cp += `M${f1(x - 1.5)} 69 h11 v5 h-11 Z `; }
          s += `<path d="${co}" fill="#E2D5BA"/><path d="${fl}" stroke="#CDBE9F" stroke-width=".7"/><path d="${cp}" fill="#D6C7A8"/>`;
          s += `<path d="M${f1(fx - 4)} 59 H${f1(fx + 46)} L${f1(fx + 43)} 69 H${f1(fx - 4)} Z" fill="#D9CAAD"/><rect x="${f1(fx - 4)}" y="63" width="48" height="1.6" fill="#BFAF8E"/>`;
          let sp = ""; for (let i = 0; i < 3; i++) { const x = btw(r, 136, 156) + i * 2 - 8 * i, h = btw(r, 10, 24); sp += `M${f1(x)} ${f1(167 - h)} h6 v${f1(h)} h-6 Z `; }
          s += `<path d="${sp}" fill="#DACCB1"/><rect x="${f1(btw(r, 208, 228))}" y="162" width="20" height="6" rx="3" fill="#D6C8AC"/>`;
          s += tree(btw(r, 8, 20), btw(r, 180, 190), 1, sea, r) + tree(btw(r, 140, 160), btw(r, 186, 194), .9, sea, r);
          return { s, l: "", perch: [[fx + 21, 58], [ax + 38, 95], [p1x + 3, 168 - p1h - 11]] };
        } },
    ],
  },
  venezia: {
    zh: "威尼斯", de: "Venezia", gift: "一顆穆拉諾島的小玻璃珠",
    sights: [
      { id: "canalgrande", zh: "大運河",
        see: ["船夫站在船尾，只用一支長槳划", "貢多拉全身黑黑的，船頭翹得高高的", "水裡插著一根根條紋木樁，讓船綁繩子"],
        spots: ["貢多拉翹起來的船頭", "一根條紋木樁的頂上"],
        draw(c) {
          const { r } = c, gx = btw(r, 105, 138), L = btw(r, 112, 126), pc = pick(r, ["#2F5D8A", "#B23A30"]), sc = pick(r, ["#23314F", "#B23A30"]);
          const cols = ["#E3B9A0", "#EBD5B2", "#D99A84", "#F0E3CA", "#C98F7A", "#E6C68E"];
          let s = "", x = btw(r, -6, 0), wn = "", ch = "";
          while (x < 300) {
            const w = btw(r, 34, 48), h = btw(r, 46, 66), y0 = 142 - h;
            s += `<rect x="${f1(x)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(h)}" fill="${pick(r, cols)}"/><rect x="${f1(x - 1)}" y="${f1(y0 - 2)}" width="${f1(w + 2)}" height="3" fill="#CDBBA2"/>`;
            for (let row = 0; row < 2; row++) for (let k = 0; k < 3; k++) { const wx = x + 6 + k * (w - 17) / 2, wy = y0 + 8 + row * 16; wn += `M${f1(wx)} ${f1(wy + 10)} V${f1(wy + 3)} L${f1(wx + 2.5)} ${f1(wy)} L${f1(wx + 5)} ${f1(wy + 3)} V${f1(wy + 10)} Z `; }
            if (r() < .5) { const cx = x + w * .7; ch += `M${f1(cx)} ${f1(y0 - 2)} v-6 h3 v6 Z M${f1(cx - 2)} ${f1(y0 - 12)} h7 l-2 4 h-3 Z `; }
            x += w + btw(r, 0, 2);
          }
          s += `<path d="${wn}" fill="#5B4A40"/><path d="${ch}" fill="#B07A5E"/>`;
          s += water(142, "#93C4C2", "#4F8D95", r) + `<rect x="0" y="139" width="300" height="4" fill="#8A7A68"/>`;
          const p0 = btw(r, 26, 66); let pw = "", ps = "";
          for (let i = 0; i < 3; i++) { const xx = p0 + i * 10; pw += `M${f1(xx)} 122 h3.6 v52 h-3.6 Z `; for (let y = 124; y < 170; y += 7) ps += `M${f1(xx)} ${y} h3.6 v3.5 h-3.6 Z `; ps += `M${f1(xx - .4)} 119 h4.4 v3 h-4.4 Z `; }
          s += `<path d="${pw}" fill="#F3EEE4"/><path d="${ps}" fill="${pc}"/>`;
          const B = gx + L;
          s += `<ellipse cx="${f1(gx + L / 2)}" cy="175" rx="${f1(L / 2)}" ry="2.6" fill="#2F5E66"/>`;
          s += `<path d="M${f1(gx)} 157 Q${f1(gx + 8)} 171 ${f1(gx + 26)} 172 L${f1(B - 32)} 172 Q${f1(B - 8)} 171 ${f1(B)} 150 L${f1(B - 3)} 151 Q${f1(B - 14)} 163 ${f1(B - 34)} 164 L${f1(gx + 28)} 164 Q${f1(gx + 10)} 163 ${f1(gx + 3)} 156 Z" fill="#1D1D23"/>`;
          s += `<rect x="${f1(B - 2)}" y="140" width="3" height="11" fill="#E3E1D8"/><path d="M${f1(B + 1)} 142 h4 M${f1(B + 1)} 145 h4 M${f1(B + 1)} 148 h4" stroke="#E3E1D8" stroke-width="1.2"/>`;
          s += `<rect x="${f1(gx + 46)}" y="159" width="18" height="5" fill="#8E2A2A"/>`;
          const g = gx + 16;
          s += `<path d="M${f1(g + 3)} 138 L${f1(gx + 44)} 178" stroke="#7A5A3E" stroke-width="1.8" stroke-linecap="round"/><rect x="${f1(g - 2.5)}" y="148" width="5" height="16" fill="#1D1D23"/><rect x="${f1(g - 3.5)}" y="134" width="7" height="14" fill="#F4F1EA"/>`;
          s += `<path d="M${f1(g - 3.5)} 136 h7 v1.8 h-7 Z M${f1(g - 3.5)} 140 h7 v1.8 h-7 Z M${f1(g - 3.5)} 144 h7 v1.8 h-7 Z" fill="${sc}"/><circle cx="${f1(g)}" cy="130.5" r="3.4" fill="#E5BE98"/>`;
          s += `<ellipse cx="${f1(g)}" cy="127.5" rx="6.5" ry="1.5" fill="#E5CD86"/><rect x="${f1(g - 3.2)}" y="124" width="6.4" height="3.5" fill="#E5CD86"/><rect x="${f1(g - 3.2)}" y="125.8" width="6.4" height="1.2" fill="#B23A30"/>`;
          return { s, l: "", perch: [[B - .5, 140], [p0 + 1.8, 119], [g, 123.5]] };
        } },
      { id: "rialto", zh: "里亞托橋",
        see: ["白色的石橋拱得好高，船從底下過", "橋上兩排小店，賣面具和玻璃", "站在橋中間，大運河兩頭都看得到"],
        spots: ["橋中間拱門的屋頂", "橋邊的石欄杆上"],
        draw(c) {
          const { r } = c, bx = btw(r, 145, 158);
          const deck = (x) => x <= bx - 24 ? 150 - (x - (bx - 108)) * 34 / 84 : x >= bx + 24 ? 116 + (x - (bx + 24)) * 34 / 84 : 116;
          let s = houses(150, 11, r, ["#E3C3A3", "#EAD8B8", "#D8A88E", "#E9DDC6"], false).s + water(150, "#9CC8C6", "#4E8E96", r);
          s += `<path d="M${f1(bx - 110)} 160 L${f1(bx - 110)} 151 L${f1(bx - 24)} 116 L${f1(bx + 24)} 116 L${f1(bx + 110)} 151 L${f1(bx + 110)} 160 L${f1(bx + 88)} 160 Q${f1(bx)} 98 ${f1(bx - 88)} 160 Z" fill="#EFE9DC"/>`;
          s += `<path d="M${f1(bx - 88)} 160 Q${f1(bx)} 98 ${f1(bx + 88)} 160 L${f1(bx + 80)} 160 Q${f1(bx)} 106 ${f1(bx - 80)} 160 Z" fill="#CDC3AF"/>`;
          s += `<path d="M${f1(bx - 110)} 151 L${f1(bx - 24)} 116 L${f1(bx + 24)} 116 L${f1(bx + 110)} 151" stroke="#D6CDBB" stroke-width="2.2" fill="none"/>`;
          let ar = "";
          for (const [xa, xe] of [[bx - 96, bx - 24], [bx + 24, bx + 96]]) {
            const da = deck(xa), de = deck(xe);
            s += `<path d="M${f1(xa)} ${f1(da)} L${f1(xe)} ${f1(de)} L${f1(xe)} ${f1(de - 19)} L${f1(xa)} ${f1(da - 19)} Z" fill="#E7E0D0"/><path d="M${f1(xa - 2)} ${f1(da - 17)} L${f1(xe + 2)} ${f1(de - 17)} L${f1(xe + 1)} ${f1(de - 23)} L${f1(xa - 1)} ${f1(da - 23)} Z" fill="#A0745C"/>`;
            for (let j = 0; j < 5; j++) { const xx = xa + 4 + j * 14, yb = deck(xx + 4) - 2; ar += `M${f1(xx)} ${f1(yb)} v-9 q4 -6 8 0 v9 Z `; }
          }
          s += `<path d="${ar}" fill="#6C6050"/>`;
          s += `<rect x="${f1(bx - 19)}" y="94" width="38" height="22" fill="#F2ECE0"/><path d="M${f1(bx - 9)} 116 V106 Q${f1(bx - 9)} 97 ${f1(bx)} 97 Q${f1(bx + 9)} 97 ${f1(bx + 9)} 106 V116 Z" fill="#6C6050"/><rect x="${f1(bx - 21)}" y="93" width="42" height="3" fill="#DCD3C1"/><path d="M${f1(bx - 22)} 94 L${f1(bx)} 83 L${f1(bx + 22)} 94 Z" fill="#E7E0D0"/>`;
          if (r() < .6) s += boat(btw(r, 30, 230), btw(r, 178, 188), .9, false);
          return { s, l: "", perch: [[bx, 83], [bx - 104, deck(bx - 104) - 1], [bx + 60, deck(bx + 60) - 23]] };
        } },
      { id: "sanmarco", zh: "聖馬可大教堂",
        see: ["教堂頂上有好幾個圓圓的屋頂", "門上的金色馬賽克亮晶晶的", "旁邊的紅磚鐘樓，要把頭仰得好高才看得到頂"],
        spots: ["鐘樓頂上的金色天使旁", "教堂圓頂的小尖頂上"],
        draw(c) {
          const { r } = c, bx = btw(r, 54, 72), tx = bx + 130 + btw(r, 26, 36);
          let s = `<rect x="0" y="160" width="300" height="40" fill="#DCD2BE"/>`;
          let pv = ""; for (let i = 0; i < 6; i++) pv += `M${i * 60 - 20} 200 L${f1(bx + 65 + (i - 2.5) * 22)} 160 `;
          s += `<path d="${pv}M0 172 H300 M0 186 H300" stroke="#EAE3D5" stroke-width="1.2"/>`;
          s += `<rect x="0" y="118" width="${f1(bx - 6)}" height="42" fill="#E3D8C3"/>`;
          let pa = ""; for (let x = 4; x < bx - 14; x += 10) pa += `M${x} 160 v-10 q3 -5 6 0 v10 Z M${x + 1} 136 h4 v6 h-4 Z `;
          s += `<path d="${pa}" fill="#8A7A66"/>`;
          const dome = (x, b, q) => `<rect x="${f1(x - q * .8)}" y="${f1(b)}" width="${f1(q * 1.6)}" height="12" fill="#D9CCB2"/><path d="M${f1(x - q)} ${f1(b)} C${f1(x - q)} ${f1(b - q * 1.25)} ${f1(x - q * .25)} ${f1(b - q * 1.45)} ${f1(x)} ${f1(b - q * 1.75)} C${f1(x + q * .25)} ${f1(b - q * 1.45)} ${f1(x + q)} ${f1(b - q * 1.25)} ${f1(x + q)} ${f1(b)} Z" fill="#9AA19E"/><path d="M${f1(x)} ${f1(b - q * 1.75)} v-6" stroke="#8C7A55" stroke-width="1.2"/><circle cx="${f1(x)}" cy="${f1(b - q * 1.75 - 3)}" r="1.6" fill="#D8B04A"/>`;
          s += dome(bx + 30, 96, 12) + dome(bx + 100, 96, 12) + dome(bx + 65, 92, 16);
          s += `<rect x="${f1(bx + 6)}" y="100" width="118" height="20" fill="#EADCC2"/>`;
          let og = "", lu = "", pk = "";
          for (let j = 0; j < 5; j++) {
            const xc = bx + 13 + j * 26, w = j === 2 ? 26 : 20, a = xc - w / 2, b2 = xc + w / 2;
            og += `M${f1(a)} 120 V106 Q${f1(a)} 98 ${f1(xc - w / 4)} 96 Q${f1(xc)} 94 ${f1(xc)} 86 Q${f1(xc)} 94 ${f1(xc + w / 4)} 96 Q${f1(b2)} 98 ${f1(b2)} 106 V120 Z `;
            lu += `M${f1(a + 3)} 120 V107 Q${f1(a + 3)} 100 ${f1(xc)} 98 Q${f1(b2 - 3)} 100 ${f1(b2 - 3)} 107 V120 Z `;
            pk += `M${f1(xc - 1.4)} 86 v-3 a1.4 1.4 0 0 1 2.8 0 v3 Z `;
          }
          s += `<path d="${og}" fill="#EADCC2"/><path d="${lu}" fill="#D6A548"/><path d="${pk}" fill="#D8B04A"/>`;
          s += `<rect x="${f1(bx)}" y="120" width="130" height="42" fill="#E8D6B6"/><rect x="${f1(bx)}" y="118" width="130" height="3" fill="#CDBA98"/>`;
          let pt = "", dr = "";
          for (let j = 0; j < 5; j++) { const xc = bx + 13 + j * 26, w = j === 2 ? 26 : 18, t = j === 2 ? 124 : 130; pt += `M${f1(xc - w / 2)} 162 V${t + 10} Q${f1(xc - w / 2)} ${t} ${f1(xc)} ${t} Q${f1(xc + w / 2)} ${t} ${f1(xc + w / 2)} ${t + 10} V162 Z `; dr += `M${f1(xc - w / 2 + 3)} 146 h${w - 6} v16 h${6 - w} Z `; }
          s += `<path d="${pt}" fill="#D6A548"/><path d="${dr}" fill="#5D4A3A"/>`;
          s += `<rect x="${f1(tx)}" y="66" width="22" height="96" fill="#B5553F"/><path d="M${f1(tx + 3)} 70 h2.2 v84 h-2.2 Z M${f1(tx + 16.8)} 70 h2.2 v84 h-2.2 Z" fill="#9F4534"/>`;
          s += `<rect x="${f1(tx - 5)}" y="148" width="32" height="14" fill="#E3D3B5"/><path d="M${f1(tx - 2)} 162 v-7 q3 -5 6 0 v7 Z M${f1(tx + 8)} 162 v-7 q3 -5 6 0 v7 Z M${f1(tx + 18)} 162 v-7 q3 -5 6 0 v7 Z" fill="#7A6A56"/>`;
          s += `<rect x="${f1(tx - 1)}" y="50" width="24" height="16" fill="#EADCC4"/><path d="M${f1(tx + 2.5)} 64 v-8 q2 -3 4 0 v8 Z M${f1(tx + 9)} 64 v-8 q2 -3 4 0 v8 Z M${f1(tx + 15.5)} 64 v-8 q2 -3 4 0 v8 Z" fill="#5A4A3E"/>`;
          s += `<rect x="${f1(tx)}" y="40" width="22" height="10" fill="#DFCDAE"/><path d="M${f1(tx - 1)} 40 L${f1(tx + 11)} 13 L${f1(tx + 23)} 40 Z" fill="#6E9C84"/><circle cx="${f1(tx + 11)}" cy="10.5" r="2.2" fill="#D8B04A"/><path d="M${f1(tx + 8)} 10 l3 2 l3 -2" stroke="#D8B04A" stroke-width="1" fill="none"/>`;
          let pg = ""; for (let i = 0; i < 4; i++) { const x = btw(r, 20, 280), y = btw(r, 172, 194); pg += `M${f1(x - 2.2)} ${f1(y)} a2.2 1.4 0 0 1 4.4 0 Z `; }
          s += `<path d="${pg}" fill="#8E8E92"/>`;
          return { s, l: "", perch: [[tx + 11, 8], [bx + 65, 59], [bx + 13, 82]] };
        } },
      { id: "sospiri", zh: "嘆息橋",
        see: ["一座白色的小橋，整個包起來像一條走廊", "橋上只有兩扇小窗，窗上有石頭格子", "聽說以前犯人走過這裡，都會嘆一口氣"],
        spots: ["嘆息橋的石窗邊", "橋頂中間的雕花上"],
        draw(c) {
          const { r } = c, sx = btw(r, 160, 176), g = 36;
          let s = `<rect x="${f1(sx - g)}" y="68" width="${2 * g}" height="90" fill="#A69B8A"/>`;
          s += `<path d="M${f1(sx - g)} 62 L${f1(sx - g + 16)} 74 L${f1(sx - g + 16)} 156 L${f1(sx - g)} 158 Z" fill="#C9C0AF"/><path d="M${f1(sx + g)} 54 L${f1(sx + g - 16)} 70 L${f1(sx + g - 16)} 156 L${f1(sx + g)} 158 Z" fill="#B6AC9A"/>`;
          s += `<path d="M${f1(sx - 14)} 156 v-16 h6 v16 Z M${f1(sx + 4)} 156 v-20 h7 v20 Z" fill="#8E8372"/>`;
          s += `<rect x="36" y="62" width="${f1(sx - g - 36)}" height="96" fill="#EEE7D9"/>`;
          let lw = "", lc = ""; for (let row = 0; row < 3; row++) for (let x = 46; x < sx - g - 12; x += 22) { lw += `M${x} ${72 + row * 28} h8 v14 h-8 Z `; lc += `M${x - 1} ${70 + row * 28} h10 v2 h-10 Z `; }
          s += `<path d="${lw}" fill="#5C5348"/><path d="${lc}" fill="#D6CCBA"/>`;
          s += `<rect x="${f1(sx + g)}" y="50" width="${f1(286 - sx - g)}" height="108" fill="#D2C8B6"/>`;
          let ru = ""; for (let y = 57; y < 156; y += 7) ru += `M${f1(sx + g)} ${y} H286 `;
          s += `<path d="${ru}" stroke="#BDB2A0" stroke-width=".8"/>`;
          let bw = "", bb = ""; for (let row = 0; row < 3; row++) for (let x = sx + g + 10; x < 276; x += 22) { const y = 64 + row * 30; bw += `M${f1(x)} ${y} h10 v12 h-10 Z `; bb += `M${f1(x + 3.3)} ${y} v12 M${f1(x + 6.6)} ${y} v12 `; }
          s += `<path d="${bw}" fill="#4F473E"/><path d="${bb}" stroke="#D2C8B6" stroke-width=".9"/>`;
          s += water(156, "#7FAFB2", "#3E7480", r);
          s += `<path d="M${f1(sx - g)} 92 Q${f1(sx)} 84 ${f1(sx + g)} 92 L${f1(sx + g)} 124 Q${f1(sx)} 110 ${f1(sx - g)} 124 Z" fill="#F3EEE3"/>`;
          s += `<path d="M${f1(sx - g - 2)} 92 Q${f1(sx)} 83 ${f1(sx + g + 2)} 92" stroke="#D9D1C0" stroke-width="2.6" fill="none"/><path d="M${f1(sx - g)} 124 Q${f1(sx)} 110 ${f1(sx + g)} 124" stroke="#D9D1C0" stroke-width="2.2" fill="none"/>`;
          s += `<path d="M${f1(sx - g)} 92 h5 v32 h-5 Z M${f1(sx + g - 5)} 92 h5 v32 h-5 Z" fill="#E2DACA"/>`;
          let lt = ""; for (const wx of [sx - 19, sx + 5]) { s += `<rect x="${f1(wx)}" y="96" width="14" height="13" fill="#3F3832"/>`; lt += `M${f1(wx)} 96 L${f1(wx + 14)} 109 M${f1(wx + 14)} 96 L${f1(wx)} 109 M${f1(wx + 7)} 96 L${f1(wx + 14)} 102.5 L${f1(wx + 7)} 109 L${f1(wx)} 102.5 Z `; }
          s += `<path d="${lt}" stroke="#F3EEE3" stroke-width="1.1" fill="none"/>`;
          s += `<path d="M${f1(sx - 9)} 89 Q${f1(sx - 9)} 80 ${f1(sx)} 78 Q${f1(sx + 9)} 80 ${f1(sx + 9)} 89 Z" fill="#EAE3D4"/><circle cx="${f1(sx - 10)}" cy="88" r="2.2" fill="#EAE3D4"/><circle cx="${f1(sx + 10)}" cy="88" r="2.2" fill="#EAE3D4"/><circle cx="${f1(sx)}" cy="76" r="2.4" fill="#EAE3D4"/>`;
          if (r() < .6) s += `<path d="M${f1(sx - 26)} 166 Q${f1(sx - 24)} 172 ${f1(sx - 12)} 172 L${f1(sx + 16)} 172 Q${f1(sx + 26)} 171 ${f1(sx + 28)} 163 L${f1(sx + 25)} 168 L${f1(sx - 22)} 168 Z" fill="#1D1D23"/>`;
          let bl = ""; for (let x = 0; x < 300; x += 10) bl += `M${x + 3} 189 h4 v11 h-4 Z `;
          s += `<rect x="0" y="185" width="300" height="5" fill="#E9E2D4"/><path d="${bl}" fill="#D9D0C0"/>`;
          return { s, l: "", perch: [[sx, 73.5], [sx - 12, 109], [btw(r, 30, 110), 185]] };
        } },
      { id: "burano", zh: "布拉諾島",
        see: ["每一間房子都漆成不一樣的顏色", "運河邊停滿了一艘艘彩色的小船", "遠遠那座鐘樓有一點歪歪的"],
        spots: ["一間彩色房子的煙囪上", "小船的船頭"],
        draw(c) {
          const { r } = c, tw = btw(r, 150, 196);
          let s = `<path d="M${f1(tw)} 128 L${f1(tw + 12)} 128 L${f1(tw + 21)} 50 L${f1(tw + 9)} 50 Z" fill="#E8DCC8"/><path d="M${f1(tw + 9)} 50 L${f1(tw + 21)} 50 L${f1(tw + 22)} 42 L${f1(tw + 10)} 42 Z" fill="#D7C6AA"/><path d="M${f1(tw + 13)} 49 v-5 h2 v5 Z M${f1(tw + 17)} 49 v-5 h2 v5 Z" fill="#7A6A56"/><path d="M${f1(tw + 9.5)} 42 Q${f1(tw + 16)} 31 ${f1(tw + 22.5)} 42 Z" fill="#B9A58A"/><path d="M${f1(tw + 16)} 34 l.6 -6" stroke="#7A6A56" stroke-width="1"/>`;
          const cols = ["#E2473B", "#F2C230", "#3D7CC9", "#57A85C", "#E77FB0", "#8E5BB5", "#F08A3A", "#2FA6A0"];
          let x = btw(r, -6, 0), prev = "", rf = "", wf = "", sh = "", ch = "", perch = [];
          while (x < 300) {
            const w = btw(r, 26, 36), h = btw(r, 40, 60), y0 = 150 - h; let col = pick(r, cols); if (col === prev) col = cols[(cols.indexOf(col) + 3) % cols.length]; prev = col;
            s += `<rect x="${f1(x)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(h)}" fill="${col}"/><rect x="${f1(x)}" y="${f1(y0)}" width="${f1(w)}" height="2.5" fill="#F2EEE6"/>`;
            rf += `<rect x="${f1(x)}" y="152" width="${f1(w)}" height="14" fill="${col}" opacity=".28"/>`;
            for (let f = 0; f < 2; f++) { const wy = y0 + 8 + f * 16; if (wy + 9 > 136) continue; for (let k = 0; k < 2; k++) { const wx = x + 5 + k * (w - 15); wf += `M${f1(wx - 1)} ${f1(wy - 1)} h7 v10 h-7 Z `; sh += `M${f1(wx)} ${f1(wy)} h5 v8 h-5 Z `; } }
            wf += `M${f1(x + w / 2 - 4.5)} 136 h9 v14 h-9 Z `; sh += `M${f1(x + w / 2 - 3.5)} 137 h7 v13 h-7 Z `;
            if (r() < .5) { const cx = x + w * .7; ch += `M${f1(cx)} ${f1(y0)} v-8 h3.5 v8 Z M${f1(cx - 2)} ${f1(y0 - 12)} h7.5 l-2 4 h-3.5 Z `; if (perch.length < 1 && cx > 60 && cx < 270) perch.push([cx + 1.8, y0 - 12]); }
            x += w;
          }
          s += `<path d="${wf}" fill="#F7F3EA"/><path d="${sh}" fill="#3E6E4A"/><path d="${ch}" fill="#C55A44"/>`;
          s += water(150, "#8FC8C8", "#3E8FA0", r) + rf;
          let bt = ""; for (let i = 0; i < 2; i++) { const bxp = btw(r, 20 + i * 140, 120 + i * 140), by = btw(r, 168, 186), bc = pick(r, cols); bt += `<path d="M${f1(bxp)} ${f1(by)} h28 l-5 6 h-18 Z" fill="${bc}"/><rect x="${f1(bxp + 2)}" y="${f1(by)}" width="24" height="1.6" fill="#F2EEE6"/>`; if (i === 0) perch.push([bxp + 26, by]); }
          s += bt; perch.push([tw + 16.5, 28]);
          return { s, l: "", perch };
        } },
      { id: "salute", zh: "安康聖母大殿",
        see: ["大大的白色圓頂，就蓋在運河的出口", "圓頂下面圍著一圈捲捲的大石頭", "這座教堂是為了謝謝瘟疫過去才蓋的"],
        spots: ["圓頂最上面的雕像旁", "一個捲捲的石頭上", "岸邊的台階上"],
        draw(c) {
          const { r } = c, cx = btw(r, 165, 188), dg = cx - btw(r, 96, 108);
          let s = `<rect x="${f1(dg - 44)}" y="122" width="70" height="28" fill="#E8DFCE"/><rect x="${f1(dg - 46)}" y="119" width="74" height="4" fill="#D3C8B4"/>`;
          let dw = ""; for (let x = dg - 38; x < dg + 22; x += 9) dw += `M${f1(x)} 130 h4 v7 h-4 Z `;
          s += `<path d="${dw}" fill="#8C8070"/><rect x="${f1(dg - 8)}" y="106" width="16" height="16" fill="#E3D9C7"/><circle cx="${f1(dg)}" cy="101" r="5" fill="#D9AC42"/><rect x="${f1(dg - 1)}" y="90" width="2" height="7" fill="#C9A040"/><path d="M${f1(dg)} 92 l6 -3" stroke="#C9A040" stroke-width="1.2"/>`;
          s += `<rect x="${f1(cx + 44)}" y="104" width="28" height="44" fill="#E4DED2"/><rect x="${f1(cx + 46)}" y="90" width="22" height="14" fill="#EAE5DA"/><path d="M${f1(cx + 44)} 92 Q${f1(cx + 57)} 70 ${f1(cx + 70)} 92 Z" fill="#D9D4CB"/><rect x="${f1(cx + 55)}" y="74" width="4" height="6" fill="#EAE5DA"/>`;
          for (const t of [cx + 74, cx + 86]) s += `<rect x="${f1(t)}" y="84" width="7" height="50" fill="#E8E2D6"/><path d="M${f1(t - 1)} 85 Q${f1(t + 3.5)} 76 ${f1(t + 8)} 85 Z" fill="#D9D4CB"/><path d="M${f1(t + 3.5)} 79 v-5" stroke="#B9B2A5" stroke-width="1"/>`;
          s += `<rect x="${f1(cx - 31)}" y="70" width="62" height="28" fill="#ECE7DC"/>`;
          let dk = ""; for (let k = 0; k < 5; k++) dk += `M${f1(cx - 24 + k * 11)} 92 V82 q2 -3 4 0 V92 Z `;
          s += `<path d="${dk}" fill="#8C8274"/>`;
          s += `<path d="M${f1(cx - 35)} 72 C${f1(cx - 35)} 44 ${f1(cx - 17)} 35 ${f1(cx)} 35 C${f1(cx + 17)} 35 ${f1(cx + 35)} 44 ${f1(cx + 35)} 72 Z" fill="#E4E0D8"/>`;
          let rb = ""; for (let k = -2; k <= 2; k++) rb += `M${f1(cx + k * 12)} 71 Q${f1(cx + k * 6)} 44 ${f1(cx)} 36 `;
          s += `<path d="${rb}" stroke="#CEC8BC" stroke-width=".9" fill="none"/><rect x="${f1(cx - 36)}" y="69" width="72" height="4" fill="#DDD7CB"/>`;
          s += `<rect x="${f1(cx - 5)}" y="25" width="10" height="11" fill="#EEE9DE"/><path d="M${f1(cx - 6.5)} 26 Q${f1(cx)} 18 ${f1(cx + 6.5)} 26 Z" fill="#E4E0D8"/><rect x="${f1(cx - 1)}" y="13" width="2" height="8" fill="#D3CCBE"/><circle cx="${f1(cx)}" cy="12" r="1.6" fill="#D3CCBE"/>`;
          s += `<rect x="${f1(cx - 46)}" y="100" width="92" height="48" fill="#EFEAE0"/><rect x="${f1(cx - 46)}" y="100" width="18" height="48" fill="#DDD6C8"/><rect x="${f1(cx + 28)}" y="100" width="18" height="48" fill="#E2DCCF"/>`;
          s += `<path d="M${f1(cx - 46)} 112 L${f1(cx - 37)} 106 L${f1(cx - 28)} 112 Z M${f1(cx + 28)} 112 L${f1(cx + 37)} 106 L${f1(cx + 46)} 112 Z" fill="#E9E3D7"/><path d="M${f1(cx - 40)} 148 v-14 h6 v14 Z M${f1(cx + 34)} 148 v-14 h6 v14 Z" fill="#7A6E5E"/>`;
          s += `<rect x="${f1(cx - 17)}" y="96" width="34" height="52" fill="#F6F2E9"/><path d="M${f1(cx - 15)} 104 h3 v44 h-3 Z M${f1(cx - 8)} 104 h3 v44 h-3 Z M${f1(cx + 5)} 104 h3 v44 h-3 Z M${f1(cx + 12)} 104 h3 v44 h-3 Z" fill="#E3DCCE"/>`;
          s += `<path d="M${f1(cx - 6)} 148 V128 Q${f1(cx - 6)} 120 ${f1(cx)} 120 Q${f1(cx + 6)} 120 ${f1(cx + 6)} 128 V148 Z" fill="#6E6252"/><path d="M${f1(cx - 19)} 96 L${f1(cx)} 86 L${f1(cx + 19)} 96 Z" fill="#EDE7DB"/><circle cx="${f1(cx)}" cy="83.5" r="2" fill="#E3DCCE"/>`;
          let vo = "", vi = "", vs = ""; for (let i = 0; i < 8; i++) { const vx = cx - 40 + i * 11.4; if (i === 3 || i === 4) continue; vo += `M${f1(vx - 4.6)} 96 a4.6 4.6 0 1 0 9.2 0 a4.6 4.6 0 1 0 -9.2 0 Z `; vi += `M${f1(vx - 1.6)} 96 a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0 Z `; vs += `M${f1(vx - 1.3)} 91 v-3.4 a1.3 1.3 0 0 1 2.6 0 v3.4 Z `; }
          s += `<path d="${vo}" fill="#F3EFE6" stroke="#CFC6B5" stroke-width="1.2"/><path d="${vi}" fill="#CFC6B5"/><path d="${vs}" fill="#E3DCCE"/>`;
          s += `<rect x="0" y="146" width="300" height="6" fill="#D8CFBE"/><rect x="${f1(cx - 52)}" y="146" width="104" height="3" fill="#E8E2D6"/>`;
          s += water(152, "#9DCBCB", "#4F8E99", r) + `<rect x="${f1(cx - 40)}" y="154" width="80" height="20" fill="#F3EFE6" opacity=".25"/>`;
          if (r() < .6) s += boat(btw(r, 20, 220), btw(r, 176, 188), 1, false);
          return { s, l: "", perch: [[cx, 10], [cx - 28.6, 91], [cx + btw(r, -40, 40), 146]] };
        } },
    ],
  },
  barcelona: {
    zh: "巴塞隆納", de: "Barcelona", gift: "一個蜥蜴形狀的小磁鐵",
    sights: [
      { id: "sagrada", zh: "聖家堂",
        see: ["好多高高的尖塔，上面全是小洞", "蓋了一百多年，到現在還在蓋", "塔尖頂著彩色的磁磚，像糖果一樣"],
        spots: ["一根尖塔的小洞裡", "塔頂彩色的尖頂上"],
        draw(c) {
          const { r, sea } = c, cx = btw(r, 158, 174);
          let s = `<rect x="0" y="166" width="300" height="34" fill="#C9BFA9"/>`;
          const spire = (x, top, w, base, col) => { let h = ""; for (let y = top + 24, i = 0; y < base - 8; y += 7, i++) h += `M${f1(x + (i % 2 ? w * .35 : -w * .35) - 1)} ${f1(y)} h2 v4 h-2 Z `; return `<path d="M${f1(x - w)} ${base} L${f1(x - w)} ${f1(top + 42)} Q${f1(x - w)} ${f1(top + 14)} ${f1(x)} ${f1(top)} Q${f1(x + w)} ${f1(top + 14)} ${f1(x + w)} ${f1(top + 42)} L${f1(x + w)} ${base} Z" fill="${col}"/><path d="${h}" fill="#6F5A40"/>`; };
          if (r() < .5) { const mx = cx + 86; let z = ""; for (let y = 160; y > 44; y -= 8) z += `M${f1(mx - 1.6)} ${y} L${f1(mx + 1.6)} ${y - 8} `; s += `<path d="M${f1(mx)} 166 V36 M${f1(mx - 40)} 38 H${f1(mx + 30)}" stroke="#D9A92E" stroke-width="2.2"/><path d="${z}" stroke="#D9A92E" stroke-width=".9"/><path d="M${f1(mx + 22)} 38 V72" stroke="#555555" stroke-width=".8"/><rect x="${f1(mx - 40)}" y="37" width="8" height="5" fill="#8A8A8A"/>`; }
          s += spire(cx - 36, 40, 8, 124, "#B39C76") + spire(cx + 34, 28, 9, 124, "#B39C76") + spire(cx - 2, 16, 11, 124, "#AD9670");
          s += `<path d="M${f1(cx - 2)} 16 v-9 M${f1(cx - 6.5)} 11 h9" stroke="#EFE6D2" stroke-width="2.4" stroke-linecap="round"/><circle cx="${f1(cx + 34)}" cy="24" r="3.2" fill="#F4EBC8"/>`;
          s += `<rect x="${f1(cx - 56)}" y="120" width="112" height="46" fill="#C7AD82"/>`;
          const fr = [[cx - 44, 62], [cx - 26, 48], [cx + 26, 48], [cx + 44, 62]];
          let fin = "", dot = "";
          for (const [x, t] of fr) { s += spire(x, t, 7.5, 128, "#CDB48A"); fin += `M${f1(x)} ${t - 9} L${f1(x + 3.5)} ${t - 2} L${f1(x)} ${t + 3} L${f1(x - 3.5)} ${t - 2} Z `; dot += `M${f1(x - 2)} ${t - 10} a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 Z `; }
          s += `<path d="${fin}" fill="#D2453A"/><path d="${dot}" fill="#F0C34A"/>`;
          s += `<path d="M${f1(cx - 56)} 121 q7 -8 14 0 t14 0 t14 0 t14 0 t14 0 t14 0 t14 0 t14 0" stroke="#B59A6F" stroke-width="2" fill="none"/>`;
          s += `<path d="M${f1(cx - 14)} 166 V136 Q${f1(cx)} 112 ${f1(cx + 14)} 136 V166 Z M${f1(cx - 38)} 166 V146 Q${f1(cx - 30)} 134 ${f1(cx - 22)} 146 V166 Z M${f1(cx + 22)} 166 V146 Q${f1(cx + 30)} 134 ${f1(cx + 38)} 146 V166 Z" fill="#6F5A40"/>`;
          s += `<path d="M${f1(cx)} 132 C${f1(cx - 7)} 124 ${f1(cx - 5)} 106 ${f1(cx)} 96 C${f1(cx + 5)} 106 ${f1(cx + 7)} 124 ${f1(cx)} 132 Z" fill="#5D8C58"/>`;
          s += `<ellipse cx="${f1(btw(r, 36, 60))}" cy="188" rx="32" ry="6" fill="#7FB3C0"/>`;
          s += tree(btw(r, 10, 40), btw(r, 180, 190), 1.1, sea, r) + tree(btw(r, 84, 104), btw(r, 184, 194), 1, sea, r) + tree(btw(r, 236, 290), btw(r, 182, 194), 1.1, sea, r);
          return { s, l: "", perch: [[cx - 2, 6], [cx - 26, 36], [cx + 44, 50]] };
        } },
      { id: "guell", zh: "奎爾公園",
        see: ["門口的兩間小屋，像童話裡的糖果屋", "長長的彎椅子，貼滿了彩色碎磁磚", "從上面看得到整座城，還有遠遠的海"],
        spots: ["彎彎長椅的椅背上", "小屋屋頂的蘑菇尖上"],
        draw(c) {
          const { r, sea } = c, px = btw(r, 176, 200), mx = px - 78, ph = btw(r, 0, 6);
          let s = `<rect x="0" y="112" width="300" height="18" fill="#8DB6CB"/><rect x="0" y="112" width="300" height="2" fill="#B7D3DE"/>`;
          const bc = ["#E8DCCB", "#DCCDB8", "#EFE6D8", "#D2C3AE"];
          for (let i = 0; i < 26; i++) { const x = btw(r, 0, 294), bw = btw(r, 6, 14), bh = btw(r, 5, 16), by = btw(r, 128, 146); s += `<rect x="${f1(x)}" y="${f1(by - bh)}" width="${f1(bw)}" height="${f1(bh + 150 - by)}" fill="${pick(r, bc)}"/>`; }
          s += `<path d="M0 150 Q60 138 120 146 T300 142 L300 200 L0 200 Z" fill="#8BA36E"/>`;
          s += tree(btw(r, 18, 56), 158, 1.1, sea, r) + tree(btw(r, 252, 286), 156, 1.1, sea, r);
          s += `<rect x="${f1(mx - 16)}" y="118" width="32" height="44" fill="#C79A68"/><rect x="${f1(mx - 4)}" y="130" width="8" height="10" fill="#EDE4D2"/><path d="M${f1(mx - 21)} 120 Q${f1(mx - 12)} 102 ${f1(mx)} 106 Q${f1(mx + 12)} 100 ${f1(mx + 21)} 120 Z" fill="#F3EBDC"/><path d="M${f1(mx - 17)} 115 Q${f1(mx)} 104 ${f1(mx + 17)} 115" stroke="#6E92B8" stroke-width="2" fill="none"/>`;
          s += `<rect x="${f1(mx - 2.5)}" y="94" width="5" height="12" fill="#F3EBDC"/><path d="M${f1(mx - 10)} 96 Q${f1(mx - 9)} 82 ${f1(mx)} 81 Q${f1(mx + 9)} 82 ${f1(mx + 10)} 96 Z" fill="#C8352E"/><path d="M${f1(mx - 5.6)} 89 a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0 Z M${f1(mx + 1.4)} 86 a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0 Z M${f1(mx + 3.4)} 92 a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0 Z" fill="#F7F3EA"/>`;
          s += `<rect x="${f1(px - 26)}" y="114" width="52" height="48" fill="#C79A68"/><path d="M${f1(px - 16)} 128 h8 v10 h-8 Z M${f1(px + 2)} 128 h8 v10 h-8 Z" fill="#EDE4D2"/>`;
          s += `<path d="M${f1(px - 31)} 116 Q${f1(px - 24)} 98 ${f1(px - 10)} 104 Q${f1(px + 2)} 92 ${f1(px + 14)} 100 Q${f1(px + 26)} 98 ${f1(px + 31)} 116 Z" fill="#F3EBDC"/><path d="M${f1(px - 27)} 111 Q${f1(px - 10)} 99 ${f1(px + 4)} 103 Q${f1(px + 18)} 97 ${f1(px + 27)} 111" stroke="#6E92B8" stroke-width="2.2" fill="none"/><path d="M${f1(px - 29)} 115 Q${f1(px)} 104 ${f1(px + 29)} 115" stroke="#9A6A44" stroke-width="1.6" fill="none"/>`;
          s += `<path d="M${f1(px + 8)} 114 L${f1(px + 10)} 64 Q${f1(px + 15)} 54 ${f1(px + 20)} 64 L${f1(px + 22)} 114 Z" fill="#EEEAE2"/>`;
          let ck = ""; for (let i = 0; i < 9; i++) { const y = 66 + i * 5; for (let k = 0; k < 2; k++) ck += `M${f1(px + 11 + (i % 2 ? 3.5 : 0) + k * 4.5)} ${y} h2.5 v2.5 h-2.5 Z `; }
          s += `<path d="${ck}" fill="#4E7FB4"/><path d="M${f1(px + 15)} 57 V44 M${f1(px + 10.5)} 50 H${f1(px + 19.5)}" stroke="#6E92B8" stroke-width="3.6" stroke-linecap="round"/><path d="M${f1(px + 15)} 57 V44 M${f1(px + 10.5)} 50 H${f1(px + 19.5)}" stroke="#F2EEE6" stroke-width="2" stroke-linecap="round"/>`;
          const top = (x) => 160 + 6 * Math.sin(x / 20 + ph);
          let d = "M0 182 "; for (let x = 0; x <= 300; x += 10) d += `L${x} ${f1(top(x))} `;
          s += `<path d="${d}L300 182 Z" fill="#F1EBDD"/><path d="${d.slice(7)}" stroke="#D8CDB8" stroke-width="2.2" fill="none"/>`;
          for (const mc of ["#3E7CB1", "#E8B53A", "#4F9A6A", "#D45A4A"]) { let m = ""; for (let i = 0; i < 10; i++) { const x = btw(r, 2, 295); m += `M${f1(x)} ${f1(btw(r, top(x) + 3, 176))} h3.2 v3.2 h-3.2 Z `; } s += `<path d="${m}" fill="${mc}"/>`; }
          s += `<rect x="0" y="182" width="300" height="18" fill="#DCC8A0"/>`;
          const bxx = btw(r, 30, 120);
          return { s, l: "", perch: [[px + 15, 42], [mx, 80], [bxx, top(bxx) - 1]] };
        } },
      { id: "batllo", zh: "巴特略之家",
        see: ["屋頂像一條龍的背，鱗片亮亮的", "每個陽台都長得像一張小面具", "牆上貼滿了藍藍綠綠的碎片"],
        spots: ["龍背屋頂的鱗片上", "一個面具陽台的邊上", "屋頂十字架的旁邊"],
        draw(c) {
          const { r, sea } = c, bx = btw(r, 150, 172), x0 = bx - 94;
          const qp = (t, a, b, e) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * e;
          let s = `<rect x="0" y="170" width="300" height="30" fill="#C2B8A6"/><rect x="0" y="186" width="300" height="14" fill="#8E8A84"/>`;
          s += `<rect x="${f1(x0)}" y="90" width="56" height="80" fill="#E6CFA3"/><path d="M${f1(x0)} 90 V82 H${f1(x0 + 9)} V74 H${f1(x0 + 18)} V66 H${f1(x0 + 38)} V74 H${f1(x0 + 47)} V82 H${f1(x0 + 56)} V90 Z" fill="#E6CFA3" stroke="#C9A777" stroke-width="1.4"/>`;
          let nw = ""; for (let row = 0; row < 4; row++) for (let k = 0; k < 3; k++) nw += `M${f1(x0 + 8 + k * 16)} ${96 + row * 18} h8 v11 h-8 Z `;
          for (let row = 0; row < 4; row++) for (let k = 0; k < 4; k++) nw += `M${f1(bx + 46 + k * 14)} ${96 + row * 18} h7 v11 h-7 Z `;
          s += `<rect x="${f1(bx + 40)}" y="88" width="62" height="82" fill="#D7CCBA"/><rect x="${f1(bx + 38)}" y="85" width="66" height="4" fill="#C2B49C"/><path d="${nw}" fill="#7E6A55"/>`;
          s += `<rect x="${f1(bx - 40)}" y="70" width="80" height="100" fill="#C3D6CE"/>`;
          for (const sc of ["#5B8FB9", "#76A88E", "#E3B65A", "#C77B9A"]) { let m = ""; for (let i = 0; i < 8; i++) m += `M${f1(btw(r, bx - 38, bx + 36))} ${f1(btw(r, 74, 128))} h2 v2 h-2 Z `; s += `<path d="${m}" fill="${sc}"/>`; }
          s += `<path d="M${f1(bx - 40)} 72 Q${f1(bx - 32)} 58 ${f1(bx - 10)} 54 Q${f1(bx + 16)} 46 ${f1(bx + 40)} 62 L${f1(bx + 40)} 72 Z" fill="#3F7F76"/>`;
          const sk = ["#C47D99", "#5BA08F", "#D8A95C"]; let sp = ["", "", ""], rd = "";
          for (let i = 0; i < 12; i++) { const t = (i + .5) / 12, u = t < .4 ? t / .4 : (t - .4) / .6, x = t < .4 ? qp(u, bx - 40, bx - 32, bx - 10) : qp(u, bx - 10, bx + 16, bx + 40), y = t < .4 ? qp(u, 72, 58, 54) : qp(u, 54, 46, 62); sp[i % 3] += `M${f1(x - 2.6)} ${f1(y + 4)} a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0 Z `; if (x > bx - 20) rd += `M${f1(x - 1.8)} ${f1(y)} a1.8 1.8 0 1 0 3.6 0 a1.8 1.8 0 1 0 -3.6 0 Z `; }
          s += sp.map((d, i) => `<path d="${d}" fill="${sk[i]}"/>`).join("") + `<path d="${rd}" fill="#EFE3C8"/>`;
          s += `<rect x="${f1(bx - 30)}" y="46" width="9" height="26" fill="#EBDFC8"/><ellipse cx="${f1(bx - 25.5)}" cy="44" rx="5.5" ry="4.5" fill="#D9AA5C"/><path d="M${f1(bx - 25.5)} 40 V30 M${f1(bx - 29.5)} 35 H${f1(bx - 21.5)}" stroke="#D9AA5C" stroke-width="2.4" stroke-linecap="round"/>`;
          let wd = "", mk = "", ey = "";
          for (const y of [86, 102, 118]) for (const o of [-24, 0, 24]) { const x = bx + o; wd += `M${f1(x - 7)} ${y - 8} h14 v16 h-14 Z `; mk += `M${f1(x - 8)} ${y} Q${f1(x)} ${y - 5} ${f1(x + 8)} ${y} L${f1(x + 7)} ${y + 6} Q${f1(x)} ${y + 9} ${f1(x - 7)} ${y + 6} Z `; ey += `M${f1(x - 4.5)} ${y + 1} h3 v2.5 h-3 Z M${f1(x + 1.5)} ${y + 1} h3 v2.5 h-3 Z `; }
          s += `<path d="${wd}" fill="#3E4E4A"/><path d="${mk}" fill="#F0E9DA"/><path d="${ey}" fill="#3E4E4A"/>`;
          s += `<path d="M${f1(bx - 36)} 156 V138 Q${f1(bx - 24)} 128 ${f1(bx - 12)} 134 Q${f1(bx)} 126 ${f1(bx + 12)} 134 Q${f1(bx + 24)} 128 ${f1(bx + 36)} 138 V156 Z" fill="#45574F"/>`;
          let bn = ""; for (const o of [-24, -8, 8, 24]) { const x = bx + o; bn += `M${f1(x - 2)} 156 Q${f1(x - 4.5)} 147 ${f1(x - 1.5)} 141 Q${f1(x - 3.5)} 135 ${f1(x)} 132 Q${f1(x + 3.5)} 135 ${f1(x + 1.5)} 141 Q${f1(x + 4.5)} 147 ${f1(x + 2)} 156 Z `; }
          s += `<path d="${bn}" fill="#F0E9DA"/><rect x="${f1(bx - 40)}" y="156" width="80" height="14" fill="#D8CFBF"/><path d="M${f1(bx - 30)} 170 V162 Q${f1(bx - 24)} 157 ${f1(bx - 18)} 162 V170 Z M${f1(bx - 6)} 170 V162 Q${f1(bx)} 157 ${f1(bx + 6)} 162 V170 Z M${f1(bx + 18)} 170 V162 Q${f1(bx + 24)} 157 ${f1(bx + 30)} 162 V170 Z" fill="#4A4540"/>`;
          s += tree(btw(r, 14, 40), 180, 1.1, sea === "spring" ? "summer" : sea, r) + tree(btw(r, 264, 288), 180, 1.1, sea === "spring" ? "summer" : sea, r);
          return { s, l: "", perch: [[bx - 25.5, 29], [bx + 15, 50], [bx, 83]] };
        } },
      { id: "pedrera", zh: "米拉之家",
        see: ["整面石牆像海浪一樣彎來彎去", "陽台的鐵欄杆，扭得像一團海草", "屋頂的煙囪，像一排戴頭盔的士兵"],
        spots: ["屋頂一個煙囪士兵的頭盔上", "波浪石牆的窗台上"],
        draw(c) {
          const { r, sea } = c, x0 = btw(r, 34, 50), x1 = x0 + btw(r, 200, 214), xc = x0 + (x1 - x0) * .62;
          const wave = (x, a, p, f) => a * Math.sin((x - x0) / f + p), top = (x) => 80 + wave(x, 6, 0, 17), led = (i, x) => 170 - i * 15.5 + wave(x, 4.2, i * 1.3, 15), pt = sea === "spring" ? "summer" : sea;
          let s = `<rect x="0" y="170" width="300" height="30" fill="#C2B8A6"/><rect x="0" y="186" width="300" height="14" fill="#8E8A84"/>`, perch = [];
          let wb = "", wh = "", wv = "";
          for (let i = 0, wx = x0 + 18; wx < x1 - 10; i++, wx += btw(r, 30, 36)) {
            const b = top(wx) + 2, gr = i % 3 === 1;
            wb += `M${f1(wx - 4.5)} ${f1(b)} L${f1(wx - 3.2)} ${f1(b - 15)} L${f1(wx + 3.2)} ${f1(b - 15)} L${f1(wx + 4.5)} ${f1(b)} Z `;
            (gr ? (wv += `M${f1(wx - 5.5)} ${f1(b - 14)} Q${f1(wx - 5)} ${f1(b - 24)} ${f1(wx)} ${f1(b - 25)} Q${f1(wx + 5)} ${f1(b - 24)} ${f1(wx + 5.5)} ${f1(b - 14)} Z `) : (wh += `M${f1(wx - 5.5)} ${f1(b - 14)} Q${f1(wx - 5)} ${f1(b - 24)} ${f1(wx)} ${f1(b - 25)} Q${f1(wx + 5)} ${f1(b - 24)} ${f1(wx + 5.5)} ${f1(b - 14)} Z `));
            if (i === 0 || i === 3) perch.push([wx, b - 25]);
            s += `<path d="M${f1(wx - 3)} ${f1(b - 19)} h6 M${f1(wx)} ${f1(b - 22)} v6" stroke="#6E6252" stroke-width="1.2"/>`;
          }
          s += `<path d="${wb}" fill="#DCD1BC"/><path d="${wh}" fill="#CFC2A9"/><path d="${wv}" fill="#8EAE84"/>`;
          let d = `M${f1(x0)} 170 `; for (let x = x0; x < x1; x += 6) d += `L${f1(x)} ${f1(top(x))} `;
          s += `<path d="${d}L${f1(x1)} ${f1(top(x1))} L${f1(x1)} 170 Z" fill="#E6DDCA"/>`;
          let d2 = `M${f1(xc)} 170 `; for (let x = xc; x < x1; x += 6) d2 += `L${f1(x)} ${f1(top(x))} `;
          s += `<path d="${d2}L${f1(x1)} ${f1(top(x1))} L${f1(x1)} 170 Z" fill="#DCD1BC"/>`;
          let lg = ""; for (let i = 1; i <= 5; i++) { lg += `M${f1(x0)} ${f1(led(i, x0))} `; for (let x = x0 + 8; x <= x1; x += 8) lg += `L${f1(x)} ${f1(led(i, x))} `; }
          s += `<path d="${lg}" stroke="#CDBFA5" stroke-width="2.2" fill="none"/>`;
          let wn = "", ir = "";
          for (let i = 0; i < 6; i++) for (let wx = x0 + 8; wx < x1 - 12; wx += 22) {
            const yb = led(i, wx + 6) - 2.5, h = i === 0 ? 11 : 8;
            wn += `M${f1(wx)} ${f1(yb - h)} h11 v${h} h-11 Z `;
            if (i > 0) ir += `M${f1(wx - 1)} ${f1(yb)} q3 -5 6.5 -1 t6.5 0 `;
          }
          s += `<path d="${wn}" fill="#5E554B"/><path d="${ir}" stroke="#2E2A26" stroke-width="1.2" fill="none"/>`;
          s += tree(btw(r, 8, 26), 182, 1.15, pt, r) + tree(btw(r, 274, 290), 182, 1.15, pt, r);
          const wx2 = x0 + 8 + 22 * 4 + 5; perch.push([wx2, led(2, wx2 + 1) - 3]);
          return { s, l: "", perch: perch.slice(0, 3) };
        } },
      { id: "playa", zh: "巴塞隆納海灘",
        see: ["紅色的纜車從海的上面慢慢飄過去", "浪花一層一層地往沙灘上推", "海邊那棟大樓，長得像一片船帆"],
        spots: ["纜車車廂的頂上", "纜車鐵塔的最上面"],
        draw(c) {
          const { r, sea } = c, tx = btw(r, 200, 222);
          const qp = (t, a, b, e) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * e;
          let s = `<rect x="0" y="118" width="300" height="52" fill="#3F8FB2"/><rect x="0" y="118" width="300" height="3" fill="#8CC0D4"/>`;
          let wv = ""; for (let i = 0; i < 9; i++) wv += `M${f1(btw(r, 0, 280))} ${f1(btw(r, 128, 160))} q4 -2 8 0 t8 0 `;
          s += `<path d="${wv}" stroke="#FFFFFF" stroke-opacity=".5" stroke-width=".9" fill="none"/>`;
          s += `<rect x="254" y="117" width="36" height="5" fill="#C9C1B0"/><path d="M258 120 L260 80 Q268 66 286 64 L286 120 Z" fill="#8FB0C8"/><path d="M262 110 H286 M261 100 H286 M261 90 H286 M264 80 H286" stroke="#B6CEDC" stroke-width="1"/>`;
          if (r() < .6) s += boat(btw(r, 30, 170), btw(r, 142, 156), .9, true);
          s += `<rect x="${f1(tx - 13)}" y="154" width="26" height="8" fill="#9A9388"/><path d="M${f1(tx - 8)} 156 L${f1(tx - 2.5)} 62 M${f1(tx + 8)} 156 L${f1(tx + 2.5)} 62" stroke="#6F7378" stroke-width="2.2"/>`;
          let z = ""; for (let y = 156, k = 0; y > 66; y -= 10, k++) { const hw = 2.5 + (y - 62) / 94 * 5.5, hw2 = 2.5 + (y - 10 - 62) / 94 * 5.5; z += k % 2 ? `M${f1(tx + hw)} ${y} L${f1(tx - hw2)} ${y - 10} ` : `M${f1(tx - hw)} ${y} L${f1(tx + hw2)} ${y - 10} `; }
          s += `<path d="${z}" stroke="#6F7378" stroke-width="1"/><rect x="${f1(tx - 10)}" y="50" width="20" height="12" fill="#7D8186"/><rect x="${f1(tx - 12)}" y="48" width="24" height="3" fill="#5F6368"/>`;
          const ax = tx - 8;
          s += `<path d="M${f1(ax)} 56 Q${f1(ax / 2)} 86 0 104" stroke="#3A3A3A" stroke-width="1.3" fill="none"/>`;
          const cab = [];
          for (const t0 of [.3, .66]) { const t = t0 + btw(r, -.04, .04), x = qp(t, ax, ax / 2, 0), y = qp(t, 56, 86, 104); cab.push([x, y]); s += `<path d="M${f1(x)} ${f1(y)} v7" stroke="#3A3A3A" stroke-width="1.3"/><rect x="${f1(x - 8)}" y="${f1(y + 7)}" width="16" height="12" rx="2" fill="#C8382E"/><rect x="${f1(x - 6)}" y="${f1(y + 9)}" width="12" height="4" fill="#DCE7EE"/><rect x="${f1(x - 8)}" y="${f1(y + 17)}" width="16" height="2" fill="#8E2A22"/>`; }
          s += `<path d="M0 200 L0 170 Q150 158 300 168 L300 200 Z" fill="#EAD6A6"/><path d="M0 170 Q150 158 300 168" stroke="#F7F4EC" stroke-width="2" fill="none"/>`;
          const n = sea === "summer" ? 6 : sea === "winter" ? 1 : 3, uc = ["#E2473B", "#F2C230", "#3D7CC9", "#57A85C", "#E77FB0"];
          for (let i = 0; i < n; i++) { const ux = btw(r, 16, 286), uy = btw(r, 180, 194); s += `<path d="M${f1(ux)} ${f1(uy)} V${f1(uy - 16)}" stroke="#6A5A4A" stroke-width="1.2"/><path d="M${f1(ux - 11)} ${f1(uy - 15)} Q${f1(ux)} ${f1(uy - 27)} ${f1(ux + 11)} ${f1(uy - 15)} Z" fill="${pick(r, uc)}"/><path d="M${f1(ux)} ${f1(uy - 21)} L${f1(ux - 4)} ${f1(uy - 15)} L${f1(ux + 4)} ${f1(uy - 15)} Z" fill="#F7F3EA"/>`; }
          return { s, l: "", perch: [[tx, 47], [cab[0][0], cab[0][1] + 7], [cab[1][0], cab[1][1] + 7]] };
        } },
      { id: "rambla", zh: "蘭布拉大道",
        see: ["大道中間給人走，車子只能走兩邊", "路邊有一攤一攤賣花的小亭子", "路的盡頭有一根柱子，哥倫布站在上面"],
        spots: ["梧桐樹的樹枝上", "花攤的綠色屋頂", "哥倫布伸出去的手上"],
        draw(c) {
          const { r, sea } = c, vx = btw(r, 152, 170), vy = 126;
          let s = `<rect x="0" y="${vy}" width="300" height="${200 - vy}" fill="#A29B8F"/>`;
          const facade = (sd, col, lc) => {
            const e = vx + sd * 30, o = sd < 0 ? 0 : 300, ty = (x) => 70 + (112 - 70) * (x - o) / (e - o), by = (x) => 176 + (128 - 176) * (x - o) / (e - o);
            let f = `<path d="M${o} 70 L${f1(e)} 112 L${f1(e)} 128 L${o} 176 Z" fill="${col}"/>`, ln = "", wn = "";
            const xs = []; for (let k = 0; k <= 6; k++) xs.push(o + (e - o) * (1 - Math.pow(.68, k)));
            for (let k = 0; k < 6; k++) { const a = xs[k], b = xs[k + 1], m = a + (b - a) * .3, ww = (b - a) * .4; if (k) ln += `M${f1(a)} ${f1(ty(a))} L${f1(a)} ${f1(by(a))} `; for (const rw of [.22, .5]) { const yt = ty(m) + (by(m) - ty(m)) * rw, hh = (by(m) - ty(m)) * .15; wn += `M${f1(m)} ${f1(yt)} h${f1(ww)} v${f1(hh)} h${f1(-ww)} Z `; } }
            return f + `<path d="${ln}" stroke="${lc}" stroke-width="1.2"/><path d="${wn}" fill="#7E6248"/>`;
          };
          s += facade(-1, "#DDB98C", "#C49F74") + facade(1, "#D2A47C", "#B98B64");
          s += `<rect x="${f1(vx - 30)}" y="116" width="18" height="12" fill="#C9B79E"/><rect x="${f1(vx + 12)}" y="114" width="18" height="14" fill="#C2AE94"/>`;
          s += `<path d="M${f1(vx - 8)} ${vy} L${f1(vx + 8)} ${vy} L${f1(vx + 84)} 200 L${f1(vx - 84)} 200 Z" fill="#E4DAC7"/>`;
          let wv = ""; for (let j = 0; j < 7; j++) { const y = vy + 74 * Math.pow((j + 1) / 7, 1.5) - 1, hw = 8 + (y - vy) / 74 * 76, wl = hw * 2 / 6, a = 1 + (y - vy) / 74 * 2.5; wv += `M${f1(vx - hw)} ${f1(y)} q${f1(wl / 4)} ${f1(-a)} ${f1(wl / 2)} 0 t${f1(wl / 2)} 0 t${f1(wl / 2)} 0 t${f1(wl / 2)} 0 t${f1(wl / 2)} 0 t${f1(wl / 2)} 0 t${f1(wl / 2)} 0 t${f1(wl / 2)} 0 t${f1(wl / 2)} 0 t${f1(wl / 2)} 0 t${f1(wl / 2)} 0 t${f1(wl / 2)} 0 `; }
          s += `<path d="${wv}" stroke="#C9BBA2" stroke-width="1" fill="none"/>`;
          s += `<rect x="${f1(vx - 10)}" y="124" width="20" height="5" fill="#A89A7E"/><rect x="${f1(vx - 7)}" y="110" width="14" height="15" fill="#B5A688"/><rect x="${f1(vx - 2.6)}" y="63" width="5.2" height="48" fill="#8E7A58"/><rect x="${f1(vx - 4)}" y="60" width="8" height="3.5" fill="#8E7A58"/><circle cx="${f1(vx)}" cy="56" r="4.4" fill="#9C8558"/>`;
          s += `<path d="M${f1(vx - 2.6)} 52 L${f1(vx + 2.6)} 52 L${f1(vx + 1.8)} 42 L${f1(vx - 1.8)} 42 Z" fill="#6E5E45"/><circle cx="${f1(vx)}" cy="40" r="1.9" fill="#6E5E45"/><path d="M${f1(vx + 1.2)} 44.5 L${f1(vx + 8.5)} 39.5" stroke="#6E5E45" stroke-width="1.5" stroke-linecap="round"/>`;
          const kiosk = (kx, ky, k) => { let f = `<rect x="${f1(kx - 14 * k)}" y="${f1(ky - 16 * k)}" width="${f1(28 * k)}" height="${f1(16 * k)}" fill="#3E6B4F"/><path d="M${f1(kx - 17 * k)} ${f1(ky - 16 * k)} L${f1(kx + 17 * k)} ${f1(ky - 16 * k)} L${f1(kx + 13 * k)} ${f1(ky - 21 * k)} L${f1(kx - 13 * k)} ${f1(ky - 21 * k)} Z" fill="#2E5240"/>`; for (let i = 0; i < 6; i++) f += `<circle cx="${f1(kx + (-12 + i * 4.8) * k)}" cy="${f1(ky - 2 * k)}" r="${f1(2.4 * k)}" fill="${pick(r, ["#E25A6A", "#F2C04A", "#F28FB0", "#F4F1EA", "#E9824A"])}"/>`; return f; };
          let perch = [[vx, 38.5]], fr = "";
          for (const d of [.18, .32, .5, .72, .98]) for (const sd of [-1, 1]) { const y = vy + 74 * d, x = vx + sd * (12 + 88 * d), sc = .5 + 1.9 * d; fr += tree(x, y, sc, sea === "spring" ? "summer" : sea, r); if (d === .98 && sd < 0) perch.push([x, y - 30 * sc]); }
          const k1x = vx + 30, k1y = 160, k2x = vx - btw(r, 52, 60), k2y = 192;
          s += kiosk(k1x, k1y, .7) + fr + kiosk(k2x, k2y, 1);
          perch.push([k2x, k2y - 21]);
          return { s, l: "", perch };
        } },
    ],
  },
};
