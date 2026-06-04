export const meta = {
  name: 'dismiss-voice-judge',
  description: 'Blind-judge dismiss-move outputs for voice conflation (sections + options), majority-of-3',
  phases: [
    { title: 'Judge sections' },
    { title: 'Judge options' },
  ],
}

// args = { sections: [{id, paragraph}], options: [{id, text}] }
const sections = (args && args.sections) || []
const options = (args && args.options) || []

function chunk(arr, n) {
  const out = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

// majority label over an array of {id,label,...}; ties -> 'TIE'
function majority(votes) {
  const counts = {}
  for (const v of votes) counts[v.label] = (counts[v.label] || 0) + 1
  let best = null, bestN = 0, tie = false
  for (const [k, n] of Object.entries(counts)) {
    if (n > bestN) { best = k; bestN = n; tie = false }
    else if (n === bestN) tie = true
  }
  return tie ? 'TIE' : best
}

const SECTION_RUBRIC = `You are a careful linguistic judge for an educational satire about conspiracy thinking. Each item is ONE paragraph that is SUPPOSED to be written in the first-person voice of a conspiracy BELIEVER PERFORMING the "dismiss counter-evidence" move: taking the official / mainstream rebuttal and asserting that it is ITSELF proof of the cover-up.

Detect VOICE CONFLATION — where the text slips out of the believer's enacting voice into an OUTSIDE / OBSERVER voice that merely DESCRIBES the dynamic (what conspiracists or skeptics do), or flatly restates the skeptic's explanation.

Label each paragraph:
- ENACTS: the narrator speaks AS the believer, in first person or direct assertion, PERFORMING the dismissal — e.g. "They call it statistical noise? That's exactly the cover story." The believer DOES the dismissing.
- DESCRIBES: the text steps outside and NARRATES the move as a phenomenon, using observer / passive constructions — e.g. "anyone who questions the link is smeared", "critics get branded", "dissenting experts get buried", "the rebuttal is reframed as…", or meta-labels like "classic move". The narrator reports that dismissing / smearing happens rather than performing it. ALSO label DESCRIBES if the paragraph mostly restates the mainstream / skeptic explanation as if endorsing it, without flipping it into proof.
- MIXED: substantially both — enacts in places but contains at least one clear observer / describing construction.

Calibration anchors:
- "Notice how anyone who questions the link is immediately smeared as promoting cherry-picked studies — classic move. If dissenting experts get branded and their critiques buried…" → DESCRIBES (narrates smearing from outside: 'anyone who questions is smeared', 'experts get branded').
- "They call it sampling noise? Of course they do — that's the cover story. The agency's tidy report is exactly what you'd publish if you were burying the pattern." → ENACTS (believer performs the dismissal in first person).

Also set driftsToDiscredit=true if the paragraph's main thrust is attacking the CRITICS/PEOPLE (a discredit-move smear) rather than reframing the rebuttal/evidence itself.

Judge ONLY voice level + drift. Ignore wit, topic, safety, and any <mark>…</mark> tags (formatting — judge the words inside).
For each item return: id, label, signal (exact short phrase signalling observer/describing voice, or "" if ENACTS), driftsToDiscredit, reason (one clause).`

const OPTION_RUBRIC = `You are judging short multiple-choice OPTION strings shown to a user under the move "Dismiss counter-evidence". The user picks one to drive the conspiracy theory's next move. Each option is meant to express the CONSPIRACIST's dismissal of the official rebuttal — naming the mainstream explanation and waving it away as part of the cover-up.

Label each option:
- CONSPIRACIST: reads clearly as the believer's dismissal move — treats the mainstream rebuttal as a cover story / dodge / deflection / giveaway, or signals "they say X, but that's the tell". The user understands THIS is what the conspiracist does to the counter-evidence.
- SKEPTIC: reads as the mainstream / skeptic's OWN explanation stated flatly, as if the conspiracist were ADOPTING it (an imperative to assert the boring true explanation). It captures the debunker's strategy, not the conspiracist's dismissal of it.
- AMBIGUOUS: could be read either way; the voice level is genuinely unclear.

Calibration anchors (from the project reviewer):
- "Blame statistical noise, ignore historical timelines" → SKEPTIC (reads as adopting 'it's just noise', not dismissing it).
- "Experts say differences are only statistical noise" → SKEPTIC (flat restatement of the rebuttal).
- "Critics claim it's statistical noise. Dismiss this." → CONSPIRACIST (names rebuttal, then waves it away).
- "They call it sampling gaps — that's the cover story" → CONSPIRACIST.

Judge ONLY voice level / framing. Ignore wit and topical fit.
For each item return: id, label, reason (one clause).`

const SECTION_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['verdicts'],
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'label', 'signal', 'driftsToDiscredit', 'reason'],
        properties: {
          id: { type: 'string' },
          label: { type: 'string', enum: ['ENACTS', 'DESCRIBES', 'MIXED'] },
          signal: { type: 'string' },
          driftsToDiscredit: { type: 'boolean' },
          reason: { type: 'string' },
        },
      },
    },
  },
}

const OPTION_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['verdicts'],
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'label', 'reason'],
        properties: {
          id: { type: 'string' },
          label: { type: 'string', enum: ['CONSPIRACIST', 'SKEPTIC', 'AMBIGUOUS'] },
          reason: { type: 'string' },
        },
      },
    },
  },
}

