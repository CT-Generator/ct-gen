## ADDED Requirements

### Requirement: Curated seed set

The system SHALL provide a curated seed set of news stories, culprits, and motives, each with a name, summary, and image. The seed set MUST be available without authentication and MUST be the default selection mode when a user begins a flow.

#### Scenario: User picks from the curated set
- **WHEN** a user starts a new generation flow
- **THEN** the news selection screen presents a sample of curated news items, each with a name, summary, and image
- **AND** the user can request a fresh sample without consuming a generation credit
- **AND** the same pattern applies to culprit selection and motive selection on subsequent steps

### Requirement: Custom typed input alongside curated picks

For each of the three input dimensions (news, culprit, motive), the system SHALL offer a clearly-labeled "or type your own" option that accepts free-text input. Custom inputs MUST run through moderation gating before being accepted into the flow.

#### Scenario: User types a custom culprit
- **WHEN** a user clicks "or type your own" on the culprit step and submits free text
- **THEN** the input runs through the moderation pipeline (see Pedagogical moderation rejection requirement)
- **AND** if accepted, the custom value is recorded as the culprit for the current generation with `source='custom'`
- **AND** if rejected, the user sees a pedagogical rejection message (see below) and the flow remains on the culprit step

### Requirement: Pedagogical moderation rejection

When a custom input is rejected by moderation, the rejection message SHALL explain *why* in pedagogical terms — naming the recipe move that the input would weaponize and suggesting a category-level alternative. Generic "blocked by content filter" messages are NOT acceptable.

#### Scenario: User types a private individual's name as a culprit
- **WHEN** a user submits "[neighbor's full name]" as a custom culprit
- **THEN** the moderation pass identifies this as targeting a non-public individual
- **AND** the rejection message explains: targeting a real private individual is the move that turns the recipe from satire into harm; suggests instead a public institution or power structure category
- **AND** offers a "request review" link that opens a contact mailto with the input pre-filled

#### Scenario: User types a vulnerable-group reference as a culprit
- **WHEN** a user submits a culprit string identified by moderation as referring to a vulnerable group (ethnic, religious, sexuality-based, age-based)
- **THEN** the rejection message explains why this category is excluded (the recipe relies on power asymmetry; targeting a less-powerful group inverts the satire)
- **AND** suggests a power-structure alternative
- **AND** offers the same "request review" path

### Requirement: Selection persistence across the flow

The user's selections (curated or custom) SHALL persist across the three input steps within a session and SHALL remain editable until generation begins. Going "back" MUST NOT discard the current selection on later steps unless the user explicitly clears it.

#### Scenario: User edits a previous step
- **WHEN** a user has reached step 3 (motive) with selections for news and culprit, then navigates back to step 1
- **THEN** the previous news selection is highlighted as the current pick
- **AND** the culprit and motive selections from later steps remain in session state
- **AND** changing the news selection does NOT automatically discard the culprit/motive selections

### Requirement: Visible selection summary before generation

Before the model is called, the system SHALL show a confirmation summary of the three selections (news, culprit, motive) with each labeled by source (`curated` vs `custom`) and SHALL require the user to actively confirm before consuming a generation.

#### Scenario: User reviews and confirms
- **WHEN** a user finishes the three selection steps
- **THEN** a summary card displays the three selections with source labels
- **AND** a "Generate theory" button initiates the model call only after explicit user click
- **AND** an "Edit selections" affordance returns the user to any step without losing state
