// Root error boundary. Replaces the root layout when the layout itself
// throws, so this file owns the full <html><body> shell.
// Spec: openspec/changes/client-error-reporting/specs/client-error-reporting/spec.md

"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/report-client-error";
import { en, type Dictionary } from "@/lib/i18n/en";
import { de } from "@/lib/i18n/de";
import { nl } from "@/lib/i18n/nl";

type Locale = "en" | "de" | "nl";

const DICTS: Record<Locale, Dictionary> = { en, de, nl };

type ErrorWithDigest = Error & { digest?: string };

export default function GlobalError({
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
    <html lang={locale}>
      <body
        style={{
          margin: 0,
          fontFamily:
            "Inter Tight, system-ui, -apple-system, Segoe UI, sans-serif",
          background: "#F6F2EA",
          color: "#1B1A1F",
        }}
      >
        <main
          style={{
            maxWidth: "42rem",
            margin: "0 auto",
            padding: "4rem 1rem",
          }}
        >
          <h1
            style={{
              fontFamily: "Fraunces, Georgia, serif",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              lineHeight: 0.96,
              fontWeight: 600,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            {t.client_error_h1}
          </h1>
          <p
            style={{
              marginTop: "1rem",
              fontSize: "16px",
              lineHeight: 1.6,
              opacity: 0.78,
            }}
          >
            {t.client_error_body}
          </p>
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem 1.5rem",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                fontFamily: "JetBrains Mono, ui-monospace, monospace",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontSize: "12px",
                textDecoration: "underline",
                color: "inherit",
                background: "transparent",
                border: 0,
                padding: 0,
                cursor: "pointer",
              }}
            >
              {t.client_error_try_again}
            </button>
            <a
              href={homeHref}
              style={{
                fontFamily: "JetBrains Mono, ui-monospace, monospace",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontSize: "12px",
                textDecoration: "underline",
                color: "inherit",
              }}
            >
              {t.not_found_back_home}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}

function readLocaleFromCookie(): Locale {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/(?:^|;\s*)cgen_lang=([^;]+)/);
  const v = m?.[1];
  return v === "de" || v === "nl" ? v : "en";
}
