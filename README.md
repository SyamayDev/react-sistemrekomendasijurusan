# SI-RAJU — Sistem Rekomendasi Jurusan

Tes minat bakat online gratis yang mencocokkan siswa SMA/SMK dengan **216 jurusan kuliah** (program studi S1, D3/D4, dan Sarjana Terapan yang benar-benar ada di Indonesia), memakai model minat karier **RIASEC (Holland)**, lengkap dengan persentase kecocokan dan **alasan yang bisa dijelaskan**.

**Live:** https://syamaydev.github.io/react-sistemrekomendasijurusan/

## Fitur utama

- **Rekomendasi yang jujur & transparan** — setiap jawaban menjadi bukti (sadar-opsi), dinormalisasi per jurusan dengan *shrinkage*, lalu dipadukan dengan kemiripan profil RIASEC. Tiap hasil menampilkan alasan terkuatnya.
- **Privat** — seluruh perhitungan berjalan di browser; jawaban tidak dikirim ke server. Link hasil berupa kode ringkas (tanpa isian bebas).
- **“Semesta RAJU” — cerita scroll 7 babak** di halaman utama: kebingungan → enam arah minat RIASEC → cara kerja (jawaban → profil → dicocokkan dengan semua jurusan → hasil) → 8 planet rumpun yang bisa dijelajahi → alasan memakai SI-RAJU → gerbang untuk mulai tes. Satu dunia 3D persisten (React Three Fiber) yang bergerak sesuai progres scroll.
- **RAJU 3D**, maskot burung hantu orisinal yang dibuat prosedural dengan rig sederhana: bernapas, berkedip, menoleh mengikuti kursor, ekspresi (senang/penasaran/berpikir/kaget), mengepakkan sayap saat CTA disentuh atau tes dimulai, dan melambai di gerbang. Tanpa WebGL atau dengan *reduced motion*, poster yang dirender dari model yang sama dipakai sebagai gantinya.
- **SI-RAJU AI** — chat streaming (Google Gemini) yang bisa memakai konteks hasil tes.
- **216 halaman jurusan** statis yang bisa diindeks mesin pencari + katalog dengan pencarian (tidak peka spasi/tanda baca: “tataboga” menemukan Tata Boga).
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
  lib/                  engine.js (mesin rekomendasi murni + test), riasec, seo, sceneStore (DOM ↔ 3D), scrollStory, util
  data/                 questions.json (model berbobot per opsi), majors.json, insights.json, faq.js
  components/
    story/ Chapter* (7 babak cerita scroll), StoryRail, parts (Chapter, Kicker, HudTag, ScrubText)
    home/  FaqSection
    quiz/  MorphingQuestionCard, AnswerInputs
    result/ ResultReveal, WhyMatch, MatchCard, AllMajorsList, ShareActions, shareImage
    three/ Stage (kanvas R3F, lazy), world/ (buildWorld, layouts, keys, environment, hud), raju/ (model + animator)
    chat/  ChatLauncher, ChatPanel, markdown
    ui/    OwlMascot, MagneticButton, RadarChart, ProgressRing, Accordion, TiltCard, …
