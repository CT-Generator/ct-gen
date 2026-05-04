## Context

A user reported a Next.js generic error page on production but we have no client-side error capture: no `error.tsx`, no `global-error.tsx`, no telemetry. The same Hetzner-hosted Next.js + Postgres stack already captures anonymous `page_views` from the root layout (see `web/middleware.ts` and `web/lib/visitor-stats.ts`); this change extends that pattern to capture client-side React render errors.

Constraints:
- Must keep the privacy stance documented in `visitor-analytics`: no IP, no full UA, no full URL, no PII.
- Must not require a third-party service or new infrastructure (the project runs on duckdns.org/Hetzner with Caddy + Next.js + Postgres).
- Must not add a noticeable runtime cost on the happy path — error reports are rare by definition.

## Goals / Non-Goals

**Goals:**
- Replace the default Next.js "Application error" page with a friendly localized retry view.
- Capture every uncaught React render error with enough context to diagnose it: message, truncated stack, Next.js `digest`, `path`, `locale`, `device_class`, `country`, `referrer_host`, `session_hash`.
- Surface errors to the maintainer in `/stats/visitors` (gated by the same Basic Auth) so they show up alongside other visitor signals.
- Keep capture privacy-equivalent to `page_views` (same hashing, no PII).

**Non-Goals:**
- Capturing non-React errors (network failures, unhandled promise rejections, console errors). v1 is React render errors only — those are what produced the user's report.
- Source-map symbolication. The minified stack from `error.stack` plus the Next.js `digest` is enough to triage; symbolication is a v2 concern if needed.
- Per-user error history. Errors are aggregate-only on the dashboard, like `page_views`.
- Replacing or supplementing server logs.

## Decisions

**Where capture lives.** Use a new `app/global-error.tsx` (root) and `app/error.tsx` (segment) that both call a shared `reportClientError(error, info)` helper. The helper does a `fetch('/api/client-errors', { method: 'POST', keepalive: true, body: JSON.stringify(...) })`. We choose this over `navigator.sendBeacon` because we want a JSON body and the response status for debugging; `keepalive` covers the unload-during-error case.

Alternative considered: a single `global-error.tsx`. Rejected because Next.js 15 only invokes `global-error.tsx` for errors in the root layout itself; segment-level render errors need `error.tsx` to render anything other than the bare HTML fallback.

**Server-side ingestion.** A POST `/api/client-errors` route runs on the Node runtime, validates the JSON body with Zod, derives `device_class` / `country` / `session_hash` exactly the same way `page_views` does, and inserts one row. We reuse the same derivation helpers rather than re-implementing them.

Alternative considered: piggybacking on the existing page-view path. Rejected — page views are written from `after()` in the root layout; client errors arrive via fetch and the two paths share nothing structurally.

**Storage.** New `client_errors` table in the existing Postgres database, separate from `page_views`. Same envelope columns plus `message`, `stack`, `digest`. We index on `(created_at desc)` and `(path)` for the dashboard queries.

Alternative considered: one wide table with a discriminator column. Rejected — error rows are sparse and verbose; mixing them with page views would bloat the hot table and complicate every existing visitor-analytics query.

**Rate limit and size cap.** Each request is capped at 4 KiB total body size; `stack` is truncated to 4 KiB before insert. Per-`session_hash` rate limit: at most 10 inserts per minute (rolling window in-memory, best-effort — a broken client can't keep us flooded). Over the cap → 200 with `{ ok: false, reason: "rate_limited" }`, never 4xx (client should not retry).

**Dashboard placement.** Add the errors pane as a new section on the existing `/stats/visitors` page rather than a new route. Reuses the same Basic Auth gate, the same Masthead/Footer chrome, and avoids a tab-nav change.

Alternative considered: a separate `/stats/errors` route with a 4th tab. Rejected for v1 — adds nav surface for a feature the maintainer will check rarely. Easy to split later if volume grows.

## Risks / Trade-offs

- **Risk: the error happens inside the error boundary itself** → mitigation: `global-error.tsx` is wrapped in a try/catch that swallows reporter errors; we never re-throw from the reporter.
- **Risk: a misbehaving client floods `/api/client-errors`** → mitigation: per-session rate limit + size cap. Worst case the table grows; we can drop and recreate.
- **Risk: stack traces leak data** → mitigation: stack is truncated to 4 KiB; message and stack are stored as plain text but the table is gated by the same auth as `/stats/visitors`. We do not log them to stdout.
- **Risk: `digest` is empty in dev** → acceptable; dev errors show the full Next.js overlay instead. The capture path still runs but with an empty digest.

## Migration Plan

1. Ship the `client_errors` migration (`drizzle-kit generate` then `drizzle-kit migrate`) — additive, no data movement.
2. Deploy the API route + error boundaries together. The boundaries fail closed (render the friendly page) regardless of whether the API responds.
3. Add the `/stats/visitors` section last — reading from an empty table is fine and renders the same empty-state pattern as the page-views tiles.

Rollback: drop the `client_errors` table. The error boundaries continue to render the friendly page; the failed POSTs are silently swallowed.
