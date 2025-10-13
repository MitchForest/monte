# Monte Platform Monorepo

Monte runs as a pnpm workspace with clear seams between frontend features, Convex backend domains, and the shared packages that keep the two in lockstep. The goal is radical simplicity: one obvious place for every concern, no compatibility shims, and documentation that matches the codebase.

---

## Workspace layout

| Path | Purpose |
| --- | --- |
| `apps/frontend` | SolidJS app organised by `src/app`, `src/features`, and `src/shared`. Each feature folder maps to a user-facing flow. |
| `apps/backend` | Convex project structured as `convex/core`, `convex/domains/<domain>`, `convex/routes`, `convex/schema`. Auth lives in `core/`; production logic lives in domains. |
| `packages/types` | Source of truth for shared Zod schemas. Files live beneath `src/shared` (primitives) and `src/domains/<domain>`. |
| `packages/api` | Typed Convex client helpers grouped under `src/domains/<domain>` with supporting `src/core` and `src/shared` utilities. |
| `packages/*-service` | Content and runtime helpers (curriculum, lesson, graph, question, engine services). Each owns its own README describing current responsibilities. |
| `scripts/` | Workspace automation such as `sync-convex-codegen.mjs`. |

`apps/frontend`, `apps/backend`, `packages/types`, and `packages/api` intentionally share the same domain names so contracts line up: user-facing “features” in the frontend, “domains” everywhere else. Cross-cutting helpers stay in `app/`, `core/`, or `shared/` directories.

---

## How data flows

1. **@monte/types** – publishes Zod schemas and TypeScript types used by both backend and frontend. Modules export plain functions and schemas; no app-specific logic lives here.
2. **@monte/backend** – implements Convex queries/mutations per domain and exposes HTTP routes. Generated bindings land in `apps/backend/convex/_generated` before being synced to `packages/api`.
3. **@monte/api** – wraps Convex bindings with ergonomic helpers. Consumers import from `@monte/api` instead of touching generated files directly.
4. **@monte/frontend** – imports shared helpers and types, wiring them into Solid features. Every page is delivered via a feature barrel that the router consumes.

---

## Conventions

- **One path per concern.** UI logic lives in `features/*`; backend logic lives in `convex/domains/*`; shared typing lives in `packages/types/src/domains/*`.
- **No shims.** When names or paths change, update all consumers instead of keeping compatibility layers.
- **Codegen discipline.** Any backend change that touches schema or functions must be followed by `pnpm sync:codegen` so `packages/api` stays current.
- **Documentation parity.** Each app or package keeps a single README at its root describing structure and commands. Planning docs live in `.docs/` and are pruned as milestones complete.

---

## Handy commands

Run these from the repository root:

| Command | Description |
| --- | --- |
| `pnpm install` | Install workspace dependencies. |
| `pnpm --filter @monte/frontend dev` | Start the Solid dev server. |
| `pnpm --filter @monte/backend dev` | Start the Convex dev server. |
| `pnpm sync:codegen` | Regenerate Convex bindings and sync them into `packages/api`. |
| `pnpm build:shared` | Run codegen, then rebuild `@monte/types` and `@monte/api`. |
| `pnpm build` | Build every package/app in dependency order. |
| `pnpm typecheck` | Run TypeScript across the workspace. |
| `pnpm lint` | Execute lint scripts for all packages. |

When working under the Codex CLI, prefer running the targeted `dev` commands separately rather than `pnpm dev`, which spawns multiple processes.

---

## Getting started

1. Install prerequisites: Node 20+, pnpm 9+, Convex CLI (`npm install -g convex`).  
2. Clone the repo, run `pnpm install`, then log in to Convex (`npx convex dev`) so local development has credentials.  
3. Spin up servers with the targeted `dev` commands above.  
4. After editing backend schemas, run `pnpm sync:codegen` and commit the generated changes.  
5. Before opening a PR, run `pnpm lint`, `pnpm typecheck`, and `pnpm build`.

Keep commits scoped to one concern and update the relevant README or plan document when architecture changes. The foundation should stay understandable at a glance—optimise for clarity over cleverness.*** End Patch
