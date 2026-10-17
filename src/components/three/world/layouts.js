/**
 * Deterministic layouts for the 150 "major tiles" and the supporting cast.
 * Each layout is a Float32Array of xyz per tile, computed once.
 */
import majors from "../../../data/majors.json";
import { CATEGORIES, CATEGORY_IDS } from "../../../lib/categories.js";
import { RIASEC } from "../../../lib/riasec.js";

export const OWL_CENTER = [0, 1.25, 0];
export const N = majors.length;

export function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(2026);
const gauss = () => {
  let u = 0;
  let v = 0;
  while (!u) u = rand();
  while (!v) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

export const tileCategory = Uint8Array.from(majors.map((m) => Math.max(0, CATEGORY_IDS.indexOf(m.kategori))));
export const tileSeed = Float32Array.from(majors.map(() => rand()));
export const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
export const CATEGORY_RGB = CATEGORIES.map((c) => hexToRgb(c.warna));

function layout(fn) {
  const a = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) a.set(fn(i), i * 3);
  return a;
}

/** Hero: a wide, gently inclined halo far behind RAJU. Each tile keeps its
 *  angle/radius so the ring can spin about its own centre. */
const HALO_ANG = new Float32Array(N);
const HALO_RAD = new Float32Array(N);
const HALO_Y = new Float32Array(N);
for (let i = 0; i < N; i++) {
  HALO_ANG[i] = (i / N) * Math.PI * 2;
  HALO_RAD[i] = 6.2 + gauss() * 0.4;
  HALO_Y[i] = 1.5 + Math.sin(HALO_ANG[i] * 3) * 0.45 + gauss() * 0.18;
}
export function haloAt(i, spin, out, scale = 1) {
  const a = HALO_ANG[i] + spin;
  const r = HALO_RAD[i] * scale;
  return out.set(Math.cos(a) * r, HALO_Y[i], Math.sin(a) * r * 0.5 - 3.6);
}
export const HALO = layout((i) => {
  const a = HALO_ANG[i];
  return [Math.cos(a) * HALO_RAD[i], HALO_Y[i], Math.sin(a) * HALO_RAD[i] * 0.5 - 3.6];
});

/** Confusion: a tumbling cloud close around RAJU (kept clear of his face). */
export const CHAOS = layout(() => {
  let x;
  let y;
  let z;
  do {
    const r = 1.7 + rand() * 2.3;
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    x = r * Math.sin(ph) * Math.cos(th);
    y = 1.3 + r * Math.cos(ph) * 0.8;
    z = r * Math.sin(ph) * Math.sin(th);
  } while (z > 0.4 && Math.abs(x) < 1.3 && y > 0.4 && y < 2.6);
  return [x, y, z];
});

/** Order: the same tiles settled into three neat orbits. The near side dips
 *  below RAJU's face and the far side rises behind his head, so the rings
 *  read as seen from slightly above and never cover his eyes. */
export function orbitAt(i, spin, out, scale = 1) {
  const ring = i % 3;
  const a = (Math.floor(i / 3) / (N / 3)) * Math.PI * 2 + ring * 0.4 + spin * (1 + ring * 0.25);
  const r = (2.6 + ring * 0.65) * scale;
  return out.set(Math.cos(a) * r, 1.25 - Math.sin(a) * r * 0.2, Math.sin(a) * r * 0.55 - 0.7);
}
export const ORBIT = layout((i) => {
  const ring = i % 3;
  const a = (Math.floor(i / 3) / (N / 3)) * Math.PI * 2 + ring * 0.4;
  const r = 2.6 + ring * 0.65;
  return [Math.cos(a) * r, 1.25 - Math.sin(a) * r * 0.2, Math.sin(a) * r * 0.55 - 0.7];
});

/** How-it-works: a "data wall" of all majors (15 × 10) to the right of RAJU. */
export const WALL = layout((i) => {
  const col = i % 15;
  const row = Math.floor(i / 15);
  return [1.9 + col * 0.34, 2.75 - row * 0.34, -0.6 - Math.abs(col - 7) * 0.03];
});

/** Rumpun planets on a tilted ring around RAJU. */
export const PLANET_RING_R = 3.9;
export const PLANETS = CATEGORIES.map((c, k) => {
  const a = (k / CATEGORIES.length) * Math.PI * 2 - Math.PI / 2 + 0.35;
  return {
    id: c.id,
    color: c.warna,
    radius: 0.24 + Math.sqrt(c.jumlah) * 0.055,
    pos: [Math.cos(a) * PLANET_RING_R, 0.9 + Math.sin(a) * 0.55, Math.sin(a) * PLANET_RING_R * 0.62],
    ringed: k % 3 === 1,
  };
});

/** Semesta: each major orbits its own rumpun planet. */
export const CLUSTERS = layout((i) => {
  const p = PLANETS[tileCategory[i]];
  const a = rand() * Math.PI * 2;
  const r = p.radius + 0.35 + rand() * 0.6;
  return [p.pos[0] + Math.cos(a) * r, p.pos[1] + gauss() * 0.28, p.pos[2] + Math.sin(a) * r];
});

/** Finale: the 150 tiles become the rim of the portal. */
export const PORTAL_CENTER = [0, 2.2, -1.4];
export const PORTAL_R = 2.85;
export const RIM = layout((i) => {
  const a = (i / N) * Math.PI * 2;
  const r = PORTAL_R + 0.38 + gauss() * 0.12;
  return [PORTAL_CENTER[0] + Math.cos(a) * r, PORTAL_CENTER[1] + Math.sin(a) * r, PORTAL_CENTER[2] + gauss() * 0.12];
});

/** RIASEC orbs: a hexagon around RAJU's head, R at the top, clockwise. */
export const ORB_COLORS = { R: "#ff9f6b", I: "#5b8cff", A: "#ff8fd8", S: "#2fd3a0", E: "#ffc53d", C: "#b48cff" };
export const ORBS = RIASEC.map((d, k) => {
  const a = -Math.PI / 2 + (k / 6) * Math.PI * 2;
  return { key: d.key, nama: d.nama, color: ORB_COLORS[d.key], pos: [Math.cos(a) * 2.35, 1.55 - Math.sin(a) * 2.05, 0.35] };
});

/** A friendly sample profile used to illustrate "your shape" (not real user data). */
export const SAMPLE_PROFILE = { R: 0.45, I: 0.92, A: 0.68, S: 0.5, E: 0.38, C: 0.62 };

/** Demo match strengths for the data wall (illustration only, deterministic). */
export const DEMO_MATCH = Float32Array.from({ length: N }, (_, i) => {
  const c = tileCategory[i];
  const base = [0.85, 0.55, 0.45, 0.4, 0.35, 0.5, 0.42, 0.38][c];
  return Math.min(1, Math.max(0, base + (tileSeed[i] - 0.5) * 0.5));
});
export const DEMO_TOP = DEMO_MATCH.indexOf(Math.max(...DEMO_MATCH));
