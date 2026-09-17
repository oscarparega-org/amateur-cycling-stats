import type { RaceCategoryAge, RaceCategoryGender, RaceCategoryDistance } from '@acs/shared';
import type {
  RaceCategory as PrismaRaceCategory,
  RaceCategoryGender as PrismaRaceCategoryGender,
  RaceCategoryLength as PrismaRaceCategoryLength
} from '@prisma/client';

function ownership(cat: { organizationId: string | null; eventId: string | null }) {
  if (cat.eventId) return { scope: 'EVENT' as const, organizationId: null, eventId: cat.eventId };
  if (cat.organizationId) {
    return { scope: 'ORGANIZATION' as const, organizationId: cat.organizationId, eventId: null };
  }
  return { scope: 'GLOBAL' as const, organizationId: null, eventId: null };
}

export function adaptAgeCategory(cat: PrismaRaceCategory): RaceCategoryAge {
  return {
    id: cat.id,
    name: cat.name,
    fromAge: cat.fromAge,
    toAge: cat.toAge,
    isDefault: cat.isDefault,
    ...ownership(cat),
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString()
  };
}

export function adaptGenderCategory(cat: PrismaRaceCategoryGender): RaceCategoryGender {
  return {
    id: cat.id,
    name: cat.name,
    isDefault: cat.isDefault,
    ...ownership(cat),
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString()
  };
}

export function adaptDistanceCategory(cat: PrismaRaceCategoryLength): RaceCategoryDistance {
  return {
    id: cat.id,
    name: cat.name,
    distance: cat.distance,
    isDefault: cat.isDefault,
    ...ownership(cat),
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString()
  };
}
