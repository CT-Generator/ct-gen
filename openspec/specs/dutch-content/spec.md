# dutch-content Specification

## Purpose
TBD - created by archiving change multilingual-dutch. Update Purpose after archive.
## Requirements
### Requirement: Dutch UI copy is a rewrite, not a translation

Every Dutch UI string SHALL be produced through a three-pass review and MUST read as native Dutch prose. A literal pass produces a working draft; an idiomatic pass replaces wooden constructions and removes anglicisms; a native-ear pass by readers who have not seen the English source flag any remaining stiffness. All three passes MUST complete before the Dutch experience is enabled in the public locale toggle.

#### Scenario: Three-pass review tracked
- **WHEN** the Dutch launch is reviewed for sign-off
- **THEN** evidence exists in `tasks.md` (or a linked review log) that pass 1 (literal), pass 2 (idiomatic), and pass 3 (native-ear) each completed
- **AND** pass 2 was authored by a human (Maarten or a Dutch-native contributor), not the model
- **AND** pass 3 was performed by at least one NL native AND one BE native, neither of whom had seen the English source for that string before reading the Dutch

#### Scenario: A reader compares to a literal translation
- **WHEN** a Dutch native speaker reads the rendered `/nl/` page
- **THEN** the prose does not contain literal calques of English idioms (e.g. *"aan het einde van de dag"* for "at the end of the day", *"ik realiseer me"* used in the false-friend "I realize" sense)
- **AND** sentence cadence and word order read as Dutch, not as English-with-Dutch-words

### Requirement: Dutch reads neutrally to both NL and BE audiences

The Dutch dictionary, prompts, and source-story prose SHALL be written in neutral Standaardnederlands. No string MAY contain a Belgicism that a Dutch reader would flag as foreign, nor a Hollandism that a Flemish reader would flag as foreign. The dual-review pass below MUST confirm this.

#### Scenario: Dual-review pass on the dictionary
- **WHEN** pass 3 of the dictionary review runs
- **THEN** at least one NL reader and at least one BE reader review every screen end-to-end
- **AND** any string flagged by only one side as foreign-sounding is rewritten to a neutral alternative
- **AND** the review notes record per-string flags (or "none") so future contributors can see what was rejected

#### Scenario: Vocabulary spot-checks
- **WHEN** the Dutch dictionary is sampled for NL/BE neutrality
- **THEN** generic-region words are preferred over region-flagged equivalents (e.g. avoid `het tof` BE-vs-NL polarity, avoid `ge`/`u` second-person pronoun choices that flag region; default to `je`/`jij`)
- **AND** regional address conventions (school year names, government bodies) are avoided in favor of descriptions ("schoolklas", "overheid") that read naturally on either side

### Requirement: False-friend reference list maintained for Dutch

The change SHALL maintain an inline reference list of common false friends and overused anglicisms in the Dutch design notes. The list MUST be checked against during pass 2 of the translation review.

#### Scenario: List exists and is referenced in tasks
- **WHEN** the change directory is inspected
- **THEN** `design.md` (or a linked file referenced from `tasks.md`) contains a "False friends and anglicisms to avoid in Dutch" reference
- **AND** the list includes at minimum: `actual ≠ actueel`, `eventually ≠ eventueel`, `sympathetic ≠ sympathiek`, `realize → beseffen` (not `realiseren` in the awareness sense), `support → steunen` (not `supporteren`), `concept → idee/begrip` (not `concept` for non-technical use), and overused anglicisms (`tool`, `feature`, `proper`) flagged for replacement
- **AND** pass 2 review notes confirm each entry was checked across the dictionary

### Requirement: Four-move taxonomy workshopped in Dutch

The four moves' titles, tells, and accent labels SHALL be selected through deliberate workshopping rather than literal translation. Final picks MUST be documented in this spec and used consistently across the `MOVES` array (Dutch variant), prompts, tell stamps, and recipe page copy.

#### Scenario: Final picks documented
- **WHEN** the Dutch `MOVES` array is committed in `web/lib/recipe.ts`
- **THEN** the four titles match the workshop-chosen picks recorded in `tasks.md` after pass 2
- **AND** the four tells (caps, monospace) match the workshop-chosen picks
- **AND** no later edit changes them without an entry in this spec

#### Scenario: Candidate set per move
- **WHEN** the Dutch recipe taxonomy is workshopped
- **THEN** Move 01 ("Hunt for anomalies") candidates include `Op zoek naar afwijkingen`, `Anomalieën najagen`, `Vreemde details opmerken`
- **AND** Move 02 ("Connect the dots") candidates include `Verbanden leggen`, `Lijnen trekken`, `De stippen verbinden`
- **AND** Move 03 ("Dismiss counter-evidence") candidates include `Tegenbewijs wegredeneren`, `Tegenargumenten ontkrachten`, `Het ongemak wegpoetsen`
- **AND** Move 04 ("Discredit critics") candidates include `Critici diskwalificeren`, `Tegenstanders zwartmaken`, `Critici de mond snoeren`
- **AND** the four tells are workshop-chosen — base candidates: `BASISKANS` (base rate), `ZES SCHAKELS` (six links), `ONFALSIFIEERBAAR`, and `AD HOMINEM` (Latin retained, parity with EN/DE)

