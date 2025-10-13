# Monte Platform Remediation Plan

Focus: resolve audit findings before taking on new feature work. Each item tracks a concrete deliverable; mark as `[x]` once merged.

## Immediate Checklist
- [x] **Stop shipping build artefacts.** Added ignore patterns for package build outputs and removed committed `dist/` trees plus `tsconfig.tsbuildinfo` files so only source remains under version control.
- [ ] **Decompose the editor view model.** Split `apps/frontend/src/routes/editor/hooks/useEditorViewModel.tsx` into scoped stores/hooks (selection, forms, persistence, confirm flow) and introduce a thin provider that wires them together.
- [x] **Restore Better Auth email delivery.** Resend-backed helper now ships from `apps/backend/convex/magicLinkEmail.ts`, and both `MAGIC_LINK_RESEND_API_KEY` and `MAGIC_LINK_FROM_EMAIL` are configured in the `dev:amiable-finch-982` Convex deployment.
- [ ] **Stabilize curriculum client ownership.** Eliminate the duplicate singleton in `apps/frontend/src/domains/curriculum/api/curriculumClient.ts` and have all callers use the managed instance exported from `@monte/api`.
- [ ] **Harden UI primitives.** Introduce properly typed wrappers for the Kobalte Select/Radio components (removing the `as unknown as` casts) so consumer code keeps compile-time prop validation.
- [ ] **Implement or fence off engine graph dependencies.** Either ship minimal functionality for `packages/engine-service` / `packages/graph-service` or gate their usage behind feature flags to avoid silent `null` fallthroughs in runtime flows.
- [ ] **Optimize Convex curriculum queries.** Refactor `apps/backend/convex/modules/curriculum/index.ts` list/sync mutations to avoid full-table scans—use indexed/paginated access so large manifests stay within execution budgets.

**Current focus:** continue the editor view-model split. ✅ Data store now owns curriculum tree + lesson resources; next break out the remaining responsibilities (forms helpers, confirm controller, persistence hooks) into dedicated domain modules before thinning the route-level hook.

_Update this plan as work completes; keep it the single source of truth for baseline remediation._
