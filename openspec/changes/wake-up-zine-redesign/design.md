## Context

The current `web/` is a Next.js 15 App Router app (TypeScript + Tailwind + shadcn/ui) with a restrained editorial-newsprint identity: Fraunces display + Inter Tight body, paper/ink/move-accent palette, 1px hairline rules. It serves three locales (EN/DE/NL), real-news seed stories with images, DB-backed sessions for sharable `/g/[id]` permalinks, classroom mode, and a stats console.

The Claude Design tool produced a self-contained single-page React prototype called "Wake Up Zine" that the user picked from three explored directions. The prototype lives in `/tmp/design-spec/conspiracy-generator/project/index.html` and uses Babel-in-the-browser + UMD React + inlined data; it is **not** the structure we should copy. The prototype is a visual reference, not a target architecture.

This change applies the prototype's visual language and interaction primitives to the existing Next.js app without changing routing, data, or functional behavior.

## Goals / Non-Goals

**Goals:**

- Replace the design-token layer (palette, type, geometry, motion) so the whole app reads as Wake Up Zine.
- Ship the prototype's signature interaction primitives — pulpcard with hover lift + colorshift, sticker, debunk slam overlay, red marker per-line underline, dashed pencil-circle hover annotation, corkboard red-string connectors, "RECEIPTS!" marker stamp — as reusable React components.
- Apply the redesign consistently across **every** route, not just the primary flow.
- Preserve all existing functional capabilities and routes; no DB, API, or contract changes.
- Preserve three-locale support (EN/DE/NL) by adding new flavor strings to all three dictionaries.
- Preserve accessibility floor (WCAG 2.1 AA contrast, keyboard nav, ARIA, `prefers-reduced-motion`).
- Preserve the existing dark mode behavior where it makes sense — but the zine identity is light-by-default (cream paper); we treat dark mode as inverted-zine (ink-background + paper accents) rather than dropping it.

**Non-Goals:**

- Not changing the wizard's information architecture or step ordering.
- Not changing the moderation flow, content policy, or generation pipeline.
- Not changing the stats console's data shape — only restyling the charts.
- Not adopting the prototype's `theory(s, c, m)` slot-fill engine; we keep our existing LLM-generated theory text but layer the `MarkUnderline` annotation on top of slot-filled phrases the backend already marks.
- Not adopting the prototype's Babel-in-the-browser delivery or its inlined-data architecture.
- Not introducing new dependencies beyond three Google Fonts.
- Not adopting the prototype's `specs.html` developer specs page (our design specs live in `openspec/`).

## Decisions

### 1. Replace tokens wholesale; keep dark mode as inverted zine

**Decision:** Rip out the existing `paper / paper-alt / ink / ink-soft / move.*` palette and `Fraunces / Inter Tight / JetBrains Mono` font pairing. Replace with the zine palette (`paper #f3e9c4`, `paper-2 #ecddaa`, `ink #181410`, `hot #ff2e63`, `hot-2 #e51a4d`, `punch #ffd400`, `cool #1d4d8a`) and `Anton / Space Grotesk / Permanent Marker` font pairing. Keep dark mode but redefine it as inverted zine — `ink` background, `paper` text, `hot`/`punch` accents stay the same.

**Why:** The user picked "Replace the design system" wholesale, not opt-in. Half-applied tokens look incoherent. Keeping dark mode (rather than dropping it) means the existing theme toggle keeps working — and the inverted-zine variant looks great because the palette already includes both `ink` and `paper` as primary colors.

**Alternatives considered:**
- Opt-in tokens only — rejected; the user explicitly chose wholesale.
- Drop dark mode — rejected; the toggle already exists and persistent visitor state would silently break.

### 2. Self-host fonts via `next/font/google`

