// Three responsibilities, one matcher:
//   1. Locale negotiation — every non-excluded request gets `x-locale: en|de|nl`. The
//      /<locale>/<rest> URL prefix triggers an internal rewrite to /<rest> so the same
//      Next.js page file renders, but the URL bar stays /<locale>/<rest>.
//   2. /stats/* → HTTP Basic Auth gate. Username ignored; STATS_PASSWORD env is the gate.
//   3. Everything else → set x-pathname / x-referrer / x-country request headers so the
//      Node-runtime root layout can capture an anonymous page-view event after the response.
// Specs:
//   - openspec/changes/visitor-tracking/specs/visitor-analytics/spec.md
//   - openspec/changes/multilingual-german/specs/internationalization/spec.md
//   - openspec/changes/multilingual-dutch/specs/internationalization/spec.md

import { NextResponse, type NextRequest } from "next/server";

const REALM = "Conspiracy Generator stats";
const COOKIE_NAME = "cgen_lang";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type Locale = "en" | "de" | "nl";
const SUPPORTED: readonly Locale[] = ["en", "de", "nl"];
// Locales that have a URL prefix. English is un-prefixed (default).
const PREFIXED_LOCALES: readonly Exclude<Locale, "en">[] = ["de", "nl"];

export function middleware(req: NextRequest) {
  const original = req.nextUrl.pathname;

  // ── Locale resolution ──────────────────────────────────────────────────
  // Step 1: split off the /<locale>/ prefix (if any) into a normalized path
  // the app sees, plus the locale we should attribute the request to.
  const explicitPrefix = detectPrefix(original);
  const unprefixedPath = explicitPrefix
    ? original === `/${explicitPrefix}`
      ? "/"
      : original.slice(explicitPrefix.length + 1) // strip "/de" or "/nl"
    : original;

  // Step 2: cookie + Accept-Language for visitors who haven't pinned a prefix.
  const cookieLocale = parseLocale(req.cookies.get(COOKIE_NAME)?.value);
  const acceptLocale = parseLocale(parseAcceptLanguage(req.headers.get("accept-language")));

  // Permalinks bypass first-visit redirect — they should render in the locale
  // the row was generated in, not the visitor's preferred locale.
  const isPermalink =
    unprefixedPath.startsWith("/g/") ||
    unprefixedPath === "/g" ||
    unprefixedPath.startsWith("/story/") ||
    unprefixedPath === "/story";

  // First-visit redirect: no cookie, no explicit prefix, AL prefers a non-English
  // supported locale → /<locale>/...
  if (
    !cookieLocale &&
    !explicitPrefix &&
    !isPermalink &&
    acceptLocale &&
    acceptLocale !== "en"
  ) {
    const target = req.nextUrl.clone();
    target.pathname = original === "/" ? `/${acceptLocale}` : `/${acceptLocale}${original}`;
    const res = NextResponse.redirect(target, 302);
    setLangCookie(res, acceptLocale);
    return res;
  }

  // Resolve final locale.
  const locale: Locale = explicitPrefix ?? cookieLocale ?? acceptLocale ?? "en";

  // Pass on un-prefixed path to /stats handler / tracking layer.
  if (unprefixedPath.startsWith("/stats")) {
    const res = statsAuthGate(req);
    if (locale !== cookieLocale) setLangCookie(res, locale);
    return res;
  }

  // ── Build the response ────────────────────────────────────────────────
  // If the URL bar is /<locale>/<rest>, internally rewrite to /<rest> so the
  // existing Next.js page file (e.g. app/recipe/page.tsx) renders. The
  // browser's URL bar stays /<locale>/<rest>; only the file-system route changes.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-locale", locale);
  requestHeaders.set("x-pathname", unprefixedPath);
  const referer = req.headers.get("referer");
  if (referer) requestHeaders.set("x-referrer", referer);
  const countryHeaderName = process.env.GEOIP_COUNTRY_HEADER ?? "cf-ipcountry";
  const country = req.headers.get(countryHeaderName);
  if (country) requestHeaders.set("x-country", country);

  let res: NextResponse;
  if (explicitPrefix) {
    const rewritten = req.nextUrl.clone();
    rewritten.pathname = unprefixedPath;
    res = NextResponse.rewrite(rewritten, { request: { headers: requestHeaders } });
  } else {
    res = NextResponse.next({ request: { headers: requestHeaders } });
  }
  if (locale !== cookieLocale) setLangCookie(res, locale);
  return res;
}

function detectPrefix(path: string): "de" | "nl" | null {
  for (const p of PREFIXED_LOCALES) {
    if (path === `/${p}` || path.startsWith(`/${p}/`)) return p;
  }
  return null;
}

function parseLocale(raw: string | null | undefined): Locale | null {
  if (raw === "en" || raw === "de" || raw === "nl") return raw;
  return null;
}

function parseAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  // Pick the highest-priority entry that matches a supported locale.
  // Header format: "de-DE,de;q=0.9,en;q=0.5". Take the first language tag
  // whose primary subtag matches one of our supported locales.
  const tags = header
    .split(",")
    .map((x) => x.trim().split(";")[0]!.trim().toLowerCase());
  for (const tag of tags) {
    const primary = tag.split("-")[0];
    if (primary === "de" || primary === "en" || primary === "nl") return primary;
  }
  return null;
}

function setLangCookie(res: NextResponse, locale: Locale) {
  res.cookies.set(COOKIE_NAME, locale, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

function statsAuthGate(req: NextRequest) {
  const password = process.env.STATS_PASSWORD;
  if (!password) {
    return new NextResponse("STATS_PASSWORD not configured on the server.", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) {
    return new NextResponse("Authentication required.", {
      status: 401,
      headers: {
        "WWW-Authenticate": `Basic realm="${REALM}"`,
        "Content-Type": "text/plain",
      },
    });
  }

  let user = "", pass = "";
  try {
    const decoded = atob(auth.slice(6));
    const idx = decoded.indexOf(":");
    user = decoded.slice(0, idx);
    pass = decoded.slice(idx + 1);
  } catch {
    return new NextResponse("Malformed credentials.", { status: 400 });
  }

  if (pass !== password) {
    return new NextResponse("Wrong password.", {
      status: 401,
      headers: {
        "WWW-Authenticate": `Basic realm="${REALM}"`,
        "Content-Type": "text/plain",
      },
    });
  }

  const res = NextResponse.next();
  if (user) res.headers.set("x-stats-user", user.slice(0, 32));
  return res;
}

// Match every route except static assets, the API, the health check, and the
// favicon/icon/robots.txt URLs that aren't real human page views.
export const config = {
  matcher: ["/((?!_next/|api/|healthz|icon\\.svg|favicon\\.ico|robots\\.txt).*)"],
};

// Suppress "unused locale union" warning for the const list (kept exported via type system only).
void SUPPORTED;
