/**
 * Procedural canvas textures for RAJU — no image files, crisp at any size.
 * Sphere UVs put the front (+Z) at u = 0.25, so artwork is centred there.
 */
import { CanvasTexture, SRGBColorSpace } from "three";

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")];
}

function tex(c, srgb = true) {
  const t = new CanvasTexture(c);
  if (srgb) t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Eye: deep navy with a soft iris ring, the brand's yellow bar-chart pupil and a catchlight. */
export function eyeTextures() {
  const W = 1024;
  const H = 512;
  const cx = W * 0.25;
  const cy = H * 0.5;
  // Pixels per degree are equal on both axes (2:1 canvas for 360°×180°).
  const [c, g] = canvas(W, H);
  g.fillStyle = "#0b1438";
  g.fillRect(0, 0, W, H);
  const ring = g.createRadialGradient(cx, cy, 30, cx, cy, 120);
  ring.addColorStop(0, "#132157");
  ring.addColorStop(0.7, "#0e1a47");
  ring.addColorStop(1, "#0b1438");
  g.fillStyle = ring;
  g.beginPath();
  g.ellipse(cx, cy, 120, 120, 0, 0, Math.PI * 2);
  g.fill();

  const bars = [
    [-46, 34],
    [-14, 56],
    [18, 80],
  ];
  const drawBars = (ctx, color) => {
    ctx.fillStyle = color;
    for (const [x, h] of bars) {
      ctx.beginPath();
      ctx.roundRect(cx + x, cy + 40 - h, 24, h, 6);
      ctx.fill();
    }
  };
  drawBars(g, "#ffc53d");
  // Catchlights (painted, so the eye sparkles even in flat light).
  g.fillStyle = "rgba(255,255,255,0.95)";
  g.beginPath();
  g.ellipse(cx + 42, cy - 58, 20, 20, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(255,255,255,0.55)";
  g.beginPath();
  g.ellipse(cx - 52, cy - 52, 8, 8, 0, 0, Math.PI * 2);
  g.fill();

  const [e, ge] = canvas(W, H);
  ge.fillStyle = "#000";
  ge.fillRect(0, 0, W, H);
  drawBars(ge, "#ffb21f");

  return { map: tex(c), emissiveMap: tex(e) };
}

/** Belly: soft cream with rows of feather chevrons. */
export function bellyTexture() {
  const W = 1024;
  const H = 512;
  const [c, g] = canvas(W, H);
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#fbfcff");
  grad.addColorStop(1, "#e2e9fb");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "#b9c6ee";
  g.lineWidth = 7;
  g.lineCap = "round";
  g.lineJoin = "round";
  const cx = W * 0.25;
  const rows = [
    [H * 0.46, [-34, 34]],
    [H * 0.58, [-68, 0, 68]],
    [H * 0.7, [-34, 34]],
  ];
  for (const [y, xs] of rows) {
    for (const x of xs) {
      g.beginPath();
      g.moveTo(cx + x - 15, y - 9);
      g.lineTo(cx + x, y + 6);
      g.lineTo(cx + x + 15, y - 9);
      g.stroke();
    }
  }
  return tex(c);
}

/** Soft round contact shadow. */
export function shadowTexture() {
  const [c, g] = canvas(256, 256);
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, "rgba(4,8,23,0.55)");
  r.addColorStop(0.55, "rgba(4,8,23,0.22)");
  r.addColorStop(1, "rgba(4,8,23,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  return tex(c, false);
}

/** Book page edges: fine horizontal lines. */
export function pagesTexture() {
  const [c, g] = canvas(64, 64);
  g.fillStyle = "#f6f2e7";
  g.fillRect(0, 0, 64, 64);
  g.strokeStyle = "rgba(160,150,125,0.35)";
  g.lineWidth = 1;
  for (let y = 3; y < 64; y += 5) {
    g.beginPath();
    g.moveTo(0, y + 0.5);
    g.lineTo(64, y + 0.5);
    g.stroke();
  }
  return tex(c);
}
