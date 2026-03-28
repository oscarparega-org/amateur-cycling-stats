import commonEs from './locales/es/common.json';
import authEs from './locales/es/auth.json';
import eventsEs from './locales/es/events.json';
import racesEs from './locales/es/races.json';
import cyclistsEs from './locales/es/cyclists.json';
import portalEs from './locales/es/portal.json';
import adminEs from './locales/es/admin.json';
import panelEs from './locales/es/panel.json';
import adminCategoriesEs from './locales/es/admin-categories.json';

import commonEn from './locales/en/common.json';
import authEn from './locales/en/auth.json';
import eventsEn from './locales/en/events.json';
import racesEn from './locales/en/races.json';
import cyclistsEn from './locales/en/cyclists.json';
import portalEn from './locales/en/portal.json';
import adminEn from './locales/en/admin.json';
import panelEn from './locales/en/panel.json';
import adminCategoriesEn from './locales/en/admin-categories.json';

type Translations = {
	[locale: string]: {
		common: typeof commonEs;
		auth: typeof authEs;
		events: typeof eventsEs;
		races: typeof racesEs;
		cyclists: typeof cyclistsEs;
		portal: typeof portalEs;
		admin: typeof adminEs;
		panel: typeof panelEs;
		adminCategories: typeof adminCategoriesEs;
	};
};

type TranslationValue = string | { [key: string]: TranslationValue };

const translations: Translations = {
	es: {
		common: commonEs,
		auth: authEs,
		events: eventsEs,
		races: racesEs,
		cyclists: cyclistsEs,
		portal: portalEs,
		admin: adminEs,
		panel: panelEs,
		adminCategories: adminCategoriesEs
	},
	en: {
		common: commonEn,
		auth: authEn,
		events: eventsEn,
		races: racesEn,
		cyclists: cyclistsEn,
		portal: portalEn,
		admin: adminEn,
		panel: panelEn,
		adminCategories: adminCategoriesEn
	}
};

/**
 * Get a translated message on the server side.
 * @param locale - The locale to use (es, en)
 * @param key - The translation key in dot notation (e.g., 'auth.errors.invalidCredentials')
 * @param fallback - Optional fallback text if translation is not found
 * @returns The translated message or the key itself if not found
 */
export function t(locale: string, key: string, fallback?: string): string {
	// Default to Spanish if locale not supported
	const validLocale = ['es', 'en'].includes(locale) ? locale : 'es';

	// Split the key to navigate through the nested object
	const parts = key.split('.');
	let result: TranslationValue = translations[validLocale];

	for (const part of parts) {
		if (result && typeof result === 'object' && part in result) {
			result = result[part];
		} else {
			// Translation not found, return fallback or key
			return fallback || key;
		}
	}

	return typeof result === 'string' ? result : fallback || key;
}

/**
 * Get auth error message translated
 * @param locale - The locale to use
 * @param errorCode - The Supabase error code
 * @returns Translated error message
 */
export function getAuthErrorMessage(locale: string, errorCode: string): string {
	const errorMap: { [code: string]: string } = {
		invalid_credentials: t(locale, 'auth.errors.invalidCredentials'),
		email_not_confirmed: t(locale, 'auth.errors.emailNotConfirmed'),
		user_not_found: t(locale, 'auth.errors.userNotFound'),
		user_banned: t(locale, 'auth.errors.userBanned'),
		over_request_rate_limit: t(locale, 'auth.errors.rateLimitExceeded'),
		email_exists: t(locale, 'auth.errors.emailExists'),
		phone_exists: t(locale, 'auth.errors.phoneExists'),
		weak_password: t(locale, 'auth.errors.weakPassword'),
		signup_disabled: t(locale, 'auth.errors.signupDisabled')
	};

	return errorMap[errorCode] || errorCode;
}
