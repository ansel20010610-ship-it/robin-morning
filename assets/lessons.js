// 每日一課 (the owner 2026-11-28 「我想在遊戲桌加入每日西洋棋教學從入門到大師」; his picks the same day: 乙 讀一段＋走一題, 照自己的進度, 一年 365 課 —
// 入門 40、初級 80、中級 100、高級 85、大師 60). Each lesson: a short reading, a position (FEN), and the move(s) to find, judged on the phone by games.js.
// `mate: 1` takes any move that mates; `line` is the moves to find with the other side's replies between them (UCI). Every lesson is checked by
// scripts/check_lessons.js (legal, the answer works, nothing else does).
// Written like a teacher talking to you (the owner's pick 2026-11-28: 甲 老師口吻).
export const STAGES = [["入門", 40], ["初級", 80], ["中級", 100], ["高級", 85], ["大師", 60]];
export const LESSONS = [
  {
    n: 1, title: "底線將死", fen: "7k/8/6K1/8/8/8/8/R7 w - - 0 1", mate: 1, goal: "一步將死",
    practice: [{ id: "trvyY", fen: "2b3k1/p1b2ppp/8/8/2N3P1/7K/PP6/3rR3 w - - 0 1", mate: 1 }, { id: "Ya6cB", fen: "6k1/R3b1pp/2Q1p3/2p2p2/2P2P2/3P4/P5PP/1r3N1K b - - 0 1", mate: 1 }],
    say: {
      text: ["車（也叫城堡）只走直線，可是一走就能走到底。今天先看它最拿手的一招。", "你看黑王縮在角落，g7、h7 兩格都被你的王看住了。這時只要把車送上最後一排，從旁邊照過去，它就沒地方躲。"],
      hint: "車要上最後一排，從哪一格上去？",
      tip: "讓車走上對方王的那一排，再看它還有沒有格子逃。",
      done: "對！這就是底線將死。反過來，你自己的王也要留一格透氣的地方，免得被人這樣將死。",
    },
  },
  {
    n: 2, title: "親吻將死", fen: "r6k/2Q5/6K1/8/8/8/8/8 w - - 0 1", mate: 1, goal: "一步將死",
    practice: [{ id: "ITaBk", fen: "r3r1k1/5pp1/4b2p/1qb2N2/p1p1PpP1/P1QpP2P/1P4B1/1R2R1K1 w - - 0 1", mate: 1 }, { id: "560NY", fen: "1r2r1k1/Q1pbqppp/1n6/3N4/8/1PB3P1/P1P1PPBP/3RK2R b K - 0 1", mate: 1 }],
    say: {
      text: ["后是最強的子，可是它一個人將不死王，得有人撐腰。", "這次黑車守著最後一排，上一課那招行不通了。試試讓后直接走到黑王身邊、貼著它。黑王想吃后？后旁邊站著你的王，吃了就是自己走進被將的格子。"],
      hint: "找一格緊貼黑王、又有你的王保護的格子。",
      tip: "找一格貼著對方的王、又有自己人保護的格子，讓后走過去。",
      done: "對！后有人撐腰，就能貼上去將死，這叫親吻將死。",
    },
  },
  {
    n: 3, title: "馬的雙擊", fen: "r3k3/5ppp/8/3N4/8/8/5PPP/6K1 w - - 0 1", line: ["d5c7", "e8e7", "c7a8"], goal: "用馬一跳打兩個，再把車吃掉",
    practice: [{ id: "0fIB2", fen: "2r3k1/p5p1/2p3N1/2Pp4/1n4Pp/5P1P/1PP2B2/5K2 w - - 0 1", line: ["g6e7", "g8f7", "e7c8"] }, { id: "NrKRf", fen: "5rk1/p5pp/2R5/8/5n2/1Pp5/P5PP/2R3K1 b - - 0 1", line: ["f4e2", "g1h1", "e2c1"] }],
    say: {
      text: ["馬走「日」字，還能跳過中間的子。它最可怕的地方，是一跳能同時打到兩個目標。", "這一課找一步：馬跳過去將軍，同時瞄準黑車。黑王只能先逃，車就保不住了。"],
      hint: "哪一格離 e8 和 a8 都剛好是一個「日」字？",
      tip: "找一格，讓馬同時打到對方的王和車。",
      done: "對！一跳兩得，這就是雙擊。將軍的雙擊最狠，因為對方一定得先顧王。",
    },
  },
];
export const TOTAL = STAGES.reduce((s, [, n]) => s + n, 0);
export function stageOf(n) { let k = n; for (const [name, len] of STAGES) { if (k <= len) return [name, k, len]; k -= len; } return STAGES.at(-1); }
