# Overview
- Monte is a pnpm monorepo with SolidJS frontend, Convex backend, and shared packages for types and API clients.
- We optimize for radical simplicity: domain-first organization, no legacy shims, and single-source exports.
- Only root-level `README.md` files per app/package; no auxiliary docs scattered elsewhere.

# Commands
- `pnpm build`: compile every workspace package.
- `pnpm build:shared`: run Convex codegen then rebuild shared packages.
- `pnpm sync:codegen`: regenerate Convex bindings after schema/auth updates.
- `pnpm --filter @monte/frontend dev`: start the frontend in isolation.
- `pnpm --filter @monte/backend dev`: start the Convex backend locally.
- `pnpm typecheck`, `pnpm lint`: keep TS and linting clean before commits.

# Frontend (apps/frontend)
- Feature-first layout: each domain owns `pages/`, `components/`, `state/`, `api/`, `utils/`, optional `types/`.
- Stick to SolidJS, Tailwind, Kobalte patterns already established; no duplicate docs inside subfolders.

# Backend (apps/backend)
- Convex code lives under `convex/` with a `core/` spine (auth, config, generated assets, shared utils) and `domains/<feature>/` folders containing `queries.ts`, `mutations.ts`, `services.ts`, `index.ts`.
- `schema/` holds `tables.ts` + `index.ts`; HTTP routes are composed in `routes/http.ts`; `convex/index.ts` re-exports domains.
- Delete dead modules instead of hiding them; keep helpers with their domains unless truly cross-cutting.

# Package: @monte/types (packages/types)
- `shared/` (or `core/`) hosts primitives like `ids.ts`, enums, metadata helpers.
- `domains/<feature>/` mirrors backend naming; each domain groups related Zod schemas (e.g., `lesson/`, `manifest/`) with a barrel `index.ts`.
- Root `index.ts` re-exports shared primitives and domain barrels—no extra files at the top level.

# Package: @monte/api (packages/api)
- `core/` contains Convex HTTP client setup and shared types.
- `domains/<feature>/` matches backend domains, with `client.ts` (Convex wrappers), optional `services/transformers`, and `index.ts` assembling the public surface.
- Remove fallbacks or stubs that don’t deliver value; offline behavior lives alongside its domain implementation.

---- DON'T DELETE BELOW THIS LINE (authored by user)----

RULES:
- Auth Schema Updates (local install): cd apps/backend/convex/betterAuth, npx @better-auth/cli generate -y, pnpm sync:codegen, npx convex dev --once
- In 99.9% of the time, use Better Auth defaults (tables, schemas, apis, hooks, naming conventions, orgs/users/roles/permissions, etc). There must be a very good reason to stray from this and explicit user approval. We use better auth names but internally our mapping is as follows. Org = Household or school. Owner = first to signup for a new org. Admin = others invited in (could be parents/guardians for household OR teachers for school). Members = students.
- Get user explicit approval before any database/schema changes
- Use kobalte, tailwind, class variance authority for components
- Follow established conventions/patterns for code organization (one long file is better than arbitraily splitting a file into a bunch of helpers that are hard to reason about; but even better than that is having a clean split per domain between view, view model, actions, and state if necessary)
- ZERO backwards-compatibility, legacy shims, etc. This is another phrase for LAZY code and technical debt and we have ZERO tolerance for it.
- Do not edit .env variables (or expected variables) without user explicit approval (and if backend ones are edited, use npx convex env set VAR_NAME value)



PRINCIPLES:
- Simplicity First, Always
We optimize for clarity, not cleverness. The best system is the simplest one that accomplishes the goal cleanly.

- Question complexity, don’t perpetuate it.
When you see technical debt, awkward abstractions, or tangled logic, pause before adding more. Ask: “Is this the simplest way to achieve the goal?”

- Favor deletion over addition.
If a feature, abstraction, or layer can be removed without breaking the product’s promise — remove it. Every extra piece of code is a maintenance cost.

- Resist “cargo cult” engineering.
Don’t copy patterns or introduce frameworks without understanding why they’re needed. Build from first principles and adapt to our actual use case.

- Prefer explicitness to cleverness.
Code should be easy to reason about for any future reader. If something requires multiple mental hops to follow, it’s too complex.

- Spot and call out over-engineering.
It’s everyone’s job to raise a hand when something feels more complicated than it needs to be — even if it “works.” Silent acceptance is how technical debt spirals.

- Conventions over invention.
Follow established patterns and architecture guidelines unless there’s a clear, articulated reason to deviate. Shared conventions reduce friction and cognitive load.

- Mental models over magic.
Each module should have a simple conceptual model (“this thing does one job”). If it’s hard to explain, it’s probably hard to maintain.
