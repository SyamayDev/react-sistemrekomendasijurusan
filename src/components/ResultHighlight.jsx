import './ResultHighlight.css';

export default function ResultHighlight({ major, score, insight }) {
  return (
    <div className="result-card card">
      <h3>{major.nama_jurusan}</h3>
      <div className="big-score">{Math.round(score)}%</div>
      <p className="description">{major.deskripsi}</p>
      <p className="insight">{insight}</p>
    </div>
  );
}
