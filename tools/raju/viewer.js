import {
  ACESFilmicToneMapping,
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { createRaju, createRajuAnimator } from "../../src/components/three/raju/createRaju.js";
import { bakeEnvironment } from "../../src/components/three/world/environment.js";

const q = new URLSearchParams(location.search);
const size = Number(q.get("size") || 900);
const pose = q.get("pose") || "hero";
if (q.get("bg") === "1") document.body.classList.add("bg");

const renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(size, size);
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

const scene = new Scene();
// Same procedural studio lighting as the live world, so posters match it.
scene.environment = (await bakeEnvironment(renderer)).texture;
scene.environmentIntensity = 0.55;

scene.add(new HemisphereLight("#dfe6ff", "#1a1f4a", 0.7));
scene.add(new AmbientLight("#ffffff", 0.15));
const key = new DirectionalLight("#fff4e6", 2.4);
key.position.set(-3, 5, 6);
scene.add(key);
const rim = new DirectionalLight("#5ee7ff", 2.2);
rim.position.set(4, 3, -5);
scene.add(rim);
const rim2 = new DirectionalLight("#9c8cff", 1.4);
rim2.position.set(-5, 2, -4);
scene.add(rim2);

const raju = createRaju({ withPerch: q.get("perch") !== "0" });
scene.add(raju.root);
const anim = createRajuAnimator(raju);

const POSES = {
  hero: { yaw: -0.28, pitch: 0.02, expression: "idle", cam: [2.6, 2.1, 6.4], look: [0, 1.0, 0] },
  curious: { yaw: 0.35, expression: "curious", cam: [1.2, 1.8, 6.6], look: [0, 1.0, 0] },
  wave: { yaw: -0.15, expression: "happy", wave: 1, cam: [-1.4, 1.9, 6.6], look: [0, 1.0, 0] },
  happy: { yaw: 0, expression: "happy", cam: [0, 1.8, 6.6], look: [0, 1.0, 0] },
  thinking: { yaw: 0.25, expression: "thinking", cam: [1.6, 1.8, 6.6], look: [0, 1.0, 0] },
  front: { yaw: 0, expression: "idle", cam: [0, 1.6, 6.8], look: [0, 1.0, 0] },
  side: { yaw: 0, expression: "idle", cam: [6.6, 1.6, 0.5], look: [0, 1.0, 0] },
  back: { yaw: 0, expression: "idle", cam: [-2.5, 2.4, -6.2], look: [0, 1.0, 0] },
  mark: { yaw: 0, expression: "idle", cam: [0, 1.75, 5.6], look: [0, 1.25, 0] },
  // Website posters (fallback art): full body + perch with breathing room.
  "poster-hero": { yaw: -0.18, expression: "idle", rootY: -0.38, cam: [1.8, 2.1, 7.1], look: [0, 1.05, 0] },
  "poster-curious": { yaw: 0.32, expression: "curious", rootY: 0.12, cam: [1.1, 2.0, 7.1], look: [0, 1.05, 0] },
  "poster-wave": { yaw: 0, expression: "happy", wave: 1, rootY: 0, cam: [0, 1.9, 7.3], look: [0.15, 1.05, 0] },
  "poster-thinking": { yaw: 0.2, expression: "thinking", rootY: 0.28, cam: [1.0, 2.0, 7.1], look: [0, 1.05, 0] },
};
const p = POSES[pose] || POSES.hero;
raju.root.rotation.y = p.rootY || 0;
anim.pose(p);

const camera = new PerspectiveCamera(30, 1, 0.1, 100);
camera.position.set(...p.cam);
camera.lookAt(new Vector3(...p.look));

function render() {
  renderer.render(scene, camera);
}
render();

if (q.get("spin") === "1") {
  let t0 = performance.now();
  renderer.setAnimationLoop(() => {
    const t = (performance.now() - t0) / 1000;
    raju.root.rotation.y = t * 0.5;
    anim.update(1 / 60, t, { expression: p.expression, wave: p.wave });
    render();
  });
}

/** Called by the export script to grab a .glb of the model (without perch shadow). */
window.__exportGlb = async () => {
  const exporter = new GLTFExporter();
  const shadow = raju.root.getObjectByName("shadow");
  if (shadow) shadow.visible = false;
  const glb = await exporter.parseAsync(raju.root, { binary: true, onlyVisible: true });
  if (shadow) shadow.visible = true;
  return Array.from(new Uint8Array(glb));
};
window.__ready = true;
