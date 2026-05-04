## Context

The site is English by construction: every string lives inline in a JSX file or in a system prompt; routing has no locale dimension; `seed.json` carries 330 stories all in English; the `MOVES` taxonomy has English titles and tells; the LLM voice guidelines tune the model toward an English satirical-light register. Marco's natural reader pool is German-speaking; Maarten's is Dutch + English. Adding German is the highest-leverage next addition because it nearly doubles the natural reach without changing the pedagogical core.

The pedagogical core is the part most likely to break under a bad translation. The four moves don't just need German names — they need German *idioms* that carry the same crispness ("Hunt anomalies" → not "Anomalien jagen"; closer to "Stutzen lernen" or "Auffälligkeiten markieren"). The conspiracist voice in the build wizard cannot read like a stiff TV-news German that nobody actually speaks. And the German source stories must come from the German news landscape, not from translated international wire stories — the recognition of place and period is part of what makes the recipe land.

The constraint that shapes every decision below: this must be a *rewrite* in German, not a translation, and the data model + code paths must keep that distinction visible (recipe-version `v1.de`, separate prompt files, locale-tagged generations) so a future locale (Dutch, French) doesn't quietly inherit the German rewrite as its baseline.

## Goals / Non-Goals

**Goals:**
- A locale dimension threaded cleanly through routing, copy, prompts, and persistence — additive, not invasive.
- The English experience under `/...` continues to render identically to today, byte-for-byte where it matters (existing permalinks, share text, OG cards). No URL changes, no copy regressions.
- A German experience under `/de/...` that reads as native — written by someone who would never produce "Anglizismen" or false-friend literal translations.
- A small (12+ surviving) set of curated German source stories that work in the wizard and produce theories German readers would find recognizable.
- The `MOVES` taxonomy gets German renderings that are taught, not translated — workshopped phrasings that future readers can quote.
- Provenance preserved: every generated row records its locale and `recipe_version` carries the locale suffix (`v1.de` for German). The data platform can answer "how many German theories?" cleanly.

**Non-Goals:**
- Dutch, French, or any third locale. The framework is built to extend, but only EN + DE ship in this round.
- RTL languages. Layout assumptions (flush-left tell stamps, masthead order) would need rework. Out of scope.
- A re-design for German typography. We use the same Fraunces / Inter Tight / JetBrains Mono fonts; German has more umlauts and longer compound nouns, but the existing layout absorbs them without redesign.
- Localized `/teach` lesson plan PDFs. The teach page itself gets German copy; the lesson plan handout is a separate document and a separate change.
- Localized stats pages. `/stats` and `/stats/visitors` stay English — the maintainer is one person and doesn't need a DE UI for an admin tool.
- Translating the existing 2,688 English-migrated v1 generations. Past content stays as-is; only new generations carry the locale tag.
- A third-party i18n library (`next-intl`, `react-i18next`, `lingui`). They're all heavier than what we need for two locales and ~150 strings.

## Decisions

