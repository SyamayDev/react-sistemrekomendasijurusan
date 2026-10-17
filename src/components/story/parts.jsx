/** Shared building blocks for the home scroll story. */
import { hudRef } from "../three/world/hud.js";

/**
 * A story chapter: a tall section whose stage pins while the 3D world plays.
 * `h` = total scroll length (the stage itself is one viewport tall).
 */
export function Chapter({ index, id, h = "240svh", steps, scrim = "left", labelledBy, className = "", children }) {
  return (
    <section
      id={id}
      data-chapter={index}
      data-steps={steps}
      aria-labelledby={labelledBy}
      className={`chapter ${className}`}
      style={{ "--h": h }}
    >
      <div className={`stage scrim-${scrim}`}>{children}</div>
    </section>
  );
}

/** "02 / 06 — Kenali dirimu" mono chapter label. */
export function Kicker({ n, children, className = "" }) {
  return (
    <p className={`hud-label enter-fx flex items-center gap-3 text-ink-muted ${className}`} style={{ "--o": 0.3 }}>
      <span className="text-ink">
        <span className="text-sun-ink dark:text-sun">{String(n).padStart(2, "0")}</span> / 06
      </span>
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-50" />
      {children}
    </p>
  );
}

/**
 * Label pinned to a 3D object by the world's projector. Purely visual
 * (aria-hidden): every action it offers also exists as a real control.
 */
export function HudTag({ k, side = "right", i, onClick, children }) {
  return (
    <div ref={hudRef(k)} className="hud-anchor" data-hud={k} data-side={side} data-i={i} aria-hidden="true">
      <span className="hud-dot" />
      <span className="hud-line" />
      {onClick ? (
        <button type="button" tabIndex={-1} className="hud-tag" onClick={onClick}>
          {children}
        </button>
      ) : (
        <span className="hud-tag">{children}</span>
      )}
    </div>
  );
}

/** Splits a sentence into words that light up as the chapter is scrolled. */
export function ScrubText({ text, className = "" }) {
  const words = text.split(" ");
  return (
    <span className={className} style={{ "--n": words.length }}>
      {words.map((w, i) => (
        <span key={i} className="scrub-word" style={{ "--w": i }}>
          {w}{" "}
        </span>
      ))}
    </span>
  );
}
