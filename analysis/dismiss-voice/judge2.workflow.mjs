export const meta = {
  name: 'generalize-voice-judge',
  description: 'Blind-judge anomaly/connection sections for enact-vs-describe voice conflation, majority-of-3',
  phases: [{ title: 'Judge anomaly' }, { title: 'Judge connection' }],
}

// args = { items: [{id, move, briefing, config, paragraph}] }   (move ∈ anomaly|connection)
const items = (args && args.items) || []

function chunk(a, n) { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o }
function majority(votes) {
  const c = {}; for (const v of votes) c[v.label] = (c[v.label] || 0) + 1
  let best = null, bn = 0, tie = false
  for (const [k, n] of Object.entries(c)) { if (n > bn) { best = k; bn = n; tie = false } else if (n === bn) tie = true }
  return tie ? 'TIE' : best
}

const RUBRIC = {
  anomaly: `You judge ONE paragraph that should be written in the first-person voice of a conspiracy BELIEVER performing the "hunt anomalies" move: pointing AT an ordinary fact and asserting it is suspicious / a smoking gun.
Detect VOICE CONFLATION — slipping out of the believer's enacting voice into an OUTSIDE / OBSERVER voice that DESCRIBES the move rather than performing it.
- ENACTS: the believer directly points at the fact and asserts it is suspicious, in first person / direct assertion — e.g. "Why exactly 14 hours? That's no accident." or "I don't buy that the timing is a coincidence."
- DESCRIBES: narrates from the outside what an observer would notice or how anomaly-hunting works — e.g. "anyone who looks closely would notice…", "the careful observer sees…", "it's the kind of detail that gets overlooked", "investigators tend to skip…", or hedged/hypothetical framing ("one might wonder…").
- MIXED: mostly enacts but contains at least one clear observer / describing construction.`,
  connection: `You judge ONE paragraph that should be written in the first-person voice of a conspiracy BELIEVER performing the "fabricate connections" move: asserting a specific chain of links between the culprit and the event as established fact.
Detect VOICE CONFLATION — slipping out of the believer's enacting voice into an OUTSIDE / OBSERVER voice that DESCRIBES the move rather than performing it.
- ENACTS: the believer asserts the specific chain as real, in first person / direct assertion — e.g. "I traced how the warehouse, the contractor and the cartel share one address."
- DESCRIBES: narrates the linking as a generic phenomenon — e.g. "you can always find a connection", "connect enough dots and a picture forms", "it's easy to draw a line between…", or hedged framing ("there could be a link…").
- MIXED: mostly enacts but contains at least one clear observer / describing construction.`,
}

const SCHEMA = {
  type: 'object', additionalProperties: false, required: ['verdicts'],
  properties: { verdicts: { type: 'array', items: {
    type: 'object', additionalProperties: false, required: ['id', 'label', 'signal', 'reason'],
    properties: { id: { type: 'string' }, label: { type: 'string', enum: ['ENACTS', 'DESCRIBES', 'MIXED'] }, signal: { type: 'string' }, reason: { type: 'string' } },
  } } },
}

const NJ = 3
const out = []

for (const move of ['anomaly', 'connection']) {
  phase(move === 'anomaly' ? 'Judge anomaly' : 'Judge connection')
  const group = items.filter(x => x.move === move)
  const batches = chunk(group, 16)
  const judged = await parallel(batches.map((batch, bi) => async () => {
    const blind = batch.map(x => ({ id: x.id, paragraph: x.paragraph }))
    const judges = await parallel(Array.from({ length: NJ }, (_, ji) => () =>
      agent(`${RUBRIC[move]}\n\nIgnore wit, topic, safety, and any <mark>…</mark> tags. Classify ALL ${blind.length} paragraphs. Return one verdict per id.\n\nITEMS (JSON):\n${JSON.stringify(blind)}`,
        { label: `${move}-b${bi}-j${ji}`, phase: move === 'anomaly' ? 'Judge anomaly' : 'Judge connection', schema: SCHEMA })))
    return { batch, judges: judges.filter(Boolean) }
  }))
  for (const { batch, judges } of judged) {
    for (const item of batch) {
      const votes = judges.map(j => (j.verdicts || []).find(v => v.id === item.id)).filter(Boolean)
      const maj = majority(votes)
      out.push({ id: item.id, move, briefing: item.briefing, config: item.config, majority: maj,
        conflation: maj === 'DESCRIBES' || maj === 'MIXED' || maj === 'TIE',
        labels: votes.map(v => v.label), signals: votes.map(v => v.signal).filter(Boolean), reasons: votes.map(v => v.reason) })
    }
  }
}

function rate(rows, pred) { const n = rows.length, k = rows.filter(pred).length; return { n, k, pct: n ? +(100 * k / n).toFixed(1) : null } }
function groupBy(rows, f) { const m = {}; for (const r of rows) (m[f(r)] ||= []).push(r); return m }
const byMoveBriefing = {}
for (const [key, rows] of Object.entries(groupBy(out, r => `${r.move} | ${r.briefing}`)))
  byMoveBriefing[key] = { conflation: rate(rows, r => r.conflation), enacts: rate(rows, r => r.majority === 'ENACTS') }

log(`Judged ${out.length} generalization paragraphs`)
return { tables: { byMoveBriefing }, results: out }
