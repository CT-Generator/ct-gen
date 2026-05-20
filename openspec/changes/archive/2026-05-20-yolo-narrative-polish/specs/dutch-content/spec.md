## ADDED Requirements

### Requirement: Pass-2 idiomatic rewrite covers the narrative-finale and per-move briefing prompts

The pass-2 idiomatic rewrite of the Dutch LLM prompts SHALL cover the narrative-finale system prompt (`generateNarrative` Dutch branch) and the four per-move briefings + tell briefings in `MOVE_BRIEFINGS_BY_LOCALE['nl']` / `TELL_BRIEFINGS_BY_LOCALE['nl']`. Pass-2 MUST be reviewed against the false-friend reference list and signed off by a Dutch-native reviewer (Maarten or a named Dutch-native contributor). The header comments marking these blocks as "pass-1" / "to be workshopped in pass 2" MUST be removed once pass-2 completes.

#### Scenario: Pass-2 rewrite touches the narrative-finale prompt
- **WHEN** the Dutch branch of `generateNarrative`'s system prompt is reviewed after this change
- **THEN** the prompt reads as native Dutch (no anglicisms, no English-cadence sentence patterns)
- **AND** the prompt is consistent with the four-paragraph narrative shape (news framing + three conspiracy paragraphs)
- **AND** the header comment marking the block as "Dutch pass-1 — to be workshopped in pass 2" is removed

#### Scenario: Pass-2 rewrite touches all four move briefings
- **WHEN** `MOVE_BRIEFINGS_BY_LOCALE['nl']` is reviewed after this change
- **THEN** all four briefings read as native Dutch
- **AND** the `discredit` briefing uses the assertive declarative voice required by the theory-generation spec (no "Suggereer dat…" framings that invite hypothetical voice)
- **AND** the tell briefings in `TELL_BRIEFINGS_BY_LOCALE['nl']` likewise read as native Dutch

#### Scenario: Sign-off recorded
- **WHEN** the change is reviewed for archive
- **THEN** `tasks.md` (or a linked review log) records that pass-2 sign-off on the narrative and move briefings was provided by Maarten or a named Dutch-native contributor
- **AND** the sign-off references at least one fresh sample run (event + culprit + motive) reviewed end-to-end in Dutch

### Requirement: Dutch UI dictionary covers the new YOLO loading-state copy

The Dutch dictionary (`web/lib/i18n/nl.ts`) SHALL include the localized strings for the YOLO loading affordance and retry control introduced by this change. Strings MUST read as native Dutch (not literal translations from English) and MUST not contain anglicisms.

#### Scenario: YOLO loading status string exists in Dutch
- **WHEN** the YOLO loading affordance renders on `/nl/build/[id]` or `/nl/story/[uuid]`
- **THEN** the rendered status line is sourced from a `nl.ts` key (e.g., `wizard.skip_to_result_loading_status` and the picker's equivalent)
- **AND** the rendered string reads as native Dutch
- **AND** no English fallback is rendered

#### Scenario: YOLO retry button label exists in Dutch
- **WHEN** the YOLO failure path renders a retry control on a Dutch page
- **THEN** the retry button's label is sourced from a `nl.ts` key
- **AND** the label reads as native Dutch
