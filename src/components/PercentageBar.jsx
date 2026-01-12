import './PercentageBar.css';

export default function PercentageBar({ percent = 0, isImageVersion = false }) {
  // Warna dinamis: Hijau jika tinggi, Kuning jika sedang, Abu jika rendah
  let colorClass = 'low';
  if (percent > 75) colorClass = 'high';
  else if (percent > 40) colorClass = 'med';

  if (isImageVersion) {
    return (
      <div className="pct-wrapper image-version">
        <div className="pct-track">
          <div 
              className={`pct-fill ${colorClass}`} 
              style={{ width: `${percent}%`, transition: 'none' }} 
          >
          </div>
        </div>
        <div className="pct-label">{Math.round(percent)}%</div>
      </div>
    );
  }

  return (
    <div className="pct-wrapper">
      <div className="pct-track">
        <div 
            className={`pct-fill ${colorClass}`} 
            style={{ width: `${percent}%` }} 
        >
            <div className="shine-effect"></div>
        </div>
      </div>
      <div className="pct-label">{Math.round(percent)}%</div>
    </div>
  );
}