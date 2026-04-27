# UX research report — three personas, April 2026

**One-line summary:** The four-move recipe lands as a teaching tool for two of three personas immediately, and for the third (the most skeptical) it lands with a meaningful caveat — the design is broadly working, with a tightly bounded normalization risk on Move 03.

**Permalinks generated during the test:**
- [/g/DFZHNE5CQN](https://conspiracy-generator.duckdns.org/g/DFZHNE5CQN) — Aisha's run (ultra-processed foods × Juice Cartel × art and culture)
- [/g/68NDRBPQGG](https://conspiracy-generator.duckdns.org/g/68NDRBPQGG) — Tomáš's run (voter identity survey × Cultural Architects × world leaders)
- [/g/BBVQ7B79BM](https://conspiracy-generator.duckdns.org/g/BBVQ7B79BM) — Wei's run (UK spy agencies × JASON Group × total surveillance)

## Method

Three AI-driven personas drawn from the brand brief's three concentric audience tiers — curious general public, classroom educator, professional disinfo researcher — each with a one-paragraph profile written before the walkthrough began. Each persona ran a real wizard build against the live production site at `https://conspiracy-generator.duckdns.org/`, picking a curated triple, walking all four move screens, and ending on `/g/[id]`. Each walkthrough was annotated turn-by-turn in the persona's voice and ended with an open-prompt reflection on what the persona learned. Cost: ~$0.07 in OpenAI tokens for 15 generations across the three runs (gpt-5-mini at low reasoning effort). No `/api/rate` calls were issued; ratings totals on `/stats` are unchanged. The walkthroughs are AI simulations, not user studies — useful for triage, not as final evidence.

Full transcripts: [persona-1.md](./persona-1.md), [persona-2.md](./persona-2.md), [persona-3.md](./persona-3.md).

## Pedagogical effect

The recipe lands. All three personas finished the wizard able to name at least two of the four moves with their associated "tells" — *base rates*, *six-degrees-of-separation*, *unfalsifiable*, *ad hominem*. None of them entered the page knowing those names attached to the four moves; all three left with them attached. Aisha said this most plainly: *"I leave with two phrases stuck in my head that I didn't have when I sat down: base rates and unfalsifiable."* Tomáš listed three of the four names by the end of his reflection. Wei, the most skeptical, validated the recipe-faithfulness of the operationalization explicitly — *"a faithful surface restatement"* of the published recipe.

The mechanism that did the work, across all three runs, was the same: the user picks an *idea* (a button), watches the conspiracist paragraph generate, and reads the debunk *next to it*. The ideas-anchored-in-the-story constraint is doing a disproportionate share of the pedagogical lift. Tomáš named this directly: *"This is exactly the kind of selection my classroom would benefit from: students would feel they were doing real reasoning, not picking from a generic list."* Aisha noticed it as relief — the buttons reference things she had just read. Wei verified it was real and not theatre. **Strong signal across all three:** the per-move idea buttons that quote story-specific facts are the design's central pedagogical lever.

The debunk column is doing measurable work. All three personas read it (none skipped it), and two of three quoted phrases from it in their reflections. The naming of "the tell" at the end of each debunk paragraph is the structure that makes a take-away portable — a one-line memorable phrase that survives when the surrounding paragraph fades. The current implementation lands "the tell" in 3 of 4 moves cleanly; in Move 04, the closing line of the debunk is a longer multi-sentence framing rather than a crisp tell, which is a lost opportunity.

The lesson does not equally land. **Strong signal across all three:** Move 03 (dismiss counter-evidence) is the most pedagogically valuable AND the most dangerous to read in isolation. Aisha called it *"the most disturbing on the page"*; Tomáš flagged screenshot-out-of-context risk; Wei worried about normalization — *"a real argument can wear [the form]"*. This is not a failure mode of the design; it is an inherent feature of the move itself. The site does not currently teach users that *form is necessary but not sufficient* — that recognizing a move-shape doesn't license dismissing the argument's substance. Adding this caveat to `/recipe` would close the gap.

The build is enjoyable. All three personas converged on this — none described the experience as homework. Aisha used the word "play"; Tomáš said his class would *find this funnier than the textbook*; even Wei noted "the assembled view at the permalink is the strongest part of the build, narratively." This is a genuine pedagogical asset (the recipe is more memorable through laughter than through warning), but it carries the trade-off that the most polished move-paragraphs are also the most quotable out-of-context.

**Weak signal (one persona only):** Wei's concern that a reader could mistake the form-detection lesson for a license to dismiss legitimate critique. Tomáš touched on a related concern from a screenshot angle. Aisha did not surface this concern. It is real but not yet broadly felt — flag for /recipe copy.

## Prioritized change suggestions

| # | Issue | Where | Severity | Effort | Notes |
|---|---|---|---|---|---|
| 1 | The "form is necessary but not sufficient" caveat is missing — readers may take the recipe as a license to dismiss criticism that *wears* the form. | /recipe | High | S | Wei surfaced as a normalization-risk concern; Tomáš touched it indirectly. Add one paragraph to /recipe before the four moves: real critics of real institutions sometimes use these moves with substance behind them; the recipe trains pattern recognition, not refutation. |
| 2 | Move 03 (dismiss) is the most quotable-out-of-context paragraph and the disclaimer that previously protected against this is gone. | Permalink page /g/[id] | High | S | All three personas flagged a version of this; Tomáš named it most concretely (student screenshot to chat group). Lightweight reintroduction option: a small inline "the tell" badge inside each move's theory paragraph that survives a horizontal crop, e.g. a small caps mono "MOVE 03 · UNFALSIFIABLE" stamp at the bottom-right of the theory block. Doesn't reintroduce the heavy disclaimer band. |
| 3 | Move 04 (discredit) debunk closes with multi-sentence framing instead of a one-line tell. | /lib/openai.ts SECTION prompt for moveKey=discredit | Medium | S | The other three moves end on a crisp memorable phrase ("base rates", "six-degrees", "unfalsifiable"). Move 04's tell is "ad hominem" and should land in a final 4-6 word sentence of its own. Tighten the prompt for the discredit section. |
| 4 | The `/about` line *"the best way to learn to spot a conspiracy theory is to make one yourself"* is the strongest copy on the site, but it lives below the fold of /. | / hero | Medium | XS | Aisha: *"that's what I would have led with on the home page."* Add this as a one-sentence subheading under the hero. |
| 5 | The four-move subtitles read well; the move *titles* on the wizard screens read slightly schoolmarm-ish. | /build/[id] move screens | Low | S | "**Hunt anomalies.** Pick something ordinary and frame it as suspicious." → tighten to keep voice consistent with the subtitles, which are demonstrably stronger. Same on /recipe. |
| 6 | The conspiracist-voice paragraphs sometimes start with "Look at..." or "Look closer..." (boilerplate). | /lib/openai.ts SECTION prompt | Low | S | All three personas' first move began with a "Look..." opener. Add to the system prompt: "Vary the opening; do not start consecutive moves with the same imperative." |
| 7 | The progress bar at the top is reassuring but the step labels use mono-uppercase that competes with the move titles below. | /build/[id] progress component | Low | S | Reduce visual weight of progress labels by a notch. |
| 8 | No academic-paper link on /recipe; only the Substack post. | /recipe footer | Low | XS | Wei: *"I'd like a one-sentence pointer to the underlying paper for readers like me."* Add a parenthetical link to the academic paper near the existing Substack link. |
| 9 | The /quiz route still resolves but is unlinked from nav; orphaned dead path. | /quiz | Low | XS | Either link it back from nav with the spec's safeguards, or 404 it explicitly. Decide before the next code change to avoid surprise. |
| 10 | "Built another" CTA on /g/[id] returns to / which forgets the user's earlier story choice; remix-with-different-conspirators is the more natural next-action for an educator demoing the same story. | /g/[id] share row | Medium | M | Tomáš implicit (he wanted to show the same story with a different culprit/motive in class). Add a "Remix this" button that returns to /story/[uuid] with the same story pre-picked. |

Sorted by severity descending, then effort ascending. Items #1–#2 are the recommended next implementation slice.

## Coverage gaps

These three personas could not — by construction — surface several real-user issues. The next round of testing should cover:

- **Mobile-only friction.** All three personas read on a desktop. The home page is mobile-first responsive in code; not field-tested.
- **Accessibility.** Screen-reader navigation through the four-move asides was not exercised. The ARIA labels exist but a real screen-reader pass is missing.
- **Internationalization / second-language reading.** Tomáš's persona claimed second-language friendliness and confirmed the prose was readable, but a real non-native reader may flag idiom we missed (e.g. "wears the form," "snackable culture").
- **Politically-charged real-event edge cases.** Wei's run with the surveillance story was the closest to this; we did not test a story tied to an active election cycle, an ongoing war, or a named living individual. The custom-input flow that would have allowed this is gone, which is the right safety call — but it means the political-edge case is not part of v2's exposed surface.
- **First-time visitor flow with a cold open.** All three personas knew what the site was for from a friend's recommendation. A walk-on-from-Google-search persona would test whether the home page makes its educational frame clear in the first viewport without prior context. (Aisha came closest but had a friend's note; a real cold visitor might leave at "Build a conspiracy theory from scratch" before reading the rest.)
- **Re-roll and rating flows.** None of the three personas re-rolled a move or rated their finished theory. Both flows are wired in code but went unexercised.
- **Educator classroom session mode.** Tomáš's persona considered using the site in class but did not toggle classroom mode. The classroom-mode toggle exists in code but is currently unlinked from /teach (or the affordance was missed).
- **Real users.** The largest coverage gap is that all three are AI simulations. Use this report to triage *what to ask real users about*; do not treat it as evidence of how real users behave.

## Closing

The recipe-as-pedagogy hypothesis survives this evaluation. The next implementation slice is small (items 1–4 above are all S/XS effort) and concentrated: shore up the form-vs-substance caveat on /recipe, harden Move 03 against out-of-context screenshots, sharpen the Move 04 tell, and elevate the strongest line on /about into the home hero. Items 5–10 are nice-to-haves once the top-tier is shipped.

The site is pedagogically working. Don't break it.
