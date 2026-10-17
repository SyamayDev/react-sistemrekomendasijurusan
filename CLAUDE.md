# CLAUDE.md --- SI-RAJU: Immersive Website Redesign & Interactive 3D Experience

> **Instruksi utama untuk Claude Code (Claude Opus 5):** Bertindaklah
> sebagai creative director, award-winning digital product designer,
> senior frontend engineer, motion designer, interaction designer, 3D
> artist, accessibility specialist, dan QA engineer sekaligus. Bukan
> sekadar mempercantik halaman: rombak pengalaman SI-RAJU secara
> menyeluruh menjadi website yang imersif, berkarakter, interaktif,
> terasa premium, dan benar-benar layak dipamerkan sebagai karya
> unggulan.

------------------------------------------------------------------------

## 1. Misi Utama

Bangun ulang website SI-RAJU (Sistem Rekomendasi Jurusan) dengan
kualitas visual dan interaksi yang terinspirasi oleh pengalaman digital
di **https://www.igloo.inc/**.

Gunakan situs referensi tersebut sebagai **referensi kualitas
pengalaman**: art direction yang kuat, dunia visual yang konsisten,
komposisi berani, transisi yang terasa disengaja, gerakan yang merespons
scroll, storytelling bertahap, serta detail interaksi yang membuat
pengguna ingin terus menjelajah. Jangan menyalin mentah identitas,
layout, ilustrasi, aset, teks, atau kode Igloo. Buat identitas SI-RAJU
yang orisinal dan relevan dengan eksplorasi minat, kepribadian, dan masa
depan pendidikan.

Website saat ini: -
https://syamaydev.github.io/react-sistemrekomendasijurusan/

**Hasil akhir yang diinginkan:** pengguna merasa sedang memasuki sebuah
"semesta eksplorasi masa depan" yang dipandu maskot RAJU. Setiap scroll
membuka babak visual baru, objek bergerak secara bermakna, konten muncul
dengan timing yang rapi, dan seluruh pengalaman tetap mudah dipahami
serta berfungsi baik.

Jangan berhenti pada audit, saran, wireframe, atau daftar rencana.
Setelah memahami repository, **langsung implementasikan redesign di
workspace sampai selesai**, jalankan pemeriksaan yang tersedia, perbaiki
bug, dan dokumentasikan hasilnya.

------------------------------------------------------------------------

## 2. Prinsip Kerja yang Wajib Diikuti

1.  **Baca seluruh instruksi dan pahami proyek terlebih dahulu.**
    -   Baca `CLAUDE.md` ini sampai selesai.
    -   Periksa `README`, `package.json`, konfigurasi bundler, struktur
        `src`, `public`, aset, komponen, stylesheet, data jurusan,
        algoritma rekomendasi, tes, serta riwayat implementasi yang
        relevan.
    -   Periksa website yang sedang berjalan dan bandingkan dengan kode
        lokal.
    -   Identifikasi framework, dependensi, build command, deployment
        base path, serta batasan hosting GitHub Pages.
2.  **Jangan menghapus fitur yang sudah berfungsi hanya demi tampilan.**
    Pertahankan dan uji tes minat, logika RIASEC, data jurusan,
    perhitungan kecocokan, hasil, progress, FAQ, chat AI (jika ada),
    privasi, dan semua alur penting yang ditemukan.
3.  **Jangan mengarang fitur yang tidak terhubung.** Semua tombol,
    navigasi, CTA, kontrol, modal, kartu, dan interaksi harus
    benar-benar bekerja. Jangan membuat UI palsu untuk sekadar terlihat
    bagus.
4.  **Buat keputusan desain secara mandiri.** Jangan berhenti untuk
    meminta persetujuan atas setiap detail kecil. Jika ada beberapa
    opsi, pilih solusi terbaik dengan mempertimbangkan kualitas,
    performa, aksesibilitas, dan konsistensi.
5.  **Utamakan hasil nyata.** Setelah analisis singkat, langsung
    kerjakan implementasi. Jangan hanya memberikan contoh kode atau
    menyuruh pengguna melakukan langkah manual.
