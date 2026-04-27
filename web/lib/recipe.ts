// The four-move recipe. Source of truth for the entire app.
// Colors: equal chroma + lightness, hue rotated. Pedagogy, not tribal coding.

export type MoveKey = "anomaly" | "connection" | "dismiss" | "discredit";

export type Move = {
  n: "01" | "02" | "03" | "04";
  key: MoveKey;
  title: string;
  sub: string;
  /** Move accent — used for chips, glyphs, theory-column left border (oklch for in-browser). */
  color: string;
  /** ~8% tint of the accent — used for background fills under theory body. */
  soft: string;
  /** Hex equivalent for environments that don't grok oklch (e.g. Satori → next/og). */
  colorHex: string;
  softHex: string;
};

export const MOVES: Move[] = [
  {
    n: "01",
    key: "anomaly",
    title: "Hunt anomalies",
    sub: "Find a pattern that wasn't asked for. Coincidence becomes signal.",
    color: "oklch(56% 0.14 28)",
    soft: "oklch(92% 0.04 28)",
    colorHex: "#A04A3C",
    softHex: "#F2DDD5",
  },
  {
    n: "02",
    key: "connection",
    title: "Fabricate connections",
    sub: "Draw lines between unrelated dots until they look load-bearing.",
    color: "oklch(56% 0.14 130)",
    soft: "oklch(92% 0.04 130)",
    colorHex: "#5C7339",
    softHex: "#E0E8D2",
  },
  {
    n: "03",
    key: "dismiss",
    title: "Dismiss counter-evidence",
    sub: "If a fact disagrees, the fact is part of the cover-up.",
    color: "oklch(56% 0.14 230)",
    soft: "oklch(92% 0.04 230)",
    colorHex: "#3A6E97",
    softHex: "#D6E2EC",
  },
  {
    n: "04",
    key: "discredit",
    title: "Discredit the critics",
    sub: "Whoever points out the flaw is conveniently compromised.",
    color: "oklch(56% 0.14 70)",
    soft: "oklch(92% 0.04 70)",
    colorHex: "#876133",
    softHex: "#EBE2D0",
  },
];

export const RECIPE_VERSION = "v1";

/**
 * Strict JSON schema for OpenAI structured outputs.
 * The model returns ALL FIVE sections in one call. Each section is a
 * non-empty string. additionalProperties: false makes the schema strict.
 */
export const RECIPE_OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["anomalies", "connect_dots", "dismiss_counter", "discredit_critics", "debunk"],
  properties: {
    anomalies: {
      type: "string",
      description:
        "Move 01: Hunt anomalies. Find puzzling details, contradictions, coincidences in the official story. 2–4 paragraphs in the satirical conspiracist voice.",
    },
    connect_dots: {
      type: "string",
      description:
        "Move 02: Fabricate connections. Draw 'six-degrees' lines between unrelated entities until they look load-bearing. 2–4 paragraphs in the satirical conspiracist voice.",
    },
    dismiss_counter: {
      type: "string",
      description:
        "Move 03: Dismiss counter-evidence. Reframe disconfirming facts as further evidence of the cover-up. 2–3 paragraphs.",
    },
    discredit_critics: {
      type: "string",
      description:
        "Move 04: Discredit the critics. Frame skeptics as gullible dupes or paid stooges. 2–3 paragraphs.",
    },
    debunk: {
      type: "string",
      description:
        "Critical-thinking response. Plain, calm, addressed to the reader. Names each move and its tell, explains the logical fallacy, contrasts with how real investigators reason. 4–6 short paragraphs total covering all four moves.",
    },
  },
} as const;

export type RecipeOutput = {
  anomalies: string;
  connect_dots: string;
  dismiss_counter: string;
  discredit_critics: string;
  debunk: string;
};
