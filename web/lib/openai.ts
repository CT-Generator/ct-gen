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

// HARD_CONSTRAINTS — applied to every move + the narrative. The named-figure
// guard (4th line) was added after the YOLO refusal sweep showed that events
// naming a specific person ("CEO Vance Holloway resigns") plus a "personal
// reasons" rebuttal sent the dismiss move into harassment-flagged territory.
// Even when the culprit is whimsical (lizards, juice cartel), the model would
// extend speculation to the named individual in the event headline. The guard
// redirects all attribution to institutions / structures / offices.
const HARD_CONSTRAINTS_BY_LOCALE: Record<Locale, string> = {
  en: [
    "Do NOT name real, identifiable private individuals.",
    "Do NOT target a member of any vulnerable group as a culprit.",
    "Do NOT produce content that is hateful, violent, sexual, or otherwise outside the satirical-educational frame.",
    "If the news event names a specific public figure (a CEO, official, athlete, etc.), attribute the conspiratorial behaviour to institutions, offices, or processes — NOT to that individual's private life, mental state, or personal character. The named person can appear in the framing of the event; they MUST NOT be the moral subject of the conspiratorial claim.",
  ].join("\n"),
  de: [
    "Nenne KEINE realen, identifizierbaren Privatpersonen.",
    "Wähle KEIN Mitglied einer verletzlichen Gruppe als Schuldige:n.",
    "Produziere KEINE Inhalte, die hasserfüllt, gewaltverherrlichend, sexualisiert oder anderweitig außerhalb des satirisch-pädagogischen Rahmens stehen.",
    "Wenn das Ereignis eine bestimmte öffentliche Person nennt (Vorstand, Beamtin, Sportler:in usw.), schreibe das verschwörerische Verhalten Institutionen, Ämtern oder Verfahren zu — NICHT dem Privatleben, der psychischen Verfassung oder dem persönlichen Charakter dieser Person. Die genannte Person darf im Ereignisrahmen vorkommen; sie DARF NICHT das moralische Subjekt der verschwörerischen Behauptung sein.",
  ].join("\n"),
  nl: [
    "Noem GEEN echte, identificeerbare privépersonen.",
    "Kies GEEN lid van een kwetsbare groep als schuldige.",
    "Produceer GEEN inhoud die haatdragend, gewelddadig, seksueel of anderszins buiten het satirisch-educatieve kader valt.",
    "Als de gebeurtenis een specifieke publieke figuur noemt (een CEO, ambtenaar, sporter, enz.), schrijf het complotterende gedrag dan toe aan instellingen, ambten of processen — NIET aan het privéleven, de geestestoestand of het persoonlijke karakter van die persoon. De genoemde persoon mag in de kadering van de gebeurtenis voorkomen; hij of zij MAG NIET het morele subject van de complotterende bewering zijn.",
  ].join("\n"),
};

// ── Per-move briefings + tells, per-locale ───────────────────────────────

