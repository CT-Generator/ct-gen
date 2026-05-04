## MODIFIED Requirements

### Requirement: Yolo path generates a complete theory in one server call

When the visitor clicks the yolo CTA OR triggers a yolo-from-here from inside the wizard's "Skip to result" affordance, the client SHALL POST to `/api/build/[id]/yolo`. The yolo route SHALL compute the set of MISSING moves (those not present in `recipeContent.per_move`), randomly select one idea per missing move from the row's `ideas`, generate section outputs for those missing moves in parallel, MERGE the new outputs with any existing `per_move` entries (preserving the user's earlier choices), and generate the narrative finale from the resulting four paragraphs. The route MUST persist the merged `per_move` and the narrative atomically. Section generation across the missing moves SHALL run in parallel where independent.

#### Scenario: Fresh row (full yolo from picker)
- **WHEN** the client POSTs to `/api/build/[id]/yolo` for a row whose `ideas` is populated and `per_move` is empty
- **THEN** the route generates section outputs for all four moves
- **AND** persists `per_move[anomaly|connection|dismiss|discredit]` each containing `{ idea, paragraph, debunk }`
- **AND** the chosen `idea` for each move is one of the strings in `ideas[move]`
- **AND** the route persists `recipeContent.narrative.paragraphs` (length 3)
- **AND** the route returns a 2xx response

#### Scenario: Yolo from here (partial state from wizard skip)
- **WHEN** the client POSTs to `/api/build/[id]/yolo` for a row whose `per_move` already contains entries for some-but-not-all of the four moves (e.g., only `anomaly` and `connection`)
- **THEN** the route ONLY generates section outputs for the missing moves (e.g., only `dismiss` and `discredit`)
- **AND** the existing `per_move` entries (the user's earlier choices) are preserved verbatim — their `idea`, `paragraph`, and `debunk` are unchanged
- **AND** the merged `per_move` after the call has all four moves populated
- **AND** the narrative is generated from the four paragraphs (existing + newly-generated) and persisted

#### Scenario: All-complete idempotent return
- **WHEN** the yolo route is called for a row whose `per_move` already contains all four moves AND `recipeContent.narrative.paragraphs` is set
- **THEN** the route does not regenerate sections or narrative
- **AND** the route returns a 2xx response (e.g., `{ ok: true, cached: true }`)

#### Scenario: All-complete but narrative missing
- **WHEN** the yolo route is called for a row whose `per_move` has all four moves BUT `recipeContent.narrative.paragraphs` is undefined (e.g., a stepwise build whose narrative was moderation-flagged)
- **THEN** the route does not regenerate sections (none are missing)
- **AND** the route DOES generate and persist the narrative finale from the existing four paragraphs

#### Scenario: Idea selection is randomized
- **WHEN** two distinct yolo builds run for distinct generations with the same `ideas` and the same set of missing moves
- **THEN** the picked ideas across the two runs are not deterministically identical (the system uses a non-seeded RNG)

#### Scenario: User lands on the result page after success
- **WHEN** the yolo route returns success to the client (whether triggered from the picker or from the wizard's skip-to-result)
- **THEN** the client navigates the visitor to the canonical permalink (`/g/[id]`, `/de/g/[id]`, or `/nl/g/[id]` depending on the row's locale and the visitor's URL prefix)

## ADDED Requirements

### Requirement: Wizard's skip-to-result affordance triggers yolo-from-here

The build wizard at `/build/[id]` (and its locale-prefixed variants) SHALL render a "Skip to result" affordance in its bottom navigation. When activated, the affordance MUST POST to `/api/build/[id]/yolo` and wait for the response before navigating to the result page. While waiting, the affordance MUST display a localized loading state (heading + dotted-progress sub-line) so the visitor knows the system is filling in the missing moves and stitching the narrative. The affordance MUST NOT navigate immediately to the result page — that path produced half-built result pages with empty narrative sections.

#### Scenario: Mid-wizard skip with partial state
- **WHEN** a visitor on a wizard screen with only some moves completed activates the skip-to-result affordance
- **THEN** the client POSTs to `/api/build/[id]/yolo` and shows the localized loading state
- **AND** the visitor remains on the wizard until the response arrives
- **AND** on success, the client navigates to the canonical result URL

#### Scenario: Done-screen skip is a no-op POST
- **WHEN** a visitor on the wizard's `done` screen (all four moves complete, narrative present) activates the skip-to-result affordance
- **THEN** the POST returns `{ ok: true, cached: true }` (idempotent path)
- **AND** the client navigates to the canonical result URL

#### Scenario: Loading state is localized
- **WHEN** the affordance is in its loading state on `/build/[id]`, `/de/build/[id]`, or `/nl/build/[id]`
- **THEN** the heading and dotted-progress sub-line are sourced from the locale's dictionary (`wizard.skip_to_result_loading_h`, `wizard.skip_to_result_loading_dots`)
- **AND** none of the loading copy is rendered as English when the row's locale is `de` or `nl`

#### Scenario: Network failure during skip
- **WHEN** the POST to `/api/build/[id]/yolo` aborts (timeout) or returns a non-2xx
- **THEN** the affordance returns to its idle state with an inline error message in the row's locale
- **AND** the visitor remains on the wizard
- **AND** the row's `per_move` is unchanged from before the click
