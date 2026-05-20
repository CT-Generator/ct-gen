// TheoryText — renders an array of segments (string | { mark: string }).
// Plain strings render as-is; { mark } objects wrap in <MarkUnderline>.
// Spec: conspiracy-output / Requirement: MarkUnderline applied to slot-filled
// phrases in move text.

import { Fragment } from "react";
import { MarkUnderline } from "./mark-underline";

export type TheorySegment = string | { mark: string };

export function TheoryText({
  parts,
  big = false,
}: {
  parts: TheorySegment[];
  big?: boolean;
}) {
  return (
    <span
      style={{
        fontFamily: "var(--font-body)",
        fontWeight: 500,
        fontSize: big ? "var(--t-body-lg)" : "inherit",
        lineHeight: 1.5,
      }}
    >
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <Fragment key={i}>{p}</Fragment>
        ) : (
          <MarkUnderline key={i}>{p.mark}</MarkUnderline>
        )
      )}
    </span>
  );
}
