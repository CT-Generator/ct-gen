## 1. Yolo route — partial state support

- [x] 1.1 In `web/app/api/build/[id]/yolo/route.ts`, replace the existing "regenerate all four moves" logic with a missing-only flow: compute `missingKeys = MOVE_KEYS.filter(k => !existingPerMove[k])`
- [x] 1.2 If `missingKeys.length === 0` AND `content.narrative?.paragraphs?.length`, return `{ ok: true, cached: true }` (existing idempotent path)
- [x] 1.3 If `missingKeys.length === 0` BUT narrative is missing, generate ONLY the narrative from the existing four paragraphs and persist
- [x] 1.4 Otherwise: pick random ideas only for `missingKeys`, fan out `generateSection()` calls only for those keys, run moderation only on the new paragraphs
- [x] 1.5 Build the merged `per_move`: spread existing entries first, then add new entries keyed by missing-move
- [x] 1.6 Generate the narrative from the merged four paragraphs (existing + new)
- [x] 1.7 Persist `per_move` (merged) and `narrative` in a single UPDATE — atomic
- [x] 1.8 Update the route's top comment to reflect the new partial-state semantics

## 2. Wizard skip-to-result button + i18n

- [x] 2.1 Add new dictionary keys to `web/lib/i18n/en.ts` `Dictionary` type: `wizard.skip_to_result_loading_h`, `wizard.skip_to_result_loading_dots`, `wizard.skip_to_result_failed`
- [x] 2.2 Add EN values: heading `"Filling in the rest…"`, dots `"Picking ideas, writing the missing moves, stitching the theory"`, failure `"Couldn't fill in the rest — try again."`
- [x] 2.3 Add DE values: heading `"Der Rest wird gefüllt…"`, dots `"Ideen werden gewählt, fehlende Schritte geschrieben, die Theorie zusammengewebt"`, failure `"Der Rest konnte nicht ergänzt werden — bitte erneut versuchen."`
- [x] 2.4 Add NL values (with `// FIXME: pass 2`): heading `"De rest wordt gevuld…"`, dots `"Ideeën kiezen, ontbrekende stappen schrijven, theorie aaneenvoegen"`, failure `"Kon de rest niet aanvullen — probeer het opnieuw."`

## 3. Wizard component changes

- [x] 3.1 In `web/components/build-wizard.tsx`, replace the `<Link>` for skip-to-result in the bottom nav with a `<button>`
- [x] 3.2 Add `useTransition` (already imported) and `useRouter` (already imported) — manage `skipPending` + `skipError` state
- [x] 3.3 On click: set up an `AbortController` with a 90s timeout, POST to `/api/build/${shortId}/yolo`, on success call `router.push(generationHref)`, on failure surface `wizard.skip_to_result_failed` inline
- [x] 3.4 While `skipPending`: render a small inline loading region near the bottom nav showing `wizard.skip_to_result_loading_h` plus a dotted-progress sub-line cycling `.`/`..`/`...`/`""` every 400ms (mirror the picker's `Starting` component pattern)
- [x] 3.5 Disable the `← Back` and step-of-N controls during the skip-pending state to prevent partial navigation while the API call is in flight
- [x] 3.6 Confirm the button preserves keyboard focus + aria semantics (it's still a `<button>`, focusable; loading state announced via inline text)

## 4. Compile gates

- [x] 4.1 `npx tsc --noEmit` clean
- [x] 4.2 `npx next lint` clean
- [x] 4.3 `npx next build` succeeds

## 5. Live verification (dev server + DB)

- [x] 5.1 Build a fresh row through `/api/start` (any locale) — confirm yolo from picker still works as before (full-yolo path still functions)
- [x] 5.2 Start a new build through the wizard, complete `anomaly` and `connection`, then click `Skip to result` on the dismiss screen → confirm the loading state appears, the API takes ~25–35s, and the result page shows: original `anomaly` + `connection` paragraphs preserved (matching the user's chosen ideas), random `dismiss` + `discredit` paragraphs, and a 3-paragraph narrative
- [x] 5.3 Same flow on `/de/build/[id]` — confirm German loading copy + German content
- [x] 5.4 Same flow on `/nl/build/[id]` — confirm Dutch loading copy + Dutch content
- [x] 5.5 Done-screen skip: complete all four moves, then click skip-to-result on the done screen → confirm short-circuit (no regeneration), navigates immediately
- [x] 5.6 Network failure: temporarily kill the dev server during a yolo-from-here POST, confirm the inline failure copy appears and the visitor stays on the wizard
- [x] 5.7 Confirm the row's `per_move` after a yolo-from-here has the user's actual ideas for the moves they completed, and randomly-picked ideas for the moves the system filled in

## 6. Final validation

- [x] 6.1 `openspec validate yolo-from-here --strict` passes