6.  **Jangan merusak kompatibilitas.** Pertahankan stack proyek yang ada
    jika masih layak. Jangan migrasi framework atau mengganti arsitektur
    secara besar-besaran tanpa alasan teknis kuat.
7.  **Jangan menghapus atau menimpa file pengguna secara sembrono.**
    Periksa kondisi git terlebih dahulu. Pertahankan perubahan yang
    sudah ada dan jangan melakukan reset/clean/destructive operation.
8.  **Jangan mengklaim selesai jika build, route, dan interaksi utama
    belum diperiksa.**

------------------------------------------------------------------------

## 3. Creative Direction: "The RAJU Universe"

### Konsep

SI-RAJU bukan dashboard generik atau landing page template. Jadikan
pengalaman sebagai perjalanan interaktif dari kebingungan memilih
jurusan menuju pemahaman diri.

Bayangkan gabungan: - digital storytelling yang sinematik, - dunia 3D
yang playful tetapi tetap matang, - editorial typography yang berani, -
bentuk-bentuk abstrak yang merepresentasikan minat dan potensi, -
micro-interaction yang responsif, - tata letak modern dengan ruang
kosong yang disengaja, - palet warna terarah dan sistem visual yang
konsisten.

### Karakter visual

Bangun identitas original SI-RAJU: - **RAJU**, maskot burung hantu
SI-RAJU, menjadi karakter utama yang membantu pengguna menjelajah. -
Buat RAJU terlihat ekspresif, ramah, cerdas, memorable, dan berkualitas
tinggi---bukan clip-art generik. - Maskot boleh berupa model 3D, rig
sederhana, animasi procedural, atau ilustrasi 2.5D sesuai solusi yang
paling stabil. - Tambahkan objek pendukung yang relevan: planet jurusan,
orbit, portal, kompas minat, kartu jurusan yang melayang, gugusan
bintang, atau lanskap abstrak. - Setiap objek harus mendukung cerita
atau navigasi, bukan sekadar dekorasi.

### Palet dan tipografi

Tentukan sistem desain menyeluruh setelah memeriksa identitas website
saat ini. Arah awal yang boleh dikembangkan: - warna dasar midnight navy
/ indigo / biru tua, - aksen electric blue, cyan, lavender, dan satu
warna hangat sebagai aksen, - kontras teks yang tinggi, - gradien
digunakan dengan hemat dan terarah, - gunakan font display berkarakter
untuk headline dan sans-serif yang sangat mudah dibaca untuk body, -
batasi jumlah keluarga font, - gunakan design tokens untuk warna,
spacing, radius, shadow, typography, dan motion.

Jangan memaksakan palet contoh jika hasil audit menunjukkan arah lain
yang lebih kuat. Yang wajib adalah konsistensi dan kualitas art
direction.

### Hindari

-   tampilan template SaaS yang generik;
-   semua section berupa kartu putih dengan radius yang sama;
-   gradien berlebihan, glow berlebihan, glassmorphism di mana-mana;
-   terlalu banyak emoji sebagai pengganti desain;
-   animasi yang membuat konten sulit dibaca;
-   headline generik seperti "Unlock Your Potential" tanpa konteks;
-   elemen 3D berat yang tidak memberi nilai;
-   efek scroll yang membuat pengguna kehilangan kontrol;
-   tampilan yang jelas terasa seperti hasil AI tanpa art direction;
-   menyalin desain Igloo secara langsung.

------------------------------------------------------------------------

## 4. Website Harus Memiliki Storytelling Scroll yang Nyata

Rancang halaman sebagai beberapa babak visual. Jumlah dan struktur akhir
boleh disesuaikan setelah audit, tetapi minimal pertimbangkan urutan
berikut.

### Scene 1 --- Cinematic Hero

-   Headline yang kuat, singkat, dan emosional dalam Bahasa Indonesia.
-   Jelaskan secara langsung bahwa SI-RAJU membantu pengguna mengenali
    minat dan menemukan rekomendasi jurusan.
-   CTA utama: **"Mulai Eksplorasi"** atau copy yang lebih kuat.
-   CTA sekunder: **"Kenali SI-RAJU"** / lihat cara kerja.
-   RAJU 3D menjadi focal point. Komposisi harus berkarakter dan punya
    depth.
