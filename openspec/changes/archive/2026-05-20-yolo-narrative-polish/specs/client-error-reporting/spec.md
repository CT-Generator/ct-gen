## MODIFIED Requirements

### Requirement: Capture endpoint stores one row per uncaught client error

The system SHALL expose `POST /api/client-errors` accepting a JSON body `{ message: string, stack?: string, digest?: string, path: string, locale: "en" | "de" | "nl" }`. On a valid request the server MUST insert exactly one row into the `client_errors` table with derived `device_class`, `country`, `referrer_host`, and `session_hash` using the same rules as `page_views`. On an invalid or oversized request the server MUST respond `200 OK` with `{ ok: false, reason: "<reason>" }` and insert nothing — the client never retries.

#### Scenario: Valid POST inserts one row
- **WHEN** the boundary POSTs `{ message: "Cannot read properties of undefined (reading 'foo')", stack: "...", digest: "1234567890", path: "/recipe", locale: "de" }` from a desktop browser with `cgen_sid` set
- **THEN** the server inserts exactly one row into `client_errors`
- **AND** the row has `message` set verbatim, `stack` truncated to ≤4 KiB, `digest = '1234567890'`, `path = '/recipe'`, `locale = 'de'`, `device_class = 'desktop'`, `session_hash` matching the request's `cgen_sid`-derived hash
- **AND** the response is `200 OK` with `{ ok: true }`

#### Scenario: Valid Dutch POST inserts one row
- **WHEN** the boundary POSTs an otherwise-valid body with `locale: "nl"` from a Dutch session
- **THEN** the server inserts exactly one row into `client_errors` with `locale = 'nl'`
- **AND** the response is `200 OK` with `{ ok: true }`
- **AND** the request is NOT rejected as schema-invalid

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

The migration SHALL create a `client_errors` table whose envelope columns match `page_views` exactly (same names, same derivations) and which adds three error-specific columns. The `locale` column accepts values `'en'`, `'de'`, and `'nl'`. The table MUST NOT contain raw IPs, full User-Agent strings, full referrer URLs, or any user-supplied free text other than the React error `message` and truncated `stack`.

#### Scenario: Schema audit
- **WHEN** the migration runs
- **THEN** `client_errors` has exactly the columns: `id` (uuid), `created_at` (timestamptz), `path` (text), `locale` (text — `'en'`, `'de'`, or `'nl'`), `message` (text), `stack` (text nullable, ≤4 KiB), `digest` (text nullable), `referrer_host` (text nullable, host-only), `device_class` (text — `'mobile'` or `'desktop'`), `country` (text nullable, ISO-2), `session_hash` (text)
- **AND** there are indexes on `(created_at DESC)` and `(path)`
- **AND** there is no column for raw IP, full UA, or full URL

#### Scenario: Stack truncation
- **WHEN** a POST arrives with a `stack` longer than 4 KiB
- **THEN** the inserted row has `stack` truncated to the first 4 KiB
- **AND** the truncation marker `"...[truncated]"` is appended within the 4 KiB cap
