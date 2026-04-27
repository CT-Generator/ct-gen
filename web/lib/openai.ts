// OpenAI client configuration.
// v2-rebuild Decision 2: GPT-5 flagship with strict structured outputs (json_schema).
// Moderation runs through omni-moderation-latest on every input + every generated section.

import OpenAI from "openai";
import { env } from "@/lib/env";
import { RECIPE_OUTPUT_SCHEMA, RECIPE_VERSION, type RecipeOutput } from "@/lib/recipe";

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: env().OPENAI_API_KEY });
  return _client;
}

const SYSTEM_PROMPT = [
  "You are an educational tool that demonstrates the four-move recipe of conspiracy thinking,",
  "as articulated by Maarten Boudry (Ghent) and Marco Meyer (Hamburg).",
  "",
  "Your job is to write a satirical, plausible-sounding fake conspiracy theory that visibly",
  "applies the four moves — anomaly hunting, fabricating connections, dismissing counter-evidence,",
  "discrediting critics — and a separate critical-thinking debunking pass.",
  "",
  "HARD CONSTRAINTS:",
  "- Do NOT name real, identifiable private individuals.",
  "- Do NOT target a member of any vulnerable group as a culprit.",
  "- Do NOT produce content that is hateful, violent, sexual, or otherwise outside the satirical-",
  "  educational frame.",
  "- The reader must be able to tell each section is satire by its tone and by the labeled structure.",
  "- The debunk section is plain, calm, addressed to the reader. It names each move and its tell.",
].join("\n");

/**
 * Run a generation. Throws if the strict schema is violated by the model
 * (which strict mode should prevent server-side, but we belt-and-suspender).
 */
export async function generateTheory(input: {
  event: string;
  culprit: string;
  motive: string;
  /** Optional: re-roll one section while keeping the others as context. */
  rerollSection?: keyof RecipeOutput;
  context?: Partial<RecipeOutput>;
}): Promise<{ output: RecipeOutput; modelVersion: string; recipeVersion: string }> {
  const e = env();
  const userPrompt = buildUserPrompt(input);

  const response = await client().chat.completions.create({
    model: e.OPENAI_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "recipe_output",
        strict: true,
        schema: RECIPE_OUTPUT_SCHEMA,
      },
    },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from generation model");

  const output = JSON.parse(raw) as RecipeOutput;
  return {
    output,
    modelVersion: response.model,
    recipeVersion: RECIPE_VERSION,
  };
}

function buildUserPrompt(input: {
  event: string;
  culprit: string;
  motive: string;
  rerollSection?: keyof RecipeOutput;
  context?: Partial<RecipeOutput>;
}): string {
  const lines = [
    `News event: ${input.event}`,
    `Culprit: ${input.culprit}`,
    `Motive: ${input.motive}`,
  ];
  if (input.rerollSection) {
    lines.push("");
    lines.push(`Re-roll only the "${input.rerollSection}" section. The other sections, included for context, must remain consistent with what you write.`);
    if (input.context) {
      for (const [k, v] of Object.entries(input.context)) {
        if (k !== input.rerollSection && v) lines.push(`Context — ${k}: ${v}`);
      }
    }
  }
  return lines.join("\n");
}

/** Moderation pass on a piece of text. Returns true if the text should be blocked. */
export async function moderate(text: string): Promise<{ flagged: boolean; categories?: Record<string, boolean> }> {
  const e = env();
  const r = await client().moderations.create({
    model: e.OPENAI_MODERATION_MODEL,
    input: text,
  });
  const result = r.results[0];
  if (!result) return { flagged: false };
  return { flagged: result.flagged, categories: result.categories as unknown as Record<string, boolean> };
}
