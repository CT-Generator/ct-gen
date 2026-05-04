## ADDED Requirements

### Requirement: Teacher route at /teach

The system SHALL provide a `/teach` route presenting a one-page resource set for educators: an introduction to the recipe, a downloadable lesson plan PDF, suggested classroom discussion prompts, and a "Start a classroom session" button.

#### Scenario: Educator visits /teach
- **WHEN** a user navigates to `/teach`
- **THEN** the page displays: a brief explanation of the recipe and the educational rationale, a "Download lesson plan (PDF)" link, a list of 5–10 discussion prompts for class use, and a "Start classroom session" CTA
- **AND** the credits and authorship are present on the same page

### Requirement: Downloadable lesson plan PDF

A pre-prepared lesson plan PDF SHALL be downloadable from `/teach`. The PDF is the only downloadable artifact in the application — it is metadata about the educational use, NOT a generated theory. Its contents are static and curated by the maintainers.

#### Scenario: Lesson plan PDF download
- **WHEN** a user clicks "Download lesson plan (PDF)" on `/teach`
- **THEN** a static PDF file authored by the maintainers is served
- **AND** no generated theory content is embedded in this PDF
- **AND** the PDF is stored as a static asset, not generated at request time

### Requirement: Classroom session mode

A "classroom session" mode SHALL be startable from `/teach`. When active, the session-bound flow SHALL disable all external sharing affordances (X/Bluesky/email/copy-link buttons hidden) in favor of a discussion-oriented layout that surfaces "discussion prompt" cards alongside generated theories.

#### Scenario: Educator starts a classroom session
- **WHEN** an educator clicks "Start classroom session" on `/teach`
- **THEN** the system creates a session-scoped flag and redirects to the home page
- **AND** while the flag is active, the share buttons described in `permalinks-and-sharing` are hidden on every page
- **AND** the recipe-tagged theory display includes side discussion-prompt cards: "Which move felt most convincing? Why?" / "What real evidence would falsify this?" / etc.
- **AND** the educator can end the session via a clearly visible "End classroom session" control in the header

### Requirement: Session-scoped, not user-scoped

Classroom session mode SHALL be a per-browser-session flag, not tied to user accounts or persistent state. Refreshing the browser preserves it; closing the browser ends it; no admin auth is required.

#### Scenario: Browser closes mid-session
- **WHEN** an educator closes the browser tab while classroom mode is active
- **AND** later opens a new tab to the same domain
- **THEN** classroom mode is NOT automatically active
- **AND** the educator can re-enable it from `/teach`
