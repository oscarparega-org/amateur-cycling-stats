import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { errorHandler } from '../../src/middleware/error-handler.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('errorHandler', () => {
  it('logs unexpected errors server-side without exposing their details to clients', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const app = new Hono();
    app.onError(errorHandler);
    app.get('/failure', () => {
      throw new Error('postgresql://user:secret@database/private');
    });

    const response = await app.request('/failure');
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Internal server error' });
  });
});
