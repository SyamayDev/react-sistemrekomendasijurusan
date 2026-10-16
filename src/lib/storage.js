/** localStorage that never throws (private mode, quota, SSR). */
export const storage = {
  get(key, fallback = null) {
    try {
      const raw = globalThis.localStorage?.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      globalThis.localStorage?.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — the app keeps working, just without persistence */
    }
  },
  remove(key) {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const KEYS = {
  progress: "siraju:progress:v2",
  result: "siraju:result:v2",
  theme: "siraju:theme",
  chat: "siraju:chat:v1",
};
