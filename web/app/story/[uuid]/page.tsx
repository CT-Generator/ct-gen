// /story/[uuid] — Step 2: pick a culprit and a motive for the chosen news event.

import { notFound } from "next/navigation";
import Link from "next/link";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { findByUuid, sampleN } from "@/lib/seed";
import { ConspiratorsPicker } from "@/components/conspirators-picker";
import { readLocale, getDict, localizedHref } from "@/lib/i18n";

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
  const locale = await readLocale();
  const t = getDict(locale).story;

  // First-time landing gets random culprits/motives; refresh advances the seed.
  const refresh = sp.r != null ? Number.parseInt(sp.r, 10) || 0 : Math.floor(Math.random() * 1_000_000);

  const event = findByUuid("news", uuid);
  if (!event) notFound();

  const culprits = sampleN("culprits", 4, refresh + 11, locale);
  const motives = sampleN("motives", 4, refresh + 13, locale);

  const paragraphs = event.intro_paragraphs ?? [event.summary];
  const sourceHost = event.url ? new URL(event.url).hostname.replace(/^www\./, "") : null;

  return (
    <>
      <Masthead />

      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="meta">{t.eyebrow}</p>
          <Link
            href={localizedHref("/", locale)}
            className="meta hover:text-ink dark:hover:text-ink-dark transition-colors"
          >
            {t.pick_different}
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
            {t.source_label}{" "}
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
          <p className="meta mb-3">{t.pick_conspirators_meta}</p>
          <p className="text-[15px] leading-relaxed">
            {t.pick_conspirators_explainer}
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
          locale={locale}
          labels={{
            culprit: t.culprit,
            motive: t.motive,
            refresh_choices: t.refresh_choices,
            walkthrough_caption: t.walkthrough_caption,
            cta_start: t.cta_start,
            cta_starting: t.cta_starting,
            cta_starting_dots: t.cta_starting_dots,
            err_too_long: t.err_too_long,
            err_couldnt_start: t.err_couldnt_start,
          }}
        />
      </article>

      <Footer />
    </>
  );
}
