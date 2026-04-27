// Classroom session toggle. Per-browser-session flag (sessionStorage).
// Spec: openspec/changes/v2-rebuild/specs/teacher-mode/spec.md (Classroom session mode)

"use client";

import { useEffect, useState } from "react";

const KEY = "cgen-classroom";

export function ClassroomToggle() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(sessionStorage.getItem(KEY) === "1");
  }, []);

  function toggle() {
    if (active) {
      sessionStorage.removeItem(KEY);
      document.body.dataset.classroom = "0";
      setActive(false);
    } else {
      sessionStorage.setItem(KEY, "1");
      document.body.dataset.classroom = "1";
      setActive(true);
    }
  }

  return (
    <div className="mt-4 flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={active}
        className="border-2 border-ink dark:border-ink-dark px-4 py-2 font-display hover:bg-ink hover:text-paper dark:hover:bg-ink-dark dark:hover:text-paper-dark transition-colors"
        style={{ fontSize: 14, fontWeight: 600 }}
      >
        {active ? "End classroom session" : "Start classroom session"}
      </button>
      {active && (
        <span className="meta" style={{ color: "oklch(56% 0.14 130)" }}>
          Active — share buttons hidden
        </span>
      )}
    </div>
  );
}
