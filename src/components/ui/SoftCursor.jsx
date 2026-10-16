/**
 * A soft halo that trails the (still visible) native cursor on desktop and
 * blooms over interactive elements. Purely decorative: aria-hidden, no
 * pointer events, disabled for touch and reduced-motion users.
 */
import { useEffect, useRef } from "react";
import { hasFinePointer, prefersReducedMotion } from "../../lib/device.js";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, label, summary";

export default function SoftCursor() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;
    let x = -100, y = -100, tx = -100, ty = -100, raf = 0, scale = 1, ts = 1;
    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      scale += (ts - scale) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(ts - scale) > 0.1 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      el.style.opacity = "1";
      const hot = e.target instanceof Element && e.target.closest(INTERACTIVE);
      ts = hot ? 1.9 : 1;
      el.dataset.hot = hot ? "true" : "false";
      kick();
    };
    const onLeave = () => (el.style.opacity = "0");
    const onDown = () => {
      ts = 0.8;
      kick();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-100 size-8 rounded-full border border-primary/40 opacity-0 mix-blend-normal transition-[opacity,background-color,border-color] duration-300 data-[hot=true]:border-sun/70 data-[hot=true]:bg-sun/10 dark:border-white/30 max-md:hidden"
      style={{ transform: "translate3d(-100px,-100px,0)" }}
    />
  );
}