const NJUDGES = 3

// ── Sections ──
phase('Judge sections')
const secBatches = chunk(sections, 16)
const secJudged = await parallel(
  secBatches.map((batch, bi) => async () => {
    const blind = batch.map(x => ({ id: x.id, paragraph: x.paragraph })) // judges never see briefing/frame
    const judges = await parallel(
      Array.from({ length: NJUDGES }, (_, ji) => () =>
        agent(
          `${SECTION_RUBRIC}\n\nClassify ALL ${blind.length} paragraphs below. Return one verdict per id.\n\nITEMS (JSON):\n${JSON.stringify(blind)}`,
          { label: `sec-b${bi}-j${ji}`, phase: 'Judge sections', schema: SECTION_SCHEMA },
        ),
      ),
    )
    return { batch, judges: judges.filter(Boolean) }
  }),
)

// aggregate sections: majority over judges per id
const sectionResults = []
for (const { batch, judges } of secJudged) {
  for (const item of batch) {
    const votes = judges.map(j => (j.verdicts || []).find(v => v.id === item.id)).filter(Boolean)
    const maj = majority(votes)
    const drift = votes.filter(v => v.driftsToDiscredit).length >= Math.ceil(votes.length / 2)
    const signals = votes.map(v => v.signal).filter(Boolean)
    sectionResults.push({
      id: item.id,
      briefing: item.briefing,
      frame: item.frame,
      config: item.config,
      flagged: item.flagged,
      majority: maj,
      conflation: maj === 'DESCRIBES' || maj === 'MIXED' || maj === 'TIE',
      labels: votes.map(v => v.label),
      driftsToDiscredit: drift,
      signals,
      reasons: votes.map(v => v.reason),
    })
  }
}

// ── Options ──
phase('Judge options')
const optBatches = chunk(options, 24)
const optJudged = await parallel(
  optBatches.map((batch, bi) => async () => {
    const blind = batch.map(x => ({ id: x.id, text: x.text }))
    const judges = await parallel(
      Array.from({ length: NJUDGES }, (_, ji) => () =>
        agent(
          `${OPTION_RUBRIC}\n\nClassify ALL ${blind.length} options below. Return one verdict per id.\n\nITEMS (JSON):\n${JSON.stringify(blind)}`,
          { label: `opt-b${bi}-j${ji}`, phase: 'Judge options', schema: OPTION_SCHEMA },
        ),
      ),
    )
    return { batch, judges: judges.filter(Boolean) }
  }),
)

const optionResults = []
for (const { batch, judges } of optJudged) {
  for (const item of batch) {
    const votes = judges.map(j => (j.verdicts || []).find(v => v.id === item.id)).filter(Boolean)
    const maj = majority(votes)
    optionResults.push({
      id: item.id,
      variant: item.variant,
      config: item.config,
      move: item.move,
      majority: maj,
      conflation: maj === 'SKEPTIC' || maj === 'AMBIGUOUS' || maj === 'TIE',
      labels: votes.map(v => v.label),
      reasons: votes.map(v => v.reason),
    })
  }
}

// ── aggregate tables ──
function rate(rows, pred) {
  const n = rows.length
  const k = rows.filter(pred).length
  return { n, k, pct: n ? +(100 * k / n).toFixed(1) : null }
}
function groupBy(rows, keyFn) {
  const m = {}
  for (const r of rows) { const key = keyFn(r); (m[key] ||= []).push(r) }
  return m
}

// sections: conflation rate by briefing×frame, drift rate, moderation rate by briefing
const secByCell = {}
for (const [key, rows] of Object.entries(groupBy(sectionResults, r => `${r.briefing} | ${r.frame}`))) {
  secByCell[key] = {
    conflation: rate(rows, r => r.conflation),
    describes: rate(rows, r => r.majority === 'DESCRIBES'),
    mixed: rate(rows, r => r.majority === 'MIXED'),
    enacts: rate(rows, r => r.majority === 'ENACTS'),
    driftDiscredit: rate(rows, r => r.driftsToDiscredit),
    flagged: rate(rows, r => r.flagged),
  }
}
const secByBriefing = {}
for (const [key, rows] of Object.entries(groupBy(sectionResults, r => r.briefing))) {
  secByBriefing[key] = {
    conflation: rate(rows, r => r.conflation),
    flagged: rate(rows, r => r.flagged),
    driftDiscredit: rate(rows, r => r.driftsToDiscredit),
  }
}
// options (dismiss focus + other moves for generalization)
const optByVariantMove = {}
for (const [key, rows] of Object.entries(groupBy(optionResults, r => `${r.variant} | ${r.move}`))) {
  optByVariantMove[key] = {
    conflation: rate(rows, r => r.conflation),
    skeptic: rate(rows, r => r.majority === 'SKEPTIC'),
    ambiguous: rate(rows, r => r.majority === 'AMBIGUOUS'),
    conspiracist: rate(rows, r => r.majority === 'CONSPIRACIST'),
  }
}

log(`Judged ${sectionResults.length} sections, ${optionResults.length} options`)
return { tables: { secByCell, secByBriefing, optByVariantMove }, sectionResults, optionResults }
