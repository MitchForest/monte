# @monte/api

The Monte API workspace is a Bun + Hono service that exposes organization-scoped REST endpoints. Every handler validates input and output with shared Zod schemas to keep the contract aligned with the web application.

## Stack

- **Runtime**: Bun 1.x
- **Framework**: [Hono](https://hono.dev) with modular route files
- **Database**: PostgreSQL accessed through Kysely
- **Auth**: [Better Auth](https://better-auth.dev) with email/password flow
- **Validation**: Zod schemas imported from `@monte/shared`
- **Type Safety**: `withDbContext` transaction helper provides user/org context for RLS

## Folder Layout

```
src/
├── index.ts         # App entry, CORS, route registration
├── lib/
│   └── auth/        # Better Auth setup + session helpers
└── routes/
    ├── students.ts
    ├── classrooms.ts
    ├── habits.ts
    ├── tasks.ts
    ├── observations.ts
    └── team.ts
```

Each route file follows the same pattern:

1. Import request/response schemas from `@monte/shared`.
2. Parse query/body payloads with Zod before using them.
3. Execute database work inside `withDbContext({ userId, orgId }, trx => ...)`.
4. Parse the response object with the matching response schema before returning `c.json({ data: ... })`.

## API Conventions

- **Response Envelope**: all successful responses are `200..299` with `{ data: {...}, meta?: {...} }` defined via `ApiSuccessSchema`.
- **Error Shape**: errors are `c.json({ error: string }, status)`; never return partial data on error.
- **Multi-tenancy**: always scope queries by `session.session.orgId`. `withDbContext` injects those values into Postgres `app.*` settings so policies enforce isolation.
- **New Routes**:
  1. Define schemas/types in `packages/shared` (both payload + response).
  2. Create route handler in `apps/api/src/routes` that validates both directions.
  3. Register the router in `src/index.ts`.
  4. Add corresponding typed endpoint helper to the web app.

## Commands

```bash
bun run dev        # start API with hot reload
bun run build      # bundle for production
bun run start      # run compiled output
bun run typecheck  # TypeScript strict checks
bun run lint       # Biome lint rules
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/monte
BETTER_AUTH_SECRET=super-secret
BETTER_AUTH_URL=http://localhost:8787
PORT=8787
APP_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Adding a Route Example

1. **Shared Contract** – add `StudentProgressSchema` + `StudentProgressResponseSchema` to `@monte/shared`.
2. **Route** – create `routes/student-progress.ts`, parse filters with Zod, run queries inside `withDbContext`, parse the outgoing payload with the shared schema.
3. **Registration** – add `app.route('/student-progress', studentProgressRouter);` to `src/index.ts`.
4. **Client helper** – add a function to `apps/web/lib/api/endpoints.ts` that calls `apiClient.studentProgress.$get()` and passes the response through the new schema.
5. **React Query** – create/use a query key in the web app (`['studentProgress', studentId]`) with TanStack Query.

Following this process keeps backend and frontend identical and prevents contract drift.
