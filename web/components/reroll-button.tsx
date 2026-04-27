// Per-section re-roll button. Calls /api/reroll, navigates to the resulting child permalink.
// Spec: openspec/changes/v2-rebuild/specs/theory-generation/spec.md (Re-roll a single move)

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Section = "anomalies" | "connect_dots" | "dismiss_counter" | "discredit_critics";

export function RerollButton({
  parentShortId,
  section,
  accentColor,
}: {
  parentShortId: string;
  section: Section;
  accentColor: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function reroll() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/reroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parentShortId, section }),
        });
        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? `Re-roll failed (${res.status})`);
        }
        const { shortId } = (await res.json()) as { shortId: string };
        router.push(`/g/${shortId}?from=${parentShortId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Re-roll failed.");
      }
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={reroll}
        disabled={pending}
        title={`Re-roll just this move`}
        className="font-mono uppercase border px-2 py-1 disabled:opacity-50 hover:opacity-80 transition-opacity"
        style={{
          fontSize: 9,
          letterSpacing: "0.14em",
          color: accentColor,
          borderColor: accentColor,
        }}
      >
        {pending ? "Cooking…" : "↻ Re-roll"}
      </button>
      {error && (
        <span className="meta" style={{ color: "oklch(56% 0.14 28)" }}>
          {error}
        </span>
      )}
    </span>
  );
}
