var CITIES_PART = {
  lisboa: {
    zh: "里斯本", de: "Lisboa", gift: "一塊藍白色的磁磚",
    sights: [
      { id: "tram28", zh: "28號電車",
        see: ["黃色的電車叮叮噹噹爬上窄窄的坡", "車身擦過兩旁的牆，好像伸手就能摸到", "電線在頭頂上交錯，電車沿著它慢慢轉彎"],
        spots: ["電車的車頂上", "頭頂的電線上", "坡道旁的屋簷上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const k = btw(r, .13, .17), Y = (x, y) => y - (x - 150) * k;
          const q = (x, y, w, h, f) => `<path d="M${f1(x)} ${f1(Y(x, y))} L${f1(x + w)} ${f1(Y(x + w, y))} L${f1(x + w)} ${f1(Y(x + w, y + h))} L${f1(x)} ${f1(Y(x, y + h))} Z" fill="${f}"/>`;
          let x = btw(r, -12, 0), roof = null;
          while (x < 300) {
            const w = btw(r, 34, 46), h = btw(r, 60, 78), top = Y(x + w, 172) - h, col = pick(r, ["#E9C46A", "#E8B9A0", "#F0E8D8", "#7FA4C4", "#DC9A68"]);
            s += `<rect x="${f1(x)}" y="${f1(top)}" width="${f1(w)}" height="${f1(Y(x, 172) - top + 1)}" fill="${col}"/><rect x="${f1(x - 1)}" y="${f1(top - 3)}" width="${f1(w + 2)}" height="3.5" fill="#B05A3A"/>`;
            if (col === "#7FA4C4") { let d = ""; for (let yy = top + 4; yy < Y(x, 172); yy += 4) d += `M${f1(x + 1)} ${f1(yy)} h${f1(w - 2)} `; s += `<path d="${d}" stroke="#EEF1F2" stroke-width="1.2" stroke-dasharray="1.4 2.6"/>`; }
            let d = "";
            for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) { const wx = x + 8 + i * (w - 21), wy = top + 8 + j * 16; d += `M${f1(wx)} ${f1(wy)} h5 v9 h-5 Z `; }
            s += `<path d="${d}" fill="#4A3F38" opacity=".65"/>`;
            if (x + w / 2 > 190 && x + w / 2 < 285 && !roof) roof = [x + w / 2, top - 3];
            x += w;
          }
          s += `<path d="M0 ${f1(Y(0, 171))} L300 ${f1(Y(300, 171))} L300 200 L0 200 Z" fill="#A89E90"/>` + q(-5, 171, 310, 3, "#C9BFAE");
          s += `<path d="M0 ${f1(Y(0, 185))} L300 ${f1(Y(300, 185))} M0 ${f1(Y(0, 189))} L300 ${f1(Y(300, 189))}" stroke="#6E665C" stroke-width="1.2"/>`;
          const tx = btw(r, 130, 160);
          s += q(tx + 4, 145, 84, 5, "#7E7A72") + q(tx, 150, 92, 33, "#E8B22E") + q(tx, 150, 92, 6, "#F3EBD6") + q(tx, 179, 92, 4, "#4A423A");
          for (let i = 0; i < 6; i++) s += q(tx + 5 + i * 14.4, 158, 10, 10, "#CFE0E6");
          s += q(tx + 2, 170, 88, 1.5, "#B98A1E");
          s += `<circle cx="${f1(tx + 18)}" cy="${f1(Y(tx + 18, 185))}" r="3.6" fill="#2E2A26"/><circle cx="${f1(tx + 74)}" cy="${f1(Y(tx + 74, 185))}" r="3.6" fill="#2E2A26"/><circle cx="${f1(tx + 89)}" cy="${f1(Y(tx + 89, 174))}" r="1.9" fill="#FFF3C4"/>`;
          s += `<path d="M0 ${f1(Y(0, 116))} L300 ${f1(Y(300, 116))}" stroke="#3A3530" stroke-width="1"/><path d="M${f1(tx + 30)} ${f1(Y(tx + 30, 145))} L${f1(tx + 56)} ${f1(Y(tx + 56, 116))}" stroke="#3A3530" stroke-width="1.4"/>`;
          perch.push([tx + 70, Y(tx + 70, 145)], roof || [262, Y(262, 116)]);
          return { s, l, perch };
        } },
      { id: "belem", zh: "貝倫塔",
        see: ["白色的石塔站在河邊的水裡", "塔的角落有小小的圓頂瞭望台", "以前的船從這裡出發，開往很遠的海"],
        spots: ["瞭望台的圓頂上", "城垛的缺口上"],
        draw(c) {
          const { r } = c; let s = hills(146, "#A9B4A2", r, 6), l = ""; const perch = [];
          s += water(150, "#A3C6CC", "#5F8FA0", r);
          const x = btw(r, 160, 190), k = btw(r, .94, 1.06), st = "#EFE8D8", sh = "#CFC3AB", dk = "#6F655A";
          const B = 170, bt = B - 34 * k, T = bt - 74 * k, hw = 17 * k, bw = 48 * k;
          const dome = (cx, y0, w, d) => `<path d="M${f1(cx - w / 2)} ${f1(y0)} Q${f1(cx)} ${f1(y0 - 2 * d)} ${f1(cx + w / 2)} ${f1(y0)} Z" fill="${st}" stroke="${sh}" stroke-width=".8"/>`;
          const merl = (x0, x1, y) => { let d = ""; for (let mx = x0; mx < x1 - 4; mx += 8 * k) d += `M${f1(mx)} ${f1(y)} v${f1(-5 * k)} q${f1(2.5 * k)} ${f1(-3.5 * k)} ${f1(5 * k)} 0 v${f1(5 * k)} Z `; return `<path d="${d}" fill="${st}"/>`; };
          s += `<path d="M${f1(x - bw - 40)} ${B - 4} h40 v3 h-40 Z" fill="#B9AE98"/>`;
          s += `<rect x="${f1(x - bw)}" y="${f1(bt)}" width="${f1(bw * 2)}" height="${f1(B - bt)}" fill="${st}"/><rect x="${f1(x + bw * .5)}" y="${f1(bt)}" width="${f1(bw * .5)}" height="${f1(B - bt)}" fill="${sh}"/>`;
          let g = ""; for (let i = 0; i < 6; i++) { const gx = x - bw + 8 * k + i * 15 * k; g += `M${f1(gx)} ${f1(bt + 22 * k)} v${f1(-6 * k)} q${f1(2.5 * k)} ${f1(-4 * k)} ${f1(5 * k)} 0 v${f1(6 * k)} Z `; }
          s += `<path d="${g}" fill="${dk}"/>` + merl(x - bw + 2, x + bw, bt);
          for (const sx of [x - bw, x + bw]) s += `<rect x="${f1(sx - 4 * k)}" y="${f1(bt - 12 * k)}" width="${f1(8 * k)}" height="${f1(16 * k)}" fill="${st}" stroke="${sh}" stroke-width=".8"/>` + dome(sx, bt - 12 * k, 9 * k, 6 * k);
          s += `<rect x="${f1(x - hw)}" y="${f1(T)}" width="${f1(hw * 2)}" height="${f1(bt - T)}" fill="${st}"/><rect x="${f1(x + hw * .35)}" y="${f1(T)}" width="${f1(hw * .65)}" height="${f1(bt - T)}" fill="${sh}"/>`;
          let a = ""; for (let i = 0; i < 3; i++) { const ax = x - hw + 4 * k + i * 10 * k; a += `M${f1(ax)} ${f1(T + 40 * k)} v${f1(-8 * k)} q${f1(3 * k)} ${f1(-5 * k)} ${f1(6 * k)} 0 v${f1(8 * k)} Z `; }
          a += `M${f1(x - 6 * k)} ${f1(T + 18 * k)} v${f1(-6 * k)} q${f1(2 * k)} ${f1(-4 * k)} ${f1(4 * k)} 0 v${f1(6 * k)} Z M${f1(x + 2 * k)} ${f1(T + 18 * k)} v${f1(-6 * k)} q${f1(2 * k)} ${f1(-4 * k)} ${f1(4 * k)} 0 v${f1(6 * k)} Z M${f1(x - 2.5 * k)} ${f1(T + 62 * k)} v${f1(-7 * k)} q${f1(2.5 * k)} ${f1(-4 * k)} ${f1(5 * k)} 0 v${f1(7 * k)} Z`;
          s += `<path d="${a}" fill="${dk}"/><rect x="${f1(x - hw - 3)}" y="${f1(T + 40 * k)}" width="${f1(hw * 2 + 6)}" height="${f1(3 * k)}" fill="${sh}"/>` + merl(x - hw + 1, x + hw, T);
          for (const sx of [x - hw, x + hw]) s += `<rect x="${f1(sx - 3.5 * k)}" y="${f1(T - 8 * k)}" width="${f1(7 * k)}" height="${f1(12 * k)}" fill="${st}" stroke="${sh}" stroke-width=".8"/>` + dome(sx, T - 8 * k, 8 * k, 6 * k);
          s += `<rect x="${f1(x - bw - 2)}" y="${B - 2}" width="${f1(bw * 2 + 4)}" height="3" fill="#4E7F90" opacity=".6"/>`;
          if (r() < .6) s += boat(btw(r, 30, 80), btw(r, 176, 188), .9, true);
          perch.push([x - hw, T - 14 * k], [x + bw, bt - 18 * k], [x - 8 * k, bt - 5 * k]);
          return { s, l, perch };
        } },
      { id: "padrao", zh: "發現者紀念碑",
        see: ["白色的紀念碑像一艘船頭朝著河", "船頭上排滿了石頭做的航海家", "地上有一個好大的羅盤，裡面畫著世界地圖"],
        spots: ["紀念碑的最頂端", "最前面那位航海家的肩膀上"],
        draw(c) {
          const { r } = c; let s = hills(138, "#A9B3A2", r, 5) + water(144, "#A3C6CC", "#5F8FA0", r), l = ""; const perch = [];
          s += `<rect x="0" y="160" width="300" height="40" fill="#E4DACA"/>`;
          const rx = btw(r, 50, 80);
          s += `<ellipse cx="${f1(rx)}" cy="184" rx="44" ry="10" fill="#CFC3AD"/><ellipse cx="${f1(rx)}" cy="184" rx="30" ry="6.5" fill="#B8C8B0"/><path d="M${f1(rx - 42)} 184 L${f1(rx)} 182 L${f1(rx + 42)} 184 L${f1(rx)} 186 Z M${f1(rx)} 174.5 L${f1(rx + 5)} 184 L${f1(rx)} 193.5 L${f1(rx - 5)} 184 Z" fill="#7A5E48"/>`;
          const sx = btw(r, 198, 212), st = "#ECE6D8", sh = "#C9BEA7", fg = "#BDB099";
          s += `<rect x="${f1(sx - 120)}" y="154" width="${f1(156)}" height="8" fill="#D2C7B1"/><rect x="${f1(sx - 124)}" y="160" width="${f1(164)}" height="3" fill="#BDB19A"/>`;
          s += `<rect x="${f1(sx)}" y="42" width="18" height="114" fill="${st}"/><rect x="${f1(sx + 12)}" y="42" width="6" height="114" fill="${sh}"/>`;
          s += `<path d="M${f1(sx)} 46 Q${f1(sx - 30)} 70 ${f1(sx - 4)} 112 L${f1(sx)} 112 Z" fill="${sh}"/>`;
          const tipx = sx - 94, tipy = 142, fall = 58;
          s += `<path d="M${f1(sx + 1)} 156 L${f1(sx - 98)} 156 Q${f1(sx - 104)} 148 ${f1(tipx)} ${tipy} L${f1(sx + 1)} ${tipy - fall} Z" fill="${st}"/><path d="M${f1(sx + 1)} 156 L${f1(sx - 98)} 156 Q${f1(sx - 102)} 152 ${f1(sx - 100)} 149 L${f1(sx + 1)} 140 Z" fill="${sh}"/>`;
          let d = "";
          const man = (px, py, h, w) => `M${f1(px - w)} ${f1(py + 1)} L${f1(px - w * .7)} ${f1(py - h * .72)} Q${f1(px)} ${f1(py - h * .8)} ${f1(px + w * .7)} ${f1(py - h * .72)} L${f1(px + w)} ${f1(py + 1)} Z M${f1(px - w * .55)} ${f1(py - h * .86)} a${f1(w * .55)} ${f1(w * .55)} 0 1 1 ${f1(w * 1.1)} 0 a${f1(w * .55)} ${f1(w * .55)} 0 1 1 ${f1(-w * 1.1)} 0 Z `;
          for (let i = 0; i < 9; i++) { const t = .15 + i * .095, px = tipx + t * 95, py = tipy - t * fall; d += man(px, py, 17 - i * .5, 3.4); }
          const hx = tipx + 5, hy = tipy - 3;
          d += man(hx, hy, 22, 4.2) + `M${f1(hx - 11)} ${f1(hy - 10)} h7 l-1.2 3 h-4.6 Z M${f1(hx - 8)} ${f1(hy - 10.5)} v-6 l3.5 5 Z`;
          s += `<path d="${d}" fill="#B3A68D"/>`;
          if (r() < .6) s += `<circle cx="${f1(btw(r, 120, 280))}" cy="${f1(btw(r, 172, 192))}" r="2" fill="#5A4A3E"/>`;
          perch.push([sx + 9, 42], [hx + 3, hy - 16]);
          return { s, l, perch };
        } },
      { id: "ponte25", zh: "四二五大橋",
        see: ["紅色的大橋很像舊金山的金門大橋", "橋上有車開過，橋的下層還有火車在走", "對岸山上有一座張開雙手的耶穌像"],
        spots: ["大橋的紅色塔頂上", "耶穌像張開的手臂上"],
        draw(c) {
          const { r } = c; let s = hills(128, "#A8B5A4", r, 6), l = ""; const perch = [];
          s += water(138, "#A1C3CB", "#5A8A9C", r);
          s += `<path d="M196 141 Q236 106 300 100 L300 200 L196 200 Z" fill="#8FA27E"/>`;
          const cr = btw(r, 258, 272), pw = "#EAE5D8", ps = "#C9C1AE";
          s += `<rect x="${f1(cr - 6)}" y="70" width="12" height="42" fill="${pw}"/><rect x="${f1(cr + 2)}" y="70" width="4" height="42" fill="${ps}"/><rect x="${f1(cr - 3)}" y="90" width="6" height="22" fill="#7C7466"/>`;
          s += `<path d="M${f1(cr - 2.6)} 70 L${f1(cr - 2)} 57 L${f1(cr + 2)} 57 L${f1(cr + 2.6)} 70 Z M${f1(cr - 10)} 57 h20 v2.4 h-20 Z" fill="${pw}" stroke="${ps}" stroke-width=".6"/><circle cx="${f1(cr)}" cy="54.5" r="2.4" fill="${pw}" stroke="${ps}" stroke-width=".6"/>`;
          const T1 = btw(r, 118, 132), T2 = T1 + btw(r, 104, 112), TT = 52, D = 116, red = "#B9442E";
          let tw = "";
          for (const t of [T1, T2]) tw += `<rect x="${f1(t - 8)}" y="144" width="16" height="8" fill="#CFC6B6"/><rect x="${f1(t - 6.5)}" y="${TT}" width="4" height="${146 - TT}" fill="${red}"/><rect x="${f1(t + 2.5)}" y="${TT}" width="4" height="${146 - TT}" fill="${red}"/><path d="M${f1(t - 6.5)} ${TT} h13 v3 h-13 Z M${f1(t - 6.5)} ${TT + 22} h13 v3 h-13 Z M${f1(t - 6.5)} ${TT + 44} h13 v3 h-13 Z M${f1(t - 6.5)} ${D + 18} h13 v3 h-13 Z" fill="${red}"/>`;
          s += tw;
          let hg = ""; const n = 14;
          for (let i = 1; i < n; i++) { const t = i / n, x = T1 + (T2 - T1) * t, y = (1 - t) * (1 - t) * TT + 2 * t * (1 - t) * 168 + t * t * TT; hg += `M${f1(x)} ${f1(y)} V${D} `; }
          for (let i = 1; i < 5; i++) { const x = T1 - i * T1 / 5; hg += `M${f1(x)} ${f1(TT + (D - 8 - TT) * Math.pow(i / 5, .8))} V${D} `; }
          s += `<path d="${hg}" stroke="${red}" stroke-width=".6"/>`;
          s += `<path d="M0 108 Q${f1(T1 - 40)} 98 ${f1(T1)} ${TT} Q${f1((T1 + T2) / 2)} 168 ${f1(T2)} ${TT} Q${f1(T2 + 26)} 96 ${f1(T2 + 54)} ${D}" stroke="${red}" stroke-width="1.8" fill="none"/>`;
          let z = `M0 ${D + 4}`; for (let x = 0; x < 300; x += 8) z += ` L${x + 4} ${D + 11} L${x + 8} ${D + 4}`;
          s += `<rect x="0" y="${D}" width="300" height="4.5" fill="${red}"/><path d="${z} M0 ${D + 11} H300" stroke="${red}" stroke-width="1.1" fill="none"/>`;
          if (r() < .6) s += boat(btw(r, 20, 170), btw(r, 162, 186), .9, r() < .5);
          perch.push([T1, TT - 1], [T2, TT - 1], [cr - 7, 56.5]);
          return { s, l, perch };
        } },
      { id: "alfama", zh: "阿爾法瑪",
        see: ["橘紅色的屋頂一路往下滾到河邊", "有些牆上貼滿了藍白色的磁磚", "巷子很窄，窗外晾著一排排衣服"],
        spots: ["觀景台的石欄杆上", "教堂圓頂的尖端", "一片橘色的屋瓦上"],
        draw(c) {
          const { r, sea } = c; let s = hills(112, "#B4BBAE", r, 5) + water(116, "#A6C6CC", "#6B98A8", r), l = ""; const perch = [];
          const fac = ["#F1E6CF", "#EBC27A", "#E7B3A0", "#F4EFE6", "#7FA2C4", "#E9D59A"], rfc = ["#C2643C", "#B5552F", "#CF7A4A", "#B9603F"];
          const cx = btw(r, 172, 202);
          let roofP = null;
          for (let i = 0; i < 3; i++) {
            const sc = .95 + i * .22, by = 145 + i * 17;
            let x = btw(r, -14, -2), win = "", tile = "";
            while (x < 300) {
              const w = btw(r, 27, 36) * sc, h = btw(r, 11, 16) * sc, b = by + (x - 150) * .11, top = b - h, col = pick(r, fac), rc = pick(r, rfc);
              s += `<rect x="${f1(x)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h + 30)}" fill="${col}"/><path d="M${f1(x - 1)} ${f1(top)} L${f1(x + 3)} ${f1(top - 6 * sc)} L${f1(x + w - 3)} ${f1(top - 6 * sc)} L${f1(x + w + 1)} ${f1(top)} Z" fill="${rc}"/>`;
              win += `M${f1(x + w * .4)} ${f1(top + 3)} h${f1(3 * sc)} v${f1(4 * sc)} h${f1(-3 * sc)} Z `;
              if (col === "#7FA2C4") for (let yy = top + 2; yy < top + h + 4; yy += 3.6) tile += `M${f1(x + .5)} ${f1(yy)} h${f1(w - 1)} `;
              if (i === 1 && !roofP && x > 60 && x < 130) roofP = [x + w / 2, top - 6 * sc];
              x += w + btw(r, -2, 1);
            }
            s += `<path d="${win}" fill="#4A3F38" opacity=".6"/>`;
            if (tile) s += `<path d="${tile}" stroke="#EEF1F2" stroke-width="1" stroke-dasharray="1.2 2"/>`;
            if (i === 0) {
              const b = 152 + (cx - 150) * .11, cw = "#F1ECE0", cs = "#D3CBBA";
              s += `<rect x="${f1(cx - 19)}" y="${f1(b - 26)}" width="38" height="26" fill="${cw}"/><rect x="${f1(cx + 8)}" y="${f1(b - 26)}" width="11" height="26" fill="${cs}"/><rect x="${f1(cx - 11)}" y="${f1(b - 34)}" width="22" height="8" fill="${cw}"/>`;
              s += `<path d="M${f1(cx - 12)} ${f1(b - 34)} A12 14 0 0 1 ${f1(cx + 12)} ${f1(b - 34)} Z" fill="${cw}" stroke="${cs}" stroke-width="1"/><rect x="${f1(cx - 2)}" y="${f1(b - 54)}" width="4" height="7" fill="${cw}" stroke="${cs}" stroke-width=".6"/><path d="M${f1(cx)} ${f1(b - 54)} v-4" stroke="#8A8270" stroke-width="1"/>`;
              s += `<path d="M${f1(cx - 14)} ${f1(b - 6)} v-10 q3 -5 6 0 v10 Z M${f1(cx + 8)} ${f1(b - 6)} v-10 q3 -5 6 0 v10 Z" fill="#8C8270" opacity=".6"/>`;
              perch.push([cx, b - 58]);
            }
            if (i === 1 && r() < .8) { const lx = btw(r, 30, 230), ly = by + (lx - 150) * .11 - 2; s += `<path d="M${f1(lx)} ${f1(ly)} h22" stroke="#6A5A4A" stroke-width=".6"/><path d="M${f1(lx + 3)} ${f1(ly)} h4 v5 h-4 Z M${f1(lx + 10)} ${f1(ly)} h4 v4 h-4 Z M${f1(lx + 16)} ${f1(ly)} h3 v6 h-3 Z" fill="${pick(r, ["#F4F1EA", "#D8604A", "#4E7FB0"])}"/>`; }
          }
          s += `<rect x="0" y="183" width="300" height="17" fill="#E8E0CF"/><rect x="0" y="181" width="300" height="4" fill="#D6CCB8"/><rect x="10" y="188" width="64" height="12" fill="#F4F1E8"/><path d="M12 190.5 h60 M12 194 h60 M12 197.5 h60" stroke="#3F6E9E" stroke-width="2" stroke-dasharray="2 2"/>`;
          s += tree(btw(r, 262, 286), 184, 1.1, sea, r);
          perch.push([btw(r, 100, 240), 181]);
          if (roofP) perch.push(roofP);
          return { s, l, perch };
        } },
      { id: "santajusta", zh: "聖胡斯塔升降機",
        see: ["鐵做的塔上面有好多尖尖的拱窗", "坐電梯上去，再走過一座小鐵橋到另一條街", "頂上可以看到整片下城區的屋頂"],
        spots: ["升降機的最頂端", "小鐵橋的欄杆上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const ex = btw(r, 172, 192), ir = "#4D4846", gl = "#B4C2C8";
          const blk = (x, y, w, col) => { let d = ""; for (let yy = y + 8; yy < 166; yy += 14) for (let xx = x + 5; xx < x + w - 6; xx += 11) d += `M${f1(xx)} ${f1(yy)} h5 v8 h-5 Z `; return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(172 - y)}" fill="${col}"/><rect x="${f1(x - 1)}" y="${f1(y - 3)}" width="${f1(w + 2)}" height="3" fill="#B05A3A"/><path d="${d}" fill="#4A3F38" opacity=".55"/>`; };
          s += blk(-2, 112, 40, "#E8D9BC") + blk(38, 68, ex - 86, "#E3CFAE") + blk(ex + 24, 92, 280 - ex, "#EBD9A8");
          let w = `M${f1(ex - 48)} 65 H${f1(ex - 13)} M${f1(ex - 48)} 72 H${f1(ex - 13)}`; for (let xx = ex - 48; xx < ex - 15; xx += 5) w += ` M${f1(xx)} 72 l5 -7`;
          s += `<path d="${w}" stroke="${ir}" stroke-width="1.3" fill="none"/>`;
          s += `<rect x="${f1(ex - 13)}" y="56" width="26" height="116" fill="${ir}"/>`;
          let a = "", b = "";
          for (let j = 0; j < 5; j++) { const t = 76 + j * 19; b += `M${f1(ex - 14)} ${t} h28 v2 h-28 Z `; for (const ax of [ex - 10, ex + 2]) a += `M${f1(ax)} ${t + 16} V${t + 8} Q${f1(ax)} ${t + 4} ${f1(ax + 4)} ${t + 2.5} Q${f1(ax + 8)} ${t + 4} ${f1(ax + 8)} ${t + 8} V${t + 16} Z `; }
          a += `M${f1(ex - 9)} 72 V64 Q${f1(ex - 9)} 60 ${f1(ex - 4)} 59 Q${f1(ex + 1)} 60 ${f1(ex + 1)} 64 V72 Z M${f1(ex + 3)} 72 V64 Q${f1(ex + 3)} 61 ${f1(ex + 6)} 60 Q${f1(ex + 9)} 61 ${f1(ex + 9)} 64 V72 Z`;
          s += `<path d="${a}" fill="${gl}"/><path d="${b}" fill="#3A3634"/><path d="M${f1(ex - 6)} 76 V172 M${f1(ex + 6)} 76 V172" stroke="${ir}" stroke-width="1.2"/>`;
          s += `<rect x="${f1(ex - 16)}" y="53" width="32" height="3.5" fill="#3A3634"/><path d="M${f1(ex - 16)} 53 V48 H${f1(ex + 16)} V53 M${f1(ex - 10)} 53 V48 M${f1(ex + 10)} 53 V48" stroke="${ir}" stroke-width="1" fill="none"/>`;
          s += `<rect x="${f1(ex - 6)}" y="38" width="12" height="15" fill="${ir}"/><path d="M${f1(ex - 3.5)} 50 v-6 q1.5 -3 3 0 v6 Z M${f1(ex + .5)} 50 v-6 q1.5 -3 3 0 v6 Z" fill="${gl}"/><path d="M${f1(ex - 8)} 38 L${f1(ex)} 29 L${f1(ex + 8)} 38 Z" fill="#3A3634"/><path d="M${f1(ex)} 29 v-4" stroke="#3A3634" stroke-width="1.2"/>`;
          s += `<rect x="${f1(ex - 5)}" y="156" width="10" height="16" fill="#2E2A28"/>`;
          s += `<rect x="0" y="172" width="300" height="28" fill="#ECE6D9"/><path d="M0 182 q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 M0 192 q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#3F3A36" stroke-width="1.4" fill="none"/>`;
          s += tree(btw(r, 14, 40), 182, .9, sea, r);
          perch.push([ex, 25], [ex - 32, 64]);
          return { s, l, perch };
        } },
    ],
  },
  seoul: {
    zh: "首爾", de: "Seoul", gift: "一雙扁扁的金屬筷子",
    sights: [
      { id: "gyeongbokgung", zh: "景福宮",
        see: ["屋簷的四個角翹起來，下面畫滿彩色的花紋", "宮殿後面是一座灰灰的石頭山", "守門的衛兵穿著鮮豔的衣服，站得直直的"],
        spots: ["宮殿屋脊的尾端", "翹起的屋簷角上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const x = btw(r, 160, 182), red = "#A63E30", grn = "#3F7A6A", rf = "#3F4347";
          s += `<path d="M0 134 Q50 112 100 116 Q${f1(x - 10)} 76 ${f1(x + 22)} 48 Q${f1(x + 52)} 70 ${f1(x + 80)} 98 Q${f1(x + 100)} 106 300 112 L300 200 L0 200 Z" fill="#A6B1AE"/><path d="M${f1(x + 2)} 72 L${f1(x + 22)} 50 L${f1(x + 30)} 64 Z" fill="#C3CAC6"/>`;
          s += `<path d="M0 146 Q60 128 120 132 Q180 120 240 128 Q280 132 300 136 L300 200 L0 200 Z" fill="${{ spring: "#8FAA78", summer: "#6E9458", autumn: "#B08A4C", winter: "#B9BFB4" }[sea]}"/><rect x="0" y="150" width="300" height="50" fill="#D8CFBF"/>`;
          s += `<rect x="${f1(x - 84)}" y="160" width="168" height="10" fill="#C3BAA8"/><rect x="${f1(x - 70)}" y="152" width="140" height="8" fill="#D2CAB9"/><path d="M${f1(x - 84)} 159.5 h168 M${f1(x - 70)} 151.5 h140" stroke="#8E8473" stroke-width="1.2"/>`;
          let col = ""; for (let i = 0; i < 8; i++) col += `M${f1(x - 46 + i * 13)} 126 v26 h3 v-26 Z `;
          s += `<rect x="${f1(x - 48)}" y="126" width="96" height="26" fill="#C29068"/><path d="${col}" fill="${red}"/><rect x="${f1(x - 50)}" y="122" width="100" height="4.5" fill="${grn}"/>`;
          s += `<path d="M${f1(x - 74)} 116 Q${f1(x - 62)} 125 ${f1(x - 48)} 124 L${f1(x + 48)} 124 Q${f1(x + 62)} 125 ${f1(x + 74)} 116 L${f1(x + 58)} 110 L${f1(x + 44)} 104 L${f1(x - 44)} 104 L${f1(x - 58)} 110 Z" fill="${rf}"/>`;
          s += `<rect x="${f1(x - 38)}" y="92" width="76" height="12" fill="#C29068"/><path d="M${f1(x - 36)} 92 v12 h3 v-12 Z M${f1(x - 12)} 92 v12 h3 v-12 Z M${f1(x + 10)} 92 v12 h3 v-12 Z M${f1(x + 33)} 92 v12 h3 v-12 Z" fill="${red}"/><rect x="${f1(x - 40)}" y="90" width="80" height="3.5" fill="${grn}"/>`;
          s += `<path d="M${f1(x - 62)} 84 Q${f1(x - 50)} 93 ${f1(x - 38)} 92 L${f1(x + 38)} 92 Q${f1(x + 50)} 93 ${f1(x + 62)} 84 L${f1(x + 42)} 78 Q${f1(x + 32)} 72 ${f1(x + 28)} 66 L${f1(x - 28)} 66 Q${f1(x - 32)} 72 ${f1(x - 42)} 78 Z" fill="${rf}"/><path d="M${f1(x - 33)} 62 Q${f1(x)} 67 ${f1(x + 33)} 62" stroke="#2C2F33" stroke-width="3.2" fill="none"/>`;
          if (sea === "winter") s += `<path d="M${f1(x - 30)} 68 L${f1(x + 30)} 68 M${f1(x - 44)} 105.5 L${f1(x + 44)} 105.5" stroke="#F4F6F7" stroke-width="2.4"/>`;
          let g = "";
          for (const [gx, cl] of [[x - 64, "#C23A2E"], [x + 58, "#2F5E9E"], [x + 74, "#D9A93A"]]) {
            s += `<path d="M${f1(gx - 5.5)} 188 L${f1(gx - 3.5)} 171 L${f1(gx + 3.5)} 171 L${f1(gx + 5.5)} 188 Z" fill="${cl}"/><rect x="${f1(gx - 4)}" y="177" width="8" height="1.6" fill="#2C2A28"/><circle cx="${f1(gx)}" cy="168" r="2.8" fill="#E8C7A0"/>`;
            g += `M${f1(gx - 5.5)} 165.6 h11 v1.4 h-11 Z M${f1(gx - 2.2)} 165.8 v-3.6 h4.4 v3.6 Z `;
          }
          s += `<path d="${g}" fill="#1F1D1C"/><path d="M${f1(x - 57)} 188 V146" stroke="#5A4232" stroke-width="1.2"/><path d="M${f1(x - 57)} 146 l12 4 l-12 4 Z" fill="#E2B33C"/>`;
          perch.push([x - 32, 61], [x + 74, 115], [x - 60, 151]);
          return { s, l, perch };
        } },
      { id: "namsan", zh: "南山首爾塔",
        see: ["白色的高塔站在綠綠的山頂上", "塔下的欄杆掛滿了一層又一層的鎖", "從上面看，首爾的房子一路排到天邊"],
        spots: ["塔頂的天線上", "觀景台的屋頂上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const hc = { spring: "#87A86E", summer: "#5E8A4A", autumn: "#A07E42", winter: "#9AA08E" }[sea], tx = btw(r, 182, 204), hy = 116;
          s += `<path d="M0 178 Q60 158 ${f1(tx - 70)} 134 Q${f1(tx - 30)} ${hy - 6} ${f1(tx)} ${hy} Q${f1(tx + 40)} ${hy - 4} ${f1(tx + 80)} 140 Q${f1(tx + 100)} 152 300 160 L300 200 L0 200 Z" fill="${hc}"/>`;
          for (const [dx, dy, sc] of [[-32, 124, .6], [30, 124, .6], [-58, 136, .75], [62, 140, .75], [-90, 152, .85]]) s += tree(tx + dx, dy, sc, sea, r);
          s += `<rect x="${f1(tx - 12)}" y="${hy - 8}" width="24" height="12" fill="#D9D4C8"/>`;
          s += `<path d="M${f1(tx - 4.5)} ${hy - 8} L${f1(tx - 3)} 64 L${f1(tx + 3)} 64 L${f1(tx + 4.5)} ${hy - 8} Z" fill="#F0EEE8"/><path d="M${f1(tx + 1)} ${hy - 8} L${f1(tx + 1)} 64 L${f1(tx + 3)} 64 L${f1(tx + 4.5)} ${hy - 8} Z" fill="#CFCBC2"/>`;
          s += `<path d="M${f1(tx - 3)} 66 L${f1(tx - 13)} 58 L${f1(tx + 13)} 58 L${f1(tx + 3)} 66 Z" fill="#D6D2C9"/><rect x="${f1(tx - 14)}" y="46" width="28" height="12" fill="#F0EEE8"/><rect x="${f1(tx - 14)}" y="50" width="28" height="4" fill="#5F6E7C"/><rect x="${f1(tx + 6)}" y="46" width="8" height="12" fill="#CFCBC2" opacity=".7"/><path d="M${f1(tx - 14)} 46 L${f1(tx - 8)} 41 L${f1(tx + 8)} 41 L${f1(tx + 14)} 46 Z" fill="#D3CFC6"/>`;
          s += `<rect x="${f1(tx - 1.8)}" y="16" width="3.6" height="25" fill="#E6E3DC"/><path d="M${f1(tx - 1.8)} 19 h3.6 v3 h-3.6 Z M${f1(tx - 1.8)} 27 h3.6 v3 h-3.6 Z M${f1(tx - 1.8)} 35 h3.6 v3 h-3.6 Z" fill="#C9473A"/>`;
          let x = btw(r, -6, 0), b = "", wd = "";
          while (x < 300) { const w = btw(r, 14, 26), t = btw(r, 164, 186); b += `<rect x="${f1(x)}" y="${f1(t)}" width="${f1(w)}" height="${f1(200 - t)}" fill="${pick(r, ["#C9C4BA", "#B7BCC0", "#D8D1C4", "#A9B0B6"])}"/>`; wd += `M${f1(x + 4)} ${f1(t + 4)} V200 M${f1(x + w - 6)} ${f1(t + 4)} V200 `; x += w + btw(r, 0, 3); }
          s += b + `<path d="${wd}" stroke="#6F7A84" stroke-width="1.6" stroke-dasharray="2 3" opacity=".7"/>`;
          perch.push([tx, 15], [tx - 9, 41]);
          return { s, l, perch };
        } },
      { id: "bukchon", zh: "北村韓屋村",
        see: ["灰色的瓦片屋頂一個接一個往下排", "巷子很安靜，大家都放輕了腳步", "從坡上看下去，遠處是高高的大樓"],
        spots: ["韓屋的屋脊上", "石牆的牆頭上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const yA = (x) => 150 + x * .107;
          let x = 118, cb = "";
          while (x < 300) { const w = btw(r, 12, 22), t = btw(r, 84, 128); cb += `<rect x="${f1(x)}" y="${f1(t)}" width="${f1(w)}" height="${f1(160 - t)}" fill="${pick(r, ["#AFBCC6", "#9EAEBC", "#C3CCD3", "#B6BFC4"])}"/>`; x += w + btw(r, 1, 6); }
          s += cb;
          const x0 = btw(r, -20, -8);
          for (let i = 0; i < 6; i++) {
            const ux = x0 + i * 55, w = 50, b = yA(ux + w) + 1;
            let u = `<rect x="${f1(ux)}" y="${f1(b - 10)}" width="${w}" height="10" fill="#A39A8C"/><rect x="${f1(ux)}" y="${f1(b - 24)}" width="${w}" height="14" fill="#EFE9DD"/>`;
            u += `<path d="M${f1(ux + 2)} ${f1(b - 24)} v14 M${f1(ux + w / 2)} ${f1(b - 24)} v14 M${f1(ux + w - 2)} ${f1(b - 24)} v14 M${f1(ux)} ${f1(b - 17)} h${w} M${f1(ux)} ${f1(b - 5)} h${w}" stroke="#7A5638" stroke-width="1.5"/>`;
            u += `<path d="M${f1(ux - 7)} ${f1(b - 29)} Q${f1(ux + 2)} ${f1(b - 23)} ${f1(ux + 12)} ${f1(b - 24)} L${f1(ux + w - 12)} ${f1(b - 24)} Q${f1(ux + w - 2)} ${f1(b - 23)} ${f1(ux + w + 7)} ${f1(b - 29)} L${f1(ux + w - 4)} ${f1(b - 38)} L${f1(ux + 4)} ${f1(b - 38)} Z" fill="#4A4E53"/>`;
            let tl = ""; for (let t = ux + 2; t < ux + w - 1; t += 3.6) tl += `M${f1(t)} ${f1(b - 37)} V${f1(b - 25)} `;
            u += `<path d="${tl}" stroke="#373A3F" stroke-width=".8"/><path d="M${f1(ux + 1)} ${f1(b - 41)} Q${f1(ux + w / 2)} ${f1(b - 37)} ${f1(ux + w - 1)} ${f1(b - 41)}" stroke="#2F3236" stroke-width="3" fill="none"/>`;
            u += `<circle cx="${f1(ux + 1.5)}" cy="${f1(b - 41)}" r="1.6" fill="#EDE8DD"/><circle cx="${f1(ux + w - 1.5)}" cy="${f1(b - 41)}" r="1.6" fill="#EDE8DD"/>`;
            if (sea === "winter") u += `<path d="M${f1(ux + 4)} ${f1(b - 38.5)} H${f1(ux + w - 4)}" stroke="#F4F6F7" stroke-width="2.2"/>`;
            s += u;
            if (i === 2 || i === 3) perch.push([ux + w / 2, b - 40]);
          }
          s += `<path d="M0 ${f1(yA(0))} L300 ${f1(yA(300))} L300 200 L0 200 Z" fill="#CEC4B2"/><path d="M0 ${f1(yA(0) + 14)} L300 ${f1(yA(300) + 14)}" stroke="#B3A994" stroke-width="1" stroke-dasharray="7 4"/>`;
          s += `<path d="M0 ${f1(yA(0) + 24)} L300 ${f1(yA(300) + 24)} L300 200 L0 200 Z" fill="#9C9384"/><path d="M0 ${f1(yA(0) + 24)} L300 ${f1(yA(300) + 24)}" stroke="#7E766A" stroke-width="2"/>`;
          const px = btw(r, 120, 230), py = yA(px) + 12;
          s += `<path d="M${f1(px - 5)} ${f1(py)} L${f1(px - 2)} ${f1(py - 11)} L${f1(px + 2)} ${f1(py - 11)} L${f1(px + 5)} ${f1(py)} Z" fill="${pick(r, ["#E07A9A", "#4FA3A0", "#E9B44C"])}"/><rect x="${f1(px - 2.6)}" y="${f1(py - 15)}" width="5.2" height="4.5" fill="#F2E3CF"/><circle cx="${f1(px)}" cy="${f1(py - 16.5)}" r="2.6" fill="#E8C7A0"/>`;
          s += tree(btw(r, 14, 50), 196, 1, sea, r);
          const wp = btw(r, 70, 110); perch.push([wp, yA(wp) + 23]);
          return { s, l, perch };
        } },
      { id: "cheonggyecheon", zh: "清溪川",
        see: ["小溪在大樓中間流過，比馬路低了一層", "溪裡有一排踏腳石，大家一步一步走過去", "柳樹垂到水面上，走在旁邊很涼快"],
        spots: ["溪裡的踏腳石上", "低低的石牆上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          let b = "";
          for (let x = btw(r, -4, 0); x < 128;) { const w = btw(r, 18, 30), t = btw(r, 74, 102); b += `<rect x="${f1(x)}" y="${f1(t)}" width="${f1(w)}" height="${f1(152 - t)}" fill="${pick(r, ["#C5CDD3", "#B4C0CA", "#D6D0C4"])}"/>`; x += w + 1; }
          for (let x = 168; x < 300;) { const w = btw(r, 18, 32), t = btw(r, 50, 92); b += `<rect x="${f1(x)}" y="${f1(t)}" width="${f1(w)}" height="${f1(152 - t)}" fill="${pick(r, ["#9FB3C4", "#C5CDD3", "#B8C4CE", "#D4CEC2"])}"/>`; x += w + 1; }
          s += b + `<path d="M8 90 V148 M30 84 V148 M190 70 V140 M214 64 V140 M246 76 V146 M272 60 V146" stroke="#E8EEF2" stroke-width="2" stroke-dasharray="3 3" opacity=".7"/>`;
          s += `<rect x="124" y="111" width="52" height="6" fill="#8A8478"/>`;
          s += `<path d="M0 148 L134 116 L138 124 L22 200 L0 200 Z M300 148 L166 116 L162 124 L278 200 L300 200 Z" fill="#A69E90"/>`;
          s += `<path d="M0 165 L135 119 M0 182 L136.5 121.5 M300 165 L165 119 M300 182 L163.5 121.5" stroke="#8C8476" stroke-width="1"/><path d="M0 148 L134 116 M300 148 L166 116" stroke="#6E685E" stroke-width="2"/>`;
          s += `<path d="M22 200 L138 124 L146 124 L100 200 Z M200 200 L154 124 L162 124 L278 200 Z" fill="#D6CEBF"/><path d="M100 200 L146 124 L154 124 L200 200 Z" fill="#6E9FAE"/>`;
          let w = ""; for (let i = 0; i < 6; i++) { const y = btw(r, 130, 196), hw = (y - 120) * .4; w += `M${f1(150 + btw(r, -hw, hw * .4))} ${f1(y)} q3 -1.5 6 0 `; }
          s += `<path d="${w}" stroke="#FFFFFF" stroke-opacity=".55" stroke-width=".9" fill="none"/>`;
          let st = "", sd = "";
          for (let i = 0; i < 5; i++) { st += `M${f1(121 + i * 12.4)} 166 h8 v4.5 h-8 Z `; sd += `M${f1(121 + i * 12.4)} 170.5 h8 v1.6 h-8 Z `; }
          for (let i = 0; i < 4; i++) { st += `M${f1(134 + i * 8.6)} 145 h5 v2.6 h-5 Z `; sd += `M${f1(134 + i * 8.6)} 147.6 h5 v1 h-5 Z `; }
          s += `<path d="${st}" fill="#E2DCCF"/><path d="${sd}" fill="#7E8A88"/>`;
          const wc = { spring: "#B5CF6A", summer: "#6E9A4A", autumn: "#C9A94A", winter: "#A89A72" }[sea];
          const willow = (x, y, k) => {
            let d = "";
            for (let j = -3; j <= 3; j++) d += `M${f1(x)} ${f1(y - 24 * k)} q${f1(j * 4 * k)} ${f1(-6 * k)} ${f1(j * 7 * k)} ${f1(2 * k)} q${f1(1 * k)} ${f1(8 * k)} 0 ${f1((sea === "winter" ? 10 : 17) * k)} `;
            return `<path d="M${f1(x)} ${f1(y)} q${f1(-2 * k)} ${f1(-12 * k)} 0 ${f1(-24 * k)}" stroke="#5A4232" stroke-width="${f1(2.4 * k)}" fill="none"/><path d="${d}" stroke="${wc}" stroke-width="${f1((sea === "winter" ? .8 : 1.5) * k)}" fill="none"/>`;
          };
          s += willow(108, 150, .55) + willow(192, 150, .55) + willow(52, 194, 1.2) + willow(248, 194, 1.2);
          const wx = btw(r, 40, 80);
          perch.push([121 + 2 * 12.4 + 4, 166], [wx, 147 - 32 * wx / 134]);
          return { s, l, perch };
        } },
      { id: "ddp", zh: "東大門設計廣場",
        see: ["銀色的大房子彎彎的，找不到一個角", "牆上是一片一片的金屬板，有的還有小洞", "旁邊的街上都是賣衣服的大樓"],
        spots: ["銀色屋頂最高的地方", "彎彎的屋簷邊上"],
        draw(c) {
          const { r, sea } = c; let s = "", l = ""; const perch = [];
          const dx = btw(r, -8, 4);
          s += `<rect x="0" y="168" width="300" height="32" fill="#CFCBC4"/>`;
          s += `<path d="M${f1(40 + dx)} 171 C${f1(40 + dx)} 140 ${f1(80 + dx)} 116 ${f1(130 + dx)} 114 C${f1(170 + dx)} 112 ${f1(190 + dx)} 128 ${f1(222 + dx)} 120 C${f1(252 + dx)} 112 ${f1(286 + dx)} 128 ${f1(292 + dx)} 152 L${f1(296 + dx)} 171 Z" fill="#A9AFB5"/>`;
          s += `<path d="M${f1(54 + dx)} 171 C${f1(54 + dx)} 146 ${f1(88 + dx)} 124 ${f1(132 + dx)} 122 C${f1(170 + dx)} 120 ${f1(192 + dx)} 136 ${f1(222 + dx)} 129 C${f1(250 + dx)} 122 ${f1(276 + dx)} 136 ${f1(282 + dx)} 156 L${f1(285 + dx)} 171 Z" fill="#C9CED3"/>`;
          let sm = ""; for (let x = 66; x < 280; x += 14) sm += `M${f1(x + dx)} 150 Q${f1(x + 3 + dx)} 160 ${f1(x + 2 + dx)} 171 `;
          s += `<path d="${sm}" stroke="#A3AAB1" stroke-width=".8" fill="none"/><path d="M${f1(46 + dx)} 156 C${f1(48 + dx)} 136 ${f1(84 + dx)} 118 ${f1(130 + dx)} 116.5 C${f1(170 + dx)} 115 ${f1(190 + dx)} 130 ${f1(222 + dx)} 122.5" stroke="#EEF1F3" stroke-width="2" fill="none" opacity=".9"/>`;
          s += `<path d="M${f1(104 + dx)} 171 Q${f1(126 + dx)} 150 ${f1(166 + dx)} 150 Q${f1(200 + dx)} 150 ${f1(216 + dx)} 171 Z" fill="#525D69"/><path d="M${f1(130 + dx)} 171 V156 M${f1(148 + dx)} 171 V151.5 M${f1(166 + dx)} 171 V150.5 M${f1(184 + dx)} 171 V151.5 M${f1(200 + dx)} 171 V157" stroke="#8C98A4" stroke-width=".8"/>`;
          const gc = { spring: "#9CBF7A", summer: "#6E9A52", autumn: "#B39A5A", winter: "#C8CCC4" }[sea];
          s += `<path d="M${f1(198 + dx)} 125 Q${f1(222 + dx)} 116 ${f1(252 + dx)} 120.5 Q${f1(236 + dx)} 126 ${f1(206 + dx)} 128 Z" fill="${gc}"/>`;
          let p = ""; for (let i = 0; i < 4; i++) { const px = btw(r, 30, 290), py = btw(r, 176, 194); p += `M${f1(px - 1.5)} ${f1(py)} v-5 h3 v5 Z M${f1(px - 1.3)} ${f1(py - 6.2)} a1.3 1.3 0 1 1 2.6 0 a1.3 1.3 0 1 1 -2.6 0 Z `; }
          s += `<path d="${p}" fill="#4A4440"/>` + tree(btw(r, 10, 30), 190, 1, sea, r) + tree(btw(r, 262, 290), 194, .9, sea, r);
          perch.push([130 + dx, 113.5], [222 + dx, 119.5]);
          return { s, l, perch };
        } },
      { id: "hangang", zh: "漢江",
        see: ["江面好寬，一座又一座橋排到很遠", "江邊的草地上，大家搭著小帳篷野餐", "有人在河邊的步道上騎腳踏車"],
        spots: ["大橋的拱頂上", "帳篷的尖頂上"],
        draw(c) {
          const { r, sea } = c; let s = hills(104, "#A9B5B8", r, 12), l = ""; const perch = [];
          const gx = btw(r, 206, 238);
          let x = btw(r, -4, 0), b = "", ln = "";
          while (x < 300) { const w = btw(r, 12, 24), t = btw(r, 98, 112); if (Math.abs(x + w / 2 - gx) > 14) { b += `<rect x="${f1(x)}" y="${f1(t)}" width="${f1(w)}" height="${f1(121 - t)}" fill="${pick(r, ["#D3D7D8", "#C2C9CE", "#E0DDD4"])}"/>`; ln += `M${f1(x + 1)} ${f1(t + 3)} h${f1(w - 2)} M${f1(x + 1)} ${f1(t + 7)} h${f1(w - 2)} `; } x += w + btw(r, 1, 4); }
          s += b + `<path d="${ln}" stroke="#9AA4AA" stroke-width=".6"/>`;
          s += `<path d="M${f1(gx - 8)} 121 L${f1(gx - 6)} 70 L${f1(gx + 1)} 64 L${f1(gx + 6)} 70 L${f1(gx + 8)} 121 Z" fill="#D2A84C"/><path d="M${f1(gx + 1)} 64 L${f1(gx + 6)} 70 L${f1(gx + 8)} 121 L${f1(gx + 3)} 121 Z" fill="#B88C36"/>`;
          s += water(120, "#A5C7D2", "#5E8EA3", r);
          s += `<rect x="0" y="127" width="300" height="2" fill="#8A949A"/>`;
          const a0 = btw(r, 40, 70);
          let ar = "", pr = "";
          for (let i = 0; i < 3; i++) { const ax = a0 + i * 82; ar += `M${f1(ax)} 142 Q${f1(ax + 41)} 106 ${f1(ax + 82)} 142 `; pr += `M${f1(ax - 4)} 144 h8 v12 h-8 Z `; for (let j = 1; j < 6; j++) { const t = j / 6, yy = 142 - 36 * 2 * t * (1 - t); ar += `M${f1(ax + 82 * t)} ${f1(yy)} V142 `; } }
          pr += `M${f1(a0 + 242)} 144 h8 v12 h-8 Z`;
          s += `<path d="${pr}" fill="#B9B4A8"/><rect x="0" y="141" width="300" height="4" fill="#6F7F86"/><path d="${ar}" stroke="#3F7690" stroke-width="2.4" fill="none"/>`;
          const gc = { spring: "#9DBE6E", summer: "#6E9E52", autumn: "#B09A52", winter: "#B7BBA8" }[sea];
          s += `<path d="M0 168 Q80 162 160 166 Q230 170 300 164 L300 200 L0 200 Z" fill="${gc}"/><path d="M0 182 Q150 178 300 184 L300 190 Q150 184 0 188 Z" fill="#CDBFA8"/>`;
          s += tree(btw(r, 14, 40), 172, 1, sea, r) + tree(btw(r, 252, 286), 170, 1, sea, r);
          const t1 = btw(r, 90, 130), t2 = btw(r, 170, 220), tc = pick(r, ["#E07A4A", "#E9C04C", "#4FA3C0"]);
          s += `<path d="M${f1(t1)} 180 L${f1(t1 + 10)} 165 L${f1(t1 + 20)} 180 Z" fill="${tc}"/><path d="M${f1(t1 + 10)} 165 L${f1(t1 + 20)} 180 L${f1(t1 + 13)} 180 Z" fill="#000000" opacity=".15"/><path d="M${f1(t2)} 178 L${f1(t2 + 8)} 166 L${f1(t2 + 16)} 178 Z" fill="#F2EEE6"/>`;
          const bx = btw(r, 60, 240);
          s += `<path d="M${f1(bx)} 188 a3 3 0 1 1 0.1 0 Z M${f1(bx + 11)} 188 a3 3 0 1 1 0.1 0 Z" stroke="#2E2A26" stroke-width="1" fill="none"/><path d="M${f1(bx)} 185 L${f1(bx + 5)} 185 L${f1(bx + 11)} 185 M${f1(bx + 5)} 185 l1 -6 M${f1(bx + 6)} 179 l4 -2" stroke="#2E2A26" stroke-width="1.1" fill="none"/><circle cx="${f1(bx + 6.5)}" cy="${f1(173.5)}" r="1.8" fill="#2E2A26"/>`;
          perch.push([a0 + 82 + 41, 123], [t1 + 10, 165]);
          return { s, l, perch };
        } },
    ],
  },
  cairo: {
    zh: "開羅", de: "al-Qāhira", gift: "一張畫在紙莎草紙上的畫",
    sights: [
      { id: "pyramids", zh: "吉薩金字塔",
        see: ["三座金字塔站在沙漠裡，大小排成一排", "走近才知道，每一塊石頭都好大", "駱駝背著遊客，慢慢走過沙地"],
        spots: ["金字塔的尖頂上", "駱駝的駝峰上"],
        draw(c) {
          const { r } = c; let s = `<rect x="0" y="146" width="300" height="54" fill="#E8CD9C"/>`, l = ""; const perch = [];
          const px = btw(r, 150, 170);
          const pyr = (x, b, hw, h, cap) => {
            let d = `<path d="M${f1(x - hw)} ${f1(b)} L${f1(x)} ${f1(b - h)} L${f1(x + hw * .3)} ${f1(b)} Z" fill="#DDB97E"/><path d="M${f1(x + hw * .3)} ${f1(b)} L${f1(x)} ${f1(b - h)} L${f1(x + hw)} ${f1(b)} Z" fill="#B8925A"/>`;
            if (h > 40) { let z = ""; for (let j = 1; j < 7; j++) { const y = b - h * j / 7, f = 1 - j / 7; z += `M${f1(x - hw * f)} ${f1(y)} H${f1(x + hw * f)} `; } d += `<path d="${z}" stroke="#9C7C4A" stroke-width=".5" opacity=".5"/>`; }
            if (cap) d += `<path d="M${f1(x)} ${f1(b - h)} L${f1(x - hw * .13)} ${f1(b - h * .87)} L${f1(x + hw * .13)} ${f1(b - h * .87)} Z" fill="#EEDDB6"/>`;
            return d;
          };
          s += pyr(px + 62, 150, 56, 66, false) + pyr(px, 153, 58, 74, true) + pyr(px - 64, 156, 30, 33, false);
          for (let i = 0; i < 3; i++) s += pyr(px - 108 + i * 13, 158, 6, 7, false);
          s += `<path d="M0 166 Q80 158 160 164 Q230 170 300 160 L300 200 L0 200 Z" fill="#E2C08A"/>`;
          const camel = (x, y, k, dir) => {
            const X = (d) => f1(x + dir * d * k), Yk = (d) => f1(y - d * k), rob = pick(r, ["#F2EDE2", "#3E5E8C", "#B5412F"]);
            return `<path d="M${X(-8)} ${Yk(14)} V${f1(y)} M${X(-5)} ${Yk(14)} V${f1(y)} M${X(4)} ${Yk(14)} V${f1(y)} M${X(7)} ${Yk(14)} V${f1(y)}" stroke="#8E6640" stroke-width="${f1(1.7 * k)}"/>`
              + `<path d="M${X(-11)} ${Yk(16)} Q${X(-9)} ${Yk(28)} ${X(-2)} ${Yk(26)} Q${X(4)} ${Yk(24)} ${X(9)} ${Yk(18)} L${X(9)} ${Yk(13)} L${X(-11)} ${Yk(13)} Z M${X(7)} ${Yk(18)} Q${X(13)} ${Yk(20)} ${X(14)} ${Yk(28)} L${X(19)} ${Yk(28)} L${X(19)} ${Yk(25)} L${X(16.5)} ${Yk(25)} Q${X(16)} ${Yk(17)} ${X(9)} ${Yk(14)} Z" fill="#A87C4E"/>`
              + `<path d="M${X(-5)} ${Yk(25)} L${X(-4)} ${Yk(34)} L${X(0)} ${Yk(34)} L${X(1)} ${Yk(25)} Z" fill="${rob}"/><circle cx="${X(-2)}" cy="${Yk(36.5)}" r="${f1(2.4 * k)}" fill="#8A5E3E"/>`;
          };
          const cx = btw(r, 70, 120);
          s += camel(cx + 40, 182, .9, -1) + camel(cx, 190, 1.15, -1);
          perch.push([px, 153 - 74 - 1], [px + 62, 150 - 66 - 1], [cx + 9, 162]);
          return { s, l, perch };
        } },
      { id: "sphinx", zh: "人面獅身像",
        see: ["獅子的身體趴著，頭是一個人的臉", "它的鼻子不見了，還是靜靜看著前方", "後面金字塔的頂上，還留著一點平滑的外層"],
        spots: ["人面獅身像的頭巾上", "長長的背上"],
        draw(c) {
          const { r } = c; let s = `<rect x="0" y="144" width="300" height="56" fill="#E8CD9C"/>`, l = ""; const perch = [];
          const kx = btw(r, 222, 236);
          s += `<path d="M${f1(kx - 70)} 150 L${f1(kx)} 60 L${f1(kx + 20)} 150 Z" fill="#DDB97E"/><path d="M${f1(kx + 20)} 150 L${f1(kx)} 60 L${f1(kx + 70)} 150 Z" fill="#BC965E"/><path d="M${f1(kx)} 60 L${f1(kx - 9)} 71.6 L${f1(kx + 9)} 71.6 Z" fill="#EEDDB6"/>`;
          s += `<rect x="0" y="164" width="300" height="36" fill="#D6B07A"/><path d="M0 164 H300" stroke="#B89060" stroke-width="1.5"/>`;
          const sx = btw(r, 110, 122), bd = "#CFA36A", dk = "#B0844E";
          s += `<path d="M${f1(sx - 36)} 172 L${f1(sx - 36)} 163 Q${f1(sx - 34)} 157 ${f1(sx - 10)} 157 L${f1(sx - 6)} 142 Q${f1(sx - 2)} 130 ${f1(sx + 10)} 128 L${f1(sx + 40)} 130 Q${f1(sx + 100)} 124 ${f1(sx + 142)} 132 Q${f1(sx + 158)} 138 ${f1(sx + 158)} 172 Z" fill="${bd}"/>`;
          s += `<path d="M${f1(sx - 6)} 160 H${f1(sx + 156)} V172 H${f1(sx - 6)} Z" fill="${dk}" opacity=".45"/><path d="M${f1(sx - 36)} 164 H${f1(sx - 8)} M${f1(sx + 120)} 171 Q${f1(sx + 122)} 148 ${f1(sx + 146)} 146" stroke="${dk}" stroke-width="1.4" fill="none"/>`;
          s += `<path d="M${f1(sx + 2)} 134 L${f1(sx + 4)} 104 Q${f1(sx + 10)} 92 ${f1(sx + 22)} 93 Q${f1(sx + 32)} 96 ${f1(sx + 33)} 106 L${f1(sx + 36)} 136 Z" fill="#C99B60"/>`;
          let st = ""; for (let y = 108; y < 136; y += 5) st += `M${f1(sx + 8)} ${y} H${f1(sx + 34)} `;
          s += `<path d="${st}" stroke="${dk}" stroke-width="1.1"/>`;
          s += `<path d="M${f1(sx + 4)} 104 L${f1(sx - 1)} 110 L${f1(sx)} 115 L${f1(sx - 3)} 118 L${f1(sx - 1)} 121 L${f1(sx + 1)} 126 L${f1(sx + 6)} 129 L${f1(sx + 13)} 128 L${f1(sx + 13)} 104 Z" fill="#D9AF77"/><ellipse cx="${f1(sx + 6)}" cy="110.5" rx="1.6" ry="1" fill="#5A4030"/><ellipse cx="${f1(sx + 17)}" cy="114" rx="2.2" ry="4" fill="#BE9058"/>`;
          if (r() < .6) { const tx = btw(r, 20, 70); s += `<path d="M${f1(tx)} 186 v-8 h3 v8 Z M${f1(tx + 8)} 186 v-9 h3 v9 Z" fill="${pick(r, ["#3E5E8C", "#B5412F", "#5A6E4A"])}"/><circle cx="${f1(tx + 1.5)}" cy="176" r="1.8" fill="#6A4A34"/><circle cx="${f1(tx + 9.5)}" cy="175" r="1.8" fill="#6A4A34"/>`; }
          perch.push([sx + 18, 92], [sx + 120, 128.5], [kx, 59]);
          return { s, l, perch };
        } },
      { id: "felucca", zh: "尼羅河三角帆船",
        see: ["白色的三角帆在河上慢慢轉彎", "岸邊的椰棗樹一棵接著一棵排下去", "船夫拉著繩子，船就跟著風走"],
        spots: ["帆頂的長桿上", "船頭上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          let b = ""; for (let x = btw(r, -4, 0); x < 300;) { const w = btw(r, 10, 22), t = btw(r, 108, 122); b += `<rect x="${f1(x)}" y="${f1(t)}" width="${f1(w)}" height="${f1(128 - t)}" fill="${pick(r, ["#D8C9AA", "#CDBDA0", "#E0D3B8"])}"/>`; x += w + btw(r, 0, 4); }
          s += b + `<rect x="0" y="124" width="300" height="6" fill="#B9A479"/>`;
          const palm = (x, y, k) => {
            let d = ""; for (const [a, b2, e, f] of [[-7, -7, -14, 2], [-3, -9, -10, -6], [3, -9, 10, -6], [7, -7, 14, 2], [-4, -4, -11, 8], [4, -4, 11, 8]]) d += `M${f1(x + k)} ${f1(y - 30 * k)} q${f1(a * k)} ${f1(b2 * k)} ${f1(e * k)} ${f1(f * k)} `;
            return `<path d="M${f1(x)} ${f1(y)} Q${f1(x + 3 * k)} ${f1(y - 14 * k)} ${f1(x + k)} ${f1(y - 30 * k)}" stroke="#7A5E44" stroke-width="${f1(2.4 * k)}" fill="none"/><path d="${d}" stroke="#4F7340" stroke-width="${f1(2.2 * k)}" stroke-linecap="round" fill="none"/>`;
          };
          for (let i = 0; i < 7; i++) s += palm(btw(r, 0, 300), 127, btw(r, .5, .75));
          s += water(130, "#8FB5B8", "#4F7E86", r);
          const fel = (x, y, k) => {
            const A = [x - 20 * k, y - 10 * k], B = [x + 10 * k, y - 92 * k], C = [x + 16 * k, y - 12 * k], Q = [x - 18 * k, y - 56 * k];
            return `<path d="M${f1(A[0])} ${f1(A[1])} Q${f1(Q[0])} ${f1(Q[1])} ${f1(B[0])} ${f1(B[1])} L${f1(C[0])} ${f1(C[1])} Z" fill="#F7F3EA" stroke="#C9C0AE" stroke-width="${f1(.8 * k)}"/><path d="M${f1(x + 2 * k)} ${f1(y - 14 * k)} L${f1(B[0])} ${f1(B[1])} L${f1(C[0])} ${f1(C[1])} Z" fill="#E2DACA"/>`
              + `<path d="M${f1(A[0] - 3 * k)} ${f1(A[1] + 3 * k)} Q${f1(Q[0] - 1 * k)} ${f1(Q[1])} ${f1(B[0] + 1 * k)} ${f1(B[1] - 2 * k)} M${f1(x - 4 * k)} ${f1(y - 6 * k)} V${f1(y - 34 * k)}" stroke="#6A4A36" stroke-width="${f1(1.4 * k)}" fill="none"/>`
              + `<path d="M${f1(x - 26 * k)} ${f1(y - 9 * k)} Q${f1(x)} ${f1(y - 5 * k)} ${f1(x + 24 * k)} ${f1(y - 9 * k)} L${f1(x + 18 * k)} ${f1(y)} L${f1(x - 20 * k)} ${f1(y)} Z" fill="#F2EEE6"/><path d="M${f1(x - 24 * k)} ${f1(y - 6 * k)} Q${f1(x)} ${f1(y - 2 * k)} ${f1(x + 22 * k)} ${f1(y - 6 * k)}" stroke="#2F6E8E" stroke-width="${f1(1.8 * k)}" fill="none"/>`;
          };
          const mx = btw(r, 170, 200);
          s += fel(btw(r, 246, 268), 142, .38) + fel(btw(r, 70, 100), 152, .55) + fel(mx, 172, 1.05);
          s += `<path d="M0 190 Q60 186 120 192 L120 200 L0 200 Z" fill="#B9A27A"/>` + palm(btw(r, 14, 30), 194, 1.1);
          perch.push([mx + 10.5 * 1.05, 172 - 95 * 1.05], [mx - 24 * 1.05, 172 - 9 * 1.05]);
          return { s, l, perch };
        } },
      { id: "mosque", zh: "穆罕默德阿里清真寺",
        see: ["山上的清真寺有好多圓頂疊在一起", "兩根細細的尖塔，像削好的鉛筆", "從城堡往下看，整個開羅都是淡淡的黃色"],
        spots: ["尖塔的最頂端", "大圓頂的頂上"],
        draw(c) {
          const { r } = c; let s = `<rect x="0" y="150" width="300" height="50" fill="#CDBB9A"/>`, l = ""; const perch = [];
          const mx = btw(r, 170, 184), st = "#DCD5C8", sh = "#C2BAAA", ld = "#9AA0A5";
          const dome = (cx, y0, w, d, f) => `<path d="M${f1(cx - w / 2)} ${f1(y0)} A${f1(w / 2)} ${f1(d)} 0 0 1 ${f1(cx + w / 2)} ${f1(y0)} Z" fill="${f}"/>`;
          s += `<path d="M0 170 Q60 162 100 150 L282 144 Q298 146 300 152 L300 200 L0 200 Z" fill="#B49A74"/>`;
          s += `<rect x="96" y="134" width="204" height="14" fill="#C8B590"/><path d="M96 132.5 H300" stroke="#C8B590" stroke-width="3" stroke-dasharray="4 3"/>`;
          for (const tx of [mx - 74, mx + 96]) s += `<rect x="${f1(tx)}" y="124" width="14" height="24" fill="#BFAA82"/><path d="M${f1(tx)} 122.5 h14" stroke="#BFAA82" stroke-width="3" stroke-dasharray="3 2"/>`;
          s += `<rect x="${f1(mx + 40)}" y="117" width="48" height="17" fill="${st}"/><path d="M${f1(mx + 44)} 131 v-6 q2.5 -4 5 0 v6 Z M${f1(mx + 54)} 131 v-6 q2.5 -4 5 0 v6 Z M${f1(mx + 64)} 131 v-6 q2.5 -4 5 0 v6 Z M${f1(mx + 74)} 131 v-6 q2.5 -4 5 0 v6 Z" fill="#8C8474"/>` + dome(mx + 64, 117, 12, 6, ld);
          s += `<rect x="${f1(mx - 40)}" y="110" width="80" height="24" fill="${st}"/><rect x="${f1(mx + 18)}" y="110" width="22" height="24" fill="${sh}"/>`;
          s += dome(mx - 24, 111, 30, 12, ld) + dome(mx + 24, 111, 30, 12, ld) + dome(mx - 37, 111, 10, 5, ld) + dome(mx + 37, 111, 10, 5, ld);
          s += `<rect x="${f1(mx - 18)}" y="94" width="36" height="12" fill="${st}"/><path d="M${f1(mx - 13)} 103 v-5 h3 v5 Z M${f1(mx - 5)} 103 v-5 h3 v5 Z M${f1(mx + 3)} 103 v-5 h3 v5 Z M${f1(mx + 11)} 103 v-5 h3 v5 Z" fill="#8C8474"/>` + dome(mx, 95, 44, 24, ld) + `<path d="M${f1(mx + 4)} 72 A22 24 0 0 1 ${f1(mx + 22)} 95 H${f1(mx + 10)} Z" fill="#82888D" opacity=".5"/><path d="M${f1(mx)} 71 V62" stroke="#7E7A70" stroke-width="1.3"/>`;
          let w = ""; for (let i = 0; i < 5; i++) w += `M${f1(mx - 36 + i * 15)} 130 v-9 q2.5 -4 5 0 v9 Z `;
          s += `<path d="${w}" fill="#8C8474"/>`;
          for (const m of [mx - 46, mx + 46]) s += `<rect x="${f1(m - 2.6)}" y="40" width="5.2" height="94" fill="#E2DCD0"/><rect x="${f1(m + .4)}" y="40" width="2.2" height="94" fill="${sh}"/><path d="M${f1(m - 4.2)} 64 h8.4 v2.4 h-8.4 Z M${f1(m - 4.2)} 88 h8.4 v2.4 h-8.4 Z" fill="#B3AB9C"/><path d="M${f1(m - 3)} 40 L${f1(m)} 22 L${f1(m + 3)} 40 Z" fill="${ld}"/><path d="M${f1(m)} 22 V18" stroke="#7E7A70" stroke-width="1"/>`;
          let hs = "", wn = ""; for (let x = btw(r, -6, 0); x < 300;) { const w2 = btw(r, 14, 26), t = btw(r, 172, 186); hs += `<rect x="${f1(x)}" y="${f1(t)}" width="${f1(w2)}" height="${f1(200 - t)}" fill="${pick(r, ["#D6C4A2", "#CBB792", "#E0D1B2", "#BFA987"])}"/>`; wn += `M${f1(x + 3)} ${f1(t + 4)} h3 v4 h-3 Z M${f1(x + w2 - 7)} ${f1(t + 4)} h3 v4 h-3 Z `; x += w2 + btw(r, 0, 2); }
          s += hs + `<path d="${wn}" fill="#6A5A48" opacity=".6"/>`;
          perch.push([mx + 46, 17], [mx, 61], [mx - 24, 99]);
          return { s, l, perch };
        } },
      { id: "khan", zh: "汗哈利利市集",
        see: ["石頭拱門下的小巷掛滿了黃銅燈籠", "小店裡的東西堆得高高的，顏色好多", "老闆一直招手，請大家進去看看"],
        spots: ["一盞銅燈籠的頂上", "拱門上方的石頭邊上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          const mz = btw(r, 272, 282);
          s += `<rect x="${f1(mz - 6)}" y="70" width="12" height="60" fill="#C9AC82"/><rect x="${f1(mz - 4.5)}" y="52" width="9" height="18" fill="#D4B88E"/><path d="M${f1(mz - 8)} 70 h16 v2.5 h-16 Z M${f1(mz - 6.5)} 52 h13 v2 h-13 Z" fill="#A88A60"/><rect x="${f1(mz - 3)}" y="42" width="6" height="10" fill="#D4B88E"/><ellipse cx="${f1(mz)}" cy="40" rx="3.6" ry="5" fill="#C9AC82"/><path d="M${f1(mz)} 35 V30" stroke="#8A6E48" stroke-width="1"/>`;
          s += `<rect x="0" y="110" width="84" height="66" fill="#B8936A"/><rect x="256" y="120" width="44" height="56" fill="#B8936A"/>`;
          s += `<rect x="82" y="72" width="176" height="104" fill="#C8A676"/><path d="M82 84 H258 M82 96 H258 M82 150 H258 M82 162 H258" stroke="#AE895A" stroke-width="3"/>`;
          let cr = ""; for (let x = 83; x < 254; x += 7) cr += `M${x} 72 v-4 l2.5 -3.5 l2.5 3.5 v4 Z `;
          s += `<path d="${cr}" fill="#C8A676"/>`;
          const arch = "M116 176 V112 Q116 88 170 80 Q224 88 224 112 V176 Z";
          s += `<path d="${arch}" fill="#5E4330"/><path d="M116 176 V112 Q116 88 170 80 Q224 88 224 112 V176" stroke="#EAD7B2" stroke-width="5" fill="none"/><path d="M116 176 V112 Q116 88 170 80 Q224 88 224 112 V176" stroke="#8A6440" stroke-width="5" stroke-dasharray="5 5" fill="none"/>`;
          s += `<path d="M154 176 V142 Q154 130 170 126 Q186 130 186 142 V176 Z" fill="#D9C094"/><path d="M118 176 L154 168 V176 Z M222 176 L186 168 V176 Z" fill="#8A6A4A"/>`;
          let gd = "";
          for (const [x0, x1] of [[119, 150], [190, 221]]) for (let i = 0; i < 6; i++) { const gx = btw(r, x0, x1 - 8), gy = btw(r, 128, 160); gd += `<rect x="${f1(gx)}" y="${f1(gy)}" width="${f1(btw(r, 5, 9))}" height="${f1(btw(r, 7, 14))}" fill="${pick(r, ["#B5412F", "#2F6E8E", "#D9A441", "#5E7E3E", "#8E3A6A"])}"/>`; }
          s += gd;
          const lan = (x, y, k) => `<path d="M${f1(x - 2.2 * k)} ${f1(y)} L${f1(x)} ${f1(y - 3 * k)} L${f1(x + 2.2 * k)} ${f1(y)} Z" fill="#A87A2A"/><path d="M${f1(x)} ${f1(y)} L${f1(x + 4.2 * k)} ${f1(y + 5 * k)} Q${f1(x + 4.8 * k)} ${f1(y + 10 * k)} ${f1(x)} ${f1(y + 14 * k)} Q${f1(x - 4.8 * k)} ${f1(y + 10 * k)} ${f1(x - 4.2 * k)} ${f1(y + 5 * k)} Z" fill="#D9A441"/><path d="M${f1(x - 1.6 * k)} ${f1(y + 5 * k)} h${f1(3.2 * k)} v${f1(5 * k)} h${f1(-3.2 * k)} Z" fill="${pick(r, ["#C8402E", "#2E7FA6", "#3E8E5A"])}"/><path d="M${f1(x)} ${f1(y + 14 * k)} v${f1(3 * k)}" stroke="#A87A2A" stroke-width="${f1(1.2 * k)}"/>`;
          s += `<path d="M120 100 Q170 124 220 100" stroke="#3B2C22" stroke-width=".9" fill="none"/>`;
          let ch = "", ls = ""; const top = [];
          for (let i = 0; i < 5; i++) { const x = 132 + i * 19, t = (x - 120) / 100, ys = 100 + 24 * t * (1 - t), y = ys + 4 + (i % 2) * 7; ch += `M${f1(x)} ${f1(ys)} V${f1(y - 3)} `; ls += lan(x, y, 1.15); top.push([x, y - 3.5]); }
          s += `<path d="${ch}" stroke="#3B2C22" stroke-width=".8"/>` + ls;
          s += `<path d="M0 120 H84 L88 132 H0 Z" fill="#B5412F"/><path d="M2 126 H86" stroke="#F2E3C4" stroke-width="12" stroke-dasharray="6 6" opacity=".55"/><path d="M256 128 H300 V138 H252 Z" fill="#2F6E8E"/>`;
          let l2 = ""; for (let i = 0; i < 4; i++) l2 += lan(12 + i * 18, 136 + (i % 2) * 5, 1);
          s += `<path d="M0 134 H84" stroke="#3B2C22" stroke-width=".8"/>` + l2 + lan(270, 141, 1) + lan(288, 145, .9);
          s += `<rect x="0" y="176" width="300" height="24" fill="#CDB48E"/>`;
          let pp = ""; for (let i = 0; i < 3; i++) { const px = btw(r, 20, 290), py = btw(r, 186, 196); pp += `M${f1(px - 2.5)} ${f1(py)} L${f1(px - 2)} ${f1(py - 10)} h4 L${f1(px + 2.5)} ${f1(py)} Z M${f1(px - 2)} ${f1(py - 12)} a2 2 0 1 1 4 0 a2 2 0 1 1 -4 0 Z `; }
          s += `<path d="${pp}" fill="#5A4A3E"/>`;
          perch.push(top[2], [100, 64]);
          return { s, l, perch };
        } },
      { id: "cairotower", zh: "開羅塔",
        see: ["細長的塔身像一層一層編起來的網", "塔頂的形狀像一朵打開的蓮花", "塔就站在尼羅河中間的島上"],
        spots: ["塔頂的天線上", "觀景台的邊上"],
        draw(c) {
          const { r } = c; let s = "", l = ""; const perch = [];
          let b = ""; for (let x = btw(r, -4, 0); x < 300;) { const w = btw(r, 10, 22), t = btw(r, 100, 128); b += `<rect x="${f1(x)}" y="${f1(t)}" width="${f1(w)}" height="${f1(134 - t)}" fill="${pick(r, ["#D8CCB2", "#CFC2A6", "#E2D8C2"])}"/>`; x += w + btw(r, 0, 4); }
          s += b + water(132, "#9BBDBF", "#4F7E86", r);
          const palm = (x, y, k) => {
            let d = ""; for (const [a, b2, e, f] of [[-7, -7, -14, 2], [-3, -9, -10, -6], [3, -9, 10, -6], [7, -7, 14, 2], [-4, -4, -11, 8], [4, -4, 11, 8]]) d += `M${f1(x + k)} ${f1(y - 30 * k)} q${f1(a * k)} ${f1(b2 * k)} ${f1(e * k)} ${f1(f * k)} `;
            return `<path d="M${f1(x)} ${f1(y)} Q${f1(x + 3 * k)} ${f1(y - 14 * k)} ${f1(x + k)} ${f1(y - 30 * k)}" stroke="#7A5E44" stroke-width="${f1(2.4 * k)}" fill="none"/><path d="${d}" stroke="#4F7340" stroke-width="${f1(2.2 * k)}" stroke-linecap="round" fill="none"/>`;
          };
          s += `<path d="M0 152 Q80 144 150 146 Q230 148 300 143 L300 158 Q150 154 0 162 Z" fill="#8FA56F"/>`;
          const tx = btw(r, 176, 196), tw = "#C9AE86", td = "#9A7F5C";
          for (const px of [btw(r, 20, 60), btw(r, 70, 120), tx - btw(r, 24, 40), tx + btw(r, 22, 40), btw(r, 250, 290)]) s += palm(px, 154, btw(r, .7, .95));
          s += `<rect x="${f1(tx - 15)}" y="140" width="30" height="11" fill="#DCD0B6"/><rect x="${f1(tx - 15)}" y="144" width="30" height="2" fill="#8C7E66"/>`;
          s += `<rect x="${f1(tx - 7)}" y="66" width="14" height="76" fill="${tw}"/><rect x="${f1(tx + 3)}" y="66" width="4" height="76" fill="${td}" opacity=".45"/>`;
          let lt = ""; for (let y = 68; y < 138; y += 7) lt += `M${f1(tx - 7)} ${y} l14 7 M${f1(tx + 7)} ${y} l-14 7 `;
          s += `<path d="${lt}" stroke="${td}" stroke-width="1"/>`;
          s += `<path d="M${f1(tx - 7)} 67 Q${f1(tx - 9)} 58 ${f1(tx - 15)} 52 L${f1(tx + 15)} 52 Q${f1(tx + 9)} 58 ${f1(tx + 7)} 67 Z" fill="${tw}"/><path d="M${f1(tx - 4)} 65 L${f1(tx - 10)} 53 M${f1(tx)} 65 V53 M${f1(tx + 4)} 65 L${f1(tx + 10)} 53" stroke="${td}" stroke-width="1"/>`;
          s += `<rect x="${f1(tx - 13)}" y="42" width="26" height="10" fill="#E6DCC8"/><rect x="${f1(tx - 13)}" y="45" width="26" height="4" fill="#5E6C74"/><rect x="${f1(tx - 11)}" y="39" width="22" height="3" fill="#D2C6AE"/><rect x="${f1(tx - 1.3)}" y="18" width="2.6" height="21" fill="#D9D0C0"/><rect x="${f1(tx - 1.3)}" y="18" width="2.6" height="3" fill="#C9473A"/>`;
          if (r() < .7) s += boat(btw(r, 30, 120), btw(r, 172, 188), 1, true);
          perch.push([tx, 17], [tx - 12, 38.5]);
          return { s, l, perch };
        } },
    ],
  },
};
