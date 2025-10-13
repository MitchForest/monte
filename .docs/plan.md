# Monte Platform Remediation Plan

Focus: resolve audit findings before taking on new feature work. Each item tracks a concrete deliverable; mark as `[x]` once merged.

## Immediate Checklist
- [x] **Stop shipping build artefacts.** Added ignore patterns for package build outputs and removed committed `dist/` trees plus `tsconfig.tsbuildinfo` files so only source remains under version control.
- [x] **Decompose the editor view model.** Editor flows now follow a four-file layout: `EditorPage` (view), `useEditorViewModel` (wiring/context), `editorState` (stores/signals), and `editorActions` (curriculum + lesson handlers). The monolithic hook is gone, and no extra micro-modules were introduced.
- [x] **Fix repo lint failures.** Updated shared TS path mappings so workspaces resolve package types from `dist/` (with `src/` fallback), rebuilt shared packages, and `pnpm lint` now passes without unsafe `error`-typed access warnings.
- [x] **Resolve graph-service typecheck gap.** Type resolution now points to generated declarations; `pnpm typecheck` completes cleanly across `@monte/graph-service`, `@monte/lesson-service`, and dependents.
- [x] **Restore Better Auth email delivery.** Resend-backed helper now ships from `apps/backend/convex/magicLinkEmail.ts`, and both `MAGIC_LINK_RESEND_API_KEY` and `MAGIC_LINK_FROM_EMAIL` are configured in the `dev:amiable-finch-982` Convex deployment.
- [x] **Stabilize curriculum client ownership.** Frontend now imports the shared `@monte/api` client/manager directly; the bespoke wrapper and provider registration code have been removed.
- [ ] **Harden UI primitives.** Introduce properly typed wrappers for the Kobalte Select/Radio components (removing the `as unknown as` casts) so consumer code keeps compile-time prop validation.
- [ ] **Implement or fence off engine graph dependencies.** Either ship minimal functionality for `packages/engine-service` / `packages/graph-service` or gate their usage behind feature flags to avoid silent `null` fallthroughs in runtime flows.
- [ ] **Optimize Convex curriculum queries.** Refactor `apps/backend/convex/modules/curriculum/index.ts` list/sync mutations to avoid full-table scans—use indexed/paginated access so large manifests stay within execution budgets.

**Current focus:** harden the UI primitives. Replace the remaining `Select`/`Radio` `as unknown as` casts with typed wrappers that preserve Kobalte ergonomics while enforcing prop safety, then verify editor screens continue to compile.

_Update this plan as work completes; keep it the single source of truth for baseline remediation._
