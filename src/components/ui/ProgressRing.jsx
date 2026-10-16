/** Circular match meter: gradient arc that draws itself, with a soft glow. */
import { useId } from "react";
import { m } from "motion/react";

export default function ProgressRing({
  value,
  size = 168,
  stroke = 12,
  delay = 0.2,
  duration = 1.6,
  from = "#8CA2FF",
  to = "#FFC53D",
  track = "var(--line)",
  glow = true,
  children,
  className = "",
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const r = (size - stroke) / 2;
  return (
    <div className={`relative grid place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
          <filter id={`f${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={stroke * 0.55} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} opacity="0.7" />
        <m.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#g${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.max(0.001, value / 100) }}
          transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
          filter={glow ? `url(#f${id})` : undefined}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
