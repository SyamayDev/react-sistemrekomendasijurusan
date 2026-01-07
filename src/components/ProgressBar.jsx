import './ProgressBar.css';

export default function ProgressBar({ percent = 0 }) {
  return (
    <div className="progress-wrap">
      <div className="progress" style={{ width: `${percent}%` }} />
    </div>
  );
}
