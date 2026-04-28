// /recipe — the four moves explained at length, with each glyph + the same sub-line as the home preview.
// Spec: openspec/changes/v2-rebuild/specs/attribution-and-brand/spec.md (Educational-purpose framing)

import type { Metadata } from "next";
import { getMoves } from "@/lib/recipe";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { MoveGlyph } from "@/components/move-glyph";
import { readLocale, getDict } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await readLocale();
  return { title: getDict(locale).meta.recipe_title };
}

export default async function RecipePage() {
  const locale = await readLocale();
  const t = getDict(locale).recipe;
  const long = getDict(locale).recipe_long;
  const MOVES = getMoves(locale);
  const longByKey: Record<string, [string, string, string]> = {
    anomaly: [long.anomaly_short, long.anomaly_body, long.anomaly_tell],
    connection: [long.connection_short, long.connection_body, long.connection_tell],
    dismiss: [long.dismiss_short, long.dismiss_body, long.dismiss_tell],
    discredit: [long.discredit_short, long.discredit_body, long.discredit_tell],
  };

  return (
    <>
      <Masthead />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <p className="meta">{t.eyebrow}</p>
        <h1
          className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05]"
          style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
        >
          {t.h1}
        </h1>

        <p className="mt-6 text-[16px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
          {t.lede_a}{" "}
          <a
            href="https://maartenboudry.substack.com/p/the-conspiracy-generator"
            target="_blank"
            rel="noopener"
            className="underline-offset-2 underline hover:no-underline"
          >
            {t.lede_link}
          </a>
          {t.lede_period}
        </p>

        <aside
          className="mt-8 border-l-2 pl-4 sm:pl-5 py-2 italic text-[15px] leading-relaxed"
          style={{ borderColor: "var(--tw-color-ink-soft, #54515C)" }}
        >
          <p>
            {t.aside_p}{" "}
            <strong className="not-italic">{t.aside_form}</strong>{" "}
            {t.aside_p_2}{" "}
            <strong className="not-italic">{t.aside_substance}</strong>{" "}
            {t.aside_p_3}
          </p>
        </aside>

        <div className="mt-10 space-y-12">
          {MOVES.map((m) => {
            const [short, body, tell] = longByKey[m.key]!;
            return (
              <section key={m.key}>
                <div className="flex items-center gap-3">
                  <span style={{ color: m.color }}>
                    <MoveGlyph kind={m.key} size={36} strokeWidth={1.5} />
                  </span>
                  <span
                    className="font-mono uppercase"
                    style={{ fontSize: 11, letterSpacing: "0.16em", color: m.color }}
                  >
                    {t.move_label} {m.n}
                  </span>
                </div>
                <h2
                  className="mt-2.5 font-display text-[28px] sm:text-[32px] leading-tight"
                  style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
                >
                  {m.title}
                </h2>
                <p
                  className="mt-2 text-[15px] italic"
                  style={{ color: m.color }}
                >
                  {short}
                </p>
                <p className="mt-4 text-[15.5px] leading-relaxed">{body}</p>
                <p
                  className="mt-3 text-[14px] leading-relaxed pl-4 border-l-2"
                  style={{
                    borderColor: m.color,
                    background: `color-mix(in oklab, ${m.color} 5%, transparent)`,
                    padding: "10px 14px 10px 16px",
                  }}
                >
                  <strong className="font-display" style={{ fontWeight: 600 }}>{t.tell_strong}</strong>{" "}
                  {tell}
                </p>
              </section>
            );
          })}
        </div>
      </article>

      <Footer />
    </>
  );
}
