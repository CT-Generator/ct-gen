## Context

The `/stats` page answers the question "what is being built?" It cannot answer "who is visiting?" — for the simple reason that the only signal it has is the session-hash on the `generations` and `ratings` tables, and that hash is only persisted when someone actually clicks "build a theory" (and again when they rate). Every visitor who arrives, reads `/recipe`, and bounces is invisible.

The fix is to log a row per page view server-side, into the same Postgres database, under the same anonymous-by-construction session model. The challenge is doing this without leaking PII, without slowing down the response, and without violating the project's no-third-party-tracking stance.

Three constraints shape the design:

1. **Anonymous-by-default identity already exists.** `web/lib/session.ts` issues a 24-char salted hash cookie (`cgen_sid`) derived from a coarse IP bucket + UA + the current ISO date. We reuse it. We do **not** add new identifiers, do not extend the cookie's TTL, and do not change the salt rotation cadence.
2. **Edge runtime can't talk to Postgres.** Next.js middleware runs in the Edge runtime where the `postgres` driver doesn't load. So middleware can prepare context (set request headers) but cannot write rows. The write happens in the Node-runtime root layout, kicked off via `after()` from `next/server` so it doesn't block the streamed response.
3. **Caddy is in front.** Real client IPs reach the app via `X-Forwarded-For` (already used by `session.ts`). Geo is not currently provided by any layer in front of the app. We don't want to commission a maxmind module for this round.

## Goals / Non-Goals

**Goals:**
- One row per real human page view, with no PII at rest.
- A maintainer-only `/stats/visitors` page that answers: how many visitors, how many sessions, what pages, what referrers, what device split, what country split — all over time since launch.
- Capture cost on the request path: low single-digit milliseconds, never blocking. Any failure to insert silently no-ops; the user-facing response is unaffected.
- The design extends to country lookup the moment a header-emitting layer (Cloudflare, future maxmind-Caddy, edge proxy) is added, with no app-side change beyond an env var.

**Non-Goals:**
- Real-time analytics dashboards. The page is server-rendered with `dynamic = "force-dynamic"`; the user gets fresh-but-not-live data on each visit.
- A roll-up / aggregate table. Raw rows are kept indefinitely; if volume forces a change, that's a separate proposal. Today the math (a few thousand events/day at most) is comfortable on a single Postgres instance.
- Funnel-style sequencing analytics ("how many users got from / to /recipe in the same session?"). Possible in SQL with the schema we're building, but not visualized in v1 of the page.
- Cookie banner / GDPR consent flow. We do not store PII. We do not set any new cookie. The existing `cgen_sid` cookie is functional (HttpOnly, SameSite=Lax, salted-hash, no PII). The capture model is structurally consent-free.
- Bot identification beyond the simple UA-regex filter. Sophisticated headless-Chrome scrapers will get through; that's acceptable for a recipe-teaching site whose stats are purely directional.

## Decisions

**Decision 1: One table, `page_views`. No separate `sessions` table.**
A `sessions` table would duplicate what we can compute on the fly with `count(distinct session_hash) GROUP BY date`. Avoiding it keeps the write path to a single row insert, keeps the schema honest, and matches how the rest of the app already treats sessions (no row-of-truth, just a hash on the events).

**Decision 2: Capture from the root layout via `after()`, not from middleware.**
Middleware runs in the Edge runtime which can't open a TCP connection to Postgres without a non-Vercel-Edge driver (and we don't have one configured). Layouts run in Node. `after()` was made for this exact pattern — fire side effects after the response streams without blocking it. Failures inside `after()` do not affect the user response. Specifically: the layout reads `headers()` (which middleware populated with `x-pathname` / `x-referrer`), constructs a `PageViewEvent`, and `after(() => recordPageView(event))`. The function awaits the DB insert and swallows any error.

**Decision 3: Middleware sets `x-pathname` and `x-referrer` headers; matcher widens to all routes except assets/api/healthz.**
Layouts have no first-class way to read the URL path on the server (no `usePathname()` equivalent for RSC; `headers().get("referer")` gives the previous page, not the current one). So middleware sets the path itself. Reuses the existing middleware file by branching: if the path starts with `/stats`, run the existing Basic Auth gate; otherwise, set the request headers and pass through. The matcher excludes `/_next/*`, `/api/*`, `/healthz`, `/icon.svg`, `/favicon.ico`, and `/robots.txt` — all routes that aren't real human page views.

