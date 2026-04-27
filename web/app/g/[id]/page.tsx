// Permalink / generation page.
// Mobile: theory above, debunk below per move (debunk equal heading prominence).
// Tablet+: side-by-side 1.4fr / 1fr per move.
// Source: design system, component-sheets.jsx → GenerationSheet
//
// Phase 2 task 2C.2 will replace the placeholder data with a real fetch by short-id.

import { MOVES } from "@/lib/recipe";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { DisclaimerBand } from "@/components/disclaimer-band";
import { MoveGlyph } from "@/components/move-glyph";

type Params = { id: string };

// Placeholder data shape — matches the strict OpenAI structured-output schema.
// The real page will read this from Postgres via the short-id.
const PLACEHOLDER = {
  event: "UK push to weaken surveillance laws",
  culprit: "The Jazz Cabal",
  motive: "Celebrity Puppeteering",
  recipe: {
    anomalies:
      "It began, as these things do, with a coincidence too tidy to ignore. The week the new surveillance proposal landed, three of London's most-watched jazz clubs quietly went dark for 'private events.' The proposal's lead author had been photographed at one of them eleven years earlier. The other two share a holding company. None of this is in the official record — which, of course, is the point.",
    connect_dots:
      "From here the network draws itself. The holding company shares an accountant with a streaming-rights licensor; that licensor's board includes a former intelligence liaison; the liaison sat on a 2019 panel where the surveillance proposal was first floated. Six steps separate any two people on Earth — but when six steps connect your villains, that is no longer a graph theory result. It is a ledger.",
    dismiss_counter:
      "The Home Office insists the proposal was drafted by career civil servants with no entertainment-industry ties. Naturally they would say so. The Office's own ethics review confirms the absence of conflict — the same ethics review whose chair, in 2017, attended a charity gala underwritten by… well. Read the guest list yourself.",
    discredit_critics:
      "Whoever now points out that 'six degrees of Kevin Bacon' applies to literally any two people on the planet is, of course, on retainer. Look at where their funding comes from; look at where they post; look at the awards they have not won. The pattern is plain to anyone who is willing to see it.",
    debunk: {
      anomalies:
        "This paragraph manufactures a pattern from unrelated facts: a calendar coincidence, an old photograph, a corporate registry. None of these facts is false; the work is in the arrangement. Real investigators look for patterns that survive a base-rate check. Here, no base rate is offered — because there isn't one.",
      connect_dots:
        "'Six degrees of separation' works for any two humans on the planet. Treating a six-link chain as evidence is a category error: the connection exists in every direction, not only the one being highlighted.",
      dismiss_counter:
        "Here counter-evidence is reframed as further evidence of the cover-up. This is the move's tell: the theory is now unfalsifiable. Any disconfirmation simply expands the circle of conspirators.",
      discredit_critics:
        "Ad hominem framing of critics is the recipe's closing move — it reroutes the question from 'is this true?' to 'who is asking?' Real investigators welcome critique; conspiracists treat it as evidence of the conspiracy.",
    },
  },
};

const MOVE_KEYS = ["anomalies", "connect_dots", "dismiss_counter", "discredit_critics"] as const;

export default async function GenerationPage({ params }: { params: Promise<Params> }) {
  const { id: _id } = await params;
  const data = PLACEHOLDER;

  return (
    <>
      <DisclaimerBand />
      <Masthead />

      {/* Run header strip */}
      <section className="border-b border-ink dark:border-ink-dark">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div>
            <p className="meta">Theory · run #4128 · 02:14 a.m.</p>
            <h1
              className="mt-2 font-display text-[clamp(1.6rem,4.5vw,2.4rem)] leading-[1.05] max-w-3xl"
              style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
            >
              How <span style={{ color: MOVES[0].color }}>{data.culprit}</span> orchestrated{" "}
              <span style={{ color: MOVES[2].color }}>{data.event}</span>, in service of{" "}
              <span style={{ color: MOVES[3].color }}>{data.motive.toLowerCase()}</span>.
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
            <span
              className="font-mono uppercase text-ink-soft dark:text-ink-soft-dark"
              style={{ fontSize: 10, letterSpacing: "0.12em" }}
            >
              Generated · 4/4
            </span>
            <div className="flex gap-1">
              {MOVES.map((m) => (
                <div
                  key={m.key}
                  className="h-1 w-7 sm:w-9"
                  style={{ background: m.color }}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Move blocks — theory + debunk per move */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-9">
        {MOVES.map((m, i) => {
          const theoryText = data.recipe[MOVE_KEYS[i]];
          const debunkText =
            data.recipe.debunk[MOVE_KEYS[i] as keyof typeof data.recipe.debunk];
          return (
            <article
              key={m.key}
              className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 sm:gap-8 lg:gap-10 py-6 sm:py-8 border-t border-ink/15 dark:border-ink-dark/15 first:border-t-0 first:pt-2"
            >
              {/* Theory column */}
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span style={{ color: m.color }}>
                    <MoveGlyph kind={m.key} size={22} strokeWidth={1.6} />
                  </span>
                  <span
                    className="font-mono uppercase"
                    style={{ fontSize: 10, letterSpacing: "0.16em", color: m.color }}
                  >
                    Move {m.n} · {m.title}
                  </span>
                </div>
                <p
                  className="font-body text-[15px] sm:text-[16px] leading-[1.65] pl-4 sm:pl-5 max-w-prose-theory"
                  style={{
                    borderLeft: `2px solid ${m.color}`,
                    background: `color-mix(in oklab, ${m.color} 6%, transparent)`,
                    padding: "10px 14px 10px 16px",
                  }}
                >
                  {theoryText}
                </p>
              </div>

              {/* Debunk column — sans, tighter, dashed left rule */}
              <aside
                className="lg:border-l lg:border-dashed lg:border-ink/35 dark:lg:border-ink-dark/35 lg:pl-5 pt-4 lg:pt-0 border-t border-dashed border-ink/35 dark:border-ink-dark/35 lg:border-t-0"
                aria-label={`Debunking move ${m.n}`}
              >
                <p
                  className="font-mono uppercase text-ink-soft dark:text-ink-soft-dark mb-2"
                  style={{ fontSize: 10, letterSpacing: "0.14em" }}
                >
                  Debunk · why the move works
                </p>
                <p className="text-[13.5px] leading-[1.55]">{debunkText}</p>
              </aside>
            </article>
          );
        })}
      </section>

      {/* Share row — always-link-back, no downloadable artifacts */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-9 mt-8 sm:mt-10 pt-6 sm:pt-8 rule-h-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="meta">Share — recipe-naming, never theory text</p>
            <p
              className="mt-1 font-display text-[15px] sm:text-[16px] leading-tight"
              style={{ fontWeight: 600 }}
            >
              Anyone you send this to lands on the recipe explainer first.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["Copy link", "X", "Bluesky", "Email"] as const).map((label) => (
              <button
                key={label}
                type="button"
                className="border border-ink/30 dark:border-ink-dark/30 px-3 py-2 text-[12px] hover:border-ink dark:hover:border-ink-dark transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-10 sm:mt-12">
        <DisclaimerBand compact accent={2} />
      </div>
      <Footer />
    </>
  );
}
