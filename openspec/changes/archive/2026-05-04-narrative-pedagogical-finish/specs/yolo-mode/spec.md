## MODIFIED Requirements

### Requirement: Conspirators picker exposes a yolo CTA alongside the walkthrough CTA

The `/story/[uuid]` page (the conspirators picker) SHALL show two CTAs once a culprit and a motive are selected: the existing primary CTA that starts the stepwise build, and a secondary "yolo" CTA that triggers the one-click build. The yolo CTA MUST be rendered as a proper button (not an underline text link), positioned in the same horizontal row as the primary CTA, and visually subordinate to the primary (e.g., outlined / muted-fill style versus the primary's filled style). The yolo CTA MUST be reachable in the same view (no extra navigation or modal). Both CTAs MUST be localized for `en` and `de`. The yolo CTA copy MUST name what is being skipped — i.e., it MUST reference the lesson / walkthrough being bypassed, so a visitor knows they are opting out of the educational layer (EN: e.g., "Skip the lesson — show me the theory →"; DE: e.g., "Lektion überspringen — nur die Theorie zeigen →").

#### Scenario: Both CTAs are present after selection
- **WHEN** a visitor on `/story/[uuid]` has selected a culprit and a motive
- **THEN** the page shows the primary "walk me through it" CTA (current behavior)
- **AND** the page shows a secondary "yolo" CTA in the same horizontal row as the primary
- **AND** both CTAs are enabled

#### Scenario: Yolo CTA is rendered as a button, not a link
- **WHEN** the picker renders with both CTAs visible
- **THEN** the yolo CTA's element is a `<button>` (or button-styled affordance) with a visible border or background distinguishing it from a plain text link
- **AND** the primary CTA remains visually dominant (e.g., filled vs. outlined)

#### Scenario: Yolo CTA copy names what is skipped
- **WHEN** the picker renders the yolo CTA in `en`
- **THEN** the CTA copy explicitly references skipping the lesson/walkthrough (rather than only saying "just generate it")
- **AND** the German variant is the locale-appropriate equivalent that names the same trade-off

#### Scenario: CTAs are disabled when selection incomplete
- **WHEN** a visitor has not selected both a culprit and a motive
- **THEN** both CTAs are disabled

#### Scenario: Both CTAs are localized
- **WHEN** the picker renders on `/de/story/[uuid]`
- **THEN** the yolo CTA copy is in German
- **AND** the walkthrough CTA copy is in German
