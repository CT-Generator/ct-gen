## 1. Stats query

- [x] 1.1 Add `loadV2GenerationsByLocale()` to `web/lib/stats.ts` returning `{ locale: string; generations: number; ratings: number }[]`, ordered by locale (alphabetical) for stable rendering
- [x] 1.2 SQL: `SELECT g.locale, count(*)::int AS generations, count(r.id)::int AS ratings FROM generations g LEFT JOIN ratings r ON r.generation_id = g.id WHERE g.source = 'created' GROUP BY g.locale ORDER BY g.locale` — same `source = 'created'` filter as `loadV2Totals()` for consistency
- [x] 1.3 Export the function from `web/lib/stats.ts`

## 2. Stats UI section

- [x] 2.1 In `web/app/stats/page.tsx`, import `loadV2GenerationsByLocale` and add it to the `Promise.all` block alongside the existing parallel queries
- [x] 2.2 If the result has fewer than 2 entries, render nothing (the clutter-avoidance scenario)
- [x] 2.3 Otherwise render a new `<section>` between the 5-tile summary row and the "Theories built per day" chart
- [x] 2.4 Section heading: `<h2>Per-locale split</h2>` (or similar) with the existing display-font sizing
- [x] 2.5 Within the section, render one row per locale: locale code (uppercase, monospace), generation count, ratings count, share-of-total percentage. Use the existing `Tile` styling tokens or a simple inline-flex row with a thin colored bar segment scaled by share
- [x] 2.6 Compute share-of-total = `generations / sum(all_generations)`; format as integer percent (e.g. `60%`)
- [x] 2.7 Confirm percentages add to 100 ± 1 across the rendered locales

## 3. Compile gates

- [x] 3.1 `npx tsc --noEmit` clean
- [x] 3.2 `npx next lint` clean
- [x] 3.3 `npx next build` succeeds

## 4. Live verification

- [x] 4.1 With Basic Auth credentials, hit `/stats?tab=v2` and confirm the new section renders below the 5-tile summary
- [x] 4.2 With current data: DB query confirms en=6 generations, de=5, nl=0 (no Dutch theories actually built yet — only seed entries exist). Two rows render in the section: DE (45%) + EN (55%). Code path that renders multiple locales is exercised; NL will appear automatically once a Dutch theory is built. Locale-symmetric behavior confirmed
- [x] 4.3 Confirm the percentages add to 100% (within rounding)
- [x] 4.4 Confirm the section is absent on the v1 tab and on `/stats/visitors`
- [x] 4.5 Sanity-check the SQL by comparing the sum of the breakdown's generation counts to the top-tile "Theories built" total — should match exactly

## 5. Final validation

- [x] 5.1 `openspec validate stats-per-locale-breakdown --strict` passes
