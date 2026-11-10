var CITIES_PART = {
  wien: {
    zh: "維也納", de: "Wien", gift: "一張音樂會的票根",
    sights: [
      { id: "riesenrad", zh: "普拉特摩天輪", see: ["紅色的車廂慢慢轉到最高的地方", "從上面看得到普拉特公園一大片樹林", "摩天輪轉得很慢，慢到可以把城市看清楚"], spots: ["摩天輪最高的車廂頂上", "鋼骨支架的橫桿上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const cx = btw(r, 160, 195), R = btw(r, 52, 58), cy = 160 - R, a0 = r() * 6.3;
          s += hills(150, "#A7B795", r, 8);
          for (let i = 0; i < 5; i++) s += tree(btw(r, 8, 115), btw(r, 164, 170), btw(r, .9, 1.2), sea, r);
          s += `<path d="M${f1(cx - R * .62)} 172 L${f1(cx)} ${f1(cy)} L${f1(cx + R * .62)} 172 M${f1(cx - R * .5)} 172 L${f1(cx)} ${f1(cy + 5)} L${f1(cx + R * .5)} 172 M${f1(cx - R * .38)} ${f1(cy + R * .62)} h${f1(R * .76)}" stroke="#6C4A3A" stroke-width="2.4" fill="none"/>`;
          let z = "", sp = "", cab = "", win = "", top = [0, 999];
          for (let i = 0; i <= 36; i++) { const a = i / 36 * Math.PI * 2, rr = i % 2 ? R : R * .88; z += `${i ? "L" : "M"}${f1(cx + Math.cos(a) * rr)} ${f1(cy + Math.sin(a) * rr)}`; }
          for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; sp += `M${f1(cx)} ${f1(cy)}L${f1(cx + Math.cos(a) * R * .88)} ${f1(cy + Math.sin(a) * R * .88)}`; }
          for (let i = 0; i < 15; i++) { const a = a0 + i / 15 * Math.PI * 2, gx = cx + Math.cos(a) * R, gy = cy + Math.sin(a) * R; cab += `M${f1(gx - 4.5)} ${f1(gy + 1)}h9v6.5h-9Z`; win += `M${f1(gx - 3)} ${f1(gy + 3)}h6v2.2h-6Z`; if (gy < top[1]) top = [gx, gy]; }
          s += `<path d="${sp}" stroke="#8C3B2E" stroke-width=".8"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R)}" stroke="#8C3B2E" stroke-width="2.4" fill="none"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(R * .88)}" stroke="#8C3B2E" stroke-width="1.4" fill="none"/><path d="${z}" stroke="#8C3B2E" stroke-width=".9" fill="none"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="4" fill="#6C4A3A"/>`;
          s += `<path d="${cab}" fill="#B8402E"/><path d="${win}" fill="#F1E3C4"/>`;
          s += `<rect x="${f1(cx - 26)}" y="160" width="52" height="12" fill="#D9CDB4"/><path d="M${f1(cx - 28)} 160 L${f1(cx - 22)} 154 L${f1(cx + 22)} 154 L${f1(cx + 28)} 160 Z" fill="#7E6B5C"/>`;
          s += `<rect x="0" y="172" width="300" height="28" fill="#B9A78C"/>` + tree(btw(r, 250, 290), btw(r, 188, 194), btw(r, 1.1, 1.3), sea, r);
          perch.push([top[0], top[1] + 1], [cx, cy - 4], [cx, cy + R * .62 - 1]);
          return { s, l, perch };
        } },
      { id: "stephansdom", zh: "聖史蒂芬大教堂", see: ["屋頂的磁磚排成一道道彎彎的鋸齒", "南邊的尖塔好高，抬頭看脖子都酸了", "教堂前的廣場上有馬車喀噠喀噠走過"], spots: ["南塔的尖頂旁邊", "彩色屋頂的屋脊上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const x = btw(r, 90, 110), k = btw(r, .92, 1.04), B = 176, w = 120 * k, wt = B - 36 * k, rt = B - 82 * k, sp = x + 86 * k, nx = x + 22 * k;
          s += houses(B, 10, r, ["#E8DCC2", "#E2C9A3", "#D9D2C2", "#EBD6B4"], false).s;
          s += `<rect x="${f1(nx - 10 * k)}" y="${f1(B - 92 * k)}" width="${f1(20 * k)}" height="${f1(92 * k)}" fill="#BCAD91"/><path d="M${f1(nx - 11 * k)} ${f1(B - 92 * k)} q${f1(11 * k)} ${f1(-18 * k)} ${f1(22 * k)} 0 Z" fill="#5E7268"/>`;
          s += `<rect x="${f1(x)}" y="${f1(wt)}" width="${f1(w)}" height="${f1(36 * k)}" fill="#CDBFA6"/>`;
          let win = ""; for (let i = 0; i < 7; i++) { const wx = x + 8 * k + i * 15 * k; win += `M${f1(wx)} ${f1(B - 6 * k)}v${f1(-18 * k)}l${f1(2.5 * k)} ${f1(-4 * k)}l${f1(2.5 * k)} ${f1(4 * k)}v${f1(18 * k)}Z`; }
          s += `<path d="${win}" fill="#5A4E40" opacity=".65"/>`;
          s += `<path d="M${f1(x - 3)} ${f1(wt)} L${f1(x + 20 * k)} ${f1(rt)} L${f1(x + w - 20 * k)} ${f1(rt)} L${f1(x + w + 3)} ${f1(wt)} Z" fill="#2F5A4E"/>`;
          for (let j = 0; j < 4; j++) {
            const y = wt - (7 + j * 11) * k, t = (wt - y) / (wt - rt), xl = x - 3 + t * (20 * k + 3) + 4, xr = x + w + 3 - t * (20 * k + 3) - 4;
            let z = `M${f1(xl)} ${f1(y)}`, n = Math.floor((xr - xl) / (6 * k)); for (let i = 1; i <= n; i++) z += `L${f1(xl + i * 6 * k)} ${f1(y - (i % 2 ? 5 : 0) * k)}`;
            s += `<path d="${z}" stroke="${j % 2 ? "#EDE6D3" : "#E5BF55"}" stroke-width="${f1(2 * k)}" fill="none"/>`;
          }
          s += `<path d="M${f1(sp - 13 * k)} ${B} L${f1(sp - 11 * k)} ${f1(B - 60 * k)} L${f1(sp - 8 * k)} ${f1(B - 100 * k)} L${f1(sp - 4 * k)} ${f1(B - 125 * k)} L${f1(sp)} ${f1(B - 142 * k)} L${f1(sp + 4 * k)} ${f1(B - 125 * k)} L${f1(sp + 8 * k)} ${f1(B - 100 * k)} L${f1(sp + 11 * k)} ${f1(B - 60 * k)} L${f1(sp + 13 * k)} ${B} Z" fill="#BCAD91"/>`;
          let sl = ""; for (let i = 0; i < 4; i++) sl += `M${f1(sp - 1.5 * k)} ${f1(B - (24 + i * 24) * k)}h${f1(3 * k)}v${f1(-11 * k)}h${f1(-3 * k)}Z`;
          s += `<path d="${sl}" fill="#5A4E40"/><path d="M${f1(sp - 11 * k)} ${f1(B - 60 * k)}h${f1(22 * k)}M${f1(sp - 8 * k)} ${f1(B - 100 * k)}h${f1(16 * k)}M${f1(sp)} ${f1(B - 142 * k)}v${f1(-5 * k)}" stroke="#8C7E66" stroke-width="1.4"/>`;
          s += `<rect x="0" y="${B}" width="300" height="${200 - B}" fill="#B9A78C"/>`;
          if (r() < .6) { const fx = btw(r, 18, 60); s += `<path d="M${f1(fx + 14)} 182 q8 -5 16 0 l4 -6 l3 1 l-3 8 v9 M${f1(fx + 16)} 183 v9 M${f1(fx + 28)} 183 v9" stroke="#6A4A36" stroke-width="2.2" fill="#6A4A36"/><rect x="${f1(fx)}" y="174" width="13" height="12" rx="2" fill="#2E2A28"/><circle cx="${f1(fx + 3)}" cy="189" r="3.6" stroke="#2E2A28" stroke-width="1.2" fill="none"/><circle cx="${f1(fx + 11)}" cy="189" r="3.6" stroke="#2E2A28" stroke-width="1.2" fill="none"/>`; }
          else s += tree(btw(r, 30, 70), 192, 1.1, sea, r);
          perch.push([sp, B - 147 * k], [x + w * .45, rt - .5]);
          return { s, l, perch };
        } },
      { id: "schoenbrunn", zh: "美泉宮", see: ["黃色的宮殿長得看不到盡頭", "花園的小路又直又長，一直通到山坡上", "山坡上的涼亭可以看到整座城"], spots: ["宮殿屋頂的欄杆上", "山坡上涼亭的屋頂"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const gx = btw(r, 165, 205), x0 = btw(r, 14, 34), x1 = 300 - btw(r, 6, 20), mid = (x0 + x1) / 2 + btw(r, -6, 6), yt = 134;
          s += `<path d="M0 158 Q${f1(gx - 90)} 116 ${f1(gx)} 110 Q${f1(gx + 70)} 106 300 128 L300 200 L0 200 Z" fill="#8FAA78"/>`;
          for (const dx of [-74, -60, 50, 66]) s += tree(gx + dx + btw(r, -4, 4), 128, .7, sea, r);
          let ar = ""; for (let i = 0; i < 9; i++) ar += `M${f1(gx - 33 + i * 7.6)} 115v-8q2.5 -4 5 0v8Z`;
          s += `<rect x="${f1(gx - 37)}" y="100" width="74" height="16" fill="#E3DCCB"/><rect x="${f1(gx - 13)}" y="92" width="26" height="9" fill="#E3DCCB"/><path d="M${f1(gx - 38)} 100h76M${f1(gx - 14)} 92h28" stroke="#BFB5A0" stroke-width="1.2"/><path d="${ar}" fill="#8C9AA0"/><path d="M${f1(gx - 2)} 92 l2 -4 l2 4 Z" fill="#5A5248"/>`;
          s += `<path d="M${f1(x0 - 2)} ${yt} L${f1(x0 + 4)} ${yt - 7} L${f1(x1 - 4)} ${yt - 7} L${f1(x1 + 2)} ${yt} Z" fill="#8A8478"/><rect x="${f1(x0)}" y="${yt}" width="${f1(x1 - x0)}" height="${172 - yt}" fill="#E8C35E"/>`;
          s += `<rect x="${f1(mid - 30)}" y="${yt - 10}" width="60" height="4" fill="#D9B556"/><rect x="${f1(mid - 28)}" y="${yt - 6}" width="56" height="${178 - yt}" fill="#EDCB6A"/>`;
          if (sea === "winter") s += `<path d="M${f1(x0 + 2)} ${yt - 5} L${f1(x0 + 5)} ${yt - 7} L${f1(x1 - 5)} ${yt - 7} L${f1(x1 - 2)} ${yt - 5} Z M${f1(mid - 30)} ${yt - 10} h60 v1.5 h-60 Z" fill="#FFFFFF"/>`;
          let win = ""; for (const wy of [yt + 8, yt + 22]) for (let wx = x0 + 5; wx < x1 - 6; wx += 8.5) if (wy > yt + 15 || Math.abs(wx - mid) > 6) win += `M${f1(wx)} ${wy}h3.4v6h-3.4Z`;
          s += `<path d="${win}" fill="#5E6B5E" opacity=".8"/><path d="M${f1(mid - 13)} 172v-8q3 -5 6 0v8ZM${f1(mid - 3)} 172v-9q3 -5 6 0v9ZM${f1(mid + 7)} 172v-8q3 -5 6 0v8Z" fill="#5A4E40"/>`;
          const hc = { spring: "#6E9A55", summer: "#5F8E4C", autumn: "#A8803E", winter: "#8E9886" }[sea];
          s += `<rect x="0" y="172" width="300" height="28" fill="#9FB784"/><path d="M${f1(mid - 9)} 172 L${f1(mid + 9)} 172 L${f1(mid + 34)} 200 L${f1(mid - 34)} 200 Z M0 184 h300 v3 h-300 Z" fill="#E3D9C0"/>`;
          let hd = ""; for (let hx = 4; hx < 296; hx += 21) if (Math.abs(hx + 6 - mid) > 24) hd += `M${f1(hx)} 182v-8q6 -3 12 0v8Z`;
          s += `<path d="${hd}" fill="${hc}"/>`;
          perch.push([mid, yt - 10], [gx, 88], [x0 + 30, yt - 7]);
          return { s, l, perch };
        } },
      { id: "hundertwasser", zh: "百水公寓", see: ["牆上塗滿紅黃藍，每一扇窗都不一樣大", "屋頂和陽台上長著樹，像一座小森林", "金色的洋蔥形圓頂在屋頂上發亮"], spots: ["金色圓頂的尖尖上", "屋頂小樹的旁邊", "彩色牆面的屋簷上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const bx = btw(r, 98, 118), bw = 160, B = 176, cols = ["#C8443A", "#E7C14B", "#3F6FA8", "#F1ECE0", "#D98BA0", "#7FA36A", "#E58A3A"], o = Math.floor(r() * 7);
          s += `<rect x="0" y="112" width="${f1(bx)}" height="${B - 112}" fill="#D9D2C2"/><rect x="${f1(bx + bw)}" y="118" width="${f1(300 - bx - bw)}" height="${B - 118}" fill="#D6D0C4"/>`;
          let pw = ""; for (let y = 122; y < 166; y += 18) { for (let x = 6; x < bx - 8; x += 13) pw += `M${f1(x)} ${y}h6v8h-6Z`; for (let x = bx + bw + 6; x < 294; x += 13) pw += `M${f1(x)} ${y + 6}h6v8h-6Z`; }
          s += `<path d="${pw}" fill="#7E7A70" opacity=".6"/>`;
          let x = bx, i = 0, win = ""; const tops = [];
          while (x < bx + bw - 4) {
            const w = Math.min(btw(r, 22, 32), bx + bw - x), t1 = btw(r, 84, 100), t2 = btw(r, 84, 100);
            s += `<path d="M${f1(x)} ${B} L${f1(x)} ${f1(t1)} L${f1(x + w)} ${f1(t2)} L${f1(x + w)} ${B} Z" fill="${cols[(i + o) % 7]}"/>`;
            tops.push([x + w / 2, (t1 + t2) / 2]);
            for (let fy = Math.max(t1, t2) + 8; fy < B - 20; fy += btw(r, 16, 22)) { const ww = btw(r, 6, 10), wh = btw(r, 7, 11), wx = x + btw(r, 3, Math.max(3.5, w - ww - 3)); win += `M${f1(wx)} ${f1(fy)}h${f1(ww)}v${f1(wh)}h${f1(-ww)}Z`; }
            x += w; i++;
          }
          s += `<path d="${win}" fill="#3E4A55" stroke="#F4EEDF" stroke-width="1.4"/>`;
          let wv = ""; for (const y of [124, 152]) { wv += `M${f1(bx)} ${y}`; for (let q = 0; q < 10; q++) wv += `q8 ${q % 2 ? 4 : -4} 16 0`; }
          s += `<path d="${wv}" stroke="#2E2A28" stroke-width="1.3" fill="none"/>`;
          const d1 = tops[1], d2 = tops[tops.length - 2];
          for (const [tx, ty] of [d1, d2]) s += `<rect x="${f1(tx - 5)}" y="${f1(ty - 14)}" width="10" height="16" fill="#F1ECE0"/><path d="M${f1(tx - 6)} ${f1(ty - 14)} Q${f1(tx - 12)} ${f1(ty - 22)} ${f1(tx)} ${f1(ty - 30)} Q${f1(tx + 12)} ${f1(ty - 22)} ${f1(tx + 6)} ${f1(ty - 14)} Z" fill="#D9A93A"/><path d="M${f1(tx)} ${f1(ty - 30)} v-5" stroke="#B8862A" stroke-width="1.4"/>`;
          tops.forEach((t, j) => { if (j !== 1 && j !== tops.length - 2 && j % 2 === 0) s += tree(t[0], t[1] + 2, .8, sea, r); });
          s += `<path d="M0 176 Q50 172 100 176 T200 176 T300 176 L300 200 L0 200 Z" fill="#B9A78C"/>`;
          perch.push([d1[0], d1[1] - 33], [d2[0], d2[1] - 33], [tops[tops.length - 1][0], tops[tops.length - 1][1] + 1]);
          return { s, l, perch };
        } },
      { id: "karlskirche", zh: "卡爾教堂", see: ["綠色的大圓頂倒映在前面的水池裡", "兩根大柱子上刻著一圈圈往上繞的圖案", "門口的柱廊像一座古希臘神殿"], spots: ["綠色圓頂上的小燈籠旁", "大柱子頂端的平台上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const cx = btw(r, 158, 182), k = btw(r, .94, 1.04), B = 170, X = (d) => f1(cx + d * k), Y = (d) => f1(B - d * k), K = (d) => f1(d * k);
          s += tree(btw(r, 14, 60), 172, btw(r, 1.2, 1.5), sea, r) + tree(btw(r, 70, 90), 172, 1.1, sea, r) + tree(btw(r, 268, 292), 172, btw(r, 1.2, 1.5), sea, r);
          for (const sx of [-96, 64]) s += `<rect x="${X(sx)}" y="${Y(46)}" width="${K(32)}" height="${K(46)}" fill="#DDD2BA"/><path d="M${X(sx - 2)} ${Y(46)} L${X(sx + 16)} ${Y(56)} L${X(sx + 34)} ${Y(46)} Z" fill="#CFC3A8"/><path d="M${X(sx + 10)} ${B}v${K(-20)}q${K(6)} ${K(-9)} ${K(12)} 0v${K(20)}Z" fill="#5A4E40"/>`;
          s += `<rect x="${X(-44)}" y="${Y(72)}" width="${K(88)}" height="${K(72)}" fill="#E6DCC6"/><rect x="${X(-24)}" y="${Y(94)}" width="${K(48)}" height="${K(23)}" fill="#E6DCC6"/>`;
          s += `<path d="M${X(-18)} ${Y(76)}h${K(4)}v${K(10)}h${K(-4)}ZM${X(-2)} ${Y(76)}h${K(4)}v${K(10)}h${K(-4)}ZM${X(14)} ${Y(76)}h${K(4)}v${K(10)}h${K(-4)}Z" fill="#5A4E40" opacity=".7"/>`;
          s += `<path d="M${X(-26)} ${Y(92)} Q${X(-26)} ${Y(124)} ${X(0)} ${Y(126)} Q${X(26)} ${Y(124)} ${X(26)} ${Y(92)} Z" fill="#6FA28D"/><path d="M${X(-12)} ${Y(93)} Q${X(-12)} ${Y(121)} ${X(0)} ${Y(125)} Q${X(12)} ${Y(121)} ${X(12)} ${Y(93)}" stroke="#4F8270" stroke-width="1.1" fill="none"/>`;
          s += `<rect x="${X(-4)}" y="${Y(137)}" width="${K(8)}" height="${K(12)}" fill="#E6DCC6"/><path d="M${X(-5)} ${Y(137)} q${K(5)} ${K(-6)} ${K(10)} 0 Z" fill="#6FA28D"/><path d="M${X(0)} ${Y(140)} v${K(-6)}" stroke="#B89A55" stroke-width="1.3"/>`;
          s += `<rect x="${X(-32)}" y="${Y(60)}" width="${K(64)}" height="${K(56)}" fill="#8C7E68"/>`;
          let col = ""; for (let i = 0; i < 6; i++) col += `M${X(-32 + i * 12.4)} ${Y(4)}v${K(-56)}h${K(4.4)}v${K(56)}Z`;
          s += `<path d="${col}" fill="#F1EADB"/><rect x="${X(-36)}" y="${Y(66)}" width="${K(72)}" height="${K(6)}" fill="#EFE7D6"/><path d="M${X(-38)} ${Y(66)} L${X(0)} ${Y(84)} L${X(38)} ${Y(66)} Z" fill="#EFE7D6" stroke="#CFC3A8" stroke-width="1"/><rect x="${X(-42)}" y="${Y(4)}" width="${K(84)}" height="${K(4)}" fill="#D6CBB2"/>`;
          let spi = "";
          for (const px of [-54, 54]) {
            s += `<rect x="${X(px - 9)}" y="${Y(20)}" width="${K(18)}" height="${K(20)}" fill="#DDD2BA"/><rect x="${X(px - 6)}" y="${Y(112)}" width="${K(12)}" height="${K(92)}" fill="#EAE1CD"/><rect x="${X(px - 8)}" y="${Y(117)}" width="${K(16)}" height="${K(5)}" fill="#D6CBB2"/><path d="M${X(px - 3)} ${Y(117)}h${K(6)}v${K(-7)}q${K(-3)} ${K(-5)} ${K(-6)} 0Z" fill="#6FA28D"/>`;
            for (let i = 0; i < 10; i++) spi += `M${X(px - 6)} ${Y(24 + i * 9)}L${X(px + 6)} ${Y(30 + i * 9)}`;
          }
          s += `<path d="${spi}" stroke="#B5A88C" stroke-width="1.6"/>`;
          s += `<rect x="0" y="${B}" width="300" height="5" fill="#C9BBA0"/>` + water(175, "#A8C6D2", "#6F9DB0", r) + `<rect x="${X(-44)}" y="176" width="${K(88)}" height="18" fill="#E6DCC6" opacity=".25"/>`;
          perch.push([cx, B - 140 * k], [cx - 54 * k, B - 128 * k], [cx + 54 * k, B - 128 * k]);
          return { s, l, perch };
        } },
      { id: "staatsoper", zh: "國家歌劇院", see: ["門口一整排拱門，下面站著等著進場的人", "綠色的銅屋頂在陽光下很顯眼", "紅白色的電車從歌劇院前叮叮噹噹開過"], spots: ["拱廊上方的屋簷上", "綠色銅屋頂的屋脊上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const cx = btw(r, 168, 190), B = 168, X = (d) => f1(cx + d), Y = (d) => f1(B - d);
          s += `<path d="M${X(8)} ${Y(74)} L${X(16)} ${Y(112)} L${X(60)} ${Y(112)} L${X(68)} ${Y(74)} Z" fill="#5E8C79"/><path d="M${X(-64)} ${Y(70)} Q${X(-60)} ${Y(98)} ${X(-12)} ${Y(100)} Q${X(36)} ${Y(98)} ${X(40)} ${Y(70)} Z" fill="#6E9A87"/><path d="M${X(16)} ${Y(112)}h${44}" stroke="#4E7A68" stroke-width="1.4"/>`;
          s += `<path d="M${X(-88)} ${Y(70)} L${X(-82)} ${Y(80)} L${X(-46)} ${Y(80)} L${X(-46)} ${Y(70)} Z M${X(88)} ${Y(70)} L${X(82)} ${Y(80)} L${X(46)} ${Y(80)} L${X(46)} ${Y(70)} Z" fill="#6E9A87"/><rect x="${X(-86)}" y="${Y(70)}" width="172" height="70" fill="#D8C8A8"/>`;
          let w = ""; for (const wy of [56, 34]) for (const s0 of [-80, 50]) for (let i = 0; i < 3; i++) w += `M${X(s0 + i * 11)} ${Y(wy - 12)}v-10q3 -4 6 0v10Z`;
          s += `<path d="${w}" fill="#5A4E40" opacity=".7"/>`;
          s += `<rect x="${X(-46)}" y="${Y(80)}" width="92" height="80" fill="#E4D7BA"/><rect x="${X(-48)}" y="${Y(84)}" width="96" height="5" fill="#CDBD9C"/>`;
          let lo = "", up = ""; for (let i = 0; i < 5; i++) { const ax = cx - 41 + i * 17.6; lo += `M${f1(ax)} ${B}v-24q6.3 -10 12.6 0v24Z`; up += `M${f1(ax)} ${f1(B - 42)}v-22q6.3 -10 12.6 0v22Z`; }
          s += `<path d="${lo}" fill="#4E443A"/><path d="${up}" fill="#8C7A60"/><path d="M${X(-46)} ${Y(42)}h92M${X(-46)} ${Y(46)}h92" stroke="#F1E8D4" stroke-width="1.2"/>`;
          for (const sx of [-38, 38]) s += `<path d="M${X(sx - 6)} ${Y(84)} l1 -6 l4 -1 l2 -7 l3 5 l-1 3 l3 2 v4 Z" fill="#4E6E62"/>`;
          s += `<rect x="0" y="${B}" width="300" height="${200 - B}" fill="#8D8C86"/><rect x="0" y="${B}" width="300" height="5" fill="#B9B0A0"/><path d="M0 186h300M0 191h300" stroke="#6E6C66" stroke-width="1"/>`;
          perch.push([cx - 24, B - 84], [cx + 38, B - 112]);
          if (r() < .7) { const tx = btw(r, 6, 46); let tw = ""; for (let i = 0; i < 5; i++) tw += `M${f1(tx + 5 + i * 10)} 164h7v6h-7Z`; s += `<rect x="${f1(tx)}" y="160" width="56" height="24" rx="3" fill="#C8302A"/><rect x="${f1(tx)}" y="173" width="56" height="3" fill="#F1E3C4"/><path d="${tw}" fill="#DCE7EE"/><path d="M${f1(tx + 22)} 160 l6 -7 l6 7" stroke="#2E2A28" stroke-width="1" fill="none"/><path d="M${f1(tx + 6)} 184h8M${f1(tx + 42)} 184h8" stroke="#2A2A2A" stroke-width="3"/>`; perch.push([tx + 12, 160]); }
          return { s, l, perch };
        } },
    ],
  },
  salzburg: {
    zh: "薩爾斯堡", de: "Salzburg", gift: "一顆莫札特巧克力球",
    sights: [
      { id: "festung", zh: "薩爾斯堡要塞", see: ["白色的城堡站在山頂上，整座城都看得到它", "坐一小段纜車，一下子就爬上了山", "從城牆往下看，老城的屋頂一片挨著一片"], spots: ["城堡最高的屋頂上", "城牆的垛口上", "纜車軌道旁的石頭上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const fx = btw(r, 150, 185), tone = { spring: "#7FA56A", summer: "#5E8C4A", autumn: "#9C8A4A", winter: "#C9CFC9" }[sea], roof = "#9A4E3C";
          s += hills(124, "#9FB0BE", r, 22);
          s += `<path d="M0 178 L0 152 Q${f1(fx - 120)} 140 ${f1(fx - 80)} 112 Q${f1(fx - 50)} 86 ${f1(fx)} 86 Q${f1(fx + 60)} 86 ${f1(fx + 100)} 108 Q${f1(fx + 130)} 128 300 138 L300 178 Z" fill="${tone}"/>`;
          for (let i = 0; i < 3; i++) s += tree(btw(r, 8, Math.max(20, fx - 120)), btw(r, 158, 166), btw(r, .8, 1), sea, r);
          s += `<rect x="${f1(fx - 72)}" y="80" width="144" height="28" fill="#EFE6D2"/><rect x="${f1(fx - 76)}" y="72" width="11" height="34" fill="#E6DCC6"/><path d="M${f1(fx - 77)} 72 L${f1(fx - 70.5)} 62 L${f1(fx - 64)} 72 Z" fill="${roof}"/>`;
          let cr = ""; for (let x = fx - 64; x < fx + 70; x += 6) cr += `M${f1(x)} 80v-3h3v3Z`;
          s += `<path d="${cr}" fill="#EFE6D2"/>`;
          s += `<rect x="${f1(fx - 64)}" y="66" width="40" height="16" fill="#E9DFC9"/><path d="M${f1(fx - 66)} 66 L${f1(fx - 60)} 58 L${f1(fx - 28)} 58 L${f1(fx - 22)} 66 Z" fill="${roof}"/>`;
          s += `<rect x="${f1(fx - 16)}" y="50" width="36" height="32" fill="#F2EBDA"/><path d="M${f1(fx - 19)} 50 L${f1(fx - 8)} 38 L${f1(fx + 12)} 38 L${f1(fx + 23)} 50 Z" fill="${roof}"/>`;
          s += `<rect x="${f1(fx + 38)}" y="58" width="14" height="24" fill="#F2EBDA"/><path d="M${f1(fx + 36)} 58 L${f1(fx + 45)} 44 L${f1(fx + 54)} 58 Z" fill="${roof}"/>`;
          if (sea === "winter") s += `<path d="M${f1(fx - 12)} 41 L${f1(fx - 8)} 38 L${f1(fx + 12)} 38 L${f1(fx + 16)} 41 Z M${f1(fx - 62)} 61 L${f1(fx - 60)} 58 L${f1(fx - 28)} 58 L${f1(fx - 26)} 61 Z" fill="#FFFFFF"/>`;
          let w = ""; for (let i = 0; i < 4; i++) w += `M${f1(fx - 11 + i * 8)} 58h3v5h-3ZM${f1(fx - 11 + i * 8)} 69h3v5h-3ZM${f1(fx - 58 + i * 9)} 70h3v4h-3Z`; for (let i = 0; i < 10; i++) w += `M${f1(fx - 64 + i * 14)} 90h3v5h-3Z`;
          s += `<path d="${w}" fill="#6A5A4A"/>`;
          s += `<path d="M${f1(fx - 64)} 104 L${f1(fx - 50)} 130 L${f1(fx - 34)} 120 L${f1(fx - 20)} 136 L${f1(fx - 2)} 124 L${f1(fx + 14)} 134 L${f1(fx + 30)} 120 L${f1(fx + 46)} 128 L${f1(fx + 68)} 104 Z" fill="#A39C8E" opacity=".75"/><path d="M${f1(fx - 72)} 106 h144" stroke="${tone}" stroke-width="3"/>`;
          const t = btw(r, .25, .75), px = fx - 104 + 36 * t, py = 138 - 36 * t;
          s += `<path d="M${f1(fx - 104)} 138 L${f1(fx - 68)} 102 M${f1(fx - 100)} 140 L${f1(fx - 66)} 106" stroke="#6A5A4A" stroke-width="1.6"/><path d="M${f1(px - 6)} ${f1(py + 5)} L${f1(px + 4)} ${f1(py - 5)} L${f1(px + 4)} ${f1(py - 13)} L${f1(px - 6)} ${f1(py - 3)} Z" fill="#C2392D"/><path d="M${f1(px - 4)} ${f1(py - 2)} l6 -6 v3 l-6 6 Z" fill="#F1E3C4"/>`;
          const dx = btw(r, 40, Math.max(42, fx - 105));
          s += houses(180, 12, r, ["#F0D9A6", "#EAC9B0", "#DCE3D2", "#E9DFC9"], false).s;
          s += `<rect x="${f1(dx - 12)}" y="142" width="24" height="38" fill="#E9DFC9"/><path d="M${f1(dx - 13)} 142 Q${f1(dx - 13)} 128 ${f1(dx)} 126 Q${f1(dx + 13)} 128 ${f1(dx + 13)} 142 Z" fill="#6FA28D"/><path d="M${f1(dx)} 126 v-7" stroke="#6FA28D" stroke-width="2"/>`;
          s += `<rect x="0" y="180" width="300" height="20" fill="#BFB29A"/>`;
          perch.push([fx + 2, 38], [fx + 45, 44], [fx + 30, 77]);
          return { s, l, perch };
        } },
      { id: "dom", zh: "薩爾斯堡大教堂", see: ["兩座鐘塔都戴著綠色的圓帽子", "教堂正面有三扇好大的銅門", "教堂前的廣場上站著一座聖母像"], spots: ["鐘塔的綠帽子上", "教堂正面的山牆頂上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const cx = btw(r, 166, 182), B = 174, st = "#E7E1D3", gr = "#6FA28D";
          for (const ax of [cx - 112, cx + 62]) s += `<rect x="${f1(ax)}" y="128" width="50" height="${B - 128}" fill="#E2D9C6"/><rect x="${f1(ax - 1)}" y="126" width="52" height="4" fill="#C9BFA9"/><path d="M${f1(ax + 7)} ${B}v-22q7 -10 14 0v22ZM${f1(ax + 29)} ${B}v-22q7 -10 14 0v22Z" fill="#5A4E40"/>`;
          s += `<rect x="${f1(cx - 20)}" y="74" width="40" height="26" fill="${st}"/><path d="M${f1(cx - 22)} 76 Q${f1(cx - 22)} 54 ${f1(cx)} 52 Q${f1(cx + 22)} 54 ${f1(cx + 22)} 76 Z" fill="${gr}"/><rect x="${f1(cx - 3)}" y="44" width="6" height="9" fill="${st}"/><path d="M${f1(cx - 4)} 44 q4 -6 8 0 Z" fill="${gr}"/><path d="M${f1(cx)} 39 v-5" stroke="#B89A55" stroke-width="1.2"/>`;
          s += `<rect x="${f1(cx - 34)}" y="96" width="68" height="${B - 96}" fill="${st}"/><path d="M${f1(cx - 32)} 98 L${f1(cx - 32)} 90 Q${f1(cx - 16)} 90 ${f1(cx - 12)} 82 L${f1(cx)} 74 L${f1(cx + 12)} 82 Q${f1(cx + 16)} 90 ${f1(cx + 32)} 90 L${f1(cx + 32)} 98 Z" fill="#EDE8DC" stroke="#C9BFA9" stroke-width="1"/><circle cx="${f1(cx)}" cy="86" r="4" fill="#C9BFA9"/>`;
          let tw = "";
          for (const tx of [cx - 46, cx + 46]) {
            s += `<rect x="${f1(tx - 13)}" y="70" width="26" height="${B - 70}" fill="${st}"/><rect x="${f1(tx - 14)}" y="67" width="28" height="4" fill="#C9BFA9"/><path d="M${f1(tx - 14)} 67 Q${f1(tx - 14)} 54 ${f1(tx)} 50 Q${f1(tx + 14)} 54 ${f1(tx + 14)} 67 Z" fill="${gr}"/><rect x="${f1(tx - 3)}" y="42" width="6" height="9" fill="${st}"/><path d="M${f1(tx - 4)} 42 q4 -10 8 0 Z" fill="${gr}"/><path d="M${f1(tx)} 34 v-4" stroke="${gr}" stroke-width="1.4"/>`;
            tw += `M${f1(tx - 4)} 92v-12q4 -6 8 0v12ZM${f1(tx - 3)} 134v-12q3 -5 6 0v12Z`;
          }
          s += `<path d="${tw}M${f1(cx - 22)} 118v-10q3 -5 6 0v10ZM${f1(cx - 3)} 118v-10q3 -5 6 0v10ZM${f1(cx + 16)} 118v-10q3 -5 6 0v10Z" fill="#6A6458"/><path d="M${f1(cx - 59)} 122h118M${f1(cx - 59)} 98h118" stroke="#C9BFA9" stroke-width="1.6"/>`;
          s += `<path d="M${f1(cx - 25)} ${B}v-20q5 -7 10 0v20ZM${f1(cx - 5)} ${B}v-22q5 -7 10 0v22ZM${f1(cx + 15)} ${B}v-20q5 -7 10 0v20Z" fill="#5A4A3A"/>`;
          s += `<rect x="0" y="${B}" width="300" height="${200 - B}" fill="#C9BBA0"/>`;
          if (r() < .55) { const mx = cx + btw(r, -12, 12); s += `<rect x="${f1(mx - 5)}" y="186" width="10" height="10" fill="#BFB5A0"/><rect x="${f1(mx - 1.5)}" y="160" width="3" height="26" fill="#D8D0BE"/><path d="M${f1(mx - 3.5)} 160 l3.5 -10 l3.5 10 Z" fill="#5E605C"/><circle cx="${f1(mx)}" cy="149" r="2.2" fill="#5E605C"/>`; }
          else s += tree(btw(r, 10, 30), 194, 1.1, sea, r) + tree(btw(r, 270, 292), 194, 1.1, sea, r);
          perch.push([cx - 46, 30], [cx + 46, 30], [cx, 74]);
          return { s, l, perch };
        } },
      { id: "mozart", zh: "莫札特出生地", see: ["黃色的房子好高，窗戶一排一排很整齊", "莫札特就是在這棟房子裡出生的", "門口總有很多人抬頭看，還一直拍照"], spots: ["頂樓的窗台上", "隔壁招牌的鐵架上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const hx = btw(r, 136, 160), B = 176;
          let w = "";
          for (const [x0, x1, top, col] of [[-10, hx - 92, 96, "#EAD9C0"], [hx - 92, hx - 48, 84, "#DCE3D2"], [hx - 48, hx, 68, "#E9C9B8"], [hx + 62, hx + 112, 62, "#F1E6CF"], [hx + 112, 300, 80, "#D6DDE3"]]) {
            s += `<rect x="${f1(Math.max(0, x0))}" y="${top}" width="${f1(Math.min(300, x1) - Math.max(0, x0))}" height="${B - top}" fill="${col}"/><rect x="${f1(Math.max(0, x0))}" y="${top - 3}" width="${f1(Math.min(300, x1) - Math.max(0, x0))}" height="3" fill="#BFB29A"/>`;
            for (let wy = top + 10; wy < B - 26; wy += 18) for (let wx = x0 + 6; wx < x1 - 8; wx += 13) if (wx > 0 && wx < 294) w += `M${f1(wx)} ${wy}h6v9h-6Z`;
          }
          s += `<path d="${w}" fill="#6E6A60" opacity=".7"/>`;
          let fr = "", gl = ""; for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { const wx = hx + 6 + j * 14, wy = 56 + i * 17; fr += `M${f1(wx - 1.5)} ${wy - 1.5}h10v13h-10Z`; gl += `M${f1(wx)} ${wy}h7v10h-7Z`; }
          let lt = ""; for (let i = 0; i < 17; i++) lt += `M${f1(hx + 6 + i * 3)} 157v3.5`;
          s += `<rect x="${f1(hx)}" y="46" width="62" height="${B - 46}" fill="#E8C24A"/><rect x="${f1(hx - 2)}" y="42" width="66" height="5" fill="#CFA93E"/><path d="${fr}" fill="#F4EEDF"/><path d="${gl}" fill="#5E5A50"/><path d="${lt}" stroke="#4A3F38" stroke-width="1.2"/><path d="M${f1(hx + 24)} ${B}v-12q7 -8 14 0v12Z" fill="#4A3F38"/>`;
          s += `<path d="M${f1(hx + 62)} 116 h16 M${f1(hx + 62)} 122 q8 0 12 -6" stroke="#2E2A28" stroke-width="1.4" fill="none"/><path d="M${f1(hx + 75)} 116 v4" stroke="#2E2A28" stroke-width="1"/><circle cx="${f1(hx + 75)}" cy="124" r="4" fill="#D9A93A" stroke="#2E2A28" stroke-width=".8"/>`;
          s += `<rect x="0" y="${B}" width="300" height="${200 - B}" fill="#BFB29A"/>`;
          const n = Math.floor(btw(r, 2, 4)); for (let i = 0; i < n; i++) { const px = btw(r, 30, 280), py = btw(r, 186, 194), pc = pick(r, ["#3E5568", "#9A4E3C", "#5F7F5A", "#6A4A36"]); s += `<path d="M${f1(px - 3)} ${f1(py)} l1 -9 h4 l1 9 Z" fill="${pc}"/><circle cx="${f1(px)}" cy="${f1(py - 11)}" r="2.2" fill="#E8C9A8"/>`; }
          perch.push([hx + 31, 42], [hx + 23.5, 67.5], [hx + 71, 116]);
          return { s, l, perch };
        } },
      { id: "mirabell", zh: "米拉貝爾花園", see: ["花圃排成整整齊齊的圖案，像一塊地毯", "噴泉旁邊圍著好幾座白色的石雕像", "從花園望過去，可以看到山上的城堡"], spots: ["噴泉旁石雕像的頭上", "遠遠城堡的屋頂上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const fq = btw(r, 135, 160), fx = fq + btw(r, 48, 72), tone = { spring: "#7FA56A", summer: "#5E8C4A", autumn: "#9C8A4A", winter: "#C9CFC9" }[sea];
          const bed = { spring: ["#E0524A", "#F2C94C"], summer: ["#C84A6A", "#F2C94C"], autumn: ["#D9783A", "#E3B04B"], winter: ["#C9B9A6", "#E6E2DA"] }[sea];
          s += hills(120, "#A3B2C0", r, 16) + `<path d="M${f1(fx - 85)} 136 Q${f1(fx - 34)} 94 ${f1(fx)} 93 Q${f1(fx + 34)} 94 ${f1(fx + 85)} 136 Z" fill="${tone}"/>`;
          s += `<rect x="${f1(fx - 26)}" y="84" width="52" height="12" fill="#EFE6D2"/><rect x="${f1(fx - 6)}" y="72" width="14" height="14" fill="#F2EBDA"/><path d="M${f1(fx - 8)} 72 L${f1(fx + 1)} 64 L${f1(fx + 10)} 72 Z" fill="#9A4E3C"/><rect x="${f1(fx + 14)}" y="77" width="6" height="9" fill="#F2EBDA"/><path d="M${f1(fx + 13)} 77 l4 -6 l4 6 Z M${f1(fx - 26)} 84 h52 v-2 h-52 Z" fill="#9A4E3C"/>`;
          let rf = ""; for (let x = -4; x < 300; x += 14) rf += `M${x} 130 l7 -6 l7 6 Z`;
          s += `<rect x="0" y="129" width="300" height="17" fill="#E3D8C2"/><path d="${rf}" fill="#B9876A"/>`;
          const dx = fq - btw(r, 30, 45);
          s += `<rect x="${f1(dx - 8)}" y="114" width="16" height="18" fill="#E7E1D3"/><path d="M${f1(dx - 8)} 116 Q${f1(dx - 8)} 104 ${f1(dx)} 103 Q${f1(dx + 8)} 104 ${f1(dx + 8)} 116 Z M${f1(dx - 17)} 112 q3 -7 6 0 Z M${f1(dx + 11)} 112 q3 -7 6 0 Z" fill="#6FA28D"/><rect x="${f1(dx - 16)}" y="112" width="4" height="20" fill="#E7E1D3"/><rect x="${f1(dx + 12)}" y="112" width="4" height="20" fill="#E7E1D3"/>`;
          for (let x = btw(r, 4, 20); x < 300; x += btw(r, 26, 34)) s += tree(x, 148, .7, sea, r);
          s += `<rect x="0" y="146" width="300" height="54" fill="${sea === "winter" ? "#C3CBBC" : "#A9BF8A"}"/><ellipse cx="${f1(fq)}" cy="168" rx="50" ry="11" fill="#E3D9C0"/><path d="M${f1(fq - 10)} 170 L${f1(fq + 10)} 170 L${f1(fq + 30)} 200 L${f1(fq - 30)} 200 Z M0 150 h300 v3 h-300 Z" fill="#E3D9C0"/>`;
          let b1 = "", b2 = "";
          for (const sd of [-1, 1]) {
            b1 += `M${f1(fq + sd * 34)} 182 L${f1(fq + sd * 120)} 182 L${f1(fq + sd * 150)} 198 L${f1(fq + sd * 42)} 198 Z M${f1(fq + sd * 56)} 156 L${f1(fq + sd * 150)} 156 L${f1(fq + sd * 156)} 162 L${f1(fq + sd * 54)} 162 Z`;
            for (let i = 0; i < 5; i++) b2 += `M${f1(fq + sd * (48 + i * 20))} 190 q${f1(sd * 5)} -6 ${f1(sd * 10)} 0 q${f1(-sd * 5)} 6 ${f1(-sd * 10)} 0 Z`;
          }
          s += `<path d="${b1}" fill="${bed[0]}" stroke="#5F8E4C" stroke-width="1.4"/><path d="${b2}" fill="${bed[1]}"/>`;
          s += `<ellipse cx="${f1(fq)}" cy="168" rx="34" ry="7" fill="#D8D0BE"/><ellipse cx="${f1(fq)}" cy="167.5" rx="30" ry="5" fill="${sea === "winter" ? "#C9D3D8" : "#8FC3D2"}"/><rect x="${f1(fq - 3)}" y="154" width="6" height="13" fill="#D8D0BE"/>`;
          if (sea !== "winter") s += `<path d="M${f1(fq)} 154 q-8 -12 -16 8 M${f1(fq)} 154 q8 -12 16 8 M${f1(fq)} 154 v-12" stroke="#FFFFFF" stroke-opacity=".85" stroke-width="1.6" fill="none"/>`;
          let st = ""; for (const [ox, oy, k] of [[-22, 163, .8], [22, 163, .8], [-38, 172, 1.1], [38, 172, 1.1]]) { const sx = fq + ox; st += `M${f1(sx - 3 * k)} ${oy}h${f1(6 * k)}v${f1(-6 * k)}h${f1(-6 * k)}ZM${f1(sx - 2.5 * k)} ${f1(oy - 6 * k)}l${f1(1 * k)} ${f1(-9 * k)}h${f1(3 * k)}l${f1(1 * k)} ${f1(9 * k)}Z`; s += `<circle cx="${f1(sx)}" cy="${f1(oy - 17 * k)}" r="${f1(2.3 * k)}" fill="#ECE7DC"/>`; }
          s += `<path d="${st}" fill="#ECE7DC"/>`;
          perch.push([fq + 38, 172 - 19.6], [fq - 38, 172 - 19.6], [fx + 1, 64]);
          return { s, l, perch };
        } },
      { id: "getreidegasse", zh: "糧食胡同", see: ["窄窄的街上掛滿了鐵做的招牌", "招牌上有金色的圖案，不認字也看得懂", "兩邊的房子又高又窄，一間挨著一間"], spots: ["鐵招牌的捲花上", "店門口的招牌架上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const o = btw(r, -12, 12), cols = ["#F0D9A6", "#EAC9B0", "#DCE3D2", "#E9DFC9", "#F3E3B5", "#D9C4D4", "#E7C08F"], q = Math.floor(r() * 7);
          const RX = (t) => 300 - (92 - o) * t, LX = (t) => (160 + o) * t, RT = (t) => 52 + 48 * t, LT = (t) => 66 + 34 * t, BT = (t) => 200 - 46 * t, ts = [0, .28, .5, .67, .8, .9, 1];
          s += `<rect x="${f1(LX(1) - 2)}" y="96" width="${f1(RX(1) - LX(1) + 4)}" height="58" fill="#E3D2B0"/><path d="M${f1(LX(1) + 8)} 104h5v7h-5ZM${f1(RX(1) - 13)} 104h5v7h-5ZM${f1(LX(1) + 8)} 120h5v7h-5ZM${f1(RX(1) - 13)} 120h5v7h-5Z" fill="#6E6A60"/>`;
          s += `<path d="M0 200 L${f1(LX(1))} 154 L${f1(RX(1))} 154 L300 200 Z" fill="#BFB29A"/>`;
          let w = "", sh = "", cn = "";
          for (const [X, T, sd] of [[RX, RT, 0], [LX, LT, 3]]) for (let i = 0; i < 6; i++) {
            const t0 = ts[i], t1 = ts[i + 1], h = btw(r, -6, 4), tm = (t0 + t1) / 2, sc = 1 - .65 * tm, xm = X(tm), tp = T(tm) + h * (1 - tm), bt = BT(tm);
            s += `<path d="M${f1(X(t0))} ${f1(T(t0) + h * (1 - t0))} L${f1(X(t1))} ${f1(T(t1) + h * (1 - t1))} L${f1(X(t1))} ${f1(BT(t1))} L${f1(X(t0))} ${f1(BT(t0))} Z" fill="${cols[(i + q + sd) % 7]}"/>`;
            cn += `M${f1(X(t0))} ${f1(T(t0) + h * (1 - t0))} L${f1(X(t1))} ${f1(T(t1) + h * (1 - t1))}`;
            for (const v of [.14, .36, .58]) w += `M${f1(xm - 3.5 * sc)} ${f1(tp + v * (bt - tp))}h${f1(7 * sc)}v${f1(10 * sc)}h${f1(-7 * sc)}Z`;
            sh += `M${f1(xm - 5 * sc)} ${f1(bt - 2 * sc)}v${f1(-18 * sc)}h${f1(10 * sc)}v${f1(18 * sc)}Z`;
          }
          s += `<path d="${w}" fill="#5E5A50" stroke="#F4EEDF" stroke-width=".8"/><path d="${sh}" fill="#4A3F38" opacity=".7"/><path d="${cn}" stroke="#A89A80" stroke-width="1.6" fill="none"/>`;
          let br = "", em = "";
          for (const [X, T, sd, list] of [[RX, RT, -1, [.12, .44, .7]], [LX, LT, 1, [.2, .56]]]) list.forEach((t, j) => {
            const sc = 1.4 * (1 - .65 * t), ax = X(t), ay = T(t) + (j % 2 ? .3 : .42) * (BT(t) - T(t)), L = 24 * sc, ex = ax + sd * L * .78;
            br += `M${f1(ax)} ${f1(ay)}h${f1(sd * L)}M${f1(ax)} ${f1(ay + 7 * sc)}q${f1(sd * L * .5)} 0 ${f1(sd * L * .8)} ${f1(-7 * sc)}M${f1(ex)} ${f1(ay)}v${f1(4 * sc)}`;
            em += (j + (sd > 0 ? 1 : 0)) % 2 ? `M${f1(ex)} ${f1(ay + 4 * sc)}l${f1(5 * sc)} ${f1(6 * sc)}l${f1(-5 * sc)} ${f1(6 * sc)}l${f1(-5 * sc)} ${f1(-6 * sc)}Z` : `M${f1(ex - 5 * sc)} ${f1(ay + 4 * sc)}h${f1(10 * sc)}v${f1(7 * sc)}q${f1(-5 * sc)} ${f1(6 * sc)} ${f1(-10 * sc)} 0Z`;
            if (j === 0) perch.push([ax + sd * L * .35, ay - .5]);
          });
          s += `<path d="${br}" stroke="#2E2A28" stroke-width="2" fill="none"/><path d="${em}" fill="#D9A93A" stroke="#2E2A28" stroke-width="1"/>`;
          const n = Math.floor(btw(r, 2, 5)); for (let i = 0; i < n; i++) { const pt = btw(r, .3, .85), px = LX(pt) + btw(r, .2, .8) * (RX(pt) - LX(pt)), py = 200 - 46 * pt, k = 1.5 - pt, pc = pick(r, ["#3E5568", "#9A4E3C", "#5F7F5A", "#6A4A36"]); s += `<path d="M${f1(px - 3 * k)} ${f1(py)} l${f1(k)} ${f1(-9 * k)} h${f1(4 * k)} l${f1(k)} ${f1(9 * k)} Z" fill="${pc}"/><circle cx="${f1(px)}" cy="${f1(py - 11 * k)}" r="${f1(2.2 * k)}" fill="#E8C9A8"/>`; }
          perch.push([(LX(1) + RX(1)) / 2, 96]);
          return { s, l, perch };
        } },
      { id: "salzach", zh: "薩爾察河與老城", see: ["河水是淡綠色的，流得很快", "人行橋的欄杆上掛滿了情人鎖", "抬頭就看到山上的城堡和老城的圓頂"], spots: ["人行橋的欄杆上", "河邊的路燈上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const fx = btw(r, 196, 224), dx = fx - btw(r, 60, 72), tone = { spring: "#7FA56A", summer: "#5E8C4A", autumn: "#9C8A4A", winter: "#C9CFC9" }[sea], gr = "#6FA28D";
          s += hills(112, "#A3B2C0", r, 16) + `<path d="M${f1(fx - 95)} 140 Q${f1(fx - 45)} 84 ${f1(fx)} 82 Q${f1(fx + 40)} 84 300 110 L300 140 Z" fill="${tone}"/>`;
          s += `<rect x="${f1(fx - 34)}" y="72" width="68" height="18" fill="#EFE6D2"/><rect x="${f1(fx - 10)}" y="56" width="20" height="18" fill="#F2EBDA"/><path d="M${f1(fx - 13)} 56 L${f1(fx - 4)} 46 L${f1(fx + 6)} 46 L${f1(fx + 13)} 56 Z" fill="#9A4E3C"/><rect x="${f1(fx + 18)}" y="62" width="10" height="12" fill="#F2EBDA"/><path d="M${f1(fx + 17)} 62 l6 -9 l6 9 Z" fill="#9A4E3C"/><path d="M${f1(fx - 30)} 89 L${f1(fx - 20)} 106 L${f1(fx - 6)} 98 L${f1(fx + 8)} 108 L${f1(fx + 22)} 98 L${f1(fx + 32)} 89 Z" fill="#A39C8E"/>`;
          s += houses(140, 13, r, ["#F0D9A6", "#EAC9B0", "#DCE3D2", "#E9DFC9", "#F3E3B5"], false).s;
          s += `<rect x="${f1(dx - 8)}" y="104" width="16" height="36" fill="#E7E1D3"/><path d="M${f1(dx - 9)} 106 Q${f1(dx - 9)} 90 ${f1(dx)} 88 Q${f1(dx + 9)} 90 ${f1(dx + 9)} 106 Z" fill="${gr}"/><rect x="${f1(dx - 16)}" y="94" width="7" height="46" fill="#E7E1D3"/><rect x="${f1(dx + 9)}" y="94" width="7" height="46" fill="#E7E1D3"/><path d="M${f1(dx - 17)} 94 q4.5 -10 9 0 Z M${f1(dx + 8)} 94 q4.5 -10 9 0 Z" fill="${gr}"/>`;
          s += `<rect x="${f1(dx - 52)}" y="106" width="18" height="34" fill="#E7E1D3"/><path d="M${f1(dx - 54)} 108 Q${f1(dx - 54)} 94 ${f1(dx - 43)} 92 Q${f1(dx - 32)} 94 ${f1(dx - 32)} 108 Z" fill="${gr}"/>`;
          s += `<path d="M0 140 L118 140 L8 200 L0 200 Z" fill="#A7B38F"/><path d="M188 140 L300 140 L300 200 L292 200 Z" fill="#BDB2A0"/><path d="M118 140 L188 140 L292 200 L8 200 Z" fill="#76A498"/><path d="M118 140 L188 140 L190 142 L116 142 Z" fill="#A8CFC4"/>`;
          let rp = ""; for (let i = 0; i < 8; i++) { const yy = btw(r, 164, 196), k = (yy - 140) / 60, xx = 118 - 110 * k + btw(r, .1, .8) * (70 + 214 * k - 20); rp += `M${f1(xx)} ${f1(yy)} q4 -2 8 0 t8 0`; }
          s += `<path d="${rp}" stroke="#FFFFFF" stroke-opacity=".5" stroke-width=".9" fill="none"/>`;
          for (const t of [.3, .62, .9]) s += tree(118 - 110 * t - 4, 140 + 60 * t, .8 + t * .5, sea, r);
          let po = "", lk = ["", "", ""]; for (let x = 82; x <= 222; x += 8) po += `M${x} 150v6`; for (let i = 0; i < 26; i++) lk[i % 3] += `M${f1(btw(r, 84, 220))} ${f1(btw(r, 151, 154))}h2v2h-2Z`;
          s += `<path d="M80 150h144${po}" stroke="#5E646A" stroke-width="1.2"/><rect x="78" y="156" width="148" height="3.5" fill="#7A7F84"/><path d="M80 159.5 Q152 166 224 159.5" stroke="#7A7F84" stroke-width="1.4" fill="none"/><path d="${lk[0]}" fill="#C8302A"/><path d="${lk[1]}" fill="#E5BF55"/><path d="${lk[2]}" fill="#3F6FA8"/>`;
          const lx = btw(r, 252, 282);
          s += `<path d="M${f1(lx)} 194 v-40" stroke="#3A3530" stroke-width="1.8"/><path d="M${f1(lx - 4)} 154 h8 l-2 -6 h-4 Z" fill="#3A3530"/>`;
          perch.push([150, 149.5], [lx, 147.5], [fx - 2, 46]);
          return { s, l, perch };
        } },
    ],
  },
  budapest: {
    zh: "布達佩斯", de: "Budapest", gift: "一小包紅椒粉",
    sights: [
      { id: "parlament", zh: "國會大廈", see: ["國會大廈沿著多瑙河排得好長好長", "紅色的圓頂旁邊站著好多細細的小尖塔", "白色的牆上雕滿了細細的花紋"], spots: ["紅色圓頂的尖頂上", "河岸邊的小尖塔上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const px = btw(r, 150, 172), st = "#E9DEC6", rd = "#A9473A", x0 = Math.max(0, px - 140), x1 = Math.min(300, px + 132);
          s += `<path d="M${f1(x0)} 118 L${f1(x0 + 4)} 110 L${f1(x1 - 4)} 110 L${f1(x1)} 118 Z" fill="${rd}"/><rect x="${f1(x0)}" y="118" width="${f1(x1 - x0)}" height="34" fill="${st}"/>`;
          let pn = "", wn = ""; for (let x = x0 + 4; x < x1 - 4; x += 8) pn += `M${f1(x)} 118l1.5 -10l1.5 10Z`; for (let x = x0 + 3; x < x1 - 4; x += 6) wn += `M${f1(x)} 124h2v8h-2ZM${f1(x)} 138h2v8h-2Z`;
          s += `<path d="${pn}" fill="#DCCFB2"/><path d="${wn}" fill="#7A6A58" opacity=".7"/>`;
          let tw = ""; const tl = [];
          for (const d of [-108, -62, 56, 102]) { const tx = px + d; if (tx < 8 || tx > 292) continue; tl.push(tx); s += `<rect x="${f1(tx - 7)}" y="100" width="14" height="52" fill="${st}"/>`; tw += `M${f1(tx - 8)} 100 L${f1(tx)} 82 L${f1(tx + 8)} 100 Z`; }
          s += `<rect x="${f1(px - 32)}" y="98" width="64" height="54" fill="${st}"/><path d="M${f1(px - 34)} 98 L${f1(px - 30)} 92 L${f1(px + 30)} 92 L${f1(px + 34)} 98 Z${tw}" fill="${rd}"/>`;
          s += `<rect x="${f1(px - 18)}" y="74" width="36" height="26" fill="${st}"/><path d="M${f1(px - 12)} 96v-14l2 -3l2 3v14ZM${f1(px - 3)} 96v-14l2 -3l2 3v14ZM${f1(px + 6)} 96v-14l2 -3l2 3v14ZM${f1(px - 24)} 122v-14l2 -3l2 3v14ZM${f1(px + 20)} 122v-14l2 -3l2 3v14Z" fill="#7A6A58"/>`;
          s += `<path d="M${f1(px - 20)} 78 Q${f1(px - 21)} 52 ${f1(px)} 40 Q${f1(px + 21)} 52 ${f1(px + 20)} 78 Z" fill="${rd}"/><path d="M${f1(px - 10)} 77 Q${f1(px - 10)} 54 ${f1(px)} 41 Q${f1(px + 10)} 54 ${f1(px + 10)} 77 M${f1(px)} 41 v36" stroke="#8A3A30" stroke-width="1" fill="none"/><path d="M${f1(px - 2.4)} 42 L${f1(px)} 22 L${f1(px + 2.4)} 42 Z M${f1(px - 23)} 76 l3 -16 l3 16 Z M${f1(px + 17)} 76 l3 -16 l3 16 Z" fill="#8A3A30"/>`;
          s += `<rect x="0" y="150" width="300" height="8" fill="#BDB2A0"/>` + water(158, "#9CB9C6", "#5F8197", r);
          if (r() < .5) s += boat(btw(r, 20, 220), btw(r, 176, 188), 1, false);
          perch.push([px, 22.5], [tl[1] ?? px - 62, 82.5], [px + 70, 109.5]);
          return { s, l, perch };
        } },
      { id: "lanchid", zh: "鎖鏈橋", see: ["兩座石塔中間掛著粗粗的大鐵鍊", "橋頭兩邊各蹲著一隻石頭獅子", "橋的這頭是布達，那頭是佩斯"], spots: ["石塔的頂上", "鐵鍊垂得最低的地方", "石獅子的頭上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const t1 = btw(r, 92, 108), t2 = t1 + btw(r, 112, 126), mid = (t1 + t2) / 2, dk = 136, st = "#CFC2A6";
          s += `<path d="M110 142 Q170 104 230 100 Q270 98 300 104 L300 142 Z" fill="#9AAB8A"/><rect x="196" y="92" width="84" height="16" fill="#DCD3BE"/><rect x="230" y="82" width="16" height="11" fill="#DCD3BE"/><path d="M229 84 Q229 71 238 69 Q247 71 247 84 Z" fill="#7E9A90"/><path d="M238 69 v-5" stroke="#7E9A90" stroke-width="1.4"/>`;
          let pw = ""; for (let x = 200; x < 278; x += 7) pw += `M${x} 97h2.5v5h-2.5Z`;
          s += `<path d="${pw}" fill="#8C8270"/>` + water(140, "#9CB9C6", "#5F8197", r);
          s += `<rect x="${f1(t1 - 18)}" y="${dk}" width="36" height="34" fill="#BFB29A"/><rect x="${f1(t2 - 18)}" y="${dk}" width="36" height="34" fill="#BFB29A"/><rect x="0" y="${dk}" width="300" height="5" fill="#7A756C"/><path d="M0 ${dk - 3}h300" stroke="#5E5A54" stroke-width="1"/>`;
          for (const tx of [t1, t2]) s += `<path d="M${f1(tx - 15)} ${dk + 4} L${f1(tx - 15)} 72 L${f1(tx + 15)} 72 L${f1(tx + 15)} ${dk + 4} Z M${f1(tx - 8)} ${dk} L${f1(tx - 8)} 104 Q${f1(tx)} 92 ${f1(tx + 8)} 104 L${f1(tx + 8)} ${dk} Z" fill="${st}" fill-rule="evenodd"/><rect x="${f1(tx - 17)}" y="66" width="34" height="6" fill="#BFB29A"/><rect x="${f1(tx - 12)}" y="62" width="24" height="4" fill="${st}"/><path d="M${f1(tx - 12)} 76v56M${f1(tx + 12)} 76v56" stroke="#BFB29A" stroke-width="1.2"/>`;
          let ch = "", hg = "";
          for (const o of [0, 4]) ch += `M0 ${128 + o} Q${f1(t1 * .6)} ${126 + o} ${f1(t1)} ${68 + o} Q${f1(mid)} ${190 + o} ${f1(t2)} ${68 + o} Q${f1(t2 + (300 - t2) * .4)} ${126 + o} 300 ${128 + o}`;
          for (let i = 1; i < 14; i++) { const tt = i / 14, y = (1 - tt) * (1 - tt) * 72 + 2 * tt * (1 - tt) * 194 + tt * tt * 72; if (y < dk - 3) hg += `M${f1(t1 + (t2 - t1) * tt)} ${f1(y)}V${dk - 3}`; }
          s += `<path d="${hg}" stroke="#3E4A4A" stroke-width=".8"/><path d="${ch}" stroke="#3E4A4A" stroke-width="2" fill="none"/>`;
          let ln = ""; for (const [lx, sd] of [[22, 1], [278, -1]]) ln += `M${lx - 12} ${dk} v-8 h24 v8 Z M${f1(lx - 10 * sd)} ${dk - 8} L${f1(lx - 10 * sd)} ${dk - 13} Q${f1(lx - 4 * sd)} ${dk - 17} ${f1(lx + 3 * sd)} ${dk - 15} L${f1(lx + 5 * sd)} ${dk - 21} Q${f1(lx + 11 * sd)} ${dk - 23} ${f1(lx + 12 * sd)} ${dk - 16} L${f1(lx + 11 * sd)} ${dk - 8} Z`;
          s += `<path d="${ln}" fill="#B8AE9A"/>`;
          perch.push([t1, 61.5], [t2, 61.5], [mid, 129.5]);
          return { s, l, perch };
        } },
      { id: "halaszbastya", zh: "漁夫堡", see: ["白色的小塔都戴著尖尖的帽子", "從拱門往下看，多瑙河和國會大廈都在眼前", "白色的石頭走廊彎來彎去，像童話裡的城牆"], spots: ["白色尖塔的頂上", "拱廊的石欄杆上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const bx = btw(r, 78, 98), st = "#ECE7DC", cone = "#ADA28B", dk = "#6A6458";
          s += tree(btw(r, 8, 30), 176, btw(r, 1.1, 1.4), sea, r);
          s += `<path d="M${f1(bx - 66)} 176 L${f1(bx - 30)} 140 L${f1(bx - 24)} 140 L${f1(bx - 24)} 176 Z" fill="#E2DCCF"/>`;
          let stp = ""; for (let i = 1; i < 9; i++) stp += `M${f1(bx - 66 + i * 4.2)} ${176 - i * 4.2}h${f1(42 - i * 4.2)}`;
          s += `<path d="${stp}" stroke="#CFC8B8" stroke-width=".9"/><rect x="${f1(bx - 26)}" y="140" width="${f1(326 - bx)}" height="36" fill="${st}"/><rect x="${f1(bx - 10)}" y="120" width="${f1(302 - bx)}" height="20" fill="${st}"/><path d="M${f1(bx - 26)} 140h${f1(326 - bx)}M${f1(bx - 12)} 120h${f1(304 - bx)}" stroke="#CFC8B8" stroke-width="1.4"/>`;
          let ar = ""; for (let x = bx - 20; x < 290; x += 16) ar += `M${f1(x)} 170v-16q5 -8 10 0v16Z`; for (let x = bx - 4; x < 290; x += 10) ar += `M${f1(x)} 138v-10q3 -5 6 0v10Z`;
          s += `<path d="${ar}" fill="${dk}"/>`;
          let cn = "", wn = "";
          for (const [d, w, top, ch] of [[0, 18, 96, 22], [40, 16, 100, 20], [80, 24, 74, 36], [124, 16, 98, 20], [166, 18, 94, 22]]) {
            const x = bx + d; s += `<rect x="${f1(x - w / 2)}" y="${top}" width="${w}" height="${140 - top}" fill="${st}"/><path d="M${f1(x - w / 2)} ${top}v${140 - top}M${f1(x + w / 2)} ${top}v${140 - top}" stroke="#C6BEAC" stroke-width="1"/>`;
            cn += `M${f1(x - w / 2 - 2)} ${top} Q${f1(x - w / 5)} ${f1(top - ch * .45)} ${f1(x)} ${top - ch} Q${f1(x + w / 5)} ${f1(top - ch * .45)} ${f1(x + w / 2 + 2)} ${top} Z`;
            wn += `M${f1(x - 2.5)} ${top + 18}v-9q2.5 -4 5 0v9Z`;
          }
          s += `<path d="${cn}" fill="${cone}"/><path d="${wn}" fill="${dk}"/>`;
          s += `<rect x="0" y="176" width="300" height="24" fill="#C9BBA0"/>`;
          perch.push([bx + 80, 37.5], [bx + 124, 77.5], [bx + 60, 119.5]);
          return { s, l, perch };
        } },
      { id: "matyas", zh: "馬加什教堂", see: ["屋頂鋪著彩色的磁磚，排成一格一格的菱形", "白色的鐘塔細細高高，尖頂像一根針", "教堂就在漁夫堡的旁邊，走幾步就到了"], spots: ["彩色屋頂的屋脊上", "鐘塔的尖頂上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const mx = btw(r, 98, 114), B = 172, nw = 104, st = "#E9E3D6", tx = mx + nw + 10, dc = ["#3F7A5A", "#E5BF55", "#7A3E2E"];
          s += houses(B, 10, r, ["#F0D9A6", "#EAC9B0", "#E9DFC9", "#F3E3B5"], false).s;
          s += `<rect x="${f1(mx)}" y="${B - 44}" width="${nw}" height="44" fill="${st}"/>`;
          let gw = ""; for (let i = 0; i < 6; i++) gw += `M${f1(mx + 10 + i * 16)} ${B - 8}v-22l3 -6l3 6v22Z`;
          s += `<path d="${gw}" fill="#5A5A66"/><path d="M${f1(mx - 3)} ${B - 44} L${f1(mx + 16)} ${B - 88} L${f1(mx + nw - 16)} ${B - 88} L${f1(mx + nw + 3)} ${B - 44} Z" fill="#C9813A"/>`;
          const dm = ["", "", ""];
          for (let j = 0; j < 5; j++) { const y = B - 51 - j * 8, t = (B - 44 - y) / 44, xl = mx - 3 + t * 19 + 5, xr = mx + nw + 3 - t * 19 - 5; let i = 0; for (let x = xl + (j % 2) * 4.5; x < xr; x += 9, i++) dm[(i + j) % 3] += `M${f1(x)} ${y - 4}l4 4l-4 4l-4 -4Z`; }
          s += dm.map((d, i) => `<path d="${d}" fill="${dc[i]}"/>`).join("");
          s += `<rect x="${f1(mx - 6)}" y="${B - 70}" width="16" height="70" fill="${st}"/><path d="M${f1(mx - 8)} ${B - 70} L${f1(mx + 2)} ${B - 94} L${f1(mx + 12)} ${B - 70} Z" fill="#3F7A5A"/><path d="M${f1(mx - 4)} ${B - 79} h12 M${f1(mx - 1)} ${B - 86} h6" stroke="#E5BF55" stroke-width="1.6"/>`;
          s += `<rect x="${f1(tx - 11)}" y="${B - 100}" width="22" height="100" fill="${st}"/><rect x="${f1(tx - 9)}" y="${B - 118}" width="18" height="18" fill="${st}"/><path d="M${f1(tx - 6)} ${B - 102}v-12q3 -5 6 0v12ZM${f1(tx + 1)} ${B - 102}v-12q2.5 -5 5 0v12ZM${f1(tx - 2)} ${B - 50}v-14q2 -4 4 0v14ZM${f1(tx - 2)} ${B - 80}v-12q2 -4 4 0v12Z" fill="#5A5A66"/>`;
          s += `<path d="M${f1(tx - 12)} ${B - 100} l1.5 -16 l1.5 16 Z M${f1(tx + 9)} ${B - 100} l1.5 -16 l1.5 16 Z M${f1(tx - 9)} ${B - 118} L${f1(tx)} ${B - 144} L${f1(tx + 9)} ${B - 118} Z" fill="#D2CABA"/><path d="M${f1(tx - 6)} ${B - 124} h12 M${f1(tx - 4)} ${B - 131} h8" stroke="#C9813A" stroke-width="1.4"/><path d="M${f1(tx)} ${B - 144} v-6" stroke="#8C7E66" stroke-width="1.3"/>`;
          s += `<rect x="0" y="${B}" width="300" height="${200 - B}" fill="#C9BBA0"/>`;
          if (r() < .5) s += tree(btw(r, 12, 40), 194, 1.1, sea, r);
          perch.push([tx, B - 149], [mx + nw / 2, B - 88.5], [mx + 2, B - 94]);
          return { s, l, perch };
        } },
      { id: "szechenyi", zh: "塞切尼溫泉", see: ["藍色的大池子一直冒著白白的熱氣", "有人泡在溫泉裡，一邊下西洋棋", "黃色的建築把整個池子圍起來"], spots: ["黃色屋頂的小圓頂上", "池邊的石欄杆上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const cx = btw(r, 145, 168), ye = "#E6C25A", wh = "#F1ECE0", gr = "#6FA28D", wt = sea === "winter", pl = Math.max(32, cx - 104), pr = Math.min(268, cx + 104);
          for (let i = 0; i < 5; i++) s += tree(btw(r, 10, 290), 112, btw(r, 1, 1.3), sea, r);
          s += `<path d="M12 106 L18 100 L282 100 L288 106 Z" fill="#8A8478"/><rect x="14" y="110" width="272" height="42" fill="${ye}"/><rect x="12" y="105" width="276" height="5" fill="${wh}"/>`;
          let wn = "", pi = ""; for (let x = 20; x < 282; x += 12) { if (Math.abs(x + 3 - cx) < 36) continue; wn += `M${x} 142v-12q3 -5 6 0v12ZM${x} 114h6v6h-6Z`; } for (let x = 26; x < 280; x += 24) pi += `M${x} 110v42`;
          s += `<path d="${pi}" stroke="${wh}" stroke-width="1.5"/>`;
          for (const p of [pl, pr]) s += `<rect x="${f1(p - 16)}" y="98" width="32" height="54" fill="${ye}"/><rect x="${f1(p - 17)}" y="96" width="34" height="4" fill="${wh}"/><path d="M${f1(p - 12)} 96 Q${f1(p - 12)} 82 ${f1(p)} 80 Q${f1(p + 12)} 82 ${f1(p + 12)} 96 Z" fill="${gr}"/><path d="M${f1(p)} 80 v-6" stroke="${gr}" stroke-width="1.6"/>`;
          s += `<rect x="${f1(cx - 32)}" y="92" width="64" height="60" fill="${ye}"/><rect x="${f1(cx - 34)}" y="88" width="68" height="5" fill="${wh}"/><rect x="${f1(cx - 14)}" y="76" width="28" height="13" fill="${ye}"/><path d="M${f1(cx - 16)} 78 Q${f1(cx - 16)} 58 ${f1(cx)} 56 Q${f1(cx + 16)} 58 ${f1(cx + 16)} 78 Z" fill="${gr}"/><rect x="${f1(cx - 3)}" y="48" width="6" height="9" fill="${wh}"/><path d="M${f1(cx - 4)} 48 q4 -6 8 0 Z" fill="${gr}"/>`;
          wn += `M${f1(cx - 22)} 128v-14q3 -5 6 0v14ZM${f1(cx + 16)} 128v-14q3 -5 6 0v14Z`;
          s += `<path d="${wn}" fill="#5E6B6E"/><path d="M${f1(cx - 9)} 152v-22q9 -12 18 0v22Z" fill="#4A3F38"/>`;
          if (wt) s += `<path d="M18 102 L20 100 L280 100 L282 102 Z M${f1(cx - 12)} 66 Q${f1(cx)} 54 ${f1(cx + 12)} 66 Q${f1(cx)} 60 ${f1(cx - 12)} 66 Z" fill="#FFFFFF"/>`;
          s += `<rect x="0" y="152" width="300" height="6" fill="#E9E1CF"/><rect x="0" y="158" width="300" height="36" fill="#5FB8C8"/><rect x="0" y="158" width="300" height="4" fill="#9ED7DE"/><rect x="0" y="194" width="300" height="6" fill="#E9E1CF"/>`;
          let hd = "", rp = ""; for (let i = 0; i < 7; i++) { const hx = btw(r, 14, 286), hy = btw(r, 168, 188); hd += `M${f1(hx - 2.6)} ${f1(hy)}a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0Z`; rp += `M${f1(hx - 6)} ${f1(hy + 3)}q6 3 12 0`; }
          let sm = ""; for (let i = 0, n = wt ? 12 : 7; i < n; i++) { const x = btw(r, 10, 290), y = btw(r, 168, 192); sm += `M${f1(x)} ${f1(y)}q-6 -6 0 -12t0 -12`; }
          s += `<path d="${rp}" stroke="#FFFFFF" stroke-opacity=".6" stroke-width="1" fill="none"/><path d="${hd}" fill="#E8C9A8"/><path d="${sm}" stroke="#FFFFFF" stroke-opacity="${wt ? .7 : .45}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
          perch.push([cx, 47.5], [pl, 74], [btw(r, 20, 280), 152]);
          return { s, l, perch };
        } },
      { id: "basilika", zh: "聖伊什特萬聖殿", see: ["大圓頂的兩邊各站著一座鐘塔", "門口的大台階上坐著休息的人", "爬上圓頂外面的走道，可以看到整個佩斯"], spots: ["圓頂上的小燈籠旁", "鐘塔的小圓頂上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const cx = btw(r, 160, 180), B = 180, st = "#E2D8C2", dm = "#5F7F74", Y = (d) => B - d;
          s += `<rect x="0" y="${Y(64)}" width="${f1(cx - 72)}" height="64" fill="#D8CFC0"/><rect x="${f1(cx + 72)}" y="${Y(58)}" width="${f1(228 - cx)}" height="58" fill="#D6D0C4"/>`;
          let nw = ""; for (let y = Y(54); y < B - 12; y += 16) { for (let x = 6; x < cx - 80; x += 12) nw += `M${f1(x)} ${y}h5v8h-5Z`; for (let x = cx + 80; x < 294; x += 12) nw += `M${f1(x)} ${y + 6}h5v8h-5Z`; }
          s += `<path d="${nw}" fill="#7E7A70" opacity=".6"/>`;
          let dc = ""; for (let i = 0; i < 7; i++) dc += `M${f1(cx - 22 + i * 7.3)} ${Y(100)}v30`;
          s += `<rect x="${f1(cx - 26)}" y="${Y(102)}" width="52" height="34" fill="${st}"/><path d="${dc}" stroke="#F1EADB" stroke-width="2.4"/><path d="M${f1(cx - 28)} ${Y(100)} Q${f1(cx - 28)} ${Y(130)} ${f1(cx)} ${Y(132)} Q${f1(cx + 28)} ${Y(130)} ${f1(cx + 28)} ${Y(100)} Z" fill="${dm}"/><path d="M${f1(cx - 14)} ${Y(101)} Q${f1(cx - 14)} ${Y(126)} ${f1(cx)} ${Y(131)} Q${f1(cx + 14)} ${Y(126)} ${f1(cx + 14)} ${Y(101)}" stroke="#4E6A60" stroke-width="1.1" fill="none"/>`;
          s += `<rect x="${f1(cx - 5)}" y="${Y(144)}" width="10" height="13" fill="${st}"/><path d="M${f1(cx - 6)} ${Y(144)} q6 -8 12 0 Z" fill="${dm}"/><path d="M${f1(cx)} ${Y(151)} v-7 M${f1(cx - 2.5)} ${Y(155.5)} h5" stroke="#B89A55" stroke-width="1.2"/>`;
          s += `<rect x="${f1(cx - 44)}" y="${Y(70)}" width="88" height="70" fill="${st}"/>`;
          let tw = "";
          for (const tx of [cx - 58, cx + 58]) { s += `<rect x="${f1(tx - 13)}" y="${Y(98)}" width="26" height="98" fill="${st}"/><rect x="${f1(tx - 14)}" y="${Y(74)}" width="28" height="3" fill="#CFC3A8"/><path d="M${f1(tx - 12)} ${Y(98)} Q${f1(tx - 12)} ${Y(112)} ${f1(tx)} ${Y(114)} Q${f1(tx + 12)} ${Y(112)} ${f1(tx + 12)} ${Y(98)} Z" fill="${dm}"/><rect x="${f1(tx - 3)}" y="${Y(122)}" width="6" height="9" fill="${st}"/><path d="M${f1(tx - 4)} ${Y(122)} q4 -6 8 0 Z" fill="${dm}"/>`; tw += `M${f1(tx - 5)} ${Y(76)}v-12q5 -7 10 0v12ZM${f1(tx - 3)} ${Y(30)}v-14q3 -5 6 0v14Z`; }
          s += `<path d="${tw}" fill="#5A4E40" opacity=".8"/>`;
          let co = ""; for (let i = 0; i < 6; i++) co += `M${f1(cx - 27 + i * 10.4)} ${Y(6)}v-46h4v46Z`;
          s += `<rect x="${f1(cx - 28)}" y="${Y(52)}" width="56" height="46" fill="#8C7E68"/><path d="${co}" fill="#EFE7D6"/><rect x="${f1(cx - 31)}" y="${Y(57)}" width="62" height="5" fill="#EFE7D6"/><path d="M${f1(cx - 33)} ${Y(57)} L${f1(cx)} ${Y(72)} L${f1(cx + 33)} ${Y(57)} Z" fill="#EFE7D6" stroke="#CFC3A8" stroke-width="1"/><rect x="${f1(cx - 50)}" y="${Y(6)}" width="100" height="6" fill="#D6CBB2"/>`;
          s += `<rect x="0" y="${B}" width="300" height="${200 - B}" fill="#C9BBA0"/>`;
          const n = Math.floor(btw(r, 1, 4)); for (let i = 0; i < n; i++) { const px = cx + btw(r, -44, 44), pc = pick(r, ["#3E5568", "#9A4E3C", "#5F7F5A"]); s += `<path d="M${f1(px - 2.5)} ${B - 1} l.8 -6 h3.4 l.8 6 Z" fill="${pc}"/><circle cx="${f1(px)}" cy="${B - 8.5}" r="1.9" fill="#E8C9A8"/>`; }
          perch.push([cx, Y(152)], [cx - 58, Y(128)], [cx + 58, Y(128)]);
          return { s, l, perch };
        } },
    ],
  },
};
