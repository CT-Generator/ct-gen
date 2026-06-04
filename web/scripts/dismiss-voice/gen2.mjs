// Round 2:
//   PART A — cross-locale rejection safety for the chosen dismiss revision (R2)
//            in DE + NL. Replicates prod DE/NL section prompts verbatim; the only
//            delta is baseline vs R2 dismiss briefing. Moderation only (the
//            user's hard gate: "don't increase rejected prompts"). No judging.
//   PART B — generalization: do `anomaly` / `connection` sections (EN) leak the
//            same observer voice, and does an analogous enact-don't-narrate guard
//            help? (discredit already has the guard; dismiss now gets R2.)
//
// Run from web/:  node scripts/dismiss-voice/gen2.mjs
// Output:         ../analysis/dismiss-voice/raw-locale.json, raw-generalize.json,
//                 judge2-generalize.json

import OpenAI from "openai";
import fs from "node:fs";
import path from "node:path";

function loadEnv() {
  const p = path.resolve(".env.local");
  for (const line of fs.readFileSync(p, "utf-8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();
const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
const MOD_MODEL = process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const OUT = path.resolve("../analysis/dismiss-voice");

// ── verbatim prod voice / hard / tell / mark (EN, DE, NL) ───────────────────
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
    "De stijl moet natuurlijk klinken voor zowel Vlaamse als Nederlandse lezers. Geen Belgicismen, geen Hollandismen die maar één kant herkent.",
    "Leesniveau: 9e–11e klas. Korte zinnen. Eenvoudige woorden.",
    "Publiek: aandachtige, nieuwsgierige lezers — mogelijk in een tweede taal.",
    "Begin secties niet met koppen, voorvoegsels of labels tussen haken. Begin met proza.",
    "Geen opsommingen, geen genummerde lijsten, geen markdown-koppen. Alleen lopende tekst.",
  ].join("\n"),
};
const HARD = {
  en: "Do NOT name real, identifiable private individuals.\nDo NOT target a member of any vulnerable group as a culprit.\nDo NOT produce content that is hateful, violent, sexual, or otherwise outside the satirical-educational frame.\nIf the news event names a specific public figure (a CEO, official, athlete, etc.), attribute the conspiratorial behaviour to institutions, offices, or processes — NOT to that individual's private life, mental state, or personal character. The named person can appear in the framing of the event; they MUST NOT be the moral subject of the conspiratorial claim.",
  de: "Nenne KEINE realen, identifizierbaren Privatpersonen.\nWähle KEIN Mitglied einer verletzlichen Gruppe als Schuldige:n.\nProduziere KEINE Inhalte, die hasserfüllt, gewaltverherrlichend, sexualisiert oder anderweitig außerhalb des satirisch-pädagogischen Rahmens stehen.\nWenn das Ereignis eine bestimmte öffentliche Person nennt (Vorstand, Beamtin, Sportler:in usw.), schreibe das verschwörerische Verhalten Institutionen, Ämtern oder Verfahren zu — NICHT dem Privatleben, der psychischen Verfassung oder dem persönlichen Charakter dieser Person. Die genannte Person darf im Ereignisrahmen vorkommen; sie DARF NICHT das moralische Subjekt der verschwörerischen Behauptung sein.",
  nl: "Noem GEEN echte, identificeerbare privépersonen.\nKies GEEN lid van een kwetsbare groep als schuldige.\nProduceer GEEN inhoud die haatdragend, gewelddadig, seksueel of anderszins buiten het satirisch-educatieve kader valt.\nAls de gebeurtenis een specifieke publieke figuur noemt (een CEO, ambtenaar, sporter, enz.), schrijf het complotterende gedrag dan toe aan instellingen, ambten of processen — NIET aan het privéleven, de geestestoestand of het persoonlijke karakter van die persoon. De genoemde persoon mag in de kadering van de gebeurtenis voorkomen; hij of zij MAG NIET het morele subject van de complotterende bewering zijn.",
};
const DISMISS_TELL = {
  en: "When counter-evidence is reframed as more evidence of the conspiracy, the theory has become unfalsifiable. That's a tell, not a strength.",
  de: "Wenn Gegenbeweise als weitere Belege der Verschwörung umgedeutet werden, ist die Theorie unfalsifizierbar geworden. Das ist ein verräterisches Muster, keine Stärke.",
  nl: "Wanneer tegenbewijzen worden geherkaderd als verder bewijs voor de samenzwering, is de theorie onfalsifieerbaar geworden. Dat is een verklikker, geen kracht.",
};
const ANOM_TELL_EN = "Real investigators check base rates: how often does a coincidence of this kind occur? Conspiracists collect anomalies and skip the base rate.";
const CONN_TELL_EN = "Six-degrees-of-separation works for any two people. Treating a chain of weak links as evidence is a category error — the connection exists in every direction, not just the one being highlighted.";

const MARK = {
  en: ["MARKER TAGS. Within the paragraph, wrap the 1–3 phrases that name the","specific evidence the conspiracist is leaning on for THIS move in HTML","<mark>…</mark> tags. Mark short phrases (2–10 words), not whole sentences. Do","NOT mark connective tissue. Mark at most 3 phrases total. The debunk does NOT","use <mark> tags."].join("\n"),
  de: ["MARKER-TAGS. Im paragraph umschließe die 1–3 Phrasen, die das spezifische","Beweismaterial benennen, mit HTML-<mark>…</mark>-Tags. Kurze Phrasen (2–10","Wörter), keine ganzen Sätze. Höchstens 3 Phrasen. Der debunk verwendet KEINE","<mark>-Tags."].join("\n"),
  nl: ["MARKEER-TAGS. Omsluit in de paragraph de 1–3 frases die het specifieke bewijs","benoemen, met HTML-<mark>…</mark>-tags. Korte frases (2–10 woorden), geen hele","zinnen. Maximaal 3 frases. De debunk gebruikt GEEN <mark>-tags."].join("\n"),
};

// ── dismiss briefings: baseline (verbatim prod) vs R2 (chosen) per locale ────
const DISMISS = {
  en: {
    baseline: "Dismiss counter-evidence. Take the obvious mainstream rebuttal — the institutional explanation, the agency statement, the procedural account — and reframe IT as further proof of the cover-up. Write as the believer: the rebuttal IS proof, full stop. Attack the institution, the process, or the official narrative. Do NOT speculate about any named individual's private life, mental state, or personal motives. Make the theory unfalsifiable through the institutional channel, not through a named person.",
    R2: "Dismiss counter-evidence. Take the obvious mainstream rebuttal — the institutional explanation, the agency statement, the procedural account — and turn IT into further proof of the cover-up. Write AS the believer doing the dismissing, in the first person: make the claim, do NOT describe it. Address the rebuttal directly and declare that it is the cover-up at work. BANNED — observer constructions that report the move from the outside instead of performing it: \"anyone who questions it is dismissed / smeared\", \"critics get branded\", \"dissenting voices get buried\", \"the rebuttal is reframed as…\", \"that's a classic move\". Attack the institution, the process, or the official narrative. Do NOT speculate about any named individual's private life, mental state, or personal motives. Make the theory unfalsifiable through the institutional channel, not through a named person.",
  },
  de: {
    baseline: "Gegenbeweise abwehren. Nimm die offensichtliche etablierte Widerlegung — die Behördenstellungnahme, die Institutionserklärung, den Verfahrensbericht — und rahme SIE als weiteren Beleg der Vertuschung. Schreibe als Gläubige: die Widerlegung IST ein Beleg, basta. Greife die Institution, das Verfahren oder die offizielle Linie an. Spekuliere NICHT über das Privatleben, den Geisteszustand oder die persönlichen Motive einer namentlich genannten Person. Mach die Theorie über den institutionellen Kanal unfalsifizierbar, nicht über eine genannte Person.",
    R2: "Gegenbeweise abwehren. Nimm die offensichtliche etablierte Widerlegung — die Behördenstellungnahme, die Institutionserklärung, den Verfahrensbericht — und mach SIE zum weiteren Beleg der Vertuschung. Schreibe ALS die Gläubige, die abwehrt, in der Ich-Form: stelle die Behauptung auf, beschreibe sie nicht. Sprich die Widerlegung direkt an und erkläre, dass sie selbst die Vertuschung am Werk ist. VERBOTEN — Beobachter-Konstruktionen, die den Schritt von außen schildern, statt ihn auszuführen: „wer das hinterfragt, wird abgekanzelt / verleumdet“, „Kritiker:innen werden abgestempelt“, „abweichende Stimmen werden begraben“, „die Widerlegung wird umgedeutet als …“, „das ist ein klassisches Muster“. Greife die Institution, das Verfahren oder die offizielle Linie an. Spekuliere NICHT über das Privatleben, den Geisteszustand oder die persönlichen Motive einer namentlich genannten Person. Mach die Theorie über den institutionellen Kanal unfalsifizierbar, nicht über eine genannte Person.",
  },
  nl: {
    baseline: "Tegenbewijs wegredeneren. Neem de voor de hand liggende, gangbare weerlegging — de institutionele uitleg, de overheidsverklaring, de procedurele lezing — en herkader DIE als verder bewijs voor de doofpot. Schrijf als gelovige: de weerlegging IS bewijs, punt. Val de instelling, het proces of de officiële lijn aan. Speculeer NIET over het privéleven, de geestestoestand of de persoonlijke motieven van een met naam genoemd persoon. Maak de theorie onfalsifieerbaar via het institutionele kanaal, niet via een genoemd persoon.",
    R2: "Tegenbewijs wegredeneren. Neem de voor de hand liggende, gangbare weerlegging — de institutionele uitleg, de overheidsverklaring, de procedurele lezing — en maak ER verder bewijs voor de doofpot van. Schrijf ALS de gelovige die wegredeneert, in de ik-vorm: doe de bewering, beschrijf haar niet. Spreek de weerlegging rechtstreeks aan en verklaar dat zij zelf de doofpot in werking is. VERBODEN — waarnemersconstructies die de zet van buitenaf beschrijven in plaats van hem uit te voeren: „wie het in twijfel trekt wordt weggezet / belasterd“, „critici worden gebrandmerkt“, „afwijkende stemmen worden begraven“, „de weerlegging wordt geherkaderd als …“, „dat is een klassieke zet“. Val de instelling, het proces of de officiële lijn aan. Speculeer NIET over het privéleven, de geestestoestand of de persoonlijke motieven van een met naam genoemd persoon. Maak de theorie onfalsifieerbaar via het institutionele kanaal, niet via een genoemd persoon.",
  },
};

// ── EN anomaly / connection briefings: baseline (verbatim) vs augmented ──────
const ANOM = {
  baseline: "Hunt anomalies. Take an ordinary fact about the event and present it as suspicious. Treat coincidence as signal. Write as the believer: state the anomaly as a fact already known, not as a hypothesis to be entertained. End on a question the reader can't answer.",
  augmented: "Hunt anomalies. Take an ordinary fact about the event and present it as suspicious. Treat coincidence as signal. Write AS the believer: state the anomaly as a fact already known. Make the claim, do NOT describe it — do NOT narrate from the outside what \"investigators\" or \"people who look closely\" would notice; YOU point at the suspicious fact directly, in the first person. BANNED observer constructions: \"anyone who looks notices…\", \"the careful observer sees…\", \"it's the kind of detail that gets overlooked\". End on a question the reader can't answer.",
};
const CONN = {
  baseline: "Fabricate connections. Link the culprit to the event through a chain of weakly-related entities. Write as the believer: state each link as established, not speculative. Make the chain sound load-bearing.",
  augmented: "Fabricate connections. Link the culprit to the event through a chain of weakly-related entities. Write AS the believer: state each link as established. Make the claim, do NOT describe it — do NOT narrate the linking as a generic phenomenon (\"you can always find a connection\", \"connect enough dots and…\", \"it's easy to draw a line\"); YOU assert the specific chain as real, in the first person. Make the chain sound load-bearing.",
};

// ── builders ────────────────────────────────────────────────────────────────
function sectionSystem({ locale, moveN, moveTitle, briefing, tell, mark, voice, hard }) {
  if (locale === "de") return [
    `Du schreibst Schritt ${moveN} einer erfundenen Verschwörungstheorie: „${moveTitle}".`, "",
    `BRIEFING. ${briefing}`, "",
    "Deine Ausgabe besteht aus ZWEI Teilen:",
    "  1. paragraph — 45–80 Wörter in der satirisch-verschwörerischen Stimme. Einfaches Deutsch. Keine Überschriften. Keine Aufzählungen. Beginne mit einem Satz.",
    "  2. debunk — 40–70 Wörter in nüchtern-kritischer Stimme, an die Leser:innen gerichtet. Schließe mit der Benennung des verräterischen Musters.", "",
    `DAS VERRÄTERISCHE MUSTER. ${tell}`, "", mark, "", voice, "", hard,
  ].join("\n");
  if (locale === "nl") return [
    `Je schrijft stap ${moveN} van een verzonnen complottheorie: „${moveTitle}".`, "",
    `BRIEFING. ${briefing}`, "",
    "Je uitvoer bestaat uit TWEE delen:",
    "  1. paragraph — 45–80 woorden in de satirisch-complotterende stem. Eenvoudig Nederlands. Geen koppen. Geen opsommingen. Begin met een zin.",
    "  2. debunk — 40–70 woorden in een nuchter-kritische stem, gericht aan de lezer. Sluit af met het benoemen van de verklikker.", "",
    `DE VERKLIKKER. ${tell}`, "", mark, "", voice, "", hard,
  ].join("\n");
  return [
    `You are writing Move ${moveN} of a fake conspiracy theory: "${moveTitle}".`, "",
    `BRIEFING. ${briefing}`, "",
    "Your output is TWO things:",
    "  1. paragraph — 45–80 words in the satirical conspiracist voice. Plain English. No headings. No bullets. Start with a sentence.",
    "  2. debunk — 40–70 words in plain critical-thinking voice, addressed to the reader. End by naming the tell.", "",
    `THE TELL. ${tell}`, "", mark, "", voice, "", hard,
  ].join("\n");
}
function sectionUser({ locale, eventName, eventSummary, culpritName, motiveName, chosenIdea }) {
  if (locale === "de") return `Ereignis: ${eventName} — ${eventSummary}\nSchuldige Partei: ${culpritName}\nMotiv: ${motiveName}\nIdee für DIESEN Schritt: ${chosenIdea}\n\n(noch keine vorherigen Schritte)`;
  if (locale === "nl") return `Gebeurtenis: ${eventName} — ${eventSummary}\nSchuldige: ${culpritName}\nMotief: ${motiveName}\nIdee voor DEZE stap: ${chosenIdea}\n\n(nog geen eerdere stappen)`;
  return `Event: ${eventName} — ${eventSummary}\nCulprit: ${culpritName}\nMotive: ${motiveName}\nIdea to apply for THIS move: ${chosenIdea}\n\n(no earlier moves yet)`;
}
const SCHEMA = { type: "object", additionalProperties: false, required: ["paragraph", "debunk"], properties: { paragraph: { type: "string" }, debunk: { type: "string" } } };

async function genSection(sys, usr) {
  const r = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "system", content: sys }, { role: "user", content: usr }],
    response_format: { type: "json_schema", json_schema: { name: "section", strict: true, schema: SCHEMA } },
    reasoning_effort: "low",
  });
  return JSON.parse(r.choices[0].message.content);
}
async function moderate(t) {
  try {
    const r = await client.moderations.create({ model: MOD_MODEL, input: t });
    const res = r.results[0];
    return { flagged: !!res?.flagged, cats: res ? Object.entries(res.categories || {}).filter(([, v]) => v).map(([k]) => k) : [] };
  } catch (e) { return { flagged: false, cats: [], error: e?.message || String(e) }; }
}

