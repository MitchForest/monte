# Repository Guidelines

## Project Structure & Module Organization
 The workspace is a pnpm monorepo. UI and curriculum tooling live in `apps/frontend` (SolidJS + Vite), backend Convex functions are in `apps/backend`, and shared contracts ship from `packages/types` (Zod schemas) and `packages/api` (Convex client wrappers). Automation scripts sit under `scripts/`, while editable curriculum content now lives in `packages/curriculum-service`. Generated Convex bindings sync into `packages/api/convex/_generated`; never edit those files manually.

## Build, Test, and Development Commands
Run `pnpm install` once. Skip `pnpm dev` in agent environments—the combined launcher is flaky under automation. Instead, start targets individually via `pnpm --filter @monte/frontend dev` or `pnpm --filter @monte/backend dev`. `pnpm build` compiles every package, while `pnpm build:shared` runs Convex codegen before rebuilding `@monte/types` and `@monte/api`. After schema changes, run `pnpm sync:codegen`. Keep TypeScript and lint checks green with `pnpm typecheck` and `pnpm lint`. Curriculum scripts such as `pnpm --filter @monte/frontend validate:lessons` help verify lesson content.

## Coding Style & Naming Conventions
Code is TypeScript-first with ESM modules. Use 2-space indentation and respect ESLint (`eslint` + `eslint-plugin-solid`) and Tailwind defaults. Solid components and Convex functions use PascalCase, shared helpers stay camelCase, and Zod schemas live in `@monte/types` with descriptive names (`LessonDocumentSchema`). Prefer exhaustive type narrowing over `any` and keep domain logic under `apps/frontend/src/domains/*`.

## Testing Guidelines
 Frontend unit tests use Vitest and `@solidjs/testing-library`; colocate specs as `*.test.ts(x)` beside the code they cover. Run them via `pnpm --filter @monte/frontend vitest`. Back-end Convex logic relies on type guarantees; add integration checks by exercising generated clients in Vitest where practical. Maintain coverage around new features and update fixtures in `packages/curriculum-service` when tests depend on lesson content.

## Commit & Pull Request Guidelines
Commits follow the existing short, imperative style (`git log` shows entries like `complete app shell`). Limit each commit to a single concern, especially when touching shared schemas. PRs should include a concise summary, linked issue or doc reference, screenshots or screen recordings for UI work, and call out schema or generated file changes. Confirm `pnpm build`, `pnpm typecheck`, relevant tests, and `pnpm sync:codegen` ran before requesting review.

## Security & Configuration Tips
Store secrets through Convex env tooling and avoid checking `.env` files into the repo. Frontend expects Convex deployment IDs in `.env.local`; backend reads secrets from `convex env set`. Regenerate API keys immediately if they leak, and document any new configuration knobs in `.docs/plan.md` for future agents.

### Convex Data Hygiene (last verified: 2025-03-XX)
- Runtime tables: `units`, `topics`, `lessons`.
- Better Auth tables managed via plugins: `user`, `session`, `account`, `verification`, `organization`, `member`, `invitation`, `jwks` (plus Stripe adapters when enabled).
- No legacy `organizations`/`orgMemberships`/`billing` tables should remain in Convex — delete them immediately if discovered.
- Better Auth plugins in use: magic link, admin, organization, Stripe. Keep configuration changes documented alongside schema updates.

---- DON'T DELETE BELOW THIS LINE (authored by user)----

RULES:
- Auth Schema Updates (local install): cd apps/backend/convex/betterAuth, npx @better-auth/cli generate -y, pnpm sync:codegen, npx convex dev --once
- Get user explicit approval before any database/schema changes
- Use kobalte, tailwind, class variance authority for components


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
