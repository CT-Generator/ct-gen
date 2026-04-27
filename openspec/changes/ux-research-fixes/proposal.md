## Why

The April 2026 UX research (`docs/ux-research/2026-04/report.md`) ran three persona walkthroughs against the live site and surfaced a prioritized list of ten issues. Most of them are S/XS effort and would close the visible gaps left after launch. The two High-severity items concentrate on the same pedagogical seam — *form is necessary but not sufficient* and *Move 03 is the most quotable-out-of-context paragraph* — both surfaced (in different language) by all three personas. Shipping these now closes the most defensible UX/copy debt before any larger feature work begins.

This change implements seven of the ten flagged items: the two High-severity ones, the Medium-severity Move 04 tell-sharpening, the home-hero copy hoist, the boilerplate-opener prompt fix, the academic-paper link on /recipe, and the /quiz orphan-route decision. The three deferred items are tracked in the report and will be a separate change: items 5/7 (aesthetic title and progress-bar polish) and item 10 (Remix-this routing).

## What Changes

- **NEW UI element on /g/[id]:** A small crop-resistant "the tell" stamp inside the bottom-right of each move's theory paragraph (e.g. `MOVE 03 · UNFALSIFIABLE`). Survives a horizontal screenshot of just the theory text. Replaces the protective role the structurally-non-removable disclaimer used to play, in a less visually heavy way.
- **NEW paragraph on /recipe:** A 60–90 word "the recipe is necessary but not sufficient" caveat — placed before the four-move list — explaining that real critics of real institutions sometimes use these moves with substance behind them, and that the recipe trains pattern recognition, not refutation.
- **CHANGED openai prompt for Move 04 (discredit):** The debunk MUST end with a 4–8 word standalone sentence whose only job is to name the tell (`Ad hominem.` / `Attacking the messenger, not the message.`). Brings Move 04 in line with the crispness of moves 01–03.
- **CHANGED openai prompt for sections (all moves):** Forbid consecutive moves from starting with the same imperative ("Look at...", "Look closer...", "Look closely..."). Adds variety the personas all noticed.
- **NEW copy on / hero:** A single-sentence subheading under the H1 lifting the strongest line from /about: *"The best way to learn to spot a conspiracy theory is to make one yourself."*
- **CHANGED footer of /recipe:** A parenthetical link to the academic paper alongside the existing Substack link, for readers who want the underlying research.
- **REMOVED route /quiz:** The route is currently orphaned (unlinked from nav, kept "for later thinking"). Decision time: delete the route + components, archive the curated real-conspiracy data, free the dead code. If we want a quiz back later, it will be a deliberate new change.

## Capabilities

### New Capabilities

- `pedagogical-safeguards`: Defines the design-level guarantees that the recipe lesson lands without the failure modes the UX research surfaced — crop-resistant move-tell stamps inside each theory paragraph; the form-vs-substance caveat on /recipe; the per-move-tell sharpness requirement; opener-variety prompt constraint.

### Modified Capabilities

<!-- The earlier v2-rebuild specs (theory-generation, attribution-and-brand) were never archived; this change adds new requirements as a separate capability rather than re-opening those. The new `pedagogical-safeguards` capability layers atop the existing surface. -->

## Impact

- **Code touched:** `web/app/g/[id]/page.tsx` (move-tell stamp), `web/app/recipe/page.tsx` (caveat paragraph + paper link), `web/app/page.tsx` (hero subheading), `web/lib/openai.ts` (Move 04 prompt + opener-variety constraint), `web/components/move-tell-stamp.tsx` (NEW small component).
- **Code removed:** `web/app/quiz/page.tsx`, `web/components/quiz-game.tsx`, `web/data/real-conspiracies.json`. The capability spec from `v2-rebuild` for `quiz-mode` becomes a removed-requirement marker in this change's spec deltas.
- **Backward-compatible:** existing /g/[id] permalinks (including the 2,681 v1-migrated rows and the three persona runs) continue to render. The new "the tell" stamp shows on rows with recipe-tagged shape; legacy rows render as before.
- **No DB migrations.** All changes are in app code or copy.
- **No deploy-time changes.** `./infra/deploy.sh` works unchanged.
- **Token cost: zero.** No new LLM calls. Prompts are tuned in place; future generations just produce slightly different output.
- **Future generation drift:** Existing per-move sections in the DB (3 v2 + 3 personas + 3 historical) keep their old phrasing; the prompt change only affects new generations going forward. We don't backfill.
