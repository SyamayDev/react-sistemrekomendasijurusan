/**
 * Tiny keyframe engine for scroll-driven scenes.
 * `story` is continuous: chapter i spans [i, i + 1). Each chapter "settles"
 * at i + SETTLE (when its sticky stage pins) and holds until the next one.
 */
export const SETTLE = 0.25;

export const smooth = (x) => x * x * (3 - 2 * x);
export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a, b, t) => a + (b - a) * t;

/** Progress through a chapter's pinned phase (0 at pin start → 1 at release). */
export const pinProgress = (story, chapter) => clamp01((story - chapter - SETTLE) / (1 - SETTLE));

/** How "present" a chapter is: fades in while entering, out while the next one enters. */
export function presence(story, chapter, { fadeIn = SETTLE, fadeOut = SETTLE } = {}) {
  const local = story - chapter;
  if (local < 0) return clamp01(1 + local / fadeIn) * (local > -fadeIn ? 1 : 0);
  if (local < 1) return 1;
  return clamp01(1 - (local - 1) / fadeOut);
}

/**
 * Hold-and-move track. `states[i]` is the value for chapter i (number or array).
 * The value moves from chapter i to i+1 while chapter i+1 enters.
 */
export function chapterTrack(states) {
  const n = states.length;
  return (story, out) => {
    // Clamp the chapter index, not the story value: the last chapter still
    // needs its own local progress to finish moving into place.
    const i = Math.max(0, Math.min(n - 1, Math.floor(story)));
    const local = Math.max(0, story - i);
    // chapter i is settled after SETTLE; during [i, i+SETTLE) we move from i-1 → i
    let a = i;
    let b = i;
    let t = 0;
    if (local < SETTLE && i > 0) {
      a = i - 1;
      b = i;
      t = smooth(local / SETTLE);
    }
    const A = states[a];
    const B = states[b];
    if (typeof A === "number") return lerp(A, B, t);
    out = out || new Array(A.length);
    for (let k = 0; k < A.length; k++) out[k] = lerp(A[k], B[k], t);
    return out;
  };
}

/** Damped approach (frame-rate independent). */
export const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));
