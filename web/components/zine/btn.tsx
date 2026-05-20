// Zine Btn — display-font button with hard offset shadow + hover lift.
// Spec: zine-design-system / Requirement: Btn primitive with four variants.

import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "ink" | "hot" | "punch" | "ghost";
type Size = "md" | "sm";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

function variantClasses(v: Variant): string {
  switch (v) {
    case "hot":
      return "bg-hot text-paper border-ink";
    case "punch":
      return "bg-punch text-ink border-ink";
    case "ghost":
      return "bg-transparent text-ink border-ink";
    case "ink":
    default:
      return "bg-ink text-paper border-ink";
  }
}

function sizeStyle(size: Size) {
  if (size === "sm") {
    return {
      fontSize: 14,
      padding: "8px 14px 6px",
      boxShadow: "4px 4px 0 var(--ink)",
    };
  }
  return {
    fontSize: "clamp(18px, 1.8vw, 22px)",
    padding: "11px 20px 9px",
    boxShadow: "var(--shadow)",
  };
}

// Common interactive style shared across button/link wrappers
const COMMON =
  "zine-btn inline-flex items-center gap-2.5 font-display uppercase whitespace-nowrap " +
  "cursor-pointer border-[3px] transition-transform transition-shadow " +
  "min-h-[44px] tracking-[0.04em] select-none";

const HOVER =
  "hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5";

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;
export function Btn({
  variant = "ink",
  size = "md",
  children,
  className = "",
  style,
  ...rest
}: ButtonProps) {
  return (
    <button
      data-size={size}
      className={`${COMMON} ${HOVER} ${variantClasses(variant)} ${className}`}
      style={{ ...sizeStyle(size), ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}

type LinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };
export function BtnLink({
  variant = "ink",
  size = "md",
  children,
  className = "",
  style,
  href,
  ...rest
}: LinkProps) {
  return (
    <Link
      href={href}
      data-size={size}
      className={`${COMMON} ${HOVER} ${variantClasses(variant)} ${className}`}
      style={{ ...sizeStyle(size), ...style }}
      {...rest}
    >
      {children}
    </Link>
  );
}
