/**
 * Fixed backdrop behind every page. A CSS sky (matching the 3D sky) paints
 * instantly; the 3D world is layered on top:
 *   • home page: loaded straight away behind the "Memuat Semesta" screen,
 *     which only lifts once the world is ready (lib/loader3d.js)
 *   • test & result pages: loaded quietly right after the page settles
 * Only reduced motion, no WebGL or a software renderer keep the static art
 * (lib/device.js → canRender3D).
 */
import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router";
import { useTheme } from "../../lib/theme.js";
import { scene, setScene, subscribeScene } from "../../lib/sceneStore.js";
import { canRender3D } from "../../lib/device.js";
import { beginLoad, cancelLoad, failLoad, finishLoad, prefetch3D, stepProgress } from "../../lib/loader3d.js";

const loadStage = () => import("../three/Stage.jsx");
const Stage = lazy(loadStage);

function modeFor(pathname) {
  if (pathname === "/") return "story";
  if (pathname.startsWith("/tes")) return "quiz";
  if (pathname.startsWith("/hasil")) return "result";
  return "off";
}

/** Home: download (with progress) and evaluate the 3D code, then mount the stage. */
async function loadForStory(mount) {
  beginLoad();
  // Without the prerendered chunk list (dev server) the download has no byte
  // count — ease the two download steps forward until the import resolves.
  let eased = 0;
  const ease = setInterval(() => {
    eased += (0.9 - eased) * 0.08;
    stepProgress("engine", eased);
    stepProgress("world", eased * 0.8);
  }, 120);
  try {
    const counted = await prefetch3D().catch(() => false);
    if (counted) clearInterval(ease);
    await loadStage();
    clearInterval(ease);
    stepProgress("engine", 1);
    stepProgress("world", 1);
    mount();
  } catch {
    clearInterval(ease);
    failLoad();
  }
}

export default function Backdrop() {
  const { pathname } = useLocation();
  const theme = useTheme();
  const mode = modeFor(pathname);
  const [want3D, setWant3D] = useState(false);
  const started = useRef(false);
  const ready = useSyncExternalStore(subscribeScene, () => scene.ready, () => false);
  // "Lanjut tanpa 3D" after a failed load: drop the world for this visit.
  const skipped = useSyncExternalStore(subscribeScene, () => scene.load.state === "skipped", () => false);

  useEffect(() => {
    if (mode === "off" || started.current) return;
    if (!canRender3D()) {
      cancelLoad();
      return;
    }
    started.current = true;
    if (mode === "story") {
      loadForStory(() => setWant3D(true));
      return;
    }
    // Test & result pages: no loader screen — the world fades in once the page has settled.
    cancelLoad();
    const start = () => setWant3D(true);
    if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 1200 });
    else setTimeout(start, 300);
  }, [mode]);

  // The world drew its first frame: lift the loader screen.
  useEffect(() => {
    if (ready) finishLoad();
  }, [ready]);

  useEffect(() => {
    setScene({ mode, palette: theme === "dark" ? "night" : "dawn", visible: mode !== "off" });
  }, [mode, theme]);

  // Lets CSS hide the static fallback art once the live world is on screen.
  useEffect(() => {
    document.documentElement.classList.toggle("has-3d", ready && mode !== "off");
  }, [ready, mode]);

  return (
    <div aria-hidden="true" className={`fixed inset-0 -z-10 transition-opacity duration-700 ${mode === "off" ? "opacity-0" : "opacity-100"}`}>
      <div className="sky absolute inset-0" />
      <div className="stars-layer absolute inset-0 opacity-60 dark:opacity-70" />
      {want3D && !skipped && mode !== "off" && (
        // .world-layer fades the world out as the home story ends (--story-out, scrollStory.js).
        <div className="world-layer absolute inset-0">
          <div className={`absolute inset-0 transition-opacity duration-1400 ease-out ${ready ? "opacity-100" : "opacity-0"}`}>
            <Suspense fallback={null}>
              <Stage />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
