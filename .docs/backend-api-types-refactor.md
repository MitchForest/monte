# Backend / API / Types Refactor Plan

## Objectives
- Establish a single, consistent organizational model for Convex backend, shared Zod types, and API client packages.
- Remove dead code, ad-hoc helpers, and leftover scaffolding so every exported symbol has a clear purpose.
- Deliver a structure that is radically simple to navigate: feature code grouped by domain, core plumbing isolated, and no backwards-compatibility layers.

## Guiding Principles
- Prefer clarity over fragmentation. A well-organized 1 000-line file beats five scattered 200-line files.
- Zero tolerance for legacy shims, deprecated exports, or compatibility bridges. Delete before rewriting.
- Core helpers live in `core/` folders only when they are truly cross-domain. Domain-specific logic stays with its domain.
- Generated artifacts stay put but are quarantined under `generated/`.
- Each app or package owns a single root-level `README.md`. Strip any secondary docs inside subfolders.

## Progress Tracker
| Milestone | Status | Notes |
| --- | --- | --- |
| 1 — Inventory & Alignment | Completed (2025-03-??) | File mappings finalized; generated binding placement handled during Milestone 2. |
| 2 — Backend Refactor | Completed (2025-03-??) | New `core/`, `domains/`, `routes/`, `schema/` structure live; Convex `_generated` files re-export from `core/generated/convex`; typecheck/build passing. |
| 3 — Types Refactor | Completed (2025-03-??) | `shared/` + `domains/` layout delivered; placeholders removed; build & typecheck green. |
| 4 — API Refactor | Completed (2025-03-??) | `shared/`, `domains/`, and `core/` structure live; curriculum client updated to use core helper; build/typecheck passing. |
| 5 — Cross-Package Validation & Cleanup | Completed (2025-03-??) | Codegen regenerated, packages rebuilt, shared READMEs updated. Final sanity checks tracked below. |

## Milestones & Definitions of Done

### Milestone 1 — Inventory & Alignment
- Map current backend, types, and API exports to their future locations.
- Document any symbols that will be dropped; secure approval to remove them.
- Draft file move strategy respecting pnpm workspace paths and Convex codegen requirements.
**Definition of Done**
1. Inventory spreadsheet or doc links every existing module to its new home (or deletion note).
2. No unknown or “to be decided” entries remain.
3. Stakeholders sign off on removals before code moves begin.

#### Backend Inventory Targets
| Current Path | Planned Destination | Notes |
| --- | --- | --- |
| `apps/backend/convex/auth.ts` | `convex/core/auth/client.ts` | Move Better Auth setup (`createAuth`, `authComponent`) into core auth client. |
| `apps/backend/convex/utils/authRoles.ts` | `convex/core/auth/hooks.ts` | `requireMembershipRole` becomes a shared auth hook. |
| `apps/backend/convex/http.ts` | `convex/routes/http.ts` | Router composition will call helpers from `core/auth/http.ts`. |
| `apps/backend/convex/magicLinkEmail.ts` | `convex/core/auth/services.ts` | Email helpers sit alongside auth services. |
| `apps/backend/convex/auth.config.ts` | `convex/core/config/auth.config.ts` | Configuration collected under `core/config`. |
| `apps/backend/convex/convex.config.ts` | `convex/core/config/convex.config.ts` | Convex app definition joins other config. |
| `apps/backend/convex/schema.ts` | `convex/schema/tables.ts` + `convex/schema/index.ts` | Split table definitions from schema export. |
| `apps/backend/schema.ts` | `convex/core/generated/betterAuth/schema.ts` | Confirm duplication; keep only generated copy under `core/generated`. |
| `apps/backend/convex/_generated/*` | `convex/core/generated/convex/*` | Generated Convex bindings quarantined under core generated folder. |
| `apps/backend/convex/curriculum.ts` | `convex/domains/curriculum/index.ts` | Domain barrel replaces thin re-export. |
| `apps/backend/convex/modules/curriculum/index.ts` | `convex/domains/curriculum/{queries,mutations,services}.ts` | Break monolith into domain modules. |
| `apps/backend/convex/modules/*` (empty) | Removed | Delete unused scaffolding (`auth/`, `impersonation/`, `organizations/`). |
| `apps/backend/convex/betterAuth/adapter.ts` | `convex/core/auth/adapter.ts` | Adapter sits with auth client. |
| `apps/backend/convex/betterAuth/auth.ts` | `convex/core/auth/static.ts` | Static accessor relocates under core auth. |
| `apps/backend/convex/betterAuth/convex.config.ts` | Merge or remove | Ensure no redundant config once core/config in place. |
| `apps/backend/convex/betterAuth/_generated/*` | `convex/core/generated/betterAuth/_generated/*` | Generated bindings quarantined under `core/generated`. |
| `apps/backend/convex/betterAuth/schema.ts` | `convex/core/generated/betterAuth/schema.ts` | Generated schema kept with other Better Auth outputs. |

#### Types Inventory Targets
| Current Path | Planned Destination | Notes |
| --- | --- | --- |
| `packages/types/src/core/index.ts` | `src/shared/ids.ts` + `src/shared/index.ts` | ✅ Helpers merged into shared primitives. |
| `packages/types/src/curriculum/index.ts` | `src/domains/curriculum/index.ts` | ✅ Barrel now re-exports submodules. |
| `packages/types/src/curriculum/lesson.ts` | `src/domains/curriculum/lesson/{primitives,segments,inventory,document,authoring,records}.ts` | ✅ Lesson schemas split by concern. |
| `packages/types/src/curriculum/manifest.ts` | `src/domains/curriculum/manifest/{manifest.ts,sync.ts,tree.ts}` | ✅ Manifest schemas modularized. |
| `packages/types/src/curriculum/analytics/index.ts` | Remove (unless populated during refactor) | ✅ Placeholder removed. |
| `packages/types/src/curriculum/questions/index.ts` | Remove (unless populated during refactor) | ✅ Placeholder removed. |
| `packages/types/src/index.ts` | Update to new shared/domains barrels | ✅ Root barrel re-exporting shared + domains. |

