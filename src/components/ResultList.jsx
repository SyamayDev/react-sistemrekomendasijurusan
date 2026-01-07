import PercentageBar from "./PercentageBar";
import './ResultList.css';

export default function ResultList({ list }) {
  return (
    <div className="result-list">
      {list.map((m, index) => (
        <div key={m.id} className="result-row animate-slide-in-up" style={{ animationDelay: `${index * 50}ms` }}>
          <div className="row-left">
            <div className="major-name">{m.nama_jurusan}</div>
            <div className="major-cat">{m.kategori}</div>
          </div>
          <div className="row-right">
            <PercentageBar percent={m.score} />
          </div>
        </div>
      ))}
    </div>
  );
}
