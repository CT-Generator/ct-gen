## ADDED Requirements

### Requirement: /stats/visitors surfaces a client-error pane

The `/stats/visitors` page SHALL render a "Client errors" section, served behind the same HTTP Basic Auth gate as the rest of `/stats`. The section MUST show, computed from the `client_errors` table: total errors today, total errors over the last 7 days, top error messages with counts, top paths producing errors with counts, and a recent-samples list (most recent 20 rows) showing `created_at`, `path`, `locale`, truncated `message`, and `digest`.

#### Scenario: Authenticated request, populated client_errors
- **WHEN** a maintainer requests `/stats/visitors` with valid Basic Auth and `client_errors` has rows
- **THEN** the response is HTTP 200 and the page contains a "Client errors" section below the existing visitor tiles
- **AND** the section shows the today/7-day counts, the top-N message and path tables, and the recent-samples list
- **AND** the visual style matches the existing visitor tiles (same Masthead, Footer, fonts, color tokens)

#### Scenario: Authenticated request, empty client_errors
- **WHEN** a maintainer requests `/stats/visitors` and `client_errors` is empty
- **THEN** the response is HTTP 200
- **AND** the "Client errors" section renders a single empty-state placeholder ("No client errors captured yet — they will appear here when a user hits an uncaught exception")

#### Scenario: Anonymous request
- **WHEN** an unauthenticated browser requests `/stats/visitors`
- **THEN** the response is HTTP 401 with `WWW-Authenticate: Basic realm="..."` (unchanged from existing behavior)
- **AND** the "Client errors" section is not rendered to the anonymous request
