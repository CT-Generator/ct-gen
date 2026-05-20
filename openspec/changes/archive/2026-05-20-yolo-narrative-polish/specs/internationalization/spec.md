## ADDED Requirements

### Requirement: Result-page H1 reads grammatically in every supported locale

The H1 on `/g/[id]` (read-only generation page) and the equivalent done-screen heading on `/build/[id]` (wizard wrap-up) — both of which compose a single sentence from per-locale fragment templates and the free-form `culprit`, `event`, and `motive` seed values — SHALL render grammatically in each of `en`, `de`, `nl` for every culprit/event/motive combination present in the seed catalog. The construction MUST NOT produce ungrammatical concordance errors in DE or NL (case, article, gender, or word-order errors) when the seed values are substituted as-is.

The H1 implementation MAY achieve this by (a) keeping the existing fragment-template form where it is grammatically robust in the locale, (b) restructuring the H1 into a form that minimizes concordance points (e.g., colon construction, two-line form), or (c) using a per-locale rendering function that handles the seed values appropriately. The choice of approach is per locale.

#### Scenario: H1 reads grammatically in English
- **WHEN** the H1 renders on `/g/[id]` for any seed (culprit, event, motive) triple in `en`
- **THEN** the rendered sentence is grammatical English
- **AND** the seed values are inserted without article/case adjustments (English does not require them)

#### Scenario: H1 reads grammatically in German
- **WHEN** the H1 renders on `/de/g/[id]` for any seed (culprit, event, motive) triple from the German seed catalog
- **THEN** the rendered sentence is grammatical German for every triple in the seed catalog
- **AND** no rendered triple produces a case/gender/article concordance error that a German native speaker would flag

#### Scenario: H1 reads grammatically in Dutch
- **WHEN** the H1 renders on `/nl/g/[id]` for any seed (culprit, event, motive) triple from the Dutch seed catalog
- **THEN** the rendered sentence is grammatical Dutch for every triple in the seed catalog
- **AND** no rendered triple produces a concordance error that a Dutch native speaker would flag

#### Scenario: Done-screen heading shares the same guarantee
- **WHEN** the wizard's done-screen heading on `/de/build/[id]` or `/nl/build/[id]` is rendered for the same seed triples
- **THEN** the rendered heading is grammatical in the locale
- **AND** the construction either mirrors the H1 or uses the same locale-aware rendering function

#### Scenario: Catalog audit logged
- **WHEN** this change is reviewed for archive
- **THEN** the tasks log records that a per-locale audit of every seed (culprit, event, motive) triple ran against the new H1 / done-screen rendering
- **AND** the audit confirms grammatical output in every triple
