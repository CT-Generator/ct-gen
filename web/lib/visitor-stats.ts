// Aggregate visitor stats for /stats/visitors. All queries run server-side; results not cached.
// Spec: openspec/changes/visitor-tracking/specs/visitor-analytics/spec.md

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import type { DailyRow, TopRow } from "@/lib/stats";

export type VisitorTotals = {
  page_views: number;
  unique_sessions: number;
  page_views_today: number;
  unique_sessions_today: number;
  pages_per_session: number | null;
  inception: string | null;
};

export async function loadVisitorTotals(): Promise<VisitorTotals> {
  const rows = await db().execute(sql`
    SELECT
      count(*)::int                                              AS page_views,
      count(DISTINCT session_hash)::int                          AS unique_sessions,
      count(*) FILTER (
        WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
      )::int                                                     AS page_views_today,
      count(DISTINCT session_hash) FILTER (
        WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
      )::int                                                     AS unique_sessions_today,
      min(created_at)::text                                      AS inception
    FROM page_views
    WHERE created_at IS NOT NULL
  `);
  const r = (rows as unknown as {
    page_views: number;
    unique_sessions: number;
    page_views_today: number;
    unique_sessions_today: number;
    inception: string | null;
  }[])[0]!;
  const pps =
    r && r.unique_sessions > 0 ? r.page_views / r.unique_sessions : null;
  return {
    page_views: r?.page_views ?? 0,
    unique_sessions: r?.unique_sessions ?? 0,
    page_views_today: r?.page_views_today ?? 0,
    unique_sessions_today: r?.unique_sessions_today ?? 0,
    pages_per_session: pps,
    inception: r?.inception ?? null,
  };
}

export async function loadVisitorViewsDaily(): Promise<DailyRow[]> {
  const rows = await db().execute(sql`
    WITH bounds AS (
      SELECT date_trunc('day', min(created_at) AT TIME ZONE 'UTC')::date AS first_day
      FROM page_views WHERE created_at IS NOT NULL
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
      FROM page_views
      WHERE created_at IS NOT NULL
      GROUP BY 1
    )
    SELECT day_series.day::text AS day, COALESCE(counts.n, 0)::int AS n
    FROM day_series LEFT JOIN counts USING (day)
    ORDER BY day_series.day
  `);
  return rows as unknown as DailyRow[];
}

export async function loadVisitorSessionsDaily(): Promise<DailyRow[]> {
  const rows = await db().execute(sql`
    WITH bounds AS (
      SELECT date_trunc('day', min(created_at) AT TIME ZONE 'UTC')::date AS first_day
      FROM page_views WHERE created_at IS NOT NULL
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
             count(DISTINCT session_hash)::int AS n
      FROM page_views
      WHERE created_at IS NOT NULL
      GROUP BY 1
    )
    SELECT day_series.day::text AS day, COALESCE(counts.n, 0)::int AS n
    FROM day_series LEFT JOIN counts USING (day)
    ORDER BY day_series.day
  `);
  return rows as unknown as DailyRow[];
}

export async function loadVisitorViewsCumulative(): Promise<DailyRow[]> {
  const daily = await loadVisitorViewsDaily();
  let acc = 0;
  return daily.map((d) => ({ day: d.day, n: (acc += d.n) }));
}

export async function loadVisitorTopPages(n = 10): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT path AS value, count(*)::int AS n
    FROM page_views
    GROUP BY 1 ORDER BY n DESC, value
    LIMIT ${n}
  `);
  return rows as unknown as TopRow[];
}

export async function loadVisitorTopReferrers(n = 10): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT referrer_host AS value, count(*)::int AS n
    FROM page_views
    WHERE referrer_host IS NOT NULL AND referrer_host <> ''
    GROUP BY 1 ORDER BY n DESC, value
    LIMIT ${n}
  `);
  return rows as unknown as TopRow[];
}

export async function loadVisitorDeviceSplit(): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT device_class AS value, count(*)::int AS n
    FROM page_views
    GROUP BY 1 ORDER BY n DESC
  `);
  return rows as unknown as TopRow[];
}

export async function loadVisitorCountrySplit(n = 15): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT COALESCE(country, 'Unknown') AS value, count(*)::int AS n
    FROM page_views
    GROUP BY 1 ORDER BY n DESC, value
    LIMIT ${n}
  `);
  return rows as unknown as TopRow[];
}
