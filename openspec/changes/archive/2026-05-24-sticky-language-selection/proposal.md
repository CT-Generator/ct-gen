## Why

Visitors get silently flipped to a different language without ever clicking the locale toggle. The most common path: a returning English user opens a shared German permalink (`/de/g/<id>`), and from that point on every menu item — Recipe, Teach, About — opens in German. The cookie has been clobbered behind the user's back, and the only way back is to find the toggle and click EN again. The user's stated mental model — "first load picks a sensible default, then my explicit choice sticks" — does not match the current behavior, where merely *viewing* a foreign-locale page is treated as an implicit language switch.

This change reframes the cookie as a record of the visitor's **explicit chrome-language choice**, not a side-effect of the URL prefix they happened to land on.

## What Changes

- **BREAKING** (behavioral): The `cgen_lang` cookie is only written when the user explicitly selects a language via the masthead locale toggle, or on the very first visit (Accept-Language → English fallback). Middleware no longer overwrites the cookie when a request happens to carry a `/de/` or `/nl/` URL prefix.
- Permalink pages (`/g/<id>`, `/story/<uuid>`, `/build/<id>`) stop redirecting visitors to the row's locale URL. The page renders the row's persisted content in the row's language (German content stays German — that's what was authored), but the **masthead, locale toggle, footer, and every navigation link** render in the visitor's chrome locale (read from `cgen_lang`). Clicking "Recipe" from a foreign-locale permalink takes the visitor to *their own* `/recipe`, not the row's `/de/recipe`.
- The masthead's locale-toggle pills become the **only** UI surface that writes the language cookie. Every other internal link is built with `localizedHref(path, chromeLocale)` so it lands in the visitor's chosen locale.
- First-visit Accept-Language redirect behavior is preserved: a brand-new visitor with `Accept-Language: de-DE` and no cookie is still redirected from `/` to `/de/` and the cookie is set to `de`. After this one-time imprint, only the toggle can move it.
- Visitor analytics gain a small refinement: `page_views.locale` continues to record the *rendered chrome locale* (the visitor's choice), since that is what the visitor actually experienced — not the URL prefix of any permalink they viewed.

Out of scope: the H1 grammar rules, the dictionaries-as-source-of-truth rule, the legally-significant-page exemption, and the no-English-fallback rule are unchanged.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `internationalization`: Reworking locale resolution so the cookie reflects explicit user choice only; permalink visits no longer redirect or rewrite the URL to the row's locale; chrome locale and content locale are allowed to diverge on permalink pages.

## Impact

- **Affected code**:
  - `web/middleware.ts` — cookie-write logic narrowed.
  - `web/app/g/[id]/page.tsx` — drops the `visitorLocale !== rowLocale` redirect; threads chrome locale separately from row locale through the component tree.
  - `web/app/story/[uuid]/page.tsx` — drops the analogous redirect.
  - `web/app/build/[id]/page.tsx` — chrome (masthead, footer, nav strings, link targets) reads visitor locale, not row locale; wizard step content continues to follow row locale.
  - `web/components/zine/topbar.tsx` + `topbar-client.tsx` — toggle remains the sole cookie-writer; on click the cookie is written *before* navigation so the next middleware pass sees the new value.
  - `web/lib/i18n/index.ts` — `readLocale()` semantics unchanged but documented as "visitor chrome locale, from middleware-set x-locale, ultimately from cgen_lang".
- **Affected specs**: `internationalization` (modified — several requirement deltas described in `specs/internationalization/spec.md`).
- **Affected behavior**: `visitor-analytics` schema is unchanged; `page_views.locale` already records the rendered chrome locale via the layout-level capture, which now consistently reflects the visitor's choice.
- **No DB migration required.** No new env vars. No new dependencies.
- **Risk**: A user who previously relied on the redirect-and-flip behavior (e.g., bookmarking `/de/g/<id>` to "switch" to German) will need to use the toggle instead. Acceptable — the toggle is the canonical UI for that intent.
