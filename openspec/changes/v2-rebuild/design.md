## Context

The Conspiracy Generator is a research-and-pedagogy artifact. Boudry & Meyer's published recipe (anomalies → connect dots → dismiss counter-evidence → discredit critics) is the conceptual core. The app is the embodied demonstration of that recipe. Today's implementation embodies it weakly: the recipe is *described* in an expander but not *demonstrated* in the output. A reader of the generated text cannot tell which sentence implements which move. That is the largest pedagogical gap, and the rebuild's primary goal is closing it.

The current production state:
- Streamlit 1.25 (~Aug 2023) on Streamlit Community Cloud, Python 3.10, recently broken by an upstream Debian base-image rebase.
- `gpt-4o` via the legacy `openai==0.28.1` SDK.
- Curated DALL-E images keyed by UUID in `images_db.xlsx`, with a `news` / `culprits` / `motives` worksheet structure.
- Google Sheets persistence (2688 generations, 100 ratings) via service-account-keyed gspread.
- One Twitter share button. One JPG download (recently removed for safety + deploy reasons).
- No accounts, no permalinks, no return path to past generations, no analytics beyond the raw Google Sheet.

The desired v2 state preserves the conceptual mission and the historical data, replaces every other layer.

## Goals / Non-Goals

**Goals:**

- Make the four-move recipe visible inline in the generated theory itself.
- Pair every theory with a debunking column rendered alongside (not after, not collapsible by default — equal visual weight).
- Replace standalone shareable artifacts with always-link-back permalinks. Close the disclaimer-cropping vector permanently.
- Migrate the 2688 historical generations + 100 ratings into Postgres with provenance.
- Self-host on Hetzner with Docker Compose + Caddy + Let's Encrypt; survive base-image churn that we don't control.
- Keep the legacy `conspiracy-generation.streamlit.app` URL working as a 301/meta-refresh redirect, so existing links and the tweet history don't rot.
- Ship in phases so each phase is independently demonstrable.

**Non-Goals:**

- Live news ingestion (NewsAPI) — explicitly out of scope at user request. Curated news set is preserved as a seed; custom typed input is the new variability path.
- User accounts with email / password / OAuth. Anonymous deterministic-from-input session IDs are sufficient.
- Mobile-native apps. Web only.
- Translating the experience into other languages. Architecture should not preclude i18n later, but no second locale ships in v2.
- Generating culprit/motive imagery on the fly with a current image model. Considered, deferred — the curated DALL-E set is fine and the time-to-quality trade favors text-only output for v2.
- Public API. The app is the product; no documented JSON API for third parties.
- Real-time collaboration / multiplayer modes.

## Decisions

**Decision 1: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui for the frontend.**
Streamlit's failure mode here is "managed runtime drifts and breaks under us." Next.js + a controlled VPS removes that class of failure. App Router gives us streaming Server Components for the theory rendering, which suits the recipe-tagged structured output well — the four moves can stream into their own slots. Tailwind + shadcn/ui buys a strong default visual language without a heavy custom design system. Alternative considered: SvelteKit (smaller, faster, smaller community) — passed because Next.js's ecosystem maturity for AI/streaming/OpenGraph generation is materially better in 2026. Astro was considered for embeddability and is preserved as a future option for an embeddable widget.

**Decision 2: OpenAI's current flagship as the primary generation model, with strict structured outputs to emit recipe-tagged JSON.**
We'll target OpenAI's current flagship reasoning model (default pin: `gpt-5`, with `gpt-5-mini` as the cost-controlled fallback) and use the `response_format: { type: "json_schema", strict: true }` mode, which guarantees the model returns a JSON object matching our declared schema. The schema is `{anomalies: string, connect_dots: string, dismiss_counter: string, discredit_critics: string, debunk: string}` — all five sections in one call. Streaming arrives chunked; with strict structured outputs the schema is enforced server-side, so each section's content can stream into its UI slot as it completes without parsing risk. Alternative considered: Anthropic Claude with tool use; comparable quality. OpenAI chosen because the user already has an OpenAI account and key (continuity of operations), the strict structured-outputs mode in 2026 is mature and reliable, and a single-provider stack is simpler to operate. OpenAI is also the moderation provider (`omni-moderation-latest`), which keeps the moderation pipeline in the same SDK. The exact model pin SHALL be a date-pinned snapshot (e.g., `gpt-5-2026-XX-XX`) at code-time so production behavior is reproducible; alias updates are decided deliberately.

