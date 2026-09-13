import { describe, expect, it } from 'vitest';
import * as shared from './index.js';

describe('@acs/shared public entrypoint', () => {
  it('exposes its public contracts at runtime', () => {
    expect(Object.keys(shared).length).toBeGreaterThan(0);
  });
});
