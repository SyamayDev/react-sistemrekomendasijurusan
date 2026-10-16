# SI-RAJU — Sistem Rekomendasi Jurusan

Tes minat bakat online gratis yang mencocokkan siswa SMA/SMK dengan **150 jurusan kuliah**, memakai model minat karier **RIASEC (Holland)**, lengkap dengan persentase kecocokan dan **alasan yang bisa dijelaskan**.

**Live:** https://syamaydev.github.io/react-sistemrekomendasijurusan/

## Fitur utama

- **Rekomendasi yang jujur & transparan** — setiap jawaban menjadi bukti (sadar-opsi), dinormalisasi per jurusan dengan *shrinkage*, lalu dipadukan dengan kemiripan profil RIASEC. Tiap hasil menampilkan alasan terkuatnya.
- **Privat** — seluruh perhitungan berjalan di browser; jawaban tidak dikirim ke server. Link hasil berupa kode ringkas (tanpa isian bebas).
- **“Semesta Jurusan” 3D** — 150 bintang (satu per jurusan) dengan React Three Fiber yang bereaksi terhadap jawaban dan menyorot jurusan teratasmu.
- **Raju**, maskot burung hantu SVG interaktif (mata mengikuti kursor, berkedip, miring 3D).
- **SI-RAJU AI** — chat streaming (Google Gemini) yang bisa memakai konteks hasil tes.
- **150 halaman jurusan** statis yang bisa diindeks mesin pencari + katalog dengan pencarian.
- Tema terang/gelap, aksesibel (keyboard, pembaca layar, *reduced motion*).

## Teknologi

React 19 · React Router 7 · Vite 7 · Tailwind CSS 4 · Motion · three.js + React Three Fiber + Drei · lucide-react · prerender statis (React `prerenderToNodeStream`).

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173/react-sistemrekomendasijurusan/
npm test           # unit test mesin rekomendasi (Node test runner)
npm run lint
npm run build      # build klien + SSR + prerender 158 halaman ke dist/
npm run preview
npm run deploy     # build lalu publish dist/ ke GitHub Pages (gh-pages)
```

Saat `npm run dev`, endpoint `/api/chat` dilayani langsung dari proyek backend di sebelahnya (`../Backend-SistemRekomendasiJurusan`) memakai `GEMINI_API_KEY` dari `.env.local` backend.

### Variabel lingkungan (opsional)

| Variabel | Default | Kegunaan |
| --- | --- | --- |
| `BASE_PATH` | `/react-sistemrekomendasijurusan/` | Base path deploy (pakai `/` untuk domain sendiri/Vercel) |
| `VITE_SITE_URL` | URL GitHub Pages | URL kanonis untuk SEO, sitemap, OG |
| `VITE_CHAT_API_URL` | `https://si-raju-backend.vercel.app/api/chat` | Endpoint chat AI (juga dipakai CSP) |

## Arsitektur singkat

```
src/
  main.jsx              entry mungil: tunggu first paint → muat React → hidrasi
  boot.jsx / App.jsx    shell aplikasi, rute, transisi
  entry-server.jsx      renderer prerender (dipakai scripts/prerender.mjs)
  lib/                  engine.js (mesin rekomendasi murni + test), riasec, seo, store 3D, util
  data/                 questions.json (model berbobot per opsi), majors.json, insights.json, faq.js
  components/
    home/  Hero3D, AnimatedHowItWorks, CategoryExplorer, Benefits, FaqSection, CtaBand
    quiz/  MorphingQuestionCard, AnswerInputs
    result/ ResultReveal, WhyMatch, MatchCard, AllMajorsList, ShareActions, shareImage
    three/ Background3D, Universe, shaders
    chat/  ChatLauncher, ChatPanel, markdown
    ui/    OwlMascot, MagneticButton, RadarChart, ProgressRing, Accordion, TiltCard, …
scripts/prerender.mjs   SSG: HTML per rute, CSS inline, CSP, sitemap.xml, robots.txt, 404.html
```

### Catatan performa

- Setiap halaman diprerender; CSS (~14 KB gzip) di-*inline* sehingga first paint hanya butuh HTML.
- JavaScript dimuat **setelah first paint** dan dievaluasi bertahap (React DOM → aplikasi → hidrasi dalam transition).
- three.js (lazy, ~205 KB br) baru dimuat setelah interaksi pertama, dilewati di perangkat lemah, mode hemat data, atau *reduced motion*; render loop berhenti saat langit tidak terlihat.
- Animasi halaman utama memakai CSS; library Motion hanya dimuat di rute yang membutuhkannya.
