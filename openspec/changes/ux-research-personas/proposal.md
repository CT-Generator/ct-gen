## Why

We've shipped v2 to production but have done zero outside-of-builder testing. The product is unusual — an educational tool that *teaches by deception* — and the user flow has changed substantially from v1 (stepwise wizard, recipe-tagged output, debunk per move). Before any next round of changes, we need an honest read on whether the pedagogical claim actually lands: does walking through the four moves leave the user with a sharper sense of how conspiracy theories work, or just an entertaining gimmick? We also need a prioritized list of UX problems before we polish the wrong thing.

A formal user-test panel is overkill for a small university-backed project at this stage; a structured persona-driven walkthrough by an attentive evaluator is enough to surface most issues. The deliverable is a written report we can use to triage the next round of code changes and to share with collaborators (Boudry, Newbold, etc.).

## What Changes

- **NEW deliverable (not code):** Three target-audience personas drafted in detail — name, role, prior knowledge, motivation, technical fluency, English fluency, what they expect from the page on first load.
- **NEW deliverable:** Each persona walks the full v2 flow on the live site (pick story → pick conspirators → walk the four moves → see assembled theory → optionally rate). The walkthrough is annotated turn-by-turn: what they see, what they think, what confuses them, what surprises them, what feels wrong.
- **NEW deliverable:** Each persona answers the open question "What did you learn?" at the end, in their own voice.
- **NEW deliverable:** A synthesis report with two parts:
  1. **Pedagogical effect.** Did the four-move recipe land? Are users coming away able to name the moves and spot them? Where does the lesson succeed and where does it slide off?
  2. **Prioritized change suggestions.** A ranked list of UX/copy/flow problems found across the three runs, with severity and rough effort estimates, organized so the next implementation pass can attack top-of-list issues first.
- **NEW artifact on disk:** All four documents (three persona walkthroughs + one synthesis report) written into `docs/ux-research/2026-04/`. Markdown so they version-control cleanly and can be shared as plain links.

## Capabilities

### New Capabilities

- `ux-research-deliverables`: Defines what an UX research deliverable for this project must contain — persona shape, walkthrough structure, synthesis report sections, where files live on disk.

### Modified Capabilities

<!-- None — this is a new research workstream, not a change to existing capabilities. -->

## Impact

- **Code:** None. No app changes. No compose changes. No DB schema changes.
- **Files added:** `docs/ux-research/2026-04/persona-1.md`, `persona-2.md`, `persona-3.md`, `report.md`.
- **Process:** The walkthroughs will run against the live production site at `https://conspiracy-generator.duckdns.org/`. Each persona makes a small number of real `/api/start` and `/api/build/.../section` calls — token cost ~$0.10–$0.20 total across all three personas (gpt-5-mini × ~12 generations).
- **Future code changes:** The report's prioritized list will seed the next OpenSpec change. Don't pre-commit to fixes; the report is itself the input.
- **Audience for the report:** the maintainers (Marco + Maarten) and any collaborators they want to share the findings with. Not a public document.
