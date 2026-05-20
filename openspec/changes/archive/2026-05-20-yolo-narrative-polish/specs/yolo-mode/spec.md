## MODIFIED Requirements

### Requirement: Wizard's skip-to-result affordance triggers yolo-from-here

The build wizard at `/build/[id]` (and its locale-prefixed variants) SHALL render a "Skip to result" affordance in its bottom navigation. When activated, the affordance MUST POST to `/api/build/[id]/yolo` and wait for the response before navigating to the result page. While waiting, the affordance MUST display a localized, visually conspicuous loading state (an animated spinner or equivalent motion affordance, plus a short status line) so the visitor knows the system is filling in the missing moves and stitching the narrative. A static label with a trailing dotted ellipsis is NOT sufficient — the affordance MUST include continuous motion (CSS animation, SVG, or video) for the duration of the wait. The affordance MUST NOT navigate immediately to the result page — that path produced half-built result pages with empty narrative sections.

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
- **THEN** the status line is sourced from the locale's dictionary (e.g., `wizard.skip_to_result_loading_status`)
- **AND** none of the loading copy is rendered as English when the row's locale is `de` or `nl`

#### Scenario: Loading state shows continuous motion
- **WHEN** the affordance is in its loading state for any locale
- **THEN** the rendered DOM includes an animated indicator (e.g., a spinner element with a CSS keyframe animation or an SVG with motion) that is visible at viewport widths ≥320px
- **AND** the animation runs continuously from the click until the response resolves
- **AND** the animation does NOT consist solely of a 0–3 dot ellipsis cycle

#### Scenario: Network failure during skip surfaces a retry control
- **WHEN** the POST to `/api/build/[id]/yolo` aborts (timeout) or returns a non-2xx
- **THEN** the affordance returns to its idle state with an inline error message in the row's locale
- **AND** a localized retry control is rendered next to the error message that re-runs the same POST on activation
- **AND** the visitor remains on the wizard
- **AND** the row's `per_move` is unchanged from before the click

## ADDED Requirements

### Requirement: Picker yolo CTA surfaces the same loading affordance and retry control

When the visitor activates the secondary yolo CTA on `/story/[uuid]` (the picker), the client SHALL render the same animated-motion loading state described under the wizard's skip-to-result affordance, sourced from the same locale dictionary keys. On failure (abort or non-2xx response from `/api/build/[id]/yolo` after the initial `/api/start` succeeds), the picker MUST render a localized retry control next to the error message that re-runs the same `/api/build/[id]/yolo` POST without restarting `/api/start`.

#### Scenario: Picker yolo shows the animated loading state
- **WHEN** a visitor activates the yolo CTA on `/story/[uuid]`, `/de/story/[uuid]`, or `/nl/story/[uuid]`
- **THEN** the picker renders the animated loading state (spinner + localized status line) while the request is in flight
- **AND** the loading state uses the same component used by the wizard's skip-to-result affordance

#### Scenario: Picker yolo failure surfaces a retry
- **WHEN** the YOLO POST aborts or returns a non-2xx after `/api/start` already succeeded
- **THEN** the picker renders the inline error in the row's locale
- **AND** a retry control appears next to the error that, on activation, re-POSTs to `/api/build/[id]/yolo` using the existing `shortId` (no second `/api/start` call)

### Requirement: Yolo route retries discredit once with a softer briefing when only discredit is moderation-flagged

When the per-section moderation step finds that the ONLY moderation-flagged section is `discredit`, the yolo route SHALL regenerate the discredit section ONCE using a softer fallback briefing that keeps assertive declarative voice but shifts the framing from inflammatory tropes ("paid stooges", "cabal's payroll", "hush-money") to incentive-based framing ("their grants, board seats, reputation — disagreement would cost them"). If the soft retry passes moderation, the route SHALL replace the flagged section and continue normally. If the soft retry is ALSO moderation-flagged, the route SHALL surface the existing user-facing 422 error. If a non-discredit section is moderation-flagged (alone or alongside discredit), the route SHALL NOT retry and SHALL surface the 422 immediately.

The retry adds at most one additional `generateSection` + `moderate` round-trip to the latency budget (roughly 10–15 seconds). The 90-second client timeout already accommodates this.

#### Scenario: Discredit-only moderation flag triggers soft retry
- **WHEN** the parallel section moderation step finds the discredit section flagged AND no other section is flagged
- **THEN** the route logs `failure_category=discredit_soft_retry_attempted` with the `shortId`
- **AND** calls `generateSection` again with `useSoftDiscreditBriefing: true` for the discredit move
- **AND** moderates the soft retry's paragraph
- **AND** on soft-retry success, logs `failure_category=discredit_soft_retry_succeeded` and continues the route as if the original discredit had passed

#### Scenario: Soft retry also moderation-flagged
- **WHEN** the soft-retry discredit paragraph is ALSO moderation-flagged
- **THEN** the route logs `failure_category=discredit_soft_retry_also_flagged` with the `shortId`
- **AND** returns 422 with the existing user-facing error message
- **AND** does NOT make a third attempt

#### Scenario: Non-discredit moderation flag bypasses the retry
- **WHEN** a section other than discredit is moderation-flagged (e.g., the anomaly section), regardless of whether discredit was also flagged
- **THEN** the route does NOT attempt the soft-discredit retry
- **AND** logs `failure_category=section_moderation_flag` with the first flagged moveKey
- **AND** returns 422 immediately as before

#### Scenario: Soft retry throws (network / model failure)
- **WHEN** the soft-retry `generateSection` call throws (e.g., transient OpenAI error)
- **THEN** the route logs `failure_category=discredit_soft_retry_error` with the `shortId` and error class
- **AND** returns 502 with the user-facing "engine glitched" message (parity with the original section-generation failure path)

### Requirement: Yolo route emits structured breadcrumbs for each failure mode

The yolo route SHALL emit a distinct structured log line for each of the three failure modes — (a) section-generation failure, (b) section moderation flag, (c) narrative-generation failure — so that ops can distinguish which step caused a user-reported "Application error". Log lines MUST include the generation `shortId` and the failure category, MUST NOT include any paragraph or narrative text from the model, and MUST be emitted before the route returns its error response (or for narrative failure, before the route falls back to persisting per-move only).

#### Scenario: Section-generation failure logs a categorized line
- **WHEN** one of the `generateSection` calls in `/api/build/[id]/yolo` throws
- **THEN** the route emits a `console.error` line categorized as section-generation failure
- **AND** the line includes the `shortId` and the failing move's key
- **AND** the line does NOT include the user's selected idea text, paragraph text, or any model-generated content

#### Scenario: Section moderation flag logs a categorized line
- **WHEN** the moderation check flags any of the newly-generated section paragraphs
- **THEN** the route emits a `console.warn` line categorized as section moderation flag
- **AND** the line includes the `shortId` and the flagged move's key
- **AND** the route returns a 422 with a user-facing message

#### Scenario: Narrative-generation failure logs a categorized line
- **WHEN** `generateNarrative` throws or returns invalid output
- **THEN** the route emits a `console.error` line categorized as narrative-generation failure
- **AND** the line includes the `shortId`
- **AND** the route persists the per-move data without `narrative.paragraphs` (existing behavior) but does not throw to the client