-   Saat halaman dibuka, tampilkan intro motion singkat: elemen muncul
    bertahap, RAJU masuk/berinteraksi, dan tipografi terungkap dengan
    halus.
-   Respons pointer boleh membuat RAJU atau objek orbit bereaksi ringan,
    tetapi jangan mengganggu aksesibilitas.
-   Tambahkan petunjuk scroll yang elegan.
-   Jangan menghabiskan seluruh viewport untuk efek sehingga fungsi
    utama sulit ditemukan.

### Scene 2 --- The World Responds to Scroll

-   Buat satu atau lebih bagian dengan **scroll-driven storytelling**
    yang terasa jelas.
-   RAJU, planet, objek, latar, atau komposisi dapat berubah posisi,
    rotasi, skala, kedalaman, atau ekspresi sesuai progres scroll.
-   Gunakan section yang sticky/pinned hanya bila memberi efek naratif
    yang jelas dan tidak membuat halaman terasa macet.
-   Setiap perubahan harus terasa terkait dengan konten. Contoh: objek
    yang awalnya tersebar perlahan membentuk orbit, kemudian orbit
    mengarah ke peta minat.
-   Jangan sekadar menerapkan fade-in pada semua elemen. Buat variasi
    ritme: reveal tipografi, parallax halus, perubahan scene,
    perpindahan objek, mask reveal, dan transisi warna.
-   Konten harus tetap tersedia bagi pengguna yang tidak mengaktifkan
    animasi.

### Scene 3 --- "Kenali Dirimu"

-   Perkenalkan tes minat dan bakat sebagai pengalaman ringan, bukan
    ujian yang menegangkan.
-   Visualisasi enam dimensi RIASEC (Realistic, Investigative, Artistic,
    Social, Enterprising, Conventional) dengan bahasa yang ramah dan
    penjelasan yang akurat.
-   Gunakan animasi diagram atau objek yang membantu pemahaman.
-   Pastikan istilah teknis diterangkan dalam Bahasa Indonesia.
-   Jangan menyebut hasil sebagai diagnosis, kepastian masa depan, atau
    penilaian mutlak.

### Scene 4 --- Cara Kerja SI-RAJU

-   Tampilkan alur yang jelas: jawab pertanyaan → sistem membentuk
    profil minat → kecocokan dibandingkan dengan data jurusan → hasil
    beserta alasan.
-   Gunakan visual storytelling, bukan tiga kartu generik.
-   Animasi harus membantu pengguna memahami proses, bukan menutupi
    informasi.

### Scene 5 --- Semesta Jurusan

-   Tampilkan delapan rumpun jurusan dan data jurusan yang benar-benar
    tersedia di proyek.
-   Gunakan bentuk visual, orbit, constellation, atau peta eksplorasi
    yang bisa dijelajahi.
-   Interaksi hover/focus/click memberikan feedback yang jelas.
-   Kartu atau panel jurusan harus menampilkan informasi yang relevan,
    tidak sekadar efek visual.
-   Pastikan daftar jurusan tetap mudah dicari, dibaca, dan diakses di
    layar kecil.
-   Jangan mengubah jumlah, nama, atau isi data jurusan secara
    sembarangan.

### Scene 6 --- Mengapa SI-RAJU

-   Soroti keunggulan nyata yang didukung implementasi: gratis, tanpa
    daftar akun (jika masih benar), proses lokal/privasi (jika benar),
    hasil beserta alasan, dan fitur lain yang memang tersedia.
-   Jangan menambahkan klaim statistik atau klaim privasi yang tidak
    dapat diverifikasi dari kode.
-   Jika fitur AI mengirim pesan ke layanan eksternal, jelaskan secara
    jujur.

### Scene 7 --- Mulai Perjalanan

-   Penutup yang kuat dengan RAJU dan CTA memulai tes.
-   FAQ tetap tersedia dan berfungsi.
-   Footer rapi, berisi navigasi dan informasi yang benar.
-   Sediakan cara kembali ke bagian penting tanpa memaksa pengguna
    scroll jauh.

