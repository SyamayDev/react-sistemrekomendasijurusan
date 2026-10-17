/**
 * RAJU — SI-RAJU's owl mascot as a procedural, rigged three.js model.
 *
 * Built from lathe/sphere/rounded-box primitives with physically based
 * materials (clear-coat "vinyl toy" finish, velvet sheen on the plumage),
 * so it is tiny to ship, crisp at any resolution and fully editable here.
 * `scripts/raju-export.mjs` exports the same model to .glb + posters.
 *
 * Rig:  root → bob → body, wings, feet, head(pivot) → face, eyes(+lids), beak, tufts, cap(+tassel)
 * Behaviour (see createRajuAnimator): breathing, blinking, head/eye look-at,
 * expressions (idle | happy | curious | thinking | surprised), wing wave/flap,
 * tassel pendulum and a scan "materialise" reveal shader.
 */
import {
  CatmullRomCurve3,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  SplineCurve,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { bellyTexture, eyeTextures, pagesTexture, shadowTexture } from "./textures.js";

export const RAJU_COLORS = {
  plume: "#1f3176",
  plumeDeep: "#17255c",
  wing: "#16235a",
  face: "#f2f5ff",
  gold: "#ffc53d",
  goldDeep: "#e9a21c",
  cap: "#121d4b",
  capTop: "#1a2862",
};

/* ---------- reveal shader (scan materialise) ---------- */

/** Shared uniforms; uBounds = world-space [bottomY, topY] of the model. */
export function createRevealUniforms() {
  return {
    uReveal: { value: 1 },
    uBounds: { value: new Vector2(0, 2.4) },
    uRevealColor: { value: new Color("#5ee7ff") },
  };
}

function withReveal(material, u) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vRevealY;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvRevealY = (modelMatrix * vec4(transformed, 1.0)).y;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uReveal;\nuniform vec2 uBounds;\nuniform vec3 uRevealColor;\nvarying float vRevealY;"
      )
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
        float rH = mix(uBounds.x - 0.05, uBounds.y + 0.05, uReveal);
        if (vRevealY > rH) discard;
        float rBand = (1.0 - step(0.999, uReveal)) * smoothstep(0.16, 0.0, rH - vRevealY);`
      )
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uRevealColor * rBand * 2.6;"
      );
  };
  material.customProgramCacheKey = () => "raju-reveal";
  return material;
}

/* ---------- geometry helpers ---------- */

function lathe(profile, segments = 64) {
  const curve = new SplineCurve(profile.map(([r, y]) => new Vector2(r, y)));
  return new LatheGeometry(curve.getPoints(60), segments);
}

function mesh(geometry, material, { pos, rot, scale, name } = {}) {
  const m = new Mesh(geometry, material);
  if (pos) m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  if (scale) (Array.isArray(scale) ? m.scale.set(...scale) : m.scale.setScalar(scale));
  if (name) m.name = name;
  return m;
}

/* ---------- model ---------- */

export function createRaju({ withPerch = true, quality = "high" } = {}) {
  const seg = quality === "high" ? 1 : 0.6;
  const S = (n) => Math.max(8, Math.round(n * seg));
  const reveal = createRevealUniforms();
  const disposables = [];
  const track = (x) => (disposables.push(x), x);

  const eyeTex = eyeTextures();
  const bellyMap = bellyTexture();
  [eyeTex.map, eyeTex.emissiveMap, bellyMap].forEach(track);

  const mat = {
    plume: new MeshPhysicalMaterial({
      color: RAJU_COLORS.plume,
      roughness: 0.48,
      clearcoat: 0.55,
      clearcoatRoughness: 0.32,
      sheen: 0.45,
      sheenColor: new Color("#5d78e6"),
      sheenRoughness: 0.55,
    }),
    wing: new MeshPhysicalMaterial({
      color: RAJU_COLORS.wing,
      roughness: 0.5,
      clearcoat: 0.4,
      clearcoatRoughness: 0.4,
      sheen: 0.5,
      sheenColor: new Color("#6b84ff"),
      sheenRoughness: 0.6,
    }),
    face: new MeshPhysicalMaterial({ color: RAJU_COLORS.face, roughness: 0.62, sheen: 0.4, sheenColor: new Color("#ffffff") }),
    smile: new MeshPhysicalMaterial({ color: "#0e1a47", roughness: 0.35, clearcoat: 0.6 }),
    belly: new MeshPhysicalMaterial({ color: "#ffffff", map: bellyMap, roughness: 0.66, sheen: 0.35, sheenColor: new Color("#dfe7ff") }),
    eye: new MeshPhysicalMaterial({
      color: "#ffffff",
      map: eyeTex.map,
      emissive: new Color("#ffffff"),
      emissiveMap: eyeTex.emissiveMap,
      emissiveIntensity: 0.55,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    }),
    gold: new MeshPhysicalMaterial({ color: RAJU_COLORS.gold, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
    cap: new MeshPhysicalMaterial({ color: RAJU_COLORS.cap, roughness: 0.55, clearcoat: 0.35, sheen: 0.4, sheenColor: new Color("#5a6fd8") }),
    capTop: new MeshPhysicalMaterial({ color: RAJU_COLORS.capTop, roughness: 0.5, clearcoat: 0.45 }),
  };
  Object.values(mat).forEach((m) => track(withReveal(m, reveal)));

  const root = new Group();
  root.name = "RAJU";
  const bob = new Group();
  bob.name = "bob";
  root.add(bob);

  /* Body: an egg that reads as an owl from every side. */
  const body = mesh(
    track(
      // One continuous silhouette from feet to crown: no neck seam from any angle.
      lathe([
        [0.0, 0.06],
        [0.34, 0.08],
        [0.6, 0.18],
        [0.78, 0.38],
        [0.86, 0.64],
        [0.86, 0.92],
        [0.83, 1.16],
        [0.83, 1.4],
        [0.84, 1.62],
        [0.78, 1.84],
        [0.62, 2.0],
        [0.34, 2.09],
        [0.0, 2.12],
      ], S(72))
    ),
    mat.plume,
    { name: "body" }
  );
  bob.add(body);

  // Belly patch with feather chevrons.
  bob.add(mesh(track(new SphereGeometry(0.6, S(48), S(32))), mat.belly, { pos: [0, 0.7, 0.52], scale: [1.02, 1.12, 0.6], name: "belly" }));

  // Wings — pivot at the shoulder so they can wave/flap.
  const wings = [-1, 1].map((side) => {
    const pivot = new Group();
    pivot.name = side < 0 ? "wingL" : "wingR";
    pivot.position.set(side * 0.8, 1.12, -0.04);
    // Teardrop wing: round shoulder tapering to a feathered tip.
    const w = mesh(
      track(
        lathe([
          [0.0, -0.98],
          [0.1, -0.86],
          [0.24, -0.6],
          [0.31, -0.32],
          [0.3, -0.08],
          [0.2, 0.06],
          [0.0, 0.1],
        ], S(32))
      ),
      mat.wing,
      { pos: [side * 0.06, 0, 0], scale: [0.62, 1, 1.25], rot: [-0.12, 0, side * -0.1] }
    );
    pivot.add(w);
    bob.add(pivot);
    return pivot;
  });

  // Tail: a small fan of three feathers so the back view has a silhouette too.
  for (let i = -1; i <= 1; i++) {
    bob.add(
      mesh(
        track(lathe([[0.0, -0.5], [0.12, -0.38], [0.15, -0.16], [0.1, 0.0], [0.0, 0.04]], S(20))),
        mat.wing,
        { pos: [i * 0.17, 0.3, -0.72], rot: [-0.75, 0, i * 0.32], scale: [1, 1, 0.45] }
      )
    );
  }

  // Feet: three plump toes each.
  for (const side of [-1, 1]) {
    for (let i = -1; i <= 1; i++) {
      bob.add(
        mesh(track(new SphereGeometry(0.075, S(18), S(12))), mat.gold, {
          pos: [side * 0.26 + i * 0.085, 0.04, 0.5 + (i === 0 ? 0.03 : 0)],
          scale: [0.8, 0.62, 1.35],
        })
      );
    }
  }

  /* Head (pivot at the neck). */
  const head = new Group();
  head.name = "head";
  // Face rig pivots around the centre of the (lathe) head, so its parts glide over the surface.
  head.position.set(0, 1.58, 0);
  bob.add(head);

  // Ear tufts.
  for (const side of [-1, 1]) {
    head.add(
      mesh(track(new ConeGeometry(0.2, 0.52, S(24), 1)), mat.plume, {
        pos: [side * 0.6, 0.4, 0.04],
        rot: [0.08, 0, side * -0.72],
        scale: [1, 1, 0.62],
      })
    );
  }

  // Heart-shaped facial disc: two flattened discs that overlap.
  for (const side of [-1, 1]) {
    head.add(mesh(track(new SphereGeometry(0.38, S(48), S(32))), mat.face, { pos: [side * 0.29, 0.0, 0.69], scale: [1, 1.05, 0.44] }));
  }
  // Small notch between the discs (gives the heart its point under the beak).
  head.add(mesh(track(new SphereGeometry(0.14, S(24), S(16))), mat.face, { pos: [0, -0.24, 0.8], scale: [1, 1.05, 0.45] }));

  // Eyes with upper/lower lids (lids are face-coloured so blinks read on the dark eyes).
  const eyeGeo = track(new SphereGeometry(0.215, S(48), S(32)));
  const upperLidGeo = track(new SphereGeometry(0.225, S(40), S(16), 0, Math.PI * 2, 0, Math.PI / 2));
  const lowerLidGeo = track(new SphereGeometry(0.224, S(40), S(16), 0, Math.PI * 2, Math.PI / 2, Math.PI / 2));
  const smileGeo = track(new TorusGeometry(0.12, 0.028, 12, 40, Math.PI));
  const eyes = [-1, 1].map((side) => {
    const g = new Group();
    g.position.set(side * 0.28, 0.02, 0.84);
    const eye = mesh(eyeGeo, mat.eye, { name: side < 0 ? "eyeL" : "eyeR" });
    const upper = mesh(upperLidGeo, mat.face);
    const lower = mesh(lowerLidGeo, mat.face);
    // "^^" smiling-eye arc drawn on the closed lid (shown for the happy expression).
    const smile = mesh(smileGeo, mat.smile, { pos: [0, -0.04, 0.205], rot: [-0.12, 0, 0] });
    smile.scale.setScalar(0.001);
    g.add(eye, upper, lower, smile);
    head.add(g);
    return { group: g, eye, upper, lower, smile };
  });

  // Beak.
  const beak = mesh(track(new ConeGeometry(0.095, 0.26, S(24))), mat.gold, { pos: [0, -0.16, 0.97], rot: [Math.PI + 0.42, 0, 0], scale: [1.15, 1, 0.82] });
  head.add(beak);

  /* Graduation cap with a swinging tassel. */
  const cap = new Group();
  cap.name = "cap";
  cap.position.set(0.02, 0.58, -0.02);
  cap.rotation.set(-0.08, 0, 0.12);
  head.add(cap);
  cap.add(mesh(track(new CylinderGeometry(0.42, 0.47, 0.24, S(40))), mat.cap, { pos: [0, -0.02, 0] }));
  const board = mesh(track(new RoundedBoxGeometry(1.08, 0.07, 1.08, 3, 0.02)), mat.capTop, { pos: [0, 0.12, 0], rot: [0, Math.PI / 4, 0] });
  cap.add(board);
  cap.add(mesh(track(new SphereGeometry(0.045, S(16), S(12))), mat.gold, { pos: [0, 0.17, 0] }));
  const corner = new Vector3(0.76, 0.12, 0); // board corner (board rotated 45°)
  const cord = new CatmullRomCurve3([new Vector3(0, 0.17, 0), new Vector3(0.4, 0.17, 0.02), new Vector3(corner.x, corner.y + 0.02, 0)]);
  cap.add(mesh(track(new TubeGeometry(cord, 16, 0.014, 8)), mat.gold));
  const tassel = new Group();
  tassel.name = "tassel";
  tassel.position.copy(corner);
  tassel.add(mesh(track(new CylinderGeometry(0.014, 0.014, 0.3, 8)), mat.gold, { pos: [0, -0.15, 0] }));
  tassel.add(mesh(track(new CylinderGeometry(0.035, 0.07, 0.18, S(16))), mat.gold, { pos: [0, -0.36, 0] }));
  cap.add(tassel);

  /* Perch: a floating stack of books (education, not a branch). */
  let perch = null;
  if (withPerch) {
    perch = new Group();
    perch.name = "perch";
    const pages = track(pagesTexture());
    const pageMat = track(withReveal(new MeshStandardMaterial({ color: "#ffffff", map: pages, roughness: 0.9 }), reveal));
    const books = [
      { w: 1.9, h: 0.26, d: 1.28, color: "#8b7cff", y: 0, ry: 0.12 },
      { w: 1.72, h: 0.22, d: 1.16, color: "#2ec4e6", y: 0.25, ry: -0.18 },
      { w: 1.58, h: 0.24, d: 1.06, color: "#24357a", y: 0.48, ry: 0.06 },
    ];
    for (const b of books) {
      const cover = track(withReveal(new MeshPhysicalMaterial({ color: b.color, roughness: 0.42, clearcoat: 0.5 }), reveal));
      const g = new Group();
      g.position.y = b.y + b.h / 2;
      g.rotation.y = b.ry;
      g.add(mesh(track(new RoundedBoxGeometry(b.w, b.h, b.d, 3, 0.04)), cover));
      g.add(mesh(track(new RoundedBoxGeometry(b.w - 0.08, b.h - 0.07, b.d - 0.02, 2, 0.02)), pageMat, { pos: [0.05, 0, 0] }));
      perch.add(g);
    }
    perch.position.y = -0.74;
    root.add(perch);
    bob.position.y = 0;
    // Soft contact shadow under the stack.
    const shadow = mesh(
      track(new PlaneGeometry(2.8, 2.8)),
      track(new MeshBasicMaterial({ map: track(shadowTexture()), transparent: true, depthWrite: false })),
      { pos: [0, -0.76, 0], rot: [-Math.PI / 2, 0, 0], name: "shadow" }
    );
    root.add(shadow);
  }

  const rig = { root, bob, body, head, eyes, wings, tassel, cap, beak, perch };
  return {
    root,
    rig,
    reveal,
    materials: mat,
    /** Model height in local units (feet → cap top), useful for the reveal bounds. */
    height: 2.85,
    dispose() {
      disposables.forEach((d) => d.dispose?.());
    },
  };
}

/* ---------- animation ---------- */

const EXPRESSIONS = {
  //          upper lid (1 = open), lower lid (0 = down), head roll, head pitch
  idle: { upper: 1, lower: 0, roll: 0, pitch: 0, smile: 0 },
  happy: { upper: 0.05, lower: 0.35, roll: 0.07, pitch: -0.04, smile: 1 },
  curious: { upper: 1.05, lower: 0, roll: 0.26, pitch: 0.06, smile: 0 },
  thinking: { upper: 0.8, lower: 0.18, roll: -0.16, pitch: -0.16, smile: 0 },
  surprised: { upper: 1.15, lower: -0.1, roll: 0, pitch: 0.08, smile: 0 },
};

const damp = (a, b, lambda, dt) => MathUtils.lerp(a, b, 1 - Math.exp(-lambda * dt));
const tmp = new Vector3();

/**
 * Procedural behaviour layer. Call `update(dt, t, state)` every frame.
 * state: { look?: Vector3 (world), expression?: keyof EXPRESSIONS,
 *          wave?: 0..1 (right-wing wave), energy?: 0..1, still?: boolean }
 * Use `flap()` for a quick two-wing gesture (e.g. when the test starts).
 */
export function createRajuAnimator(raju) {
  const { head, eyes, wings, tassel, bob, body } = raju.rig;
  const s = {
    yaw: 0,
    pitch: 0,
    roll: 0,
    upper: 1,
    lower: 0,
    smile: 0,
    blink: 0,
    nextBlink: 1.5,
    blinkT: -1,
    doubleBlink: false,
    flapT: -1,
    wave: 0,
    tasselV: 0,
    tasselA: 0,
    lastYaw: 0,
  };

  function blinkAmount(t) {
    if (s.blinkT < 0) return 0;
    const k = (t - s.blinkT) / 0.17;
    if (k >= 1) {
      if (s.doubleBlink) {
        s.doubleBlink = false;
        s.blinkT = t + 0.08;
      } else s.blinkT = -1;
      return 0;
    }
    return k < 0 ? 0 : Math.sin(k * Math.PI);
  }

  return {
    flap(t) {
      s.flapT = t;
    },
    /** Snap to a pose instantly (posters, reduced motion). */
    pose(state) {
      const e = EXPRESSIONS[state.expression || "idle"];
      s.upper = e.upper;
      s.lower = e.lower;
      s.smile = e.smile;
      s.roll = e.roll;
      s.pitch = e.pitch + (state.pitch || 0);
      s.yaw = state.yaw || 0;
      s.wave = state.wave || 0;
      this.apply(0, 0);
    },
    update(dt, t, state = {}) {
      dt = Math.min(dt, 0.05);
      const e = EXPRESSIONS[state.expression || "idle"];
      const still = Boolean(state.still);

      // Look-at in head-parent space, clamped so the neck never looks broken.
      let yawT = 0;
      let pitchT = 0;
      if (state.look) {
        tmp.copy(state.look);
        head.parent.worldToLocal(tmp);
        tmp.sub(head.position);
        yawT = MathUtils.clamp(Math.atan2(tmp.x, tmp.z), -0.65, 0.65);
        pitchT = MathUtils.clamp(-Math.atan2(tmp.y, Math.hypot(tmp.x, tmp.z)), -0.22, 0.22);
      }
      s.yaw = damp(s.yaw, yawT, 5, dt);
      s.pitch = damp(s.pitch, pitchT + e.pitch, 5, dt);
      s.roll = damp(s.roll, e.roll, 4, dt);
      s.upper = damp(s.upper, e.upper, 10, dt);
      s.lower = damp(s.lower, e.lower, 10, dt);
      s.smile = damp(s.smile, e.smile, 10, dt);
      s.wave = damp(s.wave, state.wave || 0, 4, dt);

      // Natural blinking: 2–5 s apart, sometimes a double blink.
      if (!still && t > s.nextBlink && s.blinkT < 0) {
        s.blinkT = t;
        s.doubleBlink = Math.random() < 0.2;
        s.nextBlink = t + 2 + Math.random() * 3;
      }
      s.blink = still ? 0 : blinkAmount(t);
      this.apply(dt, t, still, state.energy || 0);
    },
    apply(dt, t, still = true, energy = 0) {
      const breathe = still ? 0 : Math.sin(t * 1.7);
      bob.position.y = breathe * 0.025 * (1 + energy * 0.6);
      body.scale.set(1 + breathe * 0.008, 1 + breathe * 0.014, 1 + breathe * 0.008);

      head.rotation.set(s.pitch, s.yaw, s.roll + (still ? 0 : Math.sin(t * 0.9) * 0.015));
      // Eyes lead the head a little for a lively gaze.
      for (const ey of eyes) {
        ey.eye.rotation.set(s.pitch * 0.35, s.yaw * 0.45, 0);
        const up = Math.max(0, s.upper - s.blink * 1.2);
        const low = Math.min(1, s.lower + s.blink * 0.55);
        // Upper lid: closed covers the front (+1.35); open tucks fully behind the eye (≤ -2).
        ey.upper.rotation.x = MathUtils.lerp(1.35, -2.05, MathUtils.clamp(up, 0, 1.15));
        // Lower lid: down tucks behind (+1.9); raised gives the happy "smile" squint.
        ey.lower.rotation.x = MathUtils.lerp(1.9, -0.5, MathUtils.clamp(low, -0.1, 1));
        ey.smile.scale.setScalar(Math.max(0.001, s.smile));
      }

      // Wings: gentle idle sway, a right-wing wave, and a two-wing flap gesture.
      const flapK = s.flapT >= 0 ? (t - s.flapT) / 0.9 : 2;
      const flap = flapK < 1 ? Math.sin(flapK * Math.PI * 3) * (1 - flapK) * 0.7 : 0;
      if (flapK >= 1) s.flapT = -1;
      const sway = still ? 0 : Math.sin(t * 1.7 + 0.6) * 0.03;
      wings[0].rotation.z = -sway - flap;
      // Wave: wing raised up-and-out like a hand saying "hai!", rocking side to side.
      wings[1].rotation.z = sway + flap + s.wave * (2.25 + Math.sin(t * 7) * 0.28);
      wings[1].rotation.x = -s.wave * 0.25;
      wings[1].rotation.y = -s.wave * 0.9;

      // Tassel: damped pendulum pushed by head yaw speed (never jitters).
      if (dt > 0) {
        const yawVel = (s.yaw - s.lastYaw) / dt;
        s.lastYaw = s.yaw;
        const acc = -s.tasselA * 22 - s.tasselV * 4.5 - yawVel * 2.2;
        s.tasselV += acc * dt;
        s.tasselA = MathUtils.clamp(s.tasselA + s.tasselV * dt, -0.7, 0.7);
      }
      tassel.rotation.z = s.tasselA + (still ? 0 : Math.sin(t * 1.3) * 0.04);
      tassel.rotation.x = s.tasselA * 0.4;
    },
  };
}
