/**
 * Answer controls for every question type, built on native radio/checkbox
 * inputs (free keyboard + screen-reader support). The selected option is
 * marked by a single highlight that glides between choices using a shared
 * layoutId — the "morph" you feel when changing your mind.
 */
import { m } from "motion/react";
import { Check } from "lucide-react";
import Icon from "../ui/Icon.jsx";
import { spawnRipple } from "./ripple.js";

const KEYS = "ABCDEFGHI";

function Highlight({ id }) {
  return (
    <m.span
      layoutId={id}
      aria-hidden="true"
      className="absolute inset-0 rounded-[inherit] bg-primary-soft ring-2 ring-primary"
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
    />
  );
}

/** Radio / yes-no / checkbox list. */
export function ChoiceList({ q, value, onChange, onPick, labelledBy }) {
  const multi = q.tipe === "checkbox";
  const picked = multi ? (Array.isArray(value) ? value : []) : [];
  const atMax = multi && picked.length >= (q.max || q.opsi.length);
  const twoCol = q.tipe === "yesno" || q.opsi.length >= 6;

  const toggle = (i) => {
    if (!multi) return onChange(i);
    const next = picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i].sort((a, b) => a - b);
    onChange(next);
  };

  return (
    <div role={multi ? "group" : "radiogroup"} aria-labelledby={labelledBy} className={`grid gap-3 ${twoCol ? "sm:grid-cols-2" : ""}`}>
      {q.opsi.map((o, i) => {
        const selected = multi ? picked.includes(i) : value === i;
        const disabled = multi && atMax && !selected;
        return (
          <m.label
            key={o.label}
            whileTap={disabled ? undefined : { scale: 0.985 }}
            onPointerDown={disabled ? undefined : spawnRipple}
            className={`group relative flex min-h-[3.75rem] items-center gap-4 overflow-hidden rounded-2xl border px-4 py-3 text-left transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-[2.5px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)] ${
              selected ? "border-transparent" : "border-line bg-surface hover:border-primary/40 hover:bg-surface-2"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input
              type={multi ? "checkbox" : "radio"}
              name={q.id}
              value={i}
              checked={selected}
              disabled={disabled}
              onChange={() => toggle(i)}
              onClick={(e) => !multi && e.detail > 0 && onPick?.()}
              className="sr-only"
            />
            {selected && <Highlight id={multi ? `hl-${q.id}-${i}` : `hl-${q.id}`} />}
            <span
              aria-hidden="true"
              className={`relative grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold transition-all duration-300 ${
                selected ? "bg-primary text-on-primary" : "bg-surface-2 text-ink-muted group-hover:text-primary"
              }`}
            >
              {o.ikon ? <Icon name={o.ikon} size={18} /> : KEYS[i]}
            </span>
            <span className="relative flex-1 font-semibold leading-snug text-ink">{o.label}</span>
            <span
              aria-hidden="true"
              className={`relative grid size-6 shrink-0 place-items-center rounded-full border-2 transition-all duration-300 ease-out-back ${
                selected ? "scale-100 border-primary bg-primary text-on-primary" : "scale-90 border-line text-transparent"
              } ${multi ? "rounded-md" : ""}`}
            >
              <Check size={14} strokeWidth={3} />
            </span>
            <kbd aria-hidden="true" className="relative hidden rounded-md border border-line px-1.5 text-[0.7rem] font-semibold text-ink-soft lg:inline">
              {i + 1}
            </kbd>
          </m.label>
        );
      })}
    </div>
  );
}

/** 1–5 scale with labelled ends. */
export function ScaleInput({ q, value, onChange, onPick, labelledBy }) {
  return (
    <div>
      <div role="radiogroup" aria-labelledby={labelledBy} className="grid grid-cols-5 gap-2 sm:gap-3">
        {q.opsi.map((o, i) => {
          const selected = value === i;
          const label = i === 0 ? `1 — ${q.skala[0]}` : i === 4 ? `5 — ${q.skala[1]}` : String(i + 1);
          return (
            <m.label
              key={o.label}
              whileTap={{ scale: 0.94 }}
              onPointerDown={spawnRipple}
              className={`relative grid aspect-square max-h-24 w-full place-items-center overflow-hidden rounded-2xl border text-xl font-extrabold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-[2.5px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)] sm:text-2xl ${
                selected ? "border-transparent text-primary" : "border-line bg-surface text-ink-muted hover:border-primary/40 hover:text-ink"
              }`}
            >
              <input
                type="radio"
                name={q.id}
                value={i}
                checked={selected}
                onChange={() => onChange(i)}
                onClick={(e) => e.detail > 0 && onPick?.()}
                className="sr-only"
                aria-label={label}
              />
              {selected && <Highlight id={`hl-${q.id}`} />}
              <span aria-hidden="true" className="relative">
                {i + 1}
              </span>
              {/* intensity dots */}
              <span aria-hidden="true" className="absolute bottom-2 flex gap-0.5">
                {Array.from({ length: i + 1 }, (_, d) => (
                  <span key={d} className={`size-1 rounded-full ${selected ? "bg-primary" : "bg-line"}`} />
                ))}
              </span>
            </m.label>
          );
        })}
      </div>
      <div aria-hidden="true" className="mt-3 flex justify-between text-sm font-medium text-ink-soft">
        <span>{q.skala[0]}</span>
        <span>{q.skala[1]}</span>
      </div>
    </div>
  );
}

/** Optional free text with tap-to-add suggestions. */
export function TextAnswer({ q, value = "", onChange, labelledBy }) {
  const has = (s) => value.toLowerCase().includes(s.toLowerCase());
  const toggle = (s) => {
    if (has(s)) {
      onChange(
        value
          .split(",")
          .map((x) => x.trim())
          .filter((x) => x && x.toLowerCase() !== s.toLowerCase())
          .join(", ")
      );
    } else {
      onChange(value.trim() ? `${value.trim().replace(/,$/, "")}, ${s}` : s);
    }
  };
  return (
    <div>
      <textarea
        aria-labelledby={labelledBy}
        aria-describedby={`${q.id}-hint`}
        value={value}
        maxLength={200}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        placeholder={q.placeholder}
        className="w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3.5 text-base text-ink placeholder:text-ink-soft focus:border-primary focus:outline-none focus-visible:outline-none focus:ring-4 focus:ring-primary/15"
      />
      <div className="mt-1 flex justify-between text-xs text-ink-soft">
        <span id={`${q.id}-hint`}>Ketuk saran untuk menambahkan.</span>
        <span aria-live="polite">{value.length}/200</span>
      </div>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Saran hobi">
        {q.saran.map((s) => (
          <li key={s}>
            <button
              type="button"
              aria-pressed={has(s)}
              onClick={() => toggle(s)}
              className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition-all duration-300 ${
                has(s) ? "border-primary bg-primary text-on-primary" : "border-line bg-surface text-ink-muted hover:border-primary/40 hover:text-ink"
              }`}
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
