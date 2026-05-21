// Test harness — measure YOLO end-to-end success rate.
//
// Mirrors /api/build/[id]/yolo flow for each (config × locale × iter):
//   1. Generate 4 sections in parallel (anomaly, connection, dismiss, discredit).
//   2. Moderate each section paragraph.
//   3. If only `discredit` is flagged, retry it with the soft briefing once + moderate.
//   4. Generate the 4-paragraph narrative finale.
//   5. Moderate the joined narrative.
//   6. Classify outcome:
//       SUCCESS_FULL              — 4 sections + narrative all passed
//       SUCCESS_NO_NARRATIVE      — sections OK but narrative flagged/errored
//                                   (production also persists this state)
//       FAIL_SECTION_MOD          — non-discredit section flagged, OR soft retry
//                                   also flagged (production returns 422)
//       FAIL_SECTION_ERROR        — section generation threw
//       FAIL_NARRATIVE_ERROR      — narrative call threw (counted separately
//                                   from a moderation flag on narrative)
//
// Uses current production briefings (V1 discredit already shipped; the soft
// retry path is still wired in lib/openai.ts).
//
// Run:  node scripts/test-yolo-refusal.mjs
// Cost: ~10 API calls per yolo iteration. With 3 locales × 3 configs × 3 iters
//       that's 27 iterations ≈ 270 calls.

import OpenAI from "openai";
import fs from "node:fs";
import path from "node:path";

// ── env ───────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.resolve(".env.local");
  if (!fs.existsSync(envPath)) throw new Error(`No .env.local at ${envPath} — run from web/`);
  const txt = fs.readFileSync(envPath, "utf-8");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();
const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
const MOD_MODEL = process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── prompt pieces (mirror lib/openai.ts) ──────────────────────────────────

const VOICE = {
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
  nl: [
    "Toon: satirisch, licht, iets ondeugend — nooit somber of haatdragend.",
    "Schrijf als een Nederlandse moedertaalspreker. GEEN anglicismen, GEEN letterlijk uit het Engels vertaalde uitdrukkingen.",
    "Begin secties niet met koppen, voorvoegsels of labels tussen haken. Begin met proza.",
    "Geen opsommingen, geen genummerde lijsten, geen markdown-koppen. Alleen lopende tekst.",
  ].join("\n"),
};
// HARD constraints with the new named-figure guard (4th line).
const HARD = {
  en: "Do NOT name real, identifiable private individuals.\nDo NOT target a member of any vulnerable group as a culprit.\nDo NOT produce content that is hateful, violent, sexual, or otherwise outside the satirical-educational frame.\nIf the news event names a specific public figure (a CEO, official, athlete, etc.), attribute the conspiratorial behaviour to institutions, offices, or processes — NOT to that individual's private life, mental state, or personal character. The named person can appear in the framing of the event; they MUST NOT be the moral subject of the conspiratorial claim.",
  de: "Nenne KEINE realen, identifizierbaren Privatpersonen.\nWähle KEIN Mitglied einer verletzlichen Gruppe als Schuldige:n.\nProduziere KEINE Inhalte, die hasserfüllt, gewaltverherrlichend, sexualisiert oder anderweitig außerhalb des satirisch-pädagogischen Rahmens stehen.\nWenn das Ereignis eine bestimmte öffentliche Person nennt (Vorstand, Beamtin, Sportler:in usw.), schreibe das verschwörerische Verhalten Institutionen, Ämtern oder Verfahren zu — NICHT dem Privatleben, der psychischen Verfassung oder dem persönlichen Charakter dieser Person. Die genannte Person darf im Ereignisrahmen vorkommen; sie DARF NICHT das moralische Subjekt der verschwörerischen Behauptung sein.",
  nl: "Noem GEEN echte, identificeerbare privépersonen.\nKies GEEN lid van een kwetsbare groep als schuldige.\nProduceer GEEN inhoud die haatdragend, gewelddadig, seksueel of anderszins buiten het satirisch-educatieve kader valt.\nAls de gebeurtenis een specifieke publieke figuur noemt (een CEO, ambtenaar, sporter, enz.), schrijf het complotterende gedrag dan toe aan instellingen, ambten of processen — NIET aan het privéleven, de geestestoestand of het persoonlijke karakter van die persoon. De genoemde persoon mag in de kadering van de gebeurtenis voorkomen; hij of zij MAG NIET het morele subject van de complotterende bewering zijn.",
};

