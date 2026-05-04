import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import { ClassroomMount } from "@/components/classroom-mount";
import { readSessionHash } from "@/lib/session";
import { recordPageView } from "@/lib/tracking";
import { readLocale, getDict, type Locale } from "@/lib/i18n";
import "./globals.css";

// OG locale codes per supported locale. A `Record<Locale, string>` so that
// adding a new locale is a typecheck failure until covered here too.
const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  de: "de_DE",
  nl: "nl_NL",
};

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

// Metadata is generated per-request below so titles + descriptions match the active locale.
// Static fallback values stay in the en dictionary (web/lib/i18n/en.ts → meta).
export async function generateMetadata(): Promise<Metadata> {
  const locale = await readLocale();
  const m = getDict(locale).meta;
  return {
    title: { default: m.home_title_default, template: m.home_title_template },
    description: m.home_description,
    authors: [
      { name: "Maarten Boudry", url: "https://research.flw.ugent.be/en/maarten.boudry" },
      { name: "Marco Meyer", url: "https://www.philosophie.uni-hamburg.de/philosophisches-seminar/personen/meyer-marco.html" },
    ],
    openGraph: {
      type: "website",
      siteName: "Conspiracy Generator",
      title: m.og_title,
      description: m.og_description,
      locale: OG_LOCALE[locale],
    },
    twitter: {
      card: "summary_large_image",
      title: "Conspiracy Generator",
      description: m.twitter_description,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F2EA" },
    { media: "(prefers-color-scheme: dark)", color: "#141622" },
  ],
};

// Inline script to set theme class before paint, preventing flash-of-wrong-theme.
const NO_FLASH_THEME = `
(function(){try{var t=localStorage.getItem('cgen-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();
`.trim();

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await captureVisit();
  const locale = await readLocale();
  return (
    <html lang={locale} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME }} />
      </head>
      <body>
        <ClassroomMount />
        {children}
      </body>
    </html>
  );
}

// Anonymous page-view capture. Reads request context, kicks off a fire-and-forget
// DB insert that resolves on the Node event loop after the response streams.
// /stats/* paths are auth-gated and not tracked (the maintainer is not a visitor).
async function captureVisit() {
  try {
    const h = await headers();
    const path = h.get("x-pathname");
    if (!path) return; // middleware didn't run (excluded route or static asset)
    if (path.startsWith("/stats")) return;

    const sessionHash = await readSessionHash();
    const userAgent = h.get("user-agent");
    const referer = h.get("x-referrer");
    const countryHeader = h.get("x-country");
    const locale = h.get("x-locale");

    // Intentionally not awaited. recordPageView swallows its own errors;
    // any rejection here would already have been caught inside it.
    void recordPageView({
      sessionHash,
      path,
      userAgent,
      referer,
      countryHeader,
      locale,
    });
  } catch {
    // Capture is best-effort; never block the response on it.
  }
}
