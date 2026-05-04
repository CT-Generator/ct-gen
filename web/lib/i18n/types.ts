// i18n types. Spec: openspec/changes/multilingual-dutch/specs/internationalization/spec.md
//   (extends openspec/changes/multilingual-german/specs/internationalization/spec.md)

export type Locale = "en" | "de" | "nl";

export const SUPPORTED_LOCALES = ["en", "de", "nl"] as const satisfies readonly Locale[];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "de" || value === "nl";
}

/** Visible locales in the masthead toggle. The flag is kept (rather than removed)
 *  so future locales can re-use the same launch-gate pattern. The masthead also
 *  unions the active locale into the toggle defensively — so even if this flag
 *  is flipped back to `false`, a visitor on `/<locale>/...` still sees their
 *  current pill (no orphaned URL state).
 *  Spec: openspec/specs/internationalization (Locale toggle in masthead). */
export const DUTCH_LAUNCHED = true;
export const VISIBLE_LOCALES: readonly Locale[] = DUTCH_LAUNCHED
  ? ["en", "de", "nl"]
  : ["en", "de"];
