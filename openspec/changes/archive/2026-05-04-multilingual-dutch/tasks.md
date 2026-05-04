## 1. Locale framework wiring

- [x] 1.1 Extend `web/lib/i18n/types.ts`: widen `Locale` to `'en' | 'de' | 'nl'`, add `'nl'` to `SUPPORTED_LOCALES`, add `'nl'` branch to `isLocale`.
- [x] 1.2 Extend `web/lib/i18n/index.ts`: add `nl` entry to `DICTS`, extend `localizedHref` to handle the `/nl/` prefix.
- [x] 1.3 Extend `web/middleware.ts`: recognize the `/nl/` prefix in `explicitDe`-style logic (rename to `explicitPrefix` resolver if cleaner); extend `parseLocale` to accept `'nl'`; extend `parseAcceptLanguage` to match the `nl` family (`nl`, `nl-NL`, `nl-BE`); extend the first-visit redirect to send `nl`-preferring visitors to `/nl/...`.
- [x] 1.4 Run `npm run typecheck` and `npm run lint` — fix any union-narrowing call sites that broke. (Widened narrow `Locale` aliases in `build-wizard.tsx`, `conspirators-picker.tsx`, `masthead-client.tsx`; rewrote `de`-only path-prefix conditionals to general locale-prefix helpers.)

## 2. Dutch dictionary (PASS 1 — literal draft)

- [x] 2.1 Create `web/lib/i18n/nl.ts` mirroring the `Dictionary` shape. Begin the file with a header comment marking it as PASS 1 (literal), allowed-to-be-wooden, naming Maarten as pass-2 owner, and listing pass 3 as required-before-launch.
- [x] 2.2 Author every key as a literal Dutch translation of the English source. Mark obvious wooden / cognate-cluster strings with `// FIXME: pass 2` inline so pass-2 reviewers can grep them.
- [x] 2.3 Add the new `errors.client_error_*` keys (carried over from `client-error-reporting`) to `nl.ts` so the Dictionary type-check passes.
- [x] 2.4 Verify `npm run typecheck` passes — the typed Dictionary union forces every key to exist.

## 3. Dutch recipe taxonomy (workshop)

- [x] 3.1 Workshop the four move titles, four tells, and the debunk label in Dutch using the candidate sets in `specs/dutch-content/spec.md`. Pass-1 picks recorded inline in `recipe.ts`'s `LABELS_BY_LOCALE.nl` (subject to pass-2 workshop): titles `Afwijkingen najagen` / `Verbanden verzinnen` / `Tegenbewijs wegredeneren` / `Critici diskwalificeren`; tells `BASISKANS` / `ZES SCHAKELS` / `ONFALSIFIEERBAAR` / `AD HOMINEM`; debunk label `Ontmaskering` (workshop in pass 2 — alternatives: `Ontkrachting`, `Weerlegging`, `Auflösung`-equivalent).
- [x] 3.2 Extend `web/lib/recipe.ts`'s `MOVES` (or per-locale variant) with the Dutch picks. Wire through `move_label`, tell stamps, and accent labels.
- [ ] 3.3 Verify the Dutch labels render on `/nl/recipe` and `/nl/g/<id>` in dev.

## 4. Dutch LLM prompts

- [x] 4.1 Add Dutch variants of `generateEventIntro`, `generateIdeas`, `generateSection`, and the moderation rationale prompt in `web/lib/openai.ts`. Branch on locale at the prompt-assembler level.
- [x] 4.2 Author the Dutch voice-guideline block including the positive directive (lichte satirische toon), negative directive against anglicisms, and the NL/BE neutrality directive.
- [x] 4.3 Bump `recipeVersionFor('nl')` to return `'v1.nl'`.
- [ ] 4.4 Sanity-check: dispatch one generation with locale `nl` against a stub Dutch event, confirm output is Dutch end-to-end and the persisted row has `recipe_version = 'v1.nl'`.

## 5. Dutch source stories

