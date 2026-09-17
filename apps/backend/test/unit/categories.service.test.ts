import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  eventFindUnique: vi.fn(),
  ageCount: vi.fn(),
  genderCount: vi.fn(),
  distanceCount: vi.fn(),
  ageFindFirst: vi.fn(),
  ageDelete: vi.fn()
}));

vi.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    event: { findUnique: mocks.eventFindUnique },
    raceCategory: { count: mocks.ageCount, findFirst: mocks.ageFindFirst, delete: mocks.ageDelete },
    raceCategoryGender: { count: mocks.genderCount },
    raceCategoryLength: { count: mocks.distanceCount }
  }
}));

import { categoriesBelongToEvent, deleteAgeCategory } from '../../src/services/categories.service.js';

describe('category scope safeguards', () => {
  beforeEach(() => vi.clearAllMocks());

  it('accepts only global, owning-organization, or event categories for a race', async () => {
    mocks.eventFindUnique.mockResolvedValue({ organizationId: 'org-1' });
    mocks.ageCount.mockResolvedValue(1);
    mocks.genderCount.mockResolvedValue(1);
    mocks.distanceCount.mockResolvedValue(1);

    await expect(
      categoriesBelongToEvent('event-1', { ageId: 'age-1', genderId: 'gender-1', distanceId: 'distance-1' })
    ).resolves.toBe(true);
    expect(mocks.ageCount).toHaveBeenCalledWith({
      where: {
        id: 'age-1',
        OR: [
          { organizationId: null, eventId: null },
          { organizationId: 'org-1', eventId: null },
          { organizationId: null, eventId: 'event-1' }
        ]
      }
    });
  });

  it('rejects deletion when a category is in use', async () => {
    mocks.ageFindFirst.mockResolvedValue({ id: 'age-1', isDefault: false, _count: { races: 2 } });
    await expect(deleteAgeCategory('age-1', { scope: 'EVENT', eventId: 'event-1' })).resolves.toEqual({
      success: false,
      errorCode: 'ACS02'
    });
    expect(mocks.ageDelete).not.toHaveBeenCalled();
  });
});
