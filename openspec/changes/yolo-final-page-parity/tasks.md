## 1. YOLO route — narrative becomes a hard requirement

- [x] 1.1 In `web/app/api/build/[id]/yolo/route.ts`, extract the narrative generation block (currently lines ~225–262) into a local helper that returns one of `{ kind: "ok", narrative }`, `{ kind: "moderation_flagged" }`, or `{ kind: "error", err }` so the success/retry/fail branches stay readable.
- [x] 1.2 Add a single retry: if the first `generateNarrative` call throws OR returns invalid output (empty `paragraphs`) OR the joined output is moderation-flagged, log `failure_category=narrative_retry_attempted` (shortId only) and call `generateNarrative` again with the same inputs.
- [x] 1.3 On retry success, log `failure_category=narrative_retry_succeeded` and use the retry's `paragraphs` for the persisted narrative.
- [x] 1.4 On retry failure (throw, invalid output, or moderation flag), log `failure_category=narrative_retry_also_failed` (shortId + which subcategory: `throw` / `moderation` / `invalid_output`).
- [x] 1.5 After narrative retry failure, persist the merged `per_move` to the DB (so the row is in the recoverable "moves complete, narrative missing" state) and then return the appropriate non-2xx response: `502` + `errLabels.err_engine_glitched_yolo` for throw/invalid output, `422` + `errLabels.err_engine_refused_yolo` for moderation. Do NOT persist a narrative field in this case.
- [x] 1.6 Ensure the existing all-complete idempotent short-circuit at the top of the route (`missingKeys.length === 0 && haveNarrative`) is unchanged.
- [x] 1.7 Ensure the existing "moves complete, narrative missing" recovery path (sections branch skipped, narrative branch entered) uses the same retry policy as the fresh path.

## 2. Verify client error handling is unchanged

- [x] 2.1 Read `web/components/conspirators-picker.tsx` (the `postYolo` + `retryYolo` paths) and confirm a 502 / 422 response surfaces the existing inline error + retry control without changes. No edit needed unless the assertion fails.
- [x] 2.2 Read `web/components/build-wizard.tsx` (the skip-to-result `postYolo` path) and confirm the same. No edit needed unless the assertion fails.

## 3. Tests

- [x] 3.1 Add a unit / integration test for the YOLO route covering: narrative throws on first attempt, succeeds on retry → 2xx, narrative + moves persisted.
- [x] 3.2 Add a test for: narrative moderation-flagged then passes on retry → 2xx, narrative + moves persisted.
- [x] 3.3 Add a test for: narrative throws on both attempts → 502, `per_move` persisted, no `narrative` in `recipeContent`.
- [x] 3.4 Add a test for: narrative moderation-flagged on both attempts → 422, `per_move` persisted, no `narrative`.
- [x] 3.5 Add a test for the idempotent narrative-only path: row already has all four moves but no narrative → first attempt fails → retry passes → 2xx with narrative persisted.
- [x] 3.6 Add a test that confirms the all-complete short-circuit still returns `{ ok: true, cached: true }` with no model calls.

## 4. Manual verification

- [ ] 4.1 Run the dev server. Trigger a fresh YOLO build from `/story/[uuid]`. Confirm `/g/[id]` renders the narrative finale (the `narrative_eyebrow` section) above the four-move breakdown. — _Partial: dev server boots cleanly via `npm run dev`, the YOLO route compiles with no errors, and a POST reaches the handler. Local Postgres was unreachable (ECONNREFUSED) so the full E2E render could not be exercised by the assistant; needs human verification against a live DB._
- [ ] 4.2 Trigger a tutored build for a comparable culprit/event/motive. Confirm `/g/[id]` renders the same two sections (narrative finale + breakdown) and that the YOLO version's structural shape matches. — _Blocked on the same local-DB gap as 4.1; needs human verification._
- [ ] 4.3 (Optional, if feasible) Simulate a narrative failure by temporarily breaking `generateNarrative` and confirm the picker surfaces the inline error + retry control, and that retrying immediately recovers (idempotent narrative-only branch). — _Covered by the unit tests in `web/tests/yolo-route.test.ts` (scenarios 3.1, 3.2, 3.3, 3.4, 3.5). End-to-end picker rendering still benefits from human verification._

## 5. Update the existing spec on archive

- [ ] 5.1 When this change archives, ensure `openspec/specs/yolo-mode/spec.md` reflects the modified failure-mode scenario and the new narrative-retry requirement (handled automatically by the archive flow; no manual edit needed here).
