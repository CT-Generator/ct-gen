## Why

Maarten's second round of testing (email of 2026-05-20) surfaced six concrete issues that block sharing the v2 build with his teacher contact and trusted reviewers: YOLO mode fails intermittently with "Application error" / frozen screens, the long YOLO wait shows only a faint dotted indicator, the final narrative often *describes* the discredit-the-critics move instead of *performing* it ("Imagine that critics are paid stooges" rather than "Critics are paid stooges"), the three-paragraph finale lacks a news-event framing that ties the conspiracy back to the actual story, the CT title is sometimes grafted onto the news headline ungrammatically, and Dutch output is uneven. These are all polish-level fixes on top of the v2 rebuild — together they unblock external testing.

## What Changes

**YOLO reliability**
- Investigate and fix the "Application error" client crashes and frozen-screen states observed in YOLO mode (incognito Chrome included). Add a `nl` locale to the client-error-reporting Zod schema (currently `z.enum(["en", "de"])` in `web/lib/client-errors.ts`) so Dutch sessions stop being dropped by the error pipeline.
- Tighten the YOLO request lifecycle in both callers (`web/components/conspirators-picker.tsx`, `web/components/build-wizard.tsx`): cleaner abort/timeout handling, surfaced retry, no UI dead-ends when `/api/build/[id]/yolo` returns 502/422 or aborts at 90s.
- Add server-side resilience: per-section generation already fails the whole batch — keep that, but log enough breadcrumbs to diagnose which step failed (section vs. narrative vs. moderation).

**YOLO loading affordance**
- Replace the bare `SkipDots` (3 animating dots) with a clearer "still working" indicator that signals long-running work (~60s end-to-end). Use a spinner + a short, locale-aware status line (e.g., "Building your theory…"); progress through coarse phases ("Gathering ideas…" → "Writing moves…" → "Stitching the story…") is acceptable but not required.

**Narrative voice (the discredit-step leak)**
- Rewrite the `discredit` move briefings in `MOVE_BRIEFINGS_BY_LOCALE` (`web/lib/openai.ts:96-117`) so the model writes *as* the conspiracist, not *about* the move. Today's wording ("Suggest that anyone disputing the theory is…") nudges the model into hypothetical/conditional voice. The new wording must model the output style itself (assertive: "Critics are X. Their X comes from Y."), with a short positive exemplar in the prompt.
- Same fix in DE and NL (`Lege nahe, dass…` and `Suggereer dat…`). The voice change must hold across all three locales.
- Audit the other three move briefings (`anomaly`, `connection`, `dismiss`) for the same hypothetical-voice leak and tighten as needed.

**Narrative finale: news-event intro + standalone coherence**
- Modify `generateNarrative` (`web/lib/openai.ts:563-703`) so the YOLO output opens with a brief 1-paragraph framing of the actual news event (drawn from the already-generated `event_intro`), then flows into the conspiracy theory. Current shape is "EXACTLY three paragraphs, 80–140 words each" — change to "one short news-framing paragraph (50–80 words) + three conspiracy paragraphs (80–140 words each)".
- Tighten the system prompt to emphasize standalone coherence (the conspiracist's *story*) over per-move accounting. The per-move blocks below the finale already give the recipe breakdown — the finale must not feel like a summary of steps.

**Title grafting**
- Audit the H1 template in `web/app/g/[id]/page.tsx:160-170` and `web/components/build-wizard.tsx:505-517`, which assembles "How {culprit} {orchestrated} {event} {in service of} {motive}" from per-locale fragments. Free-form seed values (culprit/motive) plug into NL/DE templates without case/gender concordance, producing ungrammatical results. Reshape the template (and/or the seed-data display forms) so the H1 reads naturally in all three locales.
- Same check on `generateMetadata` page-title (`${culprit} × ${event}`) and on the conspiracist-intro hook (`web/app/g/[id]/page.tsx:176-196`).

**Dutch polish (pass-2)**
- Run the pass-2 idiomatic rewrite that was flagged TODO at the time of the multilingual-dutch change (see comments at `web/lib/openai.ts:55-56,195`). Focus on the prompt fragments touched by this change (discredit + narrative finale) plus a sweep over the rest of `web/lib/i18n/nl.ts` for awkward literal translations.

**Out of scope**
- Tester recruitment is a separate operational task — not part of this change.
- Generating wholly new culprits/motives via the LLM (deferred from a prior round).
- Visual / typography changes beyond the loading indicator.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `yolo-mode`: stronger loading affordance during the long YOLO wait; cleaner client/server error surface; abort/retry behavior tightened.
- `conspiracy-narrative`: narrative finale gains a leading news-framing paragraph and requires standalone coherence over per-move recounting.
- `theory-generation`: per-move prompts (especially `discredit`) must produce executed-voice prose, not hypothetical/meta voice; constraint added to the move briefings.
- `client-error-reporting`: locale enum extended to include `nl` so Dutch-page client errors are recorded instead of dropped.
- `dutch-content`: pass-2 idiomatic rewrite of the move briefings and narrative system prompt; supersedes the pass-1 placeholders flagged in code comments.
- `internationalization`: H1 / page-title templates must produce grammatical output in all three locales given free-form culprit/event/motive seed values.

## Impact

**Code**
- `web/lib/openai.ts`: discredit + sibling move briefings, narrative-finale system prompt and output shape (intro paragraph added).
- `web/lib/client-errors.ts`: locale enum.
- `web/components/conspirators-picker.tsx`, `web/components/build-wizard.tsx`: loading indicator, abort/retry surface.
- `web/app/g/[id]/page.tsx`, `web/components/build-wizard.tsx` (DoneScreen): H1 template grammar.
- `web/lib/i18n/nl.ts`: pass-2 polish.
- `web/app/api/build/[id]/yolo/route.ts`: diagnostic logging only; no contract changes.

**Persistence / schemas**
- `recipeContent.narrative` shape gains an optional leading framing paragraph (or grows by one in `paragraphs[]`). Reader code in `web/app/g/[id]/page.tsx` must handle both old and new rows. No DB migration required if we keep `paragraphs: string[]`.
- `client_errors.locale` column already stores arbitrary text — the column itself doesn't constrain to en/de; only the Zod input gate does. No DB migration.

**External**
- No API contract changes for callers outside the app.
- Output text will read differently — share this round with Maarten before redirecting the old streamlit domain.
