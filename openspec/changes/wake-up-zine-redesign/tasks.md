## 1. Foundation — tokens, fonts, globals, texture

- [x] 1.1 Replace `web/tailwind.config.ts` colors with zine palette (`paper`, `paper-2`, `ink`, `hot`, `hot-2`, `punch`, `cool`). Keep light/dark variants by inverting `paper` and `ink` for dark.
- [x] 1.2 Replace `web/tailwind.config.ts` fontFamily with `display: var(--font-display)` (Anton), `body: var(--font-body)` (Space Grotesk), `hand: var(--font-hand)` (Permanent Marker).
- [x] 1.3 In `web/app/layout.tsx` swap the `next/font/google` imports from Fraunces/Inter-Tight/JetBrains-Mono to Anton/Space-Grotesk/Permanent-Marker, exposing `--font-display`, `--font-body`, `--font-hand`.
- [x] 1.4 Rewrite `web/app/globals.css`: declare the full zine `:root` block (palette, type scale, geometry, motion, layout vars), the dual-radial halftone `body` background, the `body::before` scan-line overlay (multiply blend, fixed inset), the `.marked` per-line marker class, the `.scream`/`.marker`/`.body`/`.label` helpers, the `.pulpcard`/`.sticker`/`.pip` block, the `.modal-bg`/`.modal` styles, the keyframes (`slam`, `snatch`, `dropIn`, `fadeIn`), and the responsive media queries (640px, 900px).
- [x] 1.5 Add `web/lib/zine-tokens.ts` exporting the palette + key sizing tokens as TypeScript constants for inline `style={{}}` use.
- [x] 1.6 Add `prefers-reduced-motion: reduce` overrides in `globals.css` that flatten all rotations and replace keyframe animations with ≤80ms opacity fades.

## 2. Design primitives

- [x] 2.1 Create `web/components/zine/Btn.tsx` with variants `ink` (default) | `hot` | `punch` | `ghost` and size modifier `sm`; 44px min-height; hover-lift + active-press transforms.
- [x] 2.2 Create `web/components/zine/Sticker.tsx` with colors `hot` | `yellow` | `blue` | `ink`; `tilt` prop; `white-space: nowrap`.
- [x] 2.3 Create `web/components/zine/PulpCard.tsx` accepting `tilt`, `hoverNote`, `onClick`, `as` (default `article`); internal scan-line background; renders `<HoverMark>` when `hoverNote` non-null.
- [x] 2.4 Create `web/components/zine/HoverMark.tsx` (server component, `aria-hidden`) — dashed ellipse SVG + rotated Permanent Marker note.
- [x] 2.5 Create `web/components/zine/MarkUnderline.tsx` (server component) — wraps children in `<span class="marked">`.
- [x] 2.6 Create `web/components/zine/RedStrings.tsx` (`"use client"`) — `useLayoutEffect` to measure refs, render SVG paths + pin dots, recompute on resize, hide below 640px, `aria-hidden`.
- [x] 2.7 Create `web/components/zine/DebunkSlam.tsx` (`"use client"`) — overlay with `slam` open keyframe + `snatch` close keyframe, focus trap, ESC handler, body-scroll lock.
- [x] 2.8 Create `web/components/zine/Modal.tsx` (`"use client"`) — paper modal with `dropIn` animation, sticker eyebrow, offset close, backdrop-click close, ESC close, body-scroll lock.
- [x] 2.9 Create `web/components/zine/Topbar.tsx` — sticky brand mark (star-clipped magenta) + "Conspiracy Generator" + Issue tag + nav (Recipe / Lesson plan / Start over / locale toggle / theme toggle); responsive collapse at 640px.
- [x] 2.10 Create `web/components/zine/Pip.tsx` + `PipRow.tsx` for the wizard stepper indicator.
- [x] 2.11 Create `web/components/zine/Footer.tsx` — credits + funding line in zine type, with `cool` blue link color and a paper-on-ink sticker accent.
- [x] 2.12 Create `web/components/zine/MarkerStamp.tsx` — rotated Permanent Marker text on paper background with ink border + offset shadow (the "RECEIPTS!" stamp).

## 3. i18n — new flavor strings

