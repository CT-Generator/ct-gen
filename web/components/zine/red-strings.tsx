"use client";

// RedStrings — corkboard SVG connectors from a headline card to N move cards.
// Measures DOM via getBoundingClientRect inside useLayoutEffect, recomputes
// on resize and 60ms after mount (font shift compensation).
// Mobile (<640px) suppresses the strings entirely.
// Spec: zine-design-system / Requirement: RedStrings primitive.

import {
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

type PathSpec = { d: string; x1: number; y1: number; x2: number; y2: number };

export function RedStrings({
  headlineRef,
  moveRefs,
}: {
  headlineRef: RefObject<HTMLElement | null>;
  moveRefs: RefObject<HTMLElement | null>[];
}) {
  const wrapRef = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState<PathSpec[]>([]);
  const [enabled, setEnabled] = useState<boolean>(true);

  useLayoutEffect(() => {
    function compute() {
      const wrap = wrapRef.current;
      const headline = headlineRef.current;
      if (!wrap || !headline) return;

      // Mobile: skip the strings (stacked cards make connectors meaningless).
      if (window.innerWidth <= 640) {
        setEnabled(false);
        setPaths([]);
        return;
      }
      setEnabled(true);

      const wrapBox = wrap.getBoundingClientRect();
      const h = headline.getBoundingClientRect();
      const hx = h.right - wrapBox.left - 8;
      const hy = h.top + h.height / 2 - wrapBox.top;

      const next: PathSpec[] = [];
      moveRefs.forEach((r, i) => {
        const el = r.current;
        if (!el) return;
        const b = el.getBoundingClientRect();
        const x2 = b.left - wrapBox.left + 8;
        const y2 = b.top + b.height / 2 - wrapBox.top;
        const mx = (hx + x2) / 2;
        const my = (hy + y2) / 2 + 28 + (i % 2 === 0 ? 8 : -4);
        next.push({
          d: `M ${hx} ${hy} Q ${mx} ${my} ${x2} ${y2}`,
          x1: hx,
          y1: hy,
          x2,
          y2,
        });
      });
      setPaths(next);
    }

    compute();
    const t = setTimeout(compute, 60); // font-shift compensation
    window.addEventListener("resize", compute);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", compute);
    };
  }, [headlineRef, moveRefs]);

  if (!enabled) return null;

  return (
    <svg ref={wrapRef} className="strings" aria-hidden="true" data-zine-marginalia>
      {paths.map((p, i) => (
        <g key={i}>
          <path d={p.d} />
          <circle className="pin" cx={p.x1} cy={p.y1} r={4} />
          <circle className="pin" cx={p.x2} cy={p.y2} r={4} />
        </g>
      ))}
    </svg>
  );
}
