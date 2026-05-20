"use client";

// DebunkSlam — overlay that drops in with rotation overshoot (slam keyframe)
// and snatches back up on close. ESC closes, body scroll locks while open.
// Spec: zine-design-system / Requirement: DebunkSlam primitive.

import { useEffect, useState, type ReactNode } from "react";

export function DebunkSlam({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") triggerClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function triggerClose() {
    setLeaving(true);
    setTimeout(() => {
      setLeaving(false);
      onClose();
    }, 240);
  }

  if (!open) return null;

  return (
    <div className={`debunk-overlay ${leaving ? "is-leaving" : ""}`}>
      {/* The overlay positions itself absolute inset:0. Children are the
          card; consumers compose the inner article + header etc. */}
      {typeof children === "function"
        ? // allow consumers to call a render-prop with the close trigger
          (children as unknown as (close: () => void) => ReactNode)(triggerClose)
        : children}
    </div>
  );
}
