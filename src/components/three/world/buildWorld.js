/**
 * "Semesta RAJU" — the persistent 3D world behind SI-RAJU.
 *
 * Built imperatively (one scene graph, one update per frame) and driven by
 * the shared scene store:
 *   story mode  → home scroll story, chapters 0–6
 *   quiz mode   → RAJU keeps the student company and reacts to answers
 *   result mode → RAJU celebrates; the student's top field glows
 *
 * The major tiles (one per major) are a single InstancedMesh whose layout morphs with the
 * story: halo → chaos (confusion) → orbits (order) → data wall (matching) →
 * clusters around 8 field planets → the rim of the closing portal.
 */
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  DirectionalLight,
  DynamicDrawUsage,
  Euler,
  Group,
  HemisphereLight,
  InstancedBufferAttribute,
  InstancedMesh,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NormalBlending,
  Object3D,
  PlaneGeometry,
  Points,
  Quaternion,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { createRaju, createRajuAnimator } from "../raju/createRaju.js";
import { pointer, scene as store } from "../../../lib/sceneStore.js";
import { chapterTrack, clamp01, damp, lerp, pinProgress, presence, SETTLE, smooth } from "./keys.js";
import {
  CATEGORY_RGB,
  CHAOS,
  CLUSTERS,
  CLUSTER_OFF,
  DEMO_MATCH,
  DEMO_TOP,
  HALO,
  N,
  ORBIT,
  ORBS,
  PLANETS,
  PORTAL_CENTER,
  PORTAL_R,
  RIM,
  SAMPLE_PROFILE,
  TILE_K,
  WALL,
  frontSpin,
  haloAt,
  mulberry32,
  orbitAt,
  planetPos,
  tileCategory,
  tileSeed,
} from "./layouts.js";
import { hudAnchors } from "./hud.js";

/* ---------- palettes ---------- */
const PALETTES = {
  night: { top: "#03061a", mid: "#0a1236", bottom: "#14134a", glow: "#3d4fd6", fog: "#0a1033", star: "#ffffff" },
  dawn: { top: "#f3f6fd", mid: "#e2e8f7", bottom: "#d6dcf3", glow: "#ffffff", fog: "#e3e8f6", star: "#2b3a7a" },
};

/* ---------- camera / RAJU choreography per chapter ---------- */
// [camX, camY, camZ, lookX, lookY, lookZ]
const CAM_WIDE = chapterTrack([
  [1.4, 2.0, 12.6, -2.7, 1.3, 0], // 0 hero
  [0.8, 1.9, 11.2, -2.4, 1.4, 0], // 1 confusion
  [0.6, 1.8, 16.6, -3.3, 1.6, 0], // 2 RIASEC
  [2.4, 2.6, 15.0, -1.2, 1.65, 0], // 3 how it works
  [-4.2, 7.6, 17.0, -4.2, 0.35, 0], // 4 semesta
  [3.4, 1.8, 11.4, -2.0, 1.4, 0], // 5 why
  [-0.7, 2.4, 15.6, 3.8, 2.2, 0], // 6 portal (left), CTA on the right
]);
// Stacked layout (phones/tablets): what each chapter frames, as a box that is
// fitted into the free band above that chapter's text panel (measured by
// scrollStory.js), so any phone size or text length keeps RAJU in view.
// [centerX, centerY, centerZ, width, height, pitch]
const WHY_OWL = [0.0, 1.15, 0.0, 3.0, 4.2, 0.06];
const WHY_STARS = [0.0, 16.0, -20.0, 2.0, 2.0, -0.35]; // the list fills a phone screen: look up at the stars
const FRAME_STATES = [
  [0.0, 1.25, 0.0, 2.8, 4.3, 0.08], // hero: RAJU and his label
  [0.0, 1.2, 0.0, 3.4, 4.2, 0.06], // confusion
  [0.0, 1.45, 0.35, 5.6, 5.0, 0.06], // the RIASEC hexagon (labels sit below the orbs on phones)
  [1.1, 1.5, 0.0, 5.0, 4.8, 0.08], // RAJU + mini profile; the data wall runs off-screen
  [0.0, 0.9, 0.0, 9.5, 4.5, 0.45], // the planet ring, from above
  WHY_STARS, // swapped for WHY_OWL when the band above the reasons is tall enough (tablets)
  [0.0, 2.2, -1.4, 6.6, 7.0, 0.03], // the portal
];
const FRAME_TALL = chapterTrack(FRAME_STATES);
const BAND_BOTTOM = [1, 1, 1, 1, 1, 1, 1];
const BAND = chapterTrack(BAND_BOTTOM);
// [x, y, z, rotY, scale]
const OWL = chapterTrack([
  [0, 0, 0, -0.38, 1],
  [0, 0, 0, 0.12, 1],
  [0, 0, 0, -0.18, 1],
  [-0.4, 0, 0, 0.28, 1],
  [0, 0.1, 0, 0, 0.72],
  [0, 0, 0, 0.5, 1],
  [0, 1.2, 0.6, 0.42, 0.92],
]);

