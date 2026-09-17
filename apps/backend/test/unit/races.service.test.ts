import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  create: vi.fn(),
  transaction: vi.fn(),
  txFindUnique: vi.fn(),
  txDelete: vi.fn()
}));

vi.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    race: { findMany: mocks.findMany, create: mocks.create },
    $transaction: mocks.transaction
  }
}));

import { createRace, deleteRace, getRacesByEventId } from '../../src/services/races.service.js';

function databaseRace() {
  return {
    id: 'race-1',
    eventId: 'event-1',
    name: null,
    description: null,
    dateTime: new Date('2030-09-21T14:00:00.000Z'),
    raceCategoryAgeId: 'age-1',
    raceCategoryGenderId: 'gender-1',
    raceCategoryDistanceId: 'distance-1',
    isPublicVisible: true,
    createdAt: new Date('2030-01-01T00:00:00.000Z'),
    updatedAt: new Date('2030-01-01T00:00:00.000Z'),
    categoryAge: { name: 'Master 30' },
    categoryGender: { name: 'Women' },
    categoryDistance: { name: '80 km' },
    _count: { results: 4 }
  };
}

describe('race service safeguards', () => {
  beforeEach(() => vi.clearAllMocks());

  it('derives the current name and excludes draft events from public reads', async () => {
    mocks.findMany.mockResolvedValue([databaseRace()]);
    const races = await getRacesByEventId('event-1');
    expect(races[0]).toMatchObject({ name: 'Master 30 - Women - 80 km', resultCount: 4 });
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          eventId: 'event-1',
          isPublicVisible: true,
          event: { isPublicVisible: true, eventStatus: { not: 'DRAFT' } }
        }
      })
    );
  });

  it('lets the database public default apply to newly created races', async () => {
    mocks.create.mockResolvedValue(databaseRace());
    await createRace({
      eventId: 'event-1',
      raceCategoryAgeId: 'age-1',
      raceCategoryGenderId: 'gender-1',
      raceCategoryDistanceId: 'distance-1',
      dateTime: '2030-09-21T14:00:00.000Z'
    });
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.not.objectContaining({ isPublicVisible: expect.anything() }) })
    );
  });

  it('returns the result count from the deletion transaction', async () => {
    mocks.txFindUnique.mockResolvedValue({ id: 'race-1', _count: { results: 7 } });
    mocks.transaction.mockImplementation((operation: (transaction: unknown) => unknown) =>
      operation({ race: { findUnique: mocks.txFindUnique, delete: mocks.txDelete } })
    );
    await expect(deleteRace('race-1')).resolves.toEqual({ success: true, deletedResults: 7 });
    expect(mocks.txDelete).toHaveBeenCalledWith({ where: { id: 'race-1' } });
  });
});
