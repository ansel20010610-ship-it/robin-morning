// Read an article aloud with the device's own speech voices (Web Speech API — on-device, free).
// Sentences are queued one by one: long utterances get cut off on some browsers, and iOS pause/resume is unreliable,
// so "pause" cancels and remembers the sentence, and "resume" starts again from it.
import { store } from "./util.js";

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
export const canSpeak = () => Boolean(synth && window.SpeechSynthesisUtterance);

export const RATES = [0.9, 1, 1.15, 1.3];
export const getRate = () => { const r = Number(store.get("speech.rate", 1)); return RATES.includes(r) ? r : 1; };
export const setRate = (r) => store.set("speech.rate", r);

function pickVoice() {
  const vs = synth.getVoices();
  const by = (re) => vs.find((v) => re.test(v.lang.replace("_", "-")));
  return by(/^zh-TW/i) || by(/^zh-Hant/i) || by(/^zh-HK/i) || by(/^cmn/i) || by(/^zh/i) || null;
}

// Which elements are read, in reading order. Figures, tables, diagrams and source lists are skipped.
const B = ":is(.body, .body > .spoiler-body)"; // the body and a revealed spoiler section
const READ = [".article-head h1", ".article-head .dek", `${B} > p`, `${B} > h2`, ".body blockquote .zh",
  `${B} > ul > li`, `${B} > ol > li`, ".body .scripture .ref", ".body .scripture .verses", ".body .prayer p",
  ".body .news h3", ".body .news p:not(.src)", ".body .callout .lbl", ".body .callout p", ".body .callout li",
  ".body .exercise h3", ".body .exercise li", ".body .timeline li", ".body .spoiler"].join(",");

function sentences(text) {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return [];
  const parts = t.match(/[^。！？；!?]+[。！？；!?」』）)]*|.+$/g) || [t];
  // merge very short pieces so the voice does not stutter
  const out = [];
  for (const p of parts) {
    if (out.length && (out[out.length - 1].length < 12 || p.length < 6)) out[out.length - 1] += p;
    else out.push(p);
  }
  return out;
}

export function createReader(root, { onState } = {}) {
  const queue = [];
  for (const el of root.querySelectorAll(READ)) {
    if (el.closest("[data-spoiler-hidden]")) continue;
    // the visible tag label (e.g. 推論) is read first, which keeps the fact / inference distinction audible
    for (const s of sentences(el.textContent || "")) queue.push({ el, text: s });
  }
  let i = 0, playing = false, current = null;

  const mark = (el) => {
    root.querySelectorAll(".speaking").forEach((n) => n.classList.remove("speaking"));
    if (!el) return;
    el.classList.add("speaking");
    const r = el.getBoundingClientRect();
    if (r.top < 70 || r.bottom > window.innerHeight - 140) el.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  function speakNext() {
    if (!playing) return;
    if (i >= queue.length) { stop(true); return; }
    const item = queue[i];
    const u = new SpeechSynthesisUtterance(item.text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.lang = v ? v.lang : "zh-TW";
    u.rate = getRate();
    u.onend = () => { if (current === u) { i += 1; speakNext(); } };
    u.onerror = (e) => { if (current === u && e.error !== "interrupted" && e.error !== "canceled") { i += 1; speakNext(); } };
    current = u;
    mark(item.el);
    synth.speak(u);
  }

  function play() {
    if (!queue.length) return;
    playing = true;
    synth.cancel();
    speakNext();
    onState?.("playing");
  }
  function pause() {
    playing = false;
    current = null;
    synth.cancel();
    onState?.("paused");
  }
  function stop(finished = false) {
    playing = false;
    current = null;
    synth.cancel();
    mark(null);
    if (finished) i = 0;
    onState?.(finished ? "done" : "stopped");
  }
  // start reading from the paragraph the reader tapped
  function playFrom(el) {
    const k = queue.findIndex((q) => q.el === el);
    if (k >= 0) { i = k; play(); }
  }

  // move the start point without playing (used when the queue is rebuilt while paused)
  function seek(el) {
    const k = queue.findIndex((q) => q.el === el);
    if (k >= 0) i = k;
  }

  return { play, pause, stop, playFrom, seek, toggle: () => (playing ? pause() : play()), get playing() { return playing; }, get length() { return queue.length; } };
}

// Some browsers load voices asynchronously.
if (canSpeak()) { synth.getVoices(); synth.addEventListener?.("voiceschanged", () => synth.getVoices()); }
