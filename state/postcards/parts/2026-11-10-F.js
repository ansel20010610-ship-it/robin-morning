var CITIES_PART = {
  newyork: {
    zh: "紐約", de: "New York", gift: "一座迷你的自由女神像",
    sights: [
      { id: "liberty", zh: "自由女神像", see: ["她手上的火炬比我想得還要高好多", "她全身綠綠的，聽說以前是亮亮的銅色", "渡輪一班一班把人載到小島上來"], spots: ["火炬的邊上", "她頭上的皇冠尖", "基座的欄杆上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const k = btw(r, .9, 1.04), lx = btw(r, 175, 215), X = (u) => f1(lx + u * k), Y = (v) => f1(152 - v * k), G = "#7FAE9A";
          for (let x = 2; x < 118;) { const w = btw(r, 6, 11), h = btw(r, 8, 30); s += `<rect x="${f1(x)}" y="${f1(145 - h)}" width="${f1(w)}" height="${f1(h + 1)}" fill="${pick(r, ["#A9B4BE", "#B6BEC6", "#9DA8B3"])}"/>`; x += w + btw(r, 0, 3); }
          s += water(145, "#9CC0CF", "#5C8AA0", r);
          s += `<ellipse cx="${f1(lx)}" cy="153" rx="72" ry="7" fill="#7E9A6E"/>`;
          s += `<path d="M${X(-46)} ${Y(0)} L${X(-36)} ${Y(9)} L${X(36)} ${Y(9)} L${X(46)} ${Y(0)} Z" fill="#B6A68C"/><path d="M${X(-12)} ${Y(9)} L${X(-10)} ${Y(40)} L${X(10)} ${Y(40)} L${X(12)} ${Y(9)} Z" fill="#CDBB9C"/><rect x="${X(-13)}" y="${Y(44)}" width="${f1(26 * k)}" height="${f1(4 * k)}" fill="#BFAE90"/><rect x="${X(-11)}" y="${Y(26)}" width="${f1(22 * k)}" height="${f1(3 * k)}" fill="#B6A68C"/>`;
          s += `<path d="M${X(-8)} ${Y(44)} L${X(-6)} ${Y(76)} Q${X(0)} ${Y(82)} ${X(6)} ${Y(76)} L${X(8)} ${Y(44)} Z" fill="${G}"/><path d="M${X(-4)} ${Y(46)} L${X(-3)} ${Y(72)} M${X(1)} ${Y(46)} L${X(1)} ${Y(74)} M${X(5)} ${Y(46)} L${X(4)} ${Y(70)}" stroke="#6A9886" stroke-width=".7" fill="none"/>`;
          s += `<circle cx="${X(0)}" cy="${Y(86)}" r="${f1(4.2 * k)}" fill="${G}"/>`;
          for (let i = 0; i < 5; i++) { const a = (-150 + i * 30) * Math.PI / 180; s += `<path d="M${X(Math.cos(a) * 4)} ${Y(86 - Math.sin(a) * 4)} L${X(Math.cos(a) * 8)} ${Y(86 - Math.sin(a) * 8)}" stroke="${G}" stroke-width="1.2"/>`; }
          s += `<path d="M${X(-5)} ${Y(74)} L${X(-10)} ${Y(106)}" stroke="${G}" stroke-width="${f1(3.4 * k)}" stroke-linecap="round"/><path d="M${X(-12.5)} ${Y(108)} L${X(-7.5)} ${Y(108)} L${X(-9)} ${Y(104)} L${X(-11)} ${Y(104)} Z" fill="#C9A24A"/><path d="M${X(-12.5)} ${Y(108)} Q${X(-10)} ${Y(121)} ${X(-7.5)} ${Y(108)} Z" fill="#E9B949"/>`;
          s += `<rect x="${X(5)}" y="${Y(74)}" width="${f1(5 * k)}" height="${f1(11 * k)}" fill="#6E9C8A"/>`;
          perch.push([lx - 10 * k, 152 - 122 * k], [lx + 10 * k, 152 - 44 * k]);
          if (r() < .7) s += boat(btw(r, 20, 75), btw(r, 172, 186), 1, false);
          return { s, l, perch };
        } },
      { id: "empirestate", zh: "帝國大廈", see: ["大樓一層一層往上縮，最上面是一根細細的尖塔", "從上面看下去，街道像棋盤一樣整齊", "電梯一下子就把大家送上八十六樓的觀景台"], spots: ["頂端尖塔的旁邊", "八十六樓觀景台的欄杆"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const ex = btw(r, 165, 205), k = btw(r, .95, 1.03), B = 174, X = (u) => f1(ex + u * k), Y = (v) => f1(B - v * k), W = (u) => f1(u * k);
          for (let x = -4; x < 300;) { const w = btw(r, 14, 26), h = btw(r, 30, x < 120 ? 70 : 90); s += `<rect x="${f1(x)}" y="${f1(B - h)}" width="${f1(w)}" height="${f1(h)}" fill="${pick(r, ["#9FAAB4", "#A9B2B8", "#B4B0A6"])}"/>`; x += w + btw(r, 0, 3); }
          s += `<rect x="${X(-30)}" y="${Y(20)}" width="${W(60)}" height="${W(20)}" fill="#C4B594"/><rect x="${X(-20)}" y="${Y(84)}" width="${W(40)}" height="${W(64)}" fill="#CDBF9E"/><rect x="${X(4)}" y="${Y(84)}" width="${W(16)}" height="${W(64)}" fill="#BCAD8C"/>`;
          for (let i = 0; i < 7; i++) s += `<path d="M${X(-17 + i * 5.6)} ${Y(81)} L${X(-17 + i * 5.6)} ${Y(23)}" stroke="#8E8268" stroke-width=".6"/>`;
          s += `<rect x="${X(-15)}" y="${Y(92)}" width="${W(30)}" height="${W(8)}" fill="#CDBF9E"/><rect x="${X(-10)}" y="${Y(99)}" width="${W(20)}" height="${W(7)}" fill="#C4B594"/><path d="M${X(-7)} ${Y(99)} L${X(-5)} ${Y(111)} L${X(5)} ${Y(111)} L${X(7)} ${Y(99)} Z" fill="#D6C9AA"/>`;
          s += `<rect x="${X(-2.2)}" y="${Y(125)}" width="${W(4.4)}" height="${W(14)}" fill="#A89A7E"/><circle cx="${X(0)}" cy="${Y(125)}" r="${W(2.4)}" fill="#A89A7E"/><path d="M${X(0)} ${Y(126)} L${X(0)} ${Y(142)}" stroke="#7E7462" stroke-width="1.2"/>`;
          for (let x = -4; x < 300;) { const w = btw(r, 16, 30), h = btw(r, 10, 26); s += `<rect x="${f1(x)}" y="${f1(B - h)}" width="${f1(w)}" height="${f1(h)}" fill="${pick(r, ["#7F8A92", "#8C8478", "#76818A"])}"/>`; x += w + btw(r, 2, 10); }
          s += `<rect x="0" y="${B}" width="300" height="${200 - B}" fill="#8D8C86"/><path d="M0 187 H300" stroke="#E9E1D0" stroke-width="1" stroke-dasharray="8 6"/>`;
          for (let i = 0; i < 2; i++) s += tree(btw(r, 20, 280), btw(r, 194, 198), btw(r, .8, 1), sea, r);
          perch.push([ex, B - 143 * k], [ex - 12 * k, B - 92 * k]);
          return { s, l, perch };
        } },
      { id: "brooklyn", zh: "布魯克林大橋", see: ["兩座石頭橋塔上開著尖尖的拱門", "好多鋼索像扇子一樣斜斜地拉開", "橋中間有一條木板步道，走路的人在車子上面"], spots: ["石頭橋塔的頂上", "鋼索上", "步道的欄杆"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const bx = btw(r, 170, 190), D = 128, t1 = bx - 62, t2 = bx + 62, top = 58;
          for (let x = -2; x < 300;) { const w = btw(r, 8, 16), h = btw(r, 10, 42); s += `<rect x="${f1(x)}" y="${f1(146 - h)}" width="${f1(w)}" height="${f1(h + 1)}" fill="${pick(r, ["#B3BCC4", "#BCC3C9", "#A9B3BC"])}"/>`; x += w + btw(r, 0, 3); }
          s += water(146, "#9CC0CF", "#5C8AA0", r);
          const q = (t, a, b, cc) => (1 - t) * (1 - t) * a + 2 * t * (1 - t) * cc + t * t * b;
          s += `<path d="M${f1(t1)} ${top} Q${f1(bx)} 178 ${f1(t2)} ${top} M${f1(t1)} ${top} Q${f1(t1 - 40)} 112 0 ${D - 2} M${f1(t2)} ${top} Q${f1(t2 + 30)} 112 300 ${D - 4}" stroke="#4E463E" stroke-width="1.6" fill="none"/>`;
          for (let i = 1; i < 16; i++) { const t = i / 16, x = q(t, t1, t2, bx), y = q(t, top, top, 178); if (y < D - 1) s += `<path d="M${f1(x)} ${f1(y)} V${D}" stroke="#4E463E" stroke-width=".55"/>`; }
          for (const t of [t1, t2]) for (let j = 1; j <= 5; j++) s += `<path d="M${f1(t)} ${top + 6} L${f1(t - j * 10)} ${D} M${f1(t)} ${top + 6} L${f1(t + j * 10)} ${D}" stroke="#6E6458" stroke-width=".5"/>`;
          for (const t of [t1, t2]) {
            const hole = (x0, x1) => { const m = (x0 + x1) / 2; return ` M${f1(x0)} ${D + 4} V78 Q${f1(x0)} 70 ${f1(m)} 66 Q${f1(x1)} 70 ${f1(x1)} 78 V${D + 4} Z`; };
            s += `<path d="M${f1(t - 13)} 148 V${top + 2} H${f1(t + 13)} V148 Z${hole(t - 9, t - 2)}${hole(t + 2, t + 9)}" fill="#B5A388" fill-rule="evenodd"/><rect x="${f1(t - 15)}" y="${top - 2}" width="30" height="5" fill="#9A8A72"/><rect x="${f1(t - 16)}" y="142" width="32" height="8" fill="#8E806A"/><path d="M${f1(t - 13)} 96 H${f1(t + 13)}" stroke="#9A8A72" stroke-width="1.2"/>`;
          }
          s += `<rect x="0" y="${D}" width="300" height="5" fill="#5E554C"/><path d="M0 ${D - 2} H300" stroke="#5E554C" stroke-width=".8"/>`;
          perch.push([t2, top - 2], [bx + 20, D - 2]);
          if (r() < .5) s += boat(btw(r, 20, 240), btw(r, 172, 186), 1, false);
          return { s, l, perch };
        } },
      { id: "timessquare", zh: "時代廣場", see: ["四面八方的大螢幕一直在換畫面", "黃色計程車一台接一台按喇叭", "紅色的階梯上坐滿了抬頭看的人"], spots: ["一塊大看板的上緣", "計程車頂的燈上", "紅色階梯的最上面"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const BB = ["#D9533F", "#E9B949", "#4D86B8", "#5BA572", "#C85E98", "#7A5FB0", "#F08A3E"], cx = btw(r, 150, 175);
          const bld = (x, w, top, col) => {
            let b = `<rect x="${f1(x)}" y="${f1(top)}" width="${f1(w)}" height="${f1(170 - top)}" fill="${col}"/>`;
            for (let y = top + 5; y < 158;) { const h = btw(r, 10, 20); if (r() < .72) b += `<rect x="${f1(x + 2)}" y="${f1(y)}" width="${f1(w - 4)}" height="${f1(Math.min(h, 162 - y))}" fill="${pick(r, BB)}"/>`; else for (let i = 0; i < 3; i++) b += `<rect x="${f1(x + 3 + i * (w - 6) / 3)}" y="${f1(y + 2)}" width="${f1((w - 6) / 3 - 2)}" height="3" fill="#4A4F58"/>`; y += h + 3; }
            return b;
          };
          s += bld(88, 30, 98, "#8E9198") + bld(196, 22, 92, "#8E9198");
          s += bld(-2, 46, 82, "#7E848C") + bld(44, 44, 72, "#868A90") + bld(214, 44, 56, "#7E848C") + bld(258, 44, 48, "#868A90");
          s += `<rect x="${f1(cx - 12)}" y="40" width="24" height="8" fill="#9A9690"/><path d="M${f1(cx)} 40 V31" stroke="#5A5650" stroke-width="1.2"/><circle cx="${f1(cx)}" cy="30" r="3" fill="#E4E0D6"/>`;
          s += `<rect x="${f1(cx - 17)}" y="46" width="34" height="124" fill="#8E8A86"/>`;
          for (let y = 50; y < 160;) { const h = btw(r, 12, 20), o = r() < .4 ? 3 : 0; s += `<rect x="${f1(cx - 16 - o)}" y="${f1(y)}" width="${f1(32 + o * 2)}" height="${f1(Math.min(h, 164 - y))}" fill="${pick(r, BB)}"/>`; y += h + 2; }
          s += `<rect x="0" y="168" width="300" height="32" fill="#6E6A66"/>`;
          for (let i = 0; i < 12; i++) s += `<rect x="${f1(70 + i * 14)}" y="172" width="8" height="6" fill="#E9E1D0" opacity=".8"/>`;
          s += `<path d="M14 170 V166 H22 V162 H30 V158 H38 V154 H46 V150 H58 V170 Z" fill="#C8302A"/>`;
          for (let i = 0; i < 5; i++) s += `<circle cx="${f1(18 + i * 8)}" cy="${f1(163 - i * 4)}" r="1.6" fill="#3A3330"/>`;
          const taxi = (x, y) => `<rect x="${f1(x)}" y="${f1(y - 8)}" width="26" height="8" rx="2" fill="#E8B83A"/><path d="M${f1(x + 6)} ${f1(y - 8)} L${f1(x + 9)} ${f1(y - 14)} L${f1(x + 18)} ${f1(y - 14)} L${f1(x + 21)} ${f1(y - 8)} Z" fill="#E8B83A"/><path d="M${f1(x + 8)} ${f1(y - 8.5)} L${f1(x + 10)} ${f1(y - 12.6)} L${f1(x + 17)} ${f1(y - 12.6)} L${f1(x + 19)} ${f1(y - 8.5)} Z" fill="#3E4A55"/><rect x="${f1(x + 12)}" y="${f1(y - 16)}" width="3" height="2" fill="#F4EEDB"/><circle cx="${f1(x + 6)}" cy="${f1(y)}" r="2.6" fill="#2A2A2A"/><circle cx="${f1(x + 20)}" cy="${f1(y)}" r="2.6" fill="#2A2A2A"/>`;
          const tx = btw(r, 90, 130); s += taxi(tx, 188) + taxi(tx + btw(r, 40, 60), 192);
          if (r() < .6) s += taxi(btw(r, 230, 262), 186);
          perch.push([cx, 27], [tx + 13.5, 172], [52, 150]);
          return { s, l, perch };
        } },
      { id: "centralpark", zh: "中央公園", see: ["湖的另一邊，高樓排成一整排", "安靜的湖面上倒映著高樓的影子", "湖上那座白色的弓橋彎得好好看"], spots: ["弓橋的欄杆上", "湖邊一棵大樹的枝頭"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const grass = { spring: "#9CB57E", summer: "#7FA25E", autumn: "#A9A060", winter: "#DADFDC" }[sea];
          for (let x = -4; x < 300;) { const w = btw(r, 10, 20), h = x < 120 ? btw(r, 15, 40) : btw(r, 25, 66); s += `<rect x="${f1(x)}" y="${f1(130 - h)}" width="${f1(w)}" height="${f1(h)}" fill="${pick(r, ["#A9B2BC", "#B8BEC4", "#9EA8B2"])}"/>`; x += w + btw(r, 0, 2); }
          for (let i = 0; i < 2; i++) { const x = btw(r, 215, 285); s += `<rect x="${f1(x)}" y="44" width="6" height="86" fill="#98A3AE"/>`; }
          s += `<rect x="0" y="136" width="300" height="10" fill="${grass}"/>`;
          let tx0 = 0, ts0 = 1;
          for (let i = 0; i < 15; i++) { const x = i * 21 + btw(r, -4, 4), sc = btw(r, .8, 1); if (i === 9) { tx0 = x; ts0 = sc; } s += tree(x, 142, sc, sea, r); }
          s += `<rect x="0" y="146" width="300" height="32" fill="#6E9AAE"/><rect x="0" y="146" width="300" height="3" fill="#9CC0CF"/>`;
          for (let i = 0; i < 6; i++) s += `<path d="M${f1(btw(r, 0, 280))} ${f1(btw(r, 152, 174))} q4 -2 8 0 t8 0" stroke="#fff" stroke-opacity=".45" stroke-width=".9" fill="none"/>`;
          const bx = btw(r, 150, 200);
          s += `<path d="M${f1(bx - 50)} 157 Q${f1(bx)} 174 ${f1(bx + 50)} 157" stroke="#E8E0CC" stroke-opacity=".4" stroke-width="2" fill="none"/>`;
          s += `<path d="M${f1(bx - 58)} 152 Q${f1(bx)} 132 ${f1(bx + 58)} 152 L${f1(bx + 58)} 156 Q${f1(bx)} 140 ${f1(bx - 58)} 156 Z" fill="#E8E0CC"/><path d="M${f1(bx - 58)} 147 Q${f1(bx)} 127 ${f1(bx + 58)} 147" stroke="#CFC6B0" stroke-width="1" fill="none"/>`;
          for (let i = 1; i < 12; i++) { const t = i / 12, x = bx - 58 + 116 * t, y = (1 - t) * (1 - t) * 152 + 2 * t * (1 - t) * 132 + t * t * 152; s += `<path d="M${f1(x)} ${f1(y)} v-5" stroke="#CFC6B0" stroke-width=".8"/>`; }
          if (sea !== "winter" && r() < .7) { const rx = btw(r, 20, 90); s += `<path d="M${f1(rx)} 166 h18 l-3 4 h-12 Z" fill="#8C5A3C"/><circle cx="${f1(rx + 9)}" cy="163" r="2" fill="#3A3330"/><path d="M${f1(rx + 2)} 168 l-5 3 M${f1(rx + 16)} 168 l5 3" stroke="#6A4A36" stroke-width=".8"/>`; }
          s += `<path d="M0 200 L0 178 Q150 170 300 180 L300 200 Z" fill="${grass}"/>`;
          perch.push([bx, 137], [tx0, 142 - (sea === "winter" ? 20 : 30.5) * ts0]);
          return { s, l, perch };
        } },
      { id: "chrysler", zh: "克萊斯勒大廈", see: ["屋頂是一圈一圈的銀色拱，像太陽在發光", "銀色的拱上開著一排排三角形的小窗", "轉角有老鷹頭的雕像伸出來，我跟它對看"], spots: ["最頂上的尖針", "轉角的老鷹雕像頭上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const cx = btw(r, 160, 195), k = btw(r, .92, 1.04), B = 140;
          for (let x = -4; x < 300;) { const w = btw(r, 18, 32); if (x + w < cx - 37 || x > cx + 37) { const t = btw(r, x < 120 ? 92 : 80, 132); s += `<rect x="${f1(x)}" y="${f1(t)}" width="${f1(w)}" height="${f1(200 - t)}" fill="${pick(r, ["#A7AFB6", "#B3B0A8", "#9AA4AD"])}"/>`; let d = ""; for (let y = t + 6; y < 196; y += 9) d += `M${f1(x + 3)} ${f1(y)} H${f1(x + w - 3)}`; s += `<path d="${d}" stroke="#7C8690" stroke-width="1.6" stroke-dasharray="3 2"/>`; } x += w + btw(r, 1, 4); }
          s += `<rect x="${f1(cx - 35 * k)}" y="${B}" width="${f1(70 * k)}" height="${200 - B}" fill="#CFC7B8"/><rect x="${f1(cx + 10 * k)}" y="${B}" width="${f1(25 * k)}" height="${200 - B}" fill="#BDB4A4"/>`;
          for (let i = 0; i < 6; i++) s += `<path d="M${f1(cx + (-30 + i * 12) * k)} ${B + 24} V200" stroke="#7E7A72" stroke-width="1.4"/>`;
          for (const sg of [-1, 1]) s += `<path d="M${f1(cx + sg * 35 * k)} ${B + 13} l${f1(sg * 11)} 1 l${f1(-sg * 3)} 3 l${f1(sg * 1)} 3 l${f1(-sg * 9)} 0 Z" fill="#8E969C"/>`;
          for (let i = 5; i >= 0; i--) {
            const w = (32 - i * 4.8) * k, yb = B - i * 12 * k, h = w * 1.2, E = (a, rr) => `${f1(cx + w * rr * Math.cos(a))} ${f1(yb - h * rr * Math.sin(a))}`;
            s += `<path d="M${f1(cx - w)} ${f1(yb)} A${f1(w)} ${f1(h)} 0 0 1 ${f1(cx + w)} ${f1(yb)} Z" fill="#D8DCDF" stroke="#8B9298" stroke-width=".8"/>`;
            for (let j = 0; j < 5; j++) { const a = Math.PI * (.22 + j * .14); s += `<path d="M${E(a, .97)} L${E(a - .08, .84)} L${E(a + .08, .84)} Z" fill="#3F4B57"/>`; }
          }
          const ty = B - 60 * k - 9.6 * k;
          s += `<path d="M${f1(cx - 3 * k)} ${f1(ty + 3)} L${f1(cx)} ${f1(ty - 40 * k)} L${f1(cx + 3 * k)} ${f1(ty + 3)} Z" fill="#C9CED2"/>`;
          perch.push([cx, ty - 40 * k - 1], [cx + 35 * k + 7, B + 13.6]);
          return { s, l, perch };
        } },
    ],
  },
  sanfrancisco: {
    zh: "舊金山", de: "San Francisco", gift: "一張叮噹車的車票",
    sights: [
      { id: "goldengate", zh: "金門大橋", see: ["橋是紅橘色的，跟海的藍色好配", "橋塔好高，我飛了好久才到頂", "粗粗的鋼纜從橋塔一路垂到橋面"], spots: ["橋塔的頂端", "大鋼纜上", "橋邊的欄杆"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const d = btw(r, -12, 12), T1 = 96 + d, T2 = 228 + d, O = "#C0462E", OD = "#9C3524", dk = (x) => 136 - x * .04;
          s += `<path d="M0 150 L0 126 Q50 106 110 122 Q160 114 215 140 L215 150 Z" fill="#8FA07E"/><path d="M200 150 Q250 132 300 136 L300 150 Z" fill="#A3AE92"/>`;
          s += water(146, "#9CC0CF", "#5C8AA0", r);
          s += `<rect x="${f1(T1 - 6.5)}" y="92" width="3" height="56" fill="${O}"/><rect x="${f1(T1 + 3.5)}" y="92" width="3" height="56" fill="${O}"/>`;
          for (const y of [94, 106, 118]) s += `<rect x="${f1(T1 - 6.5)}" y="${y}" width="13" height="2" fill="${OD}"/>`;
          s += `<path d="M0 ${f1(dk(0))} L300 ${f1(dk(300))} L300 ${f1(dk(300) + 5)} L0 ${f1(dk(0) + 5)} Z" fill="${OD}"/><path d="M0 ${f1(dk(0) - 2)} L300 ${f1(dk(300) - 2)}" stroke="${O}" stroke-width="1"/>`;
          const my = 2 * 125 - (34 + 93) / 2, mx = (T1 + T2) / 2;
          s += `<path d="M${f1(T2)} 34 Q${f1(mx)} ${f1(my)} ${f1(T1)} 93 M${f1(T2)} 34 Q${f1(T2 + 40)} 110 300 ${f1(dk(300) - 2)} M${f1(T1)} 93 Q${f1(T1 - 40)} 120 0 ${f1(dk(0) - 2)}" stroke="${O}" stroke-width="1.8" fill="none"/>`;
          for (let i = 1; i < 20; i++) { const t = i / 20, x = (1 - t) * (1 - t) * T2 + 2 * t * (1 - t) * mx + t * t * T1, y = (1 - t) * (1 - t) * 34 + 2 * t * (1 - t) * my + t * t * 93; if (y < dk(x) - 3) s += `<path d="M${f1(x)} ${f1(y)} V${f1(dk(x))}" stroke="${O}" stroke-width=".55"/>`; }
          for (const sg of [-1, 1]) s += `<path d="M${f1(T2 + sg * 13)} 162 L${f1(T2 + sg * 12)} 30 L${f1(T2 + sg * 7)} 30 L${f1(T2 + sg * 6)} 162 Z" fill="${O}"/>`;
          for (const [y, h] of [[30, 4], [56, 3], [80, 3], [106, 3]]) s += `<rect x="${f1(T2 - 13)}" y="${y}" width="26" height="${h}" fill="${OD}"/>`;
          s += `<rect x="${f1(T2 - 16)}" y="156" width="32" height="7" fill="#8E806A"/>`;
          perch.push([T2 - 9, 29], [150, f1(dk(150) - 2)]);
          if (r() < .6) s += boat(btw(r, 20, 170), btw(r, 168, 186), 1, true);
          return { s, l, perch: perch.map((p) => [p[0], +p[1]]) };
        } },
      { id: "cablecar", zh: "叮噹車", see: ["叮噹車爬上很陡的坡，一點都不喘", "有人就站在車廂外面，抓著柱子", "往坡下看，底下就是藍藍的海灣"], spots: ["叮噹車的車頂", "路邊房子的屋簷"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const cx = btw(r, 130, 165), k = btw(r, 1.05, 1.2), gy = (x) => 184 - x * .15, ex = .989, ey = -.148, nx = -.148, ny = -.989, y0 = gy(cx) + 11;
          s += hills(118, "#9AAAB0", r, 6) + water(124, "#9CC0CF", "#5C8AA0", r);
          if (r() < .6) s += boat(btw(r, 15, 70), btw(r, 136, 150), .7, true);
          const cols = ["#E9C3C3", "#CFDDBF", "#F0DDB0", "#C3D4E3", "#E1CDE6"];
          let hx = 0, hy = 0;
          for (let x = 204; x < 300; x += 25) { const h = btw(r, 38, 50), b = gy(x) + 2; s += `<rect x="${f1(x)}" y="${f1(b - h)}" width="24" height="${f1(h)}" fill="${pick(r, cols)}"/><rect x="${f1(x - 1)}" y="${f1(b - h - 3)}" width="26" height="3" fill="#7E6B5C"/><rect x="${f1(x + 4)}" y="${f1(b - h + 6)}" width="16" height="10" fill="#F1ECE2"/><rect x="${f1(x + 6)}" y="${f1(b - h + 8)}" width="4" height="6" fill="#4E5A66"/><rect x="${f1(x + 14)}" y="${f1(b - h + 8)}" width="4" height="6" fill="#4E5A66"/><rect x="${f1(x + 5)}" y="${f1(b - h + 22)}" width="5" height="7" fill="#4E5A66"/><rect x="${f1(x + 14)}" y="${f1(b - h + 22)}" width="5" height="7" fill="#4E5A66"/>`; if (!hx) { hx = x + 12; hy = b - h - 3; } }
          s += `<path d="M0 ${f1(gy(0) - 3)} L300 ${f1(gy(300) - 3)} L300 200 L0 200 Z" fill="#C9BFAE"/><path d="M0 ${f1(gy(0))} L300 ${f1(gy(300))} L300 200 L0 200 Z" fill="#8A827A"/>`;
          s += `<path d="M0 ${f1(gy(0) + 8)} L300 ${f1(gy(300) + 8)} M0 ${f1(gy(0) + 14)} L300 ${f1(gy(300) + 14)}" stroke="#5E5650" stroke-width="1"/><path d="M0 ${f1(gy(0) + 11)} L300 ${f1(gy(300) + 11)}" stroke="#6E665E" stroke-width=".6" stroke-dasharray="2 3"/>`;
          const P = (u, v) => `${f1(cx + (u * ex + v * nx) * k)} ${f1(y0 + (u * ey + v * ny) * k)}`, Q = (pts, f) => `<path d="M${pts.map((p) => P(p[0], p[1])).join(" L")} Z" fill="${f}"/>`;
          for (const u of [-20, 20]) { const [px, py] = P(u, 2.5).split(" "); s += `<circle cx="${px}" cy="${py}" r="${f1(2.8 * k)}" fill="#2A2A2A"/>`; }
          s += Q([[-30, 4], [30, 4], [30, 16], [-30, 16]], "#A8392E") + Q([[-33, 4], [33, 4], [33, 6.5], [-33, 6.5]], "#6A4A36") + Q([[-26, 16], [26, 16], [26, 30], [-26, 30]], "#EDE3CC");
          for (let j = 0; j < 6; j++) s += Q([[-22 + j * 8, 19], [-16 + j * 8, 19], [-16 + j * 8, 27], [-22 + j * 8, 27]], "#5E6E78");
          s += `<path d="M${P(-29, 16)} L${P(-29, 30)} M${P(29, 16)} L${P(29, 30)}" stroke="#6A4A36" stroke-width="1.2"/>`;
          s += Q([[-33, 30], [33, 30], [31, 34], [-31, 34]], "#5E4A3A") + Q([[-20, 34], [20, 34], [18, 37], [-18, 37]], "#A8392E");
          const [fx, fy] = P(31.5, 22).split(" "); s += `<circle cx="${fx}" cy="${fy}" r="2.2" fill="#3A3330"/>`; const [lx2, ly2] = P(31.5, 8).split(" "); s += `<path d="M${fx} ${f1(+fy + 2)} L${lx2} ${ly2}" stroke="#3E5568" stroke-width="2.2"/>`;
          const top = P(0, 37.5).split(" ");
          perch.push([+top[0], +top[1]], [hx, hy]);
          return { s, l, perch };
        } },
      { id: "alcatraz", zh: "惡魔島", see: ["海灣中間的小島上有一座舊監獄", "島上的燈塔白白細細的，站得很直", "以前關犯人的地方，現在大家搭船來參觀"], spots: ["燈塔的頂上", "監獄的屋頂"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const ax = btw(r, 150, 190), lx = ax + 38;
          s += hills(122, "#A3B2B6", r, 8) + water(128, "#9CC0CF", "#5C8AA0", r);
          s += `<path d="M${f1(ax - 88)} 152 Q${f1(ax - 80)} 136 ${f1(ax - 62)} 130 L${f1(ax - 40)} 120 L${f1(ax + 40)} 118 L${f1(ax + 58)} 128 Q${f1(ax + 80)} 134 ${f1(ax + 90)} 152 Z" fill="#8C7D68"/><ellipse cx="${f1(ax - 50)}" cy="134" rx="14" ry="4" fill="#7E9068"/><ellipse cx="${f1(ax + 62)}" cy="138" rx="12" ry="3" fill="#7E9068"/><path d="M${f1(ax - 70)} 142 L${f1(ax + 72)} 142" stroke="#76695A" stroke-width=".8"/>`;
          s += `<path d="M${f1(ax - 92)} 152 Q${f1(ax)} 157 ${f1(ax + 94)} 152" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" fill="none"/>`;
          s += `<rect x="${f1(ax - 66)}" y="124" width="22" height="10" fill="#D9CFBC"/><rect x="${f1(ax + 44)}" y="120" width="22" height="9" fill="#D9CFBC"/>`;
          s += `<path d="M${f1(ax - 56)} 124 L${f1(ax - 54)} 102 M${f1(ax - 46)} 124 L${f1(ax - 48)} 102" stroke="#6E6458" stroke-width="1"/><rect x="${f1(ax - 58)}" y="92" width="12" height="10" fill="#D9D2C2"/><path d="M${f1(ax - 59)} 92 L${f1(ax - 52)} 88 L${f1(ax - 45)} 92 Z" fill="#9A8E7E"/>`;
          s += `<rect x="${f1(ax - 36)}" y="102" width="66" height="18" fill="#E6DFCF"/><rect x="${f1(ax - 38)}" y="100" width="70" height="3" fill="#B9B0A0"/>`;
          for (let i = 0; i < 10; i++) s += `<rect x="${f1(ax - 32 + i * 6.4)}" y="107" width="2.4" height="7" fill="#5E5850"/>`;
          s += `<path d="M${f1(lx - 3.5)} 119 L${f1(lx - 2.5)} 82 L${f1(lx + 2.5)} 82 L${f1(lx + 3.5)} 119 Z" fill="#F1EEE6"/><rect x="${f1(lx - 4.5)}" y="80" width="9" height="2" fill="#3E3A36"/><rect x="${f1(lx - 2.5)}" y="73" width="5" height="7" fill="#E9DFAA"/><path d="M${f1(lx - 3.5)} 73 L${f1(lx)} 68 L${f1(lx + 3.5)} 73 Z" fill="#3E3A36"/>`;
          perch.push([lx, 68], [ax - 6, 100]);
          s += boat(btw(r, 20, 80), btw(r, 170, 186), 1.1, false);
          if (r() < .5) s += boat(btw(r, 230, 270), btw(r, 164, 182), .8, true);
          return { s, l, perch };
        } },
      { id: "fishermanswharf", zh: "漁人碼頭", see: ["碼頭的大招牌是一個船舵，中間有一隻螃蟹", "海獅擠在浮台上睡覺，還會大聲叫", "路邊攤的蛤蜊濃湯是裝在麵包碗裡的"], spots: ["船舵招牌的把手上", "碼頭的木樁上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const sx = btw(r, 190, 225), cy = 80, R = 26, hx = btw(r, 50, 70);
          s += `<path d="M0 141 L0 128 Q40 108 90 116 Q125 122 160 141 Z" fill="#9AA88E"/><rect x="${f1(hx - 3)}" y="97" width="6" height="18" fill="#E8E1D0"/><rect x="${f1(hx - 3.6)}" y="94" width="7.2" height="3" fill="#D6CEBC"/>`;
          s += water(140, "#9CC0CF", "#5C8AA0", r);
          const lion = (x, y) => { const col = pick(r, ["#5E4A3A", "#7A604A", "#6B5440"]), up = r() < .5; return `<ellipse cx="${f1(x)}" cy="${f1(y - .4)}" rx="8" ry="3.6" fill="${col}"/>` + (up ? `<path d="M${f1(x + 4)} ${f1(y - 1.5)} L${f1(x + 7)} ${f1(y - 5.5)}" stroke="${col}" stroke-width="3.6" stroke-linecap="round"/><circle cx="${f1(x + 7.6)}" cy="${f1(y - 6.4)}" r="2.3" fill="${col}"/><circle cx="${f1(x + 9.6)}" cy="${f1(y - 6)}" r="1.1" fill="${col}"/>` : `<circle cx="${f1(x + 8.4)}" cy="${f1(y - 1.4)}" r="2.4" fill="${col}"/>`) + `<path d="M${f1(x - 7)} ${f1(y)} l-3 1.6 M${f1(x - 7)} ${f1(y)} l-3 -1" stroke="${col}" stroke-width="1.2"/>`; };
          for (const [dx, dy, w] of [[8, 166, 110], [26, 186, 120]]) { s += `<rect x="${dx}" y="${dy}" width="${w}" height="5" fill="#8A7660"/>`; for (let x = dx + 8; x < dx + w - 8; x += btw(r, 14, 20)) s += lion(x, dy - 2); }
          s += `<rect x="140" y="146" width="160" height="8" fill="#8C6E52"/>`;
          for (let x = 146; x < 300; x += 14) s += `<rect x="${x}" y="154" width="3" height="14" fill="#5E4A3A"/>`;
          s += `<rect x="${f1(sx - 3)}" y="104" width="6" height="42" fill="#6A4A36"/>`;
          for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; s += `<path d="M${f1(sx)} ${cy} L${f1(sx + Math.cos(a) * (R + 7))} ${f1(cy + Math.sin(a) * (R + 7))}" stroke="#7A5236" stroke-width="2.4"/><circle cx="${f1(sx + Math.cos(a) * (R + 8))}" cy="${f1(cy + Math.sin(a) * (R + 8))}" r="2.4" fill="#7A5236"/>`; }
          s += `<circle cx="${f1(sx)}" cy="${cy}" r="${R}" fill="#EFE6D2" stroke="#7A5236" stroke-width="4"/><circle cx="${f1(sx)}" cy="${cy}" r="17" fill="none" stroke="#3E6A8E" stroke-width="7"/>`;
          for (const sg of [-1, 1]) s += `<path d="M${f1(sx + sg * 4)} ${cy + 1} l${sg * 6} 3 M${f1(sx + sg * 5)} ${cy - 1} l${sg * 6} 1 M${f1(sx + sg * 4)} ${cy + 3} l${sg * 5} 5 M${f1(sx + sg * 5)} ${cy - 3} l${sg * 2} -5" stroke="#C2402C" stroke-width="1.2"/><circle cx="${f1(sx + sg * 7.5)}" cy="${cy - 9}" r="2" fill="#C2402C"/>`;
          s += `<ellipse cx="${f1(sx)}" cy="${cy}" rx="6.5" ry="4.5" fill="#D2462E"/>`;
          perch.push([sx, cy - R - 10], [244, 146], [40, 164]);
          return { s, l, perch };
        } },
      { id: "paintedladies", zh: "彩繪淑女", see: ["一排彩色的老房子，屋頂都是尖尖的", "對面公園的草坡上，有人坐著看房子", "房子後面就看得到市中心的高樓"], spots: ["尖屋頂的最高點", "公園草坡上的一棵樹"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const tx = btw(r, 205, 245), x0 = btw(r, 40, 60), w = 26, cols = ["#E9C3C3", "#CFDDBF", "#F0DDB0", "#C3D4E3", "#E1CDE6", "#F2CFAE", "#BFE0D6"], off = Math.floor(r() * 7);
          for (let x = -4; x < 300;) { const bw = btw(r, 8, 16), h = x < 110 ? btw(r, 6, 20) : btw(r, 12, 40); s += `<rect x="${f1(x)}" y="${f1(112 - h)}" width="${f1(bw)}" height="${f1(h)}" fill="${pick(r, ["#B3BCC4", "#A6B0BA", "#BDC4CA"])}"/>`; x += bw + btw(r, 0, 3); }
          s += `<path d="M${f1(tx - 7)} 112 L${f1(tx)} 46 L${f1(tx + 7)} 112 Z" fill="#D9D6CE"/><path d="M${f1(tx - 4)} 84 h-3 v6 h3 M${f1(tx + 4)} 84 h3 v6 h-3" fill="#D9D6CE"/>`;
          s += `<rect x="0" y="110" width="300" height="50" fill="#9FAF8E"/>`;
          for (let i = 0; i < 7; i++) {
            const x = x0 + i * w, b = 150 + i * 2.5, col = cols[(i + off) % 7];
            s += `<rect x="${f1(x)}" y="${f1(b - 46)}" width="${w}" height="46" fill="${col}"/><path d="M${f1(x - 1)} ${f1(b - 46)} L${f1(x + w / 2)} ${f1(b - 66)} L${f1(x + w + 1)} ${f1(b - 46)} Z" fill="${col}"/><path d="M${f1(x - 1)} ${f1(b - 46)} L${f1(x + w / 2)} ${f1(b - 66)} L${f1(x + w + 1)} ${f1(b - 46)}" stroke="#6E6258" stroke-width="1.4" fill="none"/><path d="M${f1(x + 2)} ${f1(b - 47)} H${f1(x + w - 2)}" stroke="#F4EFE6" stroke-width="1"/><circle cx="${f1(x + w / 2)}" cy="${f1(b - 53)}" r="2.2" fill="#4E5A66"/>`;
            s += `<path d="M${f1(x + 2)} ${f1(b - 6)} V${f1(b - 34)} L${f1(x + 5)} ${f1(b - 37)} H${f1(x + 14)} L${f1(x + 17)} ${f1(b - 34)} V${f1(b - 6)} Z" fill="#F4EFE6" opacity=".55"/>`;
            let wd = ""; for (const yy of [b - 32, b - 18]) for (const xx of [4, 8.5, 13]) wd += `M${f1(x + xx)} ${f1(yy)} h3 v9 h-3 Z`; s += `<path d="${wd}" fill="#4E5A66"/>`;
            s += `<rect x="${f1(x + w - 7)}" y="${f1(b - 14)}" width="5" height="12" fill="#6E5A4A"/><rect x="${f1(x + w - 7)}" y="${f1(b - 40)}" width="4" height="8" fill="#4E5A66"/>`;
          }
          s += `<path d="M0 200 L0 160 Q150 150 300 168 L300 200 Z" fill="${{ spring: "#93B272", summer: "#86A866", autumn: "#9AA766", winter: "#8FAA6E" }[sea]}"/>`;
          let p2 = null;
          for (let i = 0; i < 3; i++) { const x = btw(r, 10, 290), y = btw(r, 182, 194), sc = btw(r, 1, 1.25); s += tree(x, y, sc, sea === "winter" ? "summer" : sea, r); if (!p2) p2 = [x, y - 30.5 * sc]; }
          for (let i = 0; i < 4; i++) { const x = btw(r, 60, 260), y = btw(r, 170, 186); s += `<circle cx="${f1(x)}" cy="${f1(y - 4)}" r="1.8" fill="#3A3330"/><rect x="${f1(x - 2)}" y="${f1(y - 2.4)}" width="4" height="4" fill="${pick(r, ["#C8302A", "#3E6A8E", "#E9B949"])}"/>`; }
          const j = Math.floor(r() * 7);
          perch.push([x0 + j * w + w / 2, 150 + j * 2.5 - 67], p2);
          return { s, l, perch };
        } },
      { id: "lombard", zh: "九曲花街", see: ["這條路彎來彎去，像一條紅色的緞帶", "車子一台一台慢慢轉彎往下開", "每個轉彎旁邊都有修剪整齊的花圃"], spots: ["花圃的矮樹叢上", "坡頂房子的屋簷"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const L = (y) => 115 + 35 * (192 - y) / 100, Rr = (y) => 285 - 35 * (192 - y) / 100, cols = ["#E9C3C3", "#CFDDBF", "#F0DDB0", "#C3D4E3", "#E1CDE6", "#F2CFAE", "#EDE6D6"];
          let top = null;
          for (let i = 0; i < 6; i++) { const x = 150 + i * 17, h = btw(r, 12, 18); s += `<rect x="${x}" y="${f1(92 - h)}" width="17" height="${f1(h)}" fill="${pick(r, cols)}"/><rect x="${x - .5}" y="${f1(90 - h)}" width="18" height="2.5" fill="#7E6B5C"/><rect x="${x + 4}" y="${f1(96 - h)}" width="3" height="4" fill="#4E5A66"/><rect x="${x + 10}" y="${f1(96 - h)}" width="3" height="4" fill="#4E5A66"/>`; if (i === 2) top = [x + 8.5, 90 - h]; }
          for (let i = 4; i >= 0; i--) {
            const y = 192 - i * 22, h = 34 - i * 4, w = 44 - i * 5;
            const lx = L(y) - 2 - w; s += `<rect x="${f1(lx)}" y="${f1(y - h)}" width="${w}" height="${h}" fill="${pick(r, cols)}"/><rect x="${f1(lx - 1)}" y="${f1(y - h - 2)}" width="${w + 2}" height="2.5" fill="#7E6B5C"/><rect x="${f1(lx + 4)}" y="${f1(y - h + 5)}" width="${f1(w * .2)}" height="${f1(h * .3)}" fill="#4E5A66"/><rect x="${f1(lx + w * .55)}" y="${f1(y - h + 5)}" width="${f1(w * .2)}" height="${f1(h * .3)}" fill="#4E5A66"/>`;
            const rx = Rr(y) + 2; s += `<rect x="${f1(rx)}" y="${f1(y - h)}" width="${f1(304 - rx)}" height="${h}" fill="${pick(r, cols)}"/><rect x="${f1(rx - 1)}" y="${f1(y - h - 2)}" width="${f1(305 - rx)}" height="2.5" fill="#7E6B5C"/><rect x="${f1(rx + 5)}" y="${f1(y - h + 5)}" width="${f1(w * .2)}" height="${f1(h * .3)}" fill="#4E5A66"/>`;
          }
          s += `<path d="M115 192 L150 92 L250 92 L285 192 Z" fill="#6E8E52"/>`;
          const pts = []; for (let i = 0; i <= 8; i++) { const y = 190 - i * 11.6; pts.push([i % 2 ? Rr(y) - 9 : L(y) + 9, y]); }
          s += `<path d="M${pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join(" L")}" stroke="#B4573E" stroke-width="6.5" stroke-linejoin="round" fill="none"/><path d="M${pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join(" L")}" stroke="#C9745A" stroke-width="1" stroke-dasharray="2 3" fill="none"/>`;
          const FL = ["#D46A8A", "#9A6BB0", "#E58E9E", "#F2C14E"];
          for (let i = 0; i < 7; i++) for (const t of [.15, .35, .55]) { const [xa, ya] = pts[i], [xb, yb] = pts[i + 1], yc = pts[i + 2][1], x = xa + (xb - xa) * t, y = (ya + (yb - ya) * t + yb + (yc - yb) * (1 - t)) / 2; s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="2" fill="${pick(r, FL)}"/><circle cx="${f1(x + 3)}" cy="${f1(y + .8)}" r="1.6" fill="${pick(r, FL)}"/>`; }
          const ci = 2 + Math.floor(r() * 3), [ca, cb] = [pts[ci], pts[ci + 1]], cxx = (ca[0] + cb[0]) / 2, cyy = (ca[1] + cb[1]) / 2;
          s += `<rect x="${f1(cxx - 6)}" y="${f1(cyy - 4)}" width="12" height="5" rx="1.5" fill="${pick(r, ["#3E6A8E", "#E9E1D0", "#5E6B78"])}"/><rect x="${f1(cxx - 3.5)}" y="${f1(cyy - 6.5)}" width="7" height="3" rx="1" fill="#9FB8C8"/>`;
          s += `<rect x="0" y="190" width="300" height="10" fill="#8A827A"/>`;
          perch.push(top, [pts[4][0], pts[4][1] - 6]);
          return { s, l, perch };
        } },
    ],
  },
  sydney: {
    zh: "雪梨", de: "Sydney", gift: "一隻無尾熊小玩偶",
    sights: [
      { id: "operahouse", zh: "雪梨歌劇院", see: ["白色的屋頂像一片片張開的帆", "走近一看，屋頂是一片片小瓷磚拼起來的", "歌劇院三面都是海，船從旁邊開過去"], spots: ["最高那片屋頂的尖端", "前面大台階的邊上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const ox = btw(r, 155, 180), k = btw(r, .95, 1.08);
          s += hills(128, "#9FB0A4", r, 6) + water(140, "#9CC7D2", "#4F8AA6", r);
          s += `<path d="M${f1(ox - 92 * k)} 147 L${f1(ox - 86 * k)} 136 L${f1(ox + 96 * k)} 136 L${f1(ox + 102 * k)} 147 Z" fill="#D8C6A6"/><path d="M${f1(ox - 89 * k)} 141 H${f1(ox + 99 * k)}" stroke="#C2AF8C" stroke-width=".8"/>`;
          let tip = null;
          const shell = (x, by, h) => { const w = h * .85, tx = x - w * .3, ty = by - h; return `<path d="M${f1(x - w * .5)} ${f1(by)} Q${f1(x - w * .58)} ${f1(by - h * .6)} ${f1(tx)} ${f1(ty)} Q${f1(x + w * .3)} ${f1(by - h * .78)} ${f1(x + w * .5)} ${f1(by)} Z" fill="#F5F2EA" stroke="#C8C0B0" stroke-width=".8"/><path d="M${f1(tx)} ${f1(ty)} Q${f1(x - w * .05)} ${f1(by - h * .45)} ${f1(x + w * .05)} ${f1(by)}" stroke="#DCD6CA" stroke-width=".7" fill="none"/>`; };
          s += `<rect x="${f1(ox - 80 * k)}" y="130" width="${f1(170 * k)}" height="6" fill="#7A6A58"/>`;
          for (const [u, h] of [[-80, 14], [-68, 20]]) s += shell(ox + u * k, 136, h * k);
          for (const [u, h] of [[-46, 26], [-24, 40], [2, 56], [32, 70]]) s += shell(ox + u * k, 136, h * k);
          for (const [u, h] of [[50, 24], [68, 36], [88, 48]]) s += shell(ox + u * k, 138, h * k);
          tip = [ox + 32 * k - 70 * k * .85 * .3, 136 - 70 * k - 1];
          perch.push(tip, [ox + 80 * k, 136]);
          if (r() < .6) s += boat(btw(r, 20, 120), btw(r, 172, 188), 1, r() < .5);
          return { s, l, perch };
        } },
      { id: "harbourbridge", zh: "雪梨港灣大橋", see: ["大鐵橋彎成一道拱，大家都叫它衣架", "有人穿著一樣的連身衣，一個接一個爬上拱頂", "橋的兩頭各站著兩座石頭塔"], spots: ["拱頂的旗桿旁", "石頭塔的頂上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const bx = btw(r, 150, 170), half = btw(r, 92, 100), D = 124, p1 = bx - half, p2 = bx + half, ST = "#6F7C82";
          const q = (t, a, cc, b) => (1 - t) * (1 - t) * a + 2 * t * (1 - t) * cc + t * t * b;
          const T = (t) => [q(t, p1 + 10, bx, p2 - 10), q(t, D - 2, -22, D - 2)], Bt = (t) => [q(t, p1 + 12, bx, p2 - 12), q(t, 140, -12, 140)];
          s += hills(136, "#8FA58C", r, 8) + water(146, "#9CC0CF", "#5C8AA0", r);
          s += `<path d="M${f1(p1 + 10)} ${D - 2} Q${f1(bx)} -22 ${f1(p2 - 10)} ${D - 2}" stroke="${ST}" stroke-width="3.2" fill="none"/><path d="M${f1(p1 + 12)} 140 Q${f1(bx)} -12 ${f1(p2 - 12)} 140" stroke="${ST}" stroke-width="2.6" fill="none"/>`;
          const N = 18;
          for (let i = 0; i <= N; i++) { const a = T(i / N), b = Bt(i / N); s += `<path d="M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])}" stroke="${ST}" stroke-width=".9"/>`; if (i < N) { const b2 = Bt((i + 1) / N); s += `<path d="M${f1(a[0])} ${f1(a[1])} L${f1(b2[0])} ${f1(b2[1])}" stroke="${ST}" stroke-width=".7"/>`; } if (b[1] < D - 2) s += `<path d="M${f1(b[0])} ${f1(b[1])} V${D}" stroke="${ST}" stroke-width=".6"/>`; }
          for (const p of [p1, p2]) s += `<rect x="${f1(p - 10)}" y="74" width="20" height="74" fill="#CBBB9C"/><rect x="${f1(p - 12)}" y="72" width="24" height="4" fill="#B7A788"/><path d="M${f1(p - 5)} ${D - 2} V106 Q${f1(p)} 100 ${f1(p + 5)} 106 V${D - 2} Z" fill="#8E806A" opacity=".7"/><path d="M${f1(p - 10)} 92 H${f1(p + 10)}" stroke="#B7A788" stroke-width="1"/>`;
          s += `<rect x="0" y="${D}" width="300" height="6" fill="#5F676B"/><path d="M0 ${D - 1} H300" stroke="#5F676B" stroke-width=".8"/><rect x="0" y="${D + 6}" width="${f1(p1 - 10)}" height="3" fill="#7A8286"/><rect x="${f1(p2 + 10)}" y="${D + 6}" width="${f1(290 - p2)}" height="3" fill="#7A8286"/>`;
          const ay = q(.5, D - 2, -22, D - 2);
          s += `<path d="M${f1(bx - 5)} ${f1(ay)} V${f1(ay - 10)} M${f1(bx + 5)} ${f1(ay)} V${f1(ay - 10)}" stroke="#4A4A4A" stroke-width=".7"/><rect x="${f1(bx - 5)}" y="${f1(ay - 10)}" width="6" height="4" fill="#2E3E6E"/><rect x="${f1(bx + 5)}" y="${f1(ay - 10)}" width="6" height="2" fill="#2A2A2A"/><rect x="${f1(bx + 5)}" y="${f1(ay - 8)}" width="6" height="2" fill="#B8402E"/><circle cx="${f1(bx + 8)}" cy="${f1(ay - 8)}" r=".9" fill="#E9C04A"/>`;
          for (let i = 0; i < 5; i++) { const p = T(.3 + i * .025); s += `<circle cx="${f1(p[0])}" cy="${f1(p[1] - 2.2)}" r="1" fill="#5E6E86"/>`; }
          perch.push([bx, ay - 1.5], [p2, 72]);
          if (r() < .5) s += boat(btw(r, 20, 220), btw(r, 172, 188), 1, false);
          return { s, l, perch };
        } },
      { id: "bondi", zh: "邦代海灘", see: ["浪一排一排打上來，衝浪的人趴在板子上等浪", "海邊的懸崖下有一座泳池，浪會直接打進去", "救生員插了紅黃兩色的旗子，要大家在中間游"], spots: ["救生旗的旗桿頂", "懸崖上那棟白房子的屋頂", "泳池邊上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          s += `<rect x="0" y="104" width="300" height="96" fill="#3E94B0"/><rect x="0" y="104" width="300" height="4" fill="#8CCBD8"/><path d="M0 122 Q22 104 56 110 L76 122 Z" fill="#8C8C72"/>`;
          s += `<path d="M0 166 Q100 150 195 176 L195 140 Q100 128 0 150 Z" fill="#5FB6C6" opacity=".55"/>`;
          for (let j = 0; j < 4; j++) s += `<path d="M0 ${158 - j * 10} Q100 ${144 - j * 10} 194 ${170 - j * 12}" stroke="#fff" stroke-opacity="${f1(.85 - j * .15)}" stroke-width="1.6" fill="none"/>`;
          for (let i = 0; i < 3; i++) { const x = btw(r, 50 + i * 40, 80 + i * 40), y = btw(r, 118, 134); s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="4.5" ry="1.1" fill="#F2EEE6"/><circle cx="${f1(x - 1)}" cy="${f1(y - 1.8)}" r="1.4" fill="#2E2A28"/>`; }
          s += `<path d="M0 200 L0 168 Q100 152 195 178 L195 200 Z" fill="#E9D7A6"/>`;
          const fx = btw(r, 50, 100);
          for (const x of [fx, fx + 34]) s += `<path d="M${f1(x)} 182 V164" stroke="#5A4A3A" stroke-width=".9"/><rect x="${f1(x + .5)}" y="164" width="8" height="2.6" fill="#C8402E"/><rect x="${f1(x + .5)}" y="166.6" width="8" height="2.6" fill="#E9C04A"/>`;
          for (let i = 0; i < 4; i++) { const x = btw(r, 15, 170), y = btw(r, 178, 194); s += `<rect x="${f1(x)}" y="${f1(y)}" width="7" height="3" fill="${pick(r, ["#D9533F", "#4D86B8", "#E9B949", "#5BA572"])}"/>`; }
          s += `<path d="M180 200 L186 168 L205 158 L222 140 L236 116 L300 110 L300 200 Z" fill="#8E7F6C"/><path d="M226 132 L300 128 M214 148 L300 146" stroke="#76695A" stroke-width=".8"/>`;
          s += `<rect x="238" y="92" width="62" height="24" fill="#F2EFE8"/><rect x="242" y="98" width="58" height="5" fill="#5E8FA8"/><rect x="236" y="90" width="64" height="3" fill="#D9D4C8"/><rect x="220" y="108" width="20" height="10" fill="#F2EFE8"/>`;
          s += `<rect x="196" y="158" width="96" height="22" fill="#EFEBE2"/><rect x="200" y="161" width="88" height="16" fill="#5CC0D3"/>`;
          for (let i = 1; i < 4; i++) s += `<path d="M202 ${161 + i * 4} H286" stroke="#fff" stroke-opacity=".8" stroke-width=".6"/>`;
          for (let i = 0; i < 5; i++) s += `<circle cx="${f1(btw(r, 190, 198))}" cy="${f1(158 + i * 5)}" r="${f1(btw(r, 2.5, 4.5))}" fill="#fff" opacity=".85"/>`;
          perch.push([fx, 164], [268, 90], [246, 158]);
          return { s, l, perch };
        } },
      { id: "threesisters", zh: "藍山三姊妹岩", see: ["三塊大石頭並排站著，像三個姊妹", "底下的山谷整片都是藍藍的樹林", "聽說那層藍色是尤加利樹散出來的油霧"], spots: ["最高那塊岩石的頂上", "觀景台的欄杆"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          let d = "M0 200 L0 110"; for (let x = 40; x <= 300; x += 40) d += ` L${x} ${f1(btw(r, 103, 111))}`;
          s += `<path d="${d} L300 200 Z" fill="#A7B9CC"/>`;
          d = "M0 200 L0 124"; for (let x = 50; x <= 300; x += 50) d += ` L${x} ${f1(btw(r, 118, 128))}`;
          s += `<path d="${d} L300 200 Z" fill="#86A0B8"/><path d="M0 200 L0 150 Q150 136 300 150 L300 200 Z" fill="#5F7F86"/>`;
          for (let i = 0; i < 40; i++) s += `<circle cx="${f1(btw(r, 0, 300))}" cy="${f1(btw(r, 150, 196))}" r="${f1(btw(r, 3, 5))}" fill="${pick(r, ["#57767C", "#6A8A8C", "#4F6E74"])}"/>`;
          s += `<rect x="0" y="100" width="300" height="60" fill="#BFD3E6" opacity=".25"/>`;
          const sx = btw(r, 150, 180), k = btw(r, .95, 1.05);
          s += `<path d="M100 172 Q140 150 ${f1(sx)} 154 L${f1(sx + 90)} 160 L${f1(sx + 90)} 200 L100 200 Z" fill="#4E6E5E"/>`;
          const tops = [];
          for (const [o, w, t0] of [[0, 30, 70], [30, 26, 82], [55, 22, 96]]) {
            const x = sx + o * k, top = 160 - (160 - t0) * k; tops.push([x, top]);
            const crag = [[-.5, 162], [-.46, top + 46], [-.4, top + 42], [-.38, top + 24], [-.3, top + 20], [-.26, top + 8], [-.14, top + 4], [-.08, top], [.1, top + 1], [.16, top + 6], [.28, top + 10], [.32, top + 22], [.4, top + 26], [.43, top + 44], [.47, top + 48], [.5, 162]];
            s += `<path d="M${crag.map(([u, v]) => `${f1(x + u * w)} ${f1(v)}`).join(" L")} Z" fill="#C48A57"/><path d="M${f1(x + .1 * w)} ${f1(top + 1)} L${f1(x + .16 * w)} ${f1(top + 6)} L${f1(x + .28 * w)} ${f1(top + 10)} L${f1(x + .32 * w)} ${f1(top + 22)} L${f1(x + .4 * w)} ${f1(top + 26)} L${f1(x + .43 * w)} ${f1(top + 44)} L${f1(x + .47 * w)} ${f1(top + 48)} L${f1(x + .5 * w)} 162 L${f1(x + .14 * w)} 162 L${f1(x + .12 * w)} ${f1(top + 20)} Z" fill="#A8744A" opacity=".6"/>`;
            for (let j = 1; j < 4; j++) s += `<path d="M${f1(x - w / 2 + j * w / 4)} ${f1(top + 8)} L${f1(x - w / 2 + j * w / 4 + btw(r, -1, 1))} 158" stroke="#9C6A40" stroke-width=".8"/>`;
            s += `<path d="M${f1(x - w * .44)} ${f1(top + 22)} H${f1(x + w * .44)} M${f1(x - w * .46)} ${f1(top + 40)} H${f1(x + w * .46)}" stroke="#A8744A" stroke-width=".7"/>`;
          }
          for (let i = 0; i < 14; i++) s += `<circle cx="${f1(sx - 20 + i * 7 + btw(r, -2, 2))}" cy="${f1(btw(r, 158, 166))}" r="${f1(btw(r, 3, 5))}" fill="${pick(r, ["#4E6E5E", "#5A7A66"])}"/>`;
          const gx = btw(r, 20, 50);
          s += `<path d="M${f1(gx)} 200 Q${f1(gx - 4)} 160 ${f1(gx + 6)} 124" stroke="#E3DED2" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M${f1(gx + 2)} 150 q10 -10 18 -14" stroke="#E3DED2" stroke-width="1.6" fill="none"/>`;
          for (const [dx, dy, rx] of [[6, -76, 12], [-6, -70, 9], [16, -66, 10], [22, -62, 7]]) s += `<ellipse cx="${f1(gx + dx)}" cy="${f1(200 + dy)}" rx="${rx}" ry="${f1(rx * .55)}" fill="${pick(r, ["#7E9A84", "#6E8C78"])}"/>`;
          s += `<path d="M190 186 L300 181 M190 192 L300 187" stroke="#6A5040" stroke-width="1.4"/>`;
          for (let x = 194; x < 300; x += 18) s += `<path d="M${x} 200 V${f1(186 - (x - 190) * 5 / 110)}" stroke="#6A5040" stroke-width="1.6"/>`;
          perch.push(tops[0], tops[1], [250, f1(186 - 60 * 5 / 110 - 1)]);
          return { s, l, perch: perch.map((p) => [+p[0], +p[1]]) };
        } },
      { id: "botanicgarden", zh: "皇家植物園", see: ["莫頓灣無花果樹好大，樹根像一片片牆", "草地的另一邊看得到歌劇院的白屋頂", "白色的大鳥在草地上走來走去找東西吃"], spots: ["大無花果樹的枝頭", "草地旁長椅的椅背"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          s += `<rect x="0" y="128" width="300" height="18" fill="#6FA6BE"/>`;
          for (let i = 0; i < 5; i++) s += `<path d="M${f1(btw(r, 0, 280))} ${f1(btw(r, 132, 142))} q4 -2 8 0 t8 0" stroke="#fff" stroke-opacity=".45" stroke-width=".9" fill="none"/>`;
          for (let x = 196; x < 300;) { const w = btw(r, 10, 18), h = btw(r, 30, 70); s += `<rect x="${f1(x)}" y="${f1(128 - h)}" width="${f1(w)}" height="${f1(h)}" fill="${pick(r, ["#A9B3BC", "#B9C0C6", "#97A3AE"])}"/>`; x += w + btw(r, 0, 2); }
          const ox = btw(r, 158, 175);
          s += `<rect x="${f1(ox - 26)}" y="128" width="54" height="4" fill="#D8C6A6"/>`;
          for (const [u, h] of [[-16, 10], [-4, 16], [10, 22], [22, 14]]) { const x = ox + u, w = h * .85; s += `<path d="M${f1(x - w * .5)} 128 Q${f1(x - w * .58)} ${f1(128 - h * .6)} ${f1(x - w * .3)} ${f1(128 - h)} Q${f1(x + w * .3)} ${f1(128 - h * .78)} ${f1(x + w * .5)} 128 Z" fill="#F5F2EA" stroke="#C8C0B0" stroke-width=".6"/>`; }
          s += `<path d="M0 200 L0 146 Q150 141 300 147 L300 200 Z" fill="#7FA25E"/><path d="M0 146 Q150 141 300 147" stroke="#CFC3A8" stroke-width="1.5" fill="none"/><path d="M0 188 Q150 166 300 180" stroke="#E3D7BA" stroke-width="6" fill="none"/>`;
          const fig = (x, y, k) => { let f = `<path d="M${f1(x - 11 * k)} ${f1(y)} L${f1(x - 4 * k)} ${f1(y - 28 * k)} L${f1(x + 4 * k)} ${f1(y - 28 * k)} L${f1(x + 11 * k)} ${f1(y)} Z" fill="#6E5A48"/><path d="M${f1(x - 6 * k)} ${f1(y - 4 * k)} l${f1(-12 * k)} ${f1(4 * k)} M${f1(x + 6 * k)} ${f1(y - 4 * k)} l${f1(12 * k)} ${f1(4 * k)} M${f1(x)} ${f1(y - 3 * k)} l${f1(-3 * k)} ${f1(3 * k)}" stroke="#6E5A48" stroke-width="${f1(2 * k)}"/><ellipse cx="${f1(x)}" cy="${f1(y - 30 * k)}" rx="${f1(50 * k)}" ry="${f1(10 * k)}" fill="#345A33"/>`; [[-30, -38, 26, 13], [0, -48, 30, 16], [30, -38, 24, 12], [-14, -32, 22, 10], [16, -32, 22, 10]].forEach(([dx, dy, a, b], i) => { f += `<ellipse cx="${f1(x + dx * k)}" cy="${f1(y + dy * k)}" rx="${f1(a * k)}" ry="${f1(b * k)}" fill="${i % 2 ? "#4D7A46" : "#3F6B3C"}"/>`; }); return f; };
          const fx = btw(r, 50, 78), fk = btw(r, 1.05, 1.15);
          s += fig(fx, 174, fk);
          if (r() < .6) s += fig(btw(r, 262, 285), 188, .75);
          const bx = btw(r, 180, 205);
          s += `<rect x="${f1(bx)}" y="168" width="18" height="2" fill="#6A4A36"/><rect x="${f1(bx)}" y="163" width="18" height="2" fill="#6A4A36"/><path d="M${f1(bx + 2)} 165 V174 M${f1(bx + 16)} 165 V174" stroke="#4A3A2E" stroke-width="1.2"/>`;
          const ix = btw(r, 115, 160);
          s += `<ellipse cx="${f1(ix)}" cy="178" rx="5" ry="3" fill="#F2EFE8"/><path d="M${f1(ix + 4)} 177 L${f1(ix + 7)} 172" stroke="#2A2A2A" stroke-width="1.3"/><path d="M${f1(ix + 7)} 172 q3 1 4 4" stroke="#2A2A2A" stroke-width=".8" fill="none"/><path d="M${f1(ix - 1)} 181 V185 M${f1(ix + 1)} 181 V185" stroke="#2A2A2A" stroke-width=".7"/>`;
          perch.push([fx, 174 - 64 * fk], [bx + 9, 163]);
          return { s, l, perch };
        } },
      { id: "circularquay", zh: "環形碼頭", see: ["綠色和黃色的渡輪一艘一艘靠岸", "碼頭邊有人吹著長長的迪吉里杜管", "渡輪一靠岸，船員就把粗繩子套上碼頭的柱子"], spots: ["渡輪的駕駛艙頂上", "碼頭的屋簷"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          for (let x = -4; x < 300;) { const w = btw(r, 12, 24), h = x < 120 ? btw(r, 20, 40) : btw(r, 30, 64); s += `<rect x="${f1(x)}" y="${f1(112 - h)}" width="${f1(w)}" height="${f1(h)}" fill="${pick(r, ["#A9B3BC", "#B9C0C6", "#97A3AE", "#C2BBAE"])}"/>`; x += w + btw(r, 0, 3); }
          s += `<rect x="0" y="108" width="300" height="9" fill="#7E877C"/>`;
          for (let x = 6; x < 300; x += 22) s += `<rect x="${x}" y="117" width="3" height="11" fill="#6E766C"/>`;
          s += `<rect x="0" y="128" width="300" height="6" fill="#CFC3A8"/>` + water(134, "#8FC0CF", "#3F7F9C", r);
          let wr = null;
          for (let j = 0; j < 4; j++) { const wx = 10 + j * 76 + btw(r, -4, 4); s += `<rect x="${f1(wx)}" y="120" width="46" height="14" fill="#D9CFB8"/><path d="M${f1(wx - 2)} 120 L${f1(wx + 6)} 114 L${f1(wx + 40)} 114 L${f1(wx + 48)} 120 Z" fill="#5E7E62"/><rect x="${f1(wx + 4)}" y="124" width="38" height="5" fill="#8C8270" opacity=".6"/><rect x="${f1(wx - 2)}" y="134" width="50" height="3" fill="#8C7A62"/>`; if (j === 1) wr = [wx + 23, 114]; }
          const fr = (x, y, k) => { let f = `<path d="M${f1(x)} ${f1(y - 6 * k)} L${f1(x + 64 * k)} ${f1(y - 6 * k)} L${f1(x + 58 * k)} ${f1(y + 3 * k)} L${f1(x + 6 * k)} ${f1(y + 3 * k)} Z" fill="#2F6B45"/><rect x="${f1(x + 2 * k)}" y="${f1(y - 8 * k)}" width="${f1(60 * k)}" height="${f1(2 * k)}" fill="#E3B93A"/><rect x="${f1(x + 6 * k)}" y="${f1(y - 17 * k)}" width="${f1(52 * k)}" height="${f1(9 * k)}" fill="#EFE6C8"/>`; for (let i = 0; i < 9; i++) f += `<rect x="${f1(x + (9 + i * 5.6) * k)}" y="${f1(y - 15 * k)}" width="${f1(3.6 * k)}" height="${f1(4 * k)}" fill="#3E4A55"/>`; f += `<rect x="${f1(x + 5 * k)}" y="${f1(y - 19 * k)}" width="${f1(54 * k)}" height="${f1(2 * k)}" fill="#2F6B45"/><rect x="${f1(x + 26 * k)}" y="${f1(y - 25 * k)}" width="${f1(12 * k)}" height="${f1(6 * k)}" fill="#EFE6C8"/><rect x="${f1(x + 27.5 * k)}" y="${f1(y - 23.5 * k)}" width="${f1(9 * k)}" height="${f1(2.4 * k)}" fill="#3E4A55"/><rect x="${f1(x + 25 * k)}" y="${f1(y - 26.6 * k)}" width="${f1(14 * k)}" height="${f1(1.6 * k)}" fill="#E3B93A"/>`; return f; };
          s += fr(btw(r, 4, 14), 147, .8);
          if (r() < .6) s += fr(btw(r, 232, 240), 149, .8);
          const fx = btw(r, 110, 160), fk = btw(r, 1.2, 1.4);
          s += `<path d="M${f1(fx - 30)} ${f1(178 + 2)} Q${f1(fx - 12)} 176 ${f1(fx)} ${f1(178 + 1)}" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" fill="none"/><path d="M${f1(fx - 40)} ${f1(184)} Q${f1(fx - 16)} 181 ${f1(fx + 2)} ${f1(182)}" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" fill="none"/>`;
          s += fr(fx, 178, fk);
          perch.push([fx + 32 * fk, 178 - 26.6 * fk], wr);
          return { s, l, perch };
        } },
    ],
  },
};
