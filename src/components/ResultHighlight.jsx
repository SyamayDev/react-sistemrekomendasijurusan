import './ResultHighlight.css';

export default function ResultHighlight({ major, score, insight, rank }) {
  // Menentukan emoji berdasarkan rank
  const badgeIcon = rank === 1 ? "👑" : rank === 2 ? "🥈" : "🥉";
  const cardClass = rank === 1 ? "highlight-card rank-1" : "highlight-card";

  return (
    <div className={cardClass}>
      <div className={`rank-badge badge-${rank}`}>
        <span className="badge-icon">{badgeIcon}</span> 
        <span>#{rank}</span>
      </div>
      
      <div className="card-content">
        <div className="score-ring-container">
            <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle" 
                    strokeDasharray={`${score}, 100`} 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                />
            </svg>
            <div className="score-text">
                <span className="score-val">{Math.round(score)}%</span>
                <span className="score-label">Match</span>
            </div>
        </div>

        <h3 className="major-title">{major.nama_jurusan}</h3>
        <span className="major-cat">{major.kategori}</span>
        
        <div className="tags-container">
            {major.karakter_cocok && major.karakter_cocok.slice(0,3).map((k, i) => (
                <span key={i} className="tag">{k}</span>
            ))}
        </div>

        <p className="insight-box">
            "{insight}"
        </p>
      </div>
    </div>
  );
}