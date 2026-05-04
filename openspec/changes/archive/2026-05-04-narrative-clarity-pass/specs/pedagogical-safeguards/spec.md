## MODIFIED Requirements

### Requirement: Crop-resistant fake/educational stamp on the narrative section

The narrative section on `/g/[id]` (when `recipeContent.narrative.paragraphs` is set) SHALL display one fake/educational stamp PER NARRATIVE PARAGRAPH, each anchored inside the same DOM container as its paragraph (a `position: relative` wrapper around each paragraph). The stamp text MUST name the artefact as a fake theory built from the recipe (EN: `FAKE THEORY · BUILT FROM A RECIPE`; DE: `ERFUNDENE THEORIE · NACH REZEPT GEBAUT`; NL: `VERZONNEN THEORIE · GEBOUWD VOLGENS EEN RECEPT`). The stamp MUST be visually present — small caps mono with a soft-tint background — but MUST NOT compete with the narrative body. The stamp MUST be a neutral ink-soft tone (NOT a move accent). For every narrative paragraph, any horizontal screenshot of that paragraph MUST also contain the stamp belonging to that paragraph (this property holds at viewport widths from 320px to 1440px).

#### Scenario: One stamp per narrative paragraph
- **WHEN** a visitor opens `/g/[id]` for a generation whose `recipeContent.narrative.paragraphs` is set (length 3)
- **THEN** the page contains three stamps inside the narrative section — one per paragraph
- **AND** every stamp's text matches the locale-appropriate `FAKE THEORY · BUILT FROM A RECIPE` (or DE / NL equivalent)
- **AND** every stamp is rendered in a neutral tone (no move-accent color)
- **AND** every stamp has a soft-tint background (not text-only)

#### Scenario: Per-paragraph crop-resistance
- **WHEN** a horizontal screenshot is taken that contains any sentence of narrative paragraph N (for N in {1, 2, 3})
- **THEN** the same screenshot also contains paragraph N's stamp
- **AND** this property holds at viewport widths from 320px to 1440px

#### Scenario: Older rows without narrative
- **WHEN** the page renders a generation whose `recipeContent.narrative` is undefined
- **THEN** no narrative stamp is rendered (there is no narrative section to stamp)
- **AND** the existing per-move stamps continue to render unchanged
