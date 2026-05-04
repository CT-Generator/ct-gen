## Context

`/stats?tab=v2` summarises v2-wizard generations with five tiles (Theories built, Wizard finished, Ratings, Avg rating, Sessions) and four time-series + top-N visualizations. There is no per-locale split despite the canonical `data-platform` spec requiring one. The schema has had `generations.locale` since `multilingual-german` shipped; with `nl` now also live, three locales' rows are mixed under a single "Theories built" total.

The existing spec text uses "both locales" wording from the en/de era. Updating it once now to be locale-symmetric saves a re-spec when the next locale lands.

## Goals / Non-Goals

**Goals:**
- Surface generation counts per locale on `/stats?tab=v2`, with share-of-total.
- Hide the section when only one locale has data (preserve the clutter-avoidance scenario).
- Generalize the spec wording from "both locales" → "two or more locales" so future-locale additions don't require re-spec.

**Non-Goals:**
- Per-locale daily time series. Useful but adds chart-rendering work; not in spec scope.
- Per-locale rating averages. The spec mentions "ratings split by locale" — we'll include the COUNT of ratings per locale, not the average, since (a) avg-per-locale is noisy at low rating volumes, (b) the existing top-line "Avg rating" already gives the global signal, (c) the spec wording requires "counts of generations AND ratings" — it specifies counts.
- A separate `/stats/locales` deep-dive page. The spec explicitly says "tile or one-row chart, not a separate page".

## Decisions

### Single GROUP BY query, not three subqueries

Use one SQL: `SELECT locale, count(*) AS generations, count(rating) AS ratings FROM generations LEFT JOIN ratings ON … GROUP BY locale`. Returns one row per locale. Locales with zero rows don't appear (we don't render them either, so this is fine).

### Render: one-row split with count + share

The new section sits between the existing 5-tile summary and the "Theories built per day" chart. It renders per locale as: a small label (`EN`, `DE`, `NL`), a count, and a share-of-total percentage. Visual treatment: thin horizontal bar segments scaled by share-of-total, like a stacked bar but laid out as adjacent segments — gives the maintainer instant "60% English / 30% Dutch / 10% German" gut feel.

**Alternative considered:** three Tile components (mirroring the 5-tile row above). Rejected — too prominent visually relative to its informational density. A single thin bar communicates the same data more efficiently.

**Alternative considered:** stacked horizontal bar with absolute counts and percentages on hover. Rejected — server-rendered HTML, no interactive tooltips. A static three-segment bar with inline labels is the right complexity.

### Hide on single-locale data

Implement via a simple `if (rows.length < 2) return null;` at the top of the new section component. Matches the existing scenario verbatim.

### Spec rewording: locale-symmetric

The original spec text says "Both locales have data" — anglicised when only en+de existed. Rewrite as "Two or more locales have data". Add a scenario for the three-locale case enumerating EN, DE, NL explicitly so the spec carries concrete examples. The rule itself remains "if multiple locales have data, render the breakdown".

### Use `locale` column directly, not derive from `recipe_version`

`recipe_version` is `v1`, `v1.de`, `v1.nl` etc., which could also be a locale source. But `locale` is the canonical column for this purpose and is explicitly stored on every row. Using `locale` keeps the query simple and resilient if `recipe_version` schema drifts later.

## Risks / Trade-offs

- **[Locales with zero rows omitted from query result]** → Fine; the section only renders when ≥2 locales have data anyway. If we ever want a "0% NL" placeholder, it's an opt-in display tweak, not a query change.
- **[Visual noise on the v2 tab]** → One added thin row, ~16px tall. Negligible vs. the existing 5-tile + 4-chart + 4-list structure.
- **[Locales beyond en/de/nl]** → The query and rendering are locale-agnostic; if `fr` or `es` lands, they'll appear automatically. The spec is now generalized to support that.
