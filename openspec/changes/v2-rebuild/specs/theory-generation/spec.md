## ADDED Requirements

### Requirement: Recipe-tagged structured generation

The system SHALL generate every conspiracy theory as a structured object with five named, separately-rendered sections: `anomalies`, `connect_dots`, `dismiss_counter`, `discredit_critics`, and `debunk`. The model MUST be invoked with a tool/structured-output schema that enforces this shape so the four recipe moves (and the debunking pass) are returned as labeled spans the UI can render distinctly. Free-form unstructured generation is NOT allowed.

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

### Requirement: Distinct recipe-move rendering

The UI SHALL render each of the four recipe moves in a visually distinct, individually-labeled section. Section labels MUST use the human-readable names from the published recipe ("Hunt for anomalies," "Connect the dots," "Dismiss counter-evidence," "Discredit critics") and MUST be visible at all times — they cannot be hidden behind a tab, accordion, or hover state by default.

#### Scenario: Recipe moves render with their labels
- **WHEN** a generated theory is displayed
- **THEN** each of the four recipe moves appears as its own visible block with its labeled heading
- **AND** the four blocks share visual scaffolding (border, label color, icon) that ties them to the recipe explanation page

### Requirement: Debunking column

The system SHALL render the `debunk` text alongside the conspiracy theory, with equal visual weight by default on viewports wider than 768px. On narrower viewports the debunk is rendered immediately below the theory with the same heading prominence. The debunk MUST NOT be hidden behind a tab, expander, or "show more" interaction by default.

#### Scenario: Wide viewport renders side by side
- **WHEN** a generated theory is displayed on a viewport ≥ 768px wide
- **THEN** the conspiracy theory and the debunk render in two columns of comparable width
- **AND** both column headers are visible above the fold

#### Scenario: Narrow viewport stacks
- **WHEN** a generated theory is displayed on a viewport < 768px wide
- **THEN** the conspiracy theory renders first followed by the debunk
- **AND** the debunk heading uses the same prominence as the conspiracy heading
- **AND** the debunk is NOT collapsed behind any expander

### Requirement: Streaming UX

The system SHALL stream the generated content into the UI as it arrives from the model. Each of the five sections MUST stream into its own slot. The user MUST see progress indicators per section while a section is in-flight.

#### Scenario: Sections stream into their own slots
- **WHEN** a generation request is in progress
- **THEN** each of the five sections (four moves + debunk) shows a per-section "writing..." indicator until that section's content arrives
- **AND** completed sections render their text incrementally as tokens arrive

### Requirement: Re-roll a single move

The system SHALL allow a user to regenerate any one of the four recipe moves while keeping the other three (and the inputs) unchanged. The new version MUST be persisted as a child record with a `parent_generation_id` pointing to the original.

#### Scenario: User re-rolls one move
- **WHEN** a user clicks the re-roll control on the "Connect the dots" move of an existing generation
- **THEN** the system calls the model to regenerate only the `connect_dots` section, given the unchanged inputs and the other three sections as context
- **AND** the resulting record stores the new `connect_dots` text plus the inherited unchanged sections
- **AND** the new record's `parent_generation_id` points to the original
- **AND** the URL updates to the new permalink while the original remains accessible at its own permalink

### Requirement: Structurally-protected disclaimer

Every rendered theory page SHALL include a disclaimer banner identifying the content as a fake produced by an educational tool, with a link to the recipe page. The disclaimer DOM MUST appear both as a header element above the theory and as a footer element below it. Both elements MUST share the parent container of the theory text so any DOM-level attempt to remove the disclaimer would also remove the surrounding theory.

#### Scenario: Disclaimer appears in two places
- **WHEN** a permalink page renders a generated theory
- **THEN** a disclaimer banner is rendered as the first child of the theory container
- **AND** a duplicate disclaimer banner is rendered as the last child of the same container
- **AND** both banners include the educational-purpose statement and a link to `/recipe`

### Requirement: No downloadable theory artifacts

The system SHALL NOT expose any UI affordance to download, export, or save the generated theory as an image, PDF, document, or copy-to-clipboard-as-rich-text. The only sharing affordances available are link-back share buttons (see `permalinks-and-sharing`).

#### Scenario: No download buttons
- **WHEN** a permalink page renders
- **THEN** no `download`, `Save as`, "Copy as image," "Export PDF," or equivalent UI control is present
- **AND** no API route exists that returns the theory text or rendered theory image as a downloadable response

### Requirement: Post-generation moderation pass

After the model returns a structured theory, the system SHALL run the result through a moderation check before persisting and rendering. If any section flags as targeting a real private individual, a vulnerable group, or as overtly hateful, the system MUST refuse to render and MUST log the inputs that produced the flagged output for review.

#### Scenario: Generated content flags as targeting
- **WHEN** the model returns a theory in which any section names a real private individual, targets a vulnerable group, or contains content the moderation provider flags
- **THEN** the system does NOT persist or render the theory
- **AND** an internal log entry records the inputs, the flagged section, and the moderation decision
- **AND** the user sees a message explaining that the engine refused this generation and inviting them to try different inputs