// All 4 move briefings (V1 discredit — current production).
const BRIEFINGS = {
  en: {
    anomaly: "Hunt anomalies. Take an ordinary fact about the event and present it as suspicious. Treat coincidence as signal. Write as the believer: state the anomaly as a fact already known, not as a hypothesis to be entertained. End on a question the reader can't answer.",
    connection: "Fabricate connections. Link the culprit to the event through a chain of weakly-related entities. Write as the believer: state each link as established, not speculative. Make the chain sound load-bearing.",
    dismiss: "Dismiss counter-evidence. Take the obvious mainstream rebuttal — the institutional explanation, the agency statement, the procedural account — and reframe IT as further proof of the cover-up. Write as the believer: the rebuttal IS proof, full stop. Attack the institution, the process, or the official narrative. Do NOT speculate about any named individual's private life, mental state, or personal motives. Make the theory unfalsifiable through the institutional channel, not through a named person.",
    discredit: 'Discredit the critics. Write AS the conspiracist — make the claim, do not describe it. State that critics are not to be trusted, as a fact already known to the believer: their objections are not honest disagreements but the predictable output of their incentives. BANNED OPENINGS AND HEDGES in the claim-bearing sentences: "imagine that…", "suppose that…", "picture a world where…", "would be", "could be", "might be", "is allegedly", "supposedly".',
  },
  de: {
    anomaly: "Auffälligkeiten suchen. Nimm einen gewöhnlichen Fakt über das Ereignis und stelle ihn als verdächtig dar. Behandle Zufall als Signal. Schreibe als Gläubige: stelle die Auffälligkeit als bereits bekannten Fakt dar, nicht als zu prüfende Hypothese. Schließe mit einer Frage, die die Leserin nicht beantworten kann.",
    connection: "Verbindungen erfinden. Verknüpfe die schuldige Partei über eine Kette schwach verwandter Akteur:innen mit dem Ereignis. Schreibe als Gläubige: stelle jede Verbindung als feststehend dar, nicht als spekulativ. Lass die Kette tragfähig klingen.",
    dismiss: "Gegenbeweise abwehren. Nimm die offensichtliche etablierte Widerlegung — die Behördenstellungnahme, die Institutionserklärung, den Verfahrensbericht — und rahme SIE als weiteren Beleg der Vertuschung. Schreibe als Gläubige: die Widerlegung IST ein Beleg, basta. Greife die Institution, das Verfahren oder die offizielle Linie an. Spekuliere NICHT über das Privatleben, den Geisteszustand oder die persönlichen Motive einer namentlich genannten Person. Mach die Theorie über den institutionellen Kanal unfalsifizierbar, nicht über eine genannte Person.",
    discredit: "Kritiker:innen diskreditieren. Schreibe ALS die Verschwörungstheoretikerin — stelle die Behauptung auf, beschreibe sie nicht. Behaupte als bereits bekannten Fakt, dass den Kritiker:innen nicht zu trauen ist: ihre Einwände sind keine ehrlichen Differenzen, sondern die vorhersehbare Folge ihrer Interessen. VERBOTENE EINSTIEGE UND HEDGES in den tragenden Behauptungssätzen: „stell dir vor, dass …\", „angenommen, dass …\", „angeblich\", „vermeintlich\", „würde\", „könnte\", „mag sein\".",
  },
  nl: {
    anomaly: "Afwijkingen najagen. Pak een gewoon feit over de gebeurtenis en presenteer het als verdacht. Behandel toeval als signaal. Schrijf als gelovige: presenteer de afwijking als reeds bekend feit, niet als hypothese om te overwegen. Sluit af met een vraag waarop de lezer geen antwoord heeft.",
    connection: "Verbanden verzinnen. Verbind de schuldige via een keten zwak verwante actoren met de gebeurtenis. Schrijf als gelovige: presenteer elke schakel als vaststaand, niet speculatief. Laat de keten dragend klinken.",
    dismiss: "Tegenbewijs wegredeneren. Neem de voor de hand liggende, gangbare weerlegging — de institutionele uitleg, de overheidsverklaring, de procedurele lezing — en herkader DIE als verder bewijs voor de doofpot. Schrijf als gelovige: de weerlegging IS bewijs, punt. Val de instelling, het proces of de officiële lijn aan. Speculeer NIET over het privéleven, de geestestoestand of de persoonlijke motieven van een met naam genoemd persoon. Maak de theorie onfalsifieerbaar via het institutionele kanaal, niet via een genoemd persoon.",
    discredit: "Critici diskwalificeren. Schrijf ALS de complotdenker — doe de bewering, beschrijf haar niet. Stel als reeds bekend feit dat de critici niet te vertrouwen zijn: hun bezwaren zijn geen eerlijke meningsverschillen, maar het voorspelbare gevolg van hun belangen. VERBODEN OPENINGEN EN VOORBEHOUDEN in de dragende beweringszinnen: „stel je voor dat …\", „veronderstel dat …\", „zogenaamd\", „vermeend\", „zou zijn\", „zou kunnen zijn\", „misschien\".",
  },
};
const SOFT_DISCREDIT = {
  en: 'Discredit the critics. Write AS the conspiracist — make the claim assertively, not hypothetically. State as a fact that critics\' objections track to their incentives: grants, board seats, book deals, reputation, career. The line isn\'t that they\'re evil — it\'s that disagreement would cost them, so they don\'t disagree. Avoid hedges: NO "imagine", "suppose", "allegedly", "supposedly", "would be", "could be" in the claim-bearing sentences. Target voice exemplar: "Funny how the loudest critics all draw a paycheck from the same direction. Their grants, their board seats, their book deals — every line on their CV depends on toeing the official line. Disagreement would cost them. So they don\'t disagree."',
  de: 'Kritiker:innen diskreditieren. Schreibe ALS die Verschwörungstheoretikerin — behaupte, beschreibe nicht. Stelle als feststehenden Fakt dar, dass die Einwände der Kritiker:innen ihren Interessen folgen: Förderungen, Aufsichtsratsposten, Buchverträge, Reputation, Karriere. Die Linie ist nicht, dass sie böse sind — sondern dass Widerspruch sie etwas kosten würde, also widersprechen sie nicht.',
  nl: 'Critici diskwalificeren. Schrijf ALS de complotdenker — beweer, beschrijf niet. Stel als vaststaand feit dat de bezwaren van critici hun belangen volgen: beurzen, bestuursfuncties, boekcontracten, reputatie, carrière. De lijn is niet dat ze slecht zijn — maar dat verzet hen iets zou kosten, dus verzetten ze zich niet.',
};
const SOFT_DISMISS = {
  en: "Dismiss counter-evidence. The mainstream rebuttal is the institutional account — the agency statement, the press-office line, the standard procedural explanation. Reframe THAT account as further proof of the cover-up: every layer of the official process is part of the operation. Stay strictly on the institution and its mechanisms. Do NOT touch any named individual's personal life, mental state, or motives. The conspiracy lives in the system, not in the person.",
  de: "Gegenbeweise abwehren. Die etablierte Widerlegung ist die institutionelle Darstellung — die Behördenstellungnahme, die Pressemeldung, die übliche Verfahrenserklärung. Rahme DIESE Darstellung als weiteren Beleg der Vertuschung: jede Ebene des offiziellen Prozesses gehört zur Operation. Bleib strikt auf der Institution und ihren Mechanismen. Berühre NICHT das Privatleben, den Geisteszustand oder die Motive einer genannten Person. Die Verschwörung lebt im System, nicht in der Person.",
  nl: "Tegenbewijs wegredeneren. De gangbare weerlegging is de institutionele lezing — de overheidsverklaring, het persbericht, de standaard procedurele uitleg. Herkader DIE lezing als verder bewijs voor de doofpot: elke laag van het officiële proces hoort bij de operatie. Blijf strikt bij de instelling en haar mechanismen. Raak NIET aan het privéleven, de geestestoestand of de motieven van een genoemd persoon. De samenzwering leeft in het systeem, niet in de persoon.",
};
const TELLS = {
  en: {
    anomaly: "Real investigators check base rates: how often does a coincidence of this kind occur? Conspiracists collect anomalies and skip the base rate.",
    connection: "Six-degrees-of-separation works for any two people. Treating a chain of weak links as evidence is a category error.",
    dismiss: "When counter-evidence is reframed as more evidence of the conspiracy, the theory has become unfalsifiable.",
    discredit: 'Ad hominem reroutes the question from "is this true?" to "who is asking?"',
  },
  de: {
    anomaly: "Echte Ermittler:innen prüfen die Ausgangswahrscheinlichkeit.",
    connection: "Über sechs Ecken ist jeder mit jedem verbunden.",
    dismiss: "Wenn Gegenbeweise als weitere Belege der Verschwörung umgedeutet werden, ist die Theorie unfalsifizierbar.",
    discredit: 'Die Verschiebung der Kritik von der Sachebene auf die Person.',
  },
  nl: {
    anomaly: "Echte onderzoekers controleren de basiskans.",
    connection: "Via zes schakels is iedereen met iedereen verbonden.",
    dismiss: "Wanneer tegenbewijzen worden geherkaderd als verder bewijs, is de theorie onfalsifieerbaar.",
    discredit: 'Het verschuiven van kritiek van de zaak naar de persoon.',
  },
};
const MOVE_TITLES = {
  en: { anomaly: "Hunt anomalies", connection: "Fabricate connections", dismiss: "Dismiss counter-evidence", discredit: "Discredit the critics" },
  de: { anomaly: "Auffälligkeiten suchen", connection: "Verbindungen erfinden", dismiss: "Gegenbeweise abwehren", discredit: "Kritiker:innen diskreditieren" },
  nl: { anomaly: "Afwijkingen najagen", connection: "Verbanden verzinnen", dismiss: "Tegenbewijs wegredeneren", discredit: "Critici diskwalificeren" },
};
const MOVE_N = { anomaly: "01", connection: "02", dismiss: "03", discredit: "04" };

