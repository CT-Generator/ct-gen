## MODIFIED Requirements

### Requirement: Yolo failures surface a clear error and do not leave the row half-built

If section generation, narrative generation, or moderation fails for a yolo build such that the resulting persisted state would render `/g/[id]` differently from a successful tutored build (i.e., missing the narrative finale), the route SHALL respond with a non-2xx status and a user-facing error message, and the row's `recipeContent` SHALL NOT be left in a half-built state. A complete yolo build is all-or-nothing from the user's point of view: a YOLO build that returns success MUST result in a row whose `per_move` has all four moves AND `narrative.paragraphs` is set. A failed yolo can be retried, or the user can fall back to the stepwise build path.

#### Scenario: Section generation fails mid-fanout

- **WHEN** one of the four parallel section generations errors
- **THEN** the route responds with a 5xx status and a user-facing message
- **AND** `recipeContent.per_move` is not partially populated with only the moves that succeeded
- **AND** `recipeContent.narrative.paragraphs` is not set

#### Scenario: Narrative generation fails after sections succeed

- **WHEN** the four sections succeed but narrative generation throws, returns invalid output, or is moderation-flagged on both the initial attempt and the soft retry
- **THEN** the route responds with a non-2xx status and a user-facing message
- **AND** `recipeContent.per_move` IS persisted with all four new (or merged) move entries
- **AND** `recipeContent.narrative.paragraphs` is NOT set
- **AND** the row is therefore in the recoverable "moves complete, narrative missing" state that the idempotent path can fix on retry

#### Scenario: Successful YOLO response implies a complete-renderable row

- **WHEN** the YOLO route returns a 2xx response that is not `{ ok: true, cached: true }` for the all-complete short-circuit
- **THEN** the persisted row's `recipeContent.per_move` contains all four moves
- **AND** the persisted row's `recipeContent.narrative.paragraphs` is a non-empty array
- **AND** the row's `/g/[id]` render is identical in structural shape to a tutored-mode generation's render (narrative finale section + four-move breakdown section)

## ADDED Requirements

### Requirement: Yolo route retries narrative once when narrative fails

When `generateNarrative` throws, returns invalid output (e.g., empty `paragraphs`), or its joined output is moderation-flagged, the yolo route SHALL attempt the narrative call ONCE more before surfacing an error to the client. The retry uses the same inputs (the just-merged four paragraphs) without modification. If the retry also fails (throw, invalid output, or moderation flag), the route SHALL persist the merged `per_move` (so a subsequent idempotent yolo call can recover the row by generating only the narrative) AND return a non-2xx response with a user-facing error message. The retry adds at most one additional `generateNarrative` + `moderate` round-trip to the latency budget (~10–15s); the 90s client timeout already accommodates this on top of the existing discredit/dismiss soft retry.

#### Scenario: Narrative throws on first attempt, succeeds on retry

- **WHEN** the first `generateNarrative` call throws (e.g., transient OpenAI error)
- **THEN** the route logs `failure_category=narrative_retry_attempted` with the `shortId`
- **AND** calls `generateNarrative` again with the same inputs
- **AND** on retry success, logs `failure_category=narrative_retry_succeeded` and persists the merged `per_move` + the retry's `narrative.paragraphs`
- **AND** the route returns a 2xx response

#### Scenario: Narrative moderation-flagged on first attempt, passes on retry

- **WHEN** the first narrative passes generation but is moderation-flagged
- **THEN** the route logs `failure_category=narrative_retry_attempted` with the `shortId`
- **AND** calls `generateNarrative` again
- **AND** on the retry passing moderation, persists `per_move` + the retry's narrative and returns 2xx

#### Scenario: Narrative also fails on retry — moves persisted, error returned

- **WHEN** the retry also throws or is moderation-flagged
- **THEN** the route logs `failure_category=narrative_retry_also_failed` with the `shortId`
- **AND** persists the merged `per_move` (so the row is consistent with the recoverable "moves complete, narrative missing" state)
- **AND** does NOT persist `narrative.paragraphs`
- **AND** returns a non-2xx response with a user-facing message (5xx for throw, 422 for moderation)

#### Scenario: Idempotent recovery path regenerates only the narrative

- **WHEN** the YOLO route is called for a row whose `per_move` already contains all four moves AND `narrative.paragraphs` is undefined (the recoverable state left by a prior narrative-retry failure)
- **THEN** the route does NOT regenerate sections (none are missing)
- **AND** the route DOES attempt `generateNarrative` (with the same single-retry policy as the fresh path)
- **AND** on success, persists `narrative.paragraphs` and returns 2xx
- **AND** on second failure, returns the corresponding non-2xx error (`per_move` is already complete and is left untouched)