**Decision 1: URL prefix `/de/...` for German; un-prefixed paths stay English.**
The unmarked default is the existing one — preserves every existing link, OG card, and bookmark. The `/de/` prefix is opt-in, set either by the locale toggle or by an Accept-Language sniff on first visit (only if the visitor hasn't pinned a preference yet). Considered alternatives: subdomain (`de.conspiracy-generator.duckdns.org`) — adds DNS + cert complexity, no real benefit; query-param `?lang=de` — pollutes share links and OG cards; Accept-Language only — doesn't survive sharing across the language boundary. URL prefix wins on simplicity, persistence-via-link, and zero infra cost.

**Decision 2: A small custom i18n layer, not a library.**
The whole site has roughly 150 distinct user-facing strings (counted across pages). Pulling in `next-intl` is ~30KB of client bundle for what amounts to a `dict[locale][key]` lookup. The custom layer is: a `web/lib/i18n/<locale>.ts` file per locale exporting a flat object; a server-only `t(key)` helper that reads the request's locale; a typed `Locale` union. Switching locales = different dictionary. No client bundling of the wrong-locale dictionary because every page is a Server Component (the dictionary is only walked at render time on the server). Considered alternatives: `next-intl` (overkill, bundle cost); inline ternaries (`locale === "de" ? "..." : "..."`) — readable for 5 strings, unreadable for 150 and impossible to spot-translate; ICU MessageFormat for plurals — German has the same plural rules as English (one/other), no ICU needed.

**Decision 3: Locale lives in middleware-set context, not in URL path parsing inside layout.**
The middleware (which already runs for every non-asset request — the visitor-tracking change extended its matcher) inspects `req.nextUrl.pathname` for a `/de/` prefix, sets `x-locale` on the request headers, rewrites the path internally so `/de/recipe` resolves to the same `app/recipe/page.tsx` file, and sets/refreshes the `cgen_lang` cookie. Layouts and pages read `headers().get("x-locale")` to pick the dictionary. Considered alternative: route-segment `app/[locale]/...` reorganization — this is the canonical Next.js pattern but it forces every existing page file to move and every internal link to be rewritten. The middleware-rewrite approach avoids that churn, supports both prefixed and unprefixed URLs from the same physical files, and keeps the diff small. Cost: the URL bar shows `/de/recipe` but the file system shows `app/recipe/page.tsx`. Acceptable.

**Decision 4: Translation as three discrete passes, not one.**
- **Pass 1 (literal):** Marco/I produce a working draft of every string in German that says the right thing. Allowed to be wooden. Goal: nothing missing.
- **Pass 2 (idiomatic):** Marco rewrites the wooden draft as the German he'd actually speak. Verbs lead. Sentences shorter than the English. Replace cognate-cluster anglicisms (e.g. "kontrollieren" for "to control" → use "steuern" or "lenken"; "realisieren" for "to realize" → "merken" or "erkennen"). The tell stamps get workshopped multi-syllable phrases, not literal calques.
- **Pass 3 (native-ear):** A native German speaker who hasn't seen the English reads it cold. They flag anything that sounds translated. We fix what they flag.

The three passes are tracked as task checkboxes in `tasks.md`, with sign-off captured per pass. No "we'll fix it later" — pass 3 must complete before deploy.

**Decision 5: A `falsefriends.md` reference list maintained as part of this change.**
False friends and overused anglicisms are predictable: `actual` → `aktuell` (wrong; means *current*, not *real*); `eventually` → `eventuell` (wrong; means *possibly*, not *finally*); `sympathetic` → `sympathisch` (wrong; means *likeable*, not *empathetic*); `realize` → `realisieren` (wrong outside finance/film); `kontrollieren` (overused for *check*; usually means *control*); `Recipe` → `Rezept` reads cookbook-y in our context, prefer `die vier Schritte` or `der Vier-Schritt-Plan`. The reference list lives in the spec — pass 2 reviewers check against it.

**Decision 6: The four-move taxonomy is workshopped, not translated.**
- *Hunt for anomalies* → workshop options: `Stutzen lernen` / `Auffälligkeiten suchen` / `Komische Stellen markieren`. We pick.
- *Connect the dots* → `Punkte verbinden` is fine; alternative `Linien ziehen` more native.
- *Dismiss counter-evidence* → `Gegenbeweise abwehren` is wooden; `Gegenargumente wegerklären` is closer.
- *Discredit critics* → `Kritiker:innen diskreditieren` works; alternative `Kritikerinnen mundtot machen` punchier.
- *The debunk* → `Die Auflösung` (cleaner than `Die Entlarvung` which sounds melodramatic).
- The four tells (BASE RATES / SIX DEGREES / UNFALSIFIABLE / AD HOMINEM) — keep `AD HOMINEM` as Latin; the others get German equivalents (`GRUNDRATE`, `SECHS ECKEN`, `UNFALSIFIZIERBAR`).

The final picks live in the spec. The workshop happens during pass 2 of the translation.

**Decision 7: Seed-story screening — 20 in, 12+ out, criteria documented.**
Marco hand-picks 20 candidate German news stories from the past ~5 years from sources like SZ, Zeit, Tagesschau, Spiegel. Screening criteria (in the spec):
- Specific public-affairs event with a date and a place.
- Has at least one obvious "official narrative" the conspiracist voice can question.
- Does NOT center a vulnerable group as victim or culprit.
- Does NOT name a private individual who isn't already a public figure.
- Read against the existing English seed: would the recipe produce a recognizably-conspiracy-shaped theory? (The selector test: imagine the four moves filled in. Does it sound like a plausibly bad theory?)
- 5-year recency window — German news memory is short for niche stories.

12 surviving rows is the minimum because the picker shows ~10 at a time on `/`; below 12 the picker feels thin and the same stories repeat across sessions. Hard floor.

**Decision 8: LLM prompts split per locale; recipe-version becomes `v1.de` for German output.**
`web/lib/openai.ts` splits the four prompt assemblers (`generateEventIntro`, `generateIdeas`, `generateSection`, moderation rationale) into locale-keyed branches. The system prompts in German are *separate strings*, not translations of the English ones — written native and reviewed for voice. The `recipe_version` field on every German generation becomes `v1.de`, so the data-platform provenance distinguishes; the English keeps `v1`. Considered alternative: a single bilingual system prompt that tells the model "write in German if locale=de" — works on capable models but produces a stiffer, more-translated voice. Not worth it.

**Decision 9: A `cgen_lang` cookie alongside `cgen_sid`.**
The lang cookie is purely a preference; non-httpOnly so the locale toggle's client side can read+write it without a round-trip. Set on first visit by middleware (Accept-Language sniff → `de` if the highest-priority Accept-Language matches `de`, else `en`). Refreshed on every visit so a user who switches locales gets remembered. Independent of the session hash — switching locales doesn't reset the session.

**Decision 10: Middleware order: locale → tracking → /stats auth.**
The middleware already does (after the visitor-tracking change): if `/stats/*` → auth; else set tracking headers. Adding locale: at the top of the function, normalize the path's locale prefix and set `x-locale`. Then continue with the same branch logic. The `x-pathname` header set for tracking is the *un-prefixed* path so the page-views table records `/recipe`, not `/de/recipe`, keeping the top-pages chart locale-agnostic. (We add a separate `locale` column to `page_views` if we want a per-locale split later — out of scope for this change; the proposal's seed-stat split lives on `generations` only.)

