## ADDED Requirements

### Requirement: Postgres schema with three core tables

The data platform SHALL run Postgres 16 (or newer) with three core tables: `generations`, `ratings`, and `quiz_items`. The `generations` table MUST store the structured recipe-tagged JSON (anomalies, connect_dots, dismiss_counter, discredit_critics, debunk) as a JSONB column.

#### Scenario: Schema audit
- **WHEN** the database is initialized via the migration tool
- **THEN** the `generations` table exists with columns: `id` (uuid pk), `short_id` (text unique, indexed), `news_value` (text), `news_source` (text: `curated` | `custom` | `migrated`), `culprit_value` (text), `culprit_source` (text), `motive_value` (text), `motive_source` (text), `recipe_content` (jsonb non-null), `model_version` (text), `recipe_version` (text), `parent_generation_id` (uuid nullable fk), `created_at` (timestamptz nullable), `source` (text: `created` | `migrated`), `session_hash` (text nullable)
- **AND** the `ratings` table exists with columns: `id`, `generation_id` (uuid fk), `session_hash` (text), `score` (smallint), `created_at` (timestamptz)
- **AND** the `quiz_items` table exists with columns: `id`, `kind` (text: `real` | `fake`), `display_text` (text), `source_generation_id` (uuid nullable fk for fakes), `historical_label` (text nullable for reals), `created_at` (timestamptz)

### Requirement: One-shot migration from Google Sheets

A one-shot migration script SHALL pull all rows from the legacy `generated_ct` and `ratings` Google Sheets and insert them into Postgres. Migrated `generations` rows MUST have `source='migrated'`, `created_at=NULL`, `recipe_content` set to a JSONB object that captures the original free-form theory text under a `legacy_text` field plus empty placeholders for the four recipe moves to mark them as not-recipe-tagged.

#### Scenario: Migration script runs
- **WHEN** the migration script is run with a valid GCP service account credential
- **THEN** all 2688 historical `generated_ct` rows insert into `generations` with `source='migrated'` and the listed null/legacy field handling
- **AND** all 100 historical `ratings` rows insert into `ratings` with the matching `generation_id` linked back via the migrated triple
- **AND** the script reports row counts before exiting
- **AND** running the script a second time is a no-op (idempotent on `(news_value, culprit_value, motive_value)` for migrated rows)

### Requirement: Provenance preserved on every row

Every `generations` row SHALL record `model_version` (e.g. `claude-sonnet-4-7-2026-XX-XX`), `recipe_version` (a string identifying which recipe schema was used; v1 = the four-move + debunk shape), and `source` distinguishing migrated from new rows. The `recipe_content` JSONB MUST always include either the structured five-section shape OR (for migrated rows) the `{legacy_text: ..., recipe_tags: null}` shape — never an unlabeled dump.

#### Scenario: New generation persists provenance
- **WHEN** the app generates a new theory with the v1 recipe schema using model `claude-sonnet-4-7`
- **THEN** the resulting row has `model_version='claude-sonnet-4-7-<date>'`, `recipe_version='v1'`, `source='created'`, and `recipe_content` of shape `{anomalies, connect_dots, dismiss_counter, discredit_critics, debunk}`

### Requirement: Daily backups with offsite copy

The system SHALL run a daily `pg_dump` of the database, store the dump to a Hetzner Storage Box (or equivalent) with at least 30 days of retention, and copy each dump to an offsite location (S3-compatible bucket on a separate provider) with at least 7 days of retention.

#### Scenario: Backup audit
- **WHEN** the backup cron has run for at least 7 consecutive days
- **THEN** the Hetzner Storage Box contains 7 daily dumps with timestamps in the filename
- **AND** the offsite bucket contains the most recent 7 of those dumps

### Requirement: Anonymized aggregate export

The system SHALL provide a maintainer-only export endpoint that returns aggregate statistics (counts by motive, counts by culprit category, recipe-tag distribution, ratings distribution) and a fully-anonymized row-level export for research use. PII MUST NOT appear in either export; `session_hash` MUST be replaced with a per-export pseudonymized token.

#### Scenario: Maintainer downloads aggregate stats
- **WHEN** an authenticated maintainer requests `/admin/export/aggregate.csv`
- **THEN** the response is a CSV with columns describing aggregate counts and distributions
- **AND** no individual generation's text appears in this file

#### Scenario: Maintainer downloads research export
- **WHEN** an authenticated maintainer requests `/admin/export/research.jsonl`
- **THEN** the response is a JSON-Lines file where each row contains the generation's content, model_version, recipe_version, and a per-export pseudonym for `session_hash`
- **AND** the original `session_hash` values do NOT appear in this file
