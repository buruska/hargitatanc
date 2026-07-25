import { headers } from "next/headers";

export type Locale = "hu" | "ro" | "en";

export async function getLocale(): Promise<Locale> {
  const locale = (await headers()).get("x-site-locale");
  return locale === "ro" || locale === "en" ? locale : "hu";
}

export function localizeHref(href: string, locale: Locale) {
  return locale === "hu" ? href : `/${locale}${href === "/" ? "" : href}`;
}
