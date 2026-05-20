// MarkUnderline — wraps inline text in a span that draws a wobbly red
// per-line underline via the .marked background-image trick.
// Spec: zine-design-system / Requirement: MarkUnderline primitive.

import type { ReactNode } from "react";

export function MarkUnderline({ children }: { children: ReactNode }) {
  return <span className="marked">{children}</span>;
}
