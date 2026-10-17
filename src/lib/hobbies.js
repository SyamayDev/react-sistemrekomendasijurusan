/**
 * Free-text hobby matching for the optional question (q7). Each entry maps
 * everyday Indonesian words to majors. Matching is a bonus signal only: an
 * empty or unrelated answer never lowers any score.
 */
const HOBBIES = [
  { label: "coding", kata: ["coding", "ngoding", "koding", "program", "komputer", "website", "aplikasi", "game dev", "hacking"], jurusan: ["m1", "m48", "m28", "m94", "m147", "m151", "m152", "m153", "m162", "m209", "m214"] },
  { label: "game", kata: ["game", "gaming", "esport", "e-sport"], jurusan: ["m1", "m48", "m140", "m153", "m214"] },
  { label: "menggambar", kata: ["gambar", "lukis", "sketsa", "ilustrasi", "desain", "design", "doodle", "komik", "manga"], jurusan: ["m3", "m19", "m85", "m140", "m138"] },
  { label: "musik", kata: ["musik", "nyanyi", "menyanyi", "gitar", "piano", "band", "drum", "biola", "paduan suara", "gamelan", "karawitan", "sinden", "angklung"], jurusan: ["m79", "m139", "m188", "m189"] },
  { label: "menulis", kata: ["menulis", "nulis", "puisi", "cerpen", "novel", "blog", "jurnal", "wattpad"], jurusan: ["m62", "m11", "m21", "m181", "m192"] },
  { label: "membaca", kata: ["baca", "membaca", "buku", "perpustakaan"], jurusan: ["m62", "m63", "m59", "m20", "m180", "m183", "m184", "m192"] },
  { label: "olahraga", kata: ["olahraga", "futsal", "basket", "sepak bola", "bola", "lari", "renang", "badminton", "bulu tangkis", "voli", "gym", "silat", "karate", "taekwondo"], jurusan: ["m144", "m77", "m113", "m83"] },
  { label: "memasak", kata: ["masak", "memasak", "kue", "baking", "kuliner", "makanan", "pastry", "chef", "dessert"], jurusan: ["m82", "m51", "m12", "m163", "m197", "m205", "m206"] },
  { label: "foto & video", kata: ["foto", "fotografi", "video", "film", "youtube", "konten", "editing", "tiktok", "vlog", "sinematografi"], jurusan: ["m81", "m140", "m119", "m3", "m178", "m187"] },
  { label: "organisasi", kata: ["osis", "organisasi", "ketua", "pramuka", "kepanitiaan", "rohis", "mpk", "event", "panitia"], jurusan: ["m4", "m56", "m71", "m60", "m100", "m179", "m204", "m208"] },
  { label: "debat & public speaking", kata: ["debat", "mun", "pidato", "public speaking", "mc", "presentasi", "lomba debat"], jurusan: ["m15", "m17", "m9", "m60", "m5", "m176", "m178"] },
  { label: "kegiatan sosial", kata: ["relawan", "volunteer", "sosial", "mengajar", "panti", "bakti"], jurusan: ["m106", "m73", "m72", "m41", "m179", "m204"] },
  { label: "anak-anak", kata: ["anak-anak", "anak kecil", "les privat", "mengasuh"], jurusan: ["m73", "m107", "m74", "m167", "m202"] },
  { label: "hewan", kata: ["hewan", "kucing", "anjing", "burung", "ikan hias", "ternak"], jurusan: ["m23", "m53", "m97"] },
  { label: "alam", kata: ["alam", "hiking", "mendaki", "gunung", "camping", "kemah", "pecinta alam", "diving", "menyelam"], jurusan: ["m50", "m35", "m67", "m54", "m158", "m175"] },
  { label: "elektronik & mesin", kata: ["robot", "robotik", "elektronik", "arduino", "merakit", "rakit", "otomotif", "mesin", "bengkel", "motor", "solder"], jurusan: ["m24", "m42", "m94", "m123", "m152", "m154", "m155", "m156", "m162", "m168", "m170", "m195", "m196", "m210", "m211", "m213", "m216"] },
  { label: "bisnis", kata: ["bisnis", "jualan", "berjualan", "dagang", "usaha", "dropship", "online shop", "olshop"], jurusan: ["m66", "m22", "m122", "m161", "m174", "m194"] },
  { label: "investasi", kata: ["investasi", "saham", "trading", "crypto", "kripto", "reksa dana"], jurusan: ["m105", "m26", "m64", "m172"] },
  { label: "bahasa asing", kata: ["bahasa asing", "jepang", "korea", "anime", "kpop", "k-pop", "drakor", "mandarin", "arab", "jerman", "prancis", "rusia"], jurusan: ["m61", "m102", "m108", "m129", "m131", "m132", "m103", "m183", "m193"] },
  { label: "menari", kata: ["tari", "menari", "dance", "dancer", "koreografi"], jurusan: ["m148", "m76"] },
  { label: "fashion", kata: ["fashion", "busana", "jahit", "menjahit", "outfit"], jurusan: ["m116", "m198"] },
  { label: "make-up", kata: ["makeup", "make up", "make-up", "rias", "skincare"], jurusan: ["m115"] },
  { label: "sejarah & budaya", kata: ["sejarah", "museum", "candi", "budaya", "wayang", "aksara", "naskah", "lontar", "dalang", "batik"], jurusan: ["m20", "m58", "m109", "m180", "m181", "m182", "m185", "m188", "m189", "m190", "m199", "m201"] },
  { label: "berkebun", kata: ["kebun", "berkebun", "tanaman", "bercocok tanam", "hidroponik"], jurusan: ["m96", "m112", "m52", "m156", "m161", "m191"] },
  { label: "astronomi", kata: ["astronomi", "bintang", "planet", "teleskop", "luar angkasa", "antariksa"], jurusan: ["m33", "m30"] },
  { label: "kesehatan", kata: ["pmr", "kesehatan", "medis", "dokter", "perawat", "p3k"], jurusan: ["m13", "m38", "m36", "m41", "m164", "m165", "m166", "m167", "m168", "m169", "m170", "m171"] },
  { label: "sains & olimpiade", kata: ["olimpiade", "osn", "sains", "matematika", "fisika", "kimia", "biologi", "eksperimen"], jurusan: ["m29", "m30", "m32", "m31", "m155", "m159", "m160", "m164", "m200", "m215"] },
  { label: "kegiatan keagamaan", kata: ["ngaji", "mengaji", "pesantren", "dakwah", "tahfiz", "rohani", "gereja", "tafsir", "hafalan", "al-quran", "quran", "sekolah minggu"], jurusan: ["m111", "m145", "m133", "m146", "m176", "m177", "m178", "m184", "m185", "m193", "m202", "m203"] },
  { label: "mendengarkan curhat", kata: ["curhat", "psikologi", "mendengarkan", "konseling"], jurusan: ["m2", "m72"] },
  { label: "arsitektur & interior", kata: ["arsitektur", "bangunan", "interior", "dekorasi", "minecraft"], jurusan: ["m7", "m14", "m95", "m191"] },
  { label: "budaya Jawa", kata: ["aksara jawa", "bahasa jawa", "basa jawa", "budaya jawa", "sastra jawa", "macapat", "tembang", "krama"], jurusan: ["m180", "m199", "m188", "m190"] },
  { label: "budaya Sunda", kata: ["sunda", "aksara sunda", "degung", "kecapi"], jurusan: ["m181"] },
  { label: "budaya Bali", kata: ["aksara bali", "bahasa bali", "budaya bali", "tari bali", "lontar"], jurusan: ["m182"] },
  { label: "teater & drama", kata: ["teater", "akting", "acting", "pantomim", "monolog", "pentas drama", "ekskul drama", "main drama"], jurusan: ["m81", "m186", "m190"] },
  { label: "traveling", kata: ["traveling", "travelling", "jalan-jalan", "wisata", "backpacker"], jurusan: ["m68", "m121", "m207"] },
  { label: "kapal & laut", kata: ["kapal", "pelayaran", "pelaut", "berlayar", "laut"], jurusan: ["m91", "m54", "m157", "m158", "m163", "m212", "m213"] },
  { label: "data & statistik", kata: ["data", "statistik", "excel", "spreadsheet", "analisis data"], jurusan: ["m6", "m26", "m28", "m151"] },
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
