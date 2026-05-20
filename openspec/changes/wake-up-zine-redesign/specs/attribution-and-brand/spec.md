## MODIFIED Requirements

### Requirement: Visual identity v2

The application name SHALL remain "Conspiracy Generator". The system SHALL present the **Wake Up Zine** visual identity: pulp-tabloid pastiche with `--paper: #f3e9c4` cream background overlaid with newsprint halftone + photocopy scan lines; `--ink: #181410` for primary type and rules; `--hot: #ff2e63` magenta and `--punch: #ffd400` electric yellow as the two punch colors; `--cool: #1d4d8a` as the secondary accent; a star-clipped magenta logo mark in the topbar; type pairing **Anton** (display) + **Space Grotesk** (body) + **Permanent Marker** (hand annotation); hard offset shadows (6px/8px/12px); fluid `clamp()` type scale across screen sizes; and a dark mode that inverts the palette (ink background, paper text) while preserving the punch colors. The identity SHALL be applied consistently across **all** routes — home, selection (story / culprit / motive), generation, permalink, recipe, teach, about, stats, imprint, and privacy pages. The detailed token list, primitive components, and animation contracts are specified in the `zine-design-system` capability.

#### Scenario: Theme toggle
- **WHEN** a user toggles between dark and light themes
- **THEN** every page renders correctly in both themes
- **AND** in dark mode the body background is `var(--ink)` and primary type is `var(--paper)` (an inverted-zine reading)
- **AND** the chosen theme persists in local storage

#### Scenario: Brand consistency audit
- **WHEN** a reviewer browses home, story, build, permalink (`/g/[id]`), recipe, teach, about, stats, imprint, and privacy
- **THEN** all pages use the Anton + Space Grotesk + Permanent Marker type pairing
- **AND** all pages use the zine palette (`--paper`, `--ink`, `--hot`, `--punch`, `--cool`)
- **AND** all pages render the sticky `<Topbar>` brand mark
- **AND** all pages share the halftone + scan-line page background

#### Scenario: A primitive renders consistently across routes
- **WHEN** a `<PulpCard>` appears on the home story picker AND on the recipe page's move tiles AND on the permalink's move grid
- **THEN** all three instances share `var(--rule)` border, `var(--shadow)` shadow, `var(--paper)` background, and the same hover behavior

### Requirement: Disclaimer cannot be screenshotted-and-cropped trivially

The disclaimer banner on permalink pages (specified in `theory-generation`) SHALL be styled so that any horizontally-cropped screenshot of the four recipe moves still includes at least one disclaimer instance, AND any vertically-cropped screenshot still includes at least one disclaimer instance. Under the Wake Up Zine identity, this requirement is satisfied by placing at least three disclaimer-strength elements on the permalink page: (a) a "100% fabricated" sticker above the move grid, (b) a "Generator output · session #… · do not share without context" label on the dark headline card (always-visible during scroll because the card is full-height left column), and (c) a "What you just learned" body block below the move grid. Layout MUST guarantee that no scroll position renders the moves without at least one disclaimer element in view, at all viewport widths supported by the design system.

#### Scenario: Crop-resistance test
- **WHEN** a screenshot is taken of any visible portion of a permalink page that contains any recipe-move text
- **THEN** the same screenshot also includes at least one disclaimer instance (the sticker above, the headline-card caption, or the below-grid body block)
- **AND** this property holds at viewport widths 360px, 768px, and 1280px

#### Scenario: Mobile stack preserves the property
- **WHEN** the permalink renders at 360px (move cards stacked below the headline card)
- **THEN** the "100% fabricated" sticker is rendered above the first move card
- **AND** the "What you just learned" block is rendered below the last move card
- **AND** any single-viewport screenshot contains at least one of these
