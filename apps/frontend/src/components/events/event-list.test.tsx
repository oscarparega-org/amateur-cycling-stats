import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { EventWithOrganization } from '@acs/shared';
import { EventDetail } from './event-detail';
import { EventList } from './event-list';

const event: EventWithOrganization = {
  id: 'event-1',
  name: 'Gran Fondo Sierra',
  description: 'Una ruta de montaña para ciclistas amateur.',
  dateTime: '2030-09-21T14:00:00.000Z',
  year: 2030,
  city: 'Guadalajara',
  state: 'Jalisco',
  country: 'México',
  eventStatus: 'AVAILABLE',
  organizationId: 'organization-1',
  organizationName: 'Club Ciclista Norte',
  createdBy: 'user-1',
  isPublicVisible: true,
  createdAt: '2030-01-01T00:00:00.000Z',
  updatedAt: '2030-01-01T00:00:00.000Z'
};

afterEach(cleanup);

describe('EventList', () => {
  it('renders an event as a complete link with organizer and location', () => {
    render(<EventList events={[event]} />);

    expect(screen.getByRole('link', { name: /Gran Fondo Sierra/ })).toHaveAttribute('href', '/eventos/event-1');
    expect(screen.getByText('Club Ciclista Norte')).toBeInTheDocument();
    expect(screen.getByText('Guadalajara, Jalisco, México')).toBeInTheDocument();
    expect(screen.getAllByText('Disponible')).toHaveLength(2);
  });

  it('renders guidance when there are no upcoming events', () => {
    render(<EventList events={[]} />);
    expect(screen.getByText('No hay próximos eventos')).toBeInTheDocument();
    expect(screen.getByText(/nueva carrera/)).toBeInTheDocument();
  });
});

describe('EventDetail', () => {
  it('renders the event information without race or registration controls', () => {
    render(<EventDetail event={event} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Gran Fondo Sierra' })).toBeInTheDocument();
    expect(screen.getByText('Una ruta de montaña para ciclistas amateur.')).toBeInTheDocument();
    expect(screen.getByText('Guadalajara, Jalisco, México')).toBeInTheDocument();
    expect(screen.queryByText(/inscrib/i)).not.toBeInTheDocument();
  });
});
