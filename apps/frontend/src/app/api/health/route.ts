import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000')
    .replace(/\/$/, '');

  try {
    const response = await fetch(`${apiUrl}/health`, { cache: 'no-store' });
    const payload: unknown = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Backend is unavailable' }, { status: 503 });
  }
}
