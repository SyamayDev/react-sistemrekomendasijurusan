/**
 * RIASEC radar: a hexagon per Holland's model. Series grow out of the centre,
 * axis labels are focusable buttons that explain each interest type, and a
 * visually-hidden table carries the same numbers for screen readers.
 */
import { useState } from "react";
import { m } from "motion/react";
import { RIASEC } from "../../lib/riasec.js";

const SIZE = 320;
const C = SIZE / 2;
const R = 112;
const angle = (i) => (Math.PI * 2 * i) / RIASEC.length - Math.PI / 2;
const point = (i, v) => [C + Math.cos(angle(i)) * R * v, C + Math.sin(angle(i)) * R * v];
const toPoints = (values) => RIASEC.map((d, i) => point(i, Math.max(0.06, values[d.key] || 0)).join(",")).join(" ");

/**
 * @param {{ series: { label: string, values: Record<string, number>, color: string, dashed?: boolean }[] }} props
 */
export default function RadarChart({ series, caption, className = "" }) {
  const [active, setActive] = useState(null);
  const activeDim = RIASEC.find((d) => d.key === active);

  return (
    <figure className={`relative ${className}`}>
      <div className="relative mx-auto w-full max-w-[22rem]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full overflow-visible" role="img" aria-label={caption}>
          {[0.25, 0.5, 0.75, 1].map((lvl) => (
            <polygon
              key={lvl}
              points={RIASEC.map((_, i) => point(i, lvl).join(",")).join(" ")}
              fill={lvl === 1 ? "color-mix(in oklab, var(--primary) 4%, transparent)" : "none"}
              stroke="var(--line)"
              strokeWidth="1"
            />
          ))}
          {RIASEC.map((d, i) => {
            const [x, y] = point(i, 1);
            return <line key={d.key} x1={C} y1={C} x2={x} y2={y} stroke="var(--line)" strokeWidth="1" />;
          })}
          {series.map((s, si) => (
            <m.g
              key={s.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 + si * 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: `${C}px ${C}px` }}
            >
              <polygon
                points={toPoints(s.values)}
                fill={s.dashed ? "none" : `color-mix(in oklab, ${s.color} 22%, transparent)`}
                stroke={s.color}
                strokeWidth={s.dashed ? 2 : 2.5}
                strokeDasharray={s.dashed ? "6 5" : undefined}
                strokeLinejoin="round"
              />
              {!s.dashed &&
                RIASEC.map((d, i) => {
                  const [x, y] = point(i, Math.max(0.06, s.values[d.key] || 0));
                  return (
                    <circle key={d.key} cx={x} cy={y} r={active === d.key ? 6 : 4} fill={s.color} stroke="var(--surface)" strokeWidth="2" />
                  );
                })}
            </m.g>
          ))}
        </svg>
        {/* Axis labels as real buttons, positioned over the SVG. */}
        {RIASEC.map((d, i) => {
          const [x, y] = point(i, 1.27);
          return (
            <button
              key={d.key}
              type="button"
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-xs font-bold transition-colors sm:text-[0.8rem] ${
                active === d.key ? "bg-primary text-on-primary" : "text-ink-muted hover:text-ink"
              }`}
              style={{ left: `${(x / SIZE) * 100}%`, top: `${(y / SIZE) * 100}%` }}
              onMouseEnter={() => setActive(d.key)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(d.key)}
              onBlur={() => setActive(null)}
              aria-describedby={active === d.key ? "radar-tip" : undefined}
            >
              {d.nama}
            </button>
          );
        })}
      </div>
      <div
        id="radar-tip"
        role="status"
        className={`pointer-events-none absolute inset-x-6 bottom-0 rounded-2xl bg-surface/95 p-3 text-center text-sm text-ink-muted shadow-lift ring-1 ring-line backdrop-blur transition-all duration-300 ${
          activeDim ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {activeDim && (
          <>
            <strong className="text-ink">
              {activeDim.nama} <span className="font-medium text-ink-soft">({activeDim.holland})</span>
            </strong>{" "}
            — {activeDim.deskripsi}
          </>
        )}
      </div>
      <figcaption className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-muted">
        {series.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-2">
            <span
              className="h-2.5 w-5 rounded-full"
              style={s.dashed ? { border: `2px dashed ${s.color}` } : { background: s.color }}
              aria-hidden="true"
            />
            {s.label}
          </span>
        ))}
      </figcaption>
      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Tipe minat</th>
            {series.map((s) => (
              <th key={s.label} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RIASEC.map((d) => (
            <tr key={d.key}>
              <th scope="row">{d.nama}</th>
              {series.map((s) => (
                <td key={s.label}>{Math.round((s.values[d.key] || 0) * 100)}%</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
