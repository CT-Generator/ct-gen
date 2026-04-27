// Footer — credits on every page.
// Source: design system, component-sheets.jsx → OGAndExtras (footer credits)

import Link from "next/link";

export function Footer() {
  return (
    <footer className="rule-h-soft mt-12 sm:mt-16 lg:mt-24">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-9 lg:py-12 text-[12px] sm:text-[13px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
        <p>
          <strong className="font-semibold text-ink dark:text-ink-dark">Conspiracy Generator.</strong>{" "}
          An educational tool — fabricated theories on purpose, debunked in the same breath.
        </p>
        <p className="mt-3">
          <strong className="text-ink dark:text-ink-dark">Ideas:</strong>{" "}
          <a
            className="underline-offset-2 hover:underline"
            href="https://research.flw.ugent.be/en/maarten.boudry"
            target="_blank"
            rel="noopener"
          >
            Maarten Boudry
          </a>{" "}
          (Ghent) &amp;{" "}
          <a
            className="underline-offset-2 hover:underline"
            href="https://www.philosophie.uni-hamburg.de/philosophisches-seminar/personen/meyer-marco.html"
            target="_blank"
            rel="noopener"
          >
            Marco Meyer
          </a>{" "}
          (Hamburg).{" "}
          <strong className="text-ink dark:text-ink-dark">v1 design &amp; build:</strong>{" "}
          <a
            className="underline-offset-2 hover:underline"
            href="https://www.linkedin.com/in/natasha-newbold/"
            target="_blank"
            rel="noopener"
          >
            Natasha Newbold
          </a>{" "}
          and{" "}
          <a
            className="underline-offset-2 hover:underline"
            href="https://www.linkedin.com/in/mohammed-darras/"
            target="_blank"
            rel="noopener"
          >
            Mohammed Darras
          </a>{" "}
          (TJI).{" "}
          <strong className="text-ink dark:text-ink-dark">v1 imagery:</strong>{" "}
          <a
            className="underline-offset-2 hover:underline"
            href="https://www.linkedin.com/in/peter-keroti"
            target="_blank"
            rel="noopener"
          >
            Peter Keroti
          </a>{" "}
          (TJI), DALL·E.{" "}
          <strong className="text-ink dark:text-ink-dark">Funding:</strong>{" "}
          Etienne Vermeersch Chair of Critical Thinking, Ghent University.
        </p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/about" className="underline-offset-2 hover:underline">
            About
          </Link>
          <Link href="/recipe" className="underline-offset-2 hover:underline">
            The recipe
          </Link>
          <a
            className="underline-offset-2 hover:underline"
            href="https://maartenboudry.substack.com/p/the-conspiracy-generator"
            target="_blank"
            rel="noopener"
          >
            Recipe explained ↗
          </a>
        </p>
      </div>
    </footer>
  );
}
