// Build wizard — 5 screens: 4 moves + done. Story is shown on /story/[uuid] before this page.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MOVES, MOVE_BY_KEY, type MoveKey, type EventIntro, type Ideas } from "@/lib/recipe";
import { MoveGlyph } from "@/components/move-glyph";

const MOVE_KEYS_IN_ORDER: MoveKey[] = ["anomaly", "connection", "dismiss", "discredit"];

type SectionState = { idea: string; paragraph: string; debunk: string };

type Props = {
  shortId: string;
  eventName: string;
  culpritName: string;
  motiveName: string;
  intro: EventIntro;
  ideas: Ideas;
  initialPerMove: Partial<Record<MoveKey, SectionState>>;
};

type Screen = MoveKey | "done";

const SCREENS: Screen[] = ["anomaly", "connection", "dismiss", "discredit", "done"];

const MOVE_BLURB: Record<MoveKey, { explainer: string; tell: string }> = {
  anomaly: {
    explainer:
      "Pick something ordinary in the news event and frame it as suspicious. The trick is to treat coincidence as signal — to make the reader feel that something is off.",
    tell: "Real investigators check base rates. Conspiracists collect anomalies and skip the base rate.",
  },
  connection: {
    explainer:
      "Link the culprit to the event through a chain of weakly-related facts. The chain itself becomes the evidence — not whether each link is meaningful.",
    tell: "Six-degrees of separation works for any two people on the planet. A chain of links is not evidence of intent.",
  },
  dismiss: {
    explainer:
      "Take an obvious mainstream rebuttal and reframe it as more proof of the cover-up. The theory becomes immune to disconfirmation.",
    tell: "When counter-evidence becomes more evidence of the conspiracy, the theory has become unfalsifiable. That's a tell, not a strength.",
  },
  discredit: {
    explainer:
      "Reroute the question from \"is this true?\" to \"who is asking?\" Anyone disputing the theory is gullible, manipulated, or paid.",
    tell: "Real investigators welcome critique. Conspiracists treat critique as the conspiracy.",
  },
};

