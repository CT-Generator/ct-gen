// Segment-level React error boundary.
// Spec: openspec/changes/client-error-reporting/specs/client-error-reporting/spec.md

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportClientError } from "@/lib/report-client-error";
import { en, type Dictionary } from "@/lib/i18n/en";
import { de } from "@/lib/i18n/de";
import { nl } from "@/lib/i18n/nl";

type Locale = "en" | "de" | "nl";

// Record<Locale, Dictionary> — ensures every locale has its own dictionary
// (no English fallback for non-English locales).
const DICTS: Record<Locale, Dictionary> = { en, de, nl };

type ErrorWithDigest = Error & { digest?: string };

export default function SegmentError({
  error,
  reset,
}: {
  error: ErrorWithDigest;
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error, { digest: error.digest });
  }, [error]);

  const locale = readLocaleFromCookie();
  const t = DICTS[locale].errors;
  const homeHref = locale === "en" ? "/" : `/${locale}`;

  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <h1
        className="font-display text-[clamp(2.5rem,6vw,4rem)] leading-[0.96]"
        style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
      >
        {t.client_error_h1}
      </h1>
      <p className="mt-4 text-[16px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
        {t.client_error_body}
      </p>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
        <button
          type="button"
          onClick={() => reset()}
          className="font-mono uppercase tracking-[0.14em] text-[12px] underline-offset-2 underline hover:no-underline"
        >
          {t.client_error_try_again}
        </button>
        <Link
          href={homeHref}
          className="font-mono uppercase tracking-[0.14em] text-[12px] underline-offset-2 underline hover:no-underline"
        >
          {t.not_found_back_home}
        </Link>
      </div>
    </article>
  );
}

function readLocaleFromCookie(): Locale {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/(?:^|;\s*)cgen_lang=([^;]+)/);
  const v = m?.[1];
  return v === "de" || v === "nl" ? v : "en";
}
