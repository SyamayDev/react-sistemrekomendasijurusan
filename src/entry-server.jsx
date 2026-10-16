/**
 * Build-time renderer used by scripts/prerender.mjs. Uses React 19's
 * prerender API, which waits for lazy routes so every page ships as complete
 * static HTML (fast first paint, fully crawlable).
 */
import { StrictMode } from "react";
import { prerenderToNodeStream } from "react-dom/static";
import { StaticRouter } from "react-router";
import App from "./App.jsx";
import { SeoContext, headTags } from "./lib/seo.jsx";
import { MAJORS } from "./lib/majors.js";

export { SITE } from "./lib/site.js";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

/** Every URL to prerender, with sitemap metadata. */
export const routes = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/tes/", priority: "0.9", changefreq: "monthly" },
  { path: "/jurusan/", priority: "0.9", changefreq: "monthly" },
  ...MAJORS.map((m) => ({ path: `/jurusan/${m.slug}/`, priority: "0.7", changefreq: "monthly" })),
  { path: "/tentang/", priority: "0.5", changefreq: "yearly" },
  { path: "/privasi/", priority: "0.3", changefreq: "yearly" },
  { path: "/hasil/", noindex: true },
  { path: "/hasil/bagikan/", noindex: true },
  { path: "/404/", noindex: true, file: "404.html" },
];

export async function render(path) {
  const seo = { current: null, collect: (value) => (seo.current = value) };
  const location = basename === "/" ? path : `${basename}${path}`;
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <SeoContext.Provider value={seo}>
        <StaticRouter location={location} basename={basename}>
          <App />
        </StaticRouter>
      </SeoContext.Provider>
    </StrictMode>,
    // Never "outline" big Suspense boundaries into hidden divs + reveal
    // scripts: we want plain, script-free HTML (CSP-friendly, instant paint).
    { progressiveChunkSize: Number.POSITIVE_INFINITY }
  );
  let html = "";
  for await (const chunk of prelude) html += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8");
  return { html, head: seo.current ? headTags(seo.current) : "", seo: seo.current };
}
