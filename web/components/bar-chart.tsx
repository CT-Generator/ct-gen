// Tiny inline SVG bar chart for daily counts. No external deps.

import type { DailyRow } from "@/lib/stats";

type Props = {
  data: DailyRow[];
  /** CSS color (oklch / hex / etc) for the bars. Defaults to ink. */
  color?: string;
  /** Label for the axis legend (singular). */
  unit?: string;
  className?: string;
};

const W = 700; // SVG viewBox width
const H = 160; // SVG viewBox height
const PAD_T = 12;
const PAD_B = 28;
const PAD_L = 32;
const PAD_R = 8;

export function BarChart({ data, color = "var(--tw-color-ink, #1B1A1F)", unit = "items", className }: Props) {
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
  const bw = innerW / data.length;
  const total = data.reduce((s, d) => s + d.n, 0);
  const lastDay = data[data.length - 1]!.day;
  const firstDay = data[0]!.day;

  const yTicks = niceTicks(max);
  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Bar chart, ${data.length} days, total ${total} ${unit}`}
      >
        {/* Y-axis grid lines + labels */}
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

        {/* Bars */}
        {data.map((d, i) => {
          const x = PAD_L + i * bw + 1;
          const h = (d.n / max) * innerH;
          const y = PAD_T + innerH - h;
          return (
            <g key={d.day}>
              <rect
                x={x}
                y={y}
                width={Math.max(1, bw - 2)}
                height={h}
                fill={color}
              />
              {d.n > 0 && (
                <title>{`${d.day}: ${d.n} ${unit}`}</title>
              )}
            </g>
          );
        })}

        {/* X-axis labels (first / last only — keep readable) */}
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
        {data.length} days · {total} {unit} · peak {max}/day
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
