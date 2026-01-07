import './PercentageBar.css';

export default function PercentageBar({ percent = 0 }) {
  return (
    <div className="pct-row">
      <div className="pct-label">{Math.round(percent)}%</div>
      <div className="pct-track">
        <div className="pct-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
