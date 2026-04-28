// /about — what the site is, why, and credits.
// Other than this page, names are not surfaced anywhere on the site.

import type { Metadata } from "next";
import Link from "next/link";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { readLocale, getDict, localizedHref } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await readLocale();
  return { title: getDict(locale).meta.about_title };
}

export default async function AboutPage() {
  const locale = await readLocale();
  const t = getDict(locale).about;

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

        <div className="mt-8 space-y-5 text-[16px] leading-relaxed">
          <p>{t.p1}</p>
          <p>{t.p2}</p>
          <p>
            {t.p3_a}{" "}
            <Link href={localizedHref("/recipe", locale)} className="underline-offset-2 underline hover:no-underline">
              {t.p3_recipe_link}
            </Link>
            {t.p3_b}{" "}
            <Link href={localizedHref("/teach", locale)} className="underline-offset-2 underline hover:no-underline">
              {t.p3_teach_link}
            </Link>{" "}
            {t.p3_c}
          </p>
        </div>

        <div className="mt-12 rule-h pt-6">
          <h2 className="font-display text-[22px] sm:text-[24px]" style={{ fontWeight: 600 }}>
            {t.feedback_h}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed">
            {t.feedback_p_a}{" "}
            <a
              href="mailto:marco.meyer@jpberlin.de?subject=Conspiracy%20Generator%20%E2%80%94%20feedback"
              className="underline-offset-2 underline hover:no-underline"
            >
              marco.meyer@jpberlin.de
            </a>
            {t.feedback_p_period}
          </p>
        </div>

        <div className="mt-10 rule-h pt-6">
          <h2 className="font-display text-[22px] sm:text-[24px]" style={{ fontWeight: 600 }}>
            {t.credits_h}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed">
            {t.credits_p_a}{" "}
            <a
              href="https://www.linkedin.com/in/marco-meyer-10923245/"
              target="_blank"
              rel="noopener"
              className="underline-offset-2 underline hover:no-underline"
            >
              Marco Meyer
            </a>{" "}
            {t.credits_p_and}{" "}
            <a
              href="https://www.linkedin.com/in/maarten-boudry-6b199a8/"
              target="_blank"
              rel="noopener"
              className="underline-offset-2 underline hover:no-underline"
            >
              Maarten Boudry
            </a>
            {t.credits_p_inspired}{" "}
            <a
              href="https://maartenboudry.substack.com/p/the-conspiracy-generator"
              target="_blank"
              rel="noopener"
              className="underline-offset-2 underline hover:no-underline"
            >
              {t.credits_blog_link}
            </a>
            {t.credits_p_thanks}
          </p>
        </div>
      </article>

      <Footer />
    </>
  );
}