- [x] 3.1 Extend `web/lib/i18n/types.ts` `Dict` shape with a `zine` section (`issue_tag`, `hover_notes[6]`, `receipts_stamp`, `exercise_not_manifesto`, `tonights_exclusive`, `you_can_be_a_conspiracist`, `educational_purposes_only`, `four_moves_youll_learn`, `free_in_classrooms`, `lesson_plan_blurb`, `100_percent_fabricated`, `expose_for_instructional`, `built_in_three_minutes`, `do_not_share_without_context`, `whats_left_in_the_picks_caption`, `back_a_step`, `move_n_of_4`, `your_theory`, `the_move`, `as_told_by_you`, `now_show_me_debunk`, `back_to_the_theory`, `next_move`, `see_the_whole_thing`, `save_poster`, `build_another`, `start_the_exercise`, `takes_three_minutes`, `the_four_moves_title`). (Note: type added in en.ts where `Dictionary` is defined; types.ts only carries Locale enum.)
- [x] 3.2 Add zine section to `web/lib/i18n/en.ts` with English strings.
- [x] 3.3 Add zine section to `web/lib/i18n/nl.ts` with Dutch translations.
- [x] 3.4 Add zine section to `web/lib/i18n/de.ts` with German translations.
- [x] 3.5 Spot-check that the existing dictionary keys consumed by re-skinned pages still resolve (no removed-key references). Verified via `npx tsc --noEmit` exit 0.

## 4. Theory-text marker integration

- [ ] 4.1 Update the theory-generation prompt in `web/lib/recipe.ts` (or equivalent) to instruct the model to wrap slot-fill phrases in `<mark>…</mark>` tags — specifically: the anomaly, the culprit name, the motive verb-phrase, the adjacent event, and the official-channel mask.
- [ ] 4.2 Add a parser in `web/lib/recipe.ts` that splits a theory string at `<mark>…</mark>` boundaries into a segment array (`string | { mark: string }`).
- [ ] 4.3 Add a `<TheoryText parts>` React component in `web/components/zine/` that renders the segment array, wrapping `mark` segments in `<MarkUnderline>`.
- [ ] 4.4 Fall back to plain text rendering if no `<mark>` tags are present in a theory response.

## 5. Layout + Topbar

- [x] 5.1 Replace `<Masthead>` usage in `web/app/layout.tsx` (or page-by-page) with `<Topbar>`. Remove the old masthead-client / masthead components after all routes migrate. (Delegated: `components/masthead.tsx` now re-exports `Topbar` so every existing page picks up the new design without further changes. Old masthead-client.tsx + logo.tsx kept until cleanup pass — see 14.1.)
- [x] 5.2 Wire the existing locale toggle and theme toggle into the new Topbar (re-use logic from `theme-toggle.tsx`).
- [x] 5.3 Replace the existing `<Footer>` everywhere with the new zine Footer. (Same delegate pattern: `components/footer.tsx` re-exports zine Footer.)

## 6. Home page (/)

