// Seed data — the curated news/culprit/motive set carried over from v1.
// Source: /seed/seed.json (extracted from ct_gen/data/images_db.xlsx).
// Images live under /web/public/seed/<kind>/<uuid>.jpg.
//
// Custom inputs (typed by the user, moderation-gated) are NOT persisted here —
// they round-trip through Postgres. This file is read at build time only.

import seed from "@/data/seed.json";

export type SeedKind = "news" | "culprits" | "motives";

export type SeedItem = {
  uuid: string;
  name: string;
  summary: string;
  /** Only on news: original source URL. */
  url?: string;
  /** Only on news: pre-generated plain-English paragraphs (~70 words each). */
  intro_paragraphs?: string[];
  /** Only on news: pre-generated conspiracist-voice opener (40-70 words). Used on /g/[id]. */
  conspiracist_intro?: string;
};

export type SeedItemWithImage = SeedItem & {
  imageUrl: string;
  kind: SeedKind;
};

const TYPED_SEED = seed as Record<SeedKind, SeedItem[]>;

export function getAll(kind: SeedKind): SeedItemWithImage[] {
  return TYPED_SEED[kind].map((s) => ({
    ...s,
    kind,
    imageUrl: `/seed/${kind}/${s.uuid}.jpg`,
  }));
}

/** Deterministic shuffle so refreshes get a different sample, but a SSR'd
 * page renders consistently. The seed argument advances per-refresh.
 */
export function sampleN(kind: SeedKind, n: number, seedNum: number): SeedItemWithImage[] {
  const all = getAll(kind);
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
  return { ...item, kind, imageUrl: `/seed/${kind}/${item.uuid}.jpg` };
}
