## MODIFIED Requirements

### Requirement: Postgres schema with three core tables

The data platform SHALL run Postgres 16 (or newer) with three core tables: `generations`, `ratings`, and `quiz_items`. The `generations` table MUST store the structured recipe-tagged JSON (anomalies, connect_dots, dismiss_counter, discredit_critics, debunk) as a JSONB column. The `generations` table MUST also carry a `locale` column (`text NOT NULL DEFAULT 'en'`) recording the locale the row was generated in, and an index on `(locale, created_at)` so per-locale time-series queries stay fast.

#### Scenario: Schema audit
- **WHEN** the database is initialized via the migration tool
- **THEN** the `generations` table exists with columns: `id` (uuid pk), `short_id` (text unique, indexed), `news_value` (text), `news_source` (text: `curated` | `custom` | `migrated`), `culprit_value` (text), `culprit_source` (text), `motive_value` (text), `motive_source` (text), `recipe_content` (jsonb non-null), `model_version` (text), `recipe_version` (text), `parent_generation_id` (uuid nullable fk), `created_at` (timestamptz nullable), `source` (text: `created` | `migrated`), `session_hash` (text nullable), **`locale` (text NOT NULL DEFAULT 'en')**
- **AND** the `ratings` table exists with columns: `id`, `generation_id` (uuid fk), `session_hash` (text), `score` (smallint), `created_at` (timestamptz)
- **AND** the `quiz_items` table exists with columns: `id`, `kind` (text: `real` | `fake`), `display_text` (text), `source_generation_id` (uuid nullable fk for fakes), `historical_label` (text nullable for reals), `created_at` (timestamptz)
- **AND** an index `generations_locale_created_at_idx` on `(locale, created_at)` exists

## ADDED Requirements

### Requirement: Locale provenance on every new generation

Every `generations` row created after this change SHALL persist a `locale` value matching the locale of the request that produced the row. Migrated rows (`source = 'migrated'`) and existing English rows MUST default to `'en'`. The locale value MUST be one of the supported locales (`'en'` or `'de'`) — never null, never an unrecognized string.

#### Scenario: New English generation
- **WHEN** a generation is created from a request whose middleware-resolved locale is `en`
- **THEN** the persisted row has `locale = 'en'`
- **AND** `recipe_version = 'v1'`

#### Scenario: New German generation
- **WHEN** a generation is created from a request whose middleware-resolved locale is `de`
- **THEN** the persisted row has `locale = 'de'`
- **AND** `recipe_version = 'v1.de'`

#### Scenario: Migrated rows default to English
- **WHEN** the migration that adds the `locale` column runs against an existing database with rows
- **THEN** all pre-existing rows have `locale = 'en'` (the column default)
- **AND** no row has `locale` null

### Requirement: Stats surface a per-locale split

The `/stats` v2 tab SHALL include a small per-locale breakdown — counts of generations and ratings split by `locale`. The breakdown MUST be a tile or one-row chart (not a separate page) and MUST hide itself when only one locale has data.

#### Scenario: One locale has data
- **WHEN** a maintainer views `/stats?tab=v2` and `generations` has only English rows
- **THEN** no per-locale split is rendered (clutter-avoidance)

#### Scenario: Both locales have data
- **WHEN** a maintainer views `/stats?tab=v2` and `generations` has both English and German rows
- **THEN** a small split tile or row shows the count per locale and the share-of-total
