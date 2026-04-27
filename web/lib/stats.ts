// Aggregate stats for /stats. All queries run server-side; results are not cached.
//
// v1 (migrated) generations have created_at = NULL — original Google-Sheets rows
// carried no timestamps. v1 ratings were also imported in a single batch (their
// created_at is the import time, not when the user clicked 👍/👎). So v1 can only
// be shown as a snapshot, not a time series. v2 ('created') has real timestamps.

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export type TopRow = { value: string; n: number };
export type DailyRow = { day: string; n: number };

// ----------------------------------------------------------------------------
// v1 (migrated)
// ----------------------------------------------------------------------------

export type V1Totals = {
  generations: number;
  ratings: number;
  rating_avg: number | null;
};

export async function loadV1Totals(): Promise<V1Totals> {
  const gRows = await db().execute(sql`
    SELECT count(*)::int AS n FROM generations WHERE source = 'migrated'
  `);
  const rRows = await db().execute(sql`
    SELECT count(*)::int AS n, avg(score)::float AS avg
    FROM ratings r JOIN generations g ON g.id = r.generation_id
    WHERE g.source = 'migrated'
  `);
  const g = (gRows as unknown as { n: number }[])[0]!;
  const r = (rRows as unknown as { n: number; avg: number | null }[])[0]!;
  return { generations: g?.n ?? 0, ratings: r?.n ?? 0, rating_avg: r?.avg ?? null };
}

export async function loadV1TopCulprits(n = 10): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT culprit_value AS value, count(*)::int AS n
    FROM generations WHERE source = 'migrated'
    GROUP BY 1 ORDER BY n DESC, value LIMIT ${n}
  `);
  return rows as unknown as TopRow[];
}

export async function loadV1TopMotives(n = 10): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT motive_value AS value, count(*)::int AS n
    FROM generations WHERE source = 'migrated'
    GROUP BY 1 ORDER BY n DESC, value LIMIT ${n}
  `);
  return rows as unknown as TopRow[];
}

export async function loadV1TopEvents(n = 10): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT event_value AS value, count(*)::int AS n
    FROM generations WHERE source = 'migrated'
    GROUP BY 1 ORDER BY n DESC, value LIMIT ${n}
  `);
  return rows as unknown as TopRow[];
}

export async function loadV1RatingDistribution(): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT score::text AS value, count(*)::int AS n
    FROM ratings r JOIN generations g ON g.id = r.generation_id
    WHERE g.source = 'migrated'
    GROUP BY score ORDER BY score DESC
  `);
  return rows as unknown as TopRow[];
}

// ----------------------------------------------------------------------------
// v2 (created — has real timestamps)
// ----------------------------------------------------------------------------

export type V2Totals = {
  generations: number;
  generations_complete: number;
  ratings: number;
  rating_avg: number | null;
  unique_sessions: number;
  inception: string | null; // ISO date of first v2 row
};

export async function loadV2Totals(): Promise<V2Totals> {
  const gRows = await db().execute(sql`
    SELECT
      count(*)::int AS generations,
      count(*) FILTER (
        WHERE recipe_content ? 'per_move'
          AND jsonb_typeof(recipe_content -> 'per_move') = 'object'
          AND (recipe_content -> 'per_move') ?& array['anomaly','connection','dismiss','discredit']
      )::int AS generations_complete,
      count(DISTINCT session_hash) FILTER (WHERE session_hash IS NOT NULL)::int AS unique_sessions,
      min(created_at)::text AS inception
    FROM generations WHERE source = 'created'
  `);
  const rRows = await db().execute(sql`
    SELECT count(*)::int AS n, avg(score)::float AS avg
    FROM ratings r JOIN generations g ON g.id = r.generation_id
    WHERE g.source = 'created'
  `);
  const g = (gRows as unknown as {
    generations: number;
    generations_complete: number;
    unique_sessions: number;
    inception: string | null;
  }[])[0]!;
  const r = (rRows as unknown as { n: number; avg: number | null }[])[0]!;
  return {
    generations: g?.generations ?? 0,
    generations_complete: g?.generations_complete ?? 0,
    ratings: r?.n ?? 0,
    rating_avg: r?.avg ?? null,
    unique_sessions: g?.unique_sessions ?? 0,
  inception: g?.inception ?? null,
  };
}

/** Daily v2 generation count from the first v2 row up to today. */
export async function loadV2GenerationsDaily(): Promise<DailyRow[]> {
  const rows = await db().execute(sql`
    WITH bounds AS (
      SELECT date_trunc('day', min(created_at) AT TIME ZONE 'UTC')::date AS first_day
      FROM generations WHERE source = 'created' AND created_at IS NOT NULL
    ),
    day_series AS (
      SELECT generate_series(
        (SELECT first_day FROM bounds),
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
    FROM day_series LEFT JOIN counts USING (day)
    ORDER BY day_series.day
  `);
  return rows as unknown as DailyRow[];
}

/** Daily v2 ratings count from the first v2 generation forward. */
export async function loadV2RatingsDaily(): Promise<DailyRow[]> {
  const rows = await db().execute(sql`
    WITH bounds AS (
      SELECT date_trunc('day', min(created_at) AT TIME ZONE 'UTC')::date AS first_day
      FROM generations WHERE source = 'created' AND created_at IS NOT NULL
    ),
    day_series AS (
      SELECT generate_series(
        (SELECT first_day FROM bounds),
        CURRENT_DATE,
        '1 day'::interval
      )::date AS day
    ),
    counts AS (
      SELECT date_trunc('day', r.created_at AT TIME ZONE 'UTC')::date AS day,
             count(*)::int AS n
      FROM ratings r JOIN generations g ON g.id = r.generation_id
      WHERE g.source = 'created'
      GROUP BY 1
    )
    SELECT day_series.day::text AS day, COALESCE(counts.n, 0)::int AS n
    FROM day_series LEFT JOIN counts USING (day)
    ORDER BY day_series.day
  `);
  return rows as unknown as DailyRow[];
}

/** Cumulative v2 generations per day. */
export async function loadV2GenerationsCumulative(): Promise<DailyRow[]> {
  const daily = await loadV2GenerationsDaily();
  let acc = 0;
  return daily.map((d) => ({ day: d.day, n: (acc += d.n) }));
}

export async function loadV2TopCulprits(n = 10): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT culprit_value AS value, count(*)::int AS n
    FROM generations WHERE source = 'created'
    GROUP BY 1 ORDER BY n DESC, value LIMIT ${n}
  `);
  return rows as unknown as TopRow[];
}

export async function loadV2TopMotives(n = 10): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT motive_value AS value, count(*)::int AS n
    FROM generations WHERE source = 'created'
    GROUP BY 1 ORDER BY n DESC, value LIMIT ${n}
  `);
  return rows as unknown as TopRow[];
}

export async function loadV2TopEvents(n = 10): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT event_value AS value, count(*)::int AS n
    FROM generations WHERE source = 'created'
    GROUP BY 1 ORDER BY n DESC, value LIMIT ${n}
  `);
  return rows as unknown as TopRow[];
}

export async function loadV2RatingDistribution(): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT score::text AS value, count(*)::int AS n
    FROM ratings r JOIN generations g ON g.id = r.generation_id
    WHERE g.source = 'created'
    GROUP BY score ORDER BY score DESC
  `);
  return rows as unknown as TopRow[];
}
