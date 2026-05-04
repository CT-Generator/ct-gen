## Context

Round-2 persona review of the shipped `/g/[id]` narrative section + picker yolo CTA surfaced seven view-layer issues. They cluster into three buckets: (a) one mobile DOM-order bug, (b) screenshot-safety regression at small viewports caused by stamping the section once instead of once per paragraph, (c) copy and discoverability polish. None require schema, prompt, or persistence changes.

The current page on a narrative-present row reads: eyebrow → h1 → italic conspiracist_intro (with embedded source link) → "The theory" eyebrow → 3 narrative paragraphs (in a single relative wrapper) → narrative stamp at wrapper bottom → moves legend (`Built from: …`) → "see how the trick was built" link → rule → breakdown eyebrow → explainer → 4 per-move blocks. The italic intro and the narrative are functionally redundant; the stamp anchored to wrapper-bottom misses screenshots of just paragraph 1 on mobile; the legend names moves with no affordance to learn what they mean.

## Goals / Non-Goals

**Goals:**
- Make the picker's primary CTA visually first on mobile (and remain on the right on desktop).
- Stamp every narrative paragraph independently so any screenshot crop that contains a paragraph also contains a stamp.
- Visually strengthen the stamp without making it compete with narrative polish.
- Eliminate the duplicate-opening pattern (italic intro + narrative) for narrative-present rows.
- Soften the yolo CTA copy without losing the trade-off-naming the round-1 reframe achieved.
- Give the moves legend a click-through to /recipe.
- Add move-number prefix to the legend so its naming aligns with the per-move headings (`MOVE 01 · …`).

**Non-Goals:**
- Adding per-move anchors to `/recipe`. The legend links to plain `/recipe` for now; per-move anchors are a recipe-page concern.
- Per-sentence move-tagging inside narrative paragraphs (still on the deferred list — needs schema work).
- OG image regeneration to reflect narrative content (deferred — bigger work).
- Stepwise discredit-step active progress indicator (deferred — Tier 3).
- Touching per-move stamps. They already encode `MOVE NN · TELL` and serve a different purpose from the legend (the per-move stamp says *which technique*, the legend says *which moves are in this story*). We document this decision and leave them alone.

## Decisions

### Picker: primary CTA first in DOM (item 1)

Current DOM: `[<button yolo />, <button primary />]` inside `flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-end`. On mobile (`flex-col`), yolo stacks on top.

Fix: swap DOM order to `[<button primary />, <button yolo />]`. Result on mobile: primary on top, yolo below — matches mobile-first convention. Result on desktop: primary on the LEFT of the row (because flex-row preserves DOM order), with `justify-end` keeping the pair right-aligned. Primary-on-left on desktop is fine — it's the first visual element a left-to-right reader encounters and remains the most visually dominant by virtue of being filled.

**Alternative considered:** keep DOM order, use `flex-col-reverse sm:flex-row` to flip mobile. Rejected — `col-reverse` interferes with focus order for keyboard users. DOM order should match visual+focus order.

### Per-paragraph narrative stamp (items 2–3)

Restructure the narrative section so each paragraph is its own `position: relative` wrapper containing one `<p>` and one `<NarrativeStamp />`. Three paragraphs → three wrappers → three stamps. This mirrors the per-move stamp pattern (one stamp per paragraph block) and closes the crop-failure case where a screenshot of just paragraph 1 misses a stamp anchored to paragraph 3.

The stamps render small (10–11px caps mono) with a soft-tint background (`color-mix(in oklab, currentColor 8%, transparent)` or similar) so they remain visible against the paragraph body without dominating the visual flow. No move accent — the stamp belongs to the artefact, not a specific move.

**Alternative considered:** top eyebrow + bottom stamp. Rejected — fails for crops of middle paragraphs (paragraph 2 is bounded by neither the top nor bottom marker).

**Trade-off:** three identical stamps look slightly repetitive. The repetition is the price of crop-safety — the same trade-off `pedagogical-safeguards` already accepted for per-move stamps.

### Cut conspiracist_intro on narrative-present rows (item 4)

Today: `{content.conspiracist_intro && (<p italic>...source link...</p>)}` — always rendered when present. With narrative below, this is a duplicate opening.

Fix: gate the conspiracist_intro on `!content.narrative?.paragraphs?.length`. Older rows without a narrative continue to render it.