**Decision 3: Postgres on the same VPS, accessed via Drizzle ORM.**
Self-hosted on the same Hetzner box keeps cost flat (no managed-DB fees) and latency low. Drizzle is preferred over Prisma for: lighter runtime, no migration generator daemon, and clean SQL when needed. Schema is small (3 tables: `generations`, `ratings`, `quiz_items`) — Postgres is overkill but correct overkill (we want indexed timestamp queries, JSONB for the recipe-tagged content, full-text search on theory bodies later). SQLite was considered; rejected because we want backups + restore via standard tooling and Postgres has friendlier tooling for the 2688-row migration.

**Decision 4: Caddy as the reverse proxy with automatic Let's Encrypt + DuckDNS DNS-01 challenge.**
Caddy 2 handles cert acquisition and renewal with no cron or systemd timers. The DuckDNS module handles the DNS-01 challenge so we don't need port 80 open during renewal. nginx + certbot was considered; Caddy wins on operational simplicity for a small deployment.

**Decision 5: Hetzner CAX11 (ARM, ~€4/mo) sized for "small but not dying."**
2 vCPU / 4 GB / 40 GB SSD comfortably runs Next.js, Postgres, and Caddy together for expected traffic. ARM saves €1–2/mo vs. CX22 with no functional cost. If traffic grows past ~50 concurrent users we resize up. Backups: daily `pg_dump` to Hetzner Storage Box (cheap object storage) + offsite copy (e.g., a free-tier S3 bucket or Backblaze B2).

**Decision 6: The legacy `streamlit.app` URL stays alive as a redirect-only Streamlit app.**
Streamlit Cloud cannot serve a server-side 301 from a free app, so the redirect is a minimal Streamlit script that immediately renders an HTML meta-refresh + a `window.location.replace(...)` script + a visible "We've moved — click here if not redirected" link. This keeps existing tweets and bookmarks working. It is a deliberately tiny, dependency-free `app.py` so it cannot break for the same reason the current app did. The custom subdomain (`conspiracy-generation.streamlit.app`) is preserved.

**Decision 7: Anonymous-but-stable identity = a 64-bit hash of `(IP-bucket || UA || day)` salted server-side, with optional opt-in to a "claim" token.**
Lets us deduplicate, rate-limit, and let users return to their past generations on the same device, without ever asking for an email. Users can optionally copy a long random "claim" string (printed once) that ports their history across devices. No PII stored.

**Decision 8: Permalinks use a deterministic short-ID derived from `(news, culprit, motive, model_version, recipe_version)`.**
Same inputs + same model produce the same short-ID. Re-roll of a single move forks to a new short-ID with `?from=<parent-id>` for lineage. This means: links are stable across sessions, two users who pick the same triple can land on the same permalink, the database doesn't bloat with duplicate generations, and lineage of "remixes" is queryable.

**Decision 9: OpenGraph cards display the recipe + the inputs, never the generated theory.**
A screenshot of an OG card on Twitter/Bluesky/Slack should *teach the recipe*, not propagate the fake. The card shows: app brand, the four-step recipe iconography, the user's input triple ("X · Y · Z"), and "Generated at <link>." Theory text is only visible after clicking through. This is the heart of the always-link-back stance.

**Decision 10: Structurally-protected disclaimer banner.**
The "this is fake, generated by an educational tool" disclaimer is rendered as part of the theory layout in a way that cannot be hidden by a CSS hijack on a screenshot tool: the banner is woven into the same DOM container as the theory, with a duplicate footer. Removing it requires editing the rendered DOM — possible but no longer a one-click crop. Combined with no-download-buttons, the misuse cost goes up substantially.