**Decision:** Load Anton, Space Grotesk, and Permanent Marker through `next/font/google` (same pattern as today's Fraunces/Inter-Tight/JetBrains-Mono). Do **not** copy the prototype's `<link rel="stylesheet" href="fonts.googleapis.com">`.

**Why:** `next/font/google` self-hosts the font files at build, eliminates CLS, removes a third-party request, and is the pattern already in use. The prototype's external link only exists because Claude Design can't bundle fonts.

### 3. Background texture: keep the prototype's recipe exactly

**Decision:** Apply the dual radial-dot halftone + `body::before` photocopy scan lines from the prototype verbatim in `globals.css`. Set `background-attachment: fixed` and `mix-blend-mode: multiply` as in the source.

**Why:** This is a signature element and the prototype already nailed the values. No reason to redesign.

**Trade-off:** Fixed-attachment backgrounds can be expensive on mobile during scroll. We accept this — the scan lines are 4-pixel periods of nearly-transparent overlay; modern mobile browsers handle this fine in our spot checks.

### 4. Components: build as React primitives in `components/zine/`

**Decision:** Group new design primitives under `web/components/zine/`:
- `Btn.tsx` — variant: `ink` (default) | `hot` | `punch` | `ghost` | `sm`. Display-font, hard-shadow.
- `Sticker.tsx` — variant: `hot` (default) | `yellow` | `blue` | `ink`. Optional `tilt` prop.
- `PulpCard.tsx` — wraps children; props: `tilt`, `hoverNote` (optional, passed to internal `HoverMark`).
- `HoverMark.tsx` — dashed pencil-circle SVG + rotated handwritten note.
- `MarkUnderline.tsx` — span with `.marked` class (CSS handles per-line wrap via background-image).
- `RedStrings.tsx` — SVG overlay; props: `headlineRef`, `moveRefs` (array of React refs). Recomputes on resize.
- `DebunkSlam.tsx` — animated overlay; props: `open`, `onClose`, children.
- `Topbar.tsx` — replaces existing `Masthead`; props: `onRecipe`, `onLesson`, `onReset`, `canReset`.
- `Pip.tsx` + `PipRow.tsx` — stepper indicator.
- `Modal.tsx` — zine-styled modal with sticker eyebrow + offset close.

Each primitive is server-component-safe where possible. `RedStrings` and `DebunkSlam` are client components (`"use client"`) because they use `useLayoutEffect` / `useState`. `HoverMark` and `MarkUnderline` are pure server components.

**Why:** Existing brand components live under `web/components/` flat. Putting new design primitives in a subdirectory keeps the boundary obvious during the rewrite and lets us delete the flat brand components in a clean step. After the change archives, the `zine/` namespace can be promoted to `components/` flat.

**Alternatives considered:**
- Rewrite existing component files in place — rejected; harder to review and to roll back. Side-by-side until cutover, then delete.

### 5. Animation strategy: respect `prefers-reduced-motion`

**Decision:** Define keyframes (`slam`, `snatch`, `dropIn`, `fadeIn`) in `globals.css`. Wrap each in `@media (prefers-reduced-motion: no-preference)` — the reduced-motion fallback is an instant cross-fade. Card tilts use `--tilt` CSS custom property so they can be toggled to `0deg` in reduced-motion media query without touching JS.

**Why:** WCAG 2.3.3 (Animation from Interactions). The slam animation overshoots and rotates; without a reduced-motion path it's a fail.

### 6. `MarkUnderline` integration with LLM-generated theory text

**Decision:** The existing theory-generation pipeline returns plain prose. We extend the schema so each move's theory text can optionally carry an array of `marked` substrings — phrases that should be wrapped in `<MarkUnderline>` at render time. The backend prompt is updated to tag the slot-fill phrases (the anomaly, the culprit name, the motive verb, the adjacent event, the official-channel mask) with `<mark>...</mark>` tags; a parser in `lib/recipe.ts` converts those tags into the segment array.

**Why:** The prototype hardcoded slot-fills with marker tags. Our prose is LLM-generated and we want flexibility; tagging at generation time keeps the annotation pedagogically meaningful (the user sees which words came from their picks) without requiring a brittle post-hoc regex.

**Risk:** If the LLM forgets to emit `<mark>` tags, the render falls back to plain text — visually flatter but not broken. We monitor in `/stats` how often this happens and tune the prompt.

### 7. `RedStrings` on permalink page: only desktop, only initial render + resize

**Decision:** `RedStrings` SVG paths are computed in `useLayoutEffect` from `getBoundingClientRect()` of the headline card and each move card. Re-compute on `window` resize. Below 640px, hide entirely (the cards stack — no string layout makes sense).

**Why:** Matches the prototype. Computing from DOM rects means we don't need to hardcode positions and handles long headlines / locale variations naturally.

**Risk:** Fonts may shift layout after initial paint — the prototype handles this with a `setTimeout(compute, 60)` second pass. We adopt the same pattern.

### 8. Locale handling: preserve all three; add zine flavor strings

**Decision:** Add a new `zine` section to each dictionary (`en.ts`, `de.ts`, `nl.ts`):
```ts
zine: {
  issue_tag: 'Issue #047 · "wake up, sheeple"' | ... ,
  hover_notes: ["PROOF???", "WAIT...", "COINCIDENCE?", "SUSPICIOUS!", "CONNECTED!", "GOTCHA"],
  receipts_stamp: "RECEIPTS!",
  exercise_not_manifesto: "An exercise · not a manifesto",
  // ~20 more
}
```

Translate hand. Use untranslated English for genre-specific terms (e.g., "Issue") if the locale would lose the joke; defer to existing dictionary tone otherwise.

**Why:** User explicitly chose "Preserve as-is" for locales. The zine flavor is the new copy; everything else stays in dictionaries as today.

### 9. Stats page restyle: pulpcard panels + zine palette

**Decision:** Restyle the stats console to use pulpcard panels for each chart, zine palette (`hot` for bars, `ink` for axes, `paper-2` for chart background, `cool` for secondary series). Keep all data shapes and tab layout.

**Why:** "Whole site, all routes" was the user's scope. Stats is internal but visible.

**Trade-off:** Tilted pulpcards aren't appropriate for chart panels (rotated charts read as broken). Stats pulpcards use `tilt: 0` and `hoverNote: null`.

### 10. Classroom mode: hide red-string strings AND hover marks

**Decision:** When `body[data-classroom="1"]` is set, hide `RedStrings`, `HoverMark`, and the "RECEIPTS!" marker stamp via CSS. The classroom-mode rule "hide all external share affordances" stays as-is.

**Why:** Classroom mode is for projection in a teaching context. Hover marks distract; red strings without hover context look like layout glitches when projected static. Keep the zine type/color but strip the marginalia.

## Risks / Trade-offs

- **Risk:** Three new Google Fonts add ~80KB to the initial bundle. **Mitigation:** `next/font/google` self-hosts and subsets to Latin; Anton and Permanent Marker have small character sets. Net change vs current Fraunces (which is variable-axis and heavier) is roughly neutral.

- **Risk:** The wholesale token replacement breaks any third-party shadcn/ui component currently styled to the old palette. **Mitigation:** Audit `web/components/` for shadcn imports before the rewrite; convert any survivors to use the new tokens. The flat brand components we're replacing don't use shadcn for the most part.

- **Risk:** Hover-mark annotations on touch devices don't fire (no `:hover` state). **Mitigation:** This is acceptable degradation — touch users still see the picker cards and CTA. We don't try to emulate hover on touch; the prototype made the same call.

- **Risk:** Real-news images on pulpcard story tiles fight visually with the strong zine card frame + tilt. **Mitigation:** Constrain images to a fixed aspect ratio with a 2.5px ink border; tilt the card body but not the image; test side-by-side on the home page picker before extending the pattern.

- **Risk:** `prefers-reduced-motion` not adequately tested. **Mitigation:** Add a Playwright check that toggles the media-feature emulation and confirms the slam keyframe is replaced with a fade-in.

- **Risk:** Disclaimer crop-resistance (required by `attribution-and-brand` spec) could be broken by the new layout. **Mitigation:** Place "100% fabricated" sticker visibly above the move grid AND a "do not share without context" caption on the dark headline card AND below the move grid — three positions, no scroll position can hide all three.

- **Trade-off:** The new identity is louder than what the project shipped before. Some users may read "satirical" rather than "educational" on first impression. **Mitigation:** The "An exercise · not a manifesto" sticker is the very first element above the H1 on the landing page; the "wake up, sheeple" subtitle is in quotes (irony marker).

## Migration Plan

1. **Build the design system in isolation** under `web/components/zine/` + `web/lib/zine-tokens.ts`. Old pages keep rendering with old tokens.
2. **Swap `globals.css` and `tailwind.config.ts`** in one commit. At this point old components look broken; this is expected and short-lived.
3. **Rewrite layout.tsx + page-by-page**, starting with `/` (home). After each page lands, click through it manually in EN/DE/NL at 360px / 768px / 1280px.
4. **Update i18n dictionaries** as routes are converted (don't pre-add all strings — add when used).
5. **Delete the old brand components** (`masthead.tsx`, `footer.tsx`, `logo.tsx`, `theme-toggle.tsx`, etc.) once all routes are off them. Verify no stragglers via `grep`.
6. **Run the accessibility verification**: contrast check via axe-core; reduced-motion path; keyboard nav across the wizard.
7. **Ship.** No DB migration needed.

**Rollback:** The whole change is contained in a single branch. Revert the branch. There is no schema change to undo.

## Open Questions

- **Dark mode visual treatment of `RedStrings` and `MarkUnderline`:** The hot/hot-2 reds were picked against cream paper. On `ink` background they read fine, but the marker underline's wobbly SVG is colored `#e51a4d` — does it still feel hand-drawn on dark, or does it need a brighter variant like `#ff4477`? Decide via spot-check after the dark-mode pass.
- **Story-picker images:** keeping them per the user's call. Do we also keep the `kicker` ("INFRASTRUCTURE · 3 days ago") meta line above the headline as in the prototype? Currently the home page uses source-host + summary; the prototype uses kicker + summary. Recommend: keep source-host (it's the real data); add kicker style only if there's a category field already on the seed records.
- **"Issue #047 · wake up, sheeple" topbar tag:** is `#047` symbolic (referencing the prototype's session counter)? Recommend: rotate the issue number per visit or per page to feel less hardcoded; or keep static and pick a number with semantic value.
