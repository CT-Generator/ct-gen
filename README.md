# Conspiracy Generator

An educational tool that builds a fake conspiracy theory in front of you, labeling each of the four moves as it happens, with a debunking column running alongside. **Watch the recipe so you can spot it in the wild.**

Live: [conspiracy-generation.streamlit.app](https://conspiracy-generation.streamlit.app) (v1, redirecting to v2 once cutover ships).

## Repository layout

```
ct-gen-1/
├── web/                  v2 Next.js 15 app (TypeScript, Tailwind, shadcn/ui)
│   ├── app/              App Router pages: /, /g/[id], /healthz
│   ├── components/       Brand components: logo, masthead, footer, recipe glyphs, …
│   ├── lib/              recipe schema, OpenAI client, db, env, short-id
│   ├── Dockerfile        multi-stage build, non-root runtime
│   └── …
├── infra/                v2 deployment (Docker Compose on Hetzner + DuckDNS + Caddy)
│   ├── docker-compose.yml
│   ├── Caddyfile
│   ├── caddy/Dockerfile  Caddy 2 with DuckDNS DNS-01 module
│   ├── db/init.sql       Postgres role + database bootstrap
│   ├── backup/           daily pg_dump → local + offsite
│   ├── secrets/          (gitignored) runtime secrets — see infra/secrets/README.md
│   └── provision.sh      one-shot Hetzner provisioning script
├── migrations/           Sheets → Postgres one-shot importer (Python)
├── legacy-redirect/      tiny Streamlit stub keeping the old streamlit.app URL alive
├── seed/                 real_conspiracies.json (Watergate, COINTELPRO, …)
│
├── ct_gen/               v1 Streamlit code — DEPRECATED, removed at cutover
├── app.py                v1 entry — DEPRECATED
├── requirements.txt      v1 deps — DEPRECATED
│
└── openspec/             active changes
    └── changes/
        ├── remove-image-downloads/    v1 deploy unblock (shipped)
        └── v2-rebuild/                this rebuild
```

## v2 — local dev

```bash
cd web
pnpm install
cp .env.example .env
# edit .env — set OPENAI_API_KEY, DATABASE_URL, SESSION_HASH_SALT
pnpm db:generate    # produce drizzle migration files from schema.ts
docker compose -f ../infra/docker-compose.yml up -d db
pnpm db:migrate
pnpm dev            # http://localhost:3000
```

## v2 — deploy to Hetzner

See `openspec/changes/v2-rebuild/tasks.md` for the full sequence. Short version:

```bash
# Local: provision + harden
infra/provision.sh

# On the box (as `deploy`):
git clone https://github.com/CT-Generator/ct-gen.git && cd ct-gen
# populate infra/secrets/*.txt — see infra/secrets/README.md
cd infra && docker compose up -d --build
# verify https://conspiracy-generator.duckdns.org loads with TLS

# Run the one-shot Sheets→Postgres migration
cd ../migrations
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON=/path/to/legacy-key.json \
DATABASE_URL=postgres://app:...@localhost:5432/cgen \
  python sheets_to_postgres.py
# verify counts; then revoke the legacy GCP key
```

## v1 — still running until cutover

The v1 Streamlit app is still live at `https://conspiracy-generation.streamlit.app`. The `remove-image-downloads` change unblocked its deploy on Apr 27, 2026. The cutover to v2 will replace this URL with a redirect stub from `legacy-redirect/`.

## Authorship

- **Ideas:** [Maarten Boudry](https://research.flw.ugent.be/en/maarten.boudry) (Ghent University) & [Marco Meyer](https://www.philosophie.uni-hamburg.de/philosophisches-seminar/personen/meyer-marco.html) (University of Hamburg)
- **v1 Design & Development:** [Natasha Newbold](https://www.linkedin.com/in/natasha-newbold/) and [Mohammed Darras](https://www.linkedin.com/in/mohammed-darras/) ([TJI](https://techjobsinternational.com/))
- **v1 Image Generation:** [Peter Keroti](https://www.linkedin.com/in/peter-keroti) (TJI), DALL·E
- **Funding:** Etienne Vermeersch Chair of Critical Thinking, Ghent University

References: [recipe explained ↗](https://maartenboudry.substack.com/p/the-conspiracy-generator) · [academic paper ↗](https://drive.google.com/file/d/1GMDVLdKfvaFnj8IFDyiRTGH3ePsOO9B7/views).
