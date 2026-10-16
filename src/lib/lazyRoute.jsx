/**
 * React.lazy that can be resolved ahead of time. boot.jsx preloads the
 * current route's module before hydrating, so hydration never suspends on an
 * already-downloaded chunk (it renders the same DOM, so it still matches the
 * prerendered HTML). Client-side navigations fall back to normal lazy loading.
 */
import { lazy } from "react";

export function lazyRoute(loader) {
  let mod = null;
  const load = () => loader().then((m) => (mod = m));
  const Lazy = lazy(load);
  function Route(props) {
    const Cmp = mod ? mod.default : Lazy;
    return <Cmp {...props} />;
  }
  Route.preload = load;
  return Route;
}
