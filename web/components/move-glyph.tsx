// Move glyphs — geometric-diagrammatic, stroke-only.
// Source: design system, system.jsx → MoveGlyph
//
// 64x64 viewBox. Stroke uses currentColor by default so the icon picks
// up its move accent from the parent. strokeWidth bumps to 2 below 24px.

import type { MoveKey } from "@/lib/recipe";

type Props = {
  kind: MoveKey;
  size?: number;
  className?: string;
  strokeWidth?: number;
};

export function MoveGlyph({ kind, size = 56, className, strokeWidth }: Props) {
  const sw = strokeWidth ?? (size < 24 ? 2 : 1.5);
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  if (kind === "anomaly") {
    // Regular grid of dots, with one outlier circled and pulled out.
    const dots: React.ReactElement[] = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (r === 1 && c === 3) continue;
        dots.push(
          <circle
            key={`${r}-${c}`}
            cx={12 + c * 10}
            cy={12 + r * 10}
            r={1.2}
            fill="currentColor"
            stroke="none"
          />,
        );
      }
    }
    return (
      <svg {...props}>
        {dots}
        <circle cx={50} cy={8} r={6} />
        <line x1={45.5} y1={12.5} x2={43} y2={15} />
      </svg>
    );
  }

  if (kind === "connection") {
    // Three unrelated nodes, freshly drawn lines connecting them into a triangle.
    return (
      <svg {...props}>
        <circle cx={14} cy={18} r={3} />
        <circle cx={50} cy={22} r={3} />
        <circle cx={32} cy={50} r={3} />
        <path d="M16.5 19.5 L47.5 21" strokeDasharray="2 2" />
        <path d="M48 25 L33 47" strokeDasharray="2 2" />
        <path d="M30 47.5 L15.5 21" strokeDasharray="2 2" />
        <path d="M32 32 L36 28" />
        <path d="M32 32 L28 28" />
      </svg>
    );
  }

  if (kind === "dismiss") {
    // A fact (square) being swept under a curve.
    return (
      <svg {...props}>
        <path d="M6 46 C 18 30, 46 30, 58 46" />
        <rect x={28} y={42} width={8} height={8} transform="rotate(15 32 46)" />
        <path d="M16 50 L20 54 M22 50 L26 54 M44 50 L48 54 M50 50 L54 54" />
      </svg>
    );
  }

  // discredit — finger / arrow pointing at a marked figure
  return (
    <svg {...props}>
      <circle cx={46} cy={24} r={6} />
      <path d="M46 30 L46 50 M40 36 L52 36 M40 50 L46 42 L52 50" />
      <path d="M6 24 L30 24 M22 18 L30 24 L22 30" />
      <circle cx={46} cy={24} r={9} strokeDasharray="2 2" />
    </svg>
  );
}
