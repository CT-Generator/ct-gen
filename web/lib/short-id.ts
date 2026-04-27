// Deterministic short-ID derivation for permalinks.
// v2-rebuild Decision 8: same inputs + same model + same recipe version
// → same short-ID. The DB has a unique constraint on this column so identical
// triples don't duplicate generations across users.

import { createHash } from "node:crypto";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // base32 minus visually-confusing characters
const LENGTH = 10;

export function shortIdFor(input: {
  event: string;
  culprit: string;
  motive: string;
  modelVersion: string;
  recipeVersion: string;
}): string {
  const canonical = [
    normalize(input.event),
    normalize(input.culprit),
    normalize(input.motive),
    input.modelVersion,
    input.recipeVersion,
  ].join("\u001f"); // unit separator

  const hash = createHash("sha256").update(canonical).digest();
  let out = "";
  for (let i = 0; out.length < LENGTH; i++) {
    out += ALPHABET[hash[i % hash.length]! % ALPHABET.length];
  }
  return out;
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}
