// Topbar — sticky zine header on every page.
// Star-clipped magenta brand mark + title + Issue tag + nav.
// Spec: zine-design-system / Requirement: Topbar component.

import { headers } from "next/headers";
import {
  readLocale,
  getDict,
  localizedHref,
  VISIBLE_LOCALES,
  type Locale,
} from "@/lib/i18n";
import { TopbarClient } from "./topbar-client";

export async function Topbar() {
  const locale = await readLocale();
  const dict = getDict(locale);
  const t = dict.masthead;
  const zineT = dict.zine;
  const h = await headers();
  const path = h.get("x-pathname") ?? "/";

  const nav = [
    { key: "recipe" as const, label: t.nav_recipe, href: localizedHref("/recipe", locale) },
    { key: "teach" as const, label: t.nav_teach, href: localizedHref("/teach", locale) },
    { key: "about" as const, label: t.nav_about, href: localizedHref("/about", locale) },
  ];

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
    <TopbarClient
      brandLabel="Conspiracy Generator"
      issueTag={zineT.issue_tag}
      home={localizedHref("/", locale)}
      nav={nav}
      localeOptions={localeOptions}
      toggleAria={t.locale_toggle_aria}
      openLabel={t.open_nav}
    />
  );
}
