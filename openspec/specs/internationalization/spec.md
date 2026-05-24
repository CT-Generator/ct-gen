# internationalization Specification

## Purpose
TBD - created by archiving change multilingual-german. Update Purpose after archive.
## Requirements
### Requirement: Two supported locales, English and German

The system SHALL recognize exactly three locales — `en` (English, default), `de` (German), and `nl` (Dutch). Every request resolves to one of these three; no fallback to a fourth locale exists. Future locales are added by extending the `Locale` union and adding a corresponding dictionary file.

#### Scenario: Type-safe locale union
- **WHEN** the build compiles
- **THEN** `Locale` is a TypeScript union of exactly `'en' | 'de' | 'nl'`
- **AND** every page that reads the locale receives one of these three values, never `undefined`, never any other string

### Requirement: URL prefix routes German content; un-prefixed routes serve English

The system SHALL serve German content under URL paths beginning with `/de/` and Dutch content under URL paths beginning with `/nl/`. Un-prefixed paths (`/`, `/recipe`, `/about`, `/g/<id>`, etc.) MUST continue to serve English content exactly as today. The `/de/` and `/nl/` prefixes are the *only* visible URL differences between locales.

#### Scenario: English path serves English
- **WHEN** a request arrives at `/recipe`
- **THEN** the response is the recipe page in English
- **AND** the page's `<html lang>` attribute is `en`

#### Scenario: German path serves German
- **WHEN** a request arrives at `/de/recipe`
- **THEN** the response is the recipe page in German
- **AND** the page's `<html lang>` attribute is `de`

#### Scenario: Dutch path serves Dutch
- **WHEN** a request arrives at `/nl/recipe`
- **THEN** the response is the recipe page in Dutch
- **AND** the page's `<html lang>` attribute is `nl`

#### Scenario: Prefixed path resolves to the same physical file as English
- **WHEN** the middleware processes a request to `/de/<rest>` or `/nl/<rest>`
- **THEN** the path is internally rewritten to `/<rest>` so the same Next.js page file renders
- **AND** the request headers carry `x-locale: de` or `x-locale: nl` so the page reads the correct dictionary

### Requirement: Locale resolution on every request

Middleware SHALL set the chrome locale on every non-asset, non-API request before any page renders. The chrome locale is the language the masthead, footer, navigation links, locale toggle, and every internal link target render in. The resolution order is:

1. The `cgen_lang` cookie if set to a supported locale.
2. The URL prefix (`/de/...` → `de`; `/nl/...` → `nl`; otherwise `en`) — only when no cookie exists.
3. The `Accept-Language` header (highest-priority match against the three supported locales) — only when no cookie exists and no prefix is present.
4. Fall back to `en`.

The resolved chrome locale MUST be available to the rendered page via the `x-locale` request header. The URL prefix is still consulted independently for path rewriting (so `/de/recipe` continues to serve `app/recipe/page.tsx`), but it no longer governs the chrome locale once a cookie is set.

#### Scenario: First-time German-speaking visitor
- **WHEN** a request arrives at `/` with `Accept-Language: de-DE,de;q=0.9,en;q=0.5` and no `cgen_lang` cookie
- **THEN** the middleware sets the `cgen_lang` cookie to `de`
- **AND** redirects to `/de/` so the URL reflects the chosen locale
- **AND** the redirect is HTTP 302 (temporary, so a search engine still indexes `/` as English)

#### Scenario: First-time Dutch-speaking visitor
- **WHEN** a request arrives at `/` with `Accept-Language: nl-NL,nl;q=0.9,en;q=0.5` and no `cgen_lang` cookie
- **THEN** the middleware sets the `cgen_lang` cookie to `nl`
- **AND** redirects to `/nl/` so the URL reflects the chosen locale
- **AND** the redirect is HTTP 302

#### Scenario: First-time Belgian-Dutch visitor
- **WHEN** a request arrives at `/` with `Accept-Language: nl-BE,nl;q=0.9,fr;q=0.5` and no `cgen_lang` cookie
- **THEN** the middleware sets the `cgen_lang` cookie to `nl`
- **AND** redirects to `/nl/`
- **AND** no `nl-BE` variant is served — the single Dutch dictionary covers both audiences

