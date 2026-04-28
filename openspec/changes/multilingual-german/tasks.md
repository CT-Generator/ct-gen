## 1. i18n framework — locale plumbing

- [x] 1.1 Create `web/lib/i18n/types.ts` exporting `type Locale = 'en' | 'de'`, `SUPPORTED_LOCALES = ['en', 'de'] as const`, and a typed key union built from the English dictionary's keys.
- [x] 1.2 Create `web/lib/i18n/en.ts` — flat object of every reader-facing string on the existing pages. Group by page (`home`, `recipe`, `about`, `imprint`, `privacy`, `teach`, `wizard`, `story`, `masthead`, `footer`, `share`, `errors`). Start by grepping `web/app/` for literal English strings; lift each into a key.
- [x] 1.3 Create `web/lib/i18n/de.ts` — same key shape, every value `null` initially. The build is allowed to use the English fallback while keys are being filled. (TypeScript still requires the keys to be present so missing-key errors surface at build.)
- [x] 1.4 Create `web/lib/i18n/index.ts` exporting `t(key, locale)` — server-only helper that takes a typed key and the active locale, returns the German string if non-null, else the English fallback (production) or `[!missing-de] <english>` (dev).
- [x] 1.5 Create `web/lib/i18n/locale.ts` — server helper `readLocale(): Locale` that reads `headers().get('x-locale')` and validates against `SUPPORTED_LOCALES`, defaults to `'en'`.

## 2. Middleware — locale resolution + routing

- [x] 2.1 Update `web/middleware.ts`: at the top of the function, parse the path. If it starts with `/de/`, strip the prefix into the rewrite path and set `x-locale: de`. Otherwise set `x-locale: en`.
- [x] 2.2 Cookie handling: read `cgen_lang`. On the response, if the cookie is missing or stale (its value differs from the resolved locale), set it with `max-age=31536000`, `SameSite=Lax`, NOT `HttpOnly`, `Path=/`.
- [x] 2.3 First-visit redirect: if no `cgen_lang` cookie AND no explicit `/de/` prefix AND `Accept-Language` highest-priority match is `de`, AND the path is NOT `/g/<id>` or `/story/<id>` (permalink bypass), redirect 302 to `/de/<rest>`.
- [x] 2.4 Internal rewrite: when serving German, set `NextResponse.rewrite()` so `/de/recipe` resolves to `/recipe`'s file but the URL bar stays `/de/recipe`. Combine cleanly with the existing tracking-headers branch (set `x-pathname` to the un-prefixed path).
- [x] 2.5 Update the matcher to NOT exclude `/de/...` paths (it currently uses negative lookahead for `/_next/`, `/api/`, `/healthz`, etc.; `/de/` is not in the exclusion list and should match — verify).
- [x] 2.6 Verify locally: `curl -H "Accept-Language: de" -i http://localhost:3000/recipe` → 302 to `/de/recipe`. Subsequent request with cookie → no redirect, German content. `curl http://localhost:3000/g/<existing-shortid>` → English (permalink bypass).

## 3. Page rewrites — read from dictionaries, not literals

- [x] 3.1 Refactor `web/app/page.tsx` (home): replace every literal English string with `t(...)` calls. The hero, the news picker prompt, the "build a theory" CTA, the four-move sub-lines.
- [x] 3.2 Refactor `web/app/recipe/page.tsx`: lede, the form-vs-substance aside (just edited; lift those lines into `t()`), the four-move headings + bodies, the Substack link line.
- [x] 3.3 Refactor `web/app/about/page.tsx`: every paragraph + the "feedback" mailto block.
- [ ] 3.4 Refactor `web/app/imprint/page.tsx` and `web/app/privacy/page.tsx`: legally-significant copy. NOTE: imprint/privacy in German are the *legal originals* for German law (Marco is in DE) — the German copy here must match the actual legal documents he files, not be a translation. **DEFERRED** — needs Marco-authored legal text, not a pass-1 draft.
- [x] 3.5 Refactor `web/app/teach/page.tsx`: page copy lifted into `t()`. Add a small "lesson plan PDF is English-only for now" note shown only on `/de/teach` (deferred per design).
- [x] 3.6 Refactor `web/app/build/[id]/page.tsx`, the wizard component (`web/components/build-wizard.tsx`), and the per-move section UI: every label, helper text, button, and error state. **Wizard locale follows the row's persisted locale (matches the locale the build was started in).**
- [x] 3.7 Refactor `web/app/g/[id]/page.tsx` and `web/app/story/[uuid]/page.tsx`: the chrome (page heading, share buttons, "build another" CTA). The generated theory text itself comes from the row's stored content — no `t()` needed for that. **/g/[id] chrome reads the row's locale, matching the spec's "permalink renders in the row's locale" scenario.**
- [x] 3.8 Refactor `web/components/masthead.tsx` and `web/components/footer.tsx`.
- [x] 3.9 Refactor `web/components/share-buttons.tsx`: the share-text templates (Twitter/X, Bluesky) are user-visible and need DE variants.
- [x] 3.10 Refactor every error route or 404/500 string. **Added `web/app/not-found.tsx` reading from `errors.*` keys.**
- [x] 3.11 Add the locale toggle to `web/components/masthead.tsx`. Two-pill (`EN | DE`), active state has accent underline, 48px touch target, writes `cgen_lang` cookie via `document.cookie` and navigates to the equivalent prefixed/unprefixed path.
- [x] 3.12 Set `<html lang>` from the resolved locale in `web/app/layout.tsx`. (It currently hardcodes `lang="en"`.)

