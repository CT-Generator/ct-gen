// Home — Wake Up Zine landing page.
//   Left:  sticker eyebrow + scream H1 + "from SCRATCH." + start CTA + credits
//   Right: stacked tilted exposé stickers
//   Below: story picker as a single-column list of pulpcards.
// Culprit + motive are chosen on the next step (/story/[uuid]).
// Spec: openspec/specs/zine-design-system + selection-flow.

import Link from "next/link";
import Image from "next/image";
import { getMoves } from "@/lib/recipe";
import { sampleN } from "@/lib/seed";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { Sticker } from "@/components/zine/sticker";
import { PulpCardLink } from "@/components/zine/pulp-card";
import { BtnLink } from "@/components/zine/btn";
import { TILTS } from "@/lib/zine-tokens";
import { readLocale, getDict, localizedHref } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type SearchParams = { r?: string };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const locale = await readLocale();
  const dict = getDict(locale);
  const t = dict.home;
  const z = dict.zine;
  const MOVES = getMoves(locale);

  // First-time landing (`?r=` not present) gets a random sample. Refresh advances the seed.
  const refresh =
    sp.r != null ? Number.parseInt(sp.r, 10) || 0 : Math.floor(Math.random() * 1_000_000);
  const events = sampleN("news", 4, refresh + 1, locale);

  return (
    <>
      <Masthead />

      <div className="stage">
        {/* ── Hero (twocol) ──────────────────────────────────────── */}
        <section className="twocol" style={{ alignItems: "start" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h1
              className="scream"
              style={{ fontSize: "var(--t-scream-xl)", margin: "0 0 14px" }}
            >
              {t.hero_h1_a}{" "}
              <span style={{ color: "var(--hot-2)" }}>{t.hero_h1_b}</span>
              <span style={{ color: "var(--cool)" }}>{t.hero_h1_period}</span>
            </h1>

            <p
              className="body"
              style={{
                fontSize: "var(--t-body-lg)",
                lineHeight: 1.5,
                maxWidth: 540,
                marginTop: 6,
                fontStyle: "italic",
                fontWeight: 500,
              }}
            >
              {t.hero_subheading}
            </p>

            <p
              className="body"
              style={{
                fontSize: "var(--t-body)",
                lineHeight: 1.55,
                maxWidth: 540,
                marginTop: 18,
              }}
            >
              {t.hero_description}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                marginTop: 24,
                flexWrap: "wrap",
              }}
            >
              <BtnLink href="#picker" variant="hot">
                {z.start_the_exercise}
              </BtnLink>
              <span
                className="marker"
                style={{
                  fontSize: 22,
                  color: "var(--cool)",
                  transform: "rotate(-2deg)",
                  display: "inline-block",
                }}
              >
                {z.takes_three_minutes}
              </span>
            </div>

            <div className="label" style={{ opacity: 0.6, marginTop: 22 }}>
              {z.credits_built_by}{" "}
              <a href="mailto:marco.meyer@jpberlin.de" style={{ color: "inherit" }}>
                Marco Meyer
              </a>{" "}
              {z.credits_amp} Maarten Boudry &nbsp;{z.credits_affiliation}
            </div>
          </div>

          {/* Right column — stacked tilted exposé stickers */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 6 }}>
            <div
              style={{
                background: "var(--hot)",
                color: "var(--paper)",
                border: "3px solid var(--ink)",
                boxShadow: "8px 8px 0 var(--ink)",
                transform: "rotate(2deg)",
                padding: "14px 18px",
                position: "relative",
              }}
            >
              <div className="label" style={{ color: "var(--paper)", opacity: 0.85 }}>
                {z.tonights_exclusive}
              </div>
              <div
                className="scream"
                style={{ fontSize: 30, lineHeight: 1, marginTop: 4, whiteSpace: "pre-line" }}
              >
                {z.you_can_be_a_conspiracist}
              </div>
              <div style={{ fontSize: 11, opacity: 0.85, textAlign: "right", marginTop: 8 }}>
                {z.educational_purposes_only}
              </div>
            </div>

            <div
              style={{
                background: "var(--paper)",
                border: "3px solid var(--ink)",
                boxShadow: "6px 6px 0 var(--cool)",
                transform: "rotate(-2deg)",
                padding: "14px 16px 16px",
              }}
            >
              <div className="label" style={{ color: "var(--cool)" }}>
                {z.four_moves_youll_learn}
              </div>
              <ol
                style={{
                  margin: "8px 0 0 18px",
                  padding: 0,
                  fontFamily: "var(--font-body)",
                  fontSize: 13.5,
                  fontWeight: 600,
                  lineHeight: 1.55,
                }}
              >
                {MOVES.map((m) => (
                  <li key={m.key} style={{ marginBottom: 2 }}>
                    {m.title}
                    <span
                      style={{
                        color: "var(--hot-2)",
                        fontWeight: 400,
                        fontStyle: "italic",
                      }}
                    >
                      {" "}
                      — {m.sub.toLowerCase()}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

          </div>
        </section>

        {/* ── Story picker ──────────────────────────────────────── */}
        <section id="picker" style={{ marginTop: 48 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            <Sticker tilt={-2}>{z.step_1_of_3}</Sticker>
            <span className="label">{t.step_1_picker}</span>
            <Link
              href={{ pathname: localizedHref("/", locale), query: { r: refresh + 1 } }}
              className="label"
              style={{
                marginLeft: "auto",
                color: "var(--cool)",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              ↻ {t.refresh}
            </Link>
          </div>

          <h2
            className="scream"
            style={{ fontSize: "var(--t-scream-md)", margin: "10px 0 4px" }}
          >
            {z.pick_the_event_h}
          </h2>
          <p className="body" style={{ margin: "0 0 18px", maxWidth: 760 }}>
            {z.pick_the_event_deck}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {events.map((e, i) => {
              const summary =
                e.intro_paragraphs?.[0] ??
                (e.summary.length > 280 ? e.summary.slice(0, 280) + "…" : e.summary);
              const sourceHost = e.url
                ? new URL(e.url).hostname.replace(/^www\./, "")
                : null;
              const tilt = TILTS[i % TILTS.length];
              const hoverNote = z.hover_notes[i % z.hover_notes.length];

              return (
                <PulpCardLink
                  key={e.uuid}
                  href={localizedHref(`/story/${e.uuid}`, locale)}
                  tilt={tilt}
                  hoverNote={hoverNote}
                  className="story-card"
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 16,
                      alignItems: "stretch",
                    }}
                  >
                    {e.imageUrl && (
                      <div style={{ flex: "0 0 auto" }}>
                        <Image
                          src={e.imageUrl}
                          width={140}
                          height={140}
                          alt={e.name}
                          className="block object-cover"
                          style={{
                            width: 128,
                            height: 128,
                            border: "2.5px solid var(--ink)",
                          }}
                          unoptimized
                        />
                      </div>
                    )}
                    <div
                      style={{
                        flex: "1 1 auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        minWidth: 0,
                      }}
                    >
                      <div className="label" style={{ color: "var(--hot-2)" }}>
                        {sourceHost ?? "FILE"}
                      </div>
                      <h3
                        className="scream"
                        style={{ fontSize: 22, lineHeight: 1, margin: "2px 0 4px" }}
                      >
                        {e.name}
                      </h3>
                      <p
                        className="body"
                        style={{ fontSize: 13.5, margin: 0, lineHeight: 1.5 }}
                      >
                        {summary}
                      </p>
                      <div className="pulpcard-spacer" />
                      <div className="pulpcard-foot">
                        <span className="pulpcard-cta">{t.choose_this_story} →</span>
                      </div>
                    </div>
                  </div>
                </PulpCardLink>
              );
            })}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
