## 1. Schema + migration

- [ ] 1.1 Add `pageViews` table to `web/lib/db/schema.ts` with columns: `id` (uuid pk), `sessionHash` (text not null), `path` (text not null), `referrerHost` (text nullable), `deviceClass` (text not null — `'mobile' | 'desktop'`), `country` (text nullable — ISO-2), `createdAt` (timestamptz, default now). Indexes on `created_at`, `session_hash`, `path`.
- [ ] 1.2 Generate migration: `npm run db:generate`. Verify the new file is named `0001_visitor_tracking.sql` (rename if needed) and contains `CREATE TABLE IF NOT EXISTS "page_views"` plus the four indexes.
- [ ] 1.3 Mirror the new table + indexes into `infra/db/init.sql` so fresh deploys (empty pg volume) get the table without a separate migrate step. Match the `IF NOT EXISTS` style of the existing tables.
- [ ] 1.4 Document the prod-rollout step in tasks.md §6: `docker exec -i cgen-db psql -U app -d cgen < web/drizzle/0001_visitor_tracking.sql` — idempotent on existing DB.

## 2. Tracking helper

- [ ] 2.1 Create `web/lib/tracking.ts` exporting `recordPageView(event: PageViewEvent)`. Function: applies the bot-UA regex, derives `device_class` from UA, resolves `country` from the configured header, inserts a `page_views` row, swallows any error. Returns `void`.
- [ ] 2.2 Bot regex: a single string covering the obvious crawlers — `Googlebot|Bingbot|Yandex|Baiduspider|DuckDuckBot|AhrefsBot|SemrushBot|MJ12bot|DotBot|PetalBot|Bytespider|GPTBot|ClaudeBot|Applebot|FacebookBot|TwitterBot|LinkedInBot|Slurp|Slackbot|Discordbot|TelegramBot|UptimeRobot|HeadlessChrome|crawler|spider|bot/i` — case-insensitive.
- [ ] 2.3 Device class: `/iPhone|iPad|iPod|Android.*Mobile|Windows Phone|webOS|BlackBerry/i` → `mobile`; otherwise `desktop`. No raw UA stored.
- [ ] 2.4 Referrer host: parse the `referer` header through `new URL()`, extract `host`. If parse fails or host equals our own `PUBLIC_BASE_URL` host, return `null`. Drops query strings entirely.
- [ ] 2.5 Country lookup: read `headers.get(env.GEOIP_COUNTRY_HEADER ?? 'cf-ipcountry')`, uppercase, validate it's two ASCII letters, else `null`.
- [ ] 2.6 Add optional `GEOIP_COUNTRY_HEADER` env var to `web/lib/env.ts` (Zod string optional, default `cf-ipcountry`).

## 3. Middleware + capture wiring

