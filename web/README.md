# Conspiracy Generator — v2 web app

Next.js 15 + TypeScript + Tailwind, running the **Explainer** brand variant from the design canvas (Fraunces display, Inter Tight body, JetBrains Mono captions, four oklch recipe-move accents, structurally non-removable disclaimer).

## What works without a database

- `/` — home + selection (real seed data: 68 news, 139 culprits, 123 motives)
- `/about` — credits, references
- `/recipe` — the four moves explained at length
- `/teach` — discussion prompts + classroom-session toggle
- Theme toggle (light/dark)

## What needs Postgres + an OpenAI key

- `/api/generate` — runs gpt-5 with strict structured outputs, persists the result
- `/api/moderate` — moderation pass for custom inputs
- `/api/reroll` — regenerate one move while keeping the others
- `/api/rate` — record a rating
- `/api/og/[id]` — dynamic OpenGraph card image
- `/g/[id]` — permalink (reads the generation by short-id)
- `/quiz` — pulls fakes from the DB (falls back to extra reals if the DB is empty)
- `/healthz` — 200 if Postgres reachable, 503 otherwise

## Local dev — quickstart

```bash
cd web
npm install
cp .env.example .env
# edit .env — at minimum, paste your OpenAI key
```

The `.env` defaults work against a Postgres at `localhost:5432`. Two options:

### Option A — Just the static pages (fastest)

You don't need Postgres for `/`, `/about`, `/recipe`, `/teach`. Run:

```bash
npm run dev
# open http://localhost:3000 — pick from the curated seed, click around the design
```

API routes that need the DB will 500, but the home page selection works.

### Option B — Full stack with Postgres in Docker

Start Docker Desktop, then from the repo root:

```bash
# 1. Start just the db service from the production Compose stack
cd infra
echo 'devpassword' > secrets/postgres_password.txt
echo 'devpassword-app' > secrets/postgres_app_password.txt
echo 'unused-locally' > secrets/duckdns_token.txt
echo "$OPENAI_API_KEY" > secrets/openai_api_key.txt
openssl rand -hex 32 > secrets/session_hash_salt.txt

POSTGRES_APP_PASSWORD=devpassword-app docker compose up -d db

# 2. Run the schema migration
cd ../web
DATABASE_URL='postgres://app:devpassword-app@localhost:5432/cgen' npx drizzle-kit migrate

# 3. Run the dev server
DATABASE_URL='postgres://app:devpassword-app@localhost:5432/cgen' \
SESSION_HASH_SALT="$(cat ../infra/secrets/session_hash_salt.txt)" \
OPENAI_API_KEY="$(cat ../infra/secrets/openai_api_key.txt)" \
npm run dev
# open http://localhost:3000 — full flow including generation works
```

You can also bring up the WHOLE stack including the Next.js app via `docker compose up --build` — but the dev loop is faster with `npm run dev` against a Compose-managed db.

### Option C — Migrate the v1 history into the local db

After Option B's db is up:

```bash
cd ../migrations
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON=/abs/path/to/legacy-key.json \
DATABASE_URL='postgres://app:devpassword-app@localhost:5432/cgen' \
  python sheets_to_postgres.py --dry-run    # confirm
GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON=/abs/path/to/legacy-key.json \
DATABASE_URL='postgres://app:devpassword-app@localhost:5432/cgen' \
  python sheets_to_postgres.py              # real run, ~2688 rows
```

Migrated rows render at `/g/<short-id>` as the legacy_text dump (no recipe tagging).

## Layout

```
web/
├── app/
│   ├── api/
│   │   ├── generate/    POST → strict json_schema gpt-5 → DB → short-id
│   │   ├── moderate/    POST → omni-moderation + rule-check for custom inputs
│   │   ├── og/[id]/     GET → 1200×630 ImageResponse (recipe + inputs, never theory)
│   │   ├── rate/        POST → upsert rating per (gen, session)
│   │   └── reroll/      POST → regenerate one section, persist with parent linkage
│   ├── g/[id]/          permalink — recipe-tagged + debunk side-by-side
│   ├── quiz/            real-or-fake (Watergate, COINTELPRO, ... + DB fakes)
│   ├── teach/           discussion prompts + classroom-session toggle
│   ├── about/           full credits
│   ├── recipe/          the four moves explained at length
│   ├── healthz/         200 if DB reachable
│   ├── page.tsx         home / selection
│   ├── layout.tsx       fonts + no-flash theme + classroom mount
│   └── globals.css
├── components/
│   ├── disclaimer-band.tsx   structurally non-removable
│   ├── masthead.tsx          desktop nav + mobile drawer + theme toggle
│   ├── footer.tsx            credits, every page
│   ├── logo.tsx              ?! interrobang + wordmark + lockup
│   ├── move-glyph.tsx        4 stroke-only SVG glyphs
│   ├── move-chip.tsx         "Move 01 · Hunt anomalies" chip
│   ├── selection-form.tsx    home picker (curated + custom)
│   ├── share-buttons.tsx     copy link / X / Bluesky / email / web share
│   ├── rating-bar.tsx        5-square rating, optimistic write
│   ├── theme-toggle.tsx      light/dark, localStorage
│   ├── classroom-toggle.tsx  per-session flag
│   ├── classroom-mount.tsx   restores flag on every page nav
│   └── quiz-game.tsx         5-question game UI
├── lib/
│   ├── recipe.ts          MOVES + strict json_schema for structured outputs
│   ├── seed.ts            sampleN over the curated set
│   ├── openai.ts          generation + moderation
│   ├── short-id.ts        deterministic 10-char base32 hash
│   ├── session.ts         anonymous server-side hash, HttpOnly cookie
│   ├── db/                Drizzle schema + client
│   ├── env.ts             zod-validated env loader
│   └── utils.ts
├── data/
│   ├── seed.json          330 curated items (cleaned from images_db.xlsx)
│   └── real-conspiracies.json   5 historical reals for /quiz
├── public/seed/
│   ├── news/              68 jpgs by uuid
│   ├── culprits/          139 jpgs
│   └── motives/           123 jpgs
├── drizzle/0000_init.sql  generated migration
├── Dockerfile
└── package.json
```

## Common tasks

```bash
npm run dev            # local dev server
npm run build          # production build (catches RSC + type + lint errors)
npm run typecheck      # tsc --noEmit
npm run db:generate    # regenerate drizzle migration after schema.ts edits
npm run db:migrate     # apply migrations
npm run db:studio      # drizzle studio at http://localhost:4983
```
