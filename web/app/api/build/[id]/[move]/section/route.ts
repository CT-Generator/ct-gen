// /api/build/[id]/[move]/section — generate paragraph + debunk for one move.
// The chosen idea comes from the request body. The result is persisted into
// recipe_content.per_move[move]. Re-calling for the same move overwrites
// (used when the user clicks a different idea button to regenerate).

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { generateSection, moderate } from "@/lib/openai";
import { type MoveKey, type WizardContent } from "@/lib/recipe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MOVE_KEYS: MoveKey[] = ["anomaly", "connection", "dismiss", "discredit"];

type Params = { id: string; move: string };
type Body = { idea: string };

export async function POST(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  const { id, move } = await params;
  if (!MOVE_KEYS.includes(move as MoveKey)) {
    return NextResponse.json({ error: "Unknown move" }, { status: 400 });
  }
  const moveKey = move as MoveKey;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const chosenIdea = (body?.idea ?? "").trim();
  if (!chosenIdea) {
    return NextResponse.json({ error: "idea required" }, { status: 400 });
  }

  const row = (
    await db()
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.shortId, id))
      .limit(1)
  )[0];
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const content = row.recipeContent as WizardContent;
  const prior: Partial<Record<MoveKey, string>> = {};
  for (const k of MOVE_KEYS) {
    if (k === moveKey) continue;
    const v = content.per_move?.[k];
    if (v) prior[k] = v.paragraph;
  }

  const sec = await generateSection({
    eventName: row.eventValue,
    eventSummary: content.event_intro?.paragraphs?.join("\n\n") ?? "",
    culpritName: row.culpritValue,
    motiveName: row.motiveValue,
    moveKey,
    chosenIdea,
    prior,
  }).catch((err) => {
    console.error("[section] failed:", err);
    return null;
  });
  if (!sec) {
    return NextResponse.json(
      { error: "The theory engine glitched — try again." },
      { status: 502 },
    );
  }

  const m = await moderate(sec.paragraph).catch(() => ({ flagged: false }));
  if (m.flagged) {
    console.warn("[section] flagged", { id, moveKey, idea: chosenIdea });
    return NextResponse.json(
      { error: "The engine refused this one. Pick a different idea or try again." },
      { status: 422 },
    );
  }

  const newContent: WizardContent = {
    ...content,
    per_move: {
      ...(content.per_move ?? {}),
      [moveKey]: { idea: chosenIdea, paragraph: sec.paragraph, debunk: sec.debunk },
    },
  };

  await db()
    .update(schema.generations)
    .set({ recipeContent: newContent })
    .where(eq(schema.generations.shortId, id));

  return NextResponse.json({ paragraph: sec.paragraph, debunk: sec.debunk });
}
