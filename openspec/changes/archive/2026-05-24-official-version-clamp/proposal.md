## Why

The narrative finale's opening paragraph is meant to give a neutral, journalistic framing of the real news event — the kind of one-liner a reader would accept as "what officially happened" — and then pivot into the conspiracy reading. The prompt instructs the model to "end the paragraph with a turn into the conspiracy reframing (e.g., '…so the official story goes.')." In practice, the model interprets this loosely: it stacks evidentiary doubts (contradictory leads, vanished evidence, unanswered questions) BEFORE the "official story" tag. The result reads as if the official narrative itself includes its own unraveling — which collapses the rhetorical move and confuses the reader about which voice is talking.

Example (DE): "…das Ereignis wurde als Sabotage eingestuft. Ermittlungen in mehreren Ländern lieferten widersprüchliche Fährten, Belege lösten sich in bürokratischen Schleifen auf und viele Fragen blieben offen – so jedenfalls die offizielle Version."

The "so jedenfalls die offizielle Version" should clamp tightly to the institutional classification ("…als Sabotage eingestuft — so jedenfalls die offizielle Version."). Doubts, if mentioned at all, belong AFTER that tag, as the conspiracist's pivot.

## What Changes

- Strengthen the paragraph-1 instruction in `generateNarrative` (`web/lib/openai.ts`) for all three locales (DE / NL / EN) so the model places the "official version" tag immediately after the neutral institutional fact (what happened + how it was classified by authorities), not after a list of doubts.
- Add an explicit anti-pattern example in the prompt for each locale showing the wrong placement (tag after doubts) vs. the right placement (tag clamps to the official classification, doubts come after).
- Update the `conspiracy-narrative` spec scenario "News-framing opens the narrative" with the clamping requirement and a new sub-scenario covering the placement rule.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `conspiracy-narrative`: tighten the paragraph-1 structure requirement so the "official version" hook attaches to the neutral institutional classification, not to a downstream list of doubts.

## Impact

- Code: `web/lib/openai.ts` (the three locale branches inside `generateNarrative`'s system prompt).
- Specs: `openspec/specs/conspiracy-narrative/spec.md` — one scenario tightened, one sub-scenario added.
- No DB / schema / route changes. No client-side rendering changes. Existing rows are unaffected; only newly generated narratives differ.
- Risk: low. This is a prompt clarification, not a structural rewrite. The output schema (4 paragraphs, word counts) is unchanged.
