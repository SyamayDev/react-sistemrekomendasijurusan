/**
 * Lets any page open the AI chat with a prefilled question and optional
 * result context, without importing the (lazy) chat panel.
 */
const EVENT = "siraju:chat";

/** @param {{ prompt?: string, context?: object }} detail */
export function openChat(detail = {}) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail }));
}

export function onChatRequest(handler) {
  const fn = (e) => handler(e.detail || {});
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}

/** Compact, privacy-light summary of a result for the AI (no raw answers). */
export function resultContext(result) {
  return {
    topMajors: result.ranked.slice(0, 5).map((m) => ({ nama: m.nama_jurusan, kategori: m.kategori, skor: m.score })),
    profil: Object.fromEntries(Object.entries(result.profile).map(([k, v]) => [k, Math.round(v * 100)])),
  };
}
