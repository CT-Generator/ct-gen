#!/usr/bin/env bash
# infra/deploy.sh — deploy Conspiracy Generator v2 to the Hetzner box.
#
# Idempotent: re-running upgrades the stack in place. Secrets that already
# exist on the box are preserved.
#
# Usage:
#   ./infra/deploy.sh                          # full deploy
#   HOST=other-ssh-host ./infra/deploy.sh      # different ssh target
#   SKIP_MIGRATION=1 ./infra/deploy.sh         # skip the v1 → v2 sheets import
#
# Pre-requisites on the box:
#   - SSH access as root (or sudo-able user) via the named host
#   - Docker + Compose plugin already installed
#
# Pre-requisites locally:
#   - web/.env.local contains OPENAI_API_KEY (we forward it to the box)
#   - For migration: GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON env var pointing at a
#     local service-account JSON file, OR set SKIP_MIGRATION=1.

set -euo pipefail

# --- config ------------------------------------------------------------------
HOST="${HOST:-conspiracy_generator}"
REMOTE_PATH="${REMOTE_PATH:-/opt/cgen}"
DOMAIN="${DOMAIN:-conspiracy-generator.duckdns.org}"
SKIP_MIGRATION="${SKIP_MIGRATION:-0}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

log() { printf '\033[1;36m[deploy]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[deploy]\033[0m %s\n' "$*" >&2; exit 1; }

# --- 1. SSH check ------------------------------------------------------------
log "ssh check → $HOST"
ssh -o BatchMode=yes -o ConnectTimeout=8 "$HOST" 'true' \
  || fail "cannot ssh to $HOST"

# --- 2. rsync code -----------------------------------------------------------
log "rsync repo → $HOST:$REMOTE_PATH"
ssh "$HOST" "mkdir -p $REMOTE_PATH"

rsync -az --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude '.venv*/' \
  --exclude '__pycache__/' \
  --exclude '.DS_Store' \
  --exclude 'web/.env*' \
  --exclude 'infra/secrets/*' --include 'infra/secrets/.gitkeep' --include 'infra/secrets/README.md' \
  --exclude 'infra/.env*' \
  --exclude 'infra/docker-compose.override.yml' \
  --exclude 'infra/caddy_data/' --exclude 'infra/caddy_config/' --exclude 'infra/backups/' \
  ./ "$HOST:$REMOTE_PATH/"

# --- 3. ensure secrets exist on box ------------------------------------------
log "ensuring secrets/ on box (generates fresh ones if missing)"
ssh "$HOST" "bash -s" <<'REMOTE_SECRETS'
set -euo pipefail
cd /opt/cgen/infra/secrets
gen() {
  local f="$1" cmd="$2"
  if [[ ! -s "$f" ]]; then
    eval "$cmd" > "$f"
    chmod 600 "$f"
    echo "  + generated $f"
  else
    echo "  · kept existing $f"
  fi
}
gen postgres_password.txt     "openssl rand -base64 32 | tr -d '\\n=' | head -c 32"
gen postgres_app_password.txt "openssl rand -base64 32 | tr -d '\\n=' | head -c 32"
gen session_hash_salt.txt     "openssl rand -hex 32"
gen stats_password.txt        "openssl rand -base64 24 | tr -d '/+=' | head -c 24"
ls -la
REMOTE_SECRETS

# --- 4. push the OpenAI key from local .env.local ---------------------------
log "syncing OPENAI_API_KEY from local web/.env.local"
LOCAL_KEY="$(grep '^OPENAI_API_KEY=' web/.env.local | head -1 | cut -d= -f2-)"
if [[ -z "$LOCAL_KEY" ]]; then
  fail "OPENAI_API_KEY not found in web/.env.local"
fi
ssh "$HOST" "cat > $REMOTE_PATH/infra/secrets/openai_api_key.txt && chmod 644 $REMOTE_PATH/infra/secrets/openai_api_key.txt" <<<"$LOCAL_KEY"

# --- 5. write infra/.env.production on box ----------------------------------
log "writing infra/.env.production on box"
ssh "$HOST" "bash -s" <<REMOTE_ENV
set -euo pipefail
cd $REMOTE_PATH/infra
APP_PW=\$(cat secrets/postgres_app_password.txt)
STATS_PW=\$(cat secrets/stats_password.txt)
cat > .env.production <<ENV
POSTGRES_APP_PASSWORD=\$APP_PW
STATS_PASSWORD=\$STATS_PW
OFFSITE_RCLONE_REMOTE=
ENV
chmod 600 .env.production
echo "  · wrote .env.production"
REMOTE_ENV

