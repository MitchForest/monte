# @monte/web – Montessori Frontend

The web workspace is a Next.js 15 application that consumes only the internal Monte API (`apps/api`). It never talks to Timeback directly—the BFF handles vendor calls and enforces policy for us.

## Responsibilities

- Render the Montessori guide, student, and admin experiences.
- Fetch data exclusively via typed helpers in `lib/api/endpoints.ts` that wrap the BFF.
- Orchestrate state with TanStack React Query (no manual `fetch`).
- Provide client-side validation/error handling while keeping the shared contracts intact.

```
(Timeback APIs) → @monte/timeback-clients → apps/api (BFF) → @monte/shared (contracts) → apps/web (UI)
```

## Technology

- **Framework**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS v4, Radix primitives, Shadcn wrappers
- **Data**: TanStack React Query with the shared Hono client
- **Auth**: Better Auth client bindings
- **Validation**: Zod schemas imported from `@monte/shared`

## Project Structure

```
app/
  layout.tsx                # Root layout (Query + Theme providers)
  (marketing)/              # Public marketing surface
  (app)/                    # Authenticated workspace
    layout.tsx              # Loads session, renders AppShell
    students/               # Student directory + detail routes
    ...
components/
  providers/                # React Query provider, auth provider
  app/                      # Shell, navigation, shared widgets
  ui/                       # Tailwind + Radix building blocks
lib/
  api/                      # Hono client + endpoint helpers (typed by @monte/shared)
  auth/                     # Better Auth session utilities
  utils.ts                  # Misc helpers
hooks/                      # Reusable React Query hooks
```

## Data Flow

1. Endpoints in `lib/api/endpoints.ts` call the generated Hono client, pass through Zod schemas from `@monte/shared`, and return parsed data.
2. Components use React Query (`useQuery`, `useMutation`) with those endpoint helpers.
3. Success paths invalidate the appropriate query keys; errors raise toasts.
4. Server Components can run queries inside route handlers by directly calling the endpoint helpers (they return promises that already perform validation).

## Commands

```bash
bun run dev          # start Next.js (Turbopack)
bun run build        # production build
bun run start        # run built output
bun run typecheck    # strict TypeScript checks
bun run lint         # Biome lint rules
```

Scope commands:

```bash
bun --filter @monte/web dev
bun --filter @monte/web typecheck
```

## Environment Variables

Copy `.env.example` to `.env` and set:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:8787
BETTER_AUTH_SECRET=super-secret
```

(Additional envs can be added per feature; avoid introducing vendor credentials here.)

## Adding a Feature Page

1. Define/extend contracts in `packages/shared` and expose the route in `apps/api`.
2. Add endpoint helpers (and optional hooks) in `lib/api`.
3. Build UI components that rely on React Query + shared primitives.
4. Handle loading/error states explicitly for good UX.

This keeps the UI thin, predictable, and fully typed from the database to React components.
