## 1. Set up

- [x] 1.1 Create `docs/ux-research/2026-04/` directory.
- [x] 1.2 Snapshot baseline `/stats` totals (theories, ratings, avg) so we can verify post-run that ratings didn't move and theories increased by ~3. Baseline: `[2,684 total, 2,681 migrated, 3 v2-built, 1 wizard-finished, 91 ratings, avg 4.56]`.

## 2. Personas

- [x] 2.1 Persona 1 — Aisha Nair, UX content strategist, 34, Bristol UK. Curious news reader; cousin uses conspiracy framings.
- [x] 2.2 Persona 2 — Tomáš Horák, philosophy/civics teacher, 47, Brno. Evaluating for classroom use; specific "lines" he won't cross.
- [x] 2.3 Persona 3 — Dr. Wei Chen, disinformation researcher, 41, UK. Most skeptical reader; testing for normalization risk.
- [x] 2.4 Side-by-side check — three distinct cognitive frames: playful-skeptic (Aisha), evaluative-cautious (Tomáš), professionally-suspicious (Wei).

## 3. Walkthroughs

- [x] 3.1 Persona 1 walkthrough → `/g/DFZHNE5CQN` — ultra-processed foods × The Juice Cartel × Influencing Art and Culture. ~1,395 words.
- [x] 3.2 Persona 2 walkthrough → `/g/68NDRBPQGG` — Western voters × The Cultural Architects Consortium × Influencing World Leaders. ~1,385 words.
- [x] 3.3 Persona 3 walkthrough → `/g/BBVQ7B79BM` — UK spy agencies × The JASON Group × Achieving Total Surveillance. ~1,331 words.
- [x] 3.4 Each walkthrough closes with a 80–150-word "What did you learn?" reflection in persona voice.
- [x] 3.5 All three permalinks return HTTP 200 in production; recipe_content has all four moves + intro + conspiracist_intro + source_url.

## 4. Synthesis report

- [x] 4.1 `report.md` opens with one-line summary + permalink list + Method paragraph.
- [x] 4.2 Pedagogical effect (~580 words). Names what the recipe taught all three personas, where it fails (Move 03 normalization risk), distinguishes strong-signal from weak-signal observations.
- [x] 4.3 Prioritized changes table — 10 items, sorted severity desc / effort asc. Top 3 are all High/S, concentrated on Move 03 hardening + form-vs-substance caveat + Move 04 tell.
- [x] 4.4 Coverage gaps section — mobile, accessibility, i18n, political-edge cases, cold-open visitor, re-roll/rate flows, classroom-mode, real users.
- [x] 4.5 Each persona file linked from the report by relative path.

## 5. Verify + close

- [x] 5.1 Re-snapshot `/stats` (v2 tab — page was refactored mid-run by another commit). v2 tile counts: `Theories built 3→6 (+3) ✓`, `Wizard finished 1→4 (+3) ✓`, `Ratings unchanged ✓`. Migrated counts on v1 tab unaffected.
- [x] 5.2 Word counts: persona-1 1,395w, persona-2 1,385w, persona-3 1,331w, report 1,834w. All within or near spec ranges.
- [x] 5.3 Top-3 prioritized issues (printed below).

```
#1 [/recipe, High, S]   Form-is-necessary-not-sufficient caveat missing.
                        Real critics sometimes wear the move's form with
                        substance behind them. Add 1 paragraph to /recipe.
                        Surfaced by Wei (researcher), touched by Tomáš.
#2 [/g/[id], High, S]   Move 03 (dismiss) is the most quotable-out-of-context
                        paragraph; disclaimer band is gone. Reintroduce a
                        small inline crop-resistant "MOVE 03 · UNFALSIFIABLE"
                        stamp. All three personas flagged a version of this.
#3 [openai prompt, M, S] Move 04 debunk closes with multi-sentence framing
                        instead of a crisp tell. Tighten the discredit
                        section prompt to land "ad hominem" in a 4-6 word
                        final sentence.
```
