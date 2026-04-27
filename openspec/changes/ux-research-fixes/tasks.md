## 1. Tell stamp on /g/[id] (report item #2 — High/S)

- [x] 1.1 Add a `TELL` field to the `MOVES` array in `web/lib/recipe.ts` — short caps phrase per move: `"BASE RATES"`, `"SIX DEGREES"`, `"UNFALSIFIABLE"`, `"AD HOMINEM"`. Keep existing `tell`/`title`/`color` fields intact.
- [x] 1.2 Build a tiny presentational component `web/components/move-tell-stamp.tsx`. Props: `move: Move`. Renders absolute-positioned monospace caps badge (~10px, move accent color, slightly opaque background using move soft tint) anchored bottom-right of its parent. No client interactivity.
- [x] 1.3 In `web/app/g/[id]/page.tsx`, wrap each move's theory `<div>` in `position: relative` and render `<MoveTellStamp move={m} />` inside. Verify on a 320px-wide viewport that the stamp does not overlap the move text or escape the soft-tinted area.
- [x] 1.4 Crop-resistance check: take a horizontal screenshot of any sentence of a move's theory paragraph in dev browser; verify the stamp is visible in the screenshot. Note as part of the manual deploy verification.

## 2. Form-vs-substance caveat on /recipe (report item #1 — High/S)

- [x] 2.1 Author the caveat paragraph (60–90 words). Suggested text: *"Spotting these moves is not the same as winning an argument. Real critics of real institutions sometimes use these moves with substance behind them — a journalist questioning an official cover-up, a researcher rejecting weak counter-evidence. The four-move recipe trains your eye for the **form** of conspiracy reasoning. Whether the **substance** of the claim is also wrong is a separate, slower question. Use the recipe as a noticer, not as a verdict."* Adjust to taste; ~80 words.
- [x] 2.2 Place the paragraph in `web/app/recipe/page.tsx` between the existing lede paragraph ("Conspiracy theories follow four moves…") and the first move section. Mark the paragraph visually (border-left or italic, distinct from body) so the reader notices it's an aside.

## 3. Move 04 prompt — crisper tell (report item #3 — Medium/S)

- [x] 3.1 In `web/lib/openai.ts`, modify the `discredit` branch of `MOVE_BRIEFINGS` (or add a new `EXTRA_RULES` per moveKey) to include: *"End the debunk with a single 4–8 word sentence whose only job is to name the move's tell — for example 'Ad hominem.' or 'Attacking the messenger, not the message.' This sentence must stand alone, not be appended to a longer sentence."*
- [x] 3.2 Keep the other three moves' prompts unchanged.
- [x] 3.3 Spot-check by running one fresh `/api/build/<test-shortid>/discredit/section` POST and confirming the debunk's last sentence is short and tells the tell.

## 4. Opener-variety constraint (report item #6 — Low/S)

- [x] 4.1 Add to the section system prompt: *"Vary the opening clause. Do NOT start consecutive paragraphs with the same imperative-pointer ('Look at...', 'Look closer...', 'Look closely...', 'Notice...'). If prior moves' first three words are listed below, your opening MUST differ from each of them."*
- [x] 4.2 In the section route handler (`web/app/api/build/[id]/[move]/section/route.ts`), when constructing the user message, append a small line listing the first 3-word opener of each prior move's `paragraph`. Format: `Earlier openings (do not repeat): ["Look at that", "Look closer and", "They will shout"]`.
- [x] 4.3 Spot-check by running a fresh full build and confirming consecutive moves don't share an imperative opener.

## 5. Home hero subheading (report item #4 — Medium/XS)

- [x] 5.1 In `web/app/page.tsx` hero section, add a single-sentence `<p>` immediately under the `<h1>`. Text: *"The best way to learn to spot a conspiracy theory is to make one yourself."* Style: italic, ink-soft color, ~17px, max-width matching the H1.

## 6. Paper link on /recipe (report item #8 — Low/XS)

- [x] 6.1 In `web/app/recipe/page.tsx`, change the lede that currently reads "set out at length in [this blog post](substack)." to "set out at length in [this blog post](substack), with the academic version at [this paper](drive)."

## 7. Delete /quiz (report item #9 — Low/XS)

- [x] 7.1 Delete `web/app/quiz/page.tsx`.
- [x] 7.2 Delete `web/components/quiz-game.tsx`.
- [x] 7.3 Delete `web/data/real-conspiracies.json`.
- [x] 7.4 Grep the codebase for stale references to `/quiz`, `QuizGame`, `real-conspiracies`. Remove any links or imports left behind.
- [x] 7.5 Verify build still passes (`npm run build`).

## 8. Verify + ship

- [x] 8.1 `npm run typecheck` clean.
- [x] 8.2 `npm run build` clean.
- [x] 8.3 Pre-deploy local verify: visit `/`, `/recipe`, `/g/<existing-shortid>` in dev. Confirm hero subheading present, caveat paragraph between lede and moves, four tell stamps on existing permalink. `/quiz` returns 404.
- [x] 8.4 Deploy: `SKIP_MIGRATION=1 ./infra/deploy.sh`.
- [x] 8.5 Post-deploy verify on prod: same six checks as 8.3 but against `https://conspiracy-generator.duckdns.org/`.
- [x] 8.6 Run a fresh build through the wizard end-to-end on prod. Confirm: Move 04 debunk ends in a crisp 4–8 word tell sentence; consecutive moves don't both start with "Look at..."; the new tell stamp is visible at the bottom-right of each move's theory paragraph on the assembled page.
- [x] 8.7 Commit + push to main.