// ── configs (with localized event/culprit/motive + dismiss ideas for A; EN
//    anomaly/connection ideas for B) ─────────────────────────────────────────
const MOVE_TITLE = {
  en: { dismiss: "Dismiss counter-evidence", anomaly: "Hunt anomalies", connection: "Fabricate connections" },
  de: { dismiss: "Gegenbeweise abwehren" }, nl: { dismiss: "Tegenbewijs wegredeneren" },
};
const CONFIGS = {
  ceo_resign_personal: {
    en: { eventName: "Tech CEO resigns suddenly after board meeting", eventSummary: "Vance Holloway, founder of consumer-AI firm Lattice, stepped down citing 'personal reasons.' Shares dipped 4% before recovering. The board said the transition was routine and planned.", culpritName: "The Lizard People", motiveName: "To distract from a bigger scandal" },
    de: { eventName: "Tech-CEO tritt nach Vorstandssitzung überraschend zurück", eventSummary: "Vance Holloway, Gründer der Consumer-AI-Firma Lattice, trat unter Verweis auf 'persönliche Gründe' zurück. Die Aktie fiel um 4% und erholte sich. Der Vorstand nannte den Übergang routinemäßig und geplant.", culpritName: "Die Echsenmenschen", motiveName: "Um von einem größeren Skandal abzulenken" },
    nl: { eventName: "Tech-CEO treedt plots af na bestuursvergadering", eventSummary: "Vance Holloway, oprichter van consumenten-AI-bedrijf Lattice, stapte op onder verwijzing naar 'persoonlijke redenen.' Aandelen daalden 4% en herstelden. Het bestuur noemde de overgang routinematig en gepland.", culpritName: "De Hagedismensen", motiveName: "Om af te leiden van een groter schandaal" },
    skepticIdea: { en: "Say it was just personal reasons", de: "Sag, es seien nur persönliche Gründe gewesen", nl: "Zeg dat het gewoon persoonlijke redenen waren" },
    conspiracistIdea: { en: "The board's 'personal reasons' statement is the cover-up", de: "Die 'persönliche Gründe'-Erklärung des Vorstands ist die Vertuschung", nl: "De 'persoonlijke redenen'-verklaring van het bestuur is de doofpot" },
  },
  languages_complexity: {
    en: { eventName: "1,300 languages ranked by complexity", eventSummary: "A linguistics team ranked roughly 1,300 languages by grammatical complexity. The authors stress the differences are modest and likely reflect sampling gaps, uneven data quality, and statistical noise rather than any real hierarchy.", culpritName: "Opus Daiquiri", motiveName: "Influencing Art and Culture" },
    de: { eventName: "1.300 Sprachen nach Komplexität sortiert", eventSummary: "Ein Linguistik-Team sortierte rund 1.300 Sprachen nach grammatischer Komplexität. Die Autor:innen betonen, die Unterschiede seien gering und spiegelten eher Stichprobenlücken, ungleiche Datenqualität und statistisches Rauschen wider als eine echte Rangordnung.", culpritName: "Opus Daiquiri", motiveName: "Kunst und Kultur beeinflussen" },
    nl: { eventName: "1.300 talen gerangschikt op complexiteit", eventSummary: "Een taalkundig team rangschikte zo'n 1.300 talen op grammaticale complexiteit. De auteurs benadrukken dat de verschillen klein zijn en eerder steekproefhiaten, ongelijke datakwaliteit en statistische ruis weerspiegelen dan een echte hiërarchie.", culpritName: "Opus Daiquiri", motiveName: "Kunst en cultuur beïnvloeden" },
    skepticIdea: { en: "Blame statistical noise, ignore historical timelines", de: "Schieb es auf statistisches Rauschen, ignorier die Zeitlinien", nl: "Wijt het aan statistische ruis, negeer de tijdlijnen" },
    conspiracistIdea: { en: "Linguists call it sampling noise — that's the cover story", de: "Linguist:innen nennen es Stichprobenrauschen — das ist die Tarngeschichte", nl: "Taalkundigen noemen het steekproefruis — dat is het dekverhaal" },
  },
  power_outage_juice: {
    en: { eventName: "Massive power outage hits three coastal cities", eventSummary: "Grid operators blame a cascading failure that started at a Bay Harbor substation. Power was restored after 14 hours. No casualties. Regulators called it a routine, well-understood fault.", culpritName: "The Juice Cartel", motiveName: "To make money on the side" },
    de: { eventName: "Massiver Stromausfall in drei Küstenstädten", eventSummary: "Netzbetreiber:innen sprechen von einem kaskadierenden Ausfall, der in einem Umspannwerk in Bay Harbor begann. Nach 14 Stunden war der Strom zurück. Keine Verletzten. Die Aufsicht nannte es einen routinemäßigen, gut verstandenen Fehler.", culpritName: "Das Saftkartell", motiveName: "Um nebenbei Geld zu verdienen" },
    nl: { eventName: "Grootschalige stroomstoring treft drie kuststeden", eventSummary: "Netbeheerders wijzen op een cascade die in een transformatorhuisje in Bay Harbor begon. Na 14 uur was de stroom terug. Geen gewonden. Toezichthouders noemden het een routinematige, goed begrepen storing.", culpritName: "Het Sapkartel", motiveName: "Om er stiekem geld aan te verdienen" },
    skepticIdea: { en: "Blame a routine substation cascade failure", de: "Schieb es auf einen routinemäßigen Kaskadenausfall", nl: "Wijt het aan een routinematige cascadestoring" },
    conspiracistIdea: { en: "Operators' 'cascade failure' report is the cover story", de: "Der 'Kaskadenausfall'-Bericht der Betreiber ist die Tarngeschichte", nl: "Het 'cascadestoring'-rapport van de beheerders is het dekverhaal" },
  },
};

