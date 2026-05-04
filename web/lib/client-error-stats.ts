// Aggregate queries for the /stats/visitors "Client errors" pane.
// Spec: openspec/changes/client-error-reporting/specs/visitor-analytics/spec.md

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import type { TopRow } from "@/lib/stats";

export type ClientErrorTotals = {
  errors_today: number;
  errors_7d: number;
  errors_total: number;
};

export type ClientErrorSample = {
  created_at: string;
  path: string;
  locale: string;
  message: string;
  digest: string | null;
};

export async function loadClientErrorTotals(): Promise<ClientErrorTotals> {
  const rows = await db().execute(sql`
    SELECT
      count(*)::int                                              AS errors_total,
      count(*) FILTER (
        WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
      )::int                                                     AS errors_today,
      count(*) FILTER (
        WHERE created_at >= now() - interval '7 days'
      )::int                                                     AS errors_7d
    FROM client_errors
  `);
  const r = (rows as unknown as ClientErrorTotals[])[0];
  return {
    errors_today: r?.errors_today ?? 0,
    errors_7d: r?.errors_7d ?? 0,
    errors_total: r?.errors_total ?? 0,
  };
}

export async function loadClientErrorTopMessages(n = 10): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT message AS value, count(*)::int AS n
    FROM client_errors
    GROUP BY 1 ORDER BY n DESC, value
    LIMIT ${n}
  `);
  return rows as unknown as TopRow[];
}

export async function loadClientErrorTopPaths(n = 10): Promise<TopRow[]> {
  const rows = await db().execute(sql`
    SELECT path AS value, count(*)::int AS n
    FROM client_errors
    GROUP BY 1 ORDER BY n DESC, value
    LIMIT ${n}
  `);
  return rows as unknown as TopRow[];
}

export async function loadClientErrorRecentSamples(n = 20): Promise<ClientErrorSample[]> {
  const rows = await db().execute(sql`
    SELECT
      created_at::text AS created_at,
      path,
      locale,
      message,
      digest
    FROM client_errors
    ORDER BY created_at DESC
    LIMIT ${n}
  `);
  return rows as unknown as ClientErrorSample[];
}
