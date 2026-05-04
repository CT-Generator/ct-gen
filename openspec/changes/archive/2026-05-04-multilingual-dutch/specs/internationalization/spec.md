## MODIFIED Requirements

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

Middleware SHALL set the request locale on every non-asset, non-API request before any page renders. The resolution order is:

1. Explicit prefix in the URL (`/de/...` → `de`; `/nl/...` → `nl`; otherwise `en`).
2. The `cgen_lang` cookie if set.
3. The `Accept-Language` header (highest-priority match against the three supported locales) — only when no cookie yet exists.
4. Fall back to `en`.

The resolved locale MUST be available to the rendered page via a request header.

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

#### Scenario: Returning visitor with cookie
- **WHEN** a request arrives at `/recipe` with `cgen_lang=nl` cookie set
- **THEN** the middleware redirects to `/nl/recipe`
- **AND** the cookie is refreshed (its max-age window restarts)

#### Scenario: Permalink bypasses Accept-Language redirect
- **WHEN** a request arrives at `/g/<shortid>` with `Accept-Language: nl` and no cookie
- **THEN** the middleware does NOT redirect to `/nl/g/<shortid>`
- **AND** the page renders in the locale of the stored generation row

#### Scenario: Explicit prefix wins over cookie
- **WHEN** a visitor with `cgen_lang=en` cookie navigates to `/nl/recipe`
- **THEN** the response is the Dutch recipe page (the URL prefix wins)
- **AND** the cookie is updated to `nl` so the next visit defaults to Dutch

#### Scenario: Tie-broken Accept-Language follows header order
- **WHEN** a request arrives at `/` with `Accept-Language: de;q=1.0, nl;q=1.0` and no cookie
- **THEN** the middleware picks the first supported locale in the listed order (`de` here)
- **AND** redirects to `/de/`

### Requirement: `cgen_lang` cookie persists locale preference

The system SHALL set a `cgen_lang` cookie with values `en`, `de`, or `nl`, max-age 1 year, `SameSite=Lax`, NOT `HttpOnly` (the locale toggle's client component must read+write it). The cookie MUST be independent of the existing `cgen_sid` session-hash cookie — switching locales does NOT change the session hash. Any cookie value outside the three accepted enum entries MUST be ignored as if the cookie were absent.

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
- **AND** falls through to Accept-Language matching, then English

### Requirement: Locale toggle in masthead

The masthead component SHALL render a three-state segmented toggle (`EN | DE | NL`) that switches the active locale. Clicking any inactive locale MUST navigate to the equivalent path under that locale's URL prefix and update the `cgen_lang` cookie. The active locale MUST be visually emphasized (filled / underlined / accent color). The control MUST remain visible and usable on the narrowest supported viewport.

#### Scenario: Toggle is visible on every page
- **WHEN** any page that renders the masthead is loaded
- **THEN** the toggle is present in the masthead with all three labels visible
- **AND** the active locale is visually emphasized

#### Scenario: Toggle updates URL on click — to Dutch
- **WHEN** a user on `/de/recipe` clicks "NL" in the toggle
- **THEN** the browser navigates to `/nl/recipe`
- **AND** the `cgen_lang` cookie is updated to `nl`

#### Scenario: Toggle updates URL on click — to English
- **WHEN** a user on `/nl/about` clicks "EN" in the toggle
- **THEN** the browser navigates to `/about` (same logical page, English)
- **AND** the `cgen_lang` cookie is updated to `en`
- **AND** does NOT navigate to `/`

#### Scenario: Toggle preserves the page across all three locales
- **WHEN** a user on `/recipe` clicks "DE" then "NL" then "EN"
- **THEN** the browser ends on `/recipe` (English) again
- **AND** at no point does the page lose its position in the navigation hierarchy

#### Scenario: Toggle remains usable on a narrow viewport
- **WHEN** the masthead is rendered at viewport widths down to 320px
- **THEN** all three toggle pills remain tappable (≥32px hit target each)
- **AND** the toggle does not overflow horizontally past the masthead's right edge
