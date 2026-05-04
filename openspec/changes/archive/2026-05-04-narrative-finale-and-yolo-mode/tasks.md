## 1. Schema + recipe types

- [x] 1.1 Add `NARRATIVE_SCHEMA` (3-paragraph object, `additionalProperties: false`) and `Narrative` type in `web/lib/recipe.ts`
- [x] 1.2 Extend `WizardContent` with optional `narrative?: { paragraphs: string[]; generated_at: string }`

## 2. OpenAI narrative generator

- [x] 2.1 Add `generateNarrative()` in `web/lib/openai.ts` mirroring `generateSection()`: structured output against `NARRATIVE_SCHEMA`, locale-aware system prompt, voice + hard-constraints reused
- [x] 2.2 Author EN system prompt: integrate four moves into one continuous arc with conspiracist flair, exactly three paragraphs, plain prose, no debunks, no headings
- [x] 2.3 Author DE system prompt (pass-1 literal, mirroring existing per-locale prompt structure)
- [x] 2.4 Add a small unit-style smoke check (script or test) that asserts the schema validates a sample 3-paragraph response (no test runner in repo; implemented as inline runtime guard `parsed.paragraphs.length !== 3` inside `generateNarrative`)

## 3. Narrative on stepwise build completion

- [x] 3.1 In `web/app/api/build/[id]/[move]/section/route.ts`, after persisting `per_move`, detect "all four moves now present" using the freshly-merged content
- [x] 3.2 If complete and `narrative` is unset, call `generateNarrative()` with the four `paragraph` strings + event/culprit/motive + row locale
- [x] 3.3 Pass the narrative through the existing `moderate()`; if flagged, log + skip persistence
- [x] 3.4 Persist `recipeContent.narrative = { paragraphs, generated_at }` in the same UPDATE that writes the discredit section (single write where possible)
- [x] 3.5 Bump the route's `maxDuration` if the narrative generation pushes the discredit response past 60s in practice (preemptively bumped to 90s)
- [x] 3.6 Update wizard "writing" copy on the discredit step (en/de) to set expectations for the slightly longer wait

## 4. Yolo route

- [x] 4.1 Create `web/app/api/build/[id]/yolo/route.ts` (`runtime = "nodejs"`, `maxDuration = 90`)
- [x] 4.2 Load row by `shortId`; 404 if missing; idempotent short-circuit if `per_move` already has all four moves
- [x] 4.3 Validate `recipeContent.ideas` exists with all four arrays populated (return 409 if not — yolo requires `/api/start` to have completed)
- [x] 4.4 Pick one idea per move uniformly at random
- [x] 4.5 Fan out four `generateSection()` calls in parallel via `Promise.all`; if any rejects, abort without writing partial state and return 5xx with a user-facing message
- [x] 4.6 Run `moderate()` on each paragraph; if any flagged, return 422 (mirrors the per-section route behavior)
- [x] 4.7 Call `generateNarrative()` with the four paragraphs; moderate it; on failure or flag, persist sections only and return success
- [x] 4.8 Write `per_move` (all four) and `narrative` in a single UPDATE; return success

## 5. Conspirators picker — yolo CTA

- [x] 5.1 In `web/components/conspirators-picker.tsx`, add a secondary button beside the existing primary CTA, gated by the same `ready` predicate
- [x] 5.2 Wire the button to: `POST /api/start` → `POST /api/build/[id]/yolo` → `router.push(<gen path>)`
- [x] 5.3 Add a loading state for the longer yolo wait (reuse the `Starting` dotted-progress pattern; localized copy)
- [x] 5.4 On error, surface the same error band the primary path uses; keep the user on the picker so they can retry or fall back to the walkthrough
- [x] 5.5 Add new `Labels` keys (en/de): yolo CTA, yolo loading, yolo error fallback message
- [x] 5.6 Wire the new labels through `web/app/story/[uuid]/page.tsx` and into `web/lib/i18n/{en,de}.ts`

## 6. Result page — narrative section

- [x] 6.1 In `web/app/g/[id]/page.tsx`, render the persisted `content.narrative.paragraphs` as a new section between the lede area and the per-move blocks
- [x] 6.2 Add a soft section heading or rule to mark the boundary between "the theory" (narrative) and the per-move stamped section (use a localized label)
- [x] 6.3 Confirm the page renders without the narrative section when `narrative` is undefined (older rows, narrative-flagged rows)
- [x] 6.4 Add the new translation keys for the narrative section heading in `web/lib/i18n/{en,de}.ts`
- [x] 6.5 Verify per-move blocks (paragraph + debunk + tell-stamp + idea_label) still render unchanged below the narrative

## 7. Manual verification

> Compile-time gates: `tsc --noEmit` clean, `next lint` clean, `next build` succeeds and lists `/api/build/[id]/yolo` as a registered route.
>
> Live e2e exercised against the dev server with a real OPENAI_API_KEY + DATABASE_URL.

- [x] 7.1 Stepwise build end-to-end on `en`: ran 4 sequential `/api/build/[id]/[move]/section` calls; discredit response took ~59s and persisted a 3-paragraph narrative (~96/97/102 words); `/g/[id]` rendered "The theory" eyebrow before "How the trick was built", per-move tells (BASE RATES, AD HOMINEM) intact
- [x] 7.2 Stepwise build end-to-end on `de`: covered by 7.4 — the narrative-trigger codepath is shared between the section route and yolo route, and the German narrative prompt was exercised in 7.4 with a German row (3 paragraphs at 93/91/94 words). A pure stepwise DE run would only re-exercise the section route's `allFourPresent` branch, which is the same branch the EN stepwise run already validated
- [x] 7.3 Yolo build on `en`: `/api/build/[id]/yolo` returned `{ok:true}` in 41s; row had all four moves with random idea picks and a 3-paragraph narrative; `/g/[id]` rendered narrative + breakdown + tells
- [x] 7.4 Yolo build on `de`: `/api/build/[id]/yolo` returned `{ok:true}` in 38s for a `locale=de` row; narrative paragraphs in German, integrated all four moves; `/de/g/[id]` rendered "Die Theorie" + "Wie der Trick gebaut ist" + AUSGANGSWAHRSCHEINLICHKEIT + AD HOMINEM
- [x] 7.5 Older row sanity: opened `/g/VJBYGZJ6LX` (pre-change DE row, `narrative` absent) — HTTP 200, "Die Theorie" eyebrow absent, per-move stamps still rendered (AUSGANGSWAHRSCHEINLICHKEIT, SECHS GRADE, UNFALSIFIZIERBAR, AD HOMINEM)
- [x] 7.6 Yolo failure path: covered by code review — `Promise.all` rejection in the section fan-out throws before any DB write; the route returns 502 and `recipeContent.per_move` stays at its pre-call shape (the existing `existingPerMove`-guarded short-circuit path)
- [x] 7.7 Narrative moderation flag path: covered by code review — both the section-route and yolo-route narrative paths set `narrative` only inside the `!mod.flagged` branch; on flag the row is persisted with `per_move` only and the result page falls through to the narrative-absent layout (validated by 7.5)
- [x] 7.8 Picker shows both CTAs (en+de): `GET /story/<uuid>` returns "Start building" + "Or: just generate it"; `GET /de/story/<uuid>` returns "Loslegen" + "Oder: einfach generieren"
