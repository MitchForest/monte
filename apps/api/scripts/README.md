# Timeback Automation Scripts

CLI utilities that orchestrate roster ingestion and Timeback event handling. Each command should be run from the repo root so Bun can load the package workspace configuration. Ensure the appropriate `.env` file is in place (see `apps/api/.env.example`).

## Command Matrix

| Command | Purpose | Environments | Invocation | Notes |
| --- | --- | --- | --- | --- |
| `bun --filter @monte/api sync:roster` | Pull OneRoster data from Timeback and upsert Monte orgs, users, classrooms, courses, and guardians. | Local, Staging, Prod | Manual; schedule with your CI/cron once credentials are present. | Requires `TIMEBACK_ORG_ALLOWLIST` and OneRoster M2M credentials. Uses advisory locks so only one run executes at a time. |
| `bun --filter @monte/api register:caliper-webhook` | Create or update the Caliper webhook that forwards XP events to the Monte API. | Staging, Prod | Run once per environment whenever credentials or target URL change. | Needs `TIMEBACK_CALIPER_TOKEN` and Caliper client credentials. |
| `bun --filter @monte/api timeback:process-events` | Execute a single batch of the Timeback queue worker. | Local, Staging | Manual fallback when testing. | Production automation uses the Supabase Edge function described below. |
| `bun --filter @monte/api timeback:replay-events [eventId]` | Move DLQ records back into the processing queue. | Staging, Prod | Manual (break-glass) | Replays the first 200 DLQ rows if no `eventId` is provided. |
| `bun --filter @monte/api timeback:queue:show` | Inspect queue backlog and sample payloads. | Local, Staging, Prod | Manual | Helpful for on-call debugging. |
| `bun --filter @monte/api timeback:metrics:list [limit]` | View recent `sync_metrics` emissions. | Local, Staging, Prod | Manual | Defaults to 20 rows. |
| `bun --filter @monte/api timeback:sync-state` | Dump stored sync cursors for roster and worker jobs. | Local, Staging, Prod | Manual | Reveals last successful run timestamps. |
| `bun --filter @monte/api timeback:create-monte` | Seed demo staff, students, and guardians directly in Timeback. | Staging only | Manual | Safe to re-run; requires OneRoster credentials. |
| `bun --filter @monte/api seed:monte:progress` | Populate Montessori demo curriculum and analytics data. | Local, Staging | Manual | Assumes roster data already exists. |

## Supabase Edge Worker

Production queue processing is handled by the Supabase Edge function at `supabase/functions/timeback-worker/index.ts`. Schedule it from Supabase Cron (or an external scheduler) so it POSTs `TIMEBACK_WORKER_TOKEN`-authenticated requests to `${API_URL}/timeback-events/process`. Use `supabase functions secrets set` to manage the necessary `API_URL` and `TIMEBACK_WORKER_TOKEN` values; do not hard-code project URLs or anon keys.

For local debugging, the Bun CLI command `timeback:process-events` executes the same batch processor without invoking the edge runtime.

## Environment & Secrets Checklist

- Source the `.env` for the target environment before running scripts. Keep secrets in `.env.local` or external secret managers—never commit them.
- Timeback clients read credentials via `@monte/timeback-clients`, so ensure `packages/timeback-clients/.env` mirrors the required client IDs and secrets.
- When configuring Supabase secrets, store only the minimum set (`API_URL`, `TIMEBACK_WORKER_TOKEN`, optional `TIMEBACK_CALIPER_TOKEN`) and rotate them alongside API deployments.

## Operational Guidance

- Monitor `sync_metrics` to confirm roster and queue jobs continue emitting data. Lack of emissions indicates a stalled worker or missing cron trigger.
- Use the DLQ replay command after resolving downstream failures to safely requeue events.
- Run the webhook registration script whenever the API URL or Caliper signing secret changes.

These scripts remain in `apps/api` because they call directly into the API’s service layer and rely on its TypeScript types. If wider platform automation is needed, consider a top-level `tools/` workspace that re-exports the commands while keeping the implementation close to the services they invoke.
