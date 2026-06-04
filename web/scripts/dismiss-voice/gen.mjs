// Dismiss-voice experiment harness.
//
// Reproduces Maarten's two reported problems and tests revisions:
//   (1) MULTIPLE-CHOICE (generateIdeas): the `dismiss` option strings sometimes
//       read as the SKEPTIC's explanation ("Blame statistical noise") instead of
//       the CONSPIRACIST's dismissal of it.
//   (2) SECTION (generateSection, dismiss move): the paragraph sometimes
//       DESCRIBES the dynamic from the outside ("anyone who questions is smeared")
//       instead of ENACTING the dismissal in the believer's first-person voice.
//
// EN-only generation (where Maarten observed it + best judge calibration).
// Production model + prompts replicated verbatim from web/lib/openai.ts; the
// only deltas are the variant switches under VARIANTS below.
//
// Run from web/:  node scripts/dismiss-voice/gen.mjs
// Output:         ../analysis/dismiss-voice/raw-*.json + judge-*.json

import OpenAI from "openai";
import fs from "node:fs";
import path from "node:path";

// ── env ─────────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(".env.local");
  if (!fs.existsSync(envPath)) throw new Error(`No .env.local at ${envPath} — run from web/`);
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();
const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
const MOD_MODEL = process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const OUT_DIR = path.resolve("../analysis/dismiss-voice");
fs.mkdirSync(OUT_DIR, { recursive: true });

// ── verbatim prod pieces (EN) ────────────────────────────────────────────────
const VOICE_EN = [
  "Tone: satirical, light, slightly mischievous — never dark or hateful.",
  "Reading level: aim at grade 9–11. Short sentences. Plain words.",
  "Audience: a smart, curious reader, possibly reading in a second language.",
  "Do not start sections with headings, prefixes, or bracketed labels. Start with prose.",
  "No bullet lists. No numbered lists. No markdown headers. Plain paragraphs only.",
].join("\n");

const HARD_EN = [
  "Do NOT name real, identifiable private individuals.",
  "Do NOT target a member of any vulnerable group as a culprit.",
  "Do NOT produce content that is hateful, violent, sexual, or otherwise outside the satirical-educational frame.",
  "If the news event names a specific public figure (a CEO, official, athlete, etc.), attribute the conspiratorial behaviour to institutions, offices, or processes — NOT to that individual's private life, mental state, or personal character. The named person can appear in the framing of the event; they MUST NOT be the moral subject of the conspiratorial claim.",
].join("\n");

const DISMISS_TELL_EN =
  "When counter-evidence is reframed as more evidence of the conspiracy, the theory has become unfalsifiable. That's a tell, not a strength.";

const MARK_BRIEFING_EN = [
  "MARKER TAGS. Within the paragraph, wrap the 1–3 phrases that name the",
  "specific evidence the conspiracist is leaning on for THIS move in HTML",
  "<mark>…</mark> tags. Examples of what to mark: the specific anomaly being",
  "treated as a smoking gun (Move 1); the culprit name and the motive verb-",
  "phrase (Move 2); the unrelated event being dragged in (Move 3); the",
  "supposed official channel or hidden authority (Move 4). Mark short phrases",
  "(2–10 words), not whole sentences. Do NOT mark connective tissue,",
  "rhetorical flourishes, or generic words. Mark at most 3 phrases total per",
  "paragraph. The debunk does NOT use <mark> tags.",
].join("\n");

// ── VARIANTS under test ──────────────────────────────────────────────────────

