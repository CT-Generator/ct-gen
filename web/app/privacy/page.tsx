// /privacy — Datenschutzerklärung. Required under Art. 13 GDPR
// because the site processes IP addresses, a session cookie, and forwards
// prompts to OpenAI in the United States.

import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <>
      <Masthead />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <p className="meta">Privacy · Datenschutzerklärung</p>
        <h1
          className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05]"
          style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
        >
          Privacy policy
        </h1>

        <p className="mt-6 text-[16px] leading-relaxed">
          This page explains what data the Conspiracy Generator processes when you use it, why,
          how long we keep it, and what rights you have under the GDPR. The site has no user
          accounts, no analytics, no advertising, and no third-party tracking.
        </p>

        <div className="mt-10 space-y-8 text-[15.5px] leading-relaxed">
          {/* 1. Controller */}
          <section>
            <h2 className="font-display text-[22px] sm:text-[24px]" style={{ fontWeight: 600 }}>
              1. Controller
            </h2>
            <p className="mt-3 not-italic">
              Marco Meyer
              <br />
              Tegeler Str. 2, 13467 Berlin, Germany
              <br />
              Email:{" "}
              <a
                href="mailto:marco.meyer@jpberlin.de"
                className="underline-offset-2 underline hover:no-underline"
              >
                marco.meyer@jpberlin.de
              </a>
            </p>
          </section>

          {/* 2. What we process */}
          <section>
            <h2 className="font-display text-[22px] sm:text-[24px]" style={{ fontWeight: 600 }}>
              2. Data we process
            </h2>

            <h3 className="mt-5 font-display text-[17px]" style={{ fontWeight: 600 }}>
              Server access logs
            </h3>
            <p className="mt-2">
              Our reverse proxy (Caddy 2, running on our own server) writes a log line for each
              HTTP request. The log line includes: the visitor's IP address, the request method
              and path, the HTTP status code, the response size, the user-agent string, and a
              timestamp. We process these logs on the legal basis of Art. 6 (1) lit. f GDPR
              (legitimate interest) for the purposes of debugging, security, and protection
              against abuse.
            </p>

            <h3 className="mt-5 font-display text-[17px]" style={{ fontWeight: 600 }}>
              Session cookie (<code className="text-[14px]">cgen_sid</code>)
            </h3>
            <p className="mt-2">
              When you first interact with the generator we set a strictly necessary,
              first-party, HTTP-only cookie named <code className="text-[14px]">cgen_sid</code>.
              It contains a 24-character pseudonymous identifier (a server-side hash, see below).
              The cookie is used to attribute your ratings to your own session and to deduplicate
              ratings. It is not used for advertising, analytics, or cross-site tracking. Because
              the cookie is strictly necessary for the service requested by you, no consent is
              required (§25 (2) Nr. 2 TTDSG; Art. 6 (1) lit. b GDPR).
            </p>

            <h3 className="mt-5 font-display text-[17px]" style={{ fontWeight: 600 }}>
              Pseudonymous session hash
            </h3>
            <p className="mt-2">
              On the first request that needs a session we compute a salted SHA-256 hash of three
              inputs and keep only the first 24 hex characters: (i) a coarsened version of your
              IP address — for IPv4 we keep only the first three octets (the /24 block), for IPv6
              we keep only the /64 prefix; (ii) your browser's user-agent string; and (iii)
              today's date. The salt is a random server secret that never leaves the server. The
              resulting hash is stored alongside generations and ratings. It cannot be reversed
              to your IP address, but it is still personal data within the meaning of Art. 4 (1)
              GDPR.
            </p>

            <h3 className="mt-5 font-display text-[17px]" style={{ fontWeight: 600 }}>
              Generations and ratings
            </h3>
            <p className="mt-2">
              When you build a fake conspiracy theory we store: the news event, culprit, and
              motive you picked; the AI-generated paragraphs and debunks; the model and recipe
              version used; and the session hash described above. When you rate a generation we
              additionally store your rating (1–5) and an optional free-text comment. Legal basis:
              Art. 6 (1) lit. b GDPR (performance of the service you requested) and Art. 6 (1)
              lit. f GDPR (legitimate interest in maintaining permanent, shareable links to the
              theories users have built).
            </p>

            <h3 className="mt-5 font-display text-[17px]" style={{ fontWeight: 600 }}>
              No analytics, fingerprinting, or third-party tracking
            </h3>
            <p className="mt-2">
              We do not use Google Analytics, Plausible, Matomo, or any other analytics tool. We
              do not embed advertising. We do not load fonts, scripts, or images from third-party
              CDNs at runtime.
            </p>
          </section>

          {/* 3. Recipients */}
          <section>
            <h2 className="font-display text-[22px] sm:text-[24px]" style={{ fontWeight: 600 }}>
              3. Recipients and processors
            </h2>

            <h3 className="mt-5 font-display text-[17px]" style={{ fontWeight: 600 }}>
              OpenAI (USA)
            </h3>
            <p className="mt-2">
              To generate the news intros, brainstorm ideas, and conspiracy paragraphs we call the
              OpenAI API operated by OpenAI Ireland Limited (Dublin) and OpenAI, L.L.C. (San
              Francisco, USA). The data sent in each request consists of the news event you
              selected, the culprit and motive you picked, the brainstorm idea you chose, and
              short instructions to the model. Your IP address is not forwarded; OpenAI sees only
              the IP address of our server. Transfers to the United States rely on the EU–US Data
              Privacy Framework (Adequacy Decision of the European Commission of 10 July 2023);
              additionally, OpenAI's Standard Contractual Clauses (Art. 46 GDPR) apply. OpenAI
              has committed not to use API content to train its models by default. See{" "}
              <a
                href="https://openai.com/policies/privacy-policy"
                target="_blank"
                rel="noopener"
                className="underline-offset-2 underline hover:no-underline"
              >
                openai.com/policies/privacy-policy
              </a>
              .
            </p>

            <h3 className="mt-5 font-display text-[17px]" style={{ fontWeight: 600 }}>
              Hetzner Online GmbH (Germany)
            </h3>
            <p className="mt-2">
              The site is hosted on a virtual server operated by Hetzner Online GmbH, Industriestr.
              25, 91710 Gunzenhausen, Germany. A data processing agreement (Auftragsverarbeitung)
              under Art. 28 GDPR is in place. See{" "}
              <a
                href="https://www.hetzner.com/legal/privacy-policy"
                target="_blank"
                rel="noopener"
                className="underline-offset-2 underline hover:no-underline"
              >
                hetzner.com/legal/privacy-policy
              </a>
              .
            </p>

            <h3 className="mt-5 font-display text-[17px]" style={{ fontWeight: 600 }}>
              DuckDNS
            </h3>
            <p className="mt-2">
              The domain <code className="text-[14px]">conspiracy-generator.duckdns.org</code> is
              served via DuckDNS. DuckDNS only resolves the domain name and does not see your
              traffic.
            </p>

            <h3 className="mt-5 font-display text-[17px]" style={{ fontWeight: 600 }}>
              Let's Encrypt
            </h3>
            <p className="mt-2">
              TLS certificates for the site are issued automatically by Let's Encrypt (Internet
              Security Research Group, USA). The interaction is server-to-server and does not
              involve user data.
            </p>
          </section>

          {/* 4. Retention */}
          <section>
            <h2 className="font-display text-[22px] sm:text-[24px]" style={{ fontWeight: 600 }}>
              4. Retention
            </h2>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li>
                <strong className="font-display" style={{ fontWeight: 600 }}>
                  Server access logs:
                </strong>{" "}
                kept on the server until manually rotated or deleted. We do not currently apply an
                automated retention period; we will introduce one if the volume of logs grows
                materially. You may request deletion of log entries that contain your IP address.
              </li>
              <li>
                <strong className="font-display" style={{ fontWeight: 600 }}>
                  Session cookie:
                </strong>{" "}
                up to 12 months in your browser. You can delete it at any time through your
                browser's privacy settings.
              </li>
              <li>
                <strong className="font-display" style={{ fontWeight: 600 }}>
                  Generations and ratings:
                </strong>{" "}
                stored indefinitely so that the permanent shareable links remain valid. You can
                request deletion of any generation you created (see §5).
              </li>
              <li>
                <strong className="font-display" style={{ fontWeight: 600 }}>
                  Database backups:
                </strong>{" "}
                encrypted, stored in our own infrastructure, rotated on a 30-day window.
              </li>
            </ul>
          </section>

          {/* 5. Rights */}
          <section>
            <h2 className="font-display text-[22px] sm:text-[24px]" style={{ fontWeight: 600 }}>
              5. Your rights
            </h2>
            <p className="mt-3">Under the GDPR you have the right to:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1.5">
              <li>access the personal data we hold about you (Art. 15);</li>
              <li>request rectification of inaccurate data (Art. 16);</li>
              <li>request erasure of your data (Art. 17);</li>
              <li>request restriction of processing (Art. 18);</li>
              <li>data portability (Art. 20);</li>
              <li>
                object to processing based on legitimate interest (Art. 21) — including the
                creation of the session hash described in §2;
              </li>
              <li>withdraw consent at any time, where processing is based on consent (Art. 7).</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, write to{" "}
              <a
                href="mailto:marco.meyer@jpberlin.de"
                className="underline-offset-2 underline hover:no-underline"
              >
                marco.meyer@jpberlin.de
              </a>
              . Because we do not link generations to email addresses, requests to delete a
              specific generation should include the permalink (<code className="text-[14px]">
                /g/&lt;id&gt;
              </code>
              ).
            </p>
          </section>

          {/* 6. Right to lodge a complaint */}
          <section>
            <h2 className="font-display text-[22px] sm:text-[24px]" style={{ fontWeight: 600 }}>
              6. Right to lodge a complaint
            </h2>
            <p className="mt-3">
              You have the right to lodge a complaint with a supervisory authority. The competent
              authority for this site is the Berliner Beauftragte für Datenschutz und
              Informationsfreiheit, Alt-Moabit 59–61, 10555 Berlin (
              <a
                href="https://www.datenschutz-berlin.de/"
                target="_blank"
                rel="noopener"
                className="underline-offset-2 underline hover:no-underline"
              >
                datenschutz-berlin.de
              </a>
              ).
            </p>
          </section>

          {/* 7. Updates */}
          <section>
            <h2 className="font-display text-[22px] sm:text-[24px]" style={{ fontWeight: 600 }}>
              7. Updates to this notice
            </h2>
            <p className="mt-3">
              We may update this notice when the underlying processing changes (for example, if we
              switch AI providers). The current version is always available at this URL.
            </p>
          </section>
        </div>
      </article>

      <Footer />
    </>
  );
}
