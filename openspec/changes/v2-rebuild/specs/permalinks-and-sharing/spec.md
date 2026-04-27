## ADDED Requirements

### Requirement: Deterministic short-ID permalinks

Every persisted generation SHALL be addressable at a stable URL of shape `/g/<short-id>`. The `short-id` MUST be deterministic given the tuple `(news_value, culprit_value, motive_value, model_version, recipe_version)` so identical inputs produce identical URLs and the database does not duplicate generations across sessions.

#### Scenario: Two users pick the same triple
- **WHEN** user A and user B independently pick the same curated news, culprit, and motive
- **THEN** both users land on the same `/g/<short-id>` permalink
- **AND** the database holds exactly one generation record for this triple
- **AND** the rating sub-record can have separate ratings from each user

#### Scenario: A re-roll creates a new permalink
- **WHEN** a user re-rolls one of the four recipe moves on an existing generation
- **THEN** the resulting record has a new `short-id` derived from the new content hash
- **AND** the new permalink URL includes a `?from=<parent-short-id>` query param to record lineage
- **AND** both the parent and the child permalinks remain accessible

### Requirement: OpenGraph cards teach the recipe, not the theory

The OG image for every `/g/<short-id>` URL SHALL display the brand, the four-step recipe (with iconography for each move), and the user's input triple ("X · Y · Z") — and SHALL NOT include any sentence of the generated theory text. The OG title and description follow the same rule: they describe the recipe and the inputs, never the conspiracy text.

#### Scenario: Card content audit
- **WHEN** a permalink URL is shared on a platform that renders OpenGraph previews (Twitter, Bluesky, Slack, Discord, iMessage)
- **THEN** the rendered card image contains: app brand, four recipe-move labels with icons, the input triple, a "Generated at <domain>" caption
- **AND** the rendered card image does NOT contain any sentence from the four recipe moves of the generated theory
- **AND** the OG title and description follow the same constraint

### Requirement: Always-link-back share buttons

The share UI SHALL provide buttons for: copy link, X (Twitter), Bluesky, email, and a generic Web Share API fallback for mobile. Every share target's payload MUST be the permalink URL plus a brief teaser text that names the recipe ("Made a fake conspiracy with the recipe at <link>") — NEVER the body of the generated theory.

#### Scenario: Share to X
- **WHEN** a user clicks the X share button on a permalink page
- **THEN** the X compose window opens with `text` set to the recipe-naming teaser plus the permalink URL
- **AND** the compose window does NOT contain any sentence from the four recipe moves

#### Scenario: Copy link
- **WHEN** a user clicks "Copy link"
- **THEN** the clipboard receives only the permalink URL string (no theory text)
- **AND** a transient toast confirms the copy

### Requirement: Remix link

Every permalink page SHALL provide a "Remix this" link that navigates a recipient to the selection-flow with the same input triple pre-loaded so they can generate their own variant. The remix link MUST be a permalink URL with a `?remix=1` query param.

#### Scenario: User clicks "Remix this" on a shared permalink
- **WHEN** a user opens a permalink and clicks "Remix this"
- **THEN** the user is navigated to the selection flow at step 4 (confirmation) with the original triple pre-loaded
- **AND** the user can edit any of the three inputs before generating
- **AND** the resulting generation's permalink records `?from=<original-short-id>` lineage

### Requirement: No standalone shareable artifacts

The system SHALL NOT expose any download, export, or save-as affordance on permalink pages. Sharing happens only through link-back routes.

#### Scenario: Permalink page audit
- **WHEN** a permalink page is rendered for any visitor (creator or otherwise)
- **THEN** no `download`, "Save as image," "Export PDF," or "Save HTML" UI control is present
- **AND** `right-click → Save Page As` produces an HTML page that, when opened offline, shows the structurally-protected disclaimer with the same prominence as online

### Requirement: Anonymous-by-default identity

Users SHALL be identifiable to the system only by an opaque session token derived server-side from a salted hash of `(coarse-IP-bucket, user-agent, day)`. The system MUST NOT request, store, or use any PII (email, name, phone) for anonymous users. An optional "claim" string SHALL be available so a user can copy a single random token that ports their generation history across devices, without registering an account.

#### Scenario: First visit, no claim
- **WHEN** a user visits the site for the first time and does not enter a claim string
- **THEN** the server issues an anonymous session cookie tied to the salted hash
- **AND** the user can generate, rate, and revisit their generations on this device
- **AND** no email or other PII is stored

#### Scenario: User claims an opaque token
- **WHEN** a user clicks "Save my history" on the profile area
- **THEN** the server generates a 32-character random claim string and shows it to the user once
- **AND** the user can paste this string on another device to recover their history
- **AND** the system stores no other identifying information