**Catatan:** struktur di atas adalah arahan storytelling, bukan
kewajiban membuat tujuh komponen yang semuanya berdiri sebagai section
kartu. Gunakan komposisi dan transisi yang bervariasi agar website
terasa seperti satu pengalaman utuh.

------------------------------------------------------------------------

## 5. Buat Model 3D RAJU yang Orisinal dan Bisa Digunakan

Saya memberi kebebasan kreatif untuk mengganti, membuat ulang, atau
mengembangkan aset SI-RAJU agar hasilnya benar-benar sesuai visi.

### Prioritas aset

1.  Periksa apakah aset RAJU yang sekarang ada dan apakah dapat
    digunakan ulang.
2.  Jika tidak memadai, **buat model 3D RAJU baru yang orisinal**.
3.  Jangan menganggap model 3D harus dibuat dengan satu cara tertentu.
    Pilih workflow terbaik yang dapat dijalankan di lingkungan kerja:
    -   model Blender dan ekspor `.glb`/`.gltf`;
    -   model procedural dengan Three.js;
    -   kombinasi mesh sederhana, material, lighting, dan rig/animasi;
    -   atau pipeline aset lain yang bebas digunakan dan legal.
4.  Jika tooling 3D tersedia, gunakan untuk menghasilkan model
    berkualitas. Jika tidak tersedia, jangan berhenti: bangun alternatif
    procedural yang tampak disengaja dan profesional, lalu jelaskan
    keterbatasan tooling secara jujur.
5.  Jangan membuat placeholder berupa emoji burung hantu lalu menganggap
    tugas selesai.

### Art direction model

RAJU harus: - langsung terbaca sebagai burung hantu; - punya siluet yang
kuat dari berbagai sudut; - memiliki mata ekspresif, bentuk tubuh yang
menarik, detail sayap/bulu yang terkontrol, paruh dan kaki yang
proporsional; - menggunakan material, warna, dan pencahayaan yang
konsisten dengan brand; - terlihat baik pada ukuran besar di hero dan
tetap jelas pada ukuran kecil; - memiliki ekspresi atau pose yang sesuai
dengan peran sebagai pemandu eksplorasi.

Hindari detail berlebihan yang mengganggu performa. Siluet, ekspresi,
material, lighting, dan animasi lebih penting daripada jumlah polygon.

### Animasi RAJU

Jika layak secara teknis, buat beberapa perilaku: - idle breathing /
body bob yang halus; - kedipan mata; - sedikit gerakan kepala mengikuti
pointer dengan batas yang wajar; - wing gesture saat memasuki scene atau
saat CTA aktif; - perubahan pose/arah pandang pada transisi section; -
reaksi ringan ketika pengguna memulai tes.

Semua animasi harus stabil, tidak membuat model bergetar, tidak
menyebabkan layout shift, dan tidak mengganggu interaksi. Sediakan
fallback statis yang bagus jika WebGL tidak tersedia.

### Hak penggunaan aset

-   Bebas mengganti aset yang ada jika memang diperlukan.
-   Utamakan aset yang dibuat sendiri atau aset berlisensi jelas dan
    kompatibel.
-   Jangan mengunduh atau menggunakan model yang lisensinya tidak jelas.
-   Catat sumber dan lisensi setiap aset pihak ketiga.
-   Simpan aset di lokasi proyek yang sesuai dan gunakan path relatif
    yang benar.
-   Jangan membuat URL aset eksternal sebagai satu-satunya sumber untuk
    bagian penting.
-   Jika menghasilkan aset baru, sertakan file sumber yang dapat diedit
    jika memungkinkan beserta catatan workflow singkat.

------------------------------------------------------------------------

## 6. Implementasi 3D, Scroll, dan Motion

Periksa stack yang ada sebelum memilih library. Gunakan teknologi yang
kompatibel dan jangan menambah dependensi hanya demi tren.

### Jika proyek menggunakan React

