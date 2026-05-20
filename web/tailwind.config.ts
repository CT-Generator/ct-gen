import type { Config } from "tailwindcss";

// Conspiracy Generator — Wake Up Zine identity
// Tokens live as CSS custom properties in app/globals.css :root.
// This config exposes them as Tailwind utilities so `bg-hot`, `text-paper`,
// `border-ink` etc. compile.
//
// Dark mode is "inverted zine": ink background + paper text. The punch colors
// (hot, hot-2, punch, cool) remain unchanged across themes.

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
        paper: "var(--paper)",
        "paper-2": "var(--paper-2)",
        ink: "var(--ink)",
        hot: "var(--hot)",
        "hot-2": "var(--hot-2)",
        punch: "var(--punch)",
        cool: "var(--cool)",
      },
      fontFamily: {
        display: ['var(--font-display)', '"Anton"', '"Helvetica Neue Condensed"', "Impact", "sans-serif"],
        body: ['var(--font-body)', '"Space Grotesk"', '"Inter"', "system-ui", "sans-serif"],
        hand: ['var(--font-hand)', '"Permanent Marker"', '"Caveat"', "cursive"],
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
