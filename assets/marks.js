// 劃線本 (Anstreichungen): a pencil line under a passage of an article. The reader selects text the native way; a small
// pill offers 劃線, the passage is wrapped in <mark class="pencil"> and kept on this phone (rm.marks) with twenty
// characters of context either side, so it finds its place again on the next render — or stays quietly away when the
// article has been corrected since. Nothing here touches the native selection or its copy menu: no preventDefault on a
// touch, no user-select on the text.
import { store, toast } from "./util.js";
import { calm } from "./motion.js";

const MAX = 600, CTX = 20, MIN = 2, LIMIT = 300;
const BLOCKS = "p, li, h2"; // a mark lives inside one of these
const SKIP = ".sources, .takeaway, .toc, figure, figcaption, .unlock, .next, .related, .music"; // not body text (the player's status line is not prose)

export const allMarks = () => { const m = store.get("marks", []); return Array.isArray(m) ? m.filter((x) => x && typeof x.id === "string" && typeof x.key === "string" && typeof x.text === "string") : []; };
export const marksOf = (key) => allMarks().filter((m) => m.key === key);
const rid = () => Math.random().toString(36).slice(2, 10);
function addMark(key, text, ctx) {
  const m = { id: rid(), key, text, ctx, at: new Date().toISOString() };
  store.set("marks", [...allMarks(), m].slice(-MAX));
  return m;
}
export function removeMark(id) { store.set("marks", allMarks().filter((m) => m.id !== id)); }
// The toast on the first three marks only (rm.marks.hint): after that the reader knows where they go.
function hint() { const n = Number(store.get("marks.hint", 0)) || 0; if (n >= 3) return; store.set("marks.hint", n + 1); toast("已劃線，收在劃線本"); }

// The block a node's text belongs to, or null when it is not body text.
const blockOf = (node) => { const el = node?.nodeType === 1 ? node : node?.parentElement; const b = el?.closest(BLOCKS); return b && !b.closest(SKIP) ? b : null; };
const textNodes = (block) => { const w = document.createTreeWalker(block, NodeFilter.SHOW_TEXT), out = []; let n; while ((n = w.nextNode())) out.push(n); return out; };
// Characters `start`…`start + len` of a block's text, as a Range over its text nodes (null when the text is shorter).
export function rangeAt(block, start, len) {
  const r = document.createRange();
  let pos = 0, open = false;
  for (const n of textNodes(block)) {
    const end = pos + n.data.length;
    if (!open && start < end) { r.setStart(n, start - pos); open = true; }
    if (open && start + len <= end) { r.setEnd(n, start + len - pos); return r; }
    pos = end;
  }
  return null;
}
// .body h2 is a flex row (its gold square is ::before): a mark round part of its text would split the text into several
// items with gaps between them, so the whole text is first gathered into one span. Text offsets are unchanged by this.
function gather(block) {
  if (block.tagName !== "H2" || (block.childNodes.length === 1 && block.firstElementChild?.classList.contains("h2-in"))) return;
  const s = document.createElement("span");
  s.className = "h2-in";
  s.append(...block.childNodes);
  block.append(s);
}
function wrap(range, id) {
  const m = document.createElement("mark");
  m.className = "pencil";
  m.dataset.id = id;
  try { range.surroundContents(m); } catch { m.append(range.extractContents()); range.insertNode(m); } // the range crosses an inline element's edge
  return m;
}
export function unwrap(body, id) {
  body.querySelectorAll(`mark.pencil[data-id="${id}"]`).forEach((m) => { const p = m.parentNode; m.replaceWith(...m.childNodes); p.normalize(); });
}

// How well an occurrence of the text at `i` in `t` sits in its remembered context: matching characters before and after.
const tail = (a, b) => { let n = 0; while (n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n]) n++; return n; };
const head = (a, b) => { let n = 0; while (n < a.length && n < b.length && a[n] === b[n]) n++; return n; };
export const fit = (t, i, len, ctx) => tail(t.slice(Math.max(0, i - CTX), i), ctx?.before || "") + head(t.slice(i + len, i + len + CTX), ctx?.after || "");
// The occurrence of `text` in `blocks` that fits its context best (the first, on a tie), or null.
export function locate(blocks, text, ctx) {
  let best = null;
  for (const b of blocks) {
    const t = b.textContent;
    for (let i = t.indexOf(text); i >= 0; i = t.indexOf(text, i + 1)) {
      const sc = fit(t, i, text.length, ctx);
      if (!best || sc > best.sc) best = { b, i, sc };
    }
  }
  return best;
}
// On render: this article's marks find their place again. Returns id → <mark> for the ones found.
export function applyMarks(body, key) {
  const found = new Map();
  const blocks = [...body.querySelectorAll(BLOCKS)].filter((b) => !b.closest(SKIP));
  for (const m of marksOf(key)) {
    const at = locate(blocks, m.text, m.ctx);
    if (!at) continue;
    gather(at.b);
    const r = rangeAt(at.b, at.i, m.text.length);
    if (r) found.set(m.id, wrap(r, m.id));
  }
  return found;
}

const PENCIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M4.5 19.5l.9-3.6L16.2 5.1a1.3 1.3 0 0 1 1.8 0l.9.9a1.3 1.3 0 0 1 0 1.8L8.1 18.6z"/><path d="M14.6 6.7l2.7 2.7"/></svg>';
// The pill and its listeners for one article; returns the function that takes them down again (viewArticle's cleanup).
export function pencil(body, key) {
  const pill = document.createElement("button");
  pill.type = "button";
  pill.className = "mark-pill";
  pill.hidden = true;
  document.body.append(pill);
  let pending = null, t = 0, acted = 0;
  const hide = () => { pending = null; pill.hidden = true; pill.classList.remove("on"); };
  // Just above the selection (36px pill, 8px gap), or under it when the top bar is in the way; never off the sides or
  // under the bottom bar.
  const place = (r) => {
    const w = pill.offsetWidth, h = pill.offsetHeight || 36;
    const bar = document.querySelector(".nav")?.offsetHeight || 58;
    const top = r.top - 44 >= 56 ? r.top - 44 : Math.min(r.bottom + 8, innerHeight - bar - h - 8);
    pill.style.top = `${Math.round(top)}px`;
    pill.style.left = `${Math.round(Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)))}px`;
  };
  const show = (label, r, act) => {
    pending = act;
    pill.innerHTML = `${PENCIL}${label}`;
    pill.hidden = false;
    place(r);
    requestAnimationFrame(() => { if (!pill.hidden) pill.classList.add("on"); }); // the next frame, so the fade runs
  };
  const save = (block, r, text) => {
    const pre = document.createRange();
    pre.setStart(block, 0);
    pre.setEnd(r.startContainer, r.startOffset);
    const off = pre.toString().length, all = block.textContent;
    if (all.slice(off, off + text.length) !== text) return; // the text moved under the pill (a spoiler opened, say)
    const m = addMark(key, text, { before: all.slice(Math.max(0, off - CTX), off), after: all.slice(off + text.length, off + text.length + CTX) });
    gather(block); // may move the text nodes, so the mark is placed by its offsets, not by the selection's range
    const at = rangeAt(block, off, text.length);
    if (at) wrap(at, m.id);
    try { document.getSelection()?.removeAllRanges(); } catch { /* ignore */ }
    hint();
  };
  // A selection that has settled: one block of body text, 2–300 characters, clear of any mark already there.
  const check = () => {
    const sel = document.getSelection();
    if (!sel || !sel.rangeCount || sel.isCollapsed) { hide(); return; }
    const r = sel.getRangeAt(0), block = blockOf(r.commonAncestorContainer);
    if (!block || !body.contains(block)) { hide(); return; }
    const text = r.toString();
    if (text.trim().length < MIN || text.length > LIMIT || [...block.querySelectorAll("mark.pencil")].some((m) => r.intersectsNode(m))) { hide(); return; }
    const kept = r.cloneRange();
    show("劃線", r.getBoundingClientRect(), () => save(block, kept, text));
  };
  const onSel = () => { clearTimeout(t); t = setTimeout(check, 120); };
  // A tap on a mark (not a selection being made over it) offers to take it away.
  const onTap = (e) => {
    const m = e.target.closest("mark.pencil");
    if (!m || Date.now() - acted < 500) return;
    const sel = document.getSelection();
    if (sel && !sel.isCollapsed) return;
    const id = m.dataset.id;
    show("移除劃線", m.getBoundingClientRect(), () => { removeMark(id); unwrap(body, id); });
  };
  const onDoc = (e) => { if (!pill.contains(e.target) && !e.target.closest?.("mark.pencil")) hide(); };
  // pointerup as well as click: with text selected, iOS may spend the tap on dismissing the selection. `pending` is
  // taken once, so the pair never acts twice; `acted` keeps the click that follows from reading as a tap on the new mark.
  const act = () => { const p = pending; hide(); if (!p) return; acted = Date.now(); try { p(); } catch (e) { console.warn("mark failed", e); } };
  pill.addEventListener("pointerup", act);
  pill.addEventListener("click", act);
  document.addEventListener("selectionchange", onSel);
  document.addEventListener("click", onDoc);
  window.addEventListener("scroll", hide, { passive: true });
  body.addEventListener("click", onTap);
  return () => {
    clearTimeout(t);
    document.removeEventListener("selectionchange", onSel);
    document.removeEventListener("click", onDoc);
    window.removeEventListener("scroll", hide);
    body.removeEventListener("click", onTap);
    pill.remove();
  };
}

// 劃線本's deep link: the article scrolls to this mark and lets it glow once in gold (not under reduced motion).
export function land(el) {
  const r = el.getBoundingClientRect();
  if (!calm()) requestAnimationFrame(() => el.classList.add("glow"));
  return Math.max(0, scrollY + r.top - (innerHeight - r.height) / 2);
}
