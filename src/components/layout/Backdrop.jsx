/**
 * Fixed backdrop behind every page. A CSS sky (matching the 3D sky) paints
 * instantly and *is* the no-WebGL fallback; the 3D world is layered on top:
 *   • home page: loaded straight away behind the "Memuat Semesta" screen,
 *     which only lifts once the world is ready (lib/loader3d.js)
 *   • test & result pages: streamed in quietly after the first interaction
 * No WebGL, reduced motion, data saver, very weak/software GPUs or the 3D
 * switch turned off → the static art stays and nothing heavy is loaded.
 */
import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router";
import { useTheme } from "../../lib/theme.js";
import { scene, setScene, subscribeScene } from "../../lib/sceneStore.js";
import { canRender3D, get3DPref, hasFinePointer, deviceTier } from "../../lib/device.js";
import { beginLoad, cancelLoad, failLoad, finishLoad, prefetch3D, stepProgress } from "../../lib/loader3d.js";

const loadStage = () => import("../three/Stage.jsx");
const Stage = lazy(loadStage);
const TRIGGERS = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"];

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
  const pref = useSyncExternalStore(subscribeScene, () => scene.pref3d, () => "auto");

  useEffect(() => setScene({ pref3d: get3DPref() }), []);

  // Switching 3D off unmounts the world; switching it back on loads it again.
  const show3D = want3D && pref !== "off";

  useEffect(() => {
    if (pref === "off") started.current = false;
    if (mode === "off" || pref === "off" || started.current) return;
    if (!canRender3D()) {
      cancelLoad();
      return;
    }
    if (mode === "story") {
      started.current = true;
      loadForStory(() => setWant3D(true));
      return;
    }
    // Test & result pages: no loader screen — the world joins after the first interaction.
    cancelLoad();
    let idle = 0;
    const go = () => {
      TRIGGERS.forEach((t) => window.removeEventListener(t, go));
      clearTimeout(idle);
      if (started.current) return;
      started.current = true;
      const start = () => setWant3D(true);
      if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 800 });
      else setTimeout(start, 120);
    };
    TRIGGERS.forEach((t) => window.addEventListener(t, go, { passive: true }));
    if (hasFinePointer() && deviceTier() === "high") idle = setTimeout(go, 1800);
    return () => {
      clearTimeout(idle);
      TRIGGERS.forEach((t) => window.removeEventListener(t, go));
    };
  }, [mode, pref]);

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
      {show3D && mode !== "off" && (
        <div className={`absolute inset-0 transition-opacity duration-1400 ease-out ${ready ? "opacity-100" : "opacity-0"}`}>
          <Suspense fallback={null}>
            <Stage />
          </Suspense>
        </div>
      )}
    </div>
  );
}
