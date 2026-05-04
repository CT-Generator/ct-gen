## ADDED Requirements

### Requirement: Anonymous server-side page-view capture

The system SHALL record one row per non-bot, non-asset, non-API human page request, into a `page_views` table in Postgres. Capture MUST happen server-side and MUST NOT require any client-side JavaScript or third-party network call. The capture path MUST NOT block the user-facing response — the row insert is scheduled to run after the response streams (via Next.js `after()` from `next/server`).

#### Scenario: A real visitor lands on /
- **WHEN** a browser issues `GET /` with a User-Agent that is not in the bot regex
- **THEN** exactly one row is inserted into `page_views`
- **AND** the row's `path` is `/`, `session_hash` is the request's `cgen_sid` (set or reused), `device_class` is `mobile` or `desktop`, `created_at` is the current timestamp
- **AND** the user-facing response time MUST NOT be blocked by the insert (the response streams whether or not the insert has completed)

#### Scenario: A bot crawls the home page
- **WHEN** a request arrives with a User-Agent matching `/Googlebot|Bingbot|.../i`
- **THEN** no row is inserted into `page_views`
- **AND** the request response is unaffected and returns the page normally (we don't 403 bots; we just don't count them)

#### Scenario: An asset / API / health request
- **WHEN** a request arrives at `/_next/static/...`, `/api/start`, `/healthz`, `/icon.svg`, `/favicon.ico`, or `/robots.txt`
- **THEN** the middleware matcher excludes the path so middleware does not run
- **AND** no row is inserted into `page_views` for those paths

### Requirement: No PII at rest

The `page_views` table SHALL NOT contain any column that stores raw IP addresses, full User-Agent strings, full referrer URLs (with query strings), email addresses, or any other directly identifying information. Every column MUST be either a derived/anonymized aggregate, an opaque salted hash, an enumerated category, or a free path string from the application's own URL space.

#### Scenario: Schema audit
- **WHEN** the table is created via the migration
- **THEN** the columns are exactly: `id` (uuid), `session_hash` (text — the same salted hash used by `cgen_sid`), `path` (text — the local URL path, no query string), `referrer_host` (text nullable — host portion only, never full URL), `device_class` (text — `mobile` or `desktop`), `country` (text nullable — ISO-3166 alpha-2 only), `created_at` (timestamptz)
- **AND** there is no column that stores raw IP, raw User-Agent, full URL, or any user-supplied free text

#### Scenario: Referrer is host-only
- **WHEN** a visitor arrives with `Referer: https://news.ycombinator.com/item?id=12345&utm_source=newsletter`
- **THEN** the inserted row has `referrer_host = 'news.ycombinator.com'`
- **AND** no path, no query string, and no UTM parameters are persisted

#### Scenario: Same-origin referrer is dropped
- **WHEN** a visitor navigates from `/recipe` to `/about` (same site)
- **THEN** the inserted row has `referrer_host = NULL`
- **AND** the top-referrers chart is not polluted by self-referrals

### Requirement: Device class derivation, not raw UA

Device class SHALL be derived from the User-Agent at insert time and the User-Agent string itself MUST NOT be persisted. Mobile is recognized via the regex `/iPhone|iPad|iPod|Android.*Mobile|Windows Phone|webOS|BlackBerry/i`. Anything else that is not a bot is classified as `desktop`.

#### Scenario: Mobile detection
- **WHEN** a request's UA contains `iPhone` or matches `Android.*Mobile`
- **THEN** the inserted row has `device_class = 'mobile'`
- **AND** the User-Agent string itself does not appear anywhere in the persisted row

#### Scenario: Desktop default
- **WHEN** a request's UA does not match the mobile regex and does not match the bot regex
- **THEN** the inserted row has `device_class = 'desktop'`

### Requirement: Country resolution is opt-in and zero-cost

The country column SHALL be populated from a request header whose name is configurable via the `GEOIP_COUNTRY_HEADER` env var (default: `cf-ipcountry`). If the header is absent or its value is not a valid two-letter ASCII code, the row's `country` is `NULL`. The system MUST NOT contact any external service or load any database file to resolve country in v1.

#### Scenario: No header configured, no country layer
- **WHEN** a request arrives directly through Caddy without a country header set by any layer
- **THEN** the inserted row has `country = NULL`
- **AND** no network call or file lookup is made for country resolution

#### Scenario: Header present with valid ISO-2 code
- **WHEN** a request arrives with `CF-IPCountry: de`
- **THEN** the inserted row has `country = 'DE'`

#### Scenario: Header present but invalid value
- **WHEN** a request arrives with `CF-IPCountry: XX1` (not two ASCII letters)
- **THEN** the inserted row has `country = NULL`

### Requirement: Maintainer-only /stats/visitors page

The `/stats/visitors` route SHALL be served behind the same HTTP Basic Auth gate as `/stats`. The page SHALL render aggregate visitor metrics from the `page_views` table: total page views and unique sessions (cumulative + today), pages-per-session, daily page views and daily unique sessions as time series, top pages, top referrer hosts, device split (mobile vs desktop), and country split.

#### Scenario: Anonymous request
- **WHEN** an unauthenticated browser requests `/stats/visitors`
- **THEN** the response is HTTP 401 with `WWW-Authenticate: Basic realm="..."` (same gate as `/stats`)

#### Scenario: Authenticated request, populated table
- **WHEN** a maintainer requests `/stats/visitors` with valid Basic Auth and the table has rows
- **THEN** the response is HTTP 200
- **AND** the page contains the five-tile summary row, the daily and cumulative time-series charts, and the four top-N tables (pages, referrers, device, country)
- **AND** the visual style matches the existing `/stats` v2 tab (same Masthead, Footer, fonts, color tokens)

#### Scenario: Authenticated request, empty table
- **WHEN** a maintainer requests `/stats/visitors` and `page_views` is empty
- **THEN** the response is HTTP 200
- **AND** the page renders a single empty-state placeholder ("No visits captured yet — pages will appear once the next visitor lands") instead of empty charts

### Requirement: Three-tab navigation between /stats pages

The maintainer dashboard's tab nav SHALL show three tabs — v2, v1, Visitors — on every page in the `/stats/*` namespace. The active tab is determined by the current route and `?tab=` query parameter.

#### Scenario: Tab structure on /stats
- **WHEN** a maintainer is on `/stats?tab=v2`
- **THEN** three tab links are visible: `v2 — Next.js wizard` (active), `v1 — legacy (imported)`, `Visitors`
- **AND** clicking `Visitors` navigates to `/stats/visitors`

#### Scenario: Tab structure on /stats/visitors
- **WHEN** a maintainer is on `/stats/visitors`
- **THEN** three tab links are visible: `v2`, `v1`, `Visitors` (active)
- **AND** clicking `v2` or `v1` navigates back to `/stats?tab=v2` or `/stats?tab=v1`
