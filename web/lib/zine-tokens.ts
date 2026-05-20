// Wake Up Zine — design tokens as TypeScript constants.
// Mirror of the CSS custom properties in app/globals.css :root.
// Use these from React components when inline `style={{}}` is needed
// (Tailwind utilities cover most cases; reach for these only when you can't).
// Source: openspec/specs/zine-design-system/spec.md

export const ZINE = {
  color: {
    paper: "var(--paper)",
    paper2: "var(--paper-2)",
    ink: "var(--ink)",
    hot: "var(--hot)",
    hot2: "var(--hot-2)",
    punch: "var(--punch)",
    cool: "var(--cool)",
  },
  font: {
    display: "var(--font-display)",
    body: "var(--font-body)",
    hand: "var(--font-hand)",
  },
  type: {
    screamXL: "var(--t-scream-xl)",
    screamLG: "var(--t-scream-lg)",
    screamMD: "var(--t-scream-md)",
    screamSM: "var(--t-scream-sm)",
    screamXS: "var(--t-scream-xs)",
    bodyLG: "var(--t-body-lg)",
    body: "var(--t-body)",
    bodySM: "var(--t-body-sm)",
    label: "var(--t-label)",
  },
  geom: {
    rule: "var(--rule)",
    ruleBold: "var(--rule-bold)",
    shadow: "var(--shadow)",
    shadowLG: "var(--shadow-lg)",
    shadowXL: "var(--shadow-xl)",
  },
  motion: {
    fast: "var(--t-fast)",
    base: "var(--t-base)",
    slow: "var(--t-slow)",
    ease: "var(--ease)",
  },
} as const;

// Fixed tilt + hover-note arrays used by pulpcard grids.
// Spec: selection-flow (Curated seed set — randomly assigned tilt from a fixed set).
export const TILTS = [-1.4, 0.6, -0.6, 1.2, -1.0, 0.8] as const;
export const HOVER_NOTE_KEYS = [
  "proof_q",
  "wait",
  "coincidence_q",
  "suspicious",
  "connected",
  "gotcha",
] as const;
export type HoverNoteKey = (typeof HOVER_NOTE_KEYS)[number];
