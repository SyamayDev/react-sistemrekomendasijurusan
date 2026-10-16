/**
 * SI-RAJU recommendation engine — pure functions, no React, no I/O.
 *
 * Model in one paragraph: every answer produces *evidence* for or against each
 * major (option-aware, so picking "art" no longer boosts engineering). Evidence
 * is normalised by how much evidence that major *could* have received, with a
 * small shrinkage term so majors with little data can't top the list by luck.
 * In parallel, answers build a RIASEC interest profile; its cosine similarity
 * to each major's profile adds a holistic "shape" match. Both are blended and
 * calibrated into a match percentage, and every result can explain itself.
 *
 * Answer format: answers[qid] =
 *   scale | yesno | radio → option index (number)
 *   checkbox             → array of option indices
 *   text                 → string
 */
import { RIASEC_KEYS, majorProfile, cosine, emptyProfile } from "./riasec.js";
import { matchHobbies } from "./hobbies.js";

const SHRINK = 1.5; // pseudo-evidence that keeps thin-data majors honest
const W_EVIDENCE = 0.72;
const W_PROFILE = 0.28;

/** Effect of choosing `opt` on `major` (option-level evidence). */
function optionEffect(opt, major) {
  const e = opt.efek;
  if (!e) return 0;
  let v = 0;
  if (e.jurusan && e.jurusan[major.id]) v += e.jurusan[major.id];
  if (e.kategori && e.kategori[major.kategori]) v += e.kategori[major.kategori];
  if (e.karakter) {
    let best = 0;
    for (const trait of major.karakter_cocok || []) best = Math.max(best, e.karakter[trait] || 0);
    v += best;
  }
  return v;
}

const sumTop = (values, k) => [...values].sort((a, b) => b - a).slice(0, k).reduce((s, x) => s + Math.max(0, x), 0);

/** Intensity of a scale answer: 1..5 → -1..+1 (3 is neutral). */
const scaleT = (index) => (index - 2) / 2;

export function isAnswered(q, a) {
  if (q.tipe === "text") return true;
  if (q.tipe === "checkbox") return Array.isArray(a) && a.length >= (q.min || 1) && a.length <= (q.max || q.opsi.length);
  return Number.isInteger(a) && a >= 0 && a < q.opsi.length;
}

