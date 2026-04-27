import type { Config } from "tailwindcss";

// Conspiracy Generator — v2 brand tokens
// Design system: "Explainer" variant (Vox-meets-XKCD: Fraunces display + Inter Tight body)
// Source: /tmp/design-extract/conspiracy-generator/project/system.jsx

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light · newsprint cream
        paper: "#F6F2EA",
        "paper-alt": "#EDE7DA",
        ink: "#1B1A1F",
        "ink-soft": "#54515C",
        rule: "#1B1A1F",
        // Dark · late-night ink
        "paper-dark": "#141622",
        "paper-alt-dark": "#1B1E2D",
        "ink-dark": "#EDE7D8",
        "ink-soft-dark": "#9C9684",
        // Recipe-move accents (equal chroma + lightness, hue rotated)
        // Brick / moss / ink-blue / ochre — pedagogy, not tribal coding
        move: {
          anomaly: "oklch(56% 0.14 28)", // 01 — muted brick
          "anomaly-soft": "oklch(92% 0.04 28)",
          connection: "oklch(56% 0.14 130)", // 02 — moss
          "connection-soft": "oklch(92% 0.04 130)",
          dismiss: "oklch(56% 0.14 230)", // 03 — ink-blue
          "dismiss-soft": "oklch(92% 0.04 230)",
          discredit: "oklch(56% 0.14 70)", // 04 — ochre
          "discredit-soft": "oklch(92% 0.04 70)",
        },
      },
      fontFamily: {
        // Display: Fraunces (Vox/explainer feel; not the heavier Playfair of "editorial")
        display: ['var(--font-display)', '"Fraunces"', '"Lora"', "Georgia", "serif"],
        body: ['var(--font-body)', '"Inter Tight"', '"Inter"', "system-ui", "sans-serif"],
        mono: ['var(--font-mono)', '"JetBrains Mono"', "ui-monospace", "Menlo", "monospace"],
      },
      letterSpacing: {
        meta: "0.14em",
        "meta-tight": "0.1em",
        "meta-wide": "0.16em",
      },
      maxWidth: {
        "prose-theory": "62ch",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
