// /api/start — kick off the wizard.
// The event intro is pre-generated and ships with the seed data — so this
// route only generates the per-move idea brainstorm. ~10–15s with gpt-5-mini.

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { generateIdeas } from "@/lib/openai";
import { shortIdFor } from "@/lib/short-id";
import { RECIPE_VERSION, type WizardContent } from "@/lib/recipe";
import { getOrIssueSessionHash } from "@/lib/session";
import { findByUuid } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Picked = { uuid: string; name: string; summary: string };
type Body = { event: Picked; culprit: Picked; motive: Picked };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body?.event?.name || !body?.culprit?.name || !body?.motive?.name) {
    return NextResponse.json({ error: "Missing selection" }, { status: 400 });
  }

  const e = env();
  const shortId = shortIdFor({
    event: body.event.name,
    culprit: body.culprit.name,
    motive: body.motive.name,
    modelVersion: e.OPENAI_MODEL,
    recipeVersion: RECIPE_VERSION,
  });

  // Short-circuit: same triple already started? Re-use it.
  const existing = (
    await db()
      .select({ shortId: schema.generations.shortId, recipeContent: schema.generations.recipeContent })
      .from(schema.generations)
      .where(eq(schema.generations.shortId, shortId))
      .limit(1)
  )[0];
  if (existing) {
    return NextResponse.json({ shortId: existing.shortId, cached: true });
  }

  // Pull the pre-generated intro + conspiracist hook from the seed for this event.
  const seedNews = findByUuid("news", body.event.uuid);
  const intro = {
    paragraphs: seedNews?.intro_paragraphs ?? [body.event.summary],
    source_url: seedNews?.url ?? "",
  };
  const conspiracistIntro = seedNews?.conspiracist_intro ?? "";

  const ideas = await generateIdeas({
    eventName: body.event.name,
    eventSummary: intro.paragraphs.join("\n\n"),
    culpritName: body.culprit.name,
    culpritSummary: body.culprit.summary,
    motiveName: body.motive.name,
    motiveSummary: body.motive.summary,
  }).catch((err) => {
    console.error("[start] ideas failed:", err);
    return null;
  });

  if (!ideas) {
    return NextResponse.json(
      { error: "The build setup glitched — try again." },
      { status: 502 },
    );
  }

  const recipeContent: WizardContent = {
    event_intro: intro,
    conspiracist_intro: conspiracistIntro,
    ideas,
    per_move: {},
  };

  const sessionHash = await getOrIssueSessionHash();
  await db()
    .insert(schema.generations)
    .values({
      shortId,
      eventValue: body.event.name,
      eventSource: "curated",
      culpritValue: body.culprit.name,
      culpritSource: "curated",
      motiveValue: body.motive.name,
      motiveSource: "curated",
      recipeContent,
      modelVersion: e.OPENAI_MODEL,
      recipeVersion: RECIPE_VERSION,
      source: "created",
      sessionHash,
      createdAt: new Date(),
    })
    .onConflictDoNothing({ target: schema.generations.shortId });

  return NextResponse.json({ shortId });
}
