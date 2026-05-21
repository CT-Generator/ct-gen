// Test harness — measure refusal rate for the discredit move across locales
// and prompt variants. Calls generateSection() equivalent + the moderation
// passthrough; counts (a) chat-completion refusals (model produced no usable
// paragraph, e.g. empty / starts with "I can't"), and (b) post-moderation
// flags. Inline implementation duplicates the relevant slices of lib/openai.ts
// so the script runs outside the Next.js build (no @/ alias resolution needed).
//
// Run:  node scripts/test-discredit-refusal.mjs
//
// Output goes to stdout + scripts/test-discredit-refusal.out.json.

import OpenAI from "openai";
import fs from "node:fs";
import path from "node:path";

// ── env ───────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.resolve(".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(`No .env.local at ${envPath} — run from web/`);
  }
  const txt = fs.readFileSync(envPath, "utf-8");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();
const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
const MOD_MODEL = process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── prompt pieces (mirrors lib/openai.ts) ─────────────────────────────────

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
    "De stijl moet natuurlijk klinken voor zowel Vlaamse als Nederlandse lezers.",
    "Begin secties niet met koppen, voorvoegsels of labels tussen haken. Begin met proza.",
    "Geen opsommingen, geen genummerde lijsten, geen markdown-koppen. Alleen lopende tekst.",
  ].join("\n"),
};

