## Context

The shipped narrative finale renders three plain paragraphs above the per-move stamped blocks on `/g/[id]`, with a `meta` eyebrow ("The theory") and a `meta` eyebrow below ("How the trick was built"). The yolo CTA on `/story/[uuid]` is currently a `text-[13px]` underline link in a right-aligned row below the primary CTA. The narrative section has no equivalent of the `MoveTellStamp` component used inside each per-move paragraph container — that component is what makes per-move screenshots crop-resistant under `pedagogical-safeguards`.

User-research personas (a teacher running this on a projector, a 16-year-old student, and an academic researcher of conspiracy thinking) flagged the same root issue from three directions: the new narrative section reads like a final artefact (good), but it lacks the affordances the rest of the page uses to keep that artefact legible AS-A-RECIPE-OUTPUT.

## Goals / Non-Goals

**Goals:**
- Restore screenshot-safety for the narrative section (parity with per-move blocks).
- Make the four-move recipe visible inside the narrative artefact, even at a glance, so the form-recognition pedagogy survives a yolo-only experience.
- Make yolo a real choice on the picker (not a fallback), and name what's being skipped.
- Close the loop on yolo: a visitor who landed on `/g/[id]` via yolo gets one obvious next step ("see how it was built") that brings them into the breakdown.
- Make the breakdown section feel like a different artefact from the narrative, not a re-read.

**Non-Goals:**
- No regenerating prompts, no new model calls, no new routes, no schema changes.
- No per-sentence move-tagging inside the narrative paragraphs (the cheaper "moves legend" footer covers the same need at far lower complexity; per-sentence tagging would require a structured-output schema change which is out of scope).
- No backfill — older rows without `narrative` are not affected.
- No edits to the narrative prompt itself; the model's output is fine, the framing around it is what's missing.

## Decisions

### Stamp the narrative the same way per-move paragraphs are stamped

We add a new component `NarrativeStamp` (or extend `MoveTellStamp` with a "narrative" mode) that renders a small monospace caps stamp inside the narrative section's bottom-right corner. Text: `FAKE THEORY · BUILT FROM A RECIPE` (en) / `ERFUNDENE THEORIE · NACH REZEPT GEBAUT` (de). Color: a neutral ink-soft tone, NOT a move-accent — the stamp belongs to the *theory as a whole*, not to a specific move.

**Crop-resistance:** the stamp MUST be inside the same DOM container as the narrative paragraphs (same flow), so any horizontal screenshot that contains a sentence of any narrative paragraph also contains the stamp. The container becomes a `position: relative` wrapper with the stamp `position: absolute` in the bottom-right inside the wrapper — same pattern `MoveTellStamp` already uses.

**Alternative considered:** a watermark behind the text. Rejected — fails on small viewports where text reflows past the watermark, and the existing pedagogical-safeguards spec already establishes the bottom-right stamp pattern.

### Single page-level stamp, not one per paragraph

Per-move blocks have one stamp each because each paragraph is a self-contained unit (and the spec calls out the screenshot-of-one-move case). The narrative is one continuous artefact, so one stamp anchored to the section bottom is the right unit. A reader screenshotting any paragraph still gets the stamp because the section's container DOM extends past the last paragraph.

**Edge case** — if a screenshot crops above the stamp (e.g., just the first paragraph), it would miss the stamp. We mitigate by placing the stamp inside the *container* not at section-bottom: anchored to bottom-right of the same flex/relative wrapper that houses the paragraphs, so it sits within the paragraph block, not below it. If still risky, fallback option: stamp + an italic eyebrow at the *top* of the section ("A FAKE THEORY — BUILT FROM A RECIPE") so any horizontal crop including any paragraph also has either the eyebrow or the stamp visible. We will ship the bottom-right stamp first and only add the top eyebrow if research surfaces a real screenshot-failure.

### Moves legend below the narrative, not annotated inside

We render a small line directly below the narrative paragraphs:
```
Built from: ANOMALY · CONNECTION · DISMISS · DISCREDIT
```
Each move name is rendered in its accent color (the same colors used by the per-move headings + stamps). This:
- Costs zero model work — the narrative integrates the moves; the legend just names them.
- Is locale-aware via the existing per-locale move titles (`getMoves(locale).map(m => m.title)`).
- Restores form-recognition: a reader who only consumes the narrative still walks away with the four move names and their accent colors.

