## ADDED Requirements

### Requirement: Two supported locales, English and German

The system SHALL recognize exactly two locales — `en` (English, default) and `de` (German). Every request resolves to one of these two; no fallback to a third locale exists. Future locales are added by extending the `Locale` union and adding a corresponding dictionary file.

#### Scenario: Type-safe locale union
- **WHEN** the build compiles
- **THEN** `Locale` is a TypeScript union of exactly `'en' | 'de'`
- **AND** every page that reads the locale receives one of these two values, never `undefined`, never any other string

### Requirement: URL prefix routes German content; un-prefixed routes serve English

The system SHALL serve German content under URL paths beginning with `/de/`. Un-prefixed paths (`/`, `/recipe`, `/about`, `/g/<id>`, etc.) MUST continue to serve English content exactly as today. The `/de/` prefix is the *only* visible URL difference between locales.

#### Scenario: English path serves English
- **WHEN** a request arrives at `/recipe`
- **THEN** the response is the recipe page in English
- **AND** the page's `<html lang>` attribute is `en`

#### Scenario: German path serves German
- **WHEN** a request arrives at `/de/recipe`
- **THEN** the response is the recipe page in German
- **AND** the page's `<html lang>` attribute is `de`

#### Scenario: German path resolves to the same physical file as English
- **WHEN** the middleware processes a request to `/de/<rest>`
- **THEN** the path is internally rewritten to `/<rest>` so the same Next.js page file renders
- **AND** the request headers carry `x-locale: de` so the page reads the correct dictionary

### Requirement: Locale resolution on every request

Middleware SHALL set the request locale on every non-asset, non-API request before any page renders. The resolution order is:

1. Explicit prefix in the URL (`/de/...` → `de`; otherwise `en`).
2. The `cgen_lang` cookie if set.
3. The `Accept-Language` header (highest-priority match against the two supported locales) — only when no cookie yet exists.
4. Fall back to `en`.

The resolved locale MUST be available to the rendered page via a request header.

#### Scenario: First-time German-speaking visitor
- **WHEN** a request arrives at `/` with `Accept-Language: de-DE,de;q=0.9,en;q=0.5` and no `cgen_lang` cookie
- **THEN** the middleware sets the `cgen_lang` cookie to `de`
- **AND** redirects to `/de/` so the URL reflects the chosen locale
- **AND** the redirect is HTTP 302 (temporary, so a search engine still indexes `/` as English)

#### Scenario: Returning visitor with cookie
- **WHEN** a request arrives at `/recipe` with `cgen_lang=de` cookie set
- **THEN** the middleware redirects to `/de/recipe`
- **AND** the cookie is refreshed (its max-age window restarts)

#### Scenario: Permalink bypasses Accept-Language redirect
- **WHEN** a request arrives at `/g/<shortid>` with `Accept-Language: de` and no cookie
- **THEN** the middleware does NOT redirect to `/de/g/<shortid>`
- **AND** the page renders in the locale of the stored generation row (English for legacy/migrated rows; the row's `locale` for new rows)

#### Scenario: Explicit prefix wins over cookie
- **WHEN** a visitor with `cgen_lang=en` cookie navigates to `/de/recipe`
- **THEN** the response is the German recipe page (the URL prefix wins)
- **AND** the cookie is updated to `de` so the next visit defaults to German

### Requirement: `cgen_lang` cookie persists locale preference

The system SHALL set a `cgen_lang` cookie with values `en` or `de`, max-age 1 year, `SameSite=Lax`, NOT `HttpOnly` (the locale toggle's client component must read+write it). The cookie MUST be independent of the existing `cgen_sid` session-hash cookie — switching locales does NOT change the session hash.

#### Scenario: Cookie set on first visit
- **WHEN** the middleware resolves a locale on a request that has no `cgen_lang` cookie
- **THEN** the response sets `cgen_lang=<resolved>` with the documented attributes
- **AND** the existing `cgen_sid` cookie (if any) is unchanged

#### Scenario: Locale toggle updates the cookie
- **WHEN** a user clicks the EN→DE locale toggle in the masthead
- **THEN** the client writes `cgen_lang=de` directly via `document.cookie`
- **AND** the browser navigates to the `/de/<current-path>` equivalent
- **AND** the session hash (`cgen_sid` cookie) is unchanged

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

The masthead component SHALL render a small two-state toggle ("EN | DE") that switches the active locale. Clicking the inactive locale MUST navigate to the equivalent path under the other locale's URL prefix and update the `cgen_lang` cookie.

#### Scenario: Toggle is visible on every page
- **WHEN** any page that renders the masthead is loaded
- **THEN** the toggle is present in the masthead with both labels visible
- **AND** the active locale is visually emphasized (filled / underlined / accent color)

#### Scenario: Toggle updates URL on click
- **WHEN** a user on `/de/recipe` clicks "EN" in the toggle
- **THEN** the browser navigates to `/recipe`
- **AND** the `cgen_lang` cookie is updated to `en`

#### Scenario: Toggle preserves the page
- **WHEN** a user on `/de/about` clicks "EN"
- **THEN** the browser navigates to `/about` (same logical page, English)
- **AND** does NOT navigate to `/`

### Requirement: `<html lang>` matches the active locale

The rendered `<html>` element SHALL set the `lang` attribute to the active locale's BCP-47 tag (`en` or `de`).

#### Scenario: lang attribute correct
- **WHEN** a German page renders
- **THEN** the response HTML contains `<html lang="de" ...>`
- **AND** assistive technologies announce the page in German

### Requirement: Tracking captures the un-prefixed path

The visitor-tracking capture (introduced by the `visitor-tracking` change) SHALL record the un-prefixed path for `page_views.path`, regardless of which locale the visitor is on. The locale is captured separately as a column on `page_views` so per-locale stats are possible without polluting the top-pages chart with `/recipe` and `/de/recipe` as two distinct entries.

#### Scenario: German visitor's recipe view records as /recipe
- **WHEN** a visitor on `/de/recipe` triggers a page-view capture
- **THEN** the inserted `page_views` row has `path = '/recipe'`
- **AND** a new `locale` column on `page_views` (added by this change) records `'de'`
