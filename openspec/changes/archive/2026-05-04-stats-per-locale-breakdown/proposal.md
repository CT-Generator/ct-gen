## Why

`data-platform` already requires `/stats?tab=v2` to surface a per-locale breakdown of generations + ratings, but the implementation never landed. The spec also pre-dates Dutch — its "Both locales have data" scenario only mentions EN+DE, even though `nl` is now a fully-shipped locale with its own seed catalog and live theories. This change fixes both gaps: implement the breakdown and extend the spec to cover all three current locales (and any future locale) symmetrically.

## What Changes

- **New stats query**: `loadV2GenerationsByLocale()` in `web/lib/stats.ts` returning per-locale counts of generations and ratings, ordered by locale. Counts use the same `source = 'created'` filter as `loadV2Totals()` for consistency.
- **New stats UI section** on the v2 tab of `/stats` (between the 5-tile summary row and the "Theories built per day" chart): a one-row breakdown showing the count per locale plus its share-of-total, hidden when only one locale has data (per existing spec).
- **Extend the spec scenarios** to enumerate three locales (en/de/nl) in the "multiple locales" scenario; rephrase "both locales" → "two or more locales" so the rule generalizes to future locales without re-spec churn.

## Capabilities

### New Capabilities
<!-- None — extends an existing capability. -->

### Modified Capabilities
- `data-platform`: tighten the per-locale-breakdown requirement to enumerate all three current locales (en/de/nl) and to use locale-symmetric phrasing for future-locale safety.

## Impact

- **DB**: zero schema change. Reuses the existing `generations.locale` column and `ratings → generations` join.
- **UI**: one new section on `/stats?tab=v2`. No new components — uses the existing `Tile` component and a small inline horizontal layout.
- **Specs**: one modified-capability delta.
- **Latency / cost**: one extra `SELECT … GROUP BY locale` query per `/stats` page render. Cheap; the page is auth-gated and rarely loaded.
- **Backwards compatibility**: section is hidden when only one locale has data. So early-stage rollouts (e.g., before the NL launch) saw nothing; now with all three locales populated, the section renders.
- **Pedagogical posture**: maintainer can see at a glance which locales are seeing real use — informs Dutch pass-2 review prioritization, German seed expansion, etc.
