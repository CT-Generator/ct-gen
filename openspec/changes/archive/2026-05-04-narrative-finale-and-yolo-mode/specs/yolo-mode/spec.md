## ADDED Requirements

### Requirement: Conspirators picker exposes a yolo CTA alongside the walkthrough CTA

The `/story/[uuid]` page (the conspirators picker) SHALL show two CTAs once a culprit and a motive are selected: the existing primary CTA that starts the stepwise build, and a secondary "yolo" CTA that triggers the one-click build. The yolo CTA MUST be visually distinguishable from the primary CTA but reachable in the same view (no extra navigation or modal). Both CTAs MUST be localized for `en` and `de`.

#### Scenario: Both CTAs are present after selection
- **WHEN** a visitor on `/story/[uuid]` has selected a culprit and a motive
- **THEN** the page shows the primary "walk me through it" CTA (current behavior)
- **AND** the page shows a secondary "yolo" / "just generate it" CTA
- **AND** both CTAs are enabled

#### Scenario: Both CTAs are localized
- **WHEN** the picker renders on `/de/story/[uuid]`
- **THEN** the yolo CTA copy is in German
- **AND** the walkthrough CTA copy is in German

#### Scenario: CTAs are disabled when selection incomplete
- **WHEN** a visitor has not selected both a culprit and a motive
- **THEN** both CTAs are disabled

### Requirement: Yolo path generates a complete theory in one server call

When the visitor clicks the yolo CTA, the client SHALL call `POST /api/start` (existing behavior) and then `POST /api/build/[id]/yolo`. The yolo route SHALL randomly select one idea per move from the row's `ideas`, generate all four section outputs, persist them under `per_move`, generate the narrative, persist it under `narrative`, and return success. Section generation across the four moves SHALL run in parallel where independent.

#### Scenario: Successful yolo build
- **WHEN** the client POSTs to `/api/build/[id]/yolo` for a row whose `ideas` is populated and `per_move` is empty
- **THEN** the route persists `per_move[anomaly|connection|dismiss|discredit]` each containing `{ idea, paragraph, debunk }`
- **AND** the chosen `idea` for each move is one of the strings in `ideas[move]`
- **AND** the route persists `recipeContent.narrative.paragraphs` (length 3)
- **AND** the route returns a 2xx response

#### Scenario: Idea selection is randomized
- **WHEN** two distinct yolo builds run for distinct generations with the same `ideas`
- **THEN** the picked ideas across the two runs are not deterministically identical (the system uses a non-seeded RNG)

#### Scenario: User lands on the result page after success
- **WHEN** the yolo route returns success to the client
- **THEN** the client navigates the visitor to `/g/[id]` (or `/de/g/[id]` for German)

#### Scenario: Idempotency on retry
- **WHEN** the yolo route is called for a row whose `per_move` already contains all four moves
- **THEN** the route does not regenerate sections or narrative
- **AND** the route returns success referencing the existing data

### Requirement: Yolo failures surface a clear error and do not leave the row half-built

If section generation or narrative generation fails for a yolo build, the route SHALL respond with a 5xx status and a user-facing error message, and the row's `per_move` SHALL NOT be left in a partial state where some moves are persisted and others are not. (A complete yolo build is all-or-nothing from the user's point of view; a failed yolo can be retried, or the user can fall back to the stepwise build path.)

#### Scenario: Section generation fails mid-fanout
- **WHEN** one of the four parallel section generations errors
- **THEN** the route responds with a 5xx status and a user-facing message
- **AND** `recipeContent.per_move` is not partially populated with only the moves that succeeded
- **AND** `recipeContent.narrative.paragraphs` is not set

#### Scenario: Narrative generation fails after sections succeed
- **WHEN** the four sections succeed but narrative generation fails
- **THEN** the four sections ARE persisted under `per_move`
- **AND** `narrative.paragraphs` is left unset
- **AND** the route returns success (the row is consistent with the "narrative absent" fallback on `/g/[id]`)

### Requirement: Yolo run shows the picked ideas on the result page

When a visitor lands on `/g/[id]` after a yolo build, the per-move blocks SHALL display the auto-picked idea for each move, using the same `idea_label` field that the stepwise flow already renders. The visitor MUST be able to see which idea the system picked per move without inspecting the database.

#### Scenario: Picked ideas appear on result page
- **WHEN** a visitor opens `/g/[id]` for a yolo-built generation
- **THEN** each per-move block shows the picked idea (the one randomly selected by the yolo route)
- **AND** the rendering matches the existing `dm.idea && (<p>{idea_label} {dm.idea}</p>)` pattern
