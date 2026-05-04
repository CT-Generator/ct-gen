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
  NARRATIVE_SCHEMA,
  RECIPE_VERSION,
  getMoveByKey,
  type EventIntro,
  type Ideas,
  type MoveKey,
  type NarrativeOutput,
  type SectionOutput,
} from "@/lib/recipe";
import type { Locale } from "@/lib/i18n/types";

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: env().OPENAI_API_KEY });
  return _client;
}

/** Recipe version stamped onto persisted generations. Locale suffix
 * distinguishes English (v1) from German (v1.de) and Dutch (v1.nl) provenance. */
export function recipeVersionFor(locale: Locale): string {
  return locale === "en" ? RECIPE_VERSION : `${RECIPE_VERSION}.${locale}`;
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
  // Dutch pass-1 voice guidelines — to be workshopped in pass 2 (Maarten or named Dutch-native contributor).
  // Spec: openspec/changes/multilingual-dutch/specs/dutch-content/spec.md
  nl: [
    "Toon: satirisch, licht, iets ondeugend — nooit somber of haatdragend.",
    "Schrijf als een Nederlandse moedertaalspreker. GEEN anglicismen, GEEN letterlijk uit het Engels vertaalde uitdrukkingen.",
    "De stijl moet natuurlijk klinken voor zowel Vlaamse als Nederlandse lezers. Geen Belgicismen, geen Hollandismen die maar één kant herkent.",
    "Leesniveau: 9e–11e klas. Korte zinnen. Eenvoudige woorden.",
    "Publiek: aandachtige, nieuwsgierige lezers — mogelijk in een tweede taal.",
    "Begin secties niet met koppen, voorvoegsels of labels tussen haken. Begin met proza.",
    "Geen opsommingen, geen genummerde lijsten, geen markdown-koppen. Alleen lopende tekst.",
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
  nl: [
    "Noem GEEN echte, identificeerbare privépersonen.",
    "Kies GEEN lid van een kwetsbare groep als schuldige.",
    "Produceer GEEN inhoud die haatdragend, gewelddadig, seksueel of anderszins buiten het satirisch-educatieve kader valt.",
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
  nl: {
    anomaly:
      "Afwijkingen najagen. Pak een gewoon feit over de gebeurtenis en presenteer het als verdacht. Behandel toeval als signaal. Sluit af met een vraag waarop de lezer geen antwoord heeft.",
    connection:
      "Verbanden verzinnen. Verbind de schuldige via een keten zwak verwante actoren met de gebeurtenis. Laat de keten dragend klinken.",
    dismiss:
      "Tegenbewijs wegredeneren. Neem een voor de hand liggende, gangbare weerlegging en herkader die als verder bewijs voor de doofpot. Maak de theorie onfalsifieerbaar.",
    discredit:
      "Critici diskwalificeren. Suggereer dat iedereen die de theorie tegenspreekt, goedgelovig, gemanipuleerd of betaald door de samenzweerders is.",
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
  nl: {
    anomaly:
      "Echte onderzoekers controleren de basiskans: hoe vaak komt zo'n toeval gewoon voor? Complotdenkers verzamelen afwijkingen en slaan die vraag over.",
    connection:
      "Via zes schakels is iedereen met iedereen verbonden. Een keten van zwakke verbindingen als bewijs behandelen is een categoriefout — de verbinding bestaat in elke richting, niet alleen in de uitgelichte.",
    dismiss:
      "Wanneer tegenbewijzen worden geherkaderd als verder bewijs voor de samenzwering, is de theorie onfalsifieerbaar geworden. Dat is een verklikker, geen kracht.",
    discredit:
      "Het verschuiven van kritiek van de zaak naar de persoon stuurt de vraag van „klopt dit?“ naar „wie vraagt dat eigenlijk?“. Echte onderzoekers verwelkomen kritiek. Complotdenkers behandelen kritiek als de samenzwering.",
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
  nl: {
    discredit:
      "Sluit de ontmaskering af met één enkele, 4–8 woorden lange zin wiens enige taak het is de verklikker te benoemen. De zin MOET op zichzelf staan (eigen punt), niet aangehangen aan een langere zin. Gebruik bijvoorbeeld: „Ad hominem.“ / „De boodschapper aanvallen, niet de boodschap.“ / „De boodschapper neerschieten.“ Kort en onopgesmukt.",
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
      : locale === "nl"
        ? [
            // Dutch pass-1 — to be workshopped in pass 2.
            "Je bent een redactieassistent voor een leerinstrument.",
            "Je taak is een korte, eenvoudig geformuleerde uitleg van een nieuwsgebeurtenis, zodat de lezer wat volgt kan volgen.",
            "",
            voice,
            "",
            "Vereisten:",
            "- 2–3 korte alinea's, elk 60–90 woorden.",
            "- De lezer kent de gebeurtenis NIET. Neem geen context aan.",
            "- Blijf bij publiek bekende feiten. Geen complot-kadering.",
            "- Als je een waarschijnlijke bron-URL kunt noemen (een echt gepubliceerd artikel dat je kent), geef die op. Anders een lege string voor source_url.",
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
      : locale === "nl"
        ? `Kop: ${input.eventName}\n\nVolledige samenvatting (context, mogelijk langer):\n${input.eventSummary}`
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
      : locale === "nl"
      ? [
          // Dutch pass-1 — to be workshopped in pass 2.
          "Je schrijft korte brainstormideeën voor een leerinstrument dat het vier-stappen-recept van complotdenken demonstreert (Boudry & Meyer).",
          "",
          "Stel voor de gegeven gebeurtenis + de schuldige + het motief DRIE korte, specifieke ideeën per stap voor. Elk idee:",
          "  - 5 tot 8 woorden.",
          "  - Concreet en verrassend — noem een specifieke afwijking / verband / afwering / belastering.",
          "  - Ook in een tweede taal makkelijk te lezen.",
          "  - VERSCHILLEND van de andere twee ideeën binnen dezelfde stap.",
          "  - Geen kop, geen label — alleen het idee zelf.",
          "  - Schrijf als een Nederlandse moedertaalspreker. Geen anglicismen. Natuurlijk voor zowel Vlaamse als Nederlandse lezers.",
          "",
          "BELANGRIJK — voor de stap `anomaly`:",
          "  Elke afwijking MOET verwijzen naar een concreet feit, getal, datum, plaats, instelling of geciteerd detail uit de samenvatting hieronder. Verzin GEEN feiten. Pak een echt detail uit het verhaal en presenteer DAT detail als verdacht. De lezer moet de afwijking herkennen in het verhaal dat hij net heeft gelezen.",
          "",
          "Voor `connection`, `dismiss` en `discredit` mag je verbindende actoren verzinnen — de satire werkt omdat de keten dragend lijkt terwijl hij geconstrueerd is.",
          "",
          "Voorbeelden van GOEDE ideeën:",
          "  anomaly (een detail wordt geherkaderd):",
          '    "Waarom precies 60 %, niet 58 of 63?"',
          '    "Waarom vlak voor de top aangekondigd?"',
          '  connection: "Holding deelt belastingadviseur met festivalsponsor"',
          '  dismiss:    "Ambtenaren die het ontkennen waren op het gala"',
          '  discredit:  "Critici werken toevallig voor concurrerende instellingen"',
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
      : locale === "nl"
      ? [
          `Kop: ${input.eventName}`,
          "",
          "Wat er echt gebeurde (de lezer heeft dit zojuist gelezen — afwijkings-ideeën MOETEN steunen op de details hieronder):",
          input.eventSummary,
          "",
          `Schuldige:  ${input.culpritName} — ${input.culpritSummary}`,
          `Motief:     ${input.motiveName} — ${input.motiveSummary}`,
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
    .map(([k, v]) => {
      const title = getMoveByKey(locale, k).title;
      if (locale === "de") return `Vorheriger Schritt ${title}: ${v}`;
      if (locale === "nl") return `Vorige stap ${title}: ${v}`;
      return `Prior ${title}: ${v}`;
    })
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
      : locale === "nl"
      ? [
          // Dutch pass-1 — to be workshopped in pass 2.
          `Je schrijft stap ${move.n} van een verzonnen complottheorie: „${move.title}".`,
          "",
          `BRIEFING. ${briefing}`,
          "",
          "Je uitvoer bestaat uit TWEE delen:",
          "  1. paragraph — 45–80 woorden in de satirisch-complotterende stem, die de stap toepast op het hieronder gegeven idee. Eenvoudig Nederlands. Geen koppen. Geen opsommingen. Begin met een zin.",
          "  2. debunk — 40–70 woorden in een nuchter-kritische stem, gericht aan de lezer, die toont waarom de zojuist gespeelde stap mank gaat. Sluit af met het benoemen van de verklikker.",
          "",
          `DE VERKLIKKER. ${tell}`,
          extraRule ? `\nEXTRA SLOTREGEL. ${extraRule}` : "",
          "",
          'AFWISSELING IN DE OPENING. Varieer de inleidende clausule. Begin de alinea NIET met dezelfde imperatieve aanwijzer als een eerdere stap (bv. herhaaldelijk "Kijk eens..." of "Kijk nauwkeuriger..."). Als hieronder een lijst eerdere openingen volgt, MOET jouw opening van elk daarvan verschillen.',
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
      : locale === "nl"
      ? [
          `Gebeurtenis:        ${input.eventName} — ${input.eventSummary}`,
          `Schuldige:          ${input.culpritName}`,
          `Motief:             ${input.motiveName}`,
          `Idee voor DEZE stap: ${input.chosenIdea}`,
          "",
          priorText || "(nog geen eerdere stappen)",
          priorOpeners.length
            ? `\nEerdere openingen (herhaal NIET dezelfde imperatief): ${JSON.stringify(priorOpeners)}`
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

/* ─── 4. Narrative finale: weave the four move paragraphs into one story ─ */

export async function generateNarrative(input: {
  locale?: Locale;
  eventName: string;
  culpritName: string;
  motiveName: string;
  /** The four per-move conspiracist paragraphs, keyed by move. */
  paragraphs: Record<MoveKey, string>;
}): Promise<NarrativeOutput> {
  const e = env();
  const locale: Locale = input.locale ?? "en";
  const voice = VOICE_GUIDELINES_BY_LOCALE[locale];
  const hardConstraints = HARD_CONSTRAINTS_BY_LOCALE[locale];

  const system =
    locale === "de"
      ? [
          "Du schreibst die finale, in sich geschlossene Verschwörungstheorie als kurze Erzählung.",
          "Eingabe sind vier kurze Absätze, je einer pro Schritt (Auffälligkeit, Verbindung, Abwehr, Diskreditierung).",
          "Deine Aufgabe: webe die Aussagen dieser vier Absätze zu EINER fortlaufenden Geschichte mit drei Absätzen, die sich wie eine echte Verschwörungstheorie liest — mit erzählerischem Schwung.",
          "",
          "Vorgaben:",
          "- GENAU drei Absätze. Je 80–140 Wörter.",
          "- Verbinde die vier Schritte zu einem fließenden Erzählbogen — keine Aneinanderreihung der Absätze, kein Auflisten.",
          "- Übernimm die konkreten Behauptungen aus den vier Eingabe-Absätzen (welche Auffälligkeit, welche Verbindung, welche Abwehr, welche Diskreditierung). Erfinde keine neuen Einzelheiten, die den Eingaben widersprechen.",
          "- Schreibe in der Stimme einer überzeugten Verschwörungstheoretikerin — leicht spitzbübisch, satirisch, aber lesbar als eine zusammenhängende Geschichte.",
          "- Beginne mit Prosa. Kein Titel, keine Überschriften, keine Aufzählungspunkte, keine Nummerierungen, keine Schritte-Labels (z. B. Schritt 01).",
          "- Erwähne KEINE Auflösungen oder kritische Einordnung. Die Auflösungen sind woanders auf der Seite.",
          "- Schreibe wie eine deutsche Muttersprachlerin. Keine Anglizismen.",
          "",
          voice,
          "",
          hardConstraints,
        ].join("\n")
      : locale === "nl"
      ? [
          // Dutch pass-1 — to be workshopped in pass 2.
          "Je schrijft de uiteindelijke, op zichzelf staande complottheorie als korte vertelling.",
          "Invoer zijn vier korte alinea's, één per stap (afwijking, verband, afwering, diskwalificatie).",
          "Je taak: weef de uitspraken van deze vier alinea's tot ÉÉN doorlopend verhaal van drie alinea's dat leest als een echte complottheorie — met verhalende vaart.",
          "",
          "Vereisten:",
          "- PRECIES drie alinea's. Elk 80–140 woorden.",
          "- Verbind de vier stappen tot een vloeiende boog — geen aaneenschakeling van de alinea's, geen opsomming.",
          "- Neem de concrete beweringen uit de vier invoer-alinea's over (welke afwijking, welk verband, welke afwering, welke diskwalificatie). Verzin geen nieuwe details die de invoer tegenspreken.",
          "- Schrijf in de stem van een overtuigde complotdenker — licht ondeugend, satirisch, maar leesbaar als één samenhangend verhaal.",
          "- Begin met proza. Geen titel, geen koppen, geen opsommingstekens, geen nummering, geen stap-labels (bv. Stap 01).",
          "- Vermeld GEEN ontmaskeringen of kritische kadering. De ontmaskeringen staan elders op de pagina.",
          "- Schrijf als een Nederlandse moedertaalspreker. Geen anglicismen. Natuurlijk voor zowel Vlaamse als Nederlandse lezers.",
          "",
          voice,
          "",
          hardConstraints,
        ].join("\n")
      : [
          "You are writing the final, self-contained conspiracy theory as a short narrative.",
          "Input is four short paragraphs, one per move (anomaly, connection, dismiss, discredit).",
          "Your job: weave the claims of those four paragraphs into ONE continuous three-paragraph story that reads like a real conspiracy theory — with narrative flair.",
          "",
          "Constraints:",
          "- EXACTLY three paragraphs. 80–140 words each.",
          "- Integrate the four moves into a flowing arc — not a concatenation, not a list.",
          "- Carry over the concrete claims from the four input paragraphs (the specific anomaly, connection, dismissal, and discrediting). Do not invent new details that contradict the inputs.",
          "- Write in the voice of a true-believer conspiracist — slightly mischievous, satirical, but readable as one coherent story.",
          "- Start with prose. No title, no headings, no bullets, no numbering, no move labels (\"Move 01\" etc.).",
          "- Do NOT include any debunks or critical framing. Debunks live elsewhere on the page.",
          "",
          voice,
          "",
          hardConstraints,
        ].join("\n");

  const labels =
    locale === "de"
      ? {
          event: "Ereignis",
          culprit: "Schuldige Partei",
          motive: "Motiv",
          a: "Auffälligkeit",
          c: "Verbindung",
          d: "Abwehr",
          x: "Diskreditierung",
        }
      : locale === "nl"
      ? {
          event: "Gebeurtenis",
          culprit: "Schuldige",
          motive: "Motief",
          a: "Afwijking",
          c: "Verband",
          d: "Afwering",
          x: "Diskwalificatie",
        }
      : {
          event: "Event",
          culprit: "Culprit",
          motive: "Motive",
          a: "Anomaly",
          c: "Connection",
          d: "Dismiss",
          x: "Discredit",
        };

  const user = [
    `${labels.event}:   ${input.eventName}`,
    `${labels.culprit}: ${input.culpritName}`,
    `${labels.motive}:  ${input.motiveName}`,
    "",
    `${labels.a}:`,
    input.paragraphs.anomaly,
    "",
    `${labels.c}:`,
    input.paragraphs.connection,
    "",
    `${labels.d}:`,
    input.paragraphs.dismiss,
    "",
    `${labels.x}:`,
    input.paragraphs.discredit,
  ].join("\n");

  const r = await client().chat.completions.create({
    model: e.OPENAI_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "narrative", strict: true, schema: NARRATIVE_SCHEMA },
    },
  });
  const raw = r.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty narrative response");
  const parsed = JSON.parse(raw) as NarrativeOutput;
  if (!Array.isArray(parsed.paragraphs) || parsed.paragraphs.length !== 3) {
    throw new Error(
      `Narrative must have exactly 3 paragraphs, got ${parsed.paragraphs?.length ?? 0}`,
    );
  }
  return parsed;
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
