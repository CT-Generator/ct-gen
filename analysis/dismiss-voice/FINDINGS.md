# Dismiss-voice fix — findings & decisions

Addresses Maarten's feedback (June 2026): the conspiracist's voice and the
skeptic's/observer's voice get conflated, mostly in the **Dismiss
counter-evidence** move — both in the multiple-choice *options* ("Blame
statistical noise" reads as the skeptic's strategy, not the conspiracist's
dismissal of it) and in the generated *paragraph* ("anyone who questions the
link is smeared" *describes* the move instead of *performing* it). Also: the
short culprit/motive descriptors are no longer reaching the model.

## Method

Production prompts (`web/lib/openai.ts`, model `gpt-5-mini`) were replicated
verbatim in standalone harnesses (`web/scripts/dismiss-voice/gen*.mjs`); the only
deltas are the prompt variants under test. Outputs were judged **blind** by
Claude subagents, **majority-of-3**, with Maarten's own examples as calibration
anchors (`analysis/dismiss-voice/judge*.workflow.mjs`). Moderation used the prod
`omni-moderation-latest` model. ~1,600 generations total.

- Options rubric: CONSPIRACIST / SKEPTIC / AMBIGUOUS.
- Section rubric: ENACTS / DESCRIBES / MIXED (+ `driftsToDiscredit`). "Conflation" = not-ENACTS.
- 6 event/culprit/motive configs incl. the screenshot's "1,300 languages" case
  and a deliberate worst case for moderation (named CEO + "personal reasons").

## Results

### 1. Multiple-choice options (`generateIdeas`, dismiss), n=144/variant
| variant | conflation | skeptic-voiced | conspiracist |
|---|---|---|---|
| baseline | **44.4%** | 32.6% | 55.6% |
| revised (two-part) | **3.5%** | 0% | 96.5% |

Revised instruction makes each dismiss idea name the mainstream rebuttal **and**
wave it away ("They call it sampling gaps — that's the cover story"). Options
stay ≤12 words. No regression to the other moves' options.

### 2. Dismiss paragraph (`generateSection`), n=96/briefing
| briefing | conflation | moderation-flagged |
|---|---|---|
| baseline | **32.3%** | 2.1% |
| **R2 (chosen)** | **8.3%** | 2.1% |
| R3 (minimal graft) | 14.6% | 4.2% |

By cell (n=48): baseline|skeptic-idea 39.6%, baseline|conspiracist-idea 25.0%,
R2|skeptic 10.4%, R2|conspiracist 6.3% — the two fixes compound (better idea +
better briefing → lowest conflation). Conflation was ~all MIXED (otherwise-enacting
text that slips one observer construction: "classic move", "academics are trained
to wave away anomalies"); pure DESCRIBES and discredit-drift were ~0% in these
configs. R2 mirrors the discredit briefing's "make the claim, do not describe it"
+ a banned-observer-construction list.

### 3. Rejection gate — worst-case config (named CEO), n=48/locale, WITH prod soft-retry
| | primary-flag | HARD-FAIL (→422) |
|---|---|---|
| baseline (pooled) | 28% | **3%** |
| R2 (pooled) | 28% | **2%** |

Per-locale hard-fail: EN 2%→2%, DE 6%→2%, NL 0%→2%. R2 does **not** increase
rejections (identical primary rate; equal-or-lower hard-failure). All flags are
`harassment` on the named-figure config only; benign configs are ~0% in all arms.
Conspiracist-framed ideas don't worsen it (R2 conspiracist hard-fail 0/72).

### 4. Generalization (enact-don't-narrate), n=24/cell
| move | baseline | + guard |
|---|---|---|
| anomaly | 4.2% | 8.3% → **leave unchanged** (already enacts via "state as fact / end on a question") |
| connection | **20.8%** | **0%** → **adopt** |

`discredit` already carries the guard. So `dismiss` (R2) and `connection` get it;
`anomaly` doesn't need it.

### 5. Descriptor wiring — rejection check (ceo config, R2, n=48/locale)
Adding culprit/motive summaries to the section prompt is rejection-**safe and
slightly better**: pooled primary 28%→20%, hard-fail 2%→1% (a clear culprit
identity anchors the conspiracy on the culprit, away from the named person).

## Changes shipped (working tree)
`web/lib/openai.ts`:
- dismiss section briefing → R2 (EN validated; DE/NL pass-1 mirrors).
- connection section briefing → enact-guard (EN validated; DE/NL pass-1 mirrors).
- `generateIdeas` dismiss instruction → two-part framing + GOOD/BAD examples (all locales).
- `generateSection` / `generateNarrative` accept optional `culpritSummary`/`motiveSummary`.

`web/lib/recipe.ts`, `web/app/api/start/route.ts`,
`web/app/api/build/[id]/[move]/section/route.ts`,
`web/app/api/build/[id]/yolo/route.ts`:
- persist `culprit_summary`/`motive_summary` in `recipeContent` at /api/start and
  thread them into section + narrative generation. Back-compat: older rows lack
  the field and generate name-only (current behaviour).

## Caveats
- Conflation was judged in **EN** (Maarten's examples; best judge calibration).
  DE/NL prompt changes mirror the EN structure and passed the cross-locale
  *rejection* sweep, but their conflation reduction was not separately quantified —
  consistent with the repo's "DE/NL are pass-1, native review pending" stance.
- The judge is an LLM; rubric + 3-judge majority + blind inputs + Maarten's
  anchors mitigate this, and a deterministic lexical scan agreed on direction.
