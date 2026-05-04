## Why

Comprehensive user testing surfaced three gaps in the Dutch experience that block honest "Dutch is shipped" claims. Tier-1 was the empty `/nl/` home picker (zero `locale: 'nl'` rows in `seed.json`); Tier-2 was an unreadable locale toggle on `/nl/` (NL pill hidden by `DUTCH_LAUNCHED=false`) and an `<html lang>` / chrome / content split on cross-locale permalinks. All three got the user's "do A" verdict in the persona review, meaning: pick the most-direct, spec-correct fix in each case.

## What Changes

- **Add at least 12 Dutch seed news stories** to `web/data/seed.json` with `locale: 'nl'`, all passing the screening rubric carried over from `dutch-content`, with NL/BE balance (≥4 NL outlets, ≥4 BE/Flemish outlets). Each row carries Dutch `summary`, `intro_paragraphs`, and `conspiracist_intro` — pass-1 literal drafts marked for pass-2 native review where idiomatic concerns remain.
- **Flip `DUTCH_LAUNCHED` to `true`** in `web/lib/i18n/types.ts`. The masthead `EN | DE | NL` toggle becomes visible on every locale's masthead. Tier-2 item 3 ("NL pill on /nl/ only") is subsumed: with the flag flipped, the NL pill is visible everywhere.
- **Defensive masthead robustness**: even if a future change flips `DUTCH_LAUNCHED` back, the active locale's pill MUST still appear in the toggle (otherwise visitors who reach `/nl/` directly would see no current-state indicator). Implement by computing `localeOptions` as the union of `VISIBLE_LOCALES` and `[currentLocale]`.
- **Permalink locale lock on `/g/[id]`**: when the visitor's URL-prefix locale differs from the row's persisted locale, the page SHALL `redirect()` to the canonical URL under the row's locale prefix. After redirect, `<html lang>`, masthead chrome, content, and OG metadata all match the row. Closes the spec-vs-implementation contradiction (`internationalization` already says permalinks render in the row's locale; we now make the URL match too).

## Capabilities

### New Capabilities
<!-- None — extends existing capabilities. -->

### Modified Capabilities
- `dutch-content`: at least 12 Dutch source stories present in `seed.json`; rubric-screened; NL/BE balance met.
- `internationalization`: visible-locale set includes the active locale unconditionally; permalink visit MUST redirect to the row-locale URL when the URL prefix doesn't match.

## Impact

- **Content**: ~12 new rows in `web/data/seed.json` with `locale: 'nl'`, each ~250 words of Dutch prose. Pass-2 review (Maarten / Dutch native) still pending per project convention; pass-1 ships with `// FIXME: pass 2` markers as needed.
- **UI**: edits to `web/lib/i18n/types.ts` (flip flag), `web/components/masthead.tsx` (defensive locale-options), `web/app/g/[id]/page.tsx` (redirect on locale mismatch). No new components.
- **Specs**: two modified-capability deltas. No new schema, no new routes (the redirect uses the existing `/[locale]/g/[id]` path map), no new persistence, no new model calls.
- **Latency / cost**: zero in steady state; one extra HTTP redirect on first visit to a permalink whose URL prefix doesn't match the row's locale.
- **Backwards compatibility**: existing English/German row permalinks (`/g/<en-id>`, `/de/g/<de-id>`) keep working. A visitor who bookmarked `/de/g/<en-id>` (cross-locale) gets redirected to `/g/<en-id>` — observable as a 302 once.
- **Pedagogical posture**: Dutch visitors finally have a tool they can use end-to-end. Permalink shares now produce coherent, locale-consistent pages regardless of who shared them.
