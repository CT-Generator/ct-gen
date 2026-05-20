// /about — what the site is, why, and credits.
// Other than this page, names are not surfaced anywhere on the site.

import type { Metadata } from "next";
import Link from "next/link";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { Sticker } from "@/components/zine/sticker";
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

      <article className="stage">
        <Sticker tilt={-2}>{t.eyebrow}</Sticker>
        <h1 className="scream" style={{ fontSize: "var(--t-scream-lg)", margin: "14px 0 16px" }}>
          {t.h1}
        </h1>

        <div
          className="body"
          style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: "var(--t-body)", lineHeight: 1.6, maxWidth: 720 }}
        >
          <p>{t.p1}</p>
          <p>{t.p2}</p>
          <p>
            {t.p3_a}{" "}
            <Link
              href={localizedHref("/recipe", locale)}
              style={{ color: "var(--cool)", textDecoration: "underline" }}
            >
              {t.p3_recipe_link}
            </Link>
            {t.p3_b}{" "}
            <Link
              href={localizedHref("/teach", locale)}
              style={{ color: "var(--cool)", textDecoration: "underline" }}
            >
              {t.p3_teach_link}
            </Link>{" "}
            {t.p3_c}
          </p>
        </div>

        <section style={{ marginTop: 32, paddingTop: 22, borderTop: "2.5px solid var(--ink)" }}>
          <h2 className="scream" style={{ fontSize: "var(--t-scream-sm)" }}>{t.feedback_h}</h2>
          <p className="body" style={{ fontSize: "var(--t-body)", lineHeight: 1.6, marginTop: 12, maxWidth: 720 }}>
            {t.feedback_p_a}{" "}
            <a
              href="mailto:marco.meyer@jpberlin.de?subject=Conspiracy%20Generator%20%E2%80%94%20feedback"
              style={{ color: "var(--cool)", textDecoration: "underline" }}
            >
              marco.meyer@jpberlin.de
            </a>
            {t.feedback_p_period}
          </p>
        </section>

        <section style={{ marginTop: 32, paddingTop: 22, borderTop: "2.5px solid var(--ink)" }}>
          <h2 className="scream" style={{ fontSize: "var(--t-scream-sm)" }}>{t.credits_h}</h2>
          <p className="body" style={{ fontSize: "var(--t-body)", lineHeight: 1.6, marginTop: 12, maxWidth: 720 }}>
            {t.credits_p_a}{" "}
            <a
              href="https://www.linkedin.com/in/marco-meyer-10923245/"
              target="_blank"
              rel="noopener"
              style={{ color: "var(--cool)", textDecoration: "underline" }}
            >
              Marco Meyer
            </a>{" "}
            {t.credits_p_and}{" "}
            <a
              href="https://www.linkedin.com/in/maarten-boudry-6b199a8/"
              target="_blank"
              rel="noopener"
              style={{ color: "var(--cool)", textDecoration: "underline" }}
            >
              Maarten Boudry
            </a>
            {t.credits_p_inspired}{" "}
            <a
              href="https://maartenboudry.substack.com/p/the-conspiracy-generator"
              target="_blank"
              rel="noopener"
              style={{ color: "var(--cool)", textDecoration: "underline" }}
            >
              {t.credits_blog_link}
            </a>
            {t.credits_p_thanks}
          </p>
        </section>
      </article>

      <Footer />
    </>
  );
}
