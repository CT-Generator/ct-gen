## ADDED Requirements

### Requirement: Crop-resistant move-tell stamp on every theory paragraph

Every move's theory paragraph on `/g/[id]` SHALL display a small monospace caps stamp in the bottom-right corner naming the move number and its tell (e.g. `MOVE 03 · UNFALSIFIABLE`). The stamp MUST sit inside the same DOM container as the theory text so a horizontal screenshot of any portion of the theory captures the stamp. The stamp MUST be visually present in the move's accent color but small enough not to compete with the section heading at the top of the move.

#### Scenario: Stamp present on every move
- **WHEN** any `/g/[id]` page renders a recipe-tagged generation (per_move shape)
- **THEN** the page contains four stamps — one per move
- **AND** each stamp text matches `MOVE NN · <TELL>` where `<TELL>` is the canonical tell phrase for that move (`BASE RATES`, `SIX DEGREES`, `UNFALSIFIABLE`, `AD HOMINEM`)

#### Scenario: Crop-resistance
- **WHEN** a screenshot is taken that contains any sentence of any move's theory paragraph
- **THEN** the same screenshot also contains the move's stamp
- **AND** this property holds at viewport widths from 320px to 1440px

#### Scenario: Legacy migrated rows
- **WHEN** the page renders a legacy v1-migrated row (the `legacy_text` shape)
- **THEN** no per-move stamps render (there are no per-move sections to stamp)
- **AND** the legacy disclaimer note above the legacy text remains as-is

### Requirement: Form-vs-substance caveat on /recipe

The `/recipe` page SHALL include, between the page lede and the four-move definitions, a single 60–90 word paragraph that explicitly names the failure mode of treating recipe-recognition as refutation. The paragraph MUST state that real critics of real institutions sometimes use these moves with substance behind them, and that the recipe trains pattern recognition, not refutation.

#### Scenario: Caveat present and well-placed
- **WHEN** a reader visits `/recipe`
- **THEN** the page contains a paragraph (60–90 words) that uses both the words "form" and "substance" (or close synonyms)
- **AND** the paragraph appears AFTER the page lede ("Conspiracy theories follow four moves") and BEFORE the first move heading ("Hunt anomalies")
- **AND** the paragraph names the recipe as for noticing-not-arguing in plain terms

### Requirement: Move 04 debunk ends with a single short tell sentence

The system prompt for the `discredit` move's section generation SHALL require the debunk to end with a single 4–8 word sentence whose only content is the move's tell (e.g. `Ad hominem.`). Other moves' prompts SHALL not be modified.

#### Scenario: Discredit debunk ends crisply
- **WHEN** a fresh `/api/build/[id]/discredit/section` POST returns
- **THEN** the `debunk` field's last sentence is 4–8 words long
- **AND** that last sentence names the move's tell (variants of "ad hominem" or "attacking the messenger")
- **AND** the last sentence stands alone — it is not a clause appended to a longer sentence

### Requirement: Conspiracist-voice openers vary across moves

The section-generation prompt SHALL include a constraint that consecutive moves in the same build MUST NOT start with the same imperative pointer (e.g. multiple "Look at...", "Look closer...", "Look closely..." openers in adjacent paragraphs). The user-message context for each section call SHALL include, when prior moves exist, the first 3-word opener of each prior move so the model can avoid repeating it.

#### Scenario: No two consecutive moves repeat an imperative opener
- **WHEN** a fresh build of all four moves runs end-to-end
- **THEN** no two adjacent paragraphs (move N and move N+1) start with identical 3-word imperatives
- **AND** the constraint is informed by passing prior-opener context to the prompt, not by post-hoc filtering

### Requirement: Strongest /about line lifted into the home hero

The home page (`/`) SHALL include, immediately under the H1 ("Build a conspiracy theory from scratch."), a single-sentence subheading: *"The best way to learn to spot a conspiracy theory is to make one yourself."* The existing description paragraph below the subheading remains.

#### Scenario: Hero structure
- **WHEN** a reader visits `/`
- **THEN** the H1 is followed (within the same hero block) by the exact subheading sentence above
- **AND** the existing description paragraph ("Pick a real news story…") still appears below the subheading

### Requirement: Academic-paper link surfaced on /recipe

The `/recipe` page lede SHALL link to the academic paper (https://drive.google.com/file/d/1GMDVLdKfvaFnj8IFDyiRTGH3ePsOO9B7/views) alongside the existing Substack link. Both links MUST be present; the Substack reference MUST NOT be removed.

#### Scenario: Paper link present
- **WHEN** a reader visits `/recipe`
- **THEN** the page contains both an `<a href="…substack…">` and an `<a href="…drive.google.com…">` link in the lede area

## REMOVED Requirements

### Requirement: Five-question real-or-fake quiz
**Reason:** The /quiz route was orphaned (unlinked from nav) for the v2 launch and has remained dead code since. The earlier `quiz-mode` capability requirements (introduced under the v2-rebuild change) are removed; the route, components, and curated real-conspiracy data file are deleted. If a quiz returns later it will be a deliberate new feature.

**Migration:** No user-facing migration. The /quiz URL returns 404 going forward. The curated real-conspiracy summaries (Watergate, COINTELPRO, Iran-Contra, Tuskegee, MK-ULTRA) lived only in `web/data/real-conspiracies.json` and are removed with the rest of the quiz code; if needed for a future feature, they can be re-curated then.

### Requirement: Curated, conservative real-conspiracy set
**Reason:** Same as above — the /quiz feature was orphaned and is being deleted in this change.

**Migration:** None.

### Requirement: Fake quiz items are condensed and labeled-as-fake post-hoc
**Reason:** Same — the quiz is being deleted.

**Migration:** None.

### Requirement: Post-quiz reflection
**Reason:** Same.

**Migration:** None.

### Requirement: Quiz results are not shareable as artifacts
**Reason:** Same.

**Migration:** None.
