// MarkerStamp — rotated Permanent Marker text on paper background with ink
// border + offset shadow. The "RECEIPTS!" stamp on the final-board headline.
// Spec: zine-design-system (signature element of the permalink exposé layout).

import type { CSSProperties, ReactNode } from "react";

export function MarkerStamp({
  children,
  tilt = 15,
  className = "",
  style,
}: {
  children: ReactNode;
  tilt?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`marker ${className}`}
      data-zine-marginalia
      style={{
        display: "inline-block",
        color: "var(--hot)",
        fontSize: 28,
        transform: `rotate(${tilt}deg)`,
        background: "var(--paper)",
        padding: "4px 36px 2px",
        border: "2px solid var(--ink)",
        boxShadow: "3px 3px 0 var(--ink)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
