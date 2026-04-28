// Seed data — the curated news/culprit/motive set carried over from v1.
// Source: /seed/seed.json (extracted from ct_gen/data/images_db.xlsx).
// Images live under /web/public/seed/<kind>/<uuid>.jpg.
//
// Custom inputs (typed by the user, moderation-gated) are NOT persisted here —
// they round-trip through Postgres. This file is read at build time only.

import seed from "@/data/seed.json";
import type { Locale } from "@/lib/i18n/types";

export type SeedKind = "news" | "culprits" | "motives";

export type SeedItem = {
  uuid: string;
  name: string;
  summary: string;
  /** Only on news: original source URL. */
  url?: string;
  /** Only on news: pre-generated plain-language paragraphs (~70 words each). */
  intro_paragraphs?: string[];
  /** Only on news: pre-generated conspiracist-voice opener (40-70 words). Used on /g/[id]. */
  conspiracist_intro?: string;
  /** Locale of this entry. Existing entries default to 'en'. */
  locale?: Locale;
  /** Optional explicit image filename (relative to /public/seed/<kind>/).
   * Used by entries without per-uuid images, e.g. the German pass-1 set
   * which all point to the shared `de-placeholder.svg`. */
  image_override?: string;
};

export type SeedItemWithImage = SeedItem & {
  imageUrl: string;
  kind: SeedKind;
};

const TYPED_SEED = seed as Record<SeedKind, SeedItem[]>;

function matchesLocale(item: SeedItem, locale: Locale): boolean {
  // Items with no locale field are treated as English (back-compat with the
  // pre-multilingual catalog).
  return (item.locale ?? "en") === locale;
}

function buildImageUrl(kind: SeedKind, item: SeedItem): string {
  if (item.image_override) return `/seed/${kind}/${item.image_override}`;
  return `/seed/${kind}/${item.uuid}.jpg`;
}

export function getAll(kind: SeedKind, locale: Locale = "en"): SeedItemWithImage[] {
  // All three kinds (news, culprits, motives) filter by locale so the picker on
  // /de/... shows German entries only.
  const items = TYPED_SEED[kind].filter((s) => matchesLocale(s, locale));
  return items.map((s) => ({
    ...s,
    kind,
    imageUrl: buildImageUrl(kind, s),
  }));
}

/** Deterministic shuffle so refreshes get a different sample, but a SSR'd
 * page renders consistently. The seed argument advances per-refresh.
 */
export function sampleN(
  kind: SeedKind,
  n: number,
  seedNum: number,
  locale: Locale = "en",
): SeedItemWithImage[] {
  const all = getAll(kind, locale);
  // Fisher–Yates with a cheap LCG so we don't need a crypto random in route handlers.
  const arr = [...all];
  let s = seedNum >>> 0;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr.slice(0, n);
}

export function findByUuid(kind: SeedKind, uuid: string): SeedItemWithImage | null {
  const item = TYPED_SEED[kind].find((s) => s.uuid === uuid);
  if (!item) return null;
  return { ...item, kind, imageUrl: buildImageUrl(kind, item) };
}
