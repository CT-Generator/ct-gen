// Anonymous session identity — server-side salted hash, no PII.
// Spec: openspec/changes/v2-rebuild/specs/permalinks-and-sharing/spec.md
//   (Anonymous-by-default identity)

import { cookies, headers } from "next/headers";
import { createHash } from "node:crypto";
import { env } from "@/lib/env";

const COOKIE_NAME = "cgen_sid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Derive a stable session hash for the current request.
 *
 * If the user has set the cookie (first-visit or claim flow), use that.
 * Otherwise compute a salted hash of (coarse-IP-bucket || UA || day) and set it.
 *
 * Cookie-setting is only allowed from Server Actions / Route Handlers — call
 * `readSessionHash()` instead from a Server Component (e.g. a layout).
 */
export async function getOrIssueSessionHash(): Promise<string> {
  const c = await cookies();
  const existing = c.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  const hash = await deriveSessionHash();

  c.set(COOKIE_NAME, hash, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return hash;
}

/**
 * Read-only counterpart for use in Server Components (layouts, pages) where
 * cookie mutation is forbidden. If the cookie exists, return its value; else
 * derive the deterministic hash for this (IP-bucket || UA || day) request and
 * return it WITHOUT persisting. Two requests from the same visitor on the same
 * day will get the same hash even without the cookie, because the inputs are
 * stable.
 */
export async function readSessionHash(): Promise<string> {
  const c = await cookies();
  const existing = c.get(COOKIE_NAME)?.value;
  if (existing) return existing;
  return deriveSessionHash();
}

async function deriveSessionHash(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "0.0.0.0";
  const ipBucket = coarseIpBucket(fwd);
  const ua = h.get("user-agent") ?? "unknown";
  const day = new Date().toISOString().slice(0, 10);

  return createHash("sha256")
    .update(env().SESSION_HASH_SALT)
    .update("\u001f")
    .update(ipBucket)
    .update("\u001f")
    .update(ua)
    .update("\u001f")
    .update(day)
    .digest("hex")
    .slice(0, 24);
}

/** Aggregate the IP into a /24 bucket so a school behind a single NAT shares
 * the same bucket without exposing individual addresses. */
function coarseIpBucket(addrField: string): string {
  const first = addrField.split(",")[0]!.trim();
  const v4 = first.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/);
  if (v4) return `${v4[1]}.0/24`;
  // IPv6 — bucket on the /64 prefix
  const v6 = first.match(/^([0-9a-f:]+)$/i);
  if (v6) {
    const parts = first.split(":").slice(0, 4);
    return `${parts.join(":")}::/64`;
  }
  return first;
}
