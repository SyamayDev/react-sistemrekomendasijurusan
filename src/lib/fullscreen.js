/** Fullscreen API helpers (with the webkit-prefixed fallback for older Safari/iPadOS). */
import { useEffect, useState } from "react";
import { useHydrated } from "./useHydrated.js";

const supported = () => Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled);
const current = () => document.fullscreenElement || document.webkitFullscreenElement || null;

export function toggleFullscreen() {
  const el = document.documentElement;
  if (current()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  else Promise.resolve((el.requestFullscreen || el.webkitRequestFullscreen).call(el, { navigationUI: "hide" })).catch(() => {});
}

/**
 * { available, active }. Rendered from the first paint (no layout shift when
 * the app hydrates); only browsers that can't go fullscreen (e.g. iPhone) drop it.
 */
export function useFullscreen() {
  const hydrated = useHydrated();
  const [active, setActive] = useState(false);
  useEffect(() => {
    const sync = () => setActive(Boolean(current()));
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);
  return { available: !hydrated || supported(), active };
}
