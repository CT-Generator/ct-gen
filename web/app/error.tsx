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
    <article className="stage">
      <span
        className="sticker"
        style={{ ["--tilt" as string]: "-3deg" }}
      >
        Error
      </span>
      <h1
        className="scream"
        style={{ fontSize: "var(--t-scream-xl)", margin: "14px 0 16px" }}
      >
        {t.client_error_h1}
      </h1>
      <p
        className="body"
        style={{ fontSize: "var(--t-body-lg)", lineHeight: 1.55, maxWidth: 640 }}
      >
        {t.client_error_body}
      </p>
      <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 14 }}>
        <button
          type="button"
          onClick={() => reset()}
          className="zine-btn"
          data-size="md"
          style={{
            background: "var(--hot)",
            color: "var(--paper)",
            border: "3px solid var(--ink)",
            boxShadow: "var(--shadow)",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(18px, 1.8vw, 22px)",
            padding: "11px 20px 9px",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            cursor: "pointer",
            minHeight: 44,
            whiteSpace: "nowrap",
          }}
        >
          ↻ {t.client_error_try_again}
        </button>
        <Link
          href={homeHref}
          className="zine-btn"
          data-size="sm"
          style={{
            background: "transparent",
            color: "var(--ink)",
            border: "3px solid var(--ink)",
            boxShadow: "4px 4px 0 var(--ink)",
            fontFamily: "var(--font-display)",
            fontSize: 14,
            padding: "8px 14px 6px",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            textDecoration: "none",
            minHeight: 44,
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          ← {t.not_found_back_home}
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
