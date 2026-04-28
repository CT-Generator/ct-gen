## Why

The site is English-only today. Maarten's audience is partly Flemish-Dutch and Marco's is German — a German rewrite would roughly double the natural reader pool and let the recipe land in classrooms in DACH (the German-speaking region) without an English-language friction tax. The right time is now: the v2 wizard is stable, the prompt surface area is small, and the seed catalog (330 English news stories) is well-organized enough to extend without re-architecting. Doing it badly — a stiff machine translation — would burn the goodwill of exactly the readers we'd want to attract; doing it properly means treating the German build as a *rewrite* in German voice, not a translation pass.

## What Changes

- **NEW i18n framework.** A locale dimension (`en` | `de`) threaded through routing, copy, prompts, and persistence. URLs become `/de/...` for German with `/...` continuing to serve English (no domain-language; same host). A small custom i18n layer (no `next-intl` dependency unless we hit a real limit) — locale-keyed string maps loaded at the request boundary, no client-side bundling of the wrong locale's strings.
- **NEW German UI copy.** Every reader-facing string on `/`, `/recipe`, `/about`, `/imprint`, `/privacy`, `/teach`, the build wizard, the story page, the share buttons, the masthead/footer, error states, and the tell-stamps — rewritten in German. Multiple passes. False-friend pass. Anglicism pass. Native-ear read-through. The `/stats/*` admin pages stay English (single maintainer; not worth the friction).
- **NEW German source stories.** ~20 hand-picked German news items run through the screening criteria (concrete event, public-affairs angle, conspiracy-theorizable without targeting a vulnerable group), with at least 12 surviving the screen. Stories live alongside the existing English ones in `seed.json` with a `locale` field; the locale picker on `/` filters which set is offered.
- **NEW German LLM prompts.** Parallel `de` versions of the four prompts in `web/lib/openai.ts` (event intro, ideas, sections, moderation rationale). Voice guidelines rewritten in German — same satirical-light register, but native cadence, no English-cadence sentences carried over. Recipe-version bumps to `v1.de` so the data-platform provenance can distinguish.
- **NEW locale-tagged generations.** A `locale` column on `generations` (default `'en'` for back-compat). Every new row records the locale it was built in. The `/stats` v2 page picks up a small locale split row.
- **NEW locale picker on `/`.** A small toggle in the masthead that switches between EN / DE and persists via a `cgen_lang` cookie (separate from `cgen_sid`; httpOnly false so the toggle works without a round-trip). Switches the URL prefix on click.
- **NEW recipe taxonomy in German.** The four moves' titles, tells, accent labels — translated as a *rewrite* (`Hunt anomalies` → `Auffälligkeiten suchen` is wooden; the right call is closer to *"Stutzen lernen"* with the verb leading; we'll workshop). The `MOVES` array gets a per-locale variant in `recipe.ts`.
- **CHANGED `seed.json` schema.** `news[]` items gain a `locale` field. Existing rows default to `en`. Picker on `/` shows only the active-locale subset.
- **CHANGED OG image route (`/api/og/[id]`).** Uses the language of the source generation, not always English. Falls back to English for legacy / locale-less rows.

## Capabilities

### New Capabilities

- `internationalization`: The locale dimension itself — locale negotiation, URL routing under `/<locale>/...`, the `cgen_lang` cookie, the request-scoped locale resolver, the per-locale string maps, and the contract that the app reads no copy from anywhere except the locale-keyed source.
- `german-content`: The actual German copy + German source stories + German recipe taxonomy + German LLM prompts as a coherent body of content. Specs the *quality bar* (translation method, false-friend list, native-ear pass, source-story screening criteria) so future locales can follow the same recipe.

### Modified Capabilities

- `data-platform`: `generations` gets a `locale` column. Provenance now records the build-time locale. (Modifies the existing `data-platform` capability spec from `v2-rebuild`.)
- `theory-generation`: The four-move prompt suite becomes locale-aware. Prompts in `lib/openai.ts` swap based on the request locale; voice guidelines exist in both languages. (Modifies the existing `theory-generation` capability spec from `v2-rebuild`.)

## Impact

- **Code touched:** `web/middleware.ts` (locale negotiation alongside the existing /stats auth + visitor tracking); `web/app/[locale]/...` route restructure (or a thin wrapper that segments on first path segment); every existing user-facing page swapped to read from a `t()` helper; `web/lib/openai.ts` (per-locale prompts); `web/lib/recipe.ts` (per-locale `MOVES`); `web/data/seed.json` (`locale` field + ~20 new German rows); `web/lib/db/schema.ts` (`locale` column on `generations`); `web/components/masthead.tsx` (locale toggle).
- **DB migration:** add `locale text not null default 'en'` to `generations`. Index on `(locale, created_at)` to keep stats queries fast. Mirror into `infra/db/init.sql`.
- **Copy ownership:** the German rewrite is the single largest deliverable and the one most likely to slip. Plan it as three discrete review passes (literal → idiomatic → native-ear) with the second pass authored by Marco directly, not by the model.
- **Seed-story ownership:** Marco curates the 20 German candidates; the screen criteria are documented in the spec so a future contributor can extend.
- **Token cost:** roughly +5–10% per generation in German (German is ~10–15% longer than English in characters but the prompts compress slightly differently; net wash to mild uptick).
- **Backwards compatibility:** existing `/g/[shortid]` permalinks (English) keep rendering as before. No URL changes for the English experience. The locale prefix is opt-in via `/de/...` or the picker; un-prefixed URLs stay English.
- **Out of scope for this change:** Dutch, French, or any third locale — the framework is built to extend, but only English + German ship in this round. RTL languages (would change layout assumptions) — explicitly out. The `/teach` lesson plan PDF rewrite for German classrooms — likely a follow-up change, since it's a different kind of artifact (printable handout vs. on-page copy).
