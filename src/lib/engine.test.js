// Run with `npm test` (Node's built-in test runner — no extra dependencies).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildModel, isAnswered } from "./engine.js";
import { encodeAnswers, decodeAnswers } from "./answerCodec.js";
import { CATEGORIES } from "./categories.js";
import { slugify } from "./slug.js";
import { matchHobbies } from "./hobbies.js";
import { TRAIT_MAP } from "./riasec.js";

const load = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const questions = load("../data/questions.json");
const majors = load("../data/majors.json");
const insights = load("../data/insights.json");
const model = buildModel(questions, majors);
const majorIds = new Set(majors.map((m) => m.id));
const traitVocab = new Set(majors.flatMap((m) => m.karakter_cocok));
const categoryIds = new Set(CATEGORIES.map((c) => c.id));

// Option index per question (scale 0..4 = answer 1..5; yesno 0 = yes).
const PERSONAS = {
  techie: { expect: "STEM", top: ["Teknik Informatika", "Ilmu Komputer", "Teknik Komputer", "Statistika", "Matematika", "Sistem Informasi"],
    a: { q1: 4, q2: 1, q3: 1, q4: [0, 3, 5], q5: 2, q6: 0, q7: "ngoding game dan merakit komputer", q8: 1, q9: 0, q10: 1, q11: 4, q12: 0, q13: [0, 2], q14: 1, q15: 2, q16: 1, q17: 0, q18: 4, q19: [3, 1], q20: 3 } },
  artist: { expect: "Seni", top: ["Desain Komunikasi Visual", "Seni Rupa Murni", "Film dan Animasi", "Film dan Televisi"],
    a: { q1: 2, q2: 1, q3: 0, q4: [2, 4, 6], q5: 0, q6: 0, q7: "menggambar komik", q8: 4, q9: 5, q10: 1, q11: 0, q12: 1, q13: [4, 5], q14: 1, q15: 4, q16: 3, q17: 1, q18: 2, q19: [2, 3], q20: 3 } },
  carer: { expect: "Kesehatan", top: ["Ilmu Keperawatan", "Pendidikan Dokter", "Kesehatan Masyarakat", "Kebidanan"],
    a: { q1: 3, q2: 3, q3: 2, q4: [1, 3, 4], q5: 3, q6: 2, q7: "PMR dan relawan", q8: 1, q9: 1, q10: 1, q11: 2, q12: 0, q13: [1, 4], q14: 0, q15: 1, q16: 4, q17: 1, q18: 3, q19: [0, 1], q20: 2 } },
  leader: { expect: "Bisnis", top: ["Manajemen", "Administrasi Bisnis", "Ilmu Administrasi Niaga", "Kewirausahaan"],
    a: { q1: 3, q2: 4, q3: 2, q4: [0, 4, 6], q5: 1, q6: 2, q7: "osis dan jualan online", q8: 2, q9: 2, q10: 0, q11: 3, q12: 0, q13: [2, 4], q14: 1, q15: 2, q16: 0, q17: 1, q18: 2, q19: [0, 3, 2], q20: 0 } },
};

test("category metadata matches majors.json", () => {
  for (const c of CATEGORIES) {
    const inCat = majors.filter((m) => m.kategori === c.id);
    assert.equal(inCat.length, c.jumlah, `${c.id} count`);
    for (const name of c.contoh) assert.ok(inCat.some((m) => m.nama_jurusan === name), `${name} in ${c.id}`);
  }
  assert.deepEqual(new Set(majors.map((m) => m.kategori)), categoryIds);
});

