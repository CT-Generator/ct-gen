// Rating bar — five squares; click locks the score for this session.
// Spec: openspec/changes/v2-rebuild/specs/data-platform/spec.md (ratings table)

"use client";

import { useState } from "react";
import { MOVES } from "@/lib/recipe";

export function RatingBar({ shortId }: { shortId: string }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [locked, setLocked] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick(score: number) {
    if (busy) return;
    setBusy(true);
    setLocked(score);
    try {
      await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortId, score }),
      });
    } catch {
      // network glitch — leave the optimistic UI; server will reconcile on next visit
    } finally {
      setBusy(false);
    }
  }

  const showAt = locked ?? hovered ?? 0;

  return (
    <div className="flex items-center gap-3" data-share-area>
      <span className="meta">Rate</span>
      <div
        className="flex gap-1.5"
        onMouseLeave={() => setHovered(null)}
        role="radiogroup"
        aria-label="Rate this theory"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onClick={() => pick(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            aria-checked={locked === n}
            role="radio"
            className="w-6 h-6 border transition-colors"
            style={{
              borderColor: n <= showAt ? MOVES[3].color : "currentColor",
              background: n <= showAt ? MOVES[3].color : "transparent",
              opacity: locked === null ? 0.85 : 1,
            }}
          />
        ))}
      </div>
      {locked !== null && (
        <span className="meta" style={{ color: MOVES[3].color }}>
          Saved
        </span>
      )}
    </div>
  );
}