Pertimbangkan React Three Fiber / Three.js / Drei jika sesuai dengan
versi dan ukuran bundle. Untuk motion, pilih solusi yang sudah ada atau
yang paling ringan dan stabil; GSAP ScrollTrigger dapat dipertimbangkan
bila memang memberi nilai dan lisensinya sesuai.

### Persyaratan teknis

-   Sinkronkan gerakan scroll dengan progress scroll atau intersection
    state yang terukur.
-   Gunakan `requestAnimationFrame`/mekanisme library yang tepat; jangan
    memasang banyak listener scroll yang mahal.
-   Hindari memicu render React pada setiap pixel scroll bila tidak
    perlu.
-   Gunakan `IntersectionObserver` untuk reveal yang sesuai.
-   Bersihkan listener, observer, animation frame, renderer, geometry,
    material, texture, dan resource saat komponen dilepas.
-   Perhatikan React Strict Mode dan lifecycle development.
-   Batasi pixel ratio dan kompleksitas scene pada perangkat yang lebih
    lemah.
-   Gunakan lazy loading untuk model/scene berat.
-   Berikan loading state yang dirancang dengan baik, bukan layar
    kosong.
-   Hindari autoplay audio.
-   Hindari memaksa pointer-lock, scroll-jacking, atau gerakan kamera
    ekstrem.
-   Jangan mematikan scrolling native hanya untuk mengejar efek
    sinematik.
-   Jangan menampilkan horizontal overflow pada viewport kecil.
-   Pastikan efek 3D tidak menutupi CTA atau teks.
-   Jika WebGL gagal, halaman tetap lengkap dan dapat digunakan dengan
    poster/ilustrasi fallback.

### Reduced motion

Hormati `prefers-reduced-motion: reduce`. - Kurangi atau matikan
parallax, rotasi besar, scroll-pinning, dan transisi yang tidak perlu. -
Pastikan informasi yang biasanya diungkap lewat animasi tetap
tersedia. - Sediakan transisi yang lebih singkat dan sederhana. - Jangan
memaksa animasi terus-menerus bagi pengguna yang memilih reduced motion.

------------------------------------------------------------------------

## 7. Fitur Produk yang Harus Tetap Benar

Redesign tidak boleh mengorbankan fungsi SI-RAJU. Audit dan uji alur
yang benar-benar ada saat ini.

### Tes minat

-   CTA memulai tes harus membawa pengguna ke alur tes yang benar.
-   Pertanyaan, pilihan jawaban, validasi, indikator progres, tombol
    sebelumnya/berikutnya, dan penyelesaian harus bekerja.
-   Jangan mengubah pertanyaan atau bobot scoring tanpa alasan yang
    dapat dijelaskan.
-   Jika progres tersimpan, pertahankan perilakunya dan pastikan dapat
    dilanjutkan.
-   Cegah kehilangan jawaban saat perpindahan langkah yang tidak
    disengaja.
-   Pastikan tes tetap nyaman digunakan dengan keyboard dan layar kecil.

### Rekomendasi

-   Pertahankan model RIASEC dan algoritma pemetaan yang telah ada
    kecuali ditemukan bug nyata.
-   Periksa apakah persentase, pengurutan, penjelasan kecocokan, dan
    alternatif jurusan benar.
-   Hasil harus menyampaikan bahwa rekomendasi adalah panduan awal,
    bukan keputusan mutlak.
-   Jangan mengarang jurusan, prospek kerja, akreditasi, gaji, atau data
    statistik.
-   Jika ditemukan masalah data atau algoritma, perbaiki secara terukur
    dan dokumentasikan.

### Hasil tes

-   Buat halaman hasil yang sama bagusnya dengan landing page.
-   Visualisasi profil minat harus terbaca, memiliki label, dan tidak
    hanya mengandalkan warna.
-   Tampilkan rekomendasi utama dan alternatif secara terstruktur.
-   Jelaskan alasan kecocokan dengan bahasa yang bisa dipahami siswa
    SMA/SMK.
-   Pertahankan fungsi bagikan/cetak/ulang jika tersedia.
-   Pastikan tampilan hasil tetap baik saat dicetak atau dibagikan, jika
    fitur itu memang ada.

### AI chat / asisten

