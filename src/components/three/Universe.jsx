/**
 * "Semesta Jurusan" — every one of the 150 majors is a star, clustered by
 * field (rumpun) and stitched into constellations. The scene listens to the
 * shared scene store every frame:
 *   hero   → slow drift, a soft glow sweeps across the fields
 *   quiz   → camera leans in; answers send a ripple, likely fields brighten
 *   result → your #1 major flares, its field glows, everything feels alive
 * Everything is 4 draw calls (stars, lines, dust, nebulae) with custom
 * shaders, so it stays at 60 fps on mid-range phones.
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  NormalBlending,
  PlaneGeometry,
  ShaderMaterial,
} from "three";
import majors from "../../data/majors.json";
import { CATEGORIES, CATEGORY_IDS } from "../../lib/categories.js";
import { pointer, scene } from "../../lib/sceneStore.js";
import * as S from "./shaders.js";

/* ---------- deterministic layout ---------- */
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

function buildStars() {
  const rand = mulberry32(2026);
  const gauss = () => {
    let u = 0;
    let v = 0;
    while (!u) u = rand();
    while (!v) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const centers = CATEGORY_IDS.map((_, i) => {
    const a = (i / CATEGORY_IDS.length) * Math.PI * 2 + 0.35;
    return [Math.cos(a) * 4.9, Math.sin(a) * 2.8, Math.sin(a * 2) * 1.5];
  });
  const n = majors.length;
  const position = new Float32Array(n * 3);
  const color = new Float32Array(n * 3);
  const size = new Float32Array(n);
  const seed = new Float32Array(n);
  const category = new Uint8Array(n);
  majors.forEach((m, i) => {
    const c = Math.max(0, CATEGORY_IDS.indexOf(m.kategori));
    const [cx, cy, cz] = centers[c];
    position.set([cx + gauss() * 0.72, cy + gauss() * 0.58, cz + gauss() * 0.7], i * 3);
    color.set(hexToRgb(CATEGORIES[c].warna), i * 3);
    size[i] = 0.85 + rand() * 0.95;
    seed[i] = rand();
    category[i] = c;
  });

  // Constellation lines: link each star to its two nearest siblings.
  const seen = new Set();
  const lines = [];
  const lineColors = [];
  for (let i = 0; i < n; i++) {
    const near = [];
    for (let j = 0; j < n; j++) {
      if (i === j || category[i] !== category[j]) continue;
      const dx = position[i * 3] - position[j * 3];
      const dy = position[i * 3 + 1] - position[j * 3 + 1];
      const dz = position[i * 3 + 2] - position[j * 3 + 2];
      near.push([dx * dx + dy * dy + dz * dz, j]);
    }
    near.sort((a, b) => a[0] - b[0]);
    for (const [d2, j] of near.slice(0, 2)) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key) || d2 > 2.6) continue;
      seen.add(key);
      lines.push(...position.slice(i * 3, i * 3 + 3), ...position.slice(j * 3, j * 3 + 3));
      const rgb = hexToRgb(CATEGORIES[category[i]].warna);
      lineColors.push(...rgb, ...rgb);
    }
  }
  return { position, color, size, seed, category, lines: new Float32Array(lines), lineColors: new Float32Array(lineColors) };
}

function buildDust(count) {
  const rand = mulberry32(7);
  const position = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = 6 + rand() * 12;
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    position.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.7, r * Math.cos(ph) - 4], i * 3);
    size[i] = 0.6 + rand() * 1.6;
    seed[i] = rand();
  }
  return { position, size, seed };
}

/* ---------- per-mode targets ---------- */
const MODES = {
  hero: { speed: 0.035, z: 10, x: -1.6, energy: 0, lines: 0.16 },
  quiz: { speed: 0.025, z: 8.4, x: 0, energy: 0.15, lines: 0.12 },
  result: { speed: 0.055, z: 9, x: 0, energy: 0.6, lines: 0.22 },
  off: { speed: 0.02, z: 10, x: 0, energy: 0, lines: 0.1 },
};
const lerp = (a, b, t) => a + (b - a) * t;

