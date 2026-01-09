export function calculateScore(answers, questions, majors) {
  const scores = {};
  const maxPossible = {};

  majors.forEach((m) => {
    scores[m.id] = 0;
    maxPossible[m.id] = 0;
  });

  questions.forEach((q) => {
    const response = answers[q.id];
    const weights = q.bobot_jurusan || {};

    // --- LOGIKA 1: Pertanyaan Sederhana dengan Matriks Bobot ---
    if (Object.keys(weights).length > 0) {
      const maxOpt =
        q.opsi && q.opsi.length
          ? Math.max(...q.opsi.map((o) => o.value || 0))
          : 0;

      majors.forEach((m) => {
        const w = weights[m.id] || 0;
        if (w > 0) {
          // Untuk pertanyaan sederhana, max score adalah bobot itu sendiri (diasumsikan jawaban maksimal/ratio=1)
          maxPossible[m.id] += w;
        }

        if (q.tipe === "text" || w === 0 || response == null) return;

        let selValue = 0;
        if (q.tipe === "yesno" || q.tipe === "scale" || q.tipe === "radio") {
          selValue = response.value || 0;
        } else if (q.tipe === "checkbox") {
          selValue = response.reduce((s, r) => s + (r.value || 0), 0);
        }

        const ratio = maxOpt > 0 ? Math.min(1, selValue / maxOpt) : 0;
        scores[m.id] += ratio * w;
      });
    }
    // --- LOGIKA 2: Pertanyaan Kompleks Berbasis Kecocokan Properti ---
    else {
      if (response == null) return;

      // Q4: Mencocokkan KARAKTER/SIFAT
      if (q.id === 'q4' && Array.isArray(response)) {
        const scorePerMatch = 1.5; // Skor tinggi untuk setiap karakter yang cocok
        const allPossibleKaraktersInQuestion = q.opsi.map(opt => opt.karakter);
        const selectedKarakters = response.map(opt => opt.karakter);

        majors.forEach(m => {
          const majorKarakters = m.karakter_cocok || [];
          // Max possible score dari soal ini adalah jumlah karakter jurusan yg ADA di opsi soal
          const possibleMatches = majorKarakters.filter(k => allPossibleKaraktersInQuestion.includes(k)).length;
          maxPossible[m.id] += possibleMatches * scorePerMatch;

          // Skor aktual adalah jumlah karakter jurusan yg DIPILIH user
          const actualMatches = majorKarakters.filter(k => selectedKarakters.includes(k)).length;
          scores[m.id] += actualMatches * scorePerMatch;
        });
      }

      // Q9: Mencocokkan KATEGORI JURUSAN
      if (q.id === 'q9' && response.kategori) {
        const categoryScore = 4.0; // Skor sangat tinggi karena ini pertanyaan minat utama
        const selectedCategory = response.kategori;

        majors.forEach(m => {
          // Setiap jurusan punya potensi untuk cocok di sini
          maxPossible[m.id] += categoryScore;

          const majorCategory = m.kategori;
          // Cek kecocokan, termasuk jika kategori di soal adalah array
          if (Array.isArray(selectedCategory) ? selectedCategory.includes(majorCategory) : selectedCategory === majorCategory) {
            scores[m.id] += categoryScore;
          }
        });
      }
      
      // Tambahkan logika untuk q13, q16, q19 di sini jika diperlukan
    }
  });

  return { scores, maxPossible };
}