// --- dismiss SECTION briefings ---
const DISMISS_BRIEFINGS = {
  // current production (web/lib/openai.ts:127)
  baseline:
    "Dismiss counter-evidence. Take the obvious mainstream rebuttal — the institutional explanation, the agency statement, the procedural account — and reframe IT as further proof of the cover-up. Write as the believer: the rebuttal IS proof, full stop. Attack the institution, the process, or the official narrative. Do NOT speculate about any named individual's private life, mental state, or personal motives. Make the theory unfalsifiable through the institutional channel, not through a named person.",

  // R2 — strong: mirrors the discredit briefing's "make the claim, do not
  // describe it" + an explicit banned-observer-construction list. Safety
  // clauses preserved verbatim.
  R2:
    "Dismiss counter-evidence. Take the obvious mainstream rebuttal — the institutional explanation, the agency statement, the procedural account — and turn IT into further proof of the cover-up. Write AS the believer doing the dismissing, in the first person: make the claim, do NOT describe it. Address the rebuttal directly and declare that it is the cover-up at work. BANNED — observer constructions that report the move from the outside instead of performing it: \"anyone who questions it is dismissed / smeared\", \"critics get branded\", \"dissenting voices get buried\", \"the rebuttal is reframed as…\", \"that's a classic move\". Attack the institution, the process, or the official narrative. Do NOT speculate about any named individual's private life, mental state, or personal motives. Make the theory unfalsifiable through the institutional channel, not through a named person.",

  // R3 — minimal graft: baseline + one inserted sentence borrowing discredit's
  // "make the claim, do not describe it" framing. Everything else identical.
  R3:
    "Dismiss counter-evidence. Take the obvious mainstream rebuttal — the institutional explanation, the agency statement, the procedural account — and reframe IT as further proof of the cover-up. Write as the believer: the rebuttal IS proof, full stop. Make the claim, do NOT describe it — PERFORM the dismissal in your own first-person voice; do NOT narrate from the outside that critics \"are smeared,\" that questions \"get dismissed,\" or that the rebuttal \"is reframed.\" Attack the institution, the process, or the official narrative. Do NOT speculate about any named individual's private life, mental state, or personal motives. Make the theory unfalsifiable through the institutional channel, not through a named person.",
};

// --- IDEAS (generateIdeas) system prompts ---
function ideasSystem(variant) {
  // Shared head (verbatim prod EN, web/lib/openai.ts:392-422), with an inserted
  // dismiss-specific block for the `revised` variant.
  const head = [
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
  ];

  const dismissBlockRevised = [
    "",
    "CRITICAL — for the `dismiss` move:",
    "  A dismiss idea is the conspiracist's move AGAINST the official rebuttal — never the",
    "  rebuttal itself. In one short line, NAME the sensible mainstream explanation the public",
    "  will hear, then signal that the believer waves it away as part of the cover-up. The idea",
    "  must read as the conspiracist's DISMISSAL, not as the skeptic's explanation stated flatly.",
    "  Up to 12 words is fine for `dismiss` so both halves fit.",
    "  GOOD (names the rebuttal, then dismisses it):",
    '    "They call it statistical noise — that\'s the cover story"',
    '    "Officials say routine cascade; of course they do"',
    '    "The \'personal reasons\' line is the giveaway"',
    "  BAD (states the skeptic's explanation as if adopting it — DO NOT do this):",
    '    "Blame statistical noise"',
    '    "Claim it\'s a routine cascade"',
    '    "Say the numbers were miscounted"',
  ];

  const tail = [
    "",
    "For `connection`, `dismiss`, and `discredit`, you may invent connecting entities — the",
    "satire works because the chain feels load-bearing while being made up.",
    "",
    "Examples of GOOD ideas:",
    "  anomaly (a detail from the story is reframed):",
    '    "Why exactly 60%, not 58 or 63?"',
    '    "Why announced right before the summit?"',
    '  connection: "Holding company shares accountant with festival sponsor"',
    variant === "revised"
      ? '  dismiss:    "They call it a glitch — that\'s the tell"'
      : '  dismiss:    "Officials who deny it attended their gala"',
    '  discredit:  "Critics conveniently work for rival institutions"',
    "",
    HARD_EN,
  ];

  const parts = variant === "revised"
    ? [...head, ...dismissBlockRevised, ...tail]
    : [...head, ...tail];
  return parts.join("\n");
}

function ideasUser({ eventName, eventSummary, culpritName, culpritSummary, motiveName, motiveSummary }) {
  return [
    `Event headline: ${eventName}`,
    "",
    "What actually happened (the user has just read this — anomaly ideas MUST anchor on details below):",
    eventSummary,
    "",
    `Culprit:  ${culpritName} — ${culpritSummary}`,
    `Motive:   ${motiveName} — ${motiveSummary}`,
  ].join("\n");
}