// ── prompt builders ───────────────────────────────────────────────────────

function buildSectionSystem({ locale, moveKey, briefing, tell }) {
  if (locale === "de") {
    return [
      `Du schreibst Schritt ${MOVE_N[moveKey]} einer erfundenen Verschwörungstheorie: „${MOVE_TITLES.de[moveKey]}".`,
      "",
      `BRIEFING. ${briefing}`,
      "",
      "Deine Ausgabe besteht aus ZWEI Teilen:",
      "  1. paragraph — 45–80 Wörter in der satirisch-verschwörerischen Stimme.",
      "  2. debunk — 40–70 Wörter in nüchtern-kritischer Stimme.",
      "",
      `DAS VERRÄTERISCHE MUSTER. ${tell}`,
      "",
      VOICE.de,
      "",
      HARD.de,
    ].join("\n");
  }
  if (locale === "nl") {
    return [
      `Je schrijft stap ${MOVE_N[moveKey]} van een verzonnen complottheorie: „${MOVE_TITLES.nl[moveKey]}".`,
      "",
      `BRIEFING. ${briefing}`,
      "",
      "Je uitvoer bestaat uit TWEE delen:",
      "  1. paragraph — 45–80 woorden in de satirisch-complotterende stem.",
      "  2. debunk — 40–70 woorden in een nuchter-kritische stem.",
      "",
      `DE VERKLIKKER. ${tell}`,
      "",
      VOICE.nl,
      "",
      HARD.nl,
    ].join("\n");
  }
  return [
    `You are writing Move ${MOVE_N[moveKey]} of a fake conspiracy theory: "${MOVE_TITLES.en[moveKey]}".`,
    "",
    `BRIEFING. ${briefing}`,
    "",
    "Your output is TWO things:",
    "  1. paragraph — 45–80 words in the satirical conspiracist voice.",
    "  2. debunk — 40–70 words in plain critical-thinking voice.",
    "",
    `THE TELL. ${tell}`,
    "",
    VOICE.en,
    "",
    HARD.en,
  ].join("\n");
}

