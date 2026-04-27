// Rating API — record a 1–5 score per (generation, session_hash).
// Spec: openspec/changes/v2-rebuild/specs/permalinks-and-sharing (Anonymous identity)
//       openspec/changes/v2-rebuild/specs/data-platform/spec.md (ratings table)

import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getOrIssueSessionHash } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { shortId?: string; score?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const score = Math.round(Number(body.score));
  if (!body.shortId || !Number.isFinite(score) || score < 1 || score > 5) {
    return NextResponse.json({ error: "shortId + score (1..5) required" }, { status: 400 });
  }

  const gen = (
    await db()
      .select({ id: schema.generations.id })
      .from(schema.generations)
      .where(eq(schema.generations.shortId, body.shortId))
      .limit(1)
  )[0];
  if (!gen) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sessionHash = await getOrIssueSessionHash();

  // Upsert: one rating per (generation, session).
  const existing = (
    await db()
      .select()
      .from(schema.ratings)
      .where(and(eq(schema.ratings.generationId, gen.id), eq(schema.ratings.sessionHash, sessionHash)))
      .limit(1)
  )[0];

  if (existing) {
    await db()
      .update(schema.ratings)
      .set({ score })
      .where(eq(schema.ratings.id, existing.id));
  } else {
    await db().insert(schema.ratings).values({ generationId: gen.id, sessionHash, score });
  }

  return NextResponse.json({ ok: true, score });
}
