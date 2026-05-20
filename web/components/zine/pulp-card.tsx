// PulpCard — tilted hard-shadow card with hover lift + colorshift to punch yellow.
// On hover: rotation eases to 30%, translate(-3px,-3px), shadow grows, HoverMark fades in.
// Spec: zine-design-system / Requirement: PulpCard primitive.

import type { CSSProperties, ReactNode, MouseEvent } from "react";
import Link from "next/link";
import { HoverMark } from "./hover-mark";

type CommonProps = {
  tilt?: number;          // degrees; default 0
  hoverNote?: string | null;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
};

export function PulpCard({
  tilt = 0,
  hoverNote = null,
  className = "",
  children,
  style,
  onClick,
}: CommonProps & { onClick?: (e: MouseEvent<HTMLElement>) => void }) {
  return (
    <article
      className={`pulpcard ${className}`}
      style={{ ["--tilt" as string]: `${tilt}deg`, ...style }}
      onClick={onClick}
    >
      {hoverNote ? <HoverMark note={hoverNote} /> : null}
      {children}
    </article>
  );
}

// Link variant — same visuals, wraps in a Next.js Link.
export function PulpCardLink({
  tilt = 0,
  hoverNote = null,
  className = "",
  children,
  style,
  href,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={`pulpcard ${className}`}
      style={{ ["--tilt" as string]: `${tilt}deg`, textDecoration: "none", color: "inherit", ...style }}
    >
      {hoverNote ? <HoverMark note={hoverNote} /> : null}
      {children}
    </Link>
  );
}
