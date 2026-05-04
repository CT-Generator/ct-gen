# conspiracy-narrative Specification

## Purpose
TBD - created by archiving change narrative-finale-and-yolo-mode. Update Purpose after archive.
## Requirements
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

The `/g/[id]` page SHALL render the persisted narrative as a distinct section, framed as the finished theory, positioned after the page lede (culprit/event/motive heading and the original-story source link) and before the four per-move stamped blocks. The per-move stamped blocks (paragraph + debunk + tell-stamp) MUST remain on the page; the narrative does not replace them. When narrative is present, the page MUST NOT render the legacy italic conspiracist_intro paragraph (it is functionally redundant with the narrative). When narrative is present and the row has an original-story URL, the source link MUST instead be rendered as its own meta line below the h1, using the existing source-label translation key.

#### Scenario: Narrative present and well-placed
- **WHEN** a visitor opens `/g/[id]` for a generation whose `recipeContent.narrative.paragraphs` is set
- **THEN** the page contains a section rendering each of the three narrative paragraphs in order
- **AND** the section sits between the lede area and the first per-move block
- **AND** all four per-move stamped blocks (with their tells and debunks) still render below

#### Scenario: Conspiracist_intro is hidden when narrative is present
- **WHEN** a visitor opens `/g/[id]` for a generation whose `recipeContent.narrative.paragraphs` is set AND `recipeContent.conspiracist_intro` is also set
- **THEN** the page does NOT render the italic conspiracist_intro paragraph
- **AND** if the row has an original-story URL, that URL is rendered as a meta line below the h1 (separate from any narrative or breakdown copy)

#### Scenario: Conspiracist_intro renders on older rows without narrative
- **WHEN** a visitor opens `/g/[id]` for a generation whose `recipeContent.narrative` is undefined AND `recipeContent.conspiracist_intro` is set
- **THEN** the page renders the italic conspiracist_intro paragraph as it did before this change

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

### Requirement: Narrative section displays a moves legend that names the four moves

Directly below the narrative paragraphs (and inside or adjacent to the same section container that holds them), the page SHALL render a single line that names the four moves of the recipe (anomaly, connection, dismiss, discredit). Each move's name MUST be rendered in that move's accent color, in the same `font-mono uppercase` treatment used by the existing per-move stamps. Each move title MUST be prefixed by its move number (`01`, `02`, `03`, `04`) in the same accent color, matching the `MOVE NN` format used by the per-move stamped blocks. The legend MUST NOT include a "Built from:" prefix (the section heading "The theory" already provides the framing). Each move title MUST be wrapped in a link to the recipe page (`/recipe`, locale-aware) so a reader can click through to learn what the move means. The legend MUST be locale-aware (move names from the locale-resolved `getMoves(locale)` source) and MUST only render when `recipeContent.narrative.paragraphs` is set.

#### Scenario: Legend renders with numbered, linked move titles
- **WHEN** a visitor opens `/g/[id]` for a generation whose `recipeContent.narrative.paragraphs` is set
- **THEN** a single legend line appears directly below the narrative paragraphs
- **AND** the legend renders four move entries in the format `NN <TITLE>` (e.g. `01 HUNT ANOMALIES`)
- **AND** each entry is rendered in its move's accent color
- **AND** each move title is wrapped in an anchor link pointing to `/recipe` (or `/de/recipe` / `/nl/recipe` for those locales)
- **AND** the legend does NOT include a "Built from:" prefix

#### Scenario: Legend absent on older rows
- **WHEN** the page renders a generation whose `recipeContent.narrative` is undefined
- **THEN** no moves legend renders

#### Scenario: Move titles match locale source
- **WHEN** the legend renders for a `de` row
- **THEN** the move titles are the German titles from `getMoves('de')` (e.g. `AUFFÄLLIGKEITEN SUCHEN`)

### Requirement: "See how the trick was built" CTA appears at the end of the narrative section

When the narrative is present, the page SHALL render a localized scroll-to-breakdown CTA at the end of the narrative section, before the breakdown eyebrow. The CTA MUST be a focusable, keyboard-accessible affordance (an anchor link or button) that brings the visitor to the breakdown section. The breakdown eyebrow MUST carry the corresponding anchor target.

#### Scenario: CTA renders when narrative is present
- **WHEN** a visitor opens `/g/[id]` for a generation whose `recipeContent.narrative.paragraphs` is set
- **THEN** a CTA reading "See how the trick was built" (or DE equivalent) renders at the end of the narrative section
- **AND** activating the CTA brings the visitor to the breakdown section's eyebrow

#### Scenario: CTA absent when narrative is absent
- **WHEN** the page renders a generation whose `recipeContent.narrative` is undefined
- **THEN** the CTA does not render

#### Scenario: CTA is keyboard-accessible
- **WHEN** a keyboard user tabs to the CTA and activates it
- **THEN** focus moves to (or lands at) the breakdown eyebrow

### Requirement: Breakdown section carries an explainer line when the narrative is present

When the narrative is rendered above the per-move blocks, the breakdown section SHALL render — directly below the existing breakdown eyebrow — a single localized sentence that names the relationship between the narrative and the per-move blocks. The sentence MUST make clear that each per-move block deconstructs one move that was used to build the narrative above. The explainer MUST only render when the narrative is present (older rows without a narrative do not get the new line).

#### Scenario: Explainer present when narrative is present
- **WHEN** a visitor opens `/g/[id]` for a generation whose `recipeContent.narrative.paragraphs` is set
- **THEN** the breakdown section contains, directly below the eyebrow, a single sentence explainer
- **AND** the sentence text is locale-appropriate

#### Scenario: Explainer absent when narrative is absent
- **WHEN** the page renders a generation whose `recipeContent.narrative` is undefined
- **THEN** the breakdown section renders as it did before this requirement (eyebrow not rendered, no explainer)

