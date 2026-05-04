// /api/build/[id]/yolo — one-shot build.
// Picks one idea per move at random, fans out the four section generations in
// parallel, generates the narrative, and persists everything in a single UPDATE.
// All-or-nothing for the per_move set: if any section fails, nothing is written.

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { generateNarrative, generateSection, moderate } from "@/lib/openai";
import { type MoveKey, type WizardContent } from "@/lib/recipe";
import { isLocale, type Locale } from "@/lib/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

const MOVE_KEYS: MoveKey[] = ["anomaly", "connection", "dismiss", "discredit"];

type Params = { id: string };

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export async function POST(_req: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const row = (
    await db()
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.shortId, id))
      .limit(1)
  )[0];
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const content = row.recipeContent as WizardContent;

  // Idempotent short-circuit: if all four moves are already populated, return success.
  const existingPerMove = content.per_move ?? {};
  const alreadyComplete = MOVE_KEYS.every((k) => Boolean(existingPerMove[k]));
  if (alreadyComplete) {
    return NextResponse.json({ ok: true, cached: true });
  }

  if (
    !content.ideas ||
    !MOVE_KEYS.every((k) => Array.isArray(content.ideas?.[k]) && content.ideas[k].length > 0)
  ) {
    return NextResponse.json(
      { error: "Build is not ready — ideas missing. Run /api/start first." },
      { status: 409 },
    );
  }

  const rowLocale: Locale = isLocale(row.locale) ? row.locale : "en";

  const picks: Record<MoveKey, string> = {
    anomaly: pickRandom(content.ideas.anomaly),
    connection: pickRandom(content.ideas.connection),
    dismiss: pickRandom(content.ideas.dismiss),
    discredit: pickRandom(content.ideas.discredit),
  };

  // Fan out all four sections in parallel. If any rejects, abort.
  let sections: Record<MoveKey, { paragraph: string; debunk: string }>;
  try {
    const [anomaly, connection, dismiss, discredit] = await Promise.all(
      MOVE_KEYS.map((moveKey) =>
        generateSection({
          locale: rowLocale,
          eventName: row.eventValue,
          eventSummary: content.event_intro?.paragraphs?.join("\n\n") ?? "",
          culpritName: row.culpritValue,
          motiveName: row.motiveValue,
          moveKey,
          chosenIdea: picks[moveKey],
          // Yolo runs in parallel, so no prior context across moves — every
          // section is generated independently against the same setup.
          prior: {},
        }),
      ),
    );
    sections = { anomaly, connection, dismiss, discredit };
  } catch (err) {
    console.error("[yolo] section generation failed:", err);
    return NextResponse.json(
      { error: "The theory engine glitched mid-build — try again." },
      { status: 502 },
    );
  }

  // Moderate each paragraph; mirror the per-section route's 422 behavior on flag.
  const mods = await Promise.all(
    MOVE_KEYS.map((k) => moderate(sections[k].paragraph).catch(() => ({ flagged: false }))),
  );
  const flaggedIdx = mods.findIndex((m) => m.flagged);
  if (flaggedIdx >= 0) {
    console.warn("[yolo] section flagged", { id, moveKey: MOVE_KEYS[flaggedIdx] });
    return NextResponse.json(
      { error: "The engine refused this combo. Try again or pick different conspirators." },
      { status: 422 },
    );
  }

  const newPerMove: NonNullable<WizardContent["per_move"]> = {
    anomaly: { idea: picks.anomaly, ...sections.anomaly },
    connection: { idea: picks.connection, ...sections.connection },
    dismiss: { idea: picks.dismiss, ...sections.dismiss },
    discredit: { idea: picks.discredit, ...sections.discredit },
  };

  // Narrative finale. On failure or moderation flag, persist sections only —
  // /g/[id] falls back to the narrative-absent layout.
  let narrative: WizardContent["narrative"] | undefined;
  try {
    const out = await generateNarrative({
      locale: rowLocale,
      eventName: row.eventValue,
      culpritName: row.culpritValue,
      motiveName: row.motiveValue,
      paragraphs: {
        anomaly: sections.anomaly.paragraph,
        connection: sections.connection.paragraph,
        dismiss: sections.dismiss.paragraph,
        discredit: sections.discredit.paragraph,
      },
    });
    const joined = out.paragraphs.join("\n\n");
    const mod = await moderate(joined).catch(() => ({ flagged: false }));
    if (mod.flagged) {
      console.warn("[yolo] narrative flagged, skipping persistence", { id });
    } else {
      narrative = { paragraphs: out.paragraphs, generated_at: new Date().toISOString() };
    }
  } catch (err) {
    console.error("[yolo] narrative generation failed:", err);
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

  return NextResponse.json({ ok: true });
}
