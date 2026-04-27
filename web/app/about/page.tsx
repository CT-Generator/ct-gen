// /about — what the site is, why, and credits.
// Other than this page, names are not surfaced anywhere on the site.

import Link from "next/link";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <Masthead />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <p className="meta">About</p>
        <h1
          className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05]"
          style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
        >
          The best way to learn to spot a conspiracy theory is to make one yourself.
        </h1>

        <div className="mt-8 space-y-5 text-[16px] leading-relaxed">
          <p>
            That's the idea behind this tool. You pick a real event, a culprit, and a motive, and
            then you build a fake conspiracy theory step by step. Each step uses one of the four
            moves real conspiracists rely on, with a debunk running alongside.
          </p>
          <p>
            Once you've done it once, you can't un-see it. You learn that coming up with a
            plausible-sounding conspiracy theory is easy — and that for any one event you can
            generate many different theories that all contradict each other. The number of
            possible conspiracies is unlimited, which is part of why so few of them are real.
          </p>
          <p>
            The four moves are{" "}
            <Link href="/recipe" className="underline-offset-2 underline hover:no-underline">
              explained on the recipe page
            </Link>
            . If you teach, there's also a{" "}
            <Link href="/teach" className="underline-offset-2 underline hover:no-underline">
              lesson plan
            </Link>{" "}
            you can use in class.
          </p>
        </div>

        <div className="mt-12 rule-h pt-6">
          <h2 className="font-display text-[22px] sm:text-[24px]" style={{ fontWeight: 600 }}>
            Credits
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed">
            The Conspiracy Generator is built by{" "}
            <a
              href="https://www.linkedin.com/in/marco-meyer-10923245/"
              target="_blank"
              rel="noopener"
              className="underline-offset-2 underline hover:no-underline"
            >
              Marco Meyer
            </a>{" "}
            and{" "}
            <a
              href="https://www.linkedin.com/in/maarten-boudry-6b199a8/"
              target="_blank"
              rel="noopener"
              className="underline-offset-2 underline hover:no-underline"
            >
              Maarten Boudry
            </a>
            , inspired by{" "}
            <a
              href="https://maartenboudry.substack.com/p/the-conspiracy-generator"
              target="_blank"
              rel="noopener"
              className="underline-offset-2 underline hover:no-underline"
            >
              a blog post by Maarten
            </a>
            . With thanks to Natasha Newbold, Mohammed Darras, and Peter Keroti for their work on
            an earlier version, and to the Etienne Vermeersch Chair of Critical Thinking at Ghent
            University for funding.
          </p>
        </div>
      </article>

      <Footer />
    </>
  );
}
