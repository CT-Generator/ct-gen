// OG card route — 1200×630 dynamic image.
// Renders: brand mark + the four-move recipe + the input triple.
// Explicitly does NOT render any sentence of the generated theory.
// Spec: openspec/changes/v2-rebuild/specs/permalinks-and-sharing/spec.md

import { ImageResponse } from "next/og";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { MOVES } from "@/lib/recipe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { id: string };

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const rows = await db()
    .select({
      eventValue: schema.generations.eventValue,
      culpritValue: schema.generations.culpritValue,
      motiveValue: schema.generations.motiveValue,
    })
    .from(schema.generations)
    .where(eq(schema.generations.shortId, id))
    .limit(1);
  const gen = rows[0];

  const event = gen?.eventValue ?? "";
  const culprit = gen?.culpritValue ?? "Conspiracy Generator";
  const motive = gen?.motiveValue ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#F6F2EA",
          color: "#1B1A1F",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Top strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 32px",
            borderBottom: "1px solid #1B1A1F",
            fontSize: 13,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontFamily: "monospace",
          }}
        >
          <span>Conspiracy Generator</span>
          <span>Educational satire · do not believe the theory</span>
        </div>

        {/* Body — two columns */}
        <div
          style={{
            display: "flex",
            flex: 1,
            padding: "40px 48px",
            gap: 40,
          }}
        >
          {/* Left: title + inputs */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1.1, justifyContent: "center" }}>
            <div
              style={{
                fontSize: 14,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: "monospace",
                color: "#54515C",
              }}
            >
              The four-move recipe
            </div>
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 60,
                lineHeight: 1.0,
                letterSpacing: "-0.025em",
                fontWeight: 600,
                marginTop: 16,
              }}
            >
              Every conspiracy theory follows the{" "}
              <span style={{ color: MOVES[1].color }}>same four steps</span>.
            </div>
            <div
              style={{
                marginTop: 28,
                fontSize: 19,
                lineHeight: 1.45,
                color: "#54515C",
                maxWidth: 520,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {gen ? (
                <>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "#54515C", fontFamily: "monospace", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", width: 92 }}>
                      Event
                    </span>
                    <span>{event}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "#54515C", fontFamily: "monospace", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", width: 92 }}>
                      Culprit
                    </span>
                    <span>{culprit}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "#54515C", fontFamily: "monospace", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", width: 92 }}>
                      Motive
                    </span>
                    <span>{motive}</span>
                  </div>
                </>
              ) : (
                <span>Once you can name the moves, you can spot them. Try the recipe on a news story of your choice.</span>
              )}
            </div>
          </div>

          {/* Right: 2x2 grid of moves */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              flex: 1,
            }}
          >
            {MOVES.map((m) => (
              <div
                key={m.key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: m.color,
                  color: "#F6F2EA",
                  padding: "18px 20px",
                  height: 165,
                }}
              >
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    letterSpacing: "0.18em",
                  }}
                >
                  MOVE {m.n}
                </div>
                <div
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 22,
                    lineHeight: 1.05,
                    fontWeight: 600,
                  }}
                >
                  {m.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            padding: "14px 32px",
            borderTop: "1px solid #1B1A1F",
            fontFamily: "monospace",
            fontSize: 13,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#54515C",
          }}
        >
          {gen ? "See the theory at conspiracy-generator.duckdns.org" : "conspiracy-generator.duckdns.org"} ·
          Boudry · Meyer · Ghent · Hamburg
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
