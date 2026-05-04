## Context

Three concrete gaps from comprehensive user testing land here:

1. **Empty Dutch picker.** `/nl/` home renders the dictionary correctly ("Kies een echt nieuwsbericht") but `seed.json` has zero `locale: 'nl'` rows, so the visitor reads the prompt and finds no story cards. The site is honest in Dutch but unusable.
2. **Locale toggle on `/nl/` shows no current state.** `DUTCH_LAUNCHED=false` hides the NL pill in `VISIBLE_LOCALES`. A visitor who reached `/nl/` directly sees `[EN | DE]` with both pills carrying the `text-ink-soft` class — no `aria-current`, no active highlight. They have no UI affordance to know they're on Dutch.
3. **`/nl/g/<en-row>` mixes locales.** The page renders Dutch chrome (masthead, footer) because `readLocale()` returns `nl` (URL prefix wins), but English content (lede h1, narrative, per-move tells) because `gen.locale = 'en'` drives the content dictionary. `<html lang="nl">` is set even though most prose is English — accessibility-incorrect.

The user picked option (A) on each: curate the Dutch stories properly, and fix the toggle + permalink behavior at the spec-correct level (not stopgap-level).

## Goals / Non-Goals

**Goals:**
- ≥12 `locale: 'nl'` rows in `seed.json` with Dutch `summary`, `intro_paragraphs`, `conspiracist_intro`. NL/BE balance (≥4 each).
- `DUTCH_LAUNCHED = true`. Toggle exposes NL on every page's masthead.
- `/g/[id]` is canonical at the row's locale URL. Visiting any cross-locale path (e.g. `/nl/g/<en-row>`) issues a redirect to the row's URL.
- Defensive masthead: even if `DUTCH_LAUNCHED` is later flipped back, the active locale's pill is always visible to its current visitor.

**Non-Goals:**
- Pass-2 idiomatic Dutch rewrite of seed copy (Maarten / Dutch-native owner; archived `multilingual-dutch` task 7.x). This change ships pass-1 literal drafts of new seed copy, marked with `// FIXME: pass 2` where relevant.
- Pass-3 NL/BE dual-native review of seed copy (separate workstream, archived `multilingual-dutch` task 8.x).
- Per-uuid Dutch images. The new rows use `image_override: "nl-placeholder.svg"` like the German pass-1 set; per-uuid imagery is a separate content task.
- Authoring legally-original `/nl/imprint` and `/nl/privacy` content. Already covered by the translation-pending notice from `localize-share-and-legal-pages`; legal originals are deferred.

## Decisions

### Source-story curation: 14 candidates → 12 surviving

Apply the rubric from the canonical `dutch-content` spec (specific public-affairs event with date+place; questionable official narrative; no vulnerable group as victim or culprit; no private individuals; conspiracy-shaped under (event, culprit, motive); ≤5 years old). 14 candidates surveyed; 13 pass; pick 12 with NL/BE balance. The screening notes per candidate ride alongside `tasks.md` per the spec scenario. The full list lives in `tasks.md` so it's editable + reviewable in the change directory.

**Stories chosen** (6 NL + 6 BE):
- NL: Stikstofcrisis & boerenprotesten 2022, Aardbevingen Groningen, Schiphol vluchtenplafond, Tata Steel IJmuiden, TenneT netcongestie, PFAS Chemours Dordrecht.
- BE: Sky ECC encryptie-operatie, PFAS 3M Zwijndrecht, Antwerpen haven cocaïnerecord, Vlaams stikstofakkoord, Doel kerncentrale verlenging, Bpost-fraudeonderzoek.

