## Why

`/g/[id]` is the single result page for both the tutored (stepwise) flow and the YOLO flow, but in practice YOLO-built generations sometimes land there with no standalone narrative — just the four move chunks — while tutored generations land with the full narrative finale + four-chunk breakdown. The two flows are supposed to produce identical reading experiences, and the YOLO output today is strictly inferior. We want the YOLO flow to be guaranteed to produce the same persisted shape (and therefore the same render) as the tutored flow before it sends the visitor to `/g/[id]`.

## What Changes

- `/api/build/[id]/yolo` SHALL treat narrative as a hard requirement of a successful YOLO build: if the narrative cannot be generated and persisted (transient model error, malformed output, moderation flag on the joined paragraphs), the route SHALL retry once and, if the retry also fails, return a 5xx/4xx to the client. The route SHALL NOT respond `{ ok: true }` to a YOLO request that produced moves-only state.
- **BREAKING** for the YOLO route's response semantics: existing spec scenario "Narrative generation fails after sections succeed" returns success today. It is changed to return an error so the picker / wizard surfaces the existing retry control instead of silently dropping the visitor onto a half-page.
- The client (picker yolo CTA + wizard skip-to-result) MUST keep treating a narrative-failure response the same as any other yolo failure — show the retry control, leave the row in a state the retry can recover.
- `/g/[id]` rendering is NOT changed by this proposal. Its branching on `content.narrative?.paragraphs?.length` is correct; the bug is that the YOLO route can hand it a row that lacks narrative.
- Existing rows in the DB that are already in the moves-only state SHALL be made recoverable: the YOLO route's idempotent path (all four moves present, narrative missing) already regenerates only the narrative. We keep that path and document it as the recovery surface for legacy rows.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `yolo-mode`: tighten the "Yolo failures surface a clear error..." requirement so narrative-generation failure is a YOLO failure (not a silently-degraded success), and add a single soft retry for narrative analogous to the discredit/dismiss soft retry the section path already has.

## Impact

- Code: `web/app/api/build/[id]/yolo/route.ts` (control flow + one new retry); `web/components/conspirators-picker.tsx` and `web/components/build-wizard.tsx` are unchanged because they already handle non-2xx by surfacing the inline error + retry control.
- Spec: `openspec/specs/yolo-mode/spec.md` (delta — the failure scenario flips from success-with-partial-state to error-with-retryable-state).
- Latency: narrative is one additional ~10–15s model call when retried. The existing 90s client timeout already accommodates this on top of the discredit/dismiss soft retry; worst-case end-to-end remains under budget.
- No DB migrations. No new env vars. No new dependencies.
- Tutored flow (`/api/build/[id]/[move]/section`) is untouched — its narrative-failure semantics (persist moves, leave narrative unset, return success) remain. The asymmetry is intentional: the tutored flow has already rendered four screens of content and shouldn't fail the whole build over a finale glitch; YOLO is one shot, and the visitor expects the full output.
