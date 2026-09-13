// @vitest-environment node

import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from './[...path]/route';

describe('authentication BFF proxy', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.API_URL;
  });

  it('forwards POST bodies, cookies, and query strings without following redirects', async () => {
    process.env.API_URL = 'http://backend.internal:3000/';
    const upstream = new Response(null, {
      status: 302,
      headers: { location: 'http://localhost:5173/correo-verificado', 'set-cookie': 'session=abc; HttpOnly; Path=/' }
    });
    const fetchMock = vi.fn().mockResolvedValue(upstream);
    vi.stubGlobal('fetch', fetchMock);
    const request = new NextRequest('http://localhost:5173/api/auth/sign-in/email?source=ui', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: 'existing=1' },
      body: JSON.stringify({ email: 'rider@example.com', password: 'password123' })
    });

    const response = await POST(request, { params: Promise.resolve({ path: ['sign-in', 'email'] }) });
    expect(fetchMock).toHaveBeenCalledWith(new URL('http://backend.internal:3000/api/auth/sign-in/email?source=ui'), expect.objectContaining({ method: 'POST', redirect: 'manual', cache: 'no-store' }));
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get('cookie')).toBe('existing=1');
    expect(new TextDecoder().decode(init.body as ArrayBuffer)).toContain('rider@example.com');
    expect(response.status).toBe(302);
    expect(response.headers.get('set-cookie')).toContain('session=abc');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('returns a controlled 503 when Hono is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const request = new NextRequest('http://localhost:5173/api/auth/get-session');
    const response = await GET(request, { params: Promise.resolve({ path: ['get-session'] }) });
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: 'El servicio de autenticación no está disponible.' });
  });
});
