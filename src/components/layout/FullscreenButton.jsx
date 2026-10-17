/** Full-screen toggle. Hidden where the browser can't do it (e.g. iPhone Safari). */
import { Maximize2, Minimize2 } from "lucide-react";
import { toggleFullscreen, useFullscreen } from "../../lib/fullscreen.js";

export default function FullscreenButton({ className = "" }) {
  const { available, active } = useFullscreen();
  if (!available) return null;
  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      className={`btn btn-ghost btn-icon ${className}`}
      aria-pressed={active}
      aria-label="Layar penuh"
      title={active ? "Keluar dari layar penuh" : "Layar penuh"}
    >
      {active ? <Minimize2 size={18} aria-hidden="true" /> : <Maximize2 size={18} aria-hidden="true" />}
    </button>
  );
}
