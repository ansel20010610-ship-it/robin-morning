// Checks every 每日一課 lesson (assets/lessons.js) with the phone's own engine: the position is legal for the side to move, the answer works,
// no other first move also works, and the words are there. Run: bun scripts/check_lessons.js
globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { LESSONS, TOTAL } = await import("../assets/lessons.js");
const { LESSON_ENGINE: E } = await import("../assets/games.js");
const mates = (P) => E.legal(P).filter((m) => { const n = E.play(P, m); return E.inCheck(n) && !E.legal(n).length; });
let bad = 0;
const fail = (k, why) => { bad++; console.log(`第 ${k.n} 課 ${k.title}：${why}`); };
const seen = new Set();
const all = LESSONS.flatMap((k) => [k, ...(k.practice || []).map((q, j) => ({ ...q, n: k.n, title: `${k.title} 練習 ${j + 1}（${q.id}）`, say: k.say, practice: [0, 0], sub: true }))]);
for (const k of all) {
  if (!k.sub) { if (seen.has(k.n)) fail(k, "課號重複"); seen.add(k.n); }
  if (k.n < 1 || k.n > TOTAL) fail(k, "課號超出範圍");
  { const T = k.say; if (!T || !T.text?.length || !T.hint || !T.tip || !T.done) fail(k, "課文缺字"); }
  if ((k.practice || []).length !== 2) fail(k, "練習題不是兩題");
  const P = E.fromFen(k.fen), foe = P.turn === "w" ? "b" : "w";
  if (P.b.filter((p) => p === "K").length !== 1 || P.b.filter((p) => p === "k").length !== 1) { fail(k, "王的數目不對"); continue; }
  if (E.inCheck({ ...P, turn: foe })) fail(k, "不該走的一方正被將軍");
  if (k.mate) { const ms = mates(P); if (!ms.length) fail(k, "沒有一步將死"); else console.log(`第 ${k.n} 課 ${k.title}：將死的走法 ${ms.map(E.uci).join(" ")}`); continue; }
  let Q = P, ok = true;
  for (const [j, u] of k.line.entries()) {
    const m = E.legal(Q).find((x) => E.uci(x) === u); if (!m) { fail(k, `第 ${j + 1} 步 ${u} 不合法`); ok = false; break; }
    if (j % 2 === 1) { // the reply shown: every other reply must leave the next move of the line (or an equal one) working
      for (const alt of E.legal(Q)) { const A = E.play(Q, alt), nx = k.line[j + 1]; if (nx && !E.legal(A).some((x) => E.uci(x) === nx)) fail(k, `對方改走 ${E.uci(alt)} 時，${nx} 走不了`); }
    }
    Q = E.play(Q, m);
  }
  if (ok) console.log(`第 ${k.n} 課 ${k.title}：${k.line.join(" ")} 走得通`);
}
console.log(bad ? `有 ${bad} 處不對` : `${LESSONS.length} 課、${all.length} 題都通過`);
process.exit(bad ? 1 : 0);
