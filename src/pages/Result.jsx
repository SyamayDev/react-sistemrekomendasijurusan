import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import ResultHighlight from "../components/ResultHighlight";
import ResultList from "../components/ResultList";
import ShareResult from "../components/ShareResult";
import { generateInsight } from "../utils/generateInsight";
import AnimateOnScroll from "../components/AnimateOnScroll";
import "./Result.css";

export default function Result({ resultState }) {
  const loc = useLocation();
  const data = resultState || loc.state || null;
  const [showAllMajors, setShowAllMajors] = useState(false);

  if (!data)
    return (
      <div className="result-page">
        <div className="empty-state animate-enter">
          <h2>⚠️ Hasil Tidak Ditemukan</h2>
          <p style={{ color: "#64748b" }}>
            Maaf, data tes Anda belum tersedia. Silakan ikuti tes ulang.
          </p>
          <Link
            to="/"
            className="btn-explore"
            style={{
              marginTop: "1.5rem",
              display: "inline-block",
              textDecoration: "none",
            }}
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );

  const top3 = data.ranked.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="result-page">
      <header className="result-header animate-enter">
        <h2>Peta Masa Depanmu</h2>
        <p style={{ color: "var(--text-muted)" }}>
          Analisis akurat berdasarkan minat, bakat, dan karakter unikmu.
        </p>
        <div style={{ marginTop: "2rem" }}>
          <ShareResult shareUrl="https://syamaydev.github.io/react-sistemrekomendasijurusan/" />
        </div>
      </header>
      <section className="top-recos">
        {top3.map((m, index) => (
          <AnimateOnScroll
            key={m.id}
            className={`reco-card-wrapper rank-${index + 1}`}
            delay={index * 120}
          >
            <ResultHighlight
              major={m}
              score={m.score}
              insight={generateInsight(m.nama_jurusan)}
              rank={index + 1}
            />
          </AnimateOnScroll>
        ))}
      </section>

      {!showAllMajors && (
        <div
          className="show-more-container animate-enter"
          style={{ animationDelay: "500ms" }}
        >
          <button
            className="btn-explore"
            onClick={() => setShowAllMajors(true)}
          >
            🔍 Jelajahi Semua Opsi Jurusan
          </button>
        </div>
      )}

      {showAllMajors && (
        <section className="container-glass animate-enter">
          <h3 className="section-title">Analisis Lengkap</h3>
          <ResultList list={data.ranked} />
        </section>
      )}

      <section
        className="container-glass animate-enter"
        style={{ animationDelay: "600ms" }}
      >
        <h3 className="section-title">Interpretasi Akademik</h3>
        <p style={{ lineHeight: "1.7", color: "var(--text-muted)" }}>
          Angka persentase merepresentasikan{" "}
          <strong>Algorithmic Affinity Score</strong>. Semakin tinggi angkanya,
          semakin natural jurusan tersebut bagi pola pikir dan karakter bawah
          sadar Anda.
        </p>
      </section>
    </div>
  );
}
