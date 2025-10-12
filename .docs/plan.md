## Monte Platform Execution Plan

The goal of this pass is to stabilize type safety, enforce clear ownership boundaries, and prepare the stack for rapid lesson authoring. This plan is coordinated with the refactor tracks in `.docs/refactor.md`.

---

### Guiding Principles
- **Better Auth owns identity**: Keep the shipped organization and Stripe plugins as the canonical source for auth, RBAC, and billing. No parallel app-managed tables.
- **Single source of truth per concern**: Normalization, validation, and content transforms live in one package and are imported everywhere else.
- **Shared package layout**: All service packages (`curriculum`, `lesson`, `question`, `engine`, `graph`) follow the same structure:
  - `src/contracts`: exported Zod schemas/types that other packages consume.
  - `src/runtime`: pure helpers/algorithms used by apps/scripts.
  - `src/adapters`: IO layers (Convex clients, file loaders, etc.).
  - `src/scripts`: optional CLI utilities that wrap runtime functions.
  - `index.ts`: curated exports by audience (runtime, authoring, tooling).
- **Frontend mirrors services**: UI domains (`apps/frontend/src/domains/*`) map 1:1 with the packages and only import via `@monte/*` entrypoints.
- **Incremental, testable steps**: Each milestone keeps lint/type/build green and adds focused tests where helpful.

---

### Workstream 1 — Immediate Hygiene
1. **Resolve current typecheck failure**  
   - Narrow `overview.error` to Solid’s accessor type in `apps/frontend/src/routes/app.tsx`.
2. **Audit Better Auth usage**  
   - Confirm no app-defined auth/org/billing tables remain.  
   - Document the active Better Auth table set and note that default plugin behavior is acceptable for now.

---

### Workstream 2 — Shared Normalization & Validation
1. **Centralize normalization**  
   - Move timeline + inventory normalization into `@monte/lesson-service` (see Workstream 3) or `@monte/curriculum-service` if needed temporarily.  
   - Update Convex mutations, API client, frontend scripts, and runtime helpers to consume the shared exports.
2. **Add tests**  
   - Cover normalization + validation edge cases at the package level to prevent regressions.

---

### Workstream 3 — Package Architecture Alignment
1. **Introduce `@monte/lesson-service`**  
   - Houses lesson document assembly, manipulative definitions, inventory rules, XState machines, and authoring validators.  
   - Expose normalized helpers consumed by backend/API/frontend.
2. **Refactor existing packages**  
   - Reorganize `@monte/curriculum-service`, `@monte/question-service`, `@monte/graph-service`, and `@monte/engine-service` to the shared layout.  
   - Shift stray runtime logic (e.g., inventory helpers) into their respective packages.
3. **Update exports & imports**  
   - Ensure apps/scripts rely on package entrypoints rather than reaching into `apps/*` for shared logic.

---

### Workstream 4 — API Client Isolation
1. **Replace global singleton**  
   - Promote `createCurriculumClient`/`createCurriculumHttpClient` factories.  
   - Provide scoped helpers (`createBrowserCurriculumClient`, etc.) returned from the package without mutating globals.
2. **Refactor consumers**  
   - Inject clients through context/providers in the frontend.  
   - Update scripts to create their own instances.
3. **Token lifecycle**  
   - Ensure `setAuthToken` operates on instance state; extend tests to simulate parallel sessions.

---

### Workstream 5 — Frontend Domain Restructure
1. **Auth domain cleanup**  
   - Extract organization/session management into dedicated hooks/services that consume the new API client instances.  
   - Reduce `AuthProvider` to wiring + context.
2. **Lesson runtime/editor split**  
   - Implement `useLessonPlayer` (runtime view-model) and editor-specific state separated from the monolithic route.  
   - Co-locate authoring components under `domains/curriculum` with clear module boundaries.
3. **Domain-aligned module tree**  
   - Organize feature folders (`auth`, `curriculum`, etc.) so each maps directly to a backend/package area.

---

### Workstream 6 — Authoring Workflow Enablement
1. **Scripts & seeding**  
   - Update curriculum sync/seed scripts to consume shared normalization + lesson-service exports.  
   - Add smoke scripts for validating manifest vs Convex snapshot.
2. **Authoring UX**  
   - Ensure editor flow uses lesson-service helpers for defaults, validation, and preview.  
   - Add guardrails (toast/errors) when normalization detects invalid documents.
3. **Documentation**  
   - Record the new package layout, client injection pattern, and authoring workflow in `AGENTS.md` or dedicated docs.

---

### Completion Criteria
- `pnpm typecheck`, `pnpm lint`, `pnpm build`, and targeted tests stay green throughout execution.
- Backend/API/frontend/scripts all rely on the same normalization + validation helpers.
- Each service package shares the agreed layout and exposes clear public entrypoints.
- Frontend domains align with package responsibilities, replacing singletons and monolithic routes.
- Lesson authoring/editing can be iterated rapidly using the shared helpers, with Better Auth remaining the single auth/org owner.
