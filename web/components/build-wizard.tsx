// Build wizard — 5 screens: 4 moves + done. Story is shown on /story/[uuid] before this page.
//
// Locale-aware: receives a pre-resolved label set + per-locale MOVES list from
// the server-component wrapper at app/build/[id]/page.tsx. Wizard locale tracks
// the persisted row, so a fresh visitor switching UI locales mid-build sees
// the wizard in the language it was started in.

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { type MoveKey, type EventIntro, type Ideas } from "@/lib/recipe";
import { MoveGlyph } from "@/components/move-glyph";

const MOVE_KEYS_IN_ORDER: MoveKey[] = ["anomaly", "connection", "dismiss", "discredit"];

type SectionState = { idea: string; paragraph: string; debunk: string };

type WizardLabels = {
  pick_idea: string;
  cooking: string;
  conspiracist_writes: string;
  debunk_label: string;
  next_move: string;
  see_full_theory: string;
  or_regenerate: string;
  writing: string;
  writing_finale: string;
  writing_too_long: string;
  section_failed: string;
  back: string;
  step_n_of: string;
  skip_to_result: string;
  skip_to_result_loading_h: string;
  skip_to_result_loading_dots: string;
  skip_to_result_failed: string;
  progress_done: string;
  move_label: string;
  done_eyebrow: string;
  done_h1: string;
  done_p_a: string;
  done_p_orchestrating: string;
  done_p_in_service_of: string;
  done_p_period: string;
  done_p_missing: string;
  done_cta_read: string;
};

type WizardBlurb = {
  anomaly_explainer: string;
  anomaly_tell: string;
  connection_explainer: string;
  connection_tell: string;
  dismiss_explainer: string;
  dismiss_tell: string;
  discredit_explainer: string;
  discredit_tell: string;
};

type WizardMove = {
  n: "01" | "02" | "03" | "04";
  key: MoveKey;
  title: string;
  color: string;
};

type Locale = "en" | "de" | "nl";

type Props = {
  shortId: string;
  eventName: string;
  culpritName: string;
  motiveName: string;
  intro: EventIntro;
  ideas: Ideas;
  initialPerMove: Partial<Record<MoveKey, SectionState>>;
  locale: Locale;
  moves: WizardMove[];
  labels: WizardLabels;
  blurb: WizardBlurb;
};

type Screen = MoveKey | "done";

const SCREENS: Screen[] = ["anomaly", "connection", "dismiss", "discredit", "done"];

function buildBlurbMap(b: WizardBlurb): Record<MoveKey, { explainer: string; tell: string }> {
  return {
    anomaly: { explainer: b.anomaly_explainer, tell: b.anomaly_tell },
    connection: { explainer: b.connection_explainer, tell: b.connection_tell },
    dismiss: { explainer: b.dismiss_explainer, tell: b.dismiss_tell },
    discredit: { explainer: b.discredit_explainer, tell: b.discredit_tell },
  };
}

function moveByKey(moves: WizardMove[], key: MoveKey): WizardMove {
  return moves.find((m) => m.key === key)!;
}

function generationHref(locale: Locale, shortId: string): string {
  return locale === "en" ? `/g/${shortId}` : `/${locale}/g/${shortId}`;
}

