import { defaultLocale, isLocale, type Locale } from './i18n';

type LanguagePreference = {
  language: string;
  quality: number;
  order: number;
};

function parseAcceptLanguage(header: string): LanguagePreference[] {
  return header
    .split(',')
    .map((entry, order) => {
      const [rawLanguage = '', ...parameters] = entry.trim().split(';');
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='));
      const parsedQuality = qualityParameter ? Number.parseFloat(qualityParameter.trim().slice(2)) : 1;

      return {
        language: rawLanguage.toLowerCase(),
        quality: Number.isFinite(parsedQuality) ? Math.min(1, Math.max(0, parsedQuality)) : 0,
        order
      };
    })
    .filter(({ language, quality }) => language.length > 0 && quality > 0)
    .sort((left, right) => right.quality - left.quality || left.order - right.order);
}

export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return defaultLocale;

  for (const preference of parseAcceptLanguage(header)) {
    const baseLanguage = preference.language.split('-')[0];
    if (baseLanguage && isLocale(baseLanguage)) return baseLanguage;
    if (preference.language === '*') return defaultLocale;
  }

  return defaultLocale;
}

export function detectLocale(savedLocale: string | undefined, acceptLanguage: string | null): Locale {
  if (savedLocale && isLocale(savedLocale)) return savedLocale;
  return localeFromAcceptLanguage(acceptLanguage);
}
