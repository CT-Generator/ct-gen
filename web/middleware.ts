// Two responsibilities, one matcher:
//   1. /stats/* → HTTP Basic Auth gate. Username ignored; STATS_PASSWORD env is the gate.
//   2. everything else (excluding assets/api/healthz) → set x-pathname / x-referrer /
//      x-country request headers so the Node-runtime root layout can capture an
//      anonymous page-view event via after().
// Spec: openspec/changes/visitor-tracking/specs/visitor-analytics/spec.md

import { NextResponse, type NextRequest } from "next/server";

const REALM = "Conspiracy Generator stats";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/stats")) {
    return statsAuthGate(req);
  }
  return passThroughWithCaptureHeaders(req);
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

function passThroughWithCaptureHeaders(req: NextRequest) {
  // The country header name is configured in env.ts (default cf-ipcountry).
  // Read by name here without importing env() — middleware runs in the Edge
  // runtime which can't load the full env validator (DATABASE_URL, etc.).
  // Default matches env.ts default; override only used in non-default deploys.
  const countryHeaderName = process.env.GEOIP_COUNTRY_HEADER ?? "cf-ipcountry";

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  const referer = req.headers.get("referer");
  if (referer) requestHeaders.set("x-referrer", referer);
  const country = req.headers.get(countryHeaderName);
  if (country) requestHeaders.set("x-country", country);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Match every route except static assets, the API, the health check, and the
  // favicon/icon/robots.txt URLs that aren't real human page views.
  matcher: ["/((?!_next/|api/|healthz|icon\\.svg|favicon\\.ico|robots\\.txt).*)"],
};
