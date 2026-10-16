/** Soft ink ripple from the pointer position (DOM-only, self-cleaning). */
export function spawnRipple(e) {
  const host = e.currentTarget;
  if (!host || e.button > 0) return;
  const r = host.getBoundingClientRect();
  const size = Math.max(r.width, r.height) * 2.2;
  const dot = document.createElement("span");
  dot.setAttribute("aria-hidden", "true");
  dot.className = "pointer-events-none absolute rounded-full bg-primary/25";
  Object.assign(dot.style, {
    width: `${size}px`,
    height: `${size}px`,
    left: `${e.clientX - r.left}px`,
    top: `${e.clientY - r.top}px`,
    animation: "ripple 650ms cubic-bezier(0.16,1,0.3,1) forwards",
  });
  host.appendChild(dot);
  dot.addEventListener("animationend", () => dot.remove(), { once: true });
}