**Decision 4: Bot filter is a small allowlist-of-known-bots regex, applied at insert time inside `recordPageView`.**
A heavy bot-detection library would be overkill here. The tradeoff: we drop the obvious 80%+ of crawler traffic (which is what skews the page-view numbers most) and accept that headless scrapers may slip through. The function returns early without inserting if the UA matches the bot regex. Over time we can extend the regex if we see specific bots dominating the top-referrer charts.

**Decision 5: Device class is derived, not stored as raw UA.**
Same pattern as `session.ts`: read the UA header, classify as `mobile` (matches `iPhone|iPad|Android.*Mobile`), `desktop` (anything else), and discard the original string. Never persisted. Keeps the schema PII-free without giving up the most actionable axis of segmentation.

**Decision 6: Referrer is stored as host only, not full URL.**
Full referrer URLs leak query strings, including UTM codes that can in some cases be linked back to a specific user (e.g. mailing-list IDs encoded in the link). Storing only the host (e.g. `t.co`, `news.ycombinator.com`, `twitter.com`) gives us the same "where did this traffic come from?" answer without the leakage risk. Same-origin referrers (when host equals our own host) are stored as `null` to keep the top-referrers chart focused on external traffic.

**Decision 7: Country is opt-in via an env-configured header name. Default is `cf-ipcountry`.**
Zero-cost path: the column exists, the lookup is a one-line `headers.get(name)?.toUpperCase()`. If no layer in front sets the header, every row gets `country = null` and the country chart shows "no data". The moment Cloudflare or a future Caddy maxmind module starts emitting the header, country fills in automatically with no code change. We document the future MaxMind path in the spec (mount a `.mmdb`, install `@maxmind/geoip2-node`, look up at insert time) but do not ship it now.

**Decision 8: `/stats/visitors` is a separate route, not a third tab in the existing `/stats`.**
The user said "new page". The existing /stats v1/v2 tabs are about *what was built*; visitors is about *who showed up*. Different mental model. Different left-side narrative. Different chart shapes. A separate page reads cleaner. The existing /stats page gets a new third nav link pointing at it.

**Decision 9: Migration strategy: hand-write `0001_visitor_tracking.sql` AND mirror into `infra/db/init.sql`.**
Drizzle journal is updated so future `drizzle-kit generate` runs see this migration. Production DB volume already exists, so init.sql will not re-run; the deploy step is `docker exec -i cgen-db psql -U app -d cgen < web/drizzle/0001_visitor_tracking.sql` (idempotent thanks to `IF NOT EXISTS`). Fresh deploys (empty volume) get the table from init.sql.

## Risks / Trade-offs

- **[Risk] `after()` may not run in dev mode the same way as production.** In Next 15 dev, `after()` runs but errors aren't swallowed as cleanly. → Mitigation: wrap the body in try/catch, log on failure, never re-throw. The function is best-effort by design.
- **[Risk] First-page page views may miss the referrer header.** Some browsers strip `Referer` for privacy. → Acceptable. The "Direct / no referrer" bucket is itself information.
- **[Risk] Single Postgres instance is the only persistence for analytics.** A backup loss = an analytics history loss. → Mitigation: nothing — the existing `pg_dump` daily backup (already specced in v2-rebuild) covers this.
- **[Risk] The bot regex misses headless scrapers (Puppeteer, Playwright, etc.) that don't identify as bots.** → Acceptable for a low-traffic educational site. If an obvious anomaly shows in the daily counts, we extend the regex.
- **[Risk] Two writes per request now (the existing `generations`/`ratings` writes plus a `page_views` write on every navigation).** → Inserts are cheap; the new ones are fire-and-forget post-response. No measurable impact on response time.
- **[Risk] If the DB is briefly unavailable, page views silently disappear.** → Acceptable for analytics. Better than blocking the user response on the analytics write.
- **[Risk] Storing host-only referrer drops UTM-style attribution.** → Acceptable. We're not running paid acquisition. If we ever do, we can add a `utm_source` column then; not before.