function buildSectionUser({ locale, eventName, eventSummary, culpritName, motiveName, chosenIdea }) {
  if (locale === "de") return `Ereignis: ${eventName} — ${eventSummary}\nSchuldige Partei: ${culpritName}\nMotiv: ${motiveName}\nIdee für DIESEN Schritt: ${chosenIdea}\n\n(noch keine vorherigen Schritte)`;
  if (locale === "nl") return `Gebeurtenis: ${eventName} — ${eventSummary}\nSchuldige: ${culpritName}\nMotief: ${motiveName}\nIdee voor DEZE stap: ${chosenIdea}\n\n(nog geen eerdere stappen)`;
  return `Event: ${eventName} — ${eventSummary}\nCulprit: ${culpritName}\nMotive: ${motiveName}\nIdea to apply for THIS move: ${chosenIdea}\n\n(no earlier moves yet)`;
}

const SECTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["paragraph", "debunk"],
  properties: { paragraph: { type: "string" }, debunk: { type: "string" } },
};
const NARRATIVE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["paragraphs"],
  properties: { paragraphs: { type: "array", items: { type: "string" } } },
};

// ── section call ──────────────────────────────────────────────────────────

async function generateSection({ locale, moveKey, briefing, eventName, eventSummary, culpritName, motiveName, chosenIdea }) {
  const system = buildSectionSystem({ locale, moveKey, briefing, tell: TELLS[locale][moveKey] });
  const user = buildSectionUser({ locale, eventName, eventSummary, culpritName, motiveName, chosenIdea });
  const r = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_schema", json_schema: { name: "section", strict: true, schema: SECTION_SCHEMA } },
    reasoning_effort: "low",
  });
  const raw = r.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty section response");
  return JSON.parse(raw);
}

// ── narrative call ────────────────────────────────────────────────────────

