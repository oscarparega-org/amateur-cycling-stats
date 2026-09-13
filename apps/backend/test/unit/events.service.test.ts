import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn()
}));

vi.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    event: prismaMocks
  }
}));

import { getEventById, getFutureEvents } from '../../src/services/events.service.js';

function databaseEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'event-1',
    name: 'Gran Fondo Sierra',
    description: 'Mountain route',
    dateTime: new Date('2030-09-21T14:00:00.000Z'),
    year: 2030,
    city: 'Guadalajara',
    state: 'Jalisco',
    country: 'México',
    eventStatus: 'AVAILABLE',
    organizationId: 'organization-1',
    createdBy: 'user-1',
    isPublicVisible: true,
    createdAt: new Date('2030-01-01T00:00:00.000Z'),
    updatedAt: new Date('2030-01-01T00:00:00.000Z'),
    organization: { name: 'Club Ciclista Norte' },
    ...overrides
  };
}

describe('events service public reads', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requests visible future events in open states and enriches the organizer', async () => {
    prismaMocks.findMany.mockResolvedValue([databaseEvent()]);

    const events = await getFutureEvents();

    expect(prismaMocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isPublicVisible: true,
          dateTime: { gte: expect.any(Date) },
          eventStatus: { in: ['AVAILABLE', 'SOLD_OUT'] }
        }),
        include: { organization: { select: { name: true } } },
        orderBy: { dateTime: 'asc' }
      })
    );
    expect(events[0]).toMatchObject({ name: 'Gran Fondo Sierra', organizationName: 'Club Ciclista Norte' });
  });

  it('returns a null organizer name for independent events', async () => {
    prismaMocks.findFirst.mockResolvedValue(databaseEvent({ organization: null, organizationId: null }));

    await expect(getEventById('00000000-0000-4000-8000-000000000001')).resolves.toMatchObject({
      organizationName: null
    });
    expect(prismaMocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '00000000-0000-4000-8000-000000000001', isPublicVisible: true }
      })
    );
  });

  it('returns null for an invalid event identifier without querying the database', async () => {
    await expect(getEventById('not-an-event-id')).resolves.toBeNull();
    expect(prismaMocks.findFirst).not.toHaveBeenCalled();
  });
});
