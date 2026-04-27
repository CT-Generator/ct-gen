#!/usr/bin/env bash
# Daily pg_dump → /backups, with optional rclone copy offsite.
# Retains $RETENTION_DAYS days locally. Offsite retains 7 (managed by rclone --max-age).

set -euo pipefail

: "${PGHOST:?missing}"
: "${PGUSER:?missing}"
: "${PGDATABASE:?missing}"
: "${PGPASSWORD_FILE:?missing}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
OFFSITE_RCLONE_REMOTE="${OFFSITE_RCLONE_REMOTE:-}"
BACKUP_DIR="/backups"
TARGET_HOUR="${TARGET_HOUR:-3}" # local time

export PGPASSWORD
PGPASSWORD="$(cat "${PGPASSWORD_FILE}")"

mkdir -p "${BACKUP_DIR}"

run_backup() {
  local stamp out
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  out="${BACKUP_DIR}/cgen-${stamp}.sql.gz"

  echo "[backup] starting dump → ${out}"
  pg_dump --no-owner --clean --if-exists --quote-all-identifiers \
    | gzip -9 > "${out}.tmp"
  mv "${out}.tmp" "${out}"
  echo "[backup] dump complete: $(stat -c %s "${out}") bytes"

  # Local retention
  find "${BACKUP_DIR}" -name 'cgen-*.sql.gz' -type f -mtime "+${RETENTION_DAYS}" -delete

  # Offsite copy (optional). 7-day retention enforced via --max-age + delete.
  if [[ -n "${OFFSITE_RCLONE_REMOTE}" ]]; then
    echo "[backup] copying to ${OFFSITE_RCLONE_REMOTE}"
    rclone copy "${out}" "${OFFSITE_RCLONE_REMOTE}" --transfers=1 --checkers=1
    rclone delete --min-age 8d "${OFFSITE_RCLONE_REMOTE}"
  fi
}

# Sleep-until-target loop.
while true; do
  now_hour="$(date -u +%-H)"
  now_min="$(date -u +%-M)"
  # Sleep until the next ${TARGET_HOUR}:17 UTC.
  if (( now_hour < TARGET_HOUR || (now_hour == TARGET_HOUR && now_min < 17) )); then
    sleep_for=$(( ((TARGET_HOUR - now_hour) * 3600) + ((17 - now_min) * 60) ))
  else
    sleep_for=$(( ((24 - now_hour + TARGET_HOUR) * 3600) + ((17 - now_min) * 60) ))
  fi
  if (( sleep_for < 60 )); then sleep_for=60; fi
  echo "[backup] sleeping ${sleep_for}s until next run"
  sleep "${sleep_for}"
  run_backup || echo "[backup] FAILED — will retry tomorrow"
done
