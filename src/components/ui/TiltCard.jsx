/**
 * Soft 3D tilt + glare that follows the pointer. CSS custom properties are
 * written directly to the element, so tilting never re-renders React.
 */
import { useRef } from "react";
import { hasFinePointer, prefersReducedMotion } from "../../lib/device.js";

export default function TiltCard({ as: Tag = "div", max = 7, className = "", children, style, ...rest }) {
  const ref = useRef(null);
  const enabled = () => hasFinePointer() && !prefersReducedMotion();

  const onMove = (e) => {
    const el = ref.current;
    if (!el || !enabled()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--tx", `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
    el.style.setProperty("--ty", `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tx", "0deg");
    el.style.setProperty("--ty", "0deg");
  };

  return (
    <Tag
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group/tilt relative [transform:perspective(1000px)_rotateY(var(--tx,0deg))_rotateX(var(--ty,0deg))] transition-transform duration-500 ease-out-expo will-change-transform ${className}`}
      style={style}
      {...rest}
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/tilt:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--gx,50%) var(--gy,50%), rgb(255 255 255 / 0.14), transparent 45%)" }}
      />
    </Tag>
  );
}
