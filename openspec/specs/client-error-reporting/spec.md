# client-error-reporting Specification

## Purpose
TBD - created by archiving change client-error-reporting. Update Purpose after archive.
## Requirements
### Requirement: React render errors render a friendly localized fallback

The Next.js app SHALL render an `app/global-error.tsx` (root error boundary) and an `app/error.tsx` (segment error boundary) so that uncaught React render errors never produce the default "Application error: a client-side exception has occurred" screen. The fallback MUST localize its copy via the project's existing i18n strings (`en` / `de`) and MUST offer a "Try again" action that calls the boundary's `reset()` and a link back to `/`.

#### Scenario: Segment-level render error
- **WHEN** a component below the root layout throws during render in production
- **THEN** the user sees the segment fallback rendered by `app/error.tsx` with localized title, body, and "Try again" / "Home" actions
- **AND** the fallback uses the site's typography and color tokens so it does not look like a stark browser default page

#### Scenario: Root-layout render error
- **WHEN** the root layout itself throws during render
- **THEN** the user sees the root fallback rendered by `app/global-error.tsx`
- **AND** the page contains a `<html><body>` shell with localized copy and a link to `/`

#### Scenario: Reporter throws
- **WHEN** the error boundary's call to `reportClientError(...)` itself throws
- **THEN** the boundary still renders the friendly fallback
- **AND** no exception propagates to the user

### Requirement: Capture endpoint stores one row per uncaught client error

The system SHALL expose `POST /api/client-errors` accepting a JSON body `{ message: string, stack?: string, digest?: string, path: string, locale: "en" | "de" }`. On a valid request the server MUST insert exactly one row into the `client_errors` table with derived `device_class`, `country`, `referrer_host`, and `session_hash` using the same rules as `page_views`. On an invalid or oversized request the server MUST respond `200 OK` with `{ ok: false, reason: "<reason>" }` and insert nothing — the client never retries.

#### Scenario: Valid POST inserts one row
- **WHEN** the boundary POSTs `{ message: "Cannot read properties of undefined (reading 'foo')", stack: "...", digest: "1234567890", path: "/recipe", locale: "de" }` from a desktop browser with `cgen_sid` set
- **THEN** the server inserts exactly one row into `client_errors`
- **AND** the row has `message` set verbatim, `stack` truncated to ≤4 KiB, `digest = '1234567890'`, `path = '/recipe'`, `locale = 'de'`, `device_class = 'desktop'`, `session_hash` matching the request's `cgen_sid`-derived hash
- **AND** the response is `200 OK` with `{ ok: true }`

#### Scenario: Body exceeds size cap
- **WHEN** the POSTed body exceeds 4 KiB
- **THEN** the server responds `200 OK` with `{ ok: false, reason: "too_large" }`
- **AND** no row is inserted

#### Scenario: Per-session rate limit
- **WHEN** a single `session_hash` POSTs an 11th request within a 60-second rolling window
- **THEN** the server responds `200 OK` with `{ ok: false, reason: "rate_limited" }`
- **AND** no row is inserted

#### Scenario: Schema validation failure
- **WHEN** the body is missing `message` or has the wrong shape
- **THEN** the server responds `200 OK` with `{ ok: false, reason: "invalid" }`
- **AND** no row is inserted

### Requirement: client_errors table schema mirrors page_views privacy envelope

The migration SHALL create a `client_errors` table whose envelope columns match `page_views` exactly (same names, same derivations) and which adds three error-specific columns. The table MUST NOT contain raw IPs, full User-Agent strings, full referrer URLs, or any user-supplied free text other than the React error `message` and truncated `stack`.

#### Scenario: Schema audit
- **WHEN** the migration runs
- **THEN** `client_errors` has exactly the columns: `id` (uuid), `created_at` (timestamptz), `path` (text), `locale` (text — `'en'` or `'de'`), `message` (text), `stack` (text nullable, ≤4 KiB), `digest` (text nullable), `referrer_host` (text nullable, host-only), `device_class` (text — `'mobile'` or `'desktop'`), `country` (text nullable, ISO-2), `session_hash` (text)
- **AND** there are indexes on `(created_at DESC)` and `(path)`
- **AND** there is no column for raw IP, full UA, or full URL

#### Scenario: Stack truncation
- **WHEN** a POST arrives with a `stack` longer than 4 KiB
- **THEN** the inserted row has `stack` truncated to the first 4 KiB
- **AND** the truncation marker `"...[truncated]"` is appended within the 4 KiB cap

### Requirement: Reporter is best-effort and non-blocking

The client-side `reportClientError(error, info)` helper SHALL POST with `keepalive: true` and MUST NOT block rendering of the fallback UI. The fetch promise MUST be wrapped so any rejection is silently swallowed. The helper MUST NOT call itself recursively if the POST fails.

#### Scenario: Capture endpoint is unreachable
- **WHEN** the user is offline or the endpoint returns 5xx
- **THEN** the boundary still renders the friendly fallback within the same paint
- **AND** no error from the reporter surfaces in the React tree
- **AND** no retry is scheduled

