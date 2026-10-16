/**
 * MagneticButton — the CTA leans toward the pointer with real spring physics,
 * its label drifts a little further (depth), a soft glow tracks the pointer
 * and a conic border "morphs" around it on hover.
 *
 * Implemented with a ~30-line rAF spring instead of an animation library so
 * the landing page's critical path stays tiny. Pointer-fine devices only;
 * touch and reduced-motion users get a normal, crisp button.
 */
import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { hasFinePointer, prefersReducedMotion } from "../../lib/device.js";

const STIFFNESS = 0.14;
const DAMPING = 0.72;

export default function MagneticButton({
  to,
  onClick,
  variant = "sun",
  size = "lg",
  strength = 0.32,
  reach = 80,
  className = "",
  children,
  ...rest
}) {
  const wrap = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;
    let x = 0, y = 0, vx = 0, vy = 0, tx = 0, ty = 0, raf = 0;

    const step = () => {
      vx = (vx + (tx - x) * STIFFNESS) * DAMPING;
      vy = (vy + (ty - y) * STIFFNESS) * DAMPING;
      x += vx;
      y += vy;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      label.current.style.transform = `translate3d(${(x * 0.45).toFixed(2)}px, ${(y * 0.45).toFixed(2)}px, 0)`;
      const moving = Math.abs(vx) + Math.abs(vy) + Math.abs(tx - x) + Math.abs(ty - y) > 0.03;
      raf = moving ? requestAnimationFrame(step) : 0;
    };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left - x + r.width / 2);
      const dy = e.clientY - (r.top - y + r.height / 2);
      const near = Math.abs(dx) < r.width / 2 + reach && Math.abs(dy) < r.height / 2 + reach;
      tx = near ? dx * strength : 0;
      ty = near ? dy * strength : 0;
      if (near) {
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
      if (!raf) raf = requestAnimationFrame(step);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [strength, reach]);

  const classes = `btn btn-${variant} ${size === "lg" ? "btn-lg" : ""} border-morph group/mag ${className}`;
  const inner = (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/mag:opacity-100"
        style={{ background: "radial-gradient(120px circle at var(--mx, 50%) var(--my, 50%), rgb(255 255 255 / 0.55), transparent 60%)" }}
      />
      <span ref={label} className="relative inline-flex items-center gap-2.5 will-change-transform">
        {children}
      </span>
    </>
  );

  return (
    <span ref={wrap} className="inline-flex will-change-transform">
      {to ? (
        <Link to={to} onClick={onClick} className={classes} {...rest}>
          {inner}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={classes} {...rest}>
          {inner}
        </button>
      )}
    </span>
  );
}
