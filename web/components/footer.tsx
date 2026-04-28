// Footer — minimal cross-page footer. Credits live on /about.

import Link from "next/link";
import { readLocale, getDict, localizedHref } from "@/lib/i18n";

export async function Footer() {
  const locale = await readLocale();
  const t = getDict(locale).footer;
  return (
    <footer className="rule-h-soft mt-12 sm:mt-16 lg:mt-24">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-9 text-[12px] sm:text-[13px] leading-relaxed text-ink-soft dark:text-ink-soft-dark flex flex-wrap gap-x-5 gap-y-2">
        <Link href={localizedHref("/recipe", locale)} className="hover:text-ink dark:hover:text-ink-dark">
          {t.link_recipe}
        </Link>
        <Link href={localizedHref("/teach", locale)} className="hover:text-ink dark:hover:text-ink-dark">
          {t.link_teach}
        </Link>
        <Link href={localizedHref("/about", locale)} className="hover:text-ink dark:hover:text-ink-dark">
          {t.link_about}
        </Link>
        <Link href={localizedHref("/imprint", locale)} className="hover:text-ink dark:hover:text-ink-dark">
          {t.link_imprint}
        </Link>
        <Link href={localizedHref("/privacy", locale)} className="hover:text-ink dark:hover:text-ink-dark">
          {t.link_privacy}
        </Link>
      </div>
    </footer>
  );
}