One candidate (Toeslagenaffaire) was rejected even though it would generate strong conspiracy-shaped output, because the victims include dual-nationality / Antillean families — naming them as participants in a conspiracy theory (even one that's exposed as fake afterward) would risk centering a vulnerable group as either victim or culprit. That's exactly the rubric criterion the project added to avoid that failure mode. Skip.

### `DUTCH_LAUNCHED = true`

The flag exists precisely to gate the launch behind NL seed content. Now that 12+ stories exist, flip it. `VISIBLE_LOCALES` becomes `['en', 'de', 'nl']` everywhere; the masthead toggle shows three pills.

### Defensive masthead: union with active locale

Compute `localeOptions` as `VISIBLE_LOCALES ∪ [currentLocale]`, deduped. Result: if `DUTCH_LAUNCHED` is later flipped back to `false`, a visitor on `/nl/` still sees an NL pill (because their currentLocale joins the visible set). This is purely defensive — flips of `DUTCH_LAUNCHED` are infrequent — but it removes the failure mode where a visible URL has no toggle home.

**Alternative considered:** drop `DUTCH_LAUNCHED` entirely (since we're flipping it true anyway). Rejected: keep the flag for future locales (`fr`, `es`, etc.) that go through the same launch-gating pattern; the union pattern in masthead is the abstraction that survives those locales.

### Permalink locale lock: redirect-based

In `web/app/g/[id]/page.tsx`, after loading the row:

```ts
const rowLocale: Locale = isLocale(row.locale) ? row.locale : "en";
const visitorLocale = await readLocale();
if (visitorLocale !== rowLocale) {
  redirect(localizedHref(`/g/${id}`, rowLocale));
}
```

Result: `/de/g/<en-row>` → 302 → `/g/<en-row>`. After the redirect, `<html lang>`, masthead, content, and OG metadata all align on the row's locale.

**Alternative considered:** middleware-level redirect. Rejected: middleware would need a per-request DB lookup to know `gen.locale`, expensive on every `/g/*` request. The page-level redirect is exactly one DB lookup per request (already happens to load the row).

**Alternative considered:** keep cross-locale visits and add `<article lang={rowLocale}>` for SR pronunciation. Rejected: the spec says "the page renders in the locale of the stored generation row" — half-measures (chrome diverging from content) are exactly the contradiction we're fixing. Redirect is the spec-correct read.

### Pass-1 Dutch authoring posture

New seed copy is authored as pass-1 literal drafts. The voice target is neutral Standaardnederlands per the dutch-content spec (no Belgicisms, no Hollandisms unique to one side). Where a phrase is wooden or cognate-cluster anglicism, mark `// FIXME: pass 2` inline so the future native-review pass can grep them.

### `og:locale` already correct after redirect

Because the redirect lands the visitor on the row-locale URL, the `og:locale` mapped via the existing `OG_LOCALE_MAP[rowLocale]` already matches. No additional metadata work — `localize-share-and-legal-pages` did the metadata wiring.

## Risks / Trade-offs

- **[Pass-1 Dutch quality]** → New seed copy is wooden until pass 2 lands. We accept this per project convention; visitors today see no Dutch stories at all, so wooden-but-real is strictly better than empty.
- **[Permalink redirect breaks Slack/Discord previews]** → Some link unfurlers don't follow 302 redirects. They'd then preview the redirect target's empty body. Mitigation: 302 is short-lived; the second-fetch pattern most unfurlers use is fine. We could use 308 (permanent) instead but 302 is more reversible.
- **[Bookmarked cross-locale URLs]** → Anyone who bookmarked `/de/g/<en-row>` will see a one-time 302 to `/g/<en-row>`. Acceptable.
- **[Pass-2 Dutch imprint/privacy still pending]** → Translation-pending notice from `localize-share-and-legal-pages` covers this. No regression.
- **[Voice mismatch with model output]** → AI-generated content for NL theories uses the locale-aware prompts (already wired in `multilingual-dutch`). Pass-1 prompts may produce wooden Dutch; that's tracked separately.

## Migration Plan

1. Add 12 NL rows to `seed.json`. Existing rows untouched.
2. Flip `DUTCH_LAUNCHED = true`. `VISIBLE_LOCALES` becomes 3 entries.
3. Add the masthead union-with-active-locale logic. Defensive; no immediate visible effect (since `DUTCH_LAUNCHED=true` makes NL visible everywhere already).
4. Add the permalink redirect in `/g/[id]`. New code; reversible.
5. Rollback: revert all four (drop `DUTCH_LAUNCHED` to `false`; remove the redirect; remove the defensive masthead logic). The new seed entries can stay (they don't affect existing locales' pickers).

## Open Questions

- Should pass-2 review include a re-read of the new 12 seed rows specifically, or roll into the broader pass-2 sweep? Decision: roll into the broader sweep (already an existing tracked workstream).
- Image strategy for NL stories: keep `nl-placeholder.svg` (consistent with German pass-1), or pre-source per-uuid hero imagery now? Decision: placeholder for this change; per-uuid imagery is a separate content/legal-rights workstream (image rights vary per outlet).
- Should the redirect be 308 (permanent) instead of 302? 308 is more cache-friendly; 302 is more reversible. Decision: 302, matching Next's `redirect()` default.
