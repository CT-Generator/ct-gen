## ADDED Requirements

### Requirement: Narrative section displays a moves legend that names the four moves

Directly below the narrative paragraphs (and inside or adjacent to the same section container that holds them), the page SHALL render a single line that names the four moves of the recipe (anomaly, connection, dismiss, discredit). Each move's name MUST be rendered in that move's accent color, in the same `font-mono uppercase` treatment used by the existing per-move stamps. The legend MUST be locale-aware (move names from the locale-resolved `getMoves(locale)` source) and MUST only render when `recipeContent.narrative.paragraphs` is set.

#### Scenario: Legend present below the narrative
- **WHEN** a visitor opens `/g/[id]` for a generation whose `recipeContent.narrative.paragraphs` is set
- **THEN** a single legend line appears directly below the narrative paragraphs
- **AND** the legend names the four moves (anomaly, connection, dismiss, discredit) in their accent colors
- **AND** the move names match the locale-resolved titles from `getMoves(locale)`

#### Scenario: Legend absent on older rows
- **WHEN** the page renders a generation whose `recipeContent.narrative` is undefined
- **THEN** no moves legend renders

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
