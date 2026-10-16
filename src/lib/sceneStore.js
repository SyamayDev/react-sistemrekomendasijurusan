/**
 * Tiny external store shared by the DOM and the WebGL scene.
 * The scene reads it every frame inside useFrame (no React re-renders);
 * React only subscribes to the few fields that change the render tree.
 */
const listeners = new Set();

export const scene = {
  /** "hero" | "quiz" | "result" | "off" */
  mode: "off",
  /** "night" (additive glow) | "dawn" (soft ink on light backgrounds) */
  palette: "night",
  /** Backdrop is showing (route has a sky). */
  visible: false,
  /** Home hero is on screen (no point rendering stars hidden under sections). */
  heroInView: true,
  /** Per-category emphasis 0..1, in CATEGORY_IDS order. */
  focus: [0, 0, 0, 0, 0, 0, 0, 0],
  /** Index in majors.json of the star to spotlight, or -1. */
  highlight: -1,
  /** Overall liveliness 0..1 (quiz progress, result reveal). */
  energy: 0,
  /** performance.now() of the last answer ripple. */
  pulseAt: -1,
  /** 0..1 scroll progress through the hero. */
  heroScroll: 0,
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
export const isSceneActive = () =>
  scene.visible && scene.mode !== "off" && (scene.mode !== "hero" || scene.heroInView);

export function pulseScene() {
  scene.pulseAt = typeof performance !== "undefined" ? performance.now() : 0;
}

export function subscribeScene(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Pointer in normalised device coords (-1..1), tracked once for everyone. */
export const pointer = { x: 0, y: 0 };
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true }
  );
}
