## 1. Database

- [x] 1.1 Add a Drizzle schema entry for `client_errors` mirroring the columns in the spec (id, created_at, path, locale, message, stack, digest, referrer_host, device_class, country, session_hash) plus indexes on `(created_at desc)` and `(path)`.
- [x] 1.2 Run `drizzle-kit generate` and verify the migration SQL adds the table without touching `page_views`.
- [ ] 1.3 Apply the migration locally (`drizzle-kit migrate`) and confirm the schema matches the spec audit scenario.

## 2. Capture endpoint

- [x] 2.1 Create `web/lib/client-errors.ts` with: a Zod schema for the request body, `recordClientError(req, payload)` that derives `device_class` / `country` / `referrer_host` / `session_hash` (reusing the same helpers `page_views` uses), truncates `stack` to 4 KiB with a `…[truncated]` marker, and inserts one row.
- [x] 2.2 Add `POST /api/client-errors/route.ts` (Node runtime) that: enforces the 4 KiB body cap, runs Zod validation, applies the per-`session_hash` rolling-window rate limit (10/min), and returns `{ ok: true }` or `{ ok: false, reason }` — always HTTP 200.
- [ ] 2.3 Hit the endpoint from `curl` against the local dev server with a valid body, an oversized body, an invalid shape, and a flood of 11 requests in a minute. Confirm one row inserted, three reasons returned, no 4xx.

## 3. Error boundaries

- [x] 3.1 Add `web/lib/report-client-error.ts` exporting `reportClientError(error, info)` that POSTs to `/api/client-errors` with `keepalive: true`, swallows all rejections, and never retries.
- [x] 3.2 Add `web/app/error.tsx` (segment boundary) — `"use client"`, calls `reportClientError` from a `useEffect`, renders a localized fallback (title, body, "Try again" → `reset()`, "Home" → `/`). Pull copy from existing `web/lib/i18n/{en,de}.ts` (extend if needed).
- [x] 3.3 Add `web/app/global-error.tsx` (root boundary) — `"use client"`, wraps `<html><body>` shell, calls `reportClientError`, renders the same localized fallback inside the shell.
- [ ] 3.4 Manually trigger a render error in dev (throw from a component) and confirm both: (a) the friendly page renders, (b) one `client_errors` row is inserted with the matching `digest`.

## 4. /stats/visitors errors pane

- [x] 4.1 Add `web/lib/client-error-stats.ts` with queries: `loadClientErrorTotals()` (today + last-7-days counts), `loadClientErrorTopMessages(n)`, `loadClientErrorTopPaths(n)`, `loadClientErrorRecentSamples(n=20)`.
- [x] 4.2 Extend `web/app/stats/visitors/page.tsx` to render a "Client errors" section below the existing visitor tiles, including the empty-state placeholder when the table has no rows.
- [ ] 4.3 Confirm the page is still gated by Basic Auth (no change to middleware needed) and that the new section matches the existing tile/table styling.

## 5. Verification

- [x] 5.1 `npm run typecheck` passes.
- [x] 5.2 `npm run lint` passes.
- [ ] 5.3 Manually verify on the dev server: throw from a page component → friendly fallback renders → row appears in `client_errors` → row appears in `/stats/visitors` after auth.
- [ ] 5.4 Verify in the browser console that the POST is `keepalive: true` and never retries on failure (kill the server, throw an error, confirm no retry storm).
