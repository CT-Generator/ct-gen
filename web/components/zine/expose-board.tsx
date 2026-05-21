"use client";

// ExposeBoard — desktop-only 2-col exposé hero on /g/[id].
// Headline card on the left, 2x2 summary move cards on the right, RedStrings
// SVG overlay connecting the headline to each move card with pin dots.
//
// Server-component callers pass:
//   - children: the rendered dark-card body (TheoryHeadline + conspiracist
//     intro + source link + footer + RECEIPTS marker stamp).
//   - moves: a compact array {n, title, tactic, color} used to render the
//     2x2 summary cards. Detailed paragraph + debunk content stays on the
//     full-width move blocks below.
//
// Mobile (<640px): the 2x2 grid hides entirely; the dark card spans full
// width. RedStrings already hides itself below 640. The detailed move blocks
// below remain in the DOM in both layouts — they are the actual reading.
//
// Spec: openspec/specs/zine-design-system Requirement: RedStrings primitive;
//       openspec/specs/conspiracy-output Requirement: Wake Up Zine exposé
//       board layout on permalink.

import { useRef, type ReactNode } from "react";
import { RedStrings } from "./red-strings";

type MoveSummary = {
  /** Zero-padded ordinal string from getMoves() (e.g. "01"). */
  n: string;
  title: string;
  tactic: string;
  /** Recipe-move accent color from getMoves(). Currently maps onto zine
   *  tokens via tailwind-config aliases; we ignore it in favor of the zine
   *  punch/paper alternation. Kept on the type for forward-compat. */
  color?: string;
};

export function ExposeBoard({
  children,
  moves,
}: {
  children: ReactNode;
  moves: MoveSummary[];
}) {
  const headlineRef = useRef<HTMLElement>(null);
  const moveRefs = useRef(moves.map(() => ({ current: null as HTMLElement | null })));

  // Alternate background colors for the 2x2 cards: matches the design spec's
  // punch / paper / paper / punch pattern.
  const bgs = ["var(--punch)", "var(--paper)", "var(--paper)", "var(--punch)"];

  return (
    <div style={{ position: "relative" }}>
      <div className="final-grid">
        {/* Left: dark headline card. The ref is applied to this article;
            its content (TheoryHeadline + intro + footer + stamp) comes from
            the server-rendered children. */}
        <article
          ref={headlineRef}
          style={{
            position: "relative",
            background: "var(--ink)",
            color: "var(--paper)",
            border: "3px solid var(--ink)",
            boxShadow: "8px 8px 0 var(--hot)",
            padding: "26px 28px 22px",
          }}
        >
          {children}
        </article>

        {/* Right: 2x2 compact summary grid. Each tile = number + name + tactic.
            Hidden below 640px via .expose-summary-grid CSS rule (globals). */}
        <div className="final-cards-2x2 expose-summary-grid">
          {moves.map((m, i) => (
            <article
              key={m.n}
              ref={(el) => {
                moveRefs.current[i]!.current = el;
              }}
              style={{
                background: bgs[i % 4],
                border: "2.5px solid var(--ink)",
                padding: "14px 16px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                minHeight: 150,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span
                  className="scream"
                  style={{ fontSize: 28, color: "var(--hot-2)", lineHeight: 1 }}
                >
                  {m.n}
                </span>
                <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <div className="scream" style={{ fontSize: 17, lineHeight: 1.05 }}>
                    {m.title}
                  </div>
                  <div className="label" style={{ color: "var(--hot-2)", marginTop: 6 }}>
                    {m.tactic}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Strings overlay — drawn from headline card right-edge to each move
          card left-edge. The component measures via DOM rects and hides itself
          below 640px. */}
      <RedStrings headlineRef={headlineRef} moveRefs={moveRefs.current} />
    </div>
  );
}
