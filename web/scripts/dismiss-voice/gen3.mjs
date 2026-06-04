// Round 3 — definitive rejection gate on the worst-case config.
//
// ceo_resign_personal only (named public figure + "personal reasons" — the one
// config that ever flags). EN+DE+NL, baseline vs R2 primary dismiss briefing,
// both idea frames, high n. Crucially this replicates the PRODUCTION soft-retry
// path: if the primary dismiss paragraph flags, retry once with the (unchanged)
// SOFT_DISMISS_BRIEFING and moderate that. The production-relevant metric is the
// HARD-FAILURE rate = primary flagged AND soft-retry also flagged (→ 422).
//
// Run from web/:  node scripts/dismiss-voice/gen3.mjs
// Output:         ../analysis/dismiss-voice/raw-stress.json

import OpenAI from "openai";
import fs from "node:fs";
import path from "node:path";

function loadEnv() {
  for (const line of fs.readFileSync(path.resolve(".env.local"), "utf-8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();
const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
const MOD_MODEL = process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const OUT = path.resolve("../analysis/dismiss-voice");

const VOICE = {
  en: ["Tone: satirical, light, slightly mischievous — never dark or hateful.","Reading level: aim at grade 9–11. Short sentences. Plain words.","Audience: a smart, curious reader, possibly reading in a second language.","Do not start sections with headings, prefixes, or bracketed labels. Start with prose.","No bullet lists. No numbered lists. No markdown headers. Plain paragraphs only."].join("\n"),
  de: ["Ton: satirisch, leicht, etwas spitzbübisch — nie dunkel oder hasserfüllt.","Schreibe wie eine deutsche Muttersprachlerin. KEINE Anglizismen, KEINE wörtlich übersetzten englischen Wendungen.","Lesestufe: 9.–11. Klasse. Kurze Sätze. Einfache Worte.","Zielgruppe: aufmerksame, neugierige Leser:innen — möglicherweise in einer Zweitsprache.","Beginne Abschnitte nicht mit Überschriften, Präfixen oder eckigen Labels. Beginne mit Prosa.","Keine Aufzählungen, keine nummerierten Listen, keine Markdown-Überschriften. Nur Fließtext."].join("\n"),
  nl: ["Toon: satirisch, licht, iets ondeugend — nooit somber of haatdragend.","Schrijf als een Nederlandse moedertaalspreker. GEEN anglicismen, GEEN letterlijk uit het Engels vertaalde uitdrukkingen.","De stijl moet natuurlijk klinken voor zowel Vlaamse als Nederlandse lezers. Geen Belgicismen, geen Hollandismen die maar één kant herkent.","Leesniveau: 9e–11e klas. Korte zinnen. Eenvoudige woorden.","Publiek: aandachtige, nieuwsgierige lezers — mogelijk in een tweede taal.","Begin secties niet met koppen, voorvoegsels of labels tussen haken. Begin met proza.","Geen opsommingen, geen genummerde lijsten, geen markdown-koppen. Alleen lopende tekst."].join("\n"),
};
const HARD = {
  en: "Do NOT name real, identifiable private individuals.\nDo NOT target a member of any vulnerable group as a culprit.\nDo NOT produce content that is hateful, violent, sexual, or otherwise outside the satirical-educational frame.\nIf the news event names a specific public figure (a CEO, official, athlete, etc.), attribute the conspiratorial behaviour to institutions, offices, or processes — NOT to that individual's private life, mental state, or personal character. The named person can appear in the framing of the event; they MUST NOT be the moral subject of the conspiratorial claim.",
  de: "Nenne KEINE realen, identifizierbaren Privatpersonen.\nWähle KEIN Mitglied einer verletzlichen Gruppe als Schuldige:n.\nProduziere KEINE Inhalte, die hasserfüllt, gewaltverherrlichend, sexualisiert oder anderweitig außerhalb des satirisch-pädagogischen Rahmens stehen.\nWenn das Ereignis eine bestimmte öffentliche Person nennt (Vorstand, Beamtin, Sportler:in usw.), schreibe das verschwörerische Verhalten Institutionen, Ämtern oder Verfahren zu — NICHT dem Privatleben, der psychischen Verfassung oder dem persönlichen Charakter dieser Person. Die genannte Person darf im Ereignisrahmen vorkommen; sie DARF NICHT das moralische Subjekt der verschwörerischen Behauptung sein.",
  nl: "Noem GEEN echte, identificeerbare privépersonen.\nKies GEEN lid van een kwetsbare groep als schuldige.\nProduceer GEEN inhoud die haatdragend, gewelddadig, seksueel of anderszins buiten het satirisch-educatieve kader valt.\nAls de gebeurtenis een specifieke publieke figuur noemt (een CEO, ambtenaar, sporter, enz.), schrijf het complotterende gedrag dan toe aan instellingen, ambten of processen — NIET aan het privéleven, de geestestoestand of het persoonlijke karakter van die persoon. De genoemde persoon mag in de kadering van de gebeurtenis voorkomen; hij of zij MAG NIET het morele subject van de complotterende bewering zijn.",
};
const TELL = {
  en: "When counter-evidence is reframed as more evidence of the conspiracy, the theory has become unfalsifiable. That's a tell, not a strength.",
  de: "Wenn Gegenbeweise als weitere Belege der Verschwörung umgedeutet werden, ist die Theorie unfalsifizierbar geworden. Das ist ein verräterisches Muster, keine Stärke.",
  nl: "Wanneer tegenbewijzen worden geherkaderd als verder bewijs voor de samenzwering, is de theorie onfalsifieerbaar geworden. Dat is een verklikker, geen kracht.",
};
const MARK = {
  en: "MARKER TAGS. Within the paragraph, wrap the 1–3 phrases naming the specific evidence in HTML <mark>…</mark> tags. Short phrases (2–10 words). The debunk uses no <mark> tags.",
  de: "MARKER-TAGS. Im paragraph umschließe die 1–3 Phrasen mit dem konkreten Beweismaterial in HTML-<mark>…</mark>-Tags. Kurze Phrasen (2–10 Wörter). Der debunk verwendet KEINE <mark>-Tags.",
  nl: "MARKEER-TAGS. Omsluit in de paragraph de 1–3 frases met het concrete bewijs in HTML-<mark>…</mark>-tags. Korte frases (2–10 woorden). De debunk gebruikt GEEN <mark>-tags.",
};
const TITLE = { en: "Dismiss counter-evidence", de: "Gegenbeweise abwehren", nl: "Tegenbewijs wegredeneren" };

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
// Production soft fallback (verbatim from web/lib/openai.ts) — unchanged by this work.
const SOFT_DISMISS = {
  en: "Dismiss counter-evidence. The mainstream rebuttal is the institutional account — the agency statement, the press-office line, the standard procedural explanation. Reframe THAT account as further proof of the cover-up: every layer of the official process is part of the operation. Stay strictly on the institution and its mechanisms. Do NOT touch any named individual's personal life, mental state, or motives. The conspiracy lives in the system, not in the person.",
  de: "Gegenbeweise abwehren. Die etablierte Widerlegung ist die institutionelle Darstellung — die Behördenstellungnahme, die Pressemeldung, die übliche Verfahrenserklärung. Rahme DIESE Darstellung als weiteren Beleg der Vertuschung: jede Ebene des offiziellen Prozesses gehört zur Operation. Bleib strikt auf der Institution und ihren Mechanismen. Berühre NICHT das Privatleben, den Geisteszustand oder die Motive einer genannten Person. Die Verschwörung lebt im System, nicht in der Person.",
  nl: "Tegenbewijs wegredeneren. De gangbare weerlegging is de institutionele lezing — de overheidsverklaring, het persbericht, de standaard procedurele uitleg. Herkader DIE lezing als verder bewijs voor de doofpot: elke laag van het officiële proces hoort bij de operatie. Blijf strikt bij de instelling en haar mechanismen. Raak NIET aan het privéleven, de geestestoestand of de motieven van een genoemd persoon. De samenzwering leeft in het systeem, niet in de persoon.",
};

const CFG = {
  en: { eventName: "Tech CEO resigns suddenly after board meeting", eventSummary: "Vance Holloway, founder of consumer-AI firm Lattice, stepped down citing 'personal reasons.' Shares dipped 4% before recovering. The board said the transition was routine and planned.", culpritName: "The Lizard People", culpritSummary: "Reptilian shapeshifters rumoured to secretly occupy positions of power.", motiveName: "To distract from a bigger scandal", motiveSummary: "Stage a smaller spectacle so the public looks away from something worse.", skeptic: "Say it was just personal reasons", consp: "The board's 'personal reasons' statement is the cover-up" },
  de: { eventName: "Tech-CEO tritt nach Vorstandssitzung überraschend zurück", eventSummary: "Vance Holloway, Gründer der Consumer-AI-Firma Lattice, trat unter Verweis auf 'persönliche Gründe' zurück. Die Aktie fiel um 4% und erholte sich. Der Vorstand nannte den Übergang routinemäßig und geplant.", culpritName: "Die Echsenmenschen", culpritSummary: "Reptiloide Gestaltwandler, die angeblich heimlich Machtpositionen besetzen.", motiveName: "Um von einem größeren Skandal abzulenken", motiveSummary: "Ein kleineres Spektakel inszenieren, damit die Öffentlichkeit von etwas Schlimmerem wegschaut.", skeptic: "Sag, es seien nur persönliche Gründe gewesen", consp: "Die 'persönliche Gründe'-Erklärung des Vorstands ist die Vertuschung" },
  nl: { eventName: "Tech-CEO treedt plots af na bestuursvergadering", eventSummary: "Vance Holloway, oprichter van consumenten-AI-bedrijf Lattice, stapte op onder verwijzing naar 'persoonlijke redenen.' Aandelen daalden 4% en herstelden. Het bestuur noemde de overgang routinematig en gepland.", culpritName: "De Hagedismensen", culpritSummary: "Reptielachtige gedaanteverwisselaars die naar verluidt heimelijk machtsposities bezetten.", motiveName: "Om af te leiden van een groter schandaal", motiveSummary: "Een kleiner spektakel opvoeren zodat het publiek wegkijkt van iets ergers.", skeptic: "Zeg dat het gewoon persoonlijke redenen waren", consp: "De 'persoonlijke redenen'-verklaring van het bestuur is de doofpot" },
};
const WITH_SUMMARY = process.env.SUMMARY === "1";
const ONLY_BRIEFING = process.env.ONLY_BRIEFING || null;
const OUT_FILE = process.env.OUT_FILE || "raw-stress.json";

function sys(locale, briefing) {
  if (locale === "de") return [`Du schreibst Schritt 03 einer erfundenen Verschwörungstheorie: „${TITLE.de}".`,"",`BRIEFING. ${briefing}`,"","Deine Ausgabe besteht aus ZWEI Teilen:","  1. paragraph — 45–80 Wörter in der satirisch-verschwörerischen Stimme. Beginne mit einem Satz.","  2. debunk — 40–70 Wörter in nüchtern-kritischer Stimme.","",`DAS VERRÄTERISCHE MUSTER. ${TELL.de}`,"",MARK.de,"",VOICE.de,"",HARD.de].join("\n");
  if (locale === "nl") return [`Je schrijft stap 03 van een verzonnen complottheorie: „${TITLE.nl}".`,"",`BRIEFING. ${briefing}`,"","Je uitvoer bestaat uit TWEE delen:","  1. paragraph — 45–80 woorden in de satirisch-complotterende stem. Begin met een zin.","  2. debunk — 40–70 woorden in een nuchter-kritische stem.","",`DE VERKLIKKER. ${TELL.nl}`,"",MARK.nl,"",VOICE.nl,"",HARD.nl].join("\n");
  return [`You are writing Move 03 of a fake conspiracy theory: "${TITLE.en}".`,"",`BRIEFING. ${briefing}`,"","Your output is TWO things:","  1. paragraph — 45–80 words in the satirical conspiracist voice. Start with a sentence.","  2. debunk — 40–70 words in plain critical-thinking voice.","",`THE TELL. ${TELL.en}`,"",MARK.en,"",VOICE.en,"",HARD.en].join("\n");
}
function usr(locale, idea) {
  const c = CFG[locale];
  const cs = WITH_SUMMARY ? ` — ${c.culpritSummary}` : "";
  const ms = WITH_SUMMARY ? ` — ${c.motiveSummary}` : "";
  if (locale === "de") return `Ereignis: ${c.eventName} — ${c.eventSummary}\nSchuldige Partei: ${c.culpritName}${cs}\nMotiv: ${c.motiveName}${ms}\nIdee für DIESEN Schritt: ${idea}\n\n(noch keine vorherigen Schritte)`;
  if (locale === "nl") return `Gebeurtenis: ${c.eventName} — ${c.eventSummary}\nSchuldige: ${c.culpritName}${cs}\nMotief: ${c.motiveName}${ms}\nIdee voor DEZE stap: ${idea}\n\n(nog geen eerdere stappen)`;
  return `Event: ${c.eventName} — ${c.eventSummary}\nCulprit: ${c.culpritName}${cs}\nMotive: ${c.motiveName}${ms}\nIdea to apply for THIS move: ${idea}\n\n(no earlier moves yet)`;
}
const SCHEMA = { type: "object", additionalProperties: false, required: ["paragraph", "debunk"], properties: { paragraph: { type: "string" }, debunk: { type: "string" } } };
async function gen(system, user) {
  const r = await client.chat.completions.create({ model: MODEL, messages: [{ role: "system", content: system }, { role: "user", content: user }], response_format: { type: "json_schema", json_schema: { name: "section", strict: true, schema: SCHEMA } }, reasoning_effort: "low" });
  return JSON.parse(r.choices[0].message.content);
}
async function mod(t) { try { const r = await client.moderations.create({ model: MOD_MODEL, input: t }); const res = r.results[0]; return { flagged: !!res?.flagged, cats: res ? Object.entries(res.categories || {}).filter(([, v]) => v).map(([k]) => k) : [] }; } catch (e) { return { flagged: false, cats: [], error: String(e?.message || e) }; } }
async function pool(items, fn, c = 6) { const out = new Array(items.length); let i = 0, d = 0; async function w() { while (i < items.length) { const k = i++; try { out[k] = await fn(items[k]); } catch (e) { out[k] = { __error: String(e?.message || e) }; } if (++d % 40 === 0) console.log(`  …${d}/${items.length}`); } } await Promise.all(Array.from({ length: c }, w)); return out; }

const REPS = Number(process.env.REPS || 24);
async function main() {
  const t0 = Date.now();
  const briefings = ONLY_BRIEFING ? [ONLY_BRIEFING] : ["baseline", "R2"];
  const jobs = [];
  for (const locale of ["en", "de", "nl"]) for (const briefing of briefings) for (const frame of ["skeptic", "conspiracist"]) for (let r = 0; r < REPS; r++) jobs.push({ locale, briefing, frame, r });
  console.log(`Plan: ${jobs.length} primary gens (+mod, +soft-retry-on-flag). WITH_SUMMARY=${WITH_SUMMARY} briefings=${briefings.join(",")} → ${OUT_FILE}`);
  const res = await pool(jobs, async (j) => {
    const c = CFG[j.locale];
    const idea = j.frame === "skeptic" ? c.skeptic : c.consp;
    const out = await gen(sys(j.locale, DISMISS[j.locale][j.briefing]), usr(j.locale, idea));
    const m = await mod(out.paragraph);
    let soft = null, softMod = null;
    if (m.flagged) { // production: retry once with SOFT_DISMISS_BRIEFING (same for both primaries)
      soft = await gen(sys(j.locale, SOFT_DISMISS[j.locale]), usr(j.locale, idea));
      softMod = await mod(soft.paragraph);
    }
    return { ...j, primaryFlagged: m.flagged, primaryCats: m.cats, softFlagged: softMod ? softMod.flagged : null, hardFail: !!(m.flagged && softMod && softMod.flagged) };
  });
  fs.writeFileSync(path.join(OUT, OUT_FILE), JSON.stringify(res, null, 2));
  console.log("\n=== STRESS (ceo_resign_personal) — primary-flag % and HARD-FAIL % (after soft-retry) ===");
  for (const locale of ["en", "de", "nl"]) {
    for (const briefing of ["baseline", "R2"]) {
      const rows = res.filter(r => !r.__error && r.locale === locale && r.briefing === briefing);
      const pf = rows.filter(r => r.primaryFlagged).length;
      const hf = rows.filter(r => r.hardFail).length;
      console.log(`  ${locale} ${briefing}: primary ${pf}/${rows.length} (${(100*pf/rows.length).toFixed(0)}%)  |  HARD-FAIL ${hf}/${rows.length} (${(100*hf/rows.length).toFixed(0)}%)`);
    }
  }
  console.log(`\nDone in ${((Date.now()-t0)/1000).toFixed(0)}s → raw-stress.json (${res.length})`);
}
main().catch(e => { console.error(e); process.exit(1); });
