## Context

The current build flow funnels a visitor through `/story/[uuid]` (pick culprit + motive) → `/build/[id]` (four sequential `MoveScreen`s, each fetching `/api/build/[id]/[move]/section`) → `/g/[id]` (read-only result). The result page renders four stamped move blocks (paragraph + debunk per move), but it never composes those four paragraphs into a single conspiracy story. UX research surfaced two complaints rooted in that flow: (a) the four sequential model calls take a long time, and (b) the artefact at the end reads as snippets, not as a finished theory.

`recipeContent` (`WizardContent` in `web/lib/recipe.ts`) is a JSONB blob already structured for incremental writes — `event_intro`, `ideas`, `per_move[move]`, etc. — so adding a `narrative` field is a natural extension. Section generation is implemented in `generateSection()` (`web/lib/openai.ts`) using OpenAI structured outputs against `SECTION_SCHEMA`. We will follow the same pattern for the narrative.

## Goals / Non-Goals

**Goals:**
- Always show a polished three-paragraph conspiracy story on `/g/[id]`, regardless of whether the build was stepwise or yolo.
- Offer a one-click yolo path from `/story/[uuid]` that lands directly on `/g/[id]`.
- Generate the narrative once per generation and persist it; reads are pure DB lookups.
- Keep the per-move stamped sections + debunks intact — they are the educational/critical layer that the recipe depends on.
- Localize all new copy (en/de) on the same translation surface as the existing wizard.

**Non-Goals:**
- Re-architecting `WizardContent` or migrating older rows. Generations created before this change are read-only; their result page renders without the narrative.
- Streaming the narrative or per-move output. We keep the current "wait until complete, then render" pattern.
- Re-prompting the four moves to make them narratively coherent end-to-end. The narrative call is the integration layer.
- Editorial control over the narrative (no per-paragraph regenerate). A regenerate-narrative button can come later if research warrants it.

## Decisions

### Narrative as a fifth structured-output call (not synthesised on the fly)

We add `NARRATIVE_SCHEMA` (3-paragraph array) and `generateNarrative()` in the same module/style as `SECTION_SCHEMA` / `generateSection()`. Input: the four `paragraph` strings, the event/culprit/motive triple, locale. Output: an object `{ paragraphs: string[3] }` integrating the moves into a single story with conspiracist flair. The system prompt explicitly instructs the model to weave the four moves' content into one continuous arc, not just paraphrase them — and to NOT include the debunks.

**Alternative considered:** rendering by joining the four `paragraph` fields with paragraph breaks. Rejected because (a) the moves are written to stand alone with their own openers, so concatenation reads disjointed, and (b) the user feedback specifically asks for narrative flair the section prompts don't aim for.

### Narrative is generated server-side at completion, not lazy-on-render

For stepwise builds, the section route for the **last** move generates the narrative inline before returning, so by the time the user clicks "see full theory" the row has `narrative` populated. For yolo, narrative generation is the final step before the route responds. Either way, `/g/[id]` is a pure read.

**Alternative considered:** generate on first GET to `/g/[id]` if missing. Rejected because it complicates caching and OG-image generation, and because the user is explicitly waiting on completion in both flows already.

### Yolo as a new API route + CTA, not a flag on `/api/start`

`/api/start` returns a `shortId` and writes the row with empty `per_move`. Yolo is more than `/api/start + autoplay` — it must (a) randomly pick one idea per move from the freshly-generated `ideas`, (b) fan out four section generations in parallel, (c) generate the narrative, (d) persist everything atomically. A new `/api/build/[id]/yolo` route handles step (b)–(d) and is invoked by the picker after `/api/start` returns. On the client, the yolo CTA does: `POST /api/start` → `POST /api/build/[id]/yolo` → `router.push(/g/[id])`.

**Alternative considered:** single `/api/start?mode=yolo` that does all of it. Rejected because `/api/start` is already at `maxDuration = 60` and yolo work pushes the latency envelope; splitting routes keeps each call within timeout headroom and lets us show a loading state during the longer leg.

### Random idea selection happens server-side

The yolo route reads `recipeContent.ideas`, picks one idea per move with `Math.random()`, and persists the picks alongside the section outputs. We deliberately do not seed the RNG on the user's input — the ask is "go full yolo", and reproducibility isn't valuable here.