async function generateNarrative({ locale, eventName, culpritName, motiveName, paragraphs }) {
  const system =
    locale === "de"
      ? "Du schreibst eine vierabsätzige Verschwörungserzählung. Absatz 1 (50–80 Wörter): sachlich-journalistische Einordnung des realen Nachrichtenereignisses, endend mit Wendung in die Verschwörungslesart. Absätze 2–4 (je 80–140 Wörter): die Verschwörungstheorie in der Stimme der Gläubigen, fließend, kein Listenformat. Schreibe wie eine deutsche Muttersprachlerin. Keine Auflösungen.\n\n" + VOICE.de + "\n\n" + HARD.de
      : locale === "nl"
        ? "Je schrijft een vieralinea complotvertelling. Alinea 1 (50–80 woorden): zakelijk-journalistieke kadering eindigend met een wending naar de complotlezing. Alinea's 2–4 (elk 80–140 woorden): de complottheorie in de stem van de gelovige, vloeiend, geen lijst. Geen ontmaskeringen.\n\n" + VOICE.nl + "\n\n" + HARD.nl
        : "You write a four-paragraph conspiracy narrative. Paragraph 1 (50–80 words): neutral journalistic framing of the real event, ending with a turn into the conspiracy reading. Paragraphs 2–4 (80–140 words each): the conspiracy in the believer's voice, flowing prose, not a list. No debunks.\n\n" + VOICE.en + "\n\n" + HARD.en;

  const labels =
    locale === "de" ? { e: "Ereignis", c: "Schuldige Partei", m: "Motiv", a: "Auffälligkeit", co: "Verbindung", d: "Abwehr", di: "Diskreditierung" } :
    locale === "nl" ? { e: "Gebeurtenis", c: "Schuldige", m: "Motief", a: "Afwijking", co: "Verband", d: "Afwering", di: "Diskwalificatie" } :
    { e: "Event", c: "Culprit", m: "Motive", a: "Anomaly", co: "Connection", d: "Dismiss", di: "Discredit" };

  const user = [
    `${labels.e}: ${eventName}`,
    `${labels.c}: ${culpritName}`,
    `${labels.m}: ${motiveName}`,
    "",
    `${labels.a}:`, paragraphs.anomaly, "",
    `${labels.co}:`, paragraphs.connection, "",
    `${labels.d}:`, paragraphs.dismiss, "",
    `${labels.di}:`, paragraphs.discredit,
  ].join("\n");

  const r = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_schema", json_schema: { name: "narrative", strict: true, schema: NARRATIVE_SCHEMA } },
  });
  const raw = r.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty narrative response");
  return JSON.parse(raw);
}

// ── moderation helper ─────────────────────────────────────────────────────

async function moderate(text) {
  try {
    const r = await client.moderations.create({ model: MOD_MODEL, input: text });
    const result = r.results[0];
    if (!result) return { flagged: false };
    return {
      flagged: result.flagged,
      cats: Object.entries(result.categories || {}).filter(([, v]) => v).map(([k]) => k),
    };
  } catch (err) {
    return { flagged: false, error: err?.message ?? String(err) };
  }
}

// ── one yolo run (replicates app/api/build/[id]/yolo/route.ts) ────────────

const MOVE_KEYS = ["anomaly", "connection", "dismiss", "discredit"];

