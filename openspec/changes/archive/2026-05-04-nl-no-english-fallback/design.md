## Context

The `internationalization` capability currently states that the system supports `en`, `de`, and `nl` and that locale-keyed dictionaries are the single source of UI copy. Compile-time enforcement is partial: `de.ts` and `nl.ts` declare `export const de: Dictionary` / `export const nl: Dictionary`, so missing keys fail typecheck. But there's no spec rule against hardcoded language fallthrough at the call site, which is exactly the bug pattern that has crept into seven spots:

```ts
locale === "de" ? "Schritt" : "Move"          // build-wizard.tsx
locale === "de" ? "/de" : "/"                 // error.tsx, global-error.tsx
locale === "de" ? "de_DE" : "en_US"           // layout.tsx OG locale
locale === "de" ? de : en                     // error.tsx, global-error.tsx
```

These tested fine pre-`nl` (every non-de locale was `en`). Post-`nl`, the ternary silently drops Dutch into the English branch.

## Goals / Non-Goals

**Goals:**
- Codify a locale-symmetric rule: no code path may render an English literal as a fallback for a non-English locale.
- Make the typecheck-time guarantee that `nl.ts` and `de.ts` cover the full `Dictionary` surface area an explicit spec property.
- Fix the seven known violations.

**Non-Goals:**
- Ban locale-conditional logic entirely (`locale === "de"` is fine for routing, format strings, etc. — only ban it as a *fallback for missing localized content*).
- Backfill missing Dutch seed entries (separate, Maarten-curated work tracked in the archived `multilingual-dutch` change tasks 5.x).
- Verify pass-2 / pass-3 native review of Dutch dictionary copy (separate workstream).
- Add new locales beyond `en/de/nl`.

## Decisions

### One spec rule, locale-symmetric

Add a single requirement to `internationalization`: "No English fallback for non-English locales". The wording covers all current and future non-en locales, not just `nl`. The change name uses "nl" because that's what surfaced the problem, but the rule itself is general.

### Fix violations by routing through the dictionary

For each ternary:
- `error.tsx` / `global-error.tsx` `errors` lookup: replace `(locale === "de" ? de : en).errors` with a dict lookup that handles all locales. These are client error boundaries, so they import `en` and `de` directly (they can't use `getDict` from a server-only module). Solution: import `nl` too and switch on locale with a default-case throw, OR use a `Record<Locale, Dictionary>` map keyed by the locale.
- `error.tsx` / `global-error.tsx` home href: replace `locale === "de" ? "/de" : "/"` with a small inline locale-prefix helper (`locale === "en" ? "/" : `/${locale}``) — same pattern the picker already uses.
- `layout.tsx` OG `locale`: map each Locale to its OG-locale string (`en_US`, `de_DE`, `nl_NL`) via a small constant.
- `build-wizard.tsx` move label: thread `move_label` through the existing `wizard` dictionary section and pass it as a prop from the server-component wrapper, replacing the inline `locale === "de" ? "Schritt" : "Move"`. This makes the wizard label fully dictionary-driven.

**Alternative considered:** keep some ternaries (e.g., the OG locale) and just make the spec rule "all USER-FACING TEXT must come from the dictionary". Rejected because the OG locale is user-facing in the sense that it's broadcast to social-media previews, and the rule should cover all locale-derived strings shown to (or about) the user.

## Risks / Trade-offs

- **[Adding `nl.ts` import to client error boundaries grows the bundle slightly]** → Negligible (the dictionary is plain JSON-shaped data; bundling all three locales adds a few KB). Acceptable price for correct rendering.
- **[New `wizard.move_label` key]** → Adds a Dictionary key, which forces all three locales to provide a value. Trivially satisfied with `Move` / `Schritt` / `Stap`.
