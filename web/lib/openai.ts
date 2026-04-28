// OpenAI client. Stepwise wizard: event-intro + per-move ideas + per-move sections.
//
// Locale-aware. The German prompts are pass-1 literal drafts authored at the
// time of the multilingual-german change; pass 2 (idiomatic rewrite) and
// pass 3 (native-ear) MUST happen before relying on German output quality.
// Spec: openspec/changes/multilingual-german/specs/german-content/spec.md

import OpenAI from "openai";
import { env } from "@/lib/env";
import {
  EVENT_INTRO_SCHEMA,
  IDEAS_SCHEMA,
  SECTION_SCHEMA,
  RECIPE_VERSION,
  getMoveByKey,
  type EventIntro,
  type Ideas,
  type MoveKey,
  type SectionOutput,
} from "@/lib/recipe";
import type { Locale } from "@/lib/i18n/types";

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: env().OPENAI_API_KEY });
  return _client;
}

/** Recipe version stamped onto persisted generations. Locale suffix
 * distinguishes English (v1) from German (v1.de) provenance. */
export function recipeVersionFor(locale: Locale): string {
  return locale === "de" ? `${RECIPE_VERSION}.de` : RECIPE_VERSION;
}

// ── Voice + constraints, per-locale ──────────────────────────────────────

const VOICE_GUIDELINES_BY_LOCALE: Record<Locale, string> = {
  en: [
    "Tone: satirical, light, slightly mischievous — never dark or hateful.",
    "Reading level: aim at grade 9–11. Short sentences. Plain words.",
    "Audience: a smart, curious reader, possibly reading in a second language.",
    "Do not start sections with headings, prefixes, or bracketed labels. Start with prose.",
    "No bullet lists. No numbered lists. No markdown headers. Plain paragraphs only.",
  ].join("\n"),
  de: [
    "Ton: satirisch, leicht, etwas spitzbübisch — nie dunkel oder hasserfüllt.",
    "Schreibe wie eine deutsche Muttersprachlerin. KEINE Anglizismen, KEINE wörtlich übersetzten englischen Wendungen.",
    "Lesestufe: 9.–11. Klasse. Kurze Sätze. Einfache Worte.",
    "Zielgruppe: aufmerksame, neugierige Leser:innen — möglicherweise in einer Zweitsprache.",
    "Beginne Abschnitte nicht mit Überschriften, Präfixen oder eckigen Labels. Beginne mit Prosa.",
    "Keine Aufzählungen, keine nummerierten Listen, keine Markdown-Überschriften. Nur Fließtext.",
  ].join("\n"),
};

const HARD_CONSTRAINTS_BY_LOCALE: Record<Locale, string> = {
  en: [
    "Do NOT name real, identifiable private individuals.",
    "Do NOT target a member of any vulnerable group as a culprit.",
    "Do NOT produce content that is hateful, violent, sexual, or otherwise outside the satirical-educational frame.",
  ].join("\n"),
  de: [
    "Nenne KEINE realen, identifizierbaren Privatpersonen.",
    "Wähle KEIN Mitglied einer verletzlichen Gruppe als Schuldige:n.",
    "Produziere KEINE Inhalte, die hasserfüllt, gewaltverherrlichend, sexualisiert oder anderweitig außerhalb des satirisch-pädagogischen Rahmens stehen.",
  ].join("\n"),
};

// ── Per-move briefings + tells, per-locale ───────────────────────────────

const MOVE_BRIEFINGS_BY_LOCALE: Record<Locale, Record<MoveKey, string>> = {
  en: {
    anomaly:
      "Hunt anomalies. Take an ordinary fact about the event and frame it as suspicious. Treat coincidence as signal. End on a question the reader can't answer.",
    connection:
      "Fabricate connections. Link the culprit to the event through a chain of weakly-related entities. Make the chain sound load-bearing.",
    dismiss:
      "Dismiss counter-evidence. Take an obvious mainstream rebuttal and reframe it as further proof of the cover-up. Make the theory unfalsifiable.",
    discredit:
      "Discredit the critics. Suggest that anyone disputing the theory is gullible, manipulated, or paid by the conspirators.",
  },
  de: {
    anomaly:
      "Auffälligkeiten suchen. Nimm einen gewöhnlichen Fakt über das Ereignis und rahme ihn als verdächtig. Behandle Zufall als Signal. Schließe mit einer Frage, die die Leserin nicht beantworten kann.",
    connection:
      "Verbindungen erfinden. Verknüpfe die schuldige Partei über eine Kette schwach verwandter Akteur:innen mit dem Ereignis. Lass die Kette tragfähig klingen.",
    dismiss:
      "Gegenbeweise abwehren. Nimm eine offensichtliche, etablierte Widerlegung und rahme sie als weiteren Beleg der Vertuschung. Mach die Theorie unfalsifizierbar.",
    discredit:
      "Kritiker:innen diskreditieren. Lege nahe, dass jede:r, die:der die Theorie bestreitet, leichtgläubig, manipuliert oder von den Verschwörer:innen bezahlt sei.",
  },
};

