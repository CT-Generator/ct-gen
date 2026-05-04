## Why

Persona-driven user testing of the just-shipped `nl-no-english-fallback` rule surfaced two gaps that the original change scoped out but that fall directly under the rule's promise:

1. **`/g/[id]` openGraph metadata is locale-blind.** The per-page `generateMetadata` overrides the layout's `openGraph` block without including a `locale` field, so every social share preview drops the `og:locale` tag entirely. The English `og:description` ("Made with the four-move recipe…") is rendered for German and Dutch rows alike. Confirmed live: `/g/<id>`, `/de/g/<id>`, and `/nl/g/<id>` all return empty `og:locale` and the same English description.
2. **`/imprint` and `/privacy` page bodies are hardcoded English regardless of locale.** `/de/imprint`, `/nl/imprint`, `/de/privacy`, `/nl/privacy` all render `<h1>Imprint</h1>` (English). The `multilingual-german` change's task 3.4 explicitly DEFERRED German legal-original authoring; nothing was scheduled for Dutch. The just-shipped no-fallback rule now contradicts this state — the spec says no English fallback for non-en locales, but `/de/imprint` and `/nl/imprint` silently fall back.

Both gaps were noted in the persona review and acknowledged but excluded from `nl-no-english-fallback`'s scope. This change closes them.

## What Changes

- **`/g/[id]` `generateMetadata`**: include `og:locale` mapped from the row locale (`Record<Locale, string>` map: `en_US`, `de_DE`, `nl_NL`); source `og:description` from a locale-keyed string in the dictionary so a German row's share preview is in German.
- **Imprint + privacy translation-pending notice**: when a non-English visitor lands on `/de/imprint`, `/nl/imprint`, `/de/privacy`, or `/nl/privacy` and no jurisdictional original exists yet for that locale, the page MUST render a visible notice in the active locale at the top of the page body — naming the gap and explaining that the English source body follows. This makes the deferred state visible to the visitor instead of silently falling through to English.
- **Internationalization spec carve-out**: explicitly document that legally-significant page bodies (imprint, privacy) are subject to a separate jurisdiction-original authoring requirement; until that requirement is met for a given locale, the page MAY render the English source body provided the translation-pending notice is shown. This reconciles the no-fallback rule with the deferred legal-authoring reality.

## Capabilities

### New Capabilities
<!-- None — extends two existing capabilities. -->

### Modified Capabilities
- `permalinks-and-sharing`: OpenGraph metadata for `/g/[id]` MUST include locale-aware `og:locale` and a locale-aware `og:description` matching the row's persisted locale.
- `internationalization`: tighten the OG-locale scenario to cover per-page metadata overrides; add an explicit carve-out + requirement for legally-significant pages (imprint, privacy) — rendering the English body without a translation-pending notice is a violation.

## Impact

- **UI**: edits to `web/app/g/[id]/page.tsx` (extend `generateMetadata`); edits to `web/app/imprint/page.tsx` and `web/app/privacy/page.tsx` (add the notice rendering).
- **i18n**: new dictionary keys: `meta.og_description_generation` (or similar — the locale-keyed share description), and `legal.translation_pending_notice_h` + `legal.translation_pending_notice_body`. Values for en/de/nl. EN value for `translation_pending_notice` is "—" or omitted because English is the source.
- **Specs**: two modified-capability deltas. No new schema, no new routes, no new persistence, no new model calls.
- **Latency / cost**: zero.
- **Backwards compatibility**: older /g/[id] rows render the new locale-aware metadata immediately because the row's locale is already persisted. Imprint/privacy: English visitors see no change; German + Dutch visitors see the new notice.
- **Pedagogical posture**: closes the silent-violation pattern and surfaces the legal-authoring debt visibly to users instead of pretending it isn't there.
