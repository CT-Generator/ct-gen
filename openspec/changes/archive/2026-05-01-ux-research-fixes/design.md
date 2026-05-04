## Context

Three persona walkthroughs (Aisha, Tomáš, Wei) generated `docs/ux-research/2026-04/report.md`. The report's pedagogical bottom line: *the recipe lands*. Its top concern: when the structurally-non-removable disclaimer band was removed earlier in the build cycle, no replacement safeguard took its place — and the most teachable move (Move 03, "dismiss counter-evidence") is also the one most likely to be screenshotted out of context. The personas independently described this risk in three voices.

The second sharpest finding: at /recipe, the recipe-as-decoder lesson lacks a *form-vs-substance* caveat. Wei said it most directly: a real argument can wear the form. Without that caveat, a reader who has internalized the four moves may dismiss legitimate institutional criticism on form alone.

The remaining items are surface-polish: a crisper Move 04 tell, varied openers in the conspiracist voice, a hoisted hero line, a paper link, a /quiz route to delete.

This change is deliberately small. The report explicitly said *don't break what's working*. The target is to ship the report's top tier in one focused pass.

## Goals / Non-Goals

**Goals:**
- Reintroduce a crop-resistant safeguard on /g/[id] that survives a horizontal screenshot of just a theory paragraph.
- Add the form-vs-substance caveat to /recipe before the four-move list.
- Sharpen Move 04's debunk to land its tell in a single short sentence.
- Vary conspiracist-voice openers across moves so consecutive paragraphs don't both start with "Look".
- Hoist the strongest /about line into the home hero as a subheading.
- Add a paper link on /recipe alongside the existing Substack link.
- Delete the orphaned /quiz route + components + data.

**Non-Goals:**
- Reintroducing the heavy disclaimer band. The report did not call for that — it called for something less visually loud that still survives a screenshot.
- Implementing item 10 ("Build another" → "Remix this with same story"). Medium effort. Separate change.
- Items 5 and 7 (move title voice, progress-bar visual weight). Aesthetic-only. Separate change later.
- Backfilling existing rows with the new prompt-style output. Old generations keep their old phrasing.
- Implementing a real PDF for /teach (lesson plan still uses Print-to-PDF as designed).
- Localization, accessibility audits, or any item flagged in the "Coverage gaps" section of the report. Those are next-round work.

## Decisions

**Decision 1: The "tell stamp" lives in the bottom-right of each theory paragraph, inside the same DOM container.**
A small monospace caps badge anchored at `position: relative` on the theory `<div>` and `position: absolute; bottom: 8px; right: 12px;` on the badge. Reads e.g. `MOVE 03 · UNFALSIFIABLE`. Renders in the move's accent color at ~10px. Sits inside the soft-tinted theory background, so a horizontal crop that captures any of the theory text also captures the badge. Replaces the role of the now-deleted disclaimer band — *not* a full disclaimer, just a flag-of-genre that says "this is a fake conspiracy theory, and the move it's playing is named X." The pedagogical content (what unfalsifiability is) is on /recipe; the stamp's job is just labeling.

Considered alternatives: (a) bring back the disclaimer band — ruled out by the user explicitly two iterations ago. (b) put the stamp at the top of each move — looks like a section heading and gets cropped first. Bottom-right is the most-screenshot-resistant corner because most casual screenshots are taken without scroll-to-bottom-first.

**Decision 2: The form-vs-substance caveat goes between the page lede and the four-move list on /recipe.**
Placement matters: AFTER the user has read "Conspiracy theories follow four moves" (sets the frame) but BEFORE they encounter the four-move definitions (modulates how they read them). Tone is matter-of-fact, not hedging — short paragraph, no scare quotes. The caveat names the failure mode plainly: *the recipe trains pattern recognition, not refutation*.

**Decision 3: Move 04 prompt change is the smallest possible diff.**
Add to the existing system prompt for the discredit move only: `End the debunk with a single 4–8 word sentence whose only job is to name the move's tell (e.g. "Ad hominem." or "Attacking the messenger, not the message.").` This produces output that ends crisply without needing to alter the rest of the structure. Other moves end on the right kind of phrase already; we don't need to touch their prompts.

