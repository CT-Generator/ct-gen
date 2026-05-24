## MODIFIED Requirements

### Requirement: Three-paragraph narrative is generated and persisted with every new generation

When a recipe-tagged generation reaches a state where all four moves' `paragraph` outputs exist, the system SHALL generate an integrated conspiracy-theory narrative as a sequence of four paragraphs — paragraph 1 is a brief news-event framing (50–80 words) written in neutral journalistic register that names the actual news event and ends on a hook into the conspiracy reframing; paragraphs 2–4 are the conspiracy theory itself (80–140 words each), integrating the four moves into one continuous arc with conspiracist-voice flair. The narrative MUST be persisted on the generation row at `recipeContent.narrative.paragraphs` (length 4). Generation MUST complete server-side before the route that finalised the build returns its response, so a subsequent GET of `/g/[id]` reads the narrative without further model calls. The narrative MUST NOT be a concatenation, header, or bullet list of the per-move paragraphs.

#### Scenario: Stepwise build finishes with narrative populated
- **WHEN** a stepwise build's `POST /api/build/[id]/discredit/section` succeeds and `per_move` now contains all four moves
- **THEN** the same route call generates a narrative and persists it to `recipeContent.narrative.paragraphs` (length 4) before returning
- **AND** the persisted `narrative.generated_at` is an ISO timestamp set at generation time

#### Scenario: Yolo build finishes with narrative populated
- **WHEN** `POST /api/build/[id]/yolo` resolves successfully
- **THEN** the row's `recipeContent.narrative.paragraphs` has length 4
- **AND** the response is sent only after the narrative has been persisted

#### Scenario: News-framing opens the narrative
- **WHEN** the narrative finale is generated for any locale
- **THEN** paragraph 1 references the actual news event by name (the `eventName` input)
- **AND** paragraph 1 is written in neutral journalistic register, NOT in the conspiracist voice
- **AND** paragraph 1 ends with a transitional hook into the conspiracy reframing (e.g., "…or so the official story goes." in EN, locale-appropriate equivalents in DE/NL)
- **AND** paragraph 1 is between 50 and 80 words inclusive

#### Scenario: Official-version tag clamps to the institutional claim
- **WHEN** the narrative finale is generated for any locale
- **THEN** the "official version" pivot phrase (EN: "…or so the official story goes.", DE: "…so jedenfalls die offizielle Version.", NL: "…of dat is althans het officiële verhaal.") MUST immediately follow the sentence stating the neutral institutional fact — i.e., what happened and how authorities classified it
- **AND** the pivot phrase MUST NOT follow a sentence that itemises doubts, contradictions, vanished evidence, unanswered questions, or other shortcomings of the official account
- **AND** if paragraph 1 names such doubts at all, they MUST appear in a separate sentence AFTER the pivot phrase, framed as the conspiracist's first move
- **AND** a paragraph of the wrong shape — for example "…das Ereignis wurde als Sabotage eingestuft. Ermittlungen lieferten widersprüchliche Fährten, Belege lösten sich auf, viele Fragen blieben offen – so jedenfalls die offizielle Version." — fails this scenario, because the pivot is attached to the list of doubts rather than to the institutional classification

#### Scenario: Narrative integrates the four moves
- **WHEN** the narrative-generation prompt receives the four `paragraph` outputs, the event/culprit/motive triple, and the locale
- **THEN** paragraphs 2–4 reference the specific anomaly, connection, dismissal, and discrediting claims from the input paragraphs
- **AND** paragraphs 2–4 are plain prose (no headings, bullets, or move labels)
- **AND** the narrative does NOT include the per-move debunks
- **AND** each of paragraphs 2–4 is between 80 and 140 words inclusive

#### Scenario: Narrative reads as a coherent standalone story
- **WHEN** a reader reads `narrative.paragraphs` end-to-end without seeing the per-move blocks below
- **THEN** the four paragraphs form a single narrative arc — news framing into conspiracy reveal into specifics into discrediting move
- **AND** the prose does NOT meta-describe the moves (e.g., does NOT contain phrases like "imagine that…", "suppose that…", "would be…", "is allegedly…" used in the hedging sense that turns the claim hypothetical)
