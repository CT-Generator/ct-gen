## Why

The site already ships in English and German (multilingual-german). Maarten's natural audience is partly Flemish-Dutch, so Dutch (`nl`) is the obvious next locale — and the marginal cost is small now that the framework exists: a dictionary, ~20 source stories, Dutch prompt variants, and a small UI change (2-state EN|DE toggle → 3-state EN|DE|NL). Doing it now keeps the i18n layer flexed (a third locale forces us to drop binary assumptions before they ossify), and lets Maarten land the recipe in BE/NL classrooms in the same window we're pushing the German launch.

## What Changes

- **NEW Dutch locale `nl`** added to the `Locale` union, the `cgen_lang` cookie's accepted values, and the middleware's Accept-Language matcher (recognizes `nl`, `nl-NL`, `nl-BE`).
- **NEW URL prefix `/nl/`** — same internal-rewrite pattern as `/de/`. Un-prefixed URLs continue to serve English; existing English + German URLs unchanged.
- **NEW Dutch UI dictionary** `web/lib/i18n/nl.ts` covering every key in the typed `Dictionary` shape. Multi-pass authoring (literal → idiomatic → native-ear) with a false-friend pass. Marked PASS-1 in a header comment so reviewers know it isn't shippable yet, mirroring `de.ts`.
- **NEW Dutch source news stories** — Maarten curates ~20 Dutch-language candidates against the existing screening criteria (concrete event, public-affairs angle, conspiracy-theorizable without targeting a vulnerable group), with at least 12 surviving the screen. Stored in `seed.json` with `locale = 'nl'`.
- **NEW Dutch LLM prompts** in `web/lib/openai.ts` (event intro, ideas, sections, moderation rationale). Same satirical-light register as EN/DE, in native Dutch cadence — no transliterated English sentences. Recipe version bumps to `v1.nl`.
- **NEW Dutch recipe taxonomy** in `recipe.ts` (move titles + tells). Workshopped, not literal.
- **CHANGED locale toggle**: the masthead's 2-state EN|DE switch becomes a 3-state EN|DE|NL segmented control. Mobile drawer adapts.
- **CHANGED first-visit redirect**: the middleware's "AL prefers de → /de/..." rule extends to "AL prefers nl → /nl/...". Tie-breaks default to en.
- **NEUTRAL Standaardnederlands**: the dictionary, prompts, and source stories MUST read naturally to both NL and BE audiences. No Belgicisms unique to BE, no NL-only idioms. The acceptance pass is "would a Flemish reader feel this is from a Belgian voice, and a Dutch reader feel it's from a Dutch voice?" — i.e. neither.

## Capabilities

### New Capabilities

- `dutch-content`: the actual Dutch copy + Dutch source stories + Dutch recipe taxonomy + Dutch LLM prompts as a coherent body of content. Specs the quality bar (multi-pass authoring, NL/BE neutrality test, source-story screening criteria) so it can be reviewed against the same standard as `german-content`.

### Modified Capabilities

- `internationalization`: extend the `Locale` union from `'en' | 'de'` to `'en' | 'de' | 'nl'`; add the `/nl/` URL prefix; extend the cookie and Accept-Language matcher; change the masthead toggle from 2-state to a 3-state segmented control.
- `theory-generation`: add Dutch prompt variants alongside English and German; recipe version `v1.nl`.

## Impact

- **Code touched:** `web/lib/i18n/types.ts` (Locale union, SUPPORTED_LOCALES), `web/lib/i18n/index.ts` (DICTS map, localizedHref), `web/lib/i18n/nl.ts` (new), `web/middleware.ts` (Accept-Language matcher, cookie validation, /nl/ prefix), `web/components/masthead.tsx` + `masthead-client.tsx` (3-state toggle), `web/lib/openai.ts` (Dutch prompts + voice guidelines), `web/lib/recipe.ts` (per-locale MOVES already extended for de — add nl), `web/data/seed.json` (~20 Dutch rows with `locale = 'nl'`).
- **DB migration:** none. The `generations.locale` column (added by multilingual-german) already accepts arbitrary text; no enum constraint to widen. Same for `page_views.locale`.
- **Sequencing dependency:** this change extends the `internationalization` and `theory-generation` specs first introduced by `multilingual-german`. Those specs do not yet exist in `openspec/specs/` (multilingual-german has not archived). **Archive `multilingual-german` before archiving this change**, otherwise the archive will fail the same way it did the first time (MODIFIED operations require an existing spec).
- **Toggle UX:** going from 2-state to 3-state changes the visual rhythm of the masthead. The segmented control needs careful sizing on mobile (where horizontal space is tightest). A dropdown is the fallback if 3-state pills don't fit.
- **Token cost:** Dutch is a few percent shorter than German at the character level; expect a wash vs. English baseline.
- **Backwards compatibility:** existing English + German URLs unchanged. The `/nl/` prefix is opt-in via URL or toggle. No permalink rewrites.
- **Editorial ownership:** Maarten owns the Dutch dictionary's pass 2 (idiomatic) and pass 3 (native-ear). Maarten owns source-story curation. Marco does not author Dutch copy directly — Maarten or a Dutch-native contributor must.
- **Out of scope:** French, regional dialect-specific variants (Vlaams-only or Hollands-only voice), `/teach` PDF rewrite for NL/BE classrooms (likely follow-up), Dutch-language `/imprint` and `/privacy` (need legally-original content from a NL/BE legal context, not a translation).
