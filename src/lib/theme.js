/**
 * Light/dark theme. The inline script in index.html sets data-theme before
 * first paint (no flash); this module keeps React in sync with it.
 */
import { useSyncExternalStore } from "react";
import { storage, KEYS } from "./storage.js";

const listeners = new Set();
const THEME_COLOR = { light: "#f6f7fb", dark: "#060b19" };

export const getTheme = () =>
  typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "dark" : "light";

function apply(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]:not([media])')?.setAttribute("content", THEME_COLOR[theme]);
  listeners.forEach((l) => l());
}

export function setTheme(theme) {
  storage.set(KEYS.theme, theme);
  apply(theme);
}

export const toggleTheme = () => setTheme(getTheme() === "dark" ? "light" : "dark");

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Follow the OS setting until the user picks a theme explicitly.
if (typeof window !== "undefined" && window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!storage.get(KEYS.theme)) apply(e.matches ? "dark" : "light");
  });
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => "light");
}
