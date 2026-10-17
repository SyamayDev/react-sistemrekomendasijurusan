/** The visitor's 3D on/off switch (shared by the header button and the menu). */
import { useSyncExternalStore } from "react";
import { useLocation } from "react-router";
import { scene, setScene, subscribeScene } from "./sceneStore.js";
import { prefersReducedMotion, set3DPref } from "./device.js";
import { skipLoad } from "./loader3d.js";
import { useHydrated } from "./useHydrated.js";

export function use3DSwitch() {
  const hydrated = useHydrated();
  const pref = useSyncExternalStore(subscribeScene, () => scene.pref3d, () => "auto");
  const { pathname } = useLocation();
  const withSky = pathname === "/" || pathname.startsWith("/tes") || pathname.startsWith("/hasil");
  const on = pref !== "off";
  const toggle = () => {
    if (on && (scene.load.state === "loading" || scene.load.state === "failed")) return skipLoad();
    const next = on ? "off" : "on";
    set3DPref(next);
    setScene({ pref3d: next });
  };
  // Only on pages with a sky, and never when the visitor asked for reduced motion
  // (known after hydration; rendered from the first paint so nothing shifts).
  return { available: withSky && (!hydrated || !prefersReducedMotion()), on, toggle };
}
