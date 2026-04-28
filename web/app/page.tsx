// Home — pick the news event. Culprit + motive are chosen on the next step (/story/[uuid]).

import Link from "next/link";
import Image from "next/image";
import { MOVES } from "@/lib/recipe";
import { sampleN } from "@/lib/seed";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { MoveGlyph } from "@/components/move-glyph";

export const dynamic = "force-dynamic";

type SearchParams = { r?: string };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  // First-time landing (`?r=` not present) gets a random sample. Refresh advances the seed.
  const refresh = sp.r != null ? Number.parseInt(sp.r, 10) || 0 : Math.floor(Math.random() * 1_000_000);
  const events = sampleN("news", 4, refresh + 1);

  return (
    <>
      <Masthead />

      {/* Hero */}
      <section className="border-b border-ink/15 dark:border-ink-dark/15">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-9 lg:py-16">
          <h1
            className="font-display text-[clamp(2.25rem,7vw,4.75rem)] leading-[0.96] max-w-3xl"
            style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
          >
            Build a conspiracy theory{" "}
            <span style={{ color: MOVES[0].color }}>from scratch</span>.
          </h1>
          <p
            className="mt-3 sm:mt-4 max-w-2xl text-[16px] sm:text-[17px] italic text-ink-soft dark:text-ink-soft-dark"
            style={{ fontWeight: 400 }}
          >
            The best way to learn to spot a conspiracy theory is to make one yourself.
          </p>
          <p className="mt-5 sm:mt-6 max-w-2xl text-[15px] sm:text-[16px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
            Pick a real news story. On the next step you'll choose who's behind it and why. Then walk
            through the four moves real conspiracists use, with a debunk on every step.
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

      {/* News picker — single column, horizontal cards */}
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
        <div className="flex items-center justify-between mb-4">
          <p className="meta">Step 1 — Pick a real news story</p>
          <Link
            href={{ pathname: "/", query: { r: refresh + 1 } }}
            className="meta hover:text-ink dark:hover:text-ink-dark transition-colors"
          >
            ↻ Refresh
          </Link>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">
          {events.map((e) => {
            const summary =
              e.intro_paragraphs?.[0] ??
              (e.summary.length > 280 ? e.summary.slice(0, 280) + "…" : e.summary);
            const sourceHost = e.url
              ? new URL(e.url).hostname.replace(/^www\./, "")
              : null;
            return (
              <Link
                key={e.uuid}
                href={`/story/${e.uuid}`}
                className="group flex flex-col sm:flex-row gap-4 sm:gap-5 p-4 sm:p-5 bg-paper-alt dark:bg-paper-alt-dark border border-ink/15 dark:border-ink-dark/15 hover:border-ink dark:hover:border-ink-dark transition-colors"
              >
                <Image
                  src={e.imageUrl}
                  width={140}
                  height={140}
                  alt=""
                  className="block h-32 sm:h-32 w-full sm:w-32 object-cover flex-shrink-0 border border-ink/15 dark:border-ink-dark/15"
                  unoptimized
                />
                <div className="flex flex-col justify-between min-w-0">
                  <div>
                    <h3
                      className="font-display text-[18px] sm:text-[20px] leading-tight"
                      style={{ fontWeight: 600, letterSpacing: "-0.01em" }}
                    >
                      {e.name}
                    </h3>
                    <p className="mt-1.5 sm:mt-2 text-[13.5px] leading-snug text-ink-soft dark:text-ink-soft-dark line-clamp-3">
                      {summary}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-3 flex items-center justify-between gap-3">
                    {sourceHost ? (
                      <span className="meta">{sourceHost}</span>
                    ) : (
                      <span />
                    )}
                    <span
                      className="font-mono uppercase tracking-meta-tight text-ink-soft dark:text-ink-soft-dark group-hover:text-ink dark:group-hover:text-ink-dark transition-colors"
                      style={{ fontSize: 10 }}
                    >
                      Choose this story →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <Footer />
    </>
  );
}
