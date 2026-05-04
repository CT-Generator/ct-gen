## ADDED Requirements

### Requirement: No English fallback for non-English locales

When the resolved locale is not `en`, every user-facing string the system renders MUST come from that locale's dictionary (or be a locale-aware derived value such as a localized URL or OG locale code). No code path MAY render an English literal — or fall through to the English dictionary — as a substitute for a missing non-English value. Missing keys in any non-English dictionary MUST be a typecheck-time hard fail (enforced by the `Dictionary` typed union: every locale dictionary file `export`s a value typed as `Dictionary`, so the TypeScript compiler rejects builds where a non-English dictionary lacks a key the English dictionary has).

This rule covers:
- Page copy (rendered via `getDict(locale).<section>.<key>`).
- Error-boundary copy (the `errors.*` keys).
- OG / social metadata that includes a locale code (`og:locale`).
- Any inline ternary or switch on `locale` that selects a string literal.
- AI-generated content (already covered by the row's persisted locale rule on `/g/[id]`).

The rule does NOT prohibit locale-conditional logic for non-content concerns: routing prefixes, format strings, date/number formats, or behavior toggles MAY branch on `locale` as long as the user-visible string content for each branch is itself locale-correct.

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

#### Scenario: OG locale code matches the page locale
- **WHEN** a page renders its OpenGraph metadata for a `de` or `nl` row
- **THEN** the `og:locale` value is `de_DE` or `nl_NL` respectively (not `en_US`)
- **AND** the value comes from a `Record<Locale, string>` map, not an inline ternary that defaults to the English value

#### Scenario: Future locale addition is type-driven
- **WHEN** a future change adds a new locale (e.g., `fr`)
- **THEN** the typecheck immediately fails until every `Record<Locale, T>` map and every dictionary file covers the new key
- **AND** no compile-time-silent fallback to English is possible
