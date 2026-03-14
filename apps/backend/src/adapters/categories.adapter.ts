import type { RaceCategoryAge, RaceCategoryGender, RaceCategoryDistance } from '@acs/shared';
import type {
  RaceCategory as PrismaRaceCategory,
  RaceCategoryGender as PrismaRaceCategoryGender,
  RaceCategoryLength as PrismaRaceCategoryLength
} from '@prisma/client';

export function adaptAgeCategory(cat: PrismaRaceCategory): RaceCategoryAge {
  return {
    id: cat.id,
    name: cat.name,
    fromAge: cat.fromAge,
    toAge: cat.toAge,
    isGlobal: cat.isGlobal,
    isDefault: cat.isDefault,
    organizationId: cat.organizationId,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString()
  };
}

export function adaptGenderCategory(cat: PrismaRaceCategoryGender): RaceCategoryGender {
  return {
    id: cat.id,
    name: cat.name,
    isGlobal: cat.isGlobal,
    isDefault: cat.isDefault,
    organizationId: cat.organizationId,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString()
  };
}

export function adaptDistanceCategory(cat: PrismaRaceCategoryLength): RaceCategoryDistance {
  return {
    id: cat.id,
    name: cat.name,
    distance: cat.distance,
    isGlobal: cat.isGlobal,
    isDefault: cat.isDefault,
    organizationId: cat.organizationId,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString()
  };
}