#### Scenario: Returning visitor with cookie navigates to /recipe
- **WHEN** a request arrives at `/recipe` with `cgen_lang=de` cookie set
- **THEN** the middleware resolves chrome locale to `de`
- **AND** the page renders with German masthead, German nav strings, and a `/de/recipe`-style locale toggle for any DE-pill
- **AND** the cookie is NOT rewritten (it already matches the resolved locale)
- **AND** the URL bar remains `/recipe` (no redirect)

#### Scenario: Permalink bypasses Accept-Language redirect
- **WHEN** a request arrives at `/g/<shortid>` or `/story/<uuid>` with `Accept-Language: nl` and no cookie
- **THEN** the middleware does NOT redirect to `/nl/g/<shortid>` or `/nl/story/<uuid>`
- **AND** the page renders with chrome locale = `en` (the URL had no prefix, no cookie, Accept-Language is checked but permalink paths skip the imprint redirect)
- **AND** the page content renders in the locale of the stored generation row or seed event

#### Scenario: URL prefix on a permalink does NOT change the chrome locale of a cookied visitor
- **WHEN** a visitor with `cgen_lang=en` cookie clicks a shared link to `/de/g/<shortid>` for a German row
- **THEN** the middleware resolves chrome locale to `en` (cookie wins over prefix)
- **AND** the path is rewritten to `/g/<shortid>` so `app/g/[id]/page.tsx` renders
- **AND** the `x-locale` request header is `en`
- **AND** the response does NOT rewrite the `cgen_lang` cookie (it stays `en`)
- **AND** the masthead, footer, and locale toggle render in English
- **AND** the row's German content (paragraphs, H1) renders unchanged

#### Scenario: Tie-broken Accept-Language follows header order
- **WHEN** a request arrives at `/` with `Accept-Language: de;q=1.0, nl;q=1.0` and no cookie
- **THEN** the middleware picks the first supported locale in the listed order (`de` here)
- **AND** redirects to `/de/`

### Requirement: `cgen_lang` cookie persists locale preference

