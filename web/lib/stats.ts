// Aggregate stats for /stats. All queries run server-side; results are not cached.

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export type StatsTotals = {
  generations_total: number;
  generations_new: number;
  generations_migrated: number;
  generations_complete: number; // wizard rows with all 4 sections filled
  ratings_total: number;
  rating_avg: number | null;
  unique_sessions: number;
};

export type DailyRow = { day: string; n: number };

export type TopRow = { value: string; n: number };

export async function loadTotals(): Promise<StatsTotals> {
  const rows = await db().execute(sql`
    SELECT
      count(*)::int                                                AS generations_total,
      count(*) FILTER (WHERE source = 'created')::int              AS generations_new,
      count(*) FILTER (WHERE source = 'migrated')::int             AS generations_migrated,
      count(*) FILTER (
        WHERE source = 'created'
          AND recipe_content ? 'per_move'
          AND jsonb_typeof(recipe_content -> 'per_move') = 'object'
          AND (
            (recipe_content -> 'per_move') ?& array['anomaly','connection','dismiss','discredit']
          )
      )::int                                                       AS generations_complete,
      count(DISTINCT session_hash) FILTER (WHERE session_hash IS NOT NULL)::int
                                                                   AS unique_sessions
    FROM generations
  `);
  const r = (rows as unknown as Record<string, number>[])[0]!;

  const ratingsRows = await db().execute(sql`
    SELECT count(*)::int AS total, avg(score)::float AS avg FROM ratings
  `);
  const rr = (ratingsRows as unknown as { total: number; avg: number | null }[])[0]!;

  return {
    generations_total: r.generations_total ?? 0,
    generations_new: r.generations_new ?? 0,
    generations_migrated: r.generations_migrated ?? 0,
    generations_complete: r.generations_complete ?? 0,
    ratings_total: rr?.total ?? 0,
    rating_avg: rr?.avg ?? null,
    unique_sessions: r.unique_sessions ?? 0,
  };
}

export async function loadGenerationsPerDay(days = 30): Promise<DailyRow[]> {
  const rows = await db().execute(sql`
    WITH day_series AS (
      SELECT generate_series(
        (CURRENT_DATE - (${days - 1}::int))::date,
        CURRENT_DATE,
        '1 day'::interval
      )::date AS day
    ),
    counts AS (
      SELECT date_trunc('day', created_at AT TIME ZONE 'UTC')::date AS day,
             count(*)::int AS n
      FROM generations
      WHERE source = 'created' AND created_at IS NOT NULL
      GROUP BY 1
    )
    SELECT day_series.day::text AS day, COALESCE(counts.n, 0)::int AS n
    FROM day_series
    LEFT JOIN counts USING (day)
    ORDER BY day_series.day
  `);
  return rows as unknown as DailyRow[];
}

export async function loadRatingsPerDay(days = 30): Promise<DailyRow[]> {
  const rows = await db().execute(sql`
    WITH day_series AS (
      SELECT generate_series(
        (CURRENT_DATE - (${days - 1}::int))::date,
        CURRENT_DATE,
        '1 day'::interval
      )::date AS day
    ),
    counts AS (
      SELECT date_trunc('day', created_at AT TIME ZONE 'UTC')::date AS day,
             count(*)::int AS n
      FROM ratings
      GROUP BY 1
    )
    SELECT day_series.day::text AS day, COALESCE(counts.n, 0)::int AS n
    FROM day_series
    LEFT JOIN counts USING (day)
    ORDER BY day_series.day
  `);
  return rows as unknown as DailyRow[];
}

export async function loadTopCulprits(n = 10): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT culprit_value AS value, count(*)::int AS n
    FROM generations
    GROUP BY 1
    ORDER BY n DESC, value
    LIMIT ${n}
  `);
  return rows as unknown as TopRow[];
}

export async function loadTopMotives(n = 10): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT motive_value AS value, count(*)::int AS n
    FROM generations
    GROUP BY 1
    ORDER BY n DESC, value
    LIMIT ${n}
  `);
  return rows as unknown as TopRow[];
}

export async function loadTopEvents(n = 10): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT event_value AS value, count(*)::int AS n
    FROM generations
    GROUP BY 1
    ORDER BY n DESC, value
    LIMIT ${n}
  `);
  return rows as unknown as TopRow[];
}

export async function loadRatingDistribution(): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT score::text AS value, count(*)::int AS n
    FROM ratings
    GROUP BY score
    ORDER BY score DESC
  `);
  return rows as unknown as TopRow[];
}
