## 1. Dictionary additions

- [x] 1.1 Add `meta.og_description_generation` (string) to the `Dictionary` type in `web/lib/i18n/en.ts`
- [x] 1.2 Add value to `en.ts` (carry over the current English description: "Made with the four-move recipe. Pick an event, a culprit, a motive — watch the theory build itself.")
- [x] 1.3 Add German value to `de.ts` (idiomatic translation; flag with `// FIXME: pass 2` per project convention if it reads wooden)
- [x] 1.4 Add Dutch value to `nl.ts` with `// FIXME: pass 2` marker
- [x] 1.5 Add new dictionary section `legal` with `translation_pending_h` and `translation_pending_body` keys to the `Dictionary` type in `en.ts`
- [x] 1.6 EN values: `translation_pending_h` = "" (or omitted-rendered) and `translation_pending_body` = "" — English page never renders the notice, but the keys must exist for type completeness; document in a comment
- [x] 1.7 DE values: `translation_pending_h: "Übersetzung in Arbeit"`, `translation_pending_body: "Diese Seite enthält rechtlich relevante Inhalte, die noch nicht in deutscher Originalfassung vorliegen. Es folgt der englische Quelltext."`
- [x] 1.8 NL values: `translation_pending_h: "Vertaling in voorbereiding"`, `translation_pending_body: "Deze pagina bevat juridisch relevante inhoud die nog niet in Nederlandse originele versie beschikbaar is. Hieronder volgt de Engelse brontekst."` (mark with `// FIXME: pass 2`)

## 2. /g/[id] generateMetadata fix

- [x] 2.1 In `web/app/g/[id]/page.tsx` `generateMetadata`, define a `Record<Locale, string>` map for OG locales (`{ en: "en_US", de: "de_DE", nl: "nl_NL" }`)
- [x] 2.2 Read `rowLocale` from the loaded gen row using the existing `isLocale` guard (`const rowLocale: Locale = isLocale(gen.locale) ? gen.locale : "en"`)
- [x] 2.3 Add `locale: OG_LOCALE_MAP[rowLocale]` to the returned `openGraph` block
- [x] 2.4 Replace the hardcoded English `description` with `getDict(rowLocale).meta.og_description_generation`
- [x] 2.5 Apply the same locale-keyed description to `twitter.description`
- [x] 2.6 Confirm `og:locale` appears exactly once in the rendered HTML for each test row (no missing, no duplicates)

## 3. Imprint + privacy translation-pending notice

- [x] 3.1 In `web/app/imprint/page.tsx`, read locale via `await readLocale()`; if `locale !== "en"`, render a notice block above the existing English page body
- [x] 3.2 Notice renders as: a small `<div>` with two paragraphs — heading from `t.legal.translation_pending_h` (display-styled) and body from `t.legal.translation_pending_body` (regular text); subdued styling so it doesn't dominate the page
- [x] 3.3 The notice precedes the existing English JSX body without modifying it — the body still renders as today
- [x] 3.4 Apply the same pattern to `web/app/privacy/page.tsx`
- [x] 3.5 Confirm English visitors (`/imprint`, `/privacy`) see no notice — only the existing body
- [x] 3.6 Confirm German visitors (`/de/imprint`, `/de/privacy`) see the German notice on top + English body
- [x] 3.7 Confirm Dutch visitors (`/nl/imprint`, `/nl/privacy`) see the Dutch notice on top + English body

## 4. Compile gates

- [x] 4.1 `npx tsc --noEmit` clean (typecheck enforces the new `meta.og_description_generation` and `legal.*` keys across all three dictionaries)
- [x] 4.2 `npx next lint` clean
- [x] 4.3 `npx next build` succeeds

## 5. Live verification

- [x] 5.1 `/g/<en-row>` returns `og:locale="en_US"` and English `og:description`
- [x] 5.2 `/de/g/<de-row>` returns `og:locale="de_DE"` and German `og:description`
- [x] 5.3 `/nl/g/<de-row>` (visiting a DE row through /nl/ prefix) returns `og:locale="de_DE"` and German `og:description` — the row locale, not the visitor locale, drives the share preview
- [x] 5.4 `/imprint` renders with no translation-pending notice; English body unchanged
- [x] 5.5 `/de/imprint` renders the German notice ("Übersetzung in Arbeit") above the English body
- [x] 5.6 `/nl/imprint` renders the Dutch notice ("Vertaling in voorbereiding") above the English body
- [x] 5.7 Same checks (5.4–5.6) for `/privacy`, `/de/privacy`, `/nl/privacy`

## 6. Final validation

- [x] 6.1 `openspec validate localize-share-and-legal-pages --strict` passes
- [x] 6.2 Spot-check OG previews: paste `/de/g/<de-row>` URL into a Slack/Discord/Bluesky preview → confirm preview description renders in German
