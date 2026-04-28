// Footer — minimal cross-page footer. Credits live on /about.

import Link from "next/link";

export function Footer() {
  return (
    <footer className="rule-h-soft mt-12 sm:mt-16 lg:mt-24">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-9 text-[12px] sm:text-[13px] leading-relaxed text-ink-soft dark:text-ink-soft-dark flex flex-wrap gap-x-5 gap-y-2">
        <Link href="/recipe" className="hover:text-ink dark:hover:text-ink-dark">
          The recipe
        </Link>
        <Link href="/teach" className="hover:text-ink dark:hover:text-ink-dark">
          For teachers
        </Link>
        <Link href="/about" className="hover:text-ink dark:hover:text-ink-dark">
          About &amp; credits
        </Link>
        <Link href="/imprint" className="hover:text-ink dark:hover:text-ink-dark">
          Imprint
        </Link>
        <Link href="/privacy" className="hover:text-ink dark:hover:text-ink-dark">
          Privacy
        </Link>
      </div>
    </footer>
  );
}