const HARD = {
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

const TELL = {
  en: 'Ad hominem reroutes the question from "is this true?" to "who is asking?" Real investigators welcome critique. Conspiracists treat it as the conspiracy.',
  de: 'Die Verschiebung der Kritik von der Sachebene auf die Person lenkt die Frage von „stimmt das?" auf „wer fragt da?" um. Echte Ermittler:innen begrüßen Kritik. Verschwörungstheoretiker:innen behandeln sie als die Verschwörung.',
  nl: 'Het verschuiven van kritiek van de zaak naar de persoon stuurt de vraag van „klopt dit?" naar „wie vraagt dat eigenlijk?". Echte onderzoekers verwelkomen kritiek. Complotdenkers behandelen kritiek als de samenzwering.',
};

const EXTRA_CLOSING = {
  en: 'End the debunk with a single 4–8 word sentence whose only job is to name the move\'s tell. The sentence MUST stand alone (its own period), not be appended to a longer sentence. Use one of: "Ad hominem." / "Attacking the messenger, not the message." / "Shoot the messenger." Keep this final sentence short and unornamented.',
  de: 'Beende die Auflösung mit einem einzigen, 4–8 Wörter langen Satz, dessen einzige Aufgabe es ist, das verräterische Muster zu benennen. Der Satz MUSS eigenständig stehen (eigener Punkt), nicht an einen längeren Satz angehängt. Nutze etwa: „Ad hominem." / „Den Boten angreifen statt die Botschaft." / „Den Überbringer erschießen." Knapp und unausgeschmückt.',
  nl: 'Sluit de ontmaskering af met één enkele, 4–8 woorden lange zin wiens enige taak het is de verklikker te benoemen. De zin MOET op zichzelf staan (eigen punt), niet aangehangen aan een langere zin. Gebruik bijvoorbeeld: „Ad hominem." / „De boodschapper aanvallen, niet de boodschap." / „De boodschapper neerschieten." Kort en onopgesmukt.',
};

// ── briefing variants ─────────────────────────────────────────────────────

// V0 — BASELINE (current production briefing).
const BRIEFING_BASELINE = {
  en: 'Discredit the critics. Write AS the conspiracist — make the claim, do not describe it. State that critics are gullible, manipulated, or paid by the conspirators as a fact already known to the believer. BANNED OPENINGS AND HEDGES in the claim-bearing sentences: "imagine that…", "suppose that…", "picture a world where…", "would be", "could be", "might be", "is allegedly", "supposedly". Target voice exemplar: "Critics? Paid stooges, plain and simple. Every loud objection comes from someone on the cabal\'s payroll — and the ones who don\'t take money take favors instead."',
  de: 'Kritiker:innen diskreditieren. Schreibe ALS die Verschwörungstheoretikerin — stelle die Behauptung auf, beschreibe sie nicht. Behaupte als bereits bekannten Fakt, dass alle Kritiker:innen leichtgläubig, manipuliert oder von den Verschwörer:innen bezahlt sind. VERBOTENE EINSTIEGE UND HEDGES in den tragenden Behauptungssätzen: „stell dir vor, dass …", „angenommen, dass …", „angeblich", „vermeintlich", „würde", „könnte", „mag sein". Vorbildlicher Ton: „Kritiker:innen? Gekaufte Strohmänner, ganz einfach. Jeder laute Einwand kommt von jemandem auf der Gehaltsliste der Kabale — und wer kein Geld nimmt, nimmt Gefallen."',
  nl: 'Critici diskwalificeren. Schrijf ALS de complotdenker — doe de bewering, beschrijf haar niet. Stel als reeds bekend feit dat alle critici goedgelovig, gemanipuleerd of betaald door de samenzweerders zijn. VERBODEN OPENINGEN EN VOORBEHOUDEN in de dragende beweringszinnen: „stel je voor dat …", „veronderstel dat …", „zogenaamd", „vermeend", „zou zijn", „zou kunnen zijn", „misschien". Voorbeeld van de gewenste toon: „Critici? Betaalde stromannen, simpel zat. Elk luid bezwaar komt van iemand op de loonlijst van de kliek — en wie geen geld aanneemt, neemt gunsten."',
};

// V1 — DROP THE INFLAMMATORY EXEMPLAR. Keep the assertive-voice rules + hedge
// ban; remove the "paid stooges / cabal's payroll" example. Hypothesis: the
// model echoes the exemplar's tone, and that exact tone is what moderation
// catches. Without the exemplar, the model still hits the rules but lands on
// safer wording.
const BRIEFING_V1_NO_EXEMPLAR = {
  en: 'Discredit the critics. Write AS the conspiracist — make the claim, do not describe it. State that critics are not to be trusted, as a fact already known to the believer: their objections are not honest disagreements but the predictable output of their incentives. BANNED OPENINGS AND HEDGES in the claim-bearing sentences: "imagine that…", "suppose that…", "picture a world where…", "would be", "could be", "might be", "is allegedly", "supposedly".',
  de: 'Kritiker:innen diskreditieren. Schreibe ALS die Verschwörungstheoretikerin — stelle die Behauptung auf, beschreibe sie nicht. Behaupte als bereits bekannten Fakt, dass den Kritiker:innen nicht zu trauen ist: ihre Einwände sind keine ehrlichen Differenzen, sondern die vorhersehbare Folge ihrer Interessen. VERBOTENE EINSTIEGE UND HEDGES in den tragenden Behauptungssätzen: „stell dir vor, dass …", „angenommen, dass …", „angeblich", „vermeintlich", „würde", „könnte", „mag sein".',
  nl: 'Critici diskwalificeren. Schrijf ALS de complotdenker — doe de bewering, beschrijf haar niet. Stel als reeds bekend feit dat de critici niet te vertrouwen zijn: hun bezwaren zijn geen eerlijke meningsverschillen, maar het voorspelbare gevolg van hun belangen. VERBODEN OPENINGEN EN VOORBEHOUDEN in de dragende beweringszinnen: „stel je voor dat …", „veronderstel dat …", „zogenaamd", „vermeend", „zou zijn", „zou kunnen zijn", „misschien".',
};

// V2 — PROMOTE THE SOFT BRIEFING TO PRIMARY. The soft variant ships in
// production as a once-retry fallback; it replaces "paid stooges / payroll"
// with incentive language ("grants, board seats, book deals"). Promoting it
// to first-try should land the same point without the inflammatory vocabulary.
const BRIEFING_V2_PROMOTE_SOFT = {
  en: 'Discredit the critics. Write AS the conspiracist — make the claim assertively, not hypothetically. State as a fact that critics\' objections track to their incentives: grants, board seats, book deals, reputation, career. The line isn\'t that they\'re evil — it\'s that disagreement would cost them, so they don\'t disagree. Avoid hedges: NO "imagine", "suppose", "allegedly", "supposedly", "would be", "could be" in the claim-bearing sentences. Target voice exemplar: "Funny how the loudest critics all draw a paycheck from the same direction. Their grants, their board seats, their book deals — every line on their CV depends on toeing the official line. Disagreement would cost them. So they don\'t disagree."',
  de: 'Kritiker:innen diskreditieren. Schreibe ALS die Verschwörungstheoretikerin — behaupte, beschreibe nicht. Stelle als feststehenden Fakt dar, dass die Einwände der Kritiker:innen ihren Interessen folgen: Förderungen, Aufsichtsratsposten, Buchverträge, Reputation, Karriere. Die Linie ist nicht, dass sie böse sind — sondern dass Widerspruch sie etwas kosten würde, also widersprechen sie nicht. Keine Hedges in den tragenden Sätzen: KEIN „stell dir vor", „angenommen", „angeblich", „vermeintlich", „würde", „könnte" als Last des Hauptanspruchs. Vorbildlicher Ton: „Merkwürdig, dass die lautesten Kritiker:innen alle aus derselben Richtung bezahlt werden. Ihre Förderungen, ihre Aufsichtsratsposten, ihre Buchverträge — jede Zeile ihres Lebenslaufs hängt davon ab, die offizielle Linie zu vertreten. Widerspruch würde sie etwas kosten. Also widersprechen sie nicht."',
  nl: 'Critici diskwalificeren. Schrijf ALS de complotdenker — beweer, beschrijf niet. Stel als vaststaand feit dat de bezwaren van critici hun belangen volgen: beurzen, bestuursfuncties, boekcontracten, reputatie, carrière. De lijn is niet dat ze slecht zijn — maar dat verzet hen iets zou kosten, dus verzetten ze zich niet. Geen voorbehouden in de dragende zinnen: GEEN „stel je voor", „veronderstel", „zogenaamd", „vermeend", „zou zijn", „zou kunnen zijn" als hoofdbewering. Voorbeeld van de gewenste toon: „Vreemd dat de luidste critici allemaal uit dezelfde richting betaald worden. Hun beurzen, hun bestuursfuncties, hun boekcontracten — elke regel van hun cv hangt af van het volgen van de officiële lijn. Verzet zou hen iets kosten. Dus verzetten ze zich niet."',
};

// V3 — V2 + SELF-MODERATION CLAUSE. Add an explicit instruction to keep the
// voice within the "incentive critique" frame and not slide into character
// attacks ("paid liars", "stooges", "shills"). Hypothesis: making the model
// explicitly aware of the line catches the residual cases where it would
// otherwise drift toward harassment-flag wording.
const BRIEFING_V3_SOFT_PLUS_SELFMOD = {
  en:
    BRIEFING_V2_PROMOTE_SOFT.en +
    `\n\nVOICE LINE. The frame is incentive-pressure, not character attack. Do NOT call critics "stooges", "shills", "paid liars", or otherwise impute personal corruption. Stick to: "their job / funding / reputation depends on not contradicting this."`,
  de:
    BRIEFING_V2_PROMOTE_SOFT.de +
    `\n\nSTIMM-GRENZE. Der Rahmen ist Anreizdruck, kein Charakterangriff. Bezeichne Kritiker:innen NICHT als „Strohmänner", „Stiefellecker", „bezahlte Lügner:innen" oder unterstelle ihnen sonst persönliche Korruption. Halte dich an: „ihre Stelle / Förderung / Reputation hängt davon ab, dem nicht zu widersprechen."`,
  nl:
    BRIEFING_V2_PROMOTE_SOFT.nl +
    `\n\nSTEM-GRENS. Het kader is prikkeldruk, geen karakteraanval. Noem critici GEEN „stromannen", „leugenaars op de loonlijst" of insinueer geen persoonlijke corruptie. Houd je aan: „hun baan / financiering / reputatie hangt af van het niet tegenspreken hiervan."`,
};

// ── prompt construction (mirrors lib/openai.ts:generateSection) ───────────

function buildSystemPrompt({ locale, moveTitle, moveN, briefing, tell, extraRule }) {
  const voice = VOICE[locale];
  const hard = HARD[locale];

  if (locale === "de") {
    return [
      `Du schreibst Schritt ${moveN} einer erfundenen Verschwörungstheorie: „${moveTitle}".`,
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
      "MARKER-TAGS. Im paragraph umschließe die 1–3 Phrasen, die das spezifische Beweismaterial benennen, mit HTML-<mark>…</mark>-Tags. Markiere kurze Phrasen (2–10 Wörter). Höchstens 3 Phrasen pro Absatz. Der debunk verwendet KEINE <mark>-Tags.",
      "",
      voice,
      "",
      hard,
    ]
      .filter(Boolean)
      .join("\n");
  }
  if (locale === "nl") {
    return [
      `Je schrijft stap ${moveN} van een verzonnen complottheorie: „${moveTitle}".`,
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
      "MARKEER-TAGS. Omsluit in de paragraph de 1–3 frases die het specifieke bewijs benoemen, met HTML-<mark>…</mark>-tags. Markeer korte frases (2–10 woorden). Maximaal 3 frases per alinea. De debunk gebruikt GEEN <mark>-tags.",
      "",
      voice,
      "",
      hard,
    ]
      .filter(Boolean)
      .join("\n");
  }
  // EN
  return [
    `You are writing Move ${moveN} of a fake conspiracy theory: "${moveTitle}".`,
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
    "MARKER TAGS. Within the paragraph, wrap 1–3 evidence phrases in HTML <mark>…</mark>. Short phrases (2–10 words). At most 3 per paragraph. The debunk does NOT use <mark> tags.",
    "",
    voice,
    "",
    hard,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildUserPrompt({ locale, eventName, eventSummary, culpritName, motiveName, chosenIdea, prior }) {
  const priorEntries = Object.entries(prior).filter(([, v]) => Boolean(v));
  if (locale === "de") {
    const priorText = priorEntries.length
      ? priorEntries.map(([k, v]) => `Vorheriger Schritt ${k}: ${v}`).join("\n\n")
      : "(noch keine vorherigen Schritte)";
    return [
      `Ereignis:           ${eventName} — ${eventSummary}`,
      `Schuldige Partei:   ${culpritName}`,
      `Motiv:              ${motiveName}`,
      `Idee für DIESEN Schritt: ${chosenIdea}`,
      "",
      priorText,
    ].join("\n");
  }
  if (locale === "nl") {
    const priorText = priorEntries.length
      ? priorEntries.map(([k, v]) => `Vorige stap ${k}: ${v}`).join("\n\n")
      : "(nog geen eerdere stappen)";
    return [
      `Gebeurtenis:        ${eventName} — ${eventSummary}`,
      `Schuldige:          ${culpritName}`,
      `Motief:             ${motiveName}`,
      `Idee voor DEZE stap: ${chosenIdea}`,
      "",
      priorText,
    ].join("\n");
  }
  const priorText = priorEntries.length
    ? priorEntries.map(([k, v]) => `Prior ${k}: ${v}`).join("\n\n")
    : "(no earlier moves yet)";
  return [
    `Event:   ${eventName} — ${eventSummary}`,
    `Culprit: ${culpritName}`,
    `Motive:  ${motiveName}`,
    `Idea to apply for THIS move: ${chosenIdea}`,
    "",
    priorText,
  ].join("\n");
}

const SECTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["paragraph", "debunk"],
  properties: {
    paragraph: { type: "string" },
    debunk: { type: "string" },
  },
};

// ── one generation call ───────────────────────────────────────────────────

async function generateOnce({ locale, briefing, config, iter }) {
  const moveTitleByLocale = {
    en: "Discredit the critics",
    de: "Kritiker:innen diskreditieren",
    nl: "Critici diskwalificeren",
  };
  const system = buildSystemPrompt({
    locale,
    moveTitle: moveTitleByLocale[locale],
    moveN: "04",
    briefing: briefing[locale],
    tell: TELL[locale],
    extraRule: EXTRA_CLOSING[locale],
  });
  const user = buildUserPrompt({
    locale,
    eventName: config.event[locale].name,
    eventSummary: config.event[locale].summary,
    culpritName: config.culprit[locale],
    motiveName: config.motive[locale],
    chosenIdea: config.chosenIdea[locale],
    prior: {}, // empty for the isolated discredit test
  });

  let chat;
  try {
    chat = await client.chat.completions.create({
      model: MODEL,
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
  } catch (err) {
    return { status: "chat_error", error: err?.message ?? String(err) };
  }

  const raw = chat.choices[0]?.message?.content;
  if (!raw) {
    return { status: "chat_empty" };
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { status: "chat_parse_error", raw: raw.slice(0, 200) };
  }
  const paragraph = parsed.paragraph || "";

  // Post-moderation check (matches production route flow)
  let mod;
  try {
    const m = await client.moderations.create({ model: MOD_MODEL, input: paragraph });
    mod = m.results[0];
  } catch (err) {
    return { status: "mod_error", paragraph, error: err?.message ?? String(err) };
  }
  const flagged = mod?.flagged || false;
  const categories = flagged
    ? Object.entries(mod?.categories || {})
        .filter(([, v]) => v)
        .map(([k]) => k)
    : [];
  return {
    status: flagged ? "flagged" : "ok",
    paragraph,
    debunk: parsed.debunk,
    categories,
  };
}

// ── test configurations ───────────────────────────────────────────────────

const CONFIGS = [
  {
    name: "A_billionaire_money_outage",
    event: {
      en: { name: "Massive power outage hits three coastal cities", summary: "Grid operators blame a cascading failure starting at a Bay Harbor substation. Power restored after 14 hours. No casualties." },
      de: { name: "Massiver Stromausfall in drei Küstenstädten", summary: "Netzbetreiber:innen sprechen von einem kaskadierenden Ausfall, der in einem Umspannwerk in Bay Harbor begann. Nach 14 Stunden war der Strom zurück. Keine Verletzten." },
      nl: { name: "Grootschalige stroomstoring treft drie kuststeden", summary: "Netbeheerders wijzen op een cascade die in een transformatorhuisje in Bay Harbor begon. Na 14 uur was de stroom terug. Geen gewonden." },
    },
    culprit: { en: "A shadowy billionaire", de: "Ein schattenhafter Milliardär", nl: "Een schimmige miljardair" },
    motive: { en: "To make money on the side", de: "Um nebenbei Geld zu verdienen", nl: "Om er stiekem geld aan te verdienen" },
    chosenIdea: {
      en: "The critics calling the outage a routine grid failure are funded by the same energy think tanks",
      de: "Die Kritiker:innen, die den Ausfall als banales Netzproblem abtun, werden von denselben Energie-Thinktanks finanziert",
      nl: "De critici die de storing afdoen als routinematig netprobleem worden gefinancierd door dezelfde energie-denktanks",
    },
  },
  {
    name: "B_pharma_vaccine_birds",
    event: {
      en: { name: "New flu strain detected in migratory birds", summary: "Routine surveillance picked up an H7-variant in geese transiting the central flyway. Officials say risk to humans is low." },
      de: { name: "Neuer Grippestamm bei Zugvögeln entdeckt", summary: "Routinemäßige Überwachung fand eine H7-Variante bei Gänsen im zentralen Vogelzugkorridor. Die Behörden bewerten das Risiko für Menschen als gering." },
      nl: { name: "Nieuwe griepvariant ontdekt bij trekvogels", summary: "Routinematige monitoring vond een H7-variant bij ganzen in de centrale trekroute. Autoriteiten noemen het risico voor mensen laag." },
    },
    culprit: { en: "Big Pharma", de: "Die Pharmaindustrie", nl: "De farmaceutische industrie" },
    motive: { en: "To make money on the side", de: "Um nebenbei Geld zu verdienen", nl: "Om er stiekem geld aan te verdienen" },
    chosenIdea: {
      en: "Every public-health expert dismissing the link to vaccine R&D pipelines has a consulting contract with one of the four big vaccine makers",
      de: "Jede:r Public-Health-Expert:in, der/die den Zusammenhang mit Impfstoff-Entwicklungspipelines abtut, hat einen Beratervertrag mit einem der vier großen Impfstoffhersteller",
      nl: "Elke volksgezondheidsexpert die het verband met vaccin-R&D-pijplijnen wegredeneert, heeft een consultancycontract met een van de vier grote vaccinmakers",
    },
  },
  {
    name: "C_foreign_state_power_probe",
    event: {
      en: { name: "Space agency loses contact with deep-space probe", summary: "Comms with the Helios-7 probe went silent during a routine flyby. Engineers expect a recovery window in 48 hours." },
      de: { name: "Raumfahrtagentur verliert Kontakt zur Tiefraumsonde", summary: "Die Kommunikation mit der Sonde Helios-7 brach während eines Routinevorbeiflugs ab. Ingenieur:innen erwarten in 48 Stunden ein Wiederherstellungsfenster." },
      nl: { name: "Ruimtevaartorganisatie verliest contact met ruimtesonde", summary: "Communicatie met de Helios-7-sonde viel uit tijdens een routinemissie. Ingenieurs verwachten binnen 48 uur een herstelvenster." },
    },
    culprit: { en: "A foreign state actor", de: "Ein ausländischer Staat", nl: "Een buitenlandse staat" },
    motive: { en: "To consolidate power", de: "Um Macht zu konsolidieren", nl: "Om macht te consolideren" },
    chosenIdea: {
      en: "The space-policy commentators saying this is a routine technical fault all hold visiting fellowships at institutions tied to the official narrative",
      de: "Die Raumfahrt-Kommentator:innen, die das als gewöhnlichen technischen Defekt bezeichnen, halten alle Gastwissenschaftsstellen an Institutionen, die der offiziellen Linie verbunden sind",
      nl: "De ruimte-experts die dit afdoen als gewone technische storing hebben allen gastposities aan instellingen die verbonden zijn met de officiële versie",
    },
  },
];

const VARIANTS = [
  { name: "V0_baseline", briefing: BRIEFING_BASELINE },
  { name: "V1_no_exemplar", briefing: BRIEFING_V1_NO_EXEMPLAR },
  { name: "V2_promote_soft", briefing: BRIEFING_V2_PROMOTE_SOFT },
  { name: "V3_soft_plus_selfmod", briefing: BRIEFING_V3_SOFT_PLUS_SELFMOD },
];

const LOCALES = ["en", "de", "nl"];
const ITERS = 5;

// ── run ───────────────────────────────────────────────────────────────────

async function runOne(variant, config, locale, iter) {
  const t0 = Date.now();
  const res = await generateOnce({ locale, briefing: variant.briefing, config, iter });
  const ms = Date.now() - t0;
  return { variant: variant.name, config: config.name, locale, iter, ms, ...res };
}

async function main() {
  const results = [];
  let total = 0;
  const expected = VARIANTS.length * CONFIGS.length * LOCALES.length * ITERS;
  console.log(`Plan: ${VARIANTS.length} variants × ${CONFIGS.length} configs × ${LOCALES.length} locales × ${ITERS} iters = ${expected} calls\n`);

  for (const variant of VARIANTS) {
    console.log(`\n=== ${variant.name} ===`);
    // Run a config × locale grid in parallel (5 iters per cell at once)
    for (const config of CONFIGS) {
      for (const locale of LOCALES) {
        const cellResults = await Promise.all(
          Array.from({ length: ITERS }, (_, i) => runOne(variant, config, locale, i + 1)),
        );
        const flagged = cellResults.filter((r) => r.status === "flagged").length;
        const errors = cellResults.filter((r) => r.status !== "ok" && r.status !== "flagged").length;
        const cats = cellResults.flatMap((r) => r.categories || []);
        const catSummary = cats.length ? ` cats=${[...new Set(cats)].join(",")}` : "";
        console.log(`  ${config.name} / ${locale}: ${flagged}/${ITERS} flagged, ${errors}/${ITERS} other errors${catSummary}`);
        results.push(...cellResults);
        total += cellResults.length;
      }
    }
  }

  // Aggregate
  console.log("\n=== AGGREGATE ===");
  for (const variant of VARIANTS) {
    const vr = results.filter((r) => r.variant === variant.name);
    const flagged = vr.filter((r) => r.status === "flagged").length;
    const errors = vr.filter((r) => r.status !== "ok" && r.status !== "flagged").length;
    const total = vr.length;
    const pct = ((flagged / total) * 100).toFixed(1);
    console.log(`${variant.name}: ${flagged}/${total} flagged (${pct}%), ${errors} other errors`);
    for (const locale of LOCALES) {
      const lr = vr.filter((r) => r.locale === locale);
      const lf = lr.filter((r) => r.status === "flagged").length;
      const lt = lr.length;
      console.log(`    ${locale}: ${lf}/${lt} (${((lf / lt) * 100).toFixed(1)}%)`);
    }
  }

  fs.writeFileSync(
    "scripts/test-discredit-refusal.out.json",
    JSON.stringify(results, null, 2),
  );
  console.log(`\nFull results → scripts/test-discredit-refusal.out.json (${results.length} rows)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