/* ---------- helpers ---------- */
const v3 = (a, i = 0) => new Vector3(a[i], a[i + 1], a[i + 2]);
const glowTexMaterial = (color, opacity = 1) =>
  new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uColor: { value: new Color(color) }, uOpacity: { value: opacity } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader:
      "uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv; void main(){ float d = length(vUv-0.5)*2.0; float a = pow(max(0.0,1.0-d),2.2); gl_FragColor = vec4(uColor, a*uOpacity); }",
  });

export function buildWorld({ tier = "mid" } = {}) {
  const root = new Group();
  root.name = "SemestaRAJU";
  const disposables = [];
  const track = (x) => (disposables.push(x), x);

  /* Sky dome: vertical gradient + soft glow, follows the palette. */
  const skyMat = track(
    new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTop: { value: new Color(PALETTES.night.top) },
        uMid: { value: new Color(PALETTES.night.mid) },
        uBottom: { value: new Color(PALETTES.night.bottom) },
        uGlow: { value: new Color(PALETTES.night.glow) },
        uGlowDir: { value: new Vector3(0.45, 0.25, -1).normalize() },
      },
      vertexShader: "varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: `uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uBottom; uniform vec3 uGlow; uniform vec3 uGlowDir; varying vec3 vDir;
        void main(){
          float h = vDir.y;
          vec3 c = h > 0.0 ? mix(uMid, uTop, smoothstep(0.0, 0.7, h)) : mix(uMid, uBottom, smoothstep(0.0, 0.6, -h));
          float g = pow(max(0.0, dot(vDir, uGlowDir)), 6.0);
          c += uGlow * g * 0.35;
          gl_FragColor = vec4(c, 1.0);
        }`,
    })
  );
  const sky = new Mesh(track(new SphereGeometry(80, 32, 16)), skyMat);
  sky.renderOrder = -10;
  root.add(sky);

  /* Stars (far) and dust (near, for depth). */
  const rand = mulberry32(99);
  const starCount = tier === "high" ? 1400 : 700;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 30 + rand() * 30;
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    starPos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.8 + 6, r * Math.sin(ph) * Math.sin(th)], i * 3);
  }
  const starGeo = track(new BufferGeometry());
  starGeo.setAttribute("position", new BufferAttribute(starPos, 3));
  const starMat = track(
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      fog: false,
      uniforms: { uTime: { value: 0 }, uColor: { value: new Color("#ffffff") }, uOpacity: { value: 1 }, uPR: { value: 1 } },
      vertexShader: `uniform float uTime; uniform float uPR; varying float vA;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); float s = fract(sin(dot(position.xz, vec2(12.9898,78.233)))*43758.5453);
          vA = 0.35 + 0.65 * (0.5 + 0.5*sin(uTime*(0.4+s)+s*30.0)); gl_PointSize = (1.0 + s*2.2) * uPR; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: "uniform vec3 uColor; uniform float uOpacity; varying float vA; void main(){ float d = length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor = vec4(uColor, (1.0-d*2.0)*vA*uOpacity); }",
    })
  );
  const stars = new Points(starGeo, starMat);
  root.add(stars);

  const dustCount = tier === "high" ? 260 : 140;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) dustPos.set([(rand() - 0.5) * 22, rand() * 9 - 2, (rand() - 0.5) * 16], i * 3);
  const dustGeo = track(new BufferGeometry());
  dustGeo.setAttribute("position", new BufferAttribute(dustPos, 3));
  const dustMat = track(
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uColor: { value: new Color("#8fb0ff") }, uOpacity: { value: 0.55 }, uPR: { value: 1 } },
      vertexShader: `uniform float uTime; uniform float uPR; varying float vA;
        void main(){ vec3 p = position; float s = fract(sin(dot(p.xy, vec2(4.1,7.3)))*917.13); p.y += sin(uTime*0.25 + s*20.0)*0.25; p.x += cos(uTime*0.2+s*10.0)*0.15;
          vec4 mv = modelViewMatrix * vec4(p,1.0); vA = 0.4 + 0.6*s; gl_PointSize = (2.0 + s*5.0) * uPR * (8.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: "uniform vec3 uColor; uniform float uOpacity; varying float vA; void main(){ float d = length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor = vec4(uColor, pow(1.0-d*2.0,2.0)*vA*uOpacity); }",
    })
  );
  const dust = new Points(dustGeo, dustMat);
  root.add(dust);

  /* Lights. */
  const hemi = new HemisphereLight("#dfe6ff", "#1a1f4a", 0.65);
  const key = new DirectionalLight("#fff3e0", 2.1);
  key.position.set(-3, 5, 6);
  const rim = new DirectionalLight("#5ee7ff", 2.0);
  rim.position.set(4, 3, -5);
  const rim2 = new DirectionalLight("#9c8cff", 1.3);
  rim2.position.set(-5, 2, -4);
  root.add(hemi, key, rim, rim2);

  /* RAJU. */
  const raju = createRaju({ withPerch: true, quality: tier === "high" ? "high" : "mid" });
  const anim = createRajuAnimator(raju);
  const owl = new Group();
  owl.add(raju.root);
  root.add(owl);

  /* Major tiles (instanced cards, coloured by rumpun, with per-tile glow). */
  const tileGeo = track(new RoundedBoxGeometry(0.17 * TILE_K, 0.23 * TILE_K, 0.03, 2, 0.02 * TILE_K));
  const glowAttr = new InstancedBufferAttribute(new Float32Array(N), 1);
  glowAttr.setUsage(DynamicDrawUsage);
  tileGeo.setAttribute("aGlow", glowAttr);
  const tileMat = track(new MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2, metalness: 0.05 }));
  tileMat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aGlow;\nvarying float vGlow;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvGlow = aGlow;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vGlow;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vGlow * 1.6;");
  };
  tileMat.customProgramCacheKey = () => "raju-tiles";
  const tiles = new InstancedMesh(tileGeo, tileMat, N);
  tiles.instanceMatrix.setUsage(DynamicDrawUsage);
  const tileColor = new Color();
  for (let i = 0; i < N; i++) {
    const [r, g, b] = CATEGORY_RGB[tileCategory[i]];
    tiles.setColorAt(i, tileColor.setRGB(r, g, b));
  }
  tiles.frustumCulled = false;
  root.add(tiles);
  const tilePos = new Float32Array(N * 3); // smoothed positions
  tilePos.set(HALO);
  const tileScale = new Float32Array(N).fill(1);
  const tileGlow = new Float32Array(N).fill(0.15);

  /* RIASEC orbs + hexagon + profile polygon. */
  const orbGeo = track(new SphereGeometry(0.26, 32, 24));
  const haloGeo = track(new PlaneGeometry(1, 1));
  const orbs = ORBS.map((o) => {
    const m = track(
      new MeshPhysicalMaterial({ color: o.color, emissive: new Color(o.color), emissiveIntensity: 0.25, roughness: 0.18, clearcoat: 1, iridescence: 0.35 })
    );
    const mesh = new Mesh(orbGeo, m);
    const halo = new Mesh(haloGeo, track(glowTexMaterial(o.color, 0.8)));
    halo.scale.setScalar(1.6);
    const g = new Group();
    g.add(mesh, halo);
    g.scale.setScalar(0.001);
    root.add(g);
    return { ...o, group: g, mesh, halo, mat: m, home: v3(o.pos), cur: 0 };
  });
  const hexGeo = track(new BufferGeometry());
  hexGeo.setAttribute("position", new BufferAttribute(new Float32Array(6 * 3), 3));
  const hexMat = track(new LineBasicMaterial({ color: "#9fb4ff", transparent: true, opacity: 0 }));
  const hex = new LineLoop(hexGeo, hexMat);
  root.add(hex);
  const profGeo = track(new BufferGeometry());
  const profPos = new Float32Array(7 * 3);
  profGeo.setAttribute("position", new BufferAttribute(profPos, 3));
  profGeo.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0, 6, 1]);
  const profMat = track(new MeshBasicMaterial({ color: "#ffb020", transparent: true, opacity: 0, depthWrite: false, side: 2 }));
  const profile = new Mesh(profGeo, profMat);
  root.add(profile);
  // Outline of the sample profile (6 outer vertices of the fan).
  const profLineGeo = track(new BufferGeometry());
  const profLinePos = new Float32Array(6 * 3);
  profLineGeo.setAttribute("position", new BufferAttribute(profLinePos, 3));
  const profLineMat = track(new LineBasicMaterial({ color: "#ff9f1c", transparent: true, opacity: 0 }));
  root.add(new LineLoop(profLineGeo, profLineMat));

  /* Rumpun planets. */
  const planets = PLANETS.map((p) => {
    const g = new Group();
    g.position.set(...p.pos);
    const m = track(new MeshPhysicalMaterial({ color: p.color, emissive: new Color(p.color), emissiveIntensity: 0.12, roughness: 0.35, clearcoat: 0.7, sheen: 0.6, sheenColor: new Color("#ffffff") }));
    const body = new Mesh(track(new SphereGeometry(p.radius, 40, 28)), m);
    g.add(body);
    if (p.ringed) {
      const ring = new Mesh(track(new RingGeometry(p.radius * 1.35, p.radius * 1.75, 48)), track(new MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.55, side: 2 })));
      ring.rotation.set(-1.2, 0.3, 0);
      g.add(ring);
    }
    const halo = new Mesh(haloGeo, track(glowTexMaterial(p.color, 0.55)));
    halo.scale.setScalar(p.radius * 5);
    g.add(halo);
    g.scale.setScalar(0.001);
    root.add(g);
    return { ...p, group: g, body, mat: m, halo, cur: 0, sel: 0, clear: 0, at: new Vector3(...p.pos) };
  });

  /* Portal: 8 rumpun arcs + inner light. */
  const portal = new Group();
  portal.position.set(...PORTAL_CENTER);
  root.add(portal);
  const arcs = PLANETS.map((p, k) => {
    const arcLen = (Math.PI * 2) / 8;
    const m = track(new MeshPhysicalMaterial({ color: p.color, emissive: new Color(p.color), emissiveIntensity: 0.5, roughness: 0.25, clearcoat: 1 }));
    const mesh = new Mesh(track(new TorusGeometry(PORTAL_R, 0.15, 18, 40, arcLen - 0.07)), m);
    const home = new Euler(0, 0, k * arcLen + 0.035);
    // Each arc starts pushed out and back along its own direction, turned a bit
    // short of home, and spirals into place.
    const mid = k * arcLen + arcLen / 2;
    const scatter = { pos: new Vector3(Math.cos(mid) * 1.6, Math.sin(mid) * 1.6, -4.5), rot: new Euler(0, 0, home.z - 1.3) };
    portal.add(mesh);
    return { mesh, mat: m, home, scatter };
  });
  const portalLight = new Mesh(track(new CircleGeometry(PORTAL_R * 0.98, 64)), track(glowTexMaterial("#7fe8ff", 0)));
  portalLight.scale.setScalar(2);
  portal.add(portalLight);
  const portalCore = new Mesh(haloGeo, track(glowTexMaterial("#ffd36b", 0)));
  portalCore.scale.setScalar(3.2);
  portalCore.position.z = 0.05;
  portal.add(portalCore);

  /* ---------- per-frame state ---------- */
  const st = {
    palette: "",
    reveal: 0,
    introAt: -1,
    waveUntil: 0,
    lastFlap: -1,
    lastPulse: -1,
    happyUntil: 0,
    cam: new Vector3(0.9, 1.9, 9.6),
    look: new Vector3(-2.1, 1.25, 0),
    owlT: [0, 0, 0, -0.38, 1],
    lookAt: new Vector3(0, 1.4, 6),
    haloScale: 1,
    orbitScale: 1,
    ringSpin: 0,
  };
  const tmpQ = new Quaternion();
  const tmpE = new Euler();
  const tmpQ2 = new Quaternion();
  const tmpV = new Vector3();
  const tmpV2 = new Vector3();
  const tmpS = new Vector3();
  const dummy = new Object3D();
  const owlHead = new Vector3();
  const camArr = [];
  const owlArr = [];

  function applyPalette(name) {
    const p = PALETTES[name] || PALETTES.night;
    skyMat.uniforms.uTop.value.set(p.top);
    skyMat.uniforms.uMid.value.set(p.mid);
    skyMat.uniforms.uBottom.value.set(p.bottom);
    skyMat.uniforms.uGlow.value.set(p.glow);
    starMat.uniforms.uColor.value.set(p.star);
    const dawn = name === "dawn";
    starMat.blending = dawn ? NormalBlending : AdditiveBlending;
    starMat.needsUpdate = true;
    starMat.uniforms.uOpacity.value = dawn ? 0.45 : 1;
    dustMat.uniforms.uColor.value.set(dawn ? "#6f86d8" : "#8fb0ff");
    dustMat.blending = dawn ? NormalBlending : AdditiveBlending;
    dustMat.needsUpdate = true;
    hemi.intensity = dawn ? 0.95 : 0.65;
    st.fog = p.fog;
  }

  function project(key, worldPos, alpha, camera, size) {
    const el = hudAnchors.get(key);
    if (!el) return;
    tmpV2.copy(worldPos).project(camera);
    const vis = alpha > 0.04 && tmpV2.z < 1 && Math.abs(tmpV2.x) < 1.15 && Math.abs(tmpV2.y) < 1.15;
    if (!vis) {
      if (el.dataset.on !== "0") {
        el.dataset.on = "0";
        el.style.opacity = "0";
      }
      return;
    }
    const x = (tmpV2.x * 0.5 + 0.5) * size.width;
    const y = (-tmpV2.y * 0.5 + 0.5) * size.height;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    el.style.opacity = alpha.toFixed(3);
    if (el.dataset.on !== "1") el.dataset.on = "1";
  }

  /** Stacked layout: fit FRAME_TALL into the band above the text panel. The
   *  camera distance fits the box; a vertical lens shift (view offset) centres
   *  it in the band without tilting the camera. */
  const frameArr = [];
  const selFrame = [0, 0, 0, 3.2, 2.6, 0.3];
  function frameStacked(story, size, camera) {
    const W = size.width;
    const H = size.height;
    const bb = store.bandBottom;
    for (let i = 0; i < BAND_BOTTOM.length; i++) BAND_BOTTOM[i] = bb[i] ?? 0.55;
    FRAME_STATES[5] = BAND_BOTTOM[5] - store.bandTop > 0.22 ? WHY_OWL : WHY_STARS;
    FRAME_TALL(story, frameArr);
    if (Math.floor(story) === 4 && store.selectedRumpun >= 0) {
      // Fly to the chosen planet (where the turning ring has brought it).
      const p = planets[store.selectedRumpun].at;
      selFrame[0] = p.x;
      selFrame[1] = p.y;
      selFrame[2] = p.z;
      const k = 0.85 * presence(story, 4);
      for (let i = 0; i < 6; i++) frameArr[i] = lerp(frameArr[i], selFrame[i], k);
    }
    const [fx, fy, fz, fw, fh, pitch] = frameArr;
    const top = store.bandTop * H + 10;
    const bottom = Math.max(top + 0.2 * H, BAND(story) * H - 14);
    const tan = Math.tan((camera.fov * Math.PI) / 360);
    const d = Math.max((fh * H) / ((bottom - top) * 2 * tan), fw / (2 * tan * (W / H) * 0.94));
    camArr[0] = fx;
    camArr[1] = fy + d * Math.sin(pitch);
    camArr[2] = fz + d * Math.cos(pitch);
    camArr[3] = fx;
    camArr[4] = fy;
    camArr[5] = fz;
    const off = H / 2 - (top + bottom) / 2;
    st.lens = st.lens === undefined ? off : st.lens + (off - st.lens) * 0.12;
    camera.setViewOffset(W, H, 0, st.lens, W, H);
  }

  /* ---------- update ---------- */
  function update(state, dt, size) {
    dt = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;
    const { camera } = state;
    const tall = size.width / size.height < 0.85; // quiz/result: hide RAJU on portrait screens
    const stacked = size.width < 1024; // matches the CSS lg breakpoint: text panel below the scene
    const mode = store.mode;
    const story = store.story;

    if (store.palette !== st.palette) {
      st.palette = store.palette;
      applyPalette(store.palette);
      if (state.scene.fog) state.scene.fog.color.set(st.fog);
    }

    // Intro: scan-materialise RAJU the first time the world appears.
    // (held back while the loader screen is still lifting)
    if (st.introAt < 0 && !store.introHold) st.introAt = t;
    const introK = st.introAt < 0 ? 0 : clamp01((t - st.introAt - 0.15) / 1.6);
    st.reveal = smooth(introK);
    raju.reveal.uReveal.value = st.reveal;
    if (introK >= 1 && !st.didIntroWave) {
      st.didIntroWave = true;
      st.waveUntil = t + 1.8;
      anim.flap(t);
    }
    if (store.flapAt !== st.lastFlap) {
      st.lastFlap = store.flapAt;
      if (store.flapAt > 0) anim.flap(t);
    }
    if (store.pulseAt !== st.lastPulse) {
      st.lastPulse = store.pulseAt;
      if (store.pulseAt > 0) st.happyUntil = t + 0.9;
    }

    /* --- choreography by mode --- */
    let expression = "idle";
    let wave = t < st.waveUntil ? 1 : 0;
    let lookTarget = null;
    const ch = Math.max(0, Math.min(6, Math.floor(story)));
    const pin = pinProgress(story, ch);
    const steps = store.steps;

    if (mode === "story") {
      if (stacked) frameStacked(story, size, camera);
      else CAM_WIDE(story, camArr);
      OWL(story, owlArr);
      st.owlT = owlArr;
    } else if (mode === "quiz") {
      if (tall) camArr.splice(0, 6, 0, 1.6, 14, 0, -1.5, 0);
      else camArr.splice(0, 6, -2.0, 1.7, 12.5, -3.7, 1.25, 0);
      st.owlT = [0, 0, 0, -0.55, 1];
    } else {
      // result
      if (tall) camArr.splice(0, 6, 0, 1.8, 15, 0, -1.6, 0);
      else camArr.splice(0, 6, -2.4, 1.9, 11, -4.8, 1.4, 0);
      st.owlT = [0, 0, 0, -0.5, 1];
    }

    if (!(mode === "story" && stacked) && camera.view?.enabled) camera.clearViewOffset();

    // Camera with gentle pointer parallax (desktop only).
    const par = pointer.active && !stacked ? 1 : 0;
    st.cam.set(camArr[0] + pointer.x * 0.35 * par, camArr[1] + pointer.y * 0.2 * par, camArr[2]);
    st.look.set(camArr[3], camArr[4], camArr[5]);
    if (mode === "story" && !stacked && ch === 4 && store.selectedRumpun >= 0) {
      // Fly towards the chosen planet while keeping it right of the text column.
      const p = planets[store.selectedRumpun].at;
      const k = 0.55 * presence(story, 4);
      st.look.lerp(tmpV.set(p.x - 2.6, p.y, p.z), k);
      st.cam.lerp(tmpV.set(p.x - 2.6, p.y + 4.2, p.z + 10.5), k);
    }
    camera.position.x = damp(camera.position.x, st.cam.x, 3.2, dt);
    camera.position.y = damp(camera.position.y, st.cam.y, 3.2, dt);
    camera.position.z = damp(camera.position.z, st.cam.z, 3.2, dt);
    st.lookAt.x = damp(st.lookAt.x, st.look.x, 3.2, dt);
    st.lookAt.y = damp(st.lookAt.y, st.look.y, 3.2, dt);
    st.lookAt.z = damp(st.lookAt.z, st.look.z, 3.2, dt);
    camera.lookAt(st.lookAt);
    // Dev-only probe so visual tests can wait for the camera to settle.
    if (import.meta.env.DEV) {
      window.__worldSettle = camera.position.distanceTo(st.cam) + st.lookAt.distanceTo(st.look);
    }

    // RAJU placement.
    const [ox, oy, oz, ory, os] = st.owlT;
    owl.position.set(damp(owl.position.x, ox, 4, dt), damp(owl.position.y, oy, 4, dt), damp(owl.position.z, oz, 4, dt));
    owl.rotation.y = damp(owl.rotation.y, ory, 4, dt);
    const sc = damp(owl.scale.x, os, 4, dt);
    owl.scale.setScalar(sc);
    owl.visible = !(mode !== "story" && tall);
    owlHead.set(0, 1.58 * sc, 0).applyMatrix4(owl.matrixWorld);

    // Default gaze: the camera, nudged by the pointer.
    lookTarget = tmpV.copy(camera.position);
    lookTarget.x += pointer.x * 2.5;
    lookTarget.y += pointer.y * 1.5;

    /* --- tiles --- */
    let A = HALO;
    let B = HALO;
    let blend = 0;
    let tileSize = 1;
    const layoutAt = (c, end) =>
      [HALO, end ? ORBIT : CHAOS, ORBIT, end ? WALL : ORBIT, CLUSTERS, HALO, RIM][Math.max(0, Math.min(6, c))];
    if (mode === "story") {
      const local = story - ch;
      if (local < SETTLE && ch > 0) {
        A = layoutAt(ch - 1, true);
        B = layoutAt(ch, false);
        blend = smooth(local / SETTLE);
      } else {
        A = layoutAt(ch, false);
        B = layoutAt(ch, true);
        blend = ch === 1 ? smooth(clamp01((pin - 0.5) / 0.4)) : ch === 3 ? smooth(clamp01((pin - 0.45) / 0.15)) : 0;
      }
      tileSize = lerp(1, 0.55, presence(story, 2)) * (ch === 6 ? 1.15 : 1);
    } else {
      A = B = ORBIT;
    }
    const rotHalo = t * 0.04;
    const rotOrbit = t * 0.09;
    // Keep the rings clear of the text column where it is busiest.
    const wide = mode === "story" && !stacked;
    st.haloScale = damp(st.haloScale, wide && ch === 5 ? 0.5 : wide && ch === 0 ? 0.85 : 1, 2.5, dt);
    st.orbitScale = damp(st.orbitScale, wide && ch === 3 ? 0.7 : 1, 2.5, dt);
    const rotRim = t * 0.05;
    const howStep = steps[3] ?? 0;
    const selected = store.selectedRumpun;
    const inSemesta = mode === "story" && ch === 4 ? presence(story, 4) : 0;
    const inHow = mode === "story" && ch === 3 ? presence(story, 3) : 0;
    const resultTop = mode === "result" ? store.highlight : -1;

    // Rumpun ring: drifts slowly; choosing a field (or a result's top field)
    // turns the ring the short way round until that planet is at the front.
    const focusPlanet = mode === "story" && selected >= 0 ? selected : resultTop >= 0 ? tileCategory[resultTop] : -1;
    if (focusPlanet >= 0) {
      const target = frontSpin(focusPlanet);
      st.ringSpin += Math.atan2(Math.sin(target - st.ringSpin), Math.cos(target - st.ringSpin)) * (1 - Math.exp(-2.6 * dt));
    } else st.ringSpin += dt * 0.05;
    planets.forEach((p, k) => planetPos(k, st.ringSpin, p.at));

    for (let i = 0; i < N; i++) {
      const seed = tileSeed[i];
      const k = clamp01(blend * 1.35 - seed * 0.35);
      const sample = (L, out) => {
        let x = L[i * 3];
        let y = L[i * 3 + 1];
        let z = L[i * 3 + 2];
        if (L === HALO) return haloAt(i, rotHalo, out, st.haloScale);
        if (L === ORBIT) return orbitAt(i, rotOrbit, out, st.orbitScale);
        if (L === CHAOS) {
          x += Math.sin(t * 0.7 + seed * 20) * 0.18;
          y += Math.cos(t * 0.6 + seed * 13) * 0.18;
          z += Math.sin(t * 0.5 + seed * 7) * 0.18;
        } else if (L === RIM) {
          const cx = x - PORTAL_CENTER[0];
          const cy = y - PORTAL_CENTER[1];
          const ca = Math.cos(rotRim);
          const sa = Math.sin(rotRim);
          x = PORTAL_CENTER[0] + cx * ca - cy * sa;
          y = PORTAL_CENTER[1] + cx * sa + cy * ca;
        } else if (L === CLUSTERS) {
          const home = planets[tileCategory[i]].at;
          x = home.x + CLUSTER_OFF[i * 3];
          y = home.y + CLUSTER_OFF[i * 3 + 1] + Math.sin(t * 0.8 + seed * 9) * 0.06;
          z = home.z + CLUSTER_OFF[i * 3 + 2];
        }
        out.set(x, y, z);
        return out;
      };
      sample(A, tmpV2);
      const ax = tmpV2.x;
      const ay = tmpV2.y;
      const az = tmpV2.z;
      sample(B, tmpV2);
      let tx = lerp(ax, tmpV2.x, k);
      let ty = lerp(ay, tmpV2.y, k);
      let tz = lerp(az, tmpV2.z, k);

      let s = tileSize;
      let glow = 0.12;
      if (inHow > 0) {
        if (howStep === 0 && i < 20) {
          // Answers flow into RAJU and are absorbed.
          const f = smooth(clamp01(pin * 4 - (i / 20) * 0.6));
          tx = lerp(tx, owlHead.x, f);
          ty = lerp(ty, owlHead.y - 0.3, f);
          tz = lerp(tz, owlHead.z + 0.2, f);
          s *= 1 - f;
          glow = 0.9;
        }
        if (howStep >= 2) glow = 0.08 + DEMO_MATCH[i] * DEMO_MATCH[i] * 0.9;
        if (howStep === 3) {
          if (i === DEMO_TOP) {
            tx = lerp(tx, owlHead.x + 1.25, 0.9);
            ty = lerp(ty, owlHead.y - 0.1, 0.9);
            tz = lerp(tz, owlHead.z + 1.2, 0.9);
            s = 3.2;
            glow = 1.2;
          } else glow *= 0.5;
        }
      }
      if (inSemesta > 0 && selected >= 0) {
        const mine = tileCategory[i] === selected;
        s *= mine ? 1.35 : 0.8;
        glow = mine ? 0.85 : 0.04;
      }
      if (resultTop >= 0) glow = tileCategory[i] === tileCategory[resultTop] ? 0.7 : 0.1;
      if (i === resultTop) s = 2;

      const d = 1 - Math.exp(-7 * dt);
      tilePos[i * 3] += (tx - tilePos[i * 3]) * d;
      tilePos[i * 3 + 1] += (ty - tilePos[i * 3 + 1]) * d;
      tilePos[i * 3 + 2] += (tz - tilePos[i * 3 + 2]) * d;
      tileScale[i] += (s - tileScale[i]) * d;
      tileGlow[i] += (glow - tileGlow[i]) * d;

      dummy.position.set(tilePos[i * 3], tilePos[i * 3 + 1], tilePos[i * 3 + 2]);
      // Orientation: tumbling in chaos, otherwise turned towards the camera.
      dummy.lookAt(camera.position);
      if (A === CHAOS || B === CHAOS) {
        tmpQ.copy(dummy.quaternion);
        tmpQ2.setFromEuler(tmpE.set(t * (0.4 + seed) + seed * 9, t * (0.3 + seed * 0.7), seed * 4));
        const chaosW = A === CHAOS ? 1 - k : k;
        dummy.quaternion.copy(tmpQ).slerp(tmpQ2, chaosW);
      }
      dummy.scale.setScalar(tileScale[i] * (0.85 + seed * 0.3));
      dummy.updateMatrix();
      tiles.setMatrixAt(i, dummy.matrix);
      glowAttr.array[i] = tileGlow[i];
    }
    tiles.instanceMatrix.needsUpdate = true;
    glowAttr.needsUpdate = true;

    /* --- RIASEC orbs --- */
    const riasecP = mode === "story" ? presence(story, 2) : 0;
    const howProfile = inHow > 0 && howStep >= 1 ? inHow : 0;
    const orbStep = steps[2] ?? 0;
    const pin2 = pinProgress(story, 2);
    const hexOn = riasecP > 0 ? smooth(clamp01((pin2 - 0.82) / 0.15)) : 0;
    const miniCenter = tmpS.set(owlHead.x + 2.1, owlHead.y + 1.0, owlHead.z);
    orbs.forEach((o, k) => {
      const appear = riasecP * clamp01(((story - 2) * 4 - k * 0.12) / 0.6);
      const target = Math.max(appear, howProfile);
      o.cur = damp(o.cur, target, 6, dt);
      const active = riasecP > 0.5 && orbStep === k ? 1 : 0;
      const sc2 = o.cur * (howProfile > 0 ? 0.5 : 1 + active * 0.55 + Math.sin(t * 2 + k) * 0.03);
      o.group.scale.setScalar(Math.max(0.001, sc2));
      // Position: around RAJU's head in chapter 2, as a mini profile in chapter 3.
      if (howProfile > 0) {
        const a = -Math.PI / 2 + (k / 6) * Math.PI * 2;
        o.group.position.set(miniCenter.x + Math.cos(a) * 0.95, miniCenter.y - Math.sin(a) * 0.95, miniCenter.z);
      } else {
        o.group.position.set(o.home.x + owl.position.x, o.home.y + Math.sin(t * 0.9 + k) * 0.06, o.home.z);
      }
      o.mat.emissiveIntensity = 0.25 + active * 0.9;
      o.halo.material.uniforms.uOpacity.value = (0.35 + active * 0.65) * o.cur;
      o.halo.lookAt(camera.position);
      project(`orb-${o.key}`, o.group.position, o.cur * (howProfile > 0 ? 0 : 1), camera, size);
      if (riasecP > 0.5 && orbStep === k && pin2 < 0.82) lookTarget = o.group.position;
    });
    // Hexagon + sample profile.
    const hexAlpha = Math.max(hexOn * riasecP, howProfile);
    hexMat.opacity = hexAlpha * 0.6;
    profMat.opacity = hexAlpha * 0.38;
    profLineMat.opacity = hexAlpha;
    const hp = hexGeo.attributes.position.array;
    const cx = howProfile > 0 ? miniCenter.x : owl.position.x;
    const cy = howProfile > 0 ? miniCenter.y : 1.55;
    const cz = howProfile > 0 ? miniCenter.z : 0.36;
    profPos.set([cx, cy, cz], 0);
    orbs.forEach((o, k) => {
      hp[k * 3] = o.group.position.x;
      hp[k * 3 + 1] = o.group.position.y;
      hp[k * 3 + 2] = o.group.position.z;
      const v = SAMPLE_PROFILE[o.key] * hexAlpha;
      profPos[(k + 1) * 3] = cx + (o.group.position.x - cx) * v;
      profPos[(k + 1) * 3 + 1] = cy + (o.group.position.y - cy) * v;
      profPos[(k + 1) * 3 + 2] = cz;
      profLinePos.set([profPos[(k + 1) * 3], profPos[(k + 1) * 3 + 1], cz + 0.01], k * 3);
    });
    hexGeo.attributes.position.needsUpdate = true;
    profGeo.attributes.position.needsUpdate = true;
    profLineGeo.attributes.position.needsUpdate = true;

    /* --- planets --- */
    const planetP = mode === "story" ? presence(story, 4) : mode === "result" ? 1 : 0;
    planets.forEach((p, k) => {
      const appear = planetP * clamp01(((story - 4) * 4 - k * 0.08) / 0.5 + (mode === "result" ? 1 : 0));
      p.cur = damp(p.cur, appear, 5, dt);
      const isSel = (mode === "story" && selected === k) || (mode === "result" && resultTop >= 0 && tileCategory[resultTop] === k);
      p.sel = damp(p.sel, isSel ? 1 : 0, 6, dt);
      const dim = mode === "story" && selected >= 0 && !isSel ? 0.75 : 1;
      // A planet swinging past right in front of RAJU shrinks to make room, so
      // the turning ring never hides him (the chosen planet stays full size).
      const inFront = clamp01((p.at.z - 0.7) / 1.1) * clamp01(1 - Math.abs(p.at.x) / 2.4);
      p.clear = damp(p.clear, isSel ? 0 : inFront, 6, dt);
      p.group.scale.setScalar(Math.max(0.001, p.cur * (1 + p.sel * 0.35) * dim * (1 - p.clear * 0.6)));
      p.group.position.set(p.at.x, p.at.y + Math.sin(t * 0.6 + k) * 0.08, p.at.z);
      p.body.rotation.y += dt * 0.15;
      p.mat.emissiveIntensity = 0.12 + p.sel * 0.6;
      p.halo.material.uniforms.uOpacity.value = (0.35 + p.sel * 0.65) * p.cur;
      p.halo.lookAt(camera.position);
      // Labels: all planets until one is chosen, then only the chosen one.
      const labelOn = mode === "story" && (selected < 0 || isSel) ? 1 : 0;
      tmpV2.copy(p.group.position);
      tmpV2.y -= p.radius * 1.15;
      project(`planet-${p.id}`, tmpV2, p.cur * labelOn, camera, size);
      if (isSel && mode === "story" && ch === 4) lookTarget = p.group.position;
    });

    /* --- portal --- */
    const portalP = mode === "story" ? presence(story, 6) : 0;
    const assemble = smooth(clamp01((story - 6.04) / 0.36));
    portal.visible = portalP > 0.01 && assemble > 0;
    arcs.forEach((a, k) => {
      const f = smooth(clamp01(assemble * 1.6 - k * 0.075));
      a.mesh.position.lerpVectors(a.scatter.pos, tmpV2.set(0, 0, 0), f);
      a.mesh.rotation.set(0, 0, lerp(a.scatter.rot.z, a.home.z, f) + t * 0.05 * f);
      a.mesh.scale.setScalar(Math.max(0.001, f));
      a.mat.emissiveIntensity = 0.35 + f * 0.5 + Math.sin(t * 2 + k) * 0.08;
    });
    portalLight.material.uniforms.uOpacity.value = assemble * 0.35 * portalP;
    portalCore.material.uniforms.uOpacity.value = assemble * 0.55 * portalP * (0.85 + Math.sin(t * 1.5) * 0.15);

    /* --- RAJU behaviour --- */
    if (mode === "story") {
      if (ch === 1 && pin < 0.55) {
        expression = "curious";
        lookTarget = tmpV.set(Math.sin(t * 0.9) * 4, 1.6 + Math.cos(t * 0.7) * 0.8, 3);
      } else if (ch === 2 && hexOn > 0.5) expression = "happy";
      else if (ch === 3) expression = howStep === 3 ? "happy" : howStep === 2 ? "curious" : "thinking";
      else if (ch === 5) expression = "idle";
      else if (ch === 6 && assemble > 0.6) {
        expression = "happy";
        wave = 1;
      }
    } else if (mode === "quiz") {
      lookTarget = tmpV.set(-6, 1.4, 2);
      expression = t < st.happyUntil ? "happy" : "idle";
    } else if (mode === "result") {
      expression = "happy";
      wave = t < st.waveUntil + 2.5 ? 1 : 0;
    }
    anim.update(dt, t, { look: lookTarget, expression, wave, energy: store.energy });
    // Model reveal bounds follow RAJU in world space.
    raju.reveal.uBounds.value.set(owl.position.y - 0.8 * sc, owl.position.y + raju.height * sc);
    project("raju", tmpV2.set(owlHead.x, owlHead.y + 1.15 * sc, owlHead.z), mode === "story" ? presence(story, 0) * st.reveal : 0, camera, size);
    const topTile = tmpV.set(tilePos[DEMO_TOP * 3], tilePos[DEMO_TOP * 3 + 1] + 0.45, tilePos[DEMO_TOP * 3 + 2]);
    project("demo-top", topTile, inHow > 0.5 && howStep === 3 ? 1 : 0, camera, size);

    /* --- ambience --- */
    starMat.uniforms.uTime.value = t;
    dustMat.uniforms.uTime.value = t;
    starMat.uniforms.uPR.value = state.viewport.dpr;
    dustMat.uniforms.uPR.value = state.viewport.dpr;
    stars.rotation.y = t * 0.004 + story * 0.05;
    dust.rotation.y = story * 0.08;
  }

  return {
    root,
    raju,
    update,
    dispose() {
      raju.dispose();
      disposables.forEach((d) => d.dispose?.());
    },
  };
}
