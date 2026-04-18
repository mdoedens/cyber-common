import "server-only";
import { cookies, headers } from "next/headers";

import {
  LOCALE_COOKIE,
  type Locale,
  defaultLocale,
  detectLocaleFromHeader,
} from "./index";

/** Server-side locale resolution: cookie > Accept-Language > default. */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (fromCookie === "nl" || fromCookie === "en") return fromCookie;
  const hdr = (await headers()).get("accept-language");
  return detectLocaleFromHeader(hdr);
}

/**
 * Factory for a typed `t()` function. The caller supplies a dictionary —
 * typically two objects `{ en: {...}, nl: {...} }` with identical keys.
 *
 * Usage:
 *   import { createGetT } from "@cyber/common/i18n/server";
 *   import { dict } from "@/lib/dict"; // per-project strings
 *   const getT = createGetT(dict);
 *   const t = await getT();
 *   t("nav.login")
 */
export function createGetT<
  D extends Record<Locale, Record<string, string>>,
  K extends keyof D[Locale] & string = keyof D[Locale] & string,
>(dict: D) {
  return async function getT(): Promise<(k: K) => string> {
    const locale = await getLocale();
    const table = dict[locale] ?? dict[defaultLocale];
    return (k: K) => table[k] ?? dict[defaultLocale][k] ?? (k as string);
  };
}
