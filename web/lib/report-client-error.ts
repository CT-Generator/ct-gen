// Client-side reporter that POSTs an uncaught React render error to
// /api/client-errors. Best-effort: swallows all rejections, never retries,
// never throws.
// Spec: openspec/changes/client-error-reporting/specs/client-error-reporting/spec.md

type ErrorWithDigest = Error & { digest?: string };

export type ClientErrorInfo = {
  digest?: string;
};

export function reportClientError(error: unknown, info?: ClientErrorInfo): void {
  try {
    const e = (error ?? {}) as Partial<ErrorWithDigest>;
    const message = typeof e.message === "string" && e.message ? e.message : "Unknown error";
    const stack = typeof e.stack === "string" ? e.stack : undefined;
    const digest = info?.digest ?? (typeof e.digest === "string" ? e.digest : undefined);
    const path =
      typeof window !== "undefined" && window.location ? window.location.pathname : "/";
    const locale = readLocaleFromCookie();

    const body = JSON.stringify({ message, stack, digest, path, locale });

    // keepalive lets the request survive an unload/navigation that often
    // accompanies a fatal client error.
    void fetch("/api/client-errors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Network error or 5xx — drop silently. No retry.
    });
  } catch {
    // Reporter must never throw from inside an error boundary.
  }
}

function readLocaleFromCookie(): "en" | "de" {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/(?:^|;\s*)cgen_lang=([^;]+)/);
  return m?.[1] === "de" ? "de" : "en";
}
