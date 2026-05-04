// /api/build/[id]/[move]/section — generate paragraph + debunk for one move.
// The chosen idea comes from the request body. The result is persisted into
// recipe_content.per_move[move]. Re-calling for the same move overwrites
// (used when the user clicks a different idea button to regenerate).

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { generateNarrative, generateSection, moderate } from "@/lib/openai";
import { type MoveKey, type WizardContent } from "@/lib/recipe";
import { isLocale, type Locale } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Bumped from 60s to accommodate narrative generation when discredit completes
// the build (one extra model call before the response returns).
export const maxDuration = 90;

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

  // Read locale from the persisted row — the user's locale was decided at /api/start
  // time and we keep section generation consistent with what's already on the page.
  const rowLocale: Locale = isLocale(row.locale) ? row.locale : "en";

  const sec = await generateSection({
    locale: rowLocale,
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

  const newPerMove = {
    ...(content.per_move ?? {}),
    [moveKey]: { idea: chosenIdea, paragraph: sec.paragraph, debunk: sec.debunk },
  } as NonNullable<WizardContent["per_move"]>;

  // If this section completes the build (all four moves now present and no
  // narrative yet), generate the narrative finale before responding so the
  // result page is a pure read.
  let narrative: WizardContent["narrative"] | undefined = content.narrative;
  const allFourPresent = MOVE_KEYS.every((k) => Boolean(newPerMove[k]));
  if (allFourPresent && !narrative) {
    try {
      const out = await generateNarrative({
        locale: rowLocale,
        eventName: row.eventValue,
        culpritName: row.culpritValue,
        motiveName: row.motiveValue,
        paragraphs: {
          anomaly: newPerMove.anomaly!.paragraph,
          connection: newPerMove.connection!.paragraph,
          dismiss: newPerMove.dismiss!.paragraph,
          discredit: newPerMove.discredit!.paragraph,
        },
      });
      const joined = out.paragraphs.join("\n\n");
      const mod = await moderate(joined).catch(() => ({ flagged: false }));
      if (mod.flagged) {
        console.warn("[section] narrative flagged, skipping persistence", { id });
      } else {
        narrative = { paragraphs: out.paragraphs, generated_at: new Date().toISOString() };
      }
    } catch (err) {
      // Narrative generation failure must not break the build — the per-move
      // section is the canonical artefact. The result page falls back to the
      // narrative-absent layout.
      console.error("[section] narrative generation failed:", err);
    }
  }

  const newContent: WizardContent = {
    ...content,
    per_move: newPerMove,
    ...(narrative ? { narrative } : {}),
  };

  await db()
    .update(schema.generations)
    .set({ recipeContent: newContent })
    .where(eq(schema.generations.shortId, id));

  return NextResponse.json({ paragraph: sec.paragraph, debunk: sec.debunk });
}