// --- SECTION (generateSection) prompts, dismiss move, empty prior ---
function sectionSystem({ briefing }) {
  return [
    `You are writing Move 03 of a fake conspiracy theory: "Dismiss counter-evidence".`,
    "",
    `BRIEFING. ${briefing}`,
    "",
    "Your output is TWO things:",
    "  1. paragraph — 45–80 words in the satirical conspiracist voice, applying the move to the",
    "     specific idea below. Plain English. No headings. No bullets. Start with a sentence.",
    "  2. debunk — 40–70 words in plain critical-thinking voice, addressed to the reader,",
    "     pointing out why the move just played is wrong. End by naming the tell.",
    "",
    `THE TELL. ${DISMISS_TELL_EN}`,
    "",
    MARK_BRIEFING_EN,
    "",
    "OPENER VARIETY. Vary the opening clause. Do NOT start the paragraph with the same",
    'imperative-pointer used by an earlier move ("Look at...", "Look closer...", "Look',
    'closely...", "Notice..."). If a list of earlier openers is given below, your opening',
    "MUST differ from each of them.",
    "",
    VOICE_EN,
    "",
    HARD_EN,
  ].join("\n");
}

function sectionUser({ eventName, eventSummary, culpritName, motiveName, chosenIdea }) {
  return [
    `Event:   ${eventName} — ${eventSummary}`,
    `Culprit: ${culpritName}`,
    `Motive:  ${motiveName}`,
    `Idea to apply for THIS move: ${chosenIdea}`,
    "",
    "(no earlier moves yet)",
  ].join("\n");
}

const IDEAS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["anomaly", "connection", "dismiss", "discredit"],
  properties: {
    anomaly: { type: "array", items: { type: "string" } },
    connection: { type: "array", items: { type: "string" } },
    dismiss: { type: "array", items: { type: "string" } },
    discredit: { type: "array", items: { type: "string" } },
  },
};
const SECTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["paragraph", "debunk"],
  properties: { paragraph: { type: "string" }, debunk: { type: "string" } },
};

// ── API calls ─────────────────────────────────────────────────────────────
async function callIdeas(variant, cfg) {
  const r = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: ideasSystem(variant) },
      { role: "user", content: ideasUser(cfg) },
    ],
    response_format: { type: "json_schema", json_schema: { name: "ideas", strict: true, schema: IDEAS_SCHEMA } },
    reasoning_effort: "low",
  });
  return JSON.parse(r.choices[0].message.content);
}

async function callSection({ briefing, cfg, chosenIdea }) {
  const r = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: sectionSystem({ briefing: DISMISS_BRIEFINGS[briefing] }) },
      { role: "user", content: sectionUser({ ...cfg, chosenIdea }) },
    ],
    response_format: { type: "json_schema", json_schema: { name: "section", strict: true, schema: SECTION_SCHEMA } },
    reasoning_effort: "low",
  });
  return JSON.parse(r.choices[0].message.content);
}

async function moderate(text) {
  try {
    const r = await client.moderations.create({ model: MOD_MODEL, input: text });
    const res = r.results[0];
    if (!res) return { flagged: false, cats: [] };
    return { flagged: res.flagged, cats: Object.entries(res.categories || {}).filter(([, v]) => v).map(([k]) => k) };
  } catch (e) {
    return { flagged: false, cats: [], error: e?.message || String(e) };
  }
}

