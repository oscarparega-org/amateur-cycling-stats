'use client';

import { useState } from 'react';

type HealthResponse = {
  status: string;
  timestamp: string;
  database: string;
};

export function HealthCheck() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function checkHealth() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/health', { cache: 'no-store' });
      const payload = (await response.json()) as HealthResponse | { error: string };

      if (!response.ok || !('status' in payload)) {
        throw new Error('error' in payload ? payload.error : `Backend returned ${response.status}`);
      }

      setHealth(payload);
    } catch (cause) {
      setHealth(null);
      setError(cause instanceof Error ? cause.message : 'Unable to reach the backend');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">Hono backend</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">
        {health ? `API ${health.status} · database ${health.database}` : 'Connection not checked'}
      </p>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      <button
        className="mt-5 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
        disabled={loading}
        onClick={checkHealth}
        type="button"
      >
        {loading ? 'Checking…' : 'Check backend health'}
      </button>
    </div>
  );
}
