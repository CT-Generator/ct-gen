## Why

Today the wizard's "Skip to result" / "Direct naar het resultaat" / "Direkt zum Ergebnis" link routes the visitor to `/g/[id]` immediately, regardless of how many moves they've completed. If they've only filled in two moves, the result page shows two stamped blocks plus an empty narrative section — a half-built theory. The yolo CTA on the picker, by contrast, generates a complete theory in one call. This change makes "Skip to result" mid-wizard behave like a localized yolo: keep the user's choices for moves they've already done, and yolo-fill the missing ones (random idea + section generation + narrative finale), then land on the canonical result.

## What Changes

- **Server**: `/api/build/[id]/yolo` no longer regenerates moves the user has already completed. It computes the *missing* moves (those not present in `per_move`), randomly picks an idea for each missing move from the row's `ideas`, generates section outputs for those missing moves in parallel, combines the new outputs with the existing `per_move` entries, and generates the narrative finale from the resulting four paragraphs. If the row already has all four moves and a narrative, the route is idempotent (existing behavior). If the row already has all four moves but no narrative (e.g. moderation flagged on stepwise discredit), the route regenerates and persists the narrative.
- **Client**: The wizard's "Skip to result" affordance becomes a button that POSTs to `/api/build/[id]/yolo` (yolo-from-here), waits for completion with a localized loading state, then navigates to the result. On the wizard's `done` screen (all four moves already complete) the affordance still renders but the API call short-circuits as a no-op idempotent return — UX is the same.
- **i18n**: new keys `wizard.skip_to_result_loading_h` (heading shown during the API wait) and `wizard.skip_to_result_loading_dots` (sub-line cycling-dot pattern). EN/DE/NL values authored, NL marked `// FIXME: pass 2`.

## Capabilities

### New Capabilities
<!-- None — extends the existing yolo-mode capability. -->

### Modified Capabilities
- `yolo-mode`: the yolo route now accepts partial `per_move` state (only generates the missing moves; preserves existing user choices). The wizard's "Skip to result" link becomes a yolo-from-here trigger.

## Impact

- **DB**: no schema change. Reuses the existing `recipeContent.per_move` partial-state representation.
- **UI**: edit to `web/components/build-wizard.tsx` (replace `<Link>` with a button + transition state). No new components.
- **API**: edit to `web/app/api/build/[id]/yolo/route.ts` (compute missing moves, fan out only those).
- **Specs**: one modified-capability delta on `yolo-mode`.
- **Latency**: yolo-from-here with 2 missing moves takes ~25–35s (vs ~40s for full yolo). User waits during the click rather than during the wizard's section calls — total time is similar to a full stepwise build, but the wait is concentrated.
- **Backwards compatibility**: a fresh row with empty `per_move` triggers the full-yolo behavior just like before. The picker yolo CTA is unchanged.
- **Pedagogical posture**: a user who started the lesson but tapped out keeps their actual choices in the artefact (their paragraph and debunk for the moves they did fill in), with the rest filled in randomly. The breakdown still shows the moves' tells; the narrative still integrates four paragraphs. No regression in the educational scaffolding.
