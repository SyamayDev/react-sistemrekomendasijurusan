/**
 * RAJU asset pipeline — renders the procedural 3D mascot (src/components/three/raju)
 * to the website's fallback posters and exports a portable .glb.
 *
 *   npm run raju:export
 *
 * Needs a local Chrome/Edge (set CHROME_PATH if it isn't found automatically).
 * Outputs:
 *   src/assets/raju/*.webp      transparent posters (no-WebGL / loading fallback)
 *   assets-src/raju/raju.glb    the model for Blender, AR viewers, etc. (not deployed)
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createServer } from "vite";
import puppeteer from "puppeteer-core";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error("Chrome/Edge not found. Set CHROME_PATH=/path/to/chrome");
  process.exit(1);
}

const POSTERS = [
  { name: "raju-hero", pose: "poster-hero", size: 860 },
  { name: "raju-hero-560", pose: "poster-hero", size: 560 }, // phones (srcset)
  { name: "raju-curious", pose: "poster-curious", size: 720 },
  { name: "raju-wave", pose: "poster-wave", size: 720 },
  { name: "raju-thinking", pose: "poster-thinking", size: 560 },
];

const root = process.cwd();
const outPosters = path.join(root, "src/assets/raju");
const outModel = path.join(root, "assets-src/raju");
mkdirSync(outPosters, { recursive: true });
mkdirSync(outModel, { recursive: true });

const server = await createServer({ logLevel: "error", server: { port: 5310, strictPort: false } });
await server.listen();
const base = server.resolvedUrls.local[0];

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars"],
});
try {
  for (const p of POSTERS) {
    const page = await browser.newPage();
    await page.setViewport({ width: p.size, height: p.size });
    await page.goto(`${base}tools/raju/viewer.html?size=${p.size}&pose=${p.pose}`, { waitUntil: "networkidle0" });
    await page.waitForFunction("window.__ready === true", { timeout: 60000 });
    const file = path.join(outPosters, `${p.name}.webp`);
    await page.screenshot({ path: file, type: "webp", quality: 82, omitBackground: true });
    console.log("poster", path.relative(root, file));
    await page.close();
  }
  const page = await browser.newPage();
  await page.goto(`${base}tools/raju/viewer.html?size=256&pose=front`, { waitUntil: "networkidle0" });
  await page.waitForFunction("window.__ready === true", { timeout: 60000 });
  const bytes = await page.evaluate(() => window.__exportGlb());
  const glb = path.join(outModel, "raju.glb");
  writeFileSync(glb, Buffer.from(bytes));
  console.log("model ", path.relative(root, glb), `${(bytes.length / 1024).toFixed(0)} KB`);
} finally {
  await browser.close();
  await server.close();
}
