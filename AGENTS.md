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
