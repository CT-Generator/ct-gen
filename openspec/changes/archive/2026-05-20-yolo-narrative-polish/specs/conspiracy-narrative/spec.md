## MODIFIED Requirements

### Requirement: Three-paragraph narrative is generated and persisted with every new generation

When a recipe-tagged generation reaches a state where all four moves' `paragraph` outputs exist, the system SHALL generate an integrated conspiracy-theory narrative as a sequence of four paragraphs — paragraph 1 is a brief news-event framing (50–80 words) written in neutral journalistic register that names the actual news event and ends on a hook into the conspiracy reframing; paragraphs 2–4 are the conspiracy theory itself (80–140 words each), integrating the four moves into one continuous arc with conspiracist-voice flair. The narrative MUST be persisted on the generation row at `recipeContent.narrative.paragraphs` (length 4). Generation MUST complete server-side before the route that finalised the build returns its response, so a subsequent GET of `/g/[id]` reads the narrative without further model calls. The narrative MUST NOT be a concatenation, header, or bullet list of the per-move paragraphs.

#### Scenario: Stepwise build finishes with narrative populated
- **WHEN** a stepwise build's `POST /api/build/[id]/discredit/section` succeeds and `per_move` now contains all four moves
- **THEN** the same route call generates a narrative and persists it to `recipeContent.narrative.paragraphs` (length 4) before returning
- **AND** the persisted `narrative.generated_at` is an ISO timestamp set at generation time

#### Scenario: Yolo build finishes with narrative populated
- **WHEN** `POST /api/build/[id]/yolo` resolves successfully
- **THEN** the row's `recipeContent.narrative.paragraphs` has length 4
- **AND** the response is sent only after the narrative has been persisted

#### Scenario: News-framing opens the narrative
- **WHEN** the narrative finale is generated for any locale
- **THEN** paragraph 1 references the actual news event by name (the `eventName` input)
- **AND** paragraph 1 is written in neutral journalistic register, NOT in the conspiracist voice
- **AND** paragraph 1 ends with a transitional hook into the conspiracy reframing (e.g., "…or so the official story goes." in EN, locale-appropriate equivalents in DE/NL)
- **AND** paragraph 1 is between 50 and 80 words inclusive

#### Scenario: Narrative integrates the four moves
- **WHEN** the narrative-generation prompt receives the four `paragraph` outputs, the event/culprit/motive triple, and the locale
- **THEN** paragraphs 2–4 reference the specific anomaly, connection, dismissal, and discrediting claims from the input paragraphs
- **AND** paragraphs 2–4 are plain prose (no headings, bullets, or move labels)
- **AND** the narrative does NOT include the per-move debunks
- **AND** each of paragraphs 2–4 is between 80 and 140 words inclusive

#### Scenario: Narrative reads as a coherent standalone story
- **WHEN** a reader reads `narrative.paragraphs` end-to-end without seeing the per-move blocks below
- **THEN** the four paragraphs form a single narrative arc — news framing into conspiracy reveal into specifics into discrediting move
- **AND** the prose does NOT meta-describe the moves (e.g., does NOT contain phrases like "imagine that…", "suppose that…", "would be…", "is allegedly…" used in the hedging sense that turns the claim hypothetical)

### Requirement: Result page renders the narrative above the per-move blocks

The `/g/[id]` page SHALL render the persisted narrative as a distinct section, framed as the finished theory, positioned after the page lede (culprit/event/motive heading and the original-story source link) and before the four per-move stamped blocks. The reader MUST render each paragraph in `narrative.paragraphs` in order regardless of array length — both 3-paragraph rows (pre-this-change) and 4-paragraph rows (post-this-change) render correctly. The per-move stamped blocks (paragraph + debunk + tell-stamp) MUST remain on the page; the narrative does not replace them. When narrative is present, the page MUST NOT render the legacy italic conspiracist_intro paragraph (it is functionally redundant with the narrative). When narrative is present and the row has an original-story URL, the source link MUST instead be rendered as its own meta line below the h1, using the existing source-label translation key.

#### Scenario: Narrative present and well-placed
- **WHEN** a visitor opens `/g/[id]` for a generation whose `recipeContent.narrative.paragraphs` is set
- **THEN** the page contains a section rendering each narrative paragraph in order (regardless of whether `paragraphs.length` is 3 or 4)
- **AND** the section sits between the lede area and the first per-move block
- **AND** all four per-move stamped blocks (with their tells and debunks) still render below

#### Scenario: Older 3-paragraph rows still render
- **WHEN** a visitor opens `/g/[id]` for a row whose `recipeContent.narrative.paragraphs.length` is 3
- **THEN** the page renders all three paragraphs in order
- **AND** no empty paragraph block or placeholder is shown

#### Scenario: New 4-paragraph rows render the news-framing first
- **WHEN** a visitor opens `/g/[id]` for a row whose `recipeContent.narrative.paragraphs.length` is 4
- **THEN** the page renders paragraph 1 (news framing) first, then paragraphs 2–4 (conspiracy) in order
- **AND** all four paragraphs use the same narrative styling and stamp treatment

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
