/**
 * Image-based lighting for RAJU's glossy materials, built procedurally (no HDR
 * download): a small "studio" of emissive softboxes around a gradient dome,
 * prefiltered with PMREM. The panels echo the scene lights — a warm key from
 * the front-left, cyan and lavender rims behind — so reflections agree with
 * the shading.
 *
 * Performance: PMREM's filter shaders (a 256-sample GGX loop) take ~0.7 s to
 * link on Windows/ANGLE when compiled synchronously, which froze the page
 * while the world loaded. We compile them in parallel first
 * (KHR_parallel_shader_compile via compileAsync), so the bake itself is quick.
 */
import {
  BackSide,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PMREMGenerator,
  PlaneGeometry,
  Scene,
  SphereGeometry,
} from "three";

const SIZE = 256;

function studioScene() {
  const scene = new Scene();
  const disposables = [];
  const keep = (x) => (disposables.push(x), x);

  // Dome: dark floor → soft horizon → brighter ceiling.
  const dome = keep(new SphereGeometry(10, 32, 16));
  const pos = dome.attributes.position;
  const colors = [];
  const c = new Color();
  const floor = new Color(0.02, 0.03, 0.07);
  const horizon = new Color(0.22, 0.25, 0.36);
  const ceiling = new Color(0.55, 0.58, 0.7);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 10;
    if (y < 0) c.copy(horizon).lerp(floor, Math.min(1, -y * 2.5));
    else c.copy(horizon).lerp(ceiling, Math.min(1, y * 1.4));
    colors.push(c.r, c.g, c.b);
  }
  dome.setAttribute("color", new Float32BufferAttribute(colors, 3));
  scene.add(new Mesh(dome, keep(new MeshBasicMaterial({ vertexColors: true, side: BackSide }))));

  // Softboxes (HDR: colours above 1 survive in the half-float target).
  const panel = (w, h, color, intensity, at) => {
    const m = new Mesh(keep(new PlaneGeometry(w, h)), keep(new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), side: DoubleSide })));
    m.position.set(...at);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  panel(5, 3.5, "#fff1de", 7, [-4.5, 5.5, 6]); // key
  panel(2.4, 5, "#7feeff", 4.5, [6, 2.5, -4.5]); // cyan rim
  panel(2.4, 5, "#b7a6ff", 3.2, [-6, 2, -4]); // lavender rim
  panel(7, 1.1, "#ffffff", 3, [0, 8, 1]); // ceiling strip

  return { scene, dispose: () => disposables.forEach((d) => d.dispose()) };
}

/**
 * Compiles materials in parallel where the GPU supports it; elsewhere a plain
 * compile (three would log a warning from compileAsync without the extension).
 */
export function compileQuietly(gl, object, camera, target) {
  if (gl.extensions.has("KHR_parallel_shader_compile")) return gl.compileAsync(object, camera, target);
  gl.compile(object, camera, target);
  return Promise.resolve();
}

/** Compile PMREM's filter shaders without blocking (private API in r182 — guarded). */
async function warmFilters(gl, pmrem) {
  if (typeof pmrem._setSize !== "function" || typeof pmrem._allocateTargets !== "function") return;
  pmrem._setSize(SIZE);
  const target = pmrem._allocateTargets();
  const group = new Group();
  for (const m of [pmrem._ggxMaterial, pmrem._blurMaterial]) if (m) group.add(new Mesh(new BufferGeometry(), m));
  // Same render-target state as the real filtering pass, so the programs match.
  const previous = gl.getRenderTarget();
  gl.setRenderTarget(target);
  const ready = compileQuietly(gl, group, new OrthographicCamera());
  gl.setRenderTarget(previous);
  await ready;
  target.dispose();
  group.children.forEach((m) => m.geometry.dispose());
}

/** Bakes the studio environment. Returns { texture, dispose }. */
export async function bakeEnvironment(gl) {
  const pmrem = new PMREMGenerator(gl);
  await warmFilters(gl, pmrem);
  await new Promise((r) => setTimeout(r, 0));
  const studio = studioScene();
  const target = pmrem.fromScene(studio.scene, 0.02, 0.1, 100, { size: SIZE });
  studio.dispose();
  pmrem.dispose();
  return { texture: target.texture, dispose: () => target.dispose() };
}
