// HTTP Basic Auth gate for /stats/*.
// Username is ignored; the password env (STATS_PASSWORD) is what matters.

import { NextResponse, type NextRequest } from "next/server";

const REALM = "Conspiracy Generator stats";

export function middleware(req: NextRequest) {
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

  // Username is ignored but echo it via a header for log-trace convenience.
  const res = NextResponse.next();
  if (user) res.headers.set("x-stats-user", user.slice(0, 32));
  return res;
}

export const config = {
  // The web-vitals static-analysis edge runtime needs a literal matcher.
  matcher: ["/stats/:path*"],
};
