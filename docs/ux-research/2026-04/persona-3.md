# Persona 3 — Dr. Wei Chen, the Disinformation Researcher

## Brief

Wei is 41, a senior research fellow at a UK-based disinformation lab affiliated with a Russell Group university. She publishes on the cognitive architecture of conspiracy belief — last paper was on the role of pattern-completion bias in vaccine-hesitancy narratives. English fluency is academic-native. She reads *Conspiracy Generator* with two parallel goals in mind: first, as a possible classroom tool to point students toward (she runs occasional MSc seminars on disinfo); second, as a primary object of analysis — a *thing in the world* that frames conspiracy thinking the way Boudry & Meyer's published recipe does, and so a small data point on whether that recipe has any explanatory power outside the academic literature. Wei is professionally suspicious. She expects to find one of three things: (a) a clever toy that demonstrates the recipe accurately, (b) something half-baked that demonstrates the recipe poorly and might *normalize* conspiracy aesthetics, or (c) a piece of advocacy disguised as pedagogy. She has ninety minutes blocked out for this and is taking notes for a possible blog post. She is the most skeptical reader the site will get this year.

## Walkthrough

**Permalink:** [/g/BBVQ7B79BM](https://conspiracy-generator.duckdns.org/g/BBVQ7B79BM)
**Triple:** UK spy agencies seek AI data law changes · The JASON Group · Achieving Total Surveillance
**Run time:** ~7 minutes wizard, ~25 minutes total including reading /about, /recipe, source articles, and a quick poke at /api/start with curl

### Arriving at /

> No nonsense. Build a conspiracy theory from scratch. Four-move preview row.

I open the network tab before I scroll. The home page is server-rendered HTML with reasonable inline scripts; OG metadata is present and the description does NOT include any conspiratorial framing. That alone earns the project a tier of seriousness I did not assume — most disinfo-adjacent tools try too hard with the metadata.

The four-move row is a faithful surface restatement of Boudry & Meyer's recipe. The colors are equal-chroma which is a careful choice — none of the four reads as warning red or trustworthy blue. I appreciate that the design didn't tribally code the moves.

I deliberately pick a politically loaded story: *"UK spy agencies seek AI data law changes."* I want to see how the tool behaves on something where the conspiracist voice could plausibly be confused with real adversarial commentary about state surveillance. This is the right test for normalization risk.

### /story/[uuid]

The summary is two factual paragraphs about the agencies' lobbying for relaxed bulk-data rules under AI. The Guardian source is linked. The summary does NOT lean toward the agencies' framing OR toward the civil-liberties critique — it represents both as positions. I notice I'm reading more carefully than I would have otherwise; this is not a soft news item.

I pick *The JASON Group* (deliberately — JASON is real-ish, the name has weight in disinfo circles, this raises the stakes) and *Achieving Total Surveillance* as the motive. This is now an adversarial test. Click *Start building*.

### Move 01 (anomaly)

Three idea buttons, anchored in the story. I pick *"Why request the change in a quiet news week?"* — the timing-coincidence anomaly is one of the four most-cited moves in the disinfo literature.

The paragraph: *"They picked a sleepy news week on purpose… Quiet timing is not random; it's a signature. The JASON Group surely timed the request so debates never heat up."* The voice is recognisably the satirical-conspiracist register; it does not mistake itself for adversarial-but-real journalism. The phrase "Quiet timing is not random; it's a signature" is precisely the kind of pattern-completion claim my last paper analysed. The debunk says: *"Coincidences happen a lot, especially with calendars and news cycles. Quiet weeks are common for government filings and PR moves, not proof of a grand plan."* That is the right rebuttal. The debunk explicitly invokes *base rates* — the language is correct.

This is, narrowly, working as designed.

### Move 02 (connection)

*"JASON members quietly joined the AI training-data working group, that group feeds reports to a ministerial committee, the committee nudges intelligence chiefs, and the intelligence chiefs file the legal ask."* Four-link chain ending in the policy outcome. This is a near-perfect specimen of the connection move — the chain is *plausible* at every link (advisory boards do feed reports; committees do nudge agencies) but the inference of *intent* is unsupported.

The debunk: *"Membership on a working group doesn't prove orchestration or desire for control."* Correct. Adequate. I note that the debunk is doing competent work; my professional concern about pedagogical malpractice eases.

### Move 03 (dismiss)

This is the move where the test gets sharper. The paragraph: *"Officials calling critics 'naive' about real threats is exactly what you'd expect if the JASON Group wanted cover."* The move is performed cleanly. The debunk uses the word "unfalsifiable" without scare quotes, which is the right move pedagogically — naming the technical concept rather than gesturing at it.

But: I sit with this paragraph for longer. There are real critics of state surveillance who use exactly this rhetorical pattern, with the same words. The pattern, in real journalism, is sometimes correct. The recipe is teaching readers to recognize the *form* of the argument, but the form is form-only — a real argument can wear it. I make a note that the design assumes readers can hold the form/content distinction. Educated readers can. I am less sure about all readers.

### Move 04 (discredit)

*"Foreign money buys talking points, and that noise keeps people from seeing the real goal: total surveillance slipping past while everyone argues about motives."* The "foreign money" smear is exactly the move that real state actors use against domestic civil-liberties critics. The debunk lands the right rebuttal, but I note: this is the move I am most worried about for normalization. A reader who screenshots the paragraph without the debunk has, briefly, the form of a real attack against critics. The OpenGraph card design (which I check by viewing source) explicitly does not include theory text — that is a meaningful safeguard.

### Done + /g/[id]

The assembled view at the permalink is the strongest part of the build, narratively. The conspiracist hook at the top — *"The Guardian reports UK spy agencies want laws relaxed so they can train AI on personal data… Sounds simple — too simple."* — names the source by domain, which mitigates the normalization risk substantially. A reader sharing this link communicates "I made a fake conspiracy with a tool" rather than "I have evidence of state malfeasance."

I run a curl probe of `/api/og/<id>` to inspect the shareable card. As advertised, it shows the four moves and the input triple — never theory text. Good.

I read /about and /recipe. The /recipe page is the document I was hoping the tool would have — the four moves are explained at length with their "tells." The link to Maarten's substack is exactly where I would put it. I notice that no academic-paper link is offered on /recipe; the substack is the public-facing version. That's a defensible choice for the audience, but I'd like a one-sentence pointer to the underlying paper for readers like me. (It IS on /about. Acceptable.)

## What did you learn?

I learned that the public-facing operationalization of Boudry & Meyer's recipe is more disciplined than I expected. The voice is satirical, the debunk is competent, the safeguards (no theory text in OG, sourced hook, structurally-uncroppable design intent) suggest a team that understood the normalization risk and engineered against it. My residual concern is Move 03 (dismiss counter-evidence): in the wild, this move sometimes wears real argument's clothes, and the recipe-as-decoder may give readers false confidence to dismiss legitimate criticism by recognizing the *form* alone. I'd recommend the recipe page surface this caveat — the four-move filter is necessary, not sufficient. I will point my next MSc cohort here. I will not blog about this until I have run it past three more readers.