# --- 6. compose up -----------------------------------------------------------
log "docker compose up -d --build"
ssh "$HOST" "bash -s" <<REMOTE_UP
set -euo pipefail
cd $REMOTE_PATH/infra
set -a; source .env.production; set +a
docker compose pull --quiet 2>/dev/null || true
docker compose up -d --build
docker compose ps
REMOTE_UP

# --- 7. wait for healthz over HTTPS ------------------------------------------
log "waiting for https://$DOMAIN/healthz (cert may take 30-60s on first run)…"
for i in $(seq 1 60); do
  CODE=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 5 "https://$DOMAIN/healthz" 2>/dev/null || echo 000)
  if [[ "$CODE" == "200" ]]; then
    log "healthz 200 ✓"
    break
  fi
  printf '  attempt %d → %s\n' "$i" "$CODE"
  sleep 5
done
if [[ "$CODE" != "200" ]]; then
  fail "healthz never reached 200 — check 'docker compose logs caddy' on box"
fi

# --- 8. run sheets-to-postgres migration -------------------------------------
if [[ "$SKIP_MIGRATION" == "1" ]]; then
  log "SKIP_MIGRATION=1 → skipping v1 import"
elif [[ -z "${GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON:-}" ]]; then
  log "GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON not set → skipping v1 import"
  log "  to run later:  GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON=/path/to/sa.json ./infra/deploy.sh"
else
  if [[ ! -f "$GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON" ]]; then
    fail "GCP key not found: $GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON"
  fi
  log "running v1 → v2 migration"
  REMOTE_KEY="/tmp/cgen-gcp-sa-$$.json"
  scp -q "$GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON" "$HOST:$REMOTE_KEY"
  ssh "$HOST" "bash -s" <<REMOTE_MIG
set -euo pipefail
cd $REMOTE_PATH/migrations
APP_PW=\$(cat ../infra/secrets/postgres_app_password.txt)
DB_URL="postgres://app:\$APP_PW@127.0.0.1:5432/cgen"
# Use uv if available, else apt-installed python3 + pip
if command -v uv >/dev/null; then
  uv venv --python 3.12 .venv >/dev/null
  uv pip install --python .venv/bin/python -q -r requirements.txt
  PY=.venv/bin/python
else
  apt-get install -y -qq python3-venv python3-pip >/dev/null 2>&1 || true
  python3 -m venv .venv
  .venv/bin/pip install -q -r requirements.txt
  PY=.venv/bin/python
fi
# Tunnel db port to host for the migration
docker exec cgen-db pg_isready -U postgres >/dev/null 2>&1 || sleep 5
DB_HOST_PORT=\$(docker port cgen-db 5432 2>/dev/null | grep 0.0.0.0 | head -1 | cut -d: -f2)
if [[ -z "\$DB_HOST_PORT" ]]; then
  # No host binding. Run via docker exec into a temporary python container on the same network.
  docker run --rm --network cgen_internal -e DATABASE_URL="postgres://app:\$APP_PW@db:5432/cgen" \\
    -e GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON=/sa.json \\
    -v $REMOTE_KEY:/sa.json:ro \\
    -v $REMOTE_PATH/migrations:/work:ro \\
    -w /work python:3.12-slim bash -c \\
    "pip install -q -r requirements.txt && python sheets_to_postgres.py"
else
  GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON=$REMOTE_KEY \\
    DATABASE_URL="postgres://app:\$APP_PW@127.0.0.1:\$DB_HOST_PORT/cgen" \\
    \$PY sheets_to_postgres.py
fi
rm -f $REMOTE_KEY
echo
echo "=== final row counts ==="
docker exec cgen-db psql -U postgres -d cgen -c "SELECT source, count(*) FROM generations GROUP BY source;"
docker exec cgen-db psql -U postgres -d cgen -c "SELECT count(*) AS ratings FROM ratings;"
REMOTE_MIG
  log "migration complete"
fi

# --- 9. final summary --------------------------------------------------------
log "deploy complete"
echo
echo "  Live URL:  https://$DOMAIN/"
echo "  Stats:     https://$DOMAIN/stats"
STATS_PW=$(ssh "$HOST" "cat $REMOTE_PATH/infra/secrets/stats_password.txt")
echo "  Stats password: $STATS_PW"
echo
echo "  On the box:"
echo "    cd $REMOTE_PATH/infra"
echo "    docker compose ps"
echo "    docker compose logs -f caddy   # cert acquisition + access logs"
echo "    docker compose logs -f web     # app logs"
