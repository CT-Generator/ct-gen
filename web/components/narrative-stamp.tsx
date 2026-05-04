// Crop-resistant stamp inside the narrative section on /g/[id]. Parallel to
// MoveTellStamp but for the narrative-as-a-whole — neutral tone, no move accent.
// Pinned to the bottom-right of its parent (which must be position:relative)
// so a horizontal screenshot of any narrative paragraph also captures the stamp.
//
// Spec: openspec/changes/narrative-pedagogical-finish/specs/pedagogical-safeguards/spec.md

export function NarrativeStamp({ label }: { label: string }) {
  return (
    <span
      aria-hidden
      className="font-mono pointer-events-none select-none text-ink-soft dark:text-ink-soft-dark"
      style={{
        position: "absolute",
        bottom: 6,
        right: 8,
        fontSize: 10,
        letterSpacing: "0.14em",
        background: "color-mix(in oklab, currentColor 12%, transparent)",
        padding: "3px 7px",
        opacity: 0.95,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
