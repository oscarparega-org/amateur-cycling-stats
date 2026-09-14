import { describe, expect, it } from 'vitest';
import { isLocale, localePath, translate } from './i18n';

describe('i18n routing and translations', () => {
  it('supports the initial English and Spanish locales', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('es')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });

  it('uses English as the default locale', async () => {
    const { defaultLocale } = await import('./i18n');
    expect(defaultLocale).toBe('en');
  });

  it('prefixes English route slugs with the selected locale', () => {
    expect(localePath('en', '/admin/organizations/org-1/edit')).toBe('/en/admin/organizations/org-1/edit');
    expect(localePath('es', '/events/event-1')).toBe('/es/events/event-1');
  });

  it('translates content without translating URL segments', () => {
    expect(translate('en', 'Organizaciones')).toBe('Organizations');
    expect(translate('es', 'Organizaciones')).toBe('Organizaciones');
  });
});
