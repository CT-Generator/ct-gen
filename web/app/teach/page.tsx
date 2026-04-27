// /teach — landing page for educators.
// Spec: openspec/changes/v2-rebuild/specs/teacher-mode/spec.md

import Link from "next/link";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { DisclaimerBand } from "@/components/disclaimer-band";
import { ClassroomToggle } from "@/components/classroom-toggle";

export const metadata = { title: "For teachers" };

const PROMPTS = [
  "Which of the four moves felt most convincing? Why?",
  "What real evidence would falsify this theory? What would it take to convince a fair-minded skeptic that this isn't a conspiracy?",
  "What's the difference between Move 02 (Fabricate connections) and how a real journalist or historian connects evidence?",
  "Find a recent real news event. Try to apply the four moves yourself, in writing, before generating one with the app. Compare.",
  "When have you seen Move 04 (Discredit the critics) in real-world arguments? Where did it appear?",
  "Pick a real conspiracy from /quiz. What evidence makes it real? Which of those evidence-types are missing in the generated theory?",
  "Find a news story about a public institution. What ARE the legitimate critiques? How do they differ from a conspiracy theory's complaints?",
];

export default function TeachPage() {
  return (
    <>
      <DisclaimerBand />
      <Masthead />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <p className="meta">For teachers</p>
        <h1
          className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05]"
          style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
        >
          A 15-minute lesson in spotting conspiracies.
        </h1>

        <p className="mt-6 text-[16px] leading-relaxed">
          The Conspiracy Generator is built to be used in class. Pick an event your students know about,
          generate a theory in front of them, then read the debunking column together. Most students
          have never seen the recipe written out — and once they have, they find the moves everywhere.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <section className="border border-ink/15 dark:border-ink-dark/15 p-5">
            <h2
              className="font-display text-[20px]"
              style={{ fontWeight: 600 }}
            >
              Lesson plan
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
              A one-page PDF with a 15-minute classroom plan: a 3-minute warm-up, an 8-minute live
              generation + debunk read, and a 4-minute discussion. Designed for high-school and
              undergraduate critical-thinking, media-literacy, and epistemology courses.
            </p>
            <p className="mt-4 text-[13px] italic text-ink-soft dark:text-ink-soft-dark">
              PDF coming with v2 launch — meanwhile, see the discussion prompts at right.
            </p>
          </section>

          <section className="border border-ink/15 dark:border-ink-dark/15 p-5">
            <h2
              className="font-display text-[20px]"
              style={{ fontWeight: 600 }}
            >
              Classroom session
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
              Hides external share buttons across the app and surfaces discussion-prompt cards
              alongside generated theories. Survives refresh, ends when you close the browser.
            </p>
            <ClassroomToggle />
          </section>
        </div>

        <h2
          className="mt-12 font-display text-[24px]"
          style={{ fontWeight: 600 }}
        >
          Discussion prompts
        </h2>
        <ol className="mt-4 space-y-3 text-[15px] leading-relaxed list-decimal list-inside marker:text-ink-soft marker:dark:text-ink-soft-dark">
          {PROMPTS.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>

        <div className="mt-10 rule-h pt-6">
          <p className="text-[14px] italic text-ink-soft dark:text-ink-soft-dark">
            Using this in your classroom? We'd love to hear about it.{" "}
            <a
              href="mailto:hello@conspiracy-generator.duckdns.org?subject=Classroom%20use"
              className="underline-offset-2 underline not-italic"
            >
              Send a note
            </a>
            .
          </p>
          <Link href="/quiz" className="mt-4 inline-block underline-offset-2 hover:underline text-[14px]">
            Try the real-or-fake quiz with your class →
          </Link>
        </div>
      </article>

      <Footer />
    </>
  );
}
