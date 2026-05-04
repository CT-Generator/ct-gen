## Why

The `/stats` page already shows what's being **built** on the site — theories generated, ratings collected, top events/culprits/motives. What it cannot show is who is **visiting**: how many people land on `/`, how many follow through to `/recipe`, how many bounce, where they came from, whether the traffic skews mobile or desktop. After two consecutive UX/copy iterations (Apr 2026 report + fixes), it is hard to tell whether changes are landing because the v2 wizard's session-hash counter only increments when someone clicks "build a theory" — earlier funnel steps are invisible.

The project's existing privacy stance rules out Google Analytics, Plausible-the-hosted-product, or any other third-party tracker that ships JavaScript to the visitor. The session-hash machinery already in place (`web/lib/session.ts` — salted hash of coarse IP bucket + UA + day, set as a 1-year httpOnly cookie) is a good foundation: it's anonymous-by-construction, server-side, and there's no IP or User-Agent stored at rest. Visitor tracking should ride this same rail.

## What Changes

- **NEW table `page_views`:** one row per non-asset, non-bot page request. Columns: `id`, `session_hash`, `path`, `referrer_host`, `device_class`, `country`, `created_at`. All anonymous. No raw IP, no full URL, no User-Agent string at rest.
- **NEW capture path:** Next.js middleware sets `x-pathname` + `x-referrer` request headers on the request the route handler sees. The root `app/layout.tsx` schedules a fire-and-forget DB insert via `after()` from `next/server` so the response is not blocked. Static assets (`/_next/*`, `/icon.svg`, `/healthz`), the `/api/*` routes, and the maintainer-only `/stats/*` routes are excluded from capture.
- **NEW bot filter:** a small UA regex drops obvious crawlers (Googlebot, Bingbot, Yandex, Baidu, AhrefsBot, SemrushBot, etc.) before insert. The numbers reflect humans, not robots.
- **NEW device-class derivation:** UA is inspected at insert time, classified as `mobile` or `desktop`, then discarded. The UA string itself is never stored.
- **NEW geo column (optional):** the request is checked for a country header (`CF-IPCountry` by default, env-overridable). If present, ISO-2 country code is stored; if absent, `country` is `null`. Zero infrastructure cost today; if a future Caddy module or fronting CDN sets the header, country fills in automatically. (No MaxMind dependency, no file mount required.)
- **NEW page `/stats/visitors`:** a separate route under the existing Basic-Auth gate. Tiles for total page views, unique sessions, today's PVs, today's sessions, and avg pages-per-session. Time-series chart for daily page views + uniques since the first row. Top pages, top referrer hosts, device split, country split. Visual style matches the existing `/stats` v2 tab.
- **CHANGED `/stats` page nav:** the existing two-tab nav (v2 / v1) gains a third link to `/stats/visitors`. Same Basic Auth gate covers it via the existing middleware matcher.

## Capabilities

### New Capabilities

- `visitor-analytics`: Defines the privacy-preserving server-side capture of page-view events, the maintainer-only stats surface that aggregates them, and the anonymization guarantees that hold across the schema, capture path, and reporting layer.

### Modified Capabilities

<!-- The earlier `data-platform` (v2-rebuild) spec defined the three core tables. The new `page_views` table sits alongside them under the same Postgres role, same anonymization model. We add it as a new capability rather than re-opening the data-platform spec, since visitor-analytics is a self-contained slice. -->

## Impact

- **Code touched:** `web/lib/db/schema.ts` (page_views table), `web/middleware.ts` (broaden matcher, set request headers, keep /stats auth), `web/app/layout.tsx` (schedule capture via `after()`), `web/app/stats/page.tsx` (third nav link), `web/lib/env.ts` (new optional `GEOIP_COUNTRY_HEADER`).
- **Code added:** `web/lib/tracking.ts` (capture function + bot filter + device class + country resolver), `web/lib/visitor-stats.ts` (aggregate queries), `web/app/stats/visitors/page.tsx` (new page).
- **DB migration:** one new table + four indexes. Generated as `web/drizzle/0001_visitor_tracking.sql`. Mirrored into `infra/db/init.sql` so fresh deploys (empty pg volume) get the table without needing a separate migrate step.
- **Backward-compatible:** the existing `generations` / `ratings` / `quiz_items` tables, all existing routes, and the existing `/stats` page render exactly as before.
- **Deploy-time changes:** none required. `./infra/deploy.sh` works unchanged for fresh boots (init.sql picks it up). For the existing prod DB, run the new migration once: `docker exec -i cgen-db psql -U app -d cgen < web/drizzle/0001_visitor_tracking.sql`.
- **Token cost: zero.** No new LLM calls. No third-party services contacted on the request path.
- **Privacy posture:** strictly stronger than today. We do not log IPs (already true), do not store UA (was hashed-and-discarded in `session.ts`; same pattern here for the device-class derivation), do not store full referrer URLs (host only — drops query strings that can leak campaign identifiers), do not set any new cookies (reuse existing `cgen_sid`), and do not ship any client JavaScript for tracking.
- **Retention:** raw events kept indefinitely. Per the user's instruction. Future change can add a roll-up table if volume warrants.
