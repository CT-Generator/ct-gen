## Why

A three-persona review of the just-shipped narrative finale + yolo mode surfaced one safety gap and several UX-clarity gaps. The safety gap is load-bearing for the project's pedagogical promise; the UX gaps are blocking comprehension on first contact (especially in classroom use). All six issues stem from the same root: the narrative section was added without the supporting affordances that make the rest of the result page legible and screenshot-safe.

Specifically:
- The narrative section has no in-section "this is fake / from a recipe" mark, so a screenshot of just the narrative paragraphs loses the educational frame — the exact failure mode `pedagogical-safeguards` was created to prevent for the per-move blocks.
- The yolo CTA is a small underline link, which makes it both hard to discover (classroom projector) and easy to mistake for a fallback (the researcher's "form recognition disappears" concern).
- The yolo CTA copy doesn't name what's being skipped — students can yolo without realising they've opted out of the lesson.
- After a yolo build, there's no forward CTA on `/g/[id]` to walk a curious user through the breakdown — they read the narrative and leave without ever seeing the moves on their own.
- The breakdown section's eyebrow ("How the trick was built") doesn't explain the relationship between the narrative above and the per-move blocks below — students perceive the breakdown as a re-read.
- The narrative reads as one continuous story, which is realistic but hides the four-move recipe — a one-line legend mapping the narrative back to the four moves restores form-visibility cheaply.

## What Changes

- Add a crop-resistant `FAKE THEORY · BUILT FROM A RECIPE` stamp to the narrative section on `/g/[id]`, parallel to the existing per-move tell-stamps. **BREAKING for `pedagogical-safeguards`** in spirit only: it extends the existing crop-resistance rule to a section that previously lacked it; existing per-move stamps are unchanged.
- Render a small footer line below the narrative that names the four moves in their accent colors (e.g., `Built from: ANOMALY · CONNECTION · DISMISS · DISCREDIT`). Localized.
- Promote the yolo CTA on `/story/[uuid]` from underline-link to a proper secondary button (outlined or muted-fill style), in the same row as the primary CTA. The primary remains visually dominant.
- Reframe the yolo CTA copy on both locales: name what's being traded away. EN: "Skip the lesson — show me the theory →". DE: "Lektion überspringen — nur die Theorie zeigen →".
- Add a "See how the trick was built" smooth-scroll CTA on `/g/[id]` that appears when `recipeContent.narrative` is present. Sits at the bottom of the narrative section and scrolls to the breakdown eyebrow.
- Add a one-line explainer below the breakdown eyebrow on `/g/[id]`: "Each paragraph above used one of four moves. Here's each move on its own, with the debunk." Localized. Renders only when narrative is present.

## Capabilities

### New Capabilities
<!-- None — this change extends three existing capabilities. -->

### Modified Capabilities
- `pedagogical-safeguards`: extend the crop-resistance rule to cover the narrative section (every narrative on `/g/[id]` carries an in-section fake/educational stamp).
- `conspiracy-narrative`: add the moves-legend footer, the breakdown explainer line, and the "see how the trick was built" CTA, all gated on narrative-present rows.
- `yolo-mode`: tighten the picker CTA's visual treatment (proper button) and re-author its copy to name what's skipped.

## Impact

- **UI**: changes touch `web/app/g/[id]/page.tsx`, `web/components/conspirators-picker.tsx`. New small client component for the smooth-scroll CTA (or a `<a href="#breakdown">` anchor with smooth-scroll CSS).
- **i18n**: new label keys for `generation.narrative_stamp`, `generation.moves_legend_prefix`, `generation.see_breakdown_cta`, `generation.breakdown_explainer`. Replacement copy for `story.cta_yolo` (en+de).
- **Specs**: three modified-capability deltas. No new schema, no new persistence, no new model calls, no new routes.
- **Latency / cost**: zero — view-layer only.
- **Backwards compatibility**: rows without `narrative` (older rows) render unchanged. New copy/buttons only appear when narrative is present.
- **Pedagogical posture**: the change closes the screenshot-safety regression introduced by the narrative section, and it makes the four-move taxonomy visible inside the narrative artefact rather than only inside the per-move breakdown.
