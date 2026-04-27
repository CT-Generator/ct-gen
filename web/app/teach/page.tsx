// /teach — lesson plan for educators.
// Mainly website content. The "Save as PDF" button triggers window.print();
// the print stylesheet keeps things readable on paper.

import Link from "next/link";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { PrintButton } from "@/components/print-button";

export const metadata = { title: "For teachers — a 15-minute lesson plan" };

const PROMPTS = [
  "Which of the four moves felt most convincing? Why?",
  "What real evidence would change your mind about the theory you just built?",
  "What's the difference between Move 02 (Fabricate connections) and how a real journalist or historian connects evidence?",
  "When have you seen Move 04 (Discredit critics) in real-world arguments? Where did it appear?",
  "Pick a real news event you know well. Try the four moves on it yourself, before reading the generated theory. Compare.",
  "What ARE the legitimate critiques of public institutions? How do they differ from a conspiracy theory's complaints?",
];

export default function TeachPage() {
  return (
    <>
      <Masthead />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16 print:py-6 print:px-0">
        <div className="flex items-start justify-between gap-4 print:hidden">
          <p className="meta">For teachers</p>
          <PrintButton />
        </div>
        <h1
          className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] print:text-[28pt]"
          style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
        >
          A 15-minute lesson in spotting conspiracy theories.
        </h1>

        <p className="mt-6 text-[16px] leading-relaxed print:text-[11pt]">
          The Conspiracy Generator is built to be used in class. The exercise is short, hands-on,
          and lands the lesson in the same window of attention students give to one news headline.
          This page is the lesson plan — read it on screen, or print it as a PDF using the button
          above.
        </p>

        {/* Why */}
        <section className="mt-10">
          <h2 className="font-display text-[22px] sm:text-[24px] print:text-[16pt]" style={{ fontWeight: 600 }}>
            Why this works
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed">
            The strongest defence against conspiracy thinking is to make a conspiracy theory of
            your own. Once students have applied the four moves themselves, they can name the
            moves the next time they encounter them. A lecture about why conspiracy theories are
            wrong reaches few of them; the experience of building one reaches almost all of them.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            The four moves — hunt anomalies, fabricate connections, dismiss counter-evidence,
            discredit critics — are described on{" "}
            <Link href="/recipe" className="underline-offset-2 underline hover:no-underline">
              the recipe page
            </Link>{" "}
            with examples and the "tell" for each. Read it once before class.
          </p>
        </section>

        {/* The 15-minute plan */}
        <section className="mt-10">
          <h2 className="font-display text-[22px] sm:text-[24px] print:text-[16pt]" style={{ fontWeight: 600 }}>
            The 15-minute plan
          </h2>

          <div className="mt-4 space-y-5">
            <PlanStep
              minutes="0–3"
              title="Set up"
              body="Open the Conspiracy Generator on the projector. Show students the home page and explain what they're about to see. Don't read the recipe page out loud yet — they'll learn the moves by watching them happen."
            />
            <PlanStep
              minutes="3–6"
              title="Pick the ingredients together"
              body="Vote as a class on a news event, a culprit, and a motive. Pick something the class is broadly aware of — a recent local story, a science discovery, a sports moment. The flavours of the three are deliberately mismatched; that mismatch is part of the point."
            />
            <PlanStep
              minutes="6–13"
              title="Walk through the four moves"
              body="The tool walks you through one move per screen. For each: read the short briefing, click an idea button, read the generated paragraph, then read the debunk. Stop after each move and ask the discussion prompt below for that move (one minute, no more)."
            />
            <PlanStep
              minutes="13–15"
              title="The closing question"
              body="When the assembled theory comes up, ask: which of the four moves were you most likely to fall for? Most students name the same move. That's the one to watch for in real life."
            />
          </div>
        </section>

        {/* Discussion prompts */}
        <section className="mt-10">
          <h2 className="font-display text-[22px] sm:text-[24px] print:text-[16pt]" style={{ fontWeight: 600 }}>
            Discussion prompts
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
            Pick one or two — these work between moves or after the assembled theory.
          </p>
          <ol className="mt-4 space-y-3 text-[15px] leading-relaxed list-decimal list-inside marker:text-ink-soft marker:dark:text-ink-soft-dark">
            {PROMPTS.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </section>

        {/* Learning outcomes */}
        <section className="mt-10">
          <h2 className="font-display text-[22px] sm:text-[24px] print:text-[16pt]" style={{ fontWeight: 600 }}>
            What students leave with
          </h2>
          <ul className="mt-3 space-y-2 text-[15px] leading-relaxed list-disc list-inside marker:text-ink-soft marker:dark:text-ink-soft-dark">
            <li>The four moves, by name.</li>
            <li>The "tell" of each move — why it works on a casual reader.</li>
            <li>An intuition that for any one event, many different conspiracy theories can be built — most of them with the same recipe.</li>
            <li>A sharper instinct to ask "is this true?" instead of "who's against it?"</li>
          </ul>
        </section>

        {/* Footer note for teachers */}
        <section className="mt-10 rule-h pt-6">
          <p className="text-[14px] italic text-ink-soft dark:text-ink-soft-dark">
            Used this in your class? We'd love to hear how it went —{" "}
            <a
              href="mailto:marco.meyer@jpberlin.de?subject=Conspiracy%20Generator%20%E2%80%94%20classroom%20use"
              className="underline-offset-2 underline not-italic"
            >
              drop us a note
            </a>
            .
          </p>
        </section>
      </article>

      <Footer />
    </>
  );
}

function PlanStep({ minutes, title, body }: { minutes: string; title: string; body: string }) {
  return (
    <div className="grid grid-cols-[64px_1fr] sm:grid-cols-[88px_1fr] gap-3 sm:gap-5">
      <div className="meta pt-1 print:text-[10pt]">{minutes} min</div>
      <div>
        <h3 className="font-display text-[18px] sm:text-[19px] print:text-[13pt]" style={{ fontWeight: 600 }}>
          {title}
        </h3>
        <p className="mt-1.5 text-[14.5px] leading-relaxed print:text-[11pt]">{body}</p>
      </div>
    </div>
  );
}
