# Architecture and Modularization Rules

## Authentication

- Remove the concept of application users and never reintroduce a `users` table in this template.
- Authenticate protected API routes with the Secrets Store binding `WORKER_API_KEY`.
- Create or validate sessions only after reading the bound secret with `await env.WORKER_API_KEY.get()`.

## Database organization

- Keep every Drizzle table definition under `db/schemas/${useCase}/${tableName}.ts`.
- Re-export tables and generated Drizzle-Zod schemas through `db/schemas/index.ts`.
- Use Drizzle-Zod derived schemas for API validation whenever a request or response shape maps to a table instead of manually re-typing the same structure.

## Code modularization

- Modularize all new code by concern: shared helpers in dedicated utility files, UI in focused components, and API logic separated from persistence definitions.
- Avoid large all-in-one files when adding new features; prefer small reusable modules that align with the route or use case they support.

## Template frontend replacement

- This Worker was created from a template repo with starter frontend content that should be replaced once product-specific pages are ready.
- If the user provides the template replacement prompt from the landing page, follow it by:
  1. replacing the template landing page with the real frontend routes,
  2. keeping the shared navigation header on every page,
  3. preserving the dynamic documentation links for `/openapi.json`, `/swagger`, and `/scaler`, and
  4. keeping frontend error flows wired through the centralized error handling utility.

## Cloudflare Edge-Native Full-Stack Architecture Standards

- **Compute Paradigm**: Force all logic into Cloudflare Workers + Hono. No external middleware servers.
- **Frontend Paradigm**: Utilize Astro for layout structure, routing, and SSR compilation, with interactive sections isolated strictly in React components using `client:load`.
- **Theme Paradigm**: Enforce default dark theme variables (`bg-zinc-950`, foreground text variables) across components following premium IDE visual signatures.
- **Stateful Intelligence Logic**: Mandate the Cloudflare Agents SDK over any stateless alternatives. Extend `AIChatAgent` explicitly, mapping real-time state synchronization over hibernated WebSocket sessions.
- **Untrusted Code Execution**: Leverage the Dynamic Workers API (`worker_loaders`) via `env.LOADER.load()` to process on-the-fly analytical calculation threads inside lightweight isolates.
