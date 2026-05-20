## MODIFIED Requirements

### Requirement: Curated seed set

The system SHALL provide a curated seed set of news stories, culprits, and motives, each with a name, summary, and image. The seed set MUST be available without authentication and MUST be the default selection mode when a user begins a flow. Under the Wake Up Zine identity, each curated item SHALL be presented as a `<PulpCard>` (tilted, hard-shadow, hover-lift-with-colorshift) with a `<HoverMark>` annotation overlay (one of: "PROOF???", "WAIT...", "COINCIDENCE?", "SUSPICIOUS!", "CONNECTED!", "GOTCHA") that fades in on hover. Story cards MUST retain the existing real-news image and source-host meta line. Picker grids MUST be 3 columns above 900px, 2 columns from 640–900px, and 1 column below 640px.

#### Scenario: User picks from the curated set
- **WHEN** a user starts a new generation flow
- **THEN** the news selection screen presents a sample of curated news items, each rendered as a `<PulpCard>` containing a story image, source-host meta line, headline (Anton display), and summary
- **AND** each card has a randomly-assigned tilt angle from a fixed set (`[-1.4, 0.6, -0.6, 1.2, -1.0, 0.8]` degrees) and a randomly-assigned hover annotation
- **AND** the user can request a fresh sample without consuming a generation credit
- **AND** the same `<PulpCard>` + `<HoverMark>` pattern applies to culprit selection and motive selection on subsequent steps

#### Scenario: Hover annotation reveals a handwritten note
- **WHEN** a desktop user hovers a curated picker card
- **THEN** the dashed red pencil-circle (`<HoverMark>` SVG) and its handwritten note fade in within `var(--t-base)` duration
- **AND** the card's background animates to `var(--punch)` electric yellow

#### Scenario: Picker step header uses sticker + scream
- **WHEN** the news / culprit / motive picker page renders
- **THEN** a "Step 1 of 3" / "Step 2 of 3" / "Step 3 of 3" `<Sticker>` is rendered above the headline
- **AND** if the user has already picked a story, a secondary yellow `<Sticker>` showing "File open: {story headline}" is rendered next to the step sticker on the culprit and motive steps
- **AND** the page H2 is rendered in Anton display font at `var(--t-scream-md)`

#### Scenario: Mobile picker collapses to a single column
- **WHEN** the news picker renders at viewport width 360px
- **THEN** the picker grid uses 1 column
- **AND** each card has `--tilt: 0deg` (no rotation)
- **AND** the hover-lift transform is suppressed
