// Anonymous server-side page-view capture.
// Spec: openspec/changes/visitor-tracking/specs/visitor-analytics/spec.md

import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";

export type PageViewEvent = {
  sessionHash: string;
  path: string;
  userAgent: string | null;
  referer: string | null;
  countryHeader: string | null;
};

// Known crawlers + obvious headless tooling. Anything matching is dropped
// before insert. Case-insensitive. Generic words (`bot`, `crawler`, `spider`)
// are last-line catch-alls for the long tail.
const BOT_RE =
  /Googlebot|Bingbot|Yandex|Baiduspider|DuckDuckBot|AhrefsBot|SemrushBot|MJ12bot|DotBot|PetalBot|Bytespider|GPTBot|ClaudeBot|Applebot|FacebookBot|TwitterBot|LinkedInBot|Slurp|Slackbot|Discordbot|TelegramBot|UptimeRobot|HeadlessChrome|crawler|spider|bot/i;

const MOBILE_RE = /iPhone|iPad|iPod|Android.*Mobile|Windows Phone|webOS|BlackBerry/i;

const ISO2_RE = /^[A-Z]{2}$/;

/**
 * Best-effort, fire-and-forget. Errors are swallowed: analytics must never
 * affect the user-facing response.
 */
export async function recordPageView(ev: PageViewEvent): Promise<void> {
  try {
    console.log("[tracking] recordPageView fired path=", ev.path);
    const ua = ev.userAgent ?? "";
    if (BOT_RE.test(ua)) {
      console.log("[tracking] bot filtered ua=", ua.slice(0, 60));
      return;
    }

    const deviceClass = MOBILE_RE.test(ua) ? "mobile" : "desktop";
    const referrerHost = parseReferrerHost(ev.referer);
    const country = parseCountry(ev.countryHeader);

    await db().insert(schema.pageViews).values({
      sessionHash: ev.sessionHash,
      path: ev.path,
      referrerHost,
      deviceClass,
      country,
    });
    console.log("[tracking] inserted path=", ev.path);
  } catch (err) {
    console.warn("[tracking] recordPageView failed:", err);
  }
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
  // Drop same-origin so the top-referrers chart is about external traffic.
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
