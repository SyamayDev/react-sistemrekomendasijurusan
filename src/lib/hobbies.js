/**
 * Free-text hobby matching for the optional question (q7). Each entry maps
 * everyday Indonesian words to majors. Matching is a bonus signal only: an
 * empty or unrelated answer never lowers any score.
 */
const HOBBIES = [
  { label: "coding", kata: ["coding", "ngoding", "koding", "program", "komputer", "website", "aplikasi", "game dev", "hacking"], jurusan: ["m1", "m48", "m28", "m94", "m147"] },
  { label: "game", kata: ["game", "gaming", "esport", "e-sport"], jurusan: ["m1", "m48", "m140"] },
  { label: "menggambar", kata: ["gambar", "lukis", "sketsa", "ilustrasi", "desain", "design", "doodle", "komik", "manga"], jurusan: ["m3", "m19", "m85", "m140", "m138"] },
  { label: "musik", kata: ["musik", "nyanyi", "menyanyi", "gitar", "piano", "band", "drum", "biola", "paduan suara"], jurusan: ["m79", "m139"] },
  { label: "menulis", kata: ["menulis", "nulis", "puisi", "cerpen", "novel", "blog", "jurnal", "wattpad"], jurusan: ["m62", "m11", "m21"] },
  { label: "membaca", kata: ["baca", "membaca", "buku", "perpustakaan"], jurusan: ["m62", "m63", "m59", "m20"] },
  { label: "olahraga", kata: ["olahraga", "futsal", "basket", "sepak bola", "bola", "lari", "renang", "badminton", "bulu tangkis", "voli", "gym", "silat", "karate", "taekwondo"], jurusan: ["m144", "m77", "m113", "m83"] },
  { label: "memasak", kata: ["masak", "memasak", "kue", "baking", "kuliner", "makanan"], jurusan: ["m82", "m51", "m12"] },
  { label: "foto & video", kata: ["foto", "fotografi", "video", "film", "youtube", "konten", "editing", "tiktok", "vlog", "sinematografi"], jurusan: ["m81", "m140", "m119", "m3"] },
  { label: "organisasi", kata: ["osis", "organisasi", "ketua", "pramuka", "kepanitiaan", "rohis", "mpk"], jurusan: ["m4", "m56", "m71", "m60", "m100"] },
  { label: "debat & public speaking", kata: ["debat", "mun", "pidato", "public speaking", "mc", "presentasi", "lomba debat"], jurusan: ["m15", "m17", "m9", "m60", "m5"] },
  { label: "kegiatan sosial", kata: ["relawan", "volunteer", "sosial", "mengajar", "panti", "bakti"], jurusan: ["m106", "m73", "m72", "m41"] },
  { label: "anak-anak", kata: ["anak-anak", "anak kecil", "les privat", "mengasuh"], jurusan: ["m73", "m107", "m74"] },
  { label: "hewan", kata: ["hewan", "kucing", "anjing", "burung", "ikan hias", "ternak"], jurusan: ["m23", "m53", "m97"] },
  { label: "alam", kata: ["alam", "hiking", "mendaki", "gunung", "camping", "kemah", "pecinta alam", "diving", "menyelam"], jurusan: ["m50", "m35", "m67", "m54"] },
  { label: "elektronik & mesin", kata: ["robot", "robotik", "elektronik", "arduino", "merakit", "rakit", "otomotif", "mesin", "bengkel", "motor", "solder"], jurusan: ["m24", "m42", "m94", "m123"] },
  { label: "bisnis", kata: ["bisnis", "jualan", "berjualan", "dagang", "usaha", "dropship", "online shop", "olshop"], jurusan: ["m66", "m22", "m122"] },
  { label: "investasi", kata: ["investasi", "saham", "trading", "crypto", "kripto", "reksa dana"], jurusan: ["m105", "m26", "m64"] },
  { label: "bahasa asing", kata: ["bahasa asing", "jepang", "korea", "anime", "kpop", "k-pop", "drakor", "mandarin", "arab", "jerman", "prancis"], jurusan: ["m61", "m102", "m108", "m129", "m131", "m132", "m103"] },
  { label: "menari", kata: ["tari", "menari", "dance", "dancer", "koreografi"], jurusan: ["m148", "m76"] },
  { label: "fashion", kata: ["fashion", "busana", "jahit", "menjahit", "outfit"], jurusan: ["m116"] },
  { label: "make-up", kata: ["makeup", "make up", "make-up", "rias", "skincare"], jurusan: ["m115"] },
  { label: "sejarah & budaya", kata: ["sejarah", "museum", "candi", "budaya", "wayang"], jurusan: ["m20", "m58", "m109"] },
  { label: "berkebun", kata: ["kebun", "berkebun", "tanaman", "bercocok tanam", "hidroponik"], jurusan: ["m96", "m112", "m52"] },
  { label: "astronomi", kata: ["astronomi", "bintang", "planet", "teleskop", "luar angkasa", "antariksa"], jurusan: ["m33", "m30"] },
  { label: "kesehatan", kata: ["pmr", "kesehatan", "medis", "dokter", "perawat", "p3k"], jurusan: ["m13", "m38", "m36", "m41"] },
  { label: "sains & olimpiade", kata: ["olimpiade", "osn", "sains", "matematika", "fisika", "kimia", "biologi", "eksperimen"], jurusan: ["m29", "m30", "m32", "m31"] },
  { label: "kegiatan keagamaan", kata: ["ngaji", "mengaji", "pesantren", "dakwah", "tahfiz", "rohani", "gereja"], jurusan: ["m111", "m145", "m133", "m146"] },
  { label: "mendengarkan curhat", kata: ["curhat", "psikologi", "mendengarkan", "konseling"], jurusan: ["m2", "m72"] },
  { label: "arsitektur & interior", kata: ["arsitektur", "bangunan", "interior", "dekorasi", "minecraft"], jurusan: ["m7", "m14", "m95"] },
];

/**
 * @param {string} text free-text answer
 * @returns {{ matches: string[], bonus: Map<string, number> }} matched labels
 *   and a per-major bonus (capped so one hobby can't dominate the result).
 */
export function matchHobbies(text) {
  const bonus = new Map();
  const matches = [];
  if (!text || typeof text !== "string") return { matches, bonus };
  const haystack = ` ${text.toLowerCase().replace(/[^a-z0-9\- ]+/g, " ")} `;
  for (const h of HOBBIES) {
    if (!h.kata.some((k) => haystack.includes(` ${k}`))) continue;
    matches.push(h.label);
    for (const id of h.jurusan) bonus.set(id, Math.min(0.9, (bonus.get(id) || 0) + 0.6));
  }
  return { matches, bonus };
}
