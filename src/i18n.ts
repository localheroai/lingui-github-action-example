import { i18n } from "@lingui/core";

export const LOCALES = {
  en: "English",
  sv: "Svenska",
  pl: "Polski",
  ar: "العربية"
} as const;

export type Locale = keyof typeof LOCALES;

export const DEFAULT_LOCALE: Locale = "en";

const RIGHT_TO_LEFT: ReadonlySet<Locale> = new Set(["ar"]);

export async function activateLocale(locale: Locale) {
  const { messages } = await import(`./locales/${locale}/messages.ts`);
  i18n.loadAndActivate({ locale, messages });
  document.documentElement.lang = locale;
  document.documentElement.dir = RIGHT_TO_LEFT.has(locale) ? "rtl" : "ltr";
}
