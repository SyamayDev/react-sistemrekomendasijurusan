import { useSeo, ldBreadcrumbs } from "../lib/seo.jsx";
import { SITE } from "../lib/site.js";

const SECTIONS = [
  {
    h: "Jawaban tes tetap di perangkatmu",
    p: "Seluruh perhitungan rekomendasi berjalan di browser-mu. Jawaban tes tidak dikirim ke server SI-RAJU. Agar hasil bisa dibuka kembali, jawaban disimpan di penyimpanan lokal (localStorage) browser-mu dan bisa kamu hapus kapan saja dengan menekan “Ulangi tes” atau membersihkan data situs.",
  },
  {
    h: "Link hasil yang dibagikan",
    p: "Saat kamu membagikan hasil, pilihan jawabanmu dikodekan ringkas di dalam link (tanpa jawaban isian bebas). Siapa pun yang memegang link dapat melihat hasil tersebut, jadi bagikan hanya ke orang yang kamu percaya.",
  },
  {
    h: "Chat SI-RAJU AI",
    p: "Fitur chat bersifat opsional. Pesan yang kamu ketik — dan, jika kamu memintanya, ringkasan jurusan teratasmu — dikirim ke server kami lalu diteruskan ke layanan AI Google Gemini untuk menghasilkan jawaban. Jangan menuliskan data pribadi sensitif di chat. Riwayat chat hanya disimpan di sesi browser-mu.",
  },
  {
    h: "Tanpa akun, iklan, atau pelacak",
    p: "SI-RAJU tidak meminta pendaftaran, tidak menampilkan iklan, dan tidak memasang cookie pelacak pihak ketiga. Preferensi tema (terang/gelap) disimpan secara lokal di browser-mu.",
  },
  {
    h: "Perubahan & kontak",
    p: "Kebijakan ini dapat diperbarui seiring berkembangnya fitur. Pertanyaan seputar privasi dapat disampaikan melalui WhatsApp atau GitHub yang tercantum di bagian bawah halaman.",
  },
];

export default function Privacy() {
  useSeo({
    title: "Kebijakan Privasi",
    path: "/privasi/",
    description: "Bagaimana SI-RAJU menjaga privasimu: jawaban tes dihitung di perangkatmu, tanpa akun, iklan, atau pelacak pihak ketiga.",
    jsonLd: [ldBreadcrumbs([{ name: "Beranda", path: "/" }, { name: "Kebijakan Privasi", path: "/privasi/" }])],
  });
  return (
    <div className="pb-24 pt-[calc(var(--header-h)+2.5rem)] sm:pt-[calc(var(--header-h)+4rem)]">
      <div className="container-x max-w-3xl">
        <p className="eyebrow fade-up">Privasi</p>
        <h1 className="display fade-up mt-3 text-[clamp(2.3rem,6vw,3.6rem)]" style={{ "--i": 1 }}>
          Kebijakan Privasi
        </h1>
        <p className="fade-up mt-4 text-lg text-ink-muted" style={{ "--i": 2 }}>
          Singkatnya: datamu milikmu. Berikut rinciannya dalam bahasa yang mudah dipahami.
        </p>
        <div className="mt-12 space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="text-xl font-bold">{s.h}</h2>
              <p className="mt-2 leading-relaxed text-ink-muted">{s.p}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 text-sm text-ink-soft">
          Kontak:{" "}
          <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">
            WhatsApp SI-RAJU
          </a>
        </p>
      </div>
    </div>
  );
}
