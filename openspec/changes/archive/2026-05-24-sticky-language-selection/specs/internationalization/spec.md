## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Permalink visit redirects to the row's locale URL when prefixes mismatch

**Reason**: This redirect was the root cause of unwanted language flips. When a visitor with cookie `en` clicked a shared `/de/g/<id>` link for a German row, the page redirected them to `/g/<id>` (or vice versa for English rows reached via `/de/g/<id>`), and the redirected request then triggered a `cgen_lang` cookie rewrite in middleware — silently flipping the visitor's chosen UI language. With the cookie-write logic now narrowed (no cookie writes after the first-visit imprint) AND chrome and content allowed to diverge per `<html lang>`-matches-content-language, the redirect is no longer needed.

**Migration**: Existing inbound links to `/de/g/<id>` for an English row, or `/g/<id>` for a German row, continue to work — they render at the URL the visitor typed, with the row's content in the row's language and the masthead/nav in the visitor's chrome language. No URL is broken; no redirect needs to be preserved; the visitor's cookie no longer changes on these visits. Operators who relied on the redirect for canonical-URL purposes should rely instead on the `og:url` meta tag, which continues to point to the row's canonical permalink (`localizedHref('/g/<id>', rowLocale)`).
