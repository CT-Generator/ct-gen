## MODIFIED Requirements

### Requirement: Conspirators picker exposes a yolo CTA alongside the walkthrough CTA

The `/story/[uuid]` page (the conspirators picker) SHALL show two CTAs once a culprit and a motive are selected: the existing primary CTA that starts the stepwise build, and a secondary "yolo" CTA that triggers the one-click build. The yolo CTA MUST be rendered as a proper button (not an underline text link), positioned in the same horizontal row as the primary CTA on viewport widths ≥ 640px, and visually subordinate to the primary (e.g., outlined / muted-fill style versus the primary's filled style). On viewport widths < 640px the two buttons stack vertically; the primary button MUST appear ABOVE the secondary button in the stack (matching DOM order: primary first, secondary second). The yolo CTA MUST be reachable in the same view (no extra navigation or modal). Both CTAs MUST be localized for `en`, `de`, and `nl`. The yolo CTA copy MUST name the WALKTHROUGH being skipped (the sequence of stepwise screens) without invoking moralized "lesson" framing — i.e., the copy MUST tell the user what UI flow they are bypassing, not characterize the educational value being forgone.

#### Scenario: Both CTAs are present after selection
- **WHEN** a visitor on `/story/[uuid]` has selected a culprit and a motive
- **THEN** the page shows the primary "walk me through it" CTA (current behavior)
- **AND** the page shows a secondary "yolo" CTA in the same horizontal row as the primary on viewport widths ≥ 640px
- **AND** both CTAs are enabled

#### Scenario: Mobile primary-first stacking
- **WHEN** the picker renders at a viewport width below 640px
- **THEN** the primary CTA is the topmost button in the vertical stack
- **AND** the secondary yolo CTA appears directly below the primary
- **AND** DOM order matches visual order (primary before secondary)

#### Scenario: Yolo CTA is rendered as a button, not a link
- **WHEN** the picker renders with both CTAs visible
- **THEN** the yolo CTA's element is a `<button>` (or button-styled affordance) with a visible border or background distinguishing it from a plain text link
- **AND** the primary CTA remains visually dominant (e.g., filled vs. outlined)

#### Scenario: Yolo CTA copy names the walkthrough, not the lesson
- **WHEN** the picker renders the yolo CTA in `en`
- **THEN** the CTA copy explicitly references skipping the WALKTHROUGH (the UI flow), e.g. `Skip the walkthrough — show me the theory →`
- **AND** the copy does NOT use the word "lesson" or other moralizing framings
- **AND** the German variant names the same trade-off (e.g. `Den geführten Weg überspringen — nur die Theorie zeigen →`)
- **AND** the Dutch variant names the same trade-off (e.g. `Sla de uitleg over — toon me de theorie →`)

#### Scenario: CTAs are disabled when selection incomplete
- **WHEN** a visitor has not selected both a culprit and a motive
- **THEN** both CTAs are disabled

#### Scenario: All locales present
- **WHEN** the picker renders on `/de/story/[uuid]` or `/nl/story/[uuid]`
- **THEN** the yolo CTA copy is in the page's locale
- **AND** the walkthrough CTA copy is in the page's locale
