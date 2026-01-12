import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import ResultHighlight from "../components/ResultHighlight";
import ResultList from "../components/ResultList";
import { generateInsight } from "../utils/generateInsight";
import AnimateOnScroll from "../components/AnimateOnScroll";
import "./Result.css"; // Reuse existing styles

function getResultDataFromURL(searchParams) {
  try {
    const dataStr = searchParams.get("data");
    if (!dataStr) return null;
    const decoded = atob(dataStr);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to parse result data from URL:", error);
    return null;
  }
}

export default function ShareableResultPage() {
  const [searchParams] = useSearchParams();
  const data = getResultDataFromURL(searchParams);

  if (!data || !data.ranked) {
    return (
      <div className="result-page">
        <div className="empty-state animate-enter">
          <h2>⚠️ Hasil Tidak Valid</h2>
          <p style={{ color: "#64748b" }}>
            Link hasil tes ini sepertinya rusak atau tidak lengkap.
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
            Ikuti Tes Sekarang
          </Link>
        </div>
      </div>
    );
  }

  const top3 = data.ranked.slice(0, 3);

  return (
    <div className="result-page">
      <header className="result-header animate-enter">
        <h2>Peta Masa Depanmu</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: '2rem' }}>
          Berikut adalah hasil analisis minat, bakat, dan karakter yang telah dibagikan.
        </p>
        <Link to="/" className="btn-explore">
            Ikuti Tes untuk Versimu
        </Link>
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

      <section className="container-glass animate-enter">
        <h3 className="section-title">Analisis Lengkap</h3>
        <ResultList list={data.ranked} />
      </section>

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
