## MODIFIED Requirements

### Requirement: OpenGraph cards teach the recipe, not the theory

The OG image for every `/g/<short-id>` URL SHALL display the brand, the four-step recipe (with iconography for each move), and the user's input triple ("X · Y · Z") — and SHALL NOT include any sentence of the generated theory text. The OG title and description follow the same rule: they describe the recipe and the inputs, never the conspiracy text. The OG metadata for every `/g/<short-id>` URL MUST also include a locale-correct `og:locale` value matching the row's persisted locale (`en_US`, `de_DE`, or `nl_NL`), and the `og:description` (and matching `twitter:description`) MUST be sourced from the dictionary entry for the row's persisted locale — sharing a German theory in any context shows a German preview description; sharing a Dutch theory shows a Dutch preview description. The page-level `generateMetadata` MUST set `openGraph.locale` explicitly because Next.js metadata merging is shallow per top-level field — the layout-level OG `locale` is shadowed by any page-level OG override.

#### Scenario: Card content audit
- **WHEN** a permalink URL is shared on a platform that renders OpenGraph previews (Twitter, Bluesky, Slack, Discord, iMessage)
- **THEN** the rendered card image contains: app brand, four recipe-move labels with icons, the input triple, a "Generated at <domain>" caption
- **AND** the rendered card image does NOT contain any sentence from the four recipe moves of the generated theory
- **AND** the OG title and description follow the same constraint

#### Scenario: OG locale matches row locale
- **WHEN** any page-level `generateMetadata` runs for a `/g/<short-id>` URL whose row locale is `en` / `de` / `nl`
- **THEN** the response's `og:locale` meta tag is `en_US` / `de_DE` / `nl_NL` respectively
- **AND** this property holds regardless of the visiting visitor's UI locale or cookie
- **AND** the value comes from a `Record<Locale, string>` map (no inline ternary)

#### Scenario: OG description matches row locale
- **WHEN** a page-level `generateMetadata` runs for a `/g/<short-id>` URL whose row locale is `de`
- **THEN** the response's `og:description` meta tag is the German share description (from `meta.og_description_generation` in `de.ts`)
- **AND** the response's `twitter:description` carries the same German string
- **AND** none of these fields contains an English literal

#### Scenario: Layout OG fields are not shadowed by per-page metadata
- **WHEN** a page-level `generateMetadata` returns an `openGraph` block (overriding the layout default)
- **THEN** the page-level block explicitly includes a `locale` field
- **AND** the resulting rendered HTML still contains exactly one `og:locale` meta tag (no missing, no duplicates)