export function BuildWizard(props: Props) {
  const router = useRouter();
  const [perMove, setPerMove] = useState<Partial<Record<MoveKey, SectionState>>>(
    props.initialPerMove,
  );
  const [screen, setScreen] = useState<Screen>(() => {
    for (const k of MOVE_KEYS_IN_ORDER) {
      if (!props.initialPerMove[k]) return k;
    }
    return "done";
  });
  const [skipPending, startSkipTransition] = useTransition();
  const [skipError, setSkipError] = useState<string | null>(null);

  const screenIdx = SCREENS.indexOf(screen);
  const blurbMap = buildBlurbMap(props.blurb);

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

  // Skip-to-result = yolo-from-here. POSTs to /api/build/<id>/yolo, which
  // generates only the missing moves (preserving the user's earlier choices)
  // and stitches the narrative. Idempotent if all four moves are complete.
  function handleSkipToResult() {
    if (skipPending) return;
    setSkipError(null);
    startSkipTransition(async () => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 90_000);
        const res = await fetch(`/api/build/${props.shortId}/yolo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ctrl.signal,
        });
        clearTimeout(t);
        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? `Skip failed (${res.status})`);
        }
        router.push(generationHref(props.locale, props.shortId));
      } catch {
        setSkipError(props.labels.skip_to_result_failed);
      }
    });
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
      <ProgressBar
        current={screen}
        moves={props.moves}
        doneLabel={props.labels.progress_done}
        moveLabelPrefix={moveByKey.toString()}
        moveLabelByLocale={props.labels.move_label}
      />

      {MOVE_KEYS_IN_ORDER.map((k) =>
        screen === k ? (
          <MoveScreen
            key={k}
            shortId={props.shortId}
            move={moveByKey(props.moves, k)}
            blurb={blurbMap[k]}
            ideas={props.ideas[k]}
            initial={perMove[k] ?? null}
            labels={props.labels}
            moveNumberLabel={props.labels.move_label}
            onResolved={(state) => handleSection(k, state)}
            onNext={() => handleDoneAdvance(k)}
          />
        ) : null,
      )}

      {screen === "done" && (
        <DoneScreen
          eventName={props.eventName}
          culpritName={props.culpritName}
          motiveName={props.motiveName}
          perMove={perMove}
          labels={props.labels}
          onView={() => router.push(generationHref(props.locale, props.shortId))}
        />
      )}

      {/* Skip-pending loading region. Renders inline above the bottom nav so
          the visitor sees the system is working without a page change. */}
      {skipPending && (
        <div className="mt-10 rule-h-soft pt-5">
          <p className="font-display text-[16px] sm:text-[17px]" style={{ fontWeight: 600 }}>
            {props.labels.skip_to_result_loading_h}
          </p>
          <SkipDots label={props.labels.skip_to_result_loading_dots} />
        </div>
      )}

      {skipError && (
        <p className="mt-6 text-[13px] text-[oklch(56%_0.14_28)]" role="alert">
          {skipError}
        </p>
      )}

      {/* Stepper-style nav between screens */}
      <nav className="mt-12 rule-h-soft pt-5 flex items-center justify-between text-[12px] text-ink-soft dark:text-ink-soft-dark">
        <button
          type="button"
          disabled={screenIdx <= 0 || skipPending}
          onClick={() => go(SCREENS[screenIdx - 1]!)}
          className="font-mono uppercase tracking-meta-tight px-2 py-1 disabled:opacity-30 hover:text-ink dark:hover:text-ink-dark"
        >
          {props.labels.back}
        </button>
        <span className="font-mono uppercase tracking-meta-tight">
          {props.labels.step_n_of
            .replace("{{n}}", String(Math.min(screenIdx + 1, SCREENS.length)))
            .replace("{{total}}", String(SCREENS.length))}
        </span>
        <button
          type="button"
          onClick={handleSkipToResult}
          disabled={skipPending}
          className="font-mono uppercase tracking-meta-tight px-2 py-1 hover:text-ink dark:hover:text-ink-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {props.labels.skip_to_result}
        </button>
      </nav>
    </article>
  );
}

/* ─── Progress bar ─── */

function ProgressBar({
  current,
  moves,
  doneLabel,
  moveLabelByLocale,
}: {
  current: Screen;
  moves: WizardMove[];
  doneLabel: string;
  moveLabelPrefix?: unknown;
  moveLabelByLocale: string;
}) {
  const items: Array<{ key: Screen; label: string; color?: string }> = [
    ...moves.map((m) => ({
      key: m.key as Screen,
      label: `${moveLabelByLocale} ${m.n}`,
      color: m.color,
    })),
    { key: "done", label: doneLabel },
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
  move,
  blurb,
  ideas,
  initial,
  labels,
  moveNumberLabel,
  onResolved,
  onNext,
}: {
  shortId: string;
  move: WizardMove;
  blurb: { explainer: string; tell: string };
  ideas: string[];
  initial: SectionState | null;
  labels: WizardLabels;
  moveNumberLabel: string;
  onResolved: (s: SectionState) => void;
  onNext: () => void;
}) {
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
        const res = await fetch(`/api/build/${shortId}/${move.key}/section`, {
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
          setError(labels.writing_too_long);
        } else {
          setError(err instanceof Error ? err.message : labels.section_failed);
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
          {moveNumberLabel} {move.n}
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
        <p className="meta mb-3">{labels.pick_idea}</p>
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
                    {labels.cooking}
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
              {labels.conspiracist_writes}
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
            <p className="meta">{labels.debunk_label}</p>
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
              {move.key === "discredit" ? labels.see_full_theory : labels.next_move}
            </button>
            <span className="text-[13px] italic text-ink-soft dark:text-ink-soft-dark">
              {labels.or_regenerate}
            </span>
          </div>
        </div>
      )}

      {pending && !section && (
        <div className="mt-8 text-[14px] italic text-ink-soft dark:text-ink-soft-dark">
          {move.key === "discredit" ? labels.writing_finale : labels.writing}
        </div>
      )}
    </div>
  );
}

/* ─── Done screen ─── */

function DoneScreen({
  eventName,
  culpritName,
  motiveName,
  perMove,
  labels,
  onView,
}: {
  eventName: string;
  culpritName: string;
  motiveName: string;
  perMove: Partial<Record<MoveKey, SectionState>>;
  labels: WizardLabels;
  onView: () => void;
}) {
  const filled = MOVE_KEYS_IN_ORDER.every((k) => perMove[k]);
  return (
    <div>
      <p className="meta">{labels.done_eyebrow}</p>
      <h1
        className="mt-3 font-display text-[clamp(1.8rem,5vw,2.8rem)] leading-[1.05]"
        style={{ fontWeight: 600, letterSpacing: "-0.025em" }}
      >
        {labels.done_h1}
      </h1>
      <p className="mt-5 text-[15px] leading-relaxed">
        {labels.done_p_a}{" "}
        <strong className="font-display" style={{ fontWeight: 600 }}>{culpritName}</strong>{" "}
        {labels.done_p_orchestrating} <em>{eventName}</em> {labels.done_p_in_service_of}{" "}
        <strong className="font-display" style={{ fontWeight: 600 }}>{motiveName.toLowerCase()}</strong>
        {labels.done_p_period}
      </p>
      {!filled && (
        <p className="mt-4 text-[13px] italic text-ink-soft dark:text-ink-soft-dark">
          {labels.done_p_missing}
        </p>
      )}
      <button
        type="button"
        onClick={onView}
        className="mt-7 bg-ink text-paper dark:bg-ink-dark dark:text-paper-dark px-5 py-3 font-display"
        style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}
      >
        {labels.done_cta_read}
      </button>
    </div>
  );
}

/* ─── Skip-to-result dotted-progress sub-line ─── */

function SkipDots({ label }: { label: string }) {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <p className="mt-2 text-[13px] text-ink-soft dark:text-ink-soft-dark">
      {label}
      {".".repeat(dots)}
    </p>
  );
}