export function buildModel(questions, majors) {
  const profiles = majors.map(majorProfile);

  // Precompute per-question, per-major option effects and the maximum evidence
  // each major could receive from that question.
  const effects = questions.map((q) => {
    if (q.tipe === "radio" || q.tipe === "checkbox") {
      return majors.map((m) => q.opsi.map((o) => optionEffect(o, m)));
    }
    return null;
  });
  const maxEvidence = questions.map((q, qi) =>
    majors.map((m, mi) => {
      if (q.tipe === "scale" || q.tipe === "yesno") return Math.abs(q.bobot_jurusan?.[m.id] || 0);
      if (q.tipe === "radio") return Math.max(0, ...effects[qi][mi]);
      if (q.tipe === "checkbox") return sumTop(effects[qi][mi], q.max || q.opsi.length);
      return 0; // text = bonus only, added when it matches
    })
  );
  // Max achievable value per RIASEC axis, so the user profile reads 0..1.
  const riasecMax = emptyProfile();
  for (const q of questions) {
    for (const k of RIASEC_KEYS) {
      if (q.tipe === "scale" || q.tipe === "yesno") riasecMax[k] += Math.abs(q.riasec?.[k] || 0);
      else if (q.tipe === "radio") riasecMax[k] += Math.max(0, ...q.opsi.map((o) => o.efek?.riasec?.[k] || 0));
      else if (q.tipe === "checkbox") riasecMax[k] += sumTop(q.opsi.map((o) => o.efek?.riasec?.[k] || 0), q.max || q.opsi.length);
    }
  }

  /** Evidence one answered question gives one major (+ which options mattered). */
  function contribution(qi, mi, answer) {
    const q = questions[qi];
    const m = majors[mi];
    if (q.tipe === "scale") return { c: (q.bobot_jurusan?.[m.id] || 0) * scaleT(answer) };
    if (q.tipe === "yesno") return { c: (q.bobot_jurusan?.[m.id] || 0) * (q.opsi[answer].t ?? (answer === 0 ? 1 : -0.5)) };
    if (q.tipe === "radio") return { c: effects[qi][mi][answer] };
    if (q.tipe === "checkbox") {
      const picked = answer.filter((i) => effects[qi][mi][i] > 0);
      return { c: answer.reduce((s, i) => s + effects[qi][mi][i], 0), picked };
    }
    return { c: 0 };
  }

  function userProfile(answers) {
    const raw = emptyProfile();
    questions.forEach((q) => {
      const a = answers[q.id];
      if (!isAnswered(q, a) || q.tipe === "text") return;
      const add = (r, t = 1) => r && RIASEC_KEYS.forEach((k) => (raw[k] += (r[k] || 0) * t));
      if (q.tipe === "scale") add(q.riasec, scaleT(a));
      else if (q.tipe === "yesno") add(q.riasec, q.opsi[a].t ?? 1);
      else if (q.tipe === "radio") add(q.opsi[a].efek?.riasec);
      else if (q.tipe === "checkbox") a.forEach((i) => add(q.opsi[i].efek?.riasec));
    });
    const p = emptyProfile();
    for (const k of RIASEC_KEYS) p[k] = riasecMax[k] ? Math.min(1, Math.max(0, raw[k] / riasecMax[k])) : 0;
    return p;
  }

  /** Map a 0..1 blended score onto a readable, honest percentage. */
  const toPercent = (s) => Math.round(Math.min(98, Math.max(20, 100 * (0.28 + 0.7 * s))));

  function recommend(answers) {
    const profile = userProfile(answers);
    const hobby = matchHobbies(answers.q7);
    const ranked = majors.map((m, mi) => {
      let got = 0;
      let possible = 0;
      questions.forEach((q, qi) => {
        const a = answers[q.id];
        if (q.tipe === "text") {
          // Optional question: a match is a genuine boost, a miss costs nothing.
          const b = hobby.bonus.get(m.id) || 0;
          got += b;
          possible += b * 0.4;
          return;
        }
        if (!isAnswered(q, a)) return;
        possible += maxEvidence[qi][mi];
        got += contribution(qi, mi, a).c;
      });
      const evidence = got / (possible + SHRINK); // ~ -1..1
      const evidence01 = Math.min(1, Math.max(0, (evidence + 0.25) / 1.25));
      const shape = cosine(profile, profiles[mi]);
      const blended = W_EVIDENCE * evidence01 + W_PROFILE * shape;
      return { ...m, score: toPercent(blended), raw: blended, evidence, shape, profile: profiles[mi] };
    });
    ranked.sort((a, b) => b.raw - a.raw || a.nama_jurusan.localeCompare(b.nama_jurusan, "id"));

    // Average of each field's best three majors → "which rumpun suits you".
    const byCategory = {};
    for (const m of ranked) (byCategory[m.kategori] ||= []).push(m.score);
    const categories = Object.entries(byCategory)
      .map(([id, scores]) => ({ id, score: Math.round(scores.slice(0, 3).reduce((s, x) => s + x, 0) / Math.min(3, scores.length)) }))
      .sort((a, b) => b.score - a.score);

    return { ranked, profile, categories, hobbies: hobby.matches };
  }

  /**
   * Human-readable reasons why `majorId` matched, strongest first. Each reason
   * carries its share of the positive evidence so the UI can show weight bars.
   */
  function explain(majorId, answers, limit = 4) {
    const mi = majors.findIndex((m) => m.id === majorId);
    if (mi < 0) return [];
    const hobby = matchHobbies(answers.q7);
    const out = [];
    questions.forEach((q, qi) => {
      const a = answers[q.id];
      if (q.tipe === "text") {
        const b = hobby.bonus.get(majorId);
        if (b) out.push({ qid: q.id, c: b, text: fill(q.alasan, joinList(hobby.matches), false) });
        return;
      }
      if (!isAnswered(q, a)) return;
      const { c, picked } = contribution(qi, mi, a);
      if (c <= 0.05) return;
      out.push({ qid: q.id, c, text: reasonText(q, a, picked) });
    });
    const total = out.reduce((s, r) => s + r.c, 0) || 1;
    return out
      .sort((x, y) => y.c - x.c)
      .slice(0, limit)
      .map((r) => ({ ...r, share: r.c / total }));
  }

  /** Traits of the major that the user also claimed for themselves. */
  function sharedTraits(majorId, answers) {
    const major = majors.find((m) => m.id === majorId);
    if (!major) return [];
    const mine = new Set();
    questions.forEach((q) => {
      const a = answers[q.id];
      if (!isAnswered(q, a) || !(q.tipe === "radio" || q.tipe === "checkbox")) return;
      for (const i of Array.isArray(a) ? a : [a]) {
        for (const [trait, w] of Object.entries(q.opsi[i].efek?.karakter || {})) if (w >= 0.45) mine.add(trait);
      }
    });
    return major.karakter_cocok.filter((t) => mine.has(t));
  }

  return { questions, majors, recommend, explain, sharedTraits, userProfile };
}

/* ---------- reason text helpers ---------- */

const INTENSITY = ["sama sekali tidak", "kurang", "cukup", "", "sangat"];

const PROPER_NOUNS = ["Indonesia", "Inggris"];

/** Option labels are Title Case; mid-sentence they read better lowercased. */
function toPhrase(label) {
  let s = label.toLowerCase();
  for (const word of PROPER_NOUNS) s = s.replaceAll(word.toLowerCase(), word);
  return s;
}

function joinList(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} dan ${items[items.length - 1]}`;
}

/** Labels after a colon or inside quotes keep their original casing. */
function fill(template, value, lower = true) {
  const keepCase = !lower || template.includes("“{opsi}”") || template.includes(": {opsi}");
  return template.replace("{opsi}", keepCase ? value : toPhrase(value));
}

function reasonText(q, a, picked) {
  if (q.tipe === "scale") {
    const word = INTENSITY[a];
    return `Kamu ${word ? `${word} ` : ""}${q.frasa} (${a + 1}/5)`;
  }
  if (q.tipe === "yesno") return a === 0 ? q.alasan.ya : q.alasan.tidak;
  if (q.tipe === "radio") return fill(q.alasan, q.opsi[a].label);
  if (q.tipe === "checkbox") {
    const labels = (picked?.length ? picked : a).map((i) => toPhrase(q.opsi[i].label));
    return q.alasan.replace("{opsi}", joinList(labels));
  }
  return "";
}