### Requirement: Dutch source stories curated and screened

The seed catalog SHALL include Dutch source stories that pass an explicit screening rubric. At least 20 candidates SHALL be surveyed; at least 12 MUST survive screening. Stories are added to `web/data/seed.json` with a `locale: 'nl'` field. Pass-1 literal Dutch authoring of `summary`, `intro_paragraphs`, and `conspiracist_intro` is shippable; pass-2 idiomatic rewrite and pass-3 NL/BE dual-native review remain owed work tracked elsewhere.

#### Scenario: At least 12 surviving Dutch stories
- **WHEN** the change is applied
- **THEN** `seed.json` contains at least 12 rows with `locale: 'nl'`
- **AND** every Dutch row has `intro_paragraphs` and `conspiracist_intro` already in Dutch (not English placeholders, not auto-translated)

#### Scenario: Story screening criteria applied
- **WHEN** a candidate Dutch story is reviewed
- **THEN** it is rejected unless ALL of the following hold:
  - The story is about a specific public-affairs event with a date and a place.
  - The story has at least one obvious "official narrative" the conspiracist voice can plausibly question.
  - The story does NOT center any vulnerable group as victim or culprit.
  - The story does NOT name a private individual who is not already a public figure.
  - Given a plausible (event, culprit, motive) triple, the four moves filled in by the wizard would produce a recognizably-conspiracy-shaped output (the selector test).
  - The original publication date is within the last 5 years.
- **AND** the screening notes (yes/no per criterion per candidate) are kept alongside `tasks.md` until archive

#### Scenario: NL/BE story balance
- **WHEN** the surviving Dutch stories are catalogued
- **THEN** the set includes at least 4 stories sourced from NL outlets AND at least 4 from BE/Flemish outlets
- **AND** the remaining stories may come from either side or pan-Dutch outlets

#### Scenario: Dutch source attribution in conspiracist intros
- **WHEN** a Dutch `conspiracist_intro` is authored
- **THEN** the source attribution uses native Dutch phrasing (`De NRC bericht…`, `Volgens De Standaard…`, `Zoals De Volkskrant meldt…`, `VRT NWS meldt…`)
- **AND** does NOT use the English pattern (`The NRC reports…`)

#### Scenario: NL home picker is non-empty
- **WHEN** a visitor renders `/nl/` (the home picker)
- **THEN** the page shows at least one Dutch story card from the seeded `locale: 'nl'` rows
- **AND** clicking a Dutch card lands on `/nl/story/<uuid>` for that Dutch event

### Requirement: Dutch LLM prompts written native, not translated

The four LLM prompt assemblers in `web/lib/openai.ts` (`generateEventIntro`, `generateIdeas`, `generateSection`, moderation rationale) SHALL have separate Dutch variants. The Dutch prompts MUST be authored as Dutch by a Dutch-native contributor (or model-drafted then human-rewritten in pass 2), not by translating the English. The Dutch voice guidelines MUST include a negative constraint against anglicisms, English-cadence sentences, and one-sided regionalisms.

#### Scenario: Per-locale prompt branches
- **WHEN** a generation request arrives with locale `nl`
- **THEN** the Dutch prompt variant is used end-to-end (system + voice guidelines + hard constraints)
- **AND** the model's output is Dutch prose
- **AND** the persisted row's `recipe_version` is `v1.nl`

#### Scenario: Voice-guideline content
- **WHEN** the Dutch voice guideline block is read
- **THEN** it includes a positive directive ("schrijf als een Nederlandse moedertaalspreker met een lichte satirische toon")
- **AND** a negative directive against anglicisms ("geen anglicismen, geen letterlijk uit het Engels vertaalde uitdrukkingen")
- **AND** a neutrality directive ("de toon moet natuurlijk klinken voor zowel Vlaamse als Nederlandse lezers")

### Requirement: Pass-1 dictionary draft is shippable to main but flagged

The Dutch dictionary MAY land in `main` as a pass-1 literal draft before passes 2 and 3 are complete; when it does, the file's header comment SHALL mark it as PASS 1 (allowed-to-be-wooden) AND the public masthead toggle MUST NOT yet expose `NL` as a clickable option. This unblocks framework wiring (Locale union, middleware, prompt branches) without exposing wooden copy to visitors.

#### Scenario: Pass-1 draft has a header marker
- **WHEN** `web/lib/i18n/nl.ts` lands in main as the pass-1 draft
- **THEN** the file begins with a header comment that explicitly identifies it as PASS 1 (literal), allowed-to-be-wooden, and lists passes 2 and 3 as required-before-launch
- **AND** the comment names the human owner for pass 2 (Maarten or named Dutch-native contributor)

#### Scenario: Toggle gating until passes 2 + 3 land
- **WHEN** only the pass-1 draft has landed
- **THEN** the masthead toggle does NOT include a clickable "NL" pill
- **AND** the `/nl/` URL prefix still renders (for development and review) but is not advertised in the UI

#### Scenario: Toggle exposed after pass 3
- **WHEN** passes 2 and 3 have completed and the native-ear flag rate threshold is met
- **THEN** the masthead toggle includes the "NL" pill alongside "EN" and "DE"
- **AND** the change is ready to archive

