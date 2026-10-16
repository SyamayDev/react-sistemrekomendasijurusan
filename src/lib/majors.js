/** Major catalogue data — no scoring engine, so catalogue pages stay light. */
import majors from "../data/majors.json";
import { slugify } from "./slug.js";

export const MAJORS = majors.map((m) => ({ ...m, slug: slugify(m.nama_jurusan) }));
export const MAJOR_BY_SLUG = Object.fromEntries(MAJORS.map((m) => [m.slug, m]));
export const MAJOR_BY_ID = Object.fromEntries(MAJORS.map((m) => [m.id, m]));

/** Qualitative label so a percentage never has to speak for itself. */
export function matchLabel(score) {
  if (score >= 85) return "Sangat cocok";
  if (score >= 72) return "Cocok";
  if (score >= 58) return "Cukup cocok";
  return "Kurang cocok";
}
