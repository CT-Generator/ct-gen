## ADDED Requirements

### Requirement: Authorship credits prominently displayed

The system SHALL display authorship credits — Maarten Boudry (Ghent University) and Marco Meyer (University of Hamburg) for ideas; Natasha Newbold and Mohammed Darras (TJI) for design and development of v1; Peter Keroti (TJI) for image generation; the Etienne Vermeersch Chair of Critical Thinking at Ghent University for funding — on a dedicated `/about` page AND in the site footer of every page. v2 contributors MAY be added; v1 contributors MUST NOT be removed or de-emphasized relative to v1's presentation.

#### Scenario: Footer audit on any page
- **WHEN** any non-modal page renders
- **THEN** the footer includes a compact credit block referencing the authors and funder with links to their public profiles
- **AND** the credit block links to the full `/about` page

#### Scenario: /about page detail
- **WHEN** a user visits `/about`
- **THEN** the page lists each contributor by name and role with their public profile link
- **AND** the page lists the funding source
- **AND** the page links to the academic paper and the Substack blog post that articulate the recipe

### Requirement: Visual identity v2

The application name SHALL remain "Conspiracy Generator". The system SHALL present a coherent v2 visual identity around that name: a logo mark, a primary type pairing (one display face, one body face), a primary color and a critical-thinking accent color, recipe-move iconography, and dark/light themes. The identity SHALL be applied consistently across home, selection, generation, permalink, quiz, teach, and about pages. The brand brief in `openspec/changes/v2-rebuild/brand-brief.md` SHALL be the source of truth provided to any design agency engaged to develop the visual direction.

#### Scenario: Theme toggle
- **WHEN** a user toggles between dark and light themes
- **THEN** every page renders correctly in both themes
- **AND** the chosen theme persists in local storage

#### Scenario: Brand consistency audit
- **WHEN** a reviewer browses home, selection, generation, permalink, quiz, teach, and about
- **THEN** all pages use the same primary type pairing, primary color, and logo mark
- **AND** the recipe-move iconography is consistent across selection, generation, and quiz contexts

### Requirement: Accessibility baseline

The system SHALL meet WCAG 2.1 AA for color contrast, keyboard navigation, and ARIA labeling on interactive elements. The recipe-tagged sections of a generated theory SHALL be navigable by screen reader as a labeled list of four moves followed by a labeled debunking section.

#### Scenario: Screen reader audit on a permalink
- **WHEN** a screen reader navigates a permalink page
- **THEN** the four recipe moves are announced with their human-readable labels
- **AND** the debunking section is announced with its label
- **AND** all interactive controls (share buttons, re-roll buttons, remix link) have ARIA-labeled affordances

#### Scenario: Keyboard-only navigation
- **WHEN** a user navigates the entire selection-flow → generation → permalink path with keyboard only
- **THEN** every control is reachable and activatable via keyboard
- **AND** focus indicators are visible at every step

### Requirement: Educational-purpose framing on every entry point

Every entry-point page (home, /quiz, /teach, /about, permalink) SHALL present a clear educational-purpose framing in the first viewport. Marketing copy that frames the app as a "fun way to make conspiracies" without the educational framing is NOT acceptable.

#### Scenario: First viewport audit on home
- **WHEN** a first-time visitor lands on `/`
- **THEN** within the first viewport (above the fold on a 768px-tall window), the educational purpose is stated explicitly
- **AND** the structurally-protected disclaimer pattern from `theory-generation` is NOT applicable here, but a comparable framing-as-education element is present

### Requirement: Disclaimer cannot be screenshotted-and-cropped trivially

The disclaimer banner on permalink pages (specified in `theory-generation`) SHALL be styled so that any horizontally-cropped screenshot of the four recipe moves still includes at least one disclaimer instance, AND any vertically-cropped screenshot still includes at least one disclaimer instance. Layout MUST place a disclaimer above the moves AND below them, with no scroll position rendering the moves without at least one disclaimer in view.

#### Scenario: Crop-resistance test
- **WHEN** a screenshot is taken of any visible portion of a permalink page that contains any recipe-move text
- **THEN** the same screenshot also includes at least one disclaimer instance
- **AND** this property holds at all viewport widths supported by the design system
