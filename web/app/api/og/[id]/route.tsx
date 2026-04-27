// OG card route — 1200×630 dynamic image.
// Renders: brand mark + the four-move recipe + the input triple.
// Explicitly does NOT render any sentence of the generated theory.
// Spec: openspec/changes/v2-rebuild/specs/permalinks-and-sharing/spec.md
//
// Satori (the renderer behind next/og) only supports flex/block/none/-webkit-box,
// no oklch(), and requires every multi-child div to have display: flex explicitly.
// Every <div> below has display: flex. Colors come from MOVES.colorHex.

import { ImageResponse } from "next/og";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { MOVES } from "@/lib/recipe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { id: string };

const PAPER = "#F6F2EA";
const INK = "#1B1A1F";
const INK_SOFT = "#54515C";

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
          background: PAPER,
          color: INK,
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
            borderBottom: `1px solid ${INK}`,
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1.1,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 14,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: "monospace",
                color: INK_SOFT,
              }}
            >
              The four-move recipe
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Georgia, serif",
                fontSize: 56,
                lineHeight: 1.0,
                letterSpacing: "-0.025em",
                fontWeight: 600,
                marginTop: 16,
                flexWrap: "wrap",
              }}
            >
              <span>Every conspiracy theory follows&nbsp;the&nbsp;</span>
              <span style={{ color: MOVES[1].colorHex }}>same four steps.</span>
            </div>

            <div
              style={{
                marginTop: 28,
                fontSize: 18,
                lineHeight: 1.45,
                color: INK_SOFT,
                maxWidth: 520,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {gen ? (
                [
                  ["Event", event],
                  ["Culprit", culprit],
                  ["Motive", motive],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", gap: 10 }}>
                    <span
                      style={{
                        display: "flex",
                        color: INK_SOFT,
                        fontFamily: "monospace",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                        width: 92,
                      }}
                    >
                      {label}
                    </span>
                    <span style={{ display: "flex", color: INK }}>{value}</span>
                  </div>
                ))
              ) : (
                <span style={{ display: "flex" }}>
                  Once you can name the moves, you can spot them. Try the recipe on a news story of
                  your choice.
                </span>
              )}
            </div>
          </div>

          {/* Right: 2x2 of moves rendered as flex rows (Satori does not support CSS Grid) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              flex: 1,
            }}
          >
            {[0, 2].map((rowStart) => (
              <div
                key={rowStart}
                style={{ display: "flex", gap: 12, flex: 1 }}
              >
                {MOVES.slice(rowStart, rowStart + 2).map((m) => (
                  <div
                    key={m.key}
                    style={{
                      display: "flex",
                      flex: 1,
                      flexDirection: "column",
                      justifyContent: "space-between",
                      background: m.colorHex,
                      color: PAPER,
                      padding: "18px 20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        fontFamily: "monospace",
                        fontSize: 13,
                        letterSpacing: "0.18em",
                      }}
                    >
                      MOVE {m.n}
                    </div>
                    <div
                      style={{
                        display: "flex",
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
            ))}
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            display: "flex",
            padding: "14px 32px",
            borderTop: `1px solid ${INK}`,
            fontFamily: "monospace",
            fontSize: 13,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: INK_SOFT,
            justifyContent: "space-between",
          }}
        >
          <span>{gen ? "See the theory at conspiracy-generator" : "conspiracy-generator"}</span>
          <span>Boudry · Meyer · Ghent · Hamburg</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
