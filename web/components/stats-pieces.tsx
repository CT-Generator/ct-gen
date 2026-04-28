// Shared presentational primitives for /stats and /stats/visitors.
// Spec: openspec/changes/visitor-tracking/specs/visitor-analytics/spec.md

import { MOVES } from "@/lib/recipe";

export function Tile({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: number | string;
  accent?: string;
  muted?: boolean;
}) {
  const display = typeof value === "number" ? value.toLocaleString() : value;
  return (
    <div className="bg-paper-alt dark:bg-paper-alt-dark p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-[110px]">
      <span className="meta" style={{ color: accent }}>
        {label}
      </span>
      <span
        className="font-display tabular-nums leading-none"
        style={{
          fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
          fontWeight: 600,
          color: accent,
          opacity: muted ? 0.75 : 1,
        }}
      >
        {display}
      </span>
    </div>
  );
}

export function TopList({
  title,
  rows,
  accent,
  emptyHint,
}: {
  title: string;
  rows: { value: string; n: number }[];
  accent?: string;
  emptyHint?: string;
}) {
  if (!rows.length) {
    if (!emptyHint) return null;
    return (
      <section>
        <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
          {title}
        </h2>
        <p className="mt-3 text-[13px] italic text-ink-soft dark:text-ink-soft-dark">
          {emptyHint}
        </p>
      </section>
    );
  }
  const max = Math.max(...rows.map((r) => r.n), 1);
  return (
    <section>
      <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
        {title}
      </h2>
      <ol className="mt-3">
        {rows.map((r) => (
          <li
            key={r.value}
            className="flex items-baseline gap-3 py-2 border-t border-ink/10 dark:border-ink-dark/10 first:border-t-0"
          >
            <span className="flex-1 truncate text-[14px]">{r.value}</span>
            <span className="font-mono tabular-nums text-[12px]" style={{ color: accent }}>
              {r.n.toLocaleString()}
            </span>
            <span
              aria-hidden
              className="block h-1 ml-2 flex-shrink-0"
              style={{
                width: `${(r.n / max) * 80}px`,
                background: accent ?? "currentColor",
                opacity: 0.6,
              }}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}

export function RatingHist({ rows }: { rows: { value: string; n: number }[] }) {
  if (!rows.length) {
    return (
      <section>
        <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
          Rating distribution
        </h2>
        <p className="mt-3 text-[13px] italic text-ink-soft dark:text-ink-soft-dark">
          No ratings yet.
        </p>
      </section>
    );
  }
  const max = Math.max(...rows.map((r) => r.n), 1);
  return (
    <section>
      <h2 className="font-display text-[20px] sm:text-[22px]" style={{ fontWeight: 600 }}>
        Rating distribution
      </h2>
      <ol className="mt-3 space-y-2">
        {rows.map((r) => (
          <li key={r.value} className="flex items-center gap-3 text-[14px]">
            <span className="meta w-8">{r.value}★</span>
            <span
              aria-hidden
              className="block h-3"
              style={{
                width: `${(r.n / max) * 100}%`,
                background: MOVES[3].color,
                maxWidth: "85%",
              }}
            />
            <span className="font-mono tabular-nums text-[12px] text-ink-soft dark:text-ink-soft-dark">
              {r.n}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
