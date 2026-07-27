import type { Locale } from "@/lib/i18n";

type LocalizedPerformance = {
  summary: string;
  summaryEn: string | null;
  summaryRo: string | null;
  title: string;
  titleEn: string | null;
  titleRo: string | null;
};

export function getLocalizedPerformanceSummary(performance: LocalizedPerformance, locale: Locale) {
  return (locale === "ro" ? performance.summaryRo : locale === "en" ? performance.summaryEn : performance.summary)
    || performance.summary;
}

export function getLocalizedPerformanceTitle(performance: LocalizedPerformance, locale: Locale) {
  return (locale === "ro" ? performance.titleRo : locale === "en" ? performance.titleEn : performance.title)
    || performance.title;
}
