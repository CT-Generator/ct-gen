// /recipe — the four moves explained at length, with each glyph + the same sub-line as the home preview.
// Spec: openspec/changes/v2-rebuild/specs/attribution-and-brand/spec.md (Educational-purpose framing)

import { MOVES } from "@/lib/recipe";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { DisclaimerBand } from "@/components/disclaimer-band";
import { MoveGlyph } from "@/components/move-glyph";

const MOVE_LONG: Record<string, string[]> = {
  anomaly: [
    "Find a pattern that wasn't asked for. Coincidence becomes signal.",
    "Look for puzzling details, anomalies, or contradictions in the official story. Insist they prove the official story is false. You're \"just asking questions\" at this point — since no explanation of any event is ever complete, this part is easy.",
    "The tell: real investigators look for patterns that survive a base-rate check. Conspiracists collect anomalies and forget to ask how often a coincidence of that kind occurs by chance.",
  ],
  connection: [
    "Draw lines between unrelated dots until they look load-bearing.",
    "Fabricate \"evidence\" that implicates your culprit and reveals their evil schemes. Try to be creative and forge suspicious connections between the official story and your culprits — the tighter the network, the better.",
    "The tell: \"six degrees of separation\" works for any two humans on the planet. Treating a six-link chain as evidence is a category error: the connection exists in every direction, not only the one being highlighted.",
  ],
  dismiss: [
    "If a fact disagrees, the fact is part of the cover-up.",
    "Spin a story suggesting that disconfirming evidence is missing because the conspirators have been covering their tracks — and that any apparent counter-evidence was planted by the conspirators to throw truth-seekers off the scent.",
    "The tell: when counter-evidence becomes further evidence of the conspiracy, the theory has become unfalsifiable. Any disconfirmation simply expands the circle of conspirators.",
  ],
  discredit: [
    "Whoever points out the flaw is conveniently compromised.",
    "Pesky critics of the conspiracy theory can be dealt with in various ways: they're gullible dupes of official propaganda, they've been manipulated, or they're paid stooges of the conspirators themselves.",
    "The tell: ad hominem framing reroutes the question from \"is this true?\" to \"who is asking?\" Real investigators welcome critique; conspiracists treat it as evidence of the conspiracy.",
  ],
};

export const metadata = { title: "The recipe" };

export default function RecipePage() {
  return (
    <>
      <DisclaimerBand />
      <Masthead />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <p className="meta">The recipe</p>
        <h1
          className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05]"
          style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
        >
          Every conspiracy theory follows the same four moves.
        </h1>

        <p className="mt-6 text-[16px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
          The moves are independent. You can apply them to any news story, real conspiracy, or
          completely fabricated event. Once you can name them, you can spot them.
        </p>

        <div className="mt-10 space-y-12">
          {MOVES.map((m) => {
            const long = MOVE_LONG[m.key]!;
            return (
              <section key={m.key}>
                <div className="flex items-center gap-3">
                  <span style={{ color: m.color }}>
                    <MoveGlyph kind={m.key} size={36} strokeWidth={1.5} />
                  </span>
                  <span
                    className="font-mono uppercase"
                    style={{ fontSize: 11, letterSpacing: "0.16em", color: m.color }}
                  >
                    Move {m.n}
                  </span>
                </div>
                <h2
                  className="mt-2.5 font-display text-[28px] sm:text-[32px] leading-tight"
                  style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
                >
                  {m.title}
                </h2>
                <p
                  className="mt-2 text-[15px] italic"
                  style={{ color: m.color }}
                >
                  {long[0]}
                </p>
                <p className="mt-4 text-[15.5px] leading-relaxed">{long[1]}</p>
                <p
                  className="mt-3 text-[14px] leading-relaxed pl-4 border-l-2"
                  style={{
                    borderColor: m.color,
                    background: `color-mix(in oklab, ${m.color} 5%, transparent)`,
                    padding: "10px 14px 10px 16px",
                  }}
                >
                  <strong className="font-display" style={{ fontWeight: 600 }}>The tell.</strong>{" "}
                  {long[2]}
                </p>
              </section>
            );
          })}
        </div>
      </article>

      <Footer />
    </>
  );
}
