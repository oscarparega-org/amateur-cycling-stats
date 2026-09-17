import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Event } from '@acs/shared';
import { EventForm } from './event-form';
import { StatusBadge } from './status-badge';

const event: Event = {
  id: 'event-1',
  name: 'Gran Fondo del Valle',
  description: 'Ruta de prueba',
  dateTime: '2026-10-18T14:30:00.000Z',
  timeZone: 'America/Mexico_City',
  year: 2026,
  city: 'Valle de Bravo',
  state: 'Estado de México',
  country: 'México',
  eventStatus: 'DRAFT',
  organizationId: 'org-1',
  createdBy: 'user-1',
  isPublicVisible: false,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z'
};

describe('organizer event controls', () => {
  it('renders event status in organizer-friendly language', () => {
    render(<StatusBadge status="AVAILABLE" />);
    expect(screen.getByText('Disponible')).toBeVisible();
  });

  it('prefills every editable event field', () => {
    const action = vi.fn(async () => ({}));
    render(<EventForm action={action} event={event} />);

    expect(screen.getByLabelText('Nombre del evento')).toHaveValue('Gran Fondo del Valle');
    expect(screen.getByLabelText('Descripción')).toHaveValue('Ruta de prueba');
    expect(screen.getByLabelText('País')).toHaveValue('México');
    expect(screen.getByLabelText('Estado')).toHaveValue('Estado de México');
    expect(screen.getByLabelText('Ciudad')).toHaveValue('Valle de Bravo');
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeVisible();
  });
});