scripts/prerender.mjs   SSG: HTML per rute, CSS inline, CSP, sitemap.xml, robots.txt, 404.html
scripts/raju-export.mjs render poster RAJU (.webp) + ekspor raju.glb dari model prosedural
tools/raju/             viewer dev untuk RAJU (pose, ekspresi, putar) — tidak ikut build
```

### Cerita scroll & dunia 3D

- `lib/scrollStory.js` mengukur tiap babak (`section[data-chapter]`, panggung *sticky*) sekali saat resize, lalu tiap scroll (satu rAF) menulis progres kontinu `story` (babak *i* = `[i, i+1)`) ke `sceneStore` dan variabel CSS `--enter`/`--p` + `data-step`. React tidak dirender ulang saat scroll.
- `components/three/world/buildWorld.js` membaca `story` setiap frame: kamera & RAJU mengikuti *keyframe* per babak; satu kartu per jurusan (satu `InstancedMesh`; ukuran kartu & grid dinding data menyesuaikan jumlah jurusan) berubah formasi: halo → kekacauan → orbit → dinding data → gugus di 8 planet rumpun → bingkai gerbang.
- Di tata letak bertumpuk (ponsel/tablet), panel teks tiap babak diukur dan dunia 3D dibingkai otomatis di ruang kosong di atasnya (jarak kamera + *lens shift*), sehingga RAJU tidak tertutup teks di ukuran layar apa pun.
- Label HUD yang menempel di objek 3D bersifat dekoratif (`aria-hidden`); semua aksinya juga tersedia sebagai kontrol nyata (chip rumpun, tombol, tautan).
- **Layar "Memuat Semesta"** (beranda): tampil sejak first paint dan baru terangkat setelah dunia 3D benar-benar tergambar, jadi pengunjung tidak pernah melihat adegan setengah jadi. Progresnya nyata — dua unduhan dihitung per byte (daftar chunk + ukuran disisipkan prerenderer di `<meta name="siraju:3d">`), lalu langkah model, pencahayaan, dan shader (`lib/loader3d.js`, `components/layout/Preloader.jsx`). Tes selalu bisa dimulai lewat "Langsung mulai tes"; bila gagal/timeout tampil "Coba lagi" / "Lanjut tanpa 3D" (hanya untuk kunjungan itu).
- Dunia 3D selalu dipakai bila perangkat punya GPU (perangkat spek rendah mendapat resolusi render lebih ringan). Pengecualian: *reduced motion* (aksesibilitas), tanpa WebGL, atau WebGL berbasis software (SwiftShader/llvmpipe, hanya beberapa fps) — di sana layar muat tidak muncul dan babak menjadi halaman statis yang tetap lengkap dengan ilustrasi poster.
- Untuk dukungan/pengujian: `?3d=on` memaksa 3D (juga di WebGL software), `?3d=off` melewatinya — berlaku per tab (`sessionStorage["siraju:3d"]`).
- **Semesta jurusan:** cincin 8 planet berputar pelan; memilih rumpun memutar cincin lewat jalur terpendek sampai planet itu berada di depan (sedikit di kanan RAJU), jadi tidak pernah tertutup planet lain. Kartu jurusan tiap rumpun ikut bergerak bersama planetnya.
- **Akhir cerita:** saat babak Gerbang bergulir keluar, dunia 3D memudar (`--story-out`) dan bagian atas FAQ bergradasi dari langit, tanpa garis batas.

### Data jurusan

Semua jurusan ada di `src/data/majors.json` (8 rumpun: STEM 50, Kesehatan 21, Bisnis 19, Sosial 21, Humaniora 20, Seni 19, Pendidikan 36, Vokasi 30). Menambah jurusan baru berarti mengisi:

1. `majors.json` — tambahkan di akhir dengan `id` berikutnya (`m217`, …; id lama jangan diubah karena menjadi kunci bobot di `questions.json` dan `hobbies.js`), nama resmi program studi, rumpun, deskripsi singkat (sebut jenjang D3/D4 bila vokasi), dan 4–5 `karakter_cocok` dari kosakata `TRAIT_MAP` di `lib/riasec.js`.
2. `insights.json` — paragraf “kenapa cocok”, dengan kunci = `nama_jurusan` persis.
3. `questions.json` — bobot jurusan itu di soal skala/ya-tidak (`bobot_jurusan`) dan di opsi yang relevan (`efek.jurusan`); cara termudah: turunkan dari 1–3 jurusan lama yang paling mirip.
4. Opsional: kata kunci hobi di `lib/hobbies.js`; lalu perbarui `jumlah` di `lib/categories.js` dan angka di deskripsi `index.html`.

`npm test` menjaga semuanya tetap sinkron (jumlah per rumpun, insight tiap jurusan, trait yang terpetakan ke RIASEC, angka di meta deskripsi) dan memeriksa bahwa profil siswa tertentu — calon koki/pastry, pencinta budaya Jawa, calon guru agama, pencinta wisata, montir — benar-benar menemukan jurusan yang dimaksud.

### Navigasi tanpa bilah atas

Tidak ada top bar agar dunia 3D memakai seluruh layar: logo di pil kecil kiri atas, aksi di pil kanan atas (Mulai Tes · tema · layar penuh · Menu). Navigasi ada di **menu layar penuh** (`components/layout/Header.jsx`: halaman dan tujuh bab cerita — masing-masing dengan ikon — serta sakelar tampilan) yang menjebak fokus, menutup dengan Esc, dan membuat halaman di belakangnya `inert`. Tombol **layar penuh** memakai Fullscreen API (disembunyikan di peramban yang tidak mendukung, mis. Safari iPhone) dan juga ada di halaman tes. Di halaman konten, "kabut" gradasi di tepi atas membuat teks yang di-scroll memudar di bawah tombol; di cerita beranda kabut ini mati.

### RAJU 3D & pipeline aset

RAJU adalah model **orisinal yang dibangun prosedural dengan three.js** (`src/components/three/raju/createRaju.js`) — tidak ada model, tekstur, atau HDRI pihak ketiga. File itu adalah sumber yang bisa diedit: proporsi (profil *lathe* badan), warna (`RAJU_COLORS`), ekspresi (`EXPRESSIONS`), dan rig (kepala, kelopak mata, sayap, kuncir toga) semuanya ada di sana; `createRajuAnimator` mengatur napas, kedip, tatapan, kepak, dan lambaian.

```bash
npm run dev        # lalu buka /react-sistemrekomendasijurusan/tools/raju/viewer.html?pose=hero&spin=1
npm run raju:export  # render ulang poster src/assets/raju/*.webp + ekspor assets-src/raju/raju.glb
```

- Pose viewer: `hero`, `curious`, `wave`, `happy`, `thinking`, `front`, `side`, `back`, `poster-*`; parameter `size`, `bg=1`, `perch=0`, `spin=1`.
- `raju:export` butuh Chrome/Edge lokal (atau `CHROME_PATH`). Poster dipakai sebagai *fallback* & selama dunia 3D dimuat; `raju.glb` (~1,5 MB, tidak di-deploy) untuk dibuka di Blender/AR viewer.
- Pencahayaan berbasis gambar juga prosedural (`world/environment.js`: *softbox* + PMREM), dan dipakai bersama oleh situs maupun viewer agar poster sama dengan versi live.

### Aset & lisensi

| Aset | Sumber | Lisensi |
| --- | --- | --- |
| Model RAJU 3D, poster `src/assets/raju/*`, tekstur mata/perut (canvas) | Dibuat khusus untuk proyek ini (prosedural) | Mengikuti repositori ini |
| Ilustrasi burung hantu lama (`owl-*.webp`, maskot SVG) | Aset SI-RAJU yang sudah ada | Mengikuti repositori ini |
| Font Plus Jakarta Sans, Bricolage Grotesque | Fontsource (`@fontsource-variable/*`) | SIL Open Font License 1.1 |
| three.js, React Three Fiber, Drei | npm | MIT |
| Ikon lucide | npm | ISC |

### Catatan performa

- Setiap halaman diprerender; CSS (~14 KB gzip) di-*inline* sehingga first paint hanya butuh HTML.
- JavaScript dimuat **setelah first paint** dan dievaluasi bertahap (React DOM → aplikasi → hidrasi dalam transition).
- Dunia 3D (three.js ~150 KB br + kode dunia ~63 KB br, chunk terpisah) dimuat langsung di beranda di balik layar "Memuat Semesta", dan segera setelah halaman tes/hasil tenang (tanpa layar muat); hanya dilewati pada WebGL software, tanpa WebGL, atau *reduced motion*. Penyiapannya dipecah ke beberapa *task* dan shader dikompilasi paralel (`KHR_parallel_shader_compile`), jadi halaman tidak membeku saat dunia dimuat. Render loop berhenti saat panggung cerita tidak terlihat.
- Font judul (Bricolage Grotesque) dan isi (Plus Jakarta Sans) di-*preload* (subset latin); *fallback* lokal disetel ukurannya agar tidak terjadi pergeseran tata letak saat font masuk.
- Animasi halaman utama memakai CSS; library Motion hanya dimuat di rute yang membutuhkannya.
