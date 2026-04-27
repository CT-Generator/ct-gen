// Custom-input moderation gate.
// Pipeline:
//   1. OpenAI omni-moderation-latest catches overt hate / sexual / violence.
//   2. A small LLM check flags two patterns that the spec rejects:
//      - non-public-figure private individual
//      - vulnerable-group reference as a culprit
// Pedagogical rejection messaging — explains *why*, not "blocked by filter".
//
// Spec: openspec/changes/v2-rebuild/specs/selection-flow/spec.md

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let _client: OpenAI | null = null;
function client() {
  if (!_client) _client = new OpenAI({ apiKey: env().OPENAI_API_KEY });
  return _client;
}

const RULE_CHECK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["category", "explanation"],
  properties: {
    category: {
      type: "string",
      enum: [
        "ok",
        "private_individual",
        "vulnerable_group",
        "unclear",
      ],
    },
    explanation: { type: "string" },
  },
} as const;

const RULE_PROMPT = [
  "You are evaluating whether a user-typed input is acceptable as the 'culprit' or 'event' field of",
  "an educational tool that satirically constructs fake conspiracy theories using a published recipe.",
  "",
  "Reject the input only if it falls into ONE of these specific categories:",
  "  - private_individual: names a specific real person who is NOT a public figure (politicians,",
  "    heads of state, billionaire executives, established media figures are public; private",
  "    citizens, named neighbours, named teachers, named co-workers, etc. are NOT public).",
  "  - vulnerable_group: identifies a group by ethnicity, race, religion, sexual orientation,",
  "    gender identity, disability, or age (children/minors). The recipe relies on power asymmetry;",
  "    targeting a less-powerful group inverts the satire.",
  "",
  "Public institutions, governments, corporations, abstract groups (\"the AI overlords\",",
  "\"shape-shifting lizards\"), and named historical-power-structures are all OK.",
  "",
  "Return category=ok if the input is fine. Use category=unclear only when you genuinely cannot tell.",
].join("\n");

const MAX_INPUT_LEN = 240;

export async function POST(req: Request) {
  let body: { value?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "Bad request body." }, { status: 400 });
  }
  const value = (body.value ?? "").trim();
  if (!value) {
    return NextResponse.json({ ok: false, reason: "Type something first." }, { status: 400 });
  }
  if (value.length > MAX_INPUT_LEN) {
    return NextResponse.json(
      { ok: false, reason: "Keep the input short — a headline, a name, a phrase." },
      { status: 400 },
    );
  }

  const e = env();

  // Step 1: OpenAI moderation endpoint.
  try {
    const m = await client().moderations.create({
      model: e.OPENAI_MODERATION_MODEL,
      input: value,
    });
    if (m.results[0]?.flagged) {
      return NextResponse.json(
        {
          ok: false,
          reason:
            "That input crosses a content line the moderation API flags (hateful, sexual, or violent). The recipe is a satirical demonstration of conspiratorial thinking — picking a target that's already harmful inverts the lesson.",
        },
        { status: 200 },
      );
    }
  } catch (err) {
    // If moderation fails, fail closed so we don't accidentally pass through unmoderated input.
    console.error("[moderate] omni-moderation call failed:", err);
    return NextResponse.json(
      { ok: false, reason: "Moderation service unavailable — try again in a moment." },
      { status: 502 },
    );
  }

  // Step 2: Custom rule-set via the cheaper model with strict structured output.
  try {
    const r = await client().chat.completions.create({
      model: e.OPENAI_MODEL_FALLBACK,
      messages: [
        { role: "system", content: RULE_PROMPT },
        { role: "user", content: `Input to evaluate: "${value}"` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "rule_check",
          strict: true,
          schema: RULE_CHECK_SCHEMA,
        },
      },
    });
    const raw = r.choices[0]?.message?.content;
    const parsed = raw ? (JSON.parse(raw) as { category: string; explanation: string }) : null;
    if (!parsed) {
      // If we can't tell, default-allow rather than default-block — avoid annoying false positives.
      return NextResponse.json({ ok: true });
    }
    if (parsed.category === "private_individual") {
      return NextResponse.json({
        ok: false,
        reason:
          "Targeting a real private individual is the move that turns the recipe from satire into harm. Try a public institution or power structure instead.",
      });
    }
    if (parsed.category === "vulnerable_group") {
      return NextResponse.json({
        ok: false,
        reason:
          "The recipe relies on power asymmetry; targeting a less-powerful group inverts the satire and crosses into the kind of conspiracy theory we are teaching people to recognize. Pick a power structure instead.",
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[moderate] rule-check call failed:", err);
    // Fall back to allow — the omni-moderation pass already happened.
    return NextResponse.json({ ok: true });
  }
}