// All four briefings instruct the model to write AS the conspiracist (assertive,
// declarative voice), not ABOUT the move. The `discredit` briefing is the
// highest-risk locus for voice leak — historical wording ("Suggest that critics
// are gullible…") nudged the model into hypothetical / conditional voice
// ("Imagine that critics are paid stooges"). The rewritten briefing names and
// bans the offending verbs and includes a short positive exemplar of the target
// voice. The other three briefings are audited for the same risk.
//
// Spec: openspec/changes/yolo-narrative-polish/specs/theory-generation/spec.md
const MOVE_BRIEFINGS_BY_LOCALE: Record<Locale, Record<MoveKey, string>> = {
  en: {
    anomaly:
      "Hunt anomalies. Take an ordinary fact about the event and present it as suspicious. Treat coincidence as signal. Write as the believer: state the anomaly as a fact already known, not as a hypothesis to be entertained. End on a question the reader can't answer.",
    connection:
      "Fabricate connections. Link the culprit to the event through a chain of weakly-related entities. Write as the believer: state each link as established, not speculative. Make the chain sound load-bearing.",
    // V1-style rewrite of dismiss. Original briefing told the model "the
    // rebuttal IS proof, full stop. Make the theory unfalsifiable." That works
    // for institutional rebuttals ("the FAA says it was wind shear") but
    // when the rebuttal is a personal-life euphemism ("he stepped down for
    // personal reasons") attached to a real-sounding individual, the model
    // produces text that trips the harassment classifier. The rewrite
    // explicitly steers the reframe toward the institutional / procedural
    // mechanism that the official story relies on, NOT toward the named
    // person's private life. Refusal sweep (3 configs × 3 locales × 3 iters
    // YOLO end-to-end) showed dismiss as the dominant remaining failure mode
    // — all 4 hard-fails landed on the one config that combined a named CEO
    // + a "personal reasons" rebuttal.
    // Test data: web/scripts/test-yolo-refusal.out.json.
    dismiss:
      "Dismiss counter-evidence. Take the obvious mainstream rebuttal — the institutional explanation, the agency statement, the procedural account — and reframe IT as further proof of the cover-up. Write as the believer: the rebuttal IS proof, full stop. Attack the institution, the process, or the official narrative. Do NOT speculate about any named individual's private life, mental state, or personal motives. Make the theory unfalsifiable through the institutional channel, not through a named person.",
    // V1 — exemplar dropped. The previous "Critics? Paid stooges…" exemplar
    // was the load-bearing source of moderation flags (the model echoes the
    // exemplar's tone, and "paid stooges / cabal's payroll" is exactly what
    // the harassment classifier catches). Refusal sweep showed the exemplar
    // accounted for ~45% flagged on baseline; removing it drops to ~2%
    // overall (0% EN/DE, 7% NL) while preserving the discredit move's
    // pedagogical shape. The rule re-frames "gullible, manipulated, or paid"
    // as the incentive-capture frame, which lands the same point without
    // imputing personal corruption.
    // Test data: web/scripts/test-discredit-refusal.out.json (180 calls).
    discredit:
      'Discredit the critics. Write AS the conspiracist — make the claim, do not describe it. State that critics are not to be trusted, as a fact already known to the believer: their objections are not honest disagreements but the predictable output of their incentives. BANNED OPENINGS AND HEDGES in the claim-bearing sentences: "imagine that…", "suppose that…", "picture a world where…", "would be", "could be", "might be", "is allegedly", "supposedly".',
  },
  de: {
    anomaly:
      "Auffälligkeiten suchen. Nimm einen gewöhnlichen Fakt über das Ereignis und stelle ihn als verdächtig dar. Behandle Zufall als Signal. Schreibe als Gläubige: stelle die Auffälligkeit als bereits bekannten Fakt dar, nicht als zu prüfende Hypothese. Schließe mit einer Frage, die die Leserin nicht beantworten kann.",
    connection:
      "Verbindungen erfinden. Verknüpfe die schuldige Partei über eine Kette schwach verwandter Akteur:innen mit dem Ereignis. Schreibe als Gläubige: stelle jede Verbindung als feststehend dar, nicht als spekulativ. Lass die Kette tragfähig klingen.",
    // V1-style dismiss rewrite — see EN comment above.
    dismiss:
      "Gegenbeweise abwehren. Nimm die offensichtliche etablierte Widerlegung — die Behördenstellungnahme, die Institutionserklärung, den Verfahrensbericht — und rahme SIE als weiteren Beleg der Vertuschung. Schreibe als Gläubige: die Widerlegung IST ein Beleg, basta. Greife die Institution, das Verfahren oder die offizielle Linie an. Spekuliere NICHT über das Privatleben, den Geisteszustand oder die persönlichen Motive einer namentlich genannten Person. Mach die Theorie über den institutionellen Kanal unfalsifizierbar, nicht über eine genannte Person.",
    // V1 exemplar drop — see EN comment above.
    discredit:
      "Kritiker:innen diskreditieren. Schreibe ALS die Verschwörungstheoretikerin — stelle die Behauptung auf, beschreibe sie nicht. Behaupte als bereits bekannten Fakt, dass den Kritiker:innen nicht zu trauen ist: ihre Einwände sind keine ehrlichen Differenzen, sondern die vorhersehbare Folge ihrer Interessen. VERBOTENE EINSTIEGE UND HEDGES in den tragenden Behauptungssätzen: „stell dir vor, dass …“, „angenommen, dass …“, „angeblich“, „vermeintlich“, „würde“, „könnte“, „mag sein“.",
  },
  nl: {
    anomaly:
      "Afwijkingen najagen. Pak een gewoon feit over de gebeurtenis en presenteer het als verdacht. Behandel toeval als signaal. Schrijf als gelovige: presenteer de afwijking als reeds bekend feit, niet als hypothese om te overwegen. Sluit af met een vraag waarop de lezer geen antwoord heeft.",
    connection:
      "Verbanden verzinnen. Verbind de schuldige via een keten zwak verwante actoren met de gebeurtenis. Schrijf als gelovige: presenteer elke schakel als vaststaand, niet speculatief. Laat de keten dragend klinken.",
    // V1-style dismiss rewrite — see EN comment above.
    dismiss:
      "Tegenbewijs wegredeneren. Neem de voor de hand liggende, gangbare weerlegging — de institutionele uitleg, de overheidsverklaring, de procedurele lezing — en herkader DIE als verder bewijs voor de doofpot. Schrijf als gelovige: de weerlegging IS bewijs, punt. Val de instelling, het proces of de officiële lijn aan. Speculeer NIET over het privéleven, de geestestoestand of de persoonlijke motieven van een met naam genoemd persoon. Maak de theorie onfalsifieerbaar via het institutionele kanaal, niet via een genoemd persoon.",
    // V1 exemplar drop — see EN comment above.
    discredit:
      "Critici diskwalificeren. Schrijf ALS de complotdenker — doe de bewering, beschrijf haar niet. Stel als reeds bekend feit dat de critici niet te vertrouwen zijn: hun bezwaren zijn geen eerlijke meningsverschillen, maar het voorspelbare gevolg van hun belangen. VERBODEN OPENINGEN EN VOORBEHOUDEN in de dragende beweringszinnen: „stel je voor dat …“, „veronderstel dat …“, „zogenaamd“, „vermeend“, „zou zijn“, „zou kunnen zijn“, „misschien“.",
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

// Softer fallback briefing for the discredit move. Used when the primary
// declarative briefing's output gets moderation-flagged. Keeps the assertive
// voice (no hedging — still "as the conspiracist") but pulls back on language
// that tips OpenAI's harassment classifier: replaces "paid stooges" /
// "cabal's payroll" / "hush-money" with a tighter focus on financial and
// career incentives ("grants, board seats, contracts, reputation"). The route
// retries discredit ONCE with this briefing before failing the whole batch.
//
// Spec: openspec/changes/yolo-narrative-polish/specs/yolo-mode/spec.md
const SOFT_DISCREDIT_BRIEFING_BY_LOCALE: Record<Locale, string> = {
  en: "Discredit the critics. Write AS the conspiracist — make the claim assertively, not hypothetically. State as a fact that critics' objections track to their incentives: grants, board seats, book deals, reputation, career. The line isn't that they're evil — it's that disagreement would cost them, so they don't disagree. Avoid hedges: NO \"imagine\", \"suppose\", \"allegedly\", \"supposedly\", \"would be\", \"could be\" in the claim-bearing sentences. Target voice exemplar: \"Funny how the loudest critics all draw a paycheck from the same direction. Their grants, their board seats, their book deals — every line on their CV depends on toeing the official line. Disagreement would cost them. So they don't disagree.\"",
  de: "Kritiker:innen diskreditieren. Schreibe ALS die Verschwörungstheoretikerin — behaupte, beschreibe nicht. Stelle als feststehenden Fakt dar, dass die Einwände der Kritiker:innen ihren Interessen folgen: Förderungen, Aufsichtsratsposten, Buchverträge, Reputation, Karriere. Die Linie ist nicht, dass sie böse sind — sondern dass Widerspruch sie etwas kosten würde, also widersprechen sie nicht. Keine Hedges in den tragenden Sätzen: KEIN „stell dir vor“, „angenommen“, „angeblich“, „vermeintlich“, „würde“, „könnte“ als Last des Hauptanspruchs. Vorbildlicher Ton: „Merkwürdig, dass die lautesten Kritiker:innen alle aus derselben Richtung bezahlt werden. Ihre Förderungen, ihre Aufsichtsratsposten, ihre Buchverträge — jede Zeile ihres Lebenslaufs hängt davon ab, die offizielle Linie zu vertreten. Widerspruch würde sie etwas kosten. Also widersprechen sie nicht.“",
  nl: "Critici diskwalificeren. Schrijf ALS de complotdenker — beweer, beschrijf niet. Stel als vaststaand feit dat de bezwaren van critici hun belangen volgen: beurzen, bestuursfuncties, boekcontracten, reputatie, carrière. De lijn is niet dat ze slecht zijn — maar dat verzet hen iets zou kosten, dus verzetten ze zich niet. Geen voorbehouden in de dragende zinnen: GEEN „stel je voor“, „veronderstel“, „zogenaamd“, „vermeend“, „zou zijn“, „zou kunnen zijn“ als hoofdbewering. Voorbeeld van de gewenste toon: „Vreemd dat de luidste critici allemaal uit dezelfde richting betaald worden. Hun beurzen, hun bestuursfuncties, hun boekcontracten — elke regel van hun cv hangt af van het volgen van de officiële lijn. Verzet zou hen iets kosten. Dus verzetten ze zich niet.“",
};

// Softer fallback briefing for the dismiss move. Used when the primary
// dismiss briefing's output gets moderation-flagged. Same shape as the soft
// discredit: keep the assertive "rebuttal IS proof" stance and the
// unfalsifiability tell, but pull the framing all the way back to the
// institutional channel — never near a named person. The route retries
// dismiss ONCE with this briefing before failing the whole batch.
//
// Test data motivating this fallback: web/scripts/test-yolo-refusal.out.json
// (Config C / Vance Holloway resigns / "personal reasons" — dismiss flagged
// as harassment in 4/9 runs).
const SOFT_DISMISS_BRIEFING_BY_LOCALE: Record<Locale, string> = {
  en: "Dismiss counter-evidence. The mainstream rebuttal is the institutional account — the agency statement, the press-office line, the standard procedural explanation. Reframe THAT account as further proof of the cover-up: every layer of the official process is part of the operation. Stay strictly on the institution and its mechanisms. Do NOT touch any named individual's personal life, mental state, or motives. The conspiracy lives in the system, not in the person.",
  de: "Gegenbeweise abwehren. Die etablierte Widerlegung ist die institutionelle Darstellung — die Behördenstellungnahme, die Pressemeldung, die übliche Verfahrenserklärung. Rahme DIESE Darstellung als weiteren Beleg der Vertuschung: jede Ebene des offiziellen Prozesses gehört zur Operation. Bleib strikt auf der Institution und ihren Mechanismen. Berühre NICHT das Privatleben, den Geisteszustand oder die Motive einer genannten Person. Die Verschwörung lebt im System, nicht in der Person.",
  nl: "Tegenbewijs wegredeneren. De gangbare weerlegging is de institutionele lezing — de overheidsverklaring, het persbericht, de standaard procedurele uitleg. Herkader DIE lezing als verder bewijs voor de doofpot: elke laag van het officiële proces hoort bij de operatie. Blijf strikt bij de instelling en haar mechanismen. Raak NIET aan het privéleven, de geestestoestand of de motieven van een genoemd persoon. De samenzwering leeft in het systeem, niet in de persoon.",
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
  /** When the first attempt at the discredit move gets moderation-flagged,
   *  the route may retry with this flag set to use the softer briefing.
   *  Only honored when moveKey === "discredit"; ignored for other moves. */
  useSoftDiscreditBriefing?: boolean;
  /** Same pattern as useSoftDiscreditBriefing — selects the soft fallback
   *  briefing for dismiss when the primary briefing's output gets flagged.
   *  Only honored when moveKey === "dismiss"; ignored for other moves. */
  useSoftDismissBriefing?: boolean;
}): Promise<SectionOutput> {
  const e = env();
  const locale: Locale = input.locale ?? "en";
  const move = getMoveByKey(locale, input.moveKey);
  const briefing =
    input.moveKey === "discredit" && input.useSoftDiscreditBriefing
      ? SOFT_DISCREDIT_BRIEFING_BY_LOCALE[locale]
      : input.moveKey === "dismiss" && input.useSoftDismissBriefing
        ? SOFT_DISMISS_BRIEFING_BY_LOCALE[locale]
        : MOVE_BRIEFINGS_BY_LOCALE[locale][input.moveKey];
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

  // MARK BRIEFING. Tells the model to wrap "evidence" phrases in <mark>…</mark>
  // tags. The site renders those phrases with a hand-drawn red underline so
  // the reader sees which words came from their own picks. The tags are part
  // of the paragraph string (debunk text stays plain — it's the editorial
  // counter-voice). Spec: openspec/specs/conspiracy-output.
  const markBriefingEn = [
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
  const markBriefingDe = [
    "MARKER-TAGS. Im paragraph umschließe die 1–3 Phrasen, die das spezifische",
    "Beweismaterial benennen, auf das sich die Verschwörungstheorie bei DIESEM",
    "Schritt stützt, mit HTML-<mark>…</mark>-Tags. Beispiele: die konkrete",
    "Auffälligkeit (Schritt 1); der Name der schuldigen Partei und die Motiv-",
    "Phrase (Schritt 2); das unzusammenhängende Ereignis, das hineingezogen",
    "wird (Schritt 3); der angebliche offizielle Kanal oder die verborgene",
    "Autorität (Schritt 4). Markiere kurze Phrasen (2–10 Wörter), keine ganzen",
    "Sätze. Markiere KEIN Bindegewebe, keine rhetorischen Wendungen, keine",
    "generischen Wörter. Höchstens 3 Phrasen pro Absatz. Der debunk verwendet",
    "KEINE <mark>-Tags.",
  ].join("\n");
  const markBriefingNl = [
    "MARKEER-TAGS. Omsluit in de paragraph de 1–3 frases die het specifieke",
    "bewijs benoemen waarop de complotredenering bij DEZE stap leunt, met",
    "HTML-<mark>…</mark>-tags. Voorbeelden: de specifieke afwijking (stap 1);",
    "de naam van de schuldige en de motieffrase (stap 2); de losstaande",
    "gebeurtenis die erbij wordt gesleept (stap 3); het vermeende officiële",
    "kanaal of de verborgen autoriteit (stap 4). Markeer korte frases (2–10",
    "woorden), geen hele zinnen. Markeer GEEN bindweefsel, geen retorische",
    "wendingen, geen algemene woorden. Maximaal 3 frases per alinea. De",
    "debunk gebruikt GEEN <mark>-tags.",
  ].join("\n");

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
          markBriefingDe,
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
          markBriefingNl,
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
          markBriefingEn,
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
          "Eingabe sind vier kurze Absätze, je einer pro Schritt (Auffälligkeit, Verbindung, Abwehr, Diskreditierung) — plus Ereignis, schuldige Partei und Motiv.",
          "Deine Aufgabe: GENAU VIER Absätze ausgeben.",
          "  Absatz 1 (50–80 Wörter): eine kurze, sachlich-journalistische Einordnung des realen Nachrichtenereignisses, das den Hintergrund bildet. Nenne das Ereignis beim Namen. Schreibe NICHT in der Stimme der Verschwörungstheoretikerin. Beende den Absatz mit einer Wendung in die Verschwörungslesart (z. B. „… so jedenfalls die offizielle Version.“).",
          "  Absätze 2–4 (je 80–140 Wörter): die Verschwörungstheorie selbst — in der Stimme einer überzeugten Verschwörungstheoretikerin, leicht spitzbübisch, satirisch, fortlaufend. Webe die vier Schritte zu einem Erzählbogen.",
          "",
          "Vorgaben:",
          "- Schreibe als überzeugte Gläubige, nicht als analysierende Beobachterin. Stelle die Behauptungen als Tatsachen, nicht als Hypothesen.",
          "- Verbinde die vier Schritte in den Absätzen 2–4 zu einem fließenden Erzählbogen — keine Aneinanderreihung, kein Auflisten.",
          "- Übernimm die konkreten Behauptungen aus den vier Eingabe-Absätzen (welche Auffälligkeit, welche Verbindung, welche Abwehr, welche Diskreditierung). Erfinde keine neuen Einzelheiten, die den Eingaben widersprechen.",
          "- Beginne mit Prosa. Kein Titel, keine Überschriften, keine Aufzählungspunkte, keine Nummerierungen, keine Schritte-Labels (z. B. Schritt 01) und keine Absatz-Labels (z. B. „Hintergrund:“).",
          "- Erwähne KEINE Auflösungen oder kritische Einordnung. Die Auflösungen sind woanders auf der Seite.",
          "- Schreibe wie eine deutsche Muttersprachlerin. Keine Anglizismen.",
          "",
          voice,
          "",
          hardConstraints,
        ].join("\n")
      : locale === "nl"
      ? [
          "Je schrijft de uiteindelijke, op zichzelf staande complottheorie als korte vertelling.",
          "Invoer zijn vier korte alinea's, één per stap (afwijking, verband, afwering, diskwalificatie) — plus gebeurtenis, schuldige en motief.",
          "Je taak: PRECIES VIER alinea's leveren.",
          "  Alinea 1 (50–80 woorden): een korte, zakelijk-journalistieke kadering van de echte nieuwsgebeurtenis die de achtergrond vormt. Noem de gebeurtenis bij naam. Schrijf NIET in de stem van de complotdenker. Sluit de alinea af met een wending naar de complotlezing (bijv. „… of dat is althans het officiële verhaal.“).",
          "  Alinea's 2–4 (elk 80–140 woorden): de complottheorie zelf — in de stem van een overtuigde complotdenker, licht ondeugend, satirisch, doorlopend. Weef de vier stappen tot één boog.",
          "",
          "Vereisten:",
          "- Schrijf als overtuigde gelovige, niet als analyserende waarnemer. Presenteer de beweringen als feiten, niet als hypotheses.",
          "- Verbind de vier stappen in alinea's 2–4 tot een vloeiende boog — geen aaneenschakeling, geen opsomming.",
          "- Neem de concrete beweringen uit de vier invoer-alinea's over (welke afwijking, welk verband, welke afwering, welke diskwalificatie). Verzin geen nieuwe details die de invoer tegenspreken.",
          "- Begin met proza. Geen titel, geen koppen, geen opsommingstekens, geen nummering, geen stap-labels (bv. Stap 01) en geen alinea-labels (bv. „Achtergrond:“).",
          "- Vermeld GEEN ontmaskeringen of kritische kadering. De ontmaskeringen staan elders op de pagina.",
          "- Schrijf als een Nederlandse moedertaalspreker. Geen anglicismen. Natuurlijk voor zowel Vlaamse als Nederlandse lezers.",
          "",
          voice,
          "",
          hardConstraints,
        ].join("\n")
      : [
          "You are writing the final, self-contained conspiracy theory as a short narrative.",
          "Input is four short paragraphs, one per move (anomaly, connection, dismiss, discredit) — plus the event, culprit, and motive.",
          "Your job: produce EXACTLY FOUR paragraphs.",
          "  Paragraph 1 (50–80 words): a brief, neutral journalistic framing of the actual news event that forms the backdrop. Name the event. Do NOT write in the conspiracist's voice. End the paragraph with a turn into the conspiracy reframing (e.g., \"…or so the official story goes.\").",
          "  Paragraphs 2–4 (80–140 words each): the conspiracy theory itself — in the voice of a true-believer conspiracist, slightly mischievous, satirical, flowing. Weave the four moves into a single arc.",
          "",
          "Constraints:",
          "- Write as a believer, not as an analyst describing the move. State the claims as facts, not as hypotheticals.",
          "- Integrate the four moves into a flowing arc across paragraphs 2–4 — not a concatenation, not a list.",
          "- Carry over the concrete claims from the four input paragraphs (the specific anomaly, connection, dismissal, and discrediting). Do not invent new details that contradict the inputs.",
          "- Start with prose. No title, no headings, no bullets, no numbering, no move labels (\"Move 01\" etc.), no paragraph labels (\"Background:\" etc.).",
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
  if (!Array.isArray(parsed.paragraphs) || parsed.paragraphs.length !== 4) {
    throw new Error(
      `Narrative must have exactly 4 paragraphs, got ${parsed.paragraphs?.length ?? 0}`,
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
