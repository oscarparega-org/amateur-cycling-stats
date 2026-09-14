import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from './safe-redirect';

describe('safeRedirectPath', () => {
  it('keeps local paths, queries, and fragments', () => {
    expect(safeRedirectPath('/es/events?year=2026#results')).toBe('/es/events?year=2026#results');
  });

  it.each(['https://evil.example', '//evil.example/path', 'javascript:alert(1)', ''])(
    'rejects unsafe destination %s',
    (value) => {
      expect(safeRedirectPath(value, '/inicio')).toBe('/inicio');
    }
  );
});
