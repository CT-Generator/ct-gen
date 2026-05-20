## Context

The v2 rebuild shipped two weeks ago. Maarten tested it and reported six concrete polish items (see proposal.md). The fixes span the LLM prompt layer (`web/lib/openai.ts`), the YOLO endpoint (`web/app/api/build/[id]/yolo/route.ts`), two client components (`conspirators-picker.tsx`, `build-wizard.tsx`), the read-only generation page (`web/app/g/[id]/page.tsx`), and the client-error pipeline (`web/lib/client-errors.ts`).

Each item is self-contained but they share two cross-cutting decisions: (1) how the narrative finale is shaped and which output schema it persists to, and (2) how loading/error UX is signalled during the ~60-second YOLO wait. Those two need to be settled before tasks fan out.

Current YOLO timing baseline (from a comment at `conspirators-picker.tsx:113`): `/api/start` ≈ 20s, then `/api/build/[id]/yolo` ≈ 40s, client abort at 90s. The route is `maxDuration = 90`. When OpenAI is slow or one of the four parallel `generateSection` calls errors, the whole batch fails with a 502 "The theory engine glitched mid-build — try again." This is the most likely source of the "Application error" Maarten saw.

## Goals / Non-Goals

**Goals**
- Make YOLO succeed reliably enough that Maarten can hand the link to a high-school teacher without caveats.
- Make the final YOLO story read as a coherent standalone narrative that opens with the actual news event, then unfolds the conspiracy.
- Make the discredit step (and any other affected move) commit to the conspiracist voice instead of describing/conditionalizing the move.
- Make the H1 / page title read grammatically in EN, DE, NL.
- Make the loading state during the long YOLO wait obviously a loading state, not a frozen screen.
- Lift Dutch output to "shareable with the Vlaams teacher" quality.

**Non-Goals**
- A wholesale narrative-engine rewrite. The four-move scaffold and the existing per-move pages stay.
- A complete redesign of the loading screen — we want a clearly-working spinner with a status line, not a multi-stage progress bar.
- Generating new culprits/motives via the LLM (deferred from prior round, mentioned in the email but explicitly out of scope here).
- Tester recruitment — operational, not engineering.
- Touching legacy v1 rows or the migration shape.

## Decisions

### D1 — Narrative finale gains a news-framing opening paragraph

**Choice:** Change `generateNarrative` to produce **one news-framing paragraph + three conspiracy paragraphs**. Persist as `narrative.paragraphs: string[]` with length 4 (was 3). Reader (`web/app/g/[id]/page.tsx`) handles both 3- and 4-paragraph rows so older rows keep rendering.

The opening paragraph is written in neutral journalistic register, references the real event, and ends on a hook into the conspiracy reframing (e.g., "…or so the official story goes."). The next three paragraphs are the conspiracist voice as today, integrating the four moves.

**Why over the alternatives:**
- **Alt A (add a separate `narrative.intro` field):** Forces a schema change in the persisted JSON shape *and* a separate render block. Rejected — `paragraphs[]` is already an array; just grow it.
- **Alt B (reuse the existing `event_intro` field above the narrative):** That field already renders elsewhere (notably the conspiracist-intro hook at `g/[id]/page.tsx:176-196`) and uses the LLM's plain-language explainer voice. Maarten wants the news framing to *feel like the opening of the conspiracy theory*, not a meta explainer above it. A purpose-written first paragraph from inside `generateNarrative` keeps voice continuity.
- **Alt C (have GPT emit JSON `{ news_intro, conspiracy }`):** More moving parts, more failure modes; the strict JSON schema is more brittle when we grow it. Sticking with `paragraphs: string[]` and a stricter system prompt keeps the surface small.

The system prompt makes the structure explicit: "Output exactly 4 paragraphs. Paragraph 1: a brief news-event framing (50–80 words). Paragraphs 2–4: the conspiracy theory (80–140 words each)." The Zod/JSON schema's length check is updated accordingly.

### D2 — Discredit voice: rewrite the briefing to model the output, not the strategy

**Choice:** Replace the current `discredit` briefing with one that (a) commits to the conspiracist's voice in the imperative ("write *as* the believer"), (b) bans hedging verbs ("imagine", "suppose", "allegedly", "supposedly", "would be", "could be"), and (c) includes a 1-line positive exemplar of the target voice ("Critics are paid stooges, plain and simple.").