Jika fitur AI chat tersedia: - Pertahankan fungsinya dan jangan
mengganti integrasi dengan respons palsu. - Pastikan state loading,
error, empty state, dan tombol kirim berfungsi. - Jangan pernah menaruh
API key atau secret di frontend. - Jangan mengirim jawaban tes ke server
jika arsitektur saat ini menjanjikan pemrosesan lokal, kecuali pengguna
diberi penjelasan dan arsitektur sengaja diubah dengan alasan yang
kuat. - Jangan membuat klaim privasi yang tidak sesuai implementasi.

### Navigasi dan konten

-   Semua anchor, CTA, FAQ, modal, drawer, tombol tutup, dan tautan
    harus diuji.
-   Pertahankan informasi penting: cara kerja, rumpun jurusan, privasi,
    FAQ, dan ajakan memulai tes.
-   Hilangkan konten duplikat atau tidak relevan bila perlu, tetapi
    jangan menghapus fitur inti.

------------------------------------------------------------------------

## 8. Bahasa dan Copywriting

Gunakan Bahasa Indonesia yang natural, jelas, hangat, dan modern.

-   Hindari bahasa terlalu formal atau seperti brosur institusi.
-   Hindari slang berlebihan.
-   Gunakan headline pendek yang memiliki karakter.
-   Setiap paragraf harus punya tujuan.
-   Jelaskan RIASEC dengan bahasa sederhana.
-   Hindari janji seperti "pasti menemukan jurusan terbaik", "menjamin
    sukses", atau "menentukan masa depan".
-   Gunakan CTA yang spesifik dan konsisten.
-   Pertahankan nama **SI-RAJU** sebagai brand utama dan **RAJU**
    sebagai maskot.
-   Pastikan ejaan, kapitalisasi, tanda baca, dan istilah konsisten.

Contoh arah copy (boleh diperbaiki): - "Masa depanmu bukan pilihan
acak." - "Kenali minatmu. Temukan kemungkinanmu." - "Bukan menentukan
siapa dirimu. Membantumu melihat apa yang mungkin cocok." - "Mulai dari
rasa penasaran."

Jangan menggunakan seluruh contoh secara otomatis; tulis copy yang
paling sesuai dengan desain akhir.

------------------------------------------------------------------------

## 9. Responsive Design

Desain dan uji sekurang-kurangnya pada viewport: - 360 × 800 (ponsel
kecil), - 390 × 844 (ponsel modern), - 768 × 1024 (tablet), - 1280 × 800
(laptop), - 1440 × 900 (desktop besar).

Ketentuan: - Hero harus tetap kuat di mobile, bukan sekadar desktop yang
diperkecil. - Pada layar kecil, sederhanakan atau ubah komposisi 3D bila
diperlukan. - Teks tidak boleh terpotong, bertabrakan, atau terlalu
kecil. - CTA harus mudah dijangkau. - Hindari horizontal scrolling
kecuali memang merupakan interaksi yang disengaja dan jelas. - Menu
mobile harus berfungsi, dapat ditutup, dan mendukung keyboard. -
Pastikan elemen fixed tidak menutupi konten atau tombol penting. -
Periksa layout saat konten panjang dan ketika hasil tes memuat banyak
data.

------------------------------------------------------------------------

## 10. Accessibility dan Usability

-   Gunakan semantic HTML: heading berurutan, `main`, `nav`, `section`,
    `button`, dan `a` sesuai fungsinya.
-   Semua interaksi penting dapat digunakan dengan keyboard.
-   Fokus keyboard harus terlihat.
-   Tambahkan label aksesibel untuk tombol ikon dan kontrol tanpa teks.
-   Gunakan kontras warna yang memadai.
-   Jangan menyampaikan status atau hasil hanya lewat warna.
-   Teks alternatif untuk aset bermakna; dekorasi disembunyikan dari
    screen reader.
-   Hormati reduced motion.
-   Jangan membuat teks penting menjadi bagian dari gambar saja.
-   Pastikan animasi tidak berkedip cepat.
-   Jangan mengunci zoom browser.
-   Perhatikan ukuran target sentuh pada ponsel.

------------------------------------------------------------------------

