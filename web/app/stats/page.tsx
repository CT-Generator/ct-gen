// /stats — maintainer dashboard. Basic Auth gated by middleware.ts.
// Three tabs: v2 (Next.js wizard), v1 (legacy Streamlit + Sheets), Visitors (/stats/visitors).

import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { BarChart } from "@/components/bar-chart";
import { LineChart } from "@/components/line-chart";
import { Tile, TopList, RatingHist } from "@/components/stats-pieces";
import { StatsTabs } from "@/components/stats-tabs";
import { MOVES } from "@/lib/recipe";
import {
  loadV1Totals,
  loadV1TopCulprits,
  loadV1TopMotives,
  loadV1TopEvents,
  loadV1RatingDistribution,
  loadV2Totals,
  loadV2GenerationsDaily,
  loadV2GenerationsCumulative,
  loadV2RatingsDaily,
  loadV2TopCulprits,
  loadV2TopMotives,
  loadV2TopEvents,
  loadV2RatingDistribution,
} from "@/lib/stats";

export const metadata = { title: "Stats" };
export const dynamic = "force-dynamic";

type Tab = "v1" | "v2";
type SearchParams = { tab?: string };

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const tab: Tab = sp.tab === "v1" ? "v1" : "v2";

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

        <StatsTabs active={tab} />

        {tab === "v2" ? <V2Body /> : <V1Body />}
      </article>
      <Footer />
    </>
  );
}

// ---------------------------------------------------------------------------
// v2 tab
// ---------------------------------------------------------------------------

async function V2Body() {
  const [totals, genDaily, genCum, rateDaily, topC, topM, topE, dist] = await Promise.all([
    loadV2Totals(),
    loadV2GenerationsDaily(),
    loadV2GenerationsCumulative(),
    loadV2RatingsDaily(),
    loadV2TopCulprits(10),
    loadV2TopMotives(10),
    loadV2TopEvents(10),
    loadV2RatingDistribution(),
  ]);

  const inception = totals.inception ? totals.inception.slice(0, 10) : null;
  const days = genDaily.length;

  return (
    <>
      <p className="mt-6 text-[14.5px] text-ink-soft dark:text-ink-soft-dark">
        Theories built on the v2 wizard{" "}
        {inception ? (
          <>
            since <span className="font-mono">{inception}</span> ({days.toLocaleString()} days).
          </>
        ) : (
          <>since the wizard launched.</>
        )}
      </p>

      <section className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-ink/15 dark:bg-ink-dark/15 border border-ink/15 dark:border-ink-dark/15">
        <Tile label="Theories built" value={totals.generations} accent={MOVES[0].color} />
        <Tile label="Wizard finished" value={totals.generations_complete} muted />
        <Tile label="Ratings" value={totals.ratings} accent={MOVES[3].color} />
        <Tile
          label="Avg rating"
          value={totals.rating_avg == null ? "—" : totals.rating_avg.toFixed(2)}
          muted
        />
        <Tile label="Sessions" value={totals.unique_sessions} muted />
      </section>

      <section className="mt-12">
        <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
          Theories built per day
        </h2>
        <div className="mt-3 text-ink dark:text-ink-dark">
          <BarChart data={genDaily} color={MOVES[0].colorHex} unit="theories" />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
          Cumulative theories
        </h2>
        <div className="mt-3 text-ink dark:text-ink-dark">
          <LineChart data={genCum} color={MOVES[0].colorHex} unit="theories" />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
          Ratings per day
        </h2>
        <div className="mt-3 text-ink dark:text-ink-dark">
          <BarChart data={rateDaily} color={MOVES[3].colorHex} unit="ratings" />
        </div>
      </section>

      <section className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10">
        <TopList title="Top culprits" rows={topC} accent={MOVES[0].color} />
        <TopList title="Top motives" rows={topM} accent={MOVES[3].color} />
        <TopList title="Top events" rows={topE} accent={MOVES[2].color} />
        <RatingHist rows={dist} />
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// v1 tab
// ---------------------------------------------------------------------------

async function V1Body() {
  const [totals, topC, topM, topE, dist] = await Promise.all([
    loadV1Totals(),
    loadV1TopCulprits(10),
    loadV1TopMotives(10),
    loadV1TopEvents(10),
    loadV1RatingDistribution(),
  ]);

  return (
    <>
      <p className="mt-6 text-[14.5px] text-ink-soft dark:text-ink-soft-dark">
        Theories generated on the legacy Streamlit app — imported from the v1 Google Sheet during
        the v2 migration.
      </p>

      <section className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-px bg-ink/15 dark:bg-ink-dark/15 border border-ink/15 dark:border-ink-dark/15">
        <Tile label="Theories total" value={totals.generations} accent={MOVES[0].color} />
        <Tile label="Ratings" value={totals.ratings} accent={MOVES[3].color} />
        <Tile
          label="Avg rating"
          value={totals.rating_avg == null ? "—" : totals.rating_avg.toFixed(2)}
          muted
        />
      </section>

      <section className="mt-10 border-l-2 border-ink/30 dark:border-ink-dark/30 pl-4 py-1">
        <p className="text-[13.5px] text-ink-soft dark:text-ink-soft-dark">
          <span className="font-mono uppercase text-[10px] tracking-[0.14em]">no time series available</span>
          <br />
          The v1 Google Sheet didn't store per-row timestamps. Imported ratings (👍/👎) likewise
          carry only their migration date, not when the user originally clicked. So the snapshot
          below is the cumulative state of v1 at sunset — there's no way to chart its evolution.
        </p>
      </section>

      <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10">
        <TopList title="Top culprits" rows={topC} accent={MOVES[0].color} />
        <TopList title="Top motives" rows={topM} accent={MOVES[3].color} />
        <TopList title="Top events" rows={topE} accent={MOVES[2].color} />
        <RatingHist rows={dist} />
      </section>
    </>
  );
}