export function BuildWizard(props: Props) {
  const router = useRouter();
  const [perMove, setPerMove] = useState<Partial<Record<MoveKey, SectionState>>>(
    props.initialPerMove,
  );
  const [screen, setScreen] = useState<Screen>(() => {
    // Resume on the first unfinished move; if all done, land on done.
    for (const k of MOVE_KEYS_IN_ORDER) {
      if (!props.initialPerMove[k]) return k;
    }
    return "done";
  });

  const screenIdx = SCREENS.indexOf(screen);

  function go(target: Screen) {
    setScreen(target);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSection(moveKey: MoveKey, state: SectionState) {
    setPerMove((p) => ({ ...p, [moveKey]: state }));
  }

  function handleDoneAdvance(currentMove: MoveKey) {
    const idx = MOVE_KEYS_IN_ORDER.indexOf(currentMove);
    const next = MOVE_KEYS_IN_ORDER[idx + 1];
    go(next ?? "done");
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
      <ProgressBar current={screen} />

      {MOVE_KEYS_IN_ORDER.map((k) =>
        screen === k ? (
          <MoveScreen
            key={k}
            shortId={props.shortId}
            moveKey={k}
            ideas={props.ideas[k]}
            initial={perMove[k] ?? null}
            culpritName={props.culpritName}
            onResolved={(state) => handleSection(k, state)}
            onNext={() => handleDoneAdvance(k)}
          />
        ) : null,
      )}

      {screen === "done" && (
        <DoneScreen
          shortId={props.shortId}
          eventName={props.eventName}
          culpritName={props.culpritName}
          motiveName={props.motiveName}
          perMove={perMove}
          onView={() => router.push(`/g/${props.shortId}`)}
        />
      )}

      {/* Stepper-style nav between screens */}
      <nav className="mt-12 rule-h-soft pt-5 flex items-center justify-between text-[12px] text-ink-soft dark:text-ink-soft-dark">
        <button
          type="button"
          disabled={screenIdx <= 0}
          onClick={() => go(SCREENS[screenIdx - 1]!)}
          className="font-mono uppercase tracking-meta-tight px-2 py-1 disabled:opacity-30 hover:text-ink dark:hover:text-ink-dark"
        >
          ← Back
        </button>
        <span className="font-mono uppercase tracking-meta-tight">
          Step {Math.min(screenIdx + 1, SCREENS.length)} of {SCREENS.length}
        </span>
        <Link href={`/g/${props.shortId}`} className="font-mono uppercase tracking-meta-tight px-2 py-1 hover:text-ink dark:hover:text-ink-dark">
          Skip to result →
        </Link>
      </nav>
    </article>
  );
}

/* ─── Progress bar ─── */

function ProgressBar({ current }: { current: Screen }) {
  const items: Array<{ key: Screen; label: string; color?: string }> = [
    ...MOVES.map((m) => ({ key: m.key as Screen, label: `Move ${m.n}`, color: m.color })),
    { key: "done", label: "Done" },
  ];
  return (
    <div className="flex items-center gap-1.5 mb-7">
      {items.map((it) => {
        const idx = SCREENS.indexOf(it.key);
        const cur = SCREENS.indexOf(current);
        const past = idx < cur;
        const active = idx === cur;
        return (
          <div key={it.key} className="flex flex-col items-center gap-1.5 flex-1">
            <div
              className="h-1 w-full"
              style={{
                background:
                  past || active
                    ? it.color ?? "var(--tw-color-ink, #1B1A1F)"
                    : "color-mix(in oklab, currentColor 12%, transparent)",
                opacity: active ? 1 : past ? 0.7 : 1,
              }}
              aria-hidden
            />
            <span
              className="font-mono uppercase tracking-meta-tight text-[9px] sm:text-[10px]"
              style={{ color: active ? it.color ?? undefined : undefined }}
            >
              {it.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}


/* ─── Move screen ─── */

function MoveScreen({
  shortId,
  moveKey,
  ideas,
  initial,
  culpritName,
  onResolved,
  onNext,
}: {
  shortId: string;
  moveKey: MoveKey;
  ideas: string[];
  initial: SectionState | null;
  culpritName: string;
  onResolved: (s: SectionState) => void;
  onNext: () => void;
}) {
  const move = MOVE_BY_KEY[moveKey];
  const blurb = MOVE_BLURB[moveKey];
  const [section, setSection] = useState<SectionState | null>(initial);
  const [chosenIdea, setChosenIdea] = useState<string | null>(initial?.idea ?? null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function pick(idea: string) {
    if (pending) return;
    setChosenIdea(idea);
    setError(null);
    startTransition(async () => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 60_000);
        const res = await fetch(`/api/build/${shortId}/${moveKey}/section`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ctrl.signal,
          body: JSON.stringify({ idea }),
        });
        clearTimeout(t);
        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? `Failed (${res.status})`);
        }
        const { paragraph, debunk } = (await res.json()) as { paragraph: string; debunk: string };
        const next: SectionState = { idea, paragraph, debunk };
        setSection(next);
        onResolved(next);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setError("That took too long — try again, or pick a different idea.");
        } else {
          setError(err instanceof Error ? err.message : "Generation failed.");
        }
      }
    });
  }

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span style={{ color: move.color }}>
          <MoveGlyph kind={move.key} size={32} strokeWidth={1.5} />
        </span>
        <span
          className="font-mono uppercase"
          style={{ fontSize: 11, letterSpacing: "0.16em", color: move.color }}
        >
          Move {move.n}
        </span>
      </div>
      <h1
        className="mt-3 font-display text-[clamp(1.8rem,5vw,2.8rem)] leading-[1.05]"
        style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
      >
        {move.title}
      </h1>

      <p className="mt-5 text-[15px] leading-relaxed text-ink-soft dark:text-ink-soft-dark">
        {blurb.explainer}
      </p>

      {/* Idea buttons */}
      <div className="mt-7 sm:mt-8">
        <p className="meta mb-3">Pick an idea to apply</p>
        <div className="flex flex-col gap-2.5">
          {ideas.map((idea) => {
            const selected = chosenIdea === idea;
            return (
              <button
                key={idea}
                type="button"
                onClick={() => pick(idea)}
                disabled={pending && !selected}
                aria-pressed={selected}
                className={[
                  "text-left px-4 py-3 border transition-colors",
                  "font-display text-[15px] sm:text-[16px] leading-snug",
                  "disabled:opacity-50",
                  selected
                    ? "bg-paper-alt dark:bg-paper-alt-dark"
                    : "hover:bg-paper-alt dark:hover:bg-paper-alt-dark",
                ].join(" ")}
                style={{
                  borderColor: selected ? move.color : "color-mix(in oklab, currentColor 25%, transparent)",
                  borderWidth: selected ? 2 : 1,
                  color: selected ? move.color : undefined,
                  fontWeight: 500,
                }}
              >
                {idea}
                {selected && pending && (
                  <span className="ml-2 font-mono opacity-70" style={{ fontSize: 11, letterSpacing: "0.14em" }}>
                    cooking…
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="mt-4 text-[13px] text-[oklch(56%_0.14_28)]" role="alert">
          {error}
        </p>
      )}

      {/* Section + debunk display */}
      {section && !pending && (
        <div className="mt-8 space-y-6">
          <div>
            <p className="meta" style={{ color: move.color }}>
              The conspiracist writes
            </p>
            <p
              className="mt-2 text-[16px] sm:text-[17px] leading-[1.65] pl-4 sm:pl-5"
              style={{
                borderLeft: `3px solid ${move.color}`,
                background: `color-mix(in oklab, ${move.color} 6%, transparent)`,
                padding: "12px 14px 12px 18px",
                whiteSpace: "pre-wrap",
              }}
            >
              {section.paragraph}
            </p>
          </div>

          <div>
            <p className="meta">Debunk · why this works</p>
            <p className="mt-2 text-[14.5px] leading-[1.6] pl-4 sm:pl-5 border-l border-dashed border-ink/40 dark:border-ink-dark/40 whitespace-pre-wrap">
              {section.debunk}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onNext}
              className="bg-ink text-paper dark:bg-ink-dark dark:text-paper-dark px-5 py-3 font-display"
              style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}
            >
              {moveKey === "discredit" ? "See the full theory →" : "Next move →"}
            </button>
            <span className="text-[13px] italic text-ink-soft dark:text-ink-soft-dark">
              Or click another idea above to regenerate.
            </span>
          </div>
        </div>
      )}

      {pending && !section && (
        <div className="mt-8 text-[14px] italic text-ink-soft dark:text-ink-soft-dark">
          Writing the conspiracy paragraph and the debunk…
        </div>
      )}
    </div>
  );
}

/* ─── Done screen ─── */

function DoneScreen({
  shortId,
  eventName,
  culpritName,
  motiveName,
  perMove,
  onView,
}: {
  shortId: string;
  eventName: string;
  culpritName: string;
  motiveName: string;
  perMove: Partial<Record<MoveKey, SectionState>>;
  onView: () => void;
}) {
  const filled = MOVE_KEYS_IN_ORDER.every((k) => perMove[k]);
  return (
    <div>
      <p className="meta">Done</p>
      <h1
        className="mt-3 font-display text-[clamp(1.8rem,5vw,2.8rem)] leading-[1.05]"
        style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
      >
        Your conspiracy theory is built.
      </h1>
      <p className="mt-5 text-[15px] leading-relaxed">
        You have a four-move fake conspiracy theory accusing{" "}
        <strong className="font-display" style={{ fontWeight: 600 }}>{culpritName}</strong>{" "}
        of orchestrating <em>{eventName}</em> in service of{" "}
        <strong className="font-display" style={{ fontWeight: 600 }}>{motiveName.toLowerCase()}</strong>.
        Read the assembled theory next, with all four debunks alongside.
      </p>
      {!filled && (
        <p className="mt-4 text-[13px] italic text-ink-soft dark:text-ink-soft-dark">
          Some moves are missing. You can go back and finish them, or jump straight to the result.
        </p>
      )}
      <button
        type="button"
        onClick={onView}
        className="mt-7 bg-ink text-paper dark:bg-ink-dark dark:text-paper-dark px-5 py-3 font-display"
        style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}
      >
        Read the full theory →
      </button>
    </div>
  );
}
