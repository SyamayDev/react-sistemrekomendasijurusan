import { Link } from "react-router";
import { ArrowRight, Brain, Fingerprint, Scale, ShieldCheck } from "lucide-react";
import Reveal from "../components/ui/Reveal.jsx";
import { useSeo, ldBreadcrumbs } from "../lib/seo.jsx";
import { SITE } from "../lib/site.js";
import { TOTAL_MAJORS } from "../lib/categories.js";
import students from "../assets/bottom-main-image.webp";

const HOW = [
  {
    Icon: Fingerprint,
    title: "1. Setiap jawaban adalah bukti",
    body: "Pilihanmu memberi bobot positif atau negatif ke jurusan yang relevan — dan peka terhadap opsi yang kamu pilih. Memilih “menciptakan karya seni” menguatkan Desain, bukan Teknik.",
  },
  {
    Icon: Scale,
    title: "2. Dinormalisasi dengan adil",
    body: "Bukti tiap jurusan dibagi dengan bukti maksimum yang mungkin ia terima, plus sedikit “penyusutan” agar jurusan yang datanya tipis tidak melonjak karena kebetulan.",
  },
  {
    Icon: Brain,
    title: "3. Dicocokkan dengan profil RIASEC",
    body: "Jawabanmu juga membentuk profil enam tipe minat Holland. Kemiripan bentuk profilmu dengan profil jurusan ikut menentukan skor akhir.",
  },
  {
    Icon: ShieldCheck,
    title: "4. Transparan & privat",
    body: "Semua dihitung di perangkatmu. Setiap rekomendasi menampilkan alasan terkuatnya, jadi kamu tahu persis dari mana angka itu datang.",
  },
];

export default function About() {
  useSeo({
    title: "Tentang SI-RAJU & Cara Kerja Rekomendasi",
    path: "/tentang/",
    description:
      "Kenali SI-RAJU, sistem rekomendasi jurusan kuliah berbasis model minat RIASEC: cara kerja algoritma, prinsip privasi, dan batasan hasil tes.",
    jsonLd: [ldBreadcrumbs([{ name: "Beranda", path: "/" }, { name: "Tentang", path: "/tentang/" }])],
  });

  return (
    <div className="pb-24 pt-[calc(var(--header-h)+2.5rem)] sm:pt-[calc(var(--header-h)+4rem)]">
      <div className="container-x">
        <header className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow fade-up">Tentang kami</p>
            <h1 className="display fade-up mt-3 text-[clamp(2.3rem,6vw,4.2rem)]" style={{ "--i": 1 }}>
              Supaya tidak ada lagi yang <span className="text-gradient-brand">salah jurusan.</span>
            </h1>
            <p className="fade-up mt-5 text-lg leading-relaxed text-ink-muted" style={{ "--i": 2 }}>
              SI-RAJU (Sistem Rekomendasi Jurusan) membantu siswa SMA/SMK memetakan minat, bakat, dan kepribadiannya ke{" "}
              {TOTAL_MAJORS} jurusan kuliah. Kami percaya keputusan sebesar memilih jurusan layak didukung data yang jujur,
              mudah dipahami, dan gratis untuk semua.
            </p>
          </div>
          <img
            src={students}
            alt="Ilustrasi siswa dengan beragam minat: olahraga, sains, musik, membaca, dan teknologi"
            width="631"
            height="395"
            className="fade-up mx-auto w-full max-w-md"
            style={{ "--i": 3 }}
          />
        </header>

        <section aria-labelledby="cara-kerja-algoritma" className="mt-24">
          <Reveal>
            <h2 id="cara-kerja-algoritma" className="display text-3xl sm:text-4xl">
              Bagaimana rekomendasi dihitung
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {HOW.map(({ Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 90} className="card p-7">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-ink-muted">{body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal as="section" aria-labelledby="batasan" className="card mt-16 p-7 sm:p-10">
          <h2 id="batasan" className="text-2xl font-bold">
            Batasan yang perlu kamu tahu
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-muted marker:text-primary">
            <li>SI-RAJU mengukur kecocokan minat dan karakter — bukan kemampuan akademik, peluang lolos seleksi, atau kondisi finansial.</li>
            <li>Data jurusan bersifat umum; kurikulum dan prospek bisa berbeda antarkampus.</li>
            <li>Hasil terbaik didapat bila kamu menjawab jujur tentang dirimu saat ini, bukan harapan orang lain.</li>
          </ul>
        </Reveal>

        <Reveal as="section" aria-labelledby="kontak" className="mt-16 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 id="kontak" className="text-2xl font-bold">
              Punya masukan atau ingin berkontribusi?
            </h2>
            <p className="mt-2 text-ink-muted">SI-RAJU adalah proyek terbuka. Kode sumbernya tersedia di GitHub.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Hubungi via WhatsApp
            </a>
            <Link to="/tes/" className="btn btn-sun">
              Coba tesnya <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
