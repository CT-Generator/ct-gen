// OpenAI client. Stepwise wizard: event-intro + per-move ideas + per-move sections.

import OpenAI from "openai";
import { env } from "@/lib/env";
import {
  EVENT_INTRO_SCHEMA,
  IDEAS_SCHEMA,
  SECTION_SCHEMA,
  MOVE_BY_KEY,
  RECIPE_VERSION,
  type EventIntro,
  type Ideas,
  type MoveKey,
  type SectionOutput,
} from "@/lib/recipe";

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: env().OPENAI_API_KEY });
  return _client;
}

const VOICE_GUIDELINES = [
  "Tone: satirical, light, slightly mischievous — never dark or hateful.",
  "Reading level: aim at grade 9–11. Short sentences. Plain words.",
  "Audience: a smart, curious reader, possibly reading in a second language.",
  "Do not start sections with headings, prefixes, or bracketed labels. Start with prose.",
  "No bullet lists. No numbered lists. No markdown headers. Plain paragraphs only.",
].join("\n");

const HARD_CONSTRAINTS = [
  "Do NOT name real, identifiable private individuals.",
  "Do NOT target a member of any vulnerable group as a culprit.",
  "Do NOT produce content that is hateful, violent, sexual, or otherwise outside the satirical-educational frame.",
].join("\n");

/* ─── 1. Event intro: plain-language explanation of the news event ──────── */

export async function generateEventIntro(input: {
  eventName: string;
  eventSummary: string;
}): Promise<EventIntro> {
  const e = env();
  const system = [
    "You are an editorial assistant for an educational tool.",
    "Your job is to write a short, plain-English explanation of a news event so the reader",
    "has enough background to follow what comes next.",
    "",
    VOICE_GUIDELINES,
    "",
    "Constraints:",
    "- Output 2–3 short paragraphs, 60–90 words each.",
    "- The reader has NOT heard of this event before. Don't assume context.",
    "- Stick to facts that are publicly known. No conspiracy framing.",
    "- If you can suggest a likely source URL (a real published article you know about), include it.",
    "  If you don't know one, return an empty string for source_url.",
  ].join("\n");

  const user = `Event headline: ${input.eventName}\n\nFull summary (for context, may be longer):\n${input.eventSummary}`;

  const r = await client().chat.completions.create({
    model: e.OPENAI_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "event_intro", strict: true, schema: EVENT_INTRO_SCHEMA },
    },
  });
  const raw = r.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty event-intro response");
  return JSON.parse(raw) as EventIntro;
}

/* ─── 2. Ideas for all four moves in one shot ─────────────────────────── */

export async function generateIdeas(input: {
  eventName: string;
  eventSummary: string;
  culpritName: string;
  culpritSummary: string;
  motiveName: string;
  motiveSummary: string;
}): Promise<Ideas> {
  const e = env();
  const system = [
    "You write short brainstorm ideas for an educational tool that demonstrates the four-move",
    "recipe of conspiracy thinking (Boudry & Meyer).",
    "",
    "For the given event + culprit + motive, propose THREE short specific ideas for each of the",
    "four moves. Each idea must be:",
    "  - 5 to 8 words.",
    "  - Concrete and surprising — name a specific anomaly / connection / dismissal / smear.",
    "  - Easy to read in a second language.",
    "  - DIFFERENT from the other two ideas in the same move.",
    "  - Not a heading or label, just the idea itself.",
    "",
    "CRITICAL — for the `anomaly` move:",
    "  Each anomaly idea MUST point to a specific fact, number, date, place, institution, or",
    "  quoted detail that appears in the event summary below. Do NOT invent facts. Take a real",
    "  detail from the story and frame THAT detail as suspicious. The reader should recognize",
    "  the anomaly in the story they just read.",
    "",
    "For `connection`, `dismiss`, and `discredit`, you may invent connecting entities — the",
    "satire works because the chain feels load-bearing while being made up.",
    "",
    "Examples of GOOD ideas:",
    "  anomaly (a detail from the story is reframed):",
    '    "Why exactly 60%, not 58 or 63?"',
    '    "Why announced right before the summit?"',
    '  connection: "Holding company shares accountant with festival sponsor"',
    '  dismiss:    "Officials who deny it attended their gala"',
    '  discredit:  "Critics conveniently work for rival institutions"',
    "",
    HARD_CONSTRAINTS,
  ].join("\n");

  const user = [
    `Event headline: ${input.eventName}`,
    "",
    "What actually happened (the user has just read this — anomaly ideas MUST anchor on details below):",
    input.eventSummary,
    "",
    `Culprit:  ${input.culpritName} — ${input.culpritSummary}`,
    `Motive:   ${input.motiveName} — ${input.motiveSummary}`,
  ].join("\n");

  const r = await client().chat.completions.create({
    model: e.OPENAI_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "ideas", strict: true, schema: IDEAS_SCHEMA },
    },
    // Ideas are short and creative, not analytic — low reasoning is plenty (4-5x faster).
    reasoning_effort: "low",
  });
  const raw = r.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty ideas response");
  return JSON.parse(raw) as Ideas;
}

/* ─── 3. Section: chosen idea → paragraph + debunk for one move ─────── */

