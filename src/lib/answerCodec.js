/**
 * Compact, privacy-friendly share codes. One byte per question:
 *   single choice → option index + 1 (0 = unanswered)
 *   checkbox      → bitmask of selected options
 *   text          → never encoded (free text stays on the device)
 * 20 questions → ~27 URL-safe characters, e.g. "v2.BQIDDQQB…".
 */
const VERSION = "v2";

const toBase64Url = (bytes) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const fromBase64Url = (s) => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};

export function encodeAnswers(answers, questions) {
  const bytes = questions.map((q) => {
    const a = answers[q.id];
    if (q.tipe === "text") return 0;
    if (q.tipe === "checkbox") return Array.isArray(a) ? a.reduce((m, i) => m | (1 << i), 0) : 0;
    return Number.isInteger(a) ? a + 1 : 0;
  });
  return `${VERSION}.${toBase64Url(bytes)}`;
}

/** @returns {object|null} answers, or null if the code is malformed. */
export function decodeAnswers(code, questions) {
  try {
    const [version, payload] = String(code || "").split(".");
    if (version !== VERSION || !payload) return null;
    const bytes = fromBase64Url(payload);
    if (bytes.length !== questions.length) return null;
    const answers = {};
    questions.forEach((q, i) => {
      const b = bytes[i];
      if (q.tipe === "text" || b === 0) return;
      if (q.tipe === "checkbox") {
        const picked = q.opsi.map((_, j) => j).filter((j) => b & (1 << j));
        if (picked.length) answers[q.id] = picked;
      } else if (b - 1 < q.opsi.length) {
        answers[q.id] = b - 1;
      }
    });
    return answers;
  } catch {
    return null;
  }
}
