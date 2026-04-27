// Crop-resistant inline stamp inside each move's theory paragraph on /g/[id].
// Pinned to the bottom-right corner of its parent (which must be position:relative).
// A horizontal screenshot of any portion of the theory text captures the stamp,
// so the genre-of-content is named even in cropped reposts.
//
// Spec: openspec/changes/ux-research-fixes/specs/pedagogical-safeguards/spec.md

import type { Move } from "@/lib/recipe";

export function MoveTellStamp({ move }: { move: Move }) {
  return (
    <span
      aria-hidden
      className="font-mono pointer-events-none select-none"
      style={{
        position: "absolute",
        bottom: 6,
        right: 8,
        fontSize: 9,
        letterSpacing: "0.14em",
        color: move.color,
        background: move.softHex,
        padding: "2px 6px",
        opacity: 0.9,
        whiteSpace: "nowrap",
      }}
    >
      MOVE {move.n} · {move.tell}
    </span>
  );
}
