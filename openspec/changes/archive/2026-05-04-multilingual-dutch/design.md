## Context

The site supports `en` and `de` today (multilingual-german). The framework — middleware locale negotiation, `/<locale>/` URL rewrite, `cgen_lang` cookie, server-side dictionary lookup, per-locale prompts and recipe taxonomy — is in place and proven. Adding Dutch is a content + UI-toggle exercise, not a re-architecture. The hardest part is editorial: native Dutch prose that reads naturally to both NL and BE audiences, plus ~12 surviving source stories.

Constraints inherited from the existing framework:
- Server-side dictionary lookup; no per-locale bundle ships to the browser.
- `Locale` is a closed TypeScript union — adding `nl` widens it everywhere.
- Permalinks (`/g/<id>`, `/story/<id>`) bypass the first-visit redirect; they render in the locale of the stored row.
- Stats pages stay English (single maintainer; not worth the friction).

Constraints specific to Dutch:
- The audience is split between NL and BE. The voice MUST be neutral Standaardnederlands — neither flavored. We do not ship a `nl-BE` variant; one dictionary serves both.
- Maarten owns Dutch editorial. The model can produce a literal pass-1 draft; passes 2 and 3 require a Dutch-native human.

## Goals / Non-Goals

**Goals:**
- Ship a third locale that honors the same quality bar as German (multi-pass review, source-story screening, native voice in prompts).
- Convert the masthead toggle from binary to a 3-state segmented control without destabilizing the existing EN/DE experience.
- Keep the i18n infrastructure honest: a third locale forces us to drop binary assumptions before they ossify.

**Non-Goals:**
- Per-region voice variants (Vlaams-only, Hollands-only). One neutral voice for both.
- French. Once Dutch is in, French will be a smaller follow-up; not bundled here.
- A Dutch lesson-plan PDF for `/teach`. Different artifact, different ownership; follow-up.
- Dutch-language `/imprint` and `/privacy`. Those need NL/BE legal context, not translation; out of scope.
- Auto-detecting Belgian locale subtleties for any tooling.

## Decisions

**3-state toggle: segmented control, not dropdown.** The masthead toggle becomes a 3-pill segmented control showing `EN | DE | NL` with the active state filled. This keeps the locale always-visible (one click, no menu), matches the existing minimal-chrome aesthetic, and avoids a separate menu pattern just for one feature. Mobile: same control, slightly tighter padding.

Alternative considered: a dropdown ("Languages: EN ▾"). Rejected because it adds a click/touch step for what is the most-used affordance for non-English-default visitors, and because a single-purpose dropdown is the kind of UI debt that proliferates.

Alternative considered: hide DE/NL behind a "more" expander. Rejected because it creates a hierarchy where EN is canonical and DE/NL are afterthoughts — exactly the framing we want to avoid.

**Cookie value enum widened in lockstep.** `cgen_lang` accepts `en`, `de`, `nl`. The middleware's `parseLocale` adds the `nl` branch, returns null for anything else (including legacy values from a future locale we might roll back). Type-safe at the union boundary.

**Accept-Language matching: `nl` family.** The first-visit redirect logic extends to: if no cookie + no prefix + the highest-priority Accept-Language entry is in the `nl` family (`nl`, `nl-BE`, `nl-NL`), redirect to `/nl/...`. The DE branch already follows this pattern; NL slots in alongside. Tie-breaks (e.g., `de;q=1.0,nl;q=1.0`) follow header order.

**Recipe version `v1.nl`.** Same versioning convention as `v1.de`. The data-platform's `recipe_version` column already accepts arbitrary text — no schema change. Permalinks for Dutch generations carry `v1.nl` so future analytics can split by locale-version.

**No dedicated `nl-BE` recipe variant.** One Dutch dictionary, one Dutch prompt suite, one set of source stories. If divergence becomes necessary later, it's a follow-up. Don't pre-fork.

**Source-story curation: Maarten only.** Marco does not curate Dutch sources. The screening rubric (concrete event, public-affairs angle, no vulnerable-group targeting, ≤5 years old) carries over verbatim from `german-content`. Keep the per-candidate yes/no notes alongside `tasks.md` until archive.

**Dictionary pass-1 draft is acceptable to land in code.** Same convention as `de.ts`: ship the pass-1 draft with a header comment marking it as wooden, gate the launch on passes 2 and 3. Lets the framework wiring land independently of editorial sign-off.

## Risks / Trade-offs

- **Risk: NL/BE neutrality is hard to verify with one reviewer per side.** → Mitigation: native-ear pass MUST involve at least one NL and one BE reader; flag any string only one side likes for rewrite. Document the dual-review in `tasks.md`.
- **Risk: 3-state toggle crowds the masthead on narrow viewports.** → Mitigation: explicit visual review at 320px, 360px, 414px before sign-off. Fall back to a dropdown if the segmented control breaks down.
- **Risk: Dutch literal pass-1 from the model is more wooden than de.ts (less training data, more false friends).** → Mitigation: cap reviewer expectations explicitly in the `nl.ts` header comment; budget more time for pass 2.
- **Risk: archive sequencing.** This change extends `internationalization` and `theory-generation` — both currently un-archived (still in `multilingual-german`). → Mitigation: archive `multilingual-german` first. If that ordering is broken, the dutch archive will fail at the spec-sync step the same way multilingual-german's first archive attempt did with `data-platform`.
- **Risk: Maarten or a Dutch-native reviewer becomes the bottleneck.** → Mitigation: ship the framework + pass-1 draft to main, gate the public locale-toggle exposure behind a feature flag (or hold the toggle commit) until passes 2+3 land.

## Migration Plan

1. Land the framework changes (Locale union, middleware, toggle 3-state, dict scaffolding, prompt scaffolding) in one or two PRs. Pass-1 dictionary draft included; site renders Dutch on `/nl/` URLs but NL is not yet exposed in the toggle (or hidden behind a flag).
2. Maarten runs pass 2 (idiomatic rewrite of `nl.ts` + Dutch prompts).
3. Native-ear pass: at least one NL reader and one BE reader review fresh output and the dictionary; flagged stiffness drives prompt + dictionary tweaks until below the threshold.
4. Source-story curation lands in parallel — at least 12 surviving Dutch rows in `seed.json`.
5. Expose NL in the masthead toggle. Announce.

Rollback: remove `nl` from `SUPPORTED_LOCALES`, remove the toggle pill, redirect `/nl/...` to `/`. Permalinks for Dutch generations remain readable (the page reads its locale from the row), so we lose only the language picker, not stored content.

## Open Questions

- Do we want a separate `feedback@` email address for Dutch users, or share `feedback@conspiracygenerator.org`? (Defer to Maarten.)
- Should the locale toggle scroll horizontally on very narrow viewports, or collapse into a dropdown? (Decide during mobile QA.)
- Does the `/about` page need Dutch versions of the credits paragraph that name the funding source? (Yes — translated, not invented; checked against the German version's wording for parity.)
