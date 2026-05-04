## Why

A user reported the Next.js generic "Application error: a client-side exception has occurred" page on conspiracy-generator.duckdns.org and we have no way to find out what actually broke — we ship no `error.tsx`, no `global-error.tsx`, and no client-side error telemetry. Without capture, every future report is the same dead-end. Adding a thin error-capture path lets us see the real error, the path, the locale, and the device class for any future occurrence, modeled on the existing `page_views` capture flow.

## What Changes

- Add `app/global-error.tsx` (root error boundary) and `app/error.tsx` (segment fallback) that show a friendly retry page in the user's locale and `POST` the error to a new endpoint.
- Add a `POST /api/client-errors` endpoint that accepts an error report and inserts a row into a new `client_errors` table.
- Add a `client_errors` table with: `id`, `created_at`, `path`, `locale`, `message`, `stack` (truncated), `digest` (Next.js error digest), `user_agent`, `device_class`, `country`, `session_hash`, `referrer_host`. Same hashing/derivation rules as `page_views`.
- Wire a new "Errors" pane into `/stats/visitors` (or a sibling tab) showing: count today, count last 7 days, top error messages, top paths producing errors, recent stack samples.
- Drop a small JSON payload size cap and rate-limit per session-hash so a broken client cannot flood the table.

## Capabilities

### New Capabilities
- `client-error-reporting`: capture, store, and surface client-side React errors so we can diagnose production exceptions.

### Modified Capabilities
- `visitor-analytics`: extend the `/stats/visitors` page to include the errors pane; reuse `session_hash`, `device_class`, `country`, `referrer_host` derivations already defined for `page_views`.

## Impact

- New code: `web/app/global-error.tsx`, `web/app/error.tsx`, `web/app/api/client-errors/route.ts`, `web/lib/client-errors.ts`, `web/components/stats-errors.tsx` (or extension of `stats-pieces.tsx`), Drizzle migration adding `client_errors`.
- Modified code: `web/app/stats/visitors/page.tsx` (new pane), `web/lib/visitor-stats.ts` or a sibling `client-error-stats.ts` for queries.
- New runtime cost: one extra POST per uncaught client error (rare). No extra cost on the happy path.
- Privacy: same envelope as `page_views` — no PII beyond what we already store; stack traces truncated to a hard cap (e.g., 4 KiB) before insert.
- Ops: nothing to deploy beyond the migration; the Postgres + Next.js stack already running on Hetzner is sufficient.