The system SHALL set a `cgen_lang` cookie with values `en`, `de`, or `nl`, max-age 1 year, `SameSite=Lax`, NOT `HttpOnly` (the locale toggle's client component must read+write it). The cookie MUST be independent of the existing `cgen_sid` session-hash cookie — switching locales does NOT change the session hash. Any cookie value outside the three accepted enum entries MUST be ignored as if the cookie were absent.

The cookie SHALL be written in exactly two situations:

1. **First-visit imprint**: middleware sets the cookie on a request that has no `cgen_lang` cookie, to the locale it resolves for that request (Accept-Language → English fallback, per the resolution order above).
2. **Explicit toggle click**: the masthead locale-toggle client writes the cookie via `document.cookie` immediately before navigating to the locale-prefixed equivalent path.

The cookie MUST NOT be rewritten by middleware on any subsequent request. In particular, navigating to a locale-prefixed URL (`/de/...`, `/nl/...`) — including via a permalink the visitor did not author — MUST NOT cause the cookie to change.

#### Scenario: Cookie set on first visit
- **WHEN** the middleware resolves a locale on a request that has no `cgen_lang` cookie
- **THEN** the response sets `cgen_lang=<resolved>` with the documented attributes
- **AND** the existing `cgen_sid` cookie (if any) is unchanged

#### Scenario: Locale toggle updates the cookie
- **WHEN** a user clicks any locale chip in the masthead toggle
- **THEN** the client writes `cgen_lang=<chosen>` directly via `document.cookie`
- **AND** the browser navigates to the corresponding `<prefix><current-path>` equivalent
- **AND** the session hash (`cgen_sid` cookie) is unchanged

#### Scenario: Unknown cookie value is ignored
- **WHEN** a request arrives with `cgen_lang=fr` (or any other unknown value)
- **THEN** the middleware treats the cookie as absent
- **AND** falls through to URL prefix, then Accept-Language matching, then English
- **AND** the response sets `cgen_lang` to the newly resolved locale (first-visit imprint applies because the cookie was effectively absent)

#### Scenario: Visiting a foreign-locale permalink does NOT change the cookie
- **WHEN** a visitor with `cgen_lang=en` cookie visits `/de/g/<shortid>` (or `/nl/g/<shortid>`, or `/de/story/<uuid>`, etc.)
- **THEN** the response does NOT set the `cgen_lang` cookie
- **AND** subsequent navigation to any in-app link continues to render chrome in English

#### Scenario: Visiting a foreign-prefixed non-permalink does NOT change the cookie
- **WHEN** a visitor with `cgen_lang=en` cookie visits `/de/recipe` directly (e.g., via an external link)
- **THEN** the response does NOT set the `cgen_lang` cookie
- **AND** the page renders with English chrome and English content (chrome locale wins; the URL prefix only controlled which page file rendered, which is the same English `recipe/page.tsx`)
- **AND** the visitor sees no flip in their UI language

### Requirement: Locale-keyed dictionaries are the single source of UI copy

Every reader-facing UI string SHALL be read from a per-locale dictionary file at `web/lib/i18n/<locale>.ts`. No JSX file outside the dictionaries MAY contain a literal English (or German) reader-facing string for a path that exists in both locales. (Strings on `/stats/*`, error stack traces, and developer-facing log messages are exempt.)

#### Scenario: Dictionary lookup at render
- **WHEN** any user-facing page renders
- **THEN** every string in the rendered HTML traces back to a key in either `web/lib/i18n/en.ts` or `web/lib/i18n/de.ts`
- **AND** a grep for hardcoded English phrases (e.g. "the four moves") in `web/app/` outside `lib/i18n/` returns no matches in user-facing components

#### Scenario: Missing key falls back loudly
- **WHEN** a `t(key)` call requests a key that exists in `en.ts` but not in `de.ts`
- **THEN** the rendered output is the English fallback wrapped in a marker (e.g. `[!missing-de] <english>`) in development, and the English string un-marked in production
- **AND** TypeScript flags the missing key at build time when both dictionaries share a typed key union

### Requirement: Server-side dictionary lookup, not client-bundled

Every page that reads from the dictionaries SHALL be a Server Component (or use a `t()` helper from a Server Component). The rendered HTML MUST already contain the resolved strings — no per-locale dictionary is shipped to the browser.

#### Scenario: Network-tab audit
- **WHEN** a German user visits `/de/recipe`
- **THEN** the JavaScript bundle delivered to the browser does NOT contain the German dictionary's source content as a string literal
- **AND** the rendered HTML contains the resolved German strings already

### Requirement: Locale toggle in masthead

The masthead component SHALL render a segmented toggle that switches the active locale. The toggle's visible options are the union of `VISIBLE_LOCALES` and the currently-resolved chrome locale (deduped) — guaranteeing that the visitor's current locale always has its own pill in the toggle, even if a feature flag (e.g. `DUTCH_LAUNCHED`) would otherwise hide it. Clicking any inactive locale MUST navigate to the locale-prefixed equivalent of the current path AND write the `cgen_lang` cookie to the chosen locale. The active locale MUST be visually emphasized (filled / underlined / accent color) AND MUST carry `aria-current="true"` on its pill so screen readers announce it as the current selection. The control MUST remain visible and usable on the narrowest supported viewport. The toggle is the ONLY UI surface that writes `cgen_lang` from client code.

#### Scenario: Toggle is visible on every page
- **WHEN** any page that renders the masthead is loaded
- **THEN** the toggle is present in the masthead with the active chrome locale's label visible
- **AND** the active locale is visually emphasized
- **AND** the active locale's pill has `aria-current="true"`

#### Scenario: Active locale always present even when launch-gated
- **WHEN** the active chrome locale is not in `VISIBLE_LOCALES` (e.g., NL when `DUTCH_LAUNCHED=false`) but a visitor's cookie carries it
- **THEN** the toggle still renders a pill for the active locale (added to the visible set for that visitor's masthead)
- **AND** the active pill is visually emphasized so the visitor knows which locale they are viewing

#### Scenario: Toggle updates URL and cookie on click — to Dutch
- **WHEN** a user on `/recipe` (chrome locale `en`) clicks "NL" in the toggle
- **THEN** the browser writes `cgen_lang=nl` via `document.cookie`
- **AND** navigates to `/nl/recipe`
- **AND** the next request renders chrome and chrome-link targets in Dutch

#### Scenario: Toggle updates URL and cookie on click — to English
- **WHEN** a user on `/nl/about` clicks "EN" in the toggle
- **THEN** the browser writes `cgen_lang=en` via `document.cookie`
- **AND** navigates to `/about` (same logical page, English)
- **AND** does NOT navigate to `/`

#### Scenario: Toggle preserves the page across all three locales
- **WHEN** a user on `/recipe` clicks "DE" then "NL" then "EN"
- **THEN** the browser ends on `/recipe` (English) again
- **AND** at no point does the page lose its position in the navigation hierarchy

#### Scenario: Toggle remains usable on a narrow viewport
- **WHEN** the masthead is rendered at viewport widths down to 320px
- **THEN** all visible toggle pills remain tappable (≥32px hit target each)
- **AND** the toggle does not overflow horizontally past the masthead's right edge

#### Scenario: Toggle on a permalink page reflects chrome locale, not row locale
- **WHEN** a visitor with `cgen_lang=en` views `/de/g/<id>` for a German row
- **THEN** the masthead toggle shows EN as active (visitor's chrome choice)
- **AND** the toggle's NL/DE pills point to `/nl/g/<id>` and `/de/g/<id>` respectively
- **AND** clicking EN keeps the visitor on `/de/g/<id>` (already English chrome) without writing a redundant cookie value

### Requirement: `<html lang>` matches the active locale

The rendered `<html>` element SHALL set the `lang` attribute to the BCP-47 tag of the **content language** rendered in the page body — i.e., the locale that drives the headlines, paragraphs, and dictionary lookups for the page's body. On pages whose body is driven by a persisted row (`/g/<id>`, `/story/<uuid>`, `/build/<id>`), this is the row's locale. On every other page, this is the chrome locale. This matches what assistive technologies announce.

When the chrome locale differs from the content locale (a possible outcome on permalink pages now that the row-locale redirect is removed), the page MAY wrap chrome strings in nested `lang` attributes for finer-grained announcement, but is NOT required to do so in this change.

#### Scenario: lang attribute on non-permalink page
- **WHEN** an English visitor (cookie `en`) loads `/recipe`
- **THEN** the response HTML contains `<html lang="en" ...>`

#### Scenario: lang attribute on German permalink with English chrome
- **WHEN** an English visitor (cookie `en`) loads `/de/g/<id>` for a German row
- **THEN** the response HTML contains `<html lang="de" ...>` (matching the row content)
- **AND** assistive technologies announce the page body in German
- **AND** the English chrome strings inside the German `<html lang>` are not wrapped in nested `lang` attributes in this change (acceptable trade-off documented in design.md)

#### Scenario: lang attribute on same-locale permalink
- **WHEN** a German visitor (cookie `de`) loads `/de/g/<id>` for a German row
- **THEN** the response HTML contains `<html lang="de" ...>`
- **AND** chrome and content are both German — no divergence

### Requirement: Tracking captures the un-prefixed path

The visitor-tracking capture (introduced by the `visitor-tracking` change) SHALL record the un-prefixed path for `page_views.path`, regardless of which locale URL prefix the visitor's request URL carried. The `locale` column on `page_views` records the **chrome locale** the visitor experienced (the cookie-resolved locale, which is what `x-locale` reflects after this change).

#### Scenario: English visitor on /de/recipe records as path=/recipe, locale=en
- **WHEN** an English-chrome visitor (cookie `en`) loads `/de/recipe`
- **THEN** the inserted `page_views` row has `path = '/recipe'`
- **AND** the `locale` column records `'en'` (chrome locale)
- **AND** the URL prefix `de` is NOT recorded as the locale (the page rendered in English chrome regardless of prefix)

#### Scenario: German visitor's recipe view records as /recipe, locale=de
- **WHEN** a German-chrome visitor (cookie `de`) loads `/de/recipe`
- **THEN** the inserted `page_views` row has `path = '/recipe'`
- **AND** the `locale` column records `'de'`

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

