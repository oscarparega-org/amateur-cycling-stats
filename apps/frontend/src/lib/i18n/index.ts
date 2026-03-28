import i18n from 'sveltekit-i18n';
import type { Config } from 'sveltekit-i18n';

const config: Config = {
	loaders: [
		// Spanish translations
		{
			locale: 'es',
			key: 'common',
			loader: async () => (await import('./locales/es/common.json')).default
		},
		{
			locale: 'es',
			key: 'auth',
			loader: async () => (await import('./locales/es/auth.json')).default
		},
		{
			locale: 'es',
			key: 'events',
			loader: async () => (await import('./locales/es/events.json')).default
		},
		{
			locale: 'es',
			key: 'races',
			loader: async () => (await import('./locales/es/races.json')).default
		},
		{
			locale: 'es',
			key: 'cyclists',
			loader: async () => (await import('./locales/es/cyclists.json')).default
		},
		{
			locale: 'es',
			key: 'portal',
			loader: async () => (await import('./locales/es/portal.json')).default
		},
		{
			locale: 'es',
			key: 'account',
			loader: async () => (await import('./locales/es/account.json')).default
		},
		{
			locale: 'es',
			key: 'panel',
			loader: async () => (await import('./locales/es/panel.json')).default
		},
		{
			locale: 'es',
			key: 'admin',
			loader: async () => (await import('./locales/es/admin.json')).default
		},
		{
			locale: 'es',
			key: 'adminCategories',
			loader: async () => (await import('./locales/es/admin-categories.json')).default
		},
		{
			locale: 'es',
			key: 'orgCategories',
			loader: async () => (await import('./locales/es/org-categories.json')).default
		},
		// English translations
		{
			locale: 'en',
			key: 'common',
			loader: async () => (await import('./locales/en/common.json')).default
		},
		{
			locale: 'en',
			key: 'auth',
			loader: async () => (await import('./locales/en/auth.json')).default
		},
		{
			locale: 'en',
			key: 'events',
			loader: async () => (await import('./locales/en/events.json')).default
		},
		{
			locale: 'en',
			key: 'races',
			loader: async () => (await import('./locales/en/races.json')).default
		},
		{
			locale: 'en',
			key: 'cyclists',
			loader: async () => (await import('./locales/en/cyclists.json')).default
		},
		{
			locale: 'en',
			key: 'portal',
			loader: async () => (await import('./locales/en/portal.json')).default
		},
		{
			locale: 'en',
			key: 'account',
			loader: async () => (await import('./locales/en/account.json')).default
		},
		{
			locale: 'en',
			key: 'panel',
			loader: async () => (await import('./locales/en/panel.json')).default
		},
		{
			locale: 'en',
			key: 'admin',
			loader: async () => (await import('./locales/en/admin.json')).default
		},
		{
			locale: 'en',
			key: 'adminCategories',
			loader: async () => (await import('./locales/en/admin-categories.json')).default
		},
		{
			locale: 'en',
			key: 'orgCategories',
			loader: async () => (await import('./locales/en/org-categories.json')).default
		}
	],
	fallbackLocale: 'es'
};

export const { t, locale, locales, loading, loadTranslations } = new i18n(config);
