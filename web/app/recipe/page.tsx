// /recipe — Wake Up Zine: the four moves explained at length.
// Spec: zine-design-system + attribution-and-brand (educational-purpose framing).

import type { Metadata } from "next";
import { getMoves } from "@/lib/recipe";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { Sticker } from "@/components/zine/sticker";
import { readLocale, getDict } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await readLocale();
  return { title: getDict(locale).meta.recipe_title };
}

export default async function RecipePage() {
  const locale = await readLocale();
  const t = getDict(locale).recipe;
  const long = getDict(locale).recipe_long;
  const z = getDict(locale).zine;
  const MOVES = getMoves(locale);
  const longByKey: Record<string, [string, string, string]> = {
    anomaly: [long.anomaly_short, long.anomaly_body, long.anomaly_tell],
    connection: [long.connection_short, long.connection_body, long.connection_tell],
    dismiss: [long.dismiss_short, long.dismiss_body, long.dismiss_tell],
    discredit: [long.discredit_short, long.discredit_body, long.discredit_tell],
  };

  return (
    <>
      <Masthead />

      <article className="stage">
        <Sticker color="yellow" tilt={-2}>{z.recipe_eyebrow}</Sticker>

        <h1
          className="scream"
          style={{ fontSize: "var(--t-scream-lg)", margin: "14px 0 16px" }}
        >
          {t.h1}
        </h1>

        <p
          className="body"
          style={{
            fontSize: "var(--t-body-lg)",
            lineHeight: 1.6,
            maxWidth: 720,
            margin: 0,
          }}
        >
          {t.lede_a}{" "}
          <a
            href="https://maartenboudry.substack.com/p/the-conspiracy-generator"
            target="_blank"
            rel="noopener"
            style={{
              color: "var(--cool)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {t.lede_link}
          </a>
          {t.lede_period}
        </p>

        {/* Aside */}
        <aside
          style={{
            marginTop: 22,
            background: "var(--paper-2)",
            border: "2.5px solid var(--ink)",
            boxShadow: "var(--shadow)",
            padding: "14px 18px",
            maxWidth: 720,
          }}
        >
          <p
            className="body"
            style={{ fontSize: "var(--t-body)", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}
          >
            {t.aside_p}{" "}
            <strong style={{ fontStyle: "normal", color: "var(--hot-2)" }}>{t.aside_form}</strong>{" "}
            {t.aside_p_2}{" "}
            <strong style={{ fontStyle: "normal", color: "var(--cool)" }}>{t.aside_substance}</strong>{" "}
            {t.aside_p_3}
          </p>
        </aside>

        {/* Four numbered tiles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 36 }}>
          {MOVES.map((m, i) => {
            const [short, body, tell] = longByKey[m.key]!;
            const bgs = ["var(--punch)", "var(--paper)", "var(--paper)", "var(--punch)"];
            const cardBg = bgs[i % 4];
            return (
              <section
                key={m.key}
                style={{
                  background: cardBg,
                  border: "3px solid var(--ink)",
                  boxShadow: "var(--shadow)",
                  padding: "20px 24px 22px",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 18,
                  alignItems: "start",
                }}
              >
                {/* Number badge */}
                <div
                  className="scream"
                  style={{
                    background: "var(--hot)",
                    color: "var(--paper)",
                    fontSize: 38,
                    width: 64,
                    height: 64,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2.5px solid var(--ink)",
                  }}
                >
                  0{m.n}
                </div>

                <div>
                  <div className="scream" style={{ fontSize: "var(--t-scream-sm)", lineHeight: 1.05 }}>
                    {m.title}
                  </div>
                  <div className="label" style={{ color: "var(--hot-2)", marginTop: 6 }}>
                    {t.move_label} {m.n}
                  </div>
                  <p
                    className="marker"
                    style={{
                      fontSize: 18,
                      color: "var(--cool)",
                      transform: "rotate(-1deg)",
                      display: "inline-block",
                      marginTop: 10,
                      lineHeight: 1.2,
                    }}
                  >
                    {short}
                  </p>
                  <p className="body" style={{ fontSize: "var(--t-body)", lineHeight: 1.6, marginTop: 14 }}>
                    {body}
                  </p>

                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop: "1px dashed color-mix(in oklab, var(--ink) 40%, transparent)",
                    }}
                  >
                    <p className="label" style={{ marginBottom: 6, color: "var(--hot-2)" }}>
                      {t.tell_strong}
                    </p>
                    <p
                      className="body"
                      style={{ fontSize: "var(--t-body-sm)", lineHeight: 1.55, margin: 0 }}
                    >
                      {tell}
                    </p>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </article>

      <Footer />
    </>
  );
}
