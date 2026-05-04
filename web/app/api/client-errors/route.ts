// POST /api/client-errors — accept one client-side React render-error report
// from the global-error / segment error boundaries.
// Spec: openspec/changes/client-error-reporting/specs/client-error-reporting/spec.md
//
// Always responds 200. Never 4xx, never 5xx — the boundary's reporter must
// never trigger client-side retries or surface an error during error handling.

import { NextResponse, type NextRequest } from "next/server";
import { recordClientError, MAX_BODY_BYTES } from "@/lib/client-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Fast pre-check via Content-Length — saves us from buffering an oversized
  // body. The header can lie, so the lib re-checks the actual byte length.
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, reason: "too_large" });
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid" });
  }

  try {
    const result = await recordClientError(req, raw);
    return NextResponse.json(result);
  } catch (err) {
    // DB insert failed or some other unexpected throw. Don't propagate — the
    // client must not retry on our errors. Log in dev for visibility.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[client-errors] insert failed:", err);
    }
    return NextResponse.json({ ok: false, reason: "invalid" });
  }
}
