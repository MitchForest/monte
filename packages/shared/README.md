# @monte/shared – Contracts & Runtime Helpers

This package is the single source of truth for any data shape shared between workspaces. The API validates every request/response with these schemas and the web app imports the same types to parse responses, so changes made here ripple across the stack immediately.

## Structure
```
src/
  env.ts         # Safe access to process.env (with caching and reset helpers)
  schemas.ts     # Core Zod object/schema definitions (students, habits, etc.)
  api-types.ts   # Response envelopes built from schemas.ts (ApiSuccessSchema, ...)
  student/       # Monte-specific student domains (xp summaries, placements, subject tracks)
  index.ts       # Barrel file exporting everything above
```

## Responsibilities
- Define Zod schemas for Montessori domain entities (`StudentSchema`, `HabitSchema`, etc.).
- Describe API responses with `ApiSuccessSchema` and friends so both the API and UI share the same envelope types.
- Provide helpers for environment loading (`loadServerEnv`, `requireServerEnv`, `resetServerEnvCache`).
- Export inferred TypeScript types (`z.infer<...>`) for use throughout the repo.

## Working With Schemas
1. **Add new fields/schemas in `schemas.ts`**. Keep naming consistent (`<Entity>Schema`) and group related schemas together.
2. **Extend response envelopes in `api-types.ts`**. Use `ApiSuccessSchema` so the response shape stays `{ data, meta? }` across endpoints.
3. **Re-export via `index.ts`** so consumers can `import { StudentSchema } from "@monte/shared"`.
4. **Run `bun run typecheck`** at the repo root; TypeScript will flag every place that still expects the old shape.
5. **Update fixtures/tests** in the consuming workspaces if necessary.

### Conventions
- Prefer `z.object({ ... }).strict()` for closed shapes unless we explicitly expect unknown properties.
- Co-locate enums using `z.enum([...])` and export the inferred union (`type Role = z.infer<typeof RoleSchema>`).
- When adding nested schemas, define them near the parent to avoid circular imports.
- Avoid runtime logic here—stick to pure schema definitions or utilities that don't touch the network/database.

## Environment Helpers
- `loadServerEnv()` parses `process.env` once with Zod and memoises the result.
- `requireServerEnv(key)` throws a descriptive error if a required variable is missing.
- `resetServerEnvCache()` is handy in tests when you mutate `process.env`.

## Monte domains, not vendor payloads
The shared package exposes Monte-focused contracts. External payloads from Timeback/1EdTech are normalised inside the API before being written here. For example, `src/student/placements.ts` defines the learner placement shape we expose, independently of the raw PowerPath response. When we add a new integration, map it into a Monte noun first and only then surface it through this package.

## When to Touch This Package
- Introducing or modifying any API contract.
- Adding new domain entities that should be shared between the API and UI.
- Validating additional environment variables.

Because every workspace depends on `@monte/shared`, keep changes small and deliberate. Once schemas compile, downstream type errors will guide the rest of the refactor.
