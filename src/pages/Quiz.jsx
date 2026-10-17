/**
 * The test. Intro → 20 questions → hand-off to the cinematic result.
 *  • progress autosaves (resume any time, even after closing the tab)
 *  • pointer picks on single-choice questions auto-advance (announced up front)
 *  • keyboard: 1–9 selects, Enter continues; native radios handle arrows
 *  • every answer ripples through the background universe and nudges the
 *    fields that are starting to match
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { m } from "motion/react";
import { ArrowLeft, ArrowRight, Clock, CornerDownLeft, Lock, RotateCcw, Sparkles, X } from "lucide-react";
import MorphingQuestionCard from "../components/quiz/MorphingQuestionCard.jsx";
import OwlMascot from "../components/ui/OwlMascot.jsx";
import Logo from "../components/ui/Logo.jsx";
import ThemeToggle from "../components/layout/ThemeToggle.jsx";
import { getModel, questions } from "../lib/recommender.js";
import { isAnswered } from "../lib/engine.js";
import { CATEGORY_IDS } from "../lib/categories.js";
import { storage, KEYS } from "../lib/storage.js";
import { useStored, notifyStored } from "../lib/useStored.js";
import { useSeo } from "../lib/seo.jsx";
import { pulseScene, rajuFlap, setScene } from "../lib/sceneStore.js";
import { prefersReducedMotion } from "../lib/device.js";
import MotionProvider from "../components/MotionProvider.jsx";

const TOTAL = questions.length;
const ADVANCE_DELAY = 480;

/** Turn partial answers into per-field emphasis for the background stars. */
function sceneFocus(answers) {
  const { categories } = getModel().recommend(answers);
  const scores = categories.map((c) => c.score);
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  return CATEGORY_IDS.map((id) => {
    const s = categories.find((c) => c.id === id)?.score ?? min;
    return max > min ? Math.pow((s - min) / (max - min), 2.2) : 0;
  });
}

