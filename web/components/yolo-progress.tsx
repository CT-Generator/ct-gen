// Animated progress indicator for the long YOLO wait (~60s end-to-end:
// /api/start ~20s + /api/build/[id]/yolo ~40s). Replaces the earlier dotted-
// ellipsis affordance that some testers read as a frozen screen.
//
// Spec: openspec/changes/yolo-narrative-polish/specs/yolo-mode/spec.md

import { type CSSProperties } from "react";

type Size = "sm" | "md";

const SIZES: Record<Size, { spinner: number; stroke: number; gap: number }> = {
  sm: { spinner: 16, stroke: 2, gap: 10 },
  md: { spinner: 22, stroke: 2.5, gap: 12 },
};

export function YoloProgress({
  label,
  size = "md",
}: {
  label: string;
  size?: Size;
}) {
  const s = SIZES[size];
  const spinnerStyle: CSSProperties = {
    width: s.spinner,
    height: s.spinner,
    borderWidth: s.stroke,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab, currentColor 30%, transparent)",
    borderTopColor: "currentColor",
    borderRadius: "50%",
    animation: "yolo-progress-spin 0.9s linear infinite",
    flexShrink: 0,
  };
  return (
    <div
      className="flex items-center text-ink-soft dark:text-ink-soft-dark"
      style={{ gap: s.gap }}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden style={spinnerStyle} />
      <span className="text-[13px] sm:text-[14px] leading-tight">{label}</span>
      <style>{`
        @keyframes yolo-progress-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
