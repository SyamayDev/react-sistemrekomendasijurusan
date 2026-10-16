/**
 * Fixed backdrop behind every page. A CSS night sky / dawn gradient paints
 * instantly (it *is* the fallback), and the WebGL universe streams in on top
 * only after the visitor interacts — so three.js never competes with the
 * first paint, and low-end / reduced-motion / data-saver devices skip it.
 */
import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useTheme } from "../../lib/theme.js";
import { setScene } from "../../lib/sceneStore.js";
import { canRender3D } from "../../lib/device.js";

const Background3D = lazy(() => import("../three/Background3D.jsx"));
const TRIGGERS = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"];

function backdropVariant(pathname, theme) {
  if (pathname === "/") return "night";
  if (pathname.startsWith("/tes") || pathname.startsWith("/hasil")) return theme === "dark" ? "night" : "dawn";
  return "off";
}

export default function Backdrop() {
  const { pathname } = useLocation();
  const theme = useTheme();
  const variant = backdropVariant(pathname, theme);
  const [want3D, setWant3D] = useState(false);

  useEffect(() => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      TRIGGERS.forEach((t) => window.removeEventListener(t, go));
      // Let the interaction's own work finish first.
      const start = () => canRender3D() && setWant3D(true);
      if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 800 });
      else setTimeout(start, 120);
    };
    TRIGGERS.forEach((t) => window.addEventListener(t, go, { passive: true }));
    return () => TRIGGERS.forEach((t) => window.removeEventListener(t, go));
  }, []);

  useEffect(() => {
    setScene({ palette: variant === "dawn" ? "dawn" : "night", visible: variant !== "off" });
  }, [variant]);

  return (
    <div aria-hidden="true" className={`fixed inset-0 -z-10 transition-opacity duration-700 ${variant === "off" ? "opacity-0" : "opacity-100"}`}>
      <div className={`backdrop-night absolute inset-0 transition-opacity duration-700 ${variant === "night" ? "opacity-100" : "opacity-0"}`} />
      <div className={`backdrop-dawn absolute inset-0 transition-opacity duration-700 ${variant === "dawn" ? "opacity-100" : "opacity-0"}`} />
      <div className={`stars-layer absolute inset-0 transition-opacity duration-1000 ${variant === "night" ? "opacity-70" : "opacity-0"}`} />
      {want3D && variant !== "off" && (
        <Suspense fallback={null}>
          <Background3D />
        </Suspense>
      )}
    </div>
  );
}