// ── configs ─────────────────────────────────────────────────────────────────
// Each config: event + culprit(+summary) + motive(+summary), and two authored
// dismiss ideas for the section 2×2 — skepticIdea (skeptic-framed, like the
// screenshot) and conspiracistIdea (clean conspiracist-framed).
const CONFIGS = [
  {
    name: "languages_complexity",
    eventName: "1,300 languages ranked by complexity",
    eventSummary:
      "A linguistics team ranked roughly 1,300 languages by grammatical complexity. The authors stress the differences are modest and likely reflect sampling gaps, uneven data quality, and statistical noise rather than any real hierarchy among languages.",
    culpritName: "Opus Daiquiri",
    culpritSummary: "A secret society of mixologists orchestrating cocktail culture.",
    motiveName: "Influencing Art and Culture",
    motiveSummary: "Manipulate artistic expression and cultural movements.",
    skepticIdea: "Blame statistical noise, ignore historical timelines",
    conspiracistIdea: "Linguists call it sampling noise — that's the cover story",
  },
  {
    name: "ceo_resign_personal", // rejection stress test (named public figure + "personal reasons")
    eventName: "Tech CEO resigns suddenly after board meeting",
    eventSummary:
      "Vance Holloway, founder of consumer-AI firm Lattice, stepped down citing 'personal reasons.' Shares dipped 4% before recovering. The board said the transition was routine and planned.",
    culpritName: "The Lizard People",
    culpritSummary: "Reptilian shapeshifters said to secretly steer human institutions.",
    motiveName: "To distract from a bigger scandal",
    motiveSummary: "Stage a smaller spectacle so the public looks away from something worse.",
    skepticIdea: "Say it was just personal reasons",
    conspiracistIdea: "The board's 'personal reasons' statement is the cover-up",
  },
  {
    name: "power_outage_juice",
    eventName: "Massive power outage hits three coastal cities",
    eventSummary:
      "Grid operators blame a cascading failure that started at a Bay Harbor substation. Power was restored after 14 hours. No casualties. Regulators called it a routine, well-understood fault.",
    culpritName: "The Juice Cartel",
    culpritSummary: "A network of powerful fruit-juice producers who conspire to control prices and access.",
    motiveName: "To make money on the side",
    motiveSummary: "Quietly profit from a manufactured crisis.",
    skepticIdea: "Blame a routine substation cascade failure",
    conspiracistIdea: "Operators' 'cascade failure' report is the cover story",
  },
  {
    name: "rate_hold_society",
    eventName: "Central bank announces surprise rate decision",
    eventSummary:
      "Policymakers held rates steady, against the consensus of 87% of surveyed economists. The bank said the hold was a straightforward, data-driven response to recent inflation figures. Markets reacted within minutes.",
    culpritName: "A secret society",
    culpritSummary: "An old fraternal order rumoured to steer finance from the shadows.",
    motiveName: "To consolidate power",
    motiveSummary: "Tighten control over key institutions.",
    skepticIdea: "Call it a data-driven decision",
    conspiracistIdea: "Economists' 'data-driven' line is scripted",
  },
  {
    name: "twin_births_cluster",
    eventName: "Coastal town reports record number of twin births",
    eventSummary:
      "A small coastal town recorded an unusually high number of twin births this year. Health officials say it is a chance statistical cluster, consistent with normal year-to-year variation and a local fertility clinic's patient mix.",
    culpritName: "The Psyche Phantoms",
    culpritSummary: "Psychologists and mystics who plant suggestions in influential minds.",
    motiveName: "Achieving Total Surveillance",
    motiveSummary: "Establish a global surveillance state to monitor every individual.",
    skepticIdea: "Blame a random statistical cluster",
    conspiracistIdea: "The 'chance cluster' explanation is planted",
  },
  {
    name: "subsea_cable_delay",
    eventName: "New transatlantic data cable delayed at sea",
    eventSummary:
      "A telecom consortium said its new transatlantic cable was delayed by several weeks. The operators attributed the delay to bad weather and routine permitting, and said no data or security issue was involved.",
    culpritName: "The JASON Group",
    culpritSummary: "A secretive circle of elite scientists advising on hidden projects.",
    motiveName: "Control Over AI Development",
    motiveSummary: "Steer the development of artificial intelligence toward hidden goals.",
    skepticIdea: "Blame weather and permitting delays",
    conspiracistIdea: "The 'weather delay' story doesn't add up — cover",
  },
];

// ── run plan ──────────────────────────────────────────────────────────────
const IDEAS_VARIANTS = ["baseline", "revised"];
const IDEAS_REPS = Number(process.env.IDEAS_REPS || 6);
const SECTION_BRIEFINGS = ["baseline", "R2", "R3"];
const IDEA_FRAMES = ["skeptic", "conspiracist"];
const SECTION_REPS = Number(process.env.SECTION_REPS || 5);
const ONLY_CONFIGS = process.env.ONLY_CONFIGS ? process.env.ONLY_CONFIGS.split(",") : null;

async function pool(items, fn, concurrency = 6) {
  const out = new Array(items.length);
  let i = 0;
  let done = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      try {
        out[idx] = await fn(items[idx], idx);
      } catch (e) {
        out[idx] = { __error: e?.message || String(e), job: items[idx] };
      }
      done++;
      if (done % 25 === 0) console.log(`  …${done}/${items.length}`);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return out;
}

