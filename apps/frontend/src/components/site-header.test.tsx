import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AuthSession } from '@/lib/auth-types';
import { LocaleProvider } from './locale-provider';
import { SiteHeader } from './site-header';

vi.mock('next/navigation', () => ({
  usePathname: () => '/es',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: true }),
    signOut: vi.fn()
  }
}));

const session: AuthSession = {
  user: {
    id: 'user-1',
    email: 'ana@example.com',
    name: 'Ana Rueda',
    firstName: 'Ana',
    emailVerified: true
  },
  session: {
    id: 'session-1',
    userId: 'user-1',
    expiresAt: '2030-01-01T00:00:00.000Z',
    token: 'test-token'
  }
};

afterEach(cleanup);

function renderHeader(initialSession: AuthSession | null) {
  return render(
    <LocaleProvider locale="es">
      <SiteHeader initialSession={initialSession} />
    </LocaleProvider>
  );
}

describe('SiteHeader', () => {
  it('links an authenticated user to the role-aware panel route', () => {
    renderHeader(session);

    expect(screen.queryByRole('link', { name: 'Ir al panel' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de Ana' }));
    expect(screen.getByRole('link', { name: 'Ir al panel' })).toHaveAttribute('href', '/es/panel');
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
  });

  it('closes the authenticated menu with Escape', () => {
    renderHeader(session);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de Ana' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('link', { name: 'Ir al panel' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir menú de Ana' })).toHaveFocus();
  });

  it('keeps the public authentication actions for anonymous visitors', () => {
    renderHeader(null);

    expect(screen.queryByRole('link', { name: 'Ir al panel' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });
});
