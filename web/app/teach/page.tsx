// /teach — lesson plan for educators.
// Mainly website content. The "Save as PDF" button triggers window.print();
// the print stylesheet keeps things readable on paper.

import type { Metadata } from "next";
import Link from "next/link";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { PrintButton } from "@/components/print-button";
import { readLocale, getDict, localizedHref } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await readLocale();
  return { title: getDict(locale).meta.teach_title };
}

export default async function TeachPage() {
  const locale = await readLocale();
  const t = getDict(locale).teach;

  const PROMPTS = [t.prompt_1, t.prompt_2, t.prompt_3, t.prompt_4, t.prompt_5, t.prompt_6];

  return (
    <>
      <Masthead />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16 print:py-6 print:px-0">
        <div className="flex items-start justify-between gap-4 print:hidden">
          <p className="meta">{t.eyebrow}</p>
          <PrintButton label={t.print_button} />
        </div>
        <h1
          className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] print:text-[28pt]"
          style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
        >
          {t.h1}
        </h1>

        <p className="mt-6 text-[16px] leading-relaxed print:text-[11pt]">
          {t.intro}
        </p>

        {t.pdf_de_warning && (
          <p className="mt-3 text-[13.5px] italic text-ink-soft dark:text-ink-soft-dark print:hidden">
            {t.pdf_de_warning}
          </p>
        )}

        {/* Why */}
        <section className="mt-10">
          <h2 className="font-display text-[22px] sm:text-[24px] print:text-[16pt]" style={{ fontWeight: 600 }}>
            {t.why_h}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed">{t.why_p1}</p>
          <p className="mt-3 text-[15px] leading-relaxed">
            {t.why_p2_a}{" "}
            <Link href={localizedHref("/recipe", locale)} className="underline-offset-2 underline hover:no-underline">
              {t.why_p2_link}
            </Link>{" "}
            {t.why_p2_b}
          </p>
        </section>

        {/* The 15-minute plan */}
        <section className="mt-10">
          <h2 className="font-display text-[22px] sm:text-[24px] print:text-[16pt]" style={{ fontWeight: 600 }}>
            {t.plan_h}
          </h2>

          <div className="mt-4 space-y-5">
            <PlanStep minutes={t.step1_minutes} title={t.step1_title} body={t.step1_body} minutesSuffix={t.minutes_suffix} />
            <PlanStep minutes={t.step2_minutes} title={t.step2_title} body={t.step2_body} minutesSuffix={t.minutes_suffix} />
            <PlanStep minutes={t.step3_minutes} title={t.step3_title} body={t.step3_body} minutesSuffix={t.minutes_suffix} />
            <PlanStep minutes={t.step4_minutes} title={t.step4_title} body={t.step4_body} minutesSuffix={t.minutes_suffix} />
          </div>
        </section>

        {/* Discussion prompts */}
        <section className="mt-10">
          <h2 className="font-display text-[22px] sm:text-[24px] print:text-[16pt]" style={{ fontWeight: 600 }}>
            {t.prompts_h}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
            {t.prompts_intro}
          </p>
          <ol className="mt-4 space-y-3 text-[15px] leading-relaxed list-decimal list-inside marker:text-ink-soft marker:dark:text-ink-soft-dark">
            {PROMPTS.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </section>

        {/* Learning outcomes */}
        <section className="mt-10">
          <h2 className="font-display text-[22px] sm:text-[24px] print:text-[16pt]" style={{ fontWeight: 600 }}>
            {t.outcomes_h}
          </h2>
          <ul className="mt-3 space-y-2 text-[15px] leading-relaxed list-disc list-inside marker:text-ink-soft marker:dark:text-ink-soft-dark">
            <li>{t.outcome_1}</li>
            <li>{t.outcome_2}</li>
            <li>{t.outcome_3}</li>
            <li>{t.outcome_4}</li>
          </ul>
        </section>

        {/* Footer note for teachers */}
        <section className="mt-10 rule-h pt-6">
          <p className="text-[14px] italic text-ink-soft dark:text-ink-soft-dark">
            {t.teach_footer_a}{" "}
            <a
              href="mailto:marco.meyer@jpberlin.de?subject=Conspiracy%20Generator%20%E2%80%94%20classroom%20use"
              className="underline-offset-2 underline not-italic"
            >
              {t.teach_footer_link}
            </a>
            {t.teach_footer_period}
          </p>
        </section>
      </article>

      <Footer />
    </>
  );
}

function PlanStep({
  minutes,
  title,
  body,
  minutesSuffix,
}: {
  minutes: string;
  title: string;
  body: string;
  minutesSuffix: string;
}) {
  return (
    <div className="grid grid-cols-[64px_1fr] sm:grid-cols-[88px_1fr] gap-3 sm:gap-5">
      <div className="meta pt-1 print:text-[10pt]">{minutes} {minutesSuffix}</div>
      <div>
        <h3 className="font-display text-[18px] sm:text-[19px] print:text-[13pt]" style={{ fontWeight: 600 }}>
          {title}
        </h3>
        <p className="mt-1.5 text-[14.5px] leading-relaxed print:text-[11pt]">{body}</p>
      </div>
    </div>
  );
}
