// /imprint — legal notice required under §5 TMG / §18 MStV.
// English body until German + Dutch jurisdictional originals are authored.
// Non-en visitors see a localized "translation pending" notice above the body
// (per spec: openspec/specs/internationalization "Legally-significant page bodies").

import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { readLocale, getDict } from "@/lib/i18n";

export const metadata = { title: "Imprint" };

export default async function ImprintPage() {
  const locale = await readLocale();
  const t = getDict(locale).legal;
  return (
    <>
      <Masthead />

      <article className="stage">
        {locale !== "en" && (
          <aside
            style={{
              marginBottom: 24,
              border: "2.5px solid var(--ink)",
              background: "var(--paper-2)",
              padding: "14px 16px",
            }}
          >
            <p className="label" style={{ marginBottom: 6 }}>
              {t.translation_pending_h}
            </p>
            <p className="body" style={{ fontSize: "var(--t-body-sm)", lineHeight: 1.55, margin: 0 }}>
              {t.translation_pending_body}
            </p>
          </aside>
        )}
        <p className="label">Legal notice · Impressum</p>
        <h1 className="scream" style={{ fontSize: "var(--t-scream-lg)", margin: "14px 0 16px" }}>
          Imprint
        </h1>

        <div
          className="body"
          style={{ display: "flex", flexDirection: "column", gap: 22, fontSize: "var(--t-body)", lineHeight: 1.6, maxWidth: 720 }}
        >
          <section>
            <h2 className="scream" style={{ fontSize: "var(--t-scream-xs)", marginBottom: 8 }}>
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
            <h2 className="scream" style={{ fontSize: "var(--t-scream-xs)", marginBottom: 8 }}>
              Contact
            </h2>
            <p className="mt-3">
              Email:{" "}
              <a
                href="mailto:marco.meyer@jpberlin.de"
                style={{ color: "var(--cool)", textDecoration: "underline" }}
              >
                marco.meyer@jpberlin.de
              </a>
            </p>
          </section>

          <section>
            <h2 className="scream" style={{ fontSize: "var(--t-scream-xs)", marginBottom: 8 }}>
              Responsible for content under §18 (2) MStV
            </h2>
            <p className="mt-3 not-italic">
              Marco Meyer
              <br />
              Tegeler Str. 2, 13467 Berlin, Germany
            </p>
          </section>

          <section>
            <h2 className="scream" style={{ fontSize: "var(--t-scream-xs)", marginBottom: 8 }}>
              EU dispute resolution
            </h2>
            <p className="mt-3">
              The European Commission provides a platform for online dispute resolution at{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener"
                style={{ color: "var(--cool)", textDecoration: "underline" }}
              >
                ec.europa.eu/consumers/odr
              </a>
              . We are not obligated and not willing to participate in dispute resolution
              proceedings before a consumer arbitration board.
            </p>
          </section>

          <section>
            <h2 className="scream" style={{ fontSize: "var(--t-scream-xs)", marginBottom: 8 }}>
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
