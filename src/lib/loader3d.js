/**
 * Loading the 3D world behind the "Memuat Semesta" screen (home page).
 *
 * The world is made of a few real assets — the three.js engine and the world
 * code (downloaded), then RAJU + the 150 major cards (built), the studio
 * lighting (baked) and the shaders (compiled on the GPU). Each one reports its
 * progress here; the loader screen shows "n / 5 siap" and an overall
 * percentage, and only lifts once the world has drawn its first frame, so
 * nobody sees a half-built scene. If loading fails, the visitor can retry or
 * continue with the (complete) static story for this visit.
 *
 * Visibility is driven by html[data-load3d] (set by the inline head script at
 * first paint, then by this module), see .preloader in index.css.
 */
import { scene, setScene } from "./sceneStore.js";

export const LOAD_STEPS = [
  { id: "engine", label: "Mesin 3D (three.js)", weight: 0.42 },
  { id: "world", label: "Kode Semesta RAJU", weight: 0.14 },
  { id: "model", label: "Model RAJU & 150 kartu jurusan", weight: 0.14 },
  { id: "light", label: "Pencahayaan studio", weight: 0.1 },
  { id: "shader", label: "Shader & material", weight: 0.2 },
];
export const IDLE_LOAD = { state: "idle", pct: 0, steps: LOAD_STEPS.map(() => 0) };

const TIMEOUT = 45000;
let timer = 0;
let inerted = [];

const root = () => document.documentElement;

/** While the loader covers the page, the page behind it is out of reach (keyboard & screen readers). */
function setPageInert(on) {
  if (on) {
    inerted = [...document.querySelectorAll("#root > *:not(.preloader)")].filter((el) => !el.inert);
    inerted.forEach((el) => (el.inert = true));
  } else {
    inerted.forEach((el) => (el.inert = false));
    inerted = [];
  }
}

export function beginLoad() {
  clearTimeout(timer);
  setScene({ load: { state: "loading", pct: 0, steps: LOAD_STEPS.map(() => 0) }, introHold: true });
  root().dataset.load3d = "loading";
  setPageInert(Boolean(document.querySelector(".preloader")));
  timer = setTimeout(() => scene.load.state === "loading" && failLoad(), TIMEOUT);
}

/** Progress of one asset, 0..1 (only ever moves forward). */
export function stepProgress(id, fraction) {
  const load = scene.load;
  if (load.state !== "loading") return;
  const i = LOAD_STEPS.findIndex((s) => s.id === id);
  const f = Math.min(1, fraction);
  if (i < 0 || f <= load.steps[i]) return;
  const steps = load.steps.slice();
  steps[i] = f;
  setScene({ load: { ...load, steps, pct: LOAD_STEPS.reduce((sum, s, k) => sum + s.weight * steps[k], 0) } });
}

function release() {
  setPageInert(false);
  delete root().dataset.load3d;
  setScene({ introHold: false });
}

/** The world has drawn: show 100 %, lift the curtain, then let RAJU and the hero intro play. */
export function finishLoad() {
  if (scene.load.state !== "loading") return;
  clearTimeout(timer);
  setScene({ load: { state: "done", pct: 1, steps: LOAD_STEPS.map(() => 1) } });
  // The curtain fades for ~0.8 s (CSS); the headline (CSS, un-paused by "done")
  // and RAJU's reveal start as it lifts.
  if (root().dataset.load3d) root().dataset.load3d = "done";
  setTimeout(() => setScene({ introHold: false }), 450);
  setTimeout(release, 1350);
}

export function failLoad() {
  if (scene.load.state !== "loading") return;
  clearTimeout(timer);
  setScene({ load: { ...scene.load, state: "failed" } });
  if (root().dataset.load3d) root().dataset.load3d = "failed";
}

/** After a failure: continue with the static story for this visit (not remembered). */
export function continueWithout3D() {
  clearTimeout(timer);
  setScene({ load: { ...IDLE_LOAD, state: "skipped" } });
  release();
}

/** The loader screen mounted (home page): cover the page if the world is still loading. */
export function attachLoader() {
  const state = scene.load.state;
  if (state === "loading" || state === "failed") {
    root().dataset.load3d = state;
    if (!inerted.length) setPageInert(true);
  }
}

/** Leaving the home page mid-load (e.g. "Langsung mulai tes"): uncover, keep loading quietly. */
export function detachLoader() {
  if (scene.load.state === "loading" || scene.load.state === "failed") {
    setPageInert(false);
    delete root().dataset.load3d;
    setScene({ introHold: false });
  }
}

/** Nothing to load (no WebGL, reduced motion, 3D switched off…): drop the curtain at once. */
export function cancelLoad() {
  if (scene.load.state === "loading") return;
  clearTimeout(timer);
  if (root().dataset.load3d) release();
  else setScene({ introHold: false });
}

/**
 * Downloads the 3D chunks with byte progress. The prerenderer lists them in
 * <meta name="siraju:3d" content="url|bytes|group …">; the module import that
 * follows is then served from the HTTP cache. Returns false when the list is
 * missing (dev server) so the caller can fall back to a plain import.
 */
export async function prefetch3D() {
  const list = document.querySelector('meta[name="siraju:3d"]')?.content;
  if (!list) return false;
  const files = list.split(" ").map((entry) => {
    const [url, size, group] = entry.split("|");
    return { url, size: Number(size) || 1, group, got: 0 };
  });
  const groups = [...new Set(files.map((f) => f.group))];
  let queued = 0;
  const report = () => {
    queued = 0;
    for (const g of groups) {
      const mine = files.filter((f) => f.group === g);
      const total = mine.reduce((s, f) => s + f.size, 0);
      stepProgress(g, mine.reduce((s, f) => s + Math.min(f.got, f.size), 0) / total);
    }
  };
  const schedule = () => (queued ||= requestAnimationFrame(report));
  await Promise.all(
    files.map(async (f) => {
      const res = await fetch(f.url, { credentials: "same-origin" });
      if (!res.ok) throw new Error(`${res.status} ${f.url}`);
      if (res.body?.getReader) {
        const reader = res.body.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          f.got += value.length;
          schedule();
        }
      } else await res.arrayBuffer();
      f.got = f.size;
      schedule();
    })
  );
  report();
  return true;
}
