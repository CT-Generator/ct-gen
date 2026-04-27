"""Migrate v1 ratings (👍/👎 on full theory text) to v2 ratings table.

Spec: openspec/changes/v2-rebuild/specs/data-platform/spec.md

The legacy ratings sheet has two columns:
    A: full conspiracy theory text (~2-4 KB markdown)
    B: '👍' or '👎'

We match column A against generations.recipe_content->>'legacy_text' to find the
corresponding migrated generation. The legacy_text in the DB also has a disclaimer
suffix appended by v1, so we match by prefix (rating_text is a prefix of legacy_text).

Score mapping:
    👍 → 5
    👎 → 1

Synthetic session_hash 'migrated-rating-<row_index>' so the (generation_id,
session_hash) unique constraint doesn't dedupe rows where the same theory was
rated by different users.

Idempotent: re-runs are safe via ON CONFLICT DO NOTHING.

Usage:
    pip install -r requirements.txt
    GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON=/path/to/sa.json \
    DATABASE_URL=postgres://app:...@host:5432/cgen \
        python sheets_ratings_to_postgres.py [--dry-run]
"""

from __future__ import annotations

import argparse
import os
import sys
from typing import Any

import gspread
import psycopg
from oauth2client.service_account import ServiceAccountCredentials

SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1_r7oecr7d2aO5M20JpNjo2tTzPQAnE6LWkGwPQWVrOw/edit#gid=0"
SCOPES = [
    "https://spreadsheets.google.com/feeds",
    "https://www.googleapis.com/auth/drive",
]

EMOJI_TO_SCORE = {"👍": 5, "👎": 1}


def open_sheet():
    creds_path = os.environ.get("GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON")
    if not creds_path:
        sys.exit("error: GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON env var must be set")
    creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, SCOPES)
    gc = gspread.authorize(creds)
    return gc.open_by_url(SPREADSHEET_URL)


def fetch_ratings(book) -> list[tuple[str, int]]:
    """Pull every (theory_text, score) row. The first row in this sheet is data,
    not a header — col A holds the theory; col B holds 👍 / 👎."""
    sheet = book.worksheet("ratings")
    rows = sheet.get_all_values()
    out: list[tuple[str, int]] = []
    for r in rows:
        if not r or len(r) < 2:
            continue
        text = (r[0] or "").strip()
        emoji = (r[1] or "").strip()
        score = EMOJI_TO_SCORE.get(emoji)
        if not text or score is None:
            continue
        out.append((text, score))
    return out


def insert_ratings(conn: Any, ratings: list[tuple[str, int]], dry: bool) -> dict[str, int]:
    counts = {"inserted": 0, "skipped_no_match": 0, "skipped_dup": 0}
    with conn.cursor() as cur:
        for i, (text, score) in enumerate(ratings):
            # Match on prefix: legacy_text in DB is the theory + disclaimer suffix.
            # Use the rating text's first 4096 chars as the LIKE prefix to keep
            # query plans manageable; theory texts are well under that cap.
            prefix = text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            cur.execute(
                """
                SELECT id FROM generations
                WHERE recipe_content->>'legacy_text' LIKE %s ESCAPE '\\'
                LIMIT 1
                """,
                (prefix[:4096] + "%",),
            )
            row = cur.fetchone()
            if not row:
                counts["skipped_no_match"] += 1
                continue
            gen_id = row[0]
            session_hash = f"migrated-rating-{i}"
            if dry:
                counts["inserted"] += 1
                continue
            cur.execute(
                """
                INSERT INTO ratings (generation_id, session_hash, score)
                VALUES (%s, %s, %s)
                ON CONFLICT (generation_id, session_hash) DO NOTHING
                """,
                (gen_id, session_hash, score),
            )
            if cur.rowcount:
                counts["inserted"] += 1
            else:
                counts["skipped_dup"] += 1
    if not dry:
        conn.commit()
    return counts


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="don't write")
    args = ap.parse_args()

    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        sys.exit("error: DATABASE_URL must be set")

    print("[migrate-ratings] opening spreadsheet…")
    book = open_sheet()
    print("[migrate-ratings] fetching ratings…")
    ratings = fetch_ratings(book)
    print(f"[migrate-ratings] fetched {len(ratings)} rated rows")
    if not ratings:
        return 0

    print("[migrate-ratings] connecting to Postgres…")
    with psycopg.connect(db_url) as conn:
        counts = insert_ratings(conn, ratings, dry=args.dry_run)

    if args.dry_run:
        print(f"[migrate-ratings] DRY RUN — {counts['inserted']} would be inserted, {counts['skipped_no_match']} unmatched")
    else:
        print(f"[migrate-ratings] inserted {counts['inserted']}, "
              f"unmatched {counts['skipped_no_match']}, "
              f"already-present {counts['skipped_dup']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
