/** Capability checks used to decide how much visual richness a device gets. */
const mq = (q) => typeof window !== "undefined" && window.matchMedia?.(q).matches;

export const prefersReducedMotion = () => mq("(prefers-reduced-motion: reduce)");
export const hasFinePointer = () => mq("(hover: hover) and (pointer: fine)");

/** "high" desktop GPUs, "mid" phones/laptops, "low" = very modest hardware (lightest 3D settings). */
export function deviceTier() {
  if (typeof navigator === "undefined") return "mid";
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  if (cores <= 2 || memory <= 2) return "low";
  if (mq("(pointer: coarse)") || cores <= 4 || memory <= 4) return "mid";
  return "high";
}

/* ---------- testing/support override ----------
 * `?3d=on` forces the 3D world (even on software WebGL), `?3d=off` skips it,
 * for this tab only (sessionStorage). The inline head script in index.html
 * reads the same key, so keep them in sync. */
const KEY = "siraju:3d";

export function get3DOverride() {
  try {
    return sessionStorage.getItem(KEY) || "auto";
  } catch {
    return "auto";
  }
}

export function apply3DQuery() {
  try {
    // An older build remembered "3D off" for good; the 3D world is now always on.
    localStorage.removeItem(KEY);
    const m = location.search.match(/[?&]3d=(on|off|auto)\b/);
    if (m) sessionStorage.setItem(KEY, m[1]);
  } catch {
    /* storage unavailable */
  }
}

let gpu; // { webgl: boolean, software: boolean } — probed once
function probeGpu() {
  if (gpu) return gpu;
  gpu = { webgl: false, software: false };
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (gl) {
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || "");
      gpu = { webgl: true, software: /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer) };
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    /* no WebGL */
  }
  return gpu;
}

/**
 * Does this visitor get the live 3D world? Yes, whenever the device has a
 * real GPU behind WebGL. The only exceptions: reduced motion (accessibility),
 * no WebGL at all, or a software renderer that draws a few frames per second
 * (the scroll story would stutter) — unless forced with `?3d=on`.
 */
export function canRender3D() {
  if (typeof window === "undefined") return false;
  const override = get3DOverride();
  if (override === "off" || prefersReducedMotion()) return false;
  const { webgl, software } = probeGpu();
  return webgl && (override === "on" || !software);
}
