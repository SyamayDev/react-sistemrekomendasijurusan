/**
 * Holland's RIASEC model — the six interest types used by career counsellors
 * worldwide. SI-RAJU maps every answer and every major onto these six axes so
 * results can be compared as shapes (radar chart), not just numbers.
 */
export const RIASEC = [
  { key: "R", nama: "Praktis", holland: "Realistic", deskripsi: "Suka bekerja dengan tangan, alat, mesin, atau langsung di lapangan." },
  { key: "I", nama: "Analitis", holland: "Investigative", deskripsi: "Senang meneliti, berpikir logis, dan memecahkan masalah rumit." },
  { key: "A", nama: "Kreatif", holland: "Artistic", deskripsi: "Ekspresif, imajinatif, dan peka terhadap keindahan." },
  { key: "S", nama: "Sosial", holland: "Social", deskripsi: "Senang membantu, mengajar, dan peduli pada orang lain." },
  { key: "E", nama: "Pemimpin", holland: "Enterprising", deskripsi: "Berani memimpin, meyakinkan orang, dan mengambil inisiatif." },
  { key: "C", nama: "Terstruktur", holland: "Conventional", deskripsi: "Teliti, rapi, dan nyaman dengan sistem yang jelas." },
];

export const RIASEC_KEYS = RIASEC.map((d) => d.key);

/** How strongly each trait word in majors.json signals each RIASEC type. */
const TRAIT_MAP = {
  praktis: { R: 1 }, "suka bongkar pasang": { R: 1 }, terampil: { R: 0.8, A: 0.2 },
  "suka bekerja di luar": { R: 1 }, petualang: { R: 0.7, E: 0.3 }, tangguh: { R: 0.6 },
  aktif: { R: 0.6, S: 0.2 }, sportif: { R: 0.6, S: 0.3 }, "suka memasak": { R: 0.6, A: 0.4 },
  "suka air": { R: 0.6 }, "suka alam": { R: 0.6, I: 0.2 }, enerjik: { R: 0.4, E: 0.4 },
  "tahan banting": { R: 0.5, E: 0.3 }, "suka fisika": { I: 0.6, R: 0.5 }, "penyayang hewan": { S: 0.5, R: 0.5 },
  analitis: { I: 1 }, logis: { I: 0.9, C: 0.2 }, "problem-solver": { I: 0.6, R: 0.3 },
  "suka eksperimen": { I: 0.9, R: 0.3 }, penasaran: { I: 0.9 }, abstrak: { I: 0.7, A: 0.4 },
  peneliti: { I: 1 }, "suka angka": { I: 0.5, C: 0.6 }, kritis: { I: 0.6, E: 0.2 },
  "suka data": { I: 0.7, C: 0.4 }, "suka belajar": { I: 0.7 }, observasional: { I: 0.6 },
  "suka biologi": { I: 0.8 }, "suka membaca": { I: 0.4, A: 0.4 }, reflektif: { I: 0.4, A: 0.3 },
  "suka teknologi": { I: 0.5, R: 0.4 }, "suka sejarah": { I: 0.5, A: 0.2 }, "suka geografi": { I: 0.5, R: 0.3 },
  kreatif: { A: 1 }, visual: { A: 0.9 }, inovatif: { A: 0.6, I: 0.4 }, ekspresif: { A: 1 },
  estetis: { A: 0.9 }, musikal: { A: 1 }, storyteller: { A: 0.8, S: 0.2 }, penulis: { A: 0.8 },
  "suka budaya asing": { A: 0.5, S: 0.3 }, "detail-oriented": { C: 0.7, A: 0.2 },
  empatik: { S: 1 }, peduli: { S: 1 }, sabar: { S: 0.5, C: 0.3 }, komunikatif: { S: 0.5, E: 0.5 },
  sosial: { S: 1 }, "pendengar yang baik": { S: 1 }, "suka anak-anak": { S: 1 }, penyayang: { S: 1 },
  pelayan: { S: 0.8, C: 0.2 }, ramah: { S: 0.8 }, motivator: { S: 0.5, E: 0.5 }, "suka mengajar": { S: 1 },
  "peduli kesehatan": { S: 0.5, I: 0.3 }, "peduli lingkungan": { S: 0.4, R: 0.3, I: 0.2 },
  agamis: { S: 0.6 }, panutan: { S: 0.6, E: 0.3 }, etis: { S: 0.4, C: 0.3 }, nasionalis: { S: 0.4, E: 0.3 },
  terbuka: { S: 0.4, A: 0.3 }, kepemimpinan: { E: 1 }, strategis: { E: 0.8, I: 0.2 }, wirausaha: { E: 1 },
  presenter: { E: 0.8, S: 0.3 }, "berani ambil risiko": { E: 0.9 }, adaptif: { E: 0.5, S: 0.3 },
  "percaya diri": { E: 0.8 }, tegas: { E: 0.6, C: 0.3 }, "suka berdebat": { E: 0.6, I: 0.3 },
  cepat: { E: 0.4, R: 0.2 }, dinamis: { E: 0.5, A: 0.2 }, "suka jalan-jalan": { E: 0.3, R: 0.3 },
  multitasking: { E: 0.4, C: 0.4 }, profesional: { E: 0.4, C: 0.4 }, teliti: { C: 1 }, sistematis: { C: 1 },
  organisir: { C: 0.8, E: 0.3 }, disiplin: { C: 0.9 }, terstruktur: { C: 1 }, "bertanggung jawab": { C: 0.7, S: 0.2 },
  efisien: { C: 0.7, E: 0.2 }, jujur: { C: 0.4, S: 0.3 }, dedikatif: { C: 0.5, S: 0.3 }, mandiri: { A: 0.4, E: 0.3 },
};

/** A light prior so two majors with identical traits still differ by field. */
const CATEGORY_PRIOR = {
  STEM: { I: 0.4, R: 0.3 },
  Kesehatan: { I: 0.3, S: 0.4 },
  Bisnis: { E: 0.5, C: 0.3 },
  Sosial: { S: 0.4, E: 0.2, I: 0.2 },
  Humaniora: { A: 0.3, I: 0.3, S: 0.2 },
  Seni: { A: 0.6 },
  Pendidikan: { S: 0.6 },
  Vokasi: { R: 0.3, C: 0.3 },
};

const zero = () => Object.fromEntries(RIASEC_KEYS.map((k) => [k, 0]));

/** RIASEC profile of a major, normalised so its strongest axis is 1. */
export function majorProfile(major) {
  const v = zero();
  for (const trait of major.karakter_cocok || []) {
    const map = TRAIT_MAP[trait];
    if (!map) continue;
    for (const [k, w] of Object.entries(map)) v[k] += w;
  }
  for (const [k, w] of Object.entries(CATEGORY_PRIOR[major.kategori] || {})) v[k] += w;
  const max = Math.max(...Object.values(v), 1e-6);
  for (const k of RIASEC_KEYS) v[k] = v[k] / max;
  return v;
}

export function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (const k of RIASEC_KEYS) {
    dot += a[k] * b[k];
    na += a[k] * a[k];
    nb += b[k] * b[k];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/** Top-two RIASEC types, e.g. "Analitis–Kreatif" with Holland code "IA". */
export function dominantTypes(profile, n = 2) {
  return [...RIASEC].sort((a, b) => profile[b.key] - profile[a.key]).slice(0, n);
}

export { zero as emptyProfile };
