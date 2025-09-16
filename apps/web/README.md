# @monte/web

The Monte web workspace is a Next.js 15 application that consumes the typed Hono API via TanStack React Query. It renders the authenticated Montessori workspace as well as the public marketing surface.

## Overview

- **Framework**: Next.js 15 (App Router, React 19 Server Components).
- **Styling**: Tailwind CSS v4 with design tokens and Radix UI primitives.
- **State & Data**: TanStack React Query, no global stores—queries/mutations only.
- **Auth**: Better Auth client binding to the API routes.
- **API Access**: Generated Hono client wrapped by `lib/api/endpoints.ts` with Zod validation.
- **Notifications**: Sonner toasts.

## Project Structure

```
app/
├── layout.tsx           # Root layout (QueryProvider + theme)
├── (marketing)/         # Public marketing content
└── (app)/               # Authenticated workspace routes
    ├── layout.tsx       # Fetches Better Auth session, renders AppShell
    ├── classrooms/      # Classrooms feature
    ├── students/        # Students + habits feature
    └── ...
components/
├── providers/           # React Query provider
├── app/                 # App-level shell, page header, sidebar
├── auth/                # Login/signup forms
└── ui/                  # Tailwind + Radix wrappers
lib/
├── api/                 # Hono client + typed endpoint helpers
├── auth/                # Better Auth configuration + session helpers
├── db/                  # Re-exported database utilities for server usage
└── utils.ts             # Misc helpers
```

## Data Flow & Conventions

1. **All network calls** go through `lib/api/endpoints.ts`. Each function (e.g., `listStudents`, `createClassroom`) invokes the shared Hono client and parses the response with the shared Zod schema. Never call `fetch` directly inside UI.
2. **React Query usage**:
   - Register new queries with meaningful keys (`['students', { search, classroomId }]`).
   - Use `useMutation` for writes and invalidate related keys on success.
   - Handle errors in `onError` and surface the message via `toast.error(...)`.
3. **Server-side authentication**: The `(app)/layout.tsx` fetches the Better Auth session and renders `<AppShell>`; client components can use `authClient.useSession()` for live updates.
4. **Accessibility-first components**: follow Radix semantics, avoid non-interactive click handlers, and respect the repo-wide accessibility rules.

### Adding a New Feature Page

1. Add schemas/types in `@monte/shared` + API route in `apps/api`.
2. Create endpoint helpers in `lib/api/endpoints.ts` with Zod parsing.
3. Build TanStack Query hooks within your page component (or factor into a hook file if reused).
4. Render UI using existing components and Tailwind classes; respond to loading/error states with React Query status flags.
5. Invalidate relevant queries in mutations to keep the cache synchronized.

## Environment Variables

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:8787
BETTER_AUTH_SECRET=super-secret
NEXT_PUBLIC_SUPABASE_URL=...        # optional, only if Supabase features are enabled
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Commands

```bash
bun run dev        # start Next.js with Turbopack
bun run build      # production build
bun run start      # run built app
bun run typecheck  # TypeScript strict checks
bun run lint       # Biome lint/format
```

## Testing & QA

- Use React Testing Library (when added) against components that encapsulate logic.
- Verify accessibility using browser tooling and ensure new components follow our rules (ARIA roles, label association, etc.).
- `bun run typecheck` + `bun run lint` must pass before merging changes.

## Future Work Guidelines

- Prefer Server Components for layout/shell logic; client components (`"use client"`) should be limited to interactive regions.
- Reuse `AppPageHeader`, buttons, tables, and other existing primitives to preserve UX consistency.
- Update this README when introducing new architectural patterns, query key conventions, or shared hooks.