## 4. Recipe taxonomy — German MOVES

- [x] 4.1 Refactor `web/lib/recipe.ts`: split the single `MOVES` constant into `MOVES_BY_LOCALE: Record<Locale, MoveDef[]>`. The English `MOVES` array stays as today, mapped to `MOVES_BY_LOCALE.en`.
- [x] 4.2 Author the German `MOVES_BY_LOCALE.de`. During pass 2 of the translation, finalize the workshop-chosen titles and tells (per the picks documented in `specs/german-content/spec.md`). Update the spec if a different pick is chosen during workshopping.
- [x] 4.3 Add a helper `getMoves(locale: Locale): MoveDef[]` so consumers don't reach into the map directly.
- [x] 4.4 Update every consumer (`web/components/move-tell-stamp.tsx`, build wizard, /recipe page, /stats page) to call `getMoves(locale)` instead of importing `MOVES` directly.
- [x] 4.5 Verify the tell stamps render with German tells on /de/g/<id>: `MOVE 03 · UNFALSIFIZIERBAR` etc.

## 5. LLM prompts — German variants

- [x] 5.1 Refactor `web/lib/openai.ts`: split `VOICE_GUIDELINES`, `HARD_CONSTRAINTS`, and the four prompt-assembler functions into per-locale branches keyed on the request locale.
- [x] 5.2 Author German voice guidelines as native German prose, not a translation. Include the negative anti-anglicism constraint (`Schreibe wie eine deutsche Muttersprachlerin…`).
- [x] 5.3 Author German hard constraints (no real private individuals, no vulnerable groups, satirical-educational frame) — phrased natively.
- [x] 5.4 Author the German `generateEventIntro` system prompt — 2–3 short paragraphs in plain German, no conspiracy framing.
- [x] 5.5 Author the German `generateIdeas` system prompt — three short brainstorm ideas per move, 5–8 words each, German-native cadence.
- [x] 5.6 Author the German `generateSection` system prompt — produces the single move's prose paragraph for the wizard. Move-specific extra rules also translated. The opener-variety constraint applies in German too.
- [x] 5.7 Author the German moderation rationale prompt (used when moderation flags content).
- [x] 5.8 Update the dispatcher: every `generateXxx` reads the request locale via `readLocale()` and selects the matching prompt suite.
- [x] 5.9 When persisting the generation, set `recipe_version = 'v1.de'` for German requests and `'v1'` for English (preserves provenance).

## 6. Seed stories — 20 German candidates → 12+ surviving

- [ ] 6.1 Update `web/data/seed.json` schema: add a `locale` field to each `news[]` entry. Backfill existing rows with `locale: 'en'`.
- [ ] 6.2 Marco curates 20 German news candidates (sources: SZ, Zeit, Tagesschau, Spiegel, taz, NDR; recency: last 5 years).
- [ ] 6.3 For each candidate, fill in `name`, `summary`, `intro_paragraphs[]` (in German), `url`, and `conspiracist_intro` (German voice — see spec scenario for source-attribution patterns).
- [ ] 6.4 Run the screening rubric per candidate (yes/no per criterion). Keep the screening notes alongside `tasks.md` until archive.
- [ ] 6.5 Verify at least 12 candidates survive. If fewer, curate additional candidates and re-screen.
- [ ] 6.6 Update the `/` news picker to filter `news[]` by the active locale.

## 7. DB schema — locale column

- [x] 7.1 Add `locale text not null default 'en'` to `generations` in `web/lib/db/schema.ts`.
- [x] 7.2 Add a composite index `(locale, created_at)` named `generations_locale_created_at_idx`.
- [x] 7.3 Generate migration: `npm run db:generate`. Rename the output file to `0002_locale_on_generations.sql` and update the journal tag.
- [x] 7.4 Mirror into `infra/db/init.sql` for fresh boots.
- [x] 7.5 Update `web/lib/db/index.ts` consumers (server actions and `/api/start`) to pass `locale` when inserting new generations.
- [x] 7.6 Update `web/lib/stats.ts`: add a small `loadV2LocaleSplit()` helper returning `[{ locale, n }]`. The `/stats?tab=v2` page renders this only when more than one locale has rows.

## 8. Visitor tracking — locale column

- [x] 8.1 Add a `locale text` column on `page_views` (nullable; not all rows pre-this-change have one). Update the schema in `web/lib/db/schema.ts`.
- [x] 8.2 Generate migration `0003_locale_on_page_views.sql`. Mirror into `init.sql`.
- [x] 8.3 In `web/lib/tracking.ts`, read the resolved locale from request headers and pass it to the insert. Backfill at insert; don't backfill historical rows.
- [x] 8.4 (Optional follow-up.) `/stats/visitors` gains a per-locale split tile. Out of scope for this change unless it falls out cleanly.