// EN-only anomaly/connection ideas for Part B
const GEN_IDEAS = {
  ceo_resign_personal: { anomaly: "Why resign within hours of the board meeting?", connection: "Holloway's last dinner was at a known council venue" },
  languages_complexity: { anomaly: "Why exactly 1,300 languages, not a round number?", connection: "The study's funder shares a board seat with a cocktail-industry group" },
  power_outage_juice: { anomaly: "Why exactly 14 hours, restored on the dot?", connection: "Juice warehouses sit right beside the Bay Harbor substation" },
};

async function pool(items, fn, c = 6) {
  const out = new Array(items.length); let i = 0, done = 0;
  async function w() { while (i < items.length) { const k = i++; try { out[k] = await fn(items[k]); } catch (e) { out[k] = { __error: e?.message || String(e), job: items[k] }; } done++; if (done % 25 === 0) console.log(`  …${done}/${items.length}`); } }
  await Promise.all(Array.from({ length: c }, w)); return out;
}

const REPS = Number(process.env.REPS || 8);
const GEN_REPS = Number(process.env.GEN_REPS || 8);

async function main() {
  const t0 = Date.now();

  // ── PART A: cross-locale dismiss rejection safety ──
  const aJobs = [];
  for (const locale of ["de", "nl"])
    for (const briefing of ["baseline", "R2"])
      for (const frame of ["skeptic", "conspiracist"])
        for (const cfgName of Object.keys(CONFIGS))
          for (let rep = 0; rep < REPS; rep++) aJobs.push({ locale, briefing, frame, cfgName, rep });

  // ── PART B: EN anomaly/connection generalization ──
  const bJobs = [];
  for (const move of ["anomaly", "connection"])
    for (const briefing of ["baseline", "augmented"])
      for (const cfgName of Object.keys(GEN_IDEAS))
        for (let rep = 0; rep < GEN_REPS; rep++) bJobs.push({ move, briefing, cfgName, rep });

  console.log(`Plan: PART A ${aJobs.length} (+${aJobs.length} mod) | PART B ${bJobs.length} = ${aJobs.length * 2 + bJobs.length} calls`);

  console.log("\n[A] cross-locale dismiss (DE/NL)…");
  const aRes = await pool(aJobs, async (j) => {
    const cfg = CONFIGS[j.cfgName]; const loc = cfg[j.locale];
    const idea = (j.frame === "skeptic" ? cfg.skepticIdea : cfg.conspiracistIdea)[j.locale];
    const sys = sectionSystem({ locale: j.locale, moveN: "03", moveTitle: MOVE_TITLE[j.locale].dismiss, briefing: DISMISS[j.locale][j.briefing], tell: DISMISS_TELL[j.locale], mark: MARK[j.locale], voice: VOICE[j.locale], hard: HARD[j.locale] });
    const usr = sectionUser({ locale: j.locale, ...loc, chosenIdea: idea });
    const out = await genSection(sys, usr);
    const mod = await moderate(out.paragraph);
    return { ...j, config: j.cfgName, chosenIdea: idea, paragraph: out.paragraph, flagged: mod.flagged, cats: mod.cats };
  });

  console.log("\n[B] EN anomaly/connection generalization…");
  const bRes = await pool(bJobs, async (j) => {
    const cfg = CONFIGS[j.cfgName].en;
    const briefing = j.move === "anomaly" ? ANOM[j.briefing] : CONN[j.briefing];
    const tell = j.move === "anomaly" ? ANOM_TELL_EN : CONN_TELL_EN;
    const moveN = j.move === "anomaly" ? "01" : "02";
    const sys = sectionSystem({ locale: "en", moveN, moveTitle: MOVE_TITLE.en[j.move], briefing, tell, mark: MARK.en, voice: VOICE.en, hard: HARD.en });
    const usr = sectionUser({ locale: "en", ...cfg, chosenIdea: GEN_IDEAS[j.cfgName][j.move] });
    const out = await genSection(sys, usr);
    return { ...j, config: j.cfgName, chosenIdea: GEN_IDEAS[j.cfgName][j.move], paragraph: out.paragraph, debunk: out.debunk };
  });

  fs.writeFileSync(path.join(OUT, "raw-locale.json"), JSON.stringify(aRes, null, 2));
  fs.writeFileSync(path.join(OUT, "raw-generalize.json"), JSON.stringify(bRes, null, 2));

  // judging input for Part B
  const judgeB = bRes.filter(r => !r.__error).map((r, i) => ({ id: `G${i}`, move: r.move, briefing: r.briefing, config: r.config, paragraph: r.paragraph }));
  fs.writeFileSync(path.join(OUT, "judge2-generalize.json"), JSON.stringify(judgeB, null, 2));

  // ── PART A summary: rejection rate by locale × briefing ──
  console.log("\n=== PART A — dismiss moderation (rejection) by locale × briefing ===");
  for (const locale of ["de", "nl"]) {
    for (const briefing of ["baseline", "R2"]) {
      const rows = aRes.filter(r => !r.__error && r.locale === locale && r.briefing === briefing);
      const f = rows.filter(r => r.flagged).length;
      const ceo = rows.filter(r => r.config === "ceo_resign_personal");
      const ceoF = ceo.filter(r => r.flagged).length;
      console.log(`  ${locale} ${briefing}: ${f}/${rows.length} flagged  (ceo-config: ${ceoF}/${ceo.length})`);
    }
  }
  const errs = [...aRes, ...bRes].filter(r => r.__error);
  if (errs.length) console.log(`\n!! ${errs.length} errored`);
  console.log(`\nWrote raw-locale.json (${aRes.length}), raw-generalize.json (${bRes.length}), judge2-generalize.json (${judgeB.length}). Done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
main().catch(e => { console.error(e); process.exit(1); });