**Alternative considered:** per-paragraph colored left borders cycling through the four accents. Rejected because the narrative is three paragraphs but four moves — the mapping doesn't divide cleanly. Per-sentence inline annotation needs a schema change to know which sentence is which move; out of scope.

### Yolo CTA: secondary button, same row as primary

Replace the right-aligned underline link with a secondary button next to the primary, both in the same flex row:

```
[ Start building → ]   [ Skip the lesson — show me the theory → ]
```

The secondary button uses an outlined style (border, no fill, ink-soft text) so the primary remains the dominant visual choice. Both disabled when `!ready`. Both share the loading-state mechanism we already have.

**Alternative considered:** keeping the link but making it bigger/darker. Rejected — a link in a CTA region reads as "secondary action of last resort". A secondary button reads as "this is also a real choice".

### Yolo CTA copy names what's traded

Old: `Or: just generate it →` / `Oder: einfach generieren →`
New: `Skip the lesson — show me the theory →` / `Lektion überspringen — nur die Theorie zeigen →`

The copy explicitly names the lesson-skip. This is the persona-3 framing: "do you want to *learn* this, or do you want to *see* this".

### "See how the trick was built" CTA on /g/[id]

Render a small CTA at the bottom of the narrative section, before the breakdown eyebrow:
```
↓ See how the trick was built
```
It's an `<a href="#breakdown">` with `scroll-behavior: smooth` (or a small client component if we want a richer scroll). The breakdown eyebrow gets `id="breakdown"`. The CTA only renders when `recipeContent.narrative` is present (matches the conditions for the breakdown eyebrow). Localized.

**Alternative considered:** floating "to breakdown" affordance. Overkill for a 3-paragraph narrative on a long page; an in-flow link is sufficient.

### Breakdown explainer line

Directly below the `t.breakdown_eyebrow` line, render one localized sentence:
```
Each paragraph above used one of four moves. Here's each move on its own, with the debunk.
```
Localized. Only renders when narrative is present (older rows that already had per-move blocks shouldn't suddenly grow an explainer that references a narrative they don't have).

### No prompt changes

The narrative model output is fine — what's missing is the surrounding pedagogical scaffolding. We deliberately resist the temptation to retighten the prompt (em-dashes, etc.) in the same change. Those are tier-4 polish items and belong in their own change so this one stays focused on the safety + UX-clarity loop.

## Risks / Trade-offs

- **[Stamp visual noise on the narrative]** → The narrative is the "polished theory" artefact, and a stamp inside it slightly degrades the polish. Mitigation: small (10–11px caps, ink-soft tone, not a move accent), bottom-right corner, inside the wrapper. The entire point of the pedagogical-safeguards spec is that this trade-off is worth it.

- **[Moves-legend feels like marketing]** → A line saying "Built from: ANOMALY · CONNECTION · DISMISS · DISCREDIT" might read as branding rather than pedagogy. Mitigation: render the move names in their accent colors with the same `font-mono uppercase` treatment used by per-move stamps — visually it reads as a recipe-tag, not a tagline.

- **[Yolo button promotion encourages skipping]** → Making the yolo button bigger could push more users to skip the lesson. Mitigation: copy reframe explicitly names the skip; primary CTA stays visually dominant. Net effect is expected to be: more users will discover yolo, but those who use it will know what they're choosing.

- **[Smooth-scroll CTA loses keyboard users]** → A pure `<a href="#breakdown">` is fine for keyboard users (anchor link, focusable, native). If we go with a JS-driven scroll, we need to preserve the focus-target behavior. Default to the plain anchor.

- **[Older rows without narrative]** → All new copy/affordances are gated on `narrative` being present. Older rows render exactly as today.

## Migration Plan

1. Ship view-layer changes only — no schema, no routes. Additive.
2. Rollback: revert the view-layer changes; persisted data is unaffected.
3. No data backfill needed.

## Open Questions

- Does the moves-legend footer want the move *number* (`MOVE 01` etc.) or the move *title* (`ANOMALY` / `Hunt anomalies`)? The numbers reference the per-move blocks below; the titles reference the recipe page. Going with titles in caps for consistency with the per-move stamps. Revisit after first round of classroom use.
- Should the yolo CTA's secondary-button treatment be outlined or filled-muted? Outlined preserves the strongest visual hierarchy for the primary; filled-muted makes both feel more equal. Defaulting to outlined; design tweak room if research disagrees.
- Does the breakdown explainer need a German localization that differs structurally from a literal translation? Pass-1 literal will ship; flag for pass-2 review.
