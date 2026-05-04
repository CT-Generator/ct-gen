## 1. Error boundaries (web/app/error.tsx, web/app/global-error.tsx)

- [x] 1.1 Replace `(locale === "de" ? de : en).errors` with a `Record<Locale, Dictionary>` map lookup (`{ en, de, nl }[locale].errors`) so `nl` resolves to Dutch
- [x] 1.2 Replace `locale === "de" ? "/de" : "/"` (home href) with `locale === "en" ? "/" : `/${locale}`` so `nl` resolves to `/nl`
- [x] 1.3 Apply the same two fixes to `web/app/global-error.tsx`

## 2. Layout OG locale (web/app/layout.tsx)

- [x] 2.1 Replace `locale === "de" ? "de_DE" : "en_US"` with a `Record<Locale, string>` map (`{ en: "en_US", de: "de_DE", nl: "nl_NL" }[locale]`)

## 3. Build wizard progress label (web/components/build-wizard.tsx)

- [x] 3.1 Add `move_label` key to `wizard` section of `web/lib/i18n/en.ts` Dictionary type and value (`Move`)
- [x] 3.2 Add value to `de.ts` (`Schritt`) and `nl.ts` (`Stap` — pass-1 literal, mark with `// FIXME: pass 2` per project convention)
- [x] 3.3 Wire `wizard.move_label` through the existing `WizardLabels` prop type
- [x] 3.4 Replace both `props.locale === "de" ? "Schritt" : "Move"` ternaries with `props.labels.move_label`
- [x] 3.5 Pass the new label from the server-component wrapper at `web/app/build/[id]/page.tsx` (no change needed — page already passes `labels={dict.wizard}`, which now includes `move_label`)

## 4. Compile gates

- [x] 4.1 `npx tsc --noEmit` clean (typecheck enforces the new key across all three dictionaries)
- [x] 4.2 `npx next lint` clean
- [x] 4.3 `npx next build` succeeds

## 5. Live verification

Verified against `npm run build` + `npm run start` on localhost:3000 with a temporary throwing route (`app/test-throw/page.tsx`, since deleted). For each cookie, `curl -b "cgen_lang=<x>" /test-throw` was inspected for `<html lang>`, `og:locale`, error h1, and home href.

- [x] 5.1 Trigger an error on `/nl/<route>` — RSC payload contains Dutch copy ("Niet gevonden.", "Deze pagina bestaat niet — of de theorie is verwijderd.", "← Terug naar de startpagina") and the home link href is `"/nl"`. With `cgen_lang=nl` the same Dutch path renders against `/test-throw`.
- [x] 5.2 `og:locale` per route: `/recipe` → `en_US`, `/de/recipe` → `de_DE`, `/nl/recipe` → `nl_NL`. Map-driven, no inline ternary.
- [x] 5.3 Wizard progress label: not exercised against a live build row (would need an OpenAI dispatch + DB row). Verified statically: `WizardLabels.move_label` typed; both `Schritt`/`Move` inline ternaries gone (grep clean); `dict.wizard.move_label` flows through unchanged from the server-component wrapper at `web/app/build/[id]/page.tsx`'s existing `labels={dict.wizard}` prop. Typecheck proves Dutch dict supplies `"Stap"` for the `nl` branch.
- [x] 5.4 `/de` regression: `cgen_lang=de` cookie returned German error copy ("Nicht gefunden", "Zurück zur Startseite"), `<html lang="de">`, and `og:locale = de_DE`.
- [x] 5.5 `/` (en) regression: `cgen_lang=en` cookie returned English copy ("Not found", "Back to the home page"), `<html lang="en">`, and `og:locale = en_US`.

## 6. Final validation

- [x] 6.1 `openspec validate nl-no-english-fallback --strict` passes
- [x] 6.2 Grep verifies no remaining `locale === "de" ? <string-literal> : <string-literal>` patterns in `web/app/` or `web/components/`. Bonus fix in scope: `web/app/teach/page.tsx:43` had `locale === "de" && t.pdf_de_warning` gating the "PDF only in English" warning so Dutch users missed it — simplified to `t.pdf_de_warning &&` (gates purely on the dictionary value, which is the empty string in `en.ts` and a translated warning in `de.ts`/`nl.ts`).
