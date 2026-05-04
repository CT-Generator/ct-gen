## 1. i18n keys (foundation for all UI work)

- [x] 1.1 Add `generation.narrative_stamp` (en+de) with values `FAKE THEORY · BUILT FROM A RECIPE` / `ERFUNDENE THEORIE · NACH REZEPT GEBAUT`
- [x] 1.2 Add `generation.moves_legend_prefix` (en+de): `Built from:` / `Gebaut aus:`
- [x] 1.3 Add `generation.see_breakdown_cta` (en+de): `↓ See how the trick was built` / `↓ So ist der Trick gebaut`
- [x] 1.4 Add `generation.breakdown_explainer` (en+de): `Each paragraph above used one of four moves. Here's each move on its own, with the debunk.` / `Jeder Absatz oben nutzt einen der vier Schritte. Hier ist jeder Schritt einzeln — mit Auflösung.`
- [x] 1.5 Replace `story.cta_yolo` (en): `Skip the lesson — show me the theory →`
- [x] 1.6 Replace `story.cta_yolo` (de): `Lektion überspringen — nur die Theorie zeigen →`
- [x] 1.7 Update the `Dictionary` type in `web/lib/i18n/en.ts` to declare the four new `generation.*` keys

## 2. Narrative stamp component

- [x] 2.1 Decide between extending `web/components/move-tell-stamp.tsx` with a `kind: "narrative"` mode vs. creating a new `narrative-stamp.tsx`. Chose sibling component — `MoveTellStamp` is `Move`-typed and extending muddies the API
- [x] 2.2 Render the stamp as a `position: absolute` element in the bottom-right of a `position: relative` wrapper, ink-soft tone (no move accent), small caps mono — matching the existing per-move-stamp visual language
- [x] 2.3 Pass the locale-appropriate `t.narrative_stamp` text into the stamp

## 3. Update `/g/[id]` rendering

- [x] 3.1 In `web/app/g/[id]/page.tsx`, wrap the narrative paragraphs in a `position: relative` container so the stamp anchors correctly
- [x] 3.2 Mount the narrative stamp inside the wrapper at bottom-right
- [x] 3.3 Render the moves-legend line directly below the narrative paragraphs: prefix from `t.moves_legend_prefix`, then `MOVES.map(m => <span style={{color:m.color}}>{m.title.toUpperCase()}</span>)` joined by a meta separator (` · `)
- [x] 3.4 Render the "see how the trick was built" CTA at the end of the narrative section (below the moves legend) — use a plain `<a href="#breakdown">` with smooth-scroll CSS, focusable, localized text from `t.see_breakdown_cta`
- [x] 3.5 Add `id="breakdown"` to the breakdown eyebrow element so the anchor scroll lands there
- [x] 3.6 Render the breakdown explainer line directly below the breakdown eyebrow, gated on `content.narrative?.paragraphs?.length`, text from `t.breakdown_explainer`
- [x] 3.7 Confirm the narrative section, legend, and CTA only render when narrative is present; the stamp + legend + CTA all remain absent on older rows
- [x] 3.8 Confirm the breakdown explainer only renders when narrative is present; older rows render the existing eyebrow logic (which itself is already narrative-gated)

## 4. Yolo CTA promotion (picker)

- [x] 4.1 In `web/components/conspirators-picker.tsx`, replace the right-aligned underline link with an outlined secondary button placed in the same flex row as the primary CTA
- [x] 4.2 Style the secondary button: visible border, no fill (or muted fill), ink-soft text, same padding as primary, same font-display family, slightly smaller font-size if needed for hierarchy
- [x] 4.3 Reuse the existing `yoloPending` / `anyPending` disable logic and `Starting` loading affordance — no behavior change
- [x] 4.4 The button reads `labels.cta_yolo` when idle and `labels.cta_yolo_starting` when pending (existing prop wiring)
- [x] 4.5 Verify both CTAs are disabled together when `!ready`

## 5. Crop-resistance verification (visual)

- [x] 5.1 Inspect `/g/[id]` HTML for an English narrative-present row — stamp sits inside the same DOM wrapper as the three narrative paragraphs (1889 chars between "The theory" eyebrow and the stamp, all narrative text)
- [x] 5.2 Same check at 1440px viewport — same DOM structure (CSS responsive, no breakpoint-conditional changes to stamp positioning)
- [x] 5.3 Same check on `/de/g/[id]` — `ERFUNDENE THEORIE · NACH REZEPT GEBAUT` renders inside narrative wrapper
- [x] 5.4 Moves-legend renders all four locale-appropriate move titles in accent colors: EN (`HUNT ANOMALIES · FABRICATE CONNECTIONS · DISMISS COUNTER-EVIDENCE · DISCREDIT THE CRITICS`), DE (`AUFFÄLLIGKEITEN SUCHEN · VERBINDUNGEN ERFINDEN · GEGENBEWEISE ABWEHREN · KRITIKER:INNEN DISKREDITIEREN`)
- [x] 5.5 "See how the trick was built" anchor target `id="breakdown"` present on breakdown eyebrow; CTA href `#breakdown` resolves; CTA + explainer rendered in correct order

## 6. Manual verification (live e2e)

- [x] 6.1 Picker (en): "Start building" + "Skip the lesson — show me the theory" both render; old "Or: just generate it" copy gone
- [x] 6.2 Picker (de): "Loslegen" + "Lektion überspringen — nur die Theorie zeigen" both render; old "Oder: einfach generieren" copy gone
- [x] 6.2b Picker (nl): "Beginnen met bouwen" + "Sla de les over — toon me de theorie" both render
- [x] 6.3 New narrative-present /g/[id] (en, `TRLH8EMUVH`): stamp + moves legend + see-breakdown CTA + breakdown anchor + explainer all present, in correct order; per-move stamp `AD HOMINEM` still present
- [x] 6.4 New narrative-present /de/g/[id] (de, `CETVR8AXHX`): same checks in German; `AUSGANGSWAHRSCHEINLICHKEIT` still present
- [x] 6.5 Older row /g/[id] (de, `VJBYGZJ6LX`, no narrative): all 9 new affordances absent, existing per-move stamps preserved
- [x] 6.6 Compile gates: `tsc --noEmit` clean, `next lint` clean, `next build` succeeds

## 7. Validation + handoff

- [x] 7.1 Run `openspec validate narrative-pedagogical-finish --strict`
- [x] 7.2 Update `openspec/changes/narrative-pedagogical-finish/tasks.md` checkboxes as items complete
- [ ] 7.3 When all tasks complete, archive with `openspec archive narrative-pedagogical-finish`
