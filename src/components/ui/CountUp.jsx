/** Number that counts up with an expo ease. Writes to the DOM directly (no re-renders). */
import { useEffect, useRef } from "react";
import { animate } from "motion/react";
import { prefersReducedMotion } from "../../lib/device.js";

export default function CountUp({ to, from = 0, duration = 1.6, delay = 0, suffix = "", className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = `${to}${suffix}`;
      return;
    }
    const controls = animate(from, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = `${Math.round(v)}${suffix}`),
    });
    return () => controls.stop();
  }, [to, from, duration, delay, suffix]);
  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {from}
        {suffix}
      </span>
      <span className="sr-only">
        {to}
        {suffix}
      </span>
    </span>
  );
}
