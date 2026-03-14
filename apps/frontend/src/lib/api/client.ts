import { env } from '$env/dynamic/public';

function getBaseUrl(): string {
  return env.PUBLIC_API_URL || 'http://localhost:3000';
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}