- [x] 6.1 Rewrite `web/app/page.tsx` to the zine landing layout: two-column flow with hero on the left (sticker eyebrow + scream H1 in three lines + scream "From scratch." with punch background + body deck + Start button + Permanent Marker "takes 3 minutes!!" annotation + credits label), and a right column of three stacked tilted exposé stickers ("Tonight's exclusive", "The four moves you'll learn", "Free in classrooms").
- [x] 6.2 Below the hero, render the news picker as a single-column stack of horizontal `<PulpCard>`s, each retaining the story image (left), kicker meta (source host), Anton headline, summary, and "Pick it →" CTA.
- [x] 6.3 Apply random `tilt` and `hoverNote` from fixed arrays (matching the spec's `TILTS` and `HOVER_NOTES`).
- [x] 6.4 Ensure refresh-the-sample link (`?r=`) styles match zine (`cool` blue, label-style).
- [ ] 6.5 Test EN / DE / NL renders at 1280 / 768 / 360. (Pending manual visual verification with dev server — production build passes; tsc clean.)

## 7. Story / Build (/story/[uuid], /build)

- [ ] 7.1 Rewrite the story-detail / culprit-pick / motive-pick screens as `<GenericPicker kind="culprit|motive">` with sticker step indicator ("Step 2 of 3"), File-open yellow sticker if a story is set, scream H2, body deck, and a `<PulpCard>` grid (3/2/1 responsive).
- [ ] 7.2 Replace `conspirators-picker.tsx` with picker that emits pulpcards.
- [ ] 7.3 Wire the existing "or type your own" custom-input affordance under the picker grid in a labeled sub-section; preserve moderation gating unchanged.
- [ ] 7.4 The build-wizard now also renders step screens for moves 1–4 as `<StepScreen>` cards: punch-yellow header with "The move" label, Anton move name + Permanent Marker tagline, body theory text with `<TheoryText>` slot-marks + caption, and a "Now show me the debunk" `<Btn variant="ghost">`. Clicking opens a `<DebunkSlam>` overlay containing the debunk title (Anton), debunk body, "A useful test" footer, and "Back to the theory" / "Next move →" buttons.
- [ ] 7.5 Stepper pip row (`<PipRow>`) reflects the current move index.

## 8. Permalink / Generation (/g/[id])

- [ ] 8.1 Rewrite `/g/[id]` page to the exposé board layout: three exposé stickers above + `final-grid` two-column (1.05fr / 1fr) with dark headline card (left) and 2×2 move grid (right).
- [ ] 8.2 Headline card: `var(--ink)` background, `var(--paper)` text, `8px 8px 0 var(--hot)` shadow, `var(--punch)` "The official story" label, Anton scream headline, kicker meta, hairline divider, "What 'they' don't want you to know" body with culprit + motive, "Generator output · session #… · do not share without context" footer, and rotated `<MarkerStamp>` "RECEIPTS!" top-right.
- [ ] 8.3 Move grid: 4 cards in `[punch, paper, paper, punch]` order, each with `01`–`04` in Anton `var(--hot-2)`, move name, tactic label, and theory text via `<TheoryText>`.
- [ ] 8.4 Add `<RedStrings>` overlay on desktop (>640px) drawing from a `headlineRef` to four `moveRefs`.
- [ ] 8.5 Below the grid: body block ("What you just learned…") + "Save poster" ghost button + "Build another" hot button.
- [ ] 8.6 Verify disclaimer crop-resistance — the three disclaimer-strength elements ("100% fabricated" sticker / dark-card footer / "What you just learned" block) appear in every viewport-sized screenshot at 360 / 768 / 1280.
- [ ] 8.7 Update `share-buttons.tsx` to match zine `<Btn>` variants.

## 9. Recipe page (/recipe) + modal

- [ ] 9.1 Rewrite `/recipe` as a zine page: yellow sticker eyebrow "Recipe page", Anton title "The four moves.", deck body, then four numbered tiles (red `01`–`04` badge + Anton name + `hot-2` tactic label + body debunk text).
- [ ] 9.2 Wire the same content into a `<RecipeModal>` accessible from the Topbar's "Recipe" button (uses `<Modal>` primitive).

## 10. Teach / Lesson plan (/teach) + modal

- [ ] 10.1 Rewrite `/teach` as a zine page: blue sticker eyebrow "For teachers", Anton title "Lesson plan · 45 min.", label "Secondary · undergraduate · media literacy", ordered list of the 5 steps in body type with bold step names.
- [ ] 10.2 Wire the same content into a `<LessonModal>` from the Topbar.

## 11. About / Imprint / Privacy

- [ ] 11.1 Rewrite `/about` in zine style: sticker eyebrow, scream Anton heading, body credits (Boudry, Meyer, Newbold, Darras, Keroti, Ghent), funder block, paper-link references to academic paper + blog post. Preserve every v1 contributor as required by the `attribution-and-brand` spec.
- [ ] 11.2 Rewrite `/imprint` and `/privacy` with zine tokens: paper background, Anton H1, body text, `cool` link color. No marginalia (no hover marks, no red strings).

## 12. Stats console (/stats)

- [ ] 12.1 Restyle `web/app/stats/*` pages and the existing `bar-chart.tsx` / `line-chart.tsx` to use the zine palette: `hot` bars, `cool` secondary series, `ink` axes, `paper-2` chart background.
- [ ] 12.2 Wrap each chart in a `<PulpCard tilt={0} hoverNote={null}>` so the panels read as zine without the rotation/hover effects that would break chart readability.
- [ ] 12.3 Restyle `stats-tabs.tsx` with zine type and `var(--punch)` active-tab indicator.

## 13. Error + miscellaneous pages

- [ ] 13.1 Rewrite `web/app/error.tsx`, `web/app/global-error.tsx`, and `web/app/not-found.tsx` to zine: paper background, Anton scream "Something went sideways." / "Page not found." headline, body explanation, `<Btn variant="hot">` "Back to the front page" link.
- [ ] 13.2 Verify any pages under `web/app/healthz/` and `web/app/api/` are untouched (server-only / non-visual).

## 14. Cleanup — delete superseded brand components

- [ ] 14.1 After all routes migrate, delete: `web/components/masthead.tsx`, `masthead-client.tsx`, `footer.tsx`, `logo.tsx`, `move-glyph.tsx`, `narrative-stamp.tsx`, `move-tell-stamp.tsx`, `theory-headline.tsx`, `theme-toggle.tsx`, `print-button.tsx` (if not in use), `rating-bar.tsx` (verify if still used), `move-chip.tsx`, `yolo-progress.tsx` (restyle in zine instead — keep file, rewrite).
- [ ] 14.2 `grep -r "@/components/masthead"` and similar should return zero matches.
- [ ] 14.3 Promote `web/components/zine/*` files to `web/components/*` (flat) — optional refactor after the change archives.

## 15. Accessibility verification

- [ ] 15.1 Run axe-core (or `@axe-core/playwright`) against home, story, build, /g/[id], recipe, teach, about, stats. Resolve any contrast violations on the new palette.
- [ ] 15.2 Manually keyboard-nav the full wizard (home → story pick → culprit pick → motive pick → steps 1–4 → permalink). Confirm visible focus ring on every interactive element.
- [ ] 15.3 Enable "Reduce motion" in OS settings; click through the wizard; confirm no slam/dropIn keyframe overshoots, all `PulpCard` tilts read as 0deg.
- [ ] 15.4 Screen-reader smoke test (VoiceOver): verify `<HoverMark>` and `<RedStrings>` are skipped (`aria-hidden`); verify recipe moves and debunks announce with their labels; verify modal close buttons have `aria-label`.

## 16. Responsive verification

- [ ] 16.1 Manually inspect every route at 1280px / 800px / 360px in light AND dark mode.
- [ ] 16.2 Verify picker grids collapse 3 → 2 → 1.
- [ ] 16.3 Verify landing two-column collapses.
- [ ] 16.4 Verify Topbar drops issue tag + secondary nav links below 640px.
- [ ] 16.5 Verify `<RedStrings>` does not render below 640px.
- [ ] 16.6 Verify all `<Btn>` instances have 44px+ tap targets.

## 17. Classroom mode + yolo mode regression

- [ ] 17.1 Enable classroom mode; verify `<HoverMark>`, `<RedStrings>`, and `<MarkerStamp>` are hidden via CSS; verify pulpcards/stickers/zine type remain visible.
- [ ] 17.2 Trigger yolo mode flow; verify `yolo-progress` restyle uses zine palette and that the skip-to-result flow still produces a valid `/g/[id]`.
- [ ] 17.3 Verify the existing `body[data-classroom="1"] [data-share-area] { display: none }` rule still applies after the `globals.css` rewrite.

## 18. Multi-locale regression

- [ ] 18.1 Click through the full flow in EN; verify every visible string resolves (no `undefined` or key literals leaking).
- [ ] 18.2 Repeat in DE.
- [ ] 18.3 Repeat in NL.
- [ ] 18.4 Verify scream H1 sizing doesn't overflow in DE (long compound words) — adjust `--t-scream-xl` upper bound or use locale-conditional line-breaks if needed.

## 19. Build + ship

- [ ] 19.1 `pnpm build` cleanly with no TypeScript errors.
- [ ] 19.2 Confirm zero ESLint warnings on the changed files.
- [ ] 19.3 Smoke-deploy to a preview environment (Hetzner or Vercel preview); pass through the full wizard in EN at 1280px.
- [ ] 19.4 Open the change archive `openspec archive wake-up-zine-redesign` once shipped.