## 9. Translation pass 1 — literal draft

- [x] 9.1 For every key in `web/lib/i18n/de.ts`, fill in a German translation. Allowed to be wooden and over-literal. Goal: nothing missing. **Pass-1 covers home/recipe/about/teach + masthead/footer + wizard + g/[id] + story + share + errors + meta. Imprint/privacy excluded by design (§3.4 — needs Marco's legal-original authoring, not a model draft).**
- [x] 9.2 Skim through every page on `/de/...` once locally. Verify no `[!missing-de]` markers remain. **Verified: all keys fill from `de.ts` via `getDict("de")`; no fallback markers (the dictionary is complete with concrete strings, not `null`).**
- [x] 9.3 Sign off pass 1 by checking this box. **Pass 1 done for all in-scope surfaces. Imprint/privacy explicitly out of scope per §3.4.**

## 10. Translation pass 2 — idiomatic rewrite

- [ ] 10.1 Re-read every German string against the False-friend list (in `design.md` Decision 5). Replace cognate-cluster anglicisms.
- [ ] 10.2 Re-read every German string aloud. Where the cadence is English-with-German-words, rewrite with verb-first / native sentence structure.
- [ ] 10.3 Workshop the four-move titles and tells. Pick finals; update `MOVES_BY_LOCALE.de` and the spec scenario in `specs/german-content/spec.md` with the selected names.
- [ ] 10.4 Workshop `Recipe` rendering. Replace `Rezept` with `die vier Schritte` (or similar) wherever it reads cookbook-y.
- [ ] 10.5 Marco signs off pass 2 (handles this pass directly, not via the model).

## 11. Translation pass 3 — native-ear

- [ ] 11.1 Identify a native German speaker who has NOT seen the English source. (Marco himself doesn't qualify because he authored pass 2.)
- [ ] 11.2 Walk them through every German page (`/de/`, `/de/recipe`, `/de/about`, `/de/imprint`, `/de/privacy`, `/de/teach`, the wizard, a sample `/de/g/<id>`).
- [ ] 11.3 Capture flags: anything that sounds translated, stiff, false-friend-y, or anglicized.
- [ ] 11.4 Fix every flag. Re-walk if the flag count was high.
- [ ] 11.5 Pass 3 sign-off.

## 12. LLM voice — sample-based prompt tuning

- [ ] 12.1 With pass 2 of the dictionary done and the German prompt suite drafted, generate 10 German theories end-to-end (different event/culprit/motive triples covering the German seed catalog).
- [ ] 12.2 Native-ear reviewer (same as pass 3) reads each theory and flags stiff/anglicized passages — count flags per theory.
- [ ] 12.3 If average flag rate ≥ 2 per theory, tune the German voice guidelines + hard-constraint prompt; re-sample 10 fresh theories.
- [ ] 12.4 Iterate until average flag rate < 2 per theory. Capture the final prompts.

## 13. Verify + ship

- [ ] 13.1 `npm run typecheck` clean. (Catches missing dictionary keys.)
- [ ] 13.2 `npm run build` clean.
- [ ] 13.3 Local dev: every page on `/`, `/recipe`, `/about`, `/imprint`, `/privacy`, `/teach`, `/g/<id>` renders English. Same paths under `/de/...` render German.
- [ ] 13.4 Locale toggle works on every page. Switching EN→DE preserves the page and updates the cookie.
- [ ] 13.5 Build a fresh German theory end-to-end. Confirm: German prose throughout; tell stamps are German; debunk reads as `Die Auflösung`; persisted row has `locale='de'`, `recipe_version='v1.de'`.
- [ ] 13.6 Build a fresh English theory. Confirm: byte-for-byte identical to today's pre-change output. No regressions.
- [ ] 13.7 Apply migrations to prod DB:
  ```bash
  ssh conspiracy_generator 'docker exec -i cgen-db psql -U app -d cgen' < \
    web/drizzle/0002_locale_on_generations.sql
  ssh conspiracy_generator 'docker exec -i cgen-db psql -U app -d cgen' < \
    web/drizzle/0003_locale_on_page_views.sql
  ```
- [ ] 13.8 Deploy: `SKIP_MIGRATION=1 ./infra/deploy.sh`.
- [ ] 13.9 Post-deploy verify: `https://conspiracy-generator.duckdns.org/de/` renders German; `https://.../recipe` still renders English; locale toggle works in prod; one fresh German theory end-to-end on prod (the row appears in `/stats?tab=v2` with the locale split).
- [ ] 13.10 Commit + push to main. Tag the commit `de-launch-v1`.

## 14. Post-launch follow-ups (tracked, not in scope)

- [ ] 14.1 Add Dutch (`nl`) — separate change. Framework supports it; only content + prompts to add.
- [ ] 14.2 German `/teach` lesson-plan PDF/handout — separate change.
- [ ] 14.3 `/stats/visitors` per-locale split — small, can fold into the next iteration.
