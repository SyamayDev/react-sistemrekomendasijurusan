import path from 'path';
import { pathToFileURL } from 'url';

// Helper to parse JSON body from a request stream
async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        console.error('Failed to parse JSON body:', e.message);
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', err => {
        reject(err);
    });
  });
}

/**
 * A custom Vite plugin to handle API calls during development.
 * This avoids needing a separate server process or proxy.
 */
export function devApiServerPlugin() {
  return {
    name: 'vite-plugin-dev-api-server',
    configureServer(server) {
      // Add a middleware to the Vite dev server
      server.middlewares.use(async (req, res, next) => {
        // Only intercept requests to our specific API endpoint
        if (req.url !== '/api/chat') {
          return next();
        }
        
        try {
          // Construct an absolute file URL to ensure the dynamic import works reliably.
          const handlerPath = path.join(process.cwd(), 'api', 'chat.js');
          const handlerUrl = pathToFileURL(handlerPath).href;

          // Lazy-load the handler only when the API is called.
          // This prevents the Vite server from crashing if dependencies are not installed.
          // We add a timestamp to bust the import cache in case the file changes.
          const { default: apiHandler } = await import(`${handlerUrl}?t=${Date.now()}`);

          // The handler in /api/chat.js expects a Node.js-like request object
          // with a `body` property, so we parse it first.
          req.body = await parseJsonBody(req);

          // We create a response wrapper to emulate the response object
          // that serverless environments like Vercel provide.
          const responseWrapper = {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            
            status(code) {
              this.statusCode = code;
              return this;
            },
            
            json(data) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = this.statusCode;
              res.end(JSON.stringify(data));
            },
          };

          // Call the actual API handler logic
          await apiHandler(req, responseWrapper);

        } catch (error) {
          console.error('API middleware error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            error: 'Internal Server Error in API Middleware',
            message: error.message,
            details: error.code === 'ERR_MODULE_NOT_FOUND' 
              ? "A dependency is missing. Please run 'npm install' in your terminal and restart the dev server." 
              : error.stack 
          }));
        }
      });
    },
  };
}
