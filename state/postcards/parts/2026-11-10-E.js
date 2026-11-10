var CITIES_PART = {
  kyoto: {
    zh: "京都", de: "Kyōto", gift: "一個小小的御守",
    sights: [
      { id: "yasaka", zh: "八坂塔", see: ["石板坡道兩邊都是木頭老房子", "五重塔從屋頂後面高高冒出來", "穿和服的人沿著坡道慢慢往上走"], spots: ["五重塔頂端的相輪上", "町家屋頂的瓦片上"],
        draw(c) {
          const { r, sea } = c, k = btw(r, .98, 1.1), px = btw(r, 180, 205), gy = (x) => 190 - x * .1, perch = [];
          const R = (cx, yb, w, t) => `<path d="M${f1(cx - w / 2)} ${f1(yb - 4)} Q${f1(cx)} ${f1(yb + 3)} ${f1(cx + w / 2)} ${f1(yb - 4)} L${f1(cx + w * .3)} ${f1(yb - t)} L${f1(cx - w * .3)} ${f1(yb - t)} Z" fill="#3B3532"/>`;
          let s = hills(118, "#86A182", r, 14) + hills(138, "#6F8F6A", r, 8), y = 158;
          for (let i = 0; i < 5; i++) { const bw = (30 - i * 3) * k, bh = (14 - i * .8) * k; s += `<rect x="${f1(px - bw / 2)}" y="${f1(y - bh)}" width="${f1(bw)}" height="${f1(bh)}" fill="#6B4630"/><rect x="${f1(px - bw / 2)}" y="${f1(y - bh)}" width="${f1(bw)}" height="${f1(2 * k)}" fill="#E4D8C0"/>` + R(px, y - bh, (64 - i * 7) * k, 7 * k); y -= bh + 6 * k; }
          s += `<path d="M${f1(px)} ${f1(y + 2)} v${f1(-28 * k)}" stroke="#B49A5A" stroke-width="${f1(2.2 * k)}"/><path d="M${f1(px - 3)} ${f1(y - 6 * k)} h6 M${f1(px - 3)} ${f1(y - 10 * k)} h6 M${f1(px - 3)} ${f1(y - 14 * k)} h6 M${f1(px - 3)} ${f1(y - 18 * k)} h6" stroke="#B49A5A" stroke-width="1.2"/>`;
          perch.push([px, y + 2 - 28 * k]);
          for (let i = 0; i < 2; i++) { const x = btw(r, 15, 130); s += tree(x, gy(x) - 26, 1.2, sea, r); }
          let x = btw(r, -10, 0);
          while (x < 300) {
            const w = btw(r, 30, 40), h = btw(r, 30, 37), yb = gy(x + w / 2), lo = yb - h * .5;
            let lat = ""; for (let q = x + 3; q < x + w - 2; q += 3.4) lat += `M${f1(q)} ${f1(lo + 3)}v${f1(h * .5)}`;
            s += `<rect x="${f1(x)}" y="${f1(lo)}" width="${f1(w)}" height="${f1(h * .5 + 16)}" fill="${pick(r, ["#6A4632", "#5E3E2C", "#74503A"])}"/><path d="${lat}" stroke="#3E2A1E" stroke-width=".8"/>`;
            s += `<rect x="${f1(x + 2)}" y="${f1(yb - h)}" width="${f1(w - 4)}" height="${f1(h * .5 - 4)}" fill="#E8DFCB"/><rect x="${f1(x + w * .25)}" y="${f1(yb - h + 3)}" width="${f1(w * .5)}" height="${f1(h * .5 - 10)}" fill="#5A3E2E" opacity=".8"/>`;
            s += `<path d="M${f1(x - 3)} ${f1(lo + 1)} L${f1(x + w + 3)} ${f1(lo + 1)} L${f1(x + w)} ${f1(lo - 5)} L${f1(x)} ${f1(lo - 5)} Z M${f1(x - 3)} ${f1(yb - h + 1)} L${f1(x + w + 3)} ${f1(yb - h + 1)} L${f1(x + w - 3)} ${f1(yb - h - 7)} L${f1(x + 3)} ${f1(yb - h - 7)} Z" fill="#45403D"/>`;
            if (sea === "winter") s += `<rect x="${f1(x + 3)}" y="${f1(yb - h - 8.5)}" width="${f1(w - 6)}" height="2.5" fill="#F4F4F2"/>`;
            if (perch.length < 2 && x > 50 && x < 140) perch.push([x + w / 2, yb - h - 7]);
            x += w + btw(r, 0, 2);
          }
          s += `<path d="M0 200 L0 ${f1(gy(0) + 2)} L300 ${f1(gy(300) + 2)} L300 200 Z" fill="#C9BCA4"/><path d="M20 196 l40 -4 M90 192 l50 -5 M170 186 l40 -4 M230 180 l50 -5" stroke="#AFA088" stroke-width="1"/>`;
          if (r() < .7) { const fx = btw(r, 40, 150), fy = gy(fx) + 10; s += `<path d="M${f1(fx - 3)} ${f1(fy)} L${f1(fx + 3)} ${f1(fy)} L${f1(fx + 1.6)} ${f1(fy - 10)} L${f1(fx - 1.6)} ${f1(fy - 10)} Z" fill="${pick(r, ["#B8463A", "#4F6A8E", "#C98AA0", "#6E8A5A"])}"/><circle cx="${f1(fx)}" cy="${f1(fy - 12)}" r="2" fill="#2E2A28"/>`; }
          if (perch.length < 2) perch.push([60, gy(60) - 40]);
          return { s, l: "", perch };
        } },
      { id: "fushimi", zh: "伏見稻荷千本鳥居", see: ["朱紅色的鳥居一座接一座排成隧道", "鳥居的柱子上寫滿了捐獻者的名字", "到處都有叼著鑰匙的狐狸石像"], spots: ["最前面那座鳥居的橫木上", "狐狸石像的頭上"],
        draw(c) {
          const { r, sea } = c, vx = btw(r, 176, 194), vy = 124, red = "#D2462E", blk = "#2A2422", perch = [];
          let s = hills(92, "#5E7F52", r, 16) + hills(112, "#4D6C45", r, 10);
          s += `<path d="M${f1(vx - 84)} 200 L${f1(vx + 84)} 200 L${f1(vx + 1.5)} ${vy} L${f1(vx - 1.5)} ${vy} Z" fill="#BBA98A"/>`;
          for (let i = 12; i >= 0; i--) {
            const kk = .88 * Math.pow(.8, i), g = vy + 70 * kk, W = 150 * kk, H = 136 * kk, x0 = vx - W / 2, pw = Math.max(.8, 8 * kk), top = g - H, sh = i > 7 ? "#A8402E" : red;
            s += `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(pw)}" height="${f1(H)}" fill="${sh}"/><rect x="${f1(vx + W / 2 - pw)}" y="${f1(top)}" width="${f1(pw)}" height="${f1(H)}" fill="${sh}"/>`;
            if (i < 8) s += `<rect x="${f1(x0 - .5)}" y="${f1(g - 7 * kk)}" width="${f1(pw + 1)}" height="${f1(7 * kk)}" fill="${blk}"/><rect x="${f1(vx + W / 2 - pw - .5)}" y="${f1(g - 7 * kk)}" width="${f1(pw + 1)}" height="${f1(7 * kk)}" fill="${blk}"/><rect x="${f1(vx - 2 * kk)}" y="${f1(top + 2 * kk)}" width="${f1(4 * kk)}" height="${f1(14 * kk)}" fill="${sh}"/>`;
            s += `<rect x="${f1(x0 - 5 * kk)}" y="${f1(top + 15 * kk)}" width="${f1(W + 10 * kk)}" height="${f1(5 * kk)}" fill="${sh}"/>`;
            s += `<path d="M${f1(x0 - 13 * kk)} ${f1(top - 4 * kk)} Q${f1(vx)} ${f1(top + 4 * kk)} ${f1(x0 + W + 13 * kk)} ${f1(top - 4 * kk)} L${f1(x0 + W + 11 * kk)} ${f1(top + 3 * kk)} Q${f1(vx)} ${f1(top + 9 * kk)} ${f1(x0 - 11 * kk)} ${f1(top + 3 * kk)} Z" fill="${sh}"/><path d="M${f1(x0 - 13 * kk)} ${f1(top - 4 * kk)} Q${f1(vx)} ${f1(top + 4 * kk)} ${f1(x0 + W + 13 * kk)} ${f1(top - 4 * kk)}" stroke="${blk}" stroke-width="${f1(Math.max(.6, 2.6 * kk))}" fill="none"/>`;
            if (i === 0) perch.push([vx - 42, top - 1], [vx + 42, top - 1]);
          }
          for (let i = 0; i < 2; i++) { const x = i ? btw(r, 272, 296) : btw(r, 4, 30); s += tree(x, 198, 1.3, sea, r); }
          if (r() < .75) {
            const fx = r() < .5 ? vx - 98 : vx + 98, y = 194;
            s += `<rect x="${f1(fx - 7)}" y="${y - 10}" width="14" height="10" fill="#9C968A"/><path d="M${f1(fx - 5)} ${y - 10} Q${f1(fx - 6)} ${y - 22} ${f1(fx - 2)} ${y - 26} L${f1(fx - 3)} ${y - 31} L${f1(fx - .5)} ${y - 28.5} L${f1(fx + 1.5)} ${y - 31.5} L${f1(fx + 2)} ${y - 26} Q${f1(fx + 6)} ${y - 22} ${f1(fx + 5)} ${y - 10} Z" fill="#B5AFA3"/><path d="M${f1(fx - 3.5)} ${y - 22} L${f1(fx + 3.5)} ${y - 22} L${f1(fx)} ${y - 16} Z" fill="#C9392B"/>`;
            perch.push([fx, y - 31]);
          }
          return { s, l: "", perch };
        } },
      { id: "kinkakuji", zh: "金閣寺", see: ["整座樓閣貼滿了金箔，亮得像小太陽", "池塘裡有一座一模一樣的倒影", "屋頂上站著一隻金色的鳳凰"], spots: ["屋頂鳳凰的旁邊", "池中小島的松樹枝上"],
        draw(c) {
          const { r, sea } = c, px = btw(r, 168, 196), k = btw(r, .92, 1.05), B = 150, gold = "#D6A637", win = sea === "winter", rc = win ? "#E6EAEA" : "#3A3430", perch = [];
          const R = (cx, yb, w, t) => `<path d="M${f1(cx - w / 2)} ${f1(yb - 4)} Q${f1(cx)} ${f1(yb + 3)} ${f1(cx + w / 2)} ${f1(yb - 4)} L${f1(cx + w * .3)} ${f1(yb - t)} L${f1(cx - w * .3)} ${f1(yb - t)} Z" fill="${rc}"/>` + (win ? `<path d="M${f1(cx - w / 2)} ${f1(yb - 4)} Q${f1(cx)} ${f1(yb + 3)} ${f1(cx + w / 2)} ${f1(yb - 4)}" stroke="#3A3430" stroke-width="1.6" fill="none"/>` : "");
          const pine = (x, y, q) => `<path d="M${f1(x)} ${f1(y)} q${f1(-3 * q)} ${f1(-10 * q)} ${f1(2 * q)} ${f1(-20 * q)}" stroke="#5A4232" stroke-width="${f1(2 * q)}" fill="none"/><ellipse cx="${f1(x - 5 * q)}" cy="${f1(y - 12 * q)}" rx="${f1(9 * q)}" ry="${f1(3.5 * q)}" fill="#3F5E3A"/><ellipse cx="${f1(x + 4 * q)}" cy="${f1(y - 18 * q)}" rx="${f1(8 * q)}" ry="${f1(3.2 * q)}" fill="#476A40"/><ellipse cx="${f1(x + 1 * q)}" cy="${f1(y - 23 * q)}" rx="${f1(5.5 * q)}" ry="${f1(2.6 * q)}" fill="#3F5E3A"/>` + (win ? `<ellipse cx="${f1(x + 4 * q)}" cy="${f1(y - 19.5 * q)}" rx="${f1(6 * q)}" ry="${f1(1.3 * q)}" fill="#F2F4F4"/>` : "");
          let s = hills(108, "#7F9B78", r, 16) + hills(130, "#62845C", r, 10);
          for (let i = 0; i < 5; i++) s += tree(btw(r, 0, 300), btw(r, 148, 152), btw(r, .8, 1.1), sea, r);
          const y1 = B - 22 * k, y2 = y1 - 5 * k - 17 * k, y3 = y2 - 7 * k - 15 * k, yt = y3 - 17 * k;
          s += `<rect x="${f1(px - 40 * k)}" y="${f1(y1)}" width="${f1(80 * k)}" height="${f1(22 * k)}" fill="#D8C9A3"/><path d="M${f1(px - 30 * k)} ${f1(y1 + 2)} v${f1(20 * k - 2)} M${f1(px - 10 * k)} ${f1(y1 + 2)} v${f1(20 * k - 2)} M${f1(px + 10 * k)} ${f1(y1 + 2)} v${f1(20 * k - 2)} M${f1(px + 30 * k)} ${f1(y1 + 2)} v${f1(20 * k - 2)}" stroke="#8A6E4A" stroke-width="1.4"/>` + R(px, y1, 96 * k, 6 * k);
          s += `<rect x="${f1(px - 38 * k)}" y="${f1(y2)}" width="${f1(76 * k)}" height="${f1(17 * k)}" fill="${gold}"/><rect x="${f1(px - 40 * k)}" y="${f1(y2 + 13 * k)}" width="${f1(80 * k)}" height="${f1(1.6 * k)}" fill="#A87A24"/><path d="M${f1(px - 20 * k)} ${f1(y2 + 3 * k)} v${f1(9 * k)} M${f1(px)} ${f1(y2 + 3 * k)} v${f1(9 * k)} M${f1(px + 20 * k)} ${f1(y2 + 3 * k)} v${f1(9 * k)}" stroke="#A87A24" stroke-width="1.4"/>` + R(px, y2, 104 * k, 8 * k);
          s += `<rect x="${f1(px - 20 * k)}" y="${f1(y3)}" width="${f1(40 * k)}" height="${f1(15 * k)}" fill="${gold}"/><path d="M${f1(px - 30 * k)} ${f1(y3 - 3 * k)} Q${f1(px)} ${f1(y3 + 3 * k)} ${f1(px + 30 * k)} ${f1(y3 - 3 * k)} L${f1(px + 4 * k)} ${f1(yt)} L${f1(px - 4 * k)} ${f1(yt)} Z" fill="${rc}"/>`;
          s += `<path d="M${f1(px - 3 * k)} ${f1(yt)} L${f1(px + 3 * k)} ${f1(yt)} L${f1(px + 6 * k)} ${f1(yt - 6 * k)} L${f1(px + 1 * k)} ${f1(yt - 3 * k)} L${f1(px)} ${f1(yt - 8 * k)} L${f1(px - 1 * k)} ${f1(yt - 3 * k)} L${f1(px - 6 * k)} ${f1(yt - 6 * k)} Z" fill="${gold}"/>`;
          perch.push([px - 9 * k, yt + 3 * k]);
          s += water(B, "#9BC0C4", "#5F8F93", r);
          s += `<rect x="${f1(px - 40 * k)}" y="${B}" width="${f1(80 * k)}" height="${f1(22 * k)}" fill="#D8C9A3" opacity=".3"/><rect x="${f1(px - 48 * k)}" y="${f1(2 * B - y1)}" width="${f1(96 * k)}" height="${f1(5 * k)}" fill="#3A3430" opacity=".25"/><rect x="${f1(px - 38 * k)}" y="${f1(2 * B - y2 - 17 * k)}" width="${f1(76 * k)}" height="${f1(17 * k)}" fill="${gold}" opacity=".4"/><rect x="${f1(px - 20 * k)}" y="${f1(2 * B - y3 - 15 * k)}" width="${f1(40 * k)}" height="${f1(15 * k)}" fill="${gold}" opacity=".35"/>`;
          const ix = btw(r, 40, 85), jx = btw(r, 245, 280);
          s += `<ellipse cx="${f1(ix)}" cy="172" rx="26" ry="5" fill="#6E7F55"/><ellipse cx="${f1(ix + 12)}" cy="171" rx="6" ry="3" fill="#8E8A80"/>` + pine(ix - 6, 172, 1.2) + pine(ix + 10, 171, .8);
          s += `<ellipse cx="${f1(jx)}" cy="164" rx="16" ry="4" fill="#6E7F55"/>` + pine(jx, 164, .9);
          perch.push([ix - 4, 172 - 23 * 1.2 - 3]);
          return { s, l: "", perch };
        } },
      { id: "arashiyama", zh: "嵐山竹林小徑", see: ["竹子高得把天空擠成一條細細的縫", "風一吹，整片竹林就沙沙作響", "小路兩旁圍著用竹枝編的矮籬笆"], spots: ["竹籬笆的頂上", "一根竹子的竹節上"],
        draw(c) {
          const { r, sea } = c, vx = btw(r, 160, 178), vy = 132, perch = [];
          const topY = (x) => (x < vx - 22 ? 60 + 32 * x / (vx - 22) : x > vx + 22 ? 92 - 70 * (x - vx - 22) / (278 - vx) : 96);
          let s = `<path d="M0 200 L0 60 L${f1(vx - 22)} 92 L${f1(vx - 6)} 100 L${f1(vx + 6)} 100 L${f1(vx + 22)} 92 L300 22 L300 200 Z" fill="#4E7A42"/><path d="M${f1(vx - 22)} 92 L${f1(vx - 6)} 100 L${f1(vx + 6)} 100 L${f1(vx + 22)} 92 L${f1(vx + 10)} 134 L${f1(vx - 10)} 134 Z" fill="#9DBF78" opacity=".55"/>`;
          const stalk = (x, base, w, top, col) => { let n = ""; for (let y = base - 12; y > top + 6; y -= 13) n += `M${f1(x - w / 2)} ${f1(y)}h${f1(w)}`; return `<path d="M${f1(x)} ${f1(base)} L${f1(x)} ${f1(top)}" stroke="${col}" stroke-width="${f1(w)}"/>` + (w > 2.6 ? `<path d="${n}" stroke="#D7E2A8" stroke-width=".7"/>` : ""); };
          for (let i = 0; i < 20; i++) {
            const x = btw(r, 0, 300), d = Math.abs(x - vx);
            if (d < 9) continue;
            s += stalk(x, vy + 4 + d * .45, .9 + d * .03, Math.max(0, topY(x) - btw(r, 0, 8)), pick(r, ["#7DA352", "#6E9A4E", "#8DB062"]));
          }
          let lf = ["", ""]; for (let i = 0; i < 30; i++) { const x = btw(r, 0, 300); if (Math.abs(x - vx) > 20) { const y = topY(x) + btw(r, -4, 12); lf[i % 2] += `M${f1(x)} ${f1(y)}l${f1(btw(r, 4, 8))} ${f1(btw(r, -3, 3))}M${f1(x)} ${f1(y)}l${f1(-btw(r, 4, 8))} ${f1(btw(r, -1, 4))}`; } }
          s += `<path d="${lf[0]}" stroke="#5E8C4A" stroke-width="2.2" stroke-linecap="round"/><path d="${lf[1]}" stroke="#7FA85A" stroke-width="2" stroke-linecap="round"/>`;
          s += `<path d="M${f1(vx - 95)} 200 L${f1(vx + 95)} 200 L${f1(vx + 5)} ${vy} L${f1(vx - 5)} ${vy} Z" fill="${sea === "winter" ? "#E4E2DA" : "#D9CDAE"}"/>`;
          for (const sg of [-1, 1]) {
            const ax = vx + sg * 95, bx = vx + sg * 5, P = (t, up) => `${f1(ax + (bx - ax) * t)} ${f1(200 + (vy - 200) * t - up * (1 - t * .92))}`;
            s += `<path d="M${P(0, 0)} L${P(1, 0)} L${P(1, 26)} L${P(0, 26)} Z" fill="#8E6E46"/><path d="M${P(0, 8)} L${P(1, 8)} M${P(0, 17)} L${P(1, 17)}" stroke="#6E5232" stroke-width="1.2"/><path d="M${P(0, 26)} L${P(1, 26)}" stroke="${sea === "winter" ? "#F4F4F2" : "#A5845A"}" stroke-width="1.6"/>`;
            let p = ""; for (const t of [.12, .3, .48, .63, .75, .85]) p += `M${P(t, 0)} L${P(t, 26)}`;
            s += `<path d="${p}" stroke="#5E4428" stroke-width="1.4"/>`;
            perch.push([ax + (bx - ax) * .14, 200 + (vy - 200) * .14 - 26 * (1 - .14 * .92)]);
          }
          for (let i = 0; i < 6; i++) { const x = i < 3 ? btw(r, 4, 56) : btw(r, 248, 296); s += stalk(x, 202, btw(r, 4, 6.5), Math.max(0, topY(x) - 6), pick(r, ["#6E9A4E", "#7DA352"])); }
          if (r() < .55) { const fx = vx + btw(r, -8, 8), fy = vy + 34; s += `<path d="M${f1(fx - 2.5)} ${fy} L${f1(fx + 2.5)} ${fy} L${f1(fx + 1.4)} ${fy - 9} L${f1(fx - 1.4)} ${fy - 9} Z" fill="${pick(r, ["#4F6A8E", "#B8463A", "#E2C9A0"])}"/><circle cx="${f1(fx)}" cy="${fy - 10.5}" r="1.8" fill="#2E2A28"/>`; }
          return { s, l: "", perch };
        } },
      { id: "kiyomizu", zh: "清水寺", see: ["清水舞台架在山崖上，全靠木頭柱子撐著", "從舞台往下看，樹梢就在腳底下", "對面山腰上有一座朱紅色的小塔"], spots: ["舞台的木欄杆上", "本堂屋頂的屋脊上"],
        draw(c) {
          const { r, sea } = c, dx = btw(r, -8, 8), G = (x) => (x < 210 ? 192 - x * 72 / 210 : 120 - (x - 210) * 4 / 90), SY = 108, sx0 = 88 + dx, sx1 = 205 + dx, perch = [];
          let s = hills(100, "#88A283", r, 14);
          const qx = 42 + dx; let y = 116;
          s += `<path d="M${f1(qx - 40)} 124 Q${f1(qx)} 104 ${f1(qx + 40)} 124 Z" fill="#7C9876"/>`;
          for (let i = 0; i < 3; i++) { const bw = 10 - i, bh = 9 - i; s += `<rect x="${f1(qx - bw / 2)}" y="${f1(y - bh)}" width="${bw}" height="${bh}" fill="#C8452F"/><path d="M${f1(qx - 13 + i)} ${f1(y - bh)} L${f1(qx + 13 - i)} ${f1(y - bh)} L${f1(qx + 7)} ${f1(y - bh - 5)} L${f1(qx - 7)} ${f1(y - bh - 5)} Z" fill="#4A3F3A"/>`; y -= bh + 5; }
          s += `<path d="M${f1(qx)} ${f1(y + 1)} v-9" stroke="#B49A5A" stroke-width="1.4"/>`;
          s += `<path d="M0 200 L0 192 L210 120 L300 116 L300 200 Z" fill="${{ spring: "#7C9A62", summer: "#5F8A4C", autumn: "#8C7A4A", winter: "#9AA294" }[sea]}"/>`;
          for (let x = sx0 + 4; x < 262 + dx; x += 10) { const g = G(x); if (g > SY + 3) s += `<rect x="${f1(x - 1.7)}" y="${SY}" width="3.4" height="${f1(g - SY + 2)}" fill="#7A5638"/>`; }
          for (const yb of [SY + 16, SY + 34, SY + 52, SY + 70]) { const xe = Math.min(sx1, (192 - yb) * 210 / 72); if (xe > sx0 + 4) s += `<rect x="${f1(sx0)}" y="${yb}" width="${f1(xe - sx0)}" height="3" fill="#6A4A30"/>`; }
          let rail = `M${f1(sx0 - 4)} ${SY - 9} H${f1(sx1)}`; for (let x = sx0; x < sx1; x += 8) rail += ` M${f1(x)} ${SY - 9} V${SY - 3}`;
          s += `<rect x="${f1(sx0 - 4)}" y="${SY - 3}" width="${f1(sx1 - sx0 + 8)}" height="6" fill="#A7825C"/><path d="${rail}" stroke="#6A4A30" stroke-width="1.6"/>`;
          s += `<path d="M${f1(sx0)} ${SY - 3} V90 M${f1(sx0 + 16)} ${SY - 3} V90" stroke="#7A5638" stroke-width="2"/><path d="M${f1(sx0 - 8)} 92 L${f1(sx0 + 24)} 92 L${f1(sx0 + 18)} 84 L${f1(sx0 - 2)} 84 Z" fill="#6B5848"/>`;
          let lat = ""; for (let x = 146 + dx; x < 258 + dx; x += 6) lat += `M${f1(x)} 84 V104`;
          s += `<rect x="${f1(140 + dx)}" y="80" width="122" height="26" fill="#7E5236"/><path d="${lat}" stroke="#5A3A26" stroke-width=".9"/>`;
          s += `<path d="M${f1(122 + dx)} 86 Q${f1(200 + dx)} 92 ${f1(280 + dx)} 86 L${f1(262 + dx)} 64 L${f1(240 + dx)} 50 L${f1(160 + dx)} 50 L${f1(140 + dx)} 64 Z" fill="${sea === "winter" ? "#E8ECEC" : "#6B5848"}"/><rect x="${f1(158 + dx)}" y="47" width="84" height="4" fill="#4F4036"/><path d="M${f1(122 + dx)} 86 Q${f1(200 + dx)} 92 ${f1(280 + dx)} 86" stroke="#4F4036" stroke-width="1.6" fill="none"/>`;
          perch.push([sx0 + 12, SY - 9], [200 + dx, 47]);
          for (let i = 0; i < 4; i++) { const x = btw(r, 20, 190); s += tree(x, Math.min(199, G(x) + btw(r, 22, 40)), btw(r, 1.5, 2), sea, r); }
          return { s, l: "", perch };
        } },
      { id: "kamogawa", zh: "鴨川", see: ["河裡的踏石做成了烏龜的形狀", "小孩子踩著踏石一顆一顆跳過河", "遠遠的山上看得到一個大大的「大」字"], spots: ["烏龜踏石的背上", "河邊町家的屋簷上"],
        draw(c) {
          const { r, sea, m } = c, hx = btw(r, 170, 225), perch = [];
          let s = hills(98, "#93A8A2", r, 16) + `<path d="M${f1(hx - 80)} 136 Q${f1(hx)} 64 ${f1(hx + 80)} 136 Z" fill="#7F9A86"/>`;
          s += `<path d="M${f1(hx - 9)} 92 L${f1(hx + 9)} 92 M${f1(hx)} 85 Q${f1(hx - 1)} 98 ${f1(hx - 10)} 106 M${f1(hx)} 93 Q${f1(hx + 3)} 101 ${f1(hx + 10)} 106" stroke="#E8E2D2" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".85"/>`;
          s += hills(124, "#6E8C6A", r, 6);
          let x = btw(r, -8, 0);
          while (x < 300) {
            const w = btw(r, 22, 30), h = btw(r, 22, 32);
            s += `<rect x="${f1(x)}" y="${f1(138 - h)}" width="${f1(w)}" height="${f1(h)}" fill="${pick(r, ["#6A4632", "#E3D9C4", "#74503A", "#DCCFB6"])}"/><path d="M${f1(x - 2)} ${f1(138 - h)} L${f1(x + w + 2)} ${f1(138 - h)} L${f1(x + w - 3)} ${f1(138 - h - 6)} L${f1(x + 3)} ${f1(138 - h - 6)} Z" fill="#45403D"/>`;
            if (perch.length < 1 && x > 120 && x < 200) perch.push([x + w / 2, 138 - h - 6]);
            x += w + btw(r, 0, 2);
          }
          if (perch.length < 1) perch.push([150, 114]);
          if (m >= 5 && m <= 9) { let p = ""; for (let x = 10; x < 290; x += 34) p += `M${x} 138 v7 M${x + 24} 138 v7 `; s += `<path d="${p}" stroke="#6A4A30" stroke-width="1.2"/><rect x="0" y="135" width="300" height="3" fill="#B08A5C"/>`; }
          s += `<rect x="0" y="138" width="300" height="9" fill="#A8A396"/>`;
          for (let i = 0; i < 3; i++) s += tree(btw(r, 10, 290), 146, btw(r, .8, 1), sea, r);
          s += water(147, "#A8CAD0", "#6E9EA8", r);
          const sx = btw(r, 90, 120);
          for (let i = 6; i >= 0; i--) {
            const t = i / 6, x = sx + t * 80, y = 194 - t * 44, z = 16 - t * 8;
            if (i % 2 === 0) s += `<ellipse cx="${f1(x - z * .55)}" cy="${f1(y + z * .4)}" rx="${f1(z * .28)}" ry="${f1(z * .15)}" fill="#7E7A70"/><ellipse cx="${f1(x + z * .55)}" cy="${f1(y + z * .4)}" rx="${f1(z * .28)}" ry="${f1(z * .15)}" fill="#7E7A70"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(z)}" ry="${f1(z * .5)}" fill="#8E8A80"/><ellipse cx="${f1(x + z * 1.15)}" cy="${f1(y + z * .08)}" rx="${f1(z * .3)}" ry="${f1(z * .22)}" fill="#8E8A80"/><ellipse cx="${f1(x - z * .05)}" cy="${f1(y - z * .16)}" rx="${f1(z * .62)}" ry="${f1(z * .24)}" fill="#ABA69B"/><path d="M${f1(x - z * .3)} ${f1(y - z * .35)} v${f1(z * .4)} M${f1(x + z * .25)} ${f1(y - z * .35)} v${f1(z * .4)}" stroke="#7E7A70" stroke-width="1"/>`;
            else s += `<rect x="${f1(x - z * .8)}" y="${f1(y - z * .34)}" width="${f1(z * 1.6)}" height="${f1(z * .7)}" rx="1.5" fill="#9A958A"/><rect x="${f1(x - z * .6)}" y="${f1(y - z * .34)}" width="${f1(z * 1.2)}" height="${f1(z * .22)}" fill="#B5B0A5"/>`;
            if (i === 0) perch.push([x, y - z * .5]);
          }
          if (r() < .5) { const kx = sx + 40, ky = 172 - 12 * .3; s += `<path d="M${f1(kx - 2.5)} ${f1(ky)} L${f1(kx + 2.5)} ${f1(ky)} L${f1(kx + 1.4)} ${f1(ky - 9)} L${f1(kx - 1.4)} ${f1(ky - 9)} Z" fill="${pick(r, ["#D9883A", "#4F6A8E", "#B8463A"])}"/><circle cx="${f1(kx)}" cy="${f1(ky - 10.5)}" r="1.8" fill="#2E2A28"/>`; }
          if (r() < .5) { const hx2 = btw(r, 215, 270), hy = btw(r, 176, 190); s += `<path d="M${f1(hx2 - 1)} ${f1(hy - 10)} v10 M${f1(hx2 + 2)} ${f1(hy - 10)} v10" stroke="#6A6A6A" stroke-width=".9"/><path d="M${f1(hx2 - 7)} ${f1(hy - 13)} Q${f1(hx2)} ${f1(hy - 19)} ${f1(hx2 + 6)} ${f1(hy - 15)} L${f1(hx2 + 2)} ${f1(hy - 9)} Z" fill="#9AA0A6"/><path d="M${f1(hx2 + 4)} ${f1(hy - 16)} Q${f1(hx2 + 2)} ${f1(hy - 23)} ${f1(hx2 + 6)} ${f1(hy - 26)}" stroke="#9AA0A6" stroke-width="2" fill="none"/><path d="M${f1(hx2 + 6)} ${f1(hy - 26)} l5 1" stroke="#D8B04A" stroke-width="1"/>`; }
          return { s, l: "", perch };
        } },
    ],
  },
  tokyo: {
    zh: "東京", de: "Tōkyō", gift: "一張淺草寺的籤詩",
    sights: [
      { id: "tokyotower", zh: "東京鐵塔", see: ["紅白相間的鐵塔高高站在大樓中間", "鐵架一格一格交叉，像一張巨大的網", "塔上有兩層展望台，像串在竿子上的盒子"], spots: ["上層展望台的屋頂上", "大展望台的屋頂邊"],
        draw(c) {
          const { r, sea } = c, tx = btw(r, 168, 200), k = btw(r, .92, 1.04), B = 184, H = 152 * k, perch = [];
          const hw = (t) => (2.8 + 50 * Math.pow(1 - t, 2.4)) * k, Y = (t) => B - t * H, inn = (t) => hw(t) * .62 * Math.max(0, 1 - t / .42);
          let s = "";
          const T = [0, .14, .22, .3, .38, .45, .52, .58, .64, .7, .75, .8], O = "#D9542E", Wt = "#F2EEE6";
          for (let j = 0; j < T.length - 1; j++) {
            const a = T[j], b = T[j + 1], col = j % 2 ? Wt : O, ya = Y(a), yb = Y(b);
            if (b <= .45) for (const sg of [-1, 1]) s += `<path d="M${f1(tx + sg * hw(a))} ${f1(ya)} L${f1(tx + sg * inn(a))} ${f1(ya)} L${f1(tx + sg * inn(b))} ${f1(yb)} L${f1(tx + sg * hw(b))} ${f1(yb)} Z" fill="${col}"/><path d="M${f1(tx + sg * hw(a))} ${f1(ya)} L${f1(tx + sg * inn(b))} ${f1(yb)} M${f1(tx + sg * inn(a))} ${f1(ya)} L${f1(tx + sg * hw(b))} ${f1(yb)}" stroke="${j % 2 ? O : Wt}" stroke-opacity=".45" stroke-width=".7"/>`;
            else s += `<path d="M${f1(tx - hw(a))} ${f1(ya)} L${f1(tx + hw(a))} ${f1(ya)} L${f1(tx + hw(b))} ${f1(yb)} L${f1(tx - hw(b))} ${f1(yb)} Z" fill="${col}"/><path d="M${f1(tx - hw(a))} ${f1(ya)} L${f1(tx + hw(b))} ${f1(yb)} M${f1(tx + hw(a))} ${f1(ya)} L${f1(tx - hw(b))} ${f1(yb)}" stroke="${j % 2 ? O : Wt}" stroke-opacity=".45" stroke-width=".7"/>`;
          }
          s += `<path d="M${f1(tx - inn(.14))} ${f1(Y(.14))} Q${f1(tx)} ${f1(Y(.3))} ${f1(tx + inn(.14))} ${f1(Y(.14))}" stroke="${O}" stroke-width="2.2" fill="none"/>`;
          const md = Y(.45), td = Y(.75), mw = hw(.45) + 6, tw = hw(.75) + 3.5;
          s += `<rect x="${f1(tx - mw)}" y="${f1(md - 10)}" width="${f1(mw * 2)}" height="10" fill="#EDE7DC"/><rect x="${f1(tx - mw + 1)}" y="${f1(md - 7.5)}" width="${f1(mw * 2 - 2)}" height="4" fill="#5E6A76"/>`;
          s += `<rect x="${f1(tx - tw)}" y="${f1(td - 6)}" width="${f1(tw * 2)}" height="6" fill="#EDE7DC"/><rect x="${f1(tx - tw + 1)}" y="${f1(td - 4.5)}" width="${f1(tw * 2 - 2)}" height="2.4" fill="#5E6A76"/>`;
          s += `<rect x="${f1(tx - 1.4)}" y="${f1(B - H)}" width="2.8" height="${f1(H * .2)}" fill="${Wt}"/><rect x="${f1(tx - 1.4)}" y="${f1(B - H * .93)}" width="2.8" height="${f1(H * .05)}" fill="${O}"/><rect x="${f1(tx - 1.4)}" y="${f1(B - H * .85)}" width="2.8" height="${f1(H * .05)}" fill="${O}"/>`;
          perch.push([tx - tw + 3, td - 6], [tx + mw - 4, md - 10]);
          for (let i = 0; i < 2; i++) s += tree(btw(r, 10, 290), 186, btw(r, 1, 1.3), sea, r);
          let x = btw(r, -10, 0);
          while (x < 300) {
            const w = btw(r, 20, 34), h = btw(r, 14, 38), col = pick(r, ["#C9C4BA", "#B7B3AC", "#D8CFC0", "#A9AEB4", "#E2DCCF"]);
            let wn = ""; for (let yy = 186 - h + 4; yy < 182; yy += 6) wn += `M${f1(x + 3)} ${f1(yy)}h${f1(w - 6)}`;
            s += `<rect x="${f1(x)}" y="${f1(186 - h)}" width="${f1(w)}" height="${f1(h)}" fill="${col}"/><path d="${wn}" stroke="#6E747A" stroke-opacity=".45" stroke-width="1.6" stroke-dasharray="3 2"/>`;
            x += w + btw(r, 0, 3);
          }
          s += `<rect x="0" y="186" width="300" height="14" fill="#9E978A"/>`;
          return { s, l: "", perch };
        } },
      { id: "skytree", zh: "東京晴空塔", see: ["好高好細的白色高塔，抬頭看到脖子痠", "隅田川上的屋形船慢慢開過橋下", "河邊有一棟大樓頂著金色的火焰"], spots: ["展望台外面的圓環上", "吾妻橋的紅色欄杆上"],
        draw(c) {
          const { r, sea } = c, sx = btw(r, 188, 214), B = 152, H = btw(r, 132, 142), ax = btw(r, 62, 92), perch = [];
          const hw = (t) => (t < .55 ? 5.2 + 10 * Math.pow(1 - t / .55, 1.3) : 5.2 - (t - .55) * 4.4), Y = (t) => B - t * H;
          let s = hills(140, "#9AA7AE", r, 4), L = "", Rr = "";
          for (const t of [0, .08, .16, .24, .32, .4, .48, .55, .62, .7, .78, .84]) { L += `${L ? " L" : "M"}${f1(sx - hw(t))} ${f1(Y(t))}`; Rr = ` L${f1(sx + hw(t))} ${f1(Y(t))}` + Rr; }
          s += `<path d="${L}${Rr} Z" fill="#E6ECF0" stroke="#8DA2B3" stroke-width=".8"/>`;
          let lat = ""; for (let t = 0; t < .5; t += .07) lat += `M${f1(sx - hw(t))} ${f1(Y(t))} L${f1(sx + hw(t + .07))} ${f1(Y(t + .07))} M${f1(sx + hw(t))} ${f1(Y(t))} L${f1(sx - hw(t + .07))} ${f1(Y(t + .07))} `;
          s += `<path d="${lat}" stroke="#A3B5C3" stroke-width=".6"/>`;
          const d1 = Y(.55), d2 = Y(.71);
          s += `<rect x="${f1(sx - 13)}" y="${f1(d1 - 10)}" width="26" height="10" rx="1.5" fill="#E6ECF0" stroke="#8DA2B3" stroke-width=".8"/><rect x="${f1(sx - 12)}" y="${f1(d1 - 7)}" width="24" height="4" fill="#6F8798"/>`;
          s += `<rect x="${f1(sx - 9)}" y="${f1(d2 - 6)}" width="18" height="6" rx="1" fill="#E6ECF0" stroke="#8DA2B3" stroke-width=".8"/><rect x="${f1(sx - 8)}" y="${f1(d2 - 4.2)}" width="16" height="2.4" fill="#6F8798"/>`;
          s += `<rect x="${f1(sx - 1.6)}" y="${f1(Y(.94))}" width="3.2" height="${f1(H * .1)}" fill="#C9D3DA"/><rect x="${f1(sx - .8)}" y="${f1(Y(1))}" width="1.6" height="${f1(H * .06)}" fill="#AEBBC5"/>`;
          perch.push([sx + 7, d1 - 10]);
          let x = btw(r, -6, 0);
          while (x < 300) { const w = btw(r, 14, 26), h = btw(r, 6, 18); if (x + w < ax - 2 || x > ax + 64) s += `<rect x="${f1(x)}" y="${f1(B - h)}" width="${f1(w)}" height="${f1(h)}" fill="${pick(r, ["#B9B5AE", "#CBC5BA", "#A9AFB5"])}"/>`; x += w + 1; }
          s += `<rect x="${f1(ax)}" y="${B - 26}" width="36" height="26" fill="#2C2A2A"/><path d="M${f1(ax + 4)} ${B - 26} Q${f1(ax + 8)} ${B - 42} ${f1(ax + 28)} ${B - 46} Q${f1(ax + 40)} ${B - 47} ${f1(ax + 41)} ${B - 41} Q${f1(ax + 30)} ${B - 41} ${f1(ax + 27)} ${B - 31} Q${f1(ax + 24)} ${B - 26} ${f1(ax + 20)} ${B - 26} Z" fill="#E2B23A"/>`;
          s += `<rect x="${f1(ax + 40)}" y="${B - 58}" width="22" height="58" fill="#C98A2E"/><rect x="${f1(ax + 40)}" y="${B - 63}" width="22" height="6" fill="#F4EFE4"/><path d="M${f1(ax + 44)} ${B - 50} v44 M${f1(ax + 51)} ${B - 50} v44 M${f1(ax + 58)} ${B - 50} v44" stroke="#A86E22" stroke-width=".8"/>`;
          s += `<rect x="0" y="${B}" width="300" height="4" fill="#9A968C"/>` + water(B + 4, "#9DBFCB", "#5F8EA0", r);
          s += `<rect x="0" y="166" width="300" height="5" fill="#C0392B"/><rect x="0" y="162.5" width="300" height="1.6" fill="#C0392B"/><path d="M0 164 H300 M10 163 v3 M40 163 v3 M70 163 v3 M130 163 v3 M160 163 v3 M190 163 v3 M250 163 v3 M280 163 v3" stroke="#A8301F" stroke-width=".8"/><path d="M0 182 Q50 168 100 182 M100 182 Q150 168 200 182 M200 182 Q250 168 300 182" stroke="#C0392B" stroke-width="3" fill="none"/><rect x="97" y="171" width="6" height="15" fill="#8E8A80"/><rect x="197" y="171" width="6" height="15" fill="#8E8A80"/>`;
          perch.push([btw(r, 20, 280), 162.5]);
          if (sea !== "winter" || r() < .5) { const bx = btw(r, 20, 220); s += `<path d="M${f1(bx)} 191 h52 l-5 6 h-43 Z" fill="#5A3A2A"/><rect x="${f1(bx + 5)}" y="184" width="42" height="7" fill="#E9DEC6"/><rect x="${f1(bx + 7)}" y="186" width="38" height="2.5" fill="#7A6A58"/><path d="M${f1(bx + 2)} 184 h48 l-3 -3 h-42 Z" fill="#3E3A36"/><circle cx="${f1(bx + 10)}" cy="185" r="1.5" fill="#D2462E"/><circle cx="${f1(bx + 22)}" cy="185" r="1.5" fill="#D2462E"/><circle cx="${f1(bx + 34)}" cy="185" r="1.5" fill="#D2462E"/><circle cx="${f1(bx + 44)}" cy="185" r="1.5" fill="#D2462E"/>`; }
          return { s, l: "", perch };
        } },
      { id: "kaminarimon", zh: "淺草雷門", see: ["門中間掛著一個比人還大的紅燈籠", "門的兩邊住著風神和雷神的雕像", "門後的仲見世商店街一路通到寺裡"], spots: ["雷門的屋頂上", "五重塔頂端的相輪上"],
        draw(c) {
          const { r, sea } = c, gx = btw(r, 150, 172), B = 176, k = .7, pp = Math.min(gx + 100, 272), perch = [];
          const R = (cx, yb, w, t) => `<path d="M${f1(cx - w / 2)} ${f1(yb - 4)} Q${f1(cx)} ${f1(yb + 3)} ${f1(cx + w / 2)} ${f1(yb - 4)} L${f1(cx + w * .3)} ${f1(yb - t)} L${f1(cx - w * .3)} ${f1(yb - t)} Z" fill="#3B3532"/>`;
          let s = "", y = 150;
          for (let i = 0; i < 5; i++) { const bw = (30 - i * 3) * k, bh = (14 - i * .8) * k; s += `<rect x="${f1(pp - bw / 2)}" y="${f1(y - bh)}" width="${f1(bw)}" height="${f1(bh)}" fill="#C23B2B"/>` + R(pp, y - bh, (64 - i * 7) * k, 7 * k); y -= bh + 6 * k; }
          s += `<path d="M${f1(pp)} ${f1(y + 2)} v-20" stroke="#B49A5A" stroke-width="1.8"/><path d="M${f1(pp - 2.5)} ${f1(y - 5)} h5 M${f1(pp - 2.5)} ${f1(y - 9)} h5 M${f1(pp - 2.5)} ${f1(y - 13)} h5" stroke="#B49A5A" stroke-width="1"/>`;
          perch.push([pp, y - 18]);
          const H = houses(B, 3, r, ["#E8DCC2", "#D9D2C2", "#CDBFA6"], false); s += H.s;
          s += `<rect x="${f1(gx - 70)}" y="110" width="140" height="${B - 110}" fill="#C23B2B"/><rect x="${f1(gx - 26)}" y="116" width="52" height="${B - 116}" fill="#4A2C26"/>`;
          for (const sg of [-1, 1]) { const bx = gx + sg * 48 - 16; let g = ""; for (let q = bx + 3; q < bx + 32; q += 4) g += `M${f1(q)} 122 V${B}`; s += `<rect x="${f1(bx)}" y="120" width="32" height="${B - 120}" fill="#5A3A30"/><ellipse cx="${f1(bx + 16)}" cy="150" rx="9" ry="16" fill="${sg < 0 ? "#5E8A6A" : "#B0503A"}" opacity=".8"/><path d="${g}" stroke="#2E1E1A" stroke-width="1"/>`; }
          s += `<path d="M${f1(gx - 70)} 110 V${B} M${f1(gx - 30)} 110 V${B} M${f1(gx + 30)} 110 V${B} M${f1(gx + 70)} 110 V${B}" stroke="#A9301F" stroke-width="4"/>`;
          s += `<rect x="${f1(gx - 74)}" y="103" width="148" height="7" fill="#8E2E24"/><path d="M${f1(gx - 88)} 105 Q${f1(gx)} 98 ${f1(gx + 88)} 105 L${f1(gx + 72)} 86 L${f1(gx + 56)} 75 L${f1(gx - 56)} 75 L${f1(gx - 72)} 86 Z" fill="${sea === "winter" ? "#E4E8E8" : "#3E3A37"}"/><path d="M${f1(gx - 88)} 105 Q${f1(gx)} 98 ${f1(gx + 88)} 105" stroke="#2E2B29" stroke-width="1.6" fill="none"/><rect x="${f1(gx - 58)}" y="71" width="116" height="5" fill="#2E2B29"/><path d="M${f1(gx - 58)} 71 l-4 -5 l7 2 Z M${f1(gx + 58)} 71 l4 -5 l-7 2 Z" fill="#2E2B29"/>`;
          const cy = 140;
          s += `<rect x="${f1(gx - .8)}" y="110" width="1.6" height="7" fill="#2A2522"/><ellipse cx="${f1(gx)}" cy="${cy}" rx="19" ry="23" fill="#C8372A"/><path d="M${f1(gx - 18)} ${cy - 10} Q${f1(gx)} ${cy - 7} ${f1(gx + 18)} ${cy - 10} M${f1(gx - 19)} ${cy} Q${f1(gx)} ${cy + 3} ${f1(gx + 19)} ${cy} M${f1(gx - 18)} ${cy + 10} Q${f1(gx)} ${cy + 13} ${f1(gx + 18)} ${cy + 10}" stroke="#A82A20" stroke-width=".7" fill="none"/><rect x="${f1(gx - 7)}" y="${cy - 12}" width="14" height="22" rx="2" fill="#2A2522" opacity=".6"/><rect x="${f1(gx - 14)}" y="${cy - 26}" width="28" height="6" rx="1" fill="#2A2522"/><rect x="${f1(gx - 14)}" y="${cy + 20}" width="28" height="6" rx="1" fill="#2A2522"/>`;
          perch.push([gx - 30, 71]);
          s += `<rect x="0" y="${B}" width="300" height="${200 - B}" fill="#CDBFA6"/><path d="M0 186 H300 M40 176 l-6 24 M120 176 l-3 24 M200 176 l3 24 M270 176 l6 24" stroke="#B5A68C" stroke-width=".8"/>`;
          for (let i = 0; i < 5; i++) { const fx = btw(r, 20, 290), fy = btw(r, 184, 196); s += `<path d="M${f1(fx - 2.5)} ${f1(fy)} L${f1(fx + 2.5)} ${f1(fy)} L${f1(fx + 1.5)} ${f1(fy - 9)} L${f1(fx - 1.5)} ${f1(fy - 9)} Z" fill="${pick(r, ["#4F6A8E", "#B8463A", "#E2C9A0", "#6E8A5A", "#3E3A37"])}"/><circle cx="${f1(fx)}" cy="${f1(fy - 10.5)}" r="1.8" fill="#2E2A28"/>`; }
          s += tree(btw(r, 8, 30), 186, 1.2, sea, r);
          return { s, l: "", perch };
        } },
      { id: "shibuya", zh: "澀谷十字路口", see: ["綠燈一亮，所有方向的人一起過馬路", "連斜斜的方向都畫了斑馬線", "大樓牆上的大螢幕一直在換畫面"], spots: ["紅綠燈的燈箱上", "大螢幕大樓的屋頂上"],
        draw(c) {
          const { r } = c, perch = [], pr = (X, Z) => [160 + X * 100 / Z, 112 + 88 / Z];
          let s = "";
          const bl = [[-4, 60, 50], [58, 120, 58], [120, 192, 76], [190, 250, 86], [248, 304, 66]];
          bl.forEach(([x0, x1, h], j) => {
            const hh = h + btw(r, -6, 6), top = 128 - hh;
            let wn = ""; for (let yy = top + 6; yy < 124; yy += 6) wn += `M${f1(x0 + 4)} ${f1(yy)}H${f1(x1 - 4)}`;
            s += `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(x1 - x0)}" height="${f1(hh)}" fill="${["#B9B2A6", "#C9C3B8", "#A9AEB4", "#D4CCBE", "#B3ACA0"][j]}"/><path d="${wn}" stroke="#7E848A" stroke-opacity=".45" stroke-width="1.5" stroke-dasharray="4 2"/>`;
            if (j === 2) { s += `<rect x="${f1(x0 + 7)}" y="${f1(top + 8)}" width="${f1(x1 - x0 - 14)}" height="40" fill="#4FA6D6"/><rect x="${f1(x0 + 14)}" y="${f1(top + 16)}" width="22" height="24" fill="#F2C14E"/><circle cx="${f1(x0 + 50)}" cy="${f1(top + 26)}" r="9" fill="#E2606A"/>`; perch.push([(x0 + x1) / 2, top]); }
            if (j === 3) s += `<rect x="${f1(x0 + 8)}" y="${f1(top + 12)}" width="${f1(x1 - x0 - 16)}" height="26" fill="#E86A5A"/><rect x="${f1(x0 + 14)}" y="${f1(top + 18)}" width="${f1(x1 - x0 - 28)}" height="6" fill="#FBEAD6"/>`;
            if (j === 0) s += `<rect x="${f1(x0 + 12)}" y="${f1(top + 10)}" width="36" height="18" fill="#7FC2A0"/>`;
          });
          s += `<rect x="0" y="124" width="300" height="9" fill="#A9A8A2"/><rect x="0" y="132" width="300" height="68" fill="#5E5E62"/>`;
          let d = "";
          const band = (X1, Z1, X2, Z2, N) => {
            const L = Math.hypot(X2 - X1, Z2 - Z1), ux = (X2 - X1) / L, uz = (Z2 - Z1) / L, nx = -uz, nz = ux, w = .2, th = L / N * .26;
            for (let i = 0; i < N; i++) { const t = (i + .5) / N, cx = X1 + (X2 - X1) * t, cz = Z1 + (Z2 - Z1) * t, q = [[-th, -w], [th, -w], [th, w], [-th, w]].map(([a, b]) => pr(cx + ux * a + nx * b, cz + uz * a + nz * b)); d += `M${q.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L")} Z`; }
          };
          band(-1.4, 1.3, 1.4, 1.3, 11); band(-1.4, 3, 1.4, 3, 11); band(-1.55, 1.45, -1.55, 2.85, 8); band(1.55, 1.45, 1.55, 2.85, 8); band(-1.15, 1.5, 1.15, 2.8, 12); band(1.15, 1.5, -1.15, 2.8, 12);
          s += `<path d="${d}" fill="#E9E8E2"/>`;
          for (let i = 0; i < 22; i++) { const X = btw(r, -1.5, 1.5), Z = btw(r, 1.3, 3), [x, y] = pr(X, Z), q = 1.6 / Z; s += `<rect x="${f1(x - 1.2 * q)}" y="${f1(y - 5 * q)}" width="${f1(2.4 * q)}" height="${f1(4 * q)}" fill="${pick(r, ["#3E4A5E", "#B8463A", "#E2C9A0", "#5E7A5A", "#2E2E32", "#D9883A"])}"/><circle cx="${f1(x)}" cy="${f1(y - 6.2 * q)}" r="${f1(1.2 * q)}" fill="#2E2A28"/>`; }
          s += `<rect x="26.8" y="114" width="2.6" height="86" fill="#4A4E52"/><rect x="17" y="104" width="22" height="9" rx="2" fill="#3A3E42"/><circle cx="22" cy="108.5" r="2.4" fill="#5DBB8A"/><circle cx="28" cy="108.5" r="2.4" fill="#2A2E31"/><circle cx="34" cy="108.5" r="2.4" fill="#2A2E31"/>`;
          perch.push([28, 104]);
          return { s, l: "", perch };
        } },
      { id: "fuji", zh: "富士山", see: ["富士山左右對稱，像畫出來的一樣", "紅色的五重塔站在山坡上望著它", "天氣好的時候，湖面倒映著整座山"], spots: ["忠靈塔的屋簷角上", "湖邊的大石頭上"],
        draw(c) {
          const { r, sea, m } = c, fx = btw(r, 172, 200), P = btw(r, 46, 54), B = 142, perch = [];
          const hw = (y) => 9 + 126 * Math.pow(Math.max(0, (y - P) / (B - P)), 1.5), sf = [0, .55, .58, .55, .48, .38, .2, .1, .08, .12, .25, .42, .52][m], ys = P + sf * (B - P);
          let L = "", Rr = "";
          for (let i = 0; i <= 10; i++) { const y = B - (B - P) * i / 10; L += `${L ? " L" : "M"}${f1(fx - hw(y))} ${f1(y)}`; Rr = ` L${f1(fx + hw(y))} ${f1(y)}` + Rr; }
          let s = `<path d="${L} L${f1(fx - 3)} ${f1(P + 1.5)} L${f1(fx + 3)} ${f1(P + 1.5)}${Rr} Z" fill="#5E7596"/><path d="M${f1(fx + 3)} ${f1(P + 1.5)}${Rr} L${f1(fx + hw(B) * .45)} ${B} Z" fill="#2E3E5A" opacity=".12"/>`;
          let sn = "", sl = "";
          for (let i = 0; i <= 6; i++) { const y = ys - (ys - P) * i / 6; sn += `${sn ? " L" : "M"}${f1(fx - hw(y))} ${f1(y)}`; sl = ` L${f1(fx + hw(y))} ${f1(y)}` + sl; }
          let jag = ""; for (let j = 1; j < 12; j++) jag += ` L${f1(fx + hw(ys) * (1 - 2 * j / 12))} ${f1(ys + (j % 2 ? btw(r, 3, 10) * (sf + .3) : -btw(r, 0, 3)))}`;
          s += `<path d="${sn}${sl}${jag} Z" fill="#F4F6F8"/>`;
          s += `<rect x="0" y="138" width="300" height="5" fill="#5B7556"/>` + water(B, "#A9C6D6", "#6F97AE", r);
          let rl = "", rr = ""; for (let i = 0; i <= 5; i++) { const y = B + (200 - B) * i / 5, q = hw(2 * B - y); rl += `${rl ? " L" : "M"}${f1(fx - q)} ${f1(y)}`; rr = ` L${f1(fx + q)} ${f1(y)}` + rr; }
          s += `<path d="${rl}${rr} Z" fill="#5E7596" opacity=".22"/>`;
          s += `<path d="M0 200 L0 150 Q60 146 110 170 Q130 182 150 200 Z" fill="${{ spring: "#7A9A62", summer: "#5F8A4C", autumn: "#9A7A44", winter: "#DDE2E2" }[sea]}"/>`;
          const cx = btw(r, 60, 80), k = .6, Rf = (cx, yb, w, t) => `<path d="M${f1(cx - w / 2)} ${f1(yb - 4)} Q${f1(cx)} ${f1(yb + 3)} ${f1(cx + w / 2)} ${f1(yb - 4)} L${f1(cx + w * .3)} ${f1(yb - t)} L${f1(cx - w * .3)} ${f1(yb - t)} Z" fill="#3B3532"/>`;
          let y = 162;
          for (let i = 0; i < 5; i++) { const bw = (30 - i * 3) * k, bh = (14 - i * .8) * k; s += `<rect x="${f1(cx - bw / 2)}" y="${f1(y - bh)}" width="${f1(bw)}" height="${f1(bh)}" fill="#C8452F"/>` + Rf(cx, y - bh, (64 - i * 7) * k, 7 * k); if (i === 1) perch.push([cx - (64 - 7) * k / 2 + 1, y - bh - 4]); y -= bh + 6 * k; }
          s += `<path d="M${f1(cx)} ${f1(y + 2)} v-16" stroke="#B49A5A" stroke-width="1.6"/>`;
          for (let i = 0; i < 4; i++) { const x = btw(r, 8, 130), yy = 152 + x * .2 + btw(r, 14, 30); s += tree(x, Math.min(199, yy), btw(r, 1.2, 1.6), sea, r); }
          const rx = btw(r, 225, 270); s += `<ellipse cx="${f1(rx)}" cy="191" rx="14" ry="6" fill="#8A8478"/><ellipse cx="${f1(rx - 2)}" cy="188.5" rx="9" ry="2.5" fill="#A29C90"/>`;
          perch.push([rx - 2, 186]);
          return { s, l: "", perch };
        } },
      { id: "nijubashi", zh: "皇居二重橋", see: ["石橋有兩個圓拱，倒影看起來像一副眼鏡", "護城河的水很靜，旁邊種滿了松樹", "白牆黑瓦的伏見櫓站在高高的石牆上"], spots: ["石橋的路燈頂上", "伏見櫓的屋脊上"],
        draw(c) {
          const { r, sea } = c, dx = btw(r, -8, 8), yx = 228 + dx, win = sea === "winter", rc = win ? "#E4E8E8" : "#3E434B", perch = [];
          const R = (cx, yb, w, t) => `<path d="M${f1(cx - w / 2)} ${f1(yb - 4)} Q${f1(cx)} ${f1(yb + 3)} ${f1(cx + w / 2)} ${f1(yb - 4)} L${f1(cx + w * .3)} ${f1(yb - t)} L${f1(cx - w * .3)} ${f1(yb - t)} Z" fill="${rc}"/>`;
          const pine = (x, y, q) => `<path d="M${f1(x)} ${f1(y)} q${f1(-4 * q)} ${f1(-12 * q)} ${f1(2 * q)} ${f1(-24 * q)}" stroke="#4A3A2E" stroke-width="${f1(2.2 * q)}" fill="none"/><ellipse cx="${f1(x - 6 * q)}" cy="${f1(y - 14 * q)}" rx="${f1(10 * q)}" ry="${f1(4 * q)}" fill="#3D5A3A"/><ellipse cx="${f1(x + 5 * q)}" cy="${f1(y - 21 * q)}" rx="${f1(9 * q)}" ry="${f1(3.6 * q)}" fill="#46663F"/><ellipse cx="${f1(x + 1 * q)}" cy="${f1(y - 27 * q)}" rx="${f1(6 * q)}" ry="${f1(3 * q)}" fill="#3D5A3A"/>`;
          let s = hills(116, "#6F8B66", r, 10) + water(134, "#9DB8B4", "#5E8580", r);
          s += `<path d="M${f1(160 + dx)} 140 L${f1(178 + dx)} 106 L300 102 L300 140 Z" fill="#A49C8C"/><path d="M${f1(170 + dx)} 122 L300 118 M${f1(164 + dx)} 132 L300 128 M210 106 v14 M250 104 v14 M190 122 v10 M235 120 v10 M275 120 v10 M205 132 v8 M262 130 v9" stroke="#8C8476" stroke-width=".8"/>`;
          s += `<rect x="${f1(178 + dx)}" y="96" width="${f1(122 - dx)}" height="10" fill="#EDE8DD"/><rect x="${f1(176 + dx)}" y="92" width="${f1(124 - dx)}" height="4.5" fill="${rc}"/>`;
          s += `<rect x="${f1(yx - 38)}" y="78" width="76" height="28" fill="#F1EDE4"/><rect x="${f1(yx - 25)}" y="88" width="7" height="6" fill="#3E434B"/><rect x="${f1(yx - 3.5)}" y="88" width="7" height="6" fill="#3E434B"/><rect x="${f1(yx + 18)}" y="88" width="7" height="6" fill="#3E434B"/>` + R(yx, 78, 98, 10);
          s += `<path d="M${f1(yx - 11)} 74 L${f1(yx)} 64 L${f1(yx + 11)} 74 Z" fill="${rc}"/><rect x="${f1(yx - 26)}" y="54" width="52" height="15" fill="#F1EDE4"/>` + R(yx, 54, 72, 14) + `<path d="M${f1(yx - 22)} 40 l-2.5 -5 l5 2.5 Z M${f1(yx + 22)} 40 l2.5 -5 l-5 2.5 Z" fill="#3E434B"/>`;
          perch.push([yx, 40]);
          s += pine(178 + dx, 106, .9) + pine(btw(r, 280, 294), 102, .8);
          const x0 = 30 + dx, x1 = 174 + dx, D = 126, a1 = x0 + 45, a2 = x0 + 99;
          s += `<rect x="0" y="122" width="${f1(x0 + 2)}" height="28" fill="#CFC6B2"/>` + pine(btw(r, 8, 22), 124, 1.1);
          s += `<path d="M${f1(x0)} 150 L${f1(a1 - 20)} 150 A20 20 0 0 0 ${f1(a1 + 20)} 150 L${f1(a2 - 20)} 150 A20 20 0 0 0 ${f1(a2 + 20)} 150 L${f1(x1)} 150 L${f1(x1)} 174 L${f1(x0)} 174 Z" fill="#D9D2C3" opacity=".3"/>`;
          s += `<path d="M${f1(x0)} ${D} L${f1(x1)} ${D} L${f1(x1)} 150 L${f1(a2 + 20)} 150 A20 20 0 0 0 ${f1(a2 - 20)} 150 L${f1(a1 + 20)} 150 A20 20 0 0 0 ${f1(a1 - 20)} 150 L${f1(x0)} 150 Z" fill="#D9D2C3"/>`;
          let bal = `M${f1(x0)} ${D - 6} H${f1(x1)}`; for (let x = x0 + 4; x < x1; x += 6) bal += ` M${f1(x)} ${D - 6} V${D}`;
          s += `<path d="${bal}" stroke="#B9B1A0" stroke-width="1.6"/>`;
          for (const lx of [x0 + 10, (a1 + a2) / 2, x1 - 10]) s += `<rect x="${f1(lx - 1)}" y="${D - 26}" width="2" height="20" fill="#3E3E3C"/><path d="M${f1(lx - 6)} ${D - 26} h12" stroke="#3E3E3C" stroke-width="1.4"/><circle cx="${f1(lx - 5)}" cy="${D - 29}" r="2.4" fill="#ECE6CF" stroke="#3E3E3C" stroke-width=".8"/><circle cx="${f1(lx + 5)}" cy="${D - 29}" r="2.4" fill="#ECE6CF" stroke="#3E3E3C" stroke-width=".8"/><circle cx="${f1(lx)}" cy="${D - 31}" r="2.8" fill="#ECE6CF" stroke="#3E3E3C" stroke-width=".8"/>`;
          perch.push([(a1 + a2) / 2, D - 34]);
          return { s, l: "", perch };
        } },
    ],
  },
  hokkaido: {
    zh: "北海道", de: "Hokkaidō", gift: "一小束薰衣草乾燥花",
    sights: [
      { id: "clocktower", zh: "札幌時計台", see: ["白色的木頭房子戴著紅色的屋頂", "鐘塔上的大鐘每到整點就噹噹響", "四周的高樓把它圍在中間，顯得小小的"], spots: ["鐘塔的紅色尖頂上", "紅屋頂的屋脊上"],
        draw(c) {
          const { r, sea } = c, bx = btw(r, 112, 135), tx = bx + 26, red = "#B5433A", wall = "#F2EFE8", perch = [];
          let s = "";
          for (const [x0, w, top, col] of [[-4, 54, 112, "#C5CBD1"], [50, 44, 96, "#B3BBC3"], [228, 40, 60, "#BFC6CD"], [266, 40, 82, "#D1D4D6"]]) { let g = ""; for (let y = top + 6; y < 172; y += 7) g += `M${x0 + 4} ${y}h${w - 8}`; s += `<rect x="${x0}" y="${top}" width="${w}" height="${172 - top}" fill="${col}"/><path d="${g}" stroke="#8E979F" stroke-opacity=".5" stroke-width="2" stroke-dasharray="4 2"/>`; }
          s += `<rect x="0" y="172" width="300" height="28" fill="${{ spring: "#9DB57A", summer: "#8FAE6E", autumn: "#A9A26A", winter: "#EEF1F1" }[sea]}"/>`;
          let cl = ""; for (let y = 131; y < 174; y += 3.5) cl += `M${f1(bx)} ${f1(y)}h100`;
          s += `<rect x="${f1(bx)}" y="128" width="100" height="46" fill="${wall}"/><path d="${cl}" stroke="#D6D0C4" stroke-width=".6"/>`;
          for (let i = 0; i < 6; i++) { const wx = bx + 8 + i * 15.5; s += `<rect x="${f1(wx)}" y="133" width="6" height="11" fill="#6E8079"/><rect x="${f1(wx)}" y="153" width="6" height="13" fill="#6E8079"/>`; }
          s += `<path d="M${f1(bx - 4)} 130 L${f1(bx + 104)} 130 L${f1(bx + 97)} 110 L${f1(bx + 3)} 110 Z" fill="${red}"/>`;
          if (sea === "winter") s += `<path d="M${f1(bx + 3)} 110 L${f1(bx + 97)} 110 L${f1(bx + 99.5)} 117 L${f1(bx + .5)} 117 Z" fill="#F4F6F6"/><rect x="0" y="171" width="300" height="3" fill="#FFFFFF"/>`;
          s += `<rect x="${f1(tx - 14)}" y="82" width="28" height="30" fill="${wall}"/><circle cx="${f1(tx)}" cy="96" r="10" fill="#FBFAF6" stroke="#3A3A3A" stroke-width="1.4"/><path d="M${f1(tx)} 96 L${f1(tx)} 89 M${f1(tx)} 96 L${f1(tx + 5)} 98" stroke="#2E2E2E" stroke-width="1.3"/>`;
          s += `<rect x="${f1(tx - 16)}" y="79" width="32" height="3.5" fill="${red}"/><rect x="${f1(tx - 10)}" y="64" width="20" height="15" fill="${wall}"/><path d="M${f1(tx - 6)} 77 v-6 q2 -3 4 0 v6 Z M${f1(tx + 2)} 77 v-6 q2 -3 4 0 v6 Z" fill="#6A6A62"/><path d="M${f1(tx - 12)} 64.5 L${f1(tx + 12)} 64.5 L${f1(tx)} 46 Z" fill="${red}"/><path d="M${f1(tx)} 46 v-7" stroke="#3A3A3A" stroke-width="1.1"/>`;
          perch.push([tx, 39], [bx + 70, 110]);
          s += tree(bx - 14, 177, btw(r, 1.5, 1.8), sea, r) + tree(bx + 116, 177, btw(r, 1.5, 1.8), sea, r);
          return { s, l: "", perch };
        } },
      { id: "furano", zh: "富良野薰衣草田", see: ["薰衣草一排一排種在山坡上", "七月開花的時候，風裡都是香香的味道", "遠方有一整排連在一起的大山"], spots: ["農舍的紅屋頂上", "田邊的木頭樁子上"],
        draw(c) {
          const { r, sea, m } = c, vx = btw(r, 140, 180), crest = (x) => { const t = x / 300; return (1 - t) * (1 - t) * 136 + 2 * t * (1 - t) * 118 + t * t * 134; }, perch = [];
          let s = `<path d="M0 110 L30 98 L60 104 L95 86 L120 96 L150 80 L180 92 L210 84 L245 98 L270 90 L300 100 L300 132 L0 132 Z" fill="#8C9FB4"/>`;
          if (m < 7 || m > 9) for (const [px, py] of [[95, 86], [150, 80], [210, 84]]) s += `<path d="M${px - 10} ${py + 6} L${px} ${py} L${px + 10} ${py + 6} L${px + 5} ${py + 5} L${px} ${py + 8} L${px - 4} ${py + 5} Z" fill="#F2F4F6"/>`;
          s += hills(122, "#6C8A5A", r, 8);
          const [row, base] = m >= 6 && m <= 8 ? ["#8B6BB8", "#6E8A4E"] : m >= 4 && m <= 5 ? ["#6E9A52", "#8A7356"] : m >= 9 && m <= 11 ? ["#7E8A5A", "#8E6E4E"] : ["#D3DAE3", "#EEF1F3"];
          s += `<path d="M0 200 L0 136 Q150 118 300 134 L300 200 Z" fill="${base}"/>`;
          for (let i = -9; i <= 9; i++) { const tx = vx + i * 3.2, ty = crest(tx) + 1, bxx = vx + i * 34; s += `<path d="M${f1(tx - .9)} ${f1(ty)} L${f1(tx + .9)} ${f1(ty)} L${f1(bxx + 11)} 200 L${f1(bxx - 11)} 200 Z" fill="${row}"/>`; }
          if (m >= 6 && m <= 8) for (let i = 0; i < 14; i++) { const x = btw(r, 0, 300), y = btw(r, 170, 198); s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.4" fill="#B49AD8"/>`; }
          const hx = btw(r, 40, 90), hb = crest(hx) + 2;
          s += `<rect x="${f1(hx)}" y="${f1(hb - 14)}" width="26" height="14" fill="#F1ECE2"/><rect x="${f1(hx + 10)}" y="${f1(hb - 9)}" width="6" height="9" fill="#7A5A3A"/><path d="M${f1(hx - 3)} ${f1(hb - 14)} L${f1(hx + 13)} ${f1(hb - 24)} L${f1(hx + 29)} ${f1(hb - 14)} Z" fill="${sea === "winter" ? "#F4F6F6" : "#B5433A"}"/>`;
          perch.push([hx + 13, hb - 24]);
          s += tree(hx + 42, hb + 1, 1.1, sea, r) + tree(btw(r, 220, 280), crest(250) + 2, 1, sea, r);
          s += `<rect x="26" y="170" width="4.5" height="30" fill="#7A5A3A"/><path d="M0 180 L28 178" stroke="#7A5A3A" stroke-width="1.4"/>`;
          perch.push([28.2, 170]);
          return { s, l: "", perch };
        } },
      { id: "otaru", zh: "小樽運河", see: ["運河邊排著一整排老石頭倉庫", "河岸的步道立著一盞一盞煤氣燈", "倉庫的影子倒映在運河的水面上"], spots: ["煤氣燈的燈罩上", "石造倉庫的屋簷上"],
        draw(c) {
          const { r, sea } = c, vx = btw(r, 200, 222), vy = 126, win = sea === "winter", perch = [];
          let s = hills(104, "#8EA1A9", r, 18) + hills(118, "#71907A", r, 10);
          for (let i = 0; i < 3; i++) { const x = btw(r, 10, 150); s += tree(x, 150 + (vy + 3 - 150) * x / (vx - 8), btw(r, 1.2, 1.5) * (1 - x / 400), sea, r); }
          s += `<path d="M70 200 L300 200 L300 182 L${f1(vx + 4)} ${vy + 3} L${f1(vx - 2)} ${vy + 3} Z" fill="#5F7F86"/>`;
          const X = (p) => 300 + (vx + 4 - 300) * p, Bs = (p) => 182 + (vy + 3 - 182) * p, Hf = (p) => 78 * (1 - p), ps = [0, .28, .48, .62, .73, .81, .87, .92];
          for (let j = 0; j < ps.length - 1; j++) {
            const pa = ps[j], pb = ps[j + 1], hm = btw(r, .82, 1.05), xa = X(pa), xb = X(pb), ya = Bs(pa), yb = Bs(pb), ha = Hf(pa) * hm, hb = Hf(pb) * hm, col = pick(r, ["#A99B86", "#B8AA92", "#9C8E7A"]);
            s += `<path d="M${f1(xa)} ${f1(ya)} L${f1(xa)} ${f1(ya + ha * .5)} L${f1(xb)} ${f1(yb + hb * .5)} L${f1(xb)} ${f1(yb)} Z" fill="${col}" opacity=".25"/>`;
            s += `<path d="M${f1(xa)} ${f1(ya)} L${f1(xa)} ${f1(ya - ha)} L${f1(xb)} ${f1(yb - hb)} L${f1(xb)} ${f1(yb)} Z" fill="${col}"/><path d="M${f1(xa)} ${f1(ya - ha)} L${f1(xb)} ${f1(yb - hb)} L${f1(xb)} ${f1(yb - hb * 1.16)} L${f1(xa)} ${f1(ya - ha * 1.16)} Z" fill="${win ? "#EEF0F0" : "#4A4846"}"/><path d="M${f1(xa)} ${f1(ya)} V${f1(ya - ha * 1.16)}" stroke="#6E6252" stroke-width="1"/>`;
            for (const q of [.3, .7]) { const x = xa + (xb - xa) * q, by = ya + (yb - ya) * q, h = ha + (hb - ha) * q, w = (xa - xb) * .13; s += `<rect x="${f1(x - w / 2)}" y="${f1(by - h * .72)}" width="${f1(w)}" height="${f1(h * .22)}" fill="#3E3A36" opacity=".75"/>`; }
            if (j === 0) perch.push([xa + (xb - xa) * .5, ya + (yb - ya) * .5 - (ha + (hb - ha) * .5) * 1.16]);
          }
          for (let i = 0; i < 6; i++) { const y = btw(r, 150, 196), t = (200 - y) / (200 - vy - 3), lx = 70 + (vx - 72) * t; s += `<path d="M${f1(lx + 8 + btw(r, 0, 30) * (1 - t))} ${f1(y)} q4 -2 8 0 t8 0" stroke="#fff" stroke-opacity=".4" stroke-width=".9" fill="none"/>`; }
          s += `<path d="M0 200 L70 200 L${f1(vx - 2)} ${vy + 3} L${f1(vx - 8)} ${vy + 3} L0 150 Z" fill="${win ? "#EEF0F0" : "#B9B0A0"}"/><path d="M70 200 L${f1(vx - 2)} ${vy + 3}" stroke="#8E8678" stroke-width="1.6"/>`;
          for (const p of [.75, .64, .5, .3, .04]) {
            const lx = 70 + (vx - 72) * p - 8 * (1 - p), lb = 200 + (vy + 3 - 200) * p, lh = 52 * (1 - p) + 4, q = 1 - p, ww = 9 * q + 2, hh = 10 * q + 2, top = lb - lh - hh;
            s += `<rect x="${f1(lx - .9 * q - .3)}" y="${f1(lb - lh)}" width="${f1(1.8 * q + .6)}" height="${f1(lh)}" fill="#2F3133"/><path d="M${f1(lx - ww / 2)} ${f1(lb - lh)} L${f1(lx + ww / 2)} ${f1(lb - lh)} L${f1(lx + ww * .35)} ${f1(top)} L${f1(lx - ww * .35)} ${f1(top)} Z" fill="#F3E7B8" stroke="#2F3133" stroke-width="${f1(.4 + .6 * q)}"/><path d="M${f1(lx - ww * .45)} ${f1(top)} L${f1(lx + ww * .45)} ${f1(top)} L${f1(lx)} ${f1(top - hh * .4)} Z" fill="#2F3133"/>`;
            if (p === .04) perch.push([lx, top - hh * .4]);
          }
          if (r() < .4) s += boat(btw(r, 130, 170), 190, .7, false);
          return { s, l: "", perch };
        } },
      { id: "hakodate", zh: "函館金森紅磚倉庫", see: ["紅磚倉庫一棟一棟並排在港邊", "倉庫後面就是圓圓的函館山", "以前用來裝貨的倉庫，現在變成了商店"], spots: ["倉庫三角屋頂的尖上", "港邊漁船的桅杆上"],
        draw(c) {
          const { r, sea } = c, mc = { spring: "#6E8E5E", summer: "#5F7F57", autumn: "#8E7A4E", winter: "#C9D2D4" }[sea], perch = [];
          let s = `<path d="M0 142 Q40 130 80 118 Q120 98 150 84 Q175 68 205 68 Q232 70 252 92 Q272 114 300 122 L300 200 L0 200 Z" fill="${mc}"/><rect x="199" y="64" width="12" height="5" fill="#9A9A96"/><path d="M203 64 v-9 M208 64 v-6" stroke="#8A8A86" stroke-width="1"/>`;
          for (let i = 0; i < 9; i++) { const x = btw(r, 20, 290), y = btw(r, 128, 148); s += `<rect x="${f1(x)}" y="${f1(y)}" width="7" height="5" fill="#E8E1D3"/><path d="M${f1(x - 1)} ${f1(y)} l4.5 -3 l4.5 3 Z" fill="#7E6B5C"/>`; }
          s += `<rect x="0" y="146" width="300" height="16" fill="#A8A7A0"/>`;
          let x = btw(r, 50, 66);
          for (let i = 0; i < 5; i++) {
            const w = btw(r, 34, 42), col = pick(r, ["#A64B36", "#9C4532", "#B0553D"]), mx = x + w / 2;
            s += `<rect x="${f1(x)}" y="130" width="${f1(w)}" height="30" fill="${col}"/><path d="M${f1(x - 1)} 130 L${f1(mx)} 116 L${f1(x + w + 1)} 130 Z" fill="${col}"/><path d="M${f1(x - 2)} 131 L${f1(mx)} 115 L${f1(x + w + 2)} 131" stroke="${sea === "winter" ? "#F4F6F6" : "#4A3E3A"}" stroke-width="2.4" fill="none"/>`;
            s += `<path d="M${f1(mx - 6)} 160 v-12 q6 -7 12 0 v12 Z M${f1(x + 5)} 142 v-6 q2.5 -3 5 0 v6 Z M${f1(x + w - 10)} 142 v-6 q2.5 -3 5 0 v6 Z" fill="#4A3028"/><circle cx="${f1(mx)}" cy="124" r="2" fill="#4A3028"/>`;
            if (i === 1) perch.push([mx, 115]);
            x += w + 1;
          }
          s += `<rect x="0" y="160" width="300" height="4" fill="#8E8A80"/>` + water(164, "#9EC1CC", "#5D8DA0", r) + `<rect x="50" y="164" width="${f1(x - 50)}" height="22" fill="#A64B36" opacity=".2"/>`;
          const bx = btw(r, 200, 250); s += boat(bx, 186, 1, false) + `<path d="M${f1(bx + 13)} 180 v-22 M${f1(bx + 13)} 164 l9 6" stroke="#4A3E3A" stroke-width="1.2"/>`;
          perch.push([bx + 13, 158]);
          return { s, l: "", perch };
        } },
      { id: "biei", zh: "美瑛青池", see: ["池水是加了牛奶一樣的淡淡藍色", "枯掉的樹幹一根一根直直站在水裡", "沒有風的時候，水面像一面鏡子"], spots: ["池中枯樹的樹梢上", "岸邊落葉松的樹梢上"],
        draw(c) {
          const { r, sea } = c, fc = { spring: ["#7FAE62", "#5E8E50", "#3E6A44"], summer: ["#3E6A44", "#4B7A4E", "#365E3E"], autumn: ["#D3A23F", "#C58A35", "#3E5E44"], winter: ["#3E5A4A", "#46604E", "#3E5A4A"] }[sea], win = sea === "winter", perch = [];
          let s = hills(108, "#8E9FAA", r, 10) + `<rect x="0" y="120" width="300" height="28" fill="#33503C"/>`;
          let best = null;
          for (let i = 0; i < 23; i++) { const x = i * 14 + btw(r, -4, 4), h = btw(r, 28, 46), cc = pick(r, fc); s += `<path d="M${f1(x - 7)} 146 L${f1(x)} ${f1(146 - h)} L${f1(x + 7)} 146 Z" fill="${cc}"/>`; if (win) s += `<path d="M${f1(x - 2.5)} ${f1(146 - h * .66)} L${f1(x)} ${f1(146 - h)} L${f1(x + 2.5)} ${f1(146 - h * .66)} Z" fill="#F2F4F4"/>`; if (x > 200 && x < 280 && (!best || h > best[2])) best = [x, 146 - h, h]; }
          s += `<path d="M0 146 Q150 140 300 146 L300 190 Q150 196 0 190 Z" fill="${win ? "#D7E6EC" : "#5DB3C8"}"/><path d="M0 146 Q150 140 300 146 L300 152 Q150 147 0 152 Z" fill="#2E4E3A" opacity=".25"/>`;
          for (let i = 0; i < 5; i++) s += `<path d="M${f1(btw(r, 10, 270))} ${f1(btw(r, 158, 186))} q5 -1.5 10 0 t10 0" stroke="#fff" stroke-opacity=".45" stroke-width=".9" fill="none"/>`;
          const T = []; for (let i = 0; i < 9; i++) T.push([btw(r, 30, 290), btw(r, 156, 184)]);
          T.sort((a, b) => a[1] - b[1]);
          let tall = null;
          for (const [x, b] of T) {
            const h = (b - 140) * btw(r, 1.5, 2.3), w = .9 + (b - 150) * .06, ln = btw(r, -3, 3), col = b > 170 ? "#EDE9E0" : "#D9D4C8", top = b - h;
            s += `<path d="M${f1(x)} ${f1(b + h * .35)} L${f1(x)} ${f1(b)}" stroke="${col}" stroke-opacity=".3" stroke-width="${f1(w)}"/><path d="M${f1(x)} ${f1(b)} L${f1(x + ln)} ${f1(top)} M${f1(x + ln * .5)} ${f1(b - h * .55)} l${f1(4 * w)} ${f1(-5 * w)}" stroke="${col}" stroke-width="${f1(w)}" stroke-linecap="round"/><ellipse cx="${f1(x)}" cy="${f1(b)}" rx="${f1(w * 2.2)}" ry=".8" fill="#fff" opacity=".35"/>`;
            if (x > 110 && x < 280 && (!tall || h > tall[2])) tall = [x + ln, top, h];
          }
          perch.push(tall ? [tall[0], tall[1]] : [T[8][0], T[8][1] - 30]);
          if (best) perch.push([best[0], best[1]]);
          s += `<path d="M0 200 L0 188 Q150 196 300 186 L300 200 Z" fill="${{ spring: "#8FA866", summer: "#7E9A5A", autumn: "#A88E54", winter: "#EEF1F2" }[sea]}"/>`;
          return { s, l: "", perch };
        } },
      { id: "tancho", zh: "釧路濕原", see: ["丹頂鶴是白色的大鳥，頭頂有一小塊紅色", "兩隻丹頂鶴張開翅膀，一跳一跳在跳舞", "丹頂鶴的叫聲很響，遠遠就聽得到"], spots: ["田邊木頭柵欄的柱子上", "柵欄的橫木上"],
        draw(c) {
          const { r, sea } = c, perch = [];
          let s = hills(118, "#A3B1BC", r, 10) + `<rect x="0" y="136" width="300" height="64" fill="${{ spring: "#A9A574", summer: "#8DAA66", autumn: "#C3A867", winter: "#EEF2F3" }[sea]}"/>`;
          for (let i = 0; i < 9; i++) s += tree(i * 34 + btw(r, 0, 14), 138, btw(r, .7, .9), sea, r);
          if (sea === "winter") for (let i = 0; i < 4; i++) s += `<ellipse cx="${f1(btw(r, 20, 280))}" cy="${f1(btw(r, 150, 196))}" rx="${f1(btw(r, 20, 40))}" ry="3" fill="#DCE5EA"/>`;
          else { let g = ""; for (let i = 0; i < 24; i++) { const x = btw(r, 0, 300), y = btw(r, 146, 198); g += `M${f1(x)} ${f1(y)} l${f1(btw(r, -1.5, 1.5))} -6 `; } s += `<path d="${g}" stroke="#6E6A44" stroke-opacity=".5" stroke-width="1"/>`; }
          const crane = (x, y, k, dir, dance) => {
            const P = (a, b) => `${f1(x + a * k * dir)} ${f1(y + b * k)}`, X = (a) => f1(x + a * k * dir), Y = (b) => f1(y + b * k), W = "#FBFBF8", K = "#2B2B2B";
            let o = "";
            if (dance) o += `<path d="M${P(2, -38)} Q${P(10, -62)} ${P(24, -78)} Q${P(30, -66)} ${P(32, -52)} Q${P(20, -44)} ${P(8, -33)} Z" fill="${W}" stroke="#C9CCCC" stroke-width=".6"/><path d="M${P(32, -52)} Q${P(20, -44)} ${P(8, -33)} L${P(9, -38)} Q${P(19, -48)} ${P(30, -58)} Z" fill="${K}"/>`;
            o += `<path d="M${P(-2, 0)} L${P(0, -26)} ${dance ? `M${P(6, -5)} L${P(9, -14)} L${P(3, -26)}` : `M${P(4, 0)} L${P(2, -26)}`}" stroke="#3A3A3A" stroke-width="${f1(1.2 * k)}" fill="none"/>`;
            o += `<path d="M${P(-14, -30)} Q${P(-10, -43)} ${P(6, -41)} Q${P(15, -38)} ${P(14, -31)} Q${P(8, -24)} ${P(-6, -25)} Q${P(-14, -26)} ${P(-14, -30)} Z" fill="${W}" stroke="#C9CCCC" stroke-width=".6"/><path d="M${P(-8, -34)} Q${P(-20, -33)} ${P(-23, -23)} Q${P(-15, -25)} ${P(-8, -27)} Z" fill="${K}"/>`;
            if (dance) o += `<path d="M${P(-4, -37)} Q${P(-16, -60)} ${P(-30, -74)} Q${P(-36, -62)} ${P(-40, -46)} Q${P(-26, -40)} ${P(-10, -31)} Z" fill="${W}" stroke="#C9CCCC" stroke-width=".6"/><path d="M${P(-40, -46)} Q${P(-26, -40)} ${P(-10, -31)} L${P(-11, -36)} Q${P(-25, -45)} ${P(-37, -53)} Z" fill="${K}"/>`;
            o += dance
              ? `<path d="M${P(9, -38)} Q${P(13, -52)} ${P(13, -64)}" stroke="${K}" stroke-width="${f1(3 * k)}" fill="none" stroke-linecap="round"/><circle cx="${X(14)}" cy="${Y(-68)}" r="${f1(2.7 * k)}" fill="${K}"/><circle cx="${X(13.6)}" cy="${Y(-70.2)}" r="${f1(1.5 * k)}" fill="#D23A2E"/><path d="M${P(15.5, -69.5)} L${P(21, -76)} L${P(16.5, -67.6)} Z" fill="#8C8A6A"/>`
              : `<path d="M${P(9, -38)} Q${P(16, -48)} ${P(14, -57)} Q${P(13, -63)} ${P(17, -66)}" stroke="${K}" stroke-width="${f1(3 * k)}" fill="none" stroke-linecap="round"/><circle cx="${X(18)}" cy="${Y(-66.5)}" r="${f1(2.6 * k)}" fill="${K}"/><circle cx="${X(18.4)}" cy="${Y(-68.6)}" r="${f1(1.5 * k)}" fill="#D23A2E"/><path d="M${P(20, -67)} L${P(27.5, -65)} L${P(20, -65.4)} Z" fill="#8C8A6A"/>`;
            return o;
          };
          const c1 = btw(r, 140, 160), k = btw(r, 1.05, 1.2);
          if (r() < .6) s += crane(btw(r, 30, 62), 152, .5, 1, false);
          s += crane(c1, 172, k, 1, true) + crane(c1 + btw(r, 72, 82), 168, k * .95, -1, r() < .4);
          let f = "M0 176 L118 178 M0 186 L118 188"; for (const px of [10, 46, 82, 116]) f += ` M${px} 166 V196`;
          s += `<path d="${f}" stroke="#7A5E44" stroke-width="3"/>`;
          perch.push([46, 166], [64, 176.5]);
          return { s, l: "", perch };
        } },
    ],
  },
};
