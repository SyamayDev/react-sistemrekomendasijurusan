/**
 * Renders a 1080×1350 (4:5, Instagram-friendly) result card with Canvas 2D.
 * Replaces html2canvas: no 45 KB dependency, crisp text, identical output on
 * every device. Loaded lazily only when the student taps "Unduh".
 */
import { CATEGORY_BY_ID } from "../../lib/categories.js";
import { dominantTypes } from "../../lib/riasec.js";

const W = 1080;
const H = 1350;
const FONT = '"Plus Jakarta Sans Variable", "Plus Jakarta Sans", system-ui, sans-serif';

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function wrap(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

async function owlImage() {
  const svg = document.querySelector("svg.owl");
  if (!svg) return null;
  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", "400");
  clone.setAttribute("height", "440");
  clone.removeAttribute("style");
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
  const img = new Image();
  img.src = url;
  await img.decode().catch(() => null);
  return img.complete && img.naturalWidth ? img : null;
}

/** @returns {Promise<Blob>} PNG */
export async function renderShareImage(result, siteLabel) {
  await Promise.all([
    document.fonts.load(`800 72px ${FONT}`),
    document.fonts.load(`600 32px ${FONT}`),
  ]).catch(() => {});
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Night sky.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#040817");
  bg.addColorStop(0.6, "#0a1433");
  bg.addColorStop(1, "#101c48");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, c] of [
    [860, 160, 520, "rgba(86,112,255,0.35)"],
    [120, 1100, 480, "rgba(126,92,255,0.25)"],
    [980, 1250, 380, "rgba(255,176,64,0.18)"],
  ]) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, c);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 140; i++) {
    ctx.globalAlpha = 0.25 + rand() * 0.6;
    ctx.fillStyle = rand() > 0.85 ? "#FFD98A" : "#FFFFFF";
    ctx.beginPath();
    ctx.arc(rand() * W, rand() * H, rand() * 2 + 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Header.
  const owl = await owlImage();
  if (owl) ctx.drawImage(owl, 72, 64, 120, 132);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 44px ${FONT}`;
  ctx.fillText("SI-RAJU", 210, 128);
  ctx.fillStyle = "#AAB3D3";
  ctx.font = `600 26px ${FONT}`;
  ctx.fillText("Tes Minat Bakat & Rekomendasi Jurusan", 210, 170);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 84px ${FONT}`;
  ctx.fillText("Peta jurusanku", 72, 320);
  const [t1, t2] = dominantTypes(result.profile);
  ctx.fillStyle = "#FFC53D";
  ctx.font = `700 34px ${FONT}`;
  ctx.fillText(`Tipe minat: ${t1.nama} – ${t2.nama}`, 72, 380);

  // #1 card.
  const top = result.ranked[0];
  rounded(ctx, 72, 430, W - 144, 360, 44);
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 2;
  ctx.stroke();
  const cx = 250;
  const cy = 610;
  ctx.lineWidth = 22;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.beginPath();
  ctx.arc(cx, cy, 120, 0, Math.PI * 2);
  ctx.stroke();
  const arc = ctx.createLinearGradient(cx - 120, cy - 120, cx + 120, cy + 120);
  arc.addColorStop(0, "#8CA2FF");
  arc.addColorStop(1, "#FFC53D");
  ctx.strokeStyle = arc;
  ctx.shadowColor = "rgba(255,197,61,0.6)";
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(cx, cy, 120, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * top.score) / 100);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.font = `800 76px ${FONT}`;
  ctx.fillText(`${top.score}%`, cx, cy + 22);
  ctx.textAlign = "left";
  ctx.fillStyle = "#FFC53D";
  ctx.font = `700 26px ${FONT}`;
  ctx.fillText("#1 PALING COCOK", 420, 540);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 54px ${FONT}`;
  const nameLines = wrap(ctx, top.nama_jurusan, W - 144 - 380);
  nameLines.slice(0, 3).forEach((l, i) => ctx.fillText(l, 420, 610 + i * 62));
  ctx.fillStyle = "#AAB3D3";
  ctx.font = `600 28px ${FONT}`;
  ctx.fillText(CATEGORY_BY_ID[top.kategori]?.nama || top.kategori, 420, 620 + Math.min(3, nameLines.length) * 62);

  // #2–#4.
  result.ranked.slice(1, 4).forEach((mj, i) => {
    const y = 860 + i * 118;
    ctx.fillStyle = "#AAB3D3";
    ctx.font = `700 28px ${FONT}`;
    ctx.fillText(`#${i + 2}`, 72, y + 34);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `700 34px ${FONT}`;
    ctx.fillText(wrap(ctx, mj.nama_jurusan, 640)[0], 140, y + 34);
    ctx.textAlign = "right";
    ctx.fillText(`${mj.score}%`, W - 72, y + 34);
    ctx.textAlign = "left";
    rounded(ctx, 140, y + 58, W - 212, 14, 7);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fill();
    rounded(ctx, 140, y + 58, ((W - 212) * mj.score) / 100, 14, 7);
    ctx.fillStyle = CATEGORY_BY_ID[mj.kategori]?.warna || "#8CA2FF";
    ctx.fill();
  });

  // Footer.
  ctx.fillStyle = "#FFC53D";
  ctx.font = `800 32px ${FONT}`;
  ctx.fillText("Coba tesnya gratis →", 72, H - 110);
  ctx.fillStyle = "#AAB3D3";
  ctx.font = `600 26px ${FONT}`;
  ctx.fillText(siteLabel, 72, H - 66);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}
