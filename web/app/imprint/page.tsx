// /imprint — legal notice required under §5 TMG / §18 MStV.

import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";

export const metadata = { title: "Imprint" };

export default function ImprintPage() {
  return (
    <>
      <Masthead />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <p className="meta">Legal notice · Impressum</p>
        <h1
          className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05]"
          style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
        >
          Imprint
        </h1>

        <div className="mt-8 space-y-6 text-[15.5px] leading-relaxed">
          <section>
            <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
              Information pursuant to §5 TMG
            </h2>
            <p className="mt-3 not-italic">
              Marco Meyer
              <br />
              Tegeler Str. 2
              <br />
              13467 Berlin
              <br />
              Germany
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
              Contact
            </h2>
            <p className="mt-3">
              Email:{" "}
              <a
                href="mailto:marco.meyer@jpberlin.de"
                className="underline-offset-2 underline hover:no-underline"
              >
                marco.meyer@jpberlin.de
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
              Responsible for content under §18 (2) MStV
            </h2>
            <p className="mt-3 not-italic">
              Marco Meyer
              <br />
              Tegeler Str. 2, 13467 Berlin, Germany
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
              EU dispute resolution
            </h2>
            <p className="mt-3">
              The European Commission provides a platform for online dispute resolution at{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener"
                className="underline-offset-2 underline hover:no-underline"
              >
                ec.europa.eu/consumers/odr
              </a>
              . We are not obligated and not willing to participate in dispute resolution
              proceedings before a consumer arbitration board.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
              Liability for content
            </h2>
            <p className="mt-3">
              The Conspiracy Generator is a satirical educational tool. The conspiracy theories
              produced by it are deliberately false, generated on demand by an AI model, and not
              statements of fact. As a service provider we are responsible for our own content
              under §7 (1) TMG and applicable general laws. We are however not obligated to monitor
              transmitted or stored third-party information or to investigate circumstances
              indicating illegal activity (§§ 8 to 10 TMG). Obligations to remove or block
              information under general laws remain unaffected; any liability in this respect is
              only possible from the moment we become aware of a concrete infringement. Upon
              notification of any such infringement we will remove the content immediately.
            </p>
          </section>
        </div>
      </article>

      <Footer />
    </>
  );
}
