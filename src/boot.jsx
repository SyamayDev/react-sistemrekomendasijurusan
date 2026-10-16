/**
 * Mounts (or hydrates) the React app. Loaded by main.jsx after first paint.
 * Holds only React DOM + the router; the app modules arrive as a separate
 * chunk so their evaluation runs in its own task (no single long task).
 */
import { StrictMode, startTransition } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
const yieldToMain = () => new Promise((r) => setTimeout(r, 0));

export async function boot(container, loadApp) {
  await yieldToMain();
  const { default: App, routeFor } = await loadApp();
  // Resolve the current route's code first so hydration never suspends.
  const path = window.location.pathname.slice(basename === "/" ? 0 : basename.length) || "/";
  await routeFor(path)?.preload().catch(() => {});
  await yieldToMain();

  const app = (
    <StrictMode>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
  if (container.firstElementChild) {
    // Prerendered page: hydrate inside a transition so React can yield to the
    // browser in small slices (keeps Total Blocking Time low on slow phones).
    startTransition(() => {
      hydrateRoot(container, app);
    });
  } else {
    createRoot(container).render(app);
  }
}
