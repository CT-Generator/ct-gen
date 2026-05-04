## ADDED Requirements

### Requirement: Legally-significant page bodies are subject to a separate jurisdictional-original requirement

Pages whose body is legally-significant content — currently `/imprint` and `/privacy`, and any future page that carries jurisdiction-specific legal text — are exempt from the dictionary-driven localization rule because the content cannot be authored by translation: it must be authored as a legal original against the jurisdiction's law. Until a jurisdictional original exists for a non-English locale, the page MAY render the English source body, BUT MUST display a visible "translation pending" notice in the active locale at the top of the page body. The notice MUST name the gap (the page's legal body has not yet been authored in the active locale) and MUST appear before the English body so visitors who cannot read English see the gap immediately and operators reviewing the page see what's missing. Rendering the English source body without the localized notice is a violation of the no-English-fallback rule.

#### Scenario: German visitor on /de/imprint without a German original
- **WHEN** a visitor renders `/de/imprint` and no German legally-original imprint body exists yet
- **THEN** the response renders a notice in German at the top of the page body (heading + one-sentence body sourced from `legal.translation_pending_h` / `legal.translation_pending_body` in `de.ts`)
- **AND** the English imprint body renders below the notice unchanged
- **AND** the page does NOT silently render the English body without the notice

#### Scenario: Dutch visitor on /nl/privacy without a Dutch original
- **WHEN** a visitor renders `/nl/privacy` and no Dutch legally-original privacy body exists yet
- **THEN** the response renders a notice in Dutch at the top of the page body
- **AND** the English privacy body renders below the notice unchanged

#### Scenario: English visitor on /imprint
- **WHEN** a visitor renders `/imprint` (locale `en`)
- **THEN** the page renders the English imprint body as today
- **AND** no translation-pending notice renders (English IS the source)

#### Scenario: Future jurisdictional original removes the notice
- **WHEN** a German legally-original imprint body is authored and lives in a Marco-authored file (e.g., `web/app/imprint/page.de.tsx`) AND `/de/imprint` is wired to render that file
- **THEN** the translation-pending notice is no longer rendered for German
- **AND** the German body renders without it

## MODIFIED Requirements

### Requirement: No English fallback for non-English locales

When the resolved locale is not `en`, every user-facing string the system renders MUST come from that locale's dictionary (or be a locale-aware derived value such as a localized URL or OG locale code). No code path MAY render an English literal — or fall through to the English dictionary — as a substitute for a missing non-English value. Missing keys in any non-English dictionary MUST be a typecheck-time hard fail (enforced by the `Dictionary` typed union: every locale dictionary file `export`s a value typed as `Dictionary`, so the TypeScript compiler rejects builds where a non-English dictionary lacks a key the English dictionary has).

This rule covers:
- Page copy (rendered via `getDict(locale).<section>.<key>`).
- Error-boundary copy (the `errors.*` keys).
- OG / social metadata that includes a locale code (`og:locale`) AND any locale-keyed share description.
- Per-page `generateMetadata` blocks that override the layout-level OG: every such override MUST explicitly include `og:locale` because Next.js metadata merging is shallow per top-level field.
- Any inline ternary or switch on `locale` that selects a string literal.
- AI-generated content (already covered by the row's persisted locale rule on `/g/[id]`).

The rule does NOT prohibit locale-conditional logic for non-content concerns: routing prefixes, format strings, date/number formats, or behavior toggles MAY branch on `locale` as long as the user-visible string content for each branch is itself locale-correct.

The rule has one explicit exemption: **legally-significant page bodies** (imprint, privacy, and any future jurisdiction-specific legal page) are governed by the separate "Legally-significant page bodies are subject to a separate jurisdictional-original requirement" — until a jurisdictional original exists, those pages MAY render the English body provided a localized translation-pending notice is shown.

#### Scenario: Typecheck rejects a non-English dictionary missing a key
- **WHEN** a developer adds a key to `web/lib/i18n/en.ts` (the source of the `Dictionary` type) but does not add the corresponding key to `de.ts` or `nl.ts`
- **THEN** `npx tsc --noEmit` exits non-zero
- **AND** the failing diagnostic names the missing key and the locale dictionary file

#### Scenario: No inline English fallback in component code
- **WHEN** a code review or grep inspects component source for patterns like `locale === "de" ? <de-string> : <en-string>` (or any equivalent ternary that hardcodes the English literal as the non-de branch's content)
- **THEN** no such pattern remains in the codebase for user-facing string content
- **AND** any locale-derived string content goes through the `getDict(locale)` lookup or an explicit `Record<Locale, T>` map that names every supported locale

#### Scenario: Dutch render does not silently fall through to English
- **WHEN** a visitor renders any page on `/nl/...` (or any error boundary while in `nl` locale, or any OG-tagged response for an `nl` row)
- **THEN** every user-visible string on that page is in Dutch (matching the `nl.ts` dictionary or an `nl`-keyed entry in a `Record<Locale, T>` map)
- **AND** no string accidentally renders in English
- **AND** legally-significant page bodies (imprint, privacy) without a Dutch original render the localized translation-pending notice before the English body (per the legally-significant exemption)

#### Scenario: OG locale code matches the page locale
- **WHEN** a page renders its OpenGraph metadata for a `de` or `nl` row (including pages that override the layout-level `openGraph` block)
- **THEN** the `og:locale` value is `de_DE` or `nl_NL` respectively (not `en_US`, not missing)
- **AND** the value comes from a `Record<Locale, string>` map, not an inline ternary that defaults to the English value
- **AND** the rendered HTML contains exactly one `og:locale` meta tag

#### Scenario: Future locale addition is type-driven
- **WHEN** a future change adds a new locale (e.g., `fr`)
- **THEN** the typecheck immediately fails until every `Record<Locale, T>` map and every dictionary file covers the new key
- **AND** no compile-time-silent fallback to English is possible
