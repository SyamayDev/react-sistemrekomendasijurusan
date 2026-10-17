/**
 * Fixed backdrop behind every page. A CSS sky (matching the 3D sky) paints
 * instantly and *is* the no-WebGL fallback; the 3D world streams in on top:
 *   • after the first interaction (scroll, pointer, touch, key), or
 *   • on idle for desktop-class devices, so the hero intro plays by itself.
 * Low-end, data-saver and reduced-motion visitors keep the static art.
 */
import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router";
import { useTheme } from "../../lib/theme.js";
import { scene, setScene, subscribeScene } from "../../lib/sceneStore.js";
import { canRender3D, deviceTier, hasFinePointer } from "../../lib/device.js";

const Stage = lazy(() => import("../three/Stage.jsx"));
const TRIGGERS = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"];

function modeFor(pathname) {
  if (pathname === "/") return "story";
  if (pathname.startsWith("/tes")) return "quiz";
  if (pathname.startsWith("/hasil")) return "result";
  return "off";
}

export default function Backdrop() {
  const { pathname } = useLocation();
  const theme = useTheme();
  const mode = modeFor(pathname);
  const [want3D, setWant3D] = useState(false);
  const ready = useSyncExternalStore(subscribeScene, () => scene.ready, () => false);

  useEffect(() => {
    let done = false;
    let idle = 0;
    const go = () => {
      if (done) return;
      done = true;
      TRIGGERS.forEach((t) => window.removeEventListener(t, go));
      clearTimeout(idle);
      const start = () => canRender3D() && setWant3D(true);
      if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 800 });
      else setTimeout(start, 120);
    };
    TRIGGERS.forEach((t) => window.addEventListener(t, go, { passive: true }));
    if (hasFinePointer() && deviceTier() === "high") idle = setTimeout(go, 1800);
    return () => {
      clearTimeout(idle);
      TRIGGERS.forEach((t) => window.removeEventListener(t, go));
    };
  }, []);

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
      {want3D && mode !== "off" && (
        <div className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${ready ? "opacity-100" : "opacity-0"}`}>
          <Suspense fallback={null}>
            <Stage />
          </Suspense>
        </div>
      )}
    </div>
  );
}