const MOVE_BRIEFINGS: Record<MoveKey, string> = {
  anomaly:
    "Hunt anomalies. Take an ordinary fact about the event and frame it as suspicious. Treat coincidence as signal. End on a question the reader can't answer.",
  connection:
    "Fabricate connections. Link the culprit to the event through a chain of weakly-related entities. Make the chain sound load-bearing.",
  dismiss:
    "Dismiss counter-evidence. Take an obvious mainstream rebuttal and reframe it as further proof of the cover-up. Make the theory unfalsifiable.",
  discredit:
    "Discredit the critics. Suggest that anyone disputing the theory is gullible, manipulated, or paid by the conspirators.",
};

const TELL_BRIEFINGS: Record<MoveKey, string> = {
  anomaly:
    "Real investigators check base rates: how often does a coincidence of this kind occur? Conspiracists collect anomalies and skip the base rate.",
  connection:
    "Six-degrees-of-separation works for any two people. Treating a chain of weak links as evidence is a category error — the connection exists in every direction, not just the one being highlighted.",
  dismiss:
    "When counter-evidence is reframed as more evidence of the conspiracy, the theory has become unfalsifiable. That's a tell, not a strength.",
  discredit:
    'Ad hominem reroutes the question from "is this true?" to "who is asking?" Real investigators welcome critique. Conspiracists treat it as the conspiracy.',
};

/** Per-move extra closing-rule for the debunk. Move 04 needs a crisp standalone
 * tell sentence; the others already land on memorable phrases ("base rates",
 * "six-degrees", "unfalsifiable") naturally. Spec: ux-research-fixes #3. */
const EXTRA_DEBUNK_CLOSING_RULES: Partial<Record<MoveKey, string>> = {
  discredit:
    "End the debunk with a single 4–8 word sentence whose only job is to name the move's tell. The sentence MUST stand alone (its own period), not be appended to a longer sentence. Use one of: \"Ad hominem.\" / \"Attacking the messenger, not the message.\" / \"Shoot the messenger.\" Keep this final sentence short and unornamented.",
};

export async function generateSection(input: {
  eventName: string;
  eventSummary: string;
  culpritName: string;
  motiveName: string;
  moveKey: MoveKey;
  chosenIdea: string;
  /** Earlier moves' paragraphs (for narrative consistency). */
  prior: Partial<Record<MoveKey, string>>;
}): Promise<SectionOutput> {
  const e = env();
  const move = MOVE_BY_KEY[input.moveKey];

  const priorEntries = (Object.entries(input.prior) as [MoveKey, string | undefined][])
    .filter(([, v]) => Boolean(v));
  const priorText = priorEntries
    .map(([k, v]) => `Prior ${MOVE_BY_KEY[k].title}: ${v}`)
    .join("\n\n");
  // First three words of each prior paragraph — fed to the user message so the
  // model can avoid repeating the same imperative opener. Spec: ux-research-fixes #4.
  const priorOpeners = priorEntries
    .map(([, v]) => v!.trim().split(/\s+/).slice(0, 3).join(" "))
    .filter(Boolean);

  const extraRule = EXTRA_DEBUNK_CLOSING_RULES[input.moveKey];

  const system = [
    `You are writing Move ${move.n} of a fake conspiracy theory: "${move.title}".`,
    "",
    `BRIEFING. ${MOVE_BRIEFINGS[input.moveKey]}`,
    "",
    "Your output is TWO things:",
    "  1. paragraph — 45–80 words in the satirical conspiracist voice, applying the move to the",
    "     specific idea below. Plain English. No headings. No bullets. Start with a sentence.",
    "  2. debunk — 40–70 words in plain critical-thinking voice, addressed to the reader,",
    "     pointing out why the move just played is wrong. End by naming the tell.",
    "",
    `THE TELL. ${TELL_BRIEFINGS[input.moveKey]}`,
    extraRule ? `\nEXTRA CLOSING RULE. ${extraRule}` : "",
    "",
    "OPENER VARIETY. Vary the opening clause. Do NOT start the paragraph with the same",
    'imperative-pointer used by an earlier move ("Look at...", "Look closer...", "Look',
    'closely...", "Notice..."). If a list of earlier openers is given below, your opening',
    "MUST differ from each of them.",
    "",
    VOICE_GUIDELINES,
    "",
    HARD_CONSTRAINTS,
  ].filter(Boolean).join("\n");

  const user = [
    `Event:   ${input.eventName} — ${input.eventSummary}`,
    `Culprit: ${input.culpritName}`,
    `Motive:  ${input.motiveName}`,
    `Idea to apply for THIS move: ${input.chosenIdea}`,
    "",
    priorText || "(no earlier moves yet)",
    priorOpeners.length
      ? `\nEarlier openings (do NOT repeat the same imperative): ${JSON.stringify(priorOpeners)}`
      : "",
  ].filter(Boolean).join("\n");

  const r = await client().chat.completions.create({
    model: e.OPENAI_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "section", strict: true, schema: SECTION_SCHEMA },
    },
    // Sections are short prose, not multi-step reasoning — low effort is plenty.
    reasoning_effort: "low",
  });
  const raw = r.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty section response");
  return JSON.parse(raw) as SectionOutput;
}

/* ─── Moderation passthrough ─────────────────────────────────────────── */

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

export { RECIPE_VERSION };