- [ ] 3.1 Update `web/middleware.ts`: widen the matcher to include all human-visited routes; exclude `/_next/*`, `/api/*`, `/healthz`, `/icon.svg`, `/favicon.ico`, `/robots.txt`. The matcher in Next 15 supports negative lookahead — use `'/((?!_next/|api/|healthz|icon\\.svg|favicon\\.ico|robots\\.txt).*)'`.
- [ ] 3.2 Inside the middleware function: branch on `req.nextUrl.pathname.startsWith('/stats')`. If yes, run the existing Basic Auth gate. If no, build a `NextResponse.next({ request: { headers: ... } })` that adds `x-pathname` and `x-referrer` (the original `Referer` header) to the request headers passed to the route handler. Static asset paths are already excluded by the matcher; no further filtering needed.
- [ ] 3.3 Update `web/app/layout.tsx`: import `headers` from `next/headers` and `after` from `next/server`. Read `x-pathname`, `x-referrer`, `user-agent`, plus any country header. Build the `PageViewEvent`. Call `after(() => recordPageView(event))`. Skip if `x-pathname` is missing (defensive — means middleware didn't run).
- [ ] 3.4 Layout reads the existing session hash via `getOrIssueSessionHash()`. Same call path as the rest of the app — no new cookie or salt logic.

## 4. Visitor stats queries

- [ ] 4.1 Create `web/lib/visitor-stats.ts` exporting a Visitor-specific counterpart to `lib/stats.ts`'s shape:
  - `loadVisitorTotals()` → `{ page_views, unique_sessions, page_views_today, unique_sessions_today, pages_per_session, inception }`.
  - `loadVisitorViewsDaily()` → `DailyRow[]` (page views per day, gap-filled from inception to today).
  - `loadVisitorSessionsDaily()` → `DailyRow[]` (unique sessions per day, gap-filled).
  - `loadVisitorTopPages(n=10)` → `TopRow[]` (most-viewed paths).
  - `loadVisitorTopReferrers(n=10)` → `TopRow[]` (most common referrer hosts; null/empty filtered out).
  - `loadVisitorDeviceSplit()` → `TopRow[]` (mobile vs desktop counts).
  - `loadVisitorCountrySplit(n=15)` → `TopRow[]` (top countries by page-view count; nulls bucketed as `Unknown`).
- [ ] 4.2 All queries `WHERE created_at IS NOT NULL` (defensive, even though `created_at` defaults to now). Use the same `db().execute(sql\`...\`)` pattern as `lib/stats.ts`. No prepared statements (matches existing code).

## 5. /stats/visitors page

- [ ] 5.1 Create `web/app/stats/visitors/page.tsx`. Server component, `dynamic = "force-dynamic"`, `metadata.title = "Visitors"`. Reuses `Masthead`, `Footer`, `BarChart`, `LineChart`, `MOVES` for color tokens.
- [ ] 5.2 Top section (mirrors `/stats` v2): a `meta` "Stats · Visitors" eyebrow, an H1 ("Who is showing up."), tab nav showing v2 / v1 / Visitors with Visitors active.
- [ ] 5.3 Tile row (5 across at lg): Page views, Unique sessions, Today (pv), Today (sessions), Pages/session.
- [ ] 5.4 "Page views per day" bar chart (since inception). "Unique sessions per day" bar chart. "Cumulative page views" line chart.
- [ ] 5.5 Two-column TopList grids (reuse the `TopList` component from /stats by extracting it to `web/components/top-list.tsx`): Top pages, Top referrers, Device split, Country split.
- [ ] 5.6 Empty state: if `loadVisitorTotals().page_views === 0`, render a friendly "No visits captured yet — pages will appear once the next visitor lands" placeholder instead of empty charts.

## 6. /stats nav link + shared TopList

- [ ] 6.1 Refactor `web/app/stats/page.tsx`: extract `Tile`, `TopList`, `RatingHist` into `web/components/stats-pieces.tsx` (or one file per piece) so `/stats/visitors` can reuse them. Keep visual output identical.
- [ ] 6.2 Update the `<TabLink>` row in `/stats/page.tsx` and add an equivalent in `/stats/visitors/page.tsx` so the nav shows three tabs: `v2 — Next.js wizard` (existing), `v1 — legacy (imported)` (existing), `Visitors` (new). Active tab determined by route + searchparam.
- [ ] 6.3 Add a small "What's tracked / privacy" disclosure at the bottom of `/stats/visitors`: a short paragraph explaining the anonymization model in human terms (no IPs, host-only referrer, no UA, etc.) so a future maintainer reading the page understands the scope.

## 7. Verify + ship

- [ ] 7.1 `npm run typecheck` clean.
- [ ] 7.2 `npm run build` clean.
- [ ] 7.3 Local dev: start `npm run dev`, visit `/`, `/recipe`, `/about`, `/teach`, `/g/<existing-shortid>`. Then visit `/stats/visitors` (Basic Auth → password from `.env.local`). Confirm: tile row shows non-zero counts, daily-views chart has at least today's bar, top-pages list contains the routes you visited, device split shows desktop, country shows Unknown (no header in dev).
- [ ] 7.4 Bot-filter spot check: `curl -A "Googlebot/2.1" http://localhost:3000/`. Confirm no row was inserted for that request.
- [ ] 7.5 Build a theory end-to-end. Confirm the wizard flow doesn't regress (no slowdowns, no errors in the browser console).
- [ ] 7.6 Apply migration to prod DB:
  ```bash
  ssh conspiracy_generator 'docker exec -i cgen-db psql -U app -d cgen' < \
    web/drizzle/0001_visitor_tracking.sql
  ```
- [ ] 7.7 Deploy: `SKIP_MIGRATION=1 ./infra/deploy.sh`.
- [ ] 7.8 Post-deploy verify: visit prod home, then `/stats/visitors`. Confirm the home visit shows up. Confirm device split, top pages, top referrers all populated as visitors arrive over a 15-minute window.
- [ ] 7.9 Commit + push to main.
