## Context

The wizard at `/build/[id]` renders five screens (anomaly → connection → dismiss → discredit → done). Each screen has a bottom nav with three controls: `← Back`, `Step N of 5`, and `Skip to result →`. The skip-to-result control is currently a `<Link href={generationHref}>` — clicking it navigates to `/g/[id]` immediately with whatever's in `per_move`.

The yolo route (`/api/build/[id]/yolo`) was authored for the picker's "skip the walkthrough" CTA. It assumes a fresh row with empty `per_move`. Today it short-circuits if all four moves are present, but otherwise REGENERATES all four — overwriting any existing `per_move` entries. That's fine for the picker entry-point (always a fresh row) but wrong for the wizard's mid-build skip (would discard the user's actual choices).

## Goals / Non-Goals

**Goals:**
- Mid-wizard "Skip to result" preserves the user's per-move choices and yolo-fills the missing moves.
- The picker yolo CTA continues to work exactly as today (fresh row → all-four-moves yolo).
- The yolo route is idempotent: visiting it on a row that already has all four moves + narrative returns success without regenerating anything.

**Non-Goals:**
- Server-side push streaming of section progress during the wait (would require SSE; deferred).
- Per-move "regenerate" buttons on the result page (separate feature; out of scope).
- Changing the visual position or styling of the "Skip to result" affordance.

## Decisions

### Yolo route handles partial state

Replace the current "regenerate all four moves" loop with a missing-only loop:

```ts
const existingPerMove = content.per_move ?? {};
const missingKeys = MOVE_KEYS.filter((k) => !existingPerMove[k]);
const allComplete = missingKeys.length === 0;

if (allComplete && content.narrative?.paragraphs?.length) {
  return NextResponse.json({ ok: true, cached: true });
}

// Pick + generate only for missing moves
const picks: Partial<Record<MoveKey, string>> = {};
for (const k of missingKeys) picks[k] = pickRandom(content.ideas[k]);

const generatedEntries = await Promise.all(
  missingKeys.map((k) => generateSection({ ..., moveKey: k, chosenIdea: picks[k]!, prior: {} })),
);

// Build the merged per_move
const newPerMove = { ...existingPerMove };
for (let i = 0; i < missingKeys.length; i++) {
  const k = missingKeys[i]!;
  newPerMove[k] = { idea: picks[k]!, paragraph: generatedEntries[i].paragraph, debunk: generatedEntries[i].debunk };
}

// Narrative from all four paragraphs (existing + new)
const narrative = await generateNarrative({ paragraphs: { anomaly: newPerMove.anomaly!.paragraph, ... } });
// ... persist
```

If `allComplete` but narrative is missing (edge case: stepwise build whose narrative was moderation-flagged), the route generates only the narrative.

**Alternative considered:** keep the "always all four" path and add a separate `/api/build/[id]/finish` route. Rejected — duplicates 80% of the logic; the right abstraction is "yolo = fill what's missing", with "fresh row" as the special case where everything is missing.

### Wizard: replace `<Link>` with a button + abort-controlled fetch

Today: `<Link href={generationHref}>{labels.skip_to_result}</Link>`. New behavior: a `<button>` that calls a small client-side handler:

```tsx
function handleSkipToResult() {
  startTransition(async () => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 90_000);
      await fetch(`/api/build/${shortId}/yolo`, { method: "POST", signal: ctrl.signal });
      clearTimeout(t);
      router.push(generationHref);
    } catch (err) { /* set error label, stay on page */ }
  });
}
```

Loading state: while the fetch is in flight, swap the button label to `wizard.skip_to_result_loading_h` and show a small dotted-progress line below the wizard heading using the existing dotted-progress visual pattern (the picker already uses `Starting` for this). Reuse that pattern inline.

**Alternative considered:** show a full-page interstitial during the wait. Rejected — the user is already on a page that's mid-flow; an interstitial is more intrusive than a contextual loading state.

**Alternative considered:** keep the `<Link>` and let the visitor land on a half-built `/g/[id]` (current behavior). Rejected — the persona feedback says this looks half-broken.

### Loading copy: heading + dotted-progress sub-line

```
EN: "Filling in the rest…"  /  "Picking ideas, writing the missing moves, stitching the theory"
DE: "Den Rest wird gefüllt…" / "Ideen werden gewählt, fehlende Schritte geschrieben, die Theorie zusammengewebt"
NL: "De rest wordt gevuld…"  / "Ideeën kiezen, ontbrekende stappen schrijven, theorie aaneenvoegen" (FIXME pass 2)
```

The dotted sub-line cycles `.`, `..`, `...` like the existing picker `Starting` component.

### `prior: {}` for newly-generated moves

The existing `generateSection()` accepts a `prior` map naming earlier moves' paragraphs (used by the prompt for "no two consecutive moves repeat an imperative opener"). For yolo (full or partial), we pass `prior: {}` because moves are generated in parallel — there's no "earlier move" deterministic ordering. This is consistent with the current full-yolo behavior. We accept that yolo-from-here might produce a section opener similar to the user's existing moves, since the model doesn't see them. This is the same trade-off full-yolo already accepts.

### Done-screen no-op

When the wizard is on the `done` screen, all four `per_move` entries exist. The yolo route short-circuits to `{ ok: true, cached: true }`. The button still POSTs (one extra round-trip ~50ms) then navigates. We accept this minor latency rather than special-casing the done screen on the client — keeps the click-handler logic uniform.

## Risks / Trade-offs

- **[Long click-wait on Skip-to-result]** → 2-missing-move yolo takes ~25s; 4-missing takes ~40s. User clicks once and waits. Mitigation: clear loading state with dotted-progress copy. Net: similar total time to completing the wizard, but the wait is concentrated.
- **[Existing moves' opener-variety constraint not enforced for new moves]** → The new moves are generated in parallel without seeing the existing user-chosen paragraphs. They might start with the same imperative opener. Acceptable per the existing yolo trade-off.
- **[Edge: row with no `ideas` (failed `/api/start`)]** → The route returns 409 (existing behavior). The client surfaces the error. Stepwise users hit this only if `/api/start` failed but the row was created — extremely rare.
- **[Idempotency on done-screen click]** → Two POSTs in quick succession (e.g. user double-taps the button) could race. The route is idempotent for the all-complete case, so the second call returns `{ cached: true }`. Safe.
- **[Network failure mid-call]** → AbortController fires after 90s; the client surfaces an error and the visitor stays on the wizard. They can retry. The row's per_move is whatever it was before the call — no partial-write damage (the route either persists the full merged state or returns an error before persisting).