export default function Universe({ tier = "mid" }) {
  const group = useRef(null);
  const dustRef = useRef(null);
  const { camera, size, gl } = useThree();
  const stars = useMemo(() => buildStars(), []);
  const dust = useMemo(() => buildDust(tier === "high" ? 1400 : 700), [tier]);

  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(stars.position, 3));
    g.setAttribute("aColor", new BufferAttribute(stars.color, 3));
    g.setAttribute("aSize", new BufferAttribute(stars.size, 1));
    g.setAttribute("aSeed", new BufferAttribute(stars.seed, 1));
    g.setAttribute("aFocus", new BufferAttribute(new Float32Array(majors.length), 1));
    g.setAttribute("aHighlight", new BufferAttribute(new Float32Array(majors.length), 1));
    const lines = new BufferGeometry();
    lines.setAttribute("position", new BufferAttribute(stars.lines, 3));
    lines.setAttribute("aColor", new BufferAttribute(stars.lineColors, 3));
    const d = new BufferGeometry();
    d.setAttribute("position", new BufferAttribute(dust.position, 3));
    d.setAttribute("aSize", new BufferAttribute(dust.size, 1));
    d.setAttribute("aSeed", new BufferAttribute(dust.seed, 1));
    return { stars: g, lines, dust: d, plane: new PlaneGeometry(1, 1) };
  }, [stars, dust]);

  const mats = useMemo(() => {
    const common = { transparent: true, depthWrite: false, blending: AdditiveBlending };
    const pr = Math.min(gl.getPixelRatio(), 2);
    return {
      stars: new ShaderMaterial({
        ...common,
        vertexShader: S.starVertex,
        fragmentShader: S.starFragment,
        uniforms: { uTime: { value: 0 }, uSize: { value: 78 }, uPixelRatio: { value: pr }, uEnergy: { value: 0 }, uPulse: { value: -1 }, uOpacity: { value: 1 }, uDawn: { value: 0 } },
      }),
      lines: new ShaderMaterial({ ...common, vertexShader: S.lineVertex, fragmentShader: S.lineFragment, uniforms: { uOpacity: { value: 0.16 } } }),
      dust: new ShaderMaterial({
        ...common,
        vertexShader: S.dustVertex,
        fragmentShader: S.dustFragment,
        uniforms: { uTime: { value: 0 }, uSize: { value: 26 }, uPixelRatio: { value: pr }, uColor: { value: [0.78, 0.84, 1] }, uOpacity: { value: 0.75 } },
      }),
      nebulae: [
        ["#4A63FF", 0.28, [3.5, 2.2, -7], 15],
        ["#7B4DFF", 0.2, [-5.5, -2.5, -8], 17],
        ["#FFB040", 0.1, [6, -3.5, -9], 13],
      ].map(([hex, opacity, pos, scale]) => ({
        pos,
        scale,
        base: opacity,
        mat: new ShaderMaterial({
          ...common,
          vertexShader: S.nebulaVertex,
          fragmentShader: S.nebulaFragment,
          uniforms: { uColor: { value: hexToRgb(hex) }, uOpacity: { value: opacity }, uTime: { value: 0 } },
        }),
      })),
    };
  }, [gl]);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      [mats.stars, mats.lines, mats.dust, ...mats.nebulae.map((n) => n.mat)].forEach((m) => m.dispose());
    },
    [geo, mats]
  );

  // Smoothed state, mutated every frame.
  const cur = useRef({ speed: 0.03, z: 10, x: 0, energy: 0, lines: 0.16, dawn: -1, focus: new Float32Array(8), hi: -1 });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const c = cur.current;
    const target = MODES[scene.mode] || MODES.off;
    const portrait = size.width < size.height;
    const k = 1 - Math.pow(0.001, dt); // frame-rate independent smoothing

    c.speed = lerp(c.speed, target.speed, k);
    c.z = lerp(c.z, target.z - scene.heroScroll * 2.6, k);
    c.x = lerp(c.x, portrait ? 0 : target.x, k);
    c.energy = lerp(c.energy, Math.max(target.energy, scene.energy), k * 0.6);
    c.lines = lerp(c.lines, target.lines, k);

    // Palette switch (night ↔ dawn) swaps blending once.
    const dawn = scene.palette === "dawn" ? 1 : 0;
    if (dawn !== c.dawn) {
      c.dawn = dawn;
      const blending = dawn ? NormalBlending : AdditiveBlending;
      [mats.stars, mats.lines, mats.dust, ...mats.nebulae.map((n) => n.mat)].forEach((m) => {
        m.blending = blending;
        m.needsUpdate = true;
      });
      mats.dust.uniforms.uColor.value = dawn ? [0.25, 0.32, 0.6] : [0.78, 0.84, 1];
    }

    const g = group.current;
    g.rotation.y += c.speed * dt;
    g.rotation.x = lerp(g.rotation.x, -0.22 + pointer.y * 0.1, k * 0.5);
    g.scale.setScalar(portrait ? Math.max(0.56, (size.width / size.height) * 1.1) : 1);
    if (dustRef.current) dustRef.current.rotation.y -= c.speed * 0.4 * dt;

    camera.position.x = lerp(camera.position.x, c.x + pointer.x * 0.7, k * 0.6);
    camera.position.y = lerp(camera.position.y, pointer.y * 0.45, k * 0.6);
    camera.position.z = c.z;
    camera.lookAt(c.x * 0.4, 0, 0);

    // Field emphasis: idle "breathing" sweep on the hero, data-driven elsewhere.
    const focusAttr = geo.stars.attributes.aFocus;
    const hiAttr = geo.stars.attributes.aHighlight;
    for (let i = 0; i < 8; i++) {
      const goal =
        scene.mode === "hero" ? 0.55 * Math.pow(Math.max(0, Math.sin(t * 0.45 - i * 0.785)), 6) : scene.focus[i] || 0;
      c.focus[i] = lerp(c.focus[i], goal, k * 0.5);
    }
    for (let i = 0; i < majors.length; i++) {
      focusAttr.array[i] = c.focus[stars.category[i]];
      hiAttr.array[i] = lerp(hiAttr.array[i], i === scene.highlight ? 1 : 0, k * 0.4);
    }
    focusAttr.needsUpdate = true;
    hiAttr.needsUpdate = true;

    const u = mats.stars.uniforms;
    u.uTime.value = t;
    u.uEnergy.value = c.energy;
    u.uDawn.value = lerp(u.uDawn.value, dawn, k);
    u.uOpacity.value = dawn ? 0.9 : 1;
    const since = scene.pulseAt < 0 ? Infinity : (performance.now() - scene.pulseAt) / 1500;
    u.uPulse.value = since < 1 ? since : -1;
    mats.lines.uniforms.uOpacity.value = c.lines * (dawn ? 0.75 : 1) * (1 + c.energy * 0.6);
    mats.dust.uniforms.uTime.value = t;
    mats.dust.uniforms.uOpacity.value = dawn ? 0.35 : 0.75;
    for (const n of mats.nebulae) {
      n.mat.uniforms.uTime.value = t;
      n.mat.uniforms.uOpacity.value = n.base * (dawn ? 0.35 : 1) * (1 + c.energy * 0.5);
    }
  });

  return (
    <>
      {mats.nebulae.map((n, i) => (
        <mesh key={i} geometry={geo.plane} material={n.mat} position={n.pos} scale={n.scale} />
      ))}
      <points ref={dustRef} geometry={geo.dust} material={mats.dust} />
      <group ref={group} rotation={[-0.22, 0, 0]}>
        <lineSegments geometry={geo.lines} material={mats.lines} />
        <points geometry={geo.stars} material={mats.stars} />
      </group>
    </>
  );
}
