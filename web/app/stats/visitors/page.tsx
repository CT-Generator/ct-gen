// /stats/visitors — anonymous visitor analytics. Basic Auth gated by middleware.ts.
// Spec: openspec/changes/visitor-tracking/specs/visitor-analytics/spec.md

import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { BarChart } from "@/components/bar-chart";
import { LineChart } from "@/components/line-chart";
import { Tile, TopList } from "@/components/stats-pieces";
import { StatsTabs } from "@/components/stats-tabs";
import { MOVES } from "@/lib/recipe";
import {
  loadVisitorTotals,
  loadVisitorViewsDaily,
  loadVisitorViewsCumulative,
  loadVisitorSessionsDaily,
  loadVisitorTopPages,
  loadVisitorTopReferrers,
  loadVisitorDeviceSplit,
  loadVisitorCountrySplit,
} from "@/lib/visitor-stats";
import {
  loadClientErrorTotals,
  loadClientErrorTopMessages,
  loadClientErrorTopPaths,
  loadClientErrorRecentSamples,
  type ClientErrorSample,
} from "@/lib/client-error-stats";

export const metadata = { title: "Visitors" };
export const dynamic = "force-dynamic";

export default async function VisitorsPage() {
  const [
    totals,
    viewsDaily,
    viewsCum,
    sessionsDaily,
    topPages,
    topReferrers,
    deviceSplit,
    countrySplit,
    errorTotals,
    errorTopMessages,
    errorTopPaths,
    errorSamples,
  ] = await Promise.all([
    loadVisitorTotals(),
    loadVisitorViewsDaily(),
    loadVisitorViewsCumulative(),
    loadVisitorSessionsDaily(),
    loadVisitorTopPages(10),
    loadVisitorTopReferrers(10),
    loadVisitorDeviceSplit(),
    loadVisitorCountrySplit(15),
    loadClientErrorTotals(),
    loadClientErrorTopMessages(10),
    loadClientErrorTopPaths(10),
    loadClientErrorRecentSamples(20),
  ]);

  const inception = totals.inception ? totals.inception.slice(0, 10) : null;
  const days = viewsDaily.length;
  const empty = totals.page_views === 0;

  return (
    <>
      <Masthead />
      <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
        <p className="meta">Stats · Visitors</p>
        <h1
          className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] leading-[1.05]"
          style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
        >
          Who is showing up.
        </h1>

        <StatsTabs active="visitors" />

        {empty ? (
          <EmptyState />
        ) : (
          <Body
            totals={totals}
            inception={inception}
            days={days}
            viewsDaily={viewsDaily}
            viewsCum={viewsCum}
            sessionsDaily={sessionsDaily}
            topPages={topPages}
            topReferrers={topReferrers}
            deviceSplit={deviceSplit}
            countrySplit={countrySplit}
          />
        )}

        <ClientErrorsPane
          totals={errorTotals}
          topMessages={errorTopMessages}
          topPaths={errorTopPaths}
          samples={errorSamples}
        />

        <PrivacyNote />
      </article>
      <Footer />
    </>
  );
}

function EmptyState() {
  return (
    <section className="mt-10 border-l-2 border-ink/30 dark:border-ink-dark/30 pl-4 py-1">
      <p className="text-[13.5px] text-ink-soft dark:text-ink-soft-dark">
        <span className="font-mono uppercase text-[10px] tracking-[0.14em]">
          no visits captured yet
        </span>
        <br />
        Pages will appear once the next visitor lands. Capture is server-side and starts on the
        first request after this change goes live.
      </p>
    </section>
  );
}

function Body(props: {
  totals: Awaited<ReturnType<typeof loadVisitorTotals>>;
  inception: string | null;
  days: number;
  viewsDaily: { day: string; n: number }[];
  viewsCum: { day: string; n: number }[];
  sessionsDaily: { day: string; n: number }[];
  topPages: { value: string; n: number }[];
  topReferrers: { value: string; n: number }[];
  deviceSplit: { value: string; n: number }[];
  countrySplit: { value: string; n: number }[];
}) {
  const {
    totals,
    inception,
    days,
    viewsDaily,
    viewsCum,
    sessionsDaily,
    topPages,
    topReferrers,
    deviceSplit,
    countrySplit,
  } = props;

  const pps = totals.pages_per_session;
  const ppsDisplay = pps == null ? "—" : pps.toFixed(2);
  const countryHasData = countrySplit.some((r) => r.value !== "Unknown");

  return (
    <>
      <p className="mt-6 text-[14.5px] text-ink-soft dark:text-ink-soft-dark">
        Anonymous server-side capture{" "}
        {inception ? (
          <>
            since <span className="font-mono">{inception}</span> ({days.toLocaleString()} days).
          </>
        ) : (
          <>since launch.</>
        )}
      </p>

      <section className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-ink/15 dark:bg-ink-dark/15 border border-ink/15 dark:border-ink-dark/15">
        <Tile label="Page views" value={totals.page_views} accent={MOVES[0].color} />
        <Tile label="Unique sessions" value={totals.unique_sessions} accent={MOVES[2].color} />
        <Tile label="Today (views)" value={totals.page_views_today} muted />
        <Tile label="Today (sessions)" value={totals.unique_sessions_today} muted />
        <Tile label="Pages / session" value={ppsDisplay} muted />
      </section>

      <section className="mt-12">
        <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
          Page views per day
        </h2>
        <div className="mt-3 text-ink dark:text-ink-dark">
          <BarChart data={viewsDaily} color={MOVES[0].colorHex} unit="views" />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
          Unique sessions per day
        </h2>
        <div className="mt-3 text-ink dark:text-ink-dark">
          <BarChart data={sessionsDaily} color={MOVES[2].colorHex} unit="sessions" />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
          Cumulative page views
        </h2>
        <div className="mt-3 text-ink dark:text-ink-dark">
          <LineChart data={viewsCum} color={MOVES[0].colorHex} unit="views" />
        </div>
      </section>

      <section className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10">
        <TopList
          title="Top pages"
          rows={topPages}
          accent={MOVES[0].color}
          emptyHint="No page views yet."
        />
        <TopList
          title="Top referrers"
          rows={topReferrers}
          accent={MOVES[2].color}
          emptyHint="No external referrers yet — visitors arriving directly or with stripped Referer headers don't show up here."
        />
        <TopList
          title="Device split"
          rows={deviceSplit}
          accent={MOVES[3].color}
          emptyHint="No device data yet."
        />
        <TopList
          title={countryHasData ? "Top countries" : "Country (no header configured)"}
          rows={countrySplit}
          accent={MOVES[1].color}
          emptyHint="Country data needs a header (e.g. CF-IPCountry) set by an upstream layer. Today every row is bucketed as Unknown."
        />
      </section>
    </>
  );
}

