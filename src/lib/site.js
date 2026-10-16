/** Site-wide constants. Override per deployment with VITE_* env vars. */
const BASE = import.meta.env.BASE_URL || "/";

export const SITE = {
  name: "SI-RAJU",
  tagline: "Tes Minat Bakat & Rekomendasi Jurusan Kuliah",
  url: (import.meta.env.VITE_SITE_URL || "https://syamaydev.github.io/react-sistemrekomendasijurusan").replace(/\/$/, ""),
  locale: "id_ID",
  chatApi:
    import.meta.env.VITE_CHAT_API_URL ||
    (import.meta.env.DEV ? "/api/chat" : "https://si-raju-backend.vercel.app/api/chat"),
  author: "Syahril Maymubdi",
  github: "https://github.com/SyamayDev/react-sistemrekomendasijurusan",
  whatsapp: "https://wa.me/6282267403010",
};

/** Public-folder asset URL that respects the deploy base path. */
export const asset = (path) => `${BASE}${path.replace(/^\//, "")}`;

/** Absolute URL for canonical/OG tags. `path` is router-relative ("/tes/"). */
export const absoluteUrl = (path = "/") => `${SITE.url}${path === "/" ? "/" : path}`;