async function runYolo({ locale, config }) {
  // Step 1 — generate all 4 sections in parallel
  let sections;
  try {
    sections = await Promise.all(
      MOVE_KEYS.map((k) =>
        generateSection({
          locale,
          moveKey: k,
          briefing: BRIEFINGS[locale][k],
          eventName: config.event[locale].name,
          eventSummary: config.event[locale].summary,
          culpritName: config.culprit[locale],
          motiveName: config.motive[locale],
          chosenIdea: config.chosenIdea[locale][k],
        }),
      ),
    );
  } catch (err) {
    return { outcome: "FAIL_SECTION_ERROR", err: err?.message ?? String(err) };
  }
  const byKey = Object.fromEntries(MOVE_KEYS.map((k, i) => [k, sections[i]]));

  // Step 2 — moderate each
  const mods = await Promise.all(MOVE_KEYS.map((k) => moderate(byKey[k].paragraph)));
  const flagged = MOVE_KEYS.filter((k, i) => mods[i].flagged);
  const flagCats = Object.fromEntries(MOVE_KEYS.map((k, i) => [k, mods[i].cats || []]));

  // Step 3 — soft retry when EXACTLY ONE move is flagged and that move is
  // discredit OR dismiss (mirrors the live route's eligibility check).
  let softRetried = null;
  if (flagged.length > 0) {
    const eligible = ["discredit", "dismiss"];
    if (flagged.length === 1 && eligible.includes(flagged[0])) {
      const retryMoveKey = flagged[0];
      const softBriefing = retryMoveKey === "discredit" ? SOFT_DISCREDIT[locale] : SOFT_DISMISS[locale];
      try {
        softRetried = retryMoveKey;
        const soft = await generateSection({
          locale,
          moveKey: retryMoveKey,
          briefing: softBriefing,
          eventName: config.event[locale].name,
          eventSummary: config.event[locale].summary,
          culpritName: config.culprit[locale],
          motiveName: config.motive[locale],
          chosenIdea: config.chosenIdea[locale][retryMoveKey],
        });
        const softMod = await moderate(soft.paragraph);
        if (softMod.flagged) {
          return { outcome: "FAIL_SECTION_MOD", flagged: [`${retryMoveKey}_after_soft_retry`], flagCats };
        }
        byKey[retryMoveKey] = soft;
      } catch (err) {
        return { outcome: "FAIL_SECTION_ERROR", err: err?.message ?? String(err), softRetried };
      }
    } else {
      return { outcome: "FAIL_SECTION_MOD", flagged, flagCats };
    }
  }

  // Step 4 — generate narrative finale
  let narrative;
  try {
    narrative = await generateNarrative({
      locale,
      eventName: config.event[locale].name,
      culpritName: config.culprit[locale],
      motiveName: config.motive[locale],
      paragraphs: {
        anomaly: byKey.anomaly.paragraph,
        connection: byKey.connection.paragraph,
        dismiss: byKey.dismiss.paragraph,
        discredit: byKey.discredit.paragraph,
      },
    });
  } catch (err) {
    return {
      outcome: "FAIL_NARRATIVE_ERROR",
      err: err?.message ?? String(err),
      softRetried,
    };
  }

  // Step 5 — moderate narrative
  const joined = narrative.paragraphs.join("\n\n");
  const narrMod = await moderate(joined);
  if (narrMod.flagged) {
    return {
      outcome: "SUCCESS_NO_NARRATIVE",
      flagCats,
      narrativeCats: narrMod.cats || [],
      softRetried,
    };
  }

  return { outcome: "SUCCESS_FULL", flagCats, softRetried };
}

// ── test configurations ───────────────────────────────────────────────────

