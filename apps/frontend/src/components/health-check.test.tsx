import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HealthCheck } from './health-check';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('HealthCheck', () => {
  it('shows a successful backend and database response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok', timestamp: new Date().toISOString(), database: 'connected' })
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<HealthCheck />);
    fireEvent.click(screen.getByRole('button', { name: 'Check backend health' }));

    expect(await screen.findByText('API ok · database connected')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/health', { cache: 'no-store' });
  });

  it('surfaces an unavailable backend without retaining stale health', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')));
    render(<HealthCheck />);
    fireEvent.click(screen.getByRole('button', { name: 'Check backend health' }));
    expect(await screen.findByText('network unavailable')).toBeInTheDocument();
    expect(screen.getByText('Connection not checked')).toBeInTheDocument();
  });
});
