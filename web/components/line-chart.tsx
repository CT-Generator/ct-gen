// Tiny inline SVG line chart for cumulative daily series. No external deps.

import type { DailyRow } from "@/lib/stats";

type Props = {
  data: DailyRow[];
  color?: string;
  unit?: string;
  className?: string;
};

const W = 700;
const H = 160;
const PAD_T = 12;
const PAD_B = 28;
const PAD_L = 36;
const PAD_R = 8;

export function LineChart({
  data,
  color = "var(--tw-color-ink, #1B1A1F)",
  unit = "items",
  className,
}: Props) {
  if (!data.length) {
    return (
      <div className={className} aria-hidden>
        <p className="text-[13px] italic text-ink-soft dark:text-ink-soft-dark">No data yet.</p>
      </div>
    );
  }
  const max = Math.max(1, ...data.map((d) => d.n));
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
  const total = data[data.length - 1]!.n;
  const lastDay = data[data.length - 1]!.day;
  const firstDay = data[0]!.day;

  const points = data.map((d, i) => {
    const x = PAD_L + i * stepX;
    const y = PAD_T + innerH - (d.n / max) * innerH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = `M ${points.join(" L ")}`;
  const area = `M ${PAD_L},${PAD_T + innerH} L ${points.join(" L ")} L ${PAD_L + (data.length - 1) * stepX},${PAD_T + innerH} Z`;

  const yTicks = niceTicks(max);

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Line chart, ${data.length} days, current total ${total} ${unit}`}
      >
        {yTicks.map((t) => {
          const y = PAD_T + innerH - (t / max) * innerH;
          return (
            <g key={t}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.12}
                strokeWidth={0.5}
              />
              <text
                x={PAD_L - 4}
                y={y + 3}
                fontSize={9}
                textAnchor="end"
                fontFamily="ui-monospace, monospace"
                fill="currentColor"
                opacity={0.5}
              >
                {t}
              </text>
            </g>
          );
        })}

        <path d={area} fill={color} fillOpacity={0.12} />
        <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

        <text
          x={PAD_L}
          y={H - 8}
          fontSize={10}
          fontFamily="ui-monospace, monospace"
          fill="currentColor"
          opacity={0.55}
        >
          {firstDay}
        </text>
        <text
          x={W - PAD_R}
          y={H - 8}
          fontSize={10}
          textAnchor="end"
          fontFamily="ui-monospace, monospace"
          fill="currentColor"
          opacity={0.55}
        >
          {lastDay}
        </text>
      </svg>
      <figcaption
        className="mt-1 font-mono uppercase text-ink-soft dark:text-ink-soft-dark"
        style={{ fontSize: 10, letterSpacing: "0.14em" }}
      >
        {data.length} days · {total} {unit} cumulative
      </figcaption>
    </figure>
  );
}

function niceTicks(max: number): number[] {
  if (max <= 5) return Array.from({ length: max + 1 }, (_, i) => i);
  const step = Math.max(1, Math.ceil(max / 4));
  const out: number[] = [];
  for (let v = 0; v <= max; v += step) out.push(v);
  if (out[out.length - 1] !== max) out.push(max);
  return out;
}
