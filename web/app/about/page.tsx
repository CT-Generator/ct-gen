// /about — full credits, funding, references.
// Spec: openspec/changes/v2-rebuild/specs/attribution-and-brand/spec.md

import Link from "next/link";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { DisclaimerBand } from "@/components/disclaimer-band";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <DisclaimerBand />
      <Masthead />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <p className="meta">About</p>
        <h1
          className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05]"
          style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
        >
          The recipe, written out.
        </h1>

        <div className="mt-8 space-y-5 text-[16px] leading-relaxed">
          <p>
            <strong>Conspiracy Generator</strong> is an educational tool that walks people through the
            four-step recipe for inventing a fake conspiracy theory. The point isn't to make convincing
            theories — the point is to make the construction visible so the reader can recognize the
            same moves the next time they encounter one in the wild.
          </p>
          <p>
            The recipe — <em>hunt for anomalies, fabricate connections, dismiss counter-evidence,
            discredit critics</em> — is articulated by Maarten Boudry and Marco Meyer. Read the
            short version on the{" "}
            <a
              href="https://maartenboudry.substack.com/p/the-conspiracy-generator"
              className="underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener"
            >
              Substack
            </a>{" "}
            or the long version in the{" "}
            <a
              href="https://drive.google.com/file/d/1GMDVLdKfvaFnj8IFDyiRTGH3ePsOO9B7/views"
              className="underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener"
            >
              academic paper
            </a>
            .
          </p>
          <p>
            The app is structured so that every generated theory is paired with a debunking column in
            equal visual prominence. Sharing always links back to the recipe — there is no downloadable
            image of the theory text. That's not a missing feature; it's the design.
          </p>
        </div>

        <div className="mt-10 rule-h pt-6">
          <h2 className="font-display text-[22px] sm:text-[24px]" style={{ fontWeight: 600 }}>
            Credits
          </h2>
          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-x-5 gap-y-3 text-[14.5px]">
            <dt className="meta sm:pt-1">Ideas</dt>
            <dd>
              <a
                href="https://research.flw.ugent.be/en/maarten.boudry"
                className="underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener"
              >
                Maarten Boudry
              </a>{" "}
              (Ghent University, philosophy of science) &amp;{" "}
              <a
                href="https://www.philosophie.uni-hamburg.de/philosophisches-seminar/personen/meyer-marco.html"
                className="underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener"
              >
                Marco Meyer
              </a>{" "}
              (University of Hamburg, philosophy)
            </dd>

            <dt className="meta sm:pt-1">v1 design &amp; dev</dt>
            <dd>
              <a
                href="https://www.linkedin.com/in/natasha-newbold/"
                className="underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener"
              >
                Natasha Newbold
              </a>{" "}
              and{" "}
              <a
                href="https://www.linkedin.com/in/mohammed-darras/"
                className="underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener"
              >
                Mohammed Darras
              </a>{" "}
              (Tech Jobs International)
            </dd>

            <dt className="meta sm:pt-1">v1 imagery</dt>
            <dd>
              <a
                href="https://www.linkedin.com/in/peter-keroti"
                className="underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener"
              >
                Peter Keroti
              </a>{" "}
              (TJI), DALL·E
            </dd>

            <dt className="meta sm:pt-1">Funding</dt>
            <dd>Etienne Vermeersch Chair of Critical Thinking, Ghent University</dd>
          </dl>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
          <Link href="/recipe" className="underline-offset-2 hover:underline">
            The recipe →
          </Link>
          <Link href="/" className="underline-offset-2 hover:underline">
            Generate a theory →
          </Link>
          <a
            href="https://conspiracy-generation.streamlit.app"
            className="underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener"
          >
            v1 archive ↗
          </a>
        </div>
      </article>

      <Footer />
    </>
  );
}
