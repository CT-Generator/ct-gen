## Context

`generateNarrative` in `web/lib/openai.ts` produces the four-paragraph finale that appears at the top of `/g/[id]`. Paragraph 1 is the neutral journalistic framing of the real news event, ending on a pivot phrase ("…so the official story goes." / "…so jedenfalls die offizielle Version." / "…of dat is althans het officiële verhaal.") that hands the floor to the conspiracist for paragraphs 2–4.

Why the current prompt drifts: the instruction "End the paragraph with a turn into the conspiracy reframing" is structurally underspecified. The phrase "official version" is a SCOPE marker — it tags exactly what claim is being attributed to officials. The model treats it as a TRANSITION marker — anything that comes before it gets pulled into "the official version," including the doubts about that version. So a sentence like "investigations turned up contradictory leads, evidence dissolved in bureaucratic loops, many questions remained — or so the official story goes" reads as the officials themselves saying their investigation was inconclusive, which is exactly backwards.

The journalistic-register constraint also encourages the model to add "balance" before the pivot — and the easiest balance to add is doubt. Combined with the loose tag placement, this produces the failure mode.

## Goals / Non-Goals

**Goals:**
- The "official version" tag in paragraph 1 clamps to the neutral institutional claim (what happened + what authorities classified it as), and only that.
- Any doubts, contradictions, or unanswered questions — if mentioned in paragraph 1 at all — sit AFTER the pivot, as the conspiracist's first move, not before it.
- Fix applies symmetrically across DE, NL, EN.

**Non-Goals:**
- Re-engineering paragraph 1's word count, voice, or position. The 50–80-word neutral-journalistic framing remains.
- Touching paragraphs 2–4 or the per-move generators.
- Changing the schema, persistence, or rendering.

## Decisions

**Decision 1: Edit the prompt, do not add a post-processing pass.**
The drift is a phrasing ambiguity in the instruction, not a model-capability gap. A clearer instruction is cheaper and more reliable than a regex or a second model call. Alternative considered: a deterministic post-process that finds the pivot phrase and reorders the sentence. Rejected because the pivot phrase is locale-variable, sometimes paraphrased, and editing model output mid-pipeline risks new artefacts.

**Decision 2: Use an anti-pattern + good-pattern pair, not just a positive rule.**
The current instruction already tries to specify the right shape ("end the paragraph with a turn"). Adding a sharper rule alone has a good chance of being absorbed without changing behavior. Showing the wrong placement explicitly — using the Nord Stream sentence the user flagged — gives the model a concrete contrast to anchor on. The exemplar is short and the model already accepts in-prompt examples in this file.

**Decision 3: Make the rule structural, not stylistic.**
Frame the rule as "the pivot phrase MUST immediately follow the institutional classification sentence" rather than "be careful not to confuse the reader." Structural rules survive paraphrase pressure better than stylistic ones.

**Decision 4: Keep doubts optional, not banned.**
The conspiracist's pivot in paragraph 1's final sentence (if used) is a natural lead-in to paragraphs 2–4. The fix isn't "no doubts in paragraph 1" — it's "doubts come AFTER the pivot, not before." This preserves the existing rhythm of "neutral fact → official-version tag → conspiracist lean-in."

## Risks / Trade-offs

- **Risk**: Model might over-correct and produce a paragraph that is ONLY one sentence (institutional fact + tag) with no lead-in to paragraphs 2–4 → narrative feels truncated. **Mitigation**: keep the 50–80-word minimum and explicitly allow (but do not require) one trailing conspiracist-pivot sentence after the tag.
- **Risk**: The anti-pattern example uses Nord Stream — a real event the model has strong priors about. The example might bleed into outputs. **Mitigation**: clearly mark the snippet as a wrong-pattern illustration; do not use the same event in any current scenario seed (verify during implementation).
- **Risk**: Locale drift — DE/NL/EN versions of the rule could diverge in strictness. **Mitigation**: write the rules from one canonical English version and translate, with the same structure (rule → wrong example → right example) in each.
- **Trade-off**: prompt grows a few lines per locale. Acceptable; the prompt is already long-form and structured.
