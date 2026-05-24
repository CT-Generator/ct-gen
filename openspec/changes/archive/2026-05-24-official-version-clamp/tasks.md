## 1. Prompt edit — English branch

- [x] 1.1 In `web/lib/openai.ts` `generateNarrative`, locate the EN system prompt's paragraph-1 instruction (the line about "Paragraph 1 (50–80 words): a brief, neutral journalistic framing…").
- [x] 1.2 Replace the single sentence about ending with "…or so the official story goes." with a structural rule: the pivot phrase MUST immediately follow the sentence stating what happened + how authorities classified it; doubts (if any) come AFTER the pivot, as the conspiracist's lean-in.
- [x] 1.3 Add a short wrong-pattern / right-pattern pair beneath the rule, using a generic example (not Nord Stream — see Risks in design.md). Keep both examples brief (≤ ~35 words each).

## 2. Prompt edit — German branch

- [x] 2.1 In the DE system prompt's paragraph-1 instruction, apply the same structural rule: "…so jedenfalls die offizielle Version." schließt unmittelbar an die institutionelle Einordnung an; Zweifel folgen danach.
- [x] 2.2 Add the wrong/right example pair in German, mirroring the EN structure. Use a generic event (not Nord Stream) to avoid the example bleeding into outputs.

## 3. Prompt edit — Dutch branch

- [x] 3.1 In the NL system prompt's paragraph-1 instruction, apply the same structural rule: "…of dat is althans het officiële verhaal." sluit direct aan op de institutionele kadering; twijfels komen daarna.
- [x] 3.2 Add the wrong/right example pair in Dutch, mirroring the EN structure with a generic event.

## 4. Verification

- [x] 4.1 Run `openspec validate official-version-clamp --strict` and resolve any errors.
- [x] 4.2 Generate one finale per locale (EN/DE/NL) against a real seed event via the existing build flow; confirm in each output that the official-version pivot follows the institutional classification sentence directly, and any doubts appear after it.
- [x] 4.3 If any locale still produces the wrong shape on a seed that previously failed (e.g., Nord Stream–type events), tighten that locale's rule wording and rerun until the shape is stable across 3 distinct seeds per locale.
- [x] 4.4 Spot-check that paragraph 1 still hits the 50–80-word range and remains in neutral journalistic register (no conspiracist voice before the pivot).
