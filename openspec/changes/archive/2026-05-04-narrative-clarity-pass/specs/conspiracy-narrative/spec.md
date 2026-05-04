## MODIFIED Requirements

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