## Risks / Trade-offs

- **[Risk] German pass 2 / pass 3 take more wall-clock than expected.** Translation polish is the kind of work that drags. → Mitigation: each pass's review is its own checkbox in tasks.md; if pass 3 keeps slipping, ship to a `de-beta` cookie-flag instead of the URL-visible `/de/`, get wider readers, then promote.
- **[Risk] Models produce stiff, anglicized German.** GPT-class models translated from English-internal-thought tend to give translated-sounding German. → Mitigation: prompts include a one-line negative constraint *"Schreibe wie eine deutsche Muttersprachlerin, keine Anglizismen, keine wörtlich übersetzten englischen Phrasen."* Run a sample-set of 10 fresh German theories and have the same native-ear reviewer flag stiffness. Tune prompts based on flags.
- **[Risk] German seed catalog stays small (under 12 after the screen).** → Mitigation: pre-empt by curating 25 candidates instead of 20 if the early screen rate is below 60%.
- **[Risk] German users land on `/...` (English) by default and don't notice the toggle.** → Mitigation: middleware reads Accept-Language on the first visit (no cookie yet) and 302-redirects to `/de/...` if `de` is the highest-priority language. Subsequent visits respect the cookie. Note: do NOT redirect if the first visit is to a permalink (`/g/<id>`) — that's a shared link and should render in whatever language it was generated in.
- **[Risk] Existing English permalinks rendered in German because the middleware redirected.** → Mitigation: permalinks (`/g/<id>`, `/story/<id>`) bypass Accept-Language redirect; they render in the *generation's* locale (read from the row).
- **[Risk] Generation locale and UI locale drift apart.** A user on `/de/` who somehow reaches an English-locale generation page sees a German chrome around an English theory. → Mitigation: the page chrome stays in the active UI locale; the generated theory text renders in the locale of the generation row. Visually distinct enough; document the separation.
- **[Trade-off] Middleware path-rewriting hides the locale segment from the file system.** A new contributor reading the repo doesn't see `app/[locale]/...`. → Mitigation: a comment in the root layout names the contract; `web/lib/i18n/README.md` documents how the locale flows.
- **[Trade-off] We don't ship Dutch with this change even though Maarten's audience is partly Dutch.** Doing two translations at once would double the polish-pass workload and slip the German ship date. → Mitigation: framework is built to extend. Dutch is a follow-up change.

## Migration Plan

- DB migration: `ALTER TABLE generations ADD COLUMN locale text NOT NULL DEFAULT 'en';` plus a composite index `(locale, created_at)` for stats. Mirror into `infra/db/init.sql`. Idempotent via `IF NOT EXISTS`. Apply to prod with the same one-liner pattern as `0001_visitor_tracking.sql`.
- Code is additive: existing English routes keep rendering. No URL changes.
- Rollback: if the German launch produces something embarrassing, set the locale toggle to disabled and the `/de/...` middleware branch to 404. The English experience is unaffected. The DB column stays (default `'en'`); no need to roll it back.
- Deploy order: (1) DB migration. (2) Code with locale layer wired but `/de/...` returning a "coming soon" page if pass 3 not yet done. (3) Pass 3 sign-off. (4) Flip the `/de/...` flag to fully enable.

## Open Questions

- Locale toggle in masthead: dropdown (EN / DE) or two-pill toggle? The two-pill is more discoverable but takes more space; the dropdown is denser. Likely two-pill, decide in tasks.md as a small UI design call.
- `/teach` lesson plan: do we ship a short German appendix in this round (one-page handout) or defer the full lesson plan? Defer is the safer call; flag in tasks.md to confirm.
- For the German source stories, do we link out to the original German articles in the conspiracist intro the way the English ones do (`The Independent reports...`)? Yes — but with the German pattern (`Die SZ berichtet...`). Document in the spec.
