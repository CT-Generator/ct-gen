// Re-roll a single recipe move. Persists a child generation linked to the parent.
// Spec: openspec/changes/v2-rebuild/specs/theory-generation/spec.md (Re-roll a single move)

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

type RerollRequest = {
  parentShortId: string;
  section: keyof RecipeOutput;
};

const VALID_SECTIONS: Array<keyof RecipeOutput> = [
  "anomalies",
  "connect_dots",
  "dismiss_counter",
  "discredit_critics",
  "debunk",
];

export async function POST(req: Request) {
  let body: RerollRequest;
  try {
    body = (await req.json()) as RerollRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.parentShortId || !VALID_SECTIONS.includes(body.section)) {
    return NextResponse.json({ error: "Missing or invalid section" }, { status: 400 });
  }

  const parent = (
    await db()
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.shortId, body.parentShortId))
      .limit(1)
  )[0];
  if (!parent) return NextResponse.json({ error: "Parent not found" }, { status: 404 });

  const parentRecipe = parent.recipeContent as RecipeOutput;
  if (!parentRecipe.anomalies) {
    // Migrated rows can't be re-rolled.
    return NextResponse.json(
      { error: "Imported v1 theories cannot be re-rolled — generate a fresh theory instead." },
      { status: 400 },
    );
  }

  const r = await generateTheory({
    event: parent.eventValue,
    culprit: parent.culpritValue,
    motive: parent.motiveValue,
    rerollSection: body.section,
    context: parentRecipe,
  }).catch((err) => {
    console.error("[reroll] model call failed:", err);
    return null;
  });
  if (!r) return NextResponse.json({ error: "The theory engine glitched — try again." }, { status: 502 });

  // Only the rerolled section should change; preserve the rest from the parent.
  const newOutput: RecipeOutput = { ...parentRecipe, [body.section]: r.output[body.section] };

  const m = await moderate(newOutput[body.section]).catch(() => ({ flagged: false }));
  if (m.flagged) {
    console.warn("[reroll] flagged section", body.section, "for parent", body.parentShortId);
    return NextResponse.json({ error: "The engine refused this re-roll." }, { status: 422 });
  }

  const sessionHash = await getOrIssueSessionHash();
  // Hash inputs PLUS the section being re-rolled and a timestamp, to keep the
  // child URL distinct from the parent.
  const childSeed = `${parent.shortId}\u001f${body.section}\u001f${Date.now()}`;
  const shortId = shortIdFor({
    event: parent.eventValue + "\u001f" + childSeed,
    culprit: parent.culpritValue,
    motive: parent.motiveValue,
    modelVersion: r.modelVersion,
    recipeVersion: RECIPE_VERSION,
  });

  await db().insert(schema.generations).values({
    shortId,
    eventValue: parent.eventValue,
    eventSource: parent.eventSource,
    culpritValue: parent.culpritValue,
    culpritSource: parent.culpritSource,
    motiveValue: parent.motiveValue,
    motiveSource: parent.motiveSource,
    recipeContent: newOutput,
    modelVersion: r.modelVersion,
    recipeVersion: RECIPE_VERSION,
    parentGenerationId: parent.id,
    source: "created",
    sessionHash,
    createdAt: new Date(),
  });

  return NextResponse.json({ shortId, parentShortId: body.parentShortId });
}