**Decision 11: Custom-input moderation runs OpenAI's moderation endpoint plus a small custom rule-set.**
The moderation endpoint catches obvious slurs / hate speech. The custom rules reject: "named-individual non-public-figure" (detected via heuristic + LLM check: "is this a private individual or a public figure?"), "minor / child / school-aged" mentions in culprit/motive, and "vulnerable group as culprit" patterns. Failed inputs surface a *teaching* rejection: "This input would target a private individual / a vulnerable group, which is exactly the move that turns a satirical recipe into harm. Try a public institution or a power structure instead."

**Decision 12: Phasing — ship in three demonstrable phases.**

```
Phase 1 — Foundation (week 1–2)
  Hetzner box + Caddy + DuckDNS + Postgres + Docker Compose + backups
  Next.js skeleton with the brand
  Sheets → Postgres migration script (one-shot)
  Legacy redirect Streamlit stub

Phase 2 — Core experience (week 3–5)
  Selection flow (curated + custom + moderation)
  Theory generation with recipe-tagged structured output
  Debunking column
  Permalinks + OG cards
  Always-link-back share buttons
  Visual rebrand applied

Phase 3 — Pedagogical extensions (week 6+)
  Re-roll a single move
  Real-or-fake quiz
  Teacher mode (/teach) with lesson plan + classroom session
  Analytics dashboard for the maintainers (private route)
```

Each phase ends with a deployable state. After Phase 2, the new app at the new domain is a complete replacement for the old one and the legacy redirect can be turned on. Phase 3 adds value but isn't required for the legacy URL cutover.

**Decision 13: Quiz "real conspiracy" set is hand-curated, conservative, and uncontroversial.**
The historical real-conspiracies pool is fixed at app build time. v1 set: Watergate, COINTELPRO, Iran-Contra, Tuskegee Syphilis Study, MK-ULTRA. All have unambiguous documentary record and broad consensus. Contested cases (JFK, Epstein, current geopolitical events) are explicitly excluded. The quiz is not a vehicle for ambiguity — it's a vehicle for "real ones exist *and look different from the fakes*."

## Risks / Trade-offs

- **[Risk] Recipe-tagged structured output reduces literary quality.** Asking the model for tagged JSON sections may produce drier, more mechanical prose than the current free-form streaming. → Mitigation: A/B during build; tune the per-section prompts so each move can read fluidly. Allow an optional "blended view" that re-flows the four moves into one paragraph for sharing/permalink display, with the tagged view as the primary.
- **[Risk] Migration loses chronology.** Google Sheets has no per-row timestamp; historical rows can't be ordered. → Mitigation: tag migrated rows `source='migrated'`, `created_at = NULL`. New rows have real timestamps. Acceptable loss.
- **[Risk] Hetzner box outage takes the whole app down (no managed redundancy).** → Mitigation: daily pg_dump offsite; status page; spare-VPS playbook documented; the 5-year time horizon for a research app makes managed-DB cost not worth it.
- **[Risk] DuckDNS subdomain availability/longevity.** DuckDNS is a free volunteer service. → Mitigation: register a real domain (~€10/yr) as a secondary plan; the app is portable to any DNS. A real domain is also probably the right call for branding — flag for user.
- **[Risk] Custom-input moderation has false positives that block legitimate inputs.** → Mitigation: rejection messages are pedagogical (explain why), and there's a "request review" path that opens a mailto. Worst case is a few annoying false positives; that's better than the failure mode of letting through targeted private-individual conspiracies.
- **[Risk] The model emits unsafe content even in the recipe-locked structure.** → Mitigation: post-generation moderation check via `omni-moderation-latest` per section; refusal to render and log+alert if any section flags. Also: a strong system prompt ("you are an educational tool; do not target real private individuals or vulnerable groups") plus the strict JSON schema both narrow the failure surface considerably.
- **[Trade-off] OpenGraph card complexity.** Generating per-permalink OG cards on the fly requires an `@vercel/og` style runtime. → Acceptable; standard pattern in 2026.
- **[Trade-off] Single-VPS deploy = downtime during deploys.** Mitigated by zero-downtime patterns (blue-green via two compose stacks behind Caddy). Adds complexity. Phase 1 ships with simple downtime-on-deploy; blue-green is a Phase 3 polish.
- **[Trade-off] Drifting away from Streamlit means losing the "Python script = app" simplicity.** → Acceptable. The maintenance burden of the modern stack is higher per line of code, but lower over a 5-year horizon because we don't depend on a managed runtime.
- **[Trade-off] The disclaimer can still be cropped by a determined screenshot.** → Acknowledged. The bar isn't "make misuse impossible," it's "make misuse meaningfully harder than the path of least resistance." The OG card teaching the recipe + no-download + structurally-woven disclaimer collectively raise that bar.