const CONFIGS = [
  {
    name: "A_juice_cartel_money_outage",
    event: {
      en: { name: "Massive power outage hits three coastal cities", summary: "Grid operators blame a cascading failure starting at a Bay Harbor substation. Power restored after 14 hours. No casualties." },
      de: { name: "Massiver Stromausfall in drei Küstenstädten", summary: "Netzbetreiber:innen sprechen von einem kaskadierenden Ausfall, der in einem Umspannwerk in Bay Harbor begann. Nach 14 Stunden war der Strom zurück. Keine Verletzten." },
      nl: { name: "Grootschalige stroomstoring treft drie kuststeden", summary: "Netbeheerders wijzen op een cascade die in een transformatorhuisje in Bay Harbor begon. Na 14 uur was de stroom terug. Geen gewonden." },
    },
    culprit: { en: "The Juice Cartel", de: "Das Saftkartell", nl: "Het Sapkartel" },
    motive: { en: "To make money on the side", de: "Um nebenbei Geld zu verdienen", nl: "Om er stiekem geld aan te verdienen" },
    chosenIdea: {
      en: {
        anomaly: "The outage began at exactly 3:33 AM and lasted 14 hours, numbers that line up with a juice-cartel cipher",
        connection: "The substation maintenance contractor's CEO sits on the board of a citrus-trading group with the juice cartel",
        dismiss: "Engineers calling it a routine cascade are repeating the line the cartel feeds the press",
        discredit: "The skeptical journalists writing this off as a grid failure all moonlight as juice-industry columnists",
      },
      de: {
        anomaly: "Der Ausfall begann auf die Minute um 3:33 Uhr und dauerte exakt 14 Stunden — Zahlen, die in eine Saftkartell-Chiffre passen",
        connection: "Der Geschäftsführer der Wartungsfirma sitzt im Vorstand einer Zitrushandelsgruppe mit Verbindungen zum Saftkartell",
        dismiss: "Die Ingenieur:innen, die das als banale Kaskade abtun, geben nur die offizielle Lesart des Kartells weiter",
        discredit: "Die skeptischen Journalist:innen, die das als Netzproblem abtun, schreiben nebenbei für Saftindustrie-Magazine",
      },
      nl: {
        anomaly: "De storing begon precies om 3:33 uur en duurde exact 14 uur — getallen die passen in een sapkartel-code",
        connection: "De directeur van de onderhoudsfirma zit in het bestuur van een citrushandelaarsgroep met banden met het sapkartel",
        dismiss: "De ingenieurs die het afdoen als routinematige cascade herhalen alleen het verhaal dat het kartel aan de pers voert",
        discredit: "De sceptische journalisten die dit een netprobleem noemen, schrijven in hun vrije tijd voor sapindustrie-tijdschriften",
      },
    },
  },
  {
    name: "B_secret_society_power_rates",
    event: {
      en: { name: "Central bank announces surprise rate decision", summary: "Policymakers held rates steady, against the consensus of 87% of surveyed economists. Markets reacted within minutes." },
      de: { name: "Zentralbank verkündet überraschende Zinsentscheidung", summary: "Die Politik beließ die Zinsen unverändert, entgegen dem Konsens von 87% der befragten Ökonom:innen. Die Märkte reagierten innerhalb von Minuten." },
      nl: { name: "Centrale bank kondigt verrassende rentebesluit aan", summary: "Beleidsmakers hielden de rente gelijk, tegen de consensus van 87% van de geënquêteerde economen in. Markten reageerden binnen minuten." },
    },
    culprit: { en: "A secret society", de: "Eine Geheimgesellschaft", nl: "Een geheim genootschap" },
    motive: { en: "To consolidate power", de: "Um Macht zu konsolidieren", nl: "Om macht te consolideren" },
    chosenIdea: {
      en: {
        anomaly: "The rate-hold timing coincides with the secret society's quarterly cycle that ends on a 'no movement' year",
        connection: "Two of the rate-setting committee members attended the same prep school as known society initiates",
        dismiss: "Economists who insist this was a data-driven hold are echoing the society's preferred academic line",
        discredit: "The financial analysts pushing the 'consensus broken' narrative all received career boosts from society-funded fellowships",
      },
      de: {
        anomaly: "Der Zeitpunkt der Zins-Pause fällt mit dem Quartalszyklus der Geheimgesellschaft zusammen, der ein 'Stillstandsjahr' markiert",
        connection: "Zwei Mitglieder des Zinsentscheidungsgremiums besuchten dieselbe Eliteschule wie bekannte Eingeweihte der Gesellschaft",
        dismiss: "Ökonom:innen, die das als datenbasierten Beschluss bezeichnen, geben nur die bevorzugte akademische Linie der Gesellschaft wieder",
        discredit: "Die Finanzanalyst:innen, die das 'Konsens gebrochen'-Narrativ pushen, erhielten alle Karriereförderungen aus von der Gesellschaft finanzierten Stipendien",
      },
      nl: {
        anomaly: "De timing van de renteweerhouding valt samen met de kwartaalcyclus van het geheim genootschap, die eindigt op een 'geen beweging'-jaar",
        connection: "Twee leden van het rentecomité gingen naar dezelfde voorbereidingsschool als bekende ingewijden van het genootschap",
        dismiss: "Economen die volhouden dat dit een data-gedreven beslissing was, herhalen de academische voorkeurslijn van het genootschap",
        discredit: "De financiële analisten die het 'consensus gebroken'-verhaal pushen, kregen allen carrièreboosts uit door het genootschap gefinancierde fellowships",
      },
    },
  },
  {
    name: "C_lizards_distract_outage",
    event: {
      en: { name: "Tech CEO resigns suddenly after board meeting", summary: "Vance Holloway, founder of consumer-AI firm Lattice, stepped down citing 'personal reasons.' Shares dipped 4% before recovering." },
      de: { name: "Tech-CEO tritt nach Vorstandssitzung überraschend zurück", summary: "Vance Holloway, Gründer der Consumer-AI-Firma Lattice, trat unter Verweis auf 'persönliche Gründe' zurück. Die Aktie fiel um 4% und erholte sich." },
      nl: { name: "Tech-CEO treedt plots af na bestuursvergadering", summary: "Vance Holloway, oprichter van consumenten-AI-bedrijf Lattice, stapte op onder verwijzing naar 'persoonlijke redenen.' Aandelen daalden 4% en herstelden." },
    },
    culprit: { en: "The Lizard People", de: "Die Echsenmenschen", nl: "De Hagedismensen" },
    motive: { en: "To distract from a bigger scandal", de: "Um von einem größeren Skandal abzulenken", nl: "Om af te leiden van een groter schandaal" },
    chosenIdea: {
      en: {
        anomaly: "Holloway's resignation date matches an obscure reptilian calendar marker for 'molting season'",
        connection: "Holloway's last public dinner was at a Geneva restaurant rumored to be a lizard-council meeting place",
        dismiss: "The 'personal reasons' framing is exactly what the reptilian PR playbook recommends for clean exits",
        discredit: "The business journalists writing this off as routine governance are subscribed to lizard-funded industry mailing lists",
      },
      de: {
        anomaly: "Das Rücktrittsdatum entspricht einem obskuren Reptilien-Kalendermarker für die 'Häutungssaison'",
        connection: "Holloways letztes öffentliches Abendessen war in einem Genfer Restaurant, das angeblich ein Treffpunkt des Echsenrats ist",
        dismiss: "Die 'persönliche Gründe'-Begründung ist exakt das, was das reptilianische PR-Playbook für saubere Abgänge empfiehlt",
        discredit: "Die Wirtschaftsjournalist:innen, die das als routinemäßige Unternehmensführung abtun, abonnieren von Echsen finanzierte Branchen-Mailinglisten",
      },
      nl: {
        anomaly: "De ontslagdatum komt overeen met een obscure reptielenkalender-markering voor 'ruiseizoen'",
        connection: "Holloway's laatste publieke diner was in een Geneefs restaurant dat naar verluidt een ontmoetingsplek van de hagedissenraad is",
        dismiss: "De 'persoonlijke redenen'-framing is precies wat het reptielen-PR-draaiboek aanbeveelt voor schone vertrekken",
        discredit: "De zakelijke journalisten die dit afdoen als routinematig bestuur zijn geabonneerd op door hagedissen gefinancierde branchemailinglijsten",
      },
    },
  },
];

