// Tiny mount-only client component that restores classroom-mode body data attr on every page,
// so share buttons stay hidden across navigation while a session is active.
// Spec: openspec/changes/v2-rebuild/specs/teacher-mode/spec.md

"use client";

import { useEffect } from "react";

export function ClassroomMount() {
  useEffect(() => {
    try {
      const on = sessionStorage.getItem("cgen-classroom") === "1";
      document.body.dataset.classroom = on ? "1" : "0";
    } catch {
      // private mode etc — ignore
    }
  }, []);
  return null;
}
