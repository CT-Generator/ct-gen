## Context

The v2 site has been live for a few hours. It's been driven only by the builders. We don't yet know whether the pedagogical effect we *designed for* is actually what a target-audience reader experiences. The flow contains several intentional design choices that could land or backfire:

- The wizard makes the four-move recipe the structural skeleton of the experience. Does that structure feel illuminating or schoolmarm-ish?
- The "official story" page is plain-language news; the move screens immediately switch to satirical-conspiracist voice. Does that tonal shift register as the joke we intend, or as the model going off the rails?
- The debunk paragraph runs alongside every move. Does the reader actually read it, or skip it?
- Three pre-generated idea buttons per move replace open-ended text input. Does this feel like helpful scaffolding or like train tracks?
- /g/[id] (the shareable result) opens with a conspiracist-voice hook ("Reuters reports… But is that the whole truth?"). Does this read as satire-with-a-source or as plausible misinformation?

The persona-driven walkthrough is a lightweight method for surfacing these questions before we ship more code. Three personas is the minimum to triangulate without redundancy: one for each concentric-circle audience the brand brief identifies (curious general public, educator, researcher).

## Goals / Non-Goals

**Goals:**
- Three personas with enough detail to be felt, not just listed. Each has a real reason to be on the page and a real cognitive frame for what's there.
- Three full walkthroughs. Each persona starts at `/`, picks a real curated story (so the call hits OpenAI for real), advances through every screen, finishes the build, opens `/g/[id]`, optionally hits `/about` and `/recipe`. Every screen produces a turn-by-turn note: what's on the screen + what the persona thinks about it.
- Each persona answers a final open-form prompt: "In your own words, what did this teach you, if anything?"
- A synthesis report that names the pedagogical effect honestly (including where it fails) and lists prioritized UX/copy/flow fixes for the next round.

**Non-Goals:**
- Quantitative metrics. No numerical "ratings" from personas; this is qualitative.
- Real human user testing. The personas are AI-driven simulations; useful for triage but not a substitute for actual users.
- Implementing the suggested fixes. That's a separate, follow-up OpenSpec change driven by the report's prioritized list.
- A polished public document. The report is for the maintainers and immediate collaborators.
- Branding the report or wrapping it in a website artifact. Plain markdown.

## Decisions

**Decision 1: Three personas drawn from the brand brief's concentric-circle audience.**
The brand brief identifies three target groups in priority order. Use exactly those, mapped to plausible individuals:
- *Curious general-public news reader* (priority 1)
- *Educator running a critical-thinking module* (priority 2)
- *Researcher / writer working on disinformation* (priority 3)

Three is the minimum that lets us see the same UX issue from three angles AND covers each tier of the intended audience. Going deeper (5+) would be overkill for a triage exercise.

**Decision 2: Personas are AI-driven, not real-user, but constructed in detail.**
Each persona gets at minimum: name, age, role, location, prior exposure to the recipe topic, English fluency, motivation for visiting today, what they expect to find. Detail is the difference between the persona feeling like a stand-in versus feeling like a checklist; the report is only as honest as the personas are specific. Persona writing follows the convention of *Don Norman's persona briefs*: a paragraph that reads like a profile, not a bulleted list.

**Decision 3: Each persona drives a real backend interaction.**
Walkthroughs hit the live `https://conspiracy-generator.duckdns.org/` — not mocks. This means real `/api/start` and `/api/build/.../section` POSTs against the production OpenAI key. Cost ~$0.05–$0.10 per persona (one start + four sections at gpt-5-mini). This catches issues that mocks would miss: real model output quality, real latency feel, real edge cases.

**Decision 4: Walkthroughs are annotated as a chronological transcript.**
Each persona walkthrough is structured as:
1. *Arriving at /* — first impression, what they click first, what they ignore.
2. *Picking the story* — which one they pick and why, what's confusing.
3. *Picking conspirators* — same.
4. *Each of the four moves* — the explainer paragraph, the three idea buttons (which one they click and why), the generated paragraph (what they notice in it), the debunk (do they read it? does it land?).
5. *Done screen + /g/[id]* — does the assembled theory feel like a coherent thing? Would they share it? With whom?
6. *Optional follow-ups* — if they click /about or /recipe.
7. *The closing question* — "What did you learn?" answered in the persona's voice, 80–150 words.

This format produces ~600–900 words per persona — enough density that the synthesis report can pull real verbatim quotes.

**Decision 5: Synthesis report has two parts: pedagogical effect + prioritized changes.**
The pedagogical-effect section is essay-form (300–500 words) and answers: did the recipe land? Did the debunk land? What does each persona walk away with?

The prioritized-changes section is a ranked table:

| # | Issue | Where | Severity | Effort | Notes |

Severity is `high / medium / low`. Effort is rough t-shirt sizing (`S / M / L`). Notes link back to which persona's walkthrough surfaced the issue.

**Decision 6: Output location is `docs/ux-research/2026-04/`.**
Date-stamped subdirectory so future rounds of UX testing have their own folder. `docs/` is a new top-level directory for non-code, non-spec writing artifacts; this is its first inhabitant. Plain markdown, no front matter, no JSON.

**Decision 7: The walkthroughs do not modify production data.**
Personas pick existing curated content, hit `/api/start` (which creates a row keyed deterministically by triple — re-runs are no-ops), hit `/api/build/.../section` (which inserts per-move content). Each persona walkthrough leaves three new generations + per-move sections in the production DB. The `/api/rate` endpoint is NOT called by the personas (rating is incidental to the lesson, not central, and we don't want to skew /stats).

## Risks / Trade-offs

- **[Risk] Personas-as-AI may homogenize.** Even with detailed briefs, three persona simulations from the same model can converge on the same observations and miss real users' diversity. → Mitigation: explicit cognitive-frame divergence in each persona (what they care about, what they ignore), and persona reactions framed as *what this person says*, not *what is objectively true*. The synthesis report will note observations where all three agree (likely strong signal) versus observations from only one persona (note as such, treat as weaker signal).
- **[Risk] Production data pollution.** Three personas × ~5 generations = 15 new rows in `generations`, plus ~12 sections in `per_move`. This is small relative to the 2,681 migrated rows but it's still real production data. → Mitigation: the rows are real generations on real curated triples — they look like organic test traffic, not synthetic noise. Don't tag them specially.
- **[Risk] Token cost surprise.** ~12 generations × ~$0.005 = ~$0.06. Negligible but flagging for transparency.
- **[Trade-off] AI-driven walkthrough vs. real users.** The whole exercise is one large "best-effort triage" rather than ground truth. Use the output to seed the next iteration — not as final evidence on whether the design works.
- **[Trade-off] Plain markdown vs. nicer rendered report.** The maintainers can read markdown. Time spent on PDF/HTML rendering is time not spent on the next code iteration.
- **[Trade-off] Three personas vs. five.** Stops short of real saturation. If the report's pedagogical-effect section feels thin, the follow-up is to add two more personas, not to commit to fixes prematurely.

## Migration Plan

Not applicable — no code changes, no data migration. The report lands as new files under `docs/ux-research/2026-04/` and is committed to the same repo.

## Open Questions

- Should we run a pass with deliberately-difficult inputs (a curated story the persona finds politically charged)? Current plan: each persona picks naturally; if no political-edge case surfaces, the report flags that as a coverage gap.
- Should the maintainers re-run the same exercise against v1 archive at `conspiracy-generation.streamlit.app`? Out of scope here — the v1 site is dead anyway.
- Should the personas log in with the optional "claim" identity flow? It hasn't been built. They'll be anonymous, like every real user is.
