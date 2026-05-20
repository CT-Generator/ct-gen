## ADDED Requirements

### Requirement: Per-move briefings produce executed-voice prose, not hypothetical voice

The per-move briefings used by `generateSection` SHALL produce conspiracy-theory prose written **as** the conspiracist (assertive, declarative voice), not **about** the move (hypothetical, conditional, or analytical voice). The briefings MUST be tightened so that the model commits to the conspiracist's claims as facts rather than framing them as suggestions or imagined possibilities. The `discredit` move is the highest-risk locus for this voice leak and MUST receive an explicit per-move constraint that names and bans hedging constructions; the other three moves SHALL be audited for the same risk and receive the same constraint where applicable.

This requirement covers EN, DE, and NL.

#### Scenario: Discredit-move output uses declarative voice
- **WHEN** `generateSection` is called for `moveKey = "discredit"` in any of `en`, `de`, `nl`
- **THEN** the generated `paragraph` makes its discrediting claims as declarative statements ("Critics are paid stooges.", "Kritiker sind gekaufte Strohmänner.", "Critici zijn betaalde stromannen.")
- **AND** the paragraph does NOT open with hypothetical framings such as "Imagine that…", "Suppose that…", "Picture a world where…" or their DE/NL equivalents ("Stell dir vor, dass…", "Stel je voor dat…")
- **AND** the paragraph does NOT use conditional/hedging verbs as the load-bearing claim ("would be", "could be", "might be", "is allegedly", "supposedly") used in the sense that turns the claim from assertion to speculation

#### Scenario: Briefing includes an explicit ban-list and exemplar for discredit
- **WHEN** the `discredit` briefing in `MOVE_BRIEFINGS_BY_LOCALE` is read for any of `en`, `de`, `nl`
- **THEN** the briefing text explicitly instructs the model to write **as** the conspiracist (assertive voice)
- **AND** the briefing text names at least the verbs "imagine", "suppose", "allegedly", "supposedly" (and their DE/NL equivalents) as banned in the claim-bearing position
- **AND** the briefing text includes at least one short positive exemplar of the target voice (a one-sentence declarative line)

#### Scenario: Anomaly, connection, dismiss briefings do not invite meta-description
- **WHEN** the briefings for `anomaly`, `connection`, and `dismiss` are read for any of `en`, `de`, `nl`
- **THEN** none of them open with a verb that instructs the model to "suggest", "imply", or "hint" in a way that turns the resulting paragraph hypothetical
- **AND** any briefing that previously invited a meta-descriptive voice has been rewritten to instruct the model to write **as** the conspiracist

#### Scenario: Per-locale parity
- **WHEN** the discredit briefing is compared across `en`, `de`, `nl`
- **THEN** all three locales' briefings share the same shape (assertive instruction + ban-list + exemplar)
- **AND** the constraint strength is equivalent (no locale variant is weaker or omits the ban-list)
