// HoverMark — dashed pencil-circle SVG + rotated handwritten note.
// Opacity controlled by parent .pulpcard:hover via CSS (.hover-mark { opacity: 0 }
// + .pulpcard:hover .hover-mark { opacity: 1 }).
// Spec: zine-design-system / Requirement: HoverMark primitive.

export function HoverMark({ note }: { note: string }) {
  return (
    <div className="hover-mark" aria-hidden="true" data-zine-marginalia>
      <svg width="120" height="46" viewBox="0 0 120 46" style={{ overflow: "visible" }}>
        <ellipse
          cx="58"
          cy="22"
          rx="52"
          ry="16"
          fill="none"
          stroke="var(--hot-2)"
          strokeWidth={2.3}
          transform="rotate(-3 58 22)"
          strokeDasharray="3,2"
        />
        <path
          d="M104 6 L120 -2"
          stroke="var(--hot-2)"
          strokeWidth={2.3}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="marker"
        style={{
          position: "absolute",
          top: -18,
          left: 110,
          fontSize: 18,
          color: "var(--hot-2)",
          transform: "rotate(-6deg)",
          display: "inline-block",
          whiteSpace: "nowrap",
        }}
      >
        {note}
      </span>
    </div>
  );
}
