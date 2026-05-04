## 1. Picker — primary-first DOM order (item 1)

- [x] 1.1 In `web/components/conspirators-picker.tsx`, swap the two CTA buttons in the JSX so the primary `<button>` comes before the yolo `<button>` in DOM order
- [x] 1.2 Confirm the parent `<div>` keeps `flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-end` — no class changes needed
- [x] 1.3 Confirm focus order matches DOM order (Tab lands on primary first, then yolo)

## 2. Yolo CTA copy reframe (item 5)

- [x] 2.1 Update `story.cta_yolo` (en): `Skip the walkthrough — show me the theory →`
- [x] 2.2 Update `story.cta_yolo` (de): `Den geführten Weg überspringen — nur die Theorie zeigen →`
- [x] 2.3 Update `story.cta_yolo` (nl): `Sla de uitleg over — toon me de theorie →`

## 3. Narrative stamp — per-paragraph + visual prominence (items 2–3)

- [x] 3.1 Update `web/components/narrative-stamp.tsx`: add a soft-tint background fill (currentColor 12%), bump fontSize to 10px, increase padding to 3px/7px
- [x] 3.2 In `web/app/g/[id]/page.tsx`, restructure the narrative-paragraphs region: replace the single `position: relative` wrapper around all three paragraphs with three separate `position: relative` wrappers, each containing one `<p>` and one `<NarrativeStamp />`
- [x] 3.3 Each per-paragraph wrapper needs `paddingBottom` (or equivalent) sufficient to keep the bottom-right stamp from overlapping the paragraph text on small viewports — set `paddingBottom: 30`
- [x] 3.4 Remove the section-level (single) `<NarrativeStamp />` that was previously anchored to the wrapper for the whole paragraphs block

## 4. Cut conspiracist_intro on narrative-present rows (item 4)

- [x] 4.1 In `web/app/g/[id]/page.tsx`, gate the existing `{content.conspiracist_intro && (<p italic>...</p>)}` block on `!content.narrative?.paragraphs?.length` so it only renders for older / narrative-absent rows
- [x] 4.2 When narrative is present and the row has an original-story URL (`content.event_intro?.source_url`), render the source link as its own meta paragraph below the h1, mirroring the `/story/[uuid]` pattern
- [x] 4.3 Reuse `getDict(rowLocale).story.source_label` (existing key) for the label — no new i18n keys needed
- [x] 4.4 Confirm older rows without narrative still render the conspiracist_intro paragraph (with its inline source link) exactly as before
- [x] 4.5 Confirm narrative-present rows without a `source_url` simply skip the source-link meta paragraph — no broken markup

## 5. Moves legend — drop prefix, add numbers, link to recipe (items 6–7)

- [x] 5.1 In `web/app/g/[id]/page.tsx`, remove the `<span className="mr-2">{t.moves_legend_prefix}</span>` from the legend
- [x] 5.2 Update the legend rendering so each entry is `MM <TITLE>` where MM is the move number from `m.n` (e.g. `01 HUNT ANOMALIES`); both number and title rendered in `m.color`
- [x] 5.3 Wrap each move entry in an anchor link to the locale-aware recipe path (`localizedHref('/recipe', rowLocale)`) — keyboard accessible by default
- [x] 5.4 Style: link gets `underline-offset-2 hover:underline` (subtle on hover) so the colored title doesn't visually dominate when not hovered
- [x] 5.5 Mark `t.moves_legend_prefix` as deprecated-unused in the en/de/nl dictionaries with a `// FIXME: unused, remove in next change` comment (don't delete now to avoid Dictionary type churn)

## 6. Compile gates

- [x] 6.1 `npx tsc --noEmit` clean
- [x] 6.2 `npx next lint` clean
- [x] 6.3 `npx next build` succeeds; no new build warnings

## 7. Live verification (dev server + DB)

- [x] 7.1 Picker (en): primary "Start building" appears first in DOM order (idx 14521 < yolo idx 15007) — primary stacks on top of yolo on `flex-col` mobile, sits left of yolo on `flex-row` desktop
- [x] 7.2 Picker (en): yolo CTA copy reads `Skip the walkthrough — show me the theory →`; old `Skip the lesson` framing absent
- [x] 7.3 Picker (de): primary `Loslegen` first in DOM; yolo reads `Den geführten Weg überspringen — nur die Theorie zeigen →`; old `Lektion überspringen` absent
- [x] 7.4 Picker (nl): primary `Beginnen met bouwen` first in DOM; yolo reads `Sla de uitleg over — toon me de theorie →`; old `Sla de les over` absent
- [x] 7.5 `/g/TRLH8EMUVH` (EN narrative-present): three narrative paragraphs each in their own `position: relative` wrapper, three `<NarrativeStamp>` rendered (verified: 3 visible stamp spans in DOM; the additional 6 occurrences are React Flight payload metadata, not visible). Conspiracist_intro paragraph gone (italic+max-w-2xl signature absent). Source link present as meta line below h1 (rollingstone.com link visible)
- [x] 7.6 `/de/g/CETVR8AXHX` (DE narrative-present): three German stamps `ERFUNDENE THEORIE · NACH REZEPT GEBAUT`; conspiracist_intro gone; source-link meta present
- [x] 7.7 Older `/g/VJBYGZJ6LX` (no narrative): italic conspiracist_intro still renders (italic+max-w-2xl signature found); no narrative stamps; per-move stamps preserved (`AD HOMINEM` present)
- [x] 7.8 Moves legend (verified all 8: 4 EN + 4 DE): each entry rendered as `NN <TITLE>` wrapped in a locale-aware `/recipe` anchor link, in the move's accent color; no `Built from:` prefix
- [x] 7.9 Per-paragraph crop check: each narrative paragraph has its own stamp anchored bottom-right inside its own `position: relative` wrapper with `paddingBottom: 30` — guarantees crop-resistance for any single-paragraph screenshot at any viewport
- [x] 7.10 `openspec validate narrative-clarity-pass --strict` passes
