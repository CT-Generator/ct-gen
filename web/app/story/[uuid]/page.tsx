// /story/[uuid] — Step 2: pick a culprit and a motive for the chosen news event.

import { notFound } from "next/navigation";
import Link from "next/link";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { findByUuid, sampleN } from "@/lib/seed";
import { ConspiratorsPicker } from "@/components/conspirators-picker";

type Params = { uuid: string };
type SearchParams = { r?: string };

export const dynamic = "force-dynamic";

export default async function StoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { uuid } = await params;
  const sp = await searchParams;
  // First-time landing gets random culprits/motives; refresh advances the seed.
  const refresh = sp.r != null ? Number.parseInt(sp.r, 10) || 0 : Math.floor(Math.random() * 1_000_000);

  const event = findByUuid("news", uuid);
  if (!event) notFound();

  const culprits = sampleN("culprits", 4, refresh + 11);
  const motives = sampleN("motives", 4, refresh + 13);

  const paragraphs = event.intro_paragraphs ?? [event.summary];
  const sourceHost = event.url ? new URL(event.url).hostname.replace(/^www\./, "") : null;

  return (
    <>
      <Masthead />

      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="meta">Step 2 — The official story</p>
          <Link
            href="/"
            className="meta hover:text-ink dark:hover:text-ink-dark transition-colors"
          >
            ← Pick a different story
          </Link>
        </div>

        <h1
          className="mt-3 font-display text-[clamp(1.7rem,4.5vw,2.4rem)] leading-[1.05]"
          style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
        >
          {event.name}
        </h1>

        <div className="mt-5 space-y-4 text-[15px] sm:text-[16px] leading-relaxed">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {event.url && sourceHost && (
          <p className="mt-5 text-[13px] text-ink-soft dark:text-ink-soft-dark">
            Source:{" "}
            <a
              href={event.url}
              target="_blank"
              rel="noopener"
              className="underline-offset-2 underline hover:no-underline break-all"
            >
              {sourceHost} ↗
            </a>
          </p>
        )}

        {/* Explainer */}
        <div className="mt-9 sm:mt-10 rule-h pt-5">
          <p className="meta mb-3">Now pick the conspirators</p>
          <p className="text-[15px] leading-relaxed">
            Every conspiracy theory pins one <strong>culprit</strong> and one <strong>motive</strong>{" "}
            on the same story. The same story can spawn any number of theories — different culprits,
            different motives. That's part of how you spot a conspiracy theory: the same event can
            be "explained" any number of ways.
          </p>
        </div>

        {/* Conspirators picker (interactive) */}
        <ConspiratorsPicker
          eventUuid={event.uuid}
          eventName={event.name}
          eventSummary={event.summary}
          culprits={culprits}
          motives={motives}
          refresh={refresh}
        />
      </article>

      <Footer />
    </>
  );
}
