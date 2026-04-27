// Permalink / generation page.
// Spec: openspec/changes/v2-rebuild/specs/theory-generation/spec.md
//       openspec/changes/v2-rebuild/specs/permalinks-and-sharing/spec.md
//
// Reads from Postgres by short-id. Falls back to a 404 if not found.
// Recipe-tagged sections + debunk render in distinct visual containers.
// Mobile: theory above, debunk below per move (debunk has equal heading prominence).
// Tablet+: side-by-side 1.4fr / 1fr per move.

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { MOVES } from "@/lib/recipe";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { DisclaimerBand } from "@/components/disclaimer-band";
import { MoveGlyph } from "@/components/move-glyph";
import { ShareButtons } from "@/components/share-buttons";
import { RatingBar } from "@/components/rating-bar";
import { RerollButton } from "@/components/reroll-button";
import Link from "next/link";

type Params = { id: string };

const MOVE_KEYS = ["anomalies", "connect_dots", "dismiss_counter", "discredit_critics"] as const;

type RecipeContent = {
  anomalies: string;
  connect_dots: string;
  dismiss_counter: string;
  discredit_critics: string;
  debunk: string;
  // Migrated rows have the legacy_text shape instead.
  legacy_text?: string;
  recipe_tags?: null;
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
  // OG copy NEVER includes any sentence of the generated theory.
  // Spec: permalinks-and-sharing → OG cards teach the recipe, not the theory.
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

export default async function GenerationPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const gen = await loadGeneration(id);
  if (!gen) notFound();

  const recipe = gen.recipeContent as RecipeContent;
  const isLegacy = !!recipe.legacy_text && !recipe.anomalies;
  const permalink = `${env().PUBLIC_BASE_URL}/g/${id}`;

  return (
    <>
      <DisclaimerBand />
      <Masthead />

      {/* Run header strip */}
      <section className="border-b border-ink dark:border-ink-dark">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div>
            <p className="meta">
              {gen.source === "migrated" ? "Theory · imported from v1" : `Theory · ${formatDate(gen.createdAt)}`}
            </p>
            <h1
              className="mt-2 font-display text-[clamp(1.6rem,4.5vw,2.4rem)] leading-[1.05] max-w-3xl"
              style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
            >
              How <span style={{ color: MOVES[0].color }}>{gen.culpritValue}</span> orchestrated{" "}
              <span style={{ color: MOVES[2].color }}>{gen.eventValue}</span>, in service of{" "}
              <span style={{ color: MOVES[3].color }}>{gen.motiveValue.toLowerCase()}</span>.
            </h1>
          </div>
          {!isLegacy && (
            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
              <span
                className="font-mono uppercase text-ink-soft dark:text-ink-soft-dark"
                style={{ fontSize: 10, letterSpacing: "0.12em" }}
              >
                Generated · 4/4
              </span>
              <div className="flex gap-1">
                {MOVES.map((m) => (
                  <div
                    key={m.key}
                    className="h-1 w-7 sm:w-9"
                    style={{ background: m.color }}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Move blocks — theory + debunk per move */}
      {!isLegacy ? (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-9">
          {MOVES.map((m, i) => {
            const theoryText = recipe[MOVE_KEYS[i]] ?? "";
            const debunkText = extractDebunkParagraph(recipe.debunk, i);
            return (
              <article
                key={m.key}
                className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 sm:gap-8 lg:gap-10 py-6 sm:py-8 border-t border-ink/15 dark:border-ink-dark/15 first:border-t-0 first:pt-2"
              >
                {/* Theory column */}
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-3">
                    <span style={{ color: m.color }}>
                      <MoveGlyph kind={m.key} size={22} strokeWidth={1.6} />
                    </span>
                    <span
                      className="font-mono uppercase"
                      style={{ fontSize: 10, letterSpacing: "0.16em", color: m.color }}
                    >
                      Move {m.n} · {m.title}
                    </span>
                    <RerollButton
                      parentShortId={id}
                      section={MOVE_KEYS[i]}
                      accentColor={m.color}
                    />
                  </div>
                  <div
                    className="font-body text-[15px] sm:text-[16px] leading-[1.65] pl-4 sm:pl-5 max-w-prose-theory"
                    style={{
                      borderLeft: `2px solid ${m.color}`,
                      background: `color-mix(in oklab, ${m.color} 6%, transparent)`,
                      padding: "10px 14px 10px 16px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {theoryText}
                  </div>
                </div>

                {/* Debunk column */}
                <aside
                  className="lg:border-l lg:border-dashed lg:border-ink/35 dark:lg:border-ink-dark/35 lg:pl-5 pt-4 lg:pt-0 border-t border-dashed border-ink/35 dark:border-ink-dark/35 lg:border-t-0"
                  aria-label={`Debunking move ${m.n}`}
                >
                  <p
                    className="font-mono uppercase text-ink-soft dark:text-ink-soft-dark mb-2"
                    style={{ fontSize: 10, letterSpacing: "0.14em" }}
                  >
                    Debunk · why the move works
                  </p>
                  <p className="text-[13.5px] leading-[1.55] whitespace-pre-wrap">{debunkText}</p>
                </aside>
              </article>
            );
          })}
        </section>
      ) : (
        // Migrated rows: the legacy_text dump, no recipe tagging.
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-9 py-8">
          <p
            className="meta mb-4 inline-block px-2 py-1 border border-ink-soft dark:border-ink-soft-dark"
            style={{ fontSize: 9 }}
          >
            Imported from v1 · recipe tagging not available
          </p>
          <div
            className="font-body text-[15px] sm:text-[16px] leading-[1.7] whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: recipe.legacy_text ?? "" }}
          />
        </section>
      )}

      {/* Rate + remix + share row — always-link-back, no downloadable artifacts */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-9 mt-8 sm:mt-10 pt-6 sm:pt-8 rule-h-soft space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="meta">Rate — was the recipe convincingly applied?</p>
          </div>
          <RatingBar shortId={id} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="meta">Share — recipe-naming, never theory text</p>
            <p
              className="mt-1 font-display text-[15px] sm:text-[16px] leading-tight"
              style={{ fontWeight: 600 }}
            >
              Anyone you send this to lands on the recipe explainer first.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Link
              href={{
                pathname: "/",
                query: {
                  remix: id,
                  e: gen.eventValue,
                  c: gen.culpritValue,
                  m: gen.motiveValue,
                },
              }}
              className="border border-ink/30 dark:border-ink-dark/30 px-3 py-2 text-[12px] hover:border-ink dark:hover:border-ink-dark transition-colors"
            >
              ↻ Remix this
            </Link>
            <ShareButtons permalink={permalink} culprit={gen.culpritValue} />
          </div>
        </div>
      </section>

      <div className="mt-10 sm:mt-12">
        <DisclaimerBand compact accent={2} />
      </div>
      <Footer />
    </>
  );
}

function formatDate(d: Date | null): string {
  if (!d) return "imported from v1";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * The debunk field is one continuous string covering all four moves.
 * Best-effort split: try to find paragraph breaks corresponding to each move.
 * Also strips redundant "Move N — Title:" prefixes the model occasionally emits
 * (the UI already labels each section, so the prefix is double-tagging).
 */
function extractDebunkParagraph(full: string, idx: number): string {
  if (!full) return "";
  const paras = full
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const para = paras.length >= 4 ? paras[idx] : idx === 0 ? full : "";
  if (!para) return "";
  // Strip leading "Move N — Anomaly hunting:" / "Move 02: Connections —" etc.
  return para
    .replace(
      /^\s*(?:\[[^\]]*\]\s*)?move\s*0?[1-4]\s*[—:.\-–]\s*[^.:\n]*[—:]\s*/i,
      "",
    )
    .replace(/^\s*(?:\[[^\]]*\]\s*)?move\s*0?[1-4]\s*[—:.\-–]\s*/i, "")
    .trim();
}
