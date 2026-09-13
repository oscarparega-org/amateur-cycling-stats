import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from './safe-redirect';

describe('safeRedirectPath', () => {
  it('keeps local paths, queries, and fragments', () => {
    expect(safeRedirectPath('/eventos?year=2026#resultados')).toBe('/eventos?year=2026#resultados');
  });

  it.each(['https://evil.example', '//evil.example/path', 'javascript:alert(1)', ''])(
    'rejects unsafe destination %s',
    (value) => {
      expect(safeRedirectPath(value, '/inicio')).toBe('/inicio');
    }
  );
});
