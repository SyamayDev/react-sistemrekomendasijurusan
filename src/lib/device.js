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

/* ---------- the visitor's 3D preference ----------
 * "auto" (default) | "on" (forced, e.g. via the 3D toggle) | "off".
 * The inline head script in index.html reads the same key, so keep them in sync. */
const PREF_KEY = "siraju:3d";

export function get3DPref() {
  try {
    return localStorage.getItem(PREF_KEY) || "auto";
  } catch {
    return "auto";
  }
}

export function set3DPref(value) {
  try {
    if (value === "auto") localStorage.removeItem(PREF_KEY);
    else localStorage.setItem(PREF_KEY, value);
  } catch {
    /* private mode: the choice lasts for this page view only */
  }
}

/** `?3d=on` / `?3d=off` in the URL sets the preference (handy for support and testing). */
export function apply3DQuery() {
  const m = typeof location !== "undefined" && location.search.match(/[?&]3d=(on|off|auto)\b/);
  if (m) set3DPref(m[1]);
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
 * Should this visitor get the live 3D world?
 * Never with reduced motion or without WebGL. By default also not on data
 * saver, very low-end devices or software-rendered WebGL (a few frames per
 * second would make the scroll story worse than the static version) — unless
 * the visitor switched 3D on explicitly.
 */
export function canRender3D() {
  if (typeof window === "undefined") return false;
  const pref = get3DPref();
  if (pref === "off" || prefersReducedMotion()) return false;
  const forced = pref === "on";
  if (!forced && (navigator.connection?.saveData || deviceTier() === "low")) return false;
  const { webgl, software } = probeGpu();
  return webgl && (forced || !software);
}
