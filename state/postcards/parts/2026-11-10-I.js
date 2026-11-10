var CITIES_PART = {
  copenhagen: {
    zh: "哥本哈根", de: "København", gift: "一小塊樂高積木",
    sights: [
      { id: "nyhavn", zh: "新港", see: ["運河邊的房子漆成黃色、紅色和藍色", "老木船一艘接一艘地靠在岸邊", "安徒生以前就住在這排房子裡"], spots: ["木船的桅杆頂上", "彩色房子的屋簷上"],
        draw(c) {
          const { r, sea } = c, k = btw(r, .94, 1.06), cols = ["#E8B84A", "#C9533C", "#4F7FA8", "#E28A3A", "#7FA07A", "#E9D9B4", "#B8402E"];
          let s = `<rect x="0" y="148" width="300" height="12" fill="#B9A78C"/>` + water(158, "#9CB9C6", "#4F7389", r), perch = [], win = "", x = btw(r, -8, 0), ci = Math.floor(r() * 7);
          while (x < 300) {
            const w = btw(r, 20, 27), h = btw(r, 46, 70) * k * (x < 110 ? .78 : 1), top = 150 - h, pk = btw(r, 10, 15);
            s += `<rect x="${f1(x)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" fill="${cols[ci++ % 7]}"/><path d="M${f1(x - 1)} ${f1(top)} L${f1(x + w / 2)} ${f1(top - pk)} L${f1(x + w + 1)} ${f1(top)} Z" fill="${r() < .6 ? "#8A3E2E" : "#5E5A58"}"/>`;
            if (sea === "winter") s += `<path d="M${f1(x)} ${f1(top - 1)} L${f1(x + w / 2)} ${f1(top - pk)} L${f1(x + w)} ${f1(top - 1)}" stroke="#F4F6F5" stroke-width="2" fill="none"/>`;
            for (let yy = top + 6; yy < 140; yy += 12) for (let q = 0; q < 3; q++) win += `M${f1(x + 3 + q * (w - 10) / 2)} ${f1(yy)}h4v5h-4Z`;
            if (x > 150 && perch.length < 1) perch.push([x + w / 2, top - pk - 1]);
            x += w;
          }
          s += `<path d="${win}" fill="#3E3A36" opacity=".55"/>`;
          const ship = (bx, L, mh) => `<path d="M${f1(bx)} 166 h${f1(L)} l-7 10 h${f1(-L + 16)} Z" fill="#6A4A36"/><rect x="${f1(bx + 4)}" y="168" width="${f1(L - 10)}" height="2" fill="#E9E1D0"/><path d="M${f1(bx + L * .4)} 166 v${f1(-mh)} M${f1(bx + L * .72)} 166 v${f1(-mh * .8)} M${f1(bx + L * .4 - 9)} ${f1(166 - mh * .75)} h18 M${f1(bx + L * .72 - 7)} ${f1(166 - mh * .6)} h14 M${f1(bx + L * .4)} ${f1(166 - mh)} L${f1(bx - 8)} 162 L${f1(bx)} 166" stroke="#4A3426" stroke-width="1.3" fill="none"/>`;
          const b1 = btw(r, 130, 160), b2 = btw(r, 215, 235), b0 = btw(r, 18, 50);
          s += ship(b0, 44, 52) + ship(b1, 64, 92 * k) + ship(b2, 54, 76 * k);
          perch.push([b1 + 25.6, 165 - 92 * k], [b2 + 21.6, 165 - 76 * k]);
          return { s, l: "", perch };
        } },
      { id: "mermaid", zh: "小美人魚", see: ["銅像比我想像的還要小很多", "她坐在石頭上，一直望著大海", "岸邊總是圍著一群拍照的人"], spots: ["海邊的大石頭上", "銅像的肩膀上"],
        draw(c) {
          const { r, sea } = c, mx = btw(r, 170, 205), k = btw(r, 1.2, 1.38), P = (u, v) => `${f1(mx + u * k)} ${f1(150 + v * k)}`;
          let s = `<path d="M0 128 L0 122 h40 v-6 h20 v6 h50 v-10 h8 v10 h70 v-4 h30 v4 h82 v6 Z" fill="#8E9AA6"/><rect x="242" y="96" width="4" height="26" fill="#8E9AA6"/>` + water(128, "#A8C4CE", "#5D8597", r), perch = [];
          s += `<path d="M0 200 L0 168 Q60 160 120 176 L130 200 Z" fill="${{ spring: "#8FAE72", summer: "#6E9A55", autumn: "#A99A5A", winter: "#E6E8E6" }[sea]}"/>`;
          for (let i = 0; i < 2; i++) s += tree(btw(r, 14, 96), btw(r, 178, 186), btw(r, .9, 1.15), sea, r);
          s += `<ellipse cx="${f1(mx - 30)}" cy="174" rx="40" ry="18" fill="#7C7872"/><ellipse cx="${f1(mx + 22)}" cy="178" rx="34" ry="14" fill="#8E8A84"/><ellipse cx="${f1(mx - 4)}" cy="163" rx="28" ry="15" fill="#9A968F"/><path d="M${f1(mx - 70)} 186 q8 -3 16 0 M${f1(mx + 40)} 190 q8 -3 16 0" stroke="#fff" stroke-opacity=".7" stroke-width="1.2" fill="none"/>`;
          s += `<path d="M${P(-24, 0)} Q${P(-4, -10)} ${P(16, -6)} Q${P(26, -4)} ${P(30, 0)} L${P(36, -4)} L${P(35, 4)} L${P(27, 4)} Q${P(6, 4)} ${P(-24, 3)} Z" fill="#4F5E48"/>`;
          s += `<path d="M${P(-23, -1)} Q${P(-25, -18)} ${P(-16, -32)} L${P(-8, -32)} Q${P(-6, -18)} ${P(-5, -3)} Z" fill="#5A6B52"/><ellipse cx="${f1(mx - 14 * k)}" cy="${f1(150 - 35 * k)}" rx="${f1(4.2 * k)}" ry="${f1(7 * k)}" fill="#46543F"/><circle cx="${f1(mx - 11 * k)}" cy="${f1(150 - 38 * k)}" r="${f1(5.2 * k)}" fill="#5A6B52"/>`;
          s += `<path d="M${P(-10, -28)} Q${P(-2, -18)} ${P(2, -5)}" stroke="#5A6B52" stroke-width="${f1(3 * k)}" stroke-linecap="round" fill="none"/>`;
          perch.push([mx - 11 * k, 150 - 44 * k], [mx - 40, 157], [mx + 30, 165]);
          if (r() < .5) s += boat(btw(r, 30, 110), btw(r, 140, 150), .8, true);
          return { s, l: "", perch };
        } },
      { id: "tivoli", zh: "蒂沃利樂園", see: ["木頭雲霄飛車已經跑了一百多年", "湖邊有一座紅綠相間的寶塔", "樹上和小路旁掛滿了小燈泡"], spots: ["寶塔的塔頂上", "雲霄飛車的木架上"],
        draw(c) {
          const { r, sea } = c, px = btw(r, 200, 232), ph = btw(r, .95, 1.1), ty = (x) => 116 + 18 * Math.sin((x - 18) / 17);
          let s = `<rect x="0" y="160" width="300" height="40" fill="${{ spring: "#8FAE72", summer: "#6E9A55", autumn: "#A99A5A", winter: "#E6E8E6" }[sea]}"/>`, perch = [], posts = "", trk = "M18 160";
          for (let x = 22; x <= 158; x += 6) { const y = ty(x); posts += `M${f1(x)} ${f1(y)} V162 `; trk += ` L${f1(x)} ${f1(y)}`; }
          for (let x = 22; x < 158; x += 12) posts += `M${f1(x)} ${f1(ty(x) + 6)} L${f1(x + 6)} 160 M${f1(x + 6)} ${f1(ty(x + 6) + 6)} L${f1(x + 12)} 160 `;
          s += `<path d="${posts}" stroke="#9A7A58" stroke-width=".9" fill="none"/><path d="${trk} L162 160" stroke="#6A4A36" stroke-width="2.6" fill="none"/>`;
          const cx = btw(r, 60, 140); s += `<rect x="${f1(cx - 7)}" y="${f1(ty(cx) - 7)}" width="14" height="6" rx="2" fill="#C8302A"/><circle cx="${f1(cx - 3)}" cy="${f1(ty(cx) - 9)}" r="2" fill="#3A3330"/><circle cx="${f1(cx + 3)}" cy="${f1(ty(cx) - 9)}" r="2" fill="#3A3330"/>`;
          perch.push([40, ty(40) - 1]);
          s += `<ellipse cx="${f1(px)}" cy="182" rx="56" ry="9" fill="#6F9DB0"/><path d="M${f1(px - 30)} 182 q5 -2 10 0 M${f1(px + 14)} 184 q5 -2 10 0" stroke="#fff" stroke-opacity=".6" stroke-width="1" fill="none"/>`;
          let y = 168;
          for (let i = 0; i < 4; i++) {
            const w = (38 - i * 7) * ph, h = (17 - i * 1.5) * ph;
            s += `<rect x="${f1(px - w / 2)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(h)}" fill="#B8402E"/><rect x="${f1(px - 3)}" y="${f1(y - h + 4)}" width="6" height="${f1(h - 6)}" fill="#E5BF55"/>`;
            s += `<path d="M${f1(px - w / 2 - 10)} ${f1(y - h - 2)} Q${f1(px - w / 2)} ${f1(y - h + 1)} ${f1(px - w / 3)} ${f1(y - h - 6)} L${f1(px)} ${f1(y - h - 12)} L${f1(px + w / 3)} ${f1(y - h - 6)} Q${f1(px + w / 2)} ${f1(y - h + 1)} ${f1(px + w / 2 + 10)} ${f1(y - h - 2)} L${f1(px + w / 2)} ${f1(y - h - 5)} L${f1(px)} ${f1(y - h - 14)} L${f1(px - w / 2)} ${f1(y - h - 5)} Z" fill="#2F6B55" stroke="#E5BF55" stroke-width=".8"/>`;
            y -= h + 11;
          }
          s += `<path d="M${f1(px)} ${f1(y + 8)} v-16" stroke="#E5BF55" stroke-width="2"/><circle cx="${f1(px)}" cy="${f1(y - 8)}" r="2.2" fill="#E5BF55"/>`;
          perch.push([px, y - 10]);
          let bulbs = ""; for (let i = 0; i <= 10; i++) { const t = i / 10, bx = 150 + t * (px - 175), by = 128 + t * 8 + Math.sin(t * Math.PI) * 10; bulbs += `<circle cx="${f1(bx)}" cy="${f1(by)}" r="1.6" fill="#F2D27A"/>`; }
          s += `<path d="M150 128 Q${f1(150 + (px - 175) / 2)} ${f1(152)} ${f1(px - 25)} 136" stroke="#5A4A3A" stroke-width=".6" fill="none"/>${bulbs}<path d="M${f1(px - 25)} 136 V168" stroke="#5A4A3A" stroke-width="1.4"/>`;
          for (let i = 0; i < 3; i++) s += tree(i === 0 ? btw(r, 20, 140) : i === 1 ? btw(r, px + 62, 296) : btw(r, 150, px - 62), btw(r, 176, 192), btw(r, .9, 1.2), sea, r);
          return { s, l: "", perch };
        } },
      { id: "amalienborg", zh: "阿美琳堡宮", see: ["四座一樣的宮殿圍著一個廣場", "廣場中間有國王騎馬的銅像", "衛兵戴著高高的黑毛帽走來走去"], spots: ["騎馬銅像的頭上", "大理石教堂的圓頂上"],
        draw(c) {
          const { r, sea } = c, ax = btw(r, 160, 195), snow = sea === "winter";
          let s = "", perch = [], win = "";
          s += `<rect x="${f1(ax - 26)}" y="92" width="52" height="40" fill="#DCD3C2"/><path d="M${f1(ax - 30)} 92 Q${f1(ax - 30)} 56 ${f1(ax)} 56 Q${f1(ax + 30)} 56 ${f1(ax + 30)} 92 Z" fill="${snow ? "#B9CFC6" : "#6E9C88"}"/><path d="M${f1(ax - 15)} 90 Q${f1(ax - 12)} 64 ${f1(ax)} 57 M${f1(ax + 15)} 90 Q${f1(ax + 12)} 64 ${f1(ax)} 57 M${f1(ax)} 57 V92" stroke="#4E7A66" stroke-width=".8" fill="none"/><rect x="${f1(ax - 5)}" y="46" width="10" height="11" fill="#DCD3C2"/><path d="M${f1(ax - 6)} 46 q6 -8 12 0 Z" fill="#6E9C88"/>`;
          for (let i = 0; i < 6; i++) s += `<rect x="${f1(ax - 24 + i * 9.4)}" y="96" width="2.4" height="34" fill="#BDB2A0"/>`;
          perch.push([ax, 41]);
          for (const [x0, x1] of [[ax - 150, ax - 36], [ax + 36, Math.min(ax + 150, 302)]]) {
            s += `<rect x="${f1(x0)}" y="108" width="${f1(x1 - x0)}" height="56" fill="#E6DAC2"/><path d="M${f1(x0 - 2)} 108 L${f1(x0 + 6)} 96 L${f1(x1 - 6)} 96 L${f1(x1 + 2)} 108 Z" fill="${snow ? "#EEF1F1" : "#6E7378"}"/>`;
            for (let x = x0 + 6; x < x1 - 6; x += 11) for (const yy of [114, 130, 146]) win += `M${f1(x)} ${yy} h5 v8 h-5 Z `;
          }
          s += `<path d="${win}" fill="#5E6670" opacity=".7"/><rect x="0" y="162" width="300" height="38" fill="#CBBDA4"/><path d="M0 172 H300 M0 184 H300" stroke="#B5A68C" stroke-width=".8"/>`;
          s += `<rect x="${f1(ax - 11)}" y="128" width="22" height="34" fill="#CFC5B2"/><rect x="${f1(ax - 14)}" y="126" width="28" height="4" fill="#BDB2A0"/>`;
          s += `<ellipse cx="${f1(ax)}" cy="117" rx="12" ry="5.5" fill="#4F6E5E"/><path d="M${f1(ax - 9)} 120 l-2 6 M${f1(ax - 5)} 121 l0 5 M${f1(ax + 6)} 121 l2 5 M${f1(ax + 9)} 119 l5 5" stroke="#4F6E5E" stroke-width="2.2" fill="none"/><path d="M${f1(ax + 9)} 115 L${f1(ax + 15)} 104 L${f1(ax + 19)} 106 L${f1(ax + 13)} 118 Z" fill="#4F6E5E"/><rect x="${f1(ax - 3)}" y="102" width="6" height="12" fill="#4F6E5E"/><circle cx="${f1(ax)}" cy="99" r="3" fill="#4F6E5E"/>`;
          perch.push([ax, 95]);
          const guard = (gx) => `<rect x="${f1(gx - 3)}" y="176" width="6" height="12" fill="#8FB0D0"/><rect x="${f1(gx - 4)}" y="164" width="8" height="13" fill="#23365C"/><path d="M${f1(gx - 4)} 164 L${f1(gx + 4)} 176 M${f1(gx + 4)} 164 L${f1(gx - 4)} 176" stroke="#F4F1EA" stroke-width="1.1"/><circle cx="${f1(gx)}" cy="161" r="2.6" fill="#E7C4A0"/><rect x="${f1(gx - 3.6)}" y="148" width="7.2" height="12" rx="3.4" fill="#1E1E22"/><path d="M${f1(gx + 6)} 186 V158" stroke="#4A3A2E" stroke-width="1.2"/>`;
          s += guard(ax - btw(r, 52, 70)) + guard(ax + btw(r, 52, 74));
          return { s, l: "", perch };
        } },
      { id: "bikes", zh: "腳踏車與運河", see: ["這裡的人騎腳踏車上班上學", "有一座橋只給腳踏車和走路的人過", "運河邊停了一整排的腳踏車"], spots: ["腳踏車的坐墊上", "腳踏車橋的欄杆上"],
        draw(c) {
          const { r, sea } = c, h0 = btw(r, 134, 138);
          let s = "", perch = [], x = btw(r, -6, 0);
          while (x < 300) { const w = btw(r, 26, 40), h = btw(r, 10, 18); s += `<rect x="${f1(x)}" y="${f1(140 - h)}" width="${f1(w)}" height="${f1(h)}" fill="${pick(r, ["#C9C2B4", "#B7B9B4", "#D6CBB6", "#A9AFAF"])}"/><path d="M${f1(x + 4)} ${f1(146 - h)} h${f1(w - 8)}" stroke="#8C9294" stroke-width="2" stroke-dasharray="3 3"/>`; x += w + btw(r, 0, 3); }
          s += water(140, "#9CB9C6", "#4F7389", r);
          const dy = (u) => h0 - Math.sin(u / 300 * Math.PI) * 22;
          let deck = "M0 " + f1(dy(0)), rail = "", piers = "";
          for (let u = 10; u <= 300; u += 10) { deck += ` L${u} ${f1(dy(u))}`; rail += `M${u} ${f1(dy(u))} v-6 `; }
          for (let u = 40; u < 300; u += 70) piers += `M${u} ${f1(dy(u) + 3)} V156 `;
          s += `<path d="${piers}" stroke="#8C9294" stroke-width="2.4"/><path d="${deck}" stroke="#D9DCDC" stroke-width="5" fill="none"/><path d="${deck}" stroke="#E07A3A" stroke-width="2" fill="none"/><path d="${rail}" stroke="#7E868A" stroke-width=".7"/><path d="${deck.replace(/ (\d+(?:\.\d)?)(?= L|$)/g, (m, n) => " " + f1(n - 6))}" stroke="#7E868A" stroke-width=".9" fill="none"/>`;
          const cu = btw(r, 150, 250); s += `<circle cx="${f1(cu - 4)}" cy="${f1(dy(cu) - 5)}" r="3.4" stroke="#2E2E2E" stroke-width=".9" fill="none"/><circle cx="${f1(cu + 5)}" cy="${f1(dy(cu) - 5)}" r="3.4" stroke="#2E2E2E" stroke-width=".9" fill="none"/><path d="M${f1(cu - 1)} ${f1(dy(cu) - 9)} l3 -8" stroke="#3E5568" stroke-width="2.4" stroke-linecap="round"/><circle cx="${f1(cu + 2.5)}" cy="${f1(dy(cu) - 19)}" r="2" fill="#E7C4A0"/>`;
          perch.push([60, dy(60) - 7], [270, dy(270) - 7]);
          s += `<rect x="0" y="174" width="300" height="26" fill="#B9A78C"/><path d="M0 176 H300" stroke="#9A8A70" stroke-width="1.4"/>`;
          if (sea !== "winter") s += tree(btw(r, 8, 24), 182, .9, sea, r);
          for (let i = 0, bx = btw(r, 30, 44); i < 6 && bx < 272; i++, bx += btw(r, 36, 44)) {
            const col = pick(r, ["#C8302A", "#2F5E8C", "#3E7A4A", "#2E2E2E", "#E0B04A", "#E9E1D0"]);
            s += `<circle cx="${f1(bx)}" cy="184" r="7.5" stroke="#2E2E2E" stroke-width="1.4" fill="none"/><circle cx="${f1(bx + 21)}" cy="184" r="7.5" stroke="#2E2E2E" stroke-width="1.4" fill="none"/><path d="M${f1(bx)} 184 L${f1(bx + 9)} 184 L${f1(bx + 7)} 172 M${f1(bx)} 184 L${f1(bx + 7)} 172 L${f1(bx + 17)} 172 L${f1(bx + 9)} 184 M${f1(bx + 17)} 172 L${f1(bx + 21)} 184 M${f1(bx + 17)} 172 l-1 -4 h4" stroke="${col}" stroke-width="1.8" fill="none" stroke-linejoin="round"/><rect x="${f1(bx + 4)}" y="169.5" width="6" height="2.2" rx="1" fill="#3A3330"/>`;
            if (r() < .35) s += `<rect x="${f1(bx + 18)}" y="166" width="7" height="5" fill="#B08A5A"/>`;
            if (i === 2) perch.push([bx + 7, 169]);
          }
          return { s, l: "", perch };
        } },
      { id: "rundetaarn", zh: "圓塔", see: ["塔裡是一圈一圈往上繞的斜坡", "塔頂上有一座小小的圓頂天文台", "從塔頂可以看到一大片紅色屋頂"], spots: ["天文台的圓頂上", "塔頂的欄杆上"],
        draw(c) {
          const { r, sea } = c, tx = btw(r, 140, 168), k = btw(r, .93, 1.07), R = 27 * k, top = 168 - 106 * k, snow = sea === "winter";
          let s = "", perch = [], x = btw(r, -6, 0);
          while (x < tx - R - 10) { const w = btw(r, 22, 30), h = btw(r, 30, 44); s += `<rect x="${f1(x)}" y="${f1(168 - h)}" width="${f1(w)}" height="${f1(h)}" fill="${pick(r, ["#E8DCC2", "#E2C9A3", "#D7C2A0", "#C9B79A"])}"/><path d="M${f1(x - 1)} ${f1(168 - h)} L${f1(x + w / 2)} ${f1(158 - h)} L${f1(x + w + 1)} ${f1(168 - h)} Z" fill="${snow ? "#EEF1F1" : "#9A4E3C"}"/><path d="M${f1(x + 5)} ${f1(176 - h)} h4 v6 h-4 Z M${f1(x + w - 9)} ${f1(176 - h)} h4 v6 h-4 Z" fill="#4A3F38" opacity=".55"/>`; x += w + 1; }
          const cx0 = tx + R - 4;
          s += `<rect x="${f1(cx0)}" y="112" width="${f1(300 - cx0)}" height="56" fill="#B06A4C"/><path d="M${f1(cx0 - 2)} 112 L${f1(cx0 + 10)} 98 L302 98 L302 112 Z" fill="${snow ? "#EEF1F1" : "#6A5550"}"/>`;
          for (let wx = cx0 + 14; wx < 290; wx += 22) s += `<path d="M${f1(wx)} 160 v-30 q5 -8 10 0 v30 Z" fill="#5A4A40" opacity=".65"/>`;
          s += `<rect x="${f1(tx - R)}" y="${f1(top)}" width="${f1(2 * R)}" height="${f1(168 - top)}" fill="#A65A3E"/><rect x="${f1(tx - R)}" y="${f1(top)}" width="${f1(R * .3)}" height="${f1(168 - top)}" fill="#8C4A33"/><rect x="${f1(tx + R * .7)}" y="${f1(top)}" width="${f1(R * .3)}" height="${f1(168 - top)}" fill="#8C4A33"/>`;
          let bricks = ""; for (let yy = top + 8; yy < 166; yy += 7) bricks += `M${f1(tx - R)} ${f1(yy)} H${f1(tx + R)} `;
          s += `<path d="${bricks}" stroke="#94503A" stroke-width=".5"/>`;
          for (let i = 0; i < 7; i++) { const wx = tx + Math.sin(i * 1.25) * R * .55, wy = 160 - 12 * k - i * 12 * k; s += `<path d="M${f1(wx - 2.5)} ${f1(wy)} v-6 q2.5 -4 5 0 v6 Z" fill="#3F2E26"/>`; }
          s += `<rect x="${f1(tx - R * .55)}" y="${f1(top + 12 * k)}" width="${f1(R * 1.1)}" height="${f1(7 * k)}" fill="#C9A445"/><path d="M${f1(tx - R * .5)} ${f1(top + 15.5 * k)} h${f1(R)}" stroke="#7A5A24" stroke-width="1" stroke-dasharray="2 1.5"/>`;
          s += `<rect x="${f1(tx - R - 2)}" y="${f1(top - 4)}" width="${f1(2 * R + 4)}" height="5" fill="#7E4430"/><path d="M${f1(tx - R)} ${f1(top - 4)} v-6 H${f1(tx + R)} v6 ${Array.from({ length: 9 }, (_, i) => `M${f1(tx - R + i * R / 4)} ${f1(top - 4)} v-6`).join(" ")}" stroke="#3A3330" stroke-width=".9" fill="none"/>`;
          s += `<rect x="${f1(tx - 7)}" y="${f1(top - 14)}" width="14" height="10" fill="#E4DED0"/><path d="M${f1(tx - 9)} ${f1(top - 14)} Q${f1(tx - 9)} ${f1(top - 26)} ${f1(tx)} ${f1(top - 26)} Q${f1(tx + 9)} ${f1(top - 26)} ${f1(tx + 9)} ${f1(top - 14)} Z" fill="${snow ? "#EEF1F1" : "#5F6E74"}"/>`;
          perch.push([tx, top - 27], [tx + R - 4, top - 11]);
          s += `<rect x="0" y="168" width="300" height="32" fill="#B9A78C"/><path d="M0 180 H300" stroke="#A3927A" stroke-width=".8"/>`;
          if (r() < .6) s += tree(btw(r, 230, 290), 186, btw(r, .9, 1.1), sea, r);
          return { s, l: "", perch };
        } },
    ],
  },
  stockholm: {
    zh: "斯德哥爾摩", de: "Stockholm", gift: "一隻小小的達拉木馬",
    sights: [
      { id: "gamlastan", zh: "老城", see: ["廣場邊的房子又高又窄地擠在一起", "牆壁是暖暖的橘色、黃色和紅色", "廣場中間有一口石頭砌的老井"], spots: ["尖尖的山牆頂上", "老井的頂上"],
        draw(c) {
          const { r, sea } = c, cols = ["#D99A3A", "#C8562E", "#A83A2A", "#E6C27A", "#C77B3E", "#E0B060", "#9C4A34"], snow = sea === "winter";
          let s = "", perch = [], win = "", x = btw(r, -6, 0), ci = Math.floor(r() * 7);
          while (x < 300) {
            const w = btw(r, 30, 40), h = btw(r, 70, 92) * (x < 100 ? .66 : 1), top = 172 - h, col = cols[ci++ % 7], t = r();
            s += `<rect x="${f1(x)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" fill="${col}"/>`;
            let g;
            if (t < .45) { const sw = w / 7; g = `M${f1(x)} ${f1(top)}`; for (let i = 0; i < 3; i++) g += ` v-6 h${f1(sw)}`; g += ` v-6 h${f1(sw)}`; for (let i = 0; i < 3; i++) g += ` v6 h${f1(sw)}`; g += " v6 Z"; }
            else if (t < .8) g = `M${f1(x)} ${f1(top)} Q${f1(x + w * .1)} ${f1(top - 10)} ${f1(x + w * .3)} ${f1(top - 12)} L${f1(x + w * .3)} ${f1(top - 20)} Q${f1(x + w / 2)} ${f1(top - 30)} ${f1(x + w * .7)} ${f1(top - 20)} L${f1(x + w * .7)} ${f1(top - 12)} Q${f1(x + w * .9)} ${f1(top - 10)} ${f1(x + w)} ${f1(top)} Z`;
            else g = `M${f1(x)} ${f1(top)} L${f1(x + w / 2)} ${f1(top - 18)} L${f1(x + w)} ${f1(top)} Z`;
            s += `<path d="${g}" fill="${col}"/>`;
            if (snow) s += `<path d="M${f1(x + w * .3)} ${f1(top - 1)} h${f1(w * .4)}" stroke="#F4F6F5" stroke-width="2"/>`;
            for (let yy = top + 6; yy < 152; yy += 12) for (let q = 0; q < 3; q++) win += `M${f1(x + w * (.16 + q * .27))} ${f1(yy)} h4.5 v7 h-4.5 Z `;
            s += `<path d="M${f1(x + w / 2 - 4)} 172 v-10 q4 -5 8 0 v10 Z" fill="#4A3426"/>`;
            if (x > 130 && perch.length < 1) perch.push([x + w / 2, top - (t < .45 ? 24 : t < .8 ? 25 : 18) - 1]);
            x += w;
          }
          s += `<path d="${win}" fill="#3E342C" opacity=".55"/><rect x="0" y="172" width="300" height="28" fill="#BBA98E"/>`;
          let cob = ""; for (let i = 0; i < 26; i++) cob += `M${f1(btw(r, 0, 296))} ${f1(btw(r, 177, 197))} h4 `;
          s += `<path d="${cob}" stroke="#9E8D74" stroke-width="1.2"/>`;
          const wx = btw(r, 135, 175);
          s += `<rect x="${f1(wx - 10)}" y="166" width="20" height="16" fill="#A39C90"/><rect x="${f1(wx - 12)}" y="163" width="24" height="4" fill="#8E877C"/><path d="M${f1(wx - 3)} 163 V150 M${f1(wx + 3)} 163 V150" stroke="#6E675E" stroke-width="2"/><path d="M${f1(wx - 7)} 151 L${f1(wx)} 143 L${f1(wx + 7)} 151 Z" fill="#6E675E"/>`;
          perch.push([wx, 142]);
          return { s, l: "", perch };
        } },
      { id: "stadshuset", zh: "斯德哥爾摩市政廳", see: ["紅磚砌成的大樓就蓋在水邊", "高塔的頂上有三個金色的皇冠", "諾貝爾獎的晚宴就在這裡舉行"], spots: ["金皇冠的旁邊", "拱廊的屋簷上"],
        draw(c) {
          const { r, sea } = c, sx = btw(r, 178, 206), snow = sea === "winter", cu = snow ? "#D9E4E0" : "#6E9C88";
          let s = water(160, "#9CB9C6", "#4F7389", r), perch = [];
          s += `<rect x="${f1(sx - 130)}" y="112" width="130" height="50" fill="#A9472F"/><path d="M${f1(sx - 133)} 112 L${f1(sx - 124)} 102 L${f1(sx - 4)} 102 L${f1(sx)} 112 Z" fill="${cu}"/>`;
          let arch = ""; for (let ax = sx - 124; ax < sx - 8; ax += 13) arch += `M${f1(ax)} 162 v-12 q5 -8 10 0 v12 Z `;
          s += `<path d="${arch}" fill="#4A2A22" opacity=".7"/><path d="M${f1(sx - 124)} 124 H${f1(sx - 6)}" stroke="#E8DCC2" stroke-width="1.4" stroke-dasharray="3 4"/>`;
          s += `<rect x="${f1(sx - 112)}" y="88" width="16" height="16" fill="#A9472F"/><path d="M${f1(sx - 114)} 88 Q${f1(sx - 104)} 72 ${f1(sx - 94)} 88 Z" fill="${cu}"/><path d="M${f1(sx - 104)} 76 v-6" stroke="#E5BF55" stroke-width="1.4"/>`;
          s += `<rect x="${f1(sx)}" y="68" width="28" height="94" fill="#A9472F"/><rect x="${f1(sx + 20)}" y="68" width="8" height="94" fill="#8F3A26"/><rect x="${f1(sx - 2)}" y="64" width="32" height="6" fill="#7E3322"/>`;
          for (let i = 0; i < 4; i++) s += `<rect x="${f1(sx + 6)}" y="${f1(78 + i * 20)}" width="3" height="9" fill="#4A2A22"/><rect x="${f1(sx + 15)}" y="${f1(78 + i * 20)}" width="3" height="9" fill="#4A2A22"/>`;
          s += `<rect x="${f1(sx + 4)}" y="50" width="20" height="14" fill="${cu}"/><path d="M${f1(sx + 8)} 62 v-9 M${f1(sx + 14)} 62 v-9 M${f1(sx + 20)} 62 v-9" stroke="#3E5A4E" stroke-width="2"/><path d="M${f1(sx + 3)} 50 L${f1(sx + 14)} 40 L${f1(sx + 25)} 50 Z" fill="${cu}"/><path d="M${f1(sx + 14)} 40 V30" stroke="#E5BF55" stroke-width="1.4"/>`;
          const crown = (x, y) => `<path d="M${f1(x - 4)} ${f1(y)} h8 l1.2 -6 l-2.6 2.4 l-2.6 -3.4 l-2.6 3.4 l-2.6 -2.4 Z" fill="#E5BF55"/>`;
          s += crown(sx + 14, 29) + crown(sx + 8, 37) + crown(sx + 20, 37);
          perch.push([sx + 14, 22], [sx - 60, 101]);
          if (r() < .55) s += boat(btw(r, 20, 120), btw(r, 176, 188), 1, false);
          return { s, l: "", perch };
        } },
      { id: "vasa", zh: "瓦薩號", see: ["這艘大船第一次出航就沉了", "在海底睡了三百多年才被撈起來", "高高的船尾刻滿了獅子和人像"], spots: ["高高的船桅頂上", "船尾的雕花上"],
        draw(c) {
          const { r } = c, vx = btw(r, 118, 136), k = btw(r, .94, 1.04), X = (u) => f1(vx + u * k), Y = (v) => f1(160 - (160 - v) * k);
          let s = `<rect x="0" y="166" width="300" height="34" fill="#6B6258"/><path d="M0 180 H300 M0 186 H300" stroke="#8A8074" stroke-width="1"/>`, perch = [];
          for (const u of [36, 64, 92, 120]) s += `<path d="M${X(u - 4)} 166 L${X(u)} ${Y(156)} L${X(u + 4)} 166 Z" fill="#3E3630"/>`;
          let mast = "";
          for (const [u, h] of [[40, 92], [80, 102], [118, 78]]) { mast += `M${X(u)} ${Y(130)} V${Y(130 - h)} M${X(u - 16 + h / 10)} ${Y(130 - h * .55)} h${f1((32 - h / 5) * k)} M${X(u - 10)} ${Y(130 - h * .85)} h${f1(20 * k)} `; }
          s += `<path d="M${X(-14)} ${Y(104)} L${X(10)} ${Y(128)} M${X(80)} ${Y(28)} L${X(-14)} ${Y(104)} M${X(80)} ${Y(28)} L${X(150)} ${Y(96)} M${X(40)} ${Y(38)} L${X(4)} ${Y(126)}" stroke="#7A6A58" stroke-width=".7" fill="none"/><path d="${mast}" stroke="#4A3326" stroke-width="2" fill="none"/>`;
          s += `<rect x="${X(36)}" y="${Y(80)}" width="${f1(8 * k)}" height="${f1(3 * k)}" fill="#4A3326"/><rect x="${X(76)}" y="${Y(74)}" width="${f1(8 * k)}" height="${f1(3 * k)}" fill="#4A3326"/>`;
          s += `<path d="M${X(0)} ${Y(124)} L${X(14)} ${Y(128)} Q${X(70)} ${Y(134)} ${X(118)} ${Y(124)} L${X(124)} ${Y(98)} L${X(150)} ${Y(94)} L${X(149)} ${Y(128)} Q${X(142)} ${Y(150)} ${X(122)} ${Y(158)} L${X(34)} ${Y(158)} Q${X(16)} ${Y(150)} ${X(8)} ${Y(132)} Z" fill="#4A3326"/>`;
          s += `<path d="M${X(14)} ${Y(131)} Q${X(70)} ${Y(137)} ${X(122)} ${Y(127)}" stroke="#C9A445" stroke-width="1.6" fill="none"/><path d="M${X(126)} ${Y(100)} L${X(147)} ${Y(97)} L${X(146)} ${Y(126)} Q${X(136)} ${Y(132)} ${X(124)} ${Y(126)} Z" fill="#7A5A30"/>`;
          let orn = ""; for (let i = 0; i < 9; i++) orn += `<circle cx="${X(129 + (i % 3) * 7)}" cy="${Y(104 + Math.floor(i / 3) * 8)}" r="${f1(1.8 * k)}" fill="#E0B84A"/>`;
          let ports = ""; for (let i = 0; i < 8; i++) for (const v of [138, 147]) ports += `M${X(28 + i * 11)} ${Y(v + (i - 4) * (i - 4) * .06)} h${f1(4.5 * k)} v${f1(4 * k)} h${f1(-4.5 * k)} Z `;
          s += orn + `<path d="${ports}" fill="#A33A2A"/><path d="M${X(-6)} ${Y(120)} L${X(4)} ${Y(118)} L${X(6)} ${Y(126)} Z" fill="#C9A445"/>`;
          perch.push([vx + 80 * k, 160 - 132 * k], [vx + 140 * k, 160 - 67 * k]);
          s += `<path d="M10 176 H120 M10 176 V188 M60 176 V188 M110 176 V188" stroke="#3A3330" stroke-width="1.4"/>`;
          return { s, l: "", perch };
        } },
      { id: "skargard", zh: "斯德哥爾摩群島", see: ["小島上有一間紅色的小木屋", "窗框和屋角都漆成乾淨的白色", "光滑的大石頭一直延伸到水裡"], spots: ["紅屋的屋脊上", "旗桿的頂上"],
        draw(c) {
          const { r, sea } = c, ix = btw(r, 170, 200), snow = sea === "winter";
          let s = `<path d="M0 142 Q20 132 46 136 Q70 128 96 142 Z M232 142 Q262 134 300 138 V142 Z" fill="#4E6A58"/>` + water(142, "#9CB9C6", "#4F7389", r), perch = [];
          s += `<path d="M${f1(ix - 96)} 176 Q${f1(ix - 66)} 146 ${f1(ix - 20)} 146 Q${f1(ix + 40)} 142 ${f1(ix + 76)} 160 Q${f1(ix + 96)} 170 ${f1(ix + 104)} 180 Z" fill="#A89C94"/><path d="M${f1(ix - 80)} 166 Q${f1(ix - 50)} 150 ${f1(ix - 10)} 150" stroke="#C4BAB0" stroke-width="3" fill="none"/>`;
          const hx = ix - 30, hy = 148;
          s += `<rect x="${f1(hx)}" y="${f1(hy - 26)}" width="46" height="26" fill="#9E2B23"/><path d="M${f1(hx - 4)} ${f1(hy - 26)} L${f1(hx + 23)} ${f1(hy - 44)} L${f1(hx + 50)} ${f1(hy - 26)} Z" fill="${snow ? "#EEF1F1" : "#3E3A3A"}"/><rect x="${f1(hx + 32)}" y="${f1(hy - 44)}" width="5" height="10" fill="#7A6A5E"/>`;
          s += `<rect x="${f1(hx)}" y="${f1(hy - 26)}" width="2.5" height="26" fill="#F4F1EA"/><rect x="${f1(hx + 43.5)}" y="${f1(hy - 26)}" width="2.5" height="26" fill="#F4F1EA"/><rect x="${f1(hx + 6)}" y="${f1(hy - 20)}" width="9" height="9" fill="#F4F1EA"/><rect x="${f1(hx + 7.5)}" y="${f1(hy - 18.5)}" width="6" height="6" fill="#5E7584"/><rect x="${f1(hx + 31)}" y="${f1(hy - 20)}" width="9" height="9" fill="#F4F1EA"/><rect x="${f1(hx + 32.5)}" y="${f1(hy - 18.5)}" width="6" height="6" fill="#5E7584"/><rect x="${f1(hx + 19)}" y="${f1(hy - 17)}" width="8" height="17" fill="#F4F1EA"/><rect x="${f1(hx + 20.5)}" y="${f1(hy - 15.5)}" width="5" height="15.5" fill="#6A2A22"/>`;
          perch.push([hx + 23, hy - 45]);
          const fx = ix + 34; s += `<path d="M${f1(fx)} 150 V104" stroke="#F4F1EA" stroke-width="1.6"/><rect x="${f1(fx + 1)}" y="104" width="16" height="10" fill="#2D5DA8"/><path d="M${f1(fx + 6)} 104 v10 M${f1(fx + 1)} 109 h16" stroke="#F2C744" stroke-width="2.2"/>`;
          perch.push([fx, 103]);
          for (const [px, ph] of [[ix + 56, 46], [ix + 70, 36]]) s += `<path d="M${f1(px)} 162 V${f1(162 - ph * .3)}" stroke="#5A4232" stroke-width="2"/><path d="M${f1(px - 10)} ${f1(162 - ph * .3)} L${f1(px)} ${f1(162 - ph)} L${f1(px + 10)} ${f1(162 - ph * .3)} Z M${f1(px - 8)} ${f1(162 - ph * .55)} L${f1(px)} ${f1(162 - ph * 1.1)} L${f1(px + 8)} ${f1(162 - ph * .55)} Z" fill="#2F4A38"/>`;
          s += tree(ix - 50, 158, 1, sea, r);
          s += `<rect x="${f1(ix - 20)}" y="164" width="12" height="26" fill="#8A6A4A"/><path d="M${f1(ix - 20)} 172 h12 M${f1(ix - 20)} 180 h12" stroke="#6A4A36" stroke-width=".8"/>`;
          if (r() < .7) s += boat(btw(r, 30, 80), btw(r, 172, 186), 1.2, true);
          return { s, l: "", perch };
        } },
      { id: "slottet", zh: "斯德哥爾摩皇宮", see: ["方方正正的宮殿，窗戶多到數不完", "穿制服的衛兵站在門口一動也不動", "大大的宮殿就在老城旁邊的水邊"], spots: ["宮殿屋頂的欄杆上", "旗桿的頂上"],
        draw(c) {
          const { r } = c, px = btw(r, 74, 92), w = btw(r, 190, 204), cx = px + w / 2;
          let s = water(160, "#9CB9C6", "#4F7389", r), perch = [], win = "";
          s += `<rect x="0" y="152" width="300" height="9" fill="#B5A88F"/><path d="M0 146 H${f1(px - 4)} V160 H0 Z" fill="#9C9384"/><path d="M8 160 q8 -12 16 0 Z M34 160 q8 -12 16 0 Z" fill="#4F7389"/>`;
          s += `<rect x="${f1(px)}" y="94" width="${f1(w)}" height="58" fill="#CDB892"/><rect x="${f1(px)}" y="138" width="${f1(w)}" height="14" fill="#B39E7A"/><rect x="${f1(cx - 22)}" y="86" width="44" height="66" fill="#D6C29C"/>`;
          s += `<rect x="${f1(px - 2)}" y="90" width="${f1(w + 4)}" height="4" fill="#A8946E"/><rect x="${f1(cx - 24)}" y="82" width="48" height="4" fill="#A8946E"/>`;
          let bal = ""; for (let x = px + 2; x < px + w; x += 5) bal += `M${f1(x)} 90 v-4 `;
          s += `<path d="${bal}M${f1(px)} 86 H${f1(px + w)}" stroke="#A8946E" stroke-width="1" fill="none"/>`;
          for (let x = px + 6; x < px + w - 6; x += 10.5) for (const yy of [98, 112, 126]) win += `M${f1(x)} ${yy} h4.5 v8 h-4.5 Z `;
          for (let x = px + 8; x < px + w - 8; x += 15) win += `M${f1(x)} 142 h5 v6 h-5 Z `;
          s += `<path d="${win}" fill="#5E5446" opacity=".7"/><path d="M${f1(cx - 5)} 152 v-12 q5 -6 10 0 v12 Z" fill="#3E342C"/>`;
          s += `<path d="M${f1(cx)} 82 V56" stroke="#5A4A3A" stroke-width="1.4"/><rect x="${f1(cx + 1)}" y="56" width="16" height="10" fill="#2D5DA8"/><path d="M${f1(cx + 6)} 56 v10 M${f1(cx + 1)} 61 h16" stroke="#F2C744" stroke-width="2.2"/>`;
          perch.push([cx, 55], [px + 30, 85]);
          const guard = (gx) => `<rect x="${f1(gx - 2)}" y="142" width="4" height="10" fill="#23365C"/><circle cx="${f1(gx)}" cy="140" r="2" fill="#E7C4A0"/><path d="M${f1(gx - 2.4)} 139 h4.8 l-.6 -3 h-3.6 Z" fill="#23365C"/><path d="M${f1(gx + 3)} 151 V136" stroke="#4A3A2E" stroke-width=".9"/>`;
          s += guard(cx - 14) + guard(cx + 14);
          if (r() < .55) s += boat(btw(r, 100, 230), btw(r, 176, 188), 1.1, false);
          return { s, l: "", perch };
        } },
      { id: "globen", zh: "艾維奇體育館", see: ["它像一顆放在地上的白色大球", "以前大家都叫它球形體育館", "這裡常常舉辦演唱會和冰球比賽"], spots: ["大白球的頂上", "旁邊大樓的屋頂上"],
        draw(c) {
          const { r, sea } = c, gx = btw(r, 178, 205), R = btw(r, 52, 58), cy = 170 - R * .82;
          let s = hills(150, "#9DAEB0", r, 8), perch = [], x = btw(r, -6, 4);
          while (x < gx - R - 6) { const w = btw(r, 22, 34), h = btw(r, 22, 44); s += `<rect x="${f1(x)}" y="${f1(170 - h)}" width="${f1(w)}" height="${f1(h)}" fill="${pick(r, ["#C9C2B4", "#B7B9B4", "#D6CBB6", "#A9AFAF"])}"/><path d="M${f1(x + 4)} ${f1(176 - h)} h${f1(w - 8)} M${f1(x + 4)} ${f1(184 - h)} h${f1(w - 8)}" stroke="#7E868A" stroke-width="2" stroke-dasharray="3 3"/>`; if (!perch.length && x > 30) perch.push([x + w / 2, 170 - h]); x += w + btw(r, 2, 6); }
          s += `<rect x="${f1(gx + R - 4)}" y="134" width="44" height="36" fill="#B7B9B4"/><path d="M${f1(gx + R)} 140 h36 M${f1(gx + R)} 148 h36 M${f1(gx + R)} 156 h36" stroke="#7E868A" stroke-width="2" stroke-dasharray="3 3"/>`;
          s += `<circle cx="${f1(gx)}" cy="${f1(cy)}" r="${f1(R)}" fill="#F3F1EA" stroke="#BDB9AE" stroke-width="1"/><path d="M${f1(gx + R * .2)} ${f1(cy - R * .98)} A${f1(R)} ${f1(R)} 0 0 1 ${f1(gx + R * .2)} ${f1(cy + R * .98)} A${f1(R * .8)} ${f1(R)} 0 0 0 ${f1(gx + R * .2)} ${f1(cy - R * .98)} Z" fill="#DEDBD0"/>`;
          let grid = ""; for (const f of [.3, .62, .88]) grid += `<ellipse cx="${f1(gx)}" cy="${f1(cy)}" rx="${f1(R * f)}" ry="${f1(R)}" stroke="#CBC6BA" stroke-width=".8" fill="none"/>`;
          for (const d of [-.7, -.4, -.1, .2, .5]) { const a = Math.sqrt(1 - d * d) * R; grid += `<path d="M${f1(gx - a)} ${f1(cy + d * R)} H${f1(gx + a)}" stroke="#CBC6BA" stroke-width=".8"/>`; }
          s += grid + `<rect x="0" y="170" width="300" height="30" fill="${{ spring: "#9DB08A", summer: "#7FA06A", autumn: "#B2A274", winter: "#E6E8E6" }[sea]}"/><rect x="${f1(gx - 14)}" y="160" width="28" height="10" fill="#8E9294"/><rect x="0" y="186" width="300" height="14" fill="#A9A49A"/>`;
          perch.push([gx, cy - R - 1], [gx + R + 18, 133]);
          for (let i = 0; i < 3; i++) s += tree(btw(r, 0, 1) < .5 ? btw(r, 10, gx - R - 10) : btw(r, gx + R + 46, 296), btw(r, 176, 184), btw(r, .8, 1.05), sea, r);
          return { s, l: "", perch };
        } },
    ],
  },
  reykjavik: {
    zh: "雷克雅維克", de: "Reykjavík", gift: "一雙冰島羊毛小襪子",
    sights: [
      { id: "hallgrimskirkja", zh: "哈爾格林姆教堂", see: ["教堂的形狀像一根一根的玄武岩柱", "門口站著探險家萊夫的銅像", "從塔上可以看到整座城的彩色屋頂"], spots: ["教堂尖塔的頂上", "銅像的頭上"],
        draw(c) {
          const { r, sea } = c, hx = btw(r, 160, 190), k = btw(r, .93, 1.05), top = 170 - 104 * k, cw = 13 * k;
          let s = hills(158, "#A9B2B4", r, 6), perch = [], cols = "";
          for (const sgn of [-1, 1]) for (let i = 1; i <= 5; i++) {
            const x0 = hx + sgn * (cw + (i - 1) * 9 * k), sy = top + 12 * k + i * 15 * k, xl = sgn < 0 ? x0 - 9 * k : x0;
            s += `<rect x="${f1(xl)}" y="${f1(sy)}" width="${f1(9 * k + .4)}" height="${f1(170 - sy)}" fill="${i % 2 ? "#D3CFC6" : "#C7C2B8"}"/>`;
            cols += `M${f1(xl + 4.5 * k)} ${f1(sy + 3)} V170 `;
          }
          s += `<path d="${cols}" stroke="#B4AEA3" stroke-width=".7"/><rect x="${f1(hx - cw)}" y="${f1(top)}" width="${f1(2 * cw)}" height="${f1(170 - top)}" fill="#DAD6CD"/><path d="M${f1(hx - cw)} ${f1(top)} L${f1(hx)} ${f1(top - 32 * k)} L${f1(hx + cw)} ${f1(top)} Z" fill="#CFCBC1"/><path d="M${f1(hx)} ${f1(top - 32 * k)} L${f1(hx + cw)} ${f1(top)} H${f1(hx)} Z" fill="#BDB8AE"/>`;
          s += `<circle cx="${f1(hx)}" cy="${f1(top + 9 * k)}" r="${f1(4 * k)}" fill="#F2EFE8" stroke="#6E6A62" stroke-width=".8"/><path d="M${f1(hx - 7 * k)} ${f1(top + 18 * k)} v${f1(12 * k)} M${f1(hx)} ${f1(top + 18 * k)} v${f1(12 * k)} M${f1(hx + 7 * k)} ${f1(top + 18 * k)} v${f1(12 * k)} M${f1(hx - 5 * k)} ${f1(top + 40 * k)} v${f1(40 * k)} M${f1(hx + 5 * k)} ${f1(top + 40 * k)} v${f1(40 * k)}" stroke="#8E897F" stroke-width="2"/><path d="M${f1(hx - 7)} 170 v-14 q7 -10 14 0 v14 Z" fill="#6E6A62"/>`;
          perch.push([hx, top - 32 * k - 1], [hx - cw - 31.5 * k, top + 72 * k]);
          s += `<rect x="0" y="170" width="300" height="30" fill="${{ spring: "#9DB08A", summer: "#7FA06A", autumn: "#B2A274", winter: "#E6E8E6" }[sea]}"/><path d="M${f1(hx - 40)} 200 L${f1(hx - 14)} 170 H${f1(hx + 14)} L${f1(hx + 40)} 200 Z" fill="#A9A49A"/>`;
          s += `<rect x="${f1(hx - 7)}" y="176" width="14" height="16" fill="#8E8A84"/><rect x="${f1(hx - 9)}" y="190" width="18" height="4" fill="#7A766F"/><path d="M${f1(hx - 3.5)} 176 L${f1(hx - 2.5)} 164 H${f1(hx + 2.5)} L${f1(hx + 3.5)} 176 Z" fill="#4A4E48"/><circle cx="${f1(hx)}" cy="161.5" r="2.4" fill="#4A4E48"/><path d="M${f1(hx + 4)} 176 V160" stroke="#4A4E48" stroke-width="1"/>`;
          perch.push([hx, 158.5]);
          for (let i = 0; i < 2; i++) s += tree(i ? btw(r, 250, 290) : btw(r, 14, 70), btw(r, 180, 188), btw(r, .8, 1), sea, r);
          return { s, l: "", perch };
        } },
      { id: "harpa", zh: "哈帕音樂廳", see: ["整面牆都是一格一格的玻璃窗", "太陽一照，玻璃閃著不同的顏色", "音樂廳就蓋在港口的海水旁邊"], spots: ["玻璃屋頂的邊上", "港口的繫船柱上"],
        draw(c) {
          const { r } = c, x0 = btw(r, 104, 120), W = btw(r, 150, 164), roof = (u) => (u < .55 ? 120 - u / .55 * 30 : u < .74 ? 90 + (u - .55) / .19 * 16 : 106 - (u - .74) / .26 * 22);
          let s = `<path d="M0 150 H${f1(x0 - 6)} V162 H0 Z" fill="#A9A49A"/>` + water(166, "#7FA3B5", "#3F6378", r), perch = [];
          let out = `M${f1(x0)} 162`; for (let u = 0; u <= 1.001; u += .05) out += ` L${f1(x0 + u * W)} ${f1(roof(u))}`;
          s += `<rect x="${f1(x0 - 6)}" y="162" width="${f1(W + 12)}" height="5" fill="#3A3E42"/><path d="${out} L${f1(x0 + W)} 162 Z" fill="#4F7F96"/>`;
          let cells = "", grid = "", cw = W / 20;
          for (let i = 0; i < 20; i++) { const xx = x0 + i * cw, t = Math.max(roof(i / 20), roof((i + 1) / 20)); grid += `M${f1(xx)} ${f1(roof(i / 20))} V162 `; for (let yy = 160 - 6; yy > t; yy -= 6) { grid += `M${f1(xx)} ${f1(yy + (i % 2) * 3)} h${f1(cw)} `; if (r() < .18) cells += `<rect x="${f1(xx)}" y="${f1(yy + (i % 2) * 3)}" width="${f1(cw)}" height="6" fill="${pick(r, ["#9CC7D2", "#BFE0E4", "#7AAE9A", "#D9C46A", "#6E9FC0"])}"/>`; } }
          s += cells + `<path d="${grid}" stroke="#2F4E5E" stroke-width=".6" fill="none"/><path d="${out} L${f1(x0 + W)} 162" stroke="#2F4E5E" stroke-width="1.4" fill="none"/>`;
          perch.push([x0 + .55 * W, 89], [x0 + W - 1, 83]);
          s += `<rect x="${f1(x0 - 30)}" y="155" width="5" height="7" fill="#2E2E2E"/>`;
          if (r() < .6) s += boat(btw(r, 30, 200), btw(r, 180, 190), 1, false);
          return { s, l: "", perch };
        } },
      { id: "solfarid", zh: "太陽航海者", see: ["銀色的鋼船架在海邊閃閃發亮", "它是一艘獻給太陽的夢之船", "海灣對面是一座山頂平平的大山"], spots: ["翹起來的船頭尖上", "船架的骨頭上"],
        draw(c) {
          const { r, sea } = c, sx = btw(r, 168, 196), k = btw(r, 1.04, 1.16), P = (u, v) => `${f1(sx + u * k)} ${f1(160 + v * k)}`;
          let s = `<path d="M0 132 L0 120 Q40 110 80 108 L210 105 Q252 108 300 118 L300 132 Z" fill="#7F8EA3"/>`, perch = [];
          if (sea === "winter" || sea === "spring") s += `<path d="M86 110 l5 7 M120 109 l4 8 M160 108 l6 8 M196 107 l4 7 M232 109 l6 7" stroke="#F4F6F5" stroke-opacity=".85" stroke-width="1.6" stroke-linecap="round"/>`;
          s += water(130, "#9CB9C6", "#4F7389", r) + `<path d="M0 200 L0 172 Q90 166 160 170 T300 168 L300 200 Z" fill="#8A8580"/>`;
          for (let i = 0; i < 7; i++) s += `<ellipse cx="${f1(btw(r, 10, 290))}" cy="${f1(btw(r, 180, 194))}" rx="${f1(btw(r, 6, 12))}" ry="4" fill="${pick(r, ["#6E6A66", "#9A958E", "#7A756F"])}"/>`;
          s += `<rect x="${f1(sx - 62 * k)}" y="168" width="${f1(124 * k)}" height="7" fill="#B9B5AE"/><path d="M${P(-26, 0)} V168 M${P(30, 0)} V168" stroke="#6F7A82" stroke-width="2"/>`;
          s += `<path d="M${P(-82, -34)} Q${P(-62, -2)} ${P(-30, 0)} L${P(42, 0)} Q${P(66, -2)} ${P(74, -30)} L${P(70, -30)} Q${P(62, -8)} ${P(40, -6)} L${P(-28, -6)} Q${P(-56, -8)} ${P(-76, -34)} Z" fill="#AEB7BE" stroke="#6F7A82" stroke-width=".8"/>`;
          let ribs = ""; for (let i = 0; i < 7; i++) { const u = -38 + i * 12, h = 22 + (3 - Math.abs(i - 3)) * 5; ribs += `M${P(u, -5)} L${P(u + 3, -5 - h)} `; }
          s += `<path d="${ribs}M${P(-30, -5)} L${P(-78, -30)} M${P(40, -5)} L${P(72, -28)}" stroke="#9AA4AC" stroke-width="${f1(2.2 * k)}" stroke-linecap="round" fill="none"/><path d="${ribs}" stroke="#E4E8EA" stroke-width=".7" fill="none"/>`;
          perch.push([sx - 82 * k, 160 - 35 * k], [sx + 3 * k, 160 - 43 * k]);
          return { s, l: "", perch };
        } },
      { id: "reynisfjara", zh: "黑沙灘", see: ["整片沙灘都是黑黑的小石子和沙", "岩壁是一根一根的六角形石柱", "海裡站著幾根尖尖的大石頭"], spots: ["石柱的頂上", "海邊的大石頭上"],
        draw(c) {
          const { r, sea } = c, st = btw(r, 196, 228), cx0 = btw(r, 62, 76);
          let s = water(122, "#8FA5AE", "#50687A", r), perch = [];
          s += `<path d="M0 172 L0 86 Q30 80 62 84 L98 94 L118 172 Z" fill="#3A3A3E"/><path d="M0 87 Q30 81 62 85 L98 95" stroke="${sea === "winter" ? "#EEF1F1" : "#6E8E5A"}" stroke-width="5" fill="none"/>`;
          for (let i = 0; i < 11; i++) { const h = 22 + (5 - Math.abs(i - 5)) * 8, x = cx0 + i * 7; s += `<rect x="${f1(x)}" y="${f1(172 - h)}" width="7" height="${f1(h)}" fill="${i % 2 ? "#3E3C40" : "#4A484C"}"/><rect x="${f1(x)}" y="${f1(172 - h)}" width="7" height="2" fill="#6A686C"/>`; }
          perch.push([cx0 + 38.5, 109]);
          s += `<path d="M${f1(st - 12)} 168 L${f1(st - 6)} 110 L${f1(st - 1)} 96 L${f1(st + 3)} 70 L${f1(st + 8)} 94 L${f1(st + 13)} 120 L${f1(st + 16)} 168 Z" fill="#2F2E33"/><path d="M${f1(st + 24)} 168 L${f1(st + 28)} 124 L${f1(st + 33)} 92 L${f1(st + 39)} 118 L${f1(st + 44)} 168 Z" fill="#38373C"/><path d="M${f1(st + 52)} 168 L${f1(st + 56)} 136 L${f1(st + 60)} 116 L${f1(st + 65)} 140 L${f1(st + 68)} 168 Z" fill="#2F2E33"/>`;
          s += `<path d="M${f1(st - 14)} 166 q8 -3 16 0 M${f1(st + 22)} 166 q8 -3 16 0 M${f1(st + 50)} 166 q8 -3 16 0" stroke="#fff" stroke-opacity=".8" stroke-width="1.6" fill="none"/>`;
          perch.push([st + 3, 69], [st + 33, 91]);
          s += `<path d="M0 200 L0 172 Q80 164 160 170 T300 166 L300 200 Z" fill="#2C2B2D"/><path d="M118 174 Q180 168 240 170 T300 167" stroke="#F4F6F5" stroke-width="2.2" fill="none"/><path d="M130 178 Q200 172 300 172" stroke="#4A4A50" stroke-width="3" fill="none"/>`;
          return { s, l: "", perch };
        } },
      { id: "skogafoss", zh: "斯科加瀑布", see: ["瀑布又寬又直地從綠色懸崖掉下來", "水花很大，走近一點就全身濕了", "晴天的時候水霧裡會出現彩虹"], spots: ["懸崖頂上的草地", "瀑布旁的階梯欄杆上"],
        draw(c) {
          const { r, sea } = c, fx = btw(r, 150, 186), fw = btw(r, 32, 40), g = { spring: "#7FA56A", summer: "#5E8C4A", autumn: "#9C8A4A", winter: "#E3E7E6" }[sea];
          let s = `<path d="M0 156 L0 84 Q40 78 80 82 T${f1(fx)} 80 L${f1(fx + fw)} 80 Q${f1(fx + fw + 50)} 76 300 84 L300 156 Z" fill="#56664E"/><path d="M0 84 Q40 78 80 82 T${f1(fx)} 80 M${f1(fx + fw)} 80 Q${f1(fx + fw + 50)} 76 300 84" stroke="${g}" stroke-width="7" fill="none"/>`, perch = [];
          let streak = ""; for (let i = 0; i < 12; i++) { const x = btw(r, 4, 296); if (x < fx - 4 || x > fx + fw + 4) streak += `M${f1(x)} ${f1(btw(r, 92, 110))} v${f1(btw(r, 18, 40))} `; }
          s += `<path d="${streak}" stroke="#46553F" stroke-width="2.4"/><rect x="${f1(fx)}" y="80" width="${f1(fw)}" height="80" fill="#EEF3F4"/>`;
          let fl = ""; for (let i = 1; i < 6; i++) fl += `M${f1(fx + i * fw / 6)} 82 V158 `;
          s += `<path d="${fl}" stroke="#B9D2DA" stroke-width="1"/><path d="M0 200 L0 156 H300 V200 Z" fill="${g}"/><path d="M${f1(fx - 10)} 160 Q${f1(fx - 30)} 182 ${f1(fx - 50)} 200 H${f1(fx + fw + 60)} Q${f1(fx + fw + 30)} 182 ${f1(fx + fw + 10)} 160 Z" fill="#8FB2BE"/>`;
          s += `<ellipse cx="${f1(fx + fw / 2)}" cy="160" rx="${f1(fw * .9)}" ry="9" fill="#F4F7F7" opacity=".85"/><ellipse cx="${f1(fx + fw / 2 - 10)}" cy="152" rx="14" ry="7" fill="#F4F7F7" opacity=".6"/><ellipse cx="${f1(fx + fw / 2 + 12)}" cy="154" rx="12" ry="6" fill="#F4F7F7" opacity=".6"/>`;
          if (sea !== "winter" && r() < .6) { let rb = ""; ["#E06A5A", "#F2C744", "#6FAE6A", "#5A8AC8"].forEach((col, i) => { const R = 30 - i * 2.4, ox = fx + fw / 2 + 6; rb += `<path d="M${f1(ox - R)} 166 A${f1(R)} ${f1(R)} 0 0 1 ${f1(ox + R)} 166" stroke="${col}" stroke-width="2.2" stroke-opacity=".5" fill="none"/>`; }); s += rb; }
          const sx = fx + fw + btw(r, 44, 64); let st = `M${f1(sx)} 156`; for (let i = 0; i < 6; i++) st += ` l${i % 2 ? -10 : 10} -12`; s += `<path d="${st}" stroke="#8A7A62" stroke-width="1.6" fill="none"/>`;
          perch.push([fx - 14, 79], [sx, 85]);
          const px = fx + fw + btw(r, 33, 45); s += `<rect x="${f1(px - 1.6)}" y="170" width="3.2" height="7" fill="#C8302A"/><circle cx="${f1(px)}" cy="168" r="1.8" fill="#E7C4A0"/>`;
          return { s, l: "", perch };
        } },
      { id: "roofs", zh: "彩色屋頂", see: ["小房子的屋頂是紅色、藍色和綠色的", "牆和屋頂都是一片一片的波浪鐵皮", "市中心的湖邊有好多鴨子和天鵝"], spots: ["紅色鐵皮屋頂上", "煙囪的頂上"],
        draw(c) {
          const { r, sea } = c, snow = sea === "winter", walls = ["#F2EEE4", "#E9D9A8", "#D9E2E4", "#F0D7C2", "#E8E4D8"], roofs = ["#C23B2E", "#3E6FA8", "#4F8A5A", "#B8402E", "#2E5E8C", "#5E9A6A"];
          let s = hills(118, "#8FA0B6", r, 14) + hills(136, "#7E9A86", r, 8), perch = [], spare = [], cor = "", cor2 = "", ri = Math.floor(r() * 6);
          const row = (base, sc, x) => {
            let o = "";
            while (x < 300) {
              const w = btw(r, 28, 38) * sc, h = btw(r, 18, 26) * sc, rh = btw(r, 11, 15) * sc, top = base - h, rc = roofs[ri++ % 6];
              o += `<rect x="${f1(x)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" fill="${pick(r, walls)}"/><path d="M${f1(x - 2)} ${f1(top)} L${f1(x + w / 2)} ${f1(top - rh)} L${f1(x + w + 2)} ${f1(top)} Z" fill="${rc}"/>`;
              if (sc > 1.2) for (let xx = x + 1.5; xx < Math.min(x + w, 300); xx += 4.4) { const yy = top - rh * (1 - Math.abs(xx - x - w / 2) / (w / 2 + 2)); cor += `M${f1(xx)} ${f1(yy + .6)}V${f1(top)}`; }
              if (snow) o += `<path d="M${f1(x + w * .15)} ${f1(top - rh * .7)} L${f1(x + w / 2)} ${f1(top - rh)} L${f1(x + w * .85)} ${f1(top - rh * .7)}" stroke="#F4F6F5" stroke-width="2.4" fill="none"/>`;
              o += `<rect x="${f1(x + w * .7)}" y="${f1(top - rh * .9)}" width="${f1(3.4 * sc)}" height="${f1(7 * sc)}" fill="#7A6A5E"/>`; cor2 += `M${f1(x + w * .2)} ${f1(top + 5 * sc)}h${f1(5 * sc)}v${f1(6 * sc)}h${f1(-5 * sc)}ZM${f1(x + w * .62)} ${f1(top + 5 * sc)}h${f1(5 * sc)}v${f1(6 * sc)}h${f1(-5 * sc)}Z`;
              if (sc > 1.2 && x > 100 && x < 240) { if (rc === "#C23B2E" || rc === "#B8402E") { if (perch.length < 2) perch.push([x + w / 2, top - rh - .5]); } else spare.push([x + w * .7 + 1.7 * sc, top - rh * .9]); }
              x += w + btw(r, 4, 9) * sc;
            }
            return o;
          };
          s += row(144, .95, btw(r, -6, 4)) + row(174, 1.45, btw(r, -10, 0)) + `<path d="${cor2}" fill="#5E6670"/><path d="${cor}" stroke="#000" stroke-opacity=".18" stroke-width=".6"/>`;
          while (perch.length < 2 && spare.length) perch.push(spare.shift());
          s += water(175, "#9CB9C6", "#5D8597", r);
          for (let i = 0; i < 3; i++) { const x = btw(r, 40 + i * 80, 100 + i * 80), y = btw(r, 184, 194); s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="6" ry="2.8" fill="#F4F4F0"/><path d="M${f1(x + 4)} ${f1(y - 1)} q2 -4 0 -8" stroke="#F4F4F0" stroke-width="1.8" fill="none"/><path d="M${f1(x + 4)} ${f1(y - 9)} l2.4 .8" stroke="#E08A3A" stroke-width="1.2"/>`; }
          return { s, l: "", perch };
        } },
    ],
  },
};