test("questions only reference real majors, fields and traits", () => {
  for (const q of questions) {
    for (const id of Object.keys(q.bobot_jurusan || {})) assert.ok(majorIds.has(id), `${q.id} bobot ${id}`);
    for (const o of q.opsi || []) {
      for (const id of Object.keys(o.efek?.jurusan || {})) assert.ok(majorIds.has(id), `${q.id} efek ${id}`);
      for (const k of Object.keys(o.efek?.kategori || {})) assert.ok(categoryIds.has(k), `${q.id} kategori ${k}`);
      for (const t of Object.keys(o.efek?.karakter || {})) assert.ok(traitVocab.has(t), `${q.id} karakter "${t}"`);
    }
  }
});

for (const [name, p] of Object.entries(PERSONAS)) {
  test(`persona "${name}" lands in ${p.expect}`, () => {
    const { ranked, categories } = model.recommend(p.a);
    assert.equal(categories[0].id, p.expect);
    const top10 = ranked.slice(0, 10).map((m) => m.nama_jurusan);
    assert.ok(p.top.some((n) => top10.includes(n)), `expected one of ${p.top} in ${top10}`);
    assert.ok(ranked[0].score >= 80, `top score ${ranked[0].score}`);
    assert.ok(ranked.at(-1).score <= 45, `bottom score ${ranked.at(-1).score}`);
  });
}

test("radio options are option-aware (the legacy bug)", () => {
  const base = PERSONAS.techie.a;
  const art = model.recommend({ ...base, q3: 0 }).ranked.find((m) => m.nama_jurusan === "Teknik Informatika");
  const code = model.recommend({ ...base, q3: 1 }).ranked.find((m) => m.nama_jurusan === "Teknik Informatika");
  assert.ok(code.raw > art.raw, "choosing coding must help Informatika more than choosing art");
});

test("more comfort with data never lowers Statistika", () => {
  let prev = -Infinity;
  for (let v = 0; v < 5; v++) {
    const s = model.recommend({ ...PERSONAS.techie.a, q11: v }).ranked.find((m) => m.nama_jurusan === "Statistika").raw;
    assert.ok(s >= prev);
    prev = s;
  }
});

test("explanations are ordered, positive and readable", () => {
  const { a } = PERSONAS.artist;
  const top = model.recommend(a).ranked[0];
  const reasons = model.explain(top.id, a);
  assert.ok(reasons.length >= 3);
  for (let i = 1; i < reasons.length; i++) assert.ok(reasons[i - 1].c >= reasons[i].c);
  for (const r of reasons) {
    assert.ok(r.text.length > 10 && !r.text.includes("{opsi}"));
    assert.ok(r.share > 0 && r.share <= 1);
  }
  assert.ok(model.sharedTraits(top.id, a).includes("kreatif"));
});

test("empty answers degrade gracefully", () => {
  const { ranked, profile } = model.recommend({});
  assert.equal(ranked.length, majors.length);
  assert.ok(ranked.every((m) => Number.isFinite(m.score)));
  assert.ok(Object.values(profile).every((v) => v === 0));
});

test("checkbox min/max are enforced", () => {
  const q4 = questions.find((q) => q.id === "q4");
  assert.equal(isAnswered(q4, [0, 1]), false);
  assert.equal(isAnswered(q4, [0, 1, 2]), true);
  assert.equal(isAnswered(q4, [0, 1, 2, 3, 4, 5]), false);
});

test("share codes round-trip and reject garbage", () => {
  const { a } = PERSONAS.leader;
  const code = encodeAnswers(a, questions);
  assert.match(code, /^v2\.[A-Za-z0-9_-]+$/);
  const back = decodeAnswers(code, questions);
  const { q7: _omitted, ...expected } = a; // free text never leaves the device
  for (const [k, v] of Object.entries(expected)) if (Array.isArray(v)) expected[k] = [...v].sort((x, y) => x - y);
  assert.deepEqual(back, expected);
  for (const bad of ["", "v1.AAAA", "v2.", "v2.!!!", "v2.AAAA", null]) assert.equal(decodeAnswers(bad, questions), null);
});

