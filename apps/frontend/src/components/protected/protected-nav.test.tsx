import { render, screen } from '@testing-library/react';
import type { Route } from 'next';
import { describe, expect, it, vi } from 'vitest';
import { ProtectedNav, type ProtectedNavItem } from './protected-nav';

const navigation = vi.hoisted(() => ({ pathname: '/organizer/org-1/events/event-1' }));

vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }));

const items: ProtectedNavItem[] = [
  { href: '/organizer/org-1' as Route, icon: 'overview', label: 'Resumen', match: 'exact' },
  { href: '/organizer/org-1/events' as Route, icon: 'events', label: 'Eventos' }
];

describe('protected navigation', () => {
  it('keeps the nested section active without activating an exact parent', () => {
    render(<ProtectedNav items={items} />);

    expect(screen.getByRole('link', { name: 'Eventos' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Resumen' })).not.toHaveAttribute('aria-current');
  });

  it('uses the active section as the protected header title', () => {
    const { container } = render(<ProtectedNav header items={items} />);
    expect(container).toHaveTextContent('Eventos');
  });
});
