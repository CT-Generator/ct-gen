## Why

The current v2 visual identity is restrained editorial newsprint. After exploring three directions in the Claude Design tool (Detective Board, Newsroom Broadsheet, Wake Up Zine), we picked **Wake Up Zine** — pulp tabloid with halftone, magenta + electric yellow, photocopy scan lines, hand-drawn red marker, and corkboard red-string connectors. The choice is pedagogical: the aesthetic uses the conspiracist's own visual language (annotated evidence, "RECEIPTS!" stamps, red marker on "weird" details) so the *design itself* embodies what the user is learning to spot. Restrained newsprint doesn't do that work.

This change replaces the existing design system with the Wake Up Zine system across the entire app — home, selection wizard, generation, permalink share pages, recipe, teach, about, stats, legal — while preserving all functional capabilities (multi-locale, real-news seed, DB-backed sessions, classroom mode, yolo mode, stats).

## What Changes

- **BREAKING** Replace the design token system (color palette, type pairing, shadows, geometry, motion) wholesale in `web/app/globals.css` and `web/tailwind.config.ts`. Adopt: `--paper` `#f3e9c4`, `--ink` `#181410`, `--hot` `#ff2e63`, `--punch` `#ffd400`, `--cool` `#1d4d8a`; fonts Anton (display) / Space Grotesk (body) / Permanent Marker (hand); 6px–12px offset hard shadows; fluid clamp() type scale.
- **BREAKING** Replace existing brand components (`masthead.tsx`, `footer.tsx`, `logo.tsx`, `move-glyph.tsx`, `narrative-stamp.tsx`, `move-tell-stamp.tsx`, `theory-headline.tsx`, `theme-toggle.tsx`) with zine equivalents: sticky `topbar` with star-clipped brand mark + "Issue #047" tag, pulp-styled footer, restyled move iconography.
- Add new design primitives as React components: `PulpCard` (tilted, hard-shadow card with hover lift + colorshift), `Sticker` (rotated paper sticker in 4 colors), `Pip` / `PipRow` (stepper), `Btn` (display-font button in `ink` / `hot` / `punch` / `ghost` variants), `Modal` (paper modal with overshot drop-in keyframe + offset close button), `MarkUnderline` (red wobbly per-line underline via SVG background-image — works with `box-decoration-break: clone`), `HoverMark` (dashed pencil-circle + rotated handwritten note appearing on card hover), `RedStrings` (SVG corkboard string connectors with pin dots, computed on resize), `DebunkSlam` (overlay that drops in with rotation overshoot, snatches back up on close).
- Add **page background texture**: dual radial-dot halftone (5px/11px) + fixed `body::before` repeating-linear-gradient photocopy scan lines with multiply blend.
- Restyle the **home page** `(/, /nl)`: zine landing with split layout (left = hero scream-type + start button; right = stacked tilted "exposé" stickers showing the four moves and the lesson-plan callout). Story picker becomes a single-column list of pulpcards retaining real-news images and source-host meta.
- Restyle the **selection wizard** (`/story/[uuid]`, `/build`): each step becomes a `GenericPicker` with sticker headers ("Step 1 of 3"), screaming display headline, and a 3-col / 2-col / 1-col responsive pulpcard grid with `HoverMark` annotation overlay.
- Restyle the **theory display** at `/g/[id]`: assembled "exposé" board with a black `ink`-background headline card on the left (with offset hot-pink shadow + "RECEIPTS!" marker stamp), a 2x2 grid of move cards on the right, and `RedStrings` SVG connectors drawn from the headline to each move card. Each move's templated `theory` text uses `MarkUnderline` on slot-filled phrases so the user sees which words their picks generated. Debunk text remains alongside but presented as the editorial counter-voice (label "Why it doesn't hold up").
- Restyle the **recipe page** `/recipe`: zine layout with each of the four moves as a numbered tile (red number badge `01`–`04`, tactic label in `hot-2`, debunk body). Open `RecipeModal` equivalent if approached from topbar.
- Restyle the **teach page** `/teach`: zine layout of the 45-minute lesson plan (list with hand-drawn accents, blue sticker eyebrow, "Free in classrooms" callout).
- Restyle remaining pages — **about**, **stats**, **imprint**, **privacy**, **build**, error pages — to use the same design tokens (paper background, scan lines, scream-type headings, pulpcard panels, sticker labels). Stats charts inherit zine palette (`hot` bars on `paper`, `ink` axes).
- Add **conspiracy-specific touches** as pedagogically-motivated UI: per-line `MarkUnderline` on user-generated phrases, `HoverMark` ("PROOF???", "WAIT...", "COINCIDENCE?", "SUSPICIOUS!", "CONNECTED!", "GOTCHA") rotated through picker cards, `RedStrings` corkboard connectors on the final board, "RECEIPTS!" marker stamp on the headline card, photocopy scan lines on every page.
- **Responsive**: two breakpoints at 640px (mobile) and 900px (tablet). Picker grids 3→2→1. Landing two-col→stack. Final board strings hide on mobile. Card tilts disabled on mobile. 44px min tap target on all buttons. Topbar drops the issue tag and "Design specs" link below 640px. Modals get tight padding and lock body scroll.
- Preserve **multi-locale** (EN + NL): all design copy that exists in dictionaries today stays in dictionaries; new zine flavor strings (topbar issue tag, sticker labels, hover notes, "RECEIPTS!", "wake up, sheeple") get added to both `en` and `nl` dictionaries with hand translations.
- Preserve **accessibility floor**: WCAG 2.1 AA contrast (hot-pink on paper passes; check ink-on-paper, punch-on-ink); keyboard nav and ARIA labels on `HoverMark` (`aria-hidden="true"`), `RedStrings` (`aria-hidden="true"`), debunk close button (`aria-label`), modals (focus trap + ESC close). Tilts and slam animations respect `prefers-reduced-motion: reduce` by dropping to no-tilt + cross-fade.
- Add `web/lib/zine-tokens.ts` exporting design tokens as TypeScript constants (for inline `style={{}}` use where Tailwind utility doesn't reach).

## Capabilities

### New Capabilities

- `zine-design-system`: Wake Up Zine visual language — design tokens (palette, type, geometry, motion), background texture (halftone + scan lines), primitive components (`Btn`, `Sticker`, `PulpCard`, `Pip`, `Modal`), and the conspiracy-specific annotation primitives (`MarkUnderline`, `HoverMark`, `RedStrings`, `DebunkSlam`).

### Modified Capabilities

- `attribution-and-brand`: The "Visual identity v2" requirement is replaced wholesale with the Wake Up Zine identity. The accessibility floor and the screenshot-crop-resistant disclaimer requirements remain in force; they apply to the new design unchanged. The educational-purpose-framing-in-first-viewport requirement is satisfied by the zine landing's "An exercise · not a manifesto" sticker + body text.
- `selection-flow`: Curated picker presentation is restyled — the requirement that "the news selection screen presents a sample of curated news items, each with a name, summary, and image" now resolves to pulpcard layout with `HoverMark` annotation overlay. Functional requirements (custom typed input, moderation gating, selection persistence, confirmation summary) are unchanged.
- `conspiracy-output`: Permalink page layout becomes the assembled exposé board. The "screenshot-crop-resistant disclaimer" requirement is preserved by placing a disclaimer-strength label on the dark headline card AND a "100% fabricated" sticker above the move grid AND a similar caption below — disclaimer present in every reasonable crop. Slot-fill phrases SHALL render with `MarkUnderline` so the user sees which words came from their picks; this is a new sub-requirement.

## Impact

- **Affected code**: every file under `web/app/**` and `web/components/**`, plus `web/tailwind.config.ts`, `web/app/globals.css`, `web/lib/i18n.ts` (for new flavor strings).
- **Dependencies**: add Google Fonts `Anton`, `Space Grotesk`, `Permanent Marker` (via `next/font/google` for self-hosting; do not use the prototype's external `<link>` tag).
- **No DB changes**, no API contract changes, no migrations. Existing `/g/[id]` permalinks render under the new design with no data shape change.
- **Locale dictionary growth**: ~20–30 new strings per locale for zine-specific flavor (sticker labels, hover notes, topbar issue tag, "RECEIPTS!", "wake up, sheeple", "Build another", etc.).
- **Verification**: snapshot pages at desktop + tablet + mobile across all routes in both locales; check WCAG contrast for every new color pairing; check `prefers-reduced-motion` paths.
- **Out of scope**: no copy rewrites beyond strings the design introduces; no functional changes to wizard, moderation, generation, sharing, stats, classroom/yolo modes.
