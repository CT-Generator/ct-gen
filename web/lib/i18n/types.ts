// i18n types. Spec: openspec/changes/multilingual-german/specs/internationalization/spec.md

export type Locale = "en" | "de";

export const SUPPORTED_LOCALES = ["en", "de"] as const satisfies readonly Locale[];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "de";
}
