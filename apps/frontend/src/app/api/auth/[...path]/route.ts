import type { NextRequest } from 'next/server';
import { backendUrl } from '@/lib/backend';

export const dynamic = 'force-dynamic';

const excludedRequestHeaders = new Set(['connection', 'content-length', 'host']);
const excludedResponseHeaders = new Set(['connection', 'content-encoding', 'content-length', 'transfer-encoding']);

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = new URL(backendUrl(`/api/auth/${path.join('/')}`));
  target.search = request.nextUrl.search;

  const headers = new Headers();
  request.headers.forEach((value, name) => {
    if (!excludedRequestHeaders.has(name.toLowerCase())) headers.append(name, value);
  });

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
      cache: 'no-store',
      redirect: 'manual'
    });

    const responseHeaders = new Headers();
    response.headers.forEach((value, name) => {
      if (!excludedResponseHeaders.has(name.toLowerCase()) && name.toLowerCase() !== 'set-cookie') {
        responseHeaders.append(name, value);
      }
    });
    for (const cookie of response.headers.getSetCookie()) responseHeaders.append('set-cookie', cookie);
    responseHeaders.set('cache-control', 'no-store');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch {
    return Response.json({ error: 'El servicio de autenticación no está disponible.' }, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;
