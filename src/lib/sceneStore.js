/**
 * Tiny external store shared by the DOM and the WebGL world.
 * The world reads it every frame inside useFrame (no React re-renders);
 * React only subscribes to the few fields that change the render tree.
 */
const listeners = new Set();

export const scene = {
  /** "story" (home) | "quiz" | "result" | "off" */
  mode: "off",
  /** "night" (midnight world) | "dawn" (icy-light world) */
  palette: "night",
  /** Backdrop is showing (route has a sky). */
  visible: false,
  /** Home: the story stage is on screen (pause rendering under FAQ/footer). */
  inView: true,
  /** Home scroll story — continuous, chapter i spans [i, i+1). Written by scrollStory.js. */
  story: 0,
  /** Active step per chapter index (written by scrollStory.js). */
  steps: {},
  /** Home, stacked layout (< lg): the free band above each chapter's text
   *  panel, as viewport fractions — header bottom, and panel top per chapter. */
  bandTop: 0.08,
  bandBottom: [],
  /** Semesta chapter: selected rumpun index (0–7) or -1. */
  selectedRumpun: -1,
  /** performance.now() of the last RAJU wing gesture request (CTA hover, test start). */
  flapAt: -1,
  /** performance.now() of the last answer ripple (quiz). */
  pulseAt: -1,
  /** Overall liveliness 0..1 (quiz progress, result). */
  energy: 0,
  /** Quiz: per-rumpun emphasis 0..1 in CATEGORY_IDS order. */
  focus: [0, 0, 0, 0, 0, 0, 0, 0],
  /** Result: index in majors.json of the #1 match, or -1. */
  highlight: -1,
  /** The WebGL world has drawn its first frame. */
  ready: false,
  /** Loader screen state (lib/loader3d.js): { state: idle|loading|done|failed|skipped, pct, steps[] }. */
  load: { state: "idle", pct: 0, steps: [0, 0, 0, 0, 0] },
  /** Hold RAJU's entrance until the loader screen has lifted. */
  introHold: false,
};

export function setScene(patch) {
  let changed = false;
  for (const [k, v] of Object.entries(patch)) {
    if (scene[k] !== v) {
      scene[k] = v;
      changed = true;
    }
  }
  if (changed) listeners.forEach((l) => l());
}

/** Should the WebGL loop be running right now? */
export const isSceneActive = () => scene.visible && scene.mode !== "off" && (scene.mode !== "story" || scene.inView);

const now = () => (typeof performance !== "undefined" ? performance.now() : 0);
export const pulseScene = () => (scene.pulseAt = now());
/** Ask RAJU for a wing gesture (e.g. when a CTA is hovered or the test starts). */
export const rajuFlap = () => (scene.flapAt = now());

export function subscribeScene(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Pointer in normalised device coords (-1..1), tracked once for everyone. */
export const pointer = { x: 0, y: 0, active: false };
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.active = e.pointerType === "mouse";
    },
    { passive: true }
  );
}