function ClientErrorsPane({
  totals,
  topMessages,
  topPaths,
  samples,
}: {
  totals: Awaited<ReturnType<typeof loadClientErrorTotals>>;
  topMessages: { value: string; n: number }[];
  topPaths: { value: string; n: number }[];
  samples: ClientErrorSample[];
}) {
  const empty = totals.errors_total === 0;

  return (
    <section className="mt-16 border-t border-ink/15 dark:border-ink-dark/15 pt-8">
      <h2
        className="font-display text-[clamp(1.5rem,3.5vw,2rem)] leading-[1.05]"
        style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
      >
        Client errors
      </h2>
      <p className="mt-2 text-[13.5px] text-ink-soft dark:text-ink-soft-dark">
        Uncaught React render errors caught by the global / segment error boundaries.
      </p>

      {empty ? (
        <p className="mt-6 border-l-2 border-ink/30 dark:border-ink-dark/30 pl-4 py-1 text-[13.5px] text-ink-soft dark:text-ink-soft-dark">
          <span className="font-mono uppercase text-[10px] tracking-[0.14em]">
            no client errors captured yet
          </span>
          <br />
          They will appear here when a user hits an uncaught exception.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-3 gap-px bg-ink/15 dark:bg-ink-dark/15 border border-ink/15 dark:border-ink-dark/15">
            <Tile label="Today" value={totals.errors_today} accent={MOVES[3].color} />
            <Tile label="Last 7 days" value={totals.errors_7d} accent={MOVES[3].color} />
            <Tile label="All time" value={totals.errors_total} muted />
          </div>

          <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10">
            <TopList
              title="Top messages"
              rows={topMessages}
              accent={MOVES[3].color}
              emptyHint="No messages yet."
            />
            <TopList
              title="Top paths"
              rows={topPaths}
              accent={MOVES[1].color}
              emptyHint="No paths yet."
            />
          </section>

          <section className="mt-10">
            <h3 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
              Recent samples
            </h3>
            <ol className="mt-3">
              {samples.map((s, i) => (
                <li
                  key={`${s.created_at}-${i}`}
                  className="py-3 border-t border-ink/10 dark:border-ink-dark/10 first:border-t-0"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft dark:text-ink-soft-dark">
                    <span>{s.created_at.slice(0, 19).replace("T", " ")}</span>
                    <span>· {s.locale}</span>
                    <span className="truncate">· {s.path}</span>
                    {s.digest ? <span>· {s.digest.slice(0, 16)}</span> : null}
                  </div>
                  <p className="mt-1 text-[14px] break-words">{s.message}</p>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </section>
  );
}

function PrivacyNote() {
  return (
    <section className="mt-16 border-t border-ink/15 dark:border-ink-dark/15 pt-6">
      <p className="meta">What's tracked</p>
      <ul className="mt-3 text-[13.5px] text-ink-soft dark:text-ink-soft-dark space-y-1.5 list-disc pl-5">
        <li>One row per non-bot, human page request — server-side, no client JavaScript.</li>
        <li>
          Identity is the existing <span className="font-mono">cgen_sid</span> session hash
          (salted SHA-256 of coarse-IP-bucket + UA + day). No raw IPs stored, ever.
        </li>
        <li>
          User-Agent is read once to classify mobile vs. desktop, then discarded. The UA string
          itself is never persisted.
        </li>
        <li>
          Referrer is reduced to its host (e.g. <span className="font-mono">t.co</span>). Full
          URLs and query strings (UTM, &c.) are dropped before insert.
        </li>
        <li>
          Country is read from a configurable request header (default{" "}
          <span className="font-mono">CF-IPCountry</span>). No third-party API call, no MaxMind
          file lookup.
        </li>
        <li>Bots matching a regex of known crawlers are skipped before insert.</li>
        <li>No cookie banner needed — we don't set any new cookies and store no PII.</li>
      </ul>
    </section>
  );
}
