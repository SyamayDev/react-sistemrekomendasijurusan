import { useState } from "react";
import { useLocation } from "react-router-dom";
import ResultHighlight from "../components/ResultHighlight";
import ResultList from "../components/ResultList";
import { generateInsight } from "../utils/generateInsight";
import ShareResult from "../components/ShareResult";
import './Result.css';

export default function Result({ resultState }) {
  const loc = useLocation();
  const data = resultState || loc.state || null;
  const [showAllMajors, setShowAllMajors] = useState(false);

  if (!data)
    return (
      <div className="container">
        <div className="empty card">
            <h2>Hasil Tidak Ditemukan</h2>
            <p>
                Kami tidak dapat menemukan hasil tes Anda. Silakan kembali ke halaman utama dan ikuti tes untuk melihat rekomendasi jurusan.
            </p>
        </div>
      </div>
    );

  const top3 = data.ranked.slice(0, 3);

  return (
    <div className="result-page container">
      <div className="animate-fade-in">
        <h2>Hasil Rekomendasi Jurusan Anda</h2>
        <ShareResult />
      </div>
      
      <section className="top-recos">
        {top3.map((m, index) => (
          <div key={m.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 150}ms` }}>
            <ResultHighlight
              major={m}
              score={m.score}
              insight={generateInsight(m.nama_jurusan)}
              rank={index + 1}
            />
          </div>
        ))}
      </section>

      {!showAllMajors && (
        <div className="show-more-button-container">
          <button className="button-primary" onClick={() => setShowAllMajors(true)}>
            Lihat Rekomendasi Jurusan Lainnya
          </button>
        </div>
      )}

      {showAllMajors && (
        <section className="all-list animate-fade-in" style={{ animationDelay: '600ms' }}>
          <h3>Perbandingan Seluruh Jurusan</h3>
          <ResultList list={data.ranked} />
        </section>
      )}

      <section className="interpretation animate-fade-in" style={{ animationDelay: '800ms' }}>
        <h4>Interpretasi Akademik</h4>
        <p>
          Persentase menunjukkan tingkat kecocokan profil pengguna dengan
          karakteristik jurusan berdasarkan hobi, kebiasaan, dan karakter.
        </p>
      </section>
    </div>
  );
}
