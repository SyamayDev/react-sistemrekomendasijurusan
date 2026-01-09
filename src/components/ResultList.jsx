import PercentageBar from "./PercentageBar";
import './ResultList.css';

export default function ResultList({ list }) {
  return (
    <div className="list-wrapper">
      {list.map((m, index) => (
        <div key={m.id} className="list-row animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
          <div className="list-info">
            <div className="list-name">{m.nama_jurusan}</div>
            <div className="list-cat">{m.kategori}</div>
          </div>
          <div className="list-bar">
            <PercentageBar percent={m.score} />
          </div>
        </div>
      ))}
    </div>
  );
}