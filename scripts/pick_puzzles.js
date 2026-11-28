// Picks the practice puzzles for 每日一課 from the Lichess puzzle database (database.lichess.org, CC0), checked with the phone's own engine.
// Run: bun scripts/pick_puzzles.js <lichess_db_puzzle.csv.zst> [lesson numbers…] — prints, per lesson, the best candidates as JSON lines.
// A Lichess puzzle starts one move early: FEN is the position before the other side's move, Moves[0] is that move, then the solution.
globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
import { readFileSync } from "node:fs";
const { LESSON_ENGINE: E } = await import("../assets/games.js");

const kingSq = (P, side) => P.b.indexOf(side === "w" ? "K" : "k");
const near = (a, b) => Math.max(Math.abs((a & 7) - (b & 7)), Math.abs((a >> 3) - (b >> 3))) === 1;
const mates = (P) => E.legal(P).filter((m) => { const n = E.play(P, m); return E.inCheck(n) && !E.legal(n).length; });
const pieceOf = (P, m) => P.b[m[0]].toLowerCase();
// What each lesson's practice must look like (on top of the Lichess themes): the position after Moves[0] and the solution moves.
const WANT = {
  1: { themes: ["backRankMate", "mateIn1"], test: (P, sol) => { const ms = mates(P); return ms.length >= 1 && ms.every((m) => pieceOf(P, m) === "r"); } },
  2: { themes: ["mateIn1"], test: (P) => { const ms = mates(P), foe = kingSq(P, P.turn === "w" ? "b" : "w"); return ms.length >= 1 && ms.every((m) => pieceOf(P, m) === "q" && near(m[1], foe)); } },
  3: { themes: ["fork"], test: (P, sol) => { if (sol.length !== 3) return false; const m = E.legal(P).find((x) => E.uci(x) === sol[0]); if (!m || pieceOf(P, m) !== "n") return false; const n = E.play(P, m); if (!E.inCheck(n)) return false; const r = E.legal(n).find((x) => E.uci(x) === sol[1]), q = E.play(n, r);
    return sol[2].slice(0, 2) === sol[0].slice(2) && "rqRQ".includes(q.b[E.legal(q).find((x) => E.uci(x) === sol[2])[1]]); } }, // 將軍＋打車或后，再由馬吃掉
};
const [file, ...ns] = process.argv.slice(2);
const want = (ns.length ? ns.map(Number) : Object.keys(WANT).map(Number)).filter((n) => WANT[n]);
const found = Object.fromEntries(want.map((n) => [n, []]));
// The file is many zstd frames with skippable frames between them (a seekable archive), which the stream decoder here stops at: walk the frames
// by hand, step over the skippable ones, decompress each data frame on its own.
function* lines(path) {
  const buf = readFileSync(path), dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let at = 0, rest = "";
  while (at + 8 <= buf.length) {
    const magic = dv.getUint32(at, true);
    if ((magic & 0xfffffff0) === 0x184d2a50) { at += 8 + dv.getUint32(at + 4, true); continue; }
    if (magic !== 0xfd2fb528) throw new Error(`not zstd at ${at}`);
    const d = buf[at + 4], fcs = d >> 6, single = (d >> 5) & 1, sum = (d >> 2) & 1, dict = d & 3;
    let p = at + 5 + (single ? 0 : 1) + [0, 1, 2, 4][dict] + [single ? 1 : 0, 2, 4, 8][fcs];
    for (;;) { const h = buf[p] | (buf[p + 1] << 8) | (buf[p + 2] << 16), size = h >>> 3, type = (h >> 1) & 3; p += 3 + (type === 1 ? 1 : size); if (h & 1) break; }
    p += sum ? 4 : 0;
    const text = rest + new TextDecoder().decode(Bun.zstdDecompressSync(buf.subarray(at, p))), parts = text.split("\n");
    rest = parts.pop(); yield* parts; at = p;
  }
  if (rest) yield rest;
}
let rows = 0;
for (const line of lines(file)) {
  if (!rows++) continue; // header: PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
  const [id, fen, moves, rating, dev, pop, plays, themes, url] = line.split(",");
  const r = Number(rating);
  if (r > 1300 || Number(dev) > 90 || Number(pop) < 85 || Number(plays) < 2000) continue;
  const th = themes.split(" ");
  for (const n of want) {
    const w = WANT[n]; if (!w.themes.every((t) => th.includes(t)) || found[n].length >= 3000) continue;
    try {
      const mv = moves.split(" "); let P = E.fromFen(fen);
      const first = E.legal(P).find((x) => E.uci(x) === mv[0].slice(0, 4)); if (!first) continue;
      P = E.play(P, first); const sol = mv.slice(1).map((u) => u.slice(0, 4));
      // the line must replay legally with this engine (no en passant, promotion only to a queen)
      let Q = P, ok = true; for (const u of mv.slice(1)) { if (u.length > 4 && u[4] !== "q") { ok = false; break; } const m = E.legal(Q).find((x) => E.uci(x) === u.slice(0, 4)); if (!m) { ok = false; break; } Q = E.play(Q, m); }
      if (!ok || !w.test(P, sol)) continue;
      const rows8 = []; for (let y = 0; y < 8; y++) { let s = "", e = 0; for (let x = 0; x < 8; x++) { const p = P.b[y * 8 + x]; if (p === ".") e++; else { if (e) s += e; e = 0; s += p; } } if (e) s += e; rows8.push(s); }
      found[n].push({ id, rating: r, pop: Number(pop), plays: Number(plays), fen: `${rows8.join("/")} ${P.turn} ${P.castle || "-"} - 0 1`, sol, url });
    } catch { /* a row this engine cannot read is skipped */ }
  }
  if (want.every((n) => found[n].length >= 3000)) break;
}
for (const n of want) {
  const best = found[n].sort((a, b) => a.rating - b.rating || b.plays - a.plays).slice(0, 12); // the easiest first
  console.log(`# 第 ${n} 課：${found[n].length} 題合格，最簡單的 12 題`);
  for (const p of best) console.log(JSON.stringify(p));
}
console.error(`讀了 ${rows} 行`);
