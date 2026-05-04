## Why

A second-round persona review of the shipped `narrative-finale-and-yolo-mode` + `narrative-pedagogical-finish` work surfaced one real bug, one screenshot-safety gap that bites at small viewports, and four UX-clarity issues. All seven items are view-layer / copy-layer; none touches the model, schema, routes, or persistence.

## What Changes

- **Mobile primary-CTA bug (picker)**: on `/story/[uuid]`, the secondary "yolo" button is currently DOM-first, so on `flex-col` mobile it stacks ABOVE the primary "Start building" — students tapped the wrong one. Swap DOM order so primary-first.
- **Per-paragraph narrative stamp**: the existing single section-bottom stamp fails crop-safety at small viewports (a screenshot of just narrative paragraph 1 misses a stamp anchored to paragraph 3's bottom). Render one stamp per narrative paragraph, matching the per-move stamp pattern.
- **Narrative stamp visual prominence**: bump the stamp from text-only to a soft-tint colored background (still neutral ink-soft, no move accent). Visible at projector distance and on screenshot crops without competing with narrative polish.
- **Cut the italic conspiracist_intro on `/g/[id]` when narrative is present**: it's a 50-word italic conspiracist hook rendered immediately before the 280-word narrative — two openings to the same theory. Drop it for narrative-present rows; relocate the source link to its own meta line below the h1. Older rows without a narrative continue to render the conspiracist_intro as today.
- **Yolo CTA copy reframe (lighter)**: replace "Skip the lesson — show me the theory" with "Skip the walkthrough — show me the theory" in EN/DE/NL. Names the trade-off without moralizing. (Persona disagreement: Yilmaz pushed back on softening; the proposal acknowledges this and lands on the milder framing because the moralizing version was noted to bite both Schmidt and Lukas in classroom contexts.)
- **Linkify moves-legend titles** to `/recipe` so a curious reader who doesn't know the recipe can click through.
- **Add move-number prefix to legend** for consistency with the per-move stamps below: legend renders `01 · HUNT ANOMALIES · 02 · FABRICATE CONNECTIONS · …` instead of `Built from: HUNT ANOMALIES · FABRICATE CONNECTIONS · …`. Drops the redundant "Built from:" prefix; the section heading already says "The theory" and the legend itself reads as the inventory.

## Capabilities

### New Capabilities
<!-- None — three existing capabilities modified. -->

### Modified Capabilities
- `pedagogical-safeguards`: tighten the narrative-stamp rule from "one stamp per section" to "one stamp per narrative paragraph", and require the stamp's visual treatment to remain visible at small viewports + projector distance (soft-tint background, not just text).
- `conspiracy-narrative`: drop the conspiracist_intro on narrative-present `/g/[id]` rows, link the moves-legend titles to `/recipe`, switch the legend format to a numbered move list (drop the "Built from:" prefix).
- `yolo-mode`: change the picker's button DOM order so primary is first (visual: primary-on-top on mobile, primary-on-right on desktop), and re-author the yolo CTA copy to name the walkthrough being skipped without the "lesson" framing.

## Impact

- **UI**: edits to `web/app/g/[id]/page.tsx`, `web/components/conspirators-picker.tsx`, `web/components/narrative-stamp.tsx`. No new components.
- **i18n**: replacement copy for `story.cta_yolo` (en+de+nl). New optional key `generation.source_label_meta` for the relocated source link if the existing `story.source_label` doesn't fit.
- **Specs**: three modified-capability deltas. No new schema, persistence, routes, or model calls.
- **Latency / cost**: zero.
- **Backwards compatibility**: rows without `narrative` still render the conspiracist_intro and the existing layout. The per-paragraph stamp only renders on narrative-present rows.
- **Pedagogical posture**: closes the small-viewport screenshot gap that the round-1 narrative stamp left open; lets a casual reader of the artefact click through to /recipe to learn the moves; removes the duplicate "opening to the theory" pattern that diluted attention.
