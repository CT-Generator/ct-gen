// Zine Sticker — display-font tag with hard offset shadow and configurable tilt.
// Spec: zine-design-system / Requirement: Sticker primitive in four colors.

import type { ReactNode, CSSProperties } from "react";

type StickerColor = "hot" | "yellow" | "blue" | "ink";

export function Sticker({
  color = "hot",
  tilt = 0,
  children,
  className = "",
  style,
}: {
  color?: StickerColor;
  tilt?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const colorClass =
    color === "yellow" ? "yellow"
      : color === "blue" ? "blue"
        : color === "ink" ? "ink"
          : "";
  return (
    <span
      className={`sticker ${colorClass} ${className}`}
      style={{ ["--tilt" as string]: `${tilt}deg`, ...style }}
    >
      {children}
    </span>
  );
}
