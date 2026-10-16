/**
 * The old site used HashRouter ("#/quiz"). Old bookmarks and shared links
 * still work: we translate them to the new clean URLs with a full redirect
 * (before hydration, so the prerendered HTML always matches its route).
 */
const MAP = {
  "/": "",
  "/quiz": "tes/",
  "/result": "hasil/",
  "/about": "tentang/",
  "/features": "#cara-kerja",
};

export function redirectLegacyHash() {
  const { hash } = window.location;
  if (!hash.startsWith("#/")) return false;
  const path = hash.slice(1).split("?")[0].replace(/\/$/, "") || "/";
  window.location.replace(`${import.meta.env.BASE_URL}${MAP[path] ?? ""}`);
  return true;
}
