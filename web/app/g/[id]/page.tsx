// /g/[id] — read-only view of an assembled fake conspiracy theory.
// Renders the four moves the user picked + their debunks.
// Three shapes can land here:
//   - v2 wizard rows: per_move[moveKey] = { idea, paragraph, debunk }
//   - earlier v2 rows (pre-wizard): top-level { anomalies, connect_dots, ..., debunk }
//   - migrated v1 rows: { legacy_text, recipe_tags: null }
//
// Two locales live on this page:
//   - rowLocale: the language the row was authored in (paragraphs, H1, dictionary).
//   - chromeLocale: the visitor's UI choice (masthead, nav targets, locale toggle).
// They may diverge — an English visitor on a shared `/de/g/<id>` link sees German
// content with English chrome and English nav targets. Spec:
//   openspec/changes/sticky-language-selection/specs/internationalization/spec.md

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { getMoves, parseMarkedText, type MoveKey, type WizardContent } from "@/lib/recipe";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { MoveGlyph } from "@/components/move-glyph";
import { MoveTellStamp } from "@/components/move-tell-stamp";
import { NarrativeStamp } from "@/components/narrative-stamp";
import { ShareButtons } from "@/components/share-buttons";
import { RatingBar } from "@/components/rating-bar";
import { TheoryHeadline } from "@/components/theory-headline";
import { Sticker } from "@/components/zine/sticker";
import { MarkerStamp } from "@/components/zine/marker-stamp";
import { ExposeBoard } from "@/components/zine/expose-board";
import { TheoryText } from "@/components/zine/theory-text";
import { getDict, isLocale, localizedHref, readLocale, type Locale } from "@/lib/i18n";

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

