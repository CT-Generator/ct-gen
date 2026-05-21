// /story/[uuid] — Step 2: pick a culprit and a motive for the chosen news event.
// Spec: zine-design-system + selection-flow.

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { findByUuid, sampleN } from "@/lib/seed";
import { ConspiratorsPicker } from "@/components/conspirators-picker";
import { Sticker } from "@/components/zine/sticker";
import { readLocale, getDict, localizedHref, isLocale, type Locale } from "@/lib/i18n";

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
  const visitorLocale = await readLocale();

  const event = findByUuid("news", uuid);
  if (!event) notFound();

  // Locale lock: the chosen news event is tied to a single seed locale. If the
  // visitor reaches /<prefix>/story/<uuid> via a URL whose prefix doesn't match
  // the event's persisted locale, redirect to the canonical URL so chrome,
  // intro paragraphs, and the H1 headline all align on the seed's locale.
  // Mirrors the same pattern used on /g/[id].
  const eventLocale: Locale = isLocale(event.locale) ? event.locale : "en";
  if (visitorLocale !== eventLocale) {
    const r = sp.r != null ? `?r=${encodeURIComponent(sp.r)}` : "";
    redirect(`${localizedHref(`/story/${uuid}`, eventLocale)}${r}`);
  }

  const locale = eventLocale;
  const t = getDict(locale).story;
  const z = getDict(locale).zine;

  const refresh = sp.r != null ? Number.parseInt(sp.r, 10) || 0 : Math.floor(Math.random() * 1_000_000);

  const culprits = sampleN("culprits", 4, refresh + 11, locale);
  const motives = sampleN("motives", 4, refresh + 13, locale);

  const paragraphs = event.intro_paragraphs ?? [event.summary];
  const sourceHost = event.url ? new URL(event.url).hostname.replace(/^www\./, "") : null;

  return (
    <>
      <Masthead />

      <article className="stage">
        {/* Top bar: stickers + pick-different link */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <Sticker tilt={-2}>{z.step_2_of_3}</Sticker>
          <Sticker color="yellow" tilt={1.5}>
            {z.file_open}
          </Sticker>
          <Link
            href={localizedHref("/", locale)}
            className="label"
            style={{
              marginLeft: "auto",
              color: "var(--cool)",
              textDecoration: "none",
            }}
          >
            ← {t.pick_different}
          </Link>
        </div>

        {/* Story headline — scream */}
        <h1
          className="scream"
          style={{ fontSize: "var(--t-scream-md)", margin: "8px 0 14px", lineHeight: 0.96 }}
        >
          {event.name}
        </h1>

        {/* Intro paragraphs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 }}>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="body"
              style={{ fontSize: "var(--t-body)", lineHeight: 1.6, margin: 0 }}
            >
              {p}
            </p>
          ))}
        </div>

        {event.url && sourceHost && (
          <p className="label" style={{ marginTop: 14 }}>
            {t.source_label}{" "}
            <a
              href={event.url}
              target="_blank"
              rel="noopener"
              style={{
                color: "var(--cool)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              {sourceHost} ↗
            </a>
          </p>
        )}

        {/* Step 3 intro */}
        <div
          style={{
            marginTop: 32,
            paddingTop: 22,
            borderTop: "2.5px solid var(--ink)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Sticker tilt={-3}>{z.step_3_of_3}</Sticker>
            <span className="label">{t.pick_conspirators_meta}</span>
          </div>
          <h2
            className="scream"
            style={{ fontSize: "var(--t-scream-sm)", margin: "10px 0 6px" }}
          >
            {z.who_did_it_h}
          </h2>
          <p className="body" style={{ fontSize: "var(--t-body)", lineHeight: 1.55, maxWidth: 760, margin: 0 }}>
            {t.pick_conspirators_explainer}
          </p>
        </div>

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
            cta_yolo: t.cta_yolo,
            cta_yolo_starting: t.cta_yolo_starting,
            cta_yolo_starting_dots: t.cta_yolo_starting_dots,
            err_too_long: t.err_too_long,
            err_couldnt_start: t.err_couldnt_start,
            err_yolo_failed: t.err_yolo_failed,
            yolo_retry: t.yolo_retry,
          }}
        />
      </article>

      <Footer />
    </>
  );
}
