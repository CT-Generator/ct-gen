// Disclaimer band — structurally non-removable.
// Renders both above AND below every theory surface so any vertical
// crop of the theory text still includes one disclaimer instance.
// Source: design system, component-sheets.jsx → DisclaimerBand

import { MOVES } from "@/lib/recipe";

type Props = {
  compact?: boolean;
  /** Which move's color to use for the leading square. Defaults to Move 01. */
  accent?: 0 | 1 | 2 | 3;
};

export function DisclaimerBand({ compact = false, accent = 0 }: Props) {
  const accentColor = MOVES[accent].color;
  return (
    <div
      role="note"
      aria-label="Educational satire disclaimer"
      className={[
        "rule-h",
        "border-b border-ink dark:border-ink-dark",
        "flex items-center gap-2 sm:gap-3",
        compact ? "px-3 py-1.5 sm:px-4" : "px-3 py-2 sm:px-5 sm:py-2.5",
        "font-mono text-[10px] sm:text-[11px] leading-snug tracking-meta-tight uppercase",
        "text-ink dark:text-ink-dark",
        "bg-paper dark:bg-paper-dark",
      ].join(" ")}
    >
      <span
        aria-hidden
        className="inline-block flex-shrink-0"
        style={{ width: 8, height: 8, background: accentColor }}
      />
      <span className="leading-snug">
        <strong className="font-bold">Educational satire.</strong>{" "}
        <span className="hidden sm:inline">
          Every theory below is fabricated to demonstrate the recipe — not to be believed,
          screenshotted, or shared as fact.
        </span>
        <span className="sm:hidden">
          Theory below is fabricated to demonstrate the recipe.
        </span>
      </span>
    </div>
  );
}