## 11. Performance dan Stabilitas

Targetkan pengalaman yang terasa cepat pada laptop dan ponsel kelas
menengah.

-   Ukur ukuran bundle dan perhatikan dependensi baru.
-   Lazy-load 3D, gambar, dan komponen berat yang tidak diperlukan pada
    first paint.
-   Gunakan format gambar modern dan ukuran aset yang sesuai.
-   Kompres model 3D jika memungkinkan; hindari tekstur raksasa yang
    tidak diperlukan.
-   Jangan membuat banyak mesh atau efek post-processing tanpa
    kebutuhan.
-   Hindari CLS/layout shift.
-   Jangan memuat library besar hanya untuk satu efek kecil.
-   Hindari console error, warning yang dapat dicegah, dan request aset
    yang gagal.
-   Gunakan font loading yang tidak menyebabkan flash/layout shift
    berlebihan.
-   Pastikan interaksi inti dapat digunakan meskipun scene 3D sedang
    loading.

Jika Lighthouse atau alat sejenis tersedia, periksa Performance,
Accessibility, Best Practices, dan SEO. Jangan mengejar angka dengan
mengorbankan pengalaman atau menyembunyikan konten.

------------------------------------------------------------------------

## 12. SEO, Metadata, dan Deployment

-   Periksa `title`, meta description, favicon, Open Graph, dan metadata
    yang sudah ada.
-   Perbarui metadata agar sesuai dengan identitas baru tanpa menghapus
    informasi penting.
-   Pastikan deployment GitHub Pages tetap bekerja.
-   Periksa konfigurasi Vite/React `base`, routing, path aset, serta
    direct URL refresh.
-   Jangan mengandalkan absolute path yang membuat aset gagal di project
    subpath.
-   Jika memakai model `.glb`, gambar, font, atau file lain, pastikan
    file ikut masuk ke build dan path benar.
-   Pastikan URL publik tetap sesuai dengan project SI-RAJU yang
    sekarang.
-   Jangan mengubah repo remote, menambah secret, atau melakukan
    deployment tanpa otorisasi eksplisit.
-   Jangan menulis token atau API key ke repository.

------------------------------------------------------------------------

## 13. Testing dan QA --- Wajib Dilakukan

Setelah implementasi:

1.  Jalankan install hanya bila dibutuhkan dan gunakan package manager
    yang cocok dengan lockfile.
2.  Jalankan lint/typecheck/test/build yang tersedia di `package.json`.
3.  Perbaiki semua error yang muncul dari perubahan.
4.  Jalankan aplikasi lokal dan periksa console jika browser/tool
    tersedia.
5.  Uji semua CTA dan anchor.
6.  Uji alur tes dari awal sampai hasil.
7.  Uji navigasi kembali/berikutnya, progress, scoring, dan rekomendasi.
8.  Uji FAQ, menu mobile, modal, dan AI chat jika ada.
9.  Periksa tampilan di desktop dan mobile.
10. Uji reduced-motion dan fallback ketika WebGL tidak tersedia jika
    memungkinkan.
11. Periksa semua aset lokal agar tidak ada 404.
12. Pastikan halaman tetap dapat dibaca ketika JavaScript/3D gagal
    sejauh arsitektur memungkinkan.

Jangan hanya mengandalkan pemeriksaan visual. Uji perilaku.

Jika browser automation tidak tersedia, jalankan pemeriksaan terbaik
yang tersedia, lakukan inspeksi kode, dan tuliskan dengan jujur
pengujian yang belum dapat dilakukan.

------------------------------------------------------------------------

## 14. Urutan Eksekusi yang Diharapkan

Kerjakan dengan alur berikut tanpa berhenti setelah tahap pertama:

### Tahap A --- Audit

-   Baca instruksi, struktur, package, komponen, aset, dan alur produk.
-   Catat batasan nyata.
-   Buat rencana implementasi internal singkat.

### Tahap B --- Art Direction

-   Tentukan konsep visual, design tokens, tipografi, warna, layout,
    sistem motion, dan karakter RAJU.
-   Buat sistem yang konsisten untuk landing page, tes, hasil, dan
    komponen lainnya.