test("hobby matching is a bonus, never a penalty", () => {
  assert.deepEqual(matchHobbies("").matches, []);
  assert.deepEqual(matchHobbies("suka ngoding dan main basket").matches, ["coding", "olahraga"]);
  const without = model.recommend({ ...PERSONAS.techie.a, q7: "" }).ranked;
  const unrelated = model.recommend({ ...PERSONAS.techie.a, q7: "zzz" }).ranked;
  assert.deepEqual(without.map((m) => m.id), unrelated.map((m) => m.id));
});

test("major slugs are unique", () => {
  const slugs = majors.map((m) => slugify(m.nama_jurusan));
  assert.equal(new Set(slugs).size, slugs.length);
});

test("every major has its own insight copy and RIASEC-mapped traits", () => {
  const names = new Set(majors.map((m) => m.nama_jurusan));
  for (const m of majors) {
    assert.ok(insights[m.nama_jurusan], `insight for ${m.nama_jurusan}`);
    for (const t of m.karakter_cocok) assert.ok(TRAIT_MAP[t], `${m.nama_jurusan}: trait "${t}" has no RIASEC mapping`);
  }
  for (const k of Object.keys(insights)) assert.ok(names.has(k), `orphan insight "${k}"`);
});

test("the static meta description states the real number of majors", () => {
  const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
  assert.ok(html.includes(`dari ${majors.length} jurusan`), "index.html description is out of date");
});

// Programmes added later (vocational, regional, religious) must be reachable
// by the students they are meant for, not buried under the original 150.
const BASE = { q1: 2, q2: 2, q5: 2, q8: 2, q10: 1, q11: 2, q12: 2, q14: 1, q15: 2, q17: 1, q18: 2, q20: 2 };
const NICHE = {
  "cook / pastry": { top: ["Seni Pengolahan Patiseri", "Seni Kuliner"],
    a: { q3: 0, q4: [2, 5, 3], q6: 0, q7: "suka memasak dan bikin kue", q8: 4, q9: 5, q11: 1, q13: [5, 1], q15: 4, q16: 2, q19: [4, 3], q20: 3 } },
  "Javanese culture": { top: ["Sastra Jawa"],
    a: { q3: 0, q4: [2, 3, 1], q6: 0, q7: "membaca naskah aksara jawa dan nonton wayang", q9: 5, q12: 1, q13: [3, 4], q15: 3, q16: 3 } },
  "religious teacher": { top: ["Pendidikan Guru Madrasah Ibtidaiyah (PGMI)", "Pendidikan Bahasa Arab"],
    a: { q2: 3, q3: 2, q4: [1, 4, 3], q6: 0, q7: "mengaji dan mengajar anak-anak di TPA", q9: 4, q12: 1, q13: [4, 3], q14: 0, q16: 4 } },
  traveller: { top: ["Usaha Perjalanan Wisata", "Pengelolaan Konvensi dan Acara"],
    a: { q2: 4, q3: 2, q4: [4, 6, 2], q5: 0, q6: 2, q7: "traveling dan jadi panitia event", q9: 2, q16: 0, q19: [2, 3], q20: 3 } },
  mechanic: { top: ["Teknologi Rekayasa Otomotif", "Teknik Mekatronika"],
    a: { q1: 3, q3: 4, q4: [5, 3, 0], q6: 2, q7: "bengkel motor dan otomotif", q9: 0, q12: 0, q13: [0, 5], q16: 2, q17: 0, q20: 0 } },
};
for (const [name, p] of Object.entries(NICHE)) {
  test(`niche persona "${name}" finds ${p.top.join(" / ")}`, () => {
    const top10 = model.recommend({ ...BASE, ...p.a }).ranked.slice(0, 10).map((m) => m.nama_jurusan);
    assert.ok(p.top.every((n) => majors.some((m) => m.nama_jurusan === n)), "expected majors exist");
    assert.ok(p.top.some((n) => top10.includes(n)), `expected one of ${p.top} in ${top10}`);
  });
}