**Decision 4: Opener-variety constraint goes on the system prompt for ALL section calls.**
Sentence: `Vary the opening clause; do not start consecutive paragraphs across this build with "Look at...", "Look closer...", or any imperative-pointer that the prior moves used.` The model can't see prior moves' OPENERS without us putting them in the prompt — but `prior` is already in the user message via `priorText`. Add a one-line nudge to system asking it to vary, and the model handles it. Belt-and-suspenders: in the user message, when prior moves exist, add `(Earlier moves opened with: <first-3-words-of-each>. Do not repeat the same imperative.)`.

**Decision 5: Home hero gets a single-line subheading, not a re-design.**
The H1 stays "Build a conspiracy theory from scratch." The new sub line goes immediately under it: *"The best way to learn to spot a conspiracy theory is to make one yourself."* Same italic gray treatment we already use for the existing description below. No layout change.

**Decision 6: Paper link is an inline parenthetical, not a separate row.**
On /recipe, the existing reference says "set out at length in [this blog post](substack)." Update to: "set out at length in [this blog post](substack), with the academic version at [this paper](drive)." One sentence. The paper is for Wei and her cohort; it doesn't need promoted visual weight.

**Decision 7: /quiz route + components + data are deleted, not soft-archived.**
Deleting code is the right hygiene move; if quiz returns later it will be a deliberate new feature with up-to-date design choices, not a half-done revival. The report notes this directly: *"either link it back from nav with the spec's safeguards, or 404 it explicitly. Decide before the next code change to avoid surprise."* Deciding now: delete.

## Risks / Trade-offs

- **[Risk] The tell stamp is missed on small viewports.** On mobile, position-absolute corners can clip into the next move's container or overlap text. → Mitigation: design the stamp to use `position: absolute; bottom: 6px; right: 10px;` with `padding: 2px 6px;` and a slightly opaque background (the move's `softHex`) to keep contrast, AND add a visual fallback `pointer-events: none;` so it can't trap touch. Test at 375px width.
- **[Risk] Existing rows in the DB never see the new tell stamps because their content was generated under old prompts.** Not actually a risk — the stamp is rendered by the *page*, not by the model. The page reads `MOVES[i].n` and `MOVES[i].title.toUpperCase()` for the stamp text. Every row gets the stamp.
- **[Risk] The /recipe caveat reads as backpedaling.** Tone matters here. → Mitigation: the caveat is *additive*, framed as "the recipe is for noticing, not arguing" — sharpens the value rather than undercuts it. Wording draft included in tasks.md.
- **[Risk] Deleting /quiz removes a working code path that someone has bookmarked.** No real users have bookmarks; the route was never in the nav. Server returns 404 going forward; no action needed.
- **[Trade-off] We're not backfilling existing rows with sharper Move 04 endings.** Old phrasing stays. The 2,681 v1-migrated rows don't have Move 04 sections at all (legacy_text shape), so they're unaffected. The 3 v2-built + 3 persona rows keep their existing phrasing. New generations starting today land sharper.
- **[Trade-off] Item 10 ("Remix this") is deferred.** That request needs URL state + form prefill on /story/[uuid] and a reasonable amount of plumbing. Putting it in this change would balloon the diff. Track for next change.

## Migration Plan

Not applicable — pure code change. Deploy via `./infra/deploy.sh SKIP_MIGRATION=1` after merge.

**Verification on deploy:**
1. `/g/<one-of-the-existing-permalinks>` shows the new tell stamp at bottom-right of each move's theory paragraph.
2. `/recipe` shows the form-vs-substance caveat between the lede and the four-move list, with both Substack and paper links in the lede.
3. `/` shows the new subheading under the H1.
4. `/quiz` returns 404.
5. New generation: walk a fresh build to /g/[new-id]; Move 04 ends with a crisp 4–8 word tell sentence; consecutive moves don't both start with "Look at...".

## Open Questions

- The exact wording of the form-vs-substance caveat. A draft is in tasks.md; we should land that text rather than over-iterate.
- Should the tell stamps link to /recipe#move-03 etc.? Probably yes for accessibility, but anchors don't exist in the recipe page yet. Defer until we add anchors. Stamps are non-clickable for now.
- Whether the paper-link rewording on /recipe should also reach `/about`'s credit block (which says "inspired by a blog post by Maarten"). Defer; /about is for credit, not for citation.
