import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { devApiServerPlugin } from "./vite-plugin-dev-api-server.js";

export default defineConfig(({ command, mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    // GitHub Pages serves the site under /<repo>/; Vercel (which sets VERCEL=1 at
    // build time) and custom domains serve it from the root. BASE_PATH overrides both.
    base: env.BASE_PATH || (env.VERCEL ? "/" : "/react-sistemrekomendasijurusan/"),
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
      // The 3D world is lazy; keep three.js core in its own long-cacheable chunk
      // so a change to the world code doesn't re-download the engine.
      rollupOptions: isSsrBuild
        ? undefined
        : { output: { manualChunks: (id) => (/node_modules[\\/]three[\\/]/.test(id) ? "three" : undefined) } },
    },
  };
});
