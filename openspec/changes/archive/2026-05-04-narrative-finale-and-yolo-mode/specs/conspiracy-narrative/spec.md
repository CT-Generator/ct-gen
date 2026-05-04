## ADDED Requirements

### Requirement: Three-paragraph narrative is generated and persisted with every new generation

When a recipe-tagged generation reaches a state where all four moves' `paragraph` outputs exist, the system SHALL generate a three-paragraph integrated conspiracy-theory narrative and persist it on the generation row at `recipeContent.narrative.paragraphs`. Generation MUST complete server-side before the route that finalised the build returns its response, so a subsequent GET of `/g/[id]` reads the narrative without further model calls. The narrative MUST integrate the four move paragraphs into one continuous arc with conspiracist-voice flair (it is not a concatenation, header, or bullet list of the per-move paragraphs).

#### Scenario: Stepwise build finishes with narrative populated
- **WHEN** a stepwise build's `POST /api/build/[id]/discredit/section` succeeds and `per_move` now contains all four moves
- **THEN** the same route call generates a narrative and persists it to `recipeContent.narrative.paragraphs` (length 3) before returning
- **AND** the persisted `narrative.generated_at` is an ISO timestamp set at generation time

#### Scenario: Yolo build finishes with narrative populated
- **WHEN** `POST /api/build/[id]/yolo` resolves successfully
- **THEN** the row's `recipeContent.narrative.paragraphs` has length 3
- **AND** the response is sent only after the narrative has been persisted

#### Scenario: Narrative integrates the four moves
- **WHEN** the narrative-generation prompt receives the four `paragraph` outputs, the event/culprit/motive triple, and the locale
- **THEN** the resulting three paragraphs reference the specific anomaly, connection, dismissal, and discrediting claims from the input paragraphs
- **AND** the narrative is plain prose (no headings, bullets, or move labels)
- **AND** the narrative does NOT include the per-move debunks

### Requirement: Result page renders the narrative above the per-move blocks

The `/g/[id]` page SHALL render the persisted narrative as a distinct section, framed as the finished theory, positioned after the page lede (culprit/event/motive heading and conspiracist intro) and before the four per-move stamped blocks. The per-move stamped blocks (paragraph + debunk + tell-stamp) MUST remain on the page; the narrative does not replace them.

#### Scenario: Narrative present and well-placed
- **WHEN** a visitor opens `/g/[id]` for a generation whose `recipeContent.narrative.paragraphs` is set
- **THEN** the page contains a section rendering each of the three narrative paragraphs in order
- **AND** the section sits between the lede area and the first per-move block
- **AND** all four per-move stamped blocks (with their tells and debunks) still render below

#### Scenario: Visual boundary between narrative and per-move section
- **WHEN** the narrative is rendered alongside the per-move blocks
- **THEN** there is a visible heading or rule that distinguishes "the theory" (narrative) from the per-move section ("how the trick was built", or equivalent localized copy)

### Requirement: Result page falls back gracefully when narrative is absent

When a generation has no `narrative` field (e.g., older rows created before this capability shipped, or rows where narrative generation failed), the page SHALL render exactly as it did before the capability was introduced — per-move blocks only, no broken narrative section, no error to the user.

#### Scenario: Older generation without narrative
- **WHEN** a visitor opens `/g/[id]` for a generation whose `recipeContent.narrative` is undefined
- **THEN** the page renders the per-move stamped blocks only
- **AND** no narrative section heading or empty container appears

#### Scenario: Narrative generation failed but build succeeded
- **WHEN** the narrative model call failed or was moderation-flagged at build time
- **THEN** the row is persisted without `narrative.paragraphs`
- **AND** the result page still renders the four per-move blocks
- **AND** the user is not shown a generation error

### Requirement: Narrative is generated in the row's persisted locale

The narrative MUST be generated in the locale stored on the generation row (`row.locale`), not the visitor's UI locale. Subsequent visits in a different UI locale render the persisted narrative in its original language.

#### Scenario: German row, English visitor
- **WHEN** a row with `locale = "de"` is built and a visitor opens `/g/[id]` with UI locale `en`
- **THEN** the narrative paragraphs are in German

### Requirement: Narrative passes the same moderation filter as per-move paragraphs

The narrative output MUST be passed through the same moderation check used for per-move section paragraphs. If the moderation check flags the narrative, the system SHALL NOT persist `narrative.paragraphs`; the build must still succeed and persist the per-move data.

#### Scenario: Flagged narrative is dropped
- **WHEN** the narrative output is flagged by moderation
- **THEN** the row is persisted without `narrative.paragraphs`
- **AND** the route's response indicates success (the per-move build is complete)
- **AND** an error is logged with the generation's shortId for review
