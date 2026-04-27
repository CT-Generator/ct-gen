// The four-move recipe + structured-output schemas for the stepwise wizard.

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

export const MOVES: Move[] = [
  {
    n: "01",
    key: "anomaly",
    title: "Hunt anomalies",
    sub: "Turn coincidence into evidence of a secret plot.",
    tell: "BASE RATES",
    color: "oklch(56% 0.14 28)",
    soft: "oklch(92% 0.04 28)",
    colorHex: "#A04A3C",
    softHex: "#F2DDD5",
  },
  {
    n: "02",
    key: "connection",
    title: "Fabricate connections",
    sub: "Draw lines between unrelated dots until they look meaningful.",
    tell: "SIX DEGREES",
    color: "oklch(56% 0.14 130)",
    soft: "oklch(92% 0.04 130)",
    colorHex: "#5C7339",
    softHex: "#E0E8D2",
  },
  {
    n: "03",
    key: "dismiss",
    title: "Dismiss counter-evidence",
    sub: "If a fact disagrees, make the fact part of the cover-up.",
    tell: "UNFALSIFIABLE",
    color: "oklch(56% 0.14 230)",
    soft: "oklch(92% 0.04 230)",
    colorHex: "#3A6E97",
    softHex: "#D6E2EC",
  },
  {
    n: "04",
    key: "discredit",
    title: "Discredit the critics",
    sub: "Dismiss people who point out flaws in your theory.",
    tell: "AD HOMINEM",
    color: "oklch(56% 0.14 70)",
    soft: "oklch(92% 0.04 70)",
    colorHex: "#876133",
    softHex: "#EBE2D0",
  },
];

export const MOVE_BY_KEY: Record<MoveKey, Move> = Object.fromEntries(
  MOVES.map((m) => [m.key, m]),
) as Record<MoveKey, Move>;

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