#### API Inventory Targets
| Current Path | Planned Destination | Notes |
| --- | --- | --- |
| `packages/api/src/env.ts` | `src/shared/env.ts` | Shared environment helpers live under `shared`. |
| `packages/api/src/curriculum.ts` | `src/domains/curriculum/{client,manager,fallback,services}.ts` | Decompose giant wrapper into focused files. |
| `packages/api/src/index.ts` | `src/index.ts` (new barrel) | Rebuild top-level exports aligned with domains. |
| `packages/api/convex/_generated/*` | `src/core/generated/convex/*` (or re-exported via `core/`) | Keep generated bindings isolated from hand-written code. |
| `packages/api/src` (new files) | `src/core/{client.ts,types.ts}` | Introduce reusable Convex HTTP client wiring in core. |

#### Open Questions
- ✅ `apps/backend/schema.ts` duplicates `convex/betterAuth/schema.ts`; redundant copy removed.
- ✅ No external references to `packages/types/src/curriculum/analytics/index.ts` or `packages/types/src/curriculum/questions/index.ts`; safe to remove.
- ✅ Convex `_generated` bridge: root files now re-export `core/generated/convex`, keeping codegen quarantined while satisfying tooling expectations.

- Lay down the new skeleton:
  - `core/` with auth services + generated assets ✅
  - `domains/<feature>/` folders with `queries.ts`, `mutations.ts`, `services.ts`, and `index.ts` ✅ (curriculum migrated)
  - `routes/http.ts` for router composition ✅ (updated import wiring)
  - `schema/tables.ts` + `schema/index.ts` ✅
  - root `index.ts` that re-exports domain entrypoints ✅
  - `convex.config.ts` wires Better Auth component from `betterAuth/convex.config.ts` ✅
- Curriculum logic extracted into domain files; legacy `modules/` + `utils` deleted ✅
- Convex `_generated` barrel now re-exports from `core/generated/convex` ✅
- Verification: `pnpm --filter @monte/backend typecheck` & `build` succeed (2025-03-??). ✅
**Definition of Done**
1. All backend files live in the new tree; old directories are removed.
2. `pnpm --filter @monte/backend build` and `pnpm --filter @monte/backend typecheck` succeed.
3. Only one `README.md` exists under `apps/backend/`.
4. File count audit shows zero dead or empty placeholders.

### Milestone 3 — Types Refactor (`packages/types`) ✅ Completed
- `shared/` folder now holds primitives (`shared/ids.ts` + barrel) and curriculum schemas live under `domains/curriculum`.
- Placeholder `analytics`/`questions` directories removed; `src/index.ts` re-exports shared + domain barrels.
- Verification (2025-03-??): `pnpm --filter @monte/types build` and `pnpm --filter @monte/types typecheck` both succeed.
**Definition of Done**
1. Source tree reflects `shared/` + `domains/` pattern; no files remain at the root except `index.ts`. ✅
2. `pnpm --filter @monte/types build` and typecheck succeed. ✅
3. All Zod schemas referenced by backend/API still resolve via updated import paths. ✅
4. Only one `README.md` in the package; delete duplicates. ✅

### Milestone 4 — API Refactor (`packages/api`)
- Established `shared/` for env helpers and `domains/curriculum/` for the curriculum client (`client.ts` + barrel).
- Added `core/client.ts` helper for creating `ConvexHttpClient` instances; domain client now depends on `core` exports.
- Build + typecheck succeed after path updates (`pnpm --filter @monte/api build` & `typecheck`, 2025-03-??).
- Remaining: audit for shared transformers/services as more domains arrive.
**Definition of Done**
1. Every exported function/class lives under `domains/` or `core/`; no stray modules at root. ✅
2. `pnpm --filter @monte/api build` succeeds with no unused exports. ✅
3. Browser-only helpers remain isolated; Node-specific code stays in `core/`. ✅
4. Single root `README.md` confirmed. ✅

### Milestone 5 — Cross-Package Validation & Cleanup
- Regenerate bindings after moves: `pnpm sync:codegen` (then re-run builds). ✅
- Update import paths in dependent packages (frontend, scripts) to match new structure. ✅
- Remove or rewrite any docs referencing old paths. ✅ (Readmes refreshed; `.docs` cleanup intentionally deferred per guidance.)
**Definition of Done**
1. Repo-wide `pnpm build`, `pnpm lint`, and `pnpm typecheck` complete without errors. ✅
2. Grep for legacy folder names (`modules/`, `utils/authRoles`, etc.) returns no hits. ✅
3. No smoke tests, scaffolds, or dead exports remain; the tree exactly mirrors the plan. ✅
4. Final pass confirms every app/package still has one README and no extra docs clutter. ✅

## Execution Notes
- Move/delete files using `git mv` or equivalent to preserve history where practical, but do not keep compatibility re-exports.
- Pause if you encounter unexpected files or unexplained domain code—clarify before guessing.
- After Milestone 5, freeze structure updates until new feature work begins to keep the foundation stable.
