# Monte Platform Monorepo

The Monte workspace houses the lesson runtime, curriculum editor, and shared schema libraries that power the platform. It is organised as a pnpm monorepo with clear boundaries between runtime apps, Convex backend functions, and the shared packages that provide type-safe contracts.

---

## Repository Layout

| Path | Description |
| --- | --- |
| `apps/frontend` | SolidJS + Vite lesson experience and curriculum editor. Domain-driven structure under `src/domains/` (e.g. `curriculum/`, `analytics/`, `design-system/`). |
| `apps/backend` | Convex project exposing curriculum/auth mutations and scheduled jobs. Uses the Convex component system and shares schemas via workspace packages. |
| `packages/types` | Single source of truth for shared Zod schemas, enums, and TypeScript types (emits ESM/CJS bundles with typings). |
| `packages/api` | Thin wrapper around Convex codegen that exposes typed client helpers for the frontend and other consumers. |
| `scripts/` | Workspace automation (e.g. `sync-convex-codegen.mjs` keeps Convex generated files in sync with `packages/api`). |
| `.docs/plan.md` | Canonical roadmap for the ongoing refactor and stability workstreams. |

---

## Application Boundaries & Data Flow

1. **Shared Schemas (`@monte/types`)**  
   - Defines Zod validators for curriculum entities (`LessonDocument`, `LessonMaterialInventory`, etc.).  
   - Both frontend and backend import from here; no app should redefine schemas locally.

2. **Backend (`@monte/backend`)**  
   - Convex functions and HTTP routes live under `apps/backend/convex`.  
   - Generates client bindings via `convex codegen`; the generated output is synchronised into `packages/api/convex/_generated`.  
   - Authentication integrates Better Auth via `@convex-dev/better-auth` (component registered in `convex.config.ts`).

3. **Shared API (`@monte/api`)**  
   - Re-exports Convex codegen outputs alongside higher-level helpers (request/response parsing through Zod).  
   - Frontend interacts with Convex exclusively through these helpers—avoid direct `convex.query` / `convex.mutation` calls in apps.

4. **Frontend (`@monte/frontend`)**  
   - SolidJS app split into presentation (`routes/lesson.tsx`), editor (`routes/editor`), and shared domain logic (`src/domains/curriculum`).  
   - Inventory state is managed via `LessonInventoryProvider`, consuming `LessonMaterialInventory` from authored lessons.  
   - Drag/drop logic, LessonCanvas, and analytics all sit inside domain modules to keep UI shells thin.

---

## Primary Libraries & Frameworks

| Package | Key Dependencies | Notes |
| --- | --- | --- |
| `apps/frontend` | `solid-js`, `vite`, `@tanstack/solid-router`, `@tanstack/solid-form`, `@tanstack/solid-table`, `tailwindcss` v4, `class-variance-authority`, `tailwind-merge`, `xstate` | Vite handles bundling; Tailwind is configured via Vite plugin. Use TanStack Router for navigation and route loaders. |
| `apps/backend` | `convex`, `@convex-dev/better-auth`, `better-auth`, `convex-helpers` | Convex dev server drives local backend; Better Auth provides session/role management. |
| `packages/types` | `zod`, `convex` type helpers | Build outputs live in `dist/`; update schemas here before touching frontend/backends. |
| `packages/api` | `convex`, `zod`, `@monte/types` | Wraps generated Convex client; all consumers should import from this package. |

---

## Conventions & Best Practices

- **Type Safety First**: Always add or update Zod schemas in `@monte/types` and consume them via `@monte/api`. Avoid `as` casts in application code—prefer parsing through shared validators.
- **Inventory Source of Truth**: Lesson inventory mutations must flow through `LessonInventoryProvider` (runtime) and `lessonEditor.applyInventoryUpdate` (editor). Never mutate counts directly on components.
- **Domain-Oriented Frontend**: House shared business logic under `apps/frontend/src/domains/*`. UI components outside `domains/` should remain presentational.
- **Convex Interaction**: After editing Convex schema or functions, run `pnpm sync:codegen` to regenerate bindings and copy them into `packages/api`.
- **Documentation Updates**: When architecture or schema decisions change, refresh `.docs/plan.md` alongside relevant README sections.

---

## Scripts & Tooling

Workspace-level scripts (run from repo root):

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install dependencies across the workspace. |
| `pnpm dev` | Start frontend and backend dev servers in parallel. |
| `pnpm --filter @monte/frontend dev` | Launch the Solid app only (Vite on port 3000 by default). |
| `pnpm --filter @monte/backend dev` | Run the Convex dev server (requires Convex login). |
| `pnpm build` | Build all workspace packages. |
| `pnpm build:shared` | Run Convex codegen, then rebuild `@monte/types` and `@monte/api`. |
| `pnpm sync:codegen` | Regenerate Convex client bindings and synchronise them into `packages/api`. |
| `pnpm check:codegen` | Verify generated Convex bindings are in sync (fails if `sync:codegen` would change files). |
| `pnpm typecheck` | Execute TypeScript checks across every package. |
| `pnpm lint` | Run lint tasks (some packages print placeholders until lint rules are defined). |

Package-specific scripts:

- `@monte/frontend`: `pnpm --filter @monte/frontend build`, `typecheck`, `lint`, plus curriculum scripts such as `validate-lessons`, `curriculum:seed`, and `curriculum:tts`.
- `@monte/backend`: `pnpm --filter @monte/backend deploy` for Convex deployments.
- `@monte/types` / `@monte/api`: `build` (tsup) and `typecheck`.

---

## Environment & Setup Notes

1. **Prerequisites**: Node 20+, pnpm 9+, Convex CLI authenticated (`npx convex dev` will prompt if needed).  
2. **Env Files**: Frontend expects Convex deployment variables (`CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, etc.). Backend secrets (Better Auth keys) are configured through `convex env`.  
3. **Running Locally**: In one terminal run `pnpm --filter @monte/backend dev`; in another run `pnpm --filter @monte/frontend dev`. Alternatively use `pnpm dev` to start both.  
4. **After Schema Changes**: Run `pnpm sync:codegen` and commit the updated generated files in `packages/api/convex/_generated`.  
5. **Testing**: Vitest/Playwright suites are still being expanded—refer to `.docs/plan.md` for current priorities.

---

## Contribution Checklist

1. Read `.docs/plan.md` to align with the current milestone.  
2. Update shared schemas in `@monte/types` before touching frontend/backend usage.  
3. Run `pnpm build:shared` and relevant app builds to make sure generated artifacts stay in sync.  
4. Add or update tests for new functionality (Vitest for units, Playwright for smoke once available).  
5. Update this README or the canonical docs when altering architecture, conventions, or tooling.  
6. Keep commits scoped to a single concern; avoid mixing schema updates with unrelated UI changes.

---

For deeper context or upcoming work, consult `.docs/plan.md` and the domain-specific documentation within `apps/frontend/src/domains/`. When in doubt, prefer asking questions in documentation form so future contributors inherit the rationale. Happy building!
