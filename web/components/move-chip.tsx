// Move chip — used inline next to tagged sentences.
// Source: design system, system.jsx → MoveChip
//
// "Move 01 · Hunt anomalies" with top + bottom rules in the move accent.
// Always uppercase mono with 0.12em letter-spacing.

import type { Move } from "@/lib/recipe";

export function MoveChip({
  move,
  size = "md",
}: {
  move: Move;
  size?: "sm" | "md" | "lg";
}) {
  const isLg = size === "lg";
  const isSm = size === "sm";
  return (
    <span
      className="inline-flex items-center font-mono uppercase"
      style={{
        gap: isLg ? 10 : isSm ? 5 : 7,
        borderTop: `1px solid ${move.color}`,
        borderBottom: `1px solid ${move.color}`,
        padding: isLg ? "5px 12px" : isSm ? "2px 6px" : "3px 8px",
        fontSize: isLg ? 12 : isSm ? 9 : 10,
        letterSpacing: "0.12em",
        color: move.color,
        lineHeight: 1,
      }}
    >
      <span style={{ fontWeight: 700 }}>Move {move.n}</span>
      <span
        aria-hidden
        style={{ width: 1, height: isLg ? 12 : isSm ? 7 : 9, background: move.color }}
      />
      <span>{move.title}</span>
    </span>
  );
}
