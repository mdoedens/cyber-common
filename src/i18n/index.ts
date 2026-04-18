/**
 * Minimal i18n core. Dict lives in the consuming project (different brand copy
 * per project); this package just provides types, constants, and detection.
 */

export type Locale = "en" | "nl";
export const locales: Locale[] = ["en", "nl"];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Parse an Accept-Language header; Dutch (nl*) wins, everything else → en. */
export function detectLocaleFromHeader(
  acceptLanguage: string | null,
): Locale {
  if (!acceptLanguage) return defaultLocale;
  const first = acceptLanguage.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("nl") ? "nl" : defaultLocale;
}
