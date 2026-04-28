## ADDED Requirements

### Requirement: German UI copy is a rewrite, not a translation

Every German UI string SHALL be produced through a three-pass review and MUST read as native German prose. A literal pass produces a working draft; an idiomatic pass replaces wooden constructions; a native-ear pass by a reader who has not seen the English flags any remaining stiffness. All three passes MUST complete before the German experience is enabled in production.

#### Scenario: Three-pass review tracked
- **WHEN** the German launch is reviewed for sign-off
- **THEN** evidence exists in `tasks.md` (or a linked review log) that pass 1 (literal), pass 2 (idiomatic), and pass 3 (native-ear) each completed
- **AND** pass 2 was authored by a human, not the model
- **AND** pass 3 was performed by a reviewer who is a native German speaker AND who had not seen the English source for that string before reading the German

#### Scenario: A reader compares to a literal translation
- **WHEN** a German native speaker reads the rendered `/de/` page
- **THEN** the prose does not contain literal calques of English idioms (e.g. *"am Ende des Tages"* for "at the end of the day", *"ich realisiere"* for "I realize")
- **AND** sentence cadence and verb position read as German, not as English-with-German-words

### Requirement: False-friend reference list maintained

The change SHALL maintain an inline reference list of common false friends and overused anglicisms in the German design notes. The list MUST be checked against during pass 2 of the translation review.

#### Scenario: List exists and is referenced in tasks
- **WHEN** the change directory is inspected
- **THEN** `design.md` contains a "False friends and anglicisms to avoid" reference (or `tasks.md` links to one)
- **AND** the list includes at minimum: `actual ≠ aktuell`, `eventually ≠ eventuell`, `realize ≠ realisieren`, `sympathetic ≠ sympathisch`, `kontrollieren` (overused), `recipe → die vier Schritte` (preferred over `Rezept`)
- **AND** pass 2 review notes confirm each entry was checked across the dictionary

### Requirement: Four-move taxonomy workshopped in German

The four moves' titles, tells, and accent labels SHALL be selected through deliberate workshopping rather than literal translation. Final picks MUST be documented in this spec and used consistently across `MOVES` array, prompts, tell stamps, and recipe page copy.

#### Scenario: Final picks documented
- **WHEN** the German `MOVES` array is committed in `web/lib/recipe.ts`
- **THEN** the four titles match the documented picks below
- **AND** the four tells (caps, monospace) match the documented picks below
- **AND** no later edit changes them without an entry in this spec

#### Scenario: Final taxonomy picks
- **WHEN** the German recipe taxonomy is loaded
- **THEN** Move 01 title is the workshop-chosen native phrasing for *Hunt for anomalies* (candidate set: `Stutzen lernen`, `Auffälligkeiten suchen`, `Komische Stellen markieren` — final pick captured in `tasks.md` after pass 2)
- **AND** Move 02 title is the workshop-chosen phrasing for *Connect the dots* (candidates: `Punkte verbinden`, `Linien ziehen`)
- **AND** Move 03 title is the workshop-chosen phrasing for *Dismiss counter-evidence* (candidates: `Gegenargumente wegerklären`, `Gegenbeweise abwehren`)
- **AND** Move 04 title is the workshop-chosen phrasing for *Discredit critics* (candidates: `Kritiker:innen diskreditieren`, `Kritikerinnen mundtot machen`)
- **AND** the debunk label is `Die Auflösung` (chosen over `Die Entlarvung` for tone)
- **AND** the four tells are `GRUNDRATE`, `SECHS ECKEN`, `UNFALSIFIZIERBAR`, and `AD HOMINEM` (Latin retained for Move 04)

### Requirement: German source stories curated and screened

The seed catalog SHALL include German source stories that pass an explicit screening rubric. Marco SHALL hand-pick at least 20 candidates; at least 12 MUST survive screening. Stories are added to `web/data/seed.json` with a `locale: 'de'` field.

#### Scenario: At least 12 surviving German stories
- **WHEN** the change is ready to ship
- **THEN** `seed.json` contains at least 12 rows with `locale: 'de'`
- **AND** every German row has `intro_paragraphs` and `conspiracist_intro` already in German (not English placeholders)

#### Scenario: Story screening criteria applied
- **WHEN** a candidate German story is reviewed
- **THEN** it is rejected unless ALL of the following hold:
  - The story is about a specific public-affairs event with a date and a place.
  - The story has at least one obvious "official narrative" the conspiracist voice can plausibly question.
  - The story does NOT center any vulnerable group as victim or culprit.
  - The story does NOT name a private individual who is not already a public figure.
  - Given a plausible (event, culprit, motive) triple, the four moves filled in by the wizard would produce a recognizably-conspiracy-shaped output (the selector test).
  - The original publication date is within the last 5 years.
- **AND** the screening notes (yes/no per criterion per candidate) are kept alongside `tasks.md` until archive

#### Scenario: German source attribution in conspiracist intros
- **WHEN** a German `conspiracist_intro` is authored
- **THEN** the source attribution uses native German phrasing (`Die SZ berichtet…`, `Laut Tagesschau…`, `Wie der Spiegel meldet…`)
- **AND** does NOT use the English pattern (`The Süddeutsche Zeitung reports…`)

### Requirement: German LLM prompts written native, not translated

The four LLM prompt assemblers in `web/lib/openai.ts` (`generateEventIntro`, `generateIdeas`, `generateSection`, moderation rationale) SHALL have separate German variants. The German prompts MUST be authored as German, not generated by translating the English. The German voice guidelines MUST include a negative constraint against anglicisms and English-cadence sentences.

#### Scenario: Per-locale prompt branches
- **WHEN** a generation request arrives with locale `de`
- **THEN** the German prompt variant is used end-to-end (system + voice guidelines + hard constraints)
- **AND** the model's output is German prose

#### Scenario: Anti-anglicism constraint present
- **WHEN** a German prompt is dispatched
- **THEN** the system prompt includes (in German) an instruction to write as a German native speaker without anglicisms or literally-translated English idioms
- **AND** a sample of 10 fresh German theories reviewed by the native-ear reviewer flag fewer than 2 stiff or anglicized passages on average

### Requirement: German recipe-version distinguishes provenance

Every German generation SHALL persist `recipe_version = 'v1.de'` on its `generations` row. The English path keeps `recipe_version = 'v1'`. This makes the data-platform provenance unambiguous.

#### Scenario: German row has v1.de
- **WHEN** a generation is created with the German prompt suite
- **THEN** the persisted row has `recipe_version = 'v1.de'`
- **AND** the row's `locale` column is `'de'`

#### Scenario: English row keeps v1
- **WHEN** an English generation is created via the existing path
- **THEN** the persisted row has `recipe_version = 'v1'`
- **AND** the row's `locale` column is `'en'`

### Requirement: German `/teach` page copy ships; lesson-plan PDF deferred

The `/teach` page SHALL render in German under `/de/teach` with all UI copy (the in-page lesson framing, the call-to-action, footer text) translated as a rewrite. The printable lesson plan PDF/handout — if one exists — MAY remain English in this round and is tracked as a follow-up.

#### Scenario: /de/teach renders German UI
- **WHEN** a German user visits `/de/teach`
- **THEN** every visible string is German
- **AND** if a "download lesson plan" link exists pointing at an English PDF, a small note above it (in German) flags the PDF as English-only for now
