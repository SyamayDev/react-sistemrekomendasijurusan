/**
 * Static site generation. Runs after `vite build` (client) and
 * `vite build --ssr` (server entry):
 *   1. renders every route to complete HTML with per-page <head> (SEO)
 *   2. preloads the web font and each route's JS chunk
 *   3. adds a Content-Security-Policy (hash-pinned inline theme script)
 *   4. writes sitemap.xml, robots.txt, 404.html and .nojekyll
 */
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");

const { render, routes, SITE } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);

const template = await readFile(path.join(dist, "index.html"), "utf8");
const manifest = JSON.parse(await readFile(path.join(dist, ".vite", "manifest.json"), "utf8"));
const base = template.match(/<script type="module" crossorigin src="([^"]*?)assets\//)?.[1] ?? "/";

/* ---------- preloads ---------- */
const assets = await readdir(path.join(dist, "assets"));
// Body text (Plus Jakarta Sans) and headlines (Bricolage Grotesque), latin subsets only.
const fonts = [/plus-jakarta-sans-latin-wght-normal.*\.woff2$/, /bricolage-grotesque-latin-wght-normal.*\.woff2$/].map((re) => assets.find((f) => re.test(f)));
const font = fonts.every(Boolean);
const fontPreload = fonts
  .filter(Boolean)
  .map((f) => `<link rel="preload" href="${base}assets/${f}" as="font" type="font/woff2" crossorigin>`)
  .join("\n    ");

const entryKey = Object.keys(manifest).find((k) => manifest[k].isEntry);
const entryFiles = new Set([manifest[entryKey].file, ...(manifest[entryKey].imports || []).map((i) => manifest[i].file)]);

function chunkFiles(key, seen = new Set()) {
  const chunk = manifest[key];
  if (!chunk || seen.has(key)) return [];
  seen.add(key);
  return [chunk.file, ...(chunk.imports || []).flatMap((i) => chunkFiles(i, seen))];
}

const PAGE = [
  [/^\/tes\//, "src/pages/Quiz.jsx"],
  [/^\/hasil\//, "src/pages/Result.jsx"],
  [/^\/jurusan\/$/, "src/pages/Majors.jsx"],
  [/^\/jurusan\/.+/, "src/pages/MajorDetail.jsx"],
  [/^\/tentang\//, "src/pages/About.jsx"],
  [/^\/privasi\//, "src/pages/Privacy.jsx"],
  [/^\/404\//, "src/pages/NotFound.jsx"],
];
/** Route chunks are listed in a meta tag; main.jsx preloads them right after
 * first paint (in parallel with React) so they never compete with it. */
/** Manifest key for a source module (shared chunks are keyed "_Name-hash.js"). */
const keyFor = (src) =>
  manifest[src] ? src : Object.keys(manifest).find((k) => manifest[k].src === src || manifest[k].name === path.basename(src, path.extname(src)));
const SHELL = ["src/boot.jsx", "src/App.jsx"].map(keyFor).filter(Boolean);
function routePreloads(p) {
  const page = PAGE.find(([re]) => re.test(p))?.[1];
  const keys = page ? [...SHELL, page] : SHELL;
  const files = [...new Set(keys.flatMap((k) => chunkFiles(k)))].filter((f) => f.endsWith(".js") && !entryFiles.has(f));
  return files.length ? `<meta name="siraju:modules" content="${files.map((f) => base + f).join(" ")}">` : "";
}

/* ---------- inline CSS ----------
 * The whole stylesheet is ~14 KB gzipped: inlining it removes the only
 * render-blocking request, so first paint needs nothing but the HTML. */
const cssHref = template.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/)?.[1];
const css = cssHref ? await readFile(path.join(dist, cssHref.slice(base.length)), "utf8") : null;
// A *disabled* link to the same file stays behind: browsers never fetch or
// apply it, but Vite's lazy-chunk loader sees it and won't re-inject the
// stylesheet (which would re-register @property/@font-face and force a full
// restyle + relayout of the page right after hydration).
const inlineCss = (html) =>
  css ? html.replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/, (_, href) => `<style>${css}</style>
    <link rel="stylesheet" href="${href}" disabled>`) : html;

/* ---------- script priority ----------
 * Pages are fully prerendered, so the app bundle is only needed to hydrate,
 * not to paint. Low priority (what async scripts get by default) lets the
 * HTML, inline CSS and font win the network; hydration follows right after. */
const lowPriorityScripts = (html) => html.replace('<script type="module" crossorigin src=', '<script type="module" crossorigin fetchpriority="low" src=');

/* ---------- CSP ---------- */
const themeScript = template.match(/<script>([\s\S]*?)<\/script>/)[1];
const scriptHash = createHash("sha256").update(themeScript).digest("base64");
const chatOrigin = new URL(process.env.VITE_CHAT_API_URL || "https://si-raju-backend.vercel.app/api/chat").origin;
const csp = [
  "default-src 'self'",
  `script-src 'self' 'sha256-${scriptHash}'`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' ${chatOrigin}`,
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");
const cspTag = `<meta http-equiv="Content-Security-Policy" content="${csp}">\n    <meta name="referrer" content="strict-origin-when-cross-origin">`;

/* ---------- render ---------- */
let count = 0;
for (const route of routes) {
  const { html, head } = await render(route.path);
  const page = lowPriorityScripts(inlineCss(template))
    .replace("<!--app-csp-->", cspTag)
    .replace(/<!--app-head-->[\s\S]*?<!--\/app-head-->/, head)
    .replace("<!--app-preload-->", [fontPreload, routePreloads(route.path)].filter(Boolean).join("\n    "))
    .replace("<!--app-html-->", html);
  const file = route.file ? path.join(dist, route.file) : path.join(dist, ...route.path.split("/").filter(Boolean), "index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, page);
  count++;
}

/* ---------- sitemap / robots / misc ---------- */
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .filter((r) => !r.noindex)
  .map((r) => `  <url><loc>${SITE.url}${r.path}</loc><lastmod>${today}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`)
  .join("\n")}
</urlset>
`;
await writeFile(path.join(dist, "sitemap.xml"), sitemap);
await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: ${base}hasil/\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
await writeFile(path.join(dist, ".nojekyll"), "");
await rm(path.join(dist, ".vite"), { recursive: true, force: true });
await rm(ssrDir, { recursive: true, force: true });

console.log(`✓ prerendered ${count} pages · sitemap ${routes.filter((r) => !r.noindex).length} URLs · font preload ${font ? "on" : "MISSING"}`);
