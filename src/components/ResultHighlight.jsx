import './ResultHighlight.css';

export default function ResultHighlight({ major, score, insight, rank }) {
  return (
    <div className={`result-card card rank-${rank}`}>
      {rank && <div className="rank-badge">Top {rank}</div>}
      <h3>{major.nama_jurusan}</h3>
      <p className="major-category">{major.kategori}</p>
      {major.karakter_cocok && major.karakter_cocok.length > 0 && (
        <p className="karakter-cocok">Cocok untuk: {major.karakter_cocok.join(", ")}</p>
      )}
      <div className="big-score">{Math.round(score)}%</div>
      <p className="description">{major.deskripsi}</p>
      <p className="insight">{insight}</p>
    </div>
  );
}
