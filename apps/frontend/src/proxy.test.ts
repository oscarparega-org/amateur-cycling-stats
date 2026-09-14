import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from './proxy';

describe('locale proxy', () => {
  it('does not redirect a URL that already has a supported locale', () => {
    const response = proxy(new NextRequest('https://acs.test/es/admin'));
    expect(response.headers.get('location')).toBeNull();
  });

  it('uses the saved locale for a URL without a locale', () => {
    const request = new NextRequest('https://acs.test/admin?view=active', {
      headers: { cookie: 'locale=es', 'accept-language': 'en-US,en;q=0.9' }
    });
    const response = proxy(request);

    expect(response.headers.get('location')).toBe('https://acs.test/es/admin?view=active');
  });

  it('uses the browser language and then the English fallback', () => {
    const spanish = proxy(new NextRequest('https://acs.test/', { headers: { 'accept-language': 'es-MX,es;q=0.9' } }));
    const fallback = proxy(new NextRequest('https://acs.test/', { headers: { 'accept-language': 'fr-FR' } }));

    expect(spanish.headers.get('location')).toBe('https://acs.test/es');
    expect(fallback.headers.get('location')).toBe('https://acs.test/en');
  });
});
