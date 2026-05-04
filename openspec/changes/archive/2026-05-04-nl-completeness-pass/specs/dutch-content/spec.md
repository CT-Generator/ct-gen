## MODIFIED Requirements

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
