// i18n public API. Spec: openspec/specs/internationalization/spec.md
// Sticky-language behavior: openspec/changes/sticky-language-selection/specs/internationalization/spec.md

import { headers } from "next/headers";
import { en, type Dictionary } from "./en";
import { de } from "./de";
import { nl } from "./nl";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./types";

const DICTS: Record<Locale, Dictionary> = { en, de, nl };

export type { Locale };
export { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES, DUTCH_LAUNCHED, VISIBLE_LOCALES } from "./types";
export {
  resolveContentLocaleFromPath,
  getGenerationRowLocale,
  getStorySeedLocale,
} from "./content-locale";

/**
 * Read the visitor's *chrome* locale from the request. Middleware sets
 * `x-locale` on every non-asset request based on the `cgen_lang` cookie
 * (with URL prefix / Accept-Language as fallbacks). This is the language
 * the masthead, footer, and every navigation link should render in.
 *
 * For row-driven page bodies (`/g/[id]`, `/story/[uuid]`, `/build/[id]`),
 * use the row's persisted locale instead — chrome and content can diverge.
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

/** Build the URL for the locale-prefixed equivalent of a path.
 *  English is the default and lives un-prefixed; every other locale lives
 *  under `/<locale>/...`. */
export function localizedHref(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}
