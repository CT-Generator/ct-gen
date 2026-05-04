## Why

The current app is a 5-page Streamlit flow built years ago. It works, has 2688 generations of real-world usage, and a clear pedagogical mission backed by Boudry (Ghent) and Meyer (Hamburg): teach people how easy it is to construct a conspiracy theory so they don't fall for real ones. But the implementation has aged: Streamlit Cloud's rolling base-image churn keeps breaking the deploy (we just patched one such break), the UI is dated, the four-step "recipe" that *is* the educational payload is buried in an expander instead of being demonstrated in the output, sharing is a single Twitter button, and the data lives in a Google Sheet behind a service-account key. There's no permalink, no "remix this," no debunking pass, and no scaffolding for classroom use.

A from-scratch v2 lets us make the recipe **visible inside the generated theory itself** (the most pedagogically powerful single change available), pair every theory with a debunking pass, build always-link-back sharing instead of standalone artifacts, migrate to a real database, and host on infrastructure we control end-to-end (Hetzner + DuckDNS + Caddy/Let's Encrypt) rather than a managed runtime that breaks under us.

## What Changes

- **BREAKING (operational):** Move the production deploy off Streamlit Community Cloud onto a self-hosted Hetzner VPS reachable at a DuckDNS subdomain over HTTPS (Let's Encrypt via Caddy). Streamlit Cloud retains a tiny redirect-only stub that 301s/meta-refreshes the legacy URL `conspiracy-generation.streamlit.app` to the new domain.
- **BREAKING (stack):** Replace the Streamlit codebase with a Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui frontend that calls a typed API for theory generation. Persistence moves from Google Sheets to Postgres.
- **NEW pedagogical features:**
  - Recipe-tagged output: the model emits structured JSON with the four moves (anomaly hunting, connecting dots, dismissing counter-evidence, discrediting critics) labeled inline; the UI renders each move as a visually distinct, hoverable section so the user *sees* the recipe being applied to their inputs.
  - Debunking column: a second model pass produces the critical-thinking response, presented side-by-side with the conspiracy theory.
  - Re-roll a single move: regenerate just one of the four moves while keeping the others, so the user feels the construction's contingency.
  - Real-or-fake quiz: 5-question game mixing user-generated fakes with uncontroversially-acknowledged historical real conspiracies (Watergate, COINTELPRO, Iran-Contra, Tuskegee, MK-ULTRA).
  - Teacher mode at `/teach`: lesson plan PDF, discussion prompts, and a "classroom session" mode that disables external sharing in favor of in-class discussion.
- **NEW input flexibility:** Users can pick from the curated news/culprit/motive set OR type their own. Custom inputs run through a moderation pass that explicitly rejects naming non-public-figure individuals or targeting members of vulnerable groups, and surfaces the rejection reason as part of the lesson.
- **NEW sharing model — always link back:**
  - Every generation gets an anonymous, deterministic-from-inputs permalink at `/g/<short-id>`, shareable.
  - OpenGraph cards show the four-step recipe + the inputs (not the generated theory text), so a screenshotted card teaches the recipe rather than spreading the fake.
  - Twitter/Bluesky/email/copy-link share buttons all point to the permalink.
  - **No** downloadable image, PDF, or self-contained text artifact of the generated theory. The artifact-disclaimer cropping vector is closed permanently.
- **NEW data platform:** Postgres (self-hosted on the same Hetzner box) replaces Google Sheets. The 2688 historical generations and 100 ratings are migrated as best-effort (timestamps unknown for historical rows; a `source` column distinguishes migrated rows from new ones). New rows capture timestamp, hashed anonymous-session ID, full recipe-tagged JSON, debunking text, ratings, and per-move re-roll history.
- **NEW visual identity:** Fresh brand and design system — name, logo, type, color, dark/light themes — while preserving the academic authorship credits prominently (Boudry, Meyer, Newbold, Darras, Keroti, Vermeersch Chair). The disclaimer banner is structurally non-removable from rendered output.
- **REMOVED:** the Streamlit codebase under `ct_gen/`, the curated DALL-E image set as a hard requirement (the new selection flow can use it as a *seed* set but is not bound to it), the `imgkit`/`wkhtmltopdf` toolchain (already removed), the Google Sheets dependency (read-only during migration window, then disconnected).

## Capabilities

### New Capabilities

- `theory-generation`: Recipe-tagged structured generation, debunking pass, single-move re-roll, model selection, streaming UX, disclaimer guarantees.
- `selection-flow`: Picking inputs from the curated seed set or via free-text with moderation gating; user-visible rejection feedback as part of the lesson.
- `permalinks-and-sharing`: Anonymous-by-default identity, deterministic short-ID permalinks, OpenGraph cards that teach the recipe, share targets that always link back, no downloadable artifacts.
- `quiz-mode`: Real-or-fake quiz mixing app-generated fakes with a curated, uncontroversial historical real-conspiracy set.
- `teacher-mode`: Lesson plan, discussion prompts, classroom session mode that suppresses external sharing.
- `data-platform`: Postgres schema, migration of historical Google Sheets data, retention and export policies.
- `infrastructure`: Hetzner VPS, Docker Compose stack, DuckDNS subdomain, Caddy reverse proxy with auto-renewing Let's Encrypt certs, automated backups.
- `legacy-redirect`: Tiny Streamlit stub that 301s `conspiracy-generation.streamlit.app` to the new domain so existing links survive.
- `attribution-and-brand`: Visual identity, credit blocks, structurally-protected disclaimer banner, accessibility baseline.

### Modified Capabilities

- `conspiracy-output` (from change `remove-image-downloads`): The post-rebuild experience supersedes this capability entirely. The v2 spec replaces the page-5 surface with the new theory-generation flow on Next.js. The "no image/PDF download" requirement carries over and is reinforced.

## Impact

- **Code:** Streamlit codebase under `ct_gen/`, `app.py`, `.streamlit/` will be deprecated. The new app lives in a fresh top-level directory (e.g. `web/` for Next.js) plus `infra/` for the Compose/Caddy stack and `migrations/` for schema + Sheets-to-Postgres migration scripts. The legacy directory is kept until the redirect cutover, then archived in git history (deleted from working tree).
- **Dependencies:** Adds Next.js, TypeScript, Tailwind, shadcn/ui, the official `openai` Node SDK (used for both generation via strict structured outputs and moderation), Drizzle ORM on Postgres. Drops `streamlit`, `gspread`, `oauth2client`, `openai` 0.28.x (Python legacy), all Streamlit-specific extras.
- **Infrastructure:** New Hetzner CX22 (or CAX11 ARM) VPS, ~€4–5/mo. DuckDNS free subdomain. Caddy auto-TLS. Docker Compose with services: `web` (Next.js), `db` (Postgres), `caddy` (reverse proxy), `backup` (daily pg_dump → object storage).
- **Data:** 2688 generated_ct rows + 100 ratings rows migrated; original timestamps lost, marked `source='migrated'`. New rows have full provenance.
- **Costs:** ~€5/mo VPS + LLM token usage (replacing the existing OpenAI cost). DuckDNS free, Let's Encrypt free.
- **User experience:** Substantially upgraded. Same core flow (pick news → culprit → motive → see your theory) but with visible recipe tagging, debunking column, re-roll, custom inputs, permalinks, quiz mode, teacher mode. Mobile-first, accessible, dark/light.
- **Safety posture:** Strengthened. No standalone shareable artifacts; structurally non-removable disclaimer; moderation gating on custom inputs; quiz only uses uncontested historical conspiracies; teacher mode disables external sharing.
- **Risk:** This is a meaningful rewrite. Mitigation: phased delivery (see design.md and tasks.md), legacy app left running until v2 reaches feature parity, dataset migrated read-only first.
