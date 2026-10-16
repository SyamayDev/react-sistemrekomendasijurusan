import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { devApiServerPlugin } from "./vite-plugin-dev-api-server.js";

export default defineConfig(({ command, mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    // GitHub Pages project path by default; set BASE_PATH=/ for a root deploy (e.g. Vercel).
    base: env.BASE_PATH || "/react-sistemrekomendasijurusan/",
    plugins: [react(), tailwindcss(), command === "serve" && devApiServerPlugin()],
    build: {
      target: "es2022",
      // The prerenderer reads the manifest to add per-route <link rel="modulepreload">.
      manifest: !isSsrBuild,
      modulePreload: { polyfill: false },
      // Fonts stay real files (cacheable, and allowed by the strict CSP font-src).
      assetsInlineLimit: (file) => (file.endsWith(".woff2") ? false : undefined),
      reportCompressedSize: false,
      chunkSizeWarningLimit: 900, // the lazy three.js chunk is intentionally large
    },
  };
});
