import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadEnv } from "vite";

/**
 * Dev-only bridge: serves POST /api/chat from the sibling backend project
 * (../Backend-SistemRekomendasiJurusan/api/chat.js) so the chat works locally
 * without running `vercel dev`. Set CHAT_HANDLER_PATH to point elsewhere.
 */
function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

export function devApiServerPlugin() {
  return {
    name: "siraju-dev-api",
    configureServer(server) {
      const handlerPath = path.resolve(
        process.env.CHAT_HANDLER_PATH || path.join(process.cwd(), "..", "Backend-SistemRekomendasiJurusan", "api", "chat.js")
      );
      // Make the backend's .env.local (GEMINI_API_KEY, …) visible to the handler.
      Object.assign(process.env, loadEnv("development", path.dirname(path.dirname(handlerPath)), ""), process.env);

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/chat")) return next();
        try {
          const { default: handler } = await import(`${pathToFileURL(handlerPath).href}?t=${Date.now()}`);
          if (req.method === "POST") req.body = await readJson(req);
          // Minimal Vercel-style helpers on the raw Node response (streaming still works).
          res.status = (code) => ((res.statusCode = code), res);
          res.json = (data) => {
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify(data));
          };
          await handler(req, res);
        } catch (error) {
          server.config.logger.error(`[siraju-dev-api] ${error.stack || error}`);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ reply: "⚠️ Server chat lokal error. Lihat terminal Vite untuk detailnya." }));
          } else res.end();
        }
      });
    },
  };
}
