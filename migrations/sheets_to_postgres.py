"""
One-shot migration from the legacy Google Sheets store to v2 Postgres.

Spec: openspec/changes/v2-rebuild/specs/data-platform/spec.md (Requirement: One-shot migration from Google Sheets)

The script is idempotent: re-running it is safe and inserts no duplicates.
Migrated rows have:
    source = 'migrated'
    created_at = NULL  (the Sheet had no per-row timestamps)
    recipe_content = {"legacy_text": <original markdown>, "recipe_tags": null}

Usage:
    pip install -r requirements.txt
    export GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON=/path/to/service-account.json
    export DATABASE_URL=postgres://app:...@host:5432/cgen
    python sheets_to_postgres.py [--dry-run]

After a successful migration, REVOKE the legacy GCP service-account key.
That credential should never be used by any live code path again.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from typing import Any

import gspread
import psycopg
from oauth2client.service_account import ServiceAccountCredentials

# v1 spreadsheet — same URL as the legacy app's secrets.toml.
SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1_r7oecr7d2aO5M20JpNjo2tTzPQAnE6LWkGwPQWVrOw/edit#gid=0"
SCOPES = [
    "https://spreadsheets.google.com/feeds",
    "https://www.googleapis.com/auth/drive",
]

# Column mapping for the legacy `generated_ct` worksheet.
# Order matches insert_row_to_sheet in ct_gen/src/pages/page_5.py:
GENERATED_CT_COLUMNS = [
    "news_name",
    "news_summary",
    "culprits_name",
    "culprits_summary",
    "motives_name",
    "motives_summary",
    "prompt",
    "conspiracy_theory",
]

LEGACY_MODEL_VERSION = "legacy-gpt-4o"
LEGACY_RECIPE_VERSION = "legacy-v0"


def short_id_for(event: str, culprit: str, motive: str, model: str, recipe: str) -> str:
    alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    canonical = "\u001f".join(
        [
            event.strip().lower(),
            culprit.strip().lower(),
            motive.strip().lower(),
            model,
            recipe,
        ]
    )
    digest = hashlib.sha256(canonical.encode("utf-8")).digest()
    out = []
    for i in range(10):
        out.append(alphabet[digest[i % len(digest)] % len(alphabet)])
    return "".join(out)


def open_sheet():
    creds_path = os.environ.get("GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON")
    if not creds_path:
        sys.exit("error: GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON env var must point at the legacy GCP key file")
    creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, SCOPES)
    gc = gspread.authorize(creds)
    return gc.open_by_url(SPREADSHEET_URL)


def fetch_generated_ct(book) -> list[dict[str, Any]]:
    sheet = book.worksheet("generated_ct")
    rows = sheet.get_all_values()
    if not rows:
        return []
    # First row is the header; some legacy rows are missing trailing columns — pad with "".
    body = rows[1:] if rows[0] and any(rows[0]) else rows
    out = []
    for r in body:
        padded = list(r) + [""] * max(0, len(GENERATED_CT_COLUMNS) - len(r))
        d = dict(zip(GENERATED_CT_COLUMNS, padded[: len(GENERATED_CT_COLUMNS)]))
        # Skip blank rows.
        if not (d["news_name"] or d["culprits_name"] or d["motives_name"]):
            continue
        out.append(d)
    return out


def fetch_ratings(book) -> list[dict[str, Any]]:
    sheet = book.worksheet("ratings")
    rows = sheet.get_all_values()
    if not rows:
        return []
    header = [c.strip() for c in rows[0]]
    out = []
    for r in rows[1:]:
        if not any(r):
            continue
        d = {header[i]: (r[i] if i < len(r) else "") for i in range(len(header))}
        out.append(d)
    return out


def upsert_generations(conn, gens: list[dict[str, Any]], dry: bool) -> int:
    inserted = 0
    with conn.cursor() as cur:
        for g in gens:
            sid = short_id_for(
                g["news_name"],
                g["culprits_name"],
                g["motives_name"],
                LEGACY_MODEL_VERSION,
                LEGACY_RECIPE_VERSION,
            )
            recipe_content = json.dumps(
                {
                    "legacy_text": g.get("conspiracy_theory") or "",
                    "legacy_prompt": g.get("prompt") or "",
                    "recipe_tags": None,
                }
            )
            if dry:
                print(f"[dry-run] would insert {sid} :: {g['culprits_name']!r}")
                inserted += 1
                continue
            cur.execute(
                """
                INSERT INTO generations (
                    short_id,
                    event_value, event_source,
                    culprit_value, culprit_source,
                    motive_value, motive_source,
                    recipe_content,
                    model_version, recipe_version,
                    created_at, source
                ) VALUES (
                    %s,
                    %s, 'migrated',
                    %s, 'migrated',
                    %s, 'migrated',
                    %s::jsonb,
                    %s, %s,
                    NULL, 'migrated'
                )
                ON CONFLICT (short_id) DO NOTHING
                """,
                (
                    sid,
                    g["news_name"],
                    g["culprits_name"],
                    g["motives_name"],
                    recipe_content,
                    LEGACY_MODEL_VERSION,
                    LEGACY_RECIPE_VERSION,
                ),
            )
            if cur.rowcount:
                inserted += 1
    if not dry:
        conn.commit()
    return inserted


def insert_ratings(conn, ratings: list[dict[str, Any]], dry: bool) -> int:
    """Map ratings rows back to generations by matching the news/culprit/motive triple in the legacy ratings sheet.

    The legacy ratings sheet's exact schema isn't strictly documented; we keep this conservative and only
    write rows where we can confidently link to a generation.
    """
    inserted = 0
    with conn.cursor() as cur:
        for r in ratings:
            # Heuristic: the legacy app appended (news_name, culprits_name, motives_name, score) per rating.
            news = (r.get("news_name") or r.get("News") or r.get("news") or "").strip()
            culprit = (r.get("culprits_name") or r.get("Culprits") or r.get("culprit") or "").strip()
            motive = (r.get("motives_name") or r.get("Motives") or r.get("motive") or "").strip()
            score_raw = r.get("score") or r.get("rating") or r.get("Rating") or r.get("Score")
            if not (news and culprit and motive and score_raw):
                continue
            try:
                score = int(float(str(score_raw).strip()))
            except ValueError:
                continue
            sid = short_id_for(news, culprit, motive, LEGACY_MODEL_VERSION, LEGACY_RECIPE_VERSION)
            if dry:
                print(f"[dry-run] would insert rating for {sid} = {score}")
                inserted += 1
                continue
            cur.execute(
                """
                INSERT INTO ratings (generation_id, session_hash, score)
                SELECT g.id, %s, %s
                FROM generations g
                WHERE g.short_id = %s
                ON CONFLICT (generation_id, session_hash) DO NOTHING
                """,
                (f"migrated-{sid}", score, sid),
            )
            if cur.rowcount:
                inserted += 1
    if not dry:
        conn.commit()
    return inserted


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="print what would happen, write nothing")
    args = ap.parse_args()

    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        sys.exit("error: DATABASE_URL must be set")

    print("[migrate] opening spreadsheet…")
    book = open_sheet()

    print("[migrate] fetching generated_ct…")
    gens = fetch_generated_ct(book)
    print(f"[migrate] fetched {len(gens)} generated_ct rows")

    print("[migrate] fetching ratings…")
    ratings = fetch_ratings(book)
    print(f"[migrate] fetched {len(ratings)} ratings rows")

    if args.dry_run:
        print("[migrate] DRY RUN — no DB writes")
        upsert_generations(None, gens, dry=True)  # type: ignore[arg-type]
        insert_ratings(None, ratings, dry=True)  # type: ignore[arg-type]
        return 0

    print("[migrate] connecting to Postgres…")
    with psycopg.connect(db_url) as conn:
        n_gens = upsert_generations(conn, gens, dry=False)
        n_rates = insert_ratings(conn, ratings, dry=False)

    print(f"[migrate] inserted {n_gens} generations and {n_rates} ratings")
    print("[migrate] done — REMINDER: revoke the legacy GCP service-account key now")
    return 0


if __name__ == "__main__":
    sys.exit(main())