### Tahap C --- Implementasi

-   Bangun ulang hero.
-   Implementasikan scroll storytelling.
-   Buat/pasang model RAJU dan animasi yang layak.
-   Bangun section dan transisi yang diperlukan.
-   Poles halaman tes, hasil, FAQ, navigasi, dan chat agar satu
    pengalaman terpadu.
-   Pastikan responsive dan reduced motion.
-   Hapus style lama yang bentrok setelah memastikan tidak dibutuhkan.

### Tahap D --- Integrasi

-   Hubungkan seluruh CTA ke fitur yang benar.
-   Pastikan semua data dan algoritma lama tetap terhubung.
-   Tambahkan fallback dan loading state yang rapi.

### Tahap E --- QA dan Polishing

-   Jalankan build/test/lint.
-   Perbaiki bug dan responsivitas.
-   Selesaikan detail typography, spacing, hover/focus, transisi, dan
    konsistensi visual.
-   Jangan berhenti pada versi "sudah jalan"; lakukan satu putaran
    visual polish tambahan.

### Tahap F --- Laporan Akhir

Berikan ringkasan singkat namun konkret: - konsep dan perubahan utama; -
file penting yang dibuat/diubah; - model 3D dan pipeline aset yang
dipakai; - fitur yang dipertahankan atau diperbaiki; - hasil
build/test; - keterbatasan yang masih ada; - cara menjalankan proyek
lokal.

------------------------------------------------------------------------

## 15. Definition of Done

Pekerjaan baru dianggap selesai jika semua poin yang relevan terpenuhi:

-   [ ] Website memiliki identitas visual SI-RAJU yang orisinal dan
    terasa premium.
-   [ ] Referensi Igloo diterjemahkan menjadi pengalaman, bukan ditiru
    mentah.
-   [ ] Ada storytelling yang terasa nyata ketika pengguna scroll.
-   [ ] RAJU tampil sebagai maskot utama yang berkualitas; model 3D
    dibuat/diganti jika tooling memungkinkan.
-   [ ] Animasi memiliki tujuan dan tidak mengganggu penggunaan.
-   [ ] Ada fallback yang baik untuk perangkat tanpa WebGL dan pengguna
    reduced motion.
-   [ ] Seluruh fitur utama SI-RAJU tetap berfungsi.
-   [ ] Tes dan hasil rekomendasi benar-benar terhubung ke logika/data
    yang ada.
-   [ ] Responsive pada mobile, tablet, dan desktop.
-   [ ] Aksesibilitas dasar dan navigasi keyboard diperhatikan.
-   [ ] Tidak ada tombol palsu, link mati, aset 404, atau error baru
    yang diketahui.
-   [ ] Build/lint/test yang tersedia sudah dijalankan dan hasilnya
    dilaporkan.
-   [ ] Deployment GitHub Pages tidak dirusak.
-   [ ] Satu putaran final polish sudah dilakukan.

------------------------------------------------------------------------

## 16. Arahan Penutup

Bekerjalah seolah-olah SI-RAJU akan dinilai oleh tim creative director,
senior product designer, frontend architect, motion designer, dan
pengguna siswa SMA/SMK sekaligus.

**Jangan sekadar membuat website yang "lebih bagus". Ciptakan pengalaman
digital yang punya karakter, ritme, kejutan, dan alasan untuk diingat.**
Setiap scroll harus terasa dirancang. Setiap animasi harus memiliki
tujuan. Setiap detail harus memperkuat identitas SI-RAJU. RAJU harus
terasa hidup, bukan tempelan. Namun, jangan sampai estetika mengalahkan
kejelasan, aksesibilitas, performa, atau fungsi rekomendasi.

Gunakan penilaian profesionalmu untuk mengambil keputusan kreatif
terbaik. Implementasikan langsung sampai tuntas di repository yang
tersedia, lalu verifikasi hasilnya. Jika suatu teknik atau tooling tidak
tersedia, cari alternatif yang paling masuk akal dan teruskan
pekerjaan---jangan berhenti hanya karena pendekatan pertama tidak dapat
digunakan.
