/**
 * ResultReveal — a short, skippable "analysis" sequence before the results:
 * the owl thinks, the steps tick by, the universe brightens and finally the
 * student's star is spotlit. Calm and cinematic, never confetti. ~2.6 s.
 */
import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import OwlMascot from "../ui/OwlMascot.jsx";
import { setScene } from "../../lib/sceneStore.js";

export default function ResultReveal({ steps, onDone, highlight, focus }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    setScene({ energy: 0.2, focus: focus.map((f) => f * 0.4) });
    const timers = steps.map((_, i) =>
      setTimeout(() => {
        setStep(i);
        setScene({ energy: 0.25 + (i / steps.length) * 0.7, focus: focus.map((f) => f * (0.4 + (i / steps.length) * 0.6)) });
      }, i * 650)
    );
    const end = setTimeout(() => {
      setScene({ highlight, energy: 1 });
      onDone();
    }, steps.length * 650 + 300);
    return () => [...timers, end].forEach(clearTimeout);
  }, [steps, onDone, highlight, focus]);

  return (
    <m.div
      role="dialog"
      aria-modal="true"
      aria-label="Menganalisis jawabanmu"
      className="fixed inset-0 z-70 grid place-items-center bg-night-950/85 px-6 text-center backdrop-blur-xl"
      data-theme="dark"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div>
        <div className="relative mx-auto grid size-44 place-items-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="3" />
            <m.circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#FFC53D"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: (steps.length * 650 + 200) / 1000, ease: [0.45, 0, 0.2, 1] }}
              style={{ filter: "drop-shadow(0 0 6px rgb(255 197 61 / 0.8))" }}
            />
          </svg>
          <OwlMascot mood="thinking" interactive={false} className="h-28 w-auto" />
        </div>
        <div className="relative mt-8 h-8" aria-live="polite">
          <AnimatePresence mode="wait">
            <m.p
              key={step}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.35 }}
              className="text-lg font-semibold text-white"
            >
              {steps[step]}
            </m.p>
          </AnimatePresence>
        </div>
        <button type="button" autoFocus onClick={onDone} className="mt-10 text-sm font-semibold text-ink-muted underline-offset-4 hover:text-white hover:underline">
          Lewati animasi
        </button>
      </div>
    </m.div>
  );
}
