/**
 * Read a localStorage value in a hydration-safe way: the server (and the
 * hydration pass) sees `null`, the client then re-renders with the stored value.
 */
import { useMemo, useSyncExternalStore } from "react";

const listeners = new Set();

export function notifyStored() {
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  const onStorage = () => listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useStored(key) {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null
  );
  return useMemo(() => {
    if (raw == null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [raw]);
}
