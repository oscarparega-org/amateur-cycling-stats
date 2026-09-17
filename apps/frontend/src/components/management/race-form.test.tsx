import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AvailableCategories, Event } from '@acs/shared';
import { RaceForm } from './race-form';

const stamp = '2026-01-01T00:00:00.000Z';
const owner = { organizationId: null, eventId: null, scope: 'GLOBAL' as const };
const available: AvailableCategories = {
  age: {
    global: [
      {
        id: 'age-1',
        name: 'Master 30',
        fromAge: 30,
        toAge: 39,
        isDefault: false,
        createdAt: stamp,
        updatedAt: stamp,
        ...owner
      }
    ],
    organization: [],
    event: []
  },
  gender: {
    global: [{ id: 'gender-1', name: 'Women', isDefault: false, createdAt: stamp, updatedAt: stamp, ...owner }],
    organization: [],
    event: []
  },
  distance: {
    global: [
      { id: 'distance-1', name: '80 km', distance: 80, isDefault: false, createdAt: stamp, updatedAt: stamp, ...owner }
    ],
    organization: [],
    event: []
  }
};
const event: Event = {
  id: 'event-1',
  name: 'Gran Fondo',
  description: null,
  dateTime: '2026-10-18T14:30:00.000Z',
  timeZone: 'America/Mexico_City',
  year: 2026,
  city: null,
  state: 'Jalisco',
  country: 'México',
  eventStatus: 'DRAFT',
  organizationId: 'org-1',
  createdBy: 'user-1',
  isPublicVisible: false,
  createdAt: stamp,
  updatedAt: stamp
};

describe('RaceForm', () => {
  it('previews the authoritative category-based race name', () => {
    render(<RaceForm action={vi.fn(async () => ({}))} available={available} event={event} locale="en" />);
    fireEvent.click(screen.getByRole('radio', { name: 'Master 30' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Women' }));
    fireEvent.click(screen.getByRole('radio', { name: '80 km' }));
    expect(screen.getByText('Master 30 - Women - 80 km')).toBeVisible();
  });
});
