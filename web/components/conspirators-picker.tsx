// Step 2 picker — culprit + motive, both with images. Submits to /api/start.

"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SeedItemWithImage } from "@/lib/seed";
import { YoloProgress } from "@/components/yolo-progress";

type Locale = "en" | "de" | "nl";

type Labels = {
  culprit: string;
  motive: string;
  refresh_choices: string;
  walkthrough_caption: string;
  cta_start: string;
  cta_starting: string;
  cta_starting_dots: string;
  cta_yolo: string;
  cta_yolo_starting: string;
  cta_yolo_starting_dots: string;
  err_too_long: string;
  err_couldnt_start: string;
  err_yolo_failed: string;
  /** Retry control rendered next to err_yolo_failed when the YOLO POST itself
   *  failed after /api/start already created the row. */
  yolo_retry: string;
};

type Props = {
  eventUuid: string;
  eventName: string;
  eventSummary: string;
  culprits: SeedItemWithImage[];
  motives: SeedItemWithImage[];
  refresh: number;
  locale: Locale;
  labels: Labels;
};

export function ConspiratorsPicker({
  eventUuid,
  eventName,
  eventSummary,
  culprits,
  motives,
  refresh,
  locale,
  labels,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [yoloPending, startYoloTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Set once /api/start has produced a row but the subsequent /api/build/[id]/yolo
  // POST has failed. Allows the retry control to re-POST yolo for the same row
  // instead of restarting the whole flow.
  const [retryableShortId, setRetryableShortId] = useState<string | null>(null);

  const [culprit, setCulprit] = useState<SeedItemWithImage | null>(culprits[0] ?? null);
  const [motive, setMotive] = useState<SeedItemWithImage | null>(motives[0] ?? null);

  const ready = culprit && motive;
  const prefix = locale === "en" ? "" : `/${locale}`;
  const buildPath = `${prefix}/build`;
  const genPath = `${prefix}/g`;
  const storyPath = `${prefix}/story/${eventUuid}`;
  const anyPending = pending || yoloPending;

  async function postStart(signal: AbortSignal): Promise<string> {
    const res = await fetch("/api/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        // Locale must travel in the body — middleware excludes /api/* so the
        // route handler can't read x-locale from request headers.
        locale,
        event: { uuid: eventUuid, name: eventName, summary: eventSummary },
        culprit: { uuid: culprit!.uuid, name: culprit!.name, summary: culprit!.summary },
        motive: { uuid: motive!.uuid, name: motive!.name, summary: motive!.summary },
      }),
    });
    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? `Couldn't start (${res.status})`);
    }
    const { shortId } = (await res.json()) as { shortId: string };
    return shortId;
  }

  async function start() {
    if (!ready || anyPending) return;
    setError(null);
    startTransition(async () => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 60_000);
        const shortId = await postStart(ctrl.signal);
        clearTimeout(t);
        router.push(`${buildPath}/${shortId}`);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setError(labels.err_too_long);
        } else {
          setError(err instanceof Error ? err.message : labels.err_couldnt_start);
        }
      }
    });
  }

  async function postYolo(shortId: string, signal: AbortSignal): Promise<void> {
    const res = await fetch(`/api/build/${shortId}/yolo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
    });
    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? `Yolo failed (${res.status})`);
    }
  }

  async function startYolo() {
    if (!ready || anyPending) return;
    setError(null);
    setRetryableShortId(null);
    startYoloTransition(async () => {
      const ctrl = new AbortController();
      // /api/start (~20s) then /api/build/[id]/yolo (~40s) — generous overall cap.
      const t = setTimeout(() => ctrl.abort(), 90_000);
      let shortId: string;
      try {
        shortId = await postStart(ctrl.signal);
      } catch (err) {
        clearTimeout(t);
        if (err instanceof Error && err.name === "AbortError") {
          setError(labels.err_too_long);
        } else {
          setError(err instanceof Error ? err.message : labels.err_couldnt_start);
        }
        return;
      }
      try {
        await postYolo(shortId, ctrl.signal);
        clearTimeout(t);
        router.push(`${genPath}/${shortId}`);
      } catch (err) {
        clearTimeout(t);
        // YOLO POST failed after /api/start succeeded — surface a retry that
        // reuses the existing shortId rather than restarting the whole flow.
        setRetryableShortId(shortId);
        if (err instanceof Error && err.name === "AbortError") {
          setError(labels.err_too_long);
        } else {
          setError(err instanceof Error ? err.message : labels.err_yolo_failed);
        }
      }
    });
  }

  function retryYolo() {
    if (!retryableShortId || anyPending) return;
    const shortId = retryableShortId;
    setError(null);
    startYoloTransition(async () => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 90_000);
      try {
        await postYolo(shortId, ctrl.signal);
        clearTimeout(t);
        setRetryableShortId(null);
        router.push(`${genPath}/${shortId}`);
      } catch (err) {
        clearTimeout(t);
        if (err instanceof Error && err.name === "AbortError") {
          setError(labels.err_too_long);
        } else {
          setError(err instanceof Error ? err.message : labels.err_yolo_failed);
        }
      }
    });
  }

  return (
    <>
      <div
        className="zine-pickers"
        style={{
          marginTop: 22,
          display: "grid",
          gap: 18,
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        {/* Culprit */}
        <fieldset
          style={{
            background: "var(--paper-2)",
            border: "2.5px solid var(--ink)",
            padding: "14px 16px 16px",
            boxShadow: "var(--shadow)",
          }}
        >
          <legend className="sr-only">{labels.culprit}</legend>
          <div className="label" style={{ color: "var(--hot-2)", marginBottom: 10 }}>
            {labels.culprit}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {culprits.map((c) => {
              const selected = culprit?.uuid === c.uuid;
              return (
                <button
                  key={c.uuid}
                  type="button"
                  onClick={() => setCulprit(c)}
                  aria-pressed={selected}
                  className="zine-pick"
                  data-selected={selected ? "1" : "0"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "7px 10px",
                    textAlign: "left",
                    border: "2px solid var(--ink)",
                    background: selected ? "var(--punch)" : "var(--paper)",
                    color: "var(--ink)",
                    fontFamily: "var(--font-display)",
                    fontSize: 17,
                    letterSpacing: "0.01em",
                    cursor: "pointer",
                    boxShadow: selected ? "4px 4px 0 var(--ink)" : "2px 2px 0 var(--ink)",
                    transition: "transform var(--t-fast), box-shadow var(--t-fast), background var(--t-fast)",
                  }}
                >
                  {c.imageUrl && (
                    <Image
                      src={c.imageUrl}
                      width={36}
                      height={36}
                      alt=""
                      className="block flex-shrink-0 object-cover"
                      style={{ width: 36, height: 36, border: "2px solid var(--ink)" }}
                      unoptimized
                    />
                  )}
                  <span style={{ lineHeight: 1.1 }}>{c.name}</span>
                </button>
              );
            })}
          </div>
          {culprit?.summary && (
            <p
              style={{
                marginTop: 12,
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                lineHeight: 1.4,
                color: "var(--ink)",
                opacity: 0.72,
              }}
            >
              {culprit.summary}
            </p>
          )}
        </fieldset>

        {/* Motive */}
        <fieldset
          style={{
            background: "var(--paper-2)",
            border: "2.5px solid var(--ink)",
            padding: "14px 16px 16px",
            boxShadow: "var(--shadow)",
          }}
        >
          <legend className="sr-only">{labels.motive}</legend>
          <div className="label" style={{ color: "var(--hot-2)", marginBottom: 10 }}>
            {labels.motive}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {motives.map((m) => {
              const selected = motive?.uuid === m.uuid;
              return (
                <button
                  key={m.uuid}
                  type="button"
                  onClick={() => setMotive(m)}
                  aria-pressed={selected}
                  className="zine-pick"
                  data-selected={selected ? "1" : "0"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "7px 10px",
                    textAlign: "left",
                    border: "2px solid var(--ink)",
                    background: selected ? "var(--punch)" : "var(--paper)",
                    color: "var(--ink)",
                    fontFamily: "var(--font-display)",
                    fontSize: 17,
                    letterSpacing: "0.01em",
                    cursor: "pointer",
                    boxShadow: selected ? "4px 4px 0 var(--ink)" : "2px 2px 0 var(--ink)",
                    transition: "transform var(--t-fast), box-shadow var(--t-fast), background var(--t-fast)",
                  }}
                >
                  {m.imageUrl && (
                    <Image
                      src={m.imageUrl}
                      width={36}
                      height={36}
                      alt=""
                      className="block flex-shrink-0 object-cover"
                      style={{ width: 36, height: 36, border: "2px solid var(--ink)" }}
                      unoptimized
                    />
                  )}
                  <span style={{ lineHeight: 1.1 }}>{m.name}</span>
                </button>
              );
            })}
          </div>
          {motive?.summary && (
            <p
              style={{
                marginTop: 12,
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                lineHeight: 1.4,
                color: "var(--ink)",
                opacity: 0.72,
              }}
            >
              {motive.summary}
            </p>
          )}
        </fieldset>
      </div>

      {/* Refresh link */}
      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
        <Link
          href={`${storyPath}?r=${refresh + 1}`}
          className="label"
          style={{ color: "var(--cool)", textDecoration: "none" }}
        >
          ↻ {labels.refresh_choices}
        </Link>
      </div>

      {/* CTA block */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 18,
          borderTop: "2.5px solid var(--ink)",
        }}
      >
        {error && (
          <div
            role="alert"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
              padding: "10px 14px",
              background: "var(--hot)",
              color: "var(--paper)",
              border: "2px solid var(--ink)",
              boxShadow: "3px 3px 0 var(--ink)",
            }}
          >
            <span className="label" style={{ color: "var(--paper)" }}>{error}</span>
            {retryableShortId && !yoloPending && (
              <button
                type="button"
                onClick={retryYolo}
                style={{
                  background: "var(--ink)",
                  color: "var(--paper)",
                  border: "2px solid var(--paper)",
                  padding: "4px 10px",
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {labels.yolo_retry}
              </button>
            )}
          </div>
        )}

        {pending && <Starting label={labels.cta_starting_dots} />}
        {yoloPending && (
          <div style={{ marginBottom: 12 }}>
            <YoloProgress label={labels.cta_yolo_starting_dots} />
          </div>
        )}

        <p
          className="marker"
          style={{
            fontSize: 18,
            color: "var(--cool)",
            transform: "rotate(-1deg)",
            display: "inline-block",
            marginBottom: 16,
            maxWidth: "32rem",
            lineHeight: 1.2,
          }}
        >
          {labels.walkthrough_caption}
        </p>

        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            alignItems: "stretch",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={start}
            disabled={!ready || anyPending}
            className="zine-btn"
            data-size="md"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(18px, 1.8vw, 22px)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              padding: "11px 20px 9px",
              background: "var(--hot)",
              color: "var(--paper)",
              border: "3px solid var(--ink)",
              boxShadow: "var(--shadow)",
              cursor: "pointer",
              minHeight: 44,
              opacity: !ready || anyPending ? 0.5 : 1,
              transition: "transform var(--t-fast), box-shadow var(--t-fast)",
              whiteSpace: "nowrap",
            }}
          >
            ▸ {pending ? labels.cta_starting : labels.cta_start}
          </button>
          <button
            type="button"
            onClick={startYolo}
            disabled={!ready || anyPending}
            className="zine-btn"
            data-size="sm"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 14,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              padding: "8px 14px 6px",
              background: "transparent",
              color: "var(--ink)",
              border: "3px solid var(--ink)",
              boxShadow: "4px 4px 0 var(--ink)",
              cursor: "pointer",
              minHeight: 44,
              opacity: !ready || anyPending ? 0.5 : 1,
              transition: "transform var(--t-fast), box-shadow var(--t-fast)",
              whiteSpace: "nowrap",
            }}
          >
            ⚡ {yoloPending ? labels.cta_yolo_starting : labels.cta_yolo}
          </button>
        </div>
      </div>
    </>
  );
}

function Starting({ label }: { label: string }) {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <p
      className="label"
      style={{ marginBottom: 10, color: "var(--cool)" }}
    >
      {label}{".".repeat(dots)}
    </p>
  );
}
