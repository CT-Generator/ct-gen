import type { Config } from "tailwindcss";

// Conspiracy Generator — Wake Up Zine identity
// Tokens live as CSS custom properties in app/globals.css :root.
// This config exposes them as Tailwind utilities so `bg-hot`, `text-paper`,
// `border-ink` etc. compile.
//
// Dark mode is "inverted zine": ink background + paper text. The punch colors
// (hot, hot-2, punch, cool) remain unchanged across themes.

export default {
  // Keep "class" mode (rather than the v3 default "media") so the dead
  // dark: variants scattered through unrewritten components never activate.
  // We removed the .dark class toggle from the topbar entirely; this just
  // makes sure none of those classes get applied by accident based on the
  // visitor's OS theme.
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-2": "var(--paper-2)",
        ink: "var(--ink)",
        hot: "var(--hot)",
        "hot-2": "var(--hot-2)",
        punch: "var(--punch)",
        cool: "var(--cool)",
        // Backwards-compatibility aliases for the v2 editorial palette.
        // These map old token names onto zine tokens via CSS vars so existing
        // components keep compiling until they are rewritten. Dark variants
        // resolve through the same vars — :root.dark swaps paper↔ink.
        "paper-alt": "var(--paper-2)",
        "paper-dark": "var(--paper)",     // .dark inverts via globals.css
        "paper-alt-dark": "var(--paper-2)",
        "ink-dark": "var(--ink)",
        "ink-soft": "color-mix(in oklab, var(--ink) 65%, transparent)",
        "ink-soft-dark": "color-mix(in oklab, var(--ink) 65%, transparent)",
        rule: "var(--ink)",
        // Recipe-move accents now resolve into the zine four-color set.
        // The single-hex literals in tailwind.config can't reference CSS vars
        // inside nested keys easily — we use vars and accept that the move-*
        // colors no longer differ between -soft and base in CSS.
        move: {
          anomaly: "var(--hot)",
          "anomaly-soft": "var(--paper-2)",
          connection: "var(--cool)",
          "connection-soft": "var(--paper-2)",
          dismiss: "var(--ink)",
          "dismiss-soft": "var(--paper-2)",
          discredit: "var(--punch)",
          "discredit-soft": "var(--paper-2)",
        },
      },
      fontFamily: {
        display: ['var(--font-display)', '"Anton"', '"Helvetica Neue Condensed"', "Impact", "sans-serif"],
        body: ['var(--font-body)', '"Space Grotesk"', '"Inter"', "system-ui", "sans-serif"],
        hand: ['var(--font-hand)', '"Permanent Marker"', '"Caveat"', "cursive"],
        // Backwards-compat: existing components use `font-mono` for meta captions.
        // Zine has no mono face; map to body so callsites compile and read sensibly
        // until they're rewritten.
        mono: ['var(--font-body)', '"Space Grotesk"', "system-ui", "sans-serif"],
      },
      letterSpacing: {
        meta: "0.14em",
        "meta-tight": "0.1em",
        "meta-wide": "0.16em",
        scream: "0.005em",
      },
      boxShadow: {
        zine: "6px 6px 0 var(--ink)",
        "zine-lg": "8px 8px 0 var(--ink)",
        "zine-xl": "12px 12px 0 var(--ink)",
        "zine-hot": "8px 8px 0 var(--hot)",
        "zine-cool": "6px 6px 0 var(--cool)",
      },
      maxWidth: {
        stage: "1200px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
