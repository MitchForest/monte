# Monte Platform Remediation Plan

Focus: resolve audit findings before taking on new feature work. Each item tracks a concrete deliverable; mark as `[x]` once merged.

## Immediate Checklist
- [x] **Stop shipping build artefacts.** Added ignore patterns for package build outputs and removed committed `dist/` trees plus `tsconfig.tsbuildinfo` files so only source remains under version control.
- [x] **Decompose the editor view model.** Editor flows now follow a four-file layout: `EditorPage` (view), `useEditorViewModel` (wiring/context), `editorState` (stores/signals), and `editorActions` (curriculum + lesson handlers). The monolithic hook is gone, and no extra micro-modules were introduced.
- [x] **Fix repo lint failures.** Updated shared TS path mappings so workspaces resolve package types from `dist/` (with `src/` fallback), rebuilt shared packages, and `pnpm lint` now passes without unsafe `error`-typed access warnings.
- [x] **Resolve graph-service typecheck gap.** Type resolution now points to generated declarations; `pnpm typecheck` completes cleanly across `@monte/graph-service`, `@monte/lesson-service`, and dependents.
- [x] **Restore Better Auth email delivery.** Resend-backed helper now ships from `apps/backend/convex/magicLinkEmail.ts`, and both `MAGIC_LINK_RESEND_API_KEY` and `MAGIC_LINK_FROM_EMAIL` are configured in the `dev:amiable-finch-982` Convex deployment.
- [x] **Stabilize curriculum client ownership.** Frontend now imports the shared `@monte/api` client/manager directly; the bespoke wrapper and provider registration code have been removed.
- [x] **Harden UI primitives.** Select and Radio now wrap Kobalte primitives with typed props—no `as unknown as` casts—and call sites continue to typecheck.
- [x] **Implement or fence off engine graph dependencies.** Engine task selection now returns explicit status results (`disabled`/`no-graph`/`no-questions`/`ok`) instead of `null`, and the README documents the prototype state; graph service already exposes readiness checks.
- [x] **Optimize Convex curriculum queries.** `listCurriculumTree` now paginates through units (with cursors) and `nextOrder` pulls max indices via ordered index scans instead of table-wide collects, trimming read volume on create/reorder paths. Further streaming cleanups remain possible but the hot paths are no longer full scans.

**Current focus:** Better Auth remediation is staged; awaiting green light to run full smoke tests (magic link, invite acceptance, JWT/OTT) and wrap up verification.

_Update this plan as work completes; keep it the single source of truth for baseline remediation._

## Better Auth Alignment (new)
- [x] **Enable full Better Auth plugin suite.** Added `jwt()`/`jwtClient()` and `oneTimeToken()`/`oneTimeTokenClient()` alongside the baseline plugins so JWKS, `/token`, and one-time-token flows are available by default.
- [x] **Keep canonical roles (`owner` / `admin` / `member`).** Owners stay the first signup, admin/member invites rely on stock Better Auth semantics, and org category (“household” vs “school”) now lives strictly in metadata.
- [x] **Deliver invite email via Resend.** Invitation hooks send real mail via the existing Resend credentials with a branded template and fall back to structured logging when email is unavailable.
- [x] **Centralize organization API access.** Refactored the frontend to funnel Better Auth organization calls through a single helper that uses `$fetch` against the official endpoints with runtime validation, eliminating scattered path literals.
- [x] **Retire duplicate auth schemas.** Removed the bespoke Zod definitions in `@monte/types`/`@monte/api`; auth consumers now lean on the Better Auth payloads plus lightweight runtime guards.
- [ ] **Verify end-to-end parity.** Still need to run the Better Auth smoke tests (magic link, invite acceptance, admin session, JWT/OTT retrieval) against dev and a staging-like stack to confirm no regressions.
- [x] **Register Better Auth hooks for metadata & diagnostics.** Before/after hooks now normalize organization payloads, enforce role inputs, and record smoke-test events so we no longer rely on bespoke endpoints.
- [x] **Surface owner/admin/member in the UI.** The auth store exposes membership roles, `RoleGuard` honors `owner`, and curriculum mutations now enforce `owner`/`admin` access on the backend.
- [x] **Automate owner onboarding.** First sign-ins provision a default household organization (with metadata) and mark it active automatically.
- [ ] **Confirm invitation UX.** Monte now ships a branded Resend invite flow—run UX/QA locally (and in staging) to ensure the templates and hooks behave as expected here. Other codebases will align separately.
- [x] **Standardize smoke testing.** Diagnostics are captured via hooks and exposed through a secret-protected HTTP endpoint so tooling can observe magic-link/invite flows without touching Better Auth tables.
