## ADDED Requirements

### Requirement: Wake Up Zine exposé board layout on permalink

The permalink page `/g/[id]` SHALL render the generated theory as an assembled "exposé board" with two zones in a `final-grid` layout (1.05fr left + 1fr right, collapsing to 1 column below 640px). The **left zone** SHALL be a single full-height card with `background: var(--ink)`, `color: var(--paper)`, a `box-shadow: 8px 8px 0 var(--hot)` offset hot-pink shadow, containing the news headline in display type (Anton), the news kicker meta, and a body block summarizing culprit + motive. The card MUST include a rotated `<MarkerStamp>` reading "RECEIPTS!" positioned top-right with a paper background and ink border. The **right zone** SHALL be a 2×2 grid of move cards, each numbered `01`–`04` in `var(--hot-2)` display type, with the move name, tactic label, and the move's theory text rendered via `<TheoryText>` (per-line `<MarkUnderline>` on slot-filled phrases). Background colors for the 4 move cards alternate `punch, paper, paper, punch`. On desktop, `<RedStrings>` SHALL draw corkboard SVG connectors from the headline card to each move card with pin dots at both endpoints. Three sticker labels — "Exposé · for instructional purposes", "100% fabricated", "Built in 3 minutes by you" — SHALL be rendered above the grid.

#### Scenario: Permalink renders the exposé layout
- **WHEN** a user visits a fully-populated `/g/[id]` URL on a 1280px desktop viewport
- **THEN** the page renders a sticky `<Topbar>`, three exposé stickers, a two-column final-grid containing the dark headline card (left) and 2×2 move grid (right)
- **AND** a `<RedStrings>` SVG overlay connects the headline card to each of the four move cards
- **AND** the "RECEIPTS!" rotated marker stamp is rendered top-right of the headline card

#### Scenario: Mobile stack drops the strings
- **WHEN** the same permalink renders at 360px viewport
- **THEN** the final-grid collapses to a single column
- **AND** the move-card 2×2 grid collapses to a single column
- **AND** `<RedStrings>` does not render

### Requirement: MarkUnderline applied to slot-filled phrases in move text

For each of the four move theory text blocks on the permalink page, the phrases that came from the user's selections — the **anomaly** (from the news story's `anomaly` field or the LLM-tagged equivalent), the **culprit name** (e.g., "The Government"), the **motive verb phrase** (e.g., "short a stock at exactly the right moment"), the **adjacent event** (apophenia move), and the **official-channel mask** (e.g., "a three-letter agency you have probably never heard of") — SHALL be rendered inside `<MarkUnderline>` so each one carries the per-line red wobbly underline. A small caption underneath the theory block on the wizard step screen SHALL state: "the red-marked words are the parts your picks generated." On the permalink, the same caption MAY be present once near the move grid.

#### Scenario: Theory text marks slot fills
- **WHEN** a move's theory block renders the culprit name "Big Pharma"
- **THEN** the text "Big Pharma" is wrapped in a `<MarkUnderline>` component and the rendered span carries the wobbly red per-line underline

#### Scenario: Multi-line slot fill underlines every line
- **WHEN** a slot-fill phrase like "an intelligence service whose name doesn't translate well" wraps across two visual lines inside the dense move card
- **THEN** each visual line shows its own wobbly red underline beneath it (verified via `box-decoration-break: clone`)

#### Scenario: Caption explains the marker convention
- **WHEN** the user reaches a move step in the wizard with theory text containing at least one `<MarkUnderline>`
- **THEN** the page renders a small caption below the theory text reading "↑ the red-marked words are the parts your picks generated."
- **AND** the caption is localized into EN / DE / NL via the i18n dictionary
