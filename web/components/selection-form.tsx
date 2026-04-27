// Selection form — interactive client component for picking event/culprit/motive.
// Mobile: stacks 1-column. Tablet+: 1.4fr / 1fr / 1fr grid (matches design canvas proportions).
// Source: design system, component-sheets.jsx → HomeSheet (picker)

"use client";

import { useState } from "react";

type Props = {
  events: string[];
  culprits: string[];
  motives: string[];
};

export function SelectionForm({ events, culprits, motives }: Props) {
  const [event, setEvent] = useState(events[0] ?? "");
  const [culprit, setCulprit] = useState(culprits[0] ?? "");
  const [motive, setMotive] = useState(motives[1] ?? motives[0] ?? "");

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        {/* Event card */}
        <fieldset className="bg-paper-alt dark:bg-paper-alt-dark border border-ink/15 dark:border-ink-dark/15 p-4 sm:p-5">
          <legend className="sr-only">News event</legend>
          <div className="flex items-center gap-2 mb-3">
            <span className="meta">News event</span>
            <span className="hidden sm:inline text-[11px] italic text-ink-soft dark:text-ink-soft-dark">
              real-world news, paraphrased
            </span>
          </div>
          <div className="flex flex-col">
            {events.map((e, i) => (
              <label
                key={e}
                className={[
                  "flex items-start gap-2.5 py-2 text-[13.5px] leading-snug cursor-pointer",
                  i ? "border-t border-ink/10 dark:border-ink-dark/10" : "",
                  event === e ? "text-ink dark:text-ink-dark font-medium" : "text-ink-soft dark:text-ink-soft-dark",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="event"
                  value={e}
                  checked={event === e}
                  onChange={() => setEvent(e)}
                  className="mt-1.5 accent-ink"
                />
                <span>{e}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 font-mono uppercase border border-dashed border-ink/35 dark:border-ink-dark/35 px-2.5 py-1.5 text-ink-soft dark:text-ink-soft-dark hover:text-ink dark:hover:text-ink-dark hover:border-ink/60 dark:hover:border-ink-dark/60 transition-colors"
            style={{ fontSize: 10, letterSpacing: "0.14em" }}
          >
            + Use my own headline
          </button>
        </fieldset>

        {/* Culprit card */}
        <fieldset className="bg-paper-alt dark:bg-paper-alt-dark border border-ink/15 dark:border-ink-dark/15 p-4 sm:p-5">
          <legend className="sr-only">Culprit</legend>
          <div className="meta mb-3.5">Culprit</div>
          <div className="flex flex-col gap-2.5">
            {culprits.map((c) => {
              const selected = culprit === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCulprit(c)}
                  aria-pressed={selected}
                  className={[
                    "flex items-center gap-2.5 px-3 py-2.5 text-left",
                    "font-display text-[16px] sm:text-[17px] leading-tight",
                    "border transition-colors",
                    selected
                      ? "border-ink dark:border-ink-dark bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark"
                      : "border-ink/20 dark:border-ink-dark/20 text-ink-soft dark:text-ink-soft-dark hover:border-ink/40 dark:hover:border-ink-dark/40",
                  ].join(" ")}
                  style={{ fontWeight: 600 }}
                >
                  <span aria-hidden className="block h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 bg-paper dark:bg-paper-dark border border-ink/15 dark:border-ink-dark/15" />
                  <span>{c}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Motive card */}
        <fieldset className="bg-paper-alt dark:bg-paper-alt-dark border border-ink/15 dark:border-ink-dark/15 p-4 sm:p-5 md:col-span-2 lg:col-span-1">
          <legend className="sr-only">Motive</legend>
          <div className="meta mb-3.5">Motive</div>
          <div className="flex flex-col gap-2">
            {motives.map((m) => {
              const selected = motive === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMotive(m)}
                  aria-pressed={selected}
                  className={[
                    "px-3 py-2.5 text-left text-[14px] leading-snug",
                    "border transition-colors",
                    selected
                      ? "border-ink dark:border-ink-dark bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark"
                      : "border-ink/20 dark:border-ink-dark/20 text-ink-soft dark:text-ink-soft-dark hover:border-ink/40 dark:hover:border-ink-dark/40",
                  ].join(" ")}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* CTA row */}
      <div className="mt-7 sm:mt-8 rule-h pt-5 sm:pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] italic text-ink-soft dark:text-ink-soft-dark max-w-xl leading-relaxed">
          Generation runs in front of you. You can stop it, replay any move, or compare it against the
          debunking column at any time.
        </p>
        <button
          type="button"
          disabled={!event || !culprit || !motive}
          className="self-stretch sm:self-auto bg-ink text-paper dark:bg-ink-dark dark:text-paper-dark px-5 py-3 sm:px-6 sm:py-3.5 font-display inline-flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
          style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}
          // Phase 2 task 2B.3 wires this to /api/generate. For now a no-op.
        >
          Cook the theory
          <span className="font-mono opacity-70" style={{ fontSize: 11 }}>
            →
          </span>
        </button>
      </div>
    </>
  );
}