## Migration Plan

1. **Phase 1 — Infrastructure stand-up.** Provision Hetzner CAX11. Install Docker + Compose. DuckDNS subdomain claimed. Caddy + Let's Encrypt + Postgres + a minimal Next.js "hello world" up at `https://<sub>.duckdns.org`. Backups configured.
2. **Phase 1 — Data migration.** Run a one-shot Python script (re-using the existing service-account credentials *one last time*) that pulls all `generated_ct` and `ratings` rows and inserts into Postgres with `source='migrated'`. Verify counts (2688, 100). Disconnect the service account from the old code so it's no longer used by the live legacy app.
3. **Phase 1 — Legacy redirect.** Update the Streamlit Cloud app to a 5-line `app.py` that does meta-refresh + JS redirect to the new domain. Confirm `conspiracy-generation.streamlit.app` redirects.
4. **Phase 2 — Core build.** Build selection flow, theory generation with recipe tags, debunking, permalinks, OG cards, share buttons, brand. Internal QA at the new domain.
5. **Phase 2 — Cutover dry-run.** Old Streamlit app keeps running under a different (unadvertised) URL for ~2 weeks as a fallback. Legacy redirect points to the new domain.
6. **Phase 2 — Hard cutover.** Old Streamlit app deleted. New app is the only production surface.
7. **Phase 3 — Extensions.** Re-roll, quiz, teacher mode shipped iteratively.

**Rollback:** Phase 1 is fully reversible (the legacy app is untouched until step 5). Phase 2 cutover is reversible by re-pointing the redirect back to a still-running Streamlit app for ~2 weeks. After step 6 (hard cutover) rollback means re-deploying the legacy app from git history — possible but operationally costly. Don't do step 6 until v2 has run a week without issue.

## Open Questions

1. **Real domain vs DuckDNS subdomain long-term.** DuckDNS is fine for v2 launch but a research artifact backed by two universities probably deserves a real domain (e.g., `conspiracy-generator.org`, `cgen.app`, or similar). ~€10/yr. Recommend buying one early but launching on DuckDNS until DNS propagates. Decision deferred to user.
2. **Brand name and visual direction.** The proposal says "fresh brand" but doesn't pick one. Need a brief design pass — name, logo mark, primary color, type pairing — before Phase 2's brand-application step. Could be a 1-day exercise with a designer or an iterative pass with the user.
3. **Anonymous identity rate-limiting bucket.** IP-based rate-limiting harms shared-IP users (schools, libraries — exactly the audience). Need to pick a rate-limit policy that errs on permissive and uses a captcha (hCaptcha) only on flag-spike. Defer detail to Phase 2 task.
4. **Teacher mode discovery.** Should `/teach` be linked from the main flow, or only shared directly with educators? Suggest: a small footer link "For educators →" plus a one-pager the maintainers can share with academic networks.
5. **Whether to expose the analytics dashboard publicly.** The 2688-row dataset becoming a research artifact is an opportunity. Could publish anonymized aggregate stats (most common motives, most common culprits, recipe-tag distribution) on a `/data` page. Defer; Phase 3 polish.
6. **Acceptable LLM monthly cost ceiling.** With ~2688 generations to date over ~3 years, traffic is modest, but a successful relaunch could change that. Need a cost ceiling and a "graceful degrade" plan (queue, rate-limit, switch to cheaper model) above the ceiling.
