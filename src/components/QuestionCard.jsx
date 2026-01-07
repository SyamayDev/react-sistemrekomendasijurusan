import OptionButton from "./OptionButton";
import './QuestionCard.css';

export default function QuestionCard({ q, value, onChange }) {
  return (
    <div className="question-card card animate-fade-in">
      <h3>{q.pertanyaan}</h3>
      <div className="options">
        {q.tipe === "text" && (
          <input
            className="text-input"
            placeholder="Jawaban singkat (opsional)"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
        {q.tipe === "yesno" || q.tipe === "scale" || q.tipe === "multiple"
          ? q.opsi.map((o, idx) => (
              <OptionButton
                key={idx}
                option={o}
                selected={
                  value && (value.value === o.value || value === o.value)
                }
                onClick={() => onChange(o)}
              />
            ))
          : null}
        {q.tipe === "checkbox" &&
          q.opsi.map((o, idx) => {
            const checked =
              Array.isArray(value) && value.find((v) => v.label === o.label);
            const toggle = () => {
              const next = Array.isArray(value) ? [...value] : [];
              const found = next.findIndex((v) => v.label === o.label);
              if (found >= 0) next.splice(found, 1);
              else next.push(o);
              onChange(next);
            };
            return (
              <OptionButton
                key={idx}
                option={o}
                checkbox
                checked={!!checked}
                onClick={toggle}
              />
            );
          })}
      </div>
    </div>
  );
}