**Why over the alternatives:**
- **Alt A (post-process the LLM output to strip hedging words):** Brittle; misses syntactic restatements. We want the model to produce the right voice the first time.
- **Alt B (constrain in `VOICE_GUIDELINES_BY_LOCALE` globally):** The voice leak is move-specific (discredit is the locus). Audit the other three briefings as a sweep, but the *binding* constraint belongs in the per-move briefing.
- **Alt C (separate "conspiracist exemplar" prompt block):** Wrap-up of the same idea but more verbose. Inline exemplar in the briefing is tighter.

Apply the same shape (briefing + ban-list + exemplar) in EN, DE, NL. The `EXTRA_DEBUNK_CLOSING_RULES_BY_LOCALE` for discredit (the "Ad hominem." closer) is unrelated and stays as-is.

### D3 — H1 / page-title templating across locales

**Choice:** Replace the in-flow fragment template ("How {culprit} {orchestrated} {event} {in service of} {motive}") with a per-locale title rendering function that handles case/article concordance for the seed values. For EN keep the existing fragments. For DE and NL, restructure the title into a form that is grammatically robust regardless of the seed (e.g., a two-line construction: line 1 = culprit/motive frame, line 2 = event quote — see open-question O1 below).

**Why over the alternatives:**
- **Alt A (declension/article tables for each seed in DE/NL):** Heavy, requires per-seed metadata on every culprit/motive/event. Rejected.
- **Alt B (let the LLM author the H1 in the row's locale):** Adds an LLM call to a render path that shouldn't depend on the model. Rejected.
- **Alt C (rewrite the H1 into a colon construction):** "Wie {culprit} {event} inszenierte: für {motive}." reduces concordance points. Open question whether this reads natural enough — see O1.

The page metadata title (`${culprit} × ${event}`) stays as-is — the multiplication-sign form is locale-neutral and is what's used for OG/Twitter cards.

### D4 — Loading affordance during YOLO

**Choice:** Replace `SkipDots` with a `<YoloProgress>` component (spinner + a short status line localized via `getDict(locale)`). The spinner is a CSS keyframe animation (no extra dependency); the status line shows a single message like "Building your theory…" / "Wir bauen deine Theorie…" / "We bouwen je theorie…". No multi-phase progress (deferred — would require server-streamed status, which is out of scope here).

The component renders inline in both call sites (`conspirators-picker.tsx` and `build-wizard.tsx`) so the visitor sees the system working without a page change. Replace the existing `SkipDots` import in `build-wizard.tsx:537-549` and the equivalent pending block in `conspirators-picker.tsx`.

**Why over the alternatives:**
- **Alt A (route to a dedicated `/build/<id>/loading` page):** Page changes during loading feel worse than inline pending. Rejected.
- **Alt B (multi-phase server-streamed status):** Significant scope — needs SSE/stream from the YOLO route. Save for a later round if user feedback says the inline spinner still feels too quiet.

### D5 — YOLO reliability: client-side surface + diagnostic logging

**Choice:** Three changes:
1. **Schema fix:** add `"nl"` to `clientErrorBodySchema.locale` enum (`web/lib/client-errors.ts:22`). Today Dutch sessions silently fail the validator and we get no error data from the locale most likely to be flaky.
2. **Surfaced retry on the picker / wizard:** when the YOLO POST returns a non-OK status or aborts, render a retry button next to the error message (today the wizard sets `skipError` but the visitor has no in-place retry). Reuse the same `startYolo` / `handleSkipToResult` function on click.
3. **Server breadcrumbs:** add structured `console.error` lines in `web/app/api/build/[id]/yolo/route.ts` distinguishing (a) section-generation failure, (b) moderation flag, (c) narrative-generation failure. Today there's a single "section generation failed" log; add narrative + moderation parity so we can tell which step failed when a user reports "Application error".

**Why over the alternatives:**
- **Alt A (auto-retry on the client when YOLO fails):** Auto-retry doubles the failure cost (cost + latency) when the failure is deterministic (moderation flag, schema mismatch). Surface the error and let the visitor retry.
- **Alt B (raise `maxDuration` to 120 / 180):** Treating the symptom, not the cause. 90s already covers the documented baseline. If we still see frequent aborts after this change, revisit.

We are *not* adding a Sentry/Datadog integration in this change — the existing `recordClientError` table is the source of truth and we should fix its NL gap first.

### D6 — Dutch pass-2 polish scope

**Choice:** Limit pass-2 polish in this change to (a) the move briefings touched by D2, (b) the narrative-finale system prompt touched by D1, and (c) `web/lib/i18n/nl.ts` UI strings on the YOLO flow + read-only page (`g/[id]`). Defer prompt-rewrites for the wider stepwise wizard to a follow-up round.

**Why:** Maarten said Dutch is "a bit flaky sometimes" without naming specific spots. Touching everything Dutch invites scope creep; the items we *know* he saw (final story discredit + final story coherence + title grafting) are inside D1+D2+D3. The UI sweep on `nl.ts` catches the loading-indicator copy added by D4.

## Risks / Trade-offs

- **[Narrative 4-paragraph shape breaks older readers]** → Reader in `g/[id]/page.tsx` already maps `paragraphs[]` directly to render blocks; no length-checking on the read path. Server schema-enforces the new length on writes only. Verify by reading an existing 3-paragraph row after the change.
- **[Banning hedging words leaks back into the *good* uses]** → "Allegedly" is sometimes part of the conspiracist's own register ("allegedly funded by the cabal"). Risk: the ban-list also removes legitimate uses. Mitigation: the ban-list is move-scoped (just discredit), and the exemplar shows the target voice without those words. If we see false-positives elsewhere we narrow the ban-list to specific verbs ("imagine", "suppose").
- **[H1 restructure changes the visual feel of the read-only page]** → The current "How X orchestrated Y…" frame is core to the brand. Mitigation: keep EN exactly as today; only DE/NL get the restructure. Open question O1 covers whether DE/NL get a different shape or the same with locale-specific fragment fixes.
- **[Spinner without phased status still feels too slow]** → Could leave Maarten asking for more progress detail. Mitigation: the new component has a single status line, which we can swap to a 2- or 3-stage rotation in a follow-up without changing call sites. Keep the API simple now.
- **[Adding `nl` to client-errors enum is technically a contract change]** → Mitigation: the DB column is unconstrained text; only the input Zod gate changes. No migration needed. Existing analytics queries should already group by `locale` and will simply see a new value.
- **[server breadcrumbs leak content into logs]** → The current `console.error` includes a JSON-serialized error. Keep logs to step + status code + error class — never log paragraph text.

## Migration Plan

No database migrations. Persisted shape changes are additive (a 4th paragraph in `narrative.paragraphs`).

Rollout:
1. Land prompt changes (D1, D2, D6) behind no flag — they're prompt-string edits. Existing rows render unchanged because the read path doesn't inspect length.
2. Land schema fix (D5.1) immediately — pure additive enum value.
3. Land UI changes (D3, D4, D5.2) together — they all touch the same components and benefit from one round of in-browser smoke testing across EN/DE/NL.
4. Land server breadcrumbs (D5.3).
5. Smoke-test the YOLO flow in each locale (full + skip-from-wizard variants) on the running dev server before sharing with Maarten.

**Rollback:** Each step is independently revertable via `git revert`. Prompt edits revert without affecting persisted rows. UI changes revert without affecting persisted rows. The enum addition reverts without affecting already-stored NL error rows.

## Open Questions

- **O1**: For the H1, do we restructure DE/NL into a different sentence shape (colon construction, two-line) or invest in per-seed declension metadata? Recommend the restructure unless Maarten objects after seeing an example. Decide with one EN/DE/NL mockup before coding D3.
- **O2**: Do we add the news-framing paragraph for the *stepwise* wizard finale too, or only the YOLO finale? `generateNarrative` is called from both. Likely yes for both — same `generateNarrative` function — but confirm in tasks.md whether the stepwise read-only page should also show the new paragraph.
- **O3**: The Dutch `discredit` briefing currently uses "Suggereer dat iedereen…" — what's the locally-natural assertive register? Need Maarten or a Dutch-native reviewer on the new wording. Send him the candidate text before merging.
- **O4**: For YOLO reliability — should we add a server-side retry on a single failed `generateSection` (1 retry, no backoff) before failing the batch? Cheap, common pattern, but adds latency on a slow path. Defer to first iteration of breadcrumb data before committing.
