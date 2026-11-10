var CITIES_PART = {
  paris: {
    zh: "巴黎", de: "Paris", gift: "一張塞納河畔舊書攤的明信片",
    sights: [
      { id: "eiffel", zh: "艾菲爾鐵塔", see: ["鐵塔是用好多鐵條交叉搭起來的", "鐵塔腳下有一大片長長的草地", "從上面看下去塞納河彎彎地流過"], spots: ["鐵塔頂端的天線上", "第一層平台的欄杆上"],
        draw(c) {
          const { r, sea } = c, ex = btw(r, 160, 200), k = btw(r, .92, 1.06), g = 170, perch = [], l = "";
          const lawn = { spring: "#9DB07E", summer: "#8FA66E", autumn: "#B2A770", winter: "#A8A590" }[sea];
          let s = houses(150, 11, r, ["#E8E1D2", "#E3D8C3", "#DCD4C6"], false).s.replace(/fill="#9A4E3C"|fill="#7E6B5C"|fill="#5E6B78"/g, 'fill="#7F8C9C"');
          s += `<rect x="0" y="148" width="300" height="34" fill="${lawn}"/>` + water(180, "#9CB9C6", "#5F8197", r);
          const bt = g - 122 * k, tip = g - 146 * k;
          s += `<path d="M${f1(ex - 40 * k)} ${g} Q${f1(ex - 15 * k)} ${f1(g - 70 * k)} ${f1(ex - 4 * k)} ${f1(bt)} L${f1(ex + 4 * k)} ${f1(bt)} Q${f1(ex + 15 * k)} ${f1(g - 70 * k)} ${f1(ex + 40 * k)} ${g} L${f1(ex + 25 * k)} ${g} Q${f1(ex)} ${f1(g - 62 * k)} ${f1(ex - 25 * k)} ${g} Z" fill="#6B4F3A"/>`;
          let lat = ""; for (let i = 2; i < 8; i++) { const y = g - i * 15 * k, h = (38 - i * 4.2) * k; lat += `M${f1(ex - h)} ${f1(y)} L${f1(ex + h * .55)} ${f1(y - 15 * k)} M${f1(ex + h)} ${f1(y)} L${f1(ex - h * .55)} ${f1(y - 15 * k)} `; }
          s += `<path d="${lat}" stroke="#8C6A50" stroke-width=".7" fill="none"/>`;
          s += `<rect x="${f1(ex - 30 * k)}" y="${f1(g - 36 * k)}" width="${f1(60 * k)}" height="4" fill="#5A4130"/><rect x="${f1(ex - 17 * k)}" y="${f1(g - 78 * k)}" width="${f1(34 * k)}" height="3.5" fill="#5A4130"/><rect x="${f1(ex - 6 * k)}" y="${f1(bt - 2)}" width="${f1(12 * k)}" height="3" fill="#5A4130"/><path d="M${f1(ex)} ${f1(bt)} V${f1(tip)}" stroke="#5A4130" stroke-width="2" fill="none"/>`;
          s += tree(btw(r, 16, 60), 176, btw(r, .9, 1.1), sea, r) + tree(btw(r, 72, 110), 177, 1, sea, r) + tree(btw(r, 244, 288), 176, 1.05, sea, r);
          if (r() < .5) s += boat(btw(r, 20, 220), btw(r, 186, 191), 1, false);
          perch.push([ex, tip], [ex - 24 * k, g - 36 * k]);
          return { s, l, perch };
        } },
      { id: "arc", zh: "凱旋門", see: ["好幾條大街從凱旋門向四面八方散開", "門上刻滿了打仗和凱旋的石頭雕像", "門底下有一盞一直點著的火"], spots: ["凱旋門頂上的石欄邊", "凱旋門屋頂的轉角上"],
        draw(c) {
          const { r, sea } = c, ax = btw(r, 155, 188), k = btw(r, .92, 1.06), g = 160, W = 112 * k, L = ax - 56 * k, T = g - 96 * k, perch = [], l = "";
          let s = houses(152, 11, r, ["#E8E1D2", "#E3D8C3", "#DCD4C6"], false).s.replace(/fill="#9A4E3C"|fill="#7E6B5C"|fill="#5E6B78"/g, 'fill="#7F8C9C"');
          s += `<rect x="0" y="150" width="300" height="50" fill="#C2B9AA"/><path d="M${f1(ax - 16 * k)} ${g} L${f1(ax + 16 * k)} ${g} L${f1(ax + 84)} 200 L${f1(ax - 84)} 200 Z" fill="#9C958A"/>`;
          s += `<rect x="${f1(L)}" y="${f1(T + 12 * k)}" width="${f1(W)}" height="${f1(84 * k)}" fill="#D9CBB0"/><rect x="${f1(L - 3)}" y="${f1(T)}" width="${f1(W + 6)}" height="${f1(13 * k)}" fill="#CFC0A3"/>`;
          s += `<rect x="${f1(L - 4)}" y="${f1(T + 12 * k)}" width="${f1(W + 8)}" height="2.6" fill="#B9A988"/><rect x="${f1(L - 4)}" y="${f1(T - 2)}" width="${f1(W + 8)}" height="2.6" fill="#B9A988"/><rect x="${f1(L)}" y="${f1(T + 18 * k)}" width="${f1(W)}" height="${f1(5 * k)}" fill="#C6B693"/>`;
          const o = 18 * k, sp = g - 44 * k, tp = g - 62 * k;
          s += `<path d="M${f1(ax - o)} ${g} V${f1(sp)} Q${f1(ax - o)} ${f1(tp)} ${f1(ax)} ${f1(tp)} Q${f1(ax + o)} ${f1(tp)} ${f1(ax + o)} ${f1(sp)} V${g} Z" fill="#6E6352"/>`;
          for (const x of [L + 7 * k, ax + o + 7 * k]) s += `<rect x="${f1(x)}" y="${f1(g - 44 * k)}" width="${f1(24 * k)}" height="${f1(30 * k)}" fill="#C4B494"/><rect x="${f1(x)}" y="${f1(T + 28 * k)}" width="${f1(24 * k)}" height="${f1(12 * k)}" fill="#C4B494"/>`;
          if (r() < .4) { const fy = tp + 5, fh = g - 24 * k - fy; s += `<rect x="${f1(ax - 12 * k)}" y="${f1(fy)}" width="${f1(8 * k)}" height="${f1(fh)}" fill="#2B4C8C"/><rect x="${f1(ax - 4 * k)}" y="${f1(fy)}" width="${f1(8 * k)}" height="${f1(fh)}" fill="#F2F0EA"/><rect x="${f1(ax + 4 * k)}" y="${f1(fy)}" width="${f1(8 * k)}" height="${f1(fh)}" fill="#C8392E"/>`; }
          for (let i = 0; i < 4; i++) s += tree(ax - 70 * k - i * 24, g + 4 + i * 10, .72 + i * .16, sea, r) + tree(ax + 70 * k + i * 24, g + 4 + i * 10, .72 + i * .16, sea, r);
          for (let j = 0; j < 2; j++) s += `<rect x="${f1(ax + btw(r, -34, 22))}" y="${f1(btw(r, 176, 190))}" width="12" height="6" rx="2" fill="${pick(r, ["#3E5568", "#E9E1D0", "#8C3B2E", "#2F2A22"])}"/>`;
          perch.push([L + 6 * k, T - 2], [L + W - 8 * k, T - 2]);
          return { s, l, perch };
        } },
      { id: "notredame", zh: "巴黎聖母院", see: ["正面兩座方方的鐘樓並排站著", "中間那扇圓圓的玫瑰窗像一朵大花", "修好的尖塔又細又高地立在屋頂上"], spots: ["鐘樓頂的欄杆上", "另一座鐘樓的頂上", "屋頂尖塔的最頂端"],
        draw(c) {
          const { r, sea } = c, fx = btw(r, 108, 120), n0 = fx + 80, D = "#5B5244", S = "#D8CDB4", H = "#C4B79B", perch = [], l = "";
          let s = `<rect x="0" y="148" width="300" height="26" fill="#B5B09A"/><rect x="0" y="162" width="300" height="12" fill="#C9BFA8"/>` + water(172, "#9CB9C6", "#5F8197", r);
          s += tree(btw(r, 18, 50), 162, 1.1, sea, r) + tree(btw(r, 62, 92), 162, .95, sea, r);
          s += `<rect x="${f1(n0)}" y="100" width="82" height="60" fill="#CFC3A8"/><path d="M${f1(n0)} 100 L${f1(n0 + 4)} 88 L${f1(n0 + 78)} 88 L${f1(n0 + 82)} 100 Z" fill="#6F7A80"/><path d="M${f1(n0 + 82)} 100 Q${f1(n0 + 96)} 104 ${f1(n0 + 96)} 160 L${f1(n0 + 82)} 160 Z" fill="${H}"/>`;
          let w = ""; for (let i = 0; i < 6; i++) w += `M${f1(n0 + 6 + i * 12)} 116 V106 l2.5 -4 l2.5 4 V116 Z `;
          s += `<path d="${w}" fill="${D}"/><rect x="${f1(n0)}" y="126" width="82" height="34" fill="${S}"/>`;
          let pier = "", fly = ""; for (let i = 0; i < 5; i++) { const px = n0 + 8 + i * 16; pier += `M${f1(px - 2.5)} 160 V116 L${f1(px)} 106 L${f1(px + 2.5)} 116 V160 Z `; fly += `M${f1(px + 1)} 120 Q${f1(px + 4)} 106 ${f1(px + 11)} 102 `; }
          s += `<path d="${pier}" fill="${H}"/><path d="${fly}" stroke="${H}" stroke-width="2" fill="none"/>`;
          const sx = n0 + 40; s += `<rect x="${f1(sx - 6)}" y="78" width="12" height="11" fill="#6F7A80"/><path d="M${f1(sx - 5.5)} 79 L${f1(sx)} 30 L${f1(sx + 5.5)} 79 Z" fill="#5E676D"/>`;
          s += `<rect x="${f1(fx)}" y="62" width="26" height="98" fill="${S}"/><rect x="${f1(fx + 54)}" y="62" width="26" height="98" fill="${S}"/><rect x="${f1(fx + 26)}" y="88" width="28" height="72" fill="${S}"/>`;
          s += `<rect x="${f1(fx - 1)}" y="60" width="28" height="3" fill="${H}"/><rect x="${f1(fx + 53)}" y="60" width="28" height="3" fill="${H}"/><rect x="${f1(fx - 1)}" y="86" width="82" height="4" fill="${H}"/><rect x="${f1(fx)}" y="124" width="80" height="4" fill="${H}"/>`;
          let o = ""; for (const t of [fx, fx + 54]) { for (const x of [t + 5, t + 15]) o += `M${f1(x)} 84 V70 l3 -5 l3 5 V84 Z `; o += `M${f1(t + 9)} 118 V102 l4 -5 l4 5 V118 Z `; }
          for (const [a, b] of [[fx + 6, fx + 20], [fx + 32, fx + 48], [fx + 60, fx + 74]]) o += `M${f1(a)} 160 V146 Q${f1(a)} 136 ${f1((a + b) / 2)} 134 Q${f1(b)} 136 ${f1(b)} 146 V160 Z `;
          s += `<path d="${o}" fill="${D}"/>`;
          const rx = fx + 40; let sp = ""; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; sp += `M${f1(rx)} 106 L${f1(rx + Math.cos(a) * 10)} ${f1(106 + Math.sin(a) * 10)} `; }
          s += `<circle cx="${f1(rx)}" cy="106" r="11" fill="#7E6E5E" stroke="${H}" stroke-width="2"/><path d="${sp}" stroke="${H}" stroke-width=".8" fill="none"/><circle cx="${f1(rx)}" cy="106" r="4" fill="#B9A27A"/>`;
          if (r() < .6) { const bx = btw(r, 10, 230); s += `<path d="M${f1(bx)} 184 h54 l-4 6 h-46 Z" fill="#E9E1D0"/><rect x="${f1(bx + 6)}" y="179" width="40" height="5" fill="#9FB6C2"/>`; }
          perch.push([fx + 13, 60], [fx + 67, 60], [sx, 30]);
          return { s, l, perch };
        } },
      { id: "louvre", zh: "羅浮宮玻璃金字塔", see: ["透明的玻璃金字塔立在老宮殿中間", "金字塔是用一格一格的菱形玻璃拼成的", "排隊的人都在等著進去看畫"], spots: ["金字塔的尖頂上", "宮殿屋頂的尖角上"],
        draw(c) {
          const { r } = c, px = btw(r, 150, 180), k = btw(r, .94, 1.06), P = "#DCCDB0", R = "#66707C", perch = [], l = "";
          let s = `<rect x="0" y="148" width="300" height="52" fill="#D9CDB2"/><rect x="0" y="104" width="300" height="48" fill="${P}"/><rect x="0" y="95" width="300" height="10" fill="${R}"/>`;
          let w = "", d = ""; for (let x = 4; x < 300; x += 12) { w += `M${x} 112 h4 v9 h-4 Z M${x} 130 h4 v10 h-4 Z `; d += `M${x} 98 h3 v5 h-3 Z `; }
          s += `<path d="${w}" fill="#8A7E6C"/><path d="${d}" fill="#E4D8C0"/>`;
          for (const x of [px - 80, px, px + 74]) s += `<rect x="${f1(x - 18)}" y="86" width="36" height="66" fill="#D6C6A8"/><path d="M${f1(x - 18)} 86 L${f1(x - 12)} 70 L${f1(x + 12)} 70 L${f1(x + 18)} 86 Z" fill="${R}"/><path d="M${f1(x - 10)} 108 h5 v12 h-5 Z M${f1(x + 5)} 108 h5 v12 h-5 Z M${f1(x - 2.5)} 92 h5 v10 h-5 Z" fill="#8A7E6C"/>`;
          s += `<path d="M0 86 L36 100 L36 158 L0 172 Z" fill="#D3C3A5"/><path d="M0 74 L36 92 L36 100 L0 86 Z" fill="${R}"/><path d="M300 86 L264 100 L264 158 L300 172 Z" fill="#D3C3A5"/><path d="M300 74 L264 92 L264 100 L300 86 Z" fill="${R}"/>`;
          s += `<rect x="${f1(px - 118)}" y="172" width="54" height="6" rx="2" fill="#8FB3C4"/><rect x="${f1(px + 66)}" y="172" width="54" height="6" rx="2" fill="#8FB3C4"/><path d="M${f1(px - 90)} 172 L${f1(px - 82)} 160 L${f1(px - 74)} 172 Z M${f1(px + 80)} 172 L${f1(px + 88)} 160 L${f1(px + 96)} 172 Z" fill="#A8C0CC"/>`;
          const A = [px, 168 - 60 * k], Lc = [px - 50 * k, 166], Fc = [px + 6 * k, 173], Rc = [px + 50 * k, 164];
          const P2 = (p) => `${f1(p[0])} ${f1(p[1])}`, mix = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
          s += `<path d="M${P2(A)} L${P2(Lc)} L${P2(Fc)} Z" fill="#BFD2DA"/><path d="M${P2(A)} L${P2(Fc)} L${P2(Rc)} Z" fill="#94AFBE"/>`;
          let gr = ""; for (const t of [.2, .4, .6, .8]) gr += `M${P2(mix(A, Lc, t))} L${P2(mix(A, Fc, t))} L${P2(mix(A, Rc, t))} M${P2(A)} L${P2(mix(Lc, Fc, t))} M${P2(A)} L${P2(mix(Fc, Rc, t))} `;
          s += `<path d="${gr}" stroke="#6E8796" stroke-width=".6" fill="none"/><path d="M${P2(Lc)} L${P2(A)} L${P2(Rc)} M${P2(A)} L${P2(Fc)}" stroke="#5E7684" stroke-width="1.1" fill="none"/>`;
          for (let i = 0; i < 5; i++) { const x = btw(r, 14, 286), y = btw(r, 182, 196); s += `<circle cx="${f1(x)}" cy="${f1(y - 9)}" r="1.8" fill="#4A4038"/><rect x="${f1(x - 1.8)}" y="${f1(y - 7.4)}" width="3.6" height="7.4" fill="${pick(r, ["#3E5568", "#8C3B2E", "#6B5A3E", "#4A6A4A"])}"/>`; }
          perch.push([px, A[1]], [px - 80, 70], [px + 74, 70]);
          return { s, l, perch };
        } },
      { id: "sacrecoeur", zh: "聖心堂", see: ["白色的圓頂在山丘上特別顯眼", "爬了好多好多階梯才到教堂門口", "從山上看下去整個巴黎都是灰屋頂"], spots: ["大圓頂上的小燈籠旁", "旁邊小圓頂的尖尖上"],
        draw(c) {
          const { r, sea } = c, bx = btw(r, 160, 188), W = "#F3EEE2", S = "#DCD5C4", D = "#9C9384", perch = [], l = "";
          const hill = { spring: "#8DB073", summer: "#7FA266", autumn: "#A6A266", winter: "#A3A592" }[sea], zinc = (h) => h.replace(/fill="#9A4E3C"|fill="#7E6B5C"|fill="#5E6B78"/g, 'fill="#7F8C9C"');
          let s = `<path d="M0 200 L0 176 Q70 170 ${f1(bx - 78)} 132 Q${f1(bx)} 112 ${f1(bx + 78)} 132 Q${f1(bx + 104)} 160 300 170 L300 200 Z" fill="${hill}"/>`;
          s += tree(bx - 62, 142, .8, sea, r) + tree(bx + 64, 144, .8, sea, r) + tree(bx - 100, 162, .95, sea, r) + tree(bx + 100, 164, .95, sea, r);
          let st = ""; for (let i = 0; i < 11; i++) { const y = 128 + i * 4, h = 14 + (y - 126) * 26 / 44; st += `M${f1(bx - h)} ${y} H${f1(bx + h)} `; }
          s += `<path d="M${f1(bx - 14)} 126 L${f1(bx + 14)} 126 L${f1(bx + 40)} 170 L${f1(bx - 40)} 170 Z" fill="#E4DED0"/><path d="${st}" stroke="#C9C1B0" stroke-width=".9" fill="none"/><rect x="${f1(bx - 46)}" y="116" width="92" height="10" fill="#E6E0D2"/>`;
          s += `<rect x="${f1(bx - 40)}" y="92" width="80" height="26" fill="${W}"/><rect x="${f1(bx - 24)}" y="100" width="48" height="18" fill="${S}"/><rect x="${f1(bx - 26)}" y="98" width="52" height="3" fill="${W}"/>`;
          let a = ""; for (const x of [bx - 15, bx, bx + 15]) a += `M${f1(x - 5)} 118 V109 Q${f1(x - 5)} 104 ${f1(x)} 104 Q${f1(x + 5)} 104 ${f1(x + 5)} 109 V118 Z `;
          s += `<path d="${a}" fill="${D}"/>`;
          for (const x of [bx - 31, bx + 31]) s += `<rect x="${f1(x - 7)}" y="80" width="14" height="13" fill="${W}"/><path d="M${f1(x - 8)} 81 Q${f1(x - 8)} 66 ${f1(x)} 64 Q${f1(x + 8)} 66 ${f1(x + 8)} 81 Z" fill="${W}" stroke="#BDB5A2" stroke-width="1"/><path d="M${f1(x)} 64 V58" stroke="${S}" stroke-width="1.4" fill="none"/>`;
          let col = ""; for (let j = 0; j < 5; j++) col += `M${f1(bx - 12 + j * 6)} 68 h2 v20 h-2 Z `;
          s += `<rect x="${f1(bx - 15)}" y="64" width="30" height="29" fill="${W}"/><path d="${col}" fill="${S}"/>`;
          s += `<path d="M${f1(bx - 17)} 65 C${f1(bx - 17)} 44 ${f1(bx - 6)} 36 ${f1(bx)} 29 C${f1(bx + 6)} 36 ${f1(bx + 17)} 44 ${f1(bx + 17)} 65 Z" fill="${W}" stroke="#BDB5A2" stroke-width="1"/><path d="M${f1(bx)} 29 Q${f1(bx - 8)} 44 ${f1(bx - 10)} 65 M${f1(bx)} 29 Q${f1(bx + 8)} 44 ${f1(bx + 10)} 65" stroke="${S}" stroke-width=".8" fill="none"/>`;
          s += `<rect x="${f1(bx - 3)}" y="21" width="6" height="9" fill="${W}"/><path d="M${f1(bx - 3.5)} 21 Q${f1(bx)} 15 ${f1(bx + 3.5)} 21 Z" fill="${W}"/><path d="M${f1(bx)} 16 V10 M${f1(bx - 2)} 12.5 h4" stroke="${D}" stroke-width="1" fill="none"/>`;
          const cols = ["#E8E1D2", "#E3D8C3", "#DCD4C6"];
          s += zinc(houses(200, 3, r, cols, false, -6).s) + zinc(houses(200, 4, r, cols, false, bx + 48).s);
          perch.push([bx, 15], [bx - 31, 58], [bx + 31, 58]);
          return { s, l, perch };
        } },
      { id: "alexandre3", zh: "亞歷山大三世橋", see: ["橋頭的高柱上站著金色的飛馬", "橋上的路燈一盞接一盞排得好整齊", "遠遠可以看到傷兵院的金色圓頂"], spots: ["金色飛馬的翅膀上", "橋上路燈的燈罩上"],
        draw(c) {
          const { r, sea } = c, bx = btw(r, 156, 174), G = "#D4A73A", St = "#D8CDB4", perch = [], l = "";
          let s = `<rect x="0" y="116" width="300" height="20" fill="#A8AE8C"/>`;
          s += `<rect x="${f1(bx - 112)}" y="108" width="66" height="22" fill="#D3C6AA"/><rect x="${f1(bx + 46)}" y="108" width="66" height="22" fill="#D3C6AA"/><rect x="${f1(bx - 112)}" y="104" width="66" height="4" fill="#7F8C9C"/><rect x="${f1(bx + 46)}" y="104" width="66" height="4" fill="#7F8C9C"/>`;
          s += `<rect x="${f1(bx - 46)}" y="98" width="92" height="32" fill="${St}"/><rect x="${f1(bx - 46)}" y="95" width="92" height="4" fill="#7F8C9C"/>`;
          let w = ""; for (let x = bx - 42; x < bx + 42; x += 8) w += `M${f1(x)} 104 h3 v6 h-3 Z M${f1(x)} 116 h3 v6 h-3 Z `;
          s += `<path d="${w}" fill="#8A7E6C"/><rect x="${f1(bx - 14)}" y="90" width="28" height="40" fill="#E2D8C2"/><path d="M${f1(bx - 17)} 91 L${f1(bx)} 82 L${f1(bx + 17)} 91 Z" fill="#CFC3A8"/>`;
          s += `<rect x="${f1(bx - 16)}" y="68" width="32" height="15" fill="${St}"/><path d="M${f1(bx - 12)} 70 h2 v11 h-2 Z M${f1(bx - 5)} 70 h2 v11 h-2 Z M${f1(bx + 3)} 70 h2 v11 h-2 Z M${f1(bx + 10)} 70 h2 v11 h-2 Z" fill="#C4B79B"/>`;
          s += `<path d="M${f1(bx - 17)} 69 C${f1(bx - 17)} 50 ${f1(bx + 17)} 50 ${f1(bx + 17)} 69 Z" fill="${G}"/><path d="M${f1(bx)} 55 Q${f1(bx - 8)} 58 ${f1(bx - 11)} 69 M${f1(bx)} 55 Q${f1(bx + 8)} 58 ${f1(bx + 11)} 69 M${f1(bx)} 55 V69" stroke="#B8892A" stroke-width=".8" fill="none"/><rect x="${f1(bx - 3)}" y="47" width="6" height="9" fill="${G}"/><path d="M${f1(bx - 2)} 47 L${f1(bx)} 36 L${f1(bx + 2)} 47 Z" fill="${G}"/>`;
          for (const x of [bx - 132, bx - 100, bx - 68, bx + 60, bx + 92, bx + 124]) s += tree(x + btw(r, -6, 6), 132, .62, sea, r);
          s += `<rect x="0" y="134" width="300" height="5" fill="#C9BFA8"/>` + water(139, "#9CB9C6", "#5F8197", r);
          if (r() < .5) s += boat(btw(r, 40, 220), btw(r, 176, 190), 1, false);
          s += `<path d="M0 134 L300 134 L300 164 L286 164 Q${f1(bx)} 134 14 164 L0 164 Z" fill="#6C7C7E"/><path d="M14 164 Q${f1(bx)} 134 286 164" stroke="${G}" stroke-width="1.4" fill="none"/><circle cx="${f1(bx)}" cy="145" r="3.6" fill="${G}"/>`;
          let ring = ""; for (let t = .08; t < .95; t += .07) { const x = 14 * (1 - t) * (1 - t) + 2 * t * (1 - t) * bx + 286 * t * t, y = 164 - 60 * t * (1 - t), rr = Math.min(3.2, (y - 134) / 2 - 2); if (rr > 1.5 && Math.abs(x - bx) > 9) ring += `M${f1(x - rr)} ${f1((y + 134) / 2)} a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(2 * rr)} 0 a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(-2 * rr)} 0 `; }
          s += `<path d="${ring}" stroke="${G}" stroke-width=".9" fill="none"/>`;
          s += `<rect x="0" y="128" width="18" height="46" fill="${St}"/><rect x="282" y="128" width="18" height="46" fill="${St}"/><rect x="0" y="127" width="300" height="7" fill="${St}"/>`;
          let bal = ""; for (let x = 2; x < 300; x += 6) bal += `M${x} 129 h2.4 v3.5 h-2.4 Z `;
          s += `<path d="${bal}" fill="#A89C82"/>`;
          const p1 = bx - 100, p2 = bx + 100;
          for (const p of [p1, p2]) s += `<rect x="${f1(p - 9)}" y="112" width="18" height="22" fill="${St}"/><rect x="${f1(p - 5.5)}" y="86" width="11" height="26" fill="#E2D8C2"/><rect x="${f1(p - 7.5)}" y="82" width="15" height="4" fill="${G}"/><path d="M${f1(p - 6)} 82 L${f1(p - 5)} 76 L${f1(p + 2)} 75 L${f1(p + 5)} 70 L${f1(p + 7)} 72 L${f1(p + 6)} 76 L${f1(p + 5)} 82 Z M${f1(p - 2)} 76 L${f1(p - 8)} 66 L${f1(p + 1)} 73 Z M${f1(p + 1)} 75 L${f1(p + 3)} 64 L${f1(p + 5)} 72 Z" fill="${G}"/>`;
          let lamp = "", glob = "", lx = 0; for (let x = 26; x < 290; x += 32) { if (Math.abs(x - p1) < 16 || Math.abs(x - p2) < 16) continue; lamp += `M${x} 127 V113 `; lamp += `M${x - 4} 115 H${x + 4} `; glob += `M${x - 2.2} 111.5 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 M${x - 5.5} 113.5 h3 v2.4 h-3 Z M${x + 2.5} 113.5 h3 v2.4 h-3 Z `; if (!lx && x > bx) lx = x; }
          s += `<path d="${lamp}" stroke="#3E4A4E" stroke-width="1.3" fill="none"/><path d="${glob}" fill="#F2E7C0" stroke="#3E4A4E" stroke-width=".5"/>`;
          perch.push([p2 + 3, 64], [lx, 109.5], [bx, 127]);
          return { s, l, perch };
        } },
    ],
  },  london: {
    zh: "倫敦", de: "London", gift: "一小包英國紅茶",
    sights: [
      { id: "bigben", zh: "大笨鐘與國會大廈", see: ["鐘塔上的大鐘每到整點就噹噹地響", "國會大廈沿著泰晤士河排得好長", "國會的屋頂上豎著好多尖尖的小塔"], spots: ["鐘塔的尖頂上", "國會屋頂的小尖塔上"],
        draw(c) {
          const { r, sea } = c, tx = btw(r, 204, 236), x0 = tx - 182, vx = x0 + 6, ctx = tx - 98, Sn = "#CDB07A", Sd = "#B99D68", Sk = "#C2A060", perch = [], l = "";
          let s = `<rect x="0" y="148" width="300" height="16" fill="#B9AE96"/><rect x="0" y="160" width="300" height="4" fill="#A39A84"/>` + water(163, "#9DB3B8", "#5E7A82", r);
          s += `<path d="M${f1(x0)} 112 L${f1(x0 + 4)} 104 L${f1(tx - 16)} 104 L${f1(tx - 12)} 112 Z" fill="#7C7466"/><rect x="${f1(x0)}" y="112" width="${f1(tx - 12 - x0)}" height="40" fill="${Sn}"/>`;
          let pin = "", win = ""; for (let x = x0 + 2; x < tx - 16; x += 10) { pin += `M${f1(x)} 112 v-12 l2 -5 l2 5 v12 Z `; win += `M${f1(x + 1)} 120 h2.5 v10 h-2.5 Z M${f1(x + 1)} 136 h2.5 v10 h-2.5 Z `; }
          s += `<path d="${pin}" fill="${Sd}"/><path d="${win}" fill="#6F5F45"/>`;
          s += `<rect x="${f1(vx)}" y="80" width="28" height="72" fill="#C9AA70"/><path d="M${f1(vx - 1)} 80 v-10 l2.5 -5 l2.5 5 v10 Z M${f1(vx + 24)} 80 v-10 l2.5 -5 l2.5 5 v10 Z" fill="${Sd}"/><path d="M${f1(vx + 7)} 86 h3 v18 h-3 Z M${f1(vx + 18)} 86 h3 v18 h-3 Z M${f1(vx + 7)} 110 h3 v20 h-3 Z M${f1(vx + 18)} 110 h3 v20 h-3 Z" fill="#6F5F45"/>`;
          s += `<rect x="${f1(ctx - 6)}" y="90" width="12" height="22" fill="${Sd}"/><path d="M${f1(ctx - 6)} 90 L${f1(ctx)} 66 L${f1(ctx + 6)} 90 Z" fill="#A88C58"/>`;
          s += `<rect x="${f1(tx - 11)}" y="70" width="22" height="84" fill="#CFAE6E"/><path d="M${f1(tx - 5)} 78 V150 M${f1(tx + 5)} 78 V150" stroke="${Sd}" stroke-width=".9" fill="none"/>`;
          s += `<rect x="${f1(tx - 13)}" y="50" width="26" height="26" fill="${Sk}"/><circle cx="${f1(tx)}" cy="63" r="9.5" fill="#F4EEDB" stroke="#2F2A22" stroke-width="1.3"/>`;
          const hh = btw(r, 0, 6.28), mm = btw(r, 0, 6.28);
          s += `<path d="M${f1(tx)} 63 l${f1(Math.sin(hh) * 4.6)} ${f1(-Math.cos(hh) * 4.6)} M${f1(tx)} 63 l${f1(Math.sin(mm) * 7.4)} ${f1(-Math.cos(mm) * 7.4)}" stroke="#2F2A22" stroke-width="1.2" stroke-linecap="round" fill="none"/>`;
          s += `<rect x="${f1(tx - 11)}" y="38" width="22" height="12" fill="${Sk}"/><path d="M${f1(tx - 8)} 49 V42 l2 -2 l2 2 V49 Z M${f1(tx - 2)} 49 V42 l2 -2 l2 2 V49 Z M${f1(tx + 4)} 49 V42 l2 -2 l2 2 V49 Z" fill="#5A4A36"/>`;
          s += `<path d="M${f1(tx - 14)} 50 L${f1(tx - 12)} 42 L${f1(tx - 10)} 50 Z M${f1(tx + 10)} 50 L${f1(tx + 12)} 42 L${f1(tx + 14)} 50 Z" fill="${Sd}"/><path d="M${f1(tx - 12)} 38 L${f1(tx)} 10 L${f1(tx + 12)} 38 Z" fill="#3D4A3E"/><path d="M${f1(tx)} 10 V4" stroke="#C9A54A" stroke-width="1.4" fill="none"/>`;
          if (r() < .6) s += boat(btw(r, 20, 220), btw(r, 176, 190), 1.2, false);
          perch.push([tx, 12], [ctx, 66], [vx + 1.5, 65]);
          return { s, l, perch };
        } },
      { id: "towerbridge", zh: "倫敦塔橋", see: ["兩座石塔中間連著藍色的高走道", "大船經過時橋面會從中間打開", "河邊還有一座很老很老的倫敦塔"], spots: ["塔頂的尖帽上", "藍色走道的頂上"],
        draw(c) {
          const { r } = c, bx = btw(r, 176, 190), gp = 46, St = "#CBBFA4", Sl = "#4E5A66", Bl = "#86ADCB", perch = [], l = "";
          let s = houses(132, 12, r, ["#BFC3C2", "#C9C2B2", "#B4ACA0", "#D2CCC0"], false).s + water(130, "#A2B6BC", "#5E7A86", r);
          if (r() < .5) s += boat(btw(r, 10, 250), btw(r, 172, 188), 1.2, r() < .3);
          const qp = (a, b, d, t) => (1 - t) * (1 - t) * a + 2 * t * (1 - t) * b + t * t * d;
          let ch = "", hg = "";
          for (const sg of [-1, 1]) {
            const ax = bx + sg * (gp + 15), cx2 = bx + sg * (gp + 70), ex = sg < 0 ? 0 : 300;
            ch += `M${f1(ax)} 84 Q${f1(cx2)} 132 ${ex} 108 `;
            for (let t = .15; t < .95; t += .13) { const x = qp(ax, cx2, ex, t), y = qp(84, 132, 108, t); hg += `M${f1(x)} ${f1(y)} V124 `; }
          }
          s += `<path d="${hg}" stroke="${Bl}" stroke-width=".8" fill="none"/><path d="${ch}" stroke="#6E9AC0" stroke-width="3" fill="none"/>`;
          s += `<rect x="0" y="124" width="${f1(bx - gp - 15)}" height="7" fill="#9DBBD3"/><rect x="${f1(bx + gp + 15)}" y="124" width="${f1(300 - bx - gp - 15)}" height="7" fill="#9DBBD3"/>`;
          const i0 = bx - gp + 15, span = 2 * gp - 30;
          if (r() < .25) { const L = span / 2, dx = L * Math.cos(.9), dy = L * Math.sin(.9); s += `<path d="M${f1(i0)} 131 L${f1(i0)} 124 L${f1(i0 + dx)} ${f1(124 - dy)} L${f1(i0 + dx + 4)} ${f1(128 - dy)} Z M${f1(i0 + span)} 131 L${f1(i0 + span)} 124 L${f1(i0 + span - dx)} ${f1(124 - dy)} L${f1(i0 + span - dx - 4)} ${f1(128 - dy)} Z" fill="#9DBBD3"/>`; }
          else s += `<rect x="${f1(i0)}" y="124" width="${f1(span)}" height="7" fill="#9DBBD3"/><path d="M${f1(i0)} 123.5 H${f1(i0 + span)}" stroke="#F2F0EA" stroke-width="1" fill="none"/>`;
          let zz = `M${f1(i0)} 68 `; for (let x = i0; x < i0 + span - 1; x += 6) zz += `L${f1(x + 3)} 74 L${f1(x + 6)} 68 `;
          s += `<rect x="${f1(i0)}" y="68" width="${f1(span)}" height="6" fill="${Bl}"/><rect x="${f1(i0)}" y="78" width="${f1(span)}" height="6" fill="${Bl}"/><path d="${zz}" stroke="#5F88A8" stroke-width=".7" fill="none"/>`;
          for (const cx of [bx - gp, bx + gp]) {
            s += `<path d="M${f1(cx - 20)} 148 L${f1(cx + 20)} 148 L${f1(cx + 15)} 158 L${f1(cx - 15)} 158 Z" fill="#8A8478"/><rect x="${f1(cx - 15)}" y="62" width="30" height="88" fill="${St}"/><rect x="${f1(cx + 7)}" y="62" width="8" height="88" fill="#B9AC8E"/>`;
            let w = ""; for (let j = 0; j < 3; j++) for (const x of [cx - 9, cx + 1]) w += `M${f1(x)} ${84 + j * 22} V${74 + j * 22} l3.5 -4 l3.5 4 V${84 + j * 22} Z `;
            s += `<path d="${w}" fill="#4A4F57"/><rect x="${f1(cx - 16)}" y="52" width="7" height="12" fill="${St}"/><rect x="${f1(cx + 9)}" y="52" width="7" height="12" fill="${St}"/>`;
            s += `<path d="M${f1(cx - 17)} 52 L${f1(cx - 12.5)} 41 L${f1(cx - 8)} 52 Z M${f1(cx + 8)} 52 L${f1(cx + 12.5)} 41 L${f1(cx + 17)} 52 Z M${f1(cx - 9)} 62 V54 L${f1(cx)} 37 L${f1(cx + 9)} 54 V62 Z" fill="${Sl}"/><path d="M${f1(cx)} 37 V32" stroke="${Sl}" stroke-width="1.2" fill="none"/>`;
          }
          perch.push([bx + gp, 32], [bx, 68], [bx - gp - 12.5, 41]);
          return { s, l, perch };
        } },
      { id: "londoneye", zh: "倫敦眼", see: ["大轉輪轉得好慢，一圈要半個小時", "一個個透明的車廂像蛋一樣掛在外圈", "從最高的地方看得到大笨鐘和國會"], spots: ["轉輪的最頂上", "轉輪中間的軸心上"],
        draw(c) {
          const { r, sea } = c, cx = btw(r, 182, 212), R = btw(r, 56, 61), cy = 148 - R, perch = [], l = "";
          let s = `<rect x="0" y="146" width="300" height="14" fill="#B8B4A4"/><rect x="0" y="158" width="300" height="5" fill="#A39E8E"/>` + water(163, "#9DB3B8", "#5E7A82", r);
          for (let i = 0; i < 3; i++) s += tree(btw(r, 8, cx - R - 18), btw(r, 150, 156), btw(r, .85, 1.05), sea, r);
          s += `<path d="M${f1(cx)} ${f1(cy)} L${f1(cx + R * .62)} 150 M${f1(cx)} ${f1(cy)} L${f1(cx + R * .92)} 150" stroke="#C9D1D8" stroke-width="3.2" stroke-linecap="round" fill="none"/>`;
          let sp = ""; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; sp += `M${f1(cx)} ${f1(cy)} L${f1(cx + Math.cos(a) * (R - 5))} ${f1(cy + Math.sin(a) * (R - 5))} `; }
          s += `<path d="${sp}" stroke="#C3CCD4" stroke-width=".45" fill="none"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R)}" stroke="#CDD7DF" stroke-width="3.6" fill="none"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R - 5)}" stroke="#C3CCD4" stroke-width="1.2" fill="none"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="4.5" fill="#B9C3CC"/>`;
          for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + .13; s += `<ellipse cx="${f1(cx + Math.cos(a) * (R + 3.6))}" cy="${f1(cy + Math.sin(a) * (R + 3.6))}" rx="3.6" ry="2.8" fill="#F6F8FA" stroke="#7F909E" stroke-width=".8"/>`; }
          s += `<rect x="${f1(cx - 16)}" y="146" width="32" height="5" fill="#9AA4AC"/>`;
          let lp = ""; for (const x of [24, 64]) lp += `M${x} 158 V144 `;
          s += `<path d="${lp}" stroke="#2F3A34" stroke-width="1.2" fill="none"/><circle cx="24" cy="143" r="2" fill="#E9E1C0"/><circle cx="64" cy="143" r="2" fill="#E9E1C0"/>`;
          if (r() < .55) s += boat(btw(r, 20, 240), btw(r, 176, 190), 1.2, false);
          perch.push([cx, cy - R - 1.7], [cx, cy - 4.5]);
          return { s, l, perch };
        } },
      { id: "stpauls", zh: "聖保羅大教堂", see: ["大圓頂高高的，從好遠就看得見", "圓頂最上面有一顆金色的球和十字架", "門口的台階上坐著好多休息的人"], spots: ["圓頂上的金球旁", "西邊鐘樓的頂上"],
        draw(c) {
          const { r, sea } = c, px = btw(r, 162, 184), St = "#DCD3C0", Sh = "#C6BCA6", Dk = "#6E6656", Dm = "#8E969A", Gd = "#D9B54A", perch = [], l = "";
          const cols = ["#B9A48C", "#C9C2B2", "#A65E46", "#D2CCC0"];
          let s = houses(164, 3, r, cols, false, -4).s + houses(164, 4, r, cols, false, px + 58).s + `<rect x="0" y="160" width="300" height="40" fill="#BDB4A2"/>`;
          let cl = ""; for (let j = 0; j < 11; j++) cl += `M${f1(px - 32 + j * 6.3)} 80 h2.2 v17 h-2.2 Z `;
          s += `<rect x="${f1(px - 34)}" y="78" width="68" height="22" fill="${St}"/><path d="${cl}" fill="${Sh}"/><rect x="${f1(px - 29)}" y="72" width="58" height="7" fill="#D2C8B3"/>`;
          s += `<path d="M${f1(px - 29)} 73 C${f1(px - 29)} 30 ${f1(px + 29)} 30 ${f1(px + 29)} 73 Z" fill="${Dm}"/><path d="M${f1(px)} 41 Q${f1(px - 14)} 46 ${f1(px - 21)} 73 M${f1(px)} 41 Q${f1(px - 6)} 50 ${f1(px - 8)} 73 M${f1(px)} 41 Q${f1(px + 6)} 50 ${f1(px + 8)} 73 M${f1(px)} 41 Q${f1(px + 14)} 46 ${f1(px + 21)} 73" stroke="#7A8286" stroke-width=".8" fill="none"/>`;
          s += `<rect x="${f1(px - 5)}" y="28" width="10" height="13" fill="${St}"/><path d="M${f1(px - 5.5)} 28 Q${f1(px)} 20 ${f1(px + 5.5)} 28 Z" fill="${Dm}"/><circle cx="${f1(px)}" cy="19.5" r="2.6" fill="${Gd}"/><path d="M${f1(px)} 17 V9 M${f1(px - 2.6)} 12 h5.2" stroke="${Gd}" stroke-width="1.3" fill="none"/>`;
          for (const x of [px - 43, px + 43]) s += `<rect x="${f1(x - 8)}" y="84" width="16" height="26" fill="${St}"/><path d="M${f1(x - 3)} 104 V92 Q${f1(x)} 88 ${f1(x + 3)} 92 V104 Z" fill="${Dk}"/><path d="M${f1(x - 7.5)} 85 Q${f1(x - 7.5)} 74 ${f1(x)} 70 Q${f1(x + 7.5)} 74 ${f1(x + 7.5)} 85 Z" fill="#D2C8B3"/><circle cx="${f1(x)}" cy="67.5" r="1.8" fill="${Gd}"/><path d="M${f1(x)} 66 V62" stroke="${Gd}" stroke-width="1" fill="none"/>`;
          s += `<rect x="${f1(px - 50)}" y="108" width="100" height="52" fill="${St}"/><rect x="${f1(px - 28)}" y="112" width="56" height="48" fill="#E4DCCB"/><rect x="${f1(px - 30)}" y="132" width="60" height="4" fill="${Sh}"/><rect x="${f1(px - 30)}" y="110" width="60" height="3" fill="${Sh}"/>`;
          s += `<path d="M${f1(px - 30)} 111 L${f1(px)} 97 L${f1(px + 30)} 111 Z" fill="#D2C8B3"/><path d="M${f1(px - 22)} 109 L${f1(px)} 100 L${f1(px + 22)} 109" stroke="${Sh}" stroke-width="1" fill="none"/>`;
          let co = ""; for (let j = 0; j < 6; j++) { const x = px - 25 + j * 9.4; co += `M${f1(x)} 137 h3 v23 h-3 Z M${f1(x)} 114 h3 v18 h-3 Z `; }
          s += `<path d="${co}" fill="${Sh}"/><path d="M${f1(px - 5)} 160 V147 h10 V160 Z M${f1(px - 45)} 118 h6 v10 h-6 Z M${f1(px + 39)} 118 h6 v10 h-6 Z M${f1(px - 45)} 140 h6 v12 h-6 Z M${f1(px + 39)} 140 h6 v12 h-6 Z" fill="${Dk}"/>`;
          s += `<rect x="${f1(px - 56)}" y="158" width="112" height="3" fill="#D3CAB6"/><rect x="${f1(px - 60)}" y="161" width="120" height="3" fill="#CFC5B0"/>`;
          s += tree(btw(r, 14, 56), 180, 1.1, sea, r) + tree(btw(r, 252, 290), 182, 1.05, sea, r);
          for (let i = 0; i < 3; i++) { const x = btw(r, 70, 250), y = btw(r, 176, 194); s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="3" ry="2" fill="#8C8F96"/><circle cx="${f1(x - 2.6)}" cy="${f1(y - 1.6)}" r="1.3" fill="#7A7D84"/>`; }
          perch.push([px, 17], [px - 43, 62], [px + 43, 62]);
          return { s, l, perch };
        } },
      { id: "buckingham", zh: "白金漢宮", see: ["衛兵戴著好高的黑色毛帽一動也不動", "宮殿屋頂中間的旗子在風裡飄著", "宮殿前面的黑色欄杆上有金色的裝飾"], spots: ["衛兵亭的屋頂上", "宮殿屋頂的旗桿頂", "宮殿屋頂的欄杆上"],
        draw(c) {
          const { r, sea } = c, pc = btw(r, 158, 176), sx = btw(r, 214, 240), gy = 190, perch = [], l = "";
          let s = `<rect x="0" y="140" width="300" height="60" fill="#D6C9A8"/><rect x="${f1(pc - 132)}" y="94" width="264" height="48" fill="#DDD6C6"/><rect x="${f1(pc - 132)}" y="91" width="264" height="4" fill="#CFC6B2"/>`;
          let w = ""; for (let x = pc - 128; x < pc + 130; x += 12) if (Math.abs(x - pc) > 28) w += `M${f1(x)} 100 h4 v7 h-4 Z M${f1(x)} 114 h4 v8 h-4 Z M${f1(x)} 129 h4 v8 h-4 Z `;
          s += `<path d="${w}" fill="#6E6A62"/><rect x="${f1(pc - 24)}" y="92" width="48" height="50" fill="#E4DDCF"/><path d="M${f1(pc - 28)} 92 L${f1(pc)} 80 L${f1(pc + 28)} 92 Z" fill="#D6CEBC"/>`;
          let col = ""; for (let j = 0; j < 6; j++) col += `M${f1(pc - 22 + j * 8.6)} 98 h3 v40 h-3 Z `;
          s += `<path d="${col}" fill="#CFC6B2"/><rect x="${f1(pc - 18)}" y="112" width="36" height="3" fill="#B8AE98"/><path d="M${f1(pc - 13)} 142 V128 h7 v14 Z M${f1(pc + 6)} 142 V128 h7 v14 Z" fill="#6E6A62"/>`;
          const fx = pc + .6, fy = 56, X = `M${f1(fx)} ${fy} L${f1(fx + 16)} ${fy + 10} M${f1(fx + 16)} ${fy} L${f1(fx)} ${fy + 10}`, Pl = `M${f1(fx + 8)} ${fy} V${fy + 10} M${f1(fx)} ${fy + 5} H${f1(fx + 16)}`;
          s += `<path d="M${f1(pc)} 81 V54" stroke="#6B6B6B" stroke-width="1.2" fill="none"/><rect x="${f1(fx)}" y="${fy}" width="16" height="10" fill="#24407A"/><path d="${X}" stroke="#F2F0EA" stroke-width="2.2" fill="none"/><path d="${X}" stroke="#C8302A" stroke-width=".7" fill="none"/><path d="${Pl}" stroke="#F2F0EA" stroke-width="3.2" fill="none"/><path d="${Pl}" stroke="#C8302A" stroke-width="1.8" fill="none"/>`;
          let bars = ""; for (let x = 2; x < 300; x += 5) bars += `M${x} 168 V148 `;
          s += `<path d="${bars}" stroke="#2A2A2E" stroke-width="1" fill="none"/><rect x="0" y="151" width="300" height="1.8" fill="#D4AF4A"/><rect x="0" y="166" width="300" height="3" fill="#2A2A2E"/><rect x="${f1(pc - 62)}" y="140" width="8" height="30" fill="#CFC6B2"/><rect x="${f1(pc + 54)}" y="140" width="8" height="30" fill="#CFC6B2"/><rect x="0" y="169" width="300" height="31" fill="#C9BC9A"/>`;
          const coat = sea === "winter" ? "#6E7076" : "#C8302A";
          const guard = (x, y, k) => { const b = (dx, dy, ww, h, f) => `<rect x="${f1(x + dx * k)}" y="${f1(y + dy * k)}" width="${f1(ww * k)}" height="${f1(h * k)}" fill="${f}"/>`; return b(-4, -15, 3.6, 15, "#1E1C1E") + b(.4, -15, 3.6, 15, "#1E1C1E") + b(-5, -29, 10, 15, coat) + b(-6.8, -28, 2.2, 12, coat) + b(4.6, -28, 2.2, 12, coat) + b(-5, -21, 10, 1.6, "#F2EFE6") + `<circle cx="${f1(x)}" cy="${f1(y - 31 * k)}" r="${f1(3 * k)}" fill="#E8C6A6"/><ellipse cx="${f1(x)}" cy="${f1(y - 40 * k)}" rx="${f1(5 * k)}" ry="${f1(7 * k)}" fill="#1E1C1E"/><path d="M${f1(x + 6 * k)} ${f1(y - 14 * k)} V${f1(y - 40 * k)}" stroke="#3A3330" stroke-width="${f1(1.4 * k)}" fill="none"/>`; };
          s += `<rect x="${f1(sx)}" y="${gy - 72}" width="32" height="72" fill="#2E3238"/><path d="M${f1(sx - 2)} ${gy - 72} L${f1(sx + 16)} ${gy - 83} L${f1(sx + 34)} ${gy - 72} Z" fill="#2E3238"/><rect x="${f1(sx - 2)}" y="${gy - 73}" width="36" height="1.8" fill="#D4AF4A"/><rect x="${f1(sx + 4)}" y="${gy - 65}" width="24" height="65" fill="#6A6E76"/>`;
          s += guard(sx + 16, gy, 1.3);
          if (r() < .6) s += guard(sx - 26, gy + 3, 1.3);
          perch.push([sx + 16, gy - 83], [pc, 54], [pc - 90, 91]);
          return { s, l, perch };
        } },
      { id: "redbus", zh: "紅色雙層巴士與電話亭", see: ["紅色的雙層巴士在街上慢慢開過", "路邊站著一座紅通通的電話亭", "黑色的計程車長得圓圓胖胖的"], spots: ["巴士的車頂上", "電話亭的圓頂上", "計程車的車頂燈上"],
        draw(c) {
          const { r } = c, bx = btw(r, 112, 138), cx = btw(r, 10, 36), px = btw(r, 272, 284), perch = [], l = "";
          let s = "", fr = "", pn = "";
          for (let x = -4; x < 300;) {
            const w = btw(r, 38, 50), top = btw(r, 72, 92), col = pick(r, ["#A65E46", "#E8E1D2", "#B87A5E", "#DCD3C0"]);
            s += `<rect x="${f1(x)}" y="${f1(top)}" width="${f1(w)}" height="${f1(152 - top)}" fill="${col}"/><rect x="${f1(x - 1)}" y="${f1(top - 3)}" width="${f1(w + 2)}" height="3" fill="#8C8478"/><rect x="${f1(x + w * .2)}" y="${f1(top - 10)}" width="7" height="7" fill="#8C6A50"/>`;
            for (let y = top + 8; y < 128; y += 16) for (let q = 0; q < 3; q++) { const wx = x + 5 + q * (w - 16) / 2; fr += `M${f1(wx)} ${f1(y)} h6 v10 h-6 Z `; pn += `M${f1(wx + 1)} ${f1(y + 1)} h4 v8 h-4 Z `; }
            x += w;
          }
          s += `<path d="${fr}" fill="#F1ECE0"/><path d="${pn}" fill="#5E6B78"/><rect x="0" y="136" width="300" height="14" fill="#4A5A50"/>`;
          let sh = ""; for (let x = 6; x < 300; x += 26) sh += `M${x} 139 h16 v9 h-16 Z `;
          s += `<path d="${sh}" fill="#C9D6D8"/><rect x="0" y="150" width="300" height="12" fill="#C9C2B4"/><rect x="0" y="160" width="300" height="2" fill="#9A958C"/><rect x="0" y="162" width="300" height="38" fill="#6E6D6A"/>`;
          let ds = ""; for (let x = 6; x < 300; x += 30) ds += `M${x} 190 h14 v2 h-14 Z `;
          s += `<path d="${ds}" fill="#E9E4D6"/>`;
          let gl = `M${f1(px - 6)} 128 h12 v27 h-12 Z`, gb = `M${f1(px - 2)} 128 V155 M${f1(px + 2)} 128 V155 `; for (let y = 131.4; y < 155; y += 3.4) gb += `M${f1(px - 6)} ${f1(y)} H${f1(px + 6)} `;
          s += `<rect x="${f1(px - 9)}" y="120" width="18" height="42" fill="#C8302A"/><path d="M${f1(px - 10)} 121 Q${f1(px)} 111 ${f1(px + 10)} 121 Z" fill="#C8302A"/><rect x="${f1(px - 7)}" y="122" width="14" height="3.5" fill="#F1ECE0"/><path d="${gl}" fill="#E3E8E2"/><path d="${gb}" stroke="#C8302A" stroke-width=".8" fill="none"/><rect x="${f1(px - 10)}" y="160" width="20" height="3" fill="#A92822"/>`;
          let uw = "", lw = ""; for (let j = 0; j < 6; j++) uw += `M${f1(bx + 18 + j * 17)} 112 h14 v15 h-14 Z `; for (let j = 0; j < 5; j++) lw += `M${f1(bx + 32 + j * 18)} 141 h15 v15 h-15 Z `;
          s += `<rect x="${f1(bx)}" y="106" width="122" height="68" rx="7" fill="#C8302A"/><rect x="${f1(bx)}" y="133" width="122" height="3" fill="#A92822"/><path d="${uw}${lw}M${f1(bx + 3)} 112 h12 v15 h-12 Z M${f1(bx + 3)} 140 h11 v22 h-11 Z M${f1(bx + 17)} 141 h11 v29 h-11 Z" fill="#CFE0EA"/><rect x="${f1(bx + 3)}" y="108.5" width="12" height="2.5" fill="#2A2A2A"/>`;
          s += `<circle cx="${f1(bx + 24)}" cy="175" r="7" fill="#2A2A2A"/><circle cx="${f1(bx + 100)}" cy="175" r="7" fill="#2A2A2A"/><circle cx="${f1(bx + 24)}" cy="175" r="2.8" fill="#9A9A9A"/><circle cx="${f1(bx + 100)}" cy="175" r="2.8" fill="#9A9A9A"/>`;
          s += `<path d="M${f1(cx)} 180 V168 Q${f1(cx)} 162 ${f1(cx + 8)} 160 L${f1(cx + 16)} 150 Q${f1(cx + 20)} 146 ${f1(cx + 28)} 146 L${f1(cx + 44)} 146 Q${f1(cx + 50)} 146 ${f1(cx + 54)} 152 L${f1(cx + 58)} 160 Q${f1(cx + 64)} 162 ${f1(cx + 64)} 168 V180 Z" fill="#1F1F22"/><path d="M${f1(cx + 18)} 158 L${f1(cx + 22)} 150 H${f1(cx + 33)} V158 Z M${f1(cx + 36)} 150 H${f1(cx + 44)} L${f1(cx + 50)} 158 H${f1(cx + 36)} Z" fill="#9FB2BE"/><rect x="${f1(cx + 29)}" y="142.5" width="8" height="3.5" fill="#F2B33A"/>`;
          s += `<circle cx="${f1(cx + 14)}" cy="181" r="5.5" fill="#2A2A2A"/><circle cx="${f1(cx + 50)}" cy="181" r="5.5" fill="#2A2A2A"/><circle cx="${f1(cx + 14)}" cy="181" r="2" fill="#9A9A9A"/><circle cx="${f1(cx + 50)}" cy="181" r="2" fill="#9A9A9A"/>`;
          perch.push([bx + 61, 106], [px, 116], [cx + 33, 142.5]);
          return { s, l, perch };
        } },
    ],
  },  scotland: {
    zh: "蘇格蘭", de: "Scotland", gift: "一小塊格子呢布",
    sights: [
      { id: "edinburghcastle", zh: "愛丁堡城堡", see: ["城堡蓋在一大塊黑黑的火山岩上", "下午一點城牆上會砰地放一聲砲", "城堡山腳下是一大片王子街花園"], spots: ["城牆上的旗桿頂", "小塔的尖帽上", "半月砲台的石牆上"],
        draw(c) {
          const { r, sea } = c, cx = btw(r, 156, 184), St = "#8E877C", Dk = "#7F786E", Sl = "#4E5560", Wn = "#3E3A36", perch = [], l = "";
          const grass = { spring: "#7FA266", summer: "#6E9A58", autumn: "#9C9A5A", winter: "#A9AD9C" }[sea];
          let s = hills(150, "#9AA69E", r, 8);
          s += `<path d="M0 200 L0 172 Q40 166 70 154 L${f1(cx - 74)} 126 L${f1(cx - 66)} 112 L${f1(cx + 98)} 112 L${f1(cx + 112)} 126 Q${f1(cx + 130)} 136 300 146 L300 200 Z" fill="#4E4A46"/><path d="M${f1(cx - 60)} 122 l12 16 l8 -6 l10 20 M${f1(cx + 20)} 116 l-6 22 l12 10 M${f1(cx + 80)} 118 l10 18 M${f1(cx - 90)} 140 l14 8 l4 14" stroke="#3A3633" stroke-width="1.2" fill="none"/>`;
          let cr = ""; for (let i = 0; i < 6; i++) cr += `M${f1(cx - 62 + i * 7)} 92 v-4 h4 v4 Z `; for (let i = 0; i < 7; i++) cr += `M${f1(cx - 23 + i * 7)} 80 v-4 h4 v4 Z `; for (let i = 0; i < 3; i++) cr += `M${f1(cx - 44 + i * 6)} 70 v-3 h3 v3 Z `;
          s += `<path d="M${f1(cx - 66)} 114 Q${f1(cx - 72)} 100 ${f1(cx - 62)} 92 L${f1(cx - 24)} 92 L${f1(cx - 24)} 114 Z" fill="${St}"/><rect x="${f1(cx - 44)}" y="70" width="16" height="24" fill="${Dk}"/><rect x="${f1(cx - 24)}" y="80" width="50" height="34" fill="${St}"/><path d="${cr}" fill="${St}"/>`;
          s += `<rect x="${f1(cx + 16)}" y="66" width="10" height="16" fill="${Dk}"/><path d="M${f1(cx + 15)} 66 L${f1(cx + 21)} 55 L${f1(cx + 27)} 66 Z" fill="${Sl}"/>`;
          s += `<rect x="${f1(cx + 26)}" y="92" width="46" height="22" fill="${St}"/><path d="M${f1(cx + 24)} 92 L${f1(cx + 30)} 84 L${f1(cx + 70)} 84 L${f1(cx + 74)} 92 Z" fill="${Sl}"/><rect x="${f1(cx + 72)}" y="100" width="26" height="14" fill="#857E73"/><path d="M${f1(cx + 71)} 100 L${f1(cx + 75)} 95 L${f1(cx + 95)} 95 L${f1(cx + 99)} 100 Z" fill="${Sl}"/>`;
          let w = ""; for (let j = 0; j < 5; j++) w += `M${f1(cx - 20 + j * 9)} 88 h3 v6 h-3 Z M${f1(cx - 20 + j * 9)} 100 h3 v6 h-3 Z M${f1(cx + 30 + j * 8)} 98 h3 v8 h-3 Z `; for (let j = 0; j < 4; j++) w += `M${f1(cx - 60 + j * 9)} 103 h3 v3 h-3 Z `;
          s += `<path d="${w}" fill="${Wn}"/><rect x="${f1(cx - 66)}" y="110" width="164" height="4" fill="${Dk}"/>`;
          s += `<path d="M${f1(cx - 36)} 67 V50" stroke="${Wn}" stroke-width="1" fill="none"/><rect x="${f1(cx - 35.5)}" y="50" width="13" height="8" fill="#2D5AA0"/><path d="M${f1(cx - 35.5)} 50 L${f1(cx - 22.5)} 58 M${f1(cx - 22.5)} 50 L${f1(cx - 35.5)} 58" stroke="#F2F0EA" stroke-width="1.6" fill="none"/>`;
          s += `<path d="M0 200 L0 178 Q150 170 300 180 L300 200 Z" fill="${grass}"/>`;
          for (let i = 0; i < 5; i++) s += tree(14 + i * 66 + btw(r, -8, 8), 186 + btw(r, 0, 8), btw(r, .9, 1.15), sea, r);
          perch.push([cx - 36, 50], [cx + 21, 55], [cx - 50, 88]);
          return { s, l, perch };
        } },
      { id: "royalmile", zh: "皇家哩大道", see: ["石頭路兩邊的老房子又高又窄", "聖吉爾斯大教堂的尖塔像一頂皇冠", "街上有人穿著蘇格蘭裙吹風笛"], spots: ["皇冠尖塔的頂上", "老房子的煙囪上"],
        draw(c) {
          const { r, sea } = c, sx = btw(r, 172, 194), e = sx - 22, f = sx + 22, k = 1.4, B = 76, tones = ["#8F877A", "#A39A8A", "#7E776C", "#988F80"], perch = [], l = "";
          const q = (dx, dy) => `${f1(sx + dx * k)} ${f1(B + dy * k)}`;
          let s = `<rect x="0" y="130" width="300" height="70" fill="#A39C90"/><path d="M44 200 L${f1(sx - 12)} 138 L${f1(sx + 12)} 138 L262 200 Z" fill="#857E72"/>`;
          let cb = ""; for (let i = 0; i < 6; i++) { const y = 146 + i * 9, t = (y - 138) / 62, a = sx - 12 + (56 - sx) * t, b = sx + 12 + (250 - sx) * t; cb += `M${f1(a + 4)} ${y} Q${f1((a + b) / 2)} ${y + 2} ${f1(b - 4)} ${y} `; }
          s += `<path d="${cb}" stroke="#766E63" stroke-width=".7" fill="none"/>`;
          s += `<path d="M${q(-10, 0)} L${q(10, 0)} L${q(10, 30)} L${q(-10, 30)} Z" fill="#8C8578"/><path d="M${q(-6, 20)} V${f1(B + 10 * k)} l${f1(2 * k)} ${f1(-3 * k)} l${f1(2 * k)} ${f1(3 * k)} V${f1(B + 20 * k)} Z M${q(2, 20)} V${f1(B + 10 * k)} l${f1(2 * k)} ${f1(-3 * k)} l${f1(2 * k)} ${f1(3 * k)} V${f1(B + 20 * k)} Z" fill="#4A4540"/>`;
          s += `<path d="M${q(-10, 0)} Q${q(-10, -16)} ${q(0, -18)} Q${q(10, -16)} ${q(10, 0)} M${q(-4, 0)} Q${q(-3, -12)} ${q(0, -18)} M${q(4, 0)} Q${q(3, -12)} ${q(0, -18)}" stroke="#8C8578" stroke-width="2.4" fill="none"/>`;
          s += `<path d="M${q(-11.5, 0)} L${q(-10, -11)} L${q(-8.5, 0)} Z M${q(8.5, 0)} L${q(10, -11)} L${q(11.5, 0)} Z M${q(-8, -11)} L${q(-7, -18)} L${q(-6, -11)} Z M${q(6, -11)} L${q(7, -18)} L${q(8, -11)} Z M${q(-2.5, -16)} L${q(0, -32)} L${q(2.5, -16)} Z M${q(-11, 0)} L${q(11, 0)} L${q(11, 2)} L${q(-11, 2)} Z" fill="#8C8578"/>`;
          let ew = ""; for (let j = 0; j < 4; j++) ew += `M${f1(e + 5 + j * 10)} 112 h4 v6 h-4 Z M${f1(e + 5 + j * 10)} 124 h4 v6 h-4 Z `;
          s += `<rect x="${f1(e)}" y="106" width="44" height="34" fill="#9A9284"/><path d="${ew}" fill="#4A4540"/>`;
          const side = (X0, X1, top0) => {
            let b = "", wn = "", sh = "", sn = "", ch = "", cp = null; const us = [0, .3, .55, .78, 1], X = (u) => X0 + (X1 - X0) * u, yt = (u) => top0 + (106 - top0) * u, yb = (u) => 200 - 62 * u;
            for (let i = 0; i < 4; i++) {
              const ua = us[i], ub = us[i + 1], off = btw(r, -7, 3), ww = Math.abs(X(ub) - X(ua)) * .16;
              b += `<path d="M${f1(X(ua))} ${f1(yb(ua))} L${f1(X(ua))} ${f1(yt(ua) + off)} L${f1(X(ub))} ${f1(yt(ub) + off)} L${f1(X(ub))} ${f1(yb(ub))} Z" fill="${tones[(i + (X0 > 0 ? 1 : 0)) % 4]}"/>`;
              for (let qq = 0; qq < 2; qq++) { const u = ua + (ub - ua) * (.24 + qq * .4), t = yt(u) + off, h = yb(u) - t; for (let j = 0; j < 5; j++) wn += `M${f1(X(u) - ww / 2)} ${f1(t + h * (.1 + j * .14))} h${f1(ww)} v${f1(h * .08)} h${f1(-ww)} Z `; }
              const fa = yb(ua) - (yb(ua) - yt(ua) - off) * .15, fb = yb(ub) - (yb(ub) - yt(ub) - off) * .15;
              sh += `M${f1(X(ua))} ${f1(yb(ua))} L${f1(X(ua))} ${f1(fa)} L${f1(X(ub))} ${f1(fb)} L${f1(X(ub))} ${f1(yb(ub))} Z `;
              sn += `M${f1(X(ua))} ${f1(yt(ua) + off)} L${f1(X(ub))} ${f1(yt(ub) + off)} `;
              const cu = ua + (ub - ua) * .35, cy = yt(cu) + off + 1; ch += `M${f1(X(cu) - 3)} ${f1(cy)} v-8 h6 v8 Z `; if (i === 1) cp = [X(cu), cy - 8];
            }
            return { s: b + `<path d="${sh}" fill="#5E4A3E"/><path d="${wn}" fill="#3E3A36"/><path d="${ch}" fill="#6E675E"/>` + (sea === "winter" ? `<path d="${sn}" stroke="#F4F6F8" stroke-width="2.5" fill="none"/>` : ""), cp };
          };
          const Lf = side(0, e, 76), Rt = side(300, f, 72);
          s += Lf.s + Rt.s;
          const pp = btw(r, sx + 28, sx + 48), gy = 188, pk = .9, P = (dx, dy) => `${f1(pp + dx * pk)} ${f1(gy + dy * pk)}`, bx2 = (dx, dy, w, h) => `M${P(dx, dy)} h${f1(w * pk)} v${f1(h * pk)} h${f1(-w * pk)} Z `;
          s += `<path d="${bx2(-4, -2, 3.6, 2)}${bx2(1, -2, 3.6, 2)}${bx2(-5.5, -35, 11, 14)}" fill="#2A2E3A"/><path d="${bx2(-3.5, -11, 2.6, 9)}${bx2(1, -11, 2.6, 9)}${bx2(-1.5, -21, 3, 4)}" fill="#EDE8DC"/>`;
          s += `<path d="M${P(-6, -21)} L${P(6, -21)} L${P(7, -10)} L${P(-7, -10)} Z" fill="#A8322E"/><path d="M${P(-6, -17)} L${P(6.4, -17)} M${P(-6.5, -13)} L${P(6.8, -13)} M${P(-2, -21)} L${P(-2.2, -10)} M${P(3, -21)} L${P(3.3, -10)}" stroke="#2E4A3A" stroke-width=".8" fill="none"/>`;
          s += `<circle cx="${f1(pp)}" cy="${f1(gy - 39 * pk)}" r="${f1(3.6 * pk)}" fill="#E8C6A6"/><path d="M${P(-4, -41)} Q${P(0, -47)} ${P(4, -41)} Z" fill="#2A2A30"/><ellipse cx="${f1(pp - 6 * pk)}" cy="${f1(gy - 30 * pk)}" rx="${f1(4.5 * pk)}" ry="${f1(3.5 * pk)}" fill="#A8322E"/><path d="M${P(-6, -32)} L${P(-14, -47)} M${P(-5, -32)} L${P(-10, -49)} M${P(-4, -32)} L${P(-6, -47)} M${P(1, -36)} L${P(3, -26)}" stroke="#2A2A30" stroke-width="1.2" fill="none"/>`;
          for (let i = 0; i < 2; i++) { const x = btw(r, sx - 14, sx + 10), y = btw(r, 146, 154); s += `<circle cx="${f1(x)}" cy="${f1(y - 6)}" r="1.2" fill="#4A4038"/><rect x="${f1(x - 1.2)}" y="${f1(y - 5)}" width="2.4" height="5" fill="${pick(r, ["#3E5568", "#8C3B2E", "#6B5A3E"])}"/>`; }
          perch.push([sx, B - 32 * k], Lf.cp);
          return { s, l, perch };
        } },
      { id: "urquhart", zh: "尼斯湖與厄克特城堡", see: ["湖又長又窄，一眼望不到盡頭", "城堡的石塔塌了一角，在湖邊站了好多年", "湖水黑黑的，大家都在找水怪"], spots: ["石塔缺口邊的石頭上", "湖邊的矮石牆上"],
        draw(c) {
          const { r, sea } = c, tx = btw(r, 198, 228), perch = [], l = "";
          const grass = { spring: "#7FA266", summer: "#6E9A58", autumn: "#A39A5A", winter: "#A9AD9C" }[sea], hl = { spring: "#7C8A70", summer: "#6B8060", autumn: "#8E7E58", winter: "#A3A8A4" }[sea], hr = { spring: "#6E7C64", summer: "#5E7254", autumn: "#7E6E4C", winter: "#959A96" }[sea];
          let s = water(124, "#8FA9B2", "#55707C", r) + `<path d="M118 127 Q150 110 198 127 Z" fill="#A3AFAE"/>`;
          s += `<path d="M0 90 Q60 88 100 106 Q132 120 170 127 L170 129 L0 152 Z" fill="${hl}"/><path d="M300 86 Q248 88 214 106 Q190 120 166 127 L166 129 L300 142 Z" fill="${hr}"/>`;
          if (sea === "winter") s += `<path d="M0 90 Q60 88 100 106 L96 108 Q58 94 0 96 Z M300 86 Q248 88 214 106 L218 108 Q250 94 300 92 Z" fill="#F2F4F5"/>`;
          if (r() < .6) s += boat(btw(r, 26, 96), btw(r, 162, 178), 1, false);
          s += `<path d="M110 200 Q120 172 160 164 Q210 154 260 156 Q290 158 300 154 L300 200 Z" fill="${grass}"/><path d="M${f1(tx - 22)} 168 Q${f1(tx)} 156 ${f1(tx + 24)} 168 Z" fill="#6E675E"/>`;
          s += `<path d="M${f1(tx - 50)} 172 V162 L${f1(tx - 44)} 164 L${f1(tx - 38)} 158 L${f1(tx - 28)} 160 L${f1(tx - 24)} 164 L${f1(tx - 24)} 172 Z M${f1(tx + 14)} 168 V158 L${f1(tx + 30)} 160 L${f1(tx + 40)} 155 L${f1(tx + 56)} 158 L${f1(tx + 62)} 162 V168 Z" fill="#8A8276"/>`;
          s += `<path d="M${f1(tx - 14)} 164 V80 L${f1(tx - 10)} 78 L${f1(tx - 8)} 82 L${f1(tx - 4)} 79 L${f1(tx)} 85 L${f1(tx + 4)} 91 L${f1(tx + 8)} 95 L${f1(tx + 12)} 103 L${f1(tx + 14)} 106 V164 Z" fill="#8A8276"/><path d="M${f1(tx + 6)} 164 V94 L${f1(tx + 8)} 95 L${f1(tx + 12)} 103 L${f1(tx + 14)} 106 V164 Z" fill="#78706A"/><rect x="${f1(tx - 17)}" y="76" width="7" height="9" fill="#8A8276"/>`;
          s += `<path d="M${f1(tx - 7)} 100 h4 v6 h-4 Z M${f1(tx - 7)} 118 h4 v7 h-4 Z M${f1(tx + 1)} 128 h4 v7 h-4 Z M${f1(tx - 7)} 140 h4 v7 h-4 Z" fill="#3E3A36"/>`;
          s += tree(btw(r, 262, 292), 170, 1, sea, r);
          perch.push([tx - 13.5, 76], [tx + 48, 156.6]);
          return { s, l, perch };
        } },
      { id: "glenfinnan", zh: "格蘭芬蘭高架橋", see: ["彎彎的高架橋下面有一整排拱門", "蒸汽火車開過時會噗噗地冒白煙", "四周的山把山谷圍得好安靜"], spots: ["最後一節車廂的車頂上", "高架橋的欄杆上"],
        draw(c) {
          const { r, sea } = c, cx = btw(r, 140, 165), perch = [], l = "";
          const mtn = { spring: "#6F8466", summer: "#5E7A52", autumn: "#8A7A4E", winter: "#8C9490" }[sea], fl = { spring: "#8DAA6C", summer: "#7A9C5A", autumn: "#A8925A", winter: "#C9CCC4" }[sea];
          const d = (x) => 102 + 26 * (1 - ((x - cx) / 165) ** 2), gr = (x) => 172 - 54 * ((x - cx) / 150) ** 2;
          let s = hills(92, mtn, r, 24), g = "M0 200", top = "", bot = "";
          for (let x = 0; x <= 300; x += 10) { g += ` L${x} ${f1(gr(x))}`; top += `${x ? " L" : "M"}${x} ${f1(d(x) - 4)}`; }
          for (let x = 300; x >= 0; x -= 10) bot += ` L${x} ${f1(gr(x) + 1)}`;
          s += `<path d="${g} L300 200 Z" fill="${fl}"/><path d="M0 190 Q60 182 120 188 T240 186 T300 190" stroke="#8FB0C0" stroke-width="3" fill="none"/>`;
          s += `<path d="${top}${bot} Z" fill="#B9B2A4"/>`;
          let ar = ""; for (let xa = 2; xa < 300; xa += 14) { const a = xa + 2.2, b = xa + 11.8, m = (a + b) / 2, w2 = (b - a) / 2, t = d(m) + 7, bt = Math.min(gr(a), gr(b)); if (bt - t - w2 < 3) continue; ar += `M${f1(a)} ${f1(bt)} V${f1(t + w2)} Q${f1(a)} ${f1(t)} ${f1(m)} ${f1(t)} Q${f1(b)} ${f1(t)} ${f1(b)} ${f1(t + w2)} V${f1(bt)} Z `; }
          s += `<path d="${ar}" fill="${mtn}"/><path d="${top}" stroke="#9E9686" stroke-width="1.4" fill="none"/>`;
          const A = btw(r, 150, 178), quad = (x1, x2, h0, h1) => `M${f1(x1)} ${f1(d(x1) - 4 - h0)} L${f1(x2)} ${f1(d(x2) - 4 - h0)} L${f1(x2)} ${f1(d(x2) - 4 - h1)} L${f1(x1)} ${f1(d(x1) - 4 - h1)} Z `;
          let car = "", win = ""; for (let i = 0; i < 4; i++) { const x1 = A + i * 23; car += quad(x1, x1 + 21, 0, 10); win += quad(x1 + 1.5, x1 + 19.5, 4, 7); }
          const L0 = A + 92, xf = L0 + 19;
          s += `<path d="${car}" fill="#7A2A2A"/><path d="${win}" fill="#E9D8B4"/><path d="${quad(L0, L0 + 24, 0, 9)}${quad(L0, L0 + 8, 0, 13)}${quad(xf - 1.8, xf + 1.8, 8, 15)}" fill="#2A2626"/>`;
          let sm = ""; for (let i = 0; i < 6; i++) sm += `<circle cx="${f1(xf - 3 - i * 9)}" cy="${f1(d(xf) - 24 - i * 5)}" r="${f1(3 + i * 1.6)}" fill="#F4F2EC" opacity="${f1(.9 - i * .11)}"/>`;
          s += sm + tree(btw(r, 14, 80), 194, 1, sea, r) + tree(btw(r, 222, 290), 196, 1.1, sea, r);
          perch.push([A + 11, d(A + 11) - 14], [60, d(60) - 4.7]);
          return { s, l, perch };
        } },
      { id: "forthbridge", zh: "福斯橋", see: ["紅色的鐵橋像三個連在一起的大菱形", "火車從橋的鐵架中間穿過去", "橋下的海灣很寬，風吹得好大"], spots: ["鐵架最高的地方", "另一座鐵架的頂端", "橋墩旁的石頭上"],
        draw(c) {
          const { r } = c, b = btw(r, 148, 160), a = 34, tw = 7, Y = btw(r, 64, 70), yD = 114, yB = 146, Rd = "#B5402E", perch = [], l = "";
          let s = hills(124, "#8E9C94", r, 8) + water(130, "#9CB4BE", "#5C7888", r);
          if (r() < .6) s += boat(btw(r, 10, 250), btw(r, 170, 186), 1, r() < .5);
          const qp = (p0, p1, p2, t) => (1 - t) * (1 - t) * p0 + 2 * t * (1 - t) * p1 + t * t * p2, cs = [b - 100, b, b + 100];
          let main = "", lat = "", pier = "";
          for (const cc of cs) {
            pier += `M${f1(cc - 13)} ${yB - 3} h26 v9 h-26 Z `;
            main += `M${f1(cc - tw)} ${yB} L${f1(cc - tw + 1.5)} ${f1(Y)} L${f1(cc + tw - 1.5)} ${f1(Y)} L${f1(cc + tw)} ${yB} `;
            lat += `M${f1(cc - tw)} ${yB} L${f1(cc + tw - 1.5)} ${f1(Y)} M${f1(cc + tw)} ${yB} L${f1(cc - tw + 1.5)} ${f1(Y)} `;
            for (const sg of [-1, 1]) {
              const x0 = cc + sg * tw, x1 = cc + sg * a * .7, x2 = cc + sg * a, xt = cc + sg * (tw - 1.5);
              main += `M${f1(xt)} ${f1(Y)} L${f1(x2)} ${yD} M${f1(x0)} ${yB} Q${f1(x1)} ${yB - 8} ${f1(x2)} ${yD + 2} `;
              let pT = [xt, Y], pB = [x0, yB];
              for (const t of [.35, .68, 1]) { const bxq = qp(x0, x1, x2, t), byq = qp(yB, yB - 8, yD + 2, t), tyq = Y + (yD - Y) * ((bxq - xt) / (x2 - xt)); lat += `M${f1(bxq)} ${f1(byq)} L${f1(bxq)} ${f1(tyq)} M${f1(pT[0])} ${f1(pT[1])} L${f1(bxq)} ${f1(byq)} M${f1(pB[0])} ${f1(pB[1])} L${f1(bxq)} ${f1(tyq)} `; pT = [bxq, tyq]; pB = [bxq, byq]; }
            }
          }
          for (const [u, v] of [[0, cs[0] - a], [cs[0] + a, cs[1] - a], [cs[1] + a, cs[2] - a], [cs[2] + a, 300]]) { main += `M${f1(u)} ${yD - 6} L${f1(v)} ${yD - 6} `; let z = `M${f1(u)} ${yD}`; for (let x = u; x < v - 1; x += 6) z += ` L${f1(Math.min(x + 3, v))} ${yD - 6} L${f1(Math.min(x + 6, v))} ${yD}`; lat += z + " "; }
          for (const x of [8, 296]) pier += `M${x - 3} ${yD} h6 v${yB - yD} h-6 Z `;
          s += `<path d="${pier}" fill="#8A8478"/><rect x="0" y="${yD - 1}" width="300" height="3" fill="#8E3426"/>`;
          if (r() < .6) { const tx = btw(r, 20, 220); s += `<rect x="${f1(tx)}" y="${yD - 7}" width="44" height="6" rx="1.5" fill="#3F5A7E"/><path d="M${f1(tx + 3)} ${yD - 6} h38 v2 h-38 Z" fill="#DCE4EA"/>`; }
          s += `<path d="${lat}" stroke="${Rd}" stroke-width="1.1" fill="none"/><path d="${main}" stroke="${Rd}" stroke-width="3" stroke-linejoin="round" fill="none"/>`;
          perch.push([b - 5, Y - 1.5], [b + 95, Y - 1.5], [b + 110, yB - 3]);
          return { s, l, perch };
        } },
      { id: "highlandcow", zh: "高地牛與山谷", see: ["高地牛的毛好長，連眼睛都遮住了", "彎彎的牛角往兩邊伸得好開", "山坡上長滿了一叢一叢的石楠"], spots: ["高地牛的背上", "牛角的尖尖上"],
        draw(c) {
          const { r, sea } = c, cx = btw(r, 172, 204), cy = 156, k = btw(r, .95, 1.08), perch = [], l = "";
          const mtn = sea === "winter" ? "#C9CFD6" : "#6E7A86", mid = { spring: "#8DAA6C", summer: "#7A9C5A", autumn: "#A8925A", winter: "#B9BCAE" }[sea], mead = { spring: "#86A062", summer: "#7F8A55", autumn: "#998A55", winter: "#AAA894" }[sea];
          const heath = sea === "summer" || sea === "autumn" ? "#9C5A9E" : "#7D6A7E";
          let s = hills(98, mtn, r, 26) + hills(126, mid, r, 10) + `<ellipse cx="${f1(btw(r, 60, 120))}" cy="136" rx="62" ry="6" fill="#8FAAB6"/><path d="M0 200 L0 150 Q150 138 300 152 L300 200 Z" fill="${mead}"/>`;
          let hd = ""; for (let i = 0; i < 40; i++) { const x = btw(r, 0, 300), y = btw(r, 158, 198), rr = btw(r, 1.3, 2.5); hd += `M${f1(x - rr)} ${f1(y)} a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(2 * rr)} 0 a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(-2 * rr)} 0 `; }
          s += `<path d="${hd}" fill="${heath}"/>`;
          const cow = (x, y, kk) => {
            const P = (dx, dy) => `${f1(x + dx * kk)} ${f1(y + dy * kk)}`, Fu = "#B8642E", Dk = "#8E4A22";
            let z = "", lg = "", hf = ""; for (const dx of [-24, -12, 14, 26]) { lg += `M${P(dx - 2.6, 12)} h${f1(5.2 * kk)} v${f1(18 * kk)} h${f1(-5.2 * kk)} Z `; hf += `M${P(dx - 2.6, 28)} h${f1(5.2 * kk)} v${f1(2.5 * kk)} h${f1(-5.2 * kk)} Z `; }
            let fr = `M${P(-34, 6)}`; for (let i = 0; i < 9; i++) fr += ` L${P(-30 + i * 8, 22)} L${P(-26 + i * 8, 14)}`;
            z += `<path d="${lg}" fill="${Dk}"/><path d="${hf}" fill="#3A2A20"/><path d="M${P(37, -8)} Q${P(44, 4)} ${P(41, 18)}" stroke="${Dk}" stroke-width="${f1(2 * kk)}" fill="none"/><ellipse cx="${f1(x + 41 * kk)}" cy="${f1(y + 20 * kk)}" rx="${f1(2.4 * kk)}" ry="${f1(3.4 * kk)}" fill="${Dk}"/>`;
            z += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(38 * kk)}" ry="${f1(21 * kk)}" fill="${Fu}"/><path d="${fr} L${P(36, 6)} Z" fill="${Fu}"/><path d="M${P(-20, -14)} q${f1(4 * kk)} ${f1(6 * kk)} 0 ${f1(12 * kk)} M${P(-6, -18)} q${f1(4 * kk)} ${f1(6 * kk)} 0 ${f1(12 * kk)} M${P(10, -17)} q${f1(4 * kk)} ${f1(6 * kk)} 0 ${f1(12 * kk)} M${P(24, -12)} q${f1(4 * kk)} ${f1(6 * kk)} 0 ${f1(12 * kk)}" stroke="${Dk}" stroke-width="1.1" fill="none"/>`;
            z += `<ellipse cx="${f1(x - 53 * kk)}" cy="${f1(y - 8 * kk)}" rx="${f1(4 * kk)}" ry="${f1(2.2 * kk)}" fill="#A85A2A"/><ellipse cx="${f1(x - 27 * kk)}" cy="${f1(y - 8 * kk)}" rx="${f1(4 * kk)}" ry="${f1(2.2 * kk)}" fill="#A85A2A"/><ellipse cx="${f1(x - 40 * kk)}" cy="${f1(y - 6 * kk)}" rx="${f1(12 * kk)}" ry="${f1(13 * kk)}" fill="${Fu}"/>`;
            z += `<path d="M${P(-48, -14)} Q${P(-62, -14)} ${P(-64, -28)} M${P(-32, -14)} Q${P(-18, -14)} ${P(-16, -28)}" stroke="#EFE4C8" stroke-width="${f1(3.2 * kk)}" stroke-linecap="round" fill="none"/>`;
            z += `<ellipse cx="${f1(x - 42 * kk)}" cy="${f1(y + 5 * kk)}" rx="${f1(7.5 * kk)}" ry="${f1(5.5 * kk)}" fill="#D9AE84"/><circle cx="${f1(x - 45 * kk)}" cy="${f1(y + 6 * kk)}" r="${f1(.9 * kk)}" fill="#5A3A28"/><circle cx="${f1(x - 39 * kk)}" cy="${f1(y + 6 * kk)}" r="${f1(.9 * kk)}" fill="#5A3A28"/>`;
            z += `<path d="M${P(-52, -10)} Q${P(-40, -24)} ${P(-28, -10)} L${P(-30, -2)} L${P(-33, -6)} L${P(-36, 0)} L${P(-40, -5)} L${P(-44, 0)} L${P(-47, -6)} L${P(-50, -1)} Z" fill="#CC7A3E"/>`;
            return z;
          };
          if (r() < .45) s += cow(cx - 94, 172, .55);
          s += cow(cx, cy, k);
          perch.push([cx + 4, cy - 21 * k], [cx - 64 * k, cy - 29.6 * k]);
          return { s, l, perch };
        } },
    ],
  },
};
