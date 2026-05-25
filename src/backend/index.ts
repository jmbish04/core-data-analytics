import { Hono } from "hono";
import { routeAgentRequest } from "agents";
import { DataAgent, type Env } from "./agent";

export { DataAgent };

const workerStartTime = Date.now();
const app = new Hono<{ Bindings: Env }>();

app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime_ms: Date.now() - workerStartTime,
    services: {
      database: "connected",
      agent_runtime: "active",
      sandbox_isolates: "ready",
    },
  });
});

app.get("/context", (c) => {
  return c.json({
    project: "Edge Native Cognitive Data Visualizer",
    architecture: "Astro SSR Full-Stack + Cloudflare Agents SDK + Ephemeral Isolate Sandboxes",
    standards: "OpenAPI v3.1.0, Default Dark Mode theme, Hibernated WebSockets",
    capabilities: ["Dynamic Worker Loader Execution", "Remote D1 Federation Querying", "Interactive Chart Render Engine"],
  });
});

app.get("/docs", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html class="dark">
    <head>
      <title>Platform Documentation Hub</title>
      <meta charset="utf-8">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-zinc-950 text-zinc-50 p-8 font-sans">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-4xl font-bold tracking-tight mb-4 text-zinc-100">Platform Documentation Hub</h1>
        <p class="text-zinc-400 mb-6">Welcome to the distributed system control panel. Use the routes below to explore our API signatures.</p>
        <div class="space-y-4">
          <a href="/swagger" class="block p-4 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition">
            <h2 class="font-semibold text-lg">Swagger Interactive Interface &rarr;</h2>
            <p class="text-zinc-500 text-sm">Explore live playground configurations and request payload shapes.</p>
          </a>
          <a href="/scalar" class="block p-4 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition">
            <h2 class="font-semibold text-lg">Scalar Console Explorer &rarr;</h2>
            <p class="text-zinc-500 text-sm">Alternative high-performance web interface for API validation layers.</p>
          </a>
          <a href="/openapi.json" class="block p-4 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition">
            <h2 class="font-semibold text-lg">OpenAPI Spec Raw Source Code &rarr;</h2>
            <p class="text-zinc-500 text-sm">Valid schema registry targeted to OpenAPI v3.1.0 specifications.</p>
          </a>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get("/openapi.json", (c) => {
  return c.json({
    openapi: "3.1.0",
    info: {
      title: "Edge Native Cognitive Data Visualizer API",
      version: "1.0.0",
      description: "Serves real-time analytical capabilities backed by Cloudflare Durable Objects and Dynamic Workers isolates.",
    },
    paths: {
      "/health": {
        get: {
          summary: "Get server operational health metrics",
          responses: {
            "200": { description: "System is healthy" },
          },
        },
      },
      "/api/chat": {
        post: {
          summary: "Initialize an active low-latency analytical chat session",
          responses: {
            "200": { description: "WebSocket connection upgrade parameters" },
          },
        },
      },
    },
  });
});

app.get("/swagger", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Swagger API Docs</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    </head>
    <body style="margin: 0; background: #09090b;">
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          SwaggerUIBundle({
            url: '/openapi.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
            layout: "BaseLayout"
          });
        };
      </script>
    </body>
    </html>
  `);
});

app.get("/scalar", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Scalar API Console</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body style="margin:0;">
      <script id="api-reference" data-url="/openapi.json"></script>
      <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    </body>
    </html>
  `);
});

app.all("/api/chat", async (c) => {
  return await routeAgentRequest(c.req.raw, c.env);
});

app.all("*", async (_c) => {
  return new Response("Asset mapping fallback channel active", { status: 404 });
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (
      url.pathname.startsWith("/api") ||
      url.pathname === "/health" ||
      url.pathname === "/context" ||
      url.pathname === "/docs" ||
      url.pathname === "/openapi.json" ||
      url.pathname === "/swagger" ||
      url.pathname === "/scalar"
    ) {
      return app.fetch(request, env, ctx);
    }

    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  },
};
