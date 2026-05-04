## Why

UX-research feedback flags two distinct trade-offs in the current build flow. (1) The stepwise wizard is slow — generating a full theory takes minutes, which hurts usability. (2) The result page (`/g/[id]`) shows the four moves as separate, stamped sections — the reader never sees a finished, narratively coherent conspiracy theory at the end. The first trade-off needs a fast alternative; the second is an output-format gap that should be fixed for both paths.

## What Changes

- Add a **narrative finale**: a polished, three-paragraph conspiracy-theory story rendered on `/g/[id]` that integrates all four moves into a single flowing piece with conspiracist-voice flair. This appears in addition to (not instead of) the existing per-move sections — the per-move blocks remain as the educational/critical layer.
- Persist the narrative on the generation row so it is generated once and read on every subsequent view.
- Add a **yolo entry path** on `/story/[uuid]`: alongside the existing "walk me through it" CTA, expose a "just generate it" CTA. Yolo randomly picks one idea per move, fans out all four section generations, then produces the narrative — the user lands directly on `/g/[id]`.
- Generate the narrative via a new structured-output OpenAI call that takes the four `paragraph` outputs (and the event/culprit/motive triple) and produces three paragraphs.
- Stepwise builds: trigger narrative generation when the fourth move resolves so the result page is ready when the user finishes.
- The walkthrough caption and the new yolo CTA are localized (en/de).

## Capabilities

### New Capabilities
- `conspiracy-narrative`: A three-paragraph integrated conspiracy-theory story is generated from the four move paragraphs and shown on the result page for every recipe-tagged generation, regardless of which build path produced it.
- `yolo-mode`: A one-click path from the conspirators-picker to a finished theory. The system randomly picks one idea per move, generates all four sections in parallel, generates the narrative, and lands the user on the result page.

### Modified Capabilities
<!-- None: pedagogical-safeguards, ux-research-deliverables, and visitor-analytics requirements are unchanged. -->

## Impact

- **Schema/persistence**: `recipeContent.narrative` (new optional field on `WizardContent`) holds the three-paragraph story. Backfill is not required; rows without it can render the existing per-move layout only.
- **OpenAI**: new `generateNarrative()` function and `NARRATIVE_SCHEMA` in `web/lib/recipe.ts` + `web/lib/openai.ts`. Adds one more model call per build — for stepwise builds that is +1 call total; for yolo it folds into the same fan-out.
- **API routes**:
  - `web/app/api/build/[id]/[move]/section/route.ts`: when the resolved move is `discredit` and all four moves are now present, kick off narrative generation and persist it before returning.
  - New `web/app/api/build/[id]/yolo/route.ts`: orchestrates the four-section fan-out and the narrative call; returns when persistence is complete.
- **UI**:
  - `web/app/g/[id]/page.tsx`: render the narrative above the per-move sections (or as the lede), with a clear visual separation between "the theory" and "how it was made".
  - `web/components/conspirators-picker.tsx`: add a secondary "yolo" CTA next to the primary "walk me through it" CTA.
- **i18n**: new label keys for the yolo CTA, narrative section heading, and progress copy on the yolo path.
- **Latency**: stepwise total time grows by ~1 narrative call (~5–10s) at the end. Yolo trades user agency for a single ~25–40s wait.
- **Pedagogical framing**: the per-move tells/stamps remain the primary teaching surface — the narrative is the artefact the recipe is teaching the user to see through. The on-page order should make that relationship visible.
