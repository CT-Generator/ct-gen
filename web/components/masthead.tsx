// Masthead — site header on every page.
// Server-component shell that reads the active locale and pulls localized labels
// from the dictionaries, then hands the labels to a client mobile-drawer + locale
// toggle for client-side cookie writing on switch.
// Spec: openspec/changes/multilingual-german/specs/internationalization/spec.md

import { headers } from "next/headers";
import { readLocale, getDict, localizedHref, VISIBLE_LOCALES, type Locale } from "@/lib/i18n";
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

  // For the locale toggle: one entry per visible locale with its target href.
  // The active locale's pill links to the current page (a no-op click); other
  // pills link to the equivalent path under that locale's prefix.
  // Defensive union: always include the active locale, even if it's not in
  // VISIBLE_LOCALES (e.g., a launch-gated locale a visitor reached directly).
  // Without this, the toggle would render no current-state indicator and both
  // shown pills would point AWAY from the visitor's current URL.
  const visibleSet = VISIBLE_LOCALES.includes(locale)
    ? VISIBLE_LOCALES
    : ([...VISIBLE_LOCALES, locale] as readonly Locale[]);
  const localeOptions = visibleSet.map((l) => ({
    locale: l,
    label: l.toUpperCase(),
    href: localizedHref(path, l),
    active: l === locale,
  }));

  return (
    <MastheadClient
      home={localizedHref("/", locale)}
      nav={nav}
      activeIndex={3}
      openLabel={t.open_nav}
      toggleAria={t.locale_toggle_aria}
      localeOptions={localeOptions}
    />
  );
}

export type LocaleOption = {
  locale: Locale;
  label: string;
  href: string;
  active: boolean;
};
