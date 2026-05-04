// Capture pipeline for uncaught client-side React render errors.
// Spec: openspec/changes/client-error-reporting/specs/client-error-reporting/spec.md

import type { NextRequest } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { readSessionHash } from "@/lib/session";

export const MAX_BODY_BYTES = 4096;
export const MAX_STACK_BYTES = 4096;
const TRUNCATION_MARKER = "...[truncated]";

const RATE_LIMIT_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

export const clientErrorBodySchema = z.object({
  message: z.string().min(1).max(2_000),
  stack: z.string().max(8_192).optional(),
  digest: z.string().max(128).optional(),
  path: z.string().min(1).max(2_048),
  locale: z.enum(["en", "de"]),
});

export type ClientErrorPayload = z.infer<typeof clientErrorBodySchema>;

export type RecordResult =
  | { ok: true }
  | { ok: false; reason: "too_large" | "invalid" | "rate_limited" };

const MOBILE_RE = /iPhone|iPad|iPod|Android.*Mobile|Windows Phone|webOS|BlackBerry/i;
const ISO2_RE = /^[A-Z]{2}$/;

// Process-local rolling-window rate-limit. Best-effort: a different worker
// process won't see these counters. Acceptable — this is a flood guard, not
// a security boundary.
const rateBuckets = new Map<string, number[]>();

export async function recordClientError(
  req: NextRequest,
  rawBody: string,
): Promise<RecordResult> {
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return { ok: false, reason: "too_large" };
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return { ok: false, reason: "invalid" };
  }
  const parsed = clientErrorBodySchema.safeParse(json);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const payload = parsed.data;

  const sessionHash = await readSessionHash();
  if (!checkRateLimit(sessionHash)) {
    return { ok: false, reason: "rate_limited" };
  }

  const ua = req.headers.get("user-agent") ?? "";
  const deviceClass = MOBILE_RE.test(ua) ? "mobile" : "desktop";
  const referrerHost = parseReferrerHost(req.headers.get("referer"));
  const country = parseCountry(req.headers.get(env().GEOIP_COUNTRY_HEADER));
  const stack = payload.stack ? truncateStack(payload.stack) : null;

  await db().insert(schema.clientErrors).values({
    path: payload.path,
    locale: payload.locale,
    message: payload.message,
    stack,
    digest: payload.digest ?? null,
    referrerHost,
    deviceClass,
    country,
    sessionHash,
  });

  return { ok: true };
}

function checkRateLimit(sessionHash: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const fresh = (rateBuckets.get(sessionHash) ?? []).filter((t) => t > cutoff);
  if (fresh.length >= RATE_LIMIT_PER_MINUTE) {
    rateBuckets.set(sessionHash, fresh);
    return false;
  }
  fresh.push(now);
  rateBuckets.set(sessionHash, fresh);
  return true;
}

function truncateStack(stack: string): string {
  if (Buffer.byteLength(stack, "utf8") <= MAX_STACK_BYTES) return stack;
  const markerBytes = Buffer.byteLength(TRUNCATION_MARKER, "utf8");
  const budget = MAX_STACK_BYTES - markerBytes;
  let out = "";
  let used = 0;
  // Walk char-by-char so a multi-byte UTF-8 codepoint is never split.
  for (const ch of stack) {
    const cb = Buffer.byteLength(ch, "utf8");
    if (used + cb > budget) break;
    out += ch;
    used += cb;
  }
  return out + TRUNCATION_MARKER;
}

function parseReferrerHost(referer: string | null): string | null {
  if (!referer) return null;
  let host: string;
  try {
    host = new URL(referer).host.toLowerCase();
  } catch {
    return null;
  }
  if (!host) return null;
  let ownHost: string;
  try {
    ownHost = new URL(env().PUBLIC_BASE_URL).host.toLowerCase();
  } catch {
    ownHost = "";
  }
  if (ownHost && host === ownHost) return null;
  return host;
}

function parseCountry(raw: string | null): string | null {
  if (!raw) return null;
  const v = raw.trim().toUpperCase();
  return ISO2_RE.test(v) ? v : null;
}
