var CITIES_PART = {
  firenze: {
    zh: "佛羅倫斯", de: "Firenze", gift: "一張大理石紋紙做的書籤",
    sights: [
      { id: "duomo", zh: "聖母百花大教堂", see: ["紅色的大圓頂比旁邊的屋子都大好多", "白色的稜線從圓頂一路畫到最上面", "教堂的牆是白的綠的還有粉紅的石頭"], spots: ["圓頂最上面的小燈籠頂上", "圓頂下面的屋簷上", "教堂長長的屋頂上"],
        draw(c) {
          const { r } = c, k = btw(r, .92, 1.06), cx = btw(r, 172, 192), b = 166; let s = hills(150, "#A9B48E", r, 8), l = ""; const perch = [];
          const y0 = b - 62 * k, yT = b - 112 * k, nx = cx - 128 * k;
          s += `<rect x="${f1(nx)}" y="${f1(b - 34 * k)}" width="${f1(76 * k)}" height="${f1(34 * k)}" fill="#EDE6D6"/><path d="M${f1(nx - 2)} ${f1(b - 34 * k)} L${f1(nx + 8 * k)} ${f1(b - 46 * k)} L${f1(nx + 76 * k)} ${f1(b - 46 * k)} L${f1(nx + 76 * k)} ${f1(b - 34 * k)} Z" fill="#B55A3C"/>`;
          for (let i = 0; i < 6; i++) s += `<rect x="${f1(nx + 4 * k + i * 12 * k)}" y="${f1(b - 30 * k)}" width="${f1(8 * k)}" height="${f1(22 * k)}" fill="none" stroke="#5E7F63" stroke-width="1"/><rect x="${f1(nx + 7 * k + i * 12 * k)}" y="${f1(b - 26 * k)}" width="${f1(2 * k)}" height="${f1(5 * k)}" fill="#D9A5A0"/>`;
          s += `<rect x="${f1(cx - 56 * k)}" y="${f1(b - 40 * k)}" width="${f1(112 * k)}" height="${f1(40 * k)}" fill="#EDE6D6"/><path d="M${f1(cx - 58 * k)} ${f1(b - 40 * k)} L${f1(cx - 50 * k)} ${f1(b - 46 * k)} L${f1(cx + 50 * k)} ${f1(b - 46 * k)} L${f1(cx + 58 * k)} ${f1(b - 40 * k)} Z" fill="#B55A3C"/>`;
          s += `<rect x="${f1(cx - 44 * k)}" y="${f1(y0)}" width="${f1(88 * k)}" height="${f1(16 * k)}" fill="#E9E1CF"/>`;
          for (let i = -1; i <= 1; i++) s += `<circle cx="${f1(cx + i * 26 * k)}" cy="${f1(y0 + 8 * k)}" r="${f1(3.6 * k)}" fill="#5E7F63"/>`;
          s += `<path d="M${f1(cx - 46 * k)} ${f1(y0)} Q${f1(cx - 44 * k)} ${f1(y0 - 38 * k)} ${f1(cx - 9 * k)} ${f1(yT)} L${f1(cx + 9 * k)} ${f1(yT)} Q${f1(cx + 44 * k)} ${f1(y0 - 38 * k)} ${f1(cx + 46 * k)} ${f1(y0)} Z" fill="#C0583A"/>`;
          for (const o of [-46, -27, -9, 9, 27, 46]) s += `<path d="M${f1(cx + o * k)} ${f1(y0)} Q${f1(cx + o * .9 * k)} ${f1(y0 - 32 * k)} ${f1(cx + o * .2 * k)} ${f1(yT + 1)}" stroke="#F3ECDD" stroke-width="${f1(1.7 * k)}" fill="none"/>`;
          s += `<rect x="${f1(cx - 47 * k)}" y="${f1(y0 - 2)}" width="${f1(94 * k)}" height="3" fill="#F3ECDD"/><rect x="${f1(cx - 6 * k)}" y="${f1(yT - 13 * k)}" width="${f1(12 * k)}" height="${f1(13 * k)}" fill="#F3ECDD"/><path d="M${f1(cx - 7 * k)} ${f1(yT - 13 * k)} L${f1(cx)} ${f1(yT - 24 * k)} L${f1(cx + 7 * k)} ${f1(yT - 13 * k)} Z" fill="#E2D8C2"/><circle cx="${f1(cx)}" cy="${f1(yT - 25 * k)}" r="${f1(2 * k)}" fill="#D6B44E"/>`;
          for (let i = -1; i <= 1; i++) s += `<rect x="${f1(cx - 1 + i * 3.5 * k)}" y="${f1(yT - 10 * k)}" width="2" height="${f1(7 * k)}" fill="#8A7E6C"/>`;
          perch.push([cx, yT - 27 * k], [cx - 52 * k, b - 46 * k], [nx + 40 * k, b - 46 * k]);
          s += houses(178, 11, r, ["#E3C9A0", "#E8D8B8", "#D9B88E", "#EAD2A8"], false).s.replace(/fill="#7E6B5C"|fill="#5E6B78"/g, 'fill="#B25A3E"');
          s += `<rect x="0" y="178" width="300" height="22" fill="#B9A78C"/>`;
          return { s, l, perch };
        } },
      { id: "pontevecchio", zh: "老橋", see: ["橋上蓋滿了一間一間的小房子", "很多小店的櫥窗裡都是亮晶晶的金飾", "有些小房子凸出橋外靠木架子撐著"], spots: ["橋上長長走廊的紅瓦屋頂上", "小店上面的屋簷邊"],
        draw(c) {
          const { r, sea } = c, x0 = btw(r, 18, 36), x1 = btw(r, 266, 284), w = x1 - x0, d = 138; let s = hills(132, "#A3B08C", r, 12), l = ""; const perch = [];
          for (let i = 0; i < 3; i++) s += tree(btw(r, 0, 300), btw(r, 146, 152), btw(r, .6, .8), sea, r);
          s += water(150, "#A9C3B8", "#6F947F", r);
          s += `<rect x="${f1(x0)}" y="${d}" width="${f1(w)}" height="26" fill="#C9A066"/><rect x="${f1(x0 - 2)}" y="${d - 1}" width="${f1(w + 4)}" height="4" fill="#B38A55"/>`;
          const a = w / 3;
          for (let i = 0; i < 3; i++) { const ax = x0 + i * a + 9; s += `<path d="M${f1(ax)} 164 Q${f1(ax + (a - 18) / 2)} 140 ${f1(ax + a - 18)} 164 Z" fill="#6F947F"/><path d="M${f1(ax + 4)} 166 h${f1(a - 26)}" stroke="#C9A066" stroke-opacity=".35" stroke-width="2"/>`; }
          const mid = x0 + w / 2, cols = ["#D9A55B", "#E3B774", "#C9823F", "#E8C68A", "#D69660", "#E6BC7E"];
          s += `<rect x="${f1(x0 + 4)}" y="114" width="${f1(w - 8)}" height="24" fill="#DDA867"/>`;
          let x = x0 + 4;
          while (x < x1 - 8) {
            const sw = Math.min(btw(r, 11, 18), x1 - 4 - x);
            if (x + sw > mid - 20 && x < mid + 20) { x = mid + 20; continue; }
            const col = pick(r, cols), hang = r() < .45;
            s += `<rect x="${f1(x)}" y="114" width="${f1(sw)}" height="24" fill="${col}"/><rect x="${f1(x + sw / 2 - 2)}" y="121" width="4" height="6" fill="#5C4634" opacity=".7"/>`;
            if (hang) s += `<rect x="${f1(x)}" y="${d + 2}" width="${f1(sw)}" height="9" fill="${col}"/><path d="M${f1(x + 2)} ${d + 11} l3 6 M${f1(x + sw - 2)} ${d + 11} l-3 6" stroke="#6A4A36" stroke-width="1.2"/>`;
            x += sw;
          }
          s += `<rect x="${f1(mid - 20)}" y="114" width="40" height="24" fill="#E2C48E"/>`;
          for (let i = 0; i < 3; i++) s += `<path d="M${f1(mid - 16 + i * 11.5)} 138 v-14 q4.5 -7 9 0 v14 Z" fill="#5C4634" opacity=".75"/>`;
          s += `<rect x="${f1(x0 + 4)}" y="103" width="${f1(w - 8)}" height="11" fill="#E9C98E"/><rect x="${f1(x0 + 2)}" y="100" width="${f1(w - 4)}" height="3.5" fill="#A9573B"/>`;
          for (let wx = x0 + 9; wx < x1 - 8; wx += 9) s += `<rect x="${f1(wx)}" y="106" width="3.4" height="4.5" fill="#5C4634" opacity=".7"/>`;
          perch.push([x0 + w * btw(r, .2, .35), 100], [x1 - w * btw(r, .15, .3), 100]);
          if (r() < .5) { const bx = btw(r, 40, 220); s += `<path d="M${f1(bx)} 184 h34 l-3 2.4 h-28 Z" fill="#EDE5D2"/><circle cx="${f1(bx + 17)}" cy="180.5" r="2.4" fill="#3E4A5A"/><path d="M${f1(bx + 4)} 189 L${f1(bx + 30)} 178" stroke="#6A4A36" stroke-width=".8"/>`; }
          return { s, l, perch };
        } },
      { id: "campanile", zh: "喬托鐘樓", see: ["方方的高塔像用彩色石頭拼起來的", "白色綠色粉紅色的大理石一格一格", "人們要爬四百多級樓梯才到得了頂"], spots: ["鐘樓頂端的平台邊上", "教堂側邊的屋頂上"],
        draw(c) {
          const { r } = c, k = btw(r, .94, 1.06), tx = btw(r, 178, 205), base = 172, H = 142 * k, W = 28 * k, top = base - H, L = tx - W / 2; let s = "", l = ""; const perch = [];
          s += `<rect x="0" y="168" width="300" height="32" fill="#CDBFA6"/>`;
          const cx0 = btw(r, 6, 22), cw = L - 14 - cx0;
          s += `<rect x="${f1(cx0)}" y="116" width="${f1(cw)}" height="54" fill="#EEE8DA"/><path d="M${f1(cx0 - 2)} 116 L${f1(cx0 + 6)} 104 L${f1(cx0 + cw)} 104 L${f1(cx0 + cw + 2)} 116 Z" fill="#B55A3C"/>`;
          for (let x = cx0 + 3; x < cx0 + cw - 10; x += 16) s += `<rect x="${f1(x)}" y="122" width="12" height="40" fill="none" stroke="#5E7F63" stroke-width="1.2"/><path d="M${f1(x + 3)} 160 v-24 l3 -5 l3 5 v24 Z" fill="#6A5E50" opacity=".55"/><circle cx="${f1(x + 6)}" cy="127" r="2" fill="#D9A5A0"/>`;
          s += `<rect x="${f1(L)}" y="${f1(top)}" width="${f1(W)}" height="${f1(H)}" fill="#F1ECE0"/><rect x="${f1(L)}" y="${f1(top)}" width="${f1(3 * k)}" height="${f1(H)}" fill="#6E8F72"/><rect x="${f1(L + W - 3 * k)}" y="${f1(top)}" width="${f1(3 * k)}" height="${f1(H)}" fill="#6E8F72"/>`;
          const at = (f) => base - f * H, win = (x, y, ww, hh) => `<path d="M${f1(x)} ${f1(y + hh)} V${f1(y + ww * .7)} L${f1(x + ww / 2)} ${f1(y)} L${f1(x + ww)} ${f1(y + ww * .7)} V${f1(y + hh)} Z" fill="#5A5048"/>`;
          for (const f of [.2, .36, .56, .78]) s += `<rect x="${f1(L)}" y="${f1(at(f))}" width="${f1(W)}" height="${f1(2.4 * k)}" fill="#6E8F72"/><rect x="${f1(L)}" y="${f1(at(f) + 2.4 * k)}" width="${f1(W)}" height="${f1(1.4 * k)}" fill="#D9A5A0"/>`;
          for (let i = 0; i < 3; i++) s += `<path d="M${f1(L + W * (.25 + i * .25))} ${f1(at(.1) - 3 * k)} l${f1(3 * k)} ${f1(3 * k)} l${f1(-3 * k)} ${f1(3 * k)} l${f1(-3 * k)} ${f1(-3 * k)} Z" fill="#D9A5A0"/>`;
          s += `<rect x="${f1(L + 5 * k)}" y="${f1(at(.34))}" width="${f1(W / 2 - 7 * k)}" height="${f1(.11 * H)}" fill="#E7C6BE"/><rect x="${f1(tx + 2 * k)}" y="${f1(at(.34))}" width="${f1(W / 2 - 7 * k)}" height="${f1(.11 * H)}" fill="#E7C6BE"/>`;
          s += win(L + 6 * k, at(.53), 5 * k, .13 * H) + win(tx + 1 * k, at(.53), 5 * k, .13 * H);
          s += win(L + 5 * k, at(.75), 7 * k, .16 * H) + win(tx + 1 * k, at(.75), 7 * k, .16 * H);
          s += win(L + 6 * k, at(.97), W - 12 * k, .16 * H);
          s += `<path d="M${f1(tx - 1)} ${f1(at(.97) + 6 * k)} v${f1(.15 * H)} M${f1(tx + 1)} ${f1(at(.97) + 6 * k)} v${f1(.15 * H)}" stroke="#F1ECE0" stroke-width=".8"/>`;
          s += `<rect x="${f1(L - 3 * k)}" y="${f1(top - 4 * k)}" width="${f1(W + 6 * k)}" height="${f1(5 * k)}" fill="#E2DACA"/>`;
          for (let i = 0; i < 6; i++) s += `<rect x="${f1(L - 2 * k + i * (W + 2 * k) / 5)}" y="${f1(top + 1 * k)}" width="${f1(1.6 * k)}" height="${f1(2.4 * k)}" fill="#B9AE98"/>`;
          perch.push([tx - 8 * k, top - 4 * k], [tx + 9 * k, top - 4 * k], [cx0 + cw * .45, 104]);
          for (let i = 0; i < 5; i++) { const px = btw(r, 20, 290), py = btw(r, 178, 192); s += `<rect x="${f1(px - 1.3)}" y="${f1(py - 7)}" width="2.6" height="7" fill="${pick(r, ["#4E5A6A", "#8A4A3A", "#6A6A5A"])}"/><circle cx="${f1(px)}" cy="${f1(py - 8.6)}" r="1.6" fill="#5A4636"/>`; }
          return { s, l, perch };
        } },
      { id: "signoria", zh: "領主廣場與舊宮", see: ["石頭宮殿上有一座細細高高的塔", "宮殿門口站著一尊白色的大衛像", "廣場邊的涼廊裡站滿了雕像"], spots: ["舊宮塔頂的鐘亭邊", "宮殿城垛的缺口上", "涼廊的屋頂上"],
        draw(c) {
          const { r } = c, px = btw(r, 128, 150), pw = 84, tx = px + 48; let s = "", l = ""; const perch = [];
          s += `<rect x="0" y="168" width="300" height="32" fill="#CDBFA6"/>`;
          for (let i = 0; i < 6; i++) s += `<path d="M0 ${176 + i * 4} H300" stroke="#B9A98C" stroke-width=".5"/>`;
          s += `<rect x="${f1(px)}" y="100" width="${pw}" height="72" fill="#B89C74"/><rect x="${f1(px - 3)}" y="92" width="${pw + 6}" height="10" fill="#A78A62"/>`;
          for (let x = px - 3; x < px + pw + 1; x += 7) s += `<rect x="${f1(x)}" y="86" width="4" height="6" fill="#A78A62"/><path d="M${f1(x + 1)} 102 q2.5 3 5 0" stroke="#7E6A4E" stroke-width=".7" fill="none"/>`;
          for (const y of [110, 132]) for (let i = 0; i < 5; i++) s += `<path d="M${f1(px + 9 + i * 16)} ${y + 12} v-8 q3 -5 6 0 v8 Z" fill="#5E4E3C"/>`;
          s += `<path d="M${f1(px + 36)} 172 v-14 q6 -6 12 0 v14 Z" fill="#5E4E3C"/>`;
          s += `<rect x="${f1(tx - 6)}" y="46" width="12" height="46" fill="#B89C74"/><circle cx="${f1(tx)}" cy="62" r="3.6" fill="#E9E2CF" stroke="#5E4E3C" stroke-width=".8"/><rect x="${f1(tx - 9)}" y="38" width="18" height="9" fill="#A78A62"/>`;
          for (let i = 0; i < 4; i++) s += `<path d="M${f1(tx - 9 + i * 4.8)} 38 v-4 l1.6 2 l1.6 -2 v4 Z" fill="#A78A62"/>`;
          s += `<rect x="${f1(tx - 5)}" y="24" width="10" height="11" fill="#B89C74"/><rect x="${f1(tx - 3)}" y="27" width="2" height="6" fill="#5E4E3C"/><rect x="${f1(tx + 1)}" y="27" width="2" height="6" fill="#5E4E3C"/><path d="M${f1(tx - 6)} 24 L${f1(tx)} 17 L${f1(tx + 6)} 24 Z" fill="#9A4E3C"/><path d="M${f1(tx)} 17 v-6" stroke="#5E4E3C" stroke-width="1"/>`;
          perch.push([tx - 6, 34], [px + 7, 86]);
          const lx = px + pw + 14;
          if (lx < 262) {
            s += `<rect x="${f1(lx)}" y="118" width="${f1(300 - lx)}" height="54" fill="#C8B08A"/><rect x="${f1(lx - 2)}" y="114" width="${f1(302 - lx)}" height="5" fill="#B39A72"/>`;
            for (let ax = lx + 5; ax + 20 < 304; ax += 26) s += `<path d="M${f1(ax)} 172 v-30 a10 10 0 0 1 20 0 v30 Z" fill="#6A5844"/><rect x="${f1(ax + 8)}" y="152" width="4" height="12" fill="#EEE9DD"/><circle cx="${f1(ax + 10)}" cy="150" r="2" fill="#EEE9DD"/>`;
            perch.push([lx + 14, 114]);
          }
          const dx = px + 28; s += `<rect x="${f1(dx - 3.5)}" y="162" width="7" height="10" fill="#D9CCB2"/><path d="M${f1(dx - 2.5)} 162 L${f1(dx - 1.5)} 150 L${f1(dx - 3)} 146 L${f1(dx + 3)} 146 L${f1(dx + 1.5)} 150 L${f1(dx + 2.5)} 162 Z" fill="#F2EEE4"/><circle cx="${f1(dx)}" cy="143.6" r="2.2" fill="#F2EEE4"/>`;
          const nx = px - btw(r, 34, 46); s += `<ellipse cx="${f1(nx)}" cy="170" rx="18" ry="4" fill="#9FB4B8"/><path d="M${f1(nx - 18)} 170 v-5 h36 v5" fill="#D9CCB2"/><rect x="${f1(nx - 4)}" y="156" width="8" height="10" fill="#D9CCB2"/><path d="M${f1(nx - 3)} 156 L${f1(nx - 2)} 136 L${f1(nx + 2)} 136 L${f1(nx + 3)} 156 Z" fill="#F2EEE4"/><circle cx="${f1(nx)}" cy="133" r="2.6" fill="#F2EEE4"/>`;
          return { s, l, perch };
        } },
      { id: "michelangelo", zh: "米開朗基羅廣場", see: ["整座城的紅屋頂都鋪在下面", "大圓頂在屋頂之間特別顯眼", "廣場上也有一尊青銅色的大衛像"], spots: ["廣場邊的石欄杆上", "青銅大衛像的頭上"],
        draw(c) {
          const { r, sea } = c, dx = btw(r, 182, 214); let s = hills(116, "#9DAE8F", r, 10), l = ""; const perch = [];
          s += `<rect x="0" y="122" width="300" height="28" fill="#DCC6A2"/>`;
          const roofs = [], rp = ["", "", "", ""], rc = ["#B8613F", "#C46E48", "#A9573B", "#CF8A5E"]; let wp = "";
          for (let i = 0; i < 40; i++) roofs.push([btw(r, -6, 296), btw(r, 122, 148), btw(r, 8, 16), Math.floor(r() * 4) % 4]);
          for (const [x, y, w, ci] of roofs) { wp += `M${f1(x)} ${f1(y)}h${f1(w)}v5h${f1(-w)}Z`; rp[ci] += `M${f1(x - 1)} ${f1(y)}L${f1(x + w / 2)} ${f1(y - 3)}L${f1(x + w + 1)} ${f1(y)}Z`; }
          s += `<path d="${wp}" fill="#EADBC2"/>` + rp.map((d, i) => d ? `<path d="${d}" fill="${rc[i]}"/>` : "").join("");
          const q = 1.35, X = (o) => f1(dx + o * q), Y = (y) => f1(130 - (130 - y) * q), vo = -btw(r, 62, 72);
          s += `<rect x="${X(-44)}" y="${Y(120)}" width="${f1(28 * q)}" height="${f1(10 * q)}" fill="#EEE8DA"/><path d="M${X(-45)} ${Y(120)} L${X(-42)} ${Y(116)} L${X(-16)} ${Y(116)} L${X(-16)} ${Y(120)} Z" fill="#B55A3C"/><rect x="${X(-17)}" y="${Y(118)}" width="${f1(34 * q)}" height="${f1(12 * q)}" fill="#EEE8DA"/><rect x="${X(-13)}" y="${Y(110)}" width="${f1(26 * q)}" height="${f1(8 * q)}" fill="#E6DECD"/>`;
          s += `<path d="M${X(-14)} ${Y(110)} Q${X(-13)} ${Y(97)} ${X(-3)} ${Y(93)} L${X(3)} ${Y(93)} Q${X(13)} ${Y(97)} ${X(14)} ${Y(110)} Z" fill="#C0583A"/><path d="M${X(-5)} ${Y(110)} Q${X(-4.5)} ${Y(100)} ${X(-1)} ${Y(94)} M${X(5)} ${Y(110)} Q${X(4.5)} ${Y(100)} ${X(1)} ${Y(94)}" stroke="#F3ECDD" stroke-width="1" fill="none"/><rect x="${X(-1.6)}" y="${Y(88)}" width="${f1(3.2 * q)}" height="${f1(5 * q)}" fill="#F3ECDD"/>`;
          s += `<rect x="${X(-28)}" y="${Y(92)}" width="${f1(6 * q)}" height="${f1(38 * q)}" fill="#EEE8DA"/><rect x="${X(-28)}" y="${Y(104)}" width="${f1(6 * q)}" height="1.4" fill="#6E8F72"/><rect x="${X(-28)}" y="${Y(114)}" width="${f1(6 * q)}" height="1.4" fill="#6E8F72"/><rect x="${X(-29)}" y="${Y(91)}" width="${f1(8 * q)}" height="2.4" fill="#E2DACA"/>`;
          s += `<rect x="${X(vo - 9)}" y="${Y(118)}" width="${f1(18 * q)}" height="${f1(12 * q)}" fill="#B89C74"/><rect x="${X(vo - 2)}" y="${Y(98)}" width="${f1(5 * q)}" height="${f1(20 * q)}" fill="#B89C74"/><rect x="${X(vo - 3.5)}" y="${Y(95)}" width="${f1(8 * q)}" height="${f1(4 * q)}" fill="#A78A62"/><path d="M${X(vo - 2)} ${Y(95)} L${X(vo + .5)} ${Y(90)} L${X(vo + 3)} ${Y(95)} Z" fill="#9A4E3C"/>`;
          s += `<rect x="0" y="148" width="300" height="13" fill="#86A595"/><path d="M0 149 H300" stroke="#B9D0C4" stroke-width="1.4"/>`;
          const bx = btw(r, 30, 80); s += `<rect x="${f1(bx)}" y="145" width="44" height="6" fill="#D3A867"/><rect x="${f1(bx + 2)}" y="140" width="40" height="5" fill="#E2B877"/>`;
          for (let i = 0; i < 3; i++) s += `<path d="M${f1(bx + 3 + i * 14)} 151 q5 -4 10 0 Z" fill="#86A595"/>`;
          const g = { spring: "#93AE72", summer: "#6F9455", autumn: "#A39A5E", winter: "#A7AE98" }[sea];
          s += `<path d="M0 160 Q150 152 300 160 L300 180 L0 180 Z" fill="${g}"/>`;
          for (let i = 0; i < 6; i++) s += tree(btw(r, 70, 300), btw(r, 172, 180), btw(r, .8, 1.1), sea, r);
          const vx2 = btw(r, 28, 56);
          s += `<rect x="${f1(vx2 - 10)}" y="138" width="20" height="42" fill="#D9CCB2"/><rect x="${f1(vx2 - 12)}" y="136" width="24" height="4" fill="#C9BCA2"/>`;
          s += `<path d="M${f1(vx2 - 4)} 136 L${f1(vx2 - 2.6)} 120 L${f1(vx2 - 5.5)} 109 Q${f1(vx2)} 105 ${f1(vx2 + 5.5)} 109 L${f1(vx2 + 3)} 120 L${f1(vx2 + 4.5)} 136 L${f1(vx2 + 1)} 136 L${f1(vx2)} 124 L${f1(vx2 - 1)} 136 Z" fill="#4E5E4C"/><circle cx="${f1(vx2)}" cy="102.5" r="3.6" fill="#4E5E4C"/><path d="M${f1(vx2 - 5)} 110 L${f1(vx2 - 6)} 102" stroke="#4E5E4C" stroke-width="2" stroke-linecap="round"/>`;
          s += `<rect x="0" y="178" width="300" height="3.5" fill="#E6DCC8"/>`;
          let bd = ""; for (let x = 3; x < 300; x += 7) bd += `M${x} 181.5h3.4l-.6 4l.6 5h-3.4l.6 -5Z`; s += `<path d="${bd}" fill="#E1D6BF"/>`;
          s += `<rect x="0" y="190" width="300" height="10" fill="#D6CAB2"/>`;
          perch.push([btw(r, 120, 280), 178], [vx2, 99], [dx, 130 - 42 * q]);
          return { s, l, perch };
        } },
      { id: "cipressi", zh: "托斯卡尼的柏樹", see: ["山丘一層又一層慢慢地起伏", "細細高高的柏樹沿著小路排成一列", "山頂上有一間石頭蓋的農舍"], spots: ["農舍的屋頂上", "農舍小塔的屋頂上", "柏樹的尖尖上"],
        draw(c) {
          const { r, sea } = c, hx = btw(r, 180, 225), hy = btw(r, 110, 118); let s = hills(108, "#A6B4A2", r, 12), l = ""; const perch = [];
          const F = { spring: ["#A9C27E", "#93B26C"], summer: ["#D9C27C", "#C8AE66"], autumn: ["#C8A56E", "#B48E5A"], winter: ["#B5B48F", "#A3A47E"] }[sea];
          s += `<path d="M0 150 Q70 128 140 146 L140 200 L0 200 Z" fill="${F[1]}"/>`;
          s += `<path d="M0 176 Q${f1(hx - 100)} ${f1(hy + 34)} ${f1(hx)} ${f1(hy)} Q${f1(hx + 60)} ${f1(hy - 4)} 300 ${f1(hy + 22)} L300 200 L0 200 Z" fill="${F[0]}"/>`;
          for (let i = 0; i < 6; i++) s += `<path d="M${f1(150 + i * 26)} 200 Q${f1(200 + i * 18)} ${f1(160 + i * 2)} ${f1(240 + i * 12)} ${f1(hy + 34 + i * 3)}" stroke="${F[1]}" stroke-width="1.1" fill="none"/>`;
          s += `<rect x="${f1(hx - 20)}" y="${f1(hy - 16)}" width="40" height="17" fill="#D8C3A0"/><path d="M${f1(hx - 23)} ${f1(hy - 16)} L${f1(hx - 14)} ${f1(hy - 24)} L${f1(hx + 14)} ${f1(hy - 24)} L${f1(hx + 23)} ${f1(hy - 16)} Z" fill="#B4603F"/>`;
          s += `<rect x="${f1(hx + 5)}" y="${f1(hy - 34)}" width="11" height="14" fill="#D2BC98"/><path d="M${f1(hx + 3)} ${f1(hy - 34)} L${f1(hx + 10.5)} ${f1(hy - 40)} L${f1(hx + 18)} ${f1(hy - 34)} Z" fill="#B4603F"/>`;
          for (let i = 0; i < 4; i++) s += `<rect x="${f1(hx - 16 + i * 9)}" y="${f1(hy - 11)}" width="3" height="4" fill="#5E4E3C"/>`;
          const P = (t) => { const a = [70, 200], b = [170, 178], cc = [60, 140], e = [hx - 22, hy + 1], u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * cc[0] + t * t * t * e[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * cc[1] + t * t * t * e[1]]; };
          s += `<path d="M70 200 C170 178 60 140 ${f1(hx - 22)} ${f1(hy + 1)}" stroke="#E6D8B8" stroke-width="3.4" fill="none"/>`;
          const cyp = (x, y, h) => `<path d="M${f1(x)} ${f1(y)} Q${f1(x - h * .17)} ${f1(y - h * .45)} ${f1(x)} ${f1(y - h)} Q${f1(x + h * .17)} ${f1(y - h * .45)} ${f1(x)} ${f1(y)} Z" fill="#3E5B3C"/><path d="M${f1(x)} ${f1(y)} Q${f1(x + h * .15)} ${f1(y - h * .45)} ${f1(x)} ${f1(y - h)} Z" fill="#2F4A30"/>`;
          let tall = null;
          for (let i = 11; i >= 1; i--) { const [x, y] = P(i / 12), h = 9 + (y - hy) * .38; for (const side of [-1, 1]) { const xx = x + side * (3 + h * .12); s += cyp(xx, y, h); if (i === 9 && side === 1) tall = [xx, y - h]; } }
          for (let i = 0; i < 2; i++) s += tree(btw(r, 230, 290), btw(r, 176, 192), btw(r, .9, 1.2), sea, r);
          perch.push([hx - 6, hy - 24], [hx + 10.5, hy - 40], tall);
          return { s, l, perch };
        } },
    ],
  },
  muenchen: {
    zh: "慕尼黑", de: "München", gift: "一個大大的鹹蝴蝶餅",
    sights: [
      { id: "rathaus", zh: "新市政廳", see: ["灰色的大樓上有好多尖尖的小塔", "鐘樓上的小人偶會跟著音樂轉圈跳舞", "廣場中間的柱子上站著金色的聖母"], spots: ["鐘樓的尖頂上", "市政廳的小尖塔上", "金色聖母像的頭上"],
        draw(c) {
          const { r } = c, x0 = btw(r, 96, 112), cx = btw(r, 178, 198); let s = "", l = ""; const perch = [];
          s += `<rect x="0" y="168" width="300" height="32" fill="#C9BFAE"/>`;
          s += `<rect x="${f1(x0)}" y="108" width="${f1(304 - x0)}" height="62" fill="#8F8576"/>`;
          for (let x = x0; x < 300; x += 18) s += `<path d="M${f1(x)} 108 L${f1(x + 9)} 92 L${f1(x + 18)} 108 Z" fill="#7E7466"/><path d="M${f1(x + 9)} 92 v-6 M${f1(x)} 108 v-8" stroke="#7E7466" stroke-width="1.2"/>`;
          let wd = ""; for (const y of [116, 132, 148]) for (let x = x0 + 4; x < 298; x += 9) wd += `M${f1(x)} ${y + 9}v-6l2 -3l2 3v6Z`; s += `<path d="${wd}" fill="#4F473F"/>`;
          let ad = ""; for (let x = x0 + 2; x < 296; x += 12) ad += `M${f1(x)} 170v-6a5 5 0 0 1 10 0v6Z`; s += `<path d="${ad}" fill="#5E554A"/>`;
          s += `<rect x="${f1(cx - 11)}" y="56" width="22" height="114" fill="#8A8072"/>`;
          for (let i = 0; i < 3; i++) s += `<path d="M${f1(cx - 3)} ${132 - i * 14} v-8 l3 -4 l3 4 v8 Z" fill="#4F473F"/>`;
          s += `<rect x="${f1(cx - 14)}" y="80" width="28" height="18" fill="#9A8E7C"/><rect x="${f1(cx - 14)}" y="78" width="28" height="2.5" fill="#6E665A"/>`;
          for (let i = 0; i < 5; i++) s += `<circle cx="${f1(cx - 10 + i * 5)}" cy="86" r="1.6" fill="${["#C0493A", "#3D6AA0", "#D6B04E", "#3D6AA0", "#C0493A"][i]}"/><circle cx="${f1(cx - 10 + i * 5)}" cy="93" r="1.6" fill="${["#D6B04E", "#C0493A", "#E9E2CF", "#C0493A", "#D6B04E"][i]}"/>`;
          s += `<circle cx="${f1(cx)}" cy="68" r="4.5" fill="#E9E2CF" stroke="#4F473F" stroke-width=".8"/>`;
          s += `<rect x="${f1(cx - 14)}" y="54" width="28" height="3" fill="#6E665A"/><path d="M${f1(cx - 13)} 54 v-12 M${f1(cx + 13)} 54 v-12" stroke="#7E7466" stroke-width="2.4"/><path d="M${f1(cx - 14.5)} 42 l1.5 -6 l1.5 6 Z M${f1(cx + 11.5)} 42 l1.5 -6 l1.5 6 Z" fill="#7E7466"/>`;
          s += `<rect x="${f1(cx - 6)}" y="40" width="12" height="14" fill="#8A8072"/><rect x="${f1(cx - 2)}" y="43" width="4" height="8" fill="#4F473F"/><path d="M${f1(cx - 7)} 40 L${f1(cx)} 26 L${f1(cx + 7)} 40 Z" fill="#5D6B66"/><path d="M${f1(cx)} 26 v-3" stroke="#D6B04E" stroke-width="1.4"/>`;
          const mx = btw(r, 50, 74);
          s += `<rect x="${f1(mx - 8)}" y="154" width="16" height="16" fill="#B9AE98"/><rect x="${f1(mx - 10)}" y="150" width="20" height="4" fill="#A89D86"/><rect x="${f1(mx - 2.5)}" y="102" width="5" height="48" fill="#B87F6B"/><rect x="${f1(mx - 4)}" y="99" width="8" height="3.4" fill="#A89D86"/>`;
          s += `<path d="M${f1(mx - 3)} 99 L${f1(mx - 1.6)} 90 L${f1(mx + 1.6)} 90 L${f1(mx + 3)} 99 Z" fill="#D6B04E"/><circle cx="${f1(mx)}" cy="88" r="2" fill="#D6B04E"/><path d="M${f1(mx - 3)} 86 q3 -2.5 6 0" stroke="#D6B04E" stroke-width=".8" fill="none"/>`;
          perch.push([cx, 23], [x0 + 27, 86], [mx, 85]);
          for (let i = 0; i < 5; i++) { const px = btw(r, 10, 290), py = btw(r, 178, 194); s += `<rect x="${f1(px - 1.3)}" y="${f1(py - 7)}" width="2.6" height="7" fill="${pick(r, ["#4E5A6A", "#8A4A3A", "#3D6AA0"])}"/><circle cx="${f1(px)}" cy="${f1(py - 8.6)}" r="1.6" fill="#5A4636"/>`; }
          return { s, l, perch };
        } },
      { id: "frauenkirche", zh: "聖母教堂", see: ["兩座紅磚高塔戴著綠色的圓帽子", "教堂的紅瓦屋頂又大又陡像一座小山", "門口地上有個傳說是魔鬼留下的腳印"], spots: ["綠色圓頂的尖尖上", "教堂長長的屋脊上"],
        draw(c) {
          const { r, sea } = c, cx = btw(r, 150, 160), br = "#A65A42", dk = "#8E4A36"; let s = "", l = ""; const perch = [];
          s += `<rect x="${f1(cx + 34)}" y="118" width="100" height="54" fill="${br}"/><path d="M${f1(cx + 32)} 118 L${f1(cx + 40)} 74 L${f1(cx + 128)} 74 L${f1(cx + 136)} 118 Z" fill="#8A4636"/>`;
          for (let i = 0; i < 4; i++) s += `<path d="M${f1(cx + 32)} ${f1(118 - i * 11)} H${f1(cx + 136 - i * 2)}" stroke="#7A3C2E" stroke-width=".6"/>`;
          for (let x = cx + 42; x < cx + 128; x += 14) s += `<path d="M${f1(x)} 166 v-34 l3 -5 l3 5 v34 Z" fill="#5C3A30"/><rect x="${f1(x + 9)}" y="120" width="3" height="52" fill="${dk}"/>`;
          if (sea === "winter") s += `<path d="M${f1(cx + 40)} 74 L${f1(cx + 128)} 74 L${f1(cx + 130)} 82 L${f1(cx + 38)} 82 Z" fill="#F2F0EA"/>`;
          s += `<rect x="${f1(cx - 6)}" y="104" width="12" height="68" fill="${br}"/><path d="M${f1(cx - 6)} 104 L${f1(cx)} 96 L${f1(cx + 6)} 104 Z" fill="${br}"/><path d="M${f1(cx - 4)} 172 v-16 l4 -6 l4 6 v16 Z" fill="#5C3A30"/>`;
          for (const tx of [cx - 20, cx + 20]) {
            s += `<rect x="${f1(tx - 14)}" y="100" width="28" height="72" fill="${br}"/><rect x="${f1(tx - 12)}" y="62" width="24" height="38" fill="${br}"/><rect x="${f1(tx - 14)}" y="98" width="28" height="2.4" fill="${dk}"/><path d="M${f1(tx - 4)} 62 V100 M${f1(tx + 4)} 62 V100" stroke="${dk}" stroke-width=".8"/>`;
            for (let i = 0; i < 3; i++) s += `<path d="M${f1(tx - 1.5)} ${158 - i * 20} v-10 l1.5 -3 l1.5 3 v10 Z" fill="#5C3A30"/>`;
            s += `<path d="M${f1(tx - 2)} 92 v-16 l2 -4 l2 4 v16 Z" fill="#5C3A30"/>`;
            s += `<path d="M${f1(tx - 12)} 62 C${f1(tx - 16)} 50 ${f1(tx - 10)} 40 ${f1(tx - 2)} 38 L${f1(tx + 2)} 38 C${f1(tx + 10)} 40 ${f1(tx + 16)} 50 ${f1(tx + 12)} 62 Z" fill="#6E9A80"/><path d="M${f1(tx - 4)} 60 C${f1(tx - 6)} 50 ${f1(tx - 3)} 42 ${f1(tx - 1)} 39" stroke="#9CC2AA" stroke-width="1.2" fill="none"/>`;
            s += `<rect x="${f1(tx - 2)}" y="30" width="4" height="8" fill="#5E8A70"/><circle cx="${f1(tx)}" cy="29" r="2.6" fill="#6E9A80"/><path d="M${f1(tx)} 27 v-5" stroke="#D6B04E" stroke-width="1"/>`;
            perch.push([tx, 21]);
          }
          perch.push([cx + 84, 74]);
          s += houses(178, 4, r, ["#E8DCC2", "#E2C9A3", "#D9D2C2", "#EBD6B4"], false).s;
          s += `<rect x="0" y="176" width="300" height="24" fill="#C9BFAE"/>`;
          if (r() < .6) s += tree(btw(r, 270, 292), 178, 1, sea, r);
          return { s, l, perch };
        } },
      { id: "nymphenburg", zh: "寧芬堡宮", see: ["宮殿的左右兩邊長長地延伸出去", "長長的水道一直通到宮殿門前", "白色的天鵝在水面上慢慢地游"], spots: ["宮殿中間的屋頂上", "宮殿旁邊小樓的屋頂上"],
        draw(c) {
          const { r, sea } = c, cx = btw(r, 146, 166), wall = "#EDE5D4", roof = "#7E8C96"; let s = hills(136, "#9DB08A", r, 6), l = ""; const perch = [];
          const block = (x, y, w) => { let b = `<rect x="${f1(x)}" y="${y}" width="${f1(w)}" height="${142 - y}" fill="${wall}"/><path d="M${f1(x - 1)} ${y} L${f1(x + 3)} ${y - 6} L${f1(x + w - 3)} ${y - 6} L${f1(x + w + 1)} ${y} Z" fill="${roof}"/>`; for (let wx = x + 3; wx < x + w - 4; wx += 7) b += `<rect x="${f1(wx)}" y="${y + 5}" width="3" height="5" fill="#6E7C88"/>`; return b; };
          s += block(-6, 122, cx - 104) + block(cx + 110, 122, 200 - cx);
          s += block(cx - 110, 112, 22) + block(cx + 88, 112, 22) + block(cx - 88, 120, 58) + block(cx + 30, 120, 58);
          s += `<rect x="${f1(cx - 30)}" y="86" width="60" height="56" fill="${wall}"/><path d="M${f1(cx - 32)} 86 L${f1(cx - 26)} 74 L${f1(cx + 26)} 74 L${f1(cx + 32)} 86 Z" fill="${roof}"/><rect x="${f1(cx - 32)}" y="85" width="64" height="2.4" fill="#D8CDB6"/>`;
          for (let i = 0; i < 3; i++) s += `<path d="M${f1(cx - 17 + i * 12)} 120 v-20 a5 5 0 0 1 10 0 v20 Z" fill="#7C8C98"/>`;
          for (let i = 0; i < 6; i++) s += `<rect x="${f1(cx - 26 + i * 9.6)}" y="126" width="4" height="7" fill="#7C8C98"/>`;
          s += `<rect x="${f1(cx - 30)}" y="88" width="3" height="54" fill="#E0D6C0"/><rect x="${f1(cx + 27)}" y="88" width="3" height="54" fill="#E0D6C0"/>`;
          const G = { spring: "#9DBB7A", summer: "#7FA35E", autumn: "#A9A266", winter: "#C9CEC4" }[sea];
          s += `<rect x="0" y="142" width="300" height="58" fill="${G}"/><path d="M${f1(cx - 9)} 144 L${f1(cx + 9)} 144 L${f1(cx + 62)} 200 L${f1(cx - 62)} 200 Z" fill="#7FA6B8"/><path d="M${f1(cx - 9)} 144 L${f1(cx + 9)} 144 L${f1(cx + 11)} 147 L${f1(cx - 11)} 147 Z" fill="#B3CFDA"/>`;
          s += `<path d="M${f1(cx - 9)} 144 L${f1(cx - 62)} 200 M${f1(cx + 9)} 144 L${f1(cx + 62)} 200" stroke="#D9D2C0" stroke-width="1.6"/>`;
          if (sea === "spring" || sea === "summer") s += `<path d="M${f1(cx)} 162 Q${f1(cx - 1)} 150 ${f1(cx)} 140 Q${f1(cx + 1)} 150 ${f1(cx)} 162" stroke="#F4FAFC" stroke-width="1.6" fill="none"/><ellipse cx="${f1(cx)}" cy="162" rx="5" ry="1.4" fill="#E4F0F4"/>`;
          for (let i = 0; i < 4; i++) { const tx = i < 2 ? btw(r, 8, cx - 80) : btw(r, cx + 80, 292); s += tree(tx, btw(r, 156, 168), btw(r, .7, .95), sea, r); }
          const sw = (x, y, k) => `<path d="M${f1(x)} ${f1(y)} q${f1(6 * k)} ${f1(3.5 * k)} ${f1(13 * k)} 0 q${f1(-3 * k)} ${f1(-5 * k)} ${f1(-9 * k)} ${f1(-3 * k)} Z" fill="#FBFAF6"/><path d="M${f1(x + 10 * k)} ${f1(y - 1 * k)} q${f1(2.5 * k)} ${f1(-7 * k)} ${f1(-1 * k)} ${f1(-9 * k)}" stroke="#FBFAF6" stroke-width="${f1(1.6 * k)}" fill="none"/><circle cx="${f1(x + 8.4 * k)}" cy="${f1(y - 10 * k)}" r="${f1(1 * k)}" fill="#E08A3A"/>`;
          const s1x = cx - btw(r, 24, 30), s1y = btw(r, 182, 190); s += sw(s1x, s1y, 1.1) + sw(cx + btw(r, 8, 18), btw(r, 172, 178), .85);
          perch.push([cx, 74], [cx - 99, 106]);
          return { s, l, perch };
        } },
      { id: "neuschwanstein", zh: "新天鵝堡", see: ["白色的城堡蓋在高高的山崖上", "城堡有好多細細尖尖的高塔", "四周是一大片深綠色的森林"], spots: ["最高那座塔的尖頂上", "城堡山牆的尖角上", "小圓塔的尖帽上"],
        draw(c) {
          const { r, sea } = c, cx = btw(r, 178, 200), wh = "#F2EFE7", rf = "#56677D"; let s = "", l = ""; const perch = [];
          s += `<path d="M0 150 L36 118 L64 132 L104 96 L130 70 L152 92 L176 78 L214 110 L248 84 L272 98 L300 88 L300 160 L0 160 Z" fill="#9AA8B8"/>`;
          const cap = sea === "winter" ? 1.7 : sea === "summer" ? .7 : 1.1;
          s += `<path d="M${f1(130 - 12 * cap)} ${f1(70 + 14 * cap)} L130 70 L${f1(130 + 10 * cap)} ${f1(70 + 10 * cap)} L${f1(130 + 2 * cap)} ${f1(70 + 13 * cap)} Z M${f1(248 - 10 * cap)} ${f1(84 + 9 * cap)} L248 84 L${f1(248 + 8 * cap)} ${f1(84 + 5 * cap)} Z M${f1(104 - 9 * cap)} ${f1(96 + 8 * cap)} L104 96 L${f1(104 + 9 * cap)} ${f1(96 + 9 * cap)} Z" fill="#F4F6F8"/>`;
          s += hills(150, sea === "winter" ? "#7E9086" : "#4E6B4E", r, 12);
          const k = btw(r, 1.12, 1.2), X = (o) => f1(cx + o * k), Y = (y) => f1(140 - (125 - y) * k), K = (v) => f1(v * k);
          s += `<path d="M${f1(cx - 80)} 200 L${f1(cx - 58)} 164 L${f1(cx - 46)} 148 L${X(-24)} 140 L${X(32)} 139 L${f1(cx + 56)} 148 L${f1(cx + 68)} 166 L${f1(cx + 88)} 200 Z" fill="#8C8679"/><path d="M${f1(cx - 46)} 148 L${f1(cx - 32)} 172 L${f1(cx - 38)} 200 M${f1(cx + 56)} 148 L${f1(cx + 44)} 180" stroke="#77715F" stroke-width="1.2" fill="none"/>`;
          s += `<rect x="${X(-40)}" y="${Y(110)}" width="${K(86)}" height="${K(15)}" fill="#E6E1D6"/>`;
          s += `<rect x="${X(-38)}" y="${Y(84)}" width="${K(22)}" height="${K(28)}" fill="${wh}"/><path d="M${X(-39)} ${Y(84)} L${X(-27)} ${Y(72)} L${X(-15)} ${Y(84)} Z" fill="${rf}"/>`;
          s += `<rect x="${X(-14)}" y="${Y(52)}" width="${K(10)}" height="${K(60)}" fill="${wh}"/><path d="M${X(-15.5)} ${Y(52)} L${X(-9)} ${Y(30)} L${X(-2.5)} ${Y(52)} Z" fill="${rf}"/>`;
          s += `<rect x="${X(2)}" y="${Y(62)}" width="${K(26)}" height="${K(50)}" fill="${wh}"/><path d="M${X(1)} ${Y(62)} L${X(15)} ${Y(46)} L${X(29)} ${Y(62)} Z" fill="${rf}"/>`;
          s += `<rect x="${X(26)}" y="${Y(58)}" width="${K(6)}" height="${K(22)}" fill="${wh}"/><path d="M${X(25)} ${Y(58)} L${X(29)} ${Y(45)} L${X(33)} ${Y(58)} Z" fill="${rf}"/>`;
          s += `<rect x="${X(32)}" y="${Y(94)}" width="${K(16)}" height="${K(18)}" fill="#D9C2A8"/>`;
          for (let i = 0; i < 3; i++) s += `<rect x="${X(32 + i * 6)}" y="${Y(90)}" width="${K(4)}" height="${K(4)}" fill="#D9C2A8"/>`;
          let wd = ""; for (const y of [70, 82, 96]) for (let i = 0; i < 4; i++) wd += `M${X(5 + i * 6)} ${Y(y + 6)}v${K(-4)}q${K(1.4)} ${K(-2)} ${K(2.8)} 0v${K(4)}Z`;
          for (let i = 0; i < 3; i++) wd += `M${X(-35 + i * 6)} ${Y(92)}h${K(2.6)}v${K(4)}h${K(-2.6)}Z M${X(-10)} ${Y(62 + i * 14)}h${K(2)}v${K(4)}h${K(-2)}Z`;
          s += `<path d="${wd}" fill="#6E7280"/>`;
          const fir = (x, y, h) => `<path d="M${f1(x)} ${f1(y - h)} L${f1(x - h * .36)} ${f1(y)} L${f1(x + h * .36)} ${f1(y)} Z" fill="#3F5C42"/>` + (sea === "winter" ? `<path d="M${f1(x)} ${f1(y - h)} L${f1(x - h * .15)} ${f1(y - h * .58)} L${f1(x + h * .15)} ${f1(y - h * .58)} Z" fill="#F4F6F8"/>` : "");
          for (let i = 0; i < 16; i++) { const x = btw(r, 0, 300); if (Math.abs(x - cx) < 74) continue; s += fir(x, btw(r, 156, 196), btw(r, 12, 22)); }
          for (let i = 0; i < 2; i++) s += tree(btw(r, 4, 80), btw(r, 186, 196), btw(r, .9, 1.1), sea, r);
          perch.push([cx - 9 * k, 140 - 97 * k], [cx + 15 * k, 140 - 81 * k], [cx + 29 * k, 140 - 82 * k]);
          return { s, l, perch };
        } },
      { id: "olympiapark", zh: "奧林匹克公園", see: ["透明的屋頂像一張網撐在半空中", "細細高高的電視塔上有一圈觀景台", "長長的草坡下面有一座安靜的湖"], spots: ["電視塔的觀景台上", "撐著屋頂的鋼柱頂上"],
        draw(c) {
          const { r, sea } = c, ox = btw(r, 226, 252); let s = "", l = ""; const perch = [];
          const G = { spring: "#9DBB7A", summer: "#7FA35E", autumn: "#A9A266", winter: "#CDD2C8" }[sea];
          s += `<path d="M0 132 Q36 104 84 128 Q120 140 300 146 L300 170 L0 170 Z" fill="${G}"/>`;
          s += `<path d="M${f1(ox - 3.6)} 160 L${f1(ox - 2.4)} 62 L${f1(ox + 2.4)} 62 L${f1(ox + 3.6)} 160 Z" fill="#C9CCCF"/><rect x="${f1(ox - 12)}" y="54" width="24" height="9" rx="2" fill="#B9BDC2"/><rect x="${f1(ox - 10)}" y="48" width="20" height="6" rx="1.5" fill="#C9CCCF"/><path d="M${f1(ox - 12)} 58.5 H${f1(ox + 12)}" stroke="#6E7A86" stroke-width="1.4"/>`;
          s += `<rect x="${f1(ox - 1.4)}" y="32" width="2.8" height="16" fill="#C9CCCF"/>`;
          for (let i = 0; i < 4; i++) s += `<rect x="${f1(ox - .8)}" y="${18 + i * 3.5}" width="1.6" height="3.5" fill="${i % 2 ? "#F2F0EA" : "#C0493A"}"/>`;
          const masts = [[96, 160, 88, 80], [150, 160, 160, 74], [196, 160, 204, 96]];
          const roof = `M30 156 Q52 108 88 104 Q118 112 140 98 Q160 92 172 110 Q192 116 206 120 Q222 136 230 156 Z`;
          s += `<path d="${roof}" fill="#BFD6E2" opacity=".8"/>`;
          for (let i = 1; i <= 4; i++) s += `<path d="M${30 + i * 5} ${156 - i * 1} Q${52 + i * 2} ${108 + i * 9} ${88} ${104 + i * 9} Q118 ${112 + i * 9} 140 ${98 + i * 10} Q160 ${92 + i * 11} 172 ${110 + i * 8} Q192 ${116 + i * 7} 206 ${120 + i * 6} Q218 ${136 + i * 3} ${230 - i * 4} 156" stroke="#8FA8B6" stroke-width=".6" fill="none"/>`;
          for (let x = 46; x < 224; x += 12) s += `<path d="M${x} 154 L${x + 6} 112" stroke="#8FA8B6" stroke-width=".5"/>`;
          s += `<path d="${roof}" fill="none" stroke="#6E8696" stroke-width="1.2"/>`;
          for (const [x1, y1, x2, y2] of masts) s += `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#5E6670" stroke-width="2"/><path d="M${x2} ${y2} L${x2 - 18} ${y2 + 26} M${x2} ${y2} L${x2 + 16} ${y2 + 28}" stroke="#5E6670" stroke-width=".7"/>`;
          s += water(164, "#A9CAD6", "#6E9AAE", r);
          if (r() < .55) s += boat(btw(r, 30, 160), btw(r, 182, 190), .8, true);
          for (let i = 0; i < 3; i++) s += tree(btw(r, 4, 290), btw(r, 160, 166), btw(r, .7, .9), sea, r);
          perch.push([ox + 7, 48], [160, 74], [88, 80]);
          return { s, l, perch };
        } },
      { id: "englischergarten", zh: "英國花園", see: ["有人在城市的河裡站在板子上衝浪", "木頭搭的中國塔一層一層往上疊", "好大的草地上有人在散步和遛狗"], spots: ["中國塔最上面的屋頂上", "河邊的欄杆上"],
        draw(c) {
          const { r, sea } = c, tx = btw(r, 190, 220); let s = "", l = ""; const perch = [];
          const G = { spring: "#9DBB7A", summer: "#7FA35E", autumn: "#A9A266", winter: "#D3D7CE" }[sea];
          s += `<rect x="0" y="146" width="300" height="24" fill="${G}"/>`;
          for (let i = 0; i < 3; i++) s += tree(btw(r, 8, 120), btw(r, 148, 152), btw(r, 1.3, 1.7), sea, r);
          let y = 150;
          for (let i = 0; i < 5; i++) {
            const bw = 30 - i * 5, rw = 56 - i * 8.5;
            s += `<rect x="${f1(tx - bw / 2)}" y="${y - 10}" width="${f1(bw)}" height="10" fill="#E7D9B6"/>`;
            for (let p = 0; p <= 3; p++) s += `<rect x="${f1(tx - bw / 2 + p * (bw - 2) / 3)}" y="${y - 10}" width="2" height="10" fill="#8C5A3C"/>`;
            s += `<path d="M${f1(tx - rw / 2)} ${y - 9} Q${f1(tx)} ${y - 13} ${f1(tx + rw / 2)} ${y - 9} L${f1(tx + rw / 2 - 5)} ${y - 15} L${f1(tx - rw / 2 + 5)} ${y - 15} Z" fill="#56705C"/>`;
            y -= 16;
          }
          s += `<path d="M${f1(tx - 5)} ${y + 1} L${f1(tx)} ${y - 7} L${f1(tx + 5)} ${y + 1} Z" fill="#56705C"/><circle cx="${f1(tx)}" cy="${y - 8}" r="1.6" fill="#D6B04E"/>`;
          perch.push([tx, y - 9]);
          for (let i = 0; i < 2; i++) s += tree(btw(r, 248, 296), btw(r, 150, 154), btw(r, 1.2, 1.5), sea, r);
          for (let i = 0; i < 2; i++) { const px = btw(r, 130, 290), py = btw(r, 158, 164); s += `<rect x="${f1(px - 1.2)}" y="${f1(py - 6)}" width="2.4" height="6" fill="${pick(r, ["#4E5A6A", "#8A4A3A"])}"/><circle cx="${f1(px)}" cy="${f1(py - 7.4)}" r="1.5" fill="#5A4636"/><ellipse cx="${f1(px + 5)}" cy="${f1(py - 1.5)}" rx="2.6" ry="1.4" fill="#7A5A40"/>`; }
          s += `<rect x="0" y="168" width="300" height="5" fill="#B5AE9F"/><rect x="0" y="173" width="300" height="27" fill="#5F8FA0"/>`;
          s += `<path d="M150 162 H300" stroke="#5E6670" stroke-width="1.2"/>`;
          for (let x = 152; x < 300; x += 12) s += `<path d="M${x} 162 V168" stroke="#5E6670" stroke-width="1"/>`;
          const wx = btw(r, 64, 104);
          s += `<path d="M${f1(wx - 40)} 190 Q${f1(wx)} 168 ${f1(wx + 40)} 190 Z" fill="#8FBCC8"/><path d="M${f1(wx - 30)} 188 Q${f1(wx - 4)} 170 ${f1(wx + 22)} 182" stroke="#F4FAFC" stroke-width="2.6" fill="none"/>`;
          for (let i = 0; i < 6; i++) s += `<circle cx="${f1(wx + btw(r, -26, 26))}" cy="${f1(btw(r, 182, 194))}" r="${f1(btw(r, .8, 1.6))}" fill="#F4FAFC"/>`;
          for (let i = 0; i < 6; i++) { const x = btw(r, 130, 290), yy = btw(r, 180, 196); s += `<path d="M${f1(x)} ${f1(yy)} q4 -2 8 0 t8 0" stroke="#fff" stroke-opacity=".45" stroke-width=".9" fill="none"/>`; }
          const sx = wx - 4;
          s += `<path d="M${f1(sx - 10)} 179 L${f1(sx + 10)} 175" stroke="#E8C05A" stroke-width="2.4" stroke-linecap="round"/><path d="M${f1(sx - 4)} 177 L${f1(sx - 1)} 169 L${f1(sx + 4)} 176 M${f1(sx - 1)} 169 L${f1(sx + 1)} 161 M${f1(sx - 7)} 163 L${f1(sx + 1)} 164 L${f1(sx + 8)} 162" stroke="#2E3A44" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="${f1(sx + 2)}" cy="157.6" r="2.4" fill="#2E3A44"/>`;
          perch.push([btw(r, 170, 280), 162]);
          return { s, l, perch };
        } },
    ],
  },
  brugge: {
    zh: "布魯日", de: "Brugge", gift: "一小塊手工蕾絲",
    sights: [
      { id: "belfort", zh: "布魯日鐘樓", see: ["磚造的高塔比廣場上的房子都高好多", "塔的上面一截變成了八角形", "塔裡的鐘每一刻鐘就叮叮噹噹響一次"], spots: ["鐘樓頂端的欄杆上", "鐘樓轉角的小尖塔上"],
        draw(c) {
          const { r, sea } = c, bx = btw(r, 176, 200), br = "#A9764F", st = "#C4A87E"; let s = "", l = ""; const perch = [];
          s += `<rect x="0" y="168" width="300" height="32" fill="#C9BBA4"/>`;
          s += houses(172, 4, r, ["#C9573F", "#E9D9B4", "#B8483A", "#D8A84A"], false).s;
          s += `<rect x="${f1(bx - 62)}" y="128" width="124" height="44" fill="#B98A62"/><rect x="${f1(bx - 64)}" y="125" width="128" height="4" fill="#9E7250"/>`;
          for (let i = 0; i < 8; i++) { if (i === 3 || i === 4) continue; s += `<path d="M${f1(bx - 56 + i * 15)} 162 v-18 l3 -4 l3 4 v18 Z" fill="#5E4434"/>`; }
          s += `<path d="M${f1(bx - 9)} 172 V153 Q${f1(bx)} 142 ${f1(bx + 9)} 153 V172 Z" fill="#5A4232"/>`;
          for (const x of [bx - 64, bx + 60]) s += `<rect x="${f1(x)}" y="114" width="4" height="12" fill="#9E7250"/><path d="M${f1(x - .5)} 114 l2.5 -6 l2.5 6 Z" fill="#5E5A58"/>`;
          s += `<rect x="${f1(bx - 18)}" y="66" width="36" height="62" fill="${br}"/><path d="M${f1(bx - 9)} 70 V124 M${f1(bx + 9)} 70 V124" stroke="#8E5E3E" stroke-width="1.2"/>`;
          s += `<path d="M${f1(bx - 4)} 118 v-14 l4 -6 l4 6 v14 Z" fill="#5E4434"/><circle cx="${f1(bx)}" cy="82" r="6" fill="#EDE2C2" stroke="#C9A040" stroke-width="1.4"/><path d="M${f1(bx)} 82 v-4 M${f1(bx)} 82 h3" stroke="#3A332C" stroke-width=".9"/>`;
          for (const x of [bx - 20, bx + 16]) s += `<rect x="${f1(x)}" y="58" width="4" height="10" fill="${br}"/><path d="M${f1(x - .5)} 58 l2.5 -7 l2.5 7 Z" fill="#5E5A58"/>`;
          s += `<rect x="${f1(bx - 18)}" y="64" width="36" height="3" fill="#8E5E3E"/><rect x="${f1(bx - 13)}" y="24" width="26" height="41" fill="${st}"/><path d="M${f1(bx - 5)} 24 V64 M${f1(bx + 5)} 24 V64" stroke="#A88C62" stroke-width=".9"/>`;
          s += `<path d="M${f1(bx - 3.5)} 58 v-20 l3.5 -5 l3.5 5 v20 Z" fill="#5E4434"/><path d="M${f1(bx - 11)} 58 v-16 l2.5 -4 l2.5 4 v16 Z M${f1(bx + 6)} 58 v-16 l2.5 -4 l2.5 4 v16 Z" fill="#6E5440"/>`;
          s += `<rect x="${f1(bx - 15)}" y="21" width="30" height="3.4" fill="#A88C62"/>`;
          for (let i = 0; i < 7; i++) s += `<rect x="${f1(bx - 14 + i * 4.5)}" y="18" width="1.4" height="3" fill="#A88C62"/>`;
          for (const x of [bx - 15, bx + 13]) s += `<path d="M${f1(x)} 21 l1 -5 l1 5 Z" fill="#A88C62"/>`;
          if (sea === "winter") s += `<rect x="${f1(bx - 64)}" y="123" width="128" height="2.4" fill="#F2F0EA"/>`;
          perch.push([bx - 6, 18], [bx + 18, 51], [bx - 40, 125]);
          for (let i = 0; i < 4; i++) { const px = btw(r, 20, 290), py = btw(r, 180, 194); s += `<rect x="${f1(px - 1.3)}" y="${f1(py - 7)}" width="2.6" height="7" fill="${pick(r, ["#4E5A6A", "#8A4A3A", "#3D6AA0"])}"/><circle cx="${f1(px)}" cy="${f1(py - 8.6)}" r="1.6" fill="#5A4636"/>`; }
          return { s, l, perch };
        } },
      { id: "rozenhoedkaai", zh: "運河與天鵝", see: ["紅磚房子的牆腳直接泡在運河裡", "屋頂的山牆像一階一階的小樓梯", "白色的天鵝在運河上游來游去"], spots: ["階梯山牆的最上面一階", "運河邊的石岸上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const sg = (x, w, h, col, n) => {
            const top = 150 - h, gh = w * .72, sx = w / (2 * n + 1), dy = gh / n; let d = `M${f1(x)} 150 L${f1(x)} ${f1(top)}`;
            for (let i = 0; i < n; i++) d += ` L${f1(x + i * sx)} ${f1(top - (i + 1) * dy)} L${f1(x + (i + 1) * sx)} ${f1(top - (i + 1) * dy)}`;
            for (let i = n - 1; i >= 0; i--) d += ` L${f1(x + w - (i + 1) * sx)} ${f1(top - (i + 1) * dy)} L${f1(x + w - i * sx)} ${f1(top - (i + 1) * dy)}`;
            let o = `<path d="${d} L${f1(x + w)} 150 Z" fill="${col}"/>`;
            let wd = `M${f1(x + w / 2 - 2)} ${f1(top - gh * .5)}h4v5h-4Z`; for (let fy = top + 6; fy < 140; fy += 13) for (let k = 0; k < 2; k++) wd += `M${f1(x + w * (.2 + k * .42))} ${f1(fy)}h${f1(w * .18)}v7h${f1(-w * .18)}Z`;
            o += `<path d="${wd}" fill="#3E3430" stroke="#EFE8DA" stroke-width=".8"/>`;
            return { o, apex: [x + w / 2, top - n * dy] };
          };
          let x = btw(r, -10, 0), ap = [];
          while (x < 300) {
            const w = btw(r, 24, 34), h = btw(r, 32, 54), n = r() < .5 ? 3 : 4;
            if (r() < .15 && x > 40) { s += tree(x + 10, 150, btw(r, 1.1, 1.4), sea, r); x += 20; continue; }
            const g = sg(x, w, h, pick(r, ["#8E4A36", "#A0583E", "#7E4232", "#B0694A", "#9C5F45"]), n); s += g.o; if (g.apex[0] > 110 && g.apex[0] < 270) ap.push(g.apex); x += w + btw(r, 0, 2);
          }
          s += water(147, "#9DB7BE", "#5E8590", r);
          s += `<path d="M0 180 L92 180 L98 200 L0 200 Z" fill="#B5AA98"/><rect x="0" y="178" width="92" height="3" fill="#A0947F"/>`;
          if (r() < .5) { const bx = btw(r, 110, 220); s += `<path d="M${f1(bx)} 168 h52 l-5 6 h-42 Z" fill="#3E5568"/>`; for (let i = 0; i < 6; i++) s += `<circle cx="${f1(bx + 8 + i * 7)}" cy="165.6" r="2" fill="${pick(r, ["#C0493A", "#3D6AA0", "#E8C05A", "#5A4636"])}"/>`; }
          const sw = (x, y, k) => `<path d="M${f1(x)} ${f1(y)} q${f1(6 * k)} ${f1(3.5 * k)} ${f1(13 * k)} 0 q${f1(-3 * k)} ${f1(-5 * k)} ${f1(-9 * k)} ${f1(-3 * k)} Z" fill="#FBFAF6"/><path d="M${f1(x + 10 * k)} ${f1(y - 1 * k)} q${f1(2.5 * k)} ${f1(-7 * k)} ${f1(-1 * k)} ${f1(-9 * k)}" stroke="#FBFAF6" stroke-width="${f1(1.6 * k)}" fill="none"/><circle cx="${f1(x + 8.4 * k)}" cy="${f1(y - 10 * k)}" r="${f1(1 * k)}" fill="#E08A3A"/>`;
          s += sw(btw(r, 120, 170), btw(r, 184, 192), 1.3) + sw(btw(r, 190, 260), btw(r, 176, 184), 1.1);
          if (r() < .6) s += sw(btw(r, 230, 280), btw(r, 190, 196), 1.2);
          perch.push(ap.length ? ap[Math.floor(ap.length / 2)] : [200, 100], [btw(r, 20, 70), 178]);
          return { s, l, perch };
        } },
      { id: "markt", zh: "市集廣場", see: ["廣場邊排著一間一間彩色的房子", "馬車在石頭地上喀啦喀啦地走過", "廣場中間站著兩個英雄的銅像"], spots: ["彩色房子的山牆上", "廣場銅像的頭上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          s += `<rect x="0" y="160" width="300" height="40" fill="#CDBFA6"/>`;
          let cd = ""; for (let i = 0; i < 30; i++) cd += `M${f1(btw(r, 0, 300))} ${f1(btw(r, 166, 198))}h1.6v1.2h-1.6Z`; s += `<path d="${cd}" fill="#B3A488"/>`;
          let x = btw(r, 22, 34), best = null;
          const cols = ["#C9573F", "#EFE3C4", "#E2B85A", "#86A08E", "#D88C5A", "#B84A3A", "#E9D3A8", "#9DB4C0"];
          let ci = Math.floor(r() * cols.length);
          while (x < 300) {
            const w = btw(r, 30, 40), h = btw(r, 50, 68), n = 4, top = 162 - h, gh = w * .7, sx = w / (2 * n + 1), dy = gh / n, col = cols[ci++ % cols.length];
            let d = `M${f1(x)} 162 L${f1(x)} ${f1(top)}`;
            for (let i = 0; i < n; i++) d += ` L${f1(x + i * sx)} ${f1(top - (i + 1) * dy)} L${f1(x + (i + 1) * sx)} ${f1(top - (i + 1) * dy)}`;
            for (let i = n - 1; i >= 0; i--) d += ` L${f1(x + w - (i + 1) * sx)} ${f1(top - (i + 1) * dy)} L${f1(x + w - i * sx)} ${f1(top - (i + 1) * dy)}`;
            s += `<path d="${d} L${f1(x + w)} 162 Z" fill="${col}" stroke="#F4EEE2" stroke-width=".8"/>`;
            let wd = ""; const ww = (w - 8) / 3 - 3; for (let fy = top + 5; fy < 140; fy += 12) for (let k = 0; k < 3; k++) wd += `M${f1(x + 4 + k * (w - 8) / 3)} ${f1(fy)}h${f1(ww)}v7h${f1(-ww)}Z`; s += `<path d="${wd}" fill="#4A4040" stroke="#F4EEE2" stroke-width=".8"/>`;
            s += `<path d="M${f1(x + 1)} 148 h${f1(w - 2)} l2 7 h${f1(-w - 2)} Z" fill="${pick(r, ["#7E2E28", "#2F5A46", "#3A4E6A"])}"/>`;
            if (!best || Math.abs(x + w / 2 - 230) < Math.abs(best[0] - 230)) best = [x + w / 2, top - n * dy];
            x += w;
          }
          const stx = btw(r, 104, 128);
          s += `<rect x="${f1(stx - 10)}" y="140" width="20" height="24" fill="#B7AD9A"/><rect x="${f1(stx - 12)}" y="138" width="24" height="3" fill="#A49A86"/>`;
          s += `<path d="M${f1(stx - 7)} 138 L${f1(stx - 6)} 124 L${f1(stx - 2)} 124 L${f1(stx - 1)} 138 Z M${f1(stx + 1)} 138 L${f1(stx + 2)} 125 L${f1(stx + 6)} 125 L${f1(stx + 7)} 138 Z" fill="#4E5A52"/><circle cx="${f1(stx - 4)}" cy="121" r="2.4" fill="#4E5A52"/><circle cx="${f1(stx + 4)}" cy="122" r="2.4" fill="#4E5A52"/><path d="M${f1(stx + 6)} 126 L${f1(stx + 9)} 114" stroke="#4E5A52" stroke-width="1.6" stroke-linecap="round"/>`;
          const kx = btw(r, 196, 244);
          s += `<ellipse cx="${f1(kx - 20)}" cy="170" rx="10" ry="5" fill="#6E4A32"/><path d="M${f1(kx - 28)} 168 L${f1(kx - 33)} 160 L${f1(kx - 37)} 162" stroke="#6E4A32" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M${f1(kx - 27)} 173 v8 M${f1(kx - 23)} 173 v8 M${f1(kx - 16)} 173 v8 M${f1(kx - 12)} 173 v8" stroke="#5A3C28" stroke-width="1.4"/>`;
          s += `<path d="M${f1(kx - 6)} 172 h24 v-12 q-4 -8 -14 -8 h-6 Z" fill="#2F2A28"/><circle cx="${f1(kx + 12)}" cy="176" r="6" fill="none" stroke="#2F2A28" stroke-width="1.4"/><circle cx="${f1(kx - 1)}" cy="177" r="4.4" fill="none" stroke="#2F2A28" stroke-width="1.4"/><path d="M${f1(kx - 12)} 168 h6" stroke="#2F2A28" stroke-width="1"/>`;
          perch.push(best, [stx - 4, 118]);
          return { s, l, perch };
        } },
      { id: "minnewater", zh: "愛之湖", see: ["安靜的湖面上有天鵝慢慢游過", "紅磚小橋旁邊站著一座尖頂的老塔", "湖邊的大樹把影子倒映在水裡"], spots: ["老塔的尖屋頂上", "紅磚橋的橋欄上"],
        draw(c) {
          const { r, sea } = c, bx0 = btw(r, 76, 96), bw = 130, tx = bx0 + bw + 14, br = "#A8603F"; let s = "", l = ""; const perch = [];
          const G = { spring: "#9DBB7A", summer: "#7FA35E", autumn: "#A9A266", winter: "#C9CEC4" }[sea];
          s += `<rect x="0" y="122" width="300" height="20" fill="${G}"/>`;
          for (let i = 0; i < 6; i++) s += tree(btw(r, 0, 300), btw(r, 134, 140), btw(r, 1.2, 1.6), sea, r);
          s += water(138, "#A6C2C6", "#6E95A0", r);
          s += `<rect x="${f1(bx0)}" y="148" width="${bw}" height="9" fill="${br}" opacity=".2"/>`;
          s += `<rect x="${f1(bx0)}" y="124" width="${bw}" height="24" fill="${br}"/><rect x="${f1(bx0 - 2)}" y="120" width="${bw + 4}" height="4.6" fill="#B9704E"/>`;
          for (let i = 0; i < 3; i++) { const ax = bx0 + 10 + i * 40, aw = 30; s += `<path d="M${f1(ax)} 148 V140 A${aw / 2} ${aw / 2 - 4} 0 0 1 ${f1(ax + aw)} 140 V148 Z" fill="#6E95A0"/><path d="M${f1(ax)} 148 V140 A${aw / 2} ${aw / 2 - 4} 0 0 1 ${f1(ax + aw)} 140" stroke="#C9845E" stroke-width="1.4" fill="none"/>`; }
          s += `<rect x="${f1(tx - 13)}" y="92" width="26" height="56" fill="#9A5638"/><path d="M${f1(tx - 15)} 92 L${f1(tx)} 62 L${f1(tx + 15)} 92 Z" fill="#55606A"/><path d="M${f1(tx)} 62 v-5" stroke="#55606A" stroke-width="1.2"/>`;
          s += `<path d="M${f1(tx - 4)} 132 v-10 q4 -5 8 0 v10 Z M${f1(tx - 2)} 108 v-6 q2 -3 4 0 v6 Z" fill="#4E3428"/><rect x="${f1(tx - 13)}" y="92" width="26" height="2" fill="#7E4630"/>`;
          s += `<rect x="${f1(tx - 13)}" y="148" width="26" height="10" fill="#9A5638" opacity=".2"/>`;
          if (sea === "winter") s += `<path d="M${f1(tx - 6)} 77 L${f1(tx)} 62 L${f1(tx + 6)} 77 Z" fill="#F2F0EA"/>`;
          const sw = (x, y, k) => `<path d="M${f1(x)} ${f1(y)} q${f1(6 * k)} ${f1(3.5 * k)} ${f1(13 * k)} 0 q${f1(-3 * k)} ${f1(-5 * k)} ${f1(-9 * k)} ${f1(-3 * k)} Z" fill="#FBFAF6"/><path d="M${f1(x + 10 * k)} ${f1(y - 1 * k)} q${f1(2.5 * k)} ${f1(-7 * k)} ${f1(-1 * k)} ${f1(-9 * k)}" stroke="#FBFAF6" stroke-width="${f1(1.6 * k)}" fill="none"/><circle cx="${f1(x + 8.4 * k)}" cy="${f1(y - 10 * k)}" r="${f1(1 * k)}" fill="#E08A3A"/>`;
          s += sw(btw(r, 30, 100), btw(r, 176, 186), 1.4) + sw(btw(r, 140, 230), btw(r, 184, 194), 1.2);
          if (r() < .5) s += sw(btw(r, 240, 280), btw(r, 168, 176), 1);
          perch.push([tx, 57], [bx0 + btw(r, 20, 100), 120]);
          return { s, l, perch };
        } },
      { id: "windmills", zh: "城牆上的風車", see: ["城牆的土坡上站著一座木頭風車", "風車有四片好大的格子翅膀", "土坡下面是繞著老城的運河"], spots: ["風車小屋的屋頂上", "風車翅膀的尖端上"],
        draw(c) {
          const { r, sea } = c, mx = btw(r, 176, 206), gy = 136; let s = "", l = ""; const perch = [];
          const G = { spring: "#9DBB7A", summer: "#7FA35E", autumn: "#A9A266", winter: "#C9CEC4" }[sea];
          s += `<path d="M0 180 L0 150 Q60 132 150 135 Q240 132 300 148 L300 180 Z" fill="${G}"/><path d="M0 152 Q60 136 150 139 Q240 136 300 151" stroke="#D9CFB4" stroke-width="1.6" fill="none"/>`;
          const mill = (x, g, k, a0) => {
            const hx = x - 2 * k, hy = g - 46 * k, R = 44 * k; let o = `<path d="M${f1(x - 12 * k)} ${f1(g)} L${f1(x)} ${f1(g - 14 * k)} L${f1(x + 12 * k)} ${f1(g)}" stroke="#5A4232" stroke-width="${f1(2 * k)}" fill="none"/><rect x="${f1(x - 2 * k)}" y="${f1(g - 24 * k)}" width="${f1(4 * k)}" height="${f1(24 * k)}" fill="#5A4232"/>`;
            o += `<path d="M${f1(x + 13 * k)} ${f1(g - 26 * k)} L${f1(x + 36 * k)} ${f1(g)}" stroke="#5A4232" stroke-width="${f1(1.8 * k)}"/><rect x="${f1(x - 13 * k)}" y="${f1(g - 58 * k)}" width="${f1(26 * k)}" height="${f1(34 * k)}" fill="#7A5A40"/>`;
            for (let i = 1; i < 4; i++) o += `<path d="M${f1(x - 13 * k)} ${f1(g - 58 * k + i * 8.5 * k)} h${f1(26 * k)}" stroke="#634834" stroke-width=".6"/>`;
            o += `<path d="M${f1(x - 15 * k)} ${f1(g - 58 * k)} Q${f1(x)} ${f1(g - 69 * k)} ${f1(x + 15 * k)} ${f1(g - 58 * k)} Z" fill="#5E4634"/>`;
            let tip = null;
            for (let i = 0; i < 4; i++) {
              const a = a0 + i * Math.PI / 2, ux = Math.cos(a), uy = Math.sin(a), nx = -uy * 7 * k, ny = ux * 7 * k, p1 = [hx + ux * R * .22, hy + uy * R * .22], p2 = [hx + ux * R, hy + uy * R];
              o += `<path d="M${f1(hx)} ${f1(hy)} L${f1(p2[0])} ${f1(p2[1])}" stroke="#4A3A2E" stroke-width="${f1(1.6 * k)}"/><path d="M${f1(p1[0])} ${f1(p1[1])} L${f1(p2[0])} ${f1(p2[1])} L${f1(p2[0] + nx)} ${f1(p2[1] + ny)} L${f1(p1[0] + nx)} ${f1(p1[1] + ny)} Z" fill="#EDE5D2" fill-opacity=".45" stroke="#5E4634" stroke-width=".8"/>`;
              for (let t = .38; t < 1; t += .16) o += `<path d="M${f1(hx + ux * R * t)} ${f1(hy + uy * R * t)} l${f1(nx)} ${f1(ny)}" stroke="#5E4634" stroke-width=".6"/>`;
              if (!tip || p2[1] < tip[1]) tip = p2;
            }
            o += `<circle cx="${f1(hx)}" cy="${f1(hy)}" r="${f1(2.4 * k)}" fill="#3E2E24"/>`;
            return { o, roof: [x, g - 65 * k], tip };
          };
          const sx = btw(r, 52, 84), small = mill(sx, 141, .5, btw(r, 0, Math.PI / 2)), big = mill(mx, gy, 1, btw(r, 0, Math.PI / 2));
          s += small.o + big.o;
          for (let i = 0; i < 2; i++) s += tree(btw(r, 230, 296), btw(r, 146, 152), btw(r, .9, 1.1), sea, r);
          s += water(178, "#9DB7BE", "#5E8590", r);
          perch.push(big.roof, big.tip[1] > 20 ? big.tip : [mx - 2, 90], small.roof);
          return { s, l, perch };
        } },
      { id: "begijnhof", zh: "貝居安會院", see: ["白色的小房子圍著一片草地", "草地上的大樹長得好高好高", "這裡好安靜，大家走路都輕輕的"], spots: ["白房子的屋頂尖上", "小教堂的鐘塔上", "大樹的樹枝上"],
        draw(c) {
          const { r, sea } = c, chx = btw(r, 196, 228); let s = "", l = ""; const perch = [];
          let x = btw(r, -8, 0), apex = null;
          while (x < 300) {
            const w = btw(r, 26, 38), h = btw(r, 20, 28), gh = btw(r, 12, 17);
            if (x + w > chx - 4 && x < chx + 60) { x = chx + 60; continue; }
            s += `<rect x="${f1(x)}" y="${f1(142 - h)}" width="${f1(w)}" height="${f1(h)}" fill="#F4F1EA"/><path d="M${f1(x - 1.5)} ${f1(142 - h)} L${f1(x + w / 2)} ${f1(142 - h - gh)} L${f1(x + w + 1.5)} ${f1(142 - h)} Z" fill="#9A4E3C"/>`;
            for (let k = 0; k < 2; k++) s += `<rect x="${f1(x + 5 + k * (w - 14))}" y="${f1(142 - h + 6)}" width="4" height="6" fill="#5A6470"/>`;
            s += `<rect x="${f1(x + w / 2 - 2.5)}" y="${f1(142 - 10)}" width="5" height="10" fill="#4E6A58"/>`;
            if (!apex && x > 120) apex = [x + w / 2, 142 - h - gh];
            if (sea === "winter") s += `<path d="M${f1(x + w / 2 - 6)} ${f1(142 - h - gh + 4)} L${f1(x + w / 2)} ${f1(142 - h - gh)} L${f1(x + w / 2 + 6)} ${f1(142 - h - gh + 4)} Z" fill="#FBFAF6"/>`;
            x += w + btw(r, 0, 3);
          }
          s += `<rect x="${f1(chx)}" y="102" width="56" height="40" fill="#F1EDE4"/><path d="M${f1(chx - 2)} 102 L${f1(chx + 28)} 80 L${f1(chx + 58)} 102 Z" fill="#7E4636"/><rect x="${f1(chx + 24)}" y="70" width="8" height="14" fill="#F1EDE4"/><path d="M${f1(chx + 23)} 70 L${f1(chx + 28)} 56 L${f1(chx + 33)} 70 Z" fill="#55606A"/>`;
          s += `<path d="M${f1(chx + 10)} 142 v-18 q4 -6 8 0 v18 Z M${f1(chx + 38)} 142 v-18 q4 -6 8 0 v18 Z" fill="#5A6470"/><circle cx="${f1(chx + 28)}" cy="112" r="4" fill="#5A6470"/>`;
          const G = { spring: "#9DBB7A", summer: "#7FA35E", autumn: "#A9A266", winter: "#C9CEC4" }[sea];
          s += `<rect x="0" y="142" width="300" height="5" fill="#D9CDB4"/><rect x="0" y="147" width="300" height="38" fill="${G}"/><rect x="0" y="185" width="300" height="15" fill="#D9CDB4"/>`;
          if (sea === "spring") for (let i = 0; i < 40; i++) s += `<circle cx="${f1(btw(r, 4, 296))}" cy="${f1(btw(r, 152, 182))}" r="1.2" fill="#F2D04A"/>`;
          let branch = null;
          for (let i = 0; i < 5; i++) {
            const tx = 30 + i * 60 + btw(r, -12, 12), yb = btw(r, 168, 180), T = btw(r, 34, 46), k = btw(r, 1.4, 1.7);
            s += `<path d="M${f1(tx)} ${f1(yb)} V${f1(yb - T)}" stroke="#5A4232" stroke-width="3.2" stroke-linecap="round"/>` + tree(tx, yb - T + 2, k, sea, r);
            if (i === 3) branch = [tx + 5, yb - T - 12 * k];
          }
          perch.push(apex || [chx + 28, 80], [chx + 28, 55], branch);
          return { s, l, perch };
        } },
    ],
  },
};
