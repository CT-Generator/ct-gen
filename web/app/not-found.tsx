// 404 fallback. Locale-aware: chrome reads from the same dictionary as the rest of the site.

import Link from "next/link";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { readLocale, getDict, localizedHref } from "@/lib/i18n";

export default async function NotFound() {
  const locale = await readLocale();
  const t = getDict(locale).errors;

  return (
    <>
      <Masthead />
      <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <h1
          className="font-display text-[clamp(2.5rem,6vw,4rem)] leading-[0.96]"
          style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
        >
          {t.not_found_h1}
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
          {t.not_found_body}
        </p>
        <p className="mt-8">
          <Link
            href={localizedHref("/", locale)}
            className="font-mono uppercase tracking-[0.14em] text-[12px] underline-offset-2 underline hover:no-underline"
          >
            {t.not_found_back_home}
          </Link>
        </p>
      </article>
      <Footer />
    </>
  );
}
