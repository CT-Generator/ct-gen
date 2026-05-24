// Content locale: the language of a page's *body content* (paragraphs, H1)
// as opposed to its chrome (masthead, nav). On row-driven pages (`/g/[id]`,
// `/story/[uuid]`, `/build/[id]`) these can diverge — the visitor's chrome
// locale follows their cookie, while the content stays in the row's locale.
//
// The root layout uses this helper to set `<html lang>` to match the *content*
// language (so assistive tech announces the body correctly), even when chrome
// is in a different language. See:
//   openspec/changes/sticky-language-selection/specs/internationalization/spec.md
//
// Both this helper and the page that owns the row look up the same row; the
// `cache()` wrapper dedupes the DB call per request.

import { cache } from "react";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { findByUuid } from "@/lib/seed";
import { isLocale, type Locale } from "./types";

/** Cached per-request lookup of a generation row's persisted locale. */
export const getGenerationRowLocale = cache(
  async (shortId: string): Promise<Locale | null> => {
    const rows = await db()
      .select({ locale: schema.generations.locale })
      .from(schema.generations)
      .where(eq(schema.generations.shortId, shortId))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return isLocale(row.locale) ? row.locale : "en";
  },
);

/** Seed events are in-memory; sync lookup. */
export function getStorySeedLocale(uuid: string): Locale | null {
  const event = findByUuid("news", uuid);
  if (!event) return null;
  return isLocale(event.locale) ? event.locale : "en";
}

/**
 * Resolve the content locale for the current request from its un-prefixed path.
 * Returns null when the path is not a row-driven page — the caller should
 * fall back to the chrome locale in that case.
 */
export async function resolveContentLocaleFromPath(
  unprefixedPath: string,
): Promise<Locale | null> {
  const gMatch = unprefixedPath.match(/^\/g\/([^/]+)\/?$/);
  if (gMatch) return await getGenerationRowLocale(gMatch[1]!);

  const storyMatch = unprefixedPath.match(/^\/story\/([^/]+)\/?$/);
  if (storyMatch) return getStorySeedLocale(storyMatch[1]!);

  const buildMatch = unprefixedPath.match(/^\/build\/([^/]+)\/?$/);
  if (buildMatch) return await getGenerationRowLocale(buildMatch[1]!);

  return null;
}
