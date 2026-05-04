## MODIFIED Requirements

### Requirement: Recipe-tagged structured generation

The system SHALL generate every conspiracy theory as a structured object with five named, separately-rendered sections: `anomalies`, `connect_dots`, `dismiss_counter`, `discredit_critics`, and `debunk`. The model MUST be invoked with a tool/structured-output schema that enforces this shape so the four recipe moves (and the debunking pass) are returned as labeled spans the UI can render distinctly. Free-form unstructured generation is NOT allowed. The system prompt and voice guidelines used to produce these sections MUST be locale-aware: the request's locale (`en`, `de`, or `nl`) selects a separate prompt suite that produces output in that locale.

#### Scenario: Generation produces all five labeled sections
- **WHEN** a user with a complete input triple (news, culprit, motive) requests a theory
- **THEN** the model is called with a structured tool schema requiring the five named sections
- **AND** the response object contains non-empty strings for `anomalies`, `connect_dots`, `dismiss_counter`, `discredit_critics`
- **AND** the response object contains a non-empty `debunk` string written from a critical-thinking perspective
- **AND** the persisted record stores the full structured object as JSONB

#### Scenario: A section comes back empty or malformed
- **WHEN** the model returns a structured response with any of the five sections empty, missing, or non-string
- **THEN** the system retries the call up to 2 times with the same inputs
- **AND** if all retries fail, the system surfaces a user-facing error ("the theory engine glitched — try again") and does NOT persist a partial record

#### Scenario: Locale-aware prompt selection — German
- **WHEN** a generation request's resolved locale is `de`
- **THEN** the German prompt suite is used (system prompt, voice guidelines, hard constraints, opener-variety constraint, all in German)
- **AND** the model's output is German across all five sections
- **AND** the persisted row has `recipe_version = 'v1.de'`

#### Scenario: Locale-aware prompt selection — Dutch
- **WHEN** a generation request's resolved locale is `nl`
- **THEN** the Dutch prompt suite is used (system prompt, voice guidelines, hard constraints, opener-variety constraint, all in Dutch)
- **AND** the model's output is Dutch across all five sections
- **AND** the persisted row has `recipe_version = 'v1.nl'`

#### Scenario: English request unchanged
- **WHEN** a generation request's resolved locale is `en`
- **THEN** the English prompt suite (the existing one) is used
- **AND** the model's output is English
- **AND** the persisted row has `recipe_version = 'v1'`

### Requirement: Distinct recipe-move rendering

The UI SHALL render each of the four recipe moves in a visually distinct, individually-labeled section. Section labels MUST use the human-readable names from the published recipe and MUST be visible at all times — they cannot be hidden behind a tab, accordion, or hover state by default. The section labels MUST be locale-aware: in English they are `Hunt for anomalies`, `Connect the dots`, `Dismiss counter-evidence`, `Discredit critics`; in German they are the workshop-chosen native phrasings (final picks documented in `specs/german-content/spec.md`); in Dutch they are the workshop-chosen native phrasings (final picks documented in `specs/dutch-content/spec.md`).

#### Scenario: Recipe moves render with their labels
- **WHEN** a generated theory is displayed
- **THEN** each of the four recipe moves appears as its own visible block with its labeled heading
- **AND** the four blocks share visual scaffolding (border, label color, icon) that ties them to the recipe explanation page

#### Scenario: German labels on /de/g/<id>
- **WHEN** a generated German theory is displayed under `/de/g/<id>` (or a German-locale generation rendered from a permalink)
- **THEN** the four section labels are the German workshop-chosen phrasings, not literal translations
- **AND** the debunk label is `Die Auflösung`

#### Scenario: Dutch labels on /nl/g/<id>
- **WHEN** a generated Dutch theory is displayed under `/nl/g/<id>` (or a Dutch-locale generation rendered from a permalink)
- **THEN** the four section labels are the Dutch workshop-chosen phrasings, not literal translations
- **AND** the debunk label is the workshop-chosen Dutch phrasing documented in `specs/dutch-content/spec.md`

## ADDED Requirements

### Requirement: Dutch voice prohibits anglicisms and English cadence

The Dutch prompt suite SHALL include a negative voice constraint instructing the model to write as a native Dutch speaker without anglicisms or literally-translated English idioms. The voice MUST read naturally to both NL and BE audiences (no Belgicisms, no Hollandisms unique to one side). A native-ear sampling pass over fresh Dutch output MUST be conducted before launch, with stiffness flags driving prompt adjustments.

#### Scenario: Prompt contains the anti-anglicism instruction
- **WHEN** a Dutch generation is dispatched
- **THEN** the system prompt's voice block includes (in Dutch) an instruction equivalent to "Schrijf als een Nederlandse moedertaalspreker, zonder anglicismen en zonder letterlijk vertaalde Engelse uitdrukkingen. De stijl moet natuurlijk klinken voor zowel Vlaamse als Nederlandse lezers."

#### Scenario: Native-ear sampling pass before launch
- **WHEN** the Dutch launch is reviewed for sign-off
- **THEN** evidence exists that at least 10 fresh Dutch theories were sampled and reviewed by at least one Dutch (NL) and one Flemish (BE) native speaker
- **AND** the average flag rate (stiff, anglicized, or one-side-only passages per theory) is below 2
- **AND** prompts were tuned (and re-sampled) until the threshold is met
