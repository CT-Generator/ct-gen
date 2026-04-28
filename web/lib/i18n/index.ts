// i18n public API. Spec: openspec/changes/multilingual-german/specs/internationalization/spec.md

import { headers } from "next/headers";
import { en, type Dictionary } from "./en";
import { de } from "./de";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./types";

const DICTS: Record<Locale, Dictionary> = { en, de };

export type { Locale };
export { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES } from "./types";

/**
 * Read the active locale from the request. Middleware sets `x-locale` on
 * every non-asset request; this helper validates and returns it. Defaults
 * to `en` if the header is missing or invalid.
 */
export async function readLocale(): Promise<Locale> {
  const h = await headers();
  const raw = h.get("x-locale");
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

/** Look up a string in the active locale's dictionary. */
export function getDict(locale: Locale): Dictionary {
  return DICTS[locale];
}

/** Build the URL for the locale-prefixed equivalent of a path. */
export function localizedHref(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  if (path === "/") return "/de";
  return `/de${path}`;
}
