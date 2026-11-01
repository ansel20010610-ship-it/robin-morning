// 加入行事曆 (Kalender): one event written as an iCalendar file (RFC 5545) and handed to the phone — a concert's show
// (app.js viewConcert) or Barça's next fixture (viewArticle). No library: the file is a dozen lines, and the only
// parts that bite are the escaping, the 75-octet folding and the time zone, all here.

const pad = (n) => String(n).padStart(2, "0");
// An instant as the UTC stamp the file carries (DTSTART/DTEND/DTSTAMP): calendars convert it to the phone's own zone,
// so a kickoff entered as Taiwan 04:00 reads 21:00 in Vienna.
const stamp = (ms) => { const d = new Date(ms); return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`; };
// Taiwan wall-clock "YYYY-MM-DDTHH:MM" (seconds optional) as an instant; NaN when it is not one.
const twMs = (local) => (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(local || "") ? Date.parse(`${local.length === 16 ? `${local}:00` : local}+08:00`) : NaN);
// TEXT values: backslash, semicolon and comma are escaped, a line break becomes the two characters \n (RFC 5545 §3.3.11).
const text = (s) => String(s ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r\n|\r|\n/g, "\\n");
// A URI value is not TEXT: no escaping, but nothing that could break the line.
const uri = (s) => String(s ?? "").replace(/[\r\n\s]+/g, "");

// Fold a content line at 75 octets (§3.1): a continuation line starts with one space, which is one of its 75. Counted
// in UTF-8 bytes — a Chinese glyph is three — and only ever cut between code points, so no glyph is torn in half.
export function fold(line) {
  const out = [];
  let cur = "", n = 0;
  for (const ch of line) {
    const cp = ch.codePointAt(0), b = cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
    if (n + b > 75) { out.push(cur); cur = " "; n = 1; }
    cur += ch; n += b;
  }
  out.push(cur);
  return out.join("\r\n");
}

// The file for one event. `start` is Taiwan local time ("YYYY-MM-DDTHH:MM"); `minutes` its length; `uid` is made unique
// to this paper, so adding the same show twice updates one entry rather than making two. "" when `start` is no time.
export function icsFor({ title, start, minutes = 120, location, description, url, uid }) {
  const t0 = twMs(start);
  if (Number.isNaN(t0)) return "";
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//知更鳥晨間記事//ZH", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${text(uid || `${start}-${title}`).replace(/\s+/g, "-")}@robin-morning`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(t0)}`,
    `DTEND:${stamp(t0 + Math.max(1, Number(minutes) || 120) * 60000)}`,
    `SUMMARY:${text(title)}`,
    location ? `LOCATION:${text(location)}` : "",
    description ? `DESCRIPTION:${text(description)}` : "",
    uri(url) ? `URL:${uri(url)}` : "",
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean);
  return lines.map(fold).join("\r\n") + "\r\n";
}

// Hand the file over. On the phone the share sheet is the way in — it offers 行事曆 and 檔案, and a home-screen app has no
// download tray — so navigator.share with the file comes first wherever it is possible; elsewhere a download through a
// temporary link, which Safari and Chrome on the Mac open in Calendar. True when something was handed over; false when
// nothing could be, or the reader closed the sheet (AbortError is a change of mind, not a failure).
export async function saveIcs(filename, text) {
  if (!text) return false;
  let file = null;
  try { file = new File([text], filename, { type: "text/calendar" }); } catch { /* no File: the Blob route below */ }
  if (file && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return true; }
    catch (e) { if (e?.name === "AbortError") return false; /* anything else: try the download */ }
  }
  try {
    const url = URL.createObjectURL(file || new Blob([text], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.rel = "noopener"; a.hidden = true;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch { return false; }
}
