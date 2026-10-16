/**
 * Raju — the SI-RAJU owl, drawn as inline SVG (~3 KB) so it can come alive:
 *  • pupils follow the pointer        • blinks on its own
 *  • 3D tilt toward the pointer       • tassel swings & wings flap on hover
 *  • moods: idle | thinking | happy   (happy = smiling ^^ eyes)
 * All motion is CSS-driven via custom properties written from one rAF loop,
 * so React never re-renders while the owl is moving.
 */
import { useEffect, useId, useRef } from "react";
import { prefersReducedMotion } from "../../lib/device.js";

const EYES = [73, 127];

function Eye({ cx, happy }) {
  if (happy) {
    return (
      <g transform={`translate(${cx} 106)`}>
        <circle r="22" fill="#0E1A47" />
        <path d="M-11 4 Q0 -10 11 4" fill="none" stroke="#FFC53D" strokeWidth="5" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g transform={`translate(${cx} 106)`}>
      <g className="owl-eye">
        <circle r="22" fill="#0E1A47" />
        <g className="owl-pupil">
          <rect x="-10" y="2" width="5" height="7" rx="1.2" fill="#FFC53D" />
          <rect x="-3" y="-3" width="5" height="12" rx="1.2" fill="#FFC53D" />
          <rect x="4" y="-8" width="5" height="17" rx="1.2" fill="#FFC53D" />
          <circle cx="7" cy="-11" r="4.6" fill="#fff" />
          <circle cx="-9" cy="-11" r="1.8" fill="#fff" opacity=".7" />
        </g>
      </g>
    </g>
  );
}

export default function OwlMascot({
  mood = "idle",
  interactive = true,
  tilt = true,
  className = "",
  title,
  ...rest
}) {
  const ref = useRef(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    const el = ref.current;
    if (!el || !interactive || prefersReducedMotion()) return;
    let raf = 0;
    let target = { x: 0, y: 0 };
    let hover = false;

    const onMove = (e) => {
      target = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(update);
    };
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.48;
      const dx = target.x - cx;
      const dy = target.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, dist / 260);
      el.style.setProperty("--ex", ((dx / dist) * 5 * reach).toFixed(2));
      el.style.setProperty("--ey", ((dy / dist) * 4.5 * reach).toFixed(2));
      if (tilt) {
        const k = hover ? 14 : 6;
        const nx = Math.max(-1, Math.min(1, dx / (r.width * 1.5)));
        const ny = Math.max(-1, Math.min(1, dy / (r.height * 1.5)));
        el.style.setProperty("--ry", `${(nx * k).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-ny * k).toFixed(2)}deg`);
      }
    };
    const enter = () => (hover = true);
    const leave = () => {
      hover = false;
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [interactive, tilt]);

  const happy = mood === "happy";
  const thinking = mood === "thinking";

  return (
    <svg
      ref={ref}
      viewBox="0 0 200 220"
      className={`owl ${className}`}
      data-mood={mood}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={thinking ? { "--ex": -3, "--ey": -4 } : undefined}
      {...rest}
    >
      <defs>
        <linearGradient id={`b${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24387F" />
          <stop offset="1" stopColor="#16245A" />
        </linearGradient>
        <linearGradient id={`y${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E4EBFB" />
        </linearGradient>
        <linearGradient id={`c${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1A2A66" />
          <stop offset="1" stopColor="#0D1740" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="211" rx="50" ry="5" fill="#0E1A47" opacity=".16" />
      <g className="owl-head">
        <path d="M46 78 C40 60 34 46 26 30 C44 36 60 46 72 58 Z" fill="#1B2B66" />
        <path d="M154 78 C160 60 166 46 174 30 C156 36 140 46 128 58 Z" fill="#1B2B66" />
        <path
          d="M100 42 C147 42 171 80 171 126 C171 175 140 207 100 207 C60 207 29 175 29 126 C29 80 53 42 100 42 Z"
          fill={`url(#b${uid})`}
        />
        <path
          d="M100 116 C128 116 148 136 148 164 C148 190 126 204 100 204 C74 204 52 190 52 164 C52 136 72 116 100 116 Z"
          fill={`url(#y${uid})`}
        />
        <g fill="none" stroke="#C3CFF2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M84 160 l6 5 l6 -5" />
          <path d="M104 160 l6 5 l6 -5" />
          <path d="M74 174 l6 5 l6 -5" />
          <path d="M94 174 l6 5 l6 -5" />
          <path d="M114 174 l6 5 l6 -5" />
          <path d="M84 188 l6 5 l6 -5" />
          <path d="M104 188 l6 5 l6 -5" />
        </g>
        <path className="owl-wing owl-wing-l" d="M33 114 C19 142 27 182 64 198 C55 176 51 150 57 126 C50 117 42 113 33 114 Z" fill="#132056" />
        <path className="owl-wing owl-wing-r" d="M167 114 C181 142 173 182 136 198 C145 176 149 150 143 126 C150 117 158 113 167 114 Z" fill="#132056" />
        <path
          d="M100 84 C89 68 67 63 52 72 C35 83 32 108 43 126 C54 144 82 148 100 135 C118 148 146 144 157 126 C168 108 165 83 148 72 C133 63 111 68 100 84 Z"
          fill="#FFFFFF"
          stroke="#D5DEF7"
          strokeWidth="2"
        />
        {EYES.map((cx) => (
          <Eye key={cx} cx={cx} happy={happy} />
        ))}
        <path
          d="M92.5 126 C96 121.5 104 121.5 107.5 126 L101.6 138.5 C100.9 140 99.1 140 98.4 138.5 Z"
          fill="#FFC53D"
          stroke="#E8A21A"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <g fill="#FFC53D" stroke="#E8A21A" strokeWidth="1">
          <ellipse cx="77" cy="206" rx="4.2" ry="5.2" />
          <ellipse cx="85" cy="207" rx="4.2" ry="5.2" />
          <ellipse cx="93" cy="206" rx="4.2" ry="5.2" />
          <ellipse cx="107" cy="206" rx="4.2" ry="5.2" />
          <ellipse cx="115" cy="207" rx="4.2" ry="5.2" />
          <ellipse cx="123" cy="206" rx="4.2" ry="5.2" />
        </g>
        <path d="M64 42 L64 60 C78 69 122 69 136 60 L136 42 L100 54 Z" fill="#101C4C" />
        <path d="M100 14 L158 33 L100 52 L42 33 Z" fill={`url(#c${uid})`} />
        <path d="M42 33 L100 14 L158 33" fill="none" stroke="#3A4F9E" strokeWidth="1.6" strokeLinejoin="round" />
        <g className="owl-tassel">
          <path d="M100 33 Q124 34 144 40 L144 60" fill="none" stroke="#FFC53D" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M139 58 h10 l1.5 14 c0 2 -13 2 -13 0 Z" fill="#FFC53D" stroke="#E8A21A" strokeWidth="1" />
        </g>
        <circle cx="100" cy="33" r="3.4" fill="#FFC53D" />
      </g>
    </svg>
  );
}
