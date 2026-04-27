# `migrations/` — one-shot legacy data import

This directory contains scripts that run **once** during the v2 cutover. They are not part of the running application.

## `sheets_to_postgres.py`

Pulls all rows from the legacy `generated_ct` and `ratings` Google Sheets and inserts them into v2 Postgres with `source='migrated'`. Idempotent (uses `ON CONFLICT DO NOTHING` keyed on `short_id`).

### Run it

```bash
# 1. Install deps in a fresh venv
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2. Export the legacy credentials. Use the SAME service-account JSON the live
#    Streamlit app has been using. After the migration succeeds, REVOKE this key.
export GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON=/abs/path/to/cgen-legacy-key.json

# 3. Point at the v2 database. Either tunnel through SSH to the Hetzner box or
#    run this directly on the box. Talking to Postgres over a local Compose
#    network is simplest (DATABASE_URL points at db:5432 from inside the network).
export DATABASE_URL='postgres://app:APP_PASSWORD@localhost:5432/cgen'

# 4. Dry-run first to confirm what would happen.
python sheets_to_postgres.py --dry-run

# 5. Real run.
python sheets_to_postgres.py

# 6. Verify counts (expected: ~2688 generations, ~100 ratings).
psql "$DATABASE_URL" -c "select source, count(*) from generations group by source;"
psql "$DATABASE_URL" -c "select count(*) from ratings;"
```

### After the migration

1. Take a `pg_dump` snapshot of the post-migration database — call it the `v2-baseline` backup. Copy it to both backup destinations.
2. **Revoke the legacy GCP service-account key.** The credential exists for one purpose (this migration) and one moment in time. After this, no live code should hold it.
3. Mark task 1E.5 in `openspec/changes/v2-rebuild/tasks.md` as complete.