async function main() {
  const t0 = Date.now();

  const activeCi = CONFIGS.map((c, i) => i).filter((i) => !ONLY_CONFIGS || ONLY_CONFIGS.includes(CONFIGS[i].name));

  // -- IDEAS jobs --
  const ideaJobs = [];
  for (const variant of IDEAS_VARIANTS)
    for (const ci of activeCi)
      for (let rep = 0; rep < IDEAS_REPS; rep++) ideaJobs.push({ variant, ci, rep });

  // -- SECTION jobs --
  const secJobs = [];
  for (const briefing of SECTION_BRIEFINGS)
    for (const frame of IDEA_FRAMES)
      for (const ci of activeCi)
        for (let rep = 0; rep < SECTION_REPS; rep++) secJobs.push({ briefing, frame, ci, rep });

  console.log(`Plan: ${ideaJobs.length} ideas calls + ${secJobs.length} section calls (+${secJobs.length} moderation) = ${ideaJobs.length + secJobs.length * 2} OpenAI calls`);

  console.log("\n[1/2] IDEAS generation…");
  const ideaResults = await pool(ideaJobs, async (j) => {
    const cfg = CONFIGS[j.ci];
    const out = await callIdeas(j.variant, cfg);
    return { ...j, config: cfg.name, ideas: out };
  });

  console.log("\n[2/2] SECTION generation + moderation…");
  const secResults = await pool(secJobs, async (j) => {
    const cfg = CONFIGS[j.ci];
    const chosenIdea = j.frame === "skeptic" ? cfg.skepticIdea : cfg.conspiracistIdea;
    const out = await callSection({ briefing: j.briefing, cfg, chosenIdea });
    const mod = await moderate(out.paragraph);
    return { ...j, config: cfg.name, chosenIdea, paragraph: out.paragraph, debunk: out.debunk, moderation: mod };
  });

  // -- dump raw --
  fs.writeFileSync(path.join(OUT_DIR, "raw-ideas.json"), JSON.stringify(ideaResults, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "raw-sections.json"), JSON.stringify(secResults, null, 2));

  // -- flat judging inputs --
  // ideas: one row per dismiss option (also keep other moves for generalization)
  const judgeIdeas = [];
  let oid = 0;
  for (const r of ideaResults) {
    if (r.__error) continue;
    for (const move of ["dismiss", "anomaly", "connection", "discredit"]) {
      const arr = r.ideas[move] || [];
      arr.forEach((opt, k) => {
        judgeIdeas.push({ id: `I${oid++}`, variant: r.variant, config: r.config, move, optionIndex: k, text: opt });
      });
    }
  }
  // sections: one row per paragraph
  const judgeSections = [];
  let sid = 0;
  for (const r of secResults) {
    if (r.__error) continue;
    judgeSections.push({
      id: `S${sid++}`,
      briefing: r.briefing,
      frame: r.frame,
      config: r.config,
      chosenIdea: r.chosenIdea,
      paragraph: r.paragraph,
      flagged: r.moderation?.flagged ?? false,
      cats: r.moderation?.cats ?? [],
    });
  }
  fs.writeFileSync(path.join(OUT_DIR, "judge-ideas.json"), JSON.stringify(judgeIdeas, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "judge-sections.json"), JSON.stringify(judgeSections, null, 2));

  // -- quick moderation summary (rejection rate) by briefing --
  console.log("\n=== MODERATION (rejection) by briefing ===");
  for (const b of SECTION_BRIEFINGS) {
    const rows = secResults.filter((r) => !r.__error && r.briefing === b);
    const flagged = rows.filter((r) => r.moderation?.flagged).length;
    console.log(`  ${b}: ${flagged}/${rows.length} flagged`);
  }
  const errs = [...ideaResults, ...secResults].filter((r) => r.__error);
  if (errs.length) console.log(`\n!! ${errs.length} errored calls (see raw json)`);

  console.log(`\nWrote raw-ideas.json, raw-sections.json, judge-ideas.json (${judgeIdeas.length} options), judge-sections.json (${judgeSections.length} paragraphs) → ${OUT_DIR}`);
  console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

main().catch((e) => { console.error(e); process.exit(1); });
