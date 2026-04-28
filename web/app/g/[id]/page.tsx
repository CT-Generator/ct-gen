// /g/[id] — read-only view of an assembled fake conspiracy theory.
// Renders the four moves the user picked + their debunks.
// Three shapes can land here:
//   - v2 wizard rows: per_move[moveKey] = { idea, paragraph, debunk }
//   - earlier v2 rows (pre-wizard): top-level { anomalies, connect_dots, ..., debunk }
//   - migrated v1 rows: { legacy_text, recipe_tags: null }

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { MOVES, type MoveKey, type WizardContent } from "@/lib/recipe";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { MoveGlyph } from "@/components/move-glyph";
import { MoveTellStamp } from "@/components/move-tell-stamp";
import { ShareButtons } from "@/components/share-buttons";
import { RatingBar } from "@/components/rating-bar";

type Params = { id: string };

const MOVE_KEYS: MoveKey[] = ["anomaly", "connection", "dismiss", "discredit"];

// Map old-shape top-level keys to MoveKey, for displaying older rows.
const LEGACY_TOP: Record<MoveKey, keyof WizardContent> = {
  anomaly: "anomalies",
  connection: "connect_dots",
  dismiss: "dismiss_counter",
  discredit: "discredit_critics",
};

async function loadGeneration(shortId: string) {
  const rows = await db()
    .select()
    .from(schema.generations)
    .where(eq(schema.generations.shortId, shortId))
    .limit(1);
  return rows[0] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const gen = await loadGeneration(id).catch(() => null);
  if (!gen) return { title: "Theory not found" };
  const title = `${gen.culpritValue} × ${gen.eventValue}`;
  const description = `Made with the four-move recipe. Pick an event, a culprit, a motive — watch the theory build itself.`;
  const ogImage = `${env().PUBLIC_BASE_URL}/api/og/${id}`;
  return {
    title,
    description,
    openGraph: {
      title: `Conspiracy Generator — ${title}`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Conspiracy Generator — ${title}`,
      description,
      images: [ogImage],
    },
  };
}

type DisplayMove = { paragraph: string; debunk: string; idea?: string };

function buildDisplayMoves(content: WizardContent): {
  shape: "wizard" | "single" | "legacy";
  moves: Partial<Record<MoveKey, DisplayMove>>;
} {
  if (content.per_move && Object.keys(content.per_move).length > 0) {
    return { shape: "wizard", moves: content.per_move as Partial<Record<MoveKey, DisplayMove>> };
  }
  if (content.legacy_text) {
    return { shape: "legacy", moves: {} };
  }
  // Earlier v2 single-shot shape: split debunk into 4 paragraphs.
  const moves: Partial<Record<MoveKey, DisplayMove>> = {};
  const debunks = (content.debunk ?? "")
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  for (let i = 0; i < MOVE_KEYS.length; i++) {
    const k = MOVE_KEYS[i]!;
    const para = content[LEGACY_TOP[k]] as string | undefined;
    const debunk = stripLeadingMoveLabel(debunks[i] ?? "");
    if (para) moves[k] = { paragraph: para, debunk };
  }
  return { shape: "single", moves };
}

function stripLeadingMoveLabel(s: string): string {
  return s
    .replace(/^\s*(?:\[[^\]]*\]\s*)?move\s*0?[1-4]\s*[—:.\-–]\s*[^.:\n]*[—:]\s*/i, "")
    .replace(/^\s*(?:\[[^\]]*\]\s*)?move\s*0?[1-4]\s*[—:.\-–]\s*/i, "")
    .trim();
}

export default async function GenerationPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const gen = await loadGeneration(id);
  if (!gen) notFound();

  const content = gen.recipeContent as WizardContent;
  const display = buildDisplayMoves(content);
  const permalink = `${env().PUBLIC_BASE_URL}/g/${id}`;

  return (
    <>
      <Masthead />

      {/* Header */}
      <section className="border-b border-ink dark:border-ink-dark">
        <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-9 lg:py-10 flex flex-col gap-4">
          <div>
            <p className="meta">
              {gen.source === "migrated" ? "Imported from earlier version" : "A fake conspiracy theory"}
            </p>
            <h1
              className="mt-2 font-display text-[clamp(1.6rem,4.5vw,2.4rem)] leading-[1.05] max-w-2xl"
              style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
            >
              How <span style={{ color: MOVES[0].color }}>{gen.culpritValue}</span> orchestrated{" "}
              <span style={{ color: MOVES[2].color }}>{gen.eventValue}</span>, in service of{" "}
              <span style={{ color: MOVES[3].color }}>{gen.motiveValue.toLowerCase()}</span>.
            </h1>
          </div>

          {content.conspiracist_intro && (
            <p
              className="mt-2 max-w-2xl text-[15px] sm:text-[16px] leading-relaxed italic"
              style={{ color: "var(--tw-color-ink-soft, #54515C)" }}
            >
              {content.conspiracist_intro}
              {content.event_intro?.source_url && (
                <>
                  {" "}
                  <a
                    href={content.event_intro.source_url}
                    target="_blank"
                    rel="noopener nofollow"
                    className="not-italic underline-offset-2 underline hover:no-underline"
                  >
                    (original story)
                  </a>
                </>
              )}
            </p>
          )}
        </div>
      </section>

      {/* Move blocks */}
      {display.shape !== "legacy" ? (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-9">
          {MOVES.map((m) => {
            const dm = display.moves[m.key];
            if (!dm) return null;
            return (
              <article
                key={m.key}
                className="py-7 sm:py-9 border-t border-ink/15 dark:border-ink-dark/15 first:border-t-0 first:pt-2"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <span style={{ color: m.color }}>
                    <MoveGlyph kind={m.key} size={22} strokeWidth={1.6} />
                  </span>
                  <span
                    className="font-mono uppercase"
                    style={{ fontSize: 10, letterSpacing: "0.16em", color: m.color }}
                  >
                    Move {m.n} · {m.title}
                  </span>
                </div>
                {dm.idea && (
                  <p className="meta mb-2">Idea: {dm.idea}</p>
                )}
                <div
                  className="font-body text-[15px] sm:text-[16px] leading-[1.65] pl-4 sm:pl-5"
                  style={{
                    position: "relative",
                    borderLeft: `2px solid ${m.color}`,
                    background: `color-mix(in oklab, ${m.color} 6%, transparent)`,
                    padding: "10px 32px 22px 16px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {dm.paragraph}
                  <MoveTellStamp move={m} />
                </div>
                <div className="mt-4 pl-4 sm:pl-5 border-l border-dashed border-ink/35 dark:border-ink-dark/35 py-1">
                  <p
                    className="font-mono uppercase text-ink-soft dark:text-ink-soft-dark mb-2"
                    style={{ fontSize: 10, letterSpacing: "0.14em" }}
                  >
                    Debunk
                  </p>
                  <p className="text-[13.5px] leading-[1.55] whitespace-pre-wrap">{dm.debunk}</p>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-9 py-8">
          <p
            className="meta mb-4 inline-block px-2 py-1 border border-ink-soft dark:border-ink-soft-dark"
            style={{ fontSize: 9 }}
          >
            Imported from earlier version · recipe tagging not available
          </p>
          <div
            className="font-body text-[15px] sm:text-[16px] leading-[1.7] whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: content.legacy_text ?? "" }}
          />
        </section>
      )}

      {/* Rate + share + remix */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-9 mt-8 sm:mt-10 pt-6 sm:pt-8 rule-h-soft space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="meta">Was the recipe convincingly applied?</p>
          <RatingBar shortId={id} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="meta">Share — links back, no images of the theory</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Link
              href="/"
              className="border border-ink/30 dark:border-ink-dark/30 px-3 py-2 text-[12px] hover:border-ink dark:hover:border-ink-dark transition-colors"
            >
              ↻ Build another
            </Link>
            <ShareButtons permalink={permalink} culprit={gen.culpritValue} />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
