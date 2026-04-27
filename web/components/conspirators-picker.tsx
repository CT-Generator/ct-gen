// Step 2 picker — culprit + motive, both with images. Submits to /api/start.

"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SeedItemWithImage } from "@/lib/seed";

type Props = {
  eventUuid: string;
  eventName: string;
  eventSummary: string;
  culprits: SeedItemWithImage[];
  motives: SeedItemWithImage[];
  refresh: number;
};

export function ConspiratorsPicker({
  eventUuid,
  eventName,
  eventSummary,
  culprits,
  motives,
  refresh,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [culprit, setCulprit] = useState<SeedItemWithImage | null>(culprits[0] ?? null);
  const [motive, setMotive] = useState<SeedItemWithImage | null>(motives[0] ?? null);

  const ready = culprit && motive;

  async function start() {
    if (!ready || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 60_000);
        const res = await fetch("/api/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ctrl.signal,
          body: JSON.stringify({
            event: { uuid: eventUuid, name: eventName, summary: eventSummary },
            culprit: { uuid: culprit!.uuid, name: culprit!.name, summary: culprit!.summary },
            motive: { uuid: motive!.uuid, name: motive!.name, summary: motive!.summary },
          }),
        });
        clearTimeout(t);
        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? `Couldn't start (${res.status})`);
        }
        const { shortId } = (await res.json()) as { shortId: string };
        router.push(`/build/${shortId}`);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setError("That took too long — try again.");
        } else {
          setError(err instanceof Error ? err.message : "Couldn't start the build.");
        }
      }
    });
  }

  return (
    <>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
        {/* Culprit */}
        <fieldset className="bg-paper-alt dark:bg-paper-alt-dark border border-ink/15 dark:border-ink-dark/15 p-4 sm:p-5">
          <legend className="sr-only">Culprit</legend>
          <div className="meta mb-3.5">Culprit</div>
          <div className="flex flex-col gap-2.5">
            {culprits.map((c) => {
              const selected = culprit?.uuid === c.uuid;
              return (
                <button
                  key={c.uuid}
                  type="button"
                  onClick={() => setCulprit(c)}
                  aria-pressed={selected}
                  className={[
                    "flex items-center gap-2.5 px-3 py-2.5 text-left",
                    "font-display text-[15px] sm:text-[16px] leading-tight",
                    "border transition-colors",
                    selected
                      ? "border-ink dark:border-ink-dark bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark"
                      : "border-ink/20 dark:border-ink-dark/20 text-ink-soft dark:text-ink-soft-dark hover:border-ink/40 dark:hover:border-ink-dark/40",
                  ].join(" ")}
                  style={{ fontWeight: 600 }}
                >
                  <Image
                    src={c.imageUrl}
                    width={36}
                    height={36}
                    alt=""
                    className="block h-9 w-9 flex-shrink-0 object-cover border border-ink/15 dark:border-ink-dark/15"
                    unoptimized
                  />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Motive */}
        <fieldset className="bg-paper-alt dark:bg-paper-alt-dark border border-ink/15 dark:border-ink-dark/15 p-4 sm:p-5">
          <legend className="sr-only">Motive</legend>
          <div className="meta mb-3.5">Motive</div>
          <div className="flex flex-col gap-2.5">
            {motives.map((m) => {
              const selected = motive?.uuid === m.uuid;
              return (
                <button
                  key={m.uuid}
                  type="button"
                  onClick={() => setMotive(m)}
                  aria-pressed={selected}
                  className={[
                    "flex items-center gap-2.5 px-3 py-2.5 text-left",
                    "font-display text-[15px] sm:text-[16px] leading-tight",
                    "border transition-colors",
                    selected
                      ? "border-ink dark:border-ink-dark bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark"
                      : "border-ink/20 dark:border-ink-dark/20 text-ink-soft dark:text-ink-soft-dark hover:border-ink/40 dark:hover:border-ink-dark/40",
                  ].join(" ")}
                  style={{ fontWeight: 600 }}
                >
                  <Image
                    src={m.imageUrl}
                    width={36}
                    height={36}
                    alt=""
                    className="block h-9 w-9 flex-shrink-0 object-cover border border-ink/15 dark:border-ink-dark/15"
                    unoptimized
                  />
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* Refresh + CTA */}
      <div className="mt-6 flex items-center justify-end">
        <Link
          href={`/story/${eventUuid}?r=${refresh + 1}`}
          className="meta hover:text-ink dark:hover:text-ink-dark transition-colors"
        >
          ↻ Refresh choices
        </Link>
      </div>

      <div className="mt-7 sm:mt-8 rule-h pt-5 sm:pt-6">
        {error && (
          <p className="mb-3 text-[13px] text-[oklch(56%_0.14_28)]" role="alert">
            {error}
          </p>
        )}

        {pending && <Starting />}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] italic text-ink-soft dark:text-ink-soft-dark max-w-xl leading-relaxed">
            You'll walk through the four moves on separate screens, with a debunk on every step.
          </p>
          <button
            type="button"
            onClick={start}
            disabled={!ready || pending}
            className="self-stretch sm:self-auto bg-ink text-paper dark:bg-ink-dark dark:text-paper-dark px-5 py-3 sm:px-6 sm:py-3.5 font-display inline-flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
            style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}
          >
            {pending ? "Setting up…" : "Start building"}
            <span className="font-mono opacity-70" style={{ fontSize: 11 }}>
              →
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

function Starting() {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <p className="mb-3 text-[13px] text-ink-soft dark:text-ink-soft-dark">
      Brainstorming ideas{".".repeat(dots)}
    </p>
  );
}
