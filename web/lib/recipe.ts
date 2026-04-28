// The four-move recipe + structured-output schemas for the stepwise wizard.

import type { Locale } from "@/lib/i18n/types";

export type MoveKey = "anomaly" | "connection" | "dismiss" | "discredit";

export type Move = {
  n: "01" | "02" | "03" | "04";
  key: MoveKey;
  title: string;
  sub: string;
  /** Short caps phrase naming the move's tell — used in the inline stamp on /g/[id]. */
  tell: string;
  /** Move accent — used for chips, glyphs, theory-column left border (oklch for in-browser). */
  color: string;
  /** ~8% tint of the accent — used for background fills under theory body. */
  soft: string;
  /** Hex equivalents for environments that don't grok oklch (Satori → next/og). */
  colorHex: string;
  softHex: string;
};

// Visual properties (colors, n, key) are locale-invariant. Title, sub, tell
// vary by locale. We define the visual base once, then a per-locale label map.
type MoveVisual = Pick<Move, "n" | "key" | "color" | "soft" | "colorHex" | "softHex">;

const MOVE_VISUALS: MoveVisual[] = [
  { n: "01", key: "anomaly",    color: "oklch(56% 0.14 28)",  soft: "oklch(92% 0.04 28)",  colorHex: "#A04A3C", softHex: "#F2DDD5" },
  { n: "02", key: "connection", color: "oklch(56% 0.14 130)", soft: "oklch(92% 0.04 130)", colorHex: "#5C7339", softHex: "#E0E8D2" },
  { n: "03", key: "dismiss",    color: "oklch(56% 0.14 230)", soft: "oklch(92% 0.04 230)", colorHex: "#3A6E97", softHex: "#D6E2EC" },
  { n: "04", key: "discredit",  color: "oklch(56% 0.14 70)",  soft: "oklch(92% 0.04 70)",  colorHex: "#876133", softHex: "#EBE2D0" },
];

type MoveLabels = { title: string; sub: string; tell: string };

const LABELS_BY_LOCALE: Record<Locale, Record<MoveKey, MoveLabels>> = {
  en: {
    anomaly:    { title: "Hunt anomalies",            sub: "Turn coincidence into evidence of a secret plot.",      tell: "BASE RATES"     },
    connection: { title: "Fabricate connections",     sub: "Draw lines between unrelated dots until they look meaningful.", tell: "SIX DEGREES"   },
    dismiss:    { title: "Dismiss counter-evidence",  sub: "If a fact disagrees, make the fact part of the cover-up.",      tell: "UNFALSIFIABLE" },
    discredit:  { title: "Discredit the critics",     sub: "Dismiss people who point out flaws in your theory.",            tell: "AD HOMINEM"    },
  },
  // German pass-1 (literal) — to be workshopped in pass 2 per spec.
  de: {
    anomaly:    { title: "Auffälligkeiten suchen",        sub: "Mach aus Zufall Beweis für einen geheimen Plan.",                tell: "AUSGANGSWAHRSCHEINLICHKEIT" },
    connection: { title: "Verbindungen erfinden",         sub: "Zieh Linien zwischen unzusammenhängenden Punkten, bis sie bedeutsam wirken.", tell: "SECHS GRADE DER TRENNUNG" },
    dismiss:    { title: "Gegenbeweise abwehren",         sub: "Wenn ein Fakt widerspricht, mach ihn zum Teil der Vertuschung.",  tell: "UNFALSIFIZIERBAR" },
    discredit:  { title: "Kritiker:innen diskreditieren", sub: "Weise Menschen ab, die Schwächen deiner Theorie zeigen.",         tell: "AD HOMINEM"     },
  },
};

function buildMoves(locale: Locale): Move[] {
  return MOVE_VISUALS.map((v) => ({ ...v, ...LABELS_BY_LOCALE[locale][v.key] }));
}

const MOVES_BY_LOCALE: Record<Locale, Move[]> = {
  en: buildMoves("en"),
  de: buildMoves("de"),
};

/** Locale-aware accessor for the four moves. Use this everywhere — never
 * import MOVES directly anymore. */
export function getMoves(locale: Locale): Move[] {
  return MOVES_BY_LOCALE[locale];
}

/** Back-compat: the English MOVES used by code paths that haven't been
 * locale-threaded yet (OG image route, build wizard internals). Will be
 * removed once those paths read locale from request context. */
export const MOVES: Move[] = MOVES_BY_LOCALE.en;

export const MOVE_BY_KEY: Record<MoveKey, Move> = Object.fromEntries(
  MOVES.map((m) => [m.key, m]),
) as Record<MoveKey, Move>;

/** Locale-aware MOVE_BY_KEY. */
export function getMoveByKey(locale: Locale, key: MoveKey): Move {
  return MOVES_BY_LOCALE[locale].find((m) => m.key === key)!;
}

export const RECIPE_VERSION = "v2";

/* ─── Shared output schemas (strict JSON for OpenAI structured outputs) ───── */

/** /api/start: short plain-English summary of the news event. */
export const EVENT_INTRO_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["paragraphs", "source_url"],
  properties: {
    paragraphs: {
      type: "array",
      items: { type: "string" },
      description:
        "Two or three short paragraphs (60–90 words each) explaining the news event in plain language. The reader has not heard of this event before.",
    },
    source_url: {
      type: "string",
      description:
        "A best-guess link to a published news article about this event. May be empty string if unknown.",
    },
  },
} as const;
export type EventIntro = { paragraphs: string[]; source_url: string };

/** /api/start: 3 short ideas per move for the user to pick. */
export const IDEAS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["anomaly", "connection", "dismiss", "discredit"],
  properties: {
    anomaly: { type: "array", items: { type: "string" }, description: "3 short anomaly-hunt ideas, ≤ 8 words each." },
    connection: { type: "array", items: { type: "string" }, description: "3 short fake-connection ideas, ≤ 8 words each." },
    dismiss: { type: "array", items: { type: "string" }, description: "3 short ways to dismiss counter-evidence, ≤ 8 words each." },
    discredit: { type: "array", items: { type: "string" }, description: "3 short ways to discredit critics, ≤ 8 words each." },
  },
} as const;
export type Ideas = Record<MoveKey, string[]>;

/** /api/build/[id]/[move]/section: paragraph + debunk for one chosen idea. */
export const SECTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["paragraph", "debunk"],
  properties: {
    paragraph: {
      type: "string",
      description:
        "One paragraph (45–80 words) applying the move, in the satirical conspiracist voice. Plain English, no bullets, no headings.",
    },
    debunk: {
      type: "string",
      description:
        "One paragraph (40–70 words) of plain-language critical-thinking response to that paragraph. Names the move's tell. No bullets, no headings.",
    },
  },
} as const;
export type SectionOutput = { paragraph: string; debunk: string };

/* ─── Persisted shape on the generations.recipe_content JSONB column ────── */

export type WizardContent = {
  event_intro?: EventIntro;
  /** Short conspiracist-voice opener used on the shareable /g/[id] page. */
  conspiracist_intro?: string;
  ideas?: Ideas;
  per_move?: Partial<Record<MoveKey, { idea: string; paragraph: string; debunk: string }>>;
  // Legacy v1-style migrated rows have these instead:
  legacy_text?: string;
  legacy_prompt?: string;
  recipe_tags?: null;
  // Earlier v2 generations (before the wizard) used these top-level keys:
  anomalies?: string;
  connect_dots?: string;
  dismiss_counter?: string;
  discredit_critics?: string;
  debunk?: string;
};
