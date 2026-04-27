// /stats — maintainer dashboard. Basic Auth gated by middleware.ts.
// Two tabs: v1 (legacy Streamlit + Sheets) and v2 (Next.js wizard).

import Link from "next/link";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { BarChart } from "@/components/bar-chart";
import { LineChart } from "@/components/line-chart";
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

        <nav className="mt-8 flex gap-px border-b border-ink/15 dark:border-ink-dark/15">
          <TabLink active={tab === "v2"} tabValue="v2" label="v2 — Next.js wizard" />
          <TabLink active={tab === "v1"} tabValue="v1" label="v1 — legacy (imported)" />
        </nav>

        {tab === "v2" ? <V2Body /> : <V1Body />}
      </article>
      <Footer />
    </>
  );
}

function TabLink({
  active,
  tabValue,
  label,
}: {
  active: boolean;
  tabValue: Tab;
  label: string;
}) {
  return (
    <Link
      href={{ pathname: "/stats", query: { tab: tabValue } }}
      className="px-4 py-2 -mb-px font-mono uppercase text-[11px] tracking-[0.14em]"
      style={{
        borderBottom: active ? `2px solid ${MOVES[0].color}` : "2px solid transparent",
        opacity: active ? 1 : 0.55,
      }}
    >
      {label}
    </Link>
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

// ---------------------------------------------------------------------------
// Shared presentational helpers
// ---------------------------------------------------------------------------

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
      <span className="meta" style={{ color: accent }}>
        {label}
      </span>
      <span
        className="font-display tabular-nums leading-none"
        style={{
          fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
          fontWeight: 600,
          color: accent,
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
            <span className="font-mono tabular-nums text-[12px]" style={{ color: accent }}>
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