function QuizIntro({ saved, onStart, onResume }) {
  const facts = [
    { Icon: Sparkles, text: `${TOTAL} pertanyaan tentang minat, kepribadian & gaya kerja` },
    { Icon: Clock, text: "Sekitar 4 menit — progres tersimpan otomatis" },
    { Icon: Lock, text: "Dihitung di perangkatmu, jawaban tidak dikirim ke server" },
  ];
  return (
    <div className="container-x grid min-h-svh items-center py-28">
      <div className="absolute inset-x-0 top-0">
        <div className="container-x flex h-[var(--header-h)] items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
      </div>
      <div className="mx-auto w-full max-w-2xl text-center">
        <OwlMascot className="fade-up float-y mx-auto h-36 w-auto" style={{ "--i": 0 }} />
        <h1 className="display fade-up mt-6 text-[clamp(2.2rem,6vw,3.6rem)]" style={{ "--i": 1 }}>
          Tes Minat Bakat <span className="text-gradient-brand">Jurusan Kuliah</span>
        </h1>
        <p className="fade-up mx-auto mt-4 max-w-lg text-lg text-ink-muted" style={{ "--i": 2 }}>
          Tidak ada jawaban benar atau salah. Pilih yang paling menggambarkan dirimu <em>hari ini</em>, bukan yang menurutmu
          diharapkan orang lain.
        </p>
        <ul className="fade-up mx-auto mt-8 grid max-w-lg gap-3 text-left" style={{ "--i": 3 }}>
          {facts.map(({ Icon, text }) => (
            <li key={text} className="glass flex items-center gap-3 rounded-2xl px-4 py-3 text-ink-muted">
              <Icon size={18} aria-hidden="true" className="shrink-0 text-primary" />
              {text}
            </li>
          ))}
        </ul>
        <p className="fade-up mx-auto mt-5 max-w-lg text-sm text-ink-soft" style={{ "--i": 4 }}>
          Tips: pada soal pilihan tunggal, mengetuk jawaban akan langsung membawamu ke soal berikutnya. Gunakan tombol
          “Kembali” kapan saja untuk mengubah jawaban.
        </p>
        <div className="fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ "--i": 5 }}>
          {saved ? (
            <>
              <button type="button" onClick={onResume} className="btn btn-sun btn-lg">
                Lanjutkan · soal {Math.min(saved.index + 1, TOTAL)} dari {TOTAL} <ArrowRight size={18} aria-hidden="true" />
              </button>
              <button type="button" onClick={onStart} className="btn btn-ghost btn-lg">
                <RotateCcw size={18} aria-hidden="true" /> Mulai dari awal
              </button>
            </>
          ) : (
            <button type="button" onClick={onStart} className="btn btn-sun btn-lg">
              Mulai tes sekarang <ArrowRight size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuizTopBar({ index, progress, bab, owlMood }) {
  return (
    <div className="glass fixed inset-x-0 top-0 z-40 border-b border-line">
      <div className="container-x flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 rounded-xl font-extrabold tracking-tight" aria-label="SI-RAJU — kembali ke beranda (progres tersimpan)">
          <OwlMascot mood={owlMood} tilt={false} className="h-9 w-auto" />
          <span className="hidden sm:inline">SI-RAJU</span>
        </Link>
        <div className="flex-1">
          <div className="mb-1.5 flex justify-between text-xs font-semibold text-ink-soft">
            <span>{bab}</span>
            <span>
              {index + 1} / {TOTAL}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Progres tes"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-valuetext={`Pertanyaan ${index + 1} dari ${TOTAL}`}
            className="relative h-2 overflow-hidden rounded-full bg-surface-2"
          >
            <m.div
              className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-primary via-[#9b7bff] to-sun"
              initial={false}
              animate={{ width: `${Math.max(3, progress * 100)}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
            >
              <span aria-hidden="true" className="absolute right-0 top-1/2 size-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-sun shadow-[0_0_14px_4px_rgb(255_197_61/0.7)]" />
            </m.div>
          </div>
        </div>
        <Link to="/" className="btn btn-ghost btn-icon" aria-label="Keluar dari tes (progres tersimpan)">
          <X size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function QuizPage() {
  useSeo({
    title: "Tes Minat Bakat Jurusan Kuliah Gratis (20 Soal)",
    path: "/tes/",
    description:
      "Kerjakan tes minat bakat 20 soal (±4 menit) dan dapatkan rekomendasi jurusan kuliah yang paling cocok dari 150 jurusan, lengkap dengan alasan dan profil RIASEC-mu.",
  });

  const navigate = useNavigate();
  const saved = useStored(KEYS.progress);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [owlMood, setOwlMood] = useState("idle");
  const [moved, setMoved] = useState(false);
  const timer = useRef(0);
  const moodTimer = useRef(0);

  const q = questions[index];
  const value = answers[q.id];
  const valid = isAnswered(q, value);
  const isLast = index === TOTAL - 1;
  const answeredCount = useMemo(() => questions.filter((x) => x.tipe !== "text" && isAnswered(x, answers[x.id])).length, [answers]);
  const progress = (index + (valid ? 1 : 0)) / TOTAL;

  useEffect(
    () => () => {
      [timer, moodTimer].forEach((t) => clearTimeout(t.current));
      setScene({ energy: 0, focus: [0, 0, 0, 0, 0, 0, 0, 0] });
    },
    []
  );

  // Persist progress after every change.
  useEffect(() => {
    if (!started) return;
    storage.set(KEYS.progress, { answers, index, updatedAt: Date.now() });
  }, [answers, index, started]);

  // Quiz progress feeds the universe's energy.
  useEffect(() => {
    setScene({ energy: started ? 0.15 + (answeredCount / TOTAL) * 0.6 : 0 });
  }, [answeredCount, started]);

  const begin = (resume) => {
    if (resume && saved) {
      setAnswers(saved.answers || {});
      setIndex(Math.min(saved.index || 0, TOTAL - 1));
    } else {
      storage.remove(KEYS.progress);
      setAnswers({});
      setIndex(0);
    }
    setStarted(true);
    rajuFlap(); // RAJU cheers the student on as the test begins
    window.scrollTo({ top: 0 });
  };

  const finish = useCallback(
    (final) => {
      storage.set(KEYS.result, { answers: final, completedAt: Date.now() });
      storage.remove(KEYS.progress);
      notifyStored();
      navigate("/hasil/", { state: { fresh: true } });
    },
    [navigate]
  );

  const go = useCallback(
    (delta) => {
      clearTimeout(timer.current);
      setDirection(delta);
      setMoved(true);
      setIndex((i) => Math.min(TOTAL - 1, Math.max(0, i + delta)));
      if (window.scrollY > 120) window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    },
    []
  );

  const next = useCallback(() => {
    if (!isAnswered(q, answers[q.id])) return;
    if (isLast) finish(answers);
    else go(1);
  }, [q, answers, isLast, finish, go]);

  const onChange = (v) => {
    clearTimeout(timer.current);
    const nextAnswers = { ...answers, [q.id]: v };
    setAnswers(nextAnswers);
    if (q.tipe !== "text") {
      pulseScene();
      setScene({ focus: sceneFocus(nextAnswers) });
      setOwlMood("happy");
      clearTimeout(moodTimer.current);
      moodTimer.current = setTimeout(() => setOwlMood("idle"), 700);
    }
  };

  // Pointer pick on a single-choice question → advance after a beat.
  const onPick = () => {
    if (isLast) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => go(1), ADVANCE_DELAY);
  };

  // Keyboard shortcuts.
  useEffect(() => {
    if (!started) return;
    const onKey = (e) => {
      if (e.target instanceof HTMLTextAreaElement || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter" && !(e.target instanceof HTMLButtonElement) && !(e.target instanceof HTMLAnchorElement)) {
        e.preventDefault();
        next();
        return;
      }
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && q.opsi && n <= q.opsi.length) {
        const i = n - 1;
        if (q.tipe === "checkbox") {
          const cur = Array.isArray(value) ? value : [];
          if (cur.includes(i)) onChange(cur.filter((x) => x !== i));
          else if (cur.length < q.max) onChange([...cur, i].sort((a, b) => a - b));
        } else {
          onChange(i);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!started) return <QuizIntro saved={saved?.answers ? saved : null} onStart={() => begin(false)} onResume={() => begin(true)} />;

  return (
    <div className="min-h-svh pb-36 pt-24 sm:pb-24 sm:pt-28">
      <h1 className="sr-only">Tes Minat Bakat SI-RAJU</h1>
      <QuizTopBar index={index} progress={progress} bab={q.bab} owlMood={owlMood} />
      <p className="sr-only" aria-live="polite">
        Pertanyaan {index + 1} dari {TOTAL}
      </p>

      <div className="container-x">
        <div className="mx-auto max-w-2xl">
          <MorphingQuestionCard
            q={q}
            index={index}
            total={TOTAL}
            value={value}
            onChange={onChange}
            onPick={onPick}
            direction={direction}
            focusOnChange={moved}
          />

          <div className="glass fixed inset-x-0 bottom-0 z-30 border-t border-line px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
              <button type="button" onClick={() => go(-1)} disabled={index === 0} className="btn btn-ghost">
                <ArrowLeft size={18} aria-hidden="true" /> Kembali
              </button>
              <span className="hidden items-center gap-1.5 text-xs text-ink-soft lg:inline-flex">
                tekan <kbd className="rounded-md border border-line px-1.5 py-0.5 font-sans">Enter</kbd>
                <CornerDownLeft size={12} aria-hidden="true" />
              </span>
              <button type="button" onClick={next} disabled={!valid} className={`btn ${isLast ? "btn-sun" : "btn-primary"} min-w-36`}>
                {isLast ? "Lihat hasilku" : q.tipe === "text" && !value ? "Lewati" : "Lanjut"}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Quiz(props) {
  return (
    <MotionProvider>
      <QuizPage {...props} />
    </MotionProvider>
  );
}
