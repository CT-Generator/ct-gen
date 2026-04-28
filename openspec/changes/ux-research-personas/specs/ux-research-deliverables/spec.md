## ADDED Requirements

### Requirement: Persona briefs are specific, not generic

Each persona file SHALL be a self-contained markdown document that names a specific person — a fictional individual with a real-feeling biography — drawn from one of the three audience tiers in the brand brief (curious general public, educator, researcher). The brief MUST include: name, age, role, location, English fluency, prior exposure to conspiracy-theory discourse, motivation for visiting the site today, what they expect to find before they click.

#### Scenario: A persona file is read in isolation
- **WHEN** a maintainer opens any one of the three persona files without having read the others
- **THEN** the maintainer can describe in their own words who this person is and why they're on the site
- **AND** the brief reads as a one-paragraph profile, not a bulleted spec sheet
- **AND** the three personas are distinguishable from one another in cognitive frame and motivation

### Requirement: Walkthroughs are real interactions with the live site

Each persona walkthrough SHALL be an annotated transcript of a real interaction with `https://conspiracy-generator.duckdns.org/` — not a hypothesized one. The persona must hit `/`, navigate to `/story/<uuid>`, choose conspirators, traverse all four move screens of `/build/<id>`, and view `/g/<id>`. At each step the document records what the persona sees on screen and the persona's reaction in their voice.

#### Scenario: Walkthrough has real generation IDs and real model output
- **WHEN** a maintainer reviews a persona walkthrough
- **THEN** the walkthrough cites a specific `/g/<short-id>` permalink that exists in the production database
- **AND** the persona's reactions reference specific words or phrases that appear in the actual generated paragraphs

### Requirement: Each walkthrough ends with a "what did you learn" reflection

Each persona walkthrough SHALL conclude with a 80–150-word reflection answering "In your own words, what did this teach you, if anything?" — written in the persona's voice, not in a researcher's voice. The reflection MUST surface what the persona believes they take away, including admitting confusion or non-learning if that's the honest answer.

#### Scenario: Reflection is in-character
- **WHEN** a maintainer reads the closing reflection
- **THEN** the reflection sounds like the persona described in the brief (vocabulary, level of certainty, level of skepticism)
- **AND** it is NOT a summary of the four moves; it is a personal account of what stuck

### Requirement: Synthesis report has a pedagogical-effect section

The synthesis report SHALL include a 300–500-word essay-form section titled "Pedagogical effect" that names — based on the three walkthroughs — whether the four-move recipe lands as a teaching device, where the lesson succeeds, and where it slides off. The section MUST distinguish observations all three personas share (strong signal) from observations only one persona surfaces (weak signal).

#### Scenario: The pedagogical section is honest about failure modes
- **WHEN** a maintainer reads the pedagogical-effect section
- **THEN** the section explicitly names at least one place where the lesson does NOT land for at least one persona
- **AND** the section does not conclude that the design is universally successful unless all three walkthroughs support that

### Requirement: Synthesis report has a prioritized change list

The synthesis report SHALL include a ranked table of UX/copy/flow change suggestions with columns: ordinal `#`, `Issue`, `Where` (route or component), `Severity` (high / medium / low), `Effort` (S / M / L), `Notes` (which persona surfaced it; suggested fix or further investigation). Items SHALL be sorted by descending severity, then by ascending effort, so the top of the list is the highest-impact fastest-wins.

#### Scenario: The list is actionable
- **WHEN** a maintainer reads the prioritized list
- **THEN** each row names a concrete issue tied to a specific route or component
- **AND** each row's Notes column either suggests a fix OR identifies what the maintainer would need to investigate before fixing
- **AND** rows are ranked, not arbitrarily ordered

### Requirement: Files land in the documented location on disk

The four output documents — three persona walkthroughs and one synthesis report — SHALL be saved to `docs/ux-research/2026-04/` as plain markdown:
- `docs/ux-research/2026-04/persona-1.md`
- `docs/ux-research/2026-04/persona-2.md`
- `docs/ux-research/2026-04/persona-3.md`
- `docs/ux-research/2026-04/report.md`

The report SHALL link to each persona file by relative path so a reader of `report.md` can click through.

#### Scenario: A maintainer follows the report links
- **WHEN** a maintainer opens `report.md` and clicks a link to `persona-1.md`
- **THEN** the linked file resolves on disk and contains the full walkthrough

### Requirement: Walkthroughs do not pollute production /stats with synthetic ratings

The persona walkthroughs SHALL NOT POST to `/api/rate` during the test. Generations that the personas create are real and stay in the database; ratings would skew the `/stats` rating-distribution histogram with synthetic feedback.

#### Scenario: Stats unchanged after the run
- **WHEN** the maintainer compares `/stats` totals before and after the three walkthroughs
- **THEN** the `Ratings` tile and the rating-distribution histogram values are identical
- **AND** the `Built on v2` tile has increased by approximately three (one per persona)
