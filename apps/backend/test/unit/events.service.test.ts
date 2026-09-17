import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';

const prismaMocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  transaction: vi.fn(),
  txQueryRaw: vi.fn(),
  txEventFindUnique: vi.fn(),
  txEventDelete: vi.fn(),
  txRaceDeleteMany: vi.fn()
}));

vi.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    event: {
      findMany: prismaMocks.findMany,
      findFirst: prismaMocks.findFirst,
      findUnique: prismaMocks.findUnique,
      update: prismaMocks.update
    },
    $transaction: prismaMocks.transaction
  }
}));

import {
  deleteEvent,
  EventConflictError,
  getEventById,
  getFutureEvents,
  updateEvent
} from '../../src/services/events.service.js';

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
        where: {
          id: '00000000-0000-4000-8000-000000000001',
          isPublicVisible: true,
          eventStatus: { not: 'DRAFT' }
        }
      })
    );
  });

  it('returns null for an invalid event identifier without querying the database', async () => {
    await expect(getEventById('not-an-event-id')).resolves.toBeNull();
    expect(prismaMocks.findFirst).not.toHaveBeenCalled();
  });
});

describe('events service lifecycle and deletion', () => {
  beforeEach(() => vi.resetAllMocks());

  it('rejects a stale lifecycle write instead of overwriting an advanced status', async () => {
    prismaMocks.findUnique.mockResolvedValue(databaseEvent({ eventStatus: 'AVAILABLE' }));
    prismaMocks.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record no longer matches', { code: 'P2025', clientVersion: '6.19.3' })
    );
    await expect(updateEvent('event-1', { eventStatus: 'SOLD_OUT' })).rejects.toBeInstanceOf(EventConflictError);
    expect(prismaMocks.update).toHaveBeenCalledWith({
      where: { id: 'event-1', eventStatus: 'AVAILABLE' },
      data: { eventStatus: 'SOLD_OUT' }
    });
  });

  it('allows the next lifecycle state when the stored status still matches', async () => {
    prismaMocks.findUnique.mockResolvedValue(databaseEvent());
    prismaMocks.update.mockResolvedValue(databaseEvent({ eventStatus: 'SOLD_OUT' }));
    await expect(updateEvent('event-1', { eventStatus: 'SOLD_OUT' })).resolves.toMatchObject({
      eventStatus: 'SOLD_OUT'
    });
  });

  it('rejects skipped and backward lifecycle transitions before updating', async () => {
    prismaMocks.findUnique.mockResolvedValue(databaseEvent({ eventStatus: 'ON_GOING' }));
    await expect(updateEvent('event-1', { eventStatus: 'AVAILABLE' })).rejects.toBeInstanceOf(EventConflictError);
    expect(prismaMocks.update).not.toHaveBeenCalled();
  });

  it('checks result protection inside the deletion transaction', async () => {
    prismaMocks.txEventFindUnique.mockResolvedValue({ eventStatus: 'DRAFT', races: [{ _count: { results: 1 } }] });
    prismaMocks.transaction.mockImplementation((operation: (transaction: unknown) => unknown) =>
      operation({
        $queryRaw: prismaMocks.txQueryRaw,
        event: { findUnique: prismaMocks.txEventFindUnique, delete: prismaMocks.txEventDelete },
        race: { deleteMany: prismaMocks.txRaceDeleteMany }
      })
    );
    await expect(deleteEvent('event-1')).resolves.toEqual({ success: false, errorCode: 'ACS07' });
    expect(prismaMocks.txEventDelete).not.toHaveBeenCalled();
    expect(prismaMocks.txQueryRaw.mock.calls.map(([query, id]) => [query.join('?'), id])).toEqual([
      ['SELECT id FROM events WHERE id = ? FOR UPDATE', 'event-1'],
      ['SELECT id FROM races WHERE event_id = ? ORDER BY id FOR UPDATE', 'event-1']
    ]);
    expect(prismaMocks.txQueryRaw.mock.invocationCallOrder[1]).toBeLessThan(
      prismaMocks.txEventFindUnique.mock.invocationCallOrder[0]!
    );
  });
});
