import { describe, expect, it } from 'vitest';
import { detectLocale, localeFromAcceptLanguage } from './locale-detection';

describe('locale detection', () => {
  it('uses a supported saved preference before the browser language', () => {
    expect(detectLocale('es', 'en-US,en;q=0.9')).toBe('es');
  });

  it('matches regional browser languages to a supported base language', () => {
    expect(localeFromAcceptLanguage('es-MX,es;q=0.9,en;q=0.8')).toBe('es');
    expect(localeFromAcceptLanguage('en-GB,en;q=0.9')).toBe('en');
  });

  it('respects language quality weights', () => {
    expect(localeFromAcceptLanguage('es;q=0.5,en;q=0.9')).toBe('en');
  });

  it('falls back to English for missing or unsupported preferences', () => {
    expect(detectLocale(undefined, null)).toBe('en');
    expect(detectLocale('fr', 'de-DE,de;q=0.9')).toBe('en');
  });
});
