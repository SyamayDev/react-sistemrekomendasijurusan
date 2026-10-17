/**
 * The eight "rumpun" (fields) of majors. Counts and examples are derived from
 * majors.json and kept here so the landing page doesn't ship the full dataset;
 * `engine.test.js` fails if they drift out of sync.
 */
export const CATEGORIES = [
  { id: "STEM", nama: "Sains & Teknologi", ikon: "atom", warna: "#5B8CFF", jumlah: 50,
    deskripsi: "Sains, teknologi, rekayasa, dan matematika untuk pemecah masalah.",
    contoh: ["Teknik Informatika", "Statistika", "Teknik Sipil"] },
  { id: "Kesehatan", nama: "Kesehatan", ikon: "heart-pulse", warna: "#2FD3A0", jumlah: 21,
    deskripsi: "Kedokteran, farmasi, gizi, dan ilmu yang merawat kehidupan.",
    contoh: ["Pendidikan Dokter", "Farmasi", "Ilmu Gizi"] },
  { id: "Bisnis", nama: "Bisnis & Ekonomi", ikon: "briefcase", warna: "#FFB547", jumlah: 19,
    deskripsi: "Manajemen, keuangan, dan kewirausahaan yang menggerakkan ekonomi.",
    contoh: ["Manajemen", "Akuntansi", "Bisnis Digital"] },
  { id: "Sosial", nama: "Sosial & Hukum", ikon: "scale", warna: "#FF7A90", jumlah: 21,
    deskripsi: "Hukum, politik, komunikasi, dan ilmu tentang masyarakat.",
    contoh: ["Psikologi", "Ilmu Hukum", "Ilmu Komunikasi"] },
  { id: "Humaniora", nama: "Humaniora", ikon: "book-open", warna: "#B48CFF", jumlah: 20,
    deskripsi: "Bahasa, sastra, sejarah, filsafat, dan kekayaan budaya.",
    contoh: ["Sastra Inggris", "Ilmu Sejarah", "Sastra Jepang"] },
  { id: "Seni", nama: "Seni & Desain", ikon: "palette", warna: "#FF8FD8", jumlah: 19,
    deskripsi: "Desain, seni rupa, musik, film, dan arsitektur.",
    contoh: ["Desain Komunikasi Visual", "Arsitektur", "Film dan Animasi"] },
  { id: "Pendidikan", nama: "Pendidikan", ikon: "graduation-cap", warna: "#4FD1E8", jumlah: 36,
    deskripsi: "Keguruan dan pengembangan potensi generasi berikutnya.",
    contoh: ["Bimbingan dan Konseling", "Pendidikan Matematika", "Teknologi Pendidikan"] },
  { id: "Vokasi", nama: "Vokasi & Terapan", ikon: "wrench", warna: "#FF9F6B", jumlah: 30,
    deskripsi: "Program terapan berbasis keterampilan yang siap kerja.",
    contoh: ["Perhotelan", "Fisioterapi", "Desain Grafis"] },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
export const TOTAL_MAJORS = CATEGORIES.reduce((sum, c) => sum + c.jumlah, 0);