- [ ] 5.1 (Maarten) Curate ≥20 candidate Dutch news stories (NL + BE balance: ≥4 from each side).
- [ ] 5.2 Apply the screening rubric per candidate. Keep yes/no notes per criterion in this file (or a linked review log) until archive.
- [ ] 5.3 For each surviving story (≥12), author `intro_paragraphs` and `conspiracist_intro` in Dutch (not auto-translated).
- [ ] 5.4 Add surviving rows to `web/data/seed.json` with `locale: 'nl'`. Verify the locale-aware story picker on `/nl/` shows only the Dutch set.

## 6. Three-state masthead toggle

- [x] 6.1 Extend `web/components/masthead.tsx` and `masthead-client.tsx` to render a 3-state segmented control (`EN | DE | NL`) instead of the current 2-state toggle. Active state uses the existing accent. (Refactored: server `Masthead` builds a `localeOptions` array filtered by `VISIBLE_LOCALES`; client `LocaleToggle` iterates and renders one pill per option.)
- [x] 6.2 Update the cookie-write logic in the toggle so clicking any pill writes `cgen_lang=<chosen>` and navigates to the corresponding prefix.
- [x] 6.3 Initially gate the `NL` pill behind a feature flag (or a `if (DUTCH_LAUNCHED)` constant) so the pass-1 draft can land on main without exposing wooden Dutch in the UI. (`DUTCH_LAUNCHED = false` in `web/lib/i18n/types.ts` → `VISIBLE_LOCALES = ["en", "de"]`.)
- [ ] 6.4 Visual QA at 320px / 360px / 414px viewport widths. If 3 pills don't fit, fall back to a dropdown — flag this in `design.md`.

## 7. Pass 2 — idiomatic rewrite (Maarten or Dutch-native contributor)

- [ ] 7.1 Read `nl.ts` end-to-end against the false-friends list in `specs/dutch-content/spec.md`. Rewrite every wooden / cognate-cluster string. Strip every `// FIXME: pass 2` marker after addressing it.
- [ ] 7.2 Rewrite the Dutch prompt voice guidelines for native cadence. Re-sample and confirm output reads natural.
- [ ] 7.3 Workshop final recipe-taxonomy picks (move titles, tells, debunk label) and lock them in `specs/dutch-content/spec.md` under the "Final picks" scenario.

## 8. Pass 3 — native-ear (NL + BE)

- [ ] 8.1 Identify one NL native and one BE native reviewer.
- [ ] 8.2 Each reviews the dictionary and a sample of fresh generations end-to-end without seeing the English source.
- [ ] 8.3 Record per-string flags in a review log. Strings flagged by either side as foreign-sounding get rewritten to a neutral alternative.
- [ ] 8.4 Sample at least 10 fresh Dutch theories. Confirm the average flag rate is below 2 per theory across both reviewers; tune prompts and re-sample until the threshold is met.

## 9. Launch

- [ ] 9.1 Flip the `NL` toggle pill on (remove the feature flag).
- [ ] 9.2 Smoke-test on production: visit `/nl/`, click a Dutch story, walk the wizard, confirm the resulting `/g/<id>` renders in Dutch with the workshop labels.
- [ ] 9.3 Check `/stats/visitors` for the per-locale split — confirm Dutch page views and generations begin appearing.
- [ ] 9.4 Announce.

## 10. Verification

- [x] 10.1 `npm run typecheck` passes.
- [x] 10.2 `npm run lint` passes.
- [ ] 10.3 Manually verify: cookie cycle `cgen_lang=nl`, refresh `/recipe` redirects to `/nl/recipe`; toggle EN→NL→DE→EN preserves the page; permalink `/g/<dutch-id>` renders Dutch regardless of cookie.
- [ ] 10.4 Manually verify the `nl-BE` Accept-Language path: clear cookies, set `Accept-Language: nl-BE,fr;q=0.5`, hit `/`, confirm redirect to `/nl/`.
