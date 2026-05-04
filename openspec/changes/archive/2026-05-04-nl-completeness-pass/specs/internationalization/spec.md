## MODIFIED Requirements

### Requirement: Locale toggle in masthead

The masthead component SHALL render a segmented toggle that switches the active locale. The toggle's visible options are the union of `VISIBLE_LOCALES` and the currently-resolved locale (deduped) — guaranteeing that the visitor's current locale always has its own pill in the toggle, even if a feature flag (e.g. `DUTCH_LAUNCHED`) would otherwise hide it. Clicking any inactive locale MUST navigate to the equivalent path under that locale's URL prefix and update the `cgen_lang` cookie. The active locale MUST be visually emphasized (filled / underlined / accent color) AND MUST carry `aria-current="true"` on its pill so screen readers announce it as the current selection. The control MUST remain visible and usable on the narrowest supported viewport.

#### Scenario: Toggle is visible on every page
- **WHEN** any page that renders the masthead is loaded
- **THEN** the toggle is present in the masthead with the active locale's label visible
- **AND** the active locale is visually emphasized
- **AND** the active locale's pill has `aria-current="true"`

#### Scenario: Active locale always present even when launch-gated
- **WHEN** the active locale is not in `VISIBLE_LOCALES` (e.g., NL when `DUTCH_LAUNCHED=false`) but a visitor reaches a `/<locale>/...` URL directly
- **THEN** the toggle still renders a pill for the active locale (added to the visible set for that visitor's masthead)
- **AND** the active pill is visually emphasized so the visitor knows which locale they are viewing

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
- **THEN** all visible toggle pills remain tappable (≥32px hit target each)
- **AND** the toggle does not overflow horizontally past the masthead's right edge

## ADDED Requirements

### Requirement: Permalink visit redirects to the row's locale URL when prefixes mismatch

When a visitor reaches `/g/<short-id>` (English-default URL) or any locale-prefixed equivalent (`/de/g/<short-id>`, `/nl/g/<short-id>`) for a row whose persisted locale differs from the URL's prefix, the page SHALL respond with an HTTP redirect to the canonical URL under the row's locale prefix. After the redirect, `<html lang>`, masthead chrome, content body, and OG metadata all match the row's locale. This makes the spec-statement "the page renders in the locale of the stored generation row" true at the URL level, not just at the content level.

#### Scenario: Cross-locale visit redirects
- **WHEN** a visitor reaches `/de/g/<short-id>` for a row whose persisted locale is `en`
- **THEN** the response is an HTTP redirect to `/g/<short-id>` (English canonical)
- **AND** the redirected page renders `<html lang="en">`, English masthead, English content, and `og:locale="en_US"`

#### Scenario: Same-locale visit does not redirect
- **WHEN** a visitor reaches `/de/g/<short-id>` for a row whose persisted locale is `de`
- **THEN** no redirect occurs
- **AND** the page renders normally with `<html lang="de">` and German chrome + content

#### Scenario: English-default URL with non-English row redirects
- **WHEN** a visitor reaches `/g/<short-id>` for a row whose persisted locale is `nl`
- **THEN** the response is an HTTP redirect to `/nl/g/<short-id>`
- **AND** the redirected page renders `<html lang="nl">` and Dutch chrome + content

#### Scenario: Redirect preserves nothing else
- **WHEN** the redirect fires
- **THEN** the redirect target is exactly the canonical `localizedHref('/g/<short-id>', rowLocale)` — no query parameters, hashes, or other state are added or removed
- **AND** the visitor's session-hash cookie is unchanged