// Per-page metadata override Next.js merging is shallow per top-level field — when this
// function returns an `openGraph` block, the layout-level og:locale gets shadowed.
// We must explicitly include `locale` here, mapped from the row's persisted locale.
const OG_LOCALE_MAP: Record<Locale, string> = {
  en: "en_US",
  de: "de_DE",
  nl: "nl_NL",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const gen = await loadGeneration(id).catch(() => null);
  if (!gen) return { title: "Theory not found" };
  const rowLocale: Locale = isLocale(gen.locale) ? gen.locale : "en";
  const title = `${gen.culpritValue} × ${gen.eventValue}`;
  const description = getDict(rowLocale).meta.og_description_generation;
  const ogImage = `${env().PUBLIC_BASE_URL}/api/og/${id}`;
  return {
    title,
    description,
    openGraph: {
      title: `Conspiracy Generator — ${title}`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: OG_LOCALE_MAP[rowLocale],
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

  // Row locale drives all body content; chrome locale drives all nav targets.
  const rowLocale: Locale = isLocale(gen.locale) ? gen.locale : "en";
  const chromeLocale = await readLocale();

  const t = getDict(rowLocale).generation;
  const shareLabels = getDict(rowLocale).share;
  const MOVES = getMoves(rowLocale);

  const content = gen.recipeContent as WizardContent;
  const display = buildDisplayMoves(content);
  const permalink = `${env().PUBLIC_BASE_URL}/g/${id}`;

  const zineDict = getDict(rowLocale).zine;

  return (
    <>
      <Masthead />

      <div className="stage">
        {/* Top sticker row — crop-resistant disclaimers (1/3) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <Sticker color="yellow" tilt={-2}>{zineDict.expose_for_instructional}</Sticker>
          <Sticker color="hot" tilt={1.5}>{zineDict.one_hundred_percent_fabricated}</Sticker>
          <Sticker color="ink" tilt={-1}>{zineDict.built_in_three_minutes}</Sticker>
        </div>

        {/* Exposé hero: 2-col on desktop (dark headline card LEFT + 2x2 move
            summary grid RIGHT) with RedStrings overlay. Mobile collapses to
            a single ink card (the 2x2 grid hides; detailed move blocks below
            cover the same content).
            Spec: openspec/specs/conspiracy-output Requirement: Wake Up Zine
            exposé board layout on permalink. */}
        <ExposeBoard
          moves={MOVES.map((m) => ({ n: m.n, title: m.title, tactic: m.sub }))}
        >
          <div className="label" style={{ color: "var(--punch)" }}>
            {gen.source === "migrated" ? t.eyebrow_imported : t.eyebrow_fake}
          </div>

          <div style={{ marginTop: 8 }}>
            <TheoryHeadline
              locale={rowLocale}
              moves={MOVES.map((m) => ({ color: m.color }))}
              fragments={{
                h1_how: t.h1_how,
                h1_orchestrated: t.h1_orchestrated,
                h1_in_service_of: t.h1_in_service_of,
                h1_period: t.h1_period,
              }}
              culprit={gen.culpritValue}
              event={gen.eventValue}
              motive={gen.motiveValue}
            />
          </div>

          {content.conspiracist_intro && !content.narrative?.paragraphs?.length && (
            <p
              className="body"
              style={{
                marginTop: 14,
                fontSize: "var(--t-body)",
                lineHeight: 1.6,
                fontStyle: "italic",
                maxWidth: 720,
                color: "color-mix(in oklab, var(--paper) 90%, transparent)",
              }}
            >
              {content.conspiracist_intro}
              {content.event_intro?.source_url && (
                <>
                  {" "}
                  <a
                    href={content.event_intro.source_url}
                    target="_blank"
                    rel="noopener nofollow"
                    style={{ color: "var(--punch)", fontStyle: "normal", textDecoration: "underline" }}
                  >
                    {t.original_story}
                  </a>
                </>
              )}
            </p>
          )}

          {content.narrative?.paragraphs?.length && content.event_intro?.source_url && (
            <p className="label" style={{ marginTop: 14, color: "color-mix(in oklab, var(--paper) 70%, transparent)" }}>
              {getDict(rowLocale).story.source_label}{" "}
              <a
                href={content.event_intro.source_url}
                target="_blank"
                rel="noopener nofollow"
                style={{ color: "var(--punch)", textDecoration: "underline" }}
              >
                {(() => {
                  try {
                    return new URL(content.event_intro.source_url).hostname.replace(/^www\./, "");
                  } catch {
                    return content.event_intro.source_url;
                  }
                })()} ↗
              </a>
            </p>
          )}

          {/* RECEIPTS! marker stamp — top right, rotated, paper on ink-bordered card */}
          <div
            style={{
              position: "absolute",
              top: 14,
              right: -18,
              pointerEvents: "none",
            }}
            data-zine-marginalia
          >
            <MarkerStamp tilt={15}>{zineDict.receipts_stamp}</MarkerStamp>
          </div>

          {/* Bottom meta — third disclaimer-strength instance */}
          <p
            className="label"
            style={{
              marginTop: 18,
              color: "color-mix(in oklab, var(--paper) 55%, transparent)",
            }}
          >
            {zineDict.do_not_share_without_context}
          </p>
        </ExposeBoard>
      </div>

      {/* Narrative finale — integrated theory. Rendered for any recipe-tagged
          generation that has a persisted narrative; older rows and rows where
          narrative generation failed render the per-move blocks only (no broken
          section). Persisted shape supports both 3- and 4-paragraph variants:
          pre-yolo-narrative-polish rows have 3 conspiracy paragraphs;
          post-change rows have 4 (paragraph 1 is a neutral news-event framing,
          paragraphs 2–4 are conspiracy). The render below maps paragraphs[]
          directly to render blocks, so both shapes work without length-coupling.
          Each paragraph sits in its own position:relative wrapper with its own
          NarrativeStamp anchored bottom-right, so any horizontal screenshot of
          any single paragraph also captures that paragraph's stamp. */}
      {display.shape !== "legacy" && content.narrative?.paragraphs?.length ? (
        <section className="stage" style={{ paddingTop: 8 }}>
          <p className="meta mb-3">{t.narrative_eyebrow}</p>
          <div className="font-body text-[16px] sm:text-[17px] leading-[1.7] space-y-4">
            {content.narrative.paragraphs.map((p, i) => (
              <div key={i} style={{ position: "relative", paddingBottom: 30 }}>
                <p className="whitespace-pre-wrap">{p}</p>
                <NarrativeStamp label={t.narrative_stamp} />
              </div>
            ))}
          </div>
          <p
            className="mt-5 font-mono uppercase text-ink-soft dark:text-ink-soft-dark"
            style={{ fontSize: 10, letterSpacing: "0.14em" }}
          >
            {MOVES.map((m, i) => (
              <span key={m.key}>
                {i > 0 && <span className="mx-1.5 opacity-50">·</span>}
                <a
                  href={localizedHref("/recipe", chromeLocale)}
                  className="underline-offset-2 hover:underline"
                  style={{ color: m.color }}
                >
                  {m.n} {m.title.toUpperCase()}
                </a>
              </span>
            ))}
          </p>
          <p className="mt-4">
            <a
              href="#breakdown"
              className="text-[13px] underline-offset-2 underline hover:no-underline"
            >
              {t.see_breakdown_cta}
            </a>
          </p>
        </section>
      ) : null}

      {/* Move blocks — alternating punch/paper panels (zine board feel) */}
      {display.shape !== "legacy" ? (
        <section className="stage" style={{ paddingTop: 8 }}>
          {content.narrative?.paragraphs?.length ? (
            <div id="breakdown" className="pt-8 sm:pt-10 mt-2 rule-h scroll-mt-8">
              <p className="meta pt-5">{t.breakdown_eyebrow}</p>
              <p className="mt-2 text-[14px] leading-[1.6] text-ink-soft dark:text-ink-soft-dark">
                {t.breakdown_explainer}
              </p>
            </div>
          ) : null}
          {MOVES.map((m, i) => {
            const dm = display.moves[m.key];
            if (!dm) return null;
            // Strict A-B-A-B alternation so the four cards read as a rhythm
            // rather than the prior A-B-B-A pattern that left 001+004 yellow
            // and 002+003 cream — a symmetry that looked like a mistake.
            const cardBg = i % 2 === 0 ? "var(--punch)" : "var(--paper)";
            return (
              <article
                key={m.key}
                style={{
                  background: cardBg,
                  border: "3px solid var(--ink)",
                  boxShadow: "var(--shadow)",
                  padding: "18px 22px 18px",
                  marginTop: i === 0 ? 0 : 22,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                  <span
                    className="scream"
                    style={{ fontSize: 32, color: "var(--hot-2)", lineHeight: 1 }}
                  >
                    0{m.n}
                  </span>
                  <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                    <div className="scream" style={{ fontSize: "var(--t-scream-xs)", lineHeight: 1.05 }}>
                      {m.title}
                    </div>
                    <div className="label" style={{ color: "var(--hot-2)", marginTop: 4 }}>
                      {t.move_label} {m.n}
                    </div>
                  </div>
                </div>
                {dm.idea && (
                  <p className="label" style={{ marginBottom: 8 }}>{t.idea_label} {dm.idea}</p>
                )}
                <div
                  className="body"
                  style={{
                    position: "relative",
                    fontSize: "var(--t-body)",
                    lineHeight: 1.6,
                    padding: "10px 32px 18px 0",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <TheoryText parts={parseMarkedText(dm.paragraph)} />
                  <MoveTellStamp move={m} label={t.move_label.toUpperCase()} />
                </div>
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: "1px dashed color-mix(in oklab, var(--ink) 40%, transparent)",
                  }}
                >
                  <p className="label" style={{ marginBottom: 6 }}>
                    ⚠ {t.debunk_label}
                  </p>
                  <p
                    className="body"
                    style={{ fontSize: "var(--t-body-sm)", lineHeight: 1.55, whiteSpace: "pre-wrap" }}
                  >
                    {dm.debunk}
                  </p>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="stage" style={{ paddingTop: 16 }}>
          <Sticker color="ink" tilt={-1}>{t.legacy_note}</Sticker>
          <div
            className="font-body whitespace-pre-wrap"
            style={{ fontSize: "var(--t-body)", lineHeight: 1.7, marginTop: 14 }}
            dangerouslySetInnerHTML={{ __html: content.legacy_text ?? "" }}
          />
        </section>
      )}

      {/* Rate + share + remix */}
      <section
        className="stage"
        style={{
          marginTop: 24,
          paddingTop: 18,
          borderTop: "2.5px solid var(--ink)",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {/* What you just learned — the third disclaimer-strength block below the moves */}
        <div
          style={{
            background: "var(--paper-2)",
            border: "2.5px solid var(--ink)",
            padding: "14px 18px",
            boxShadow: "var(--shadow)",
            maxWidth: 720,
          }}
        >
          <p className="label" style={{ marginBottom: 6 }}>{zineDict.what_you_just_learned}</p>
          <p className="body" style={{ fontSize: "var(--t-body-sm)", lineHeight: 1.55, margin: 0 }}>
            {zineDict.what_you_just_learned_body}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p className="label">{t.rate_question}</p>
          <RatingBar shortId={id} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <p className="label">{t.share_meta}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <Link
              href={localizedHref("/", chromeLocale)}
              className="zine-btn"
              data-size="md"
              style={{
                background: "var(--hot)",
                color: "var(--paper)",
                border: "3px solid var(--ink)",
                boxShadow: "var(--shadow)",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(18px, 1.8vw, 22px)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                padding: "11px 20px 9px",
                textDecoration: "none",
                minHeight: 44,
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              ↺ {t.build_another}
            </Link>
            <ShareButtons
              permalink={permalink}
              culprit={gen.culpritValue}
              labels={shareLabels}
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