const TELL_BRIEFINGS_BY_LOCALE: Record<Locale, Record<MoveKey, string>> = {
  en: {
    anomaly:
      "Real investigators check base rates: how often does a coincidence of this kind occur? Conspiracists collect anomalies and skip the base rate.",
    connection:
      "Six-degrees-of-separation works for any two people. Treating a chain of weak links as evidence is a category error — the connection exists in every direction, not just the one being highlighted.",
    dismiss:
      "When counter-evidence is reframed as more evidence of the conspiracy, the theory has become unfalsifiable. That's a tell, not a strength.",
    discredit:
      'Ad hominem reroutes the question from "is this true?" to "who is asking?" Real investigators welcome critique. Conspiracists treat it as the conspiracy.',
  },
  de: {
    anomaly:
      "Echte Ermittler:innen prüfen die Ausgangswahrscheinlichkeit: Wie oft tritt ein solcher Zufall einfach so auf? Verschwörungstheoretiker:innen sammeln Auffälligkeiten und überspringen diese Frage.",
    connection:
      "Über sechs Ecken ist jeder mit jedem verbunden. Eine Kette schwacher Verbindungen als Beweis zu behandeln, ist ein Kategorienfehler — die Verbindung existiert in jede Richtung, nicht nur in der hervorgehobenen.",
    dismiss:
      "Wenn Gegenbeweise als weitere Belege der Verschwörung umgedeutet werden, ist die Theorie unfalsifizierbar geworden. Das ist ein verräterisches Muster, keine Stärke.",
    discredit:
      "Die Verschiebung der Kritik von der Sachebene auf die Person lenkt die Frage von „stimmt das?“ auf „wer fragt da?“ um. Echte Ermittler:innen begrüßen Kritik. Verschwörungstheoretiker:innen behandeln sie als die Verschwörung.",
  },
};

const EXTRA_DEBUNK_CLOSING_RULES_BY_LOCALE: Record<Locale, Partial<Record<MoveKey, string>>> = {
  en: {
    discredit:
      "End the debunk with a single 4–8 word sentence whose only job is to name the move's tell. The sentence MUST stand alone (its own period), not be appended to a longer sentence. Use one of: \"Ad hominem.\" / \"Attacking the messenger, not the message.\" / \"Shoot the messenger.\" Keep this final sentence short and unornamented.",
  },
  de: {
    discredit:
      "Beende die Auflösung mit einem einzigen, 4–8 Wörter langen Satz, dessen einzige Aufgabe es ist, das verräterische Muster zu benennen. Der Satz MUSS eigenständig stehen (eigener Punkt), nicht an einen längeren Satz angehängt. Nutze etwa: „Ad hominem.“ / „Den Boten angreifen statt die Botschaft.“ / „Den Überbringer erschießen.“ Knapp und unausgeschmückt.",
  },
};

/* ─── 1. Event intro: plain-language explanation of the news event ──────── */

