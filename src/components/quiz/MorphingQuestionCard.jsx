/**
 * MorphingQuestionCard — one card that *becomes* the next question. Its
 * height morphs to fit the new content (measured with ResizeObserver, so no
 * scale distortion), while the content slides in the direction of travel
 * with a gentle 3D turn. Focus moves to the new question for keyboard and
 * screen-reader users.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ChoiceList, ScaleInput, TextAnswer } from "./AnswerInputs.jsx";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const slide = {
  enter: (dir) => ({ opacity: 0, x: dir * 48, rotateY: dir * 10, filter: "blur(6px)" }),
  center: { opacity: 1, x: 0, rotateY: 0, filter: "blur(0px)" },
  exit: (dir) => ({ opacity: 0, x: dir * -48, rotateY: dir * -10, filter: "blur(6px)" }),
};

function useHeight() {
  const ref = useRef(null);
  const [h, setH] = useState(null);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setH(entry.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, h];
}

export default function MorphingQuestionCard({ q, index, total, value, onChange, onPick, direction, focusOnChange, children }) {
  const [inner, height] = useHeight();
  const headingRef = useRef(null);
  const headingId = `pertanyaan-${q.id}`;

  useEffect(() => {
    if (focusOnChange) headingRef.current?.focus({ preventScroll: true });
  }, [q.id, focusOnChange]);

  const hint =
    q.tipe === "checkbox" ? `Pilih ${q.min}–${q.max}. Terpilih ${Array.isArray(value) ? value.length : 0}.` : q.petunjuk;

  return (
    <m.div
      className="card glass relative overflow-hidden rounded-4xl shadow-lift [perspective:1200px]"
      animate={{ height: height ?? "auto" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div ref={inner}>
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <m.div
            key={q.id}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 sm:p-10"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">{q.bab}</span>
              <span>
                Pertanyaan {index + 1} <span className="text-ink-soft/70">/ {total}</span>
              </span>
            </p>
            <h2
              id={headingId}
              ref={headingRef}
              tabIndex={-1}
              className="mt-4 text-[clamp(1.35rem,3.2vw,1.9rem)] font-bold leading-snug tracking-tight text-ink focus:outline-none"
            >
              {q.pertanyaan}
            </h2>
            {hint && (
              <p className="mt-2 text-sm text-ink-muted" aria-live={q.tipe === "checkbox" ? "polite" : undefined}>
                {hint}
              </p>
            )}
            <div className="mt-7">
              {q.tipe === "scale" && <ScaleInput q={q} value={value} onChange={onChange} onPick={onPick} labelledBy={headingId} />}
              {(q.tipe === "radio" || q.tipe === "yesno" || q.tipe === "checkbox") && (
                <ChoiceList q={q} value={value} onChange={onChange} onPick={onPick} labelledBy={headingId} />
              )}
              {q.tipe === "text" && <TextAnswer q={q} value={value} onChange={onChange} labelledBy={headingId} />}
            </div>
            {children}
          </m.div>
        </AnimatePresence>
      </div>
    </m.div>
  );
}
