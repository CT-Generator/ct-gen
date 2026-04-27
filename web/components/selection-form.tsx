// Selection form — interactive client component for picking event/culprit/motive.
// Mobile: stacks 1-column. Tablet+: progressively wider grids.
// Source: design system, component-sheets.jsx → HomeSheet (picker)

"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { SeedItemWithImage } from "@/lib/seed";

type Props = {
  events: SeedItemWithImage[];
  culprits: SeedItemWithImage[];
  motives: SeedItemWithImage[];
  /** When present, pre-fill the form with these values as custom inputs (Remix flow). */
  remix?: {
    from: string;
    event: string;
    culprit: string;
    motive: string;
  };
};

type Picked = {
  uuid: string;
  name: string;
  summary: string;
  source: "curated" | "custom";
};

export function SelectionForm({ events, culprits, motives, remix }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [event, setEvent] = useState<Picked | null>(
    remix
      ? matchOrCustom(events, remix.event)
      : toPicked(events[0]),
  );
  const [culprit, setCulprit] = useState<Picked | null>(
    remix
      ? matchOrCustom(culprits, remix.culprit)
      : toPicked(culprits[0]),
  );
  const [motive, setMotive] = useState<Picked | null>(
    remix
      ? matchOrCustom(motives, remix.motive)
      : toPicked(motives[1] ?? motives[0]),
  );

  const ready = event && culprit && motive;

  async function generate() {
    if (!ready || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        // Long timeout — gpt-5 with structured outputs can take 60–90s.
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 180_000);
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ctrl.signal,
          body: JSON.stringify({
            event: { value: event!.name, source: event!.source },
            culprit: { value: culprit!.name, source: culprit!.source },
            motive: { value: motive!.name, source: motive!.source },
          }),
        });
        clearTimeout(t);
        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? `Generation failed (${res.status})`);
        }
        const { shortId } = (await res.json()) as { shortId: string };
        router.push(`/g/${shortId}`);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setError("That took longer than 3 minutes — try again or pick a different triple.");
        } else {
          setError(err instanceof Error ? err.message : "Generation failed.");
        }
      }
    });
  }

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
            {events.map((e, i) => {
              const selected = event?.uuid === e.uuid && event?.source === "curated";
              return (
                <label
                  key={e.uuid}
                  className={[
                    "flex items-start gap-2.5 py-2 text-[13.5px] leading-snug cursor-pointer",
                    i ? "border-t border-ink/10 dark:border-ink-dark/10" : "",
                    selected
                      ? "text-ink dark:text-ink-dark font-medium"
                      : "text-ink-soft dark:text-ink-soft-dark",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="event"
                    checked={selected}
                    onChange={() => setEvent(toPicked(e))}
                    className="mt-1.5 accent-ink"
                  />
                  <span>{e.name}</span>
                </label>
              );
            })}
          </div>
          <CustomInput
            label="Use my own headline"
            placeholder="Paste a recent news headline"
            onAccepted={(value) =>
              setEvent({ uuid: `custom-${cryptoRandomId()}`, name: value, summary: value, source: "custom" })
            }
          />
        </fieldset>

        {/* Culprit card */}
        <fieldset className="bg-paper-alt dark:bg-paper-alt-dark border border-ink/15 dark:border-ink-dark/15 p-4 sm:p-5">
          <legend className="sr-only">Culprit</legend>
          <div className="meta mb-3.5">Culprit</div>
          <div className="flex flex-col gap-2.5">
            {culprits.map((c) => {
              const selected = culprit?.uuid === c.uuid && culprit?.source === "curated";
              return (
                <button
                  key={c.uuid}
                  type="button"
                  onClick={() => setCulprit(toPicked(c))}
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
                    className="block h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 object-cover border border-ink/15 dark:border-ink-dark/15"
                    unoptimized
                  />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
          <CustomInput
            label="Type your own"
            placeholder="A power structure or institution"
            onAccepted={(value) =>
              setCulprit({ uuid: `custom-${cryptoRandomId()}`, name: value, summary: value, source: "custom" })
            }
          />
        </fieldset>

        {/* Motive card */}
        <fieldset className="bg-paper-alt dark:bg-paper-alt-dark border border-ink/15 dark:border-ink-dark/15 p-4 sm:p-5 md:col-span-2 lg:col-span-1">
          <legend className="sr-only">Motive</legend>
          <div className="meta mb-3.5">Motive</div>
          <div className="flex flex-col gap-2">
            {motives.map((m) => {
              const selected = motive?.uuid === m.uuid && motive?.source === "curated";
              return (
                <button
                  key={m.uuid}
                  type="button"
                  onClick={() => setMotive(toPicked(m))}
                  aria-pressed={selected}
                  className={[
                    "px-3 py-2.5 text-left text-[14px] leading-snug",
                    "border transition-colors",
                    selected
                      ? "border-ink dark:border-ink-dark bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark"
                      : "border-ink/20 dark:border-ink-dark/20 text-ink-soft dark:text-ink-soft-dark hover:border-ink/40 dark:hover:border-ink-dark/40",
                  ].join(" ")}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
          <CustomInput
            label="Type your own"
            placeholder="What the conspirators want"
            onAccepted={(value) =>
              setMotive({ uuid: `custom-${cryptoRandomId()}`, name: value, summary: value, source: "custom" })
            }
          />
        </fieldset>
      </div>

      {/* Pre-generation summary */}
      <div className="mt-7 sm:mt-8 rule-h pt-5 sm:pt-6">
        <p className="meta mb-2">Ready to cook</p>
        <ul className="space-y-1 text-[14px]">
          <SummaryRow label="Event" picked={event} />
          <SummaryRow label="Culprit" picked={culprit} />
          <SummaryRow label="Motive" picked={motive} />
        </ul>

        {error && (
          <p className="mt-3 text-[13px] text-[oklch(56%_0.14_28)]" role="alert">
            {error}
          </p>
        )}

        {pending && <CookingProgress />}

        <div className="mt-5 sm:mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] italic text-ink-soft dark:text-ink-soft-dark max-w-xl leading-relaxed">
            {pending
              ? "Generation takes about a minute — gpt-5 reasons through the four moves and then writes a debunking pass."
              : "Generation takes about a minute. Each of the four moves is written separately, with a debunking column running alongside."}
          </p>
          <button
            type="button"
            onClick={generate}
            disabled={!ready || pending}
            className="self-stretch sm:self-auto bg-ink text-paper dark:bg-ink-dark dark:text-paper-dark px-5 py-3 sm:px-6 sm:py-3.5 font-display inline-flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
            style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}
          >
            {pending ? "Cooking…" : "Cook the theory"}
            <span className="font-mono opacity-70" style={{ fontSize: 11 }}>
              →
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * "Cooking" progress UI. Cycles through the four-move steps so the user gets
 * a sense of progress during the ~60s the model takes. Purely cosmetic — the
 * actual generation is a single non-streaming POST.
 */
function CookingProgress() {
  const steps = [
    { color: "oklch(56% 0.14 28)", title: "Hunting anomalies" },
    { color: "oklch(56% 0.14 130)", title: "Fabricating connections" },
    { color: "oklch(56% 0.14 230)", title: "Dismissing counter-evidence" },
    { color: "oklch(56% 0.14 70)", title: "Discrediting critics" },
    { color: "var(--tw-color-ink, #1B1A1F)", title: "Writing the debunk" },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= steps.length - 1) return;
    const t = setTimeout(() => setI((x) => x + 1), 14_000);
    return () => clearTimeout(t);
  }, [i, steps.length]);

  return (
    <div className="mt-4 border border-ink/15 dark:border-ink-dark/15 p-4 sm:p-5 bg-paper-alt dark:bg-paper-alt-dark">
      <p className="meta">Cooking</p>
      <ol className="mt-3 space-y-2 text-[14px]">
        {steps.map((s, idx) => {
          const state = idx < i ? "done" : idx === i ? "active" : "pending";
          return (
            <li key={s.title} className="flex items-center gap-3">
              <span
                aria-hidden
                className="inline-block h-2 w-8 transition-opacity"
                style={{
                  background: s.color,
                  opacity: state === "pending" ? 0.2 : 1,
                }}
              />
              <span
                style={{
                  color: state === "active" ? s.color : undefined,
                  fontWeight: state === "active" ? 600 : 400,
                  opacity: state === "pending" ? 0.5 : 1,
                }}
              >
                {state === "active" ? `${s.title}…` : s.title}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SummaryRow({ label, picked }: { label: string; picked: Picked | null }) {
  if (!picked) {
    return (
      <li className="flex items-baseline gap-3 text-ink-soft dark:text-ink-soft-dark italic">
        <span className="meta w-20">{label}</span>
        <span>none yet</span>
      </li>
    );
  }
  return (
    <li className="flex items-baseline gap-3">
      <span className="meta w-20">{label}</span>
      <span className="font-medium">{picked.name}</span>
      <span
        className="font-mono uppercase text-[10px] tracking-meta-tight px-1.5 py-0.5 border"
        style={{
          color: picked.source === "custom" ? "oklch(56% 0.14 28)" : "var(--tw-color-ink-soft, #54515C)",
          borderColor: picked.source === "custom" ? "oklch(56% 0.14 28)" : "currentColor",
          opacity: picked.source === "custom" ? 1 : 0.5,
        }}
      >
        {picked.source}
      </span>
    </li>
  );
}

function CustomInput({
  label,
  placeholder,
  onAccepted,
}: {
  label: string;
  placeholder: string;
  onAccepted: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [reject, setReject] = useState<string | null>(null);

  async function submit() {
    const v = value.trim();
    if (!v) return;
    setBusy(true);
    setReject(null);
    try {
      const res = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: v }),
      });
      const data = (await res.json()) as { ok: boolean; reason?: string };
      if (!data.ok) {
        setReject(data.reason ?? "This input would push the recipe somewhere it shouldn't go. Try a power structure or institution instead.");
        return;
      }
      onAccepted(v);
      setOpen(false);
      setValue("");
    } catch {
      setReject("Could not verify the input — try again, or pick from the list.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 font-mono uppercase border border-dashed border-ink/35 dark:border-ink-dark/35 px-2.5 py-1.5 text-ink-soft dark:text-ink-soft-dark hover:text-ink dark:hover:text-ink-dark hover:border-ink/60 dark:hover:border-ink-dark/60 transition-colors"
        style={{ fontSize: 10, letterSpacing: "0.14em" }}
      >
        + {label}
      </button>
    );
  }

  return (
    <div className="mt-3 border border-ink/30 dark:border-ink-dark/30 p-3 bg-paper dark:bg-paper-dark">
      <input
        type="text"
        autoFocus
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") setOpen(false);
        }}
        className="w-full bg-transparent outline-none border-b border-ink/30 dark:border-ink-dark/30 pb-1 text-[14px] text-ink dark:text-ink-dark"
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy || !value.trim()}
          className="font-mono uppercase bg-ink text-paper dark:bg-ink-dark dark:text-paper-dark px-2.5 py-1 disabled:opacity-50"
          style={{ fontSize: 10, letterSpacing: "0.14em" }}
        >
          {busy ? "Checking…" : "Use this"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setValue("");
            setReject(null);
          }}
          className="font-mono uppercase text-ink-soft dark:text-ink-soft-dark hover:text-ink dark:hover:text-ink-dark px-2.5 py-1"
          style={{ fontSize: 10, letterSpacing: "0.14em" }}
        >
          Cancel
        </button>
      </div>
      {reject && (
        <div
          className="mt-3 text-[12.5px] leading-snug border-l-2 pl-3 py-1"
          style={{ borderColor: "oklch(56% 0.14 28)" }}
        >
          {reject}{" "}
          <a
            href="mailto:hello@conspiracy-generator.duckdns.org?subject=Conspiracy%20Generator%20%E2%80%94%20input%20review"
            className="underline-offset-2 underline"
          >
            request review
          </a>
        </div>
      )}
    </div>
  );
}

function toPicked(item: SeedItemWithImage | undefined): Picked | null {
  if (!item) return null;
  return { uuid: item.uuid, name: item.name, summary: item.summary, source: "curated" };
}

/** If `value` matches a curated item by name, return that. Otherwise treat it as a custom value. */
function matchOrCustom(items: SeedItemWithImage[], value: string): Picked {
  const match = items.find((i) => i.name === value);
  if (match) return { uuid: match.uuid, name: match.name, summary: match.summary, source: "curated" };
  return { uuid: `custom-${cryptoRandomId()}`, name: value, summary: value, source: "custom" };
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}