export async function generateEventIntro(input: {
  locale?: Locale;
  eventName: string;
  eventSummary: string;
}): Promise<EventIntro> {
  const e = env();
  const locale: Locale = input.locale ?? "en";
  const voice = VOICE_GUIDELINES_BY_LOCALE[locale];
  const system =
    locale === "de"
      ? [
          "Du bist eine Redaktionsassistenz für ein Lehrwerkzeug.",
          "Deine Aufgabe ist eine kurze, einfach formulierte Erklärung eines Nachrichtenereignisses, damit der:die Leser:in dem Folgenden folgen kann.",
          "",
          voice,
          "",
          "Vorgaben:",
          "- 2–3 kurze Absätze, je 60–90 Wörter.",
          "- Der:die Leser:in kennt das Ereignis NICHT. Setze keinen Kontext voraus.",
          "- Bleibe bei öffentlich bekannten Fakten. Keine Verschwörungsrahmung.",
          "- Wenn du eine wahrscheinliche Quell-URL nennen kannst (ein echter veröffentlichter Artikel, den du kennst), gib sie an. Andernfalls leerer String für source_url.",
        ].join("\n")
      : [
          "You are an editorial assistant for an educational tool.",
          "Your job is to write a short, plain-English explanation of a news event so the reader",
          "has enough background to follow what comes next.",
          "",
          voice,
          "",
          "Constraints:",
          "- Output 2–3 short paragraphs, 60–90 words each.",
          "- The reader has NOT heard of this event before. Don't assume context.",
          "- Stick to facts that are publicly known. No conspiracy framing.",
          "- If you can suggest a likely source URL (a real published article you know about), include it.",
          "  If you don't know one, return an empty string for source_url.",
        ].join("\n");

  const user =
    locale === "de"
      ? `Schlagzeile: ${input.eventName}\n\nVollständige Zusammenfassung (Kontext, ggf. länger):\n${input.eventSummary}`
      : `Event headline: ${input.eventName}\n\nFull summary (for context, may be longer):\n${input.eventSummary}`;

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
  locale?: Locale;
  eventName: string;
  eventSummary: string;
  culpritName: string;
  culpritSummary: string;
  motiveName: string;
  motiveSummary: string;
}): Promise<Ideas> {
  const e = env();
  const locale: Locale = input.locale ?? "en";
  const hardConstraints = HARD_CONSTRAINTS_BY_LOCALE[locale];
  const system =
    locale === "de"
      ? [
          "Du schreibst kurze Brainstorm-Ideen für ein Lehrwerkzeug, das das Vier-Schritte-Rezept verschwörungstheoretischen Denkens demonstriert (Boudry & Meyer).",
          "",
          "Schlage für das gegebene Ereignis + die schuldige Partei + das Motiv DREI kurze, spezifische Ideen pro Schritt vor. Jede Idee:",
          "  - 5 bis 8 Wörter.",
          "  - Konkret und überraschend — nenne eine spezifische Auffälligkeit / Verbindung / Abwehr / Verleumdung.",
          "  - Auch in einer Zweitsprache leicht zu lesen.",
          "  - UNTERSCHIEDLICH zu den anderen beiden Ideen desselben Schritts.",
          "  - Keine Überschrift, kein Label — nur die Idee selbst.",
          "  - Schreibe wie eine deutsche Muttersprachlerin. Keine Anglizismen.",
          "",
          "WICHTIG — für den Schritt `anomaly`:",
          "  Jede Auffälligkeit MUSS auf einen konkreten Fakt, eine Zahl, ein Datum, einen Ort, eine Institution oder einen Zitatdetail aus der Zusammenfassung unten verweisen. Erfinde KEINE Fakten. Nimm ein echtes Detail aus der Geschichte und rahme JENES Detail als verdächtig. Der:die Leser:in soll die Auffälligkeit in der gerade gelesenen Geschichte wiedererkennen.",
          "",
          "Für `connection`, `dismiss` und `discredit` darfst du verbindende Akteur:innen erfinden — die Satire wirkt, weil die Kette tragfähig wirkt, obwohl sie konstruiert ist.",
          "",
          "Beispiele für GUTE Ideen:",
          "  anomaly (ein Detail wird umgedeutet):",
          '    "Warum genau 60 %, nicht 58 oder 63?"',
          '    "Warum kurz vor dem Gipfel verkündet?"',
          '  connection: "Holding teilt Steuerberater mit Festsponsor"',
          '  dismiss:    "Beamte, die es bestreiten, waren auf der Gala"',
          '  discredit:  "Kritiker:innen arbeiten zufällig für Konkurrenzinstitutionen"',
          "",
          hardConstraints,
        ].join("\n")
      : [
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
          hardConstraints,
        ].join("\n");

  const user =
    locale === "de"
      ? [
          `Schlagzeile: ${input.eventName}`,
          "",
          "Was tatsächlich geschah (der:die Leser:in hat das gerade gelesen — Auffälligkeits-Ideen MÜSSEN auf untenstehenden Details fußen):",
          input.eventSummary,
          "",
          `Schuldige Partei:  ${input.culpritName} — ${input.culpritSummary}`,
          `Motiv:             ${input.motiveName} — ${input.motiveSummary}`,
        ].join("\n")
      : [
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
    reasoning_effort: "low",
  });
  const raw = r.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty ideas response");
  return JSON.parse(raw) as Ideas;
}

/* ─── 3. Section: chosen idea → paragraph + debunk for one move ─────── */

