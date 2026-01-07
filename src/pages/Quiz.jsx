import { useEffect, useState } from "react";
import questionsData from "../data/questions.json";
import majorsData from "../data/majors.json";
import QuestionCard from "../components/QuestionCard";
import ProgressBar from "../components/ProgressBar";
import AnimatedButton from "../components/AnimatedButton";
import { useNavigate } from "react-router-dom";
import { calculateScore } from "../utils/calculateScore";
import { normalizeScore } from "../utils/normalizeScore";
import { rankMajors } from "../utils/rankMajors";
import './Quiz.css';

export default function Quiz({ onComplete }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setQuestions(questionsData);
  }, []);

  const q = questions[index];

  const handleAnswer = (val) => {
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
  };

  const canNext = () => {
    if (!q) return false;
    if (q.tipe === "text") return true;
    if (q.tipe === "checkbox")
      return Array.isArray(answers[q.id]) && answers[q.id].length > 0;
    return !!answers[q.id];
  };

  const next = () => {
    if (!canNext()) return;
    if (index < questions.length - 1) setIndex((i) => i + 1);
    else {
      // finish
      const { scores, maxPossible } = calculateScore(
        answers,
        questions,
        majorsData
      );
      const normalized = normalizeScore(scores, maxPossible);
      const ranked = rankMajors(normalized, majorsData);
      const result = { scores, maxPossible, normalized, ranked };
      if (onComplete) onComplete(result);
      navigate("/result", { state: result });
    }
  };

  const percent = questions.length
    ? Math.round((index / questions.length) * 100)
    : 0;

  return (
    <div className="quiz-page">
      <ProgressBar percent={percent} />
      {q ? (
        <QuestionCard q={q} value={answers[q.id]} onChange={handleAnswer} />
      ) : (
        <div>Memuat soal...</div>
      )}
      <div className="quiz-actions">
        <AnimatedButton onClick={next} className="primary">
          {index < questions.length - 1 ? "Next" : "Selesai"}
        </AnimatedButton>
      </div>
    </div>
  );
}
