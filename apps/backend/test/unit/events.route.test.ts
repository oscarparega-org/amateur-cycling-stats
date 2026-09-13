import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getEventById: vi.fn(),
  canManageEvent: vi.fn()
}));

vi.mock('../../src/services/events.service.js', () => ({
  getFutureEvents: vi.fn(),
  getPastEvents: vi.fn(),
  getEventsByOrganization: vi.fn(),
  getEventById: mocks.getEventById,
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn()
}));

vi.mock('../../src/lib/auth-helpers.js', () => ({
  canManageEvent: mocks.canManageEvent,
  canManageOrganization: vi.fn(),
  requireAuth: vi.fn(),
  requireOrgMember: vi.fn(),
  requireEventOrgMember: vi.fn(),
  requireRole: vi.fn()
}));

import { events } from '../../src/routes/events.js';

const hiddenEvent = {
  id: 'hidden-event',
  name: 'Hidden event',
  isPublicVisible: false,
  organizationName: 'Private club'
};

describe('event detail visibility', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns not found instead of exposing a hidden event to a public caller', async () => {
    mocks.canManageEvent.mockResolvedValue(false);
    mocks.getEventById.mockResolvedValue(null);

    const response = await events.request('/hidden-event');

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Not found' });
    expect(mocks.getEventById).toHaveBeenCalledWith('hidden-event', false);
  });

  it('allows an authorized organization member to read a hidden event', async () => {
    mocks.canManageEvent.mockResolvedValue(true);
    mocks.getEventById.mockResolvedValue(hiddenEvent);

    const response = await events.request('/hidden-event');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ id: 'hidden-event' });
    expect(mocks.getEventById).toHaveBeenCalledWith('hidden-event', true);
  });
});
