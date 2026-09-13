import { cookies } from 'next/headers';
import type { AuthSession } from './auth-types';

export function backendUrl(path: string): string {
  const baseUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    ''
  );
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies();
  const headers = new Headers(init.headers);
  const cookie = cookieStore.toString();
  if (cookie) headers.set('cookie', cookie);

  return fetch(backendUrl(path), {
    ...init,
    headers,
    cache: 'no-store',
    redirect: 'manual'
  });
}

export async function getServerSession(): Promise<AuthSession | null> {
  try {
    const response = await backendFetch('/api/auth/get-session');
    if (!response.ok) return null;
    return (await response.json()) as AuthSession | null;
  } catch {
    return null;
  }
}
