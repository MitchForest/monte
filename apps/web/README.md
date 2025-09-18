# @monte/web – Next.js Frontend

This workspace renders the Montessori guide experience. It is a Next.js 15 App Router project that consumes only the internal Monte API (`@monte/api`). Every network call flows through typed helpers backed by the Zod schemas in `@monte/shared` so UI code always works with validated data.

## Core Ideas
- **Single source of truth** – never call Timeback or random endpoints directly. All IO goes through `lib/api`, which wraps the generated Hono client and re-parses responses with shared schemas.
- **React Query for state** – components read/write data with TanStack Query (`useQuery`, `useMutation`). Manual `fetch`es or global stores should be avoided.
- **Auth-aware providers** – `components/providers` wire up Cognito (via `react-oidc-context`), React Query, and theming so all routes inherit auth state.
- **Server/Client split** – App Router lets us render parts of the UI on the server. Endpoint helpers return promises, so server components can `await` them without extra wrappers.

## Directory Tour
```
app/
  layout.tsx              # Root providers + metadata
  (marketing)/            # Public pages (no auth)
  (auth)/                 # Auth callback and sign-in flows
  (app)/                  # Authenticated workspace (classrooms, students, etc.)
components/
  providers/              # AuthProvider, QueryProvider, ThemeProvider
  app/                    # Shell, navigation, feature widgets
  ui/                     # Tailwind + Radix building blocks
lib/
  api/                    # Hono client + typed endpoint helpers
  auth/                   # Token store used by client-side fetch
  db/                     # Thin re-export of @monte/database for server actions
  utils.ts                # Tailwind convenience helpers
hooks/                    # React Query hooks built on top of lib/api
```

## Data Access Pattern
1. Import a function from `lib/api/endpoints.ts` (e.g. `listStudents`). These helpers already call the Hono client and validate the result with the appropriate Zod schema.
2. Inside a React component, wrap the helper with TanStack Query:
   ```tsx
   const { data, isPending } = useQuery({
     queryKey: ["students", filters],
     queryFn: () => listStudents(filters),
   });
   ```
3. Mutations use `useMutation` and invalidate the relevant `queryKey` inside `onSuccess`.
4. Server components can `await listStudents()` directly. They still receive validated data because the helper parses the response before returning.

Storing raw responses outside of React Query or skipping schema parsing breaks our guarantees, so please stick with the helpers.

## Authentication
- By default we use Cognito via OIDC (`react-oidc-context`). The provider lives in `components/providers/auth-provider.tsx` and keeps the access token in a tiny in-memory store (`lib/auth/token-store.ts`).
- Set `NEXT_PUBLIC_AUTH_MOCK=true` and fill `NEXT_PUBLIC_DEV_ACCESS_TOKEN` during local development to bypass Cognito. The API must also enable `DEV_AUTH_BYPASS=true` for the flow to succeed.
- The API token is automatically attached to client-side fetches; server components rely on the API's session cookie headers.

## Styling & UI Libraries
- Tailwind CSS v4 for utility classes.
- Radix UI + Shadcn-inspired wrappers under `components/ui` for accessible primitives.
- `lucide-react` icons, `clsx` + `tailwind-merge` via the `cn()` helper in `lib/utils.ts`.

## Environment Variables (`.env`)
| Key | Usage |
| --- | ----- |
| `NEXT_PUBLIC_APP_URL` | Used in metadata and redirects; should match the origin hosting Next.js. |
| `NEXT_PUBLIC_API_URL` | Points to the API when rendering on the server (defaults to `http://localhost:8787`). |
| `NEXT_PUBLIC_COGNITO_AUTHORITY` | Issuer for the Cognito user pool (staging by default). |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Public OIDC client ID supplied by Timeback. |
| `NEXT_PUBLIC_COGNITO_REDIRECT_URI` | Where Cognito sends users after login. Must match the app URL. |
| `NEXT_PUBLIC_AUTH_MOCK` | `true` to enable mock auth mode. |
| `NEXT_PUBLIC_DEV_ACCESS_TOKEN` | Token injected when mock mode is on. Should match what the API expects. |
| `OPENAI_API_KEY` | Needed if we call Speech-to-Text or generation services from the browser (rare; most AI work stays server-side). |

Copy `.env.example` and fill in the values that apply to your environment.

## Commands
```bash
bun run dev          # Start Next.js with Turbopack
bun run build        # Production build (`.next/`)
bun run start        # Serve the compiled output
bun run lint         # Biome lint (ignores generated files)
bun run typecheck    # tsc --noEmit
```
You can target this workspace from the repo root with `bun --filter @monte/web <command>`.

## Building Features
1. **Update contracts** in `packages/shared` and routes in `@monte/api`. The UI only consumes documented endpoints.
2. **Add or update endpoint helpers** in `lib/api/endpoints.ts`. Keep them focused on one network call each and validate with the shared schema.
3. **Create React Query hooks** (optional) in `hooks/` when multiple components need the same query/mutation.
4. **Compose UI** under `app/(app)` or shared components under `components/app`. Handle loading and error states explicitly; the helpers throw `Error` when the API returns non-2xx responses.
5. **Invalidate queries** inside mutations so stale data refreshes automatically.

## Tips & Troubleshooting
- Check `components/providers/query-provider.tsx` for default query timings; override them per-query when needed (e.g. `staleTime: 0` for always-fresh data).
- `lib/api/client.ts` automatically swaps the base URL depending on server vs browser execution. If requests fail only on the server, ensure `NEXT_PUBLIC_API_URL` or `API_URL` matches the API host.
- UI code should never import from `@monte/timeback-clients` or talk to Postgres directly—those are server responsibilities.
- Use ESLint warnings from Biome as a guardrail (for example, it forbids `Array.forEach` in favour of `for...of`). Fix lint warnings before committing.

Following these patterns keeps the frontend thin, predictable, and well-aligned with the backend contract. When in doubt, look for existing helpers in `lib/api/endpoints.ts` and mirror their approach.
