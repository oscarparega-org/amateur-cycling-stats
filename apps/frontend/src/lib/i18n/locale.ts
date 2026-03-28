/**
 * Locale detection and validation utilities.
 * Used by hooks.server.ts for automatic locale detection from Accept-Language header.
 */

export const SUPPORTED_LOCALES = ['es', 'en'] as const;
export const DEFAULT_LOCALE = 'es';
export const LOCALE_COOKIE_NAME = 'locale';

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Parse Accept-Language header to extract preferred locale.
 * Parses quality values (q) and returns the highest-quality supported locale.
 *
 * @param header - Accept-Language header value (e.g., "es-ES,es;q=0.9,en;q=0.8")
 * @returns Preferred supported locale or default locale if none found
 *
 * @example
 * parseAcceptLanguage("es-ES,es;q=0.9,en;q=0.8") // => "es"
 * parseAcceptLanguage("en-US,en;q=0.9") // => "en"
 * parseAcceptLanguage("fr-FR,fr;q=0.9") // => "es" (default)
 * parseAcceptLanguage(null) // => "es" (default)
 */
export function parseAcceptLanguage(header: string | null): SupportedLocale {
	if (!header) return DEFAULT_LOCALE;

	const languages = header
		.split(',')
		.map((lang) => {
			const [code, qValue] = lang.trim().split(';q=');
			return {
				code: code.split('-')[0].toLowerCase(), // Extract base language (es from es-ES)
				quality: qValue ? parseFloat(qValue) : 1.0
			};
		})
		.sort((a, b) => b.quality - a.quality);

	// Find first supported locale
	for (const lang of languages) {
		if (SUPPORTED_LOCALES.includes(lang.code as SupportedLocale)) {
			return lang.code as SupportedLocale;
		}
	}

	return DEFAULT_LOCALE;
}

/**
 * Validate if a locale string is supported.
 * @param locale - Locale string to validate
 * @returns True if locale is supported, false otherwise
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
	return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}
