/**
 * Entry point — deliberately tiny. Every page is prerendered, so the browser
 * can paint real content from HTML + inline CSS alone. We let it do exactly
 * that first, then fetch React and hydrate ("paint first, then hydrate").
 * Links are real <a href>s, so the page is usable even before hydration.
 */
import "@fontsource-variable/plus-jakarta-sans/wght.css";
import "@fontsource-variable/bricolage-grotesque/wght.css";
import "./styles/index.css";
import { redirectLegacyHash } from "./lib/legacy.js";

/** Preload this route's chunks alongside React (listed by the prerenderer). */
function preloadRouteModules() {
  const list = document.querySelector('meta[name="siraju:modules"]')?.content;
  for (const href of list ? list.split(" ") : []) {
    document.head.appendChild(Object.assign(document.createElement("link"), { rel: "modulepreload", href, crossOrigin: "" }));
  }
}

const start = () => {
  preloadRouteModules();
  return import("./boot.jsx").then(({ boot }) => boot(document.getElementById("root"), () => import("./App.jsx")));
};

function afterFirstPaint(run) {
  let done = false;
  const once = () => {
    if (!done) {
      done = true;
      run();
    }
  };
  try {
    const po = new PerformanceObserver((list) => {
      if (list.getEntriesByName("first-contentful-paint").length) {
        po.disconnect();
        once();
      }
    });
    po.observe({ type: "paint", buffered: true });
  } catch {
    once();
  }
  // Safety net (e.g. browsers without paint timing, or a page opened in a background tab).
  setTimeout(once, 2500);
}

if (!redirectLegacyHash()) {
  if (document.getElementById("root").firstElementChild) afterFirstPaint(start);
  else start(); // dev server / non-prerendered fallback
}
