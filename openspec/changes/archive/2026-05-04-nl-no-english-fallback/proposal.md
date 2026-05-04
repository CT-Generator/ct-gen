## Why

The shipped multilingual-dutch work added the `nl` locale to the dictionary, types, and most rendering paths, but `internationalization` doesn't have an explicit "no English fallback" rule. The structural guarantee (TypeScript's `Dictionary` union enforces all keys per locale) covers dictionary lookups, but a grep surfaces seven hardcoded `locale === "de" ? <de-content> : <en-content>` ternaries that drop `nl` into the English branch — so under `/nl/`, error pages render in English, the OG `og:locale` is `en_US`, and the wizard progress bar reads "Move" instead of the Dutch equivalent.

This change makes the rule explicit at the spec level and fixes the concrete violations the rule surfaces. The rule is locale-symmetric (applies to any non-English locale) but the immediate driver is Dutch.

## What Changes

- Add a new requirement to `internationalization`: when the resolved locale is not `en`, every user-facing string MUST come from that locale's dictionary; no code path may render an English literal as a fallback for a non-English locale; missing dictionary keys MUST be a typecheck-time hard fail (already true via the `Dictionary` typed union — this change codifies it).
- Fix the seven existing violations the rule exposes:
  - `web/app/error.tsx` × 2 (errors dictionary lookup + home href)
  - `web/app/global-error.tsx` × 2 (same patterns)
  - `web/app/layout.tsx` × 1 (OG `locale` field)
  - `web/components/build-wizard.tsx` × 2 (progress-bar `Schritt`/`Move` label)
- Add Dutch values for any new dictionary keys introduced by these fixes (e.g., `nl.errors.*` already exists; `wizard.move_label` if we route the build-wizard label through the dictionary instead of inline).

## Capabilities

### New Capabilities
<!-- None — extends an existing capability. -->

### Modified Capabilities
- `internationalization`: add the no-English-fallback requirement; codify the typecheck-time guarantee.

## Impact

- **UI**: edits to `web/app/error.tsx`, `web/app/global-error.tsx`, `web/app/layout.tsx`, `web/components/build-wizard.tsx`. View-layer only.
- **i18n**: possibly one new `wizard.move_label` key (if we route the build-wizard label through the dictionary); EN/DE/NL values needed.
- **Specs**: one modified-capability delta (`internationalization` adds one requirement).
- **Latency / cost**: zero.
- **Backwards compatibility**: no behavior change for `en` or `de` users (their existing strings are unchanged). Dutch users get correct Dutch in places they were getting English before.
- **Pedagogical posture**: removes a class of silent locale-fallback bugs that would otherwise mask future dictionary regressions.
