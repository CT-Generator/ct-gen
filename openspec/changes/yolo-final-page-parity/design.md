## Context

`/g/[id]` is locale- and shape-aware but otherwise a pure read of `recipeContent`. It renders the standalone narrative finale iff `content.narrative?.paragraphs?.length` is truthy (`web/app/g/[id]/page.tsx:284`), and the four-move breakdown iff `display.shape !== "legacy"` (`web/app/g/[id]/page.tsx:324`). Both tutored (`/api/build/[id]/[move]/section`) and YOLO (`/api/build/[id]/yolo`) flows ultimately land the visitor here; both flows are responsible for persisting both pieces of state.

In the tutored flow, narrative is generated as a side effect of completing the fourth move section — and if that narrative call fails, the section route still returns success (`web/app/api/build/[id]/[move]/section/route.ts:127-132`). This is fine because by the time the user reaches that point, they have already invested four screens of decisions; failing the whole build on a finale glitch would be a worse UX than landing on the narrative-absent layout.

In the YOLO flow, the user has not invested any per-move decisions — they clicked one button and expect the full output. Today the YOLO route also tolerates narrative failure: it logs and persists the row with `per_move` populated but `narrative` undefined (`web/app/api/build/[id]/yolo/route.ts:251-261`), then returns 2xx. The visitor lands on `/g/[id]` and sees only the four-chunk breakdown — strictly less than the tutored output that motivated the build. This is the gap the proposal closes.

The existing YOLO spec already encodes the lenient behavior in scenario "Narrative generation fails after sections succeed" (`openspec/specs/yolo-mode/spec.md:90-94`). That scenario is what we're flipping.

## Goals / Non-Goals

**Goals:**
- A successful (non-cached) YOLO POST guarantees a persisted row whose `/g/[id]` render is structurally identical to a successful tutored build's render — narrative finale present, four-move breakdown present.
- Add a single narrative retry inside the YOLO route (analogous to the existing discredit/dismiss soft retry) so transient failures don't surface to the user.
- Preserve the existing idempotent recovery path: rows already in the "moves complete, narrative missing" state can be repaired by a subsequent YOLO POST that hits only the narrative branch.
- Keep the existing failure-surface UX: picker + wizard already render an inline retry control on non-2xx, no client changes needed.

**Non-Goals:**
- Change tutored flow narrative semantics. The asymmetry (tutored persists moves-only on narrative failure; YOLO errors) is intentional and stays.
- Change `/g/[id]` rendering. Its branching is correct; the bug is upstream.
- Re-prompt narrative with a softer briefing (cf. discredit soft retry). For now, the retry uses the same inputs — moderation flags on a four-paragraph narrative seem rare enough that a same-input retry is sufficient. If telemetry shows otherwise, a softer narrative briefing is a future change.
- DB migration to repair existing partial rows. They self-heal on next YOLO POST (rare event in practice; can also be backfilled manually if needed).

## Decisions

### Treat narrative as part of the YOLO success contract

**Decision**: A 2xx response from `/api/build/[id]/yolo` MUST imply both `per_move` (all four moves) AND `narrative.paragraphs` are persisted. If we cannot produce narrative, we return non-2xx and let the client surface the existing retry control.

**Why over the alternative**: The alternative is making `/g/[id]` "generate narrative on read if missing." That would (a) introduce model calls inside a page render path that's currently pure, (b) make the page non-cacheable, and (c) move the failure surface from a clearly retryable POST into a server-render error that the user can't recover from without a page reload. Keeping the write-time guarantee is simpler, faster, and matches how the rest of the codebase treats generation as a build-time concern.

### Single retry, same inputs

**Decision**: When narrative throws, returns invalid output, or is moderation-flagged, retry once with the same four-paragraph inputs. If the retry also fails, persist moves-only and return non-2xx.

**Why**: The existing discredit/dismiss soft retry has a different shape — those moves have inflammatory-trope failure modes that benefit from a softer briefing. Narrative failures are different in character: when they happen they're usually transient model glitches (timeouts, malformed JSON) rather than systematic moderation hits on the input set. A same-input retry is the cheapest thing that closes the transient-failure gap. Reserve a soft-briefing variant for later if telemetry shows persistent moderation issues.

**Latency budget**: One extra `generateNarrative` + `moderate` is ~10–15s. The existing 90s client timeout already accommodates the discredit/dismiss soft retry (~15s extra) on top of the parallel section fan-out (~30s) and the original narrative call (~15s). Worst-case path is therefore ~75s, under budget.

### Persist moves on narrative-retry failure (don't roll back)

**Decision**: If both narrative attempts fail, persist the merged `per_move` and return non-2xx. Do NOT roll back the per-move write.

**Why**: Two reasons.
1. The idempotent path in the YOLO route ALREADY handles the "all four moves, no narrative" state correctly — it skips section generation and goes straight to narrative. So persisting moves leaves the row in a state that a retry-click recovers in one ~15s call instead of redoing the ~30s section fan-out.
2. The spec currently allows this state for tutored builds whose narrative fails. Allowing it transiently in the YOLO flow (as the post-failure state, not as a successful outcome) keeps the two flows consistent at the data layer.

The client already handles non-2xx with the retry control; the retry will hit the idempotent narrative-only branch and resolve quickly.

### Error code mapping

**Decision**:
- Narrative throws (network / model error) → 502 with `err_engine_glitched_yolo`
- Narrative moderation-flagged on both attempts → 422 with `err_engine_refused_yolo`

**Why**: Matches the existing section-failure mapping in the same route (502 for throw, 422 for moderation). No new error labels needed; the picker and wizard already render these messages.

## Risks / Trade-offs

- **Risk: YOLO becomes user-visibly more flaky.** Today, narrative failures land the user on a working (if degraded) page. After this change, they see an error + retry control. → **Mitigation**: The single retry catches the majority of transient failures before the user sees anything. The retry click hits the fast idempotent branch (~15s) so recovery is cheap. And the degraded page was already a known UX gap (this proposal); silently shipping it is worse than asking the user to retry.
- **Risk: A persistent moderation hit on narrative inputs blocks the whole YOLO build.** → **Mitigation**: Logged as `failure_category=narrative_retry_also_failed`. If we see this pattern in telemetry, follow-up change adds a softer narrative briefing analogous to discredit/dismiss. Until then, the user falls back to the tutored flow (which tolerates narrative failure) or retries.
- **Risk: Existing rows in the "moves-only" state.** Anything built before this ships that landed in that state stays in that state on disk. → **Mitigation**: They self-heal on the next YOLO POST (idempotent narrative-only branch). No migration needed. If we want to be proactive, a one-off backfill script can scan for rows with `per_move` complete and `narrative` missing and re-invoke the route; out of scope for this change.

## Migration Plan

- Ship the route change. No DB migration, no flag.
- Client surfaces (picker + wizard) already render the retry control on non-2xx — no client deploy coupling.
- Rollback strategy: revert the single route file. The lenient prior behavior returns immediately; rows persisted under the new policy remain valid (they're a strict subset of the old data shape).
