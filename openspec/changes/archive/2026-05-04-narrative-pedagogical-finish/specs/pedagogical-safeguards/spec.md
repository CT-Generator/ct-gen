## ADDED Requirements

### Requirement: Crop-resistant fake/educational stamp on the narrative section

The narrative section on `/g/[id]` (when `recipeContent.narrative.paragraphs` is set) SHALL display a small monospace caps stamp inside the same DOM container that holds the narrative paragraphs. The stamp text MUST name the artefact as a fake theory built from the recipe (EN: `FAKE THEORY · BUILT FROM A RECIPE`; DE: `ERFUNDENE THEORIE · NACH REZEPT GEBAUT`). The stamp MUST be small enough not to compete with the narrative body, and MUST be a neutral ink-soft tone (NOT a move accent, since the narrative integrates all four moves). The stamp MUST sit such that any horizontal screenshot containing any sentence of any narrative paragraph also contains the stamp.

#### Scenario: Stamp present on every narrative
- **WHEN** a visitor opens `/g/[id]` for a generation whose `recipeContent.narrative.paragraphs` is set
- **THEN** the page contains exactly one stamp inside the narrative section
- **AND** the stamp text matches the locale-appropriate `FAKE THEORY · BUILT FROM A RECIPE` (or DE equivalent)
- **AND** the stamp is rendered in a neutral tone (no move-accent color)

#### Scenario: Crop-resistance for the narrative
- **WHEN** a screenshot is taken that contains any sentence of any narrative paragraph
- **THEN** the same screenshot also contains the narrative stamp
- **AND** this property holds at viewport widths from 320px to 1440px

#### Scenario: Older rows without narrative
- **WHEN** the page renders a generation whose `recipeContent.narrative` is undefined
- **THEN** no narrative stamp is rendered (there is no narrative section to stamp)
- **AND** the existing per-move stamps continue to render unchanged
