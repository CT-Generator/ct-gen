// /recipe — the four moves explained at length, with each glyph + the same sub-line as the home preview.
// Spec: openspec/changes/v2-rebuild/specs/attribution-and-brand/spec.md (Educational-purpose framing)

import { MOVES } from "@/lib/recipe";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { MoveGlyph } from "@/components/move-glyph";

const MOVE_LONG: Record<string, string[]> = {
  anomaly: [
    "Turn coincidence into evidence of a secret plot.",
    "Look for puzzling details or contradictions in the official story. Insist they prove the official story is false. You're \"just asking questions\" — and since no explanation of any event is ever complete, this part is easy.",
    "Real investigators look for patterns that survive a base-rate check. Conspiracists collect anomalies and forget to ask how often a coincidence of that kind happens by chance.",
  ],
  connection: [
    "Draw lines between unrelated dots until they look meaningful.",
    "Fabricate \"evidence\" that implicates your culprit. Forge suspicious connections between the official story and your culprits — the tighter the network looks, the better.",
    "\"Six degrees of separation\" works for any two people on the planet. Treating a six-link chain as evidence is a category error: the connection exists in every direction, not only the one being highlighted.",
  ],
  dismiss: [
    "If a fact disagrees, make the fact part of the cover-up.",
    "Argue that any disconfirming evidence is missing because the conspirators covered their tracks — and any apparent counter-evidence was planted to throw truth-seekers off.",
    "When counter-evidence becomes further evidence of the conspiracy, the theory has become unfalsifiable. Any disconfirmation just expands the circle of conspirators.",
  ],
  discredit: [
    "Dismiss people who point out flaws in your theory.",
    "Critics can be dismissed in different ways: they're gullible dupes, they've been manipulated, or they're paid stooges of the conspirators themselves.",
    "Ad hominem framing reroutes the question from \"is this true?\" to \"who is asking?\" Real investigators welcome critique; conspiracists treat it as more evidence of the conspiracy.",
  ],
};

export const metadata = { title: "The recipe" };

export default function RecipePage() {
  return (
    <>
      <Masthead />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <p className="meta">The recipe</p>
        <h1
          className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05]"
          style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
        >
          Conspiracy theories follow four moves.
        </h1>

        <p className="mt-6 text-[16px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
          The moves are independent. You can apply them to any news story, real conspiracy, or
          made-up event. Once you can name them, you can spot them. The recipe is set out at
          length in{" "}
          <a
            href="https://maartenboudry.substack.com/p/the-conspiracy-generator"
            target="_blank"
            rel="noopener"
            className="underline-offset-2 underline hover:no-underline"
          >
            this blog post
          </a>
          .
        </p>

        <aside
          className="mt-8 border-l-2 pl-4 sm:pl-5 py-2 italic text-[15px] leading-relaxed"
          style={{ borderColor: "var(--tw-color-ink-soft, #54515C)" }}
        >
          <p>
            Spotting these moves is not the same as winning an argument. Real critics of real
            institutions sometimes use these moves with substance behind them — a journalist
            questioning an official cover-up, a researcher rejecting weak counter-evidence. The
            four-move recipe trains your eye for the <strong className="not-italic">form</strong>{" "}
            of conspiracy reasoning. Whether the{" "}
            <strong className="not-italic">substance</strong> of the claim is also wrong is a
            separate, slower question. Use the recipe as a noticer, not as a verdict.
          </p>
        </aside>

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
                  {long[2].replace(/^The tell:\s*/i, "")}
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