export async function generateSection(input: {
  locale?: Locale;
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
  const locale: Locale = input.locale ?? "en";
  const move = getMoveByKey(locale, input.moveKey);
  const briefing = MOVE_BRIEFINGS_BY_LOCALE[locale][input.moveKey];
  const tell = TELL_BRIEFINGS_BY_LOCALE[locale][input.moveKey];
  const extraRule = EXTRA_DEBUNK_CLOSING_RULES_BY_LOCALE[locale][input.moveKey];
  const voice = VOICE_GUIDELINES_BY_LOCALE[locale];
  const hardConstraints = HARD_CONSTRAINTS_BY_LOCALE[locale];

  const priorEntries = (Object.entries(input.prior) as [MoveKey, string | undefined][])
    .filter(([, v]) => Boolean(v));
  const priorText = priorEntries
    .map(([k, v]) =>
      locale === "de"
        ? `Vorheriger Schritt ${getMoveByKey(locale, k).title}: ${v}`
        : `Prior ${getMoveByKey(locale, k).title}: ${v}`,
    )
    .join("\n\n");
  const priorOpeners = priorEntries
    .map(([, v]) => v!.trim().split(/\s+/).slice(0, 3).join(" "))
    .filter(Boolean);

  const system =
    locale === "de"
      ? [
          `Du schreibst Schritt ${move.n} einer erfundenen Verschwörungstheorie: „${move.title}".`,
          "",
          `BRIEFING. ${briefing}`,
          "",
          "Deine Ausgabe besteht aus ZWEI Teilen:",
          "  1. paragraph — 45–80 Wörter in der satirisch-verschwörerischen Stimme, der den Schritt auf die unten gegebene Idee anwendet. Einfaches Deutsch. Keine Überschriften. Keine Aufzählungen. Beginne mit einem Satz.",
          "  2. debunk — 40–70 Wörter in nüchtern-kritischer Stimme, an die Leser:innen gerichtet, die zeigt, warum der gerade gespielte Schritt fehlgeht. Schließe mit der Benennung des verräterischen Musters.",
          "",
          `DAS VERRÄTERISCHE MUSTER. ${tell}`,
          extraRule ? `\nZUSÄTZLICHE SCHLUSSREGEL. ${extraRule}` : "",
          "",
          'ABWECHSLUNG IM AUFTAKT. Variier den Einleitungsteil. Beginne den Absatz NICHT mit derselben imperativischen Aufforderung wie ein früherer Schritt (z. B. mehrfaches "Schau mal..." oder "Schauen wir genauer..."). Wenn unten eine Liste früherer Auftakte folgt, MUSS dein Auftakt sich von jedem unterscheiden.',
          "",
          voice,
          "",
          hardConstraints,
        ]
          .filter(Boolean)
          .join("\n")
      : [
          `You are writing Move ${move.n} of a fake conspiracy theory: "${move.title}".`,
          "",
          `BRIEFING. ${briefing}`,
          "",
          "Your output is TWO things:",
          "  1. paragraph — 45–80 words in the satirical conspiracist voice, applying the move to the",
          "     specific idea below. Plain English. No headings. No bullets. Start with a sentence.",
          "  2. debunk — 40–70 words in plain critical-thinking voice, addressed to the reader,",
          "     pointing out why the move just played is wrong. End by naming the tell.",
          "",
          `THE TELL. ${tell}`,
          extraRule ? `\nEXTRA CLOSING RULE. ${extraRule}` : "",
          "",
          "OPENER VARIETY. Vary the opening clause. Do NOT start the paragraph with the same",
          'imperative-pointer used by an earlier move ("Look at...", "Look closer...", "Look',
          'closely...", "Notice..."). If a list of earlier openers is given below, your opening',
          "MUST differ from each of them.",
          "",
          voice,
          "",
          hardConstraints,
        ]
          .filter(Boolean)
          .join("\n");

  const user =
    locale === "de"
      ? [
          `Ereignis:           ${input.eventName} — ${input.eventSummary}`,
          `Schuldige Partei:   ${input.culpritName}`,
          `Motiv:              ${input.motiveName}`,
          `Idee für DIESEN Schritt: ${input.chosenIdea}`,
          "",
          priorText || "(noch keine vorherigen Schritte)",
          priorOpeners.length
            ? `\nFrühere Auftakte (NICHT denselben Imperativ wiederholen): ${JSON.stringify(priorOpeners)}`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : [
          `Event:   ${input.eventName} — ${input.eventSummary}`,
          `Culprit: ${input.culpritName}`,
          `Motive:  ${input.motiveName}`,
          `Idea to apply for THIS move: ${input.chosenIdea}`,
          "",
          priorText || "(no earlier moves yet)",
          priorOpeners.length
            ? `\nEarlier openings (do NOT repeat the same imperative): ${JSON.stringify(priorOpeners)}`
            : "",
        ]
          .filter(Boolean)
          .join("\n");

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
