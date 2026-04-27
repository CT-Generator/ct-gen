// Generation API.
// Spec: openspec/changes/v2-rebuild/specs/theory-generation/spec.md
//
// 1. Validates the input triple shape.
// 2. Computes the deterministic short-id; if it already exists in DB, return it
//    without re-spending tokens (Decision 8: same triple → same URL).
// 3. Runs the strict structured-output call.
// 4. Per-section moderation pass; refuses + logs if any section flags.
// 5. Persists; returns the short-id.

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { generateTheory, moderate } from "@/lib/openai";
import { shortIdFor } from "@/lib/short-id";
import { RECIPE_VERSION, type RecipeOutput } from "@/lib/recipe";
import { getOrIssueSessionHash } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type InputTriple = {
  event: { value: string; source: "curated" | "custom" };
  culprit: { value: string; source: "curated" | "custom" };
  motive: { value: string; source: "curated" | "custom" };
};

export async function POST(req: Request) {
  let body: InputTriple;
  try {
    body = (await req.json()) as InputTriple;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { event, culprit, motive } = body;
  if (
    !event?.value ||
    !culprit?.value ||
    !motive?.value ||
    !["curated", "custom"].includes(event.source) ||
    !["curated", "custom"].includes(culprit.source) ||
    !["curated", "custom"].includes(motive.source)
  ) {
    return NextResponse.json({ error: "Missing or malformed selection" }, { status: 400 });
  }

  const e = env();

  // The shortId is deterministic over the configured model alias (e.g. "gpt-5"),
  // not the resolved date-pinned snapshot the API returns. This means:
  //   - same triple + same configured model → same URL across requests
  //   - upgrading OPENAI_MODEL ("gpt-5" → "gpt-5-pro") forks new URLs for the
  //     same triples, which is the correct behavior for a different generator
  // The persisted modelVersion column captures the actual snapshot for provenance.
  const shortId = shortIdFor({
    event: event.value,
    culprit: culprit.value,
    motive: motive.value,
    modelVersion: e.OPENAI_MODEL,
    recipeVersion: RECIPE_VERSION,
  });

  // Short-circuit if the same triple + same model has been generated before.
  const existing = await db()
    .select({ shortId: schema.generations.shortId })
    .from(schema.generations)
    .where(eq(schema.generations.shortId, shortId))
    .limit(1);
  if (existing[0]) {
    return NextResponse.json({ shortId: existing[0].shortId, cached: true });
  }

  // Generate.
  let output: RecipeOutput;
  let modelVersion: string;
  try {
    const r = await generateTheory({
      event: event.value,
      culprit: culprit.value,
      motive: motive.value,
    });
    output = r.output;
    modelVersion = r.modelVersion;
  } catch (err) {
    console.error("[generate] model call failed:", err);
    return NextResponse.json(
      { error: "The theory engine glitched — try again." },
      { status: 502 },
    );
  }

  // Per-section moderation pass.
  for (const [k, v] of Object.entries(output)) {
    const m = await moderate(v).catch(() => ({ flagged: false }));
    if (m.flagged) {
      console.warn("[generate] post-generation moderation flagged section", k, "for triple", {
        event: event.value,
        culprit: culprit.value,
        motive: motive.value,
      });
      return NextResponse.json(
        {
          error:
            "The engine refused this generation. Try a different culprit or motive — the satirical recipe lands best on power structures, not on individuals or vulnerable groups.",
        },
        { status: 422 },
      );
    }
  }

  // Persist. Use ON CONFLICT DO NOTHING as a safety net: if two requests for
  // the same triple race past the dedup query, the second one is a no-op.
  const sessionHash = await getOrIssueSessionHash();
  await db()
    .insert(schema.generations)
    .values({
      shortId,
      eventValue: event.value,
      eventSource: event.source,
      culpritValue: culprit.value,
      culpritSource: culprit.source,
      motiveValue: motive.value,
      motiveSource: motive.source,
      recipeContent: output,
      modelVersion,
      recipeVersion: RECIPE_VERSION,
      source: "created",
      sessionHash,
      createdAt: new Date(),
    })
    .onConflictDoNothing({ target: schema.generations.shortId });

  return NextResponse.json({ shortId });
}