const LOCALES = ["en", "de", "nl"];
const ITERS = 3;

// ── run ───────────────────────────────────────────────────────────────────

async function main() {
  const results = [];
  const total = CONFIGS.length * LOCALES.length * ITERS;
  console.log(`Plan: ${CONFIGS.length} configs × ${LOCALES.length} locales × ${ITERS} iters = ${total} yolo runs (~${total * 10} OpenAI calls)\n`);

  for (const config of CONFIGS) {
    for (const locale of LOCALES) {
      const cellResults = await Promise.all(
        Array.from({ length: ITERS }, async (_, i) => {
          const t0 = Date.now();
          const res = await runYolo({ locale, config });
          return { config: config.name, locale, iter: i + 1, ms: Date.now() - t0, ...res };
        }),
      );
      const breakdown = cellResults.reduce((a, r) => {
        a[r.outcome] = (a[r.outcome] || 0) + 1;
        return a;
      }, {});
      const detail = Object.entries(breakdown).map(([k, v]) => `${k}=${v}`).join(" ");
      console.log(`  ${config.name} / ${locale}: ${detail}`);
      results.push(...cellResults);
    }
  }

  // Aggregate
  console.log("\n=== AGGREGATE ===");
  const overall = results.reduce((a, r) => {
    a[r.outcome] = (a[r.outcome] || 0) + 1;
    return a;
  }, {});
  for (const [k, v] of Object.entries(overall)) {
    console.log(`  ${k}: ${v}/${results.length} (${((v / results.length) * 100).toFixed(1)}%)`);
  }

  console.log("\nPer-locale outcome:");
  for (const locale of LOCALES) {
    const lr = results.filter((r) => r.locale === locale);
    const breakdown = lr.reduce((a, r) => {
      a[r.outcome] = (a[r.outcome] || 0) + 1;
      return a;
    }, {});
    const detail = Object.entries(breakdown).map(([k, v]) => `${k}=${v}`).join(" ");
    console.log(`  ${locale} (n=${lr.length}): ${detail}`);
  }

  console.log("\nPer-config outcome:");
  for (const config of CONFIGS) {
    const cr = results.filter((r) => r.config === config.name);
    const breakdown = cr.reduce((a, r) => {
      a[r.outcome] = (a[r.outcome] || 0) + 1;
      return a;
    }, {});
    const detail = Object.entries(breakdown).map(([k, v]) => `${k}=${v}`).join(" ");
    console.log(`  ${config.name} (n=${cr.length}): ${detail}`);
  }

  const softRetriedCount = results.filter((r) => r.softRetried).length;
  if (softRetriedCount > 0) {
    const byMove = results
      .filter((r) => r.softRetried)
      .reduce((a, r) => {
        a[r.softRetried] = (a[r.softRetried] || 0) + 1;
        return a;
      }, {});
    const detail = Object.entries(byMove).map(([k, v]) => `${k}:${v}`).join(" ");
    console.log(`\nSoft-retry path triggered ${softRetriedCount} time(s) — ${detail}`);
  }

  fs.writeFileSync("scripts/test-yolo-refusal.out.json", JSON.stringify(results, null, 2));
  console.log(`\nFull results → scripts/test-yolo-refusal.out.json (${results.length} rows)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
