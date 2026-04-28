// Masthead — site header on every page.
// Server-component shell that reads the active locale and pulls localized labels
// from the dictionaries, then hands the labels to a client mobile-drawer + locale
// toggle for client-side cookie writing on switch.
// Spec: openspec/changes/multilingual-german/specs/internationalization/spec.md

import { headers } from "next/headers";
import { readLocale, getDict, localizedHref, type Locale } from "@/lib/i18n";
import { MastheadClient } from "./masthead-client";

export async function Masthead() {
  const locale = await readLocale();
  const t = getDict(locale).masthead;
  const h = await headers();
  // Middleware sets x-pathname to the un-prefixed path (e.g. /recipe even on /de/recipe).
  const path = h.get("x-pathname") ?? "/";

  const nav: { label: string; href: string }[] = [
    { label: t.nav_recipe, href: localizedHref("/recipe", locale) },
    { label: t.nav_teach, href: localizedHref("/teach", locale) },
    { label: t.nav_about, href: localizedHref("/about", locale) },
    { label: t.nav_build, href: localizedHref("/", locale) },
  ];

  // For the locale toggle: build the href that points at the same logical page
  // in the OTHER locale.
  const otherLocale: Locale = locale === "de" ? "en" : "de";
  const toggleHref = localizedHref(path, otherLocale);

  return (
    <MastheadClient
      home={localizedHref("/", locale)}
      nav={nav}
      activeIndex={3}
      openLabel={t.open_nav}
      toggleAria={t.locale_toggle_aria}
      currentLocale={locale}
      otherLocale={otherLocale}
      toggleHref={toggleHref}
    />
  );
}
