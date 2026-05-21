// Build wizard — 5 screens: 4 moves + done. Story is shown on /story/[uuid] before this page.
//
// Locale-aware: receives a pre-resolved label set + per-locale MOVES list from
// the server-component wrapper at app/build/[id]/page.tsx. Wizard locale tracks
// the persisted row, so a fresh visitor switching UI locales mid-build sees
// the wizard in the language it was started in.

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { parseMarkedText, type MoveKey, type EventIntro, type Ideas } from "@/lib/recipe";
import { YoloProgress } from "@/components/yolo-progress";
import { TheoryText } from "@/components/zine/theory-text";
import { Sticker } from "@/components/zine/sticker";
import { DebunkSlam } from "@/components/zine/debunk-slam";

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
  skip_to_result_retry: string;
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

/** Subset of dict.zine needed for the wizard's slam overlay + sticker eyebrow.
 *  Kept narrow so the page can compose it from dict.zine without passing the
 *  whole zine dict tree. */
type WizardZineLabels = {
  now_show_me_debunk: string;
  back_to_the_theory: string;
  why_it_doesnt_hold_up: string;
  useful_test: string;
  useful_test_body: string;
  your_theory_sticker: string;
  debunk_sticker: string;
  the_move: string;
  marker_caption: string;
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
  zine: WizardZineLabels;
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
    <article className="stage">
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
            zine={props.zine}
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
          the visitor sees the system is working without a page change. The
          animated spinner runs continuously for the ~60s wait — the earlier
          dotted-ellipsis was being read as a frozen screen. */}
      {skipPending && (
        <div className="mt-10 rule-h-soft pt-5">
          <p className="font-display text-[16px] sm:text-[17px]" style={{ fontWeight: 600 }}>
            {props.labels.skip_to_result_loading_h}
          </p>
          <div className="mt-2">
            <YoloProgress label={props.labels.skip_to_result_loading_dots} />
          </div>
        </div>
      )}

      {skipError && (
        <div className="mt-6 flex flex-wrap items-center gap-3" role="alert">
          <p className="text-[13px] text-[oklch(56%_0.14_28)]">{skipError}</p>
          <button
            type="button"
            onClick={handleSkipToResult}
            disabled={skipPending}
            className="border border-ink/40 dark:border-ink-dark/40 text-ink dark:text-ink-dark hover:border-ink dark:hover:border-ink-dark px-3 py-1.5 text-[12px] font-display disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ fontWeight: 500 }}
          >
            {props.labels.skip_to_result_retry}
          </button>
        </div>
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
  const items: Array<{ key: Screen; label: string }> = [
    ...moves.map((m) => ({
      key: m.key as Screen,
      label: `${moveLabelByLocale} ${m.n}`,
    })),
    { key: "done", label: doneLabel },
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        gap: 8,
        marginBottom: 22,
      }}
    >
      {items.map((it) => {
        const idx = SCREENS.indexOf(it.key);
        const cur = SCREENS.indexOf(current);
        const past = idx < cur;
        const active = idx === cur;
        return (
          <div
            key={it.key}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: "100%",
                height: 18,
                border: "2.5px solid var(--ink)",
                background: active ? "var(--hot)" : past ? "var(--ink)" : "var(--paper)",
                transition: "background var(--t-fast)",
              }}
              aria-hidden
            />
            <span
              className="label"
              style={{
                fontSize: 9,
                color: active ? "var(--hot-2)" : past ? "var(--ink)" : "color-mix(in oklab, var(--ink) 55%, transparent)",
              }}
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
  zine,
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
  zine: WizardZineLabels;
  moveNumberLabel: string;
  onResolved: (s: SectionState) => void;
  onNext: () => void;
}) {
  const [section, setSection] = useState<SectionState | null>(initial);
  const [chosenIdea, setChosenIdea] = useState<string | null>(initial?.idea ?? null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [debunkOpen, setDebunkOpen] = useState(false);

  // Reset the debunk overlay every time the move screen changes or a fresh
  // idea is picked (regeneration). Keeps the slam animation feeling deliberate.
  function resetDebunk() {
    setDebunkOpen(false);
  }

  function pick(idea: string) {
    if (pending) return;
    setChosenIdea(idea);
    setError(null);
    resetDebunk();
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
      {/* Move-step header — sticker eyebrow + scream H1 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Sticker tilt={-2}>
          {moveNumberLabel} {move.n}
        </Sticker>
        <span className="label" style={{ color: "var(--hot-2)" }}>
          {blurb.tell}
        </span>
      </div>
      <h1 className="scream" style={{ fontSize: "var(--t-scream-md)", margin: "12px 0 6px" }}>
        {move.title}
      </h1>

      <p
        className="body"
        style={{ fontSize: "var(--t-body)", lineHeight: 1.6, marginTop: 8, maxWidth: 720 }}
      >
        {blurb.explainer}
      </p>

      {/* Idea buttons — zine pick style (matches the conspirators picker) */}
      <div style={{ marginTop: 26 }}>
        <p className="label" style={{ marginBottom: 10 }}>
          {labels.pick_idea}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ideas.map((idea) => {
            const selected = chosenIdea === idea;
            const showCooking = selected && pending;
            return (
              <button
                key={idea}
                type="button"
                onClick={() => pick(idea)}
                disabled={pending && !selected}
                aria-pressed={selected}
                className="zine-pick"
                data-selected={selected ? "1" : "0"}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  border: "2.5px solid var(--ink)",
                  background: selected ? "var(--punch)" : "var(--paper)",
                  color: "var(--ink)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: 15,
                  lineHeight: 1.4,
                  cursor: pending && !selected ? "not-allowed" : "pointer",
                  boxShadow: selected ? "4px 4px 0 var(--ink)" : "2px 2px 0 var(--ink)",
                  opacity: pending && !selected ? 0.5 : 1,
                  transition: "transform var(--t-fast), box-shadow var(--t-fast), background var(--t-fast)",
                }}
              >
                {idea}
                {showCooking && (
                  <span
                    className="label"
                    style={{ marginLeft: 10, color: "var(--hot-2)" }}
                  >
                    {labels.cooking}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            marginTop: 16,
            padding: "10px 14px",
            background: "var(--hot)",
            color: "var(--paper)",
            border: "2px solid var(--ink)",
            boxShadow: "3px 3px 0 var(--ink)",
          }}
        >
          <span className="label" style={{ color: "var(--paper)" }}>{error}</span>
        </div>
      )}

      {/* Section reveal — theory paragraph card + "Show debunk" CTA; clicking
          opens a slam overlay with the debunk inside.
          Spec: zine-design-system DebunkSlam primitive. */}
      {section && !pending && (
        <div style={{ position: "relative", marginTop: 28 }}>
          <article
            style={{
              background: "var(--paper)",
              border: "3px solid var(--ink)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <header
              style={{
                background: "var(--punch)",
                padding: "18px 24px 16px",
                borderBottom: "3px solid var(--ink)",
                position: "relative",
              }}
            >
              <div className="label" style={{ color: "var(--hot-2)" }}>
                {zine.the_move}
              </div>
              <h2
                className="scream"
                style={{ fontSize: "var(--t-scream-md)", margin: "4px 0 0", lineHeight: 0.96 }}
              >
                {move.title}
              </h2>
              <div style={{ position: "absolute", top: 14, right: 18 }}>
                <Sticker tilt={6}>{zine.your_theory_sticker}</Sticker>
              </div>
            </header>

            <div style={{ padding: "22px 24px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <p className="label">{labels.conspiracist_writes}</p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "var(--t-body-lg)",
                  lineHeight: 1.6,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                <TheoryText parts={parseMarkedText(section.paragraph)} />
              </p>
              <p
                className="label"
                style={{
                  color: "color-mix(in oklab, var(--ink) 55%, transparent)",
                  marginTop: -2,
                }}
              >
                {zine.marker_caption}
              </p>
              <div style={{ marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setDebunkOpen(true)}
                  className="zine-btn"
                  data-size="sm"
                  style={{
                    background: "transparent",
                    color: "var(--ink)",
                    border: "3px solid var(--ink)",
                    boxShadow: "4px 4px 0 var(--ink)",
                    fontFamily: "var(--font-display)",
                    fontSize: 14,
                    padding: "8px 14px 6px",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    minHeight: 44,
                    whiteSpace: "nowrap",
                  }}
                >
                  {zine.now_show_me_debunk}
                </button>
              </div>
            </div>
          </article>

          {/* Slam overlay — drops in with rotation overshoot when opened. */}
          <DebunkSlam open={debunkOpen} onClose={() => setDebunkOpen(false)}>
            <article
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                right: 14,
                bottom: -8,
                display: "flex",
                flexDirection: "column",
                background: "var(--paper)",
                border: "3px solid var(--ink)",
                boxShadow: "12px 12px 0 var(--hot)",
              }}
            >
              <header
                style={{
                  background: "var(--hot)",
                  color: "var(--paper)",
                  padding: "18px 24px 16px",
                  borderBottom: "3px solid var(--ink)",
                  position: "relative",
                }}
              >
                <div className="label" style={{ color: "var(--paper)", opacity: 0.85 }}>
                  {zine.why_it_doesnt_hold_up}
                </div>
                <h2
                  className="scream"
                  style={{ fontSize: "var(--t-scream-sm)", margin: "4px 0 0", lineHeight: 0.96 }}
                >
                  {labels.debunk_label}.
                </h2>
                <div style={{ position: "absolute", top: 14, right: 18 }}>
                  <Sticker color="yellow" tilt={8}>
                    {zine.debunk_sticker}
                  </Sticker>
                </div>
                <button
                  onClick={() => setDebunkOpen(false)}
                  aria-label="Close debunk"
                  style={{
                    position: "absolute",
                    bottom: -18,
                    right: 24,
                    background: "var(--paper)",
                    color: "var(--ink)",
                    border: "3px solid var(--ink)",
                    width: 36,
                    height: 36,
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                  }}
                >
                  ✕
                </button>
              </header>

              <div
                style={{
                  padding: "26px 24px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  flex: "1 1 auto",
                }}
              >
                <p
                  className="body"
                  style={{
                    fontSize: "var(--t-body-lg)",
                    lineHeight: 1.6,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {section.debunk}
                </p>
                <div
                  className="body"
                  style={{
                    fontSize: 13,
                    paddingTop: 12,
                    borderTop: "1px dashed color-mix(in oklab, var(--ink) 30%, transparent)",
                    color: "color-mix(in oklab, var(--ink) 70%, transparent)",
                  }}
                >
                  <b>{zine.useful_test}</b> {zine.useful_test_body}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "auto",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setDebunkOpen(false)}
                    className="zine-btn"
                    data-size="sm"
                    style={{
                      background: "transparent",
                      color: "var(--ink)",
                      border: "3px solid var(--ink)",
                      boxShadow: "4px 4px 0 var(--ink)",
                      fontFamily: "var(--font-display)",
                      fontSize: 14,
                      padding: "8px 14px 6px",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      minHeight: 44,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {zine.back_to_the_theory}
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    className="zine-btn"
                    data-size="md"
                    style={{
                      background: "var(--punch)",
                      color: "var(--ink)",
                      border: "3px solid var(--ink)",
                      boxShadow: "var(--shadow)",
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(18px, 1.8vw, 22px)",
                      padding: "11px 20px 9px",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      minHeight: 44,
                    }}
                  >
                    {move.key === "discredit" ? labels.see_full_theory : labels.next_move} →
                  </button>
                </div>
              </div>
            </article>
          </DebunkSlam>

          {/* Fallback CTA below the theory card — visible when the slam is
              closed, so a user who dismissed the debunk can still advance
              without re-opening it. */}
          {!debunkOpen && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 18,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <span
                className="marker"
                style={{
                  fontSize: 18,
                  color: "var(--cool)",
                  transform: "rotate(-1.5deg)",
                  display: "inline-block",
                }}
              >
                {labels.or_regenerate}
              </span>
              <button
                type="button"
                onClick={onNext}
                className="zine-btn"
                data-size="md"
                style={{
                  background: "var(--hot)",
                  color: "var(--paper)",
                  border: "3px solid var(--ink)",
                  boxShadow: "var(--shadow)",
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(18px, 1.8vw, 22px)",
                  padding: "11px 20px 9px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                {move.key === "discredit" ? labels.see_full_theory : labels.next_move} →
              </button>
            </div>
          )}
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

