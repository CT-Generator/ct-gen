import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const body = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Conspiracy Generator — the recipe, written out",
    template: "%s · Conspiracy Generator",
  },
  description:
    "An educational tool that builds a fake conspiracy theory in front of you, labeling each of the four moves as it happens, with a debunking column running alongside. Watch the recipe so you can spot it in the wild.",
  authors: [
    { name: "Maarten Boudry", url: "https://research.flw.ugent.be/en/maarten.boudry" },
    { name: "Marco Meyer", url: "https://www.philosophie.uni-hamburg.de/philosophisches-seminar/personen/meyer-marco.html" },
  ],
  openGraph: {
    type: "website",
    siteName: "Conspiracy Generator",
    title: "Conspiracy Generator — the recipe, written out",
    description:
      "Every conspiracy theory follows the same four moves. Once you can name them, you can spot them.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Conspiracy Generator",
    description: "Every conspiracy theory follows the same four moves.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F2EA" },
    { media: "(prefers-color-scheme: dark)", color: "#141622" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
