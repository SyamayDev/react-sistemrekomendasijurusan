import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { devApiServerPlugin } from "./vite-plugin-dev-api-server.js";

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Merge the loaded variables into the Node.js process environment.
  // This makes them accessible to server-side code like our API plugin.
  process.env = { ...process.env, ...env };

  const plugins = [react()];

  // Add the custom API server plugin only during development ('serve' command).
  if (command === 'serve') {
    plugins.push(devApiServerPlugin());
  }

  return {
    base: "/react-sistemrekomendasijurusan/",
    plugins: plugins,
  };
});
