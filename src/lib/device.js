/** Capability checks used to decide how much visual richness a device gets. */
const mq = (q) => typeof window !== "undefined" && window.matchMedia?.(q).matches;

export const prefersReducedMotion = () => mq("(prefers-reduced-motion: reduce)");
export const hasFinePointer = () => mq("(hover: hover) and (pointer: fine)");

/** "high" desktop GPUs, "mid" phones/laptops, "low" = skip WebGL entirely. */
export function deviceTier() {
  if (typeof navigator === "undefined") return "mid";
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  if (cores <= 2 || memory <= 2) return "low";
  if (mq("(pointer: coarse)") || cores <= 4 || memory <= 4) return "mid";
  return "high";
}

export function canRender3D() {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion() || navigator.connection?.saveData) return false;
  if (deviceTier() === "low") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}