**Alternative considered:** client-side random pick passed in the body. Rejected — the route would still need to validate the picks against `ideas`, and centralising avoids a round-trip.

### Narrative position on `/g/[id]`: above per-move blocks, with a visible boundary

The page lede already names culprit/event/motive and shows the conspiracist intro. The narrative renders right after the lede, framed as "the theory" with a soft section heading. The four per-move stamped blocks follow, framed as "how the trick was built" with the existing stamps + debunks. This makes the pedagogical relationship explicit: see the artefact, then see the moves. The conspiracist intro stays where it is — it is the elevator pitch; the narrative is the full story.

**Alternative considered:** render narrative *instead of* per-move blocks (toggle). Rejected — the educational layer is non-negotiable per `pedagogical-safeguards`. We render both.

### Persistence shape

```ts
type WizardContent = {
  // existing fields…
  narrative?: { paragraphs: string[]; generated_at: string };
};
```

`generated_at` is an ISO string, useful if we ever want to expire/regenerate narratives across prompt changes. No DB migration: `recipeContent` is JSONB.

### Yolo random-picks visibility

We do show the user the four randomly-picked ideas on the result page (rendered alongside each move's existing `idea_label`), so a yolo user can still see the moves the system chose. No new field needed — the existing `per_move[move].idea` is already populated with the picked idea by the yolo route.

## Risks / Trade-offs

- **[Latency on yolo path]** → Four parallel section calls + one narrative call. We use `Promise.all` for sections and run narrative right after. Per-call timeout stays at the existing 60s; route `maxDuration` set to 90s. Worst case visible to the user: ~40s of waiting on a single screen with a clear progress affordance.

- **[Narrative drifts from per-move debunks]** → If the narrative softens claims that the move-debunks call out, the educational layer is undermined. Mitigation: narrative prompt instructs the model to preserve the specific anomaly/connection/dismiss/discredit claims from the input paragraphs verbatim where possible; reviewer should diff a handful of generations against per-move outputs during rollout.

- **[Increased OpenAI spend]** → +1 model call per build. With current volume the cost is negligible; flag if volume changes materially.

- **[Yolo bypasses the pedagogical scaffolding]** → A user who skips the moves sees the artefact without the framing. Mitigation: the result page still shows per-move stamps + debunks below the narrative — the user can scroll and see the trick. The yolo CTA copy frames it as "see the trick all at once" rather than "skip the lesson".

- **[Section route performance regression for stepwise]** → The discredit (last) section now also generates the narrative before responding. That adds ~5–10s to the user's wait at the end of the stepwise flow. Mitigation: client UI already shows a "writing" state on section generation; we extend the copy on the discredit step to acknowledge the longer wait ("stitching the full theory…").

- **[Older rows missing narrative]** → Pre-change generations have no `narrative` field. The result page falls back gracefully — no narrative section renders, per-move blocks show as today. We do not backfill.

- **[Moderation]** → The narrative passes through the same `moderate()` flow already used on per-move paragraphs. If flagged, the narrative is dropped (set to undefined) and the page renders the per-move-only fallback; the user sees a small note.

## Migration Plan

1. Ship the new fields and prompts behind no flag — additive, JSONB-friendly. Older rows render fine without `narrative`.
2. Stepwise builds: discredit-section route generates the narrative inline before returning. Existing stepwise users finishing a build after deploy get a narrative; users mid-build before deploy will not (they finish on the old flow).
3. Yolo CTA: ship the `/api/build/[id]/yolo` route and the picker-side button together.
4. Rollback: delete the narrative section on `/g/[id]`, revert the yolo CTA, and disable the narrative side-effect in the discredit-section route. Persisted `narrative` data on rows is harmless.

## Open Questions

- Do we want a small "regenerate narrative" affordance on `/g/[id]`? Defer until research feedback says yes.
- Should the narrative appear in the OG image / share preview? Likely no for v1 — current OG renders the title + chips. Revisit once the narrative copy stabilises.
- Yolo "show the picks" — render the picks as a one-line list at the top of the per-move section ("auto-picked: <idea>"), or keep the existing `idea_label` style? Default to the existing style for consistency; revisit after we see real outputs.
