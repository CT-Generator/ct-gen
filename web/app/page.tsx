// Home / selection page.
// Mobile-first responsive translation of the design canvas Home sheet.
// Source: /tmp/design-extract/conspiracy-generator/project/component-sheets.jsx → HomeSheet
//
// The seed sample is taken at request time. A query param `r` advances the
// shuffle seed so "Refresh" produces a new draw without a generation.

import Link from "next/link";
import { MOVES } from "@/lib/recipe";
import { sampleN } from "@/lib/seed";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { DisclaimerBand } from "@/components/disclaimer-band";
import { MoveGlyph } from "@/components/move-glyph";
import { SelectionForm } from "@/components/selection-form";

export const dynamic = "force-dynamic";

type SearchParams = {
  r?: string;
  // Remix params — when present, the selection form pre-fills these as custom inputs.
  remix?: string;
  e?: string;
  c?: string;
  m?: string;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const refresh = Number.parseInt(sp.r ?? "0", 10) || 0;

  const events = sampleN("news", 4, refresh + 1);
  const culprits = sampleN("culprits", 4, refresh + 2);
  const motives = sampleN("motives", 3, refresh + 3);

  const remix =
    sp.remix && sp.e && sp.c && sp.m
      ? { from: sp.remix, event: sp.e, culprit: sp.c, motive: sp.m }
      : undefined;

  return (
    <>
      <DisclaimerBand />
      <Masthead />

      {/* Hero */}
      <section className="border-b border-ink/15 dark:border-ink-dark/15">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-9 lg:py-16">
          <p className="meta">The four-move recipe</p>
          <h1
            className="mt-3 sm:mt-4 font-display text-[clamp(2.25rem,7vw,4.75rem)] leading-[0.96] max-w-3xl"
            style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
          >
            Watch a conspiracy theory{" "}
            <span style={{ color: MOVES[0].color }}>build itself</span> from your inputs.
          </h1>
          <p className="mt-5 sm:mt-6 max-w-2xl text-[15px] sm:text-[16px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
            Pick an event, a culprit, and a motive. We assemble a plausible-sounding theory using the four
            moves real conspiracists rely on — labeled as they happen — with a debunking column running
            alongside.
          </p>
        </div>
      </section>

      {/* Four-move preview row */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-ink dark:border-ink-dark"
        aria-label="The four recipe moves"
      >
        {MOVES.map((m, i) => (
          <div
            key={m.key}
            className={[
              "p-5 sm:p-6",
              i < MOVES.length - 1
                ? "border-b sm:border-b-0 border-ink/15 dark:border-ink-dark/15"
                : "",
              i % 2 === 0 ? "sm:border-r border-ink/15 dark:border-ink-dark/15" : "",
              i === 0 || i === 1 ? "sm:border-b lg:border-b-0 border-ink/15 dark:border-ink-dark/15" : "",
              i === 2 ? "lg:border-r border-ink/15 dark:border-ink-dark/15" : "",
              i < 3 ? "lg:border-r border-ink/15 dark:border-ink-dark/15" : "",
            ].join(" ")}
          >
            <div className="flex items-center gap-2.5">
              <span style={{ color: m.color }}>
                <MoveGlyph kind={m.key} size={26} />
              </span>
              <span
                className="font-mono uppercase"
                style={{ fontSize: 10, letterSpacing: "0.14em", color: m.color }}
              >
                Move {m.n}
              </span>
            </div>
            <h2
              className="mt-2.5 font-display text-[18px] sm:text-[19px] leading-tight"
              style={{ fontWeight: 600 }}
            >
              {m.title}
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
              {m.sub}
            </p>
          </div>
        ))}
      </section>

      {/* Selection picker */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-9 lg:py-14">
        <div className="flex items-center justify-between mb-1">
          <p className="meta">Step 1 — Choose your ingredients</p>
          <Link
            href={{ pathname: "/", query: { r: refresh + 1 } }}
            className="meta hover:text-ink dark:hover:text-ink-dark transition-colors"
          >
            ↻ Refresh
          </Link>
        </div>
        <SelectionForm events={events} culprits={culprits} motives={motives} remix={remix} />
      </section>

      <DisclaimerBand compact accent={3} />
      <Footer />
    </>
  );
}
