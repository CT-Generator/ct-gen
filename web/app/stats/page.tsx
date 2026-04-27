// /stats — maintainer dashboard. Basic Auth gated by middleware.ts.
// Counts include both new (v2 wizard) and migrated (v1 imported) generations.

import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { BarChart } from "@/components/bar-chart";
import { MOVES } from "@/lib/recipe";
import {
  loadTotals,
  loadGenerationsPerDay,
  loadRatingsPerDay,
  loadTopCulprits,
  loadTopMotives,
  loadTopEvents,
  loadRatingDistribution,
} from "@/lib/stats";

export const metadata = { title: "Stats" };
export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [totals, genDaily, rateDaily, topCulprits, topMotives, topEvents, ratingDist] =
    await Promise.all([
      loadTotals(),
      loadGenerationsPerDay(30),
      loadRatingsPerDay(30),
      loadTopCulprits(10),
      loadTopMotives(10),
      loadTopEvents(10),
      loadRatingDistribution(),
    ]);

  return (
    <>
      <Masthead />
      <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
        <p className="meta">Stats</p>
        <h1
          className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] leading-[1.05]"
          style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
        >
          How the recipe is being used.
        </h1>
        <p className="mt-3 text-[14.5px] text-ink-soft dark:text-ink-soft-dark">
          Counts include {totals.generations_migrated.toLocaleString()} theories imported from the
          v1 site, with original timestamps unknown.
        </p>

        {/* Number tiles */}
        <section className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-ink/15 dark:bg-ink-dark/15 border border-ink/15 dark:border-ink-dark/15">
          <Tile label="Theories total" value={totals.generations_total} />
          <Tile label="From v1 (imported)" value={totals.generations_migrated} muted />
          <Tile label="Built on v2" value={totals.generations_new} accent={MOVES[0].color} />
          <Tile label="Wizard finished" value={totals.generations_complete} muted />
          <Tile label="Ratings" value={totals.ratings_total} accent={MOVES[3].color} />
          <Tile
            label="Avg rating"
            value={totals.rating_avg == null ? "—" : totals.rating_avg.toFixed(2)}
            muted
          />
        </section>

        {/* Daily charts */}
        <section className="mt-12">
          <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
            Theories built per day · last 30 days
          </h2>
          <div className="mt-3 text-ink dark:text-ink-dark">
            <BarChart data={genDaily} color={MOVES[0].colorHex} unit="theories" />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
            Ratings per day · last 30 days
          </h2>
          <div className="mt-3 text-ink dark:text-ink-dark">
            <BarChart data={rateDaily} color={MOVES[3].colorHex} unit="ratings" />
          </div>
        </section>

        {/* Distributions + Top lists */}
        <section className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10">
          <TopList title="Top culprits" rows={topCulprits} accent={MOVES[0].color} />
          <TopList title="Top motives" rows={topMotives} accent={MOVES[3].color} />
          <TopList title="Top events" rows={topEvents} accent={MOVES[2].color} />
          <RatingHist rows={ratingDist} />
        </section>

        {/* Footnote on session-count */}
        <p className="mt-12 text-[12px] italic text-ink-soft dark:text-ink-soft-dark">
          {totals.unique_sessions.toLocaleString()} distinct anonymous sessions on v2 to date. The
          v1-imported rows have no session-hash column, so they're not counted here.
        </p>
      </article>
      <Footer />
    </>
  );
}

function Tile({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: number | string;
  accent?: string;
  muted?: boolean;
}) {
  const display = typeof value === "number" ? value.toLocaleString() : value;
  return (
    <div className="bg-paper-alt dark:bg-paper-alt-dark p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-[110px]">
      <span
        className="meta"
        style={{ color: accent }}
      >
        {label}
      </span>
      <span
        className="font-display tabular-nums leading-none"
        style={{
          fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
          fontWeight: 600,
          color: accent ?? (muted ? undefined : undefined),
          opacity: muted ? 0.75 : 1,
        }}
      >
        {display}
      </span>
    </div>
  );
}

function TopList({
  title,
  rows,
  accent,
}: {
  title: string;
  rows: { value: string; n: number }[];
  accent?: string;
}) {
  if (!rows.length) return null;
  const max = Math.max(...rows.map((r) => r.n), 1);
  return (
    <section>
      <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
        {title}
      </h2>
      <ol className="mt-3">
        {rows.map((r) => (
          <li
            key={r.value}
            className="flex items-baseline gap-3 py-2 border-t border-ink/10 dark:border-ink-dark/10 first:border-t-0"
          >
            <span className="flex-1 truncate text-[14px]">{r.value}</span>
            <span
              className="font-mono tabular-nums text-[12px]"
              style={{ color: accent }}
            >
              {r.n.toLocaleString()}
            </span>
            <span
              aria-hidden
              className="block h-1 ml-2 flex-shrink-0"
              style={{
                width: `${(r.n / max) * 80}px`,
                background: accent ?? "currentColor",
                opacity: 0.6,
              }}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}

function RatingHist({ rows }: { rows: { value: string; n: number }[] }) {
  if (!rows.length) {
    return (
      <section>
        <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
          Rating distribution
        </h2>
        <p className="mt-3 text-[13px] italic text-ink-soft dark:text-ink-soft-dark">
          No ratings yet.
        </p>
      </section>
    );
  }
  const max = Math.max(...rows.map((r) => r.n), 1);
  return (
    <section>
      <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
        Rating distribution
      </h2>
      <ol className="mt-3 space-y-2">
        {rows.map((r) => (
          <li key={r.value} className="flex items-center gap-3 text-[14px]">
            <span className="meta w-8">{r.value}★</span>
            <span
              aria-hidden
              className="block h-3"
              style={{
                width: `${(r.n / max) * 100}%`,
                background: MOVES[3].color,
                maxWidth: "85%",
              }}
            />
            <span className="font-mono tabular-nums text-[12px] text-ink-soft dark:text-ink-soft-dark">
              {r.n}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