The conspiracist_intro currently embeds the original-story `<a>` inline. When we drop the intro on narrative rows, we need to re-surface the source link. We render it as a small meta paragraph below the h1, mirroring the existing pattern on `/story/[uuid]` ("Source: rollingstone.com ↗"). Reuses the existing `t.original_story` label or the `t.source_label` from the story dictionary (we'll pick whichever reads cleaner).

### Yolo CTA copy reframe — softer (item 5)

The round-1 reframe ("Skip the lesson — show me the theory") names the trade-off but moralizes the lesson. Schmidt and Lukas both flagged this; Yilmaz pushed back on softening.

Decision: land on a milder framing that still names what's being skipped:
- EN: "Skip the walkthrough — show me the theory →"
- DE: "Den geführten Weg überspringen — nur die Theorie zeigen →"
- NL: "Sla de uitleg over — toon me de theorie →"

The word "walkthrough" / "geführten Weg" / "uitleg" names the WALKTHROUGH (the sequence of screens, what's actually skipped UI-wise) without invoking the moralized "lesson". The trade-off is preserved (you're not getting the step-by-step), the guilt-trip is gone.

**Yilmaz disagreement documented:** her position is that calling it a "lesson" gives the act of skipping its weight. We respect the disagreement but go with the softer framing because (a) round-1 evidence shows two of three personas felt put off, (b) the secondary-button visual treatment + the explicit "skip" verb already convey the trade-off without the moralizing noun.

### Linkify moves-legend titles (item 6)

Wrap each move title in `<a href="/recipe">` (or the locale-aware `localizedHref("/recipe", locale)`). The accent color stays; underline added on hover. Keyboard-accessible by default.

We do NOT link to `/recipe#<move>` — anchors don't yet exist on the recipe page. Plain `/recipe` is fine because the legend's purpose is "want to learn what these mean? click here" rather than "jump to the specific section".

### Move-number prefix in legend (item 7)

Today: `Built from: HUNT ANOMALIES · FABRICATE CONNECTIONS · DISMISS COUNTER-EVIDENCE · DISCREDIT THE CRITICS`

New: `01 HUNT ANOMALIES · 02 FABRICATE CONNECTIONS · 03 DISMISS COUNTER-EVIDENCE · 04 DISCREDIT THE CRITICS`

Drops the "Built from:" prefix (the section heading already says "The theory"; the legend reads naturally as the inventory). Adds the move number, which matches the per-move heading format below (`MOVE 01 · Hunt anomalies`). Now a reader scanning sees `01` in the legend and `MOVE 01` below — the connection is explicit.

The `t.moves_legend_prefix` key is no longer needed but we keep it (deprecated unused string) to avoid a Dictionary type churn that'd ripple through nl.ts review. Mark with a `// FIXME: unused, remove next change`.

**Alternative considered:** keep "Built from:" and add numbers (`Built from: 01 HUNT ANOMALIES · …`). Rejected — too verbose for a one-liner.

## Risks / Trade-offs

- **[Three stamps look noisy]** → Per-paragraph stamps repeat the same text. Mitigation: small font, low-contrast tint. The visual cost is acceptable for crop-safety; per-move blocks already accept the same trade-off.
- **[Source link relocation]** → Moving the source link from the italic intro to a meta line below the h1 might be lost in the visual hierarchy. Mitigation: render with the same `meta` style used by other source labels on `/story/[uuid]` so the pattern is consistent across the site.
- **[Yolo copy too soft]** → Yilmaz's pushback. The proposed copy still names the walkthrough being skipped — it's a softening, not a removal. If classroom evidence later shows users skip without realising they've opted out of the lesson, we revisit.
- **[Persona disagreement on item 5]** → We document Yilmaz's position in this design and the proposal so the choice is intentional. Easy to revert if classroom evidence pushes the other way.
- **[Linking the legend creates a click-target where there wasn't one]** → A reader who didn't intend to leave the page might click. We accept — that's the affordance Lukas asked for. Low risk on a `/recipe` link from a fake-theory page.
- **[Legend numbering vs per-move stamps tell-naming]** → Legend says `01 HUNT ANOMALIES`; per-move stamp says `MOVE 01 · BASE RATES`. Two correct names for different purposes (title vs tell). We don't flatten — they communicate different things at different page positions.

## Migration Plan

1. Ship view-layer changes only. No persistence change. Older rows continue to render exactly as today (no narrative, no per-paragraph stamps, conspiracist_intro still shown).
2. New rows render the new layout. Reading older rows alongside new rows on `/g/[id]` produces consistent UX (older rows just lack narrative-only affordances).
3. Rollback: revert the view-layer changes; `t.cta_yolo` keeps a soft history but we can swap the string back without code edits.

## Open Questions

- Source-link relocation copy: reuse `story.source_label` ("Source:") or coin `generation.source_label_meta` ("Source story" / "Original story")? Lean toward reusing `story.source_label` for cross-page consistency; revisit if it reads awkward in DE/NL.
- Should the legend prefix the move numbers in a different visual treatment (e.g., smaller, 50% opacity)? Default to same-treatment-as-title for clarity; revisit if it visually crowds.
- Does cutting `conspiracist_intro` on narrative rows leave anything else dependent on it? Search confirms only `/g/[id]/page.tsx` reads it; no OG-image dependence (OG renderer doesn't read narrative either, separate concern). Safe to gate.
