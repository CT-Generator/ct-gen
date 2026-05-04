## MODIFIED Requirements

### Requirement: Stats surface a per-locale split

The `/stats` v2 tab SHALL include a small per-locale breakdown — counts of generations and counts of ratings, split by `locale`. The breakdown MUST be a tile or one-row chart (not a separate page) and MUST hide itself when fewer than two locales have any rows in `generations` (clutter-avoidance). The breakdown MUST be locale-symmetric: it derives the locale set from the data, so any future locale (beyond `en`, `de`, `nl`) appears automatically once it has rows.

#### Scenario: One locale has data
- **WHEN** a maintainer views `/stats?tab=v2` and `generations` contains rows for only one locale
- **THEN** no per-locale split is rendered

#### Scenario: Two or more locales have data
- **WHEN** a maintainer views `/stats?tab=v2` and `generations` contains rows for at least two distinct locales
- **THEN** a small split row renders the count of generations per locale, the count of ratings per locale, and each locale's share-of-total
- **AND** locales appear in a stable order (alphabetical by code, or in the order returned by the query)

#### Scenario: All three current locales populated
- **WHEN** a maintainer views `/stats?tab=v2` and `generations` contains rows for `en`, `de`, AND `nl`
- **THEN** the split row shows three entries — `EN`, `DE`, `NL` — each with its count and percentage share-of-total
- **AND** the percentages add to 100% (rounding tolerance: ±1)

#### Scenario: Future locale appears without spec update
- **WHEN** a future change adds a fourth locale (e.g., `fr`) and `generations` accumulates `fr` rows
- **THEN** the split row renders four entries automatically
- **AND** no spec update is required to enumerate the new locale (the requirement is locale-symmetric)
